import { ChevronDown } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const RefreshIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 12C2.5 12.2761 2.72386 12.5 3 12.5C3.27614 12.5 3.5 12.2761 3.5 12H2.5ZM3.5 12C3.5 7.30558 7.30558 3.5 12 3.5V2.5C6.75329 2.5 2.5 6.75329 2.5 12H3.5ZM12 3.5C15.3367 3.5 18.2252 5.4225 19.6167 8.22252L20.5122 7.77748C18.9583 4.65062 15.7308 2.5 12 2.5V3.5Z" fill="#4B5563" />
    <path d="M20.4718 2.42157V8.07843H14.8149" stroke="#4B5563" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21.5 12C21.5 11.7239 21.2761 11.5 21 11.5C20.7239 11.5 20.5 11.7239 20.5 12H21.5ZM20.5 12C20.5 16.6944 16.6944 20.5 12 20.5V21.5C17.2467 21.5 21.5 17.2467 21.5 12H20.5ZM12 20.5C8.66336 20.5 5.7748 18.5775 4.38331 15.7775L3.48779 16.2225C5.04171 19.3494 8.26926 21.5 12 21.5V20.5Z" fill="#4B5563" />
    <path d="M3.52832 21.5784V15.9216H9.18517" stroke="#4B5563" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NotificationIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.52992 14.394C2.31727 15.7471 3.268 16.6862 4.43205 17.1542C8.89481 18.9486 15.1052 18.9486 19.5679 17.1542C20.732 16.6862 21.6827 15.7471 21.4701 14.394C21.3394 13.5625 20.6932 12.8701 20.2144 12.194C19.5873 11.2975 19.525 10.3197 19.5249 9.27941C19.5249 5.2591 16.1559 2 12 2C7.84413 2 4.47513 5.2591 4.47513 9.27941C4.47503 10.3197 4.41272 11.2975 3.78561 12.194C3.30684 12.8701 2.66061 13.5625 2.52992 14.394Z" stroke="#4B5563" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 21C9.79613 21.6219 10.8475 22 12 22C13.1525 22 14.2039 21.6219 15 21" stroke="#4B5563" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-white flex items-center justify-between px-6 shrink-0" style={{ height: '88px', padding: '16px 24px' }}>
      <div className="flex flex-col gap-2.5">
        <h1 className="text-[22px] font-medium leading-6 text-black">{title}</h1>
        {subtitle && (
          <div className="flex items-center gap-2">
            {subtitle.split('•').map((part, i, arr) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-sm font-light text-[#4B5563] leading-5">{part.trim()}</span>
                {i < arr.length - 1 && <span className="w-1 h-1 rounded-full bg-[#4B5563] opacity-40" />}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        {/* Icon buttons */}
        <div className="flex items-start gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors">
            {RefreshIcon}
          </button>
          <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors">
            {NotificationIcon}
            <span
              className="absolute rounded-full"
              style={{
                width: '10px',
                height: '10px',
                top: '6px',
                right: '6px',
                background: '#0F47F2',
                border: '1px solid #FFFFFF',
              }}
            />
          </button>
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            <img
              className="w-full h-full object-cover"
              alt="User profile avatar"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
            />
          </div>
          <ChevronDown className="w-5 h-5 text-[#0F47F2]" />
        </div>
      </div>
    </header>
  );
}
