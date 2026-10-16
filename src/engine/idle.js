// 방치형 자동 성장 및 오프라인 보상 계산 모듈

export const IDLE_ACTIVITIES = {
  none: {
    id: 'none',
    name: '휴식 및 대기',
    icon: '💤',
    desc: '아무런 활동도 하지 않고 체력을 보존합니다.',
    expPerSec: 0,
    goldPerSec: 0,
    itemChancePerHour: 0
  },
  train: {
    id: 'train',
    name: '자율 훈련',
    icon: '🏋️',
    desc: '자율적으로 기초 체력 단련과 무도 수련을 지속하여 경험치를 획득합니다.',
    expPerSec: 2.0, // 초당 2 exp
    goldPerSec: 0.2, // 소량의 용돈
    itemChancePerHour: 0.1
  },
  job: {
    id: 'job',
    name: '아르바이트 및 수익 활동',
    icon: '💰',
    desc: '마을 상점 보조 및 의뢰 배달을 수행하여 안정적으로 골드를 벌어들입니다.',
    expPerSec: 0.5,
    goldPerSec: 1.8, // 초당 1.8 골드
    itemChancePerHour: 0.15
  },
  hunt: {
    id: 'hunt',
    name: '경계 순찰 및 마물 소탕',
    icon: '⚔️',
    desc: '마을 주변을 순찰하며 경험치와 골드를 균형 있게 획득합니다.',
    expPerSec: 1.4,
    goldPerSec: 1.1,
    itemChancePerHour: 0.25
  }
};

export class IdleEngine {
  // 오프라인 경과 시간에 따른 보상 계산
  // 최대 8시간 (28,800초)
  static calculateOfflineReward(lastSavedTime, activityId, playerLevel, skills) {
    if (!lastSavedTime || isNaN(lastSavedTime)) {
      return null;
    }

    const now = Date.now();
    const diffMs = now - lastSavedTime;
    const diffSec = Math.floor(diffMs / 1000);

    // 최소 30초 이상 경과 시에만 오프라인 보상 팝업 제공
    if (diffSec < 30) {
      return null;
    }

    // 최대 8시간(28800초) 제한
    const effectiveSec = Math.min(diffSec, 8 * 3600);
    const activity = IDLE_ACTIVITIES[activityId] || IDLE_ACTIVITIES.train;

    if (activity.id === 'none') {
      return null;
    }

    // 스킬 효과 반영
    const expMultiplier = 1 + ((skills?.focus_training || 0) * 0.25);
    const goldMultiplier = 1 + ((skills?.saving_mind || 0) * 0.20);
    const levelScale = 1 + (playerLevel - 1) * 0.15;

    const baseExp = Math.floor(activity.expPerSec * effectiveSec * levelScale * expMultiplier);
    const baseGold = Math.floor(activity.goldPerSec * effectiveSec * levelScale * goldMultiplier);

    // 보너스 아이템 추첨
    const hours = effectiveSec / 3600;
    const itemRoll = Math.random();
    let bonusItem = null;
    if (itemRoll < activity.itemChancePerHour * hours) {
      bonusItem = effectiveSec > 7200 ? 'cs_potion_medium' : 'cs_potion_small';
    }

    const hoursPassed = Math.floor(effectiveSec / 3600);
    const minutesPassed = Math.floor((effectiveSec % 3600) / 60);
    const secondsPassed = effectiveSec % 60;

    return {
      effectiveSec,
      totalSec: diffSec,
      isCapped: diffSec > 8 * 3600,
      timeFormatted: `${hoursPassed > 0 ? hoursPassed + '시간 ' : ''}${minutesPassed}분 ${secondsPassed}초`,
      activityName: activity.name,
      exp: baseExp,
      gold: baseGold,
      bonusItem
    };
  }

  // 온라인 실시간 방치 틱 계산 (1초 단위)
  static calculateOnlineTick(activityId, playerLevel, skills) {
    const activity = IDLE_ACTIVITIES[activityId] || IDLE_ACTIVITIES.train;
    if (activity.id === 'none') {
      return { exp: 0, gold: 0 };
    }

    const expMultiplier = 1 + ((skills?.focus_training || 0) * 0.25);
    const goldMultiplier = 1 + ((skills?.saving_mind || 0) * 0.20);
    const levelScale = 1 + (playerLevel - 1) * 0.15;

    return {
      exp: Math.round(activity.expPerSec * levelScale * expMultiplier * 10) / 10,
      gold: Math.round(activity.goldPerSec * levelScale * goldMultiplier * 10) / 10
    };
  }
}
