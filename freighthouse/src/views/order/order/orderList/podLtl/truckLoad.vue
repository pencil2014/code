<template>
  <div class="edit-container" id="polLtlDetail">
    <div class="component-cont table-com-layout">
      <div class="between btLine" id="saveBar">
        <div class="ft12 h20 bold">派车委托单：{{createItem.intrustNo}} </div>
        <div class="">
          <el-button size="mini" class="ml10" @click="handleCancelDetail">取消</el-button>
          <el-button size="mini" type="primary" class="ml10" @click="handleSave()" :disabled="!(isDoc || isEpricing ||isEcs) || isDisabledEdit">保存</el-button>
        </div>
      </div>
      <div class="between btLine isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
        <div class="ft12 h20 bold">派车委托单：{{createItem.intrustNo}} </div>
        <div class="">
          <el-button size="mini" class="ml10" @click="handleCancelDetail">取消</el-button>
          <el-button size="mini" type="primary" class="ml10" @click="handleSave()" :disabled="!(isDoc || isEpricing ||isEcs) || isDisabledEdit">保存</el-button>
        </div>
      </div>
      <el-form ref="saveForm" :model="createItem" :rules="rules" label-width="100px" style="margin-top: 10px">
        <el-row>
          <el-col :span="6">
            <el-form-item label="委托编号" prop="intrustNo" :show-message="false">
              <el-input size="mini" placeholder="请输入" v-model="createItem.intrustNo" disabled clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="海外代理" prop="overseaAgentId" :show-message="false">
							<el-select v-if="orderInfo.businessType ==='ship_import_lcl'" style="width: 100%" placeholder="请选择" size="mini" v-model="createItem.overseaAgentId" clearable remote :filterable="true" @visible-change="agentSupplierVisibleChange" :filter-method="agentSupplierFilterMehod" @change="handleSelectAgentSupplierName" :disabled="isBd || isDisabledEdit">
                <el-option v-for="(item, index) in agentSupplierList" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <el-select v-else style="width: 100%" clearable placeholder="请选择" size="mini" v-model="createItem.overseaAgentId" @change="handleSelectAgentSupplierName">
                <el-option v-for="(item, index) in agentSupplierList" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="车队" prop="supplierId">
              <el-select style="width: 100%" placeholder="请选择" size="mini" v-model="createItem.supplierId" clearable :filterable="true" @visible-change="supplierVisibleChange" :filter-method="supplierFilterMehod" @change="handleSelectSupplierName" :disabled="isBd || isDisabledEdit">
                <el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="车队联系人" prop="supplierContact">
              <el-autocomplete style="width: 100%" size="mini" clearable v-model="createItem.supplierContact" :fetch-suggestions="(queryString, cb) => querySearchContact(queryString, cb)" placeholder="请输入车队联系人" :disabled="isBd || isDisabledEdit" @select="value => handleSelectContact(value)" :maxlength="16"></el-autocomplete>
              <!-- <el-input size="mini" placeholder="请输入车队联系人" v-model="createItem.supplierContact" clearable :disabled="isBd" @blur="validContact('supplierContact')"></el-input> -->
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="车队联系人电话" prop="supplierContactPhone">
              <el-input size="mini" placeholder="请输入车队联系人电话" v-model="createItem.supplierContactPhone" clearable :disabled="isBd || isDisabledEdit" maxlength="16"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="派车类型" prop="dispatchType">
              <el-select size="mini" placeholder="请选择派车类型" v-model="createItem.dispatchType" clearable style="width: 100%" disabled>
                <el-option v-for="item in polLtlDispatchType" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="注意事项" prop="remark">
              <el-input type="textarea" rows="1" size="mini" placeholder="请输入" v-model="createItem.remark" clearable :disabled="isBd || isDisabledEdit" show-word-limit maxlength="512"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="between mt10">
          <div class="ft14"></div>
          <div class="el-button-group">
            <el-button size="mini" type="primary" class="ml10" @click="handleAdd()" :disabled="!(isDoc || isEpricing ||isEcs) || isDisabledEdit">新增地址</el-button>
          </div>
        </div>
        <el-table ref="table" fit border style="width: 100%" :data="tableData" class="border-table column-table mt04">
          <el-table-column prop="custName" label="客户名称" align="center" width="150"> </el-table-column>
          <el-table-column label="装货地点" width="150" align="center">
            <template slot-scope="scope">
              {{ scope.row.loadProvince + scope.row.loadCity }}
            </template>
          </el-table-column>
          <el-table-column prop="loadAddress" label="装货详细地址" align="center" width="150"></el-table-column>
          <el-table-column prop="loadContact" label="装货人" align="center"></el-table-column>
          <el-table-column prop="loadContactPhone" label="装货人电话" align="center" width="120"></el-table-column>
          <el-table-column prop="preLoadTime" label="委托装货时间" align="center" width="150"></el-table-column>
          <el-table-column prop="loadTime" label="实际到场时间" align="center" width="150"></el-table-column>
          <el-table-column label="卸货地点" align="center" width="150">
            <template slot-scope="scope">
              {{ scope.row.unloadProvince + scope.row.unloadCity }}
            </template>
          </el-table-column>
          <el-table-column prop="unloadAddress" label="卸货详细地址" align="center" width="150"></el-table-column>
          <el-table-column prop="unloadContact" label="卸货人" align="center"></el-table-column>
          <el-table-column prop="unloadContactPhone" label="卸货人电话" align="center" width="120"></el-table-column>
          <!-- <el-table-column prop="postcode" label="邮政编码" align="center"></el-table-column> -->
          <el-table-column label="货品信息" align="center">
            <template slot-scope="scope">
              <el-button type="text" class="underline" @click="handleViewCargo(scope.row)">查看</el-button>
            </template>
          </el-table-column>
          <el-table-column label="司机姓名" align="center" prop="driverName"></el-table-column>
          <el-table-column label="司机电话" align="center" prop="driverPhone"></el-table-column>
          <el-table-column label="车牌号" align="center" prop="licensePlate"></el-table-column>
          <el-table-column label="签收证明" align="center" width="350">
            <template slot-scope="scope">
              <div class="operate-group">
                <el-tooltip effect="dark" :content="scope.row.signFileName" placement="top" v-if="scope.row.signFileName">
                  <el-button type="text" size="mini" @click="handleViewFile(scope.row)">{{scope.row.signFileName}}</el-button>
                </el-tooltip>
                <el-button @click="handleUpload(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || isDisabledEdit" v-if="!scope.row.signFileNo && createItem.status === 'dispatched'">上传</el-button>
                <el-button @click="handleDeleteFile(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || isDisabledEdit" v-if="scope.row.signFileNo && detailData.status === 'dispatched'">删除</el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="signTime" label="签收时间" align="center" width="150"></el-table-column>
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template slot-scope="scope">
              <div class="operate-group">
                <el-button @click="handleInfo(scope.row, scope.$index)" type="text" size="mini">详情</el-button>
                <el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || isDisabledEdit">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
    </div>
    <div v-if="ltlDeliveryInfoShow">
      <LtlDeliveryInfo @close="ltlDeliveryInfoClose" :addressData="addressData" />
    </div>
    <div v-if="showCargoDialog">
      <CargosDialog :cargosList="cargosList" @close="closeDialog"></CargosDialog>
    </div>
    <div v-if="uploadFileShow">
      <FileUpload :param="uploadFileQuery" @close="uploadFilePopClose"></FileUpload>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { supplierInfo, customerInfo } from '@/api/crm/supplier'
import {
  ltlIntrustSave,
  ltlFileDelete
} from '@/api/order/podService/ltlDelivery'
import LtlDeliveryInfo from './components/ltlDeliveryInfo'
import CargosDialog from './components/cargosDialog'
import FileUpload from './components/fileUpload'
import { listOverseasSelect } from '@/api/order/list'
const defaultCreateQuery = {
  oid: undefined,
  // orderNo: '',
  intrustNo: '',
  status: '',
  loadType: '',
  intrustType: 'out',
  // dispatchStatus: '',
  overseaAgentId: '',
  overseaAgentName: '',
  supplierId: '',
  supplierName: '',
  supplierContact: '',
  supplierContactPhone: '',
  remark: '',
  dispatchType: 'deliver',
  loadInfoList: []
}
export default {
  filters: {},
  props: {
    detailData: {
      type: Object,
      default: () => ({})
    },
    orderInfo: {
      type: Object,
      default: () => ({})
    },
    isDisabledEdit: {
			type: Boolean,
			default: false
		},
    saveBarFixed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      oQuery: this.$route.query,
      supplierList: [],
      rules: {
        intrustNo: [{ required: true, message: ' ', trigger: 'blur' }],
        overseaAgentId: [{ required: true, message: ' ', trigger: 'change' }]
      },
      createItem: Object.assign({}, defaultCreateQuery),
      tableData: [],
      ltlDeliveryInfoShow: false,
      addressType: '',
      addressData: {},
      clickRowIndex: '', // 点击的row索引
      showCargoDialog: false,
      cargosList: [],
      uploadFileShow: false,
      uploadFileQuery: {},
      agentSupplierList: [],
      restaurants: [], // 供应商所有值
      contactInfo: []
    }
  },
  created() {
    this.setInit()
		if(this.orderInfo.businessType ==='ship_export_lcl'){
			this.getListOverseas()
		}
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      orderNo: (state) => state.order.orderNo,
      custid: (state) => state.order.custid,
      ordDetRole: (state) => state.order.orderList.ordDetRole,
      userEditRoles: (state) => state.order.orderList.userEditRoles,
      polLtlDispatchType: (state) => state.orderService.polLtlDispatchType,
      serviceInfoList: (state) => state.order.serviceInfoList
    }),
    isAc() {
      return this.ordDetRole === 'ac'
    },
    isDoc() {
      if (
        this.orderInfo.businessType === 'ship_import_lcl' &&
        this.ordDetRole === 'op'
      ) {
        return true
      }
      return this.ordDetRole === 'doc'
    },
    isEpricing() {
      return this.userEditRoles.includes('epricing')
    },
    isEcs() {
      return this.userEditRoles.includes('ecs')
    },
    isOp() {
      return this.ordDetRole === 'op'
    },
    isBd() {
      return (
        this.ordDetRole === 'bd' ||
        this.ordDetRole === 'obd' ||
        (!this.isDoc && !this.isEpricing && !this.isEcs) ||
        this.isJoint
      )
    },
    isJoint() {
      let serviceInfo = this.serviceInfoList.find(
        (item) => item.serviceCode === 'pod_ltl_delivery'
      )
      let isJoint = serviceInfo ? serviceInfo.isJoint : ''
      return isJoint === 'y' && !this.$route.query.jointNo ? true : false
    },
    viewState() {
      return this.truckDetailQuery.action === 'view' && !this.isOp
    },
    styleObject() {
      // 顶部距离文档
      let offsetTop = document.querySelector('.tabs-container').offsetTop
      return this.saveBarFixed
        ? {
            left: '120px',
            top: offsetTop + 24 + 'px'
          }
        : {}
    }
  },
  components: {
    LtlDeliveryInfo,
    CargosDialog,
    FileUpload
  },
  watch: {
    detailData: {
      handler(newVal) {
        console.log('detailData', newVal)

        // this.createItem = Object.assign({}, defaultCreateQuery, newVal)
        this.setInit()
      },
      deep: true
    }
  },
  methods: {
    getListOverseas() {
      listOverseasSelect({ orderNo: this.$route.query.orderNo }).then((res) => {
        console.log('createItem.overseaAgentId', this.createItem.overseaAgentId, this.createItem.overseaAgentName);
        
        this.agentSupplierList = res.data || []
        this.agentSupplierList.forEach((item) => {
          Object.assign(item, {
            label: item.name,
            value: Number(item.code)
          })
        })
        if (this.createItem.overseaAgentId && !this.agentSupplierList.find(item => item.value === this.createItem.overseaAgentId)) {
          this.agentSupplierList.push({label: this.createItem.overseaAgentName, value: this.createItem.overseaAgentId})
        }
      })
    },
    validContact(val) {
      let message = ''
      message =
        val === 'supplierContact'
          ? '车队联系人'
          : val === 'supplierContactPhone'
          ? '车队联系人电话'
          : ''
      if (this.createItem[val].length > 16) {
        this.createItem[val] = this.createItem[val].slice(0, 16)
        return this.$message.warning(message + '输入不能超过16位字符')
      }
    },
    setInit() {
      this.createItem = Object.assign({}, defaultCreateQuery, this.detailData)
      this.tableData = this.detailData.loadInfoList || []
      this.agentSupplierList = [{ label: this.detailData.overseaAgentName, value: this.detailData.overseaAgentId }]
      this.supplierList = [
        {
          label: this.detailData.supplierName,
          value: this.detailData.supplierId
        }
      ]
      // 获取车队联系人信息
      if (this.createItem.supplierId) {
        supplierInfo({ supplierId: this.createItem.supplierId }).then((res) => {
          let { contact } = res.data
          this.restaurants = this.loadAll(contact)
        })
      }
    },
    supplierFilterMehod(val) {
      this.getSupplierList(val)
    },
    supplierVisibleChange(val) {
      if (val) {
        this.getSupplierList()
      }
    },
    getSupplierList(val = '') {
      this.$store
        .dispatch('dict/querySupplierList', {
          category: 'serviceCode',
          value: 'truck',
          queryString: val
        })
        .then((data) => {
          this.supplierList = data.list.map((item) => {
            return Object.assign(item, {
              label: item.name,
              value: item.supplierId ? Number(item.supplierId) : ''
            })
          })
        })
    },
    // 选择车队下拉，自动填充车队联系人，联系电话
    handleSelectSupplierName(val) {
      if (val) {
        let label = this.supplierList.filter((o) => o.value === val)[0].label
        this.createItem.supplierName = label
        supplierInfo({ supplierId: val }).then((res) => {
          let { contact } = res.data
          Object.assign(this.createItem, {
            supplierContact:
              contact && contact.length
                ? contact[0].name || contact[0].ename
                : '',
            supplierContactPhone:
              contact && contact.length ? contact[0].mobileNo : ''
          })
          this.restaurants = this.loadAll(contact)
        })
      } else {
        Object.assign(this.createItem, {
          supplierName: '',
          supplierContact: '',
          supplierContactPhone: ''
        })
      }
    },
    querySearchContact(queryString, cb) {
      let restaurants = this.restaurants
      let results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants
      cb(results)
    },
    handleSelectContact(item) {
      if (item.value) {
        for (let i = 0; i < this.contactInfo.length; i++) {
          if (item.value === this.contactInfo[i].value) {
            Object.assign(this.createItem, {
              supplierContactPhone: this.contactInfo[i].mobileNo
            })
            return
          }
        }
      }
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        )
      }
    },
    loadAll(data) {
      let arr = []
      for (let i = 0; i < data.length; i++) {
        let obj = {}
        obj.value = data[i].name || data[i].ename
        obj.mobileNo = data[i].mobileNo
        arr.push(obj)
      }
      this.contactInfo = arr
      return arr
    },
    agentSupplierFilterMehod(val, row) {
      this.getAgentSupplierList(val, row)
    },
    agentSupplierVisibleChange(val, row) {
      if (val) {
        this.getAgentSupplierList(undefined, row)
      }
    },
    getAgentSupplierList(val = '', row) {
      this.$store
        .dispatch('dict/querySupplierList', {
          category: 'category',
          value: 'dest_agent',
          queryString: val
        })
        .then((data) => {
          this.agentSupplierList = data.list.map((item) => {
            return Object.assign({}, item, {
              label: this.$language == 'en' ? item.ename : item.name,
              value: item.supplierId ? Number(item.supplierId) : ''
            })
          })
          if (this.createItem.overseaAgentId && !this.agentSupplierList.find(item => item.value === this.createItem.overseaAgentId)) {
            this.agentSupplierList.push({label: this.createItem.overseaAgentName, value: this.createItem.overseaAgentId})
          }
          // row.agentSupplierList = this.agentSupplierList
          console.log(this.agentSupplierList)
        })
    },
    // 选择海外代理人
    handleSelectAgentSupplierName(val) {
      if (val) {
        let findItem = this.agentSupplierList.find((item) => item.value === val)
        this.createItem.overseaAgentName = findItem ? findItem.label : ''
      }
    },
    handleCancelDetail() {
      this.$emit('hideDetail')
    },
    handleSave() {
      this.$refs.saveForm.validate((valid) => {
        if (valid) {
          let data = Object.assign({}, this.createItem)
          data.orderNo = this.oQuery.orderNo
          data.jointNo = this.oQuery.jointNo
          data.loadType = 'scatter'
          data.loadInfoList = this.tableData
          if (!this.tableData.length)
            return this.$message({ type: 'error', message: '装货信息不能为空' })
          ltlIntrustSave(data).then((res) => {
            this.$emit('hideDetail', 'save')
            this.$message({ type: 'success', message: '保存成功' })
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 新增地址弹窗
    handleAdd() {
      let cargos = this.orderInfo.cargoList.map((item) => {
        if (item.packageInfo) {
          item.packageType = item.packageInfo
        }
        return Object.assign({}, item)
      })
      this.ltlDeliveryInfoShow = true
      this.addressType = 'add'
      this.addressData = {
        baseFile: {},
        cargoInfoList: cargos
      }
    },
    handleInfo(row, index) {
      this.addressData = Object.assign({}, row, {
        loadPlace: [row.loadProvince, row.loadCity],
        unloadPlace: [row.unloadProvince, row.unloadCity],
        status: this.detailData.status
      })
      this.clickRowIndex = index
      this.addressType = 'info'
      this.ltlDeliveryInfoShow = true
      console.log('addressData', this.addressData)
    },
    handleDelete(row, sIndex) {
      this.$confirm('是否确认删除该条数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.tableData = this.tableData.filter(
            (item, index) => index !== sIndex
          )
        })
        .catch((err) => {
          console.log('err')
        })
    },
    ltlDeliveryInfoClose(action, values) {
      if (action === 'Confirm') {
        console.log('新增地址弹窗回调', values)
        if (this.addressType === 'add') {
          this.tableData.push(values)
        }
        if (this.addressType === 'info') {
          this.$set(this.tableData, this.clickRowIndex, values)
          // this.tableData[this.clickRowIndex] = data
          // this.tabldData = data
        }
      }
      this.ltlDeliveryInfoShow = false
    },
    handleViewCargo(row) {
      this.showCargoDialog = true
      this.cargosList = row.cargoInfoList
    },
    closeDialog() {
      this.showCargoDialog = false
    },
    handleUpload(row, index) {
      this.uploadFileShow = true
      this.clickRowIndex = index
      Object.assign(this.uploadFileQuery, row, {
        intrustNo: this.createItem.intrustNo
      })
    },
    uploadFilePopClose(action, values) {
      console.log(action, values)
      this.uploadFileShow = false
      if (action === 'Confirm') {
        // this.$set(this.tableData, this.clickRowIndex, Object.assign(this.tableData[this.clickRowIndex], values))
        this.$emit('importFile', this.createItem.intrustNo)
      }
    },
    handleDeleteFile(row, index) {
      this.$confirm('是否确认删除该条数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let data = {
            intrustNo: this.createItem.intrustNo,
            loadId: row.loadId,
            orderNo: this.$route.query.orderNo,
            jointNo: this.$route.query.jointNo
          }
          return ltlFileDelete(data)
        })
        .then((response) => {
          this.$message({
            message: '删除成功',
            type: 'success',
            duration: 1000,
            onClose: () => {
              this.$emit('importFile', this.createItem.intrustNo)
            }
          })
        })
        .catch(() => {})
    },
    handleViewFile(row) {
      this.$store.dispatch('order/previewFile', {
        fileNo: row.signFileNo,
        fileName: row.signFileName
      })
    }
  }
}
</script>
<style lang="scss">
@import '../../less/index.scss';
#polLtlDetail .el-form-item {
  margin-right: 8px;
  margin-bottom: 4px;
}
#polLtlDetail .between {
  &.isFixed {
    position: fixed;
    background-color: #fff;
    z-index: 999;
    padding: 5px 20px;
    height: 30px;
    box-shadow: 4px 0px 10px 0px #e9e9e9;
    top: 24px;
    // top: 64px;
    right: 0;
    .tit {
      line-height: 20px;
    }
  }
}
</style>
