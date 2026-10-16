// 정진우 키우기 UI 컨트롤러 및 화면 렌더러

import { gameState } from './state.js';
import { LOCATIONS, getLocationById } from './data/locations.js';
import { MONSTERS, getMonsterById } from './data/monsters.js';
import { QUESTS } from './data/quests.js';
import { SKILLS } from './data/skills.js';
import { ITEMS, getItemById, ITEM_GRADES } from './data/items.js';
import { IDLE_ACTIVITIES } from './engine/idle.js';
import { BattleEngine } from './engine/battle.js';
import { sound } from './engine/sound.js';

export class UIEngine {
  constructor(pixelEngine) {
    this.pixel = pixelEngine;
    this.currentTab = 'battle'; // 'battle', 'quest', 'equip', 'inventory', 'shop', 'skill', 'idle'
    this.activeBattle = null;
    this.selectedInvUid = null;
    this.selectedShopId = null;

    this.container = document.getElementById('app');
    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="game-wrapper">
        <!-- 1. 헤더 (상단 바) -->
        <header class="game-header">
          <div class="header-left">
            <h1 class="game-title">
              <span class="title-icon">⚔️</span>
              <span class="title-text">정진우 키우기</span>
              <span class="title-badge">RPG</span>
            </h1>
            <div class="player-lv-badge">
              <span class="lv-label">LV.</span>
              <span id="player-level" class="lv-val">1</span>
            </div>
          </div>

          <div class="header-center">
            <!-- 경험치 게이지 -->
            <div class="exp-bar-container" title="경험치 게이지">
              <div class="exp-bar-labels">
                <span class="exp-title">EXP</span>
                <span id="exp-text" class="exp-val">0 / 50 (0%)</span>
              </div>
              <div class="exp-progress-bg">
                <div id="exp-fill" class="exp-progress-fill" style="width: 0%"></div>
              </div>
            </div>
          </div>

          <div class="header-right">
            <!-- 골드 -->
            <div class="gold-badge" title="보유 골드">
              <span class="gold-icon">💰</span>
              <span id="player-gold" class="gold-val">100</span>
              <span class="gold-unit">G</span>
            </div>

            <!-- 사운드 및 설정 컨트롤 -->
            <div class="header-btns">
              <button id="btn-sound-sfx" class="icon-btn" title="효과음 켜기/끄기">🔊</button>
              <button id="btn-sound-bgm" class="icon-btn" title="배경음악 켜기/끄기">🎵</button>
              <button id="btn-save" class="icon-btn" title="게임 수동 저장">💾</button>
              <button id="btn-reset" class="icon-btn danger" title="게임 초기화">🔄</button>
            </div>
          </div>
        </header>

        <!-- 2. 중앙 메인 스테이지 (픽셀 아트 캔버스 & 스탯) -->
        <main class="main-stage-container">
          <!-- 상단 지역 선택 칩 -->
          <div class="location-chips" id="location-chips">
            ${LOCATIONS.map(loc => `
              <button class="loc-chip ${loc.id === 'village' ? 'active' : ''}" data-loc="${loc.id}">
                <span class="loc-icon">${loc.icon}</span>
                <span class="loc-name">${loc.shortName}</span>
                ${loc.recLevel ? `<span class="loc-rec-tag">${loc.recLevel}</span>` : ''}
                ${loc.unlockLevel > 1 ? `<span class="loc-lock">Lv.${loc.unlockLevel}</span>` : ''}
              </button>
            `).join('')}
          </div>

          <!-- 픽셀 그래픽 캔버스 영역 -->
          <div class="canvas-viewport-wrapper">
            <div class="location-banner">
              <div class="location-banner-left">
                <span id="loc-display-name">평화로운 시작의 마을</span>
                <span id="loc-display-rec" class="loc-rec-pill">안전 구역</span>
              </div>
              <span id="idle-status-badge" class="idle-pill">💤 대기</span>
            </div>
            <div class="canvas-box">
              <canvas id="game-canvas"></canvas>
            </div>
          </div>

          <!-- 캐릭터 상세 능력치 패널 -->
          <div class="char-stats-cockpit">
            <!-- HP 바 -->
            <div class="hp-gauge-box">
              <div class="hp-labels">
                <span class="hp-tag">HP</span>
                <span id="hp-text" class="hp-val">100 / 100</span>
              </div>
              <div class="hp-bar-bg">
                <div id="hp-fill" class="hp-bar-fill" style="width: 100%"></div>
              </div>
            </div>

            <!-- 스탯 그리드 -->
            <div class="stats-grid">
              <div class="stat-pill" title="공격력 (전투 피해량)">
                <span class="s-icon">⚔️</span>
                <span class="s-name">공격력</span>
                <span id="stat-atk" class="s-val">15</span>
              </div>
              <div class="stat-pill" title="방어력 (받는 피해 감소)">
                <span class="s-icon">🛡️</span>
                <span class="s-name">방어력</span>
                <span id="stat-def" class="s-val">8</span>
              </div>
              <div class="stat-pill" title="근력 (공격력 및 최대 HP 상승)">
                <span class="s-icon">💪</span>
                <span class="s-name">근력 STR</span>
                <span id="stat-str" class="s-val">10</span>
              </div>
              <div class="stat-pill" title="지능 (경험치 및 마력 상승)">
                <span class="s-icon">🧠</span>
                <span class="s-name">지능 INT</span>
                <span id="stat-int" class="s-val">10</span>
              </div>
              <div class="stat-pill" title="민첩성 (치명타 및 회피 상승)">
                <span class="s-icon">⚡</span>
                <span class="s-name">민첩 AGI</span>
                <span id="stat-agi" class="s-val">10</span>
              </div>
              <div class="stat-pill sp-highlight" title="스킬 포인트 (스킬 습득용)">
                <span class="s-icon">⭐</span>
                <span class="s-name">스킬P</span>
                <span id="stat-sp" class="s-val">0</span>
              </div>
            </div>

            <!-- 퀵 행동 메뉴 (클릭형 액션 바) -->
            <div class="action-deck">
              <button id="btn-act-train" class="action-btn train" title="근력 +1, 경험치 획득 (체력 5 소모)">
                <span class="act-icon">🏋️</span>
                <span class="act-text">근력 훈련</span>
                <span class="act-cost">-5 HP</span>
              </button>
              <button id="btn-act-study" class="action-btn study" title="지능 +1, 경험치 획득 (체력 5 소모)">
                <span class="act-icon">📖</span>
                <span class="act-text">공부하기</span>
                <span class="act-cost">-5 HP</span>
              </button>
              <button id="btn-act-rest" class="action-btn rest" title="체력 대량 회복">
                <span class="act-icon">💖</span>
                <span class="act-text">휴식하기</span>
                <span class="act-cost">HP 회복</span>
              </button>
              <button id="btn-act-explore" class="action-btn explore" title="골드/아이템/경험치 무작위 발견 (체력 10 소모)">
                <span class="act-icon">🧭</span>
                <span class="act-text">탐험하기</span>
                <span class="act-cost">-10 HP</span>
              </button>
            </div>
          </div>
        </main>

        <!-- 3. 메인 하단 탭 메뉴 및 콘텐츠 패널 -->
        <section class="bottom-tab-section">
          <!-- 탭 버튼 헤더 -->
          <nav class="tab-nav-bar">
            <button class="tab-btn active" data-tab="battle">
              <span class="tab-icon">⚔️</span>
              <span class="tab-name">전투</span>
            </button>
            <button class="tab-btn" data-tab="quest">
              <span class="tab-icon">📜</span>
              <span class="tab-name">퀘스트</span>
              <span id="quest-alert-badge" class="badge-dot" style="display:none"></span>
            </button>
            <button class="tab-btn" data-tab="equip">
              <span class="tab-icon">🛡️</span>
              <span class="tab-name">장비</span>
            </button>
            <button class="tab-btn" data-tab="inventory">
              <span class="tab-icon">🎒</span>
              <span class="tab-name">인벤토리</span>
            </button>
            <button class="tab-btn" data-tab="shop">
              <span class="tab-icon">🏪</span>
              <span class="tab-name">상점</span>
            </button>
            <button class="tab-btn" data-tab="skill">
              <span class="tab-icon">⚡</span>
              <span class="tab-name">스킬</span>
              <span id="sp-alert-badge" class="badge-num" style="display:none">0</span>
            </button>
            <button class="tab-btn" data-tab="idle">
              <span class="tab-icon">⏳</span>
              <span class="tab-name">방치 성장</span>
            </button>
          </nav>

          <!-- 탭 콘텐츠 바디 -->
          <div class="tab-contents-wrapper">
            <!-- 1) 전투 탭 패널 -->
            <div id="tab-pane-battle" class="tab-pane active">
              <div class="battle-panel-layout">
                <!-- 전투 컨트롤러 (전투 중일 때 표시) -->
                <div id="battle-active-controls" class="battle-controls" style="display: none;">
                  <!-- 실시간 전투 상태 및 버프/디버프 태그 -->
                  <div id="battle-status-tags" class="battle-status-tags"></div>

                  <div class="battle-actions-deck">
                    <button id="btn-btl-attack" class="b-act-btn attack">
                      <span class="b-act-icon">⚔️</span>
                      <span class="b-act-text">일반 공격</span>
                    </button>
                    <button id="btn-btl-skill" class="b-act-btn skill">
                      <span class="b-act-icon">💥</span>
                      <span class="b-act-text">스킬 사용</span>
                    </button>
                    <button id="btn-btl-guard" class="b-act-btn guard" title="받는 피해 65% 경감 및 상태이상 완벽 차단">
                      <span class="b-act-icon">🛡️</span>
                      <span class="b-act-text">방어 태세</span>
                      <span class="b-act-sub">-65% 피해</span>
                    </button>
                    <button id="btn-btl-purify" class="b-act-btn purify" title="모든 상태이상 해제 및 2턴간 불굴의 의지(방어력+25%, 재생) 부여">
                      <span class="b-act-icon">✨</span>
                      <span class="b-act-text">정화 / 각성</span>
                      <span class="b-act-sub">상태이상 해제</span>
                    </button>
                    <button id="btn-btl-potion" class="b-act-btn potion">
                      <span class="b-act-icon">🧪</span>
                      <span class="b-act-text">물약 사용</span>
                      <span id="potion-quick-count" class="b-act-sub">(0개)</span>
                    </button>
                    <button id="btn-btl-flee" class="b-act-btn flee">
                      <span class="b-act-icon">🏃</span>
                      <span class="b-act-text">도망가기</span>
                    </button>
                  </div>
                </div>

                <!-- 몬스터 선택 목록 (전투 중이 아닐 때 표시) -->
                <div id="battle-select-monsters" class="monster-selection-area">
                  <div class="section-subhead">
                    <span class="subhead-title">현재 지역 몬스터 출몰지</span>
                    <span id="area-mon-loc-name" class="subhead-loc">숲</span>
                  </div>
                  <div id="monster-cards-grid" class="monster-cards-grid">
                    <!-- JS 동적 생성 -->
                  </div>
                </div>

                <!-- 전투 기록 로그 터미널 -->
                <div class="combat-log-terminal">
                  <div class="log-terminal-header">
                    <span class="term-title">전투 및 모험 기록</span>
                    <button id="btn-clear-log" class="term-clear-btn">지우기</button>
                  </div>
                  <div id="combat-log-list" class="log-list">
                    <div class="log-line system">모험가 정진우가 모험을 시작했습니다. 무운을 빕니다!</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2) 퀘스트 탭 패널 -->
            <div id="tab-pane-quest" class="tab-pane">
              <div class="quests-container">
                <div class="section-subhead">
                  <span class="subhead-title">모험가 수련 과제 및 업적</span>
                  <span class="subhead-loc">달성 시 골드, 경험치 및 스킬P 지급</span>
                </div>
                <div id="quest-list-items" class="quest-list">
                  <!-- 동적 생성 -->
                </div>
              </div>
            </div>

            <!-- 3) 장비 탭 패널 -->
            <div id="tab-pane-equip" class="tab-pane">
              <div class="equipment-layout">
                <div class="equip-slots-column">
                  <div class="equip-slot-card" data-slot="weapon">
                    <div class="slot-header">
                      <span class="slot-type">무기 (Weapon)</span>
                      <button class="unequip-btn" data-slot="weapon">해제</button>
                    </div>
                    <div id="slot-item-weapon" class="slot-content empty">
                      <div class="slot-placeholder">장착된 무기 없음</div>
                    </div>
                  </div>

                  <div class="equip-slot-card" data-slot="armor">
                    <div class="slot-header">
                      <span class="slot-type">방어구 (Armor)</span>
                      <button class="unequip-btn" data-slot="armor">해제</button>
                    </div>
                    <div id="slot-item-armor" class="slot-content empty">
                      <div class="slot-placeholder">장착된 방어구 없음</div>
                    </div>
                  </div>

                  <div class="equip-slot-card" data-slot="accessory">
                    <div class="slot-header">
                      <span class="slot-type">액세서리 (Accessory)</span>
                      <button class="unequip-btn" data-slot="accessory">해제</button>
                    </div>
                    <div id="slot-item-accessory" class="slot-content empty">
                      <div class="slot-placeholder">장착된 장신구 없음</div>
                    </div>
                  </div>
                </div>

                <div class="equip-stats-summary">
                  <h3 class="equip-sum-title">장비 종합 효과</h3>
                  <div id="equip-bonuses-list" class="equip-bonuses-box">
                    <!-- 종합 계산값 -->
                  </div>
                </div>
              </div>
            </div>

            <!-- 4) 인벤토리 탭 패널 -->
            <div id="tab-pane-inventory" class="tab-pane">
              <div class="inventory-layout">
                <div class="inventory-grid-container">
                  <div class="inv-head">
                    <span>소지품 목록</span>
                    <span id="inv-capacity-text">0 / 30</span>
                  </div>
                  <div id="inventory-grid" class="inventory-grid">
                    <!-- 슬롯 동적 생성 -->
                  </div>
                </div>

                <div class="item-detail-card" id="item-detail-card">
                  <div class="detail-placeholder">아이템을 선택하면 상세 정보가 표시됩니다.</div>
                </div>
              </div>
            </div>

            <!-- 5) 상점 탭 패널 -->
            <div id="tab-pane-shop" class="tab-pane">
              <div class="shop-container">
                <div class="shop-tabs-filter">
                  <button class="shop-filter-btn active" data-filter="all">전체</button>
                  <button class="shop-filter-btn" data-filter="consumable">소비품/물약</button>
                  <button class="shop-filter-btn" data-filter="weapon">무기</button>
                  <button class="shop-filter-btn" data-filter="armor">방어구</button>
                  <button class="shop-filter-btn" data-filter="accessory">액세서리</button>
                </div>
                <div id="shop-items-grid" class="shop-items-grid">
                  <!-- 상점 아이템 카드 목록 -->
                </div>
              </div>
            </div>

            <!-- 6) 스킬 탭 패널 -->
            <div id="tab-pane-skill" class="tab-pane">
              <div class="skills-container">
                <div class="skill-header-info">
                  <div class="sp-balance">
                    <span>보유 스킬 포인트:</span>
                    <strong id="sp-balance-val">0</strong> SP
                  </div>
                  <span class="sp-guide">레벨업 시 1 SP 획득! 원하는 특성을 강화하세요.</span>
                </div>
                <div id="skill-tree-list" class="skill-tree-list">
                  <!-- 스킬 카드 목록 -->
                </div>
              </div>
            </div>

            <!-- 7) 방치 성장 탭 패널 -->
            <div id="tab-pane-idle" class="tab-pane">
              <div class="idle-container">
                <div class="idle-info-banner">
                  <h3>⏳ 방치형 자동 성장 시스템</h3>
                  <p>게임을 플레이하지 않는 동안에도 정진우는 스스로 수련하고 골드를 획득합니다. (최대 8시간 누적)</p>
                </div>
                <div class="idle-activities-grid" id="idle-activities-grid">
                  <!-- 활동 선택 카드 목록 -->
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 알림 토스트 컨테이너 -->
        <div id="toast-container" class="toast-container"></div>

        <!-- 팝업 모달 다이얼로그 (오프라인 보상, 레벨업, 확인 등) -->
        <div id="game-modal" class="modal-backdrop" style="display: none;">
          <div class="modal-card">
            <div class="modal-header">
              <h2 id="modal-title" class="modal-title">알림</h2>
              <button id="modal-close-x" class="modal-close-btn">&times;</button>
            </div>
            <div id="modal-body" class="modal-body"></div>
            <div id="modal-footer" class="modal-footer">
              <button id="modal-btn-confirm" class="btn primary">확인</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // 캔버스 초기화
    const canvas = document.getElementById('game-canvas');
    this.pixel.canvas = canvas;
    this.pixel.ctx = canvas.getContext('2d');
    this.pixel.ctx.imageSmoothingEnabled = false;
  }

  bindEvents() {
    // 1. 하단 탭 전환
    const tabBtns = this.container.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
        sound.playClick();
      });
    });

    // 2. 지역 선택 칩 클릭
    const locChips = this.container.querySelectorAll('.loc-chip');
    locChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const locId = chip.dataset.loc;
        const loc = getLocationById(locId);

        if (gameState.data.level < loc.unlockLevel) {
          sound.playError();
          this.showToast(`🔒 레벨 ${loc.unlockLevel} 이상부터 입장 가능합니다!`, 'warning');
          return;
        }

        gameState.data.currentLocationId = locId;
        sound.playClick();
        this.updateLocationChips();
        this.renderMonsterList();
        this.addCombatLog(`📍 [${loc.name}]에 도착했습니다.`, 'system');
      });
    });

    // 3. 퀵 클릭 행동 버튼
    document.getElementById('btn-act-train').addEventListener('click', () => this.handleActionTrain());
    document.getElementById('btn-act-study').addEventListener('click', () => this.handleActionStudy());
    document.getElementById('btn-act-rest').addEventListener('click', () => this.handleActionRest());
    document.getElementById('btn-act-explore').addEventListener('click', () => this.handleActionExplore());

    // 4. 전투 행동 버튼
    document.getElementById('btn-btl-attack').addEventListener('click', () => {
      if (this.activeBattle) this.activeBattle.executePlayerAttack();
    });
    document.getElementById('btn-btl-skill').addEventListener('click', () => {
      if (!this.activeBattle) return;
      const heavyLvl = gameState.data.skills.heavy_strike || 0;
      if (heavyLvl <= 0) {
        sound.playError();
        this.showToast('스킬 탭에서 [강력한 일격]을 먼저 해금하세요!', 'warning');
        return;
      }
      this.activeBattle.executePlayerSkill(1.8 + heavyLvl * 0.3);
    });
    document.getElementById('btn-btl-guard').addEventListener('click', () => {
      if (this.activeBattle) this.activeBattle.executePlayerGuard();
    });
    document.getElementById('btn-btl-purify').addEventListener('click', () => {
      if (this.activeBattle) {
        sound.playPurify();
        this.activeBattle.executePlayerPurify();
      }
    });
    document.getElementById('btn-btl-potion').addEventListener('click', () => {
      if (!this.activeBattle) return;
      const potionSlot = gameState.data.inventory.find(i => i.itemId.startsWith('cs_potion'));
      if (!potionSlot) {
        sound.playError();
        this.showToast('인벤토리에 물약이 없습니다!', 'warning');
        return;
      }
      const potionItem = getItemById(potionSlot.itemId);
      this.activeBattle.executeUsePotion(potionItem);
    });
    document.getElementById('btn-btl-flee').addEventListener('click', () => {
      if (this.activeBattle) this.activeBattle.executeFlee();
    });

    // 5. 상단 유틸리티 버튼
    document.getElementById('btn-sound-sfx').addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      document.getElementById('btn-sound-sfx').textContent = isMuted ? '🔇' : '🔊';
      this.showToast(isMuted ? '효과음이 꺼졌습니다.' : '효과음이 켜졌습니다.', 'info');
    });

    document.getElementById('btn-sound-bgm').addEventListener('click', () => {
      const isBgmOn = sound.toggleBgm();
      document.getElementById('btn-sound-bgm').textContent = isBgmOn ? '🎵' : '🎼';
      this.showToast(isBgmOn ? '배경 음악이 재생됩니다.' : '배경 음악이 꺼졌습니다.', 'info');
    });

    document.getElementById('btn-save').addEventListener('click', () => {
      gameState.save();
      sound.playClick();
      this.showToast('💾 게임 진행 상황이 안전하게 저장되었습니다!', 'success');
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      this.showConfirmModal(
        '⚠️ 게임 데이터 초기화',
        '정말로 모든 성장 기록과 장비를 초기화하고 처음부터 다시 시작하시겠습니까?<br><strong style="color:#ef4444;">이 작업은 되돌릴 수 없습니다!</strong>',
        () => {
          gameState.resetGame();
          this.showToast('게임이 초기 상태로 재설정되었습니다.', 'info');
          this.refreshAll();
        }
      );
    });

    // 모달 닫기
    document.getElementById('modal-close-x').addEventListener('click', () => this.hideModal());

    // 상점 필터
    const shopFilterBtns = this.container.querySelectorAll('.shop-filter-btn');
    shopFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        shopFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderShopItems(btn.dataset.filter);
        sound.playClick();
      });
    });

    // 장비 슬롯 해제 버튼들
    this.container.querySelectorAll('.unequip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slot = btn.dataset.slot;
        gameState.unequipItem(slot);
      });
    });

    // 로그 지우기
    document.getElementById('btn-clear-log').addEventListener('click', () => {
      document.getElementById('combat-log-list').innerHTML = '';
    });

    // GameState 변화 구독
    gameState.subscribe((event, payload) => {
      this.handleStateUpdate(event, payload);
    });
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    const tabBtns = this.container.querySelectorAll('.tab-btn');
    const tabPanes = this.container.querySelectorAll('.tab-pane');

    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
    tabPanes.forEach(p => p.classList.toggle('active', p.id === `tab-pane-${tabName}`));

    if (tabName === 'quest') this.renderQuests();
    if (tabName === 'equip') this.renderEquipment();
    if (tabName === 'inventory') this.renderInventory();
    if (tabName === 'shop') this.renderShopItems();
    if (tabName === 'skill') this.renderSkills();
    if (tabName === 'idle') this.renderIdleActivities();
    if (tabName === 'battle') this.renderMonsterList();
  }

  // --- 행동 핸들러들 ---
  handleActionTrain() {
    const res = gameState.trainStrength();
    if (!res.success) {
      this.showToast(res.reason, 'warning');
      return;
    }
    this.pixel.setPlayerState('train', 700);
    this.pixel.addFloatingText('+1 근력!', 180, 70, '#f87171', 12);
    this.pixel.addFloatingText(`+${res.exp} EXP`, 180, 52, '#fbbf24', 12);
    if (res.leveledUp) {
      this.pixel.triggerLevelUpEffect();
    }
  }

  handleActionStudy() {
    const res = gameState.study();
    if (!res.success) {
      this.showToast(res.reason, 'warning');
      return;
    }
    this.pixel.setPlayerState('study', 700);
    this.pixel.addFloatingText('+1 지능!', 180, 70, '#60a5fa', 12);
    this.pixel.addFloatingText(`+${res.exp} EXP`, 180, 52, '#fbbf24', 12);
    if (res.leveledUp) {
      this.pixel.triggerLevelUpEffect();
    }
  }

  handleActionRest() {
    const res = gameState.rest();
    if (!res.success) {
      this.showToast(res.reason, 'info');
      return;
    }
    this.pixel.setPlayerState('idle', 500);
    this.pixel.addFloatingText(`+${res.heal} HP`, 180, 70, '#22c55e', 14);
    this.pixel.addParticles(180, 100, '#22c55e', 12, 1.5, 'star');
  }

  handleActionExplore() {
    const res = gameState.explore();
    if (!res.success) {
      this.showToast(res.reason, 'warning');
      return;
    }
    this.pixel.setPlayerState('victory', 800);
    this.addCombatLog(`🧭 [탐험] ${res.message}`, 'explore');
    this.showToast(res.message, 'success');
  }

  // --- 전투 시작 핸들러 ---
  startBattle(monsterId) {
    const monster = getMonsterById(monsterId);
    if (!monster) return;

    // 전투 중복 방지
    if (this.activeBattle && !this.activeBattle.isOver) {
      return;
    }

    this.switchTab('battle');

    const playerCombatant = {
      level: gameState.data.level,
      hp: gameState.data.baseStats.hp,
      maxHp: gameState.computed.maxHp,
      atk: gameState.computed.atk,
      def: gameState.computed.def,
      critRate: gameState.computed.critRate,
      dodgeRate: gameState.computed.dodgeRate
    };

    this.activeBattle = new BattleEngine(monster, playerCombatant, {
      onLog: (log) => {
        this.addCombatLog(log.message, log.type);
      },
      onFloatText: (text, x, y, color, size, isCrit) => {
        this.pixel.addFloatingText(text, x, y, color, size, isCrit);
      },
      onPlayerAnim: (state) => {
        this.pixel.setPlayerState(state, 500);
      },
      onMonsterAnim: (state) => {
        this.pixel.setMonsterState(state, 500);
      },
      onPotionUsed: (potionId) => {
        gameState.removeItemFromInventory(potionId, 1);
        gameState.data.baseStats.hp = this.activeBattle.player.hp;
        this.refreshStatsUI();
      },
      onStateChange: () => {
        // 플레이어 체력 실시간 동기화
        gameState.data.baseStats.hp = this.activeBattle.player.hp;
        this.refreshStatsUI();
        this.updateBattleUIVisibility();
      },
      onEnd: (result, reward) => {
        gameState.data.baseStats.hp = this.activeBattle.player.hp;
        this.refreshStatsUI();

        if (result === 'victory') {
          this.pixel.setPlayerState('victory', 1500);
          gameState.handleBattleVictory(reward);
          this.showBattleVictoryModal(reward);
        } else if (result === 'defeat') {
          gameState.handleBattleDefeat();
          this.showToast('전투에서 패배하여 마을로 귀환했습니다...', 'error');
        } else if (result === 'flee') {
          this.showToast('전투에서 무사히 도망쳤습니다.', 'info');
        }

        setTimeout(() => {
          this.activeBattle = null;
          this.updateLocationChips();
          this.updateBattleUIVisibility();
          this.renderMonsterList();
        }, 1200);
      }
    });

    sound.playAttack();
    this.updateBattleUIVisibility();
  }

  updateBattleUIVisibility() {
    const activeBox = document.getElementById('battle-active-controls');
    const selectBox = document.getElementById('battle-select-monsters');

    if (this.activeBattle && !this.activeBattle.isOver) {
      activeBox.style.display = 'block';
      selectBox.style.display = 'none';

      // 물약 개수 갱신
      const potionSlot = gameState.data.inventory.find(i => i.itemId.startsWith('cs_potion'));
      document.getElementById('potion-quick-count').textContent = `(${potionSlot ? potionSlot.count : 0}개)`;

      // 실시간 버프/디버프 및 방어막 태그 렌더링
      const tagBox = document.getElementById('battle-status-tags');
      if (tagBox) {
        const b = this.activeBattle;
        const tags = [];
        if (b.isGuarding) {
          tags.push('<span class="status-tag guard">🛡️ 방어 태세 (-65%, 디버프 차단)</span>');
        }
        b.playerBuffs.forEach(buff => {
          tags.push(`<span class="status-tag buff">✨ ${buff.name} (${buff.duration}턴)</span>`);
        });
        b.playerDebuffs.forEach(d => {
          tags.push(`<span class="status-tag debuff">⚠️ ${d.name} (${d.duration}턴)</span>`);
        });
        if (b.monster.shield > 0) {
          tags.push(`<span class="status-tag shield">🛡️ 적 방어막 ${b.monster.shield.toLocaleString()}</span>`);
        }
        if (b.monster.isCounterStanceActive) {
          tags.push('<span class="status-tag counter">⚡ 적 반격 태세 (일반 공격 시 반사!)</span>');
        }
        if (b.monster.isRaged) {
          tags.push('<span class="status-tag rage">🔥 적 광폭화 상태 (+35% ATK)</span>');
        }
        if (b.isFrenzyEnraged) {
          tags.push('<span class="status-tag frenzy">💀 보스 광란의 폭주 (+80% ATK)</span>');
        }
        tagBox.innerHTML = tags.join('');
      }
    } else {
      activeBox.style.display = 'none';
      selectBox.style.display = 'block';
    }
  }

  // --- 화면 갱신 및 렌더링 함수들 ---
  refreshAll() {
    this.refreshStatsUI();
    this.updateLocationChips();
    this.renderMonsterList();
    this.renderQuests();
    this.renderEquipment();
    this.renderInventory();
    this.renderShopItems();
    this.renderSkills();
    this.renderIdleActivities();
  }

  refreshStatsUI() {
    const d = gameState.data;
    const c = gameState.computed;

    document.getElementById('player-level').textContent = d.level;
    document.getElementById('player-gold').textContent = d.gold.toLocaleString();

    // EXP
    const expPct = Math.min(100, Math.floor((d.exp / d.maxExp) * 100));
    document.getElementById('exp-text').textContent = `${d.exp} / ${d.maxExp} (${expPct}%)`;
    document.getElementById('exp-fill').style.width = `${expPct}%`;

    // HP
    const hpPct = Math.max(0, Math.min(100, Math.floor((d.baseStats.hp / c.maxHp) * 100)));
    document.getElementById('hp-text').textContent = `${d.baseStats.hp} / ${c.maxHp}`;
    document.getElementById('hp-fill').style.width = `${hpPct}%`;

    // 스탯 그리드
    document.getElementById('stat-atk').textContent = c.atk;
    document.getElementById('stat-def').textContent = c.def;
    document.getElementById('stat-str').textContent = c.totalStr;
    document.getElementById('stat-int').textContent = c.totalInt;
    document.getElementById('stat-agi').textContent = c.totalAgi;
    document.getElementById('stat-sp').textContent = d.sp;

    // SP 뱃지 표시
    const spBadge = document.getElementById('sp-alert-badge');
    if (d.sp > 0) {
      spBadge.style.display = 'inline-block';
      spBadge.textContent = d.sp;
    } else {
      spBadge.style.display = 'none';
    }

    // 퀘스트 완료 보상 수령 가능 뱃지 확인
    let hasUnclaimedQuest = false;
    for (const q of QUESTS) {
      const qd = d.quests[q.id];
      if (qd && !qd.claimed && qd.progress >= q.target) {
        hasUnclaimedQuest = true;
        break;
      }
    }
    document.getElementById('quest-alert-badge').style.display = hasUnclaimedQuest ? 'inline-block' : 'none';

    // 방치 상태 레이블
    const act = IDLE_ACTIVITIES[d.idleActivity] || IDLE_ACTIVITIES.none;
    document.getElementById('idle-status-badge').textContent = `${act.icon} ${act.name}`;
  }

  updateLocationChips() {
    const currentLocId = gameState.data.currentLocationId;
    const loc = getLocationById(currentLocId);

    document.getElementById('loc-display-name').textContent = loc.name;
    const recEl = document.getElementById('loc-display-rec');
    if (recEl) {
      recEl.textContent = loc.recLevel || '';
    }

    const chips = this.container.querySelectorAll('.loc-chip');
    chips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.loc === currentLocId);
    });
  }

  renderMonsterList() {
    const grid = document.getElementById('monster-cards-grid');
    const locId = gameState.data.currentLocationId;
    const loc = getLocationById(locId);

    document.getElementById('area-mon-loc-name').textContent = `${loc.name} (${loc.recLevel || ''})`;

    if (!loc.canBattle) {
      grid.innerHTML = `
        <div class="safe-zone-msg">
          <span>🕊️ 이곳은 안전 구역입니다. 몬스터가 출몰하지 않습니다.</span>
          <span style="font-size:0.85rem; color:#94a3b8; margin-top:6px;">숲, 동굴, 던전, 용의 둥지, 빙결 설원, 시련탑으로 이동하여 전투를 즐기세요!</span>
        </div>
      `;
      return;
    }

    const availableMonsters = MONSTERS.filter(m => m.locationId === locId);
    const playerLevel = gameState.data.level;

    grid.innerHTML = availableMonsters.map(m => {
      const isMythic = m.tier === 'mythic';
      const isBoss = m.isBoss;
      const isElite = m.isElite;

      let tierBadge = '<span class="mon-badge common">일반</span>';
      if (isMythic) tierBadge = '<span class="mon-badge mythic">👑 신화 레이드</span>';
      else if (isBoss) tierBadge = '<span class="mon-badge boss">🔥 지역 보스</span>';
      else if (isElite) tierBadge = '<span class="mon-badge elite">⭐ 정예</span>';

      const monLevel = m.level || 1;
      const levelDiff = monLevel - playerLevel;
      let dangerBadge = '';
      if (levelDiff >= 4) {
        dangerBadge = '<span class="mon-danger-badge lethal">💀 극도로 위험</span>';
      } else if (levelDiff >= 2) {
        dangerBadge = '<span class="mon-danger-badge danger">⚠️ 위험 (+위협 피해)</span>';
      } else if (levelDiff === 1) {
        dangerBadge = '<span class="mon-danger-badge caution">⚡ 주의</span>';
      } else if (levelDiff <= -3) {
        dangerBadge = '<span class="mon-danger-badge farm">🌱 쉬움 (파밍)</span>';
      } else {
        dangerBadge = '<span class="mon-danger-badge safe">🎯 적정</span>';
      }

      return `
        <div class="monster-card ${isMythic ? 'mythic-card' : (isBoss ? 'boss-card' : (isElite ? 'elite-card' : ''))}">
          <div class="mon-card-top">
            <div class="mon-card-badges">
              <span class="mon-rec-level">권장 Lv.${monLevel}</span>
              ${tierBadge}
              ${dangerBadge}
            </div>
            <h4 class="mon-name">${m.name}</h4>
            <div class="mon-title-sub">${m.title}</div>
          </div>
          <div class="mon-stats-row">
            <span>체력 ${m.maxHp.toLocaleString()}</span>
            <span>공격력 ${m.atk}</span>
            <span>방어력 ${m.def}</span>
          </div>
          <div class="mon-rewards-row">
            <span>💰 ${m.gold.toLocaleString()}G</span>
            <span>⭐ ${m.exp.toLocaleString()} EXP</span>
          </div>
          ${m.shield ? `<div class="mon-gimmick-tag shield">🛡️ 방어막: ${m.shield.toLocaleString()} 결계</div>` : ''}
          ${m.specialMove ? `<div class="mon-gimmick-tag">⚡ 특수기: [${m.specialMove.name}] (${m.specialMove.triggerTurn}턴마다)</div>` : ''}
          ${m.debuffOnHit ? `<div class="mon-gimmick-tag debuff">⚠️ 피격 시 [${m.debuffOnHit.name}] 부여</div>` : ''}
          ${m.hasCounterStance ? `<div class="mon-gimmick-tag counter">⚡ 신성 반격 방벽 기믹</div>` : ''}
          ${m.hasPhaseAwakening ? `<div class="mon-gimmick-tag phase">🌌 HP 50% 이하 2단계 진정한 혼돈 각성</div>` : ''}
          ${m.hasRage ? `<div class="mon-gimmick-tag rage">🔥 체력 35% 이하 시 광폭화 (+35% ATK)</div>` : ''}
          <button class="mon-battle-btn ${isMythic ? 'mythic-btn' : (isBoss ? 'boss-btn' : (isElite ? 'elite-btn' : ''))}" data-monid="${m.id}">
            ${isMythic ? '🌋 신화 레이드 도전' : (isBoss ? '🔥 보스 토벌 시작' : '⚔️ 전투 시작')}
          </button>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.mon-battle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.startBattle(btn.dataset.monid);
      });
    });
  }

  renderQuests() {
    const list = document.getElementById('quest-list-items');
    list.innerHTML = QUESTS.map(q => {
      const qd = gameState.data.quests[q.id] || { progress: 0, claimed: false };
      const pct = Math.min(100, Math.floor((qd.progress / q.target) * 100));
      const isComplete = qd.progress >= q.target;

      let rewardText = [];
      if (q.reward.gold) rewardText.push(`💰 ${q.reward.gold}G`);
      if (q.reward.exp) rewardText.push(`⭐ ${q.reward.exp} EXP`);
      if (q.reward.sp) rewardText.push(`✨ ${q.reward.sp} SP`);
      if (q.reward.itemId) {
        const item = getItemById(q.reward.itemId);
        if (item) rewardText.push(`🎁 ${item.name}`);
      }

      return `
        <div class="quest-card ${qd.claimed ? 'claimed' : (isComplete ? 'ready' : '')}">
          <div class="q-icon-box">${q.icon}</div>
          <div class="q-info-box">
            <div class="q-title-row">
              <span class="q-title">${q.title}</span>
              <span class="q-progress-num">${Math.min(qd.progress, q.target)} / ${q.target}</span>
            </div>
            <div class="q-desc">${q.desc}</div>
            <div class="q-bar-bg">
              <div class="q-bar-fill" style="width: ${pct}%"></div>
            </div>
            <div class="q-reward-row">
              <span class="q-reward-tag">보상:</span>
              <span class="q-reward-items">${rewardText.join(', ')}</span>
            </div>
          </div>
          <div class="q-action-box">
            ${qd.claimed ? `
              <button class="btn q-btn claimed" disabled>완료됨</button>
            ` : (isComplete ? `
              <button class="btn q-btn claim-now" data-qid="${q.id}">보상 받기</button>
            ` : `
              <button class="btn q-btn in-progress" disabled>진행 중</button>
            `)}
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.claim-now').forEach(btn => {
      btn.addEventListener('click', () => {
        const res = gameState.claimQuestReward(btn.dataset.qid);
        if (res.success) {
          this.showToast('🎉 퀘스트 보상을 성공적으로 수령했습니다!', 'success');
          this.renderQuests();
          this.refreshStatsUI();
        }
      });
    });
  }

  renderEquipment() {
    const slots = ['weapon', 'armor', 'accessory'];
    slots.forEach(slot => {
      const item = gameState.getEquippedItem(slot);
      const container = document.getElementById(`slot-item-${slot}`);
      if (item) {
        const gradeInfo = ITEM_GRADES[item.grade];
        container.className = 'slot-content filled';
        container.style.borderColor = gradeInfo.border;
        container.style.backgroundColor = gradeInfo.bg;
        container.innerHTML = `
          <div class="slot-item-info">
            <span class="slot-item-icon">${item.icon}</span>
            <div class="slot-item-text">
              <span class="slot-item-name" style="color:${gradeInfo.color}; font-weight:bold;">${item.name}</span>
              <span class="slot-item-grade" style="color:${gradeInfo.color}">[${gradeInfo.name}]</span>
              <div class="slot-item-stats">${this.formatItemStats(item.stats)}</div>
            </div>
          </div>
        `;
      } else {
        container.className = 'slot-content empty';
        container.style.borderColor = '';
        container.style.backgroundColor = '';
        container.innerHTML = `<div class="slot-placeholder">장착된 아이템 없음</div>`;
      }
    });

    // 종합 보너스 렌더링
    const wp = gameState.getEquippedItem('weapon');
    const ar = gameState.getEquippedItem('armor');
    const ac = gameState.getEquippedItem('accessory');

    let totalAtk = (wp?.stats?.atk || 0) + (ac?.stats?.atk || 0);
    let totalDef = (ar?.stats?.def || 0) + (ac?.stats?.def || 0);
    let totalHp = (ar?.stats?.hp || 0) + (ac?.stats?.hp || 0);
    let totalStr = (wp?.stats?.str || 0) + (ar?.stats?.str || 0) + (ac?.stats?.str || 0);
    let totalAgi = (wp?.stats?.agi || 0) + (ar?.stats?.agi || 0) + (ac?.stats?.agi || 0);

    document.getElementById('equip-bonuses-list').innerHTML = `
      <div class="bonus-stat-row"><span>공격력 증가:</span> <strong>+${totalAtk}</strong></div>
      <div class="bonus-stat-row"><span>방어력 증가:</span> <strong>+${totalDef}</strong></div>
      <div class="bonus-stat-row"><span>추가 체력:</span> <strong>+${totalHp} HP</strong></div>
      <div class="bonus-stat-row"><span>근력 보너스:</span> <strong>+${totalStr} STR</strong></div>
      <div class="bonus-stat-row"><span>민첩 보너스:</span> <strong>+${totalAgi} AGI</strong></div>
    `;
  }

  renderInventory() {
    const grid = document.getElementById('inventory-grid');
    const inv = gameState.data.inventory;

    document.getElementById('inv-capacity-text').textContent = `${inv.length} / 30`;

    grid.innerHTML = inv.map(slot => {
      const item = getItemById(slot.itemId);
      if (!item) return '';
      const grade = ITEM_GRADES[item.grade];
      const isSelected = slot.uid === this.selectedInvUid;

      return `
        <div class="inv-slot ${isSelected ? 'selected' : ''}" data-uid="${slot.uid}" style="border-color:${grade.border};">
          <span class="inv-item-icon">${item.icon}</span>
          ${slot.count > 1 ? `<span class="inv-item-count">${slot.count}</span>` : ''}
        </div>
      `;
    }).join('');

    // 빈 슬롯 채우기 (최소 20칸)
    const emptyCount = Math.max(0, 20 - inv.length);
    for (let i = 0; i < emptyCount; i++) {
      grid.innerHTML += `<div class="inv-slot empty"></div>`;
    }

    grid.querySelectorAll('.inv-slot[data-uid]').forEach(el => {
      el.addEventListener('click', () => {
        this.selectedInvUid = Number(el.dataset.uid);
        this.renderInventory();
        this.renderItemDetail();
        sound.playClick();
      });
    });

    this.renderItemDetail();
  }

  renderItemDetail() {
    const card = document.getElementById('item-detail-card');
    if (!this.selectedInvUid) {
      card.innerHTML = `<div class="detail-placeholder">아이템을 선택하면 상세 정보가 표시됩니다.</div>`;
      return;
    }

    const slot = gameState.data.inventory.find(i => i.uid === this.selectedInvUid);
    if (!slot) {
      this.selectedInvUid = null;
      card.innerHTML = `<div class="detail-placeholder">아이템을 선택하면 상세 정보가 표시됩니다.</div>`;
      return;
    }

    const item = getItemById(slot.itemId);
    const grade = ITEM_GRADES[item.grade];

    card.innerHTML = `
      <div class="detail-header" style="border-color:${grade.border}; background:${grade.bg};">
        <span class="detail-icon">${item.icon}</span>
        <div class="detail-titles">
          <h4 style="color:${grade.color};">${item.name}</h4>
          <span class="detail-grade-tag" style="color:${grade.color};">[${grade.name} ${this.getTypeKorean(item.type)}]</span>
        </div>
      </div>
      <div class="detail-body">
        <p class="detail-desc">${item.desc}</p>
        <div class="detail-stats-box">
          ${item.stats ? this.formatItemStats(item.stats) : ''}
          ${item.effect ? `<div class="eff-line">효과: 체력/능력치 회복</div>` : ''}
        </div>
        <div class="detail-price-info">
          <span>판매 가격: 💰 ${item.sellPrice || Math.floor(item.price * 0.5)}G</span>
          ${slot.count > 1 ? `<span>보유 수량: ${slot.count}개</span>` : ''}
        </div>
      </div>
      <div class="detail-actions">
        ${item.type === 'consumable' ? `
          <button id="btn-item-use" class="btn primary">사용하기</button>
        ` : `
          <button id="btn-item-equip" class="btn primary">장착하기</button>
        `}
        <button id="btn-item-sell" class="btn danger">판매하기</button>
      </div>
    `;

    const btnEquip = document.getElementById('btn-item-equip');
    if (btnEquip) {
      btnEquip.addEventListener('click', () => {
        gameState.equipItem(this.selectedInvUid);
        this.selectedInvUid = null;
      });
    }

    const btnUse = document.getElementById('btn-item-use');
    if (btnUse) {
      btnUse.addEventListener('click', () => {
        const res = gameState.useConsumable(this.selectedInvUid);
        if (res.success) {
          this.showToast(res.message, 'success');
        } else {
          this.showToast(res.reason, 'warning');
        }
      });
    }

    const btnSell = document.getElementById('btn-item-sell');
    if (btnSell) {
      btnSell.addEventListener('click', () => {
        gameState.sellItem(this.selectedInvUid);
        this.selectedInvUid = null;
      });
    }
  }

  renderShopItems(filter = 'all') {
    const grid = document.getElementById('shop-items-grid');
    const filteredItems = filter === 'all' ? ITEMS : ITEMS.filter(i => i.type === filter);

    grid.innerHTML = filteredItems.map(item => {
      const grade = ITEM_GRADES[item.grade];
      const canAfford = gameState.data.gold >= item.price;

      return `
        <div class="shop-card" style="border-color:${grade.border};">
          <div class="shop-card-icon">${item.icon}</div>
          <div class="shop-card-content">
            <div class="shop-card-title-row">
              <strong style="color:${grade.color};">${item.name}</strong>
              <span class="shop-grade-tag" style="color:${grade.color};">[${grade.name}]</span>
            </div>
            <div class="shop-card-desc">${item.desc}</div>
            <div class="shop-card-stats">${item.stats ? this.formatItemStats(item.stats) : ''}</div>
            <div class="shop-card-bottom">
              <span class="shop-price">💰 ${item.price.toLocaleString()}G</span>
              <button class="btn shop-buy-btn ${canAfford ? 'primary' : 'disabled'}" data-itemid="${item.id}">
                구매하기
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.shop-buy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const res = gameState.buyItem(btn.dataset.itemid);
        if (res.success) {
          this.showToast(res.message, 'success');
          this.renderShopItems(filter);
        } else {
          this.showToast(res.reason, 'warning');
        }
      });
    });
  }

  renderSkills() {
    const list = document.getElementById('skill-tree-list');
    document.getElementById('sp-balance-val').textContent = gameState.data.sp;

    list.innerHTML = SKILLS.map(s => {
      const currentLvl = gameState.data.skills[s.id] || 0;
      const isMax = currentLvl >= s.maxLevel;
      const isLocked = gameState.data.level < s.unlockLevel;
      const canUpgrade = !isMax && !isLocked && gameState.data.sp >= s.costPerLevel;

      return `
        <div class="skill-card ${isLocked ? 'locked' : ''}">
          <div class="skill-icon-box">${s.icon}</div>
          <div class="skill-info-box">
            <div class="skill-title-row">
              <strong class="skill-name">${s.name}</strong>
              <span class="skill-level-badge ${isMax ? 'max' : ''}">
                ${isMax ? 'MASTER' : `Lv. ${currentLvl} / ${s.maxLevel}`}
              </span>
            </div>
            <div class="skill-desc">${s.desc}</div>
            <div class="skill-effect-highlight">${s.getEffectDesc(currentLvl)}</div>
            ${isLocked ? `<div class="skill-lock-text">🔒 레벨 ${s.unlockLevel}에 해금</div>` : ''}
          </div>
          <div class="skill-action-box">
            <button class="btn skill-up-btn ${canUpgrade ? 'primary' : ''}" data-skillid="${s.id}" ${canUpgrade ? '' : 'disabled'}>
              ${isMax ? '완료' : `강화 (1 SP)`}
            </button>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.skill-up-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const res = gameState.upgradeSkill(btn.dataset.skillid);
        if (res.success) {
          this.showToast(`✨ 스킬 레벨이 ${res.newLevel}로 상승했습니다!`, 'success');
          this.renderSkills();
          this.refreshStatsUI();
        } else {
          this.showToast(res.reason, 'warning');
        }
      });
    });
  }

  renderIdleActivities() {
    const grid = document.getElementById('idle-activities-grid');
    const currentAct = gameState.data.idleActivity;

    grid.innerHTML = Object.values(IDLE_ACTIVITIES).map(act => {
      const isSelected = act.id === currentAct;

      return `
        <div class="idle-act-card ${isSelected ? 'active' : ''}" data-actid="${act.id}">
          <div class="act-card-head">
            <span class="act-card-icon">${act.icon}</span>
            <span class="act-card-title">${act.name}</span>
          </div>
          <p class="act-card-desc">${act.desc}</p>
          <div class="act-card-rates">
            <span>⭐ 초당 경험치: +${act.expPerSec}</span>
            <span>💰 초당 골드: +${act.goldPerSec}</span>
          </div>
          <button class="btn act-select-btn ${isSelected ? 'primary' : ''}">
            ${isSelected ? '현재 활동 중' : '이 활동 선택'}
          </button>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.idle-act-card').forEach(card => {
      card.addEventListener('click', () => {
        const actId = card.dataset.actid;
        gameState.data.idleActivity = actId;
        sound.playClick();
        this.renderIdleActivities();
        this.refreshStatsUI();
        this.showToast(`방치 활동이 [${IDLE_ACTIVITIES[actId].name}]로 설정되었습니다.`, 'info');
      });
    });
  }

  // --- 모달 창 시스템 ---
  showModal(title, bodyHtml, confirmCallback = null, confirmText = '확인') {
    const modal = document.getElementById('game-modal');
    document.getElementById('modal-title').innerHTML = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;

    const confirmBtn = document.getElementById('modal-btn-confirm');
    confirmBtn.textContent = confirmText;
    confirmBtn.onclick = () => {
      this.hideModal();
      if (confirmCallback) confirmCallback();
    };

    modal.style.display = 'flex';
    sound.playClick();
  }

  hideModal() {
    document.getElementById('game-modal').style.display = 'none';
  }

  showConfirmModal(title, message, onConfirm) {
    this.showModal(title, message, onConfirm, '네, 진행합니다');
  }

  showOfflineRewardModal(reward) {
    if (!reward) return;
    const body = `
      <div class="offline-reward-modal-content">
        <p class="offline-time-msg">
          정진우 모험가님, 어서오세요!<br>
          부재 중 <strong>${reward.timeFormatted}</strong> 동안 [${reward.activityName}]을(를) 성실히 수행했습니다.
        </p>
        <div class="offline-reward-box">
          <div class="off-reward-row">
            <span>⭐ 획득 경험치:</span>
            <strong>+${reward.exp.toLocaleString()} EXP</strong>
          </div>
          <div class="off-reward-row">
            <span>💰 획득 골드:</span>
            <strong>+${reward.gold.toLocaleString()} G</strong>
          </div>
          ${reward.bonusItem ? `
            <div class="off-reward-row item">
              <span>🎁 보너스 발견 아이템:</span>
              <strong>${getItemById(reward.bonusItem)?.name || reward.bonusItem}</strong>
            </div>
          ` : ''}
        </div>
        ${reward.isCapped ? '<p class="off-capped-note">※ 오프라인 보상은 최대 8시간까지만 누적됩니다.</p>' : ''}
      </div>
    `;

    this.showModal('⏳ 부재 중 방치 보상 도착!', body, () => {
      gameState.addExp(reward.exp);
      gameState.addGold(reward.gold);
      if (reward.bonusItem) {
        gameState.addItemToInventory(reward.bonusItem, 1);
      }
      sound.playLevelUp();
      this.showToast('오프라인 보상이 모두 지급되었습니다!', 'success');
      this.refreshStatsUI();
    }, '🎁 보상 모두 받기');
  }

  showBattleVictoryModal(reward) {
    const drops = reward.droppedItems.map(id => getItemById(id)?.name).filter(Boolean);
    const body = `
      <div class="battle-victory-content">
        <h3 style="color:#22c55e;">⚔️ VICTORY! ⚔️</h3>
        <p>전투에서 승리하여 값진 전리품을 획득했습니다!</p>
        <div class="victory-rewards-list">
          <div>💰 골드: +${reward.gold}G</div>
          <div>⭐ 경험치: +${reward.exp} EXP</div>
          ${drops.length > 0 ? `<div style="color:#f59e0b;">🎁 획득 아이템: ${drops.join(', ')}</div>` : ''}
        </div>
      </div>
    `;
    this.showModal('🏆 전투 승리!', body, null, '확인');
  }

  // --- 토스트 알림창 ---
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    toast.innerHTML = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }

  // --- 전투 로그 터미널 추가 ---
  addCombatLog(text, type = 'normal') {
    const list = document.getElementById('combat-log-list');
    if (!list) return;

    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    line.innerHTML = text;
    list.appendChild(line);

    // 최대 50줄 유지
    while (list.children.length > 50) {
      list.removeChild(list.firstChild);
    }
    list.scrollTop = list.scrollHeight;
  }

  // 상태 변화 반응
  handleStateUpdate(event, payload) {
    this.refreshStatsUI();

    if (event === 'exp_gain' && payload?.leveledUp) {
      this.pixel.triggerLevelUpEffect();
      sound.playLevelUp();
      this.showToast(`⭐ LEVEL UP! 레벨 ${gameState.data.level}에 도달했습니다!`, 'success');
    }

    if (event === 'equip_change') {
      this.renderEquipment();
      this.renderInventory();
    }

    if (event === 'inventory_change') {
      this.renderInventory();
    }

    if (event === 'battle_defeat') {
      this.updateLocationChips();
    }
  }

  // 보조 헬퍼
  formatItemStats(stats) {
    if (!stats) return '';
    const parts = [];
    if (stats.atk) parts.push(`공격력 +${stats.atk}`);
    if (stats.def) parts.push(`방어력 +${stats.def}`);
    if (stats.hp) parts.push(`HP +${stats.hp}`);
    if (stats.str) parts.push(`근력 +${stats.str}`);
    if (stats.int) parts.push(`지능 +${stats.int}`);
    if (stats.agi) parts.push(`민첩 +${stats.agi}`);
    if (stats.crit) parts.push(`치명타 +${stats.crit}%`);
    if (stats.dodge) parts.push(`회피 +${stats.dodge}%`);
    return parts.join(', ');
  }

  getTypeKorean(type) {
    switch (type) {
      case 'weapon': return '무기';
      case 'armor': return '방어구';
      case 'accessory': return '액세서리';
      case 'consumable': return '소비품';
      default: return '아이템';
    }
  }
}
