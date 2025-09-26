/**
 * 废品回收应用分享图生成脚本
 * 生成1:1尺寸的分享图，用于微信、微博等社交平台分享
 */

// 如果在Node.js环境中运行，可以使用puppeteer生成图片
const generateShareImage = async () => {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>废品回收 - 分享图</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
            background: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        
        .share-card {
            width: 800px;
            height: 800px;
            background: linear-gradient(135deg, #3ED09F 0%, #48C5A8 50%, #2EA88B 100%);
            border-radius: 40px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(62, 208, 159, 0.3);
        }
        
        .bg-pattern {
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0.1;
            background-image: 
                radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 2px, transparent 2px),
                radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 2px, transparent 2px),
                radial-gradient(circle at 40% 60%, rgba(255,255,255,0.2) 1px, transparent 1px);
            background-size: 60px 60px, 80px 80px, 40px 40px;
        }
        
        .content {
            position: relative;
            z-index: 2;
            padding: 60px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            text-align: center;
        }
        
        .header {
            margin-bottom: 40px;
        }
        
        .app-icon {
            width: 120px;
            height: 120px;
            background: rgba(255,255,255,0.95);
            border-radius: 24px;
            margin: 0 auto 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            backdrop-filter: blur(10px);
        }
        
        .recycle-icon {
            font-size: 60px;
            color: #3ED09F;
            font-weight: 900;
        }
        
        .app-title {
            font-size: 48px;
            font-weight: 800;
            color: white;
            margin-bottom: 16px;
            text-shadow: 0 3px 12px rgba(0,0,0,0.2);
            letter-spacing: 2px;
        }
        
        .app-subtitle {
            font-size: 24px;
            color: rgba(255,255,255,0.95);
            font-weight: 500;
            letter-spacing: 1px;
        }
        
        .features {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin: 40px 0;
        }
        
        .feature-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .feature-item {
            background: rgba(255,255,255,0.18);
            border-radius: 20px;
            padding: 30px 20px;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255,255,255,0.25);
            transition: transform 0.3s ease;
        }
        
        .feature-item:hover {
            transform: translateY(-2px);
        }
        
        .feature-icon {
            font-size: 36px;
            margin-bottom: 12px;
            display: block;
        }
        
        .feature-title {
            font-size: 20px;
            font-weight: 700;
            color: white;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
        }
        
        .feature-desc {
            font-size: 14px;
            color: rgba(255,255,255,0.9);
            line-height: 1.5;
        }
        
        .highlight-text {
            font-size: 32px;
            font-weight: 800;
            color: white;
            text-align: center;
            margin: 30px 0;
            text-shadow: 0 3px 12px rgba(0,0,0,0.2);
            letter-spacing: 1px;
        }
        
        .footer {
            text-align: center;
        }
        
        .qr-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            background: rgba(255,255,255,0.15);
            border-radius: 20px;
            padding: 20px;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255,255,255,0.25);
        }
        
        .qr-placeholder {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #666;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            font-weight: 600;
        }
        
        .scan-text {
            font-size: 18px;
            color: white;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        
        .eco-elements {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
        }
        
        .leaf {
            position: absolute;
            font-size: 28px;
            color: rgba(255,255,255,0.25);
            animation: float 8s ease-in-out infinite;
        }
        
        .leaf:nth-child(1) {
            top: 8%;
            left: 8%;
            animation-delay: 0s;
        }
        
        .leaf:nth-child(2) {
            top: 15%;
            right: 12%;
            animation-delay: 2s;
        }
        
        .leaf:nth-child(3) {
            bottom: 12%;
            left: 12%;
            animation-delay: 4s;
        }
        
        .leaf:nth-child(4) {
            bottom: 20%;
            right: 8%;
            animation-delay: 1s;
        }
        
        .leaf:nth-child(5) {
            top: 50%;
            left: 5%;
            animation-delay: 3s;
        }
        
        .leaf:nth-child(6) {
            top: 45%;
            right: 5%;
            animation-delay: 5s;
        }
        
        @keyframes float {
            0%, 100% { 
                transform: translateY(0px) rotate(0deg) scale(1); 
                opacity: 0.25;
            }
            33% { 
                transform: translateY(-8px) rotate(3deg) scale(1.05); 
                opacity: 0.4;
            }
            66% { 
                transform: translateY(-4px) rotate(-2deg) scale(0.95); 
                opacity: 0.35;
            }
        }
    </style>
</head>
<body>
    <div class="share-card">
        <div class="bg-pattern"></div>
        
        <div class="eco-elements">
            <div class="leaf">🍃</div>
            <div class="leaf">🌿</div>
            <div class="leaf">🍃</div>
            <div class="leaf">🌱</div>
            <div class="leaf">🌿</div>
            <div class="leaf">🍃</div>
        </div>
        
        <div class="content">
            <div class="header">
                <div class="app-icon">
                    <div class="recycle-icon">回</div>
                </div>
                <h1 class="app-title">废品回收</h1>
                <p class="app-subtitle">让闲置物品重获新生</p>
            </div>
            
            <div class="features">
                <div class="feature-list">
                    <div class="feature-item">
                        <div class="feature-icon">📱</div>
                        <div class="feature-title">预约上门</div>
                        <div class="feature-desc">一键下单<br>师傅上门回收</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🏪</div>
                        <div class="feature-title">到店回收</div>
                        <div class="feature-desc">就近选择<br>门店自助回收</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">💰</div>
                        <div class="feature-title">现金收益</div>
                        <div class="feature-desc">废品变现金<br>环保又赚钱</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🌍</div>
                        <div class="feature-title">绿色环保</div>
                        <div class="feature-desc">减少浪费<br>保护地球</div>
                    </div>
                </div>
                
                <div class="highlight-text">
                    ♻️ 变废为宝，绿色生活 ♻️
                </div>
            </div>
            
            <div class="footer">
                <div class="qr-section">
                    <div class="qr-placeholder">
                        二维码
                    </div>
                    <div class="scan-text">扫码体验<br>废品回收小程序</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
    
    return html;
};

// 使用说明
console.log(`
废品回收应用分享图生成器
========================

使用方法：
1. 在浏览器中打开 share-image.html 文件
2. 截屏或使用浏览器的打印功能保存为PDF
3. 使用设计软件转换为PNG/JPG格式

技术实现：
- 如果需要自动化生成，可以使用 puppeteer 库
- npm install puppeteer
- 然后使用以下代码自动生成图片：

const puppeteer = require('puppeteer');

async function generateImage() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 800 });
    await page.setContent(html);
    await page.screenshot({ 
        path: 'recycle-share-image.png',
        clip: { x: 0, y: 0, width: 800, height: 800 }
    });
    await browser.close();
}

设计特色：
✅ 1:1 正方形尺寸 (800x800px)
✅ 使用应用主题色彩 (#3ED09F 绿色渐变)
✅ 突出"废品回收"应用名称
✅ 展示四大核心功能
✅ 环保主题的视觉元素
✅ 预留二维码位置
✅ 适合社交媒体分享
`);

module.exports = { generateShareImage };
