<script>
	import CONFIG from '@/config.js'
	import AUTH from '@/common/auth.js'
	export default {
		globalData: {
			
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
					// if (_this.sysconfigMap.order_hx_uids && _this.sysconfigMap.order_hx_uids.indexOf(res.data.base.id) != -1) {
					// 	apiUserInfoMap.canHX = true // 具有扫码核销的权限
					// }
					// const admin_uids = _this.sysconfigMap.admin_uids
					// if (admin_uids && admin_uids.indexOf(res.data.base.id) != -1) {
					// 	apiUserInfoMap.isAdmin = true
					// }
					_this.vuex('apiUserInfoMap', apiUserInfoMap)
				}
			},
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
