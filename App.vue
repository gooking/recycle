<script>
	import CONFIG from '@/config.js'
	import AUTH from '@/common/auth.js'
	export default {
		globalData: {
			curLat: undefined,
			curLong: undefined,
		},
		onLaunch: function() {
			this.vuex('versionNum', uni.getAppBaseInfo().appVersion)
			this.checkForUpdate(); // 检查新版本
			this.queryConfigBatch();
		},
		onShow(e) {
			if (e && e.query && e.query.inviter_id) {
				this.vuex('referrer', e.query.inviter_id)
			}
			AUTH.checkHasLogined().then(isLogined => {
				if (!isLogined) {
					// #ifdef MP-WEIXIN
					AUTH.authorize().then(res => {
						this.getUserApiInfo()
					})
					// #endif
				} else {
					this.getUserApiInfo()
				}
			})
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			async queryConfigBatch() {
				// https://www.yuque.com/apifm/nu0f75/dis5tl
				const res = await this.$wxapi.queryConfigBatch(CONFIG.sysconfigkeys)
				if (res.code == 0) {
					const sysconfigMap = {}
					res.data.forEach(config => {
						sysconfigMap[config.key] = config.value
					})
					this.vuex('sysconfigMap', sysconfigMap)
					uni.$emit('sysconfigOK', sysconfigMap)
				}
			},
			checkForUpdate() {
				// #ifdef MP
				const updateManager = uni.getUpdateManager();
				updateManager.onCheckForUpdate(function(res) {
					// 请求完新版本信息的回调
					console.log(res.hasUpdate);
				});
				updateManager.onUpdateReady(function(res) {
					uni.showModal({
						title: '更新提示',
						content: '新版本已经准备好，是否重启应用？',
						success(res) {
							if (res.confirm) {
								// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
								updateManager.applyUpdate();
							}
						}
					});

				});
				updateManager.onUpdateFailed(function(res) {
					// 新的版本下载失败
				});
				// #endif
			},
			async getUserApiInfo() {
				const _this = this.$vm ? this.$vm : this
				const res = await _this.$wxapi.userDetail(_this.token)
				if (res.code == 0) {
					const apiUserInfoMap = res.data
					_this.vuex('apiUserInfoMap', apiUserInfoMap)
				}
			},
			async getLocation() {
				// 统一获取经纬度
				if (this.globalData.curLong && this.globalData.curLat) {
					return {
						long: this.globalData.curLong,
						lat: this.globalData.curLat
					}
				}
				const res = await this.$wxapi.getLocation()
				if (res) {
					this.globalData.curLong = res.long
					this.globalData.curLat = res.lat
					return res
				} else {
					return {
						long: 0,
						lat: 0
					}
				}
			},
			getLocation: () => {
				return new Promise(function(resolve, reject) {
					uni.showLoading({
						title: ''
					})
					// #ifdef MP-WEIXIN
					wx.getLocation({
						type: "gcj02", // 默认为 wgs84 返回 gps 坐标，gcj02 返回国测局坐标，可用于 uni.openLocation 和 map 组件坐标，App 和 H5 需配置定位 SDK 信息才可支持 gcj02。
						success: res => {
							resolve({
								long: res.longitude,
								lat: res.latitude
							})
						},
						fail: err => {
							console.error(err)
							reject(err)
							if (
								err.errMsg ===
								"getLocation:fail 频繁调用会增加电量损耗，可考虑使用 wx.onLocationChange 监听地理位置变化"
							) {
								uni.showToast({
									title: "请勿频繁定位",
									icon: "none",
								});
							} else if (err.errMsg === "getLocation:fail auth deny") {
								// 未授权
								uni.showToast({
									title: "无法定位，请重新获取位置信息",
									icon: "none",
								});
							} else if (
								err.errMsg ===
								"getLocation:fail:ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF"
							) {
								uni.showModal({
									content: "请开启手机定位服务",
									showCancel: false,
								});
							} else {
								uni.showModal({
									content: "无法获取手机定位 \n 请先确认定位服务是否已开启",
									showCancel: false,
								});
							}
						},
						complete: () => {
							uni.hideLoading()
						},
					});
					// #endif
					// #ifndef MP-WEIXIN
					uni.getLocation({
						type: "wgs84", // 默认为 wgs84 返回 gps 坐标，gcj02 返回国测局坐标，可用于 uni.openLocation 和 map 组件坐标，App 和 H5 需配置定位 SDK 信息才可支持 gcj02。
						success: res => {
							console.log("定位获取:", res);
							let platform = uni.getSystemInfoSync().platform;
							if (platform == "ios") {
								//toFixed() 方法可把 Number 四舍五入为指定小数位数的数字。
								resolve({
									long: res.longitude.toFixed(6),
									lat: res.latitude.toFixed(6)
								})
							} else {
								resolve({
									long: res.longitude,
									lat: res.latitude
								})
							}
						},
						fail: err => {
							console.error(err)
							reject(err)
							if (
								err.errMsg ===
								"getLocation:fail 频繁调用会增加电量损耗，可考虑使用 wx.onLocationChange 监听地理位置变化"
							) {
								uni.showToast({
									title: "请勿频繁定位",
									icon: "none",
								});
							} else if (err.errMsg === "getLocation:fail auth deny") {
								// 未授权
								uni.showToast({
									title: "无法定位，请重新获取位置信息",
									icon: "none",
								});
							} else if (
								err.errMsg ===
								"getLocation:fail:ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF"
							) {
								uni.showModal({
									content: "请开启手机定位服务",
									showCancel: false,
								});
							} else {
								uni.showModal({
									content: "无法获取手机定位 \n 请先确认定位服务是否已开启",
									showCancel: false,
								});
							}
						},
						complete: () => {
							uni.hideLoading()
						},
					});
					// #endif
				});
			},
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>