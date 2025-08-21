import React, { useState } from 'react';

const JobApplicationForm = () => {
  const [formData, setFormData] = useState({
    name: 'Zentisu Agatsuma',
    title: 'Demon Slayer',
    mailId: 'Demon Slayer',
    contactNumber: 'Demon Slayer',
    currentCTA: '',
    expectedCTA: '',
    noticePeriod: ''
  });

  const handleInputChange = (field:any, value:any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with background shapes and image */}
      <div className="relative bg-white overflow-hidden">

        {/* Header content */}
        <div className="relative z-10 grid grid-cols-12 gap-6 px-6 py-8">
          {/* Left side - Job details */}
          <div className="col-span-7">
            {/* Logo */}
            <div className="mb-8">
              <span className="text-2xl font-bold">
                <span className="text-blue-600">Nxt</span>
                <span className="text-black">Hyre</span>
              </span>
            </div>

            {/* Job posting header */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">We are looking for</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Digital Marketer Manager</h1>
              
              {/* Job meta info */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                  <span>Bangalore</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                  <span>1-4 years</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                  <span>Full Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                  <span>₹ 5 LPA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Profile image */}
          <div className="col-span-5 flex justify-end">
            <img 
              src="/assets/jobApplicationFormHeaderImage.png"
              alt="Professional woman smiling"
              className="w-96 h-64 object-cover rounded-lg relative z-20"
            />
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-12 gap-8 px-6 py-8">
        {/* Left column - Job details */}
        <div className="col-span-7 space-y-8">
          {/* Job Info */}
          <div className="bg-white rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <p className="text-gray-600">Job Title:</p>
                <p className="font-medium">Digital Marketing Manager</p>
              </div>
              <div>
                <p className="text-gray-600">Location:</p>
                <p className="font-medium">Bangalore</p>
              </div>
              <div>
                <p className="text-gray-600">Type:</p>
                <p className="font-medium">Full-time</p>
              </div>
              <div>
                <p className="text-gray-600">Experience:</p>
                <p className="font-medium">5+ years</p>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Google Ads', 'LinkedIn Ads', 'Digital Marketing', 'AI Analytics', 'SEO/SEM', 'Social Media Marketing', 'Data Visualization',
                  'Performance Marketing', 'Marketing Automation', 'Google Analytics', 'Content Strategy'
                ].map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Key competencies */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Key competencies</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Strategic Planning', 'Analytics Thinking', 'Digital Marketing', 'Adaptability', 'AI Tool Integration', 'Communication',
                  'ROI Advocacy', 'Customer-Centric Focus'
                ].map((competency) => (
                  <span key={competency} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {competency}
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="font-semibold mb-3">Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>5+ years of experience in digital marketing for consumer-facing digital products, preferably at scale.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Expert proficiency in tools like Google Analytics, HubSpot, SEMrush, AI platforms (e.g., Google Cloud AI, IBM Watson), and other industry-standard marketing software.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Strong portfolio showcasing end-to-end campaigns, performance metrics, AI-driven insights, and branding alignment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Exceptional marketing skills with deep understanding of SEO/SEM, content creation, A/B testing, and data visualization.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Strong grasp of AI analytics, personalization techniques, and marketing automation in a fast-paced, iterative environment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Experience leading marketing projects independently while collaborating across cross-functional teams. Excellent presentation, storytelling, and communication skills with a track record of advocating for marketing ROI.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Bachelor's or Master's degree in Marketing, Business, Data Science, or related field is preferred.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Experience in e-commerce or high-frequency transactional platforms.</span>
                </li>
              </ul>
            </div>

            <button className="mt-6 text-blue-600 text-sm font-medium">
              See More Jobs
            </button>
          </div>
        </div>

        {/* Right column - Application form */}
        <div className="col-span-5">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Fill Your Details</h2>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Mail Id */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mail Id</label>
                <input
                  type="email"
                  value={formData.mailId}
                  onChange={(e) => handleInputChange('mailId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Current CTA and Expected CTA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current CTA</label>
                  <input
                    type="text"
                    value={formData.currentCTA}
                    onChange={(e) => handleInputChange('currentCTA', e.target.value)}
                    placeholder="₹5 LPA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected CTA</label>
                  <input
                    type="text"
                    value={formData.expectedCTA}
                    onChange={(e) => handleInputChange('expectedCTA', e.target.value)}
                    placeholder="₹8 LPA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500"
                  />
                </div>
              </div>

              {/* Notice Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period</label>
                <input
                  type="text"
                  value={formData.noticePeriod}
                  onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                  placeholder="2 Days"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500"
                />
              </div>

              {/* Upload Resume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Resume (PDF)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded mb-2 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">Drag and drop your job description file here</p>
                    <p className="text-xs text-gray-400 mt-1">or add via browse</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium mt-6">
                Submit Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationForm;