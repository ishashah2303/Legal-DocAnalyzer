from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
import PyPDF2
import io
from google import genai
import os
import json
from dotenv import load_dotenv
import tempfile
from werkzeug.utils import secure_filename
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.pdfgen import canvas
from io import BytesIO
from func import extract_text_from_pdf, get_structured_summary, split_contracts, generate_embeddings, setup_vector_db, setup_rag_system
from func import contract_drafting_pipeline, extract_text_from_pdfs
from func import initialize_system
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime,timedelta
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt, verify_jwt_in_request
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId

# Load environment variables
load_dotenv()
app = Flask(__name__)
CORS(app) 
rag_chain = None
BASE_DIR = 'full_contract_pdf'
  # Directory containing PDF files
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your_secret_key')  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
jwt = JWTManager(app)
# Configure Gemini API
mongo_uri = os.environ.get('MONGO_URI')
client = MongoClient(mongo_uri, server_api=ServerApi('1'))
db = client['document_analyzer']
summaries_collection = db['summaries']
users_collection = db["users"]
blacklist_collection = db["blacklist"]

 # Enable CORS to allow requests from React frontend


# Remove the parse_json function as we'll handle serialization differently

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        # Get user input
        name = request.json.get('name', '')
        email = request.json.get('email', '')
        password = request.json.get('password', '')
        
        # Validate input
        if not name or not email or not password:
            return jsonify({"message": "All fields are required"}), 400
            
        # Check if user already exists
        if users_collection.find_one({"email": email}):
            return jsonify({"message": "User already exists with that email"}), 400
            
        # Create user document
        hashed_password = generate_password_hash(password)
        user_id = users_collection.insert_one({
            "name": name,
            "email": email,
            "password": hashed_password
        }).inserted_id
        
        # Create token
        access_token = create_access_token(identity=str(user_id))
        
        return jsonify({"token": access_token}), 201
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        email = request.json.get('email', '')
        password = request.json.get('password', '')
        
        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400
            
        user = users_collection.find_one({"email": email})
        
        if not user or not check_password_hash(user['password'], password):
            return jsonify({"message": "Invalid credentials"}), 401
            
        # Make sure we're creating a proper JWT token
        access_token = create_access_token(identity=str(user['_id']))

        return jsonify({"token": access_token}), 200
    
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500
    
@app.route('/api/auth/user', methods=['GET'])
def get_user():
    try:
        # Check if Authorization header exists
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"message": "Missing or invalid authorization header"}), 401
        
        # Extract token
        token = auth_header.split(' ')[1]
        
        # Verify token manually if JWT is causing issues
        try:
            # Using Flask-JWT-Extended
            from flask_jwt_extended import decode_token
            decoded = decode_token(token)
            user_id = decoded['sub']  # 'sub' is where Flask-JWT-Extended stores the identity
        except Exception as jwt_error:
            print(f"JWT decode error: {str(jwt_error)}")
            return jsonify({"message": f"Invalid token: {str(jwt_error)}"}), 401
        
        # Find the user in the database
        try:
            user = users_collection.find_one({"_id": ObjectId(user_id)})
        except Exception as db_error:
            print(f"Database error: {str(db_error)}")
            return jsonify({"message": f"Database error: {str(db_error)}"}), 500
        
        if not user:
            return jsonify({"message": "User not found"}), 404
            
        # Create a clean user object
        user_data = {
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "_id": str(user.get("_id"))
        }
        
        # Make sure we're not returning HTML
        response = jsonify({"user": user_data})
        response.headers['Content-Type'] = 'application/json'
        return response, 200
    
    except Exception as e:
        print(f"User fetch error: {str(e)}")
        # Make sure error responses are also JSON
        return jsonify({"message": f"Server error: {str(e)}"}), 500

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        # Get the JWT ID (jti) from the token
        jti = get_jwt().get("jti")
        user_id = get_jwt_identity()
        
        if not jti or not user_id:
            return jsonify({"message": "Invalid token"}), 401
        
        # Add this token to a blacklist collection in MongoDB
        blacklist_collection.insert_one({
            "jti": jti,
            "user_id": user_id,
            "created_at": datetime.utcnow()
        })
        
        return jsonify({"message": "Successfully logged out"}), 200
    
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({"message": f"Logout error: {str(e)}"}), 500
    
@app.route('/api/summarize', methods=['POST'])
def summarize_pdf():
    """API endpoint to extract text from PDF, summarize it with Gemini, and save to MongoDB"""
    
    # Try to get user email if token is provided
    user_email = None
    print(f"Authorization header: {request.headers.get('Authorization')}")
    try:
        # Verify JWT token if it's present in the request
        verify_jwt_in_request(optional=True)
        # If verification succeeds, get the identity (user ID)
        user_id = get_jwt_identity()
        print(f"User ID: {user_id}")
        if user_id:
            # Look up the user's email using their ID
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            print(f"User found: {user}")
            if user and "email" in user:
                user_email = user["email"]
    except Exception as e:
        # If there's an issue with the token, just proceed without a user_email
        print(f"JWT error: {str(e)}")
    print(f"User email: {user_email}")
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.pdf'):
        try:
            # Process the PDF
            pdf_file = io.BytesIO(file.read())
            extracted_text = extract_text_from_pdf(pdf_file)
            
            # Get structured summary from Gemini
            summary_data = get_structured_summary(extracted_text)
            
            # Save to MongoDB - add user_email to the document if available
            document = {
                'filename': file.filename,
                'summary': summary_data,
                'created_at': datetime.now(),
                'status': 'Completed'
            }
            
            # Add user_email only if it's available
            if user_email:
                document['user_email'] = user_email
            
            result = summaries_collection.insert_one(document)
            
            # Add the MongoDB ID to the response
            summary_data['_id'] = str(result.inserted_id)
            
            return jsonify(summary_data)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'File must be a PDF'}), 400    
from bson.objectid import ObjectId

@app.route('/api/document/<document_id>', methods=['GET'])
def get_document(document_id):
    try:
        # Try to get user_id if available
        user_id = None
        try:
            verify_jwt_in_request(optional=True)
            current_user = get_jwt_identity()
            if current_user:
                user_id = current_user
        except Exception:
            pass
        
        # Convert string ID to ObjectId
        doc_id = ObjectId(document_id)
        
        # Create query filter
        query = {"_id": doc_id}
        if user_id:
            # If authenticated, only show if it belongs to this user
            query["user_id"] = user_id
        
        document = summaries_collection.find_one(query)
        
        if document:
            # Convert ObjectId to string for JSON serialization
            document['_id'] = str(document['_id'])
            return jsonify(document)
        else:
            return jsonify({"error": "Document not found or access denied"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/documents', methods=['GET'])
def get_documents():
    try:
        # Try to get user email if available
        user_email = None
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
            if user_id:
                # Look up the user's email
                user = users_collection.find_one({"_id": ObjectId(user_id)})
                if user and "email" in user:
                    user_email = user["email"]
        except Exception:
            pass
        
        # Create a query filter
        query = {}
        if user_email:
            # If authenticated, only show user's documents
            query["user_email"] = user_email
        
        # Retrieve documents based on query filter
        documents = list(summaries_collection.find(
            query, 
            {"_id": 1, "filename": 1, "created_at": 1}
        ))
        
        # Convert ObjectId to string for each document
        for doc in documents:
            doc['_id'] = str(doc['_id'])
            
        return jsonify(documents)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
#-----------------------------------------------------------------------------------------------------------
UPLOAD_FOLDER = 'uploads'


if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/api/download-pdf', methods=['POST'])
def download_pdf():
    try:
        summary_data = request.json
        
        if not summary_data:
            return jsonify({'error': 'No summary data provided'}), 400
        if '_id' in summary_data:
            doc_id = ObjectId(summary_data['_id'])
            document = summaries_collection.find_one({
                "_id": doc_id,
            })
            
            if not document:
                return jsonify({'error': 'Document not found or access denied'}), 403
        # Create a PDF using ReportLab
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
        
        styles = getSampleStyleSheet()
        
        # Create custom styles
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            alignment=1,  # Center
            textColor=colors.Color(0.627, 0.322, 0.176)  # #A0522D
        )
        
        heading_style = ParagraphStyle(
            'Heading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=16,
            textColor=colors.black
        )
        
        subheading_style = ParagraphStyle(
            'Subheading',
            parent=styles['Heading3'],
            fontName='Helvetica-Bold',
            fontSize=14,
            textColor=colors.Color(0.627, 0.322, 0.176)  # #A0522D
        )
        
        normal_style = ParagraphStyle(
            'Normal',
            parent=styles['Normal'],
            fontSize=12,
            textColor=colors.Color(0.2, 0.2, 0.2)  # Dark gray
        )
        
        # Build the PDF content
        elements = []
        
        # Title
        elements.append(Paragraph("Document Summary", title_style))
        elements.append(Spacer(1, 20))
        
        # Executive Summary
        elements.append(Paragraph("Executive Summary", heading_style))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(summary_data.get("executive_summary", ""), normal_style))
        elements.append(Spacer(1, 20))
        
        # Key Clauses
        elements.append(Paragraph("Key Clauses", heading_style))
        elements.append(Spacer(1, 10))
        
        for clause in summary_data.get("key_clauses", []):
            elements.append(Paragraph(clause.get("title", ""), subheading_style))
            
            # Clause text with special formatting
            clause_text = '<i>' + clause.get("text", "") + '</i>'
            elements.append(Paragraph(clause_text, normal_style))
            elements.append(Spacer(1, 10))
            
            # Create a table for explanation and implications
            data = [
                [Paragraph("<b>Explanation:</b>", normal_style), Paragraph("<b>Implications:</b>", normal_style)],
                [Paragraph(clause.get("explanation", ""), normal_style), Paragraph(clause.get("implications", ""), normal_style)]
            ]
            
            table = Table(data, colWidths=[225, 225])
            table.setStyle(TableStyle([
                ('GRID', (0, 0), (-1, -1), 0.5, colors.Color(0.9, 0.9, 0.9)),
                ('BACKGROUND', (0, 0), (1, 0), colors.Color(0.95, 0.95, 0.95))
            ]))
            
            elements.append(table)
            elements.append(Spacer(1, 15))
        
        # Important Terms
        elements.append(Paragraph("Important Terms", heading_style))
        elements.append(Spacer(1, 10))
        
        term_data = []
        term_data.append([Paragraph("<b>Term</b>", normal_style), Paragraph("<b>Definition</b>", normal_style)])
        
        for term in summary_data.get("important_terms", []):
            term_data.append([
                Paragraph(term.get("term", ""), normal_style),
                Paragraph(term.get("definition", ""), normal_style)
            ])
        
        term_table = Table(term_data, colWidths=[100, 350])
        term_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.Color(0.9, 0.9, 0.9)),
            ('BACKGROUND', (0, 0), (1, 0), colors.Color(0.95, 0.95, 0.95))
        ]))
        
        elements.append(term_table)
        elements.append(Spacer(1, 20))
        
        # Actionable Items
        elements.append(Paragraph("Actionable Items", heading_style))
        elements.append(Spacer(1, 10))
        
        for item in summary_data.get("actionable_items", []):
            elements.append(Paragraph("• " + item, normal_style))
            elements.append(Spacer(1, 5))
        
        # Build the PDF
        doc.build(elements)
        
        # Prepare the response
        buffer.seek(0)
        
        return Response(
            buffer,
            mimetype='application/pdf',
            headers={
                'Content-Disposition': 'attachment; filename=document-summary.pdf',
                'Content-Type': 'application/pdf'
            }
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
#--------------------------
from func import get_or_create_conversation
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('message', '')
    session_id = data.get('session_id', 'default')
    
    # Get or create conversation for this session
    conversation = get_or_create_conversation(session_id)
    
    # Get response from the model
    response = conversation.predict(input=user_input)
    
    return jsonify({
        'response': response,
        'session_id': session_id
    })

@app.route('/api/clear-session', methods=['POST'])
def clear_session(sessions):
    data = request.json
    session_id = data.get('session_id', 'default')
    
    if session_id in sessions:
        del sessions[session_id]
        return jsonify({'status': 'success', 'message': f'Session {session_id} cleared'})
    else:
        return jsonify({'status': 'error', 'message': 'Session not found'})

#- ---------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") 
CONTRACT_PDF_DIR="full_contract_pdf"  # Directory containing contract PDF files
EMBEDDINGS_PATH="embeddings.pkl"      # Path to save/load embeddings
FAISS_INDEX_PATH="faiss_index"        # Path to save/load vector database
EMBEDDING_MODEL="all-MiniLM-L6-v2" 
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    system_status = "ready" if rag_chain is not None else "not_initialized"
    return jsonify({
        "status": "online",
        "system": system_status,
        "version": "1.0.0"
    }), 200


@app.route('/api/initialize', methods=['POST'])
def initialize():
    """Initialize or reinitialize the system"""
    global rag_chain, vectorstore
    
    # Check if we should force reinitialization
    force = request.json.get('force', False) if request.is_json else False
    
    if rag_chain is not None and not force:
        return jsonify({
            "status": "success", 
            "message": "System already initialized. Use force=true to reinitialize."
        }), 200
    
    try:
        # Extract text from PDFs
        print("Extracting text from PDFs...")
        contracts = extract_text_from_pdfs(BASE_DIR)
        if not contracts:
            return jsonify({
                "status": "error", 
                "message": "No contracts were extracted. Please check the PDF files and paths."
            }), 500
        
        # Split contracts into chunks
        print("Splitting contracts into chunks...")
        contract_chunks = split_contracts(contracts)
        
        # Generate embeddings
        print("Generating embeddings...")
        embedded_chunks = generate_embeddings(contract_chunks)
        
        # Set up vector database
        print("Setting up vector database...")
        vectorstore = setup_vector_db(embedded_chunks)
        
        # Set up RAG system
        print("Setting up RAG system with Gemini...")
        rag_chain = setup_rag_system(vectorstore, google_api_key=GEMINI_API_KEY)
        
        return jsonify({
            "status": "success",
            "message": "System initialized successfully",
            "contracts_processed": len(contracts),
            "chunks_created": len(contract_chunks)
        }), 200
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error initializing system: {str(e)}"
        }), 500


@app.route('/api/draft', methods=['POST'])
def draft_contract():
    """Create a contract draft based on query"""
    if not request.is_json:
        return jsonify({
            "status": "error",
            "message": "Request must be JSON"
        }), 400
    
    # Check if system is initialized
    if rag_chain is None:
        # Try to initialize
        if not initialize_system():
            return jsonify({
                "status": "error",
                "message": "System not initialized. Please call /api/initialize first."
            }), 503
    
    # Get query from request
    query = request.json.get('query')
    if not query:
        return jsonify({
            "status": "error",
            "message": "No query provided"
        }), 400
    
    # Draft the contract clause
    result = contract_drafting_pipeline(query, rag_chain)
    
    if "error" in result:
        return jsonify(result), 500
    
    return jsonify(result), 200


@app.route('/api/contracts', methods=['GET'])
def list_contracts():
    """List available contract types and counts"""
    try:
        contracts = extract_text_from_pdfs(BASE_DIR)
        contract_types = {}
        
        for contract in contracts:
            contract_type = contract['type']
            if contract_type in contract_types:
                contract_types[contract_type] += 1
            else:
                contract_types[contract_type] = 1
        
        return jsonify({
            "status": "success",
            "total_contracts": len(contracts),
            "contract_types": [
                {"type": k, "count": v} for k, v in contract_types.items()
            ]
        }), 200
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error listing contracts: {str(e)}"
        }), 500
if __name__ == '__main__':
    app.run(debug=True)