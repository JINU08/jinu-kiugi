// 《정진우 키우기》 - 진입점 메인 스크립트 (Main Game Bootstrap)

import './style.css';
import { gameState } from './state.js';
import { PixelArtEngine } from './engine/pixelArt.js';
import { UIEngine } from './ui.js';
import { IdleEngine } from './engine/idle.js';

window.addEventListener('DOMContentLoaded', () => {
  // 1. 픽셀 아트 엔진 더미 인스턴스 생성 (UIEngine 내부에서 canvas 연결)
  const dummyCanvas = document.createElement('canvas');
  const pixelEngine = new PixelArtEngine(dummyCanvas);

  // 2. UI 엔진 초기화 및 DOM 렌더링
  const ui = new UIEngine(pixelEngine);
  ui.refreshAll();

  // 3. 오프라인 방치 보상 계산 및 팝업 안내
  const offlineReward = IdleEngine.calculateOfflineReward(
    gameState.data.lastSavedTime,
    gameState.data.idleActivity,
    gameState.data.level,
    gameState.data.skills
  );

  if (offlineReward) {
    ui.showOfflineRewardModal(offlineReward);
  }

  // 4. 60 FPS Canvas 애니메이션 및 픽셀 렌더링 루프
  let lastTime = performance.now();
  function gameLoop(now) {
    const dt = Math.min(0.1, (now - lastTime) / 1000); // 델타 타임 (초)
    lastTime = now;

    // 픽셀 엔진 업데이트
    pixelEngine.update(dt);

    // 픽셀 엔진 화면 렌더링
    const equippedItems = {
      weapon: gameState.getEquippedItem('weapon'),
      armor: gameState.getEquippedItem('armor'),
      accessory: gameState.getEquippedItem('accessory')
    };

    const activeMonster = ui.activeBattle ? ui.activeBattle.monster : null;

    pixelEngine.render(
      gameState.data.currentLocationId,
      gameState.data,
      equippedItems,
      activeMonster
    );

    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);

  // 5. 1초 주기 실시간 방치 틱 & 상태 갱신 타이머
  setInterval(() => {
    gameState.processOnlineTick();
    ui.refreshStatsUI();
  }, 1000);

  // 6. 4초 주기 자동 저장 타이머
  setInterval(() => {
    gameState.save();
  }, 4000);

  // 7. 브라우저 종료 및 새로고침 시 즉시 저장
  window.addEventListener('beforeunload', () => {
    gameState.save();
  });
});
