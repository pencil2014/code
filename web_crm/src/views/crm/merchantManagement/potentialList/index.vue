<template>
  <div
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    class="finance-page"
    v-loading="lsLoading"
  >
    <FinanceSearch :border="true" :searchOption="searchOption1" @search="search" />
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <!-- <el-button @click="handleExport" size="mini">导出</el-button> -->
          <el-button @click="handleCustomColumns" size="mini">自定义表头</el-button>
          <el-button @click="ShowUploadDialog" size="mini" v-show="custMode==='order'">上传合同附件</el-button>
        </div>
        <div class="money-box-right">
          <!-- @change="handleCurrentChange(1, true)" -->
          <el-radio-group  size="mini" v-model="verifyStatus">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="draft">草稿</el-radio-button>
            <el-radio-button label="valid">有效</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <FinanceTable :autoMax="true" :option="option1" @send-multi="sendMulti" />
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
        ref="CustomColumns"
      />
    </div>
    <template v-if="contractFile.show">
      <ContractFile
        :option="contractFile"
        @cancel="closeContractFile"
        @submit="submitContractFile"
      />
    </template>
  </div>
</template>
<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { customerListTable as customerListTable2 } from '@/views/crm/data'
import CUSTOMER from '@/api/crm/customer'
import { departmentTreeList } from '@/api/companyResource'
import { listByRole } from '@/api/base'
import ContractFile from './uploadFile.vue'
import { getContractNos, saveAttachments } from '@/api/crm/contract'
const ROLELIST = []
const ROLEOBJ = {}
const customerListTable = customerListTable2.map(v => {
  const item = { ...v }
  if (item.prop == 'roleTypeInfo') {
    item.selectOptions = ROLELIST
    item.selectOptionsObj = ROLEOBJ
  }
  return item
})
export default {
  name: 'customerList',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns,
    ContractFile
  },
  data() {
    return {
      custMode: 'order',
      name: 'customerList',
      // 列表类型
      verifyStatus: 'all',
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption1: {},
      // 初始自定义表头
      // selfColumnsBase: [...customerListTable.filter((item) => !item.potentialHide)],
      selfColumnsBase: customerListTable.filter(ele => ele.prop !=='verifyTime').map(item => {
        const target = { ...item }
        if (target.callback) target.callback = row => this.showDetail(row)
        if (target.prop === 'name') { target.hasTag = true }
        return target
      }),
      departmentList: [],
      multipleSelection: [],
      contractFile: {
        show: false,
        contractNoList: []
      }
    }
  },
  // watch: {
  //   verifyStatus(val) {
  //     this.handleCurrentChange(1)
  //   },
  // },
  activated() {
    // this.handleCurrentChange(1)
    this.getData()
  },
  created() {
    // 获取部门信息
    this.loanBasicData()
    ROLELIST.splice(
      0,
      100,
      // {
      //   label: '潜在客户',
      //   value: 'potential',
      //   disabled: this.custMode === 'order'
      // },
      ...this.dictMap.customerRole.map(v => ({
        ...v,
        // disabled: v.value === 'potential'
      }))
    )
    ROLELIST.forEach(item => {
      ROLEOBJ[item.value] = item.label
    })
    // 搜索配置
    const searchObj = {}
    customerListTable.forEach(v => {
      let prop = v.prop
      let label = v.label
      if (prop == 'deptCname2'|| prop === 'verifyTime') return
      if (prop == 'deptCname3'|| prop === 'verifyTime') return
      if (prop == 'verifyStatus') return
      if (prop == 'deptCname') {
        prop = 'bdEmployeeName'
        searchObj[prop] = {
          ...v,
          prop,
          label: '维护人',
          type: v.sType || v.type || 'input',
        }
        searchObj[prop].type = 'remoteSelect'
        searchObj[prop].remoteSelectList = []
        searchObj[prop].remoteMethod = (name, item) => {
          // let query = [{ column: 'roleCode', type: 'in', value: 'bd,obd' }]
          const query = []
          name && query.push({ column: 'name', type: 'eq', value: name })
          listByRole({ currPage: 1, pageSize: 200, query }).then(
            ({ data: { list }}) => {
              const arr = list.map(v => ({
                ...v,
                label: `${v.cname}(${v.employeeNo})`,
                value: v.employeeId
              }))
              item.remoteSelectList.splice(0, 1000, ...arr)
            }
          )
        }
        prop = 'deptCode'
        searchObj[prop] = {
          ...v,
          prop,
          label: '维护部门',
          type: 'diyCascader',
          cascaderList: this.departmentList,
          cascaderProps: {
            children: 'childList',
            label: 'deptCname',
            value: 'deptCode',
            checkStrictly: true,
          },
        }
      } else {
        searchObj[prop] = {
          ...v,
          prop,
          type: v.sType || v.type || 'input',
          label: v.sLabel || label
        }
      }
    })
    this.searchOption1 = {
      saveDefault: true,
      addFilter: {
        defaultSearchLength: 9,
        searchInputGroup: [
          { key: 'name', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'custClass', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'roleTypeInfo', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'indexAddr', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'firstTime', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'nearlyTime', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'bdEmployeeName', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'deptCode', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'regSource', value: '', showType: '1', range: { min: '', max: '' } },
        ],
        filterGroups: { ...searchObj },
        dateArr: ['setupDate', 'usccExpDate', 'firstTime', 'nearlyTime'],
        callback: true
      }
    }
    // 表格配置
    const pagination = { ...this.option.pagination, show: true }
    let operationBtns = {
      ...this.option.operationBtns,
      width: '100px',
      data: [
        { label: '详情', action: 'showDetail', show: true },
        {
          label: '删除',
          action: 'Delete',
          showFn: (row) => {
            let { verifyStatus } = row
            let isCts = this.$store.state.user.roles.includes('cts')
            return (
              isCts && ['pass','create'].includes(verifyStatus)
            )
          },
        },
      ],
    }
    this.option1 = {
      ...this.option,
      id: 'option1',
      pagination,
      selection: { show: true, fixed: true },
      operationBtns
    }
    // 自定义表头
    const columns = [...this.selfColumnsBase.map(item=>{
        if (item.prop == 'roleTypeInfo') {
          item.selectOptions = this.dictMap.customerRole.concat({label:'公司部门', value:'department'})
          item.selectOptionsObj = {...this.dictMapObj.customerRole, department:'公司部门'}
        }
        if (item.prop == 'custClass') {
          item.selectOptions = this.dictMap.customerClassNew.concat({label:'独立结算部门', value:'department'})
          item.selectOptionsObj = {...this.dictMapObj.customerClassNew, department:'独立结算部门'}
        }
        return item
    })]
    this.configColumns.push(...this.selfColumnsBase.map(item => item.prop))
    this.option1.columns = columns
    // this.getData()
  },
  methods: {
    handleDelete($index, row, option) {
      this.$confirm(`是否确认删除此客户?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          // 删除客户方法
          this.deleteCustomer(row)
        })
        .catch(() => {})
    },
    // 删除客户方法
    deleteCustomer(row) {
      let { custid, orgid } = row
      let data = {
        custid,
        orgid
      }
      CUSTOMER.deleteCustomer(data)
        .then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('删除客户成功')
            this.getData()
          }
        })
        .catch(() => {})
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    handleCurrentChange(val, custMode) {
      // if (custMode === true) {
      //   if (this.searchBackup) {
      //     this.searchBackup = this.searchBackup.filter(
      //       v => v.column !== 'roleTypeInfo'
      //     )
      //   }
      //   this.searchOption1.addFilter.searchInputGroup.forEach(item => {
      //     if (item.key === 'roleTypeInfo') item.value = []
      //   })
      //   if (this.custMode === 'potential') {
      //     ROLELIST.forEach(item =>
      //       this.$set(item, 'disabled', item.value === 'client')
      //     )
      //   } else {
      //     ROLELIST.forEach(item =>
      //       this.$set(item, 'disabled', item.value === 'potential')
      //     )
      //   }
      // }
      this.option1.pagination.currPage = val
      this.getData()
    },
    search(query) {
      this.option1.pagination.currPage = 1
      this.getData(query)
    },
    getData(query) {
      this.lsLoading = true
      let verifyStatus = this.verifyStatus
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        verifyStatus: verifyStatus == 'potential' ? 'pass' : verifyStatus,
        custMode:
          verifyStatus == 'pass'
            ? 'order'
            : verifyStatus == 'potential'
            ? 'potential'
            : '',
      }
      // const data = {
      //   currPage: this.option1.pagination.currPage,
      //   pageSize: this.option1.pagination.pageSize,
      //   custMode: this.custMode,
      //   verifyStatus: 'pass',
      //   // status: this.verifyStatus == '' ? 'valid' : 'create',
      // }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }

      if (query) this.searchBackup = query
      data.query = this.searchBackup || []
      // 处理企业类别
      const obj = data.query.find(item => item.column == 'roleTypeInfo')
      if (obj && obj.value) {
        const arr = obj.value.split(',')
        if (arr.indexOf('potential') > -1) {
          data.roleType = arr.filter(v => v !== 'potential').join(',')
          data.queryCustMode = 'potential'
        } else {
          data.roleType = obj.value
        }
      }
      data.query = data.query.filter(v => v.column !== 'roleTypeInfo')
      const bdEmployeeName = data.query.find(
        item => item.column == 'bdEmployeeName'
      )
      if (bdEmployeeName) data.bdEmployeeId = bdEmployeeName.value
      const deptCode = data.query.find(item => item.column == 'deptCode')
      if (deptCode) data.deptCode = deptCode.value[deptCode.value.length - 1]
      // console.log(data)
      const reqData = {
        ...data,
        query: data.query.filter(v => v.column !== 'bdEmployeeName')
      }
      this._exportSearchData = reqData
      CUSTOMER.myCustomerList(reqData)
        .then(({ data }) => {
          if (data.configColumns && data.configColumns.length) {
            const columns = data.configColumns
            this.option1.columns = columns
              .map(prop =>
                this.selfColumnsBase.find(item => item.prop === prop)
              )
              .filter(v => v)
            this.selfColumnsBase.filter(item => columns.indexOf(item.prop) > -1)
            this.configColumns = data.configColumns
          }
          const arrRole = ['department', 'order']
          this.option1.data = data.list.map(item => {
            let _tagArr = []
            item.roleTypeInfo = item.roleTypeInfo === 'potential' ? '潜在客户' : item.roleTypeInfo
            if (item.recycle === 'yes') {
               _tagArr = [{ text: '新', type: 'change' }]
            }
            if (item.isWhitelist === 'yes') {
              _tagArr.push({ text: '白', type: 'tag-pass',img:true })
            }
            if (item.isBlacklist === 'yes') {
              _tagArr = [{ text: '黑', type: 'black' }]
            }
            return {
              ...item,
              roleTypeInfo: arrRole.indexOf(item.roleTypeInfo) > -1 ? '' : item.roleTypeInfo,
              _tagArr
            }
          })
          this.option1.pagination.currPage = data.currPage
          this.option1.pagination.pageSize = data.pageSize
          this.option1.pagination.totalCount = data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    handleExport() {
      this.lsLoading = true
      CUSTOMER.customerListExport(this._exportSearchData)
        .then(res => {
          window.open(res.data.filePath)
        })
        .finally(() => (this.lsLoading = false))
    },
    handleCustomColumns() {
      this.customColumnsPopShow = true
    },
    showDetail({ custid, name }) {
      console.log('客服部')
      this.routerPush(
        'PotentialDetail',
        { custid, custMode: this.custMode },
        { isTab: true }
      )
      // 打开新页面
      // let routeUrl = this.$router.resolve({
      //   name: 'PotentialDetail',
      //   query: { custid, custMode: this.custMode, name},
      //   params: { isTab: true }
      // })
      // window.open(routeUrl.href, '_blank')
    },
    // 所属部门下拉框
    loanBasicData() {
      departmentTreeList({ state: 'valid' }).then(res => {
        this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      // data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      data.forEach((item) => {
        if (item.childList.length) {
          item.childList = this.getTreeData(item.childList)
        } else {
          item.childList = undefined
        }
      })
      // data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
    },
    // 选择表格
    sendMulti(data) {
      this.multipleSelection = data
    },
    // 上传合同附件
    ShowUploadDialog() {
      const len = this.multipleSelection.length
      if (!len) {
        return this.$msgErrClose('请先选择客户数据再上传合同附件')
      }
      if (len > 1) {
        return this.$msgErrClose('一次只能选择一条数据上传合同附件')
      }
      this.getContractNos()
    },
    // 查询合同编号
    getContractNos() {
      const { custid } = this.multipleSelection[0]
      const data = {
        custid,
        contractNo: ''
      }
      getContractNos(data)
        .then(res => {
          if (res.code === 0) {
            const list = res.data.filter(item => item.contractNo)
            if (list.length) {
              this.contractFile.contractNoList = list
              this.contractFile.show = true
            } else {
              this.$msgErrClose('该客户没有主合同信息，无法上传附件!')
            }
          }
        })
        .catch(() => {})
    },
    // 关闭上传合同弹窗
    closeContractFile() {
      this.contractFile = {
        show: false,
        contractNoList: []
      }
    },
    // 提交合同附件
    submitContractFile(data) {
      saveAttachments(data)
        .then(res => {
          if (res.code === 0) {
            this.$msgSucClose('合同附件上传成功！')
            this.closeContractFile()
            this.getData()
          }
        })
        .catch(() => {})
    }
  },
  watch: {
    verifyStatus(val) {
      if (val === 'pass') {
        this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
          if (item.key === 'roleTypeInfo')
            item.value = item.value?.filter
              ? item.value.filter((v) => v !== 'potential')
              : ''
        })
        ROLELIST.forEach((item) =>
          this.$set(item, 'disabled', item.value === 'potential'),
        )
      } else if (['potential','draft','submit','refuse'].includes(val)) {
        this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
          if (item.key === 'roleTypeInfo')
            item.value = item.value?.filter
              ? item.value.filter((v) => v === 'client')
              : ''
        })
        ROLELIST.forEach((item) =>
          this.$set(item, 'disabled', item.value === 'client'),
        )
      } else {
        ROLELIST.forEach((item) => this.$set(item, 'disabled', false))
      }
      this.handleCurrentChange(1)
    },
  }
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
