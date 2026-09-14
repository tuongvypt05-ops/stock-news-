import { NextResponse } from "next/server";
import { generateDailyNews } from "@/lib/gemini";
import { saveDailyNews, todayKey } from "@/lib/store";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Gemini + search có thể mất vài chục giây

async function runUpdate() {
  const dateKey = todayKey();
  const humanDate = new Date().toLocaleDateString("vi-VN");
  const data = await generateDailyNews(humanDate);
  // Chuẩn hoá lại date key nội bộ về yyyy-mm-dd để tra cứu nhất quán
  data.date = dateKey;
  saveDailyNews(data);
  return data;
}

// Vercel Cron gọi bằng GET và tự đính kèm header
// "Authorization: Bearer $CRON_SECRET" nếu biến CRON_SECRET được cấu hình
// trong Project Settings > Environment Variables trên Vercel.
// Xem: https://vercel.com/docs/cron-jobs
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await runUpdate();
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("Lỗi cập nhật tin tức (cron):", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Lỗi không xác định khi gọi Gemini API" },
      { status: 500 }
    );
  }
}

// POST /api/news/update — được gọi khi người dùng bấm nút "Cập nhật" trên giao diện
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await runUpdate();
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("Lỗi cập nhật tin tức:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Lỗi không xác định khi gọi Gemini API" },
      { status: 500 }
    );
  }
}
