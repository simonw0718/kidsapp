# Animal Commands – PRD v1

## 1. 遊戲目的（Why）
透過操作「動作指令方塊」讓孩子建構最基礎的程式邏輯概念：指令順序、方向辨識、路徑規劃。  
遊戲節奏溫和、操作直覺，適合 3–6 歲的兒童。

---

## 2. 目標族群（Who）
- 3–6 歲兒童  
- 尚未接觸程式語言  
- 需要訓練方向感、手眼協調、邏輯思考

---

## 3. 遊戲核心（Core Loop）
看題目 → 放指令 → 執行 → 動物行走 → 成功 / 失敗 → 下一題

1. 題目：例如「讓小兔子走到紅蘿蔔旁邊」。  
2. 玩家拖曳指令方塊到指令欄。  
3. 按 Start，動物依序執行。  
4. 成功 → 慶祝動畫；失敗 → 提示重試。

---

## 4. 遊戲架構（Gameplay Structure）

### 4.1 地圖（Grid）
- 4×4 或 5×5 格子  
- 動物起點預設左下  
- 目標物件（蘿蔔 / 香蕉 / 門）  
- 障礙物（石頭、草叢等）

### 4.2 指令方塊（Commands）
| 指令 | 說明 |
|------|------|
| forward | 往前走一格 |
| turnLeft | 左轉 90° |
| turnRight | 右轉 90° |
| jump | 跳過障礙或純動畫 |

### 4.3 指令欄（Command Sequence）
- 底部或右側的槽位區域  
- 最多放 5–8 個指令（依難度）  
- 拖錯可以移除或覆蓋

### 4.4 執行階段（Run Phase）
- UI 鎖定  
- 動物逐步執行動作  
- 撞牆 or 越界 → 自動停下  
- 到達目標 → 成功

---

## 5. 難度曲線（Difficulty Progression）
難度需設計出可以簡單調整的機制
### EASY（1–5）
- 地圖 3×3  
- 指令：forward + turnRight  
- 近距離目標  
- 無障礙物

### NORMAL（6–12）
- 4×4  
- 開放左右轉  
- 加入障礙物 + jump  
- 起始面向不固定

### HARD（13–20）
- 5×5  
- 多次轉折  
- 死路（石頭阻擋）  
- 指令欄限制更緊（如 6 個）

---

## 6. 回饋（Feedback）

### 視覺
- 動物走路、轉向、跳躍動畫  
- 成功：跳舞  
- 失敗：輕微抖動

### 音效
- 點擊指令  
- 走路腳步聲  
- 成功/失敗提示音  
（沿用現有 sound system）

---

## 7. UI Layout（橫向 / 直向）

### 7.1 Landscape（橫向）
左邊大版面（70–75%）
- 地圖 GRID  
- 動物  
- 障礙物、目標

右側（25–30%）
- 題目文字（附小圖示）  
- 指令工具箱（Vertical）  
- 指令欄（Vertical Stack）  
- Start / Reset 按鈕固定在右下角  
- 拖曳：右 → 左指令欄

### 7.2 Portrait（直向）
上方（55–60%）
- 地圖 GRID  
- 動物  
- 自動留白避免貼邊過近

下方（40–45%）
- 題目文字  
- 指令工具箱（Horizontal Scroll）  
- 指令欄（Horizontal Timeline）  
- 最下方：Start / Reset 一列  

### 7.3 共同 UI 原則
- 地圖永遠佔至少 55% 螢幕  
- 指令方塊大小固定 56–64px  
- Slot 吸附機制  
- 執行時鎖定下方/右方 UI  
- 成功/失敗動畫永遠在地圖區播放  

### 7.4 Responsive Breakpoints
@media (orientation: landscape) {
// 左右 Layout
}

@media (orientation: portrait) {
// 上下 Layout
}
---

## 8. 狀態機（Game State）
IDLE
↓
INPUT (拖曳)
↓
RUNNING (執行)
→ SUCCESS
→ FAIL
↑
RESET
---

## 9. 技術設計（Tech Notes）

### Grid Engine
- position = {x, y}  
- direction = up/right/down/left  
- forward：position + direction vector  
- boundary check

### Command Queue
[
{ type: ‘forward’ },
{ type: ‘turnLeft’ },
…
]
RUNNING 時逐一執行。

### Level Config
```json
{
  "gridSize": 4,
  "start": { "x": 0, "y": 0, "dir": "up" },
  "goal": { "x": 3, "y": 3 },
  "obstacles": [{ "x": 1, "y": 2 }],
  "allowedCommands": ["forward","left","right","jump"],
  "maxCommands": 6
}
10. MVP Scope

MVP 包含
	•	前 10 關
	•	四種指令
	•	三種動物外觀（貼圖更換）
	•	5×5 地圖
	•	localStorage 進度記錄

MVP 不包含
	•	Loop（repeat）
	•	If（條件判斷）
	•	自由創作模式
	•	關卡編輯器

⸻

11. 成功指標（Success Metrics）
	•	平均遊玩時間 ≥ 3 分鐘
	•	3–6 歲孩子能在 5 關內理解玩法
	•	每次開啟平均重玩 ≥ 3 關