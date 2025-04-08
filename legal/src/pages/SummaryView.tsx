import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SummaryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/documents/${id}`);
        setDocument(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load document summary');
        setLoading(false);
        console.error('Error fetching document:', err);
      }
    };

    fetchDocument();
  }, [id]);

  const goBack = () => {
    navigate('/history');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A0522D]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={goBack}
          className="bg-[#A0522D] text-white px-4 py-2 rounded hover:bg-[#8B4513]"
        >
          Back to History
        </button>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded mb-4">
          Document not found
        </div>
        <button 
          onClick={goBack}
          className="bg-[#A0522D] text-white px-4 py-2 rounded hover:bg-[#8B4513]"
        >
          Back to History
        </button>
      </div>
    );
  }

  const summary = document.summary;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#6B3A1E]">{document.filename}</h1>
        <button 
          onClick={goBack}
          className="bg-[#A0522D] text-white px-4 py-2 rounded hover:bg-[#8B4513]"
        >
          Back to History
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Executive Summary</h2>
        <p className="text-gray-700 mb-6">{summary.executive_summary}</p>

        <h2 className="text-xl font-semibold mb-4">Key Clauses</h2>
        <div className="space-y-4 mb-6">
          {summary.key_clauses.map((clause, index) => (
            <div key={index} className="bg-[#F5F0EB] p-4 rounded-lg">
              <h3 className="font-semibold text-[#6B3A1E] mb-2">{clause.title}</h3>
              <p className="text-gray-700 mb-2">{clause.text}</p>
              <div className="text-sm">
                <p className="font-medium text-gray-600 mb-1">Explanation:</p>
                <p className="text-gray-600 mb-2">{clause.explanation}</p>
                <p className="font-medium text-gray-600 mb-1">Implications:</p>
                <p className="text-gray-600">{clause.implications}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-4">Important Terms</h2>
        <div className="bg-[#F5F0EB] p-4 rounded-lg mb-6">
          <ul className="space-y-3">
            {summary.important_terms.map((term, index) => (
              <li key={index} className="border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                <span className="font-medium text-[#6B3A1E]">{term.term}:</span> {term.definition}
              </li>
            ))}
          </ul>
        </div>

        <h2 className="text-xl font-semibold mb-4">Actionable Items</h2>
        <div className="bg-[#F5F0EB] p-4 rounded-lg">
          <ul className="list-disc list-inside space-y-2">
            {summary.actionable_items.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;