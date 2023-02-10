<template>
  <div class="app-container">
    <RoleSwitch @callback="initQuery" />
    <div class="search-container">
      <Search ref="search" fixedCreatedTime :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
        <AddFilter fixedCreatedTime :searchInputGroup="searchInputGroup" :allFilterGroups="allFilterGroups" :filterGroups="filterGroups" :defaultSearchLength="defaultSearchLength" :callback="searchCallBack" :index="index" :item="item" v-for="(item, index) in showSearchInputGroup" :key="'filter' + index" />
        <!-- <i class="el-icon-circle-plus-outline icon-search-plus" @click="handleAddFilter"></i> -->
        <div class="btn-plus-search" @click="handleAddFilter" ref="btnPlus"></div>
      </Search>
    </div>
    <div class="table-container show-refuse-row-tabel" :class="['cancel', 'break', 'close', 'complete'].includes(tableQuery.orderStatus) ? 'init-table-container' : ''" ref="tableCont">
      <TableFilter :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
      <BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" v-loading="loading" />
    </div>
    <!-- 自定义表头 -->
    <div v-if="customColumnsPopShow">
      <CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
    </div>
    <!-- 新建弹窗 -->
    <div v-if="createOrderPopShow">
      <CreateOrder @close="createOrderPopClose" />
    </div>
    <!-- 取消订单弹窗 -->
    <div v-if="cancelOrderPopShow">
      <CancelOrder @close="cancelOrderPopClose" :orderNo="orderNo" :isBd="isBd" :isOp="isOp" />
    </div>
  </div>
</template>
<script>
import store from '@/store'
import { mapMutations, mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
import RoleSwitch from './components/roleSwitch'
// 弹出框
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import CreateOrder from './components/createOrder'
import CancelOrder from './components/cancelOrder'
import {
  baseEmployeeListName,
  citySelectList,
  columnWidthConfigInfo,
  columnWidthConfigSave
} from '@/api/base'
import {
  cdOrderList,
  orderCreate,
  cdOrderListExport,
  orderCopy,
  orderClose,
  orderDelete,
  orderCancelCancel,
  orderRelationList
} from '@/api/order/list'
import { customerListAllStatusNew } from '@/api/crm/supplier'
import { getParamMethod } from '@/utils/allKindNumber'
import { departmentTreeList } from '@/api/companyResource'
import { formatDate } from '@/utils/index'
const end = new Date()
const start = new Date()
let defaulTime = []
start.setTime(start.getTime() - 3600 * 1000 * 24 * 89)
defaulTime[0] = formatDate(start)
defaulTime[1] = formatDate(end)
const defaultPage = {
  pageSize: -1,
  currPage: 1
}
const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: ['createdTime'],
  query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
  orderStatus: 'all' // 订单状态，默认展示未审核
}
const defaultSearchInputGroup = [
  {
    key: 'universalNo',
    value: '',
    placeholder: '各类编号',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'orderNo',
    value: '',
    placeholder: '工作号',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'createdTime',
    value: defaulTime,
    placeholder: '订单创建时间',
    category: 'all',
    queryValue: ''
  }
]

export default {
  // mixins: [routerMixin],
  data() {
    return {
      departmentList: [],
      oldParams: {},
      // isSameCode: false,
      cTimestamp: 0,
      loading: false,
      state: '',
      showVal: null,
      defaultStyle: {
        width: '100%'
      },
      orderNo: '',
      // searchConditionList: [], // 自定义搜索模板集合
      defaultSearchLength: 0, // 默认显示搜索框的个数
      allFilterGroups: {
        all: this.filterGroups
      },
      selectDate: '',
      // 查询条件下拉选项
      filterGroups: {
        universalNo: {
          key: 'universalNo',
          label: '各类编号',
          type: 'input',
          searchType: 'in',
          value: '',
          showValue: ''
        },
        orderNo: {
          key: 'orderNo',
          label: '工作号',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        exportOrderNo: {
          key: 'exportOrderNo',
          label: '出口单号',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        customsNumber: {
          key: 'customsNumber',
          label: '报关单号',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        custClass: {
          key: 'custClass',
          label: '客户类型',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.customerClassNew,
          nonDictionary: true
        },
        // exportOrderNo: {
        //   key: 'exportOrderNo',
        //   label: '关联订单',
        //   type: 'input',
        //   searchType: 'like',
        //   value: ''
        // },
        serviceCode: {
          key: 'serviceCode',
          label: '服务项',
          type: 'select',
          searchType: 'like',
          value: '',
          filterable: true,
          data: [],
          nonDictionary: true,
          propInDict: 'orderServiceNameList',
          saveList: []
        },
        polPortCode: {
          key: 'polPortCode',
          label: '起运港',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.portSearch(
              '',
              'port_of_basic',
              this.state,
              'polPortCode',
              item
            )
          },
          filterMehod: (val, item) => {
            this.portSearch(
              val,
              'port_of_basic',
              this.state,
              'polPortCode',
              item
            )
          }
        },
        podPortCode: {
          key: 'podPortCode',
          label: '目的地',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.portSearch(
              '',
              'port_of_destination',
              this.state,
              'podPortCode',
              item
            )
          },
          filterMehod: (val, item) => {
            this.portSearch(
              val,
              'port_of_destination',
              this.state,
              'podPortCode',
              item
            )
          }
        },
        orderStatus: {
          label: '订单状态',
          key: 'orderStatus',
          type: 'select',
          searchType: 'in',
          value: '',
          data: [],
          multiple: true,
          saveList: [],
          'collapse-tags': true,
          queryValue: '',
          nonDictionary: true,
          disabledEdit: true
          // propInDict: 'orderStatus'
        },
        bdEmployeeId: {
          key: 'bdEmployeeId',
          label: '销售',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getEmployeeName('', item, 'bd')
          },
          filterMehod: (val, item) => {
            this.getEmployeeName(val, item, 'bd')
          }
        },
        opCustomsEmployeeName: {
          key: 'opCustomsEmployeeName',
          label: '关务操作',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          'allow-create': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getMulEmployeeName('', item, 'op_customs')
          },
          filterMehod: (val, item) => {
            this.getMulEmployeeName(val, item, 'op_customs')
          }
        },
        prefinCloseStatus: {
          label: '预关账状态',
          key: 'prefinCloseStatus',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.order.orderList.finCloseStatus,
          nonDictionary: true
        },
        finCloseStatus: {
          label: '关账状态',
          key: 'finCloseStatus',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.order.orderList.finCloseStatus,
          nonDictionary: true
        },
        prefinCloseTime: {
          label: '预关账时间',
          key: 'prefinCloseTime',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
        },
        finCloseTime: {
          label: '关账时间',
          key: 'finCloseTime',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
        },
        bizDate: {
          label: '业务日期',
          key: 'bizDate',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
        },
        custid: {
          key: 'custid',
          label: '委托单位',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.getCustList('', item)
          },
          filterMehod: (val, item) => {
            this.getCustList(val, item)
          }
        },

        createdTime: {
          label: '订单创建时间',
          key: 'createdTime',
          type: 'date',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd',
          'default-value': defaulTime,
          pickerOptions: {
            // 设置不能选择的日期
            onPick: ({ maxDate, minDate }) => {
              this.selectDate = minDate.getTime()
              if (maxDate) {
                this.selectDate = ''
              }
            },
            disabledDate: (time) => {
              // 1年365天的时间戳
              let two = 365 * 24 * 3600 * 1000
              // 是否限制的判断条件
              if (this.selectDate) {
                return (
                  time > new Date(this.selectDate + two) ||
                  time < new Date(this.selectDate - two)
                )
              } else {
                return false
              }
            },
            shortcuts: [
              {
                text: '最近三天',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 2)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '最近一周',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '最近一个月',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 29)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '最近两个月',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 59)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '最近三个月',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 89)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '最近半年',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 179)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '最近一年',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 364)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '今年',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date(end.getFullYear() + '-01-01')
                  picker.$emit('pick', [start, end])
                }
              }
            ]
          }
        },
        createdBy: {
          key: 'createdBy',
          label: '创建人',
          type: 'remoteSelect',
          searchType: 'eq',
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getEmployeeName('', item)
          },
          filterMehod: (val, item) => {
            this.getEmployeeName(val, item)
          }
        }
      },
      // 默认展示的搜索条件，搜索条件分类
      searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
      searchConfig: [],

      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      // table复选框多选的值
      selectedCheckbox: [],
      // table基础组件
      tableConfig: {
        style: {},
        tableIndex: {
          show: true
        },
        options: {
          // 是否支持解锁列表修改,默认锁定列表不可更改
          lockState: true,
          // 是否支持列表项选中功能
          mutiSelect: true,
          // 多选框状态判断 {false不可选, true可选}
          checkSelectable({ orderNo }) {
            return orderNo ? true : false
          }
        },
        customColumns: {
          show: true,
          handleCustomColumns: this.handleCustomColumns
        },
        defaultEmpty: true, // 数据默认不加载的显示文案
        list: [],
        configColumns: [],
        columns: [],
        allColumns: store.state.order.cdOrderList.columnsBase(
          this.handleOrderNoInfo
        ),
        // 操作按钮组
        operationBtns: {
          // 宽度设为180，因为已拒绝状态会同时存在4个按钮：详情，复制，撤回取消，关闭
          minWidth: '180',
          fixed: 'right',
          show: true,
          callback: (action, $index, row, item) => {
            if (action === 'Info') {
              this.handleInfo(row)
            }
            if (action === 'Copy') {
              this.handleCopy(row)
            }
            if (action === 'Cancel') {
              this.handleCancel(row)
            }
            if (action === 'Close') {
              this.handleClose(row)
            }
            if (action === 'Delete') {
              this.handleDelete(row)
            }
            if (action === 'CancelCancel') {
              this.handleCancelCancel(row)
            }
          },
          data: [
            {
              label: '详情',
              type: 'text',
              show: true,
              action: 'Info'
            },
            {
              label: '复制',
              type: 'text',
              show: (item, row) => {
                // 只有bd业务角色才有复制操作的权限
                if (this.isBd) {
                  return true
                }
                return false
              },
              action: 'Copy'
            },
            {
              label: '取消',
              type: 'text',
              className: 'red',
              show: (item, row) => {
                // 只有业务bd才有取消操作的权限
                if (this.isBd) {
                  if (row.orderStatus === 'pass' && row.isCancelApply != '1') {
                    return true
                  }
                  return false
                }
                return false
              },
              action: 'Cancel'
            },
            {
              label: '撤回取消',
              type: 'text',
              className: 'red',
              show: (item, row) => {
                // 只有业务bd才有取消操作的权限
                if (this.isBd) {
                  if (
                    row.isCancelApply === '1' &&
                    row.orderStatus !== 'break' &&
                    row.orderStatus !== 'cancel'
                  ) {
                    return true
                  }
                  return false
                }
                return false
              },
              action: 'CancelCancel'
            },
            {
              label: '关闭',
              type: 'text',
              show: (item, row) => {
                if (this.isBd) {
                  return false
                }
                return false
              },
              action: 'Close'
            },
            {
              label: '删除',
              type: 'text',
              className: 'red',
              show: (item, row) => {
                if (this.isBd) {
                  if (row.orderStatus === 'draft') {
                    return true
                  }
                  return false
                }
                return false
              },
              action: 'Delete'
            }
          ]
        },
        // 操作提示
        tips: {
          text: '',
          totalTxt: '',
          show: false
        },
        // 分页
        pagination: {
          show: true,
          total: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          isFirstPage: false,
          isLastPage: false
        }
      },
      tableColumnsWidthList: [],
      // 显示自定义表头的弹窗状态
      customColumnsPopShow: false,
      // 新建订单弹窗
      createOrderPopShow: false,
      // 取消订单弹窗
      cancelOrderPopShow: false,
      resDefaConfList: [], // 后端配置的默认搜索模板
      bdRemarkParam: {}
    }
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === 'OrderDetail') {
      let views = this.$store.state.tagsView.visitedViews.filter(
        (item) => item.params.orderNo === to.params.orderNo
      )
      // console.log('views', views)
      this.$store.commit('tagsView/DEL_SAMEORDER_VISITED_VIEW', views)
    }
    // console.log(to)
    next()
  },
  activated() {
    // let timestamp = new Date().getTime()
    // if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
    // 	this.getList()
    // }
    window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
  },

  deactivated() {
    window.removeEventListener('keydown', this.handleKeyDown)
  },
  created() {
    // this.cTimestamp = new Date().getTime()
    this.getDeptList()
    this.$set(this.filterGroups, 'bdDeptCode', {
					specialProp:'deptCode',
					label: '销售部门', 
					key: 'bdDeptCode',
					type: 'cascader',
					searchType: 'in',
					cascaderList: this.departmentList,
					saveList: [],
					cascaderProps: {
						children: 'childList',
						label: 'deptCname',
						value: 'deptCode',
						checkStrictly: false,
						multiple: true
					},
				})
    this.setCurrRole()
    this.init()
    // this.getList()
  },
  mounted() {
    // this.getDeptCode()

    console.log('🚀 ~ this.dictMap.serviceType', this.dictMap)
  },

  computed: {
    ...mapState('order', ['serviceList', 'orderList']),
    ...mapState('user', ['deptCode', 'userId']),
    ...mapState({
      currRole: (state) => state.order.currRole,
      roles: (state) => state.user.roles,
      roleCodesOptions: (state) => state.order.orderList.roleCodesOptions,
      allEditRoleArr: (state) => state.order.orderList.allEditRoleArr,
      dictMap: (state) => state.dict.dictMap,
      orderList: (state) => state.order.orderList,
      defaultColumns: (state) => state.order.cdOrderList.defaultColumns,
      specialColumns: (state) => state.order.cdOrderList.specialColumns,
      columnsBase: (state) => state.order.cdOrderList.columnsBase()
    }),
    isAc() {
      return this.currRole === 'ac'
    },
    isOp() {
      return this.currRole === 'op_customs'
    },
    isBd() {
      return (
        this.currRole === 'bd' ||
        this.currRole === 'obd' ||
        this.currRole === 'asst'
      )
    },
    showSearchInputGroup() {
      let index = this.searchInputGroup.findIndex(
        (item) => item.key === 'createdTime'
      )
      if (index !== -1) {
        this.searchInputGroup.push(this.searchInputGroup[index])
        this.searchInputGroup.splice(index, 1)
      }
      return this.searchInputGroup
    }
  },
  watch: {},
  components: {
    Search,
    AddFilter,
    BaseTableMuti,
    TableFilter,
    RoleSwitch,
    BaseDialog,
    CustomColumns,
    CreateOrder,
    CancelOrder
  },
  methods: {
    ...mapMutations('order', [
      'setDropBdCheckStatus',
      'setDropOpStatus',
      'setIsSoUpdate'
    ]),
    // 所属部门下拉框
    getDeptList() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach(
        (item) =>
          (item.childList = item.childList.length
            ? this.getTreeData(item.childList)
            : undefined)
      )
      return data
    },
    // 撤回取消订单
    handleCancelCancel(row) {
      this.$confirm(`是否撤回取消订单?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          orderCancelCancel({ orderNo: row.orderNo }).then((res) => {
            this.$message({
              type: 'success',
              message: '撤回成功',
              duration: 1000,
              onClose: () => {
                this.getList()
              }
            })
          })
        })
        .catch(() => {})
    },
    // 获取委托单位
    getCustList(val, item) {
      let data = {
        currPage: 1,
        pageSize: 50,
        query: val
          ? [
              { column: 'name', type: 'like', value: val },
              { column: 'roleType', type: 'eq', value: 'client' }
            ]
          : [{ column: 'roleType', type: 'eq', value: 'client' }]
      }
      customerListAllStatusNew(data).then((res) => {
        let list = res.data.list.map((ele) => {
          return {
            ...ele,
            label: ele.name,
            value: ele.custid
          }
        })
        let formatArr = () => {
          let map = new Map()
          for (let item of list) {
            if (!map.has(item.value)) {
              map.set(item.value, item)
            }
          }
          return [...map.values()]
        }
        let newArr = formatArr()
        let filterArr = newArr.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.value)
        )
        let itemList = filterArr.map((ele) => {
          return { ...ele, label: ele.label, value: ele.value }
        })
        item.data = [...item.saveList, ...itemList]
      })
    },
    // 获取员工name
    getEmployeeName(val, item, roleCode) {
      // console.log('item', item)
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: roleCode // 角色
      }
      if (!roleCode) delete data.roleCode
      baseEmployeeListName(data).then((res) => {
        // 单选下拉不保存选择后的数据
        if (!item.multiple) item.saveList = []
        let filterArr = res.data.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.employeeId)
        )
        let itemList = filterArr.map((ele) => {
          return {
            ...ele,
            label: this.$language === 'en' ? ele.ename : ele.cname,
            value: ele.employeeId ? Number(ele.employeeId) : ''
          }
        })
        item.data = [...item.saveList, ...itemList]
      })
    },
    getMulEmployeeName(val, item, role) {
      // console.log('item.saveList', item.saveList)
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: role // 角色
      }
      baseEmployeeListName(data).then((res) => {
        let list = res.data.map((ele) => {
          return {
            ...ele,
            label: this.$language === 'en' ? ele.ename : ele.cname,
            value: this.$language === 'en' ? ele.ename : ele.cname
          }
        })
        let formatArr = () => {
          let map = new Map()
          for (let item of list) {
            if (!map.has(item.value)) {
              map.set(item.value, item)
            }
          }
          return [...map.values()]
        }
        let newArr = formatArr()
        let filterArr = newArr.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.value)
        )
        let itemList = filterArr.map((ele) => {
          return { ...ele, label: ele.label, value: ele.value }
        })
        item.data = [...item.saveList, ...itemList]
      })
    },
    // 自定义列宽查询
    getTableColumnWidthInfo() {
      columnWidthConfigInfo({
        scenesCode: this.$route.name
      }).then((res) => {
        // console.log('res', res)
        // console.log('this.tableConfig.columns', this.tableConfig.columns)
        let { columnWidthList } = res.data
        // table列宽重新渲染
        this.tableConfig.columns.map((item) => {
          let findItem = columnWidthList.find((ele) => ele.column === item.prop)
          // 服务器返回的新的列宽宽度
          let newWidth = findItem ? Math.min(findItem.width, item.minWidth) : ''
          return Object.assign(item, { width: newWidth || item.width })
        })
        this.tableColumnsWidthList = this.getTableColumnsWidth()
        // console.log('this.tableColumnsWidthList', this.tableColumnsWidthList)
      })
    },
    // 获取本地table列表的字段和宽为数组集合
    getTableColumnsWidth() {
      let result = this.tableConfig.columns.map((item) => {
        return { column: item.prop, width: item.width }
      })
      return result
    },
    // 自定义列宽度保存
    handleSaveColumnWidth(params) {
      // console.log(params)
      let data = this.tableColumnsWidthList.map((item) => {
        if (item.column === params.prop) {
          item.width = params.width
        }
        return { ...item }
      })
      columnWidthConfigSave({
        scenesCode: this.$route.name,
        columnWidthList: data
      })
        .then((res) => {})
        .finally(() => {})
    },
    // 登录用户角色currRole不是bd,op,doc,ac的，在此设置拥有订单权限的默认角色
    setCurrRole() {
      // 登录用户过滤掉非订单权限的角色
      let userEditRoles = this.roles.filter((item) =>
        this.allEditRoleArr.includes(item)
      )
      // console.log('userEditRoles', userEditRoles)
      let currRole = userEditRoles.some((ele) =>
        ['bd', 'obd', 'asst'].includes(ele)
      )
        ? 'bd'
        : userEditRoles.some((ele) => ['op_customs'].includes(ele))
        ? 'op_customs'
        : userEditRoles.some((ele) => ['ac'].includes(ele))
        ? 'ac'
        : ''
      this.$store.dispatch('order/setCurrRole', currRole)
      console.log(currRole)
    },
    async initQuery() {
      this.tableQuery.currPage = 1
      this.tableQuery.query = []
      this.init()
      this.$refs.search.getSearchConditionInfo(true)
      // this.searchCallBack('Search')
      // this.getList()
    },
    // 装货地下拉
    receiptPlaceSearch(queryString, item) {
      citySelectList({
        countryCode: '',
        cityCode: queryString || '',
        state: 'valid'
      }).then((res) => {
        item.data =
          res.data &&
          res.data.map((ele) => {
            return Object.assign(ele, {
              label: this.$language === 'en' ? ele.ename : ele.cname,
              value: ele.cityCode
            })
          })
      })
    },

    init() {
      // 默认展示全部
      this.tableQuery.orderStatus = 'all'
      Object.assign(this.allFilterGroups, {
        all: this.filterGroups
      })
      this.searchInputGroup = JSON.parse(
        JSON.stringify(defaultSearchInputGroup)
      )
    },

    // 增加一条搜索条件
    handleAddFilter() {
      this.searchInputGroup.push({
        key: '',
        value: '',
        category: 'all',
        queryValue: ''
      })
    },

    // 远程搜索港口下拉数据
    portSearch(queryString, portAttribute, state, type, item) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          this.searchSelectVisibleData(data, item)
        })
    },
    // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString, item) {
      this.$store
        .dispatch('dict/baseSystemLineList', { name: queryString, state: '' })
        .then((data) => {
          this.searchSelectVisibleData(data, item)
        })
    },
    // 船公司下拉列表自动补充的数据
    shipCarrierQuerySearch(queryString, item) {
      this.$store
        .dispatch('dict/baseShippingCarrierList', {
          name: queryString,
          state: 'valid'
        })
        .then((data) => {
          this.searchSelectVisibleData(data, item)
        })
    },
    // 船名下拉
    queryVessleList(queryString, item) {
      this.$store
        .dispatch('dict/queryVessleList', { name: queryString })
        .then((data) => {
          console.log('vessel', data)
          this.searchSelectVisibleData(data, item)
        })
    },
    // 航次下拉
    queryVoyageList(queryString, item) {
      this.$store
        .dispatch('dict/queryVoyageList', { name: queryString })
        .then((data) => {
          this.searchSelectVisibleData(data, item)
        })
    },
    // 搜索条件el-select下拉数据处理
    searchSelectVisibleData(data, item) {
      // 单选下拉不保存选择后的数据
      if (!item.multiple) item.saveList = []
      let filterArr = data.filter(
        (ele) => !item.saveList.find((o) => o.value === ele.key)
      )
      let itemList = filterArr.map((ele) => {
        return { ...ele, label: ele.value, value: ele.key }
      })
      item.data = [...item.saveList, ...itemList]
    },
    // 获取订舱代理
    getSupplierList(type, queryString, item) {
      this.$store
        .dispatch('dict/queryBkgAgentSupplierList', {
          category: 'category',
          value: 'bkg_carrier,bkg_agent',
          queryString: queryString,
          categoryType: 'in'
        })
        .then((data) => {
          let filterArr = data.list.filter(
            (ele) => !item.saveList.find((o) => o.value === ele.supplierId)
          )
          let itemList = filterArr.map((ele) => {
            return {
              ...ele,
              label: this.$language == 'en' ? ele.ename : ele.name,
              value: ele.supplierId ? Number(ele.supplierId) : ''
            }
          })
          item.data = [...item.saveList, ...itemList]
        })
    },
    // 获取发货单位
    getShipperName(queryString, item) {
      this.$store
        .dispatch('dict/queryCustomerList', queryString)
        .then((data) => {
          let list = data.list.map((ele) => {
            return {
              ...ele,
              label: this.$language === 'en' ? ele.ename : ele.name,
              value: this.$language === 'en' ? ele.ename : ele.name
            }
          })
          let formatArr = () => {
            let map = new Map()
            for (let item of list) {
              if (!map.has(item.value)) {
                map.set(item.value, item)
              }
            }
            return [...map.values()]
          }
          let newArr = formatArr()
          let filterArr = newArr.filter(
            (ele) => !item.saveList.find((o) => o.value === ele.value)
          )
          let itemList = filterArr.map((ele) => {
            return { ...ele, label: ele.label, value: ele.value }
          })
          item.data = [...item.saveList, ...itemList]
        })
    },
    // enter按键事件
    handleKeyDown(e) {
      let key = null
      if (window.event === undefined) {
        key = e.keyCode
      } else {
        key = window.event.keyCode
      }
      if (key === 13) {
        // console.log(window.event.target)
        // 阻止分页的页码enter键触发全局的监听事件
        let className = window.event.target.parentNode.className
        if (
          window.event.target.id === 'bdRemark' ||
          className.includes('el-pagination__editor')
        )
          return
        //触发的事件
        this.searchCallBack('Search')
      }
    },

    // 获取列表请求参数
    getListQuery() {
      let statusQuery = []
      // 全部tab过滤掉已取消状态的数据
      if (this.tableQuery.orderStatus === 'all') {
        statusQuery = [
          {
            column: 'orderStatus',
            type: 'in',
            value:
              'draft,pre_submit,submit,pass,refuse,break,complete,cancel,close'
          }
        ]
        // statusQuery = [{ column: 'orderStatus', type: 'in', value: 'submit,draft,pass,refuse,complete' }]
        if (this.isAc || this.isOp) {
          statusQuery = [
            {
              column: 'orderStatus',
              type: 'in',
              value: 'pass,break,complete,cancel,close'
            }
          ]
        }
      } else if (this.tableQuery.orderStatus === 'mine') {
        statusQuery = [
          { column: 'employeeIdList', type: 'like', value: this.userId }
        ]
        // 不含有bd,obd,asst的用户在我的业务tab不显示草稿订单
        if (this.isAc || this.isOp) {
          statusQuery = [
            { column: 'employeeIdList', type: 'like', value: this.userId },
            {
              column: 'orderStatus',
              type: 'in',
              value: 'submit,pass,complete,cancel,break'
            }
          ]
        }
      } else if (this.tableQuery.orderStatus === 'pass') {
        statusQuery = [{ column: 'orderStatus', type: 'eq', value: 'pass' }]
      } else if (this.tableQuery.orderStatus === 'drop') {
        statusQuery = [
          {
            column: 'dropBdCheckStatus',
            type: 'in',
            value: 'AGREE,AGREE_NOTIFY'
          },
          { column: 'dropOpStatus', type: 'eq', value: '' }
        ]
      } else if (this.tableQuery.orderStatus === 'dropped') {
        statusQuery = [{ column: 'isDrop', type: 'eq', value: 'Y' }]
      } else if (this.tableQuery.orderStatus === 'submit') {
        statusQuery = [
          { column: 'orderStatus', type: 'in', value: 'submit,pre_submit' }
        ]
      } else if (this.tableQuery.orderStatus) {
        statusQuery = [
          {
            column: 'orderStatus',
            type: 'eq',
            value: this.tableQuery.orderStatus
          }
        ]
      } else {
      }

      // 合并状态参数
      let data = {}
      // console.log('tableQuery', this.tableQuery)

      Object.assign(data, this.tableQuery, {
        query: this.tableQuery.query.concat(statusQuery)
      })
      delete data.orderStatus

      return data
    },
    // 列表数据
    async getList() {
      this.loading = true
      let query = this.getListQuery()

      //处理逗号分割的多个订单号
      query.query.map((item) => {
        if (
          ['orderNo', 'so', 'blNo', 'cn', 'carrierLineName', 'whPoNo', 'exportOrderNo'].includes(
            item.column
          )
        ) {
          // item.type = item.column === 'so' || item.column === 'blNo' ? 'like' : 'in'
          item.type = 'like'
          item.value = item.value
            .split(/[,|，|\s]/)
            .filter(Boolean)
            .join('#')
        }
      })
      this.oldParams = query
      let { data } = await columnWidthConfigInfo({
        scenesCode: this.$route.name
      })
      let { columnWidthList } = data
      getParamMethod(this.$route.name, query).then((queryObj) => {
        cdOrderList(queryObj)
          .then((response) => {
            this.oldParams = queryObj
            let { list, totalCount, pageSize, allColumns, configColumns } =
              response.data
            list.forEach((item) => {
              item.serviceTypeName = getDictLabel(
                'customsServiceType',
                item.serviceType
              )
              item.businessTypeCn = getDictLabel(
                'shipBusinessType',
                item.businessType
              )
              if (
                item.orderStatus === 'cancel' &&
                this.tableQuery.orderStatus === 'all'
              )
                Object.assign(item, { orderIsCancel: true })
              if (
                item.orderStatus === 'close' &&
                this.tableQuery.orderStatus === 'all'
              )
                Object.assign(item, { orderIsClose: true })
              if (
                item.orderStatus === 'complete' &&
                this.tableQuery.orderStatus === 'all'
              )
                Object.assign(item, { orderIsFinish: true })
            })
            this.tableConfig.list = list
            // 请求无数据显示的文案
            if (!list || !list.length) {
              this.$set(this.tableConfig, 'defaultEmpty', false)
            }
            this.tableQuery.pageSize = pageSize
            this.tableConfig.pagination.total = totalCount
            this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
            this.tableConfig.pagination.hasPreviousPage =
              response.data.hasPreviousPage
            this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
            this.tableConfig.pagination.isLastPage = response.data.isLastPage
            this.tableQuery.currPage = response.data.currPage
            this.tableConfig.configColumns = configColumns.length
              ? configColumns
              : this.defaultColumns
            this.tableConfig.configColumns.push(
              'isCancelApply',
              'isNotify',
              'isChange'
            )
            this.tableConfig.configColumns = new Set(
              this.tableConfig.configColumns
            )
            this.tableConfig.configColumns = Array.from(
              this.tableConfig.configColumns
            )
            this.handleFilterColumns(this.tableConfig.configColumns)
            // 设置列宽为服务器返回的新的列宽宽度
            // console.log('this.tableConfig.columns', this.tableConfig.columns)
            this.tableConfig.columns.map((item) => {
              // 取服务器返回的宽度
              let findItem = columnWidthList.find(
                (ele) => ele.column === item.prop
              )
              let newWidth = findItem ? findItem.width : ''
              return Object.assign(item, { width: newWidth || item.width })
            })
            this.tableColumnsWidthList = this.getTableColumnsWidth()
            // this.getTableColumnWidthInfo()
            // this.fillPolName()
          })
          .finally(() => {
            this.loading = false
          })
      })
    },

    // 回显港口数据
    fillPolName() {},

    // 查询组件回调
    async searchCallBack(action, param, isFirstLoad) {
      let query = []
      console.log('this.searchInputGroup', this.searchInputGroup)
      if (action === 'Search') {
        // 新增的查询条件组装tableQuery参数
        if (this.searchInputGroup.length) {
          this.searchInputGroup.forEach((item, index) => {
            let tempItem = {}
            if (item.key) {
              // 非自动补全的查询参数从item.value中取值合并到query
              if (this.filterGroups[item.key].type !== 'autocomplete') {
                // 多选下拉框
                if (this.filterGroups[item.key].type === 'cascader') {
                  if(this.filterGroups[item.key].cascaderProps.multiple){
										let arr=[]
										if(item.value&&item.value.length){
											for(let i=0;i<item.value.length;i++){
												if(item.value[i]&&item.value[i].length){
													arr.push(item.value[i][item.value[i].length-1])
												}
											}
										}
										Object.assign(tempItem, {
											column: item.key,
											type: this.filterGroups[item.key].searchType || 'in',
											value: arr.length ? arr.toString() : ''
										})
									}else{
										Object.assign(tempItem, {
											column: item.key,
											type: 'eq',
											value: item.value ? item.value[item.value.length - 1] : ''
										})
									}
                } else if (this.filterGroups[item.key].multiple) {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: this.filterGroups[item.key].searchType || 'eq',
                    value: item.value ? item.value.toString() : ''
                  })
                  // 中转港特殊处理
                  if (item.key === 'transitPortCode') {
                    Object.assign(tempItem, {
                      column: 'transitPortCodeStr',
                      type: 'like',
                      value: item.value ? item.value.join('#') : ''
                    })
                  }
                } else if (
                  this.filterGroups[item.key].category === 'daterange'
                ) {
                  // 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
                  if (item.value && item.value[0])
                    if (item.value[0] === '-') {
                      query.push({
                        column: item.key,
                        type: 'empty',
                        value: '-'
                      })
                    } else {
                      query.push({
                        column: item.key,
                        type: 'ge',
                        value: item.value[0] + ' 00:00:00'
                      })
                    }
                  if (item.value && item.value[1])
                    query.push({
                      column: item.key,
                      type: 'le',
                      value: item.value[1] + ' 23:59:59'
                    })
                } else if (
                  // 特殊处理预关账状态，关账状态
                  ['prefinCloseStatus', 'finCloseStatus'].includes(item.key)
                ) {
                  // 选择未关账传值不等于yes
                  if (item.value) {
                    if (item.value === 'yes') {
                      Object.assign(tempItem, {
                        column: item.key,
                        type: 'eq',
                        value: 'yes'
                      })
                    } else {
                      Object.assign(tempItem, {
                        column: item.key,
                        type: 'ne',
                        value: 'yes'
                      })
                    }
                  }
                } else if (['isJoint'].includes(item.key)) {
                  // 已协同=y
                  if (item.value) {
                    if (item.value === 'y') {
                      Object.assign(tempItem, {
                        column: item.key,
                        type: 'eq',
                        value: 'y'
                      })
                    } else {
                      Object.assign(tempItem, {
                        column: item.key,
                        type: 'ne',
                        value: 'y'
                      })
                    }
                  }
                } else if (['serviceCode'].includes(item.key)) {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: 'like',
                    value: item.value ? `,${item.value},` : ''
                  })
                } else {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: this.filterGroups[item.key].searchType || 'eq',
                    value: item.value
                  })
                }
              } else {
                Object.assign(tempItem, {
                  column: item.key,
                  type: this.filterGroups[item.key].searchType || 'eq',
                  value: this.filterGroups[item.key].queryValue
                })
              }
              query.push(tempItem)
            }
          })
          // 按orderStatus查询，特殊处理表格tab除了我的业务其他tab值为空，不按orderStatus查的默认值为all,显示全部tab
          if (
            this.searchInputGroup.some(
              (ele) =>
                ele.key === 'orderStatus' &&
                ele.value &&
                ele.value.length &&
                !['mine'].includes(this.tableQuery.orderStatus)
            )
          ) {
            this.tableQuery.orderStatus = ''
          } else if (!this.tableQuery.orderStatus) {
            this.tableQuery.orderStatus = 'all'
          } else {
          }
        }

        Object.assign(this.tableQuery, {
          query: query.filter((item) => {
            return item.value
          }),
          currPage: 1
        })
        // console.log('serach:', this.tableQuery)
        this.getList()
      }
      if (action === 'Reset') {
        this.handleSearchValueReset()
      }
      // 模板加载后修改搜索组件的数组
      if (action === 'Update') {
        this.searchInputGroup = param.length
          ? [...param]
          : [...defaultSearchInputGroup]
        // console.log('this.searchInputGroup-update', this.searchInputGroup);
        if (this.searchInputGroup.some((item) => item.key === 'createdTime')) {
          this.searchInputGroup.map((item) => {
            if (item.key === 'createdTime') {
              if (!item.value) item.value = defaulTime
            }
          })
        } else {
          this.searchInputGroup.push({
            key: 'createdTime',
            value: defaulTime,
            placeholder: '订单创建时间',
            category: 'all',
            queryValue: ''
          })
        }
        // 设置默认订单状态搜索的值
        // this.setSearchOrderStatusValue(isFirstLoad)
      }
      // 刷新
      if (action === 'Refresh') {
        this.loading = true
        let { data } = await columnWidthConfigInfo({
          scenesCode: this.$route.name
        })
        let { columnWidthList } = data
        cdOrderList(this.oldParams)
          .then((response) => {
            let { list, totalCount, pageSize, allColumns, configColumns } =
              response.data
            list.forEach((item) => {
              item.serviceTypeName = getDictLabel(
                'customsServiceType',
                item.serviceType
              )
              item.businessTypeCn = getDictLabel(
                'shipBusinessType',
                item.businessType
              )
              if (
                item.orderStatus === 'cancel' &&
                this.tableQuery.orderStatus === 'all'
              )
                Object.assign(item, { orderIsCancel: true })
              if (
                item.orderStatus === 'close' &&
                this.tableQuery.orderStatus === 'all'
              )
                Object.assign(item, { orderIsClose: true })
              if (
                item.orderStatus === 'complete' &&
                this.tableQuery.orderStatus === 'all'
              )
                Object.assign(item, { orderIsFinish: true })
            })
            this.tableConfig.list = list
            this.tableQuery.pageSize = pageSize
            this.tableConfig.pagination.total = totalCount
            this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
            this.tableConfig.pagination.hasPreviousPage =
              response.data.hasPreviousPage
            this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
            this.tableConfig.pagination.isLastPage = response.data.isLastPage
            this.tableQuery.currPage = response.data.currPage
            this.tableConfig.configColumns = configColumns.length
              ? configColumns
              : this.defaultColumns
            this.tableConfig.configColumns.push(
              'isCancelApply',
              'isNotify',
              'isChange'
            )
            this.tableConfig.configColumns = new Set(
              this.tableConfig.configColumns
            )
            this.tableConfig.configColumns = Array.from(
              this.tableConfig.configColumns
            )
            this.handleFilterColumns(this.tableConfig.configColumns)
            // 设置列宽为服务器返回的新的列宽宽度
            // console.log('this.tableConfig.columns', this.tableConfig.columns)
            this.tableConfig.columns.map((item) => {
              // 取服务器返回的宽度
              let findItem = columnWidthList.find(
                (ele) => ele.column === item.prop
              )
              let newWidth = findItem ? findItem.width : ''
              return Object.assign(item, { width: newWidth || item.width })
            })
            this.tableColumnsWidthList = this.getTableColumnsWidth()
            // this.getTableColumnWidthInfo()
            // this.fillPolName()
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    handleSearchValueReset() {
      this.searchInputGroup.map((item) => {
        if (item.key !== 'createdTime') {
          item.value = ''
          return { ...item }
        }
      })
      // console.log('重置')
    },
    // 反显查询条件的订单状态
    getOrderStatusArr(arr) {
      return this.dictMap.orderStatus
        .filter((item) => arr.includes(item.value))
        .map((item) => ({ label: item.label, value: item.value }))
    },
    // 搜索条件的订单状态的默认下拉选中值
    setSearchOrderStatusValue(isFirstLoad) {
      if (this.searchInputGroup.some((item) => item.key === 'orderStatus')) {
        this.searchInputGroup.map((item) => {
          if (
            item.key === 'orderStatus' &&
            !['mine'].includes(this.tableQuery.orderStatus)
          ) {
            item.value = []
          }
        })
      }
    },
    // 新建
    handleAdd() {
      this.createOrderPopShow = true
    },

    // 取消订单
    handleCancel(row) {
      this.orderNo = row.orderNo
      this.cancelOrderPopShow = true
    },

    // 关闭订单
    handleClose(row) {
      this.$confirm(`是否关闭此订单?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          orderClose({ orderNo: row.orderNo }).then((res) => {
            this.$message({
              type: 'success',
              message: '关闭成功',
              duration: 1000,
              onClose: () => {
                this.getList()
              }
            })
          })
        })
        .catch((err) => {
          console.log('err')
        })
    },

    // 删除订单
    handleDelete(row) {
      this.$confirm(`是否删除此订单?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          orderDelete({ orderNo: row.orderNo }).then((res) => {
            this.$message({
              type: 'success',
              message: '删除成功',
              duration: 1000,
              onClose: () => {
                let totalPage = Math.ceil(
                  (this.tableConfig.pagination.total - 1) /
                    this.tableQuery.pageSize
                )
                let currPage =
                  this.tableQuery.currPage > totalPage
                    ? totalPage
                    : this.tableQuery.currPage
                this.tableQuery.currPage = currPage < 1 ? 1 : currPage
                this.getList()
              }
            })
          })
        })
        .catch((err) => {
          console.log('err')
        })
    },

    // 导出
    handleExport() {
      let data = this.getListQuery()
      cdOrderListExport({
        ascColumns: data.ascColumns,
        descColumns: data.descColumns,
        query: this.oldParams.query
      }).then((response) => {
        let { filePath } = response.data
        window.location.href = filePath
      })
    },

    // 自定义表头
    handleCustomColumns() {
      this.customColumnsPopShow = true
    },

    // 按订单状态筛选
    handleSearchByOrderStatus() {
      // 除我的业务tab以外。其他按tab查询，如果搜索条件已选了订单状态的可以直接忽略，直接按tab的状态查
      if (!['mine'].includes(this.tableQuery.orderStatus)) {
        this.tableQuery.query = this.tableQuery.query.filter(
          (item) => item.column !== 'orderStatus'
        )
      }
      this.tableQuery.currPage = 1
      this.setSearchOrderStatusValue()
      this.getList()
    },

    // 多选
    handleMuti(arr) {
      this.selectedCheckbox = arr
      let txt = 'T量合计：'
      let total = 0
      arr.map((item) => {
        total += Number(item.amountT)
      })
      txt = txt + total
      this.$set(this.tableConfig.tips, 'totalTxt', txt)
      // console.log('txt:', txt)
    },

    handleSizeChange() {
      this.getList()
    },

    handleCurrentChange(val) {
      // console.log('default', val)
      // 20220221 默认不请求列表
      if (val === 1) {
        return (this.tableConfig.list = [])
      }
      this.getList()
    },

    // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },

    // 获取table选中行的orderNo
    getOrderNos() {
      let orderNos = []
      this.selectedCheckbox.forEach((item) => {
        orderNos.push(item.orderNo)
      })
      return orderNos
    },
    // 点击订单号查看详情
    handleOrderNoInfo(row) {
      this.handleInfo(row)
    },
    // 去详情页
    async handleInfo(row) {
      let action = ''
      // 业务除草稿和拒绝状态都不可编辑
      if (this.isBd && !['draft', 'refuse'].includes(row.orderStatus)) {
        action = 'view'
      }
      // 操作角色非审核通过都不可编辑
      if (this.isOp && !['pass', 'break'].includes(row.orderStatus)) {
        action = 'view'
      }
      this.isJumpRouteFromPage = true
      let isSameCode = await this.$store.dispatch('order/getValueByKeys', {
        custid: row.custid
      })
      let { data } = await orderRelationList({ orderNo: row.orderNo })
      console.log('isSameCode', isSameCode, data)
      let routeUrl = this.$router.resolve({
        name: 'OrderDetail',
        params: {
          orderNo: row.orderNo
        },
        query: {
          orderNo: row.orderNo,
          source: 'orderList',
          action: action,
          showContainer: true,
          showBl: true,
          showRelate: true
        }
      })
      window.open(routeUrl.href, '_blank')
    },

    // 复制
    async handleCopy(row) {
      let isSameCode = await this.$store.dispatch('order/getValueByKeys', {
        custid: row.custid
      })
      this.$confirm(
        `是否确认复制工作号: ${row.orderNo} 委托单位：${row.custName} 的数据?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return orderCopy({ orderNo: row.orderNo })
        })
        .then((response) => {
          let { orderNo } = response.data
          this.$message({
            message: '复制成功',
            type: 'success',
            duration: 1000,
            onClose: () => {
              this.isJumpRouteFromPage = true
              let routeUrl = this.$router.resolve({
                name: 'OrderDetail',
                params: {
                  orderNo: orderNo
                },
                query: {
                  orderNo: orderNo,
                  source: 'orderList',
                  action: 'copy',
                  showContainer: true,
                  showBl: true,
                  showRelate: true
                }
              })
              window.open(routeUrl.href, '_blank')
            }
          })
        })
        .catch(() => {})
    },

    // 排序
    handleSort(query) {
      this.getList()
    },

    // 过滤显示自定义的表头
    handleFilterColumns(value) {
      let { allColumns, columns } = this.tableConfig
      let temp = []
      let arr = []
      temp = allColumns.filter((item, index) => {
        return value.includes(item.prop)
      })

      // 排序 temp
      temp.sort((prev, next) => {
        const p = value.indexOf(prev.prop)
        const n = value.indexOf(next.prop)
        return p - n
      })

      temp.map((item) => {
        arr.push(item.prop)
      })

      Object.assign(this.tableConfig, {
        columns: temp,
        configColumns: arr
      })
      // console.log('tableColumns:', this.tableConfig.columns);
    },

    // 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
    getColumnsValues(value) {
      // 20211202 订单号表头不固定在第一列
      let result = []
      value.map((item) => {
        if (this.specialColumns[item]) {
          result = result.concat(this.specialColumns[item])
        } else {
          result.push(item)
        }
      })

      result = Array.from(new Set(result))
      return result
    },

    // 自定义表头关闭回调
    customColumnsPopClose(action, value) {
      this.customColumnsPopShow = false
      if (action === 'Confirm') {
        let columnsKeys = this.getColumnsValues(value)
        Object.assign(this.tableQuery, {
          columns: columnsKeys
        })
        // console.log('columnsKeys:',this.tableQuery.columns)
        this.getList()
      }
    },

    // 新建订单保存
    handleCreateOrder(value, includeFeederType) {
      let includeFeeder = includeFeederType
      let action = 'add'
      let source = 'orderList'
      orderCreate(value)
        .then((res) => {
          let { orderNo, serviceType, businessType } = res.data
          // console.log('🚀 ~ res.data', res.data)
          sessionStorage.setItem('createOrderStr', JSON.stringify(res.data))
          this.createOrderPopShow = false
          this.isJumpRouteFromPage = true
          let routeUrl = this.$router.resolve({
            name: 'OrderDetail',
            params: {
              orderNo: orderNo
            },
            query: {
              orderNo: orderNo,
              source: 'orderList',
              action: 'add',
              includeFeeder: includeFeederType,
              showContainer: true,
              showBl: true,
              showRelate: true
            }
          })
          window.open(routeUrl.href, '_blank')
        })
        .catch(() => {
          this.createOrderPopShow = false
        })
    },

    // 新建订单关闭回调
    createOrderPopClose(action, value, includeFeederType) {
      if (action === 'Confirm') {
        this.handleCreateOrder(value, includeFeederType)
      } else {
        this.createOrderPopShow = false
      }
    },

    // 取消订单关闭回调
    cancelOrderPopClose(action, value) {
      this.cancelOrderPopShow = false
      if (action === 'Confirm') {
        this.getList()
        //this.handleCreateOrder(value)
      }
    }
  }
}
</script>
<style lang="scss">
</style>
