import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ArrowLeft,
  Mail,
  MessageSquare,
  Phone,
  Settings,
  Send,
  X,
  ChevronUp,
  Plus,
  Trash2,
  Edit,
  Check,
} from "lucide-react";
import { showToast } from "../utils/toast";
import { Template, candidateService } from "../services/candidateService";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

interface EditTemplateModalProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  templateName?: string;
}

const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
  jobId,
  isOpen,
  onClose,
  templateName = "Head of Finance Template",
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [formData, setFormData] = useState({
    templateName: templateName,
    subject: "Exciting Opportunity at Weekday: Head of Finance in Pune",
    body: `Hi [Candidate name],

I hope this message finds you well, we are a small team with big heart, dedicated to making positive impact on the world. We're currently looking for a Head of Finance who can bring their expertise in Finance to our dynamic online marketplace, with strong networks.

The role involves:
• Leading financial planning and budgeting processes
• Overseeing financial reporting and compliance
• Managing cash flow and investment strategies
• Collaborating with senior leadership on strategic initiatives

We offer competitive compensation, comprehensive benefits, and opportunities for professional growth in a collaborative environment.

Looking forward to hearing from you.

Best regards,
[Your Name]
[date]`,
    sendViaEmail: true,
    sendViaWhatsApp: false,
    sendViaPhone: false,
    followUpTemplates: [] as {
      send_after_hours: number;
      followup_mode: "EMAIL" | "WHATSAPP" | "CALL";
      followup_body: string;
      order_no: number;
    }[],
  });
  const [showTestEmail, setShowTestEmail] = useState(false);
  const [showAdvanceOptions, setShowAdvanceOptions] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testNumber, setTestNumber] = useState("");
  const [sendTestViaEmail, setSendTestViaEmail] = useState(true);
  const [sendTestViaWhatsApp, setSendTestViaWhatsApp] = useState(false);
  const [sendTestViaPhone, setSendTestViaPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBodyExpanded, setIsBodyExpanded] = useState(false);
  const [isFollowUpsExpanded, setIsFollowUpsExpanded] = useState(false);
const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);
  const [isEditingFollowUp, setIsEditingFollowUp] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);  
  const [newFollowUp, setNewFollowUp] = useState<{
    send_after_hours: number;
    followup_mode: "EMAIL" | "WHATSAPP" | "CALL";
    followup_body: string;
  }>({
    send_after_hours: 24,
    followup_mode: "EMAIL",
    followup_body: "",
  });

  // Strip HTML tags from subject
  const stripHtml = (htmlString: string) => {
    const div = document.createElement("div");
    div.innerHTML = htmlString;
    return div.textContent || div.innerText || "";
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    index: number | null;
  }>({
    isOpen: false,
    index: null,
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const data = await candidateService.getTemplates();
        setTemplates(data);
        if (data.length > 0) {
          const firstTemplateId = data[0].id.toString();
          setSelectedTemplate(firstTemplateId);
          handleTemplateSelect(firstTemplateId);
        } else {
          console.log("No templates available");
          setFormData({
            templateName: "",
            subject: "",
            body: "",
            sendViaEmail: true,
            sendViaWhatsApp: false,
            sendViaPhone: false,
            followUpTemplates: [],
          });
        }
      } catch (error) {
        showToast.error("Failed to fetch templates");
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const handleTemplateSelect = (templateId: string) => {
    console.log("Selected template ID:", templateId);
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === Number(templateId));
    if (template) {
      console.log("Template found:", template);
      setFormData({
        templateName: template.name,
        subject: template.initial_subject,
        body: template.initial_body,
        sendViaEmail: template.can_be_sent_via_email,
        sendViaWhatsApp: template.can_be_sent_via_whatsapp,
        sendViaPhone: template.can_be_sent_via_call,
        followUpTemplates: template.follow_up_steps.map((step: any) => ({
          send_after_hours: Number(step.send_after_hours),
          followup_mode: step.mode as "EMAIL" | "WHATSAPP" | "CALL",
          followup_body: step.body,
          order_no: step.order,
        })),
      });
    } else {
      console.log("Template not found, resetting form");
      setFormData({
        templateName: "",
        subject: "",
        body: "",
        sendViaEmail: true,
        sendViaWhatsApp: false,
        sendViaPhone: false,
        followUpTemplates: [],
      });
    }
  };

  const handleSave = async () => {
    if (!formData.templateName.trim()) {
      showToast.error("Please enter a template name");
      return;
    }
    if (
      !formData.sendViaEmail &&
      !formData.sendViaWhatsApp &&
      !formData.sendViaPhone
    ) {
      showToast.error("Please select at least one channel");
      return;
    }
    if (!selectedTemplate) {
      showToast.error("Please select a template to edit");
      return;
    }
    setLoading(true);
    try {
      const updatedTemplate: Template = {
        id: Number(selectedTemplate),
        name: formData.templateName,
        initial_subject: formData.subject,
        initial_body: formData.body,
        can_be_sent_via_email: formData.sendViaEmail,
        can_be_sent_via_whatsapp: formData.sendViaWhatsApp,
        can_be_sent_via_call: formData.sendViaPhone,
        follow_up_steps: formData.followUpTemplates.map((step, index) => ({
          id: step.order_no + 1,
          send_after_hours: step.send_after_hours,
          mode: step.followup_mode,
          subject: "",
          body: step.followup_body,
          order: index,
        })),
      };
      await candidateService.updateTemplate(updatedTemplate);
      showToast.success("Template saved successfully!");
      onClose();
    } catch (error) {
      showToast.error("Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      showToast.error("Please enter a test email address");
      return;
    }
    if (!testNumber) {
      showToast.error("Please enter a test phone number");
      return;
    }
    setLoading(true);
    try {
      const response = await candidateService.sendTestEmail({
        job_id: jobId,
        candidate_id: "ed51c22f-517c-4f71-884b-55b56c9bea1a",
        email: testEmail,
        phone: testNumber,
        subject: formData.subject || "Test Invitation",
        message_body: formData.body || "This is a test message.",
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

  const removeFollowUp = (index: number) => {
    setFormData({
      ...formData,
      followUpTemplates: formData.followUpTemplates.filter(
        (_, i) => i !== index
      ),
    });
    setDeleteConfirmation({ isOpen: false, index: null });
  };

  
  const openDeleteConfirmation = (index: number) => {
    setDeleteConfirmation({ isOpen: true, index });
  };

  const editFollowUp = (index: number) => {
    const followUpToEdit = formData.followUpTemplates[index];
    setNewFollowUp({
      send_after_hours: followUpToEdit.send_after_hours,
      followup_mode: followUpToEdit.followup_mode,
      followup_body: followUpToEdit.followup_body,
    });
    setEditingIndex(index);
    setIsEditingFollowUp(true);
    setIsAddingFollowUp(true);
  };

  const handleClose = () => {
    setSelectedTemplate("");
    setFormData({
      templateName: "",
      subject: "",
      body: "",
      sendViaEmail: true,
      sendViaWhatsApp: false,
      sendViaPhone: false,
      followUpTemplates: [],
    });
    setIsAddingFollowUp(false);
    setIsEditingFollowUp(false);
    setEditingIndex(null);
    setNewFollowUp({
      send_after_hours: 24,
      followup_mode: "EMAIL",
      followup_body: "",
    });
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div
        className={`bg-white w-[40%] h-full transform transition-transform overflow-y-auto duration-300 ease-out p-10 space-y-4 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-7 h-7 text-gray-700" />
            </button>
            <h2 className="text-lg font-semibold text-gray-700">
              Edit Template
            </h2>
          </div>
        </div>

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
              <option value="">Choose a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Template Name
          </label>
          <input
            type="text"
            value={formData.templateName}
            onChange={(e) =>
              setFormData({ ...formData, templateName: e.target.value })
            }
            placeholder="Enter template name"
            className="text-sm w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Subject
          </label>
          <input
            type="text"
            value={stripHtml(formData.subject)}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            placeholder="Type your subject"
            className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
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
            key={formData.body}
            editor={ClassicEditor}
            data={formData.body}
            onChange={(event: any, editor: any) =>
              setFormData({ ...formData, body: editor.getData() })
            }
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
            disabled={loading}
          />
          <style>{`
            .ck-editor__editable_inline::before {
              color: #4b5563 !important;
              font-style: normal !important;
            }
          `}</style>
        </div>

        <div>
          <p className="block text-sm font-medium text-gray-600 mb-2">
            Reachout Channels
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() =>
                setFormData({ ...formData, sendViaEmail: !formData.sendViaEmail })
              }
              className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.sendViaEmail
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              disabled={loading}
            >
              Email{" "}
              {formData.sendViaEmail ? (
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
              onClick={() =>
                setFormData({
                  ...formData,
                  sendViaWhatsApp: !formData.sendViaWhatsApp,
                })
              }
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.sendViaWhatsApp
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              disabled={loading}
            >
              WhatsApp{" "}
              {formData.sendViaWhatsApp ? (
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
              onClick={() =>
                setFormData({ ...formData, sendViaPhone: !formData.sendViaPhone })
              }
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.sendViaPhone
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              disabled={loading}
            >
              Phone{" "}
              {formData.sendViaPhone ? (
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
            {formData.sendViaEmail &&
            formData.sendViaWhatsApp &&
            formData.sendViaPhone ? (
              <div>
                Note: Email will be sent to candidate’s inbox, with WhatsApp
                message and bot phone alert to check mail.
              </div>
            ) : formData.sendViaEmail && formData.sendViaWhatsApp ? (
              <div>
                Note: Email will be sent to candidate’s inbox, with WhatsApp
                message to check mail.
              </div>
            ) : formData.sendViaEmail && formData.sendViaPhone ? (
              <div>
                Note: Email will be sent to candidate’s inbox, with AI phone
                alert to check mail.
              </div>
            ) : formData.sendViaWhatsApp && formData.sendViaPhone ? (
              <div>
                Note: WhatsApp message and AI-generated call will be sent to the
                candidate.
              </div>
            ) : formData.sendViaEmail ? (
              <div>Note: Email will be sent to candidate's inbox.</div>
            ) : formData.sendViaWhatsApp ? (
              <div>
                Note: WhatsApp message will be sent to the candidate's WhatsApp
                number.
              </div>
            ) : formData.sendViaPhone ? (
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
                  {formData.followUpTemplates.map((followUp, index) => (
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
                                    ...formData.followUpTemplates,
                                  ];
                                  updatedFollowUps[index] = {
                                    ...updatedFollowUps[index],
                                    ...newFollowUp,
                                  };
                                  setFormData({
                                    ...formData,
                                    followUpTemplates: updatedFollowUps,
                                  });
                                  setIsAddingFollowUp(false);
                                  setIsEditingFollowUp(false);
                                  setEditingIndex(null);
                                  setNewFollowUp({
                                    send_after_hours: 24,
                                    followup_mode: "EMAIL",
                                    followup_body: "",
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
                                const updatedFollowUps = [
                                  ...formData.followUpTemplates,
                                ];
                                updatedFollowUps[editingIndex] = {
                                  ...updatedFollowUps[editingIndex],
                                  ...newFollowUp,
                                };
                                setFormData({
                                  ...formData,
                                  followUpTemplates: updatedFollowUps,
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  followUpTemplates: [
                                    ...formData.followUpTemplates,
                                    {
                                      ...newFollowUp,
                                      followup_mode: newFollowUp.followup_mode,
                                      order_no: formData.followUpTemplates.length,
                                    },
                                  ],
                                });
                              }
                              setIsAddingFollowUp(false);
                              setIsEditingFollowUp(false);
                              setEditingIndex(null);
                              setNewFollowUp({
                                send_after_hours: 24,
                                followup_mode: "EMAIL",
                                followup_body: "",
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
                onClick={() => setShowTestEmail(true)}
                className="w-[25%] px-3 py-2 text-xs text-blue-600 border border-blue-600 rounded-lg flex items-center justify-center"
                disabled={loading}
              >
                Send Test
              </button>
              <button
                onClick={handleSave}
                className="w-[30%] px-3 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center font-medium"
                disabled={
                  loading ||
                  !formData.templateName.trim() ||
                  (!formData.sendViaEmail &&
                    !formData.sendViaWhatsApp &&
                    !formData.sendViaPhone)
                }
              >
                Save Template <Send className="w-4 h-4 ml-2" />
              </button>
            </div>
        </div>
      
        

        
      </div>
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
                  <h2 className="text-lg font-semibold text-gray-700">
                    Send Test Email
                  </h2>
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
                  onClick={handleSendTest}
                  className="w-[30%] px-3 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center font-medium"
                  disabled={loading}
                >
                  Send Test <Send className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}

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
      </div>
  );
};

export default EditTemplateModal;
