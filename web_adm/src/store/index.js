import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import permission from './modules/permission'
import settings from './modules/settings'
import user from './modules/user'
import tagsView from './modules/tagsView'
import dict from './modules/dict'
import notice from './modules/notice'
import contract from './modules/contract'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    permission,
    settings,
    user,
    tagsView,
    dict,
    notice,
    contract
  },
  getters
})

export default store
