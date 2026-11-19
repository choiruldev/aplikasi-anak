import { useState, type JSX } from 'react';
import { AGE_PHASES } from '../data/stimulationData.ts';
import { computeAgeInfo, type AgeBand } from '../lib/development.ts';
import { PROFILE_AVATARS, type ProfileAvatarId } from '../lib/profilesStorage.ts';
import { todayKey, type AppSettings, type ChildGender } from '../lib/storage.ts';
import { AvatarIcon } from './ModuleIcons.tsx';

interface Props {
  open: boolean;
  initialSettings: AppSettings;
  initialAvatarId: ProfileAvatarId;
  onFinish: (nextSettings: AppSettings, avatarId: ProfileAvatarId) => void;
  onSkip: () => void;
}

export function OnboardingModal({
  open,
  initialSettings,
  initialAvatarId,
  onFinish,
  onSkip
}: Props): JSX.Element | null {
  const [step, setStep] = useState<1 | 2>(1);
  const [childName, setChildName] = useState(
    initialSettings.childName === 'Adik' ? '' : initialSettings.childName
  );
  const [gender, setGender] = useState<ChildGender>(initialSettings.gender);
  const [avatarId, setAvatarId] = useState<ProfileAvatarId>(initialAvatarId);
  const [birthDate, setBirthDate] = useState(initialSettings.birthDate ?? '');
  const [ageBand, setAgeBand] = useState<AgeBand>(initialSettings.ageBand);

  if (!open) return null;

  const agePreview = computeAgeInfo(birthDate || undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    const cleanName = childName.trim().slice(0, 20) || 'Adik';
    onFinish(
      {
        ...initialSettings,
        childName: cleanName,
        gender,
        birthDate: birthDate || undefined,
        ageBand: agePreview?.band ?? ageBand,
        onboardingCompleted: true
      },
      avatarId
    );
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Pengaturan Awal Cilukba">
      <form className="modal-sheet onboarding-sheet" onSubmit={handleSubmit}>
        <div className="drawer-head">
          <div>
            <span className="eyebrow">Langkah {step} / 2</span>
            <h2>Kenalan Yuk dengan Si Kecil</h2>
          </div>
          <button type="button" className="text-action-btn" onClick={onSkip}>
            Lewati
          </button>
        </div>

        {step === 1 ? (
          <div className="onboarding-body">
            <label className="field-label">
              Nama panggilan anak
              <input
                type="text"
                maxLength={20}
                placeholder="misal Kiko / Naya"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                autoFocus
              />
            </label>

            <div className="field-label">
              <span>Jenis kelamin (untuk kurva WHO)</span>
              <div className="chip-row">
                <button
                  type="button"
                  className={`pill-btn ${gender === 'boy' ? 'is-active' : ''}`}
                  onClick={() => setGender('boy')}
                >
                  Laki-laki
                </button>
                <button
                  type="button"
                  className={`pill-btn ${gender === 'girl' ? 'is-active' : ''}`}
                  onClick={() => setGender('girl')}
                >
                  Perempuan
                </button>
              </div>
            </div>

            <div className="field-label">
              <span>Pilih avatar</span>
              <div className="chip-row">
                {PROFILE_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    className={`avatar-pick-btn ${avatarId === av.id ? 'is-selected' : ''}`}
                    onClick={() => setAvatarId(av.id)}
                    aria-label={av.label}
                  >
                    <AvatarIcon avatarId={av.id} size={32} />
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary-calm">
              Lanjut →
            </button>
          </div>
        ) : (
          <div className="onboarding-body">
            <label className="field-label">
              Tanggal lahir (opsional, untuk hitung umur otomatis)
              <input
                type="date"
                max={todayKey()}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </label>

            {agePreview ? (
              <p className="computed-age-note">
                Terbaca otomatis: <strong>{agePreview.label}</strong>
              </p>
            ) : (
              <div className="field-label">
                <span>Atau pilih rentang usia saat ini</span>
                <div className="chip-row">
                  {AGE_PHASES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`pill-btn small ${ageBand === p.id ? 'is-active' : ''}`}
                      onClick={() => setAgeBand(p.id)}
                    >
                      {p.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="onboarding-actions">
              <button type="button" className="btn-outline" onClick={() => setStep(1)}>
                ← Kembali
              </button>
              <button type="submit" className="btn-primary-calm">
                Mulai Pantau & Main
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
