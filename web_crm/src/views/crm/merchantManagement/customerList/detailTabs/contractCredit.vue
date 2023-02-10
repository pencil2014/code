<template>
  <el-dialog
    :appendToBody="true"
    :visible.sync="config.show"
    @close="cancel"
    title="合同授信"
    width="800px"
  >
    <FinanceTableMass :option="option1" v-loading="loading" />
  </el-dialog>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { creditDetail } from '@/api/crm/contract'
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      option1: {},
      loading: false
    }
  },
  created() {
    this.getData()
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      tips: false,
      operationBtns: false,
      selection: false,
      noClickCheck: true,
      maxHeight: 300,
      columns: [
        {
          prop: 'settleBusinessTypeList_multiValue',
          label: '业务类型',
          type: 'text',
          width: '250px'
        },
        {
          prop: 'settleRelCustList_multiValue',
          label: '适用关联公司',
          type: 'text',
          width: '250px'
        },
        {
          prop: 'creditQuota',
          label: '合同授信额度',
          type: 'text'
        },
        {
          prop: 'currency',
          label: '币种',
          type: 'text'
        }
      ]
    })
  },
  methods: {
    getData() {
      const { contractId } = this.config
      const data = {
        contractId
      }
      this.loading = true
      creditDetail(data)
        .then(res => {
          if (res.code === 0) {
            this.option1.data = res.data.map(item => {
              const settleBusinessTypeList_multiValue = item.creditAccountBusinessList
                .map(val => {
                  const businessType = val.businessType
                  const d = this.config.businessTypeOptions.filter(
                    ele => ele.value === businessType
                  )[0]
                  return d.label
                })
                .join('，')
              const settleRelCustList_multiValue = item.creditAccountRelCustList
                .map(item => item.relCustName)
                .join('，')
              return Object.assign({}, item, {
                settleBusinessTypeList_multiValue,
                settleRelCustList_multiValue
              })
            })
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>
