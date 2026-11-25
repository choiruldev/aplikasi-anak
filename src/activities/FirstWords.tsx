import { useMemo, useState, type JSX } from 'react';
import { IconSpeaker, VisualStarMeter } from '../components/Art.tsx';
import { playBubblePop, playGentlePop, playSuccessChime, speakPhrase } from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

type WordCategory = 'Buah' | 'Rumah' | 'Kendaraan';

interface WordCard {
  id: string;
  idLabel: string;
  enLabel: string;
  category: WordCategory;
  tint: string;
  color: string;
  emoji: string;
}

const WORDS: WordCard[] = [
  // Buah (6)
  { id: 'apel', idLabel: 'Apel', enLabel: 'Apple', category: 'Buah', tint: '#FFEAEA', color: '#D94848', emoji: '🍎' },
  { id: 'pisang', idLabel: 'Pisang', enLabel: 'Banana', category: 'Buah', tint: '#FFF8DC', color: '#D98A00', emoji: '🍌' },
  { id: 'jeruk', idLabel: 'Jeruk', enLabel: 'Orange', category: 'Buah', tint: '#FFF1E2', color: '#E07A18', emoji: '🍊' },
  { id: 'semangka', idLabel: 'Semangka', enLabel: 'Watermelon', category: 'Buah', tint: '#E8F7EE', color: '#2B6E4F', emoji: '🍉' },
  { id: 'anggur', idLabel: 'Anggur', enLabel: 'Grapes', category: 'Buah', tint: '#F3EBFF', color: '#8045D9', emoji: '🍇' },
  { id: 'stroberi', idLabel: 'Stroberi', enLabel: 'Strawberry', category: 'Buah', tint: '#FFEAEE', color: '#D8435E', emoji: '🍓' },
  // Rumah (6)
  { id: 'bola', idLabel: 'Bola', enLabel: 'Ball', category: 'Rumah', tint: '#E7F3FF', color: '#2D6CDF', emoji: '⚽' },
  { id: 'buku', idLabel: 'Buku', enLabel: 'Book', category: 'Rumah', tint: '#EAF7EE', color: '#2B6E4F', emoji: '📖' },
  { id: 'gelas', idLabel: 'Gelas', enLabel: 'Cup', category: 'Rumah', tint: '#E6F7FA', color: '#12899C', emoji: '🥛' },
  { id: 'sendok', idLabel: 'Sendok', enLabel: 'Spoon', category: 'Rumah', tint: '#F2F4F7', color: '#53645B', emoji: '🥄' },
  { id: 'bantal', idLabel: 'Bantal', enLabel: 'Pillow', category: 'Rumah', tint: '#F5EEFF', color: '#7E57C2', emoji: '🛏️' },
  { id: 'sepatu', idLabel: 'Sepatu', enLabel: 'Shoes', category: 'Rumah', tint: '#FFF2E6', color: '#D95E32', emoji: '👟' },
  // Kendaraan (6)
  { id: 'mobil', idLabel: 'Mobil', enLabel: 'Car', category: 'Kendaraan', tint: '#FFF0E5', color: '#E07A18', emoji: '🚗' },
  { id: 'sepeda', idLabel: 'Sepeda', enLabel: 'Bicycle', category: 'Kendaraan', tint: '#F2ECFF', color: '#8045D9', emoji: '🚲' },
  { id: 'bus', idLabel: 'Bus', enLabel: 'Bus', category: 'Kendaraan', tint: '#FFF7DB', color: '#C68500', emoji: '🚌' },
  { id: 'kereta', idLabel: 'Kereta', enLabel: 'Train', category: 'Kendaraan', tint: '#E7F5EE', color: '#2B6E4F', emoji: '🚂' },
  { id: 'pesawat', idLabel: 'Pesawat', enLabel: 'Airplane', category: 'Kendaraan', tint: '#E7F3FF', color: '#1982C4', emoji: '✈️' },
  { id: 'kapal', idLabel: 'Kapal', enLabel: 'Boat', category: 'Kendaraan', tint: '#E6F6F9', color: '#12899C', emoji: '⛵' }
];

export function FirstWords({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [mode, setMode] = useState<'explore' | 'quiz'>('explore');
  const [category, setCategory] = useState<WordCategory>('Buah');
  const [bilingual, setBilingual] = useState(false);
  const [tappedIds, setTappedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [quizTarget, setQuizTarget] = useState<WordCard>(WORDS[0]);
  const [quizScore, setQuizScore] = useState(0);
  const [quizMsg, setQuizMsg] = useState('Ketuk gambar sesuai kata!');
  const [rewarded, setRewarded] = useState(false);

  const visibleWords = WORDS.filter((w) => w.category === category);

  function speakCard(w: WordCard): void {
    speakPhrase(bilingual ? w.enLabel : w.idLabel, bilingual ? 'en-US' : 'id-ID');
  }

  function handleTap(word: WordCard): void {
    triggerHaptic('tap');
    playGentlePop();
    setActiveId(word.id);
    speakCard(word);
    if (!tappedIds.includes(word.id)) {
      const next = [...tappedIds, word.id];
      setTappedIds(next);
      if (next.length >= 6 && !rewarded) {
        setRewarded(true);
        triggerHaptic('success');
        fireConfetti();
        playSuccessChime();
        onComplete('sticker-alphabet');
      }
    }
  }

  function nextQuiz(cat: WordCategory = category): void {
    const list = WORDS.filter((w) => w.category === cat);
    const chosen = list[Math.floor(Math.random() * list.length)] ?? WORDS[0];
    setQuizTarget(chosen);
    setQuizMsg(`Mana ${bilingual ? chosen.enLabel : chosen.idLabel}?`);
    speakCard(chosen);
  }

  const quizChoices = useMemo(() => {
    const list = WORDS.filter((w) => w.category === quizTarget.category);
    const arr = [quizTarget];
    for (const item of list) {
      if (arr.length >= 3) break;
      if (!arr.some((x) => x.id === item.id)) arr.push(item);
    }
    return arr.sort((a, b) => a.id.localeCompare(b.id));
  }, [quizTarget]);

  function answerQuiz(choice: WordCard): void {
    if (choice.id === quizTarget.id) {
      triggerHaptic('success');
      playSuccessChime();
      fireConfetti({ count: 24 });
      const next = quizScore + 1;
      setQuizScore(next);
      setQuizMsg(`Hebat! Ini ${bilingual ? choice.enLabel : choice.idLabel}!`);
      if (next >= 3 && !rewarded) {
        setRewarded(true);
        onComplete('sticker-alphabet');
      }
      window.setTimeout(() => nextQuiz(), 1000);
    } else {
      playBubblePop(250);
      speakCard(quizTarget);
    }
  }

  return (
    <section className="game-clean-stage" aria-label="Kata Pertama">
      <div className="game-top-bar">
        <div className="chip-row">
          <button
            type="button"
            className={`pill-btn touch-safe ${mode === 'explore' ? 'is-active' : ''}`}
            onClick={() => setMode('explore')}
          >
            Kartu (18)
          </button>
          <button
            type="button"
            className={`pill-btn touch-safe ${mode === 'quiz' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('quiz');
              nextQuiz();
            }}
          >
            Cari ({quizScore})
          </button>
        </div>

        <div className="game-top-tools">
          <button
            type="button"
            className={`pill-btn touch-safe ${bilingual ? 'is-active' : ''}`}
            onClick={() => setBilingual((v) => !v)}
          >
            {bilingual ? 'EN' : 'ID'}
          </button>
          {mode === 'quiz' && (
            <button type="button" className="icon-tool-btn" onClick={() => speakCard(quizTarget)} aria-label="Ulangi kata">
              <IconSpeaker size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="chip-row" role="tablist" aria-label="Kategori kata">
        {(['Buah', 'Rumah', 'Kendaraan'] as WordCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={category === cat}
            className={`pill-btn touch-safe ${category === cat ? 'is-active' : ''}`}
            onClick={() => {
              setCategory(cat);
              if (mode === 'quiz') nextQuiz(cat);
            }}
          >
            {cat}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <VisualStarMeter count={Math.min(5, tappedIds.length)} total={5} />
        </div>
      </div>

      {mode === 'explore' ? (
        <div className="edu-cards-grid">
          {visibleWords.map((word) => (
            <button
              key={word.id}
              type="button"
              className={`edu-word-card ${activeId === word.id ? 'is-active' : ''}`}
              style={{ backgroundColor: word.tint }}
              onClick={() => handleTap(word)}
            >
              <span className="word-card-emoji" aria-hidden="true">{word.emoji}</span>
              <strong style={{ color: word.color }}>{bilingual ? word.enLabel : word.idLabel}</strong>
            </button>
          ))}
        </div>
      ) : (
        <div className="habit-visual-stage">
          <h2 className="edu-prompt-title">{quizMsg}</h2>
          <div className="edu-cards-grid">
            {quizChoices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className="edu-word-card"
                style={{ backgroundColor: choice.tint }}
                onClick={() => answerQuiz(choice)}
              >
                <span className="word-card-emoji" aria-hidden="true">{choice.emoji}</span>
                <strong>{bilingual ? choice.enLabel : choice.idLabel}</strong>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
