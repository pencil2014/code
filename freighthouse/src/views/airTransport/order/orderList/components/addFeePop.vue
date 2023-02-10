<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback" id="overseasFreight-addFee">
    <el-form ref="form" :rules="rules" :model="createItem" label-width="80px" :show-message="false">
      <div class="order-add-fee-header">
        <div class="schemeNumber">报价方案：{{selectSchemeNumber}}</div>
        <div>预计成本：<span v-for="(el,index) in totalAmount" :key="index">{{el.value}} {{el.label}}；</span></div>
      </div>
      <el-table :data="createItem.feeList" style="width: 100%;margin-bottom: 24px">
        <el-table-column prop="feeCode" label="费用名称" align="center" width="150">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>费用名称</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`feeList.${scope.$index}.feeCode`" :rules="rules.feeCode" label-width="0">
              <el-select size="mini" v-model="scope.row.feeCode" clearable filterable remote reserve-keyword placeholder="" :remote-method="(val)=>{ feeItemQuerySearch(val,scope.row.feeName)}" @focus="feeItemQuerySearch('',scope.row.feeName)" @change="((value) => feeItemChange(value, scope.$index))">
                <el-option v-for="item in feeItemList" :key="item.feeCode" :label="item.feeEnName" :value="item.feeCode">
                  <div>
                    <span>{{item.feeEnName}}</span>
                    <span v-if="item.feeName">({{item.feeName}})</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="taxRate" label="收付类型" align="center">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>收付类型</div>
          </template>
          <template slot-scope="scope">
            <el-form-item label-width="0" :prop="`feeList.${scope.$index}.receipayType`" :rules="rules.receipayType">
              <el-select v-model="scope.row.receipayType" placeholder="" filterable clearable>
                <el-option v-for="item in receipayOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="unitCount" label="数量" align="center">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>数量</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`feeList.${scope.$index}.unitCount`" :rules="rules.unitCount" label-width="0">
              <el-input v-model="scope.row.unitCount" clearable size="mini" @input="checkNumFeeInput(scope.row.unitCount,'Number',scope.$index)" style="width:100%" placeholder=""></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" label="单价" align="center">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>单价</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`feeList.${scope.$index}.unitPrice`" :rules="rules.unitPrice" label-width="0">
              <el-input v-model="scope.row.unitPrice" clearable size="mini" @input="checkNumInputMaxVal(scope.row.unitPrice,'unit Price',scope.$index)" style="width:100%" placeholder=""></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="feeAmt" label="费用金额" align="center">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>费用金额</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`feeList.${scope.$index}.feeAmt`" :rules="rules.feeAmt" label-width="0">
              <el-input v-model="scope.row.feeAmt" disabled clearable size="mini" maxlength="125" style="width:100%" placeholder=""></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="currency" label="币别" align="center">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>币别</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`feeList.${scope.$index}.currency`" :rules="rules.currency" label-width="0">
              <el-select v-model="scope.row.currency" placeholder="" clearable>
                <el-option v-for="(o, key) in currencyOptions" :key="key" :label="o.code" :value="o.code">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="settleCorpCode" label="结算单位" align="center" width="150">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>结算单位</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`feeList.${scope.$index}.settleCorpCode`" :rules="rules.settleCorpCode" label-width="0">
              <el-select size="mini" v-model="scope.row.settleCorpCode" clearable filterable remote reserve-keyword placeholder="结算单位" @change="((value) => settleCorpChange(value, scope.$index))" :remote-method="(val)=>{ queryFinSupplierList(val,scope.row.feeCode)}" @focus="queryFinSupplierList('',scope.row.feeCode)">
                <el-option v-for="item in finSupplierList" :key="item.unitCode" :label="item.unitName" :value="item.unitCode">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="serviceCode" label="服务项" align="center">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>服务项</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`feeList.${scope.$index}.serviceCode`" :rules="rules.serviceCode" label-width="0">
              <el-select v-model="scope.row.serviceCode" filterable placeholder="" clearable>
                <el-option v-for="(o, key) in serviceList" :key="key" :label="o.serviceName" :value="o.serviceCode">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="feeUnit" label="计费单位" align="center">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>计费单位</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`feeList.${scope.$index}.feeUnit`" :rules="rules.feeUnit" label-width="0">
              <el-select v-model="scope.row.feeUnit" placeholder="" filterable clearable>
                <el-option v-for="item in dictMap.feeUnit" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="taxRate" label="税率" align="center">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>税率</div>
          </template>
          <template slot-scope="scope">
            <el-form-item label-width="0" :prop="`feeList.${scope.$index}.taxRate`" :rules="rules.taxRate">
              <el-select v-model="scope.row.taxRate" placeholder="" filterable clearable>
                <el-option v-for="item in dictMap.taxRateInfo" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" align="center" width="150">
          <template slot-scope="scope">
            <el-form-item label-width="0">
              <el-input v-model="scope.row.remark" clearable size="mini" maxlength="500" style="width:100%" placeholder=""></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <div class="del-btn">
              <el-button v-if="createItem.feeList.length>1" class="red" type="text" @click="delFee(scope)" style="padding:6px 6px">删除</el-button>
              <el-button type="text" @click="addFee" style="padding:6px 6px">新增</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </BaseDialog>
</template>

<script>
import { baseCurrencyList, baseFeeItemList } from '@/api/base'
import { feeCreate } from '@/api/order/list'
import {
  checkQuantityWeightVolume,
  validateIntegerQuantity
} from '@/utils/validate'
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import Search from '@/components/Base/Search/index'
import { getDictLabel } from '@/utils/tools'
import { queryFinSupplierList } from '@/api/fin/settleUnit'
let timer = null
export default {
  filters: {
    formatValidity(val) {
      return val.replace(',', '至')
    }
  },
  data() {
    return {
      receipayOptions: [
        {
          label: '应付',
          value: 'pay'
        },
        {
          label: '应收',
          value: 'receive'
        }
      ],
      canSubmit: true,
      finSupplierList: [],
      eQuery: this.$route.query,
      feeItemList: [], //费用下拉
      rules: {
        receipayType: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        settleCorpCode: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        serviceCode: [{ required: true, message: '请选择', trigger: 'change' }],
        unitCount: [
          { required: true, message: '请选择', trigger: 'change' },
          { validator: validateIntegerQuantity(), trigger: 'change' }
        ],
        feeCode: [{ required: true, message: '请选择', trigger: 'change' }],
        feeUnit: [{ required: true, message: '请选择', trigger: 'change' }],
        currency: [{ required: true, message: '请选择', trigger: 'change' }],
        unitPrice: [
          { required: true, message: '请选择', trigger: 'change' },
          { validator: checkQuantityWeightVolume(), trigger: 'change' }
        ],
        feeAmt: [
          { required: true, message: '请选择', trigger: 'change' },
          { validator: checkQuantityWeightVolume(999999999), trigger: 'change' }
        ],
        taxRate: [{ required: true, message: '请选择', trigger: 'change' }]
      },
      createItem: {
        feeList: []
      },
      getDictLabel: getDictLabel,
      dialogConfig: {
        title: '一键生成费用',
        show: true,
        width: '1400px'
      },
      currencyOptions: []
    }
  },
  props: {
    feeData: {
      type: Array,
      default() {
        return []
      }
    },
    serviceList: {
      type: Array,
      default() {
        return []
      }
    },
    selectSchemeNumber: {
      type: String,
      default: ''
    }
  },
  created() {
    this.getCurrencyList()
    console.log(this.feeData)
    if (this.feeData.length > 0) {
      for (let i = 0; i < this.feeData.length; i++) {
        this.createItem.feeList.push({
          settleCorpCode: '',
          serviceCode: '',
          feeCode: this.feeData[i].feeCode,
          feeName: this.feeData[i].feeName,
          unitPrice: this.feeData[i].feePrice,
          feeUnit: this.feeData[i].feeUnit,
          feeAmt: this.feeData[i].feeTotal,
          unitCount: this.feeData[i].feeQuantity,
          currency: this.feeData[i].feeCurrency,
          taxRate: '0',
          remark: this.feeData[i].remark,
          receipayType: 'pay',
          settleCorpName: ''
        })
      }
    }
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      roles: (state) => state.user.roles,
      airOrderInfo: (state) => state.airTransport.airOrderInfo
    }),
    totalAmount() {
      let arr = []
      for (let i = 0; i < this.createItem.feeList.length; i++) {
        if (
          this.createItem.feeList[i].feeAmt &&
          this.createItem.feeList[i].currency
        ) {
          if (
            !arr.find((el) => el.label == this.createItem.feeList[i].currency)
          ) {
            arr.push({
              value: this.createItem.feeList[i].feeAmt,
              label: this.createItem.feeList[i].currency
            })
          } else {
            let index = arr.findIndex(
              (el) => el.label == this.createItem.feeList[i].currency
            )
            arr[index].value =
              arr[index].value + this.createItem.feeList[i].feeAmt
          }
        }
      }
      return arr
    }
  },
  watch: {},
  components: {
    BaseDialog,
    Search
  },
  methods: {
    settleCorpChange(value, index) {
      var item = this.finSupplierList.find((el) => el.unitCode === value)
      if (item) {
        this.$set(
          this.createItem.feeList[index],
          'settleCorpName',
          item.unitName
        )
      } else {
        this.$set(this.createItem.feeList[index], 'settleCorpName', '')
      }
    },
    delFee(scope) {
      this.createItem.feeList.splice(scope.$index, 1)
    },
    // 财务供应商结算单位列表
    queryFinSupplierList(queryString, code) {
      let data = {
        name: queryString,
        serviceCode: '',
        feeCode: code,
        size: 50
      }
      queryFinSupplierList(data).then((res) => {
        this.finSupplierList = res.data
      })
    },
    checkNumFeeInput(value, type, index) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg = /^([1-9][0-9]*)$/
        if (!value) {
        } else if (!reg.test(value) || value > 999999) {
          let lastStr = value.substr(value.length - 1, 1)
          if (isNaN(value)) {
            this.$message({
              message: `${type}只能输入正整数`,
              type: 'error',
              duration: 2000
            })
          } else if (value > 999999) {
            this.$message({
              message: `${type}只能输入正整数`,
              type: 'error',
              duration: 2000
            })
          } else if (lastStr !== '.') {
            this.$message({
              message: `${type}只能输入正整数`,
              type: 'error',
              duration: 2000
            })
          }
        }
        let n1 = this.createItem.feeList[index].unitCount
        let n2 = this.createItem.feeList[index].unitPrice
        let total = ''
        let reg1 = /^([1-9][0-9]*)$/
        let reg2 =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
        if (n1 && n2) {
          if (reg1.test(n1) && n1 <= 999999 && reg2.test(n2) && n2 <= 999999) {
            total = Number(n1 * n2).fixed(3)
          }
        }
        this.$set(this.createItem.feeList[index], 'feeAmt', total)
        if (total > 999999999) {
          this.$message.error('Total 不能超过999999999')
        }
      }, 100)
    },
    checkNumInputMaxVal(value, type, index) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
        if (!value) {
        } else if (!reg.test(value) || value > 999999) {
          let lastStr = value.substr(value.length - 1, 1)
          if (isNaN(value)) {
            this.$message({
              message: `${type}请输入不超过999999的数字，小数点最多3位`,
              type: 'error',
              duration: 2000
            })
          } else if (value > 999999) {
            this.$message({
              message: `${type}请输入不超过999999的数字，小数点最多3位`,
              type: 'error',
              duration: 2000
            })
          } else if (lastStr !== '.') {
            this.$message({
              message: `${type}请输入不超过999999的数字，小数点最多3位`,
              type: 'error',
              duration: 2000
            })
          }
        }
        let n1 = this.createItem.feeList[index].unitCount
        let n2 = this.createItem.feeList[index].unitPrice
        let total = ''
        let reg1 = /^([1-9][0-9]*)$/
        let reg2 =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
        if (n1 && n2) {
          if (reg1.test(n1) && n1 <= 999999 && reg2.test(n2) && n2 <= 999999) {
            total = Number(n1 * n2).fixed(3)
          }
        }
        this.$set(this.createItem.feeList[index], 'feeAmt', total)
        if (total > 999999999) {
          this.$message.error('Total 不能超过999999999')
        }
      }, 100)
    },
    // 币别下拉列表自动补充的数据
    getCurrencyList() {
      baseCurrencyList('', 'valid', '').then((response) => {
        this.currencyOptions = response.data
      })
    },
    feeItemChange(value, index) {
      var item = this.feeItemList.find((el) => el.feeCode === value)
      if (item) {
        this.$set(this.createItem.feeList[index], 'feeName', item.feeEnName)
        this.$set(this.createItem.feeList[index], 'feeUnit', item.feeUnit)
      } else {
        this.$set(this.createItem.feeList[index], 'feeName', '')
      }
    },
    // 费用代码下拉列表自动补充的数据
    feeItemQuerySearch(queryString, name) {
      let val = queryString || name
      // if (!val) return
      baseFeeItemList(val).then((response) => {
        console.log(name)
        this.feeItemList = response.data
      })
    },
    addFee() {
      this.createItem.feeList.push({
        settleCorpName: '',
        settleCorpCode: '',
        serviceCode: '',
        feeCode: '',
        unitPrice: '',
        feeUnit: '',
        feeAmt: '',
        unitCount: '1',
        currency: 'USD',
        taxRate: '0',
        remark: '',
        receipayType: 'pay'
      })
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.form.validate((valid) => {
          if (valid && this.canSubmit) {
            this.canSubmit = false
            let params = {
              fees: this.createItem.feeList,
              orderNo: this.eQuery.orderNo
            }
            feeCreate(params)
              .then((res) => {
                this.close('Confirm', this.createItem)
                this.canSubmit = true
                this.$message.success('生成费用成功')
              })
              .catch(() => {
                this.canSubmit = true
              })
          } else {
            this.$msgErrClose('红框内为必填项，请补充！')
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    }
  }
}
</script>

<style lang="scss">
#overseasFreight-addFee {
  .el-form-item {
    margin-bottom: 4px;
  }
  .order-add-fee-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    .schemeNumber {
      margin-right: 12px;
    }
  }
}
</style>
