<script>
	import CONFIG from '@/config.js'
	import AUTH from '@/common/auth.js'
	export default {
		globalData: {
			curLat: undefined,
			curLong: undefined,
			adminLogined: false, // 登陆获取后台的 x-token，只需运行一次
		},
		onLaunch: function() {
			uni.addInterceptor('request', {
			  success: (res) => {
			    if(res.data.code == 2000) {
					// 未登录
					// #ifdef H5
					uni.redirectTo({
						url: '/pages/login/login'
					})
					// #endif
				}
			  },
			})
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
						// this.adminLogin()
					})
					// #endif
				} else {
					this.getUserApiInfo()
					// this.adminLogin()
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
				// https://www.yuque.com/apifm/nu0f75/zgf8pu
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
					// #ifdef H5
					if(CONFIG.h5MapSimulator) {
						resolve({
							long: 0,
							lat: 0
						})
						return
					}
					// #endif
					uni.showLoading({
						title: ''
					})
					// #ifdef MP-WEIXIN
					uni.getLocation({
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
			async adminLogin() {
				if(this.globalData.adminLogined) {
					return
				}
				const _this = this.$vm ? this.$vm : this
				/**
				 * https://www.yuque.com/apifm/nu0f75/nl01pr
				 * 用当前用户的token登陆后台获取调用后台api接口的 x-token
				 */
				const res = await _this.$wxapi.request('https://user.api.it120.cc/login/token', false, 'POST', {
					token: _this.token
				})
				if (res.code == 0) {
					this.globalData.adminLogined = true
					const apiUserInfoMap = res.data
					_this.vuex('xtoken', res.data.token)
					_this.vuex('shopIds', res.data.shopIds)
				}
			},
			/**
			 * 读取购物车数据
			 * https://www.yuque.com/apifm/nu0f75/awql14
			 */
			async _shippingCarInfo() {
				const _this = this.$vm ? this.$vm : this
				const res = await _this.$wxapi.shippingCarInfo(_this.token)
				if (res.code == 0) {
					_this.vuex('shippingCarInfo', res.data)
				} else {
					_this.vuex('shippingCarInfo', null)
				}
			},
		}
	}
</script>

<style>
	/* #ifdef H5 */  
	uni-page-head { display: none}  
	/* #endif */
</style>