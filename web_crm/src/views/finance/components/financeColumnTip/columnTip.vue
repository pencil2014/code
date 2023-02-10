<template>
  <div class="finance-column-detail"
    v-if="componentProps.show || showInner"
    :style="{left: left + 'px', bottom: placement === 'bottom' ? 'auto' : bottom + 'px', top: placement === 'bottom' ? top + 'px' : 'auto', background: componentProps.background || '#303133', boxShadow: componentProps.boxShadow || '', border: componentProps.border || '', maxHeight}"
    @mouseenter="columnDetailMouseEnter"
    @mouseleave="columnDetailMouseLeave">
    <slot>
      <ul v-if="componentProps.data && componentProps.data.length > 0">
        <li v-for="(item, index) in componentProps.data.filter(v=>v!=='null')"
          :key="'componentProps' + index"
          class="finance-column-li">
          <span v-if="componentProps.tag && componentProps.row._dataObj && componentProps.row._dataObj[item]" class="finance-self-tag drop">甩</span>
          <span
            :style="{color: componentProps.callback && (!componentProps.firstNormal || index > 0) ? '#3e80f5' : '#fff', lineHeight: '16px'}"
            :class="componentProps.callback && (!componentProps.firstNormal || index > 0) ? 'underline' : ''"
            @click.stop="showDetail(item, componentProps, index, componentProps.row, componentProps.item)">{{item ? item : "''"}}</span>
        </li>
      </ul>
      <div v-if="componentProps.formatter" class="finance-column-detail-formatter" v-html="componentProps.formatter(componentProps.row, componentProps)">
      </div>
    </slot>
    <slot :name="componentProps.slot" :componentProps="componentProps"></slot>
    <div class="column-tip-arrow-wrapper"
      :style="{left: left + 'px', bottom: placement === 'bottom' ? 'auto' : bottomArrow + 'px', top: placement === 'bottom' ? topArrow + 'px' : 'auto'}"
    >
      <div :class="{'column-tip-arrow': placement !== 'bottom','column-tip-top-arrow': placement === 'bottom'}"
        :style="{left: leftArrow + 'px', bottom: placement === 'bottom' ? 'auto' : bottomArrow + 'px', top: placement === 'bottom' ? topArrow + 'px' : 'auto', borderTopColor: componentProps.background || '#303133'}"
      ></div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'columnTip',
  props: {
    componentProps: {
      type: Object,
      default: () => ({
        show: false,
        data: [],
        event: null,
        row: {_dataObj:{}},
        formatter: '',
        backgroundColor: '',
        boxShadowColor: '',
        slot: '',
        placement: '',
        item: {},
        maxHeight: ''
      })
    }
  },
  data() {
    return {
      showInner: false,
      timer: null,
      width: 200,
      left: 0,
      top: 0,
      bottom: 0,
      leftArrow: 0,
      bottomArrow: 0
    }
  },
  created() {
    this.computePosition()
  },
  mounted() {
  },
  computed: {
    placement() {
      return this.componentProps.placement
    },
    maxHeight() {
      let maxHeight = this.componentProps.maxHeight
      if (maxHeight === 'auto') {
        return 'auto'
      } else if (maxHeight) {
        return parseInt(maxHeight) + 'px'
      } else {
        return '255px'
      }
    }
  },
  components: {
  },
  methods: {
    columnDetailMouseEnter() {
      clearTimeout(this.timer)
      this.showInner = true
    },
    columnDetailMouseLeave() {
      clearTimeout(this.timer)
      this.showInner = false
    },
    computePosition() {
      this.width = this.componentProps.width ? this.componentProps.width + 26 : 200
      // let height = this.componentProps.data.length * 20 + 16 // 改用bottom，无需计算height，另外非data列表的情况，计算不了height。
      // height = height < 40 ? 40 : height
      let target = this.componentProps.event.target
      let left = target.getBoundingClientRect().left
      let top = target.getBoundingClientRect().top
      let bottom = target.getBoundingClientRect().bottom
      let offsetHeight = target.offsetHeight
      let offsetWidth = target.offsetWidth
      this.left = left + offsetWidth * 0.5 - this.width * 0.5
      this.leftArrow = this.left + this.width * 0.5 - 3
      let clientHeight = document.documentElement.clientHeight
      this.bottom = clientHeight - top + 4
      this.bottomArrow = clientHeight - top - 2
      // this.top = top - 8 - height // 10
      this.top = top + offsetHeight
      this.topArrow = top + offsetHeight - 8
    },
    showDetail(no, componentProps, index, row, item) {
      this.componentProps.callback && this.componentProps.callback(no, componentProps, index, row, item)
    }
  },
  watch: {
    'componentProps.show': {
      handler(newVal, oldVal) {
        if (!newVal) {
          this.timer = setTimeout(() => {
            this.showInner = false
          }, 300)
        }
        if (newVal) {
          this.computePosition()
          clearTimeout(this.timer)
          this.showInner = true // 手动设置为true
        }
      },
      deep: true,
      immediate: true
    },
    'left': { // 用于超出客户端时
      handler(newVal, oldVal) {
        let  CLIENTWIDTH = document.body.clientWidth
        if (newVal + this.width > CLIENTWIDTH) {
          this.left = CLIENTWIDTH - this.width
        }
      },
      deep: true,
      immediate: true
    },
    'bottom': {
      handler(newVal, oldVal) { // 目前无需修正
      },
      deep: true,
      immediate: true
    },
    'top': { // 用于超出客户端时---不使用top
      handler(newVal, oldVal) {
        return
        if (this.componentProps.data) {
          let  CLIENTHEIGHT = document.body.clientHeight
          // let height = 100
          // if (this.componentProps.formatter) {
          //   height = this.componentProps.formatter.length * 12 / this.width // height暂时给的更大
          // } else if (this.componentProps.data) {
          //   height = this.componentProps.data.length * 20 + 16
          // } else 
          // if (newVal + height > CLIENTHEIGHT) {
          //   this.top = CLIENTHEIGHT - height
          // }
          let height = this.componentProps.data.length * 20 + 16
          height = height < 40 ? 40 : height
          if (height > newVal) {
            this.top = height
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
}
</script>
<style scoped>
.finance-column-detail{
  position: fixed;
  left: 0;
  min-width: 180px;
  min-height: 40px;
  border-radius: 4px;
  z-index: 3000;
  padding: 8px 13px 8px 13px;
  box-sizing: border-box;
  background: #303133;
  overflow: auto;
}
.finance-column-detail .finance-column-li{
  padding: 2px 0px;
  text-align: left;
}
.finance-column-detail .underline{
  text-decoration: underline;
  cursor: pointer;
}
.finance-column-detail-formatter {
  color: #FFF;
  padding: 2px 0px;
  line-height: 16px;
}
.column-tip-arrow-wrapper {
  position: fixed;
  width: 180px;
  height: 6px;
  background: transparent;
}
.column-tip-arrow {
  position: fixed;
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 7px solid #FFF;
}
.column-tip-top-arrow {
  position: fixed;
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 7px solid #FFF;
}
</style>