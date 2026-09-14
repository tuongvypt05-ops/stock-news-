import { Suspense } from "react";
import StockLookup from "@/components/StockLookup";

export default function TraCuuPage() {
  return (
    <Suspense fallback={<p className="text-gray-400 text-sm">Đang tải...</p>}>
      <StockLookup />
    </Suspense>
  );
}
