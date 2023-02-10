<template>
  <div class="finance-page">
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">付款申请</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="submitRequest" size="mini" type="primary">提交申请</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="cancel">{{$t('Common.cancel')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <div class="payment-request-form">
        <el-form
          ref="paymentRequestForm"
          :model="paymentRequestForm"
          :inline="true"
          label-width="100px"
          size="mini"
          :rules="rules"
        >
          <el-form-item label="结算分公司：" prop="payCompName">
            <el-input v-model="paymentRequestForm.payCompName" disabled></el-input>
          </el-form-item>
          <el-form-item :label="$t('FeeList.settleCorp')" prop="settleCorpName">
            <el-autocomplete
              style="width:200px;"
              v-model="paymentRequestForm.settleCorpName"
              :placeholder="$t('Common.plSelect')"
              clearable
              :select-when-unmatched="true"
              :fetch-suggestions="(queryString, cb) => {autocompleteSettU.querySearch && autocompleteSettU.querySearch(queryString, cb)}"
              @select="(value) => {autocompleteSettU.select && autocompleteSettU.select(value)}"
              @change="(value) => {autocompleteSettU.change && autocompleteSettU.change(value)}"
            ></el-autocomplete>
          </el-form-item>
          <!-- <el-form-item label="币种:" prop="currency">
            <el-input v-model="paymentRequestForm.currency" disabled></el-input>
          </el-form-item>-->
          <!-- <el-form-item label="商务:" prop="employeeName">
						<el-input
							v-model="paymentRequestForm.employeeName"
							disabled
						></el-input>
					</el-form-item>
					<el-form-item label="工号:" prop="employeeNo">
						<el-input
							v-model="paymentRequestForm.employeeNo"
							disabled
						></el-input>
          </el-form-item>-->
          <!-- <el-form-item label="剩余留置费用：" prop="balanceAmt">
            <el-input v-model="paymentRequestForm.balanceAmt" disabled></el-input>
          </el-form-item>-->
          <el-form-item :label="$t('Settle.paymentCurrency')" prop="settleCurrency">
            <el-select
              v-model="paymentRequestForm.settleCurrency"
              @change="changeCurrency"
              :placeholder="$t('Common.plSelect')"
            >
              <el-option
                v-for="op in currencyOptions"
                :key="op.value"
                :label="op.label"
                :value="op.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="付款方式：" prop="payWay">
            <el-select v-model="paymentRequestForm.payWay" :placeholder="$t('Common.plSelect')" @change="changePayway">
              <el-option v-for="(o, key) in payWayArr" :key="key" :label="o.label" :value="o.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('PayApplyList.payAmt')" prop="payAmt" style="width:610px;">
            <div>
              <!-- style="width:200px" -->
              <el-input
                v-model="paymentRequestForm.payAmt"
                @blur="changePayAmt"
              ></el-input>
              <!-- style="width:100px" -->
              <span v-if="maxAmt" style="font-size: 12px; color: #999;">(最大:{{maxAmt}})</span>
              <!-- width:100px -->
            </div>
          </el-form-item>
          <div
            class="settlement-exchange-rates"
            style="width:300px;margin-right:10px;line-height:20px;"
          >
          <!-- margin-right:4px -->
            <span style="display:inline-block;width:100px;text-align:right;padding-right:4px;">汇率：</span>
            <span
              v-if="exchangeRatesSettle.length"
            >{{exchangeRatesSettle[0].settlementRateTitle}} {{exchangeRatesSettle[0].settleRate}}</span>
            <el-button
              v-if="exchangeRatesSettle.length"
              type="text"
              size="mini"
              @click="checkExchangeRage"
            >{{$t('Common.more')}}</el-button>
          </div>
          <!-- <el-form-item label="汇率:" prop="settleRate">
            <el-input v-model="paymentRequestForm.settleRateName" disabled style="width: 80px"></el-input>
            <el-input
              v-model="paymentRequestForm.settleRate"
              style="width: 120px"
              @change="changeRate"
            ></el-input>
          </el-form-item>-->
          <el-form-item label="最晚付款时间：" prop="latestPayDay">
            <el-date-picker
              v-model="paymentRequestForm.latestPayDay"
              type="date"
              :placeholder="$t('Common.plSelect')"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="收款账户名简称：" prop="recvAccountNo">
            <el-select
              v-model="paymentRequestForm.recvAccountNo"
              placeholder="请选择收款账户名简称"
              filterable
              clearable
              remote
              :noRemote="true"
              :remote-method=" (queryString) => bankAccountList(queryString) "
            >
              <!-- @visible-change=" (value) => value && bankAccountList() " -->
              <el-option
                v-for="(item, index) in bankAccountSelectOptions"
                :key="'bankAccountSelectOptions' + index"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="申请备注：" prop="applyRemark">
            <el-input
              v-model="paymentRequestForm.applyRemark"
              class="commerce-apply-remark"
              show-word-limit
              maxlength="500"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="requst-list">
        <div class="list-title">
          费用列表
          <span>剩余留置费用：{{originalBalance}}</span>
          <span>
            付款总金额：
            <b>{{ payAmt }}</b>
          </span>
          <el-button-group style="margin-left: 6px; float:right;height: 20px;">
            <el-button
              class="finance-btn"
              @click="feeSearchToggle = !feeSearchToggle"
              size="mini"
              type="primary"
            >{{feeSearchToggle?$t('Common.hideSearch') : $t('Common.showSearch')}}</el-button>
          </el-button-group>
        </div>
        <div>
          <DetailFeeSearchFilter
            v-show="feeSearchToggle"
            style="padding-bottom: 8px;"
            ref="DetailFeeSearchFilter"
            :list="option1.data"
            :columns="feeListColumns"
            @search="search"
          />
        </div>
        <FinanceTable :option="option1" />
      </div>
    </div>
    <ExchangeRateDialog
      v-if="rateDialogCfg.show"
      :dialogOption="rateDialogCfg"
      @close="rateDialogClose"
    />
  </div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import DetailFeeSearchFilter from '@/views/finance/components/financeSearch/detailFeeSearchFilter'
import { mapGetters } from 'vuex'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { baseCurrencyList, actualExchangeRate } from '@/api/base'
import ExchangeRateDialog from './exchangeRateDialog'
import { queryFeeForSettleApply, saveShLienSettleApply } from '@/api/fin/shBill'
import { bankAccountList } from '@/api/fin/settleUnit'
export default {
  components: {
    FinanceTable,
    DetailFeeSearchFilter,
    ExchangeRateDialog,
  },
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      feeSearchToggle: false,
      feeListColumns: [],
      autocompleteSettU: {},
      option1: { data: [] },
      currencyOptions: [],
      paymentRequestForm: {
        settleCurrency: '',
        payWay: '',
        payAmt: '',
        settleRateName: '',
        settleRate: '',
        latestPayDay: '',
        recvAccountNo: '',
        payCompCode: '',
        payCompName: '',
        applyRemark: ''
      },
      rules: {
        settleCorpName: [{ required: true, message: ' ', trigger: ['blur', 'change'] }],
        settleCurrency: [{ required: true, message: ' ', trigger: 'change' }],
        payWay: [{ required: true, message: ' ', trigger: 'change' }],
      },
      payWayArr: [],
      shLienMonNoList: [],
      changePayAmtStatus: false,
      dataArr: [],
      bankAccountSelectOptions: [],
      exchangeRatesObj: {},
      exchangeRatesSettle: [],
      rateDialogCfg: { data: [], show: false, title: '修改汇率', change: true }, // 汇率弹框配置
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
    payAmt() {
      return this.option1.data.reduce((pre, cur) => new LSnum(pre).plus(cur.settleAmt).toNum(2), 0)
    },
    maxAmt() {
      return this.option1.data.reduce(
        (pre, cur) => new LSnum(pre).plus(new LSnum(cur.balanceAmt).times(cur.settleRate).toNum(2)).toNum(2),
        0
      )
    },
    originalBalance() {
      let obj = {}
      this.option1.data.forEach((item) => {
        if (obj[item.currency]) {
          obj[item.currency] = new LSnum(obj[item.currency]).plus(item.balanceAmt).num
        } else {
          obj[item.currency] = item.balanceAmt
        }
      })
      let str = ''
      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          str += `${key} ${obj[key]}　`
        }
      }
      return str
    },
  },
  watch: {
    payAmt() {
      if (this.changePayAmtStatus && +this.payAmt) {
        this.paymentRequestForm.payAmt = this.payAmt
      }
    },
    '$store.state.user.userInfo.settleCompanyCode'(val) {
      this.paymentRequestForm.payCompCode = this.$store.state.user.userInfo.settleCompanyCode
      this.paymentRequestForm.payCompName = this.$store.state.user.userInfo.settleCompanyName
      console.log(this.$store.state.user.userInfo.settleCompanyCode)
      console.log(this.$store.state.user.userInfo.settleCompanyName)
    },
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'PaymentRequest',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns: false,
      selection: false,
      index: true,
      edit: true,
      pagination: false,
    })
    let columns = [
      {
        prop: 'shLienMonNo',
        label: '月度编号',
        type: 'button',
        width: 125,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option, subItem) => {
            this.routerPush('SummaryBillDetail', { shLienMonNo: row.shLienMonNo })
          },
        },
        st: 1,
      },
      { prop: 'yearMon', label: '所属年月', type: 'text', st: 5 },
      { prop: 'sysLineName', label: '航线', type: 'text', st: 2 },
      {
        prop: 'orderNo',
        label: this.$t('FeeList.orderNo'),
        type: 'button',
        width: 125,
        st: 1,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option, subItem) => {
            this.showOneNoDetail('order', row.orderNo, { feeChild: 'specialManagementFee', isFromSea: true })
          },
        },
      },
      // { prop: 'orderNo', label: this.$t('FeeList.orderNo'), type: 'text', width: 150, st: 1 },
      { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text', width: 150, st: 2 },
      { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 150, st: 2 },
      { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text', st: 2 },
      { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text', st: 2 },
      { prop: 'balanceAmt', label: '剩余金额', type: 'text' },
      {
        prop: 'payAmt',
        label: '原币付款金额',
        type: 'input',
        validateInput: (val, row, item, change) => {
          if (change) {
            // let payWay = this.paymentRequestForm.payWay
            if (!this.paymentRequestForm.settleCurrency) {
              this.$msgErrClose('请先选择付款币种！')
            }
            if (!/^\d+(\.\d{0,2})?$/.test(val)) {
              this.$msgErrClose('请输入正确的数字！')
              let res = /\d+(\.\d{0,2})?/g.exec(val)
              row[item.prop] = res ? res[0] : ''
            }
            let balanceAmt = row['balanceAmt']
            if (val > balanceAmt) {
              this.$msgErrClose('原币付款金额不能大于剩余金额！')
              row[item.prop] = balanceAmt
            }
            this.$nextTick(() => {
              this.changePayAmtStatus = true //允许修改付款金额
              row.settleAmt = new LSnum(row.payAmt).times(row.settleRate).toNum(2)
              // row.settleAmt = (row.payAmt * row.settleRate).toFixed(2)
            })
          }
        },
      },
      { prop: 'settleCurrency', label: this.$t('Settle.paymentCurrency'), type: 'text', st: 2 },
      { prop: 'settleRate', label: '汇率', type: 'text' },
      { prop: 'settleAmt', label: this.$t('Settle.applyPayAmt'), type: 'text' },
      { prop: 'createdName', label: this.$t('Common.createdBy'), type: 'text', st: 2 },
      { prop: 'createdTime', label: this.$t('Common.createTime'), type: 'text', width: 130, st: 4 },
      { prop: 'confirmName', label: '确认人', type: 'text', st: 2 },
      { prop: 'confirmTime', label: '确认时间', type: 'text', width: 130, st: 4 },
    ]
    this.feeListColumns.push(...columns.map((item) => ({ ...item })))
    this.option1.columns = columns

    // 排除付款方式
    this.payWayArr = this.dictMap['payWay'].filter((item) => {
      return item.value !== 'prepay_dedue'
    })

    this.autocompleteSettU = {
      querySearch: (queryString, cb) => {
        this.selectedOptionItem = ''
        this.querySettleUnit({ queryString, unitTypes: 'customer,supplier,company,DEPT', isAdd: true, isForbid: true, receipayType: 'pay' }, cb)
      },
      select: (optionItem, row) => {
        this.selectedOptionItem = optionItem
        this.paymentRequestForm.settleCorpName = optionItem.value
        this.paymentRequestForm.settleCorpCode = optionItem.key
      },
      change: (val, row) => {
        // 延时150ms获取select中的改变
        setTimeout(() => {
          if (this.selectedOptionItem === '') {
            this.paymentRequestForm.settleCorpName = ''
            this.paymentRequestForm.settleCorpCode = ''
          }
        }, 150)
      },
    }
    actualExchangeRate({rateType: 'pay'}).then((res) => {
      let obj = this.exchangeRatesObj
      ;(res.data || []).forEach(({ rate, srcCurrency, toCurrency }) => {
        if (!obj[srcCurrency]) {
          obj[srcCurrency] = { [toCurrency]: rate }
        } else {
          obj[srcCurrency][toCurrency] = rate
        }
      })
    })
  },
  methods: {
    // 取消返回
    cancel(close) {
      if (close === true) this.delVisitedView()
      this.routerBack()
      this.$refs.paymentRequestForm.resetFields()
    },
    // 获取付款申请详情
    queryFeeForSettleApply(shLienMonNoList) {
      queryFeeForSettleApply({ shLienMonNoList })
        .then((res) => {
          this.paymentRequestForm = Object.assign({}, this.paymentRequestForm, res.data, { payWay: 'cash' })
          this.dataArr = res.data.shLienSettleFeeList.map((item) => {
            return Object.assign({}, item, { payAmt: '', settleCurrency: '', settleRate: '', settleAmt: '', edit: true })
          })
          this.paymentRequestForm.payCompCode = res.data.settleCompCode
          this.paymentRequestForm.payCompName = res.data.settleCompName
          this.option1.data = this.dataArr
        })
        .catch(() => this.cancel(true))
    },
    // 选择付款币种
    changeCurrency() {
      // let srcCurrency = this.paymentRequestForm.currency
      let toCurrency = this.paymentRequestForm.settleCurrency
      this.exchangeRatesSettle = []
      // this.paymentRequestForm.settleRateName = `${srcCurrency} - ${toCurrency}`
      let ratesObj = {}
      let exchangeRatesObj = this.exchangeRatesObj
      this.option1.data.forEach((item) => {
        item.settleCurrency = toCurrency
        if (item.currency === toCurrency) {
          item.settleRate = 1
        } else if (exchangeRatesObj[item.currency]) {
          item.settleRate = exchangeRatesObj[item.currency][toCurrency]
        }
        if (!ratesObj[item.currency + '-' + toCurrency]) {
          ratesObj[item.currency + '-' + toCurrency] = item.settleRate
        }
      })
      console.log(ratesObj)
      for (const key in ratesObj) {
        if (Object.hasOwnProperty.call(ratesObj, key)) {
          let [originCurrency, settleCurrency] = key.split('-')
          this.exchangeRatesSettle.push({
            settlementRateTitle: key,
            originCurrency,
            settleCurrency,
            settleRate: ratesObj[key],
          })
        }
      }
      this.changeRate()
      this.bankAccountList()
    },
    // 修改汇率
    changeRate() {
      this.changePayAmtStatus = false //不允许修改付款金额
      this.changePayAmt()
    },
    // 选择付款方式
    changePayway() {
      // this.changePayAmt()
    },
    // 提交付款申请验证
    submitRequest() {
      this.$refs.paymentRequestForm.validate((valid) => {
        if (valid) {
          let payAmtValid = this.option1.data.some((item) => {
            return item.payAmt > item.balanceAmt
          })
          if (payAmtValid) {
            return this.$msgErrClose('原币付款金额不能大于剩余金额!')
          }
          if (Number(this.payAmt) !== Number(this.paymentRequestForm.payAmt)) {
            // return this.$message({
            // 	message: '付款金额预列表付款金额总和不一致',
            // 	type: 'error',
            // 	showClose: true,
            // })
          }
          this.$confirmWarn('是否确认提交付款申请？', () => this.submitRequestFn())
        }
      })
    },
    // 提交付款申请
    submitRequestFn() {
      let shLienMonNoList = this.shLienMonNoList
      let { payCompCode, payCompName, settleCorpName, settleCorpCode, settleCurrency, payWay, recvAccountNo, latestPayDay, applyRemark } =
        this.paymentRequestForm
      let shLienSettleFeeList = this.option1.data.map((item) => {
        let { shLienMonNo, originalFeeId, payAmt, settleRate, feeName, sysLineName } = item
        return {
          shLienMonNo,
          originalFeeId,
          settleAmt: payAmt,
          settleRate,
          feeName,
          sysLineName,
        }
      })
      let data = {
        shLienMonNoList,
        settleCurrency,
        recvCorpCode: settleCorpCode,
        recvCorpName: settleCorpName,
        payCompCode,
        payCompName,
        payWay,
        recvAccountNo,
        latestPayDay,
        applyRemark,
        shLienSettleFeeList,
      }
      // return console.log(data);
      saveShLienSettleApply(data).then((res) => {
        this.$msgSucClose('付款申请提交成功！')
        this.cancel(true)
      })
    },
    // 币种下拉列表自动补充的数据
    getCurrencyList() {
      baseCurrencyList('', 'valid').then((res) => {
        let preArr = [],
          otherArr = []
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
        this.currencyOptions = [...preArr, ...otherArr]
      })
    },
    // 修改付款金额
    changePayAmt() {
      let payAmt = this.paymentRequestForm.payAmt
      if (!payAmt) {
        return false
      }
      if (!this.paymentRequestForm.settleCurrency) {
        return this.$msgErrClose('请先选择付款币种！')
      }
      if (!/^\d+(\.\d{0,2})?$/.test(payAmt)) {
        return this.$msgErrClose('请输入正确的数字！')
      }
      if (Number(payAmt) > this.maxAmt) {
        return this.$msgErrClose('付款金额大于总留置费用！')
      }
      this.changePayAmtStatus = false //允许修改付款金额
      this.changePayAmtFn(payAmt)
    },
    // 重新计算表格数据
    changePayAmtFn(payAmt) {
      if (!payAmt) {
        this.option1.data.forEach((item) => {
          item.payAmt = 0
          item.settleAmt = 0
        })
      } else {
        this.option1.data.forEach((item) => {
          if (payAmt > 0) {
            // 剩余折币金额
            // let feeTotal = item.balanceAmt * item.settleRate
            let feeTotal = new LSnum(item.balanceAmt).times(item.settleRate).toNum(2)
            if (feeTotal > payAmt) {
              // item.payAmt = Number(payAmt / item.settleRate).toFixed(2)
              item.payAmt = new LSnum(payAmt).div(item.settleRate).toNum(2)
              // item.settleAmt = Number(item.payAmt * item.settleRate).toFixed(2)
              item.settleAmt = new LSnum(item.payAmt).times(item.settleRate).toNum(2)
              payAmt = 0
            } else {
              item.payAmt = item.balanceAmt
              // item.settleAmt = Number(item.payAmt * item.settleRate).toFixed(2)
              item.settleAmt = new LSnum(item.payAmt).times(item.settleRate).toNum(2)
              // payAmt -= item.settleAmt
              payAmt = new LSnum(payAmt).minus(item.settleAmt).toNum(2)
            }
          } else {
            item.payAmt = 0
            item.settleAmt = 0
          }
        })
        if (payAmt > 0) {
          this.changePayAmtStatus = true
          this.paymentRequestForm.payAmt = this.payAmt
        }
      }
    },
    //收款银行简称
    bankAccountList(queryString) {
      if (!this.paymentRequestForm.settleCurrency) {
        this.bankAccountSelectOptions = []
        return this.$msgErrClose('请先选择付款币种！')
      }
      let data = {
        unitCode: this.paymentRequestForm.settleCorpCode,
        currency: this.paymentRequestForm.settleCurrency,
        accountShortName: queryString,
        status: 'effect',
        receipayType: 'receive',
      }
      bankAccountList(data).then((res) => {
        let list = res.data ? res.data : []
        this.bankAccountSelectOptions = list.map((item) => {
          item.value = item.accountNo
          item.label = item.accountShortName
          return item
        })
      })
    },
    search(list) {
      this.option1.data = [...list]
    },
    checkExchangeRage() {
      this.rateDialogCfg.data = this.exchangeRatesSettle
      this.rateDialogCfg.show = true
    },
    rateDialogClose(arr) {
      this.exchangeRatesSettle = arr
      let obj = {}
      arr.forEach((item) => (obj[item.originCurrency] = item.settleRate))
      this.option1.data.forEach((item) => {
        let { currency, settleCurrency } = item
        if (currency === settleCurrency) return
        console.log(currency)
        item.settleRate = obj[currency]
      })
      this.changeRate()
    },
  },
  mounted() {
    // 获取币种下拉框
    this.getCurrencyList()
  },
  activated() {
    // 获取付款申请数据
    let restLienAmtArr = sessionStorage.getItem('restLienAmtArr')
    sessionStorage.removeItem('restLienAmtArr')
    if (restLienAmtArr) {
      this.$refs.paymentRequestForm.resetFields()
      let data = JSON.parse(restLienAmtArr)
      let shLienMonNoList = []
      data.forEach((item) => {
        shLienMonNoList.push(item.shLienMonNo)
      })
      this.shLienMonNoList = shLienMonNoList
      // 请求付款数据详情
      this.queryFeeForSettleApply(shLienMonNoList)
      this.$refs.DetailFeeSearchFilter && this.$refs.DetailFeeSearchFilter.clearData()
    }
  },
}
</script>

<style lang="scss" scoped>
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}

.payment-request-form {
  padding: 20px 8px 0 8px;
  background: #fff;

  .el-input,
  .el-select {
    width: 200px;
  }
}
.commerce-apply-remark ::v-deep {
  .el-input__inner {
    padding-right: 51px;
  }
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: #909399;
  line-height: 14px;
  padding: 10px;
  margin: 0 8px;
  background-color: #f8f9fd;
  border-bottom: 1px solid #dfe6ec;
  span {
    margin-left: 30px;
    font-weight: 500;
    font-size: 12px;

    b {
      color: red;
    }
  }
}
.settle-rate {
  position: absolute;
  border: none;
}
</style>
