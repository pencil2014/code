<template>
  <div
    :class="isSelect ? '' : 'finance-page'"
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
            <el-button @click="addFeeTemplate" size="mini" type="primary">{{$t('Common.add')}}</el-button>
            <el-button @click="copyFeeTemplate" size="mini" type="primary">{{$t('Common.copy')}}</el-button>
            <el-button @click="modifyEnabled('yes')" size="mini" type="success">启用</el-button>
            <el-button @click="modifyEnabled('no')" size="mini" type="danger">禁用</el-button>
            <el-button @click="deleteTemplate" size="mini" type="danger">{{$t('Common.del')}}</el-button>
          </div>
          <div class="money-box-right">
            <el-button
              class="finance-btn"
              @click="refreshListPage"
              size="mini"
              type="primary"
            >{{$t('Common.refresh')}}</el-button>
          </div>
        </div>
        <FinanceTable
          :option="option1"
          @send-multi="sendMulti"/>
      </div>
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose" />
    </div>
    <el-dialog
      title="修改顺序"
      :visible.sync="sortNumVisible"
      :close-on-click-modal="false"
      custom-class="fin-edit-sortnum"
      width="560px">
      <div>
        <el-input v-model="sortNumRow.sortNum" />
      </div>
      <div style="margin-top:8px;line-height:20px;">
        <span>越大越排前，默认为1</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="saveSortNum" size="mini" type="primary">{{$t('Common.sure')}}</el-button>
        <el-button @click="sortNumVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
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
import { queryFeeTemplatePageList, modifyEnabled, deleteTemplate, modifySortNum } from '@/api/fin/feeTemp'
import { listReceivableRegAccount, bankAccountListAll } from '@/api/fin/settleUnitBankAcct'
import { dateFormat } from '@/views/finance/utils/finance.js'

export default {
  props: {
    isSelect: {
      type: Boolean,
      default: false
    }
  },
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      keyDownActive: true,
      option1: {},
      searchOption1: {},
      multipleSelection1: [],
      form: {
        auditRemark: '',
      },
      orderNo: '',
      feeAdjustApplyId: 0,
      loading: false,
      rejectDialogVisible: false,
      defaultColumns: [],
      sortNumVisible: false,
      sortNumRow: {
        sortNum: null
      },
    }
  },
  created() {
    this.searchOption1 = {
      saveShow: this.isSelect ? false : true,
      // saveDefault: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 6,
        searchInputGroup: this.isSelect ? [
          { key: 'tempNo', value: '', showType: '1' },
          { key: 'tempName', value: '', showType: '2' },
          { key: 'businessType', value: '', showType: '3' },
        ] : [
          { key: 'tempNo', value: '', showType: '1' },
          { key: 'tempName', value: '', showType: '2' },
          { key: 'businessType', value: '', showType: '3' },
          { key: 'tempType', value: '', showType: '4' },
          { key: 'enabled', value: '', showType: '5' },
          { key: 'createdTime', value: '', showType: '6' },
        ],
        filterGroups: this.isSelect ? {
          tempNo: { label: '模板编号', type: 'input', showType: '1' },
          tempName: { label: '模板名称', type: 'input', showType: '2' },
          businessType: { label: this.$t('FeeList.businessTypes'), type: 'select', showType: '3', prop: 'businessType' },
          createdTime: { label: this.$t('Common.createTime'), type: 'daterange', showType: '6' },
        } : {
          tempNo: { label: '模板编号', type: 'input', showType: '1' },
          tempName: { label: '模板名称', type: 'input', showType: '2' },
          businessType: { label: this.$t('FeeList.businessTypes'), type: 'select', showType: '3', prop: 'businessType' },
          tempType: { label: '模板类型', type: 'select', showType: '4', prop: 'feeTemplateType' },
          enabled: { label: '是否启用', type: 'select', showType: '5', prop: 'yesNo' },
          createdTime: { label: this.$t('Common.createTime'), type: 'daterange', showType: '6' },
        }
      },
    }
    let operationBtns = Object.assign(this.option.operationBtns, {
      data: [
        {
          label: '修改顺序',
          type: 'text',
          show: true,
          // showFn: () => this.checkAuth(this.$route.name, 'btn-showDetail'),
          action: 'Edit',
        },
      ],
      show: true,
      width: 100
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true, isNew: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'feeTemplateList',
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
            this.routerPush('FeeTemplateDetail', { tempNo: row.tempNo })
            // let type = row.sourceType ? row.sourceType : 'order'
            // this.showOneNoDetail(type, row.orderNo, { isTab: true }) // feeId: row.feeId, 
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
        label: this.$t('FeeList.businessTypes'),
        type: 'select',
        width: 100
      },
      {
        prop: 'tempType',
        label: '模板类型',
        type: 'select',
        propInDict: 'feeTemplateType'
      },
      {
        prop: 'enabled',
        label: '是否启用',
        type: 'select',
        propInDict: 'yesNo'
      },
      {
        prop: 'sortNum',
        label: '显示顺序',
        type: 'text'
      },
      { prop: 'createdName', label: this.$t('Common.createdBy'), type: 'text' },
      { prop: 'createdTime', label: this.$t('Common.createTime'), type: 'text', width: 120 },
      { prop: 'updatedName', label: '更新人', type: 'text', width: 90 },
      { prop: 'updatedTime', label: '更新时间', type: 'text', width: 120 },
    ]
    this.defaultColumns = this.selfColumnsBase.map(item => item.prop)
    // this.option1.columns = columns
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
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: [],
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
				data.columns = this.customColumnsKeys
			}
      this.searchOption1.addFilter.searchInputGroup.forEach(item => {
        let { key, value } = item
        if (value && value !== '') {
          console.log(item)
          if (key === 'writeoffDate' || key === 'receipayDate' || key === 'finDate' || key === 'createdTime') {
            data.query.push({
              column: key + 'Start',
              type: 'default',
              value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00',
            })
            data.query.push({
              column: key + 'End',
              type: 'default',
              value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59',
            })
          } else if (key === 'writeoffTime') {
            console.log(value)
            data.query.push({
              column: key + 'Start',
              type: 'default',
              value: value[0],
            })
            data.query.push({
              column: key + 'End',
              type: 'default',
              value: value[1],
            })
          } else {
            data.query.push({
              column: key,
              type: 'eq',
              value: value,
            })
          }
        }
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (isSearch === 'download') {
        this.$message({
          message: '导出中，请留意下载的区域',
          type: 'warning',
          showClose: true,
          duration: 5000
        })
        data.query.push({
          "column": "queryDataModuleCode",
          "type": "eq",
          "value": "transferFeeAllotListExport"
        })
        this.$store.dispatch('finance/downloadBlobFilePost', {
          uri: '/fin/common/queryDataExportExcel',
          data: {
            data
          }
        }).then(res => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = '分摊手续费' + dateFormat('yyyy-mm-dd HH_MM_SS', new Date()) + '.xlsx'
          link.click()
        })
        return
      }
      this.loading = true
      queryFeeTemplatePageList(data).then((res) => {
        if (res.code === 0) {
          let { configColumns } = res.data
          this.columns = configColumns.length ? configColumns : this.defaultColumns
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
          this.option1.data = res.data.list
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        }
      }).finally(() => {
        this.loading = false
      })
    },
    addFeeTemplate() {
      this.routerPush('AddFeeTemplate')
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
      this.$confirm('确认删除费用模板吗？', this.$t('Common.tips'), {
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
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
    handleEdit(row) {
      console.log(row)
      this.sortNumRow = { ...row }
      this.sortNumVisible = true
    },
    saveSortNum() {
      if (!this.sortNumRow.sortNum) {
        this.$message({ message: '请输入显示顺序！', type: 'error' })
        return
      }
      let reqMethod = modifySortNum
      this.saveFeeTemplate(reqMethod)
    },
    saveFeeTemplate(reqMethod) {
      console.log(this.sortNumRow)
      this.loading = true
      let data = {
        "tempNo": this.sortNumRow.tempNo,
        "sortNum": this.sortNumRow.sortNum
      }
      reqMethod(data).then((res) => {
        this.$message({ message: this.$t('Hedge.modifyTips'), type: 'success' })
        this.getData()
        this.sortNumVisible = false
        this.loading = false
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