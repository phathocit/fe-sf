import { useEffect } from 'react';
import visitApi from '../api/visitApi';

const VisitLogger = () => {
    useEffect(() => {
        const getSessionId = () => {
            let sessionId = localStorage.getItem('visit_sessionId');
            if (!sessionId) {
                sessionId = Date.now().toString();
                localStorage.setItem('visit_sessionId', sessionId);
            }
            return sessionId;
        };

        const hasLoggedToday = () => {
            const lastLogged = localStorage.getItem('last_visit_log');
            const today = new Date().toDateString();
            return lastLogged === today;
        };

        if (!hasLoggedToday()) {
            visitApi.logVisit(getSessionId());
            localStorage.setItem('last_visit_log', new Date().toDateString());
        }
    }, []);

    return null;
};

export default VisitLogger;
