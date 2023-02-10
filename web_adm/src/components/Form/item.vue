<template>
  <div class="flex-item" :class="item.className">
    <div class="item-label">
      <span class="lab"><em v-if="item.required" class="red">*</em>{{item.label}}</span>
      <span class="error-tip"></span>
    </div>
    <div>
      <el-input size="mini" v-if="['input', 'textarea'].includes(item.type)"
        v-model="item.value"
        :type="item.type"
        :style="item.style || defaultStyle"
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
        :min="item.min" />

      <el-autocomplete size="mini"
        v-if="item.type === 'autocomplete'"
        class="inline-input"
        v-model="item.value"
        :type="item.type"
        :style="item.style || defaultStyle"
        :disabled="item.disabled"
        :fetch-suggestions="(queryString, cb) => {item.querySearch && item.querySearch(queryString, cb)}"
        :placeholder="item.placeholder || '请输入' + item.label"
        @change="(value) => {item.change && item.change(value)}"
        @select="(value) => {item.select && item.select(value)}"
        ></el-autocomplete>
      
      <el-select size="mini" v-if="item.type === 'select'"
        v-model="item.value"
        :style="item.style || defaultStyle"
        :multiple="item.multiple"
        :disabled="item.disabled"
        :clearable="item.clearable || true"
        :collapse-tags="item['collapse-tags']"
        :multiple-limit="item['multiple-limit']"
        :name="item.name"
        :filterable="item.filterable"
        :allow-create="item['allow-create']"
        :filter-method="(val) => {item.filterMehod && item.filterMehod(val)}"
        :popper-class="item['popper-class']"
        :placeholder="item.placeholder  || '请选择' + item.label"
        @visible-change="(val) => {item.visibleChange && item.visibleChange(val)}"
        @change="(value) => {item.change && item.change(value)}">
          <el-option v-for="(o, key) in dictMap[item.key] || item.data"
            :key="key"
            :label="item.nonDictionary ? o.label : $t(`dict.${item.key}.${o.value}`)"
            :value="o.value">
          </el-option>
      </el-select>
      <!-- 日期和时间{year/month/date/dates/ week/datetime/datetimerange/daterange} -->
      <el-date-picker size="mini" v-if="item.type === 'date'"
        v-model="item.value"
        :type="item.category"
        :name="item.name"
        :style="item.style || defaultStyle"
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
        :value-format="item.format" />

    </div>
  </div>
</template>

<script>

import {mapState} from 'vuex'

export default {
  name: 'formItem',
  data() {
    return {
      defaultStyle: {
        width: '100%'
      }
    }
  },
  props: {
    // 上述涉及的组件属性参数用法跟element-ui一致
    item: {
      type: Object,
      default: () => ({})
    },

    // 提交接口传参
    createItem: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
  },
  mounted() {
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    }),
  },
  methods: {
    
  }
}
</script>

<style></style>
