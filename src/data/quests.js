// 퀘스트 데이터 정의

export const QUESTS = [
  {
    id: 'q_train_10',
    title: '기초 체력 다지기',
    desc: '근력 훈련을 10회 완료하여 튼튼한 육체를 가꾸세요.',
    category: 'train',
    target: 10,
    reward: { gold: 150, exp: 80, sp: 1 },
    icon: '🏋️'
  },
  {
    id: 'q_study_10',
    title: '지혜로운 수련자',
    desc: '공부하기를 10회 완료하여 무도의 이론과 지능을 넓히세요.',
    category: 'study',
    target: 10,
    reward: { gold: 150, exp: 80, sp: 1 },
    icon: '📖'
  },
  {
    id: 'q_hunt_5',
    title: '초보 퇴마사',
    desc: '몬스터를 5마리 처치하여 주변 지역의 안전을 확보하세요.',
    category: 'monster_kill',
    target: 5,
    reward: { gold: 300, exp: 180, itemId: 'cs_potion_small' },
    icon: '🗡️'
  },
  {
    id: 'q_gold_500',
    title: '알뜰살뜰 자금 마련',
    desc: '골드를 누적 500개 이상 모아 부유한 모험가가 되세요.',
    category: 'gold_accum',
    target: 500,
    reward: { gold: 200, exp: 120, sp: 1 },
    icon: '💰'
  },
  {
    id: 'q_level_5',
    title: '숙련된 모험가의 길',
    desc: '정진우의 레벨을 5까지 달성하세요.',
    category: 'reach_level',
    target: 5,
    reward: { gold: 500, exp: 300, itemId: 'cs_potion_medium', sp: 1 },
    icon: '⭐'
  },
  {
    id: 'q_buy_equip',
    title: '장비 장만의 즐거움',
    desc: '상점에서 장비 아이템을 1개 이상 구매하세요.',
    category: 'buy_gear',
    target: 1,
    reward: { gold: 200, exp: 150, itemId: 'cs_potion_small' },
    icon: '🛍️'
  },
  {
    id: 'q_ent_kill',
    title: '숲의 고대 정령 정화',
    desc: '숲의 수호 거신인 [고대 나무정령 앤트]를 격퇴하세요!',
    category: 'kill_ent',
    target: 1,
    reward: { gold: 600, exp: 500, itemId: 'cs_potion_medium', sp: 1 },
    icon: '🌲'
  },
  {
    id: 'q_troll_kill',
    title: '동굴 바위거인 분쇄',
    desc: '동굴의 지진 파괴신인 [동굴 바위 트롤]을 처치하세요!',
    category: 'kill_troll',
    target: 1,
    reward: { gold: 1200, exp: 1000, itemId: 'cs_potion_elixir', sp: 2 },
    icon: '🪨'
  },
  {
    id: 'q_boss_kill',
    title: '심연의 군주 벨리알 토벌',
    desc: '던전의 마왕인 [심연의 군주 벨리알]을 쓰러뜨리세요!',
    category: 'kill_boss',
    target: 1,
    reward: { gold: 3000, exp: 2500, itemId: 'cs_potion_elixir', sp: 3 },
    icon: '👑'
  },
  {
    id: 'q_dragon_kill',
    title: '신화의 흑염룡 바하무트 토벌',
    desc: '용의 둥지 최심부의 황제 [태고의 흑염룡 바하무트]를 토벌하여 세계를 구원하세요!!',
    category: 'kill_dragon',
    target: 1,
    reward: { gold: 10000, exp: 8000, itemId: 'wp_dragon_slayer', sp: 5 },
    icon: '🐉'
  },
  {
    id: 'q_lich_kill',
    title: '영구동토의 리치 킹 토벌',
    desc: '빙결 설원의 절대군주 [빙결의 사령 리치 킹]을 처단하고 대지를 녹이세요!',
    category: 'kill_lich',
    target: 1,
    reward: { gold: 15000, exp: 12000, itemId: 'wp_frost_mourne', sp: 4 },
    icon: '❄️'
  },
  {
    id: 'q_chaos_kill',
    title: '태초의 혼돈신 카오스 격멸',
    desc: '시련탑 정상의 창조신 [태초의 혼돈신 카오스 크로노스]를 쓰러뜨려 전설의 정점이 되세요!!',
    category: 'kill_chaos',
    target: 1,
    reward: { gold: 40000, exp: 30000, itemId: 'ac_ring_of_time', sp: 10 },
    icon: '🌌'
  }
];

export function getQuestById(id) {
  return QUESTS.find(q => q.id === id);
}
