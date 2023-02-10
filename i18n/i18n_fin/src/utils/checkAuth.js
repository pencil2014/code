import store from '@/store'
const defaultSettings = require('../settings')

export function assemblePageModuleAuth(pages, modules, isSubModule, isNotEffectModule) {
  let effectModules = defaultSettings.pageAuthEffectModules
  let pagesOutofModule = defaultSettings.pagesOutofModule
	for (let i = 0; i < modules.length; i++) {
    let item = modules[i]
    if (!effectModules.includes(item.moduleCode) && !isSubModule) { // item.resourceCode
      assemblePageModuleAuth(pages, item.modules, true, true)
      continue
    }
    if (isNotEffectModule) {
      if (item.moduleCode.startsWith('route-')) {
        item.pageCode = item.moduleCode.replace('route-', '')
        item.pageName = item.moduleName
        item.pageAuth = item.moduleAuth
        delete item.moduleCode
        delete item.moduleName
        delete item.moduleAuth
      } else if (item.resourceType === 'menu') {
        item.pageCode = item.moduleCode
        item.pageName = item.moduleName
        item.pageAuth = item.moduleAuth
        delete item.moduleCode
        delete item.moduleName
        delete item.moduleAuth
      }
      if (pagesOutofModule.includes(item.pageCode)) {
        pages.push(item)
      }
      if (item.modules.length > 0) {
        assemblePageModuleAuth(pages, item.modules, true, true)
      }
      continue
    }
		if (item.pageCode) {
			pages.push(item)
    } else if (item.moduleCode.startsWith('route-')) {
      item.pageCode = item.moduleCode.replace('route-', '')
      item.pageName = item.moduleName
      item.pageAuth = item.moduleAuth
      delete item.moduleCode
      delete item.moduleName
      delete item.moduleAuth
			pages.push(item)
		} else if (item.resourceType === 'menu') {
      item.pageCode = item.moduleCode
      item.pageName = item.moduleName
      item.pageAuth = item.moduleAuth
      delete item.moduleCode
      delete item.moduleName
      delete item.moduleAuth
      pages.push(item)
    }
		if (item.modules.length > 0) {
			assemblePageModuleAuth(pages, item.modules, true)
		}
	}
}

export function checkAuth(pageCode, moduleCode, subModuleCode) {
  // if (store.getters.userInfo.loginAccount !== 'op') return true
  // console.log(pageCode, moduleCode, subModuleCode)
  let pages = store.getters.allPageModuleAuth
  let pagesForAuthHistory = store.getters.pagesForAuthHistory
  if (pagesForAuthHistory.includes(pageCode)) {
    return true // 兼容不返回auth no改造的历史数据
  }
  let page = pages.find(item => {
    return (item.pageCode || '').trim() === pageCode.trim()
  })
  if (!page) {
    return false // false-改为仅当页面存在，且pageAuth为no时才拒绝访问，避免没配置的页面访问不了-true改为false，不存在即拒绝访问
  }
  if (page.pageAuth === 'yes') {
    // // 还需鉴别“基本信息”模块的权限(目前这样设计)---新的权限配置为扁平化，去掉该校验
    // let modulePageShow = page.modules.find(item => {
    //   return (item.moduleCode || '').trim() === 'page-show'
    // })
    // if (modulePageShow && modulePageShow.moduleAuth === 'no') { // 当有“基本信息”模块，才校验它
    //   return false
    // } else 
    // {
      if (!moduleCode) { // 页面鉴权，不传moduleCode
        return true
      } else { // 子模块鉴权
        let module = page.modules.find(item => {
          return (item.moduleCode || '').trim() === moduleCode.trim()
        })
        if (!module) {
          return false
        }
        if (module.moduleAuth === 'yes') {
          // let modulePageShow = module.modules.find(item => {
          //   return (item.moduleCode || '').trim() === 'page-show'
          // })
          // if (modulePageShow && modulePageShow.moduleAuth === 'no') { // 当有“基本信息”模块，才校验它
          //   return false
          // }
          if (!subModuleCode) {
            return true
          } else { // tab的子模块鉴权
            let subModule = module.modules.find(item => {
              return (item.moduleCode || '').trim() === subModuleCode.trim()
            })
            if (!subModule) {
              return false
            }
            if (subModule.moduleAuth === 'yes') {
              return true
            } else {
              return false
            }
          }
        } else {
          return false
        }
      }
    // }
  } else {
    return false
  }
}

export function checkAuthTab($this, pageCode) {
  // if ($this.userInfo.loginAccount !== 'op') return
  let pages = $this.allPageModuleAuth
  pageCode = pageCode ? pageCode : $this.$route.name
  let page = pages.find(item => {
    return (item.pageCode || '').trim() === pageCode.trim()
  })
  if (!page) {
    return false
  }
  if (!$this.tabsList) return
  page.modules.forEach(module => {
    let moduleCode = module.moduleCode
    if (moduleCode && moduleCode.startsWith('tab-')) {
      // let modulePageShow = module.modules.find(item => { // 新的权限配置为扁平化，去掉该校验
      //   return (item.moduleCode || '').trim() === 'page-show'
      // })
      // let modulePageShowAuth = 'yes'
      // if (modulePageShow && modulePageShow.moduleAuth === 'no') { // 当有“基本信息”模块，才校验它
      //   modulePageShowAuth = 'no'
      // }
      // 20220518为只返回yes注释
      // if (module.moduleAuth === 'no') { // module.moduleAuth === 'no' || modulePageShowAuth === 'no'
      //   let name = moduleCode.substring(4)
      //   let tabIndex = $this.tabsList.findIndex(item => {
      //     return item.name === name || item.key === name
      //   })
      //   if (tabIndex > -1) {
      //     $this.tabsList.splice(tabIndex, 1)
      //   }
      // }
      if (module.moduleAuth === 'yes') {
        let name = moduleCode.substring(4)
        let f = $this.tabsList.find(item => {
          return item.name === name || item.key === name
        })
        if (f) {
          f.authYes = true
        }
      }
    }
  })
  for(let i = 0; i < $this.tabsList.length; i++) {
    let item = $this.tabsList[i]
    if (!item.authYes) {
      $this.tabsList.splice(i--, 1)
    }
  }
  if ($this.activeName || $this.activeName === '') {
    if ($this.tabsList && $this.tabsList.length) {
      $this.$nextTick(() => {
        $this.activeName = $this.tabsList[0].name
      })
    } else {
      $this.$nextTick(() => {
        $this.activeName = ''
      })
    }
  } else if ($this.activityKey || $this.activityKey === '') {
    if ($this.tabsList && $this.tabsList.length) {
      $this.$nextTick(() => {
        $this.activityKey = $this.tabsList[0].key
      })
    } else {
      $this.$nextTick(() => {
        $this.activityKey = ''
      })
    }
  }
}