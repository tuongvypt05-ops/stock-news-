const COLORS: Record<string, string> = {
  "Ngành": "bg-blue-50 text-blue-700",
  "Doanh nghiệp": "bg-purple-50 text-purple-700",
  "Vĩ mô": "bg-amber-50 text-amber-700",
  "Thị trường": "bg-green-50 text-green-700",
};

export default function CategoryBadge({ category }: { category: string }) {
  const cls = COLORS[category] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {category}
    </span>
  );
}
