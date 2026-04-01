import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  DownloadCloud, 
  LayoutGrid, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Phone,
  Mail,
  FileText
} from 'lucide-react';

// Icons for the stat cards based on the mockup colors and style
const BriefcaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const UserCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <polyline points="17 11 19 13 23 9"></polyline>
  </svg>
);

const BotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
  </svg>
);

const UploadCloudIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"></polyline>
    <line x1="12" y1="12" x2="12" y2="21"></line>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
    <polyline points="16 16 12 12 8 16"></polyline>
  </svg>
);

const CloudIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
  </svg>
);

// Stat Card Component
const StatCard = ({ title, value, change, changeText, positive, icon: Icon }: any) => (
  <div className="bg-white rounded-[12px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col gap-3 min-w-[240px] flex-1 border border-gray-100">
    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50">
      <Icon />
    </div>
    <div className="flex items-center gap-2">
      <span className={`text-sm font-medium ${positive ? 'text-green-500' : 'text-green-500'}`}>{change}</span>
      <span className="text-sm text-gray-400">{changeText}</span>
    </div>
    <div>
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-[32px] font-semibold text-gray-800 leading-tight">{value}</div>
    </div>
  </div>
);

// Move to Pipeline Modal Component
const MoveToPipelineModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl w-[600px] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Candidate Move to pipeline</h2>
            <p className="text-sm text-gray-400">Move selected candidates into a job pipeline</p>
          </div>
          <button onClick={onClose} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Selected Candidate<span className="text-red-500">*</span>
          </label>
          
          {/* Candidate Card */}
          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Max Verstappen</h3>
                <p className="text-sm text-blue-600">Senior Product Designer - Jupiter</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500 flex items-center justify-center text-[8px] font-bold text-white">PDF</div>
                <span className="text-sm text-gray-600">Maxverstappen Resume.pdf</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1.5"><BriefcaseIcon /> 5 years</div>
              <div className="flex items-center gap-1.5"><MapPinIcon /> Bengaluru, Karnataka</div>
              <div className="flex items-center gap-1.5"><WalletIcon /> 13 LPA</div>
              <div className="flex items-center gap-1.5"><WalletIcon /> 16 LPA</div>
              <div className="flex items-center gap-1.5"><CalendarIcon /> 30 Days</div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Company <span className="text-red-500">*</span>
              </label>
              <select className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm appearance-none">
                <option value="" disabled selected>Select stage...</option>
                <option value="google">Google</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Roles <span className="text-red-500">*</span>
              </label>
              <select className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm appearance-none">
                <option value="" disabled selected>Select stage...</option>
                <option value="pd">Product Designer</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Stage <span className="text-red-500">*</span>
              </label>
              <select className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm appearance-none">
                <option value="" disabled selected>Select stage...</option>
                <option value="interview">Interview</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center gap-4">
          <button onClick={onClose} className="flex-1 py-3 text-gray-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button className="flex-[2] py-3 bg-[#0F47F2] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Move to Pipeline
          </button>
        </div>
      </div>
    </div>
  );
};

// Mini icons for modal
const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const WalletIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>;
const CalendarIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;


export default function CandidateSearch() {
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate 8 identical rows based on mockup
  const candidates = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    name: 'Max Verstappen',
    company: 'Google',
    role: 'Product Designer',
    location: 'Bengaluru',
    exp: '7 yrs',
    currentCtc: '₹18.5L',
    expectedCtc: '₹25-35L',
    notice: '30 Days',
    status: 'Available'
  }));

  const handleActionClick = (id: number) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 h-full custom-scrollbar relative">
      <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
        
        {/* Stat Cards */}
        <div className="flex flex-wrap gap-4">
          <StatCard 
            title="Total Candidates" 
            value="14567" 
            change="10%" 
            changeText="vs last month" 
            positive={true} 
            icon={BriefcaseIcon} 
          />
          <StatCard 
            title="Total Hired" 
            value="822" 
            change="+42" 
            changeText="this month" 
            positive={true} 
            icon={UserCheckIcon} 
          />
          <StatCard 
            title="Via Naukbot" 
            value="12048" 
            change="+42" 
            changeText="this month" 
            positive={true} 
            icon={BotIcon} 
          />
          <StatCard 
            title="Manual Uploads" 
            value="2341" 
            change="+25" 
            changeText="this month" 
            positive={true} 
            icon={UploadCloudIcon} 
          />
          <StatCard 
            title="Others" 
            value="830" 
            change="+25" 
            changeText="this month" 
            positive={true} 
            icon={CloudIcon} 
          />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-t-xl border-b border-gray-100 flex items-center justify-between mt-6 border border-gray-200 border-b-0">
          <div className="flex items-center py-3 px-4 flex-1">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 min-w-[300px] bg-white">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search for Candidates, Companies, Skills" 
                className="outline-none text-sm w-full bg-transparent placeholder:text-gray-400"
              />
            </div>
            
            <button className="ml-4 flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
          
          <div className="flex items-center gap-3 pr-4">
            <button className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50">
              <Calendar className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50">
              <DownloadCloud className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50">
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button className="bg-[#0F47F2] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
              <span className="text-lg leading-none">+</span> Add Candidate
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-b-xl border-t-0 border-gray-200">
          <div className="overflow-x-auto min-h-[500px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-gray-100">
                <tr>
                  <th className="p-4 w-12"><input type="checkbox" className="rounded border-gray-300 w-4 h-4 cursor-pointer" /></th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Candidate</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Role</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Location</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Exp</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Current CTC</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Expected</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Notice</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Status</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 group relative">
                    <td className="p-4"><input type="checkbox" className="rounded border-gray-300 w-4 h-4 cursor-pointer" /></td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{c.company} •</div>
                    </td>
                    <td className="p-4 font-semibold text-gray-700">{c.role}</td>
                    <td className="p-4 text-gray-600">{c.location}</td>
                    <td className="p-4 text-gray-600">{c.exp}</td>
                    <td className="p-4 text-gray-600">{c.currentCtc}</td>
                    <td className="p-4 font-semibold text-[#0F47F2]">{c.expectedCtc}</td>
                    <td className="p-4 font-medium text-amber-500">{c.notice}</td>
                    <td className="p-4"><span className="text-emerald-500 font-medium">{c.status}</span></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setIsModalOpen(true)}
                          className="px-4 py-2 bg-[#0F47F2] text-white text-xs font-semibold rounded-[6px] hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          Add to Pipeline
                        </button>
                        <div className="relative">
                          <button 
                            onClick={() => handleActionClick(c.id)}
                            className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 focus:outline-none"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          
                          {activeMenuId === c.id && (
                            <div className="absolute right-0 top-10 w-40 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-xl py-2 z-50 border border-gray-100">
                               <button className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                                 <Phone className="w-4 h-4" /> Call
                               </button>
                               <button className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                                 <Mail className="w-4 h-4" /> Mail
                               </button>
                               <button className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                                 <FileText className="w-4 h-4" /> View Resume
                               </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Showing 1–15 of 1,240</span>
            <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0F47F2] text-white text-sm font-medium">1</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-600 text-sm font-medium">2</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-600 text-sm font-medium">3</button>
              <span className="px-1 text-gray-400">...</span>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-600 text-sm font-medium">83</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 border border-gray-200">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      <MoveToPipelineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Invisible overlay to close popover when clicking anywhere else */}
      {activeMenuId !== null && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActiveMenuId(null)}
        />
      )}
    </div>
  );
}
