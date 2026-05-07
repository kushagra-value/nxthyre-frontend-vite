import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Preset = "Today" | "Last Week" | "Last Month" | "Custom Date";

interface DateRangeFilterProps {
  valueLabel: string;
  isFilterApplied: boolean;
  onApply: (payload: {
    label: string;
    createdAfter?: string;
    createdBefore?: string;
  }) => void;
  onClear: () => void;
}

const formatAsApiDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatAsLabelDate = (date: Date) =>
  date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  valueLabel,
  isFilterApplied,
  onApply,
  onClear,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<Preset>("Today");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const presets: Preset[] = ["Today", "Last Week", "Last Month", "Custom Date"];

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  const daysInMonth = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate(),
    [currentMonth],
  );

  const monthStartOffset = useMemo(() => {
    const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    // JS getDay() is 0 for Sunday
    return day === 0 ? 6 : day - 1; 
  }, [currentMonth]);

  const applyPreset = (preset: Exclude<Preset, "Custom Date">) => {
    const today = new Date();
    const start = new Date(today);
    const end = new Date(today);
    if (preset === "Last Week") start.setDate(today.getDate() - 7);
    if (preset === "Last Month") start.setMonth(today.getMonth() - 1);

    onApply({
      label: preset,
      createdAfter: formatAsApiDate(start),
      createdBefore: formatAsApiDate(end),
    });
    setSelectedPreset(preset);
    setOpen(false);
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
      return;
    }
    if (clickedDate < startDate) {
      setStartDate(clickedDate);
      setEndDate(null);
      return;
    }
    setEndDate(clickedDate);
  };

  const applyCustomRange = () => {
    if (!startDate) return;
    const finalEnd = endDate || startDate;
    onApply({
      label: `${formatAsLabelDate(startDate)} - ${formatAsLabelDate(finalEnd)}`,
      createdAfter: formatAsApiDate(startDate),
      createdBefore: formatAsApiDate(finalEnd),
    });
    setOpen(false);
  };

  const isSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return (
      (startDate && date.getTime() === startDate.getTime()) ||
      (endDate && date.getTime() === endDate.getTime())
    );
  };

  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date > startDate && date < endDate;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#4B5563] bg-white hover:bg-[#F3F5F7] transition-colors"
        title={valueLabel}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1.3335V2.66683M4 1.3335V2.66683" stroke="#374151" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1.6665 8.16216C1.6665 5.25729 1.6665 3.80486 2.50125 2.90243C3.336 2 4.6795 2 7.3665 2H8.63317C11.3202 2 12.6637 2 13.4984 2.90243C14.3332 3.80486 14.3332 5.25729 14.3332 8.16216V8.5045C14.3332 11.4094 14.3332 12.8618 13.4984 13.7642C12.6637 14.6667 11.3202 14.6667 8.63317 14.6667H7.3665C4.6795 14.6667 3.336 14.6667 2.50125 13.7642C1.6665 12.8618 1.6665 11.4094 1.6665 8.5045V8.16216Z" stroke="#374151" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 5.3335H12" stroke="#374151" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        
      </button>

      {open && (
        <div
          className={`absolute right-0 top-full mt-2 bg-white rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden z-20 ${
            selectedPreset === "Custom Date" ? "w-[620px]" : "w-[220px]"
          }`}
        >
          {isFilterApplied && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                setOpen(false);
              }}
              className="absolute top-2 left-2 p-1 rounded-md hover:bg-[#F3F5F7] text-[#6B7280] z-10"
              title="Clear date filter"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="flex">
            <div className={`${selectedPreset === "Custom Date" ? "w-[190px] border-r border-[#E5E7EB]" : "w-full"} p-3`}>
              <div className="flex flex-col gap-1">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      if (preset === "Custom Date") {
                        setSelectedPreset("Custom Date");
                        return;
                      }
                      applyPreset(preset);
                    }}
                    className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedPreset === preset ? "text-[#0F47F2]" : "text-[#71717A] hover:bg-[#F3F5F7]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              {selectedPreset === "Custom Date" && (
                <button
                  onClick={applyCustomRange}
                  disabled={!startDate}
                  className="mt-6 mx-3 px-6 py-2.5 bg-[#0F47F2] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  Apply
                </button>
              )}
            </div>

            {selectedPreset === "Custom Date" && (
              <div className="flex-1 p-5 border-l border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg leading-tight font-medium text-[#4B5563]">
                    {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
                  </span>
                  <div className="flex items-center gap-4 text-[#9CA3AF]">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                      <ChevronLeft className="w-5 h-5 hover:text-[#4B5563] transition-colors" />
                    </button>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                      <ChevronRight className="w-5 h-5 hover:text-[#4B5563] transition-colors" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-y-2">
                  {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((day) => (
                    <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-[#9CA3AF]">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: monthStartOffset }).map((_, idx) => (
                    <div key={`e-${idx}`} className="h-10" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const selected = isSelected(day);
                    const inRange = isInRange(day);
                    return (
                      <div key={day} className="h-10 relative flex items-center justify-center cursor-pointer" onClick={() => handleDateClick(day)}>
                        {inRange && <div className="absolute inset-y-1 left-0 right-0 bg-[#E7EDFF]" />}
                        <div
                          className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            selected ? "bg-[#0F47F2] text-white" : "text-[#4B5563] hover:bg-gray-100 transition-colors"
                          }`}
                        >
                          {String(day).padStart(2, "0")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
