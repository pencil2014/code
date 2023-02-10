<template>
  <div
    class="finance-confirm-bill"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="confirm-bill-cnt finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-confirmBillList', 'btn-shBillConfirmFnPass')"
              class="finance-btn"
              size="mini"
              type="success"
              @click="shBillConfirmFn('pass')"
            >确认成功</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-confirmBillList', 'btn-shBillConfirmFnRefuse')"
              class="finance-btn"
              size="mini"
              type="danger"
              @click="shBillConfirmFn('refuse')"
            >确认失败</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-confirmBillList', 'btn-cancelConfirm')"
              class="finance-btn"
              size="mini"
              type="purple"
              @click="cancelConfirm"
            >撤销确认</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-confirmBillList', 'btn-addBillDialog')"
              class="finance-btn"
              size="mini"
              type="primary"
              @click="addBillDialog"
            >添加专项费用</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-radio-group v-model="dnCheckStatus" size="mini">
            <el-radio-button label>全部</el-radio-button>
            <el-radio-button label="submit">待确认</el-radio-button>
            <el-radio-button label="pass">已通过</el-radio-button>
            <el-radio-button label="refuse">确认失败</el-radio-button>
          </el-radio-group>
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTable :option="option1" @send-multi="sendMulti" />
    </div>
    <el-dialog :title="refuseOpentitle" :visible.sync="refuseOpen" width="600px">
      <el-form :model="refuseForm" ref="refuseForm" label-width="80px">
        <el-form-item
          v-if="checkStatus !== 'pass'"
          label="拒绝原因:"
          prop="dnRefuseReason"
          :rules="{
            required: true,
            message: ' ',
            trigger: 'blur',
          }"
        >
          <el-select v-model="refuseForm.dnRefuseReason" placeholder="请选择">
            <el-option
              v-for="(item, index) in dictMap['dnRefuseReason']"
              :key="'dnRefuseReason' + index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="确认失败说明:" prop="dnRefuseRemark">
          <el-input
            type="textarea"
            :maxlength="500"
            :autosize="{ minRows: 2, maxRows: 4 }"
            show-word-limit
            v-model="refuseForm.dnRefuseRemark"
          ></el-input>
        </el-form-item>
        <!-- <el-form-item v-if="checkStatus === 'pass'" label="确认备注:" prop="dnRefuseRemark" >
          <el-input
            type="textarea"
            :maxlength="500"
            :autosize="{ minRows: 2, maxRows: 4 }"
            show-word-limit
            v-model="refuseForm.dnRefuseRemark"
          ></el-input>
        </el-form-item>-->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit" size="mini">确定</el-button>
        <el-button @click="closeRefuse" size="mini">取消</el-button>
      </span>
    </el-dialog>
    <el-dialog title="撤销确认" :visible.sync="cancelOpen" width="600px">
      <el-form :model="cancelForm" ref="cancelForm" label-width="80px">
        <el-form-item label="原因归类：" prop="cancelType" >
          <el-select v-model="cancelForm.cancelType" placeholder="请选择">
            <el-option
              v-for="(item, index) in cancelTypeList"
              :key="'cancelType' + index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="cancelForm.cancelType === 'other'" label="撤销原因：" prop="cancelRemark" :rules="cancelRemarkRule">
          <el-input
            type="textarea"
            :maxlength="255"
            :autosize="{ minRows: 2, maxRows: 4 }"
            show-word-limit
            v-model="cancelForm.cancelRemark"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleCancelRemark" size="mini">确定</el-button>
        <el-button @click="cancelOpen = false" size="mini">取消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="供应商专项管理费"
      :visible.sync="dialogAddBill"
      class="self-dialog"
      width="1000px"
      :before-close="closeDialogAddBill"
    >
      <div class="add-bill-cnt">
        <el-form
          ref="addBillForm"
          :model="addBillForm"
          :inline="true"
          label-width="90px"
          size="mini"
          :rules="orderImportRegRules"
        >
          <el-form-item :label="addBillForm.inputNoType" prop="inputNo">
            <el-input v-model="addBillForm.inputNo" disabled></el-input>
          </el-form-item>
          <el-form-item label="订舱代理:" prop="bkgAgentSupplierName">
            <el-input v-model="addBillForm.bkgAgentSupplierName" disabled></el-input>
          </el-form-item>
          <el-form-item label="船名航次:" prop="shipName">
            <el-input v-model="addBillForm.shipName" disabled></el-input>
          </el-form-item>
          <el-form-item label="起运/目的港:" prop="poldName">
            <el-input v-model="addBillForm.poldName" disabled></el-input>
          </el-form-item>
          <el-form-item label="结算单位：" prop="settleCorpCode">
            <el-select
              v-model="addBillForm.settleCorpCode"
              placeholder="请选择"
              filterable
              remote
              value-key="value"
              :remote-method="(val)=> querySettleUnit2({ queryString: val, unitTypes: 'company,supplier', containHistoryUnitName: 'no', isForbid: true, receivepayType: 'pay' }, unitNameList)"
              :visible-change="(val)=>val && querySettleUnit2({ queryString: '', unitTypes: 'company,supplier', containHistoryUnitName: 'no', isForbid: true, receivepayType: 'pay' }, unitNameList)"
            >
              <el-option
                v-for="item in unitNameList.remoteSelectList"
                :key="item.value"
                :label="item.label"
                :value="item"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="费用名称:" prop="feeCode">
            <el-select
              v-model="addBillForm.feeCode"
              placeholder="请选择"
              @change="checkPrice"
            >
              <el-option
                v-for="(op, i) in specialFeeOption"
                :key="'feeCode' + i"
                :label="op.label"
                :value="op.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="币种:" prop="currency">
            <el-select v-model="addBillForm.currency" placeholder="请选择" filterable>
              <el-option
                v-for="(op, j) in currencyOptions"
                :key="'currency' + j"
                :label="op.label"
                :value="op.value"
              ></el-option>
            </el-select>
          </el-form-item>-->
        </el-form>
        <div class="finance-table-container">
          <div class="money-box">
            <div class="money-box-left">
              <div class="money-title">基本信息</div>
            </div>
            <div class="money-box-right">
              <el-button type="text" class="collapse-btn" size="mini" @click="handleCollapse(0)">
                {{ showTable[0] ? '收起' : '展开' }}
                <i
                  :class="showTable[0] ? `el-icon-arrow-up` : `el-icon-arrow-down`"
                ></i>
              </el-button>
            </div>
          </div>
          <div v-show="showTable[0]">
            <FinanceTable :option="option2" :autoMax="true" />
            <div class="totalcoast">
              <span>合计:</span>
              <b v-show="totalCoast.length" v-for="(item,index) in totalCoast" :key="index">
                <span>{{ item.currency }}{{item.feeAmt}}</span>
              </b>
              <b v-show="!totalCoast.length">0</b>
            </div>
          </div>
        </div>
        <div class="finance-table-container">
          <div class="money-box">
            <div class="money-box-left">
              <div class="money-title">拿价人信息</div>
            </div>
            <div class="money-box-right">
              <el-button
                :type="!showCoastTable ? 'primary' : 'danger'"
                size="mini"
                @click="showCoastTableChange"
              >{{ !showCoastTable ? "添加拿价人" : "删除拿价人"}}</el-button>
              <el-button type="text" class="collapse-btn" size="mini" @click="handleCollapse(1)">
                {{ showTable[1] ? '收起' : '展开' }}
                <i
                  :class="showTable[1] ? `el-icon-arrow-up` : `el-icon-arrow-down`"
                ></i>
              </el-button>
            </div>
          </div>
          <div>
            <div v-show="showCoastTable && showTable[1]">
              <div class="cost-employed">
                <div class="cost-item">
                  <span>拿价人：</span>
                  <el-select
                    size="mini"
                    v-model="pricerQuery"
                    filterable
                    remote
                    clearable
                    placeholder="请选择"
                    :remote-method="pricerQuerySearch"
                    @visible-change="pricerQuerySearch"
                  >
                    <el-option
                      v-for="item in pricerQueryArr"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </div>
                <!-- <div class="cost-item">
                  <span>费用名称：</span>
                  <el-select v-model="priceFeeCode" placeholder="请选择">
                    <el-option
                      v-for="(op, i) in specialFeeOption"
                      :key="'feeCode' + i"
                      :label="op.label"
                      :value="op.value"
                    ></el-option>
                  </el-select>
                </div>-->
              </div>
              <FinanceTable :option="option3" />
              <div class="totalcoast">
                <span>合计:</span>
                <b v-show="totalSell.length" v-for="(item,index) in totalSell" :key="index">
                  <span>{{ item.currency }}{{item.feeAmt}}</span>
                </b>
                <b v-show="!totalSell.length">0</b>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitAddBill" size="mini">提交</el-button>
        <el-button size="mini" @click="closeDialogAddBill">取消</el-button>
      </span>
    </el-dialog>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{ key: 'prop', label: 'label' }"
        @close="customColumnsPopClose"
        ref="CustomColumns"
      />
    </div>
    <div v-if="pricingRemarkPopShow">
      <pricingRemarkPop :row="pricingRemarkRow" @close="pricingRemarkPopClose" />
    </div>
  </div>
</template>

<script>
import { officePreview } from '@/utils/office'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
// import FinanceTable from '../components/financeTable.vue'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { listPage, shBillConfirm, toAddLienFee, saveShBillLienFee, cancelConfirm, updatePricingRemark } from '@/api/fin/shBill'
import { basePortList, baseCurrencyList, listByRole, baseShippingCarrierList } from '@/api/base'
import { employeeSelectlist } from '@/api/companyResource'
import { querySpecialFeeItemList } from '@/api/fin/feeitem'
import { departmentTreeList } from '@/api/companyResource'
import pricingRemarkPop from './editPricingRemarkPop'
import { customerListAllStatus } from '@/api/crm/supplier'
import { getOrderNoQuery } from '@/api/order/list'
import Vue from 'vue'
let currencyOptions = []
let FEELIST = [] // 费用
let FEEOBJ = {} // 费用对象
export default {
  components: {
    FinanceSearch,
    FinanceTable,
    CustomColumns,
    pricingRemarkPop,
  },
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: '/fin/shBill/listPage',
      keyDownActive: true,
      containerList: [],
      departmentListB: [],
      configColumnsList: [],
      searchOption: {},
      rightFilterBtns: [true, false, false, false],
      option1: {},
      option2: {},
      option3: {},
      multipleSelection: [],
      dialogAddBill: false,
      addBillForm: {
        billNo: '',
        inputNo: '',
        poldName: '',
        shipName: '',
        inputNoType: '',
        settleCorpCode: '',
        unitCode: '',
      },
      orderImportRegRules: {
        feeCode: [{ required: true, message: '费用名称不能为空', trigger: 'change' }],
        settleCorpCode: [{ required: true, message: '结算单位不能为空', trigger: 'change' }],
      },
      refuseOpen: false,
      refuseOpentitle: '',
      checkStatus: '',
      refuseForm: { dnRefuseReason: '', dnRefuseRemark: '' },
      cancelOpen: false,
      cancelForm: { cancelType: 'err', cancelRemark: ''},
      cancelTypeList: [{label:'账单确认有误',value:'err'},{label:'其他原因',value:'other'}],
      cancelRemarkRule:{required: true, message: ' ', trigger: 'change'},
      currencyOptions: [],
      specialFeeOption: [],
      pricerQuery: '',
      priceFeeCode: '',
      pricerQueryArr: [],
      showCoastTable: false,
      dnCheckStatus: '',
      defaultColumns: [],
      revisedHeight: -20,
      unitNameList: { remoteSelectList: [] }, //结算单位下拉列表
      showTable: [true, true],
      // 升序
      ascColumns: [],
      // 降序
      descColumns: ['createdTime'],
      selfColumnsBase: [
        {
          prop: 'billNo',
          label: '账单确认编号',
          type: 'button',
          width: 125,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.goConfirmDetail(row)
            },
          },
        },
        {
          prop: 'billType',
          label: '账单类型',
          type: 'select',
          propInDict: 'shBillType',
        },
        {
          prop: 'bkgAgentSupplierName',
          label: '订舱代理',
          type: 'text',
          width: 150,
        },
        {
          prop: 'custName',
          label: '委托单位',
          type: 'text',
          width: 150,
        },
        {
          prop: 'shipCarrierCode',
          label: '船公司',
          type: 'text',
          width: 80,
        },
        {
          prop: 'orderNo',
          label: '工作单号',
          type: 'button',
          width: 125,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option, subItem) => {
              this.showOrderDetail(row)
            },
          },
        },
        {
          prop: 'vessel',
          label: '大船船名',
          type: 'text',
          width: 200,
        },
        {
          prop: 'voyage',
          label: '航次',
          type: 'text',
        },
        {
          prop: 'soFileList',
          label: 'SO号',
          width: 120,
          className:'forceHeight',
          type: 'columnTip',
          component: 'ColumnTip',
          componentProps: {
            background: '#FFF',
            boxShadow: '1px 1px 4px #666',
            show: false,
            data: [],
            row: {},
            tag: 'isDrop',
            callback: (no, componentProps, index, row) => {
              let fileNo = row.soFileList[index]['fileNo']
              let name = row.soFileList[index]['fileName']
              officePreview({ fileNo, name })
            },
          },
        },
        // {
        //   prop: 'soInfo',
        //   label: 'SO号',
        //   type: 'text',
        //   width: 120,
        // },
        // {
        //   prop: 'sysLineGroupName',
        //   label: '大航线',
        //   type: 'text',
        // },
        {
          prop: 'sysLineName',
          label: '小航线',
          type: 'text',
        },
        {
          prop: 'fileName',
          label: '账单',
          width: 160,
          type: 'columnTip',
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            row: {},
            callback: (no, componentProps, index, row) => {
              let fileNo = row.fileNo.split(',')[index]
              let name = row.fileName.split(',')[index]
              officePreview({ fileNo, name })
            },
          },
        },
        {
          prop: 'dnBillType',
          label: '附件类型',
          type: 'select',
          propInDict: 'blFileType',
        },
        {
          prop: 'containerInfo',
          label: '箱型箱量',
          type: 'text',
        },
        {
          prop: 'commercialAttache',
          label: '商务',
          type: 'text',
          width: 90,
          formatter: ({ row }) => {
            return row.dnCheckEmployeeName
          },
        },
        // {
        // 	prop: "employeeNo",
        // 	label: "工号",
        // 	type: "text",
        // },
        {
          prop: 'billDateCheckLast',
          label: '最晚确认时间',
          type: 'text',
          width: 110,
        },
        {
          prop: 'dnCheckStatus',
          label: '确认状态',
          type: 'text',
          formatter: ({ row }) => {
            if (row.dnCheckStatus === 'submit') {
              return '<span style="color:#EDB534">待确认</span>'
            } else if (row.dnCheckStatus === 'pass') {
              return '<span style="color:#33B18A">已通过</span>'
            } else if (row.dnCheckStatus === 'refuse') {
              return '<span style="color:#CD4130">确认失败</span>'
            } else {
              return row.dnCheckStatus
            }
          },
          // formatter: ({ cellValue }) => {
          //   const text = {
          //     draft: '--',
          //     submit: '待确认',
          //     pass: '已通过',
          //     refuse: '确认失败'
          //   }
          //   const key = cellValue
          //   return text[key]
          // }
        },
        {
          prop: 'isOnline',
          label: '是否线上',
          type: 'text',
          width: 110,
          formatter: ({ row }) => {
            let isOnline = row.isOnline !== 'N'
            // 为空显示线下
            if (!row.isOnline) {
              isOnline = false
            }
            return `<span class='ls_${isOnline ? 'greenblue' : ''}'>${isOnline ? '线上' : '线下'}</span>`
          },
        },
        {
          prop: 'signStatus',
          label: '是否签费用',
          type: 'text',
          width: 110,
          formatter: ({ row }) => {
            let isSign = row.signStatus === 'yes'
            return `<span class='ls_${!isSign ? 'red' : 'green'}'>${isSign ? '有费用' : '无费用'}</span>`
          },
        },
        {
          prop: 'shBillLienAmtDesc',
          label: '金额',
          type: 'text',
          width: 110,
        },
        {
          prop: 'dnRefuseReason',
          label: '失败原因',
          type: 'select',
          propInDict: 'dnRefuseReason',
        },
        {
          prop: 'billDate',
          label: '收到账单时间',
          type: 'text',
          width: 110,
        },
        {
          prop: 'porPortName',
          label: '驳船收货地',
          type: 'text',
        },
        {
          prop: 'polPortName',
          label: '大船起运港',
          type: 'text',
          width: 200,
        },
        {
          prop: 'podPortName',
          label: '大船目的港',
          type: 'text',
          width: 200,
        },
        {
          prop: 'inputNoType',
          label: '单号类型',
          type: 'select',
          propInDict: 'billInputNoType',
        },
        {
          prop: 'inputNo',
          label: '单号',
          type: 'text',
          width: 120,
        },
        { prop: 'mblNo', label: 'MBL', type: 'text', width: 120, },
        {
          prop: 'bargeVessel',
          label: '驳船船名',
          type: 'text',
          width: 200,
        },
        {
          prop: 'bargeVoyage',
          label: '驳船航次',
          type: 'text',
        },
        // {
        //   prop: 'currency',
        //   label: '币种',
        //   type: 'text'
        // },
        // {
        //   prop: 'amt',
        //   label: '留置/亏损金额',
        //   type: 'text',
        //   width: 120
        // },
        {
          prop: 'bdEmployeeName',
          label: '销售',
          type: 'text',
        },
        {
          prop: 'bdDeptName',
          label: '销售部门',
          type: 'text',
        },
        { prop: 'prefinCloseStatus', label: '预关账状态', type: 'select', propInDict: 'finCloseStatus' },
        { prop: 'prefinCloseTime', label: '预关账时间', type: 'text', width: 130 },
        { prop: 'finCloseStatus', label: '总关账状态', type: 'text', type: 'select' },
        { prop: 'finCloseTime', label: '总关账时间', type: 'text', width: 130 },
        {
          prop: 'createdName',
          label: '创建人',
          type: 'text',
        },
        {
          prop: 'createdTime',
          label: '创建时间',
          type: 'text',
          width: 150,
        },
        {
          prop: 'dnCheckEmployeeName',
          label: '确认人',
          type: 'text',
          width: 90,
        },
        {
          prop: 'dnCheckTime',
          label: '确认时间',
          type: 'text',
          width: 150,
        },
        {
          prop: 'dnCheckApplyRemark',
          label: '单证备注',
          type: 'text',
          width: 150,
        },
        // 待订单上线
        {
          prop: 'auditRemark',
          label: '审单备注',
          type: 'text',
          width: 150,
        },
        {
          prop: 'dnRefuseRemark',
          label: '确认失败说明',
          type: 'text',
          width: 150,
        },
        {
          prop: 'pricingRemark',
          label: '商务备注',
          type: 'text',
          width: 150,
        },
        { prop: 'bkgRemark', label: '订舱备注', type: 'text', width: 150,}
      ],
      pricingRemarkPopShow: false,
      pricingRemarkRow: {},
    }
  },
  computed: {
    totalCoast() {
      let totalList = []
      let list = this.option2.data
      let currencyList = [...new Set(list.map((item) => item.currency))]
      currencyList.forEach((item) => {
        let arr = list.filter((keys) => keys.currency === item)
        let sum = arr.reduce((a, b) => Number(a) + Number(b.feeAmt), 0)
        if (sum && item) {
          totalList.push({
            currency: item,
            feeAmt: sum,
          })
        }
      })
      return totalList
    },
    totalSell() {
      let totalList = []
      let list = this.option3.data
      let currencyList = [...new Set(list.map((item) => item.currency))]
      currencyList.forEach((item) => {
        let arr = list.filter((keys) => keys.currency === item)
        let sum = arr.reduce((a, b) => Number(a) + Number(b.feeAmt), 0)
        if (sum && item) {
          totalList.push({
            currency: item,
            feeAmt: sum,
          })
        }
      })
      return totalList
    },
  },
  created() {
    querySpecialFeeItemList({ feeClassCode: 'supplier_special' }).then((res) => {
      res.data.forEach((item) => {
        FEELIST.push({ ...item, value: item.feeCode, label: item.feeName })
        FEEOBJ[item.feeCode] = item.feeName
      })
    })
    this.loanBasicData()
    let queryBillNo = this.$route.query.billNo || ''
    sessionStorage.setItem('queryBillNo', queryBillNo)
    baseCurrencyList('', 'valid')
      .then((res) => {
        let preArr = []
        let otherArr = []
        res.data.forEach((item) => {
          let currency = {
            label: `${item.code}(${item.cnName})`,
            value: item.code,
          }
          if (['CNY', 'USD'].includes(item.code)) {
            preArr.push(currency)
          } else {
            otherArr.push(currency)
          }
        })
        currencyOptions.splice(0, 1000, ...preArr, ...otherArr)
      })
      .catch(() => {})

    this.searchOption = {
      isNotAutoLoad: !queryBillNo,
      saveDefault: true,
      saveShow: true,
      saveName: 'seaconfirmBillList',
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 8,
        searchInputGroup: [
          { key: 'billNo', value: '', showType: '1' },
          { key: 'billType', value: '', showType: '2' },
          { key: 'billDate', value: '', showType: '4' },
          { key: 'dnCheckEmployeeName', value: '', showType: '5' },
          { key: 'sysLineCode', value: '', showType: '6' },
          { key: 'bkgAgentSupplierId', value: '', showType: '7' },
          { key: 'porPortCode', value: '', showType: '8' },
          { key: 'soInfo', value: '', showType: '10' },
        ],
        filterGroups: {
          allNo: { label: '各类编号', type: 'input' },
          billNo: { label: '账单确认编号', type: 'input', showType: '1' },
          orderNo: { label: '工作单号', type: 'input', showType: '1' },
          inputNo: { label: '单号', type: 'input', showType: '1' },
          mblNo: { label: 'MBL', type: 'input', showType: '1' },
          // dnCheckEmployeeId: { label: "工号", 	type: "input", 	showType: "1", },
          billType: { label: '账单类型', type: 'select', multiple: true, prop: 'shBillType' },
          inputNoType: { label: '单号类型', type: 'select', showType: '2', prop: 'billInputNoType' },
          // settleCorpCode: {
          // 	label: "结算单位",
          // 	type: "autocomplete",
          // 	showType: "3",
          // 	querySearch: (queryString, cb) => {
          // 		this.selectedOptionItem = "";
          // 		this.querySettleUnit(queryString, cb);
          // 	},
          // 	select: (optionItem, row) => {
          // 		this.selectedOptionItem = optionItem;
          // 		row.valueReq = "settleCorpCode";
          // 		row.settleCorpCode = optionItem.key;
          // 	},
          // 	change: (val, row) => {
          // 		// 延时150ms获取select中的改变
          // 		setTimeout(() => {
          // 			if (this.selectedOptionItem === "") {
          // 				row.valueReq = "";
          // 				return;
          // 			}
          // 		}, 150);
          // 	},
          // },
          bdEmployeeId: {
            label: '销售',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getSellers(queryString, item, 'bd'),
            visibleChange: (queryString, item) => this.getSellers(queryString, item, 'bd'),
          },
          bdDeptCode: {
            label: '销售部门',
            type: 'cascader',
            cascaderList: this.departmentListB,
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
            },
          },
          createdName: {
            label: '创建人',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList(queryString, item),
          },
          dnCheckEmployeeName: {
            label: '确认人',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList(queryString, item),
          },
          createdTime: { label: '创建时间', type: 'daterange', format: 'yyyy-MM-dd' },
          dnCheckTime: { label: '确认时间', type: 'daterange', format: 'yyyy-MM-dd' },
          billDate: { label: '收到账单时间', type: 'daterange', format: 'yyyy-MM-dd' },
          billDateCheckLast: { label: '最晚确认时间', type: 'daterange', format: 'yyyy-MM-dd' },
          dnCheckEmployeeId: {
            label: '商务',
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => {
              this.getEmployeeList1(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.getEmployeeList1(queryString, item)
            },
            remoteSelectList: [],
          },
          sysLineGroupCode: { label: '大航线', type: 'select', prop: 'dictGroupShipLine', multiple: true },
          sysLineCode: {
            label: '小航线',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (val, item) => this.sysLineQuerySearch(val, item),
            visibleChange: (val, item) => this.sysLineQuerySearch(val, item),
            remoteSelectList: [],
          },
          // polPortCode: {
          //   label: '起运港',
          //   type: 'remoteSelect',
          //   showType: '6',
          //   remoteMethod: (val, item) => {
          //     this.portSearch(val, item, 'port_of_basic')
          //   },
          //   visibleChange: (val, item) => {
          //     this.portSearch(val, item, 'port_of_basic')
          //   },
          //   remoteSelectList: []
          // },
          // podPortCode: {
          //   label: '目的港',
          //   type: 'remoteSelect',
          //   showType: '6',
          //   remoteMethod: (val, item) => {
          //     this.portSearch(val,'port_of_destination', '', item )
          //   },
          //   visibleChange: (val, item) => {
          //     this.portSearch(val,'port_of_destination', '', item )
          //   },
          //   remoteSelectList: [],
          // },
          vessel: {
            label: '大船船名',
            type: 'remoteSelect',
            showType: '6',
            remoteMethod: (queryString, item, row) => {
              this.querySearchFuzzyVessel(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySearchFuzzyVessel(queryString, item)
            },
            remoteSelectList: [],
          },
          voyage: {
            label: '航次',
            type: 'remoteSelect',
            showType: '6',
            remoteMethod: (queryString, item, row) => {
              this.querySearchFuzzyVoyage(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySearchFuzzyVoyage(queryString, item)
            },
            remoteSelectList: [],
          },
          bargeVessel: {
            label: '驳船船名',
            type: 'remoteSelect',
            showType: '6',
            remoteMethod: (queryString, item, row) => {
              this.querySearchVessel(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySearchVessel(queryString, item)
            },
            remoteSelectList: [],
          },
          bargeVoyage: {
            label: '驳船船次',
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => {
              this.querySearchVoyage(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySearchVoyage(queryString, item)
            },
            remoteSelectList: [],
          },
          bkgAgentSupplierId: {
            label: '订舱代理',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.getSupplierList(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.getSupplierList(queryString, item)
            },
            remoteSelectList: [],
          },
          custid: {
            label: '委托单位',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (queryString, item, ) => this.getCustList(queryString, item),
            visibleChange: (queryString, item, ) => this.getCustList(queryString, item),
            remoteSelectList: [],
          },
          shipCarrierCode: {
            label: '船公司',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (queryString, item, row) => this.baseShippingCarrierList(queryString, item),
            visibleChange: (queryString, item, row) => this.baseShippingCarrierList('', item),
            remoteSelectList: [],
          },
          porPortCode: {
            label: '驳船收货地',
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => {
              this.portSearch(queryString, 'port_of_feeder', 'valid', item)
            },
            visibleChange: (queryString, item, row) => {
              this.portSearch(queryString, 'port_of_feeder', 'valid', item)
            },
            remoteSelectList: [],
          },
          podPortCode: {
            label: '大船目的港',
            type: 'remoteSelect',
            remoteMethod: (val, item) => {
              this.portSearch(val, 'port_of_destination', 'valid', item)
            },
            visibleChange: (val, item) => {
              this.portSearch(val, 'port_of_destination', 'valid', item)
            },
            remoteSelectList: [],
          },
          // dnCheckStatus: {
          //   label: '确认状态',
          //   type: 'select',
          //   showType: '9',
          //   // const dnCheckStatus = ['', 'submit', 'pass', 'refuse']
          //   selectOptions: [
          //     { label: '待确认', value: 'submit' },
          //     { label: '已通过', value: 'pass' },
          //     { label: '确认失败', value: 'refuse' },
          //   ],
          // },

          // {
          //   prop: 'isOnline',
          //   label: '是否线上',
          //   type: 'text',
          //   width: 110,
          //   formatter: ({row}) => row.isOnline !== 'N' ? '线上' : '线下',
          // },
          // {
          //   prop: 'signStatus',
          //   label: '是否签费用',
          //   type: 'text',
          //   width: 110,
          //   formatter: ({row}) => row.signStatus !== 'yes' ? '有费用' : '无费用'
          // },
          // {
          //   prop: 'shBillLienAmtDesc',
          //   label: '金额',
          //   type: 'text',
          //   width: 110,
          // },
          // isOnline: {  label: '是否线上', type: 'select', selectOptions:[{label:'线上', value:'Y'},{label:'线下', value:'N'}]},
          signStatus: {
            label: '是否签费用',
            type: 'select',
            selectOptions: [
              { label: '有费用', value: 'yes' },
              { label: '无费用', value: 'no' },
            ],
          },
          dnRefuseReason: { label: '失败原因', prop: 'dnRefuseReason', type: 'select', showType: '8' },
          soInfo: { label: 'SO号', type: 'input', showType: '10' },
          prefinCloseStatus: { label: '预关账状态', type: 'select', prop: 'finCloseStatus' },
          prefinCloseTime: { label: '预关账时间', type: 'daterange', format: 'yyyy-MM-dd' },
          finCloseStatus: { label: '总关账状态', type: 'select', prop: 'finCloseStatus' },
          finCloseTime: { label: '总关账时间', type: 'daterange', format: 'yyyy-MM-dd' },
          dnCheckApplyRemark: { label: '单证备注', type: 'input', showType: '10' },
          dnRefuseRemark: { label: '确认失败说明', type: 'input', showType: '10' },
          pricingRemark: { label: '商务备注', type: 'input', showType: '10' },
          bkgRemark: { label: '订舱备注', type: 'input', showType: '10' },
        },
      },
    }
    const pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    let operationBtns1 = Object.assign({}, this.option.operationBtns, {
      width: 140,
      data: [
        {
          label: '费用详情',
          type: 'text',
          show: true,
          action: 'showDetail',
        },
        {
          label: '商务备注',
          type: 'text',
          colorType: 'edit',
          show: true,
          action: 'EditRemark',
        },
      ],
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'confirmBillList1',
      emptyText: '数据将在查询后显示',
      data: [],
      sortable: true,
      stripe: true,
      tips: { text: '', show: false },
      operationBtns: operationBtns1,
      pagination,
      customColumns: {
        show: true,
        handleCustomColumns: () => {
          if (!this.isNotFirtGetData) {
            this.getData(false, true).then((res) => setTimeout(() => (this.customColumnsPopShow = true), 600))
          } else {
            this.customColumnsPopShow = true
          }
        },
      },
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      tagArrShow: true,
    })
    const columns = [...this.selfColumnsBase]
    // .filter((item) => item.disabled)
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    // console.log(this.configColumns)
    let sortableList = [
      'billNo',
      'orderNo',
      'soInfo',
      'bkgAgentSupplierName',
      'dnCheckStatus',
      'inputNo',
      'billDateCheckLast',
      'billDate',
      'createdTime',
      'dnCheckTime',
    ]
    this.selfColumnsBase.forEach((item) => (sortableList.includes(item.prop) ? (item.sortable = true) : (item.sortable = false)))
    this.option1.columns = columns
    let operationBtns2 = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '添加费用',
          showFn: (row) => !row.show,
          action: 'Save',
        },
        {
          label: '删除',
          showFn: (row) => row.show,
          action: 'Delete',
          style: 'color:#CD4130',
        },
      ],
      width: 100,
    })
    this.option2 = Object.assign({}, this.option, {
      id: 'option2',
      $name: 'confirmBillList2',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      selection: false,
      operationBtns: operationBtns2,
      pagination: false,
      edit: true,
      border: true,
      rootTipsHide: true,
      // 合并单元格
      spanMethod({ row, column, rowIndex, columnIndex }) {
        // console.log(column.params.prop === 'containerType');
        // if (columnIndex === 0) {
        //   if (row.containerType === "40GP" ) {
        //     return {
        //       rowspan: 10,
        //       colspan: 1
        //     };
        //   } else {
        //     return {
        //       rowspan: 0,
        //       colspan: 0
        //     };
        //   }
        // }
      },
    })
    const columns2 = [
      {
        prop: 'containerType',
        label: '箱型',
        type: 'text',
      },
      {
        prop: 'quantity',
        label: '箱量',
        type: 'text',
      },
      {
        prop: 'feeCode',
        label: '费用名称',
        type: 'select',
        selectOptions: FEELIST,
        change: (val, row, item) => {
          let find = FEELIST.find(({ value }) => value === val)
          this.unitChange(find.feeUnit, row)
          // row.feeUnit = find.feeUnit
        },
        r: true,
      },
      {
        prop: 'currency',
        label: '币种',
        type: 'select',
        selectOptions: currencyOptions,
        r: true,
      },
      {
        prop: 'unitPrice',
        label: '单价',
        type: 'input',
        // inputType:'number',
        needTrim: true,
        validateInput: (val, row, item, change) => {
          // tzfy调整费用输入负数，其他费用输入正数
          // if (change) {
          //   const feeCode = row.feeCode?.toLowerCase()
          //   if (!feeCode) {
          //     this.$msgErrClose('请先选择费用名称！')
          //   } else if (feeCode === 'tzfy') {
          //     if (!/^-\d+(\.\d{0,2})?$/.test(val) && val != 0) {
          //       this.$msgErrClose('请输入负数！')
          //       // let res = /-\d+(\.\d{0,2})?/g.exec(val)
          //       // row[item.prop] = res ? res[0] : ''
          //     }
          //   } else {
          //     if (!/^\d+(\.\d{0,2})?$/.test(val)) {
          //       this.$msgErrClose('请输入正数！')
          //       // let res = /\d+(\.\d{0,2})?/g.exec(val)
          //       // row[item.prop] = res ? res[0] : ''
          //     }
          //   }
          // }
          this.validateInput.call(this, val, row, item, change)
          this.$nextTick(() => {
            row.feeAmt = (Number(row.unitPrice) * Number(row.unitCount)).toFixed(2)
          })
        },
      },
      {
        prop: 'feeUnit',
        label: '计费单位',
        type: 'select',
        propInDict: 'feeUnit',
        change: (val, row, item) => {
          this.unitChange(val, row)
          return
          console.log(val)
          this.$set(row, 'bothDisabled', false)
          if (val === 'count' || val === 'bill') {
            row.unitCount = 1
          } else if (val === 'unit' || val === 'teu') {
            this.$set(row, 'bothDisabled', true)
            row.unitCount = row.quantity
          } else {
            row.unitCount = ''
          }
          this.setUnitCount(row, row.quantity)
          row.feeAmt = (Number(row.unitPrice) * Number(row.unitCount)).toFixed(2)
        },
      },
      {
        prop: 'unitCount',
        label: '数量',
        type: 'input',
        bothDisabled: true,
        validateInput: (val, row, item, change) => {
          this.validateInput.call(this, val, row, item, change)
          this.$nextTick(() => {
            row.feeAmt = (Number(row.unitPrice) * Number(row.unitCount)).toFixed(2)
          })
        },
      },
      {
        prop: 'feeAmt',
        label: '金额',
        type: 'text',
      },
    ]
    this.option2.columns = columns2
    this.option3 = Object.assign({}, this.option, {
      id: 'option3',
      $name: 'confirmBillList3',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      selection: false,
      operationBtns: operationBtns2,
      pagination: false,
      edit: true,
      rootTipsHide: true,
    })
    const columns3 = [
      {
        prop: 'containerType',
        label: '箱型',
        type: 'text',
      },
      {
        prop: 'quantity',
        label: '箱量',
        type: 'text',
      },
      {
        prop: 'feeCode',
        label: '费用名称',
        type: 'select',
        selectOptions: FEELIST,
        change: (val, row, item) => {
          let find = FEELIST.find(({ value }) => value === val)
          this.unitChange(find.feeUnit, row)
          // row.feeUnit = find.feeUnit
        },
        r: true,
      },
      {
        prop: 'currency',
        label: '币种',
        type: 'select',
        selectOptions: currencyOptions,
        r: true,
      },
      {
        prop: 'unitPrice',
        label: '单价',
        type: 'input',
        // inputType:'number',
        needTrim: true,
        validateInput: (val, row, item, change) => {
          // tzfy调整费用输入负数，其他费用输入正数
          // if (change) {
          //   const feeCode = row.feeCode?.toLowerCase()
          //   if (!feeCode) {
          //     this.$msgErrClose('请先选择拿价费用名称！')
          //   } else if (feeCode === 'tzfy') {
          //     if (!/^-\d+(\.\d{0,2})?$/.test(val) && val != 0) {
          //       this.$msgErrClose('请输入负数！')
          //       // let res = /-\d+(\.\d{0,2})?/g.exec(val)
          //       // row[item.prop] = res ? res[0] : ''
          //     }
          //   } else {
          //     if (!/^\d+(\.\d{0,2})?$/.test(val)) {
          //       this.$msgErrClose('请输入正数！')
          //       // let res = /\d+(\.\d{0,2})?/g.exec(val)
          //       // row[item.prop] = res ? res[0] : ''
          //     }
          //   }
          // }
          this.validateInput.call(this, val, row, item, change)
          this.$nextTick(() => {
            row.feeAmt = (Number(row.unitPrice) * Number(row.unitCount)).toFixed(2)
          })
        },
      },
      {
        prop: 'feeUnit',
        label: '计费单位',
        type: 'select',
        propInDict: 'feeUnit',
        change: (val, row, item) => {
          this.unitChange(val, row)
          return
          console.log(val)
          this.$set(row, 'bothDisabled', false)
          if (val === 'count' || val === 'bill') {
            row.unitCount = 1
          } else if (val === 'unit' || val === 'teu') {
            this.$set(row, 'bothDisabled', true)
            row.unitCount = row.quantity
          } else {
            row.unitCount = ''
          }
          this.setUnitCount(row, row.quantity)
          this.$nextTick(() => {
            row.feeAmt = (Number(row.unitPrice) * Number(row.unitCount)).toFixed(2)
          })
        },
      },
      {
        prop: 'unitCount',
        label: '数量',
        type: 'input',
        bothDisabled: true,
        validateInput: (val, row, item, change) => {
          this.validateInput.call(this, val, row, item, change)
          this.$nextTick(() => {
            row.feeAmt = (Number(row.unitPrice) * Number(row.unitCount)).toFixed(2)
          })
        },
      },
      {
        prop: 'feeAmt',
        label: '金额',
        type: 'text',
      },
    ]
    this.option3.columns = columns3
    /* 获取列表数据*/
    // this.getData()
  },
  methods: {
    // 计费单位改变时逻辑
    unitChange(val, row) {
      console.log(val)
      row.feeUnit = val
      this.$set(row, 'bothDisabled', false)
      if (val === 'count' || val === 'bill') {
        row.unitCount = 1
      } else if (val === 'unit' || val === 'teu') {
        this.$set(row, 'bothDisabled', true)
        row.unitCount = row.quantity
      } else {
        row.unitCount = ''
      }
      this.setUnitCount(row, row.quantity)
      this.$nextTick(() => {
        row.feeAmt = new LSnum(row.unitPrice).times(row.unitCount).toNum(2)
      })
    },
    // 点击搜索
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    mapBillNo() {
      let queryBillNo = sessionStorage.getItem('queryBillNo')
      if (queryBillNo) {
        let ind = -1
        if (this.searchOption.addFilter.searchInputGroup) {
          ind = this.searchOption.addFilter.searchInputGroup.findIndex((item) => item.key === 'billNo')
        }
        if (ind !== -1) {
          console.log('查询条件有billNo字段')
          this.searchOption.addFilter.searchInputGroup.splice(ind, 1, {
            key: 'billNo',
            value: queryBillNo,
            type: 'like',
          })
        } else {
          console.log('查询条件没有billNo字段')
          this.searchOption.addFilter.searchInputGroup.push({
            key: 'billNo',
            value: queryBillNo,
            type: 'like',
          })
        }
      }
      sessionStorage.removeItem('queryBillNo')
    },
    // 获取数据
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      let data = {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.mapBillNo()
      this.finCommonSearch(data.query, this.searchOption, true, true, [], {
        special: { key: 'sysLineGroupCode', obj: data, arrayToString: true },
      })

      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      this.dnCheckStatus &&
        data.query.push({
          column: 'dnCheckStatus',
          type: 'eq',
          value: this.dnCheckStatus,
        })
      // if (index) {
      //   const dnCheckStatus = ['', 'submit', 'pass', 'refuse']
      //   data.query.push({
      //     column: 'dnCheckStatus',
      //     value: dnCheckStatus[index],
      //     type: 'eq'
      //   })
      // }
      this.lsLoading = true
      data = JSON.parse(JSON.stringify(data))
      let query = data.query
      let find = query.find(item => item.column === 'allNo')
      if(find){
        return getOrderNoQuery({no: find.value.replace(/\s/ig,','), scenes: "SHIP_BL_BILL_LIST"}).then(res => {
          find.column = 'billNo'
          find.value = res.data.toString()
          find.type = 'in'
          return this.getDataQuery(data, customerList)
        }).catch(() => this.lsLoading = false)
      }else{
        return this.getDataQuery(data, customerList)
      }

    },
    getDataQuery(data, customerList){
      this.lsLoading = true
      return listPage(data)
        .then((res) => {
          this.finCommonColumns(res)
          if (customerList) return
          this.$set(this.option1, 'emptyText', '未查询到任何数据')
          const datasource = res.data
          this.option1.data = datasource.list.map((item) => {
            // item.inputNo = item.soInfo ? item.soInfo : item.inputNo
            // item.inputNo_multiValue = item.inputNo.split(',')
            item.fileName_multiValue = item.fileName.split(',')
            item._tagArr = item.isUpdate === 'Y' ? [{ type: 'change', text: '更' }] : []
            item._isChanged = item.isUpdate === 'Y' ? true : false
            // if (item.isDrop === 'Y' || item.isDrop === 'y') {
            //   item._tagArr.push({ type: 'drop', text: '甩' })
            // }
            item._dataObj = {}
            item.soFileList_multiValue = (item.soFileList || []).map((v) => {
              if (v.isDrop === 'Y' || v.isDrop === 'y') {
                item._dataObj[v.so] = true
              }
              return v.so
            })
            return item
          })
          if (this.option1.data.find((item) => item._tagArr.length > 1)) {
            this.$set(this.option1.customColumns, 'width', 50)
          } else {
            this.$set(this.option1.customColumns, 'width', 30)
          }
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = datasource.currPage
          // this.option1.pagination.pageSize = datasource.pageSize
          // this.option1.pagination.totalCount = datasource.totalCount

          // this.option1.pagination.hasNextPage = res.data.hasNextPage
          // this.option1.pagination.hasPreviousPage = res.data.hasPreviousPage
          // this.option1.pagination.isFirstPage = res.data.isFirstPage
          // this.option1.pagination.isLastPage = res.data.isLastPage
          // this.tableQuery.currPage = res.data.currPage
          // this.option1.pagination.total = res.data.totalCount
          // this.tableQuery.pageSize = res.data.pageSize
        })
        .finally(() => (this.lsLoading = false))
    },
    // 表格选择操作
    sendMulti(data) {
      this.multipleSelection = data
    },
    // 分页方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    // 跳转确认订单详情
    goConfirmDetail(row) {
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      this.routerPush('ConfirmBillDetail', { billNo: row.billNo })
    },
    // 跳转订单详情
    showOrderDetail(row) {
      this.showOneNoDetail('order', row.jointNo || row.orderNo, { isTab: true, feeChild: 'specialManagementFee', isFromSea: true })
      // this.showOneNoDetail('order', row.jointNo || row.orderNo, { isTab: true, feeChild: 'specialManagementFee' })
    },
    // 专项费用表单
    addBillDialog() {
      let multiData = this.multipleSelection
      let len = multiData.length
      if (!len) {
        return this.$msgErrClose('请勾选需要添加专项费用的账单！')
      }
      if (multiData.find((item) => item.prefinCloseStatus === 'yes')) {
        return this.$msgErrClose('已经预关账的工作单不能在此处添加专项费用，请前往订单详情操作！')
      }
      if (multiData.find((item) => item.dnCheckStatus !== 'pass')) {
        return this.$msgErrClose('只有确认成功的账单添加专项费用！')
      }
      if (multiData.find((item) => item.amt)) {
        return this.$msgErrClose('专项费用已存在，不能重复添加！')
      }
      if (multiData.find((item) => item.orderStatus === 'cancel')) {
        return this.$msgErrClose('已取消订单不能添加专项费用！')
      }
      if (!this.selectedValueSame(multiData, ['vessel', 'voyage'])) {
        return this.$msgErrClose('所选账单的船名、航次必须相同！')
      }
      this.getAddLienFee()
    },
    // 专项管理费验证
    submitAddBill() {
      this.$refs.addBillForm.validate((valid) => {
        if (valid) {
          // 专项费用
          if (this.showCoastTable && !this.pricerQuery) {
            return this.$msgErrClose('拿价人不能为空')
          }
          let list = this.option2.data
          if (this.showCoastTable) {
            list = this.option2.data.concat(this.option3.data)
          }
          for (let i = 0; i < list.length; i++) {
            const feeCode = list[i].feeCode
            if (!list[i].feeCode) {
              return this.$msgErrClose('费用名称不能为空！')
            }
            if (!list[i].currency) {
              return this.$msgErrClose('币种不能为空！')
            }
            if (!list[i].unitPrice) {
              return this.$msgErrClose('单价不能为空！')
            }
            if (!this.validateMoney(list[i].unitPrice)) {
              throw new Error()
            }
            if (!list[i].feeUnit) {
              return this.$msgErrClose('计费单位不能为空！')
            }
            if (!list[i].unitCount) {
              return this.$msgErrClose('数量不能为空！')
            }
            if (list[i].feeCode === 'tzfy' || list[i].feeCode === 'TZFY') {
              if (Number(list[i].unitPrice) > 0) {
                return this.$msgErrClose('调整费的单价用只能输入负数！')
              }
            } else {
              if (Number(list[i].unitPrice) < 0) {
                return this.$msgErrClose('单价用只能输入正数！')
              }
            }
          }
          this.submitAddBillFn()
        }
      })
    },
    // 保存专项管理费
    submitAddBillFn() {
      const { billNo, settleCorpCode, unitCode, feeCode } = this.addBillForm
      let composeList1 = this.option2.data.map((item) => {
        const { containerType, quantity, currency, feeCode, unitPrice, feeAmt, feeUnit, unitCount } = item
        return {
          employeeId: '',
          feeCode,
          containerType,
          count: quantity,
          unitPrice,
          currency,
          feeCode,
          feeAmt,
          feeUnit,
          unitCount,
        }
      })
      let composeList2 = []
      if (this.pricerQuery) {
        composeList2 = this.option3.data.map((item) => {
          const { containerType, quantity, currency, feeCode, unitPrice, feeAmt, feeUnit, unitCount } = item
          return {
            employeeId: this.pricerQuery,
            feeCode: this.priceFeeCode,
            containerType,
            count: quantity,
            unitPrice,
            currency,
            feeCode,
            feeAmt,
            feeUnit,
            unitCount,
          }
        })
      }
      const data = {
        shBillLienNo: billNo,
        settleCorpCode: settleCorpCode && settleCorpCode.unitCode ? settleCorpCode.unitCode : unitCode,
        shBillLienSaveInfoList: composeList1.concat(composeList2),
      }
      saveShBillLienFee(data).then((res) => {
        this.$msgSucClose('添加专项费用成功！')
        this.closeDialogAddBill()
        // if(this.multipleSelection.length == 1){
        this.showDetail(this.multipleSelection[0])
        // }
      })
    },
    // 关闭专项管理费弹窗
    closeDialogAddBill() {
      this.dialogAddBill = false
      // 重置表单数据
      this.$refs.addBillForm.resetFields()
      this.showCoastTable = false
      this.pricerQuery = ''
      this.priceFeeCode = ''
      // 重新请求列表
      this.getData()
    },
    // 关闭拒绝弹窗
    closeRefuse() {
      this.refuseOpen = false
      this.$refs.refuseForm.clearValidate(['dnRefuseReason'])
      this.refuseForm = {
        dnRefuseReason: '',
        dnRefuseRemark: '',
      }
    },
    // 审批操作
    shBillConfirmFn(dnCheckStatus) {
      const len = this.multipleSelection.length
      const text = dnCheckStatus === 'pass' ? '审批通过' : '审批拒绝'
      if (!len) {
        return this.$msgErrClose(`请勾选需要${text}的项！`)
      }
      let item0 = this.multipleSelection[0]
      if (
        len > 1 &&
        this.multipleSelection.some((item) => {
          return !item.vessel || !item.voyage || item.vessel !== item0.vessel || item.voyage !== item0.voyage
        })
      ) {
        return this.$msgErrClose(`相同的船名航次才可以批量确认！`)
      }
      // const status = this.multipleSelection[0].dnCheckStatus
      if (this.multipleSelection.find((item) => item.dnCheckStatus !== 'submit')) {
        return this.$msgErrClose(`只有待确认的账单才能进行审批操作！`)
      }
      const refuse = dnCheckStatus === 'refuse'
      if (refuse) {
        // 审批拒绝打开拒绝原因弹出框框
        this.refuseOpentitle = '确认失败'
        this.checkStatus = 'refuse'
        this.refuseOpen = true
      } else {
        // this.refuseOpentitle = '确认成功'
        // this.checkStatus = 'pass'
        // this.refuseOpen = true
        // this.refuseOpentitle = '确认成功'
        // this.checkStatus = 'pass'
        this.$confirmWarn('是否确认成功？', () => {
          this.shBillConfirmSuc()
        })
      }
    },
    // 审批成功
    shBillConfirmSuc() {
      // 审批通过，请求审批接口
      const data = {
        billNoList: this.multipleSelection.map((item) => item.billNo),
        checkStatus: 'pass',
        dnRefuseRemark: this.refuseForm.dnRefuseRemark,
      }
      shBillConfirm(data).then((res) => {
        // this.closeRefuse()
        this.$message({ message: '确认成功通过', type: 'success' })
        if (this.checkAuth(this.$route.name, 'tab-confirmBillList', 'btn-addBillDialog')) {
          this.multipleSelection[0].dnCheckStatus = 'pass'
          // 是否添加管理费
          this.$confirm('是否添加供应商专项费用？', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
          })
            .then(() => {
              // 查询专项管理费用
              this.getAddLienFee()
            })
            .catch(() => {
              // 获取新数据
              this.getData()
            })
        } else {
          this.getData()
        }
      })
    },
    // 取消确认
    cancelConfirm() {
      if (this.multipleSelection.length !== 1) {
        return this.$msgErrClose(`请勾选一个需要撤销的项！`)
      }
      if (this.multipleSelection[0].dnCheckStatus !== 'pass') {
        return this.$msgErrClose(`请勾选已确认通过的记录进行操作！`)
      }
      if (this.multipleSelection[0].signStatus !== 'no') {
        return this.$msgErrClose(`船东账单费用已录入，无法撤销确认！`)
      }
      this.cancelOpen = true
      // this.$confirmWarn('是否撤销确认此选项？', () => {
      //   this.lsLoading = true
      //   cancelConfirm({ billNo: this.multipleSelection[0].billNo })
      //     .then((res) => {
      //       this.$msgSucClose('撤销成功！')
      //       this.getData()
      //     })
      //     .catch(() => (this.lsLoading = false))
      // })
    },
    handleCancelRemark(){
      this.$refs.cancelForm.validate(valid => {
        if(!valid) return
        let cancelRemark = this.cancelForm.cancelRemark ? this.cancelForm.cancelRemark : this.cancelTypeList.find(v => v.value === this.cancelForm.cancelType).label
        cancelConfirm({ billNo: this.multipleSelection[0].billNo, cancelRemark})
          .then((res) => {
            this.cancelForm.cancelRemark = ''
            this.cancelForm.cancelType = 'err'
            this.$refs.cancelForm.clearValidate()
            this.cancelOpen = false
            this.$msgSucClose('撤销成功！')
            this.getData()
          })
      })
    },
    // 查询专项费用相关数据
    getAddLienFee() {
      if (this.multipleSelection.find((v) => v.signStatus === 'yes')) {
        let msg = '有工作单已签费用，是否继续签费用？'
        if (this.multipleSelection.length === 1) {
          msg = '该工作单已签费用，是否继续签费用？'
        }
        this.$confirmWarn({ body: msg, confirm: '是', cancel: '否' }, () => {
          this.getAddLienFee2()
        })
      } else {
        this.getAddLienFee2()
      }
    },
    getAddLienFee2() {
      if (this.multipleSelection[0].inputNoType === 'BL') {
        this.addBillForm.inputNoType = '提单号:'
        this.addBillForm.inputNo = [...new Set(this.multipleSelection.map((v) => v.inputNo))].toString()
      } else {
        this.addBillForm.inputNoType = 'SO号:'
        this.addBillForm.inputNo = [...new Set(this.multipleSelection.map((v) => v.soInfo))].toString()
      }
      this.addBillForm.billNo = this.multipleSelection.map((v) => v.billNo).toString()

      // const { billNo, inputNo, inputNoType, soInfo } = this.multipleSelection[0]
      // this.addBillForm.billNo = billNo
      // this.addBillForm.inputNo = inputNo
      // this.addBillForm.inputNo = inputNoType === 'BL' ? inputNo : soInfo
      // this.addBillForm.inputNoType = inputNoType === 'BL' ? '提单号:' : 'SO号:'
      toAddLienFee({ billNo: this.addBillForm.billNo }).then((res) => {
        let { polPortName, podPortName, vessel, voyage, settleUnit } = res.data
        this.addBillForm = Object.assign({}, this.addBillForm, res.data)
        this.addBillForm.poldName = `${polPortName}/${podPortName}`
        this.addBillForm.shipName = `${vessel}/${voyage}`
        settleUnit = settleUnit && settleUnit[0]
        this.addBillForm.settleCorpCode = settleUnit?.unitName
        this.addBillForm.unitCode = settleUnit?.unitCode

        const containerList = res.data.containerList.map((item) => {
          return { ...item, unitPrice: '', feeUnit: '', unitCount: '', feeAmt: '0.00', edit: true }
        })
        this.option2.data = containerList
        this.containerList = JSON.parse(JSON.stringify(containerList))
        this.dialogAddBill = true
      })
    },
    // 审批拒绝
    handleSubmit() {
      if (this.checkStatus === 'pass') {
        this.shBillConfirmSuc()
        return
      }
      this.$refs.refuseForm.validate((valid) => {
        if (valid) {
          let checkStatus = this.checkStatus
          const data = {
            // billNo: this.multipleSelection[0].billNo,
            billNoList: this.multipleSelection.map((item) => item.billNo),
            checkStatus,
            dnRefuseReason: this.refuseForm.dnRefuseReason,
            dnRefuseRemark: this.refuseForm.dnRefuseRemark,
          }
          shBillConfirm(data)
            .then((res) => {
              this.$message({ message: this.refuseOpentitle, type: 'success' })
              this.closeRefuse()
              this.getData()
            })
            .catch((err) => {
              this.refuseOpen = false
            })
        }
      })
    },
    // 商务下拉框
    getEmployeeList(queryString, item) {
      employeeSelectlist({ name: queryString }).then((res) => {
        let list = res.data.map((item) => ({ label: item.cname, value: item.cname }))
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList = list
      })
    },
    getEmployeeList1(queryString, item) {
      employeeSelectlist({ name: queryString }).then((res) => {
        let list = res.data.map((item) => ({ label: item.cname, value: item.employeeId }))
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList = list
      })
    },
    // 远程搜索港口下拉数据
    // portSearch(queryString, item, port) {
    //   const data = {
    //     queryString,
    //     portAttribute: port,
    //   }
    //   this.$store.dispatch('dict/basePortList', data).then((data) => {
    //     if (
    //       this.remoteSelectCommon(
    //         item,
    //         data.map((item) => ({ label: item.value, value: item.portCode }))
    //       )
    //     )
    //       return
    //     item.remoteSelectList = data.map((item) => {
    //       return {
    //         label: item.value,
    //         value: item.portCode,
    //       }
    //     })
    //   })
    // },
    // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString, item) {
      let sysLineGroupCode = this.searchOption.addFilter.searchInputGroup.find((item) => item.key === 'sysLineGroupCode')
      sysLineGroupCode = sysLineGroupCode && sysLineGroupCode.value.length ? sysLineGroupCode.value.toString() : ''
      this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '', sysLineGroupCode }).then((data) => {
        let list = data.map((item) => ({ label: item.value, value: item.key }))
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList = list
      })
    },
    // 远程搜索港口下拉数据
    portSearch(queryString, portAttribute, state, item) {
      basePortList(queryString, portAttribute, state).then((res) => {
        let list = res.data.map((item) => {
          return {
            label: `${item.ename},${item.countryEname}`,
            value: item.portCode,
          }
        })
        if (this.remoteSelectCommon(item, list)) {
          return
        }
        item.remoteSelectList = list
      })
    },
    getSpecialFeeList() {
      querySpecialFeeItemList({ feeClassCode: 'supplier_special' }).then((res) => {
        this.specialFeeOption = res.data.map((item) => {
          return { label: item.feeName, value: item.feeCode }
        })
      })
    },
    // 获取订舱代理
    getSupplierList(queryString, item) {
      this.$store
        .dispatch('dict/querySupplierList', {
          category: 'category',
          categoryType: 'in',
          value: 'bkg_carrier,bkg_agent',
          queryString: queryString,
        })
        .then((data) => {
          let list = (data.list || []).map((ele) => ({
            label: this.$language == 'en' ? ele.ename : ele.name,
            value: ele.supplierId ? Number(ele.supplierId) : '',
          }))
          if (this.remoteSelectCommon(item, list)) return
          item.remoteSelectList = list
        })
    },
    // 大船船名模糊查询
    querySearchFuzzyVessel(queryString, item) {
      this.$store.dispatch('dict/queryFuzzyVessleList', { name: queryString || '' }).then((data) => {
        // if (this.remoteSelectCommon(item, (data || []).map(item=>({label:item.key,value:item.value})))) return
        if (data.length) {
          item.remoteSelectList = data.map((ele) => {
            return { label: ele.key, value: ele.value }
          })
          !data.some((item) => item.value === queryString) &&
            item.remoteSelectList.unshift({ label: queryString, value: queryString })
        } else {
          if (queryString) {
            item.remoteSelectList = [{ label: queryString, value: queryString }]
          }
        }
      })
    },
    // 船名输入建议
    querySearchVessel(queryString, item, isFuzzy) {
      this.$store.dispatch('dict/queryVessleList', { name: queryString }).then((data) => {
        let list = (data || []).map((item) => ({ label: item.key, value: item.value }))
        if (this.remoteSelectCommon(item, list)) return
        if (data.length) {
          item.remoteSelectList = list
        }
      })
    },
    querySearchFuzzyVoyage(queryString, item) {
      this.$store.dispatch('dict/queryFuzzyVoyageList', { name: queryString || '' }).then((data) => {
        // if (this.remoteSelectCommon(item, data.map(item=>({label:item.key,value:item.value})))) return
        if (data.length) {
          item.remoteSelectList = data.map((ele) => {
            return { label: ele.key, value: ele.value }
          })
          !data.some((item) => item.value === queryString) &&
            item.remoteSelectList.unshift({ label: queryString, value: queryString })
        } else {
          if (queryString) {
            item.remoteSelectList = [{ label: queryString, value: queryString }]
          }
        }
      })
    },
    // 航次输入建议
    querySearchVoyage(queryString, item) {
      this.$store.dispatch('dict/queryVoyageList', { name: queryString }).then((data) => {
        let list = data.map((item) => ({ label: item.key, value: item.value }))
        if (this.remoteSelectCommon(item, list)) return
        if (data.length) {
          item.remoteSelectList = list
        }
      })
    },
    baseShippingCarrierList(name, item) {
      baseShippingCarrierList(name).then((res) => {
        let list = (res.data || []).map(({ carrierCode }) => ({ value: carrierCode, label: carrierCode }))
        this.remoteSelectCommon(item, list)
      })
    },
    // 改变费用名称校验tab数据
    checkPrice() {
      // let feeCode = this.addBillForm.feeCode.toLowerCase()
      // this.option2.data.forEach(item => {
      // 	let unitPrice = item.unitPrice
      // 	if (feeCode === 'tzfy') {
      // 		item.unitPrice = Number(unitPrice) > 0 ? ('-' + unitPrice) : unitPrice.replace(/[^-|\d]/g, '')
      // 	} else {
      // 		item.unitPrice = Number(unitPrice) < 0 ? String(unitPrice).replace(/-/g, '') : unitPrice.replace(/[^\d]/g, '')
      // 	}
      // })
    },
    // 拿价人
    pricerQuerySearch(queryString = '') {
      if (queryString === true) {
        queryString = ''
      }
      const params = {
        name: queryString,
        state: 'valid',
        roleCodes: 'pricing',
      }
      this.$store.dispatch('dict/employeeSelectlist', params).then((data) => {
        this.pricerQueryArr = data.map((ele) => {
          return Object.assign(ele, { label: ele.value, value: ele.key })
        })
      })
    },
    handleSave($index, row, option) {
      let containerObj = {
        containerType: row.containerType,
        currency: '',
        edit: true,
        show: true,
        feeAmt: '0.00',
        quantity: row.quantity,
        unitPrice: '',
        feeCode: '',
        feeUnit: '',
        unitCount: '',
      }
      if (option.id === 'option2') {
        option.data.splice($index + 1, 0, containerObj)
      }
      if (option.id === 'option3') {
        option.data.splice($index + 1, 0, containerObj)
      }
    },
    handleDelete($index, row, option) {
      option.data.splice($index, 1)
    },
    handleCollapse(index) {
      this.$set(this.showTable, index, !this.showTable[index])
    },
    showDetail(row) {
      this.showOneNoDetail('order', row.jointNo || row.orderNo, { feeChild: 'specialManagementFee', isFromSea: true })
      // this.showOneNoDetail('order', row.jointNo || row.orderNo, { feeChild: 'specialManagementFee' })
    },
    handleEditRemark(row) {
      this.pricingRemarkPopShow = true
      this.pricingRemarkRow = row
    },
    pricingRemarkPopClose(action) {
      if (action === 'Confirm') {
        this.getData()
      }
      this.pricingRemarkPopShow = false
    },
    handleKeyDown(e) {
      let key = null
      if (window.event === undefined) {
        key = e.keyCode
      } else {
        key = window.event.keyCode
      }
      if (key === 13) {
        // 阻止分页的页码enter键触发全局的监听事件
        let className = window.event.target.parentNode.className
        if (className.includes('el-pagination__editor')) return
        //触发的事件
        this.search()
      }
    },
    // 获取销售
    getSellers(name = '', item, role) {
      let query = [{ column: 'roleCode', type: 'eq', value: role }] // column: 'roleCode', type: 'in', value: 'bd,obd'
      name && query.push({ column: 'name', type: 'eq', value: name })
      listByRole({ currPage: 1, pageSize: 30, query }).then(({ data: { list } }) => {
        list = list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList = list
      })
    },
    // 获取委托单位
    getCustList(val, item) {
      let data = {
        currPage: 1,
        pageSize: 30,
        query: val
          ? [
              { column: 'name', type: 'like', value: val },
              { column: 'roleType', type: 'eq', value: 'client' }
            ]
          : [{ column: 'roleType', type: 'eq', value: 'client' }]
      }
      customerListAllStatus(data).then(res => {
        let list = res.data.list.map(ele => ({ ...ele, label: ele.name, value: ele.custid }))
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList.splice(0, 1000, ...list)
      })
    },
    // 部门下拉框
    loanBasicData() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        this.departmentListB.splice(0, 1000, ...this.getTreeData(res.data || []))
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
    },
    showCoastTableChange() {
      this.showCoastTable = !this.showCoastTable
      this.option3.data = JSON.parse(JSON.stringify(this.containerList))
      this.pricerQuery = ''
    },
  },
  watch: {
    dnCheckStatus() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
  },
  mounted() {
    // 获取币种下拉框
    // this.getCurrencyList()
    // 获取特殊费用下拉框
    // this.getSpecialFeeList()
  },
  deactivated() {
    // window.removeEventListener('keydown', this.handleKeyDown)
  },
  activated() {
    // window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    /* 获取列表数据*/
    if (!this.$route.meta.isUseCache) {
      this.getData()
    }
  },
}
</script>

<style lang="scss" scoped>
.finance-confirm-bill {
  .add-bill-cnt {
    .el-input,
    .el-select {
      width: 200px;
    }
    .totalcoast {
      height: 35px;
      line-height: 35px;
      background-color: #e7eeff;
      text-align: right;
      color: #333;
      margin: 0 8px;
      font-size: 12px;
      top: -8px;
      position: relative;
      b {
        color: #3e80f5;
        margin: 0 6px;
      }
    }
    .cost-employed {
      font-size: 12px;
      margin: 10px;
      display: flex;
      align-items: center;
      font-weight: 500;
      .cost-item {
        flex-basis: 300px;
      }
    }
    .but {
      margin: 8px;
    }
  }
}
.el-dialog .el-select{
  width: 100%;
}
</style>

<style lang="scss">
.app-wrapper .finance-page {
  .finance-confirm-bill {
    textarea {
      height: 80px !important;
    }
  }
}
</style>
