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
    *   **字體大小**: 在 `style` 屬性中，可以調整 `fontSize`。目前設定為：英文/恐龍模式 `4rem`，注音模式由 `ZhuyinWord` 組件控制。

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

## 3. 通用調整建議

*   **響應式設計 (Responsive Design)**: 兩個遊戲都包含 `@media` 查詢，針對手機直式 (Portrait) 與橫式 (Landscape) 有不同的樣式設定。若需調整手機版面，請搜尋 CSS 檔案中的 `@media` 區塊。
*   **字體單位**: 建議使用 `rem` 或 `clamp()` 函數，以確保在不同裝置上都有良好的閱讀體驗。
