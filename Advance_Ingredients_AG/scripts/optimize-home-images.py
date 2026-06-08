from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"


def save_webp(src_name: str, dest_name: str, width: int, quality: int) -> None:
    src = PUBLIC / src_name
    dest = PUBLIC / dest_name

    with Image.open(src) as img:
        img = img.convert("RGBA")
        ratio = width / img.width
        height = max(1, int(img.height * ratio))
        resized = img.resize((width, height), Image.Resampling.LANCZOS)
        dest.parent.mkdir(parents=True, exist_ok=True)
        resized.save(dest, format="WEBP", quality=quality, method=6)


def main() -> None:
    save_webp("heropage.png", "optimized/home-hero.webp", width=1920, quality=68)
    save_webp("FOONEXUS-logo.png", "optimized/foonexus-logo.webp", width=320, quality=72)
    save_webp("LVEO-logo.jpg", "optimized/lveo-logo.webp", width=320, quality=78)
    save_webp("NEULINK-logo.png", "optimized/neulink-logo.webp", width=320, quality=78)


if __name__ == "__main__":
    main()
