# Simple Calendar App — Tasks

此文件基於 `speckit.constitution` 與 `speckit.spec.md`，依 SDD + TDD 流程拆解可執行任務。

> 備註：每個任務包含：任務 ID、標題、說明、預期輸出檔案、依賴任務 ID、是否可平行、對應 Spec/驗收條件編號。

---

## 主要任務清單

### T1 — setup-tooling
- 標題：建立開發環境與工具設定
- 描述：初始化 `package.json`（type: module）、加入 scripts（lint/test/build/dev）、建立 `.gitignore`、並規劃/列舉要安裝的套件（`date-fns`、`vite`、`vitest`、`playwright`、`eslint`）。※實際安裝可在 implement 階段執行
- 預期輸出：`package.json`, `.gitignore`, `README.md`（開發指令說明）
- 依賴：無
- 可平行：否（其他後續工具設定依此規劃）
- 對應 Spec：工具與建置要求（Spec: 測試/CI/Build）

---

### T2 — configure-lint-format
- 標題：設定 ESLint 與程式碼風格
- 說明：建立 `.eslintrc.js` 與建議的 Prettier 規則，加入 npm script `lint`，以確保程式碼品質。
- 預期輸出：`.eslintrc.js`, `.prettierrc` (選用)
- 依賴：T1
- 可平行：是（可與測試/Playwright 設定並行）
- 對應 Spec：程式碼品質（constitution: ESLint、可讀與一致風格）

---

### T3 — setup-vitest
- 標題：建立 Vitest 設定與基礎測試環境
- 說明：建立 `vitest.config.js`、加入 `tests/` 目錄與範例測試 runner script（`npm test`）。
- 預期輸出：`vitest.config.js`, `tests/`（空目錄或範例）
- 依賴：T1
- 可平行：是
- 對應 Spec：TDD 與 100% 單元測試策略（spec acceptance）

---

### T4 — setup-playwright
- 標題：建立 Playwright E2E 測試設定
- 說明：新增 `playwright.config.js` 與 `tests/e2e` 範例檔案，定義環境（Chromium），並撰寫第一個 smoke test 模板。
- 預期輸出：`playwright.config.js`, `tests/e2e/`（範例）
- 依賴：T1
- 可平行：是
- 對應 Spec：E2E 規格（Playwright）

---

### T5 — setup-vite
- 標題：建立 Vite 開發與生產構建設定（建置 stubs）
- 說明：建立 `vite.config.js` 與基本 `index.html`、`src/` 結構（空的入口），以便快速啟動開發伺服器與建置流程。
- 預期輸出：`vite.config.js`, `index.html`, `src/`（空檔案）
- 依賴：T1
- 可平行：是
- 對應 Spec：建置與最終 bundle 優化需求

---

### T6 — define-date-utils-tests
- 標題：為日期計算撰寫 Vitest 測試（TDD）
- 說明：撰寫 `tests/date-utils.spec.js` 測試：`getCurrentWeekMonday(date)`、`startOfWeek`、`endOfWeek`（週起始為 Monday）、`isSameDay`、`isInRange`、`formatTWDate`（臺灣顯示格式 / 時區處理）。
- 預期輸出：`tests/date-utils.spec.js`
- 依賴：T3
- 可平行：部分可與 T2/T4 並行
- 對應 Spec：Spec AC #1, #3（週起始 Monday、日期正確性）

---

### T7 — implement-date-utils
- 標題：實作 `date-utils` 模組以通過測試
- 說明：實作 `src/utils/date-utils.js`（使用 `date-fns`，確保處理時區 +08:00 與週起始 Monday），包含單元測試覆蓋所有邏輯。
- 預期輸出：`src/utils/date-utils.js`, 測試全部通過 & coverage（目標：邏輯層 100%）
- 依賴：T6
- 可平行：否（須等測試定義完成後 TDD 實作）
- 對應 Spec：Spec AC #1, #3, #9（測試覆蓋）

---

### T8 — define-view-state-tests
- 標題：撰寫視圖狀態與切換的單元測試
- 說明：建立 `tests/view-state.spec.js`，測試 `view` 狀態切換、`currentDate` 保留、焦點保存、localStorage 交互（讀/寫）。
- 預期輸出：`tests/view-state.spec.js`
- 依賴：T3, T7
- 可平行：是（在 date-utils 穩定後可進行）
- 對應 Spec：Spec AC #2, #5, #7（視圖切換、導航、localStorage）

---

### T9 — implement-view-state
- 標題：實作 View Controller（state 管理）
- 說明：`src/view-controller.js` 或在 `script.js` 模組化實作視圖狀態管理，包含 localStorage 保存/還原、事件通知給 renderer。
- 預期輸出：`src/view-controller.js`, 單元測試通過
- 依賴：T8, T7
- 可平行：部分可平行（UI CSS 可同時進行）
- 對應 Spec：Spec AC #2, #5, #7

---

### T10 — build-week-view-ui
- 標題：建立週視圖骨架（HTML + CSS）匹配 `./resource/week_calendar.jpg`
- 說明：在 `index.html` 與 `style.css` 建置週視圖布局（7 天、時間軸直向格線），用 CSS Grid/Flex 實現響應。需在 desktop/mobile 下符合 spec 的行為（手機橫向滑動或壓縮版式）。
- 預期輸出：`index.html`, `style.css`（含 week view 樣式、對應圖示按鈕）
- 依賴：T9
- 可平行：否（需與 view-state 整合測試）
- 對應 Spec：Spec AC #2, #3, UI 視覺對齊要求

---

### T11 — write-week-renderer-tests
- 標題：撰寫週視圖渲染與事件顯示的單元測試
- 說明：`tests/week-renderer.spec.js`，測試事件位置計算、整日事件顯示、在小螢幕中的行為。
- 預期輸出：`tests/week-renderer.spec.js`
- 依賴：T7, T9
- 可平行：是（可與 T10 部分並行）
- 對應 Spec：Spec AC #3（週視圖事件），Spec AC #4（事件顯示）

---

### T12 — implement-week-view-renderer
- 標題：實作週視圖渲染器
- 說明：`src/renderers/week-renderer.js`，負責將 events 與時間軸對齊輸出成 DOM，包含觸發事件點擊開啟日事件列表的交互。
- 預期輸出：`src/renderers/week-renderer.js`, 對應測試通過
- 依賴：T10, T11
- 可平行：否
- 對應 Spec：Spec AC #3, #4

---

### T13 — build-month-view-ui
- 標題：建立月視圖骨架（HTML + CSS）匹配 `./resource/month_calendar.jpg`
- 說明：在 `index.html` 與 `style.css` 加入月視圖格子樣式（7xN）、上/下月灰色填補、格內事件摘要顯示規則（最多 3 條，超過顯示 `+N`）。
- 預期輸出：`index.html`, `style.css`（含 month view 樣式）
- 依賴：T9
- 可平行：部分可與 week-view work 並行
- 對應 Spec：Spec AC #4

---

### T14 — write-month-renderer-tests
- 標題：撰寫月視圖渲染測試
- 說明：`tests/month-renderer.spec.js`：確保格子計算、跨月日期顯示、`+N` 摘要行為。
- 預期輸出：`tests/month-renderer.spec.js`
- 依賴：T7, T9
- 可平行：是
- 對應 Spec：Spec AC #4

---

### T15 — implement-month-view-renderer
- 標題：實作月視圖渲染器
- 說明：`src/renderers/month-renderer.js`：依照測試產生正確 DOM 與事件摘要，包含點擊格子展示當日事件列表。
- 預期輸出：`src/renderers/month-renderer.js`, 對應測試通過
- 依賴：T13, T14
- 可平行：否
- 對應 Spec：Spec AC #4

---

### T16 — wire-view-switcher
- 標題：連接週/月按鈕與視圖切換邏輯
- 說明：將 header 左上兩個 icon 按鈕連結到 view-state（T9），確保切換保留選中日期與焦點狀態。
- 預期輸出：更新 `script.js` 或 `src/controller.js`，整合測試通過
- 依賴：T9, T10, T13
- 可平行：否
- 對應 Spec：Spec AC #2

---

### T17 — persist-state-localstorage
- 標題：實作 localStorage 保持 `view`、`theme`、`currentDate`
- 說明：`src/storage.js`：`saveState()`、`loadState()`、`saveEvents()`、`loadEvents()`，包含測試。
- 預期輸出：`src/storage.js`, 單元測試
- 依賴：T9
- 可平行：是
- 對應 Spec：Spec AC #5, #7

---

### T18 — implement-theme-toggle
- 標題：暗黑/淺色模式切換（並儲存在 localStorage）
- 說明：UI 控制（按鈕）、CSS 變數（light/dark），以及保存到 localStorage 的行為，包含測試。
- 預期輸出：`style.css`（theme rules）、`src/ui-theme.js`, 單元測試
- 依賴：T17
- 可平行：是
- 對應 Spec：Spec AC #7

---

### T19 — add-accessibility-and-keybindings
- 標題：鍵盤捷鍵與可及性強化
- 說明：加入 `T` (回今日)、`W`/`M` 切換視圖、Tab 導覽、Enter 激活、方向鍵移動日期與 ARIA 屬性與焦點管理，並撰寫對應測試。
- 預期輸出：`src/keybindings.js`, ARIA attributes in `index.html`, 單元/整合測試
- 依賴：T9, T16, T17, T18
- 可平行：否
- 對應 Spec：Spec AC #6

---

### T20 — events-crud-tests
- 標題：為事件新增/編輯/刪除撰寫測試
- 說明：測試 `addEvent`, `editEvent`, `deleteEvent` 的行為與儲存（localStorage），並驗證週/月視圖的更新。
- 預期輸出：`tests/events.spec.js`
- 依賴：T3, T7
- 可平行：是
- 對應 Spec：Spec AC #4（事件顯示與互動）

---

### T21 — implement-events-crud
- 標題：建立事件 CRUD 的 UI 與儲存
- 說明：簡單的事件表單（新增/編輯/刪除），與在週/月視圖中即時反映變更。
- 預期輸出：`src/events.js`, 對應單元測試
- 依賴：T20, T12, T15
- 可平行：否
- 對應 Spec：Spec AC #4

---

### T22 — pwa-manifest-sw
- 標題：加入 PWA 基本檔案（manifest.json 與 service-worker）
- 說明：提供基本資產快取策略（offline fallback），確保安裝提示與基本離線載入（完整離線功能為進階項目）。
- 預期輸出：`manifest.json`, `service-worker.js`
- 依賴：T12, T15 (UI 已穩定)
- 可平行：是
- 對應 Spec：PWA 要求

---

### T23 — write-playwright-specs
- 標題：撰寫完整 Playwright E2E 規格
- 說明：包含：初始載入 → 確認今日高亮（2026-01-10）→ 切換週/月 → 導航 previous/next → 回到今日熱鍵 → 主題持久化 → 基本 PWA 註冊檢查（mock）。
- 預期輸出：`tests/e2e/*.spec.js`
- 依賴：T4, T12, T15, T17, T18
- 可平行：否
- 對應 Spec：Spec AC #1, #2, #5, #6, #7, PWA

---

### T24 — bundle-size-check
- 標題：建置並驗證 bundle 大小 (<100KB)
- 說明：透過 Vite/esbuild 建置並撈取 gzip size，加入 CI 的檢查步驟。若超出限制，評估並移除大型資源或做 code-splitting。
- 預期輸出：build outputs (`dist/`), 檢查腳本
- 依賴：T5, T12, T15
- 可平行：是
- 對應 Spec：效能/大小限制

---

### T25 — setup-ci-gh-pages
- 標題：建立 GitHub Actions 流水線（lint → test → e2e → build → deploy）
- 說明：`/.github/workflows/ci.yml` 包含所有 job 並在 `main` branch 或 tag 時部署到 GH Pages。coverage 門檻（Vitest）設為不低於要求（可依 spec 設 100% 邏輯覆蓋）。
- 預期輸出：`.github/workflows/ci.yml`
- 依賴：T2, T3, T4, T22, T23
- 可平行：否
- 對應 Spec：CI 與部署（constitution）

---

### T26 — final-review-and-deploy
- 標題：最終檢查、PR 與部署
- 說明：確認所有測試/coverage/E2E 通過，檢查可及性與效能報告，合併與部署到 GitHub Pages。
- 預期輸出：部署成功的 gh-pages 網站與 Release notes
- 依賴：T25, T24
- 可平行：否
- 對應 Spec：最終驗收、部署要求

---

## 進度/併行策略建議
- 第一步必須完成 T1（setup tooling）才可可靠地執行測試與 CI。之後可同時進行 T2/T3/T4/T5 的設定工作（平行但建議先完成測試 runner T3）。
- 以 T6~T9（邏輯層測試與實作）為核心序列；在邏輯穩定後（T7 通過），同時啟動週視圖與月視圖的 UI 與渲染相關任務（T10~T15）以提高效率。
- Playwright 規格（T23）應在 UI 與核心互動穩定後執行，以避免大量 E2E 修正成本。

---

如需我把上述任務逐一建立為 GitHub Issues（含標籤、估點、指派），或把某些任務先標記為 in-progress，請告訴我哪幾項，我會在下一步執行。