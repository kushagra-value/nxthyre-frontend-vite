import React, { useRef } from "react";
import { X, Upload } from "lucide-react";

interface Workspace {
  id: number;
  name: string;
}

interface JobBasicsStepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  workspaces: Workspace[];
  isLoading: boolean;
  file: File | null;
  setFile: (file: File | null) => void;
  locationInput: string[];
  setLocationInput: React.Dispatch<React.SetStateAction<string[]>>;
  locationSuggestions: string[];
  isLoadingLocation: boolean;
  handleLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLocationAdd: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleLocationSelect: (location: string) => void;
  locationInputRef: React.RefObject<HTMLInputElement>;
  isValidTextInput: (value: string) => boolean;
  isValidNumberInput: (value: string) => boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  seniorityOptions: string[];
  departmentOptions: string[];
}

const RadioToggle: React.FC<{
  label: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ label, isSelected, onClick, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center justify-start px-4 py-2 rounded-lg text-md font-[400] transition-all duration-200
      ${
        isSelected
          ? "bg-[#ECF1FF] text-blue-700"
          : "bg-[#F0F0F0] text-gray-700 hover:bg-gray-100"
      }
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    `}
  >
    <div className="flex items-center">
      <div
        className={`
          w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200
          ${
            isSelected
              ? "border-blue-500 bg-white"
              : "border-gray-300 bg-white"
          }
        `}
      >
        {isSelected && (
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        )}
      </div>
      {label}
    </div>
  </button>
);

const JobBasicsStep: React.FC<JobBasicsStepProps> = ({
  formData,
  setFormData,
  workspaces,
  isLoading,
  file,
  setFile,
  locationInput,
  setLocationInput,
  locationSuggestions,
  isLoadingLocation,
  handleLocationChange,
  handleLocationAdd,
  handleLocationSelect,
  locationInputRef,
  isValidTextInput,
  isValidNumberInput,
  handleFileChange,
  handleDrop,
  handleDragOver,
  seniorityOptions,
  departmentOptions,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6 mt-6">
      {/* Client / Company */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client / Company <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.clientCompany}
          onChange={(e) => {
            const selectedName = e.target.value;
            const selectedWorkspace = workspaces.find(w => w.name === selectedName);
            setFormData((prev: any) => ({
              ...prev,
              clientCompany: selectedName,
              workspace: selectedWorkspace ? selectedWorkspace.id.toString() : prev.workspace,
            }));
          }}
          className="w-full px-3 py-2 text-blue-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          <option value="">Select company</option>
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.name}>
              {workspace.name}
            </option>
          ))}
        </select>
      </div>

      {/* Point of Contact */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Point of Contact <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          placeholder="Max@jupiter.com"
          value={formData.pocEmail}
          onChange={(e) => {
            setFormData((prev: any) => ({
              ...prev,
              pocEmail: e.target.value,
            }));
          }}
          className="w-full px-4 py-3 text-blue-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Point of contact from the company side to reach out.
        </p>
      </div>

      {/* Job Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g: Senior Product Designer"
          value={formData.title}
          onChange={(e) => {
            if (isValidTextInput(e.target.value)) {
              setFormData((prev: any) => ({
                ...prev,
                title: e.target.value,
              }));
            }
          }}
          className="w-full text-blue-600 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Be specific — "Senior Product Designer" outperforms "Designer".
        </p>
      </div>

      {/* Seniority and Department */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seniority <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.seniority}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                seniority: e.target.value,
              }))
            }
            className="w-full px-3 py-2 text-blue-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">Select</option>
            {seniorityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.department}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                department: e.target.value,
              }))
            }
            className="w-full px-3 py-2 text-blue-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">Select</option>
            {departmentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Work Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Location <span className="text-red-500">*</span>
        </label>
        <div className="relative border border-gray-300 rounded-lg px-4 pt-3 pb-3 min-h-[42px] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.location.map((loc: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {loc}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev: any) => ({
                      ...prev,
                      location: prev.location.filter(
                        (_: string, i: number) => i !== index
                      ),
                    }));
                  }}
                  className="ml-1.5 text-blue-600 hover:text-blue-800 focus:outline-none"
                  disabled={isLoading}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            ref={locationInputRef}
            placeholder={
              formData.location.length === 0
                ? "E.g: Bangalore"
                : "Add another location..."
            }
            value={locationInput[0] || ""}
            onChange={handleLocationChange}
            onKeyDown={handleLocationAdd}
            className="w-full border-none outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
            disabled={isLoading}
          />
          {locationInput[0]?.length >= 2 &&
            (isLoadingLocation || locationSuggestions.length > 0) && (
              <div className="absolute left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto shadow-xl">
                {isLoadingLocation ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    Loading locations...
                  </div>
                ) : locationSuggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No matching locations
                  </div>
                ) : (
                  locationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 ${
                        formData.location.includes(suggestion)
                          ? "text-gray-400 bg-gray-50 pointer-events-none"
                          : "text-gray-800"
                      }`}
                      onClick={() => {
                        if (!formData.location.includes(suggestion)) {
                          handleLocationSelect(suggestion);
                        }
                      }}
                    >
                      {suggestion}
                      {formData.location.includes(suggestion) && (
                        <span className="ml-2 text-xs text-gray-500">
                          (already added)
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
        </div>
      </div>

      {/* Work Approach */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Work Approach <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <RadioToggle
            label="Onsite"
            isSelected={formData.workApproach === "Onsite"}
            onClick={() =>
              setFormData((prev: any) => ({ ...prev, workApproach: "Onsite" }))
            }
            disabled={isLoading}
          />
          <RadioToggle
            label="Remote"
            isSelected={formData.workApproach === "Remote"}
            onClick={() =>
              setFormData((prev: any) => ({ ...prev, workApproach: "Remote" }))
            }
            disabled={isLoading}
          />
          <RadioToggle
            label="Hybrid"
            isSelected={formData.workApproach === "Hybrid"}
            onClick={() =>
              setFormData((prev: any) => ({ ...prev, workApproach: "Hybrid" }))
            }
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Salary / CTC Range & Number of Openings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Salary / CTC Range{" "}
            {formData.confidential ? "" : <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Min e.g: 20L"
              value={formData.minSalary}
              onChange={(e) => {
                if (isValidNumberInput(e.target.value)) {
                  setFormData((prev: any) => ({
                    ...prev,
                    minSalary: e.target.value,
                  }));
                }
              }}
              className={`flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formData.confidential ? "bg-gray-100 text-gray-400" : ""
              }`}
              disabled={isLoading || formData.confidential}
            />
            <span className="text-gray-400">-</span>
            <input
              type="text"
              placeholder="Max e.g: 30L"
              value={formData.maxSalary}
              onChange={(e) => {
                if (isValidNumberInput(e.target.value)) {
                  setFormData((prev: any) => ({
                    ...prev,
                    maxSalary: e.target.value,
                  }));
                }
              }}
              className={`flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formData.confidential ? "bg-gray-100 text-gray-400" : ""
              }`}
              disabled={isLoading || formData.confidential}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Openings <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g: 2"
            value={formData.openings}
            onChange={(e) => {
              if (isValidNumberInput(e.target.value)) {
                setFormData((prev: any) => ({
                  ...prev,
                  openings: e.target.value,
                }));
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Brief Job Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            Brief Job Summary <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              if (formData.uploadType === "upload") {
                setFormData((prev: any) => ({
                  ...prev,
                  uploadType: "paste",
                  jobDescription: "",
                }));
              } else {
                setFormData((prev: any) => ({
                  ...prev,
                  uploadType: "upload",
                  jobDescription: "",
                }));
                setTimeout(() => fileInputRef.current?.click(), 100);
              }
            }}
            className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
            disabled={isLoading}
          >
            {formData.uploadType === "upload" ? "Paste Text" : "Upload file"}
          </button>
        </div>

        {formData.uploadType === "paste" ? (
          <textarea
            placeholder="Describe the role in 2-3 sentences. This helps AI write a better JD..."
            value={formData.jobDescription}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                jobDescription: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
            disabled={isLoading}
          />
        ) : (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {file
                ? `Selected file: ${file.name}`
                : "Drag and drop your job description file here"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              or click to browse (.txt)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".txt"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </div>
        )}
        
      </div>
    </div>
  );
};

export default JobBasicsStep;
