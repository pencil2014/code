<template>
<div>
  <div v-show="visibleClick" :class="{'fin-biz-detail-hide':!bizDetailVisible.show&&visibleClick,'fin-biz-detail-list':bizDetailVisible.show&&visibleClick}">
    <div class="settlement-detail-form">
      <el-form
        :model="bizDetailForm"
        ref="bizDetailForm"
        :inline="true"
        size="mini"
        label-width="150px"
        label-suffix=':'
      >
        <h3 style="line-height:20px;">{{$t('FinBill.feeDetails')}}</h3>
        <template v-if="bizDetailVisible.isFinBill">
          <el-form-item :label="$t('FinBill.finBillName')" prop="finBillName">
            <div class="el-form-item-text" v-html="bizDetailForm.finBillName"></div>
          </el-form-item>       
          <el-form-item :label="$t('FinBill.finBillNo')" prop="orderNo" >
            <div class="el-form-item-text" v-html="bizDetailForm.orderNo"></div>
          </el-form-item>       
          <el-form-item :label="$t('FinBill.billTypes')" prop="billType" >
            <div class="el-form-item-text" v-html="renderPropLabel('finBillBillType',bizDetailForm.billType)"></div>
          </el-form-item>       
          <el-form-item :label="$t('FeeList.createdBy')" prop="createdName" >
            <div class="el-form-item-text" v-html="bizDetailForm.createdName"></div>
          </el-form-item>       
          <el-form-item :label="$t('Settle.creatTime')" prop="createdTime" >
            <div class="el-form-item-text" v-html="bizDetailForm.createdTime"></div>
          </el-form-item>       
          <el-form-item :label="$t('FeeList.settleComp')" prop="settleCompName" >
            <div class="el-form-item-text" v-html="bizDetailForm.settleCompName"></div>
          </el-form-item>         
          <el-form-item :label="$t('FeeList.bdDeptCode')" prop="departName" >
            <div class="el-form-item-text" v-html="bizDetailForm.departName"></div>
          </el-form-item>         
          <el-form-item :label="$t('FinBill.employeeId')" prop="employeeName" >
            <div class="el-form-item-text" v-html="bizDetailForm.employeeName"></div>
          </el-form-item>          
          <el-form-item :label="$t('FinBill.employeeNo')" prop="employeeNo" >
            <div class="el-form-item-text" v-html="bizDetailForm.employeeNo"></div>
          </el-form-item>          
          <el-form-item :label="$t('FinBill.year')" prop="yearMon" >
            <div class="el-form-item-text" v-html="bizDetailForm.yearMon"></div>
          </el-form-item>         
        </template>
        <template v-else>
          <!-- <DetailDiv label="分公司：" :content="settlementDetailForm.settleCompName" :isFull="true" /> -->
          <el-form-item :label="$t('FeeList.businessTypes')" prop="businessType">
            <div class="el-form-item-text" v-html="renderPropLabel('businessType',bizDetailForm.businessType)"></div>
          </el-form-item>
          <el-form-item :label="$t('FinBill.orderNo')" prop="orderNo">
            <div class="el-form-item-text" v-html="bizDetailForm.orderNo"></div>
          </el-form-item>
          <el-form-item :label="$t('FinBill.mainOrderNo')" prop="mainOrderNo">
            <div class="el-form-item-text" v-html="bizDetailForm.mainOrderNo"></div>
          </el-form-item>
          <el-form-item :label="$t('FeeList.bizDate')" prop="bizDate">
            <div class="el-form-item-text" v-html="bizDetailForm.bizDate"></div>
          </el-form-item>
          <el-form-item :label="$t('FeeList.polPortCode')" prop="polPortName">
            <div class="el-form-item-text" v-html="bizDetailForm.polPortName"></div>
          </el-form-item>
          <el-form-item :label="$t('FeeList.podPortCode')" prop="podPortName">
            <div class="el-form-item-text" v-html="bizDetailForm.podPortName"></div>
          </el-form-item>
          <el-form-item :label="$t('FeeList.bdEmployeeId')" prop="bdEmployeeName">
            <div class="el-form-item-text" v-html="bizDetailForm.bdEmployeeName"></div>
          </el-form-item>
          <el-form-item :label="$t('FeeList.opEmployeeId')" prop="opEmployeeName">
            <div class="el-form-item-text" v-html="bizDetailForm.opEmployeeName"></div>
          </el-form-item>
          <el-form-item :label="$t('FinBill.bdDeptName')" prop="bdDeptName">
            <div class="el-form-item-text" v-html="bizDetailForm.bdDeptName"></div>
          </el-form-item>
          <el-form-item :label="$t('FinBill.opDeptName')" prop="opDeptName">
            <div class="el-form-item-text" v-html="bizDetailForm.opDeptName"></div>
          </el-form-item>
        </template>
      </el-form>
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title" style="color:#4a4a4a;font-size:12px;font-weight:normal;">{{moneyTitle1}}</div>
        </div>
        <div class="money-box-right">
        </div>
      </div>
      <FinanceTable
        v-if="bizDetailVisible.show"
        :option="option1"/>
    </div>
    <InovicePreviewPrint
      :dialog-visible-o="dialogVisibleO"
      :customer-info="customerInfo"
      :seller-info="sellerInfo"
      :apply-item-group-list="applyItemGroupList"
      :other-invoice-info="otherInvoiceInfo"
      :isElec="singleInvoiceType"
    />
  </div>
  <div v-show="bizDetailVisible.show" class="v-modal" @click="hideAction"></div>
</div>
</template>
<script>
import FinanceTable from '../../../../components/financeTableMass/financeTableMass'
import { mixin } from '../../mixin'
import { mapState } from 'vuex'
import { bizDetailList } from '@/api/fin/fee' // saveOrderBizFeeAfFinClose, saveOrderSpecialFeeAfFinClose, 
import { saveOrderBizFee } from '@/api/fin/feeAdjust'
import { saveOrderSpecialFee, orderFeeAdjustDetail } from '@/api/fin/feeAdjust'
import InovicePreviewPrint from '@/views/finance/invoiceReceivable/components/invoicePreviewPrint'

export default {
  name: 'feeClosedDiaglog',
  mixins: [mixin],
  props: {
    dialogVisible: {
      type: Object,
      default: () => ({})
    },
    isSpecialFee: {
      type: Boolean,
      default: false
    },
    feeAdjustApplyId: {
      type: Number,
      default: 0
    },
    bizDetailVisible: {
      type: Object,
      default: () => ({ show: false })
    }
  },
  data() {
    let pageCode = this.$route.name === 'SiDetail' ? 'SiDetailFee' : this.$route.name
    return {
      option1: {},
      option2: {},
      option3: {},
      moneyTitle1: this.$t('FinBill.moneyTitle1'),
      moneyTitle2: this.$t('FinBill.moneyTitle2'),
      moneyTitle3: this.$t('FinBill.moneyTitle3'),
      moneyTotalReceive: [],
      comeType: this.$t('Common.modify'),
      hedgingRecord: [],
      deleteSelection: [],
      orderNo: '',
      reason: '',
      applyPersonId: '',
      remark: '',
      employeeSelectOptions: [],
      modifyFeeData: {
        "applyPersonName": "",
        "createdName": "",
        "createdTime": "",
        "bizAuditName": "",
        "bizAuditTime": "",
        "reason": "",
        "remark": "",
        "finMon": "",
        "finCloseStatus": "",
      },
      useNo: '',
      loadVisible: false,
      visibleClick: false,
      bizDetailForm: {
        businessType: '',
        orderNo: '',
        mainOrderNo: '',
        bizDate: '',
        polPortName: '',
        podPortName: '',
        bdEmployeeName: '',
        opEmployeeName: '',
        bdDeptName: '',
        opDeptName: '',
      },
      singleInvoiceType: '',
      dialogVisibleO: { show: false },
      customerInfo: {},
      sellerInfo: {},
      invoiceReceivableList: [],
      applyItemGroupList: [],
      otherInvoiceInfo: {},
      pageCode,
    }
  },
  created() {
    let operationBtns = Object.assign(this.option.operationBtns, {
      data: [
        {
          label: this.$t('Common.del'),
          type: 'text',
          show: true,
          action: 'Delete'
        }
      ]
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'bizDetailList',
      edit: true,
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
      },
      rootTipsHide: true
    })
    this.option1.columns = [
      { prop: 'documentType', label: this.$t('FinBill.billType'), type: 'select', propInDict: 'finDocumentType ', width: 70 },
      { prop: 'orderNo', label: this.$t('FinBill.billNo'), type: 'button', minWidth: 125, operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.openOneNO(row)
          },
        }
      },
      { prop: 'status', label: this.$t('FinBill.billStatus'), type: 'select', width: 70 },
      { prop: 'createdName', label: this.$t('FeeList.createdBy'), type: 'text', width: 70 },
      { prop: 'createdTime', label: this.$t('Settle.createdTime'), type: 'text', minWidth: 120 },
      { prop: 'auditName', label: this.$t('FinBill.approverName'), type: 'text', width: 70 },
      { prop: 'auditTime', label: this.$t('FinBill.approveEndTime'), type: 'text', minWidth: 120 },
      { prop: 'settleCompName', label: this.$t('FinBill.companyName'), type: 'text', minWidth: 125 },
      { prop: 'fileNo', label: this.$t('Common.operate'), type: 'button',
        formatter: ({ row }) => {
          if (row.fileNo){
            if(this.checkAuth(this.pageCode, 'tab-businessFee', 'btn-bizDetailFilePvw')){
              return this.$t('Common.preview')
            }
            if(this.pageCode === 'SettlementFeeList' && this.checkAuth('SettlementFeeList' , 'btn-bizDetailFilePvw')){
              return this.$t('Common.preview')
            }
          } 
          return ''
        },
        callback: (row, prop) => {
          let fileNo = row.fileNo
          this.handleBankseqFileNo(fileNo)
        }
      }
    ]
  },
  mounted() {
    this.loadVisible = true
  },
  methods: {
    getData() {
      let data = {
        "feeId": this.bizDetailVisible.feeId
      }
      bizDetailList(data).then(res => {
        this.bizDetailForm = res.data
        this.option1.data = res.data.feeBizDetailDtoList
      })
    },
    hideAction() {
      this.bizDetailVisible.show = false
    },
    openOneNO(row) {
      let type = row.documentType
      let no = row.orderNo
      let id = row.documentId
      if (type === 'settle_order') {
        this.showOneNoDetail('settleOrderNo', no, { from: 'OrderFee' })
      } else if (['receive_writeoff', 'gedging_writeoff', 'baddebt_writeoff', 'pay_writeoff'].includes(type)) {
        this.showOneNoDetail('writeoffNos', no, { from: 'OrderFee' })
      } else if (type === 'bill') {
        this.showOneNoDetail('bill', id, { from: 'OrderFee' })
      } else if (type === 'settle_order_bill') {
        this.showOneNoDetail('settle_order_bill', id, { from: 'OrderFee' })
      } else if (type === 'gedging_apply') {
        this.showOneNoDetail('gedging_apply', id, { from: 'OrderFee' })
      } else if (type === 'baddebt_apply') {
        this.showOneNoDetail('baddebt_apply', id, { from: 'OrderFee' })
      } else if (type === 'receive_invoice_apply') {
        this.showOneNoDetail('invoiceReceiApply', id, { from: 'OrderFee' })
      } else if (type === 'pay_apply_order') {
        this.showOneNoDetail('pay_apply_order', no, { from: 'OrderFee' })
      } else if (type === 'pay_order') {
        this.showOneNoDetail('pay_order', no, { from: 'OrderFee' })
      } else if (type === 'payment_invoice') {
        this.showOneNoDetail('invoiceNo', id, { from: 'OrderFee', receipayType: 'pay' })
      } else if (type === 'receive_invoice') {
        this.showOneNoDetail('invoiceReceiPvw', id, { from: 'OrderFee' })
      }
    },
    handleBankseqFileNo(fileNo) {
      const href = `/base/fileView/preview/${fileNo}/sowoll`
      window.open(href)
    },
    employeeSelectlist(queryString) {
      let data = {
        "state": "valid",
        "name": queryString
      }
      this.$store.dispatch('dict/employeeSelectlist', data).then(data => {
        console.log(data)
        this.employeeSelectOptions = data.map(item => {
          return {
            label: item.value,
            value: item.key
          }
        })
      })
    },
    add() {
      let obj = {
        orderFeeId: '',
        edit: true
      }
      this.option1.columns.forEach(item => {
        obj[item.prop] = ''
      })
      this.option1.data.push(obj)
    },
    handleDelete($index, row, option) {
      this.$confirm(this.$t('Settle.confirmWarn'), this.$t('Common.tips'), {
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        type: 'warning'
      }).then(() => {
        // let orderFeeId = row.orderFeeId
        // if (orderFeeId !== '') {
        //   let deleteItem = this.multipleSelection.find(item => {
        //     return orderFeeId === item.orderFeeId
        //   })
        //   deleteItem.operation = 'delete'
        //   this.deleteSelection.push(deleteItem)
        // }
        // this.option1.data.splice($index, 1)
      }).catch(() => {         
      })
    },
    submit() {
      let fees = []
      this.option1.data.forEach(item => {
        item.operation = 'update'
      })
      fees = fees.concat(this.deleteSelection)
      fees = fees.concat(this.option1.data)
      let data = {
        orderNo: this.useNo, // this.orderNo,
        "reason": this.reason,
        "applyPersonId": this.applyPersonId,
        "remark": this.remark,
        fees
      }
      if (!this.isSpecialFee) {
        saveOrderBizFee(data).then(res => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: this.$t(Common.submitSuc),
              showClose: true
            })
          } else {
            this.$message({
              type: 'error',
              message: this.$t(Common.submitFail),
              showClose: true
            })
          }
          this.dialogVisible.show = false
        })
      } else {
        saveOrderSpecialFee(data).then(res => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: this.$t(Common.submitSuc),
              showClose: true
            })
          } else {
            this.$message({
              type: 'error',
              message: this.$t(Common.submitFail),
              showClose: true
            })
          }
          this.dialogVisible.show = false
        })
      }
    },
    handleCollapse() {

    }
  },
  components: {
    FinanceTable,
    InovicePreviewPrint,
  },
  computed: {
    finCloseStatus() {
      let cellValue = this.modifyFeeData.finCloseStatus
      return `${this.$t('FeeList.closeStatus')}：` + (cellValue === 'yes' ? `<span style="color:#CD4130;">${this.$t('Common.yes')}</span>` : cellValue === 'no' ? `<span style="color:#33B18A;">${this.$t('Common.no')}</span>` : cellValue)
    },
    ... mapState({
      defaultColumns: state => state.finance.columns.defaultColumns,
      columnsBase: state => state.finance.columns.columnsBase
    })
  },
  watch: {
    'dialogVisible.show'(val) {
      if (val) {
        this.orderNo = this.$route.query.orderNo
        this.jointNo = this.$route.query.jointNo
        this.useNo = this.jointNo ? this.jointNo : this.orderNo
        this.getData()
      }
    },
    'bizDetailVisible.show'(val) {
      if (val) {
        this.$refs.bizDetailForm.resetFields()
        this.option1.data = []
        this.getData()
        this.visibleClick = true
      }else{
        // 不重置为false时，重新进入页面时会自动闪现再隐藏，直接设置false会影响动画效果
        setTimeout(() => {
          this.visibleClick = false
        }, 400);
      }
    }
  }
}
</script>
<style scoped>
.modifyfee-h2{
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  line-height: 25px;
  margin-top: 14px;
}
.settlement-detail-form .el-form-item {
  width: calc(50% - 28px);
}
.settlement-detail-form ::v-deep .el-form-item__content {
  width: calc(100% - 150px);
}
.fin-biz-detail-list {
  position: fixed;
  right: 0;
  top: 0;
  height: 100%;
  z-index: 2999;
  background: #fff;
  width: 50vw;
  box-shadow: -2px 0 8px rgb(0 0 0 / 15%);
  animation: slideLeftBiz 0.5s;
}
@keyframes slideLeftBiz {
  from {right:-50vw;}
  to {right:0;}
}
.fin-biz-detail-hide {
  position: fixed;
  right: -50vw;
  top: 0;
  height: 100%;
  z-index: 4000;
  background: #fff;
  width: 50vw;
  box-shadow: none;
  animation: slideRightBiz 0.5s;
}
@keyframes slideRightBiz {
  from {right:0;}
  to {right:-50vw;}
}
</style>