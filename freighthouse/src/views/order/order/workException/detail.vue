<template>
  <div class="edit-container excp-container" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
    <!-- 详情 -->
    <div class="component-cont">
      <div class="mb10 between h32 border-bt">
        <div class="ft14">{{ $route.query.excpId ? '异常单详情' : '新建异常单' }}</div>
        <div>
          <el-button size="mini" type="default" class="ml10" @click="handleReturn">返回</el-button>
          <el-button size="mini" type="default" class="ml10" @click="handleCancel" v-if="!isAdd && !isNotCharge && !isView">取消异常单</el-button>
          <el-button size="mini" type="default" class="ml10" @click="handleFinish" v-if="!isAdd && !isNotCharge && !isView">处理完成</el-button>
          <el-button size="mini" type="primary" class="ml10" @click="handleSave" v-if="!disabledStatus" :disabled="submitDisabled">保存</el-button>
        </div>
      </div>
      <el-form class="row-flex excp-row" :model="createItem" label-width="90px" :rules="rules" ref="excpSave">
        <!-- <el-form-item class="flex-item" label="优先级" prop="excpPriority" :show-message="false">
          <el-select size="mini" placeholder="请选择" clearable v-model="createItem.excpPriority" :disabled="isNotCharge" style="width: 100%">
            <el-option v-for="(item, index) in dictMap.exceptionPriority" :key="index" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item class="flex-item" label="工作号" prop="orderNo" :show-message="false">
           <el-select
            clearable
            size="mini"
            remote
            filterable
            v-model="createItem.orderNo"
            style="width: calc(100% - 68px)"
            placeholder="请选择"
            :disabled="isServiceCode || disabledStatus"
            @visible-change="
              (val) => {
                orderNoVisibleChange(val)
              }
            "
            :remote-method="
              (val) => {
                orderNofilterMehod(val)
              }
            "
            @change="
              (val) => {
                handleChangeOrderNo(val)
              }
            "
          >
            <el-option v-for="(ele, index) in orderNoOptions" :key="index" :label="ele.label" :value="ele.value"> </el-option>
          </el-select>
          <el-button type="text" size="mini" @click="handleOrderInfo" :disabled="!createItem.orderNo">订单详情</el-button>
          <!-- <el-input size="mini" placeholder="请输入" v-model="createItem.orderNo" clearable :disabled="isServiceCode || isNotCharge"></el-input> -->
        </el-form-item>
        <el-form-item class="flex-item" label="业务类型" prop="businessType" :show-message="false">
          <el-select size="mini" placeholder="请选择"  v-model="createItem.businessType" style="width: 100%" :disabled="isServiceCode || disabledStatus" @change="handleChangeBusinessType">
            <el-option v-for="item in showBusinessTypeOptions" :label="item.name" :value="item.businessType" :key="item.businessType"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="flex-item" label="服务类型" prop="serviceType">
          <el-select size="mini" placeholder="请选择"  v-model="createItem.serviceType" style="width: 100%" :disabled="isServiceCode || disabledStatus" @change="handleChangeServiceType">
            <el-option v-for="item in showServiceTypeOptions" :key="item.serviceType" :label="item.name" :value="item.serviceType"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="flex-item" label="服务项" prop="serviceCode" :show-message="false">
          <el-select size="mini" clearable placeholder="请选择" style="width: 100%" v-model="createItem.serviceCode" :disabled="isServiceCode || disabledStatus">
            <el-option v-for="item in showServiceListOptions" :key="item.serviceCode" :label="item.serviceName" :value="item.serviceCode"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="flex-item" label="委托单位" prop="custName" :show-message="false">
         <el-tooltip v-if="createItem.custName" class="item" effect="dark" :content="createItem.custName" placement="top">
          <el-input  v-model="createItem.custName" size="mini" style="width: 100%" disabled> </el-input>
         </el-tooltip>
         <el-input v-if="!createItem.custName"  v-model="createItem.custName" size="mini" style="width: 100%" disabled> </el-input>
        </el-form-item>
        <el-form-item class="flex-item" label="负责人" prop="chargeEmployeeName">
          <el-select
            clearable
            size="mini"
            :filterable="true"
            v-model="createItem.chargeEmployeeId"
            style="width: 100%"
            remote
            placeholder="请选择"
            :disabled="disabledStatus"
            @visible-change="
              (val) => {
                visibleChange(val)
              }
            "
            :remote-method="
              (val) => {
                filterMehod(val)
              }
            "
            @change="
              (val) => {
                handleChangeEmployee(val)
              }
            "
          >
            <el-option v-for="(ele, index) in employeeOptions" :key="index" :label="ele.label" :value="ele.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="flex-item" label="异常类型" prop="reasonTypeCode" :show-message="false">
          <el-cascader
            clearable
            filterable
            size="mini"
            style="width: 100%"
            placeholder="请选择"
            v-model="createItem.reasonTypeCode"
            :disabled="disabledStatus"
            :options="excpCodeOptions"
            :props="{ expandTrigger: 'hover' }"
            @change="handleExcpCodeChange"
          >
          </el-cascader>
        </el-form-item>
        <el-form-item class="flex-item" label="异常原因" prop="reasonCode" :show-message="false">
          <el-select size="mini" clearable filterable style="width: 100%" placeholder="请选择" v-model="createItem.reasonCode" :disabled="disabledStatus" @change="reasonCodeChange">
            <el-option v-for="(item, index) in showExcpResultOptions" :key="index" :label="item.reasonName" :value="item.reasonCode"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="flex-item" label="是否可控" prop="isControl" :show-message="false">
          <el-select size="mini" clearable filterable style="width: 100%" placeholder="请选择" v-model="createItem.isControl" :disabled="disabledStatus">
            <el-option v-for="(item, index) in [{label: '是', value: 'Y'}, {label: '否', value: 'N'}]" :key="index" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="flex-item" label="异常发生时间" prop="startTime" :show-message="false">
          <elDatePickerLimit
            size="mini"
            v-model="createItem.startTime"
            type="datetime"
            @change="realChange"
            style="width: 100%"
            clearable
            placeholder="请选择"
            :disabled="disabledStatus"
            :picker-options="realPickerOptions"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item class="flex-item" label="期望解决时间" prop="expectHandleTime" :show-message="false">
          <elDatePickerLimit
            size="mini"
            v-model="createItem.expectHandleTime"
            type="datetime"
            @change="expectChange"
            style="width: 100%"
            clearable
            placeholder="请选择"
            :disabled="disabledStatus"
            :picker-options="expectPickerOptions"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item class="flex-item" label="是否客户投诉" prop="isCustComplain" :show-message="false">
          <el-select size="mini" clearable placeholder="请选择" style="width: 100%" v-model="createItem.isCustComplain" :disabled="disabledStatus">
            <el-option v-for="(item, index) in dictMap.yesOrNoOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="flex-item" label="责任方" :show-message="false">
          <el-select size="mini" clearable placeholder="请选择" style="width: 100%" v-model="createItem.responsibleType" :disabled="disabledStatus" @change="responsibleTypeChange">
            <el-option v-for="(item, index) in dictMap.responsibleType" :key="index" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="flex-item padding-left-0" prop="responsibleId" :show-message="false" v-if="createItem.responsibleType !== 'other'">
          <div style="color: #fff" slot="label"></div>
          <el-select
            v-show="createItem.responsibleType === 'supplier'"
            size="mini"
            filterable
            remote
            clearable
            :remote-method="supplierFilterMehod"
            placeholder="请选择供应商"
            style="width: 100%"
            v-model="createItem.responsibleId"
            @change="changeName"
            :disabled="disabledStatus"
          >
            <el-option v-for="item in supplierOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
          <el-select
            v-show="createItem.responsibleType === 'staff'"
            size="mini"
            filterable
            remote
            clearable
            placeholder="请选择员工"
            :remote-method="employeeFilterMehod"
            style="width: 100%"
            v-model="createItem.responsibleId"
            @change="changeName"
            :disabled="disabledStatus"
          >
            <el-option v-for="item in staffOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
          <el-select
            v-show="createItem.responsibleType === 'company'"
            size="mini"
            filterable
            clearable
            placeholder="请选择分公司"
            style="width: 100%"
            v-model="createItem.responsibleId"
            @change="changeName"
            :disabled="disabledStatus"
          >
            <el-option v-for="item in companyOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="flex-item padding-left-0" prop="responsibleName" :show-message="false" v-if="createItem.responsibleType === 'other'">
          <div style="color: #fff" slot="label"></div>
          <el-input v-show="createItem.responsibleType === 'other'" v-model="createItem.responsibleName" size="mini" placeholder="请输入" clearable style="width: 100%" :disabled="disabledStatus"> </el-input>
        </el-form-item>
        <el-form-item class="flex-item col-2"></el-form-item>
        <el-form-item class="flex-item col-1" label="异常内容" prop="excpContent" :show-message="false">
          <el-input size="mini" type="textarea" rows="3" style="width: 100%" placeholder="请输入" v-model="createItem.excpContent" clearable :disabled="disabledStatus"></el-input>
        </el-form-item>
        <el-form-item class="flex-item col-1" style="height: 100%" label="备注" prop="remark">
          <el-input size="mini" style="width: 100%" type="textarea" rows="3" placeholder="请输入" v-model="createItem.remark" clearable :disabled="disabledStatus"></el-input>
        </el-form-item>
        <div class="flex-item col-1 flex-item-upload">
          <div class="item-label"><span class="lab">上传附件</span></div>
          <sowoll-upload class="rail-file-upload" :fetchFileList="createItem.files" @selectFile="selectFile" @delFile="orderFileDelete" @downloadFile="handleDownload" @handleView="handleView" :disabled="disabledStatus" />
          <!-- <div class="" v-if="isNotCharge">
						<el-button class="underline" size="mini" type="text" v-for="(item, index) in createItem.files" :key="index" @click="handleViewExcpFiles(item)">{{ item.fileName }}</el-button>
					</div>
					<FileUpload :config="uploadConfig" :fileNos="createItem.files" v-if="!isNotCharge" @upload="handleUpload" @deleteFile="handleDeleteFile" /> -->
        </div>
      </el-form>
      <div class="row-cont margin0 mt10">
        <div class="row-cont-tit between">
          <span class="tit">进展信息列表</span>
          <div>
            <el-button size="mini" type="primary" class="mr10" @click="handleAdd" v-if="addExcpItemShow && !isView">新增跟进项</el-button>
            <span @click="handleToogleExcpInfoTable" class="mr10" style="cursor: pointer">{{excpInfoTableShow ? '收起' : '展开'}}<i :class="{'el-icon-arrow-up': excpInfoTableShow, 'el-icon-arrow-down': !excpInfoTableShow}"></i></span>
          </div>
        </div>
        <div class="component-cont" v-show="excpInfoTableShow">
          <el-table
            ref="blTable"
            stripe
            style="width: 100%; margin-top: 8px"
            :data="createItem.exceptionItemList"
            default-expand-all
            row-key="showId"
            :tree-props="{ children: 'exceptionProgressList', hasChildren: 'hasChildren' }"
            :select-on-indeterminate="true"
            @select-all="handleSelectAll"
            @selection-change="handleSelectionChange"
          >
            <!-- <el-table-column type="selection" width="50"></el-table-column> -->
            <el-table-column prop="followEmployeeName" label="跟进人" align="center" width="100"></el-table-column>
            <el-table-column prop="followDeptName" label="跟进组" align="center" width="80"></el-table-column>
            <el-table-column prop="name" label="跟进项名称" align="center" width="120"></el-table-column>
            <el-table-column prop="content" label="跟进项内容" align="center"></el-table-column>
            <el-table-column prop="followTime" label="跟进时间" align="center" width="100px"></el-table-column>
            <el-table-column prop="progressDesc" label="进展描述" align="center" width="180px"></el-table-column>
            <el-table-column prop="status" label="状态" align="center" width="85px">
              <template slot-scope="scope">
                <el-select size="mini" placeholder="请选择" style="width: 100%" v-model="scope.row.status" :disabled="isView" v-if="(scope.row.followEmployeeId === userId || (scope.row.followManagerIds || []).includes(userId)) && isNotCharge" @change="(val) => handleChangeExcpItemStatus(val, scope.row)">
                  <el-option v-for="(item, index) in dictMap.excpItemStatus" :key="index" :label="item.label" :value="item.value"> </el-option>
                </el-select>
                <span v-if="!isNotCharge">{{ scope.row.status | excpItemStatusFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column label="附件" align="center" width="240px">
              <template slot-scope="scope">
                <div class="operate-group" v-for="(item, index) in scope.row.files" :key="index">
                  <el-button @click="handleViewExcpFiles(item)" type="text" size="mini">{{ item.fileName }}</el-button>
                  <el-button @click="handleViewProgressFiles(item)" type="text" size="mini">下载</el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center" fixed="right">
              <template slot-scope="scope">
                <div class="operate-group">
                  <el-button @click="handleAddProgress(scope.row)" type="text" size="mini" v-if="scope.row.addBtnShow && !isView">新增进展描述</el-button>
                  <el-button @click="handleEditProgress(scope.row)" type="text" size="mini" v-if="scope.row.editBtnShow && !isView">修改</el-button>
                  <el-button @click="handleDelete(scope.row)" class="red" type="text" size="mini" v-if="scope.row.deleteBtnShow && !isView">删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <!-- 去掉异常单弹窗 -->
    <div v-if="cancelShow">
      <Cancel @close="cancelPopClose" />
    </div>
    <!-- 跟进人弹窗 -->
    <div v-if="addEmployeeNameShow">
      <AddEmployeeName @close="addEmployeeNamePopClose" />
    </div>
    <!-- 进展描述弹窗 -->
    <div v-if="progressShow">
      <ProgressDesc @close="progressPopClose" :createItem="createProgressItem" />
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { baseBusinessList, baseBusinessServiceList, baseEmployeeListName } from '@/api/base'
import { abroadCompanyList } from '@/api/order/list'
import { workExceptionDetail, workExceptionSave, workExceptionUpdateStatus, workExceptionDeleteItem, workExceptionSaveProgress, workExceptionDeleteProgress, getSerialNo, updateItemStatus, getOrderNoList, getInfoByOrderNo, workExceptionSaveCheck } from '@/api/order/workException'
import FileUpload from './components/fileUpload'
import AddEmployeeName from './components/addEmployeeName'
import ProgressDesc from './components/progressDesc'
import Cancel from './components/cancel'
import { getDictLabel } from '@/utils/tools'
import SowollUpload from './components/exceptionUpload2.vue'
import { supplierList } from '@/api/crm/supplier'

const defaultQuery = {
  currPage: 1,
  pageSize: 30,
  query: [{ column: 'supplierName', type: 'default', value: '' }],
}
const defaultCreateQuery = {
  excpId: undefined,
  excpNo: undefined,
  // excpPriority: '',
  custName: '',
  custid: '',
  orderNo: '',
  businessType: 'ship_export_fcl',
  serviceType: '',
  isCustComplain: '',
  responsibleType: '',
  responsibleId: '',
  responsibleName: '',
  serviceCode: '',
  reasonTypeCode: '',
	reasonTypeName: '',
  reasonCode: '',
	reasonName: '',
  excpContent: '',
  isControl: '',
  startTime: '',
  expectHandleTime: '',
  chargeEmployeeId: '',
  chargeEmployeeName: '',
  files: [],
  remark: '',
  exceptionItemList: [],
}
const defaultCreateProgressQuery = {
  oid: undefined,
  excpId: '',
  excpItemId: undefined,
  followTime: '',
  progressDesc: '',
  files: [],
}
export default {
  filters: {
    excpItemStatusFilter(status) {
      return getDictLabel('excpItemStatus', status)
    },
  },
  mixins: [routerMixin],
  data() {
    return {
      realPickerOptions: {},
      expectPickerOptions: {},
      oQuery: this.$route.query,
      isAllSelect: '', // 全选
      multipleSelection: [],
      createItem: Object.assign({}, defaultCreateQuery),
      rules: {
        // excpPriority: [{ required: true, message: '优先级不能为空', trigger: 'change' }],
        orderNo: [{ required: true, message: '工作号不能为空', trigger: 'blur' }],
        businessType: [{ required: true, message: '业务类型不能为空', trigger: 'change' }],
        serviceCode: [{ required: true, message: '服务项不能为空', trigger: 'change' }],
        reasonTypeCode: [{ required: true, message: '异常类型不能为空', trigger: 'change' }],
        reasonCode: [{ required: true, message: '异常原因不能为空', trigger: 'change' }],
        isControl: [{ required: true, message: '是否可控不能为空', trigger: 'change' }],
        startTime: [{ required: true, message: '异常发生时间不能为空', trigger: 'change' }],
        expectHandleTime: [{ required: true, message: '期望解决时间不能为空', trigger: 'change' }],
        excpContent: [{ required: true, message: '异常内容不能为空', trigger: 'blur' }],
        isCustComplain: [{ required: true, message: '', trigger: 'change' }],
        // responsibleType: [{ required: true, message: '', trigger: 'change'}],
      },
      submitDisabled: false,
      businessTypeOptions: [],
      // 服务类型
      serviceTypeOptions: [],
      // 服务项列表
      serviceListOptions: [],
      employeeOptions: [],
      allTypeList: [],
      excpCodeOptions: [], // 异常类型列表
      excpOid: null,
      excpResultOptions: [], // 异常原因列表

      addEmployeeNameShow: false, // 跟进人弹窗
      progressShow: false, // 进展描述弹窗
      cancelShow: false, // 取消异常单弹窗

      uploadConfig: {
        apiUrl: '/order/shipping/workException/uploadFile',
        multiple: true,
        autoUpload: false,
      },

      createProgressItem: { ...defaultCreateProgressQuery },
      isNotCharge: false, // 是跟进人
      isCreateor: false, // 创建人
      addExcpItemShow: true, // 新增跟进项按钮
      status: '',
      cTimestamp: 0,
      supplierOptions: [],
      staffOptions: [],
      companyOptions: [],
      orderNoOptions: [],
      serviceCodeList: [],
      excpInfoTableShow: true
    }
  },
  created() {
    this.cTimestamp = new Date().getTime()
    this.$store.dispatch('order/getWorkExceptionData').then((obj) => {
      this.init()
      this.excpCodeOptions = obj.typeList
      this.excpResultOptions = obj.reasonList
      this.allTypeList = obj.allTypeList
    })
  },
  activated() {
    let timestamp = new Date().getTime()
    // console.log('isUseCache', this.$route.meta.isUseCache)
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
      this.init()
			let { excpId } = this.$route.query
			if (!excpId) {
         this.excpOid = ''
			}
    }
  },
  mounted() {
  },
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      orderNo: (state) => state.order.orderNo,
      custid: (state) => state.order.custid,
      currRole: (state) => state.order.currRole,
      userId: (state) => state.user.userId,
      userName: (state) => state.user.name,
    }),
    isServiceCode() {
      return this.$route.query.source === 'serviceCode'
    },
    isAdd() {
      return !this.$route.query.excpId
    },
    isView() {
      return ['cancel', 'closed'].includes(this.status)
    },
    disabledStatus() {
      return this.isNotCharge || this.isView
    },
    showExcpResultOptions() {
      return this.excpResultOptions.filter((item) => {
        return this.excpOid === item.typeId
      })
    },
    showBusinessTypeOptions() {
      return this.businessTypeOptions.filter(item => {
        return this.createItem.businessType === item.businessType
      })
    },
    showServiceTypeOptions() {
      return this.serviceTypeOptions.filter(item => {
        return this.createItem.serviceType === item.serviceType
      })
    },
    showServiceListOptions() {
      if (this.isServiceCode) {
        return this.serviceListOptions.filter(item => {
          return this.createItem.serviceCode === item.serviceCode
        })
      } else {
        return this.serviceListOptions.filter(item => {
          return this.serviceCodeList.includes(item.serviceCode)
        })
      }
      
    }
  },
  components: {
    FileUpload,
    AddEmployeeName,
    ProgressDesc,
    Cancel,
    SowollUpload,
  },
  watch: {
    //监听异常发生时间
    'createItem.startTime'(val) {
      this.expectPickerOptions = {
        disabledDate(date) {
          // //时间为空不禁用
          // if (!val) {
          // 	return false
          // }
          // //若小于异常发生时间 则设置禁用
          // if (date.getTime() < +new Date(val) - 24 * 60 * 60 * 1000) {
          // 	return true
          // }
          // return false
        },
      }
    },
    //监听期望解决时间
    'createItem.expectHandleTime'(val) {
      this.realPickerOptions = {
        disabledDate(date) {
          // //时间为空不禁用
          // if (!val) {
          // 	return false
          // }
          // //若大于期望解决时间 则设置禁用
          // if (date.getTime() > +new Date(val)) {
          // 	return true
          // }
          // return false
        },
      }
    },
  },
  methods: {
    handleOrderInfo() {
      // 跳订单详情页
      let { businessType, orderNo } = this.createItem
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
            orderNo
          }
        })
        window.open(routeUrl.href, '_blank')
      }
    },
    handleToogleExcpInfoTable() {
      this.excpInfoTableShow = !this.excpInfoTableShow
    },
    handleView(fileName, fileNo) {
      this.$store.dispatch('order/previewFile', {
        fileNo: fileNo,
        fileName: fileName,
        fileNo,
      })
    },
    handleDownload(fileName, fileNo) {
      this.$store
        .dispatch('order/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: fileNo,
          },
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = fileName
          link.click()
        })
    },
    orderFileDelete(fileNo) {
      for (let i = 0; i < this.createItem.files.length; i++) {
        if (this.createItem.files[i].fileNo === fileNo) {
          this.createItem.files.splice(i, 1)
        }
      }
    },
    selectFile(files, fileLength) {
      if (!files) {
        return
      }
      let fileData = files
      fileData.append('orderNo', this.oQuery.orderNo)
      this.$store
        .dispatch('user/import', {
          uri: '/order/shipping/workException/uploadFile',
          params: fileData,
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.$message({
              type: 'success',
              message: '导入成功',
            })
            res.data.data &&
              res.data.data.map((item) => {
                this.createItem.files.push(item)
              })
          }
        })
    },
    //实际发生时间若晚于期望解决时间 强制改变选中值
    expectChange(val) {
      if (this.createItem.startTime && +new Date(val) < +new Date(this.createItem.startTime)) {
        this.createItem.expectHandleTime = this.createItem.startTime
      }
    },
    //实际发生时间若晚于期望解决时间 强制改变选中值
    realChange(val) {
      if (this.createItem.expectHandleTime && +new Date(val) > +new Date(this.createItem.expectHandleTime)) {
        this.createItem.startTime = this.createItem.expectHandleTime
      }
    },
    init() {
      let { excpId } = this.$route.query
      this.getBusinessType()
      this.companyFilterMehod()
      if (excpId) {
        this.getDetail()
      } else {
        this.initData()
      }
    },
    // 创建异常初始化数据
    initData() {
      let { orderNo, businessType, serviceType, serviceCode } = this.$route.query
      this.isNotCharge = false
      this.createItem = Object.assign(
        { ...defaultCreateQuery },
        {
          orderNo: orderNo || '',
          businessType: businessType || '',
          serviceType: serviceType || '',
          serviceCode: serviceCode || '',
          chargeEmployeeId: this.userId,
          chargeEmployeeName: this.userName,
        }
      )
      this.createItem.files = []
      this.employeeOptions = [{ label: this.userName, value: this.userId }]
      this.getExcpNo()
      this.$nextTick(() => {
        this.$refs['excpSave'].clearValidate()
      })
      if (this.isServiceCode) {
        this.getServListByServType()
      }
      if (orderNo) {
        getInfoByOrderNo({orderNo})
         .then(res => {
           this.createItem.custName = res.data.custName || ''
           this.createItem.custid = res.data.custid || ''
         })
      }
    },

    // 生成异常编号
    getExcpNo() {
      getSerialNo().then((res) => {
        this.createItem.excpNo = res.data.serialNo
      })
    },

    // 业务类型下拉
    getBusinessType() {
      baseBusinessList().then((res) => {
        let { data } = res
        this.businessTypeOptions = data
        this.createItem.businessType && this.getServiceTypeList(this.createItem.businessType)
      })
    },
    // 切换业务类型
    handleChangeBusinessType(val) {
      this.createItem.serviceType = ''
      this.createItem.serviceCode = ''
      this.serviceListOptions = []
      val && this.getServiceTypeList(val)
      if (!val) {
        this.serviceTypeOptions = []
        this.serviceListOptions = []
      }
    },
    // 获取服务类型
    getServiceTypeList(val) {
      this.businessTypeOptions.map((item) => {
        // 该业务类型下的服务类型
        if (item.businessType === val) {
          this.serviceTypeOptions = item.serviceTypeList
        }
      })
    },
    // 切换服务类型
    handleChangeServiceType(val) {
      this.createItem.serviceCode = ''
      val && this.getServiceCodeList(val)
      if (!val) {
        this.serviceListOptions = []
      }
    },
    // 获取服务项下拉
    getServiceCodeList(val) {
      this.serviceTypeOptions.map((item) => {
        // 该业务服务类型下的服务项
        if (item.serviceType === val) {
          this.serviceListOptions = item.serviceList
        }
      })
    },

    // 跟进业务类型，服务类型获取服务项下拉
    getServListByServType() {
      let param = {
        businessType: this.createItem.businessType,
        serviceType: this.createItem.serviceType,
      }
      baseBusinessServiceList(param).then((res) => {
        this.serviceListOptions = res.data || []
      })
    },
    responsibleTypeChange() {
      this.supplierOptions = []
      this.staffOptions = []
      this.createItem.responsibleId = ''
      this.createItem.responsibleName = ''
    },
    changeName(val) {
      if (val) {
        let obj = {}
        if (this.createItem.responsibleType === 'supplier') {
          obj = this.supplierOptions.find((item) => {
            return item.value === val
          })
          this.createItem.responsibleName = (obj && obj.label) || ''
        } else if (this.createItem.responsibleType === 'staff') {
          obj = this.staffOptions.find((item) => {
            return item.value === val
          })
          this.createItem.responsibleName = (obj && obj.label) || ''
        } else if (this.createItem.responsibleType === 'company') {
          obj = this.companyOptions.find((item) => {
            return item.value === val
          })
          this.createItem.responsibleName = (obj && obj.label) || ''
        }
      } else {
        this.createItem.responsibleName = ''
      }
    },
    // 下拉搜索供应商
    supplierFilterMehod(val) {
      if (val) {
        const data = {
          currPage: 1,
          pageSize: 10,
          descColumns: ['supplierId'],
          query: [{ column: 'name', type: 'like', value: val }],
          verifyStatus: 'all',
        }
        supplierList(data).then((res) => {
          if (res.data.list) {
            this.supplierOptions = res.data.list.map((item) => {
              return {
                label: item.name,
                value: item.supplierId,
              }
            })
          }
        })
      }
    },
    // 下拉搜索员工
    employeeFilterMehod(val) {
      if (val) {
        let data = {
          name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        }
        baseEmployeeListName(data).then((res) => {
          this.staffOptions = res.data
            .filter((item) => item.status === 'on')
            .map((item) => {
              return {
                label: this.$language === 'en' ? item.ename : item.cname,
                value: item.employeeId,
              }
            })
        })
      }
    },
    // 分公司
    companyFilterMehod(val) {
      abroadCompanyList({}).then(res => {
				if (res.data) {
					this.companyOptions = res.data.map(item => {
            item['label'] = item.companyName
            item['value'] = item.companyId
            return item
          })
				}
			})
    },
    orderNoVisibleChange(val) {
      if (val) {
        this.getOrderNoList()
      }
    },
    orderNofilterMehod(val) {
       this.getOrderNoList(val)
    },
    handleChangeOrderNo(val, type) {
      if (val) {
         getInfoByOrderNo({orderNo: val})
         .then(res => {
           this.createItem.businessType = res.data.businessType || ''
           this.createItem.serviceType = res.data.serviceType || ''
           this.serviceCodeList = res.data.serviceCodeList || []
           this.createItem.custName = res.data.custName || ''
           this.createItem.custid = res.data.custid || ''
           if (!type) {
              if (this.serviceCodeList.length === 1) { 
                this.createItem.serviceCode = this.serviceCodeList[0]
              } else {
                  this.createItem.serviceCode = ''
              }
           }
           this.getServiceTypeList(this.createItem.businessType)
           this.getServiceCodeList(this.createItem.serviceType)
         })
      } else {
        this.createItem.businessType = ''
        this.createItem.serviceType = ''
        this.createItem.serviceCode = ''
        this.createItem.custName = ''
      }
    },
    getOrderNoList(val) {
      if (!val) return
      getOrderNoList({ orderNo: val || '' })
      .then(res => {
        this.orderNoOptions = res.data.map(item => {
          return {
            label: item,
            value: item
          }
        })
      })
    },
    // 下拉搜索自定义查询
    filterMehod(val) {
      this.getEmployeeName(val)
    },

    // 下拉展开
    visibleChange(val) {
      if (val) {
        this.getEmployeeName()
      }
    },

    // 下拉选中负责人
    handleChangeEmployee(val) {
      if (val) {
        let item = this.employeeOptions.find((item) => item.value === val)
        this.createItem.chargeEmployeeName = item.label
      }
    },

    // 获取姓名
    getEmployeeName(val) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
      }
      baseEmployeeListName(data).then((res) => {
        this.employeeOptions = res.data
          .filter((item) => item.status === 'on')
          .map((item) => {
            return {
              label: this.$language === 'en' ? item.ename : item.cname,
              value: item.employeeId,
            }
          })
      })
    },
    handleExcpCodeChange(val) {
      this.createItem.reasonCode = ''
			console.log('选择异常类型：', val)
      let obj = this.allTypeList.find((item) => {
        return item.expTypeCode === val[1]
      })
      this.excpOid = (obj && obj.oid) || ''
			this.createItem.reasonTypeName = (obj && obj.expTypeName) || ''
    },
    reasonCodeChange(val) {
      let obj = this.excpResultOptions.find((item) => {
        return item.reasonCode === val
      })
      this.createItem.isControl = (obj && obj.isControl) || ''
			this.createItem.reasonName = (obj && obj.reasonName) || ''
    },
    // 异常详情附件下载
    handleViewExcpFiles(row) {
      this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
    },

    // 进展描述附件下载
    handleViewProgressFiles(item) {
      this.$store
        .dispatch('order/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: item.fileNo,
          },
        })
        .then((res) => {
          console.log(res)
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = item.fileName
          link.click()
        })
    },

    // 详情
    getDetail() {
      let { excpId } = this.$route.query
      this.lsLoading = true
      workExceptionDetail({ excpId: Number(excpId) }).then((res) => {
        this.addExcpItemShow = true
        this.status = res.data.handleStatus
        for (let i in defaultCreateQuery) {
          this.createItem[i] = res.data[i]
          if (['chargeEmployeeId', 'responsibleId'].includes(i) && this.createItem[i] === 0) {
            this.createItem[i] = ''
          }
        }
        // 负责人回显
        this.employeeOptions = [{ label: this.createItem.chargeEmployeeName, value: this.createItem.chargeEmployeeId }]
        // 责任方回显
        if (this.createItem.responsibleType === 'supplier') {
          if (this.createItem.responsibleId) {
            this.supplierOptions = [{ label: this.createItem.responsibleName, value: this.createItem.responsibleId }]
          }
        } else if (this.createItem.responsibleType === 'staff') {
          if (this.createItem.responsibleId) {
            this.staffOptions = [{ label: this.createItem.responsibleName, value: this.createItem.responsibleId }]
          }
        }
				
				// 异常原因回显  异常类型回显
				let obj1 = this.allTypeList.find((item) => {
           return item.expTypeCode === this.createItem.reasonTypeCode
				})
				if (obj1){
          this.excpOid = obj1.oid || ''
					let obj2 = this.allTypeList.find((item) => {
             return item.oid === obj1.expParentId
			  	})
					if (obj2) {
              this.createItem.reasonTypeCode = [obj2.expTypeCode, this.createItem.reasonTypeCode]
				    	console.log('this.createItem.reasonTypeCode', this.createItem.reasonTypeCode)
					}
			 
				}
			
        this.handleCheckIsCharge()
        this.handleChangeOrderNo(this.$route.query.orderNo, 'detail')
        this.getServListByServType()

        this.createItem.exceptionItemList.map((item) => {
          // 登录用户为跟进人的跟进项，并且跟进项状态为未完成的
          if ((item.followEmployeeId === this.userId || (item.followManagerIds || []).includes(this.userId)) && item.status !== 'finished') {
            Object.assign(item, {
              addBtnShow: true,
              type: 'item',
            })
            if (item.exceptionProgressList && item.exceptionProgressList.length) {
              item.exceptionProgressList.map((ele) => {
                Object.assign(ele, {
                  editBtnShow: true,
                  deleteBtnShow: true,
                })
              })
            }
          }
          console.log(this.isNotCharge)
          // 登录用户为跟进项创建人
          if (item.createdBy === this.userId || (item.followCreatorManagerIds || []).includes(this.userId)) {
            Object.assign(item, {
              deleteBtnShow: true,
              type: 'item',
            })
          }
        })
      }).finally(() => {
        this.lsLoading = false
      })
    },

    // 跟进项状态修改
    handleChangeExcpItemStatus(val, row) {
      updateItemStatus({ excpItemId: row.excpItemId, status: val }).then((res) => {
        this.getDetail()
      })
    },

    // 判断用户是否负责人，负责人有可编辑的权限；
    handleCheckIsCharge() {
      // 异常单的创建人、负责人，都需要能编辑更新异常单
      // this.isNotCharge = this.createItem.chargeEmployeeId !== this.userId
    },

    // 获取多选
    handleSelectionChange(val) {
      this.multipleSelection = val
      console.log(this.multipleSelection)
    },

    // 全选/全不选
    handleSelectAll(selection) {
      //table第一层只要有在selection里面就是全选
      const isSelect = selection.some((el) => {
        const oids = this.blList.map((j) => j.oid)
        return oids.includes(el.oid)
      })
      //table第一层不在selection里面就是全不选
      const isCancel = !this.blList.every((el) => {
        const selectOids = selection.map((j) => j.oid)
        return selectOids.includes(el.oid)
      })

      if (isSelect) {
        selection.map((el) => {
          if (el.children) {
            el.children.map((j) => {
              this.toggleSelection(j, true)
            })
          }
        })
      }

      if (isCancel) {
        this.blList.map((el) => {
          if (el.children) {
            el.children.map((j) => {
              this.toggleSelection(j, false)
            })
          }
        })
      }
    },

    toggleSelection(row, select) {
      if (row) {
        this.$nextTick(() => {
          this.$refs.blTable && this.$refs.blTable.toggleRowSelection(row, select)
        })
      } else {
        this.$refs.blTable.clearSelection()
      }
    },

    // 关闭异常
    handleCancel() {
      this.cancelShow = true
    },

    // 取消异常单弹窗关闭回调
    cancelPopClose(action, data) {
      this.cancelShow = false
      if (action === 'Confirm') {
        workExceptionUpdateStatus(data).then((res) => {
          this.$message({
            type: 'success',
            message: '异常单取消成功',
            duration: 1000,
            onClose: () => {
              this.handleReturn()
            },
          })
        })
      }
    },

    // 处理完成
    handleFinish() {
      workExceptionUpdateStatus({
        excpId: this.$route.query.excpId,
        status: 'closed',
      }).then((res) => {
        this.$message({
          type: 'success',
          message: '修改状态为处理完成成功',
          duration: 1000,
          onClose: () => {
            this.handleReturn()
          },
        })
      })
    },

    // 上传文件
    handleUpload(data) {
      this.createItem.files = data
    },

    // 删除上传后的文件
    handleDeleteFile(index) {
      this.createItem.files.splice(index, 1)
    },

    // 新增跟进人
    handleAdd() {
      if (this.$route.query.excpId) {
        this.addEmployeeNameShow = true
      } else {
        return this.$message({
          type: 'warning',
          message: '请先保存异常单信息',
        })
      }
    },

    // 关闭新增跟进人弹窗回调
    addEmployeeNamePopClose(action) {
      this.addEmployeeNameShow = false
      if (action === 'Confirm') {
        this.getDetail()
      }
    },

    // 新增进展描述
    handleAddProgress(row) {
      this.progressShow = true
      Object.assign(this.createProgressItem, defaultCreateProgressQuery, {
        excpId: row.excpId,
        excpItemId: row.excpItemId,
      })
    },

    // 关闭新增跟进人弹窗回调
    progressPopClose(action) {
      this.progressShow = false
      if (action === 'Confirm') {
        this.getDetail()
      }
    },

    // 修改进展描述
    handleEditProgress(row) {
      this.progressShow = true
      for (let i in this.createProgressItem) {
        this.createProgressItem[i] = row[i]
      }
    },

    // 删除
    handleDelete(row) {
      this.$confirm('是否确认删除该条数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          // 跟进人删除
          if (row.type === 'item') return workExceptionDeleteItem({ excpItemId: row.excpItemId })
          // 进度描述删除
          return workExceptionDeleteProgress({ oid: row.oid })
        })
        .then((response) => {
          this.getDetail()
          this.$message({ message: '删除成功', type: 'success' })
        })
        .catch(() => {})
    },

    // 返回列表
    handleReturn() {
      this.$router.push({
        path: 'workException',
      })
    },

    // 获取保存提交的参数
    getValues() {
      return Object.assign(this.createItem, {})
    },

    // 保存
    handleSave() {
      this.$refs['excpSave'].validate((valid) => {
        if (valid) {
          if (this.$route.query.excpId) {
            this.saveData()
          } else {
            let data = {
              orderNo: this.createItem.orderNo,
              serviceCode: this.createItem.serviceCode
            }
            workExceptionSaveCheck(data)
            .then(res => {
              let excpNos = (res.data && res.data.excpNos) || []
              if (excpNos && excpNos.length) {
                 this.$confirm(`该工作单已有相同服务项的异常单（异常编号${excpNos.join(',')}），是否确定继续创建？`, '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                  }).then(() => {
                    this.saveData()
                  }).catch(err => {
                    return false
                  })
              } else {
                this.saveData()
              }
            })
          }
        } else {
          this.submitDisabled = false
          console.log('error submit!!')
          return false
        }
      })
    },
    saveData() {
      let responsibleId = ''
      let responsibleName = ''
      if (this.createItem.responsibleType === 'other' || !this.createItem.responsibleId) {
        responsibleId = 0
      } else {
        responsibleId = this.createItem.responsibleId
      }
      if (!this.createItem.responsibleId && this.createItem.responsibleType !== 'other') {
        let findItem = this.dictMap.responsibleType.find((item) => {
          return this.createItem.responsibleType === item.value
        })
        responsibleName = findItem ? findItem.label : ''
      } else {
        responsibleName = this.createItem.responsibleName
      }
      this.submitDisabled = true
      workExceptionSave({ ...this.createItem, responsibleId, responsibleName, reasonTypeCode: this.createItem.reasonTypeCode[1]})
        .then((res) => {
          this.$message({
            type: 'success',
            message: '保存成功',
            duration: 1000,
            onClose: () => {
              this.submitDisabled = false
              this.routerPush('WorkExceptionDetail', {
                excpId: res.data.excpId,
                orderNo: res.data.orderNo,
                ...this.$route.query,
              })
              this.getDetail()
            },
          })
        })
        .catch((err) => {
          setTimeout(() => {
            this.submitDisabled = false
          }, 2000)
        })
    }
  },
}
</script>
<style lang="scss">
@import '../less/index.scss';
.edit-container .component-cont .row-flex.excp-row .flex-item {
  margin-bottom: 4px;
  width: 25%;
  &.col-2{
    width: 50%;
  }
  &.col-1{
    width: 100%;
  }
}
.edit-container .component-cont .row-flex.excp-row .flex-item.flex-item-upload {
  display: flex;
  .item-label{
    width: 90px;
    padding-right: 4px;
    .lab{
      width: 100%;
      display: block;
      text-align: right;
    }
  }
  .rail-file-upload{
    flex: 1;
  }
}
.edit-container .component-cont .row-flex.excp-row {
  margin-top: 0;
}
.excp-row {
  .flex-item {
    .el-form-item__label {
      line-height: 20px;
      padding-right: 4px;
    }
  }
}
.edit-container.excp-container {
  padding: 10px;
}
.edit-container.excp-container .component-cont {
  margin-top: 0;
  padding-top: 0;
}
.edit-container .component-cont .row-flex.excp-row .padding0 {
  padding: 0;
}
.edit-container .component-cont .row-flex.excp-row .padding-left-0 {
  .el-form-item__content {
    margin-left: 0px !important;
  }
}
</style>
