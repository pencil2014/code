<template>
  <div class="finance-tab-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
    <div v-if="!dialogVisible"  class="finance-receivable-reg-list">
      <FinanceSearch
        :searchOption="searchOption1"
        @search="search"/>
      <div class="finance-search-list-gap"></div>
      <div class="finance-list-container">
        <div class="money-box">
          <div class="money-box-left">
            <el-button-group>
              <el-button type="success" class="finance-btn" v-if="checkAuth($route.name, 'tab-payApplyReceiveRefund', 'btn-payApplyReceiveRefundPass')" @click="handleApplyFor('pass')" size="mini">{{$t('PayApplyList.passApply')}}</el-button>
            </el-button-group>
            <el-button-group>
              <el-button  type="danger" class="finance-btn" v-if="checkAuth($route.name, 'tab-payApplyReceiveRefund', 'btn-payApplyReceiveRefundRefuse')" @click="handleApplyFor('refuse')" size="mini">{{$t('PayApplyList.refuseApply')}}</el-button>
            </el-button-group>
            <el-button-group>
              <el-button class="finance-btn"  size="mini" @click="handleCancelPayApply" type="purple"  v-if="checkAuth($route.name, 'tab-payApplyReceiveRefund', 'btn-handleCancelPayApply')"
              >{{$t('PayApplyList.cancelApply')}}</el-button
            >
            </el-button-group>
            <el-button-group>
						<el-button class="finance-btn" size="mini" @click="handlePrint" v-if="checkAuth($route.name, 'tab-payApplyReceiveRefund', 'btn-handlePrint')"
                >{{$t('PayApplyList.print')}}</el-button
              >
            </el-button-group>
          </div>
          <div class="money-box-right">
            <el-button-group>
              <el-button
                class="finance-btn"
                @click="refreshListPage"
                size="mini"
                type="primary"
              >{{$t('OrderFee.refresh')}}</el-button>
            </el-button-group>
          </div>
        </div>
        <FinanceTableMass
          :option="option1"
          @send-multi="sendMulti"/>
      </div>
    </div>
    <div v-if="dialogVisible">
      <component
      :is="component"
      :receivable-reg-id="receivableRegId"
      :receivable-reg-id-prop="receivableRegId"
      :pay-apply-receive-refund-id="applyNo" 
      @close-invoice-detail="closeInvoiceDetail"/>
    </div>
    <el-dialog
      :title="$t('OrderFee.notPassed')"
      :visible.sync="refuseOpen"
      width="600px">
      <el-form :model="formQuery" ref="formQuery" label-width="110px" class="el-form-item-payapply-remark" required>
        <el-form-item :label="$t('OrderFee.refuseReason')"
          prop="refuseReason"
          :rules="{required: true, message: ' ', trigger: 'blur'}">
          <el-input type="textarea" :placeholder="$t('OrderFee.plsInput')" maxlength="200" show-word-limit v-model="formQuery.refuseReason"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" :loading='loadingSubmit' @click="handleSubmit" size="mini">{{$t('OrderFee.confirm')}}</el-button>
        <el-button @click="refuseOpen = false" size="mini">{{$t('OrderFee.cancel')}}</el-button>
      </span>
    </el-dialog>

    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{ key: 'prop', label: 'label' }"
        @close="customColumnsPopClose"
      />
    </div>
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { mapState } from 'vuex'
import CustomColumns from '@/components/customColumns/index'
import { billList, customerConfirm } from '@/api/fin/bill'
import { listPage, createPaperInvoiceBatch, close } from '@/api/fin/invoiceReceivableApply'
import { payApplyReceiveRefundListPage, payApplyReceiveRefundConfirm, getPayListAmtSummary, payApplyReceiveRefundCancel } from '@/api/fin/receivableReg'
import { regTransferListPage, regTransferConfirm } from '@/api/fin/receivableReg'
import { print } from '@/api/fin/invoiceReceivable'
import  RefundDetail  from './components/refundDetail'
import { dateFormat } from '@/views/finance/utils/finance'
export default {
  props:['isJumpRouteFromPage'],
  mixins: [mixin, mixin2],
  data() {
    return {
      pageSizeUrl: payApplyReceiveRefundListPage('geturl'),
      keyDownActive: true,
      loadingSubmit:false,
      //?????????????????????
      searchBackup:[],
      component:'',
      receivableRegTransferId:[],
      applyNo:'',
      receivableRegId:-1,
      refuseOpen:false,
      formQuery:{
        payApplyReceiveRefundIds:[],
        confirmStatus: "",
        refuseReason: ""
      },
      rejectDialogVisible:false,
      option1: {},
      option2: {},
      searchOption1: {},
      table1DataBackup: [],
      table2DataBackup: [],
      isAddPay: false,
      multipleSelection1: [],
      multipleSelection2: [],
      form: {
        orderNo: '',
        creationDate: '',
        billNo: '',
        settleCorpName: '',
        settleCorpCode: ''
      },
      orderNo: '',
      autocomplete: {
      },
      selectedOptionItem: '',
      dialogVisible: false,
      loading: false,
      //???????????????
      selfColumnsBase:[
        {
          prop: 'applyNo',
          label: this.$t('PayApplyList.refundApplyNo'), // '??????????????????',
          type: 'button',
          width:'155px',
          action: 'showAttachment',
          operationBtns:??{
          show:??true,
            callback:??(action,??$index,??row,??option)??=>??{
              if??(action??===??'showAttachment')??{
                this.showDetail(row)
              }
            }
          }
        },
        {
          prop: 'settleCorpName',
          label: this.$t('OrderFee.settleCorpName'), // '????????????',
          width: 150,
          type: 'text',
        },
        {
          prop: 'receivableRegNo',
          label: this.$t('PayApplyList.receivableRegNo'), // '???????????????',
          type: 'button',
          width:'155px',
          action: 'showAttachment',
          operationBtns:??{
            show:??true,
            callback:??(action,??$index,??row,??option)??=>??{
              if??(action??===??'showAttachment')??{
                this.$emit('update:isJumpRouteFromPage', true)
                let query = {
                  source: 'createSettlementFromReceivableRegId',
                  receivableRegId:row.receivableRegId
                }
                this.$router.push({
                  name: 'WriteoffRecvDetail',
                  query
                })
              }
            }
          }
        },
        {
          prop: 'realRefundAmt',
          label: this.$t('PayApplyList.realRefundAmt'), // '????????????',
          type: 'text',
          width: 140
        },
        {
          prop: 'refundCurrency',
          label: this.$t('PayApplyList.refundCurrency'), // '????????????',
          type: 'text',
          width: 120
        },
        {
          prop: 'confirmStatus',
          label: this.$t('OrderFee.approvalStatus'), // '????????????',
          type: 'select',
          // propInDict:"confirmStatus"
          formatter:({row})=>{
            const val = this.dictMapObj.confirmStatus[row.confirmStatus]
            if (row.confirmStatus === 'pass') {
              return '<span style="color:#33B18A">'+val+'</span>'
            } else if (row.confirmStatus === 'refuse') {
              return '<span style="color:#CD4130">'+val+'</span>'
            } else if (row.confirmStatus === 'pending') {
              return '<span style="color:#EDB534">'+val+'</span>'
            } else {
              return val
            }
          },
          width: 120
        },
        {
          prop: 'payStatus',
          label: this.$t('PayApplyList.refundPayStatus'), // '??????????????????',
          type: 'select',
          width:'110px',
          // propInDict:"payStatusType"
          formatter:({row})=>{
            const val = this.dictMapObj.payStatusType[row.payStatus]
            const status = row.payStatus
            if (status === 'pay_done') {
              return '<span style="color:#33B18A">'+val+'</span>'
            } else if (status === 'no_pay') {
              return '<span style="color:#CD4130">'+val+'</span>'
            } else if (status === 'paying') {
              return '<span style="color:#EDB534">'+val+'</span>'
            } else {
              return val
            }
          },
          width: 145
        },
        {
          prop: 'payOrderConfirmStatus',
          label: this.$t('PayApplyList.refundPayApprovalSt'), // '??????????????????',
          type: 'select',
          width: 150,
          propInDict:"auditStatus"
        },
        {
          prop: 'refundType',
          label: this.$t('PayApplyList.refundType'), // '????????????',
          type: 'select',
          propInDict:"refundType",
          width: 100
        },
        {
          prop: 'recvBankName',
          label: this.$t('PayApplyList.recvBankName'), // '??????????????????',
          width: 120,
          type: 'text',
        },
        {
          prop: 'recvAccountName',
          label: this.$t('PayApplyList.recvAccountName'), // '??????????????????',
          width: 145,
          type: 'text',
        },
        {
          prop: 'recvAccountPublicType',
          label: this.$t('PayApplyList.custAccountType'), // '??????????????????',
          width: 145,
          type: 'select',
          propInDict:"accountType"
        },
        {
          prop: 'recvAccountNo',
          label: this.$t('PayApplyList.recvAccountNo'), // '??????????????????',
          width: 140,
          type: 'text',
        },
        {
          prop: 'payOrderNo',
          label: this.$t('PayApplyList.associatePayNo'), // '??????????????????',
          type: 'columnTip',
          width: 155,
          component: 'ColumnTip',
          componentProps:??{
            show: false,
            callback:??(no, componentProps, index)??=>??{
                console.log(no);
                this.$emit('update:isJumpRouteFromPage', true)
                let query = {
                  payOrderNo: no,
                }
                this.$router.push({
                  name: 'OrderDetails',
                  query
                })
            }
          }
        },
        {
          prop: 'transferChargeType',
          label: this.$t('PayApplyList.handlingFeeBearersType'), // '????????????????????????',
          width: 150,
          type: 'select',
          propInDict:"changeType"
        },
        {
          prop: 'transferChargerName',
          label: this.$t('PayApplyList.handlingFeeBearers'), // '??????????????????',
          width: 140,
          type: 'text',
        },
        {
          prop: 'transferFeeAmt',
          label: this.$t('PayApplyList.handlingFee'), // '?????????',
          type: 'text',
          width: 100
        },
        {
          prop: 'transferFeeRealAmt',
          label: this.$t('PayApplyList.actualHandlingFee'), // '?????????????????????',
          width: 130,
          type: 'text',
        },
        {
          prop: 'printCount',
          label: this.$t('PayApplyList.printCount'), // '????????????',
          type: 'text',
        },
        {
          prop: 'printTime',
          label: this.$t('PayApplyList.printTime'), // '????????????',
          type: 'text',
          width: 135,
        },
        {
          prop: 'createdName',
          label: this.$t('PayApplyList.createdName'), // '?????????',
          width: 100,
          type: 'text',
        },
        {
          prop: 'createdTime',
          label: this.$t('PayApplyList.createdTime'), // '????????????',
          type: 'text',
          width: 125,
        },
        {
          prop: 'confirmName',
          label: this.$t('PayApplyList.approver'), // '?????????',
          type: 'text',
          width: 100,
        },
        {
          prop: 'confirmTime',
          label: this.$t('PayApplyList.approvalTime'), // '????????????',
          type: 'text',
          width: 125,
        },
        {
          prop: 'payDate',
          label: this.$t('PayApplyList.payDate'), // '????????????',
          type: 'text',
          width: 125,
        },
      ]
    }
  },
  created() {
    this.searchOption1 = {
      saveShow:??true,
      saveName:??'PayApplyReceiveRefundList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter:{
        // ?????????????????????
        defaultSearchLength: 7,
        // ????????????
        searchInputGroup: [
          { key: 'allNo', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'settleCorpCode', value: '', showType: '2', range: { min: '', max: '' } },
          { key: 'refundCurrency', value: '', showType: '3', range: { min: '', max: '' } },
          { key: 'confirmStatus', value: '', showType: '4', range: { min: '', max: '' } },
          { key: 'realRefundAmt', value: '', showType: '5', range: { min: '', max: '' } },
          { key: 'recvBankName', value: '', showType: '6', range: { min: '', max: '' } },
          { key: 'createdTime', value: '', showType: '7', range: { min: '', max: '' } },
        ],
        filterGroups: {
          //1
          allNo: { label: this.$t('PayApplyList.allNo'), type: 'input', placeholder: this.$t('OrderFee.plsInput'), showType: '1' }, // '????????????', ????????????????????????????????????
          applyNo: { label: this.$t('PayApplyList.refundApplyNo'),  type: 'input',  showType: '1'  }, // '???????????????'
          receivableRegNo: { label: this.$t('PayApplyList.receivableRegNo'),  type: 'input',  showType: '1'}, // '???????????????'
          payOrderNo: { label: this.$t('PayApplyList.associatePayNo'),  type: 'input',  showType: '1'}, // '??????????????????'
          //2
          settleCorpCode: {
            label: this.$t('PayApplyList.settleCorpName'), // '????????????',
            type: 'remoteSelect',
            showType: '2',
            remote: true,
            multiple:true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({queryString,'unitTypes':'customer,supplier,company'}, item)
            },
            visibleChange: (queryString, item, row) => {
             this.querySettleUnit2({queryString,'unitTypes':'customer,supplier,company'}, item)  
            },
            remoteSelectList: []
          },
          //3
          refundCurrency: {  label: this.$t('PayApplyList.refundCurrency'),  type: 'select', selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'), showType: '3'  }, // '??????'
          
          //4
          confirmStatus: {  label: this.$t('OrderFee.approvalStatus'),  type: 'select', prop:"confirmStatus", multiple:true, showType: '4'  }, // '????????????'
          refundType: {  label: this.$t('PayApplyList.refundType'),  type: 'select', prop:"refundType", multiple:true, showType: '4'  }, // '????????????'
          payStatus: {  label: this.$t('PayApplyList.refundPayStatus'),  type: 'select', prop:"payStatusType", multiple:true, showType: '4'  }, // '??????????????????'
          payOrderConfirmStatus: {  label: this.$t('PayApplyList.refundPayApprovalSt'),  type: 'select', prop:"auditStatus", showType: '4'  }, // '??????????????????'
          
          //5
          realRefundAmt: {  label: this.$t('PayApplyList.realRefundAmt'),  type: 'range',  showType: '5'  }, // '????????????'
          //6
          recvBankName: {  label: this.$t('PayApplyList.recvBankName'),  type: 'input',  showType: '6'  }, // '????????????'
          recvAccountName: {  label: this.$t('PayApplyList.recvAccountName'),  type: 'input',  showType: '6'  }, // '????????????'
          recvAccountNo: {  label: this.$t('PayApplyList.recvAccountNo'),  type: 'input',  showType: '6'  }, // '????????????'
          //7
          createdTime: {  label: this.$t('PayApplyList.createdTime'),  type: 'daterange',  showType: '7', format: 'yyyy-MM-dd'}, // '????????????'
          createdName: {  label: this.$t('PayApplyList.createdName'),  type: 'input',  showType: '7'  }, // '?????????'
          confirmTime: {  label: this.$t('OrderFee.approvalTime'),  type: 'daterange',  showType: '7', format: 'yyyy-MM-dd'}, // '????????????'
          confirmName: {  label: this.$t('OrderFee.approver'),  type: 'input',  showType: '7'  }, // '?????????'
          payDate: { label: this.$t('PayApplyList.payDate'),  type: 'daterange',  showType: '7', format: 'yyyy-MM-dd'}, // '????????????'
        },
      }
    }
    let _this = this
    this.autocomplete = {
      querySearch: (queryString, cb) => {
        _this.selectedOptionItem = ''
        _this.querySettleUnit(queryString, cb)
      },
      select: (optionItem, row) => {
        _this.selectedOptionItem = optionItem
        _this.form.settleCorpName = optionItem.value
        _this.form.settleCorpCode = optionItem.key
      },
      change: (val, row) => {
        // ??????150ms??????select????????????
        setTimeout(() => {
            if (_this.selectedOptionItem === '') {
              _this.form.settleCorpName = ''
              _this.form.settleCorpCode = ''
              return
            }
        }, 150)
      }
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: this.$t('OrderFee.detail'), // '??????',
          type: 'text',
          showFn: ()=> this.checkAuth(this.$route.name, 'tab-payApplyReceiveRefund', 'btn-detail'),
          action: 'showDetail'
        }
      ]
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'payApplyReceiveRefund',
      data: [
        ... this.option.data
      ],
      tips: {
        text: '',
        show: false
      },
      customColumns: {
        show: true,
        handleCustomColumns: ()=> this.handleCustomColumns()
      },
      operationBtns,
      pagination,
      listAmtSummary,
      maxHeight: this.getFinanceTableMaxHeight,
      emptyText: this.$t('OrderFee.showAfterQuery'), // '???????????????????????????',
    })
    let columns = [...this.selfColumnsBase]
		this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
		// console.log(this.configColumns)
		this.selfColumnsBase.forEach((item) => (item.sortable = true))
		this.option1.columns = columns
  },
  methods: {
    handleSizeChange(val){
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val){
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    handleApplyFor(confirmStatus) {
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: this.$t('OrderFee.selectRow'), // '???????????????'+( confirmStatus=='pass'?"????????????":'????????????' )+'?????????',
          type: 'error',
          showClose: true
        })
        return
      }
      this.formQuery.payApplyReceiveRefundIds = this.multipleSelection1.map(item => {
        return item.payApplyReceiveRefundId
      })
      let applyNo = this.multipleSelection1.map(item => {
        return item.applyNo
      })
      if(confirmStatus ==="pass" ){
        this.formQuery.confirmStatus=confirmStatus
        this.formQuery.refuseReason=''
        this.$confirm(this.$t('OrderFee.confirmPassApply'), this.$t('OrderFee.tip'), { // '????????????????????????????', "????????????"
          confirmButtonText: this.$t('OrderFee.confirm'),
          cancelButtonText: this.$t('OrderFee.cancel'),
          lockScroll: "true",
          type: "warning"
        }).then(()=> {
            return payApplyReceiveRefundConfirm(this.formQuery);
        }).then(() => {
          this.$message({message: this.$t('OrderFee.successOp'), type: 'success'}); // '????????????????????????'
          this.getData()
        }).catch(function() {});
        
      }else if(confirmStatus  ==='refuse'){
        this.refuseOpen = true
        this.formQuery.refuseReason=''
        this.formQuery.confirmStatus=confirmStatus
      }
    },
    querySettleUnit(queryString, cb) {
      this.$store.dispatch('dict/querySettleUnit', queryString ? queryString : '').then(data => {
        cb(data)
      })
    },
    querySettleUnit1(queryString, cb) {
      this.$store.dispatch('dict/currencyList', queryString ? queryString : '').then(data => {
        cb(data)
      })
    },
    getData(params,isSearch) {
      this.loading = true
      let data ={
        "currPage": this.option1.pagination.currPage,
        "pageSize": this.option1.pagination.pageSize,
        "columns":[],
        "ascColumns": params && params.order === 'ascending' ? [params.prop] : [],
        "descColumns": params && params.order === 'descending' ? [params.prop] : [],
        "query":[]
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption1, true, true)
      // let filterGroups = this.searchOption1.addFilter.filterGroups
      // this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
      //   let { key, value, range, req, valueReq } = item
      //   if (range && (range.min || range.max)) {
      //     range.min && data.query.push({ column: key, type: 'ge', value: range.min, })
      //     range.max && data.query.push({ column: key, type: 'le', value: range.max, })
      //     return
      //   }
      //   if (valueReq && item[valueReq]) {
      //     data.query.push({ column: valueReq, type: 'eq', value: item[valueReq],          })
      //     return
      //   }
      //   if (value) {
      //     if (value instanceof Array) {
      //       if (value.length === 0) {
      //         return
      //       }
      //       if (key === 'createdTime' || key === 'updatedTime' || key === 'issueTime') {
      //         data.query.push({
      //           column: key + 'Start',
      //           type: 'eq',
      //           value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00',
      //         })
      //         data.query.push({
      //           column: key + 'End',
      //           type: 'eq',
      //           value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59',
      //         })
      //       }
      //       if (key === 'refundType' || key === 'confirmStatus' || key === 'payStatus' || key === 'settleCorpCode') {
      //         if (!value.length) return
      //         data.query.push({
      //           column: key,
      //           type: 'in',
      //           value: value.join(','),
      //         })
      //       }
      //       if (key === 'deptCode') {
      //         data.query.push({
      //           column: 'deptCode',
      //           type: 'default',
      //           value: value[value.length - 1],
      //         })
      //       }
      //     } else {
      //       data.query.push({
      //         column: key,
      //         type: filterGroups[key].type === 'input' ? 'like' : 'eq',
      //         value: req || value,
      //       })
      //     }
      //   }
      // })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      payApplyReceiveRefundListPage(data).then(res => {
        if (res.code === 0) {
          this.finCommonColumns(res)
          // if (res.data.configColumns && res.data.configColumns.length) {
          //   let columns = res.data.configColumns
          //   this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
          //   this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
          //   this.configColumns = res.data.configColumns
          // }
          
          let { list } = res.data
          let data = []
          list.forEach(item => {
            item.payOrderNo_multiValue = item.payOrderNo.split(',')
            data.push(item)
          })
          this.option1.data = data
          this.table1DataBackup = [
            ... this.option1.data
          ]
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        }
      }).finally(() => {
				this.loading = false
			})
      // this.debounceLs(() => {
      //   this.getListAmtSummary(data)
      // })
    },
    //??????????????????
    getListAmtSummary(data) {
      getPayListAmtSummary(data).then(res => {
        if (res.code === 0 && res.data) {
          let labelObj = {
            realRefundAmtListLabel: this.$t('PayApplyList.realRefundAmt'), // '????????????',
          }
          let colorObj = {
            realRefundAmtListColor: 'green', // ??????red, green, black?????????
          }
          let data = res.data
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj
          })
        }
      })
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
      let data2 = {
				"ascColumns": [],
				"descColumns": [],
				"query": []
			}
			let ids = this.multipleSelection1.map(item => {
				return item.payApplyReceiveRefundId
			}).join(',')
			if (ids) {
				data2.query.push({
					"column": "payApplyReceiveRefundIds",
					"type": "eq",
					"value": ids
        })
			} else {
				data2.query = this.searchBackup || []
			}
			if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => {
          this.getListAmtSummary(data2)
        })
      }
    },
   
    search(data,index) {
      this.buttonSearch = data
      this.option1.pagination.currPage = 1
      this.getData(null, true)
      if (index || index === 0) {
        this.rightFilterBtns = [false, false, false]
        this.rightFilterBtns[index] = true
      }
    },
    showDetail(row) {
      this.$emit('update:isJumpRouteFromPage', true)
      let query = {
        payApplyReceiveRefundId : row.payApplyReceiveRefundId,
      }
      this.$router.push({
        name: 'RefundDetail',
        query
      })
    },
    handleSubmit() {
      this.$refs.formQuery.validate(valid => {
        if (valid) {
          this.loadingSubmit = true
          payApplyReceiveRefundConfirm(this.formQuery).then(res=>{
            this.$message({message: this.$t('OrderFee.successOp'), type: 'success'}); // '????????????????????????'
            this.refuseOpen = false
            this.getData()
          }).finally(()=>{
            this.loadingSubmit = false
          })
        }
      })
    },
    closeInvoiceDetail() {
      this.dialogVisible = false
    },
    // ???????????????
		handleCustomColumns () {
			this.customColumnsPopShow = true
		},
    //????????????
    handleCancelPayApply(){
      let len = this.multipleSelection1
      if (len.length === 0) {
        return this.$msgErrClose(this.$t('OrderFee.selectRow')) // '????????????????????????????????????'
      }
      for (let i = 0; i < len.length; i++) {
        if(len[i].confirmStatus !== 'pending'){
          return this.$msgErrClose(this.$t('PayApplyList.containNonpending')) // '????????????????????????????????????????????????????????????'
        }
        // if(len[i].payStatus !== 'paying' && len[i].payStatus !== 'pay_done'){
        //   return this.$msgErrClose('??????????????????????????????????????????????????????????????????')
        // }
      }
      let payApplyReceiveRefundIds = len.map(item=>{
        return item.payApplyReceiveRefundId
      })
      let data = {
        payApplyReceiveRefundIds
      }
      this.$confirm(this.$t('OrderFee.confirmCancelApply'), this.$t('OrderFee.tip'), { // '???????????????????????????', this.$t('Common.tips')
        confirmButtonText: this.$t('OrderFee.confirm'),
        cancelButtonText: this.$t('OrderFee.cancel'),
        cancelButtonClass: 'btn-custom-cancel',
        type: 'warning'
      }).then(() => {
        payApplyReceiveRefundCancel(data).then(res=>{
          this.$message({message: this.$t('OrderFee.successOp'), type: 'success'}); // '??????????????????'
          this.getData()
        })
      })
    },
    // ??????
		handlePrint () {
			let len = this.multipleSelection1.length
			if (!len) {
				return this.$msgErrClose(this.$t('OrderFee.selectOneRow')) // '????????????1??????????????????????????????'
			}
			if (len > 1) {
				return this.$msgErrClose(this.$t('OrderFee.selectOneRow')) // '??????????????????1??????????????????????????????????????????'
			}
			this.$emit('update:isJumpRouteFromPage', true)
			let payApplyReceiveRefundIds = this.multipleSelection1[0].payApplyReceiveRefundId
			this.$router.push({
				name: "PayRefundPrint",
				query: { payApplyReceiveRefundIds }
			})
		},
  },
  activated() {
    if (!this.$route.meta.isUseCache) {
      this.getData()
    }
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      role: state => state.user.role,
      bdRoles: state => state.user.bdRoles,
      opRoles: state => state.user.opRoles,
    }),
  },
  watch: {
    isJumpRouteFromPage:{
      handler(val){
        if(!val){
          this.$nextTick(()=>{
            this.getData()
          })
        }
      },
      // immediate: true
    }
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    RefundDetail,
    CustomColumns
  }
}
</script>
<style scoped>
.batch-print-create .el-dialog__body {
  padding: 40px 80px 22px;
}
.batch-print-create .el-dialog__footer{
  padding-bottom: 32px;
  text-align: center;
}
.batch-print-create .el-form .el-input{
  width: 320px;
}
.manual-regist-invoice .el-form .el-date-editor.el-input{
  width: 162px;
}
.manual-regist-invoice .el-form .el-select{
  width: 162px;
}
.finance-receivable-reg-list .finance-table .el-button + .el-button {
  margin-left: 0;
}

.finance-receivable-reg-list .el-form-item {
  margin-bottom: 6px;
}

</style>
<style>
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
.btn-custom-cancel {
  float: right;
  margin-left: 10px;
}
</style>