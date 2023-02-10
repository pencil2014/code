<template>
  <div
    v-loading="loading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground"
  >
    <div>
      <FinanceSearch :searchOption="searchOption1" @search="search" />
      <div class="finance-search-list-gap"></div>
      <div class="finance-list-container">
        <div class="money-box">
          <div class="money-box-left">
            <el-button @click="addFeeTemplate" size="mini" type="primary">新增</el-button>
            <!-- <el-button @click="copyFeeTemplate" size="mini" type="primary">复制</el-button>
            <el-button @click="modifyEnabled('yes')" size="mini" type="success">启用</el-button>
            <el-button @click="modifyEnabled('no')" size="mini" type="danger">禁用</el-button>
            <el-button @click="deleteTemplate" size="mini" type="danger">删除</el-button> -->
          </div>
          <div class="money-box-right">
            <el-button
              class="finance-btn"
              @click="refreshListPage"
              size="mini"
              type="primary"
            >刷新</el-button>
          </div>
        </div>
        <FinanceTable
          :option="option1"
          @send-multi="sendMulti"/>
      </div>
      <div class="finance-table-container">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title">应收费用列表</div>
          </div>
          <div class="money-box-right">
          </div>
        </div>
        <FinanceTable
          :option="option2"
          @send-multi="sendMulti2"/>
      </div>
      <div class="finance-table-container">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title">应付费用列表</div>
          </div>
          <div class="money-box-right">
          </div>
        </div>
        <FinanceTable
          :option="option3"
          @send-multi="sendMulti2"/>
      </div>
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose" />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { specFeeMngApplyList, applyAudit } from '@/api/fin/specfee'
import { listAllotPage } from '@/api/fin/transferFee'
import { usableFeeTemplate, getTemplateItem } from '@/api/fin/feeTemp'
import { listReceivableRegAccount, bankAccountListAll } from '@/api/fin/settleUnitBankAcct'
import { dateFormat } from '@/views/finance/utils/finance.js'

export default {
  props: {
    tempType: {
      type: String,
      default: 'biz'
    },
    useNo: {
      type: String,
      default: ''
    },
    businessType: {
      type: String,
      default: ''
    }
  },
  mixins: [mixin, routerMixin],
  data() {
    return {
      option1: {},
      option2: {},
      option3: {},
      searchOption1: {},
      multipleSelection1: [],
      multipleSelection2: [],
      multipleSelection3: [],
      form: {
        auditRemark: '',
      },
      orderNo: '',
      feeAdjustApplyId: 0,
      loading: false,
      rejectDialogVisible: false,
      defaultColumns: [],
      // revisedHeight: -40,
    }
  },
  created() {
    this.searchOption1 = {
      // saveShow: true,
      // saveName: 'transferFeeAllotList',
      // saveDefault: true,
      // listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 3,
        searchInputGroup: [
          { key: 'tempNo', value: '', showType: '1' },
          { key: 'tempName', value: '', showType: '2' },
          { key: 'businessType', value: '', showType: '3' },
        ],
        filterGroups: {
          tempNo: { label: '模板编号', type: 'input', showType: '1' },
          tempName: { label: '模板名称', type: 'input', showType: '2' },
          businessType: { label: '业务类型', type: 'select', showType: '3', prop: 'businessType' },
          createdTime: { label: '创建时间', type: 'daterange', showType: '4' },
        }
      },
    }
    let operationBtns = Object.assign(this.option.operationBtns, {
      // data: [
      //   {
      //     label: '详情',
      //     type: 'text',
      //     // show: true,
      //     showFn: () => this.checkAuth(this.$route.name, 'btn-showDetail'),
      //     action: 'showDetail',
      //   },
      // ],
      show: false
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: false,
    })
    let columns = [
      { prop: 'settleCorpName', label: '结算单位', type: 'input', width: 160, key: 'settleCorpName', disabled: true },
      { prop: 'feeName', label: '费用名称', type: 'input', key: 'feeName', width: 110, disabled: true },
      { prop: 'serviceName', label: '服务项', type: 'text', key: 'serviceName', width: 100, disabled: true },
      { prop: 'unitPrice', label: '单价', type: 'input', key: 'unitPrice', disabled: true },
      { prop: 'feeUnit', label: '计费单位', type: 'select', key: 'feeUnit', disabled: true },
      { prop: 'currency', label: '币种', type: 'select', key: 'currency', width: 70, propInDict: 'validCurrency', filterable: true, disabled: true },
    ]
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'usableFeeTemplate',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      // selection: {
      //   show: true
      // },
      operationBtns,
      pagination,
      // customColumns: {
      //   show: true,
      //   handleCustomColumns: this.handleCustomColumns
      // },
      rootTipsHide: true,
      maxHeight: 300,
    })
    this.option2 = Object.assign({}, this.option, {
      id: 'option2', $name: 'usableFeeTemplate2',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      selection: {
        show: true,
        fixed: true
      },
      operationBtns,
      pagination,
      columns,
      maxHeight: 300,
    })
    this.option3 = Object.assign({}, this.option, {
      id: 'option3', $name: 'usableFeeTemplate3',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      selection: {
        show: true,
        fixed: true
      },
      operationBtns,
      pagination,
      columns,
      maxHeight: 300,
    })
    this.selfColumnsBase = this.columnsBaseLocal = [ // let columns =
      {
        prop: 'tempNo',
        label: '费用模板编号',
        type: 'button',
        width: 128,
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            // this.routerPush('FeeTemplateDetail', { tempNo: row.tempNo })
            let routeUrl = this.$router.resolve({
              name: 'FeeTemplateDetail',
              query: {
                tempNo: row.tempNo
              }
            })
            window.open(routeUrl.href, '_blank')
          },
        },
      },
      {
        prop: 'tempName',
        label: '费用模板名称',
        type: 'text',
        width: 120,
      },
      {
        prop: 'businessType',
        label: '业务类型',
        type: 'select',
      },
      {
        prop: 'tempType',
        label: '模板类型',
        type: 'select',
        propInDict: 'feeTemplateType'
      },
      // {
      //   prop: 'enabled',
      //   label: '是否启用',
      //   type: 'select',
      //   propInDict: 'yesNo'
      // },
      { prop: 'createdName', label: '创建人', type: 'text' },
      { prop: 'createdTime', label: '创建时间', type: 'text', width: 120 },
      { prop: 'updatedName', label: '更新人', type: 'text', width: 90 },
      { prop: 'updatedTime', label: '更新时间', type: 'text', width: 120 },
    ]
    this.defaultColumns = this.selfColumnsBase.map(item => item.prop)
    this.getData()
  },
  methods: {
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    getData(isSearch) {
      let data = {
        // currPage: this.option1.pagination.currPage,
        // pageSize: this.option1.pagination.pageSize,
        // columns: [],
        // query: [],
        tempType: this.tempType
      }
      // if (this.customColumnsKeys && this.customColumnsKeys.length) {
			// 	data.columns = this.customColumnsKeys
			// }
      this.searchOption1.addFilter.searchInputGroup.forEach(item => {
        let { key, value } = item
        if (value && value !== '') {
          if (key === 'writeoffDate' || key === 'receipayDate' || key === 'finDate' || key === 'createdTime') {
            // data.query.push({
            //   column: key + 'Start',
            //   type: 'default',
            //   value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00',
            // })
            data[key + 'Start'] = dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00'
            // data.query.push({
            //   column: key + 'End',
            //   type: 'default',
            //   value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59',
            // })
            data[key + 'End'] = dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59'
          } else if (key === 'writeoffTime') {
            // data.query.push({
            //   column: key + 'Start',
            //   type: 'default',
            //   value: value[0],
            // })
            data[key + 'Start'] = value[0]
            // data.query.push({
            //   column: key + 'End',
            //   type: 'default',
            //   value: value[1],
            // })
            data[key + 'End'] = value[1]
          } else {
            // data.query.push({
            //   column: key,
            //   type: 'eq',
            //   value: value,
            // })
            data[key] = value
          }
        }
      })
      // if (isSearch) {
      //   this.searchBackup = data.query
      // }
      // data.query = this.searchBackup || []
      this.loading = true
      usableFeeTemplate(data).then((res) => {
        if (res.code === 0) {
          this.columns = this.defaultColumns
          let arr = []
          this.columns.forEach(column => {
            let obj = this.selfColumnsBase.find(item => {
              return item.prop === column
            })
            if (obj) {
              arr.push(obj)
            }
          })
          this.option1.columns = arr
          this.option1.data = res.data.filter(item => {
            return !this.businessType || this.businessType === item.businessType
          })
        }
      }).finally(() => {
        this.loading = false
      })
    },
    confirmFeeTemplate() {
      if (this.multipleSelection1.length !== 1) {
        return this.$message({
          message: '请选择一个费用模板',
          type: 'error',
          showClose: true
        })
      }
      let fees = this.multipleSelection2.concat(this.multipleSelection3)
      if (!fees.length) {
        this.$emit('set-fee-template', this.multipleSelection1)
      } else {
        this.$emit('set-fee-template', fees)
      }
    },
    addFeeTemplate() {
      // this.routerPush('AddFeeTemplate')
      let routeUrl = this.$router.resolve({
        name: 'AddFeeTemplate',
        query: {
          tempType: this.tempType,
          isTab: true
        }
      })
      window.open(routeUrl.href, '_blank')
    },
    copyFeeTemplate() {
      if (this.multipleSelection1.length !== 1) {
        this.$message({
          message: '请选择一个费用模板进行复制',
          type: 'error',
          showClose: true
        })
      } else {
        let tempNo = this.multipleSelection1[0].tempNo
        this.routerPush('FeeTemplateDetail', { tempNo, isCopy: true })
      }
    },
    modifyEnabled(val) {
      if (this.multipleSelection1.length === 0) {
        return this.$message({
          message: '至少选择一个费用模板进行启用禁用',
          type: 'error',
          showClose: true
        })
      }
      let data = {
        tempNoList: this.multipleSelection1.map(item => item.tempNo),
        enabled: val
      }
      modifyEnabled(data).then(res => {
        this.$message({
          message: val === 'yes' ? '启用' : '禁用',
          type: 'success',
          showClose: true
        })
        this.refreshListPage()
      })
    },
    deleteTemplate() {
      if (this.multipleSelection1.length === 0) {
        return this.$message({
          message: '至少选择一个费用模板进行删除',
          type: 'error',
          showClose: true
        })
      }
      this.$confirm('确认删除费用模板吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          let data = {
            tempNoList: this.multipleSelection1.map(item => item.tempNo)
          }
          deleteTemplate(data).then(res => {
            this.$message({
              message: '删除模板成功',
              type: 'success',
              showClose: true
            })
            this.refreshListPage()
          })
        })
        .catch((err) => {
          console.log(err)
        })
    },
    lsBankAccountList(queryString, item, row) {
      // let data = {
      //   "accountName": queryString // 默认查询出自己分公司的账号
      // }
      let data = { unitType: 'company', accountName: queryString, status: 'effect' }
      bankAccountListAll(data).then(res => {
        if (res.code === 0) {
          item.remoteSelectList = res.data.map(item => {
            item.value = item.accountShortName
            item.label = item.accountShortName
            return item
          })
          console.log('item:', item)
        }
      })
    },
    sendMulti(data, option) {
      // console.log(data, option)
      if (option === this.option1) this.multipleSelection1 = data
      if (this.multipleSelection1.length > 1) {
        return this.$message({
          message: '只能选择一个费用模板',
          type: 'error',
          showClose: true
        })
      } else if (this.multipleSelection1.length === 1) {
        this.getTemplateItem(this.multipleSelection1[0].tempNo)
      } else if (this.multipleSelection1.length === 0) {
        this.option2.data = []
        this.option3.data = []
      }
    },
    sendMulti2(data, option) {
      // console.log(data, option)
      if (option === this.option2) this.multipleSelection2 = data
      if (option === this.option3) this.multipleSelection3 = data
    },
    getTemplateItem(tempNo) {
      let data = {
        tempNo,
        orderNo: this.useNo
      }
      getTemplateItem(data).then(res => {
        this.option2.data = res.data.filter(item => {
          return item.receipayType === 'receive'
        })
        this.option3.data = res.data.filter(item => {
          return item.receipayType === 'pay'
        })
      })
    },
    showDetail({ sourceBizNo, sourceType, feeAdjustApplyId }) {
      this.routerPush('FeeClosedModifyFeeDetail', { sourceBizNo, sourceType, feeAdjustApplyId })
    },
  },
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns
  },
}
</script>
<style>
</style>