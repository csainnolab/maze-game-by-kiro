// Best Run Tracking System with localStorage persistence

const BestRunTracker = {
    // Current session stats
    currentSession: {
        started: null,
        ended: null,
        mazesCompleted: 0,
        totalTime: 0,
        bestMazeTime: Infinity,
        worstMazeTime: 0,
        deathCount: 0,
        heartsCollected: 0,
        hazardsHit: 0,
        mazes: [] // Array of {mazeId, time, heartsCollected, hazardsHit}
    },

    // Load best run from localStorage
    loadBestRun() {
        const stored = localStorage.getItem('bestRun');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse best run:', e);
                return null;
            }
        }
        return null;
    },

    // Save best run to localStorage
    saveBestRun(run) {
        try {
            localStorage.setItem('bestRun', JSON.stringify(run));
            console.log('Best run saved to localStorage');
        } catch (e) {
            console.error('Failed to save best run:', e);
        }
    },

    // Start a new session
    startSession() {
        this.currentSession = {
            started: Date.now(),
            ended: null,
            mazesCompleted: 0,
            totalTime: 0,
            bestMazeTime: Infinity,
            worstMazeTime: 0,
            deathCount: 0,
            heartsCollected: 0,
            hazardsHit: 0,
            mazes: []
        };
        console.log('Session started');
    },

    // Record maze completion
    recordMazeCompletion(mazeId, timeMs, heartsCollected = 0, hazardsHit = 0) {
        this.currentSession.mazesCompleted++;
        this.currentSession.totalTime += timeMs;
        this.currentSession.bestMazeTime = Math.min(this.currentSession.bestMazeTime, timeMs);
        this.currentSession.worstMazeTime = Math.max(this.currentSession.worstMazeTime, timeMs);
        this.currentSession.heartsCollected += heartsCollected;
        this.currentSession.hazardsHit += hazardsHit;
        this.currentSession.mazes.push({
            mazeId: mazeId,
            time: timeMs,
            heartsCollected: heartsCollected,
            hazardsHit: hazardsHit
        });

        this.updateSessionDisplay();
        console.log(`Maze ${mazeId} completed in ${(timeMs / 1000).toFixed(2)}s`);
    },

    // Record death in current session
    recordDeath() {
        this.currentSession.deathCount++;
    },

    // End session and optionally save to best runs
    endSession(saveToStorage = true) {
        this.currentSession.ended = Date.now();
        const session = { ...this.currentSession };

        if (saveToStorage) {
            const bestRun = this.loadBestRun();
            
            // Compare with existing best run
            if (!bestRun || session.mazesCompleted > bestRun.mazesCompleted ||
                (session.mazesCompleted === bestRun.mazesCompleted && session.totalTime < bestRun.totalTime)) {
                
                const newBestRun = {
                    timestamp: session.started,
                    mazesCompleted: session.mazesCompleted,
                    totalTime: session.totalTime,
                    bestMazeTime: session.bestMazeTime,
                    worstMazeTime: session.worstMazeTime,
                    deathCount: session.deathCount,
                    heartsCollected: session.heartsCollected,
                    hazardsHit: session.hazardsHit
                };
                
                this.saveBestRun(newBestRun);
                console.log('New best run saved!');
            }
        }

        console.log('Session ended', session);
        return session;
    },

    // Get best run stats
    getBestRun() {
        return this.loadBestRun();
    },

    // Get current session stats
    getCurrentSession() {
        return this.currentSession;
    },

    // Format time for display (ms to MM:SS.mmm)
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const millis = ms % 1000;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
    },

    // Update session stats display in HUD
    updateSessionDisplay() {
        const session = this.currentSession;
        const bestRun = this.getBestRun();

        // Update current session stats
        const mazesElement = document.getElementById('mazesCompleted');
        if (mazesElement) {
            mazesElement.textContent = `Mazes: ${session.mazesCompleted}`;
        }

        const timeElement = document.getElementById('sessionTime');
        if (timeElement) {
            timeElement.textContent = `Session: ${this.formatTime(session.totalTime)}`;
        }

        // Update best run stats if available
        if (bestRun) {
            const bestRunElement = document.getElementById('bestRunStats');
            if (bestRunElement) {
                bestRunElement.textContent = `Best: ${bestRun.mazesCompleted} mazes in ${this.formatTime(bestRun.totalTime)}`;
            }
        }
    },

    // Reset session display
    resetDisplay() {
        const mazesElement = document.getElementById('mazesCompleted');
        const timeElement = document.getElementById('sessionTime');
        if (mazesElement) mazesElement.textContent = 'Mazes: 0';
        if (timeElement) timeElement.textContent = 'Session: 00:00.000';
    }
};
