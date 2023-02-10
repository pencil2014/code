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
            <el-button class="finance-btn" size="mini" type="primary" @click="handleAdd">新增</el-button>
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
        <div class="money-box-right"></div>
      </div>
      <FinanceTable :option="option1" @send-multi="sendMulti" />
    </div>
    <BaseDialog ref="baseDialog" :option="accountOption" @close="dialogClose" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { bankPageList as bankList, bankDetail, bankSave, bankActived } from '@/api/base'
import BaseDialog from '@/views/baseData/commonData/taxRate/baseDialog'
const ruleMsg = { required: true, message: ' ', triggers: 'blur,change' }

export default {
  name: 'companyBankAcctName',
  mixins: [mixin, mixin2],
  data() {
    return {
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption: {},
      // 列表页--选中行
      multipleSelection: [],
      accountOption: {
        show: false,
        title: '新增税率配置',
        padding: '10px 0 10px 0',
        inputFull: true,
        formItems: [
          { label: '开户行', type: 'input', prop: 'cname', rules: [{ ...ruleMsg }], maxlength: 128 },
          { label: 'Bank Name', type: 'input', prop: 'ename', maxlength: 256 },
          { label: '默认所属区域', type: 'select', prop: 'countryOrgType', rules: [{ ...ruleMsg }] },
          { label: '是否有效', type: 'select', prop: 'enable', rules: [{ ...ruleMsg }], propInDict: 'yesNo' },
        ],
        form: { cname: '', enable: '', countryOrgType: '', ename: '' },
        labelWidth: '100px',
      },
    }
  },
  // table基础组件
  components: {
    FinanceTable,
    FinanceSearch,
    BaseDialog,
  },
  created() {
    let searchInputGroup = ['cname', 'countryOrgType', 'enable']
    this.searchOption = {
      listHeightFunc: this.computeFinTableHeight,
      saveName: 'companyBankAcctName',
      saveDefault: true,
      // saveShow: true,
      addFilter: {
        defaultSearchLength: 10,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', showType: '1', range: { min: '', max: '' } })),
        filterGroups: {
          cname: { label: '开户行', prop: 'cname', type: 'input' },
          countryOrgType: { label: '默认所属区域', type: 'select', prop: 'countryOrgType' },
          enable: { label: '是否有效', type: 'select', prop: 'yesNo' },
          // createdBy: {
          //   label: '创建人',
          //   type: 'remoteSelect',
          //   remoteSelectList: [],
          //   remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
          //   visibleChange: (queryString, item) => this.getEmployeeList('', item),
          // },
          // cDate: { label: '创建时间', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['createdTimeStart', 'createdTimeEnd'] },
          // updatedBy: {
          //   label: '修改人',
          //   type: 'remoteSelect',
          //   remoteSelectList: [],
          //   remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
          //   visibleChange: (queryString, item) => this.getEmployeeList('', item),
          // },
          // uTime: { label: '修改时间', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['updatedTimeStart', 'updatedTimeEnd'] },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    this.option1 = {
      ...this.option,
      id: 'option1',
      pagination,
      columns: [
        { label: '开户行', prop: 'cname', width: 160 },
        { label: 'Bank Name', prop: 'ename', width: 160 },
        { label: '默认所属区域', prop: 'countryOrgType', type: 'select' },
        { label: '是否有效', prop: 'enable', propInDict: 'yesNo', type: 'select' },
        { label: '创建人', prop: 'createdName' },
        { label: '创建时间', prop: 'createdTime', width: 160 },
        { label: '修改人', prop: 'updatedName' },
        { label: '修改时间', prop: 'updatedTime', width: 160 },
      ],
    }
    this.option1.operationBtns.data = [{ label: '修改', type: 'text', show: true, action: 'Edit' }]
    // console.log(this.option1)
    // this.getData()
  },
  methods: {
    cancel() {
      this.accountOption.show = false
    },
    // 启用、禁用
    updateEnable(type) {
      if (this.multipleSelection.length !== 1) {
        return this.$msgErrClose('只能勾选一个需要操作的项！')
      }
      let isEnable = type === 'enable'
      this.$confirmWarn(`您是否确认${isEnable ? '启用' : '禁用'}该开户行？`, () => {
        let { bankId } = this.multipleSelection[0]
        bankActived({ bankId, enable: isEnable ? 'yes' : 'no' }).then((res) => {
          this.$msgSucClose(`${isEnable ? '启用' : '禁用'}成功`)
          this.getData()
        })
      })
    },
    search(result) {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.option1.pagination.currPage = 1
      this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
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
      this.lsLoading = true
      bankList(data)
        .then((res) => {
          this.option1.data = res.data.list
          this.option1.pagination.currPage = res.data.currPage
          this.option1.pagination.pageSize = res.data.pageSize
          this.option1.pagination.totalCount = res.data.totalCount
        })
        .catch(console.log)
        .finally(() => (this.lsLoading = false))
    },
    //修改
    // handleEdit({ bankId, bankCode }) {
    //   this.accountOption.title = '编辑开户行信息'
    //   bankDetail({ bankId, bankCode }).then((res) => {
    //     Object.assign(this.accountOption.form, res.data)
    //     this.accountOption.show = true
    //   })
    // },
    handleEdit(row) {
      this.accountOption.title = '编辑开户行信息'
      Object.assign(this.accountOption.form, row)
      this.accountOption.show = true
    },
    // 新增
    handleAdd() {
      Object.assign(this.accountOption.form, { bankId: '', cname: '', state: '', countryOrgType: '', ename: '' })
      this.accountOption.title = '新增开户行信息'
      this.accountOption.show = true
      this.$nextTick(() => {
        this.$refs.baseDialog.$refs.form.clearValidate()
      })
    },
    dialogClose(sure) {
      if (!sure) {
        this.accountOption.show = false
        return
      }
      bankSave(this.accountOption.form).then((res) => {
        let text = !this.accountOption.form.bankId ? '添加成功！' : '修改成功！'
        this.$msgSucClose(text)
        this.accountOption.show = false
        this.getData()
      })
    },
    sendMulti(data, option) {
      this.multipleSelection = data
    },
  },
}
</script>
<style  lang="scss" scoped>
.base-data ::v-deep {
  .update-primary-button {
    background-color: #e9851f !important;
    border: 1px solid #e9851f;
  }
}
</style>