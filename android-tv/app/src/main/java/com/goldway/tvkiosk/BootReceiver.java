package com.goldway.tvkiosk;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** TV 재부팅(정전 등) 후 자동 실행. 최신 안드로이드에선 백그라운드 실행 제한으로 막힐 수 있다 — 그 경우 홈에서 앱 실행. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            Intent i = new Intent(context, MainActivity.class);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            try {
                context.startActivity(i);
            } catch (Exception ignored) {
            }
        }
    }
}
