import { useState } from 'react';
import { format } from 'date-fns';
function DocumentDetail({ document }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Parse the document content if needed
  const documentData = typeof document === 'string' 
    ? JSON.parse(document) 
    : document;

  // Access the nested summary properties
  const summary = documentData.summary || {};

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Document Information</h3>
          
          {/* Show Summary Button */}
          <button
            onClick={openModal}
            className="bg-[#A0522D] hover:bg-[#8B4513] text-white font-medium py-2 px-4 rounded-md shadow transition duration-150 ease-in-out flex items-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            Show Summary
          </button>
        </div>
        
        <p className="mt-2"><span className="font-medium">ID:</span> {documentData._id.$oid || documentData._id}</p>
        <p><span className="font-medium">Filename:</span> {documentData.filename}</p>
        <p><span className="font-medium">Created:</span> {formatDate(documentData.created_at)}</p>
        <p><span className="font-medium">Status:</span> <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">{documentData.status}</span></p>
      </div>
      
      {/* {summary.executive_summary && (
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold">Executive Summary</h3>
          <p className="mt-2 text-gray-700">{summary.executive_summary}</p>
        </div>
      )}
      
      {summary.key_clauses && summary.key_clauses.length > 0 && (
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold">Key Clauses</h3>
          <div className="mt-3 space-y-4">
            {summary.key_clauses.map((clause, index) => (
              <div key={index} className="bg-gray-50 rounded p-3">
                <h4 className="font-medium">{clause.title}</h4>
                <p className="mt-1 text-sm text-gray-700">{clause.text}</p>
                {clause.explanation && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-600">Explanation:</p>
                    <p className="text-sm text-gray-700">{clause.explanation}</p>
                  </div>
                )}
                {clause.implications && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-600">Implications:</p>
                    <p className="text-sm text-gray-700">{clause.implications}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {summary.important_terms && summary.important_terms.length > 0 && (
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold">Important Terms</h3>
          <div className="mt-3 space-y-3">
            {summary.important_terms.map((term, index) => (
              <div key={index} className="bg-gray-50 rounded p-3">
                <p className="font-medium">{term.term}</p>
                <p className="text-sm text-gray-700">{term.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {summary.actionable_items && summary.actionable_items.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold">Actionable Items</h3>
          <ul className="mt-3 list-disc list-inside space-y-1 text-gray-700">
            {summary.actionable_items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )} */}

      {/* Modal/Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-[#A0522D] text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Document Summary</h2>
              <button 
                onClick={closeModal}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="overflow-y-auto p-6">
              {/* Executive Summary */}
              <section className="mb-10">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Executive Summary
                </h3>
                <div className="bg-[#F5F0EB] p-6 rounded-lg border border-[#E8D8C9]">
                  <p className="text-gray-800 whitespace-pre-line leading-relaxed">{summary.executive_summary}</p>
                </div>
              </section>
              
              {/* Key Clauses */}
              {summary.key_clauses && summary.key_clauses.length > 0 && (
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Key Clauses
                  </h3>
                  <div className="space-y-6">
                    {summary.key_clauses.map((clause, index) => (
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
              )}
              
              {/* Important Terms */}
              {summary.important_terms && summary.important_terms.length > 0 && (
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
                          {summary.important_terms.map((term, index) => (
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
              )}
              
              {/* Actionable Items */}
              {summary.actionable_items && summary.actionable_items.length > 0 && (
                <section>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#A0522D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Actionable Items
                  </h3>
                  <div className="bg-[#F5F0EB] p-6 rounded-lg border border-[#E8D8C9]">
                    <ul className="space-y-3">
                      {summary.actionable_items.map((item, index) => (
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
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md shadow transition duration-150 ease-in-out"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentDetail;