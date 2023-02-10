<template>
  <div class="edit-row box-row surcharge-table">
    <div class="row-tit">
      <span class="tit">价格信息</span>
      <div class="row-tit-operate">
        <span class="row-tit-label row-tit-info">
        </span>
        <el-button type="primary" size="mini" ref="add" @click="handleAddLine">新增</el-button>
      </div>
    </div>
    <div class="row-form">
      <el-form label-width="auto" :model="tableData" ref="surchargeTable" :show-message="false">
        <el-table :data="tableData.list" :max-height="240">
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
          <el-table-column align="center" label="货物类型" width="150">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.priceCargoType'" :rules="tableData.rules.priceCargoType">
                <el-input placeholder="请输入" size="mini" v-model="scope.row.priceCargoType">
                </el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="最低收费">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.priceMin'" :rules="tableData.rules.priceMin">
                <el-input placeholder="请输入" size="mini" v-model="scope.row.priceMin" @input="checkNumInput(scope.row.priceMin)">
                </el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="+45KG">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.priceKg45'" :rules="tableData.rules.priceKg45">
                <el-input placeholder="请输入" size="mini" v-model="scope.row.priceKg45" @input="checkNumInput(scope.row.priceKg45)">
                </el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="+100KG">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.priceKg100'" :rules="tableData.rules.priceKg100">
                <el-input placeholder="请输入" size="mini" v-model="scope.row.priceKg100" @input="checkNumInput(scope.row.priceKg100)">
                </el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="+300KG">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.priceKg300'" :rules="tableData.rules.priceKg300">
                <el-input placeholder="请输入" size="mini" v-model="scope.row.priceKg300" @input="checkNumInput(scope.row.priceKg300)">
                </el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="+500KG">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.priceKg500'" :rules="tableData.rules.priceKg500">
                <el-input placeholder="请输入" size="mini" v-model="scope.row.priceKg500" @input="checkNumInput(scope.row.priceKg500)">
                </el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="+1000KG">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.priceKg1000'" :rules="tableData.rules.priceKg1000">
                <el-input placeholder="请输入" size="mini" v-model="scope.row.priceKg1000" @input="checkNumInput(scope.row.priceKg1000)">
                </el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="+2000KG">
            <template slot-scope="scope">
              <el-form-item :prop="'list.'+scope.$index+'.priceKg2000'" :rules="tableData.rules.priceKg2000">
                <el-input placeholder="请输入" size="mini" v-model="scope.row.priceKg2000" @input="checkNumInput(scope.row.priceKg2000)">
                </el-input>
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
import { baseCurrencyList, baseFeeItemList } from '@/api/base'
import { validateNumPointEmpty } from '@/utils/validate'
let timer = null
const rules = {
  currency: [{ required: true, message: '请输入', trigger: 'change' }],
  priceCargoType: [{ required: false, message: '请输入', trigger: 'change' }],
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
    // 增加一行
    handleAddLine() {
      // 添加一行为空的数据
      const rowData = {
        priceCargoType: '',
        currency: 'CNY',
        priceMin: '',
        priceKg45: '',
        priceKg100: '',
        priceKg300: '',
        priceKg500: '',
        priceKg1000: '',
        priceKg2000: '',
      }
      this.tableData.list.push(rowData)
    },

    // 删除一行
    handleDelete(scope) {
      this.tableData.list.splice(scope.$index, 1)
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
