import React from "react";
import { X, RotateCcw, Copy } from "lucide-react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import toast from "react-hot-toast";

interface ReviewPublishStepProps {
  formData: any;
  isLoading: boolean;
  editableJD: string;
  setEditableJD: (value: string) => void;
  aiJdResponse: any;
  setAiJdResponse: React.Dispatch<React.SetStateAction<any>>;
  competencies: string[];
  setCompetencies: React.Dispatch<React.SetStateAction<string[]>>;
  competencyInput: string;
  setCompetencyInput: (value: string) => void;
  booleanSearchTerm: string;
  handleRegenerate: () => void;
}

const ReviewPublishStep: React.FC<ReviewPublishStepProps> = ({
  formData,
  isLoading,
  editableJD,
  setEditableJD,
  aiJdResponse,
  setAiJdResponse,
  competencies,
  setCompetencies,
  competencyInput,
  setCompetencyInput,
  booleanSearchTerm,
  handleRegenerate,
}) => {
  const handleCopy = async () => {
    if (booleanSearchTerm) {
      try {
        await navigator.clipboard.writeText(booleanSearchTerm);
        toast.success("Copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy: ", err);
        toast.error("Failed to copy to clipboard.");
      }
    }
  };

  const addCompetency = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && competencyInput) {
      setCompetencies((prev) => [...prev, competencyInput]);
      setCompetencyInput("");
    }
  };

  const removeCompetency = (index: number) => {
    const newCompetencies = competencies.filter((_, i) => i !== index);
    setCompetencies(newCompetencies);
    setAiJdResponse((prev: any) => ({
      ...prev,
      technical_competencies: newCompetencies,
    }));
  };

  // Gather all selected primary skills
  const allPrimarySkills = [
    ...(formData.aiSelectedSkills || []),
    ...formData.skills,
  ];

  return (
    <div className="space-y-6 mt-6">
      {/* Job Summary Table */}
      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-4">
          Job Summary
        </h3>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="px-5 py-3.5 bg-gray-50 text-sm text-gray-600 font-medium">
              Job Title
            </div>
            <div className="px-5 py-3.5 text-sm text-gray-900 font-medium text-right">
              {formData.title || "—"}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="px-5 py-3.5 bg-gray-50 text-sm text-gray-600 font-medium">
              Company
            </div>
            <div className="px-5 py-3.5 text-sm text-gray-900 font-medium text-right">
              {formData.clientCompany || "—"}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="px-5 py-3.5 bg-gray-50 text-sm text-gray-600 font-medium">
              Point of Contact
            </div>
            <div className="px-5 py-3.5 text-sm text-gray-900 font-medium text-right">
              {formData.pocEmail || "—"}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="px-5 py-3.5 bg-gray-50 text-sm text-gray-600 font-medium">
              Location
            </div>
            <div className="px-5 py-3.5 text-sm text-gray-900 font-medium text-right">
              {formData.location.length > 0
                ? formData.location.join(" · ")
                : "—"}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="px-5 py-3.5 bg-gray-50 text-sm text-gray-600 font-medium">
              Salary Range
            </div>
            <div className="px-5 py-3.5 text-sm text-gray-900 font-medium text-right">
              {formData.confidential
                ? "Confidential"
                : formData.minSalary && formData.maxSalary
                  ? (
                      <div className="flex flex-col items-end">
                        <span>{formData.minSalary} – {formData.maxSalary} {formData.salaryFormat || "INR (LPA)"}</span>
                        {(formData.salaryFormat && formData.salaryFormat !== "INR (₹/year)" && formData.salaryFormat !== "INR (LPA)") ? (() => {
                          const convertToINRPerYear = (val: string, format: string) => {
                            if (!val || isNaN(Number(val))) return "";
                            const num = Number(val);
                            let converted = num;
                            switch (format) {
                              case "INR (₹/month)": converted = num * 12; break;
                              case "USD ($/year)": converted = num * 83; break;
                              case "USD ($/hour)": converted = num * 2080 * 83; break;
                            }
                            return converted;
                          };
                          const minVal = convertToINRPerYear(formData.minSalary, formData.salaryFormat);
                          const maxVal = convertToINRPerYear(formData.maxSalary, formData.salaryFormat);
                          const formatLPA = (val: number) => {
                            if (val >= 100000) return (val / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
                            return val.toString();
                          };
                          return (
                            <span className="text-xs text-gray-500 mt-0.5">
                              Converted: ₹{formatLPA(Number(minVal))} – ₹{formatLPA(Number(maxVal))} per annum
                            </span>
                          );
                        })() : null}
                      </div>
                    )
                  : "—"}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="px-5 py-3.5 bg-gray-50 text-sm text-gray-600 font-medium">
              Experience
            </div>
            <div className="px-5 py-3.5 text-sm text-gray-900 font-medium text-right">
              {formData.minExp && formData.maxExp
                ? `${formData.minExp}–${formData.maxExp} years`
                : "—"}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="px-5 py-3.5 bg-gray-50 text-sm text-gray-600 font-medium">
              Work Approach
            </div>
            <div className="px-5 py-3.5 text-sm text-gray-900 font-medium text-right">
              {formData.workApproach || "—"}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="px-5 py-3.5 bg-gray-50 text-sm text-gray-600 font-medium">
              Openings
            </div>
            <div className="px-5 py-3.5 text-sm text-gray-900 font-medium text-right">
              {formData.openings || "—"}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="px-5 py-3.5 bg-gray-50 text-sm text-gray-600 font-medium">
              Education Level
            </div>
            <div className="px-5 py-3.5 text-sm text-gray-900 font-medium text-right">
              {formData.educationLevel || "—"}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="px-5 py-3.5 bg-gray-50 text-sm text-gray-600 font-medium">
              Specifications
            </div>
            <div className="px-5 py-3.5 text-sm text-gray-900 font-medium text-right">
              {formData.specifications || "—"}
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="px-5 py-3.5 bg-gray-50 text-sm text-gray-600 font-medium">
              Notice Period
            </div>
            <div className="px-5 py-3.5 text-sm text-gray-900 font-medium text-right">
              {formData.noticePeriod || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Skills */}
      {allPrimarySkills.length > 0 && (
        <div className="border border-gray-200 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-blue-600 mb-3">
            Primary Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {allPrimarySkills.map((skill: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Generated Job Description */}
      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-4">
          AI Generated Job Description
        </h3>
        <div className="border border-gray-300 rounded-lg p-4">
          <CKEditor
            editor={ClassicEditor}
            data={editableJD}
            onChange={(event: any, editor: any) => {
              const data = editor.getData();
              setEditableJD(data);
              setAiJdResponse((prev: any) => ({
                ...prev,
                job_description_markdown: data,
              }));
            }}
            config={{
              toolbar: [
                "bold",
                "italic",
                "link",
                "bulletedList",
                "numberedList",
                "undo",
                "redo",
              ],
            }}
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end mt-2">
          <button
            onClick={handleRegenerate}
            className="flex items-center px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm"
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Regenerate
          </button>
        </div>
      </div>

      {/* Key Competencies */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-blue-600 mb-3">
          Key Competencies
        </h4>
        <div className="border border-gray-300 rounded-lg p-4">
          <input
            type="text"
            placeholder="Type competency..."
            value={competencyInput}
            onChange={(e) => setCompetencyInput(e.target.value)}
            onKeyPress={addCompetency}
            className="w-full border-none outline-none text-sm placeholder-gray-400 mb-3"
            disabled={isLoading}
          />
          <div className="flex flex-wrap gap-2">
            {Array.isArray(competencies) &&
              competencies.map((competency, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200 flex items-center"
                >
                  <X
                    className="w-3 h-3 mr-1 cursor-pointer"
                    onClick={() => removeCompetency(index)}
                  />
                  {competency}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPublishStep;
