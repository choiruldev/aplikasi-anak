import asyncio
import os
import subprocess
import tempfile
import edge_tts

OUT_DIR = "/Users/irul/Documents/PROJECT/aplikasi-anak/public/voices"
VOICE = "id-ID-GadisNeural"
RATE = "+8%"
PITCH = "+7Hz"

CLIPS = {
    # ================= ALPHABET (A - Z) =================
    "alphabet-intro": "Halo teman-teman! Yuk, kita mengenal huruf A sampai Z! Sentuh huruf yang kamu suka ya!",
    "alphabet-done": "Horeee! Keren banget! Kamu sudah pintar mengenal semua huruf A sampai Z! Tos dulu, yeeay!",
    "letter-a": "Huruf A, apel! Nyam nyam, segarnya buah apel merah manis!",
    "letter-b": "Huruf B, bebek! Kwek kwek kwek, lucunya bebek berenang!",
    "letter-c": "Huruf C, ceri! Buah ceri merah mungil yang segar!",
    "letter-d": "Huruf D, domba! Mbeeek... domba berbulu putih lembut!",
    "letter-e": "Huruf E, elang! Wuuush... burung elang terbang tinggi di langit!",
    "letter-f": "Huruf F, flamingo! Cantiknya burung flamingo merah muda!",
    "letter-g": "Huruf G, gajah! Tet toot! Gajah besar berbelalai panjang!",
    "letter-h": "Huruf H, harimau! Rawwwr! Gagahnya harimau loreng!",
    "letter-i": "Huruf I, ikan! Glub glub glub, ikan lincah berenang di air!",
    "letter-j": "Huruf J, jerapah! Wah, tingginya leher jerapah makan daun!",
    "letter-k": "Huruf K, kucing! Meong meong... manja dan lucunya si pus!",
    "letter-l": "Huruf L, lebah! Bzzz bzzz... lebah rajin membuat madu manis!",
    "letter-m": "Huruf M, monyet! U-u a-a... monyet lincah suka makan pisang!",
    "letter-n": "Huruf N, nanas! Segar dan harumnya buah nanas kuning!",
    "letter-o": "Huruf O, orangutan! Hebat, orangutan pintar berayun di pohon!",
    "letter-p": "Huruf P, paus! Byuuur! Ikan paus raksasa melompat di laut!",
    "letter-q": "Huruf Q, qori! Masya Allah, merdu sekali lantunan suara qori!",
    "letter-r": "Huruf R, rusa! Lari cepat, rusa bertanduk indah melompat!",
    "letter-s": "Huruf S, sapi! Moooh... sapi makan rumput hijau yang segar!",
    "letter-t": "Huruf T, tomat! Bulat merah, buah tomat kaya vitamin!",
    "letter-u": "Huruf U, unta! Hebatnya unta kuat melangkah di padang pasir!",
    "letter-v": "Huruf V, vas! Cantik sekali vas bunga di atas meja!",
    "letter-w": "Huruf W, wortel! Kriuk kriuk, kelinci suka makan wortel oranye!",
    "letter-x": "Huruf X, xilofon! Ting ting ting! Ayo kita main musik xilofon yang merdu!",
    "letter-y": "Huruf Y, yoyo! Asyik, mainan yoyo meluncur naik dan turun!",
    "letter-z": "Huruf Z, zebra! Kuda zebra bercorak belang hitam putih yang unik!",

    # ================= NUMBERS (1 - 10) =================
    "numbers-intro": "Halo adik manis! Yuk, kita berhitung angka satu sampai sepuluh bersama-sama!",
    "numbers-done": "Horeee! Luar biasa! Kamu sudah jago berhitung dari satu sampai sepuluh! Yeeay!",
    "number-1": "Satu! Ada satu buah apel merah manis... Nyam nyam!",
    "number-2": "Dua! Satu, dua... Bebeknya berenang kwek-kwek!",
    "number-3": "Tiga! Satu, dua, tiga... Bintangnya kelap-kelip indah!",
    "number-4": "Empat! Satu, dua, tiga, empat... Kupu-kupu terbang cantik!",
    "number-5": "Lima! Satu, dua, tiga, empat, lima... Ngeeeng, mobil melaju kencang!",
    "number-6": "Enam! Satu, dua, tiga, empat, lima, enam... Segarnya buah stroberi merah!",
    "number-7": "Tujuh! Satu, dua, tiga, empat, lima, enam, tujuh... Ikan berenang di air jernih!",
    "number-8": "Delapan! Wah, banyak sekali balon warna-warni terbang ke langit!",
    "number-9": "Sembilan! Bunga-bunga indah sedang bermekaran!",
    "number-10": "Sepuluh! Horeee! Sepuluh jari tangan lentur bertepuk tangan gembira!",
    "count-1": "Satu!",
    "count-2": "Dua!",
    "count-3": "Tiga!",
    "count-4": "Empat!",
    "count-5": "Lima!",
    "count-6": "Enam!",
    "count-7": "Tujuh!",
    "count-8": "Delapan!",
    "count-9": "Sembilan!",
    "count-10": "Sepuluh!",

    # ================= BALLOON CATCH =================
    "balloon-intro": "Wah, banyak balon warna-warni! Ayo lambaikan tanganmu atau sentuh balonnya biar meletus! Pop!",
    "balloon-camera-on": "Asyik, kameranya sudah siap! Ayo lambaikan tanganmu ke arah balon!",
    "balloon-touch-mode": "Yuk, sentuh balon-balonnya langsung pakai jarimu! Pop pop pop!",
    "balloon-pop-great": "Pooop! Meletus! Hebat sekali!",
    "balloon-done": "Horeee! Balonnya berhasil kamu tangkap semua! Kamu hebat banget!",

    # ================= JIGSAW PUZZLE =================
    "puzzle-intro": "Yuk, kita pasang kepingan puzzle ini ke tempat yang pas! Pasti seru!",
    "puzzle-snap": "Klek! Pas banget! Pintar!",
    "puzzle-done": "Horeee! Gambarnya tersusun rapi sekali! Keren banget!",
    "puzzle-new": "Asyik, ada gambar puzzle baru lagi nih! Yuk kita susun lagi!",

    # ================= COLORING & SOUND PAINT =================
    "coloring-intro": "Wah, yuk kita mewarnai gambar lucu dan melukis sambil mendengarkan musik merdu!",
    "coloring-tab-book": "Pilih warna yang kamu suka di bawah, lalu usap gambarnya ya sayang!",
    "coloring-tab-music": "Ayo gerakkan jarimu! Dengar nada musiknya yang merdu berbunyi!",
    "coloring-done": "Wah, cantiknya gambarmu! Warna-warni cerah dan indah sekali!",
    "color-palette-merah": "Merah! Ceria seperti buah apel manis!",
    "color-palette-kuning": "Kuning! Cerah seperti sinar matahari!",
    "color-palette-hijau": "Hijau! Segar seperti daun-daun di taman!",
    "color-palette-biru": "Biru! Damai seperti warna laut dan langit!",
    "color-palette-jingga": "Jingga! Manis seperti buah jeruk!",
    "color-palette-ungu": "Ungu! Cantik seperti buah anggur!",
    "color-palette-pink": "Merah muda! Lembut dan manis sekali!",
    "color-palette-cokelat": "Cokelat! Hangat seperti biskuit cokelat!",

    # ================= SHAPE SORTER =================
    "shapes-intro": "Ayo, kita cocokkan bentuk-bentuk lucu ini ke lubang bayangannya!",
    "shapes-new-board": "Asyik, ada bentuk baru! Yuk kita pasang lagi!",
    "shapes-done": "Horeee! Semua bentuk sudah terpasang dengan rapi! Pintar sekali!",
    "shape-ok-circle": "Lingkaran! Bulat seperti roda berputar!",
    "shape-ok-square": "Kotak persegi! Empat sisinya sama rapi!",
    "shape-ok-triangle": "Segitiga! Runcing seperti atap rumah!",
    "shape-ok-star": "Bintang! Berkelap-kelip indah di langit malam!",
    "shape-ok-diamond": "Belah ketupat! Bentuknya cantik seperti layang-layang!",
    "shape-ok-heart": "Bentuk hati! Penuh kasih sayang dan cinta!",
    "shape-hint-circle": "Coba pasang lingkarannya di sini ya!",
    "shape-hint-square": "Cari tempat yang kotak persegi ya!",
    "shape-hint-triangle": "Bentuk segitiga cocoknya di lubang ini!",
    "shape-hint-star": "Pasang bintang bersinar di sini ya!",
    "shape-hint-diamond": "Belah ketupatnya pas di lubang ini!",
    "shape-hint-heart": "Bentuk hatinya cocok di sini sayang!",

    # ================= TRACING =================
    "trace-line": "Ayo tarik garis lurus dari atas ke bawah ya!",
    "trace-zigzag": "Ayo ikuti garis zig-zag naik turun seperti gunung!",
    "trace-circle": "Putar jarimu melingkar bulat seperti kue donat!",
    "trace-A": "Tarik garis miring, garis miring lagi, lalu garis tengah... Jadi huruf A!",
    "trace-I": "Tarik garis lurus dari atas ke bawah... Jadi huruf I!",
    "trace-U": "Melengkung ke bawah lalu naik lagi ke atas... Jadi huruf U!",
    "trace-1": "Tarik garis lurus tegak... Angka satu!",
    "trace-2": "Lengkung kepala lalu garis datar di bawah... Angka dua!",
    "trace-3": "Lengkung atas dan lengkung bawah... Angka tiga!",
    "trace-done": "Wah jempolan! Goresan jarimu rapi sekali! Horeee!",
    "trace-clear": "Kita bersihkan layarnya, yuk coba lagi!",

    # ================= GROSS MOTOR =================
    "motor-bunny": "Lompat-lompat seperti kelinci kecil! Hop, hop, hop!",
    "motor-plane": "Bentangkan kedua tanganmu ke samping seperti sayap pesawat! Wuuush!",
    "motor-stomp": "Hentakkan kakimu ke lantai! Bum, bum, bum! Seperti gajah!",
    "motor-reach": "Jinjit dan raih bintang tinggi-tinggi di langit! Raih ke atas!",
    "motor-freeze": "Patung musik! Ayo diam jangan bergerak ya... Tahan!",
    "motor-start-balance": "Ayo berdiri tegap dan seimbangkan badanmu ya!",
    "motor-start-dance": "Musik berbunyi! Ayo kita menari dan bergoyang gembira!",
    "motor-freeze-now": "Stoppp! Berhenti menari, jadi patung diam!",
    "motor-dance-again": "Asyik! Musik jalan lagi, ayo menari lagi!",
    "motor-done": "Wah badanmu sehat dan lincah sekali! Tos dulu, yeeay!",

    # ================= SENSORY PLAY & ANIMALS =================
    "sensory-intro": "Sentuh hewan-hewan lucu untuk mendengar suaranya, atau sentuh bilah xilofon yang warna-warni!",
    "sensory-animals-tab": "Yuk sentuh teman-teman hewan kita!",
    "sensory-xylo-tab": "Ayo mainkan nada musik yang ceria!",
    "animal-cat": "Kucing manis! Meooong... meooong... manja sekali!",
    "animal-cow": "Sapi perah! Moooh... moooh... segar minum susu!",
    "animal-duck": "Bebek kuning! Kwek kwek kwek... berenang di kolam!",
    "animal-elephant": "Gajah besar! Tet toooot... belalainya panjang!",
    "animal-frog": "Katak hijau! Kook, kook... melompat di daun!",
    "animal-bird": "Burung mungil! Cuit cuit cuit... terbang riang di dahan!",
    "color-do": "Nada Do!",
    "color-re": "Nada Re!",
    "color-mi": "Nada Mi!",
    "color-fa": "Nada Fa!",
    "color-sol": "Nada Sol!",
    "color-la": "Nada La!",
}

async def generate_clip(sem: asyncio.Semaphore, key: str, text: str, total: int, idx: int) -> None:
    async with sem:
        out_file = os.path.join(OUT_DIR, f"{key}.mp3")
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
            tmp_path = tmp.name
        
        try:
            print(f"[{idx}/{total}] Menghasilkan {key}: '{text}'...")
            comm = edge_tts.Communicate(text=text, voice=VOICE, rate=RATE, pitch=PITCH)
            await comm.save(tmp_path)
            
            # Normalize with ffmpeg to 44.1kHz mono 48k MP3
            subprocess.run([
                "ffmpeg", "-y", "-i", tmp_path,
                "-ac", "1", "-ar", "44100", "-b:a", "48k",
                out_file
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        except Exception as e:
            print(f"ERROR on {key}: {e}")
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

async def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    sem = asyncio.Semaphore(5)
    total = len(CLIPS)
    tasks = [
        generate_clip(sem, key, text, total, idx + 1)
        for idx, (key, text) in enumerate(CLIPS.items())
    ]
    await asyncio.gather(*tasks)
    print(f"\nSukses memperbarui {total} klip suara dengan dialog Bahasa Indonesia alami dan ramah anak!")

if __name__ == "__main__":
    asyncio.run(main())
