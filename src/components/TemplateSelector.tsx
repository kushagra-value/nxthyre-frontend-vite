import React, { useState, useEffect } from 'react';
import { ChevronDown, Bold, Italic, Link, List, MoreHorizontal, ArrowLeft, Mail, MessageSquare, Phone, Settings, Send, X } from 'lucide-react';
import { showToast } from '../utils/toast';
import { CandidateListItem, Template, candidateService } from '../services/candidateService';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface TemplateSelectorProps {
  candidate: CandidateListItem;
  onBack: () => void;
  updateCandidateEmail: (candidateId: string, candidate_email: string, candidate_phone: string) => void;
  jobId: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ candidate, onBack, updateCandidateEmail, jobId }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateName, setTemplateName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isBodyExpanded, setIsBodyExpanded] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showTestEmail, setShowTestEmail] = useState(false);
  const [showAdvanceOptions, setShowAdvanceOptions] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false);
  const [sendViaPhone, setSendViaPhone] = useState(false);
  const [followUpTemplates, setFollowUpTemplates] = useState<{ send_after_hours: number; followup_mode: 'EMAIL' | 'WHATSAPP' | 'CALL'; followup_body: string; order_no: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const data = await candidateService.getTemplates();
        console.log('Fetched templates:', data);
        setTemplates(data);
      } catch (error) {
        showToast.error('Failed to fetch templates');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    console.log('Selected template ID:', templateId);
    if (templateId === 'create-new') {
      setShowCreateTemplate(true);
      setSelectedTemplate('');
      setTemplateName('');
      setSubject('');
      setBody('');
      setSendViaEmail(true);
      setSendViaWhatsApp(false);
      setSendViaPhone(false);
      setFollowUpTemplates([]);
      return;
    }
    const template = templates.find(t => t.id === Number(templateId));
    if (template) {
      setSelectedTemplate(templateId);
      setTemplateName(template.name);
      setSubject(template.initial_subject);
      setBody(template.initial_body.replace('[candidateName]', candidate.full_name));
      setSendViaEmail(template.can_be_sent_via_email);
      setSendViaWhatsApp(template.can_be_sent_via_whatsapp);
      setSendViaPhone(template.can_be_sent_via_call);
      setFollowUpTemplates(template.follow_up_steps.map(step => ({
        send_after_hours: step.send_after_hours,
        followup_mode: step.mode as 'EMAIL' | 'WHATSAPP' | 'CALL', // Adjust casing
        followup_body: step.body,
        order_no: step.order,
      })));
    } else {
      console.log('Template not found for ID:', templateId);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      showToast.error('Please enter a template name');
      return;
    }
    if (!sendViaEmail && !sendViaWhatsApp && !sendViaPhone) {
      showToast.error('Please select at least one channel');
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
          subject: '', // Add subject if required by API
          body: step.followup_body,
          order: index,
        })),
      };
      const savedTemplate = await candidateService.saveTemplate(newTemplate);
      setTemplates([...templates.filter(t => t.id !== savedTemplate.id), savedTemplate]);
      setShowCreateTemplate(false);
      showToast.success('Template saved successfully!');
    } catch (error) {
      showToast.error('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = () => {
    if (!testEmail) {
      showToast.error('Please enter a test email address');
      return;
    }
    setShowTestEmail(false);
    showToast.success(`Test email sent to ${testEmail}`);
  };

  const handleSendInvite = async () => {
    console.log('Job ID:', jobId);
    console.log('Candidate ID:', candidate.id);
    if (!jobId || !candidate.id) {
      showToast.error('Job ID and Candidate ID are required');
      return;
    }
    if (!selectedTemplate && !body) {
      showToast.error('Please select a template or enter email content');
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
      showToast.success(`Invite sent successfully! Invite ID: ${response.invite_id}. Follow-ups scheduled.`);
      updateCandidateEmail(candidate.id, response.candidate_email, response.candidate_phone);
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
            subject: '', // Add subject if required
            body: step.followup_body,
            order: index,
          })),
        };
        await candidateService.saveTemplate(updatedTemplate);
      }
    } catch (error) {
      showToast.error('Failed to send invite');
    } finally {
      setLoading(false);
      onBack();
    }
  };

  const addFollowUp = () => {
    setFollowUpTemplates([...followUpTemplates, { send_after_hours: 0, followup_mode: 'EMAIL', followup_body: '', order_no: followUpTemplates.length }]);
  };

  const updateFollowUp = (index: number, field: string, value: any) => {
    const updated = [...followUpTemplates];
    updated[index] = { ...updated[index], [field]: value };
    setFollowUpTemplates(updated);
  };

  const removeFollowUp = (index: number) => {
    setFollowUpTemplates(followUpTemplates.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4 h-fit">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Send Invite</h2>
          </div>
        </div>

        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
          <div className="relative">
            <select
              key={selectedTemplate}
              value={selectedTemplate}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="text-sm w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              disabled={loading}
            >
              <option value="">Choose a template</option>
              <option value="create-new" className="font-bold text-blue-600">+ Create New Template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id} className="hover:bg-blue-300">
                  {template.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* From Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
          <input
            type="email"
            value="yuvraj@nxthyre.com"
            readOnly
            className="text-sm w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <CKEditor
            editor={ClassicEditor}
            data={subject}
            onChange={(event: any, editor: any) => setSubject(editor.getData())}
            config={{
              toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo'],
            }}
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
          <CKEditor
            editor={ClassicEditor}
            data={body}
            onChange={(event: any, editor: any) => setBody(editor.getData())}
            config={{
              toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo'],
            }}
          />
        </div>

        {/* Follow-up Templates */}
        

        {/* Channel Selection */}
        <div>
          <p className="text-sm text-gray-600 mb-2">The following will be sent to candidate via</p>
          <div className="flex space-x-2">
            <button
              onClick={() => setSendViaEmail(!sendViaEmail)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sendViaEmail ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              disabled={loading}
            >
              <Mail className="w-4 h-4 inline mr-1" /> Email
            </button>
            <button
              onClick={() => setSendViaWhatsApp(!sendViaWhatsApp)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sendViaWhatsApp ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              disabled={loading}
            >
              <MessageSquare className="w-4 h-4 inline mr-1" /> WhatsApp
            </button>
            <button
              onClick={() => setSendViaPhone(!sendViaPhone)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sendViaPhone ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              disabled={loading}
            >
              <Phone className="w-4 h-4 inline mr-1" /> Call
            </button>
          </div>
        </div>

        {/* Action Buttons */}
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

          <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Follow-ups</label>
          {followUpTemplates.map((followUp, index) => (
            <div key={index} className="flex flex-col items-start mb-2 space-x-2">
              <div className='flex items-center mb-2 space-x-4'>
                <button
                  onClick={() => removeFollowUp(index)}
                  className="ml-2 p-1 text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              
              <div className='flex items-center gap-2'>
                <span className="text-xs text-gray-500">Send After</span>
                <input
                  type="number"
                  value={followUp.send_after_hours}
                  onChange={(e) => {
                    const updated = [...followUpTemplates];
                    updated[index] = { ...updated[index], send_after_hours: Number(e.target.value) };
                    setFollowUpTemplates(updated);
                  }}
                  className="text-sm w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Hours"
                  disabled={loading}
                />
                <span className="text-xs text-gray-500">hrs</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className="text-xs text-gray-500">Mode of Followup</span>
                <select
                  value={followUp.followup_mode}
                  onChange={(e) => {
                    const updated = [...followUpTemplates];
                    updated[index] = { ...updated[index], followup_mode: e.target.value as 'EMAIL' | 'WHATSAPP' | 'CALL' };
                    setFollowUpTemplates(updated);
                  }}
                  className="text-sm w-24 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="EMAIL">Email</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="CALL">Call</option>
                </select>
              </div>
              </div>
              <div className='flex items-center gap-2 w-full'>
                <CKEditor
                editor={ClassicEditor}
                className="w-full"
                data={followUp.followup_body}
                onChange={(event: any, editor: any) => updateFollowUp(index, 'followup_body', editor.getData())}
                config={{
                  toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo'],
                }}
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

        
          <div className="flex justify-between space-x-8">
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
              disabled={loading || !jobId || !candidate.id || (!sendViaEmail && !sendViaWhatsApp && !sendViaPhone)}
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
              showCreateTemplate ? 'translate-x-0' : 'translate-x-full'
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
                <h2 className="text-lg font-semibold text-gray-900">Create New Template</h2>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <CKEditor
                editor={ClassicEditor}
                data={subject}
                onChange={(event: any, editor: any) => setSubject(editor.getData())}
                config={{
                  toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo'],
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
              <CKEditor
                editor={ClassicEditor}
                data={body}
                onChange={(event: any, editor: any) => setBody(editor.getData())}
                config={{
                  toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo'],
                }}
              />
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">The following will be sent to candidate via</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSendViaEmail(!sendViaEmail)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sendViaEmail ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  disabled={loading}
                >
                  <Mail className="w-4 h-4 inline mr-1" /> Email
                </button>
                <button
                  onClick={() => setSendViaWhatsApp(!sendViaWhatsApp)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sendViaWhatsApp ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  disabled={loading}
                >
                  <MessageSquare className="w-4 h-4 inline mr-1" /> WhatsApp
                </button>
                <button
                  onClick={() => setSendViaPhone(!sendViaPhone)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sendViaPhone ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
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
                  {followUpTemplates.map((followUp, index) => (
                    <div key={index} className="flex flex-col items-start mb-2 space-x-2">
                      <div className='flex items-center mb-2 space-x-4'>
                        <button
                          onClick={() => removeFollowUp(index)}
                          className="ml-2 p-1 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className='flex items-center gap-2'>
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
                        <div className='flex items-center gap-2'>
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
                      <div className='flex items-center gap-2 w-full'>
                        <CKEditor
                          editor={ClassicEditor}
                          className="w-full"
                          data={followUp.followup_body}
                          onChange={(event: any, editor: any) => updateFollowUp(index, 'followup_body', editor.getData())}
                          config={{
                            toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo'],
                          }}
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
                  onClick={() => setShowCreateTemplate(false)}
                  className="w-full px-4 py-2 text-xs text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                  disabled={loading}
                >
                  Save Template
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
              showTestEmail ? 'translate-x-0' : 'translate-x-full'
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Email Address</label>
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