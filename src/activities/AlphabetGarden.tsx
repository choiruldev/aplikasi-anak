import { useEffect, useMemo, useState, type JSX } from 'react';
import { IconSpeaker, TapHintFinger, VisualStarMeter } from '../components/Art.tsx';
import {
  playBubblePop,
  playGentlePop,
  playNote,
  playSuccessChime,
  playVoice,
  preloadVoices,
  stopVoice,
  type VoiceClipId
} from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

interface AlphabetItem {
  letter: string;
  word: string;
  voiceId: VoiceClipId;
  color: string;
  bgTint: string;
  emoji: string;
}

const ALPHABET_LIST: AlphabetItem[] = [
  { letter: 'A', word: 'Apel', voiceId: 'letter-a', color: '#E53935', bgTint: '#FDEEEA', emoji: '🍎' },
  { letter: 'B', word: 'Bebek', voiceId: 'letter-b', color: '#D98A00', bgTint: '#FFFBEA', emoji: '🦆' },
  { letter: 'C', word: 'Ceri', voiceId: 'letter-c', color: '#E91E63', bgTint: '#FCE4EC', emoji: '🍒' },
  { letter: 'D', word: 'Domba', voiceId: 'letter-d', color: '#5D8AA8', bgTint: '#EEF4F8', emoji: '🐑' },
  { letter: 'E', word: 'Elang', voiceId: 'letter-e', color: '#8D6E63', bgTint: '#EFEBE9', emoji: '🦅' },
  { letter: 'F', word: 'Flamingo', voiceId: 'letter-f', color: '#EC407A', bgTint: '#FCE4EC', emoji: '🦩' },
  { letter: 'G', word: 'Gajah', voiceId: 'letter-g', color: '#546E7A', bgTint: '#ECEFF1', emoji: '🐘' },
  { letter: 'H', word: 'Harimau', voiceId: 'letter-h', color: '#FB8C00', bgTint: '#FFF3E0', emoji: '🐯' },
  { letter: 'I', word: 'Ikan', voiceId: 'letter-i', color: '#00ACC1', bgTint: '#E0F7FA', emoji: '🐟' },
  { letter: 'J', word: 'Jerapah', voiceId: 'letter-j', color: '#E07A18', bgTint: '#FFF8E1', emoji: '🦒' },
  { letter: 'K', word: 'Kucing', voiceId: 'letter-k', color: '#FF7043', bgTint: '#FBE9E7', emoji: '🐱' },
  { letter: 'L', word: 'Lebah', voiceId: 'letter-l', color: '#C68500', bgTint: '#FFFDE7', emoji: '🐝' },
  { letter: 'M', word: 'Monyet', voiceId: 'letter-m', color: '#8D6E63', bgTint: '#EFEBE9', emoji: '🐵' },
  { letter: 'N', word: 'Nanas', voiceId: 'letter-n', color: '#D98A00', bgTint: '#FFF9C4', emoji: '🍍' },
  { letter: 'O', word: 'Orangutan', voiceId: 'letter-o', color: '#D84315', bgTint: '#FBE9E7', emoji: '🦧' },
  { letter: 'P', word: 'Paus', voiceId: 'letter-p', color: '#1E88E5', bgTint: '#E3F2FD', emoji: '🐳' },
  { letter: 'Q', word: 'Qori', voiceId: 'letter-q', color: '#7E57C2', bgTint: '#EDE7F6', emoji: '📖' },
  { letter: 'R', word: 'Rusa', voiceId: 'letter-r', color: '#8D6E63', bgTint: '#EFEBE9', emoji: '🦌' },
  { letter: 'S', word: 'Sapi', voiceId: 'letter-s', color: '#2E7D32', bgTint: '#E8F5E9', emoji: '🐄' },
  { letter: 'T', word: 'Tomat', voiceId: 'letter-t', color: '#E53935', bgTint: '#FFEBEE', emoji: '🍅' },
  { letter: 'U', word: 'Unta', voiceId: 'letter-u', color: '#A98467', bgTint: '#FAEDCD', emoji: '🐫' },
  { letter: 'V', word: 'Vas', voiceId: 'letter-v', color: '#8E24AA', bgTint: '#F3E5F5', emoji: '🏺' },
  { letter: 'W', word: 'Wortel', voiceId: 'letter-w', color: '#FB8C00', bgTint: '#FFF3E0', emoji: '🥕' },
  { letter: 'X', word: 'Xilofon', voiceId: 'letter-x', color: '#00897B', bgTint: '#E0F2F1', emoji: '🎵' },
  { letter: 'Y', word: 'Yoyo', voiceId: 'letter-y', color: '#E07A18', bgTint: '#FFF8E1', emoji: '🪀' },
  { letter: 'Z', word: 'Zebra', voiceId: 'letter-z', color: '#37474F', bgTint: '#ECEFF1', emoji: '🦓' }
];

const LETTER_PACKS: Array<{ id: string; label: string; letters: string[] }> = [
  { id: 'vokal', label: 'Vokal', letters: ['A', 'I', 'U', 'E', 'O'] },
  { id: 'ae', label: 'A–E', letters: ['A', 'B', 'C', 'D', 'E'] },
  { id: 'fj', label: 'F–J', letters: ['F', 'G', 'H', 'I', 'J'] },
  { id: 'ko', label: 'K–O', letters: ['K', 'L', 'M', 'N', 'O'] },
  { id: 'pt', label: 'P–T', letters: ['P', 'Q', 'R', 'S', 'T'] },
  { id: 'uz', label: 'U–Z', letters: ['U', 'V', 'W', 'X', 'Y', 'Z'] }
];

export function AlphabetGarden({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [tab, setTab] = useState<'learn' | 'quiz'>('learn');
  const [packId, setPackId] = useState<string>('vokal');
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [learnedSet, setLearnedSet] = useState<Set<string>>(() => new Set());
  const [rewarded, setRewarded] = useState(false);

  const [quizScore, setQuizScore] = useState(0);
  const [quizTarget, setQuizTarget] = useState<AlphabetItem>(ALPHABET_LIST[0]);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const activePack = LETTER_PACKS.find((p) => p.id === packId) ?? LETTER_PACKS[0];
  const packItems = activePack.letters
    .map((ch) => ALPHABET_LIST.find((a) => a.letter === ch)!)
    .filter(Boolean);
  const currentItem =
    packItems.find((a) => a.letter === selectedLetter) ?? packItems[0] ?? ALPHABET_LIST[0];

  useEffect(() => {
    preloadVoices(['alphabet-intro', 'alphabet-done', ...ALPHABET_LIST.map((i) => i.voiceId)]);
    playVoice('alphabet-intro', 80);
    return () => stopVoice();
  }, []);

  function handleSelectLetter(item: AlphabetItem): void {
    playGentlePop();
    triggerHaptic('tap');
    setSelectedLetter(item.letter);
    playVoice(item.voiceId, 80);
    setLearnedSet((prev) => {
      const next = new Set(prev);
      next.add(item.letter);
      if (next.size >= 5 && !rewarded) {
        setRewarded(true);
        triggerHaptic('success');
        fireConfetti();
        window.setTimeout(() => {
          playSuccessChime();
          playVoice('alphabet-done');
          onComplete('sticker-alphabet');
        }, 700);
      }
      return next;
    });
  }

  function setupNewQuiz(items: AlphabetItem[] = packItems): void {
    const rand = items[Math.floor(Math.random() * items.length)] ?? ALPHABET_LIST[0];
    setQuizTarget(rand);
    setQuizFeedback(null);
    playVoice(rand.voiceId, 80);
  }

  const quizChoices = useMemo(() => {
    const pool = packItems.length >= 3 ? packItems : ALPHABET_LIST;
    const choices = [quizTarget];
    for (const cand of pool) {
      if (choices.length >= 3) break;
      if (!choices.some((c) => c.letter === cand.letter)) choices.push(cand);
    }
    return choices.sort((a, b) => a.letter.localeCompare(b.letter));
  }, [quizTarget, packItems]);

  function handleAnswerQuiz(choice: AlphabetItem): void {
    if (choice.letter === quizTarget.letter) {
      triggerHaptic('success');
      fireConfetti({ count: 30 });
      playSuccessChime();
      setQuizFeedback(`Hebat! ${choice.letter} untuk ${choice.word}!`);
      const next = quizScore + 1;
      setQuizScore(next);
      if (next >= 3 && !rewarded) {
        setRewarded(true);
        onComplete('sticker-alphabet');
      }
      window.setTimeout(() => setupNewQuiz(), 1200);
    } else {
      playBubblePop(250);
      setQuizFeedback(`Itu ${choice.letter}. Cari huruf ${quizTarget.letter}!`);
      playVoice(quizTarget.voiceId, 100);
    }
  }

  return (
    <section className="game-clean-stage" aria-label="Taman Huruf">
      <div className="game-top-bar">
        <div className="chip-row">
          <button
            type="button"
            className={`pill-btn touch-safe ${tab === 'learn' ? 'is-active' : ''}`}
            onClick={() => setTab('learn')}
          >
            Belajar
          </button>
          <button
            type="button"
            className={`pill-btn touch-safe ${tab === 'quiz' ? 'is-active' : ''}`}
            onClick={() => {
              setTab('quiz');
              setupNewQuiz();
            }}
          >
            Tebak ({quizScore})
          </button>
        </div>

        <div className="game-top-tools">
          <VisualStarMeter count={Math.min(5, learnedSet.size)} total={5} />
          <button
            type="button"
            className="icon-tool-btn"
            onClick={() => playVoice(tab === 'quiz' ? quizTarget.voiceId : currentItem.voiceId)}
            aria-label="Dengar huruf"
          >
            <IconSpeaker size={18} />
          </button>
        </div>
      </div>

      {/* 6 clean letter packs -> zero overflow on 390px */}
      <div className="game-chip-scroll" role="tablist" aria-label="Pilih paket huruf">
        {LETTER_PACKS.map((pk) => (
          <button
            key={pk.id}
            type="button"
            role="tab"
            aria-selected={packId === pk.id}
            className={`pill-btn touch-safe ${packId === pk.id ? 'is-active' : ''}`}
            onClick={() => {
              setPackId(pk.id);
              setSelectedLetter(pk.letters[0]);
              const nextPackItems = pk.letters.map((c) => ALPHABET_LIST.find((a) => a.letter === c)!);
              if (tab === 'quiz') setupNewQuiz(nextPackItems);
              else playVoice(nextPackItems[0].voiceId, 80);
            }}
          >
            {pk.label}
          </button>
        ))}
      </div>

      {tab === 'learn' ? (
        <>
          <div className="alpha-pack-row">
            {packItems.map((item) => {
              const active = item.letter === currentItem.letter;
              return (
                <button
                  key={item.letter}
                  type="button"
                  className={`alpha-big-chip ${active ? 'is-active' : ''}`}
                  style={active ? { backgroundColor: item.color, borderColor: item.color, color: '#fff' } : undefined}
                  onClick={() => handleSelectLetter(item)}
                >
                  {item.letter}
                </button>
              );
            })}
          </div>

          <div className="alpha-focus-card" style={{ backgroundColor: currentItem.bgTint, borderColor: currentItem.color }}>
            <button
              type="button"
              className="alpha-letter-hero"
              style={{ backgroundColor: currentItem.color }}
              onClick={() => {
                playNote(523.25, 0.35, 0.25);
                playVoice(currentItem.voiceId);
              }}
            >
              {learnedSet.size === 0 && (
                <span className="tile-tap-guide"><TapHintFinger size={32} /></span>
              )}
              <strong>{currentItem.letter}{currentItem.letter.toLowerCase()}</strong>
            </button>

            <button
              type="button"
              className="alpha-word-hero"
              onClick={() => {
                playBubblePop(440);
                playVoice(currentItem.voiceId);
              }}
            >
              <span className="alpha-hero-emoji" aria-hidden="true">{currentItem.emoji}</span>
              <strong>{currentItem.word}</strong>
            </button>
          </div>
        </>
      ) : (
        <div className="alpha-quiz-box">
          <span className="alpha-hero-emoji" aria-hidden="true">{quizTarget.emoji}</span>
          <h2 className="edu-prompt-title">Huruf awal "{quizTarget.word}"?</h2>
          {quizFeedback && <p className="game-mini-status">{quizFeedback}</p>}
          <div className="syllable-choices-row">
            {quizChoices.map((c) => (
              <button
                key={c.letter}
                type="button"
                className="syllable-pick-btn"
                style={{ borderColor: c.color, color: c.color }}
                onClick={() => handleAnswerQuiz(c)}
              >
                {c.letter}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
