// Web Audio API 기반 Chiptune 사운드 엔진
// 외부 사운드 파일 의존성 없이 100% 브라우저 내장 오실레이터로 고품질 레트로 효과음 생성

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmMuted = false;
    this.masterGain = null;
    this.bgmGain = null;
    this.bgmTimer = null;
    this.bgmPlaying = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      this.bgmGain.connect(this.ctx.destination);

      this.initialized = true;

      // LocalStorage 설정 복구
      const savedMute = localStorage.getItem('jinu_sound_muted');
      if (savedMute !== null) {
        this.muted = savedMute === 'true';
      }
      const savedBgmMute = localStorage.getItem('jinu_bgm_muted');
      if (savedBgmMute !== null) {
        this.bgmMuted = savedBgmMute === 'true';
      }
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  ensureContext() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('jinu_sound_muted', this.muted);
    return this.muted;
  }

  toggleBgm() {
    this.bgmMuted = !this.bgmMuted;
    localStorage.setItem('jinu_bgm_muted', this.bgmMuted);
    if (this.bgmMuted) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return !this.bgmMuted;
  }

  // --- 효과음 생성 함수들 ---

  // 버튼 클릭음: 짧고 산뜻한 8비트 비프음
  playClick() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // 훈련 수련음: 묵직한 펀치 사운드
  playTrain() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // 공부/독서음: 청명한 지혜의 종소리
  playStudy() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0.1, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.2);
    });
  }

  // 휴식 치유음: 따스한 하모닉스
  playHeal() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [329.63, 392.00, 493.88, 659.25];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.12, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.3);
    });
  }

  // 공격음: 검격 쉭-소리 (화이트 노이즈 버스트 + 스위프)
  playAttack() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // 피격/타격음
  playHit(isCrit = false) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isCrit ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isCrit ? 220 : 160, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    gain.gain.setValueAtTime(isCrit ? 0.4 : 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // 몬스터 처치음: 묵직한 8비트 승리 타격
  playMonsterDefeat() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [240, 180, 120, 80].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.2, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.13);
    });
  }

  // 레벨업 팬파레: C4-E4-G4-C5 아르페지오 환호
  playLevelUp() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.28);
    });
  }

  // 아이템/골드 획득음
  playItemGet() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [587.33, 880.00].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.18, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.2);
    });
  }

  // 퀘스트 완료음: 경쾌한 완료음
  playQuestComplete() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.22, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });
  }

  // 상점 구매음
  playBuy() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [987.77, 1318.51].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.15, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.14);
    });
  }

  // 경고음
  playError() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.setValueAtTime(100, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // 방어막 타격음 (금속성 둔탁한 흡수음)
  playShieldHit() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // 상태이상 정화음 (신비로운 상승 차임)
  playPurify() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.18, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.16);
    });
  }

  // 보스 특수기 경보음
  playBossWarning() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [300, 450, 300, 450].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.15, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.06);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.07);
    });
  }

  // --- 레트로 8비트 RPG 배경 음악 (선택적 토글) ---
  startBgm() {
    if (this.bgmMuted || this.bgmPlaying) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.bgmPlaying = true;
    const chords = [
      [261.63, 329.63, 392.00], // C
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [196.00, 246.94, 293.66]  // G
    ];

    let chordIdx = 0;
    const playNextBar = () => {
      if (!this.bgmPlaying || this.bgmMuted) return;
      const now = this.ctx.currentTime;
      const chord = chords[chordIdx % chords.length];
      chordIdx++;

      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 1.25);
      });

      this.bgmTimer = setTimeout(playNextBar, 1200);
    };

    playNextBar();
  }

  stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const sound = new SoundEngine();
