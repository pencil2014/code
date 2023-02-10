<template>
  <div
    class="finance-list-container"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-cnt">
      <div class="search-box">
        <div class="search-item">
          <div class="base-item">账簿：{{ filterData.bookName }}</div>
          <div class="base-item">
            期间：{{ filterData.date ? filterData.date.join(' ~ ') : '' }}
          </div>
          <div class="base-item">币种：{{ filterData.currencyName }}</div>
        </div>
        <div class="search-btn">
          <el-button type="primary" size="mini" @click="showFilterDialog"
            >过滤</el-button
          >
        </div>
      </div>
      <div class="finance-search-list-gap"></div>
      <div class="account-table">
        <div class="money-box">
          <div class="money-box-left">
            <el-button
              v-if="checkAuth($route.name, 'tab-ListDetail')"
              class="finance-btn"
              size="mini"
              type="primary"
              @click="goDetail"
              >查看明细账</el-button
            >
          </div>
          <div class="money-box-right"></div>
        </div>
        <div class="finance-list-container">
          <FinanceTableMass :option="option1" @send-multi="sendMulti" />
        </div>
      </div>
    </div>
    <el-dialog
      title="科目余额表过滤条件"
      :visible.sync="showDialog"
      width="600px"
      class="self-dialog"
    >
      <div class="filter-box">
        <div class="title">基本选项</div>
        <div class="filter-form">
          <el-form
            :model="form"
            :rules="formRules"
            ref="form"
            label-width="100px"
          >
            <el-form-item
              label="账簿"
              prop="acBookId"
              style="margin-bottom: 20px"
            >
              <el-select
                clearable
                v-model="form.acBookId"
                placeholder="请选择"
                style="width: 100%"
                @change="changeBook"
              >
                <el-option
                  v-for="item in bookList"
                  :key="item.acBookId"
                  :label="item.bookName"
                  :value="item.acBookId"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="核算组织" prop="settleCompName">
              <el-input
                v-model="form.settleCompName"
                clearable
                placeholder="请输入"
                disabled
              >
              </el-input>
            </el-form-item>
            <el-form-item
              label="币种"
              prop="currency"
              style="margin-bottom: 20px"
            >
              <el-select
                v-model="form.currency"
                clearable
                placeholder="请选择"
                filterable
                remote
                :remote-method="getCurrencyList"
                @visible-change="getCurrencyList('')"
                @change="changeCurrency"
              >
                <el-option
                  v-for="item in currencyList"
                  :key="item.cnName"
                  :label="`${item.cnName} (${item.code})`"
                  :value="item.code"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="会计年度期间"
              prop="date"
              style="margin-bottom: 20px"
            >
              <el-date-picker
                v-model="form.date"
                type="monthrange"
                clearable
                size="mini"
                format="yyyy-MM"
                value-format="yyyy-MM"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                :picker-options="pickerOptions"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item label="科目级别" prop="level">
              <el-select
                v-model="form.level"
                placeholder="请选择"
                :disabled="disabledLevel"
              >
                <el-option
                  v-for="item in levelList"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="科目编码" prop="subjectCode">
              <!-- 远程搜索 -->
              <el-select
                size="mini"
                v-model="form.subjectCodeMin"
                filterable
                remote
                clearable
                :remote-method="getSubjectList"
                @change="changeSubject"
              >
                <el-option
                  v-for="item in subjectList"
                  :key="item.subjectCode"
                  :label="`${item.subjectCode}(${item.subjectName})`"
                  :value="item.subjectCode"
                >
                </el-option>
              </el-select>
              至
              <el-select
                size="mini"
                v-model="form.subjectCodeMax"
                filterable
                remote
                clearable
                :remote-method="getSubjectList"
                @visible-change="getSubjectList('')"
                @change="changeSubject2"
              >
                <el-option
                  v-for="item in subjectList"
                  :key="item.subjectCode"
                  :label="`${item.subjectCode}(${item.subjectName})`"
                  :value="item.subjectCode"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div class="divider"></div>
        <div class="title">其他选项</div>
        <div class="other-filter">
          <div class="base-item">
            <el-checkbox
              v-model="form.isSubjectDetail"
              @change="changeSubjectDetail"
              >只显示明细科目</el-checkbox
            >
          </div>
          <div class="base-item">
            <el-checkbox v-model="form.isSubjectFullName"
              >显示科目全名</el-checkbox
            >
          </div>
          <div class="base-item">
            <el-checkbox v-model="form.isTotal" :disabled="disabledIsTotal"
              >余额按借方、贷方分别小计</el-checkbox
            >
          </div>
          <div class="base-item">
            <el-checkbox v-model="form.isDimension"
              >显示核算维度明细</el-checkbox
            >
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="submitFilter"
          >确定</el-button
        >
        <el-button size="mini" @click="closeFilterDialog">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { acBookList, subjectList, subjectBalanceListPage } from '@/api/fin/acct'
import { baseCurrencyList } from '@/api/base'
export default {
  components: {
    FinanceTableMass
  },
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      option1: {},
      filterData: {
        bookName: '',
        currencyName: '',
        date: []
      },
      showDialog: false,
      form: {
        acBookId: '',
        bookName: '',
        settleCompName: '',
        currency: '',
        currencyName: '',
        date: [],
        level: 3,
        subjectCodeMinName: '',
        subjectCodeMaxName: '',
        subjectCodeMin: '',
        subjectCodeMax: '',
        isSubjectDetail: false,
        isSubjectFullName: false,
        isTotal: false,
        isDimension: false,
      },
      disabledIsTotal: false,
      formRules: {
        acBookId: {
          required: true,
          message: '账薄不能为空',
          trigger: 'change'
        },
        currency: {
          required: true,
          message: '币种不能为空',
          trigger: 'change'
        },
        date: {
          required: true,
          message: '会计年度期间不能为空',
          trigger: 'change'
        }
      },
      bookList: [],
      currencyList: [],
      levelList: [1, 2, 3],
      subjectList: [],
      disabledLevel: false,
      pickerOptions: {
        // disabledDate: value => {
        //   return value.getFullYear() < new Date().getFullYear()
        // }
      },
      multipleSelection: [],
      loading: false,
      sortParams: {},
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'accountBalanceList',
      pagination: Object.assign({}, this.option.pagination, {
        show: true,
        isNew: true,
        pageSize: 10
      }),
      operationBtns: false,
      tips: false,
      selection: {
        show: true,
        fixed: true
      },
      sortable: true,
			sortChange: this.sortChange,

    })
    this.columns = [
      {
        prop: 'subjectCode',
        label: '科目编码',
        type: 'text'
      },
      {
        prop: 'subjectName',
        label: '科目名称',
        type: 'text',
        width: 150,
        sortable: false,
        formatter: ({ cellValue, column, row, item }) => {
          return this.formatData(row.subjectCode, cellValue)
        }
      }
    ],
    this.colgroups = [
      {
        title: '期初余额',
        columns: [
          { prop: 'beginDebitAmt', label: '借方', type: 'text' },
          { prop: 'beginCreditAmt', label: '贷方', type: 'text' }
        ]
      },
      {
        title: '本期发生',
        columns: [
          { prop: 'monDebitChangeAmt', label: '借方', type: 'text' },
          { prop: 'monCreditChangeAmt', label: '贷方', type: 'text' }
        ]
      },
      {
        title: '本年累计',
        columns: [
          { prop: 'yearDebitChangeAmt', label: '借方', type: 'text' },
          { prop: 'yearCreditChangeAmt', label: '贷方', type: 'text' }
        ]
      },
      {
        title: '期末余额',
        columns: [
          { prop: 'endDebitAmt', label: '借方', type: 'text' },
          { prop: 'endCreditAmt', label: '贷方', type: 'text' }
        ]
      }
    ]
    this.option1.columns = this.columns
    this.option1.colgroups = this.colgroups
    this.getBookList()
  },
  activated() {
    let refreshList = window.sessionStorage.getItem('refreshList')
    if (this.form.currency && refreshList) {
      this.getData()
      window.sessionStorage.removeItem('refreshList')
    }
  },
  watch: {
    'form.currency' (val) {
      if (val === 'allCurrency') {
        this.disabledIsTotal = true
        this.form.isTotal = false
      } else {
        this.disabledIsTotal = false
      }
    }
  },
  methods: {
    // 获取数据
    getData() {
      this.loading = true
      let params = this.sortParams
			let prop = params && params.prop
      const {
        acBookId,
        currency,
        date,
        level,
        subjectCodeMin,
        subjectCodeMax,
        isSubjectDetail,
        isSubjectFullName,
        isTotal,
        isDimension
      } = this.form
      const data = {
        "ascField": params && params.order === 'ascending' ? prop : '',
				"descField": params && params.order === 'descending' ? prop : '',
        acBookId,
        currency,
        beginDate: date[0],
        endDate: date[1],
        level,
        subjectCodeMin,
        subjectCodeMax,
        isSubjectDetail,
        isSubjectFullName,
        isTotal,
        isDimension,
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize
      }
      subjectBalanceListPage(data)
        .then(res => {
          if (res.code === 0) {
            const datasource = res.data
            // this.option1.columns = this.columns
            // this.option1.colgroups = this.colgroups
            this.option1.data = datasource.list.map(item => {
              Object.keys(item).forEach(prop => item[prop] = item[prop] === 0 ? '' : item[prop])
              if (item.isTotal === 'yes') {
                Object.assign(item, { _isInvalid: true })
              }
              return item
            })
            Object.assign(this.option1.pagination, datasource)
            // // this.option1.pagination.currPage = datasource.currPage
            // // this.option1.pagination.pageSize = datasource.pageSize
            // this.option1.pagination.totalCount = datasource.totalCount
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    // 显示过滤弹窗
    showFilterDialog() {
      // 带默认时间
      if (!this.form.date.length) {
        let d = new Date()
        let year = d.getFullYear()
        let month = d.getMonth() + 1
        month =  month > 9 ? month : '0' + month
        this.form.date = [`${year}-${month}` , `${year}-${month}`]
      }
      this.showDialog = true
    },
    // 关闭过滤弹窗
    closeFilterDialog() {
      this.showDialog = false
    },
    // 提交过滤条件
    submitFilter() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitFilterFn()
        }
      })
    },
    submitFilterFn() {
      this.filterData = Object.assign({}, this.form)
      if (this.form.isDimension) {
        this.option1.columns = [
          { prop: 'subjectCode', label: '科目编码', type: 'text' },
          {
            prop: 'subjectName',
            label: '科目名称',
            type: 'text',
            width: 150,
            sortable: false,
            formatter: ({ cellValue, column, row, item }) => {
              return this.formatData(row.subjectCode, cellValue)
            }
          },
          {
            prop: 'dimensionFinCode',
            label: '核算维度编码',
            type: 'text',
            width: 150,
            sortable: false,
          },
          {
            prop: 'dimensionName',
            label: '核算维度名称',
            type: 'text',
            width: 150,
            sortable: false,
          }
        ]
      } else {
        this.option1.columns = [
          { prop: 'subjectCode', label: '科目编码', type: 'text' },
          {
            prop: 'subjectName',
            label: '科目名称',
            type: 'text',
            width: 150,
            sortable: false,
            formatter: ({ cellValue, column, row, item }) => {
              return this.formatData(row.subjectCode, cellValue)
            }
          }
        ]
      }
      // 币种为所有币种表格增加币种字段
      if (this.form.currency === 'allCurrency') {
        let props = this.option1.columns.map(item => item.prop)
        if (!props.includes('currency')) {
          this.option1.columns.push({
            prop: 'currency',
            label: '币种',
            type: 'text',
            sortable: false,
          })
        }
      }
      if (this.form.isSubjectFullName) {
        this.option1.columns[1].prop = 'fullName'
      } else {
        this.option1.columns[1].prop = 'subjectName'
      }
      this.option1.pagination.currPage = 1
      this.getData()
      this.closeFilterDialog()
    },
    // 切换账簿
    changeBook(acBookId) {
      if (acBookId) {
        const item = this.bookList.filter(item => item.acBookId === acBookId)[0]
        this.form.settleCompName = item.settleCompName
        this.form.bookName = item.bookName
      } else {
        this.form.settleCompName = this.form.bookName = ''
      }
    },
    // 切换币种
    changeCurrency(val) {
      if (val) {
        const item = this.currencyList.filter(item => item.code === val)[0]
        this.form.currencyName = item.cnName
      } else {
        this.form.currencyName = ''
      }
    },
    // 切换科目编码
    changeSubject(val) {
      if (val) {
        const item = this.subjectList.filter(
          item => item.subjectCode === val
        )[0]
        this.form.subjectCodeMinName = `${item.subjectCode}(${item.subjectName})`
        this.form.subjectCodeMax = val
        // if (!this.form.subjectCodeMax) {
        //   this.form.subjectCodeMax = val
        // }
      } else {
        this.form.subjectCodeMinName = ''
      }
    },
    changeSubject2(val) {
      if (val) {
        const item = this.subjectList.filter(
          item => item.subjectCode === val
        )[0]
        this.form.subjectCodeMaxName = `${item.subjectCode}(${item.subjectName})`
        if (!this.form.subjectCodeMin) {
          this.form.subjectCodeMin = val
        }
      } else {
        this.form.subjectCodeMaxName = ''
      }
    },
    // 选择表格
    sendMulti(data) {
      this.multipleSelection = data
    },
    // 查看明细账
    goDetail() {
      const len = this.multipleSelection.length
      if (!len) {
        return this.$msgErrClose('请选择需要查看明细的科目')
      }
      if (len > 1) {
        return this.$msgErrClose('一次只能选择一条数据查看明细账')
      }
      let data = this.form
      let {
        subjectCode,
        subjectName,
        dimensionFinCode,
        dimensionName,
        currency
      } = this.multipleSelection[0]
      currency = currency === '综合本位币' ? 'basicCurrency' : currency
      const currencyName = this.currencyList.filter(item => item.code === currency)[0].cnName
      if (!subjectCode) {
        return this.$msgErrClose('科目编码为空，不能查看明细账')
      }
      data = Object.assign({}, data, {
        subjectCodes: subjectCode,
        subjectCodesName: subjectName? subjectName : subjectCode,
        dimensionFinCodes: dimensionFinCode ? [dimensionFinCode] : [],
        dimensionName: dimensionName
          ? [`${dimensionFinCode}(${dimensionName})`]
          : [],
        dimensionType: '',
        dimensionTypeName: '',
        currency,
        currencyName
      })
      window.sessionStorage.setItem('listDetailFilter', JSON.stringify(data))
      this.$emit('changeTab', 'ListDetail')
    },
    // 分页方法
    handleSizeChange(val) {
      this.option1.pagination.currPage = 1
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val === -1 ? this.option1.pagination.totalPage : val
      this.getData()
    },
    // 获取账簿列表
    getBookList(bookName) {
      const data = {
        currPage: 1,
        pageSize: 100,
        query: [
          {
            column: 'bookName',
            type: 'like',
            value: bookName
          },
          {
            column: 'permission',
            type: 'eq',
            value: true
          }
        ]
      }
      acBookList(data)
        .then(res => {
          if (res.code === 0) {
            this.bookList = res.data.list
            if (!this.form.acBookId) {
              this.form.acBookId = this.bookList[0]?.acBookId || ''
              this.changeBook(this.form.acBookId)
            }
          }
        })
        .catch(() => {})
    },
    // 获取科目编码
    getSubjectList(subjectCode) {
      const data = {
        currPage: 1,
        pageSize: 1000,
        query: [
          {
            column: 'subjectCode',
            type: 'like',
            value: subjectCode
          }
        ]
      }
      subjectList(data)
        .then(res => {
          if (res.code === 0) {
            this.subjectList = res.data.list
          }
        })
        .catch(() => {})
    },
    // 勾选显示科目明细
    changeSubjectDetail(checked) {
      if (checked) {
        this.form.level = 3
        this.disabledLevel = true
      } else {
        this.disabledLevel = false
      }
    },
    // 格式化数据层级
    formatData(subjectCode, val) {
      if (!subjectCode || !val) return ''
      const len = String(subjectCode).split('.').length
      return '\xa0\xa0\xa0\xa0'.repeat(len - 1) + val
    },
    // 获取币种
    getCurrencyList(queryString) {
      baseCurrencyList(queryString, 'valid').then(response => {
        let data = response.data || []
        data.push({
          cnName: '综合本位币',
          code: 'basicCurrency'
        },{
          cnName: '所有币种',
          code: 'allCurrency'
        })
				this.currencyList = data
			})
    },
    sortChange (column, prop, order) {
			this.sortParams = { prop, order }
			this.isSort = true
			this.getData()
		},
  }
}
</script>


<style lang="scss" scoped>
.finance-cnt {
  .search-box {
    padding: 0 8px 8px;
    display: flex;
    .search-item {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      .base-item {
        flex-basis: 25%;
      }
    }
    .search-btn {
      width: 10%;
      text-align: center;
    }
  }
}
.app-wrapper {
  .finance-page {
    .el-date-editor {
      height: 20px;
      overflow: hidden;
    }
    .el-range-editor--mini {
      width: 200px;
    }
  }
}
.filter-box {
  .title {
    color: #222;
    line-height: 16px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }
  .filter-form {
    .el-form-item {
      margin-bottom: 10px;
    }
  }
}
.other-filter {
  display: flex;
  flex-wrap: wrap;
  .base-item {
    flex-basis: 50%;
    margin: 5px 0;
  }
}
.divider {
  margin: 15px 0 10px 0;
  border-bottom: 1px solid #e9e9e9;
}
.finance-table ::v-deep {
  .vxe-table--render-default {
    tr {
      td:nth-child(2),
      td:nth-child(3) {
        text-align: left;
      }
    }
  }
}
</style>
<style lang="scss">
.el-checkbox__label {
  font-size: 12px;
}
</style>
