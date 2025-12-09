interface EventLegendProps {
  className?: string;
}

const legendItems = [
  { label: 'First Round', color: 'bg-[#FFB800]' },
  { label: 'Face to Face Round', color: 'bg-[#8535EB]' },
  { label: 'HR Round', color: 'bg-[#2FD08D]' },
  { label: 'F2F1', color: 'bg-[#348AEF]' },
];

export const EventLegend = ({ className = '' }: EventLegendProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {legendItems.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 bg-white rounded-md px-3 py-2.5"
        >
          <div className={`w-0.5 h-6 ${item.color} rounded-full`} />
          <span className="text-lg font-medium text-gray-600">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};
