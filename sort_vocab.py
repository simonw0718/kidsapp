#!/usr/bin/env python3
"""
重新排序 vocab.ts 檔案
按照 difficulty level 排列，恐龍放在最後
"""

import re

# 讀取檔案
input_file = '/Users/simonwang/Projects/KidsApp/kidapp/src/features/picture-match/data/vocab.ts'
output_file = '/Users/simonwang/Projects/KidsApp/kidapp/src/features/picture-match/data/vocab_sorted.ts'

with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 分離檔案頭（type 定義等）和資料部分
split_point = content.find('export const VOCAB_LIST: VocabItem[] = [')
if split_point == -1:
    print("Error: Cannot find VOCAB_LIST declaration")
    exit(1)

header = content[:split_point + len('export const VOCAB_LIST: VocabItem[] = [')]
footer = '\n];\n'

# 提取所有的 vocab items（包含完整的物件定義）
# 使用更精確的正則表達式來匹配整個物件
items_text = content[split_point + len('export const VOCAB_LIST: VocabItem[] = ['):]
items_text = items_text[:items_text.rfind('];')]

# 分割成個別的 items
items = []
current_item = ''
brace_count = 0
in_item = False

for line in items_text.split('\n'):
    stripped = line.strip()
    
    if stripped.startswith('{'):
        in_item = True
        brace_count = 1
        current_item = line + '\n'
    elif in_item:
        current_item += line + '\n'
        brace_count += stripped.count('{') - stripped.count('}')
        
        if brace_count == 0:
            # 完整的 item
            items.append(current_item)
            current_item = ''
            in_item = False

# 解析並排序
parsed_items = []
for item_text in items:
    # 提取 difficulty, category, id
    difficulty_match = re.search(r'difficulty:\s*(\d+)', item_text)
    category_match = re.search(r"category:\s*'([^']+)'", item_text)
    id_match = re.search(r"id:\s*'([^']+)'", item_text)
    
    if difficulty_match and category_match and id_match:
        difficulty = int(difficulty_match.group(1))
        category = category_match.group(1)
        item_id = id_match.group(1)
        is_dinosaur = (category == 'dinosaur')
        
        parsed_items.append({
            'text': item_text,
            'difficulty': difficulty,
            'category': category,
            'id': item_id,
            'is_dinosaur': is_dinosaur
        })

# 排序：先按 difficulty，恐龍放最後
def sort_key(item):
    if item['is_dinosaur']:
        return (999, item['difficulty'], item['id'])  # 恐龍放最後
    else:
        return (item['difficulty'], item['category'], item['id'])

parsed_items.sort(key=sort_key)

# 統計
level_counts = {1: 0, 2: 0, 3: 0}
dinosaur_count = 0
for item in parsed_items:
    if item['is_dinosaur']:
        dinosaur_count += 1
    else:
        level_counts[item['difficulty']] += 1

print(f"✅ 排序完成！")
print(f"📊 統計資訊：")
print(f"  Level 1: {level_counts[1]} items")
print(f"  Level 2: {level_counts[2]} items")
print(f"  Level 3: {level_counts[3]} items")
print(f"  🦕 Dinosaurs: {dinosaur_count} items")
print(f"  📦 Total: {len(parsed_items)} items")

# 重新組合檔案
output_content = header + '\n'

# Level 1
output_content += '  // ==========================================\n'
output_content += '  // Level 1 (難度 1)\n'
output_content += '  // ==========================================\n'
for item in parsed_items:
    if item['difficulty'] == 1 and not item['is_dinosaur']:
        output_content += item['text']

# Level 2
output_content += '\n  // ==========================================\n'
output_content += '  // Level 2 (難度 2)\n'
output_content += '  // ==========================================\n'
for item in parsed_items:
    if item['difficulty'] == 2 and not item['is_dinosaur']:
        output_content += item['text']

# Level 3
output_content += '\n  // ==========================================\n'
output_content += '  // Level 3 (難度 3)\n'
output_content += '  // ==========================================\n'
for item in parsed_items:
    if item['difficulty'] == 3 and not item['is_dinosaur']:
        output_content += item['text']

# Dinosaurs
output_content += '\n  // ==========================================\n'
output_content += '  // Dinosaurs (恐龍) - All Levels\n'
output_content += '  // ==========================================\n'
for item in parsed_items:
    if item['is_dinosaur']:
        output_content += item['text']

output_content += footer

# 寫入檔案
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(output_content)

print(f"\n✅ 已儲存至: {output_file}")
print(f"📝 請檢查後，使用以下指令替換原檔案：")
print(f"   mv {output_file} {input_file}")
