<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback" id="overseasFreight-addOffer">
    <el-form ref="form" :rules="createItem.rules" label-width="0" :model="createItem" :show-message="false">
      <el-row>
        <el-col :span="8">
          <el-form-item label="附加费模板" prop="temp" label-width="80px">
            <el-select v-model="templateValue" size="mini" @change="changeTemp" clearable filterable remote placeholder="请选择" :remote-method="getTemList" @visible-change="getTemListChange" style="width: 100%">
              <el-option v-for="(item, index) in temData" :label="item.templateName" :value="item.templateId" :key="index">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-divider></el-divider>
      <div class="fee-btn-group">
        <el-button type="primary" size="mini" ref="add" @click="handleAddLine">新增</el-button>
      </div>
      <el-table :data="createItem.list" :max-height="240">
        <el-table-column align="center" label="费用英文" width="150">
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.chargeEname'" :rules="createItem.rules.chargeEname">
              <el-select size="mini" v-model="scope.row.chargeEname" filterable remote reserve-keyword placeholder="费用英文" :remote-method="feeItemQuerySearch" @focus="feeItemQuerySearch('')" @change="((value) => feeItemChange(value, scope.row,'01',scope.$index))">
                <el-option v-for="item in feeItemList" :key="item.feeCode" :label="item.feeEnName" :value="item.feeEnName">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column align="center" label="费用中文" width="150">
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.chargeName'" :rules="createItem.rules.chargeName">
              <el-select size="mini" v-model="scope.row.chargeName" filterable remote reserve-keyword placeholder="费用中文" :remote-method="feeItemQuerySearch" @focus="feeItemQuerySearch('')" @change="((value) => feeItemChange(value, scope.row,'02',scope.$index))">
                <el-option v-for="item in feeItemList" :key="item.feeCode" :label="item.feeName" :value="item.feeName">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column align="center" label="付款方式" width="150">
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.payMode'" :rules="createItem.rules.payMode">
              <el-select size="mini" v-model="scope.row.payMode" placeholder="请选择">
                <el-option v-for="(o, key) in dictMap['chargePayType']" :key="key" :label="o.label" :value="o.value">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column align="center" label="计费单位" width="100">
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.rateUnit'" :rules="createItem.rules.rateUnit">
              <el-select size="mini" v-model="scope.row.rateUnit" placeholder="请选择" @change="(val,index)=> cahngeRateUnit(val,scope.$index)">
                <el-option v-for="(o, key) in dictMap.airChargeSurchargeUnit" :key="key" :label="o.label" :value="o.value">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column align="center" label="币别" width="100">
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.currency'" :rules="createItem.rules.currency">
              <el-select size="mini" v-model="scope.row.currency" filterable remote reserve-keyword placeholder="币别">
                <el-option v-for="item in currencyList" :key="item.code" :label="item.code" :value="item.code">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column align="center" label="单价">
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.unitPrice'" :rules="createItem.rules.unitPrice">
              <el-input placeholder="请输入" size="mini" v-model="scope.row.unitPrice" @input="checkNumInput(scope.row.unitPrice)">
              </el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column align="center" label="最低收费">
          <template slot-scope="scope">
            <span v-if="scope.row.rateUnit != 'kg'">
              <span>— —</span>
            </span>
            <el-form-item v-else :prop="'list.'+scope.$index+'.priceMin'" :rules="createItem.rules.priceMin">
              <el-input placeholder="请输入" size="mini" v-model="scope.row.priceMin" @input="checkNumInput(scope.row.priceMin)">
              </el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column align="center" label="备注" width="200">
          <template slot-scope="scope">
            <el-form-item>
              <el-input size="mini" v-model="scope.row.remark" placeholder="请输入" maxlength="512"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" fixed="right">
          <template slot-scope="scope">
            <el-button @click="handleDelete(scope)" type="text" class="red" size="mini">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { mapState } from 'vuex'
import { validateNumPointEmpty } from '@/utils/validate'
import {
  userSurchargeList,
  surchargeInfo,
  airSurchargeTemplatePageList
} from '@/api/charge'
import { baseCurrencyList, baseFeeItemList } from '@/api/base'

import { unique } from '@/utils/index'
let timer = null
const rules = {
  templateName: [{ required: true, message: '请输入', trigger: 'change' }],
  chargeEname: [{ required: true, message: '请输入', trigger: 'change' }],
  chargeName: [{ required: true, message: '请输入', trigger: 'change' }],
  payMode: [{ required: true, message: '请输入', trigger: 'change' }],
  currency: [{ required: true, message: '请输入', trigger: 'change' }],
  rateUnit: [{ required: true, message: '请输入', trigger: 'change' }],
  priceMin: [
    { required: true, message: '请输入', trigger: 'change' },
    { validator: validateNumPointEmpty(), trigger: 'change' }
  ],
  unitPrice: [
    { required: true, message: '请输入', trigger: 'change' },
    { validator: validateNumPointEmpty(), trigger: 'change' }
  ]
}
export default {
  data() {
    return {
      templateValue: '',
      feeItemList: [],
      currencyList: [],
      price: [
        { label: '+45KG', value: 'priceKg45' },
        { label: '+100KG', value: 'priceKg100' },
        { label: '+300KG', value: 'priceKg300' },
        { label: '+500KG', value: 'priceKg500' },
        { label: '+1000KG', value: 'priceKg1000' },
        { label: '+2000KG', value: 'priceKg2000' }
      ],
      temData: [],
      carrierArr: [],
      bkgAgentSupplierOptions: [],
      dialogConfig: {
        title: '批量关联附加费',
        show: true,
        size: 'medium',
        width: '1250px'
      },
      createItem: {
        templateName: '',
        list: [],
        rules: rules,
        templateId: ''
      }
    }
  },
  props: {
    detailData: {
      type: [Object, null],
      default() {
        return null
      }
    }
  },
  created() {
    this.getCurrencyList()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap
    })
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    getTemListChange(val) {
      if (val) {
        this.getTemList()
      }
    },
    getTemList(val = '') {
      // 获取模板
      let params = {
        ascColumns: [],
        columns: [],
        currPage: 1,
        descColumns: [],
        pageSize: 30,
        query: []
      }
      if (val) {
        params.query.push({
          column: 'templateName',
          type: 'like',
          value: val
        })
      }
      airSurchargeTemplatePageList(params).then((res) => {
        this.temData = res.data.list
      })
    },
    cahngeRateUnit(val, index) {
      if (val !== 'kg') {
        this.$set(this.createItem.list[index], 'priceMin', '')
      }
    },
    // 币别下拉列表自动补充的数据
    getCurrencyList(queryString) {
      baseCurrencyList(queryString, 'valid', 'charge').then((response) => {
        this.currencyList = response.data
      })
    },
    // 费用代码下拉列表自动补充的数据
    feeItemQuerySearch(queryString) {
      if (queryString === undefined) return
      baseFeeItemList(queryString).then((response) => {
        this.feeItemList = response.data
      })
    },
    feeItemChange(value, row, type ,index) {
      var item = this.selectChagedFeeItem(value, type)
      console.log(item)
      if (item) {
        row.chargeCode = item.feeCode
        row.chargeEname = item.feeEnName
        row.chargeName = item.feeName
        row.currency = item.currency
        row.rateUnit = item.feeUnit.toLowerCase()
        if (row.rateUnit !== 'kg') {
          this.$set(this.createItem.list[index], 'priceMin', '')
        }
      }
    },
    selectChagedFeeItem(val, type) {
      var obj = {}
      obj = this.feeItemList.find(function (item) {
        if (type === '01') {
          return item.feeEnName === val
        } else {
          return item.feeName === val
        }
      })
      return obj
    },
    // 获取模板列表
    getList(val) {
      surchargeInfo({ templateId: val }).then((response) => {
        this.createItem.list = response.data.surchargeList
      })
    },

    // 增加一行
    handleAddLine() {
      // 添加一行为空的数据
      const rowData = {
        chargeCode: '',
        chargeEname: '',
        chargeName: '',
        chargeType: '',
        payMode: '',
        currency: 'CNY',
        rateUnit: '',
        unitPrice: '',
        priceMin: '',
        remark: ''
      }
      this.createItem.list.push(rowData)
    },

    // 删除一行
    handleDelete(scope) {
      this.createItem.list.splice(scope.$index, 1)
    },
    checkNumInput(value) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/
        if ((value && !reg.test(value)) || value > 999999) {
          let lastStr = value.substr(value.length - 1, 1)
          if (isNaN(value)) {
            this.$message({
              message: '单价和最低收费请输入不超过999999的数字，小数点最多2位',
              type: 'error',
              duration: 2000
            })
          } else if (value > 999999) {
            this.$message({
              message: '单价和最低收费请输入不超过999999的数字，小数点最多2位',
              type: 'error',
              duration: 2000
            })
          } else if (lastStr !== '.') {
            this.$message({
              message: '单价和最低收费请输入不超过999999的数字，小数点最多2位',
              type: 'error',
              duration: 2000
            })
          }
        }
      }, 800)
    },
    changeTemp(val) {
      let item = this.temData.find((el) => el.templateId == val)
      if (item) {
        this.createItem.list = item.surcharges
      }
    },
    getTotal(type, n1, n2, n3, n4, n5, n6) {
      let total = 0
      if (type === 'PER_CONTAINER') {
        if (n1 && !isNaN(n1) && n4 && !isNaN(n4)) {
          total += n1 * n4
        }
        if (n2 && !isNaN(n2) && n5 && !isNaN(n5)) {
          total += n2 * n5
        }
        if (n3 && !isNaN(n3) && n6 && !isNaN(n6)) {
          total += n3 * n6
        }
      } else {
        if (n1 && !isNaN(n1)) {
          total += n1 * 1
        }
        if (n2 && !isNaN(n2)) {
          total += n2 * 1
        }
        if (n3 && !isNaN(n3)) {
          total += n3 * 1
        }
      }
      return Number(total).fixed(2)
    },
    addFee() {
      this.createItem.feeList.push({
        quoteId: '',
        feeName: '',
        feeUnit: '',
        fee20GP: '',
        fee40GP: '',
        fee40HC: '',
        feeCurrency: 'USD',
        total: ''
      })
    },
    delFee(scope) {
      console.log(scope)
      this.createItem.feeList.splice(scope.$index, 1)
    },
    checkNumFeeInput(value, type, prop) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg = /^(0|[1-9][0-9]*)$/
        if (!value) {
        } else if (!reg.test(value) || value > 999999) {
          let lastStr = value.substr(value.length - 1, 1)
          if (isNaN(value)) {
            this.$message({
              message: `${type}只能输入正整数，或者0`,
              type: 'error',
              duration: 2000
            })
            this.$set(this.createItem, prop, null)
          } else if (value > 999999) {
            this.$message({
              message: `${type}只能输入正整数，或者0`,
              type: 'error',
              duration: 2000
            })
            this.$set(this.createItem, prop, 999999)
          } else if (lastStr !== '.') {
            this.$message({
              message: `${type}只能输入正整数，或者0`,
              type: 'error',
              duration: 2000
            })
          }
        }
      }, 800)
    },
    checkNumInputMaxVal(value, type, index, prop) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/
        if (!value) {
        } else if (!reg.test(value) || value > 999999) {
          let lastStr = value.substr(value.length - 1, 1)
          if (isNaN(value)) {
            this.$message({
              message: `${type}请输入不超过999999的数字，小数点最多2位`,
              type: 'error',
              duration: 2000
            })
            this.$set(this.createItem.feeList[index], prop, null)
          } else if (value > 999999) {
            this.$message({
              message: `${type}请输入不超过999999的数字，小数点最多2位`,
              type: 'error',
              duration: 2000
            })
            this.$set(this.createItem.feeList[index], prop, 999999)
          } else if (lastStr !== '.') {
            this.$message({
              message: `${type}请输入不超过999999的数字，小数点最多2位`,
              type: 'error',
              duration: 2000
            })
            this.$set(
              this.createItem.feeList[index],
              prop,
              Number(value).fixed(2)
            )
          }
        }
      }, 800)
    },
    carrierRemoteMethod(el, value) {
      // 远程搜索航空公司
      if (
        [
          'ship_export_fcl',
          'ship_export_lcl',
          'ship_import_fcl',
          'ship_import_lcl'
        ].includes(this.createItem.businessType)
      ) {
        this.$store
          .dispatch('dict/baseShippingCarrierList', {
            name: value && !el ? value : el,
            state: 'valid'
          })
          .then((data) => {
            this.carrierArr = data
          })
      } else if (
        ['air_export', 'air_import'].includes(this.createItem.businessType)
      ) {
        this.$store
          .dispatch('dict/aircarrierList', {
            carrierName: value && !el ? value : el
          })
          .then((data) => {
            let portList = data
              .map((ele) => {
                return Object.assign(ele, {
                  value: ele.itat,
                  label: ele.itat
                })
              })
              .filter((el) => el.itat)
            this.carrierArr = unique([...portList], 'value')
          })
      }
    },
    delRemark(index) {
      this.createItem.remarkInfo.splice(index, 1)
    },
    addRemark() {
      this.createItem.remarkInfo.push({
        remark: ''
      })
    },
    delExtraBedData(index) {
      this.createItem.extraBedData.splice(index, 1)
    },
    addExtraBedData() {
      this.createItem.extraBedData.push({
        hsCode: '',
        commodity: '',
        hscodeOptions: []
      })
    },
    close(action, value) {
      this.$emit('close', action, value)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.close('Confirm', this.createItem)
          } else {
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
#overseasFreight-addOffer {
  .el-form-item {
    margin-bottom: 4px;
  }
  .fee-btn-group {
    overflow: hidden;
    margin-bottom: 4px;
    display: flex;
    justify-content: flex-end;
  }
  .red {
    padding: 0 20px;
  }
  .el-divider--horizontal {
    margin: 10px 0;
  }
  .el-range-editor--mini .el-range-separator {
    line-height: 12px;
    font-size: 12px;
  }
  .el-form-item__label,
  .el-form-item__content {
    line-height: 20px;
  }
  .charges-item {
    display: flex;
    .currency {
      width: 100px !important;
      margin-left: 4px;
    }
  }
  .remarks-container {
    display: flex;
    .operation-btns {
      flex: 1;
      display: flex;
      padding: 0 10px;
      justify-content: flex-end;
      .add-remark {
        height: 24px;
        width: 24px;
        background: url('../../../../../assets/icon_add.png') center center
          no-repeat;
        background-size: cover;
        cursor: pointer;
        margin-left: 12px;
      }
      .del-remark {
        height: 24px;
        width: 24px;
        background: url('../../../../../assets/icon_del.png') center center
          no-repeat;
        background-size: cover;
        cursor: pointer;
      }
    }
  }
}
.line-heigth14 {
  line-height: 13px;
}
</style>
