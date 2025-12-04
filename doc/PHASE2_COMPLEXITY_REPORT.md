# 階段 2 實施報告 - 路徑複雜度系統

## 已完成的功能

### 1. PathComplexity 介面

新增了路徑複雜度指標系統，包含 6 個關鍵指標：

```typescript
export interface PathComplexity {
    totalSteps: number;        // 最短路徑的總步數
    turnCount: number;         // 轉彎次數
    jumpCount: number;         // 跳躍次數
    backtrackCount: number;    // 回頭次數
    choicePoints: number;      // 決策點數量（岔路口）
    deadEndEncounters: number; // 可能遇到的死路數量
}
```

### 2. 複雜度分數計算

實現了加權計分系統：

```typescript
複雜度分數 = 
    總步數 × 1 +
    轉彎次數 × 2 +
    跳躍次數 × 3 +
    回頭次數 × 4 +
    決策點 × 5 +
    死路遭遇 × 6
```

**權重設計理念**：
- 步數（×1）：基礎難度
- 轉彎（×2）：需要空間認知
- 跳躍（×3）：需要特殊操作
- 回頭（×4）：反直覺，增加難度
- 決策點（×5）：需要策略思考
- 死路（×6）：最高難度，容易失敗

### 3. 難度範圍定義

為每個難度等級定義了複雜度分數範圍：

| 難度 | 分數範圍 | 特徵 |
|------|---------|------|
| Easy | 0-20 | 簡單直接的路徑 |
| Medium | 20-50 | 需要適度規劃 |
| Hard | 50-100 | 需要策略思考 |

### 4. 路徑分析函數

實現了 `analyzePathComplexity` 函數：

**功能**：
- 使用 BFS 算法尋找最短路徑
- 追蹤方向變化（轉彎）
- 計算跳躍次數
- 檢測回頭路徑
- 返回完整的複雜度指標

**算法特點**：
- 考慮方向狀態（不只是位置）
- 支持前進、跳躍、左轉、右轉四種動作
- 避免重複訪問相同狀態
- 找到目標後立即返回

### 5. 難度驗證函數

實現了 `validateLevelDifficulty` 函數：

**功能**：
- 分析關卡的實際路徑複雜度
- 計算複雜度分數
- 驗證是否符合目標難度範圍
- 返回 true/false

**用途**：
- 關卡生成後的品質檢查
- 確保難度標籤準確
- 過濾不符合要求的關卡

## 技術實現

### BFS 路徑尋找

```typescript
interface PathState {
    x: number;          // 當前位置 X
    y: number;          // 當前位置 Y
    dir: Direction;     // 當前方向
    steps: number;      // 已走步數
    jumps: number;      // 已跳次數
    turns: number;      // 已轉次數
    path: Array<...>;   // 路徑記錄
}
```

### 回頭檢測

檢查路徑中是否返回到之前訪問過的位置：

```typescript
function calculateBacktracks(path) {
    // 檢查當前位置是否與前兩步的位置相同
    if (curr.x === prevPrev.x && curr.y === prevPrev.y) {
        backtracks++;
    }
}
```

## 使用示例

### 驗證關卡難度

```typescript
const level = generateLevel(1, 'Medium');
const isValid = validateLevelDifficulty(level, 'Medium');

if (!isValid) {
    console.log('關卡難度不符，重新生成');
}
```

### 分析路徑複雜度

```typescript
const complexity = analyzePathComplexity(
    level.start,
    level.goal,
    level.obstacles,
    level.lakes,
    level.gridSize,
    true // canJump
);

console.log('複雜度分數:', calculateComplexityScore(complexity));
// 輸出: 複雜度分數: 35
```

## 預期效果

### 關卡品質提升

1. **準確的難度標籤**
   - 簡單關卡確實簡單（分數 0-20）
   - 困難關卡確實困難（分數 50-100）

2. **一致的遊戲體驗**
   - 同難度的關卡複雜度相近
   - 玩家能預期難度

3. **更好的學習曲線**
   - 從簡單到困難平滑過渡
   - 避免難度突變

### 開發優勢

1. **自動化品質檢查**
   - 生成後自動驗證
   - 過濾不合格關卡

2. **數據驅動設計**
   - 基於量化指標調整
   - 可追蹤難度趨勢

3. **擴展性**
   - 易於添加新指標
   - 可調整權重

## 修改的檔案

- [levelTemplates.ts](file:///Users/simonwang/Projects/KidsApp/kidapp/src/features/animal-commands/data/levelTemplates.ts)
  - 添加 `PathComplexity` 介面
  - 添加 `calculateComplexityScore` 函數
  - 添加 `COMPLEXITY_RANGES` 常數

- [levels.ts](file:///Users/simonwang/Projects/KidsApp/kidapp/src/features/animal-commands/data/levels.ts)
  - 添加 `analyzePathComplexity` 函數（200+ 行）
  - 添加 `calculateBacktracks` 輔助函數
  - 添加 `validateLevelDifficulty` 函數

## 下一步建議

### 整合到關卡生成

可以在 `generateLevel` 函數中加入驗證：

```typescript
export const generateLevel = (...) => {
    let attempts = 0;
    while (attempts < 50) {
        // ... 生成關卡 ...
        
        // 驗證難度
        if (validateLevelDifficulty(level, difficulty)) {
            return level;
        }
        
        attempts++;
    }
}
```

### 收集統計數據

可以記錄每個關卡的複雜度分數，用於：
- 分析難度分佈
- 優化權重參數
- 調整難度範圍

### 視覺化工具

可以開發工具顯示：
- 關卡的複雜度分數
- 最短路徑可視化
- 難度分佈圖表
