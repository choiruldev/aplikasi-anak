import { useId, type JSX } from 'react';

export type AnimalId = 'cat' | 'cow' | 'duck' | 'elephant' | 'frog' | 'bird';
export type ShapeId = 'circle' | 'square' | 'triangle' | 'star' | 'diamond' | 'heart';
export type ActionPoseId = 'bunny' | 'plane' | 'stomp' | 'reach' | 'freeze';

export function BrandMark({ size = 40 }: { size?: number }): JSX.Element {
  const uid = useId();
  const frameId = `cilukba-frame-${uid}`;
  const medallionId = `cilukba-medallion-${uid}`;

  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" aria-hidden="true">
      <defs>
        <clipPath id={frameId}>
          <rect width="128" height="128" rx="30" />
        </clipPath>
        <clipPath id={medallionId}>
          <circle cx="64" cy="64" r="53" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${frameId})`}>
        <rect width="128" height="128" fill="#2B6E4F" />
        <g clipPath={`url(#${medallionId})`}>
          <circle cx="64" cy="64" r="53" fill="#35825E" />
          <path d="M64 42V28" stroke="#96E8B3" strokeWidth="5" strokeLinecap="round" />
          <path d="M64 31C55 31 48 25 48 18C57 18 63 24 64 31Z" fill="#96E8B3" />
          <path d="M64 28C73 28 80 23 80 16C72 16 65 21 64 28Z" fill="#6FD497" />
          <circle cx="36" cy="52" r="10.5" fill="#FFF9F0" />
          <circle cx="36" cy="52" r="5.2" fill="#FFB899" />
          <circle cx="92" cy="52" r="10.5" fill="#FFF9F0" />
          <circle cx="92" cy="52" r="5.2" fill="#FFB899" />
          <circle cx="64" cy="70" r="34" fill="#FFFDF7" />
          <ellipse cx="64" cy="110" rx="34" ry="20" fill="#52A87E" />
          <circle cx="50" cy="65" r="5.8" fill="#182421" />
          <circle cx="48" cy="63" r="2" fill="#FFFFFF" />
          <circle cx="78" cy="65" r="5.8" fill="#182421" />
          <circle cx="76" cy="63" r="2" fill="#FFFFFF" />
          <ellipse cx="42" cy="75" rx="6" ry="3.5" fill="#FF9E83" opacity="0.88" />
          <ellipse cx="86" cy="75" rx="6" ry="3.5" fill="#FF9E83" opacity="0.88" />
          <path d="M56 75.5Q64 84 72 75.5" stroke="#182421" strokeWidth="4.4" strokeLinecap="round" />
          <g transform="rotate(18 34 97)">
            <path
              d="M22 87C22 79.5 27.5 74.5 34 74.5C39.5 74.5 43.5 78 45 83C48 83 50.5 85.5 50.5 88.5C50.5 91.5 48 94 45 94V118H22V87Z"
              fill="#F7B731"
              stroke="#2B6E4F"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </g>
          <g transform="rotate(-18 94 97)">
            <path
              d="M106 87C106 79.5 100.5 74.5 94 74.5C88.5 74.5 84.5 78 83 83C80 83 77.5 85.5 77.5 88.5C77.5 91.5 80 94 83 94V118H106V87Z"
              fill="#F7B731"
              stroke="#2B6E4F"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

export function AnimalIllustration({
  id,
  size = 88,
  className = ''
}: {
  id: AnimalId;
  size?: number;
  className?: string;
}): JSX.Element {
  const combinedClass = `animal-svg animal-svg-${id} ${className}`.trim();

  switch (id) {
    case 'cat':
      return (
        <svg className={combinedClass} width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <path className="animal-ear animal-ear-left" d="M22 38L18 14L40 26Z" fill="#E06B34" />
          <path className="animal-ear animal-ear-right" d="M74 38L78 14L56 26Z" fill="#E06B34" />
          <circle className="animal-face" cx="48" cy="52" r="28" fill="#F08A4B" />
          <g className="animal-eyes">
            <circle className="animal-eye animal-eye-left" cx="38" cy="48" r="4.5" fill="#182421" />
            <circle className="animal-eye animal-eye-right" cx="58" cy="48" r="4.5" fill="#182421" />
          </g>
          <path d="M44 56H52L48 61Z" fill="#D94848" />
          <path d="M48 61V66M48 66C44 69 40 68 38 66M48 66C52 69 56 68 58 66" stroke="#182421" strokeWidth="3" strokeLinecap="round" />
          <path className="animal-whiskers" d="M16 52H28M16 58H28M68 52H80M68 58H80" stroke="#182421" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
    case 'cow':
      return (
        <svg className={combinedClass} width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <ellipse className="animal-ear animal-ear-left" cx="20" cy="36" rx="10" ry="6" fill="#182421" />
          <ellipse className="animal-ear animal-ear-right" cx="76" cy="36" rx="10" ry="6" fill="#182421" />
          <path d="M30 24C28 16 34 14 36 22" stroke="#E89F1C" strokeWidth="5" strokeLinecap="round" />
          <path d="M66 24C68 16 62 14 60 22" stroke="#E89F1C" strokeWidth="5" strokeLinecap="round" />
          <rect className="animal-face" x="22" y="22" width="52" height="50" rx="22" fill="#FFFFFF" stroke="#182421" strokeWidth="3" />
          <circle cx="34" cy="34" r="8" fill="#182421" />
          <g className="animal-eyes">
            <circle className="animal-eye animal-eye-left" cx="37" cy="44" r="4" fill="#182421" />
            <circle className="animal-eye animal-eye-right" cx="59" cy="44" r="4" fill="#182421" />
          </g>
          <rect x="26" y="52" width="44" height="24" rx="12" fill="#F4B6B0" />
          <circle cx="39" cy="63" r="3.5" fill="#182421" />
          <circle cx="57" cy="63" r="3.5" fill="#182421" />
        </svg>
      );
    case 'duck':
      return (
        <svg className={combinedClass} width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle className="animal-face" cx="48" cy="44" r="24" fill="#E89F1C" />
          <ellipse className="animal-body" cx="48" cy="70" rx="28" ry="14" fill="#F2B830" />
          <g className="animal-eyes">
            <circle className="animal-eye animal-eye-left" cx="39" cy="38" r="4.2" fill="#182421" />
            <circle className="animal-eye animal-eye-right" cx="57" cy="38" r="4.2" fill="#182421" />
          </g>
          <rect className="animal-beak" x="34" y="46" width="28" height="12" rx="6" fill="#E06B34" />
          <path className="animal-crest" d="M40 20C44 13 52 13 54 20" stroke="#E89F1C" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    case 'elephant':
      return (
        <svg className={combinedClass} width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle className="animal-ear animal-ear-left" cx="22" cy="48" r="18" fill="#5D8AA8" />
          <circle className="animal-ear animal-ear-right" cx="74" cy="48" r="18" fill="#5D8AA8" />
          <circle className="animal-face" cx="48" cy="46" r="24" fill="#76A5C4" />
          <g className="animal-eyes">
            <circle className="animal-eye animal-eye-left" cx="39" cy="42" r="4" fill="#182421" />
            <circle className="animal-eye animal-eye-right" cx="57" cy="42" r="4" fill="#182421" />
          </g>
          <path className="animal-trunk" d="M48 50V72C48 77 55 77 56 71" stroke="#5D8AA8" strokeWidth="10" strokeLinecap="round" />
        </svg>
      );
    case 'frog':
      return (
        <svg className={combinedClass} width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle cx="33" cy="28" r="11" fill="#2B9361" />
          <circle cx="63" cy="28" r="11" fill="#2B9361" />
          <circle cx="33" cy="28" r="6" fill="#FFFFFF" />
          <circle cx="63" cy="28" r="6" fill="#FFFFFF" />
          <g className="animal-eyes">
            <circle className="animal-eye animal-eye-left" cx="33" cy="28" r="3.2" fill="#182421" />
            <circle className="animal-eye animal-eye-right" cx="63" cy="28" r="3.2" fill="#182421" />
          </g>
          <ellipse className="animal-face" cx="48" cy="54" rx="30" ry="22" fill="#37A972" />
          <path className="animal-mouth" d="M32 56C38 66 58 66 64 56" stroke="#182421" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="28" cy="52" r="4.5" fill="#F08A4B" />
          <circle cx="68" cy="52" r="4.5" fill="#F08A4B" />
        </svg>
      );
    case 'bird':
      return (
        <svg className={combinedClass} width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle className="animal-face" cx="48" cy="48" r="26" fill="#2978B5" />
          <path className="animal-wing animal-wing-left" d="M24 50C16 44 16 58 26 60Z" fill="#1E5B8A" />
          <path className="animal-wing animal-wing-right" d="M72 50C80 44 80 58 70 60Z" fill="#1E5B8A" />
          <ellipse cx="48" cy="58" rx="16" ry="12" fill="#DCEAF5" />
          <circle cx="40" cy="40" r="4" fill="#FFFFFF" />
          <circle cx="56" cy="40" r="4" fill="#FFFFFF" />
          <g className="animal-eyes">
            <circle className="animal-eye animal-eye-left" cx="40" cy="40" r="2.2" fill="#182421" />
            <circle className="animal-eye animal-eye-right" cx="56" cy="40" r="2.2" fill="#182421" />
          </g>
          <path className="animal-beak" d="M43 46H53L48 54Z" fill="#E89F1C" />
        </svg>
      );
  }
}

export function ShapeGlyph({
  shape,
  fill,
  size = 68,
  cutout = false
}: {
  shape: ShapeId;
  fill: string;
  size?: number;
  cutout?: boolean;
}): JSX.Element {
  const stroke = cutout ? '#8EA099' : '#182421';
  const strokeDasharray = cutout ? '6 5' : undefined;
  const actualFill = cutout ? '#DCE4D8' : fill;

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      {shape === 'circle' && (
        <circle cx="40" cy="40" r="30" fill={actualFill} stroke={stroke} strokeWidth="3" strokeDasharray={strokeDasharray} />
      )}
      {shape === 'square' && (
        <rect x="12" y="12" width="56" height="56" rx="10" fill={actualFill} stroke={stroke} strokeWidth="3" strokeDasharray={strokeDasharray} />
      )}
      {shape === 'triangle' && (
        <path
          d="M40 10L70 66H10L40 10Z"
          strokeLinejoin="round"
          fill={actualFill}
          stroke={stroke}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
        />
      )}
      {shape === 'star' && (
        <path
          d="M40 8L49.2 27.2L70.4 30.1L55 44.9L58.8 66L40 55.9L21.2 66L25 44.9L9.6 30.1L30.8 27.2L40 8Z"
          strokeLinejoin="round"
          fill={actualFill}
          stroke={stroke}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
        />
      )}
      {shape === 'diamond' && (
        <path
          d="M40 8L70 40L40 72L10 40L40 8Z"
          strokeLinejoin="round"
          fill={actualFill}
          stroke={stroke}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
        />
      )}
      {shape === 'heart' && (
        <path
          d="M40 68C40 68 12 50 12 29C12 18.5 20.5 12 29 12C34.8 12 38.5 15.2 40 18.5C41.5 15.2 45.2 12 51 12C59.5 12 68 18.5 68 29C68 50 40 68 40 68Z"
          strokeLinejoin="round"
          fill={actualFill}
          stroke={stroke}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
        />
      )}
    </svg>
  );
}

export function ActionPoseIllustration({ pose, active }: { pose: ActionPoseId; active: boolean }): JSX.Element {
  const lift = active ? -8 : 0;
  return (
    <svg width="148" height="148" viewBox="0 0 148 148" fill="none" aria-hidden="true">
      <circle cx="74" cy="74" r="64" fill="#E9EFE5" />
      <g transform={`translate(0, ${lift})`} style={{ transition: 'transform 220ms ease-out' }}>
        {pose === 'bunny' && (
          <>
            <rect x="58" y="18" width="10" height="28" rx="5" fill="#E06B34" />
            <rect x="80" y="18" width="10" height="28" rx="5" fill="#E06B34" />
            <circle cx="74" cy="54" r="18" fill="#F08A4B" />
            <circle cx="68" cy="52" r="2.8" fill="#182421" />
            <circle cx="80" cy="52" r="2.8" fill="#182421" />
            <rect x="56" y="72" width="36" height="34" rx="16" fill="#1F7A5C" />
            <path d="M48 78L60 84M100 78L88 84" stroke="#182421" strokeWidth="6" strokeLinecap="round" />
            <path d="M64 106L58 124M84 106L90 124" stroke="#182421" strokeWidth="6" strokeLinecap="round" />
          </>
        )}
        {pose === 'plane' && (
          <>
            <circle cx="74" cy="44" r="17" fill="#E89F1C" />
            <circle cx="68" cy="42" r="2.8" fill="#182421" />
            <circle cx="80" cy="42" r="2.8" fill="#182421" />
            <rect x="58" y="62" width="32" height="36" rx="14" fill="#2978B5" />
            {/* Wide airplane arms */}
            <path d="M22 68L126 76" stroke="#D94848" strokeWidth="9" strokeLinecap="round" />
            {/* Standing on one leg */}
            <path d="M74 98V126M74 104L98 112" stroke="#182421" strokeWidth="6.5" strokeLinecap="round" />
          </>
        )}
        {pose === 'stomp' && (
          <>
            <circle cx="74" cy="44" r="18" fill="#76A5C4" />
            <circle cx="52" cy="44" r="10" fill="#5D8AA8" />
            <circle cx="96" cy="44" r="10" fill="#5D8AA8" />
            <rect x="54" y="62" width="40" height="38" rx="16" fill="#2B9361" />
            <path d="M58 100L46 124M90 100L102 114" stroke="#182421" strokeWidth="8" strokeLinecap="round" />
          </>
        )}
        {pose === 'reach' && (
          <>
            <path d="M74 14L77.5 22L86 23L79.5 28.5L81.5 37L74 32.5L66.5 37L68.5 28.5L62 23L70.5 22L74 14Z" fill="#E89F1C" />
            <circle cx="74" cy="56" r="16" fill="#F08A4B" />
            <rect x="58" y="72" width="32" height="34" rx="14" fill="#D94848" />
            <path d="M60 76L46 42M88 76L102 42" stroke="#182421" strokeWidth="6" strokeLinecap="round" />
            <path d="M66 106V126M82 106V126" stroke="#182421" strokeWidth="6" strokeLinecap="round" />
          </>
        )}
        {pose === 'freeze' && (
          <>
            <circle cx="74" cy="46" r="17" fill="#37A972" />
            <circle cx="68" cy="44" r="2.8" fill="#182421" />
            <circle cx="80" cy="44" r="2.8" fill="#182421" />
            <rect x="58" y="64" width="32" height="34" rx="14" fill="#E89F1C" />
            <path
              d={active ? 'M58 72L36 56M90 72L112 86' : 'M58 74L44 90M90 74L104 90'}
              stroke="#182421"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            <path d="M66 98L56 124M82 98L92 124" stroke="#182421" strokeWidth="6.5" strokeLinecap="round" />
          </>
        )}
      </g>
    </svg>
  );
}

export function IconSpeaker({ size = 24 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9.5V14.5H8L13.5 19V5L8 9.5H4Z" fill="currentColor" />
      <path d="M17 8.5C18.3 9.8 18.3 14.2 17 15.5M19.8 6C22.2 8.8 22.2 15.2 19.8 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconHome({ size = 24 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 10.8L12 3.8L20.5 10.8V19.5C20.5 20.1 20.1 20.5 19.5 20.5H14.5V14.5H9.5V20.5H4.5C3.9 20.5 3.5 20.1 3.5 19.5V10.8Z" fill="currentColor" />
    </svg>
  );
}

export function IconStar({ size = 22, filled = true }: { size?: number; filled?: boolean }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5L14.9 8.4L21.4 9.3L16.7 13.9L17.8 20.4L12 17.3L6.2 20.4L7.3 13.9L2.6 9.3L9.1 8.4L12 2.5Z"
        fill={filled ? '#E89F1C' : 'none'}
        stroke={filled ? '#C9830B' : 'currentColor'}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconLock({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10.5" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10.5V7.5C8 5.3 9.8 3.5 12 3.5C14.2 3.5 16 5.3 16 7.5V10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconPalette({ size = 24 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3C6.48 3 2 7.03 2 12C2 16.42 5.58 20 10 20C10.55 20 11 19.55 11 19C11 18.75 10.9 18.52 10.74 18.34C10.58 18.15 10.5 17.9 10.5 17.65C10.5 16.55 11.4 15.65 12.5 15.65H14C17.87 15.65 21 12.52 21 8.65C21 5.53 17 3 12 3Z"
        fill="#E89F1C"
        stroke="#182421"
        strokeWidth="1.8"
      />
      <circle cx="6.5" cy="11.5" r="1.5" fill="#D94848" />
      <circle cx="9.5" cy="7.5" r="1.5" fill="#2978B5" />
      <circle cx="14.5" cy="7.5" r="1.5" fill="#2B9361" />
      <circle cx="17.5" cy="11.5" r="1.5" fill="#9C44D9" />
    </svg>
  );
}

export function IconPuzzle({ size = 24 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 13H17V9C17 7.9 16.1 7 15 7H11V5C11 3.9 10.1 3 9 3C7.9 3 7 3.9 7 5V7H5C3.9 7 3 7.9 3 9V11H5C6.1 11 7 11.9 7 13C7 14.1 6.1 15 5 15H3V19C3 20.1 3.9 21 5 21H9V19C9 17.9 9.9 17 11 17C12.1 17 13 17.9 13 19V21H15C16.1 21 17 20.1 17 19V17H19C20.1 17 21 16.1 21 15C21 13.9 20.1 13 19 13Z"
        fill="#2B9361"
        stroke="#182421"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBalloon({ size = 24 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="9.5" rx="7" ry="8.5" fill="#D94848" stroke="#182421" strokeWidth="1.8" />
      <polygon points="12,18 10,20.5 14,20.5" fill="#D94848" stroke="#182421" strokeWidth="1.5" />
      <path d="M12 20.5C11.5 22 13 23 12 24" stroke="#182421" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="9" cy="6" rx="2" ry="3.5" fill="#FFFFFF" fillOpacity="0.45" />
    </svg>
  );
}

export function IconCamera({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7H7L8.5 5H15.5L17 7H20C21.1 7 22 7.9 22 9V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V9C2 7.9 2.9 7 4 7Z"
        fill="#2978B5"
        stroke="#182421"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="13.5" r="4" fill="#FFFFFF" stroke="#182421" strokeWidth="1.8" />
    </svg>
  );
}

export function IconDownload({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3V15M12 15L7 10M12 15L17 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 19H20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconShare({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="8" width="14" height="13" rx="3" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M12 2V12M12 2L8 6M12 2L16 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCheck({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5L9.5 17L19 7.5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TapHintFinger({
  size = 48,
  label
}: {
  size?: number;
  label?: string;
}): JSX.Element {
  return (
    <div className="tap-hint-wrapper" aria-hidden="true">
      <div className="tap-beacon-ring ring-1" />
      <div className="tap-beacon-ring ring-2" />
      <div className="tap-finger-icon" style={{ fontSize: `${size}px` }}>
        👆
      </div>
      {label && <span className="tap-hint-label">{label}</span>}
    </div>
  );
}

export function VisualStarMeter({
  count,
  total = 5
}: {
  count: number;
  total?: number;
}): JSX.Element {
  return (
    <div className="visual-star-meter" aria-label={`Bintang: ${count} dari ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const earned = i < count;
        return (
          <span
            key={i}
            className={`star-token ${earned ? 'is-earned' : 'is-empty'}`}
          >
            {earned ? '⭐' : '⚪'}
          </span>
        );
      })}
    </div>
  );
}

