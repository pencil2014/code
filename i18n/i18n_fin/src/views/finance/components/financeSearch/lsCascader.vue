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
          <li class="el-cascader__empty-text">{{$t('Common.noData')}}</li>
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
      // ????????????|??????
      dropDownVisible: false,
      inputValueArr: [],
    }
  },
  watch: {
    value(val) {
      // console.log('?????????`````````', val)
      if (val === '') {
        this.inputValueArr = []
      }
    },
  },
  props: {
    // ?????????
    treeData: {
      type: Array,
      default: () => [],
    },
    // ???????????????
    value: '',
    placeholder: '',
  },
  computed: {
    clearBtnVisible() {
      return !!this.inputValue
    },
    // ?????????????????????
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
      // console.log('??????panel`````````', this.value)
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
    // ??????????????????checked??????
    dealTreeDataChecked(list) {
      ;(list || this.treeData).forEach((item) => {
        this.$set(item, 'checked', false)
        item.childList && this.dealTreeDataChecked(item.childList)
      })
    },
    // ????????????????????????????????????
    getShowTreeData(result, levels, list) {
      ;(list || this.treeData).forEach((item) => {
        if (!levels.length) return
        if (item.deptCode === levels[0]) {
          levels.shift()
          // ?????????????????????????????????
          this.inputValueArr.push(item.deptCname)
          this.$set(item, 'checked', true)
          if (item.childList) {
            result.push(item.childList)
            this.getShowTreeData(result, levels, item.childList)
          }
        }
      })
    },
    // ????????????????????????????????????
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
    // ???????????????????????????
    handleSuggestionClick(colIndex, rowIndex, item) {
      // console.log(+colIndex, +this.value.length)
      if (+colIndex < +this.value.length) {
        // ?????????????????????????????????????????????????????????
        if (item.deptCode === this.value[colIndex]) {
          // this.inputValueArr.splice(+colIndex + 1)
          this.value.splice(+colIndex + 1)
        } else {
          // this.inputValueArr.splice(+colIndex, 100, item.deptCname)
          this.value.splice(+colIndex, 100, item.deptCode)
        }
      } else if (+colIndex === +this.value.length) {
        // ????????????????????????????????????????????????????????????
        if (item.deptCode === this.value[colIndex]) {
          // this.$nextTick(() => {
          //   // ?????????????????????????????????????????????????????? inputValueArr ???[]
          //   if (this.inputValueArr[colIndex] !== item.deptCname) {
          //     this.inputValueArr = []
          //     let suggestions = this.suggestions
          //     this.value.forEach((val, index) => {
          //       let find = suggestions[index].find(({ deptCode }) => val === deptCode)
          //       this.inputValueArr.push(find.deptCname)
          //     })
          //   }
          // })
          // console.log('```````````??????');
          return
        } else if (typeof this.value === 'string') {
          // this.inputValueArr = [item.deptCname]
          this.$emit('update:value', [item.deptCode])
        } else {
          // this.inputValueArr.push(item.deptCname)
          this.value.push(item.deptCode)
        }
      } else {
        // ?????????????????????????????????????????????????????????
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