<template>
	<view class="login-container">
		<!-- Logo区域 -->
		<view class="logo-section">
			<image class="logo" src="/static/images/avatarUrl.png" mode="aspectFit"></image>
			<text class="app-name">回收小助手</text>
		</view>
		
		<!-- 登录表单 -->
		<view class="form-section">
			<!-- 手机号输入 -->
			<view class="input-item">
				<view class="input-label">手机号码</view>
				<input 
					class="input-field" 
					type="number" 
					maxlength="11"
					placeholder="请输入手机号码" 
					v-model="formData.mobile"
					@input="onMobileInput"
				/>
			</view>
			
			<!-- 图片验证码 -->
			<view class="input-item">
				<view class="input-label">图片验证码</view>
				<view class="captcha-row">
					<input 
						class="input-field captcha-input" 
						placeholder="请输入图片验证码" 
						v-model="formData.imageCaptcha"
					/>
					<image 
						class="captcha-image" 
						:src="imageCaptchaUrl" 
						@tap="refreshImageCaptcha"
						mode="widthFix"
					></image>
				</view>
			</view>
			
			<!-- 短信验证码 -->
			<view class="input-item">
				<view class="input-label">短信验证码</view>
				<view class="sms-row">
					<input 
						class="input-field sms-input" 
						type="number"
						maxlength="6"
						placeholder="请输入短信验证码" 
						v-model="formData.smsCode"
					/>
					<button 
						class="sms-button" 
						:class="{ 'disabled': smsButtonDisabled }"
						@tap="getSmsCode"
						:disabled="smsButtonDisabled"
					>
						{{ smsButtonText }}
					</button>
				</view>
			</view>
			
			<!-- 登录按钮 -->
			<button class="login-button" :class="canLogin ? '' : 'disabled'" @tap="login" :disabled="!canLogin">
				登录
			</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			formData: {
				mobile: '',
				imageCaptcha: '',
				smsCode: ''
			},
			imageCaptchaKey: '',
			imageCaptchaUrl: '',
			smsButtonDisabled: false,
			smsButtonText: '获取验证码',
			countdown: 60
		}
	},
	
	computed: {
		canLogin() {
			return this.formData.mobile.length === 11 && 
				   this.formData.imageCaptcha.length > 0 && 
				   this.formData.smsCode.length > 0;
		}
	},
	
	onLoad() {
		this.generateImageCaptcha();
	},
	
	methods: {
		// 生成图片验证码key
		generateCaptchaKey() {
			return 'captcha_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
		},
		
		// 获取图片验证码
		generateImageCaptcha() {
			this.imageCaptchaKey = this.generateCaptchaKey();
			// https://www.yuque.com/apifm/nu0f75/spvwou
			this.imageCaptchaUrl = this.$wxapi.graphValidateCodeUrl(this.imageCaptchaKey);
		},
		
		// 刷新图片验证码
		refreshImageCaptcha() {
			this.formData.imageCaptcha = '';
			this.generateImageCaptcha();
		},
		
		// 手机号输入处理
		onMobileInput(e) {
			let value = e.detail.value;
			// 只保留数字
			value = value.replace(/[^\d]/g, '');
			this.formData.mobile = value;
		},
		
		// 获取短信验证码
		async getSmsCode() {
			// 验证手机号格式
			if (!this.validateMobile()) {
				return;
			}
			
			// 验证图片验证码
			if (!this.formData.imageCaptcha) {
				uni.showToast({
					title: '请输入图片验证码',
					icon: 'none'
				});
				return;
			}
			
			// https://www.yuque.com/apifm/nu0f75/pmoz4u
			const smsResult = await this.$wxapi.smsValidateCode(
				this.formData.mobile,
				this.imageCaptchaKey,
				this.formData.imageCaptcha
			);
			
			if (smsResult.code === 0) {
				uni.showToast({
					title: '验证码已发送',
					icon: 'success'
				});
				this.startCountdown();
			} else {
				uni.showToast({
					title: smsResult.msg || '发送失败',
					icon: 'none'
				});
			}
		},
		
		// 开始倒计时
		startCountdown() {
			this.smsButtonDisabled = true;
			this.countdown = 60;
			this.smsButtonText = `${this.countdown}s后重新获取`;
			
			const timer = setInterval(() => {
				this.countdown--;
				if (this.countdown <= 0) {
					clearInterval(timer);
					this.smsButtonDisabled = false;
					this.smsButtonText = '获取验证码';
				} else {
					this.smsButtonText = `${this.countdown}s后重新获取`;
				}
			}, 1000);
		},
		
		// 验证手机号格式
		validateMobile() {
			const mobileRegex = /^1[3-9]\d{9}$/;
			if (!mobileRegex.test(this.formData.mobile)) {
				uni.showToast({
					title: '请输入正确的手机号',
					icon: 'none'
				});
				return false;
			}
			return true;
		},
		
		// 登录
		async login() {
			if (!this.canLogin) {
				return;
			}
			
			uni.showLoading({
				title: '登录中...'
			});
			
			// https://www.yuque.com/apifm/nu0f75/lqp69z
			const loginResult = await this.$wxapi.loginMobileSmsCode({
				mobile: this.formData.mobile,
				code: this.formData.smsCode,
				autoReg: true // 自动注册
			});
			
			uni.hideLoading();
			
			if (loginResult.code === 0) {
				// 保存登录信息
				this.vuex('token', loginResult.data.token)
				this.vuex('uid', loginResult.data.uid)
				this.vuex('mobile', loginResult.data.mobile)
				
				uni.showToast({
					title: '登录成功',
					icon: 'success'
				});
				
				// 延迟跳转到首页
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/index/index'
					});
				}, 1500);
			} else {
				uni.showToast({
					title: loginResult.msg || '登录失败',
					icon: 'none'
				});
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.login-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 0 40rpx;
	box-sizing: border-box;
}

.logo-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 120rpx;
	padding-bottom: 80rpx;
	
	.logo {
		width: 120rpx;
		height: 120rpx;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
	}
	
	.app-name {
		font-size: 32rpx;
		color: #fff;
		font-weight: bold;
	}
}

.form-section {
	background: #fff;
	border-radius: 20rpx;
	padding: 40rpx;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.input-item {
	margin-bottom: 40rpx;
	
	.input-label {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 16rpx;
		font-weight: 500;
	}
	
	.input-field {
		width: 100%;
		height: 88rpx;
		border: 2rpx solid #e6e6e6;
		border-radius: 12rpx;
		padding: 0 24rpx;
		font-size: 28rpx;
		color: #333;
		box-sizing: border-box;
		
		&:focus {
			border-color: #667eea;
		}
	}
}

.captcha-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	
	.captcha-input {
		flex: 1;
	}
	
	.captcha-image {
		width: 240rpx;
		height: 0;
	}
}

.sms-row {
	display: flex;
	align-items: center;
	gap: 20rpx;
	
	.sms-input {
		flex: 1;
	}
	
	.sms-button {
		width: 200rpx;
		height: 88rpx;
		line-height: 88rpx;
		background: #667eea;
		color: #fff;
		border: none;
		border-radius: 12rpx;
		font-size: 24rpx;
		text-align: center;
		
		&.disabled {
			background: #ccc;
			color: #999;
		}
		
		&::after {
			border: none;
		}
	}
}

.login-button {
	width: 100%;
	height: 88rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	border: none;
	border-radius: 12rpx;
	font-size: 32rpx;
	font-weight: bold;
	margin-top: 40rpx;
	
	&.disabled {
		background: #ccc;
		color: #999;
	}
	
	&::after {
		border: none;
	}
}
</style>