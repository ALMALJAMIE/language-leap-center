"""Unit vocabulary videos (MP4): one slide per word with narration. Reuses audio.py's TTS cache."""
import json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audio import say, gap, SR, ROOT  # noqa: E402

OUT = os.path.join(ROOT, "public/materials/english-foundations-live/video")
os.makedirs(OUT, exist_ok=True)
F = "/usr/share/fonts/truetype/dejavu/"
W, H = 1280, 720
BLUE, GOLD, WHITE, INK = (15, 76, 167), (239, 181, 42), (255, 255, 255), (20, 30, 50)

def font(size, bold=False):
    return ImageFont.truetype(F + ("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"), size)

def center(d, y, text, f, fill):
    w = d.textlength(text, font=f)
    d.text(((W - w) / 2, y), text, font=f, fill=fill)

def wrap(d, text, f, maxw):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) > maxw and cur:
            lines.append(cur); cur = w
        else:
            cur = t
    return lines + [cur]

def frame(path, unit, top, big, lines, ar=None, n=None):
    im = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 70], fill=BLUE); d.rectangle([0, 70, W, 76], fill=GOLD)
    d.text((40, 20), "LANGUAGE LEAP CENTER", font=font(24, True), fill=GOLD)
    d.text((W - 40 - d.textlength(unit, font=font(22)), 22), unit, font=font(22), fill=WHITE)
    if top:
        center(d, 120, top, font(28), (120, 120, 120))
    center(d, 190, big, font(96, True), BLUE)
    y = 340
    for t in lines:
        for ln in wrap(d, t, font(36), W - 200):
            center(d, y, ln, font(36), INK); y += 50
        y += 14
    if ar:
        f = font(40, True)   # Pillow has raqm: it shapes and orders Arabic itself
        w = d.textlength(ar, font=f, direction="rtl")
        d.text(((W - w) / 2, y + 10), ar, font=f, fill=(138, 100, 8), direction="rtl")
    if n:
        d.text((40, H - 50), n, font=font(22), fill=(150, 150, 150))
    im.save(path)

def segment(tmp, i, png, audio):
    wav = os.path.join(tmp, f"s{i}.wav"); mp4 = os.path.join(tmp, f"s{i}.mp4")
    sf.write(wav, audio, SR)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-framerate", "5", "-i", png, "-i", wav, "-shortest",
                    "-c:v", "libx264", "-preset", "veryfast", "-tune", "stillimage", "-pix_fmt", "yuv420p", "-r", "5",
                    "-c:a", "aac", "-b:a", "64k", "-ar", "24000", "-ac", "1", mp4], check=True)
    return mp4

if __name__ == "__main__":
    mods = json.load(open(os.path.join(ROOT, "src/data/lessons/foundations.json"), encoding="utf-8"))
    only = {int(a) for a in sys.argv[1:] if a.isdigit()}
    for ui, m in enumerate(mods):
        if only and ui + 1 not in only:
            continue
        out = os.path.join(OUT, f"unit-{ui + 1}.mp4")
        if os.path.exists(out) and "--force" not in sys.argv:
            continue
        unit = m["title"]
        with tempfile.TemporaryDirectory() as tmp:
            segs = []
            png = os.path.join(tmp, "t.png")
            frame(png, f"Unit {ui + 1}", "English Foundations · A1", f"Unit {ui + 1}", [unit.split("·", 1)[1].strip(), "Words — listen and repeat"])
            segs.append(segment(tmp, 0, png, np.concatenate([say(f"Unit {ui + 1}. {unit.split('·', 1)[1].strip()}. Listen and repeat."), gap(1.0)])))
            k = 0
            for li, l in enumerate(m["lessons"]):
                for w in l["words"]:
                    k += 1
                    png = os.path.join(tmp, f"f{k}.png")
                    frame(png, f"Unit {ui + 1} · {l['title']}", None, w["en"], [w["def"], "“" + w["ex"] + "”"], w["ar"], f"{k} / {sum(len(x['words']) for x in m['lessons'])}")
                    a = np.concatenate([say(w["en"], speed=0.8), gap(1.6), say(w["en"], speed=0.8), gap(0.6), say(w["ex"]), gap(1.6)])
                    segs.append(segment(tmp, k, png, a))
            lst = os.path.join(tmp, "list.txt")
            open(lst, "w").write("".join(f"file '{s}'\n" for s in segs))
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", out], check=True)
        print(out, flush=True)
