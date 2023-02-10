import Cookies from 'js-cookie'
import { setDialStyAmend } from '@/utils/setAboutDial'
import { getFinDateLimit } from '@/api/base.js'
let requestFlag = false
const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  sPartWidth: 0,
  tPartHeight: 0,
  limitDate: '',
}

const mutations = {
  TOGGLE_SIDEBAR: (state, payload) => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
      state.sPartWidth = 144
    } else {
      Cookies.set('sidebarStatus', 0)
      state.sPartWidth = 0
    }
    console.log('payload', payload, payload.name)
    setDialStyAmend(payload)
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_SPART_WIDTH: (state, payload) => {
    state.sPartWidth = payload
  },
  SET_TPART_HEIGHT: (state, payload) => {
    state.tPartHeight = payload
  },
  SET_DATE_LIMIT: (state, date) => {
    state.limitDate = date
  }
}

const actions = {
  toggleSideBar({ commit }, payload) {
    commit('TOGGLE_SIDEBAR', payload)
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  setSPartWidth({ commit }, payload) {
    commit('SET_SPART_WIDTH', payload)
  },
  setTPartHeight({ commit }, payload) {
    commit('SET_TPART_HEIGHT', payload)
  },
  setDateLimit({ commit }) {
    return new Promise((resolve, reject) => {
      if (!state.limitDate && !requestFlag) {
        requestFlag = true
        getFinDateLimit({})
        .then(res => {
          requestFlag = false
          if (res){
            commit('SET_DATE_LIMIT', res.data)
            resolve(res.data)
          } else {
            commit('SET_DATE_LIMIT', '')
            resolve('')
          }
        })
        .catch(err => {
          requestFlag = false
          reject('err')
        })
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
