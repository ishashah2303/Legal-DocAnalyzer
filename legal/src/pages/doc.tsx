import React, { useState, useEffect } from 'react';

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

export interface SourceDocument {
  contract_type: string;
  contract_id: string;
  file_path: string;
}

export interface DraftData {
  status: string;
  generated_clause: string;
  sources: SourceDocument[];
  query: string;
  error?: string;
}

interface SystemStatus {
  status: string;
  system: string;
  version: string;
}

interface ContractTypesResponse {
  status: string;
  total_contracts: number;
  contract_types: {
    type: string;
    count: number;
  }[];
}

interface TextInputProps {
  text: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClearText: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

// Backend API URL - can be configured via environment variable
const API_URL = 'http://localhost:5000';

const TextInput: React.FC<TextInputProps> = ({ text, onTextChange, onClearText, onSubmit, loading }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="border-2 border-gray-300 rounded-lg p-6 transition-all hover:border-[#A0522D]">
        <div className="mb-4 flex items-center justify-between">
          <label htmlFor="document-text" className="block text-lg font-medium text-gray-700">
            What type of legal document do you need?
          </label>
          {text && (
            <button 
              type="button" 
              className="text-sm text-red-600 hover:text-red-800 font-medium cursor-pointer" 
              onClick={onClearText}
            >
              Clear
            </button>
          )}
        </div>
        <textarea
          id="document-text"
          className="w-full h-64 p-4 border border-gray-300 rounded-md focus:border-[#A0522D] focus:ring focus:ring-[#F5F0EB] focus:ring-opacity-50"
          placeholder="Describe the legal clause you need (e.g., 'Draft a confidentiality clause for a software development agreement' or 'Create a non-compete clause for an employment contract in the healthcare industry')..."
          value={text}
          onChange={onTextChange}
        ></textarea>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {text.length} characters
          </span>
          <div className="text-sm text-gray-500">
            {text.split(/\s+/).filter(Boolean).length} words
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={!text || loading}
        className="w-full bg-[#A0522D] text-white py-3 px-4 rounded-md hover:bg-[#8B4513] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg shadow-md cursor-pointer"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Drafting with Gemini AI...
          </div>
        ) : 'Generate Legal Clause'}
      </button>
    </form>
  );
};

interface DocumentOutputProps {
  draftData: DraftData;
}

const DocumentOutput: React.FC<DocumentOutputProps> = ({ draftData }) => {
  // Note: handleDownloadPDF is commented out since the backend doesn't have this endpoint yet
  // Would need to implement it on the backend side
  const handleDownloadPDF = async () => {
    alert('PDF download feature is not yet implemented on the backend');
    
    /* 
    // Implementation for when backend endpoint is available
    try {
      const response = await fetch(`${API_URL}/api/download-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'legal-clause.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
    */
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8 border border-gray-100">
      <div className="p-8">
        <h2 className="text-3xl font-bold text-[#A0522D] mb-8">Generated Legal Clause</h2>
        
        {/* Query Display */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Your Request
          </h3>
          <div className="bg-[#F5F0EB] p-6 rounded-lg border border-[#E8D8C9]">
            <p className="text-gray-800 leading-relaxed font-medium">{draftData.query}</p>
          </div>
        </section>
        
        {/* Generated Clause */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Draft Clause
          </h3>
          <div className="bg-[#F5F0EB] p-6 rounded-lg border border-[#E8D8C9]">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-gray-800 font-serif leading-relaxed">{draftData.generated_clause}</pre>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => navigator.clipboard.writeText(draftData.generated_clause)}
                className="flex items-center text-[#A0522D] hover:text-[#8B4513] text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy to clipboard
              </button>
            </div>
          </div>
        </section>
        
        {/* Sources Used */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Reference Sources
          </h3>
          <div className="bg-[#F5F0EB] rounded-lg border border-[#E8D8C9] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E8D8C9]">
                <thead className="bg-[#E8D8C9]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Contract Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Contract ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D8C9]">
                  {draftData.sources && draftData.sources.length > 0 ? (
                    draftData.sources.map((source, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F9F5F2]'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#A0522D]">Source {index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{source.contract_type}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{source.contract_id}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-sm text-gray-500 text-center">No source documents available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
      <div className="bg-[#F5F0EB] px-8 py-4 border-t border-[#E8D8C9] flex justify-between items-center">
        <p className="text-sm text-gray-600">Generated with Gemini AI using RAG technology</p>
        <button onClick={handleDownloadPDF} className="bg-white text-[#A0522D] border border-[#A0522D] py-2 px-4 rounded-md hover:bg-[#F9F5F2] transition-colors text-sm font-medium cursor-pointer shadow-md">
          Download as PDF
        </button>
      </div>
    </div>
  );
};

const ContractTypesList: React.FC<{ contractTypes: { type: string; count: number }[] }> = ({ contractTypes }) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Contract Types</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contractTypes.map((contract, index) => (
          <div key={index} className="bg-[#F5F0EB] p-4 rounded-lg border border-[#E8D8C9]">
            <h4 className="font-medium text-[#A0522D]">{contract.type}</h4>
            <p className="text-sm text-gray-600">{contract.count} contracts available</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const SystemStatusBadge: React.FC<{ status: SystemStatus | null }> = ({ status }) => {
  if (!status) return null;
  
  return (
    <div className="mb-6">
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        status.system === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        <span className={`h-2 w-2 rounded-full mr-2 ${
          status.system === 'ready' ? 'bg-green-500' : 'bg-yellow-500'
        }`}></span>
        System {status.system === 'ready' ? 'Ready' : 'Initializing'}
        <span className="ml-2 text-xs text-gray-500">v{status.version}</span>
      </div>
    </div>
  );
};

const DocumentDrafterPage: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(false);
  const [draftData, setDraftData] = useState<DraftData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [contractTypes, setContractTypes] = useState<{ type: string; count: number }[]>([]);

  // Fetch system status on component mount
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`);
        if (response.ok) {
          const data: SystemStatus = await response.json();
          setSystemStatus(data);
          
          // If system is not initialized, fetch available contracts
          if (data.system === 'ready') {
            fetchContractTypes();
          }
        }
      } catch (err) {
        console.error('Error checking system status:', err);
        setError('Could not connect to the server. Please try again later.');
      }
    };
    
    checkSystemStatus();
  }, []);
  
  // Fetch available contract types
  const fetchContractTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/contracts`);
      if (response.ok) {
        const data: ContractTypesResponse = await response.json();
        if (data.status === 'success') {
          setContractTypes(data.contract_types);
        }
      }
    } catch (err) {
      console.error('Error fetching contract types:', err);
    }
  };
  
  // Initialize system if needed
  const initializeSystem = async () => {
    setInitializing(true);
    try {
      const response = await fetch(`${API_URL}/api/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ force: false })
      });
      
      if (response.ok) {
        // Re-check status after initialization
        const statusResponse = await fetch(`${API_URL}/api/health`);
        if (statusResponse.ok) {
          const data: SystemStatus = await statusResponse.json();
          setSystemStatus(data);
          
          // Fetch contract types
          fetchContractTypes();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initialize system');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while initializing');
    } finally {
      setInitializing(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setError(null);
  };

  const handleClearText = () => {
    setText('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      setError('Please enter your document drafting request first');
      return;
    }
    
    // Check if system is ready
    if (systemStatus?.system !== 'ready') {
      setError('System is not ready. Please initialize the system first.');
      return;
    }

    setLoading(true);
    setDraftData(null);
    setError(null);

    try {
      // Call the draft endpoint
      const response = await fetch(`${API_URL}/api/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: text })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process request');
      }

      const data = await response.json();
      if (data.status === 'error') {
        throw new Error(data.error || 'Error generating legal clause');
      }

      setDraftData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-[#A0522D] mb-6">LegalDrafter</h1>
      <p className="text-gray-700 mb-8">Generate legal clauses with AI-powered document drafting</p>
      
      <SystemStatusBadge status={systemStatus} />
      
      {systemStatus?.system !== 'ready' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                System needs to be initialized before use. This may take a few minutes.
              </p>
              <div className="mt-2">
                <button
                  onClick={initializeSystem}
                  disabled={initializing}
                  className="px-2 py-1 rounded text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none"
                >
                  {initializing ? 'Initializing...' : 'Initialize System'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
      
      {contractTypes.length > 0 && <ContractTypesList contractTypes={contractTypes} />}
      
      <TextInput 
        text={text}
        onTextChange={handleTextChange}
        onClearText={handleClearText}
        onSubmit={handleSubmit}
        loading={loading}
      />
      
      {draftData && <DocumentOutput draftData={draftData} />}
    </div>
  );
};

export default DocumentDrafterPage;