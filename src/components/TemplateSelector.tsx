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
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

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
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false);
  const [sendViaPhone, setSendViaPhone] = useState(false);
  const [followUpTemplates, setFollowUpTemplates] = useState<
    {
      send_after_hours: "24hrs" | "48hrs" | "72hrs";
      followup_mode: "EMAIL" | "WHATSAPP" | "CALL";
      followup_body: string;
      order_no: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const [isFollowUpsExpanded, setIsFollowUpsExpanded] = useState(false);

  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);

  const [newFollowUp, setNewFollowUp] = useState<{
    send_after_hours: "24hrs" | "48hrs" | "72hrs";
    followup_mode: "EMAIL" | "WHATSAPP" | "CALL";
    followup_body: string;
  }>({
    send_after_hours: "24hrs",
    followup_mode: "EMAIL",
    followup_body: `Hi ${candidate.full_name}, , ${(
      <span className="text-gray-400">Type your message ...</span>
    )}`,
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const data = await candidateService.getTemplates();
        console.log("Fetched templates:", data);
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
          send_after_hours: step.send_after_hours,
          followup_mode: step.mode as "EMAIL" | "WHATSAPP" | "CALL", // Adjust casing
          followup_body: step.body,
          order_no: step.order,
        }))
      );
    } else {
      console.log("Template not found for ID:", templateId);
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

  const handleSendTestEmail = () => {
    if (!testEmail) {
      showToast.error("Please enter a test email address");
      return;
    }
    setShowTestEmail(false);
    showToast.success(`Test email sent to ${testEmail}`);
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
        candidate_id: candidate.id,
        template_id: selectedTemplate || undefined,
        job_id: jobId,
        subject,
        message_body: body,
        send_via_email: sendViaEmail,
        send_via_whatsapp: sendViaWhatsApp,
        send_via_phone: sendViaPhone,
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

  const addFollowUp = () => {
    setFollowUpTemplates([
      ...followUpTemplates,
      {
        send_after_hours: "24hrs",
        followup_mode: "EMAIL",
        followup_body: "",
        order_no: followUpTemplates.length,
      },
    ]);
  };

  const updateFollowUp = (index: number, field: string, value: any) => {
    const updated = [...followUpTemplates];
    updated[index] = { ...updated[index], [field]: value };
    setFollowUpTemplates(updated);
  };

  const removeFollowUp = (index: number) => {
    setFollowUpTemplates(followUpTemplates.filter((_, i) => i !== index));
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
              candidate_email: candidate.candidate_email,
              candidate_phone: candidate.candidate_phone,
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
  }, [candidate?.id, candidate?.candidate_email, candidate?.candidate_phone]);

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

  const hasContactInfo =
    !!detailedCandidate?.candidate?.candidate_email &&
    !!detailedCandidate?.candidate?.candidate_phone;
  const displayEmail = hasContactInfo
    ? detailedCandidate?.candidate?.candidate_email
    : `${detailedCandidate?.candidate?.full_name
        ?.toLocaleLowerCase()
        ?.slice(0, 2)}*********@gmail.com`;
  const displayPhone = hasContactInfo
    ? detailedCandidate?.candidate?.candidate_phone
    : "93********45";

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
                hasContactInfo
                  ? "text-gray-400 hover:text-gray-600"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              onClick={() => hasContactInfo && handleCopy(displayEmail)}
              disabled={!hasContactInfo}
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
                  hasContactInfo
                    ? "text-gray-400 hover:text-gray-600"
                    : "text-gray-300 cursor-not-allowed"
                }`}
                onClick={() => hasContactInfo && handleWhatsApp(displayPhone)}
                disabled={!hasContactInfo}
              >
                <div className="w-7 h-7 flex justify-center items-center bg-gray-200 rounded-full">
                  <FontAwesomeIcon icon={faWhatsapp} />
                </div>
              </button>
              <button
                className={`p-1 ${
                  hasContactInfo
                    ? "text-gray-400 hover:text-gray-600"
                    : "text-gray-300 cursor-not-allowed"
                }`}
                onClick={() => hasContactInfo && handleCopy(displayPhone)}
                disabled={!hasContactInfo}
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
              className="text-sm w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              disabled={loading}
            >
              <option value="">Select a template</option>
              <option value="create-new" className="font-bold text-blue-600">
                + Create New Template
              </option>
              {templates.map((template) => (
                <option
                  key={template.id}
                  value={template.id}
                  className="hover:bg-blue-300"
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
          <CKEditor
            editor={ClassicEditor}
            data={subject}
            onChange={(event: any, editor: any) => setSubject(editor.getData())}
            placeholder="Type your subject"
            className="rounded-lg"
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
            placeholder="Type your message"
            onFocus={() => setIsBodyExpanded(true)}
            onBlur={() => setIsBodyExpanded(false)}
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
          />
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
        </div>

        {/* Follow up section  */}
        <div className="space-y-16 pt-4">
          <div>
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
                    <div
                      key={index}
                      className="bg-gray-200 border-b border-gray-400 mb-2 pt-2 rounded-lg"
                    >
                      <div className="flex justify-between items-center px-8">
                        <span className="text-sm font-medium text-gray-600">
                          Follow Up {index + 1}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => removeFollowUp(index)}
                            className="p-1 text-gray-500 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => removeFollowUp(index)}
                            className="p-1 text-gray-500 hover:text-gray-600"
                          >
                            <Trash2 className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                      <div className="pt-2 border-b border-gray-400 rounded-lg"></div>
                      <div className="my-4 px-8">
                        <div className="flex items-center text-gray-600">
                          <p>Will be sent around</p> <span> </span>
                          <span>{followUp.send_after_hours} from now</span>
                          <span> </span>
                          <p>via {followUp.followup_mode}.</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-gray-400">
                            {followUp.followup_body}
                            {/* Hi {candidate.full_name}, bumping this up one last
                            time. Thanks! */}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Yaha se add new wala he bhai */}
                  {isAddingFollowUp && (
                    <div className="my-4 bg-blue-50 rounded-lg">
                      <div className="px-8 pt-2 flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-600">
                          Follow Up
                        </span>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => setIsAddingFollowUp(false)}
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
                              setFollowUpTemplates([
                                ...followUpTemplates,
                                {
                                  ...newFollowUp,
                                  followup_mode: newFollowUp.followup_mode as
                                    | "EMAIL"
                                    | "WHATSAPP"
                                    | "CALL",
                                  order_no: followUpTemplates.length,
                                },
                              ]);
                              setIsAddingFollowUp(false);
                              setNewFollowUp({
                                send_after_hours: "24hrs",
                                followup_mode: "EMAIL",
                                followup_body: `Hi ${candidate.full_name}, ${(
                                  <span className="text-gray-400">
                                    Type your message ...
                                  </span>
                                )}`,
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
                                  send_after_hours: e.target.value as
                                    | "24hrs"
                                    | "48hrs"
                                    | "72hrs",
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
                    <Plus className="w-4 h-4 mr-1 mt-[2px] text-blue-600 border border-blue-500 rounded-md" />
                    Add Follow Up
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between space-x-8 mt-6">
            <button
              onClick={() => setShowTestEmail(true)}
              className="w-full px-4 py-2 text-xs text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              disabled={loading}
            >
              Send test email
            </button>
            <button
              onClick={handleSendInvite}
              className="w-full px-4 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
              disabled={
                loading ||
                !jobId ||
                !candidate.id ||
                (!sendViaEmail && !sendViaWhatsApp && !sendViaPhone)
              }
            >
              <Send className="w-4 h-4 mr-2" /> Send Invite
            </button>
          </div>
        </div>
      </div>

      {/* Create Template Slide Panel */}
      {showCreateTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div
            className={`bg-white w-full h-full transform transition-transform duration-300 ease-out p-4 space-y-4 ${
              showCreateTemplate ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCreateTemplate(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  Create New Template
                </h2>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <CKEditor
                editor={ClassicEditor}
                data={subject}
                onChange={(event: any, editor: any) =>
                  setSubject(editor.getData())
                }
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body
              </label>
              <CKEditor
                editor={ClassicEditor}
                data={body}
                onChange={(event: any, editor: any) =>
                  setBody(editor.getData())
                }
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
              />
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">
                The following will be sent to candidate via
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSendViaEmail(!sendViaEmail)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sendViaEmail
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  disabled={loading}
                >
                  <Mail className="w-4 h-4 inline mr-1" /> Email
                </button>
                <button
                  onClick={() => setSendViaWhatsApp(!sendViaWhatsApp)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sendViaWhatsApp
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  disabled={loading}
                >
                  <MessageSquare className="w-4 h-4 inline mr-1" /> WhatsApp
                </button>
                <button
                  onClick={() => setSendViaPhone(!sendViaPhone)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sendViaPhone
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  disabled={loading}
                >
                  <Phone className="w-4 h-4 inline mr-1" /> Call
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
            className={`bg-white w-full h-full transform transition-transform duration-300 ease-out ${
              showTestEmail ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Send Test Email</h3>
                <button
                  onClick={() => setShowTestEmail(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowTestEmail(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendTestEmail}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={loading}
                >
                  Send Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateSelector;
