import React from 'react';

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



export default HomePage;