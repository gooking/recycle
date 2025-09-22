import store from '@/store'
import WXAPI from 'apifm-uniapp'

async function bindSeller() {
	const token = store.state.token
	const referrer = store.state.referrer
	if (!token) {
		return
	}
	if (!referrer) {
		return
	}
	const res = await WXAPI.bindSeller({
		token,
		uid: referrer
	})
}

// 检测登录状态，返回 true / false
async function checkHasLogined() {
	const token = store.state.token
	if (!token) {
		return false
	}
	const checkTokenRes = await WXAPI.checkToken(token)
	if (checkTokenRes.code != 0) {
		store.commit('$uStore', {
			name: 'token',
			value: ''
		})
		return false
	}
	return true
}

async function wxaCode() {
	// #ifdef MP-WEIXIN
	return new Promise((resolve, reject) => {
		wx.login({
			success(res) {
				return resolve(res.code)
			},
			fail() {
				wx.showToast({
					title: '获取code失败',
					icon: 'none'
				})
				return resolve('获取code失败')
			}
		})
	})
	// #endif
}

async function login(page) {
	const _this = this
	wx.login({
		success: function(res) {
			const extConfigSync = wx.getExtConfigSync()
			if (extConfigSync.subDomain) {
				WXAPI.wxappServiceLogin({
					code: res.code
				}).then(function(res) {
					if (res.code == 10000) {
						// 去注册
						return;
					}
					if (res.code != 0) {
						// 登录错误
						wx.showModal({
							title: '无法登录',
							content: res.msg,
							showCancel: false
						})
						return;
					}
					store.commit('$uStore', {
						name: 'token',
						value: res.data.token
					})
					store.commit('$uStore', {
						name: 'uid',
						value: res.data.uid
					})
					store.commit('$uStore', {
						name: 'mobile',
						value: res.data.mobile
					})
					// _this.bindSeller()
					if (page) {
						page.onShow()
					}
				})
			} else {
				WXAPI.login_wx(res.code).then(function(res) {
					if (res.code == 10000) {
						// 去注册
						return;
					}
					if (res.code != 0) {
						// 登录错误
						wx.showModal({
							title: '无法登录',
							content: res.msg,
							showCancel: false
						})
						return;
					}
					store.commit('$uStore', {
						name: 'token',
						value: res.data.token
					})
					store.commit('$uStore', {
						name: 'uid',
						value: res.data.uid
					})
					store.commit('$uStore', {
						name: 'mobile',
						value: res.data.mobile
					})
					// _this.bindSeller()
					if (page) {
						page.onShow()
					}
				})
			}
		}
	})
}

// 最新的登陆接口，建议用这个
async function login20241224() {
  const code = await wxaCode()
  // 非服务商模式
  const res = await WXAPI.login_wx(code)
  if (res.code == 10000) {
    // 去注册
    return res;
  }
  if (res.code != 0) {
    // 登录错误
    wx.showModal({
      content: res.msg,
      showCancel: false
    })
    return res;
  }
  store.commit('$uStore', {
  	name: 'token',
  	value: res.data.token
  })
  store.commit('$uStore', {
  	name: 'uid',
  	value: res.data.uid
  })
  store.commit('$uStore', {
  	name: 'mobile',
  	value: res.data.mobile
  })
  return res
}

async function authorize() {
	return new Promise((resolve, reject) => {
		wx.login({
			success: function(res) {
				const code = res.code
				let referrer = '' // 推荐人
				let referrer_storge = store.state.referrer
				if (referrer_storge) {
					referrer = referrer_storge;
				}
				// 下面开始调用注册接口
				const extConfigSync = wx.getExtConfigSync()
				if (extConfigSync.subDomain) {
					WXAPI.wxappServiceAuthorize({
						code: code,
						referrer: referrer
					}).then(function(res) {
						if (res.code == 0) {
							store.commit('$uStore', {
								name: 'token',
								value: res.data.token
							})
							store.commit('$uStore', {
								name: 'uid',
								value: res.data.uid
							})
							store.commit('$uStore', {
								name: 'mobile',
								value: res.data.mobile
							})
							resolve(res)
						} else {
							wx.showToast({
								title: res.msg,
								icon: 'none'
							})
							reject(res.msg)
						}
					})
				} else {
					WXAPI.authorize({
						code: code,
						referrer: referrer
					}).then(function(res) {
						if (res.code == 0) {
							store.commit('$uStore', {
								name: 'token',
								value: res.data.token
							})
							store.commit('$uStore', {
								name: 'uid',
								value: res.data.uid
							})
							store.commit('$uStore', {
								name: 'mobile',
								value: res.data.mobile
							})
							resolve(res)
						} else if(res.code == 500 || res.msg.indexOf('can not get openid') != -1) {
							uni.showModal({
								content: '配置AppId有误，无法自动登录，将为您跳转到手机号登陆',
								showCancel: false,
								success: () => {
									uni.redirectTo({
										url: '/pages/login/login'
									})
								}
							})
						} else {
							wx.showToast({
								title: res.msg,
								icon: 'none'
							})
							reject(res.msg)
						}
					})
				}
			},
			fail: err => {
				reject(err)
			}
		})
	})
}

function loginOut() {
	store.commit('$uStore', {
		name: 'token',
		value: ''
	})
	store.commit('$uStore', {
		name: 'uid',
		value: ''
	})
}

async function checkAndAuthorize(scope) {
	return new Promise((resolve, reject) => {
		uni.getSetting({
			success(res) {
				if (!res.authSetting[scope]) {
					uni.authorize({
						scope: scope,
						success() {
							resolve() // 无返回参数
						},
						fail(e) {
							console.error(e)
							uni.showModal({
								title: '无权操作',
								content: '需要获得您的授权',
								showCancel: false,
								confirmText: '立即授权',
								confirmColor: '#e64340',
								success(res) {
									uni.openSetting();
								},
								fail(e) {
									console.error(e)
									reject(e)
								},
							})
						}
					})
				} else {
					resolve() // 无返回参数
				}
			},
			fail(e) {
				console.error(e)
				reject(e)
			}
		})
	})
}

export default {
	checkHasLogined: checkHasLogined,
	wxaCode: wxaCode,
	login: login,
	login20241224: login20241224,
	loginOut: loginOut,
	checkAndAuthorize: checkAndAuthorize,
	authorize: authorize,
	bindSeller: bindSeller
}
