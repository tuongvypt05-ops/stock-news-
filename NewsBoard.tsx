"use client";

import { useEffect, useState } from "react";
import type { DailyNewsSet } from "@/lib/types";
import CategoryBadge from "./CategoryBadge";

export default function NewsBoard() {
  const [data, setData] = useState<DailyNewsSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  async function fetchNews(dateKey?: string) {
    setLoading(true);
    setError(null);
    try {
      const url = dateKey ? `/api/news/today?date=${dateKey}` : "/api/news/today";
      const res = await fetch(url);
      const json = await res.json();
      setAvailableDates(json.availableDates || []);
      if (json.ok) {
        setData(json.data);
      } else {
        setData(null);
        setError(json.error || "Không tải được dữ liệu");
      }
    } catch (e: any) {
      setError("Lỗi kết nối máy chủ: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    setUpdating(true);
    setError(null);
    try {
      const res = await fetch("/api/news/update", { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setData(json.data);
        fetchNews(); // refresh danh sách ngày có sẵn
      } else {
        setError(json.error || "Cập nhật thất bại");
      }
    } catch (e: any) {
      setError("Lỗi kết nối máy chủ: " + e.message);
    } finally {
      setUpdating(false);
    }
  }

  useEffect(() => {
    fetchNews(selectedDate || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-brand-700">
            {data?.headline || "Tin tức chứng khoán trong ngày"}
          </h1>
          {data && (
            <p className="text-xs text-gray-400 mt-1">
              Cập nhật lúc: {new Date(data.generatedAt).toLocaleString("vi-VN")}
            </p>
          )}
        </div>
        <button
          onClick={handleUpdate}
          disabled={updating}
          className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {updating ? "Đang cập nhật..." : "🔄 Cập nhật tin mới nhất"}
        </button>
      </div>

      {availableDates.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-gray-400 py-1">Xem theo ngày:</span>
          {availableDates.slice(0, 14).map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`px-2 py-1 rounded border ${
                d === (selectedDate || availableDates[0])
                  ? "bg-brand-600 text-white border-brand-600"
                  : "border-gray-200 text-gray-500 hover:border-brand-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {loading && <p className="text-gray-400 text-sm">Đang tải dữ liệu...</p>}

      {error && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm p-4">
          {error}
        </div>
      )}

      {!loading && data && data.items.length === 0 && (
        <p className="text-gray-400 text-sm">Chưa có tin nào cho ngày này.</p>
      )}

      {!loading && data && data.items.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-50 text-left text-brand-700">
                <th className="px-3 py-2 font-medium whitespace-nowrap">Ngày</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">Mã CK</th>
                <th className="px-3 py-2 font-medium">Tóm tắt thông tin</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">Nguồn</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">Loại tin</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr
                  key={item.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-3 py-3 align-top whitespace-nowrap text-gray-500">
                    {item.date}
                  </td>
                  <td className="px-3 py-3 align-top whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {item.tickers.map((t) => (
                        <a
                          key={t}
                          href={`/tra-cuu?symbol=${t}`}
                          className="text-brand-600 font-medium hover:underline"
                        >
                          {t}
                        </a>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top text-gray-700 max-w-xl">
                    {item.summary}
                  </td>
                  <td className="px-3 py-3 align-top whitespace-nowrap">
                    {item.sourceUrl ? (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:underline"
                      >
                        {item.source}
                      </a>
                    ) : (
                      <span className="text-gray-500">{item.source}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 align-top whitespace-nowrap">
                    <CategoryBadge category={item.category} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
