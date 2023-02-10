<template>
<div>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form id="cnameDialog" ref="form" :model="formData">
      <el-row>
        <el-col :span="20">
          <el-row>
            <el-col :span="10">
              <el-form-item label="中文品名" prop="cname">
                <el-input v-model="formData.cname" size="small" maxlength='128'></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="HSCODE" prop="hscode">
                <el-input v-model="formData.hscode" size="small"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="4" class="search-btn-group">
          <el-button type="primary" size="mini" @click="handleSearch">搜索</el-button>
          <el-button type="default" size="mini" @click="reset">重置</el-button>
        </el-col>
      </el-row>
      <div>
        <div class="row-tit">
          <span class="tit">品名信息</span>
        </div>
        <div>
          <el-table
            :data="tableData"
            @current-change="clickRow"
            border
            highlight-current-row
            align="center"
            style="width: 100%;">
            <el-table-column 
              align="center" 
              label=""
              width="100px"
            >
              <template slot-scope="scope">
                <el-radio 
                  v-model="selectCargo" 
                  :label="scope.row"
                  width="40"
                  ><span></span></el-radio>
              </template>
            </el-table-column>
            <el-table-column
              prop="cname"
              align="center"
              label="中文品名">
            </el-table-column>
            <el-table-column
              prop="ename"
              align="center"
              label="英文品名"
              width="180">
            </el-table-column>
            <el-table-column
              prop="type"
              align="center"
              label="货物类型">
            </el-table-column>
            <el-table-column
              prop="mark"
              align="center"
              label="唛头">
            </el-table-column>
            <el-table-column
              prop="hscode"
              align="center"
              label="HSCODE"
              width="150">
            </el-table-column>
            <template slot="empty">
              暂无信息<el-button v-if="clickType!='planOut'" type="text" @click="addCnameFunc">，点击新增品名</el-button>
            </template>
          </el-table>
          <div style="margin-top:10px">
            <Pagination :config="tableConfig" :tableQuery="formData" :callback="tableCallBack" />
          </div>
        </div>
      </div>
    </el-form>
  </BaseDialog>
  <div v-if="showAddCnameDialog">
    <AddCnameDialog @close="closeAddCnameDialog" @handleConfirm="handleConfirm"></AddCnameDialog>
  </div>
</div>
</template>

<script>
import store from '@/store'
import FormItem from '@/components/Form/elFormItem'
import BaseDialog from '@/components/Base/Dialog/index'
import AddCnameDialog from './addCnameDialog'
import {getCargoList, listStock} from '@/api/order/list'
import {warehouseList} from '@/api/order/warehouse'
import Pagination from "@/components/Base/Table/newPagination"
const defaultPage = {
  pageSize: 10,
  currPage: 1
}
let defaultFormData = {
  totalCount: null,
  ascColumns: [],
  descColumns: [],
  custid: "",
  whId: "",
  batchNo: "",
  cname: "",
  hscode: ""
}
export default {
  data() {
    return {
      selectCargo:{},  // 选中列
      dialogConfig: {
          title: '添加品名',
          show: true,
          size: 'medium',
          width: '80%'
      },
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
      formData: Object.assign({}, defaultFormData, defaultPage, {orderNo: this.clickType=="planOut"?this.$route.query.orderNo:''}),
      tableData: [], // table列表数据
      showAddCnameDialog: false,
      whOptions: [], // 仓库下拉数据
      custOptions: [], // 客户下拉数据
    }
  },
  props: {
    clickType: ""
  },
  created() {
    this.getList()
  },
  computed: {
      
  },
  components: {
    BaseDialog,
    FormItem,
    AddCnameDialog,
    Pagination
  },
  methods: {
    getList() {
      let getListFun = this.clickType=="planOut"?listStock:getCargoList
      getListFun(this.formData).then(res => {
        let data = res.data.list
        if(this.clickType=="planOut") {
          data.map(item => item = Object.assign(item, item.cargoVo))
        }
        this.tableData = [...data]
        this.formData.totalCount = res.data.totalCount
        this.formData.currPage = res.data.currPage

        this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
        this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
        this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
        this.tableConfig.pagination.isLastPage = res.data.isLastPage
				this.tableConfig.pagination.total = res.data.totalCount
				this.formData.pageSize = res.data.pageSize
      })
    },
    handleSearch(){
      this.formData.currPage = 1
      this.getList()
    },
    // 搜索框重置
    reset(){
      this.formData = {...defaultFormData, ...defaultPage, orderNo: this.clickType=="planOut"?this.$route.query.orderNo:''}
      this.getList()
    },
    // 当一行被点中时
    clickRow(row) {
      this.selectCargo = row
    },
    // 点击新增品名
    addCnameFunc() {
      this.showAddCnameDialog = true
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        if(Object.keys(this.selectCargo).length > 0){
          this.$emit("handleConfirm", this.selectCargo)
          this.close('Confirm')
        }else {
          this.$message.error('请选择品名！');
        }
      } else {
        this.close('Cancel')
      }
    },
    // 新增货品回调
    handleConfirm(data) {
      this.$emit("handleConfirm", data)
      this.close('confirm')
    },
    closeAddCnameDialog(action) {
      if(action == "Confirm") this.close('confirm')
      this.showAddCnameDialog = false
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    // 仓库模糊查询
    wareHouseSearch(queryString) {
      let data = {
        "currPage": 1,
        "pageSize": 50,
        "warehouseName": queryString === true ? "" : queryString
      }
      warehouseList(data).then(res => {
        let list = res.data.list
        this.whOptions = list.filter(item => item.state === 'valid').map(item => {
          return {
            value: item.whId,
            label: item.warehouseName
          }
        })
      })
    },
    // 客户模糊查询
    customerSearch(val) {
      this.$store.dispatch('dict/queryCustomerList', val === true?'':val).then(data => {
        let list = data.list
        this.custOptions = list.map(o => {
          return {
            value: o.custid ? Number(o.custid) : '',
            label: this.$language=='en'?o.ename:o.name
          }
        })
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
  }
};
</script>

<style lang="scss">
.dialog-layout .row-tit {
    border-bottom: unset !important;
}
#cnameDialog {
  .el-form-item {
    display: flex;
    margin-bottom: 0;
    .el-form-item__content {
      margin-right: 10px;
      display: inline-block;
      flex: 1;
    }
  }
  .el-collapse-item__content {
    padding-top: 10px;
    font-size: 12px;
  }
  .row-tit {
    padding: 0 !important;
  }
  .el-table td {
    padding: 12px 0;
  }
  .search-btn-group{
    text-align: right;
    line-height: 30px;
  }
}
#deliveryContact {
  display: inline-block;
  .deliveryContact {
    width: 30%;
  }
  span {
    width: 10%;
    padding: 2%;
  }
  .deliveryContactPhone{
    width: 60%;
  }
}


</style>
