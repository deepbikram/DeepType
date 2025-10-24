#!/usr/bin/env python3
"""
Script to remove Chinese characters from vocabulary JSON files.
Keeps only English words in the 'val' field (definitions).
"""

import json
import re
import os

def remove_chinese(text):
    """Remove Chinese characters from text, keeping only English and common punctuation."""
    # Pattern to match Chinese characters (Unicode range for CJK)
    chinese_pattern = r'[\u4e00-\u9fff\u3400-\u4dbf\uff00-\uffef]+'
    
    # Remove Chinese characters
    cleaned = re.sub(chinese_pattern, '', text)
    
    # Clean up extra spaces and punctuation
    cleaned = re.sub(r'\s+', ' ', cleaned)  # Multiple spaces to single space
    cleaned = re.sub(r'[；、，。]', '', cleaned)  # Remove Chinese punctuation
    cleaned = cleaned.strip(' ,;.')  # Remove leading/trailing punctuation
    
    return cleaned.strip()

def process_vocab_file(filepath):
    """Process a vocabulary JSON file to remove Chinese characters."""
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Process each entry
    modified = False
    for key, entry in data.items():
        if 'val' in entry:
            original_val = entry['val']
            cleaned_val = remove_chinese(original_val)
            
            # If no English left after cleaning, use just the key (word itself)
            if not cleaned_val or len(cleaned_val) < 2:
                cleaned_val = entry['key']
            
            if cleaned_val != original_val:
                entry['val'] = cleaned_val
                modified = True
    
    if modified:
        # Write back to file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)
        print(f"✓ Updated {filepath}")
    else:
        print(f"  No changes needed for {filepath}")

def main():
    vocab_dir = 'src/assets/Vocab'
    vocab_files = [
        'GREWords.json',
        'TOEFLWords.json',
        'CET4Words.json',
        'CET6Words.json'
    ]
    
    for filename in vocab_files:
        filepath = os.path.join(vocab_dir, filename)
        if os.path.exists(filepath):
            process_vocab_file(filepath)
        else:
            print(f"! File not found: {filepath}")
    
    print("\n✓ Done! All vocabulary files have been processed.")

if __name__ == '__main__':
    main()
