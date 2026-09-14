// Kiểu dữ liệu cho một dòng tin tức chứng khoán (giống bảng trong ảnh mẫu)
export interface NewsItem {
  id: string;
  date: string; // dd/mm/yyyy
  tickers: string[]; // Mã CK liên quan, vd ["VIC", "FPT"]
  summary: string; // Tóm tắt nội dung tin
  source: string; // vnexpress.net, cafef.vn, thanhnien.vn...
  sourceUrl?: string;
  category: "Ngành" | "Doanh nghiệp" | "Vĩ mô" | "Thị trường";
}

// Dữ liệu tổng hợp của một ngày
export interface DailyNewsSet {
  date: string; // yyyy-mm-dd (dùng làm key)
  generatedAt: string; // ISO timestamp lúc gọi Gemini
  headline: string; // vd "8 tin mới đáng chú ý — PVS · FPT · VIC."
  items: NewsItem[];
}

// Thông tin cơ bản + phân tích của một mã CK
export interface StockProfile {
  symbol: string;
  companyName: string;
  exchange: string; // HOSE, HNX, UPCOM
  industry: string;
  summary: string; // Mô tả doanh nghiệp ngắn gọn
  keyMetrics: {
    label: string;
    value: string;
  }[]; // vd P/E, P/B, vốn hóa, EPS...
  recentNews: {
    date: string;
    summary: string;
    source: string;
    sourceUrl?: string;
  }[];
  analysis: {
    strengths: string[];
    risks: string[];
    outlook: string; // nhận định trung lập, KHÔNG phải khuyến nghị mua/bán
  };
  disclaimer: string;
  generatedAt: string;
}

export interface GenerateNewsResult {
  ok: boolean;
  data?: DailyNewsSet;
  error?: string;
}

export interface GenerateStockResult {
  ok: boolean;
  data?: StockProfile;
  error?: string;
}
