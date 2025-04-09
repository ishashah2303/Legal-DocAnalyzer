import { useState, useEffect } from 'react';
import DocumentList from './DocumentList';
import DocumentDetail from './DocumentDetail';

function LandingPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/documents');
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setDocuments(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(`Failed to fetch documents: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (id) => {
    try {
      setSelectedDocumentId(id); // Store the selected document ID
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/document/${id}`);
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setSelectedDocument(data);
    } catch (err) {
      console.error("Error fetching document details:", err);
      setError(`Failed to fetch document details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold text-[#6B3A1E] mb-6 w-full">Legal Document Manager</h2>
        <p className="text-gray-700 mb-8">View and analyze your legal documents.</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-[#F5F0EB] px-6 py-3">
                <h3 className="font-medium text-gray-700">Available Documents</h3>
              </div>
              <div className="p-4">
                {loading && !selectedDocument ? (
                  <p className="text-gray-500 text-center py-4">Loading documents...</p>
                ) : (
                  <DocumentList 
                    documents={documents} 
                    onSelectDocument={handleViewDocument}
                    selectedDocumentId={selectedDocumentId} // Pass the selected ID
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-2/3">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-[#F5F0EB] px-6 py-3">
                <h3 className="font-medium text-gray-700">Document Details</h3>
              </div>
              <div className="p-6">
                {loading && selectedDocumentId ? (
                  <p className="text-gray-500 text-center py-4">Loading document details...</p>
                ) : selectedDocument ? (
                  <DocumentDetail document={selectedDocument} />
                ) : (
                  <div className="text-center py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">Select a document to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;