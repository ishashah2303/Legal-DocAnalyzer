from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
from google import genai
import os
import json
from dotenv import load_dotenv
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