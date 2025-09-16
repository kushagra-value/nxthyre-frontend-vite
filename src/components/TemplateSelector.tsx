import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Bold,
  Italic,
  Link,
  List,
  MoreHorizontal,
  ArrowLeft,
  Check,
  Mail,
  MessageSquare,
  Phone,
  Settings,
  Send,
  X,
  User,
  Share2,
  Copy,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { showToast } from "../utils/toast";
import {
  CandidateListItem,
  CandidateDetailData,
  Template,
  candidateService,
} from "../services/candidateService";
import  {CKEditor}  from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import {has} from "lodash";
interface TemplateSelectorProps {
  candidate: CandidateListItem;
  onBack: () => void;
  updateCandidateEmail: (
    candidateId: string,
    candidate_email: string,
    candidate_phone: string
  ) => void;
  jobId: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  candidate,
  onBack,
  updateCandidateEmail,
  jobId,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templateName, setTemplateName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isBodyExpanded, setIsBodyExpanded] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showTestEmail, setShowTestEmail] = useState(false);
  const [showAdvanceOptions, setShowAdvanceOptions] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testNumber, setTestNumber] = useState("");
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false);
  const [sendViaPhone, setSendViaPhone] = useState(false);
  const [sendTestViaEmail, setSendTestViaEmail] = useState(true);
  const [sendTestViaWhatsApp, setSendTestViaWhatsApp] = useState(false);
  const [sendTestViaPhone, setSendTestViaPhone] = useState(false);
  const [followUpTemplates, setFollowUpTemplates] = useState<
    {
      send_after_hours: number;
      followup_mode: "EMAIL" | "WHATSAPP" | "CALL";
      followup_body: string;
      order_no: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Optional: Agar subject mein HTML nahi chahiye, toh strip karne ka function
  const stripHtml = (htmlString: any) => {
    const div = document.createElement("div");
    div.innerHTML = htmlString;
    return div.textContent || div.innerText || "";
  };

  const [isFollowUpsExpanded, setIsFollowUpsExpanded] = useState(false);

  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);

  const [newFollowUp, setNewFollowUp] = useState<{
    send_after_hours: number;
    followup_mode: "EMAIL" | "WHATSAPP" | "CALL";
    followup_body: string;
  }>({
    send_after_hours: 24,
    followup_mode: "EMAIL",
    followup_body: `Hi ${candidate.full_name}, Type your message ...`,
  });

  const [isEditingFollowUp, setIsEditingFollowUp] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const data = await candidateService.getTemplates();
        setTemplates(data);
      } catch (error) {
        showToast.error("Failed to fetch templates");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    console.log("Selected template ID:", templateId);
    if (templateId === "create-new") {
      setShowCreateTemplate(true);
      setSelectedTemplate("");
      setTemplateName("");
      setSubject("");
      setBody("");
      setSendViaEmail(true);
      setSendViaWhatsApp(false);
      setSendViaPhone(false);
      setFollowUpTemplates([]);
      return;
    }
    const template = templates.find((t) => t.id === Number(templateId));
    if (template) {
      setSelectedTemplate(templateId);
      setTemplateName(template.name);
      setSubject(template.initial_subject);
      setBody(
        template.initial_body.replace("[candidateName]", candidate.full_name)
      );
      setSendViaEmail(template.can_be_sent_via_email);
      setSendViaWhatsApp(template.can_be_sent_via_whatsapp);
      setSendViaPhone(template.can_be_sent_via_call);
      setFollowUpTemplates(
        template.follow_up_steps.map((step) => ({
          send_after_hours: Number(step.send_after_hours),
          followup_mode: step.mode as "EMAIL" | "WHATSAPP" | "CALL",
          followup_body: step.body,
          order_no: step.order,
        }))
      );
    } else {
      console.log("Template not found for ID:", templateId);
    }
  };

  const handleSendTestEmail = async () => {
  if (!testEmail) {
    showToast.error("Please enter a test email address");
    return;
  }
  if (!testNumber) {
    showToast.error("Please enter a test phone number");
    return;
  }
  if (!jobId || !candidate.id) {
    showToast.error("Job ID and Candidate ID are required");
    return;
  }
  setLoading(true);
  try {
    const response = await candidateService.sendTestEmail({
      job_id: jobId,
      candidate_id: candidate.id,
      email: testEmail,
      phone: testNumber,
      subject: subject || "Test Invitation: Software Engineer Role",
      message_body: body || "Hello, this is a test from Acme Corp regarding the Software Engineer position.",
      send_via_email: sendTestViaEmail,
      send_via_phone: sendTestViaPhone,
      send_via_whatsapp: sendTestViaWhatsApp,
    });
    showToast.success(response.success);
    if (response.results.email) showToast.success(response.results.email);
    if (response.results.whatsapp) showToast.success(response.results.whatsapp);
    if (response.results.call) showToast.success(response.results.call);
    setShowTestEmail(false);
  } catch (error) {
    showToast.error("Failed to send test email");
  } finally {
    setLoading(false);
  }
};

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      showToast.error("Please enter a template name");
      return;
    }
    if (!sendViaEmail && !sendViaWhatsApp && !sendViaPhone) {
      showToast.error("Please select at least one channel");
      return;
    }
    setLoading(true);
    try {
      const newTemplate: Template = {
        id: selectedTemplate ? Number(selectedTemplate) : 0,
        name: templateName,
        initial_subject: subject,
        initial_body: body,
        can_be_sent_via_email: sendViaEmail,
        can_be_sent_via_whatsapp: sendViaWhatsApp,
        can_be_sent_via_call: sendViaPhone,
        follow_up_steps: followUpTemplates.map((step, index) => ({
          id: step.order_no + 1, // Adjust ID logic as per your API
          send_after_hours: step.send_after_hours,
          mode: step.followup_mode,
          subject: "", // Add subject if required by API
          body: step.followup_body,
          order: index,
        })),
      };
      const savedTemplate = await candidateService.saveTemplate(newTemplate);
      setTemplates([
        ...templates.filter((t) => t.id !== savedTemplate.id),
        savedTemplate,
      ]);
      setShowCreateTemplate(false);
      showToast.success("Template saved successfully!");
    } catch (error) {
      showToast.error("Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    console.log("Job ID:", jobId);
    console.log("Candidate ID:", candidate.id);
    if (!jobId || !candidate.id) {
      showToast.error("Job ID and Candidate ID are required");
      return;
    }
    if (!selectedTemplate && !body) {
      showToast.error("Please select a template or enter email content");
      return;
    }
    setLoading(true);
    try {
      const response = await candidateService.sendInvite({
        job_id: jobId,
        candidate_id: candidate.id,
        template_id: selectedTemplate || undefined,
        send_via_email: sendViaEmail,

        send_via_phone: sendViaPhone,
        send_via_whatsapp: sendViaWhatsApp,
        subject,
        message_body: body,

        followups: followUpTemplates,
      });
      showToast.success(
        `Invite sent successfully! Invite ID: ${response.invite_id}. Follow-ups scheduled.`
      );
      updateCandidateEmail(
        candidate.id,
        response.candidate_email,
        response.candidate_phone
      );
      if (selectedTemplate) {
        const updatedTemplate: Template = {
          id: Number(selectedTemplate),
          name: templateName,
          initial_subject: subject,
          initial_body: body,
          can_be_sent_via_email: sendViaEmail,
          can_be_sent_via_whatsapp: sendViaWhatsApp,
          can_be_sent_via_call: sendViaPhone,
          follow_up_steps: followUpTemplates.map((step, index) => ({
            id: step.order_no + 1,
            send_after_hours: step.send_after_hours,
            mode: step.followup_mode,
            subject: "", // Add subject if required
            body: step.followup_body,
            order: index,
          })),
        };
        await candidateService.saveTemplate(updatedTemplate);
      }
    } catch (error) {
      showToast.error("Failed to send invite");
    } finally {
      setLoading(false);
      onBack();
    }
  };

  // Add this state variable near the top with other state declarations
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    index: number | null;
  }>({
    isOpen: false,
    index: null,
  });

  const removeFollowUp = (index: number) => {
    setFollowUpTemplates(followUpTemplates.filter((_, i) => i !== index));
    setDeleteConfirmation({ isOpen: false, index: null });
  };

  // Add this function to handle opening the confirmation modal:
  const openDeleteConfirmation = (index: number) => {
    setDeleteConfirmation({ isOpen: true, index });
  };

  const editFollowUp = (index: number) => {
    const followUpToEdit = followUpTemplates[index];
    setNewFollowUp({
      send_after_hours: followUpToEdit.send_after_hours,
      followup_mode: followUpToEdit.followup_mode,
      followup_body: followUpToEdit.followup_body,
    });
    setEditingIndex(index);
    setIsEditingFollowUp(true);
  };

  const [detailedCandidate, setDetailedCandidate] =
    useState<CandidateDetailData | null>(null);

  useEffect(() => {
    if (candidate?.id) {
      const fetchCandidateDetails = async () => {
        setLoading(true);
        try {
          const data = await candidateService.getCandidateDetails(candidate.id);
          setDetailedCandidate({
            ...data,
            candidate: {
              ...data.candidate,
            },
          });
        } catch (error) {
          console.error("Error fetching candidate details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCandidateDetails();
    }
  }, [candidate?.id]);

  const handleShareProfile = () => {
    if (detailedCandidate && detailedCandidate.candidate) {
      window.open(
        `/candidate-profiles/${detailedCandidate.candidate.id}`,
        "_blank"
      );
    }
  };

  const getAvatarColor = (name: string) => {
    return "bg-blue-500";
  };

  const handleCopy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast.success("Copied to clipboard!");
      })
      .catch(() => {
        showToast.error("Failed to copy");
      });
  };

  const handleWhatsApp = (phone: string) => {
    const formattedPhone = phone.replace(/[^0-9+]/g, "");
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
  };

  const random70to99 = () => Math.floor(Math.random() * 30 + 70);

  const hasEmail = candidate.premium_data_availability.email;
  const hasPhone = candidate.premium_data_availability.phone_number;
  const displayEmail =
    detailedCandidate?.candidate?.premium_data_unlocked &&
    detailedCandidate?.candidate?.premium_data_availability?.email &&
    detailedCandidate?.candidate?.premium_data?.email
      ? detailedCandidate.candidate.premium_data.email
      : `${(detailedCandidate?.candidate?.full_name || "")
          .slice(0, 3)
          .toLowerCase()}***********@gmail.com`;

  // Updated display logic for phone
  const displayPhone =
    detailedCandidate?.candidate?.premium_data_unlocked &&
    detailedCandidate?.candidate?.premium_data_availability?.phone_number &&
    detailedCandidate?.candidate?.premium_data?.phone
      ? detailedCandidate.candidate.premium_data.phone
      : `95********89`;

  return (
    <>
      <div className="bg-white rounded-xl px-10 py-8 space-y-4 h-fit">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="pr-2 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-7 h-7 text-gray-700" />
            </button>
            <h2 className="text-lg font-semibold text-gray-700">Send Invite</h2>
          </div>
        </div>

        <div className="flex space-x-3 items-center mt-1">
          <div
            className={`w-12 h-12 ${getAvatarColor(
              detailedCandidate?.candidate?.full_name || ""
            )} rounded-full flex items-center justify-center text-white`}
          >
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base lg:text-[16px] font-bold text-gray-600">
              {detailedCandidate?.candidate?.full_name}
            </h2>
            <div className="flex">
              <p className="text-sm text-gray-500 max-w-[32ch] truncate">
                {detailedCandidate?.candidate?.headline}
              </p>
            </div>
            <div className="flex">
              <p className="text-sm text-gray-400">
                {detailedCandidate?.candidate?.location}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400 absolute right-6 top-4">
            <button
              onClick={handleShareProfile}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border-t border-gray-300 border-b p-3 space-y-2">
          <div className="flex justify-between items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 flex justify-center items-center bg-gray-200 rounded-full">
                <Mail className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-sm text-gray-400">{displayEmail}</span>
            </div>
            <button
              className={`flex space-x-2 ml-auto p-1 ${
                hasEmail
                  ? "text-gray-400 hover:text-gray-600"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              onClick={() => hasEmail && handleCopy(displayEmail)}
              disabled={!hasEmail}
            >
              <div className="w-7 h-7 flex justify-center items-center bg-gray-200 rounded-full">
                <Copy className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          </div>
          <div className="flex justify-between items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 flex justify-center items-center bg-gray-200 rounded-full">
                <Phone className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-sm text-gray-400">{displayPhone}</span>
            </div>
            <div>
              <button
                className={`p-1 ${
                  hasPhone
                    ? "text-gray-400 hover:text-gray-600"
                    : "text-gray-300 cursor-not-allowed"
                }`}
                onClick={() => hasPhone && handleWhatsApp(displayPhone)}
                disabled={!hasPhone}
              >
                <div className="w-7 h-7 flex justify-center items-center bg-gray-200 rounded-full">
                  <FontAwesomeIcon icon={faWhatsapp} />
                </div>
              </button>
              <button
                className={`p-1 ${
                  hasPhone
                    ? "text-gray-400 hover:text-gray-600"
                    : "text-gray-300 cursor-not-allowed"
                }`}
                onClick={() => hasPhone && handleCopy(displayPhone)}
                disabled={!hasPhone}
              >
                <div className="w-7 h-7 flex justify-center items-center bg-gray-200 rounded-full">
                  <Copy className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Select Template
          </label>
          <div className="relative">
            <select
              key={selectedTemplate}
              value={selectedTemplate}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                selectedTemplate === "" ? "text-gray-400" : "text-gray-800"
              }`}
              disabled={loading}
            >
              <option value="" className="text-gray-400">
                Select a template
              </option>
              <option value="create-new" className="font-bold text-blue-600">
                + Create New Template
              </option>
              {templates.map((template) => (
                <option
                  key={template.id}
                  value={template.id}
                  className="text-gray-800 hover:bg-blue-300"
                >
                  {template.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Subject
          </label>
          <input
            type="text"
            value={stripHtml(subject)}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Type your subject"
            className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Body
          </label>
          <p className="text-sm text-gray-400 mb-2">
            Candidate Name and Signature are already prefilled. Editable access
            only for body
          </p>
          <CKEditor
            editor={ClassicEditor}
            data={body}
            onChange={(event: any, editor: any) => setBody(editor.getData())}
            className={`${isBodyExpanded ? "h-96" : "h-48"} w-full rounded-lg`}
            onFocus={() => setIsBodyExpanded(true)}
            onBlur={() => setIsBodyExpanded(false)}
            config={{
              placeholder: "Type your message",
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
          />

          <style>{`
            .ck-editor__editable_inline::before {
              color: #4b5563 !important; /* Tailwind's text-gray-600 */
              font-style: normal !important; /* remove italics if you want normal text */
            }
          `}</style>
        </div>

        {/* Follow-up Templates */}

        {/* Channel Selection */}
        <div>
          <p className="block text-sm font-medium text-gray-600 mb-2">
            Reachout Channels
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setSendViaEmail(!sendViaEmail)}
              className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sendViaEmail
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              disabled={loading}
            >
              Email{" "}
              {sendViaEmail ? (
                <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-blue-800 rounded-full ml-1">
                  <Check className="w-3 h-3 text-semibold pt-[1px]" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-gray-600 rounded-full ml-1">
                  <Plus className="w-3 h-3 text-semibold pl-[1px]" />
                </div>
              )}
            </button>
            <button
              onClick={() => setSendViaWhatsApp(!sendViaWhatsApp)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sendViaWhatsApp
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              disabled={loading}
            >
              WhatsApp{" "}
              {sendViaWhatsApp ? (
                <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-blue-800 rounded-full ml-1">
                  <Check className="w-3 h-3 text-semibold pt-[1px]" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-gray-600 rounded-full ml-1">
                  <Plus className="w-3 h-3 text-semibold pr-[1px]" />
                </div>
              )}
            </button>
            <button
              onClick={() => setSendViaPhone(!sendViaPhone)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sendViaPhone
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              disabled={loading}
            >
              Phone{" "}
              {sendViaPhone ? (
                <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-blue-800 rounded-full ml-1">
                  <Check className="w-3 h-3 text-semibold pt-[1px]" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-gray-600 rounded-full ml-1">
                  <Plus className="w-3 h-3 text-semibold pl-[1px]" />
                </div>
              )}
            </button>
          </div>

          <div className="p-3 bg-blue-50 text-sm font-medium text-blue-500 rounded-lg mt-3">
            {sendViaEmail && sendViaWhatsApp && sendViaPhone ? (
              <div>
                Note: Email will be sent to candidate’s inbox, with WhatsApp
                message and bot phone alert to check mail.
              </div>
            ) : sendViaEmail && sendViaWhatsApp ? (
              <div>
                Note: Email will be sent to candidate’s inbox, with WhatsApp
                message to check mail.
              </div>
            ) : sendViaEmail && sendViaPhone ? (
              <div>
                Note: Email will be sent to candidate’s inbox, with AI phone
                alert to check mail.
              </div>
            ) : sendViaWhatsApp && sendViaPhone ? (
              <div>
                Note: WhatsApp message and AI-generated call will be sent to the
                candidate.
              </div>
            ) : sendViaEmail ? (
              <div>Note: Email will be sent to candidate's inbox.</div>
            ) : sendViaWhatsApp ? (
              <div>
                Note: WhatsApp message will be sent to the candidate's WhatsApp
                number.
              </div>
            ) : sendViaPhone ? (
              <div>
                Note: An AI-generated call will be made to the candidate's phone
                number.
              </div>
            ) : (
              <div className="text-sm font-medium text-gray-400 mb-2"> </div>
            )}
          </div>
        </div>

        {/* Follow up section  */}
        <div className="space-y-8 pt-2">
          <div>
            <div className="pb-2 mb-4 border-b border-dashed border-gray-300"></div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              <div
                className="flex justify-between text-sm font-medium text-gray-700 mb-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
                onClick={() => setIsFollowUpsExpanded(!isFollowUpsExpanded)}
              >
                <div className="flex justify-start items-center space-x-3 mb-2">
                  <Settings className="inline w-4 h-4 mr-1" />
                  <span>Follow Ups</span>
                </div>
                {isFollowUpsExpanded ? (
                  <ChevronUp className="inline w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="inline w-4 h-4 ml-1" />
                )}
              </div>
              {isFollowUpsExpanded && (
                <div className="mx-2 my-2">
                  {/* Saved wale he ye bhai */}
                  {followUpTemplates.map((followUp, index) => (
                    <div key={index}>
                      {isEditingFollowUp && editingIndex === index ? (
                        <div className="my-4 bg-blue-50 rounded-lg">
                          <div className="px-8 pt-2 flex justify-between items-center">
                            <span className="text-sm font-medium text-blue-600">
                              Edit Follow Up
                            </span>
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => {
                                  setIsAddingFollowUp(false);
                                  setIsEditingFollowUp(false);
                                  setEditingIndex(null);
                                }}
                                className="text-red-500 text-xs rounded-full"
                                disabled={loading}
                              >
                                <span className="w-4 h-4 flex items-center justify-center rounded-full border-2 border-red-500 text-red-500">
                                  <span className="text-xs mb-1 font-semibold">
                                    x
                                  </span>
                                </span>
                              </button>
                              <button
                                onClick={() => {
                                  const updatedFollowUps = [
                                    ...followUpTemplates,
                                  ];
                                  updatedFollowUps[index] = {
                                    ...updatedFollowUps[index],
                                    ...newFollowUp,
                                  };
                                  setFollowUpTemplates(updatedFollowUps);
                                  setIsAddingFollowUp(false);
                                  setIsEditingFollowUp(false);
                                  setEditingIndex(null);
                                  setNewFollowUp({
                                    send_after_hours: 24,
                                    followup_mode: "EMAIL",
                                    followup_body: `Hi ${candidate.full_name}, Type your message ...`,
                                  });
                                }}
                                className=" text-blue-500 text-xs rounded-full"
                                disabled={loading}
                              >
                                <span className="w-4 h-4 flex items-center justify-center rounded-full border-2 border-blue-500 text-blue-500">
                                  <Check className="w-2 h-2 font-semibold" />
                                </span>
                              </button>
                            </div>
                          </div>
                          <div className="border-b border-blue-400 rounded-full w-full pt-2 mb-3"></div>
                          <div className="px-8 pb-4 flex flex-col items-start space-y-3">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  Send After
                                </span>
                                <select
                                  value={newFollowUp.send_after_hours}
                                  onChange={(e) =>
                                    setNewFollowUp({
                                      ...newFollowUp,
                                      send_after_hours: Number(e.target.value),
                                    })
                                  }
                                  className="text-sm w-24 px-2 py-1 text-blue-600 bg-blue-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  disabled={loading}
                                >
                                  <option value="24hrs">24 hrs</option>
                                  <option value="48hrs">48 hrs</option>
                                  <option value="72hrs">72 hrs</option>
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  Via
                                </span>
                                <select
                                  value={newFollowUp.followup_mode}
                                  onChange={(e) =>
                                    setNewFollowUp({
                                      ...newFollowUp,
                                      followup_mode: e.target.value as
                                        | "EMAIL"
                                        | "WHATSAPP"
                                        | "CALL",
                                    })
                                  }
                                  className="text-sm w-24 px-2 py-1 text-blue-600 bg-blue-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  disabled={loading}
                                >
                                  <option value="EMAIL">Email</option>
                                  <option value="WHATSAPP">WhatsApp</option>
                                  <option value="CALL">Call</option>
                                </select>
                              </div>
                            </div>
                            <div className="w-full">
                              <label className="text-xs text-gray-500 mb-2 block">
                                Message
                              </label>
                              <input
                                type="text"
                                value={newFollowUp.followup_body}
                                onChange={(e) =>
                                  setNewFollowUp({
                                    ...newFollowUp,
                                    followup_body: e.target.value,
                                  })
                                }
                                style={{ color: "#2563EB" }}
                                placeholder=" Type your message"
                                className="text-sm w-full px-2 py-2 text-gray-300 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-200 border-b border-gray-400 mb-2 pt-2 rounded-lg">
                          <div className="flex justify-between items-center px-8">
                            <span className="text-sm font-medium text-gray-600">
                              Follow Up {index + 1}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => editFollowUp(index)}
                                className="p-1 text-gray-500 hover:text-gray-600"
                              >
                                <Edit className="w-4 h-4 text-gray-500" />
                              </button>
                              <button
                                onClick={() => openDeleteConfirmation(index)}
                                className="p-1 text-gray-500 hover:text-gray-600"
                              >
                                <Trash2 className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          </div>
                          <div className="pt-2 border-b border-gray-400 rounded-lg"></div>
                          <div className="my-4 px-8">
                            <div className="flex items-center text-gray-600">
                              <p>Will be sent around</p>{" "}
                              <span className="pl-1"></span>
                              <span>
                                {followUp.send_after_hours} hrs from now
                              </span>
                              <span className="pl-1"> </span>
                              <p>via {followUp.followup_mode}.</p>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-gray-400">
                                {followUp.followup_body}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Yaha se add new wala he bhai */}
                  {isAddingFollowUp && (
                    <div className="my-4 bg-blue-50 rounded-lg">
                      <div className="px-8 pt-2 flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-600">
                          {isEditingFollowUp ? "Edit Follow Up" : "Follow Up"}
                        </span>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => {
                              setIsAddingFollowUp(false);
                              setIsEditingFollowUp(false);
                              setEditingIndex(null);
                            }}
                            className="text-red-500 text-xs rounded-full"
                            disabled={loading}
                          >
                            <span className="w-4 h-4 flex items-center justify-center rounded-full border-2 border-red-500 text-red-500">
                              <span className="text-xs mb-1 font-semibold">
                                x
                              </span>
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              if (isEditingFollowUp && editingIndex !== null) {
                                const updatedFollowUps = [...followUpTemplates];
                                updatedFollowUps[editingIndex] = {
                                  ...updatedFollowUps[editingIndex],
                                  ...newFollowUp,
                                };
                                setFollowUpTemplates(updatedFollowUps);
                              } else {
                                setFollowUpTemplates([
                                  ...followUpTemplates,
                                  {
                                    ...newFollowUp,
                                    followup_mode: newFollowUp.followup_mode,
                                    order_no: followUpTemplates.length,
                                  },
                                ]);
                              }
                              setIsAddingFollowUp(false);
                              setIsEditingFollowUp(false);
                              setEditingIndex(null);
                              setNewFollowUp({
                                send_after_hours: 24,
                                followup_mode: "EMAIL",
                                followup_body: `Hi ${candidate.full_name}, Type your message ...`,
                              });
                            }}
                            className=" text-blue-500 text-xs rounded-full"
                            disabled={loading}
                          >
                            <span className="w-4 h-4 flex items-center justify-center rounded-full border-2 border-blue-500 text-blue-500">
                              <Check className="w-2 h-2 font-semibold" />
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingFollowUp(false);
                              setIsEditingFollowUp(false);
                              setEditingIndex(null);
                            }}
                            className=" text-gray-200 text-xs rounded-full"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4 text-gray-300" />
                          </button>
                        </div>
                      </div>
                      <div className="border-b border-blue-400 rounded-full w-full pt-2 mb-3"></div>
                      <div className="px-8 pb-4 flex flex-col items-start space-y-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              Send After
                            </span>
                            <select
                              value={newFollowUp.send_after_hours}
                              onChange={(e) =>
                                setNewFollowUp({
                                  ...newFollowUp,
                                  send_after_hours: Number(e.target.value),
                                })
                              }
                              className="text-sm w-24 px-2 py-1 text-blue-600 bg-blue-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={loading}
                            >
                              <option value="24hrs">24 hrs</option>
                              <option value="48hrs">48 hrs</option>
                              <option value="72hrs">72 hrs</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Via</span>
                            <select
                              value={newFollowUp.followup_mode}
                              onChange={(e) =>
                                setNewFollowUp({
                                  ...newFollowUp,
                                  followup_mode: e.target.value as
                                    | "EMAIL"
                                    | "WHATSAPP"
                                    | "CALL",
                                })
                              }
                              className="text-sm w-24 px-2 py-1 text-blue-600 bg-blue-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={loading}
                            >
                              <option value="EMAIL">Email</option>
                              <option value="WHATSAPP">WhatsApp</option>
                              <option value="CALL">Call</option>
                            </select>
                          </div>
                        </div>
                        <div className="w-full">
                          <label className="text-xs text-gray-500 mb-2 block">
                            Message
                          </label>
                          <input
                            type="text"
                            value={newFollowUp.followup_body}
                            onChange={(e) =>
                              setNewFollowUp({
                                ...newFollowUp,
                                followup_body: e.target.value,
                              })
                            }
                            style={{ color: "#2563EB" }}
                            placeholder=" Type your message"
                            className="text-sm w-full px-2 py-1 text-gray-300 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add follow Up Button */}
                  <button
                    onClick={() => setIsAddingFollowUp(true)}
                    className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-700 mt-4"
                    disabled={loading || isAddingFollowUp}
                  >
                    <Plus className="w-4 h-4 mr-2 mt-[2px] text-blue-600 border border-blue-500 rounded-md" />
                    Add Follow Up
                  </button>
                </div>
              )}
            </div>
            <div className="border-b border-dashed border-gray-300"></div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setShowTestEmail(true)}
              className="w-[25%] px-3 py-2 text-xs text-blue-600 border border-blue-600 rounded-lg flex items-center justify-center"
              disabled={loading}
            >
              Send Test
            </button>
            <button
              onClick={handleSendInvite}
              className="w-[30%] px-3 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center font-medium"
              disabled={
                loading ||
                !jobId ||
                !candidate.id ||
                (!sendViaEmail && !sendViaWhatsApp && !sendViaPhone)
              }
            >
              Send Invite <Send className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Template Slide Panel */}
      {showCreateTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div
            className={`bg-white w-[40%] h-full transform transition-transform duration-300 ease-out p-10 space-y-4 ${
              showCreateTemplate ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCreateTemplate(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-7 h-7 text-gray-700" />
                </button>
                <h2 className="text-lg font-semibold text-gray-700">
                  Create New Template
                </h2>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                className="text-sm w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Type your subject"
                className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Body
              </label>
              <p className="text-sm text-gray-400 mb-2">
                Candidate Name and Signature are already prefilled. Editable access only for body
              </p>
              <CKEditor
                editor={ClassicEditor}
                data={body}
                onChange={(event: any, editor: any) => setBody(editor.getData())}
                className={`${isBodyExpanded ? "h-96" : "h-48"} w-full rounded-lg`}
                onFocus={() => setIsBodyExpanded(true)}
                onBlur={() => setIsBodyExpanded(false)}
                config={{
                  placeholder: "Type your message",
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
              />
              <style>{`
            .ck-editor__editable_inline::before {
              color: #4b5563 !important; /* Tailwind's text-gray-600 */
              font-style: normal !important; /* remove italics if you want normal text */
            }
          `}</style>
            </div>

            <div>
              <p className="block text-sm font-medium text-gray-600 mb-2">
                Reachout Channels
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSendViaEmail(!sendViaEmail)}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sendViaEmail
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  disabled={loading}
                >
                  Email{" "}
                  {sendViaEmail ? (
                    <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-blue-800 rounded-full ml-1">
                      <Check className="w-3 h-3 text-semibold pt-[1px]" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-gray-600 rounded-full ml-1">
                      <Plus className="w-3 h-3 text-semibold pl-[1px]" />
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setSendViaWhatsApp(!sendViaWhatsApp)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sendViaWhatsApp
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  disabled={loading}
                >
                  WhatsApp{" "}
                  {sendViaWhatsApp ? (
                    <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-blue-800 rounded-full ml-1">
                      <Check className="w-3 h-3 text-semibold pt-[1px]" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-gray-600 rounded-full ml-1">
                      <Plus className="w-3 h-3 text-semibold pr-[1px]" />
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setSendViaPhone(!sendViaPhone)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sendViaPhone
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  disabled={loading}
                >
                  Phone{" "}
                  {sendViaPhone ? (
                    <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-blue-800 rounded-full ml-1">
                      <Check className="w-3 h-3 text-semibold pt-[1px]" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-gray-600 rounded-full ml-1">
                      <Plus className="w-3 h-3 text-semibold pl-[1px]" />
                    </div>
                  )}
                </button>
              </div>
              <div className="p-3 bg-blue-50 text-sm font-medium text-blue-500 rounded-lg mt-3">
                {sendViaEmail && sendViaWhatsApp && sendViaPhone ? (
                  <div>
                    Note: Email will be sent to candidate’s inbox, with WhatsApp
                    message and bot phone alert to check mail.
                  </div>
                ) : sendViaEmail && sendViaWhatsApp ? (
                  <div>
                    Note: Email will be sent to candidate’s inbox, with WhatsApp
                    message to check mail.
                  </div>
                ) : sendViaEmail && sendViaPhone ? (
                  <div>
                    Note: Email will be sent to candidate’s inbox, with AI phone
                    alert to check mail.
                  </div>
                ) : sendViaWhatsApp && sendViaPhone ? (
                  <div>
                    Note: WhatsApp message and AI-generated call will be sent to the
                    candidate.
                  </div>
                ) : sendViaEmail ? (
                  <div>Note: Email will be sent to candidate's inbox.</div>
                ) : sendViaWhatsApp ? (
                  <div>
                    Note: WhatsApp message will be sent to the candidate's WhatsApp
                    number.
                  </div>
                ) : sendViaPhone ? (
                  <div>
                    Note: An AI-generated call will be made to the candidate's phone
                    number.
                  </div>
                ) : (
                  <div className="text-sm font-medium text-gray-400 mb-2"> </div>
                )}
              </div>
            </div>
            <div className="space-y-8 pt-2">
              <div>
                <div className="pb-2 mb-4 border-b border-dashed border-gray-300"></div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  <div
                    className="flex justify-between text-sm font-medium text-gray-700 mb-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
                    onClick={() => setIsFollowUpsExpanded(!isFollowUpsExpanded)}
                  >
                    <div className="flex justify-start items-center space-x-3 mb-2">
                      <Settings className="inline w-4 h-4 mr-1" />
                      <span>Follow Ups</span>
                    </div>
                    {isFollowUpsExpanded ? (
                      <ChevronUp className="inline w-4 h-4 ml-1" />
                    ) : (
                      <ChevronDown className="inline w-4 h-4 ml-1" />
                    )}
                  </div>
                  {isFollowUpsExpanded && (
                    <div className="mx-2 my-2">
                      {followUpTemplates.map((followUp, index) => (
                        <div key={index}>
                          {isEditingFollowUp && editingIndex === index ? (
                            <div className="my-4 bg-blue-50 rounded-lg">
                              <div className="px-8 pt-2 flex justify-between items-center">
                                <span className="text-sm font-medium text-blue-600">
                                  Edit Follow Up
                                </span>
                                <div className="flex space-x-2 mt-2">
                                  <button
                                    onClick={() => {
                                      setIsAddingFollowUp(false);
                                      setIsEditingFollowUp(false);
                                      setEditingIndex(null);
                                    }}
                                    className="text-red-500 text-xs rounded-full"
                                    disabled={loading}
                                  >
                                    <span className="w-4 h-4 flex items-center justify-center rounded-full border-2 border-red-500 text-red-500">
                                      <span className="text-xs mb-1 font-semibold">
                                        x
                                      </span>
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updatedFollowUps = [...followUpTemplates];
                                      updatedFollowUps[index] = {
                                        ...updatedFollowUps[index],
                                        ...newFollowUp,
                                      };
                                      setFollowUpTemplates(updatedFollowUps);
                                      setIsAddingFollowUp(false);
                                      setIsEditingFollowUp(false);
                                      setEditingIndex(null);
                                      setNewFollowUp({
                                        send_after_hours: 24,
                                        followup_mode: "EMAIL",
                                        followup_body: `Hi ${candidate.full_name}, Type your message ...`,
                                      });
                                    }}
                                    className="text-blue-500 text-xs rounded-full"
                                    disabled={loading}
                                  >
                                    <span className="w-4 h-4 flex items-center justify-center rounded-full border-2 border-blue-500 text-blue-500">
                                      <Check className="w-2 h-2 font-semibold" />
                                    </span>
                                  </button>
                                </div>
                              </div>
                              <div className="border-b border-blue-400 rounded-full w-full pt-2 mb-3"></div>
                              <div className="px-8 pb-4 flex flex-col items-start space-y-3">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                      Send After
                                    </span>
                                    <select
                                      value={newFollowUp.send_after_hours}
                                      onChange={(e) =>
                                        setNewFollowUp({
                                          ...newFollowUp,
                                          send_after_hours: Number(e.target.value),
                                        })
                                      }
                                      className="text-sm w-24 px-2 py-1 text-blue-600 bg-blue-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      disabled={loading}
                                    >
                                      <option value="24">24 hrs</option>
                                      <option value="48">48 hrs</option>
                                      <option value="72">72 hrs</option>
                                    </select>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Via</span>
                                    <select
                                      value={newFollowUp.followup_mode}
                                      onChange={(e) =>
                                        setNewFollowUp({
                                          ...newFollowUp,
                                          followup_mode: e.target.value as "EMAIL" | "WHATSAPP" | "CALL",
                                        })
                                      }
                                      className="text-sm w-24 px-2 py-1 text-blue-600 bg-blue-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      disabled={loading}
                                    >
                                      <option value="EMAIL">Email</option>
                                      <option value="WHATSAPP">WhatsApp</option>
                                      <option value="CALL">Call</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="w-full">
                                  <label className="text-xs text-gray-500 mb-2 block">
                                    Message
                                  </label>
                                  <input
                                    type="text"
                                    value={newFollowUp.followup_body}
                                    onChange={(e) =>
                                      setNewFollowUp({
                                        ...newFollowUp,
                                        followup_body: e.target.value,
                                      })
                                    }
                                    style={{ color: "#2563EB" }}
                                    placeholder="Type your message"
                                    className="text-sm w-full px-2 py-2 text-gray-300 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-200 border-b border-gray-400 mb-2 pt-2 rounded-lg">
                              <div className="flex justify-between items-center px-8">
                                <span className="text-sm font-medium text-gray-600">
                                  Follow Up {index + 1}
                                </span>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => editFollowUp(index)}
                                    className="p-1 text-gray-500 hover:text-gray-600"
                                  >
                                    <Edit className="w-4 h-4 text-gray-500" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteConfirmation(index)}
                                    className="p-1 text-gray-500 hover:text-gray-600"
                                  >
                                    <Trash2 className="w-4 h-4 text-gray-500" />
                                  </button>
                                </div>
                              </div>
                              <div className="pt-2 border-b border-gray-400 rounded-lg"></div>
                              <div className="my-4 px-8">
                                <div className="flex items-center text-gray-600">
                                  <p>Will be sent around</p>{" "}
                                  <span className="pl-1"></span>
                                  <span>{followUp.send_after_hours} hrs from now</span>
                                  <span className="pl-1"> </span>
                                  <p>via {followUp.followup_mode}.</p>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-gray-400">
                                    {followUp.followup_body}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {isAddingFollowUp && (
                        <div className="my-4 bg-blue-50 rounded-lg">
                          <div className="px-8 pt-2 flex justify-between items-center">
                            <span className="text-sm font-medium text-blue-600">
                              {isEditingFollowUp ? "Edit Follow Up" : "Follow Up"}
                            </span>
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => {
                                  setIsAddingFollowUp(false);
                                  setIsEditingFollowUp(false);
                                  setEditingIndex(null);
                                }}
                                className="text-red-500 text-xs rounded-full"
                                disabled={loading}
                              >
                                <span className="w-4 h-4 flex items-center justify-center rounded-full border-2 border-red-500 text-red-500">
                                  <span className="text-xs mb-1 font-semibold">x</span>
                                </span>
                              </button>
                              <button
                                onClick={() => {
                                  if (isEditingFollowUp && editingIndex !== null) {
                                    const updatedFollowUps = [...followUpTemplates];
                                    updatedFollowUps[editingIndex] = {
                                      ...updatedFollowUps[editingIndex],
                                      ...newFollowUp,
                                    };
                                    setFollowUpTemplates(updatedFollowUps);
                                  } else {
                                    setFollowUpTemplates([
                                      ...followUpTemplates,
                                      {
                                        ...newFollowUp,
                                        followup_mode: newFollowUp.followup_mode,
                                        order_no: followUpTemplates.length,
                                      },
                                    ]);
                                  }
                                  setIsAddingFollowUp(false);
                                  setIsEditingFollowUp(false);
                                  setEditingIndex(null);
                                  setNewFollowUp({
                                    send_after_hours: 24,
                                    followup_mode: "EMAIL",
                                    followup_body: `Hi ${candidate.full_name}, Type your message ...`,
                                  });
                                }}
                                className="text-blue-500 text-xs rounded-full"
                                disabled={loading}
                              >
                                <span className="w-4 h-4 flex items-center justify-center rounded-full border-2 border-blue-500 text-blue-500">
                                  <Check className="w-2 h-2 font-semibold" />
                                </span>
                              </button>
                            </div>
                          </div>
                          <div className="border-b border-blue-400 rounded-full w-full pt-2 mb-3"></div>
                          <div className="px-8 pb-4 flex flex-col items-start space-y-3">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Send After</span>
                                <select
                                  value={newFollowUp.send_after_hours}
                                  onChange={(e) =>
                                    setNewFollowUp({
                                      ...newFollowUp,
                                      send_after_hours: Number(e.target.value),
                                    })
                                  }
                                  className="text-sm w-24 px-2 py-1 text-blue-600 bg-blue-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  disabled={loading}
                                >
                                  <option value="24">24 hrs</option>
                                  <option value="48">48 hrs</option>
                                  <option value="72">72 hrs</option>
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Via</span>
                                <select
                                  value={newFollowUp.followup_mode}
                                  onChange={(e) =>
                                    setNewFollowUp({
                                      ...newFollowUp,
                                      followup_mode: e.target.value as "EMAIL" | "WHATSAPP" | "CALL",
                                    })
                                  }
                                  className="text-sm w-24 px-2 py-1 text-blue-600 bg-blue-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  disabled={loading}
                                >
                                  <option value="EMAIL">Email</option>
                                  <option value="WHATSAPP">WhatsApp</option>
                                  <option value="CALL">Call</option>
                                </select>
                              </div>
                            </div>
                            <div className="w-full">
                              <label className="text-xs text-gray-500 mb-2 block">
                                Message
                              </label>
                              <input
                                type="text"
                                value={newFollowUp.followup_body}
                                onChange={(e) =>
                                  setNewFollowUp({
                                    ...newFollowUp,
                                    followup_body: e.target.value,
                                  })
                                }
                                style={{ color: "#2563EB" }}
                                placeholder="Type your message"
                                className="text-sm w-full px-2 py-2 text-gray-300 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => setIsAddingFollowUp(true)}
                        className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-700 mt-4"
                        disabled={loading || isAddingFollowUp}
                      >
                        <Plus className="w-4 h-4 mr-2 mt-[2px] text-blue-600 border border-blue-500 rounded-md" />
                        Add Follow Up
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setShowCreateTemplate(false)}
                  className="w-[25%] px-3 py-2 text-xs text-blue-600 border border-blue-600 rounded-lg flex items-center justify-center"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="w-[30%] px-3 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center font-medium"
                  disabled={
                    loading ||
                    !templateName.trim() ||
                    (!sendViaEmail && !sendViaWhatsApp && !sendViaPhone)
                  }
                >
                  Save Template <Send className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          
          </div>
        </div>
      )}

      {/* Test Email Slide Panel */}
      {showTestEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div
            className={`bg-white w-[40%] h-full transform transition-transform duration-300 ease-out p-10 space-y-4 ${
              showTestEmail ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowTestEmail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-7 h-7 text-gray-700" />
                </button>
                <h2 className="text-lg font-semibold text-gray-700">Send Test Email</h2>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Test Phone Number
                </label>
                <input
                  type="text"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  placeholder="Enter Phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-600 mb-2">
                Reachout Channels
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSendTestViaEmail(!sendTestViaEmail)}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sendTestViaEmail
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  disabled={loading}
                >
                  Email{" "}
                  {sendTestViaEmail ? (
                    <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-blue-800 rounded-full ml-1">
                      <Check className="w-3 h-3 text-semibold pt-[1px]" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-gray-600 rounded-full ml-1">
                      <Plus className="w-3 h-3 text-semibold pl-[1px]" />
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setSendTestViaWhatsApp(!sendTestViaWhatsApp)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sendTestViaWhatsApp
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  disabled={loading}
                >
                  WhatsApp{" "}
                  {sendTestViaWhatsApp ? (
                    <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-blue-800 rounded-full ml-1">
                      <Check className="w-3 h-3 text-semibold pt-[1px]" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-gray-600 rounded-full ml-1">
                      <Plus className="w-3 h-3 text-semibold pr-[1px]" />
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setSendTestViaPhone(!sendTestViaPhone)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sendTestViaPhone
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  disabled={loading}
                >
                  Phone{" "}
                  {sendTestViaPhone ? (
                    <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-blue-800 rounded-full ml-1">
                      <Check className="w-3 h-3 text-semibold pt-[1px]" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-4 h-4 border-2 border-gray-600 rounded-full ml-1">
                      <Plus className="w-3 h-3 text-semibold pl-[1px]" />
                    </div>
                  )}
                </button>
              </div>
              <div className="p-3 bg-blue-50 text-sm font-medium text-blue-500 rounded-lg mt-3">
                {sendTestViaEmail && sendTestViaWhatsApp && sendTestViaPhone ? (
                  <div>
                    Note: Email will be sent to candidate’s inbox, with WhatsApp
                    message and bot phone alert to check mail.
                  </div>
                ) : sendTestViaEmail && sendTestViaWhatsApp ? (
                  <div>
                    Note: Email will be sent to candidate’s inbox, with WhatsApp
                    message to check mail.
                  </div>
                ) : sendTestViaEmail && sendTestViaPhone ? (
                  <div>
                    Note: Email will be sent to candidate’s inbox, with AI phone
                    alert to check mail.
                  </div>
                ) : sendTestViaWhatsApp && sendTestViaPhone ? (
                  <div>
                    Note: WhatsApp message and AI-generated call will be sent to the
                    candidate.
                  </div>
                ) : sendTestViaEmail ? (
                  <div>Note: Email will be sent to candidate's inbox.</div>
                ) : sendTestViaWhatsApp ? (
                  <div>
                    Note: WhatsApp message will be sent to the candidate's WhatsApp
                    number.
                  </div>
                ) : sendTestViaPhone ? (
                  <div>
                    Note: An AI-generated call will be made to the candidate's phone
                    number.
                  </div>
                ) : (
                  <div className="text-sm font-medium text-gray-400 mb-2"> </div>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowTestEmail(false)}
                className="w-[25%] px-3 py-2 text-xs text-blue-600 border border-blue-600 rounded-lg flex items-center justify-center"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSendTestEmail}
                className="w-[30%] px-3 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center font-medium"
                disabled={loading}
              >
                Send Test <Send className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Follow Up
              </h3>
              <button
                onClick={() =>
                  setDeleteConfirmation({ isOpen: false, index: null })
                }
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this follow-up? This action cannot
              be undone.
            </p>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={() =>
                  setDeleteConfirmation({ isOpen: false, index: null })
                }
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmation.index !== null) {
                    removeFollowUp(deleteConfirmation.index);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateSelector;
