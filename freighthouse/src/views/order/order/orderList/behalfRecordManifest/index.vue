<template>
  <div class="edit-container order-book fullWrap" id="behalfRecordManifest">
    <div class="order-container">
      <!-- 协同撤回申请提示 -->
      <CancelApplyAlert v-if="jointShow && isCancelApply && serviceCode !== 'book'" :serviceInfo="serviceInfo" :serviceList="orderInfo.serviceList" @callback="getOrderInfo" />
      <!-- 订单已取消提示 -->
      <CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
      <!-- 订单拒绝提示 -->
      <RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
      <div class="tabs-container">
        <TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
        <div class="detail-container flex">
          <LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" @getOceanManifestIsJoint="getOceanManifestIsJoint"/>
          <div class="flex1 component-main-cont">
            <div class="service-container">
              <ServiceCustInfo :orderInfo="orderInfo" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute" @getServiceStatus="getServiceStatus"></ServiceCustInfo>
              <div class="component-cont table-com-layout">
                <div class="between h28">
                  <div class="ft12 bold">代录舱单</div>
                  <div>
                    <ButtonTip
                      btnType="primary" 
                      :btnDisabled="!isEditView" 
                      btnText="新增舱单" 
                      tipContent="非该单操作人员、或服务项进度为已完成、或该服务项被协同，不允许该操作" 
                      class="operateBtn-tip ml10" 
                      @click="handleAdd">
                    </ButtonTip>
                    <!-- <el-button size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="!isEditView">新增舱单</el-button> -->
                  </div>
                </div>
                <el-table ref="multipleTable" fit style="width: 100%" :data="fileList" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
                  <el-table-column prop="typeName" label="附件类别" align="center"> </el-table-column>
                  <el-table-column prop="loadType" label="附件名称" align="center">
                    <template slot-scope="scope">
                      <div class="operate-group">
                        <el-button @click="handleView(scope.row)" type="text" size="mini">
                          <span class="file-name-style">{{ scope.row.name }}</span>
                        </el-button>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="manifestNum" label="舱单数" align="center"> </el-table-column>
                  <el-table-column prop="customsNum" label="报关单数" align="center"> </el-table-column>
                  <el-table-column prop="createdName" label="上传人" align="center"> </el-table-column>
                  <el-table-column prop="createdTime" label="上传时间" align="center"> </el-table-column>
                  <el-table-column label="操作" width="150" align="center" fixed="right">
                    <template slot-scope="scope">
                      <div class="operate-group">
                        <ButtonTip
                          btnType="text" 
                          :btnDisabled="!isEditView" 
                          btnText="删除" 
                          tipContent="非该单操作人员、或服务项进度为已完成、或该服务项被协同，不允许该操作" 
                          class="operateBtn-tip" 
                          btnClassName="red"
                          @click="handleDelete(scope.row, scope.$index)">
                        </ButtonTip>
                        <!-- <el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="!isEditView">删除</el-button> -->
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
                <table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
              </div>
              <!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="serviceCode" /> -->
            </div>
            <JointWorkAssign :jointServiceWorkList="jointServiceWorkList" :serviceCode="serviceCode" @callback="jointWorkAssignCallback" />
            <!-- 上传 -->
            <div v-if="uploadPopShow">
              <FileUpload @close="uploadPopClose" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import { manifestDelete, manifestList } from '@/api/order/list'
import FileUpload from './components/fileUpload'
import tableTooltip from '@/components/Base/Table/table-tooltip'

const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: [],
	query: []
}
const defaultPage = {
	pageSize: -1,
	currPage: 1,
	totalCount: null
}

export default {
  filters: {},
  mixins: [orderMixin, routerMixin],
  data() {
    return {
      oQuery: this.$route.query,
      status: '', // 委派状态
      fileList: [],
      isEditRows: [],
      multipleSelection: [],
      supplierList: [],
      canSave: true,
      routeName: 'BehalfRecordManifest',
      activityKey: '',
      serviceCode: 'ocean_manifest',
      uploadPopShow: false,
      oceanManifestIsJoint: false, // 是否协同
      progressValue:'', // 工作进度 finish 已完成不能上传，删除舱单
      tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null, // 行数据
      },
      tableQuery: Object.assign({}, defaultTableQuery, defaultPage)
    }
  },
  created() {
    this.getOrderInfo()
    if (this.jointShow) {
      this.getJointServiceWorkList(this.serviceCode)
    }
    this.getFileList()
  },
  mounted() {
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL)
      window.addEventListener('popstate', this.browserBack, false)
    }
  },
  destroyed() {
    window.removeEventListener('popstate', this.browserBack, false)
  },
  computed: {
    isBd() {
      let isBd =
        !this.ordDetRole ||
        this.ordDetRole === 'bd' ||
        this.ordDetRole === 'obd' ||
        this.ordDetRole === 'doc' ||
        this.ordDetRole === 'ac'
      return isBd || this.isJoint || this.isFinish
    },
    isFinish() {
      let findItem = this.serviceInfoList.find(
        (item) => item.serviceCode === 'ocean_manifest'
      )
      let progress = findItem ? findItem.serviceStatus : ''
      return progress === 'finish' ? true : false
    },
    isEditView() {
      // 操作，该服务未协同，服务状态未完成
      return this.ordDetRole === 'op'&&!this.oceanManifestIsJoint&&this.progressValue!=='finish'
    }
  },
  components: {
    CancelApplyAlert,
    CancelAlert,
    RefuseAlert,
    TopNav,
    LeftNav,
    ServiceCustInfo,
    JointWorkAssign,
    // OneServiceFee,
    FileUpload,
    tableTooltip
  },
  watch: {},
  methods: {
    // 鼠标移入cell
    showTooltip(row, column, cell) {
      this.tableCellMouse.cellDom = cell;
      this.tableCellMouse.row = row;
      this.tableCellMouse.hidden = false;
    },
    // 鼠标移出cell
    hiddenTooltip() {
      this.tableCellMouse.hidden = true;
    },
    getServiceStatus(val){
      this.progressValue=val
    },
    getOceanManifestIsJoint(val){
      this.oceanManifestIsJoint=val
    },
    handleView(row) {
      this.$store.dispatch('order/previewFile', {
        fileNo: row.fileNo,
        fileName: row.name
      })
    },
    // 附件列表
    getFileList() {
      // let query = [
			// 	{column: 'orderNo', type: 'eq', value: this.$route.query.orderNo},
			// 	{column: 'typeCode', type: 'in', value: 'afr,ams,emain,isf,ocean_manifest'}
			// ]
			// Object.assign(this.tableQuery, {
			// 	query: query
      // })
      this.lsLoading = true
      let params={
        typeCodes:['afr','ams','emain','isf','ocean_manifest'],
        orderNo: this.$route.query.orderNo
      }
			manifestList(params).then(res => {
				this.fileList = res.data
			}).finally(() => {
        this.lsLoading = false
      })
    },
    // 获取选中的oid
    getOids() {
      let oids = []
      this.multipleSelection.map((item) => {
        oids.push(item.oid)
      })
      return oids
    },

    // 新增附件
    handleAdd() {
      this.uploadPopShow = true
    },
    // 上传弹窗关闭回调
    uploadPopClose(action) {
      this.uploadPopShow = false
      if (action === 'Confirm') {
        this.getFileList()
      }
    },
    // 删除
    handleDelete(row, sIndex) {
      let data = {
        orderNo: row.orderNo,
        oid: row.oid,
        fileBatchNo: row.fileBatchNo
      }
      this.$confirm('是否确认删除该条数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return manifestDelete(data)
        })
        .then((response) => {
          this.getFileList()
          this.$message({ message: '删除成功', type: 'success' })
        })
        .catch(() => {})
    },
    jointWorkAssignCallback() {
      this.getJointServiceWorkList(this.serviceCode)
    }
  }
}
</script>
<style lang="scss">
@import '../../less/index.scss';
#behalfRecordManifest {
  .edit-container,
  .component-main-cont {
    height: 100%;
  }
  .component-cont {
    margin-top: 0px;
    padding: 10px 20px;
		border-top: 8px solid #f5f5f5;
  }
  .finance-one-service-fee-separator {
    display: none;
  }
}
#behalfRecordManifest .remark-con {
  display: flex;
}
#behalfRecordManifest .remark-con .txt {
  display: inline-block;
  overflow: hidden;
  width: 120px;
  height: 16px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
#behalfRecordManifest .remark-con .underline {
  padding: 0;
}
</style>
