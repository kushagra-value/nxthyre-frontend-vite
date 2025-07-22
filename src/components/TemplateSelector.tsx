import React, { useState, useEffect } from 'react';
import { ChevronDown, Bold, Italic, Link, List, MoreHorizontal, ArrowLeft, Mail, MessageSquare, Phone, Settings, Send, X } from 'lucide-react';
import { showToast } from '../utils/toast';
import { CandidateListItem, Template, candidateService } from '../services/candidateService';
import CKEditor from '@ckeditor/ckeditor5-react';
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
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false);
  const [sendViaPhone, setSendViaPhone] = useState(false);
  const [followUpTemplates, setFollowUpTemplates] = useState<{ send_after_hours: number; followup_mode: 'EMAIL' | 'WHATSAPP' | 'CALL'; followup_body: string; order_no: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showAdvanceOptions, setShowAdvanceOptions] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const data = await candidateService.getTemplates();
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
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setTemplateName(template.name);
      setSubject(template.initial_subject);
      setBody(template.initial_body.replace('[candidateName]', candidate.full_name));
      setSendViaEmail(template.can_be_sent_via_email);
      setSendViaWhatsApp(template.can_be_sent_via_whatsapp);
      setSendViaPhone(template.can_be_sent_via_call);
      setFollowUpTemplates(template.follow_up_steps || []);
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
        id: selectedTemplate || undefined,
        name: templateName,
        initial_subject: subject,
        initial_body: body,
        can_be_sent_via_email: sendViaEmail,
        can_be_sent_via_whatsapp: sendViaWhatsApp,
        can_be_sent_via_call: sendViaPhone,
        follow_up_steps: followUpTemplates,
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

  const handleSendInvite = async () => {
    if (!jobId || !candidate.id) {
      showToast.error('Job ID and Candidate ID are required');
      return;
    }
    if (!subject || !body || (!sendViaEmail && !sendViaWhatsApp && !sendViaPhone)) {
      showToast.error('Please fill all fields and select at least one channel');
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
          id: selectedTemplate,
          name: templateName,
          initial_subject: subject,
          initial_body: body,
          can_be_sent_via_email: sendViaEmail,
          can_be_sent_via_whatsapp: sendViaWhatsApp,
          can_be_sent_via_call: sendViaPhone,
          follow_up_steps: followUpTemplates,
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Create New Template</h2>
        <div />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Template name</label>
        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter template name"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <CKEditor
          editor={ClassicEditor}
          data={subject}
          onChange={(event:any, editor:any) => setSubject(editor.getData())}
          config={{
            toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo'],
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph</label>
        <CKEditor
          editor={ClassicEditor}
          data={body}
          onChange={(event:any, editor:any) => setBody(editor.getData())}
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Follow Up 1</label>
        {followUpTemplates.map((followUp, index) => (
          <div key={index} className="flex items-center mb-2 space-x-2">
            <input
              type="number"
              value={followUp.send_after_hours}
              onChange={(e) => updateFollowUp(index, 'send_after_hours', Number(e.target.value))}
              className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Hours"
              disabled={loading}
            />
            <select
              value={followUp.followup_mode}
              onChange={(e) => updateFollowUp(index, 'followup_mode', e.target.value as 'EMAIL' | 'WHATSAPP' | 'CALL')}
              className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="CALL">Call</option>
            </select>
            <CKEditor
              editor={ClassicEditor}
              data={followUp.followup_body}
              onChange={(event:any, editor:any) => updateFollowUp(index, 'followup_body', editor.getData())}
              config={{
                toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo'],
              }}
            />
            <button onClick={() => removeFollowUp(index)} className="p-1 text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={addFollowUp} className="text-sm text-blue-600 hover:text-blue-700 mt-2" disabled={loading}>
          + Add Follow-up
        </button>
      </div>

      <div className="border-t pt-4">
        <button
          onClick={() => setShowAdvanceOptions(!showAdvanceOptions)}
          className="text-blue-600 text-xs hover:bg-blue-50 flex items-center"
        >
          <Settings className="w-4 h-4 mr-2" /> {showAdvanceOptions ? 'Hide' : 'View'} Advance Options
        </button>
        {showAdvanceOptions && (
          <div className="mt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Immediate</option>
                <option>1 hour</option>
                <option>1 day</option>
                <option>1 week</option>
              </select>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Normal</option>
                <option>High</option>
                <option>Low</option>
              </select>
            </div>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-blue-500" /> <span className="ml-2 text-sm">Track email opens</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-blue-500" /> <span className="ml-2 text-sm">Track link clicks</span>
            </label>
          </div>
        )}
      </div>

      <div className="flex justify-between space-x-2">
        <button
          onClick={onBack}
          className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSaveTemplate}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          disabled={loading || !templateName || !subject || !body || (!sendViaEmail && !sendViaWhatsApp && !sendViaPhone)}
        >
          <Send className="w-4 h-4 inline mr-1" /> Send
        </button>
      </div>
    </div>
  );
};

export default TemplateSelector;