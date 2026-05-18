interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subText?: string;
  color?: "blue" | "green" | "red" | "yellow";
}

const colorMap = {
  blue: "border-blue-500 bg-blue-50",
  green: "border-green-500 bg-green-50",
  red: "border-red-500 bg-red-50",
  yellow: "border-yellow-500 bg-yellow-50",
};

const valueColorMap = {
  blue: "text-blue-700",
  green: "text-green-700",
  red: "text-red-700",
  yellow: "text-yellow-700",
};

export default function KpiCard({ title, value, unit, subText, color = "blue" }: KpiCardProps) {
  return (
    <div className={`rounded-xl border-l-4 p-5 shadow-sm ${colorMap[color]}`}>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="mt-2 flex items-end gap-1">
        <span className={`text-3xl font-bold ${valueColorMap[color]}`}>{value}</span>
        {unit && <span className="mb-1 text-sm text-gray-500">{unit}</span>}
      </div>
      {subText && <p className="mt-1 text-xs text-gray-400">{subText}</p>}
    </div>
  );
}
