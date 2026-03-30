(function initSupabaseClient() {
    if (!window.supabase) {
        console.warn('Supabase SDK not loaded.');
        return;
    }

    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY ||
        window.SUPABASE_URL.includes('PASTE_YOUR_SUPABASE_URL_HERE') ||
        window.SUPABASE_ANON_KEY.includes('PASTE_YOUR_SUPABASE_ANON_KEY_HERE')) {
        console.warn('Supabase URL/Key not configured yet in supabase-config.js');
        return;
    }

    window.sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

    let perfAlreadySent = false;

    async function collectAndSendPerformanceMetrics() {
        if (perfAlreadySent || !window.sb) return;
        perfAlreadySent = true;

        const nav = performance.getEntriesByType('navigation')[0];
        const ttfbMs = nav && typeof nav.responseStart === 'number' && typeof nav.requestStart === 'number'
            ? Math.max(0, Math.round(nav.responseStart - nav.requestStart))
            : null;

        let clsValue = 0;
        let lcpMs = null;

        try {
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
            });
            clsObserver.observe({ type: 'layout-shift', buffered: true });

            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const last = entries[entries.length - 1];
                if (last) {
                    lcpMs = Math.round(last.startTime);
                }
            });
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

            setTimeout(async () => {
                clsObserver.disconnect();
                lcpObserver.disconnect();

                try {
                    const { data } = await window.sb.auth.getSession();
                    const userId = data?.session?.user?.id || null;

                    await window.sb.from('performance_metrics').insert({
                        user_id: userId,
                        page_path: window.location.pathname,
                        ttfb_ms: ttfbMs,
                        lcp_ms: lcpMs,
                        cls_value: Number(clsValue.toFixed(4)),
                        user_agent: navigator.userAgent.slice(0, 250)
                    });
                } catch (error) {
                    console.warn('performance_metrics insert failed:', error?.message || error);
                }
            }, 3200);
        } catch (error) {
            console.warn('Performance observers unavailable:', error?.message || error);
        }
    }

    if (document.readyState === 'complete') {
        collectAndSendPerformanceMetrics();
    } else {
        window.addEventListener('load', collectAndSendPerformanceMetrics, { once: true });
    }
})();
