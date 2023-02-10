<template>
<!-- <el-dialog
  :title="'关账调费' + comeType"
  :visible.sync="dialogVisible.show"
  :close-on-click-modal="false"
  :destroy-on-close="true"
  class="feeclosed-modifyFee-dialog"
  width="1150px"> -->
<div class="finance-page">
  <div class="finance-list-container">
    <div class="money-box money-box-border-bottom">
      <div class="money-box-left">
        <div class="money-title">关账调费</div>
      </div>
      <div class="money-box-right">
        <el-button type="success" @click="submit" size="mini" :loading="loading">提交</el-button>
        <el-button @click="cancel('click')" size="mini">取消</el-button>
      </div>
    </div>
  </div>
  <div class="finance-detail-info">
    <el-form :model="form" ref="form" :inline="true" size="mini" label-width="63px">
      <el-form-item label="调费原因"
        :rules="{required: true, message: ' ', trigger: 'change'}">
        <el-select v-model="reason" placeholder="请选择" clearable
          @change="reasonChange">
          <el-option
           :key="'reason' + index"
           :label="item.label"
           :value="item.value"
           v-for="(item, index) in dictMap['feeAdjustReason']">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="实际责任人" label-width="85px"
        :rules="{required: true, message: ' ', trigger: 'change'}">
        <el-select v-model="dutyPersonVk" placeholder="请选择"
          :filterable="isFinBillFee"
          remote
          clearable
          value-key="value"
          @visible-change="(value) => {if(value){employeeSelectlistLocal('')}}"
          :remote-method="isFinBillFee ? employeeSelectlistLocal : null"
          @change="personChangeLocal">
          <!-- :remote-method="employeeSelectlistLocal" -->
          <el-option
            v-for="(item, index) in employeeSelectOptions"
            :key="'employeeSelectOptions' + index"
            :label="item.label"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="isOtherDuty" label="发起审批人" label-width="100px"
        :rules="{required: true, message: ' ', trigger: 'change'}">
        <el-select v-model="applyPersonId" placeholder="请选择"
          :filterable="isFinBillFee"
          remote
          clearable
          @visible-change="(value) => {if(value){employeeSelectlistLocal('', true)}}"
          :remote-method="isFinBillFee ? employeeSelectlistLocal2 : null"
          @change="personChangeLocal2">
          <!-- :remote-method="employeeSelectlistLocal" -->
          <el-option
            v-for="(item, index) in employeeSelectOptions2"
            :key="'employeeSelectOptions2' + index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <!-- 提交前校验的时候会带出审批人，此处不显示 -->
      <!-- <el-form-item label="审核人" prop="auditPerson" :rules="{required: true, message: ' ', trigger: 'change'}">
        <el-input disabled v-model="form.auditPerson"></el-input>
      </el-form-item>
      <el-form-item v-if="$route.query.jointNo" prop="auditPersonMain" label="主审核人" :rules="{required: true, message: ' ', trigger: 'change'}">
        <el-input disabled v-model="form.auditPersonMain"></el-input>
      </el-form-item> -->
      <el-form-item label="调费备注" class="modifyfee-detail-info-remark" style="width:100%;"
        :rules="{required: true, message: ' ', trigger: 'blur'}">
        <!-- :rules="{required: true, message: '备注不能为空', trigger: 'blur'}" -->
        <el-input
          placeholder="请详细填写调费原因"
          v-model="remark"
          type="textarea"
          clearable
          maxlength="500"
          show-word-limit>
        </el-input>
      </el-form-item>
      <!-- 先挂起 -->
      <!-- <el-form-item>
        <el-popover
          placement="bottom-start"
          trigger="hover">
          <div class="money-dialog money-dialog-profit">
            <div style="display:inline-block;margin-right:26px;font-weight:600;color:#222;line-height:20px;">
              <span>关账调费导致利润减少，审批要求如下，币种USD。</span>
            </div>
          </div>
          <div class="finance-table">
            <div style="padding:8px;background:#fff;">
              <el-table
                fit
                style="width:100%"
                :data="option4.data"
              >
                <el-table-column
                  v-for="(item, index) in option4.columns"
                  :key="item.prop + index"
                  :label="item.label"
                  align="center"
                  header-align="center"
                  :width="item.width || 80"
                  :prop="item.prop"
                  :formatter="(row,col,val)=> item.formatter ? item.formatter(row, col) : val"
                >
                </el-table-column>
              </el-table>
            </div>
          </div>
          <i class="el-icon el-icon-question" slot="reference" style="font-size:14px;color:#BFBFBF;"></i>
        </el-popover>
      </el-form-item> -->
    </el-form>
  </div>
  <div class="finance-table-container">
    <div class="money-box">
      <div class="money-box-left">
        <div class="money-title">{{moneyTitle1}}</div>
        <div class="money-total">
          <span style="color:#222;">原费用应收合计：<span class="money-recei-color">{{selectionReceiEachSum}}</span></span>
          <span style="color:#222;margin-left:12px;">原费用应付合计：<span class="money-pay-color">{{selectionPayEachSum}}</span></span>
          <!-- v-if="selectionPayEachSum" -->
        </div>
        <div class="money-total">
          <!-- <span style="color:#222;">{{addFeesSum}}</span> -->
          <span style="color:#222;">新增费用应收合计：<span class="money-recei-color">{{addFeesReceiEachSum}}</span></span>
          <span style="color:#222;margin-left:12px;">新增费用应付合计：<span class="money-pay-color">{{addFeesPayEachSum}}</span></span>
        </div>
        <!-- 先挂起 -->
        <div class="money-total" v-show="!isFinBillFee && showReduceSum && reduceSum < 0" style="margin-right:0px;">
          利润变更：<span class="money-pay-color">减少</span> USD <span class="money-pay-color">{{reduceSum}}</span>
          <el-popover
            placement="bottom-start"
            trigger="hover">
            <div class="money-dialog money-dialog-profit" style="padding:0;">
              <div style="font-size:12px;">
                <div
                  v-html="`<span class='el-icon-info' style='color:#E9851F;margin-right:6px;'></span>修改前：订单毛利CNY<span style='color:#E9851F'>${changeInfo.cnyProfitBefore}</span>(USD<span style='color:#E9851F'>${changeInfo.usdProfitBefore}</span>) 毛利率：${changeInfo.grossProfitBeforeStr}`"
                ></div>
                <div
                  v-html="`<span class='el-icon-success' style='color:#33B18A;margin-right:6px;'></span>修改后：订单毛利CNY<span style='color:#33b18a'>${changeInfo.cnyProfitAfter}</span>(USD<span style='color:#33b18a'>${changeInfo.usdProfitAfter}</span>) 毛利率：${changeInfo.grossProfitAfterStr}`"
                ></div>
              </div>
            </div>
            <i class="el-icon el-icon-question" slot="reference" style="font-size:14px;color:#BFBFBF;margin-left:10px;"></i>
          </el-popover>
        </div>
      </div>
      <div class="money-box-right">
        <el-button v-if="!isFinBillFee" class="finance-btn" @click="addModify(null)" size="mini" type="primary">新增</el-button>
        <el-button v-if="!isFinBillFee" class="finance-btn" @click="alertTemplate" size="mini">选择模板导入</el-button>
        <el-button v-if="!isFinBillFee" class="finance-btn" @click="handleCopy" size="mini">复制</el-button>
        <el-button class="finance-btn" @click="handleDelete" size="mini" type="danger">删除</el-button>
        <!-- <el-button type="text" class="collapse-btn" @click="handleCollapse('Table1')" size="mini">收起<i :class="{'el-icon-arrow-up': showTable1, 'el-icon-arrow-down': !showTable1}"></i></el-button> -->
      </div>
    </div>
    <FinanceTable
      ref="option1"
      :option="option1"
      @send-multi="sendMulti"/>
  </div>
  <div class="finance-table-container" v-if="comeType === '修改'">
    <div class="money-box">
      <div class="money-box-left">
        <div class="money-title">{{moneyTitle2}}</div>
        <!-- <div class="money-total" v-for="(item, index) in moneyTotalReceive" :key="'moneyTotalReceive' + index">
          {{item.currency}}合计：<span :class="{'money-pay-color': moneyTitle1 === '应付' ? true : false}">{{item.sum}}</span>
        </div> -->
      </div>
    </div>
    <FinanceTable
      :option="option2"/>
  </div>
  <!-- <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="submit" size="mini" :loading="loading">保存</el-button>
    <el-button @click="dialogVisible.show = false" size="mini">取消</el-button>
  </span> -->
  <SpecFeeMngApplyDialog
    :dialog-visible="specFeeMngApplyVisible"
    :fees="updateFees"
    :is-special-fee="isSpecialFee"
    :is-business-fee="isBusinessFee"
    :is-modify-fee="isModifyFee"
    :fee-save-verify-data="feeSaveVerifyData"
    :saveApplyCallback="saveApplyCallback"
    @cancel-edit="cancelEdit" />
  <div v-if="templateListVisible">
    <el-dialog
      title="选择模板导入"
      :visible.sync="templateListVisible"
      :close-on-click-modal="false"
      :append-to-body="true"
      custom-class="usable-fee-templ-cont"
      width="1000px">
      <!-- <UsableFeeTemplate ref="usableFeeTemplate" :tempType="tempType" :useNo="useNo" :businessType="businessType" @set-fee-template="setFeeTemplate" /> -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="confirmFeeTemplate" size="mini" type="primary">确定</el-button>
        <el-button @click="templateListVisible = false" size="mini">取消</el-button>
      </span>
    </el-dialog>
  </div>
</div>
<!-- </el-dialog> -->
</template>
<script>
import FinanceTable from '../../../../components/financeTableMass/financeTableMass'
import { mixin } from '../../mixin'
import { orderFeeMixin } from '@/views/finance/orderFee/orderFee/components/components/orderFeeMixin'
import { mapState, mapGetters } from 'vuex'
import { saveOrderBizFee, saveOrderSpecialFee as saveOrderSpecialFeeAdjust, saveFinBillFee, getAdjustAuditEmployee } from '@/api/fin/feeAdjust'
import { specFeeSaveVerify, specFeeMngApply } from '@/api/fin/specfee'
import { bizFeeSaveVerify, getOrderProfit } from '@/api/fin/fee'
import { feeAdjustRoleJobList } from '@/api/fin/orderFee'
import { decimalFixed2 } from '@/views/finance/utils/finance'
import { getTaxRate } from '@/api/fin/tax'
import { acctExchangeRate } from '@/api/base'
import SpecFeeMngApplyDialog from '@/views/finance/orderFee/orderFee/components/components/specFeeMngApplyDialog'
// import UsableFeeTemplate from '@/views/finance/orderFee/feeTemplateList/components/usableFeeTemplate'
import { getTemplateItem } from '@/api/fin/feeTemp'

export default {
  name: 'feeClosedModifyFeeApply',
  mixins: [mixin, orderFeeMixin],
  props: {
  },
  data() {
    return {
      option1: {},
      option2: {},
      option4: {},
      multipleSelection1: [],
      moneyTitle1: '费用修改',
      moneyTitle2: '红冲记录',
      moneyTotalReceive: [],
      comeType: '修改',
      hedgingRecord: [],
      deleteSelection: [],
      orderNo: '',
      reason: '',
      applyPersonId: '',
      dutyPersonVk: '',
      dutyPerson: '',
      remark: '',
      employeeSelectOptions: [],
      employeeSelectOptions2: [],
      isOtherDuty: false,
      form: {
        auditPerson: '',
        auditPersonMain: '',
        remark: ''
      },
      timer1: null,
      jointNo: '',
      useNo: '',
      specFeeMngApplyVisible: {
        show: false
      },
      updateFees: [],
      ship: true,
      air: false,
      rail: false,
      isModifyFee: true,
      loading: false,
      feeSaveVerifyData: {},
      saveApplyCallback: null,
      exchangeRateList: [],
      exchangeRateObj: {},
      selectionSum: 0,
      selectionReceiSum: 0,
      selectionReceiEachSum: '',
      selectionPayEachSum: '',
      reduceSum: 0,
      showReduceSum: false,
      changeInfo: {
        cnyProfitBefore: '',
        cnyProfitAfter: '',
        usdProfitBefore: '',
        usdProfitAfter: '',
        grossProfitBeforeStr: '',
        grossProfitAfterStr: ''
      },
      templateListVisible: false,
      addFeesSum: '',
      addFeesReceiEachSum: '',
      addFeesPayEachSum: '',
      // 原props begin
      dialogVisible: {},
      multipleSelection: [],
      isSpecialFee: false,
      isBusinessFee: false,
      sourceBizNo: '',
      finBillNo: '',
      isFinBillFee: false,
      airCargoStates: {},
      containerCount: '',
      blList: [],
      client: {},
      tempType: '',
      businessType: ''
      // end
    }
  },
  created() {
    this.getProps()
    this.comeType = this.multipleSelection.length > 0 ? '修改' : '新增'
    this.moneyTitle1 = this.comeType === '修改' ? '费用修改' : '费用新增'
    let operationBtns = Object.assign(this.option.operationBtns, {
      data: [
        {
          label: '删除',
          type: 'text',
          show: true,
          action: 'Delete'
        }
      ],
      show: false
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'feeClosedModifyFeeDialog1',
      edit: true,
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns,
      rootTipsHide: true,
      maxHeight: 280
    })
    this.option2 = Object.assign({}, this.option, {
      id: 'option2', $name: 'feeClosedModifyFeeDialog2',
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
      rootTipsHide: true,
      maxHeight: 280
    })
    this.option4 = Object.assign({}, this.option, {
      id: 'option4', $name: 'feeClosedModifyFeeDialog4',
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
      columns: [
        {
          prop: 'orderType',
          label: '订单类型',
          type: 'text',
          width: 150,
        },
        {
          prop: 'team',
          label: '主管',
          type: 'text',
          width: 100,
        },
        {
          prop: 'manager',
          label: '经理',
          type: 'text',
          width: 100,
        },
        {
          prop: 'president',
          label: '总裁办',
          type: 'text',
          width: 100,
        }
      ],
      data: [
        {
          orderType: '国外同行',
          team: '1~200',
          manager: '201~350',
          president: '>350'
        },
        {
          orderType: '国内同行',
          team: '1~150',
          manager: '151~300',
          president: '>300'
        },
        {
          orderType: '国内直客&国外直客',
          team: '1~200',
          manager: '201~350',
          president: '>350'
        },
      ]
    })
    this.setColumns1()
    this.setColumns2()
    this.getOrderNo()
  },
  methods: {
    getProps() {
      let finLStorage = localStorage.getItem('finLStorage')
      finLStorage = finLStorage ? JSON.parse(finLStorage) : {}
      let modifyFeeProps = finLStorage.modifyFeeProps
      this.dialogVisible = modifyFeeProps.dialogVisible
      this.multipleSelection = modifyFeeProps.multipleSelection
      this.isSpecialFee = modifyFeeProps.isSpecialFee
      this.isBusinessFee = modifyFeeProps.isBusinessFee
      this.sourceBizNo = modifyFeeProps.sourceBizNo
      this.finBillNo = modifyFeeProps.finBillNo
      this.isFinBillFee = modifyFeeProps.isFinBillFee
      this.airCargoStates = modifyFeeProps.airCargoStates
      this.containerCount = modifyFeeProps.containerCount
      this.blList = modifyFeeProps.blList
      this.client = modifyFeeProps.client
      this.tempType = modifyFeeProps.tempType
      this.businessType = modifyFeeProps.businessType
      this.orderNo = modifyFeeProps.orderNo
      this.jointNo = modifyFeeProps.jointNo
      this.useNo = this.jointNo ? this.jointNo : this.orderNo
      let businessBroad = modifyFeeProps.businessBroad
			businessBroad = businessBroad ? businessBroad : ''
			this.ship = businessBroad.includes('ship') || !businessBroad
			this.air = businessBroad.includes('air') ? true : false
      this.rail = businessBroad.includes('rail') ? true : false
    },
    setColumns1() {
      let columns = ['receipayType', 'feeName', 'serviceName', 'settleCorpName', 'currency', 'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'blId', 'taxRate', 'remark', 'negativeType', 'splitFromOrderNo', 'negativeFollowerId', 'feeEnName']
      if (this.isSpecialFee) columns = ['receipayType', 'feeName', 'serviceName', 'settleCorpName', 'currency', 'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'taxRate', 'remark', 'negativeType', 'negativeFollowerId', 'feeEnName']
      if (this.isFinBillFee) columns = ['receipayType', 'feeName', 'settleCorpName', 'currency', 'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'remark', 'feeEnName']
      let arr = []
      columns.forEach(value => {
        let obj = this.columnsBaseLocal.find(item => {
          return item.prop === value
        })
        if (!this.isSpecialFee) {
          if (obj && obj.prop === 'feeAmt') {
            obj = Object.assign({}, obj, {
              type: 'text'
            })
          } else if (obj && obj.prop === 'feeName') {
            obj = Object.assign({}, obj, {
              width: 140
            })
          } else if (obj.prop === 'blId') {
            let remoteSelectList = this.blList.map(bl => {
              return { ...bl, value: bl.blId, label: `【${bl.blType === 'mbl' ? 'M' : bl.blType === 'hbl' ? 'H' : bl.blType === 'mawb' ? '主' : bl.blType === 'hawb' ? '分' : ''}】${bl.blNo ? bl.blNo : bl.blId}` }
            })
            obj = Object.assign({}, obj, { remoteSelectList })
          }
        } else if (this.isSpecialFee) {
          if (obj && obj.prop === 'feeName') {
            obj = Object.assign({}, obj, {
              width: 140
            })
          } else if (obj && obj.prop === 'feeAmt') {
            obj = Object.assign({}, obj, {
              readOnly: true
            })
          } else if (obj && obj.prop === 'receipayType') {
            obj = Object.assign({}, obj, {
              readOnly: true
            })
          } else if (obj.prop === 'settleCorpName') {
            obj = Object.assign({}, obj, {
              querySearch: (queryString, cb) => {
                this.selectedOptionItem = ''
                if (!queryString) return // 为空时不查询
                this.querySettleUnit({
                  queryString,
                  unitTypes: 'customer,supplier,company',
                  isAdd: true, 
                  isForbid: true
                }, cb)
              }
            })
          }
        }
        if (obj && obj.prop === 'taxRate') { // 应付税率改为在基础数据的税率配置中配置
          obj = {
            prop: 'taxRate',
            type: 'taxRate',
            label: '税率'
          }
        } else if (obj && obj.prop === 'receipayType') {
          obj = Object.assign({}, obj, {
            change: (value, row) => {
              if (value === 'receive') {
                if(!this.isSpecialFee && !this.isFinBillFee){
                  this.$nextTick(() => {
                    row.settleCorpName = this.client.unitName
                    row.settleCorpCode = this.client.unitCode
                  })
                }
                row['blId'] = []
              } else if (value === 'pay') {
                if(!this.isSpecialFee && !this.isFinBillFee && this.$attrs.bkgAgent){
                  this.$nextTick(() => {
                    row.settleCorpName = this.$attrs.bkgAgent.unitName
                    row.settleCorpCode = this.$attrs.bkgAgent.unitCode
                  })
                }
                row['blId'] = []
              }
              console.log(value, row, this.$attrs.bkgAgent, this.client);
              columns.forEach(item => {
                if (row.hasOwnProperty(item) && item !== 'receipayType') {
                  row[item] = ''
                }
              })
            }
          })
        }
        if (obj) arr.push(obj)
      })
      this.option1.columns = arr
    },
    setColumns2() {
      let columns2 = ['receipayType', 'feeName', 'serviceName', 'settleCorpName', 'currency', 'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'blId', 'taxRate', 'remark', 'feeEnName']
      if (this.isSpecialFee) columns2 = ['receipayType', 'feeName', 'serviceName', 'settleCorpName', 'currency', 'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'taxRate', 'remark', 'feeEnName']
      if (this.isFinBillFee) columns2 = ['receipayType', 'feeName', 'settleCorpName', 'currency', 'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'remark', 'feeEnName']
      let arr2 = []
      columns2.forEach(value => {
        let obj = this.columnsBaseLocal.find(item => {
          return item.prop === value
        })
        if (obj && obj.prop === 'feeName') {
          obj = Object.assign({}, obj, {
            width: 140
          })
        }
        if (obj) arr2.push(obj)
      })
      this.option2.columns = arr2
    },
    getOrderNo() {
      // this.orderNo = this.$route.query.orderNo
      // this.jointNo = this.$route.query.jointNo
      // this.useNo = this.jointNo ? this.jointNo : this.orderNo
      // let businessBroad = this.$route.query.businessBroad
			// businessBroad = businessBroad ? businessBroad : ''
			// this.ship = businessBroad.includes('ship') || !businessBroad
			// this.air = businessBroad.includes('air') ? true : false
      // this.rail = businessBroad.includes('rail') ? true : false
      acctExchangeRate().then(res => {
        this.exchangeRateList = res.data
        let exchangeRateObj = {}
        this.exchangeRateList.filter(item => {
          return item.toCurrency === 'USD'
        }).forEach(item => {
          exchangeRateObj[item.srcCurrency] = item.rate
        })
        exchangeRateObj['USD'] = 1
        this.exchangeRateObj = exchangeRateObj
        this.selectionSum = this.option1.data.reduce((prev, cur) => {
          if (!this.exchangeRateObj[cur.currency.toUpperCase()]) {
            this.showReduceSum = false
          }
          if (cur.receipayType === 'receive') {
            return prev + cur.feeAmtO*this.exchangeRateObj[cur.currency.toUpperCase()]
          } else if (cur.receipayType === 'pay') {
            return prev - cur.feeAmtO*this.exchangeRateObj[cur.currency.toUpperCase()]
          }
        }, 0)
        this.selectionReceiSum = this.option1.data.reduce((prev, cur) => {
          if (!this.exchangeRateObj[cur.currency.toUpperCase()]) {
            this.showReduceSum = false
          }
          if (cur.receipayType === 'receive') {
            return prev + cur.feeAmtO*this.exchangeRateObj[cur.currency.toUpperCase()]
          } else if (cur.receipayType === 'pay') {
            return prev
          }
        }, 0)
      }).catch(() => {
        this.exchangeRateList = []
        this.showReduceSum = false
      })
      this.getOrderProfit()
    },
    getOrderProfit() {
      let data = {
        "orderNo": this.useNo
      }
      getOrderProfit(data).then(res => {
        this.changeInfo.cnyProfitBefore = res.data.totalCnyProfit
        this.changeInfo.usdProfitBefore = res.data.totalUsdProfit
        this.changeInfo.grossProfitBefore = res.data.totalGrossProfit
        this.changeInfo.grossProfitBeforeStr = new LSnum(res.data.totalGrossProfit).times(100).toNum(2) + '%'
        this.changeInfo.totalUsdReceiveAmt = res.data.totalUsdReceiveAmt
      })
    },
    cancelEdit() {
      this.dialogVisible.show = false
    },
    getTaxRate(row) {
      let data = {
        "feeCode": row.feeCode,
        "receipayType": "pay",
        "serviceCode": row.serviceCode,
        "orderNo": this.orderNo
      }
      getTaxRate(data).then(res => {
        if (res.code === 0) {
          row.taxRate = res.data && res.data.taxRate
        }
      }).catch(err => {
        console.log(err)
      })
    },
    employeeSelectlistLocal(queryString, fromApplyPerson) {
      if (!this.isFinBillFee) {
        let data = {
          "orderNo": this.orderNo,
          "jointNo": this.jointNo
        }
        feeAdjustRoleJobList(data).then(res => {
          let ids = res.data.map(item => item.employeeId)
          ids = [...new Set(ids)]
          if (!fromApplyPerson) {
            this.employeeSelectOptions = ids.map(id => {
              let item = res.data.find(one => one.employeeId === id)
              return {
                label: item.employeeName,
                value: item.employeeId,
                jobCode: item.jobCode
              }
            }).concat([
              {
                label: '客户',
                value: 'other1'
              },
              {
                label: '订舱代理',
                value: 'other2'
              },
              {
                label: '供应商',
                value: 'other3'
              },
              {
                label: '国外代理',
                value: 'other4'
              }
            ])
          } else {
            this.employeeSelectOptions2 = ids.map(id => {
              let item = res.data.find(one => one.employeeId === id)
              return {
                label: item.employeeName,
                value: item.employeeId,
                jobCode: item.jobCode
              }
            })
          }
        })
      } else {
        let data = {
          "state": "valid",
          "name": queryString
        }
        this.$store.dispatch('dict/employeeSelectlist', data).then(data => {
          this.employeeSelectOptions = data.map(item => {
            return {
              label: item.value,
              value: item.key
            }
          }).concat([
            {
              label: '客户',
              value: 'other1'
            },
            {
              label: '订舱代理',
              value: 'other2'
            },
            {
              label: '供应商',
              value: 'other3'
            },
            {
              label: '国外代理',
              value: 'other4'
            }
          ])
        })
      }
    },
    employeeSelectlistLocal2(queryString) {
      let data = {
        "state": "valid",
        "name": queryString
      }
      this.$store.dispatch('dict/employeeSelectlist', data).then(data => {
        this.employeeSelectOptions2 = data.map(item => {
          return {
            label: item.value,
            value: item.key
          }
        })
      })
    },
    reasonChange(val) {
      if (!this.isFinBillFee) {
        if (val === 'bd_duty') {
          // let obj = this.employeeSelectOptions.find(item => item.jobCode === 'bd') // 增加实际责任人功能后，此功能弃用
          // if (obj) {
          //   this.applyPersonId = obj.value
          // }
        } else {
          // this.applyPersonId = ''
        }
      }
    },
    personChangeLocal(val){
      console.log(val)
      console.log(this.dutyPersonVk)
      if(!val){
        // this.form.auditPerson = this.form.auditPersonMain = ''
        this.isOtherDuty = false
        this.dutyPerson = ''
        this.applyPersonId = ''
      } else {
        let value = val.value
        this.dutyPerson = val.label
        if (typeof value === 'string' && value.includes('other')) {
          this.isOtherDuty = true
          this.applyPersonId = ''
        } else {
          this.isOtherDuty = false
          this.applyPersonId = value
        }
      }
      // return // 审核人功能去除
      // let adjustType = this.isSpecialFee ? 'client_spec' : 'preclose'
      // getAdjustAuditEmployee({orderNo: this.jointNo || this.orderNo, applyPersonId, adjustType: 'preclose' }).then(res => {
      //   let {auditEmployee, mainOrderAuditEmplyee} = res.data
      //   this.form.auditPerson = auditEmployee.cname
      //   this.form.auditPersonMain = mainOrderAuditEmplyee?.cname
      // }).catch(e => {
      //   this.form.auditPerson = this.form.auditPersonMain = ''
      //   // this.form.auditPerson = 'test-'
      // })
    },
    personChangeLocal2(val) {
    },
    addModify(feeItem) {
      let obj = {
        orderFeeId: '',
        edit: true,
        isAddFee: true
      }
      if (feeItem) {
        // this.option1.columns.forEach(item => {
        //   obj[item.prop] = feeItem[item.prop]
        // })
        obj = { ...obj, ...feeItem }
      } else {
        this.option1.columns.forEach(item => {
          obj[item.prop] = ''
        })
      }
      if (this.isSpecialFee) {
        obj['unitCount'] = ''
        obj['receipayType'] = 'pay'
      }
      this.option1.data.push(obj)
    },
    alertTemplate() {
      this.templateListVisible = true // 不管有否，都显示
    },
    confirmFeeTemplate() {
      this.$refs.usableFeeTemplate.confirmFeeTemplate()
    },
    setFeeTemplate(data) {
      this.templateListVisible = false
      let param = null
      if (data[0].tempNo) {
        param = data[0].tempNo
      } else {
        param = data
      }
      this.handleCommand(param)
    },
    handleCommand(command) {
      if (typeof command === 'string') {
        this.$store.dispatch('dict/queryBusinessServiceList', {}).then(data => {
        })
        let data = {
          tempNo: command,
          orderNo: this.useNo
        }
        getTemplateItem(data).then(res => {
          if (res.code === 0) {
            // console.log(this.$store.state.dict.dictMap.serviceCode)
            this.handleTemplateItem(res.data)
            if (res.data && res.data.length === 0) {
              this.$message({
                message: '该模板无数据，无法导入费用！',
                type: 'error',
                showClose: true
              })
            }
            this.templateListVisible = false
          }
        })
      } else {
        this.handleTemplateItem(command)
      }
    },
    handleTemplateItem(data) {
      data.forEach(item => {
        let feeItemList = []
        this.queryFeeItemList({ orderNo: this.useNo, receipayType: item.receipayType, queryString: '', size: 10000, operation: 'add' }).then(data => { // orderNo: this.$store.state.finance.orderNo, businessType: this.dictMap['orderFeeBusinessType'], serviceCode: item.serviceCode,
          feeItemList = data
          let find = feeItemList.find(fee => {
            return fee.feeCode === item.feeCode
          })
          if (find) {
            item.orderServices = find.orderServices
            if (item.orderServices && item.orderServices.length) {
              if (item.orderServices.some(s => {
                if (s.serviceCode === item.serviceCode) {
                  item.serviceName = s.serviceName
                }
                return s.serviceCode === item.serviceCode
              })) {
              } else if (item.orderServices.length === 1) {
                item.serviceCode = item.orderServices[0].serviceCode
                item.serviceName = item.orderServices[0].serviceName
              } else {
                item.serviceCode = ''
                item.serviceName = ''
              }
            } else {
              item.serviceCode = ''
              item.serviceName = ''
            }
          }
        })
        this.setUnitCount(item, this.containerCount)
        item.feeAmt = ''
        // if (item.receipayType === 'receive') {
        //   this.addReceive(item)
        // } else if (item.receipayType === 'pay') {
        //   this.addPay(item)
        // }
        this.addModify(item)
      })
    },
    // handleDelete($index, row, option) {
    //   // let style = document.createElement('style')
    //   // style.setAttribute('type', 'text/css')
    //   // style.setAttribute('id', 'el-message-box__wrapper_background')
    //   // style.innerText = '.el-message-box__wrapper{background: rgba(0, 0, 0, 0.5);}.el-message-box{margin-top:-190px;}'
    //   // document.getElementsByTagName('head')[0].appendChild(style)
    //   // this.$confirm('是否确认删除？', '提示', {
    //   //   confirmButtonText: '确定',
    //   //   cancelButtonText: '取消',
    //   //   type: 'warning'
    //   // }).then(() => {
    //     let id = this.isFinBillFee ? row.finBillFeeId : row.orderFeeId
    //     if (id) {
    //       let deleteItem = this.multipleSelection.find(item => {
    //         let oneId = this.isFinBillFee ? item.finBillFeeId : item.orderFeeId
    //         return id === oneId
    //       })
    //       deleteItem.operation = 'delete'
    //       this.deleteSelection.push(deleteItem)
    //     }
    //     this.option1.data.splice($index, 1)
    //   //   let style = document.getElementById('el-message-box__wrapper_background')
    //   //   document.getElementsByTagName('head')[0].removeChild(style)
    //   // }).catch(() => {   
    //   //   let style = document.getElementById('el-message-box__wrapper_background')
    //   //   document.getElementsByTagName('head')[0].removeChild(style)      
    //   // })
    // },
    handleDelete($index, row, option) {
      if (!this.multipleSelection1.length) {
        this.$message({
          type: 'error',
          message: '请至少选择一条费用进行删除',
          showClose: true
        })
        return
      }
      this.multipleSelection1.forEach(row => {
        let $index = this.option1.data.findIndex(item => item === row)
        this.deleteSingleFee($index, row, this.option1)
      })
      this.multipleSelection1 = [] // 删除后清空multipleSelection1
    },
    deleteSingleFee($index, row, option) {
      let id = this.isFinBillFee ? row.finBillFeeId : row.orderFeeId
      if (id) {
        let deleteItem = this.multipleSelection.find(item => {
          let oneId = this.isFinBillFee ? item.finBillFeeId : item.orderFeeId
          return id === oneId
        })
        deleteItem.operation = 'delete'
        this.deleteSelection.push(deleteItem)
      }
      this.option1.data.splice($index, 1)
    },
    handleCopy() { // handleCopy(row, option)
      if (!this.multipleSelection1.length) {
        this.$message({
          type: 'error',
          message: '请至少选择一条费用进行复制',
          showClose: true
        })
        return
      }
      this.multipleSelection1.forEach(row => {
        this.copySingleFee(row)
      })
    },
    copySingleFee(row) {
      let { settleCorpName, settleCorpCode, settleCompName, settleCompCode, feeName, feeCode, feeEnName, serviceName, serviceCode, receipayType, prepayType, feeAmt, feeUnit, unitPrice, unitCount, currency, taxRate, blId, negativeType, negativeFollowerId, negativeFollowerName } = row
      let feeItem = { settleCorpName, settleCorpCode, settleCompName, settleCompCode, feeName, feeCode, feeEnName, serviceName, serviceCode, receipayType, prepayType, feeAmt, feeUnit, unitPrice, unitCount, currency, taxRate, blId, negativeType, negativeFollowerId, negativeFollowerName }
      this.addModify(feeItem)
      // // 如果复制负数，处理一下负数跟进人
      // if (negativeFollowerId) {
      //   this.$nextTick(() => {
      //     let option = receipayType === 'pay' ? this.option2 : this.option1
      //     let item = option.columns.find(item => item.prop === 'negativeFollowerId')
      //     this.employeeSelectlistMx('', item, {}, 0, option)
      //   })
      // }
    },
    submit() {
      // this.specFeeMngApplyVisible.show = true // 开发测试用
      // return
      this.$refs.form.validate((valid) => {
        if(valid){
          // let msg = this.validatePositive(this.option1.data, 'feeAmt', 'feeName')
          // if(msg){
          //   this.$confirmWarn(`${msg}录入的是负数，是否确认录入？`, () => this.submit2())
          // }else{
          //   this.submit2()
          // }
          this.submit2()
        }
      })
    },
    submit2() {
      this.$set(this.option1, 'showIsError', true) // 用于显示必填
      this.option1.data.forEach(item => {
        item.operation = 'update'
      })
      let fees = []
      fees = fees.concat(this.deleteSelection)
      fees = fees.concat(this.option1.data)
      fees.forEach(item => {
        if (item.precloseStatus === 'yes') {
          item.precloseStatus = 'close' // 前一接口返回的precloseStatus的值为yes, 但后一接口要求为close
        }
      })
      let data = {
        "reason": this.reason,
        "applyPersonId": this.applyPersonId,
        "remark": this.remark,
        "dutyPerson": this.dutyPerson,
        fees
      }
      // return console.log(data)
      if (this.isFinBillFee) {
        data.finBillNo = this.finBillNo
        if (!this.validate(data, ['finBillNo', 'reason', 'dutyPerson', 'applyPersonId', 'remark'], { remark: '备注', reason: '调费原因', applyPersonId: '发起审批人' })) {
          return
        }
      } else {
        data.orderNo = this.useNo // 改成this.orderNo, 20220122-改回原样
        data.jointNo = this.jointNo // 20220124负数开发额外增加
        if (!this.validate(data, ['orderNo', 'reason', 'dutyPerson', 'applyPersonId', 'remark'], { remark: '备注', reason: '调费原因', applyPersonId: '发起审批人' })) {
          return
        }
      }
      if (!this.validate(data.fees)) {
        return
      }
      if (this.isBusinessFee) { // !this.isSpecialFee && !this.isFinBillFee
        let validateData = data.fees.filter(item => {
          return item.operation !== 'delete'
        })
        if (validateData && validateData.length > 0) {
          if (!this.validate(validateData, ['receipayType', 'settleCorpCode', 'feeCode', 'serviceName', 'serviceCode',
            'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency'])) {
            return
          }
        }
        try {
          data.fees.forEach(item => {
            if (!this.validateMoney(item.unitPrice)) {
              throw new Error('ending')
            }
            item.prepayType = 'prepay' // 设计说去掉prepayType字段，但接口报空值，此处增加该值
            let unitPrice = Number(item.unitPrice)
            item.feeAmt = decimalFixed2(unitPrice * item.unitCount) // 提交时再算一遍，防止后台未计算直接录入数据
            if (item.receipayType === 'receive' && item.operation !== 'delete') {
              if (!item.isNoNeedBlFee && !item.isNoNeedBlSettleUnit && !this.air) {
                if (!item.blId.length && this.blList.length) {
                  this.$set(item, 'blId_required', true) // 用于显示blId必填
                  this.$message({
                    type: 'error',
                    message: `录入应收费用，请关联提单号`,
                    showClose: true,
                    offset: 162
                  })
                  throw new Error('ending')
                }
              }
              item.blIds = item.blId.join(',')
            }
            if (item.unitPrice < 0 && item.operation !== 'delete') {
              if (item.receipayType === 'receive') {
                if (!item.negativeType) {
                  this.$message({
                    message: `录入应收负数，须录入负数类型`,
                    type: 'error',
                    duration: 5000,
                    showClose: true,
                    offset: 162
                  })
                  throw new Error('ending')
                }
                if (item.negativeType === 'order_split' && !item.splitFromOrderNo) {
                  this.$message({
                    message: `录入应收负数且属于拆单，须输入原单号`,
                    type: 'error',
                    duration: 5000,
                    showClose: true,
                    offset: 162
                  })
                  throw new Error('ending')
                }
              } else if (item.receipayType === 'pay' && (!item.negativeType || !item.negativeFollowerId)) {
                this.$message({
                  message: `录入应付负数，须录入负数类型和跟进人`,
                  type: 'error',
                  duration: 5000,
                  showClose: true,
                  offset: 162
                })
                throw new Error('ending')
              }
            }
          })
        } catch (e) {
          // console.log(e)
          if (e.message === 'ending') {
            return
          }
        }
        this.loading = true
        // delete data.applyPersonId
        // delete data.reason
        // delete data.remark
        bizFeeSaveVerify(data).then(res => {
          let validateData = data.fees.filter(item => {
            return item.operation !== 'delete'
          })
          if (validateData && validateData.length > 0) {
            // 再次校验非空
            if (!this.validate(validateData, ['receipayType', 'settleCorpCode', 'feeCode', 'serviceName', 'serviceCode',
              'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency'])) {
              return
            }
          }
          if (res.data.applyAble === 'no') {
            // let validateData = data.fees.filter(item => {
            //   return item.operation !== 'delete'
            // })
            // if (validateData && validateData.length > 0) {
            //   // 再次校验非空
            //   if (!this.validate(validateData, ['receipayType', 'settleCorpCode', 'feeCode', 'serviceName', 'serviceCode',
            //     'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency'])) {
            //     return
            //   }
            // }
            saveOrderBizFee(data).then(res => {
              this.$message({
                type: 'success',
                message: '提交成功！',
                showClose: true
              })
              this.option1.showIsError = false
              // this.dialogVisible.show = false
              this.cancel()
            })
          } else if (res.data.applyAble === 'yes') {
            this.updateFees = data.fees
            this.specFeeMngApplyVisible.show = true
            this.feeSaveVerifyData = res.data
            this.feeSaveVerifyData.remark = this.remark
            let $this = this
            this.saveApplyCallback = (function() {
              return function() {
                let data2 = {
                  orderNo: $this.useNo,
                  jointNo: $this.jointNo,
                  remark: $this.feeSaveVerifyData.remark,
                  applyType: $this.feeSaveVerifyData.applyType,
                  fees: $this.feeSaveVerifyData.fees,
                  "reason": $this.reason,
                  "applyPersonId": $this.applyPersonId,
                  "dutyPerson": $this.dutyPerson
                }
                // let validateData = data2.fees.filter(item => {
                //   return item.operation !== 'delete'
                // })
                // if (validateData && validateData.length > 0) {
                //   // 再次校验非空
                //   if (!$this.validate(validateData, ['receipayType', 'settleCorpCode', 'feeCode', 'serviceName', 'serviceCode',
                //     'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency'])) {
                //     return new Promise((resolve, reject) => {
                //       resolve()
                //     })
                //   }
                // }
                return saveOrderBizFee(data2).then(res => {
                  $this.$message({
                    type: 'success',
                    message: '提交成功！',
                    showClose: true
                  })
                  this.option1.showIsError = false
                  // $this.dialogVisible.show = false
                  $this.cancel()
                })
              }
            })()
          }
        }).finally(() => {
          this.loading = false
        })
        // saveOrderBizFee(data).then(res => {
        //   this.$message({
        //     type: 'success',
        //     message: '提交成功！',
        //     showClose: true
        //   })
        //   this.dialogVisible.show = false
        // })
      } else if (this.isSpecialFee) {
        let validateData = data.fees.filter(item => {
          return item.operation !== 'delete'
        })
        if (validateData && validateData.length > 0) {
          if (!this.validate(validateData, ['receipayType', 'settleCorpCode', 'feeCode', 'serviceName', 'serviceCode', 'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency'])) {
            return
          }
        }
        try {
          data.fees.forEach(item => {
            if (!this.validateMoney(item.unitPrice)) {
              throw new Error('ending')
            }
            let unitPrice = Number(item.unitPrice)
            item.feeAmt = decimalFixed2(unitPrice * item.unitCount) // 提交时再算一遍，防止后台未计算直接录入数据
            if (item.unitPrice < 0 && item.operation !== 'delete') {
              if (item.receipayType === 'pay') {
                if ((!item.negativeType || !item.negativeFollowerId) && !['TZFY'].includes(item.feeCode)) {
                  this.$message({
                    message: `录入应付负数，须录入负数类型和跟进人`,
                    type: 'error',
                    duration: 5000,
                    showClose: true,
                    offset: 108
                  })
                  throw new Error('ending')
                }
              }
            } else if (item.unitPrice >= 0 && item.operation !== 'delete') {
              if (item.receipayType === 'pay') {
                if (item.negativeType || item.negativeFollowerId) {
                  this.$message({
                    message: `录入应付正数，无需录入负数类型和跟进人`,
                    type: 'error',
                    showClose: true,
                    offset: 108
                  })
                  throw new Error('ending')
                }
              }
            }
            if (item.feeCode === 'TZFY' && item.unitPrice >= 0) {
              this.$message({
                message: '“调整费用”须录入负数',
                type: 'error',
                showClose: true,
                offset: 108
              })
              throw new Error('ending')
            }
          })
        } catch (e) {
          console.log(e)
          if (e.message === 'ending') {
            return
          }
        }
        // let data2 = {
        //   orderNo: this.orderNo,
        //   jointNo: this.jointNo,
        //   fees: data.fees
        // }
        
        // delete data.applyPersonId
        // delete data.reason
        // delete data.remark
        specFeeSaveVerify(data).then(res => { // data2
          if (res.code === 0) {
            let validateData = data.fees.filter(item => {
              return item.operation !== 'delete'
            })
            if (validateData && validateData.length > 0) {
              // 再次校验非空
              if (!this.validate(validateData, ['receipayType', 'settleCorpCode', 'feeCode', 'serviceName', 'serviceCode',
                'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency'])) {
                return
              }
            }
            if (res.data.applyAble === 'no') {
              // let validateData = data.fees.filter(item => {
              //   return item.operation !== 'delete'
              // })
              // if (validateData && validateData.length > 0) {
              //   // 再次校验非空
              //   if (!this.validate(validateData, ['receipayType', 'settleCorpCode', 'feeCode', 'serviceName', 'serviceCode',
              //     'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency'])) {
              //     return
              //   }
              // }
              saveOrderSpecialFee(data).then(res => {
                this.$message({
                  type: 'success',
                  message: '提交成功!',
                  showClose: true
                })
                // this.dialogVisible.show = false
                this.cancel()
              })
            } else if (res.data.applyAble === 'yes') {
              this.updateFees = data.fees
              this.feeSaveVerifyData = res.data
              this.feeSaveVerifyData.remark = this.remark
              this.specFeeMngApplyVisible.show = true
              let $this = this
              this.saveApplyCallback = (function() {
                return function() {
                  let data2 = {
                    orderNo: $this.useNo,
                    jointNo: $this.jointNo,
                    remark: $this.feeSaveVerifyData.remark,
                    applyType: $this.feeSaveVerifyData.applyType,
                    fees: $this.feeSaveVerifyData.fees,
                    "reason": $this.reason,
                    "applyPersonId": $this.applyPersonId,
                    "dutyPerson": $this.dutyPerson
                  }
                  // let validateData = data2.fees.filter(item => {
                  //   return item.operation !== 'delete'
                  // })
                  // if (validateData && validateData.length > 0) {
                  //   // 再次校验非空
                  //   if (!$this.validate(validateData, ['receipayType', 'settleCorpCode', 'feeCode', 'serviceName', 'serviceCode',
                  //     'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency'])) {
                  //     return new Promise((resolve, reject) => {
                  //       resolve()
                  //     })
                  //   }
                  // }
                  return saveOrderSpecialFeeAdjust(data2).then(res => {
                    $this.$message({
                      type: 'success',
                      message: '提交成功！',
                      showClose: true
                    })
                    // $this.dialogVisible.show = false
                    $this.cancel()
                  })
                }
              })()
            }
          }
        })
      } else if (this.isFinBillFee) {
        let validateData = data.fees.filter(item => {
          return item.operation !== 'delete'
        })
        if (validateData && validateData.length > 0) {
          if (!this.validate(validateData, ['receipayType', 'settleCorpCode', 'feeCode',
            'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency'])) {
            return
          }
        }
        try {
          data.fees.forEach(item => {
            if (!this.validateMoney(item.unitPrice)) {
              throw new Error('ending')
            }
            item.prepayType = 'prepay' // 设计说去掉prepayType字段，但接口报空值，此处增加该值
            let unitPrice = Number(item.unitPrice)
            item.feeAmt = decimalFixed2(unitPrice * item.unitCount) // 提交时再算一遍，防止后台未计算直接录入数据
          })
        } catch (e) {
          console.log(e)
          if (e.message === 'ending') {
            return
          }
        }
        saveFinBillFee(data).then(res => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: '提交成功！',
              showClose: true
            })
          } else {
            this.$message({
              type: 'error',
              message: '提交失败!',
              showClose: true
            })
          }
          // this.dialogVisible.show = false
          this.cancel()
        })
      }
    },
    cancel(type) {
      this.option1.showIsError = false
      if (type === 'click') {
        window.close()
      } else {
        setTimeout(() => {
          window.close()
        }, 500)
      }
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params, { isTab: true })
    },
    handleCollapse() {
    },
    sendMulti(data, option) {
      // console.log(data, option.data)
      if (option === this.option1) this.multipleSelection1 = data
    },
  },
  activated() {
    this.getProps()
    this.getOrderNo()
  },
  components: {
    FinanceTable,
    SpecFeeMngApplyDialog,
    UsableFeeTemplate
  },
  computed: {
    ... mapState({
      defaultColumns: state => state.finance.columns.defaultColumns,
      columnsBase: state => state.finance.columns.columnsBase
    }),
    ... mapGetters(['dictMap'])
  },
  watch: {
    'dialogVisible.show'(val) {
      if (val) {
        this.deleteSelection = []
        this.reason = ''
        this.applyPersonId = ''
        this.dutyPerson = ''
        this.remark = ''
        this.form.auditPerson = this.form.auditPersonMain = ''
        this.$nextTick(() => this.$refs.form.clearValidate())
        if (!this.isFinBillFee) {
          this.employeeSelectlistLocal('')
        }
      }
    },
    multipleSelection: {
      handler(val) {
        this.$nextTick(() => { // 业务费用改成v-if，此处更改处理
          this.comeType = this.multipleSelection.length > 0 ? '修改' : '新增'
          this.moneyTitle1 = this.comeType === '修改' ? '费用修改' : '费用新增'
          let data1 = []
          let data2 = []
          this.multipleSelection.forEach(item => {
            // 处理测试数据有返回大写BILL的情况
            if (!item.feeUnit.includes(' ')) {
              item.feeUnit = item.feeUnit.toLowerCase() // 现字段包含空运，有大写，小写，无法统一处理成小写-特殊处理
            }
            item.feeAmtO = item.feeAmt
            let obj1 = Object.assign({}, item, {
              edit: true,
              // remark: '' // 有用户提带出备注, 20220725
            })
            data1.push(obj1)
            let obj2 = { ...item }
            let obj3 = { ...item }
            obj3.unitPrice = 0 - obj3.unitPrice
            obj3.feeAmt = 0 - obj3.feeAmt
            data2.push(obj2, obj3)
          })
          this.option1.data = data1
          this.option2.data = data2
          let receiFees = this.multipleSelection.filter(item => item.receipayType === 'receive')
          let receiFeeSumList = []
          receiFees.forEach(item => {
            let f = receiFeeSumList.find(subItem => {
              return subItem.currency === item.currency
            })
            if (!f) {
              receiFeeSumList.push({
                currency: item.currency,
                sumAmt: Number(item.feeAmt)
              })
            } else {
              f.sumAmt += Number(item.feeAmt)
            }
          })
          this.selectionReceiEachSum = receiFeeSumList.reduce((prev, curr, index) => {
            return index > 0 ? prev + ' ' + curr.currency + new LSnum(curr.sumAmt).toNum(2) : prev + curr.currency + new LSnum(curr.sumAmt)
          }, '')
          let payFees = this.multipleSelection.filter(item => item.receipayType === 'pay')
          let payFeeSumList = []
          payFees.forEach(item => {
            let f = payFeeSumList.find(subItem => {
              return subItem.currency === item.currency
            })
            if (!f) {
              payFeeSumList.push({
                currency: item.currency,
                sumAmt: Number(item.feeAmt)
              })
            } else {
              f.sumAmt += Number(item.feeAmt)
            }
          })
          // this.selectionPayEachSum = payFeeSumList.reduce((prev, curr, index) => {
          //   return index > 0 ? prev + ' ' + curr.currency + new LSnum(curr.sumAmt) : '应付合计：' + curr.currency + new LSnum(curr.sumAmt)
          // }, '')
          this.selectionPayEachSum = payFeeSumList.reduce((prev, curr, index) => {
            return index > 0 ? prev + ' ' + curr.currency + new LSnum(curr.sumAmt) : prev + curr.currency + new LSnum(curr.sumAmt)
          }, '')
        })
      },
      immediate: true
    },
    'option1.data': {
      handler(newVal) {
        // if (newVal && newVal.length > 0) { // !this.isSpecialFee && 
          clearTimeout(this.timer1)
          this.timer1 = setTimeout(() => {
            newVal.forEach(row => {
              if (row.edit) {
                let unitPrice = Number(row.unitPrice)
                let unitCount = Number(row.unitCount)
                // row.feeAmt = decimalFixed2(unitPrice * unitCount)
                row.feeAmt = new LSnum(unitPrice).times(unitCount).toNum(2) // new LSnum(unitPrice * unitCount).toNum(2)
              }
            })
            // // 新增费用合计
            // let addFeeSumList = []
            // this.option1.data.forEach(item => {
            //   if (!item.isAddFee || !item.currency) return
            //   let f = addFeeSumList.find(subItem => {
            //     return subItem.currency === item.currency
            //   })
            //   if (!f) {
            //     addFeeSumList.push({
            //       currency: item.currency,
            //       sumAmt: item.receipayType === 'receive' ? Number(item.feeAmt) : -Number(item.feeAmt) // Number(item.feeAmt)
            //     })
            //   } else {
            //     f.sumAmt += (item.receipayType === 'receive' ? Number(item.feeAmt) : -Number(item.feeAmt)) // Number(item.feeAmt)
            //   }
            // })
            // let addFeesTitle = addFeeSumList.length ? '新增费用合计：' : ''
            // this.addFeesSum = addFeeSumList.reduce((prev, curr, index) => {
            //   return index > 0 ? prev + ' ' + curr.currency + new LSnum(curr.sumAmt).toNum(2) : prev + curr.currency + new LSnum(curr.sumAmt).toNum(2)
            // }, addFeesTitle)

            // 新增费用合计 ---> 应收、应付分开
            let receiFeeSumList = []
            let payFeeSumList = []
            this.option1.data.forEach(item => {
              if (!item.isAddFee || !item.currency) return
              if (item.receipayType === 'receive') {
                let f = receiFeeSumList.find(subItem => {
                  return subItem.currency === item.currency
                })
                if (!f) {
                  receiFeeSumList.push({
                    currency: item.currency,
                    sumAmt: Number(item.feeAmt)
                  })
                } else {
                  f.sumAmt += Number(item.feeAmt)
                }
              } else if (item.receipayType === 'pay') {
                let f = payFeeSumList.find(subItem => {
                  return subItem.currency === item.currency
                })
                if (!f) {
                  payFeeSumList.push({
                    currency: item.currency,
                    sumAmt: Number(item.feeAmt)
                  })
                } else {
                  f.sumAmt += Number(item.feeAmt)
                }
              }
            })
            this.addFeesReceiEachSum = receiFeeSumList.reduce((prev, curr, index) => {
              return index > 0 ? prev + ' ' + curr.currency + new LSnum(curr.sumAmt).toNum(2) : prev + curr.currency + new LSnum(curr.sumAmt).toNum(2)
            }, '')
            this.addFeesPayEachSum = payFeeSumList.reduce((prev, curr, index) => {
              return index > 0 ? prev + ' ' + curr.currency + new LSnum(curr.sumAmt).toNum(2) : prev + curr.currency + new LSnum(curr.sumAmt).toNum(2)
            }, '')

            // 利润减少
            this.showReduceSum = true
            let aftSum = this.option1.data.reduce((prev, cur) => {
              if (!cur.currency || !cur.feeAmt) {
                return prev
              } else {
                if (!this.exchangeRateObj[cur.currency.toUpperCase()]) {
                  this.showReduceSum = false
                }
                if (cur.receipayType === 'receive') {
                  return prev + cur.feeAmt*this.exchangeRateObj[cur.currency.toUpperCase()]
                } else if (cur.receipayType === 'pay') {
                  return prev - cur.feeAmt*this.exchangeRateObj[cur.currency.toUpperCase()]
                }
              }
            }, 0)
            let aftReceiSum = this.option1.data.reduce((prev, cur) => {
              if (!cur.currency || !cur.feeAmt) {
                return prev
              } else {
                if (cur.receipayType === 'receive') {
                  return prev + cur.feeAmt*this.exchangeRateObj[cur.currency.toUpperCase()]
                } else if (cur.receipayType === 'pay') {
                  return prev
                }
              }
            }, 0)
            let reduceSum = aftSum - this.selectionSum
            this.reduceSum = new LSnum(reduceSum).toNum(2)
            let reduceSumCny = new LSnum(reduceSum).times(1/this.exchangeRateObj.CNY).toNum(2)
            let reduceReceiSum = aftReceiSum - this.selectionReceiSum
            this.changeInfo.cnyProfitAfter = new LSnum(this.changeInfo.cnyProfitBefore).plus(reduceSumCny).toNum(2)
            this.changeInfo.usdProfitAfter = new LSnum(this.changeInfo.usdProfitBefore).plus(reduceSum).toNum(2)
            let usdProfitAfter = this.changeInfo.usdProfitBefore + reduceSum
            let totalUsdReceiveAmt = this.changeInfo.totalUsdReceiveAmt + reduceReceiSum // reduceSum
            if (totalUsdReceiveAmt <= 0) {
              this.changeInfo.grossProfitAfterStr = '0%'
            } else {
              this.changeInfo.grossProfitAfterStr = new LSnum(usdProfitAfter).div(totalUsdReceiveAmt).times(100).toNum(2) + '%'
            }
          }, 500)
        // }
      },
      deep: true
    }
  }
}
</script>
<style lang="scss" scoped>
.finance-detail-info {
  padding: 18px 14px 4px; // 18px 14px 4px
  ::v-deep {
    .el-form-item {
      width: 262px;
      .el-form-item__content {
        width: calc(100% - 85px);
        .el-select {
          width: 100%;
        }
      }
      &:last-of-type {
        .el-form-item__content {
          width: calc(100% - 63px);
        }
      }
    }
  }
}
.el-form-item{
  margin-right: 15px;
}
.one-kind-fee .finance-table-container {
  margin: 10px 0px 0px;
}
</style>
<style lang="scss">
.modifyfee-detail-info-remark {
  .el-form-item__content {
    width: calc(100% - 100px);
  }
}
.usable-fee-templ-cont .el-button {
  padding: 3px 7px;
}
.usable-fee-templ-cont .el-input__inner {
  font-size: 12px;
  padding: 0px 3px;
  height: 20px;
  line-height: 20px;
}
.feeclosed-modifyFee-dialog .el-dialog__body {
  padding-top: 20px;
}
</style>