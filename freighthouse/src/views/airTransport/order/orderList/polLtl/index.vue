<template>
  <div class="edit-container order-book fullWrap" id="polLtl">
    <div class="order-container">
      <div class="tabs-container">
        <div class="detail-container flex" style="min-height:100vh;">
          <div class="flex1 component-main-cont">
            <div class="service-container">
              <ServiceCustInfo :serverIsJoint="isJoint" :orderInfo="orderInfo" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
              <div class="component-cont table-com-layout">
                <div class="mb04 between h20">
                  <div class="ft12 bold">提货计划表</div>
                  <div>
                    <span>委派状态：</span>
                    <el-select style="width: 120px" placeholder="请选择" size="mini" v-model="status" @change="handleUpdateIntrustStatus"  :disabled="!isOp || isJoint || progressValue==='finish'">
                      <el-option v-for="(item, index) in dictMap.airTakeIntrustStatus" :key="index" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                    <el-button size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="!isOp || isJoint || progressValue==='finish'">新增派车</el-button>
                    <!-- <el-button size="mini" type="default" :disabled="isBd" class="ml10" @click="handleOpenExportPop">输出派车单</el-button> -->
                  </div>
                </div>
                <el-table header-row-class-name="pol-ltl-th" ref="multipleTable" fit style="width: 100%" :data="list" @selection-change="handleSelectionChange" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
                  <el-table-column type="selection" :selectable="selectable"></el-table-column>
                  <el-table-column prop="takeNo" label="提货计划编号" align="center" width="140"> </el-table-column>
                  <el-table-column prop="hkTakeNo" label="中港提货号" align="center"> </el-table-column>
                  <el-table-column prop="intrustStatus" label="委派状态" align="center">
                    <template slot-scope="scope">
                      {{ scope.row.intrustStatus | intrustStatusFilter }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="supplierName" label="车队" align="center" width="150">
                    <template slot-scope="scope">
                      <span class="column-text">{{scope.row.supplierName}}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="supplierContact" label="车队联系人" align="center"> </el-table-column>
                  <el-table-column prop="cargoType" label="货物类型" align="center">
                    <template slot-scope="scope">
                      {{ scope.row.cargoType | cargoTypeFilter }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="remark" label="提货要求" align="center">
                    <template slot-scope="scope">
                      <span class="column-text">{{scope.row.remark}}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150" align="center" fixed="right">
                    <template slot-scope="scope">
                      <div class="operate-group">
                        <el-button @click="handleInfo(scope.row)" type="text" size="mini">详情</el-button>
                        <el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" class="red" :disabled="progressValue==='finish' || isJoint||!isOp||scope.row.intrustStatus==='dispatched'">删除</el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
                <table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
              </div>
              <!-- 拖车详情 -->
              <TruckLoad @hideDetail="hideDetail" :detailData="detailData" :orderInfo="orderInfo" :progressValue="progressValue" :isDisabled="progressValue==='finish' || isJoint||!isOp" v-if="showTruckLoad" />
              <!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="serviceCode" /> -->
            </div>
            <JointWorkAssign :jointServiceWorkList="jointServiceWorkList" :serviceCode="serviceCode" @callback="jointWorkAssignCallback" />
          </div>
        </div>
      </div>
    </div>
    <!-- 输出拖车委托单弹窗 -->
    <div v-if="exportPopShow">
      <ExportPop @close="exportPopClose" />
    </div>
  </div>
</template>
<script>
import { getDictLabel } from '@/utils/tools'
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import {
  airTakeList,
  airTakeDel,
  airTakeDetail,
  airTakeGetIntrustNo,
  airTakeUpdateStatus
} from '@/api/order/shippingTruck'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import ExportPop from './components/exportPop'
import TruckLoad from './truckLoad'
import { mapState } from 'vuex'
export default {
  filters: {
    intrustStatusFilter(status) {
      return getDictLabel('airTakeIntrustStatus', status)
    },
    cargoTypeFilter(cargoType) {
      return getDictLabel('cargoProperty', cargoType)
    }
  },
  mixins: [orderMixin, routerMixin],
  data() {
    return {
      truckDetailQuery: {},
      showTruckLoad: false,
      oQuery: this.$route.query,
      status: '', // 委派状态
      list: [], // table渲染需要的数据
      multipleSelection: [],
      canSave: true,
      routeName: this.$route.name,
      activityKey: '',
      serviceCode: 'pick_up',
      exportPopShow: false, // 输出弹窗
      detailData: {},
      type: '', // 新增或编辑标识
      progressValue: '',
      tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null // 行数据
      }
    }
  },
  created() {
    console.log(
      '🚀 ~ this.dictMap.airTakeIntrustStatus',
      this.dictMap.airTakeIntrustStatus
    )
    this.getOrderInfo()
    this.getTruckIntrustList()
    if (this.jointShow) {
      this.getJointServiceWorkList(this.serviceCode)
    }
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
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole,
      order: (state) => state.order,
      finance: (state) => state.finance,
      orderList: (state) => state.airTransport.orderList,
      userId: (state) => state.user.userId,
      roles: (state) => state.user.roles
    })
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
    ExportPop,
    TruckLoad
  },
  watch: {
    orderInfo() {
      if (this.orderInfo.serviceInfoList) {
        this.handleGetServiceStatus()
      }
    }
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
    handleGetServiceStatus() {
      let { serviceInfoList } = this.orderInfo
      let sItem = serviceInfoList.find((item) => item.serviceCode === 'pick_up')
      this.progressValue = sItem ? sItem.serviceStatus : ''
    },
    hideDetail(type) {
      this.showTruckLoad = false
      if (type === 'save') {
        this.getTruckIntrustList()
      }
    },

    selectable(row) {
      return row.oid ? true : false
    },

    // 委托列表
    getTruckIntrustList() {
      airTakeList({
        orderNo: this.$route.query.orderNo
        // orderNo: 'S2020105280001'
      }).then((res) => {
        let { data } = res
        this.list = data
      })
    },

    // 获取多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    // 获取选中的oid
    getOids() {
      let oids = []
      this.multipleSelection.map((item) => {
        oids.push(item.oid)
      })
      return oids
    },

    // 新增
    handleAdd() {
      airTakeGetIntrustNo().then((res) => {
        this.detailData = { takeNo: res.data }
      })
      this.showTruckLoad = true
      this.type = 'add'
    },

    // 新增保存
    handleSave(row, sIndex) {},

    // 详情
    handleInfo(row) {
      let data = { oid: row.oid }
      airTakeDetail(data).then((res) => {
        this.detailData = res.data
        this.$set(
          this.detailData,
          'deliveryArea',
          JSON.parse(this.detailData.deliveryArea)
        )
      })
      this.showTruckLoad = true
      this.type = 'edit'
    },

    // 删除
    handleDelete(row, sIndex) {
      this.$confirm('是否确认删除该条数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let data = {
            oid: row.oid
          }
          return airTakeDel(data)
        })
        .then((response) => {
          if (row.intrustNo === this.detailData.intrustNo) {
            this.showTruckLoad = false
          }
          this.getTruckIntrustList()
          this.$message({ message: '删除成功', type: 'success' })
        })
        .catch(() => {})
    },

    // 委派状态修改
    handleUpdateIntrustStatus(val) {
      if (!this.getOids().length) {
        this.status = ''
        return this.$message.warning('请先选择委派计划')
      }
      this.$confirm('是否确认修改状态?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return airTakeUpdateStatus({
            ids: this.getOids(),
            intrustStatus: val
          })
        })
        .then((response) => {
          if (val === 'dispatched') {
            this.showTruckLoad = false
          }
          this.$message({
            type: 'success',
            message: '委派状态修改成功',
            duration: 1000,
            onClose: () => {
              this.status = ''
              this.getTruckIntrustList()
            }
          })
        })
        .catch((err) => {
          this.status = ''
        })
    },

    jointWorkAssignCallback() {
      this.getJointServiceWorkList(this.serviceCode)
    },

    // 打开输出弹窗
    handleOpenExportPop() {
      if (this.multipleSelection.length !== 1)
        return this.$message({
          type: 'warning',
          message: '请选择一条要导出的散车'
        })
      this.exportPopShow = true
    },
    exportPopClose(action, value) {
      console.log(action, value)
      if (action === 'Confirm') {
        this.handleExport(value)
      } else {
        this.exportPopShow = false
      }
    },
    // 输出
    handleExport(value) {
      this.$store
        .dispatch('order/exportBlobFile', {
          uri: '/order/shipping/scatterTruckIntrust/export',
          data: {
            orderNo: this.$route.query.orderNo,
            jointNo: this.$route.query.jointNo,
            oid: this.multipleSelection[0].oid,
            docType: value.docType
          }
        })
        .then((res) => {
          this.exportPopShow = false
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = `散车委托单${this.$route.query.orderNo}.` + value.docType.toLowerCase()
          link.click()
        })
    }
  }
}
</script>
<style lang="scss">
@import '../../less/index.scss';
#polLtl {
  .cell {
    overflow: hidden;
  }
  .pol-ltl-th {
    font-size: 12px;
    font-weight: 600;
    color: #222222;
  }
  .edit-container,
  .component-main-cont {
    height: unset;
  }
  .component-cont {
    padding: 10px;
  }
  .finance-one-service-fee-separator {
    display: none;
  }
}
#polLtl .remark-con {
  display: flex;
}
#polLtl .remark-con .txt {
  display: inline-block;
  overflow: hidden;
  width: 120px;
  height: 16px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
#polLtl .remark-con .underline {
  padding: 0;
}
#polLtl .remark-style {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: inline-block;
  width: 100%;
  line-height: 16px;
}
</style>
