import { useState } from 'react';
import { Home, Briefcase, Users, FileEdit, Calendar, HelpCircle, LogOut } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'candidatePool', label: 'Candidate Pool', icon: Users },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'requests', label: 'Requests', icon: FileEdit },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ];

  const bottomItems = [
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  return (
    <aside
      className={`${isCollapsed ? 'w-20' : 'w-64'
        } flex flex-col py-6 bg-white border-r border-neutral-100 shrink-0 transition-all duration-300`}
    >
      <div className="px-6 mb-8 flex items-center justify-between">
        {!isCollapsed && (
          <svg fill="none" height="38" viewBox="0 0 49 38" width="49" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 22C0 9.84974 9.90333 0 22.1197 0H48.2612V14C48.2612 27.2548 37.4576 38 24.1306 38H0V22Z"
              fill="#0F47F2"
            />
            <path
              d="M13.7031 14.0907C15.2112 14.0907 16.4052 14.4961 17.285 15.4414C18.1647 16.3867 18.6046 17.6758 18.6046 19.3086V26H15.9064V19.6367C15.9064 18.7148 15.6433 17.9766 15.117 17.4219C14.5985 16.8672 13.9112 16.5898 13.055 16.5898C12.1674 16.5898 11.4565 16.8672 10.9224 17.4219C10.3961 17.9766 10.133 18.7148 10.133 19.6367V26H7.45833L7.45833 14.0907H10.133L10.133 16.1094C10.51 15.4453 11.0049 14.9336 11.6176 14.5742C12.2303 14.207 12.9254 14.0907 13.7031 14.0907Z"
              fill="white"
            />
            <path
              d="M31.8835 26H28.6551L25.9333 22.2031L23.2233 26H20.0185L24.3309 19.9531L20.2329 14.0825H23.5218L25.9569 17.6914L28.3892 14.0866H31.5942L27.5711 19.9297L31.8835 26Z"
              fill="white"
            />
            <path
              d="M40.6143 16.8125H37.5155V21.5352C37.5155 22.2461 37.7119 22.7734 38.1047 23.1172C38.5053 23.4531 39.0512 23.6211 39.7424 23.6211C40.0802 23.6211 40.3708 23.5898 40.6143 23.5273V26C40.198 26.0938 39.7149 26.1406 39.1651 26.1406C37.8376 26.1406 36.7811 25.7461 35.9956 24.957C35.2101 24.168 34.8173 23.043 34.8173 21.582V16.8125H32.5787L32.6213 14.0866H34.8173L34.8173 11.1172H37.5155L37.5155 14.0866H40.6143V16.8125Z"
              fill="white"
            />
            <path
              d="M42.3634 1.2453L43.5063 4.41567L46.9348 5.91743L43.5063 7.08546L42.3634 10.5896L41.2206 7.08546L37.792 5.91743L41.2206 4.41567L42.3634 1.2453Z"
              fill="white"
            />
          </svg>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 hover:bg-neutral-50 rounded-lg transition-colors ${isCollapsed ? 'mx-auto' : ''
            }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <path
              d="M21.9707 15V9C21.9707 4 19.9707 2 14.9707 2H8.9707C3.9707 2 1.9707 4 1.9707 9V15C1.9707 20 3.9707 22 8.9707 22H14.9707C19.9707 22 21.9707 20 21.9707 15Z"
              stroke="#4B5563"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              opacity="0.4"
              d="M7.9707 2V22"
              stroke="#4B5563"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              opacity="0.4"
              d="M14.9702 9.43994L12.4102 11.9999L14.9702 14.5599"
              stroke="#4B5563"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div className="px-4 mb-8">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
            <div className="size-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">
              nxt
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-800 truncate">Design Agency</p>
            </div>
            <svg
              className="w-5 h-5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )}

      <nav className="flex flex-col gap-1 px-4 flex-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                  ? 'bg-primary/5 text-primary font-semibold'
                  : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600'
                } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-4 flex flex-col gap-2 pt-6 border-t border-neutral-100">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-neutral-50 transition-colors ${isCollapsed ? 'justify-center' : ''
                }`}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
