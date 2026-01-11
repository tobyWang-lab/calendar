# Simple Calendar App — Implementation Plan

## 概要
此計畫嚴格遵循 `speckit.constitution` 與 `speckit.spec.md` 的要求：採用 Vanilla JS + date-fns、單頁應用（SPA）、TDD 流程（Vitest / Playwright），支援台灣時區（預設 2026-01-10）、暗黑/淺色模式、台灣農曆/節日標記，並部署為靜態網站（GitHub Pages）。

---

## 高階里程碑
1. 規劃與任務分解（完成）
2. 建立 repo 結構與開發工具（ESLint, Vite, Vitest, Playwright）
3. 實作核心日期工具（TDD：date-utils）
4. 實作週視圖（TDD 驗證渲染與互動）
5. 實作月視圖（TDD 驗證渲染與互動）
6. UI/UX 與可及性修飾（暗黑/淺色、鍵盤、ARIA）
7. PWA 與離線策略（manifest + service worker）
8. CI（GitHub Actions）與部署到 GitHub Pages
9. Bundle 優化與產出檢查（<100KB）
10. 最終驗收（Vitest 100% 覆蓋、Playwright E2E 通過）

---

## 週期與優先順序
- Sprint 長度：每個里程碑以 1 週小 sprint 為基準（可依實際進度調整）。
- 優先順序：日期工具 → 基礎視圖（週）→ 月視圖 → UI/UX → PWA → CI/Deploy。

---

## 主要任務（階段性拆解）
1. 建立 repo 結構與工具（Dev setup）
   - `index.html`, `style.css`, `script.js`, `resource/`
   - 初始化 Vite（dev server + build）、ESLint、Vitest、Playwright
   - 建立 `package.json` 與基本 script（但不安裝套件直至實作階段）
2. TDD：date-utils
   - 撰寫 `tests/date-utils.spec.js`（startOfWeek, endOfWeek, isSameDay, isInRange, formatTWDate）
   - 實作 `src/utils/date-utils.js`，使用 `date-fns`，遵守週起始日為 Monday
3. TDD：view-state 與切換
   - `tests/view-state.spec.js`（切換保留選中日期與焦點）
   - 實作視圖切換器（`src/view-switcher.js`）與 localStorage state
4. 實作週視圖（週起始日 Monday）
   - 完成 7 天格線渲染，支援事件時段與整日事件
   - 手機友好的橫向滾動呈現
   - Playwright E2E 驗證（切換到週視圖 → 檢查 DOM）
5. 實作月視圖
   - 月曆格（含上/下月灰色填補）、事件摘要 +N 提示
   - Playwright E2E 驗證（切換到月視圖 → 檢查 DOM）
6. UI/UX + 可及性
   - 暗黑/淺色模式（儲存至 localStorage）、鍵盤捷鍵、ARIA 與焦點管理
7. PWA 與離線考量
   - `manifest.json`、`service-worker.js`（基本資產快取）
   - 規劃離線事件儲存（若選用）
8. 測試覆蓋與 CI
   - Vitest coverage 必達 100%（針對邏輯模組）
   - Playwright E2E 至少覆蓋 core flows
   - GitHub Actions 流程：lint → test (coverage) → e2e → build → deploy
9. 最終優化（大小、效能）
   - Bundle 分析與壓縮，確保 gzipped < 100KB（或依 spec 定義）

---

## 交付成果（短期/中期）
- `plan.md`, `data-model.md`, `architecture.md`（含 Mermaid 圖）
- `index.html`, `style.css`, `script.js`（骨架）
- `src/utils/date-utils.js` 與相應 Vitest 測試
- Playwright E2E 測試套件（核心場景）
- GitHub Actions workflow（lint/test/build/deploy）

---

## 風險與緩解
- 依賴/版本衝突：僅依賴 `date-fns`，避免多套件造成大小爆增。
- 測試覆蓋 100% 的成本高：優先指定必須覆蓋的邏輯模組（日期處理、view state、storage），對 DOM 渲染以 E2E 驗證補強。
- Bundle <100KB 可能需要經過數次優化：採用 esbuild 或 Vite 的 build（minify）並移除多餘 polyfills。

---

## 下一步（我會執行的）
- 把 `plan.md`, `data-model.md`, `architecture.md` 新增到專案（已完成）。
- 建立 TODO 列表並標記「建立 repo 結構與工具」為 in-progress（已標記）。

如需我將任務細分成 GitHub issues（含標籤、估點）或直接開始第一個實作（TDD 設定），請下達指令。