import json
import io
from flask import Flask, request, jsonify
from utils import extract_text_from_pdf, get_structured_summary

def register_routes(app):
    @app.route('/api/summarize', methods=['POST'])
    def summarize_pdf():
        """API endpoint to extract text from PDF and summarize it with Gemini"""
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
                
                return jsonify(summary_data)
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        else:
            return jsonify({'error': 'File must be a PDF'}), 400
