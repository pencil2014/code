<template>
  <div class="edit-row box-row surcharge-table">
    <div class="row-tit">
      <span class="tit">附加费</span>
      <div class="row-tit-operate">
        <span class="row-tit-label row-tit-info">
          <SearchFilter :item="templateIdConfig" :tableQuery="createdItem" />
        </span>
        <el-button type="primary" size="mini" ref="add" @click="handleAddLine">新增</el-button>
      </div>
    </div>
    <div class="row-form">
      <el-form label-width="auto" :model="tableData" ref="surchargeTable" :show-message="false">
        <el-table :data="tableData.list" :max-height="240">
          <el-table-column align="center" label="费用英文" width="150">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.chargeEname'" :rules="tableData.rules.chargeEname">
                <el-select size="mini" v-model="scope.row.chargeEname" filterable remote reserve-keyword placeholder="费用英文" :remote-method="feeItemQuerySearch" @focus="feeItemQuerySearch('')" @change="((value) => feeItemChange(value, scope.row,'01'))">
                  <el-option v-for="item in feeItemList" :key="item.feeCode" :label="item.feeEnName" :value="item.feeEnName">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="费用中文" width="150">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.chargeName'" :rules="tableData.rules.chargeName">
                <el-select size="mini" v-model="scope.row.chargeName" filterable remote reserve-keyword placeholder="费用中文" :remote-method="feeItemQuerySearch" @focus="feeItemQuerySearch('')" @change="((value) => feeItemChange(value, scope.row,'02'))">
                  <el-option v-for="item in feeItemList" :key="item.feeCode" :label="item.feeName" :value="item.feeName">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="付款方式" width="150">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.payMode'" :rules="tableData.rules.payMode">
                <el-select size="mini" v-model="scope.row.payMode" placeholder="请选择">
                  <el-option v-for="(o, key) in dictMap['chargePayType']" :key="key" :label="o.label" :value="o.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="计费单位" width="100">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.rateUnit'" :rules="tableData.rules.rateUnit">
                <el-select size="mini" v-model="scope.row.rateUnit" placeholder="请选择">
                  <el-option v-for="(o, key) in dictMap.airChargeSurchargeUnit" :key="key" :label="o.label" :value="o.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="币别" width="100">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.currency'" :rules="tableData.rules.currency">
                <el-select size="mini" v-model="scope.row.currency" filterable remote reserve-keyword placeholder="币别">
                  <el-option v-for="item in currencyList" :key="item.code" :label="item.code" :value="item.code">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="金额" v-for="(item,index) in price" :key="index" width="150">
            <template slot-scope="scope">
              <el-form-item v-if="scope.row.rateUnit == 'kg'" :prop="'list.'+scope.$index+'.'+[item.value]" :rules="tableData.rules[item.value]">
                <el-input placeholder="请输入" size="mini" v-model="scope.row[item.value]" @input="checkNumInput(scope.row[item.value])">
                  <template v-if="scope.row.rateUnit == 'kg'" slot="prepend">{{item.label}}</template>
                </el-input>
              </el-form-item>
              <el-form-item v-if="item.label == '+45KG' && scope.row.rateUnit != 'kg'" :prop="'list.'+scope.$index+'.priceMin'" :rules="tableData.rules.priceMin">
                <el-input placeholder="请输入" size="mini" v-model="scope.row.priceMin" @input="checkNumInput(scope.row.priceMin)">
                </el-input>
              </el-form-item>
              <span v-if=" item.label != '+45KG'&&scope.row.rateUnit != 'kg'">
                <span>— —</span>
              </span>
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
    </div>
    <!-- <el-button @click="validateForm">校验</el-button> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SearchFilter from '@/components/Base/Search/filter'
import { userSurchargeList, surchargeInfo } from '@/api/charge'
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
  priceKg45: [
    { required: true, message: '请输入', trigger: 'change' },
    { validator: validateNumPointEmpty(), trigger: 'change' }
  ],
  priceKg100: [
    { required: true, message: '请输入', trigger: 'change' },
    { validator: validateNumPointEmpty(), trigger: 'change' }
  ],
  priceKg300: [
    { required: true, message: '请输入', trigger: 'change' },
    { validator: validateNumPointEmpty(), trigger: 'change' }
  ],
  priceKg500: [
    { required: true, message: '请输入', trigger: 'change' },
    { validator: validateNumPointEmpty(), trigger: 'change' }
  ],
  priceKg1000: [
    { required: true, message: '请输入', trigger: 'change' },
    { validator: validateNumPointEmpty(), trigger: 'change' }
  ],
  priceKg2000: [
    { required: true, message: '请输入', trigger: 'change' },
    { validator: validateNumPointEmpty(), trigger: 'change' }
  ]
}
export default {
  data() {
    return {
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
      price: [
        { label: '+45KG', value: 'priceKg45' },
        { label: '+100KG', value: 'priceKg100' },
        { label: '+300KG', value: 'priceKg300' },
        { label: '+500KG', value: 'priceKg500' },
        { label: '+1000KG', value: 'priceKg1000' },
        { label: '+2000KG', value: 'priceKg2000' }
      ],
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
    createdItem: {
      type: Object,
      default: () => {}
    },
    surchargeList: {
      type: Array,
      default: () => []
    }
  },
  created() {
    this.getUserSurchargeList()
    this.getCurrencyList()
  },
  mounted() {},
  computed: {
    ...mapGetters(['dictMap'])
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
    checkNumInput(value) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/
        if ((value && !reg.test(value)) || value > 999999) {
          let lastStr = value.substr(value.length - 1, 1)
          if (isNaN(value)) {
            this.$message({
              message: '金额请输入不超过999999的数字，小数点最多2位',
              type: 'error',
              duration: 2000
            })
          } else if (value > 999999) {
            this.$message({
              message: '金额请输入不超过999999的数字，小数点最多2位',
              type: 'error',
              duration: 2000
            })
          } else if (lastStr !== '.') {
            this.$message({
              message: '金额请输入不超过999999的数字，小数点最多2位',
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

    // 获取模板下拉
    getUserSurchargeList(val) {
      userSurchargeList().then((response) => {
        let tempData = this.getTreeData(response.data)
        this.templateIdConfig.data = tempData
      })
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
    feeItemChange(value, row, type) {
      var item = this.selectChagedFeeItem(value, type)
      console.log(item)
      if (item) {
        row.chargeCode = item.feeCode
        row.chargeEname = item.feeEnName
        row.chargeName = item.feeName
        row.currency = item.currency
        row.rateUnit = item.feeUnit.toLowerCase()
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
    // 转化children的空数组为undefined
    getTreeData(data) {
      for (let i = 0; i < data.length; i++) {
        if (!data[i].children.length) {
          // children若为空数组，则将children设为undefined
          data[i].children = undefined
        } else {
          this.getTreeData(data[i].children)
        }
      }
      return data
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
        chargeType: '',
        payMode: '',
        currency: 'CNY',
        rateUnit: '',
        priceKg45: '',
        priceKg100: '',
        priceKg300: '',
        priceKg500: '',
        priceKg1000: '',
        priceKg2000: '',
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
</style>
