<template>
  <div class="input-container multi-select-tag" :style="item.inputBox || {}" v-show="item.defaultDisplay === false ? false : true">
    <span class="filter-txt" :style="item.labelStyle || {}">
      {{item.label}}：
    </span>

    <!-- 远程搜索 -->
    <el-select size="mini"  v-if="item.type === 'remoteSelect'"
      v-model="item.value"
      ref="remoteSelect"
      filterable
      remote
      clearable
      :disabled="item.disabled"
      :multiple="item.multiple"
      :allow-create="item['allow-create']"
      :collapse-tags="item['collapse-tags']"
      :style="item.style || defaultStyle"
      :popper-class="item['popper-class']"
      :placeholder="item.placeholder  || '请选择' + item.label"
      :remote-method="(val) => {item.filterMehod && item.filterMehod(val, item)}"
      @visible-change="(val) => {
        if (!val) this.$refs.remoteSelect.blur()
        item.visibleChange && item.visibleChange(val, item)
      }"
      @change="(value) => {item.change && item.change(value, item)}">
      <el-option
        v-for="item in item.data"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>

    <!-- 输入框 -->
    <el-autocomplete size="mini" v-if="item.type === 'autocomplete'"
      class="inline-input"
      v-model="item.value"
      :type="item.type"
      :style="computedStyle()"
      :fetch-suggestions="(queryString, cb) => {item.querySearch && item.querySearch(queryString, cb)}"
      :placeholder="item.placeholder || '请输入' + item.label"
      @change="(value) => {item.change && item.change(value)}"
      @select="(value) => {item.select && item.select(value, item)}"
      ></el-autocomplete>

    <!-- 输入框 -->
    <el-input size="mini" v-if="['input', 'textarea'].includes(item.type)"
      v-model="item.value"
      :type="item.type"
      :style="computedStyle()"
      :maxlength="item.maxlength"
      :minlength="item.minlength"
      :placeholder="item.placeholder || '请输入' + item.label"
      :clearable="item.clearable || true"
      :disabled="item.disabled"
      :rows="item.rows"
      :autosize="item.autosize"
      :name="item.name"
      :readonly="item.readonly"
      :max="item.max"
      :min="item.min"
      @keyup.enter.native="handleSearch" />

    <!-- 日期和时间{year/month/date/dates/ week/datetime/datetimerange/daterange} -->
    <el-date-picker size="mini" v-if="item.type === 'date'"
      v-model="item.value"
      :style="computedStyle()"
      :type="item.category"
      :name="item.name"
      :readonly="item.readonly"
      :disabled="item.disabled"
      :editable="item.editable"
      :clearable="item.clearable"
      :range-separator="item['range-separator']"
      :start-placeholder="item['start-placeholder'] || '开始时间'"
      :end-placeholder="item['end-placeholder'] || '结束时间'"
      :placeholder="item.placeholder || '请选择' + item.label"
      :format="item.format"
      :align="item.align"
      :popper-class="item['popper-class']"
      :default-value="item['default-value']"
      :default-time="item['default-time']"
      :value-format="item.format"/>

    <!-- 下拉选择框 -->
    <el-select size="mini" v-if="item.type === 'select'"
      ref="select"
      v-model="item.value"
      :style="computedStyle()"
      :multiple="item.multiple"
      :disabled="item.disabled"
      :clearable="item.clearable || true"
      :collapse-tags="item['collapse-tags']"
      :multiple-limit="item['multiple-limit']"
      :name="item.name"
      :filterable="item.filterable"
      :allow-create="item['allow-create']"
      :filter-method="item['filter-method']"
      :popper-class="item['popper-class']"
      :placeholder="item.placeholder  || '请选择' + item.label"
      :picker-options="item.pickerOptions"
      @visible-change="(val) => {if (!val) this.$refs.select.blur()}"
      @change="(value) => {item.change && item.change(value)}">
        <el-option v-for="(o, key) in selectOptions(item)"
          :key="key"
          :label="item.nonDictionary ? o.label : $t(`dict.${item.value}.${o.value}`)"
          :value="o.value">
        </el-option>
    </el-select>

    <!-- 多选框 -->
    <el-checkbox-group size="mini" v-if="item.type === 'checkbox'"
      :min="item.min"
      :max="item.max"
      :disabled="item.disabled"
      v-model="item.value"
      @change="(value) => {item.change && item.change(value)}">
      <el-checkbox v-for="(cItem, key) in item.data"
        :key="key"
        :name="cItem.value"
        :disabled="cItem.disabled"
        :label="cItem.label">
      </el-checkbox>
    </el-checkbox-group>

    <!-- 单选框 -->
    <el-radio-group size="mini" v-if="item.type === 'radio'"
      :disabled="item.disabled"
      v-model="item.value"
      @change="(value) => {item.change && item.change(value)}">
      <el-radio v-for="(cItem, key) in item.data"
        :key="key"
        :name="cItem.value"
        :disabled="cItem.disabled"
        :label="cItem.value">{{cItem.label}}</el-radio>
    </el-radio-group>

    <!-- 多级 -->
    <el-cascader size="mini"  v-if="item.type === 'cascader'"
      :style="computedStyle()"
      :props="item.itemDataProps"
      v-model="item.value"
      :placeholder="item.placeholder || '请选择' + item.label"
      :options="item.data"
      :separator="item.separator"
      :disabled="item.disabled"
      :clearable="item.clearable"
      :expand-trigger="item['expand-trigger']"
      :filterable="item.filterable"
      :debounce="item.debounce"
      :change-on-select="item['change-on-select']"
      @visible-change="(value) => item.visibleChange && item.visibleChange(value, item)"
      @change="(value) => {item.change && item.change(value, item)}">
    </el-cascader>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'searchFilter',
  data() {
    return {
      defaultStyle: {
        width: '240px'
      }
    }
  },
  props: {
    // 上述涉及的组件属性参数用法跟element-ui一致
    item: {
      type: Object,
      default: () => ({})
    },

    // 查询接口传参
    tableQuery: {
      type: Object,
      default: () => ({})
    },

    callback: {
      type: Function,
      default: () => ({})
    }
  },
  mounted() {
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    })
  },
  methods: {
    // el-select下拉数据
		selectOptions(item) {
      console.log(item)
			// 前端设置的数据
			if (item.data && item.data.length) {
				return item.data
			}
			// 搜索条件的key和字典对应的key不相同
			if (item.propInDict) {
				return this.dictMap[item.propInDict]
			}
			// 默认按搜索条件的key做为字典的key
			return this.dictMap[item.key] || []
		},
    isEmpty(value) {
      return typeof value === "undefined" || value === ''
    },

    // 计算style属性
    computedStyle() {
      let item = this.item
      if (!item) return
      let {style = {}} = item
      let defaultStyle = this.defaultStyle
      for (let i in style) {
        if (this.isEmpty(style[i])) continue
        defaultStyle[i] = style[i]
      }
      return defaultStyle
    },

    callbackAction(action) {
      if (typeof this.callback !== 'function') return
      this.callback(action)
    },

    handleSearch() {
      this.callbackAction('Search')
    },

    // 自动补充的数据
    querySearchAsync(queryString, cb, item) {
      var results = [];
      results = queryString ? item.data.filter(this.createStateFilter(queryString)) : item.data;
      cb(results);
    },

    createStateFilter(queryString, state) {
      return (state) => {
        return (state.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
    },
  }
}

// {
//     field: 'status',
//     label: '产品状态',
//     placeholder: '请选择产品状态',
//     type: 'select',
//     labelStyle: {
//         width: "150px"
//     },
//     style: {
//         width: ''
//     },
//     url: '',
//     data: [
//         {label: '正常', value: '0'},
//         {label: '停用', value: '1'},
//     ],
//     change: () => {}
// }
</script>

<style></style>
