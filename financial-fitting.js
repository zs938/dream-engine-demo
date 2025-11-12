// 金融产品数据库
const financialProducts = {
    'credit-card': {
        name: '返现信用卡',
        type: 'credit-card',
        features: ['餐饮5%返现', '超市3%返现', '其他1%返现', '免年费'],
        annualFee: 0,
        requirements: '大学生专属'
    },
    'investment': {
        name: '余额宝理财',
        type: 'investment',
        features: ['灵活存取', '年化收益2%', '1元起投', '风险极低'],
        expectedReturn: 0.02, // 年化收益率
        minInvestment: 1
    },
    'student-loan': {
        name: '国家助学贷款',
        type: 'loan',
        features: ['免息期', '毕业后还款', '政府贴息', '手续简便'],
        interestRate: 0.04, // 年利率
        gracePeriod: 48 // 免息月数
    }
};

let selectedProduct = null;
let comparisonChart = null;

// 选择产品
function selectProduct(productType) {
    selectedProduct = financialProducts[productType];
    
    // 更新UI状态
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // 显示模拟区域
    const simulationSection = document.getElementById('simulationSection');
    simulationSection.style.display = 'block';
    
    // 更新产品标题
    document.getElementById('productTitle').textContent = `模拟分析：${selectedProduct.name}`;
    
    // 生成对应的输入框
    generateInputs(selectedProduct.type);
    
    // 隐藏之前的结果
    document.getElementById('resultSection').style.display = 'none';
}

// 根据产品类型生成输入框
function generateInputs(productType) {
    const container = document.getElementById('consumptionInputs');
    let html = '';
    
    switch(productType) {
        case 'credit-card':
            html = `
                <div class="input-group">
                    <label>每月餐饮消费 (元)</label>
                    <input type="number" id="diningSpend" value="800" min="0">
                </div>
                <div class="input-group">
                    <label>每月超市消费 (元)</label>
                    <input type="number" id="grocerySpend" value="500" min="0">
                </div>
                <div class="input-group">
                    <label>每月其他消费 (元)</label>
                    <input type="number" id="otherSpend" value="1000" min="0">
                </div>
            `;
            break;
            
        case 'investment':
            html = `
                <div class="input-group">
                    <label>投资金额 (元)</label>
                    <input type="number" id="investmentAmount" value="5000" min="1">
                </div>
                <div class="input-group">
                    <label>投资期限 (月)</label>
                    <input type="number" id="investmentMonths" value="12" min="1">
                </div>
            `;
            break;
            
        case 'student-loan':
            html = `
                <div class="input-group">
                    <label>贷款金额 (元)</label>
                    <input type="number" id="loanAmount" value="8000" min="1000">
                </div>
                <div class="input-group">
                    <label>贷款期限 (月)</label>
                    <input type="number" id="loanMonths" value="24" min="6">
                </div>
            `;
            break;
    }
    
    container.innerHTML = html;
}

// 运行模拟
function runSimulation() {
    if (!selectedProduct) {
        alert('请先选择一个金融产品！');
        return;
    }
    
    let results = {};
    
    switch(selectedProduct.type) {
        case 'credit-card':
            results = simulateCreditCard();
            break;
        case 'investment':
            results = simulateInvestment();
            break;
        case 'student-loan':
            results = simulateLoan();
            break;
    }
    
    displayResults(results);
    renderComparisonChart(results);
    
    // 显示结果区域
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
}

// 模拟信用卡返现
function simulateCreditCard() {
    const diningSpend = parseFloat(document.getElementById('diningSpend').value) || 0;
    const grocerySpend = parseFloat(document.getElementById('grocerySpend').value) || 0;
    const otherSpend = parseFloat(document.getElementById('otherSpend').value) || 0;
    
    const monthlyCashback = 
        (diningSpend * 0.05) + 
        (grocerySpend * 0.03) + 
        (otherSpend * 0.01);
    
    const annualCashback = monthlyCashback * 12;
    const totalSpend = diningSpend + grocerySpend + otherSpend;
    
    return {
        type: 'credit-card',
        monthlySavings: monthlyCashback,
        annualSavings: annualCashback,
        totalSpend: totalSpend,
        cashbackRate: (monthlyCashback / totalSpend * 100).toFixed(1)
    };
}

// 模拟理财产品
function simulateInvestment() {
    const amount = parseFloat(document.getElementById('investmentAmount').value) || 0;
    const months = parseFloat(document.getElementById('investmentMonths').value) || 0;
    
    const monthlyReturn = selectedProduct.expectedReturn / 12;
    const totalReturn = amount * monthlyReturn * months;
    
    return {
        type: 'investment',
        investmentAmount: amount,
        investmentPeriod: months,
        expectedReturn: totalReturn,
        returnRate: (selectedProduct.expectedReturn * 100).toFixed(1)
    };
}

// 模拟贷款产品
function simulateLoan() {
    const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const months = parseFloat(document.getElementById('loanMonths').value) || 0;
    
    const monthlyInterest = selectedProduct.interestRate / 12;
    const totalInterest = amount * monthlyInterest * (months - selectedProduct.gracePeriod);
    
    return {
        type: 'loan',
        loanAmount: amount,
        loanPeriod: months,
        interestSavings: Math.max(0, totalInterest), // 与传统贷款相比节省的利息
        gracePeriod: selectedProduct.gracePeriod
    };
}

// 显示模拟结果
function displayResults(results) {
    const container = document.getElementById('simulationResults');
    let html = '';
    
    switch(results.type) {
        case 'credit-card':
            html = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0;">
                    <div style="text-align: center;">
                        <div style="font-size: 14px; opacity: 0.9;">月均返现</div>
                        <div style="font-size: 24px; font-weight: bold; color: #2ecc71;">¥${results.monthlySavings.toFixed(2)}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; opacity: 0.9;">年返现金额</div>
                        <div style="font-size: 24px; font-weight: bold; color: #2ecc71;">¥${results.annualSavings.toFixed(2)}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; opacity: 0.9;">综合返现率</div>
                        <div style="font-size: 24px; font-weight: bold; color: #3498db;">${results.cashbackRate}%</div>
                    </div>
                </div>
                <p>基于你的消费习惯，这张信用卡每年可为你节省 <strong>¥${results.annualSavings.toFixed(2)}</strong></p >
            `;
            break;
            
        case 'investment':
            html = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0;">
                    <div style="text-align: center;">
                        <div style="font-size: 14px; opacity: 0.9;">投资金额</div>
                        <div style="font-size: 24px; font-weight: bold; color: #3498db;">¥${results.investmentAmount.toFixed(2)}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; opacity: 0.9;">预期收益</div>
                        <div style="font-size: 24px; font-weight: bold; color: #2ecc71;">¥${results.expectedReturn.toFixed(2)}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; opacity: 0.9;">年化收益率</div>
                        <div style="font-size: 24px; font-weight: bold; color: #3498db;">${results.returnRate}%</div>
                    </div>
                </div>
                <p>${results.investmentPeriod}个月后，你的投资预计增值 <strong>¥${results.expectedReturn.toFixed(2)}</strong></p >
            `;
            break;
            
        case 'student-loan':
            html = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0;">
                    <div style="text-align: center;">
                        <div style="font-size: 14px; opacity: 0.9;">贷款金额</div>
                        <div style="font-size: 24px; font-weight: bold; color: #3498db;">¥${results.loanAmount.toFixed(2)}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; opacity: 0.9;">利息节省</div>
                        <div style="font-size: 24px; font-weight: bold; color: #2ecc71;">¥${results.interestSavings.toFixed(2)}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; opacity: 0.9;">免息期</div>
                        <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${results.gracePeriod}个月</div>
                    </div>
                </div>
                <p>与传统贷款相比，这个教育贷款为你节省 <strong>¥${results.interestSavings.toFixed(2)}</strong> 的利息支出</p >
            `;
            break;
    }
    
    container.innerHTML = html;
}

// 渲染对比图表
function renderComparisonChart(results) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    // 销毁之前的图表
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    let labels = [];
    let beforeData = [];
    let afterData = [];
    
    switch(results.type) {
        case 'credit-card':
            labels = ['月消费', '年消费'];
            beforeData = [results.totalSpend, results.totalSpend * 12];
            afterData = [results.totalSpend - results.monthlySavings, (results.totalSpend - results.monthlySavings) * 12];
            break;
            
        case 'investment':
            labels = ['当前资金', '预期资金'];
            beforeData = [results.investmentAmount, results.investmentAmount];
            afterData = [results.investmentAmount, results.investmentAmount + results.expectedReturn];
            break;
            
        case 'student-loan':
            labels = ['传统贷款', '助学贷款'];
            beforeData = [results.interestSavings, 0];
            afterData = [0, results.interestSavings];
            break;
    }
    
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '使用前',
                    data: beforeData,
                    backgroundColor: '#e74c3c'
                },
                {
                    label: '使用后',
                    data: afterData,
                    backgroundColor: '#2ecc71'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 将节省存入梦想
function saveToDream() {
    alert('功能开发中：这里将连接你的梦想引擎，把模拟的节省金额存入特定梦想！');
    // 未来可以连接 localStorage 中的梦想数据
}

// 分享结果
function shareResult() {
    const productName = selectedProduct.name;
    const savings = selectedProduct.type === 'credit-card' ? '月返现' : 
                   selectedProduct.type === 'investment' ? '预期收益' : '利息节省';
    
    alert(`分享文案已复制：\n"我在智囊AIFin的金融试衣间发现${productName}，预计${savings}可观！快来试试你的财务潜力吧！"`);
}