=====================================
# Animal Game — 地圖生成 + 難度曲線 + 模板規格（最終完整版本）
# 供開發者與生成 AI 使用（嚴禁自行修改）
=====================================

# 前言（必讀）
本文件為 Animal Game 的「地圖生成與難度系統最終規格」。  
所有後續地圖生成（含 AI 自動生成）**必須嚴格依照本規格**，  
不得任意調整難度參數、模板規則或 Mode 邏輯。

同時，**不得破壞現有 UI 介面設計**。  
包括但不限於：
- 不新增新的主要按鈕  
- 不更動既有控制面板  
- 不移動 GridBoard/ControlPanel/CommandQueue 的位置  
- 僅能以「不破壞結構」的方式加入難度切換功能  

本文件優先級高於所有舊文件與生成結果。

=====================================
# 一、遊戲模式設計（Modes）

## Mode 設計維持原樣，但進行調整：
### ◎ Mode 1 / Mode 2 → 合併為單一「Mode 2」
理由：
- 不再使用 Mode 1（無跳躍）  
- Mode 2（含 Jump 按鈕）已經可涵蓋所有需求  
- 是否「需要跳躍」改由關卡難度控制  
  → Easy 不必跳  
  → Medium / Hard 則會需要跳  

### ◎ Mode 3 / Mode 4 保留原設計
- Mode 3：預排指令（可多段嘗試，不重置）  
- Mode 4：預排指令（一次失敗就重置）

### ◎ 指令集統一為 Mode 2 的四指令：
- Forward（前進）
- Turn Left（左轉）
- Turn Right（右轉）
- Jump（跳躍）

=====================================
# 二、遊戲方式（兩種）

## 1. Adventure（闖關模式）
- 分為 Easy / Medium / Hard 三大區
- 每區包含 5 個模板（固定邏輯 + 隨機性）
- 每次一輪遊戲只會抽：
  → Easy 一關  
  → Medium 一關  
  → Hard 一關  
- **模板不會重複抽取（同一天）**

## 2. Free Play（自由模式）
- 使用者可自由選擇難度：Easy / Medium / Hard
- 每次遊玩都隨機抽模板並生成新地圖
- 不影響 Adventure UI，不新增複雜 UI
- 難度切換可放置在「模式切換 UI 設計的延伸區域」

=====================================
# 三、統一設定（Global Rules）

1. 所有地圖固定為 **5×5**。  
2. 指令集統一使用 Mode 2（含跳躍）。  
3. 跳躍是否必須 → 由難度層級控制（requiredJumps）  
4. 所有地圖必須通過 BFS（含跳躍邏輯）  
5. BFS 必須驗證地圖符合該難度之參數  
6. 起點需包含方向  
7. 生成 AI 必須完整遵守所有參數，不得亂調  
8. 避免不合理地形（例如兩個湖泊連成一條無法繞過的牆）

=====================================
# 四、難度曲線（Easy / Medium / Hard）詳細規格

# ※ 此區為「強制規格」。  
# 生成 AI 不得自行增加或減少規則。

-------------------------------------
## 1. Easy（草原）
- obstacleDensity: 0–1（最多 1 顆石頭）
- lakeDensity: 0（完全無湖泊）
- requiredJumps: 0（不需跳）
- minSteps: 3
- maxSteps: 6
- branchComplexity: 0（不能有岔路）
- deadEndTolerance: 0（禁止死路）
- mazeLevel: 0（直線、簡單彎）
- overall feel: 開闊、安全、低壓力

用途：讓小朋友理解「方向 + 轉彎」的基本組合。

-------------------------------------
## 2. Medium（森林）
- obstacleDensity: 1–3  
- lakeDensity: 0–1（可能有，也可能沒有）  
- requiredJumps: 1（至少需要跳一次）  
- minSteps: 5  
- maxSteps: 8  
- branchComplexity: 1（可以有 1 個可選岔路）  
- deadEndTolerance: 1（可出現少量死路）  
- mazeLevel: 1（有轉折，但不複雜）  
- overall feel: 需要規劃、第一次引入跳躍

用途：先建立「通過障礙＝跳躍」的概念。

-------------------------------------
## 3. Hard（火山）
- obstacleDensity: 2–4  
- lakeDensity: 1–2（必定有湖泊）  
- requiredJumps: 2（至少需要跳兩次）  
- minSteps: 8  
- maxSteps: 12  
- branchComplexity: 2（至少兩岔路）  
- deadEndTolerance: 2（可能會有死路，需要判斷）  
- mazeLevel: 2（複雜彎道）  
- overall feel: 要預判、多段跳躍、地形密度高

用途：建立「完整路徑規劃」與「高階跳躍組合」。

=====================================
# 五、模板格式 Template Format（每難度 5 套）

# ※ 模板由「人類編寫」或「生成 AI 產生」都必須遵守此格式。  
# ※ 生成器不可自行增加欄位。

TemplateName: <string>  
difficulty: Easy | Medium | Hard

start:
  x: number (0~4)
  y: number (0~4)
  dir: up | down | left | right

goalOptions:
  - { x: number, y: number }
  - { x: number, y: number }

obstacleZones:
  - { x: number, y: number }
  - ...

lakeZones:
  - { x: number, y: number }
  - ...

difficultyParams:
  minSteps: number
  maxSteps: number
  requiredJumps: number
  obstacleDensity: number range
  lakeDensity: number range
  branchComplexity: 0|1|2
  deadEndTolerance: 0|1|2
  mazeLevel: 0|1|2

=====================================
# 六、地圖生成流程（Map Generation Flow）

generateMap(difficulty):

1. **篩選模板**  
   - 從該難度的 5 套模板中，隨機抽 1 套  
   - Adventure = 抽一次後重複使用當日模板  
   - Free Play = 每次即時抽取

2. **生成候選地形（建立地形草稿）**  
   - obstacleZones → 根據 obstacleDensity 決定實際放哪些  
   - lakeZones → 根據 lakeDensity 決定實際放哪些  
   - 確保「湖泊不出現在跳落點」且「不形成封鎖區」

3. **根據難度參數調整地形**  
   - 路徑長度需落在 minSteps / maxSteps  
   - 若 requiredJumps > 0 → BFS 必須確保跳躍是必要的  
   - branchComplexity 需保持（限制岔路數）  
   - deadEndTolerance 需符合（死路不能過多）  
   - mazeLevel 需保持（整體形狀感）

4. **BFS 驗證（強制）**  
   必須驗證：
   - 可從 start 到 goal  
   - 跳躍點合法（石頭可跳，湖不可跳）  
   - 若不符 → 重新生成

5. **Roll until success**  
   - 若 fails → 回到 Step 1 重抽模板  
   - 模板若完全無法達標 → 程式需選其他模板

6. **輸出地圖**  
   - 回傳 final levelData  
   - 格式與現行 Level 結構一致（不破壞 UI）

=====================================
# 七、UI 相關規範（非常重要）

1. **禁止破壞現有 UI 結構**  
   - GridBoard、ControlPanel、CommandQueue 不可改位
   - 不新增複雜面板或拖曳 UI
   - 若有新功能（如難度切換），必須以「小型附屬 UI」呈現  
     → 不影響現有 layout  
     → 可放進 Mode 切換區域或彈出式選擇器

2. **禁止改動既有按鈕（Forward/Turn/Jump）的位置或大小**  

3. **禁止新增大型 UI 元件**  
   可新增但必須：
   - 小圖示
   - 設定頁
   - 模式選單附屬按鈕

=====================================
# 八、開發注意（給工程師與生成 AI）

1. **不得擅自修改難度參數**  
2. **不得擅自增加 / 刪除模板欄位**  
3. **不得擅自更動 Mode 設計**  
4. **不得破壞原 UI 結構**  
5. **所有地圖都需 BFS 驗證**  
6. **所有地圖都必須符合難度規格，無例外**  
7. **所有生成皆需落在模板所定義之候選格子內**

=====================================
# 九、模板實例（15 套）
（以下為本規格的範例實作，可直接使用或覆蓋）

---（此處接續 Easy/Medium/Hard 共 15 套模板）---

=====================================
# Easy Templates（草原 × 5）
# 特點：開闊、少障礙、無湖泊、3~6 步路徑、無岔路

Template Easy-1:
  difficulty: Easy
  start: { x: 0, y: 2, dir: right }
  goalOptions:
    - { x: 4, y: 2 }
    - { x: 3, y: 2 }
  obstacleZones:
    - { x: 2, y: 2 }
  lakeZones: []
  difficultyParams:
    minSteps: 3
    maxSteps: 6
    requiredJumps: 0
    obstacleDensity: 0-1
    lakeDensity: 0
    branchComplexity: 0
    deadEndTolerance: 0
    mazeLevel: 0

Template Easy-2:
  difficulty: Easy
  start: { x: 0, y: 1, dir: right }
  goalOptions:
    - { x: 4, y: 3 }
    - { x: 4, y: 1 }
  obstacleZones:
    - { x: 2, y: 1 }
    - { x: 3, y: 2 }
  lakeZones: []
  difficultyParams:
    minSteps: 4
    maxSteps: 6
    requiredJumps: 0
    obstacleDensity: 0-1
    lakeDensity: 0
    branchComplexity: 0
    deadEndTolerance: 0
    mazeLevel: 0

Template Easy-3:
  difficulty: Easy
  start: { x: 1, y: 4, dir: up }
  goalOptions:
    - { x: 4, y: 0 }
    - { x: 3, y: 1 }
  obstacleZones:
    - { x: 2, y: 3 }
  lakeZones: []
  difficultyParams:
    minSteps: 4
    maxSteps: 6
    requiredJumps: 0
    obstacleDensity: 0-1
    lakeDensity: 0
    branchComplexity: 0
    deadEndTolerance: 0
    mazeLevel: 0

Template Easy-4:
  difficulty: Easy
  start: { x: 2, y: 0, dir: down }
  goalOptions:
    - { x: 4, y: 4 }
    - { x: 3, y: 3 }
  obstacleZones:
    - { x: 2, y: 2 }
  lakeZones: []
  difficultyParams:
    minSteps: 4
    maxSteps: 6
    requiredJumps: 0
    obstacleDensity: 0-1
    lakeDensity: 0
    branchComplexity: 0
    deadEndTolerance: 0
    mazeLevel: 0

Template Easy-5:
  difficulty: Easy
  start: { x: 0, y: 0, dir: right }
  goalOptions:
    - { x: 4, y: 1 }
    - { x: 4, y: 4 }
  obstacleZones:
    - { x: 1, y: 1 }
    - { x: 2, y: 0 }
  lakeZones: []
  difficultyParams:
    minSteps: 3
    maxSteps: 6
    requiredJumps: 0
    obstacleDensity: 0-1
    lakeDensity: 0
    branchComplexity: 0
    deadEndTolerance: 0
    mazeLevel: 0

=====================================
# Medium Templates（森林 × 5）
# 特點：1~3 障礙 + 少量湖泊 + 至少跳一次、5~8 步、有一點分支

Template Medium-1:
  difficulty: Medium
  start: { x: 0, y: 2, dir: right }
  goalOptions:
    - { x: 4, y: 4 }
    - { x: 4, y: 1 }
  obstacleZones:
    - { x: 2, y: 2 }
    - { x: 3, y: 3 }
  lakeZones:
    - { x: 2, y: 3 }
  difficultyParams:
    minSteps: 5
    maxSteps: 8
    requiredJumps: 1
    obstacleDensity: 1-3
    lakeDensity: 0-1
    branchComplexity: 1
    deadEndTolerance: 1
    mazeLevel: 1

Template Medium-2:
  difficulty: Medium
  start: { x: 1, y: 4, dir: up }
  goalOptions:
    - { x: 4, y: 0 }
    - { x: 3, y: 1 }
  obstacleZones:
    - { x: 2, y: 3 }
    - { x: 3, y: 2 }
  lakeZones:
    - { x: 1, y: 2 }
  difficultyParams:
    minSteps: 5
    maxSteps: 8
    requiredJumps: 1
    obstacleDensity: 1-3
    lakeDensity: 0-1
    branchComplexity: 1
    deadEndTolerance: 1
    mazeLevel: 1

Template Medium-3:
  difficulty: Medium
  start: { x: 4, y: 0, dir: down }
  goalOptions:
    - { x: 0, y: 4 }
    - { x: 1, y: 3 }
  obstacleZones:
    - { x: 3, y: 1 }
    - { x: 2, y: 2 }
  lakeZones:
    - { x: 1, y: 1 }
  difficultyParams:
    minSteps: 6
    maxSteps: 8
    requiredJumps: 1
    obstacleDensity: 1-3
    lakeDensity: 0-1
    branchComplexity: 1
    deadEndTolerance: 1
    mazeLevel: 1

Template Medium-4:
  difficulty: Medium
  start: { x: 0, y: 3, dir: right }
  goalOptions:
    - { x: 4, y: 0 }
    - { x: 3, y: 4 }
  obstacleZones:
    - { x: 1, y: 3 }
    - { x: 2, y: 3 }
    - { x: 3, y: 2 }
  lakeZones:
    - { x: 2, y: 1 }
  difficultyParams:
    minSteps: 5
    maxSteps: 8
    requiredJumps: 1
    obstacleDensity: 1-3
    lakeDensity: 0-1
    branchComplexity: 1
    deadEndTolerance: 1
    mazeLevel: 1

Template Medium-5:
  difficulty: Medium
  start: { x: 2, y: 4, dir: up }
  goalOptions:
    - { x: 4, y: 2 }
    - { x: 1, y: 0 }
  obstacleZones:
    - { x: 2, y: 3 }
    - { x: 3, y: 2 }
  lakeZones:
    - { x: 1, y: 3 }
  difficultyParams:
    minSteps: 5
    maxSteps: 8
    requiredJumps: 1
    obstacleDensity: 1-3
    lakeDensity: 0-1
    branchComplexity: 1
    deadEndTolerance: 1
    mazeLevel: 1

=====================================
# Hard Templates（火山 × 5）
# 特點：多障礙 + 多湖泊 + 至少跳兩次、8~12 步、分支多、死路多

Template Hard-1:
  difficulty: Hard
  start: { x: 0, y: 4, dir: up }
  goalOptions:
    - { x: 4, y: 0 }
    - { x: 3, y: 1 }
  obstacleZones:
    - { x: 1, y: 4 }
    - { x: 2, y: 3 }
    - { x: 3, y: 2 }
  lakeZones:
    - { x: 1, y: 2 }
    - { x: 2, y: 1 }
  difficultyParams:
    minSteps: 8
    maxSteps: 12
    requiredJumps: 2
    obstacleDensity: 2-4
    lakeDensity: 1-2
    branchComplexity: 2
    deadEndTolerance: 2
    mazeLevel: 2

Template Hard-2:
  difficulty: Hard
  start: { x: 4, y: 4, dir: left }
  goalOptions:
    - { x: 0, y: 0 }
    - { x: 1, y: 2 }
  obstacleZones:
    - { x: 3, y: 4 }
    - { x: 2, y: 3 }
    - { x: 2, y: 1 }
  lakeZones:
    - { x: 1, y: 3 }
    - { x: 3, y: 2 }
  difficultyParams:
    minSteps: 8
    maxSteps: 12
    requiredJumps: 2
    obstacleDensity: 2-4
    lakeDensity: 1-2
    branchComplexity: 2
    deadEndTolerance: 2
    mazeLevel: 2

Template Hard-3:
  difficulty: Hard
  start: { x: 0, y: 1, dir: right }
  goalOptions:
    - { x: 4, y: 3 }
    - { x: 3, y: 4 }
  obstacleZones:
    - { x: 2, y: 1 }
    - { x: 3, y: 1 }
    - { x: 2, y: 3 }
  lakeZones:
    - { x: 1, y: 2 }
    - { x: 3, y: 2 }
  difficultyParams:
    minSteps: 9
    maxSteps: 12
    requiredJumps: 2
    obstacleDensity: 2-4
    lakeDensity: 1-2
    branchComplexity: 2
    deadEndTolerance: 2
    mazeLevel: 2

Template Hard-4:
  difficulty: Hard
  start: { x: 4, y: 0, dir: down }
  goalOptions:
    - { x: 0, y: 4 }
    - { x: 2, y: 3 }
  obstacleZones:
    - { x: 3, y: 1 }
    - { x: 2, y: 2 }
    - { x: 1, y: 3 }
  lakeZones:
    - { x: 3, y: 3 }
    - { x: 1, y: 1 }
  difficultyParams:
    minSteps: 8
    maxSteps: 12
    requiredJumps: 2
    obstacleDensity: 2-4
    lakeDensity: 1-2
    branchComplexity: 2
    deadEndTolerance: 2
    mazeLevel: 2

Template Hard-5:
  difficulty: Hard
  start: { x: 1, y: 0, dir: down }
  goalOptions:
    - { x: 4, y: 4 }
    - { x: 0, y: 3 }
  obstacleZones:
    - { x: 1, y: 1 }
    - { x: 2, y: 2 }
    - { x: 3, y: 3 }
  lakeZones:
    - { x: 2, y: 1 }
    - { x: 1, y: 3 }
  difficultyParams:
    minSteps: 8
    maxSteps: 12
    requiredJumps: 2
    obstacleDensity: 2-4
    lakeDensity: 1-2
    branchComplexity: 2
    deadEndTolerance: 2
    mazeLevel: 2

=====================================
# 完成：共 15 套模板（全 5×5 / 合法 / 遵循難度曲線）
=====================================