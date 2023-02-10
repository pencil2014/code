<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch
      :searchOption="searchOption1"
      @search="search"
      :border="true"
    />
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button type="primary" @click="handleAdd" size="mini">
            新建
          </el-button>
          <!-- <el-button @click="handleExport" size="mini">导出</el-button> -->
          <el-button @click="handleCustomColumns" size="mini">
            自定义表头
          </el-button>
          <el-button @click="handleCheck" size="mini">撞客查询</el-button>
          <el-button
            v-if="isManager && ['pass', 'all'].includes(verifyStatus)"
            @click="releaseMulti"
            size="mini"
          >
            批量解绑
          </el-button>
          <el-button @click="addGer" size="mini">添加普通维护人</el-button>
        </div>
        <div class="money-box-right">
          <el-radio-group v-model="verifyStatus" size="mini">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="draft">草稿</el-radio-button>
            <el-radio-button label="valid">非草稿</el-radio-button>
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
        :props="{ key: 'prop', label: 'label' }"
        @close="customColumnsPopClose"
      />
    </div>
    <CrmDialogTable :option="dialogOption" @close="dialogClose" />
    <CrmDialog :option="dialogRemoveLeader" @close="removeClose" />
    <!-- 添加普通维护人 -->
    <CrmDialogTable :option="addGerOption" @close="addGerClose" />
  </div>
</template>
<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns'
import CrmDialogTable from '@/views/crm/components/crmDialogTable'
import CrmDialog from '@/views/crm/components/crmDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { customerListTable } from '@/views/crm/data'
import { baseEmployeeList, listByRole } from '@/api/base'
import RECYCLE from '@/api/crm/recycle'
import CUSTOMER from '@/api/crm/customer'
import { formatIndustry } from "@/utils/crm"
const ROLELIST = []
const ROLEOBJ = {}
const TROLELIST = []
const TROLEOBJ = {}
// 主管解绑后新维护人
const RNLIST = []

export default {
  name: 'customerList',
  mixins: [mixin, routerMixin],
  inject: ['defaultRules'],
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns,
    CrmDialogTable,
    CrmDialog,
  },
  data() {
    let removeCfg = {
      show: false,
      showClear: true,
      btnLoading: false,
      title: '解绑',
      text: '解绑',
    }
    return {
      name: 'customerList',
      // 列表类型
      verifyStatus: 'all',
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption1: {},
      selectData: [],
      // 列表页--动态组件--当前显示的组件
      query: {
        applyNo: '',
        confirmStatus: '',
        refuseReason: '',
      },
      dialogOption: {
        show: false,
        title: '撞客查询',
        width: '800px',
        searchOption: {
          columns: [{ label: '客户名称', prop: 'name', type: 'input' }],
          data: { name: '' },
        },
        tableOption: {
          getData: () => {
            // if (!this.dialogOption.searchOption.data.name.trim()) return
            CUSTOMER.collision(this.dialogOption.searchOption.data).then(
              (res) => {
                this.dialogOption.tableOption.data.splice(
                  0,
                  1000,
                  ...(res.data || []),
                )
              },
            )
          },
          title: '客户信息',
          columns: [
            { prop: 'name', label: '客户名称' },
            {
              prop: 'roleTypeInfo',
              width: 162,
              type: 'select',
              label: '企业类别',
              propInDict: 'customerRole',
              multi: true,
              noDict: true,
            },
            { prop: 'mtDate', label: '保有时间' },
            { prop: 'remark', label: '备注' },
            {
              prop: 'diy_btn',
              label: '操作',
              type: 'button',
              formatter: ({ row }) => (row.status === 'recycle' ? '认领' : ''),
              callback: (fn, index, { custid }, option) => {
                RECYCLE.claim({ custid }).then((res) => {
                  this.dialogOption.tableOption.getData()
                  this.$msgSucClose('认领成功')
                })
              },
            },
          ],
          data: [],
        },
      },
      genarId:'',
      addGerOption: {
        show: false,
        title: '添加普通维护人',
        width: '800px',
        searchOption: {
          columns: [{ label: '客户名称/社会统一代码', prop: 'customerName', type: 'input' ,
          placeholder:'请输入客户全称/社会统一代码进行搜索'}],
          data: { customerName: '' },
        },
        tableOption: {
          getData: () => {
            CUSTOMER.getGenList(this.addGerOption.searchOption.data).then(
              (res) => {
                this.genarId = res.data[0]?res.data[0].custid:''
                this.addGerOption.tableOption.data.splice(
                  0,
                  1000,
                  ...(res.data || []),
                )
              },

            )
          },
          title: '客户信息',
          columns: [
            { prop: 'customerName', label: '客户名称', minWidth: 150 },
            { prop: 'uscc', label: '社会统一信用编码', minWidth: 150 },
            {
              prop: 'custRoles',
              width: 162,
              type: 'select',
              label: '企业类别',
              propInDict: 'customerRole',
              multi: true,
              noDict: true,
            },
            {
              prop: 'industry',
              width: 162,
              type: 'input',
              label: '所属行业',
              // propInDict: 'customerRole',
              multi: true,
              noDict: true,
              formatter: ({ cellValue }) => {
                return formatIndustry(cellValue)
              }
            },
            // {
            //   prop: 'diy_btn',
            //   label: '操作',
            //   type: 'button',
            //   formatter: ({ row }) => (row.custid ? '申请' : ''),
            //   callback: (row) => {
            //     CUSTOMER.generalBind({ custid:row.custid }).then((res) => {
            //       this.addGerOption.tableOption.getDatas()
            //       this.$msgSucClose('申请成功')
            //       this.closeTime()
            //       this.getDatas()
            //     })
            //   },
            // },
          ],
          data: [],
        },
      },
      // 初始自定义表头
      selfColumnsBase: customerListTable.filter(ele => ele.prop !=='verifyTime').map((item) => {
        let target = { ...item, hasTag: item.prop === 'name' }
        if (item.prop == 'roleTypeInfo') {
          target.selectOptions = TROLELIST
          target.selectOptionsObj = TROLEOBJ
        }
        if (item.cDisabled) target.disabled = true
        if (target.callback) target.callback = (row) => this.showDetail(row)
        return target
      }),
      isManager: false, // 管理者
      isBd: false, //销售
      isCts: false, //客户部
      userId: '', //当前用户id
      dialogRemoveLeader: {
        ...removeCfg,
        labelWidth: '110px',
        formItems: [
          {
            label: '解绑原因',
            type: 'select',
            prop: 'removeReason',
            rules: this.defaultRules,
            propInDict: 'unbundReason',
          },
          {
            label: '原维护人',
            type: 'input',
            prop: 'oldEmployeeName',
            disabled: true,
          },
          {
            type: 'select',
            label: '新维护人',
            // rules: this.defaultRules,
            prop: 'newEmployeeId',
            remoteSelectList: RNLIST,
            remote: true,
            remoteMethod: (name) =>
              this.getEmployeeList(name, RNLIST, '', true, true),
          },
          {
            label: '新旧模式',
            type: 'select',
            prop: 'bdServiceMode',
            propInDict: 'customerServiceMode',
            rules: this.defaultRules,
          },
          {
            type: 'select',
            label: '维护人类型',
            prop: 'maintainerType',
            propInDict: 'custMaintainerType',
            disabled: true,
          },
        ],
        form: {
          removeReason: '',
          oldEmployeeId: '',
          newEmployeeId: '',
          oldEmployeeName: '',
          yesNo: '',
          bdServiceMode: 'new',
        },
      },
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
  },
  activated() {
    // this.handleCurrentChange(1)
    this.getData()
  },
  created() {
    // 是否是管理者
    let roles = this.$store.state.user.roles || []
    this.isManager = roles.includes('manager')
    this.isBd = roles.includes('bd')
    this.isObd = roles.includes('obd')
    this.isCts = roles.includes('cts')
    this.userId = this.$store.state.user.userId

    // this.potentialItem = { label: '潜在客户', value: 'potential' }
    ROLELIST.splice(
      0,
      100,
      // this.potentialItem,
      ...this.dictMap.customerRole.map((v) => ({ ...v })),
    )
    ROLELIST.forEach((item) => {
      ROLEOBJ[item.value] = item.label
    })
    let extend = [
      { label: ' ', value: 'order' },
      // { label: '潜在客户', value: 'potential' },
    ]
    TROLELIST.splice(0, 100, ...extend, ...this.dictMap.customerRole)
    TROLELIST.forEach((item) => {
      TROLEOBJ[item.value] = item.label
    })

    // 搜索配置
    let searchObj = {}
    customerListTable.forEach((v) => {
      if (v.prop == 'deptCname2' || v.prop === 'verifyTime') return
      if (v.prop == 'deptCname3' || v.prop === 'verifyTime') return
      if (v.prop == 'verifyStatus') return
      let prop = v.prop == 'deptCname' ? 'bdEmployeeName' : v.prop
      let label = v.prop == 'deptCname' ? '维护人' : v.label
      searchObj[prop] = {
        ...v,
        prop,
        label,
        type: v.sType || v.type || 'input',
        label: v.sLabel || label,
      }
      if (prop == 'bdEmployeeName') {
        searchObj[prop].type = 'remoteSelect'
        searchObj[prop].remoteSelectList = []
        searchObj[prop].remoteMethod = (name, item) => {
          // let query = [{ column: 'roleCode', type: 'in', value: 'bd,obd' }]
          let query = []
          name && query.push({ column: 'name', type: 'eq', value: name })
          listByRole({ currPage: 1, pageSize: 200, query }).then(
            ({ data: { list } }) => {
              let arr = list.map((v) => ({
                ...v,
                label: `${v.cname}(${v.employeeNo})`,
                value: v.employeeId,
              }))
              item.remoteSelectList.splice(0, 1000, ...arr)
            },
          )
        }
      }
      if (v.prop == 'roleTypeInfo') {
        searchObj[prop].selectOptions = ROLELIST
      }
    })
    this.searchOption1 = {
      saveDefault: true,
      addFilter: {
        defaultSearchLength: 6,
        searchInputGroup: [
          {
            key: 'name',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'custClass',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'roleTypeInfo',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'indexAddr',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'firstTime',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'regSource',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
        ],
        filterGroups: { ...searchObj },
        dateArr: ['setupDate', 'usccExpDate', 'firstTime', 'nearlyTime'],
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
        {
          label: '删除',
          action: 'Delete',
          showFn: (row) => {
            let { verifyStatus, status, createdBy } = row
            let userId = this.$store.state.user.userId
            let isSelf = userId === createdBy
            return (
              (['draft', 'refuse'].includes(verifyStatus) && this.isBd && isSelf) || (this.isCts && ['pass','create'].includes(verifyStatus))
              // ['draft', 'refuse'].includes(verifyStatus) &&
              // status === 'create'
              // && userId === createdBy
            )
          },
        },
      ],
    }
    this.option1 = {
      ...this.option,
      id: 'option1',
      pagination,
      selection: { show: this.isManager, fixed: 'left' },
      noClickCheck: !this.isManager,
      operationBtns,
    }
    // 自定义表头

    let columns = [
      ...this.selfColumnsBase.map((item) => {
        if (item.prop == 'roleTypeInfo') {
          item.selectOptions = TROLELIST.concat({
            label: '公司部门',
            value: 'department',
          })
          item.selectOptionsObj = { ...TROLEOBJ, department: '公司部门' }
        }
        if (item.prop == 'custClass') {
          item.selectOptions = this.dictMap.customerClassNew.concat({
            label: '独立结算部门',
            value: 'department',
          })
          item.selectOptionsObj = {
            ...this.dictMapObj.customerClassNew,
            department: '独立结算部门',
          }
        }
        return item
      }),
    ]
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
        return this.$msgErrClose(`非本人创建,不能删除!`)
      }
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
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }

      if (query) this.searchBackup = query
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
      let bdEmployeeName = data.query.find(
        (item) => item.column == 'bdEmployeeName',
      )
      if (bdEmployeeName) data.bdEmployeeId = bdEmployeeName.value
      // console.log(data)
      let reqData = {
        ...data,
        query: data.query.filter((v) => v.column !== 'bdEmployeeName'),
      }
      this._exportSearchData = reqData
      CUSTOMER.myCustomerList(reqData)
        .then(({ data }) => {
          if (data.configColumns && data.configColumns.length) {
            let columns = data.configColumns
            let optionColumns = columns
              .map((prop) =>
                this.selfColumnsBase.find((item) => item.prop === prop),
              )
              .filter((v) => v)
            this.option1.columns.splice(0, 1000, ...optionColumns)
            this.selfColumnsBase.filter(
              (item) => columns.indexOf(item.prop) > -1,
            )
            this.configColumns = data.configColumns
          }
          //我的客户列表显示'改'字、'拒'字，"status": "valid","verifyStatus": "pass"|refuse拒&改|submit改
          this.option1.data = data.list.map((item) => {
            let { verifyStatus, status, recycle, isWhitelist,verifyState,isBlacklist } = item
            item.roleTypeInfo = item.roleTypeInfo || ''
            item.roleTypeInfo =
              item.roleTypeInfo === 'potential'
                ? '潜在客户'
                : item.roleTypeInfo.replace('order', '')
            let _tagArr=[], _isChanged, _isRefused,_isBlack
            if (verifyStatus == 'submit' && status == 'valid') {
              _isChanged = true
              _tagArr = [{ text: '改', type: 'change' }]
            }
            if (verifyStatus == 'refuse' ||verifyState == 'refuse') {
              _isRefused = true
              _tagArr = [{ text: '拒', type: 'refuse' }]
            }
            if (recycle === 'yes') {
              _tagArr = [{ text: '新', type: 'change' }]
            }
            if (isWhitelist === 'yes') {
              _tagArr.push({ text: '白', type: 'tag-pass',img:true})
            }
            if (isBlacklist === 'yes') {
              _isBlack = true
              _tagArr = [{ text: '黑', type: 'black' }]
            }
            var lastTime =  this.dateMinus(item.mDate);
            if (lastTime !== '' && lastTime < 15 && lastTime>7) {
              _tagArr.push({ text: '!', type: 'delay' ,img_yellow:true,content:'客户预计回收时间还有'+lastTime+'天，请及时跟进。'})
            }else if(lastTime !== '' && lastTime < 8) {
              _tagArr.push({ text: '!', type: 'delaysmall' ,img_red:true,content:'客户预计回收时间还有'+lastTime+'天,请及时跟进。'})
            }
            return { ...item, _tagArr, _isChanged, _isRefused,_isBlack }
          })
          // console.log(this.option1)
          this.option1.pagination.currPage = data.currPage
          this.option1.pagination.pageSize = data.pageSize
          this.option1.pagination.totalCount = data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    //计算保有时间是否小于15天
    dateMinus(dateStart) {
      var sdate = new Date(dateStart); 
      var month = new Date().getMonth() + 1; 
      let curmonth = month < 10 ? '0' + month : month
      let curday = new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate() 
      var now = new Date(new Date().getFullYear() + '-' + curmonth + '-' + curday)
      if(dateStart &&  !(sdate.getTime() < now.getTime())){
        var days = sdate.getTime() - now.getTime(); 
        var day = Math.floor(days / (1000 * 60 * 60 * 24)); 
        return day;
      }else{
        return ''
      }

    },
    handleAdd() {
      this.$store.dispatch('crm/addCustomer')
      // this.routerPush('AddCustomer', { isPotential: true })
      this.routerPush('AddCustomer', {}, true)
    },
    handleExport() {
      this.lsLoading = true
      CUSTOMER.myCustomerListExport(this._exportSearchData)
        .then((res) => {
          window.open(res.data.filePath)
        })
        .finally(() => (this.lsLoading = false))
    },
    handleCustomColumns() {
      this.customColumnsPopShow = true
    },
    showDetail({
      custid,
      orgid,
      status,
      name,
      custMode,
      verifyStatus,
      employeeVos,
      createdBy
    }) {
      // this.$store.commit('crm/setCustid', custid)
      // this.$store.commit('crm/setOrgid', orgid)
      // return this.routerPush('AddCustomer')
      // 我的客户详情页 | 已拒绝详情
      let query
      if (custMode == 'potential') query = { isPotential: true }
      // 未提交->新建客户
      if (verifyStatus == 'draft') {
        // 管理者
        if (this.isManager && createdBy !== this.userId) {
          return this.routerPush('PotentialDetail', { custid, custMode }, { isTab: true })
        } else {
          this.$store.commit('crm/setCustid', custid)
          this.$store.commit('crm/setOrgid', orgid)
          return this.routerPush('AddCustomer', query, { isTab: true })
        }
      }
      // 待审核->新建客户,注释掉，不让他跳待审核页面，直接去disabled的详情
      // if (verifyStatus == 'submit' && status == 'create') {
      //   console.log('创建已审核')
      //   return CUSTOMER.verifyStatusInfo({ custid }).then(({ data }) => {
      //     this.$store.commit('crm/setVerifierInfo', {
      //       name: data.verifierName,
      //       entName: data.name,
      //       op: data.createdName,
      //       date: data.updatedTime,
      //     })
      //     this.routerPush(
      //       'AddCustomer',
      //       { status: 3, ...query },
      //       { isTab: true },
      //     )
      //   })
      // }
      this.$store.commit('crm/setDetailCustid', custid)
      this.$store.commit('crm/setDetailIsEdit', false)
      this.$store.commit('crm/setDetailEditInfo', {})
      // 判断是自己的还是下属的
      // let employeeIds = employeeVos.map((item) => item.employeeId)
      // let isEmployee = employeeIds.includes(this.userId)
      // if (this.isManager && !isEmployee) {
      //   this.routerPush('PotentialDetail', { custid, custMode }, { isTab: true })
      // } else {
      // this.routerPush('CustomerDetail', { custid, ...query }, { isTab: true })
      // 打开新页面
      console.log('客户')
      return this.routerPush('CustomerDetail', { custid, ...query, name}, { isTab: true })
      // let routeUrl = this.$router.resolve({
      //   name: 'CustomerDetail',
      //   query: { custid, ...query, name },
      //   params: { isTab: true }
      // })

      // window.open(routeUrl.href, '_blank')

      
      // }
      // return this.routerPush('CustomerDetail', { custid, ...query })
    },
    handleCheck() {
      this.dialogOption.show = true
      this.dialogOption.searchOption.data.name = ''
    },
    dialogClose() {
      this.dialogOption.show = false
      this.dialogOption.searchOption.data.name = ''
      this.dialogOption.tableOption.data.splice(0, 1000)
    },
    addGer(){
      this.addGerOption.show = true
      this.addGerOption.searchOption.data.customerName = ''
    },
    addGerClose(tag){
      if (!tag) {
        return this.closeTime()
      }
      if(this.genarId){
        CUSTOMER.generalBind({ custid:this.genarId }).then((res) => {
          this.addGerOption.tableOption.getData()
          this.$msgSucClose('申请成功')
          this.closeTime()
          this.getData()
        })
      }else{
        return this.$msgErrClose('没有可以添加的客户！')
      }

    },
    closeTime(){
      this.addGerOption.show = false
      this.addGerOption.searchOption.data.customerName = ''
      this.addGerOption.tableOption.data.splice(0, 1000)
      this.genarId = ''
    },
    sendMulti(data) {
      this.selectData = data
    },
    releaseMulti() {
      if (!this.selectData.length) {
        return this.$msgErrClose('请选择需要解绑的客户！')
      }
      // console.log(this.selectData)
      let employeeName, employeeId, isSelf, isNull
      let custids = []
      let userId = this.$store.state.user.userId
      let arr = this.selectData.map((item) => {
        custids.push(item.custid)
        let employeeVos = item.customerBds
        if (!employeeVos || !employeeVos.length) {
          isNull = true
          return
        }
        if (employeeVos.find((v) => v.bdEmployeeId == userId)) {
          isSelf = true
          return
        }
        let deptCode = this.$store.state.user.deptCode
        let find = employeeVos.find(
          (v) =>
            v.bdEmployeeId !== userId &&
            deptCode == v.bdDeptCode.slice(0, deptCode.length),
        )
        if (find && !employeeName && !employeeId) {
          employeeName = find.bdEmployeeName
          employeeId = find.bdEmployeeId
        }
        return find ? find.bdEmployeeId : ''
      })
      if (isNull) {
        return this.$msgErrClose('不能选择没有维护人的客户！')
      }
      if (isSelf) {
        return this.$msgErrClose('不能选择自己维护的客户！')
      }
      let arrSet = [...new Set(arr)]
      if (arrSet.length > 1) {
        return this.$msgErrClose('勾选的客户维护人必须一致！')
      }
      CUSTOMER.isOrderMaintainer({ employeeId, custids }).then((res) => {
        setTimeout(() => {
          this.dialogRemoveLeader.form.oldEmployeeId = employeeId
          this.dialogRemoveLeader.form.oldEmployeeName = employeeName
          this.dialogRemoveLeader.form.yesNo = res.data
          this.dialogRemoveLeader.form.custids = custids
          this.dialogRemoveLeader.form.maintainerType = res.data
          if (res.data === 'general' || res.data === 'potential') {
            this.dialogRemoveLeader.formItems = this.dialogRemoveLeader.formItems.filter(
              (item) => item.prop !== 'bdServiceMode',
            )
            this.dialogRemoveLeader.form.bdServiceMode = ''
          } else {
            if (
              !this.dialogRemoveLeader.formItems.find(
                (item) => item.prop === 'bdServiceMode',
              )
            ) {
              this.dialogRemoveLeader.formItems.splice(3, 0, {
                label: '新旧模式',
                type: 'select',
                prop: 'bdServiceMode',
                propInDict: 'customerServiceMode',
                rules: this.defaultRules,
              })
              this.dialogRemoveLeader.form.bdServiceMode = 'new'
            }
          }
        }, 100)
        this.dialogRemoveLeader.show = true
      })
    },
    // 确认解绑
    removeClose(tag) {
      if (!tag) {
        this.dialogRemoveLeader.show = false
        return
      }
      this.dialogRemoveLeader.btnLoading = true
      CUSTOMER.batchHandoverBd({ ...this.dialogRemoveLeader.form })
        .then((res) => {
          this.$msgSucClose('解绑成功！')
          this.dialogRemoveLeader.show = false
          this.getData()
        })
        .finally(() => {
          this.dialogRemoveLeader.btnLoading = false
        })
    },
    // 获取员工列表 filter 是否过滤掉已有维护人
    async getEmployeeList(name, list, showDept, queryColumn) {
      let query = []
      name && query.push({ column: 'name', type: 'eq', value: name })
      query.push({ column: 'roleCode', type: 'in', value: 'bd,obd' })
      if (queryColumn)
        query.push({
          column: 'deptCode',
          type: 'eq',
          value: this.$store.state.user.deptCode,
        })
      setTimeout(() => {
        listByRole({ currPage: 1, pageSize: 100, query }).then(({ data }) => {
          data.list = data.list.filter(
            (v) => v.employeeId !== this.dialogRemoveLeader.form.oldEmployeeId,
          )
          let arr = data.list.map((v) => {
            let label = showDept ? v.cname + ' ' + v.deptCname : v.cname
            return { ...v, label, value: v.employeeId }
          })
          list.splice(0, 100, ...arr)
        }, 100)
      })
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