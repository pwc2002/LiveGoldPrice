"use client";

import Slider from "react-slick";
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Modal from "./Modal";
import YouTube from "react-youtube";

export default function Home() {
  const [gold, setGold] = useState([]);
  const [gold18k, setGold18k] = useState([]);
  const [gold14k, setGold14k] = useState([]);
  const [whitegold, setWhitegold] = useState([]);
  const [silver, setSilver] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [player, setPlayer] = useState(null);
  const [playerKey, setPlayerKey] = useState(0); // 값이 바뀌면 YouTube 플레이어를 새로 생성(remount)
  const [logs, setLogs] = useState([]);          // 화면에 표시할 진단 로그(최신순)
  const [heartbeat, setHeartbeat] = useState(null); // 마지막으로 '정상 재생'을 확인한 시각/위치

  const playerRef = useRef(null);      // 최신 플레이어 인스턴스(이벤트 리스너에서 접근용)
  const logsRef = useRef([]);          // 로그 원본(최신순) — localStorage 저장의 단일 소스
  const resumeTimeRef = useRef(0);     // remount 후 이어서 재생할 위치(초)
  const lastTimeRef = useRef(0);       // 직전 점검 시 재생 위치 — '실제로 흐르는가' 판단용
  const stallTicksRef = useRef(0);     // 연속으로 멈춰있던 점검 횟수
  const hasStartedRef = useRef(false); // 한 번이라도 재생을 시작했는지(최초 재생 전엔 감시 안 함)
  const lastRemountAtRef = useRef(0);  // 마지막 remount 시각(ms) — remount 폭주 방지
  const remountCountRef = useRef(0);   // remount 누적 횟수(로그용)
  const lastHbAtRef = useRef(0);       // 마지막 심장박동 갱신 시각(ms) — 재렌더 줄이려 ~10초 간격

  const LOG_KEY = 'goldway_logs';
  const HEALTHY_KEY = 'goldway_lastHealthy';

  // 화면에 박히는 로그. localStorage에도 저장해 리로드/크래시 후에도 직전 기록이 남도록 한다.
  const addLog = (msg) => {
    const t = new Date().toTimeString().slice(0, 8); // HH:MM:SS
    const next = [`${t}  ${msg}`, ...logsRef.current].slice(0, 40);
    logsRef.current = next;
    setLogs(next);
    try { localStorage.setItem(LOG_KEY, JSON.stringify(next)); } catch (e) {}
  };

  // 어떤 이유로든 멈췄을 때 가장 먼저 시도하는 가벼운 복구: 현재 플레이어에 재생 명령.
  const forcePlay = (reason) => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.playVideo();
      if (reason) addLog(`▶ 재개 시도(${reason})`);
    } catch (e) { addLog(`✗ playVideo 예외: ${e && e.message}`); }
  };

  // 플레이어를 통째로 재생성(remount)하되 직전 위치부터 이어서 재생. 폭주 방지 위해 최소 15초 간격.
  const safeRemount = (atTime) => {
    const now = Date.now();
    if (now - lastRemountAtRef.current < 15000) {
      forcePlay('remount 대기중');
      return;
    }
    lastRemountAtRef.current = now;
    if (atTime > 0) resumeTimeRef.current = atTime;
    stallTicksRef.current = 0;
    remountCountRef.current += 1;
    addLog(`⟳ remount #${remountCountRef.current} → ${Math.floor(resumeTimeRef.current)}s 이어재생`);
    setPlayerKey((k) => k + 1);
  };

  // === 진단 로그 복원 + 전역 에러 캐치 ===
  // 리로드/크래시 후 직전 로그를 불러오고, 예상 못한 JS 오류/Promise 거부까지 화면 로그에 남긴다.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOG_KEY);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) { logsRef.current = arr; setLogs(arr); }
      }
      const lastHealthy = localStorage.getItem(HEALTHY_KEY);
      if (lastHealthy) addLog(`이전 세션 마지막 정상: ${lastHealthy}`);
    } catch (e) {}
    addLog('— 페이지 로드 —'); // 리로드 경계 표시(여기서 끊겨 있으면 직전에 리로드/크래시된 것)

    const onErr = (e) => {
      const where = e.filename ? ` @${(e.filename + '').split('/').pop()}:${e.lineno}` : '';
      addLog(`✗ JS오류: ${e.message || (e.error && e.error.message) || '알 수 없음'}${where}`);
    };
    const onRej = (e) => {
      const r = e.reason;
      addLog(`✗ Promise거부: ${(r && r.message) || r || '알 수 없음'}`);
    };
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);
    return () => {
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/gold-price');
      const officialPrice = response.data.officialPrice4;
      
      // 순금(24K) 시세 - s_pure, p_pure, turm_s_pure, turm_p_pure, per_s_pure, per_p_pure
      setGold(["순금(24K) 시세", officialPrice.s_pure, officialPrice.p_pure, officialPrice.turm_s_pure, officialPrice.turm_p_pure, officialPrice.per_s_pure, officialPrice.per_p_pure]);
      
      // 18K 금시세 - s_18k, p_18k, turm_s_18k, turm_p_18k, per_s_18k, per_p_18k
      setGold18k(["18K 금시세", officialPrice.s_18k, officialPrice.p_18k, officialPrice.turm_s_18k, officialPrice.turm_p_18k, officialPrice.per_s_18k, officialPrice.per_p_18k]);
      
      // 14K 금시세 - s_14k, p_14k, turm_s_14k, turm_p_14k, per_s_14k, per_p_14k
      setGold14k(["14K 금시세", officialPrice.s_14k, officialPrice.p_14k, officialPrice.turm_s_14k, officialPrice.turm_p_14k, officialPrice.per_s_14k, officialPrice.per_p_14k]);
      
      // 백금시세 - s_white, p_white, turm_s_white, turm_p_white, per_s_white, per_p_white
      setWhitegold(["백금시세", officialPrice.s_white, officialPrice.p_white, officialPrice.turm_s_white, officialPrice.turm_p_white, officialPrice.per_s_white, officialPrice.per_p_white]);
      
      // 은시세 - s_silver, p_silver, turm_s_silver, turm_p_silver, per_s_silver, per_p_silver
      setSilver(["은시세", officialPrice.s_silver, officialPrice.p_silver, officialPrice.turm_s_silver, officialPrice.turm_p_silver, officialPrice.per_s_silver, officialPrice.per_p_silver]);
    } catch (error) {
      console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();

    const intervalId = setInterval(fetchData, 60000);

    return () => {
      clearInterval(intervalId)};
  }, []);

  // === 핵심 워치독: '상태값'이 아니라 '재생 위치가 실제로 흐르는가'로 건강을 판단 ===
  // → 좀비 재생(상태는 1인데 시간 정지), 버퍼링 영구정지, 일시정지, 종료를 한 곳에서 모두 잡는다.
  useEffect(() => {
    if (!player) return;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      let state, t;
      try {
        state = p.getPlayerState();
        t = p.getCurrentTime();
      } catch (e) {
        // 플레이어 객체 자체가 깨짐(메모리 회수 등) → 재생성
        addLog('⚠ 플레이어 접근 불가 → remount');
        safeRemount(resumeTimeRef.current);
        return;
      }

      // 최초 재생 전에는 감시하지 않음(Play를 누르거나 자동재생이 걸리기 전)
      if (!hasStartedRef.current) {
        if (state === 1) hasStartedRef.current = true;
        lastTimeRef.current = t;
        return;
      }

      const advanced = t > lastTimeRef.current + 0.25; // 위치가 실제로 흐르는가
      lastTimeRef.current = t;

      if (state === 1 && advanced) {
        if (stallTicksRef.current > 0) addLog('✓ 재생 복구됨');
        stallTicksRef.current = 0;
        // 심장박동: '여기까지 코드가 살아서 정상 재생 중'을 시각·위치로 갱신(~10초 간격).
        // 화면이 이 시각에 멈춰 있으면 = OS가 페이지/타이머를 얼린 것으로 확정 가능.
        const now2 = Date.now();
        if (now2 - lastHbAtRef.current >= 10000) {
          lastHbAtRef.current = now2;
          const hb = `${new Date().toTimeString().slice(0, 8)} · ${Math.floor(t)}s`;
          setHeartbeat(hb);
          try { localStorage.setItem(HEALTHY_KEY, hb); } catch (e) {}
        }
        return;
      }

      // 여기 도달 = 멈춤(일시정지 / 종료 / 버퍼링 스톨 / 좀비재생 중 하나)
      stallTicksRef.current += 1;
      const ticks = stallTicksRef.current;
      const isBuffering = state === 3; // 버퍼링은 일시적일 수 있으니 더 너그럽게

      if (ticks === 1) {
        addLog(`⚠ 멈춤 감지(상태 ${state}${advanced ? '' : ', 위치정지'}) → 재개`);
        forcePlay();
      } else if (ticks === 2 && !isBuffering) {
        try { p.seekTo((t || 0) + 0.5, true); } catch (e) { addLog(`✗ seek 예외: ${e && e.message}`); } // 살짝 앞으로 seek해 락 해제
        forcePlay('seek로 락 해제');
      } else if ((!isBuffering && ticks >= 3) || (isBuffering && ticks >= 8)) {
        // 일반 정지 ~9초 / 버퍼링 스톨 ~24초 넘기면 → 위치 보존 remount
        safeRemount(t);
      } else {
        forcePlay();
      }
    }, 3000);
    return () => clearInterval(id);
  }, [player]);

  // === 환경 이벤트 기반 복구: 화면 복귀 / 네트워크 복구 / bfcache 복원 / 앱 resume ===
  useEffect(() => {
    const resume = (why) => {
      if (!hasStartedRef.current) return;
      stallTicksRef.current = 0;
      addLog(`↻ ${why} → 재개 확인`);
      forcePlay(why);
    };
    const onVis = () => { if (document.visibilityState === 'visible') resume('화면 복귀'); };
    const onOnline = () => resume('네트워크 복구');
    const onPageShow = (e) => { if (e && e.persisted) resume('bfcache 복원'); };
    const onAppResume = () => resume('앱 resume'); // Page Lifecycle / 일부 WebView

    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('online', onOnline);
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('resume', onAppResume);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('resume', onAppResume);
    };
  }, []);

  // === 메모리 누적 대비: 3시간마다 위치를 보존한 채 플레이어를 새로 만든다 ===
  useEffect(() => {
    const id = setInterval(() => {
      if (!hasStartedRef.current) return;
      let t = resumeTimeRef.current;
      try { t = playerRef.current ? playerRef.current.getCurrentTime() : t; } catch (e) {}
      addLog('⟳ 정기 새로고침(메모리 정리)');
      safeRemount(t);
    }, 3 * 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (current, next) => {
      console.log(`Slide changed from: ${current} to ${next} at: ${new Date().getTime()}`);
    }
  }

  const onPlayVideo = () => {
    const p = playerRef.current || player;
    if (p) {
      try { p.playVideo(); } catch (e) {}
      hasStartedRef.current = true;
      stallTicksRef.current = 0;
      setPlaying(true);
    }
  };

  const onReady = (event) => {
    playerRef.current = event.target;
    setPlayer(event.target);
    if (resumeTimeRef.current > 0) {
      // remount된 경우: 저장해둔 위치부터 이어서 자동 재생
      try {
        event.target.seekTo(resumeTimeRef.current, true);
        event.target.playVideo();
      } catch (e) {}
      lastTimeRef.current = resumeTimeRef.current;
      addLog(`✓ remount 완료 — ${Math.floor(resumeTimeRef.current)}s 이어재생`);
    } else {
      // 최초 로드: 자동재생 시도(TV 브라우저는 대개 허용). 막히면 Play 버튼으로 시작.
      try { event.target.playVideo(); } catch (e) {}
      addLog('✓ 플레이어 준비됨 — 자동재생 시도(막히면 Play 버튼)');
    }
  };

  const onStateChange = (event) => {
    // YT 상태값: -1 시작전, 0 종료, 1 재생, 2 일시정지, 3 버퍼링, 5 대기
    const state = event.data;
    const names = { '-1': '시작전', 0: '종료', 1: '재생', 2: '일시정지', 3: '버퍼링', 5: '대기' };
    addLog(`상태: ${names[state] ?? state}(${state})`);
    if (state === 1) {
      hasStartedRef.current = true;
      setPlaying(true);
    } else {
      setPlaying(false);
      // 일시정지·종료면 워치독보다 빠르게 즉시 1차 재개.
      // 단 '최초 재생을 시작한 뒤'에만 — 시작 전엔 자동재생 차단과 싸우는 헛루프를 막는다.
      if (hasStartedRef.current && (state === 2 || state === 0)) {
        try { event.target.playVideo(); } catch (e) {}
      }
    }
  };

  // 플레이어 에러(2 잘못된 ID, 5 HTML5 오류, 100 삭제/비공개, 101·150 임베드 불가) → remount
  const onError = (event) => {
    let t = resumeTimeRef.current;
    try { t = playerRef.current ? playerRef.current.getCurrentTime() : t; } catch (e) {}
    addLog(`✗ 에러(${event && event.data}) → remount`);
    safeRemount(t);
  };

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
      iv_load_policy: 3,
      fs: 1,
      cc_load_policy: 0,
      start: 6,
      list: 'PLVefncH6MagHe1l-uPB5jWUeDQokGUlyG',
      listType: 'playlist'
    },
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg sm:text-xl md:text-2xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full">
        <Slider {...settings} className="flex h-screen w-full">
            <Modal data={gold} />
            <Modal data={gold18k} />
            <Modal data={gold14k} />
            <Modal data={whitegold} />
            <Modal data={silver} />
        </Slider>
      </div>
      <button 
        onClick={onPlayVideo} 
        className="flex text-lg sm:text-2xl md:text-4xl lg:text-6xl bg-slate-600 w-full justify-center items-center py-2 sm:py-3 md:py-4 hover:bg-slate-700 transition-colors"
      >
        Play
      </button>
      <div className="flex items-stretch gap-2 px-2 py-1">
        <div className="shrink-0 self-center w-36 text-center">
          <div className="text-sm sm:text-base md:text-lg font-bold">{playing ? 'Playing' : 'Not playing'}</div>
          <div className="font-mono text-[10px] text-gray-500">♥ {heartbeat || '—'}</div>
        </div>
        <div className="flex-1 max-h-40 overflow-auto rounded bg-gray-900 px-2 py-1 font-mono text-[10px] sm:text-xs leading-tight text-green-300">
          {logs.length === 0
            ? <div className="text-gray-500">로그 없음</div>
            : logs.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      </div>
      <div className="flex justify-center items-center w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] xl:h-[90vh]">
        <YouTube
          key={playerKey}
          videoId="tHjCo2WDByI"
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
          onError={onError}
          className="w-full h-full"
        />
      </div>
    </>
  )
}
