import { useEffect, useMemo, useState, type JSX } from 'react';
import { IconSpeaker, TapHintFinger, VisualStarMeter } from '../components/Art';
import {
  playBubblePop,
  playGentlePop,
  playNote,
  playSuccessChime,
  playVoice,
  preloadVoices,
  stopVoice,
  type VoiceClipId
} from '../lib/audio';
import { fireConfetti, triggerHaptic } from '../lib/confetti';

interface AlphabetItem {
  letter: string;
  word: string;
  hint: string;
  voiceId: VoiceClipId;
  color: string;
  borderColor: string;
  bgTint: string;
  emoji: string;
}

const ALPHABET_LIST: AlphabetItem[] = [
  { letter: 'A', word: 'Apel', hint: 'Apel merah manis dan renyah', voiceId: 'letter-a', color: '#E53935', borderColor: '#B71C1C', bgTint: '#FDEEEA', emoji: '🍎' },
  { letter: 'B', word: 'Bebek', hint: 'Bebek berenang kwek-kwek', voiceId: 'letter-b', color: '#FBC02D', borderColor: '#F57F17', bgTint: '#FFFBEA', emoji: '🦆' },
  { letter: 'C', word: 'Ceri', hint: 'Buah ceri kecil bertangkai', voiceId: 'letter-c', color: '#E91E63', borderColor: '#C2185B', bgTint: '#FCE4EC', emoji: '🍒' },
  { letter: 'D', word: 'Domba', hint: 'Domba berbulu putih empuk', voiceId: 'letter-d', color: '#5D8AA8', borderColor: '#3A637F', bgTint: '#EEF4F8', emoji: '🐑' },
  { letter: 'E', word: 'Elang', hint: 'Burung elang terbang tinggi', voiceId: 'letter-e', color: '#8D6E63', borderColor: '#5D4037', bgTint: '#EFEBE9', emoji: '🦅' },
  { letter: 'F', word: 'Flamingo', hint: 'Burung flamingo merah muda', voiceId: 'letter-f', color: '#EC407A', borderColor: '#D81B60', bgTint: '#FCE4EC', emoji: '🦩' },
  { letter: 'G', word: 'Gajah', hint: 'Gajah besar berbelalai panjang', voiceId: 'letter-g', color: '#546E7A', borderColor: '#37474F', bgTint: '#ECEFF1', emoji: '🐘' },
  { letter: 'H', word: 'Harimau', hint: 'Harimau loreng yang gagah', voiceId: 'letter-h', color: '#FB8C00', borderColor: '#EF6C00', bgTint: '#FFF3E0', emoji: '🐯' },
  { letter: 'I', word: 'Ikan', hint: 'Ikan berenang di air bersih', voiceId: 'letter-i', color: '#00ACC1', borderColor: '#00838F', bgTint: '#E0F7FA', emoji: '🐟' },
  { letter: 'J', word: 'Jerapah', hint: 'Jerapah leher panjang makan daun', voiceId: 'letter-j', color: '#FFA000', borderColor: '#FF8F00', bgTint: '#FFF8E1', emoji: '🦒' },
  { letter: 'K', word: 'Kucing', hint: 'Kucing manis mengeong meong', voiceId: 'letter-k', color: '#FF7043', borderColor: '#D84315', bgTint: '#FBE9E7', emoji: '🐱' },
  { letter: 'L', word: 'Lebah', hint: 'Lebah rajin membuat madu manis', voiceId: 'letter-l', color: '#FDD835', borderColor: '#FBC02D', bgTint: '#FFFDE7', emoji: '🐝' },
  { letter: 'M', word: 'Monyet', hint: 'Monyet lincah suka makan pisang', voiceId: 'letter-m', color: '#8D6E63', borderColor: '#4E342E', bgTint: '#EFEBE9', emoji: '🐵' },
  { letter: 'N', word: 'Nanas', hint: 'Buah nanas segar bermahkota', voiceId: 'letter-n', color: '#FBC02D', borderColor: '#F57F17', bgTint: '#FFF9C4', emoji: '🍍' },
  { letter: 'O', word: 'Orangutan', hint: 'Orangutan pintar di hutan rindang', voiceId: 'letter-o', color: '#D84315', borderColor: '#BF360C', bgTint: '#FBE9E7', emoji: '🦧' },
  { letter: 'P', word: 'Paus', hint: 'Paus raksasa berenang di samudra', voiceId: 'letter-p', color: '#1E88E5', borderColor: '#1565C0', bgTint: '#E3F2FD', emoji: '🐳' },
  { letter: 'Q', word: 'Qori', hint: 'Qori membaca dengan suara merdu', voiceId: 'letter-q', color: '#7E57C2', borderColor: '#5E35B1', bgTint: '#EDE7F6', emoji: '📖' },
  { letter: 'R', word: 'Rusa', hint: 'Rusa bertanduk indah melompat cepat', voiceId: 'letter-r', color: '#8D6E63', borderColor: '#6D4C41', bgTint: '#EFEBE9', emoji: '🦌' },
  { letter: 'S', word: 'Sapi', hint: 'Sapi perah makan rumput hijau', voiceId: 'letter-s', color: '#2E7D32', borderColor: '#1B5E20', bgTint: '#E8F5E9', emoji: '🐄' },
  { letter: 'T', word: 'Tomat', hint: 'Tomat bulat merah penuh vitamin', voiceId: 'letter-t', color: '#E53935', borderColor: '#C62828', bgTint: '#FFEBEE', emoji: '🍅' },
  { letter: 'U', word: 'Unta', hint: 'Unta kuat berjalan di padang pasir', voiceId: 'letter-u', color: '#D4A373', borderColor: '#A98467', bgTint: '#FAEDCD', emoji: '🐫' },
  { letter: 'V', word: 'Vas', hint: 'Vas cantik tempat menaruh bunga', voiceId: 'letter-v', color: '#8E24AA', borderColor: '#6A1B9A', bgTint: '#F3E5F5', emoji: '🏺' },
  { letter: 'W', word: 'Wortel', hint: 'Wortel oranye kesukaan kelinci', voiceId: 'letter-w', color: '#FB8C00', borderColor: '#E65100', bgTint: '#FFF3E0', emoji: '🥕' },
  { letter: 'X', word: 'Xilofon', hint: 'Xilofon berbunyi nada merdu', voiceId: 'letter-x', color: '#00897B', borderColor: '#004D40', bgTint: '#E0F2F1', emoji: '🎵' },
  { letter: 'Y', word: 'Yoyo', hint: 'Mainan yoyo naik turun berputar', voiceId: 'letter-y', color: '#FFB300', borderColor: '#FF8F00', bgTint: '#FFF8E1', emoji: '🪀' },
  { letter: 'Z', word: 'Zebra', hint: 'Zebra bergaris hitam dan putih', voiceId: 'letter-z', color: '#37474F', borderColor: '#212121', bgTint: '#ECEFF1', emoji: '🦓' }
];

export function AlphabetGarden({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [tab, setTab] = useState<'learn' | 'quiz'>('learn');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [learnedSet, setLearnedSet] = useState<Set<string>>(() => new Set());
  const [rewarded, setRewarded] = useState(false);
  const [prompt, setPrompt] = useState('Huruf A • Apel 🍎');

  // Quiz mode state
  const [quizScore, setQuizScore] = useState(0);
  const [quizTarget, setQuizTarget] = useState<AlphabetItem>(ALPHABET_LIST[0]);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const currentItem = ALPHABET_LIST[selectedIdx];

  useEffect(() => {
    preloadVoices([
      'alphabet-intro',
      'alphabet-done',
      ...ALPHABET_LIST.map((item) => item.voiceId)
    ]);
    playVoice('alphabet-intro', 80);
    return () => stopVoice();
  }, []);

  function getLetterDisplaySound(item: AlphabetItem): string {
    if (item.letter === 'B') return 'B • Bebek 🦆 (Kwek-kwek!)';
    if (item.letter === 'D') return 'D • Domba 🐑 (Mbeeek!)';
    if (item.letter === 'E') return 'E • Elang 🦅';
    if (item.letter === 'G') return 'G • Gajah 🐘 (Tet-toot!)';
    if (item.letter === 'H') return 'H • Harimau 🐯 (Rawrr!)';
    if (item.letter === 'K') return 'K • Kucing 🐱 (Meoong!)';
    if (item.letter === 'L') return 'L • Lebah 🐝 (Bzzz!)';
    if (item.letter === 'M') return 'M • Monyet 🐵 (U-u a-a!)';
    if (item.letter === 'P') return 'P • Paus 🐳 (Byuuur!)';
    if (item.letter === 'S') return 'S • Sapi 🐄 (Moooh!)';
    if (item.letter === 'Z') return 'Z • Zebra 🦓';
    return `${item.letter} • ${item.word}`;
  }

  function handleSelectLetter(idx: number): void {
    if (idx === selectedIdx && tab === 'learn') {
      // Tap again to hear
      playGentlePop();
      triggerHaptic('tap');
      playVoice(currentItem.voiceId);
      return;
    }
    playGentlePop();
    triggerHaptic('tap');
    setSelectedIdx(idx);
    const item = ALPHABET_LIST[idx];
    setPrompt(getLetterDisplaySound(item));
    playVoice(item.voiceId, 80);

    setLearnedSet((prev) => {
      const next = new Set(prev);
      next.add(item.letter);
      if (next.size >= 8 && !rewarded) {
        setRewarded(true);
        triggerHaptic('success');
        fireConfetti();
        setPrompt('Hebat! Yeaaay! 🎉 Kamu dapat stiker baru!');
        window.setTimeout(() => {
          playSuccessChime();
          playVoice('alphabet-done');
          onComplete('sticker-alphabet');
        }, 800);
      }
      return next;
    });
  }

  // Quiz helper
  function setupNewQuiz(): void {
    const randomItem = ALPHABET_LIST[Math.floor(Math.random() * ALPHABET_LIST.length)];
    setQuizTarget(randomItem);
    setQuizFeedback(null);
    setPrompt(`Dengar: Yang mana huruf "${randomItem.letter}"?`);
    playVoice(randomItem.voiceId, 80);
  }

  const quizChoices = useMemo(() => {
    const choices = [quizTarget];
    while (choices.length < 3) {
      const rand = ALPHABET_LIST[Math.floor(Math.random() * ALPHABET_LIST.length)];
      if (!choices.some((c) => c.letter === rand.letter)) {
        choices.push(rand);
      }
    }
    return choices.sort(() => Math.random() - 0.5);
  }, [quizTarget]);

  function handleAnswerQuiz(choice: AlphabetItem): void {
    if (choice.letter === quizTarget.letter) {
      triggerHaptic('success');
      fireConfetti({ count: 30 });
      playSuccessChime();
      playVoice('alphabet-done');
      setQuizFeedback('🎉 HEBAT! JAWABANMU TEPAT!');
      setQuizScore((prev) => prev + 1);
      window.setTimeout(() => {
        setupNewQuiz();
      }, 1600);
    } else {
      triggerHaptic('tap');
      playBubblePop(260);
      setQuizFeedback(`Itu huruf ${choice.letter}. Coba cari huruf ${quizTarget.letter} ya!`);
    }
  }

  return (
    <section className="activity-stage" aria-labelledby="alphabet-title">
      <div className="stage-header">
        <div>
          <div className="stage-title-row">
            <h1 id="alphabet-title" className="stage-title">
              Huruf {currentItem.letter} • {currentItem.word}
            </h1>
            <VisualStarMeter count={Math.min(5, Math.floor(learnedSet.size / 5))} total={5} />
          </div>
          <p className="stage-subtitle">{prompt}</p>
        </div>
        <div className="stage-actions">
          <button
            type="button"
            className="voice-btn"
            onClick={() => playVoice(currentItem.voiceId)}
            aria-label="Dengar suara huruf"
          >
            <IconSpeaker size={22} />
            <span>Dengar</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mode-tabs-row" role="tablist" aria-label="Pilih mode belajar huruf">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'learn'}
          className={`mode-tab ${tab === 'learn' ? 'is-active' : ''}`}
          onClick={() => {
            playGentlePop();
            setTab('learn');
            setPrompt(`${currentItem.letter} • ${currentItem.word}! 🌟`);
            playVoice(currentItem.voiceId);
          }}
        >
          📖 Huruf A – Z
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'quiz'}
          className={`mode-tab ${tab === 'quiz' ? 'is-active' : ''}`}
          onClick={() => {
            playGentlePop();
            setTab('quiz');
            setupNewQuiz();
          }}
        >
          🎯 Tebak Huruf ({quizScore})
        </button>
      </div>

      {tab === 'learn' ? (
        <>
          {/* Alphabet Horizontal Ribbon Bar */}
          <div className="alphabet-ribbon" role="tablist" aria-label="Pita huruf A sampai Z">
            {ALPHABET_LIST.map((item, idx) => {
              const isCurrent = idx === selectedIdx;
              const isLearned = learnedSet.has(item.letter);
              return (
                <button
                  key={item.letter}
                  type="button"
                  role="tab"
                  aria-selected={isCurrent}
                  className={`alphabet-tab-btn ${isCurrent ? 'is-active' : ''} ${isLearned ? 'is-learned' : ''}`}
                  style={{
                    borderColor: isCurrent ? item.borderColor : isLearned ? '#2B9361' : 'var(--border)'
                  }}
                  onClick={() => handleSelectLetter(idx)}
                >
                  <span className="alphabet-tab-char">{item.letter}</span>
                  {isLearned && <span className="alphabet-learned-dot" aria-hidden="true">✓</span>}
                </button>
              );
            })}
          </div>

          {/* Big Flashcard Spotlight */}
          <div
            className="alphabet-spotlight-card"
            style={{
              backgroundColor: currentItem.bgTint,
              borderColor: currentItem.borderColor
            }}
          >
            {/* Giant Letter Badge */}
            <button
              type="button"
              className="alphabet-big-letter-badge"
              style={{
                backgroundColor: currentItem.color,
                borderColor: currentItem.borderColor
              }}
              onClick={() => {
                triggerHaptic('tap');
                playNote(523.25, 0.4, 0.25);
                playVoice(currentItem.voiceId);
              }}
              aria-label={`Ketuk untuk dengar pelafalan huruf ${currentItem.letter}`}
            >
              {learnedSet.size === 0 && (
                <div className="alphabet-letter-guide">
                  <TapHintFinger size={34} />
                </div>
              )}
              <div className="alphabet-letter-duo">
                <span className="letter-upper">{currentItem.letter}</span>
                <span className="letter-lower">{currentItem.letter.toLowerCase()}</span>
              </div>
              <span className="alphabet-tap-label">🔊 Suara</span>
            </button>

            {/* Illustrated Object Card */}
            <button
              type="button"
              className="alphabet-object-card"
              onClick={() => {
                triggerHaptic('tap');
                playBubblePop(440);
                playVoice(currentItem.voiceId);
              }}
              aria-label={`Gambar ${currentItem.word}, ketuk untuk dengar suara`}
            >
              <span className="alphabet-emoji bouncing-toddler-emoji" aria-hidden="true">
                {currentItem.emoji}
              </span>
              <div className="alphabet-word-group">
                <span className="alphabet-word-main">{currentItem.word}</span>
              </div>
            </button>

            {/* Navigation buttons: Sebelumnya & Selanjutnya */}
            <div className="alphabet-nav-row">
              <button
                type="button"
                className="secondary-btn"
                disabled={selectedIdx === 0}
                onClick={() => handleSelectLetter(Math.max(0, selectedIdx - 1))}
              >
                ⬅
              </button>
              <button
                type="button"
                className="primary-action-btn"
                onClick={() => {
                  if (selectedIdx < ALPHABET_LIST.length - 1) {
                    handleSelectLetter(selectedIdx + 1);
                  } else {
                    handleSelectLetter(0);
                  }
                }}
              >
                {selectedIdx < ALPHABET_LIST.length - 1
                  ? `Lanjut ${ALPHABET_LIST[selectedIdx + 1].letter} ➡`
                  : 'Ulang A 🔄'}
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Quiz Mode */
        <div className="alphabet-quiz-stage">
          <div className="alphabet-quiz-card">
            <span className="quiz-target-emoji">{quizTarget.emoji}</span>
            <h2 className="quiz-target-question">
              Huruf apa untuk kata <strong>"{quizTarget.word}"</strong>?
            </h2>
            {quizFeedback && <p className="quiz-feedback-banner">{quizFeedback}</p>}

            <div className="quiz-choices-grid">
              {quizChoices.map((choice) => (
                <button
                  key={choice.letter}
                  type="button"
                  className="quiz-choice-btn"
                  style={{
                    borderColor: choice.borderColor
                  }}
                  onClick={() => handleAnswerQuiz(choice)}
                >
                  <span className="quiz-choice-letter">{choice.letter}</span>
                  <span className="quiz-choice-lower">{choice.letter.toLowerCase()}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="voice-btn quiz-repeat-voice"
              onClick={() => playVoice(quizTarget.voiceId)}
            >
              <IconSpeaker size={20} />
              <span>Dengar Petunjuk Suara</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
