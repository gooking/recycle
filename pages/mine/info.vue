<template>
	<view v-if="apiUserInfoMap && apiUserInfoMap.base" class="info">

		<!-- 头像区域 -->
		<view class="avatar-section">
			<view class="avatar-container">
				<image :src="apiUserInfoMap.base.avatarUrl || '/static/images/avatarUrl.png'" class="avatar"
					mode="aspectFill"></image>
				<view class="camera-icon">
					<uni-icons type="camera" size="48rpx" color="#fff"></uni-icons>
				</view>
				<!-- #ifdef MP-WEIXIN -->
				<button class="btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar"></button>
				<!-- #endif -->
				<!-- #ifndef MP-WEIXIN -->
				<button class="btn" @click="changeAvatar"></button>
				<!-- #endif -->
			</view>
		</view>

		<!-- 个人信息表单 -->
		<view class="form-section">
			<!-- 名称 -->
			<view class="form-item">
				<text class="label">昵称</text>
				<view class="input-container">
					<input type="nickname" :value="apiUserInfoMap.base.nick" class="input" placeholder="请输入昵称"
						@confirm="editNick" />
				</view>
			</view>

			<view class="form-row">
				<view class="form-item half">
					<text class="label">生日</text>
					<view class="input-container">
						<uni-datetime-picker class="input" type="date" return-type="string" @change="editBirthday">
							<input type="text" class="input" :value="apiUserInfoMap.base.birthday || '请选择'" disabled />
						</uni-datetime-picker>
						<uni-icons type="right" size="32rpx" color="#999"></uni-icons>
					</view>
				</view>
				<view class="form-item half">
					<text class="label">性别</text>
					<view class="input-container" @click="editGender">
						<input type="text" class="input" disabled :value="apiUserInfoMap.base.genderStr || '请选择'" />
						<uni-icons type="right" size="32rpx" color="#999"></uni-icons>
					</view>
				</view>
			</view>

			<!-- #ifdef MP-WEIXIN -->
			<view class="form-item">
				<text class="label">绑定手机</text>
				<view class="input-container">
					<input type="text" :value="apiUserInfoMap.base.mobile || '还未绑定'" class="input" disabled />
					<uni-icons type="right" size="32rpx" color="#999"></uni-icons>
					<button class="btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber"></button>
				</view>
			</view>
			<!-- #endif -->
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {}
		},

		onLoad() {
			getApp().getUserApiInfo()
		},

		methods: {
			async modifyUserInfoV2(postData) {
				// https://www.yuque.com/apifm/nu0f75/ykr2zr
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.modifyUserInfoV2(postData)
				uni.hideLoading()
				if (res.code != 0) {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
					return
				}
				uni.showToast({
					title: '设置成功',
				})
				getApp().getUserApiInfo()
			},
			async onChooseAvatar(e) {
				const avatarUrl = e.detail.avatarUrl
				// https://www.yuque.com/apifm/nu0f75/ygvqh6
				uni.showLoading({
					title: ''
				})
				let res = await this.$wxapi.uploadFileV2(this.token, avatarUrl)
				uni.hideLoading()
				if (res.code != 0) {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
					return
				}
				this.modifyUserInfoV2({
					token: this.token,
					avatarUrl: res.data.url,
				})
			},
			changeAvatar() {
				// 更换头像逻辑
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						// 处理选择的图片
						console.log('选择的图片:', res.tempFilePaths);
					}
				});
			},
			async editNick(e) {
				if (!e.detail.value) {
					uni.showToast({
						title: '请填写昵称',
						icon: 'none'
					})
					return
				}
				this.modifyUserInfoV2({
					token: this.token,
					nick: e.detail.value,
				})
			},
			async editBirthday(birthday) {
				this.modifyUserInfoV2({
					token: this.token,
					birthday,
				})
			},
			editGender() {
				// 选择性别
				uni.showActionSheet({
					itemList: ['未知', '男', '女'],
					success: async (res2) => {
						this.modifyUserInfoV2({
							token: this.token,
							gender: res2.tapIndex,
						})
					}
				});
			},
			async getPhoneNumber(e) {
				console.log(e);
				if (e.detail.errMsg.indexOf('privacy permission is not authorized') != -1) {
					uni.showModal({
						content: '请阅读并同意隐私条款以后才能继续本操作',
						confirmText: '阅读协议',
						cancelText: '取消',
						success(res) {
							if (res.confirm) {
								uni.requirePrivacyAuthorize() // 弹出用户隐私授权框
							}
						}
					})
					return
				}
				if (!e.detail.errMsg) {
					uni.showModal({
						content: 'getPhoneNumber异常',
						showCancel: false
					})
					return
				}
				if (e.detail.errMsg == "getPhoneNumber:fail user deny") {
					return
				}
				if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
					uni.showModal({
						content: e.detail.errMsg,
						showCancel: false
					})
					return;
				}
				this._getPhoneNumber(e)
			},
			async _getPhoneNumber(e) {
				console.log(e);
				const res = await this.$wxapi.bindMobileWxappV2(this.token, e.detail.code)
				if (res.code == 0) {
					uni.showToast({
						title: '绑定成功'
					})
					getApp().getUserApiInfo()
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
	.info {
		background-color: #ffffff;
		min-height: 100vh;

		.avatar-section {
			display: flex;
			justify-content: center;
			margin-top: 50rpx;
			margin-bottom: 60rpx;

			.avatar-container {
				position: relative;
				width: 200rpx;
				height: 200rpx;

				.btn {
					position: absolute;
					height: 100%;
					width: 100%;
					left: 0;
					top: 0;
					opacity: 0;
					z-index: 99;
				}

				.avatar {
					width: 200rpx;
					height: 200rpx;
					border-radius: 50%;
				}

				.camera-icon {
					position: absolute;
					bottom: 0;
					right: 8rpx;
					width: 68rpx;
					height: 68rpx;
					background: linear-gradient(-39deg, rgba(112, 223, 197, 1) 0%, rgba(72, 197, 168, 1) 100%);
					border-radius: 50%;
					border: 4rpx solid #ffffff;
					display: flex;
					align-items: center;
					justify-content: center;

					.camera {
						width: 36rpx;
						height: 36rpx;
					}
				}
			}
		}

		.form-section {
			padding: 0 28rpx;

			.form-row {
				display: flex;
				gap: 22rpx;
			}

			.form-item {
				margin-bottom: 46rpx;

				&.half {
					flex: 1;
				}

				.label {
					display: block;
					font-family: PingFang SC;
					font-weight: 400;
					font-size: 24rpx;
					line-height: 34rpx;
					color: #9A9A9A;
					margin-bottom: 12rpx;
				}

				.input-container {
					position: relative;
					background-color: #F2F7F9;
					border-radius: 16rpx;
					height: 92rpx;
					display: flex;
					align-items: center;
					padding: 0 32rpx;
					padding-right: 56rpx;

					.input {
						flex: 1;
						font-family: PingFang SC;
						font-weight: 500;
						font-size: 28rpx;
						line-height: 40rpx;
						color: #333333;
						background: transparent;
						border: none;
					}

					.arrow-icon {
						position: absolute;
						right: 24rpx;
						top: 50%;
						transform: translateY(-50%);
						width: 22rpx;
						height: 16rpx;
					}
					.btn {
						position: absolute;
						height: 100%;
						width: 100%;
						left: 0;
						top: 0;
						opacity: 0;
						z-index: 99;
					}
				}
			}
		}
	}
</style>