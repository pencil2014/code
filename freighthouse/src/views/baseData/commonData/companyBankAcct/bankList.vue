<template>
  <div
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div style="height:8px;background:#F8F9FD;"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button class="finance-btn" size="mini" type="primary" @click="handleAdd">新增银行信息</el-button>
            <!-- icon="el-icon-circle-plus-outline" -->
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              size="mini"
              type="success"
              @click="updateEnable('enable')"
            >启用</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              size="mini"
              type="danger"
              @click="updateEnable('forbid')"
            >禁用</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="search('')">全部</el-button>
            <el-button class="finance-btn" size="mini" @click="search('receive')">收款</el-button>
            <el-button class="finance-btn" size="mini" @click="search('pay')">付款</el-button>
            <el-button class="finance-btn" size="mini" @click="search('receivepay')">收付款</el-button>
          </el-button-group>
        </div>
      </div>
      <div v-if="isFirst" v-loading="isFirst"></div>
      <FinanceTable v-else :option="option1" @send-multi="sendMulti" />
      <Account :option="accountOption" v-if="accountOption.show" @submit="submit" @cancel="cancel" />
      <div v-if="customColumnsPopShow">
        <CustomColumns
          ref="CustomColumns"
          :columnsBase="selfColumnsBase"
          :configColumns="configColumns"
          :props="{key:'prop',label:'label'}"
          @close="customColumnsPopClose"
        />
      </div>
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import BaseDialog from '@/views/baseData/commonData/taxRate/baseDialog'
import Account from './account'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin as voucherMixin } from '@/views/finance/voucher/mixin'
import baseData from '@/api/baseData'
import { departmentTreeList } from '@/api/companyResource'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { bankList } from '@/api/base'

// 银行列表
const { COMPANYBANKACCT, COMPANY } = baseData
// 统一设置规则提醒
const getCompnay = (queryString, cb) => {
  COMPANY.pageList({
    currPage: 1,
    pageSize: 200,
    query: [
      { column: 'companyName', type: 'eq', value: queryString },
      { column: 'state', type: 'eq', value: 'valid' },
      // { column: 'selfSettle', type: 'eq', value: 'yes' },
    ],
  }).then((res) => {
    if (typeof cb === 'object') {
      console.log('cb:', cb)
      let arr = res.data.list.map(({ companyName: label, companyCode: value }) => ({ value, label }))
      cb.remoteSelectList && cb.remoteSelectList.splice(0, 1000, ...arr)
      cb.selectOptions && cb.selectOptions.splice(0, 1000, ...arr)
      return
    }
    cb(res.data.list.map((item) => ({ ...item, value: item.companyName, label: item.companyCode })))
  })
}

const getBankList = (str = '', item) => {
  let data = {
    currPage: 1,
    pageSize: 100,
    query: [{ column: 'cname', type: 'like', value: str }],
  }
  bankList(data).then((res) => {
    item.remoteSelectList = res.data.list.map((item) => {
      return { ...item, value: item.bankCode, label: item.cname, en: item.ename }
    })
  })
}
export default {
  name: 'companyBankAcct',
  mixins: [mixin, voucherMixin, mixin2],
  data() {
    return {
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption: {},
      // 列表页--选中行
      multipleSelection: [],
      isFirst: true,
      loading: false,
      // 自定义表头弹框
      customColumnsPopShow: false,
      selfColumnsBase: [],
      // 升序
      ascColumns: [],
      // 降序
      descColumns: [],
      accountOption: {
        show: false,
        type: 'add',
        form: {},
        departmentList: [],
      },
    }
  },
  // table基础组件
  components: {
    FinanceTable,
    FinanceSearch,
    BaseDialog,
    CustomColumns,
    Account,
  },
  async created() {
    this.isFirst = false
    this.loanBasicData()
    let searchInputGroup = [
      'companyCode',
      'settleCompanyCode',
      'countryOrgType',
      'currency',
      'state',
      'accountNo',
      'publicType',
      'hasChequeAcct',
      'hasBillForbidden',
      'accountShortName',
    ]
    this.searchOption = {
      listHeightFunc: this.computeFinTableHeight,
      saveDefault: true,
      saveShow: true,
      addFilter: {
        defaultSearchLength: 10,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', showType: '1', range: { min: '', max: '' } })),
        filterGroups: {
          companyCode: {
            label: '所属分公司',
            type: 'remoteSelect',
            remoteMethod: getCompnay,
            visibleChange: getCompnay,
            remoteSelectList: [],
          },
          settleCompanyCode: {
            label: '结算分公司',
            type: 'remoteSelect',
            remoteMethod: getCompnay,
            visibleChange: getCompnay,
            remoteSelectList: [],
          },
          countryOrgType: { label: '账户区域', type: 'select', prop: 'countryOrgType' },
          accountShortName: { label: '账户简称', prop: 'accountShortName', type: 'input' },
          publicType: { label: '账户类型', prop: 'accountType', type: 'select' }, // 对公对私
          state: {
            label: '是否有效',
            type: 'select',
            selectOptions: [
              { label: '是', value: 'valid' },
              { label: '否', value: 'invalid' },
            ],
          },
          accountName: { label: '账户名称', prop: 'accountName', type: 'input' },
          bankCode: {
            label: '开户行',
            prop: 'bankCode',
            type: 'remoteSelect',
            remoteMethod: getBankList,
            visibleChange: getBankList,
            remoteSelectList: [],
          },
          bankBranch: { label: '支行名称', prop: 'bankBranch', type: 'input' },
          accountNo: { label: '银行账号', prop: 'accountNo', type: 'input' },
          currency: { label: '币种', type: 'select', prop: 'validCurrency' },
          bankAddr: { label: '银行地址', prop: 'bankAddr', type: 'input' },
          swiftCode: { label: 'SWIFT CODE', prop: 'swiftCode', type: 'input' },
          hasChequeAcct: { label: '是否支持支票', type: 'select', prop: 'yesNo' },
          isDefault: { label: '开票默认账户', type: 'select', prop: 'yesNo' },
          hasBillForbidden: { label: '是否账单禁用', type: 'select', prop: 'hasBillForbidden', propInDict: 'yesNo' },
          hasDefault: { label: '账单默认账户', type: 'select', prop: 'yesNo' },
          settleMode: { label: '账户结算方式', type: 'select', prop: 'bankAccountSettleMode' },
          createdBy: {
            label: '创建人',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          cDate: { label: '创建时间', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['createdTimeStart', 'createdTimeEnd'] },
          updatedBy: {
            label: '修改人',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          uTime: { label: '修改时间', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['updatedTimeStart', 'updatedTimeEnd'] },
          bankCodeReal: { label: 'Bank Code', prop: 'bankCodeReal', type: 'input' },
          bankBranchCode: { label: 'Branch Code', prop: 'bankBranchCode', type: 'input' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    this.option1 = {
      ...this.option,
      id: 'option1',
      pagination,
      customColumns: {
        show: true,
        handleCustomColumns: () => (this.customColumnsPopShow = true),
      },
      sortable: true,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
    }
    this.option1.operationBtns.data = [
      {
        label: '修改',
        type: 'text',
        show: true,
        action: 'Edit',
      },
    ]

    this.selfColumnsBase.splice(
      0,
      1000,
      ...[
        { label: '所属分公司', prop: 'companyName', width: 160 },
        { label: '结算分公司', prop: 'settleCompanyName', width: 160 },
        { label: '账户区域', prop: 'countryOrgType', type: 'select' },
        { label: '账户简称', prop: 'accountShortName', width: 160 },
        { label: '账户类型', prop: 'publicType', type: 'select', propInDict: 'accountType' }, // 对公对私
        {
          label: '是否有效',
          prop: 'state',
          formatter: ({ row }) => (row.state === 'valid' ? '是' : '否'),
        },
        { label: '账户名称', prop: 'accountName', width: 160 },
        { label: '账户名称(Account Name)', prop: 'accountEname', width: 160 },
        { label: '开户行', prop: 'bankName', width: 160 },
        {
          label: '开户行(Bank Name)',
          prop: 'bankEname',
          width: 210,
          formatter: ({ row }) => {
            return `${row.bankEname}${row.bankCodeReal ? '(' + row.bankCodeReal + ')' : ''}`
          },
        },
        { label: '支行名称', prop: 'bankBranch', width: 130 },
        {
          label: '支行名称(Branch)',
          prop: 'bankBranchEname',
          width: 210,
          formatter: ({ row }) => {
            return `${row.bankBranchEname}${row.bankBranchCode ? '(' + row.bankBranchCode + ')' : ''}`
          },
        },
        { label: '银行账号', prop: 'accountNo', width: 160 },
        { label: '币种', prop: 'currency', propInDict: 'validCurrency' },
        { label: '银行地址', prop: 'bankAddr', width: 160 },
        { label: '银行地址(Bank Address)', prop: 'bankEaddr', width: 160 },
        { label: 'SWIFT CODE', prop: 'swiftCode' },
        { label: '科目代码', prop: 'subjectCode', type: 'text' },
        { label: '是否支持开票', type: 'select', prop: 'hasChequeAcct', propInDict: 'yesNo', width: 100 },
        { label: '开票默认账户', prop: 'isDefault', width: 100, type: 'select', propInDict: 'yesNo' },
        { label: '收付类型', prop: 'receipayType', type: 'select', propInDict: 'feeitemReceipayGroup' },
        { label: '是否账单禁用', type: 'select', prop: 'hasBillForbidden', propInDict: 'yesNo', width: 100 },
        { label: '账单默认账户', prop: 'hasDefault', width: 100, type: 'select', propInDict: 'yesNo' },
        {
          label: '账户结算方式',
          type: 'select',
          prop: 'settleMode',
          propInDict: 'bankAccountSettleMode',
          width: 100,
          multi: true,
        },
        { label: '创建人', prop: 'createdName' },
        { label: '创建时间', prop: 'createdTime', width: 160 },
        { label: '修改人', prop: 'updatedName' },
        { label: '修改时间', prop: 'updatedTime', width: 160 },
        // { label: '开票账户', prop: 'isInvoiceBankAcct', type: 'select', propInDict: 'yesNo' },
        // { label: 'Bank Code', prop: 'bankCodeReal', width: 100 },
        // { label: 'Branch Code', prop: 'bankBranchCode', width: 100 },
      ]
    )
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))

    this.option1.columns = [...this.selfColumnsBase]
    // console.log(this.option1)
    this.getData()
  },
  methods: {
    cancel() {
      this.accountOption.show = false
    },
    submit(row) {
      let isAdd = this.accountOption.type === 'add'
      let method = isAdd ? COMPANYBANKACCT.save : COMPANYBANKACCT.update
      let data = Object.assign({}, row)
      data.settleMode = data.settleMode.join(',')
      if (!data.isDefault) {
        data.isDefault = 'no'
      }
      if (!data.hasDefault) {
        data.hasDefault = 'no'
      }
      console.log(data)
      let list = data.companyBankRelationCodes
      if (list && list.length) {
        data.companyBankRelationCodes = list.map((item) => item[item.length - 1])
      }
      method(data)
        .then((res) => {
          if (res.code === 0) {
            this.cancel()
            let text = isAdd ? '添加成功！' : '修改成功！'
            this.$msgSucClose(text)
            this.getData()
          }
        })
        .catch(() => {})
    },
    // 启用、禁用
    updateEnable(type) {
      if (!this.multipleSelection.length) {
        return this.$message({
          message: '请勾选需要操作的项！',
          type: 'error',
          showClose: true,
        })
      }
      let isEnable = type === 'enable'
      this.$confirm(`您是否确认${isEnable ? '启用' : '禁用'}该银行信息？`, '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then((res) => {
          if (res) {
            let { companyBankAcctId, accountNo, revision } = this.multipleSelection[0]
            let state = isEnable ? 'valid' : 'invalid'
            COMPANYBANKACCT.enabled({ companyBankAcctId, accountNo, revision, state }).then((res) => {
              this.$msgSucClose(`${isEnable ? '启用' : '禁用'}成功`)
              this.getData()
            })
          }
        })
        .catch(console.log)
    },
    search(result) {
      this.searchResult = typeof result === 'string' ? result : this.searchResult
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    getData() {
      let data = {
        columns: this.customColumnsKeys || [],
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
      }
      this.finCommonSearch(data.query, this.searchOption, true)
      if (this.searchResult) {
        data.query.push({
          column: 'receipayType',
          type: 'eq',
          value: this.searchResult || '',
        })
      }
      // console.log('data:', data)

      this.lsLoading = true
      COMPANYBANKACCT.pageList(data)
        // pageList(data)
        .then((res) => {
          if (res.data.configColumns && res.data.configColumns.length) {
            let columns = res.data.configColumns
            this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
            this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
            this.configColumns = res.data.configColumns
          }
          let { list } = res.data
          this.option1.data = list
          this.option1.pagination.currPage = res.data.currPage
          this.option1.pagination.pageSize = res.data.pageSize
          this.option1.pagination.totalCount = res.data.totalCount
        })
        .catch(console.log)
        .finally(() => (this.lsLoading = false))
    },
    //修改
    handleEdit({ companyBankAcctId, accountNo, companyCode }) {
      COMPANYBANKACCT.info({ companyBankAcctId, accountNo, companyCode }).then((res) => {
        Object.assign(this.accountOption.form, res.data)
        let val = res.data.bankCode
        this.$set(this.accountOption.form, 'subjectCode_prepend', val === 'KHHNBWL' ? '1143' : '1111')
        this.accountOption.form.settleMode = res.data.settleMode.split(',')
        let list = this.accountOption.form.companyBankRelationCodes
        if (list && list.length) {
          this.accountOption.form.companyBankRelationCodes = list.map((item) => {
            let len = item.length / 3
            let arr = []
            for (let index = 1; index <= len; index++) {
              arr.push(item.slice(0, index * 3))
            }
            return arr
          })
        }
        this.accountOption.type = 'edit'
        this.accountOption.show = true
      })
    },
    // 新增
    handleAdd() {
      this.accountOption.type = 'add'
      this.$set(this.accountOption.form, 'subjectCode_prepend', '')
      this.accountOption.show = true
    },
    // 部门下拉框
    loanBasicData() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        this.accountOption.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
        console.log(this.accountOption.departmentList)
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach((item) => {
        if (item.childList && item.childList.length) {
          item.childList = item.childList.filter((v) => v.deptSubType !== 'group') || []
        }
        item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined
      })
      return data
    },
  },
}
</script>
<style  lang="scss" scoped>
.base-data {
  .update-primary-button {
    background-color: #e9851f !important;
    border: 1px solid #e9851f;
  }
}
</style>