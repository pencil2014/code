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
          <div class="base-item flex-other">
            核算维度：{{
              filterData.dimensionTypeName
                ? `[${filterData.dimensionTypeName}]`
                : ''
            }}
            {{ filterData.dimensionName.join(',') }}
          </div>
          <div class="base-item flex-item">
            科目：{{ filterData.subjectCodesName.join(' , ') }}
          </div>
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
              v-if="checkAuth($route.name, 'tab-DimensionDetail')"
              class="finance-btn"
              size="mini"
              type="primary"
              @click="goDetail"
              >查看明细账</el-button
            >
            <el-button class="finance-btn" size="mini" @click="exportData"
              v-if="checkAuth($route.name, 'tab-Dimension', 'btn-export')"
              >导出</el-button
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
      title="核算维度余额表过滤条件"
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
                :placeholder="$t('Common.plSelect')"
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
                :placeholder="$t('Common.plEnter')"
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
                :placeholder="$t('Common.plSelect')"
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
            <!-- <el-form-item label="科目级别" prop="level">
              <el-select
                v-model="form.level"
                :placeholder="$t('Common.plSelect')"
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
            </el-form-item> -->
            <el-form-item label="科目编码" prop="subjectCodes">
              <!-- 远程搜索 -->
              <el-select
                size="mini"
                v-model="form.subjectCodes"
                filterable
                remote
                clearable
                multiple
                collapse-tags
                :remote-method="getSubjectList"
                @visible-change="getSubjectList('')"
                @change="changeSubject"
                style="width: 100%"
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
            <div class="divider"></div>
            <div class="title">核算维度选项</div>
            <el-form-item
              label="核算维度"
              prop="dimensionType"
              style="margin-bottom: 20px"
            >
              <el-select
                v-model="form.dimensionType"
                :placeholder="$t('Common.plSelect')"
                @change="changeDimensionType"
                clearable
              >
                <el-option
                  v-for="item in dimensionTypeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="核算维度编码" prop="dimensionFinCodes">
              <!-- 部门下拉 -->
              <el-cascader
                v-if="form.dimensionType === 'department'"
                ref="tree"
                clearable
                filterable
                size="mini"
                style="width: 100%"
                :options="departmentList"
                v-model="form.finCode"
                @change="changeDepart"
                :props="cascaderProps"
                placeholder="请选择部门"
                :show-all-levels="false"
                collapse-tags
              ></el-cascader>
              <!-- 其他下拉 -->
              <el-select
                v-else
                size="mini"
                v-model="form.dimensionFinCodes"
                filterable
                remote
                clearable
                multiple
                collapse-tags
                :remote-method="getListData"
                @visible-change="getListData('')"
                @change="changeListData"
                style="width: 100%"
              >
                <el-option
                  v-for="item in dimensionFinCodeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
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
            <el-checkbox v-model="form.isMultiSubjectMerge"
              >多科目合并显示</el-checkbox
            >
          </div>
          <div class="base-item">
            <el-checkbox v-model="form.isSubjectFullName"
              >显示科目全名</el-checkbox
            >
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="submitFilter"
          >{{$t('Common.sure')}}</el-button
        >
        <el-button size="mini" @click="closeFilterDialog">{{$t('Common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { querySettleUnit } from '@/api/fin/settleUnit'
import { baseCurrencyList } from '@/api/base'
import { employeeSelectlist, departmentTreeList } from '@/api/companyResource'
import {
  acBookList,
  subjectList,
  dimensionBalanceListPage,
  dimensionBalanceExport,
  kdList
} from '@/api/fin/acct'
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
        currency: '',
        date: [],
        dimensionName: [],
        dimensionFinCodes: [],
        finCode: [],
        dimensionType: '',
        subjectCodes: [],
        subjectCodesName: [],
        dimensionTypeName: '',
        currencyName: ''
      },
      showDialog: false,
      form: {
        acBookId: '',
        bookName: '',
        settleCompName: '',
        currency: '',
        currencyName: '',
        date: [],
        level: '',
        subjectCodes: [],
        subjectCodesName: [],
        dimensionType: '',
        dimensionTypeName: '',
        dimensionFinCodes: [],
        finCode: [],
        dimensionName: [],
        isSubjectFullName: false,
        isMultiSubjectMerge: false
      },
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
        dimensionType: {
          required: true,
          message: '核算维度不能为空',
          trigger: 'change'
        },
        date: {
          required: true,
          message: '会计年度期间不能为空',
          trigger: 'change'
        }
      },
      bookList: [],
      currencyList: [
        {
          label: '人民币',
          value: 'cny'
        },
        {
          label: '美元',
          value: 'usd'
        },
        {
          label: '综合本位币',
          value: 'basicCurrency'
        }
      ],
      levelList: [1, 2, 3],
      subjectList: [],
      dimensionTypeList: [
        {
          label: '供应商',
          value: 'supplier'
        },
        {
          label: '客户',
          value: 'customer'
        },
        {
          label: '员工',
          value: 'employee'
        },
        {
          label: '部门',
          value: 'department'
        },
        {
          label: '销账分类',
          value: 'writeoff_class'
        }
      ],
      disabledLevel: false,
      pickerOptions: {
        // disabledDate: value => {
        //   return value.getFullYear() < new Date().getFullYear()
        // }
      },
      multipleSelection: [],
      dimensionFinCodeList: [],
      departmentList: [],
      cascaderProps: {
        children: 'childList',
        label: 'deptCname',
        value: 'finCode',
        // expandTrigger: 'hover',
        checkStrictly: true
      },
      loading: false,
      sortParams: {},
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'dimension',
      pagination: Object.assign({}, this.option.pagination, {
        show: true,
        isNew: true,
        pageSize: 10
      }),
      operationBtns: false,
      selection: {
        show: true,
        fixed: true
      },
      tips: false,
      sortable: true,
			sortChange: this.sortChange,
      columns: [
        { prop: 'year', label: '会计年度', type: 'text' },
        { prop: 'mon', label: '期间', type: 'text' },
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
          width: 150
        },
        {
          prop: 'dimensionName',
          label: '核算维度名称',
          type: 'text',
          width: 150,
          sortable: false,
        }
      ],
      colgroups: [
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
    })
    this.getBookList()
    this.getDepartment()
  },
  activated() {
    let {currency, dimensionType} = this.form
    let refreshDimension = window.sessionStorage.getItem('refreshDimension')
    if (currency && dimensionType && refreshDimension) {
      this.getData()
      window.sessionStorage.removeItem('refreshDimension')
    }
  },
  methods: {
    // 获取数据
    getData() {
      this.eLoadingText = '加载中'
      this.loading = true
      let params = this.sortParams
			let prop = params && params.prop
      const {
        acBookId,
        date,
        currency,
        subjectCodes,
        dimensionType,
        dimensionFinCodes,
        isMultiSubjectMerge,
        isSubjectFullName
      } = this.form
      const data = {
        "ascField": params && params.order === 'ascending' ? prop : '',
				"descField": params && params.order === 'descending' ? prop : '',
        acBookId,
        currency,
        beginDate: date[0],
        endDate: date[1],
        subjectCodes: subjectCodes.join(','),
        dimensionType,
        dimensionFinCodes: dimensionFinCodes.join(','),
        isMultiSubjectMerge,
        isSubjectFullName,
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize
      }
      dimensionBalanceListPage(data)
        .then(res => {
          if (res.code === 0) {
            const datasource = res.data
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
          this.filterData = Object.assign({}, this.form)
          if (this.form.isSubjectFullName) {
            this.option1.columns[3].prop = 'fullName'
          } else {
            this.option1.columns[3].prop = 'subjectName'
          }
          if (this.form.isMultiSubjectMerge) {
            this.option1.columns =  [
              { prop: 'year', label: '会计年度', type: 'text' },
              { prop: 'mon', label: '期间', type: 'text' },
              {
                prop: 'dimensionFinCode',
                label: '核算维度编码',
                type: 'text',
                width: 150
              },
              {
                prop: 'dimensionName',
                label: '核算维度名称',
                type: 'text',
                width: 150
              }
            ]
          } else {
            this.option1.columns = [
              { prop: 'year', label: '会计年度', type: 'text' },
              { prop: 'mon', label: '期间', type: 'text' },
              { prop: 'subjectCode', label: '科目编码', type: 'text' },
              {
                prop: 'subjectName',
                label: '科目名称',
                type: 'text',
                width: 150,
                formatter: ({ cellValue, column, row, item }) => {
                  return this.formatData(row.subjectCode, cellValue)
                }
              },
              {
                prop: 'dimensionFinCode',
                label: '核算维度编码',
                type: 'text',
                width: 150
              },
              {
                prop: 'dimensionName',
                label: '核算维度名称',
                type: 'text',
                width: 150
              }
            ]
          }
          if (this.form.currency === 'allCurrency') {
            this.option1.columns.push({
              prop: 'currency',
              label: this.$t('FeeList.currency'),
              type: 'text',
              sortable: false,
            })
          }
          this.option1.pagination.currPage = 1
          this.getData()
          this.closeFilterDialog()
        }
      })
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
    changeSubject(arr) {
      const list = this.subjectList.filter(item =>
        arr.includes(item.subjectCode)
      )
      this.form.subjectCodesName = list.map(
        item => `${item.subjectCode}(${item.subjectName})`
      )
    },
    // 切换核算维度
    changeDimensionType(val) {
      this.form.dimensionFinCodes = []
      this.dimensionFinCodeList = []
      this.form.dimensionName = []
      if (val) {
        const item = this.dimensionTypeList.filter(ele => ele.value === val)[0]
        this.form.dimensionTypeName = item.label
      } else {
        this.form.dimensionTypeName = ''
      }
    },
    // 核算维度编码下拉
    getListData(str) {
      const dimensionType = this.form.dimensionType
      if (!dimensionType && str) {
        return this.$msgErrClose('请先选择核算维度')
      }
      if (!dimensionType) {
        return false
      }
      if (['supplier', 'customer'].includes(dimensionType)) {
        this.getSettleUnit(str)
      } else if (dimensionType === 'employee') {
        this.getEmployeeSelectlist(str)
      } else if (dimensionType === 'department') {
      } else {
        this.dimensionFinCodeList = [
          { label: '财务盈亏', value: '001' },
          { label: '退款手续费', value: '002'}
        ]
      }
    },
    // 客户供应商下拉
    getSettleUnit(str = '') {
      const dimensionType = this.form.dimensionType
      const data = {
        name: str
        // unitTypes: dimensionType
      }
      kdList(data)
        .then(res => {
          this.dimensionFinCodeList = res.data.map(item => {
            return {
              label: `${item.finCode}(${item.unitName})`,
              value: item.finCode
            }
          })
        })
        .catch(() => {})
    },
    // 员工下拉
    getEmployeeSelectlist(str = '') {
      const data = {
        state: 'valid',
        name: str
      }
      employeeSelectlist(data)
        .then(res => {
          this.dimensionFinCodeList = res.data.map(item => {
            return {
              label: `${item.employeeNo}(${item.cname})`,
              value: item.employeeNo
            }
          })
        })
        .catch(() => {})
    },
    // 选择部门
    changeDepart(val) {
      if (val) {
        const item = this.$refs.tree.getCheckedNodes()[0]
        this.form.dimensionFinCodes = val.slice(-1)
        this.form.dimensionName = [`${item.label}(${item.value})`]
      } else {
        this.form.dimensionFinCodes = []
        this.form.dimensionName = []
      }
    },
    // 选择其他维度编码
    changeListData(val) {
      this.form.dimensionName = []
      if (val) {
        const arr = this.dimensionFinCodeList.filter(ele =>
          val.includes(ele.value)
        )
        arr.forEach(item => {
          this.form.dimensionName.push(item.label)
        })
      }
    },
    // 查看明细账
    goDetail() {
      const len = this.multipleSelection.length
      if (!len) {
        return this.$msgErrClose('请选择需要查看明细的数据')
      }
      if (len > 1) {
        return this.$msgErrClose('一次只能选择一条数据查看明细')
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
      if (!dimensionFinCode) {
        return this.$msgErrClose('没有核算维度编码，无法查看明细')
      }
      let otherData = {}
      if (this.form.isMultiSubjectMerge) {
        otherData = {
          dimensionFinCodes: dimensionFinCode || '',
          dimensionName: dimensionName
            ? `${dimensionFinCode}(${dimensionName})`
            : '',
          currency,
          currencyName
        }
      } else {
        otherData = {
          subjectCodes: [subjectCode],
          subjectCodesName: subjectName
            ? [`${subjectCode}(${subjectName})`]
            : [subjectCode],
          dimensionFinCodes: dimensionFinCode || '',
          dimensionName: dimensionName
            ? `${dimensionFinCode}(${dimensionName})`
            : '',
          currency,
          currencyName
        }
      }
      data = Object.assign({}, data, otherData)
      window.sessionStorage.setItem(
        'dimensionDetailFilter',
        JSON.stringify(data)
      )
      this.$emit('changeTab', 'DimensionDetail')
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
    // 选择表格
    sendMulti(data) {
      this.multipleSelection = data
    },
    // 获取账簿列表
    getBookList(bookName) {
      const data = {
        currPage: 1,
        pageSize: 1000,
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
    // 导出
    exportData() {
      // this.$confirm('是否确认导出全部数据?', '确认', {
			// 	confirmButtonText: this.$t('Common.sure'),
			// 	cancelButtonText: this.$t('Common.cancel'),
			// 	type: 'warning'
			// }).then(() => {
      //   this.exportDataFn()
      // }).catch(()=>{})
      this.exportDataFn()
    },
    exportDataFn() {
      const {
        acBookId,
        date,
        currency,
        subjectCodes,
        dimensionType,
        dimensionFinCodes,
        isMultiSubjectMerge,
        isSubjectFullName,
        bookName:acBookQuery,
        currencyName:currencyQuery,
        dimensionTypeName,
        dimensionName,
        subjectCodesName
      } = this.form
      const data = {
        acBookId,
        currency,
        beginDate: date[0],
        endDate: date[1],
        subjectCodes: subjectCodes.join(','),
        dimensionType,
        dimensionFinCodes: dimensionFinCodes.join(','),
        isMultiSubjectMerge,
        isSubjectFullName,
        acBookQuery,
        currencyQuery,
        periodQuery: date.length ? date.join(' ~ ') : '',
        dimensionQuery: `${dimensionTypeName ? `[${dimensionTypeName}]` : ''}${dimensionName.join(',')}`,
        subjectQuery: subjectCodesName.join(' , '),
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize
      }
      this.$confirm('是否确认导出核算维度余额表?', "导出", {
        showCancelButton: true,
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				lockScroll: "true",
				type: "warning",
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = '执行中...';
            setTimeout(() => {
              this.option1.loading = true
              this.$store
                .dispatch('finance/downloadBlobFilePost', {
                  uri: '/fin/acBalance/dimensionBalance/export',
                  data: { data },
                })
                .then((res) => {
                  this.option1.loading = false
                  console.log(res);
                  let link = document.createElement('a')
                  link.href = window.URL.createObjectURL(res)
                  link.download = '核算维度余额表.xlsx'
                  link.click()
                  done();
                  instance.confirmButtonLoading = false;
                  this.loading = false
                }).catch(() => {
                  this.option1.loading = false
                  this.$message({ message: '导出失败', type: 'error' })
                  done();
                  instance.confirmButtonLoading = false;
                  this.loading = false
                })
            }, 10);
          } else {
            done();
            instance.confirmButtonLoading = false;
            this.loading = false
          }
        }
			}).then(() => {
				
			}).catch(() => {
			})
      // dimensionBalanceExport(data)
      //   .then(res => {
      //     if (res.code === 0) {
      //       window.open(res.data.filePath)
      //       this.$msgSucClose('导出成功！')
      //     }
      //   })
      //   .catch(() => {
      //     this.$msgErrClose('导出失败')
      //   })
      //   .finally(() => {
      //     this.loading = false
      //   })
    },
    // 获取部门下拉
    getDepartment() {
      departmentTreeList({ state: 'valid' }).then(res => {
        this.departmentList = this.getTreeData(res.data)
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      for (let i = 0; i < data.length; i++) {
        if (!data[i].childList.length) {
          // children若为空数组，则将children设为undefined
          data[i].childList = undefined
        } else {
          this.getTreeData(data[i].childList)
        }
      }
      return data
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
        flex-basis: 20%;
        margin-bottom: 10px;
        &.flex-other {
          flex: 1;
        }
        &.flex-item {
          flex-basis: 100%;
        }
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
      td:nth-child(4),
      td:nth-child(5) {
        text-align: left;
      }
    }
  }
}
</style>

<style lang="scss">
.el-radio__label,
.el-checkbox__label {
  font-size: 12px;
}
</style>
