<template>
<BaseDialog :config="dialogConfig" :callback="dialogCallback">
  <div class="bl-log-table" style="min-height: 300px">
    <el-table fit highlight-current-row style="width: 100%" ref="logTable" :data="tableData" :max-height="tableHeight" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
      <el-table-column prop="bizTime" label="时间" align="center" width="150"></el-table-column>
      <el-table-column prop="bizEmployeeName" label="人员" align="center" width="150"></el-table-column>
      <el-table-column prop="bizDeptName" label="部门" align="center" width="150"></el-table-column>
      <el-table-column prop="content" label="关键节点" align="center" width="200"></el-table-column>
      <el-table-column prop="remark" label="备注" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.remarkObj">
            <div class="remark-table-row title" v-if="scope.row.remarkObj.length">
              <div class="fieldDesc">名称</div>
              <div class="fieldOrgValue">原值</div>
              <div class="fieldIndexValue">新值</div>
            </div>
            <div class="remark-table-row" v-for="(item, index) in scope.row.remarkObj" :key="index">
              <div class="fieldDesc">{{item.fieldDesc}}</div>
              <div class="fieldOrgValue">
                <template v-if="item.fieldOrgValueObj">
                  <div class="value-row" v-for="(ele, key) in item.fieldOrgValueObj" :key="key">
                    <span class="label">{{key}}: </span>
                    <span class="value" v-html="ele"></span>
                  </div>
                </template>
                <template v-else-if="item.fieldOrgValueArr">
                  <div v-for="(ele, index) in item.fieldOrgValueArr" :key="index">
                    <div class="value-row" v-for="(o, key) in ele" :key="key">
                      <span class="label">{{key}}: </span>
                      <span class="value" v-html="o"></span>
                    </div>
                  </div>
                </template>
                <span v-else>{{item.fieldOrgValue}}</span>
              </div>
              <div class="fieldIndexValue">
                <template v-if="item.fieldIndexValueObj">
                  <div class="value-row" v-for="(ele, key) in item.fieldIndexValueObj" :key="key">
                    <span class="label">{{key}}: </span>
                    <span class="value" v-html="ele"></span>
                  </div>
                </template>
                <template v-else-if="item.fieldIndexValueArr">
                  <div v-for="(ele, index) in item.fieldIndexValueArr" :key="index">
                    <div class="value-row" v-for="(o, key) in ele" :key="key">
                      <span class="label">{{key}}: </span>
                      <span class="value" v-html="o"></span>
                    </div>
                  </div>
                </template>
                <span v-else>{{item.fieldIndexValue}}</span>
              </div>
            </div>
          </div>
          <span v-else>{{scope.row.remark}}</span>
        </template>
      </el-table-column>
    </el-table>
    <table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
  </div>
  <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
</BaseDialog>
  
</template>
<script>
import store from '@/store'
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import {blLogList} from '@/api/order/bl'
import Pagination from "@/components/Base/Table/newPagination"

export default {
  data() {
    return {
      oQuery: this.$route.query,
			tableHeight: null,
			dialogConfig: {
				title: '日志',
				show: true,
				size: 'medium',
				width: '1200px',
				showBtns: false
			},
			tableData: [],
      tableConfig: {
        // 分页
        pagination: {
					pageSize: 10,
          show: true,
          total: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          isFirstPage: false,
          isLastPage: false
        },
      },
      tableQuery:{
        currPage: 1,
        pageSize: 10,
        columns: [],
        ascColumns: [],
        descColumns: ['bizTime'],
        query: [],
        blId: '',
        orderNo: ''
      },
      total: null,
      tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null // 行数据
      },
    }
  },
  props: {
    params: {
      type: Object,
      default: () => ({})
    },
  },
  created() {
    this.init()
  },
  mounted() {
    window.addEventListener('resize', this.getTableHeight)
    this.$nextTick(() => {
			this.getTableHeight()
		})
  },
  destroyed() {
		window.removeEventListener('resize', this.getTableHeight)
	},
  computed: {
    ...mapState({
      currRole: state => state.order.currRole,
      dictMap: state => state.dict.dictMap
    })
  },
  watch: {
    
  },
  components: {
    BaseDialog,
    tableTooltip,
    Pagination
  },
  methods: {
    // 鼠标移入cell
    showTooltip(row, column, cell) {
      this.tableCellMouse.cellDom = cell
      this.tableCellMouse.row = row
      this.tableCellMouse.hidden = false
    },
    // 鼠标移出cell
    hiddenTooltip() {
      this.tableCellMouse.hidden = true
    },
    getTableHeight() {
			console.log('dialog-height', document.body.clientHeight *0.8);
			let dialogCont = document.body.clientHeight *0.8
			this.tableHeight = dialogCont-34-48
		},
    // 初始化
    init() {
      this.getList()
    },
    isJSON(str) {
      if (typeof str == 'string') {
        try {
          let obj = JSON.parse(str)
          if (typeof obj == 'object' && obj ) {
            return true
          } else {
            return false
          }
        } catch(e) {
          console.log('error：'+str+'!!!'+e)
          return false
        }
      }
    },
    getList() {
      Object.assign(this.tableQuery, {
        blId: this.params.blId,
        orderNo: this.$route.query.orderNo
      })
      blLogList(this.tableQuery).then(res => {
        this.tableData = res.data.list.map(item => {
          if (item.remark && this.isJSON(item.remark)) {
            item.remarkObj = JSON.parse(item.remark)
            if(item.remarkObj && item.remarkObj.length) {
              item.remarkObj.map(ele => {
                // console.log('this.isJSON(ele.fieldOrgValue)', typeof ele.fieldOrgValue, ele.fieldOrgValue);
                // 数组,对象的数据处理
                if (ele.fieldOrgValue && Object.prototype.toString.call(ele.fieldOrgValue) === '[object Array]') {
                  ele.fieldOrgValueArr = ele.fieldOrgValue
                } else if (ele.fieldOrgValue && typeof ele.fieldOrgValue === 'object') {
                  ele.fieldOrgValueObj = {}
                  for (var i in ele.fieldOrgValue) {
                    ele.fieldOrgValueObj[i] = ele.fieldOrgValue[i].toString().replace(/\n/g, '<br>') 
                  }
                }
                // 数组,对象的数据处理
                if (ele.fieldIndexValue && Object.prototype.toString.call(ele.fieldIndexValue) === '[object Array]') {
                  ele.fieldIndexValueArr = ele.fieldIndexValue
                } else if (ele.fieldIndexValue && typeof ele.fieldIndexValue === 'object') {
                  ele.fieldIndexValueObj = {}
                  for (var i in ele.fieldIndexValue) {
                    ele.fieldIndexValueObj[i] = ele.fieldIndexValue[i]
                  }
                }
                return {...ele}
              })
            }
          }
          return {...item}
        })
        console.log('this.tableData', this.tableData)
        this.total = res.data.totalCount

        this.tableQuery.currPage = res.data.currPage
				this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
        this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
        this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
        this.tableConfig.pagination.isLastPage = res.data.isLastPage
				this.tableConfig.pagination.total = res.data.totalCount
				this.tableQuery.pageSize = res.data.pageSize
      })
    },
    // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
		// 分页
		handleSizeChange() {
			this.getList()
		},
		handleCurrentChange() {
			this.getList()
		},
    close(action, value) {
			this.$emit('close', action, value)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.close('Confirm')
			} else {
				this.close('Cancel')
			}
		}
  }
}
</script>
<style lang="scss" scoped>
.bl-log-table{
  .remark-table-row{
    width: 100%;
    margin: 0 auto;
    border-collapse: separate;
    border-spacing: 0px;
    border-left: 1px dashed #e9e9e9;
    display: table;
    color: #777;
    white-space: normal;
    &.title{
      border-top: 1px dashed #e9e9e9;
    }
    .fieldDesc{
      display: table-cell;
      // float: left;
      // display: inline-block;
      width: 20%;
      border-right: 1px dashed #e9e9e9;
      border-bottom: 1px dashed #e9e9e9;
      padding: 5px;
    }
    .fieldOrgValue{
      display: table-cell;
      // float: left;
      // display: inline-block;
      width: 40%;
      border-right: 1px dashed #e9e9e9;
      border-bottom: 1px dashed #e9e9e9;
      padding: 5px;
    }
    .fieldIndexValue{
      display: table-cell;
      // float: left;
      // display: inline-block;
      width: 40%;
      border-right: 1px dashed #e9e9e9;
      border-bottom: 1px dashed #e9e9e9;
      padding: 5px;
    }
    .value-row{
      display: flex;
      .label{
        display: block;
        width: 50px;
        text-align: left;
      }
      .value{
        display: block;
        flex: 1;
        text-align: left;
      }
    }
  }
  /deep/ .el-table .cell {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
	}
}
</style>