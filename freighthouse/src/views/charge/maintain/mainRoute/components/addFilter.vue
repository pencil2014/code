<template>
  <div class="filter-flex">
    <div class="filter-search">
      <div class="item width110">
        <el-select v-model="item.key" size="mini" filterable placeholder="请选择" @change="(val) => {handleSelectQuery(val, index, item)}">
          <el-option v-for="(child, key) in filterGroups" :key="key" :label="child.label" :value="key" :disabled="filterKeyDisabled(child)"></el-option>
        </el-select>
      </div>
      <div class="flex1">
        <div class="" v-if="filterGroups[item.key]">
          <el-input size="mini" v-if="['input', 'textarea'].includes(filterGroups[item.key].type)"
            v-model="item.value"
            :type="filterGroups[item.key].type"
            :style="filterGroups[item.key].style || defaultStyle"
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
            :min="filterGroups[item.key].min"/>

          <!-- 远程搜索 -->
          <el-select size="mini"  v-if="isShow && filterGroups[item.key].type === 'remoteSelect'"
            v-model="item.value"
            filterable
            remote
            ref="remoteSelect"
            class="remoteSelect"
						:reserve-keyword="!filterGroups[item.key].notReserveKeyword"
            :clearable="filterGroups[item.key].clearable || true"
            :disabled="filterGroups[item.key].disabled"
            :multiple="filterGroups[item.key].multiple"
            :allow-create="filterGroups[item.key]['allow-create']"
            :collapse-tags="filterGroups[item.key]['collapse-tags']"
            :style="filterGroups[item.key].style || defaultStyle"
            :popper-class="filterGroups[item.key]['popper-class']"
            :placeholder="filterGroups[item.key].placeholder  || '请选择' + filterGroups[item.key].label"
            :remote-method="(val) => {filterGroups[item.key].filterMehod && filterGroups[item.key].filterMehod(val, filterGroups[item.key])}"
            @visible-change="(val) => {
              if (!val) {
                this.$refs.remoteSelect.blur()
              }
              filterGroups[item.key].visibleChange && filterGroups[item.key].visibleChange(val, filterGroups[item.key])
            }"
            @change="remoteSelectChange">
            <el-option
              v-for="item in filterGroups[item.key].data"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>

          <el-autocomplete size="mini"
            v-if="filterGroups[item.key].type === 'autocomplete'"
            class="inline-input"
            v-model="item.value"
            :type="filterGroups[item.key].type"
            :style="filterGroups[item.key].style || defaultStyle"
            :disabled="filterGroups[item.key].disabled"
            :fetch-suggestions="(queryString, cb) => {filterGroups[item.key].querySearch && filterGroups[item.key].querySearch(queryString, cb)}"
            :placeholder="filterGroups[item.key].placeholder || '请输入' + filterGroups[item.key].label"
            @change="(value) => {filterGroups[item.key].change && filterGroups[item.key].change(value)}"
            @select="(value) => {filterGroups[item.key].select && filterGroups[item.key].select(value, item)}"
            ></el-autocomplete>
    
          <el-select size="mini" v-if="filterGroups[item.key].type === 'select'"
            v-model="item.value"
            :style="filterGroups[item.key].style || defaultStyle"
            :multiple="filterGroups[item.key].multiple"
            :disabled="filterGroups[item.key].disabled"
            :clearable="filterGroups[item.key].clearable || true"
            :collapse-tags="filterGroups[item.key]['collapse-tags']"
            :multiple-limit="filterGroups[item.key]['multiple-limit']"
            :name="filterGroups[item.key].name"
            :filterable="filterGroups[item.key].filterable"
            :allow-create="filterGroups[item.key]['allow-create']"
            :filter-method="(val) => {filterGroups[item.key].filterMehod && filterGroups[item.key].filterMehod(val)}"
            :popper-class="filterGroups[item.key]['popper-class']"
            :placeholder="filterGroups[item.key].placeholder  || '请选择' + filterGroups[item.key].label"
            @visible-change="(val) => {filterGroups[item.key].visibleChange && filterGroups[item.key].visibleChange(val)}"
            @change="(value) => {filterGroups[item.key].change && filterGroups[item.key].change(value, item)}">
              <el-option v-for="(o, key) in dictMap[filterGroups[item.key].key] || filterGroups[item.key].data"
                :key="key"
                :label="o.label"
                :value="o.value">
              </el-option>
          </el-select>
          <!-- 日期和时间{year/month/date/dates/ week/datetime/datetimerange/daterange} -->
          <el-date-picker size="mini" v-if="filterGroups[item.key].type === 'date'"
            v-model="item.value"
            :type="filterGroups[item.key].category"
            :name="filterGroups[item.key].name"
            :style="filterGroups[item.key].style || defaultStyle"
            :readonly="filterGroups[item.key].readonly"
            :disabled="filterGroups[item.key].disabled"
            :editable="filterGroups[item.key].editable"
            :clearable="filterGroups[item.key].clearable"
            :range-separator="filterGroups[item.key]['range-separator']"
            :start-placeholder="filterGroups[item.key]['start-placeholder'] || '开始时间'"
            :end-placeholder="filterGroups[item.key]['end-placeholder'] || '结束时间'"
            :placeholder="filterGroups[item.key].placeholder || '请选择' + filterGroups[item.key].label"
            :format="filterGroups[item.key].format"
            :align="filterGroups[item.key].align"
            :popper-class="filterGroups[item.key]['popper-class']"
            :default-value="filterGroups[item.key]['default-value']"
            :default-time="filterGroups[item.key]['default-time']"
            :value-format="filterGroups[item.key].format"/>
        </div>
      </div>
    </div>
    <i class="el-icon-close filter-close" @click="handleDeleteFilter(index)"></i>
  </div>
  
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  name: 'searchAddFilter',
  data() {
    return {
      defaultStyle: {
        width: '100%'
      },
      isShow: true,
    }
  },
  props: {
    searchConfig: {
      type: Array,
      default: () => ([])
    },
    
    searchInputGroup: {
      type: Array,
      default: () => ([])
    },

    item: {
      type: Object,
      default: () => ({})
    },

    // 查询接口传参
    filterGroups: {
      type: Object,
      default: () => ({})
    },

    index: {
      type: Number,
      default: 0
    },
    callback: {
      type: Function,
      default: () => ({})
    }
  },
  mounted() {
  },
  computed: {
    ...mapGetters([
      'dictMap'
    ])
  },
  methods: {
    filterKeyDisabled(child) {
      let keyArr = this.searchInputGroup.map(item => item.key)
      return keyArr.includes(child.key)
    },
    // 新增条件查询-选择下拉条件
    handleSelectQuery(val, index, item) {
      this.isShow = false
			setTimeout(()=>{
				this.isShow = true
			},0)
      this.item.value = ''
    },

    // 删除搜索条件
    handleDeleteFilter(index) {
      this.searchInputGroup.splice(index, 1)
      console.log('删除一条:', this.searchInputGroup)
    },
    callbackAction(action) {
      if (typeof this.callback !== 'function') return
      this.callback(action)
    },

    handleSelectEnter() {
      this.callbackAction('Search')
    },

    handleSearch() {
      this.callbackAction('Search')
    },
    remoteSelectChange(val) {
      console.log('remoteSelectChange', this.item);
      let key = this.item.key
      let filterGroups = this.filterGroups[key]
      let findItem = []
      // 多选
      if (filterGroups.multiple) {
        findItem = filterGroups.data.filter(ele => val.includes(ele.value))
        if (filterGroups['allow-create']) {
          findItem = val.map(ele => {
            return {label: ele, value: ele}
          })
          this.$set(filterGroups, 'text', val)
        }
      } else {
        findItem = filterGroups.data.filter(ele => ele.value === val)
        if (filterGroups['allow-create']) {
          findItem = [{label: val, value: val}]
          this.$set(filterGroups, 'text', val)
        }
      }
      let saveList = findItem.map(({label, value}) => ({label, value}))
      this.$set(filterGroups, 'queryValue', val)
      this.$set(filterGroups, 'saveList', saveList)
      if (filterGroups.valueAsLabelArr) {
        let valueAsLabelArr = saveList.map(item => {
          return item.label
        })
        this.$set(filterGroups, 'valueAsLabelArr', valueAsLabelArr)
      }
    }
  }
}
</script>

<style></style>
