// 정진우 키우기 게임 상태 관리자 (State Manager)

import { StorageEngine, DEFAULT_STATE } from './engine/storage.js';
import { getItemById } from './data/items.js';
import { QUESTS } from './data/quests.js';
import { SKILLS } from './data/skills.js';
import { sound } from './engine/sound.js';
import { IdleEngine } from './engine/idle.js';

export class GameState {
  constructor() {
    this.data = StorageEngine.load();
    this.listeners = new Set();

    // 임시 캐시된 계산 스탯
    this.computed = {
      maxHp: 100,
      atk: 10,
      def: 5,
      critRate: 5,
      dodgeRate: 3
    };

    // 실시간 방치 누적 타이머
    this.idleAccumExp = 0;
    this.idleAccumGold = 0;

    this.normalizeSaveData();
    this.recomputeStats();
  }

  // 기존 세이브 데이터 밸런스 정규화 (레벨, 아이템, 골드는 보존하며 스탯을 신규 밸런스 규격에 맞게 조정)
  normalizeSaveData() {
    const lvl = Math.max(1, this.data.level || 1);
    const totalTrain = this.data.statsAccum?.totalTrain || 0;
    const totalStudy = this.data.statsAccum?.totalStudy || 0;

    const expectedBaseHp = 70 + (lvl - 1) * 12;
    const maxStr = 8 + (lvl * 1) + Math.min(25, Math.floor(totalTrain * 0.35));
    const maxInt = 8 + (lvl * 1) + Math.min(25, Math.floor(totalStudy * 0.35));
    const maxAgi = 8 + (lvl * 1);

    if (this.data.baseStats.str > maxStr) {
      this.data.baseStats.str = maxStr;
    }
    if (this.data.baseStats.int > maxInt) {
      this.data.baseStats.int = maxInt;
    }
    if (this.data.baseStats.agi > maxAgi) {
      this.data.baseStats.agi = maxAgi;
    }
    this.data.baseStats.baseMaxHp = expectedBaseHp;
  }

  // 리스너 등록
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(event, payload = null) {
    this.recomputeStats();
    this.listeners.forEach(fn => fn(event, payload));
  }

  // 능력치 재계산 (장비, 패시브 스킬 모두 반영 - 밸런스 공식)
  recomputeStats() {
    const b = this.data.baseStats;
    const skills = this.data.skills;

    const wp = this.getEquippedItem('weapon');
    const ar = this.getEquippedItem('armor');
    const ac = this.getEquippedItem('accessory');

    // 보너스 집계
    let bonusHp = (ar?.stats?.hp || 0) + (ac?.stats?.hp || 0);
    let bonusStr = (wp?.stats?.str || 0) + (ar?.stats?.str || 0) + (ac?.stats?.str || 0);
    let bonusInt = (wp?.stats?.int || 0) + (ar?.stats?.int || 0) + (ac?.stats?.int || 0);
    let bonusAgi = (wp?.stats?.agi || 0) + (ar?.stats?.agi || 0) + (ac?.stats?.agi || 0);
    let bonusAtk = (wp?.stats?.atk || 0) + (ac?.stats?.atk || 0);
    let bonusDef = (ar?.stats?.def || 0) + (ac?.stats?.def || 0);
    let bonusCrit = (wp?.stats?.crit || 0) + (ac?.stats?.crit || 0);
    let bonusDodge = (ac?.stats?.dodge || 0);

    // 스킬 보너스 (조정된 배율)
    const ironWallLvl = skills.iron_wall || 0;
    bonusHp += ironWallLvl * 15;
    bonusDef += ironWallLvl * 3;

    const galeLvl = skills.gale_agility || 0;
    bonusCrit += Math.floor(galeLvl * 2);
    bonusDodge += Math.floor(galeLvl * 1.5);

    // 최종 스탯
    const totalStr = b.str + bonusStr;
    const totalInt = b.int + bonusInt;
    const totalAgi = b.agi + bonusAgi;

    // 공격력 및 방어력 균형 공식: 초반 폭발 방지 및 점진적 성장
    const maxHp = b.baseMaxHp + Math.floor(totalStr * 2.5) + bonusHp;
    const atk = 7 + Math.floor(totalStr * 0.85) + Math.floor(totalAgi * 0.25) + bonusAtk;
    const def = 2 + Math.floor(totalStr * 0.3) + Math.floor(totalAgi * 0.2) + bonusDef;
    const critRate = Math.min(45, 5 + Math.floor(totalAgi * 0.35) + bonusCrit);
    const dodgeRate = Math.min(25, 3 + Math.floor(totalAgi * 0.25) + bonusDodge);

    // 체력 상한선 클램핑
    if (b.hp > maxHp) {
      b.hp = maxHp;
    }

    this.computed = {
      maxHp,
      atk,
      def,
      critRate,
      dodgeRate,
      totalStr,
      totalInt,
      totalAgi
    };
  }

  getEquippedItem(slot) {
    const id = this.data.equipped[slot];
    return id ? getItemById(id) : null;
  }

  // --- 레벨 및 경험치 시스템 ---
  getRequiredExp(level) {
    return Math.floor(55 * Math.pow(1.32, level - 1));
  }

  addExp(amount) {
    if (amount <= 0) return false;

    // 집중 훈련 스킬 효과 적용
    const focusLvl = this.data.skills.focus_training || 0;
    const multiplier = 1 + (focusLvl * 0.15);
    const finalExp = Math.round(amount * multiplier);

    this.data.exp += finalExp;
    let leveledUp = false;

    while (this.data.exp >= this.data.maxExp) {
      this.data.exp -= this.data.maxExp;
      this.data.level++;
      this.data.maxExp = this.getRequiredExp(this.data.level);

      // 레벨업 스탯 보너스 (안정적이고 점진적인 성장)
      this.data.baseStats.str += 1;
      this.data.baseStats.int += 1;
      this.data.baseStats.agi += 1;
      this.data.baseStats.baseMaxHp += 12;
      this.data.sp += 1;

      // HP 전액 회복
      this.recomputeStats();
      this.data.baseStats.hp = this.computed.maxHp;

      leveledUp = true;
      this.checkQuestProgress('reach_level', this.data.level);
    }

    this.notify('exp_gain', { exp: finalExp, leveledUp });
    return { finalExp, leveledUp };
  }

  addGold(amount) {
    if (amount <= 0) return 0;
    // 절약 정신 스킬 효과
    const saveLvl = this.data.skills.saving_mind || 0;
    const mult = 1 + (saveLvl * 0.20);
    const finalGold = Math.round(amount * mult);

    this.data.gold += finalGold;
    this.data.statsAccum.totalGoldEarned += finalGold;

    this.checkQuestProgress('gold_accum', this.data.gold);
    this.notify('gold_gain', { gold: finalGold });
    return finalGold;
  }

  // --- 기본 행동 (클릭형 액션) ---

  // 1. 근력 훈련
  trainStrength() {
    if (this.data.baseStats.hp <= 5) {
      sound.playError();
      return { success: false, reason: '체력이 부족합니다. 휴식하거나 물약을 섭취하세요! (최소 6 HP 필요)' };
    }

    this.data.baseStats.hp -= 5;
    this.data.statsAccum.totalTrain++;

    // 레벨에 따른 훈련 스탯 상한 (초반 폭주 방지 및 레벨업 연계 성장)
    const maxTrainStr = 8 + (this.data.level * 2);
    let gainedStr = 0;
    if (this.data.baseStats.str < maxTrainStr) {
      this.data.baseStats.str += 1;
      gainedStr = 1;
    }

    const baseExp = 12 + Math.floor(this.data.level * 2.5);
    const { finalExp, leveledUp } = this.addExp(baseExp);

    this.checkQuestProgress('train', this.data.statsAccum.totalTrain);
    sound.playTrain();
    this.notify('action_train', { str: gainedStr, exp: finalExp, leveledUp });

    return { success: true, str: gainedStr, exp: finalExp, leveledUp };
  }

  // 2. 공부하기
  study() {
    if (this.data.baseStats.hp <= 5) {
      sound.playError();
      return { success: false, reason: '체력이 부족합니다. 휴식을 취하세요! (최소 6 HP 필요)' };
    }

    this.data.baseStats.hp -= 5;
    this.data.statsAccum.totalStudy++;

    const maxStudyInt = 8 + (this.data.level * 2);
    let gainedInt = 0;
    if (this.data.baseStats.int < maxStudyInt) {
      this.data.baseStats.int += 1;
      gainedInt = 1;
    }

    const baseExp = 12 + Math.floor(this.data.level * 2.5);
    const { finalExp, leveledUp } = this.addExp(baseExp);

    this.checkQuestProgress('study', this.data.statsAccum.totalStudy);
    sound.playStudy();
    this.notify('action_study', { int: gainedInt, exp: finalExp, leveledUp });

    return { success: true, int: gainedInt, exp: finalExp, leveledUp };
  }

  // 3. 휴식하기
  rest() {
    if (this.data.baseStats.hp >= this.computed.maxHp) {
      sound.playError();
      return { success: false, reason: '이미 체력이 최상 상태입니다!' };
    }

    const quickLvl = this.data.skills.quick_recovery || 0;
    const bonusMult = 1 + (quickLvl * 0.3);

    // 기본 최대 HP의 30% + 20 회복
    const baseHeal = (this.computed.maxHp * 0.3) + 20;
    const finalHeal = Math.round(baseHeal * bonusMult);

    const prevHp = this.data.baseStats.hp;
    this.data.baseStats.hp = Math.min(this.computed.maxHp, this.data.baseStats.hp + finalHeal);
    const actualHeal = this.data.baseStats.hp - prevHp;

    sound.playHeal();
    this.notify('action_rest', { heal: actualHeal });

    return { success: true, heal: actualHeal };
  }

  // 4. 탐험하기
  explore() {
    if (this.data.baseStats.hp <= 10) {
      sound.playError();
      return { success: false, reason: '탐험을 떠나기에는 체력이 너무 적습니다! (최소 11 HP 필요)' };
    }

    this.data.baseStats.hp -= 10;

    // 이벤트 추첨 테이블
    const roll = Math.random();
    let result = {};

    if (roll < 0.35) {
      // 골드 발견
      const goldFound = Math.floor(30 + Math.random() * 60 + this.data.level * 15);
      const earned = this.addGold(goldFound);
      result = { type: 'gold', message: `반짝이는 보물 상자를 발견하여 ${earned} 골드를 획득했습니다!`, value: earned };
      sound.playItemGet();
    } else if (roll < 0.65) {
      // 신비한 무술 비석 (경험치)
      const expFound = Math.floor(40 + Math.random() * 50 + this.data.level * 20);
      const { finalExp, leveledUp } = this.addExp(expFound);
      result = { type: 'exp', message: `고대 수련 비석의 오의를 깨달아 ${finalExp} 경험치를 얻었습니다!`, value: finalExp, leveledUp };
      sound.playStudy();
    } else if (roll < 0.82) {
      // 약초/물약 발견
      this.addItemToInventory('cs_potion_small', 1);
      result = { type: 'item', message: `풀숲에서 신선한 초급 HP 물약 1개를 발견했습니다!`, item: 'cs_potion_small' };
      sound.playItemGet();
    } else if (roll < 0.93) {
      // 치유의 성수 샘물
      this.data.baseStats.hp = this.computed.maxHp;
      result = { type: 'heal', message: `요정의 치유 샘물을 마시고 체력을 100% 전부 회복했습니다!` };
      sound.playHeal();
    } else {
      // 민첩성/체력 단련
      this.data.baseStats.agi += 1;
      result = { type: 'stat', message: `험준한 지형을 극복하며 민첩성이 영구히 +1 상승했습니다!` };
      sound.playTrain();
    }

    this.notify('action_explore', result);
    return { success: true, ...result };
  }

  // --- 장비 & 인벤토리 시스템 ---
  addItemToInventory(itemId, count = 1) {
    const item = getItemById(itemId);
    if (!item) return false;

    // 소비품은 수량 중첩, 장비는 개별 보관
    if (item.type === 'consumable') {
      const existing = this.data.inventory.find(i => i.itemId === itemId);
      if (existing) {
        existing.count += count;
      } else {
        this.data.inventory.push({ itemId, count, uid: Date.now() + Math.random() });
      }
    } else {
      for (let i = 0; i < count; i++) {
        this.data.inventory.push({ itemId, count: 1, uid: Date.now() + Math.random() + i });
      }
    }

    this.notify('inventory_change');
    return true;
  }

  removeItemFromInventory(uidOrId, count = 1) {
    const idx = this.data.inventory.findIndex(i => i.uid === uidOrId || i.itemId === uidOrId);
    if (idx === -1) return false;

    const slot = this.data.inventory[idx];
    if (slot.count > count) {
      slot.count -= count;
    } else {
      this.data.inventory.splice(idx, 1);
    }

    this.notify('inventory_change');
    return true;
  }

  equipItem(inventorySlotUid) {
    const slotIdx = this.data.inventory.findIndex(i => i.uid === inventorySlotUid);
    if (slotIdx === -1) return false;

    const targetItem = getItemById(this.data.inventory[slotIdx].itemId);
    if (!targetItem || targetItem.type === 'consumable') return false;

    const equipSlot = targetItem.type; // 'weapon', 'armor', 'accessory'

    // 기존 장착 아이템 해제 후 인벤토리로 이동
    const prevEquippedId = this.data.equipped[equipSlot];
    if (prevEquippedId) {
      this.data.inventory.push({ itemId: prevEquippedId, count: 1, uid: Date.now() + Math.random() });
    }

    // 새 아이템 장착 및 인벤토리에서 제거
    this.data.equipped[equipSlot] = targetItem.id;
    this.data.inventory.splice(slotIdx, 1);

    sound.playClick();
    this.notify('equip_change');
    return true;
  }

  unequipItem(equipSlot) {
    const equippedId = this.data.equipped[equipSlot];
    if (!equippedId) return false;

    // 인벤토리로 되돌리기
    this.data.inventory.push({ itemId: equippedId, count: 1, uid: Date.now() + Math.random() });
    this.data.equipped[equipSlot] = null;

    sound.playClick();
    this.notify('equip_change');
    return true;
  }

  useConsumable(inventorySlotUid) {
    const slotIdx = this.data.inventory.findIndex(i => i.uid === inventorySlotUid);
    if (slotIdx === -1) return { success: false, reason: '아이템을 찾을 수 없습니다.' };

    const item = getItemById(this.data.inventory[slotIdx].itemId);
    if (!item || item.type !== 'consumable') return { success: false, reason: '소비할 수 없는 아이템입니다.' };

    if (item.effect?.heal || item.effect?.healPercent) {
      if (this.data.baseStats.hp >= this.computed.maxHp) {
        sound.playError();
        return { success: false, reason: '체력이 이미 가득 차 있습니다.' };
      }

      let heal = 0;
      if (item.effect.healPercent) {
        heal = this.computed.maxHp;
      } else {
        heal = item.effect.heal;
      }

      const prev = this.data.baseStats.hp;
      this.data.baseStats.hp = Math.min(this.computed.maxHp, this.data.baseStats.hp + heal);
      const actual = this.data.baseStats.hp - prev;

      this.removeItemFromInventory(inventorySlotUid, 1);
      sound.playHeal();
      this.notify('item_used', { heal: actual });
      return { success: true, message: `체력을 ${actual} 회복했습니다.` };
    }

    if (item.effect?.exp) {
      this.data.baseStats.str += item.effect.str || 0;
      this.data.baseStats.int += item.effect.int || 0;
      this.addExp(item.effect.exp);
      this.removeItemFromInventory(inventorySlotUid, 1);
      sound.playLevelUp();
      this.notify('item_used');
      return { success: true, message: `비급서를 정독하여 영구 스탯과 경험치를 대량 획득했습니다!` };
    }

    return { success: false, reason: '효과를 적용할 수 없습니다.' };
  }

  // --- 상점 시스템 ---
  buyItem(itemId) {
    const item = getItemById(itemId);
    if (!item) return { success: false, reason: '존재하지 않는 아이템입니다.' };

    if (this.data.gold < item.price) {
      sound.playError();
      return { success: false, reason: `골드가 부족합니다! (필요: ${item.price}G, 보유: ${this.data.gold}G)` };
    }

    this.data.gold -= item.price;
    this.data.statsAccum.totalItemsBought++;
    this.addItemToInventory(itemId, 1);

    this.checkQuestProgress('buy_gear', this.data.statsAccum.totalItemsBought);
    sound.playBuy();
    this.notify('shop_purchase', { item });

    return { success: true, message: `${item.name}을(를) 성공적으로 구매했습니다!` };
  }

  sellItem(inventorySlotUid) {
    const slotIdx = this.data.inventory.findIndex(i => i.uid === inventorySlotUid);
    if (slotIdx === -1) return false;

    const item = getItemById(this.data.inventory[slotIdx].itemId);
    if (!item) return false;

    const price = item.sellPrice || Math.floor(item.price * 0.5);
    this.addGold(price);
    this.removeItemFromInventory(inventorySlotUid, 1);

    sound.playBuy();
    this.notify('shop_sell', { gold: price });
    return true;
  }

  // --- 스킬 시스템 ---
  upgradeSkill(skillId) {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill) return { success: false, reason: '존재하지 않는 스킬입니다.' };

    const currentLvl = this.data.skills[skillId] || 0;
    if (currentLvl >= skill.maxLevel) {
      sound.playError();
      return { success: false, reason: '이미 최고 레벨에 도달한 스킬입니다.' };
    }

    if (this.data.level < skill.unlockLevel) {
      sound.playError();
      return { success: false, reason: `레벨 ${skill.unlockLevel} 이상에서 해금 가능합니다.` };
    }

    if (this.data.sp < skill.costPerLevel) {
      sound.playError();
      return { success: false, reason: `스킬 포인트(SP)가 부족합니다! (필요: ${skill.costPerLevel} SP)` };
    }

    this.data.sp -= skill.costPerLevel;
    this.data.skills[skillId] = currentLvl + 1;

    sound.playLevelUp();
    this.notify('skill_upgrade', { skillId, newLevel: currentLvl + 1 });
    return { success: true, newLevel: currentLvl + 1 };
  }

  // --- 퀘스트 시스템 ---
  checkQuestProgress(category, value) {
    for (const q of QUESTS) {
      if (q.category === category) {
        if (!this.data.quests[q.id]) {
          this.data.quests[q.id] = { progress: 0, claimed: false };
        }
        const qData = this.data.quests[q.id];
        if (!qData.claimed) {
          if (category === 'reach_level' || category === 'gold_accum') {
            qData.progress = Math.max(qData.progress, value);
          } else {
            qData.progress = value;
          }
        }
      }
    }
  }

  claimQuestReward(questId) {
    const q = QUESTS.find(item => item.id === questId);
    if (!q) return { success: false, reason: '존재하지 않는 퀘스트입니다.' };

    const qData = this.data.quests[questId];
    if (!qData) return { success: false, reason: '진행 정보가 없습니다.' };

    if (qData.claimed) {
      sound.playError();
      return { success: false, reason: '이미 보상을 수령한 퀘스트입니다.' };
    }

    if (qData.progress < q.target) {
      sound.playError();
      return { success: false, reason: '아직 퀘스트 목표를 달성하지 못했습니다.' };
    }

    // 보상 수령
    qData.claimed = true;
    if (q.reward.gold) this.addGold(q.reward.gold);
    if (q.reward.exp) this.addExp(q.reward.exp);
    if (q.reward.sp) this.data.sp += q.reward.sp;
    if (q.reward.itemId) this.addItemToInventory(q.reward.itemId, 1);

    sound.playQuestComplete();
    this.notify('quest_claimed', { questId });
    return { success: true, reward: q.reward };
  }

  // --- 실시간 틱 & 방치 루프 ---
  processOnlineTick() {
    // 1. 방치 보상 실시간 누적 (1초)
    const tick = IdleEngine.calculateOnlineTick(this.data.idleActivity, this.data.level, this.data.skills);
    if (tick.exp > 0) {
      this.idleAccumExp += tick.exp;
      if (this.idleAccumExp >= 1) {
        const wholeExp = Math.floor(this.idleAccumExp);
        this.idleAccumExp -= wholeExp;
        this.addExp(wholeExp);
      }
    }
    if (tick.gold > 0) {
      this.idleAccumGold += tick.gold;
      if (this.idleAccumGold >= 1) {
        const wholeGold = Math.floor(this.idleAccumGold);
        this.idleAccumGold -= wholeGold;
        this.addGold(wholeGold);
      }
    }

    // 2. 빠른 회복 패시브 체력 재생
    const quickLvl = this.data.skills.quick_recovery || 0;
    if (quickLvl > 0 && this.data.baseStats.hp < this.computed.maxHp) {
      this.data.baseStats.hp = Math.min(this.computed.maxHp, this.data.baseStats.hp + (quickLvl * 1));
      this.notify('auto_regen');
    }
  }

  // --- 전투 승리/패배 처리 ---
  handleBattleVictory(reward) {
    if (!reward) return;

    this.addGold(reward.gold);
    this.addExp(reward.exp);

    this.data.statsAccum.totalKills++;
    this.checkQuestProgress('monster_kill', this.data.statsAccum.totalKills);

    if (reward.isBoss) {
      this.data.statsAccum.totalBossKills++;
    }

    if (reward.monsterId === 'forest_ent') {
      this.checkQuestProgress('kill_ent', 1);
    } else if (reward.monsterId === 'cave_troll') {
      this.checkQuestProgress('kill_troll', 1);
    } else if (reward.monsterId === 'dungeon_boss') {
      this.checkQuestProgress('kill_boss', 1);
    } else if (reward.monsterId === 'ancient_dragon') {
      this.checkQuestProgress('kill_dragon', 1);
    } else if (reward.monsterId === 'lich_king') {
      this.checkQuestProgress('kill_lich', 1);
    } else if (reward.monsterId === 'chaos_overlord') {
      this.checkQuestProgress('kill_chaos', 1);
    }

    // 드롭 아이템 지급
    if (reward.droppedItems && reward.droppedItems.length > 0) {
      reward.droppedItems.forEach(id => this.addItemToInventory(id, 1));
    }

    sound.playMonsterDefeat();
    this.notify('battle_victory', reward);
  }

  handleBattleDefeat() {
    // 체력을 25%로 회복시켜 마을로 귀환
    this.data.baseStats.hp = Math.max(20, Math.floor(this.computed.maxHp * 0.25));
    this.data.currentLocationId = 'village';
    sound.playError();
    this.notify('battle_defeat');
  }

  save() {
    return StorageEngine.save(this.data);
  }

  resetGame() {
    StorageEngine.reset();
    this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.recomputeStats();
    this.notify('reset');
  }
}

export const gameState = new GameState();
