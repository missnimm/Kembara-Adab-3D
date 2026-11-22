import { AchievementBadge, AdabMission, BonusStarDef, PlatformBox } from './types';

export const ADAB_MISSIONS: AdabMission[] = [
  {
    id: 'basuh-sebelum',
    order: 1,
    shortTitle: 'Basuh Tangan',
    title: 'Misi 1: Basuh Tangan Sebelum Makan',
    subtitle: 'Bersihkan kedua-dua belah tangan dengan sabun dan air mengalir.',
    stationName: 'Sinki Taman Harmoni',
    stationPos: { x: -6.5, y: 0, z: 5.5 },
    interactRadius: 2.6,
    starsReward: 3,
    badgeId: 'lencana-tangan-bersih',
    interactiveKind: 'wash-hands',
    audioNarration:
      'Langkah pertama adab makan: Basuh kedua-dua belah tangan dengan bersih menggunakan sabun dan air sebelum menyentuh makanan.',
    stepTips: [
      'Buka paip air dengan cermat dan tidak membazir.',
      'Gosok tapak tangan, celah jari, dan pergelangan tangan dengan sabun.',
      'Bilas hingga bersih dan lap tangan dengan tuala.',
    ],
    accentHex: '#0EA5E9',
  },
  {
    id: 'duduk-doa',
    order: 2,
    shortTitle: 'Duduk & Baca Doa',
    title: 'Misi 2: Duduk Tertib & Baca Doa Makan',
    subtitle: 'Duduk dengan sopan di tikar makan dan baca Doa Sebelum Makan.',
    stationName: 'Astaka Makan Utama',
    stationPos: { x: 0, y: 0.25, z: 0 },
    interactRadius: 3.0,
    starsReward: 3,
    badgeId: 'lencana-ahli-doa',
    interactiveKind: 'recite-doa-before',
    arabicText: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
    rumiText: 'Allahumma barik lana fima razaqtana waqina azabannar.',
    meaningText:
      'Ya Allah, berkatilah kami pada rezeki yang telah Engkau kurniakan kepada kami dan peliharalah kami daripada azab neraka.',
    audioNarration:
      'Duduk dengan tertib dan tenang. Jangan makan sambil berjalan. Bacalah Bismillah dan Doa Sebelum Makan: Allahumma barik lana fima razaqtana waqina azabannar.',
    stepTips: [
      'Duduk dengan sopan (bersila atau di kerusi) sebelum mula makan.',
      'Mulakan dengan membaca Bismillahirrahmanirrahim.',
      'Tadah tangan dan baca Doa Sebelum Makan dengan khusyuk.',
    ],
    accentHex: '#10B981',
  },
  {
    id: 'tangan-kanan',
    order: 3,
    shortTitle: 'Tangan Kanan',
    title: 'Misi 3: Guna Tangan Kanan & Ambil Yang Terdekat',
    subtitle: 'Makan menggunakan tangan kanan dan ambil hidangan yang paling hampir.',
    stationName: 'Meja Hidangan Lauk',
    stationPos: { x: 4.8, y: 0, z: -2.2 },
    interactRadius: 2.6,
    starsReward: 3,
    badgeId: 'lencana-tangan-kanan',
    interactiveKind: 'choose-right-hand',
    audioNarration:
      'Rasulullah mengajar kita makan menggunakan tangan kanan, mengambil makanan yang paling hampir dengan kita, dan tidak gelojoh.',
    stepTips: [
      'Sentiasa gunakan tangan kanan ketika menyuap makanan.',
      'Ambil makanan yang berada paling dekat di hadapan kamu.',
      'Kunyah makanan perlahan-lahan dan jangan bercakap ketika mulut penuh.',
    ],
    accentHex: '#F59E0B',
  },
  {
    id: 'minum-adab',
    order: 4,
    shortTitle: 'Minum 3 Teguk',
    title: 'Misi 4: Adab Minum Air dengan Tenang',
    subtitle: 'Minum secara 3 teguk sambil duduk dan elakkan meniup air panas.',
    stationName: 'Sudut Minuman Segar',
    stationPos: { x: -4.8, y: 0, z: -2.2 },
    interactRadius: 2.6,
    starsReward: 3,
    badgeId: 'lencana-minum-berhemah',
    interactiveKind: 'drink-three-sips',
    audioNarration:
      'Ketika minum, pegang cawan dengan tangan kanan, duduk dengan tenang, jangan meniup air panas, dan minum sebanyak tiga teguk dengan bernafas di luar cawan.',
    stepTips: [
      'Sejukkan minuman panas secara semula jadi; jangan tiup ke dalam cawan.',
      'Minum dalam 3 teguk perlahan-lahan dan bernafas di luar gelas.',
      'Elakkan minum sambil berdiri atau terus daripada mulut botol besar.',
    ],
    accentHex: '#0284C7',
  },
  {
    id: 'doa-kemas',
    order: 5,
    shortTitle: 'Syukur & Kemas',
    title: 'Misi 5: Baca Doa Selepas Makan & Kemas Meja',
    subtitle: 'Ucap Alhamdulillah, baca Doa Selepas Makan, dan susun pinggan.',
    stationName: 'Astaka Syukur & Kemas',
    stationPos: { x: 0, y: 0, z: -7.2 },
    interactRadius: 2.8,
    starsReward: 3,
    badgeId: 'lencana-pengemas-hebat',
    interactiveKind: 'clear-and-thanks',
    arabicText: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    rumiText: "Alhamdulillahillazi at'amana wasaqana waja'alana muslimin.",
    meaningText:
      'Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami orang-orang Islam.',
    audioNarration:
      'Selepas selesai makan, ucapkan Alhamdulillah dan baca Doa Selepas Makan. Kemudian kemaskan pinggan dan sisa makanan ke tempat yang disediakan.',
    stepTips: [
      'Habiskan makanan di dalam pinggan supaya tidak membazir.',
      'Ucapkan Alhamdulillah dan baca Doa Selepas Makan.',
      'Angkat dan susun pinggan serta cawan ke dalam dulang kemas.',
    ],
    accentHex: '#8B5CF6',
  },
  {
    id: 'basuh-selepas',
    order: 6,
    shortTitle: 'Bersih & Sijil',
    title: 'Misi 6: Basuh Tangan Selepas Makan',
    subtitle: 'Basuh tangan dan mulut selepas makan untuk menamatkan pengembaraan!',
    stationName: 'Sinki Pintu Kejayaan',
    stationPos: { x: 6.5, y: 0, z: 5.5 },
    interactRadius: 2.7,
    starsReward: 3,
    badgeId: 'lencana-juara-adab',
    interactiveKind: 'wash-hands-after',
    audioNarration:
      'Tahniah! Langkah terakhir ialah membasuh tangan dan berkumur selepas makan agar sentiasa bersih dan sihat. Kini kamu layak menerima Sijil Kejayaan!',
    stepTips: [
      'Basuh sisa makanan pada tangan dengan air bersih dan sabun.',
      'Berkumur dengan sopan selepas makan.',
      'Sentiasa amalkan adab makan dan minum setiap hari.',
    ],
    accentHex: '#059669',
  },
];

export const ACHIEVEMENT_BADGES: AchievementBadge[] = [
  {
    id: 'lencana-tangan-bersih',
    title: 'Tangan Bersih',
    description: 'Membasuh tangan dengan sabun sebelum menyentuh hidangan.',
    requiredMissionId: 'basuh-sebelum',
    accentColor: '#0EA5E9',
  },
  {
    id: 'lencana-ahli-doa',
    title: 'Ahli Doa',
    description: 'Duduk tertib dan mengamalkan Doa Sebelum Makan.',
    requiredMissionId: 'duduk-doa',
    accentColor: '#10B981',
  },
  {
    id: 'lencana-tangan-kanan',
    title: 'Adab Tangan Kanan',
    description: 'Menggunakan tangan kanan dan memilih makanan yang terdekat.',
    requiredMissionId: 'tangan-kanan',
    accentColor: '#F59E0B',
  },
  {
    id: 'lencana-minum-berhemah',
    title: 'Minum Berhemah',
    description: 'Minum 3 teguk dengan tenang tanpa meniup air panas.',
    requiredMissionId: 'minum-adab',
    accentColor: '#0284C7',
  },
  {
    id: 'lencana-pengemas-hebat',
    title: 'Pengemas & Bersyukur',
    description: 'Mengucap Alhamdulillah dan mengemas pinggan selepas makan.',
    requiredMissionId: 'doa-kemas',
    accentColor: '#8B5CF6',
  },
  {
    id: 'lencana-juara-adab',
    title: 'Juara Adab Tahun 2',
    description: 'Menyempurnakan keenam-enam langkah Adab Makan & Minum.',
    requiredMissionId: 'basuh-selepas',
    accentColor: '#D97706',
  },
];

// Fun Roblox-style stepping stones & courtyard stars
export const BONUS_STARS: BonusStarDef[] = [
  { id: 'bonus-1', x: -3.2, y: 0.75, z: 6.2, label: 'Bintang Taman Barat' },
  { id: 'bonus-2', x: 3.2, y: 0.75, z: 6.2, label: 'Bintang Taman Timur' },
  { id: 'bonus-3', x: -7.5, y: 1.35, z: 0.5, label: 'Bintang Batu Lompatan Kiri' },
  { id: 'bonus-4', x: 7.5, y: 1.35, z: 0.5, label: 'Bintang Batu Lompatan Kanan' },
  { id: 'bonus-5', x: -3.8, y: 0.85, z: -6.8, label: 'Bintang Astaka Utara Kiri' },
  { id: 'bonus-6', x: 3.8, y: 0.85, z: -6.8, label: 'Bintang Astaka Utara Kanan' },
];

// Walkable elevated platforms (Roblox obby stepping stones + main pavilion plinth)
export const WORLD_PLATFORMS: PlatformBox[] = [
  // Main center pavilion tiered plinth (step 1 & step 2)
  { id: 'pavilion-base', x: 0, y: 0.25, z: 0, width: 6.6, depth: 6.6, height: 0.25 },
  // Left stepping stones (leading up to y = 0.9)
  { id: 'stone-l1', x: -7.5, y: 0.45, z: 2.8, width: 1.8, depth: 1.8, height: 0.45 },
  { id: 'stone-l2', x: -7.5, y: 0.9, z: 0.5, width: 1.9, depth: 1.9, height: 0.9 },
  { id: 'stone-l3', x: -7.5, y: 0.45, z: -1.8, width: 1.8, depth: 1.8, height: 0.45 },
  // Right stepping stones (leading up to y = 0.9)
  { id: 'stone-r1', x: 7.5, y: 0.45, z: 2.8, width: 1.8, depth: 1.8, height: 0.45 },
  { id: 'stone-r2', x: 7.5, y: 0.9, z: 0.5, width: 1.9, depth: 1.9, height: 0.9 },
  { id: 'stone-r3', x: 7.5, y: 0.45, z: -1.8, width: 1.8, depth: 1.8, height: 0.45 },
];

export const MAX_TOTAL_STARS =
  ADAB_MISSIONS.reduce((sum, m) => sum + m.starsReward, 0) + BONUS_STARS.length;
