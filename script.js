// script.js - 梦想引擎核心逻辑

// 数据存储和梦想管理
let dreams = [];
let currentDreamId = null;
const AUTO_SAVINGS_TOTAL = 300; // 每月总智能储蓄金额

// 初始化
function init() {
    loadDreams();
    renderDreamsList();
    checkEmptyState();
}

// 从localStorage加载梦想数据
function loadDreams() {
    const saved = localStorage.getItem('userDreams');
    if (saved) {
        dreams = JSON.parse(saved);
    }
}

// 保存梦想数据到localStorage
function saveDreams() {
    localStorage.setItem('userDreams', JSON.stringify(dreams));
    showSuccess('梦想数据已保存！');
}

// 渲染梦想列表
function renderDreamsList() {
    const dreamsList = document.getElementById('dreamsList');
    if (!dreamsList) return;
    
    dreamsList.innerHTML = '';
    
    dreams.forEach(dream => {
        const progress = (dream.currentSaved / dream.targetAmount) * 100;
        const progressPercent = Math.min(progress, 100).toFixed(1);
        
        const dreamElement = document.createElement('div');
        dreamElement.className = `dream-item ${dream.id === currentDreamId ? 'active' : ''}`;
        dreamElement.innerHTML = `
            <div class="dream-item-header">
                <div class="dream-name">${dream.name}</div>
                <div class="dream-amount">¥${dream.targetAmount}</div>
            </div>
            <div class="dream-progress">
                <div class="dream-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="dream-stats">
                <span>${progressPercent}%</span>
                <span>¥${dream.currentSaved} / ¥${dream.targetAmount}</span>
            </div>
        `;
        
        dreamElement.addEventListener('click', () => selectDream(dream.id));
        dreamsList.appendChild(dreamElement);
    });
}

// 检查空状态
function checkEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const createForm = document.getElementById('createForm');
    const dreamDetail = document.getElementById('dreamDetail');
    
    if (!emptyState || !createForm || !dreamDetail) return;
    
    if (dreams.length === 0) {
        emptyState.classList.remove('hidden');
        createForm.classList.remove('hidden');
        dreamDetail.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        if (currentDreamId) {
            createForm.classList.add('hidden');
            dreamDetail.classList.remove('hidden');
        }
    }
}

// 选择梦想
function selectDream(dreamId) {
    currentDreamId = dreamId;
    renderDreamsList();
    showDreamDetail(dreamId);
    checkEmptyState();
}

// 显示梦想详情
function showDreamDetail(dreamId) {
    const dream = dreams.find(d => d.id === dreamId);
    if (!dream) return;
    
    // 计算智能储蓄分配（基于优先级）
    const priorityWeights = { high: 0.5, medium: 0.3, low: 0.2 };
    const totalWeight = dreams.reduce((sum, d) => sum + priorityWeights[d.priority], 0);
    const autoSavings = Math.round((priorityWeights[dream.priority] / totalWeight) * AUTO_SAVINGS_TOTAL);
    
    // 更新UI
    document.getElementById('detailDreamName').textContent = dream.name;
    document.getElementById('detailTargetAmount').textContent = `¥${dream.targetAmount}`;
    document.getElementById('detailCurrentSaved').textContent = `¥${dream.currentSaved}`;
    
    const progress = (dream.currentSaved / dream.targetAmount) * 100;
    const progressPercent = Math.min(progress, 100);
    document.getElementById('detailProgressFill').style.width = `${progressPercent}%`;
    document.getElementById('detailProgressText').textContent = `${progressPercent.toFixed(1)}%`;
    
    const totalMonthly = dream.monthlySave + autoSavings;
    const monthsNeeded = Math.ceil((dream.targetAmount - dream.currentSaved) / totalMonthly);
    const dailySave = (totalMonthly / 30).toFixed(2);
    
    // 计算完成日期
    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + monthsNeeded);
    
    // 更新详细信息
    document.getElementById('autoSavings').textContent = `¥${autoSavings}`;
    document.getElementById('manualSavings').textContent = `¥${dream.monthlySave}`;
    document.getElementById('totalMonthly').textContent = `¥${totalMonthly}`;
    document.getElementById('priorityBadge').textContent = getPriorityText(dream.priority);
    document.getElementById('detailMonthsNeeded').textContent = monthsNeeded;
    document.getElementById('detailMonthlyAmount').textContent = totalMonthly;
    document.getElementById('detailDailySave').textContent = dailySave;
    document.getElementById('detailCompletionDate').textContent = completionDate.toLocaleDateString();
}

// 获取优先级文本
function getPriorityText(priority) {
    const texts = { high: '高', medium: '中', low: '低' };
    return texts[priority] || '中';
}

// 显示创建表单
function showCreateForm() {
    document.getElementById('createForm').classList.remove('hidden');
    document.getElementById('dreamDetail').classList.add('hidden');
}

// 隐藏创建表单
function hideCreateForm() {
    if (dreams.length > 0 && currentDreamId) {
        document.getElementById('createForm').classList.add('hidden');
        document.getElementById('dreamDetail').classList.remove('hidden');
    }
}

// 创建新梦想
function createDream() {
    const name = document.getElementById('dreamName').value.trim();
    const targetAmount = parseInt(document.getElementById('targetAmount').value);
    const monthlySave = parseInt(document.getElementById('monthlySave').value);
    const priority = document.getElementById('dreamPriority').value;
    
    if (!name || !targetAmount || !monthlySave) {
        alert('请填写完整的梦想信息！');
        return;
    }
    
    // 检查重复
    const isDuplicate = dreams.some(dream => 
        dream.name.toLowerCase() === name.toLowerCase()
    );
    
    if (isDuplicate) {
        alert('已存在同名的梦想，请使用不同的名称！');
        return;
    }
    
    const newDream = {
        id: Date.now(), // 使用时间戳作为唯一ID
        name: name,
        targetAmount: targetAmount,
        monthlySave: monthlySave,
        priority: priority,
        currentSaved: 0,
        createdAt: new Date().toISOString()
    };
    
    dreams.push(newDream);
    currentDreamId = newDream.id;
    
    // 重置表单
    document.getElementById('dreamName').value = '';
    document.getElementById('targetAmount').value = '';
    document.getElementById('monthlySave').value = '';
    
    // 更新UI
    saveDreams();
    renderDreamsList();
    showDreamDetail(newDream.id);
    checkEmptyState();
    
    showSuccess(`梦想"${name}"创建成功！`);
}

// 为当前梦想添加储蓄
function addSavingsToCurrent(amount) {
    if (!currentDreamId) return;
    
    const dream = dreams.find(d => d.id === currentDreamId);
    if (dream) {
        dream.currentSaved += amount;
        saveDreams();
        renderDreamsList();
        showDreamDetail(currentDreamId);
        showSavingsSuccess(amount, dream.name);
    }
}

// 添加自定义金额储蓄
function addCustomSavingsToCurrent() {
    const customAmount = parseInt(document.getElementById('customAmount').value);
    if (customAmount && customAmount > 0) {
        addSavingsToCurrent(customAmount);
        document.getElementById('customAmount').value = '';
    }
}

// 删除当前梦想
function deleteCurrentDream() {
    if (!currentDreamId) return;
    
    if (confirm('确定要删除这个梦想吗？此操作无法撤销。')) {
        dreams = dreams.filter(dream => dream.id !== currentDreamId);
        currentDreamId = dreams.length > 0 ? dreams[0].id : null;
        
        saveDreams();
        renderDreamsList();
        if (currentDreamId) {
            showDreamDetail(currentDreamId);
        }
        checkEmptyState();
        
        showSuccess('梦想已删除');
    }
}

// 显示成功消息
function showSuccess(message) {
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    successMsg.innerHTML = `<strong>✅ ${message}</strong>`;
    document.body.appendChild(successMsg);
    
    setTimeout(() => successMsg.remove(), 3000);
}

// 显示储蓄成功消息
function showSavingsSuccess(amount, dreamName) {
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4ecdc4;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    successMsg.innerHTML = `
        <strong>✅ 存入成功！</strong><br>
        已为"${dreamName}"存入 ¥${amount}
    `;
    document.body.appendChild(successMsg);
    
    setTimeout(() => successMsg.remove(), 3000);
}

// 添加CSS动画
function addGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .hidden {
            display: none;
        }
    `;
    document.head.appendChild(style);
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    addGlobalStyles();
    init();
    
    // 根据用户画像调整默认设置
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile === '月光族') {
        const monthlySaveInput = document.getElementById('monthlySave');
        const targetAmountInput = document.getElementById('targetAmount');
        if (monthlySaveInput) monthlySaveInput.placeholder = '300';
        if (targetAmountInput) targetAmountInput.placeholder = '8000';
    }
});