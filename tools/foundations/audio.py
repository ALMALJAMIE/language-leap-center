"""Lesson audio (MP3) for English Foundations — Kokoro TTS (model files in /tmp/tts)."""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "public/materials/english-foundations-live/audio")
os.makedirs(OUT, exist_ok=True)
k = Kokoro("/tmp/tts/model.onnx", "/tmp/tts/voices.bin")
MALE = {"Omar", "Yusuf", "Waiter", "Seller", "Doctor", "Mr Adam"}
NARR, FEM, MAL = "af_heart", "af_bella", "am_michael"
SR = 24000

CACHE = "/tmp/tts/cache"
os.makedirs(CACHE, exist_ok=True)

def say(text, voice=NARR, speed=0.85):
    import hashlib
    key = os.path.join(CACHE, hashlib.md5(f"{voice}|{speed}|{text}".encode()).hexdigest() + ".npy")
    if os.path.exists(key):
        return np.load(key)
    s, sr = k.create(text, voice=voice, speed=speed, lang="en-us")
    s = s.astype(np.float32)
    np.save(key, s)
    return s

def gap(sec):
    return np.zeros(int(SR * sec), dtype=np.float32)

def lesson_audio(lesson, n):
    parts = [say(f"Lesson {n}. {lesson['title']}."), gap(1.0), say("Words. Listen and repeat."), gap(0.8)]
    for w in lesson["words"]:
        parts += [say(w["en"], speed=0.8), gap(1.6), say(w["en"], speed=0.8), gap(0.6), say(w["ex"]), gap(1.8)]
    parts += [gap(0.6), say("Sentences. Listen and repeat."), gap(0.8)]
    for s in lesson["sentences"]:
        parts += [say(s["en"]), gap(2.6)]
    parts += [gap(0.6), say("Dialogue."), gap(0.8)]
    for d in lesson["dialogue"]:
        parts += [say(d["en"], MAL if d["who"] in MALE else FEM, 0.9), gap(0.7)]
    return np.concatenate(parts)

def save_mp3(audio, path):
    wav = path[:-4] + ".wav"
    sf.write(wav, audio, SR)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-ac", "1", "-b:a", "64k", path], check=True)
    os.remove(wav)

if __name__ == "__main__":
    mods = json.load(open(os.path.join(ROOT, "src/data/lessons/foundations.json")))
    n = 0
    for m in mods:
        for l in m["lessons"]:
            n += 1
            p = os.path.join(OUT, f"lesson-{n:02d}.mp3")
            if os.path.exists(p) and "--force" not in sys.argv:
                continue
            save_mp3(lesson_audio(l, n), p)
            print(p, flush=True)
    # final exam listening script
    ex = json.load(open(os.path.join(ROOT, "private/exams.json")))
    script = next(s for s in ex["final_exam"]["sections"] if "script" in s)["script"]
    parts = [say("Final exam. Part D. Listening. You will hear the conversation two times."), gap(1.5)]
    for rep in range(2):
        for d in script:
            parts += [say(d["en"], MAL if d["who"] in MALE else FEM, 0.9), gap(0.8)]
        parts += [gap(3)]
        if rep == 0:
            parts += [say("Now listen again."), gap(1.5)]
    save_mp3(np.concatenate(parts), os.path.join(OUT, "final-exam-listening.mp3"))
    print("done")
