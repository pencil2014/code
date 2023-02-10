<template>
  <div class="order-book-info edit-container">
    <div class="head" v-if="isOp">
      <div class="title"></div>
      <div>
        <el-button size="mini" type="primary" @click="handleSave" :disabled="isDisabled">保存</el-button>
        <el-button size="mini" type="danger" @click="handRefuse" v-if="currentBkgStatus!=='BOOK_RELEASE'" :disabled="isDisabled">拒绝</el-button>
        <el-button size="mini" @click="handleOutputLetter" :disabled="!isOp || isDisabled">输出托书</el-button>
        <el-button size="mini" @click="handShipment" :disabled="!isOp ||bookDetailForm.isTransportCheck === 'Y' || isDisabled">货物出运</el-button>
      </div>
    </div>
    <el-form :inline="true" :model="formData" :show-message="false" :rules="rules" ref="orderBookRef">
      <div class="air-book-status ">
        <el-form-item label="订舱状态" style="margin-bottom:0;margin-right:40px" prop="bkgStatus">
          <el-radio-group v-model="formData.bkgStatus" :disabled="!isOp || isDisabled">
            <el-radio v-for="(el,index) in airBkgStatus" :label="el.value" :key="index">{{el.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="交仓状态" style="margin-bottom:0" prop="poDealStatus">
          <el-radio-group v-model="formData.poDealStatus" :disabled="!isOp || isDisabled">
            <el-radio label="INIT">未入仓</el-radio>
            <el-radio label="PROCESSING">处理中</el-radio>
            <el-form-item v-if="formData.poDealStatus==='PROCESSING'" label="" style="margin-left:-20px" prop="poDealProcessingReason">
              <el-select v-model="formData.poDealProcessingReason" size="mini" placeholder="请选择处理原因" style="width:180px">
                <el-option v-for="(item,index) in $store.state.dict.dictMap.poDealProcessingReason" :key="index" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-radio label="IN">已入仓</el-radio>
          </el-radio-group>
        </el-form-item>
        <div class="bl-fin-status">
          <div class="tit">财务审核状态：</div>
          <i class="el-icon-info" v-if="blFinStatusText!=='--'"></i>
          <div class="status-text" :class="blFinStatus">{{blFinStatusText}}</div>
        </div>
      </div>
      <div class="air-book-status ">
        <el-form-item label="入仓编号" style="margin-bottom:0" prop="poFileNo">
          <el-input size="mini" v-model="formData.poFileNo" maxlength="64" clearable :disabled="!isOp || isDisabled" placeholder="请输入">
          </el-input>
        </el-form-item>
        <el-form-item label="订舱备注" style="margin-bottom:0">
          <el-input size="mini" style="width:400px" v-model="formData.bkgRemark" :disabled="!isOp || isDisabled" maxlength="512" clearable placeholder="请输入">
          </el-input>
        </el-form-item>
      </div>
    </el-form>
    <div class="row-cont edit-row ml10" style="margin: 10px 0 0 0 !important" v-if="isRequire">
      <!-- {{transportInfoData}} -->
      <TransportInfo v-model="transportInfoData" :disabled="!isOp || isDisabled" ref="transportInfo-form" />
    </div>
    <!-- 订舱信息 -->
    <div class="edit-row" style="margin: 10px 0 0 0 !important">
      <div class="edit-row m10 row-cont" style="margin:0">
        <div class="row-cont-tit">
          <span class="tit">订单信息</span>
          <div class="row-cont-rt">
            <span class="expand" @click="handleOrderInfo"> {{ showOrderInfo ? '收起' : '展开' }}<i :class="showOrderInfo ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
          </div>
        </div>
        <div v-show="showOrderInfo" style="padding:0 10px">
          <BookInfoView :infoConfig="bookBaseInfo" />
          <BookInfoView :infoConfig="goodsInfo" />
          <BookInfoView :infoConfig="transportInfo" />
        </div>
      </div>
    </div>
    <div class="edit-row" style="margin: 10px 0 0 0 !important">
      <div class="fileList-cont">
        <div class="mb10 between h28">
          <div class="ft14 bold">附件列表</div>
          <el-button type="primary" size="mini" @click="handleAdd" :disabled="!isOp || isDisabled">新增附件</el-button>
        </div>
        <el-table style="width: 100%" fit highlight-current-row :data="fileList">
          <el-table-column prop="typeName" label="附件类别" align="center"> </el-table-column>
          <el-table-column prop="name" label="附件名称" align="center">
            <template slot-scope="scope">
              <div class="operate-group">
                <el-button @click="handleView(scope.row)" type="text" size="mini">{{ scope.row.name }}</el-button>
              </div>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="size" label="附件大小(kb)" align="center" width="100px"> </el-table-column> -->
          <el-table-column prop="createdName" label="上传人" align="center"> </el-table-column>
          <el-table-column prop="createdTime" label="上传时间" align="center"> </el-table-column>
          <el-table-column label="附件" width="150" align="center" fixed="right">
            <template slot-scope="scope">
              <div class="operate-group">
                <el-button @click="handleDownload(scope.row)" type="text" size="mini">下载</el-button>
                <el-button @click="handleDelete(scope.row)" type="text" class="red" size="mini" :disabled="!isOp || isDisabled">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 拒绝弹窗 -->
    <div v-if="refusePopShow">
      <RefuseDialog :params="bookDetailForm" @close="refusePopClose" :reqType="bookDetailForm.reqType" />
    </div>
    <div v-if="uploadPopShow">
      <FileUpload @close="uploadPopClose" />
    </div>
    <div v-if="exportEntrustedPopShow">
      <!-- 输出托书 -->
      <exportEntrustedPop @close="exportPopClose" />
    </div>
  </div>
</template>

<script>
import TransportInfo from './transportInfo'
import BookInfoView from '../../../bookShip/components/bookInfoView'
import RefuseDialog from './refuseDialog'
import { copyArry } from '@/utils/tools'
import { handleData } from '@/views/airTransport/order/js/handleData'
import exportEntrustedPop from './exportEntrustedPop.vue'
import {
  bookInfo,
  bookSave,
  fileDelete,
  transportCheck,
  putDetail,
  // bookingExport,
  fileList
} from '@/api/airTransport/order'
import UploadInput from '@/components/Base/upload/upload-input.vue'
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import FileUpload from './fileUpload'
import { workAssign } from '@/api/base'
export default {
  mixins: [orderMixin],
  components: {
    TransportInfo,
    BookInfoView,
    RefuseDialog,
    UploadInput,
    FileUpload,
    exportEntrustedPop
  },
  data() {
    return {
      blFinStatus: '', //财务审核状态
      blFinStatusText: '',
      showOrderInfo: true,
      exportEntrustedPopShow: false,
      isRequire: false,
      uploadPopShow: false,
      options: [],
      // 货物信息
      goodsInfo: {
        title: '货物信息',
        showTitle: true,
        type: 'goods',
        transport: {},
        info: [],
        summaryData: {},
        showBgcolor: true
      },
      bookBaseInfo: {
        title: '基本信息',
        showTitle: true,
        type: 'base',
        info: []
      },
      transportInfo: {
        title: '预计航程信息',
        showTitle: true,
        type: 'transport',
        info: []
      },
      refusePopShow: false,
      bookDetailForm: {
        reqType: 'change'
      },
      transportInfoData: {
        formData: [
          // 航程信息
          {
            carrierSupplierId: '',
            carrierSupplierName: '',
            etdTime: '',
            etaTime: '',
            eflightNumber: '',
            polPortCode: '',
            polPortName: '',
            unloadingPortCode: '',
            unloadingPortName: '',
            voyageType: '预计',
            voyageSort: '0'
          },
          {
            carrierSupplierId: '',
            carrierSupplierName: '',
            etdTime: '',
            etaTime: '',
            eflightNumber: '',
            polPortCode: '',
            polPortName: '',
            unloadingPortCode: '',
            unloadingPortName: '',
            voyageType: '预计',
            voyageSort: '1'
          }
        ]
      },
      activeNames: ['1', '2', '3'],
      rules: {
        poFileNo: [{ required: true, message: '请输入', trigger: 'change' }],
        bkgStatus: [{ required: true, message: '请输入', trigger: 'change' }],
        poDealStatus: [
          { required: true, message: '请输入', trigger: 'change' }
        ],
        poDealProcessingReason: [
          { required: true, message: '请输入', trigger: 'change' }
        ]
      },
      formData: {
        bkgStatus: '', // 订舱状态
        poDealStatus: '', // 交仓状态
        poDealProcessingReason: '', // 处理中原因
        poFileNo: '',
        bkgRemark: ''
      },
      isClick: true,
      fileList: [],
      currentBkgStatus: ''
    }
  },
  props: {
    progressValue: {
      type: String,
      default: ''
    }
  },
  computed: {
    isOp() {
      return this.ordDetRole === 'op'
    },
    isBd() {
      return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
    },
    airBkgStatus() {
      let list = this.$store.state.dict.dictMap.airBkgStatus.filter((ele) => {
        return ele.value !== 'REFUSE'
      })
      return list
    },
    isDisabled() {
      return this.progressValue === 'finish' || this.isJoint
    }
  },
  mounted() {
    this.getOrderInfo()
    this.getBookInfo()
    this.airFileList()
  },
  methods: {
    workAssign() {
      workAssign({ orderNo: this.$route.query.orderNo }).then((res) => {
        let bd = res.data.workAssign.filter((ele) => ele.jobCode === 'bd')
        // let obd=res.data.workAssign.filter(ele=>ele.jobCode==='obd')
        this.bdName = bd[0].employeeName
        this.bookBaseInfo.info.splice(7, 0, {
          key: 'bd',
          name: '销售人员',
          value: this.bdName
        })
      })
    },
    putDetail() {
      // 放单详情
      putDetail({ orderNo: this.$route.query.orderNo, blId: 0 }).then((res) => {
        if (res.data.auditStatus === 'init') {
          this.blFinStatus = 'wait-status'
          this.blFinStatusText = '待申请'
        } else if (res.data.auditStatus === 'submit') {
          this.blFinStatus = 'wait-status'
          this.blFinStatusText = '待审核'
        } else if (res.data.auditStatus === 'pass') {
          this.blFinStatus = 'success-status'
          this.blFinStatusText = '通过'
        } else if (res.data.auditStatus === 'processing') {
          this.blFinStatus = 'wait-status'
          this.blFinStatusText = '处理中'
        }else if (res.data.auditStatus === 'refuse') {
          this.blFinStatus = 'refuse-status'
          this.blFinStatusText = '拒绝'
        }
      })
    },
    handleOrderInfo() {
      this.showOrderInfo = !this.showOrderInfo
    },
    handleExport(obj) {
      let { orderNo, jointNo } = this.$route.query
      let params = {
        orderNo: orderNo,
        docType: obj.docType
      }
      this.$store
        .dispatch('order/exportBlobFile', {
          uri: '/order/air/book/booking/export',
          data: params
        })
        .then((res) => {
          console.log(res)
          this.exportEntrustedPopShow = false
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = `航空货运托运单${params.orderNo}.` + params.docType.toLowerCase()
          link.click()
        })
    },
    exportPopClose(action, value) {
      if (action === 'Confirm') {
        this.handleExport(value)
      } else {
        this.exportEntrustedPopShow = false
      }
    },
    airFileList() {
      fileList({ orderNo: this.$route.query.orderNo }).then((res) => {
        this.fileList = res.data
      })
    },
    handleView(data) {
      this.$store.dispatch('order/previewFile', {
        fileNo: data.fileNo,
        fileName: data.name
      })
    },
    handleDownload(data) {
      //下载
      this.$store
        .dispatch('order/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: data.fileNo
          }
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = data.name
          link.click()
        })
    },
    handleAdd() {
      // 上传
      this.uploadPopShow = true
    },
    // 上传弹窗关闭回调
    uploadPopClose(action) {
      this.uploadPopShow = false
      if (action === 'Confirm') {
        this.airFileList()
      }
    },
    handleDelete(data) {
      // 删除文件
      fileDelete({
        orderNo: this.$route.query.orderNo,
        jointNo: this.$route.query.jointNo,
        fileNo: data.fileNo
      }).then(() => {
        this.airFileList()
      })
    },
    validateForm() {
      // 表单验证
      return new Promise((resolve, reject) => {
        this.$refs.orderBookRef.validate((valid) => {
          if (valid) {
            resolve()
          } else {
            reject()
          }
        })
      })
    },
    validateAllForm() {
      // 校验所有表单
      return new Promise((resolve, reject) => {
        let formList = [
          this.validateForm(), //状态&&入仓单校验
          this.$refs['transportInfo-form'].validateForm() // 实际航程
        ]
        Promise.all(formList)
          .then(() => {
            resolve()
          })
          .catch((err) => {
            console.log(err)
            reject()
          })
      })
    },
    handleSave() {
      // 订舱保存
      this.validateAllForm()
        .then(() => {
          let params = {
            orderNo: this.$route.query.orderNo,
            jointNo: this.$route.query.jointNo ? this.$route.query.jointNo : '',
            bkgStatus: this.formData.bkgStatus,
            poDealStatus: this.formData.poDealStatus,
            poDealProcessingReason: this.formData.poDealProcessingReason,
            poNo: this.formData.poFileNo,
            bkgRemark: this.formData.bkgRemark,
            realVoyageList: this.transportInfoData.formData
          }
          if (this.isClick) {
            this.isClick = false
            bookSave(params)
              .then((res) => {
                this.isClick = true
                this.$message({
                  message: '保存成功',
                  type: 'success'
                })
                this.getBookInfo()
              })
              .catch(() => {
                this.isClick = true
              })
          }
        })
        .catch(() => {
          this.$message.error('请按要求填写数据')
        })
    },
    handRefuse() {
      this.refusePopShow = true
    },
    handleOutputLetter() {
      // 托书输出
      this.exportEntrustedPopShow = true
    },
    handShipment() {
      // 货物出运
      this.$confirm('客户货物是否出运？确定后业务方可发起放货审核。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '放弃',
        type: 'warning'
      })
        .then(() => {
          let { orderNo, jointNo } = this.$route.query
          let params = {
            orderNo: orderNo
          }
          if (jointNo) {
            params.jointNo = jointNo
          }
          if (this.isClick) {
            this.isClick = false
            transportCheck(params)
              .then(() => {
                this.$message({
                  message: '货物出运成功',
                  type: 'success'
                })
                this.isClick = true
                this.getBookInfo()
              })
              .catch(() => {
                this.isClick = true
              })
          }
        })
        .catch(() => {})
    },
    refusePopClose() {
      this.refusePopShow = false
    },
    getBookInfo() {
      bookInfo({ orderNo: this.$route.query.orderNo }).then((response) => {
        this.bookDetailForm = copyArry(response.data)
        if (response.data.isTransportCheck === 'Y') {
          this.putDetail()
        } else {
          this.blFinStatus = ''
          this.blFinStatusText = '--'
        }

        // 获取订舱基本信息
        this.bookBaseInfo.info = handleData.arrbookBaseInfo(
          this.roles,
          this.bookDetailForm
        )
        this.goodsInfo.info = response.data.cargoList
        this.goodsInfo.summaryData = response.data.cargoStat
          ? response.data.cargoStat
          : {}
        // 预计航程信息回选
        if (
          Array.isArray(response.data.planVoyageList) &&
          response.data.planVoyageList.length > 0
        ) {
          this.transportInfo.info = response.data.planVoyageList
        }
        this.isRequire = true
        // 预计航程信息回选
        // 实际航程信息回选
        if (
          Array.isArray(response.data.realVoyageList) &&
          response.data.realVoyageList.length > 0
        ) {
          let arr = response.data.realVoyageList
          this.transportInfoData.formData = []
          for (let i = 0; i < arr.length; i++) {
            let obj = {
              carrierSupplierId: arr[i].carrierSupplierId
                ? arr[i].carrierSupplierId
                : '',
              carrierSupplierName: arr[i].carrierSupplierName
                ? arr[i].carrierSupplierName
                : '',
              etdTime: arr[i].etdTime ? arr[i].etdTime : '',
              etaTime: arr[i].etaTime ? arr[i].etaTime : '',
              eflightNumber: arr[i].eflightNumber ? arr[i].eflightNumber : '',
              polPortCode: arr[i].polPortCode ? arr[i].polPortCode : '',
              polPortName: arr[i].polPortName ? arr[i].polPortName : '',
              unloadingPortCode: arr[i].unloadingPortCode
                ? arr[i].unloadingPortCode
                : '',
              unloadingPortName: arr[i].unloadingPortName
                ? arr[i].unloadingPortName
                : '',
              voyageType: '实际',
              voyageSort: arr[i].voyageSort ? arr[i].voyageSort : '0'
            }
            this.transportInfoData.formData.push(obj)
          }
        }
        // 实际航程信息回选
        this.formData = {
          bkgStatus: response.data.bkgStatus, // 订舱状态
          poDealStatus: response.data.poDealStatus, // 交仓状态
          poDealProcessingReason: response.data.poDealProcessingReason, // 处理中原因
          poFileNo: response.data.poNo,
          bkgRemark: response.data.bkgRemark
        }
        this.currentBkgStatus = response.data.bkgStatus
        this.workAssign()
      })
    }
  }
}
</script>

<style lang="scss">
.order-book-info {
  background: #f5f7f9;
  .el-form-item__label {
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #000;
  }
  .po-file {
    margin-bottom: 0;
    .el-form-item__content {
      width: 372px;
    }
  }
  .el-radio__label {
    font-size: 12px;
  }
  .is-error {
    .el-radio__inner {
      border-color: #ff4949;
    }
  }
  .el-radio-group {
    display: flex !important;
    align-items: center;
    height: 20px !important;
  }
  .head {
    padding: 10px 8px;
    margin-top: 4px;
    display: flex;
    justify-content: space-between;
    background: #fff;
    .title {
      font-size: 12px;
      font-weight: 600;
      // color: #000;
      line-height: 16px;
    }
  }
  .air-book-status {
    padding: 10px 8px;
    background: #fff;
    margin-top: 4px;
  }
  /deep/ .air-book-status {
    .el-form-item {
      margin-bottom: 4px;
      margin-right: 24px;
      .el-form-item__label {
        font-weight: 600;
      }
    }
  }
  /deep/ .el-form-item {
    margin-bottom: 4px;
    margin-right: 24px;
  }
  .bookInfoView-box {
    padding: 8px 12px;
    background: #fff;
    margin: 10px 0 0 0;
  }
}
.bl-fin-status {
  display: flex;
  float: right;
  align-items: center;
  font-size: 12px;
  .tit {
    // margin-right: 12px;
    font-weight: 600;
  }
  .el-icon-info {
    color: #e9e9e9;
    margin-right: 4px;
  }
  .status-text {
    font-weight: 600;
  }
  .wait-status {
    color: #edb534;
  }
  .success-status {
    color: #33b18a;
  }
  .refuse-status {
    color: #e63923;
  }
}
.fileList-cont {
  .red {
    color: #e63923;
  }
}
</style>