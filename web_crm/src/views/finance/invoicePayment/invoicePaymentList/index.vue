<template>
  <div class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button type="primary" class="finance-btn" v-if="checkAuth(this.$route.name, 'btn-addInvoice')" @click="identifyElecInvoice" size="mini">电子发票识别</el-button>
          </el-button-group>
          <el-button-group>
            <el-button type="primary" class="finance-btn" v-if="checkAuth(this.$route.name, 'btn-addInvoice')" @click="addInvoice" size="mini">发票登记</el-button>
          </el-button-group>
          <el-button-group>
            <el-button type="primary" class="finance-btn" v-if="checkAuth(this.$route.name, 'btn-financeReceive')" @click="financeReceive('yes')" size="mini">签收发票</el-button>
          </el-button-group>
          <el-button-group>
            <el-button type="purple" class="finance-btn" v-if="checkAuth(this.$route.name, 'btn-financeReceive')" @click="financeReceive('no')" size="mini">撤回签收发票</el-button>
          </el-button-group>
          <el-button-group>
            <!-- <el-button class="finance-btn" size="mini">发起请款-删除，不需要做</el-button> -->
            <el-button class="finance-btn" v-if="checkAuth(this.$route.name, 'btn-openRelatePayInfoDialog')" @click="openRelatePayInfoDialog" size="mini">关联请款单</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" v-if="checkAuth(this.$route.name, 'handleDownLoadInvoice')" @click="handleDownLoadInvoice" size="mini">批量下载发票</el-button>
          </el-button-group>
          <el-button-group>
						<el-button class="finance-btn" v-if="checkAuth(this.$route.name, 'btn-handleExport')" @click="handleExport" size="mini"
							>导出</el-button
						>
					</el-button-group>
          <el-button-group>
            <el-button class="finance-btn" v-if="checkAuth(this.$route.name, 'btn-printInvoicePay')" @click="printInvoicePay" size="mini">打印发票</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" v-if="checkAuth(this.$route.name, 'btn-uploadCheckInvoiceImg')" @click="handleUploadCheckInvoiceImg" size="mini">上传发票查验件</el-button>
          </el-button-group>
          <el-button-group>
            <el-button type="danger" class="finance-btn" v-if="checkAuth(this.$route.name, 'btn-delInovice')" @click="delInovice" size="mini">删除发票</el-button>
          </el-button-group>
          <!-- <el-button-group>
            <el-button class="finance-btn" v-if="checkAuth(this.$route.name, 'btn-uploadInvoiceImg')" @click="uploadInvoiceImg" size="mini">批量上传发票</el-button>
          </el-button-group> -->
          <el-button-group v-if="checkAuth(this.$route.name, 'btn-uploadInvoiceImg')">
            <div class="finance-btn select-template-box">
              <el-dropdown trigger="click" @command="uploadInvoiceImg">
                <span class="el-dropdown-link">
                  批量上传发票<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="(item, index) in pushUploadInvoiceList" :key="'pushUploadInvoiceList' + index"
                    :command="item">
                    {{item.label}}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="refreshListPage"
              size="mini"
              type="primary"
            >刷新</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <RelatePayInfoDialog
      :row-data="rowData"
      :invoice-payment-id="invoicePaymentId"
      :dialog-visible="relatePayInfoVisible"
      @relateSuc="getData"
    />
    <RegisterInvoice :invoicePaymentAddForm="invoicePaymentAddForm" :dialogVisibleInvoice="dialogVisibleInvoice"  @close-dialog-visible='closeDialogVisible' />
    <PreviewDialog :dialogOption="previewDialog" @generate="batchPrintCreate" />
    <div class="cancel-invoice-receivable-form">
      <el-dialog :title="'标记财务已收'" :visible.sync="dialogVisible" width="604px">
        <div>
          <el-form
            :model="financeReceiveForm"
            ref="financeReceiveForm"
            label-width="120px"
            size="mini"
            :rules="financeReceiveRules"
          >
            <el-form-item label="已选发票：" prop="invoicePaymentIds">
              <div class="el-form-item-text" v-html="financeReceiveForm.invoiceNos"></div>
            </el-form-item>
            <!-- <el-form-item label="登记号前缀" prop="receiveNoPrefix">
              <el-select v-model="financeReceiveForm.receiveNoPrefix" placeholder="请选择登记号前缀">
                <el-option
                  v-for="item in ['01','02','03','04','05']"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="当前序号" prop="receiveNoSn">
              <el-input v-model="financeReceiveForm.receiveNoSn" placeholder="请输入当前序号"></el-input>
            </el-form-item> -->
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" size="mini" @click="receiveConfirm">确定</el-button>
          <el-button size="mini" @click="dialogVisible = !dialogVisible">取消</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 自定义表头 -->
    <div v-if="customColumnsPopShow">
    <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{ key: 'prop', label: 'label' }"
        @close="customColumnsPopClose"
      />
    </div>
    <!-- 批量上传 -->
    <UploadInvoiceImg 
    :showUpload='showUpload'
    :upload-title="uploadTitle"
    :upload-params="uploadParams"
    :limit="limit"
    :accept-types="acceptTypes"
    @close-upload="closeUpload" />
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import RelatePayInfoDialog from './components/relatePayInfoDialog'
import UploadInvoiceImg from './components/uploadInvoiceImg'
import RegisterInvoice from '@/views/finance/pay/settle/components/registerInvoice'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
// import { mixin as commonMixin } from '@/views/finance/voucher/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { listPage, receive, del, getListAmtSummary } from '@/api/fin/invoicePayment'
import { getSettleUnitInvoiceInfo } from '@/api/fin/invoiceReceivableApply'
import { getCompanyInvoiceInfo } from '@/api/fin/company'
import { dateFormat } from '@/views/finance/utils/finance'
// import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import ColumnTip from '@/views/finance/components/Tips/columnTip.vue'
import { getValueByKey } from '@/api/order/list'
let CURRENCYLIST = []
let defaultCreateQuery = {
  supplierCorpName: '',
  supplierCorpCode: '',
  corpBank: null,
  bankAccounts: [],
  title: '',
  taxNo: '',
  supplierTitle: '',
  supplierBankName: '',
  supplierBankBranchName: '',
  supplierTel: '',
  supplierAddr: '',
  supplierAccountNo: '',
  bankName: '',
  accountNo: '',
  addr: '',
  tel: '',
  supplierTaxpayerNo: '',
  accountShortName: '',
  selfCurrecny: '',
  supplierCurrency: '',
  invoicePaymentList:[],
  bankAccountsPubList:[],
}
export default {
  mixins: [mixin, mixin2, routerMixin, commonMixin],
  data() {
    return {
      pageSizeUrl: listPage('geturl'),
      keyDownActive: true,
      limit: 1,
      //批量上传
      showUpload:false,
      uploadApi: '/base/webapi/file/upload',
      uploadParams: {},
      previewDialog: {
				show: false,
				title: '凭证预览',
				seqNo: '',
				showData: {},
			},
      applyNo:"",
      invoicePaymentAddForm : Object.assign({},defaultCreateQuery),
      dialogVisibleInvoice:false,
      option1: {},
      searchBackup:[],
      searchOption: {},
      multipleSelection1: [],
      autocomplete: {},
      dialogVisible: false,
      financeReceiveForm: {
        invoicePaymentIds: '',
        receiveNoPrefix: '',
        receiveNoSn: '',
        invoiceNos: '',
      },
      financeReceiveRules: {
        receiveNoPrefix: [{ required: true, message: '登记号前缀不能为空', trigger: 'blur' }],
        receiveNoSn: [{ required: true, message: '登记号序号不能为空', trigger: 'blur' }],
      },
      currentComponent: '',
      rowData: {},
      query: [],
      invoicePaymentIds: [],
      invoicePaymentId: -1,
      relatePayInfoVisible: {
        show: false,
      },
      // 升序
      ascColumns: [],
      // 降序
      descColumns: [],
      selfColumnsBase:[
        {
          disabled: true,
          prop: 'invoiceNo',
          label: '发票号',
          type: 'text',
          popoverComponent: ColumnTip,
          componentShow:true,
          width: '100px',
          method: row => {
            this.showDetail(row)
          }
        },
        {
          prop: 'receiveNo',
          label: '发票登记号',
          type: 'text',
          width: '116px',
        },
        {
          prop: 'orderNo',
          label: '工作单号',
          width:140,
					type: 'columnTip',
          component: 'ColumnTip',
					componentProps: {
            show: false,
            data: [],
						callback: (no, { row }, index) => {
              let orderNoList = row.orderNo_multiValue
              let sourceTypeList = row.sourceType_multiValue
              let orderNo = orderNoList[index]
              let sourceType = sourceTypeList[index]
							let sourceBizNo = orderNo
							this.showOneNoDetail(sourceType, sourceBizNo, { feeId: '' })
						},
					},
        },
        {
          prop: 'invoiceType',
          label: '发票类型',
          type: 'select',
          width: '125px',
        },
        // {
        //   prop: 'delayInvoice',
        //   label: '延迟开票标记',
        //   type: 'select',
        //   propInDict: 'yesNo',
        //   width:100
        // },
        {
          prop: 'voucherNo',
          label: '凭证号',
          type: 'columnTip',
          width: 125,
          sortable: true,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps, index) => {
              let row = componentProps.row
              let voucherNo = row.voucherNo_multiValue
              let seqNo = row.seqNo_multiValue
              voucherNo = voucherNo[index]
              seqNo = seqNo[index]

              this.previewDialog.showData = ''
              this.previewDialog.seqNo = seqNo
              this.previewDialog.show = true
            },
          },
        },
        {
          prop: 'currency',
          label: '开票币种',
          type: 'text',
        },
        {
          prop: 'amt',
          label: '发票金额',
          type: 'text',
        },
        {
          prop: 'supplierCorpName',
          label: '结算单位',
          type: 'text',
          width: 150,
        },
        {
          prop: 'invoiceIssueDate',
          label: '开票日期',
          type: 'text',
          width: '116px',
        },
        {
          prop: 'taxRate',
          label: '发票税率',
          type: 'select',
          propInDict:"taxRateInfo"
        },
        {
          prop: 'taxAmt',
          label: '税额',
          type: 'text',
        },
        {
          prop: 'taxTotalInclud',
          label: '价税合计(CNY)',
          width: 100,
          type: 'text',
        },
        {
          prop: 'taxTotalExclud',
          label: '不含税金额',
          type: 'text',
        },
        // {
        //   prop: 'amtTaxAmt',
        //   label: '不含税金额',
        //   type: 'text',
        //   // formatter: ({row}) => {
        //   //   return Math.round((row.amt-row.taxAmt)*100)/100
        //   // },
        // },
        {
          prop: 'writeoffAmt',
          label: '已核销金额',
          type: 'text',
        },
        {
          prop: 'lockAmt',
          label: '关联金额',
          type: 'text',
        },
        {
          prop: 'availableAmt',
          label: '未关联金额',
          type: 'text',
          formatter: ({row}) => {
            return  Math.round((row.amt-row.lockAmt-row.writeoffAmt)*100)/100
          },
        },
        {
          prop: 'invoiceRelationStatus',
          label: '发票关联状态',
          width: 100,
          type: 'select',
          propInDict:'invoiceRelationStatus'
        },
        {
          prop: 'haveInvoiceFile',
          label: '是否有发票附件',
          width: 100,
          type: 'select',
          propInDict:'yesNo'
        },
        {
          prop: 'hasCheckInvoiceFile',
          label: '是否有发票查验件',
          width: 120,
          type: 'select',
          propInDict:'payApplyHasCheckInvoiceFile'
        },
        {
          prop: 'receiveState',
          label: '发票签收状态',
          width: 90,
          type: 'select',
          // propInDict: 'yesNo',
          formatter:({row})=>{
            // const val = this.dictMapObj.yesNo[row.receiveState]
            if (row.receiveState === 'yes') {
              return '<span style="color:#33B18A">'+'已签收'+'</span>' // val
            } else if (row.receiveState === 'no') {
              return '<span style="color:#CD4130">'+'未签收'+'</span>' // val
            } else {
              return val
            }
          }
        },
        {
          prop: 'payApplyNos',
          label: '请款单号',
          type: 'columnTip',
          width: 125,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (No, componentProps, index  ) => {
              let row = componentProps.row
              let payApplyNos = row.payApplyNo_multiValue ? row.payApplyNos_multiValue : row.payApplyNos_multiValue
              let sourceApplyNos = row.sourceApplyNos_multiValue ? row.sourceApplyNos_multiValue : row.sourceApplyNos_multiValue
              let applyNo = payApplyNos[index]
              let sourceType = sourceApplyNos[index]
              console.log(applyNo);
              console.log(sourceType);
              // 结算付款和预付抵账，预付款，退款
                if (sourceType === 'prepay') {
                  this.isJumpRouteFromPage = true 
                  this.$router.push({
                    name: 'PrepayDetail',
                    query: { applyNo, source: '' }
                  })
                  return
                }
                if (sourceType === 'order_settle' || sourceType === 'transfer_prepay') {
                  this.isJumpRouteFromPage = true 
                  this.$router.push({
                    name: 'SettleDetail',
                    query: { applyNo, source: '' }
                  })
                  return
                }
                if (sourceType === 'refund_apply') {
                  this.isJumpRouteFromPage = true 
                  this.$router.push({
                    name: 'RefundDetail',
                    query: { applyNo, source: '' }
                  })
                  return
                }
                this.$msgErrClose('系统异常，请联系管理员！')
              // this.showColumnDetail({
              //   type: 'paySettleApplyNo',
              //   no,
              //   componentProps
              // })
            }
          }
        },
        {
          prop: 'payOrderNo',
          label: '付款单号',
          type: 'columnTip',
          width: '140px',
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data:[],
            callback: (payOrderNo) => {
              this.routerPush("OrderDetails", {
                payOrderNo
              })
            },
          },
        },
        // {
        //   prop: 'applyNo',
        //   label: '请款单号',
        //   type: 'button',
        //   width: '140px',
        //   operationBtns: {
        //     show: true,
        //     callback: (fn, index, row, option, subItem) => {
        //       //  预付款申请详情|结算付款申请(根据前缀判断
        //       console.log(subItem)
        //       let arr = [
        //         { name: 'PrepayDetail', reg: 'AP' }, //预付款申请
        //         { name: 'SettleDetail', reg: 'PND' }, //结算付款申请
        //       ]
        //       let name = (arr.find((item) => subItem.includes(item.reg)) || {}).name
        //       if (!name) {
        //         return this.$message.error('未找到匹配该单号的来源规则！')
        //       }
        //       this.routerPush(name, {
        //         applyNo: subItem,
        //         source: 'Detail',
        //       })
        //     },
        //   },
        // },
        {
          prop: 'writeoffReceipayNo',
          label: '核销单号',
          type: 'columnTip',
          width: '140px',
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data:[],
            callback: (writeoffReceipayNo) => {
              this.showOneNoDetail("writeoffNos", writeoffReceipayNo)
            },
          },
        },
        {
          prop: 'rate',
          label: '开票汇率',
          type: 'text',
        },
        {
          prop: 'supplierTitle',
          label: '发票抬头',
          type: 'text',
          width: 150,
        },
        {
          prop: 'supplierAccountNo',
          label: '银行账号',
          type: 'text',
          width: 125,
        },
        {
          prop:'supplierBankName',
          label:'收款银行',
          type:'text',
          width: 125
        },
        {
          prop: 'supplierTaxpayerNo',
          label: '供应商纳税人识别号',
          type: 'text',
          width: 140
        },
        {
          prop: 'supplierAddr',
          label: '供应商地址', // label:'收款地址'
          type: 'text',
          width: 130
        },
        {
          prop: 'bankName',
          label: '付款银行',
          type: 'text',
          width: 150,
        },
        {
          prop: 'accountShortName',
          label: '我司银行简称',
          type: 'text',
          width: 150,
        },
        {
          prop: 'title',
          label: '我司发票抬头',
          type: 'text',
          width: 150,
        },
        {
          prop: 'accountNo',
          label: '我司账号',
          type: 'text',
          width: 125,
        },
        {
          prop: 'payTimes',
          label: '付款日期',
          type: 'text',
        },
        {
          prop: 'invoicePayStatus',
          label: '付款状态',
          type: 'select',
          propInDict:"invoicePayStatus",
        },
        {
          prop: 'createdName',
          label: '登记人',
          type: 'text',
          width: 100,
        },
        {
          prop: 'createdTime',
          label: '登记时间',
          type: 'text',
          width: 125,
        },
        {
          prop: 'receiveName',
          label: '发票签收人',
          type: 'text',
          width: 100,
        },
        {
          prop: 'receiveTime',
          label: '发票签收时间',
          type: 'text',
          width: 125,
        },
        {
          prop: 'updatedName',
          label: '更新人',
          type: 'text',
          width: '118px',
        },
        {
          prop: 'updatedTime',
          label: '更新时间',
          type: 'text',
          width: 125,
        },
        // {
        //   prop: 'applyAmt',
        //   label: '已请款金额',
        //   type: 'text',
        // },
        // “已请款金额”字段
        {
          prop: 'printCount',
          label: '打印次数',
          type: 'text',
        },
        {
          prop: 'printTime',
          label: '打印时间',
          type: 'text',
          width: 125,
        }
        
      ],
      pushUploadInvoiceList: [
        { label: '上传发票信息', value: 'excel' },
        { label: '上传发票附件', value: 'annex' },
      ],
      uploadTitle:'',
      acceptTypes: '.xls, .xlsx',
    }
  },
  created() {
    this.searchOption = {
      saveShow: true,
      saveName: 'InvoicePaymentList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter:{
        // 初始搜索条件数
        defaultSearchLength: 7,
        // 条件数组
        searchInputGroup: [
          { key: 'allNo', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'invoiceType', value: '', showType: '2', range: { min: '', max: '' } },
          { key: 'currency', value: '', showType: '3', range: { min: '', max: '' } },
          { key: 'receiveState', value: '', showType: '4', range: { min: '', max: '' } },
          { key: 'amt', value: '', showType: '5', range: { min: '', max: '' } },
          { key: 'supplierTitle', value: '', showType: '6', range: { min: '', max: '' } },
          { key: 'invoiceIssueDate', value: '', showType: '7', range: { min: '', max: '' } },
        ],
        filterGroups: {
          //1
          allNo: { label: '各类单号', type: 'input', placeholder:"多个单号用空格或逗号分隔", showType: '1' },
          invoiceNo: { label: '发票号',  type: 'input',  showType: '1'  },
          orderNo: { label: '工作单号',  type: 'input',  showType: '1'},
          voucherNo: { label: '凭证号',  type: 'input',  showType: '1'  },
          payOrderNo: { label: '付款单号',  type: 'input',  showType: '1'},
          writeoffReceipayNo: { label: '核销单号',  type: 'input',  showType: '1'  },
          receiveNo: { label: '发票登记号',  type: 'input',  showType: '1'  },
          // sourceApplyNo: { label: '请款单号',  type: 'input',  showType: '1'  },
          //2
          invoiceType: {  label: '发票类型',  type: 'select', prop:"invoiceType", multiple:true, showType: '2'},
          invoiceRelationStatus: {  label: '发票关联状态',  type: 'select', prop:"invoiceRelationStatus", showType: '2'},
          invoicePayStatus : {  label: '付款状态',  type: 'select', prop:"invoicePayStatus", showType: '2'},
          haveInvoiceFile : {  label: '是否有发票附件',  type: 'select', prop:"yesNo", showType: '2'},
          hasCheckInvoiceFile : {  label: '是否有发票查验件',  type: 'select', selectOptions: this.dictMap.payApplyHasCheckInvoiceFile.filter((v) => v.value != 'part'), showType: '2'  },
          //3
          currency: {  label: '开票币种',  type: 'select', selectOptions: CURRENCYLIST, showType: '3'  },
          //4
          receiveState: {  label: '发票签收状态',  type: 'select', selectOptions: [ { label: '已签收', value: 'yes' }, { label: '未签收', value: 'no' } ],  showType: '4'  }, // prop: "yesNo"
          //5
          amt: {  label: '发票金额',  type: 'range',  showType: '5'  },
          lockAmt: {  label: '关联金额',  type: 'range',  showType: '5'  },
          writeoffAmt: {  label: '已核销金额',  type: 'range',  showType: '5'  },
          availableAmt: {  label: '未关联金额',  type: 'range',  showType: '5'  },
           //6
          supplierTitle: { label: '发票抬头',  type: 'input',  showType: '6'  },
          title: { label: '我司发票抬头',  type: 'input',  showType: '6'  },
          supplierCorpCode: {
            label: '结算单位',
            type: 'remoteSelect',
            showType: '6',
            remote: true,
            multiple:true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({queryString,'unitTypes':'customer,company,supplier',"containTemporary":"yes"}, item)
            },
            visibleChange: (queryString, item, row) => {
             this.querySettleUnit2({queryString,'unitTypes':'customer,company,supplier',"containTemporary":"yes"}, item)  
            },
            remoteSelectList: []
          },
          // supplierCorpName: {  label: '结算单位',  showType: '6',  type: 'autocomplete',  multiple:true,
          //   querySearch: (queryString, cb) => {
          //     this.selectedOptionItem = ''
          //     this.querySettleUnit({queryString,'unitTypes':'customer',"containTemporary":"yes"}, cb)
          //   },
          //   select: (optionItem, row) => {
          //     this.selectedOptionItem = optionItem
          //     row.valueReq = 'supplierCorpCode'
          //     row.supplierCorpCode = optionItem.key
          //     console.log(row);
          //   },
          //   change: (val, row) => {
          //     // 延时150ms获取select中的改变
          //     setTimeout(() => {
          //       if (this.selectedOptionItem === '') {
          //         row.valueReq = ''
          //         return
          //       }
          //     }, 150)
          //   }
          // },
          supplierBankName: { label: '收款银行',  type: 'input',  showType: '6'  },
          supplierAccountNo: { label: '银行账号',  type: 'input',  showType: '6'  },
          accountShortName: { label: '我司银行简称',  type: 'input',  showType: '6'  },
          accountNo: { label: '我司账号',  type: 'input',  showType: '6'  },
          bankName: { label: '付款银行',  type: 'input',  showType: '6'  },
          //7
          invoiceIssueDate: {  label: '开票日期',  type: 'daterange',  showType: '7'  },
          createdName: {  label: '登记人',  type: 'input',  showType: '7'},
          createdTime: {  label: '登记时间',  type: 'daterange',  showType: '7'},
          updatedTime: {  label: '更新时间',  type: 'daterange',  showType: '7'},
          payTime: {  label: '付款时间',  type: 'daterange',  showType: '7'},
          receiveBy: {
            label: '发票签收人',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item, ''),
            visibleChange: (queryString, item) => this.getEmployeeList(queryString, item, ''),
          },
          receiveTime: {  label: '发票签收时间',  type: 'daterange',  showType: '7' },
        },
      }
    }
    // this.searchOption = this.initSearchOption(searchColumns)
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      width: '90px',
      data: [
        {
          label: '详情',
          type: 'text',
          showFn: ()=> this.checkAuth(this.$route.name, 'btn-detail'),
          action: 'showDetail'
        },
        {
          label: '修改',
          type: 'text',
          showFn: (row)=> row.lockAmt== 0 && row.writeoffAmt == 0 && this.checkAuth(this.$route.name, 'btn-Edit'),
          action: 'Edit'
        }
      ]
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'InvoicePaymentList',
      data: [...this.option.data],
      sortable: true,
      tips: {
        text: '',
        show: false,
      },
      customColumns: {
        show: true,
        handleCustomColumns: ()=> this.handleCustomColumns()
      },
      operationBtns,
      pagination,
      listAmtSummary,
      maxHeight: this.getFinanceTableMaxHeight,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      emptyText: '数据将在查询后显示',
    })
    let columns = [...this.selfColumnsBase]
		this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
		this.selfColumnsBase.forEach(item => ( item.prop === 'voucherNo' ? item.sortable = true : item.sortable = false))
		this.option1.columns = columns
    getValueByKey('FIN_INVOICE_PAYMENT_CURRENCY_CONFIG').then(res=>{
      //应付发票允许录入的币种配置
      CURRENCYLIST.splice(0, 100,...(this.dictMap['validCurrency'].slice(0, 100).filter(item => res.data.split(",").includes(item.label))))
    })
    // this.getData()
  },
  methods: {
    // 关联发票
    openRelatePayInfoDialog() {
      if (this.multipleSelection1.length !== 1) {
        return this.$message({
          message: '请选择一张发票进行关联！',
          type: 'error',
          showClose: true,
        })
      }
      let invoicePayment = this.multipleSelection1[0]
      if (invoicePayment.writeoffAmt === invoicePayment.amt) {
        return this.$message({
          message: `发票 ${invoicePayment.invoiceNo} 已足额关联请款单！`,
          type: 'error',
          showClose: true,
        })
      }
      // console.log(this.multipleSelection1[0]);
      this.invoicePaymentId = this.multipleSelection1[0].invoicePaymentId
      this.rowData = this.multipleSelection1[0]
      this.relatePayInfoVisible.show = true
    },
    identifyElecInvoice() {
      let query = {
        from: 'InvoicePaymentList'
      }
      this.routerPush('IdentifyElecInvoice', query)
    },
    // 发票登记
    addInvoice() {
      let query = {
        titleName:'发票登记'
      }
      this.routerPush('InvoicePaymentListReg', query)
    },
    closeDialogVisible(val, isBreak){
      this.dialogVisibleInvoice = val
      if(isBreak===true){
        this.getData()
      }
    },
    //发票修改
    handleEdit(row){
      let query = {
        invoicePaymentId: row.invoicePaymentId,
        invoiceNo: row.invoiceNo,
        titleName: "发票修改"
      }
      this.routerPush('InvoicePaymentListEdit', query)
    },
    // 删除发票
    delInovice() {
      if (this.multipleSelection1.length === 0) {
        return this.$message({
          message: '请勾选发票进行删除！',
          type: 'error',
          showClose: true,
        })
      }
      // let arr = this.multipleSelection1.filter((item) => item.receiveState !== 'yes')
      // if (!arr.length) {
      //   return this.$message({
      //     message: '财务已接收的发票不能删除！',
      //     type: 'error',
      //     showClose: true,
      //   })
      // }
      let data = {
        invoicePaymentIds: this.multipleSelection1.map(item=>item.invoicePaymentId),
      }
      this.$confirm('确认删除此发票吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        del(data).then(() => {
          this.$message({
            message: '删除成功！',
            type: 'success',
            showClose: true,
          })
          this.getData()
        })
      })
    },
    // 财务已收
    financeReceive(val) {
      if (this.multipleSelection1.length < 1) {
        return this.$message({
          message: '请勾选需要操作的发票！',
          type: 'error',
          showClose: true,
        })
      }
      let arr = this.multipleSelection1.filter((item) => item.receiveState !== val)
      let title = val === 'yes' ? '未签收' : '已签收'
      if (!arr.length) {
        return this.$message({
          message: `请勾选${title}的发票！`,
          type: 'error',
          showClose: true,
        })
      }
      this.invoicePaymentIds = arr.map((item) => item.invoicePaymentId)
      this.financeReceiveForm.invoicePaymentIds = this.invoicePaymentIds.join(',')
      this.financeReceiveForm.invoiceNos = arr.map((item) => item.invoiceNo).join(',')
      // this.dialogVisible = true
      let title2 = val === 'yes' ? '签收发票' : '撤销签收发票'
      this.$confirm(`是否确认${title2}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.receiveConfirm(val)
      }).catch(()=>{})
    },
    // 签收发票确认
    receiveConfirm(val) {
      let data = {
        invoicePaymentIds: this.invoicePaymentIds,
        receiveNo: this.financeReceiveForm.receiveNoPrefix + '-' + this.financeReceiveForm.receiveNoSn,
        receiveStatus: val
      }
      let title = val === 'yes' ? '签收发票' : '撤销签收发票'
      receive(data).then(() => {
        this.$message({
          message: `${title}成功！`,
          type: 'success',
          showClose: true,
        })
        // this.dialogVisible = false
        for (let key in this.financeReceiveForm) {
          this.financeReceiveForm[key] = ''
        }
        this.getData()
      })
      // this.$refs.financeReceiveForm.validate((valid) => {
      //   if (!valid) {
      //     return
      //   }
      // })
    },
    //凭证
    batchPrintCreate(preview) {
      let isPreview = preview === true
      this.previewDialog.show = false
      let selectRow = this.multipleSelection1
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: '请勾选需要生成凭证的项！',
          type: 'error',
          showClose: true
        })
        return
      }
      if (selectRow.length !== 1 && isPreview) {
        return this.$message({
          message: `只能选择一个进行预览！`,
          type: 'error',
          showClose: true,
        })
      }
      let arr = selectRow.filter((item) => !item.acctVoucherSeqno)
      if (!arr.length) {
        if (isPreview) {
          this.previewDialog.showData = ''
          this.previewDialog.seqNo = selectRow[0].acctVoucherSeqno
          this.previewDialog.show = true
        } else {
          this.$msgErrClose('请选择无凭证号的项！')
        }
        return
      }
      let writeoffReceipayNos = this.multipleSelection1.map(item => {
        return item.writeoffReceipayNo
      })
      let data = {
        writeoffReceipayNos,
        bizType:'pay_writeoff',
        preview:'no',
      }
      if (isPreview){
        data.preview = 'yes'
        return receipayWriteOffGenerate(data).then(res=>{
          this.previewDialog.seqNo = ''
          this.previewDialog.showData = res.data
          this.previewDialog.show = true
        }).catch(console.log)
      }
      this.$confirm('确认生成凭证?', "生成凭证", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning"
      }).then(()=> {
        return receipayWriteOffGenerate(data)
      }).then(() => {
        this.$message({  message: '凭证已经处理！',  type: 'success',  showClose: true })
        this.getData()
      }).catch(function() {});
      // this.query.writeoffReceipayNos = writeoffReceipayNo
      // this.query.bizType = ""
      // this.rejectDialogVisible = true
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params)
    },
    getData(isSearch) {
      this.lsLoading = true
      let data = {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.searchOption.addFilter.searchInputGroup.forEach((item) => {
        let { key, value, range, req, valueReq } = item
        // console.log(item);
        if (range.min || range.max) {
          if (range.min) {
            data.query.push({
              column: key + 'Min',
              type: 'eq',
              value: range.min,
            })
          }
          if (range.max) {
            data.query.push({
              column: key + 'Max',
              type: 'eq',
              value: range.max,
            })
          }
          return
        }
        if (!value) return
        if (typeof value !== 'object') {
          //搜索带两值，切换去掉valueReq
          if(valueReq && item[valueReq] && item.key === 'supplierCorpName' && item.value !== ''){
            data.query.push({
              column: valueReq,
              type: 'eq',
              value:  item[valueReq],
            })
          }
          return data.query.push({
            column: key,
            type: 'eq',
            value: req || value,
          })
        }
        if (key === 'invoiceType' || key === 'supplierCorpCode') {
          if (!value.length) return
          data.query.push({
            column: key,
            type: 'eq',
            value: value.join(','),
          })
        } else{
          data.query.push({
            column: key + 'Start',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[0]),
          })
          data.query.push({
            column: key + 'End',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[1]),
          })
        }
        
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({ column: 'recheckStatus', type: 'eq', value: this.buttonSearch })
      }
      listPage(data).then(({ data }) => {
        this.finCommonColumns({data})
        this.option1.data = data.list.map((item) => {
          // if (data.configColumns && data.configColumns.length) {
          //   let columns = data.configColumns
          //   this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
          //   this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
          //   this.configColumns = data.configColumns
          // }

          // item.taxAmt = ((item.amt / (1 + item.taxRate)) * item.taxRate).toFixed(2)
          item.payOrderNo_multiValue = item.payOrderNo.split(',')
          item.invoiceNo_multiValue = item.invoiceNo.split(',')
          item.isJoint = 'y'
          if(item.voucherNos){
            item.voucherNo_multiValue = item.voucherNos.split(',').map(subItem => {
              let arr = subItem.split('/')
              return arr[1] ? arr[1] :''
            })
            item.seqNo_multiValue = item.voucherNos.split(',').map(subItem => {
              let arr = subItem.split('/')
              return arr[0]
            })
          }

          item.sourceType_multiValue = item.orderNo.split(',').map(subItem => {
            let arr = subItem.split('/')
            return arr[1] ? arr[1] : arr[0]
          })
          item.orderNo_multiValue = item.orderNo.split(',').map(subItem => {
            let arr = subItem.split('/')
            return arr[0]
          })
          if(item.sourceApplyNo){
            item.payApplyNos_multiValue = item.sourceApplyNo.split(',').map(subItem => {
              let arr = subItem.split('/')
              return arr[1] ? arr[1] : arr[0]
            })
            item.sourceApplyNos_multiValue = item.sourceApplyNo.split(',').map(subItem => {
              let arr = subItem.split('/')
              return arr[0]
            })
          }
          
          // if(item.sourceApplyNo){
          //   item.payApplyNo_multiValue = item.sourceApplyNo.split(',')
          // }
          item.writeoffReceipayNo_multiValue = item.writeoffReceipayNo.split(',')
          return item
        })
        console.log(this.option1.data);
          Object.assign(this.option1.pagination, data)
        // this.option1.pagination.currPage = data.currPage
        // this.option1.pagination.pageSize = data.pageSize
        // this.option1.pagination.totalCount = data.totalCount
      }).finally(()=>{
        this.lsLoading = false
      })
      // this.debounceLs(() => {
      //   this.getListAmtSummary(data)
      // })
    },
    //导出按钮
		handleExport () {
			let data = {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.searchOption.addFilter.searchInputGroup.forEach((item) => {
        let { key, value, range, req, valueReq } = item
        console.log(item);
        if (range.min || range.max) {
          if (range.min) {
            data.query.push({
              column: key + 'Min',
              type: 'eq',
              value: range.min,
            })
          }
          if (range.max) {
            data.query.push({
              column: key + 'Max',
              type: 'eq',
              value: range.max,
            })
          }
          return
        }
        if (!value) return
        if (typeof value !== 'object') {
          //搜索带两值，切换去掉valueReq
          if(valueReq && item[valueReq] && item.key === 'supplierCorpName' && item.value !== ''){
            data.query.push({
              column: valueReq,
              type: 'eq',
              value:  item[valueReq],
            })
          }
          return data.query.push({
            column: key,
            type: 'eq',
            value: req || value,
          })
        }
        if (key === 'invoiceType' || key === 'supplierCorpCode') {
          if (!value.length) return
          data.query.push({
            column: key,
            type: 'eq',
            value: value.join(','),
          })
        } else{
          data.query.push({
            column: key + 'Start',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[0]),
          })
          data.query.push({
            column: key + 'End',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[1]),
          })
        }
        
      })
      if (this.multipleSelection1.length) {
        data.query = [
          { column: 'invoicePaymentIds', type: 'in', value: this.multipleSelection1.map((v) => v.invoicePaymentId).join(',') },
        ]
      }
      //查询对象的配置编码
      data.query.push({
				column: 'queryDataModuleCode',
				value: 'invoicePaymentListExport'
			})
			this.$confirm('是否确认导出应付发票列表?', "应付发票列表", {
        showCancelButton: true,
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				lockScroll: "true",
				type: "warning",
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = '执行中...';
            setTimeout(() => {
              this.option1.loading = true
              this.$store
                .dispatch('finance/downloadBlobFilePost', {
                  uri: '/fin/common/queryDataExportExcel',
                  data: { data },
                })
                .then((res) => {
                  this.option1.loading = false
                  console.log(res);
                  let link = document.createElement('a')
                  link.href = window.URL.createObjectURL(res)
                  link.download = '应付发票列表.xlsx'
                  link.click()
                  done();
                  instance.confirmButtonLoading = false;
                }).catch(() => {
                  this.option1.loading = false
                  this.$message({ message: '导出失败', type: 'error' })
                  done();
                  instance.confirmButtonLoading = false;
                })
            }, 30);
          } else {
            done();
          }
        }
			}).then(() => {
				
			}).catch(() => {
			})
    },
    printInvoicePay() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选需要打印的发票！')
      }
      let nullCount = 0
      let query = {
        invoiceImgFileNos: this.multipleSelection1.map(item => {
          if (!item.invoiceImgFileNo) nullCount++
          return {fileNo: item.invoiceImgFileNo, printCount: +item.printCount+1, id: item.invoicePaymentId}
        }).filter((item, index) => item.fileNo),
      }
      if (nullCount > 0 && nullCount < this.multipleSelection1.length) {
        this.$msgWarnClose(`所选发票有${nullCount}张没有附件！`)
      }
      if (nullCount === this.multipleSelection1.length) {
        return this.$msgErrClose(`所选发票全部没有附件！`)
      }
      this.routerPush('InvoicePaymentPrint', {invoiceImgFileNos: JSON.stringify(query.invoiceImgFileNos)})
    },
    getListAmtSummary(data) {
      getListAmtSummary(data).then(res => {
        if (res.code === 0 && res.data) {
          let labelObj = {
            amtListLabel: '开票金额',
            taxAmtListLabel: '税额',
            amtWithoutTaxListLabel: '不含税金额'
          }
          let colorObj = {
            amtListColor: 'red', // 支持red, green, black三种值
            taxAmtListColor: 'red',
            amtWithoutTaxListColor: 'green',
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
    uploadInvoiceImg(val){
      console.log(val.value);
      if(val.value === 'excel'){
        this.uploadTitle = val.label
        this.limit = 1
        this.acceptTypes = '.xls, .xlsx'
      } else{
        this.uploadTitle = val.label
        this.limit = 50
        this.acceptTypes = '.pdf, .jpg, .png, .jpeg, .zip,'
      }
      this.uploadParams = {}
      this.showUpload = true
    },
    closeUpload() {
      this.showUpload = false
      this.getData()
    },
    mathRound(num){
      return Math.round(num*100)/100
    },
    sendMulti(data) {
      this.multipleSelection1 = data
      let data2 = {
				"ascColumns": [],
				"descColumns": [],
				"query": []
			}
			let ids = this.multipleSelection1.map(item => {
				return item.invoicePaymentId
			}).join(',')
			if (ids) {
				data2.query.push({
					"column": "invoicePaymentIds",
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
    search(data) {
      this.buttonSearch = data
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    showDetail(row,invoiceNo) {
      let query = {
        invoicePaymentId:row.invoicePaymentId,
        invoiceNo: row && row.invoiceNo ? row.invoiceNo :invoiceNo
      }
      this.routerPush('InvoicePaymentListDetail', query)
    },
    //自定义表头
    handleCustomColumns(){
      this.customColumnsPopShow = true;
    },
    //批量下载发票
    handleDownLoadInvoice(){ 
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选需要下载发票的项！')
      }
      // for (let i = 0; i < this.multipleSelection1.length; i++) {
      //   if (this.multipleSelection1[i].hasInvoice !== 'yes') {
      //     return this.$msgErrClose('只有已开票状态才能批量下载！请重新选择！')
      //   }
      // }
      let data = {
        invoicePaymentIds : this.multipleSelection1.map((item, index) => {
          return item.invoicePaymentId 
        }),
      }
      let invoiceNoList = []
      for (let i = 0; i < this.multipleSelection1.length; i++) {
        if(!this.multipleSelection1[i].fileNo){
          invoiceNoList.push(this.multipleSelection1[i].invoiceNo)
        }
      }
      if (invoiceNoList.length !== 0) {
        return this.$msgErrClose('请勾选有发票附件的项！')
      }
      this.$confirm(invoiceNoList.length ? '您有'+invoiceNoList.toString()+'无发票附件不能被下载，是否确认下载已有的发票！' : '您是否确定批量下载发票吗?' , "下载发票", {
        showCancelButton: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = '执行中...';
              setTimeout(() => {
                this.$store
                .dispatch('finance/downloadBlobFilePost', {
                  uri: '/fin/invoicePayment/downloadImg',
                  data:{data},
                })
                .then((res) => {
                  let link = document.createElement('a');
                  link.href = window.URL.createObjectURL(res);
                  link.download = '应付发票.zip';
                  link.click()
                  done();
                  instance.confirmButtonLoading = false;
                })
                .catch((err)=> {
                  done();
                  instance.confirmButtonLoading = false;
                })
              }, 500);
                
          } else {
            done();
          }
        }
      }).then((err)=> {
      }).catch(()=> {
      })

    },
    handleUploadCheckInvoiceImg(){
      // let len = this.multipleSelection1.length
			// if (!len) {
			// 	return this.$msgErrClose('请先勾选至少1条数据，再进行上传！')
			// }
      // console.log(this.multipleSelection1);
      this.uploadParams = {
        invoicePaymentIdList: this.multipleSelection1.map(item=> item.invoicePaymentId)
      }
      console.log(this.uploadParams);
      this.uploadTitle = '上传发票查验件'
      this.limit = 50
      this.acceptTypes = '.pdf, .jpg, .png, .jpeg, .zip,'
      this.showUpload = true
    }
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    RelatePayInfoDialog,
    RegisterInvoice,
    PreviewDialog,
    CustomColumns,
    UploadInvoiceImg,
    ColumnTip
  },
}
</script>
<style scoped>
.el-form-item-text {
  font-size: 12px;
}
</style>
<style>
.cancel-invoice-receivable-form .el-dialog__body {
  padding: 40px 80px 22px;
}
.cancel-invoice-receivable-form .el-dialog__footer {
  padding-bottom: 32px;
  padding-right: 90px;
}
.cancel-invoice-receivable-form .el-form .el-input {
  width: 260px;
}
.manual-regist-invoice .el-form .el-date-editor.el-input {
  width: 162px;
}
.manual-regist-invoice .el-form .el-select {
  width: 162px;
}
.manual-regist-invoice .el-form .el-input {
  width: 162px;
}
.finance-page .el-tabs__nav-scroll {
  padding-left: 20px;
}
</style>