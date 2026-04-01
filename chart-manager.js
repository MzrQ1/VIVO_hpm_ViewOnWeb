class ChartManager {
    constructor() {
        this.canvas = document.getElementById('heartRateChart');
        this.ctx = this.canvas.getContext('2d');
        this.chart = null;
        this.dataPoints = [];
        this.maxDataPoints = 60;
        this.lastUpdate = 0;
        this.updateInterval = 100;
    }

    init() {
        this.setupCanvas();
        this.createChart();
        this.setupEventListeners();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        window.addEventListener('resize', () => {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            if (this.chart) {
                this.chart.resize();
            }
        });
    }

    createChart() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(255, 107, 107, 0.5)');
        gradient.addColorStop(0.5, 'rgba(255, 142, 83, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 107, 107, 0.1)');

        Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        Chart.defaults.color = '#a0a0a0';

        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '心率 (bpm)',
                    data: [],
                    borderColor: '#ff6b6b',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#ff6b6b',
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: '#ff8e53',
                    pointHoverBorderColor: '#ff8e53',
                    pointHoverBorderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    cubicInterpolationMode: 'monotone'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 300,
                    easing: 'easeOutQuart'
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                    axis: 'x'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#e0e0e0',
                            font: {
                                size: 14,
                                weight: '600'
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#e0e0e0',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `心率: ${context.parsed.y} bpm`;
                            },
                            title: function(tooltipItems) {
                                const time = new Date();
                                return time.toLocaleTimeString();
                            }
                        }
                    },
                    filler: {
                        propagate: true,
                        auto: true
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#a0a0a0',
                            maxTicksLimit: 6,
                            callback: function(value, index, values) {
                                if (index % 10 === 0) {
                                    const time = new Date();
                                    return time.toLocaleTimeString();
                                }
                                return '';
                            }
                        },
                        border: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        display: true,
                        beginAtZero: false,
                        min: 40,
                        max: 180,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#a0a0a0',
                            stepSize: 10,
                            callback: function(value) {
                                return value + ' bpm';
                            }
                        },
                        border: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: 60,
                            yMax: 60,
                            borderColor: 'rgba(255, 165, 2, 0.5)',
                            borderWidth: 1,
                            borderDash: [5, 5]
                        },
                        line2: {
                            type: 'line',
                            yMin: 100,
                            yMax: 100,
                            borderColor: 'rgba(255, 107, 107, 0.5)',
                            borderWidth: 1,
                            borderDash: [5, 5]
                        }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        document.addEventListener('heartRateUpdated', (e) => {
            this.updateChart(e.detail);
        });
    }

    updateChart(detail) {
        const now = Date.now();
        if (now - this.lastUpdate < this.updateInterval) {
            return;
        }
        this.lastUpdate = now;

        const heartRate = detail.heartRate;
        const history = detail.history;

        if (heartRate !== null && heartRate !== undefined) {
            this.dataPoints.push({
                x: new Date(),
                y: heartRate
            });

            if (this.dataPoints.length > this.maxDataPoints) {
                this.dataPoints.shift();
            }

            this.chart.data.labels = this.dataPoints.map(() => '');
            this.chart.data.datasets[0].data = this.dataPoints;

            this.chart.update('none');
        }
    }

    reset() {
        this.dataPoints = [];
        this.chart.data.labels = [];
        this.chart.data.datasets[0].data = [];
        this.chart.update();
    }

    updateHeartRateColor(color) {
        if (this.chart) {
            this.chart.data.datasets[0].borderColor = color;
            this.chart.data.datasets[0].pointBorderColor = color;
            this.chart.update();
        }
    }
}
