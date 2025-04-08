import React, { useState } from 'react';

interface KeyClause {
  title: string;
  text: string;
  explanation: string;
  implications: string;
}

interface ImportantTerm {
  term: string;
  definition: string;
}

export interface SummaryData {
  executive_summary: string;
  key_clauses: KeyClause[];
  important_terms: ImportantTerm[];
  actionable_items: string[];
  error?: string;
  raw_response?: string;
}

interface FileUploadProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ file, onFileChange, onRemoveFile, onSubmit, loading }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-all hover:border-[#A0522D]">
        <input
          type="file"
          accept=".pdf"
          onChange={onFileChange}
          className="hidden"
          id="file-upload"
        />
        {!file ? (
          <div>
            <label htmlFor="file-upload" className="cursor-pointer text-[#A0522D] font-medium hover:text-[#8B4513] block">
            <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-[#F5F0EB]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            Choose a PDF file to analyze
            </label>
            <p className="text-sm text-gray-500 mt-2">or drag and drop it here</p>
          </div>
        ) : (
          <div>
            <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-[#F5F0EB]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            <button 
              type="button" 
              className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium cursor-pointer" 
              onClick={onRemoveFile}
            >
              Remove file
            </button>
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={!file || loading}
        className="w-full bg-[#A0522D] text-white py-3 px-4 rounded-md hover:bg-[#8B4513] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg shadow-md cursor-pointer"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing with Gemini AI...
          </div>
        ) : 'Analyze Document'}
      </button>
    </form>
  );
};

interface DocumentSummaryProps {
  summaryData: SummaryData;
}

const DocumentSummary: React.FC<DocumentSummaryProps> = ({ summaryData }) => {
  const handleDownloadPDF = async () => {
    try {
      // Make API call to backend to generate PDF
      const response = await fetch('http://localhost:5000/api/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(summaryData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      // Get the PDF blob from response
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document-summary.pdf';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8 border border-gray-100">
      <div className="p-8">
        <h2 className="text-3xl font-bold text-[#A0522D] mb-8">Document Summary</h2>
        
        {/* Executive Summary */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Executive Summary
          </h3>
          <div className="bg-[#F5F0EB] p-6 rounded-lg border border-[#E8D8C9]">
            <p className="text-gray-800 whitespace-pre-line leading-relaxed">{summaryData.executive_summary}</p>
          </div>
        </section>
        
        {/* Key Clauses */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Key Clauses
          </h3>
          <div className="space-y-6">
            {summaryData.key_clauses.map((clause, index) => (
              <div key={index} className="bg-[#F5F0EB] p-6 rounded-lg border border-[#E8D8C9]">
                <h4 className="text-lg font-medium text-[#A0522D] mb-3">{clause.title}</h4>
                <p className="italic text-gray-700 border-l-4 border-[#A0522D] pl-4 py-2 mb-4 bg-white rounded-r-lg">
                  {clause.text}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Explanation
                    </h5>
                    <p className="text-gray-700 leading-relaxed">{clause.explanation}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Implications
                    </h5>
                    <p className="text-gray-700 leading-relaxed">{clause.implications}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Important Terms */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Important Terms
          </h3>
          <div className="bg-[#F5F0EB] rounded-lg border border-[#E8D8C9] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E8D8C9]">
                <thead className="bg-[#E8D8C9]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Term</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Definition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D8C9]">
                  {summaryData.important_terms.map((term, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F9F5F2]'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#A0522D]">{term.term}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 leading-relaxed">{term.definition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        
        {/* Actionable Items */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Actionable Items
          </h3>
          <div className="bg-[#F5F0EB] p-6 rounded-lg border border-[#E8D8C9]">
            <ul className="space-y-3">
              {summaryData.actionable_items.map((item, index) => (
                <li key={index} className="text-gray-700 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#A0522D] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
      <div className="bg-[#F5F0EB] px-8 py-4 border-t border-[#E8D8C9] flex justify-between items-center">
        <p className="text-sm text-gray-600">Analyzed with Gemini AI</p>
        <button onClick={handleDownloadPDF} className="bg-white text-[#A0522D] border border-[#A0522D] py-2 px-4 rounded-md hover:bg-[#F9F5F2] transition-colors text-sm font-medium cursor-pointer shadow-md">
          Download as PDF
        </button>
      </div>
    </div>
  );
};

const SummaryPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    if (!file.name.endsWith('.pdf')) {
      setError('Only PDF files are supported');
      return;
    }

    setLoading(true);
    setSummaryData(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/summarize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process PDF');
      }

      const data: SummaryData = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setSummaryData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-[#A0522D] mb-6">Document Analysis</h1>
      <p className="text-gray-700 mb-8">Upload a PDF document to analyze its contents using Gemini AI.</p>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      <FileUpload 
        file={file}
        onFileChange={handleFileChange}
        onRemoveFile={handleRemoveFile}
        onSubmit={handleSubmit}
        loading={loading}
      />
      
      {summaryData && <DocumentSummary summaryData={summaryData} />}
    </div>
  );
};

export default SummaryPage;