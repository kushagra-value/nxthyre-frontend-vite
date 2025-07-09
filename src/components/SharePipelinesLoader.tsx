import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface SharePipelinesLoaderProps {
  isOpen: boolean;
  onComplete: () => void;
}

const SharePipelinesLoader: React.FC<SharePipelinesLoaderProps> = ({ isOpen, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const loadingSteps = [
    "Pulling up stages of the hiring flow...",
    "Unpacking interview progress...",
    "Loading candidate progression...",
    "Mapping out candidate flow..."
  ];

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(onComplete, 1000);
          return prev;
        }
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [isOpen, onComplete]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-6">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Please wait...</h3>
          
          <div className="space-y-3">
            {loadingSteps.map((step, index) => (
              <div
                key={index}
                className={`text-sm transition-all duration-500 ${
                  index === currentStep
                    ? 'text-blue-600 font-medium'
                    : index < currentStep
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                {index < currentStep && '✓ '}
                {index === currentStep && (
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-2"></span>
                )}
                {step}
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / loadingSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePipelinesLoader;