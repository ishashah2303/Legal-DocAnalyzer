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
from func import extract_text_from_pdf, get_structured_summary
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
# Load environment variables
load_dotenv()

# Configure Gemini API
mongo_uri = os.environ.get('MONGO_URI')
client = MongoClient(mongo_uri, server_api=ServerApi('1'))
db = client['document_analyzer']
summaries_collection = db['summaries']
app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from React frontend


@app.route('/api/summarize', methods=['POST'])
def summarize_pdf():
    """API endpoint to extract text from PDF, summarize it with Gemini, and save to MongoDB"""
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
            
            # Save to MongoDB
            document = {
                'filename': file.filename,
                'summary': summary_data,
                'created_at': datetime.now(),
                'status': 'Completed'
            }
            
            result = summaries_collection.insert_one(document)
            
            # Add the MongoDB ID to the response
            summary_data['_id'] = str(result.inserted_id)
            
            return jsonify(summary_data)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'File must be a PDF'}), 400
#-----------------------------------------------------------------------------------------------------------
UPLOAD_FOLDER = 'uploads'


if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/api/download-pdf', methods=['POST'])
def download_pdf():
    try:
        # Get summary data from request
        summary_data = request.json
        
        if not summary_data:
            return jsonify({'error': 'No summary data provided'}), 400
        
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
    

if __name__ == '__main__':
    app.run(debug=True)