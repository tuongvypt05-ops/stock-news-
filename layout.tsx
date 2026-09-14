import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Bảng tin Chứng khoán Việt Nam",
  description:
    "Tổng hợp tin tức chứng khoán hằng ngày và tra cứu thông tin mã cổ phiếu, được tổng hợp tự động bằng AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen text-gray-800">
        <NavBar />
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        <footer className="max-w-5xl mx-auto px-4 py-8 text-xs text-gray-400">
          Dữ liệu được tổng hợp tự động bằng AI từ các nguồn tin công khai. Chỉ mang
          tính tham khảo, không phải khuyến nghị đầu tư.
        </footer>
      </body>
    </html>
  );
}
