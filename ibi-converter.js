class HeartRateToIBIConverter {
    constructor() {
        this.heartRateHistory = [];
        this.ibiHistory = [];
        this.maxHistorySize = 100;
        this.lastHeartRateTime = 0;
        this.ibiCallback = null;
    }

    setIBICallback(callback) {
        this.ibiCallback = callback;
    }

    addHeartRateData(data) {
        const now = Date.now();
        const heartRate = data.heartRate;
        
        // 保存心率数据
        this.heartRateHistory.push({
            heartRate,
            timestamp: now
        });

        // 限制历史数据大小
        if (this.heartRateHistory.length > this.maxHistorySize) {
            this.heartRateHistory.shift();
        }

        // 计算IBI
        if (heartRate > 0) {
            const ibi = Math.round(60000 / heartRate); // 转换为毫秒
            
            // 保存IBI数据
            this.ibiHistory.push({
                ibi,
                timestamp: now
            });

            // 限制历史数据大小
            if (this.ibiHistory.length > this.maxHistorySize) {
                this.ibiHistory.shift();
            }

            // 处理数据缺失和连续性
            this.handleDataContinuity(now, ibi);

            // 触发回调
            if (this.ibiCallback) {
                this.ibiCallback({
                    ibi,
                    heartRate,
                    timestamp: now,
                    history: this.ibiHistory
                });
            }
        }

        this.lastHeartRateTime = now;
    }

    handleDataContinuity(currentTime, currentIbi) {
        // 检查是否有数据缺失（超过2秒没有数据）
        if (this.heartRateHistory.length > 1) {
            const previousData = this.heartRateHistory[this.heartRateHistory.length - 2];
            const timeDiff = currentTime - previousData.timestamp;
            
            // 如果时间差超过2秒，可能存在数据缺失
            if (timeDiff > 2000) {
                // 计算缺失的IBI数量
                const expectedIBICount = Math.floor(timeDiff / currentIbi);
                
                // 如果缺失的IBI数量大于1，添加插值IBI
                if (expectedIBICount > 1) {
                    for (let i = 1; i < expectedIBICount; i++) {
                        const interpolatedTime = previousData.timestamp + (i * currentIbi);
                        this.ibiHistory.push({
                            ibi: currentIbi,
                            timestamp: interpolatedTime,
                            interpolated: true
                        });
                    }
                }
            }
        }
    }

    getIBIHistory() {
        return this.ibiHistory;
    }

    getHeartRateHistory() {
        return this.heartRateHistory;
    }

    reset() {
        this.heartRateHistory = [];
        this.ibiHistory = [];
        this.lastHeartRateTime = 0;
    }
}