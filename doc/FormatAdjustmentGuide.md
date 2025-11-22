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
    *   `.pm-entry-options`: **[重要]** 控制模式選擇按鈕的排列方式。
        *   預設 (桌面): 2x2 網格排列
        *   直式 (手機/平板): 2x2 網格排列，`gap: 16px`
        *   橫式 (手機/平板): 1x3 單行排列，`gap: 12px`，使用 `aspect-ratio` 和 `max-height: 50vh` 防止重疊
    *   `.pm-entry-btn`: **[重要]** 調整模式選擇按鈕的尺寸。
        *   預設: `width: 280px`, `height: 280px`
        *   直式: `aspect-ratio: 1`, `max-width: 180px`
        *   橫式: `aspect-ratio: 1`, `max-height: 50vh`
        *   `.pm-entry-btn--english`: 英文模式顏色 (綠色)。
        *   `.pm-entry-btn--zhuyin`: 注音模式顏色 (橘色)。
        *   `.pm-entry-btn--dinosaur`: 恐龍模式顏色 (紫色)。
    
    *   **Ready Go 圖片 (開場動畫)**
        *   `.pm-start-image`: **[重要]** 調整開場圖片的大小 (`max-width`)。
            *   預設 (桌面/平板): `400px`
            *   手機直向: `280px` (位於 `@media (max-width: 480px)` 區塊內)

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
    *   **翻牌動畫 (英文模式專用)**:
        *   **翻牌速度**: 在 `transition` 中調整 `transform 0.6s`，數值越大翻牌越慢
        *   **背面背景色**: `.pm-card-face--back` 的 `backgroundColor: '#FFF9E6'` (淡黃色)
        *   **背面圓角**: `.pm-card-face--back` 的 `borderRadius: '24px'`
        *   **翻牌後字體大小**: `.pm-card-face--back` 的 `fontSize: '3rem'` (第 111 行)
            *   **調整方式**: 修改 `'3rem'` 為其他數值
            *   更大字體：`'4rem'`、`'5rem'`
            *   更小字體：`'2rem'`、`'2.5rem'`
            *   此參數控制翻牌後國字與注音的整體大小

*   **`components/ZhuyinWord.tsx`** (翻牌背面顯示的中文+注音)
    *   **字與字之間的間距**: 第 23 行 `gap: '20px'`
        *   調整方式：修改 `'20px'` 為其他數值，如 `'15px'`、`'25px'`
    *   **對齊方式**: 第 24 行 `alignItems: 'baseline'`
        *   `baseline`: 國字與注音基線對齊
        *   `center`: 垂直置中對齊

#### 1.3 注音符號樣式 (BpmWord)

**檔案位置**: `src/core/layout/layout.css` (第 261-319 行)

*   **國字大小**: `.bpm-main-char`
    *   `font-size: 1em` - 跟隨父層字體大小
    *   `font-weight: 700` - 字體粗細
    *   **調整方式**: 修改 `font-size` 為 `1.2em`、`0.9em` 等

*   **注音符號大小**: `.bpm-column`
    *   `font-size: 0.45em` - 注音符號相對於國字的大小 (約 45%)
    *   `margin-left: 0.15em` - 國字與注音的間距
    *   **調整方式**: 
        *   更大注音：改為 `0.5em`、`0.55em`
        *   更小注音：改為 `0.4em`、`0.35em`

*   **聲調符號 (ˊˇˋ)**: `.bpm-tone`
    *   `font-size: 1.3em` - 調號大小
    *   `font-weight: 900` - 調號粗細
    *   `color: #d32f2f` - 調號顏色 (紅色)
    *   `right: -0.8em` - 調號在注音右側的距離
    *   **調整方式**:
        *   更大調號：改 `font-size` 為 `1.5em`
        *   不同顏色：改 `color` 為 `#FF5722`、`#000` 等
        *   調整位置：改 `right` 為 `-1em`、`-0.6em`

*   **輕聲符號 (˙)**: `.bpm-tone-dot`
    *   `font-size: 1.3em` - 輕聲大小
    *   `font-weight: 900` - 輕聲粗細
    *   `color: #d32f2f` - 輕聲顏色 (紅色)
    *   `top: -1em` - 輕聲在注音上方的距離

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

## 3. 注音符號調號設定 (Zhuyin Tone Marks)

### 檔案位置：`src/core/layout/layout.css`

注音符號的調號（˙ˊˇˋ）顯示設定，影響整個 App 中所有注音的調號外觀。

*   **`.bpm-tone`** - 一般調號（ˊˇˋ）
    *   `font-size: 1.3em` - **[調整]** 調號大小（相對於注音符號）
    *   `font-weight: 900` - **[調整]** 調號粗細（100-900，數字越大越粗）
    *   `color: #d32f2f` - **[調整]** 調號顏色（目前為紅色，可改為其他顏色如 `#000` 黑色）
    *   `right: -0.8em` - **[調整]** 調號與注音的水平間距

*   **`.bpm-tone-dot`** - 輕聲調號（˙）
    *   `font-size: 1.3em` - **[調整]** 輕聲大小
    *   `font-weight: 900` - **[調整]** 輕聲粗細
    *   `color: #d32f2f` - **[調整]** 輕聲顏色
    *   `top: -1em` - **[調整]** 輕聲與注音的垂直間距

**調整建議**：
*   若調號太大：將 `font-size` 改為 `1.1em` 或 `1em`
*   若調號太粗：將 `font-weight` 改為 `700` 或 `600`
*   若想改顏色：修改 `color` 值（例如 `#0066cc` 藍色、`#000000` 黑色）

---

## 4. iOS PWA 安全區域與邊距設定

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

## 4. 動物指令大冒險 (Animal Commands)

### 檔案位置：`src/features/animal-commands/animal-commands.css`

#### 4.1 版面結構說明

**桌面版 (Desktop)**: 左右分欄（地圖區 + 控制區）  
**手機直向 (Mobile Portrait)**: 上下分欄（地圖在上，控制在下）  
**手機橫向 (Mobile Landscape)**: 左右分欄（地圖在左，控制在右）

#### 4.1.1 入口頁面 (Entry Page) 手機版調整

*   **`.ac-entry-container`** - 入口頁面容器
    *   **手機版**: `gap: 12px` - **[重要]** 整體間距（原本 24px）
    *   **手機版**: `padding: 8px` - 容器內距（原本 16px）
    *   **手機版**: `justify-content: flex-start` - 從頂部開始排列，避免標題被遮住

*   **`.ac-entry-visual`** - Emoji 視覺元素
    *   **手機版**: `gap: 12px` - emoji 間距（原本 16px）
    *   **手機版**: `margin-bottom: 8px` - 下方間距（原本 16px）

*   **`.ac-entry-emoji`** - Emoji 大小
    *   **手機版**: `font-size: 36px` - **[重要]** emoji 大小（原本 48px）

*   **`.ac-entry-subtitle`** - 副標題
    *   **手機版**: `font-size: 15px` - 文字大小（原本 18px）

*   **`.ac-mode-grid`** - 模式選擇網格
    *   **手機版**: `grid-template-columns: 1fr` - 單欄顯示
    *   **手機版**: `gap: 10px` - **[重要]** 卡片間距（原本 16px）

*   **`.ac-mode-card`** - 模式選擇卡片
    *   **手機版**: `padding: 12px` - **[重要]** 卡片內距（原本 20px）
    *   **手機版**: `gap: 4px` - 內部元素間距（原本 8px）
    *   **手機版**: `border-radius: 12px` - 圓角（原本 16px）
    *   **手機版**: `border-width: 2px` - 邊框粗細（原本 3px）

*   **模式卡片文字大小調整**:
    *   `.ac-mode-number`: `font-size: 12px`（原本 14px）
    *   `.ac-mode-name`: `font-size: 16px`（原本 18px）
    *   `.ac-mode-desc`: `font-size: 13px`（原本 14px）
    *   `.ac-mode-info`: `font-size: 11px`（原本 12px）

#### 4.2 整體佈局調整

*   **`.ac-game-layout`** - 遊戲主容器
    *   **桌面版**: `gap: 20px` - 左右面板間距，`padding: 12px` - 整體內距
    *   **手機直向**: `gap: 8px` - **[調整]** 上下面板間距，減少間距以節省空間
    *   **手機橫向**: `gap: 6px` - 左右面板間距，`padding: 4px` - 整體內距

*   **`.ac-left-panel`** - 地圖區域
    *   **手機直向**: 
        *   `flex: 0 0 auto` - **[重要]** 不伸縮，固定大小
        *   `max-height: 45vh` - **[重要]** 地圖最大高度，確保地圖有足夠空間
        *   `min-height: 200px` - **[重要]** 最小高度確保地圖可見
        *   `overflow: visible` - **[重要]** 允許地圖完整顯示
    *   **手機橫向**: `max-width: 45vw` - **[重要]** 地圖最大寬度（原本 48vw）
    *   **平板直向**: `max-height: 45vh` - 地圖最大高度（原本 50vh）

*   **`.ac-right-panel`** - 控制區域
    *   **桌面版**: `width: 320px` - **[重要]** 右側面板固定寬度
    *   **手機直向**: 
        *   `flex: 0 1 auto` - **[重要]** 可縮小但不擴張（防止控制區佔據過多空間）
        *   `max-height: 50vh` - **[重要]** 限制最大高度，防止控制區過大
        *   `overflow-y: auto` - **[重要]** 允許垂直捲動
        *   ⚠️ **注意**: 絕對不要設定 `flex: 1`，這會導致控制區佔據所有剩餘空間！

*   **`.ac-command-section`** - 指令區容器
    *   **手機直向**:
        *   `height: auto` - **[重要]** 自動高度而非 100%
        *   `max-height: 100%` - 限制最大高度

*   **`.ac-sequence-wrapper`** - 序列包裝器
    *   **手機直向**:
        *   `flex: 0 1 auto` - **[重要]** 可縮小但不擴張
        *   ⚠️ **注意**: 不要設定 `flex: 1`，會導致佈局問題！

#### 4.2.1 模式 1/2 控制按鈕佈局（直接控制模式）

*   **`.dc-buttons`** - 直接控制按鈕容器
    *   **手機直向**:
        *   `display: grid` - **[重要]** 使用 Grid 佈局
        *   `grid-template-columns: repeat(2, 1fr)` - **[重要]** 2 欄佈局（橫向排列）
        *   `gap: 8px` - 按鈕間距
        *   **效果**: 前進、左轉、右轉、跳躍按鈕排列成 2x2 格子

#### 4.2.2 模式 3/4 指令區佈局（指令序列模式）

*   **`.ac-palette`** - 指令按鈕區
    *   **手機直向**:
        *   `display: flex` - **[重要]** 使用 Flex 佈局
        *   `flex-direction: row` - **[重要]** 橫向排列
        *   `overflow-x: auto` - **[重要]** 允許橫向捲動
        *   `gap: 8px` - 按鈕間距
        *   `flex-shrink: 0` - **[重要]** 防止被壓縮
        *   **效果**: 指令按鈕橫向排列，可左右捲動

*   **`.ac-sequence-container`** - 指令序列容器
    *   **手機直向**:
        *   `flex: 1` - **[重要]** 佔據剩餘空間
        *   `max-height: 25vh` - **[重要]** 限制最大高度
        *   **效果**: 序列區佔據適當空間，不會過大

*   **`.ac-sequence-list`** - 指令序列列表
    *   **手機直向**:
        *   `display: flex` - **[重要]** 使用 Flex 佈局
        *   `flex-direction: row` - **[重要]** 橫向排列
        *   `overflow-x: auto` - **[重要]** 允許橫向捲動
        *   `gap: 4px` - 序列格子間距
        *   **效果**: 指令序列橫向排列，可左右捲動

*   **`.ac-sequence-wrapper`** - 序列與控制按鈕包裝器
    *   **手機直向**:
        *   `flex-direction: column-reverse` - **[重要]** 指令序列在上、控制按鈕在下
        *   ⚠️ **注意**: 不要改為 `column`，會導致順序錯誤！

#### 4.2.3 模式 1/2 與模式 3/4 獨立控制

**重要**: 模式 1/2 和模式 3/4 現在可以獨立調整，不會互相影響！

*   **`.ac-right-panel.ac-mode-direct`** - 模式 1/2 專用（直接控制）
    *   **手機直向**:
        *   `max-height: 30vh` - **[可調整]** 控制區最大高度，調整此數值來控制綠色區塊大小
        *   建議範圍：20vh ~ 40vh
    *   **手機橫向**:
        *   `max-width: 35vw` - **[可調整]** 控制區最大寬度，調整此數值來控制綠色區塊寬度
        *   建議範圍：30vw ~ 40vw
    *   **iPad 直向**:
        *   `max-height: 40vh` - **[可調整]** 控制區最大高度
        *   建議範圍：30vh ~ 50vh

*   **`.ac-right-panel.ac-mode-sequence`** - 模式 3/4 專用（指令序列）
    *   使用預設的 `max-height: 50vh` 限制
    *   保持完整的指令區和序列區顯示

**調整範例**：
```css
/* 手機直向 - 如果模式 1/2 綠色區域太大 */
@media (orientation: portrait) and (max-width: 768px) {
    .ac-right-panel.ac-mode-direct {
        max-height: 25vh;  /* 減小高度，原本 30vh */
    }
}

/* 手機橫向 - 如果模式 1/2 綠色區域太寬 */
@media (orientation: landscape) and (max-height: 500px) {
    .ac-right-panel.ac-mode-direct {
        max-width: 30vw;   /* 減小寬度，原本 35vw */
    }
}

/* iPad 直向 - 如果模式 1/2 綠色區域太大 */
@media (orientation: portrait) and (min-width: 769px) and (max-width: 1024px) {
    .ac-right-panel.ac-mode-direct {
        max-height: 35vh;  /* 減小高度，原本 40vh */
    }
}

/* 如果模式 3/4 指令區被壓縮，可以增加高度 */
@media (orientation: portrait) and (max-width: 768px) {
    .ac-right-panel.ac-mode-sequence {
        max-height: 55vh;  /* 增加最大高度，原本 50vh */
    }
}
```

## 5. 動物指令大冒險按鈕尺寸調整指南

### 5.1 模式 1/2 直接控制按鈕

**檔案位置**: `src/features/animal-commands/components/direct-control-panel.css`

#### 按鈕整體大小
```css
.dc-btn {
    padding: 8px;              /* [可調整] 按鈕內距 - 影響按鈕大小 */
    min-height: 60px;          /* [可調整] 按鈕最小高度 */
    border-radius: 12px;       /* [可調整] 按鈕圓角 */
}
```

#### 圖示大小
```css
.dc-btn-icon {
    font-size: 32px;           /* [可調整] emoji 圖示大小 */
    width: 56px;               /* [可調整] 圖示容器寬度 */
    height: 56px;              /* [可調整] 圖示容器高度 */
}
```

#### 文字大小
```css
.dc-btn-label {
    font-size: 24px;           /* [可調整] 按鈕文字大小 */
}
```

#### 綠色框（面板邊框）
```css
.dc-panel {
    border: 2px solid #81c784; /* [可調整] 綠色邊框寬度 */
    border-radius: 16px;       /* [可調整] 面板圓角 */
    background: #e8f5e9;       /* [可調整] 背景顏色 */
    padding: 8px;              /* [可調整] 面板內距 */
}
```

#### 左側彩色邊框
```css
.dc-btn-forward {
    border-left: 6px solid #4caf50;  /* [可調整] 前進按鈕左側綠色邊框 */
}
.dc-btn-left, .dc-btn-right {
    border-left: 6px solid #2196f3;  /* [可調整] 左轉/右轉按鈕左側藍色邊框 */
}
```

### 5.2 模式 3/4 指令按鈕

**檔案位置**: `src/features/animal-commands/components/command-palette.css`

#### 按鈕整體大小
```css
.ac-command-btn {
    padding: 8px;              /* [可調整] 按鈕內距 - 影響按鈕大小 */
    min-width: 48px;           /* [可調整] 按鈕最小寬度 */
    min-height: 48px;          /* [可調整] 按鈕最小高度 */
    border-radius: 10px;       /* [可調整] 按鈕圓角 */
}
```

#### 圖示大小
```css
.ac-cmd-icon {
    font-size: 28px;           /* [可調整] emoji 圖示大小 */
}
```

#### 黃框（指令區邊框）
```css
.ac-palette {
    border: 2px solid #ffe0b2; /* [可調整] 黃框邊框寬度 */
    border-radius: 12px;       /* [可調整] 指令區圓角 */
    background: #fff3e0;       /* [可調整] 背景顏色 */
    padding: 8px;              /* [可調整] 指令區內距 */
}
```

#### 左側彩色邊框
```css
.ac-btn-forward {
    border-left: 4px solid #4caf50;  /* [可調整] 前進按鈕左側綠色邊框 */
}
.ac-btn-left, .ac-btn-right {
    border-left: 4px solid #2196f3;  /* [可調整] 左轉/右轉按鈕左側藍色邊框 */
}
.ac-btn-jump {
    border-left: 4px solid #ff9800;  /* [可調整] 跳躍按鈕左側橘色邊框 */
}
```

### 5.3 開始執行 / 重置按鈕

**檔案位置**: `src/features/animal-commands/components/control-panel.css`

#### 按鈕整體大小
```css
.ac-control-btn {
    padding: 8px 16px;         /* [可調整] 按鈕內距 - 影響按鈕寬高 */
    font-size: 14px;           /* [可調整] 按鈕文字大小 */
    border-radius: 999px;      /* [可調整] 圓角大小 - 999px 為完全圓角 */
    gap: 4px;                  /* [可調整] 圖示與文字間距 */
}
```

#### 按鈕間距
```css
.ac-controls {
    gap: 6px;                  /* [可調整] 按鈕之間的間距 */
    padding: 4px;              /* [可調整] 容器內距 */
}
```

#### 按鈕顏色
```css
.ac-btn-start {
    background: linear-gradient(135deg, #4caf50, #2e7d32);  /* [可調整] 開始執行按鈕 - 綠色漸層 */
}
.ac-btn-reset {
    background: #757575;       /* [可調整] 重置按鈕 - 灰色 */
}
```

## 6. 裝置特定調整說明

### 6.1 iPhone 直式 (Portrait)

**媒體查詢**: `@media (orientation: portrait) and (max-width: 768px)`

**檔案位置**: `src/features/animal-commands/animal-commands.css` (約 520-670 行)

#### 地圖尺寸
```css
.ac-left-panel {
    max-height: 40vh;          /* [可調整] 地圖區最大高度 */
    min-height: 180px;         /* [可調整] 地圖區最小高度 */
}

.ac-grid-container {
    max-width: 75vw;           /* [可調整] 地圖最大寬度 */
    max-height: 75vw;          /* [可調整] 地圖最大高度 */
    padding: 4px;              /* [可調整] 地圖內距 */
}

.ac-grid-cell {
    min-width: 24px;           /* [可調整] 格子最小寬度 */
    min-height: 24px;          /* [可調整] 格子最小高度 */
}
```

#### 控制區高度
```css
.ac-right-panel {
    max-height: 50vh;          /* [可調整] 控制區最大高度 */
}

.ac-sequence-container {
    max-height: 25vh;          /* [可調整] 序列區最大高度 */
}
```

### 6.2 iPhone 橫式 (Landscape)

**媒體查詢**: `@media (orientation: landscape) and (max-height: 500px)`

**檔案位置**: `src/features/animal-commands/animal-commands.css` (約 672-760 行)

#### 地圖尺寸
```css
.ac-grid-container {
    height: 75vh;              /* [可調整] 地圖高度 */
    width: 75vh;               /* [可調整] 地圖寬度 - 保持正方形 */
    padding: 4px;              /* [可調整] 地圖內距 */
}
```

#### 面板寬度
```css
.ac-left-panel {
    max-width: 45vw;           /* [可調整] 地圖區最大寬度 */
}

.ac-right-panel {
    max-width: 40vw;           /* [可調整] 控制區最大寬度 - 防止被裁切 */
}
```

⚠️ **重要**: 如果橫向模式右側被裁切，請減小 `.ac-right-panel` 的 `max-width` 值（例如從 40vw 改為 38vw）

### 6.3 iPad 直式 (Portrait)

**媒體查詢**: `@media (orientation: portrait) and (min-width: 769px) and (max-width: 1024px)`

**檔案位置**: `src/features/animal-commands/animal-commands.css` (約 809-900 行)

#### 地圖尺寸
```css
.ac-left-panel {
    max-height: 45vh;          /* [可調整] 地圖區最大高度 */
}

.ac-grid-container {
    max-width: 60vw;           /* [可調整] 地圖最大寬度 */
    max-height: 60vw;          /* [可調整] 地圖最大高度 */
    padding: 8px;              /* [可調整] 地圖內距 */
}

.ac-grid-cell {
    min-width: 40px;           /* [可調整] 格子最小寬度 */
    min-height: 40px;          /* [可調整] 格子最小高度 */
}

.ac-grid-item {
    font-size: 32px;           /* [可調整] 地圖物件大小 */
}
```

#### 控制區高度
```css
.ac-right-panel {
    max-height: 50vh;          /* [可調整] 控制區最大高度 */
}

.ac-sequence-container {
    max-height: 25vh;          /* [可調整] 序列區最大高度 */
}
```

### 6.4 iPad 橫式 (Landscape)

**媒體查詢**: 使用桌面版佈局

**檔案位置**: `src/features/animal-commands/animal-commands.css` (約 672-760 行，與 iPhone 橫式相同)

#### 地圖尺寸
```css
.ac-grid-container {
    height: 75vh;              /* [可調整] 地圖高度 */
    width: 75vh;               /* [可調整] 地圖寬度 */
}
```

#### 面板寬度
```css
.ac-right-panel {
    max-width: 40vw;           /* [可調整] 控制區最大寬度 */
}
```

## 7. 常見調整場景

### 場景 1: 按鈕太大，想縮小
1. 減少 `padding` 值（例如從 8px 改為 6px）
2. 減少 `min-width` 和 `min-height` 值
3. 減少 `font-size` 值

### 場景 2: 圖示太小，看不清楚
1. 增加 `.dc-btn-icon` 或 `.ac-cmd-icon` 的 `font-size` 值
2. 增加圖示容器的 `width` 和 `height` 值

### 場景 3: 地圖被壓縮，控制區太大
1. 增加 `.ac-left-panel` 的 `max-height` 值
2. 減少 `.ac-right-panel` 的 `max-height` 值
3. 減少 `.ac-sequence-container` 的 `max-height` 值

### 場景 4: iPad 橫向右側被裁切
1. 減少 `.ac-right-panel` 的 `max-width` 值（例如從 40vw 改為 38vw 或 35vw）
2. 減少 `.ac-left-panel` 的 `max-width` 值

### 場景 5: 想要更大的邊框
1. 增加 `border` 或 `border-left` 的寬度值
2. 例如從 `2px` 改為 `3px` 或 `4px`

        *   `gap: 6px` - 格子間距
    *   **手機直向**:
        *   `max-width: 75vw` - **[調整]** 地圖最大寬度（原本 80vw）
        *   `max-height: 75vw` - **[調整]** 地圖最大高度（原本 80vw）
        *   `padding: 6px` - **[調整]** 地圖內距（原本 8px）
        *   `gap: 2px` - **[調整]** 格子間距（原本 3px）
    *   **手機橫向**:
        *   `max-width: 40vh` - **[調整]** 地圖最大寬度（原本 45vh）
        *   `max-height: 75vh` - **[調整]** 地圖最大高度（原本 80vh）
        *   `padding: 6px` - 地圖內距
        *   `gap: 2px` - 格子間距

*   **`.ac-grid-cell`** - 單個格子
    *   **桌面版**: `min-width: 55px`, `min-height: 55px` - **[調整]** （原本 60px）
    *   **平板直向**: `min-width: 45px`, `min-height: 45px` - **[調整]** （原本 50px）
    *   **手機直向**: `min-width: 25px`, `min-height: 25px` - **[調整]** （原本 28px）
    *   **手機橫向**: `min-width: 24px`, `min-height: 24px` - **[調整]** （原本 25px）

*   **`.ac-grid-item`** - 地圖物件（兔子🐰、紅蘿蔔🥕、石頭🪨）
    *   **桌面版**: `font-size: 42px` - **[調整]** （原本 48px）
    *   **平板直向**: `font-size: 36px` - **[調整]** （原本 40px）
    *   **手機直向**: `font-size: clamp(16px, 4vw, 24px)` - **[調整]** （原本 18-24px）
    *   **手機橫向**: `font-size: clamp(16px, 3.5vh, 22px)` - **[調整]** （原本 18-24px）
    *   **注意**: 此 font-size 僅控制 emoji 物件（🥕🪨）的大小，不影響角色圖片

*  ### 3. 橫向模式版面優化 (Landscape Layout Optimization)

針對手機與平板的橫向模式，我們優化了工具列的排列方式，以節省垂直空間並避免按鈕被遮擋。

**相關檔案：**
- `src/features/animal-commands/components/command-palette.css`
- `src/features/animal-commands/components/command-sequence.css`
- `src/features/animal-commands/animal-commands.css`

**主要調整：**

1.  **指令按鈕 (Command Palette)**：
    -   改為 **2欄 (2 columns)** 網格排列。
    -   CSS: `grid-template-columns: repeat(2, 1fr);`

2.  **指令序列 (Command Sequence)**：
    -   改為 **5欄 (5 columns)** 網格排列。
    -   CSS: `grid-template-columns: repeat(5, 1fr);`

3.  **iPad 橫向適配**：
    -   調整了右側控制面板的寬度與高度限制。
    -   **[調整]** 縮小了左右面板的間距 (`gap: 8px`)，讓操作區更貼近地圖。

**CSS 範例 (animal-commands.css)：**
```css
/* [平板與桌面橫向] Tablet & Desktop Landscape */
@media (min-width: 768px) and (orientation: landscape) {
    .ac-game-layout {
        gap: 8px; /* [調整] 縮小間距 */
        /* ... */
    }
}
```

### 4. 全站縮放鎖定 (Global Zoom Lock)

為了防止小朋友誤觸導致畫面縮放，我們採用了雙重鎖定機制：

1.  **HTML Meta Tag (`index.html`)**: `<meta name="viewport" ... user-scalable=no">` (針對移動端瀏覽器)
2.  **React Hook (`useGameLock`)**: 在遊戲頁面組件中調用此 Hook，動態設定 `body` 樣式。

```typescript
// src/core/hooks/useGameLock.ts
export const useGameLock = () => {
    useEffect(() => {
        document.body.style.touchAction = 'none'; // 禁止手勢
        document.body.style.overflow = 'hidden';  // 禁止捲動
        // ... (防止多指觸控縮放)
    }, []);
};
```

### 5. CSS 架構說明 (CSS Architecture)

為了避免樣式衝突與層級混亂，我們採用了 **"Layout vs Component"** 的分離策略：

*   **`animal-commands.css` (Layout Controller)**:
    *   負責所有 **佈局 (Layout)** 設定：`display: grid/flex`, `width`, `height`, `gap`, `padding`。
    *   包含 **預設佈局 (Default Layout)** 與 **響應式佈局 (Responsive Layout)**。
    *   **規則**：所有決定 "元件在哪裡" 或 "元件多大" 的 CSS 都在這裡。

*   **Component CSS (`command-palette.css`, etc.)**:
    *   負責元件 **內部 (Internal)** 樣式：顏色、字體、邊框、陰影、按鈕內部排列。
    *   **規則**：絕不包含 `display: flex/grid` (除非是按鈕內部的 icon 排列), `width`, `height`, `margin`。

**修改指引：**
*   若要調整 **按鈕顏色** 或 **字體大小** -> 去 Component CSS。
*   若要調整 **面板寬度**、**排列方式 (Grid/Flex)** -> 去 `animal-commands.css`。
    *   **角色圖片大小調整** - 兔子/恐龍圖片
        *   檔案: `src/features/animal-commands/components/GridMap.tsx`
        *   位置: 第 79-80 行的 `style` 屬性
        *   目前設定: `width: 'clamp(20px, 8vmin, 80px)'`, `height: 'clamp(20px, 8vmin, 80px)'`
        *   **重要**: 使用 `vmin` 單位（視窗寬高中較小者的百分比），確保在不同螢幕尺寸下都能正確縮放
        *   調整方式:
            *   增大角色: 將 `80px` 改為更大的值（例如 `100px` 或 `120px`）
            *   縮小角色: 將 `80px` 改為更小的值（例如 `60px` 或 `50px`）
            *   調整響應式大小: 修改 `8vmin` 為更大（如 `10vmin`）或更小（如 `6vmin`）的值
            *   最小尺寸: 調整 `20px` 來控制最小顯示大小

#### 4.4 控制區域調整

*   **`.ac-command-section`** - 指令區容器（Mode 3-4 使用）
    *   `gap: 8px` - **[調整]** 指令區內部間距（原本 12px）

*   **`.ac-sequence-wrapper`** - 指令序列包裝器
    *   `gap: 8px` - **[調整]** 序列與控制面板間距（原本 12px）

#### 4.5 教學提示調整

*   **`.ac-tutorial-bubble`** - 教學提示氣泡
    *   **桌面版**: `font-size: 16px`, `padding: 12px 16px`, `margin-top: 12px`
    *   **手機直向**: `font-size: 12px`, `padding: 4px 8px`, `margin-top: 4px` - **[調整]**
    *   **手機橫向**: `font-size: 11px`, `padding: 2px 6px`, `margin-top: 2px` - **[調整]**

#### 4.6 響應式斷點 (Breakpoints)

*   **手機直向**: `@media (orientation: portrait) and (max-width: 768px)`
*   **手機橫向**: `@media (orientation: landscape) and (max-height: 500px)`
*   **平板直向**: `@media (orientation: portrait) and (min-width: 769px) and (max-width: 1024px)`
*   **桌面版**: `@media (min-width: 1025px)`

### 5. 首頁 (HomePage) 佈局調整

位於 `src/core/layout/layout.css`：

*   **`.home-game-grid`** - 遊戲選單網格
    *   **預設**: `max-width: 800px`, `gap: 16px`
    *   **iPad 橫向**: `max-width: 640px` **[調整]**, `gap: 32px` **[調整]**, `padding: 0 48px` **[調整]**
    *   *說明：為了避免在 iPad 橫向模式下卡片過大造成重疊，限制了最大寬度並增加了間距。*

### 6. 文字與圖示調整 (Text & Icons)

若需要修改按鈕上的文字（如「前進」、「左轉」）或圖示（如 ⬆️, ↩️），請參考以下檔案：

*   **模式 1 & 2 (直接控制)**:
    *   檔案: `src/features/animal-commands/components/DirectControlPanel.tsx`
    *   搜尋 `getIcon` 函式修改圖示。
    *   搜尋 `getLabel` 函式修改文字。

*   **模式 3 & 4 (指令序列)**:
    *   檔案: `src/features/animal-commands/components/CommandPalette.tsx`
    *   搜尋 `getIcon` 函式修改圖示。
    *   搜尋 `getLabel` 函式修改文字。

*   **程式碼中已標記 `// [修改]` 註解方便搜尋。**

> [!IMPORTANT]
> **注意：** `direct-control-panel.css` 檔案底部有 `@media (max-width: 768px)` 區塊，這是針對手機與平板的設定。如果您修改了上方的數值卻發現手機上沒變化，請檢查底部的這個區塊，這裡的數值會覆蓋上方的設定。

#### 4.7 常見調整情境

**地圖太小**:
1. 增加 `.ac-grid-container` 的 `max-width` 和 `max-height`
2. 增加 `.ac-grid-cell` 的 `min-width` 和 `min-height`
3. 增加 `.ac-grid-item` 的 `font-size`

**地圖太大（超出螢幕）**:
1. 減少 `.ac-left-panel` 的 `max-height`（直向）或 `max-width`（橫向）
2. 減少 `.ac-grid-container` 的 `max-width` 和 `max-height`
3. 減少 `.ac-grid-container` 的 `padding`

**控制區太擠**:
1. 增加 `.ac-command-section` 的 `gap`
2. 增加 `.ac-sequence-wrapper` 的 `gap`
3. 調整 `.ac-right-panel` 的 `width`（桌面版）

---

## 5. 通用調整建議

*   **響應式設計 (Responsive Design)**: 所有遊戲都包含 `@media` 查詢，針對手機直式 (Portrait) 與橫式 (Landscape) 有不同的樣式設定。若需調整手機版面，請搜尋 CSS 檔案中的 `@media` 區塊。
*   **字體單位**: 建議使用 `rem` 或 `clamp()` 函數，以確保在不同裝置上都有良好的閱讀體驗。
*   **iOS PWA 測試**: 修改 safe area 相關設定後，建議在實際 iOS 裝置上以 PWA 模式測試，確保內容不會被系統 UI 遮住。
*   **中文註解**: 所有 CSS 檔案中，可調整的參數都有 `[調整]` 標記和中文說明，方便快速定位。
