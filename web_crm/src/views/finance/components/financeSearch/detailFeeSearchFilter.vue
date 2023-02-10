<template>
  <div class="detail__search">
    <FinanceSearch :searchOption="searchOption" @search="search" @cancel="search(false)" />
  </div>
</template>

<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
export default {
  name: 'detailFeeSearch',
  data() {
    return { searchOption: { addFilter: { searchInputGroup: [], filterGroups: {} } } }
  },
  components: {
    FinanceSearch,
  },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    list: {
      handler(val) {
        let filterGroups = this.searchOption.addFilter.filterGroups
        for (const key in filterGroups) {
          if (Object.hasOwnProperty.call(filterGroups, key)) {
            let ele = filterGroups[key]
            if (ele.st === 2) {
              let list = [...new Set(val.map((v) => v[key]))].filter((v) => v).map((v) => ({ label: v, value: v }))
              ele.selectOptions.splice(0, 1000, ...list)
            }
          }
        }
      },
      immediate: true,
    },
  },
  created() {
    // st   1: input， 2: select根据list赋值selectOptions， 3: select 字典或固定selectOptions
    let searchInputGroup = this.columns
      .filter((v) => v.st)
      .map((v) => ({ key: v.prop, value: '', range: { min: '', max: '' } }))
      .slice(0, 5)
    let filterGroups = {}
    this.columns.forEach((item) => {
      if (item.st) {
        filterGroups[item.prop] = {
          st: item.st,
          label: item.label,
          prop: item.propInDict || item.prop,
          type:
            item.st === 1
              ? 'input'
              : item.st === 2
              ? 'select'
              : item.st === 3
              ? 'select'
              : item.st === 4
              ? 'daterange'
              : item.st === 5
              ? 'monthrange'
              : '',
          format: item.st === 4 ? 'yyyy-MM-dd' : item.st === 5 ? 'yyyy-MM' : '',
          selectOptions: item.selectOptions,
          filterable: true,
          multiple: item.sMulti,
        }
        if (item.st === 2) filterGroups[item.prop].selectOptions = []
      }
    })
    this.searchOption = { addFilter: { searchInputGroup, filterGroups } }
  },
  methods: {
    clearData() {
      this.searchOption.addFilter.searchInputGroup.forEach((item) => (item.value = ''))
    },
    search(val) {
      console.log(val)
      // 清空
      if (val === false) {
        this.list.forEach((item) => (item.invisible = false))
        this.$emit('search', this.list)
        return
      }

      let { searchInputGroup, filterGroups } = this.searchOption.addFilter
      let arr = searchInputGroup.filter((v) => v.value && v.value.length)
      if (!arr.length) {
        this.list.forEach((item) => (item.invisible = false))
      } else {
        this.list.forEach((item) => {
          item.invisible = false
          arr.forEach(({ key, value }) => {
            let type = filterGroups[key].type
            // if (type === 'input' && !new RegExp(value).test(item[key])) {
            if (type === 'input') {
              if (value && value.trim() && !((item[key] || '').toLowerCase().indexOf(value.toLowerCase()) > -1)) {
                item.invisible = true
              }
            } else if (type === 'select') {
              if (value instanceof Array) {
                if (value.length && !value.includes(item[key])) {
                  item.invisible = true
                }
              } else if (item[key] !== value) {
                item.invisible = true
              }
            } else if (type === 'daterange' || type === 'monthrange') {
              let [begin, end] = value
              if (
                item[key] &&
                (new Date(begin + ' 00:00:00') - new Date(item[key]) > 0 || new Date(end + ' 23:59:59') - new Date(item[key]) < 0)
              ) {
                item.invisible = true
              }
            }
          })
        })
      }
      // console.log(JSON.stringify(this.list.map((v) => v.invisible)))
      this.$emit('search', this.list)
    },
  },
}
</script>
<style lang="scss" scoped>
.detail__search ::v-deep {
  .finance-search-form {
    // padding-top: 0;
    margin-bottom: -8px;
  }
  // .el-form-item {
  //   width: 230px !important;
  // }
  // .el-form-item {
  //   margin-right: 8px !important;
  //   & > label {
  //     width: 66px !important;
  //   }
  // }
  // .range__div {
  //   white-space: nowrap;
  //   .el-input {
  //     width: calc(50% - 8px) !important;
  //   }
  // }
}
</style>