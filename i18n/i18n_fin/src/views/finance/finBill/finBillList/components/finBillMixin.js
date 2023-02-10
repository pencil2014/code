import { getTaxRate } from '@/api/fin/tax'
export const finBillMixin = {
  data() {
    return {
    }
  },
  methods: {
    // 新增行
    addRow(optionId, row) {
      if (optionId === 'option1') {
        this.showTable1 = true
        this.isEditRecei = true
        this.option1.edit = true
        this.getFeesCanEdit(this.option1.data, false, true)
      } else {
        this.showTable2 = true
        this.isEditPay = true
        this.option2.edit = true
        this.getFeesCanEdit(this.option2.data, false, true)
      }
      // this.option1.edit = true
      // this.option2.edit = true
      if (row === true) { // 收入转支出、支出转收入
        let selections, reverseArr
        let isPay = optionId === 'option2'
        if (!isPay) {
          if (!this.multipleSelection2.length) {
            this.isEditRecei = false
            return this.$msgErrClose(this.$t('FinBill.revenue'))
          }
          selections = this.multipleSelection2
        } else {
          if (!this.multipleSelection1.length) {
            this.isEditPay = false
            return this.$msgErrClose(this.$t('FinBill.expenditureTips'))
          }
          selections = this.multipleSelection1
        }
        reverseArr = selections.map((item) => {
          let { feeEnName, feeCode, feeId, feeName, feeUnit, currency, unitCount, unitPrice, feeAmt = 0 } = item
          let obj = Object.assign({ taxRate: '' }, this.rowData, {
            feeEnName,
            feeCode,
            feeId,
            feeName,
            feeUnit,
            currency,
            unitCount,
            unitPrice,
            feeAmt,
          })
          if (isPay) {
            obj.receipayType = 'pay'
            obj.feeCode && this.getTaxRate(obj)
          } else {
            obj.receipayType = 'receive'
            if (this.formData.billType === 'dzg_bill_fee') obj._forceEdit = true
          }
          return obj
        })
        this[optionId].data.unshift(...reverseArr)
      } else if (row) {
        // 清空 结算单号、结算状态、结算时间、结算金额  发票号、发票状态、已开票金额、未开票金额 对冲状态、核销状态、以对冲金额、坏账金额、请款单号、付款单号、核销编号、已核销金额、未核销金额、凭证号
        this[optionId].data.unshift(Object.assign({ ...this.rowData }, row, { finBillFeeId: '' }))
      } else {
        let arr = this[optionId].data
        let obj = { ...this.rowData, feeAmt: 0 }
        if (this.formData.billType === 'dzg_bill_fee') obj._forceEdit = true
        arr.unshift(
          Object.assign(
            { ...obj },
            { receipayType: optionId === 'option1' ? 'receive' : 'pay' },
            {
              // arr.unshift(Object.assign({ ...this.rowData }, { receipayType: optionId === 'option1' ? 'receive' : 'pay' }, {
              settleCorpName:
                optionId === 'option1'
                  ? this.settleCorpNameRecei
                    ? this.settleCorpNameRecei
                    : ''
                  : this.settleCorpNamePay
                    ? this.settleCorpNamePay
                    : '',
              settleCorpCode:
                optionId === 'option1'
                  ? this.settleCorpCodeRecei
                    ? this.settleCorpCodeRecei
                    : ''
                  : this.settleCorpCodePay
                    ? this.settleCorpCodePay
                    : '',
            }
          )
        )
      }
      // this.$nextTick(() => { // 暂注释，20220418
      //   !this.isEdit && this.finBillEdit(true)
      // })
    },
    handleCopy(type) {
      if (type === 'receive') {
        if (!this.multipleSelection1.length) {
          this.$message({
            type: 'error',
            message: this.$t('FinBill.copyTips'),
            showClose: true
          })
          return
        }
        this.multipleSelection1.forEach(row => {
          this.copySingleFee(row, this.option1)
        })
      } else if (type === 'pay') {
        if (!this.multipleSelection2.length) {
          this.$message({
            type: 'error',
            message: this.$t('FinBill.payableCopy'),
            showClose: true
          })
          return
        }
        this.multipleSelection2.forEach(row => {
          this.copySingleFee(row, this.option2)
        })
      }
    },
    copySingleFee(row, option) { // handleCopy(row, option)
      // 清空 结算单号、结算状态、结算时间、结算金额  发票号、发票状态、已开票金额、未开票金额 对冲状态、核销状态、以对冲金额、坏账金额、请款单号、付款单号、核销编号、已核销金额、未核销金额、凭证号
      // console.log(row);
      let {
        settleCorpCode,
        settleCorpName,
        feeEnName,
        feeCode,
        feeId,
        feeName,
        feeUnit,
        currency,
        unitCount,
        unitPrice,
        taxRate,
        feeAmt = 0,
      } = row
      // return
      this.addRow(option.id, {
        settleCorpCode,
        settleCorpName,
        feeEnName,
        feeCode,
        feeId,
        feeName,
        feeUnit,
        currency,
        unitCount,
        unitPrice,
        taxRate,
        feeAmt,
      })
      // if (option === this.option1) {
      //   this.addReceive(Object.assign({}, row))
      // } else {
      //   this.addPay(Object.assign({}, row))
      // }
    },
    handleDelete(type) {
      if (type === 'receive') {
        if (!this.multipleSelection1.length) {
          this.$message({
            type: 'error',
            message: this.$t('FinBill.receDel'),
            showClose: true
          })
          return
        }
        this.getFeesCanEdit(this.option1.data, false, true) // 将应收全部费用提前处理
        this.getFeesCanEdit(this.multipleSelection1) // 是否存在可以删除的费用
        this.multipleSelection1.forEach(row => {
          let $index = this.option1.data.findIndex(item => item === row)
          this.deleteSingleFee($index, row, this.option1)
        })
        this.$nextTick(() => {
          let m = this.multipleSelection1
          for (let i = 0; i < m.length; i++) {
            if (m[i].isAddFee) {
              m.splice(i--, 1)
            }
          }
        })
      } else if (type === 'pay') {
        if (!this.multipleSelection2.length) {
          this.$message({
            type: 'error',
            message: this.$t('FinBill.payableDel'),
            showClose: true
          })
          return
        }
        this.getFeesCanEdit(this.option2.data, false, true) // 将应付全部费用提前处理
        this.getFeesCanEdit(this.multipleSelection2)
        this.multipleSelection2.forEach(row => {
          let $index = this.option2.data.findIndex(item => item === row)
          this.deleteSingleFee($index, row, this.option2)
        })
        this.$nextTick(() => {
          let m = this.multipleSelection2
          for (let i = 0; i < m.length; i++) {
            if (m[i].isAddFee) {
              m.splice(i--, 1)
            }
          }
        })
      }
    },
    deleteSingleFee($index, row, option) {
      if (row.isAddFee) { // 新增的费用从列表删除
        option.data.splice($index, 1)
      } else { // 已存在的费用，显示删除的划线
        let bool = this.editGuard([row], false) // true
        if (!bool) return
        row.edit = false
        this.$set(row, '$isRowDelete', !row.$isRowDelete)
      }
      if (option.id === 'option1') {
        this.isEditRecei = true
        this.option1.edit = true
      } else if (option.id === 'option2') {
        this.isEditPay = true
        this.option2.edit = true
      }
    },
    // 调整代码，通用的方法移到此处
    getTaxRate(row) {
      let data = { feeCode: row.feeCode, receipayType: "pay", }
      getTaxRate(data).then(res => {
        if (res.code === 0) {
          let taxRate = res.data && res.data.taxRate
          row.taxRate = taxRate ? taxRate + '' : ''
        }
      })
    },
    // 新增应付费用为亏舱费时，如果新增的应付费用没有调整费用，则提示，‘录入了应付亏舱费请录入应付调整费用’。
    // feeCode: "TZFY" 调整费用 应付时，限制只能输入负数
    // feeCode: "KCF1" 亏舱费
  }
}