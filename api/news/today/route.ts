import { NextResponse } from "next/server";
import { loadDailyNews, todayKey, listAvailableDates } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET /api/news/today?date=2026-09-14 (date query optional, mặc định hôm nay)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateKey = searchParams.get("date") || todayKey();

  const data = loadDailyNews(dateKey);
  const availableDates = listAvailableDates();

  if (!data) {
    return NextResponse.json(
      {
        ok: false,
        error: "Chưa có dữ liệu cho ngày này. Bấm 'Cập nhật tin mới nhất' để tải.",
        availableDates,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, data, availableDates });
}
