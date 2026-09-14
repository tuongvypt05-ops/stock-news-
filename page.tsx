import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-10">
        <h1 className="text-3xl font-bold text-brand-700 mb-3">
          Bảng tin Chứng khoán Việt Nam
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Tổng hợp tin tức chứng khoán mỗi ngày và tra cứu thông tin, phân tích cơ bản
          của từng mã cổ phiếu — dữ liệu được AI tổng hợp tự động từ các nguồn uy tín.
        </p>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/tin-tuc"
          className="rounded-xl border border-brand-100 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-2">🗞️</div>
          <h2 className="font-semibold text-lg mb-1">Tin tức hằng ngày</h2>
          <p className="text-sm text-gray-500">
            Bảng tổng hợp tin tức chứng khoán, phân theo ngày, mã CK, nguồn và loại tin.
          </p>
        </Link>
        <Link
          href="/tra-cuu"
          className="rounded-xl border border-brand-100 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-2">🔍</div>
          <h2 className="font-semibold text-lg mb-1">Tra cứu mã CK</h2>
          <p className="text-sm text-gray-500">
            Nhập mã cổ phiếu để xem thông tin cơ bản, chỉ số tài chính và phân tích.
          </p>
        </Link>
      </section>
    </div>
  );
}
