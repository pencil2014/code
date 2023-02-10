<template>
  <FinDialog :option="compareDialog" v-if="compareDialog.show" @close="compareDialogClose" />
</template>
<script>
import FinDialog from '@/views/finance/components/financeDialog/finDialog'
import { bankCompare } from '@/api/fin/compareBill'
import { bankAccountList } from '@/api/fin/settleUnit'

export default {
  name: 'compareDialog',
  props: ['vm'],
  components: { FinDialog },
  data() {
    let ruleMsg = { required: true, message: ' ', trigger: 'change' }
    return {
      compareDialog: {
        title: '对账',
        show: false,
        width: '460px',
        formItems: [
          // { label: this.$t('FeeList.settleComp'), prop: 'settleCompCode', type: 'select', rules: [{ ...ruleMsg }] },
          {
            label: this.$t('FeeList.receipayType'),
            prop: 'receivePayType',
            type: 'select',
            propInDict: 'feeitemReceipayGroup',
            rules: [{ ...ruleMsg }],
          },
          {
            label: '银行简称',
            prop: 'compAccountIds',
            type: 'select',
            rules: [{ ...ruleMsg }],
            remote: true,
            multiple: true,
            remoteMethod: (str, item) => {
              if (!this.compareDialog.form.receivePayType) {
                return this.$msgErrClose('请先选择收付类型！')
              }
              let data = {
                // unitCode: this.$store.state.user.userInfo.settleCompanyCode,
                accountShortName: str,
                status: 'effect',
                receipayType: this.compareDialog.form.receivePayType,
              }
              bankAccountList(data).then((res) => {
                const list = res.data || []
                item.remoteSelectList = list.map((item) => ({ value: item.settleUnitBankAcctId, label: item.accountShortName }))
              })
            },
            remoteSelectList: [],
          },
          {
            label: this.$t('PayApplyList.receivePayDate'),
            prop: 'date',
            type: 'date',
            dateType: 'daterange',
            rules: [{ ...ruleMsg }],
            // pickerOptions: {
            //   disabledDate: (date) => {
            //     let formDate = this.compareDialog.form.date
            //     let start = formDate ? formDate[0] : ''
            //     console.log(start);
            //     if (start) {
            //       console.log(start, date.getTime())
            //     }
            //   },
            //   onPick: ({ maxDate, minDate }) => {
            //     console.log(maxDate, minDate)
            //   },
            // },
          },
        ],
        form: { compAccountIds: '', receivePayType: '', date: '' },
      },
    }
  },
  watch: {
    'compareDialog.show': {
      handler(val) {
        if (!val) {
          Object.assign(this.compareDialog.form, { compAccountIds: '', receivePayType: '', date: '' })
        }
      },
      immediate: true,
    },
  },
  methods: {
    compareDialogClose(val) {
      if (!val) {
        this.compareDialog.show = false
        return
      }
      let data = this.compareDialog.form
      data.startDate = data.date[0]
      data.endDate = data.date[1]
      if ((new Date(data.endDate) - new Date(data.startDate)) / 1000 / 3600 / 24 > 30) {
        return this.$msgErrClose('收付日期区间不能大于31天！')
      }
      bankCompare(data).then((res) => {
        this.compareDialog.show = false
        this.$msgSucClose('对账成功！')
        this.vm.option1.pagination.currPage = 1
        this.vm.getData()
      })
    },
  },
}
</script>
<style lang="scss" scoped></style>