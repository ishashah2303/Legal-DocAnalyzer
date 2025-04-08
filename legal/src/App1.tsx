// src/App.tsx
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

type Page = 'home' | 'summarize' | 'history' | 'settings';

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
        className="w-full bg-[#A0522D] text-white py-3 px-4 rounded-md hover:bg-[#8B4513] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg shadow-md"
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
        <button className="bg-white text-[#A0522D] border border-[#A0522D] py-2 px-4 rounded-md hover:bg-[#F9F5F2] transition-colors text-sm font-medium">
          Download as PDF
        </button>
      </div>
    </div>
  );
};

// Landing page hero section
const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-[#F5F0EB] rounded-lg shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-[#A0522D] to-transparent opacity-20"></div>
      <div className="relative z-10 px-8 py-16 sm:px-16 sm:py-24">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#6B3A1E] mb-6">
          Document <span className="text-[#A0522D]">Analyzer</span>
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mb-8 leading-relaxed">
          Unlock the power of Gemini AI to analyze and summarize your complex legal documents, contracts, and agreements in seconds.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="bg-[#A0522D] text-white py-3 px-8 rounded-md hover:bg-[#8B4513] transition-colors font-medium text-lg shadow-md">
            Get Started
          </button>
          <button className="bg-white text-[#A0522D] border border-[#A0522D] py-3 px-8 rounded-md hover:bg-[#F9F5F2] transition-colors font-medium text-lg shadow-sm">
            Learn More
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="#A0522D" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      </div>
    </div>
  );
};

// Features section for landing page
const Features: React.FC = () => {
  const features = [
    {
      title: "Smart Document Analysis",
      description: "Our AI-powered engine extracts key information from complex documents with incredible accuracy.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      title: "Key Clause Identification",
      description: "Automatically highlights important clauses and terms that require your attention.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Actionable Insights",
      description: "Provides clear next steps and actionable items based on document content.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    }
  ];

  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-[#6B3A1E] mb-12 text-center">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-[#F5F0EB] rounded-full w-20 h-20 flex items-center justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-[#A0522D] mb-3">{feature.title}</h3>
            <p className="text-gray-700">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Home page component
const HomePage: React.FC = () => {
  return (
    <div className="space-y-12">
      <Hero />
      <Features />
      
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-[#6B3A1E] mb-6">Recent Updates</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-[#A0522D] pl-4 py-2">
            <h3 className="font-medium text-[#A0522D]">New Gemini AI Integration</h3>
            <p className="text-gray-700 text-sm">Added support for the latest Gemini AI model with improved accuracy.</p>
            <p className="text-gray-500 text-xs mt-1">April 2, 2025</p>
          </div>
          <div className="border-l-4 border-[#A0522D] pl-4 py-2">
            <h3 className="font-medium text-[#A0522D]">Multi-language Support</h3>
            <p className="text-gray-700 text-sm">Now supporting documents in 12 different languages.</p>
            <p className="text-gray-500 text-xs mt-1">March 25, 2025</p>
          </div>
          <div className="border-l-4 border-[#A0522D] pl-4 py-2">
            <h3 className="font-medium text-[#A0522D]">Improved UI</h3>
            <p className="text-gray-700 text-sm">Completely redesigned user interface for better usability.</p>
            <p className="text-gray-500 text-xs mt-1">March 15, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('home');
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

  const menuItems = [
    { id: 'home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'summarize', label: 'Summarize', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'summarize':
        return (
          <>
            <div className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-[#6B3A1E] mb-6">Document Analysis</h2>
              <p className="text-gray-700 mb-6">Upload your PDF document to get an AI-powered summary, key clause analysis, and actionable insights.</p>
              <FileUpload
                file={file}
                onFileChange={handleFileChange}
                onRemoveFile={handleRemoveFile}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {summaryData && <DocumentSummary summaryData={summaryData} />}
          </>
        );
      case 'history':
        return (
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold text-[#6B3A1E] mb-6">Analysis History</h2>
            <p className="text-gray-700 mb-8">View and manage your previously analyzed documents.</p>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-[#F5F0EB] px-6 py-3 flex items-center justify-between">
                <h3 className="font-medium text-gray-700">Recent Documents</h3>
                <div className="flex space-x-2">
                  <button className="text-sm text-[#A0522D] hover:text-[#8B4513]">Filter</button>
                  <button className="text-sm text-[#A0522D] hover:text-[#8B4513]">Sort</button>
                </div>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-900">Service Agreement.pdf</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">April 1, 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-[#A0522D] hover:text-[#8B4513] mr-3">View</button>
                      <button className="text-gray-500 hover:text-gray-700">Delete</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-900">Employment Contract.pdf</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">March 28, 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-[#A0522D] hover:text-[#8B4513] mr-3">View</button>
                      <button className="text-gray-500 hover:text-gray-700">Delete</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-900">NDA Agreement.pdf</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">March 15, 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-[#A0522D] hover:text-[#8B4513] mr-3">View</button>
                      <button className="text-gray-500 hover:text-gray-700">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-500">Showing 3 of 3 documents</div>
                <div className="flex space-x-2">
                  <button className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>Previous</button>
                  <button className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>Next</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-[#6B3A1E] mb-6">Settings</h2>
            <p className="text-gray-700 mb-8">Manage your account settings and preferences.</p>
            
            <div className="space-y-12">
              <section>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Account Information</h3>
                <div className="bg-[#F5F0EB] p-6 rounded-lg border border-[#E8D8C9]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value="user@example.com" 
                        disabled
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subscription</label>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Pro Plan</span>
                        <span className="text-sm text-gray-600">Renews May 1, 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              <section>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Preferences</h3>
                <div className="bg-[#F5F0EB] p-6 rounded-lg border border-[#E8D8C9]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive emails about your document analysis</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A0522D]"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Dark Mode</p>
                        <p className="text-sm text-gray-500">Use dark theme for the interface</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A0522D]"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Auto-save Documents</p>
                        <p className="text-sm text-gray-500">Automatically save analysis results</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A0522D]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </section>
              
              <section>
                <h3 className="text-lg font-medium text-gray-800 mb-4">API Integration</h3>
                <div className="bg-[#F5F0EB] p-6 rounded-lg border border-[#E8D8C9]">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <div className="flex">
                        <input 
                          type="password" 
                          value="••••••••••••••••••••••••" 
                          disabled
                          className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-l-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
                        />
                        <button className="px-4 py-2 bg-[#A0522D] text-white rounded-r-md hover:bg-[#8B4513]">
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Use this key to access our API programmatically</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                      <input 
                        type="text" 
                        placeholder="https://your-app.com/webhook" 
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
                      />
                      <p className="text-xs text-gray-500 mt-1">Receive notifications when document analysis is complete</p>
                    </div>
                  </div>
                </div>
              </section>
              
              <div className="flex justify-end space-x-4">
                <button className="bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300 transition-colors font-medium">
                  Cancel
                </button>
                <button className="bg-[#A0522D] text-white py-2 px-6 rounded-md hover:bg-[#8B4513] transition-colors font-medium">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#A0522D] text-white min-h-screen fixed left-0 top-0 z-10 shadow-lg">
          <div className="p-6 border-b border-[#8B4513]">
            <div className="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-2xl font-bold">DocAnalyzer</h2>
            </div>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActivePage(item.id as Page)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-md transition-colors ${
                      activePage === item.id
                        ? 'bg-white text-[#A0522D] font-medium'
                        : 'text-white hover:bg-[#8B4513]'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#8B4513]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#A0522D] font-bold">
                U
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">User Name</p>
                <p className="text-xs opacity-75">Pro Account</p>
              </div>
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-10">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;