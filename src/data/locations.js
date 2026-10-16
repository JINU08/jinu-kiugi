// 장소 데이터 정의
export const LOCATIONS = [
  {
    id: 'village',
    name: '평화로운 시작의 마을',
    shortName: '마을',
    icon: '🏡',
    desc: '모험가들이 휴식을 취하고 재정비를 하는 아늑한 시골 마을.',
    theme: 'peaceful',
    canBattle: false,
    ambientColor: '#3b82f6',
    unlockLevel: 1,
    recLevel: '안전 구역'
  },
  {
    id: 'training',
    name: '청룡 무도 수련장',
    shortName: '훈련장',
    icon: '🥋',
    desc: '수많은 무도가들이 땀흘리며 한계를 돌파하는 수련의 장.',
    theme: 'training',
    canBattle: false,
    ambientColor: '#f59e0b',
    unlockLevel: 1,
    recLevel: '수련 구역'
  },
  {
    id: 'forest',
    name: '속삭이는 요정의 숲',
    shortName: '숲',
    icon: '🌲',
    desc: '푸른 나무들 사이로 몬스터들이 출몰하는 초보 모험지. 고대 나무정령이 숲을 수호한다.',
    theme: 'forest',
    canBattle: true,
    monsters: ['slime', 'thorn_wolf', 'goblin', 'forest_ent'],
    ambientColor: '#10b981',
    unlockLevel: 1,
    recLevel: '권장 Lv.1~5'
  },
  {
    id: 'cave',
    name: '울부짖는 메아리 동굴',
    shortName: '동굴',
    icon: '🪨',
    desc: '빛이 들지 않는 험준한 지하 미궁. 무시무시한 바위 트롤과 수정 전갈이 도사린다.',
    theme: 'cave',
    canBattle: true,
    monsters: ['cave_bat', 'goblin_leader', 'crystal_scorpion', 'cave_troll'],
    ambientColor: '#6366f1',
    unlockLevel: 3,
    recLevel: '권장 Lv.6~10'
  },
  {
    id: 'dungeon',
    name: '심연의 마왕 던전',
    shortName: '던전',
    icon: '🏰',
    desc: '강력한 마기와 흑마법이 소용돌이치는 암흑 요새. 심연의 군주 벨리알이 지배한다.',
    theme: 'dungeon',
    canBattle: true,
    monsters: ['orc_chieftain', 'necromancer', 'death_knight', 'dungeon_boss'],
    ambientColor: '#ef4444',
    unlockLevel: 6,
    recLevel: '권장 Lv.11~18'
  },
  {
    id: 'dragon_lair',
    name: '작열하는 멸망의 용 둥지',
    shortName: '용의 둥지',
    icon: '🌋',
    desc: '모든 생명이 타오르는 극한의 사투장. 태고의 흑염룡이 잠들어 있는 최상위 도전지.',
    theme: 'dragon',
    canBattle: true,
    monsters: ['magma_hound', 'fire_drake', 'ancient_dragon'],
    ambientColor: '#ea580c',
    unlockLevel: 10,
    recLevel: '권장 Lv.12~20'
  },
  {
    id: 'frozen_abyss',
    name: '망자의 극한 빙결 설원',
    shortName: '빙결 설원',
    icon: '❄️',
    desc: '영하 수십 도의 혹한과 눈보라가 휘몰아치는 설원. 빙결의 사령 리치 킹이 군림한다.',
    theme: 'frozen',
    canBattle: true,
    monsters: ['frost_wolf', 'frost_golem', 'lich_king'],
    ambientColor: '#38bdf8',
    unlockLevel: 14,
    recLevel: '권장 Lv.14~22'
  },
  {
    id: 'celestial_tower',
    name: '천공의 신화 시련탑',
    shortName: '시련탑',
    icon: '🏛️',
    desc: '신들의 영역이자 태초의 혼돈이 봉인된 성역. 전 우주의 운명을 건 최후의 결전지.',
    theme: 'celestial',
    canBattle: true,
    monsters: ['celestial_sentinel', 'void_herald', 'chaos_overlord'],
    ambientColor: '#c084fc',
    unlockLevel: 18,
    recLevel: '권장 Lv.19~25'
  }
];

export function getLocationById(id) {
  return LOCATIONS.find(loc => loc.id === id) || LOCATIONS[0];
}
