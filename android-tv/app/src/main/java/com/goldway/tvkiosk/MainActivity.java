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

/**
 * 금시세 웹앱 전용 키오스크 WebView.
 *
 * 페이지 안의 복구 로직(워치독·remount·전체 새로고침)이 살릴 수 없는 두 가지 —
 * 렌더러 프로세스 사망, 페이지 JS 전체 동결 — 를 앱 레벨에서 감시해 WebView를 통째로 재생성한다.
 */
public class MainActivity extends Activity {

    private static final String START_URL = "https://live-gold-price.vercel.app";
    private static final long PING_INTERVAL_MS = 30_000;   // JS 응답성 점검 주기
    private static final long FREEZE_TIMEOUT_MS = 90_000;  // 이 시간 동안 무응답이면 페이지 동결로 판정

    private FrameLayout container;
    private WebView webView;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private long lastPongAt;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON); // 화면보호기/절전 진입 방지
        container = new FrameLayout(this);
        setContentView(container);
        createWebView();
        handler.postDelayed(watchdog, PING_INTERVAL_MS);
    }

    /** 어떤 이유로든 죽은 WebView를 버리고 새로 만들어 처음부터 다시 로드한다. */
    @SuppressLint("SetJavaScriptEnabled")
    private void createWebView() {
        if (webView != null) {
            container.removeView(webView);
            try { webView.destroy(); } catch (Exception ignored) {}
            webView = null;
        }
        WebView wv = new WebView(this);
        WebSettings s = wv.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);                  // 페이지가 진단 로그·이어재생 위치를 localStorage에 남긴다
        s.setMediaPlaybackRequiresUserGesture(false);  // 사용자 조작 없이 자동재생 허용

        wv.setWebChromeClient(new WebChromeClient());
        wv.setWebViewClient(new WebViewClient() {
            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                // 렌더러 프로세스가 죽어도(메모리 부족 등) 앱까지 죽이지 않고 즉시 재생성
                handler.post(MainActivity.this::createWebView);
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                // 부팅 직후 네트워크 미준비 등으로 메인 페이지 로드 실패 → 5초 후 재시도
                if (Build.VERSION.SDK_INT >= 23 && request.isForMainFrame()) {
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

    /** 30초마다 페이지 JS에 ping. 90초 넘게 응답이 없으면 페이지 동결로 보고 WebView 재생성. */
    private final Runnable watchdog = new Runnable() {
        @Override
        public void run() {
            WebView wv = webView;
            if (wv != null) {
                wv.evaluateJavascript("1", value -> lastPongAt = SystemClock.elapsedRealtime());
                if (SystemClock.elapsedRealtime() - lastPongAt > FREEZE_TIMEOUT_MS) {
                    createWebView();
                }
            }
            handler.postDelayed(this, PING_INTERVAL_MS);
        }
    };

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
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
