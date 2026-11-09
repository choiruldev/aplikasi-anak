import asyncio
import os
import subprocess
import edge_tts

VOICE = "id-ID-GadisNeural"
RATE = "+0%"
PITCH = "+3Hz"

CLIPS = {
    "color-toddler-intro": "Ayo main warna!",
    "color-toddler-merah": "Merah!",
    "color-toddler-kuning": "Kuning!",
    "color-toddler-hijau": "Hijau!",
    "color-toddler-biru": "Biru!",
    "color-toddler-jingga": "Jingga!",
    "color-toddler-ungu": "Ungu!",
    "color-toddler-pink": "Pink!",
    "color-toddler-done": "Horeee! Pintar sekali!"
}

OUT_DIR = "public/voices"

async def generate():
    os.makedirs(OUT_DIR, exist_ok=True)
    for clip_id, text in CLIPS.items():
        raw_path = f"/tmp/{clip_id}.mp3"
        final_path = os.path.join(OUT_DIR, f"{clip_id}.mp3")
        print(f"Generating {clip_id}: '{text}'...")
        communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
        await communicate.save(raw_path)
        
        # Normalize with ffmpeg
        cmd = [
            "ffmpeg", "-y", "-i", raw_path,
            "-ar", "44100", "-ac", "1", "-b:a", "64k",
            final_path
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        print(f"Saved {final_path}")

if __name__ == "__main__":
    asyncio.run(generate())
