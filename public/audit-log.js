(function initAuditLogger() {
    /**
     * Writes a system log to the database with automatic context collection.
     * @param {string} eventType - e.g. 'auth.login', 'booking.create'
     * @param {'info'|'warn'|'error'} level - Log severity
     * @param {string} message - Human readable message
     * @param {object} [metadata] - Optional additional data
     */
    async function writeSystemLog(eventType, level, message, metadata) {
        if (!window.sb) return;

        const safeEventType = (eventType || 'unknown').toString().slice(0, 80);
        const safeLevel = (level || 'info').toString().slice(0, 16);
        const safeMessage = (message || '').toString().slice(0, 500);

        // Enhance metadata with automatic context
        const enhancedMetadata = {
            ...(metadata && typeof metadata === 'object' ? metadata : {}),
            path: window.location.pathname,
            url: window.location.href,
            ua: navigator.userAgent,
            timestamp_ms: Date.now()
        };

        let userId = null;
        try {
            const { data } = await window.sb.auth.getSession();
            userId = data?.session?.user?.id || null;
        } catch (error) {
            userId = null;
        }

        try {
            // We use insert for logs to ensure a trail is kept
            await window.sb.from('system_logs').insert({
                user_id: userId,
                event_type: safeEventType,
                level: safeLevel,
                message: safeMessage,
                metadata: enhancedMetadata
            });
        } catch (error) {
            // Fail silently on logging errors to not break the app, but log to console
            console.warn('[AuditLog] failed:', error?.message || error);
        }
    }

    // Export to window
    window.writeSystemLog = writeSystemLog;
    
    // Auto-log page view if needed (uncomment if you want to track every page)
    // window.writeSystemLog('page.view', 'info', `Visited ${window.location.pathname}`);
})();
