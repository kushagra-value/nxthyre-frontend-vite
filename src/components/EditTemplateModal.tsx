import React, { useState } from "react";
import {
  X,
  Bold,
  Italic,
  Link,
  List,
  MoreHorizontal,
  Mail,
  MessageSquare,
  Phone,
  Settings,
  Paperclip,
} from "lucide-react";
import { showToast } from "../utils/toast";

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
  });

  const [isBodyExpanded, setIsBodyExpanded] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("Email");
  const [showAdvanceOptions, setShowAdvanceOptions] = useState(false);
  const [showTestEmail, setShowTestEmail] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const handleSave = () => {
    showToast.success("Template saved successfully!");
    onClose();
  };

  const handleSendTest = () => {
    if (!testEmail) {
      showToast.error("Please enter a test email address");
      return;
    }
    showToast.success(`Test email sent to ${testEmail}`);
    setShowTestEmail(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Edit Template</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Template Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={formData.templateName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    templateName: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Body with CK Editor */}
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
                value={formData.body}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, body: e.target.value }))
                }
                className={`w-full px-3 py-2 border-l border-r border-b border-gray-300 rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  isBodyExpanded ? "h-80" : "h-40"
                }`}
              />

              {!isBodyExpanded && formData.body.length > 150 && (
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

            {/* Attach File */}
            <div>
              <button className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Paperclip className="w-4 h-4 mr-2" />
                Attach File
              </button>
            </div>

            {/* Channel Selection */}
            <div>
              <p className="text-sm text-gray-600 mb-2">
                The following will be sent to candidate via
              </p>
              <div className="flex space-x-2">
                {[
                  {
                    name: "Email",
                    icon: Mail,
                    color: "bg-blue-100 text-blue-800",
                  },
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

            {/* View Advance Options */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowAdvanceOptions(true)}
                className="text-blue-600 text-sm hover:bg-blue-50 px-3 py-1 rounded transition-colors flex items-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                View Advance Options
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowTestEmail(true)}
                className="text-blue-600 text-sm underline hover:text-blue-700"
              >
                Send test email
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Test Email Slide Panel */}
      {showTestEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex justify-end">
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
                  onClick={handleSendTest}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex justify-end">
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

export default EditTemplateModal;
