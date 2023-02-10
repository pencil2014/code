<template>
  <div class="finance-page">
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-seabill-cnt">
      <div style="background:#fff;padding-bottom:0px;" class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button class="finance-btn" @click="handleImportBill" size="mini"
              >导入账单</el-button
            >
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" @click="handleAudit" size="mini"
              >推送商务审核</el-button
            >
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="rightFilterAction(0)"
              size="mini"
              :class="rightFilterBtns[0] ? 'right-filter-btns-effect' : ''"
              >全部</el-button
            >
            <el-button
              class="finance-btn"
              @click="rightFilterAction(1)"
              size="mini"
              :class="rightFilterBtns[1] ? 'right-filter-btns-effect' : ''"
              >待推送</el-button
            >
            <el-button
              class="finance-btn"
              @click="rightFilterAction(2)"
              size="mini"
              :class="rightFilterBtns[2] ? 'right-filter-btns-effect' : ''"
              >待确认</el-button
            >
            <el-button
              class="finance-btn"
              @click="rightFilterAction(3)"
              size="mini"
              :class="rightFilterBtns[3] ? 'right-filter-btns-effect' : ''"
              >已通过</el-button
            >
            <el-button
              class="finance-btn"
              @click="rightFilterAction(4)"
              size="mini"
              :class="rightFilterBtns[4] ? 'right-filter-btns-effect' : ''"
              >未通过</el-button
            >
          </el-button-group>
        </div>
      </div>
      <FinanceTable
        class="import-bill-table empty-table-fixed"
        :option="option1"
        :tableQuery="tableQuery"
        @send-multi="sendMulti"
      />
    </div>

    <div v-if="dialogOrderShow">
      <!-- 导入账单弹窗 -->
      <ImportBill
        @getData="getData"
        @close="closeImportBill"
        :dialogOrderShow="dialogOrderShow"
      />
    </div>

    <!-- 更新账单弹窗 -->
    <UpdateBill
      :billNo="billNo"
      @close="closeUpdateBill"
      :dialogOrderShow="updateBillShow"
    />
  </div>
</template>

<script>
import FinanceSearch from './financeSearch/financeSearch'
import FinanceTable from './financeTable'
import ImportBill from './importBill'
import UpdateBill from './updateBill'
import { mixin } from './mixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { mapGetters } from 'vuex'
import { listPage, orderInfo } from '@/api/fin/shBill'
import { employeeSelectlist } from '@/api/companyResource'
import { dateFormat } from '@/views/finance/utils/finance'
import {
  blBillPageList,
  blBillDelete,
  blBillPricingCheck,
  blBillCancelBill
} from '@/api/order/bl'
import { Row } from 'element-ui'

export default {
  components: {
    FinanceSearch,
    FinanceTable,
    ImportBill,
    UpdateBill
  },
  mixins: [mixin, routerMixin],
  data() {
    return {
      updateBillShow: false,
      billNo: '',
      searchOption: {},
      selectedOptionItem: '',
      rightFilterBtns: [true, false, false, false, false],
      option1: {},
      tableQuery:{
        pageSize: -1,
        currPage: 1
      },
      multipleSelection: [],
      dialogOrderShow: false,
      orderNoArr: [],
      initStatus: false
    }
  },
  computed: {
    ...mapGetters(['dictMap'])
  },
  mounted() {
    this.$nextTick(() => {
      this.initStatus = true
    })
  },
  created() {
    this.searchOption = {
      addFilter: {
        plusShow: false,
        defaultSearchLength: 2,
        searchInputGroup: [
          {
            key: 'billNo',
            value: '',
            showType: '1'
          },
          {
            key: 'orderNo',
            value: '',
            showType: '2'
          }
        ],
        filterGroups: {
          billNo: {
            label: '账单号',
            type: 'input',
            showType: '1'
          },
          orderNo: {
            label: '工作单号',
            type: 'input',
            showType: '2'
          }
        }
      }
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      width: 120,
      data: [
        // {
        // 	label: '修改',
        // 	type: 'text',
        // 	showFn: row => ['submit', 'refuse'].includes(row.dnCheckStatus), //待确认和不通过可以修改
        // 	action: 'Edit'
        // },
        {
          label: '更新',
          type: 'text',
          showFn: row => ['pass', 'refuse'].includes(row.dnCheckStatus), //已确认和已拒绝可以更新
          action: 'Update',
          class: 'bill-list-update'
        },
        {
          label: '撤回',
          type: 'text',
          showFn: row => ['submit'].includes(row.dnCheckStatus), //已确认和已拒绝可以更新
          action: 'Recall',
          class: 'bill-list-update'
        },
        {
          label: '删除',
          type: 'text',
          showFn: row => ['draft'].includes(row.dnCheckStatus),
          action: 'Delete',
          class: 'bill-list-delete'
        }
      ]
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      showOverflow:false,
      loading: false,
      emptyText: '数据将在查询后显示',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns,
      pagination
    })
    let columns = [
      {
        prop: 'billNo',
        label: '账单号',
        width: 150,
        type: 'text'
      },
      {
        prop: 'dnBillType',
        label: '船东账单类型',
        type: 'text',
        formatter: (row, pItem) => {
          let obj = this.dictMap.blFileType.find(
            item => item.value.toUpperCase() === row[pItem.prop]
          )
          if (obj) {
            return obj.label
          }
          return ''
        }
      },
      {
        prop: 'billType',
        label: '账单类型',
        type: 'text',
        formatter: (row, pItem) => {
          let obj = this.dictMap.shBillType.find(
            item => item.value.toUpperCase() === row[pItem.prop]
          )
          if (obj) {
            return obj.label
          }
          return ''
        }
      },
      {
        prop: 'orderNo',
        label: '工作单号',
        type: 'text',
        width: 125
      },
      {
        prop: 'inputNo',
        label: '单号',
        width: 125,
        type: 'text'
      },
      {
        prop: 'dnCheckStatus',
        label: '船公司费用审核状态',
        type: 'text',
        width: 140,
        formatter: (row, pItem) => {
          let obj = this.dictMap.blDnCheckStatus.find(
            item => item.value === row[pItem.prop]
          )
          // if (obj) {
          // 	return obj.label
          // }
          // return ''

          let color = ''
          if (row.dnCheckStatus === 'submit') {
            color = 'yellow'
          }
          if (row.dnCheckStatus === 'pass') {
            color = 'green'
          }
          if (row.dnCheckStatus === 'refuse') {
            color = 'red'
          }
          if (obj) {
            return `<span class="${color}">${obj.label}</span>`
          } else {
            return ''
          }
        }
      },
      {
        prop: 'inputNoType',
        label: '录入单号类型',
        type: 'text',
        formatter: (row, pItem) => {
          let obj = this.dictMap.billInputNoType.find(
            item => item.value.toUpperCase() === row[pItem.prop]
          )
          if (obj) {
            return obj.label
          }
          return ''
        }
      },
      {
        prop: 'billDateCheckLast',
        label: '账单最晚确认日期',
        width: 140,
        type: 'text'
      },
      {
        prop: 'settleCompName',
        label: '结算分公司名称',
        width: 140,
        type: 'text'
      },
      {
        prop: 'bkgAgentSupplierName',
        label: '订舱代理名称',
        type: 'text'
      },
      {
        prop: 'shipCarrierCode',
        label: '船公司',
        type: 'text'
      },
      {
        prop: 'porPortName',
        label: '驳船收货地名称',
        width: 140,
        type: 'text'
      },
      {
        prop: 'polPortName',
        label: '起运港名称',
        type: 'text'
      },
      {
        prop: 'podPortName',
        label: '目的港名称',
        type: 'text'
      },
      {
        prop: 'fileName',
        label: '账单附件名称',
        type: 'button',
        width: 200,
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.viewFile(row, index)
          }
        }
      },
      {
        prop: 'soInfo',
        label: 'SO',
        type: 'text'
      },
      {
        prop: 'dnCheckEmployeeName',
        label: '船公司费用审核人',
        width: 140,
        type: 'text'
      },
      {
        prop: 'dnCheckTime',
        label: '船公司费用审核时间',
        width: 140,
        type: 'text'
      },
      {
        prop: 'dnRefuseReason',
        label: '船公司费用确认拒绝原因',
        width: 150,
        type: 'text',
        isTooltip: true,
        width: 150,
        formatter: (row, pItem) => {
          let obj = this.dictMap.dnRefuseReason.find(
            item => item.value === row.dnRefuseReason
          )
          if (obj) {
            return obj.label
          }
          return ''
        }
      },
      {
        prop: 'dnRefuseRemark',
        label: '船公司费用确认拒绝备注',
        width: 150,
        type: 'text',
        isTooltip: true
      },
      {
        prop: 'pricingRemark',
        label: '商务备注',
        width: 150,
        type: 'text',
        isTooltip: true
      }
    ]
    this.option1.columns = columns
    /*获取列表数据*/
    // this.getData()
  },

  methods: {
    handleUpdate(row) {
      this.billNo = row.billNo
      this.updateBillShow = true
    },
    // 关闭更新账单弹框
    closeUpdateBill() {
      this.updateBillShow = false
    },
    // 商务审核
    async handleAudit() {
      if (this.multipleSelection.length === 0)
        return this.$message.warning('请选择要推送的账单!')
      let data = this.multipleSelection.map(item => item.billNo)
      let res = await blBillPricingCheck(data)
      if (res.msg === 'success') {
        this.$message.success('推送成功!')
        this.getData()
      }
    },
    // 预览
    viewFile(row, index) {
      let fileNo = row.fileNo.split(',')[index]
      let fileName = row.fileName.split(',')[index]
      this.$store.dispatch('order/previewFile', { fileNo, fileName })
    },

    handleImportBill() {
      this.dialogOrderShow = true
    },
    closeImportBill() {
      this.dialogOrderShow = false
    },
    /*搜索方法*/
    search() {
      this.tableQuery.currPage = 1
      this.getData(true)
      this.rightFilterBtns = [false, false, false, false, false]
      this.$set(this.rightFilterBtns, 0, true)
    },
    // 获取数据列表
    getData(isSearch, index) {
      let data = {
        currPage: this.tableQuery.currPage,
        pageSize: this.tableQuery.pageSize,
        columns: [],
        query: []
      }
      this.searchOption.addFilter.searchInputGroup.forEach(item => {
        let { key, value, range, req, valueReq } = item
        if (range && (range.min || range.max)) {
          if (range.min) {
            data.query.push({
              column: key + 'Min',
              type: 'eq',
              value: range.min
            })
          }
          if (range.max) {
            data.query.push({
              column: key + 'Max',
              type: 'eq',
              value: range.max
            })
          }
          return
        }
        if (valueReq && item[valueReq]) {
          data.query.push({
            column: valueReq,
            type: 'eq',
            value: item[valueReq]
          })
          return
        }
        if (value) {
          if (value instanceof Array) {
            if (
              key === 'billDate' ||
              key === 'checkBfDate' ||
              key === 'createdTime' ||
              key === 'bdConfirmTime'
            ) {
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
            }
          } else {
            data.query.push({
              column: key,
              value: value,
              type: 'eq'
            })
          }
        }
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (index) {
        let confirmStatus = ['', 'draft', 'submit', 'pass', 'refuse']
        data.query.push({
          column: 'dnCheckStatus',
          value: confirmStatus[index],
          type: 'eq'
        })
      }
      data.descColumns = ['createdTime']
      //处理逗号分割的多个订单号
      data.query.map(item => {
        if (['orderNo', 'universalNo'].includes(item.column)) {
          // item.type = 'in'
          item.type = 'like'
          item.value = item.value
            .split(/[,|，|\s]/)
            .filter(Boolean)
            .join('#')
        }
      })
      if (!this.initStatus) return
      this.option1.loading = true
      blBillPageList(data)
        .then(res => {
          this.option1.loading = false
          this.option1.data = res.data.list
          this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          this.option1.pagination.totalCount = res.data.totalCount

          
          this.option1.pagination.hasNextPage = res.data.hasNextPage
          this.option1.pagination.hasPreviousPage = res.data.hasPreviousPage
          this.option1.pagination.isFirstPage = res.data.isFirstPage
          this.option1.pagination.isLastPage = res.data.isLastPage
          this.option1.pagination.total = res.data.totalCount
          this.tableQuery.currPage = res.data.currPage
          this.tableQuery.pageSize = res.data.pageSize


          this.$set(this.option1, 'emptyText', '未查询到任何数据')
        })
        .catch(err => {
          this.option1.loading = false
        })
    },
    // 分页方法
    handleSizeChange(val) {
      // this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页方法
    handleCurrentChange(val) {
      // this.option1.pagination.currPage = val
      this.getData()
    },
    // 商务下拉框
    getEmployeeList(queryString, item) {
      employeeSelectlist({ name: queryString }).then(res => {
        item.remoteSelectList = res.data.map(item => {
          return {
            label: item.cname,
            value: item.employeeId
          }
        })
      })
    },
    // 远程搜索港口下拉数据
    portSearch(queryString, item, port) {
      let data = {
        queryString,
        portAttribute: port
      }
      this.$store.dispatch('dict/basePortList', data).then(data => {
        item.remoteSelectList = data.map(item => {
          return {
            label: item.value,
            value: item.portId
          }
        })
      })
    },
    // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString, item) {
      this.$store
        .dispatch('dict/baseSystemLineList', { name: queryString, state: '' })
        .then(data => {
          item.remoteSelectList = data.map(item => {
            return {
              label: item.value,
              value: item.key
            }
          })
        })
    },
    // 跳转订单详情
    showOrderDetail(row) {
      let orderNo = row.orderNo
      this.showOneNoDetail('order', orderNo)
    },
    // 右边筛选操作
    rightFilterAction(index) {
      //重置当前页为1
      this.option1.pagination.currPage = 1
      this.getData(true, index)
      this.rightFilterBtns = [false, false, false, false, false]
      this.$set(this.rightFilterBtns, index, true)
    },
    // 选择列表
    sendMulti(data) {
      this.multipleSelection = data
    },
    // 显示提示框
    showColumnDetail(params) {
      this.showColumnDetailHandle(params)
    },

    // 编辑账单
    handleEdit(row) {
      this.orderImportForm = Object.assign({}, this.orderImportForm, row)
      this.orderImportForm.podName = `${this.orderImportForm.polPortName}/${this.orderImportForm.podPortName}`
      let soNosArr = this.orderImportForm.soNos
      if (soNosArr) {
        let soNos = soNosArr.split(',')
        this.orderImportForm.soNos = soNos
        this.orderImportForm.soNoList = soNos
      }
      this.fileListEdit = [
        {
          name: this.orderImportForm.fileName,
          url: this.orderImportForm.fileNo
        }
      ]
      this.dialogOrderShow = true
    },

    // 撤回
    handleRecall(row) {
      this.handleCancelAudit(row)
    },
    // 撤回商务审核
    async handleCancelAudit(row) {
      let res = await blBillCancelBill(row.billNo)
      if (res.msg === 'success') {
        this.$message.success('撤回成功!')
        this.getData()
      }
    },
    handleDelete(index, row) {
      this.$confirm('是否删除该数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          blBillDelete({ billNo: row.billNo }).then(res => {
            this.$message.success('删除成功!')
            this.getData()
          })
        })
        .catch(err => {})
    },

    // 查询新增账单信息
    orderInfoFn() {
      let { bizNoType, bizNo } = this.orderImportForm
      let data = {
        bizNoType,
        bizNo
      }
      orderInfo(data)
        .then(res => {
          if (res.code === 0 && res.data.length) {
            this.orderNoArr = res.data
          } else {
            this.$confirm('找不到对应单号，请核实单号是否正确！', '查询失败', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {})
              .catch(err => {})
          }
        })
        .catch(() => {})
    },

    // 船名输入建议
    querySearchVessel(queryString, item) {
      this.$store
        .dispatch('dict/queryVessleList', { name: queryString })
        .then(data => {
          if (data.length) {
            item.remoteSelectList = data.map(ele => {
              return {
                label: ele.key,
                value: ele.value
              }
            })
          }
        })
    },
    // 航次输入建议
    querySearchVoyage(queryString, item) {
      this.$store
        .dispatch('dict/queryVoyageList', { name: queryString })
        .then(data => {
          if (data.length) {
            item.remoteSelectList = data.map(ele => {
              return {
                label: ele.key,
                value: ele.value
              }
            })
          }
        })
    }
  }
}
</script>

<style lang="scss">
.empty-table-fixed {
  .el-table__empty-text {
    position: fixed;
    left: 30%;
  }
}
.bill-list-update span {
  color: #1890ff !important;
}
.bill-list-delete span {
  color: #ff0000 !important;
}
</style>
