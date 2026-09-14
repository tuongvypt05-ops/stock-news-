"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { StockProfile } from "@/lib/types";

export default function StockLookup() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "";

  const [input, setInput] = useState(initialSymbol);
  const [data, setData] = useState<StockProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(symbol: string) {
    if (!symbol.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/stock/${symbol.trim().toUpperCase()}`);
      const json = await res.json();
      if (json.ok) {
        setData(json.data);
      } else {
        setError(json.error || "Không tra cứu được mã này");
      }
    } catch (e: any) {
      setError("Lỗi kết nối máy chủ: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialSymbol) {
      handleSearch(initialSymbol);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSymbol]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-700 mb-3">
          Tra cứu mã cổ phiếu
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="Nhập mã CK, vd: VIC, FPT, VCB..."
            maxLength={6}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Đang tìm..." : "Tra cứu"}
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm p-4">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-gray-400 text-sm">
          Đang gọi AI tìm kiếm thông tin mới nhất, có thể mất 10-20 giây...
        </p>
      )}

      {data && (
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-2xl font-bold text-brand-700">{data.symbol}</h2>
                <p className="text-gray-600">{data.companyName}</p>
              </div>
              <span className="text-xs text-gray-400">
                {data.exchange} · {data.industry}
              </span>
            </div>
            {data.summary && (
              <p className="text-sm text-gray-600 mt-3">{data.summary}</p>
            )}
          </div>

          {data.keyMetrics.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <h3 className="font-semibold text-gray-700 mb-3">Chỉ số cơ bản</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {data.keyMetrics.map((m) => (
                  <div key={m.label}>
                    <div className="text-xs text-gray-400">{m.label}</div>
                    <div className="font-medium text-gray-800">{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <h3 className="font-semibold text-gray-700 mb-3">Phân tích</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm font-medium text-up mb-1">Điểm mạnh</div>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  {data.analysis.strengths.length > 0 ? (
                    data.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)
                  ) : (
                    <li className="text-gray-400 list-none">Không có dữ liệu</li>
                  )}
                </ul>
              </div>
              <div>
                <div className="text-sm font-medium text-down mb-1">Rủi ro</div>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  {data.analysis.risks.length > 0 ? (
                    data.analysis.risks.map((r, i) => <li key={i}>{r}</li>)
                  ) : (
                    <li className="text-gray-400 list-none">Không có dữ liệu</li>
                  )}
                </ul>
              </div>
            </div>
            {data.analysis.outlook && (
              <div className="bg-brand-50 rounded-lg p-3 text-sm text-brand-700">
                <span className="font-medium">Nhận định: </span>
                {data.analysis.outlook}
              </div>
            )}
          </div>

          {data.recentNews.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <h3 className="font-semibold text-gray-700 mb-3">Tin tức gần đây</h3>
              <ul className="space-y-3">
                {data.recentNews.map((n, i) => (
                  <li key={i} className="text-sm border-b border-gray-50 pb-2 last:border-0">
                    <span className="text-gray-400 mr-2">{n.date}</span>
                    <span className="text-gray-700">{n.summary}</span>
                    {n.sourceUrl ? (
                      <a
                        href={n.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:underline ml-2"
                      >
                        [{n.source}]
                      </a>
                    ) : (
                      <span className="text-gray-400 ml-2">[{n.source}]</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
            ⚠️ {data.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
