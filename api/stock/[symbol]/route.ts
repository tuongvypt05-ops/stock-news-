import { NextResponse } from "next/server";
import { generateStockProfile } from "@/lib/gemini";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET /api/stock/VIC
export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol?.trim();

  if (!symbol || !/^[A-Za-z0-9]{2,6}$/.test(symbol)) {
    return NextResponse.json(
      { ok: false, error: "Mã cổ phiếu không hợp lệ" },
      { status: 400 }
    );
  }

  try {
    const data = await generateStockProfile(symbol);
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("Lỗi tra cứu mã CK:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Lỗi không xác định khi gọi Gemini API" },
      { status: 500 }
    );
  }
}
