<template>
	<view class="address-edit-container">
		<!-- 表单内容 -->
		<view class="form-content">
			<!-- 联系人 -->
			<view class="form-item">
				<text class="form-label">联系人</text>
				<input class="form-input" type="text" v-model="formData.name" placeholder="请输入联系人姓名" />
			</view>

			<!-- 手机号码 -->
			<view class="form-item">
				<text class="form-label">手机号码</text>
				<input class="form-input" type="number" v-model="formData.phone" placeholder="请输入手机号码" />
			</view>

			<!-- 地址选择 -->
			<view class="form-item">
				<text class="form-label">回收地址</text>
				<view class="address-select">
					<input class="form-input" type="text" v-model="formData.address" placeholder="请选择回收地址" />
					<uni-icons type="location-filled" size="48rpx" @click="chooseLocation"></uni-icons>
				</view>
			</view>

			<!-- 门牌号 -->
			<view class="form-item">
				<text class="form-label">门牌号</text>
				<input class="form-input" type="text" v-model="formData.doorNumber" placeholder="请输入门牌号，如：1单元101室" />
			</view>

			<!-- 地址标签 -->
			<view class="form-item">
				<text class="form-label">标签</text>
				<view class="tag-list">
					<template v-for="(item,index) in tagList">
						<view class="tag-item" :class="{ active: formData.tag == item }" @tap="selectTag(item)">
							<text :class="{ active: formData.tag == item }">{{ item }}</text>
						</view>
					</template>
				</view>
			</view>

			<!-- 默认地址设置 -->
			<view class="default-setting" @tap="toggleDefault">
				<text>设为默认地址</text>
				<view class="switch" :class="{ active: formData.isDefault }">
					<view class="switch-circle"></view>
				</view>
			</view>
		</view>

		<!-- 保存按钮 -->
		<view class="save-button" @click="submit">
			保存并使用
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isEdit: false,
				addressId: '',
				tagList: ['家', '公司', '其他'],
				formData: {
					name: '',
					phone: '',
					address: '',
					doorNumber: '',
					tag: '家', // home, company, parents
					isDefault: false,
					latitude: '',
					longitude: ''
				}
			}
		},
		onLoad(options) {
			// 判断是新增还是编辑
			if (options && options.id) {
				uni.setNavigationBarTitle({
					title: '编辑地址'
				})
				this.isEdit = true
				this.addressId = options.id
				this.getAddressDetail()
			} else {
				uni.setNavigationBarTitle({
					title: '添加新地址'
				})
			}
		},
		methods: {
			chooseLocation() {
				uni.chooseLocation({
					success: (res) => {
						this.formData.address = res.address + res.name
						this.formData.address = res.address + res.name
						this.formData.latitude = res.latitude
						this.formData.longitude = res.longitude
					},
					fail: (e) => {
						console.error(e)
					},
				})
			},
			/**
			 * 返回上一页
			 */
			navigateBack() {
				uni.navigateBack()
			},

			/**
			 * 选择标签
			 * @param {string} tag 标签类型
			 */
			selectTag(tag) {
				this.formData.tag = tag
			},

			/**
			 * 切换默认地址状态
			 */
			toggleDefault() {
				this.formData.isDefault = !this.formData.isDefault
			},

			/**
			 * 获取地址详情
			 */
			async getAddressDetail() {
				// https://www.yuque.com/apifm/nu0f75/gszs9g
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.addressDetail(this.token, this.addressId)
				uni.hideLoading()
				if(res.code != 0) {
					uni.showModal({
						content: '地址记录不存在',
						showCancel: false,
						success: () => {
							uni.navigateBack()
						}
					})
					return
				}
				this.formData.name = res.data.info.linkMan
				this.formData.phone = res.data.info.mobile
				this.formData.latitude = res.data.info.latitude
				this.formData.longitude = res.data.info.longitude
				this.formData.address = res.data.info.address
				this.formData.isDefault = res.data.info.isDefault
				this.formData.doorNumber = res.data.info.menpai
				this.formData.tag = res.data.info.code
			},

			/**
			 * 保存地址
			 */
			async submit() {
				// 表单验证
				if (!this.formData.name) {
					return uni.showToast({
						title: '请输入联系人姓名',
						icon: 'none'
					})
				}
				if (!this.formData.phone) {
					return uni.showToast({
						title: '请输入正确的手机号码',
						icon: 'none'
					})
				}
				if (!this.formData.address || !this.formData.latitude || !this.formData.longitude) {
					return uni.showToast({
						title: '请选择回收地址',
						icon: 'none'
					})
				}
				if (!this.formData.doorNumber) {
					return uni.showToast({
						title: '请输入门牌号',
						icon: 'none'
					})
				}
				uni.showLoading({
					title: ''
				})
				if (this.addressId) {
					// https://www.yuque.com/apifm/nu0f75/cv6gh7
					const res = await this.$wxapi.updateAddress({
						token: this.token,
						id: this.addressId,
						address: this.formData.address,
						linkMan: this.formData.name,
						mobile: this.formData.phone,
						isDefault: this.formData.isDefault,
						menpai: this.formData.doorNumber,
						latitude: this.formData.latitude,
						longitude: this.formData.longitude,
						code: this.formData.tag,
					})
					if (res.code != 0) {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
						return
					}
				} else {
					// https://www.yuque.com/apifm/nu0f75/fcx2mf
					const res = await this.$wxapi.addAddress({
						token: this.token,
						provinceId: '0',
						cityId: '0',
						address: this.formData.address,
						linkMan: this.formData.name,
						mobile: this.formData.phone,
						isDefault: this.formData.isDefault,
						menpai: this.formData.doorNumber,
						latitude: this.formData.latitude,
						longitude: this.formData.longitude,
						code: this.formData.tag,
					})
					if (res.code != 0) {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
						return
					}
				}
				uni.hideLoading()
				uni.showModal({
					content: '设置成功',
					showCancel: false,
					success: () => {
						this.vuex('needRefresh', true)
						uni.navigateBack()
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.address-edit-container {
		background-color: #f5f5f5;
		min-height: 100vh;

		.page-header {
			height: 88rpx;
			background-color: #fff;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0 32rpx;
			position: relative;

			.header-left {
				width: 88rpx;
				height: 88rpx;
				display: flex;
				align-items: center;
				justify-content: flex-start;

				image {
					width: 48rpx;
					height: 48rpx;
				}
			}

			.header-title {
				font-size: 34rpx;
				font-weight: 600;
				color: #333;
				position: absolute;
				left: 50%;
				transform: translateX(-50%);
			}

			.header-right {
				width: 88rpx;
				height: 88rpx;
				display: flex;
				align-items: center;
				justify-content: flex-end;
				font-size: 32rpx;
				color: #48C5A8;
			}
		}

		.form-content {
			margin-top: 20rpx;
			background-color: #fff;

			.form-item {
				display: flex;
				align-items: center;
				min-height: 112rpx;
				padding: 0 32rpx;
				border-bottom: 1px solid #f0f0f0;

				.form-label {
					width: 160rpx;
					font-size: 32rpx;
					color: #333;
				}

				.form-input {
					flex: 1;
					font-size: 32rpx;
					color: #333;
					height: 100%;
					padding: 0;
				}

				.address-select {
					flex: 1;
					display: flex;
					justify-content: space-between;
					align-items: center;

					.address-text {
						font-size: 32rpx;
						color: #333;
					}

					.address-placeholder {
						font-size: 32rpx;
						color: #999;
					}

					image {
						width: 32rpx;
						height: 32rpx;
					}
				}

				.tag-list {
					flex: 1;
					display: flex;

					.tag-item {
						padding: 12rpx 32rpx;
						border-radius: 40rpx;
						background-color: #f5f5f5;
						margin-right: 32rpx;

						text {
							font-size: 28rpx;
							color: #666;
						}

						&.active {
							background-color: #dbfcfe;

							text.active {
								color: #48C5A8;
							}
						}
					}
				}
			}

			.default-setting {
				display: flex;
				justify-content: space-between;
				align-items: center;
				height: 112rpx;
				padding: 0 32rpx;

				text {
					font-size: 32rpx;
					color: #333;
				}

				.switch {
					width: 88rpx;
					height: 48rpx;
					background-color: #e5e5e5;
					border-radius: 24rpx;
					position: relative;
					transition: background-color 0.3s;

					.switch-circle {
						width: 40rpx;
						height: 40rpx;
						background-color: #fff;
						border-radius: 50%;
						position: absolute;
						top: 4rpx;
						left: 4rpx;
						transition: transform 0.3s;
					}

					&.active {
						background-color: #48C5A8;

						.switch-circle {
							transform: translateX(40rpx);
						}
					}
				}
			}
		}

		.save-button {
			margin: 60rpx 32rpx;
			height: 96rpx;
			background-color: #48C5A8;
			border-radius: 48rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 32rpx;
			color: #fff;
			font-weight: 600;
		}
	}
</style>