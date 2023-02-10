import actions from './store'
const getActiveRule = (hash) => (location) => location.hash.startsWith(hash)
const getActiveRule2 = (hash) => (location) => hash.some(item =>  location.hash.startsWith(item))
const microApps = [
  {
    name: 'finance',
    entry: process.env.VUE_APP_SUB_FIN,
    activeRule: getActiveRule('#/finance')
  },
  {
    name: 'order',
    entry: process.env.VUE_APP_SUB_ORDER,
    activeRule:getActiveRule('#/order')
  },
  {
    name: 'crm',
    entry: process.env.VUE_APP_SUB_CRM,
    activeRule: getActiveRule('#/crm')
  }
]
const apps = microApps.map(item => {
  return {
    ...item,
    container: '#subapp-viewport', // 子应用挂载的div
    props: {
      routerBase: item.activeRule, // 下发基础路由
      getGlobalState: actions.getGlobalState, // 下发getGlobalState方法
      addGlobalTag: actions.addGlobalTag,
      setGlobalState: actions.setGlobalState,
      delGlobalTag: actions.delGlobalTag
    }
  }
})

export default apps