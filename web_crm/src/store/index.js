import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import permission from './modules/permission'
import settings from './modules/settings'
import user from './modules/user'
import tagsView from './modules/tagsView'
import dict from './modules/dict'
// import charge from './modules/charge'
// import order from './modules/order'
// import railway from './modules/railway'
// import book from './modules/book'
// import orderService from './modules/orderService'
import crm from './modules/crm'
// import finance from './modules/finance'
// import notice from './modules/notice'
// import airTransport from './modules/airTransport'
// import airTransportBook from './modules/airTransportBook'
import contract from './modules/contract'
import followItems from './modules/followItems'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    permission,
    settings,
    user,
    tagsView,
    dict,
    // charge,
    // order,
    // railway,
    // book,
    // orderService,
    // finance,
    crm,
    // notice,
    // airTransport,
    // airTransportBook,
    contract,
    followItems
  },
  getters
})

export default store
