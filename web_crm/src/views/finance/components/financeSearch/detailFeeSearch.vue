<template>
  <div class="detail__search">
    <FinanceSearch :searchOption="defaultOption" @search="search" @cancel="search(false)" />
  </div>
</template>

<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { querySettleUnit } from '@/api/fin/settleUnit'
export default {
  name: 'detailFeeSearch',
  data() {
    return {
      settleCorpNameList: [],
      feeNameList: [],
      settleCompNameList: [],
    }
  },
  components: {
    FinanceSearch,
  },
  props: {
    // 一级下拉列表
    list: {
      type: Array,
      default: () => [],
    },
    keyObj: {
      type: Object,
      default: () => ({}),
    },
    defaultOption: {
      type: Object,
      default: () => {
        return {
          columns: [
            {
              label: '结算单位',
              prop: 'settleCorpName',
              type: 'select',
              filterable: true,
              selectOptions: [],
            },
            {
              label: '币种',
              prop: 'currency',
              type: 'select',
              propInDict: 'noOriginalCurrency',
            },
            {
              label: '费用名称',
              prop: 'feeName',
              type: 'select',
              filterable: true,
              selectOptions: [],
            },
            {
              label: '单号',
              prop: 'sourceBizNo',
              type: 'input',
            },
            {
              label: '开票状态',
              prop: 'invoiceStatus',
              type: 'select',
              propInDict: 'feeInvoiceStatus',
            },
            {
              label: '分公司',
              prop: 'settleCompName',
              type: 'select',
              filterable: true,
              selectOptions: [],
            },
            // {
            //   label: '可开票金额',
            //   prop: 'canInvoiceAmt',
            //   type: 'range',
            //   inputType: 'number',
            // },
          ],
          data: {
            settleCorpName: '',
            currency: '',
            sourceBizNo: '',
            invoiceStatus: '',
            settleCompName: '',
            feeName: '',
            // canInvoiceAmt: { min: '', max: '' },
          },
        }
      },
    },
    extendOptionShow: {
      type: Boolean,
      default: false,
    },
    extendOption: {
      type: Object,
      default: () => ({
        columns: [
          {
            label: '可开票金额',
            prop: 'canInvoiceAmt',
            type: 'range',
            inputType: 'number',
          },
        ],
        data: {
          canInvoiceAmt: { min: '', max: '' },
        },
      }),
    },
  },
  watch: {
    list: {
      handler(val) {
        let feeNameList = [...new Set(val.map((v) => v.feeName))].map((v) => ({ label: v, value: v }))
        let settleCorpNameList = [...new Set(val.map((v) => v.settleCorpName))].map((v) => ({ label: v, value: v }))
        let settleCompNameList = [...new Set(val.map((v) => v.settleCompName))].map((v) => ({ label: v, value: v }))
        this.settleCorpNameList.splice(0, 10000, ...settleCorpNameList)
        this.feeNameList.splice(0, 10000, ...feeNameList)
        this.settleCompNameList.splice(0, 10000, ...settleCompNameList)
      },
      immediate: true,
    },
  },
  created() {
    this.defaultOption.columns.forEach((item) => {
      if (item.prop === 'settleCorpName') {
        item.selectOptions = this.settleCorpNameList
      } else if (item.prop === 'feeName') {
        item.selectOptions = this.feeNameList
      } else if (item.prop === 'settleCompName') {
        item.selectOptions = this.settleCompNameList
      } else if (item.prop === 'canInvoiceAmt') {
        // if (this.extendOptionShow) {
        //   item.type = 'range'
        // }
      }
      return item
    })
    if (this.extendOptionShow && this.extendOption.columns.length) {
      this.defaultOption.columns.push(...this.extendOption.columns)
      let extendOptionData = this.extendOption.data
      for (const key in extendOptionData) {
        this.$set(this.defaultOption.data, key, extendOptionData[key])
      }
    }
  },
  methods: {
    clearData() {
      let object = this.defaultOption.data
      for (const key in object) {
        if (object[key].min !== undefined) {
          object[key].min = object[key].max = ''
        } else {
          object[key] = ''
        }
      }
    },
    search(val) {
      console.log(val)
      // 清空
      if (val === false) {
        this.list.forEach((item) => (item.invisible = false))
        this.$emit('search', this.list)
        return
      }
      // 搜索
      for (const key in val) {
        if (typeof val === 'object') {
        } else if (val[key].trim) {
          val[key] = val[key].trim()
        }
      }
      let { settleCorpName, currency, sourceBizNo, invoiceStatus, settleCompName, feeName, canInvoiceAmt } = val || {}
      let { min, max } = canInvoiceAmt || {}
      if (settleCorpName || currency || sourceBizNo || invoiceStatus || settleCompName || feeName || min || max) {
        console.log('/有值搜索')
        let keyObj = this.keyObj
        this.list.forEach((item) => {
          item.invisible = false
          // console.log(feeName, ',', item.feeName, ',', !new RegExp(feeName).test(item.feeName))
          // console.log(settleCorpName, ',', item.settleCorpName, ',', !new RegExp(settleCorpName).test(item.settleCorpName))
          // console.log(currency, ',', item.currency, ',', !new RegExp(currency).test(item.currency))
          // console.log(sourceBizNo, ',', item.sourceBizNo, ',', !new RegExp(sourceBizNo).test(item.sourceBizNo))
          // console.log(
          //   invoiceStatus,
          //   ',',
          //   item.invoiceStatus,
          //   ',',
          //   !new RegExp(invoiceStatus).test(item.invoiceStatus)
          // )
          // console.log(settleCompName, ',', item.settleCompName, ',', !new RegExp(settleCompName).test(item.settleCompName))
          for (const key in keyObj) {
            const element = keyObj[key]
          }
          if (
            (feeName && feeName !== item.feeName) ||
            (settleCorpName && settleCorpName !== item[keyObj.settleCorpName || 'settleCorpName']) ||
            (currency && currency !== item[keyObj.currency || 'currency']) ||
            (sourceBizNo && !new RegExp(sourceBizNo).test(item[keyObj.sourceBizNo || 'sourceBizNo'])) ||
            (invoiceStatus && invoiceStatus !== item.invoiceStatus) ||
            (settleCompName && settleCompName !== item.settleCompName) ||
            (this.extendOptionShow &&
              ((min !== '' && item.canInvoiceAmt - min < 0) || (max !== '' && item.canInvoiceAmt - max > 0)))
          ) {
            item.invisible = true
          }
        })
      } else {
        this.list.forEach((item) => (item.invisible = false))
      }
      // console.log(JSON.stringify(this.list.map((v) => v.invisible)))
      this.$emit('search', this.list)
    },
    querySettleUnit(name, unitTypes, item) {
      querySettleUnit({ name, unitTypes, size: 30 }).then((res) => {
        item.remoteSelectList = (res.data || []).map((v) => ({ label: v.unitName, value: v.unitName }))
      })
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
  .el-form-item {
    width: 230px !important;
  }
  .el-form-item {
    margin-right: 8px !important;
    & > label {
      width: 66px !important;
    }
  }
  .range__div {
    white-space: nowrap;
    .el-input {
      width: calc(50% - 8px) !important;
    }
  }
}
</style>