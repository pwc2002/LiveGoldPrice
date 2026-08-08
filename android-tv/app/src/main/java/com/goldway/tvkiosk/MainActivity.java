package com.goldway.tvkiosk;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.view.KeyEvent;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import org.json.JSONObject;

import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * 금시세 웹앱 전용 키오스크 WebView.
 *
 * 페이지 안의 복구 로직(워치독·remount·전체 새로고침)이 살릴 수 없는 두 가지 —
 * 렌더러 프로세스 사망, 페이지 JS 전체 동결 — 를 앱 레벨에서 감시해 WebView를 통째로 재생성한다.
 * 모든 복구 이벤트와 30초 심장박동은 원격 모니터(goldway-monitor)로 전송된다.
 */
public class MainActivity extends Activity {

    private static final String START_URL = "https://live-gold-price.vercel.app";
    private static final String REPORT_URL = "https://goldway-monitor.vercel.app/api/ingest";
    private static final long PING_INTERVAL_MS = 30_000;   // JS 응답성 점검 주기
    private static final long FREEZE_TIMEOUT_MS = 90_000;  // 이 시간 동안 무응답이면 페이지 동결로 판정

    private FrameLayout container;
    private WebView webView;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private long lastPongAt;

    // 보고는 단일 스레드로 직렬화 + 연속 이벤트는 한 번에 묶어 전송(히스토리 동시 쓰기 경합 방지)
    private final java.util.concurrent.LinkedBlockingQueue<String> pendingLogs = new java.util.concurrent.LinkedBlockingQueue<>();
    private final java.util.concurrent.ExecutorService reporter = java.util.concurrent.Executors.newSingleThreadExecutor();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON); // 화면보호기/절전 진입 방지
        container = new FrameLayout(this);
        setContentView(container);
        report("start", "앱 시작", -1);
        createWebView("초기 생성");
        handler.postDelayed(watchdog, PING_INTERVAL_MS);
    }

    /** 앱단 이벤트·심장박동을 원격 모니터로 전송(실패해도 무시). line이 null이면 상태 갱신만. */
    private void report(String reason, String line, long pongAgeSec) {
        if (line != null) {
            String t = new SimpleDateFormat("HH:mm:ss", Locale.KOREA).format(new Date());
            pendingLogs.offer(t + "  " + line);
        }
        reporter.execute(() -> {
            StringBuilder logs = new StringBuilder();
            String l;
            while ((l = pendingLogs.poll()) != null) {
                if (logs.length() > 0) logs.append(',');
                logs.append(JSONObject.quote(l));
            }
            HttpURLConnection c = null;
            try {
                c = (HttpURLConnection) new URL(REPORT_URL).openConnection();
                c.setConnectTimeout(5000);
                c.setReadTimeout(5000);
                c.setRequestMethod("POST");
                c.setDoOutput(true);
                StringBuilder json = new StringBuilder("{\"device\":\"app\",\"reason\":")
                        .append(JSONObject.quote(reason));
                if (pongAgeSec >= 0) json.append(",\"pongAgeSec\":").append(pongAgeSec);
                json.append(",\"newLogs\":[").append(logs).append("]}");
                c.getOutputStream().write(json.toString().getBytes(StandardCharsets.UTF_8));
                c.getInputStream().read();
            } catch (Exception ignored) {
            } finally {
                if (c != null) c.disconnect();
            }
        });
    }

    /** 어떤 이유로든 죽은 WebView를 버리고 새로 만들어 처음부터 다시 로드한다. */
    @SuppressLint("SetJavaScriptEnabled")
    private void createWebView(String reason) {
        if (webView != null) {
            container.removeView(webView);
            try { webView.destroy(); } catch (Exception ignored) {}
            webView = null;
        }
        report("webview", "WebView 생성: " + reason, -1);
        WebView wv = new WebView(this);
        WebSettings s = wv.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);                  // 페이지가 진단 로그·이어재생 위치를 localStorage에 남긴다
        s.setMediaPlaybackRequiresUserGesture(false);  // 사용자 조작 없이 자동재생 허용
        s.setUseWideViewPort(true);                    // 페이지의 viewport meta(width=1280)를 존중
        // 1280px 레이아웃이 화면 폭에 정확히 맞도록 스케일 고정(밀도 보정으로 인한 과확대 방지)
        int scale = (int) Math.round(getResources().getDisplayMetrics().widthPixels * 100.0 / 1280.0);
        wv.setInitialScale(scale);

        wv.setWebChromeClient(new WebChromeClient());
        wv.setWebViewClient(new WebViewClient() {
            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                // 렌더러 프로세스가 죽어도(메모리 부족 등) 앱까지 죽이지 않고 즉시 재생성
                boolean crashed = Build.VERSION.SDK_INT >= 26 && detail != null && detail.didCrash();
                final String why = crashed ? "렌더러 크래시" : "렌더러 강제종료(메모리 부족 추정)";
                handler.post(() -> createWebView(why));
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                // 부팅 직후 네트워크 미준비 등으로 메인 페이지 로드 실패 → 5초 후 재시도
                if (Build.VERSION.SDK_INT >= 23 && request.isForMainFrame()) {
                    report("loaderror", "페이지 로드 실패 → 5초 후 재시도", -1);
                    handler.postDelayed(view::reload, 5_000);
                }
            }
        });

        container.addView(wv, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        webView = wv;
        lastPongAt = SystemClock.elapsedRealtime();
        wv.loadUrl(START_URL);
    }

    /** 30초마다 페이지 JS에 ping + 앱 심장박동 보고. 90초 넘게 무응답이면 페이지 동결로 보고 WebView 재생성. */
    private final Runnable watchdog = new Runnable() {
        @Override
        public void run() {
            WebView wv = webView;
            if (wv != null) {
                long pongAge = (SystemClock.elapsedRealtime() - lastPongAt) / 1000;
                report("heartbeat", null, pongAge); // 이 보고가 끊기면 앱/TV 자체가 죽은 것
                wv.evaluateJavascript("1", value -> lastPongAt = SystemClock.elapsedRealtime());
                if (SystemClock.elapsedRealtime() - lastPongAt > FREEZE_TIMEOUT_MS) {
                    createWebView("JS " + pongAge + "초 무응답 → 동결 판정");
                }
            }
            handler.postDelayed(this, PING_INTERVAL_MS);
        }
    };

    @Override
    protected void onResume() {
        super.onResume();
        report("resume", "앱 포그라운드 복귀", -1);
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        report("pause", "앱 백그라운드 전환(화면보호기/입력전환 추정)", -1);
        if (webView != null) webView.onPause();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        if (webView != null) {
            try { webView.destroy(); } catch (Exception ignored) {}
            webView = null;
        }
        super.onDestroy();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // 리모컨 뒤로가기 오조작으로 무인 재생이 꺼지는 것 방지 — 나갈 땐 홈 버튼 사용
        if (keyCode == KeyEvent.KEYCODE_BACK) return true;
        return super.onKeyDown(keyCode, event);
    }
}
