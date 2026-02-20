import { useState } from 'react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

/* ─── SVG Icon Components ─── */

const DashboardIcon = ({ active }: { active: boolean }) => {
  const color = active ? '#0F47F2' : '#4B5563';
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.66663 15C1.66663 13.7163 1.66663 13.0745 1.95557 12.603C2.11724 12.3391 2.33907 12.1173 2.6029 11.9556C3.07441 11.6667 3.71626 11.6667 4.99996 11.6667C6.28366 11.6667 6.92551 11.6667 7.39701 11.9556C7.66085 12.1173 7.88267 12.3391 8.04435 12.603C8.33329 13.0745 8.33329 13.7163 8.33329 15C8.33329 16.2837 8.33329 16.9256 8.04435 17.3971C7.88267 17.6609 7.66085 17.8827 7.39701 18.0444C6.92551 18.3334 6.28366 18.3334 4.99996 18.3334C3.71626 18.3334 3.07441 18.3334 2.6029 18.0444C2.33907 17.8827 2.11724 17.6609 1.95557 17.3971C1.66663 16.9256 1.66663 16.2837 1.66663 15Z" stroke={color} />
      <path d="M11.6666 15C11.6666 13.7163 11.6666 13.0745 11.9556 12.603C12.1172 12.3391 12.3391 12.1173 12.6029 11.9556C13.0744 11.6667 13.7163 11.6667 15 11.6667C16.2837 11.6667 16.9255 11.6667 17.397 11.9556C17.6608 12.1173 17.8827 12.3391 18.0444 12.603C18.3333 13.0745 18.3333 13.7163 18.3333 15C18.3333 16.2837 18.3333 16.9256 18.0444 17.3971C17.8827 17.6609 17.6608 17.8827 17.397 18.0444C16.9255 18.3334 16.2837 18.3334 15 18.3334C13.7163 18.3334 13.0744 18.3334 12.6029 18.0444C12.3391 17.8827 12.1172 17.6609 11.9556 17.3971C11.6666 16.9256 11.6666 16.2837 11.6666 15Z" stroke={color} />
      <path d="M1.66663 5.00002C1.66663 3.71632 1.66663 3.07447 1.95557 2.60296C2.11724 2.33913 2.33907 2.11731 2.6029 1.95563C3.07441 1.66669 3.71626 1.66669 4.99996 1.66669C6.28366 1.66669 6.92551 1.66669 7.39701 1.95563C7.66085 2.11731 7.88267 2.33913 8.04435 2.60296C8.33329 3.07447 8.33329 3.71632 8.33329 5.00002C8.33329 6.28372 8.33329 6.92557 8.04435 7.39708C7.88267 7.66091 7.66085 7.88273 7.39701 8.04441C6.92551 8.33335 6.28366 8.33335 4.99996 8.33335C3.71626 8.33335 3.07441 8.33335 2.6029 8.04441C2.33907 7.88273 2.11724 7.66091 1.95557 7.39708C1.66663 6.92557 1.66663 6.28372 1.66663 5.00002Z" stroke={color} />
      <path d="M11.6666 5.00002C11.6666 3.71632 11.6666 3.07447 11.9556 2.60296C12.1172 2.33913 12.3391 2.11731 12.6029 1.95563C13.0744 1.66669 13.7163 1.66669 15 1.66669C16.2837 1.66669 16.9255 1.66669 17.397 1.95563C17.6608 2.11731 17.8827 2.33913 18.0444 2.60296C18.3333 3.07447 18.3333 3.71632 18.3333 5.00002C18.3333 6.28372 18.3333 6.92557 18.0444 7.39708C17.8827 7.66091 17.6608 7.88273 17.397 8.04441C16.9255 8.33335 16.2837 8.33335 15 8.33335C13.7163 8.33335 13.0744 8.33335 12.6029 8.04441C12.3391 7.88273 12.1172 7.66091 11.9556 7.39708C11.6666 6.92557 11.6666 6.28372 11.6666 5.00002Z" stroke={color} />
    </svg>
  );
};

const CompaniesIcon = ({ active }: { active: boolean }) => {
  const color = active ? '#0F47F2' : '#4B5563';
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 12.5L10 13.75" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 9.16669L2.6274 11.5527C2.76428 14.5642 2.83272 16.0699 3.79904 16.9933C4.76536 17.9167 6.27263 17.9167 9.28719 17.9167H10.7128C13.7274 17.9167 15.2346 17.9167 16.201 16.9933C17.1673 16.0699 17.2357 14.5642 17.3726 11.5527L17.5 9.16669" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.37269 8.70255C3.78877 11.3954 6.98271 12.5 10 12.5C13.0174 12.5 16.2113 11.3954 17.6274 8.70255C18.3033 7.41713 17.7915 5 16.1267 5H3.87338C2.20857 5 1.69673 7.41714 2.37269 8.70255Z" stroke={color} />
      <path d="M13.3332 4.99998L13.2596 4.74243C12.8929 3.45906 12.7096 2.81737 12.2731 2.45034C11.8366 2.08331 11.2568 2.08331 10.0973 2.08331H9.90237C8.74283 2.08331 8.16306 2.08331 7.72659 2.45034C7.29011 2.81737 7.10677 3.45906 6.74009 4.74243L6.6665 4.99998" stroke={color} />
    </svg>
  );
};

const CandidatesIcon = ({ active }: { active: boolean }) => {
  const color = active ? '#0F47F2' : '#4B5563';
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.3116 15C17.936 15 18.4327 14.6071 18.8786 14.0576C19.7915 12.9329 18.2927 12.034 17.721 11.5938C17.1399 11.1463 16.4911 10.8928 15.8332 10.8333M14.9999 9.16667C16.1505 9.16667 17.0832 8.23393 17.0832 7.08333C17.0832 5.93274 16.1505 5 14.9999 5" stroke={color} strokeLinecap="round" />
      <path d="M2.68822 15C2.0638 15 1.56714 14.6071 1.12121 14.0576C0.208326 12.9329 1.70714 12.034 2.27879 11.5938C2.8599 11.1463 3.50874 10.8928 4.16659 10.8333M4.58325 9.16667C3.43266 9.16667 2.49992 8.23393 2.49992 7.08333C2.49992 5.93274 3.43266 5 4.58325 5" stroke={color} strokeLinecap="round" />
      <path d="M6.73642 12.5927C5.88494 13.1192 3.65241 14.1943 5.01217 15.5395C5.6764 16.1967 6.41619 16.6667 7.34627 16.6667H12.6536C13.5837 16.6667 14.3234 16.1967 14.9877 15.5395C16.3474 14.1943 14.1149 13.1192 13.2634 12.5927C11.2667 11.358 8.73313 11.358 6.73642 12.5927Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.9166 6.24998C12.9166 7.86081 11.6107 9.16665 9.99992 9.16665C8.38909 9.16665 7.08325 7.86081 7.08325 6.24998C7.08325 4.63915 8.38909 3.33331 9.99992 3.33331C11.6107 3.33331 12.9166 4.63915 12.9166 6.24998Z" stroke={color} />
    </svg>
  );
};

const JobsIcon = ({ active }: { active: boolean }) => {
  const color = active ? '#0F47F2' : '#4B5563';
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.15 6.69942L15.5363 6.31322C16.1761 5.67334 17.2136 5.67334 17.8534 6.31322C18.4933 6.95309 18.4933 7.99054 17.8534 8.63039L17.4673 9.01664M15.15 6.69942C15.15 6.69942 15.1983 7.52009 15.9224 8.24422C16.6466 8.96831 17.4673 9.01664 17.4673 9.01664M15.15 6.69942L11.5995 10.2499C11.359 10.4904 11.2388 10.6106 11.1353 10.7432C11.0134 10.8996 10.9088 11.0689 10.8235 11.2479C10.7512 11.3997 10.6973 11.561 10.5898 11.8836L10.2455 12.9166L10.1341 13.2508M17.4673 9.01664L13.9168 12.5671C13.6763 12.8076 13.556 12.9279 13.4234 13.0313C13.267 13.1532 13.0978 13.2578 12.9188 13.3431C12.7669 13.4155 12.6057 13.4693 12.283 13.5768L11.25 13.9211L10.9158 14.0326M10.1341 13.2508L10.0227 13.5851C9.96976 13.7438 10.0111 13.9189 10.1294 14.0372C10.2478 14.1556 10.4228 14.1969 10.5816 14.144L10.9158 14.0326M10.1341 13.2508L10.9158 14.0326" stroke={color} />
      <path d="M6.66663 10.8333H8.74996" stroke={color} strokeLinecap="round" />
      <path d="M6.66663 7.5H12.0833" stroke={color} strokeLinecap="round" />
      <path d="M6.66663 14.1667H7.91663" stroke={color} strokeLinecap="round" />
      <path d="M16.5237 2.643C15.5474 1.66669 13.976 1.66669 10.8333 1.66669H9.16667C6.02397 1.66669 4.45262 1.66669 3.47631 2.643C2.5 3.61931 2.5 5.19065 2.5 8.33335V11.6667C2.5 14.8094 2.5 16.3808 3.47631 17.357C4.45262 18.3334 6.02397 18.3334 9.16667 18.3334H10.8333C13.976 18.3334 15.5474 18.3334 16.5237 17.357C17.3096 16.5711 17.4628 15.3997 17.4928 13.3334" stroke={color} strokeLinecap="round" />
    </svg>
  );
};

const ScheduleIcon = ({ active }: { active: boolean }) => {
  const color = active ? '#0F47F2' : '#4B5563';
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 1.66669V3.33335M5 1.66669V3.33335" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.33333 14.1666L8.33332 11.1227C8.33332 10.9629 8.21938 10.8333 8.07882 10.8333H7.5M11.358 14.1666L12.4868 11.1243C12.5396 10.982 12.4274 10.8333 12.2672 10.8333H10.8333" stroke={color} strokeLinecap="round" />
      <path d="M2.08337 10.2027C2.08337 6.57161 2.08337 4.75607 3.12681 3.62803C4.17024 2.5 5.84962 2.5 9.20837 2.5H10.7917C14.1505 2.5 15.8298 2.5 16.8733 3.62803C17.9167 4.75607 17.9167 6.57161 17.9167 10.2027V10.6306C17.9167 14.2617 17.9167 16.0773 16.8733 17.2053C15.8298 18.3333 14.1505 18.3333 10.7917 18.3333H9.20837C5.84962 18.3333 4.17024 18.3333 3.12681 17.2053C2.08337 16.0773 2.08337 14.2617 2.08337 10.6306V10.2027Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 6.66669H15" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const HelpIcon = ({ active }: { active: boolean }) => {
  const color = active ? '#0F47F2' : '#4B5563';
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.3333 10C18.3333 5.39767 14.6023 1.66671 9.99996 1.66671C5.39759 1.66671 1.66663 5.39767 1.66663 10C1.66663 14.6024 5.39759 18.3334 9.99996 18.3334C14.6023 18.3334 18.3333 14.6024 18.3333 10Z" stroke={color} />
      <path d="M10.2017 14.1667V10C10.2017 9.60718 10.2017 9.41076 10.0797 9.28873C9.95766 9.16669 9.76125 9.16669 9.36841 9.16669" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.99325 6.66669H10.0007" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const LogoutIcon = ({ active }: { active: boolean }) => {
  const color = active ? '#0F47F2' : '#4B5563';
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 14.6875C12.4387 16.2308 11.1526 17.5412 9.4297 17.499C9.02887 17.4892 8.53344 17.3495 7.5426 17.07C5.15801 16.3974 3.08796 15.267 2.5913 12.7346C2.5 12.2691 2.5 11.7453 2.5 10.6977L2.5 9.30229C2.5 8.25468 2.5 7.73087 2.5913 7.26538C3.08796 4.73304 5.15801 3.60263 7.5426 2.93002C8.53345 2.65054 9.02887 2.5108 9.4297 2.50099C11.1526 2.45884 12.4387 3.76923 12.5 5.31251" stroke={color} strokeLinecap="round" />
      <path d="M17.5 10H8.33337M17.5 10C17.5 9.4165 15.8381 8.32629 15.4167 7.91669M17.5 10C17.5 10.5835 15.8381 11.6737 15.4167 12.0834" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ─── nxthyre Logo (Expanded) ─── */
const LogoExpanded = () => (
  <svg fill="none" height="38" viewBox="0 0 96 38" width="96" xmlns="http://www.w3.org/2000/svg">
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
    {/* "hyre" text portion */}
    <text x="52" y="29" fontFamily="Gellix, sans-serif" fontSize="18" fontWeight="600" fill="#4B5563">hyre</text>
  </svg>
);

/* ─── nxt Logo (Collapsed) ─── */
const LogoCollapsed = () => (
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
);

/* ─── Menu Item Types ─── */
type IconComponent = React.FC<{ active: boolean }>;

interface MenuItem {
  id: string;
  label: string;
  icon: IconComponent;
  badge?: number;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'jobs', label: 'Companies', icon: CompaniesIcon },
    { id: 'candidatePool', label: 'Candidates', icon: CandidatesIcon },
    { id: 'candidates', label: 'Jobs', icon: JobsIcon },
    { id: 'calendar', label: 'Schedule', icon: ScheduleIcon, badge: 4 },
  ];

  const bottomItems: MenuItem[] = [
    { id: 'help', label: 'Help', icon: HelpIcon },
    { id: 'logout', label: 'Logout', icon: LogoutIcon },
  ];

  return (
    <aside
      className="flex flex-col bg-white shrink-0 transition-all duration-300 h-screen"
      style={{ width: isCollapsed ? 100 : 248 }}
    >
      {/* ── Logo Section ── */}
      <div
        className="flex items-center bg-white shrink-0"
        style={{
          height: 86,
          padding: isCollapsed ? '24px 26px' : '24px 30px',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        }}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="focus:outline-none cursor-pointer"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <LogoCollapsed /> : <LogoExpanded />}
        </button>
      </div>

      {/* ── Separator ── */}
      <div
        className="shrink-0"
        style={{
          height: 0,
          margin: isCollapsed ? '0 24px' : '0 24px',
          borderTop: '0.5px solid #4B5563',
          opacity: 0.3,
        }}
      />

      {/* ── Main Menu ── */}
      <nav
        className="flex flex-col flex-1 overflow-y-auto custom-scrollbar"
        style={{ padding: 24, gap: 10 }}
      >
        {menuItems.map((item) => {
          const IconComp = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex items-center shrink-0 transition-colors duration-150 cursor-pointer"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                gap: 12,
                width: isCollapsed ? 52 : 200,
                height: 52,
                borderRadius: 12,
                background: isActive ? '#E7EDFF' : 'transparent',
                border: 'none',
                outline: 'none',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#F3F4F6';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span className="shrink-0 flex items-center justify-center" style={{ width: 20, height: 20 }}>
                <IconComp active={isActive} />
              </span>

              {!isCollapsed && (
                <span
                  style={{
                    fontFamily: "'Gellix', sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: '20px',
                    color: isActive ? '#0F47F2' : '#4B5563',
                    flex: 1,
                    textAlign: 'left',
                  }}
                >
                  {item.label}
                </span>
              )}

              {/* Badge (e.g. Schedule count) */}
              {item.badge !== undefined && (
                isCollapsed ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#0F47F2',
                      border: '0.25px solid #FFFFFF',
                    }}
                  />
                ) : (
                  <span
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#0F47F2',
                      fontFamily: "'Gellix', sans-serif",
                      fontWeight: 400,
                      fontSize: 12,
                      lineHeight: '14px',
                      color: '#FFFFFF',
                    }}
                  >
                    {item.badge}
                  </span>
                )
              )}
            </button>
          );
        })}

        {/* ── Spacer to push bottom items down ── */}
        <div className="flex-1" />

        {/* ── Bottom Items (Help / Logout) ── */}
        {bottomItems.map((item) => {
          const IconComp = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'logout') {
                  // handle logout if needed
                } else {
                  onNavigate(item.id);
                }
              }}
              className="flex items-center shrink-0 transition-colors duration-150 cursor-pointer"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                gap: 12,
                width: isCollapsed ? 52 : 200,
                height: 52,
                borderRadius: 12,
                background: isActive ? '#E7EDFF' : 'transparent',
                border: 'none',
                outline: 'none',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#F3F4F6';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span className="shrink-0 flex items-center justify-center" style={{ width: 20, height: 20 }}>
                <IconComp active={isActive} />
              </span>

              {!isCollapsed && (
                <span
                  style={{
                    fontFamily: "'Gellix', sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: '20px',
                    color: isActive ? '#0F47F2' : '#4B5563',
                    flex: 1,
                    textAlign: 'left',
                  }}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
