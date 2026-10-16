// 브라우저 localStorage 저장 및 관리 모듈

const STORAGE_KEY = 'jinu_kiugi_save_v1';
const CURRENT_VERSION = 1;

export const DEFAULT_STATE = {
  version: CURRENT_VERSION,
  name: '정진우',
  level: 1,
  exp: 0,
  maxExp: 50,
  gold: 100,
  sp: 0, // 스킬 포인트

  // 기본 스탯 (장비 및 보너스 미포함 순수 스탯)
  baseStats: {
    hp: 105,
    baseMaxHp: 70,
    str: 8,
    int: 8,
    agi: 8
  },

  // 장착 장비 (아이템 ID 또는 null)
  equipped: {
    weapon: 'wp_wood_stick',
    armor: 'ar_cloth',
    accessory: null
  },

  // 인벤토리 목록 [{ itemId, count, uid }]
  inventory: [
    { itemId: 'cs_potion_small', count: 3 }
  ],

  // 스킬 레벨 맵
  skills: {
    heavy_strike: 0,
    focus_training: 0,
    saving_mind: 0,
    quick_recovery: 0,
    iron_wall: 0,
    gale_agility: 0
  },

  // 퀘스트 진행 데이터 { [questId]: { progress: 0, claimed: false } }
  quests: {
    q_train_10: { progress: 0, claimed: false },
    q_study_10: { progress: 0, claimed: false },
    q_hunt_5: { progress: 0, claimed: false },
    q_gold_500: { progress: 100, claimed: false },
    q_level_5: { progress: 1, claimed: false },
    q_buy_equip: { progress: 0, claimed: false },
    q_boss_kill: { progress: 0, claimed: false }
  },

  // 통계 누적치
  statsAccum: {
    totalTrain: 0,
    totalStudy: 0,
    totalKills: 0,
    totalBossKills: 0,
    totalGoldEarned: 100,
    totalItemsBought: 0
  },

  // 현재 위치 ID
  currentLocationId: 'village',

  // 방치형 자동 성장 활동 ('none' | 'train' | 'job' | 'hunt')
  idleActivity: 'train',

  // 시간 기록
  lastSavedTime: Date.now()
};

export class StorageEngine {
  static load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
      const data = JSON.parse(raw);
      if (!data || data.version !== CURRENT_VERSION) {
        // 이전 버전 마이그레이션 또는 기본값 병합
        return this.mergeWithDefault(data);
      }
      return this.mergeWithDefault(data);
    } catch (e) {
      console.error('Failed to load save data, resetting to default:', e);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  static save(state) {
    try {
      const dataToSave = {
        ...state,
        version: CURRENT_VERSION,
        lastSavedTime: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  static reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('Reset failed:', e);
      return false;
    }
  }

  static mergeWithDefault(loaded) {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_STATE));
    return {
      ...fresh,
      ...loaded,
      baseStats: {
        ...fresh.baseStats,
        ...(loaded.baseStats || {})
      },
      equipped: {
        ...fresh.equipped,
        ...(loaded.equipped || {})
      },
      skills: {
        ...fresh.skills,
        ...(loaded.skills || {})
      },
      quests: {
        ...fresh.quests,
        ...(loaded.quests || {})
      },
      statsAccum: {
        ...fresh.statsAccum,
        ...(loaded.statsAccum || {})
      },
      inventory: Array.isArray(loaded.inventory) ? loaded.inventory : fresh.inventory
    };
  }
}
