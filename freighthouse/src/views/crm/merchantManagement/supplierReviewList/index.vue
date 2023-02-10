<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption1" @search="search" :border="true" />
    <div class="finance-list-container">
      <div class="money-box">
        <div>
          <template v-if="['all','submit'].includes(verifyStatus)">
          <el-button
            v-if="$store.state.user.roles.includes('sps')"
            :disabled="noSubmit"
            type="success"
            @click="handleVerify('pass')"
            size="mini"
          >通过</el-button>
          <el-button
            v-if="$store.state.user.roles.includes('sps')"
            :disabled="noSubmit"
            type="danger"
            @click="handleVerify('refuse')"
            size="mini"
          >拒绝</el-button>
          </template>
          <el-button @click="handleExport" size="mini">导出</el-button>
          <el-button @click="handleCustomColumns" size="mini">自定义表头</el-button>
        </div>
        <div class="money-box-right">
          <el-radio-group v-model="verifyStatus" size="mini">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="submit">待审核</el-radio-button>
            <el-radio-button label="pass">已审核</el-radio-button>
            <el-radio-button label="refuse">已拒绝</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <FinanceTable :option="option1" :autoMax="true" @send-multi="sendMulti" />
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
    <CrmDialog ref="pass" :option="passOption" @close="closeDialog('pass',$event)" />
    <CrmDialog ref="refuse" :option="refuseOption" @close="closeDialog('refuse',$event)" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import CrmDialog from '@/views/crm/components/crmDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { supplierListTable } from '@/views/crm/data'
import SUPPLIER from '@/api/crm/supplier'
export default {
  name: 'customerList',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns,
    CrmDialog,
  },
  data() {
    let ruleCfg = { required: true, message: ' ' }
    return {
      multipleSelection: [],
      // 列表类型
      verifyStatus: 'all',
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption1: {},
      // 列表页--动态组件--当前显示的组件
      query: {
        applyNo: '',
        confirmStatus: '',
        refuseReason: '',
      },
      passOption: {
        title: '审核通过',
        show: false,
        form: { custLevel: '' },
        formItems: [{ label: '客户等级', prop: 'custLevel', type: 'select', rules: [{ ...ruleCfg }] }],
      },
      refuseOption: {
        title: '审核拒绝',
        show: false,
        form: { refuseReason: '', refuseRemark: '' },
        formItems: [
          { label: '拒绝原因', prop: 'refuseReason', propInDict: 'verifyRejection', type: 'select', rules: [{ ...ruleCfg }] },
          { label: '拒绝备注', prop: 'refuseRemark', type: 'textarea', maxlength: 512 },
        ],
      },
      // 初始自定义表头
      selfColumnsBase: supplierListTable.map((item) => {
        let target = { ...item, hasTag: item.prop === 'name' }
        if (item.cDisabled) target.disabled = true
        if (target.callback) target.callback = (row) => this.showDetail(row)
        return target
      }),
    }
  },
  computed: {
    noSubmit() {
      return !this.multipleSelection.find((item) => item.verifyStatus === 'submit')
    },
  },
  watch: {
    verifyStatus() {
      this.handleCurrentChange(1)
    },
  },
  activated () {
    this.getData()
  },
  created() {
    // 搜索配置
    let searchObj = {}
    supplierListTable.forEach((v) => {
      if (v.searchHide) return
      let prop = v.searchProp || v.prop
      searchObj[prop === 'serviceItems' ? 'serviceItemInfo' : prop] = {
        ...v,
        type: v.sType || v.type || 'input',
        label: v.sLabel || v.label,
        prop,
      }
      // 特殊处理，需要去重
      if (prop === 'serviceItems') {
        let arr = []
        this.dictMap.crmService.forEach((item) => {
          if (!arr.find(({ value }) => value == item.value)) {
            arr.push(item)
          }
        })
        searchObj['serviceItemInfo'].selectOptions = arr
      }
    })
    this.searchOption1 = {
      addFilter: {
        defaultSearchLength: 5,
        searchInputGroup: [
          { key: 'name', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'categoryInfo', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'biztypeInfo', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'indexAddr', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'mtEmployeeName', value: '', showType: '1', range: { min: '', max: '' } },
        ],
        filterGroups: { ...searchObj },
        dateArr: ['setupDate', 'usccExpDate'],
        callback: true,
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    this.option1 = { ...this.option, id: 'option1', pagination }
    // 自定义表头
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = [
      // {
      //   prop: '',
      //   label: ' ',
      //   type: 'tag',
      //   width: '20px',
      //   formatter: ({ verifyStatus, status }) => {
      //     if (verifyStatus == 'submit' && status == 'valid') return [{ text: '改', type: 'change' }]
      //     if (verifyStatus == 'refuse') return [{ text: '拒', type: 'refuse' }]
      //   },
      // },
      ...columns,
    ]
    // this.getData()
  },
  methods: {
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    search(query) {
      this.option1.pagination.currPage = 1
      this.getData(query)
    },
    getData(query) {
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        verifyStatus: this.verifyStatus,
        // status: this.verifyStatus == 'pass' ? 'valid' : '',
        // status: this.verifyStatus == 'pass' ? '' : '',
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      if (query) {
        this.searchBackup = query
      }
      data.query = this.searchBackup || []
      // let serviceCode = data.query.find((item) => item.column == 'serviceItems')
      // if (serviceCode) data.serviceCode = serviceCode.value
      // console.log(data)
      let mtEmployeeName = data.query.find((item) => item.column == 'mtEmployeeName')
      if (mtEmployeeName) data.query.push({ column: 'mtEmployeeId', type: 'eq', value: mtEmployeeName.value })
      let reqData = { ...data, query: data.query.filter((v) => v.column !== 'mtEmployeeName') }
      this._exportSearchData = reqData
      SUPPLIER.myVerifySupplierList(reqData)
        .then(({ data }) => {
          if (data.configColumns && data.configColumns.length) {
            let columns = data.configColumns
            let optionColumns = columns.map((k) => this.selfColumnsBase.find(({ prop }) => prop === k)).filter((v) => v)
            this.option1.columns.splice(0, 100, ...optionColumns)
            this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
            this.configColumns = data.configColumns
          }
          // this.option1.data = data.list.map((item) => ({
          //   ...item,
          //   _isChanged: this.verifyStatus == 'submit' && item.status == 'valid',
          // }))
          this.option1.data = data.list.map((item) => {
            let { verifyStatus, status } = item
            let categorys = item.categorys.map((v) => v.category.toLowerCase()).join(',')
            let biztypes = item.biztypes.map((v) => v.businessType.toLowerCase()).join(',')
            let serviceItems = item.serviceItems.map((v) => v.serviceCode.toLowerCase()).join(',')
            let _tagArr, _isChanged, _isRefused
            if (verifyStatus == 'submit' && status == 'valid') {
              _isChanged = true
              _tagArr = [{ text: '改', type: 'change' }]
            }
            if (verifyStatus == 'refuse') {
              _isRefused = true
              _tagArr = [{ text: '拒', type: 'refuse' }]
            }
            return { ...item, _tagArr, _isChanged, _isRefused, categorys, biztypes, serviceItems }
          })
          this.option1.pagination.currPage = data.currPage
          this.option1.pagination.pageSize = data.pageSize
          this.option1.pagination.totalCount = data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    sendMulti(data) {
      this.multipleSelection = data
    },
    handleVerify(verifyStatus) {
      if (!this.multipleSelection.length && this.multipleSelection.find((item) => item.verifyStatus == 'submit')) {
        return this.$msgErrClose('请选择要审核的项！')
      }
      if (verifyStatus == 'pass') {
        // 通过审核没有多余参数，不需form弹框
        return this.$confirmWarn('确认通过审核？', () => this.closeDialog('pass', true, true))
      }
      this[verifyStatus + 'Option'].show = true
    },
    closeDialog(verifyStatus, sure, notDialog) {
      let option = this[verifyStatus + 'Option']
      if (!sure) return this._close(option, verifyStatus)
      let supplierIds = this.multipleSelection.filter((item) => item.verifyStatus == 'submit').map((item) => item.supplierId)
      SUPPLIER.verify({ supplierIds, verifyStatus, ...option.form }).then((res) => {
        !notDialog && this._close(option, verifyStatus)
        this.$msgSucClose('操作成功！')
        this.handleCurrentChange(1)
      })
    },
    _close(option, verifyStatus) {
      this.$refs[verifyStatus].$refs.form.resetFields()
      this.$nextTick(() => {
        this.$refs[verifyStatus].$refs.form.clearValidate()
        option.show = false
      })
    },
    handleExport() {
      this.lsLoading = true
      SUPPLIER.myVerifySupplierListExport(this._exportSearchData)
        .then((res) => window.open(res.data.filePath))
        .finally(() => (this.lsLoading = false))
    },
    handleCustomColumns() {
      this.customColumnsPopShow = true
    },
    showDetail(row) {
      // console.log(this.verifyStatus)
      if (row.verifyStatus == 'submit') {
        return this.routerPush('SupplierReviewDetail', { custid: row.supplierId })
      }
      // else if (this.verifyStatus == 'pass') {
      this.routerPush('SupplierReviewDetailPass', { custid: row.supplierId, refuse: this.verifyStatus == 'pass' ? '' : true })
      // }
    },
  },
}
</script>
