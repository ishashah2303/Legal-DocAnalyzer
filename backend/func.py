from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
from google import genai
import os
import json
from dotenv import load_dotenv
import re
import fitz  # PyMuPDF
import pandas as pd
from tqdm import tqdm
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms import HuggingFaceHub
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from google import genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
import pickle
# Load environment variables
load_dotenv()


# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client=genai.Client(api_key=GEMINI_API_KEY)


def extract_text_from_pdf(pdf_file):
    """Extract text from a PDF file"""
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text

def get_structured_summary(text, max_tokens=1500):
    """Use Gemini to summarize the text and return structured JSON"""
    
    
    # Prompt designed to get structured JSON output
    prompt = f"""Analyze the following document and provide a structured analysis in JSON format.
    
    The JSON response should have the following structure:
    {{
      "executive_summary": "3-5 paragraphs summarizing the document's main purpose and implications",
      "key_clauses": [
        {{
          "title": "Short title for this clause",
          "text": "Direct quote or paraphrase of the clause",
          "explanation": "Plain language explanation of what this means",
          "implications": "Potential impacts, risks, or obligations created"
        }},
        // 4-6 more key clauses
      ],
      "important_terms": [
        {{
          "term": "Term name",
          "definition": "Definition or value"
        }},
        // More important terms
      ],
      "actionable_items": [
        "Action item 1",
        "Action item 2",
        // More action items
      ]
    }}
    
    Ensure your response is properly formatted, valid JSON. Do not include any explanations or text outside the JSON structure.
    
    DOCUMENT TEXT:
    {text}
    """
    
    # Generate response
    response = client.models.generate_content(model = 'gemini-2.0-flash', contents = prompt)
    print(response)
    
    # Extract JSON from response
    try:
        # First attempt to parse as is
        result = json.loads(response.text)
        return result
    except json.JSONDecodeError:
        # If direct parsing fails, try to extract JSON block
        try:
            # Look for content between triple backticks (common for code blocks)
            import re
            json_match = re.search(r'```json\s*(.*?)\s*```', response.text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(1))
                return result
            
            # If no code block markers, try to find JSON structure directly
            json_match = re.search(r'(\{.*\})', response.text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(1))
                return result
        except (json.JSONDecodeError, AttributeError):
            pass
        
        # If all parsing attempts fail, return a structured error
        return {
            "error": "Could not parse JSON from AI response",
            "raw_response": response.text
        }
# ---------------------------------------------------------------
ALLOWED_EXTENSIONS = {'pdf'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

sessions = {}
os.environ["GOOGLE_API_KEY"] = "AIzaSyAi7-EM7_ka_DGcDxw22KsY9xFcf4MIyT4"
def get_or_create_conversation(session_id):
    """Get existing conversation or create a new one for the session"""
    if session_id not in sessions:
        # Initialize the LLM
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.7,
        )
        
        # Create conversation memory
        memory = ConversationBufferMemory(
            memory_key="history",
            return_messages=True
        )
        
        # Initialize the ConversationChain
        conversation = ConversationChain(
            llm=llm,
            memory=memory,
        )
        
        # Set initial system prompt
        system_prompt = (
            "You are a legal assistant specialized in the Indian legal system. "
            "You have comprehensive knowledge of Indian laws, statutes, case laws, and legal procedures. "
            "Provide accurate, reliable, and precise legal information relevant to Indian law and always consider local legal context. "
            "Cite important statutes, cases, or legal principles when appropriate."
        )
        
        # Add the system prompt to the conversation memory as initial context
        conversation.memory.save_context({"input": ""}, {"output": system_prompt})
        
        # Store the conversation
        sessions[session_id] = conversation
    
    return sessions[session_id]


BASE_DIR = os.environ.get("CONTRACT_PDF_DIR", "full_contract_pdf")
EMBEDDINGS_PATH = os.environ.get("EMBEDDINGS_PATH", "embeddings.pkl")
FAISS_INDEX_PATH = os.environ.get("FAISS_INDEX_PATH", "faiss_index")
MODEL_NAME = os.environ.get("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

# Global variable to store our RAG chain once initialized
rag_chain = None
vectorstore = None

def extract_text_from_pdfs(base_dir):
    """
    Traverse the directory and extract text from all PDF files.
    """
    contracts = []
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.lower().endswith('.pdf'):
                pdf_path = os.path.join(root, file)
                try:
                    with fitz.open(pdf_path) as doc:
                        text = ""
                        for page in doc:
                            text += page.get_text()
                    # Clean text
                    text = re.sub(r'\s+', ' ', text).strip()
                    # Metadata
                    contract_id = os.path.splitext(file)[0]
                    contract_type = os.path.basename(root)
                    contracts.append({
                        "id": contract_id,
                        "type": contract_type,
                        "text": text,
                        "metadata": {
                            "source": "Atticus Open Contract Dataset",
                            "contract_type": contract_type,
                            "file_path": pdf_path
                        }
                    })
                except Exception as e:
                    print(f"Error reading {pdf_path}: {e}")
    return contracts


# Step 2: Split contracts into chunks
def split_contracts(contracts, chunk_size=1000, chunk_overlap=200):
    """
    Split contract texts into smaller chunks for embedding.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    contract_chunks = []
    for contract in contracts:
        chunks = text_splitter.split_text(contract['text'])
        for i, chunk in enumerate(chunks):
            contract_chunks.append({
                "id": f"{contract['id']}_chunk_{i}",
                "text": chunk,
                "metadata": {
                    **contract['metadata'],
                    "contract_id": contract['id'],
                    "chunk_id": i
                }
            })
    return contract_chunks


# Step 3: Generate embeddings
def generate_embeddings(chunks, model_name=MODEL_NAME, save_path=EMBEDDINGS_PATH):
    """
    Generate or load embeddings for each text chunk.
    """
    # If file exists, load embeddings from disk
    if os.path.exists(save_path):
        print("Loading existing embeddings from disk...")
        with open(save_path, "rb") as f:
            chunks_with_embeddings = pickle.load(f)
        return chunks_with_embeddings

    # Else generate embeddings
    print("Generating new embeddings...")
    model = SentenceTransformer(model_name)
    texts = [chunk['text'] for chunk in chunks]
    embeddings = model.encode(texts, show_progress_bar=True)

    for i, chunk in enumerate(chunks):
        chunk['embedding'] = embeddings[i]

    # Save to disk
    with open(save_path, "wb") as f:
        pickle.dump(chunks, f)

    return chunks


# Step 4: Set up vector database
def setup_vector_db(chunks, model_name=MODEL_NAME, save_path=FAISS_INDEX_PATH):
    """
    Create or load a FAISS vector database from the chunks.
    """
    embedding_function = HuggingFaceEmbeddings(model_name=model_name)

    # If index already exists, load it
    if os.path.exists(os.path.join(save_path, "index.faiss")) and os.path.exists(os.path.join(save_path, "index.pkl")):
        print("Loading existing FAISS index...")
        vectorstore = FAISS.load_local(save_path, embedding_function, allow_dangerous_deserialization=True)
        return vectorstore

    print("Creating new FAISS index...")
    texts = [chunk['text'] for chunk in chunks]
    metadatas = [chunk['metadata'] for chunk in chunks]

    if not texts:
        raise ValueError("No text data provided for vectorstore creation.")

    # Create a new vector store from the texts and metadata
    vectorstore = FAISS.from_texts(texts, embedding_function, metadatas=metadatas)
    
    # Save the vectorstore for future use
    vectorstore.save_local(save_path)
    
    return vectorstore


# Step 5: Set up RAG system
def setup_rag_system(vectorstore, google_api_key=None):
    if not google_api_key:
        raise ValueError("A Google API key is required to use Gemini models")

    # Initialize Gemini model
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.2,
        top_p=0.95,
        top_k=40,
        max_output_tokens=2048,
        google_api_key=google_api_key
    )

    # Define the prompt template
    system_prompt = (
        "You are a legal document assistant specializing in contract drafting.\n\n"
        "CONTEXT:\n{context}\n\n"
        "TASK:\nUsing the above examples as reference, please help draft a contract clause for the following request:\n"
        "{input}\n\n"
        "The clause should be legally sound, professionally written, and follow standard contract formatting and conventions.\n"
        "Include appropriate section headings and subheadings where needed.\n"
        "Format the text in a way that would be ready to copy directly into a legal document."
        "Do not use markdown formatting in your response. Output should be plain text with standard formatting."
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}")
    ])

    # Create the document chain
    document_chain = create_stuff_documents_chain(llm, prompt)

    # Create the retrieval chain
    retrieval_chain = create_retrieval_chain(vectorstore.as_retriever(search_kwargs={"k": 4}), document_chain)

    return retrieval_chain


# Step 6: Contract drafting pipeline
def contract_drafting_pipeline(query, rag_chain):
    try:
        # Run the query through the RAG chain
        response = rag_chain.invoke({"input": query})

        # Extract the generated text
        generated_clause = response.get("answer", "No result generated")

        # Retrieve source documents
        source_documents = response.get("context", [])

        # Format source information
        sources = []
        for i, doc in enumerate(source_documents):
            source_info = {
                "contract_type": doc.metadata.get("contract_type", "Unknown"),
                "contract_id": doc.metadata.get("contract_id", "Unknown"),
                "file_path": doc.metadata.get("file_path", "Unknown path")
            }
            sources.append(source_info)

        return {
            "status": "success",
            "generated_clause": generated_clause,
            "sources": sources,
            "query": query
        }
    except Exception as e:
        print(f"Error generating contract: {e}")
        return {"status": "error", "error": str(e), "query": query}


# Initialize the system on startup
def initialize_system():
    global rag_chain, vectorstore
    try:
        if not GOOGLE_API_KEY:
            print("WARNING: No Google API key provided. Set the GOOGLE_API_KEY environment variable.")
            return False

        print("Checking if system is already initialized...")
        if rag_chain is None:
            # Check if vectorstore exists
            if os.path.exists(os.path.join(FAISS_INDEX_PATH, "index.faiss")) and os.path.exists(os.path.join(FAISS_INDEX_PATH, "index.pkl")):
                print("Loading existing vector database...")
                embedding_function = HuggingFaceEmbeddings(model_name=MODEL_NAME)
                vectorstore = FAISS.load_local(FAISS_INDEX_PATH, embedding_function, allow_dangerous_deserialization=True)
                rag_chain = setup_rag_system(vectorstore, google_api_key=GOOGLE_API_KEY)
                return True
            else:
                print("No existing vector database found. New initialization required.")
                return False
        return True
    except Exception as e:
        print(f"Error initializing system: {e}")
        return False

