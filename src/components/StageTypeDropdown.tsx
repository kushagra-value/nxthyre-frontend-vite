// components/StageTypeDropdown.tsx
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const options = [
  { value: 'face-to-face', label: 'Face To Face Interview' },
  { value: 'external', label: 'External Platform Interview' },
  { value: 'virtual', label: 'Virtual Interview' },
  { value: 'background', label: 'Background Verification' },
  { value: 'mock', label: 'Mock Call' },
];

interface StageTypeDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function StageTypeDropdown({ value, onChange }: StageTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || options[0].value);

  const selectedLabel = options.find(o => o.value === selectedValue)?.label || 'Select Stage';

  const handleSelect = (val: string) => {
    setSelectedValue(val);
    onChange?.(val);
    setIsOpen(false);
  };

  return (
    <div className="relative w-[478px] font-['Gellix',_sans-serif]">
      {/* Label */}
      <p className="text-lg font-medium text-[#4B5563] mb-3">
        Stage Type <span className="text-[#0F47F2]">*</span>
      </p>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full h-[50px] px-4 bg-white border-[0.5px] border-[#0F47F2] rounded-xl flex items-center justify-between hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:ring-opacity-30"
      >
        <span className="text-lg font-normal text-[#0F47F2] tracking-tight">
          {selectedLabel}
        </span>

        {/* Custom Blue Arrow (flips on open) */}
        <div className="w-5 h-5 relative">
          
          <svg className='absolute inset-0 transition-transform duration-300' style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}  width="16" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M16 1.01101L14.8752 0L7.9896 6.00817L7.2552 5.36719L7.2592 5.37074L1.1416 0.0326705L0 1.02841C1.6904 2.50405 6.4112 6.62327 7.9896 8C9.1624 6.97745 8.0192 7.97464 16 1.01101Z" fill="#0F47F2"/>
          </svg>

        </div>
      </button>

      {/* Dropdown Menu - Opens Downward */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Options List */}
          <div className="absolute top-full mt-2 w-full bg-white border border-[#E2E2E2] rounded-xl shadow-lg overflow-hidden z-50">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="w-full px-5 py-3 text-left text-lg font-normal text-[#818283] hover:bg-gray-50 transition-colors first:pt-3.5 last:pb-3.5"
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}