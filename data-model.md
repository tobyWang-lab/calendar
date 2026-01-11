# Data Model — Simple Calendar App

## 主要資料結構

### 事件（Event）
- 屬性：
  - `id` (string) — 唯一識別
  - `title` (string)
  - `start` (ISO 8601 string, e.g., `2026-01-10T09:00:00+08:00`)
  - `end` (ISO 8601 string)
  - `allDay` (boolean)
  - `meta` (object) — 可擴充（例如 color, location）

樣例：
```json
{
  "id": "evt_1",
  "title": "早會",
  "start": "2026-01-10T09:00:00+08:00",
  "end": "2026-01-10T09:30:00+08:00",
  "allDay": false
}
```

### 應用狀態（AppState） — localStorage
- `state` (object)
  - `view`: `"week" | "month"`
  - `theme`: `"light" | "dark"`
  - `currentDate`: `"YYYY-MM-DD"`（預設 `2026-01-10`）
  - `events`: array of Event objects（可選，或另存 `events` key）

樣例：
```json
{
  "view": "week",
  "theme": "dark",
  "currentDate": "2026-01-10",
  "events": [ /* ... */ ]
}
```

### 農曆與節日資料（lunar-data.json）
- 建議結構為靜態 JSON，內容以年（yyyy）為 key
- 屬性：日期（ISO），節日名稱（繁體中文），類型（國定/農曆）

樣例：
```json
{
  "2026": [
    { "date": "2026-01-01", "name": "元旦", "type": "公定" },
    { "date": "2026-02-10", "name": "除夕", "type": "農曆" }
  ]
}
```

---

## 資料存取層（Storage API）
- `saveState(state)` → 存到 localStorage
- `loadState()` → 讀取並回傳 state（包含預設值）
- `saveEvents(events)` / `loadEvents()` → 事件儲存與讀取

---

## 注意事項
- 時區處理：所有日期採 ISO 格式並含時區 (+08:00)。顯示與計算使用 `date-fns`。
- 資料同步：目前不包含伺服器，同步為未來選項（可設計同步介面）。

以上資料模型可作為後續實作與測試的單位測試基礎。