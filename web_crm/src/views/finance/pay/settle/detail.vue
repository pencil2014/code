<template>
<!-- 弃用 -->
<div class="settle-detail">
  <div class="finance-page finance-page-background" :style="{margin:financePageMargin}">
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{'结算付款申请详情(弃用)'}}</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn"  @click="cancel" size="mini">返回</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" :disabled="confirmStatus !== 'pending'"  @click="handleApplyFor('refuse')" size="mini">审核不通过</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" :disabled="confirmStatus !== 'pending'"  @click="handleApplyFor('pass')" type="primary" size="mini">审核通过</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="settlement-detail-form">
      <h3>基本信息</h3>
      <el-form class="settlement-detail-form-1" :model="settlementDetailForm" ref="form" :inline="true" size="mini">
        <el-form-item label="结算申请号：" prop="">
          <div class="el-form-item-text" v-html="settlementDetailForm.applyNo">
          </div>
        </el-form-item>
        <el-form-item label="结算单编号：" prop="">
          <div class="el-form-item-text" v-html="settlementDetailForm.settleOrderNo">
          </div>
        </el-form-item>
        <el-form-item label="结算单位：" prop="">
          <div class="el-form-item-text">{{settlementDetailForm.recvCorpName }}
          </div>
        </el-form-item>
        <el-form-item label="结算方式：" prop="">
          <div class="el-form-item-text">{{ dictMapObj.settleCycle[statistics.settleCycle] }}
          </div>
        </el-form-item>
        
        <el-form-item label="结算币种:" prop="">
          <div class="el-form-item-text" v-html="settlementDetailForm.currency">
          </div>
        </el-form-item>
        <el-form-item label="申请人:" prop="">
          <div class="el-form-item-text" v-html="settlementDetailForm.createdName">
          </div>
        </el-form-item>
        <el-form-item label="申请时间:" prop="">
          <div class="el-form-item-text" v-html="settlementDetailForm.createdTime">
          </div>
        </el-form-item>
        <el-form-item label="审核状态:" prop="">
          <div class="el-form-item-text">{{ dictMapObj.confirmStatus[settlementDetailForm.confirmStatus] }}
          </div>
        </el-form-item>
        <el-form-item label="审核人:" prop="">
          <div class="el-form-item-text" v-html="settlementDetailForm.confirmName">
          </div>
        </el-form-item>
        <el-form-item label="审核时间:" prop="">
          <div class="el-form-item-text" v-html="settlementDetailForm.confirmTime">
          </div>
        </el-form-item>
        <span class="detail-info-item-1">
          <div style="line-height: 18px ">拒绝原因：{{settlementDetailForm.refuseReason}}</div>
        </span>
        <span class="detail-info-item-1">
          <div style="line-height: 18px ">备注说明：{{settlementDetailForm.remark}}</div>
        </span>
      </el-form>
    </div>
    <div class="settlement-detail-form">
      <h3>收付款信息</h3>
      <div class="settlement-detail-form-1" v-for="(item,index) in payInfoList" :key="index">
         <el-form :model="settlementDetailForm" ref="form" :inline="true" size="mini" style="padding: 10px 0">
           <el-form-item label="付款币种：" prop="settleCorpName">
              <div class="el-form-item-text" v-html="item.currency">
              </div>
            </el-form-item>
           <el-form-item label="付款金额：" prop="settleCorpName">
              <div class="el-form-item-text" v-html="item.applyPayAmt">
              </div>
            </el-form-item>
           <el-form-item label="付款方式：" prop="settleCorpName">
             <el-select v-model="item.payWay"
              @change="(value, currency, payCompCode,obj) => {select3.change(value, item.currency, item.payCompCode,item) }"
              placeholder="请选择" :disabled="confirmStatus !== 'pending'" style="width:100px" >
                <el-option
                  v-for="it in dictMap['payWay']"
                  :key="it.value"
                  :label="it.label"
                  :value="it.value">
                </el-option>
              </el-select>
            </el-form-item>
         </el-form>
         <el-table
          v-show="item.payWay !== 'prepay_dedue'"
          :data="[item]"
          style="width: 100%">
          <el-table-column
            fixed
            :align="'center'"
            prop="payCompName"
            label="所属分公司">
          </el-table-column>
          <el-table-column
            fixed
            :align="'center'"
            prop="payAccountShortName"
            label="付款银行简称">
             <template slot-scope="scope">
                <el-select
                  size="mini"
                  v-model="scope.row.payAccountShortName"
                  :disabled="confirmStatus !== 'pending'"
                  :placeholder="'请选择付款银行简称'"
                  highlight-first-item="true"
                  :remote-method="(queryString) => {bankAccountList1(queryString,scope.row)}"
                  @visible-change="(value) => {bankAccountList1(value,scope.row) }"
                  @change="(value) => {select1.change(value,scope.row) }"
                >
                  <el-option
                    v-for="(optionItem, j) in bankAccountSelectOptions1"
                    :key="'select' + item.prop + j"
                    :label="optionItem.label"
                    :value="optionItem.value"
                  ></el-option>
                </el-select>
             </template>
          </el-table-column>
          <el-table-column
            fixed
            :align="'center'"
            prop="payBankName"
            label="付款银行">
          </el-table-column>
          <el-table-column
            fixed
            :align="'center'"
            prop="payAccountName"
            label="付款账户名">
          </el-table-column>
          <el-table-column
            fixed
            :align="'center'"
            prop="payAccountNo"
            label="付款账号">
          </el-table-column>
          
          <el-table-column
            fixed
            :align="'center'"
            prop="recvAccountNo"
            label="供应商收款账号">
              <template slot-scope="scope">
                <el-select
                  size="mini"
                  v-model="scope.row.recvAccountNo"
                  :placeholder="'请选择供应商收款账号'"
                  highlight-first-item="true"
                  :disabled="confirmStatus !== 'pending'"
                  :remote-method="(queryString) => {select2.bankAccountList2(queryString, scope.row)}"
                  @visible-change="(value) => {bankAccountList2(value,scope.row) }"
                  @change="(value) => {select2.change(value,scope.row) }"
                >
                  <el-option
                    v-for="(optionItem, j) in bankAccountSelectOptions2"
                    :key="'select' + item.prop + j"
                    :label="optionItem.label"
                    :value="optionItem.value"
                  ></el-option>
                </el-select>
             </template>
          </el-table-column>
          <el-table-column
            fixed
            :align="'center'"
            prop="recvBankName"
            label="供应商收款银行">
          </el-table-column>
          <el-table-column
            fixed
            :align="'center'"
            prop="recvAccountName"
            label="供应商收款账户名">
          </el-table-column>
        </el-table>
         <!-- <FinanceTable
          :option="option1"
          @send-multi="sendMulti"/> -->
      </div>
    </div>
    <div class="finance-table-container" style="margin: 6px 14px">
      <div class="money-box">
        <div class="money-box-left ">
          <div class="money-title">开票信息</div>
          <div class="money-title-1">
            <div >
              <span>是否开票：<span>{{dictMapObj.yesNo[settlementDetailForm.hasInvoice] }}</span></span>
              <span  style="margin-left:36px">是否后补票：<span >{{dictMapObj.yesNo[settlementDetailForm.delayInvoice]}}</span></span>
            </div>
          </div>
        </div>
        <div class="money-box-right">
        </div>
      </div>
      <FinanceTable
        :option="option2"
        @send-multi="sendMulti"/>
    </div>
    <div class="finance-table-container" style="margin: 6px 14px">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">转账信息</div>
        </div>
        <div class="money-box-right">
        </div>
      </div>
      <FinanceTable
        :option="option3"
        @send-multi="sendMulti"/>
    </div>
  </div>
  <!-- 关联发票 -->
  <!-- <el-dialog
    :title="'关联发票'"
    :visible.sync="relevanceOpne"
    :before-close="handleCancel"
    class="relevance-invoice"
    width="1000px">
    <FinanceSearch
    :searchOption="searchOption1"
    @search="search"/>
    <FinanceTable
    :option="option2"
    @send-multi="sendMulti"/>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="relevanceSubmit" size="mini">确定</el-button>
      <el-button @click="handleCancel" size="mini">关闭</el-button>
    </span>
  </el-dialog> -->
  <!-- 申请不通过弹框 -->
  <el-dialog
    :title="'申请不通过'"
    :visible.sync="rejectDialogVisible"
    :before-close="handleCancelRefuse"
    width="500px">
    <el-form :model="query" ref="query" label-width="80px">
    <el-form-item label="拒绝原因"
      prop="refuseReason"
      :rules="{required: true, message: '拒绝原因不能为空', trigger: 'blur'}">
      <el-input type="textarea" :maxlength="500" show-word-limit v-model="query.refuseReason"></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="rejectSubmit('refuse')" size="mini">确定</el-button>
      <el-button @click="handleCancelRefuse" size="mini">取消</el-button>
    </span>
  </el-dialog>
</div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapGetters } from 'vuex'
import {usableList } from '@/api/fin/invoicePayment'
import { billGenerateSo } from '@/api/fin/bill'
import { queryPayApplySettleInfo, approvePayApplySettle, savePayApplySettle} from '@/api/fin/pay/'
import { generateSettleOrder, settleOrderSave ,settleOrderFeeStatistics } from '@/api/fin/settleOrder'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import Vue from 'vue'
export default {
  mixins: [mixin,routerMixin],
  props: {
    // rowData: {
    //   type: Object,
    //   default: () => ({}),
    // },
  },
  data() {
    return{
      payInfoList:[],
      row:{},
      rejectDialogVisible:false,
      confirmStatus:'',
      settleOrderNo:'',
      disabled:false ,
      query:{
        refuseReason:""
      },
      source: '',
      billId: '',
      option1: {},
      option2: {},
      option3: {},
      multipleSelection1: [],
      multipleSelection2: [],
      settlementDetailForm: {},
      settleOrderFeeIds: [], // 删除的结算单费用明细IDs
      searchWords: '',
      financePageMargin: '',
      applyNo:'',
      statistics:{},
      selectedOptionItem:'',
      options:[
        { value:'yes', label:'是' },
        { value:'no',  label:'否' },
      ],
      searchOption1:{
        columns: [
          {
            label: '发票号',
            prop: 'invoiceNo',
            type: 'input'
          },
          {
            label: '发票类型',
            prop: 'invoiceType',
            type: 'select'
          },
          {
            label: '开票币种',
            prop: 'currency',
            type: 'select'
          }
        ],
        data: {
          invoiceType: '',
          invoiceNo: '',
          currency: ''
        },
      },
      relevanceOpne:false,
      index:-1,
      bankAccountSelectOptions1:[],
      bankAccountSelectOptions2:[],
      
    }
  },
  created() {
    this.select1= {
      change: (value, row) => {
        let obj = this.bankAccountSelectOptions1.find(item => {
          return item.settleUnitBankAcctId === value
        })
        console.log(row);
        row.payAccountShortName = obj.accountShortName
        row.payBankName = obj.bankName
        row.payAccountNo = obj.accountNo
        row.payAccountName = obj.accountName
        row.payCompName = obj.unitName
        row.payBankBranch = obj.bankBranch
        row.payBankCode = obj.bankCode
        row.payBankAccountId = obj.settleUnitBankAcctId
      }
    }
    this.select2 = {
      change: (value, row) => {
        let obj = this.bankAccountSelectOptions2.find(item => {
          return item.settleUnitBankAcctId === value
        })
        row.recvBankName = obj.bankName
        row.recvAccountNo = obj.accountNo
        row.recvCorpName = obj.unitName
        row.compBankAccountId = obj.settleUnitBankAcctId
      }
    }
    this.select3 = {
      change: (value, currency,payCompCode,obj) => {
        let payWay = value
        if(payWay === 'cash' || payWay === 'prepay_dedue'){
          payWay = ""
        }
        this.$store.dispatch('dict/bankAccountList', { "currency":currency,"unitCode":payCompCode,"countryOrgType":payWay}  ).then(res => {
          let payBank = res && res.length ? {
            payAccountShortName : res[0].accountShortName,
            payBankName : res[0].bankName,
            payAccountNo : res[0].accountNo,
            payAccountName : res[0].accountName,
            payCompName : res[0].unitName,
            payBankBranch : res[0].bankBranch,
            payBankCode : res[0].bankCode,
            payBankAccountId : res[0].settleUnitBankAcctId,
          } : {
            payAccountShortName : "",
            payBankName : "",
            payAccountNo : "",
            payAccountName : "",
            payCompName : "",
            payBankBranch : "",
            payBankCode :"",
            payBankAccountId :"",
          }
          Object.assign(obj,{},payBank)
        })
      }
    }
    this.source = this.$route.query.source
    this.billId = this.$route.query.billId
    if (this.source !== 'createSettlement') {
      this.financePageMargin = '0'
    }
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'paySettleDetail1',
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
      edit: true 
    })
    let columns = [
    ]
    this.option1.columns = columns

    let columns3 = [
      {
        prop: 'currency',
        label: '付款币种',
        type: 'text'
      },
      {
        prop: 'payStatus',
        label: '付款状态',
        type: 'select',
        propInDict:"payStatusType"
      },
      {
        prop: 'payOrderNo',
        label: '付款单号',
        width: 120,
        type: 'button',
        operationBtns: {
          show: true,
          callback: (fn, index, row) => {
            this.routerPush('OrderDetails', { payOrderNo:row.payOrderNo })
          },
        },
      },
      {
        prop: 'bankSeqNo',
        label: '银行流水',
        type: 'text',
      },
      {
        prop: 'confirmName',
        label: '付款人',
        type: 'text',
      },
      {
        prop: 'confirmTime',
        label: '付款时间',
        type: 'text',
      },
    ]
    this.option3 = Object.assign({}, this.option, {
      id: 'option3', $name: 'paySettleDetail3',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: false,
      operationBtns: {
        show: false
      },
    })
    this.option3.columns = columns3
    this.option2 = Object.assign({}, this.option,{
        id: 'option2', $name: 'paySettleDetail2',
        data: [],
        tips: {
          text: '',
          show: false
        },
        operationBtns: {
          show: false
        },
        selection:{
          show:false
        },
    })
   let columns2 = [
      {prop: 'invoiceNo', label: '发票号', type: 'text', key: 'invoiceNo'},
      {prop: 'invoiceType', label: '开票类型', type: 'select', key: 'invoiceType'},
      // {prop: 'title', label: '发票抬头', type: 'text', key: 'title'},
      // {prop: 'writeoffAmt', label: '已核销金额', type: 'text', key: 'writeoffAmt'},
      // {prop: 'lockAmt', label: '占用金额', type: 'text', key: 'lockAmt'},
      // {prop: 'remainingAmount', label: '剩余可用金额', type: 'text', key: 'remainingAmount', 
      //   formatter: (row, pItem) => {
      //     return row.amt - row.writeoffAmt - row.lockAmt
      //   }
      // },
      {prop: 'amt', label: '开票金额', type: 'text', key: 'amt'},
      {prop: 'currency', label: '开票币种', type: 'text', key: 'currency'},
      {prop: 'taxRate', label: '开票税率', type: 'select', key: 'taxRate',propInDict:'taxRateInfo'},
      {prop: 'rate', label: '发票汇率', type: 'text', key: 'rate'},
      {prop: 'taxAmt', label: '税额', type: 'text', key: 'taxAmt'},
      
    ]
    let arr2 = []
    columns2.forEach(value => {
      let obj2 = this.columnsBase.find(item => {
        return item.prop === value
      })
      if (obj2) arr2.push(obj2)
    })
    this.option2.columns = columns2
  },
  methods: {
    // 显示关联发票
    handleShow(row) {
      this.row = {
        'settleCompCode': row.payCompCode,
        'supplierCorpCode':row.recvCorpCode
      }
      this.getUsableList(row)
      this.relevanceOpne = true
    },
    //确认关联发票
    relevanceSubmit() {
      if (this.multipleSelection2.length === 0) {
        this.$message({
          message: '请勾选需要关联的发票！',
          type: 'error',
          showClose: true
        })
        return
      }
      this.option1.data[this.index].payInfoInvoiceList = this.multipleSelection2.map(item => {
        return {invoicePaymentId:item.invoicePaymentId}
      })
      if(this.multipleSelection2.length){
        this.$message({
          message: "已关联"+this.multipleSelection2.length + "项发票",
          type: 'success',
          showClose: true
        })
      }
      this.relevanceOpne = false
    },
    getUsableList(){
      let data ={
        'settleCompCode': this.row.settleCompCode,
        'supplierCorpCode':this.row.supplierCorpCode
      }
      let obj = this.searchOption1.data
      let keys = Object.keys(obj)
      keys.forEach(key => {
        let value = obj[key]
        if (value && value !== '') {
          data[key] = value
        }
      })
      usableList(data).then(res => {
        if (res.code === 0) {
          let list = res.data
          let data = []
          list.forEach(item => {
            data.push(item)
          })
          this.option2.data = data
        }
      })
    },
    bankAccountList(queryString, cb) {
      this.$store.dispatch('dict/bankAccountList', queryString ).then(data => {
        cb(data)
      })
    },
    getData(params) {
      if (this.applyNo.length) {
        let data = {
          "applyNo": this.applyNo
        }
        queryPayApplySettleInfo(data).then(res => {
          if (res.code === 0) {
            this.confirmStatus = res.data.confirmStatus
            this.handleData(res)
            let settleOrderNoList =[]
            res.data.payInfoList.map(item=>{
              item.settleOrderNoList.map(settleOrderNo=>{
                settleOrderNoList.push(settleOrderNo)
              })
            })
            // this.getList(settleOrderNoList)
          }
        }).catch(err=>{
          this.delVisitedView()
          this.cancel()
        })
      }
    },
    getList(settleOrderNos){
      settleOrderFeeStatistics({settleOrderNos}).then(res=>{
        this.statistics = res.data
      })
    },
    currencyChange(value) {
      this.getData({
        source: 'currency',
        currency: value
      })
    },
    handleData(res) {
      let payInfoList = res.data.payInfoList
      let payInfoInvoiceDtoList = res.data.payInfoInvoiceDtoList ? res.data.payInfoInvoiceDtoList :[]
      this.option3.data = res.data.payOrderList ? res.data.payOrderList :[]
      this.settlementDetailForm = res.data
      let data = []
      let list = []
      // 付款信息
      payInfoList.forEach(item => {
        item.payInfoInvoiceList = []
        item.edit = true
        data.push(item)
      })
      //发票信息
      payInfoInvoiceDtoList.forEach(item => {
        item.invoicePayment ? list.push(item.invoicePayment) : ''
      })
      this.option2.data = list
      this.payInfoList = data
      this.table1DataBackup = [
        ... this.option1.data
      ]
      this.settleOrderFeeIds = []
    },
     dictBankAccountList(data){
      this.$store.dispatch('dict/bankAccountList', { "currency":data.currency,"unitCode":data.payCorpCode}  ).then(res => {
        return res.length ? {
          payAccountShortName : res[0].accountShortName,
          payBankName : res[0].bankName,
          payAccountNo : res[0].accountNo,
          payAccountName : res[0].accountName,
          payCompName : res[0].unitName,
          payBankBranch : res[0].bankBranch,
          payBankCode : res[0].bankCode,
          payBankAccountId : res[0].settleUnitBankAcctId,
        } : {}
      })
    },
    cancel(refresh) {
      this.routerBack(refresh)
    },
    handleCancel(){
      this.relevanceOpne = false
      this.option1.data[this.index].settleOrderNo = this.option1.data[this.index].payInfoInvoices.length ? "yes" : 'no'
    },
    handleCancelRefuse(){
      this.rejectDialogVisible = false
      this.query.refuseReason = ''
      this.$refs.query.resetFields()
    },
    search() {
      let arr = this.option1.data.filter(item => {
        let patt1 = new RegExp(this.searchWords)
        if (patt1.test(item.feeName) || patt1.test(item.currency)) {
          return true
        }
      })
      this.option1.data = arr
      this.getUsableList()
    },
    clearSearch() {
      this.option1.data = this.table1DataBackup
    },
    handleDelete($index, row, option) {
      this.$confirm('是否确认删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.option1.data.forEach((item, index) => {
          if (item.feeId === row.feeId) {
            this.option1.data.splice(index, 1)
            this.settleOrderFeeIds.push(row.feeId)
            return
          }
        })
        // let arr = [row]
        // this.handleOrderBizFee(arr, 'delete')
      }).catch(() => {         
      })
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
      if (option === this.option3) this.multipleSelection3 = data
    },
    handleApplyFor(state){
      // for (let i = 0; i < this.option1.data.length; i++) {
      //   if(!this.option1.data[i].payAccountNo){
      //     this.$message({  message: '付款账号不能为空',  type: 'error',  showClose: true })
      //     return
      //   }
      // }
      let data = {
        applyNo: this.applyNo,
        confirmStatus :  state,
        refuseReason :  this.query.refuseReason,
        payInfoList : this.payInfoList
      }
      if(state==="pass"){
        this.$confirm('您确定要审核通过结算付款申请吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          lockScroll: "true",
          type: "warning"
        }).then(()=> {
          return approvePayApplySettle(data);
        }).then(() => {
          this.query.refuseReason = ''
          this.$message({message: '审核通过提交成功', type: 'success'});
          this.cancel(true)
        }).catch(function() {});
      }else{
        this.rejectDialogVisible = true
      }
    },
    rejectSubmit(state) {
      let data = {
        applyNo: this.applyNo,
        confirmStatus :  state,
        refuseReason :  this.query.refuseReason,
        payInfoList : this.option1.data
      }
      this.$refs.query.validate(valid => {
        if (valid) {
          approvePayApplySettle(data).then(res=>{
            this.$message({message: '拒绝申请提交成功', type: 'success'});
            this.rejectDialogVisible = false
            this.handleCancelRefuse()
            this.cancel(true)
          })
        }
      })
    },
    init() {
      this.applyNo = this.$route.query.applyNo
      this.disabled = this.confirmStatus ? true : false 
    },
    
    //  付款银行简称
    bankAccountList1(queryString,row) {
      let payWay = row.payWay
      if(payWay === 'cash' || payWay === 'prepay_dedue'){
        payWay = ""
      }
      this.$store.dispatch('dict/bankAccountList', {queryString, "currency":row.currency,"unitCode":row.payCompCode,"countryOrgType":payWay}  ).then(res => {
        console.log(res);
        let list = res && res.length ? res : []
        this.bankAccountSelectOptions1 = list.map(item => {
          item.value = item.settleUnitBankAcctId
          item.label = item.accountShortName
          return item
        })
      })
    },
    
    bankAccountList2(queryString,row) {
      this.$store.dispatch('dict/bankAccountList', {queryString, "currency":row.currency,"unitCode":row.recvCorpCode}  ).then(res => {
        console.log(res);
        let list = res ? res : []
        this.bankAccountSelectOptions2 = list.map(item => {
          item.value = item.settleUnitBankAcctId
          item.label = item.accountNo
          return item
        })
      })
    },
    // //收款银行改变
    // bankAccountChange(value) {
    //   let obj = this.bankAccountSelectOptions.find(item => {
    //     return item.settleUnitBankAcctId === value
    //   })
    //   // this.addRegForm.bankName = obj.bankName
    //   // this.addRegForm.accountNo = obj.accountNo
    //   // this.addRegForm.accountShortName = obj.accountShortName
    //   // this.addRegForm.compBankAccountId = obj.settleUnitBankAcctId
    // },
    // queryAllBankAccountList(queryString) {
    //   let data = {
    //     "accountName": queryString
    //   }
    //   queryAllBankAccountList(data).then(res => {
    //     if (res.code === 0) {
    //       this.bankAccountSelectOptions2 = res.data.map(item => {
    //         item.value = item.settleUnitBankAcctId
    //         item.label = item.accountName
    //         return item
    //       })
    //     }
    //   })
    // },
  },
  activated() {
    if (!this.$route.meta.isUseCache) {
    }
    this.init()
    this.getData()
  },
  computed: {
    ... mapGetters(['dictMap']),
    confirmStatusType() {
      let finTypeObj = this.dictMap['auditStatus'].find((item) => item.value === this.settlementDetailForm.confirmStatus)
      return finTypeObj && finTypeObj['label']
    },
  },
  watch:{
    // 'payInfoList': {
    //   handler(newVal, oldVal) {
    //     if (newVal && newVal.length === 0 ) {
    //       return
    //     }
    //     if (++ this.watchOption1DataTime === 1) {
    //       return
    //     }
    //     clearTimeout(this.timer1)
    //     this.timer1 = setTimeout(() => {
    //       if(this.confirmStatus !== 'pending'){  return }
    //       this.payInfoList.forEach(item => {
    //         if(item.payAccountShortName){return}
    //         this.$store.dispatch('dict/bankAccountList', { "currency":item.currency,"unitCode":item.payCorpCode}  ).then(res => {
    //           let payBank = res.length ? {
    //             payAccountShortName : res[0].accountShortName,
    //             payBankName : res[0].bankName,
    //             payAccountNo : res[0].accountNo,
    //             payAccountName : res[0].accountName,
    //             payCompName : res[0].unitName,
    //             payBankBranch : res[0].bankBranch,
    //             payBankCode : res[0].bankCode,
    //             payBankAccountId : res[0].settleUnitBankAcctId,
    //           } : {}
    //           Object.assign(item,{},payBank)
    //         })
    //       })
    //     }, 500)
    //   },
    //   deep: true
    // }
  },
  components: {
    FinanceTable,
    FinanceSearch
  },
}
</script>
<style scoped>
.settle-detail{
  padding:10px;
}
.finance-page-background{
  background: #FFF;
}
.money-box-border-bottom{
  border-bottom: 1px solid #E9E9E9;
}
.el-form-item{
  width: 248px;
  margin-bottom: 7px;
  margin-right: 16px;
}
.el-form-item-text{
  font-size: 12px;
  /* width: 180px; */
}
.detail-info-item-1{
  display: block;
  min-width: 248px;
  margin-bottom: -4px;
  margin-right: 16px;
}
/* .settlement-detail-form{
  padding: 16px 16px 0 16px;
} */
.settlement-detail-form .el-form-item{
  margin-bottom: -6px;
}
.settlement-detail-form-1{
  padding-bottom:16px;
  border-bottom: 1px solid #D8D8D8 !important;
}
.settlement-exchange-rates{
  width:260px;
  display:inline-block;
  margin-right: 24px;
  vertical-align: top;
}
.settlement-exchange-rates .settlement-exchange-rates-title{
color: #222222;
line-height: 28px;
}
.settle-detail .el-textarea{
  width: 200%;
}
.settle-detail .money-title-1{
  font-size: 12px;
  color: #222222;
  line-height: 14px;
  padding-top: 8px;
  margin-right: 20px;
}
</style>