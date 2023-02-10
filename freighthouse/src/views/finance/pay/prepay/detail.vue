<template>
  <div class="finance-page prepay-detail"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <div class="finance-approve-detail finance-detail-page">
      <div class="money-box money-box-border-bottom" style="background: #ffffff">
        <div class="money-box-left">
          <div class="money-title">{{disabled ? '预付款详情' : '预付款申请'}}</div>
        </div>
        <div class="money-box-right">
            <!-- <el-button v-if="!disabled" @click="submitForm" size="mini" type="primary">提交申请</el-button> -->
            <el-button v-if="confirmStatus === 'pending' && checkAuth($route.name, 'btn-prepayPass')" @click="handleApplyFor('pass')" size="mini" type="success">申请通过</el-button>
            <el-button v-if="confirmStatus === 'pending' && checkAuth($route.name, 'btn-prepayRefuse')" @click="handleApplyFor('refuse')" type="danger" size="mini">申请拒绝</el-button>
            <el-button  @click="cancel" size="mini">返回</el-button>
        </div>
      </div>
      <div class="settlement-detail-form">
        <h3>基本信息</h3>
        <DetailDiv	label="预付款申请号：" :content="info.applyNo"/>
        <DetailDiv	label="结算单位：" :content="info.recvCorpName" :isTooltip="true"/>
        <DetailDiv	label="审核状态：" :content="dictMapObj.confirmStatus[info.confirmStatus]"/>
        <DetailDiv	label="预付款来源：" :content="dictMapObj.prepayApplySourceType[info.sourceType]"/>
        <DetailDiv	label="申请人：" :content="info.createdName"/>
        <DetailDiv	label="申请时间：" :content="info.createdTime"/>
        <DetailDiv	label="审核人：" :content="info.confirmName"/>
        <DetailDiv	label="审核时间：" :content="info.confirmTime"/>
        <DetailDiv v-if="!info.refuseReason && !info.payOrderRefuseReason" label="审核拒绝原因：" :content="info.refuseReason" :isFull="true" />
        <DetailDiv v-if="info.refuseReason" label="审核拒绝原因：" :content="info.refuseReason" :isFull="true" />
        <DetailDiv v-if="info.payOrderRefuseReason"  label="出纳拒绝原因：" :content="info.payOrderRefuseReason" :isFull="true" />
        <DetailDiv	label="备注原因：" :content="info.remark" :isFull="true" />
        <div style="width: 100%;height: 1px;border-top: 1px solid #e9e9e9;padding: 0 0 2px 0;margin: 2px 0;"></div>
      </div>
      <div class="settlement-detail-form">
        <h3>付款信息</h3>
        <DetailDiv	label="付款银行：" :content="info.payBankName" :isTooltip="true"/>
        <DetailDiv	label="付款账户名：" :content="info.payAccountName" :isTooltip="true"/>
        <DetailDiv	label="付款账号：" :content="info.payAccountNo"/>
        <DetailDiv	label="付款方式：" :content="dictMapObj.payWay[info.payWay]"/>
        <DetailDiv	label="付款币种：" :content="info.currency"/>
        <DetailDiv	label="付款金额：" :content="info.applyPayAmt"/>
        <DetailDiv	label="账户结算方式：" :content="dictMapObj.bankAccountSettleMode[info.settleMode]"/>
        <div style="width: 100%;height: 1px;border-top: 1px solid #e9e9e9;padding: 0 0 2px 0;margin: 2px 0;"></div>
      </div>
      <div class="settlement-detail-form">
        <h3>收款信息</h3>
        <DetailDiv	label="结算单位：" :content="info.recvCorpName" :isTooltip="true"/>
        <DetailDiv	label="收款银行：" :content="info.recvBankName" :isTooltip="true"/>
        <DetailDiv	label="收款银行支行：" :content="info.recvBankBranch" :isTooltip="true"/>
        <DetailDiv	label="收款账户名：" :content="info.recvAccountName" :isTooltip="true"/>
        <DetailDiv	label="收款账号：" :content="info.recvAccountNo"/>
      </div>
      <div class="finance-table-container">
        <div class="money-box">
          <div class="money-box-left" style="font-size: 12px;">
            <div class="money-title" style="font-size: 12px;">开票信息</div>
            <div class="money-title-1">
              <div >
                <span style="font-size: 12px;">是否开票：<span>{{dictMapObj.yesNo[info.hasInvoice] }}</span></span>
                <span  style="margin-left:36px;font-size: 12px;">是否后补票：<span >{{dictMapObj.yesNo[info.delayInvoice]}}</span></span>
              </div>
            </div>
          </div>
          <div class="money-box-right">
          </div>
        </div>
        <FinanceTable
          :option="option1"
          @send-multi="sendMulti"/>
      </div>
      <div class="settlement-detail-form" v-show="info.payStatus">
        <h3>转账信息</h3>
        <DetailDiv	label="付款状态：" :content="dictMapObj.payStatusType[info.payStatus]" />
        <DetailDiv	label="付款单号：" :content="info.payOrderNo" />
        <DetailDiv	label="银行流水号：" :content="info.bankSeqNo"  :isTooltip="true"/>
        <DetailDiv	label="付款人：" :content="info.payOrderConfirmName"/>
        <DetailDiv	label="付款时间：" :content="info.payTime"/>
      </div>
      <div class="finance-table-container">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title" style="font-size: 12px;">银行手续费</div>
          </div>
          <div class="money-box-right"></div>
        </div>
        <FinanceTable :option="option4" />
      </div>
      <el-dialog
        :title="'申请不通过'"
        :visible.sync="rejectDialogVisible"
        :before-close="handleCancel"
        width="600px">
        <el-form :model="query" ref="query" label-width="100px" class="el-form-item-payapply-remark" required>
        <el-form-item label="拒绝原因"
          prop="refuseReason"
          :rules="{required: true, message: '拒绝原因不能为空', trigger: 'blur'}">
          <el-input type="textarea" maxlength="200" placeholder="请输入拒绝原因" show-word-limit v-model="query.refuseReason"></el-input>
        </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" :loading='loadingSubmit' @click="rejectSubmit" size="mini">确定</el-button>
          <el-button @click="handleCancel" size="mini">取消</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mapGetters } from 'vuex'
import { queryPrepayApplyInfo, savePrepayApply, approvePrepayApply, deleteRelationInvoice } from '@/api/fin/pay/'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
const defaultCreateQuery ={
  "settleCompCode": "",
  "settleCompName": "",
  "applyPayAmt": null,
  "payWay": "telegraphic_transfers",
  "currency": "",
  "delayInvoice": "",
  "hasInvoice": "",
  "payBankAccountId": null,
  "payAccountName": "",
  "payAccountNo": "",
  "payBankBranch": "",
  "payBankCode": "",
  "payBankName": "",
  "recvBankAccountId": "",
  "recvAccountNo": "",
  "recvAccountName": "",
  "recvBankBranch": "",
  "recvBankCode": "",
  "recvBankName": "",
  "recvCorpCode": "",
  "recvCorpName": "",
  "remark": "",
  "payInfoInvoiceList":[],
}
export default {
  mixins: [mixin,routerMixin],
  props: {
    // dialogVisible: {
    //   type: Boolean,
    //   default: false
    // },
    // applyNo: {
    //   type: String,
    //   default: ''
    // }
  },
  data() {
    return {
      loading: false,
      loadingSubmit: false,
      info:{},
      invoiceNo:"点击关联发票",
      confirmStatus:'',
      multipleSelection1:{},
      multipleSelection2:{},
      query:{
        applyNos:[],
        confirmStatus: "pass",
        refuseReason: ""
      },
      autocomplete:{},
      autocomplete1:{},
      applyNo:'',
      disabled:this.$route.query.applyNo ? true :false,
      option1: {},
      option4: {data: []},
      rejectDialogVisible: false,
      form: Object.assign({}, defaultCreateQuery),
      showUploadBtn:true,
      isDetailPage:false,
      isJumpRouteFromPage:false,
      rulesForm:{
        recvCorpName: [{ required: true, message: ' ', trigger: 'change' }],
        recvAccountNo: [{ required: true, message: ' ', trigger: 'change' }],
        payAccountNo: [{ required: true, message: ' ', trigger: 'change' }],
        payWay: [{ required: true, message: ' ', trigger: 'change' }],
        currency: [{ required: true, message: ' ', trigger: 'change' }],
        applyPayAmt: [{ required: true, message: ' ', trigger: 'change' }],
        payBankBranch: [{ required: true, message: ' ', trigger: 'change' }],
      }
    }
  },
  created() {
    let operationBtns = Object.assign(this.option.operationBtns, {
      data: [
        {
          label: '删除',
          type: 'text',
          show: true,
          action: 'Delete'
        }
      ],
      show: true
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'PrepayDetail',
      data: [],
      index:{
        show:true
      },
      tips: {
        text: '',
        show: false
      },
      operationBtns,
      selection:{
        show:false
      },
    })
    let columns1 = [
      {prop: 'invoiceNo', label: '发票号', type: 'text', key: 'invoiceNo'},
      {prop: 'invoiceType', label: '开票类型', type: 'select', key: 'invoiceType', width: 120,},
      {prop: 'amt', label: '开票金额', type: 'text', key: 'amt'},
      {prop: 'currency', label: '开票币种', type: 'text', key: 'currency'},
      {prop: 'rate', label: '开票汇率', type: 'text', key: 'rate',},
      {prop: 'taxRate', label: '发票税率', type: 'text', key: 'taxRate'},
      {prop: 'taxAmt', label: '税额', type: 'text', key: 'taxAmt'},
      {prop: "invoiceAmt", label: "关联金额",	type: "text",},
			{prop: "createdName",	label: "登记人",	type: "text",},
			{prop: "createdTime",	label: "登记时间",	type: "text", width: 150,}
      // {prop: 'invoiceNo', label: '发票号', type: 'text', key: 'invoiceNo'},
      // {prop: 'title', label: '发票抬头', type: 'text', key: 'title'},
      // {prop: 'writeoffAmt', label: '已核销金额', type: 'text', key: 'writeoffAmt'},
      // {prop: 'lockAmt', label: '占用金额', type: 'text', key: 'lockAmt'},
      // {prop: 'remainingAmount', label: '剩余可用金额', type: 'text', key: 'remainingAmount', 
      //   formatter: (row, pItem) => {
      //     return row.amt - row.writeoffAmt - row.lockAmt
      //   }
      // },
      // {prop: 'invoiceType', label: '开票类型', type: 'select', key: 'invoiceType'},
      // {prop: 'currency', label: '开票币种', type: 'text', key: 'currency'},
      // {prop: 'amt', label: '开票金额', type: 'text', key: 'amt'},
      // {prop: 'taxRate', label: '发票税率', type: 'text', key: 'taxRate'},
      // {prop: 'rate', label: '开票汇率', type: 'text', key: 'rate'}
    ]
    let arr1 = []
    columns1.forEach(value => {
      let obj1 = this.columnsBase.find(item => {
        return item.prop === value
      })
      if (obj1) arr1.push(obj1)
    })
    this.option1.columns = columns1
    
    this.option4 = Object.assign({}, this.option, {
      id: 'option4',
      $name: 'WriteoffRecvDetail24',
      data: [],
      tips: false,
      operationBtns: false,
      selection: false,
      edit: true,
    })
    this.option4.columns = [
      {
        prop: 'cutType',
        label: '手续费类型',
        type: 'select',
        propInDict: 'transferFeeType',
        readOnly: true,
      },
      {
        prop: 'assumerType',
        label: '手续费承担人',
        type: 'select',
        propInDict: 'transferFeeAssumerType',
      },
      { prop: 'currency', label: '币种', type: 'text' },
      { prop: 'amt', label: '金额', type: 'text' },
    ]
  },
  computed: {
    ...mapGetters([
      'dictMap',
    ])
  },
  methods: {   
    getData() {
      if(this.applyNo){
        this.loading = true,
        queryPrepayApplyInfo({applyNo:this.applyNo}).then(res => {
          if (res.code === 0) {
            console.log(res.data.transferFeeList);
            this.option4.data = res.data.transferFeeList
            let payInfoInvoices = res.data.payInfo.payInfoInvoices
            Object.assign(this.info,{},res.data.payInfo,res.data)
            let data = []
            payInfoInvoices.forEach(item => {
              // item.invoicePayment.taxAmt = item.taxAmt
              // item.invoicePayment.rate = item.rate
              item.invoicePayment.invoiceAmt = item.invoiceAmt
              data.push(item.invoicePayment)
            })
            this.option1.data = data
            res.data.payInfo.invoiceNo ? this.invoiceNo = res.data.payInfo.invoiceNo :this.invoiceNo ='点击关联发票'
            
            this.confirmStatus = res.data.confirmStatus
          }
        }).catch(err=>{
          this.delVisitedView()
          this.cancel()
        }).finally(()=>{
          this.loading = false
        })
      }
    },
    rejectSubmit() {
      this.$refs.query.validate(valid => {
        if (valid) {
          this.loadingSubmit = true
          approvePrepayApply(this.query).then(res=>{
            this.$message({message: '拒绝申请提交成功', type: 'success'});
            this.rejectDialogVisible = false
            this.cancel(true)
          }).finally(()=>{
            this.loadingSubmit = false
          })
        }
      })
    },
    cancel(refresh) {
      this.routerBack(refresh)
    },
    handleApplyFor(auditStatus) {
      this.query.applyNos = [ this.applyNo ]
      this.query.refuseReason = ''
      if(auditStatus=='refuse'){
        this.query.confirmStatus = auditStatus
        this.rejectDialogVisible = true
      }else{
        this.query.confirmStatus = auditStatus
        this.$confirm('您确定要审核通过预付款申请吗?', "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            lockScroll: "true",
            type: "warning"
        }).then(()=> {
            return approvePrepayApply(this.query);
        }).then(() => {
            this.$message({message: '审核通过提交成功', type: 'success'});
            this.cancel(true)
        }).catch(function() {});
      }
    },
    submitForm(){
      this.$refs.form.validate(valid => {
        if (valid) {
          if(this.form.applyPayAmt<=0){
            this.$message({ type: 'error',  message: '付款金额不能小于0!',showClose: true})
            return
          }
          if (!this.validateMoney(this.form.applyPayAmt,{positive:true})) {
            return
          }
          savePrepayApply(this.form).then(res=>{
            if(res.code === 0) {
              this.$message({ type: 'success', message: '提交成功!', showClose: true})
              this.isJumpRouteFromPage = true
              this.cancel(true)
            }else {
              this.$message({ type: 'error',  message: '提交失败!',showClose: true})
            }
          })
        }
      })
      
    },
    //关联发票
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
    },
    handleCancel(){
      this.$refs.query.resetFields()
      this.rejectDialogVisible = false
    },
    init(){
      this.info = {}
      this.confirmStatus = ''
      this.invoiceNo = "点击关联发票",
      this.applyNo = this.$route.query.applyNo
      this.disabled = this.$route.query.applyNo ? true :false
      this.source = this.$route.query.source
      if (this.source.indexOf('Detail') > -1) {
        this.isDetailPage = true
      } else {
        this.isDetailPage = false
      }
    },
    handleDelete(index,{ invoiceNo }){
      this.$confirm('是否确认删除发票？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
            let data = {
              "payInfoId": this.info.payInfoId,
              "deleteInvoiceNos": [ invoiceNo ]
            }
            deleteRelationInvoice(data).then(res => {
              if (res.code === 0) {
                this.$message({
                  message: '发票删除成功！',
                  type: 'success',
                  showClose: true
                })
                this.getData()
              }
            })
      }).catch(() => {         
      })
    }
  },
  activated() {
    if (!this.$route.meta.isUseCache ) {
      Object.assign(this.form,{},defaultCreateQuery)
      this.init()
      this.getData()
    }
  },
  components: {
    FinanceTable,
    FinanceSearch
  },
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
</style>
<style scoped lang="scss">
  .finance-page .el-dialog .el-form{
    padding: 0;
    .el-form-item{
      width: 100%;
    }
    ::v-deep .el-form-item__content{
      margin-left: 0 !important;
    }
  } 
  .prepay-detail{
    .el-form-item{
      display: inline-flex;
      ::v-deep .el-form-item__content{
        flex: 1 1 auto;
        // width: auto;
      }
      .el-tooltip{
        height: 20px;
        overflow: hidden;
        display: inline-block;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
      }
    }
    .finance-approve-btns-box{
      display: flex;
      justify-content: space-between;
      height: 40px;
      padding: 0 24px;
      border-radius: 4px 4px 0px 0px;
      border-bottom: 1px solid #E9E9E9;
    }
    .finance-approve-btns-left{
      font-size: 18px;
      font-weight: 600;
      color: #222222;
      line-height: 24px;
      margin-top: 8px;
    }
    .finance-approve-btns-right{
      margin-top: 6px;
    }
    .finance-page-background{
      background: #FFF;
    }
    .el-form-item{
      min-width: 248px;
      margin-bottom: 0px !important;
      margin-right: 16px;
    }
    .el-form-item-text{
     
      font-size: 12px;
      width: 200px; 
    }
    .detail-info-item-1{
      display: block;
      min-width: 248px;
      margin-bottom: 7px;
    }
    // .settlement-detail-form{
    //   padding: 16px 16px 0 16px;
    // }
    .settlement-detail-form .el-form-item{
      margin-bottom: -6px;
    }
    .settlement-detail-form h3{
      font-size: 12px;
    }
    .settlement-detail-form-1{
      padding-bottom:16px;
    }
    .settlement-detail-form-border-bottom{
      border-bottom: 1px solid #D8D8D8 !important;
    }
    .settlement-exchange-rates{
      width:260px;
      display:inline-block;
      margin-right: 24px;
      vertical-align: top;
    }
    .settlement-exchange-rates-title{
    color: #222222;
    line-height: 28px;
    }
  .money-title-1{
    font-size: 12px;
    color: #222222;
    line-height: 14px;
    padding-top: 2px;
    margin-right: 20px;
  }
  }

</style>
<style lang="scss">
.el-form-item-payapply-remark {
  width: 100%;
  padding: 0 30px;
}
.el-form-item-payapply-remark .el-form-item__content {
  width: calc(100% - 70px);
}
.app-wrapper .finance-page .el-form-item-payapply-remark textarea {
  min-height: 75px !important;
}
</style>