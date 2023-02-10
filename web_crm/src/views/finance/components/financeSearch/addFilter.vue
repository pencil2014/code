<template>
  <!-- 简化，只考虑下拉，不考虑左侧是label -->
  <div
    class="search-filter"
    :class="{dateWith:filterGroups[item.key] && filterGroups[item.key].type==='daterange',
    rangeWith:filterGroups[item.key] && filterGroups[item.key].type==='range',
    lsrangeWith:filterGroups[item.key] && ['lsDaterange','lsDatetimerange'].includes(filterGroups[item.key].type)}"
  >
    <!-- lsrangeWith:filterGroups[item.key] && filterGroups[item.key].type==='lsDaterange'}" -->
    <div class="el-row">
      <div class="el-col filter-left">
        <!-- 需要change事件来清空saveList，要区分item.key的watch监听 -->
        <el-select
          v-model="item.key"
          size="mini"
          :placeholder="item.placeholder || '请选择'"
          filterable
          @change="handleSelectQuery"
        >
          <el-option
            v-for="(child, key) in filterGroups"
            :key="key"
            :label="child.label"
            :value="key"
            :disabled="child.disabledInAdd"
          ></el-option>
        </el-select>
      </div>
      <div
        class="el-col filter-right"
        v-if="rightShow"
        :class="{scope__select:filterGroups[item.key] && filterGroups[item.key].scope}"
      >
        <el-select
          v-if="filterGroups[item.key] && filterGroups[item.key].scope"
          v-model="item.scope"
        >
          <el-option
            v-for="item in scopeCfg"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
        <el-popover
          popper-class="el-popover__search"
          class="multi-select-tag"
          v-if="filterGroups[item.key] && filterGroups[item.key].type === 'lsDatetimerange'"
          placement="bottom"
          trigger="hover"
          :content="item.value ? (item.value[0]||'')+' ~ '+(item.value[1]||'') : ''"
          :disabled="!(item.value&&item.value.length)"
        >
          <DateRange slot="reference" :options="filterGroups[item.key]" :item="item" />
          <!-- <el-date-picker
            slot="reference"
            style="width:200px"
            size="mini"
            v-model="item.value"
            :type="filterGroups[item.key].type"
            :name="filterGroups[item.key].name"
            :readonly="filterGroups[item.key].readonly"
            :disabled="filterGroups[item.key].disabled"
            :editable="filterGroups[item.key].editable"
            :clearable="filterGroups[item.key].clearable || true"
            :range-separator="filterGroups[item.key]['range-separator']"
            :start-placeholder="filterGroups[item.key]['start-placeholder'] || '开始时间'"
            :end-placeholder="filterGroups[item.key]['end-placeholder'] || '结束时间'"
            :placeholder="filterGroups[item.key].placeholder || '请选择' + filterGroups[item.key].label"
            :format="filterGroups[item.key].format || 'yyyy-MM-dd'"
            :align="filterGroups[item.key].align"
            :popper-class="filterGroups[item.key]['popper-class']"
            :default-value="filterGroups[item.key]['default-value']"
            :default-time="filterGroups[item.key]['default-time'] || (filterGroups[item.key].type !== 'date' && ['00:00:00', '23:59:59'])"
            :value-format="filterGroups[item.key].format"
            :picker-options="filterGroups[item.key].pickerOptions"
          />-->
        </el-popover>

        <div class="multi-select-tag" v-else-if="filterGroups[item.key]">
          <!-- <div class="multi-select-tag"> -->
          <!-- <template class="multi-select-tag" v-if="filterGroups[item.key]"> -->
          <el-input
            size="mini"
            v-if="['input','textarea'].includes(filterGroups[item.key].type)"
            v-model="item.value"
            :type="filterGroups[item.key].type"
            :maxlength="filterGroups[item.key].maxlength"
            :minlength="filterGroups[item.key].minlength"
            :placeholder="filterGroups[item.key].placeholder || '请输入' + filterGroups[item.key].label"
            :clearable="filterGroups[item.key].clearable || true"
            :disabled="filterGroups[item.key].disabled"
            :rows="filterGroups[item.key].rows"
            :autosize="filterGroups[item.key].autosize"
            :name="filterGroups[item.key].name"
            :readonly="filterGroups[item.key].readonly"
            :max="filterGroups[item.key].max"
            :min="filterGroups[item.key].min"
          />

          <el-autocomplete
            size="mini"
            v-else-if="filterGroups[item.key].type === 'autocomplete'"
            class="inline-input"
            v-model="item.value"
            :clearable="true"
            :type="filterGroups[item.key].type"
            :disabled="item.disabled"
            :fetch-suggestions="(queryString, cb) => {filterGroups[item.key].querySearch && filterGroups[item.key].querySearch(queryString, cb)}"
            :placeholder="filterGroups[item.key].placeholder || '请输入' + filterGroups[item.key].label"
            @change="(value) => {filterGroups[item.key].change && filterGroups[item.key].change(value, item)}"
            @select="(value) => {filterGroups[item.key].select && filterGroups[item.key].select(value, item)}"
            @clear="item.req = '';item.valueReq = '';item.columnReq = ''"
          ></el-autocomplete>

          <!-- 远程搜索 -->
          <!-- :clearable="!filterGroups[item.key].multiple && (filterGroups[item.key].clearable || true)" -->
          <el-select
            size="mini"
            v-else-if="filterGroups[item.key].type === 'remoteSelect'"
            ref="remoteSelect"
            v-model="item.value"
            filterable
            remote
            :noRemote="true"
            :clearable="true"
            :disabled="filterGroups[item.key].disabled"
            :multiple="filterGroups[item.key].__multiple"
            :collapse-tags="filterGroups[item.key]['collapse-tags'] || true"
            :popper-class="filterGroups[item.key]['popper-class']"
            :placeholder="filterGroups[item.key].placeholder  || '请选择' + filterGroups[item.key].label"
            :reserve-keyword="true"
            :remote-method="remoteSelectMethod"
            @visible-change="remoteSelectVisible"
            @change="remoteSelectChange"
            @clear="remoteSelectClear(item)"
          >
            <!-- :clearable="!filterGroups[item.key].multiple && (filterGroups[item.key].clearable || true)" -->
            <!-- v-for="o in sortByValue(filterGroups[item.key].remoteSelectList,item.value)" -->
            <el-option
              v-for="(o,index) in filterGroups[item.key].remoteSelectList"
              :key="filterGroups[item.key].DIY ? index+'_'+o[filterGroups[item.key].DIY.key]+o.label : index+'_'+o.key+o.value+o.label"
              :label="o.label"
              :value="o.value"
            ></el-option>
          </el-select>

          <!-- :clearable="!filterGroups[item.key].multiple && (filterGroups[item.key].clearable || true)" -->

          <el-select
            size="mini"
            v-else-if="filterGroups[item.key].type === 'select'"
            ref="select"
            v-model="item.value"
            :multiple="filterGroups[item.key].__multiple"
            :disabled="filterGroups[item.key].disabled"
            :clearable="true"
            :collapse-tags="filterGroups[item.key]['collapse-tags'] || true"
            :multiple-limit="filterGroups[item.key]['multiple-limit']"
            :name="filterGroups[item.key].name"
            :filterable="filterGroups[item.key].filterable"
            :allow-create="filterGroups[item.key]['allow-create']"
            :popper-class="filterGroups[item.key]['popper-class']"
            :placeholder="filterGroups[item.key].placeholder  || '请选择' + filterGroups[item.key].label"
            @visible-change="(val) => {
              if(!val){
                $refs.select.blur()
              }else{
                filterGroups[item.key].visibleChange && filterGroups[item.key].visibleChange(val,filterGroups[item.key])
              }
            }"
            @change="(value) => {filterGroups[item.key].change && filterGroups[item.key].change(value)}"
            @clear="item.value='';filterGroups[item.key].clearFn&&filterGroups[item.key].clearFn()"
          >
            <!-- 未进行远程请求的，不需自定义过滤方法 -->
            <!-- :filter-method="(val) => {filterGroups[item.key].filterMehod && filterGroups[item.key].filterMehod(val)}" -->
            <!-- :clearable="!filterGroups[item.key].multiple && (filterGroups[item.key].clearable || true)" -->
            <!--谨慎定义 selectOptions, 因为优先级selectOptions>propInDict>prop -->
            <el-option
              size="mini"
              v-for="(o, key) in filterGroups[item.key].selectOptions||dictMap[filterGroups[item.key].propInDict]||dictMap[filterGroups[item.key].prop]"
              :key="key"
              :label="o.label"
              :value="item.reqLabel ? o.label : o.value"
              :disabled="o.disabled"
            ></el-option>
          </el-select>
          <!-- 日期范围值 -->
          <!-- v-else-if="filterGroups[item.key].type === 'lsDaterange'" -->
          <DateRange
            v-else-if="['lsDaterange','lsDatetimerange'].includes(filterGroups[item.key].type)"
            :options="filterGroups[item.key]"
            :item="item"
          />
          <!-- 只考虑常见date， daterange -->
          <!-- 加宽度200px 修改两个时间框连在一起的问题 -->
          <el-date-picker
            style="width:200px"
            size="mini"
            v-else-if="['date', 'month','daterange', 'monthrange', 'datetimerange', 'year'].includes(filterGroups[item.key].type)"
            v-model="item.value"
            :type="filterGroups[item.key].type"
            :name="filterGroups[item.key].name"
            :readonly="filterGroups[item.key].readonly"
            :disabled="filterGroups[item.key].disabled"
            :editable="filterGroups[item.key].editable"
            :clearable="filterGroups[item.key].clearable || true"
            :range-separator="filterGroups[item.key]['range-separator']"
            :start-placeholder="filterGroups[item.key]['start-placeholder'] || '开始时间'"
            :end-placeholder="filterGroups[item.key]['end-placeholder'] || '结束时间'"
            :placeholder="filterGroups[item.key].placeholder || '请选择' + filterGroups[item.key].label"
            :format="filterGroups[item.key].format || 'yyyy-MM-dd'"
            :align="filterGroups[item.key].align"
            :popper-class="filterGroups[item.key]['popper-class']"
            :default-value="filterGroups[item.key]['default-value']"
            :default-time="filterGroups[item.key]['default-time'] || (filterGroups[item.key].type !== 'date' && ['00:00:00', '23:59:59'])"
            :value-format="filterGroups[item.key].format"
            :picker-options="filterGroups[item.key].pickerOptions"
          />

          <!-- change-on-select
          expandTrigger="click"-->
          <el-cascader
            v-else-if="filterGroups[item.key].type === 'cascader'"
            :clearable="true"
            size="mini"
            :filterable="filterGroups[item.key].filterable!==false"
            :options="filterGroups[item.key].cascaderList"
            v-model="item.value"
            collapse-tags
            @change="(value) => {filterGroups[item.key].change && filterGroups[item.key].change(value)}"
            :props="filterGroups[item.key].cascaderProps"
            :placeholder="filterGroups[item.key].placeholder || '请选择' + filterGroups[item.key].label"
          ></el-cascader>

          <ls-cascader
            v-else-if="filterGroups[item.key].type === 'diyCascader'"
            size="mini"
            :treeData="filterGroups[item.key].cascaderList"
            :value.sync="item.value"
            @change="(value) => {filterGroups[item.key].change && filterGroups[item.key].change(value)}"
            :placeholder="filterGroups[item.key].placeholder || '请选择' + filterGroups[item.key].label"
          ></ls-cascader>

          <!-- 范围值 -->
          <div
            v-else-if="filterGroups[item.key].type === 'range'"
            @mouseenter="rangeEnter(item)"
            @mouseleave="rangeLeave(item)"
          >
            <el-input
              ref="range1"
              size="mini"
              v-lsNumber="{value:filterGroups[item.key].inputType||'number', obj:item.range, key:'min'}"
              style="width:80px"
              v-model="item.range.min"
              placeholder="最小"
              @change="minChange(item.range)"
            ></el-input>
            <!-- clearable -->
            <span style="padding: 0;display: inline-block;">-</span>
            <el-input
              ref="range2"
              size="mini"
              v-lsNumber="{value:filterGroups[item.key].inputType||'number', obj:item.range, key:'max'}"
              style="width:80px"
              v-model="item.range.max"
              placeholder="最大"
              @change="maxChange(item.range)"
            ></el-input>
            <i
              v-if="item.showClose"
              class="el-icon el-icon-circle-close"
              style="font-size: 14px;color: #C0C4CC;width: 12px;line: height 20px;cursor:pointer;"
              @click="clearRange(item)"
            ></i>
            <!-- clearable -->
            <!-- :placeholder="`最大${filterGroups[item.key].label}`" -->
          </div>
          <!-- </template> -->
        </div>
      </div>
    </div>
    <!-- 所有搜索项均可删除 -->
    <!-- v-if="+index >= +defaultSearchLength" -->
    <!-- 至少保留一个搜索条件 -->
    <i
      v-if="searchInputGroup.length>1"
      class="el-icon-close filter-close"
      @click="handleDeleteFilter(index)"
    ></i>
  </div>
</template>

<script>
import lsCascader from './lsCascader'
import DateRange from './dateRange'
export default {
  name: 'searchAddFilter',
  components: {
    lsCascader,
    DateRange,
  },
  data() {
    return {
      dictMap: this.$store.getters.dictMap,
      rightShow: false, // 默认无右侧内容，每次切换左侧值时先销毁右侧，待赋值后再激活右侧，用于解决多选切换单选时elementui语法报错
      scopeCfg: [
        { label: '包含', value: '0' },
        { label: '不包含', value: '1' },
      ],
    }
  },
  props: {
    // 上述涉及的组件属性参数用法跟element-ui一致
    searchInputGroup: {
      type: Array,
      default: () => [],
    },
    item: {
      type: Object,
      default: () => ({}),
    },
    filterGroups: {
      type: Object,
      default: () => ({}),
    },
    index: {
      type: Number,
      default: 0,
    },
    defaultSearchLength: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    showTypeFilterGroups() {
      let type = this.item.showType
      let obj = this.filterGroups
      let target = {}
      for (const key in obj) {
        const element = obj[key]
        if (element.showType === type) {
          target[key] = element
        }
      }
      return target
    },
  },
  mounted() {
    // 新增的选项，key为''，this.filterGroups[item.key]为undefined
    if (!this.item.key) return
    this.searchInputGroup.forEach((item, sIndex) => {
      // 下拉框，单选转为多选时，视图未能更新。可先更改值,且默认多选false，延迟设置是否为多选
      if (!item.key) return
      if (!this.filterGroups[item.key]) return
      this.$set(this.filterGroups[item.key], '__multiple', this.filterGroups[item.key].multiple && true)
    })
  },
  methods: {
    // 20210729 恢复下拉事件，用来清空saveList，利用保存条件更改值时不应清除
    // 取消下拉触发事件，移至监听函数，处理使用保存条件时无法触发下拉事件，但可以通过监听值的改变
    // 新增条件查询-选择下拉条件
    handleSelectQuery() {
      this.item.value = ''
      if (this.item.saveList) this.item.saveList = []
      // this.searchInputGroup.forEach((item, sIndex) => {
      //   if (index === sIndex) return
      //   if (val && val === item.key) {
      //     val = ''
      //   }
      // })
      // this.$set(this.searchInputGroup[index], 'key', val)
      // if (this.searchInputGroup[index].range) {
      //   this.searchInputGroup[index].range.min = this.searchInputGroup[index].range.max = ''
      // }
      // // 下拉框，单选转为多选时，视图未能更新。可先更改值,且默认多选false，延迟设置是否为多选
      // this.$set(this.filterGroups[item.key], '__multiple', false)
      // this.$nextTick(() => {
      //   this.$set(this.filterGroups[item.key], '__multiple', this.filterGroups[item.key].multiple && true)
      // })
    },
    // 删除搜索条件
    handleDeleteFilter(index) {
      this.searchInputGroup.splice(index, 1)
    },
    minChange(item) {
      let { min, max } = item
      if (min !== '' && max !== '' && min - max > 0) {
        this.$msgWarnClose('最小值不能大于最大值!')
        item.min = ''
      }
    },
    maxChange(item) {
      let { min, max } = item
      if (min !== '' && max !== '' && min - max > 0) {
        this.$msgWarnClose('最大值不能小于最小值!')
        item.max = ''
      }
    },
    rangeEnter(item) {
      let { min, max } = item.range
      item.showClose = !!(min || max)
      this.$forceUpdate()
    },
    clearRange(item) {
      item.range.min = item.range.max = ''
      item.showClose = false
      this.$forceUpdate()
    },
    rangeLeave(item) {
      item.showClose = false
      this.$forceUpdate()
    },
    /*************************************** 处理远程请求 -begin *******************************************/
    // 下拉内容排序,不用排序，利用所选值遍历赋值放在最前面
    // sortByValue(arr, val) {
    //   arr = arr || []
    //   console.log(arr)
    //   return arr
    //   // if()
    // },
    remoteSelectCommon() {
      let item = this.item
      let key = item.key
      let searchInputGroup = this.searchInputGroup
      let filterGroup = this.filterGroups[key]
      let { remoteMethod, change, visibleChange } = filterGroup
      return { item, key, searchInputGroup, filterGroup, remoteMethod, change, visibleChange }
    },
    // 请求接口事件
    remoteSelectMethod(val) {
      let { item, key, searchInputGroup, filterGroup, remoteMethod, change, visibleChange } = this.remoteSelectCommon()
      remoteMethod && remoteMethod(val, filterGroup)
    },
    // change事件
    remoteSelectChange(val) {
      let { item, key, searchInputGroup, filterGroup, remoteMethod, change, visibleChange } = this.remoteSelectCommon()
      let remoteSelectList = filterGroup.remoteSelectList.map(({ value, label }) => ({ value, label }))
      let vArr = [...(item.saveList || []), ...(remoteSelectList || [])]
      // debugger
      // console.log(val);
      // console.log(JSON.stringify(vArr.map(v=>v.value)));
      if (typeof val === 'string' || typeof val === 'number') {
        let obj = vArr.find((o) => o.value == val)
        item.saveList = obj ? [obj] : []
        // console.log(item);
      } else if (val instanceof Array) {
        if (val.length) {
          item.saveList = val.map((v) => vArr.find((o) => o.value == v))
        } else {
          item.saveList = []
        }
      }
      //
      // console.log('change事件···················');
      // console.log(item.saveList);
      change && change(val, filterGroup, searchInputGroup)
    },
    // 下拉visible事件
    remoteSelectVisible(val) {
      if (!val) {
        this.$refs.remoteSelect.blur()
      } else {
        let { item, key, searchInputGroup, filterGroup, remoteMethod, change, visibleChange } = this.remoteSelectCommon()
        // console.log(key, filterGroup)
        visibleChange && val && visibleChange('', filterGroup, item)
      }
    },
    // 单独清空事件
    remoteSelectClear(item) {
      item.value = ''
      item.saveList = []
    },
    /*************************************** 处理远程请求 -end *******************************************/
  },
  watch: {
    'item.key': {
      handler(val, old) {
        this.rightShow = false
        // 首次渲染old为undefined， 手动切换val必有值，old， 新增val空old为undefined
        // 删除某一项后，从删除的位置到后面需要重新赋值，val和old的值根据旧数据和新数据决定
        // console.log(val || val===undefined || '空前', old || old===undefined || '空后')
        let index = this.index
        let item = this.item
        // 放在手动选择触发，防止删除某一项会触发删除项后面的重新赋值，会误清除后面项的值时
        // item.value = ''
        // 之前是未利用选择禁用状态，需要遍历找到是否已有选择的值，现在利用禁用状态，不需此操作
        // this.searchInputGroup.forEach((item, sIndex) => {
        //   if (index === sIndex) return
        //   if (val && val === item.key) {
        //     val = ''
        //   }
        // })
        // 下拉框，先延迟设置是否为多选，决定值为是否可以为数组，再赋值
        this.$nextTick(() => {
          if (val && this.filterGroups[item.key]) {
            this.$set(this.filterGroups[item.key], '__multiple', this.filterGroups[item.key].multiple && true)
          }
          this.$nextTick(() => {
            this.$set(this.searchInputGroup[index], 'key', val)
            this.$set(this.searchInputGroup[index], 'scope', this.searchInputGroup[index]['scope'] || '0')
            // 判断新值和旧值是否相等，相等则不需重新设置min,max, 如果
            if (this.searchInputGroup[index].range && val !== old) {
              this.searchInputGroup[index].range.min = this.searchInputGroup[index].range.max = ''
            }
            // 赋值后再显示右侧内容
            this.$nextTick(() => (this.rightShow = true))
          })
        })
      },
      deep: true,
      immediate: true,
    },
    searchInputGroup: {
      handler(newVal, oldVal) {
        let filterGroups = this.filterGroups
        let searchInputGroup = this.searchInputGroup
        for (let key in filterGroups) {
          let value = filterGroups[key]
          if (
            searchInputGroup.some((subItem) => {
              return subItem.key === key
            })
          ) {
            this.$set(value, 'disabledInAdd', true)
          } else {
            this.$set(value, 'disabledInAdd', false)
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
}
</script>
<style lang="scss" scoped>
.search-filter {
  position: relative;
  display: inline-flex;
  width: 287px;
  margin: 0 12px 8px 0 !important;
  vertical-align: top;
  ::v-deep {
    // 强制下拉图标和删除图标上下居中
    .el-input__suffix .el-input__suffix-inner > i {
      line-height: 20px !important;
    }
    .el-select__tags {
      width: 90% !important;
    }
  }
  & > i {
    flex: 0 0 10px;
  }
  &.lsrangeWith .el-row {
    border: none;
    overflow: none;
    .el-col ::v-deep input {
      height: 18px !important;
    }
    .filter-left {
      border-right: none;
      & > div {
        border: 1px solid #dcdfe6;
        border-right: none;
        height: 20px;
        top: 1px;
        overflow: hidden;
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
      }
    }
  }
}
.el-row {
  width: 287px;
  display: inline-flex;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  height: 20px;
  overflow: hidden;
  & > div {
    margin-top: -1px;
  }
  .filter-left {
    border-right: 1px solid #dcdfe6;
    width: 106px;
    flex: 0 0 auto;
  }
  .filter-right {
    flex: 1 1 auto;
    &.scope__select {
      display: flex;
      & > div.el-select {
        width: 60px;
        border-right: 1px solid #dcdfe6;
        ::v-deep .el-input__inner {
          padding-right: 10px !important;
        }
      }
    }
  }
}
::v-deep {
  .el-input__inner {
    border: none;
  }
}
.search-filter .filter-left ::v-deep {
  .el-input__inner {
    padding-right: 16px;
    padding-left: 4px;
  }
  .el-input.el-input--mini.el-input--suffix .el-input__suffix {
    right: 3px;
  }
}
.el-icon-close.filter-close {
  cursor: pointer;
  position: absolute;
  top: 4px;
  right: -14px;
  width: 14px;
  height: 14px;
  line-height: 14px;
  padding: 0;
  border-radius: 50%;
  transition: transform 0.3s;
}
.el-icon-close.filter-close:hover {
  background: #eeeeee;
  transform: rotate(90deg);
}
// 改了之后样式看着更差，改动的部分统一移到此处，体验不好再注释
.search-filter {
  width: 334px;
  margin: 0 12px 4px 0 !important;
  // outline: 1px solid red;
}
.el-row {
  width: 334px;
  .filter-left {
    width: 118px;
  }
}
</style>

