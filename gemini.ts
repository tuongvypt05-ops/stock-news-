import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DailyNewsSet, StockProfile } from "./types";

// Lấy API key từ biến môi trường (đặt trong .env.local, KHÔNG commit lên git)
function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Thiếu GEMINI_API_KEY trong biến môi trường. Xem hướng dẫn trong README.md"
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

// Model hỗ trợ Google Search grounding để lấy tin tức thời sự thực tế
// (không chỉ dựa vào dữ liệu huấn luyện cũ của model)
function getGroundedModel() {
  const genAI = getClient();
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    tools: [{ googleSearch: {} } as any],
  });
}

function extractJson(text: string): any {
  // Gemini đôi khi bọc JSON trong ```json ... ``` — cần loại bỏ trước khi parse
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Không tìm thấy JSON hợp lệ trong phản hồi từ Gemini");
  }
  const jsonStr = cleaned.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonStr);
}

/**
 * Gọi Gemini (có Google Search grounding) để tổng hợp tin tức chứng khoán
 * Việt Nam trong ngày, tương tự bảng "8 tin mới đáng chú ý" trong ảnh mẫu.
 */
export async function generateDailyNews(
  dateStr: string
): Promise<DailyNewsSet> {
  const model = getGroundedModel();

  const prompt = `Bạn là trợ lý tổng hợp tin tức thị trường chứng khoán Việt Nam.
Hãy tìm kiếm và tổng hợp 6-10 tin tức chứng khoán/kinh tế Việt Nam đáng chú ý nhất
trong ngày ${dateStr} (hoặc phiên giao dịch gần nhất nếu ${dateStr} không có dữ liệu),
từ các nguồn uy tín như vnexpress.net, cafef.vn, thanhnien.vn, vietstock.vn, tinnhanhchungkhoan.vn.

Với mỗi tin, xác định:
- Ngày (dd/mm/yyyy)
- Các mã cổ phiếu liên quan (mã CK 3 ký tự viết hoa, có thể nhiều mã)
- Tóm tắt ngắn gọn, súc tích, có số liệu cụ thể nếu có
- Nguồn (tên miền, vd vnexpress.net)
- Link nguồn nếu có
- Loại tin: "Ngành", "Doanh nghiệp", "Vĩ mô", hoặc "Thị trường"

Trả lời DUY NHẤT bằng JSON theo đúng cấu trúc sau, không thêm văn bản nào khác,
không dùng markdown code fence:

{
  "headline": "câu tiêu đề ngắn tóm tắt các tin nổi bật nhất, kèm vài mã CK tiêu biểu",
  "items": [
    {
      "date": "dd/mm/yyyy",
      "tickers": ["ABC", "XYZ"],
      "summary": "nội dung tóm tắt",
      "source": "tenmien.vn",
      "sourceUrl": "https://...",
      "category": "Ngành"
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = extractJson(text);

  const items = (parsed.items || []).map((it: any, idx: number) => ({
    id: `${dateStr}-${idx}`,
    date: it.date || dateStr,
    tickers: Array.isArray(it.tickers) ? it.tickers : [],
    summary: it.summary || "",
    source: it.source || "",
    sourceUrl: it.sourceUrl || undefined,
    category: it.category || "Thị trường",
  }));

  return {
    date: dateStr,
    generatedAt: new Date().toISOString(),
    headline: parsed.headline || "Tin tức chứng khoán trong ngày",
    items,
  };
}

/**
 * Gọi Gemini để tra cứu thông tin cơ bản + phân tích một mã cổ phiếu.
 * Lưu ý: phần "outlook" luôn trung lập, không đưa khuyến nghị mua/bán trực tiếp.
 */
export async function generateStockProfile(
  symbol: string
): Promise<StockProfile> {
  const model = getGroundedModel();
  const upperSymbol = symbol.trim().toUpperCase();

  const prompt = `Bạn là trợ lý phân tích cổ phiếu Việt Nam. Hãy tìm kiếm thông tin mới nhất
về mã cổ phiếu "${upperSymbol}" niêm yết trên sàn chứng khoán Việt Nam (HOSE/HNX/UPCOM).

Tìm các thông tin sau:
- Tên đầy đủ công ty, sàn niêm yết, ngành nghề
- Mô tả ngắn gọn về hoạt động kinh doanh
- Các chỉ số cơ bản gần nhất nếu tìm được: giá hiện tại, vốn hóa, P/E, P/B, EPS, ROE
- 3-5 tin tức gần đây nhất liên quan đến mã này
- Điểm mạnh, rủi ro hiện tại dựa trên tin tức và tình hình kinh doanh
- Nhận định triển vọng trung lập (KHÔNG đưa ra khuyến nghị "nên mua" hay "nên bán" trực tiếp,
  chỉ trình bày các yếu tố để người đọc tự đánh giá)

Trả lời DUY NHẤT bằng JSON theo đúng cấu trúc sau, không thêm văn bản nào khác,
không dùng markdown code fence:

{
  "companyName": "Tên công ty",
  "exchange": "HOSE",
  "industry": "Ngành nghề",
  "summary": "Mô tả ngắn gọn",
  "keyMetrics": [
    { "label": "Giá hiện tại", "value": "xx.xxx đ" },
    { "label": "Vốn hóa", "value": "xx tỷ đ" },
    { "label": "P/E", "value": "xx" },
    { "label": "P/B", "value": "xx" },
    { "label": "EPS", "value": "xx" },
    { "label": "ROE", "value": "xx%" }
  ],
  "recentNews": [
    { "date": "dd/mm/yyyy", "summary": "...", "source": "tenmien.vn", "sourceUrl": "https://..." }
  ],
  "analysis": {
    "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
    "risks": ["rủi ro 1", "rủi ro 2"],
    "outlook": "nhận định trung lập, khách quan"
  }
}

Nếu không tìm được dữ liệu chính xác cho một trường, ghi "Không có dữ liệu" thay vì bịa số liệu.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = extractJson(text);

  return {
    symbol: upperSymbol,
    companyName: parsed.companyName || "Không có dữ liệu",
    exchange: parsed.exchange || "Không có dữ liệu",
    industry: parsed.industry || "Không có dữ liệu",
    summary: parsed.summary || "",
    keyMetrics: Array.isArray(parsed.keyMetrics) ? parsed.keyMetrics : [],
    recentNews: Array.isArray(parsed.recentNews) ? parsed.recentNews : [],
    analysis: {
      strengths: parsed.analysis?.strengths || [],
      risks: parsed.analysis?.risks || [],
      outlook: parsed.analysis?.outlook || "",
    },
    disclaimer:
      "Thông tin do AI tổng hợp tự động từ nguồn công khai, chỉ mang tính tham khảo, " +
      "KHÔNG phải khuyến nghị đầu tư. Vui lòng kiểm chứng lại trước khi ra quyết định " +
      "và cân nhắc tham khảo ý kiến chuyên gia tài chính có chứng chỉ hành nghề.",
    generatedAt: new Date().toISOString(),
  };
}
