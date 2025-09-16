<template>
	<view class="address-edit-container">
		<!-- 页面标题 -->
		<view class="page-header">
			<view class="header-left" @tap="navigateBack">
				<image src="/static/images/address/back.png" mode="aspectFit"></image>
			</view>
			<view class="header-title">{{ isEdit ? '编辑地址' : '新增地址' }}</view>
			<view class="header-right" @tap="saveAddress">保存</view>
		</view>

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
				<input class="form-input" type="number" v-model="formData.phone" placeholder="请输入手机号码" maxlength="11" />
			</view>

			<!-- 所在地区 -->
			<view class="form-item" @tap="openLocationPicker">
				<text class="form-label">所在地区</text>
				<view class="location-text">
					<text>{{ formData.province || '请选择省市区' }}</text>
					<image src="/static/images/address/arrow-right.png" mode="aspectFit"></image>
				</view>
			</view>

			<!-- 详细地址 -->
			<view class="form-item">
				<text class="form-label">详细地址</text>
				<textarea class="form-textarea" v-model="formData.address" placeholder="请输入详细地址" auto-height="true" />
			</view>

			<!-- 地址标签 -->
			<view class="form-item">
				<text class="form-label">地址标签</text>
				<view class="tag-list">
					<view class="tag-item" :class="{ active: formData.type === '家' }" @tap="selectTag('家')">家</view>
					<view class="tag-item" :class="{ active: formData.type === '公司' }" @tap="selectTag('公司')">公司</view>
					<view class="tag-item" :class="{ active: formData.type === '学校' }" @tap="selectTag('学校')">学校</view>
					<view class="tag-item" :class="{ active: formData.type === '其他' }" @tap="selectTag('其他')">其他</view>
				</view>
			</view>

			<!-- 设为默认地址 -->
			<view class="default-setting" @tap="toggleDefault">
				<text>设为默认收货地址</text>
				<!-- <switch v-model="formData.isDefault" color="#ff6b35" /> -->
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isEdit: false,
				addressId: '',
				formData: {
					name: '',
					phone: '',
					province: '',
					city: '',
					district: '',
					address: '',
					type: '家',
					isDefault: false,
					latitude: '',
					longitude: ''
				}
			}
		},
		onLoad(options) {
			if (options.type === 'edit' && options.id) {
				uni.setNavigationBarTitle({
					title: '编辑地址'
				})
				this.isEdit = true;
				this.addressId = options.id;
				this.getAddressDetail();
			} else {
				uni.setNavigationBarTitle({
					title: '添加新地址'
				})
			}
		},
		methods: {
			/**
			 * 返回上一页
			 */
			navigateBack() {
				uni.navigateBack();
			},

			/**
			 * 获取地址详情
			 * 使用 api工厂 SDK 获取地址详情
			 * 文档地址: https://api.it120.cc/doc.html
			 */
			async getAddressDetail() {
				// 实际开发中应调用获取地址详情的API
				// 这里使用模拟数据
				const addressDetail = {
					id: this.addressId,
					name: 'Jasmine',
					phone: '1466252252',
					province: '北京市',
					city: '北京市',
					district: '海淀区',
					address: '中关村大厦C座一层大堂',
					type: '家',
					isDefault: true,
					latitude: '39.983354',
					longitude: '116.306815'
				};

				this.formData = addressDetail;
			},

			/**
			 * 打开地区选择器
			 */
			openLocationPicker() {
				// 实际开发中应调用地区选择器组件或API
				// 这里使用模拟数据
				uni.showActionSheet({
					itemList: ['北京市-北京市-海淀区', '北京市-北京市-朝阳区', '上海市-上海市-浦东新区'],
					success: (res) => {
						const location = {
							0: {
								province: '北京市',
								city: '北京市',
								district: '海淀区'
							},
							1: {
								province: '北京市',
								city: '北京市',
								district: '朝阳区'
							},
							2: {
								province: '上海市',
								city: '上海市',
								district: '浦东新区'
							}
						} [res.tapIndex];

						this.formData.province = `${location.province} ${location.city} ${location.district}`;
						this.formData.city = location.city;
						this.formData.district = location.district;

						// 模拟调用地图API获取经纬度
						this.getLocationByAddress(this.formData.province);
					}
				});
			},

			/**
			 * 通过地址获取经纬度
			 * @param {String} address - 地址信息
			 */
			async getLocationByAddress(address) {
				// 使用 api工厂 SDK 通过地址获取经纬度
				// 文档地址: https://api.it120.cc/doc.html
				try {
					const res = await WXAPI.mapAddressToGps({
						keyWord: address
					});

					if (res.code === 0 && res.data && res.data.location) {
						this.formData.latitude = res.data.location.lat;
						this.formData.longitude = res.data.location.lon;
					}
				} catch (error) {
					console.log('获取经纬度失败:', error);
					// 模拟数据
					this.formData.latitude = '39.983354';
					this.formData.longitude = '116.306815';
				}
			},

			/**
			 * 选择地址标签
			 * @param {String} tag - 标签名称
			 */
			selectTag(tag) {
				this.formData.type = tag;
			},

			/**
			 * 切换默认地址状态
			 */
			toggleDefault() {
				this.formData.isDefault = !this.formData.isDefault;
			},

			/**
			 * 保存地址信息
			 */
			async saveAddress() {
				// 表单验证
				if (!this.formData.name) {
					return uni.showToast({
						title: '请输入联系人姓名',
						icon: 'none'
					});
				}

				if (!this.formData.phone || this.formData.phone.length !== 11) {
					return uni.showToast({
						title: '请输入正确的手机号码',
						icon: 'none'
					});
				}

				if (!this.formData.province) {
					return uni.showToast({
						title: '请选择所在地区',
						icon: 'none'
					});
				}

				if (!this.formData.address) {
					return uni.showToast({
						title: '请输入详细地址',
						icon: 'none'
					});
				}

				try {
					// 实际开发中应调用保存地址的API
					// 这里使用模拟操作
					setTimeout(() => {
						uni.showToast({
							title: this.isEdit ? '修改成功' : '添加成功',
							icon: 'success',
							duration: 1500,
							success: () => {
								// 返回上一页并刷新地址列表
								setTimeout(() => {
									uni.navigateBack();
								}, 1500);
							}
						});
					}, 500);
				} catch (error) {
					console.log('保存地址失败:', error);
					uni.showToast({
						title: '保存失败，请重试',
						icon: 'none'
					});
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.address-edit-container {
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.page-header {
		height: 96rpx;
		background-color: #fff;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 32rpx;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 999;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.header-left {
		width: 40rpx;
		height: 40rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.header-left image {
		width: 40rpx;
		height: 40rpx;
	}

	.header-title {
		font-size: 36rpx;
		color: #333;
	}

	.header-right {
		font-size: 32rpx;
		color: #ff6b35;
	}

	.form-content {
		padding-top: 120rpx;
		padding-bottom: 40rpx;
	}

	.form-item {
		background-color: #fff;
		margin-bottom: 1rpx;
		padding: 0 32rpx;
	}

	.form-label {
		display: inline-block;
		width: 160rpx;
		font-size: 32rpx;
		color: #333;
		line-height: 120rpx;
	}

	.form-input {
		display: inline-block;
		width: 500rpx;
		font-size: 32rpx;
		color: #333;
		line-height: 120rpx;
	}

	.location-text {
		display: inline-block;
		width: 500rpx;
		font-size: 32rpx;
		color: #999;
		line-height: 120rpx;
		text-align: right;
	}

	.location-text image {
		width: 24rpx;
		height: 24rpx;
		margin-left: 12rpx;
		vertical-align: middle;
	}

	.form-textarea {
		width: 500rpx;
		font-size: 32rpx;
		color: #333;
		padding: 20rpx 0;
		line-height: 48rpx;
	}

	.tag-list {
		display: inline-block;
		width: 500rpx;
		padding: 20rpx 0;
	}

	.tag-item {
		display: inline-block;
		font-size: 28rpx;
		color: #666;
		background-color: #f5f5f5;
		padding: 12rpx 32rpx;
		border-radius: 24rpx;
		margin-right: 20rpx;
		margin-bottom: 20rpx;
	}

	.tag-item.active {
		color: #ff6b35;
		background-color: #fff0e8;
	}

	.default-setting {
		background-color: #fff;
		margin-top: 20rpx;
		padding: 0 32rpx;
		height: 120rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 32rpx;
		color: #333;
	}
</style>