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
        <div class="money-box-left">
          <el-button type="primary" @click="handleAdd" size="mini">新建</el-button>
          <!-- <el-button @click="handleExport" size="mini">导出</el-button> -->
          <el-button @click="handleCustomColumns" size="mini">自定义表头</el-button>
          <el-button @click="handleCheck" size="mini">撞客查询</el-button>
        </div>
        <div class="money-box-right">
          <el-radio-group v-model="verifyStatus" size="mini">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="draft">未提交</el-radio-button>
            <el-radio-button label="submit">待审核</el-radio-button>
            <el-radio-button label="pass">已审核</el-radio-button>
            <el-radio-button label="refuse">已拒绝</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <FinanceTable :option="option1" :autoMax="true" />
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
    <CrmDialogTable :option="dialogOption" @close="dialogClose" />
  </div>
</template>
<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns'
import CrmDialogTable from '@/views/crm/components/crmDialogTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { supplierListTable } from '@/views/crm/data'
import RECYCLE from '@/api/crm/recycle'
import SUPPLIER from '@/api/crm/supplier'

export default {
  name: 'customerList',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns,
    CrmDialogTable,
  },
  data() {
    return {
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
      dialogOption: {
        show: false,
        title: '撞客查询',
        width: '600px',
        searchOption: { columns: [{ label: '供应商名称', prop: 'name', type: 'input' }], data: { name: '' } },
        tableOption: {
          getData: () => {
            // if (!this.dialogOption.searchOption.data.name.trim()) return
            SUPPLIER.collision(this.dialogOption.searchOption.data).then((res) => {
              this.dialogOption.tableOption.data.splice(0, 1000, ...(res.data || []))
            })
          },
          title: '供应商信息',
          columns: [
            { prop: 'name', label: '供应商名称', minWidth: 150 },
            {
              prop: 'deptCname',
              label: '维护部门及业务',
              width: 180,
              formatter: ({ row: { employeeVos } }) => {
                return (employeeVos || [])
                  .filter((item) => item)
                  .reduce((cur, next) => {
                    return cur + next.deptCname + '，' + next.cname + '； '
                  }, '')
              },
            },
            { prop: 'createdName', label: '创建人' },
            {
              prop: 'status',
              label: '供应商状态',
              type: 'select',
              selectOptions: [
                { label: '已维护', value: 'valid' },
                { label: '待认领', value: 'recycle' },
                { label: '黑名单', value: 'blacklist' },
              ],
            },
            // {
            //   prop: 'diy_btn',
            //   label: '操作',
            //   type: 'button',
            //   formatter: (a, row) => (row.status === 'recycle' ? '认领' : ''),
            //   operationBtns: {
            //     show: true,
            //     callback: (fn, index, { supplierId: custid }, option) => {
            //       RECYCLE.claim({ custid }).then((res) => {
            //         this.$msgSucClose('认领成功')
            //       })
            //     },
            //   },
            // },
          ],
          data: [],
        },
      },
      // 初始自定义表头
      selfColumnsBase: supplierListTable.map((item) => {
        let target = { ...item, hasTag: item.prop === 'name' }
        if (item.cDisabled) target.disabled = true
        if (target.callback) target.callback = (row) => this.showDetail(row)
        return target
      }),
      isManager: false, // 管理者
      isSps: false, // 管理者
      userId: '', //当前用户id
    }
  },
  watch: {
    verifyStatus(val) {
      this.handleCurrentChange(1)
    },
  },
  activated() {
    // this.handleCurrentChange(1)
    // this.getData()
    this.$nextTick(() => this.getData())
  },
  created() {
    // 是否是管理者
    let roles = this.$store.state.user.roles || []
    this.isManager = roles.includes('manager')
    this.isSps = roles.includes('sps')
    this.userId = this.$store.state.user.userId
    // 搜索配置
    let searchObj = {}
    supplierListTable.forEach((v) => {
      // if (v.searchHide || v.prop == 'mtEmployeeName') return
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
    let operationBtns = {
      ...this.option.operationBtns,
      width: '100px',
      data: [
        { label: '详情', action: 'showDetail', show: true },
        { label: '删除', action: 'Delete', 	showFn: row => {
          let {verifyStatus, status, createdBy} = row
          let userId = this.$store.state.user.userId
          return ['draft','refuse'].includes(verifyStatus) && status === 'create' && userId === createdBy
        } },
      ],
    }
    this.option1 = { ...this.option, id: 'option1', pagination, selection: false, noClickCheck: true, operationBtns }
    // 自定义表头
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = [
      // {
      //   prop: '',
      //   label: ' ',
      //   type: 'tag',
      //   width: '30px',
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
    handleDelete($index, row, option) {
      let userId = this.$store.state.user.userId
      if (userId !== row.createdBy) {
        return this.$msgErrClose('非本人创建,不能删除!')
      }
      this.$confirm(`是否确认删除此供应商户?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(()=>{
        // 删除供应商方法
        this.deleteSupplier(row)
      }).catch(()=>{})
    },
    // 删除供应商方法
    deleteSupplier(row) {
      let { supplierId } = row
      let data = {
        supplierId
      }
      SUPPLIER.delete(data).then(res => {
        if (res.code === 0) {
          this.$msgSucClose('删除供应商成功')
          this.getData()
        }
      }).catch(()=>{})
    },
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
      let timeStamp = +new Date()
      if (this.timeStamp && timeStamp - this.timeStamp < 100) {
        return
      }
      this.timeStamp = +new Date()
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        verifyStatus: this.verifyStatus,
        descColumns: ['supplierId'],
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
      SUPPLIER.mySupplierList(reqData)
        .then(({ data }) => {
          if (data.configColumns && data.configColumns.length) {
            let columns = data.configColumns
            let optionColumns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
            this.option1.columns.splice(0, 100, ...optionColumns)
            this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
            this.configColumns = data.configColumns
          }
          //我的客户列表显示'改'字、'拒'字，"status": "valid","verifyStatus": "pass"|refuse拒&改|submit改
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
          // console.log(this.option1)
          this.option1.pagination.currPage = data.currPage
          this.option1.pagination.pageSize = data.pageSize
          this.option1.pagination.totalCount = data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    handleAdd() {
      this.$store.dispatch('crm/supplier/addCustomer')
      this.routerPush('AddSupplier')
    },
    handleExport() {
      this.lsLoading = true
      SUPPLIER.mySupplierListExport(this._exportSearchData)
        .then((res) => {
          window.open(res.data.filePath)
        })
        .finally(() => (this.lsLoading = false))
    },
    handleCustomColumns() {
      this.customColumnsPopShow = true
    },
    showDetail({ supplierId: custid, orgid, status, name, verifyStatus, mtEmployeeId, createdBy }) {
      // 我的客户详情页 | 已拒绝详情
      // 未提交->新建客户
      if (verifyStatus == 'draft') {
        this.$store.commit('crm/supplier/setCustid', custid)
        this.$store.commit('crm/supplier/setOrgid', orgid)
        return this.routerPush('AddSupplier')
        // return this.routerPush('AddSupplier',{},{isTab: true})
      }
      // 待审核->新建客户
      if (verifyStatus == 'submit' && status == 'create') {
        return SUPPLIER.verifyStatusInfo({ supplierId: custid }).then(({ data }) => {
          this.$store.commit('crm/supplier/setVerifierInfo', {
            name: data.verifierName,
            entName: data.name,
            op: data.createdName,
            date: data.updatedTime,
          })
          this.routerPush('AddSupplier', { status: 3 })
          // this.routerPush('AddSupplier', { status: 3 },{isTab: true})
        })
      }
      this.$store.commit('crm/supplier/setDetailCustid', custid)
      this.$store.commit('crm/supplier/setDetailIsEdit', false)
      this.$store.commit('crm/supplier/setDetailEditInfo', {})
      // 判断是自己的还是下属的
      // let isEmployee = (mtEmployeeId||createdBy)  === this.userId
      // if (this.isManager && !isEmployee) {
      //   this.routerPush('SupplierDetail2', { custid })
        // this.routerPush('SupplierDetail2', { custid },{isTab: true})
        // } else if (this.isSps && !isEmployee && this.verifyStatus !== 'refuse') {
        //   if (verifyStatus == 'submit') {
        //     return this.routerPush('SupplierReviewDetail', { custid })
        //   }
        //   this.routerPush('SupplierReviewDetail', { custid, refuse: verifyStatus == 'pass' ? '' : true })
      // } else {
        // this.routerPush('SupplierReviewDetailPass', { custid })
        this.routerPush('SupplierDetail', { custid })
        // this.routerPush('SupplierDetail', { custid },{isTab: true})
      // }
      // return this.routerPush('SupplierDetail', { custid })
    },
    handleCheck() {
      this.dialogOption.show = true
    },
    dialogClose() {
      this.dialogOption.show = false
      this.dialogOption.searchOption.data.name = ''
      this.dialogOption.tableOption.data.splice(0, 1000)
    },
  },
}
</script>
<style scoped>
.finance-page{
  	-moz-user-select: none; /*火狐*/
	  -webkit-user-select: none; /*webkit浏览器*/
	  -ms-user-select: none; /*IE10*/
	  -khtml-user-select: none; /*早期浏览器*/
	  -o-user-select:none;
	  user-select: none;
}
</style>
