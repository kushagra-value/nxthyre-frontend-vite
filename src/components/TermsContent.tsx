// src/components/TermsContent.jsx
import React, { useState, useEffect } from 'react';

const dummyContent = Array.from({ length: 50 }, (_, i) => `Dummy paragraph ${i + 1}: This is some placeholder text for the terms and conditions. Read all the document carefully.`).join('\n\n');

const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
  </div>
);

const TermsContent = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6 overflow-y-auto h-full text-sm text-gray-700 space-y-4">
      <pre className="whitespace-pre-wrap">{dummyContent}</pre>
    </div>
  );
};

export default TermsContent;