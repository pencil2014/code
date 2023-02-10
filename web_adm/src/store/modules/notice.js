import { queryFeeItemList } from '@/api/fin/feeitem'
import Vue from 'vue'

const state = {
  // noticeNameValueList: [
  //   {
  //     name: 'SettlementList',
  //     value: '88'
  //   },
  //   {
  //     name: 'GedgingList',
  //     value: '99'
  //   }
  // ],
  noticeNameValueObj: {
    // SettlementList: {
    //   name: 'SettlementList',
    //   value: '88'
    // },
    // GedgingList: {
    //   name: 'GedgingList',
    //   value: '99'
    // }
  }
}

const getters = {
  // getNoticeNameValueList(state) {
  //   return state.noticeNameValueList
  // },
  getNoticeNameValueObj (state) {
    return state.noticeNameValueObj
  },
}

const mutations = {
  // setNoticeNameValueList (state, payload) {
  //   state.noticeNameValueList = payload
  // },
  setNoticeNameValue (state, payload) {
    console.log(payload)
    let name = payload && payload.name
    if (name) {
      let value = payload.value
      Vue.set(state.noticeNameValueObj, name, {
        name,
        value
      })
      // state.noticeNameValueObj[name] = {
      //   name,
      //   value
      // }
    }
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations
}