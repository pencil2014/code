<template>
  <div class="filter-flex">
    <div class="filter-search">
      <div class="item">
        <el-select v-model="item.key" size="mini" :placeholder="$t('Common.plSelect')">
          <el-option
            v-for="(filter, key) in filterGroups"
            :key="key"
            :label="filter.label"
            :value="key"
          ></el-option>
        </el-select>
      </div>
      <div class="flex1">
        <div class v-if="filterGroups[item.key]">
          <!-- input, textarea -->
          <el-input
            size="mini"
            v-if="['input', 'textarea'].includes(filterGroups[item.key].type)"
            v-model="item.value"
            :type="filterGroups[item.key].type"
            :style="filterGroups[item.key].style || defaultStyle"
            :maxlength="filterGroups[item.key].maxlength"
            :minlength="filterGroups[item.key].minlength"
            :placeholder="filterGroups[item.key].placeholder || $t('Common.plEnter') + filterGroups[item.key].label"
            :clearable="filterGroups[item.key].clearable || true"
            :disabled="filterGroups[item.key].disabled"
            :rows="filterGroups[item.key].rows"
            :autosize="filterGroups[item.key].autosize"
            :name="filterGroups[item.key].name"
            :readonly="filterGroups[item.key].readonly"
            :max="filterGroups[item.key].max"
            :min="filterGroups[item.key].min"
          />

          <!-- 远程搜索 -->
          <el-select
            size="mini"
            v-if="filterGroups[item.key].type === 'remoteSelect'"
            v-model="item.value"
            filterable
            remote
            clearable
            :disabled="filterGroups[item.key].disabled"
            :style="filterGroups[item.key].style || defaultStyle"
            :popper-class="filterGroups[item.key]['popper-class']"
            :placeholder="filterGroups[item.key].placeholder  || $t('Common.plSelect') + filterGroups[item.key].label"
            :remote-method="(val) => {filterGroups[item.key].filterMehod && filterGroups[item.key].filterMehod(val, filterGroups[item.key])}"
            @visible-change="(val) => {filterGroups[item.key].visibleChange && filterGroups[item.key].visibleChange(val, filterGroups[item.key])}"
            @change="(value) => {filterGroups[item.key].change && filterGroups[item.key].change(value, filterGroups[item.key])}"
          >
            <el-option
              v-for="item in filterGroups[item.key].data"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <!-- autocomplete -->
          <el-autocomplete
            size="mini"
            v-if="filterGroups[item.key].type === 'autocomplete'"
            class="inline-input"
            v-model="item.value"
            :type="filterGroups[item.key].type"
            :style="filterGroups[item.key].style || defaultStyle"
            :disabled="filterGroups[item.key].disabled"
            :fetch-suggestions="(queryString, cb) => {filterGroups[item.key].querySearch && filterGroups[item.key].querySearch(queryString, cb)}"
            :placeholder="filterGroups[item.key].placeholder || $t('Common.plEnter') + filterGroups[item.key].label"
            @change="(value) => {filterGroups[item.key].change && filterGroups[item.key].change(value)}"
            @select="(value) => {filterGroups[item.key].select && filterGroups[item.key].select(value, item)}"
          ></el-autocomplete>
          <!-- select -->
          <el-select
            size="mini"
            v-if="filterGroups[item.key].type === 'select'"
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
            :placeholder="filterGroups[item.key].placeholder  || $t('Common.plSelect') + filterGroups[item.key].label"
            @visible-change="(val) => {filterGroups[item.key].visibleChange && filterGroups[item.key].visibleChange(val)}"
            @change="(value) => {filterGroups[item.key].change && filterGroups[item.key].change(value, item)}"
          >
            <el-option
              v-for="(o, key) in dictMap[filterGroups[item.key].key] || filterGroups[item.key].data"
              :key="key"
              :label="filterGroups[item.key].nonDictionary ? o.label : $t(`dict.${item.key}.${o.value}`)"
              :value="o.value"
            ></el-option>
          </el-select>
          <!-- 日期和时间{year/month/date/dates/ week/datetime/datetimerange/daterange} -->
          <el-date-picker
            size="mini"
            v-if="filterGroups[item.key].type === 'date'"
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
            :placeholder="filterGroups[item.key].placeholder || $t('Common.plSelect') + filterGroups[item.key].label"
            :format="filterGroups[item.key].format"
            :align="filterGroups[item.key].align"
            :popper-class="filterGroups[item.key]['popper-class']"
            :default-value="filterGroups[item.key]['default-value']"
            :default-time="filterGroups[item.key]['default-time']"
            :value-format="filterGroups[item.key].format"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'searchFilter',
  data() {
    return {
      defaultStyle: {
        width: '100%',
      },
    }
  },
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
    // 查询接口传参
    filterGroups: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  methods: {},
}
</script>