<template>
  <div class="wrap" ref="layout">
    <organize-tree :addTree="true" :editTree="true" :deleteTree="true" :style="treeStyle" ref="organizeTree" @bindSelectData="getSelectTree" :draggable="true"></organize-tree>
    <div class="memberinfo" ref="right">
      <div class="finance-page"
        v-loading="loading"
        :element-loading-text="eLoadingText"
        :element-loading-spinner="eLoadingSpinner"
        :element-loading-background="eLoadingBackground"
      >
        <div class="prepay">
          <FinanceSearch
            :searchOption="searchOption1"
            @search="search"/>
          <div class="finance-search-list-gap"></div>
          <div class="finance-list-container">
            <div class="money-box">
              <div class="money-box-left">
                <el-button-group>
                  <el-button style="float:left;margin-top:16px" size="mini" class="adminBtn" type="primary" @click="showDetail()">新增组织</el-button>
                </el-button-group>
              </div>
              <div class="money-box-right">
              </div>
            </div>
            <FinanceTableMass
              :option="option1"
              @send-multi="sendMulti"/>
          </div>
        </div>
      </div>
     </div>
     <div v-if="departSaveVisable">
      <DepartSave ref="departSave" @refreshDataList="getPageRefresh"/>
     </div>
      
    </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mapGetters } from 'vuex'
import organizeTree from '@/components/organize-tree';
import Pagination from '@/components/Base/Table/pagination'
import DepartSave from './departSave'
import {departmentList} from '@/api/companyResource'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
export default {
  mixins: [mixin, mixin2],
  data() {
    return {
      deptCode:'',
      searchOption1: {},
      option1: {},
      // 初始表头
      selfColumnsBase: [
        {
          disabled: true,
          prop: 'deptCname',
          label: '组织中文简称',
          width:"140px",
        },
        {
          disabled: true,
          prop: 'deptEname',
          label: '组织英文名称',
          width:"140px",
        },
        {
          prop: 'deptFullCname',
          label: '组织中文全称',
          type: 'text',
        },
        {
          prop: 'deptFullEname',
          label: '组织英文全称',
          type: 'text',
        },
        {
          prop: 'deptCode',
          label: '组织编码',
          type: 'text',
        },
        {
          prop: 'deptType',
          label: '组织类别',
          type: 'select',
          propInDict:"deptType"
        },
        {
          prop: 'finCode',
          label: '财务代码',
          type: 'text',
        },
        {
          prop: 'selfSettle',
          label: '独立核算',
          type:"select",
          propInDict: 'yesNo',
          width: 150,
        },
        {
          prop: 'unitName',
          label: '结算分公司',
          type: 'select',
          width: 150,
        },
        {
          prop: 'publicEmpName',
          label: '公共员工',
          type: 'text',
          width: 120,
        },
        {
          prop: 'state',
          label: '是否有效',
          type: 'select',
          propInDict:'state'
        },
        {
          prop: 'isExpenseEntry',
          label: '是否可录费用',
          type: 'select',
          width: 100,
          propInDict:'yesNo'
        },
        {
          prop: 'isPublic',
          label: '是否公共部门',
          type: 'select',
          propInDict:'yesNo',
           width: 100,
        },
        {
          prop: 'deptSubType',
          label: '部门类型',
          type: 'select',
          propInDict:'deptSubType',
           width: 100,
        },
        {
          prop: 'managerName',
          label: '负责人',
          type: 'text',
           width: 100,
        },
        {
          prop: 'dutyScope',
          label: '负责范围',
          type: 'select',
          propInDict:'dutyScope',
          width: 100
        }
      ],
      visible: false,
      departSaveVisable:false,
      disabled: true,
      name: '',
      // 查询条件
      tableQuery: {
       columns: [],
       query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
       currPage:1,
       pageSize:10
      },
      queryForm:{
        name:'',
        fullName:'',
        deptCode:'',
        state:''
      },
      tableConfig: {
        style: {},
        tableIndex: {
          show: false
        },
        // 操作提示
        tips: {
          text: '',
          show: false
        },
        // 分页
        pagination: {
          show: true,
          total: 0
        }
      },
      orgId: '',
      departmentList: [],
      loading: false,
      dataListSelections: [],
      selectedItem: '',
      radio: '',
      treeStyle: {
        height: 0
      },
      organizeData: {},
      // 表格高度
      tableHeight: 300
    };
  },
  components: {
    DepartSave,
    organizeTree,
    Pagination,
    FinanceTableMass,
    FinanceSearch
  },
  created() {
    // 搜索配置
    this.searchOption1 = {
      addFilter:{
        callback: true,
        // 初始搜索条件数
        defaultSearchLength: 3,
        // 条件数组
        searchInputGroup: [
          { key: 'name', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'state', value: '', showType: '2', range: { min: '', max: '' } },
          { key: 'deptCode', value: '', showType: '3', range: { min: '', max: '' } },

        ],
        filterGroups: {
          //1
          name: { label: '组织中文简称',  type: 'input',  showType: '1'  },
          fullName: { label: '组织中文全称',  type: 'input',  showType: '1'  },
          state: { label: '是否有效',  type: 'select', prop:'state', showType: '1'  },
          isExpenseEntry: { label: '是否可录费用',  type: 'select', prop:'yesNo', showType: '1'  },
          deptCode: { label: '组织编码',  type: 'input',  showType: '1'  },
          deptSubType: { label: '部门类型',  type: 'select',  prop:'deptSubType', showType: '1'  },
          managerId: { 
            label: '负责人',
            type: 'remoteSelect',
            clearable: true,
            showType: '3',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList({name:queryString,roleCodes:''}, item),
            visibleChange: (queryString, item) => this.getEmployeeList({name:queryString,roleCodes:''}, item),
           },
          dutyScope: { label: '负责范围',  type: 'select',  prop:'dutyScope', showType: '1'  }
        },
      }
    }
    let pagination = Object.assign({}, this.option.pagination, {
      show: true
    })
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '查看',
          type: 'text',
          show: true,
          action: 'showDetail'
        }
      ]
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [
        ... this.option.data
      ],
      tips: {
        text: '',
        show: false
      },
      pagination,
      operationBtns,
      sortChange: (column, prop, order) => {
				this.descColumns = order == 'descending' ? [prop] : []
				this.ascColumns = order == 'ascending' ? [prop] : []
				this.getData()
			},
      maxHeight: this.getFinanceTableMaxHeight,
    })
    let columns = [...this.selfColumnsBase]
		this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
		// console.log(this.configColumns)
		this.selfColumnsBase.forEach((item) => (item.sortable = true))
		this.option1.columns = columns
    
  },
 computed: {
    ...mapGetters([
      'dictMap'
    ]),
 },
  mounted() {
   this.getData();
   this.getTreeData();
  },
  methods: {
    getPageRefresh(){
     this.getData();
     this.getTreeData();
    },
     handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    getTreeData() {
      this.$refs.organizeTree.requestTreeData({state:'valid'});
      if(this.deptCode){
        this.searchOption1.data.deptCode = this.deptCode
      }
    },
    getSelectTree(data, checked, indeterminate, addSelectedOption) {
      if (data) {
        this.organizeData = data;
        this.organizeData.addSelectedOption = addSelectedOption;
        this.deptCode = data.deptCode;
        
        this.search();
      }
    },
    // 获取数据列表
    getList(isSearch) {
      this.loading = true;
      this.initQueryForm(isSearch)
      departmentList(this.tableQuery).then(res=>{
        let {totalCount} = res.data
        this.tableConfig.pagination.total = totalCount;
        this.departmentList = res.data.list
        this.loading = false
      })
    },
    getData(params, isSearch) {
      let data ={
        "currPage": this.option1.pagination.currPage,
        "pageSize": this.option1.pagination.pageSize,
        "columns":[],
        "ascColumns": params && params.order === 'ascending' ? [params.prop] : [],
        "descColumns": params && params.order === 'descending' ? [params.prop] : [],
        "query":[]
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
        let { key, value, range, req, valueReq } = item
        if (range.min || range.max) {
          if (range.min) {
            data.query.push({
              column: key + 'Min',
              type: 'eq',
              value: range.min,
            })
          }
          if (range.max) {
            data.query.push({
              column: key + 'Max',
              type: 'eq',
              value: range.max,
            })
          }
          return
        }
        if (!value) return
        if (typeof value !== 'object') {
          if(valueReq && item[valueReq] && item.key === 'recvCorpName' && item.value !== ''){
            data.query.push({
              column: valueReq,
              type: 'eq',
              value:  item[valueReq],
            })
            console.log(item[valueReq]);
          }
          return data.query.push({
            column: key,
            type: 'eq',
            value: req || value,
          })
        }
        if (key === 'recvCorpCode' || key === 'payStatus') {
          if (!value.length) return
          data.query.push({
            column: key,
            type: 'eq',
            value: value.join(','),
          })
        }else{
          data.query.push({
            column: key + 'Start',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[0]),
          })
          data.query.push({
            column: key + 'End',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[1]),
          })
        }
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({ column: 'confirmStatus', type: 'eq', value: this.buttonSearch })
      }
      if (this.deptCode) {
        data.query.push({ column: 'deptCode', type: 'eq', value: this.deptCode })
      }
      if(isSearch){
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      departmentList(data).then(res => {
        if (res.code === 0) {
          if (res.data.configColumns && res.data.configColumns.length) {
            let columns = res.data.configColumns
            this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
            this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
            this.configColumns = res.data.configColumns
          }
          console.log(res);
          let { list } = res.data
          let data = []
          list.forEach(item => {
            // Object.assign(item,item.payInfo)
            data.push(item)
          })
          this.option1.data = data
          this.table1DataBackup = [
            ... this.option1.data
          ]
          this.option1.pagination.currPage = res.data.currPage
          this.option1.pagination.pageSize = res.data.pageSize
          this.option1.pagination.totalCount = res.data.totalCount
        }
      }).finally(() => {
				this.loading = false
			})
    },
    initQueryForm(isSearch){
      let obj=this.queryForm;
      let query = []
        Object.keys(obj).forEach(function(key){
            if(obj[key]){
              //默认的查询条件组装tableQuery参数
              let tempQuery = {}
                Object.assign(tempQuery, {
                  "column": key,
                  "type": 'eq',
                  "value": obj[key]
                })
                query.push(tempQuery)
            }
        })
        if(isSearch){
         this.searchBackup = query
        }
        this.tableQuery.query = this.searchBackup || []
    },
    // 设置table头部样式
    tableHeaderColor({ row, rowIndex, column, columnIndex }) {
      if (rowIndex === 0) {
        return 'font-size:14px;color:#333;';
      }
    },
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    // 表单清除
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.queryForm.status = '';
    },
    // 手动勾选
    handleSelected(rows, row) {
      let selected = rows.length == 1;
      if (selected) {
        this.disabled = false;
      } else {
        this.disabled = true;
      }
    },
    // 新增 / 修改
    showDetail(data) {
      this.departSaveVisable = true;      
      this.$nextTick(() => {
        this.$refs.departSave.init(data);
      });
    },
     // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      // Add、Export、CustomColumns、ChangeLockState、Muti、SizeChange、CurrentChange、SingleEdit
      // MultiEdit、 MultiPublish、MultiInvalid、MultiDelete
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    // 表单搜索
    search(data, reset) {
      if(reset === true){
        this.deptCode = ''
      }
      this.buttonSearch = data
      this.option1.pagination.currPage = 1
      this.getData(null, true)
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
      let data2 = {
				"ascColumns": [],
				"descColumns": [],
				"query": []
			}
			let ids = this.multipleSelection1.map(item => {
				return item.applyNo
			}).join(',')
			if (ids) {
				data2.query.push({
					"column": "applyNoList",
					"type": "eq",
					"value": ids
        })
			} else {
				data2.query = this.searchBackup || []
			}
    },
  }
};
</script>

<style lang="scss" scoped>
/deep/ .finance-page{
  margin: 14px 0 !important;
}
.wrap {
  // 树结构
  .organize-tree {
    background: #f5f5f5;
    border: 1px solid #ccc;
    ::v-deep .el-tree {
      color: #232326;
    }
    // 搜索框
    ::v-deep.el-input__inner,
    ::-webkit-input-placeholder {
      color: #666;
      font-weight: 400;
    }

    // 目录
    ::v-deep.custom-tree-node {
      font-size: 12px;
    }
    // 选中效果
    ::v-deep.el-tree-node_bgc {
      background: #0080e1 !important;
      color: #fff !important;
    }
  }
 .menu{
   .filter-containe {
     display: flex;
     flex-direction: row;
     justify-content: flex-start;
     font-size: 12px;
     color: #333;
     align-items: baseline;
     flex-wrap: wrap;
     .filter{
         display: flex;
         // flex: 1;
         flex-direction: row;
         justify-content: flex-start;
         flex-wrap: wrap;
         
     }
     .filter-item {
         display: inline-block;
         vertical-align: middle;
     }
   }
   
   .input-container-dialog {
     float: left;
     display: flex;
     flex-direction: row;
     justify-content: flex-end;
     align-items: center;
     margin: 10px 0 20px;
     margin-right: 25px;
     
     span.filter-txt {
         min-width: 80px;
         text-align: right;
     }
   }
   .el-dialog__header {
       background:#2D3A5D;
       padding: 10px 20px 10px;
       span{
         padding: 10px;
         color: #fff;
         font-size: 12px;
       }
       .el-dialog__headerbtn {
       top: 15px;
   }
   }
   .el-table th>.cell{
     color:#222222;
   }
   .el-tag {
        background-color: #fff; 
        color: #4A4A4A; 
        border-style: none; 
   }
   .dialog-add{
     margin-top:16px;
     .el-button {
       border: 1px dashed #DCDFE6;
     }
   }
   .input-width{
      width:150px;
   }
   .m-t-8{
     margin-top:8px;
   }
  .el-input__prefix{
    line-height: 28px;
    color:#000000;
  }
  .el-input--prefix .el-input__inner {
    padding-left: 45px;
  }
 
}
 .operation-btns-box{
    padding-left:10px;
  }
}

.memberinfo {
  overflow: hidden;
  ::v-deep .el-card__body {
    padding-bottom: 0;
  }
}
</style>
