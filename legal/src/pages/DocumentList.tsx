import { format } from 'date-fns';
import React from 'react';

interface Document {
  _id: string;
  filename: string;
  created_at: string;
}

interface DocumentListProps {
  documents: Document[];
  onSelectDocument: (id: string) => void;
  selectedDocumentId?: string; // Add this prop to track which document is selected
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  onSelectDocument, 
  selectedDocumentId 
}) => {
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {documents.length === 0 ? (
        <p className="text-gray-500">No documents found</p>
      ) : (
        documents.map((doc) => {
          // Check if this document is the selected one
          const isSelected = selectedDocumentId === doc._id;
          
          return (
            <div 
              key={doc._id} 
              className={`py-3 cursor-pointer transition-colors ${
                isSelected 
                  ? 'bg-[#F5F0EB] border-l-4 border-[#A0522D] pl-2' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectDocument(doc._id)}
            >
              <h3 
                className={`font-medium truncate ${isSelected ? 'text-[#A0522D]' : 'text-gray-900'}`} 
                title={doc.filename}
              >
                {doc.filename}
              </h3>
              <p className="text-sm text-gray-500">
                Created: {formatDate(doc.created_at)}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default DocumentList;