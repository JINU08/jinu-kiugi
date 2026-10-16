// 아이템 데이터 정의
// 등급: common(일반, 회색), uncommon(고급, 초록), rare(희귀, 파랑), epic(영웅, 보라/금색)
// 종류: weapon(무기), armor(방어구), accessory(액세서리), consumable(소비품)

export const ITEM_GRADES = {
  common: { name: '일반', color: '#9ca3af', border: '#4b5563', bg: 'rgba(75, 85, 99, 0.2)' },
  uncommon: { name: '고급', color: '#34d399', border: '#059669', bg: 'rgba(5, 150, 105, 0.2)' },
  rare: { name: '희귀', color: '#60a5fa', border: '#2563eb', bg: 'rgba(37, 99, 235, 0.2)' },
  epic: { name: '영웅', color: '#c084fc', border: '#7c3aed', bg: 'rgba(124, 58, 237, 0.25)' },
  mythic: { name: '신화', color: '#fde047', border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.3)' }
};

export const ITEMS = [
  // --- 무기 (Weapons) ---
  {
    id: 'wp_wood_stick',
    name: '나무 몽둥이',
    type: 'weapon',
    grade: 'common',
    price: 60,
    sellPrice: 30,
    stats: { atk: 4, str: 1 },
    desc: '마을 주변 나뭇가지로 깎아 만든 조잡하지만 든든한 몽둥이.',
    icon: '🪵'
  },
  {
    id: 'wp_training_gloves',
    name: '훈련용 가죽 장갑',
    type: 'weapon',
    grade: 'common',
    price: 150,
    sellPrice: 75,
    stats: { atk: 7, str: 1, agi: 1 },
    desc: '수련생들이 타격 연습용으로 애용하는 튼튼한 장갑.',
    icon: '🥊'
  },
  {
    id: 'wp_iron_sword',
    name: '단단한 철검',
    type: 'weapon',
    grade: 'uncommon',
    price: 450,
    sellPrice: 225,
    stats: { atk: 14, str: 2, crit: 2 },
    desc: '대장장이가 정성껏 담금질한 날카로운 쇠 검.',
    icon: '🗡️'
  },
  {
    id: 'wp_mithril_blade',
    name: '미스릴 블레이드',
    type: 'weapon',
    grade: 'rare',
    price: 1400,
    sellPrice: 700,
    stats: { atk: 28, str: 4, agi: 3, crit: 3 },
    desc: '신비로운 은빛 광채를 내뿜는 가볍고 치명적인 명검.',
    icon: '⚔️'
  },
  {
    id: 'wp_frost_mourne',
    name: '서리한 아이스 블레이드',
    type: 'weapon',
    grade: 'rare',
    price: 2800,
    sellPrice: 1400,
    stats: { atk: 42, str: 6, agi: 4, crit: 4 },
    desc: '만년 빙하의 냉기가 감도는 검. 베인 상처를 순식간에 얼려버린다.',
    icon: '❄️🗡️'
  },
  {
    id: 'wp_hero_sword',
    name: '용사의 성검',
    type: 'weapon',
    grade: 'epic',
    price: 3800,
    sellPrice: 1900,
    stats: { atk: 65, str: 10, agi: 6, crit: 6 },
    desc: '진정한 영웅만이 쥘 수 있는 황금빛 성스러운 대검.',
    icon: '✨🗡️'
  },
  {
    id: 'wp_celestial_blade',
    name: '천공의 신성 단죄검',
    type: 'weapon',
    grade: 'epic',
    price: 5800,
    sellPrice: 2900,
    stats: { atk: 95, str: 14, agi: 8, crit: 8 },
    desc: '하늘의 별빛을 담은 신성검. 악을 멸하는 순수한 빛을 발한다.',
    icon: '✨⚔️'
  },
  {
    id: 'wp_dragon_slayer',
    name: '멸룡도 드래곤 슬레이어',
    type: 'weapon',
    grade: 'mythic',
    price: 9000,
    sellPrice: 4500,
    stats: { atk: 135, str: 20, agi: 12, crit: 10 },
    desc: '흑염룡의 송곳니를 제련하여 만든 전설의 용 살해자 대검.',
    icon: '🐉🗡️'
  },
  {
    id: 'wp_chaos_slayer',
    name: '혼돈을 가르는 패왕도',
    type: 'weapon',
    grade: 'mythic',
    price: 18000,
    sellPrice: 9000,
    stats: { atk: 185, str: 26, agi: 16, crit: 12 },
    desc: '태초의 혼돈을 양단한 절대 무기. 신마저 두려워하는 압도적인 파괴력을 지녔다.',
    icon: '🌌🗡️'
  },

  // --- 방어구 (Armor) ---
  {
    id: 'ar_cloth',
    name: '낡은 수련복',
    type: 'armor',
    grade: 'common',
    price: 50,
    sellPrice: 25,
    stats: { def: 3, hp: 15 },
    desc: '정진우가 처음 모험을 시작할 때 입었던 편안한 트레이닝복.',
    icon: '🥋'
  },
  {
    id: 'ar_leather',
    name: '사냥꾼 가죽 갑옷',
    type: 'armor',
    grade: 'uncommon',
    price: 320,
    sellPrice: 160,
    stats: { def: 7, hp: 35, agi: 2 },
    desc: '야수들의 발톱을 막아주는 유연하고 질긴 가죽 갑옷.',
    icon: '🦺'
  },
  {
    id: 'ar_shield',
    name: '수호자의 방패',
    type: 'armor',
    grade: 'rare',
    price: 900,
    sellPrice: 450,
    stats: { def: 15, hp: 80, str: 3 },
    desc: '어떠한 맹공도 굳건히 막아내는 묵직한 강철 방패.',
    icon: '🛡️'
  },
  {
    id: 'ar_glacial_plate',
    name: '빙하의 절대 수호 갑주',
    type: 'armor',
    grade: 'rare',
    price: 2400,
    sellPrice: 1200,
    stats: { def: 26, hp: 140, str: 5 },
    desc: '차가운 빙벽을 통째로 깎아 만든 중갑. 물리 타격을 흡수한다.',
    icon: '❄️🛡️'
  },
  {
    id: 'ar_paladin',
    name: '성기사의 수호 갑주',
    type: 'armor',
    grade: 'epic',
    price: 3200,
    sellPrice: 1600,
    stats: { def: 42, hp: 220, str: 8 },
    desc: '신성한 축복이 깃들어 착용자의 생명력을 극대화하는 성갑.',
    icon: '🛡️✨'
  },
  {
    id: 'ar_celestial_aegis',
    name: '천공의 신성 수호 이지스',
    type: 'armor',
    grade: 'epic',
    price: 6500,
    sellPrice: 3250,
    stats: { def: 62, hp: 340, str: 12, agi: 6 },
    desc: '천상의 신관들이 축복한 방호복. 착용자에게 강력한 신성 결계를 형성한다.',
    icon: '✨🛡️'
  },
  {
    id: 'ar_dragon_armor',
    name: '흑염룡의 용비늘 갑주',
    type: 'armor',
    grade: 'mythic',
    price: 8000,
    sellPrice: 4000,
    stats: { def: 88, hp: 480, str: 16, agi: 8 },
    desc: '화염과 모든 마법 공격을 튕겨내는 신화의 용비늘 중갑.',
    icon: '🐉🛡️'
  },
  {
    id: 'ar_chaos_emperor',
    name: '혼돈 제왕의 암흑 갑주',
    type: 'armor',
    grade: 'mythic',
    price: 16000,
    sellPrice: 8000,
    stats: { def: 120, hp: 680, str: 22, agi: 12 },
    desc: '차원의 왜곡 에너지를 응축한 암흑 판금갑. 절대적인 방어력을 부여한다.',
    icon: '🌌🛡️'
  },

  // --- 액세서리 (Accessory) ---
  {
    id: 'ac_ring_str',
    name: '힘의 반지',
    type: 'accessory',
    grade: 'uncommon',
    price: 280,
    sellPrice: 140,
    stats: { str: 2, atk: 3 },
    desc: '착용자의 완력을 배가시키는 붉은 루비 반지.',
    icon: '💍'
  },
  {
    id: 'ac_amulet_int',
    name: '지혜의 목걸이',
    type: 'accessory',
    grade: 'uncommon',
    price: 280,
    sellPrice: 140,
    stats: { int: 4, expBoost: 8 },
    desc: '머리를 맑게 하여 성장의 깨달음을 촉진하는 사파이어 목걸이.',
    icon: '📿'
  },
  {
    id: 'ac_charm_wind',
    name: '바람의 부적',
    type: 'accessory',
    grade: 'rare',
    price: 850,
    sellPrice: 425,
    stats: { agi: 4, crit: 3, dodge: 3 },
    desc: '발걸음을 깃털처럼 가볍게 해주는 신비로운 바람의 부적.',
    icon: '🎐'
  },
  {
    id: 'ac_belt_berserk',
    name: '광전사의 벨트',
    type: 'accessory',
    grade: 'epic',
    price: 2900,
    sellPrice: 1450,
    stats: { str: 6, atk: 10, hp: 60, crit: 4 },
    desc: '폭발적인 잠재 전투력을 일깨우는 전설의 가죽 벨트.',
    icon: '👑'
  },
  {
    id: 'ac_dragon_heart',
    name: '불멸의 용 심장',
    type: 'accessory',
    grade: 'mythic',
    price: 7500,
    sellPrice: 3750,
    stats: { str: 12, atk: 18, hp: 140, crit: 6, dodge: 5 },
    desc: '고대 용의 심장이 고동치며 무한한 생명력과 파괴력을 불어넣는다.',
    icon: '❤️‍🔥'
  },
  {
    id: 'ac_ring_of_time',
    name: '시간의 지배자 반지',
    type: 'accessory',
    grade: 'mythic',
    price: 15000,
    sellPrice: 7500,
    stats: { str: 15, int: 15, agi: 15, atk: 25, crit: 8, dodge: 6 },
    desc: '시공간의 흐름을 쥐락펴락하는 전설의 아티팩트. 모든 능력치를 파격적으로 상승시킨다.',
    icon: '⏳💍'
  },

  // --- 소비 아이템 (Consumables) ---
  {
    id: 'cs_potion_small',
    name: '초급 HP 물약',
    type: 'consumable',
    grade: 'common',
    price: 25,
    sellPrice: 10,
    effect: { heal: 60 },
    desc: '상처를 치유하여 체력을 60 회복한다. (최대 HP 초과 불가)',
    icon: '🧪'
  },
  {
    id: 'cs_potion_medium',
    name: '중급 HP 물약',
    type: 'consumable',
    grade: 'uncommon',
    price: 70,
    sellPrice: 30,
    effect: { heal: 200 },
    desc: '체력을 200 회복한다. (최대 HP 초과 불가)',
    icon: '🍷'
  },
  {
    id: 'cs_potion_elixir',
    name: '완전 회복 엘릭서',
    type: 'consumable',
    grade: 'rare',
    price: 250,
    sellPrice: 100,
    effect: { healPercent: 100 },
    desc: '신비한 영약. 사용 시 HP를 100% 완전 회복한다.',
    icon: '⚗️'
  },
  {
    id: 'cs_training_scroll',
    name: '훈련 비급서',
    type: 'consumable',
    grade: 'rare',
    price: 300,
    sellPrice: 120,
    effect: { exp: 250, str: 3, int: 3 },
    desc: '읽는 순간 무도의 깨달음을 얻어 즉시 경험치 250과 근력, 지능이 상승한다.',
    icon: '📜'
  }
];

export function getItemById(id) {
  return ITEMS.find(item => item.id === id) || null;
}
