// 스킬 데이터 정의
export const SKILLS = [
  {
    id: 'heavy_strike',
    name: '강력한 일격',
    type: 'active',
    maxLevel: 5,
    costPerLevel: 1,
    icon: '💥',
    desc: '기합을 모아 치명적인 강타를 날립니다. 전투 중 스킬로 사용 가능합니다.',
    getEffectDesc: (lvl) => lvl === 0 
      ? '공격력의 160% 피해를 입히는 스킬을 해금합니다. (방어막 파쇄 특화)'
      : `전투 스킬 피해 배율: ${145 + lvl * 15}% 데미지 (방어막 파쇄 특화)`,
    unlockLevel: 1
  },
  {
    id: 'focus_training',
    name: '집중 훈련',
    type: 'passive',
    maxLevel: 5,
    costPerLevel: 1,
    icon: '🧘',
    desc: '수련 시 정신을 집중하여 성장의 효율을 대폭 증폭시킵니다.',
    getEffectDesc: (lvl) => `근력 훈련 및 공부 경험치 획득량 +${lvl * 15}%`,
    multiplier: (lvl) => 1 + (lvl * 0.15),
    unlockLevel: 1
  },
  {
    id: 'saving_mind',
    name: '절약 정신',
    type: 'passive',
    maxLevel: 5,
    costPerLevel: 1,
    icon: '💰',
    desc: '금전 감각을 발휘하여 전투 및 방치 활동에서 얻는 골드를 증가시킵니다.',
    getEffectDesc: (lvl) => `모든 골드 획득량 +${lvl * 12}%`,
    multiplier: (lvl) => 1 + (lvl * 0.12),
    unlockLevel: 2
  },
  {
    id: 'quick_recovery',
    name: '빠른 회복',
    type: 'passive',
    maxLevel: 5,
    costPerLevel: 1,
    icon: '💖',
    desc: '신진대사를 촉진하여 휴식 시 체력 회복량을 늘리고 피로를 빠르게 씻어냅니다.',
    getEffectDesc: (lvl) => `휴식 회복량 +${lvl * 15}%, 매 5초마다 자동 재생 +${lvl * 1} HP`,
    multiplier: (lvl) => 1 + (lvl * 0.15),
    unlockLevel: 2
  },
  {
    id: 'iron_wall',
    name: '철벽 수련',
    type: 'passive',
    maxLevel: 5,
    costPerLevel: 1,
    icon: '🛡️',
    desc: '근육을 단단하게 단련하여 적의 공격을 무력화하고 방어력을 강화합니다.',
    getEffectDesc: (lvl) => `방어력 +${lvl * 3}, 최대 HP +${lvl * 15}`,
    defBonus: (lvl) => lvl * 3,
    hpBonus: (lvl) => lvl * 15,
    unlockLevel: 3
  },
  {
    id: 'gale_agility',
    name: '질풍의 일격',
    type: 'passive',
    maxLevel: 5,
    costPerLevel: 1,
    icon: '⚡',
    desc: '바람처럼 날렵한 몸놀림으로 치명타 확률과 적의 공격 회피율을 높입니다.',
    getEffectDesc: (lvl) => `치명타 확률 +${lvl * 2}%, 회피율 +${lvl * 1.5}%`,
    critBonus: (lvl) => lvl * 2,
    dodgeBonus: (lvl) => lvl * 1.5,
    unlockLevel: 4
  }
];

export function getSkillById(id) {
  return SKILLS.find(s => s.id === id);
}
