<template>
  <component :is="type" v-bind="linkProps(to)" @mouseenter.native="sidebarMouseenter" @mouseleave.native="sidebarMouseleave">
    <slot />
  </component>
</template>

<script>
import { isExternal } from '@/utils/validate'

export default {
  props: {
    to: {
      type: String,
      required: true
    },
    route: {
      type: Object,
      required: false
    }
  },
  computed: {
    isExternal() {
      return isExternal(this.to)
    },
    type() {
      if (this.isExternal || this.route.routeCode) {
        return 'a'
      }
      return 'router-link'
    }
  },
  methods: {
    linkProps(to) {
      if (this.isExternal) {
        return {
          href: to,
          target: '_blank',
          rel: 'noopener'
        }
      }
      if (this.route.routeCode) {
        return {
          href: '/web-main/#' + this.route.routeCode,
          target: '_blank',
          rel: 'noopener'
        }
      }
      return {
        to: { name: this.route.name } // to: to
      }
    },
    sidebarMouseenter() { // 更早执行
      // if (this.route && this.route.meta) {
      //   this.route.meta.refresh = true
      // }
    },
    sidebarMouseleave() {
      // if (this.route && this.route.meta) {
      //   this.route.meta.refresh = false
      // }
    }
  }
}
</script>
