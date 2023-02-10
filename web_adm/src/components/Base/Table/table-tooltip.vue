<!--table-tooltip.vue-->
<template>
  <!-- 文案溢出，显示tooltip -->
  <div :id="'table-toolTip'+randomNum" class="el-tooltip__popper is-dark table-toolTip" style="transform-origin: center top; z-index: 2003; position: fixed; display: none;word-break: break-all;padding:10px">
    <div class="table-tooltip">{{ tableCellTooltipText }}</div>
    <div class="popper__arrow_box">
      <div :id="'toolTip-arrow'+randomNum" class="popper__arrow"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tableCellMouse: {
      type: Object,
      default() {
        return {}
      }
    }
  },

  data() {
    return {
      toolDom: null,
      arrowDom: null,
      tableCellTooltipText: null, // 溢出文案
      mouseLeaveVal: {
        tooltip: 0, // 1-鼠标移入，2-鼠标移出，0-无焦点
        cell: false // 单元格
      },
      randomNum: Math.random()
    }
  },

  computed: {},

  watch: {
    mouseLeaveVal: {
      deep: true,
      handler(nv) {
        setTimeout(() => {
          if (nv.cell && 1 != nv.tooltip) {
            this.toogleActiveTooltip(false, this.toolDom)
          }
        }, 100)
      }
    },

    tableCellMouse: {
      deep: true,
      handler(nv, ov) {
        if (nv.hidden) {
          this.hiddenTooltip()
        } else if (nv.row && !nv.hidden) {
          this.showTooltip(nv.cellDom)
        }
      }
    }
  },

  created() {},

  mounted() {
    this.$nextTick(() => {
      this.toolDom = document.getElementById('table-toolTip' + this.randomNum)
      this.arrowDom = document.getElementById('toolTip-arrow' + this.randomNum)
      const _this = this
      this.toolDom &&
        this.toolDom.addEventListener('mouseleave', (event) => {
          _this.mouseLeaveVal.tooltip = 2
        })
      this.toolDom &&
        this.toolDom.addEventListener('mouseenter', (event) => {
          _this.mouseLeaveVal.tooltip = 1
        })
    })
  },

  methods: {
    // 文字溢出显示tooltip  动态计算top和left
    showTooltip(cell) {
      this.tableCellTooltipText = cell.innerText
      let textDom = this.textSize('12px', this.tableCellTooltipText)
      let textWidth = textDom.width >= 400 ? textDom.width : textDom.width + 1
      let textHeight = Math.min(textDom.height, 120)
      if (textWidth > cell.clientWidth) {
        const cellLeft = cell.getBoundingClientRect().left,
          cellTop = cell.getBoundingClientRect().top
        const computedPositonNum = this.hiddenToolPosition(
          textWidth,
          cell.clientWidth,
          cellLeft,
          cellTop,
          textHeight
        )
        if (!this.toolDom) return
        this.toolDom.style.top = `${computedPositonNum.top}px`
        this.toolDom.style.left = `${computedPositonNum.left}px`
        this.toolDom.style.width = `${computedPositonNum.width}px`
        this.arrowDom.style.left = `${computedPositonNum.arrowLeft}px`
        this.toogleActiveTooltip(true, this.toolDom)
        this.mouseLeaveVal.cell = false
        this.mouseLeaveVal.tooltip = 0
        this.toolDom.style.display = ''
      } else {
        this.toolDom.style.display = 'none'
      }
    },

    // toolTip定位计算
    hiddenToolPosition(txtWidth, cellWidth, cellLeft, cellTop, textHeight) {
      const toolHight = textHeight,
        toolWidth = txtWidth,
        webWidth = document.body.offsetWidth
      // webHeight = document.body.offsetHeight;
      let expectLeft = cellLeft - (toolWidth - cellWidth) / 2
      const toolWidthAndLeft = expectLeft + toolWidth,
        expectTop = cellTop - toolHight
      let arrowLeft // arrow left
      if (toolWidthAndLeft > webWidth) {
        const moreWidth = toolWidthAndLeft - webWidth
        expectLeft -= toolWidthAndLeft - webWidth
        arrowLeft = (toolWidth - moreWidth) / 2 + moreWidth - 6
      } else {
        arrowLeft = toolWidth / 2 - 6
      }
      return { left: expectLeft, top: expectTop, width: toolWidth, arrowLeft }
    },

    hiddenTooltip() {
      this.mouseLeaveVal.cell = true
    },

    //tooltip样式
    toogleActiveTooltip(show, toolDom) {
      if (show) {
        toolDom.classList.add(
          'el-fade-in-linear-enter-active',
          'el-fade-in-linear-enter-to',
          'el-popper'
        )
        setTimeout(() => {
          toolDom.classList.remove(
            'el-fade-in-linear-enter-active',
            'el-fade-in-linear-enter-to'
          )
        }, 500)
        toolDom.style.display = ''
      } else {
        toolDom.classList.add(
          'el-fade-in-linear-leave-active',
          'el-fade-in-linear-leave-to'
        )
        setTimeout(() => {
          toolDom.classList.remove(
            'el-fade-in-linear-leave-active',
            'el-fade-in-linear-leave-to',
            'el-popper'
          )
        }, 500)
        toolDom.style.display = 'none'
      }
    },

    textSize(fontSize, text) {
      const span = document.createElement('span')
      // let width = span.offsetWidth
      span.style.visibility = 'hidden'
      span.style.fontSize = fontSize
      span.style.lineHeight = '16px'
      span.style.display = 'inline-block'
      // span.style['white-space'] = 'nowrap'
      span.style.maxWidth = '400px'
      span.style.padding = '10px'
      span.style['word-break'] = 'break-all'
      document.body.appendChild(span)
      if ('undefined' != typeof span.textContent) {
        span.textContent = text
      } else {
        span.innerText = text
      }
      let width = Math.ceil(span.offsetWidth)
      let height = Math.ceil(span.offsetHeight)
      document.body.removeChild(span)
      return {
        width,
        height
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.table-toolTip {
  padding: 10px !important;
  line-height: 16px !important;
  .el-tooltip__popper {
    max-width: 400px !important;
    box-sizing: border-box;
  }
  .popper__arrow {
    // bottom: -6px;
    left: 50%;
    margin-right: 3px;
    border-bottom-width: 0;
    border-top-color: #303133;
    &::after {
      border-bottom-width: 0;
      border-top-color: #303133;
      bottom: 1px;
      margin-left: -6px;
    }
  }
  .popper__arrow_box {
    position: absolute;
    left: 0;
    bottom: -10px;
    background: rgba($color: #000000, $alpha: 0);
    width: 100%;
    height: 10px;
  }
}
.table-tooltip {
  max-height: 100px;
  overflow: auto;
}
.table-tooltip::-webkit-scrollbar {
  width: 0px;
}
</style>

