<template>
  <div class="edit-container order-book" id="guarantee" style="width:100%">
    <div class="order-container">
      <div class="tabs-container">
        <div class="detail-container flex">
          <div class="flex1 component-main-cont">
            <div class="service-container">
              <ServiceCustInfo :serverIsJoint="isJoint" @getServiceStatus="getServiceStatus" :orderInfo="orderInfo" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
              <div class="component-cont table-com-layout">
                <div class="mb10 between h28">
                  <div class="ft14 bold air-guarantee-title">保险</div>
                  <div class="el-button-group">
                    <el-button size="mini" type="default" @click="handleBlDeliveryApprove" :disabled="!isOp || isJoint || progressValue === 'finish'">放单申请</el-button>
                    <el-button size="mini" type="primary" class="ml10" :disabled="!isOp || isJoint || progressValue === 'finish' ||!(orderInfo.orderStatus != 'cancel' && orderInfo.orderStatus != 'close')" @click="handleAddRow">新增保险</el-button>
                  </div>
                </div>

                <el-table @selection-change="handleSelectionChange" class="insurance-table" ref="multipleTable" fit style="width: 100%" :data="list">
                  <el-table-column prop="goodsValue" label="货值" align="center" width="100">
                    <span v-if="scope.row.oid" slot-scope="scope">
                      {{ scope.row.goodsValue }}
                    </span>
                    <span v-else slot-scope="scope">
                      <el-input @blur="validData(scope.row)" size="mini" v-model="scope.row.goodsValue" placeholder="请输入"></el-input>
                    </span>
                  </el-table-column>
                  <el-table-column prop="currency" label="币种" align="center" width="100">
                    <span v-if="scope.row.oid" slot-scope="scope">
                      {{ scope.row.currency }}
                    </span>
                    <span v-else slot-scope="scope">
                      <el-select v-model="scope.row.currency" size="mini" clearable placeholder="请选择">
                        <el-option v-for="item in currencyList" :label="item.code" :value="item.code" :key="item.code"></el-option>
                      </el-select>
                    </span>
                  </el-table-column>
                  <el-table-column width="150" prop="policyHolderCustName" label="投保受益人公司" align="center">
                    <span v-if="scope.row.oid" slot-scope="scope">
                      <el-tooltip class="item" effect="dark" :content="scope.row.policyHolderCustName" placement="top">
                        <div class="column-text">
                          {{ scope.row.policyHolderCustName }}
                        </div>
                      </el-tooltip>
                    </span>
                    <span v-else slot-scope="scope">
                      <el-select default-first-option="" allow-create filterable v-model="scope.row.policyHolderCustId" size="mini" clearable placeholder="请选择">
                        <el-option v-for="item in customerList" :label="item.name" :value="item.custid" :key="item.custid"></el-option>
                      </el-select>
                    </span>
                  </el-table-column>
                  <el-table-column prop="payLocation" label="赔付地" align="center">
                    <span v-if="scope.row.oid" slot-scope="scope">
                      <el-tooltip class="item" effect="dark" :content="scope.row.payLocation" placement="top">
                        <div class="column-text">
                          {{ scope.row.payLocation }}
                        </div>
                      </el-tooltip>
                    </span>
                    <span v-else slot-scope="scope">
                      <el-select size="mini" v-model="scope.row.payLocation" clearable style="width: 100%" placeholder="请输入">
                        <el-option v-for="item in polPortList" :key="item.value" :label="item.label" :value="item.label"> </el-option>
                      </el-select>
                    </span>
                  </el-table-column>
                  <el-table-column prop="insuranceSupplierId" label="保险公司" width="150" align="center">
                    <span v-if="scope.row.oid" slot-scope="scope">
                      <el-tooltip class="item" effect="dark" :content="scope.row.insuranceSupplierName" placement="top">
                        <div class="column-text">
                          {{ scope.row.insuranceSupplierName }}
                        </div>
                      </el-tooltip>
                    </span>
                    <span v-else slot-scope="scope">
                      <el-select filterable v-model="scope.row.insuranceSupplierId" size="mini" clearable placeholder="请选择">
                        <el-option v-for="item in supplierList" :label="item.name" :value="item.supplierId" :key="item.supplierId"></el-option>
                      </el-select>
                    </span>
                  </el-table-column>
                  <el-table-column prop="issueMode" label="出单方式" align="center">
                    <span v-if="scope.row.oid" slot-scope="scope">
                      {{ valFilter(issueModeList, scope.row.issueMode) }}
                    </span>
                    <span v-else slot-scope="scope">
                      <el-select @change="changeIssue(scope.row)" v-model="scope.row.issueMode" size="mini" clearable placeholder="请选择">
                        <el-option v-for="item in issueModeList" :label="item.name" :value="item.value" :key="item.value"></el-option>
                      </el-select>
                    </span>
                  </el-table-column>
                  <el-table-column prop="invoiceNo" label="保单号" align="center">
                    <span v-if="scope.row.oid" slot-scope="scope">
                      {{ scope.row.invoiceNo }}
                    </span>
                    <span v-else slot-scope="scope">
                      <el-input v-model="scope.row.invoiceNo"></el-input>
                    </span>
                  </el-table-column>
                  <el-table-column prop="billFileNo" label="附件" align="center">
                    <span slot-scope="scope">
                      <div class="operate-group">
                        <el-button @click="handleView(scope.row)" type="text" size="mini">
                          <el-tooltip class="item" effect="dark" :content="scope.row.billFileNo" placement="top-start">
                            <span class="file-name-style">{{ scope.row.billFileNo }}</span>
                          </el-tooltip>
                        </el-button>
                      </div>
                    </span>
                  </el-table-column>
                  <el-table-column prop="billFileName" label="保单名称" align="center"> </el-table-column>
                  <el-table-column prop="isValid" label="是否有效" align="center">
                    <span slot-scope="scope">
                      <el-tooltip class="item" effect="dark" :content="valFilter(isValidList, scope.row.isValid)" placement="top">
                        <div class="column-text">
                          {{ valFilter(isValidList, scope.row.isValid) }}
                        </div>
                      </el-tooltip>
                    </span>
                  </el-table-column>
                  <el-table-column prop="retrieveStatus" label="取单状态" align="center">
                    <span slot-scope="scope">{{ scope.row.retrieveStatus === 'retrieved' ? '已取单' : '未取单' }}</span>
                  </el-table-column>
                  <el-table-column prop="retrieveFinishTime" width="100" label="取单完成时间" align="center">
                    <span slot-scope="scope">
                      {{ scope.row.retrieveFinishTime }}
                    </span>
                  </el-table-column>
                  <el-table-column prop="putStatus" label="放单状态" align="center">
                    <span slot-scope="scope">{{ scope.row.putStatus === 'finish' ? '已放单' : '未放单' }}</span>
                  </el-table-column>
                  <el-table-column prop="putFinishTime" width="100" label="放单完成时间" align="center"> </el-table-column>
                  <el-table-column prop="expressNo" label="快递单号" align="center"> </el-table-column>

                  <el-table-column fixed="right" width="220" label="操作" align="center">
                    <template slot-scope="scope">
                      <div class="operate-group">
                        <el-button type="text" size="mini" @click="handleDownload(scope.row)" v-if="scope.row.billFileName && scope.row.isValid === 'y'" :disabled="!isOp || isJoint || progressValue === 'finish'">下载</el-button>
                        <el-button v-if="!scope.row.billFileNo && scope.row.issueMode === 'telex_release'" @click="handleUploadFile(scope.row)" type="text" size="mini" :disabled="!isOp || isJoint || progressValue === 'finish'">上传附件</el-button>
                        <el-button v-if="!scope.row.billFileNo" @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="!isOp || isJoint || progressValue === 'finish'">删除</el-button>
                        <el-button v-if="scope.row.oid && scope.row.billFileNo" @click="handleInvalid(scope.row)" type="text" size="mini" :disabled="!isOp || isJoint || progressValue === 'finish'">失效</el-button>
                        <el-button v-if="!scope.row.oid" @click="handleSave(scope.row)" type="text" size="mini" :disabled="!isOp || isJoint || progressValue === 'finish'">保存</el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="'letter_of_guarantee'" /> -->
            </div>
            <JointWorkAssign :jointServiceWorkList="jointServiceWorkList" :serviceCode="serviceCode" @callback="jointWorkAssignCallback" />
          </div>
        </div>
      </div>
    </div>
    <!-- 放货申请弹窗 -->
    <div v-if="blDeliveryApproveShow">
      <BlDeliveryApprove @close="blDeliveryApprovePopClose" />
    </div>
    <div v-if="uploadShow">
      <BlFileUpload :oid="curRow.oid" @close="uploadPopClose" />
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { getDictLabel, getServiceCode } from '@/utils/tools'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import DocUpload from './components/docUpload.vue'
import { supplierList, customerList } from '@/api/crm/supplier.js'
import { baseCurrencyList } from '@/api/base'
import {
  insuranceList,
  insuranceDelete,
  insuranceInvalid,
  insurancePut
} from '@/api/order/list'
import BlFileUpload from '@/views/order/order/orderList/orderBook/components/batchUpload.vue'
import BlDeliveryApprove from '@/views/order/order/orderList/components/applyPut.vue'

export default {
  filters: {
    docNameFilter(docName) {
      return getDictLabel('guaranteeDocName', docName)
    }
  },
  mixins: [orderMixin, routerMixin],
  data() {
    return {
      polPortList: [],
      curRow: {},
      fileList: [],
      uploadShow: false,
      isValidList: [
        { name: '有效', value: 'y' },
        { name: '无效', value: 'n' }
      ],
      retrieveStatusList: [
        { name: '未取单', value: 'no_retrieve' },
        { name: '已取单', value: 'retrieved' }
      ],
      putStatusList: [
        { name: '未放单', value: 'INIT' },
        { name: '已放单', value: 'FINISH' }
      ],
      issueModeList: [
        { name: '正本', value: 'original' },
        { name: '电放', value: 'telex_release' }
      ],
      blDeliveryApproveShow: false,
      supplierList: [],
      customerList: [],
      currencyList: [],
      progressValue: '',
      formType: '',
      rowData: {},
      oQuery: this.$route.query,
      orderNo: this.$route.query.orderNo,
      list: [],
      multipleSelection: [],
      uploadPopShow: false,
      routeName: 'AirInsurance',
      activityKey: '',
      serviceCode: 'insurance'
    }
  },
  created() {
    this.getSupplierList()
    this.getCustomerList()
    this.getCurrencyList()
    this.getOrderInfo()
    this.getDocumentList()
    if (this.jointShow) {
      this.getJointServiceWorkList(this.serviceCode)
    }
  },
  mounted() {
    let businessType = JSON.parse(sessionStorage.custStr).businessType
    this.polPortList = [
      { label: '起运港', value: 'pol' },
      { label: '目的地', value: 'pod' }
    ]
    if (['rail_export_fcl', 'rail_export_lcl'].includes(businessType)) {
      this.polPortList = [
        { label: '起运站', value: 'pol' },
        { label: '目的站', value: 'pod' }
      ]
    }

    if (['ship_export_fcl'].includes(businessType)) {
      this.polPortList = [
        { label: '起运港', value: 'pol' },
        { label: '目的站', value: 'pod' }
      ]
    }
    if (['ship_export_lcl'].includes(businessType)) {
      this.polPortList = [
        { label: '装货地', value: 'pol' },
        { label: '目的地', value: 'pod' }
      ]
    }
  },

  computed: {
    ...mapState('order', ['orderList']),
    notDoc() {
      return (
        this.orderList.ordDetRole != 'doc' ||
        this.progressValue === 'finish' ||
        this.isJoint
      )
    }
  },
  props: {},
  components: {
    CancelApplyAlert,
    CancelAlert,
    RefuseAlert,
    TopNav,
    LeftNav,
    ServiceCustInfo,
    JointWorkAssign,
    // OneServiceFee,
    DocUpload,
    BlDeliveryApprove,
    BlFileUpload
  },

  methods: {
    changeIssue(val) {
      if (val.issueMode === 'original') {
        val.billFileName = ''
        this.fileList = null
      }
    },

    valFilter(list, val) {
      let item = list.find((item) => item.value === val)
      if (item) {
        return item.name
      }
      return ''
    },
    handleSave(row) {
      if (!row.issueMode) return this.$message.warning('请选择出单方式!')
      if (!row.invoiceNo) return this.$message.warning('请输入保单号!')

      let cusNameObj = this.customerList.find(
        (item) => item.custid === row.policyHolderCustId
      )
      let policyHolderCustName = ''
      let policyHolderCustId = 0
      if (cusNameObj) {
        policyHolderCustId = row.policyHolderCustId
        policyHolderCustName = cusNameObj.name
      } else {
        policyHolderCustId = 0
        policyHolderCustName = row.policyHolderCustId
      }
      let supplyNameObj = this.supplierList.find(
        (item) => item.supplierId === row.insuranceSupplierId
      )
      let supplyName = supplyNameObj ? supplyNameObj.name : ''
      let data = {
        orderNo: this.oQuery.orderNo,
        blId: 0,
        goodsValue: row.goodsValue,
        currency: row.currency,
        policyHolderCustId: policyHolderCustId,
        policyHolderCustName: policyHolderCustName,
        payLocation: row.payLocation,
        insuranceSupplierId: row.insuranceSupplierId,
        insuranceSupplierName: supplyName,
        invoiceNo: row.invoiceNo,
        issueMode: row.issueMode
      }
      let params = {
        data: data,
        fileName: this.fileList
      }
      this.$store
        .dispatch('order/soUpload', {
          uri: '/order/insurance/save',
          params: params
        })
        .then((res) => {
          if (res.data && res.data.code === 0) {
            this.$message.success('添加成功!')
            this.getDocumentList()
          }
        })
    },
    handleInvalid(row) {
      let data = {
        oid: row.oid
      }
      insuranceInvalid(data).then((res) => {
        if (res.code === 0) {
          this.$message.success('操作成功!')
          this.getDocumentList()
        }
      })
    },
    uploadPopClose(action, fileName) {
      this.uploadShow = false

      if (action === 'Confirm') {
        if (this.curRow.oid) {
          return this.getDocumentList()
        }
        this.fileList = fileName
        this.curRow.billFileName = fileName[0].name
      }
    },
    // 打开上传附件弹窗
    handleUploadFile(row) {
      this.curRow = row
      this.uploadShow = true
    },
    // 客户同意放货弹窗关闭回调
    blDeliveryApprovePopClose(action, value) {
      this.blDeliveryApproveShow = false
      if (action === 'Confirm') {
        let data = {
          orderNo: this.oQuery.orderNo,
          receiveName: value.receiveName,
          receivePhone: value.receivePhone,
          receiveAddress: value.receiveAddress,
          receiveRemark: value.receiveRemark,
          blId: 0
        }
        insurancePut(data).then((res) => {
          this.$message.success('申请成功!')
          this.getDocumentList()
        })
      }
    },
    // 打开放货申请弹窗
    handleBlDeliveryApprove(row) {
      if (this.list.every((item) => item.isValid === 'n')) {
        return this.$message.warning('没有有效数据,不能发起申请!')
      }
      this.blDeliveryApproveShow = true
    },
    //供应商列表
    getSupplierList() {
      supplierList({
        pageSize: 1000,
        query: [{ column: 'category', type: 'eq', value: 'insurance' }]
      }).then((res) => {
        this.supplierList = res.data && res.data.list
      })
    },
    validData(row) {
      let reg = /^\d+(\.\d{0,2})?$/
      if (!reg.test(row.goodsValue)) {
        row.goodsValue = ''
        this.$message.warning('只能输入最多包含两位小数的数字!')
      }
      if (row.goodsValue > 999999) {
        this.$message.warning('数字最大不能超过999999!')
        row.goodsValue = ''
      }
    },
    //客户列表
    getCustomerList() {
      customerList({ pageSize: 1000 }).then((res) => {
        this.customerList = res.data && res.data.list
      })
    },
    // 币别下拉列表
    getCurrencyList(queryString) {
      baseCurrencyList(queryString, 'valid').then((response) => {
        this.currencyList = response.data
      })
    },
    handleAddRow() {
      if (this.list.some((item) => !item.oid)) {
        return this.$message.warning('有未保存的数据,请先保存!')
      }
      //新增一行的时候把上次的文件清除
      this.fileList = []
      this.list.push({
        goodsValue: '',
        currency: '',
        policyHolderCustId: '',
        policyHolderCustName: '',
        payLocation: '',
        insuranceSupplierId: '',
        insuranceSupplierName: '',
        issueMode: '',
        invoiceNo: '',
        billFileNo: '',
        billFileName: '',
        isValid: '',
        retrieveStatus: '',
        retrieveFinishTime: '',
        putStatus: '',
        putFinishTime: '',
        expressNo: ''
      })
    },
    getJoint(val) {
      this.isJoin = val
    },
    getServiceStatus(val) {
      console.log('🚀 ~ val', val)
      this.progressValue = val
    },
    //编辑文件
    handleEdit(row) {
      console.log('🚀 ~ row', row)
      this.formType = 'edit'
      this.rowData = JSON.parse(JSON.stringify(row))
      if (!this.rowData.policyHolderCustId)
        this.rowData.policyHolderCustId = this.rowData.policyHolderCustName
      this.uploadPopShow = true
    },
    //上传附件
    uploadFile(row) {
      console.log('🚀 ~ row', row)
      this.formType = 'file'
      this.rowData = JSON.parse(JSON.stringify(row))
      this.uploadPopShow = true
    },
    //预览附件
    handleView(row) {
      this.$store.dispatch('order/previewFile', {
        fileNo: row.billFileNo,
        fileName: row.billFileName
      })
    },
    // 列表
    getDocumentList() {
      let data = {
        orderNo: this.oQuery.orderNo
      }
      insuranceList(data).then((res) => {
        this.list = res.data
        console.log('🚀 ~ this.list', this.list)
      })
    },

    // 获取多选
    handleSelectionChange(val) {
      this.multipleSelection = val
      console.log(this.multipleSelection)
    },

    handleDownload(item) {
      this.$store
        .dispatch('order/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: item.billFileNo
          }
        })
        .then((res) => {
          console.log(res)
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = item.billFileName
          link.click()
        })
    },

    validate() {
      return true
    },

    // 取消
    handleCancel() {
      this.showDetail = false
    },

    // 删除
    handleDelete(row, index) {
      this.$confirm('是否确认删除该条数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let data = { oid: row.oid, orderNo: row.orderNo }
          if (row.oid) {
            insuranceDelete(data).then((res) => {
              this.$message.success('删除成功!')
              this.getDocumentList()
            })
          } else {
            this.list.splice(index, 1)
          }
        })

        .catch(() => {})
    },
    // 打开上传附件弹窗
    handleAddFile() {
      this.formType = 'add'
      this.rowData = {}
      this.uploadPopShow = true
    },

    // 选择单证类型
    handleChangeDocName(val) {
      console.log(val)
    },

    jointWorkAssignCallback() {
      this.getJointServiceWorkList(this.serviceCode)
    }
  }
}
</script>
<style lang="scss">
@import '../../less/index.scss';

.insurance-table .cell.el-tooltip {
  overflow: hidden;
}
.gray-text {
  color: #c0c4cc;
}
.red-text {
  color: #ff0000;
}
.air-guarantee-title {
  color: #222;
}
</style>
