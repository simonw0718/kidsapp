# 如何新增著色圖片

## 步驟（自動偵測版本）✨

1. **將圖片放入資料夾**
   - 將 PNG 圖片檔案放到 `/src/assets/images/color-garden/` 資料夾
   - 建議檔名格式：`category_name_number.png`（例如：`animal_cat_01.png`）

2. **重新整理**
   - **方法 1（自動）**：Vite 開發伺服器通常會自動偵測並更新
   - **方法 2（手動）**：點擊圖片選擇器右上角的「🔄 同步」按鈕
   - **方法 3（手動）**：重新整理瀏覽器頁面（F5 或 Cmd+R）

3. **完成！**
   - 新圖片會出現在選擇器中
   - **不需要手動更新任何配置檔案** 🎉

## 技術說明

### 為什麼現在可以自動偵測？

- 使用 Vite 的 `import.meta.glob` 功能
- 圖片放在 `src/assets/` 目錄（而非 `public/`）
- Vite 會在建置時自動掃描並打包這些圖片
- 每次新增圖片後，開發伺服器會自動更新

### 與 public 目錄的差異

| 特性 | src/assets | public |
|------|-----------|--------|
| 自動偵測 | ✅ 是 | ❌ 否 |
| 需要手動配置 | ❌ 否 | ✅ 是 |
| 建置時優化 | ✅ 是 | ❌ 否 |
| 檔案雜湊 | ✅ 是 | ❌ 否 |

## 圖片建議

- **格式**：PNG（支援透明背景）
- **尺寸**：建議至少 1000x1000 像素
- **內容**：黑色線條，白色或透明背景
- **檔案大小**：建議小於 2MB 以確保快速載入

## 舊圖片遷移

如果你之前有圖片在 `public/images/color-garden/`，請將它們複製到 `src/assets/images/color-garden/`：

```bash
cp public/images/color-garden/*.png src/assets/images/color-garden/
```
