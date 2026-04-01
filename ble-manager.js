class BLEManager {
    constructor() {
        this.bluetoothDevice = null;
        this.server = null;
        this.service = null;
        this.characteristic = null;
        this.isConnecting = false;
        this.isConnected = false;
        this.heartRateDataCallback = null;
        this.rssiCallback = null;
        this.deviceName = 'VIVO Watch';
        this.serviceUUID = '0000180d-0000-1000-8000-00805f9b34fb';
        this.characteristicUUID = '00002a37-0000-1000-8000-00805f9b34fb';
        this.availableDevices = [];
    }

    log(message, type = 'info') {
        const event = new CustomEvent('bleLog', {
            detail: { message, type }
        });
        document.dispatchEvent(event);
    }

    checkBluetoothSupport() {
        if (!navigator.bluetooth) {
            this.log('浏览器不支持Web Bluetooth API', 'error');
            this.log('请使用Chrome 56+或Edge 79+浏览器', 'warning');
            this.log('确保通过localhost或HTTPS访问', 'warning');
            return false;
        }
        return true;
    }

    async scanDevices() {
        if (!this.checkBluetoothSupport()) {
            return [];
        }

        if (this.isConnecting) {
            this.log('设备已在扫描中', 'warning');
            return [];
        }

        this.isConnecting = true;
        this.log('正在搜索BLE设备...', 'system');

        try {
            this.availableDevices = await navigator.bluetooth.requestDevice({
                filters: [
                    {
                        services: [this.serviceUUID],
                        namePrefix: 'VIVO'
                    },
                    {
                        services: [this.serviceUUID]
                    }
                ],
                optionalServices: [this.serviceUUID]
            });

            if (this.availableDevices) {
                this.log(`找到设备: ${this.availableDevices.name || 'Unknown'}`, 'success');
                this.isConnecting = false;
                return [this.availableDevices];
            }

            this.isConnecting = false;
            return [];

        } catch (error) {
            this.log(`扫描失败: ${error.message}`, 'error');
            this.isConnecting = false;

            if (error.message.includes('canceled')) {
                this.log('用户取消了设备选择', 'warning');
            } else if (error.message.includes('not found')) {
                this.log('未找到BLE设备，请确保VIVO手表已开启蓝牙', 'error');
            }

            return [];
        }
    }

    async connect() {
        if (this.isConnecting || this.isConnected) {
            this.log('设备已在连接中或已连接', 'warning');
            return false;
        }

        if (!this.checkBluetoothSupport()) {
            return false;
        }

        this.isConnecting = true;
        this.log('正在连接设备...', 'system');

        try {
            this.bluetoothDevice = await navigator.bluetooth.requestDevice({
                filters: [
                    {
                        services: [this.serviceUUID],
                        namePrefix: 'VIVO'
                    },
                    {
                        services: [this.serviceUUID]
                    }
                ],
                optionalServices: [this.serviceUUID]
            });

            this.log(`找到设备: ${this.bluetoothDevice.name || 'Unknown'}`, 'success');
            this.deviceName = this.bluetoothDevice.name || 'VIVO Watch';

            this.bluetoothDevice.addEventListener('gattserverdisconnected', () => {
                this.disconnect();
            });

            this.server = await this.bluetoothDevice.gatt.connect();
            this.log('GATT服务器连接成功', 'success');

            this.service = await this.server.getPrimaryService(this.serviceUUID);
            this.log('心率服务连接成功', 'success');

            this.characteristic = await this.service.getCharacteristic(this.characteristicUUID);
            this.log('心率特征值获取成功', 'success');

            this.characteristic.addEventListener('characteristicvaluechanged', (event) => {
                this.log('收到心率数据通知', 'info');
                this.handleHeartRateData(event.target.value);
            });

            await this.characteristic.startNotifications();
            this.log('开始接收心率数据通知', 'success');

            this.isConnected = true;
            this.isConnecting = false;
            this.log('设备连接成功', 'success');

            this.updateConnectionStatus(true);
            this.updateDeviceName(this.deviceName);

            return true;

        } catch (error) {
            this.log(`连接失败: ${error.message}`, 'error');
            this.log(`错误详情: ${JSON.stringify(error)}`, 'error');
            this.isConnecting = false;
            this.disconnect();
            return false;
        }
    }

    async disconnect() {
        if (!this.isConnected && !this.isConnecting) {
            return;
        }

        this.log('正在断开连接...', 'system');

        if (this.characteristic) {
            try {
                await this.characteristic.stopNotifications();
            } catch (error) {
                this.log(`停止通知失败: ${error.message}`, 'warning');
            }
            this.characteristic = null;
        }

        if (this.service) {
            this.service = null;
        }

        if (this.server) {
            try {
                await this.server.disconnect();
            } catch (error) {
                this.log(`断开GATT服务器失败: ${error.message}`, 'warning');
            }
            this.server = null;
        }

        if (this.bluetoothDevice) {
            this.bluetoothDevice = null;
        }

        this.isConnected = false;
        this.isConnecting = false;
        this.log('已断开连接', 'warning');

        this.updateConnectionStatus(false);
        this.updateDeviceName('--');
    }

    handleHeartRateData(value) {
        console.log('handleHeartRateData被调用', value);
        
        let flags = value.getUint8(0);
        console.log('Flags:', flags.toString(16));
        
        let heartRate = 0;

        if (flags & 0x01) {
            heartRate = value.getUint16(1, true);
            console.log('16位心率值:', heartRate);
        } else {
            heartRate = value.getUint8(1);
            console.log('8位心率值:', heartRate);
        }

        console.log('最终心率:', heartRate);

        if (this.heartRateDataCallback) {
            this.heartRateDataCallback({
                heartRate,
                contactDetected: !!(flags & 0x02),
                energyExpended: (flags & 0x08) ? value.getUint16(3, true) : null,
                rrIntervals: [],
                timestamp: Date.now()
            });
        }
    }

    async readRSSI() {
        this.log('信号强度功能暂不可用', 'warning');
    }

    setHeartRateDataCallback(callback) {
        this.heartRateDataCallback = callback;
    }

    setRSSICallback(callback) {
        this.rssiCallback = callback;
    }

    updateConnectionStatus(connected) {
        const event = new CustomEvent('connectionStatusChanged', {
            detail: { connected }
        });
        document.dispatchEvent(event);
    }

    updateDeviceName(name) {
        const event = new CustomEvent('deviceNameChanged', {
            detail: { name }
        });
        document.dispatchEvent(event);
    }

    updatePacketCount(count) {
        const event = new CustomEvent('packetCountChanged', {
            detail: { count }
        });
        document.dispatchEvent(event);
    }

    isConnected() {
        return this.isConnected;
    }

    getDeviceName() {
        return this.deviceName;
    }

    getAvailableDevices() {
        return this.availableDevices;
    }

    clearDevices() {
        this.availableDevices = [];
    }
}
