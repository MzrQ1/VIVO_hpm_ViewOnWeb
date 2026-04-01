class App {
    constructor() {
        this.bleManager = new BLEManager();
        this.heartRateDisplay = new HeartRateDisplay();
        this.chartManager = new ChartManager();
        this.packetCount = 0;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('scanBtn').addEventListener('click', () => {
            this.scanDevices();
        });

        document.getElementById('connectBtn').addEventListener('click', () => {
            this.connect();
        });

        document.getElementById('disconnectBtn').addEventListener('click', () => {
            this.disconnect();
        });

        document.addEventListener('bleLog', (e) => {
            this.log(e.detail.message, e.detail.type);
        });

        document.addEventListener('connectionStatusChanged', (e) => {
            this.handleConnectionStatusChange(e.detail);
        });

        this.bleManager.setHeartRateDataCallback((data) => {
            this.handleHeartRateData(data);
        });

        this.bleManager.setRSSICallback((rssi) => {
            this.handleRSSIUpdate(rssi);
        });
    }

    async scanDevices() {
        this.log('正在搜索BLE设备...', 'system');
        this.log('请确保VIVO手表已开启蓝牙并靠近电脑', 'info');

        const devices = await this.bleManager.scanDevices();

        if (devices.length === 0) {
            this.log('未找到设备，请重试', 'error');
            this.updateConnectionButtons(false);
            return;
        }

        this.log('设备查找成功', 'success');
        this.updateConnectionButtons(false, true);
    }

    async connect() {
        this.log('正在连接设备...', 'system');

        const success = await this.bleManager.connect();
        if (success) {
            this.updateConnectionButtons(true);
        }
    }

    disconnect() {
        this.bleManager.disconnect();
        this.updateConnectionButtons(false);
        this.resetUI();
    }

    handleConnectionStatusChange(detail) {
        this.updateConnectionButtons(detail.connected);
    }

    updateConnectionButtons(connected, scanFound = false) {
        const scanBtn = document.getElementById('scanBtn');
        const connectBtn = document.getElementById('connectBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');

        if (connected) {
            scanBtn.disabled = true;
            connectBtn.disabled = true;
            disconnectBtn.disabled = false;
        } else if (scanFound) {
            scanBtn.disabled = false;
            connectBtn.disabled = false;
            disconnectBtn.disabled = true;
        } else {
            scanBtn.disabled = false;
            connectBtn.disabled = true;
            disconnectBtn.disabled = true;
        }
    }

    handleHeartRateData(data) {
        this.packetCount++;
        this.bleManager.updatePacketCount(this.packetCount);

        const event = new CustomEvent('heartRateChanged', {
            detail: data
        });
        document.dispatchEvent(event);
    }

    handleRSSIUpdate(rssi) {
        const event = new CustomEvent('signalStrengthChanged', {
            detail: { rssi }
        });
        document.dispatchEvent(event);
    }

    log(message, type = 'info') {
        const consoleOutput = document.getElementById('consoleOutput');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;

        const time = new Date();
        const timeStr = time.toLocaleTimeString('zh-CN', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        logEntry.innerHTML = `<span class="log-time">[${timeStr}]</span><span class="log-message">${message}</span>`;
        consoleOutput.appendChild(logEntry);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    resetUI() {
        this.packetCount = 0;
        this.bleManager.updatePacketCount(0);
        this.heartRateDisplay.reset();
        this.chartManager.reset();
        this.log('界面已重置', 'system');
    }

    init() {
        this.heartRateDisplay.init();
        this.chartManager.init();
        this.updateConnectionButtons(false);
        this.log('应用初始化完成', 'system');
        this.log('请点击"查找设备"按钮开始搜索VIVO手表', 'info');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
