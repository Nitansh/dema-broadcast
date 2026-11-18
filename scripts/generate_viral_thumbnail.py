#!/usr/bin/env python3
"""
Universal Viral Thumbnail Generator for DEMA Financial Broadcasts & Reels.
Produces high-CTR, high-contrast, broadcast-grade thumbnails in 16:9 and 9:16.
Supports Hinglish / English headlines, split-flap badges, gold/emerald neon glows, and chart zooms.
"""

import argparse
import json
import math
import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def load_fonts():
    try:
        font_title = ImageFont.truetype(r"C:\Windows\Fonts\impact.ttf", 115)
        font_sub_hi = ImageFont.truetype(r"C:\Windows\Fonts\Nirmala.ttc", 72, index=0)
        font_pill = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 38)
        font_badge = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 32)
        font_small = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 24)
        font_logo_d = ImageFont.truetype(r"C:\Windows\Fonts\impact.ttf", 54)
        font_vert_title = ImageFont.truetype(r"C:\Windows\Fonts\impact.ttf", 100)
    except Exception as e:
        default = ImageFont.load_default()
        font_title = font_sub_hi = font_pill = font_badge = font_small = font_logo_d = font_vert_title = default
    return {
        "title": font_title,
        "sub_hi": font_sub_hi,
        "pill": font_pill,
        "badge": font_badge,
        "small": font_small,
        "logo_d": font_logo_d,
        "vert_title": font_vert_title
    }

def create_16x9_viral_thumbnail(
    out_path: str,
    headline_top: str = "NIFTY 50 BLAST +96 PTS",
    sub_hinglish: str = "136M Volume Breakout! बड़ा उलटफेर?",
    badge_text: str = "DAILY STUDY PACK · 2026",
    chart_path: str = None,
    stock_pills: list = None
):
    W, H = 1920, 1080
    fonts = load_fonts()

    # 1. Base Dark Tech Slate
    base = Image.new("RGBA", (W, H), (9, 13, 20, 255))
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)

    # Ambient volumetric glows
    glow_draw.ellipse([(-200, -200), (950, 950)], fill=(16, 185, 129, 65))    # Emerald Bullish
    glow_draw.ellipse([(1000, 250), (2200, 1300)], fill=(245, 158, 11, 55))  # Amber/Gold Target
    glow_draw.ellipse([(500, 350), (1600, 1100)], fill=(6, 182, 212, 45))     # Cyan Inflection
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(110))
    base = Image.alpha_composite(base, glow_layer)

    # 2. Add Chart Snapshot on the right if provided
    if chart_path and os.path.exists(chart_path):
        try:
            chart_img = Image.open(chart_path).convert("RGBA")
            cw = 1100
            ch = int(cw * (chart_img.height / chart_img.width))
            chart_resized = chart_img.resize((cw, ch), Image.Resampling.LANCZOS)
            
            chart_x = W - cw - 40
            chart_y = (H - ch) // 2 + 35
            
            card_glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            cdraw = ImageDraw.Draw(card_glow)
            cdraw.rounded_rectangle(
                [chart_x - 12, chart_y - 12, chart_x + cw + 12, chart_y + ch + 12],
                radius=20, fill=(16, 185, 129, 90)
            )
            card_glow = card_glow.filter(ImageFilter.GaussianBlur(32))
            base = Image.alpha_composite(base, card_glow)
            base.paste(chart_resized, (chart_x, chart_y), chart_resized)
            
            bdraw = ImageDraw.Draw(base)
            bdraw.rounded_rectangle(
                [chart_x, chart_y, chart_x + cw, chart_y + ch],
                radius=16, outline=(52, 211, 153, 230), width=4
            )
        except Exception as e:
            print(f"Warning: could not process chart image: {e}")

    draw = ImageDraw.Draw(base)

    # 3. Channel Branding Header
    draw.rounded_rectangle([60, 60, 130, 130], radius=12, fill=(242, 207, 29, 255))
    draw.text((79, 64), "D", font=fonts["logo_d"], fill=(12, 14, 18, 255))
    draw.text((150, 72), "DEMA ANALYSIS", font=fonts["pill"], fill=(244, 241, 232, 255))

    # Live Badge
    dema_len = int(draw.textlength("DEMA ANALYSIS", font=fonts["pill"]))
    badge_x = 150 + dema_len + 25
    badge_str = f"● {badge_text}"
    badge_w = int(draw.textlength(badge_str, font=fonts["badge"])) + 36
    draw.rounded_rectangle([badge_x, 72, badge_x + badge_w, 122], radius=8, fill=(239, 68, 68, 240))
    draw.text((badge_x + 18, 80), badge_str, font=fonts["badge"], fill=(255, 255, 255, 255))

    # 4. Bold Impact Headline (Left Column)
    tx = 60
    ty = 190

    # Yellow Accent Pill
    draw.rounded_rectangle([tx, ty, tx + 480, ty + 54], radius=10, fill=(242, 207, 29, 255))
    draw.text((tx + 20, ty + 8), "ALGORITHMIC TECHNICAL STUDY", font=fonts["badge"], fill=(12, 14, 18, 255))

    # Main Top Headline
    ty += 75
    draw.text((tx + 4, ty + 4), headline_top, font=fonts["title"], fill=(0, 0, 0, 220))
    draw.text((tx, ty), headline_top, font=fonts["title"], fill=(255, 255, 255, 255))

    # Hinglish Punchline
    ty += 135
    draw.text((tx + 3, ty + 3), sub_hinglish, font=fonts["sub_hi"], fill=(0, 0, 0, 220))
    draw.text((tx, ty), sub_hinglish, font=fonts["sub_hi"], fill=(242, 207, 29, 255))

    # 5. Stock Badges Matrix
    if not stock_pills:
        stock_pills = [
            ("FIRSTCRY", "+12.85%", (16, 185, 129)),
            ("TECHM", "50 DEMA TEST", (59, 130, 246)),
            ("ONGC", "SUPPORT LEVEL", (245, 158, 11)),
            ("TATAPOWER", "POC DEFENSE", (239, 68, 68)),
        ]

    by = 540
    card_w = 660
    for sym, val, col in stock_pills:
        draw.rounded_rectangle([tx, by, tx + card_w, by + 86], radius=14, fill=(27, 30, 35, 230), outline=(55, 65, 81, 255), width=2)
        draw.text((tx + 24, by + 22), sym, font=fonts["pill"], fill=(255, 255, 255, 255))
        val_w = int(draw.textlength(val, font=fonts["badge"])) + 32
        vx2 = tx + card_w - 18
        vx1 = vx2 - max(val_w, 200)
        draw.rounded_rectangle([vx1, by + 16, vx2, by + 70], radius=10, fill=(col[0], col[1], col[2], 50), outline=col, width=2)
        draw.text((vx1 + 16, by + 24), val, font=fonts["badge"], fill=col)
        by += 105

    # 6. Bottom Strap Notice
    draw.rounded_rectangle([tx, 970, tx + 820, 1020], radius=8, fill=(18, 20, 23, 240), outline=(242, 207, 29, 180), width=1)
    draw.text((tx + 20, 982), "STRICTLY EDUCATIONAL TECHNICAL STUDY · NO SEBI ADVISORY CLAIMS", font=fonts["small"], fill=(212, 176, 100, 255))

    out = base.convert("RGB")
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    out.save(out_path, "JPEG", quality=95)
    print(f"✓ 16:9 Viral Thumbnail generated: {out_path}")
    return out_path

def create_9x16_reel_thumbnail(
    out_path: str,
    title_top: str,
    subtitle_hinglish: str,
    ticker: str,
    chart_path: str = None
):
    W, H = 1080, 1920
    fonts = load_fonts()

    base = Image.new("RGBA", (W, H), (9, 13, 20, 255))
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow_layer)
    gdraw.ellipse([(100, 200), (980, 1080)], fill=(16, 185, 129, 65))
    gdraw.ellipse([(200, 1000), (1000, 1800)], fill=(245, 158, 11, 55))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(100))
    base = Image.alpha_composite(base, glow_layer)

    # Chart Zoom in Center
    if chart_path and os.path.exists(chart_path):
        try:
            chart_img = Image.open(chart_path).convert("RGBA")
            cw = 1000
            ch = int(cw * (chart_img.height / chart_img.width))
            chart_resized = chart_img.resize((cw, ch), Image.Resampling.LANCZOS)
            cx = (W - cw) // 2
            cy = (H - ch) // 2 - 50
            base.paste(chart_resized, (cx, cy), chart_resized)
            bdraw = ImageDraw.Draw(base)
            bdraw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=16, outline=(242, 207, 29, 200), width=3)
        except Exception as e:
            print(f"Notice: chart placement skipped: {e}")

    draw = ImageDraw.Draw(base)

    # Header Brand
    draw.rounded_rectangle([60, 60, 130, 130], radius=12, fill=(242, 207, 29, 255))
    draw.text((79, 64), "D", font=fonts["logo_d"], fill=(12, 14, 18, 255))
    draw.text((150, 74), f"DEMA ANALYSIS · {ticker}", font=fonts["pill"], fill=(255, 255, 255, 255))

    # Top Headline
    draw.text((60, 180), title_top, font=fonts["vert_title"], fill=(255, 255, 255, 255))
    draw.text((60, 290), subtitle_hinglish, font=fonts["sub_hi"], fill=(242, 207, 29, 255))

    # Bottom Callout Card
    draw.rounded_rectangle([60, 1680, W - 60, 1840], radius=20, fill=(27, 30, 35, 240), outline=(52, 211, 153, 240), width=3)
    draw.text((100, 1715), f"COMPLETE DEMA & VOLUME PROFILE STUDY", font=fonts["pill"], fill=(255, 255, 255, 255))
    draw.text((100, 1775), "EDUCATIONAL ONLY · NO TIPS", font=fonts["badge"], fill=(212, 176, 100, 255))

    out = base.convert("RGB")
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    out.save(out_path, "JPEG", quality=95)
    print(f"✓ 9:16 Reel Thumbnail generated: {out_path}")
    return out_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Universal Viral Thumbnail Generator")
    parser.add_argument("--out", type=str, default="viral_thumbnail.jpg")
    parser.add_argument("--format", type=str, choices=["16x9", "9x16"], default="16x9")
    parser.add_argument("--headline", type=str, default="NIFTY 50 BLAST +96 PTS")
    parser.add_argument("--sub", type=str, default="136M Volume Breakout! बड़ा उलटफेर?")
    parser.add_argument("--ticker", type=str, default="NIFTY 50")
    parser.add_argument("--chart", type=str, default=None)
    args = parser.parse_args()

    if args.format == "16x9":
        create_16x9_viral_thumbnail(args.out, args.headline, args.sub, chart_path=args.chart)
    else:
        create_9x16_reel_thumbnail(args.out, args.headline, args.sub, args.ticker, chart_path=args.chart)
