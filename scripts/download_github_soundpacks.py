import os
import subprocess
import tempfile
import urllib.request

OUT_DIR = "/Users/irul/Documents/PROJECT/aplikasi-anak/public/voices"
TMP_DIR = "/tmp/gh_soundpacks"
os.makedirs(TMP_DIR, exist_ok=True)
os.makedirs(OUT_DIR, exist_ok=True)

# 1. GitHub Raw Sources mapping
SOURCES = {
    # Letters from rzxyss/BelajarHuruf
    **{f"letter_{char}": f"https://raw.githubusercontent.com/rzxyss/BelajarHuruf/main/app/src/main/res/raw/{char}.mp3" 
       for char in "abcdefghijklmnopqrstuvwxyz"},

    # Numbers from arifaizin/MengenalAngka
    **{f"angka_{i:02d}": f"https://raw.githubusercontent.com/arifaizin/MengenalAngka/master/app/src/main/res/raw/angka{i:02d}.mp3"
       for i in range(1, 11)},
    "angka_ayo": "https://raw.githubusercontent.com/arifaizin/MengenalAngka/master/app/src/main/res/raw/angkaayo.mp3",
    "suara_hebat": "https://raw.githubusercontent.com/arifaizin/MengenalAngka/master/app/src/main/res/raw/suarabilalhebat.mp3",

    # Huruf Intro from arifaizin/MengenalHurufLatin
    "huruf_ayo": "https://raw.githubusercontent.com/arifaizin/MengenalHurufLatin/master/app/src/main/res/raw/hurufayo.mp3",

    # Warna Intro from arifaizin/MengenalWarna
    "warna_ayo": "https://raw.githubusercontent.com/arifaizin/MengenalWarna/master/app/src/main/res/raw/warnabalon.mp3",

    # Colors from arifaizin/MengenalWarna
    **{f"warna_{i:02d}": f"https://raw.githubusercontent.com/arifaizin/MengenalWarna/master/app/src/main/res/raw/warna{i:02d}.mp3"
       for i in range(1, 10)},

    # Animals from damz93/ZOO-ARA_Android & Anisa-Yunia/hewan
    "hewan_kucing": "https://raw.githubusercontent.com/damz93/ZOO-ARA_Android/master/app/src/main/res/raw/kucing.mp3",
    "hewan_sapi": "https://raw.githubusercontent.com/damz93/ZOO-ARA_Android/master/app/src/main/res/raw/sapi.mp3",
    "hewan_bebek": "https://raw.githubusercontent.com/damz93/ZOO-ARA_Android/master/app/src/main/res/raw/bebek.mp3",
    "hewan_gajah": "https://raw.githubusercontent.com/damz93/ZOO-ARA_Android/master/app/src/main/res/raw/gajah.mp3",
    "hewan_katak": "https://raw.githubusercontent.com/damz93/ZOO-ARA_Android/master/app/src/main/res/raw/katak.mp3",
    "hewan_burung": "https://raw.githubusercontent.com/damz93/ZOO-ARA_Android/master/app/src/main/res/raw/elang.mp3",
    "hewan_domba": "https://raw.githubusercontent.com/damz93/ZOO-ARA_Android/master/app/src/main/res/raw/domba.mp3",
    "hewan_harimau": "https://raw.githubusercontent.com/damz93/ZOO-ARA_Android/master/app/src/main/res/raw/harimau.mp3",
    "hewan_kera": "https://raw.githubusercontent.com/damz93/ZOO-ARA_Android/master/app/src/main/res/raw/kera.mp3",
    "hewan_lebah": "https://raw.githubusercontent.com/damz93/ZOO-ARA_Android/master/app/src/main/res/raw/lebah.mp3",
    "hewan_kuda": "https://raw.githubusercontent.com/damz93/ZOO-ARA_Android/master/app/src/main/res/raw/kuda.mp3",
    "hewan_paus": "https://raw.githubusercontent.com/damz93/ZOO-ARA_Android/master/app/src/main/res/raw/pausbungkuk.mp3",

    # Celebration from Ragit09/Edufunkids
    "yeay_children": "https://raw.githubusercontent.com/Ragit09/Edufunkids/main/music/yeay-childrens.mp3",
    "clapping": "https://raw.githubusercontent.com/Ragit09/Edufunkids/main/music/clapping-2.mp3",
    "correct_ding": "https://raw.githubusercontent.com/Ragit09/Edufunkids/main/music/correct.mp3",
    "completion_fanfare": "https://raw.githubusercontent.com/Ragit09/Edufunkids/main/music/completion.mp3",

    # Shapes from arifaizin/MengenalBentuk & rhzain/AR-101
    "bentuk_persegi": "https://raw.githubusercontent.com/arifaizin/MengenalBentuk/master/app/src/main/res/raw/suarabilal01.mp3",
    "bentuk_persegi_panjang": "https://raw.githubusercontent.com/arifaizin/MengenalBentuk/master/app/src/main/res/raw/suarabilal02.mp3",
    "bentuk_segitiga": "https://raw.githubusercontent.com/arifaizin/MengenalBentuk/master/app/src/main/res/raw/suarabilal03.mp3",
    "bentuk_belah_ketupat": "https://raw.githubusercontent.com/arifaizin/MengenalBentuk/master/app/src/main/res/raw/suarabilal07.mp3",
    "bentuk_lingkaran": "https://raw.githubusercontent.com/arifaizin/MengenalBentuk/master/app/src/main/res/raw/suarabilal08.mp3",
    "bentuk_bintang": "https://media.githubusercontent.com/media/rhzain/AR-101/main/Assets/Audio/Literacy/L1/07e-L1-Bintang.MP3",
}

def download_file(key: str, url: str) -> str:
    dest = os.path.join(TMP_DIR, f"{key}.mp3")
    if not os.path.exists(dest) or os.path.getsize(dest) == 0:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as resp, open(dest, "wb") as f:
            f.write(resp.read())
    return dest

def normalize(in_path: str, out_path: str, duration_limit: float = None):
    cmd = ["ffmpeg", "-y", "-i", in_path]
    if duration_limit:
        cmd.extend(["-t", str(duration_limit)])
    cmd.extend(["-ac", "1", "-ar", "44100", "-b:a", "48k", out_path])
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

def combine(in_paths: list[str], out_path: str):
    # concatenate multiple audio files with ffmpeg filter
    filter_inputs = "".join([f"[{i}:0]" for i in range(len(in_paths))])
    filter_complex = f"{filter_inputs}concat=n={len(in_paths)}:v=0:a=1[out]"
    cmd = ["ffmpeg", "-y"]
    for p in in_paths:
        cmd.extend(["-i", p])
    cmd.extend(["-filter_complex", filter_complex, "-map", "[out]", "-ac", "1", "-ar", "44100", "-b:a", "48k", out_path])
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

def main():
    print("Mengunduh sound packs asli dari GitHub...")
    downloaded = {}
    for key, url in SOURCES.items():
        try:
            downloaded[key] = download_file(key, url)
            print(f"  ✓ {key}")
        except Exception as e:
            print(f"  ✗ Gagal {key}: {e}")

    print("\nMemproses & Menormalkan Audio ke public/voices/...")

    # A - Z Letters: Crisp human pronunciation
    # Animal letters optionally combine letter + animal sound for extra toddler engagement!
    ANIMAL_LETTER_MAP = {
        "b": "hewan_bebek",
        "d": "hewan_domba",
        "e": "hewan_burung",
        "g": "hewan_gajah",
        "h": "hewan_harimau",
        "k": "hewan_kucing",
        "l": "hewan_lebah",
        "m": "hewan_kera",
        "p": "hewan_paus",
        "s": "hewan_sapi",
        "z": "hewan_kuda"
    }

    for char in "abcdefghijklmnopqrstuvwxyz":
        out_file = os.path.join(OUT_DIR, f"letter-{char}.mp3")
        letter_raw = downloaded.get(f"letter_{char}")
        animal_key = ANIMAL_LETTER_MAP.get(char)
        if animal_key and animal_key in downloaded:
            # Combine letter pronunciation + short animal sound
            animal_raw = downloaded[animal_key]
            # normalize animal to max 1.5s
            tmp_anim = os.path.join(TMP_DIR, f"tmp_anim_{char}.mp3")
            normalize(animal_raw, tmp_anim, duration_limit=1.4)
            combine([letter_raw, tmp_anim], out_file)
        else:
            normalize(letter_raw, out_file)
        print(f"  ✓ letter-{char}.mp3")

    # Numbers 1 - 10: Authentic human counts ("Satu", "Dua", etc.)
    for i in range(1, 11):
        num_raw = downloaded[f"angka_{i:02d}"]
        normalize(num_raw, os.path.join(OUT_DIR, f"number-{i}.mp3"))
        normalize(num_raw, os.path.join(OUT_DIR, f"count-{i}.mp3"))
        print(f"  ✓ number-{i}.mp3 & count-{i}.mp3")

    # Animals in Sensory Play
    normalize(downloaded["hewan_kucing"], os.path.join(OUT_DIR, "animal-cat.mp3"), 2.0)
    normalize(downloaded["hewan_sapi"], os.path.join(OUT_DIR, "animal-cow.mp3"), 2.2)
    normalize(downloaded["hewan_bebek"], os.path.join(OUT_DIR, "animal-duck.mp3"), 2.0)
    normalize(downloaded["hewan_gajah"], os.path.join(OUT_DIR, "animal-elephant.mp3"), 2.2)
    normalize(downloaded["hewan_katak"], os.path.join(OUT_DIR, "animal-frog.mp3"), 2.0)
    normalize(downloaded["hewan_burung"], os.path.join(OUT_DIR, "animal-bird.mp3"), 2.0)
    print("  ✓ Hewan (kucing, sapi, bebek, gajah, katak, burung)")

    # Colors
    # warna01=merah, warna02=kuning, warna03=hijau, warna04=biru, warna05=ungu, warna06=jingga, warna07=cokelat, warna08=merah muda
    COLOR_MAP = {
        "color-palette-merah": "warna_01",
        "color-palette-kuning": "warna_02",
        "color-palette-hijau": "warna_03",
        "color-palette-biru": "warna_04",
        "color-palette-ungu": "warna_05",
        "color-palette-jingga": "warna_06",
        "color-palette-cokelat": "warna_07",
        "color-palette-pink": "warna_08",
    }
    for clip_id, warna_key in COLOR_MAP.items():
        if warna_key in downloaded:
            normalize(downloaded[warna_key], os.path.join(OUT_DIR, f"{clip_id}.mp3"))
            print(f"  ✓ {clip_id}.mp3")

    # Celebrations: real children cheering & clapping (100% human joy!)
    cheer_raw = downloaded["yeay_children"]
    clapping_raw = downloaded["clapping"]
    hebat_raw = downloaded["suara_hebat"]
    fanfare_raw = downloaded["completion_fanfare"]

    # Combine "Hebat!" + Children "Yeeay!"
    tmp_celebration = os.path.join(TMP_DIR, "tmp_celebration.mp3")
    combine([hebat_raw, cheer_raw], tmp_celebration)

    # Apply to all celebration hooks
    for done_key in ["alphabet-done", "numbers-done", "puzzle-done", "balloon-done", "shapes-done", "trace-done", "coloring-done", "motor-done"]:
        normalize(tmp_celebration, os.path.join(OUT_DIR, f"{done_key}.mp3"))

    # Intros: Dedicated to each activity!
    # 1. Huruf: Ayo belajar huruf!
    normalize(downloaded["huruf_ayo"], os.path.join(OUT_DIR, "alphabet-intro.mp3"))
    print("  ✓ alphabet-intro.mp3 (Ayo belajar huruf!)")

    # 2. Angka: Ayo belajar angka! (ONLY FOR NUMBERS!)
    normalize(downloaded["angka_ayo"], os.path.join(OUT_DIR, "numbers-intro.mp3"))
    print("  ✓ numbers-intro.mp3 (Ayo belajar angka!)")

    # 3. Warna: Ayo belajar warna!
    normalize(downloaded["warna_ayo"], os.path.join(OUT_DIR, "coloring-intro.mp3"))
    print("  ✓ coloring-intro.mp3 (Ayo belajar warna!)")

    # 4. Other games: Cheerful chime motifs (NEVER "ayo belajar angka"!)
    normalize(downloaded["completion_fanfare"], os.path.join(OUT_DIR, "shapes-intro.mp3"))
    normalize(downloaded["completion_fanfare"], os.path.join(OUT_DIR, "sensory-intro.mp3"))
    normalize(downloaded["correct_ding"], os.path.join(OUT_DIR, "puzzle-intro.mp3"))
    normalize(downloaded["correct_ding"], os.path.join(OUT_DIR, "balloon-intro.mp3"))

    # Shape Human Voice Recordings
    SHAPE_MAP = {
        "circle": "bentuk_lingkaran",
        "square": "bentuk_persegi",
        "triangle": "bentuk_segitiga",
        "diamond": "bentuk_belah_ketupat",
        "star": "bentuk_bintang"
    }
    tmp_correct = os.path.join(TMP_DIR, "tmp_correct.mp3")
    combine([downloaded["correct_ding"], hebat_raw], tmp_correct)

    for shape, key in SHAPE_MAP.items():
        if key in downloaded:
            normalize(downloaded[key], os.path.join(OUT_DIR, f"shape-ok-{shape}.mp3"))
            normalize(downloaded[key], os.path.join(OUT_DIR, f"shape-hint-{shape}.mp3"))
            print(f"  ✓ shape-ok-{shape}.mp3 & shape-hint-{shape}.mp3")
    # Heart fallback to correct chime + hebat
    normalize(tmp_correct, os.path.join(OUT_DIR, "shape-ok-heart.mp3"))
    normalize(downloaded["correct_ding"], os.path.join(OUT_DIR, "shape-hint-heart.mp3"))

    # Board reset / new puzzles: Cheerful chime fanfare (NEVER "ayo belajar angka"!)
    normalize(downloaded["completion_fanfare"], os.path.join(OUT_DIR, "shapes-new-board.mp3"))
    normalize(downloaded["completion_fanfare"], os.path.join(OUT_DIR, "puzzle-new.mp3"))

    # Balloon pop great & puzzle snap
    normalize(downloaded["correct_ding"], os.path.join(OUT_DIR, "puzzle-snap.mp3"))
    normalize(downloaded["correct_ding"], os.path.join(OUT_DIR, "balloon-pop-great.mp3"))

    print("\nSemua sound pack manusia asli dari GitHub berhasil dipasang dan dioptimalkan!")

if __name__ == "__main__":
    main()
