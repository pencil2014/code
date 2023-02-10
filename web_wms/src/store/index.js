import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import tagsView from './modules/tagsView'
import dict from './modules/dict'
import permission from './modules/permission'
import order from './modules/order'
import wms from './modules/wms'

Vue.use(Vuex)

const store = new Vuex.Store({
	modules: {
		app,
		permission,
		settings,
		user,
		tagsView,
		dict,
		order,
    wms
	},
	getters
})

export default store
