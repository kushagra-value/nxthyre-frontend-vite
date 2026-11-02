import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

import { toIsoDate } from "../../../../../utils/dateUtils";

export interface ProfileFormData {
  name: string;
  currentDesignation: string;
  currentCompany: string;
  experience: string;
  relevantExperience: string;
  noticePeriod: string;
  noticePeriodStatus: string;
  lastWorkingDays: string;
  lastWorkingDate: string;
  currentCtc: string;
  expectedCtc: string;
  location: string;
  openToRelocate: "Yes" | "No" | "Maybe" | null;
  reasonForChange: string;
}

export interface ProfileTabProps {
  candidate: {
    id?: string;
    name?: string;
    headline?: string;
    currentCtc?: string;
    expectedCtc?: string;
    noticePeriod?: string;
    location?: string;
    experience?: string;
    company?: string;
    [key: string]: any;
  } | null;
  onSaveProfile: (data: ProfileFormData) => Promise<void> | void;
  isSaving?: boolean;
}

export default function ProfileTab({
  candidate,
  onSaveProfile,
  isSaving = false,
}: ProfileTabProps) {
  // Helper to extract initial values from candidate prop
  const getInitialValues = (c: typeof candidate): ProfileFormData => {
    const rawExp = c?.experience != null ? String(c.experience) : "";
    const cleanExp = rawExp
      ? (rawExp.toLowerCase().includes("y") ? rawExp : `${rawExp}Y`).replace(/\s*yrs?/i, "Y").trim()
      : "4Y";

    const rawNP = c?.noticePeriod != null ? String(c.noticePeriod) : "";
    const cleanNP = rawNP
      ? (rawNP.toLowerCase().includes("day") ? rawNP : `${rawNP}days`).replace(/\s+/g, "")
      : "60days";

    return {
      name: String(c?.name || c?.full_name || "Max Verstappen"),
      currentDesignation: String(
        c?.headline || c?.current_designation || c?.designation || "Senior Product Designer"
      ),
      currentCompany: String(
        c?.company ||
          c?.current_company ||
          c?.experience_summary?.title ||
          "Redbull Racing"
      ),
      experience: cleanExp,
      relevantExperience: String(
        c?.relevant_experience || c?.relevantExperience || "3Y 3M"
      ),
      noticePeriod: cleanNP,
      noticePeriodStatus: String(
        c?.notice_status || c?.notice_period_status || c?.noticePeriodStatus || "CS"
      ),
      lastWorkingDays: String(c?.lwd_days || c?.lastWorkingDays || "14days"),
      lastWorkingDate: String(
        toIsoDate(c?.last_working_day || c?.lwd_date || c?.lastWorkingDate) || "2026-10-31"
      ),
      currentCtc:
        c?.currentCtc != null
          ? String(c.currentCtc)
          : c?.current_salary_lpa != null
          ? `${c.current_salary_lpa} LPA`
          : "23 LPA",
      expectedCtc: c?.expectedCtc != null ? String(c.expectedCtc) : "30 LPA",
      location: String(c?.location || "Bangalore"),
      openToRelocate: (c?.open_to_relocate as any) || (c?.openToRelocate as any) || "Yes",
      reasonForChange: String(c?.reason_for_change || c?.reasonForChange || ""),
    };
  };

  const [formData, setFormData] = useState<ProfileFormData>(() =>
    getInitialValues(candidate)
  );
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false);
      }
    };
    if (showStatusDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatusDropdown]);

  // Sync with incoming candidate updates
  useEffect(() => {
    if (candidate) {
      setFormData(getInitialValues(candidate));
    }
  }, [
    candidate?.id,
    candidate?.name,
    candidate?.headline,
    candidate?.company,
    candidate?.currentCtc,
    candidate?.expectedCtc,
    candidate?.noticePeriod,
    candidate?.notice_status,
    candidate?.notice_period_status,
    candidate?.noticePeriodStatus,
    candidate?.last_working_day,
    candidate?.lastWorkingDate,
    candidate?.lastWorkingDays,
    candidate?.lwd_date,
    candidate?.lwd_days,
    candidate?.location,
    candidate?.experience,
    candidate?.relevant_experience,
    candidate?.relevantExperience,
    candidate?.open_to_relocate,
    candidate?.openToRelocate,
    candidate?.reason_for_change,
    candidate?.reasonForChange,
  ]);

  const handleChange = (field: keyof ProfileFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFormData(getInitialValues(candidate));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
  };

  const statusOptions = [
    { value: "CS", label: "CS (Currently Serving)" },
    { value: "NS", label: "NS (Not Serving)" },
  ];

  const currentStatus =
    formData.noticePeriodStatus === "NS" ||
    formData.noticePeriodStatus?.toLowerCase().includes("not")
      ? "NS"
      : "CS";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 w-full max-w-3xl mx-auto pb-10  animate-fadeIn">
      {/* Basic Details Header */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">Basic Details</h2>
        <span className="text-[14px] text-[#000000] font-normal">
          Pre-filled from profile - confirm on call
        </span>
      </div>

      {/* Name */}
      <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2.5 flex items-center justify-between transition-colors shadow-sm">
        <span className="text-sm text-[#374151] select-none">Name</span>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Candidate Name"
          className="text-right text-sm font-medium text-[#374151] outline-none bg-transparent placeholder-slate-400 focus:text-blue-600 flex-1 ml-4"
        />
      </div>

      {/* Current Designation */}
      <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2.5 flex items-center justify-between transition-colors shadow-sm">
        <span className="text-sm  text-[#374151] select-none">Current Designation</span>
        <input
          type="text"
          value={formData.currentDesignation}
          onChange={(e) => handleChange("currentDesignation", e.target.value)}
          placeholder="Designation"
          className="text-right text-sm font-medium text-[#374151] outline-none bg-transparent placeholder-slate-400 focus:text-blue-600 flex-1 ml-4"
        />
      </div>

      {/* Current Company */}
      <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2.5 flex items-center justify-between transition-colors shadow-sm">
        <span className="text-sm  text-[#374151] select-none">Current Company</span>
        <input
          type="text"
          value={formData.currentCompany}
          onChange={(e) => handleChange("currentCompany", e.target.value)}
          placeholder="Company Name"
          className="text-right text-sm font-medium text-[#374151] outline-none bg-transparent placeholder-slate-400 focus:text-blue-600 flex-1 ml-4"
        />
      </div>

      {/* Experience & R- Experience (Two columns) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Experience */}
        <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2.5 flex items-center justify-between transition-colors shadow-sm">
          <span className="text-sm  text-[#374151] select-none">Experience</span>
          <input
            type="text"
            value={formData.experience}
            onChange={(e) => handleChange("experience", e.target.value)}
            placeholder="4Y"
            className="text-right text-sm font-medium text-[#374151] outline-none bg-transparent placeholder-slate-400 focus:text-blue-600 w-24"
          />
        </div>

        {/* R- Experience */}
        <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2.5 flex items-center justify-between transition-colors shadow-sm">
          <span className="text-sm text-[#374151] select-none">R- Experience</span>
          <input
            type="text"
            value={formData.relevantExperience}
            onChange={(e) => handleChange("relevantExperience", e.target.value)}
            placeholder="3Y 3M"
            className="text-right text-sm font-medium text-[#374151] outline-none bg-transparent placeholder-slate-400 focus:text-blue-600 w-24"
          />
        </div>
      </div>

      {/* Notice Period */}
      <div className="flex items-center gap-2.5 w-full">
        {/* Notice Period Card */}
        <div className="flex-1 bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2.5 flex items-center justify-between transition-colors shadow-sm">
          <span className="text-sm text-[#374151] select-none">Notice Period</span>
          <input
            type="text"
            value={formData.noticePeriod}
            onChange={(e) => handleChange("noticePeriod", e.target.value)}
            placeholder="60days"
            className="text-right text-sm font-medium text-[#374151] outline-none bg-transparent placeholder-slate-400 focus:text-blue-600 flex-1 ml-4"
          />
        </div>

        {/* CS / NS Dropdown Box */}
        <div className="relative shrink-0" ref={statusDropdownRef}>
          <button
            type="button"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="h-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2.5 flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer select-none min-w-[70px]"
          >
            <span className="text-sm font-medium text-[#374151]">{currentStatus}</span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform ${
                showStatusDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showStatusDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 animate-fadeIn">
              {statusOptions.map((opt) => {
                const isSelected = currentStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      handleChange("noticePeriodStatus", opt.value);
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                      isSelected
                        ? "text-blue-600 font-semibold bg-blue-50/60"
                        : "text-slate-700"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Last working Day */}
      <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2.5 flex items-center justify-between transition-colors shadow-sm">
        <span className="text-sm text-[#374151] select-none">Last working Day</span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={formData.lastWorkingDays}
            onChange={(e) => handleChange("lastWorkingDays", e.target.value)}
            placeholder="14days"
            className="text-right text-xs font-medium text-[#374151] outline-none bg-transparent placeholder-slate-400 w-20"
          />
          <input
            type="date"
            value={toIsoDate(formData.lastWorkingDate) || ""}
            onChange={(e) => handleChange("lastWorkingDate", e.target.value)}
            className="text-right text-sm font-medium text-[#374151] outline-none bg-transparent placeholder-slate-400 focus:text-blue-600 w-32 cursor-pointer"
          />
        </div>
      </div>

      {/* Current CTC */}
      <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2.5 flex items-center justify-between transition-colors shadow-sm">
        <span className="text-sm  text-[#374151] select-none">Current CTC</span>
        <input
          type="text"
          value={formData.currentCtc}
          onChange={(e) => handleChange("currentCtc", e.target.value)}
          placeholder="23 LPA"
          className="text-right text-sm font-medium text-[#374151] outline-none bg-transparent placeholder-slate-400 focus:text-blue-600 flex-1 ml-4"
        />
      </div>

      {/* Expected CTC */}
      <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2.5 flex items-center justify-between transition-colors shadow-sm">
        <span className="text-sm  text-[#374151] select-none">Expected CTC</span>
        <input
          type="text"
          value={formData.expectedCtc}
          onChange={(e) => handleChange("expectedCtc", e.target.value)}
          placeholder="30 LPA"
          className="text-right text-sm font-medium text-[#374151] outline-none bg-transparent placeholder-slate-400 focus:text-blue-600 flex-1 ml-4"
        />
      </div>

      {/* Location */}
      <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2.5 flex items-center justify-between transition-colors shadow-sm">
        <span className="text-sm text-[#374151] select-none">Location</span>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="Bangalore"
          className="text-right text-sm font-medium text-[#374151] outline-none bg-transparent placeholder-slate-400 focus:text-blue-600 flex-1 ml-4"
        />
      </div>

      {/* Open to relocate? */}
      <div className="flex items-center justify-between py-1.5 px-1">
        <span className="text-sm  text-[#374151] select-none">Open to relocate?</span>
        <div className="flex items-center gap-2.5">
          {(["Yes", "No", "Maybe"] as const).map((option) => {
            const isSelected = formData.openToRelocate === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleChange("openToRelocate", option)}
                className={`min-w-[68px] py-1.5 px-3.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reason for change */}
      <div className="bg-white border border-slate-200 hover:border-slate-300 focus-within:border-blue-500 rounded-xl px-4 py-3 transition-colors shadow-sm">
        <textarea
          rows={2}
          value={formData.reasonForChange}
          onChange={(e) => handleChange("reasonForChange", e.target.value)}
          placeholder="Reason for change"
          className="w-full text-sm text-slate-800 outline-none bg-transparent resize-none placeholder-slate-400"
        />
      </div>

      {/* Action Buttons: Save & Reset Default */}
<div className="flex items-center gap-3 pt-3">
  <button
    type="submit"
    disabled={isSaving}
    className="w-full px-6 py-2.5 bg-[#0F47F2] hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
  >
    {isSaving ? "Saving..." : "Save"}
  </button>
</div>
    </form>
  );
}
