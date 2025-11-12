// 套餐数据库 - 基于真实大学生常用套餐
const packageDatabase = [
    {
        name: "移动花卡-青春版",
        operator: "china_mobile",
        price: 29,
        data: 30, // GB
        calls: 100, // 分钟
        sms: 100,
        features: ["定向流量", "校园优惠"],
        link: "https://www.10086.cn",
        popularity: 95
    },
    {
        name: "联通大王卡",
        operator: "china_unicom", 
        price: 39,
        data: 40,
        calls: 200,
        sms: 200,
        features: ["腾讯系免流", "全国通用"],
        link: "https://www.10010.com",
        popularity: 92
    },
    {
        name: "电信星卡",
        operator: "china_telecom",
        price: 35,
        data: 35,
        calls: 150,
        sms: 150,
        features: ["头条系免流", "亲情网"],
        link: "https://www.189.cn",
        popularity: 88
    },
    {
        name: "移动学霸卡",
        operator: "china_mobile",
        price: 48,
        data: 50,
        calls: 300,
        sms: 300,
        features: ["校园网", "视频会员"],
        link: "https://www.10086.cn",
        popularity: 85
    },
    {
        name: "联通冰淇淋",
        operator: "china_unicom",
        price: 56,
        data: 60,
        calls: 500,
        sms: 500,
        features: ["不限量", "5G优享"],
        link: "https://www.10010.com",
        popularity: 82
    }
];

// 更新滑块数值显示
document.getElementById('dataUsage').addEventListener('input', function() {
    document.getElementById('dataValue').textContent = this.value + ' GB';
});

document.getElementById('callUsage').addEventListener('input', function() {
    document.getElementById('callValue').textContent = this.value + ' 分钟';
});

// 核心分析函数
function analyzePackage() {
    const userData = parseInt(document.getElementById('dataUsage').value);
    const userCalls = parseInt(document.getElementById('callUsage').value);
    const userSms = parseInt(document.getElementById('smsUsage').value);
    const currentCost = parseInt(document.getElementById('currentCost').value);
    const operatorPref = document.getElementById('operatorPref').value;
    
    // 验证输入
    if (!currentCost || currentCost <= 0) {
        alert('请输入正确的当前月费！');
        return;
    }
    
    // 匹配算法
    const matchedPackages = packageDatabase
        .filter(pkg => {
            // 运营商筛选
            if (operatorPref !== 'any' && pkg.operator !== operatorPref) {
                return false;
            }
            
            // 基础需求匹配（流量和通话要满足用户需求）
            return pkg.data >= userData && pkg.calls >= userCalls;
        })
        .map(pkg => {
            // 计算匹配度和节省金额
            const monthlySavings = currentCost - pkg.price;
            const matchScore = calculateMatchScore(pkg, userData, userCalls, userSms);
            
            return {
                ...pkg,
                monthlySavings,
                matchScore,
                annualSavings: monthlySavings * 12
            };
        })
        .filter(pkg => pkg.monthlySavings > 0) // 只显示更便宜的套餐
        .sort((a, b) => b.matchScore - a.matchScore); // 按匹配度排序
    
    displayResults(matchedPackages, currentCost);
}

// 计算匹配度评分
function calculateMatchScore(package, userData, userCalls, userSms) {
    let score = 100;
    
    // 价格权重最高
    const priceWeight = 0.4;
    score *= (1 - priceWeight + priceWeight * (100 - package.price) / 100);
    
    // 资源利用率（不浪费）
    const dataUtilization = Math.min(userData / package.data, 1);
    const callUtilization = Math.min(userCalls / package.calls, 1);
    const utilizationScore = (dataUtilization + callUtilization) / 2;
    
    // 流行度
    const popularityScore = package.popularity / 100;
    
    return score * (0.6 + 0.2 * utilizationScore + 0.2 * popularityScore);
}

// 显示推荐结果
function displayResults(packages, currentCost) {
    const resultsContainer = document.getElementById('packageResults');
    const resultSection = document.getElementById('resultSection');
    
    if (packages.length === 0) {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                <h4>😅 暂无更优套餐</h4>
                <p>基于你的使用习惯，我们暂时没有找到比当前套餐更划算的选择</p >
                <p>当前月费：<strong>¥${currentCost}</strong></p >
            </div>
        `;
    } else {
        let html = `
            <div style="margin-bottom: 20px; padding: 15px; background: #ecf0f1; border-radius: 8px;">
                <strong>当前套餐：¥${currentCost}/月</strong>
            </div>
        `;
        
        packages.forEach((pkg, index) => {
            const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
            const operatorNames = {
                'china_mobile': '中国移动',
                'china_unicom': '中国联通', 
                'china_telecom': '中国电信'
            };
            
            html += `
                <div class="package-card">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h3 style="margin: 0 0 10px 0;">${rankEmoji} ${pkg.name}</h3>
                            <p style="margin: 5px 0; opacity: 0.9;">${operatorNames[pkg.operator]}</p >
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 24px; font-weight: bold;">¥${pkg.price}</div>
                            <div style="font-size: 14px; opacity: 0.9;">/月</div>
                        </div>
                    </div>
                    
                    <div style="margin: 15px 0; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>📱 流量：${pkg.data}GB</span>
                            <span>📞 通话：${pkg.calls}分钟</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>💬 短信：${pkg.sms}条</span>
                            <span>⭐ 匹配度：${Math.round(pkg.matchScore)}%</span>
                        </div>
                    </div>
                    
                    <div style="margin: 15px 0;">
                        ${pkg.features.map(feature => `<span style="background: rgba(255,255,255,0.3); padding: 4px 8px; border-radius: 12px; margin-right: 8px; font-size: 12px;">${feature}</span>`).join('')}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #2ecc71;">每月节省：¥${pkg.monthlySavings}</strong>
                            <br>
                            <small>一年节省：¥${pkg.annualSavings}</small>
                        </div>
                        <button onclick="redirectToPackage('${pkg.link}')" style="background: white; color: #e74c3c; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                            立即办理
                        </button>
                    </div>
                </div>
            `;
        });
        
        resultsContainer.innerHTML = html;
    }
    
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// 跳转到办理页面
function redirectToPackage(url) {
    if (confirm('即将跳转到运营商官方页面办理套餐，确定要继续吗？')) {
        window.open(url, '_blank');
    }
}