import React, { useRef, useCallback } from "react";
import { X } from "lucide-react";

// Predefined skill options per category (matching Figma design)
const DESIGN_SKILLS = ["Figma", "Sketch", "Adobe Xd", "Framer", "Invision"];
const UX_SKILLS = [
  "User Research",
  "Wireframing",
  "Prototyping",
  "Design Systems",
  "Usability Testing",
  "Journey Mapping",
  "Information Architecture",
];
const TECHNICAL_SKILLS = [
  "HTML/CSS",
  "Dev Basics",
  "Auto Layout",
  "Design Tokens",
  "Dev Handoff",
];
const NOTICE_PERIOD_OPTIONS = [
  "Immediate",
  "15 Days",
  "30 Days",
  "60 Days",
  "90 Days",
];
const EDUCATION_LEVEL_OPTIONS = [
  "High School",
  "Diploma",
  "Bachelor's or Master's",
  "Ph.D.",
  "Any",
];
const INDUSTRY_OPTIONS = [
  "B2C Product",
  "Healthcare",
  "Fintech",
  "Gaming",
  "B2B SaaS",
  "Any",
];

interface SkillsRequirementsStepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isLoading: boolean;
  skillInput: string;
  setSkillInput: (value: string) => void;
  skillSuggestions: string[];
  showSkillSuggestions: boolean;
  skillSuggestionsRef: React.RefObject<HTMLDivElement>;
  handleSkillInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSkillSelect: (suggestion: string) => void;
  handleSkillAdd: (e: React.KeyboardEvent) => void;
  removeSkill: (index: number) => void;
  isValidNumberInput: (value: string) => boolean;
}

const ChipSelector: React.FC<{
  options: string[];
  selected: string[];
  onToggle: (skill: string) => void;
}> = ({ options, selected, onToggle }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((option) => {
      const isSelected = selected.includes(option);
      return (
        <button
          key={option}
          type="button"
          onClick={() => onToggle(option)}
          className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
            isSelected
              ? "bg-blue-50 border-blue-500 text-blue-700 font-medium"
              : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
          }`}
        >
          {isSelected && <span className="mr-1.5">✓</span>}
          {option}
        </button>
      );
    })}
  </div>
);

const SkillsRequirementsStep: React.FC<SkillsRequirementsStepProps> = ({
  formData,
  setFormData,
  isLoading,
  skillInput,
  setSkillInput,
  skillSuggestions,
  showSkillSuggestions,
  skillSuggestionsRef,
  handleSkillInputChange,
  handleSkillSelect,
  handleSkillAdd,
  removeSkill,
  isValidNumberInput,
}) => {
  const toggleDesignSkill = useCallback(
    (skill: string) => {
      setFormData((prev: any) => ({
        ...prev,
        primarySkillsDesign: prev.primarySkillsDesign.includes(skill)
          ? prev.primarySkillsDesign.filter((s: string) => s !== skill)
          : [...prev.primarySkillsDesign, skill],
      }));
    },
    [setFormData]
  );

  const toggleUxSkill = useCallback(
    (skill: string) => {
      setFormData((prev: any) => ({
        ...prev,
        primarySkillsUx: prev.primarySkillsUx.includes(skill)
          ? prev.primarySkillsUx.filter((s: string) => s !== skill)
          : [...prev.primarySkillsUx, skill],
      }));
    },
    [setFormData]
  );

  const toggleTechnicalSkill = useCallback(
    (skill: string) => {
      setFormData((prev: any) => ({
        ...prev,
        primarySkillsTechnical: prev.primarySkillsTechnical.includes(skill)
          ? prev.primarySkillsTechnical.filter((s: string) => s !== skill)
          : [...prev.primarySkillsTechnical, skill],
      }));
    },
    [setFormData]
  );

  const toggleIndustry = useCallback(
    (industry: string) => {
      setFormData((prev: any) => ({
        ...prev,
        industryPreferences: prev.industryPreferences.includes(industry)
          ? prev.industryPreferences.filter((s: string) => s !== industry)
          : [...prev.industryPreferences, industry],
      }));
    },
    [setFormData]
  );

  return (
    <div className="space-y-6 mt-6">
      {/* Experience Required + Notice Period */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Required <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Min"
              value={formData.minExp}
              onChange={(e) => {
                if (isValidNumberInput(e.target.value)) {
                  setFormData((prev: any) => ({
                    ...prev,
                    minExp: e.target.value,
                  }));
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <span className="text-gray-400">-</span>
            <input
              type="text"
              placeholder="Max"
              value={formData.maxExp}
              onChange={(e) => {
                if (isValidNumberInput(e.target.value)) {
                  setFormData((prev: any) => ({
                    ...prev,
                    maxExp: e.target.value,
                  }));
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-500">Years</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notice Period <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.noticePeriod}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                noticePeriod: e.target.value,
              }))
            }
            className="w-full px-3 py-2 text-blue-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">Choose field</option>
            {NOTICE_PERIOD_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Education Level + Specifications */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Education Level <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.educationLevel}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                educationLevel: e.target.value,
              }))
            }
            className="w-full px-3 py-2 text-blue-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">Bachelor's or Master's</option>
            {EDUCATION_LEVEL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specifications
          </label>
          <select
            value={formData.specifications}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                specifications: e.target.value,
              }))
            }
            className="w-full px-3 py-2 text-blue-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">Choose field</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Design">Design</option>
            <option value="Business">Business</option>
            <option value="Engineering">Engineering</option>
            <option value="Any">Any</option>
          </select>
        </div>
      </div>

      {/* Primary Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Primary Skills <span className="text-red-500">*</span>
        </label>

        {/* Design */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 mb-2">Design</p>
          <ChipSelector
            options={DESIGN_SKILLS}
            selected={formData.primarySkillsDesign}
            onToggle={toggleDesignSkill}
          />
        </div>

        {/* UX Methods */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 mb-2">UX Methods</p>
          <ChipSelector
            options={UX_SKILLS}
            selected={formData.primarySkillsUx}
            onToggle={toggleUxSkill}
          />
        </div>

        {/* Technical */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 mb-2">Technical</p>
          <ChipSelector
            options={TECHNICAL_SKILLS}
            selected={formData.primarySkillsTechnical}
            onToggle={toggleTechnicalSkill}
          />
        </div>
      </div>

      {/* Custom Skills Input */}
      <div>
        <p className="text-sm text-gray-500 mb-2">
          Or type custom skills below and press Enter
        </p>
        <div className="border border-gray-300 rounded-lg px-4 pt-2 pb-2 relative">
          <input
            type="text"
            placeholder="Type A Skill"
            value={skillInput}
            onChange={handleSkillInputChange}
            onKeyPress={handleSkillAdd}
            className="w-full border-none outline-none text-sm text-blue-600 placeholder-gray-400 mb-3"
            disabled={isLoading}
          />
          {showSkillSuggestions && skillSuggestions.length > 0 && (
            <div
              ref={skillSuggestionsRef}
              className="absolute left-0 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto"
            >
              {skillSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSkillSelect(suggestion)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 cursor-pointer"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {Array.isArray(formData.skills) &&
              formData.skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center"
                >
                  <X
                    className="w-3 h-3 mr-1 cursor-pointer"
                    onClick={() => removeSkill(index)}
                  />
                  {skill}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Must have Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Must have Requirements
        </label>
        <input
          type="text"
          placeholder="E.g: 5+ years in figma, B2b experience... press enter"
          value={formData.mustHaveRequirements}
          onChange={(e) =>
            setFormData((prev: any) => ({
              ...prev,
              mustHaveRequirements: e.target.value,
            }))
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          disabled={isLoading}
        />
      </div>

      {/* Nice to have */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nice to have
        </label>
        <input
          type="text"
          placeholder="E.g: Motion Design, lottie, ios guidelines, seo knowledge.."
          value={formData.niceToHaveRequirements}
          onChange={(e) =>
            setFormData((prev: any) => ({
              ...prev,
              niceToHaveRequirements: e.target.value,
            }))
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          disabled={isLoading}
        />
      </div>

      {/* Industry / Domain Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Industry / Domain Preferences
        </label>
        <ChipSelector
          options={INDUSTRY_OPTIONS}
          selected={formData.industryPreferences}
          onToggle={toggleIndustry}
        />
      </div>
    </div>
  );
};

export default SkillsRequirementsStep;
