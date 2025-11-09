// FocusTime 学习状态观察系统
class FocusTimeTracker {
    constructor() {
        this.dataKey = 'focusTimeData';
        this.records = this.loadData();
        this.init();
    }

    // 初始化
    init() {
        this.bindEvents();
        this.setDefaultDate();
        this.updateStats();
        this.renderHistory();
        this.setupSpecialEventToggle();
    }

    // 绑定事件
    bindEvents() {
        const form = document.getElementById('dailyForm');
        const clearFormBtn = document.getElementById('clearForm');
        const filterHistoryBtn = document.getElementById('filterHistory');
        const clearFilterBtn = document.getElementById('clearFilter');

        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        clearFormBtn.addEventListener('click', () => this.clearForm());
        filterHistoryBtn.addEventListener('click', () => this.filterHistory());
        clearFilterBtn.addEventListener('click', () => this.clearFilter());

        // 特殊事件复选框事件
        const isSpecialEventCheckbox = document.getElementById('isSpecialEvent');
        isSpecialEventCheckbox.addEventListener('change', () => this.toggleSpecialEventDescription());
    }

    // 设置默认日期为今天
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    // 设置特殊事件描述显示/隐藏
    setupSpecialEventToggle() {
        this.toggleSpecialEventDescription();
    }

    // 切换特殊事件描述显示状态
    toggleSpecialEventDescription() {
        const isSpecialEvent = document.getElementById('isSpecialEvent').checked;
        const specialEventGroup = document.getElementById('specialEventGroup');
        
        if (isSpecialEvent) {
            specialEventGroup.style.display = 'block';
        } else {
            specialEventGroup.style.display = 'none';
            document.getElementById('specialEventDescription').value = '';
        }
    }

    // 处理表单提交
    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const record = {
            id: Date.now(),
            date: formData.get('date'),
            wakeUpTime: formData.get('wakeUpTime') || '',
            bedTime: formData.get('bedTime') || '',
            focusTime: parseFloat(formData.get('focusTime')) || 0,
            resultDescription: formData.get('resultDescription') || '',
            isHoliday: formData.get('isHoliday') === 'on',
            isSpecialEvent: formData.get('isSpecialEvent') === 'on',
            specialEventDescription: formData.get('specialEventDescription') || '',
            createdAt: new Date().toISOString()
        };

        // 验证数据
        if (!record.date) {
            alert('请选择日期');
            return;
        }

        // 检查是否已存在该日期的记录
        const existingIndex = this.records.findIndex(r => r.date === record.date);
        
        if (existingIndex !== -1) {
            if (confirm('该日期已有记录，是否覆盖？')) {
                this.records[existingIndex] = record;
            } else {
                return;
            }
        } else {
            this.records.push(record);
        }

        // 保存数据
        this.saveData();
        
        // 更新界面
        this.updateStats();
        this.renderHistory();
        
        // 显示成功消息
        this.showMessage('记录保存成功！', 'success');
        
        // 清空表单（保留日期）
        this.clearForm(false);
    }

    // 清空表单
    clearForm(clearDate = true) {
        const form = document.getElementById('dailyForm');
        const elements = form.elements;
        
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element.type === 'checkbox') {
                element.checked = false;
            } else if (element.type !== 'submit' && element.type !== 'button') {
                if (element.id === 'date' && !clearDate) {
                    continue; // 不清空日期
                }
                element.value = '';
            }
        }
        
        this.toggleSpecialEventDescription();
    }

    // 更新统计数据
    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = this.records.find(r => r.date === today);
        
        // 今日专注时间
        document.getElementById('todayFocusTime').textContent = 
            todayRecord ? todayRecord.focusTime.toFixed(1) : '0';

        // 本周平均专注时间
        const weekAvg = this.calculateWeekAverage();
        document.getElementById('weekAvgFocusTime').textContent = weekAvg.toFixed(1);

        // 本月总专注时间
        const monthTotal = this.calculateMonthTotal();
        document.getElementById('monthTotalFocusTime').textContent = monthTotal.toFixed(1);

        // 记录天数
        document.getElementById('totalDays').textContent = this.records.length;
    }

    // 计算本周平均专注时间
    calculateWeekAverage() {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // 本周开始（周日）
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // 本周结束（周六）
        weekEnd.setHours(23, 59, 59, 999);

        const weekRecords = this.records.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= weekStart && recordDate <= weekEnd;
        });

        if (weekRecords.length === 0) return 0;

        const totalFocusTime = weekRecords.reduce((sum, record) => sum + record.focusTime, 0);
        return totalFocusTime / weekRecords.length;
    }

    // 计算本月总专注时间
    calculateMonthTotal() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const monthRecords = this.records.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
        });

        return monthRecords.reduce((sum, record) => sum + record.focusTime, 0);
    }

    // 渲染历史记录
    renderHistory(filterDate = null) {
        const historyList = document.getElementById('historyList');
        let recordsToShow = this.records;

        // 如果有过滤日期，只显示该日期的记录
        if (filterDate) {
            recordsToShow = this.records.filter(record => record.date === filterDate);
        }

        // 按日期降序排序
        recordsToShow.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (recordsToShow.length === 0) {
            historyList.innerHTML = '<p class="no-records">暂无记录</p>';
            return;
        }

        historyList.innerHTML = recordsToShow.map(record => this.createHistoryItemHTML(record)).join('');
    }

    // 创建历史记录项HTML
    createHistoryItemHTML(record) {
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });

        let tagsHTML = '';
        if (record.isHoliday) {
            tagsHTML += '<span class="holiday-tag">假期</span>';
        }
        if (record.isSpecialEvent) {
            tagsHTML += '<span class="special-event-tag">特殊事件</span>';
        }

        let specialEventHTML = '';
        if (record.isSpecialEvent && record.specialEventDescription) {
            specialEventHTML = `
                <div class="history-description">
                    <h4>特殊事件</h4>
                    <p>${record.specialEventDescription}</p>
                </div>
            `;
        }

        let resultDescriptionHTML = '';
        if (record.resultDescription) {
            resultDescriptionHTML = `
                <div class="history-description">
                    <h4>结果描述</h4>
                    <p>${record.resultDescription}</p>
                </div>
            `;
        }

        return `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-date">${formattedDate} ${tagsHTML}</div>
                    <div class="history-focus-time">${record.focusTime.toFixed(1)}小时</div>
                </div>
                <div class="history-details">
                    <div class="history-detail-item">
                        <span class="history-detail-label">起床时间</span>
                        <span class="history-detail-value">${record.wakeUpTime || '未记录'}</span>
                    </div>
                    <div class="history-detail-item">
                        <span class="history-detail-label">睡觉时间</span>
                        <span class="history-detail-value">${record.bedTime || '未记录'}</span>
                    </div>
                </div>
                ${specialEventHTML}
                ${resultDescriptionHTML}
            </div>
        `;
    }

    // 筛选历史记录
    filterHistory() {
        const filterDate = document.getElementById('historyDateFilter').value;
        if (!filterDate) {
            alert('请选择筛选日期');
            return;
        }
        this.renderHistory(filterDate);
    }

    // 清除筛选
    clearFilter() {
        document.getElementById('historyDateFilter').value = '';
        this.renderHistory();
    }

    // 显示消息
    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        `;

        // 添加动画样式
        if (!document.getElementById('messageStyles')) {
            const style = document.createElement('style');
            style.id = 'messageStyles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(messageEl);

        // 3秒后自动移除
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    // 从localStorage加载数据
    loadData() {
        try {
            const data = localStorage.getItem(this.dataKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('加载数据失败:', error);
            return [];
        }
    }

    // 保存数据到localStorage
    saveData() {
        try {
            localStorage.setItem(this.dataKey, JSON.stringify(this.records));
        } catch (error) {
            console.error('保存数据失败:', error);
            this.showMessage('数据保存失败，请检查浏览器存储权限', 'error');
        }
    }

    // 导出数据
    exportData() {
        const dataStr = JSON.stringify(this.records, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `focus-time-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('数据导出成功！', 'success');
    }

    // 导入数据
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    this.records = [...this.records, ...importedData];
                    this.saveData();
                    this.updateStats();
                    this.renderHistory();
                    this.showMessage('数据导入成功！', 'success');
                } else {
                    throw new Error('数据格式错误');
                }
            } catch (error) {
                this.showMessage('数据导入失败：' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new FocusTimeTracker();
    
    // 添加一些便利功能
    window.focusTimeApp = app;
    
    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S 保存
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            document.getElementById('dailyForm').dispatchEvent(new Event('submit'));
        }
        
        // Ctrl/Cmd + E 导出数据
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            app.exportData();
        }
    });
    
    console.log('FocusTime 学习状态观察系统已初始化');
    console.log('可用命令：');
    console.log('- window.focusTimeApp.exportData() - 导出数据');
    console.log('- 按 Ctrl+S 快速保存表单');
    console.log('- 按 Ctrl+E 导出数据');
});