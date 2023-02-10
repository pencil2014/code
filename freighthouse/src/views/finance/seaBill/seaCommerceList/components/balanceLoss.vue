<template>
  <div class="finance-page">
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">亏损冲抵</div>
        </div>
        <div class="money-box-right">
          <el-button-group v-if="!option4.data.length">
            <el-button class="finance-btn" type="primary" @click="showLienAmtDialog" size="mini">添加</el-button>
          </el-button-group>
          <el-button-group v-else>
            <el-button
              class="finance-btn"
              type="primary"
              @click="showLienAmtDialog"
              size="mini"
            >重新添加</el-button>
          </el-button-group>
          <el-button-group v-if="option4.data.length">
            <el-button class="finance-btn" @click="lossGedging" size="mini" type="primary">冲抵</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="cancel">取消</el-button>
          </el-button-group>
        </div>
      </div>
      <div class="base-info-box">
        <div class="balance-title">亏损费用信息</div>
        <!-- <div class="base-info-cnt"> -->
        <!-- <div class="base-item longstr">结算单位：{{ summary.settleCorpName }}</div> -->
        <!-- <div class="base-item">亏损费用：{{ summary.restLossAmtTotal }}</div>
        <div class="base-item">币种：{{ summary.currency }}</div>-->
        <!-- <div
            v-if="this.$route.query.type !== 'sysLinePageList'"
            class="base-item"
          >商务：{{ summary.employeeName }}</div>
          <div
            v-if="this.$route.query.type !== 'sysLinePageList'"
            class="base-item"
        >工号：{{ summary.employeeNo }}</div>-->
        <FinanceTable :option="option1" />
        <div class="table_bottom">
          合计：{{ summary.currency }}
          <b>{{ summary.restLossAmtTotal }}</b>
        </div>
      </div>
      <div class="balance-loss-cnt" v-if="option4.data.length">
        <!-- <div class="balance-loss-cnt"> -->
        <div class="surplus-cnt">
          <div class="balance-title">留置费用信息</div>
          <FinanceTable :option="option4" />
          <div class="table_bottom">
            合计：
            <span v-for="(amt, currency) in summaryObj" :key="currency">
              {{ currency }}
              <b class="red">{{ amt }}</b>
            </span>
          </div>

          <!-- <div class="surplus-cnt-info">
            <div class="base-item">结算单位：{{ lienAmtObj.settleCorpName }}</div>
            <div class="base-item">月度编码：{{ lienAmtObj.shLienMonNo }}</div>
            <div class="base-item">留置费用：{{ lienAmtObj.restLienAmt }}</div>
            <div class="base-item">币种：{{ lienAmtObj.currency }}</div>
          </div>-->
        </div>
        <div class="loss-cnt">
          <div class="balance-title">冲抵费用</div>
          <div class="loss-cnt-info">
            <div class="base-item">对冲币种：{{ summary.currency }}</div>
            <div class="base-item">
              对冲金额：
              <el-input v-model="gedgingAmt" placeholder="请输入" @blur="changeGedgingAmt"></el-input>
              <span style="color: #999">(最大:{{ gedingMax}})</span>
            </div>

            <!-- <div class="base-item">
              <span>对冲汇率：</span>
              <span
                v-if="exchangeRatesSettle.length"
              >{{exchangeRatesSettle[0].settlementRateTitle}} {{exchangeRatesSettle[0].settleRate}}</span>
              <el-button
                v-if="exchangeRatesSettle.length"
                type="text"
                size="mini"
                @click="checkExchangeRage"
              >更多</el-button>
            </div>-->
            <div class="base-item"></div>
            <div class="base-item"></div>
          </div>
          <div class="loss-table">
            <div class="list-title">
              费用列表
              <span>
                剩余金额合计：
                <b class="red">{{ feeRestStr }}</b>
              </span>
              <span>
                对冲金额折币合计：
                <b>{{ summary.currency + exchangeTotal }}</b>
              </span>
              <span>
                对冲金额原币合计：
                <b>{{ feeGedgingOriginStr }}</b>
              </span>
            </div>
            <FinanceTable :option="option2" />
          </div>
        </div>
      </div>
    </div>
    <el-dialog title="添加留置费用" :visible.sync="lienAmtDialog" class="self-dialog" width="1060px">
      <div class="line-amt-cnt">
        <FinanceSearch :searchOption="searchOption" @search="search" />
        <FinanceTable ref="addFeeTable" :option="option3" @send-multi="sendMulti" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addLienAmt" size="mini">添加</el-button>
        <el-button size="mini" @click="lienAmtDialog = false">取消</el-button>
      </span>
    </el-dialog>
    <!-- <ExchangeRateDialog
      v-if="rateDialogCfg.show"
      :dialogOption="rateDialogCfg"
      @close="rateDialogClose"
    />-->
  </div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { baseCurrencyList } from '@/api/base'
import {
  listPricingPage,
  listSpecialPage,
  getSpecialListAmtSummary,
  shLienMonInfo,
  lossGedging,
  listSysLinePage,
  getPricingListAmtSummary,
} from '@/api/fin/shBill'
// import ExchangeRateDialog from './exchangeRateDialog'
export default {
  components: {
    FinanceTable,
    FinanceSearch,
    // ExchangeRateDialog,
  },
  mixins: [mixin, routerMixin],
  data() {
    return {
      lienAmtDialog: false,
      searchOption: {},
      option1: {},
      option2: {},
      option3: {},
      option4: { data: [] },
      summary: { settleCorpName: '', restLossAmt: '', currency: '', employeeName: '', employeeNo: '' },
      lienAmtObj: { settleCorpName: '', shLienMonNo: '', restLossAmt: '', currency: '' },
      multipleSelection: [],
      gedgingAmt: '',
      exchangeCurrency: '',
      shLienMonNoList: [],
      // exchangeRatesObj: {},
      // exchangeRatesSettle: [],
      // rateDialogCfg: {
      //   data: [],
      //   show: false,
      //   title: '修改汇率',
      //   change: true,
      //   columns: [
      //     { label: '币种', prop: 'originCurrency', type: 'text' },
      //     { label: '对冲币种', prop: 'settleCurrency', type: 'text' },
      //     { label: '汇率', prop: 'settleRate', type: 'input' },
      //   ],
      // },
    }
  },
  computed: {
    exchangeTotal() {
      return this.shLienMonNoList.reduce((a, b) => new LSnum(a).plus(b.exAmt).toNum(2), 0)
    },
    gedingMax() {
      return this.shLienMonNoList.reduce(
        (a, b) => new LSnum(a).plus(new LSnum(b.gedgingRate).times(b.feeBalanceAmt).toNum(2)).num,
        0
      )
    },
    summaryObj() {
      let obj = {}
      this.option4.data.forEach((item) => {
        let amt = obj[item.currency]
        obj[item.currency] = amt ? new LSnum(amt).plus(item.restLienAmt).toNum(2) : item.restLienAmt
      })
      return obj
    },
    feeRestStr() {
      let obj = {}
      this.shLienMonNoList.forEach((item) => {
        let amt = obj[item.currency]
        obj[item.currency] = amt ? new LSnum(amt).plus(item.feeBalanceAmt).toNum(2) : item.feeBalanceAmt
      })
      let str = ''
      for (const key in obj) {
        str = str + key + obj[key] + ' '
      }
      return str
    },
    feeGedgingOriginStr() {
      let obj = {}
      this.shLienMonNoList.forEach((item) => {
        let amt = obj[item.currency]
        obj[item.currency] = amt ? new LSnum(amt).plus(item.gedgingAmt).toNum(2) : item.gedgingAmt
      })
      let str = ''
      for (const key in obj) {
        str = str + key + obj[key] + ' '
      }
      return str
    },
  },
  watch: {
    '$route.query.type'(val) {
      console.log(this.$route.query.type)
      let columns1 = []
      if (val === 'sysLinePageList') {
        columns1 = [
          { prop: 'yearMon', label: '所属年月', type: 'text' },
          { prop: 'restLossAmt', label: '亏损金额', type: 'text', fontColor: 'green' },
        ]
        this.option1.columns = columns1
      } else if (val === 'pricingPageList' || val === 'specialPageList') {
        columns1 = [
          {
            prop: 'shLienMonNo',
            label: '月度编号',
            type: 'button',
            width: 125,
            operationBtns: {
              show: true,
              callback: (fn, index, row, option, subItem) => this.showSummaryDetail(row),
            },
          },
          { prop: 'yearMon', label: '所属年月', type: 'text' },
          { prop: 'restLossAmt', label: '亏损金额', type: 'text', fontColor: 'green' },
        ]
      }

      this.option1.columns = columns1
    },
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'BalanceLoss1',
      data: [],
      tips: { text: '', show: false },
      operationBtns: false,
      selection: { show: false },
      index: true,
    })

    let pagination2 = Object.assign({}, this.option.pagination, {
      show: true,
    })
    this.option2 = Object.assign({}, this.option, {
      id: 'option2',
      $name: 'BalanceLoss2',
      data: [],
      index: 'show',
      tips: { text: '', show: false },
      operationBtns: false,
      selection: { show: false },
      edit: true,
      pagination: pagination2,
    })
    let columns2 = [
      {
        prop: 'shLienMonNo',
        label: '月度编号',
        type: 'button',
        width: 125,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option, subItem) => this.showSummaryDetail(row),
        },
      },
      { prop: 'yearMon', label: '所属年月', type: 'text' },
      { prop: 'sysLineName', label: '航线', type: 'text' },
      { prop: 'sourceBizNo', label: '工作单号', type: 'text' },
      { prop: 'settleCompName', label: '分公司', type: 'text' },
      { prop: 'settleCorpName', label: '结算单位', type: 'text' },
      { prop: 'feeName', label: '费用名称', type: 'text' },
      { prop: 'currency', label: '币种', type: 'text' },
      { prop: 'feeAmt', label: '金额', type: 'text' },
      { prop: 'feeBalanceAmt', label: '剩余金额', type: 'text' },
      {
        prop: 'gedgingAmt',
        label: '对冲金额',
        type: 'input',
        validateInput: (val, row, item, change) => {
          if (change) {
            if (!/^\d+(\.\d{0,2})?$/.test(val)) {
              this.$msgErrClose('请输入正确的数字！')
              let res = /\d+(\.\d{0,2})?/g.exec(val)
              row[item.prop] = res ? res[0] : ''
            }
            if (val > row.feeBalanceAmt) {
              this.$msgErrClose('对冲金额不能大于剩余金额')
              row[item.prop] = row.feeBalanceAmt
            }
            row.exAmt = new LSnum(row.gedgingAmt).times(row.gedgingRate).toNum(2)
            this.$nextTick(() => {
              // 亏损金额
              let restLossAmt = Math.abs(this.summary.restLossAmtTotal)
              if (this.exchangeTotal > restLossAmt) {
                return this.$msgErrClose('对冲金额不能大于亏损金额')
              }
              this.gedgingAmt = this.exchangeTotal
            })
          }
        },
      },
      { prop: 'gedgingCurrency', label: '对冲币种', type: 'text' },
      { prop: 'gedgingRate', label: '汇率', type: 'text' },
      { prop: 'exAmt', label: '折币金额', type: 'text' },
      { prop: 'createdName', label: '创建人', type: 'text' },
      { prop: 'createdTime', label: '创建时间', type: 'text' },
    ]
    this.option2.columns = columns2
    let pagination3 = Object.assign({}, this.option.pagination, { show: true, isNew: true })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option3 = Object.assign({}, this.option, {
      id: 'option3',
      $name: 'BalanceLoss3',
      data: [],
      tips: { show: false, text: '' },
      selection: { show: true, fixed: 'left' },
      operationBtns: false,
      pagination: pagination3,
      listAmtSummary,
    })
    this.option4 = Object.assign({}, this.option, {
      id: 'option4',
      $name: 'BalanceLoss4',
      data: [],
      tips: false,
      selection: { show: false },
      operationBtns: false,
      pagination: false,
      columns: [
        {
          prop: 'shLienMonNo',
          label: '月度编号',
          type: 'button',
          operationBtns: {
            show: true,
            callback: (fn, index, row, option, subItem) => this.showSummaryDetail(row),
          },
        },
        { prop: 'settleCorpName', label: '结算单位', type: 'text' },
        { prop: 'currency', label: '币种', type: 'text' },
        { prop: 'restLienAmt', label: '留置费用', type: 'text', fontColor: 'red' },
      ],
    })
  },
  methods: {
    init() {
      this.lienAmtDialog = false
      this.searchOption = {
        addFilter: {
          plusShow: true,
          searchInputGroup: [
            { key: 'yearMon', value: '' },
            { key: 'settleCorpCode', value: '' },
            { key: 'settleCompCode', value: '' },
            { key: 'sysLineGroupCode', value: '' },
            { key: 'sysLineCode', value: '' },
            { key: 'currency', value: '' },
          ],
          filterGroups: {
            yearMon: { label: '所属年月', type: 'monthrange', format: 'yyyy-MM', ranges: ['yearMonStart', 'yearMonEnd'] },
            settleCorpCode: {
              label: '结算单位',
              prop: 'settleCorpCode',
              type: 'remoteSelect',
              multiple: true,
              remoteMethod: (queryString, item, row) => this.querySettleUnit2({ queryString }, item),
              visibleChange: (queryString, item, row) => this.querySettleUnit2({ queryString }, item),
              remoteSelectList: [],
            },
            settleCompCode: {
              label: '结算分公司',
              prop: 'settleCorpCode',
              type: 'remoteSelect',
              multiple: true,
              remoteMethod: (queryString, item, row) => this.querySettleUnit2({ queryString }, item),
              visibleChange: (queryString, item, row) => this.querySettleUnit2({ queryString }, item),
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
            currency: {
              label: '币种',
              type: 'remoteSelect',
              remoteMethod: (val, item) => this.getCurrencyList(val, item),
              visibleChange: (val, item) => this.getCurrencyList(val, item),
              remoteSelectList: [],
            },
          },
        },
      }
      let columns3 = [
        { prop: 'yearMon', label: '所属年月', type: 'text', forceWidth: 100 },
        { prop: 'settleCorpName', label: '结算单位', type: 'text' },
        { prop: 'settleCompName', label: '结算分公司', type: 'text' },
        { prop: 'sysLineGroupName', label: '大航线', type: 'text', forceWidth: 100 },
        { prop: 'sysLineName', label: '小航线', type: 'text', forceWidth: 100 },
        { prop: 'currency', label: '币种', type: 'text', forceWidth: 70 },
        { prop: 'totalLienAmt', label: '总留置费用', type: 'text', fontColor: 'red', forceWidth: 100 },
        { prop: 'restLienAmt', label: '剩余留置费用', type: 'text', fontColor: 'red', forceWidth: 100 },
      ]
      let columns1 = [
        { prop: 'settleCorpName', label: '结算单位', type: 'text' },
        { prop: 'yearMon', label: '所属年月', type: 'text' },
        { prop: 'restLossAmt', label: '亏损金额', type: 'text', fontColor: 'green' },
      ]
      if (this.$route.query.type !== 'sysLinePageList') {
        this.searchOption.addFilter.searchInputGroup.unshift({ key: 'shLienMonNo', value: '' })
        this.searchOption.addFilter.filterGroups.shLienMonNo = { label: '月度编号', type: 'input' }
        let shLienMonNo = {
          prop: 'shLienMonNo',
          label: '月度编号',
          type: 'button',
          operationBtns: {
            show: true,
            callback: (fn, index, row, option, subItem) => this.showSummaryDetail(row),
          },
        }
        columns1.unshift(shLienMonNo)
        columns3.unshift(shLienMonNo)
      }
      this.option1.columns = columns1
      this.option3.columns = columns3
      this.option4.data = []
    },
    // 返回
    cancel() {
      // 重置留置费用
      this.lienAmtObj = { settleCorpName: '', shLienMonNo: '', restLossAmt: '', currency: '' }
      this.routerBack()
    },
    // 显示留置费用弹窗
    showLienAmtDialog() {
      this.lienAmtDialog = true
      this.search()
      // 有分页，不便做自动选择
      // this.$refs.addFeeTable.setCheckRow(item, true)
    },
    // 选择留置费用
    sendMulti(data) {
      this.multipleSelection = data
      let data2 = { ascColumns: [], descColumns: [], query: [] }
      let ids = this.multipleSelection.map((item) => item.shLienMonNo).join(',')
      if (ids) {
        data2.query.push({ column: 'shLienMonNo', type: 'in', value: ids })
      } else {
        data2.query = this.searchBackup || []
      }
      if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => {
          this.getListAmtSummary(data2)
        })
      }
    },
    getListAmtSummary(data) {
      let method = this.$route.query.type === 'specialPageList' ? getSpecialListAmtSummary : getPricingListAmtSummary
      method(data).then((res) => {
        let labelObj = {
          restLienAmtListLabel: '剩余留置费用',
          totalLienAmtListLabel: '总留置费用',
        }
        let colorObj = {
          restLienAmtListColor: 'green', // 支持red, green, black三种值
          totalLienAmtListColor: 'red',
        }
        let data = res.data
        delete data.restLossAmtList
        delete data.totalLossAmtList
        this.option3.listAmtSummary = Object.assign(this.option3.listAmtSummary, {
          show: true,
          data,
          labelObj,
          colorObj,
          sortArr: ['totalLienAmtList', 'restLienAmtList'],
        })
      })
    },
    // 搜索留置费用
    search() {
      let data = {
        currPage: this.option3.pagination.currPage,
        pageSize: this.option3.pagination.pageSize,
        columns: [],
        query: [],
      }
      this.finCommonSearch(data.query, this.searchOption)
      // 搜索留置费用列表接口
      this.getShLienMonListPage(data)
    },

    // 添加留置费用搜索
    getShLienMonListPage(data) {
      // let corpStr = this.option1.data.map(v => v.settleCorpCode).toString()
      let defaultQuery = [
        { column: 'hasRestLienAmt', value: 'yes', type: 'default' },
        { column: 'lockStatus', value: 'unlock', type: 'default' },
        { column: 'employeeId', value: this.summary.employeeId || '', type: 'default' },
        // { column: 'lienFeeSettleCorpCode', value: corpStr, type: 'in' },
      ]
      data.query = [...defaultQuery, ...data.query]
      this.searchBackup = data.query
      let method = ''
      if (this.$route.query.type === 'sysLinePageList') {
        method = listSysLinePage
      }
      if (this.$route.query.type === 'pricingPageList') {
        method = listPricingPage
      }
      if (this.$route.query.type === 'specialPageList') {
        method = listSpecialPage
      }
      if (this.$route.query.businessGroup) {
        data.query.push({ column: 'businessGroup', type: 'eq', value: this.$route.query.businessGroup })
      }
      method(data)
        .then((res) => {
          this.option3.data = res.data.list
          Object.assign(this.option3.pagination, res.data)
        })
        .catch(() => (this.option3.data = []))
    },
    // 新增留置费用
    addLienAmt() {
      let len = this.multipleSelection.length
      if (!len) {
        return this.$msgErrClose('请勾选留置费用数据')
      }
      // if (len > 1) {
      //   return this.$msgErrClose('只能勾选一条留置费用数据')
      // }
      // this.lienAmtObj = this.multipleSelection[0]
      // 设置对冲币种
      this.exchangeCurrency = `${this.multipleSelection[0].currency}-${this.summary.currency}`
      // 获取留置费用列表
      this.option4.data = [...this.multipleSelection]
      this.getShLienMonList()
      this.gedgingAmt = 0
      this.lienAmtDialog = false
    },
    // 获取留置费用列表
    getShLienMonList() {
      // let shLienMonNo = this.lienAmtObj.shLienMonNo
      let shLienMonNo = this.multipleSelection.map((v) => v.shLienMonNo).toString()
      let feeType = 'lien'
      shLienMonInfo({ shLienMonNo, feeType, gedgingCurrency: this.summary.currency }).then((res) => {
        let data = res?.data?.feeList || []
        this.shLienMonNoList = data.map((item) => {
          let gedgingCurrency = this.summary.currency
          return Object.assign({}, item, { gedgingCurrency, edit: true })
        })
        this.option2.data = this.shLienMonNoList.slice(0, 10)
        this.option2.pagination.currPage = 1
        this.option2.pagination.pageSize = 10
        this.option2.pagination.totalCount = this.shLienMonNoList.length

        // let toCurrency = this.summary.currency
        // this.exchangeRatesSettle = []
        // let ratesObj = {}
        // let exchangeRatesObj = this.exchangeRatesObj

        // gedgingCurrency 对冲币种 currency 币种   gedgingRate 汇率
        // this.option2.data.forEach((item) => {
        //   if (item.currency === toCurrency) {
        //     item.gedgingRate = 1
        //   } else if (exchangeRatesObj[item.currency]) {
        //     item.gedgingRate = exchangeRatesObj[item.currency][toCurrency]
        //   }
        //   if (!ratesObj[item.currency + '-' + toCurrency]) {
        //     ratesObj[item.currency + '-' + toCurrency] = item.gedgingRate
        //   }
        // })
        // console.log(ratesObj)
        // for (const key in ratesObj) {
        //   if (Object.hasOwnProperty.call(ratesObj, key)) {
        //     let [originCurrency, settleCurrency] = key.split('-')
        //     this.exchangeRatesSettle.push({
        //       settlementRateTitle: key,
        //       originCurrency,
        //       settleCurrency,
        //       settleRate: ratesObj[key],
        //     })
        //   }
        // }
      })
    },
    // 修改对冲金额
    changeGedgingAmt() {
      let res = /\d+(\.\d{0,2})?/g.exec(this.gedgingAmt)
      this.gedgingAmt = res ? res[0] : ''
      // 填写的对冲金额
      let gedgingAmt = Number(this.gedgingAmt)
      // 转换后的对冲金额
      let restLienAmt = new LSnum(this.gedgingAmt).div(this.exchangeRate).toNum(2)
      // 亏损金额
      let restLossAmt = Math.abs(this.summary.restLossAmtTotal)
      if (!/^\d+(\.\d{0,2})?$/.test(this.gedgingAmt)) {
        return this.$msgErrClose('请输入正确的数字！')
      }
      if (gedgingAmt > restLossAmt) {
        return this.$msgErrClose('对冲金额不能大于亏损金额')
      }
      if (restLienAmt > this.gedingMax) {
        return this.$msgErrClose('对冲金额不能大于留置费用，请重新配置')
      }
      this.changeGedgingAmtFn(gedgingAmt)
    },
    // 重新计算表格数据
    changeGedgingAmtFn(gedgingAmt) {
      // 费用列表长度
      // let len = this.shLienMonNoList.length
      let list = this.shLienMonNoList
      if (!gedgingAmt) {
        list.forEach((item) => {
          item.gedgingAmt = 0
          item.exAmt = 0
        })
      } else {
        list.forEach((item) => {
          if (gedgingAmt > 0) {
            // 剩余折币金额
            let feeTotal = new LSnum(item.feeBalanceAmt).times(item.gedgingRate).toNum(2)
            if (feeTotal > gedgingAmt) {
              item.gedgingAmt = new LSnum(gedgingAmt).div(item.gedgingRate).toNum(2)
              item.exAmt = gedgingAmt
              gedgingAmt = 0
            } else {
              item.gedgingAmt = item.feeBalanceAmt
              item.exAmt = new LSnum(item.gedgingAmt).times(item.gedgingRate).toNum(2)
              gedgingAmt = new LSnum(gedgingAmt).minus(item.exAmt).toNum(2)
            }
          } else {
            item.gedgingAmt = 0
            item.exAmt = 0
          }
        })
      }
      // 重新给表格赋值
      let currPage = this.option2.pagination.currPage
      let star = (currPage - 1) * this.option2.pagination.pageSize
      let end = star + this.option2.pagination.pageSize
      this.option2.data = this.shLienMonNoList.slice(star, end)
    },
    // 切换分页条数
    handleSizeChange(val, option) {
      if (option === this.option3) {
        this.option3.pagination.currPage = 1
        this.option3.pagination.pageSize = val
        this.search()
        return
      }
      this.option2.pagination.currPage = 1
      this.option2.pagination.pageSize = val
      this.option2.data = this.shLienMonNoList.slice(0, val)
    },
    // 切换当前分页
    handleCurrentChange(val, option) {
      if (option === this.option3) {
        this.option3.pagination.currPage = val
        this.search()
        return
      }
      console.log(val)
      let pageSize = this.option2.pagination.pageSize
      let star = (val - 1) * pageSize
      let end = star + pageSize
      this.option2.pagination.currPage = val
      this.option2.data = this.shLienMonNoList.slice(star, end)
    },
    // 抵充提交验证
    lossGedging() {
      let exchangeTotal = Number(this.exchangeTotal)
      let gedgingAmt = Number(this.gedgingAmt)
      // let restLossAmt = Math.abs(this.summary.restLossAmt)
      let restLossAmt = Math.abs(this.summary.restLossAmtTotal)
      if (!this.gedgingAmt) {
        return this.$msgErrClose('请填写对冲金额')
      }
      if (exchangeTotal !== gedgingAmt) {
        return this.$msgErrClose('对冲金额与对冲金额合计不一致，请重新配置')
      }
      if (gedgingAmt > restLossAmt) {
        return this.$msgErrClose('对冲金额不能大于亏损金额，请重新配置')
      }
      this.$confirmWarn('是否确认进行亏损冲抵？', () => this.lossGedgingFn())
    },
    // 提交抵充
    lossGedgingFn() {
      // let lossGedgingFeeList = this.shLienMonNoList.map((item) => {
      //   return { feeId: item.feeId, gedgingAmt: item.gedgingAmt, gedgingCurrency }
      // })
      let lossMonIds = this.option1.data.map((item) => item.shLienMonId)
      let lossMonNos = this.option1.data.map((item) => item.shLienMonNo)
      let query = {
        gedgingCurrency: this.summary.currency,
        lossMonIds,
        lossMonNos,
        gedgingAmt: this.exchangeTotal,
        shLienMonNo: this.option4.data.map((v) => v.shLienMonNo).toString(),
        lossGedgingFeeList: this.shLienMonNoList,
      }
      lossGedging(query).then((res) => {
        this.$msgSucClose('恭喜你，对冲提交成功！')
        this.cancel()
      })
    },
    // 币种下拉列表自动补充的数据
    getCurrencyList(queryString, item) {
      baseCurrencyList(queryString, 'valid').then((res) => {
        let preArr = [],
          otherArr = []
        res.data.forEach((el) => {
          let currency = { label: `${el.code}(${el.cnName})`, value: el.code }
          if (['CNY', 'USD'].includes(el.code)) {
            preArr.push(currency)
          } else {
            otherArr.push(currency)
          }
        })
        item.remoteSelectList = [...preArr, ...otherArr]
      })
    },
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
    // 跳转月度详情页
    showSummaryDetail(row) {
      this.routerPush('SummaryBillDetail', { shLienMonNo: row.shLienMonNo })
    },
    // checkExchangeRage() {
    //   this.rateDialogCfg.data = this.exchangeRatesSettle
    //   this.rateDialogCfg.show = true
    // },
    // rateDialogClose(arr) {
    //   // gedgingCurrency 对冲币种 currency 币种   gedgingRate 汇率
    //   this.exchangeRatesSettle = arr
    //   let obj = {}
    //   arr.forEach((item) => (obj[item.originCurrency] = item.settleRate))
    //   this.option2.data.forEach((item) => {
    //     let { currency, gedgingCurrency } = item
    //     if (currency === gedgingCurrency) return
    //     item.gedgingRate = obj[currency]
    //   })
    // },
  },
  activated() {
    // 获取抵充账单
    let restLossAmtArr = sessionStorage.getItem('restLossAmtArr')
    sessionStorage.removeItem('restLossAmtArr')
    if (restLossAmtArr) {
      this.lienAmtObj = { settleCorpName: '', shLienMonNo: '', restLossAmt: '', currency: '' }
      let data = JSON.parse(restLossAmtArr)
      console.log(data)
      this.summary = data[0]
      this.summary.restLossAmtTotal = data.reduce((pre, cur) => {
        return new LSnum(pre).plus(cur.restLossAmt).toNum(2)
      }, 0)
      this.option1.data = data
      this.init()
    }
  },
}
</script>

<style lang="scss" scoped>
.table_bottom {
  background: #e7eeff;
  line-height: 22px;
  text-align: right;
  margin: 0 8px;
  padding: 0 8px;
  font-weight: bold;
  b {
    color: rgb(51, 177, 138);
    &.red {
      color: rgb(230, 57, 35);
    }
  }
}
.self-dialog ::v-deep {
  .el-dialog__body {
    padding: 10px 10px 0;
  }
  .el-dialog__footer {
    padding-right: 10px;
  }
  .finance-search-form {
    padding: 0 !important;
  }
  .finance-table {
    padding: 6px 0;
  }
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}

.base-info-cnt,
.surplus-cnt-info,
.loss-cnt-info {
  margin: 10px;
  display: flex;

  .base-item {
    flex: 0 0 auto;
    flex-basis: 260px;
    &.longstr {
      flex-basis: 350px;
    }
  }
}
.el-row {
  overflow: hidden;
}
.balance-title {
  font-size: 14px;
  font-weight: 600;
  margin: 12px 10px;
}

.loss-cnt {
  margin-top: 28px;

  .loss-cnt-info {
    .el-input,
    .el-select {
      width: 100px;
      text-align: center;
    }
  }
}

.loss-table {
  margin-top: 10px;
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  // color: #909399;
  line-height: 14px;
  padding: 10px 0;
  margin: 0 8px;
  // background-color: #f8f9fd;
  border-bottom: 1px solid #dfe6ec;
  span {
    margin-left: 20px;
    font-weight: 500;
    font-size: 12px;
    b {
      color: rgb(51, 177, 138);
      &.red {
        color: rgb(230, 57, 35);
      }
    }
  }
}
</style>
