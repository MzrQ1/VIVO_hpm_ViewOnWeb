# VIVO手表心率监测系统

实时显示VIVO手表通过BLE广播发送的心率信号的Web应用。

## 功能特性

- ✅ **BLE蓝牙连接** - 连接VIVO手表并接收心率数据
- ✅ **实时心率显示** - 大号数字显示当前心率值
- ✅ **心率趋势图** - 实时绘制心率变化曲线
- ✅ **信号强度显示** - 显示蓝牙信号强度(RSSI)
- ✅ **连接状态监控** - 实时显示连接状态
- ✅ **数据包计数** - 显示接收到的数据包数量
- ✅ **日志输出** - 记录系统日志和错误信息

## 技术栈

- HTML5 + CSS3
- JavaScript (ES6+)
- Chart.js - 数据可视化
- Web Bluetooth API - 蓝牙连接

## 安装部署

### 方法1: 使用npm

```bash
npm install
npm start
```

然后在浏览器中打开 `http://localhost:8080`

### 方法2: 直接使用

1. 下载项目文件
2. 使用任何HTTP服务器运行（如Python）
3. 在浏览器中打开HTML文件

```bash
# 使用Python
python -m http.server 8080

# 使用Node.js
npx http-server -p 8080
```

## 使用方法

### 1. 连接设备

1. 确保VIVO手表已开启蓝牙并佩戴在手腕上
2. 点击"连接设备"按钮
3. 在弹出的设备列表中选择您的VIVO手表
4. 等待连接成功

### 2. 查看心率数据

连接成功后，应用将：
- 显示当前心率值（bpm）
- 实时更新心率趋势图
- 显示信号强度
- 记录系统日志

### 3. 断开连接

点击"断开连接"按钮可断开与手表的连接。

## 数据格式

心率数据遵循蓝牙心率服务规范（Bluetooth SIG Heart Rate Service）：

- **Flags**: 第1字节，包含数据格式信息
  - 位0: 心率值格式（0=8位，1=16位）
  - 位1: 接触检测状态
  - 位3: 能量信息存在标志
  - 位4: RR-Interval数据存在标志
- **Heart Rate**: 心率值（8或16位）
- **Energy Expended**: 累计能量消耗（可选）
- **RR Intervals**: 心电图RR间期（可选）

## 浏览器兼容性

需要支持Web Bluetooth API的浏览器：
- ✅ Chrome 56+
- ✅ Edge 79+
- ⚠️ Firefox (需要手动启用)
- ❌ Safari (暂不支持)

## 注意事项

1. **权限要求**: 首次连接需要用户手动授权
2. **安全限制**: 必须通过HTTPS或localhost访问
3. **设备兼容性**: 需要支持蓝牙心率服务的VIVO手表
4. **浏览器限制**: 某些浏览器可能需要手动启用Web Bluetooth功能

## 故障排除

### 无法连接设备

- 确保VIVO手表蓝牙已开启
- 确保手表在设备附近（10米内）
- 尝试重启浏览器
- 检查浏览器是否支持Web Bluetooth

### 数据未显示

- 检查日志输出中的错误信息
- 确认手表正在发送心率数据
- 尝试重新连接设备

### 信号强度异常

- 检查手表佩戴是否正确
- 确保没有金属物体阻挡蓝牙信号
- 尝试靠近电脑

## 项目结构

```
Heart_view/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── app.js             # 应用主逻辑
├── ble-manager.js     # BLE蓝牙管理器
├── heart-rate-display.js  # 心率显示组件
├── chart-manager.js   # 图表管理器
└── package.json       # 项目配置
```

## 模块说明

### BLE Manager (ble-manager.js)
- 负责BLE设备连接和断开
- 处理心率数据解析
- 监听RSSI信号强度
- 管理GATT服务和特征值

### Heart Rate Display (heart-rate-display.js)
- 显示当前心率值
- 更新设备信息
- 管理心率动画效果
- 显示连接状态

### Chart Manager (chart-manager.js)
- 实时绘制心率趋势图
- 配置图表样式和交互
- 管理数据点缓存
- 响应窗口大小变化

## 更新日志

### v1.0.0 (2026-04-01)
- 初始版本发布
- 实现BLE连接功能
- 实现心率实时显示
- 实现心率趋势图
- 添加日志系统

## 许可证

MIT License

## 作者

Heart_view Team
