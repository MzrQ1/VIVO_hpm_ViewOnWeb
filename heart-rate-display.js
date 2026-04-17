class HeartRateDisplay {
    constructor() {
        this.heartRateElement = document.getElementById('heartRate');
        this.ibiValueElement = document.getElementById('ibiValue');
        this.deviceNameElement = document.getElementById('deviceName');
        this.signalStrengthElement = document.getElementById('signalStrength');
        this.connectionStateElement = document.getElementById('connectionState');
        this.packetCountElement = document.getElementById('packetCount');
        this.heartBeatElement = document.getElementById('heartBeat');
        this.heartRate = null;
        this.ibiValue = null;
        this.lastHeartBeatTime = 0;
        this.heartRateHistory = [];
        this.ibiHistory = [];
        this.maxHistorySize = 30;
    }

    init() {
        this.setupEventListeners();
        this.updateHeartRateUI(null);
        this.updateDeviceName('--');
        this.updateSignalStrength('--');
        this.updateConnectionState('未连接');
        this.updatePacketCount(0);
    }

    setupEventListeners() {
        document.addEventListener('heartRateChanged', (e) => {
            this.handleHeartRateUpdate(e.detail);
        });

        document.addEventListener('ibiChanged', (e) => {
            this.handleIBIUpdate(e.detail);
        });

        document.addEventListener('connectionStatusChanged', (e) => {
            this.handleConnectionStatusChange(e.detail);
        });

        document.addEventListener('deviceNameChanged', (e) => {
            this.updateDeviceName(e.detail.name);
        });

        document.addEventListener('signalStrengthChanged', (e) => {
            this.updateSignalStrength(e.detail.rssi);
        });

        document.addEventListener('packetCountChanged', (e) => {
            this.updatePacketCount(e.detail.count);
        });
    }

    handleHeartRateUpdate(data) {
        this.heartRate = data.heartRate;
        this.heartRateHistory.push(this.heartRate);

        if (this.heartRateHistory.length > this.maxHistorySize) {
            this.heartRateHistory.shift();
        }

        this.updateHeartRateUI(this.heartRate);
        this.triggerHeartBeatAnimation();

        const event = new CustomEvent('heartRateUpdated', {
            detail: { heartRate: this.heartRate, history: this.heartRateHistory }
        });
        document.dispatchEvent(event);
    }

    handleIBIUpdate(data) {
        this.ibiValue = data.ibi;
        this.ibiHistory.push(this.ibiValue);

        if (this.ibiHistory.length > this.maxHistorySize) {
            this.ibiHistory.shift();
        }

        this.updateIBIUI(this.ibiValue);

        const event = new CustomEvent('ibiUpdated', {
            detail: { ibi: this.ibiValue, history: this.ibiHistory }
        });
        document.dispatchEvent(event);
    }

    handleConnectionStatusChange(detail) {
        this.updateConnectionState(detail.connected ? '已连接' : '未连接');
    }

    updateHeartRateUI(heartRate) {
        if (heartRate === null || heartRate === undefined) {
            this.heartRateElement.textContent = '--';
            this.heartRateElement.style.color = '#a0a0a0';
        } else {
            this.heartRateElement.textContent = heartRate;
            this.heartRateElement.style.color = this.getHeartRateColor(heartRate);
        }
    }

    updateIBIUI(ibi) {
        if (ibi === null || ibi === undefined) {
            this.ibiValueElement.textContent = '--';
            this.ibiValueElement.style.color = '#a0a0a0';
        } else {
            this.ibiValueElement.textContent = ibi;
            this.ibiValueElement.style.color = '#70a1ff';
        }
    }

    getHeartRateColor(heartRate) {
        if (heartRate < 50) return '#ffa502';
        if (heartRate < 60) return '#70a1ff';
        if (heartRate < 100) return '#2ed573';
        if (heartRate < 120) return '#ff6b6b';
        return '#ff4757';
    }

    triggerHeartBeatAnimation() {
        if (this.heartRate === null || this.heartRate === undefined) return;

        const now = Date.now();
        const interval = 60000 / this.heartRate;

        if (now - this.lastHeartBeatTime > interval * 0.8) {
            this.heartBeatElement.style.animation = 'none';
            this.heartBeatElement.offsetHeight;
            this.heartBeatElement.style.animation = 'heartbeat 1s infinite';

            this.lastHeartBeatTime = now;
        }
    }

    updateDeviceName(name) {
        this.deviceNameElement.textContent = name;
    }

    updateSignalStrength(rssi) {
        if (rssi === null || rssi === undefined) {
            this.signalStrengthElement.textContent = '-- dBm';
        } else {
            this.signalStrengthElement.textContent = `${rssi} dBm`;
        }
    }

    updateConnectionState(state) {
        this.connectionStateElement.textContent = state;
    }

    updatePacketCount(count) {
        this.packetCountElement.textContent = count;
    }

    reset() {
        this.heartRate = null;
        this.ibiValue = null;
        this.heartRateHistory = [];
        this.ibiHistory = [];
        this.updateHeartRateUI(null);
        this.updateIBIUI(null);
        this.updateDeviceName('--');
        this.updateSignalStrength('--');
    }
}
