function encodeSvg(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function makeBookCover(title: string, author: string, color: string, accent: string) {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="360" height="520" viewBox="0 0 360 520">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${color}"/>
          <stop offset="1" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="360" height="520" rx="10" fill="url(#g)"/>
      <rect x="34" y="42" width="292" height="436" rx="8" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.45)" stroke-width="2"/>
      <circle cx="180" cy="150" r="62" fill="rgba(255,255,255,.2)"/>
      <path d="M104 330c34-28 116-28 152 0" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="12" stroke-linecap="round"/>
      <text x="180" y="235" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="white">${title}</text>
      <text x="180" y="288" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,.86)">${author}</text>
    </svg>
  `);
}

export function makeHeroBanner(title: string, subtitle: string, color: string) {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1500" height="330" viewBox="0 0 1500 330">
      <defs>
        <linearGradient id="hero" x1="0" x2="1">
          <stop offset="0" stop-color="${color}"/>
          <stop offset="1" stop-color="#ef4444"/>
        </linearGradient>
      </defs>
      <rect width="1500" height="330" fill="url(#hero)"/>
      <circle cx="1250" cy="150" r="170" fill="rgba(255,255,255,.12)"/>
      <rect x="95" y="62" width="160" height="216" rx="8" fill="#fff" opacity=".9"/>
      <rect x="138" y="92" width="75" height="110" rx="6" fill="${color}" opacity=".72"/>
      <text x="260" y="130" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#fff">${title}</text>
      <text x="260" y="188" font-family="Arial, sans-serif" font-size="17" fill="rgba(255,255,255,.92)">${subtitle}</text>
      <text x="260" y="244" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#fff">BOOK FAIR</text>
    </svg>
  `);
}

export function makeCircleImage(label: string, color: string) {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260">
      <circle cx="130" cy="130" r="130" fill="#f1f5f9"/>
      <circle cx="130" cy="110" r="62" fill="${color}" opacity=".9"/>
      <rect x="72" y="145" width="116" height="34" rx="17" fill="#fff"/>
      <text x="130" y="170" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#334155">${label}</text>
    </svg>
  `);
}

export function makeAvatar(name: string, color: string) {
  const initials = name.slice(0, 2);
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
      <circle cx="90" cy="90" r="90" fill="#f8fafc"/>
      <circle cx="90" cy="72" r="38" fill="${color}"/>
      <path d="M34 160c10-38 34-56 56-56s46 18 56 56" fill="${color}" opacity=".85"/>
      <text x="90" y="86" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#fff">${initials}</text>
    </svg>
  `);
}

export function makeLogo(label: string, color: string) {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="260" height="160" viewBox="0 0 260 160">
      <rect width="260" height="160" rx="12" fill="#fff"/>
      <path d="M68 96 98 42l30 54 24-42 42 70H54z" fill="${color}" opacity=".86"/>
      <text x="130" y="136" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#334155">${label}</text>
    </svg>
  `);
}

export function makePhoneMockup() {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="620" height="420" viewBox="0 0 620 420">
      <circle cx="350" cy="220" r="190" fill="#d9dde3"/>
      <g transform="translate(170 30) rotate(-15)">
        <rect width="170" height="330" rx="28" fill="#fff" stroke="#d7dce3" stroke-width="5"/>
        <rect x="24" y="48" width="122" height="46" rx="8" fill="#fef2f2"/>
        <rect x="24" y="112" width="55" height="80" fill="#b91c1c"/>
        <rect x="91" y="112" width="55" height="80" fill="#0f766e"/>
        <rect x="24" y="208" width="55" height="80" fill="#d97706"/>
        <rect x="91" y="208" width="55" height="80" fill="#4338ca"/>
      </g>
      <g transform="translate(340 40) rotate(15)">
        <rect width="170" height="330" rx="28" fill="#fff" stroke="#d7dce3" stroke-width="5"/>
        <rect x="24" y="48" width="122" height="46" rx="8" fill="#fef2f2"/>
        <rect x="24" y="112" width="55" height="80" fill="#14532d"/>
        <rect x="91" y="112" width="55" height="80" fill="#7f1d1d"/>
        <rect x="24" y="208" width="55" height="80" fill="#0369a1"/>
        <rect x="91" y="208" width="55" height="80" fill="#6d28d9"/>
      </g>
    </svg>
  `);
}

export function makeWidePromo(title: string, subtitle: string, color: string, accent: string) {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1240" height="250" viewBox="0 0 1240 250">
      <defs>
        <linearGradient id="promo" x1="0" x2="1">
          <stop offset="0" stop-color="${color}"/>
          <stop offset="1" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="1240" height="250" rx="8" fill="url(#promo)"/>
      <circle cx="1060" cy="108" r="122" fill="rgba(255,255,255,.16)"/>
      <rect x="70" y="42" width="132" height="166" rx="8" fill="rgba(255,255,255,.86)"/>
      <rect x="224" y="64" width="128" height="142" rx="8" fill="rgba(255,255,255,.3)"/>
      <rect x="372" y="82" width="105" height="120" rx="8" fill="rgba(255,255,255,.22)"/>
      <text x="610" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#fff">${title}</text>
      <text x="610" y="154" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" font-weight="700" fill="rgba(255,255,255,.92)">${subtitle}</text>
    </svg>
  `);
}

export function makeSquarePromo(title: string, subtitle: string, color: string, accent: string) {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="0 0 420 420">
      <defs>
        <linearGradient id="square" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${color}"/>
          <stop offset="1" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="420" height="420" rx="10" fill="url(#square)"/>
      <circle cx="330" cy="88" r="78" fill="rgba(255,255,255,.18)"/>
      <rect x="44" y="216" width="86" height="130" rx="6" fill="rgba(255,255,255,.82)"/>
      <rect x="152" y="190" width="86" height="156" rx="6" fill="rgba(255,255,255,.72)"/>
      <rect x="260" y="226" width="86" height="120" rx="6" fill="rgba(255,255,255,.62)"/>
      <text x="36" y="92" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#fff">${title}</text>
      <text x="36" y="138" font-family="Arial, sans-serif" font-size="21" font-weight="700" fill="rgba(255,255,255,.9)">${subtitle}</text>
    </svg>
  `);
}

export function makeCategoryTile(title: string, color: string) {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="390" height="110" viewBox="0 0 390 110">
      <rect width="390" height="110" rx="8" fill="#f3f4f6"/>
      <rect y="55" width="390" height="55" fill="rgba(0,0,0,.48)"/>
      <circle cx="314" cy="55" r="46" fill="${color}" opacity=".45"/>
      <rect x="252" y="28" width="88" height="58" rx="10" fill="${color}" opacity=".72"/>
      <text x="38" y="54" font-family="Arial, sans-serif" font-size="23" font-weight="800" fill="#374151">${title}</text>
      <text x="38" y="88" font-family="Arial, sans-serif" font-size="31" font-weight="800" fill="#fff">${title}</text>
    </svg>
  `);
}

export function makePlaceholderIcon(kind: "author" | "publisher") {
  const symbol = kind === "author" ? "✒" : "▰";
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="120" viewBox="0 0 180 120">
      <rect width="180" height="120" fill="#fff"/>
      <circle cx="90" cy="58" r="38" fill="#b8b8b8"/>
      <text x="90" y="72" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="#fff">${symbol}</text>
    </svg>
  `);
}

export function makeAuthIllustration() {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="450" viewBox="0 0 720 450">
      <rect width="720" height="450" fill="#f8fafc"/>
      <circle cx="338" cy="108" r="76" fill="#dc2626"/>
      <rect x="76" y="270" width="570" height="108" fill="#e5e7eb"/>
      <g fill="#cbd5e1">
        <rect x="104" y="190" width="44" height="188"/><rect x="170" y="150" width="58" height="228"/><rect x="524" y="162" width="50" height="216"/><rect x="600" y="205" width="38" height="173"/>
      </g>
      <path d="M0 346c160-88 312 26 448-54 94-55 180-24 272 34v124H0z" fill="#fff"/>
      <g transform="translate(320 108)">
        <circle cx="40" cy="42" r="28" fill="#7c2d12"/>
        <path d="M20 76h56l18 138H2z" fill="#f59e0b"/>
        <rect x="58" y="94" width="94" height="20" rx="6" fill="#1e40af"/>
        <rect x="70" y="122" width="84" height="20" rx="6" fill="#0f766e"/>
        <rect x="84" y="150" width="70" height="20" rx="6" fill="#dc2626"/>
        <rect x="16" y="210" width="18" height="110" fill="#475569"/>
        <rect x="68" y="210" width="18" height="110" fill="#475569"/>
      </g>
    </svg>
  `);
}
