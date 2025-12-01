# 移除角色圖片白色背景指南

## 問題
角色圖片（兔子和恐龍）雖然是 PNG 格式，但圖片文件本身包含白色背景，導致在遊戲中顯示時有白色方框。

## 解決方案

### 方法 1: 使用線上工具（最簡單）
1. 訪問 https://www.remove.bg/ 或 https://www.photoroom.com/tools/background-remover
2. 上傳以下圖片：
   - `rabbit_to_down.png`
   - `rabbit_to_left.png`
   - `rabbit_to_right.png`
   - `rabbit_to_up.png`
   - `rabbit_jump.png`
   - `rabbit_win.png`
   - `dino_down.png`
   - `dino_left.png`
   - `dino_right.png`
   - `dino_up.png`
   - `dino_jump.png`
   - `dino_win.png`
3. 下載處理後的圖片
4. 替換 `/public/images/animals-game/` 中的原圖片

### 方法 2: 使用 Photoshop/GIMP
1. 打開圖片
2. 使用魔術棒工具選擇白色背景
3. 刪除選區
4. 另存為 PNG（確保勾選「透明度」選項）

### 方法 3: 使用 Python 腳本（需要安裝 Pillow）
我已經創建了腳本在 `scripts/remove_white_bg.py`

運行步驟：
```bash
# 創建虛擬環境
python3 -m venv venv
source venv/bin/activate

# 安裝依賴
pip install Pillow

# 運行腳本
python scripts/remove_white_bg.py

# 退出虛擬環境
deactivate
```

## 圖片位置
所有需要處理的圖片都在：
`/Users/simonwang/Projects/KidsApp/kidapp/public/images/animals-game/`

## 驗證
處理完成後，重新載入遊戲頁面，角色應該不再有白色方框。
