import React, { useState } from "react";
import {
  ChevronDown,
  Bold,
  Italic,
  Link,
  List,
  MoreHorizontal,
  ArrowLeft,
  Mail,
  MessageSquare,
  Phone,
  Bot,
  Eye,
  Settings,
  Send,
  X,
} from "lucide-react";
import { Candidate } from "../data/candidates";
import { showToast } from "../utils/toast";

interface TemplateSelectorProps {
  candidate: Candidate;
  onBack: () => void;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  candidate,
  onBack,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templateName, setTemplateName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isBodyExpanded, setIsBodyExpanded] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showTestEmail, setShowTestEmail] = useState(false);
  const [showAdvanceOptions, setShowAdvanceOptions] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("Email");

  const templates: Template[] = [
    {
      id: "1",
      name: "Drip Campaign - Head of Finance",
      subject: "Exciting Opportunity at Weekday: Head of Finance in Pune",
      body: `Hi [candidatename],

I hope this message finds you well! At Weekday, we're a small team with a big heart, dedicated to making a positive impact on the world. We're currently looking for a Head of Finance who can bring their expertise in Finance to our dynamic online marketplace, with strong networks.
`,
    },
    {
      id: "2",
      name: "Follow-up Template",
      subject: "Following up on our Finance opportunity",
      body: `Hi [candidatename],

I wanted to follow up on the Head of Finance position we discussed. We're excited about the possibility of you joining our team at Weekday.

Would you be available for a quick call this week to discuss the role in more detail?

Best regards,
[Your Name]`,
    },
    {
      id: "3",
      name: "Initial Outreach",
      subject: "Finance Leadership Role at Weekday",
      body: `Hello [candidatename],

I came across your profile and was impressed by your background in finance. We have an exciting Head of Finance position at Weekday that I think would be a great fit for your skills.

Would you be interested in learning more about this opportunity?

Looking forward to hearing from you.`,
    },
  ];

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === "create-new") {
      setShowCreateTemplate(true);
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(template.subject);
      setBody(template.body.replace("[candidatename]", candidate.name));
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      showToast.error("Please enter a template name");
      return;
    }
    setShowCreateTemplate(false);
    showToast.success("Template saved successfully!");
  };

  const handleSendTestEmail = () => {
    if (!testEmail) {
      showToast.error("Please enter a test email address");
      return;
    }
    setShowTestEmail(false);
    showToast.success(`Test email sent to ${testEmail}`);
  };

  const handleSendInvite = () => {
    if (!selectedTemplate && !body) {
      showToast.error("Please select a template or enter email content");
      return;
    }
    showToast.success(
      `Invite sent to ${candidate.name} via ${selectedChannel}`
    );
    onBack();
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
            <h2 className="text-lg font-semibold text-gray-900">SEND INVITE</h2>
          </div>
        </div>

        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Template
          </label>
          <div className="relative">
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="text-sm w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="">Choose a template</option>
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

        {/* From Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <input
            type="email"
            value="shivanshi@weekday.works"
            readOnly
            className="text-sm w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
            className="text-sm w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Body
          </label>

          {/* Toolbar */}
          <div className="border border-gray-300 rounded-t-lg bg-gray-50 px-3 py-2 flex items-center space-x-2">
            <select className="text-sm border-none bg-transparent">
              <option>Paragraph</option>
              <option>Heading 1</option>
              <option>Heading 2</option>
            </select>
            <div className="w-px h-4 bg-gray-300"></div>
            <button className="p-1 hover:bg-gray-200 rounded">
              <Bold className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <Italic className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <Link className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <List className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Text Area */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter email body..."
            className={`text-sm w-full px-3 py-2 border-l border-r border-b border-gray-300 shadow-xl rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
              isBodyExpanded ? "h-80" : "h-40"
            }`}
          />

          {!isBodyExpanded && body.length > 150 && (
            <div className="flex justify-center">
              <button
                onClick={() => setIsBodyExpanded(true)}
                className="mt-1 text-sm text-blue-600 hover:text-blue-700"
              >
                View more
              </button>
            </div>
          )}

          {isBodyExpanded && (
            <div className="flex justify-center">
              <button
                onClick={() => setIsBodyExpanded(false)}
                className="mt-1 text-sm text-blue-600 hover:text-blue-700"
              >
                View less
              </button>
            </div>
          )}
        </div>

        {/* Channel Selection */}
        <div>
          <p className="text-sm text-gray-600 mb-2">
            The following will be sent to candidate via
          </p>
          <div className="flex justify-between">
            {[
              { name: "Email", icon: Mail, color: "bg-blue-100 text-blue-800" },
              {
                name: "WhatsApp",
                icon: MessageSquare,
                color: "bg-green-100 text-green-800",
              },
              {
                name: "Call",
                icon: Phone,
                color: "bg-orange-100 text-orange-800",
              },
            ].map((channel) => (
              <button
                key={channel.name}
                onClick={() => setSelectedChannel(channel.name)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedChannel === channel.name
                    ? channel.color
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <channel.icon className="w-4 h-4 inline mr-1" />
                {channel.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <div className="w-full flex justify-end">
            <button
              onClick={() => setShowAdvanceOptions(true)}
              className="text-blue-600 text-xs hover:bg-blue-50 transition-colors flex items-center justify-end"
            >
              <Settings className="w-4 h-4 mr-2" />
              View Advance Options
            </button>
          </div>

          <div className="flex justify-between space-x-8">
            <button
              onClick={() => setShowTestEmail(true)}
              className="w-full px-4 py-2 text-xs text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              Send test email
            </button>

            <button
              onClick={handleSendInvite}
              className="w-full px-4 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Invite
            </button>
          </div>
        </div>
      </div>

      {/* Create Template Slide Panel */}
      {showCreateTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div
            className={`bg-white h-full transform transition-transform duration-300 ease-out ${
              showCreateTemplate ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ width: "400px" }}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Create New Template</h3>
                <button
                  onClick={() => setShowCreateTemplate(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Enter email subject"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Body
                  </label>
                  <textarea
                    placeholder="Enter email body..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-40"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateTemplate(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            className={`bg-white h-full transform transition-transform duration-300 ease-out ${
              showTestEmail ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ width: "400px" }}
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
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowTestEmail(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendTestEmail}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Send Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advance Options Slide Panel */}
      {showAdvanceOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div
            className={`bg-white h-full transform transition-transform duration-300 ease-out ${
              showAdvanceOptions ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ width: "400px" }}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Advanced Options</h3>
                <button
                  onClick={() => setShowAdvanceOptions(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Send Delay
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Immediate</option>
                      <option>1 hour</option>
                      <option>1 day</option>
                      <option>1 week</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Normal</option>
                      <option>High</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Track email opens
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Track link clicks
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAdvanceOptions(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAdvanceOptions(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Settings
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
