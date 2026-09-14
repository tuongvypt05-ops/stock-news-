import fs from "fs";
import path from "path";
import type { DailyNewsSet } from "./types";

// Lưu mỗi ngày thành 1 file JSON trong thư mục data/
// Đơn giản, không cần setup database, phù hợp cho quy mô cá nhân/nhóm nhỏ.
// Nếu deploy lên Vercel: filesystem là "read-only" ở runtime production
// (trừ /tmp), nên xem README.md phần "Lưu trữ trên Vercel" để biết cách
// chuyển sang Vercel KV / Blob nếu cần lưu vĩnh viễn.

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePathFor(dateKey: string) {
  return path.join(DATA_DIR, `news-${dateKey}.json`);
}

export function saveDailyNews(data: DailyNewsSet) {
  ensureDataDir();
  fs.writeFileSync(filePathFor(data.date), JSON.stringify(data, null, 2), "utf-8");
}

export function loadDailyNews(dateKey: string): DailyNewsSet | null {
  const p = filePathFor(dateKey);
  if (!fs.existsSync(p)) return null;
  try {
    const raw = fs.readFileSync(p, "utf-8");
    return JSON.parse(raw) as DailyNewsSet;
  } catch {
    return null;
  }
}

export function listAvailableDates(): string[] {
  ensureDataDir();
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.startsWith("news-") && f.endsWith(".json"))
    .map((f) => f.replace("news-", "").replace(".json", ""))
    .sort((a, b) => (a < b ? 1 : -1)); // mới nhất trước
}

export function todayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
