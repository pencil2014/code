<template>
  <div class="edit-row box-row surcharge-table">
    <div class="row-tit">
      <span class="tit">附加费</span>
      <div class="row-tit-operate">
        <span class="row-tit-label row-tit-info">
          <div class="template-search">
            <span class="template-search-title">附加费模板：</span>
            <el-select v-model="templateValue" size="mini" :disabled="disabledState" @change="changeTemp" clearable filterable remote placeholder="请选择" :remote-method="getTemList" @visible-change="getTemListChange" style="width: 100%">
              <el-option v-for="(item, index) in temData" :label="item.templateName" :value="item.templateId" :key="index">
              </el-option>
            </el-select>
          </div>
        </span>
        <el-button type="primary" size="mini" v-if="!disabledState" ref="add" @click="handleAddLine">新增</el-button>
      </div>
    </div>
    <div class="row-form">
      <el-form label-width="auto" :model="tableData" ref="surchargeTable" :show-message="false">
        <el-table :data="tableData.list" :max-height="240">
          <el-table-column align="center" label="费用英文">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.chargeEname'" :rules="tableData.rules.chargeEname">
                <el-select size="mini" v-model="scope.row.chargeEname" :disabled="disabledState" filterable remote reserve-keyword placeholder="费用英文" :remote-method="feeItemQuerySearch" @focus="feeItemQuerySearch('')" @change="((value) => feeItemChange(value, scope.row,'01',scope.$index))">
                  <el-option v-for="item in feeItemList" :key="item.feeCode" :label="item.feeEnName" :value="item.feeEnName">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="费用中文">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.chargeName'" :rules="tableData.rules.chargeName">
                <el-select size="mini" v-model="scope.row.chargeName" :disabled="disabledState" filterable remote reserve-keyword placeholder="费用中文" :remote-method="feeItemQuerySearch" @focus="feeItemQuerySearch('')" @change="((value) => feeItemChange(value, scope.row,'02',scope.$index))">
                  <el-option v-for="item in feeItemList" :key="item.feeCode" :label="item.feeName" :value="item.feeName">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="付款方式">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.payMode'" :rules="tableData.rules.payMode">
                <el-select size="mini" v-model="scope.row.payMode" :disabled="disabledState" placeholder="请选择">
                  <el-option v-for="(o, key) in dictMap['chargePayType']" :key="key" :label="o.label" :value="o.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="计费单位">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.rateUnit'" :rules="tableData.rules.rateUnit">
                <el-select size="mini" v-model="scope.row.rateUnit" :disabled="disabledState" placeholder="请选择" @change="(val,index)=> cahngeRateUnit(val,scope.$index)">
                  <el-option v-for="(o, key) in dictMap.airChargeSurchargeUnit" :key="key" :label="o.label" :value="o.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="币别">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.currency'" :rules="tableData.rules.currency">
                <el-select size="mini" v-model="scope.row.currency" :disabled="disabledState" filterable remote reserve-keyword placeholder="币别">
                  <el-option v-for="item in currencyList" :key="item.code" :label="item.code" :value="item.code">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="单价">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.unitPrice'" :rules="tableData.rules.unitPrice">
                <el-input placeholder="请输入" :disabled="disabledState" size="mini" v-model="scope.row.unitPrice" @input="checkNumInput(scope.row.unitPrice)">
                </el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="最低收费">
            <template slot-scope="scope">
              <span v-if="scope.row.rateUnit != 'kg'">
                <span>— —</span>
              </span>
              <el-form-item v-else :prop="'list.'+scope.$index+'.priceMin'" :rules="tableData.rules.priceMin">
                <el-input placeholder="请输入" :disabled="disabledState" size="mini" v-model="scope.row.priceMin" @input="checkNumInput(scope.row.priceMin)">
                </el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="备注" width="200">
            <template slot-scope="scope">
              <el-form-item>
                <el-input size="mini" :disabled="disabledState" v-model="scope.row.remark" placeholder="请输入" maxlength="512"></el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" fixed="right">
            <template slot-scope="scope">
              <el-button @click="handleDelete(scope)" type="text" class="red" size="mini" :disabled="disabledState">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
    </div>
    <!-- <el-button @click="validateForm">校验</el-button> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SearchFilter from '@/components/Base/Search/filter'
import {
  userSurchargeList,
  surchargeInfo,
  airSurchargeTemplatePageList
} from '@/api/charge'
import { baseCurrencyList, baseFeeItemList } from '@/api/base'
import { validateNumPointEmpty } from '@/utils/validate'
let timer = null
const rules = {
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
      temData: [],
      templateValue: '',
      templateIdConfig: {
        type: 'cascader',
        key: 'templateId',
        label: '附加费模板',
        filterable: true,
        style: {
          width: '240px'
        },
        inputBox: {
          'justify-content': 'normal'
        },
        data: [],
        itemDataProps: {
          expandTrigger: 'hover',
          value: 'templateId',
          label: 'templateName'
        },
        change: (value) => {
          let len = value.length
          this.getList(value[len - 1])
        },
        value: []
      },
      feeItemList: [],
      currencyList: [],
      tableData: {
        list: JSON.parse(JSON.stringify(this.surchargeList)),
        rules: rules
      }
    }
  },
  props: {
    param: {
      type: Object
    },
    createItem: {
      type: Object,
      default: () => {}
    },
    surchargeList: {
      type: Array,
      default: () => []
    }
  },
  created() {
    this.templateValue=''
    this.getCurrencyList()
  },
  activated(){
    this.templateValue=''
  },
  mounted() {},
  computed: {
    ...mapGetters(['dictMap']),
    disabledState() {
      if (!this.createItem.status || this.createItem.status === 'no_publish') {
        return false
      }
      return true
    }
  },
  watch: {
    surchargeList: {
      handler(newVal) {
        if (newVal) {
          this.tableData.list = newVal
        }
      },
      deep: true
    }
  },
  components: {
    SearchFilter
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
    changeTemp(val) {
      let item = this.temData.find((el) => el.templateId == val)
      if (item) {
        this.tableData.list = item.surcharges
      }
    },
    cahngeRateUnit(val, index) {
      if (val !== 'kg') {
        this.$set(this.tableData.list[index], 'priceMin', '')
      }
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
    validateForm() {
      // 表单验证
      return new Promise((resolve, reject) => {
        this.$refs.surchargeTable.validate((valid) => {
          if (valid) {
            resolve()
          } else {
            reject()
          }
        })
      })
    },
    close(action, value) {
      this.$emit('close', action, value)
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
    feeItemChange(value, row, type, index) {
      var item = this.selectChagedFeeItem(value, type)
      console.log(item)
      if (item) {
        row.chargeCode = item.feeCode
        row.chargeEname = item.feeEnName
        row.chargeName = item.feeName
        row.currency = item.currency
        row.rateUnit = item.feeUnit.toLowerCase()

        if (row.rateUnit !== 'kg') {
          this.$set(this.tableData.list[index], 'priceMin', '')
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
        this.tableData.list = response.data.surchargeList
      })
    },

    // 增加一行
    handleAddLine() {
      // 添加一行为空的数据
      const rowData = {
        chargeCode: '',
        chargeEname: '',
        chargeName: '',
        payMode: '',
        currency: 'CNY',
        rateUnit: '',
        unitPrice: '',
        priceMin: '',
        remark: ''
      }
      this.tableData.list.push(rowData)
    },

    // 删除一行
    handleDelete(scope) {
      this.tableData.list.splice(scope.$index, 1)
    },

    // 确定提交
    handleSurchargeSubmit(done) {
      if (!this.validate()) return
      done()
      this.close('Confirm', this.tableData.list)
    }
  }
}
</script>

<style lang="scss">
.mt20 {
  margin-top: 20px;
}
.dialog-add {
  margin-top: 16px;
  .el-button {
    border: 1px dashed #dcdfe6;
  }
}

.surcharge-table {
  .el-input__prefix {
    line-height: 28px;
    color: #000000;
  }
  .el-input--prefix .el-input__inner {
    padding-left: 45px;
  }
}
.template-search {
  display: flex;
  align-items: center;
  margin-right: 20px;
  .template-search-title {
    line-height: 20px;
    width: 100px;
    color: #000000;
  }
}
</style>
