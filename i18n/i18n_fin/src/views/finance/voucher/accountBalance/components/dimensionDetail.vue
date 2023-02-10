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
            }}{{ filterData.dimensionName }}
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
              v-if="checkAuth($route.name, 'tab-DimensionDetail', 'btn-export')"
              class="finance-btn"
              type="primary"
              size="mini"
              @click="exportData"
              >导出</el-button
            >
          </div>
          <div class="money-box-right"></div>
        </div>
        <div class="finance-list-container">
          <FinanceTableMass :option="option1" />
        </div>
      </div>
    </div>
    <el-dialog
      title="核算维度明细表过滤条件"
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
            <el-form-item label="" prop="">
              <el-radio-group v-model="form.dateType" @change="changDateType">
                <el-radio label="month">按期间查询</el-radio>
                <el-radio label="day">按日期查询</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="会计年度期间"
              prop="date"
              v-show="form.dateType === 'month'"
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
            <el-form-item
              label="起始日期"
              prop="time"
              v-show="form.dateType === 'day'"
            >
              <el-date-picker
                v-model="form.date"
                type="daterange"
                clearable
                size="mini"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                :start-placeholder="$t('Common.startDate')"
                :end-placeholder="$t('Common.endDate')"
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
                clearable
                filterable
                ref="tree"
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
              <!-- 其他下拉 multiple-->
              <el-select
                v-else
                size="mini"
                v-model="form.dimensionFinCodes"
                filterable
                remote
                clearable
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
          <!-- <div class="base-item">
            <el-checkbox v-model="form.isMultiSubjectMerge"
              >多科目合并显示</el-checkbox
            >
          </div> -->
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
    <!-- 预览凭证 -->
    <PreviewDialog :dialogOption="previewDialog" @generate="generate" />
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { employeeSelectlist, departmentTreeList } from '@/api/companyResource'
import { querySettleUnit } from '@/api/fin/settleUnit'
import { baseCurrencyList } from '@/api/base'
import {
  acBookList,
  subjectList,
  dimensionBalanceDetailListPage,
  dimensionBalanceDetailExport,
  kdList
} from '@/api/fin/acct'
export default {
  components: {
    FinanceTableMass,
    PreviewDialog
  },
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      option1: {},
      filterData: {
        bookName: '',
        currency: '',
        date: [],
        dimensionName: '',
        dimensionFinCodes: '',
        dimensionType: '',
        subjectCodes: [],
        subjectCodesName: [],
        dimensionTypeName: '',
        currencyName: '',
        finCode: []
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
        dimensionFinCodes: '',
        finCode: [],
        dimensionName: '',
        isSubjectFullName: false,
        isMultiSubjectMerge: false,
        dateType: 'month'
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
      loading: false,
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
      // 凭证
      previewDialog: {
        show: false,
        title: this.$t('Common.previewVoucher'),
        seqNo: '',
        showData: ''
      },
      sortParams: {}
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'dimensionDetail',
      pagination: Object.assign({}, this.option.pagination, {
        show: true,
        isNew: true,
        pageSize: 10
      }),
      operationBtns: false,
      selection: false,
      tips: false,
      sortable: true,
			sortChange: this.sortChange,
      columns: []
    })
    this.columns =  [
      { prop: 'finDate', label: '日期', type: 'text' },
      { prop: 'year', label: '会计年度', type: 'text' },
      { prop: 'month', label: '期间', type: 'text' },
      { prop: 'subjectCode', label: '科目编码', type: 'text', width: 100 },
      { prop: 'subjectName', label: '科目名称', type: 'text', width: 150, sortable: false },
      {
        prop: 'voucherClass',
        label: '凭证字',
        type: 'text',
        sortable: false,
        formatter: ({ cellValue }) => {
          const text = {
            pay: '付',
            receive: '收',
            shift: '转',
            mark: '记'
          }
          return text[cellValue]
        }
      },
      { prop: 'voucherNo', label: this.$t('Hedge.voucherNumber'), type: 'button',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.showPreviewDialog(row)
        }}
      },
      { prop: 'bizNo', label: this.$t('PreClose.bizNo'), type: 'button',  width: 140,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.goDetail(row)
        }}
      },
      { prop: 'summaryInfo', label: this.$t('Finance.abstract'), type: 'text', width: 400, sortable: false },
      { prop: 'debitAmt', label: '借方', type: 'text' },
      { prop: 'creditAmt', label: '贷方', type: 'text' },
      {
        prop: 'direction',
        label: '方向',
        type: 'select',
        propInDict: 'subjectBalanceType',
        sortable: false
      },
      { prop: 'remainBalance', label: '余额', type: 'text' }
    ]
    this.option1.columns = this.columns
    this.getBookList()
    this.getDepartment()
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
        dateType,
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
        dateType,
        beginDate: date[0],
        endDate: date[1],
        subjectCodes: subjectCodes.join(','),
        dimensionType,
        dimensionFinCodes,
        isMultiSubjectMerge,
        isSubjectFullName,
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize
      }
      dimensionBalanceDetailListPage(data)
        .then(res => {
          if (res.code === 0) {
            const datasource = res.data
            this.columns = datasource.configColumns.length > 0 ? datasource.configColumns : this.columns
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
        this.changDateType()
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
          window.sessionStorage.setItem(
            'dimensionDetailFilter',
            JSON.stringify(this.filterData)
          )
          if (this.form.isSubjectFullName) {
            this.option1.columns[4].prop = 'fullName'
          } else {
            this.option1.columns[4].prop = 'subjectName'
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
      this.form.dimensionFinCodes = ''
      this.form.dimensionName = ''
      this.dimensionFinCodeList = []
      if (val) {
        const item = this.dimensionTypeList.filter(ele => ele.value === val)[0]
        this.form.dimensionTypeName = item.label
      } else {
        this.form.dimensionTypeName = ''
      }
    },
    // 切换日期类型
    changDateType() {
      if (this.form.dateType === 'month') {
        let d = new Date()
        let year = d.getFullYear()
        let month = d.getMonth() + 1
        month =  month > 9 ? month : '0' + month
        this.form.date = [`${year}-${month}` , `${year}-${month}`]
      } else {
        let d = new Date()
        let year = d.getFullYear()
        let month = d.getMonth() + 1
        let day = d.getDate()
        month =  month > 9 ? month : '0' + month
        day = day > 9 ? day : '0' + day
        this.form.date = [`${year}-${month}-${day}` , `${year}-${month}-${day}`]
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
        this.form.dimensionFinCodes = item.value
        this.form.dimensionName = `${item.label}(${item.value})`
      } else {
        this.form.dimensionFinCodes = ''
        this.form.dimensionName = ''
      }
    },
    // 选择其他维度编码
    changeListData(val) {
      if (val) {
        const item = this.dimensionFinCodeList.filter(
          ele => ele.value === val
        )[0]
        this.form.dimensionName = item.label
      } else {
        this.form.dimensionName = ''
      }
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
      this.eLoadingText = '下载中'
      this.loading = true
      const {
        acBookId,
        dateType,
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
        dateType,
        beginDate: date[0],
        endDate: date[1],
        subjectCodes: subjectCodes.join(','),
        dimensionType,
        dimensionFinCodes,
        isMultiSubjectMerge,
        isSubjectFullName,
        acBookQuery,
        currencyQuery,
        periodQuery: date.length ? date.join(' ~ ') : '',
        dimensionQuery: `${dimensionTypeName ? `[${dimensionTypeName}]` : ''}${dimensionName}`,
        subjectQuery: subjectCodesName.join(' , '),
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize
      }
      this.$confirm('是否确认导出核算维度明细表?', "导出", {
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
                  uri: '/fin/acBalance/dimensionBalanceDetail/export',
                  data: { data },
                })
                .then((res) => {
                  this.option1.loading = false
                  console.log(res);
                  let link = document.createElement('a')
                  link.href = window.URL.createObjectURL(res)
                  link.download = '核算维度明细表.xlsx'
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
      // dimensionBalanceDetailExport(data)
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
    // 获取币种
    getCurrencyList(queryString) {
      baseCurrencyList(queryString, 'valid').then(response => {
        let data = response.data || []
        data.push({
          cnName: '综合本位币',
          code: 'basicCurrency'
        })
				this.currencyList = data
			})
    },
    // 预览凭证
    showPreviewDialog (row) {
      const seqNo = row.seqNo
      this.previewDialog.seqNo = seqNo
      this.previewDialog.show = true
    },
    // 删除凭证
    generate() {
      // 缓存标记刷新维度余额表
      window.sessionStorage.setItem('refreshDimension',true)
      // 刷新数据
      this.getData()
    },
    // 单号跳转详情
    goDetail(row) {
      let {bizType,bizNo} = row
      if (['order','finbill'].includes(bizType)) {
        this.showOneNoDetail( bizType, bizNo , { isTab: true } )
      } else {
        this.showOneNoDetail( 'writeoffNos', bizNo,  { isTab: true })
      }
    },
    sortChange (column, prop, order) {
			this.sortParams = { prop, order }
			this.isSort = true
			this.getData()
		},
  },
  activated() {
    const dimensionDetailFilter = window.sessionStorage.getItem(
      'dimensionDetailFilter'
    )
    if (dimensionDetailFilter) {
      const data = JSON.parse(dimensionDetailFilter)
      this.form = this.filterData = Object.assign({}, this.form, data)
      this.option1.pagination.currPage = 1
      this.getData()
    } else {
      this.showFilterDialog()
    }
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
</style>

<style lang="scss">
.el-radio__label,
.el-checkbox__label {
  font-size: 12px;
}
</style>
