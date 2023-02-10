<template>
    <div
      class="finance-page"
      v-loading="lsLoading"
      :element-loading-text="eLoadingText"
      :element-loading-spinner="eLoadingSpinner"
      :element-loading-background="eLoadingBackground"
    >
      <FinanceSearch :searchOption="searchOption1" @search="search" :border="true" ref="searchComp"/>
      <div class="finance-list-container">
        <div class="money-box">
          <div>
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
    </div>
  </template>
  <script>
  import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
  import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
  import CustomColumns from '@/components/customColumns/index'
  import CrmDialog from '@/views/crm/components/crmDialog'
  import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
  import { routerMixin } from '@/views/finance/mixins/routerMixin'
  import { supplierVerifyListTable } from '@/views/crm/data'
  import SUPPLIER from '@/api/crm/supplier'
  import { departmentTreeList } from '@/api/companyResource'
  import { listByRole } from '@/api/base'
  
  export default {
    name: 'supplierBankReview',
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
        verifyStatus: 'submit',
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
        // 初始自定义表头
        selfColumnsBase: supplierVerifyListTable.map((item) => {
          let target = { ...item, hasTag: item.prop === 'name' }
          if (item.cDisabled) target.disabled = true
          if (target.callback) target.callback = (row) => this.showDetail(row)
          return target
        }),
        departmentList: [],
        // ascColumns: [],
        // descColumns: [],
      }
    },
    computed: {
      noSubmit() {
        return !this.multipleSelection.find((item) => item.verifyStatus === 'submit')
      },
    },
    watch: {
      verifyStatus(val) {
        this.handleCurrentChange(1)
      },
    },
    created() {
      // 获取部门信息
      this.loanBasicData()
      // 搜索配置
      let searchObj = {}
      supplierVerifyListTable.forEach((v) => {
        let prop = v.prop
        let label = v.label
        if (prop == 'deptCname2')  return
        if (prop == 'deptCname3')  return
        if (prop == 'verifyStatus') {
          return
          // searchObj[prop] = {
          //   ...v,
          //   selectOptions: this.$store.state.dict.dictMap['verifyStatus'].filter(item => item.value !== 'draft'),
          // }
        }else if (prop == 'deptCname') {
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
            let query = []
            name && query.push({ column: 'name', type: 'eq', value: name })
            listByRole({ currPage: 1, pageSize: 200, query }).then(({ data: { list } }) => {
              let arr = list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
              item.remoteSelectList.splice(0, 1000, ...arr)
            })
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
            label: v.sLabel || label,
          }
        }
      })
      this.searchOption1 = {
        addFilter: {
          defaultSearchLength: 2,
          searchInputGroup: [
            { key: 'name', value: '', showType: '1', range: { min: '', max: '' } },
            { key: 'verifyType', value: '', showType: '1', range: { min: '', max: '' } },
          ],
          filterGroups: { ...searchObj },
          dateArr: ['createdTime', 'verifyTime'],
          callback: true,
        },
      }
      // 表格配置
      let pagination = { ...this.option.pagination, show: true }
      this.option1 = {
        ...this.option,
        id: 'option1',
        pagination ,
        sortable: true,
        selection: false, 
        sortChange: (column, prop, order) => {
        //   this.descColumns = order == 'descending' ? [prop] : []
        //   this.ascColumns = order == 'ascending' ? [prop] : []
          this.getData()
        }
      }
      // 自定义表头
      let columns = [...this.selfColumnsBase.map(item=>{
          if (item.prop == 'roleTypeInfo') {
            item.selectOptions = this.dictMap.customerRole.concat({label:'公司部门', value:'department'})
            item.selectOptionsObj = {...this.dictMapObj.customerRole, department:'公司部门'}
          }
          if (item.prop == 'custClass') {
            item.selectOptions = this.dictMap.customerClassNew.concat({label:'独立结算部门', value:'department'})
            item.selectOptionsObj = {...this.dictMapObj.customerClassNew, department:'独立结算部门'}
          }
          if (!['firstTime', 'nearlyTime','custLevel','verifyTime'].includes(item.prop)) {
            item.sortable = false
          }
          return item
      })]
      this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
      this.option1.columns = [
        ...columns,
      ]
    },
    activated () {
      this.search()
    },
    methods: {
      handleSizeChange(val) {
        let query = this.$refs.searchComp.addFilterSearch()
        this.option1.pagination.pageSize = val
        this.getData(query)
      },
      handleCurrentChange(val) {
        let query = this.$refs.searchComp.addFilterSearch()
        this.option1.pagination.currPage = val
        this.getData(query)
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
          status: this.verifyStatus == 'pass' ? 'valid' : '',
        //   ascColumns: this.ascColumns,
        //   descColumns: this.descColumns,
        }
        if (this.customColumnsKeys && this.customColumnsKeys.length) {
          data.columns = this.customColumnsKeys
        }
        if (query) {
          this.searchBackup = query
          this.searchBackup.map(item=>{
            if(item.column == 'createdTime' && item.type == 'ge'){
              data.createStartTime = item.value
            }else if(item.column == 'createdTime' && item.type == 'le'){
              data.createEndTime = item.value
            }else if(item.column == 'verifyTime' && item.type == 'ge'){
              data. verifyStartTime = item.value
            }else if(item.column == 'verifyTime' && item.type == 'le'){
              data. verifyEndTime = item.value
            }else{
              return data[item.column] = item.value
            }
          })
        }
        data.query = this.searchBackup || []
        // 处理企业类别
        let obj = data.query.find((item) => item.column == 'roleTypeInfo')
        if (obj && obj.value) {
          let arr = obj.value.split(',')
          if (arr.indexOf('potential') > -1) {
            data.roleType = arr.filter((v) => v !== 'potential').join(',')
            data.queryCustMode = 'potential'
          } else {
            data.roleType = obj.value
          }
        }
        data.query = data.query.filter((v) => v.column !== 'roleTypeInfo')
        // 处理维护人
        let bdEmployeeName = data.query.find((item) => item.column == 'bdEmployeeName')
        if (bdEmployeeName) data.bdEmployeeId = bdEmployeeName.value
        // 处理部门
        let deptCode = data.query.find((item) => item.column == 'deptCode')
        if (deptCode) data.deptCode = deptCode.value[deptCode.value.length - 1]
        // console.log(data)
        this._exportSearchData = data
        let reqData = { ...data, query: data.query.filter((v) => v.column !== 'bdEmployeeName') }
        this._exportSearchData = reqData
        SUPPLIER.verifyList(reqData)
          .then(({ data }) => {
            if (data.configColumns && data.configColumns.length) {
              if (JSON.stringify(this.configColumns) !== JSON.stringify(data.configColumns)) {
                let columns = data.configColumns
                let optionColumns = columns.map((k) => this.selfColumnsBase.find(({ prop }) => prop === k)).filter((v) => v)
                this.option1.columns.splice(0, 100, ...optionColumns)
                this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
                this.configColumns = data.configColumns
              }
            }
            this.option1.data = data.list.map((item) => {
              let { verifyStatus, status, isWhitelist,verifyState } = item
              console.log('中国印钞造币集团有限公司',verifyState)
              item.roleTypeInfo = item.roleTypeInfo || ''
              item.roleTypeInfo = item.roleTypeInfo === 'potential' ? '潜在客户' : item.roleTypeInfo.replace('order','')
              let _tagArr=[], _isChanged, _isRefused
              if (verifyStatus == 'submit' && status == 'valid') {
                _isChanged = true
                _tagArr = [{ text: '改', type: 'change' }]
              }
              if (verifyStatus == 'refuse' || verifyState == 'refuse') {
                _isRefused = true
                _tagArr = [{ text: '拒', type: 'refuse' }]
              }
              if (isWhitelist === 'yes') {
                _tagArr.push({ text: '白', type: 'tag-pass',img:true })
              }
              return { ...item, _tagArr, _isChanged, _isRefused }
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
      _close(option, verifyStatus) {
        this.$refs[verifyStatus].$refs.form.resetFields()
        this.$nextTick(() => {
          this.$refs[verifyStatus].$refs.form.clearValidate()
        })
        this.$nextTick(() => {
          option.show = false
        })
      },
      handleExport() {
        this.lsLoading = true
        CUSTOMER.myVerifyCustomerListExport(this._exportSearchData)
          .then((res) => window.open(res.data.filePath))
          .finally(() => (this.lsLoading = false))
      },
      // handleCustomColumns() {
      //   this.customColumnsPopShow = true
      // },
      showDetail(row) {
        // 资质审核跳转
        if(row.verifyType === 'qualifications'){
          if (row.verifyStatus === 'submit') {
            this.routerPush('CustomerReviewDetail', { custid: row.custid })
          } else if (row.verifyStatus == 'pass') {
            this.routerPush('CustomerReviewDetailPass', { custid: row.custid })
          } else {
            this.routerPush('CustomerReviewDetailPass', { custid: row.custid, refuse: true })
          }
        }else if (row.verifyType === 'customer_relation') {
            this.routerPush('customerRelationshipAudit', { custid: row.custid, oid: row.oid, refuse: true, name: row.name, verifyStatus: row.verifyStatus})
        }else if (row.verifyType === 'cust_grade') {
            this.routerPush('CustLevelAppro', { custid: row.custid, oid: row.oid, refuse: true, name: row.name, verifyStatus: row.verifyStatus})
        }else if (row.verifyType === 'quality') {
            this.routerPush('customerSLAReviewDetail', { custid: row.custid, oid: row.oid,custName:row.name})
        }else{
          // 其他审核跳转
          this.routerPush('CustomerReviewDetailPass', { custid: row.custid,name:row.name,employeeId:row.employeeId})
        }
  
      },
      // 所属部门下拉框
      loanBasicData() {
        departmentTreeList({ state: 'valid' }).then((res) => {
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
        return data
      },
    },
  }
  </script>
  