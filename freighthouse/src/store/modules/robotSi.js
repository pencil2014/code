
import { getCarrierList } from '@/api/order/robotSi'
const state = {
  carrierList: [],
}
const mutations = {
  GET_CARRIER_LIST: (state, list) => {
    state.carrierList = list
  }
}

const actions = {
   getCarrierList({ commit }, params) {
    return new Promise((resolve, reject) => {
      if (state.carrierList && state.carrierList.length) {
        resolve(state.carrierList)
      } else {
        params = params || { isExec: 'YES'}
        getCarrierList(params)
        .then(res => {
          let list = (res.data || []).map(item => {
            item['label'] = item.shipCarrierCode
            item['value'] = item.shipCarrierCode
            return item
          })
          commit('GET_CARRIER_LIST', list)
          resolve(list)
        })
      }
    })
   }
}

export default {
  state,
  mutations,
  actions,
  namespaced: true,
}