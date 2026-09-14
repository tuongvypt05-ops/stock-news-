import Link from "next/link";

export default function NavBar() {
  return (
    <header className="border-b border-brand-100 bg-white sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-brand-700 text-lg">
          📈 Bảng tin CK
        </Link>
        <nav className="flex gap-4 text-sm font-medium">
          <Link href="/tin-tuc" className="text-brand-600 hover:text-brand-700">
            Tin tức hằng ngày
          </Link>
          <Link href="/tra-cuu" className="text-brand-600 hover:text-brand-700">
            Tra cứu mã CK
          </Link>
        </nav>
      </div>
    </header>
  );
}
