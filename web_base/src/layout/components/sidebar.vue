<template>
  <div class="menu-box" v-loading="loading">
    <div wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="state.activeCode"
        mode="vertical"
        :collapse="state.isCollapse"
        :collapse-transition="false"
      >
        <el-menu-item index="Home" @click="goSub(homePage)">
          <i class="el-icon-dashboard"></i>
          <span>首页</span>
        </el-menu-item>
        <div v-for="(item, index) in allMenu" :key="index">
          <SidebarItem :subMenu="item" />
        </div>
      </el-menu>
    </div>
  </div>
</template>

<script>
import actions from '@/store'
import { getMenu } from '@/api'
import SidebarItem from './sidebarItem.vue'
import settings from '@/settings'
import { getTokenCookie } from '@/utils'
export default {
  components: {
    SidebarItem
  },
  data() {
    return {
      loading: false,
      token: '',
      icons: {
        Home: 'el-icon-dashboard',
        Plan: 'el-icon-plan',
        ManagementDuty: 'el-icon-duty-manager',
        SeaShipping: 'el-icon-sea-shipping',
        AirTransport: 'el-icon-air-transport',
        Railway: 'el-icon-railway',
        CustomsDeclaration: 'el-icon-sea-shipping',
        Take: 'el-icon-take',
        Put: 'el-icon-put',
        Finance: 'el-icon-finance',
        WorkException: 'el-icon-work-exception',
        WarehouseIndex: 'el-icon-warehouse-index',
        SwCms: 'el-icon-swcms',
        CRM: 'el-icon-crm',
        AuditIndex: 'el-icon-audit-index',
        Cosco: 'el-icon-online-rob-tank',
        BKG: 'el-icon-predict-manage',
        CompanyResource: 'el-icon-company-source',
        Permission: 'el-icon-permission',
        BaseData: 'el-icon-data-base',
        Wms: 'el-icon-wms'
      },
      allMenu: [],
      activeIndex: 'Home',
      state: {},
      homePage: {
        resourceCode: 'Home',
        resourceName: '首页',
        routeCode: '/home',
        subResource: []
      }
    }
  },
  created() {
    this.token = actions.getGlobalState('token') || getTokenCookie()
    let isLogin = location.hash === '#/login'
    if (this.token && !isLogin) {
      this.getAllMenu()
    }
  },
  methods: {
    goSub(item) {
      let { resourceName: title, routeCode: url, resourceCode: code } = item
      let tag = { title, url, code }
      actions.setGlobalState({
        activeTag: tag,
        activeCode: tag.code
      })
      let codes = this.state.tags.map((ele) => ele.code)
      if (!codes.includes(code)) {
        actions.setGlobalState({
          tags: [...this.state.tags, tag]
        })
      }
      history.pushState(null, '', `/web-main/#${url}`)
    },
    getAllMenu() {
      this.loading = true
      getMenu({ token: this.token, sysCode: 'wms,adm,sw,crm' })
        .then((res) => {
          if (res.code === 0) {
            let allMenu = res.data
            allMenu = this.generateMenusFrontWebMain(allMenu)
            this.allMenu = allMenu
            localStorage.setItem('allMenu', JSON.stringify(allMenu))
            actions.setGlobalState({
              allMenu
            })
            this.searchTree(allMenu)
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    searchTree(allMenu) {
      let hash = location.hash.replace('#', '')
      if (hash !== '/home') {
        let source = this.recursionGet(allMenu, hash)
        let tag = {}
        if (source) {
          tag = {
            title: source.resourceName,
            code: source.resourceCode,
            url: source.routeCode
          }
          actions.setGlobalState({
            activeCode: tag.code
          })
        } else {
          // crm详情打开新tab-新增tag
          let state = JSON.parse(sessionStorage.getItem('store'))
          let routes = sessionStorage.getItem(`${state.appName}-routes`)
          if (routes) {
            let { path, fullPath } = this.$route
            let sub = path.split('/')
            let source = this.findRouter(JSON.parse(routes), sub.at(-1))
            if (source) {
              tag = {
                title: source?.meta?.title,
                code: source?.name,
                url: fullPath
              }
            }
          }
        }
        if (tag.code) {
          actions.setGlobalState({
            activeTag: tag
          })
          actions.addGlobalTag(tag)
          sessionStorage.setItem(
            'store',
            JSON.stringify(actions.getGlobalState())
          )
        }
      }
    },
    // 递归获取菜单
    recursionGet(allMenu, url) {
      let value = null
      for (let index = 0; index < allMenu.length; index += 1) {
        let sub = allMenu[index].subResource
        if (sub.length) {
          let res = this.recursionGet(sub, url)
          if (res) return res
        } else {
          if (allMenu[index].routeCode === url) {
            value = allMenu[index]
            break
          }
        }
      }
      return value
    },
    findRouter(routes = [], path) {
      let res = null
      routes.forEach((item) => {
        if (item.children) {
          let find = this.findRouter(item.children, path)
          if (find) {
            res = find
          }
        } else {
          if (item.path === path) {
            res = item
          }
        }
      })
      return res
    },
    generateMenusFrontWebMain(menus, isSubMenu) {
      let menusFront = []
      menus.forEach((menu) => {
        if (
          settings.menusNotShow
            .concat(['page-show', 'tab-', 'btn-'])
            .every((item) => {
              return (
                !menu.resourceCode.startsWith(item) &&
                menu.resourceType === 'menu'
              )
            })
        ) {
          menusFront.push(menu)
        }
        if (menu.subResource.length) {
          menu.subResource = this.generateMenusFrontWebMain(
            menu.subResource,
            true
          )
        }
      })
      return menusFront
    }
  },
  mounted() {
    this.state = actions.getGlobalState()
  }
}
</script>

<style lang="scss" scoped>
@import '@/style/icon.css';
.menu-box {
  height: 100%;
  transition: width 0.28s;
  width: 144px;
  background-color: #fff;
  position: relative;
  :deep(.el-menu) {
    .is-active > .el-submenu__title {
      font-weight: 700;
      color: #222;
    }
    .el-submenu__title,
    .el-menu-item {
      font-size: 12px;
      height: 32px;
      line-height: 32px;
      margin: 0 -15px;
      display: flex;
      align-items: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .el-menu-item {
      padding: 0;
      min-width: none;
    }
    i {
      width: 14px;
      height: 14px;
      font-size: 14px;
      margin-right: 4px;
      margin-left: -2px;
      &.el-submenu__icon-arrow {
        font-size: 12px;
      }
    }
    .el-scrollbar {
      height: 100%;
    }
    .is-horizontal {
      display: none;
    }
    .el-menu {
      .el-menu {
        li {
          padding-left: 50px !important;
        }
      }
    }
  }
}
</style>
