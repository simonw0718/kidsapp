# 格式調整指南 (Format Adjustment Guide)

本指南說明如何調整 KidsApp 中各個遊戲模組的格式、樣式與參數。

## 1. 圖片配對遊戲 (Picture Match)

### 檔案位置：`src/features/picture-match`

#### 1.1 樣式表 (`picture-match.css`)

此檔案控制大部分的視覺呈現。

*   **遊戲版面配置**
    *   `.pm-game-container`: 調整整體遊戲容器的內距 (`padding`) 與對齊方式。
    *   `.pm-card-grid`: 調整選項卡片的網格排列 (`grid-template-columns`) 與間距 (`gap`)。

*   **題目顯示 (Stimulus)**
    *   `.pm-stimulus-card`: 調整題目卡片的內距 (`padding`)、圓角 (`border-radius`) 與陰影 (`box-shadow`)。
    *   `.pm-stimulus-label`: 調整「聽音辨圖/看字辨圖」提示文字的大小 (`font-size`) 與顏色 (`color`)。

*   **選項卡片 (Image Card)**
    *   `.pm-card-grid`: 控制卡片之間的間距。

*   **入口頁面 (Entry Page)**
    *   `.pm-entry-container`: 調整入口頁面的整體間距。
    *   `.pm-entry-title`: 調整標題文字大小與距離。
    *   `.pm-entry-btn`: **[重要]** 調整模式選擇按鈕的尺寸 (`width`, `height`) 與顏色。
        *   `.pm-entry-btn--english`: 英文模式顏色。
        *   `.pm-entry-btn--zhuyin`: 注音模式顏色。
        *   `.pm-entry-btn--dinosaur`: 恐龍模式顏色。

#### 1.2 程式碼組件

*   **`components/StimulusDisplay.tsx`**
    *   **題目字體大小**: 在第 21 行的 `style` 屬性中調整 `fontSize`。
        *   **英文/恐龍模式**: 目前設定為 `3rem`（之前為 `4rem`）
        *   **注音模式**: 目前設定為 `3rem`，由 `ZhuyinWord` 組件控制
        *   **調整方式**: 修改 `fontSize: isEnglishOrDino ? '3rem' : '3rem'` 中的數值
            *   更大字體：使用 `4rem`、`5rem` 等
            *   更小字體：使用 `2rem`、`2.5rem` 等

*   **`components/ImageCard.tsx`**
    *   **卡片背景色**: `getBackgroundColor` 函數定義了正確 (`#D4EDDA`) 與錯誤 (`#F8D7DA`) 的背景顏色。
    *   **卡片比例**: `style` 中的 `aspectRatio` 控制卡片形狀 (目前為 `'1'` 正方形)。
    *   **圖片大小**: `img` 標籤的 `style` 中，`width` 和 `height` 控制圖片在卡片中的佔比 (目前為 `80%`)。
    *   **Emoji 大小**: 當沒有圖片時，Emoji 的 `fontSize` (目前為 `5rem`)。

---

## 2. 珠算遊戲 (Abacus)

### 檔案位置：`src/features/abacus`

#### 2.1 樣式表 (`abacus.css`)

珠算遊戲大量使用 CSS 變數 (CSS Variables) 來統一管理尺寸，方便調整。

*   **全域變數 (位於 `.abacus-play-layout`)**
    *   `--abacus-question-font-size`: 題目文字大小 (例如 5 + 3 = ?)。
    *   `--abacus-option-font-size`: 選項按鈕文字大小。
    *   `--abacus-next-font-size`: 「下一題」按鈕文字大小。
    *   `--abacus-total-font-size`: 右下角總和顯示文字大小。
    *   `--abacus-answer-main-char-size`: 答案顯示區的主字大小。
    *   `--bead-size`: **[重要]** 算盤珠子的大小 (直徑)。
    *   `--bead-gap`: **[核心參數]** 珠子滑動的距離計算公式。

*   **算盤珠子 (`.abacus-row-beads`)**
    *   `--bead-gap`: 控制珠子撥動後的水平位移。
        *   公式：`calc(100cqw - (var(--bead-size) * 13))`
        *   **調整方式**: 修改乘數 `13`。數字越大，珠子撥動後離右邊界越遠 (往左靠)；數字越小，離右邊界越近。

*   **珠子顏色**
    *   `.abacus-row-color-0` ~ `.abacus-row-color-7`: 定義每一排珠子的顏色。

#### 2.2 程式碼組件

*   **`AbacusPlayPage.tsx`**
    *   主要邏輯與佈局結構，樣式主要由 CSS 控制。

---

## 3. iOS PWA 安全區域與邊距設定

### 檔案位置：`src/core/layout/layout.css`

當 App 以 PWA 模式在 iOS 上運行時，需要避免內容被狀態列、瀏海或底部橫條遮住。

#### 3.1 CSS 變數設定（位於 `:root`）

*   **iOS 安全區域變數（自動偵測）**
    *   `--safe-area-top`: 上方安全區域（狀態列高度）
    *   `--safe-area-bottom`: 下方安全區域（底部橫條高度）
    *   `--safe-area-left`: 左側安全區域
    *   `--safe-area-right`: 右側安全區域
    *   **注意**: 這些變數會自動偵測，通常不需要手動修改

*   **頁面邊距設定（可調整）**
    *   `--page-padding-top`: **[重要]** 上方額外間距（目前 `12px`）
        *   調大：內容離頂部更遠，避免被遮住
        *   調小：內容更靠近頂部，節省空間
    *   `--page-padding-horizontal`: **[重要]** 左右間距（目前 `16px`）
        *   調大：內容離左右邊緣更遠，視覺更寬鬆
        *   調小：內容更靠近邊緣，節省空間
    *   `--page-padding-bottom`: 下方額外間距（目前 `12px`）

#### 3.2 頁面容器設定

*   **`.page-container`**
    *   這個 class 控制整個頁面的 padding
    *   自動結合 iOS 安全區域與自訂間距
    *   **調整方式**: 修改上方的 CSS 變數即可，不需要直接修改此 class

*   **`.page-content`**
    *   內容區域的額外內距（目前 `padding: 0 4px 4px`）
    *   已經很小，因為主要間距由 `.page-container` 提供

---

## 4. 通用調整建議

*   **響應式設計 (Responsive Design)**: 兩個遊戲都包含 `@media` 查詢，針對手機直式 (Portrait) 與橫式 (Landscape) 有不同的樣式設定。若需調整手機版面，請搜尋 CSS 檔案中的 `@media` 區塊。
*   **字體單位**: 建議使用 `rem` 或 `clamp()` 函數，以確保在不同裝置上都有良好的閱讀體驗。
*   **iOS PWA 測試**: 修改 safe area 相關設定後，建議在實際 iOS 裝置上以 PWA 模式測試，確保內容不會被系統 UI 遮住。
