// 몬스터 데이터 정의 (균형잡힌 난이도 곡선 및 권장 레벨 체계)

export const MONSTERS = [
  // ================= 숲 (Forest: 권장 Lv.1~5) =================
  {
    id: 'slime',
    name: '말랑한 풀 슬라임',
    title: 'LV.1 초보자의 친구',
    level: 1,
    tier: 'common',
    locationId: 'forest',
    maxHp: 68,
    hp: 68,
    atk: 12,
    def: 6,
    gold: 25,
    exp: 20,
    sprite: 'slime',
    color: '#34d399',
    drops: [
      { itemId: 'cs_potion_small', chance: 0.35 }
    ],
    desc: '통통 튀어다니는 젤리 몬스터. 초보자 수련에 적합하다.'
  },
  {
    id: 'thorn_wolf',
    name: '가시 덤불 늑대',
    title: 'LV.2 숲의 습격자',
    level: 2,
    tier: 'common',
    locationId: 'forest',
    maxHp: 105,
    hp: 105,
    atk: 17,
    def: 8,
    gold: 45,
    exp: 35,
    sprite: 'wolf',
    color: '#94a3b8',
    drops: [
      { itemId: 'cs_potion_small', chance: 0.4 },
      { itemId: 'wp_training_gloves', chance: 0.15 }
    ],
    desc: '날카로운 송곳니로 눈 깜짝할 새 달려들어 연속 공격을 퍼붓는다.'
  },
  {
    id: 'goblin',
    name: '숲의 고블린 도적',
    title: 'LV.3 야생 약탈자',
    level: 3,
    tier: 'common',
    locationId: 'forest',
    maxHp: 145,
    hp: 145,
    atk: 22,
    def: 12,
    gold: 70,
    exp: 55,
    sprite: 'goblin',
    color: '#84cc16',
    drops: [
      { itemId: 'wp_training_gloves', chance: 0.2 },
      { itemId: 'cs_potion_small', chance: 0.45 }
    ],
    desc: '낡은 칼을 쥐고 지나가는 모험가의 소지품을 노리는 고블린.'
  },
  {
    id: 'forest_ent',
    name: '고대 나무정령 앤트',
    title: 'BOSS 숲의 수호 거신 (Lv.5)',
    level: 5,
    isBoss: true,
    tier: 'boss',
    locationId: 'forest',
    maxHp: 360,
    hp: 360,
    atk: 32,
    def: 20,
    gold: 240,
    exp: 200,
    sprite: 'ent',
    color: '#78350f',
    specialMove: {
      name: '대지 분쇄타',
      triggerTurn: 3,
      multiplier: 1.7,
      warning: '⚠️ 앤트가 거대한 뿌리 곤봉을 치켜들며 [대지 분쇄타]를 준비합니다! (방어 권장)'
    },
    drops: [
      { itemId: 'ar_leather', chance: 0.4 },
      { itemId: 'ac_amulet_int', chance: 0.3 },
      { itemId: 'cs_potion_medium', chance: 0.6 }
    ],
    desc: '숲을 지키는 거대한 고대 거목. 단단한 껍질과 압도적인 완력을 지녔다.'
  },

  // ================= 동굴 (Cave: 권장 Lv.6~10) =================
  {
    id: 'cave_bat',
    name: '흡혈 암흑 박쥐',
    title: 'LV.6 어둠의 날개',
    level: 6,
    tier: 'common',
    locationId: 'cave',
    maxHp: 220,
    hp: 220,
    atk: 36,
    def: 16,
    gold: 110,
    exp: 95,
    sprite: 'bat',
    color: '#6366f1',
    drops: [
      { itemId: 'cs_potion_small', chance: 0.5 }
    ],
    desc: '어둠 속에서 소리 없이 급강하하여 체력을 흡수하는 흉포한 박쥐.'
  },
  {
    id: 'goblin_leader',
    name: '고블린 정예 두목',
    title: 'LV.7 동굴 무법자',
    level: 7,
    tier: 'elite',
    isElite: true,
    locationId: 'cave',
    maxHp: 310,
    hp: 310,
    atk: 44,
    def: 22,
    gold: 165,
    exp: 140,
    sprite: 'goblin_elite',
    color: '#ca8a04',
    specialMove: {
      name: '맹독 쌍검술',
      triggerTurn: 4,
      multiplier: 1.6,
      warning: '⚠️ 고블린 두목이 단검에 독을 바르고 [맹독 쌍검술]을 노립니다!'
    },
    drops: [
      { itemId: 'wp_iron_sword', chance: 0.25 },
      { itemId: 'ac_ring_str', chance: 0.2 }
    ],
    desc: '쇠단검과 사냥꾼 갑옷으로 무장한 고블린 무리의 사나운 우두머리.'
  },
  {
    id: 'crystal_scorpion',
    name: '맹독 수정 전갈',
    title: 'LV.8 푸른 맹독침',
    level: 8,
    tier: 'common',
    locationId: 'cave',
    maxHp: 390,
    hp: 390,
    atk: 50,
    def: 28,
    gold: 230,
    exp: 195,
    sprite: 'scorpion',
    color: '#06b6d4',
    drops: [
      { itemId: 'ar_shield', chance: 0.2 },
      { itemId: 'cs_potion_medium', chance: 0.4 }
    ],
    desc: '수정처럼 단단한 외골격과 치명적인 신경독 꼬리를 가진 지하 전갈.'
  },
  {
    id: 'cave_troll',
    name: '동굴 바위 트롤',
    title: 'BOSS 지하의 파괴신 (Lv.10)',
    level: 10,
    isBoss: true,
    tier: 'boss',
    locationId: 'cave',
    maxHp: 680,
    hp: 680,
    atk: 62,
    def: 32,
    gold: 520,
    exp: 450,
    sprite: 'troll',
    color: '#475569',
    hasRage: true,
    specialMove: {
      name: '낙석 지진타',
      triggerTurn: 3,
      multiplier: 1.85,
      warning: '⚠️ 바위 트롤이 땅을 강타하여 천장의 바위를 무너뜨리려 합니다! (방어 필수)'
    },
    drops: [
      { itemId: 'wp_mithril_blade', chance: 0.25 },
      { itemId: 'ar_shield', chance: 0.4 },
      { itemId: 'ac_charm_wind', chance: 0.3 }
    ],
    desc: '거대한 바위 곤봉을 휘두르는 흉폭한 트롤. 체력이 떨어지면 붉게 광폭화한다.'
  },

  // ================= 던전 (Dungeon: 권장 Lv.11~18) =================
  {
    id: 'orc_chieftain',
    name: '광폭한 오크 대장',
    title: 'LV.11 혈투의 투사',
    level: 11,
    tier: 'elite',
    isElite: true,
    locationId: 'dungeon',
    maxHp: 480,
    hp: 480,
    atk: 58,
    def: 30,
    gold: 340,
    exp: 290,
    sprite: 'orc_chief',
    color: '#b91c1c',
    drops: [
      { itemId: 'wp_mithril_blade', chance: 0.3 },
      { itemId: 'ac_belt_berserk', chance: 0.15 }
    ],
    desc: '쌍도끼를 휘두르며 끊임없이 광전사의 난무를 퍼붓는 오크 대족장.'
  },
  {
    id: 'necromancer',
    name: '심연의 흑마법사',
    title: 'LV.13 영혼의 수탈자',
    level: 13,
    tier: 'elite',
    isElite: true,
    locationId: 'dungeon',
    maxHp: 620,
    hp: 620,
    atk: 72,
    def: 32,
    gold: 480,
    exp: 420,
    sprite: 'necromancer',
    color: '#7e22ce',
    specialMove: {
      name: '암흑 영혼 폭발',
      triggerTurn: 3,
      multiplier: 1.9,
      warning: '⚠️ 흑마법사가 저주의 주문을 읊조리며 [암흑 영혼 폭발]을 영창합니다!'
    },
    drops: [
      { itemId: 'ac_amulet_int', chance: 0.4 },
      { itemId: 'cs_potion_elixir', chance: 0.3 }
    ],
    desc: '영혼을 흡수하여 생명력을 회복하고 치명적인 암흑 마법을 구사하는 마법사.'
  },
  {
    id: 'death_knight',
    name: '사령기사 데스나이트',
    title: 'LV.15 던전 수문장',
    level: 15,
    tier: 'elite',
    isElite: true,
    locationId: 'dungeon',
    maxHp: 880,
    hp: 880,
    atk: 86,
    def: 40,
    gold: 750,
    exp: 650,
    sprite: 'death_knight',
    color: '#0f172a',
    hasRage: true,
    specialMove: {
      name: '죽음의 처형검',
      triggerTurn: 4,
      multiplier: 2.0,
      warning: '⚠️ 데스나이트의 검이 푸른 원혼의 불꽃을 내뿜으며 [처형검]을 겨눕니다!'
    },
    drops: [
      { itemId: 'wp_hero_sword', chance: 0.25 },
      { itemId: 'ar_paladin', chance: 0.3 }
    ],
    desc: '생전 영웅이었으나 마기에 잠식된 불사의 흑기사. 룬 블레이드로 혼을 벤다.'
  },
  {
    id: 'dungeon_boss',
    name: '심연의 군주 벨리알',
    title: 'LORD 심연의 지배자 (Lv.18)',
    level: 18,
    isBoss: true,
    tier: 'boss',
    locationId: 'dungeon',
    maxHp: 1500,
    hp: 1500,
    shield: 350,
    maxShield: 350,
    atk: 105,
    def: 48,
    gold: 1600,
    exp: 1400,
    sprite: 'boss',
    color: '#581c87',
    hasRage: true,
    specialMove: {
      name: '종말의 심연참',
      triggerTurn: 3,
      multiplier: 2.2,
      warning: '⚠️ [경고] 벨리알이 공간을 왜곡하며 [종말의 심연참]을 시전합니다!! (방어 미사용 시 치명상)'
    },
    drops: [
      { itemId: 'wp_hero_sword', chance: 0.5 },
      { itemId: 'ar_paladin', chance: 0.45 },
      { itemId: 'ac_belt_berserk', chance: 0.4 },
      { itemId: 'cs_potion_elixir', chance: 1.0 }
    ],
    desc: '던전 최심부의 군주. 암흑 방어막으로 피해를 흡수하며 체력이 35% 미만이 되면 광폭화한다.'
  },

  // ================= 용의 둥지 (Dragon Lair: 권장 Lv.12~20) =================
  {
    id: 'magma_hound',
    name: '지옥불 마그마 하운드',
    title: 'LV.12 용암 사냥개',
    level: 12,
    tier: 'common',
    locationId: 'dragon_lair',
    maxHp: 560,
    hp: 560,
    atk: 68,
    def: 32,
    gold: 420,
    exp: 380,
    sprite: 'hound',
    color: '#c2410c',
    debuffOnHit: {
      type: 'burn',
      duration: 3,
      damage: 18,
      name: '화상',
      warning: '🔥 [화상] 몸에 불이 붙어 방어력이 30% 감소하고 지속 피해를 입습니다!'
    },
    drops: [
      { itemId: 'ar_dragon_armor', chance: 0.15 },
      { itemId: 'cs_potion_medium', chance: 0.6 }
    ],
    desc: '용암 지대에서 떼를 지어 다니는 사냥개. 물릴 때마다 치명적인 화상 피해를 입힌다.'
  },
  {
    id: 'fire_drake',
    name: '작열의 화염 드레이크',
    title: 'LV.16 화염의 아룡',
    level: 16,
    tier: 'elite',
    isElite: true,
    locationId: 'dragon_lair',
    maxHp: 1100,
    hp: 1100,
    atk: 95,
    def: 46,
    gold: 980,
    exp: 880,
    sprite: 'drake',
    color: '#ea580c',
    hasRage: true,
    specialMove: {
      name: '작열 브레스',
      triggerTurn: 3,
      multiplier: 2.0,
      warning: '⚠️ 화염 드레이크가 가슴을 부풀리며 [작열 브레스]를 뿜어내려 합니다!'
    },
    drops: [
      { itemId: 'wp_hero_sword', chance: 0.4 },
      { itemId: 'ar_dragon_armor', chance: 0.25 },
      { itemId: 'cs_potion_elixir', chance: 0.7 }
    ],
    desc: '용암 속에서 서식하며 전신에 화염을 두른 맹수. 섭씨 천도의 불꽃을 뿜어낸다.'
  },
  {
    id: 'ancient_dragon',
    name: '태고의 흑염룡 바하무트',
    title: 'MYTHIC 종말의 흑룡황제 (Lv.20)',
    level: 20,
    isBoss: true,
    tier: 'mythic',
    locationId: 'dragon_lair',
    maxHp: 2400,
    hp: 2400,
    shield: 550,
    maxShield: 550,
    atk: 130,
    def: 56,
    gold: 3400,
    exp: 3000,
    sprite: 'dragon',
    color: '#000000',
    hasRage: true,
    specialMove: {
      name: '멸망의 메가 플레어',
      triggerTurn: 3,
      multiplier: 2.3,
      warning: '🔥 [비상 경보] 바하무트가 하늘로 날아올라 [멸망의 메가 플레어]를 충전합니다!! (방어하지 않으면 생존 불가)'
    },
    drops: [
      { itemId: 'wp_dragon_slayer', chance: 0.5 },
      { itemId: 'ar_dragon_armor', chance: 0.5 },
      { itemId: 'ac_dragon_heart', chance: 0.4 },
      { itemId: 'cs_potion_elixir', chance: 1.0 }
    ],
    desc: '신화 속에서만 전해지던 전설의 흑룡. 고대 용의 비늘 결계로 550의 방어막을 두르고 있다.'
  },

  // ================= 망자의 극한 빙결 설원 (Frozen Abyss: 권장 Lv.14~22) =================
  {
    id: 'frost_wolf',
    name: '혹한의 설원 늑대',
    title: 'LV.14 빙원의 약탈자',
    level: 14,
    tier: 'common',
    locationId: 'frozen_abyss',
    maxHp: 720,
    hp: 720,
    atk: 80,
    def: 36,
    gold: 620,
    exp: 560,
    sprite: 'frost_wolf',
    color: '#bae6fd',
    drops: [
      { itemId: 'cs_potion_medium', chance: 0.6 },
      { itemId: 'ar_glacial_plate', chance: 0.15 }
    ],
    desc: '살을 에는 눈보라 속을 시속 100km로 질주하며 기습하는 설원의 맹수.'
  },
  {
    id: 'frost_golem',
    name: '빙하의 서리 골렘',
    title: 'LV.18 혹한의 수호 거신',
    level: 18,
    tier: 'elite',
    isElite: true,
    locationId: 'frozen_abyss',
    maxHp: 1400,
    hp: 1400,
    shield: 400,
    maxShield: 400,
    atk: 108,
    def: 60,
    gold: 1350,
    exp: 1200,
    sprite: 'frost_golem',
    color: '#38bdf8',
    specialMove: {
      name: '절대 영도 파쇄타',
      triggerTurn: 3,
      multiplier: 2.1,
      warning: '❄️ [경고] 서리 골렘이 빙하 주먹을 모아 [절대 영도 파쇄타]를 내리꽂으려 합니다!'
    },
    drops: [
      { itemId: 'wp_frost_mourne', chance: 0.3 },
      { itemId: 'ar_glacial_plate', chance: 0.35 }
    ],
    desc: '만년설과 푸른 얼음 결정체로 빚어진 거신. 단단한 400 얼음 방벽을 두르고 있다.'
  },
  {
    id: 'lich_king',
    name: '빙결의 사령 리치 킹',
    title: 'BOSS 영구동토의 절대군주 (Lv.22)',
    level: 22,
    isBoss: true,
    tier: 'boss',
    locationId: 'frozen_abyss',
    maxHp: 2700,
    hp: 2700,
    shield: 700,
    maxShield: 700,
    atk: 145,
    def: 60,
    gold: 4200,
    exp: 3800,
    sprite: 'lich_king',
    color: '#0284c7',
    hasRage: true,
    debuffOnHit: {
      type: 'freeze',
      duration: 1,
      name: '빙결',
      warning: '🧊 [빙결 상태이상!] 영혼까지 얼어붙어 다음 플레이어 턴이 강제로 스킵됩니다! (방어로 차단 가능)'
    },
    specialMove: {
      name: '영혼 동결의 눈보라',
      triggerTurn: 3,
      multiplier: 2.3,
      warning: '❄️ [비상 경보] 리치 킹이 영혼을 옭아매는 [동결 눈보라]를 영창합니다!! (방어 필수)'
    },
    drops: [
      { itemId: 'wp_frost_mourne', chance: 0.5 },
      { itemId: 'ar_glacial_plate', chance: 0.5 },
      { itemId: 'ac_ring_str', chance: 0.6 },
      { itemId: 'cs_potion_elixir', chance: 1.0 }
    ],
    desc: '설원 전체를 지배하는 불사의 얼음 군주. 700 마력 결계와 적을 얼려 턴을 봉인하는 빙결 마법을 쓴다.'
  },

  // ================= 천공의 신화 시련탑 (Celestial Tower: 권장 Lv.19~25) =================
  {
    id: 'celestial_sentinel',
    name: '천공의 단죄 파수병',
    title: 'LV.19 신성 집행관',
    level: 19,
    tier: 'elite',
    isElite: true,
    locationId: 'celestial_tower',
    maxHp: 1600,
    hp: 1600,
    atk: 120,
    def: 62,
    gold: 1800,
    exp: 1600,
    sprite: 'celestial_sentinel',
    color: '#eab308',
    hasCounterStance: true,
    specialMove: {
      name: '신성 섬광격',
      triggerTurn: 3,
      multiplier: 2.0,
      warning: '⚠️ 파수병이 날개를 펼치며 [신성 섬광격]을 준비합니다!'
    },
    drops: [
      { itemId: 'wp_celestial_blade', chance: 0.35 },
      { itemId: 'ar_celestial_aegis', chance: 0.3 }
    ],
    desc: '빛의 날개를 지닌 신성 골렘. 가시 방벽 자세를 취하면 가해진 공격의 40%를 반사한다.'
  },
  {
    id: 'void_herald',
    name: '공허의 심연 전령',
    title: 'LV.22 차원의 파괴자',
    level: 22,
    tier: 'elite',
    isElite: true,
    locationId: 'celestial_tower',
    maxHp: 2100,
    hp: 2100,
    shield: 500,
    maxShield: 500,
    atk: 140,
    def: 62,
    gold: 2600,
    exp: 2300,
    sprite: 'void_herald',
    color: '#6b21a8',
    debuffOnHit: {
      type: 'curse',
      duration: 4,
      name: '치유 저주',
      warning: '🔮 [공허 저주] 물약 치유 효과가 60% 급감하고 받는 피해가 증가합니다! [정화]로 해제하세요!'
    },
    specialMove: {
      name: '차원 붕괴참',
      triggerTurn: 3,
      multiplier: 2.2,
      warning: '⚠️ [경고] 전령이 차원의 균열을 열어 [차원 붕괴참]을 시전합니다!'
    },
    drops: [
      { itemId: 'wp_celestial_blade', chance: 0.4 },
      { itemId: 'ar_celestial_aegis', chance: 0.4 },
      { itemId: 'cs_potion_elixir', chance: 0.8 }
    ],
    desc: '공허의 틈새에서 소환된 이계의 망령. 물약 치유를 무력화하는 맹렬한 저주를 건다.'
  },
  {
    id: 'chaos_overlord',
    name: '태초의 혼돈신 카오스 크로노스',
    title: 'GOD 전 우주의 파멸자 (Lv.25)',
    level: 25,
    isBoss: true,
    tier: 'mythic',
    locationId: 'celestial_tower',
    maxHp: 3600,
    hp: 3600,
    shield: 1000,
    maxShield: 1000,
    atk: 170,
    def: 72,
    gold: 8000,
    exp: 7000,
    sprite: 'chaos_overlord',
    color: '#4c1d95',
    hasRage: true,
    hasPhaseAwakening: true,
    specialMove: {
      name: '천지창조의 종말포',
      triggerTurn: 3,
      multiplier: 2.5,
      warning: '💥 [최종 비상 경보] 카오스가 우주의 차원을 수렴해 [천지창조의 종말포]를 조준합니다!! (반드시 방어하십시오!)'
    },
    drops: [
      { itemId: 'wp_chaos_slayer', chance: 0.6 },
      { itemId: 'ar_chaos_emperor', chance: 0.6 },
      { itemId: 'ac_ring_of_time', chance: 0.5 },
      { itemId: 'cs_potion_elixir', chance: 1.0 }
    ],
    desc: '세계의 시작이자 끝. 1,000 혼돈의 왜곡 장막을 두르고 있으며, 체력 50% 이하 시 2단계 진정한 혼돈 각성을 일으킨다.'
  }
];

export function getMonsterById(id) {
  const m = MONSTERS.find(item => item.id === id);
  if (!m) return null;
  return JSON.parse(JSON.stringify(m));
}
