<template>
  <div class="app-container">
    <div class="search-container">
      <Search
        :searchConditionHide="searchConditionHide"
        :config.sync="searchConfig"
        :callback="searchCallBack"
        :tableQuery.sync="tableQuery">
        <!-- <AddFilter 
          :searchInputGroup="searchInputGroup"
          :allFilterGroups="allFilterGroups" 
          :filterGroups="filterGroups" 
          :defaultSearchLength="defaultSearchLength"
          :index="index"
          :item="item"
          v-for="(item, index) in searchInputGroup" 
          :key="'filter' + index" />
        <div class="btn-plus-search" @click="handleAddFilter"></div> -->
      </Search>
    </div>
    <div class="table-container">
      <TableFilter
      :config="tableConfig"
      :tableQuery.sync="tableQuery"
      :callback="tableCallBack" />
      <BaseTableMuti
        :tableQuery.sync="tableQuery"
        :config="tableConfig"
        :callback="tableCallBack" />
    </div>
    <!-- 自定义表头 -->
    <div v-if="customColumnsPopShow">
      <CustomColumns 
        :columnsBase="tableConfig.allColumns"
        :configColumns="tableConfig.configColumns"
        @close="customColumnsPopClose" />
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import store from '@/store'
import {mapState} from 'vuex'
import {getDictLabel, getServiceName} from '@/utils/tools'
import {routerMixin} from '@/views/order/order/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
// 弹出框
import CustomColumns from '@/components/customColumns/index'
import {baseEmployeeListName, columnWidthConfigInfo, columnWidthConfigSave, baseBusinessList} from '@/api/base'
import {workExceptionList, workExceptionDelete, workExceptionUpdateStatus, workExceptionListExport } from '@/api/order/workException'
import { customerListAllStatus } from '@/api/crm/supplier'

const defaultPage = {
  pageSize: -1,
  currPage: 1
}

const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: ['startTime'],
  query: [],     // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
  handleStatus: 'todo', // 订单状态，默认展示未处理
}

export default {
  mixins: [routerMixin],
  data() {
    return {
      state:'',
      showVal: null,
      defaultStyle: {
        width: '100%'
      },
      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      searchConditionHide: true,  // 隐藏自定义搜索
      searchConfig: [
        {label: '工作号', key: 'orderNo', type: 'input', searchType: 'like', value: ''},
        {label: '异常编号', key: 'excpNo', type: 'input', searchType: 'like', value: ''},
        {
          key: 'chargeEmployeeId', 
          label: '负责人', 
          type: 'remoteSelect',
          searchType: 'eq', 
          data: [],
          saveList: [],
          value: '',
          visibleChange: (val, item) => {
            val && this.getEmployeeName('', item)
          }, 
          filterMehod: (val, item) => {
            this.getEmployeeName(val, item)
          }
        },
        {label: '是否客户投诉', key: 'isCustComplain', type: 'select', searchType: 'eq', value: '', data: [
					{label: '是', value: 'y'},
					{label: '否', value: 'n'},
				],nonDictionary: true},
        {label: '责任方', key: 'responsibleName', type: 'input', searchType: 'like', value: ''},
        { 
          label: '异常类型',
          key: 'reasonTypeCode',
          type: 'cascader',
          data: [],
          filterable: true,
          clearable: true,
          searchType: 'eq',
          value: '',
          visibleChange: (val, item) => {
            val && this.getReasonTypeCode('', item)
          },
          change: (val, item) => {
            this.setReasonTypeCode(val, item)
          }
        },
        {label: '异常原因', key: 'reasonCode', type: 'select', searchType: 'eq', value: '', data: [],nonDictionary: true},
        {label: '是否可控', key: 'isControl', type: 'select', searchType: 'eq', value: '', data: [
					{label: '是', value: 'Y'},
					{label: '否', value: 'N'},
				],nonDictionary: true},
        { 
          label: '委托单位',
          key: 'custid',
          type: 'remoteSelect',
          data: [],
          saveList: [],
          clearable: true,
          searchType: 'eq',
          value: '',
          visibleChange: (val, item) => {
            val && this.getCustList('', item)
          },
          filterMehod: (val, item) => {
            this.getCustList(val, item)
          }
        },
        { 
          label: '业务类型',
          key: 'businessType',
          type: 'select',
          data: [],
          clearable: true,
          searchType: 'eq',
          value: '',
          filterable: true,
          nonDictionary: true,
          change: (val, item) => {
            this.setServiceCode(val, item)
          }
        },
        { 
          label: '服务项',
          key: 'serviceCode',
          type: 'select',
          data: [],
          clearable: true,
          searchType: 'eq',
          value: '',
          filterable: true,
          nonDictionary: true,
        },
      ],
      // table复选框多选的值
      selectedCheckbox: [],

      // table基础组件
      tableConfig: {
        style: {},
        tableIndex: {
          show: false
        },
        options: {
          // 是否支持解锁列表修改,默认锁定列表不可更改
          lockState: true,
          // 是否支持列表项选中功能
          mutiSelect: true,
          // 多选框状态判断 {false不可选, true可选}
          checkSelectable({excpId}) {
            return excpId ? true : false;
          },
        },
        list: [],
        configColumns: [],
        defaultColumns: ['excpNo', 'orderNo', 'businessType', 'serviceName', 'reasonTypeName', 'reasonName', 'excpPriority', 'handleStatus', 'excpContent', 'remark', 'chargeEmployeeName', 'startTime', 'expectHandleTime', 
        'blameSupplierId', 'blameEmployeeName', 'isCustComplain', 'responsibleName', 'isControl', 'custName'],
        specialColumns: [],
        allColumns: [
          {label: '异常编号', key: 'excpNo', prop: 'excpNo', width: 150, disabled: false, fixed: true, 
            formatter: (row, column) => {
              return `<el-button type="text" class="underline">${row.excpNo}</el-button>`
            },
            method: (index, row) => {
              this.handleInfo(row)
            }
          },
          {label: '工作号', key: 'orderNo', prop: 'orderNo', width: 150, disabled: false, fixed: true,
            formatter: (row, column) => {
              return `<el-button type="text" class="underline">${row.orderNo}</el-button>`
            },
            method: (index, row) => {
              this.handleOrderInfo(row)
            }
          },
          {label: '业务类型', key: 'businessType', prop: 'businessType', width: 120, disabled: false, formatter: (row, column) => {
            return getDictLabel('businessType', row.businessType)
          }},
          {label: '服务项', key: 'serviceName', prop: 'serviceName', disabled: false, width: 150},
          {label: '异常类型', key: 'reasonTypeName', prop: 'reasonTypeName', disabled: false, width: 150 },
          {label: '异常原因', key: 'reasonName', prop: 'reasonName', disabled: false, width: 150 },
          {label: '是否可控', key: 'isControl', prop: 'isControl', width: 100, disabled: false, 
              formatter: (row, column) => {
                return row.isControl === 'Y' ? '是' : row.isControl === 'N' ? '否' : ''
              }
          },
          // {label: '优先级', key: 'excpPriority', prop: 'excpPriority', disabled: false, width: 100, formatter: (row, column) => {
          //   return getDictLabel('exceptionPriority', row.excpPriority)
          // }},
          {label: '委托单位', key: 'custName', prop: 'custName', disabled: false, width: 150 },
          {label: '状态', key: 'handleStatus', prop: 'handleStatus', disabled: false, width: 100, formatter: (row, column) => {
            return getDictLabel('exceptionStatus', row.handleStatus)
          }},
          {label: '异常描述', key: 'excpContent', prop: 'excpContent', disabled: false, width: 150},
          {label: '备注', key: 'remark', prop: 'remark', disabled: false, width: 150},
          {label: '负责人', key: 'chargeEmployeeName', prop: 'chargeEmployeeName', disabled: false, width: 100},
          {label: '异常发生时间', key: 'startTime', prop: 'startTime', width: '150', disabled: false},
          {label: '期望解决时间', key: 'expectHandleTime', prop: 'expectHandleTime', width: '150', disabled: false},
          {label: '责任单位', key: 'blameSupplierId', prop: 'blameSupplierId', width: '150', disabled: false, formatter: (row, column) => {
            return row.blameSupplier ? row.blameSupplier.name : ''
          }},
          {label: '责任人', key: 'blameEmployeeName', prop: 'blameEmployeeName', width: 100, disabled: false},
          {label: '是否客户投诉', key: 'isCustComplain', prop: 'isCustComplain', width: 100, disabled: false, 
              formatter: (row, column) => {
                return getDictLabel('yesOrNoOptions', row.isCustComplain)
              }
          },
           {label: '责任方', key: 'responsibleName', prop: 'responsibleName', width: 100, disabled: false, formatter: (row, column) => {
            return row.responsibleName ? row.responsibleName : getDictLabel('responsibleType', row.responsibleType)
          }},
        ].map(item => {
          return {...item, minWidth: item.width}
        }),
        // 操作按钮组
        operationBtns: {
          minWidth: '120',
          fixed: 'right',
          show: true,
          callback: (action, $index, row, item) => {
            if (action === 'Info') {
              this.handleInfo(row);
            }

            if (action === 'Delete') {
              this.handleDelete(row);
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
              label: '删除',
              type: 'text',
              show: false,
              action: 'Delete'
            }
          ]
        },
        // 操作提示
        tips: {
          text: '',
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
      tableColumnsWidthList:[],
      // 显示自定义表头的弹窗状态
      customColumnsPopShow: false,
      isClickInfo: false,
      allTypeList: [],
      reasonList: [],
    }
  },
  created() {
    this.init();
    this.getBaseBusinessList()
    window.addEventListener('keydown', this.handleKeyDown)//开启监听键盘按下事件
  },
  mounted() {
    
  },
  destroyed(){
    window.removeEventListener('keydown',this.handleKeyDown)
  },
  computed: {
    ...mapState({
      currRole: state => state.order.currRole,
      dictMap: state => state.dict.dictMap,
      publishStatus: state => state.dict.dictMap.publishStatus
    })
  },
  watch: {
  },
  components: {
    Search,
    BaseTableMuti,
    TableFilter,
    CustomColumns
  },
  methods: {
    // 自定义列宽查询
		getTableColumnWidthInfo() {
			columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			}).then(res => {
				// console.log('res', res)
				// console.log('this.tableConfig.columns', this.tableConfig.columns)
				let {columnWidthList} = res.data
				// table列宽重新渲染
				this.tableConfig.columns.map(item => {
					let findItem = columnWidthList.find(ele => ele.column === item.prop)
					// 服务器返回的新的列宽宽度 
					let newWidth = findItem ? findItem.width : ''
					return Object.assign(item, {width: newWidth || item.width})
				})
				this.tableColumnsWidthList = this.getTableColumnsWidth()
				console.log('this.tableColumnsWidthList', this.tableColumnsWidthList)
			})
		},
		// 获取本地table列表的字段和宽为数组集合
		getTableColumnsWidth() {
			let result = this.tableConfig.columns.map(item => {
				return {column: item.prop, width: item.width}
			})
			return result
		},
		// 自定义列宽度保存
		handleSaveColumnWidth(params) {
			console.log(params)
			let data = this.tableColumnsWidthList.map(item => {
				if (item.column === params.prop) {
					item.width = params.width
				}
				return {...item}
			})
			columnWidthConfigSave({
				scenesCode: `${this.$route.name}`,
				columnWidthList: data
			}).then(res => {
			}).finally(() => {
			})
		},
    init() {
      let orderNo = this.$route.query.orderNo
      if (orderNo) {
        sessionStorage.setItem('workExceptionOrderNo', orderNo)
        this.tableQuery.handleStatus = 'all'
      }
    },
    mapOrderNo() {
      let workExceptionOrderNo = sessionStorage.getItem('workExceptionOrderNo')
      if (workExceptionOrderNo) {
        let ind = -1
        if (this.searchConfig) {
          ind = this.searchConfig.findIndex((item) => item.key === 'orderNo')
        }
        if (ind !== -1) {
          console.log('查询条件有orderNo字段')
          this.searchConfig.splice(ind, 1, {
            key: "orderNo",
            label: "工作号",
            searchType: "like",
            type: "input",
            value: workExceptionOrderNo,
          })
        } else {
          console.log('查询条件没有orderNo字段')
          this.searchConfig.push({
            key: "orderNo",
            label: "工作号",
            searchType: "like",
            type: "input",
            value: workExceptionOrderNo,
          })
        }
      }
      sessionStorage.removeItem('workExceptionOrderNo')
    },

    // 获取姓名
    getEmployeeName(val, item) {
      let data = {name: val ? val.replace(/^\s+|\s+$/g, '') : ''}
      baseEmployeeListName(data).then(res => {  
        // item.data = res.data.filter(item => item.status === 'on').map(ele => {
        //   return {
        //     value: ele.employeeId,
        //     label: this.$language === 'en' ? ele.ename : ele.cname
        //   }
        // })
        let filterArr = res.data.filter(ele => !item.saveList.find(o => o.value === ele.employeeId))
				let itemList = filterArr.map(ele => {
					return {...ele, label: this.$language === 'en' ? ele.ename : ele.cname, value: ele.employeeId ? Number(ele.employeeId) : ''}
				})
				item.data = [...item.saveList, ...itemList]
      })
    },
    getReasonTypeCode(val, item) {
       this.$store.dispatch('order/getWorkExceptionData')
       .then(obj => {
          item.data = obj.typeList,
          this.allTypeList = obj.allTypeList
          this.reasonList = obj.reasonList.map(o => {
              o.label = o.reasonName,
              o.value = o.reasonCode
              return o
          })
       })
    },
    setReasonTypeCode(val) {
       let obj = this.allTypeList.find(item => {
         return item.expTypeCode === val[1]
       })
       let oid = (obj && obj.oid) || ''
       let arr = this.reasonList.filter(item => {
         return item.typeId === oid
       })
       let idx = this.searchConfig.findIndex(item => {
         return item.key === 'reasonCode'
       })
       console.log(idx, arr)
       this.searchConfig.splice(idx, 1, {
         label: '异常原因',
         key: 'reasonCode',
         type: 'select', 
         searchType: 'eq',
         value: '', 
         data: arr,
         nonDictionary: true}
      )
    },
    getBaseBusinessList() {
      baseBusinessList({})
      .then(res => {
         let data = (res.data || []).map(item => {
           item['label'] = item.name
           item['value'] = item.businessType
           return item
         })
         let idx = this.searchConfig.findIndex(item => {
           return item.key === 'businessType'
         })
         this.searchConfig.splice(idx, 1, {
            label: '业务类型',
            key: 'businessType',
            type: 'select',
            data,
            clearable: true,
            searchType: 'eq',
            value: '',
            filterable: true,
            nonDictionary: true,
            change: (val, item) => {
              this.setServiceCode(val, item)
            }
          })
      })
    },
   setServiceCode(val) {
      if (val) {
         this.$store.dispatch('dict/queryBusinessServiceList', { businessType: val })
          .then(data => {
            let idx = this.searchConfig.findIndex(item => {
              return item.key === 'serviceCode'
            })
            this.searchConfig.splice(idx, 1, {
                label: '服务项',
                key: 'serviceCode',
                type: 'select',
                data,
                clearable: true,
                searchType: 'eq',
                value: '',
                filterable: true,
                nonDictionary: true,
            })
          })
      } else {
           let idx = this.searchConfig.findIndex(item => {
              return item.key === 'serviceCode'
            })
            this.searchConfig.splice(idx, 1, {
                label: '服务项',
                key: 'serviceCode',
                type: 'select',
                data: [],
                clearable: true,
                searchType: 'eq',
                value: '',
                filterable: true,
                nonDictionary: true,
            })
      }
      
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
			customerListAllStatus(data).then(res => {
				let list = res.data.list.map(ele => {
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
				let filterArr = newArr.filter(ele => !item.saveList.find(o => o.value === ele.value))
				let itemList = filterArr.map(ele => {
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
        // 阻止分页的页码enter键触发全局的监听事件
				let className = window.event.target.parentNode.className
				if (className.includes('el-pagination__editor')) return
        //触发的事件
        this.searchCallBack('Search')
      }
    },

    // 获取列表请求参数
    getListQuery() {
      let statusQuery = []
      if (this.tableQuery.handleStatus === 'all') {
         let str = this.dictMap.exceptionStatus.map(item => {
          return item.value
         }).join(',')
         statusQuery = [{ column: 'handleStatus', type: 'in', value: str }]
      } else {
         statusQuery = [{'column': 'handleStatus', 'type': 'eq', 'value': this.tableQuery.handleStatus}]
      }
      // 合并发布状态参数
      let data = {}
      Object.assign(data, this.tableQuery, {
        query: this.tableQuery.query.concat(statusQuery)
      })
      delete(data.handleStatus)
      
      return data
    },

    // 列表数据
    async getList() {
      let {data} = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			})
			let {columnWidthList} = data
      let query = this.getListQuery()
      //处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'excpNo','universalNo'].includes(item.column)) {
          // item.type = 'in'
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
      let idx = query.query.findIndex(item => item.column === 'reasonTypeCode')
      if (idx !== -1) {
         if (query.query[idx].value.length) {
           query.query[idx].value = query.query[idx].value[1]
         } else {
           query.query.splice(idx, 1)
         }
         
      }
      // 已取消tab增加取消字段显示
      if (this.tableQuery.handleStatus === 'cancel') {
        this.tableConfig.defaultColumns.push('reason')
        this.tableConfig.allColumns.push({label: '原因', key: 'reason', prop: 'reason', disabled: false},)
      } else {
        this.tableConfig.defaultColumns = this.tableConfig.defaultColumns.filter(item => item !== 'reason')
        this.tableConfig.allColumns = this.tableConfig.allColumns.filter(item => item.prop !== 'reason')
      }
      workExceptionList(query ).then(response => {
        let {list, totalCount, allColumns, configColumns, pageSize} = response.data;
        this.tableConfig.list = list;
        this.tableConfig.pagination.total = totalCount;
        this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
        this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
        this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
        this.tableConfig.pagination.isLastPage = response.data.isLastPage
        this.tableQuery.currPage = response.data.currPage
        this.tableConfig.configColumns = configColumns.length ? configColumns : this.tableConfig.defaultColumns;
        this.tableQuery.pageSize = pageSize
        this.handleFilterColumns(this.tableConfig.configColumns)
        // 设置列宽为服务器返回的新的列宽宽度 
				this.tableConfig.columns.map(item => {
					let findItem = columnWidthList.find(ele => ele.column === item.prop)
					let newWidth = findItem ? findItem.width : ''
					return Object.assign(item, {width: newWidth || item.width})
				})
				this.tableColumnsWidthList = this.getTableColumnsWidth()
				// this.getTableColumnWidthInfo()
      })
    },

    // 查询组件回调
    searchCallBack(action) {
      let query = []
      this.mapOrderNo()
      if (action === 'Search' || action === 'Update') {
        // 新增的查询条件组装tableQuery参数
        if (this.searchConfig.length) {
          this.searchConfig.forEach((item, index) => {
            let tempItem = {}
            if (item.value) {
              Object.assign(tempItem, {
                "column": item.key,
                "type": item.searchType || 'eq',
                "value": item.queryValue ? item.queryValue : item.value
              })
              query.push(tempItem)
            }
          })
        }
        Object.assign(this.tableQuery, {
          query: query,
          currPage: 1
        })
        this.getList()
      }

      if (action === 'Reset') {
        this.searchConfig.forEach(item => {item.value = ''})
        Object.assign(this.tableQuery, defaultTableQuery, {
          currPage: 1
        })
        this.getList()
        Object.assign(this.tableConfig, {tips: {text: "", show: false}})
      }
    },

    // 新建
    handleAdd() {
      this.routerPush('WorkExceptionDetail')
      // this.isClickInfo = true
      // this.$router.push({
      //   path: 'workExceptionDetail'
      // })
    },
    // 导出
    handleExport() {
       	let data = this.getListQuery()
        workExceptionListExport({
          ascColumns: data.ascColumns,
          descColumns: data.descColumns,
          query: data.query
        }).then(response => {
          let { filePath } = response.data
          window.location.href = filePath
        })
    },

    // 删除订单
    handleDelete(row) {
      
    },

    // 自定义表头
    handleCustomColumns() {
      this.customColumnsPopShow = true;
    },

    // 按状态筛选
    handleSearchByExceptionStatus() {
      this.tableQuery.currPage = 1
      this.getList()
    },

    // 多选
    handleMuti(arr) {
      this.selectedCheckbox = arr;
    },

    handleSizeChange() {
      this.getList()
    },

    handleCurrentChange() {
      let workExceptionOrderNo = sessionStorage.getItem('workExceptionOrderNo')
      !workExceptionOrderNo && this.getList()
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
      this.selectedCheckbox.forEach(item => {
        orderNos.push(item.orderNo)
      })
      return orderNos
    },

    // 去详情页
    handleInfo(row) {
      // this.isClickInfo = true
      this.routerPush('WorkExceptionDetail', {
        excpId: row.excpId,
        orderNo: row.orderNo
      })
      // this.$router.push({
      //   path: 'workExceptionDetail?excpId=' + row.excpId + '&orderNo=' + row.orderNo
      // })
    },

    handleOrderInfo(row) {
      // 跳订单详情页
      let { businessType, orderNo, serviceType } = row
      if (!businessType) return
      let name = ''
      if (businessType.includes('ship_')) {
        name = 'OrderDetail'
      } else if (businessType.includes('air_')) {
        name = 'AirTransportOrderDetail'
      } else if (businessType.includes('rail_')) {
        name = 'RailwayOrderDetail'
      }
      if (name) {
        let routeUrl = this.$router.resolve({
          name,
          params: {
            orderNo
          },
          query: {
            orderNo,
            showContainer: !['ship_export_lcl', 'ship_import_lcl', 'ship_oversea_wh', 'ship_bulk_ro'].includes(businessType),
            showBl: ['st01', 'st15', 'st03', 'st18', 'st09', 'st10', 'st11', 'st12', 'st24', 'st25', 'st02', 'st04'].includes(serviceType)
          }
        })
        window.open(routeUrl.href, '_blank')
      }
    },

    // 排序
    handleSort(query) {
      this.getList()
    },

    // 过滤显示自定义的表头
    handleFilterColumns(value) {
      let {allColumns, columns} = this.tableConfig
      console.log(allColumns)
      Object.assign(this.tableConfig, {
        columns: allColumns.filter((item, index) => {
          return value.includes(item.prop)
        })
      })
    },

    // 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
    getColumnsValues(value) {
      let result = []
      value.map(item => {
        if (this.tableConfig.specialColumns[item]){
          result = result.concat(this.tableConfig.specialColumns[item])
        } else {
          result.push(item)
        }
      })
      
      result = Array.from(new Set(result))
      return result
    },

    // 自定义表头关闭回调
    customColumnsPopClose(action, value) {
      this.customColumnsPopShow = false;
      if (action === 'Confirm') {
        let columnsKeys = this.getColumnsValues(value)
        
        Object.assign(this.tableQuery, {
          columns: columnsKeys
        })
        this.getList()
      }
    }
  }
}
</script>
<style lang="scss">
</style>
