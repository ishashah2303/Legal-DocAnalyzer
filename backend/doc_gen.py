import os
import re
import fitz  # PyMuPDF
import pandas as pd
from tqdm import tqdm
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from langchain_community.vectorstores import FAISS
#from langchain.embeddings import HuggingFaceEmbeddings
from langchain_community.llms import HuggingFaceHub
#from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings

#from langchain.llms import HuggingFaceHub
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from google import genai
from langchain_google_genai import ChatGoogleGenerativeAI


# Step 1: Extract text from PDFs
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
import pickle


def generate_embeddings(chunks, model_name="all-MiniLM-L6-v2", save_path="embeddings.pkl"):
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
def setup_vector_db(chunks, model_name="all-MiniLM-L6-v2", save_path="faiss_index"):
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

from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

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
            "generated_clause": generated_clause,
            "sources": sources,
            "query": query
        }
    except Exception as e:
        print(f"Error generating contract: {e}")
        return {"error": str(e), "query": query}

# Main execution
if __name__ == "__main__":
    base_dir = "full_contract_pdf"  # Replace with your actual path

    # Provide your Google API key here
    GOOGLE_API_KEY ="AIzaSyAi7-EM7_ka_DGcDxw22KsY9xFcf4MIyT4"
  # Replace with your actual Google API key

    print("Extracting text from PDFs...")
    contracts = extract_text_from_pdfs(base_dir)
    if not contracts:
        print("No contracts were extracted. Please check the PDF files and paths.")
        exit()

    print("Splitting contracts into chunks...")
    contract_chunks = split_contracts(contracts)

    print("Generating embeddings...")
    embedded_chunks = generate_embeddings(contract_chunks)

    print("Setting up vector database...")
    vectorstore = setup_vector_db(embedded_chunks)

    print("Setting up RAG system with Gemini...")
    try:
        rag_chain = setup_rag_system(vectorstore, google_api_key=GOOGLE_API_KEY)
    except ValueError as e:
        print(f"Error: {e}")
        print("Please provide a valid Google API key to use Gemini models.")
        exit()

    # Example query
    query = "Draft a confidentiality clause for a software development agreement"
    print(f"Generating contract clause for: {query}")
    result = contract_drafting_pipeline(query, rag_chain)

    if "error" in result:
        print(f"\nError: {result['error']}")
    else:
        print("\nGenerated Clause:\n")
        print(result["generated_clause"])

        print("\nSources Used:")
        for i, source in enumerate(result["sources"]):
            print(f"Source {i+1}: {source['contract_type']} - {source['contract_id']}")
