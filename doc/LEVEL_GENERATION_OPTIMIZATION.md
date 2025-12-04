# 關卡生成算法優化方案

## 當前問題分析

### 1. 難度區分度不足
觀察現有的三個難度等級，發現以下問題：

**簡單 (Easy)**
- 步數：3-6 步
- 障礙物：1-3 個
- 湖泊：0 個
- 跳躍：0 次

**中等 (Medium)**
- 步數：5-8 步
- 障礙物：1-3 個（與簡單相同！）
- 湖泊：0-1 個
- 跳躍：1 次

**困難 (Hard)**
- 步數：8-15 步
- 障礙物：3-7 個
- 湖泊：1-3 個
- 跳躍：1-2 次

**核心問題**：
1. ❌ 簡單和中等的障礙物密度完全相同
2. ❌ 步數範圍重疊（簡單 3-6，中等 5-8）
3. ❌ 缺乏路徑複雜度的量化指標
4. ❌ 模板數量少（每個難度只有 5 個）
5. ❌ 隨機性不足，容易產生相似關卡

## 優化方案

### 方案 1：增強難度參數差異化

#### 1.1 重新定義難度參數

```typescript
export const DIFFICULTY_CONFIGS = {
    Easy: {
        // 基礎參數
        minSteps: 3,
        maxSteps: 5,
        requiredJumps: 0,
        
        // 障礙物配置
        obstacleDensity: [0, 2],  // 0-2 個
        lakeDensity: [0, 0],       // 無湖泊
        
        // 路徑複雜度
        minTurns: 0,               // 最少轉彎次數
        maxTurns: 2,               // 最多轉彎次數
        allowBacktrack: false,     // 不允許回頭路
        
        // 空間複雜度
        pathWidth: 3,              // 路徑寬度（可選路線數）
        deadEnds: 0,               // 死路數量
        
        // 視覺複雜度
        distractorObstacles: 0,    // 干擾性障礙物（不在路徑上）
    },
    
    Medium: {
        minSteps: 6,
        maxSteps: 10,
        requiredJumps: 1,
        
        obstacleDensity: [3, 5],   // 3-5 個（明顯增加）
        lakeDensity: [1, 2],       // 1-2 個湖泊
        
        minTurns: 2,
        maxTurns: 4,
        allowBacktrack: true,      // 允許回頭路
        
        pathWidth: 2,
        deadEnds: 1,               // 1 個死路
        
        distractorObstacles: 1,    // 1-2 個干擾障礙物
    },
    
    Hard: {
        minSteps: 10,
        maxSteps: 18,
        requiredJumps: 2,
        
        obstacleDensity: [6, 10],  // 6-10 個
        lakeDensity: [2, 4],       // 2-4 個湖泊
        
        minTurns: 4,
        maxTurns: 8,
        allowBacktrack: true,
        
        pathWidth: 1,              // 唯一路徑
        deadEnds: 2,               // 2-3 個死路
        
        distractorObstacles: 3,    // 3-5 個干擾障礙物
    }
};
```

### 方案 2：引入路徑複雜度計算

#### 2.1 路徑複雜度指標

```typescript
interface PathComplexity {
    totalSteps: number;        // 總步數
    turnCount: number;         // 轉彎次數
    jumpCount: number;         // 跳躍次數
    backtrackCount: number;    // 回頭次數
    choicePoints: number;      // 需要決策的岔路口數量
    deadEndEncounters: number; // 可能遇到的死路數量
}

// 計算路徑複雜度分數
function calculateComplexityScore(path: PathComplexity): number {
    return (
        path.totalSteps * 1 +
        path.turnCount * 2 +
        path.jumpCount * 3 +
        path.backtrackCount * 4 +
        path.choicePoints * 5 +
        path.deadEndEncounters * 6
    );
}

// 難度分數範圍
const COMPLEXITY_RANGES = {
    Easy: [0, 20],
    Medium: [20, 50],
    Hard: [50, 100]
};
```

### 方案 3：多樣化的關卡模式

#### 3.1 引入關卡類型

```typescript
type LevelPattern = 
    | 'straight'      // 直線型（簡單）
    | 'zigzag'        // 之字型（中等）
    | 'spiral'        // 螺旋型（中等）
    | 'maze'          // 迷宮型（困難）
    | 'island'        // 島嶼型（困難，需跨越湖泊）
    | 'corridor'      // 走廊型（中等，狹窄通道）
    | 'openfield';    // 開放型（簡單，多條路徑）

const PATTERN_DIFFICULTY_MAP = {
    Easy: ['straight', 'openfield'],
    Medium: ['zigzag', 'spiral', 'corridor'],
    Hard: ['maze', 'island']
};
```

#### 3.2 模式生成器

```typescript
function generateStraightPattern(rng: SeededRNG): LevelTemplate {
    // 生成直線型關卡
    // 起點在一側，終點在對側
    // 障礙物在路徑上，需要簡單繞行
}

function generateMazePattern(rng: SeededRNG): LevelTemplate {
    // 使用迷宮生成算法（如 Recursive Backtracker）
    // 創建複雜的分支路徑
    // 多個死路和岔路口
}

function generateIslandPattern(rng: SeededRNG): LevelTemplate {
    // 創建被湖泊包圍的"島嶼"
    // 必須使用跳躍才能到達
    // 增加空間規劃難度
}
```

### 方案 4：動態難度調整

#### 4.1 基於玩家表現的難度調整

```typescript
interface PlayerStats {
    attemptsCount: number;     // 嘗試次數
    averageSteps: number;      // 平均步數
    successRate: number;       // 成功率
    averageTime: number;       // 平均完成時間
}

function adjustDifficulty(
    baseDifficulty: Difficulty,
    stats: PlayerStats
): DifficultyParams {
    // 如果玩家表現太好，增加難度
    if (stats.successRate > 0.8 && stats.attemptsCount < 2) {
        return enhanceDifficulty(baseDifficulty);
    }
    
    // 如果玩家掙扎，降低難度
    if (stats.successRate < 0.3 && stats.attemptsCount > 5) {
        return reduceDifficulty(baseDifficulty);
    }
    
    return getStandardDifficulty(baseDifficulty);
}
```

### 方案 5：增加模板數量和多樣性

#### 5.1 擴展模板庫

```typescript
// 目前：每個難度 5 個模板
// 建議：每個難度 15-20 個模板

const EXPANDED_TEMPLATES = {
    Easy: [
        // 直線型 (5 個)
        { pattern: 'straight', variant: 1 },
        { pattern: 'straight', variant: 2 },
        // ...
        
        // 開放型 (5 個)
        { pattern: 'openfield', variant: 1 },
        // ...
        
        // L 型 (5 個)
        { pattern: 'lshape', variant: 1 },
        // ...
    ],
    
    Medium: [
        // 之字型 (5 個)
        // 螺旋型 (5 個)
        // 走廊型 (5 個)
    ],
    
    Hard: [
        // 迷宮型 (7 個)
        // 島嶼型 (7 個)
        // 複合型 (6 個)
    ]
};
```

### 方案 6：視覺差異化

#### 6.1 增加視覺複雜度

```typescript
interface VisualComplexity {
    // 地圖佈局
    symmetry: boolean;         // 是否對稱（簡單關卡對稱，困難關卡不對稱）
    openSpaceRatio: number;    // 空地比例（簡單高，困難低）
    
    // 障礙物分佈
    clusterObstacles: boolean; // 障礙物是否聚集
    scatterPattern: 'random' | 'grid' | 'organic';
    
    // 顏色編碼（未來擴展）
    pathHints: boolean;        // 是否提供路徑提示
}
```

## 實施建議

### 階段 1：立即優化（1-2 天）
1. ✅ 修改現有難度參數，拉大差距
2. ✅ 增加障礙物密度差異
3. ✅ 調整步數範圍，避免重疊

### 階段 2：中期優化（1 週）
1. ✅ 實現路徑複雜度計算
2. ✅ 引入關卡模式系統
3. ✅ 擴展模板庫至 15 個/難度

### 階段 3：長期優化（2-4 週）
1. ✅ 實現動態難度調整
2. ✅ 開發專用關卡生成器（迷宮、島嶼等）
3. ✅ 添加視覺差異化元素
4. ✅ 收集玩家數據，優化算法

## 具體代碼示例

### 示例 1：增強的難度參數

```typescript
// levelTemplates.ts
export const ENHANCED_DIFFICULTY_PARAMS = {
    Easy: {
        minSteps: 3,
        maxSteps: 5,
        requiredJumps: 0,
        obstacleDensity: [0, 2],      // 改：原本 [1, 3]
        lakeDensity: [0, 0],
        branchComplexity: 0,
        deadEndTolerance: 0,
        mazeLevel: 0,
        minTurns: 0,                  // 新增
        maxTurns: 2,                  // 新增
    },
    Medium: {
        minSteps: 6,                  // 改：原本 5
        maxSteps: 10,                 // 改：原本 8
        requiredJumps: 1,
        obstacleDensity: [3, 5],      // 改：原本 [1, 3]
        lakeDensity: [1, 2],          // 改：原本 [0, 1]
        branchComplexity: 1,
        deadEndTolerance: 1,
        mazeLevel: 1,
        minTurns: 2,                  // 新增
        maxTurns: 4,                  // 新增
    },
    Hard: {
        minSteps: 11,                 // 改：原本 8
        maxSteps: 18,                 // 改：原本 15
        requiredJumps: 2,
        obstacleDensity: [6, 10],     // 改：原本 [3, 7]
        lakeDensity: [2, 4],          // 改：原本 [1, 3]
        branchComplexity: 2,
        deadEndTolerance: 2,
        mazeLevel: 2,
        minTurns: 4,                  // 新增
        maxTurns: 8,                  // 新增
    }
};
```

### 示例 2：路徑驗證增強

```typescript
// levels.ts
function validateLevelDifficulty(
    level: LevelConfig,
    targetDifficulty: Difficulty
): boolean {
    // 計算實際路徑
    const path = findShortestPath(level);
    
    // 計算複雜度
    const complexity = calculatePathComplexity(path);
    const score = calculateComplexityScore(complexity);
    
    // 檢查是否符合目標難度範圍
    const [minScore, maxScore] = COMPLEXITY_RANGES[targetDifficulty];
    
    return score >= minScore && score <= maxScore;
}
```

## 預期效果

### 優化前
- 簡單：3-6 步，0-3 障礙物，0 湖泊
- 中等：5-8 步，1-3 障礙物，0-1 湖泊
- 困難：8-15 步，3-7 障礙物，1-3 湖泊
- **問題**：簡單和中等太相似

### 優化後
- 簡單：3-5 步，0-2 障礙物，0 湖泊，0-2 轉彎
- 中等：6-10 步，3-5 障礙物，1-2 湖泊，2-4 轉彎
- 困難：11-18 步，6-10 障礙物，2-4 湖泊，4-8 轉彎
- **改善**：明確的難度階梯，視覺和策略差異明顯

## 測試指標

### 量化指標
1. **完成時間差異**：困難關卡應該是簡單關卡的 3-5 倍
2. **嘗試次數**：困難關卡平均嘗試次數應該 > 3 次
3. **玩家反饋**：通過問卷確認難度感知
4. **關卡多樣性**：連續 10 個關卡不應有重複模式

### 質化指標
1. **視覺差異**：一眼能看出難度等級
2. **策略深度**：困難關卡需要更多思考
3. **學習曲線**：從簡單到困難有平滑過渡
