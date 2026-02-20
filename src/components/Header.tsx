import { RefreshCw, Bell, ChevronDown } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-20 bg-transparent flex items-center justify-between px-10 shrink-0">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-neutral-800">{title}</h1>
        {subtitle && <p className="text-xs text-neutral-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-6">
        <button className="p-2 text-neutral-400 hover:bg-white rounded-full transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
        <button className="relative p-2 text-neutral-400 hover:bg-white rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-[#F8F9FB]"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
          <div className="size-10 rounded-full bg-neutral-200 overflow-hidden border-2 border-white shadow-sm">
            <img
              className="w-full h-full object-cover"
              alt="User profile avatar"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
            />
          </div>
          <ChevronDown className="w-5 h-5 text-neutral-400" />
        </div>
      </div>
    </header>
  );
}
