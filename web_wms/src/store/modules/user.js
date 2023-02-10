import axios from 'axios'
import store from '@/store'
import { MessageBox, Message } from 'element-ui'
import { getInfo, getMenu } from '@/api/user'
import { login, logout, allPageModuleCheckAuth, refreshToken, getDictList, basePortList, baseSystemLineList, baseShipTermsList, baseShippingCarrierList } from '@/api/base'
import { parseTime, randomString } from '@/utils'
import { getToken, setToken, removeToken, setTokenTime } from '@/utils/auth'
import { assemblePageModuleAuth } from '@/utils/checkAuth'
import { setCamelFormat } from '@/utils/index'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    userInfo: {},
    token: getToken(),
    name: '',
    deptName: '',
    deptCode: '',
    compName: '',
    compCode: '',
    titleName: '',
    titleCode: '',
    // avatar: '',
    roles: [],
    currRole: '', // 当前角色
    role: 'sales',
    jobCodes: [],
    userId: '',
    expireTimes: 30 * 60 * 1000,   // token有效期30分钟
    bdRoles: ['bd', 'obd', 'bkg'],
		opRoles: ['op'],
		logoutJump: false,
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_DEPT_NAME: (state, deptName) => {
    state.deptName = deptName
  },
  SET_DEPT_CODE: (state, deptCode) => {
    state.deptCode = deptCode
  },
  // SET_AVATAR: (state, avatar) => {
  //   state.avatar = avatar
  // },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_CURRROLE: (state, role) => {
		// state.currRole = role === 'obd' ? 'bd' : role
    state.currRole = role
    sessionStorage.setItem('currRole', state.currRole)
  },
  SET_ROLE: (state, role) => {
    state.role = role
  },
  SET_COMPNAME: (state, compName) => {
    state.compName = compName
  },
  SET_COMPCODE: (state, compCode) => {
    state.compCode = compCode
  },
  SET_TITLENAME: (state, titleName) => {
    state.titleName = titleName
  },
  SET_TITLECODE: (state, titleCode) => {
    state.titleCode = titleCode
  },
  SET_USERID: (state, userId) => {
    state.userId = userId
  },
  SET_allPageModuleAuth: (state, data) => {
    state.allPageModuleAuth = data
  },
  SET_jobCodes: (state, data) => {
    state.jobCodes = data
  },
  SET_USERINFO: (state, data) => {
    state.userInfo = data
	},
	SET_LOGOUTJUMP: (state, data) => {
		state.logoutJump = data
	}
}

const actions = {
  setToken({ commit }, token) {
    commit('SET_TOKEN', token)
  },
  setUserInfo ({ commit }, userInfo) {
    commit('SET_USERINFO', userInfo)
  },
	// user login
	login({ commit, state }, userInfo) {
		const { username, password } = userInfo
		return new Promise((resolve, reject) => {
			login({ username: username.trim(), password: password })
				.then(response => {
					const { data } = response
					const expired_time = Math.round(new Date().getTime()) + state.expireTimes
					commit('SET_TOKEN', data.token)
					setToken(data.token)
					// 存储token和失效时间
					localStorage.setItem('isLogin', true) // 是否登录状态
					localStorage.setItem('expired_time', expired_time) // 过期时间
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	},

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response
        if (!data) {
          return reject('Verification failed, please Login again.')
        }
				const { roleCodes, deptName, deptCode, loginAccount, userName, avatar, sysUserId, compName, compCode, titleName, titleCode, jobCodes } = data
        commit('SET_CURRROLE', roleCodes[0])
        commit('SET_ROLES', roleCodes)
        commit('SET_ROLE', loginAccount)
        commit('SET_NAME', userName)
        commit('SET_DEPT_NAME', deptName)
        commit('SET_DEPT_CODE', deptCode)
        // commit('SET_AVATAR', avatar)
        commit('SET_USERID', sysUserId)
        commit('SET_COMPNAME', compName)
        commit('SET_COMPCODE', compCode)
        commit('SET_TITLENAME', titleName)
        commit('SET_TITLECODE', titleCode)
        commit('SET_jobCodes', jobCodes)
        commit('SET_USERINFO', data)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 订单切换当前角色
  changeRole({commit, state}, role) {
    return new Promise(resolve => {
      commit('SET_CURRROLE', role)
      resolve(state.currRole)
    })
  },

  // get user menu
  getMenus({ commit, state }) {
    return new Promise((resolve, reject) => {
      getMenu(state.token).then(response => {
        const { data } = response

					commit('SET_MENU', data)
					resolve(data)
				})
				.catch(error => {
					reject(error)
				})
		})
	},

	// get allPageModuleCheckAuth
	allPageModuleCheckAuth({ commit, state }) {
		return new Promise((resolve, reject) => {
			allPageModuleCheckAuth({})
				.then(res => {
					const { data } = res
					if (!data) {
						return reject('get pageAuth failed！')
					}
					let pages = []
					assemblePageModuleAuth(pages, data.pages)
					commit('SET_allPageModuleAuth', pages)
					console.log('pages:', pages)
					resolve(pages)
				})
				.catch(error => {
					reject(error)
				})
		})
	},

	// user logout
	logout({ commit, state, dispatch }) {
		return new Promise((resolve, reject) => {
			logout()
				.then(() => {
					commit('SET_TOKEN', '')
					commit('SET_ROLES', [])
					removeToken() // must remove  token  first
					resetRouter()
					// reset visited views and cached views
					dispatch('tagsView/delAllViews', null, { root: true })
					commit('SET_LOGOUTJUMP', true)
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	},

	// remove token
	resetToken({ commit }) {
		return new Promise(resolve => {
			removeToken() // must remove  token  first
			commit('RESET_STATE')
			resolve()
		})
	},

	// 批量导入
	import({ state }, { uri, params }) {
		return new Promise((resolve, reject) => {
			//let url = process.env.VUE_APP_BASE_API + uri;
			params.append('fromSystem', 'web_H5')
			params.append('toSystem', 'mng_base_server')
			params.append('reqId', randomString())
			if (!params.get('reqTime')) {
				params.append('reqTime', parseTime(new Date().getTime()))
			}
			let token = getToken()
			axios({
				// 用axios发送post请求
				method: 'post',
				url: uri, // 请求地址
				data: params, // 参数
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: token,
					fileUid: params.get('file') && params.get('file').fileUid
				}
			})
				.then(res => {
					if (res.data.code === 0) {
						resolve(res)
					} else {
						// token验证失败，失效
						if (res.data.code === 100004 || res.data.code === 100005) {
							// to re-login
							return MessageBox.confirm('请重新登录', '提示', {
								confirmButtonText: '去登录',
								cancelButtonText: '取消',
								type: 'warning'
							})
								.then(() => {
									store.dispatch('user/resetToken').then(() => {
										location.reload()
									})
								})
								.catch(err => {})
						} else {
							Message({
								message: res.data.msg || 'Error',
								type: 'error',
								showClose: true
							})
							reject(new Error(res.data.msg || 'Error')) // 'error'
						}
						// Message({
						// 	message: res.data.msg || 'Error',
						// 	type: 'error',
						// 	showClose: true
						// })
						// resolve(res) // 'error'
					}
				})
				.catch(error => {
					reject(error)
				})
		})
	}
}

export default {
	namespaced: true,
	state,
	mutations,
	actions
}
