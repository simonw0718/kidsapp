#!/usr/bin/env python3
"""
Remove white/light background from PNG images and make them fully transparent.
"""

import os
from pathlib import Path
from PIL import Image

def remove_white_background(input_path, output_path=None, threshold=240):
    """
    Remove white/light background from PNG image.
    
    Args:
        input_path: Path to input PNG file
        output_path: Path to save output (defaults to overwriting input)
        threshold: RGB value threshold for considering a pixel as "white" (0-255)
    """
    if output_path is None:
        output_path = input_path
    
    # Open image
    img = Image.open(input_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Get pixel data
    pixels = img.load()
    width, height = img.size
    
    # Process each pixel
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # If pixel is white/light (all RGB values above threshold)
            if r >= threshold and g >= threshold and b >= threshold:
                # Make it fully transparent
                pixels[x, y] = (r, g, b, 0)
    
    # Save
    img.save(output_path, 'PNG')
    print(f"✓ Processed: {os.path.basename(input_path)}")

def main():
    # Path to images directory
    images_dir = Path('/Users/simonwang/Projects/KidsApp/kidapp/public/images/animals-game')
    
    # List of images to process
    images_to_process = [
        'rabbit_to_down.png',
        'rabbit_to_left.png',
        'rabbit_to_right.png',
        'rabbit_to_up.png',
        'rabbit_jump.png',
        'rabbit_win.png',
        'dino_down.png',
        'dino_left.png',
        'dino_right.png',
        'dino_up.png',
        'dino_jump.png',
        'dino_win.png',
    ]
    
    print("🎨 Starting background removal...")
    print(f"📊 Threshold: {240} (pixels with RGB >= 240 will be made transparent)")
    print("=" * 60)
    
    processed = 0
    for image_name in images_to_process:
        image_path = images_dir / image_name
        if image_path.exists():
            try:
                remove_white_background(str(image_path), threshold=240)
                processed += 1
            except Exception as e:
                print(f"✗ Error processing {image_name}: {e}")
        else:
            print(f"⚠ Not found: {image_name}")
    
    print("=" * 60)
    print(f"✅ Done! Processed {processed}/{len(images_to_process)} images.")

if __name__ == '__main__':
    main()
