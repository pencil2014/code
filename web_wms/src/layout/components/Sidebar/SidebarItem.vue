<template>
  <div v-if="!item.hidden" class="parentMenu" :class="{'collapse':collapse}">
    <template v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren)&&!item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="onlyOneChild.name" :route="onlyOneChild"><!-- :to="resolvePath(onlyOneChild.path)" -->
        <el-menu-item :index="onlyOneChild.name" :class="{'submenu-title-noDropdown':!isNest}" class="el-menu-item__title"><!-- :index="resolvePath(onlyOneChild.path)" -->
          <item :icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)" :title="onlyOneChild.meta.title" :name="item.name" />
        </el-menu-item>
      </app-link>
    </template>
    <el-submenu v-else class="left-menu" ref="subMenu" :index="item.name"><!-- :index="resolvePath(item.path)" -->
      <template slot="title">
        <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" :name="item.name" />
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.meta ? child.meta.title : '' + ',' +child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-submenu>
  </div>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import Item from './Item'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    },
    collapse: {
      type: Boolean,
      default: false
    }
  },
  data() {
    // To fix https://github.com/PanJiaChen/vue-admin-template/issues/237
    // TODO: refactor with render function
    this.onlyOneChild = null
    return {}
  },
  methods: {
    hasOneShowingChild(children = [], parent) {
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // Temp set(will be used if only has one showing child)
          this.onlyOneChild = item
          return true
        }
      })

      // When there is only one child router, the child router is displayed by default
      if (showingChildren.length === 1) {
        if (showingChildren[0].name === 'Dashboard') {
          return true
        } else {
          return false // 其他不做限制
        }
      }

      // Show parent if there are no child router to display
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ... parent, path: parent.redirect || '', noShowingChildren: true }
        return true
      }

      return false
    },
    resolvePath(routePath) {
      routePath = routePath ? routePath : ''
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      return path.resolve(this.basePath, routePath)
    }
  }
}
</script>
<style lang="scss">
.left-menu{
  position: relative;
  .nest-menu .nest-menu{
    margin-left: -10px;
    .el-menu-item.is-active{
      background-color: #333 !important;
    }
  }
  .el-submenu__title{
    height: 24px;
    line-height: 24px;
    font-size: 12px;
    // margin-left: -10px;
    // .el-submenu__icon-arrow{
    //   right: 10px;
    // }
    span{
      display: block;
    }
  }
  // .abs-sub-menu{
  //   position: absolute;
  //   width: 400px;
  //   height: 200px;
  //   border:1px solid #ccc;
  //   background-color: #ddd;
  //   left: 220px;
  //   top: 0;
  //   z-index: 99999;
  // }
}
.parentMenu.nest-menu {
  .el-menu-item{
    height: 24px;
    line-height: 24px;
    font-size: 12px;
    // margin-left: -10px;
    span{
      display: block;
    }
  }
}
</style>
