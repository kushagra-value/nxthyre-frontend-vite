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
        Stage Type <span className="text-red-500">*</span>
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
          <div
            className="absolute inset-0 bg-[#0F47F2] transition-transform duration-300"
            style={{
              clipPath: 'polygon(20% 30%, 50% 70%, 80% 30%)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
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