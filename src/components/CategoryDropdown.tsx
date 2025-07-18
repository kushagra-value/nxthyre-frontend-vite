import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Edit, Mail, Archive, Trash2, Share2 } from 'lucide-react';
import { showToast } from '../utils/toast';
import { jobPostService } from '../services/jobPostService';

interface CategoryItem {
  id: number;
  name: string;
  count: number;
  invitesSent: number;
  totalReplied: number;
  totalApplied: number;
}

interface CategoryDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onEditJobRole: (jobId: number) => void;
  onEditTemplate: (jobId: number) => void;
  onDeleteJob: (jobId: number) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ 
  isOpen, 
  onClose, 
  onEditJobRole, 
  onEditTemplate,
  onDeleteJob,
}) => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // const categories: CategoryItem[] = [
  //   { name: 'Head Of Finance', count: 8, invitesSent: 45, totalReplied: 12, totalApplied: 8 },
  //   { name: 'Contract Executive', count: 6, invitesSent: 32, totalReplied: 8, totalApplied: 5 },
  //   { name: 'Aerospace Engineer', count: 9, invitesSent: 67, totalReplied: 18, totalApplied: 12 },
  //   { name: 'Embedded Engineer', count: 7, invitesSent: 28, totalReplied: 9, totalApplied: 6 },
  //   { name: 'Production Engineer', count: 11, invitesSent: 54, totalReplied: 15, totalApplied: 9 },
  //   { name: 'Waste Water Management', count: 4, invitesSent: 19, totalReplied: 5, totalApplied: 3 },
  //   { name: 'Software Engineer', count: 15, invitesSent: 89, totalReplied: 24, totalApplied: 16 },
  //   { name: 'Product Manager', count: 8, invitesSent: 41, totalReplied: 11, totalApplied: 7 },
  //   { name: 'Data Scientist', count: 6, invitesSent: 33, totalReplied: 9, totalApplied: 5 },
  //   { name: 'UI/UX Designer', count: 5, invitesSent: 26, totalReplied: 7, totalApplied: 4 },
  //   { name: 'DevOps Engineer', count: 7, invitesSent: 38, totalReplied: 10, totalApplied: 6 },
  //   { name: 'Marketing Manager', count: 4, invitesSent: 22, totalReplied: 6, totalApplied: 3 }
  // ];

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const jobs = await jobPostService.getJobs();
        const mappedCategories: CategoryItem[] = jobs.map(job => ({
          id: job.id,
          name: job.title,
          count: job.total_candidates || 0,
          invitesSent: job.invites_sent_count || 0, 
          totalReplied: job.total_replied || 0,
          totalApplied: job.total_applied || 0,
        }));
        setCategories(mappedCategories);
      } catch (error) {
        showToast.error('Failed to fetch categories');
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
        setShowActionMenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleActionClick = (action: string, jobId: number) => {
    setShowActionMenu(null);
    
    switch (action) {
      case 'edit-job':
        onEditJobRole(jobId);
        break;
      case 'edit-template':
        onEditTemplate(jobId);
        break;
      case 'share-pipelines':
        showToast.success(`Share Pipelines for ${jobId}`);
        break;
      case 'archive':
        showToast.success(`Archived ${jobId}`);
        break;
      case 'delete':
        showToast.success(`Deleted ${jobId}`);
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto"
    >
      <div className="p-2">
        <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
          All Categories
        </div>
        
        {categories.map((category) => (
          <div
            key={category.name}
            className="relative group"
            onMouseEnter={() => setHoveredItem(category.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                    {category.count}
                  </span>
                </div>
                
                {hoveredItem === category.id && (
                  <div className="mt-1 text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Invites Sent:</span>
                      <span className="font-medium">{category.invitesSent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Replied:</span>
                      <span className="font-medium">{category.totalReplied}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Applied:</span>
                      <span className="font-medium">{category.totalApplied}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionMenu(showActionMenu === category.id ? null : category.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>
                
                {showActionMenu === category.id && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleActionClick('edit-job', category.id)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Job Role
                      </button>
                      <button
                        onClick={() => handleActionClick('edit-template', category.id)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Edit Email Template
                      </button>
                      <button
                        onClick={() => handleActionClick('share-pipelines', category.id)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Pipelines
                      </button>
                      <button
                        onClick={() => handleActionClick('archive', category.id)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </button>
                      <button
                        onClick={() => handleActionClick('delete', category.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Job
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDropdown;