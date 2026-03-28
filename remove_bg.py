import os
from PIL import Image

def remove_background(image_path):
    print(f"Processing {image_path}...")
    img = Image.open(image_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # If the pixel is semi-white (above 230 on all channels), make it transparent
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(image_path, "PNG")

assets_dir = r"C:\Users\meqda\.gemini\antigravity\scratch\sahur-bird\assets"
for filename in os.listdir(assets_dir):
    if filename.endswith(".png"):
        remove_background(os.path.join(assets_dir, filename))
