import React, { useState, useEffect } from "react";
import { ChevronDown, ArrowLeft, Mail, MessageSquare, Phone, Settings, Send, X } from "lucide-react";
import { showToast } from "../utils/toast";
import { Template, candidateService } from "../services/candidateService";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

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
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
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
    followUpTemplates: [] as { send_after_hours: number; followup_mode: 'EMAIL' | 'WHATSAPP' | 'CALL'; followup_body: string; followup_subject: string; order_no: number }[],
  });
  const [showTestEmail, setShowTestEmail] = useState(false);
  const [showAdvanceOptions, setShowAdvanceOptions] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
        showToast.error('Failed to fetch templates');
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
    const template = templates.find(t => t.id === Number(templateId));
    if (template) {
      setFormData({
        templateName: template.name,
        subject: template.initial_subject,
        body: template.initial_body,
        sendViaEmail: template.can_be_sent_via_email,
        sendViaWhatsApp: template.can_be_sent_via_whatsapp,
        sendViaPhone: template.can_be_sent_via_call,
        followUpTemplates: template.follow_up_steps.map(step => ({
          send_after_hours: step.send_after_hours,
          followup_mode: step.mode as 'EMAIL' | 'WHATSAPP' | 'CALL',
          followup_body: step.body,
          followup_subject: step.subject || '',
          order_no: step.order,
        })),
      });
    } else {
      setFormData({
        templateName: '',
        subject: '',
        body: '',
        sendViaEmail: true,
        sendViaWhatsApp: false,
        sendViaPhone: false,
        followUpTemplates: [],
      });
    }
  };

  const handleSave = async () => {
    if (!formData.templateName.trim()) {
      showToast.error('Please enter a template name');
      return;
    }
    if (!formData.sendViaEmail && !formData.sendViaWhatsApp && !formData.sendViaPhone) {
      showToast.error('Please select at least one channel');
      return;
    }
    if (!selectedTemplate) {
      showToast.error('Please select a template to edit');
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
          subject: step.followup_subject,
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

  const addFollowUp = () => {
    setFormData({
      ...formData,
      followUpTemplates: [
        ...formData.followUpTemplates,
        { send_after_hours: 0, followup_mode: 'EMAIL', followup_body: '', followup_subject: '', order_no: formData.followUpTemplates.length },
      ],
    });
  };

  const updateFollowUp = (index: number, field: string, value: any) => {
    const updated = [...formData.followUpTemplates];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, followUpTemplates: updated });
  };

  const removeFollowUp = (index: number) => {
    setFormData({
      ...formData,
      followUpTemplates: formData.followUpTemplates.filter((_, i) => i !== index),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div 
        className={`bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md max-h-[calc(100vh-2rem)] h-full transform transition-transform duration-300 ease-out p-4 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
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
            <h2 className="text-lg font-semibold text-gray-900">Edit Template</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  value={formData.templateName}
                  onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                  placeholder="Enter template name"
                  className="text-sm w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={formData.subject}
                  onChange={(event: any, editor: any) => setFormData({ ...formData, subject: editor.getData() })}
                  config={{
                    toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo'],
                  }}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={formData.body}
                  onChange={(event: any, editor: any) => setFormData({ ...formData, body: editor.getData() })}
                  config={{
                    toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo'],
                  }}
                  disabled={loading}
                />
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">The following will be sent to candidate via</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFormData({ ...formData, sendViaEmail: !formData.sendViaEmail })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.sendViaEmail ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    disabled={loading}
                  >
                    <Mail className="w-4 h-4 inline mr-1" /> Email
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, sendViaWhatsApp: !formData.sendViaWhatsApp })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.sendViaWhatsApp ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    disabled={loading}
                  >
                    <MessageSquare className="w-4 h-4 inline mr-1" /> WhatsApp
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, sendViaPhone: !formData.sendViaPhone })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.sendViaPhone ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    disabled={loading}
                  >
                    <Phone className="w-4 h-4 inline mr-1" /> Call
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="w-full flex justify-end">
                  <button
                    onClick={() => setShowAdvanceOptions(!showAdvanceOptions)}
                    className="text-blue-600 text-xs hover:bg-blue-50 transition-colors flex items-center justify-end"
                    disabled={loading}
                  >
                    <Settings className="w-4 h-4 mr-2" /> {showAdvanceOptions ? 'Hide' : 'View'} Advance Options
                  </button>
                </div>

                {showAdvanceOptions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Follow-ups</label>
                    {formData.followUpTemplates.map((followUp, index) => (
                      <div key={index} className="flex flex-col items-start mb-2 space-x-2">
                        <div className="flex items-center mb-2 space-x-4">
                          <button
                            onClick={() => removeFollowUp(index)}
                            className="ml-2 p-1 text-red-500 hover:text-red-700"
                            disabled={loading}
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Send After</span>
                            <input
                              type="number"
                              value={followUp.send_after_hours}
                              onChange={(e) => updateFollowUp(index, 'send_after_hours', Number(e.target.value))}
                              className="text-sm w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Hours"
                              disabled={loading}
                            />
                            <span className="text-xs text-gray-500">hrs</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Mode of Followup</span>
                            <select
                              value={followUp.followup_mode}
                              onChange={(e) => updateFollowUp(index, 'followup_mode', e.target.value as 'EMAIL' | 'WHATSAPP' | 'CALL')}
                              className="text-sm w-24 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={loading}
                            >
                              <option value="EMAIL">Email</option>
                              <option value="WHATSAPP">WhatsApp</option>
                              <option value="CALL">Call</option>
                            </select>
                          </div>
                        </div>
                        {followUp.followup_mode === 'EMAIL' && (
                          <div className="w-full mb-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Subject</label>
                            <CKEditor
                              editor={ClassicEditor}
                              data={followUp.followup_subject}
                              onChange={(event: any, editor: any) => updateFollowUp(index, 'followup_subject', editor.getData())}
                              config={{
                                toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo'],
                              }}
                              disabled={loading}
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2 w-full">
                          <CKEditor
                            editor={ClassicEditor}
                            className="w-full"
                            data={followUp.followup_body}
                            onChange={(event: any, editor: any) => updateFollowUp(index, 'followup_body', editor.getData())}
                            config={{
                              toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo'],
                            }}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addFollowUp}
                      className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                      disabled={loading}
                    >
                      + Add Follow-up
                    </button>
                  </div>
                )}

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
              showTestEmail ? 'translate-x-0' : 'translate-x-full'
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
                <h2 className="text-lg font-semibold text-gray-900">Send Test Email</h2>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Email Address</label>
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