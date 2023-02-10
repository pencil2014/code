<template>
<div class="finance-page"
  v-loading="loading"
  :element-loading-text="eLoadingText"
  :element-loading-spinner="eLoadingSpinner"
  :element-loading-background="eLoadingBackground">
  <FinanceSearch
    :searchOption="searchOption1"
    @search="search"/>
  <div class="finance-search-list-gap">
  </div>
  <div class="finance-list-container">
    <div class="money-box">
      <div class="money-box-left">
        <el-button-group>
          <el-button
            class="finance-btn"
            size="mini"
            @click="prevHandle('doCompare')"
          >委托号再次对账</el-button>
        </el-button-group>
        <el-button-group>
          <el-button
            class="finance-btn"
            size="mini"
            @click="prevHandle('handleExport')"
          >查询结果导出</el-button>
        </el-button-group>
        <el-button-group>
          <!-- <el-button
            class="finance-btn"
            size="mini"
            @click="prevHandle('markDzgFee')"
          >标记委托号所在系统</el-button> -->
          <div class="select-template-box" style="margin-left:8px;">
            <el-dropdown trigger="click" @command="prevHandleCommand">
              <span class="el-dropdown-link">
                标记委托号所在系统<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="'dzg'">
                  大掌柜
                </el-dropdown-item>
                <el-dropdown-item :command="'sowoll'">
                  新系统
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-button-group>
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
    <FinanceTableMass
      :option="option1"
      @send-multi="sendMulti"/>
  </div>
</div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { billMixin } from '@/views/finance/mixins/billMixin'
import { employeeSelectlist } from '@/api/companyResource'
import { mergeBillListPage, mergeDzgBill } from '@/api/fin/settleOrderBill'
import { dateFormat } from '@/views/finance/utils/finance'
import { companyBillBankAccountList } from '@/api/fin/settleUnitBankAcct'
import { usaFeeCompareList, doCompare, markDzgFee } from '@/api/fin/usaFeeCompare'
import truckContainerVue from '@/views/airTransport/order/orderList/components/truckContainer.vue'

export default {
  mixins: [mixin, mixin2, routerMixin, billMixin],
  data() {
    return {
      keyDownActive: true,
      option1: {},
      searchOption1: {},
      loading: false,
      employeeOptions: [],
      mergeForm: {
        fileUid: '',
        settleOrderNos: '',
        settleUnitBankAcctIds: [],
        showOptions: [],
        lang: 'zh',
        longsailTitle: '',
        billType: ''
      },
      mergeFormRules: {
        fileUid: [
          { required: true, message: ' ', trigger: 'blur' }
        ],
        settleOrderNos: [
          { required: true, message: ' ', trigger: 'blur' }
        ],
        settleUnitBankAcctIds: [
          { required: true, message: ' ', trigger: ['blur'] }
        ],
        showOptions: [
          { required: true, message: ' ', trigger: ['blur', 'change'] }
        ],
        lang: [
          { required: true, message: '', trigger: 'blur' }
        ],
        longsailTitle: [
          { required: true, message: ' ', trigger: ['blur'] }
        ],
        billType: [
          { required: true, message: ' ', trigger: 'blur' }
        ]
      },
      fileList: [],
      file: '',
      importDialogVisible: false,
      showUploadBtn: true,
      bankAccountSelectOptions3: [],
      acceptSelf: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
      showOptions: [],
      allShowOptions: ['settleCompNameShow', 'bdEmployeeNameShow', 'settleCorpNameShow', 'sourceBizNoShow', 'billNoShow', 'customerNoShow', 'containerNoShow', 'soNoShow', 'sysLienNameShow', 'vesselVoyageShow', 'polEnameShow', 'podEnameShow', 'boxSizeShow', 'etdShow', 'etaShow', 'atdShow', 'currencyShow', 'reciTotalAmtShow', 'payTotalAmtShow', 'hblShow', 'mblShow'],
      zhDefaultShowOptions: ['settleCompNameShow', 'sourceBizNoShow', 'billNoShow', 'customerNoShow', 'containerNoShow', 'soNoShow', 'polEnameShow', 'podEnameShow', 'boxSizeShow', 'etdShow', 'etaShow', 'currencyShow', 'reciTotalAmtShow', 'payTotalAmtShow'], // 'settleCorpNameShow'
      enDefaultShowOptions: ['settleCompNameShow', 'sourceBizNoShow', 'billNoShow', 'containerNoShow', 'polEnameShow', 'podEnameShow', 'boxSizeShow', 'etdShow', 'etaShow', 'currencyShow', 'reciTotalAmtShow', 'payTotalAmtShow'], //'settleCorpNameShow'
      lang: 'zh',
      fileUploadIsNull: false,
      longsailTitle: '',
      showTitleDropdown: false,
      bankAccountList: [],
      // longsailTitleList: [],
      longsailTitle: '',
    }
  },
  created() {
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      show: false
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true, isNew: true
    })
    this.searchOption1 = {
      // saveDefault: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 11,
        searchInputGroup: [
          { key: 'sourceType', value: '', showType: '1' },
          { key: 'sourceSystem', value: '', showType: '1' },
          { key: 'matchResult', value: '', showType: '1' },
          { key: 'custIntrustNo', value: '', showType: '2' },
          { key: 'usaSettleCorpName', value: '', showType: '3' },
          { key: 'usaEtd', value: '', showType: '3' },
          { key: 'usaInvoiceCreateDate', value: '', showType: '3' },
          { key: 'orderNo', value: '', showType: '4' },
          { key: 'settleCorpCode', value: '', showType: '5' },
          { key: 'bizDate', value: '', showType: '6' },
          // { key: 'createdName', value: '', showType: '7' },
          { key: 'createdTime', value: '', showType: '8' },
        ],
        filterGroups: {
          sourceType: { label: '费用来源系统', type: 'select', placeholder: '请选择', showType: '1', propInDict: 'usaFeeCompareSourceType' },
          sourceSystem: { label: '委托号所在系统', type: 'select', placeholder: '请选择', showType: '1', propInDict: 'usaFeeCompareSourceSystem' },
          matchResult: { label: '是否匹配', type: 'select', placeholder: '请选择', showType: '1', selectOptions: [
            { label: '是', value: 'yes' },
            { label: '否', value: 'no' }
          ] },
          custIntrustNo: { label: '客户委托号', type: 'input', placeholder: '请输入', showType: '2' },
          usaSettleCorpName: { label: '美国系统结算单位', type: 'input', placeholder: '请输入', showType: '3' },
          usaEtd: { label: '美国系统ETD', type: 'daterange', placeholder: '请选择', showType: '3' },
          usaInvoiceCreateDate: { label: '美国系统账单创建时间', type: 'daterange', placeholder: '请选择', showType: '3' },
          orderNo: { label: '订单号', type: 'input', placeholder: '请输入', showType: '4' },
          settleCorpCode: { label: '结算单位', prop: 'settleCorpCode', placeholder: '请选择', type: 'remoteSelect', multiple :true, showType: '5',
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({queryString, unitTypes: ''}, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({queryString, unitTypes: ''}, item)
            },
            remoteSelectList: [],
          },
          bizDate: { label: '业务时间', type: 'daterange', placeholder: '请选择', showType: '6' },
          // createdName: { label: '创建人', prop: 'employeeId', type: 'remoteSelect', showType: '7',
          //   remoteMethod: this.getEmployeeList,
          //   remoteSelectList: this.employeeOptions,
          // },
          createdTime: { label: '创建时间', type: 'daterange', placeholder: '请选择', showType: '8' },
        }
      }
    }
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'UsaFeeCompareList',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns,
      pagination,
      colorColumns: ['yesNo']
    })
    let columns = [
      { prop: 'sourceType', label: '费用来源系统', type: 'select', propInDict: 'usaFeeCompareSourceType', fixed: 'left', minWidth: 90 },
      { prop: 'sourceSystem', label: '委托号所在系统', type: 'select', propInDict: 'usaFeeCompareSourceSystem', fixed: 'left', minWidth: 100 },
      { prop: 'matchResult', label: '是否匹配', type: 'select', propInDict: 'yesNo', fixed: 'left' },
      { prop: 'difAmt', label: '差额', type: 'text', fixed: 'left' },
      { prop: 'custIntrustNo', label: '客户委托号', type: 'text', fixed: 'left' },
      { prop: 'usaEtd', label: '美国系统ETD', type: 'text', width: 85 },
      { prop: 'usaInvoiceCreateDate', label: '美国系统账单创建时间', type: 'text', width: 130 },
      { prop: 'usaSettleCorpName', label: '美国系统结算单位', type: 'text', minWidth: 110 },
      { prop: 'usaReceipayType', label: '美国系统收付类型', type: 'select', minWidth: 110, propInDict: 'receipayType' },
      { prop: 'usaCurrency', label: '美国系统币种', type: 'text', minWidth: 90 },
      { prop: 'usaFeeAmt', label: '美国系统金额', type: 'text', minWidth: 90 },
      { 
        prop: 'orderNo',
        label: '订单号',
        type: 'columnTip',
        width: 110,
        component: 'ColumnTip',
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps) => {
            this.showOneNoDetail('order', no)
          }
        }
      },
      { prop: 'bizDate', label: '业务日期', type: 'text' },
      { prop: 'settleCorpName', label: '结算单位', type: 'text' },
      { prop: 'receipayType', label: '收付类型', type: 'select' },
      { prop: 'currency', label: '币种', type: 'text' },
      { prop: 'feeAmt', label: '金额', type: 'text' },
      // { prop: 'createdName', label: '创建人', type: 'text' }, // 都为系统，不展示
      { prop: 'createdTime', label: '创建时间', type: 'text', minWidth: 110 },
      // { prop: 'updatedName', label: '更新人', type: 'text' },
      { prop: 'updatedTime', label: '更新时间', type: 'text', minWidth: 110 },
    ]
    this.option1.columns = columns
    this.initShowOptions()
  },
  methods: {
    getData(isSearch, param = {}) {
      this.loading = true
      let data = {
        "currPage": this.option1.pagination.currPage,
        "pageSize": this.option1.pagination.pageSize,
        "query": []
      }
      this.searchOption1.addFilter.searchInputGroup.forEach(item => {
        let { key, value } = item
        if (value) {
          if (value instanceof Array) {
            if (value.length === 0) {
              return
            }
            if (key === 'createdTime' || key === 'usaEtd' || key === 'usaInvoiceCreateDate') {
              data.query.push({
                column: key,
                type: 'ge',
                value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00'
              })
              data.query.push({
                column: key,
                type: 'le',
                value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59'
              })
            } else if (key === 'bizDate') {
              data.query.push({
                column: key + 'Start',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00'
              })
              data.query.push({
                column: key + 'End',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59'
              })
            } else if (key === 'settleCorpCode') {
              data.query.push({
                column: key,
                type: 'eq',
                value: value.join(',')
              })
            } else {
              data.query.push({
                column: key,
                type: 'in',
                value
              })
            }
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
      let { isExport } = param
      if (isExport) {
        data.query.push({"column": "queryDataModuleCode", "type": "eq", "value": "usaFeeCompareListExport"})
        this.$store.dispatch('finance/downloadExcelFile', { data: data }).then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = '美国对账' + dateFormat('yyyy-mm-dd HH_MM_SS', new Date()) + '.xlsx'
          link.click()
          this.loading = false
        })
        return
      }
      usaFeeCompareList(data).then(res => {
        let { list } = res.data
        list.forEach(item => {
          // item.settleOrderNos_multiValue = item.settleOrderNos.split(',')
          item.orderNo_multiValue = item.orderNo.split(',')
        })
        this.option1.data = list
        Object.assign(this.option1.pagination, res.data)
        // this.option1.pagination.currPage = res.data.currPage
        // this.option1.pagination.pageSize = res.data.pageSize
        // this.option1.pagination.totalCount = res.data.totalCount
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        this.loading = false
      })
    },
    prevHandle(type) {
      if (!this.multipleSelection1.length && type !== 'handleExport') {
        return this.$message({
          type: 'error',
          message: '请先选择委托号',
          showClose: true
        })
      }
      let text = ''
      let meth = null
      if (type === 'doCompare') {
        text = '再次对账'
        meth = this.doCompare
      } else if (type === 'handleExport') {
        text = '导出'
        meth = this.handleExport
      } else if (type === 'markDzgFee') {
        text = '标记大掌柜费用'
        meth = this.markDzgFee
      }
      this.$confirm(`是否确认${text}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        meth && meth()
      }).catch(err => {
        console.log(err)
      })
    },
    doCompare() {
      let data = {
        usaFeeCompareIds: this.multipleSelection1.map(item => item.usaFeeCompareId)
      }
      this.loading = true
      doCompare(data).then(res => {
        this.$message({
          type: 'success',
          message: '再次对账成功',
          showClose: true
        })
        this.getData()
      }).catch(err => {
        this.loading = false
      })
    },
    handleExport() {
      this.getData(false, { isExport: true })
    },
    markDzgFee(sourceSystem) {
      let data = {
        custIntrustNoList: this.multipleSelection1.map(item => item.custIntrustNo),
        sourceSystem
      }
      this.loading = true
      markDzgFee(data).then(res => {
        this.$message({
          type: 'success',
          message: '标记大掌柜费用成功',
          showClose: true
        })
        this.getData()
      }).catch(err => {
        this.loading = false
      })
    },
    prevHandleCommand(command) {
      if (!this.multipleSelection1.length) {
        return this.$message({
          type: 'error',
          message: '请先选择委托号',
          showClose: true
        })
      }
      let text = ''
      let meth = this.markDzgFee
      if (command === 'dzg') {
        text = '标记大掌柜系统'
      } else if (command === 'sowoll') {
        text = '标记硕沃系统'
      }
      this.$confirm(`是否确认${text}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        meth && meth(command)
      }).catch(err => {
        console.log(err)
      })
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params)
    },
    importSettlementBill() {
      this.importDialogVisible = true
    },
    receiveFileList(val) {
      // console.log(val)
      if (val && val.length) {
        this.file = val[0]
        this.mergeForm.fileUid = this.file.uid
      } else {
        this.file = ''
        this.mergeForm.fileUid = ''
      }
    },
    receiveFile(val) {
      console.log(val)
      this.file = val
      this.mergeForm.fileUid = val.uid
    },
    removeFile(val) {
      // console.log(val)
      if (this.file.uid === val.uid) {
        this.file = ''
        this.mergeForm.fileUid = ''
      }
    },
    initShowOptions() {
      this.mergeForm.showOptions = this.showOptions = this.lang === 'zh' ? this.zhDefaultShowOptions : this.enDefaultShowOptions // this.allShowOptions
    },
    showOptionsChange(val) {
      this.mergeForm.showOptions.splice(0, 1000, ...this.showOptions)
    },
    handleDownload(row) {
      this.$message({
        showClose: true,
        message: '导出中，请留意下载的区域',
        duration: 5000
      })
      let fileNo = row.fileNo
      let name = row.fileName
      this.$store.dispatch('finance/downloadBlobFile', {
        uri: '/base/webapi/file/download',
        params: {
          fileNo
        }
      }).then(res => {
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(res)
        link.download = name
        link.click()
      })
    },
    getEmployeeList(queryString) {
      employeeSelectlist({ name: queryString }).then((res) => {
        let list = res.data.map((item) => ({ ...item, label: `${item.cname} (${item.employeeNo})`, value: item.employeeId }))
        this.employeeOptions.splice(0, 1000, ...list)
      })
    },
    longsailTitleVisible(val) {
      if (val && !this.bankAccountList.length) {
        this.$message({
          type: 'error',
          message: '请先选择银行账号',
          showClose: true
        })
      }
    },
    longsailTitleChange(val) {
      let f = this.getLongsailTitleList.find(item => {
        return item.value == val
      })
      if (f) {
        this.longsailTitle = f.label
      }
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
      setTimeout(() => {
        this.showUploadBtn = true
      }, 1000)
      this.settlementDetailForm.fileId = ''
      this.settlementDetailForm.fileNo = ''
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    },
    handleExceed(files, fileList) {
      this.$message.warning(`只能选择 1 个文件！`);
    },
    fileChange(file, fileList) {
      console.log('file.raw:', file.raw)
      console.log('fileList:', fileList)
      this.file = file.raw
      this.showUploadBtn = false
    },
    companyBankAccountList(queryString) {
      let data = {
        // "accountName": queryString // 默认查询出自己分公司的账号
      }
      companyBillBankAccountList(data).then(res => {
        if (res.code === 0) {
          this.bankAccountSelectOptions3 = res.data.map(item => {
            item.value = item.settleUnitBankAcctId
            item.label = item.accountShortName
            return item
          })
        }
      })
    },
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    handleSizeChange(val){
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val){
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
    }
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    FinanceUploadEmbed
  },
  computed: {
    getLongsailTitleList() {
      let companyNameList = []
      if (this.lang === 'zh') {
        companyNameList = this.bankAccountList.map(item => {
          return item.accountName
        })
        companyNameList = [... new Set(companyNameList)]
        if (companyNameList.length === 0) {
          // companyNameList = ['深圳市长帆国际物流股份有限公司']
        }
      } else if (this.lang === 'en') {
        companyNameList = this.bankAccountList.map(item => {
          return item.accountEname
        })
        companyNameList = [... new Set(companyNameList)]
        if (companyNameList.length === 0) {
          // companyNameList = ['LONG SAIL INTERNATIONAL LOGISTICS CO.,LTD.']
        }
      }
      // if (this.bankAccountSelectChange) {
      //   this.longsailTitle = companyNameList.join(',')
      // }
      let longsailTitleList = []
      if (companyNameList.length) {
        if (companyNameList.length > 1) {
          longsailTitleList.push({
            label: companyNameList.join(','),
            value: 'join'
          })
        }
        companyNameList.forEach((item, index) => {
          longsailTitleList.push({
            label: item,
            value: index
          })
        })
        longsailTitleList.push({
          label: 'LONGSAIL SUPPLY CHAIN CO., LTD.',
          value: 'lsSupply'
        })
      }
      // return companyNameList
      return longsailTitleList
    },
  },
  watch: {
    importDialogVisible(newVal) {
      if (newVal) {
        this.mergeForm = {
          fileUid: '',
          settleOrderNos: '',
          settleUnitBankAcctIds: [],
          lang: 'zh',
          longsailTitle: ''
        }
        this.file = ''
        this.fileList = []
        this.initShowOptions()
        this.$refs.mergeForm && this.$refs.mergeForm.clearValidate()
        this.fileUploadIsNull = false
        this.bankAccountList = []
      }
    }
  }
}
</script>
<style lang="scss">
@import '~@/views/finance/style/bill.scss';
</style>
<style lang="scss" scoped>
.select-template-box {
  float: left;
  margin-bottom: 0px;
}
.select-template-box .el-dropdown{
  margin-left: 0;
  margin-bottom: 0;
  border-radius: 0;
  font-size: 12px;
  border-top: 1px solid #DCDFE6; // #D9D9D9;
  border-bottom: 1px solid #DCDFE6; // #D9D9D9;
  border-left: none;
  border-right: none;
}
.select-template-box:last-child .el-dropdown {
  border-right: 1px solid #DCDFE6;
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
}
.select-template-box:first-child .el-dropdown {
  border-left: 1px solid #DCDFE6;
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
}
.select-template-box:hover .el-dropdown {
  background: rgb(236, 245, 255);
  color: rgb(64, 158, 255);
}
.select-template-box .el-dropdown-link {
  cursor: pointer;
  padding: 0 7px;
  line-height: 18px;
}
</style>