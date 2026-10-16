// 픽셀 아트 렌더링 엔진 (Canvas 기반 오리지널 픽셀 그래픽)
// 외부 에셋 없이 100% 브라우저 캔버스로 선명하고 세밀한 레트로 픽셀 아트 구현

export class PixelArtEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 360;
    this.height = 220;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // 픽셀 보존 설정
    this.ctx.imageSmoothingEnabled = false;

    this.particles = [];
    this.floatingTexts = [];
    this.animTime = 0;

    // 캐릭터 상태
    this.playerState = 'idle'; // 'idle', 'train', 'study', 'attack', 'victory', 'hurt'
    this.stateTimer = 0;

    // 전투 중 몬스터
    this.activeMonster = null;
    this.monsterState = 'idle'; // 'idle', 'attack', 'hurt'
    this.monsterTimer = 0;
  }

  setPlayerState(state, duration = 800) {
    this.playerState = state;
    this.stateTimer = duration;
  }

  setMonsterState(state, duration = 600) {
    this.monsterState = state;
    this.monsterTimer = duration;
  }

  addFloatingText(text, x, y, color = '#ffffff', fontSize = 12, isCrit = false) {
    this.floatingTexts.push({
      text,
      x: x + (Math.random() * 20 - 10),
      y,
      startY: y,
      color,
      fontSize,
      isCrit,
      life: 1.0,
      vy: -1.2
    });
  }

  addParticles(x, y, color, count = 8, speed = 2, type = 'star') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (0.5 + Math.random() * 1.5) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - (type === 'levelup' ? 1.5 : 0),
        size: Math.random() * 3 + 2,
        color,
        type,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03
      });
    }
  }

  triggerLevelUpEffect() {
    this.setPlayerState('victory', 1800);
    this.addFloatingText('LEVEL UP!! ★', this.width / 2, 45, '#fde047', 16, true);
    for (let i = 0; i < 30; i++) {
      this.addParticles(
        this.width / 2 + (Math.random() * 60 - 30),
        75 + (Math.random() * 40 - 20),
        Math.random() > 0.5 ? '#f59e0b' : '#38bdf8',
        2,
        2.5,
        'levelup'
      );
    }
  }

  update(deltaTime) {
    this.animTime += deltaTime;

    if (this.stateTimer > 0) {
      this.stateTimer -= deltaTime * 1000;
      if (this.stateTimer <= 0) {
        this.playerState = 'idle';
      }
    }

    if (this.monsterTimer > 0) {
      this.monsterTimer -= deltaTime * 1000;
      if (this.monsterTimer <= 0) {
        this.monsterState = 'idle';
      }
    }

    // 파티클 업데이트
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 플로팅 텍스트 업데이트
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= 0.022;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  render(locationId, playerStats, equipped, monster = null) {
    this.activeMonster = monster;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. 장소별 픽셀 배경 렌더링
    this.drawBackground(locationId);

    // 2. 바닥 그림자 및 무대
    this.drawStage(locationId, !!monster);

    // 3. 몬스터 렌더링 (전투 중일 때) - Y위치 상향 조정 (135 -> 95)
    if (monster) {
      this.drawMonster(monster, 250, 95);
    }

    // 4. 정진우 캐릭터 렌더링 (전투 여부에 따라 위치 변경) - Y위치 상향 조정 (135 -> 95)
    const px = monster ? 95 : 180;
    const py = 95;
    this.drawPlayer(px, py, playerStats, equipped);

    // 5. 파티클 렌더링
    this.renderParticles();

    // 6. 플로팅 텍스트 렌더링
    this.renderFloatingTexts();
  }

  // --- 장소별 배경 그리기 ---
  drawBackground(locationId) {
    const ctx = this.ctx;
    const t = this.animTime;

    switch (locationId) {
      case 'village':
        this.drawVillage(ctx, t);
        break;
      case 'training':
        this.drawTrainingDojo(ctx, t);
        break;
      case 'forest':
        this.drawForest(ctx, t);
        break;
      case 'cave':
        this.drawCave(ctx, t);
        break;
      case 'dungeon':
        this.drawDungeon(ctx, t);
        break;
      case 'dragon':
      case 'dragon_lair':
        this.drawDragonLair(ctx, t);
        break;
      case 'frozen':
      case 'frozen_abyss':
        this.drawFrozenAbyss(ctx, t);
        break;
      case 'celestial':
      case 'celestial_tower':
        this.drawCelestialTower(ctx, t);
        break;
      default:
        this.drawVillage(ctx, t);
    }
  }

  drawVillage(ctx, t) {
    // 하늘
    const grad = ctx.createLinearGradient(0, 0, 0, 115);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, 115);

    // 태양
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(310, 26, 13, 0, Math.PI * 2);
    ctx.fill();

    // 구름 (느리게 이동)
    const c1 = ((t * 8) % 420) - 60;
    const c2 = (((t * 12) + 200) % 420) - 60;
    this.drawPixelCloud(c1, 14, 48);
    this.drawPixelCloud(c2, 34, 36);

    // 먼 언덕
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.moveTo(0, 115);
    ctx.lineTo(0, 80);
    ctx.quadraticCurveTo(90, 55, 180, 80);
    ctx.quadraticCurveTo(270, 50, 360, 75);
    ctx.lineTo(360, 115);
    ctx.fill();

    // 가까운 잔디밭 (지평선 상향)
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(0, 105, this.width, 115);

    // 흙길
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(110, 220);
    ctx.lineTo(250, 220);
    ctx.lineTo(190, 115);
    ctx.lineTo(170, 115);
    ctx.fill();

    // 시골 집 (좌측)
    ctx.fillStyle = '#92400e';
    ctx.fillRect(20, 65, 55, 42); // 벽
    ctx.fillStyle = '#b91c1c'; // 빨간 지붕
    ctx.beginPath();
    ctx.moveTo(12, 65);
    ctx.lineTo(47, 36);
    ctx.lineTo(83, 65);
    ctx.fill();
    // 문과 창문
    ctx.fillStyle = '#451a03';
    ctx.fillRect(40, 83, 15, 24);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(26, 73, 10, 10);

    // 풍차 (우측)
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(295, 115);
    ctx.lineTo(315, 55);
    ctx.lineTo(335, 115);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(310, 50, 10, 8); // 풍차 중심
    // 풍차 날개 회전
    ctx.save();
    ctx.translate(315, 54);
    ctx.rotate(t * 1.5);
    ctx.fillStyle = '#78350f';
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillRect(-2, -32, 4, 32);
      ctx.fillRect(-8, -27, 16, 7);
    }
    ctx.restore();

    // 꽃송이 장식
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(95, 145, 3, 3);
    ctx.fillRect(265, 155, 3, 3);
    ctx.fillRect(75, 180, 3, 3);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(135, 170, 3, 3);
    ctx.fillRect(225, 140, 3, 3);
  }

  drawTrainingDojo(ctx, t) {
    // 실내 벽
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, this.width, 105);

    // 목재 벽 패턴
    ctx.fillStyle = '#451a03';
    for (let x = 0; x < this.width; x += 40) {
      ctx.fillRect(x, 0, 3, 105);
    }
    ctx.fillRect(0, 48, this.width, 4);

    // 수련 깃발 / 족자
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(150, 8, 60, 60);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('百鍊成鋼', 180, 44); // 백련성강

    // 바닥 (다다미 & 모래 수련장)
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(0, 105, this.width, 115);
    ctx.fillStyle = '#a16207';
    for (let y = 105; y < this.height; y += 20) {
      ctx.fillRect(0, y, this.width, 2);
    }

    // 목각 허수아비 훈련 인형 (우측)
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(290, 62, 10, 48); // 몸통
    ctx.fillRect(278, 76, 34, 8); // 팔
    ctx.fillStyle = '#fde047';
    ctx.fillRect(288, 48, 14, 14); // 짚 머리
    ctx.fillStyle = '#451a03';
    ctx.fillRect(294, 110, 2, 10); // 기둥

    // 역기 / 덤벨 (좌측 바닥)
    ctx.fillStyle = '#334155';
    ctx.fillRect(40, 135, 40, 4); // 바
    ctx.fillRect(36, 127, 6, 20); // 원판
    ctx.fillRect(78, 127, 6, 20);
    ctx.fillRect(32, 130, 4, 14);
    ctx.fillRect(84, 130, 4, 14);
  }

  drawForest(ctx, t) {
    // 숲 상단 (어두운 녹색 그라데이션)
    const grad = ctx.createLinearGradient(0, 0, 0, 115);
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(1, '#022c22');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, 115);

    // 빛줄기 (God rays)
    ctx.fillStyle = 'rgba(254, 240, 138, 0.08)';
    ctx.beginPath();
    ctx.moveTo(80, 0);
    ctx.lineTo(130, 0);
    ctx.lineTo(185, 120);
    ctx.lineTo(115, 120);
    ctx.fill();

    // 나무 기둥들
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, 0, 28, 120);
    ctx.fillRect(310, 0, 34, 125);
    ctx.fillRect(90, 20, 18, 95);

    // 나뭇잎 군락
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.arc(40, 24, 46, 0, Math.PI * 2);
    ctx.arc(130, 16, 42, 0, Math.PI * 2);
    ctx.arc(280, 20, 50, 0, Math.PI * 2);
    ctx.arc(330, 32, 55, 0, Math.PI * 2);
    ctx.fill();

    // 숲 바닥 (이끼 낀 흙)
    ctx.fillStyle = '#14532d';
    ctx.fillRect(0, 105, this.width, 115);
    ctx.fillStyle = '#166534';
    ctx.fillRect(0, 115, this.width, 35);

    // 신비로운 반딧불이 입자
    for (let i = 0; i < 5; i++) {
      const fx = (Math.sin(t * 1.2 + i * 2) * 50) + (70 * i) + 40;
      const fy = (Math.cos(t * 1.5 + i * 1.7) * 18) + 70;
      ctx.fillStyle = 'rgba(167, 243, 208, 0.7)';
      ctx.fillRect(fx, fy, 3, 3);
    }
  }

  drawCave(ctx, t) {
    // 어두운 동굴 벽
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.width, this.height);

    // 종유석 (위)
    ctx.fillStyle = '#1e293b';
    for (let i = 0; i < 10; i++) {
      const sx = i * 38;
      const sh = 20 + ((i * 17) % 30);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx + 18, sh);
      ctx.lineTo(sx + 36, 0);
      ctx.fill();
    }

    // 동굴 바닥
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 108, this.width, 112);

    // 빛나는 수정 (보라색, 청록색 펄스)
    const pulse = 0.6 + Math.sin(t * 2) * 0.3;
    ctx.fillStyle = `rgba(168, 85, 247, ${pulse})`;
    ctx.beginPath();
    ctx.moveTo(30, 120);
    ctx.lineTo(36, 92);
    ctx.lineTo(44, 122);
    ctx.fill();

    ctx.fillStyle = `rgba(56, 189, 248, ${pulse})`;
    ctx.beginPath();
    ctx.moveTo(315, 118);
    ctx.lineTo(323, 88);
    ctx.lineTo(332, 120);
    ctx.fill();

    // 벽면 횃불
    const flick = (Math.sin(t * 15) * 2);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(175, 45, 8, 20);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(179, 42 + flick, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(179, 42 + flick, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawDungeon(ctx, t) {
    // 붉은 악마의 마기 하늘
    ctx.fillStyle = '#180828';
    ctx.fillRect(0, 0, this.width, this.height);

    // 벽돌 무늬
    ctx.fillStyle = '#311245';
    for (let y = 0; y < 105; y += 18) {
      const offset = (y % 36 === 0) ? 0 : 15;
      for (let x = offset; x < this.width; x += 30) {
        ctx.strokeRect(x, y, 28, 16);
      }
    }

    // 중앙 돌다리 / 결전의 제단 (발판 위치와 정렬)
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(45, 105, 270, 36);
    ctx.fillStyle = '#4338ca';
    ctx.fillRect(45, 105, 270, 4);

    // 용암 강 (하단)
    const flow = (t * 20) % 20;
    const lgrad = ctx.createLinearGradient(0, 140, 0, 220);
    lgrad.addColorStop(0, '#dc2626');
    lgrad.addColorStop(1, '#f97316');
    ctx.fillStyle = lgrad;
    ctx.fillRect(0, 140, this.width, 80);

    // 용암 거품
    for (let i = 0; i < 4; i++) {
      const bx = (i * 90 + flow * 2) % this.width;
      const by = 165 + Math.sin(t * 3 + i) * 6;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 사슬 장식
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 0);
    ctx.lineTo(80, 55);
    ctx.moveTo(280, 0);
    ctx.lineTo(280, 55);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  drawDragonLair(ctx, t) {
    // 멸망의 용 둥지 화산 하늘
    const grad = ctx.createLinearGradient(0, 0, 0, 110);
    grad.addColorStop(0, '#1c0404');
    grad.addColorStop(1, '#450a0a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, 110);

    // 원경 검은 화산 산맥
    ctx.fillStyle = '#260808';
    ctx.beginPath();
    ctx.moveTo(0, 110);
    ctx.lineTo(60, 45);
    ctx.lineTo(130, 90);
    ctx.lineTo(200, 35);
    ctx.lineTo(270, 85);
    ctx.lineTo(360, 40);
    ctx.lineTo(360, 110);
    ctx.fill();

    // 화산 용암 줄기
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 45);
    ctx.lineTo(75, 110);
    ctx.moveTo(200, 35);
    ctx.lineTo(185, 110);
    ctx.stroke();
    ctx.lineWidth = 1;

    // 용의 결전 흑요석 제단
    ctx.fillStyle = '#18181b';
    ctx.fillRect(40, 105, 280, 38);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(40, 105, 280, 3);

    // 하단 끓어오르는 용암 바다
    const flow = (t * 25) % 20;
    const lgrad = ctx.createLinearGradient(0, 140, 0, 220);
    lgrad.addColorStop(0, '#ea580c');
    lgrad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = lgrad;
    ctx.fillRect(0, 140, this.width, 80);

    // 날리는 화산재 및 불티 파티클
    for (let i = 0; i < 7; i++) {
      const ex = (Math.sin(t * 2 + i * 3) * 60) + (50 * i) + 20;
      const ey = 130 - ((t * 40 + i * 25) % 130);
      ctx.fillStyle = i % 2 === 0 ? '#fde047' : '#f97316';
      ctx.fillRect(ex, ey, 2, 2);
    }
  }

  drawFrozenAbyss(ctx, t) {
    // 혹한의 빙결 하늘
    const grad = ctx.createLinearGradient(0, 0, 0, 110);
    grad.addColorStop(0, '#021827');
    grad.addColorStop(1, '#075985');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, 110);

    // 원경 거대 빙하 산맥
    ctx.fillStyle = '#0c4a6e';
    ctx.beginPath();
    ctx.moveTo(0, 110);
    ctx.lineTo(45, 30);
    ctx.lineTo(95, 80);
    ctx.lineTo(160, 20);
    ctx.lineTo(240, 75);
    ctx.lineTo(310, 35);
    ctx.lineTo(360, 110);
    ctx.fill();

    // 중경 빛나는 얼음 첨탑
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(130, 110);
    ctx.lineTo(160, 25);
    ctx.lineTo(190, 110);
    ctx.fill();

    // 상단 얼음 고드름
    ctx.fillStyle = '#bae6fd';
    for (let i = 0; i < 12; i++) {
      const ix = i * 30 + 5;
      const ih = 15 + ((i * 13) % 25);
      ctx.beginPath();
      ctx.moveTo(ix, 0);
      ctx.lineTo(ix + 10, ih);
      ctx.lineTo(ix + 20, 0);
      ctx.fill();
    }

    // 빙결 결전 바닥 (만년설 제단)
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(35, 105, 290, 38);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(35, 105, 290, 3); // 얼음 반사 라인

    // 하단 심연의 얼음 크레바스
    const igrad = ctx.createLinearGradient(0, 140, 0, 220);
    igrad.addColorStop(0, '#0284c7');
    igrad.addColorStop(1, '#082f49');
    ctx.fillStyle = igrad;
    ctx.fillRect(0, 140, this.width, 80);

    // 흩날리는 혹한의 눈보라
    for (let i = 0; i < 18; i++) {
      const sx = ((t * 80 + i * 28) % (this.width + 40)) - 20;
      const sy = (t * 50 + i * 22) % this.height;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillRect(sx, sy, 2, 2);
    }
  }

  drawCelestialTower(ctx, t) {
    // 성운이 소용돌이치는 우주 심연
    const grad = ctx.createLinearGradient(0, 0, 0, 110);
    grad.addColorStop(0, '#050212');
    grad.addColorStop(1, '#2e1065');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, 110);

    // 신비로운 보라빛 성운
    const pulse = 0.2 + Math.sin(t * 1.5) * 0.1;
    ctx.fillStyle = `rgba(168, 85, 247, ${pulse})`;
    ctx.beginPath();
    ctx.ellipse(180, 50, 140, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // 반짝이는 별빛들
    for (let i = 0; i < 20; i++) {
      const bx = (i * 27 + 11) % this.width;
      const by = (i * 17 + 7) % 95;
      const twinkle = Math.sin(t * 4 + i) > 0.3;
      if (twinkle) {
        ctx.fillStyle = i % 3 === 0 ? '#fde047' : '#ffffff';
        ctx.fillRect(bx, by, 2, 2);
      }
    }

    // 좌우 부유하는 천공의 오벨리스크
    const f1 = Math.sin(t * 2) * 5;
    const f2 = Math.cos(t * 2) * 5;
    ctx.fillStyle = '#475569';
    ctx.fillRect(15, 30 + f1, 16, 55); // 좌측 탑
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(19, 35 + f1, 8, 4); // 황금 룬

    ctx.fillStyle = '#475569';
    ctx.fillRect(329, 30 + f2, 16, 55); // 우측 탑
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(333, 35 + f2, 8, 4);

    // 신화의 천상 대리석 제단
    ctx.fillStyle = '#334155';
    ctx.fillRect(30, 105, 300, 38);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(30, 105, 300, 3); // 황금 테두리
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(30, 108, 300, 1);

    // 하단 공허의 심연 안개
    const cgrad = ctx.createLinearGradient(0, 140, 0, 220);
    cgrad.addColorStop(0, '#581c87');
    cgrad.addColorStop(1, '#090514');
    ctx.fillStyle = cgrad;
    ctx.fillRect(0, 140, this.width, 80);

    // 상승하는 신성한 마나 입자
    for (let i = 0; i < 8; i++) {
      const mx = (i * 45 + 15) % this.width;
      const my = 210 - ((t * 45 + i * 20) % 80);
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#c084fc';
      ctx.fillRect(mx, my, 2, 2);
    }
  }

  drawStage(locationId, isBattle) {
    const ctx = this.ctx;
    // 발판 그림자 (Y위치 상향 조정 172 -> 132)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    if (isBattle) {
      // 좌측 정진우 발판 그림자
      ctx.beginPath();
      ctx.ellipse(95, 132, 28, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // 우측 몬스터 발판 그림자
      ctx.beginPath();
      ctx.ellipse(250, 132, 34, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 중앙 단독 그림자
      ctx.beginPath();
      ctx.ellipse(180, 132, 32, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawPixelCloud(x, y, w) {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y + 6, w, 12);
    ctx.fillRect(x + 8, y, w - 16, 18);
    ctx.fillRect(x + 14, y - 4, w - 28, 8);
  }

  // --- 정진우 픽셀 캐릭터 그리기 ---
  drawPlayer(x, y, stats, equipped) {
    const ctx = this.ctx;
    const t = this.animTime;
    const state = this.playerState;

    // 기본 바운스 (숨쉬기)
    let offsetY = Math.sin(t * 3.5) * 2;
    let armRot = 0;
    let weaponX = x + 16;
    let weaponY = y + offsetY + 6;

    if (state === 'train') {
      offsetY = (Math.sin(t * 12) > 0 ? -4 : 2);
    } else if (state === 'study') {
      offsetY = 1;
    } else if (state === 'attack') {
      offsetY = -2;
      weaponX = x + 24;
      weaponY = y - 4;
    } else if (state === 'victory') {
      offsetY = -Math.abs(Math.sin(t * 8) * 8);
    } else if (state === 'hurt') {
      offsetY = 2;
      x -= 6;
    }

    ctx.save();
    ctx.translate(x, y + offsetY);

    // 0. 영웅 등급 망토 (레벨 5 이상이거나 고급 갑옷 착용 시)
    const hasCape = (stats.level >= 5) || (equipped.armor && equipped.armor.grade === 'epic');
    if (hasCape) {
      ctx.fillStyle = '#b91c1c'; // 붉은 영웅 망토
      const wave = Math.sin(t * 5) * 4;
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.lineTo(-18 + wave, 32);
      ctx.lineTo(-4, 32);
      ctx.lineTo(-6, 8);
      ctx.fill();
    }

    // 1. 다리 / 바지
    ctx.fillStyle = '#1e293b'; // 짙은 네이비 바지
    ctx.fillRect(-8, 20, 6, 12); // 왼다리
    ctx.fillRect(2, 20, 6, 12);  // 오른다리
    // 신발
    ctx.fillStyle = '#78350f'; // 가죽 부츠
    ctx.fillRect(-9, 30, 8, 4);
    ctx.fillRect(1, 30, 8, 4);

    // 2. 몸통 & 갑옷
    const armorTier = equipped.armor ? equipped.armor.grade : 'common';
    let bodyColor = '#2563eb'; // 기본 수련복 파랑
    let trimColor = '#60a5fa';

    if (armorTier === 'uncommon') {
      bodyColor = '#78350f'; // 가죽 갑옷
      trimColor = '#d97706';
    } else if (armorTier === 'rare') {
      bodyColor = '#475569'; // 강철 판금
      trimColor = '#94a3b8';
    } else if (armorTier === 'epic') {
      bodyColor = '#7c3aed'; // 성기사 보라&골드
      trimColor = '#fbbf24';
    }

    ctx.fillStyle = bodyColor;
    ctx.fillRect(-10, 4, 20, 18); // 상체
    // 벨트
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-10, 18, 20, 3);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-3, 17, 6, 5); // 버클

    // 갑옷 장식 라인
    ctx.fillStyle = trimColor;
    ctx.fillRect(-8, 6, 3, 11);
    ctx.fillRect(5, 6, 3, 11);

    // 3. 머리 & 얼굴 (정진우)
    // 목
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(-3, 1, 6, 4);

    // 얼굴 피부
    ctx.fillStyle = '#fce7f3';
    ctx.fillRect(-9, -14, 18, 16);

    // 귀
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(-11, -8, 2, 5);
    ctx.fillRect(9, -8, 2, 5);

    // 눈 (반짝이는 눈동자)
    const blink = Math.sin(t * 1.5) > 0.96 && state === 'idle';
    if (blink || state === 'hurt') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6, -6, 4, 1);
      ctx.fillRect(2, -6, 4, 1);
    } else if (state === 'victory') {
      // 웃는 눈 ^ ^
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6, -7, 4, 2);
      ctx.fillRect(2, -7, 4, 2);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6, -7, 3, 4);
      ctx.fillRect(3, -7, 3, 4);
      // 눈 하이라이트
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -7, 1, 1);
      ctx.fillRect(3, -7, 1, 1);
    }

    // 머리카락 (정진우 스타일리시 흑발)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, -18, 20, 6); // 윗머리
    ctx.fillRect(-10, -14, 3, 10); // 옆머리 좌
    ctx.fillRect(7, -14, 3, 10);  // 옆머리 우
    // 앞머리 갈래
    ctx.fillRect(-5, -13, 3, 4);
    ctx.fillRect(1, -14, 4, 5);
    ctx.fillRect(-1, -12, 3, 3);

    // 머리띠/서클릿 (레벨 3 이상)
    if (stats.level >= 3) {
      ctx.fillStyle = stats.level >= 5 ? '#f59e0b' : '#3b82f6';
      ctx.fillRect(-10, -14, 20, 3);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-2, -15, 4, 4);
    }

    // 4. 팔과 손 & 무기
    if (state === 'victory') {
      // 만세 포즈
      ctx.fillStyle = bodyColor;
      ctx.fillRect(-14, -4, 5, 12);
      ctx.fillRect(9, -4, 5, 12);
      ctx.fillStyle = '#fce7f3';
      ctx.fillRect(-14, -8, 5, 5);
      ctx.fillRect(9, -8, 5, 5);
    } else if (state === 'study') {
      // 책 들고 있는 포즈
      ctx.fillStyle = bodyColor;
      ctx.fillRect(-12, 6, 6, 10);
      ctx.fillRect(6, 6, 6, 10);
      // 책
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-8, 4, 16, 12);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-6, 6, 12, 8);
    } else {
      // 일반 대기 또는 공격 팔
      ctx.fillStyle = bodyColor;
      ctx.fillRect(-13, 6, 5, 12);
      ctx.fillRect(8, 6, 5, 12);
      ctx.fillStyle = '#fce7f3';
      ctx.fillRect(-13, 16, 5, 4);
      ctx.fillRect(8, 16, 5, 4);
    }

    // 5. 무기 렌더링
    this.drawEquippedWeapon(ctx, equipped.weapon, state);

    // 6. 특수 액션 연출 (덤벨, 전구, 땀방울 등)
    if (state === 'train') {
      // 머리 위 땀방울
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(10, -20, 3, 4);
      // 들고 있는 덤벨
      ctx.fillStyle = '#475569';
      ctx.fillRect(-18, -2, 36, 4);
      ctx.fillRect(-20, -7, 4, 14);
      ctx.fillRect(16, -7, 4, 14);
    } else if (state === 'study') {
      // 머리 위 번뜩이는 전구
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, -26, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(-2, -20, 4, 3);
    } else if (state === 'attack') {
      // 검격 슬래시 이펙트
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(20, 10, 24, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    ctx.restore();
  }

  drawEquippedWeapon(ctx, weapon, state) {
    if (state === 'train' || state === 'study') return;

    const wType = weapon ? weapon.id : 'wp_wood_stick';
    const isEpic = weapon && weapon.grade === 'epic';
    const isRare = weapon && weapon.grade === 'rare';

    ctx.save();
    ctx.translate(13, 14);

    if (state === 'attack') {
      ctx.rotate(Math.PI / 3);
    } else {
      ctx.rotate(-Math.PI / 6);
    }

    // 자루 손잡이
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2, 0, 4, 8);
    // 가드
    ctx.fillStyle = isEpic ? '#fbbf24' : '#64748b';
    ctx.fillRect(-6, -2, 12, 3);

    // 검날
    let bladeColor = '#cbd5e1';
    if (wType === 'wp_wood_stick') bladeColor = '#a16207';
    if (isRare) bladeColor = '#67e8f9'; // 미스릴
    if (isEpic) bladeColor = '#fef08a'; // 용사의 성검

    ctx.fillStyle = bladeColor;
    ctx.fillRect(-2, -26, 4, 24);
    // 끝 날카로운 끝
    ctx.beginPath();
    ctx.moveTo(-2, -26);
    ctx.lineTo(0, -32);
    ctx.lineTo(2, -26);
    ctx.fill();

    // 성검 빛나는 오라
    if (isEpic) {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
      ctx.fillRect(-4, -28, 8, 26);
    }

    ctx.restore();
  }

  // --- 몬스터 그리기 ---
  drawMonster(monster, x, y) {
    const ctx = this.ctx;
    const t = this.animTime;
    const state = this.monsterState;

    let bounceY = Math.sin(t * 4) * 3;
    let hitOffsetX = 0;

    if (state === 'hurt') {
      hitOffsetX = 6;
      bounceY = 2;
    } else if (state === 'attack') {
      hitOffsetX = -10;
    }

    ctx.save();
    ctx.translate(x + hitOffsetX, y + bounceY);

    // 광폭화 붉은 오라 효과
    if (monster.isRaged) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      const pulse = Math.sin(t * 12) * 4;
      ctx.beginPath();
      ctx.ellipse(0, 8, 28 + pulse, 28 + pulse, 0, 0, Math.PI * 2);
      ctx.fill();

      // 분노 화염 입자
      for (let i = 0; i < 3; i++) {
        const rx = (Math.sin(t * 8 + i * 2) * 18);
        const ry = -5 - ((t * 35 + i * 15) % 30);
        ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#f59e0b';
        ctx.fillRect(rx, ry, 3, 3);
      }
    }

    // 방어막(Shield) 푸른 에너지 결계 오라
    if (monster.shield > 0) {
      const spulse = Math.sin(t * 8) * 3;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 10, 32 + spulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fill();
      ctx.lineWidth = 1;
    }

    // 반격 자세(Counter Stance) 황금 가시 방벽
    if (monster.isCounterStanceActive) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const rx = Math.cos(a + t * 4) * 36;
        const ry = Math.sin(a + t * 4) * 36 + 10;
        ctx.beginPath();
        ctx.moveTo(rx * 0.75, ry * 0.75);
        ctx.lineTo(rx, ry);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
    }

    // 2단계 각성 보스 보라색 성운 오라
    if (monster.isPhaseAwakened) {
      ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
      const cpulse = Math.sin(t * 10) * 6;
      ctx.beginPath();
      ctx.ellipse(0, 10, 38 + cpulse, 38 + cpulse, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    switch (monster.sprite) {
      case 'slime':
        this.drawSlimeSprite(ctx, t, monster);
        break;
      case 'wolf':
        this.drawWolfSprite(ctx, t, monster);
        break;
      case 'goblin':
      case 'goblin_elite':
        this.drawGoblinSprite(ctx, t, monster);
        break;
      case 'ent':
        this.drawEntSprite(ctx, t, monster);
        break;
      case 'bat':
        this.drawBatSprite(ctx, t, monster);
        break;
      case 'scorpion':
        this.drawScorpionSprite(ctx, t, monster);
        break;
      case 'orc':
      case 'orc_chief':
        this.drawOrcSprite(ctx, t, monster);
        break;
      case 'troll':
        this.drawTrollSprite(ctx, t, monster);
        break;
      case 'necromancer':
        this.drawNecromancerSprite(ctx, t, monster);
        break;
      case 'death_knight':
        this.drawDeathKnightSprite(ctx, t, monster);
        break;
      case 'drake':
        this.drawDrakeSprite(ctx, t, monster);
        break;
      case 'dragon':
        this.drawDragonSprite(ctx, t, monster);
        break;
      case 'boss':
        this.drawBossSprite(ctx, t, monster);
        break;
      case 'hound':
        this.drawHoundSprite(ctx, t, monster);
        break;
      case 'frost_wolf':
        this.drawFrostWolfSprite(ctx, t, monster);
        break;
      case 'frost_golem':
        this.drawFrostGolemSprite(ctx, t, monster);
        break;
      case 'lich_king':
        this.drawLichKingSprite(ctx, t, monster);
        break;
      case 'celestial_sentinel':
        this.drawCelestialSentinelSprite(ctx, t, monster);
        break;
      case 'void_herald':
        this.drawVoidHeraldSprite(ctx, t, monster);
        break;
      case 'chaos_overlord':
        this.drawChaosOverlordSprite(ctx, t, monster);
        break;
      default:
        this.drawSlimeSprite(ctx, t, monster);
    }

    // 몬스터 상단 HP & 방어막 바
    this.drawEntityHpBar(ctx, `${monster.isRaged ? '🔥[광폭] ' : ''}${monster.name}`, monster.hp, monster.maxHp, monster.shield, monster.maxShield);

    ctx.restore();
  }

  drawSlimeSprite(ctx, t, monster) {
    const squish = Math.sin(t * 5) * 2;
    ctx.fillStyle = monster.color || '#34d399';

    // 젤리 몸체
    ctx.beginPath();
    ctx.ellipse(0, 15, 22 + squish, 18 - squish, 0, 0, Math.PI * 2);
    ctx.fill();

    // 하이라이트
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(-8, 8, 5, 3, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // 눈
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-7, 12, 3, 5);
    ctx.fillRect(4, 12, 3, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-7, 12, 1, 2);
    ctx.fillRect(4, 12, 1, 2);
  }

  drawGoblinSprite(ctx, t, monster) {
    const isElite = monster.sprite === 'goblin_elite';

    // 다리
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-8, 22, 5, 10);
    ctx.fillRect(3, 22, 5, 10);

    // 몸통
    ctx.fillStyle = isElite ? '#ca8a04' : '#84cc16';
    ctx.fillRect(-10, 6, 20, 18);
    // 가죽 조끼
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-10, 8, 20, 12);

    // 얼굴
    ctx.fillStyle = isElite ? '#eab308' : '#84cc16';
    ctx.fillRect(-10, -12, 20, 16);

    // 뾰족한 고블린 귀
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(-18, -12);
    ctx.lineTo(-10, -2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10, -6);
    ctx.lineTo(18, -12);
    ctx.lineTo(10, -2);
    ctx.fill();

    // 눈 (노란 눈동자)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-7, -6, 4, 4);
    ctx.fillRect(3, -6, 4, 4);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-5, -5, 2, 2);
    ctx.fillRect(5, -5, 2, 2);

    // 단검
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-16, 8, 5, 14);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-15, 6, 3, 4);
  }

  drawOrcSprite(ctx, t, monster) {
    const isChief = monster.sprite === 'orc_chief';

    // 거대한 다리
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-12, 22, 8, 12);
    ctx.fillRect(4, 22, 8, 12);

    // 거구의 몸통
    ctx.fillStyle = isChief ? '#b91c1c' : '#15803d';
    ctx.fillRect(-16, 2, 32, 22);

    // 가시 달린 어깨 갑옷
    ctx.fillStyle = '#475569';
    ctx.fillRect(-20, 0, 10, 10);
    ctx.fillRect(10, 0, 10, 10);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-18, -5, 4, 6);
    ctx.fillRect(14, -5, 4, 6);

    // 머리
    ctx.fillStyle = isChief ? '#991b1b' : '#166534';
    ctx.fillRect(-12, -18, 24, 20);

    // 엄니 (Tusks)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-8, -4, 3, 6);
    ctx.fillRect(5, -4, 3, 6);

    // 붉은 분노의 눈
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-8, -12, 5, 4);
    ctx.fillRect(3, -12, 5, 4);

    // 거대한 뼈 곤봉 또는 배틀액스
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-26, -14, 6, 40);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-32, -22, 18, 14);
  }

  drawBossSprite(ctx, t, monster) {
    // 던전 보스: 심연의 군주 (거대하고 위압적인 보스)
    // 검은 오라 날개
    ctx.fillStyle = 'rgba(126, 34, 206, 0.4)';
    const flap = Math.sin(t * 3) * 6;
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(-45, -40 + flap);
    ctx.lineTo(-30, 20);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10, -10);
    ctx.lineTo(45, -40 + flap);
    ctx.lineTo(30, 20);
    ctx.fill();

    // 흑철 갑옷 다리
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-16, 22, 12, 16);
    ctx.fillRect(4, 22, 12, 16);

    // 흉포한 상체
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-22, -2, 44, 26);
    ctx.fillStyle = '#dc2626'; // 마기 코어
    ctx.fillRect(-4, 6, 8, 8);

    // 투구 & 뿔
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-16, -26, 32, 24);

    // 거대한 악마의 뿔
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(-16, -20);
    ctx.lineTo(-30, -38);
    ctx.lineTo(-12, -26);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(16, -20);
    ctx.lineTo(30, -38);
    ctx.lineTo(12, -26);
    ctx.fill();

    // 번뜩이는 보랏빛 눈빛
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-10, -16, 6, 4);
    ctx.fillRect(4, -16, 6, 4);

    // 심연의 대검
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-32, -32, 6, 55);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-36, -6, 14, 5);
  }

  drawWolfSprite(ctx, t, monster) {
    // 늑대 다리 4개
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-14, 18, 4, 14);
    ctx.fillRect(-8, 18, 4, 14);
    ctx.fillRect(4, 18, 4, 14);
    ctx.fillRect(10, 18, 4, 14);

    // 몸통 및 등 갈기
    ctx.fillStyle = '#475569';
    ctx.fillRect(-16, 6, 28, 14);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-16, 2, 24, 6);

    // 꼬리 흔들기
    const tw = Math.sin(t * 8) * 3;
    ctx.fillStyle = '#334155';
    ctx.fillRect(-22, 4 + tw, 8, 6);

    // 머리와 주둥이 (좌측 정진우를 노려봄)
    ctx.fillStyle = '#475569';
    ctx.fillRect(6, -4, 16, 14);
    ctx.fillRect(16, 2, 8, 8); // 주둥이
    // 송곳니
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(18, 8, 2, 4);

    // 뾰족한 귀
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(8, -4);
    ctx.lineTo(12, -12);
    ctx.lineTo(16, -4);
    ctx.fill();

    // 붉은 사냥꾼의 눈
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(12, -1, 3, 3);
  }

  drawEntSprite(ctx, t, monster) {
    // 고대 나무정령 앤트 (거대 보스)
    // 뿌리 다리
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-14, 20, 10, 14);
    ctx.fillRect(4, 20, 10, 14);

    // 거목 몸통
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-18, -4, 36, 26);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-12, 2, 6, 14);
    ctx.fillRect(6, 6, 6, 12);

    // 머리 위 풍성한 나뭇잎 관
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.arc(0, -18, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(-8, -22, 14, 0, Math.PI * 2);
    ctx.arc(8, -22, 14, 0, Math.PI * 2);
    ctx.fill();

    // 신비로운 황금빛 눈
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-8, -10, 5, 4);
    ctx.fillRect(3, -10, 5, 4);

    // 거대한 나무 뿌리 곤봉 팔
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-26, -10, 8, 35);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-30, -18, 16, 12);
  }

  drawBatSprite(ctx, t, monster) {
    // 흡혈 암흑 박쥐 (체공 중)
    const flap = Math.sin(t * 10) * 10;

    // 날개 (좌/우 펄럭임)
    ctx.fillStyle = '#312e81';
    ctx.beginPath();
    ctx.moveTo(-6, 2);
    ctx.lineTo(-26, -16 + flap);
    ctx.lineTo(-14, 18);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(6, 2);
    ctx.lineTo(26, -16 + flap);
    ctx.lineTo(14, 18);
    ctx.fill();

    // 몸통
    ctx.fillStyle = '#4338ca';
    ctx.beginPath();
    ctx.ellipse(0, 4, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 귀
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.lineTo(-8, -16);
    ctx.lineTo(-2, -6);
    ctx.moveTo(6, -6);
    ctx.lineTo(8, -16);
    ctx.lineTo(2, -6);
    ctx.fill();

    // 붉은 눈과 송곳니
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-4, -2, 2, 3);
    ctx.fillRect(2, -2, 2, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, 4, 1, 3);
    ctx.fillRect(2, 4, 1, 3);
  }

  drawScorpionSprite(ctx, t, monster) {
    // 맹독 수정 전갈
    // 다리들
    ctx.fillStyle = '#0e7490';
    for (let i = -10; i <= 10; i += 5) {
      ctx.fillRect(i, 16, 2, 10);
    }

    // 전갈 몸체
    ctx.fillStyle = '#0891b2';
    ctx.fillRect(-12, 6, 24, 12);

    // 좌측 집게발
    const claw = Math.sin(t * 6) * 3;
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(-22 + claw, 4, 10, 6);
    ctx.fillRect(-24 + claw, 0, 4, 8);

    // 꼬리 (등 위로 아치형으로 솟음)
    ctx.fillStyle = '#0891b2';
    ctx.fillRect(10, 0, 6, 8);
    ctx.fillRect(8, -8, 6, 8);
    ctx.fillRect(2, -14, 8, 6);

    // 빛나는 맹독침
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.moveTo(2, -14);
    ctx.lineTo(-6, -16);
    ctx.lineTo(2, -10);
    ctx.fill();

    // 눈빛
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-10, 8, 2, 2);
    ctx.fillRect(-10, 12, 2, 2);
  }

  drawTrollSprite(ctx, t, monster) {
    // 동굴 바위 트롤 (거구 보스)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-14, 20, 10, 14);
    ctx.fillRect(4, 20, 10, 14);

    // 암석 몸통
    ctx.fillStyle = '#334155';
    ctx.fillRect(-18, 0, 36, 24);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-14, 4, 12, 10);

    // 머리와 돌 턱
    ctx.fillStyle = '#334155';
    ctx.fillRect(-14, -18, 28, 20);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10, -4, 20, 6); // 턱

    // 눈 (광폭화 시 더 밝게 붉어짐)
    ctx.fillStyle = monster.isRaged ? '#ff0000' : '#f87171';
    ctx.fillRect(-8, -12, 4, 4);
    ctx.fillRect(4, -12, 4, 4);

    // 거대한 바위 곤봉
    ctx.fillStyle = '#78716c';
    ctx.fillRect(-30, -20, 12, 45);
    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(-32, -26, 16, 16);
  }

  drawNecromancerSprite(ctx, t, monster) {
    // 심연의 흑마법사
    const hover = Math.sin(t * 3) * 4;

    // 떠 있는 로브
    ctx.fillStyle = '#3b0764';
    ctx.beginPath();
    ctx.moveTo(0, -18 + hover);
    ctx.lineTo(-16, 24 + hover);
    ctx.lineTo(16, 24 + hover);
    ctx.fill();

    // 두건과 어둠 속의 보랏빛 안광
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-8, -20 + hover, 16, 16);
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(-5, -14 + hover, 3, 3);
    ctx.fillRect(2, -14 + hover, 3, 3);

    // 해골 마법 지팡이
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-22, -24 + hover, 4, 46);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-26, -30 + hover, 12, 8); // 해골 두개골
    // 지팡이 끝 암흑 불꽃
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(-20, -32 + hover, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawDeathKnightSprite(ctx, t, monster) {
    // 사령기사 데스나이트
    // 흑철 판금 갑옷 다리
    ctx.fillStyle = '#020617';
    ctx.fillRect(-12, 20, 8, 14);
    ctx.fillRect(4, 20, 8, 14);

    // 상체 갑옷 및 너덜너덜한 청록색 망토
    ctx.fillStyle = '#0891b2';
    const cape = Math.sin(t * 4) * 3;
    ctx.fillRect(10, 4, 8 + cape, 24);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-14, 0, 28, 22);

    // 흉갑의 영혼 해골 문양
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(-4, 6, 8, 8);

    // 기괴한 뿔 투구
    ctx.fillStyle = '#020617';
    ctx.fillRect(-12, -22, 24, 22);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-16, -18, 4, 10);
    ctx.fillRect(12, -18, 4, 10);

    // 얼어붙은 푸른 사령의 눈
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-8, -14, 4, 3);
    ctx.fillRect(4, -14, 4, 3);

    // 사령 룬소드 대검
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-28, -26, 6, 52);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-26, -18, 2, 16); // 룬 문자 빛
  }

  drawDrakeSprite(ctx, t, monster) {
    // 화염 드레이크
    // 다리
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(-14, 20, 6, 12);
    ctx.fillRect(8, 20, 6, 12);

    // 몸통
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-18, 4, 32, 18);

    // 날개
    const flap = Math.sin(t * 5) * 6;
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.moveTo(-4, 4);
    ctx.lineTo(-24, -20 + flap);
    ctx.lineTo(-6, 12);
    ctx.fill();

    // 용 머리와 뿔
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(10, -8, 16, 14);
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(16, -16, 4, 8); // 뿔

    // 불타는 눈
    ctx.fillStyle = '#fde047';
    ctx.fillRect(14, -4, 4, 4);
  }

  drawDragonSprite(ctx, t, monster) {
    // 태고의 흑염룡 바하무트 (신화 최강 보스)
    // 거대한 악마 날개
    const flap = Math.sin(t * 3.5) * 8;
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(-55, -45 + flap);
    ctx.lineTo(-30, 25);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10, -5);
    ctx.lineTo(55, -45 + flap);
    ctx.lineTo(30, 25);
    ctx.fill();

    // 날개 붉은 피막
    ctx.fillStyle = 'rgba(220, 38, 38, 0.4)';
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(-50, -40 + flap);
    ctx.lineTo(-28, 20);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(12, -4);
    ctx.lineTo(50, -40 + flap);
    ctx.lineTo(28, 20);
    ctx.fill();

    // 흑룡 다리와 발톱
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-16, 22, 12, 16);
    ctx.fillRect(6, 22, 12, 16);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-18, 34, 4, 4);
    ctx.fillRect(16, 34, 4, 4);

    // 흑룡 몸체와 붉은 배 비늘
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-22, -6, 44, 30);
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-8, 2, 16, 18);

    // 화염 심장 코어
    const corePulse = Math.sin(t * 8) * 2;
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, 10, 5 + corePulse, 0, Math.PI * 2);
    ctx.fill();

    // 흑룡 머리
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-14, -28, 32, 22);

    // 황금빛 거룡 뿔
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-10, -26);
    ctx.lineTo(-24, -45);
    ctx.lineTo(-6, -30);
    ctx.moveTo(10, -26);
    ctx.lineTo(24, -45);
    ctx.lineTo(6, -30);
    ctx.fill();

    // 불타는 황제 용안
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-8, -18, 5, 4);
    ctx.fillRect(4, -18, 5, 4);

    // 입에서 피어나는 화염 입자
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-18, -14, 4, 4);
  }

  // --- 신규 고난도 몬스터 스프라이트 7종 ---

  drawHoundSprite(ctx, t, monster) {
    // 지옥불 마그마 하운드
    const breathe = Math.sin(t * 8) * 2;
    // 다리
    ctx.fillStyle = '#431407';
    ctx.fillRect(-18, 14, 5, 12);
    ctx.fillRect(-8, 14, 5, 12);
    ctx.fillRect(4, 14, 5, 12);
    ctx.fillRect(14, 14, 5, 12);

    // 몸통 (타오르는 마그마)
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(-20, 2, 38, 14 + breathe);
    // 등 뒤 검은 흑요석 돌기
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-16, -2, 6, 6);
    ctx.fillRect(-6, -4, 8, 8);
    ctx.fillRect(6, -2, 6, 6);

    // 머리
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(-28, -8, 14, 14);
    // 불타는 눈
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-26, -5, 4, 3);
    // 입과 송곳니
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-28, 2, 3, 4);
    // 화염 꼬리
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(18, 4, 8, 4);
  }

  drawFrostWolfSprite(ctx, t, monster) {
    // 혹한의 설원 늑대
    const breathe = Math.sin(t * 6) * 2;
    // 다리
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(-16, 14, 5, 14);
    ctx.fillRect(-6, 14, 5, 14);
    ctx.fillRect(6, 14, 5, 14);
    ctx.fillRect(16, 14, 5, 14);

    // 몸통 (은빛/빙결 털)
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(-18, 0, 36, 16 + breathe);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(-14, 4, 28, 8);

    // 머리
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(-26, -10, 14, 14);
    // 귀
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-22, -18, 4, 8);
    ctx.fillRect(-14, -18, 4, 8);
    // 서리 눈빛
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-24, -6, 3, 3);
    // 꼬리
    ctx.fillStyle = '#bae6fd';
    const wave = Math.sin(t * 8) * 3;
    ctx.fillRect(18, 2 + wave, 10, 6);
  }

  drawFrostGolemSprite(ctx, t, monster) {
    // 빙하의 서리 골렘
    const hover = Math.sin(t * 3) * 2;
    // 거대한 빙하 다리
    ctx.fillStyle = '#075985';
    ctx.fillRect(-22, 16, 16, 16);
    ctx.fillRect(6, 16, 16, 16);

    // 육중한 결정체 몸통
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-26, -12 + hover, 52, 30);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-20, -8 + hover, 40, 22);

    // 가슴의 마나 코어 (빛나는 푸른 보석)
    const cpulse = Math.sin(t * 5) * 2;
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(-6, -2 + hover, 12, 10);
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(-4, 0 + hover, 8, 6);

    // 어깨 거대 얼음 뿔
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.moveTo(-26, -12 + hover);
    ctx.lineTo(-38, -28 + hover);
    ctx.lineTo(-16, -12 + hover);
    ctx.moveTo(26, -12 + hover);
    ctx.lineTo(38, -28 + hover);
    ctx.lineTo(16, -12 + hover);
    ctx.fill();

    // 머리 (차가운 얼음 투구)
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(-12, -26 + hover, 24, 16);
    // 눈
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-8, -20 + hover, 4, 4);
    ctx.fillRect(4, -20 + hover, 4, 4);
  }

  drawLichKingSprite(ctx, t, monster) {
    // 빙결의 사령 리치 킹
    const hover = Math.sin(t * 3) * 4;
    // 사령의 찢어진 로브
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-16, 4 + hover);
    ctx.lineTo(-24, 32 + hover);
    ctx.lineTo(24, 32 + hover);
    ctx.lineTo(16, 4 + hover);
    ctx.fill();

    // 로브 청록색 테두리
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-14, 0 + hover, 28, 16);

    // 해골 얼굴
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-10, -18 + hover, 20, 18);
    // 얼어붙은 눈동자 구멍
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-7, -12 + hover, 4, 5);
    ctx.fillRect(3, -12 + hover, 4, 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-6, -11 + hover, 2, 3);
    ctx.fillRect(4, -11 + hover, 2, 3);

    // 빙결의 왕관 (뾰족한 3단 얼음 첨탑)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-12, -18 + hover);
    ctx.lineTo(-10, -32 + hover);
    ctx.lineTo(-4, -18 + hover);
    ctx.lineTo(0, -36 + hover);
    ctx.lineTo(4, -18 + hover);
    ctx.lineTo(10, -32 + hover);
    ctx.lineTo(12, -18 + hover);
    ctx.fill();

    // 영혼 지팡이 (좌측)
    ctx.fillStyle = '#334155';
    ctx.fillRect(-24, -28 + hover, 4, 54);
    // 지팡이 끝 부유하는 냉기 수정 오브
    const opulse = Math.sin(t * 6) * 2;
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.arc(-22, -34 + hover + opulse, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-24, -36 + hover + opulse, 4, 4);
  }

  drawCelestialSentinelSprite(ctx, t, monster) {
    // 천공의 단죄 파수병
    const hover = Math.sin(t * 3.5) * 3;
    // 신성 날개 (부드러운 날갯짓)
    const wingWave = Math.sin(t * 5) * 6;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.beginPath();
    // 좌익
    ctx.moveTo(-12, 0 + hover);
    ctx.lineTo(-42 + wingWave, -20 + hover);
    ctx.lineTo(-24, 20 + hover);
    // 우익
    ctx.moveTo(12, 0 + hover);
    ctx.lineTo(42 - wingWave, -20 + hover);
    ctx.lineTo(24, 20 + hover);
    ctx.fill();

    // 황금빛 신성 갑주 다리
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-10, 14 + hover, 7, 16);
    ctx.fillRect(3, 14 + hover, 7, 16);

    // 황금 상체 흉갑
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-14, -6 + hover, 28, 22);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-8, -2 + hover, 16, 14);

    // 천공의 투구
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-9, -24 + hover, 18, 18);
    // 빛나는 십자 안광
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-6, -17 + hover, 12, 3);
    ctx.fillRect(-1, -21 + hover, 3, 11);

    // 머리 위 신성한 헤일로 (빛의 고리)
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -32 + hover, 16, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  drawVoidHeraldSprite(ctx, t, monster) {
    // 공허의 심연 전령
    const hover = Math.sin(t * 4) * 4;
    // 일렁이는 암흑 공허 망토
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(-18, 0 + hover);
    ctx.lineTo(-26, 32 + hover);
    ctx.lineTo(26, 32 + hover);
    ctx.lineTo(18, 0 + hover);
    ctx.fill();

    // 공허 촉수
    ctx.strokeStyle = '#6b21a8';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const tx = -18 + i * 12;
      const tw = Math.sin(t * 6 + i) * 6;
      ctx.beginPath();
      ctx.moveTo(tx, 26 + hover);
      ctx.quadraticCurveTo(tx + tw, 38 + hover, tx + tw * 1.5, 46 + hover);
      ctx.stroke();
    }
    ctx.lineWidth = 1;

    // 공허 후드
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(-14, -22 + hover, 28, 24);
    // 중앙 거대한 붉은 공허의 눈
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -10 + hover, 9, 0, Math.PI * 2);
    ctx.fill();
    const epulse = Math.sin(t * 8) * 1.5;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -10 + hover, 4 + epulse, 0, Math.PI * 2);
    ctx.fill();
  }

  drawChaosOverlordSprite(ctx, t, monster) {
    // 태초의 혼돈신 카오스 크로노스
    const hover = Math.sin(t * 2.5) * 3;
    // 거대한 심연의 날개/오라
    ctx.fillStyle = 'rgba(76, 29, 149, 0.7)';
    const wp = Math.sin(t * 4) * 8;
    ctx.beginPath();
    ctx.moveTo(-15, 0 + hover);
    ctx.lineTo(-50 + wp, -35 + hover);
    ctx.lineTo(-30, 25 + hover);
    ctx.moveTo(15, 0 + hover);
    ctx.lineTo(50 - wp, -35 + hover);
    ctx.lineTo(30, 25 + hover);
    ctx.fill();

    // 혼돈 신체
    ctx.fillStyle = '#090514';
    ctx.fillRect(-22, -10 + hover, 44, 40);

    // 가슴의 회오리치는 은하 코어
    const rot = t * 3;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(0, 8 + hover, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 8 + hover, 4, 0, Math.PI * 2);
    ctx.fill();

    // 거대한 혼돈의 뿔
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.moveTo(-16, -24 + hover);
    ctx.lineTo(-34, -48 + hover);
    ctx.lineTo(-8, -28 + hover);
    ctx.moveTo(16, -24 + hover);
    ctx.lineTo(34, -48 + hover);
    ctx.lineTo(8, -28 + hover);
    ctx.fill();

    // 머리와 마안
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-14, -28 + hover, 28, 20);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-9, -20 + hover, 5, 4);
    ctx.fillRect(4, -20 + hover, 5, 4);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(-2, -24 + hover, 4, 4); // 제3의 눈

    // 궤도를 공전하는 4개의 암흑 위성 구체
    for (let i = 0; i < 4; i++) {
      const ang = rot + (i * Math.PI / 2);
      const ox = Math.cos(ang) * 44;
      const oy = Math.sin(ang) * 16 + hover + 5;
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(ox, oy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawEntityHpBar(ctx, name, hp, maxHp, shield = 0, maxShield = 0) {
    const barW = 76;
    const barH = 7;
    const bx = -barW / 2;
    const by = -46;

    // 이름
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 0, by - 4);

    // 게이지 배경
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx, by, barW, barH);
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(bx, by, barW, barH);

    // HP 채움
    const pct = Math.max(0, Math.min(1, hp / maxHp));
    ctx.fillStyle = pct > 0.5 ? '#22c55e' : (pct > 0.25 ? '#eab308' : '#ef4444');
    ctx.fillRect(bx + 1, by + 1, (barW - 2) * pct, barH - 2);

    // 방어막(Shield) 바 - 하늘색 바로 HP 바 위에 표시
    if (shield > 0 && maxShield > 0) {
      const sPct = Math.max(0, Math.min(1, shield / maxShield));
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(bx + 1, by - 4, (barW - 2) * sPct, 3);
      ctx.strokeStyle = '#0284c7';
      ctx.strokeRect(bx, by - 4, barW, 3);
    }
  }

  // --- 파티클 & 플로팅 텍스트 렌더링 ---
  renderParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1.0;
  }

  renderFloatingTexts() {
    const ctx = this.ctx;
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, ft.life * 1.5));
      ctx.fillStyle = ft.color;
      ctx.font = `${ft.isCrit ? 'bold ' : ''}${ft.fontSize}px 'NeoDunggeunmo', monospace, sans-serif`;
      ctx.textAlign = 'center';

      // 텍스트 외곽선 (그림자)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
