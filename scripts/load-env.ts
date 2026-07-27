// tsx 스크립트용 .env 로더 (Next.js 밖에서는 자동 로드가 안 되므로)
import fs from "node:fs";
import path from "node:path";

for (const file of [".env.local", ".env"]) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf-8").split(/\r?\n/)) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!m || line.trim().startsWith("#")) continue;
    const key = m[1];
    const value = m[2].replace(/^["']|["']$/g, "");
    process.env[key] ??= value;
  }
}
