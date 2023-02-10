<template>
<div id="vgmPage" class="edit-row">
  <div class="edit-container so">
    <div class="row-tit so">
      <span class="tit">VGM信息</span>
      <div class="row-tit-operate">
        <div class="">
          <span class="mr10">申报状态</span> 
          <el-select v-model="status" size="mini" placeholder="请选择" clearable style="width:120px" @change="handleUpdateStatus" :disabled="isBd">
            <el-option v-for="(item, index) in dictMap.vgmStatus" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </div>
        <div class="el-button-group">
          <el-button size="mini" type="default" class="ml10" @click="handleAdd" :disabled="isBd">新增委托</el-button>
        </div>
      </div>
    </div>
    <div class="row-form mt10 table-com-layout">
      <el-table ref="vgmTable" stripe :data="tableList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" min-width="50"></el-table-column>
        <el-table-column prop="cn" label="箱号" align="center"> </el-table-column>
        <el-table-column prop="state_cn" label="VGM申报状态" align="center" width="100"> </el-table-column>
        <el-table-column prop="totalWeight" label="VGM总重" align="center"> </el-table-column>
        <el-table-column prop="charge" label="VGM负责人" align="center" width="100"> </el-table-column>
        <el-table-column prop="chargePhone" label="VGM电话" align="center" width="100"> </el-table-column>
        <el-table-column prop="chargeEmail" label="VGM邮箱" align="center" width="100"> </el-table-column>
        <el-table-column prop="address" label="VGM地址" align="center" width="120"> </el-table-column>
        <el-table-column prop="custName" label="VGM负责公司" align="center" width="120"> </el-table-column>
        <el-table-column prop="weightAddress" label="称重地址" align="center" width="120"> </el-table-column>
        <el-table-column prop="declareEmployeeName" label="VGM申报人" align="center" width="100"> </el-table-column>
        <el-table-column prop="declareTime" label="VGM申报时间" header-align="center" width="150"> </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right"> 
          <template slot-scope="scope">
            <div class="operate-group">
              <el-button @click="handleDetail(scope.row)" type="text" size="mini" :disabled="isBd">详情</el-button>
              <el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="isBd">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <div class="agentDetail" v-show="showDetail">
    <el-form ref="form" label-position="top" label-width="80px">
        <div class="row-tit">
          <span class="tit">{{!createItem.reportId ? 'VGM新增' : 'VGM详情'}}</span>
          <div class="row-tit-operate">
            <el-button type="default" size="mini" class="ml10" @click="handleCancel">取消</el-button>
            <el-button type="primary" size="mini" class="ml10" @click="handleSave" :disabled="isBd || createItem.status === 'declared'">保存</el-button>
          </div>
        </div>
    </el-form>
    <el-form ref="createItem" :model="createItem" :rules="rules">
      <!-- <div class="row-cont-tit">
        <div style="float:right;">
          <el-checkbox style="margin-right: 10px" v-model="isReport">是否申报</el-checkbox>
        </div>
      </div> -->
      <div class="row-flex flex-cargo ml10">
        <el-form-item label="关联箱号" prop="cn" style="width:16.5%; padding:0 12px 10px 0;">
          <el-select size="mini" placeholder="请输入" v-model="createItem.cn" style="width: 100%" clearable @change="handleSelectCn">
            <el-option
              v-for="(item, index) in cnOptions"
              :key="index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="VGM总量" prop="totalWeight" style="width:16.5%;padding:0 12px 10px 0;">
          <el-input size="mini" placeholder="请输入" v-model="createItem.totalWeight" clearable></el-input>
        </el-form-item>
        <el-form-item label="柜重" prop="emptyWeight" style="width:16.5%;padding:0 10px 12px 0;">
          <el-input size="mini" placeholder="请输入" v-model="createItem.emptyWeight" clearable></el-input>
        </el-form-item>
        <div class="flex-item mb12">
          <div class="item-label"><span class="lab">VGM责任公司</span><span class="error-tip"></span></div>
          <el-select size="mini" 
            style="width: 100%" 
            placeholder="请选择" 
            v-model="createItem.custId"
            clearable
            filterable @visible-change="(val) => {getCustVisibleChange(val)}"
            :filter-method="(val) => {getCustVisibleChange(val)}"
            @change="(val) => {handleChangeSupplier(val)}">
            <el-option v-for="(item, index) in supplierOptions" :key="index" 
              :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="flex-item mb12">
          <div class="item-label"><span class="lab">VGM负责人姓名</span><span class="error-tip"></span></div>
          <el-input size="mini" placeholder="请输入" v-model="createItem.charge" clearable></el-input>
        </div>
        <div class="flex-item mb12">
          <div class="item-label"><span class="lab">VGM负责人电话</span><span class="error-tip"></span></div>
          <el-input size="mini" placeholder="请输入" v-model="createItem.chargePhone" clearable></el-input>
        </div>
        <div class="flex-item mb12">
          <div class="item-label"><span class="lab">VGM邮箱</span><span class="error-tip"></span></div>
          <el-input size="mini" placeholder="请输入" v-model="createItem.chargeEmail" clearable></el-input>
        </div>
        <div class="flex-item mb12">
          <div class="item-label"><span class="lab">VGM地址</span><span class="error-tip"></span></div>
          <el-input size="mini" placeholder="请输入" v-model="createItem.address" clearable></el-input>
        </div>
        <div class="flex-item mb12">
          <div class="item-label"><span class="lab">称重时间</span><span class="error-tip"></span></div>
          <elDatePickerLimit size="mini"
            v-model="createItem.weightTime"
            type="date"
            style="width: 100%"
            clearable
            placeholder="请选择"
            value-format="yyyy-MM-dd" />
        </div>
        <div class="flex-item mb12">
          <div class="item-label"><span class="lab">称重地址</span><span class="error-tip"></span></div>
          <el-input size="mini" placeholder="请输入" v-model="createItem.weightAddress" clearable></el-input>
        </div>
        <div class="flex-item mb12">
          <div class="item-label"><span class="lab">VGM申报人</span><span class="error-tip"></span></div>
          <el-select
            size="mini" 
            :filterable='true'
            v-model="createItem.declareEmployeeId"
            style="width: 100%" 
            clearable 
            placeholder="请选择"
            @visible-change="(val) => {getdeclareVisibleChange(val)}"
            :filter-meethod="(val) => {getdeclareVisibleChange(val)}"
            @change="handleChangeEmployee">
            <el-option v-for="o in employeeOptions"
              :key="o.key"
              :label="o.value"
              :value="o.key">
            </el-option>
          </el-select>
        </div>
        <div class="flex-item mb12">
          <div class="item-label"><span class="lab">VGM申报时间</span><span class="error-tip"></span></div>
          <elDatePickerLimit size="mini"
            v-model="createItem.declareTime"
            type="date"
            style="width: 100%"
            clearable
            placeholder="请选择"
            value-format="yyyy-MM-dd" />
        </div>
      </div>
    </el-form>
  </div>
</div>
</template>
<script>
import {mapState} from 'vuex'
import { vgmList, vgmSave, vgmDelete, vgmUpdateStatus} from '@/api/order/vgm'
import { baseEmployeeListName, baseSupplierList } from '@/api/base'
import { getDictLabel } from '@/utils/tools'
import {orderContainerList} from '@/api/order/list'
const defaultCreateQuery ={
  reportId: undefined,
  address: "",
  charge: "",
  chargeEmail: "",
  chargePhone: "",
  cn: "",
  declareEmployeeId: '',
  declareEmployeeName: "",
  declareTime: "",
  emptyWeight: '',
  orderNo: "",
  so: "",
  isReport: "n",
  custId: '',
  custName: "",
  totalWeight: '',
  weightAddress: "",
  weightTime: "",
  containerId: null,
  status: '',
}
const defaultQuery = {
  currPage: 1,
  pageSize: 30,
  query:[{"column":"custName","type":"default","value":""}]
}

export default {
  name:"vgm",
  props: {
    tabMenus: {
      type: Array,
      default: () => ([])
    }
  },
  components: {
  },
  data() {
    return {
      oQuery: this.$route.query,
      tableList: [],
      isReport: false,
      status: '',
      multipleSelection: [],
      showDetail:false,

      createItem: Object.assign({}, defaultCreateQuery),
      employeeOptions:[],
      supplierOptions:this.createItem && [{label: this.createItem.supplierName, value: this.createItem.supplierId}] || [],
      // 发货单位下拉搜索
      supplierQuery: Object.assign({}, defaultQuery),
      // 表单校验
      rules: {
        cn: [
          { required: true, message: "不能为空", trigger: "change" }
        ],
        totalWeight: [
          { required: true, message: "不能为空", trigger: "blur" }
        ],
        emptyWeight: [
          { required: true, message: "不能为空", trigger: "blur" }
        ],
      },
      cnOptions: [],  // 箱号列表
    }
  },
  created() {
    this.getVgmList()
    this.getContainerList()
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      ordDetRole: state => state.airTransport.orderList.ordDetRole
    }),
    jointState() {
      return this.oQuery.jointNo ? true : false
    },
    isAc() {
      return this.ordDetRole === 'ac'
    },
    isDoc() {
      return this.ordDetRole === 'doc'
    },
    isOp() {
      return this.ordDetRole === 'op'
    },
    isBd() {
      let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.isAc || this.isDoc
      let findItem = this.tabMenus.find(item => item.code === 'vgm')
      let isJoint = findItem ? findItem.isJoint : false
      return isBd || isJoint
    },
  },
  methods: {
    // 获取列表
    getVgmList() {
      let param = {
        orderNo: this.oQuery.orderNo,
        jointNo: this.oQuery.jointNo
      }
      vgmList(param).then(response => {
        response.data && response.data.length && response.data.map(item => item.state_cn = getDictLabel("vgmStatus", item.status || 'no_declare'))
        this.tableList = response.data
      })
    },
    // 新建委托
    handleAdd(action) {
      Object.assign(this.createItem, {}, defaultCreateQuery)
      this.isReport = false
      this.showDetail = true;
    },

    // 详情修改
    handleDetail(row){
      this.showDetail = true;
      for (let i in this.createItem) {
        this.createItem[i] = row[i]
      }
      if (!this.createItem.declareEmployeeId || this.createItem.declareEmployeeId === 0) {
        this.createItem.declareEmployeeId = ''
      }
      this.isReport = row.isReport == 'y' ? true : false
      this.employeeOptions = [{value: this.createItem.declareEmployeeName, key: this.createItem.declareEmployeeId}]
      this.supplierOptions = [{label: this.createItem.custName, value: this.createItem.custId}]
    },
    validate() {
      let reg = /^\d+(\.\d+)?$/
      if (!reg.test(this.createItem.emptyWeight)) {
        this.$message({type: 'error', message: '请输入正确的柜重'})
        return false
      }
      if (!reg.test(this.createItem.totalWeight)) {
        this.$message({type: 'error', message: '请输入正确的vgm总量'})
        return false
      }
      return true
    },
    // 保存
    handleSave() {
      // this.createItem.status = data.status ? data.status : 'no_declare'
      this.createItem.orderNo = this.oQuery.orderNo
      this.createItem.jointNo = this.oQuery.jointNo
      this.$refs["createItem"].validate(valid => {
        if (valid) {
          if (!this.validate()) return
          vgmSave(this.createItem).then(res=>{
            this.$message({
              type: 'success',
              message: '保存成功',
              duration: 1000
            })
            this.showDetail = false
            this.getVgmList()
          })
        }
      })
    },

    // 删除
    handleDelete(row) {
      const reportId = row.reportId;
      this.$confirm('是否确认删除?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return vgmDelete({reportId, jointNo: this.oQuery.jointNo, orderNo: this.oQuery.orderNo});
      }).then(response => {
        // 删除和打开详情的信息为同一条时，该条信息的详情则不显示
        if (this.createItem.reportId === row.reportId) {
          this.showDetail = false
        }
        this.getVgmList()
        this.$message({message: '删除成功', type: 'success'})
      }).catch(() => {});
    },

    // 取消
    handleCancel() {
      this.showDetail = false
    },

    // 选择箱子cn
    handleSelectCn(val) {
      let sItem = this.cnOptions.find(item => item.value === val)
      this.createItem.containerId = sItem.oid
    },

    // 获取申报人下拉选项
    getdeclareVisibleChange(val) {
      if(val === true) val = ''
      this.employeeSelectlist(val)
    },

    // 选中申报人下拉
    handleChangeEmployee(val) {
      if (val) {
        let item = this.employeeOptions.filter(o => {
          return o.value === val
        })
        this.createItem.declareEmployeeName = item.label
      } else {
        this.createItem.declareEmployeeId = ''
        this.createItem.declareEmployeeName = ''
      }
    },
    
    // 获取责任人公司
    getCustVisibleChange(val) {
      if(val === true) val = ''
      this.getSupplierList(val)
    },

    // 获取发货单位
    getSupplierList(val) {
      this.$store.dispatch('dict/queryCustomerList', val).then(res => {
        let list = res.list
        this.supplierOptions = list.map(o => {
          return {
            value: o.custid ? Number(o.custid) : '',
            label: this.$language=='en'?o.ename:o.name
          }
        })
      })
    },

    // 下拉选择责任人公司
    handleChangeSupplier(val) {
      if (val) {
        let item = this.supplierOptions.filter(o => {
          return o.value === val
        })
        this.createItem.custName = item[0].label
      } else {
        this.createItem.custId = ''
        this.createItem.custName = ''
      }
    },
    // 员工列表
    employeeSelectlist(queryString) {
      let data = {
        "state": "valid",
        "name": queryString
      }
      this.$store.dispatch('dict/employeeSelectlist', data).then(data => {
        this.employeeOptions = data
      })
    },

    // 获取多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
      console.log(this.multipleSelection);
    },

    // 获取reportIds
    getReportIds() {
      let reportIds = [];
      this.multipleSelection.map(item => {
        reportIds.push(item.reportId)
      })
      return reportIds
    },

    // 更新状态
    handleUpdateStatus(val) {
      if (!val) return
      if (this.multipleSelection.length === 0) {
        this.status = ''
        return this.$message.error('请勾选一条要更新状态的vgm')
      }
      this.$confirm('是否确认修改状态?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let reportIdS = this.getReportIds()
        return vgmUpdateStatus({
          jointNo: this.oQuery.jointNo,
          orderNo: this.oQuery.orderNo,
          status: val,
          reportIds: reportIdS
        })
      }).then(response => {
        this.$message({
          type: 'success',
          message: '更新状态成功',
          duration: 1000,
          onClose: () => {
            this.status = ''
            this.getVgmList()
          }
        })
      }).catch(err => {
        this.status = ''
      })
    },

    // 箱号
    getContainerList() {
      orderContainerList({orderNo: this.oQuery.orderNo}).then(res => {
        this.cnOptions = res.data.filter(item => item.cn).map(item => {
          return Object.assign(item, {
            label: item.cn,
            value: item.cn
          })
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  @import "../../../less/index.scss";
  #vgmPage .edit-container.so, #vgmPage .agentDetail{
    padding-bottom: 20px;
  }
  .row-tit-operate{
    float:right;
  }
  .flex-item{
    width: 16.5% !important;
  }
  .flex-item:nth-child(13), .flex-item:nth-child(14){
    width: 49.5% !important;
  }

  .el-form-item {
    margin-bottom: 0px !important;
    float: left !important;
  }


  .el-form-item__content {
    line-height: 20px;
  }
</style>
<style>
  .el-form-item__label, .el-form-item__content{
    line-height: 20px !important;
  }
</style>