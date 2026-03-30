(function initAuditLogger() {
    async function writeSystemLog(eventType, level, message, metadata) {
        if (!window.sb) return;

        const safeEventType = (eventType || 'unknown').toString().slice(0, 80);
        const safeLevel = (level || 'info').toString().slice(0, 16);
        const safeMessage = (message || '').toString().slice(0, 500);
        const safeMetadata = metadata && typeof metadata === 'object' ? metadata : null;

        let userId = null;
        try {
            const { data } = await window.sb.auth.getSession();
            userId = data?.session?.user?.id || null;
        } catch (error) {
            userId = null;
        }

        try {
            await window.sb.from('system_logs').insert({
                user_id: userId,
                event_type: safeEventType,
                level: safeLevel,
                message: safeMessage,
                metadata: safeMetadata
            });
        } catch (error) {
            console.warn('system_logs insert failed:', error?.message || error);
        }
    }

    window.writeSystemLog = writeSystemLog;
})();
