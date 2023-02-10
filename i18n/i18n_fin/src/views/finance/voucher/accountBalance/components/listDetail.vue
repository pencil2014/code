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
          <!-- <div class="base-item flex-other">
            核算维度：{{
              filterData.dimensionTypeName
                ? `[${filterData.dimensionTypeName}]`
                : ''
            }}{{ filterData.dimensionName.join(',') }}
          </div> -->
          <div class="base-item">
            科目：{{ filterData.subjectCodes }} ({{filterData.subjectCodesName}})
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
            <!-- <el-button class="finance-btn" size="mini" @click="goBack"
              >{{$t('Common.back')}}</el-button
            > -->
          </div>
          <div class="money-box-right"></div>
        </div>
        <div class="finance-list-container">
          <FinanceTableMass :option="option1" />
        </div>
      </div>
    </div>
    <el-dialog
      title="科目余额明细表过滤条件"
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
            <!-- <div class="divider"></div>
            <div class="title">核算维度选项</div> -->
            <!-- <el-form-item
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
            </el-form-item> -->
            <!-- <el-form-item label="" prop="isDimension">
							<el-checkbox v-model="form.isDimension"
								>显示核算维度明细</el-checkbox
							>
						</el-form-item> -->
            <!-- <el-form-item label="核算维度编码" prop="dimensionFinCodes">
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
                change-on-select
                :show-all-levels="false"
                expandTrigger="click"
              ></el-cascader>
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
            </el-form-item> -->
          </el-form>
        </div>
        <!-- <div class="divider"></div>
        <div class="title">其他选项</div>
        <div class="other-filter">
          <div class="base-item">
            <el-checkbox
              v-model="form.isSubjectDetail"
              @change="changeSubjectDetail"
              >显示明细科目</el-checkbox
            >
          </div>
          <div class="base-item">
            <el-checkbox v-model="form.isDimension"
              >显示核算维度明细</el-checkbox
            >
          </div>
        </div> -->
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
import { querySettleUnit } from '@/api/fin/settleUnit'
import { employeeSelectlist, departmentTreeList } from '@/api/companyResource'
import { baseCurrencyList } from '@/api/base'
import {
  acBookList,
  subjectList,
  subjectBalanceDetailListPage
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
        dimensionName: [],
        dimensionFinCodes: [],
        finCode: [],
        dimensionType: '',
        subjectCodes: '',
        subjectCodesName: '',
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
        subjectCodes: '',
        subjectCodesName: '',
        dimensionType: '',
        dimensionTypeName: '',
        dimensionFinCodes: [],
        dimensionName: [],
        finCode: [],
        isSubjectDetail: false,
        isDimension: false,
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
        subjectCodes: {
          required: true,
          message: '科目编码不能为空',
          trigger: 'change'
        }
        // dimensionType: {
        //   required: true,
        //   message: '核算维度不能为空',
        //   trigger: 'change'
        // }
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
        value: 'finCode'
      },
      // 凭证
      previewDialog: {
        show: false,
        title: this.$t('Common.previewVoucher'),
        seqNo: '',
        showData: ''
      },
      sortParams: {},
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'accountBalanceListDetail',
      pagination: Object.assign({}, this.option.pagination, {
        show: true,
        isNew: true,
        pageSize: 10
      }),
      operationBtns: false,
      selection: false,
      tips: false,
      columns: [],
      sortable: true,
			sortChange: this.sortChange
    })
    this.columns = [
      { prop: 'finDate', label: '日期', type: 'text' },
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
      { prop: 'debitAmt', label: '借方金额', type: 'text' },
      { prop: 'creditAmt', label: '贷方金额', type: 'text' },

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
  activated() {
    const listDetailFilter = window.sessionStorage.getItem('listDetailFilter')
    if (listDetailFilter) {
      const data = JSON.parse(listDetailFilter)
      this.form = Object.assign({}, this.form, data)
      this.filterData = Object.assign({}, this.form, data)
      if (this.form.level === 3) {
        this.disabledLevel = true
      }
      this.option1.pagination.currPage = 1
      this.getData()
    } else {
      this.showFilterDialog()
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
        dateType,
        date,
        currency,
        subjectCodes,
        isDimension,
        dimensionType,
        dimensionFinCodes,
        isSubjectDetail
      } = this.form
      const data = {
				"ascField": params && params.order === 'ascending' ? prop : '',
				"descField": params && params.order === 'descending' ? prop : '',
        acBookId,
        dateType,
        beginDate: date[0],
        endDate: date[1],
        currency,
        subjectCodes,
        isDimension,
        dimensionType,
        dimensionFinCodes: dimensionFinCodes.join(','),
        isSubjectDetail,
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize
      }
      // 币种为所有币种表格增加币种字段
      if (this.form.currency === 'allCurrency') {
        let props = this.option1.columns.map(item => item.prop)
        if (!props.includes('currency')) {
          this.option1.columns.splice(-4,0,{
            prop: 'currency',
            label: this.$t('FeeList.currency'),
            type: 'text',
            sortable: false,
          }, {
            prop: 'rate',
            label: '汇率',
            type: 'text',
            sortable: false,
          }, {
            prop: 'srcAmt',
            label: '原币金额',
            type: 'text',
            sortable: false,
          })
        }
      } else {
        this.option1.columns = this.option1.columns.filter(item => !['currency','rate','srcAmt'].includes(item.prop))
      }
      subjectBalanceDetailListPage(data)
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
            'listDetailFilter',
            JSON.stringify(this.filterData)
          )
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
        this.form.settleCompName = ''
        this.form.bookName = ''
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
    changeSubject() {
      const list = this.subjectList.filter(item =>
        this.form.subjectCodes === item.subjectCode
      )
      this.form.subjectCodesName = list[0].subjectName
    },
    // 切换核算维度
    changeDimensionType(val) {
      this.form.dimensionFinCodes = []
      this.dimensionFinCodeList = []
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
      if (!dimensionType) {
        // this.form.dimensionType = 'supplier'
        // this.changeDimensionType('supplier')
        return
      }
      if (['supplier', 'customer'].includes(dimensionType)) {
        this.getSettleUnit(str)
      } else if (dimensionType === 'employee') {
        this.getEmployeeSelectlist(str)
      } else if (dimensionType === 'department') {
      } else {
        this.dimensionFinCodeList = [
          { label: '财务盈亏/退款手续费', value: '001' }
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
      querySettleUnit(data)
        .then(res => {
          this.dimensionFinCodeList = res.data.map(item => {
            return {
              label: `${item.unitCode}(${item.unitName})`,
              value: item.unitCode
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
    // 返回
    goBack() {
      this.$emit('changeTab', 'List')
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
            this.subjectList = res.data.list || []
            // if (!this.form.subjectCodes) {
            //   this.form.subjectCodes = this.subjectList[0]?.subjectCode
            //   this.changeSubject()
            // }
          }
        })
        .catch(() => {})
    },
    // 获取核算维度列表
    // getDimensionList () {
    // 	dimensionList({}).then(res => {
    // 		if (res.code === 0) {
    // 			this.dimensionTypeList = res.data
    // 		}
    // 	}).catch(() => { })
    // },
    // 勾选显示科目明细
    changeSubjectDetail(checked) {
      if (checked) {
        this.form.level = 3
        this.disabledLevel = true
      } else {
        this.disabledLevel = false
      }
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
        },{
          cnName: '所有币种',
          code: 'allCurrency'
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
      // 缓存标记刷新科目余额表
      window.sessionStorage.setItem('refreshList',true)
      // 刷新数据
      this.getData()
    },
    // 单号跳转详情
    goDetail (row) {
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
