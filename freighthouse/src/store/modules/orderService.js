import { blListBox,railBlListBox } from '@/api/order/bl'
import { orderContainerList,railContainerList } from '@/api/order/list'

const state = {
	blIdOptions: [],
	railBlIdOptions: [],
	containerList: [],
	railContainerList: [],
	polLtlDispatchType: [
		{label: '散车收货', value: 'receive'},
		{label: '散车派送', value: 'deliver'},
	]
}

const mutations = {
	SET_BLNOLIST: (state, data) => {
    state.blIdOptions = data.map(item => {
			// let blType = item.blType === 'mbl' ? 'MBL' : item.blType === 'hbl' ? 'HBL' : ''
			// let label = `${blType}: ${item.blNo} (id: ${item.blId})`
			let label = item.blNo
			return Object.assign({}, item, {
				value: label,
				label: label
			})
		})
	},
	SET_RAILBLNOLIST: (state, data) => {
    state.railBlIdOptions = data.map(item => {			
			let label = item.blNo
			return Object.assign({}, item, {
				value: label,
				label: label
			})
		})
	},
	SET_CONTAINERLIST: (state, data) => {
    state.containerList = data.filter(item => item.cn)
  },
	SET_RAILCONTAINERLIST: (state, data) => {
    state.railContainerList = data.filter(item => item.cn)
  }
}

const actions = {
  getBlNoList({ commit, state }, param) {
    return new Promise((resolve, reject) => {
      blListBox({
				orderNo: param.orderNo,
				jointNo: param.jointNo
			}).then(response => {
        const { data } = response
        commit('SET_BLNOLIST', data)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
	},
	getRailBlNoList({ commit, state }, param) {
    return new Promise((resolve, reject) => {
      railBlListBox({
				orderNo: param.orderNo,
				jointNo: param.jointNo
			}).then(response => {
        const { data } = response
        commit('SET_RAILBLNOLIST', data)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
	},
	getContainerList({ commit, state }, param) {
		return new Promise((resolve, reject) => {
      orderContainerList({
				orderNo: param.orderNo,
				jointNo: param.jointNo
			}).then(response => {
        const { data } = response
        commit('SET_CONTAINERLIST', data)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
	},
	getRailContainerList({ commit, state }, param) {
		return new Promise((resolve, reject) => {
      railContainerList({
				orderNo: param.orderNo,
				jointNo: param.jointNo
			}).then(response => {
        const { data } = response
        commit('SET_RAILCONTAINERLIST', data)
        resolve(data)
      }).catch(error => {
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
