<template>
  <el-popover
    popper-class="diy-popover"
    v-clickoutside="()=> dropDownVisible = false"
    v-model="dropDownVisible"
    placement="bottom-start"
    trigger="click"
    @show="showPanel"
    @hide="dropDownVisible = false"
  >
    <div @click="dropDownVisible = true" class="popover__container">
      <el-scrollbar
        ref="suggestionPanel"
        tag="ul"
        class="el-cascader__suggestion-panel"
        view-class="el-cascader__suggestion-list"
        v-for="(suggestion, colIndex) in suggestions"
        :key="colIndex"
      >
        <template v-if="suggestion && suggestion.length">
          <li
            v-for="(item, rowIndex) in suggestion"
            :key="item.deptId"
            :class="[ 'el-cascader__suggestion-item', item.checked && 'is-checked' ]"
            @click="handleSuggestionClick(colIndex, rowIndex, item)"
          >
            <span>{{ item.deptCname }}</span>
            <i v-if="item.checked" class="el-icon-check"></i>
            <i v-else-if="item.childList" class="el-icon-arrow-right"></i>
          </li>
        </template>
        <slot v-else name="empty">
          <li class="el-cascader__empty-text">无数据</li>
        </slot>
      </el-scrollbar>
    </div>
    <el-input
      slot="reference"
      ref="input"
      v-model="inputValue"
      size="mini"
      :readonly="true"
      :validate-event="false"
      :placeholder="placeholder"
    >
      <template slot="suffix">
        <i
          v-if="clearBtnVisible"
          key="clear"
          class="el-input__icon el-icon-circle-close"
          @click.stop="handleClear"
        ></i>
        <i
          v-else
          key="arrow-up"
          :class="[
            'el-input__icon',
            'el-icon-arrow-up',
            dropDownVisible && 'is-reverse'
          ]"
          @click.stop="dropDownVisible = !dropDownVisible"
        ></i>
      </template>
    </el-input>
  </el-popover>
</template>

<script>
import Clickoutside from 'element-ui/src/utils/clickoutside'
import scrollIntoView from 'element-ui/src/utils/scroll-into-view'
export default {
  name: 'lsCascader',
  directives: { Clickoutside },
  data() {
    return {
      // 下拉显示|隐藏
      dropDownVisible: false,
      inputValueArr: [],
    }
  },
  watch: {
    value(val) {
      // console.log('值更新`````````', val)
      if (val === '') {
        this.inputValueArr = []
      }
    },
  },
  props: {
    // 树数据
    treeData: {
      type: Array,
      default: () => [],
    },
    // 选中的数据
    value: '',
    placeholder: '',
  },
  computed: {
    clearBtnVisible() {
      return !!this.inputValue
    },
    // 输入框显示内容
    inputValue() {
      return this.inputValueArr.join('/')
    },
    // inputValueArr() {
    //   let arr = []
    //   if (this.value.length) {
    //     this.getTreeDataCname(arr, [...this.value])
    //   }
    //   console.log(arr)
    //   return arr
    // },
    suggestions() {
      // console.log('更新panel`````````', this.value)
      this.dealTreeDataChecked()
      let arr = [this.treeData]
      if (this.value.length) {
        this.inputValueArr = []
        this.getShowTreeData(arr, [...this.value])
      }
      setTimeout(() => {}, 200)
      return arr
    },
  },
  methods: {
    // 处理树结构的checked状态
    dealTreeDataChecked(list) {
      ;(list || this.treeData).forEach((item) => {
        this.$set(item, 'checked', false)
        item.childList && this.dealTreeDataChecked(item.childList)
      })
    },
    // 获得树结构需要显示的数据
    getShowTreeData(result, levels, list) {
      ;(list || this.treeData).forEach((item) => {
        if (!levels.length) return
        if (item.deptCode === levels[0]) {
          levels.shift()
          // 选中状态与现实内容同步
          this.inputValueArr.push(item.deptCname)
          this.$set(item, 'checked', true)
          if (item.childList) {
            result.push(item.childList)
            this.getShowTreeData(result, levels, item.childList)
          }
        }
      })
    },
    // 获得树结构代码对应中文名
    // getTreeDataCname(result, levels, list) {
    //   console.log(result, levels)
    //   ;(list || this.treeData).forEach((item) => {
    //     if (!levels.length) return
    //     if (item.deptCode === levels[0]) {
    //       levels.shift()
    //       // console.log(item.deptCname)
    //       result.push(item.deptCname)
    //       // console.log(result)
    //       levels.length && this.getShowTreeData(result, levels, item.childList)
    //     }
    //   })
    // },
    // 点击处理选择的数据
    handleSuggestionClick(colIndex, rowIndex, item) {
      // console.log(+colIndex, +this.value.length)
      if (+colIndex < +this.value.length) {
        // 点击的列索引小于本来值的长度，表示上级
        if (item.deptCode === this.value[colIndex]) {
          // this.inputValueArr.splice(+colIndex + 1)
          this.value.splice(+colIndex + 1)
        } else {
          // this.inputValueArr.splice(+colIndex, 100, item.deptCname)
          this.value.splice(+colIndex, 100, item.deptCode)
        }
      } else if (+colIndex === +this.value.length) {
        // 点击的列索引等于本来值的长度，表示当前级
        if (item.deptCode === this.value[colIndex]) {
          // this.$nextTick(() => {
          //   // 加减其它搜索条件是，会重新赋值，此时 inputValueArr 为[]
          //   if (this.inputValueArr[colIndex] !== item.deptCname) {
          //     this.inputValueArr = []
          //     let suggestions = this.suggestions
          //     this.value.forEach((val, index) => {
          //       let find = suggestions[index].find(({ deptCode }) => val === deptCode)
          //       this.inputValueArr.push(find.deptCname)
          //     })
          //   }
          // })
          // console.log('```````````全等');
          return
        } else if (typeof this.value === 'string') {
          // this.inputValueArr = [item.deptCname]
          this.$emit('update:value', [item.deptCode])
        } else {
          // this.inputValueArr.push(item.deptCname)
          this.value.push(item.deptCode)
        }
      } else {
        // 点击的列索引大于本来值的长度，表示下级
        if (typeof this.value === 'string') {
          // this.inputValueArr = [item.deptCname]
          this.$emit('update:value', [item.deptCode])
        } else {
          // this.inputValueArr.push(item.deptCname)
          this.value.push(item.deptCode)
        }
      }
    },
    showPanel() {
      this.dropDownVisible = true
      this.$nextTick(() => {
        if (this.$refs && this.$refs.suggestionPanel) {
          this.$refs.suggestionPanel.forEach((menu) => {
            const menuElement = menu.$el
            if (menuElement) {
              const container = menuElement.querySelector('.el-scrollbar__wrap')
              const activeNode = menuElement.querySelector('.el-cascader__suggestion-item.is-checked')
              scrollIntoView(container, activeNode)
            }
          })
        }
      })
    },
    handleFocus(e) {
      this.$emit('focus', e)
    },
    handleBlur(e) {
      this.$emit('blur', e)
    },
    handleClear() {
      this.inputValueArr = []
      this.$emit('update:value', '')
    },
  },
}
</script>
<style lang="scss" scoped>
.popover__container {
  display: flex;
  & > div {
  }
}
.el-input ::v-deep {
  input {
    cursor: pointer;
  }
  .el-input__suffix {
    cursor: pointer;
    right: 3px !important;
    .el-icon-arrow-up {
      font-size: 14px;
      transform: rotateZ(180deg);
      &.is-reverse {
        transform: rotateZ(0deg);
      }
    }
  }
}
::v-deep {
  .el-scrollbar__wrap{
    margin-bottom: 0 !important;
    overflow-x: hidden !important;
  }
  .el-cascader__suggestion-panel + .el-cascader__suggestion-panel {
    border-left: 1px solid #dfe4ed;
    border-radius: 0;
  }
  .el-cascader__suggestion-list {
    width: 160px;
    padding: 0;
    li {
      height: 28px;
      line-height: 28px;
      font-size: 12px;
      &.el-cascader__empty-text:hover {
        background: none;
      }
      &:hover {
        background: #f5f7fa;
      }
      &.isChecked {
        color: #1890ff;
        font-weight: bold;
      }
    }
  }
}
</style>