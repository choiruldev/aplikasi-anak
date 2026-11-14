import React from 'react';
import type { SimulationKey } from '../data/stimulationData.ts';
import type { BabyCareType } from '../lib/babyCareStorage.ts';
import type { StimulationPillar } from '../lib/development.ts';
import type { NoteMood } from '../lib/journalStorage.ts';
import type { ProfileAvatarId } from '../lib/profilesStorage.ts';
import type { TipCategory } from '../data/tipsData.ts';

interface IconProps {
  size?: number;
  filled?: boolean;
}

export const SimulationIcon: React.FC<{ moduleKey: SimulationKey; size?: number }> = ({
  moduleKey,
  size = 40
}) => {
  switch (moduleKey) {
    case 'high-contrast':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="10" fill="#18181B" />
          <circle cx="20" cy="20" r="11" fill="#FFFDF7" />
          <path d="M20 9A11 11 0 0 1 20 31Z" fill="#18181B" />
          <circle cx="20" cy="20" r="4" fill="#F7B731" />
        </svg>
      );
    case 'tummy-time':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="10" fill="#FFF2DC" />
          <circle cx="20" cy="20" r="11" fill="#FFFFFF" stroke="#E07A18" strokeWidth="2.5" />
          <path d="M20 20V13M20 20L25 23" stroke="#2B6E4F" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="20" cy="20" r="2.2" fill="#E07A18" />
        </svg>
      );
    case 'baby-soother':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="10" fill="#EAE6FF" />
          <path d="M24 10A10 10 0 1 0 30 25A8 8 0 1 1 24 10Z" fill="#5A4FB8" />
          <circle cx="27" cy="14" r="2" fill="#F7B731" />
          <circle cx="14" cy="13" r="1.4" fill="#8C82E6" />
        </svg>
      );
    case 'peekaboo':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="10" fill="#E5F5ED" />
          <ellipse cx="14" cy="12" rx="3.2" ry="6.5" fill="#2B6E4F" />
          <ellipse cx="26" cy="12" rx="3.2" ry="6.5" fill="#2B6E4F" />
          <circle cx="20" cy="22" r="9.5" fill="#FFFDF7" stroke="#2B6E4F" strokeWidth="2" />
          <circle cx="16.5" cy="21" r="1.6" fill="#18221D" />
          <circle cx="23.5" cy="21" r="1.6" fill="#18221D" />
          <ellipse cx="20" cy="24.5" rx="2.5" ry="1.6" fill="#F29F8B" />
        </svg>
      );
    case 'bubblepopper':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="10" fill="#E5F4FC" />
          <circle cx="16" cy="22" r="8" fill="#5DBBF2" fillOpacity="0.45" stroke="#1982C4" strokeWidth="2" />
          <circle cx="27" cy="14" r="5" fill="#F7B731" fillOpacity="0.55" stroke="#E07A18" strokeWidth="2" />
          <circle cx="13.5" cy="19" r="2" fill="#FFFFFF" />
          <circle cx="27" cy="28" r="3.2" fill="#70D6A8" />
        </svg>
      );
    case 'colors':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="10" fill="#F2F9F3" />
          <circle cx="15" cy="16" r="6" fill="#E85A5A" />
          <circle cx="25" cy="16" r="6" fill="#F7B731" />
          <circle cx="20" cy="25" r="6" fill="#2D8CF0" />
        </svg>
      );
    case 'sensory':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="10" fill="#E8F1FF" />
          <path d="M12 24V15C12 13 15 13 15 15V20M15 13C15 11 18 11 18 13V20M18 13C18 11 21 11 21 13V20M21 15C21 13 24 13 24 15V24C24 27.5 21 30 18 30C14.5 30 12 27.5 12 24Z" fill="#2D6CDF" />
          <path d="M27 11L30 14L27 17" stroke="#F7B731" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="30" cy="24" r="3" fill="#46B882" />
        </svg>
      );
    case 'numbers':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="10" fill="#FFF6DB" />
          <rect x="8" y="9" width="11" height="11" rx="3" fill="#F7B731" />
          <rect x="21" y="9" width="11" height="11" rx="3" fill="#2B6E4F" />
          <rect x="8" y="22" width="11" height="11" rx="3" fill="#E07A18" />
          <circle cx="26.5" cy="27.5" r="5.5" fill="#2D6CDF" />
        </svg>
      );
    case 'alphabet':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="10" fill="#E6F6F9" />
          <path d="M13 28L20 11L27 28M15.5 22.5H24.5" stroke="#12899C" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="29" cy="12" r="2.6" fill="#F7B731" />
        </svg>
      );
    case 'shapes':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="10" fill="#E8F8EE" />
          <polygon points="15,9 22,21 8,21" fill="#F7B731" />
          <circle cx="27" cy="16" r="6" fill="#2D6CDF" />
          <rect x="14" y="23" width="12" height="9" rx="2.5" fill="#2B6E4F" />
        </svg>
      );
    case 'trace':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="10" fill="#FFF1E2" />
          <path d="M10 27C14 14 26 14 30 27" stroke="#E07A18" strokeWidth="3" strokeDasharray="4 4" strokeLinecap="round" fill="none" />
          <circle cx="10" cy="27" r="3" fill="#2B6E4F" />
          <circle cx="30" cy="27" r="3" fill="#E07A18" />
        </svg>
      );
    case 'motor':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="10" fill="#FFEAF0" />
          <circle cx="20" cy="11" r="4" fill="#D8435E" />
          <path d="M20 16V24M13 19L20 17L27 19M15 31L20 24L25 31" stroke="#D8435E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case 'coloring':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="10" fill="#F2EBFF" />
          <path d="M26 10L30 14L17 27L11 29L13 23Z" fill="#8045D9" />
          <circle cx="13" cy="14" r="3" fill="#F7B731" />
          <circle cx="27" cy="27" r="3" fill="#46B882" />
        </svg>
      );
    case 'puzzle':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="10" fill="#E6F8FB" />
          <rect x="9" y="10" width="10" height="10" rx="2" fill="#12899C" />
          <rect x="21" y="10" width="10" height="10" rx="2" fill="#F7B731" />
          <rect x="9" y="22" width="10" height="10" rx="2" fill="#E07A18" />
          <rect x="21" y="22" width="10" height="10" rx="2" fill="#2B6E4F" />
        </svg>
      );
    case 'balloon':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="10" fill="#FFEDE6" />
          <ellipse cx="16" cy="17" rx="6.5" ry="8" fill="#E85A5A" />
          <ellipse cx="25" cy="15" rx="5.5" ry="7" fill="#F7B731" />
          <path d="M16 25C16 29 14 31 14 33M25 22C25 27 27 30 27 33" stroke="#8C6D62" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
      );
  }
};

export const PillarIcon: React.FC<{ pillar: StimulationPillar; size?: number }> = ({
  pillar,
  size = 18
}) => {
  switch (pillar) {
    case 'motor-kasar':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="5" r="2.5" fill="currentColor" />
          <path d="M7 12l5-2 5 2M12 10v6l-4 5M12 16l4 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'motor-halus':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 4l5 5-10 10H5v-5L15 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 'bahasa':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-5l-4.5 3.5V16H7a3 3 0 0 1-3-3V6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="9.5" cy="9.5" r="1.2" fill="currentColor" />
          <circle cx="14.5" cy="9.5" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'kognitif':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.7.5 1.1 1.3 1.2 2.1h4.6c.1-.8.5-1.6 1.2-2.1A6 6 0 0 0 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
};

export const MoodIcon: React.FC<{ mood: NoteMood; size?: number }> = ({ mood, size = 18 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
      {mood === 'happy' && (
        <path d="M8.5 14.5c1 1.8 6 1.8 7 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
      {mood === 'calm' && (
        <path d="M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
      {mood === 'fussy' && (
        <path d="M8.5 16.2c1-1.5 6-1.5 7 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
};

export const CareIcon: React.FC<{ type: BabyCareType; size?: number }> = ({ type, size = 18 }) => {
  switch (type) {
    case 'feed':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M10 3h4v3l2 2.5V20a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8.5L10 6V3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M8 12h8" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'sleep':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 'diaper':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7h16v3c0 5-3.5 9-8 11-4.5-2-8-6-8-11V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M7 11h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};

export const TipCategoryIcon: React.FC<{ category: TipCategory; size?: number }> = ({
  category,
  size = 18
}) => {
  switch (category) {
    case 'Newborn':
      return <CareIcon type="sleep" size={size} />;
    case 'Nutrisi & MPASI':
      return <CareIcon type="feed" size={size} />;
    case 'Screen Time':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="2" />
          <path d="M9 20h6M12 17v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'Emosi & Tantrum':
      return <MoodIcon mood="happy" size={size} />;
    case 'Tanda Waspada':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3L21 19H3L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="1" fill="currentColor" />
        </svg>
      );
  }
};

export const AvatarIcon: React.FC<{ avatarId: ProfileAvatarId; size?: number }> = ({
  avatarId,
  size = 24
}) => {
  switch (avatarId) {
    case 'sprout':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
          <circle cx="14" cy="14" r="13" fill="#E5F5ED" />
          <path d="M14 21V11M14 13C10 13 8 10 8 7.5C11 7.5 14 9.5 14 13ZM14 12C17.5 12 20 9.5 20 7C17 7 14 9 14 12Z" stroke="#2B6E4F" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'bunny':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
          <circle cx="14" cy="14" r="13" fill="#FFF2DF" />
          <ellipse cx="10.5" cy="8.5" rx="2" ry="4.5" fill="#E07A18" />
          <ellipse cx="17.5" cy="8.5" rx="2" ry="4.5" fill="#E07A18" />
          <circle cx="14" cy="16" r="6" fill="#FFFFFF" stroke="#E07A18" strokeWidth="1.5" />
          <circle cx="12" cy="15.5" r="1" fill="#18221D" />
          <circle cx="16" cy="15.5" r="1" fill="#18221D" />
        </svg>
      );
    case 'bear':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
          <circle cx="14" cy="14" r="13" fill="#EAE6FF" />
          <circle cx="9" cy="10" r="2.8" fill="#5A4FB8" />
          <circle cx="19" cy="10" r="2.8" fill="#5A4FB8" />
          <circle cx="14" cy="15.5" r="6" fill="#FFFFFF" stroke="#5A4FB8" strokeWidth="1.5" />
          <circle cx="14" cy="16.8" r="1.4" fill="#5A4FB8" />
        </svg>
      );
    case 'chick':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
          <circle cx="14" cy="14" r="13" fill="#FFF6D6" />
          <circle cx="14" cy="15" r="6.5" fill="#F7B731" />
          <circle cx="11.8" cy="14" r="1" fill="#18221D" />
          <circle cx="16.2" cy="14" r="1" fill="#18221D" />
          <polygon points="14,15.5 16,17 12,17" fill="#D95E32" />
        </svg>
      );
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
          <circle cx="14" cy="14" r="13" fill="#E5F4FC" />
          <polygon points="14,6 16.5,11 22,11.8 18,15.6 19,21 14,18.4 9,21 10,15.6 6,11.8 11.5,11" fill="#1982C4" />
        </svg>
      );
  }
};

export const HeartIcon: React.FC<IconProps> = ({ size = 16, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
    <path
      d="M12 20.5s-7-4.6-9.2-8.7C1.1 8.6 2.8 4.8 6.4 4.2c2.1-.3 4.2.7 5.6 2.5 1.4-1.8 3.5-2.8 5.6-2.5 3.6.6 5.3 4.4 3.6 7.6C19 15.9 12 20.5 12 20.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export const FlameIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13 2s4 3.5 4 8a5 5 0 0 1-10 0c0-2 .8-3.8 2-5 0 2 1.2 3 2.3 3 0-2.5.7-4.5 1.7-6Zm-1 19a7 7 0 0 0 7-7c0-2-.7-4.2-2-6 .2 2.4-1.1 4.2-2.6 4.2-.8 0-1.4-.5-1.7-1.2-1.5 1.1-2.7 2.8-2.7 5A5 5 0 0 0 12 21Z" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
    <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const LightbulbIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.7.5 1.1 1.3 1.2 2.1h4.6c.1-.8.5-1.6 1.2-2.1A6 6 0 0 0 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SyringeIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 3l3 3M19.5 4.5l-3 3M13 6l5 5-8 8H5v-5l8-8ZM3 21l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const HomePlayIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);
