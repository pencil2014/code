import { updateOrderFeeRemark, orderFeeHistory, orderMainInfo, updateOrderFeeBl, batchUpdateOrderFeeBl, updateBlByCorp, updateNegativeFollower } from '@/api/fin/fee'
import { updateFinBillFeeRemark, finBillFeeHistory } from '@/api/fin/finBill'
import { payFeeFinishedPush, payFeeFinishedPushCheck } from '@/api/fin/orderFee'
export const orderFeeMixin = {
  data() {
    return {
      bizDetailVisible: {
        show: false,
        feeId: '',
        isFinBill: false
      },
      editRemarkVisible: false,
      rowRemark: {},
      // airCargoStates: {},
      editBlNoVisible: false,
      rowBlNo: {
        // blId: '',
        // blNo: '',
        // blType: '',
        blId: [],
      },
      logDialogVisible: false,
      option5: {},
      businessType2: '',
    }
  },
  created() {
    this.option5 = Object.assign({}, this.option, {
      id: 'option5', $name: 'businessFee5',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns: {
        show: false
      },
      selection: {
        show: false
      }
    })
    this.bizDetailVisible.isFinBill = this.isFinBill
  },
  mounted() {
  },
  methods: {
    // 获取各个费用的可编辑状态，用于点击这些费用时是否进入编辑
    getFeesCanEdit(data, showMessage = false, noOneCanEditNoMsg) { // noOneCanEditNoMsg-没有可修改的费用是否提示
      // this.option1.data.forEach(item => {
      //   let bool = this.editGuard([item], showMessage)
      //   if (bool) {
      //     item.canEdit = true
      //   } else {
      //     item.canEdit = false
      //   }
      // })
      // this.option2.data.forEach(item => {
      //   let bool = this.editGuard([item], showMessage)
      //   if (bool) {
      //     item.canEdit = true
      //   } else {
      //     item.canEdit = false
      //   }
      // })
      data.forEach(item => {
        let bool = this.editGuard([item], false)
        if (bool) {
          item.canEdit = true
        } else {
          item.canEdit = false
        }
      })
      if (!noOneCanEditNoMsg) {
        let someCanEdit = data.some(item => {
          return item.canEdit || item.isAddFee // 复制的费用不受限
        })
        let someSpecOrMng = data.some(item => {
          return item.viewGroupType && item.viewGroupType === 'special' // item.viewGroupType !== 'biz'
        })
        let someSpecOrMngMsg = someSpecOrMng ? `(${this.$t('OrderFee.specialModifyOnSelf')})` : '' // '（专项类费用请通过专项管理费页面进行修改）' : '' // 改成不显示，否则比较干扰，基本每个单子都有专项类费用
        if (!someCanEdit) {
          if (data.length) {
            let message = data.map(item => {
              return item.editGuardMsg
            }).join('<br/>')
            this.$message({
              message,
              type: 'error',
              showClose: true,
              duration: 5000,
              dangerouslyUseHTMLString: true
            })
          } else {
            this.$message({
              message: `${this.$t('OrderFee.noModifiableFee')}${someSpecOrMngMsg}`,
              type: 'error',
              showClose: true,
              duration: 5000
            })
          }
          return false
        } else {
          return true
        }
      }
    },
    handleRemark(row) {
      this.rowRemark = Object.assign({}, row)
      this.rowHandleRemark = row
      this.editRemarkVisible = true
    },
    saveRemark() {console.log(this.isFinBill)
      if (this.rowRemark.orderFeeId || this.rowRemark.finBillFeeId) {
        let data = {
          orderFeeId: this.rowRemark.orderFeeId,
          remark: this.rowRemark.remark
        }
        let reqMethod = updateOrderFeeRemark
        if (this.isFinBill) {
          data = {
            "finBillFeeId": this.rowRemark.finBillFeeId,
            "remark": this.rowRemark.remark
          }
          reqMethod = updateFinBillFeeRemark
        }
        reqMethod(data).then(res => {
          this.$message({
            type: 'success',
            message: this.$t('OrderFee.successOp'), // '修改备注成功',
            showClose: true
          })
          this.getData()
          this.editRemarkVisible = false
        })
      } else {
        if (this.rowHandleRemark) {
          this.rowHandleRemark.remark = this.rowRemark.remark
          this.editRemarkVisible = false
        }
      }
    },
    handleBlNo(row) {
      // if (row.feeCode === 'YJKH' || row.feeCode === 'YJGYS') {
      //   return this.$message({
      //     type: 'error',
      //     message: '押金类费用无需关联提单号',
      //     showClose: true
      //   })
      // }
      this.rowBlNo = Object.assign({}, row)
      this.rowHandleBlNo = row
      this.rowBlNo.isBatch = false
      this.editBlNoVisible = true
    },
    changeBlNo(val) {
      console.log(val)
      if (val && val.length) {
        // let bl = this.blList.find(bl => bl.blId === val)
        // if (bl) {
        //   this.rowBlNo = Object.assign(this.rowBlNo, {
        //     blId: bl.blId,
        //     blNo: bl.blNo,
        //     blType: bl.blType
        //   })
        // }
      } else {
        this.rowBlNo = Object.assign(this.rowBlNo, {
          blId: []
        })
      }
    },
    saveBlNo() {
      if (this.rowBlNo.isBatch) {
        return this.saveBatchOrderFeeBl()
      }
      if (this.rowBlNo.orderFeeId) {
        let data = {
          orderFeeId: this.rowBlNo.orderFeeId,
          blId: this.rowBlNo.blId,
          blNo: this.rowBlNo.blNo,
          blType: this.rowBlNo.blType
        }
        updateOrderFeeBl(data).then(res => {
          this.$message({
            type: 'success',
            message: this.$t('OrderFee.successOp'), // '修改提单号成功',
            showClose: true
          })
          this.getData()
          this.editBlNoVisible = false
        })
      } else {
        if (this.rowHandleBlNo) {
          this.rowHandleBlNo.blId = this.rowBlNo.blId
          this.rowHandleBlNo.blNo = this.rowBlNo.blNo
          this.rowHandleBlNo.blType = this.rowBlNo.blType
          this.editBlNoVisible = false
        }
      }
    },
    batchUpdateOrderFeeBl() {
      if (this.mode === 'byFee') {
        if (!this.multipleSelection1.length) {
          return this.$message({
            type: 'error',
            message: this.$t('OrderFee.selectRow'), // '请勾选需要修改提单号的费用',
            showClose: true
          })
        } else {
          if (this.multipleSelection1.every(item => item.orderFeeId)) {
          } else if (this.multipleSelection1.every(item => !item.orderFeeId)) {
          } else {
            return this.$message({
              type: 'error',
              message: this.$t('OrderFee.blNotAddUnAdded'),
              showClose: true
            })
          }
          try {
            this.multipleSelection1.forEach(row => {
              if (!row.feeCode || !row.settleCorpCode) {
                this.$message({
                  message: this.$t('OrderFee.feeNameSettleBeforeBl'), // '请选择费用名称和结算单位，再关联提单号',
                  type: 'error',
                  showClose: true,
                  offset: 190
                })
                throw new Error('ending')
              }
            })
          } catch (err) {
            return
          }
          this.rowBlNo.isBatch = true
          this.editBlNoVisible = true
          this.multipleSelection1.forEach(item => {
            this.preVerifyNeedBl(item)
          })
        }
      } else {
        if (this.multipleSelection7.length !== 1) {
          return this.$message({
            type: 'error',
            message: this.$t('OrderFee.selectOneRow'), // '请勾选一个需要修改提单号的结算单位',
            showClose: true
          })
        }
        this.rowBlNo = { blId: [] }
        this.rowBlNo.isBatch = true
        this.editBlNoVisible = true
      }
    },
    saveBatchOrderFeeBl() {
      if (this.mode === 'byFee') {
        try {
          this.multipleSelection1.forEach(item => {
            console.log(item)
            if (item.receipayType === 'receive' && item.operation !== 'delete') {
              if (!item.isNoNeedBlFee && !item.isNoNeedBlSettleUnit) {
                if (!this.rowBlNo.blId.length && this.blList.length) {
                  // 20220627 放开，黄学
                  // this.$set(item, 'blId_required', true)
                  // this.$message({
                  //   type: 'error',
                  //   message: `录入应收费用，请关联提单号`,
                  //   showClose: true
                  // })
                  // throw new Error('ending')
                }
              }
            }
          })
        } catch (e) {
          return
        }
        if (this.multipleSelection1.every(item => item.orderFeeId)) {
          let data = {
            orderFeeIds: this.multipleSelection1.map(item => item.orderFeeId).join(','),
            blIds: this.rowBlNo.blId.join(',')
          }
          batchUpdateOrderFeeBl(data).then(res => {
            this.$message({
              type: 'success',
              message: this.$t('OrderFee.successOp'), // '批量修改成功',
              showClose: true
            })
            this.getData()
            this.editBlNoVisible = false
          })
        } else if (this.multipleSelection1.every(item => !item.orderFeeId)) {
          this.multipleSelection1.forEach(item => {
            item.blId = this.rowBlNo.blId
          })
          this.editBlNoVisible = false
        }
      } else {
        let data = {
          orderNo: this.useNo,
          settleCorpCode: this.multipleSelection7[0].settleCorpCode,
          blIds: this.rowBlNo.blId.join(',')
        }
        updateBlByCorp(data).then(res => {
          this.$message({
            type: 'success',
            message: this.$t('OrderFee.successOp'), // '修改提单号成功',
            showClose: true
          })
          this.getData()
          this.editBlNoVisible = false
        })
      }
    },
    preVerifyNeedBl(obj, optionItem) {
      // 服务类型为跨境电商，不限制提单号
      let serviceTypes = ['st15', 'st16', 'st17', 'st18', 'st19']
      let serviceType = this.orderInfo && this.orderInfo.serviceType
      if (serviceType && serviceTypes.includes(serviceType)) {
        obj.isNoNeedBlFee = true
        obj.isNoNeedBlSettleUnit = true
        return
      }
      if (obj.feeCode === 'YJKH' || obj.feeCode === 'YJGYS') {
        obj.isNoNeedBlFee = true
      } else {
        obj.isNoNeedBlFee = false
      }
      if (obj.settleCorpCode) {
        let categorys = ['bkg_carrier', 'bkg_agent', 'trailer_line', 'declaration'] // 'foreign_peer'
        if (optionItem && optionItem.categoryList) {
          if ((optionItem.categoryList && optionItem.categoryList.some(item => {
            return categorys.includes(item.category)
          })) || !optionItem.categoryList || !optionItem.categoryList.length) {
            obj.isNoNeedBlSettleUnit = true
          } else {
            obj.isNoNeedBlSettleUnit = false
          }
        } else {
          let param = {
            queryString: obj.settleCorpName,
            unitTypes: 'customer,supplier,company,DEPT',
            isAdd: true, 
            isForbid: true,
            receipayType: obj.receipayType,
          }
          this.$store.dispatch('dict/querySettleUnit', param).then(data => {
            let optionItem = data.find(item => item.unitName === obj.settleCorpName)
            if (optionItem) {
              if ((optionItem.categoryList && optionItem.categoryList.some(item => {
                return categorys.includes(item.category)
              })) || !optionItem.categoryList || !optionItem.categoryList.length) {
                obj.isNoNeedBlSettleUnit = true
              } else {
                obj.isNoNeedBlSettleUnit = false
              }
            }
          })
        }
      }
    },
    updateNegativeFollower(type) {
      let multipleSelection = type === 'receive' ? this.multipleSelection1 : this.multipleSelection2
      if (!multipleSelection.length) {
        return this.$message({
          type: 'error',
          message: this.$t('OrderFee.selectNegFollowerTip'), // '请勾选需要修改负数跟进人的费用',
          showClose: true
        })
      }
      this.negFolForm.type = type
      this.editNegFolVisible = true
    },
    payFeeFinishedPush() {
      let data = {
        orderNo: this.useNo
      }
      this.loading = true
      payFeeFinishedPushCheck(data).then(res => {
        if (res.data === 'repeat') {
          this.payFeeFinishedPushConfirm(this.$t('OrderFee.payFeeFinishedPush2nd')) // '已推送过，是否再次推送？'
        } else {
          // this.payFeeFinishedPushConfirm(this.$t('OrderFee.payFeeFinishedPushTip')) // '是否确认成本已录推送？'
          this.openBillEmailDialog()
        }
      }).finally(() => {
        this.loading = false
      })
    },
    payFeeFinishedPushConfirm(title, data, callback) {
      if (title === true && data) {
        return payFeeFinishedPush(data).then(res => {
          this.$message({ message: this.$t('OrderFee.successOp'), type: 'success', showClose: true }) // '推送成功'
        }).finally(() => {
          callback && callback()
          this.loading = false
        })
      }
      this.$confirm(title, this.$t('OrderFee.tip'), {
        confirmButtonText: this.$t('OrderFee.confirm'),
        cancelButtonText: this.$t('OrderFee.cancel'),
        type: 'warning',
      }).then(() => {
        // let data = {
        //   orderNo: this.useNo
        // }
        // this.loading = true
        // payFeeFinishedPush(data).then(res => {
        //   this.$message({ message: this.$t('OrderFee.successOp'), type: 'success', showClose: true }) // '推送成功'
        // }).finally(() => {
        //   this.loading = false
        // })
        this.openBillEmailDialog()
      }).catch(err => {
        console.log(err)
      })
    },
    changeNegFol(value) {
      let find = this.employeeSelectOptions.find(o => o.value === value)
      if (find) {
        this.negFolForm.negativeFollowerName = find.label
      }
    },
    saveNegativeFollower() {
      let multipleSelection = this.negFolForm.type === 'receive' ? this.multipleSelection1 : this.multipleSelection2
      let data = { 
        "orderNo": this.useNo || this.finBillNo,
        "negativeFollowerId": this.negFolForm.negativeFollowerId,
        "negativeFollowerName": this.negFolForm.negativeFollowerName,
        "feeIds": multipleSelection.map(item => item.feeId)
      }
      updateNegativeFollower(data).then(res => {
        this.$message({
          type: 'success',
          message: this.$t('OrderFee.successOp'), // '修改成功',
          showClose: true
        })
        this.getData()
        this.editNegFolVisible = false
      })
    },
    handleBizDetail(row) {
      if (row.feeId) {
        this.bizDetailVisible.show = true
        this.bizDetailVisible.feeId = row.feeId
      } else {
        this.$message({
          type: 'warning',
          message: this.$t('OrderFee.newFeeNotDetail'), // '新增的费用不能打开详情',
          showClose: true
        })
      }
    },
    getOrderMainInfo() {
      orderMainInfo({ orderNo: this.orderNo }).then(res => {
        let businessType = this.businessType2 = res.data.businessType // 20220915加，此接口本专为空运所设
        if (businessType) {
          this.ship = businessType.includes('ship') ? true : false
          this.air = businessType.includes('air') ? true : false
          this.rail = businessType.includes('rail') ? true : false
        }
        res.data.airCargoStates.forEach(item => {
          if (item.cargoPurpose === 'predict') {
            this.airCargoStates.predict = {
              totalQuantity: item.totalQuantity,
              totalWeight: item.totalWeight,
              totalVolume: item.totalVolume,
              chargeWeight: item.chargeWeight
            }
          } else if (item.cargoPurpose === 'actual') {
            this.airCargoStates.actual = {
              totalQuantity: item.totalQuantity,
              totalWeight: item.totalWeight,
              totalVolume: item.totalVolume,
              chargeWeight: item.chargeWeight,
              settleWeight: item.settleWeight
            }
          } else if (item.cargoPurpose === 'bl') {
            this.airCargoStates.bl = {
              totalQuantity: item.totalQuantity,
              totalWeight: item.totalWeight,
              totalVolume: item.totalVolume,
              chargeWeight: item.chargeWeight,
              settleWeight: item.settleWeight
            }
          }
        })
      })
    },
    showLog(row) {
      let data = { 
        "orderNo": this.useNo,
        "orderFeeId": row.orderFeeId
      }
      let reqMethod = orderFeeHistory
      if (this.isFinBill) {
        data = {
          "finbillNo": this.finBillNo,
          "finBillFeeId": row.finBillFeeId
        }
        reqMethod = finBillFeeHistory
      }
      reqMethod(data).then(res => {
        if (res.code === 0) {
          let data = res.data
          let columns = [
            {
              prop: 'changeBizType',
              label: this.$t('OrderFee.changeBizType'),
              type: 'select',
              propInDict: 'feeChangeSourceType',
              width: 130
            },
            {
              prop: 'changeBizNo',
              label: this.$t('OrderFee.changeBizNo'),
              type: 'text',
              width: 130,
            },
            {
              prop: 'createdName',
              label: this.$t('OrderFee.changePerson'),
              type: 'text',
              width: 130
            },
            {
              prop: 'createdTime',
              label: this.$t('OrderFee.changeTime'),
              type: 'text',
              width: 130
            },
            {
              prop: 'changeRemark',
              label: this.$t('OrderFee.changeRemark'),
              type: 'text',
              minWidth: 200
            }
          ]
          this.option5.columns = columns
          this.option5.data = data
          this.logDialogVisible = true
        }
      })
    },
  },
  watch: {
    editBlNoVisible(newVal) {
      if (newVal) {
        if (this.rowBlNo.isBatch && this.mode === 'byFee') {
          let row0 = this.multipleSelection1[0]
          if (this.multipleSelection1.every(item => {
            return item.blId.every(id => row0.blId.includes(id)) && row0.blId.every(id => item.blId.includes(id)) // item.blId === row0.blId
          })) {
            this.rowBlNo = Object.assign(this.rowBlNo, {
              blId: row0.blId
            })
          } else {
            this.rowBlNo = Object.assign(this.rowBlNo, {
              blId: []
            })
          }
        }
      }
    }
  }
}