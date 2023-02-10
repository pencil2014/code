<template>
  <div class="ls_daterange">
    <!-- placeholder="开始时间"
      :format="filterGroups[item.key].format || 'yyyy-MM-dd'"
      :default-time="filterGroups[item.key]['default-time'] || (filterGroups[item.key].type !== 'date' && ['00:00:00', '23:59:59'])"
      :value-format="filterGroups[item.key].format"
    :picker-options="filterGroups[item.key].pickerOptions"-->
    <el-date-picker
      class="date__left"
      ref="beginVal"
      size="mini"
      v-model="beginVal"
      :type="options.type === 'lsDatetimerange' ? 'datetime' : 'date'"
      clearable
      placeholder="开始时间"
      :picker-options="beginOptions"
      :format="options.format || 'yyyy-MM-dd'"
      :value-format="options.format"
      @change="beginChange"
    />
    <span>~</span>
    <el-date-picker
      class="date__right"
      ref="endVal"
      size="mini"
      v-model="endVal"
      :type="options.type === 'lsDatetimerange' ? 'datetime' : 'date'"
      clearable
      placeholder="结束时间"
      :picker-options="endOptions"
      :format="options.format || 'yyyy-MM-dd'"
      :value-format="options.format"
      @change="endChange"
    />
  </div>
</template>

<script>
export default {
  name: 'lsDateRange',
  data() {
    return {
      beginVal: '',
      endVal: '',
      beginOptions: {
        disabledDate: (date) => {
          // if (date.getMonth() == 0) {
          //   console.log(this.endVal, ',', date, new Date(this.endVal + ' 00:00:00') - date)
          // }
          if (this.options.type === 'lsDatetimerange') {
            // date.setHours(23, 59, 59)
            return this.endVal ? date - new Date(this.endVal) > 0 : false
          }
          return this.endVal ? date - new Date(this.endVal + ' 00:00:00') > 0 : false
        },
      },
      endOptions: {
        disabledDate: (date) => {
          if (this.options.type === 'lsDatetimerange') {
            // date.setHours(23, 59, 59)
            return this.beginVal ? date - new Date(this.beginVal) < 0 : false
          }
          return this.beginVal ? date - new Date(this.beginVal + ' 00:00:00') < 0 : false
        },
      },
    }
  },
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
    item: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    beginChange(val) {
      let item = this.item
      if (!item.value) {
        item.value = [val]
      } else {
        if (this.endVal && val && new Date(val) - new Date(this.endVal) > 0) {
          item.value = [val, val]
        } else {
          this.$set(item.value, '0', val)
        }
        // item.value[0] = val
      }
      val && !this.endVal && this.$refs.endVal.focus()
      // console.log(val)
    },
    endChange(val) {
      let item = this.item
      if (!item.value) {
        item.value = ['', val]
      } else {
        if (this.beginVal && val && new Date(val) - new Date(this.beginVal) < 0) {
          item.value = [val, val]
        } else {
          this.$set(item.value, '1', val)
        }
        // item.value[1] = val
      }
      val && !this.beginVal && this.$refs.beginVal.focus()
      // 时分秒减法不易计算，暂不实现
      // if(val && new Date(val) - new Date(this.beginVal) < 0){
      //   this.beginVal =
      // }
      // console.log(val)
    },
  },
  watch: {
    item: {
      handler(newVal, oldVal) {
        // console.log(newVal)
        if (newVal.value) {
          this.beginVal = newVal.value[0] || ''
          this.endVal = newVal.value[1] || ''
        } else {
          this.beginVal = this.endVal = ''
        }
      },
      deep: true,
      immediate: true,
    },
    // beginVal: {
    //   handler(newVal, oldVal) {
    //     console.log(JSON.stringify(newVal))
    //     console.log(JSON.stringify(this.options))
    //   },
    //   deep: true,
    //   immediate: true,
    // },
    // endVal: {
    //   handler(newVal, oldVal) {
    //     console.log(JSON.stringify(newVal))
    //     console.log(JSON.stringify(this.options))
    //   },
    //   deep: true,
    //   immediate: true,
    // },
  },
}
</script>
<style lang="scss" scoped>
.ls_daterange ::v-deep {
  display: flex;

  & > span {
    line-height: 20px;
    display: inline-block;
    margin-left: 2px;
    margin-right: 2px;
  }
  & > div {
    border: 1px solid #dcdfe6 !important;
    top: 1px;
    line-height: 18px;
    height: 20px;
    .el-input__inner {
      padding-left: 2px !important;
      padding-right: 10px !important;
      background: transparent;
      border-radius: 0;
    }
  }
  .date__left {
    border-left: none;
  }
  .date__right {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }
  .el-input__prefix {
    left: auto !important;
    right: 0 !important;
    display: none !important;
  }
}
</style>

