import React, { useState, useEffect } from "react";
import { X, Mail, Phone, Loader2, AlertCircle } from "lucide-react";
import {
  FormValues,
  isPlaceholderEmail,
  validateForm,
  getCandidateId,
  updateLocalCandidate,
} from "./IcompleteProfileValidation";
import { showToast } from "../../../../utils/toast";
import candidateService from "../../../../services/candidateService";

interface IncompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any; // The full application or candidate object
  onSuccess: (updatedData: any) => void;
}

export default function IncompleteProfileModal({
  isOpen,
  onClose,
  candidate,
  onSuccess,
}: IncompleteProfileModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Extract initial details
  useEffect(() => {
    if (candidate) {
      const c = candidate.candidate || candidate || {};
      const pd = c.premium_data || {};
      setName(c.full_name || "");

      const rawEmail = pd.email || "";
      setEmail(isPlaceholderEmail(rawEmail) ? "" : rawEmail);

      setPhone(pd.phone || "");
    }
  }, [candidate]);

  if (!isOpen || !candidate) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const values: FormValues = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    };

    const validationError = validateForm(values);
    if (validationError) {
      showToast.error(validationError);
      return;
    }

    const candidateId = getCandidateId(candidate);
    const c = candidate.candidate || candidate || {};

    setIsSaving(true);
    const toastId = showToast.loading("Saving contact details...");

    try {
      await candidateService.updateCandidateProfile(candidateId, {
        ...values,
        dob: c.dob || null,
      });

      showToast.success("Contact details updated successfully!");
      onSuccess(updateLocalCandidate(candidate, values));
      onClose();
    } catch (error: any) {
      showToast.error(error.message || "Failed to update contact details");
    } finally {
      setIsSaving(false);
      showToast.dismiss(toastId);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0F47F2] text-white">
          <div className="flex items-center gap-2 text-[#0F47F2]">
            <AlertCircle className="w-5 h-5 text-white" />
            <h3 className="font-semibold text-white">Incomplete Profile</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-400/50 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col p-6 overflow-y-auto">
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            This candidate profile is missing mandatory contact details (<strong>Email</strong> or{" "}
            <strong>Phone number</strong>). Please complete these details to view the profile or move
            the candidate through the hiring pipeline.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/20 focus:border-[#0F47F2] transition-all"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/20 focus:border-[#0F47F2] transition-all"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/20 focus:border-[#0F47F2] transition-all"
                  placeholder="e.g. +91 9876543210"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-auto pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F47F2] text-white hover:bg-[#0F47F2]/90 font-medium text-sm transition-colors shadow-lg shadow-[#0F47F2]/10 disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save & Proceed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}