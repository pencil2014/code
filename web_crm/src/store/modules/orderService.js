import { blListBox } from '@/api/order/bl'
import { orderContainerList } from '@/api/order/list'

const state = {
	blIdOptions: [],
	containerList: [],
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
	SET_CONTAINERLIST: (state, data) => {
    state.containerList = data.filter(item => item.cn)
  },
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
}

export default {
	namespaced: true,
	state,
	mutations,
	actions
}
