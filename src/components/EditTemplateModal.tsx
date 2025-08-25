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
  isOpen: boolean;
  onClose: () => void;
  templateName?: string;
}

const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
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
      send_after_hours: string;
      followup_mode: "EMAIL" | "WHATSAPP" | "CALL";
      followup_body: string;
      order_no: number;
    }[],
  });
  const [showTestEmail, setShowTestEmail] = useState(false);
  const [showAdvanceOptions, setShowAdvanceOptions] = useState(false);
  const [testEmail, setTestEmail] = useState("");
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
    followup_body: "",
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
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === Number(templateId));
    if (template) {
      setFormData({
        templateName: template.name,
        subject: template.initial_subject,
        body: template.initial_body,
        sendViaEmail: template.can_be_sent_via_email,
        sendViaWhatsApp: template.can_be_sent_via_whatsapp,
        sendViaPhone: template.can_be_sent_via_call,
        followUpTemplates: template.follow_up_steps.map((step) => ({
          send_after_hours: `${step.send_after_hours}hrs`,
          followup_mode: step.mode as "EMAIL" | "WHATSAPP" | "CALL",
          followup_body: step.body,
          order_no: step.order,
        })),
      });
    } else {
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
          send_after_hours: step.send_after_hours as
            | "24hrs"
            | "48hrs"
            | "72hrs",
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

  const handleSendTest = () => {
    if (!testEmail) {
      showToast.error("Please enter a test email address");
      return;
    }
    showToast.success(`Test email sent to ${testEmail}`);
    setShowTestEmail(false);
  };

  const removeFollowUp = (index: number) => {
    setFormData({
      ...formData,
      followUpTemplates: formData.followUpTemplates.filter(
        (_, i) => i !== index
      ),
    });
  };

  // const addFollowUp = () => {
  //   setFormData({
  //     ...formData,
  //     followUpTemplates: [
  //       ...formData.followUpTemplates,
  //       {
  //         send_after_hours: 0,
  //         followup_mode: "EMAIL",
  //         followup_body: "",
  //         followup_subject: "",
  //         order_no: formData.followUpTemplates.length,
  //       },
  //     ],
  //   });
  // };

  // const updateFollowUp = (index: number, field: string, value: any) => {
  //   const updated = [...formData.followUpTemplates];
  //   updated[index] = { ...updated[index], [field]: value };
  //   setFormData({ ...formData, followUpTemplates: updated });
  // };

  // const removeFollowUp = (index: number) => {
  //   setFormData({
  //     ...formData,
  //     followUpTemplates: formData.followUpTemplates.filter(
  //       (_, i) => i !== index
  //     ),
  //   });
  // };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-4xl max-h-[calc(100vh-2rem)] h-full transform transition-transform duration-300 ease-out p-4 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              Edit Template
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {templates.length === 0 ? (
            <div className="text-center text-gray-600 py-8">
              No templates created yet. Please create a template.
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Template
                </label>
                <div className="relative">
                  <select
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <CKEditor
                  editor={ClassicEditor}
                  data={formData.subject}
                  onChange={(event: any, editor: any) =>
                    setFormData({ ...formData, subject: editor.getData() })
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
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body
                </label>
                <CKEditor
                  editor={ClassicEditor}
                  data={formData.body}
                  onChange={(event: any, editor: any) =>
                    setFormData({ ...formData, body: editor.getData() })
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
                  disabled={loading}
                />
              </div>

              <div>
                <p className="block text-sm font-medium text-gray-600 mb-2">
                  Reachout Channels
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        sendViaEmail: !formData.sendViaEmail,
                      })
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
                    className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                      setFormData({
                        ...formData,
                        sendViaPhone: !formData.sendViaPhone,
                      })
                    }
                    className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                      Note: Email will be sent to candidate’s inbox, with
                      WhatsApp message and bot phone alert to check mail.
                    </div>
                  ) : formData.sendViaEmail && formData.sendViaWhatsApp ? (
                    <div>
                      Note: Email will be sent to candidate’s inbox, with
                      WhatsApp message to check mail.
                    </div>
                  ) : formData.sendViaEmail && formData.sendViaPhone ? (
                    <div>
                      Note: Email will be sent to candidate’s inbox, with AI
                      phone alert to check mail.
                    </div>
                  ) : formData.sendViaWhatsApp && formData.sendViaPhone ? (
                    <div>
                      Note: WhatsApp message and AI-generated call will be sent
                      to the candidate.
                    </div>
                  ) : formData.sendViaEmail ? (
                    <div>Note: Email will be sent to candidate's inbox.</div>
                  ) : formData.sendViaWhatsApp ? (
                    <div>
                      Note: WhatsApp message will be sent to the candidate's
                      WhatsApp number.
                    </div>
                  ) : formData.sendViaPhone ? (
                    <div>
                      Note: An AI-generated call will be made to the candidate's
                      phone number.
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-gray-400 mb-2">
                      {" "}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8 pt-2">
                <div>
                  <div className="pb-2 mb-4 border-b border-dashed border-gray-300"></div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    <div
                      className="flex justify-between text-sm font-medium text-gray-700 mb-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
                      onClick={() =>
                        setIsFollowUpsExpanded(!isFollowUpsExpanded)
                      }
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
                                <p>Will be sent around</p>{" "}
                                <span className="pl-1"></span>
                                <span>
                                  {followUp.send_after_hours.replace("hrs", "")}{" "}
                                  hrs from now
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
                        ))}
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
                                    setFormData({
                                      ...formData,
                                      followUpTemplates: [
                                        ...formData.followUpTemplates,
                                        {
                                          ...newFollowUp,
                                          followup_mode:
                                            newFollowUp.followup_mode,
                                          order_no:
                                            formData.followUpTemplates.length,
                                        },
                                      ],
                                    });
                                    setIsAddingFollowUp(false);
                                    setNewFollowUp({
                                      send_after_hours: "24hrs",
                                      followup_mode: "EMAIL",
                                      followup_body: "",
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
                                  className="text-sm w-full px-2 py-1 text-gray-300 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <div className="border-b border-dashed border-gray-300"></div>
                </div>
                <div className="flex justify-between space-x-8">
                  <button
                    onClick={() => setShowTestEmail(true)}
                    className="w-full px-4 py-2 text-xs text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                    disabled={loading}
                  >
                    Send test email
                  </button>
                  <button
                    onClick={handleSave}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                    disabled={loading || !selectedTemplate}
                  >
                    Save Template
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showTestEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div
            className={`bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md max-h-[calc(100vh-2rem)] h-full transform transition-transform duration-300 ease-out p-4 flex flex-col ${
              showTestEmail ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowTestEmail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  Send Test Email
                </h2>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="text-sm w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex justify-between space-x-8 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowTestEmail(false)}
                className="w-full px-4 py-2 text-xs text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSendTest}
                className="w-full px-4 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
                disabled={loading}
              >
                Send Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditTemplateModal;
