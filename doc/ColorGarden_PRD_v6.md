# Color Garden – PRD_v6  
（PNG Only Edition — Free Coloring + Color Learning）

## 0. Overview（概述）
Color Garden 是一個給幼兒使用的「著色本 + 顏色學習」模組。  
全模組採用 **PNG 線稿 + Brush 塗色 + Apple Pencil 支援**，  
不使用 SVG、Smart Fill 或區域比對。

模組分成三大模式：

1. **Mode 1 — 自由著色（Free Coloring）** → 主模式  
2. **Mode 2 — 顏色學習（Color Learning）**  
3. **Mode 3 — 顏色展示（Color Demo, Optional）**

---

# 1. Supported Devices（裝置支援）
- **iPad（橫向為主體驗，核心設計）**
- iPad（直向）
- iPhone（直向）

UI 在 iPad 橫向時提供最佳繪畫空間。

---

# 2. Global Design Rules（通用介面規則）

## 2.1 Layout（版面配置）
### iPad 橫向（主要）
```
┌──────────────────────────────┬────────────────────────┐
│          主畫面（Canvas + PNG）          │     工具列（垂直）       │
│    Apple Pencil / Brush 繪製區域          │  顏色 / 工具 / 切換      │
└──────────────────────────────┴────────────────────────┘
```

### iPhone 直向 / iPad 直向
```
┌──────────────────────────────────┐
│            主畫面（Canvas）          │
└──────────────────────────────────┘
┌──────────────────────────────────┐
│          工具列（水平 scroll）       │
└──────────────────────────────────┘
```

---

# 3. Mode 1 – 自由著色（Free Coloring Mode）
**主要目的：將 iPad 變成兒童著色本**

### 3.1 主要功能
- 使用 PNG 線稿（透明底）
- Brush 塗色
- 支援 Apple Pencil
- 顏色盤切換
- 橡皮擦
- Undo / Redo
- Clear（清除 Brush，不清線稿）
- Next（下一張 PNG）
- Gallery（題庫選擇）

### 3.2 PNG 素材規格
- 解析度 **2048 px 以上**
- 透明背景 + 黑色粗線（6〜8 px）
- 無內部細節（無葉脈、無陰影、無装飾）
- 單純線稿 → 適合著色
- 檔案示例：
```
flower_01.png
flower_02.png
animal_cat_01.png
vehicle_car_01.png
```

### 3.3 Brush 行為
- 圓筆刷，平滑線條
- Brush layer 疊加在線稿下方
- 支援 Apple Pencil（無壓力 sensitivity）
- Eraser 僅擦 Brush layer

### 3.4 互動流程（Flow）
1. 進入模式 → 顯示 PNG 線稿
2. 使用者選顏色
3. 使用 Brush / Pencil 塗色
4. 可 Undo / Redo / Eraser
5. 清除 Brush（保留線稿）
6. Next 或 Gallery 換下一張

---

# 4. Mode 2 – 顏色學習（Color Learning Mode）
**目的：認識顏色名稱、色系、排序、混色概念**  
不包含畫筆，不需塗色，不做判斷，純展示＋點擊互動。

### 4.1 顏色文字呈現方式  
使用 App 內建「注音顯示工具」，呈現如下格式：

```
紅 ㄏㄨㄥˊ
Red
```

- 中文＋注音：使用現行上標注音系統  
- 語音播放：**英文名稱**

---

## 4.2 支援顏色（15 款常用色）
Red（紅）  
Yellow（黃）  
Blue（藍）  
Green（綠）  
Orange（橘）  
Purple（紫）  
Pink（粉）  
Brown（咖啡）  
Black（黑）  
White（白）  
Gray（灰）  
Light Blue（淺藍）  
Dark Blue（深藍）  
Beige（米色）  
Cyan（青色）  

---

## 4.3 子模式分類

### **Mode 2-1：顏色名稱（Color Names）**
孩子點顏色球 → 顯示：
- 英文  
- 中文  
- 注音（由內建注音格式渲染）  
- 播放英文語音  

---

### **Mode 2-2：色系體驗（Color Groups）**
目的：理解顏色排列與色系  
包含四種排序方式：

1. **亮 → 暗（Light → Dark）**  
2. **暖 → 冷（Warm → Cool）**  
3. **彩虹排序（Rainbow Order）**  
4. **色相環（Hue Wheel）**

互動方式：
- 點選色群 → 顯示排序色帶  
- 點顏色 → 顯示中英＋注音並播放語音  

---

### **Mode 2-3：混色展示（Color Mixing）**
目的：透過動畫理解混色概念  
使用 UI 顏色球合併動畫，不計算顏色運算。

混色組合：
- Red + Yellow → Orange  
- Blue + Yellow → Green  
- Red + Blue → Purple  
- White + Black → Gray  

---

# 5. Mode 3 – 顏色展示（Color Demo, Optional）
- 自動輪播顏色  
- 自動講解顏色  
- 可展示排序（暖/冷、亮/暗、彩虹）  
- 家長教學模式  

---

# 6. UI Components（共用元件）

### 6.1 顏色球（Color Chip）
- 大按鈕  
- 顏色展示  
- 點擊放大 + 語音播放  

### 6.2 注音顯示
- 使用 App 既有注音渲染工具（上標小注音）  
- 禁止自製注音圖層  

### 6.3 Mode 1 工具列
- Brush  
- Brush Size  
- Color Palette  
- Eraser  
- Undo / Redo  
- Clear  
- Next  
- Gallery  

---

# 7. 技術規格（Tech Spec）

## 7.1 Layer 結構
```
Layer 1：PNG 線稿  
Layer 2：Brush Canvas  
Layer 3：UI Layer  
```

## 7.2 Apple Pencil
- 支援 pen pointerType  
- 不啟用壓力感應（pressure off）

---

# 8. Out of Scope（不包含）
- SVG path  
- 自動填色（Smart Fill）  
- 區域比對  
- 任務判斷  
- 記憶模式  
- 花瓣/葉子區域判斷  
- 筆刷材質模擬  

---

# 9. 核心價值（最終版）
1. Mode 1 = 主體驗，像真正的兒童著色本  
2. Mode 2 = 顏色教育，無壓力、易理解  
3. PNG-only 架構，簡單高效  
4. Apple Pencil 深度支援  
5. 注音顯示符合台灣幼兒需求  
6. 題庫可快速擴充  

---

（完）
