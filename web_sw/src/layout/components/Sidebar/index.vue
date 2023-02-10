<template>
  <div :class="{'has-logo':showLogo}">
    <!-- <logo v-if="showLogo" :collapse="isCollapse" /> -->
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in menuRoutes" :key="route.name" :item="route" :base-path="route.path"/><!-- :key="route.path" -->
      </el-menu>
    </el-scrollbar>
    <div class="hideMenu">
      
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters([
      'menuRoutes',
      'sidebar',
      'noticeNameValueObj'
    ]),
    activeMenu() {
      const route = this.$route
      const { meta, name } = route // path
      // if set path, the sidebar will highlight the path you set
      if (meta && meta.isMenu) {
        sessionStorage.setItem('activeMenu', name) // path
        return name // path
      } else {
        if (name === 'Dashboard') {
          sessionStorage.setItem('activeMenu', name)
          return name // path
        }
        let activeMenu = ''
        if (meta && meta.activeMenu && !meta.activeMenu.includes('/')) {
          activeMenu = meta.activeMenu
        } else {
          if (meta) {
            meta.activeMenu = sessionStorage.getItem('activeMenu')
          }
          activeMenu = sessionStorage.getItem('activeMenu')
        }
        if (activeMenu) {
          return activeMenu
        } else {
          return name // path
        }
      }
      // if (meta.activeMenu) {
      //   return meta.activeMenu
      // }
      // return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  mounted() {
    // console.log('menuRoutes:', this.menuRoutes)
  },
  methods: {
    renderOneNotice (notice) {
      let sidebarCont = document.querySelector('.sidebar-container')
      let titleDom = null
      let titleDom1List = sidebarCont.querySelectorAll('.el-submenu__title')
      titleDom1List.forEach(item => {
        let sp = item.querySelector('span')
        if (sp.getAttribute('name') === notice.name) {
          titleDom = item
        }
      })
      if (!titleDom) {
        let titleDom2List = sidebarCont.querySelectorAll('.el-menu-item__title')
        titleDom2List.forEach(item => {
          let sp = item.querySelector('span')
          if (sp.getAttribute('name') === notice.name) {
            titleDom = item
          }
        })
      }
      if (titleDom) {
        let num = Number(notice.value)
        if (num && num > 99) {
          notice.value = '99+'
        }
        let badge = titleDom.querySelector('.ls-menu-badge')
        if (!badge) {
          badge = document.createElement('i')
          badge.className = 'ls-menu-badge'
          let top = 0
          if (notice.isDot) {
            badge.className = badge.className + ' is-dot'
            top = 4
          } else {
            badge.innerText = notice.value
          }
          let paddingLeft = parseInt(titleDom.style.paddingLeft)
          let iconWidth = 0
          if (titleDom.querySelector('.sub-el-icon') || titleDom.querySelector('.svg-icon')) {
            iconWidth = 8
          }
          let titleDomHeight = titleDom.clientHeight
          if (titleDomHeight > 30) {
            top = 11
          }
          let sp = titleDom.querySelector('span')
          let num = sp.innerText.length
          let left = paddingLeft + iconWidth + num * 12 + 13
          badge.style.left = left + 'px'
          badge.style.top = top + 'px'
          titleDom.style.position = 'relative'
          titleDom.appendChild(badge)
        } else {
          if (notice.isDot && badge.className.indexOf('is-dot') === -1) {
            badge.className = badge.className + ' is-dot'
          } else {
            badge.innerText = notice.value
          }
        }
        let parentName = this.findParentName(titleDom)
        if (parentName) {
          this.renderOneNotice({
            name: parentName,
            value: '',
            isDot: true
          })
        }
      }
    },
    findParentName (titleDom) {
      let parent = titleDom.parentNode
      let className = parent.className
      // 先do再while，因可打开的文件夹的菜单往上找.el-submenu，还是找到他自己，需再往上找一级
      do {
        parent = parent.parentNode
        className = parent.className
      } while(className.indexOf('el-submenu') === -1 && className.indexOf('el-scrollbar__view') === -1)
      if (className.indexOf('el-scrollbar__view') > -1) {
        return undefined
      } else {
        // 父元素的__title只有.el-submenu__title一种，因为他是父元素，是文件夹类型，不属于另外一种可打开的__title
        let elSubmenuTitleDom = parent.querySelector('.el-submenu__title')
        let sp = elSubmenuTitleDom
        if (elSubmenuTitleDom) {
          sp = elSubmenuTitleDom.querySelector('span')
          let name = sp.getAttribute('name')
          return name
        }
      }
    }
  },
  watch: {
    noticeNameValueObj: {
      handler(newVal, oldVal) {
        console.log(newVal)
        if (newVal) {
          this.$nextTick(() => {
            let arr = []
            for (let key in newVal) {
              let notice = newVal[key]
              this.renderOneNotice(notice)
            }
          })
        }
      },
      deep: true
    }
  }
}
</script>
<style>
.ls-menu-badge {
  position: absolute;
  left: 60px;
  top: 0px;
  background-color: #ff4949;
  border-radius: 10px;
  color: #FFFFFF !important;
  font-style:normal;
  display: inline-block;
  font-size: 12px;
  height: 18px !important;
  /* width: 24px; */
  line-height: 18px !important;
  padding: 0 6px;
  text-align: center;
  white-space: nowrap;
  /* border: 1px solid #FFFFFF; */
}
.ls-menu-badge.is-dot {
  height: 7px !important;
  width: 7px;
  padding: 0;
  border-radius: 50%;
}
</style>
