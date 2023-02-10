<template>
  <div class="one-kind-fee finance-orderfee-totalfee"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <div class="finance-table-summary">
      <div class="finance-summary-text">
        <div style="display:inline-block;margin-right:10px;">
          <span style="margin-right:4px;"><span>订单毛利：CNY：</span><span style="margin-right:0px;">{{orderProfit.totalCnyProfit}}</span><span>(折合USD：</span><span>{{orderProfit.totalUsdProfit}})</span></span>
          <span>毛利率：{{getProfitRate}}%</span>
        </div>
        <el-popover
          placement="bottom-start"
          trigger="hover">
          <div class="money-dialog money-dialog-profit">
            <div style="display:inline-block;margin-right:26px;font-weight:600;color:#222;line-height:20px;">
              <span style="margin-right:8px;"><span>订单毛利：CNY：</span><span style="margin-right:4px;">{{orderProfit.totalCnyProfit}}</span><span>(折合USD：</span><span>{{orderProfit.totalUsdProfit}})</span></span>
              <span>毛利率：{{getProfitRate}}%</span>
            </div>
            <div class="finance-table">
              <div style="padding:8px;background:#fff;">
                <el-table
                  fit
                  style="width: 100%"
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
          </div>
          <el-button type="text" slot="reference" style="font-size: 12px;">详情</el-button>
        </el-popover>
      </div>
      <div class="finance-btn-container total-fee-btn-container">
        <el-button v-if="checkAuth(pageCode, 'tab-totalFee', 'btn-createSettlement')" class="finance-btn" size="mini" @click="createSettlement">生成结算单</el-button>
      </div>
      <div style="width:100%;">
        <div class="money-box-left">
          <el-tooltip content="相同币种的应收金额减去应付金额得出的值">
            <div style="line-height:20px;">原币差额：</div>
          </el-tooltip>
          <div class="money-total" v-for="(item, index) in originalFeeDiff" :key="'originalFeeDiff' + index">
            {{item.currency}}<span :class="{'money-pay-color': false}">{{item.diffAmt}}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">应收</div>
          <div class="money-total" v-for="(item, index) in moneyTotalReceive" :key="'moneyTotalReceive' + index">
            {{item.currency}}合计：<span :class="{'money-pay-color': moneyTitle1 === 'pay' ? true : false}">{{item.sum}}</span>
          </div>
          <el-popover
            placement="bottom-start"
            trigger="hover">
            <div class="money-dialog" v-for="(item, index) in orderFeeCompStat" :key="'orderFeeCompStat' + index">
              <div class="money-dialog-comp">分公司：{{item.settleCompName}}</div>
              <div class="money-dialog-item">已核销合计：<span>{{ item['receiveWriteoffAmt']}}</span></div>
              <div class="money-dialog-item">未核销合计：<span>{{ item['receiveUnWriteoffAmt']}}</span></div>
              <div class="money-dialog-item">已开票合计：<span>{{ item['receiveInvoiceAmt']}}</span></div>
              <div class="money-dialog-item">未开票合计：<span>{{ item['receiveUnInvoiceAmt']}}</span></div>
              <br/>
              <div class="money-dialog-item">币种：{{item.basicCurrency}}</div>
            </div>
            <div v-if="orderFeeCompStat.length === 0" style="color:#909399;font-size:12px;text-align:center;">暂无数据</div>
            <el-button type="text" slot="reference" style="font-size: 12px;">详情</el-button>
          </el-popover>
        </div>
        <div class="money-box-right">
          <!-- <el-button class="finance-btn" @click="handleCustomColumns" size="mini">自定义表头</el-button> -->
        </div>
      </div>
      <FinanceTableMass
        :option="option1"
        @send-multi="sendMulti"/>
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">应付</div>
          <div class="money-total" v-for="(item, index) in moneyTotalPay" :key="'moneyTotalPay' + index">
            {{item.currency}}合计：<span :class="{'money-pay-color': moneyTitle2 === 'pay' ? true : false}">{{item.sum}}</span>
          </div>
          <el-popover
            placement="bottom-start"
            trigger="hover">
            <div class="money-dialog" v-for="(item, index) in orderFeeCompStat" :key="'orderFeeCompStat' + index">
              <div class="money-dialog-comp">分公司：{{item.settleCompName}}</div>
              <div class="money-dialog-item">已核销合计：<span class="money-pay-color">{{item['payWriteoffAmt']}}</span></div>
              <div class="money-dialog-item">未核销合计：<span class="money-pay-color">{{item['payUnWriteoffAmt']}}</span></div>
              <div class="money-dialog-item">已请款合计：<span class="money-pay-color">{{item['payApplyAmt']}}</span></div>
              <div class="money-dialog-item">未请款合计：<span class="money-pay-color">{{item['payUnApplyAmt']}}</span></div>
              <br/>
              <div class="money-dialog-item">已开票合计：<span class="money-pay-color">{{item['payInvoiceAmt']}}</span></div>
              <div class="money-dialog-item">未开票合计：<span class="money-pay-color">{{item['payUnInvoiceAmt']}}</span></div>
              <br/>
              <div class="money-dialog-item">币种：{{item.basicCurrency}}</div>
            </div>
            <div v-if="orderFeeCompStat.length === 0" style="color:#909399;font-size:12px;text-align:center;">暂无数据</div>
            <el-button type="text" slot="reference" style="font-size:12px;">详情</el-button>
          </el-popover>
        </div>
        <div class="money-box-right">
        </div>
      </div>
      <FinanceTableMass
        :option="option2"
        @send-multi="sendMulti"/>
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose" />
    </div>
    <el-dialog
      :title="'订单费用的日志'"
      :visible.sync="logDialogVisible"
      :close-on-click-modal="false"
      width="800px">
      <FinanceTableMass
        :option="option3"/>
    </el-dialog>
    <PreviewDialog :dialogOption="previewDialog" />
    <BizDetailList :bizDetailVisible="bizDetailVisible" />
  </div>
</template>
<script>
import FinanceTableMass from '../../../components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '../mixin'
import Vue from 'vue'
import { mapState } from 'vuex'
import { orderFeeList, getOrderProfit, orderFeeHistory } from '@/api/fin/fee' // , getOrderFeeStat
import { decimalFixed2 } from '@/views/finance/utils/finance'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { orderFeeMixin } from '@/views/finance/orderFee/orderFee/components/components/orderFeeMixin'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import BizDetailList from '@/views/finance/orderFee/orderFee/components/components/bizDetailList'

export default {
  mixins: [mixin, routerMixin, orderFeeMixin],
  data() {
    let pageCode = this.$route.name === 'SiDetail' ? 'SiDetailFee' : this.$route.name
    return {
      option1: {},
      option2: {},
      option3: {},
      option4: {},
      moneyTitle1: 'receive',
      moneyTitle2: 'pay',
      moneyTitle: 'receive',
      orderNo: '',
      moneyTotalReceive: [],
      moneyTotalPay: [],
      orderProfit: {
        totalCnyProfit: 0,
        totalGrossProfit: 0,
        totalUsdProfit: 0,
      },
      orderFeeCompStat: [],
      logDialogVisible: false,
      profitDialogVisible: false,
      multipleSelection1: [],
      multipleSelection2: [],
      source: '',
      previewDialog: {
        show: false,
        title: '凭证预览',
        seqNo: '',
      },
      loading: false,
      jointNo: '',
      useNo: '',
      isSort: false,
      pageCode,
      originalFeeDiff: [],
    }
  },
  created() {
    this.getOrderNo()
    this.getData()
    let operationBtns = Object.assign(this.option.operationBtns, {
      show: true,
      width: 88,
      data: [
        {
          label: '日志',
          type: 'text',
          show: true,
          action: 'showLog'
        },
        {
          label: '详情',
          type: 'text',
          show: true,
          action: 'BizDetail'
        }
      ]
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'totalFee1',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: true,
        fixed: true
      },
      operationBtns,
      sortable: true,
      sortChange: this.sortChange,
      maxHeight: 300,
      index: {
        show: true
      },
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns
      },
    })
    this.option2 = Object.assign({}, this.option, {
      id: 'option2', $name: 'totalFee2',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: true,
        fixed: true
      },
      operationBtns,
      sortable: true,
      sortChange: this.sortChange,
      maxHeight: 300,
      index: {
        show: true
      },
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns2
      },
    })
    this.option3 = Object.assign({}, this.option, {
      id: 'option3', $name: 'totalFee3',
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
    this.option4 = Object.assign({}, this.option, {
      id: 'option4', $name: 'totalFee4',
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
  },
  activated() {
    this.getOrderNo()
    if (this.$route.meta.refresh) {
      this.$route.meta.refresh = false
      this.getData()
    }
  },
  methods: {
    getData(params) {
      this.loading = true
      let prop = params && params.prop
      if (prop === 'serviceCode') prop = 'serviceName'
      let data = {
        "orderNo": this.useNo,
        "viewGroupType": "all",
        "isException": "no",
        "columns": this.customColumnsKeys,
        "ascColumns": params && params.order === 'ascending' ? [prop] : [],
        "descColumns": params && params.order === 'descending' ? [prop] : (params && params.order === 'ascending' ? [] : []), // 'createdTime'
        "currPage": 1,
        "pageSize": 1000,
        "receipayType": 'receive'
      }
      let data2 = Object.assign({}, data, { "receipayType": 'pay', "columns": this.customColumnsKeys2, "pageSize": 0 })
      Promise.all([orderFeeList(data), orderFeeList(data2)]).then(res => {
        this.loading = false
        if (res[0].code === 0) {
          this.processData(res[0], 'receive')
        }
        if (res[1].code === 0) {
          this.processData(res[1], 'pay')
        }
      }).catch(err => {
        this.loading = false
      })
      // orderFeeList(data).then(res => {
      //   this.loading = false
      //   if (res.code === 0) {
      //     this.processData(res, 'receive')
      //   }
      // }).catch(err => {
      //   this.loading = false
      // })
      // let data2 = Object.assign({}, data, { "receipayType": 'pay' })
      // orderFeeList(data2).then(res => {
      //   this.loading = false
      //   if (res.code === 0) {
      //     this.processData(res, 'pay')
      //   }
      // }).catch(err => {
      //   this.loading = false
      // })
    },
    processData(res, receipayType) {
      let { configColumns } = res.data
      let columns = []
      if (receipayType === 'receive') {
        this.columns = configColumns.length > 0 ? configColumns : this.defaultColumnsRecei
        this.columns = [...this.columns]
        let serviceCodeIndex = this.columns.findIndex(item => item === 'serviceCode')
        if (serviceCodeIndex > -1) {
          this.columns.splice(serviceCodeIndex, 1, 'serviceName')
        }
        this.columns = [...new Set(this.columns)]
        columns = this.columns
      } else if (receipayType === 'pay') {
        this.columns2 = configColumns.length > 0 ? configColumns : this.defaultColumnsPay
        this.columns2 = [...this.columns2]
        let serviceCodeIndex = this.columns2.findIndex(item => item === 'serviceCode')
        if (serviceCodeIndex > -1) {
          this.columns2.splice(serviceCodeIndex, 1, 'serviceName')
        }
        this.columns2 = [...new Set(this.columns2)]
        columns = this.columns2
      }
      let arr1 = []
      // let arr2 = []
      columns.forEach(value => {
        let obj = this.columnsBaseLocal.find(item => {
          return item.prop === value
        })
        if (obj) {
          // if (obj.prop !== 'payApplySettleNos' && obj.prop !== 'payOrderNos') {
          //   arr1.push(obj)
          // }
          // arr2.push(obj)
          arr1.push(obj)
        }
      })
      if (!this.isSort) {
        if (receipayType === 'receive') {
          this.option1.columns = arr1
        } else if (receipayType === 'pay') {
          this.option2.columns = arr1
          return
        }
      }
      this.isSort = false

      let { list, feeStat } = res.data
      let data1 = list.filter((item, index) => {
        // 尝试放到这里，减少数组操作次数
        item.settleOrderNos_multiValue = item.settleOrderNos.split(',')
        item.writeoffNos_multiValue = item.writeoffNos.split(',')
        item.settleTimes_multiValue = item.settleTimes.split(',')
        item.payApplySettleNos_multiValue = item.payApplySettleNos.split(',')
        item.payOrderNos_multiValue = item.payOrderNos.split(',')
        item.acctVoucherNos_multiValue = item.acctVoucherNos.split(',').map(subItem => {
          let arr = subItem.split('/')
          return arr[1] ? arr[1] : arr[0]
        })
        item.voucherSeqNos_multiValue = item.acctVoucherNos.split(',').map(subItem => {
          let arr = subItem.split('/')
          return arr[0]
        })
        item.invoiceNos_multiValue = item.invoiceNos.split(',').map(subItem => {
          let arr = subItem.split('/')
          return arr[1] ? arr[1] : arr[0]
        })
        item.invoiceReceivableIds_multiValue = item.invoiceNos.split(',').map(subItem => {
          let arr = subItem.split('/')
          return arr[0]
        })
        return item.receipayType === "receive"
      })
      let data2 = list.filter(item => {
        return item.receipayType === "pay"
      })

      this.option1.data = data1
      this.option2.data = data2
      this.getOrderProfit()
      this.orderFeeCompStat = feeStat ? feeStat : [] // feeStat, orderFeeCompStat已废弃
      this.computeMoneyTotalFront()
    },
    getOrderNo() {
      this.orderNo = this.$route.query.orderNo
      this.jointNo = this.$route.query.jointNo
      this.useNo = this.jointNo ? this.jointNo : this.orderNo
    },
    // getOrderNo() {
    //   let href = window.location.href
    //   let index = href.indexOf('?')
    //   let searchURL = href.substring(index + 1)
    //   let splitArr = searchURL.split("&")
    //   let orderNo = ''
    //   splitArr.forEach(item => {
    //     let splitArr2 = item.split("=")
    //     if (splitArr2[0] === 'orderNo') {
    //       orderNo = splitArr2[1]
    //     }
    //     if (splitArr2[0] === 'jointNo') {
    //       this.jointNo = splitArr2[1]
    //     }
    //   })
    //   if (orderNo) {
    //     sessionStorage.setItem('orderNo', orderNo)
    //   }
    //   if (orderNo && orderNo !== '') {
    //     sessionStorage.setItem('orderNo', orderNo)
    //   } else {
    //     orderNo = this.$store.state.finance.orderNo
    //   }
    //   this.orderNo = orderNo
    // },
    sortChange(column, prop, order) {
      this.isSort = true
      this.getData({prop, order})
    },
    showColumnDetail(params) {
      if (params.type === 'paySettleApplyNo' || params.type === 'pay_order' || params.type === 'writeoffNos') {
        let agentCompName = params.componentProps.row && params.componentProps.row.agentCompName
        let compName = this.$store.state.user.userInfo.settleCompanyName
        if (agentCompName && compName !== agentCompName) {
          return this.$message({
            message: '无权限查看！',
            type: 'error',
            showClose: true
          })
        }
      }
      this.showColumnDetailHandle(params, { isTab: true, from: 'OrderFee' })
    },
    getOrderProfit() {
      let data = {
        "orderNo": this.useNo
      }
      getOrderProfit(data).then(res => {
        if (res.code === 0) {
          this.orderProfit = res.data
          this.setProfitDetail(res.data.profitList)
          this.originalFeeDiff = res.data.originalFeeDiff
        }
      })
    },
    // getOrderFeeStat() {
    //   let data = {
    //     "orderNo": this.orderNo
    //   }
    //   getOrderFeeStat(data).then(res => {
    //     if (res.code === 0) {
    //       this.orderFeeCompStat = res.data ? res.data : []
    //     }
    //   })
    // },
    setProfitDetail(data) {
      let columns = [
        {
          prop: 'settleCompName',
          label: '分公司',
          type: 'text',
          width: 150,
        },
        {
          prop: 'mon',
          label: '月份',
          type: 'text',
          width: 100,
        },
        {
          prop: 'cnyProfit',
          label: '人民币毛利',
          type: 'text',
          width: 100,
        },
        {
          prop: 'usdProfit',
          label: '美元毛利',
          type: 'text',
          width: 100,
        },
        {
          prop: 'grossProfit',
          label: '毛利率',
          type: 'text',
          width: 100,
          formatter: (row, pItem) => {return decimalFixed2(row[pItem.property] * 100) + '%'}, // 此处用的是el-table
        }
      ]
      this.option4.columns = columns
      this.option4.data = data
    },
    showLog(row) {
      let data = { 
        "orderNo": this.useNo,
        "orderFeeId": row.orderFeeId
      }
      orderFeeHistory(data).then(res => {
        if (res.code === 0) {
          let data = res.data
          let columns = [
            {
              prop: 'changeBizType',
              label: '变更来源类型',
              type: 'select',
              propInDict: 'feeChangeSourceType',
              width: 100
            },
            {
              prop: 'changeBizNo',
              label: '变更来源单号',
              type: 'text',
              width: 130,
            },
            {
              prop: 'updatedName',
              label: '变更人',
              type: 'text',
              width: 100
            },
            {
              prop: 'updatedTime',
              label: '变更时间',
              type: 'text',
              width: 130
            },
            {
              prop: 'changeRemark',
              label: '变更说明',
              type: 'text',
              minWidth: 200
            }
          ]
          this.option3.columns = columns
          this.option3.data = data
          this.logDialogVisible = true
        }
      })
    },
    createSettlement() {
      if (this.multipleSelection1.length === 0 && this.multipleSelection2.length === 0) {
        this.$message({
          message: '请勾选需要生成结算单的费用！',
          type: 'error',
          showClose: true
        })
        return
      } else {
        let multipleSelection = this.multipleSelection1.concat(this.multipleSelection2)
        let hasAgent = multipleSelection.some(item => {
          return item.agentCompName !== ''
        })
        if (hasAgent) {
          let bool = multipleSelection.some(item => {
            return item.agentCompName === ''
          })
          if (bool) {
            this.$message({
              message: '代收付费用不允许跟非代收付费用在同一个结算单！',
              type: 'error',
              showClose: true
            })
            return
          }
          let agentCompName = multipleSelection[0].agentCompName
          bool = multipleSelection.some(item => {
            return item.agentCompName !== agentCompName
          })
          if (bool) {
            this.$message({
              message: '代收付的费用必须是同一家代收付分公司！',
              type: 'error',
              showClose: true
            })
            return
          }
          let bool1 = multipleSelection.some(item => {
            return item.receipayType === 'receive'
          })
          let bool2 = multipleSelection.some(item => {
            return item.receipayType === 'pay'
          })
          if (bool1 && bool2) {
            this.$message({
              message: '费用同时存在应收和应付费用，不能进行代收付！',
              type: 'error',
              showClose: true
            })
            return
          }
        }
      }
      let feeIds1 = this.multipleSelection1.map(item => {
        return item.feeId
      })
      let feeIds2 = this.multipleSelection2.map(item => {
        return item.feeId
      })
      this.isJumpRouteFromPage = true
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      this.$router.push({
        path: '/finance/settlement/createSettlement',
        query: {
          source: 'createSettlementFromOrderFeeIds',
          feeIds: JSON.stringify(feeIds1.concat(feeIds2)),
          orderNo: this.orderNo
        }
      })
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
      this.computeMoneyTotalFront()
    }
  },
  computed: {
    getReceipayType() {
      return this.moneyTitle === 'receive' ? 'receive' : 'pay'
    },
    getProfitRate() {
      return decimalFixed2(this.orderProfit.totalGrossProfit * 100)
    },
    ... mapState({
      defaultColumnsRecei: state => state.finance.columns.defaultColumnsRecei,
      defaultColumnsPay: state => state.finance.columns.defaultColumnsPay,
      columnsBase: state => state.finance.columns.columnsBase
    })
  },
  components: {
    FinanceTableMass,
    CustomColumns,
    PreviewDialog,
    BizDetailList,
  }
}
</script>
<style>
.finance-orderfee-totalfee .el-dialog__body {
  padding-left: 24px;
}
.finance-orderfee-totalfee .money-box-left .el-button--text {
  line-height: 14px;
  height: 20px;
  padding: 2px 7px;
}
</style>
