// 存储梦想和记录的数据
let dreams = [];
let records = [];

// 页面加载时运行
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    renderDreams();
});

// 创建新梦想
function createDream() {
    const nameInput = document.getElementById('dreamName');
    const targetInput = document.getElementById('dreamTarget');
    
    const name = nameInput.value.trim();
    const target = parseFloat(targetInput.value);
    
    if (!name) {
        alert('请填写梦想名称！');
        return;
    }
    
    if (!target || target <= 0) {
        alert('请填写正确的目标金额！');
        return;
    }

    // 检查是否已有同名梦想
    const existingDream = dreams.find(dream => dream.name === name);
    if (existingDream) {
        alert('已存在同名的梦想，请使用不同的名称！');
        return;
    }

    // 创建梦想对象
    const newDream = {
        id: Date.now(),
        name: name,
        target: target,
        saved: 0,
        progress: 0,
        completed: false,
        created: new Date().toLocaleDateString()
    };

    dreams.push(newDream);
    saveToLocalStorage();
    renderDreams();
    
    nameInput.value = '';
    targetInput.value = '';
    
    alert(`梦想"${name}"创建成功！`);
}

// 自动识别梦想分类
function getDreamCategory(dreamName) {
    const name = dreamName.toLowerCase();
    
    const categories = {
        '电子产品': ['手机', '电脑', '平板', '耳机', 'switch', 'ps5', 'xbox', '相机', '手表', '智能'],
        '学习成长': ['课程', '书籍', '培训', '考研', '留学', '证书', '学习', '教育'],
        '旅行探索': ['旅行', '旅游', '度假', '机票', '酒店', '民宿', '海滩', '雪山'],
        '健康运动': ['健身', '瑜伽', '运动', '跑步', '游泳', '滑雪', '装备', '健康'],
        '生活品质': ['家具', '装修', '家电', '厨具', '床垫', '沙发', '生活'],
        '娱乐休闲': ['游戏', '电影', '音乐', '演唱会', '话剧', '娱乐', '休闲'],
        '服饰美容': ['衣服', '鞋子', '包包', '化妆品', '护肤品', '美容', '服饰']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => name.includes(keyword))) {
            return category;
        }
    }
    
    return '其他梦想';
}

// 计算并显示鼓励信息
function calculateEncouragement(dream) {
    const createdDate = new Date(dream.created);
    const currentDate = new Date();
    const daysPassed = Math.max(1, Math.floor((currentDate - createdDate) / (1000 * 60 * 60 * 24)));
    
    const dailySaving = dream.saved / daysPassed;
    const remainingAmount = dream.target - dream.saved;
    const estimatedDaysLeft = remainingAmount / dailySaving;
    
    let encouragement = '';
    
    if (dream.completed) {
        encouragement = '🎉 恭喜你完成了这个梦想！太棒了！';
    } else if (dailySaving >= dream.target / 30) {
        encouragement = `🚀 超棒！按照这个速度，${Math.ceil(estimatedDaysLeft)}天后就能实现梦想！`;
    } else if (dailySaving >= dream.target / 60) {
        encouragement = `👍 不错哦！保持这个节奏，${Math.ceil(estimatedDaysLeft)}天后就能达成目标！`;
    } else {
        encouragement = `💪 加油！每天存¥${(dream.target / 30).toFixed(2)}就能在一个月内实现梦想！`;
    }
    
    return encouragement;
}

// 更新统计信息
function updateStats() {
    const totalDreams = dreams.length;
    const completedDreams = dreams.filter(dream => dream.completed).length;
    const totalSaved = dreams.reduce((sum, dream) => sum + dream.saved, 0);
    
    document.getElementById('totalDreams').textContent = totalDreams;
    document.getElementById('completedDreams').textContent = completedDreams;
    document.getElementById('totalSaved').textContent = `¥${totalSaved}`;
}

// 显示梦想列表
function renderDreams() {
    const container = document.getElementById('dreamsContainer');
    
    if (dreams.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">还没有梦想，快创建一个吧！</p >';
        return;
    }
    
    container.innerHTML = '';
    
    dreams.forEach(dream => {
        // 计算进度百分比，限制最大为100%
        const progressPercent = Math.min((dream.saved / dream.target * 100).toFixed(1), 100);
        const isCompleted = progressPercent >= 100;
        const encouragement = calculateEncouragement(dream);
        
        // 更新梦想的完成状态
        dream.completed = isCompleted;
        dream.progress = progressPercent;
        
        // 创建梦想卡片HTML
        const dreamCard = document.createElement('div');
        dreamCard.className = `dream-card ${isCompleted ? 'completed' : ''} ${getDreamCategory(dream.name)}`;
        dreamCard.innerHTML = `
            <button class="delete-dream" onclick="deleteDream(${dream.id})">×</button>
            <div class="dream-category">${getDreamCategory(dream.name)}</div>
            <h3>${dream.name}</h3>
            <div class="progress-bar">
                <div class="progress" style="width: ${progressPercent}%">
                    ${progressPercent}%
                </div>
            </div>
            <div class="dream-info">
                <span>已存: ¥${dream.saved}</span>
                <span>目标: ¥${dream.target}</span>
                <span>${isCompleted ? '已完成!' : `${progressPercent}%`}</span>
            </div>
            <div class="encouragement">${encouragement}</div>
        `;
        
        container.appendChild(dreamCard);
    });
    
    // 更新统计面板
    updateStats();
    saveToLocalStorage();
}

// 显示记录弹窗
function showRecordModal() {
    if (dreams.length === 0) {
        alert('请先创建一个梦想！');
        return;
    }
    
    // 获取下拉菜单元素
    const dreamSelect = document.getElementById('dreamSelect');
    dreamSelect.innerHTML = '';
    
    // 只为未完成的梦想添加选项
    const activeDreams = dreams.filter(dream => !dream.completed);
    
    if (activeDreams.length === 0) {
        alert('所有梦想都已完成！请创建新的梦想。');
        return;
    }
    
    // 为每个活跃梦想创建选项
    activeDreams.forEach(dream => {
        const option = document.createElement('option');
        option.value = dream.id;
        option.textContent = `${dream.name} (${dream.progress}%)`;
        dreamSelect.appendChild(option);
    });
    
    document.getElementById('recordModal').style.display = 'block';
}

// 关闭记录弹窗
function closeRecordModal() {
    document.getElementById('recordModal').style.display = 'none';
    document.getElementById('recordAmount').value = '';
}

// 存入梦想
function saveToDream() {
    const amountInput = document.getElementById('recordAmount');
    const dreamSelect = document.getElementById('dreamSelect');
    const amount = parseFloat(amountInput.value);
    
    if (!amount || amount <= 0) {
        alert('请输入有效金额！');
        return;
    }

    // 获取选中的梦想ID
    const selectedDreamId = parseInt(dreamSelect.value);
    const selectedDream = dreams.find(dream => dream.id === selectedDreamId);
    
    if (!selectedDream) {
        alert('请选择要存入的梦想！');
        return;
    }
    
    // 检查梦想是否已完成
    if (selectedDream.completed) {
        alert('这个梦想已经完成了！请选择其他梦想。');
        return;
    }

    // 存入选中的梦想
    selectedDream.saved += amount;
    
    // 记录这笔储蓄
    records.push({
        type: 'saving',
        amount: amount,
        dream: selectedDream.name,
        date: new Date().toLocaleString()
    });

    saveToLocalStorage();
    renderDreams();
    closeRecordModal();
    
    // 检查是否完成梦想
    if (selectedDream.saved >= selectedDream.target) {
        setTimeout(() => {
            alert(`🎉 恭喜！梦想"${selectedDream.name}"已经完成！`);
        }, 300);
    } else {
        alert(`成功为"${selectedDream.name}"存入 ¥${amount}！`);
    }
}

// 删除梦想功能
function deleteDream(dreamId) {
    if (confirm('确定要删除这个梦想吗？')) {
        dreams = dreams.filter(dream => dream.id !== dreamId);
        saveToLocalStorage();
        renderDreams();
    }
}

// 保存到本地存储
function saveToLocalStorage() {
    localStorage.setItem('dreams', JSON.stringify(dreams));
    localStorage.setItem('records', JSON.stringify(records));
}

// 从本地存储加载
function loadFromLocalStorage() {
    const savedDreams = localStorage.getItem('dreams');
    const savedRecords = localStorage.getItem('records');
    
    if (savedDreams) {
        dreams = JSON.parse(savedDreams);
    }
    
    if (savedRecords) {
        records = JSON.parse(savedRecords);
    }
}