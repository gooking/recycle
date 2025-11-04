<template>
	<view class="course-detail" v-if="courseInfoV2Data">
		<!-- 顶部轮播图 -->
		<swiper class="course-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500">
			<swiper-item v-for="(pic, index) in courseInfoV2Data.pics" :key="index">
				<image :src="pic.pic" mode="aspectFill" class="swiper-image"></image>
			</swiper-item>
		</swiper>

		<!-- 课程基本信息 -->
		<view class="course-info">
			<view class="course-title">{{ courseInfoV2Data.info.name }}</view>
			<view class="course-meta">
				<view class="meta-item">
					<text class="meta-label">授课方式：</text>
					<text>{{ courseInfoV2Data.info.type == 0 ? '线上' : '线下课' }}</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">开始时间：</text>
					<text>{{ courseInfoV2Data.info.dayStart }}</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">结束时间：</text>
					<text>{{ courseInfoV2Data.info.dayEnd }}</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">课程价格：</text>
					<text
						class="price">{{ courseInfoV2Data.info.price == 0 ? '免费' : '¥' + courseInfoV2Data.info.price }}</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">课程时长：</text>
					<text>{{ courseInfoV2Data.info.minutes }}分钟</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">浏览量：</text>
					<text>{{ courseInfoV2Data.info.numberViews }}</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">已购数量：</text>
					<text>{{ courseInfoV2Data.info.numberBuy }}</text>
				</view>
			</view>
		</view>

		<!-- 可选场次 -->
		<view class="session-list" v-if="courseInfoV2Data.sessionList && courseInfoV2Data.sessionList.length > 0">
			<view class="section-title">可选场次</view>
			<view class="session-item" v-for="(session, index) in courseInfoV2Data.sessionList" :key="index">
				<view class="session-info">
					<text class="session-name">{{ session.name }}</text>
					<text class="session-time">{{ session.time }}</text>
				</view>
				<view class="session-status">
					<text>可报名</text>
					<!-- <text>已满</text>
					<text>已结束</text> -->
				</view>
			</view>
		</view>

		<!-- 课程报名记录 -->
		<view class="buy-log-section" v-if="buyLogList && buyLogList.length > 0">
			<view class="section-title">报名记录</view>
			<view class="buy-log-list">
				<view class="buy-log-item" v-for="(log, index) in buyLogList" :key="index">
					<image class="user-avatar" :src="log.avatarUrl || '/static/images/avatarUrl.png'" mode="aspectFill"></image>
					<view class="log-info">
						<view class="user-name">{{ log.nickname }}</view>
						<view class="log-detail">
							<text class="detail-item">报名人数：{{ log.number }}</text>
							<text class="detail-item">手机号：{{ log.mobile }}</text>
						</view>
						<view class="log-time">{{ log.dateAdd }}</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 富文本内容 -->
		<view class="content-sections">
			<view class="content-section" v-for="(item, index) in courseInfoV2Data.contents" :key="index">
				<view class="section-title">{{ getSectionTitle(item.type) }}</view>
				<view class="section-content">
					<mp-html :content="item.content" />
				</view>
			</view>
		</view>

		<!-- 底部报名按钮 -->
		<view class="footer-bar">
			<view class="footer-price">
				<text class="price-label">报名费：</text>
				<text
					class="price-value">{{ courseInfoV2Data.info.price == 0 ? '免费' : '¥' + courseInfoV2Data.info.price }}</text>
			</view>
			<view class="signup-btn" @click="showSignupModal">
				立即报名
			</view>
		</view>

		<!-- 报名弹窗 -->
		<view class="signup-modal" v-if="signupModalVisible" @click="closeSignupModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">填写报名信息</text>
					<text class="modal-close" @click="closeSignupModal">✕</text>
				</view>

				<view class="modal-body">
					<!-- 场次选择 -->
					<view class="form-item">
						<view class="form-label">选择场次<text class="required">*</text></view>
						<picker mode="selector" :range="sessionOptions" range-key="name" @change="onSessionChange"
							:value="formData.sessionIndex">
							<view class="picker-view">
								<text :class="formData.sessionId ? '' : 'placeholder'">
									{{ formData.sessionId ? sessionOptions[formData.sessionIndex].name : '请选择场次' }}
								</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>

					<!-- 姓名 -->
					<view class="form-item">
						<view class="form-label">姓名<text class="required">*</text></view>
						<input class="form-input" v-model="formData.name" placeholder="请输入您的姓名"
							placeholder-class="input-placeholder" />
					</view>

					<!-- 手机号 -->
					<view class="form-item">
						<view class="form-label">手机号<text class="required">*</text></view>
						<input class="form-input" v-model="formData.mobile" placeholder="请输入您的手机号" type="number"
							maxlength="11" placeholder-class="input-placeholder" />
					</view>

					<!-- 报名人数 -->
					<view class="form-item">
						<view class="form-label">报名人数<text class="required">*</text></view>
						<input class="form-input" v-model.number="formData.number" placeholder="请输入报名人数" type="number"
							placeholder-class="input-placeholder" />
					</view>
				</view>

				<view class="modal-footer">
					<view class="modal-btn cancel-btn" @click="closeSignupModal">取消</view>
					<view class="modal-btn confirm-btn" @click="submitSignup">确认报名</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: undefined,
				courseInfoV2Data: undefined,
				buyLogList: [], // 课程报名记录列表
				signupModalVisible: false, // 报名弹窗显示状态
				formData: {
					sessionId: '', // 场次ID
					sessionIndex: 0, // 场次索引
					shopId: '', // 场次对应的商户ID
					name: '', // 姓名
					mobile: '', // 手机号
					number: 1, // 报名人数
				}
			}
		},
		computed: {
			// 场次选项列表
			sessionOptions() {
				if (this.courseInfoV2Data && this.courseInfoV2Data.sessionList) {
					return this.courseInfoV2Data.sessionList
				}
				return []
			}
		},
		onLoad(e) {
			this.id = e.id
			this.courseInfoV2()
			this.getCourseBuyLog()
		},
		onShareAppMessage() {
			return {
				title: this.courseInfoV2Data.info.name,
				path: '/pages/index/index?inviter_id=' + (this.uid || '') + '&id=' + this.id,
				imageUrl: this.courseInfoV2Data.info.pic,
			}
		},
		onShareTimeline() {
			return {
				title: this.courseInfoV2Data.info.name,
				query: 'inviter_id=' + (this.uid || '') + '&id=' + this.id,
				imageUrl: this.courseInfoV2Data.info.pic,
			}
		},
		methods: {
			async courseInfoV2() {
				uni.showLoading({
					title: ''
				})
				// https://www.yuque.com/apifm/nu0f75/kloyi3tazh46g879
				const res = await this.$wxapi.courseInfoV2(this.id)
				uni.hideLoading()
				if (res.code != 0) {
					uni.showModal({
						content: res.msg,
						showCancel: false,
						success: () => {
							uni.navigateBack()
						}
					})
					return
				}
				this.courseInfoV2Data = res.data
			},
			// 获取课程报名记录
			async getCourseBuyLog() {
				// https://www.yuque.com/apifm/nu0f75/rphf104wgympn1pm
				const res = await this.$wxapi.courseBuyLogPublicV2({
					courseId: this.id,
					pageSize: 200
				})
				if (res.code == 0) {
					res.data.result.forEach(ele => {
						const userMap = res.data.userMap[ele.uid]
						if(userMap) {
							ele.nick = userMap.nick
							ele.avatarUrl = userMap.avatarUrl
							ele.mobile = userMap.mobile
						}
					})
					this.buyLogList = res.data.result
				}
			},
			getSectionTitle(type) {
				const titleMap = {
					'location': '上课地点',
					'intro': '课程介绍',
					'notice': '课程须知'
				}
				return titleMap[type] || '详情'
			},
			// 显示报名弹窗
			showSignupModal() {
				// 检查是否有可选场次
				if (!this.sessionOptions || this.sessionOptions.length === 0) {
					uni.showToast({
						title: '暂无可报名场次',
						icon: 'none'
					})
					return
				}
				this.signupModalVisible = true
			},
			// 关闭报名弹窗
			closeSignupModal() {
				this.signupModalVisible = false
				// 清空表单
				this.formData = {
					sessionId: '',
					sessionIndex: 0,
					shopId: '',
					name: '',
					mobile: '',
					number: 1,
				}
			},
			// 场次选择变化
			onSessionChange(e) {
				const index = e.detail.value
				const selectedSession = this.sessionOptions[index]
				this.formData.sessionIndex = index
				this.formData.sessionId = selectedSession.id
				this.formData.shopId = selectedSession.shopId
			},
			// 验证表单
			validateForm() {
				if (!this.formData.sessionId) {
					uni.showToast({
						title: '请选择场次',
						icon: 'none'
					})
					return false
				}
				if (!this.formData.name || !this.formData.name.trim()) {
					uni.showToast({
						title: '请输入姓名',
						icon: 'none'
					})
					return false
				}
				if (!this.formData.mobile) {
					uni.showToast({
						title: '请输入手机号',
						icon: 'none'
					})
					return false
				}
				// 验证手机号格式
				const phoneReg = /^1[3-9]\d{9}$/
				if (!phoneReg.test(this.formData.mobile)) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					return false
				}
				if (!this.formData.number || this.formData.number < 1) {
					uni.showToast({
						title: '请输入正确的报名人数',
						icon: 'none'
					})
					return false
				}
				return true
			},
			// 提交报名
			async submitSignup() {
				// 验证表单
				if (!this.validateForm()) {
					return
				}
				// 调用报名接口
				await this.handleSignup()
			},
			// 报名接口
			async handleSignup() {
				uni.showLoading({
					title: '提交中...'
				})
				// https://www.yuque.com/apifm/nu0f75/is1p94tizfosq90u
				const res = await this.$wxapi.courseInfoBuyV2({
					token: this.token,
					courseId: this.id,
					sessionId: this.formData.sessionId,
					shopId: this.formData.shopId,
					name: this.formData.name,
					mobile: this.formData.mobile,
					number: this.formData.number,
				})
				uni.hideLoading()
				if (res.code == 0) {
					// 关闭弹窗
					this.closeSignupModal()
					// 判断是否需要支付
					let payAmount = res.data.payAmount
					if(payAmount > 0) {
						// https://www.yuque.com/apifm/nu0f75/wrqkcb
						const resAmount = await this.$wxapi.userAmountV2(this.token)
						if(resAmount.code == 0) {
							payAmount -= resAmount.data.balance
							if(payAmount <= 0) {
								payAmount = 0
							}
						}
					}
					if (!payAmount) {
						// 使用余额支付 https://www.yuque.com/apifm/nu0f75/oxf9lrgmd4xizw7w
						const resPay = await this.$wxapi.courseInfoBuyLogPayV2(this.token, res.data.id)
						if (resPay.code == 0) {
							uni.showModal({
								content: '报名成功',
								showCancel: false
							})
							// 刷新报名记录
							this.getCourseBuyLog()
						} else {
							uni.showModal({
								content: resPay.msg,
								showCancel: false
							})
						}
					} else {
						// 发起微信支付
						this.onlinePay(res.data.id, payAmount)
					}
				} else {
					// 报名失败
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			},
			/**
			 * 在线支付
			 */
			async onlinePay(buyLogId, payAmount) {
				// #ifdef H5
				this.onlinePayH5(buyLogId, payAmount)
				// #endif
				// #ifdef MP-WEIXIN
				this.onlinePayMpWX(buyLogId, payAmount)
				// #endif
			},
			/**
			 * 在线支付[H5]
			 */
			async onlinePayH5(buyLogId, payAmount) {
				uni.showLoading({
					title: ''
				})
				const nextAction = {
					type: 15,
					id: buyLogId
				}
				// 发起H5支付 https://www.yuque.com/apifm/nu0f75/pv7gll
				const res = await this.$wxapi.wxpayH5({
					token: this.token,
					money: payAmount,
					payName: '支付课程报名费:' + buyLogId,
					nextAction: JSON.stringify(nextAction),
				})
				uni.hideLoading()
				if (res.code == 0) {
					location.href = res.data.mweb_url
				} else {
					uni.showModal({
						content: res.msg,
						showCancel: false
					})
				}
			},
			/**
			 * 在线支付[微信小程序]
			 */
			async onlinePayMpWX(buyLogId, payAmount) {
				uni.showLoading({
					title: ''
				})
				const nextAction = {
					type: 15,
					id: buyLogId
				}
				// 微信小程序支付https://www.yuque.com/apifm/nu0f75/kffu74
				const res = await this.$wxapi.wxpay({
					token: this.token,
					money: payAmount,
					payName: '支付课程报名费:' + buyLogId,
					nextAction: JSON.stringify(nextAction),
				})
				uni.hideLoading()
				if (res.code == 0) {
					uni.requestPayment({
						timeStamp: res.data.timeStamp,
						nonceStr: res.data.nonceStr,
						package: res.data.package,
						signType: res.data.signType,
						paySign: res.data.paySign,
						fail: (err) => {
							console.error(err);
						},
						success: () => {
							uni.showModal({
								content: '报名成功',
								showCancel: false
							})
							// 刷新报名记录
							this.getCourseBuyLog()
						}
					})
				} else {
					uni.showModal({
						content: res.msg,
						showCancel: false
					})
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.course-detail {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 120rpx;
	}

	/* 轮播图 */
	.course-swiper {
		width: 100%;
		height: 400rpx;

		.swiper-image {
			width: 100%;
			height: 100%;
		}
	}

	/* 课程基本信息 */
	.course-info {
		background-color: #fff;
		padding: 30rpx;
		margin-bottom: 20rpx;

		.course-title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 20rpx;
			line-height: 1.5;
		}

		.course-meta {
			.meta-item {
				display: flex;
				align-items: center;
				padding: 12rpx 0;
				font-size: 28rpx;
				color: #666;

				.meta-label {
					color: #999;
					margin-right: 10rpx;
				}

				.price {
					color: #ff4d4f;
					font-weight: bold;
					font-size: 32rpx;
				}
			}
		}
	}

	/* 场次列表 */
	.session-list {
		background-color: #fff;
		padding: 30rpx;
		margin-bottom: 20rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 20rpx;
			padding-bottom: 15rpx;
			border-bottom: 2rpx solid #f0f0f0;
		}

		.session-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx;
			margin-bottom: 15rpx;
			background-color: #fafafa;
			border-radius: 10rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.session-info {
				flex: 1;

				.session-name {
					display: block;
					font-size: 30rpx;
					color: #333;
					margin-bottom: 10rpx;
				}

				.session-time {
					display: block;
					font-size: 24rpx;
					color: #999;
				}
			}

			.session-status {
				font-size: 26rpx;
				padding: 8rpx 20rpx;
				border-radius: 20rpx;
				background-color: #52c41a;
				color: #fff;
			}
		}
	}

	/* 课程报名记录 */
	.buy-log-section {
		background-color: #fff;
		padding: 30rpx;
		margin-bottom: 20rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 20rpx;
			padding-bottom: 15rpx;
			border-bottom: 2rpx solid #f0f0f0;
		}

		.buy-log-list {
			.buy-log-item {
				display: flex;
				padding: 20rpx;
				margin-bottom: 15rpx;
				background-color: #fafafa;
				border-radius: 10rpx;

				&:last-child {
					margin-bottom: 0;
				}

				.user-avatar {
					width: 80rpx;
					height: 80rpx;
					border-radius: 50%;
					margin-right: 20rpx;
					flex-shrink: 0;
				}

				.log-info {
					flex: 1;
					display: flex;
					flex-direction: column;
					justify-content: center;

					.user-name {
						font-size: 30rpx;
						color: #333;
						font-weight: bold;
						margin-bottom: 8rpx;
					}

					.log-detail {
						display: flex;
						flex-wrap: wrap;
						margin-bottom: 8rpx;

						.detail-item {
							font-size: 26rpx;
							color: #666;
							margin-right: 20rpx;
						}
					}

					.log-time {
						font-size: 24rpx;
						color: #999;
					}
				}
			}
		}
	}

	/* 富文本内容 */
	.content-sections {
		.content-section {
			background-color: #fff;
			padding: 30rpx;
			margin-bottom: 20rpx;

			.section-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 20rpx;
				padding-bottom: 15rpx;
				border-bottom: 2rpx solid #f0f0f0;
			}

			.section-content {
				font-size: 28rpx;
				color: #666;
				line-height: 1.8;
			}
		}
	}

	/* 底部栏 */
	.footer-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 30rpx;
		background-color: #fff;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
		z-index: 999;

		.footer-price {
			display: flex;
			align-items: baseline;

			.price-label {
				font-size: 28rpx;
				color: #999;
				margin-right: 10rpx;
			}

			.price-value {
				font-size: 36rpx;
				font-weight: bold;
				color: #ff4d4f;
			}
		}

		.signup-btn {
			padding: 20rpx 60rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: #fff;
			font-size: 32rpx;
			font-weight: bold;
			border-radius: 50rpx;
			box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
			transition: all 0.3s;

			&:active {
				opacity: 0.8;
				transform: scale(0.98);
			}
		}
	}

	/* 报名弹窗 */
	.signup-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;

		.modal-content {
			width: 600rpx;
			background-color: #fff;
			border-radius: 20rpx;
			overflow: hidden;
			max-height: 80vh;
			display: flex;
			flex-direction: column;
		}

		.modal-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 30rpx;
			border-bottom: 1rpx solid #eee;

			.modal-title {
				font-size: 34rpx;
				font-weight: bold;
				color: #333;
			}

			.modal-close {
				font-size: 40rpx;
				color: #999;
				padding: 0 10rpx;
			}
		}

		.modal-body {
			flex: 1;
			overflow-y: auto;
			padding: 30rpx;

			.form-item {
				margin-bottom: 30rpx;

				&:last-child {
					margin-bottom: 0;
				}

				.form-label {
					font-size: 28rpx;
					color: #333;
					margin-bottom: 15rpx;

					.required {
						color: #ff4d4f;
						margin-left: 5rpx;
					}
				}

				.picker-view {
					display: flex;
					align-items: center;
					justify-content: space-between;
					height: 80rpx;
					padding: 0 20rpx;
					background-color: #f5f5f5;
					border-radius: 10rpx;
					font-size: 28rpx;

					.placeholder {
						color: #999;
					}

					.picker-arrow {
						color: #999;
						font-size: 20rpx;
					}
				}

				.form-input {
					width: 100%;
					height: 80rpx;
					padding: 0 20rpx;
					background-color: #f5f5f5;
					border-radius: 10rpx;
					font-size: 28rpx;
					color: #333;
					box-sizing: border-box;
				}

				.input-placeholder {
					color: #999;
				}
			}
		}

		.modal-footer {
			display: flex;
			gap: 20rpx;
			padding: 30rpx;
			border-top: 1rpx solid #eee;

			.modal-btn {
				flex: 1;
				height: 80rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 40rpx;
				font-size: 30rpx;
				font-weight: bold;

				&:active {
					opacity: 0.8;
				}
			}

			.cancel-btn {
				background-color: #f5f5f5;
				color: #666;
			}

			.confirm-btn {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: #fff;
			}
		}
	}
</style>