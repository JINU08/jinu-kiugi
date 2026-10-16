// 턴제 전투 엔진 (Turn-Based Battle Engine) - 전략 방어, 방어막(Shield), 상태이상(Debuff), 반격, 광폭화 지원

export class BattleEngine {
  constructor(monsterBlueprint, playerCombatant, callbacks) {
    this.monster = JSON.parse(JSON.stringify(monsterBlueprint));
    this.player = playerCombatant;
    this.callbacks = callbacks || {}; // onLog, onStateChange, onEnd, onFloatText, onPlayerAnim, onMonsterAnim, onPotionUsed

    // 몬스터 방어막 초기화
    if (this.monster.shield === undefined) {
      this.monster.shield = 0;
    }
    if (this.monster.maxShield === undefined) {
      this.monster.maxShield = this.monster.shield;
    }

    this.isPlayerTurn = true;
    this.isActionLocked = false;
    this.isOver = false;
    this.result = null; // 'victory' | 'defeat' | 'flee'

    this.turnCount = 1;
    this.isGuarding = false;
    this.isFrenzyEnraged = false;
    this.logs = [];

    this.playerLevel = this.player.level || 1;
    this.monsterLevel = this.monster.level || 1;

    // 플레이어 상태이상 및 버프
    this.playerDebuffs = []; // { type: 'burn'|'poison'|'freeze'|'curse', duration: 3, name: '화상' }
    this.playerBuffs = [];   // { type: 'iron_will', duration: 2, defBoost: 25, name: '불굴의 의지' }

    this.addLog(`⚔️ [${this.monster.title}] ${this.monster.name}이(가) 나타났습니다!`, 'system');

    const levelDiff = this.monsterLevel - this.playerLevel;
    if (levelDiff >= 3) {
      this.addLog(`⚠️ [위험 경고] 몬스터(Lv.${this.monsterLevel})가 정진우(Lv.${this.playerLevel})보다 레벨이 높아 받는 피해가 가중되고 주는 피해가 감소합니다!`, 'warning');
    }

    if (this.monster.shield > 0) {
      this.addLog(`🛡️ [방어막 감지] ${this.monster.name}이(가) ${this.monster.shield}의 결계를 두르고 있습니다! 스킬 공격은 방어막에 추가 피해를 입힙니다.`, 'warning');
    }

    if (this.monster.specialMove) {
      this.addLog(`💡 보스 기믹: ${this.monster.specialMove.triggerTurn}턴마다 강력한 특수기를 사용합니다. [방어 태세]로 피해를 경감하세요!`, 'warning');
    }

    if (this.monster.debuffOnHit) {
      this.addLog(`⚠️ 상태이상 경고: 몬스터의 공격에 [${this.monster.debuffOnHit.name}]이(가) 부여될 수 있습니다! [방어 태세]로 막거나 [정화]로 치료하세요!`, 'warning');
    }
  }

  addLog(message, type = 'normal') {
    const logItem = { message, type, time: Date.now() };
    this.logs.push(logItem);
    if (this.callbacks.onLog) {
      this.callbacks.onLog(logItem);
    }
  }

  // 플레이어 유효 방어력 (버프/디버프 반영)
  getPlayerEffectiveDef() {
    let def = this.player.def;
    const hasBurn = this.playerDebuffs.some(d => d.type === 'burn');
    if (hasBurn) def = Math.round(def * 0.7); // 화상 시 방어력 30% 감소

    const willBuff = this.playerBuffs.find(b => b.type === 'iron_will');
    if (willBuff) def = Math.round(def * 1.25); // 불굴의 의지 시 방어력 25% 상승

    return Math.max(1, def);
  }

  // 몬스터 데미지 및 방어막 적용 헬퍼
  applyDamageToMonster(damage, isSkill = false) {
    // 1. 몬스터 반격 자세 검사 (일반 공격 시 반사 피해)
    if (this.monster.isCounterStanceActive && !isSkill) {
      const recoil = Math.max(15, Math.round(damage * 0.4));
      if (!this.isGuarding) {
        this.player.hp = Math.max(0, this.player.hp - recoil);
        this.addLog(`⚠️ [신성 반격!] 몬스터의 가시 결계가 공격을 반사하여 정진우가 ${recoil}의 반사 피해를 입었습니다!`, 'warning');
        if (this.callbacks.onFloatText) {
          this.callbacks.onFloatText(`반사! -${recoil}`, 95, 65, '#f59e0b', 12);
        }
      }
    }

    // 2. 방어막 흡수 계산
    if (this.monster.shield > 0) {
      // 스킬 공격은 방어막에 50% 추가 파쇄 피해
      const shieldEffectiveDmg = isSkill ? Math.round(damage * 1.5) : damage;
      if (this.monster.shield >= shieldEffectiveDmg) {
        this.monster.shield -= shieldEffectiveDmg;
        this.addLog(`🛡️ 몬스터의 방어막이 공격을 흡수했습니다! (남은 실드: ${this.monster.shield})`, 'system');
        if (this.callbacks.onFloatText) {
          this.callbacks.onFloatText(`SHIELD -${shieldEffectiveDmg}`, 250, 60, '#38bdf8', 13);
        }
        return;
      } else {
        const remainingShield = this.monster.shield;
        this.monster.shield = 0;
        const breakthroughDmg = Math.max(1, damage - remainingShield);
        this.monster.hp = Math.max(0, this.monster.hp - breakthroughDmg);
        this.addLog(`💥 [방어막 분쇄!] 몬스터의 방어막이 파괴되고 ${breakthroughDmg}의 관통 피해를 입혔습니다!`, 'crit');
        if (this.callbacks.onFloatText) {
          this.callbacks.onFloatText(`BARRIER BREAK! -${breakthroughDmg}`, 250, 60, '#fde047', 14, true);
        }
        return;
      }
    }

    // 3. 순수 본체 체력 피해
    this.monster.hp = Math.max(0, this.monster.hp - damage);
  }

  // 1. 플레이어 일반 공격
  executePlayerAttack() {
    if (!this.canAct()) return;
    this.isGuarding = false;
    this.isActionLocked = true;

    if (this.callbacks.onPlayerAnim) {
      this.callbacks.onPlayerAnim('attack');
    }

    setTimeout(() => {
      // 명중 및 회피 계산
      const evadeChance = (this.monster.sprite === 'bat' || this.monster.sprite === 'frost_wolf') ? 0.15 : 0.05;
      const isEvaded = Math.random() < evadeChance;

      if (isEvaded) {
        this.addLog(`💨 ${this.monster.name}이(가) 정진우의 공격을 날렵하게 회피했습니다!`, 'miss');
        if (this.callbacks.onFloatText) {
          this.callbacks.onFloatText('MISS', 250, 70, '#94a3b8');
        }
      } else {
        // 치명타 판정
        const critRoll = Math.random() * 100;
        const isCrit = critRoll < this.player.critRate;

        // 레벨 차이에 따른 보정 (고레벨 몬스터에게는 위축, 저레벨에게는 약간의 우위)
        const levelDiff = this.monsterLevel - this.playerLevel;
        let levelMod = 1.0;
        if (levelDiff > 0) {
          levelMod = Math.max(0.65, 1.0 - (levelDiff * 0.04));
        } else if (levelDiff < 0) {
          levelMod = Math.min(1.25, 1.0 + (Math.abs(levelDiff) * 0.02));
        }

        // 점근적 방어력 감소 공식: ATK * (50 / (DEF + 50))
        const variance = 0.92 + Math.random() * 0.16;
        const defReduction = 50 / (this.monster.def + 50);
        let baseDmg = (this.player.atk * defReduction * variance * levelMod);
        if (isCrit) {
          baseDmg *= 1.5;
        }
        const damage = Math.max(3, Math.round(baseDmg));

        this.applyDamageToMonster(damage, false);

        if (this.callbacks.onMonsterAnim) {
          this.callbacks.onMonsterAnim('hurt');
        }
        if (this.callbacks.onFloatText && this.monster.shield <= 0) {
          this.callbacks.onFloatText(
            `${isCrit ? 'CRITICAL! ' : ''}-${damage}`,
            250,
            70,
            isCrit ? '#f59e0b' : '#ef4444',
            isCrit ? 14 : 11,
            isCrit
          );
        }

        this.addLog(
          `⚔️ 정진우의 ${isCrit ? '치명적인 강타' : '일반 공격'}! ${this.monster.name}에게 ${damage}의 피해를 입혔습니다!`,
          isCrit ? 'crit' : 'player'
        );
      }

      this.checkBattleStatus();

      if (!this.isOver) {
        this.isPlayerTurn = false;
        setTimeout(() => this.executeMonsterTurn(), 700);
      }
    }, 350);
  }

  // 2. 플레이어 스킬 공격 (강력한 일격 - 방어막 관통 +50% 보너스)
  executePlayerSkill(skillMultiplier = 1.8) {
    if (!this.canAct()) return;
    this.isGuarding = false;
    this.isActionLocked = true;

    if (this.callbacks.onPlayerAnim) {
      this.callbacks.onPlayerAnim('attack');
    }

    setTimeout(() => {
      const critRoll = Math.random() * 100;
      const isCrit = critRoll < (this.player.critRate + 10);

      const levelDiff = this.monsterLevel - this.playerLevel;
      let levelMod = 1.0;
      if (levelDiff > 0) {
        levelMod = Math.max(0.70, 1.0 - (levelDiff * 0.03));
      } else if (levelDiff < 0) {
        levelMod = Math.min(1.20, 1.0 + (Math.abs(levelDiff) * 0.02));
      }

      // 스킬 공격은 방어력을 20% 관통하여 계산
      const variance = 0.95 + Math.random() * 0.12;
      const effectiveMonsterDef = this.monster.def * 0.8;
      const defReduction = 50 / (effectiveMonsterDef + 50);
      let rawDmg = (this.player.atk * skillMultiplier * defReduction * variance * levelMod);
      if (isCrit) {
        rawDmg *= 1.45;
      }
      const damage = Math.max(6, Math.round(rawDmg));

      this.applyDamageToMonster(damage, true);

      if (this.callbacks.onMonsterAnim) {
        this.callbacks.onMonsterAnim('hurt');
      }
      if (this.callbacks.onFloatText && this.monster.shield <= 0) {
        this.callbacks.onFloatText(
          `💥 [강력한 일격] -${damage}`,
          250,
          65,
          '#fbbf24',
          14,
          true
        );
      }

      this.addLog(
        `💥 정진우의 [강력한 일격]! 대기를 가르며 ${this.monster.name}에게 ${damage}의 폭발적인 피해를 입혔습니다!`,
        'crit'
      );

      this.checkBattleStatus();

      if (!this.isOver) {
        this.isPlayerTurn = false;
        setTimeout(() => this.executeMonsterTurn(), 700);
      }
    }, 350);
  }

  // 3. 플레이어 방어 태세 (Guard - 피해 65% 경감 + 상태이상 원천 차단)
  executePlayerGuard() {
    if (!this.canAct()) return;
    this.isGuarding = true;
    this.isActionLocked = true;

    this.addLog('🛡️ 정진우가 방패를 굳건히 들고 [방어 태세]를 취했습니다! (받는 피해 65% 감소 및 상태이상 완벽 방어)', 'system');
    if (this.callbacks.onFloatText) {
      this.callbacks.onFloatText('🛡️ GUARD ON', 95, 70, '#38bdf8', 12);
    }

    setTimeout(() => {
      this.isPlayerTurn = false;
      this.executeMonsterTurn();
    }, 500);
  }

  // 4. 플레이어 정화와 각성 (Purify & Willpower)
  executePlayerPurify() {
    if (!this.canAct()) return;
    this.isGuarding = false;
    this.isActionLocked = true;

    const hadDebuffs = this.playerDebuffs.length > 0;
    this.playerDebuffs = []; // 모든 디버프 제거

    // 불굴의 의지 버프 부여 (2턴간 방어력 +25%, 매턴 HP 25 재생)
    this.playerBuffs = [{ type: 'iron_will', duration: 2, defBoost: 25, name: '불굴의 의지' }];

    this.addLog('✨ [정화와 의지!] 모든 상태이상을 말끔히 해제하고 2턴간 [불굴의 의지] (방어력 +25%, 지속 재생)를 얻었습니다!', 'heal');
    if (this.callbacks.onFloatText) {
      this.callbacks.onFloatText(hadDebuffs ? '✨ PURIFIED!' : '✨ WILLPOWER!', 95, 70, '#a855f7', 13, true);
    }

    setTimeout(() => {
      this.isPlayerTurn = false;
      this.executeMonsterTurn();
    }, 500);
  }

  // 5. 플레이어 물약 사용 (저주 시 회복량 60% 감소)
  executeUsePotion(potionItem) {
    if (!this.canAct()) return;
    if (this.player.hp >= this.player.maxHp) {
      this.addLog('⚠️ 이미 체력이 가득 차 있어 물약을 사용할 수 없습니다.', 'warning');
      return;
    }

    this.isGuarding = false;
    this.isActionLocked = true;

    let healAmount = 0;
    if (potionItem.effect?.healPercent) {
      healAmount = this.player.maxHp;
    } else {
      healAmount = potionItem.effect?.heal || 50;
    }

    // 저주 디버프 확인
    const isCursed = this.playerDebuffs.some(d => d.type === 'curse');
    if (isCursed) {
      healAmount = Math.max(10, Math.round(healAmount * 0.4));
      this.addLog('🔮 [저주의 굴레] 암흑 저주로 인해 물약의 치유 효능이 60% 급감했습니다!', 'warning');
    }

    const actualHeal = Math.min(healAmount, this.player.maxHp - this.player.hp);
    this.player.hp += actualHeal;

    if (this.callbacks.onFloatText) {
      this.callbacks.onFloatText(`+${actualHeal} HP`, 95, 70, '#22c55e', 12);
    }
    this.addLog(`🧪 [${potionItem.name}] 사용! 체력을 ${actualHeal} 회복했습니다. (현재 HP: ${this.player.hp}/${this.player.maxHp})`, 'heal');

    if (this.callbacks.onPotionUsed) {
      this.callbacks.onPotionUsed(potionItem.id);
    }

    this.isPlayerTurn = false;
    setTimeout(() => this.executeMonsterTurn(), 600);
  }

  // 6. 도망가기
  executeFlee() {
    if (!this.canAct()) return;
    this.isActionLocked = true;

    // 보스는 도망 확률 25%, 일반 몬스터는 80%
    const fleeChance = this.monster.isBoss ? 0.25 : 0.8;
    const isSuccess = Math.random() < fleeChance;

    if (isSuccess) {
      this.isOver = true;
      this.result = 'flee';
      this.addLog('🏃 전광석화처럼 전장을 빠져나와 안전한 곳으로 후퇴했습니다!', 'system');
      if (this.callbacks.onEnd) {
        this.callbacks.onEnd('flee', null);
      }
    } else {
      this.addLog(`❌ 도망치지 못했습니다! ${this.monster.name}이(가) 퇴로를 가로막았습니다!`, 'warning');
      this.isPlayerTurn = false;
      setTimeout(() => this.executeMonsterTurn(), 600);
    }
  }

  // --- 플레이어 턴 시작 시 지속 효과 처리 (빙결, 화상, 독, 재생) ---
  processTurnStartEffects() {
    if (this.isOver) return false;

    // 1. 불굴의 의지 재생
    const willBuff = this.playerBuffs.find(b => b.type === 'iron_will');
    if (willBuff) {
      const regen = Math.min(25, this.player.maxHp - this.player.hp);
      if (regen > 0) {
        this.player.hp += regen;
        this.addLog(`✨ [불굴의 의지] 생명력이 +${regen} 지속 회복되었습니다.`, 'heal');
        if (this.callbacks.onFloatText) {
          this.callbacks.onFloatText(`+${regen} HP`, 95, 60, '#22c55e', 11);
        }
      }
      willBuff.duration--;
      if (willBuff.duration <= 0) {
        this.playerBuffs = this.playerBuffs.filter(b => b.type !== 'iron_will');
      }
    }

    // 2. 화상 지속 피해
    const burn = this.playerDebuffs.find(d => d.type === 'burn');
    if (burn) {
      const burnDmg = 25;
      this.player.hp = Math.max(0, this.player.hp - burnDmg);
      this.addLog(`🔥 [화상 지속 피해] 불길에 휩싸여 ${burnDmg}의 화염 피해를 입었습니다!`, 'warning');
      if (this.callbacks.onFloatText) {
        this.callbacks.onFloatText(`🔥 -${burnDmg}`, 95, 65, '#ea580c', 12);
      }
      burn.duration--;
    }

    // 3. 빙결 상태 검사 (행동 불가 및 턴 강제 스킵)
    const freezeIdx = this.playerDebuffs.findIndex(d => d.type === 'freeze');
    if (freezeIdx !== -1) {
      const freeze = this.playerDebuffs[freezeIdx];
      this.addLog('🧊 [빙결 상태!] 전신이 꽁꽁 얼어붙어 이번 턴 아무런 행동도 할 수 없습니다!! (턴 스킵)', 'warning');
      if (this.callbacks.onFloatText) {
        this.callbacks.onFloatText('🧊 FROZEN (SKIP)', 95, 70, '#38bdf8', 13, true);
      }
      this.playerDebuffs.splice(freezeIdx, 1); // 1턴 스킵 후 해제

      // 턴 스킵하고 바로 몬스터 턴으로
      this.isPlayerTurn = false;
      this.checkBattleStatus();
      if (!this.isOver) {
        setTimeout(() => this.executeMonsterTurn(), 900);
      }
      return false; // 행동 불가
    }

    // 만료된 디버프 정리
    this.playerDebuffs = this.playerDebuffs.filter(d => d.duration > 0);
    this.checkBattleStatus();
    return true; // 정상 행동 가능
  }

  // --- 몬스터 턴 실행 (광폭화, 2단계 각성, 특수기, 반격 자세, 흡혈) ---
  executeMonsterTurn() {
    if (this.isOver) return;

    // 1. 턴 16 보스 광란의 폭주 (Enrage Timer)
    if (this.monster.isBoss && this.turnCount >= 16 && !this.isFrenzyEnraged) {
      this.isFrenzyEnraged = true;
      this.monster.atk = Math.round(this.monster.atk * 1.8);
      this.addLog(`🔥 [광란의 폭주!] 전투가 너무 오래 지연되어 보스가 이성을 잃고 폭주합니다!! 공격력 +80%!`, 'crit');
      if (this.callbacks.onFloatText) {
        this.callbacks.onFloatText('💀 FRENZY ENRAGE!!', 250, 45, '#dc2626', 15, true);
      }
    }

    // 2. 2단계 각성 (HP 50% 이하 시 신화 보스 각성)
    if (this.monster.hasPhaseAwakening && !this.monster.isPhaseAwakened && (this.monster.hp <= this.monster.maxHp * 0.5)) {
      this.monster.isPhaseAwakened = true;
      this.monster.shield = 1500;
      this.monster.maxShield = Math.max(this.monster.maxShield, 1500);
      this.monster.atk = Math.round(this.monster.atk * 1.3);
      this.addLog(`🌌 [2단계 각성!] 카오스가 진정한 본모습을 드러내며 [1,500 혼돈 결계]를 전개하고 공격력이 폭증했습니다!!`, 'crit');
      if (this.callbacks.onFloatText) {
        this.callbacks.onFloatText('🌌 PHASE 2 AWAKENED!!', 250, 45, '#c084fc', 15, true);
      }
    }

    // 3. 몬스터 일반 광폭화 (HP 35% 미만)
    if (this.monster.hasRage && !this.monster.isRaged && (this.monster.hp <= this.monster.maxHp * 0.35)) {
      this.monster.isRaged = true;
      this.monster.atk = Math.round(this.monster.atk * 1.35);
      this.addLog(`🔥 [광폭화!] ${this.monster.name}이(가) 빈사 상태에 분노하여 공격력이 35% 폭증했습니다!`, 'crit');
      if (this.callbacks.onFloatText) {
        this.callbacks.onFloatText('🔥 BERSERK!!', 250, 50, '#ef4444', 14, true);
      }
    }

    // 4. 반격 자세 주기적 활성화
    if (this.monster.hasCounterStance && (this.turnCount % 4 === 0)) {
      this.monster.isCounterStanceActive = true;
      this.addLog(`🛡️ [반격 결계 준비] 파수병이 가시 방벽 자세를 취했습니다! (다음 플레이어 공격 시 반사 피해)`, 'warning');
    } else {
      this.monster.isCounterStanceActive = false;
    }

    if (this.callbacks.onMonsterAnim) {
      this.callbacks.onMonsterAnim('attack');
    }

    setTimeout(() => {
      // 5. 특수기 발동 여부 검사
      const isSpecialTurn = this.monster.specialMove && (this.turnCount % this.monster.specialMove.triggerTurn === 0);
      let attackMultiplier = 1.0;

      if (isSpecialTurn) {
        attackMultiplier = this.monster.specialMove.multiplier || 1.8;
        this.addLog(`⚡ [특수기] ${this.monster.name}의 ${this.monster.specialMove.name}!!`, 'crit');
      }

      // 6. 플레이어 회피율 판정 (특수기는 회피 불가)
      const dodgeRoll = Math.random() * 100;
      const isDodged = !isSpecialTurn && (dodgeRoll < this.player.dodgeRate);

      if (isDodged) {
        this.addLog(`⚡ 정진우가 날렵한 몸놀림으로 ${this.monster.name}의 일격을 가볍게 피했습니다!`, 'miss');
        if (this.callbacks.onFloatText) {
          this.callbacks.onFloatText('DODGE!', 95, 70, '#38bdf8');
        }
      } else {
        // 7. 데미지 계산 (유효 방어력 및 점근적 공식 적용)
        const variance = 0.92 + Math.random() * 0.16;
        const effectiveDef = this.getPlayerEffectiveDef();
        const defReduction = 50 / (effectiveDef + 50);

        const levelDiff = this.monsterLevel - this.playerLevel;
        let levelMod = 1.0;
        if (levelDiff > 0) {
          // 몬스터가 플레이어보다 높은 레벨일 경우 위협 가산 (+5%/레벨, 최대 +50%)
          levelMod = Math.min(1.50, 1.0 + (levelDiff * 0.05));
        } else if (levelDiff < 0) {
          // 몬스터가 플레이어보다 낮은 레벨일 경우 (-3%/레벨, 최대 -30%)
          levelMod = Math.max(0.70, 1.0 - (Math.abs(levelDiff) * 0.03));
        }

        let rawDmg = (this.monster.atk * attackMultiplier * defReduction * variance * levelMod);
        rawDmg = Math.max(4, rawDmg);

        // 방어 태세 적용 시 피해 65% 경감
        if (this.isGuarding) {
          rawDmg *= 0.35;
          const damage = Math.max(1, Math.round(rawDmg));
          this.player.hp = Math.max(0, this.player.hp - damage);

          if (this.callbacks.onFloatText) {
            this.callbacks.onFloatText(`🛡️ 가드! -${damage}`, 95, 70, '#38bdf8', 12);
          }
          this.addLog(`🛡️ [가드 성공!] 방패로 공격을 막아내어 피해를 대폭 경감하고 상태이상을 차단했습니다! (-${damage})`, 'heal');
        } else {
          const damage = Math.max(1, Math.round(rawDmg));
          this.player.hp = Math.max(0, this.player.hp - damage);

          if (this.callbacks.onFloatText) {
            this.callbacks.onFloatText(`-${damage}`, 95, 70, isSpecialTurn ? '#f97316' : '#ef4444', isSpecialTurn ? 13 : 11, isSpecialTurn);
          }
          this.addLog(`💥 ${this.monster.name}의 ${isSpecialTurn ? '치명적인 특수기' : '맹공격'}! 정진우가 ${damage}의 피해를 입었습니다!`, 'monster');

          // 8. 몬스터 타격 시 상태이상 부여 (가드가 아닐 때만 적용)
          if (this.monster.debuffOnHit) {
            const debuffData = this.monster.debuffOnHit;
            const exists = this.playerDebuffs.some(d => d.type === debuffData.type);
            if (!exists) {
              this.playerDebuffs.push({
                type: debuffData.type,
                duration: debuffData.duration,
                name: debuffData.name
              });
              this.addLog(debuffData.warning, 'warning');
            }
          }

          // 9. 몬스터 흡혈 효과
          const lifestealSprites = ['bat', 'necromancer', 'death_knight', 'lich_king'];
          if (lifestealSprites.includes(this.monster.sprite)) {
            const drain = Math.round(damage * 0.25);
            if (drain > 0 && this.monster.hp < this.monster.maxHp) {
              this.monster.hp = Math.min(this.monster.maxHp, this.monster.hp + drain);
              this.addLog(`🩸 ${this.monster.name}이(가) 정진우의 생명력을 흡수하여 HP를 ${drain} 회복했습니다!`, 'warning');
              if (this.callbacks.onFloatText) {
                this.callbacks.onFloatText(`+${drain} HP`, 250, 70, '#a855f7', 11);
              }
            }
          }
        }

        if (this.callbacks.onPlayerAnim) {
          this.callbacks.onPlayerAnim('hurt');
        }
      }

      // 가드 상태 해제
      this.isGuarding = false;
      this.checkBattleStatus();

      if (!this.isOver) {
        this.turnCount++;
        this.isPlayerTurn = true;
        this.isActionLocked = false;

        // 다음 턴 특수기 사전 예고
        if (this.monster.specialMove && (this.turnCount % this.monster.specialMove.triggerTurn === 0)) {
          this.addLog(this.monster.specialMove.warning, 'warning');
        }

        if (this.callbacks.onStateChange) {
          this.callbacks.onStateChange();
        }

        // 플레이어 턴 시작 지속 효과 (화상, 독, 빙결 등) 처리
        this.processTurnStartEffects();
      }
    }, 450);
  }

  // 승리/패배 상태 검사
  checkBattleStatus() {
    if (this.monster.hp <= 0) {
      this.isOver = true;
      this.result = 'victory';
      this.addLog(`🏆 [승리] ${this.monster.name}을(를) 격퇴했습니다!`, 'victory');

      const droppedItems = [];
      if (this.monster.drops && Array.isArray(this.monster.drops)) {
        for (const drop of this.monster.drops) {
          if (Math.random() < drop.chance) {
            droppedItems.push(drop.itemId);
          }
        }
      }

      const reward = {
        gold: this.monster.gold,
        exp: this.monster.exp,
        droppedItems,
        monsterId: this.monster.id,
        isBoss: !!this.monster.isBoss
      };

      if (this.callbacks.onEnd) {
        this.callbacks.onEnd('victory', reward);
      }
    } else if (this.player.hp <= 0) {
      this.isOver = true;
      this.result = 'defeat';
      this.addLog(`💀 [패배] 정진우가 쓰러졌습니다... 마을로 후송됩니다.`, 'defeat');

      if (this.callbacks.onEnd) {
        this.callbacks.onEnd('defeat', null);
      }
    } else {
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange();
      }
    }
  }

  canAct() {
    return !this.isOver && this.isPlayerTurn && !this.isActionLocked;
  }
}
