interface ProgressItem {
  label: string;
  score: number; // 0-100
  description?: string; // e.g. "Excellent", "Good", "Strong", "Average"
  color?: "green" | "blue" | "orange" | "red";
}

interface QuickFitSummaryProgressProps {
  items: ProgressItem[];
}

export default function QuickFitSummaryProgress({
  items,
}: QuickFitSummaryProgressProps) {
  const getColorStyles = (color: string = "blue") => {
  const barColors: Record<string, string> = {
    green: "#14ae5c",
    blue: "#0F47F2",
    orange: "#F59E0B",
    red: "#EF4444",
  };

  return {
    bar: barColors[color] || "#0F47F2",
    background: "#F0F4FF", // fixed blue background for all cards
    label: barColors[color] || "#0F47F2",
  };
};

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item, index) => {
        const colors = getColorStyles(item.color);
        return (
          <div
            key={index}
            className="p-2 rounded-lg transition-all"
            style={{ backgroundColor: colors.background }}
          >
            {/* Label */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
                {item.label}
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: colors.label }}
              >
                {item.score}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className=" h-2 rounded-full overflow-hidden bg-white/50">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(item.score, 100)}%`,
                  backgroundColor: colors.bar,
                }}
              />
            </div>

            {/* Description */}
            {item.description && (
              <span
                className="text-xs font-medium"
                style={{ color: colors.label }}
              >
                {item.description}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
