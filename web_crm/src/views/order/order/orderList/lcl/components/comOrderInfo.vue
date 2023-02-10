<template>
  <div class="order-info lcl-order-info">
    <div class="flex between nowrap">
      <div class="orderNo">
        <div class="flex nowrap">
          <div class="item per25">
            <!-- <img class="icon-orderNo" :src="require('@/assets/icon-file.png')" /> -->
            <span class="item-label bold">工作号：{{$route.query.orderNo}}({{businessTypeName}})</span>
          </div>
          <div class="item" :class="$route.query.jointNo ? 'per37' : 'per50'">
            <span class="item-label cust-item">
              <!-- <el-tooltip v-if="getTextSize('12px',($route.query.custid || createItem.custid)+(createItem.custName ? `(${createItem.custName})` : ''))>=107" effect="dark" :content="($route.query.custid || createItem.custid)+(createItem.custName ? `(${createItem.custName})` : '')" placement="top-start">
                <span class="cust">{{$route.query.custid || createItem.custid}}{{createItem.custName ? `(${createItem.custName})` : ''}}</span>
              </el-tooltip>
              <span class="cust" v-else>{{$route.query.custid || createItem.custid}}{{createItem.custName ? `(${createItem.custName})` : ''}}</span> -->
              <entrustUnitComp :showEdit="isBd && custNameIsEdit" @handleCustUpdaShow="handleCustUpdaShow">
                </entrustUnitComp>
            </span>
          </div>
          <div class="item per28">
            <span class="item-label cust-item">客户委托号：
              <el-tooltip v-if="getTextSize('12px',createItem.custIntrustNo || $route.query.custIntrustNo)>=73" effect="dark" :content="createItem.custIntrustNo || $route.query.custIntrustNo" placement="top-start">
                <span class="cust">{{createItem.custIntrustNo || $route.query.custIntrustNo}}</span>
              </el-tooltip>
              <span class="cust" v-else>{{createItem.custIntrustNo || $route.query.custIntrustNo}}</span>
              <!-- 客户委托号都可以修改，除了协同单,散货订单详情不能修改 -->
              <i class="el-icon-edit" @click="handleCustNoUpdaShow" v-if="$route.query.source !== 'jointList' && $route.name !== 'LclOrderDetail'"></i>
            </span>
          </div>
          <!-- <div class="item" style="width: 180px">
            <span class="item-label">货物来源：{{createItem.cargoSource | cargoSourceFilter}}</span>
          </div> -->
        </div>
        <div class="flex nowrap">
          <div class="item per25" v-if="$route.query.jointNo">
            <span class="item-label">协同单号：<div class="img-white-box">
              <img v-if="['Y', 'y'].includes(createItem.isWhiteCust)" :src="require(`@/views/order/order/images/white-new.png`)" class="img-white" />
            </div>{{$route.query.jointNo}}</span>
          </div>
          <div class="item" :class="$route.query.jointNo ? 'per37' : 'per25'">
            <span class="mr10">服务类型：{{serviceTypeFilter()}}</span>
          </div>
          <div class="item service" :class="$route.query.jointNo ? 'per28' : 'per65'">
            <div class="item-label" @click="handleToogleServiceType" :class="viewState ? 'readOnly' : ''">
              <em class="required">*</em>服务项：
              <span v-for="(item, index) in checkedServiceNames" :key="item.serviceCode">{{index ? `+${item.serviceName}` : `${item.serviceName}`}}</span>
            </div>
          </div>
        </div>
      </div>
      <slot/>
    </div>
    <!-- <div class="soNum">
      <span class="">SO号：</span>
      <span>{{createItem.soStr}}</span>
    </div> -->
    <ServiceCheckbox 
      v-show="serviceTypeListShow"
      :createItem="createItem"
      :orderStatus="createItem.orderStatus"
      :serviceCodeOptions="serviceCodeOptions"
      @updServiceList="updateServciceList"
    />
    <div v-if="custUpdateShow">
      <DraftCustUpdate :custParam="createItem" @close="custUpdateClose" v-if="createItem.isDraftCust === 'Y' || createItem.orderStatus === 'draft'"></DraftCustUpdate>
      <CustUpdate :custParam="createItem" @close="custUpdateClose" v-else></CustUpdate>
    </div>
    <div v-if="custNoUpdateShow">
      <CustNo :custNoParam="createItem" @close="custNoUpdateClose"></CustNo>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import {getDictLabel, getTextSize} from '@/utils/tools'
import {baseBusinessList, baseBusinessServiceList} from '@/api/base'
import { mainCustUpdate, mainCustIntrustEdit, custChangeApply } from '@/api/order/list'
import DraftCustUpdate from '../../components/custUpdatePop'
import CustUpdate from '../../components/custUpdatePop2'
import CustNo from '../../components/custNoUpdatePop'
import ServiceCheckbox from '../../components/serviceCheckbox'

export default {
  filters: {
    cargoSourceFilter(cargoSource) {
      return getDictLabel('cargoSource', cargoSource)
    }
  },
  data() {
    return {
      oQuery: this.$route.query,
      serviceTypeListShow: false, // 服务项默认隐藏
      custUpdateShow: false,
      getTextSize:getTextSize,
      custUpdateShow: false,
      custNoUpdateShow: false
    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => ({})
    },
    orderStatus: {
      type: String,
      default: ''
    },
    serviceTypeOptions: {
      type: Array,
      default: () => ([])
    },
    serviceCodeOptions: {
      type: Array,
      default: () => ([])
    },
    businessTypeOptions: {
      type: Array,
      default: () => ([])
    }
  },
  activated() {
    if(!this.$route.meta.isUseCache ) {
      this.serviceTypeListShow = false
    }
  },
  created() {
    let {serviceList} = this.createItem
    this.serviceTypeListShow = false
  },
  mounted() {
  },
  computed: {
    ...mapState({
      ordDetRole: state => state.order.orderList.ordDetRole
    }),
    isAc() {
			return this.ordDetRole === 'ac'
		},
    isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
    isEpricing() {
			return this.ordDetRole === 'epricing'
    },
    isEcs() {
      return this.ordDetRole === 'ecs'
    },
    isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
    checkedServiceNames() {
      let result = this.serviceCodeOptions.filter(item => {
        return this.createItem.serviceList.includes(item.serviceCode)
      })
      // console.log('result', this.createItem.serviceList, this.serviceCodeOptions)
      return result
    },
    businessTypeName() {
      let name = ''
      let sItem = this.businessTypeOptions.find(item => item.businessType === this.createItem.businessType)
      // console.log('sItem', sItem)
      return sItem ? sItem.name : name
    },
    viewState() {
      // // 散货订单列表的详情只读，不可编辑
			// if (this.$route.name === 'LclOrderDetail') {
			// 	return true
      // }
      let isView = true
      if (this.$route.query.source !== 'jointList') {
        if (this.isBd && ['draft', 'refuse'].includes(this.orderStatus)) {
          isView = false
        }
        if (this.isOp) {
          if (this.orderStatus === 'pass' || this.orderStatus === 'break' && this.createItem.finCloseStatus !== 'yes')
          isView = false
        }
      }
      // 文件审核通过可以编辑
      if (this.isDoc && this.orderStatus === 'pass') {
        isView = false
      }
      return isView
      // return (this.isBd && !['draft', 'refuse'].includes(this.orderStatus)) || (this.isOp && !['pass','break'].includes(this.orderStatus) && this.createItem.finCloseStatus !== 'yes')
    },
    custNameIsEdit() {
      // 潜在客户可直接修改委托单位
      if (this.createItem.isDraftCust === 'Y') {
        if (['draft','submit','pass','refuse'].includes(this.orderStatus)) {
          return true
        } else {
          return false
        }
      } else {
        // 非潜在客户的未关账的修改委托单位走审批流程
        if (this.createItem.fineCloseStatus !== 'yes') {
          return true
        } else {
          return false
        }
      }
    }
  },
  watch: {
    serviceTypeListShow(newVal, oldVal) {
      this.$nextTick(() => {
        this.$emit('getHeight')
      })
    },
  },
  components: {
    DraftCustUpdate,
    CustUpdate,
    CustNo,
    ServiceCheckbox
  },
  methods: {
    handleCustUpdaShow() {
      this.custUpdateShow = true
    },
    custUpdateClose(action, value) {
      if (action === 'Confirm') {
        let fn = this.createItem.isDraftCust === 'Y' || this.createItem.orderStatus === 'draft' ? mainCustUpdate : custChangeApply
        let msg = this.createItem.isDraftCust === 'Y' || this.createItem.orderStatus === 'draft' ? '修改委托单位成功' : '申请修改委托单位成功'
        // 修改委托单位
        fn(value).then(res => {
          this.custUpdateShow = false
          this.$message({type: 'success', message: msg})
          this.$emit('updateCust')
          console.log(res)
        }).finally(() => {
        })
      } else {
        this.custUpdateShow = false
      }
    },
    handleCustNoUpdaShow() {
      this.custNoUpdateShow = true
    },
    custNoUpdateClose(action, value) {
      if (action === 'Confirm') {
        // 修改客户委托号
        mainCustIntrustEdit(value).then(res => {
          this.custNoUpdateShow = false
          this.$message({type: 'success', message: '修改客户委托号成功'})
          this.$emit('updateCust')
          console.log(res)
        }).finally(() => {
        })
      } else {
        this.custNoUpdateShow = false
      }
    },
    serviceTypeFilter() {
      let findItem = this.serviceTypeOptions.find(item => item.serviceType === this.createItem.serviceType)
      return findItem ? findItem.name : ''
    },
    // 切换服务项列表隐藏显示  
    handleToogleServiceType() {
      if (this.viewState) return
      this.serviceTypeListShow = !this.serviceTypeListShow
    },
    updateServciceList(values) {
      this.$set(this.createItem, 'serviceList', values)
    },
  }
};
</script>

<style lang="scss" scoped>
.order-info.lcl-order-info{
  background-color: #fff;
  // box-shadow: 0px 4px 10px 0px #E9E9E9;
  overflow: hidden;
  .flex{
    display: flex;
    &.between{
      justify-content: space-between;
      // height: 74px;
    }
    &.nowrap{
      flex-wrap: nowrap;
    }
    .orderNo{
      margin: 8px 0 8px 8px;
      // flex: 1;
      // display: flex;
      // flex-wrap: wrap;
      width: 67%;
      .item{
        width: 24%;
        // margin-right: 1%;
        height: 20px;
        line-height: 20px;
        overflow: hidden;
        white-space: nowrap;
        padding-right: 8px;
        margin-bottom: 4px;
        .icon-orderNo{
          float: left;
          padding-top: 2px;
        }
        .mr10{
          margin-right: 10px;
        }
        &.per61{
          width: 61%;
        }
        &.per65{
          width: 65%;
        }
        &.per42{
          width: 42%;
        }
        &.per50 {
          width: 50%;
        }
        &.per20 {
          width: 20%;
        }
         &.per40{
          width: 40%;
        }
        &.per39{
          width: 39%;
        }
        &.per37{
          width: 37%;
        }
        &.per35{
          width: 35%;
        }
        &.per25{
          width: 25%;
        }
        &.per33{
          width: 33%;
        }
        &.per28{
          width: 28%;
        }
        .item-label{
          width: 100%;
					display: inline-block;
					height: 20px;
					line-height: 20px;
					overflow: hidden;
					text-overflow: ellipsis;
          white-space: nowrap;
          &.cust-item{
            padding-right: 10px;
            display: flex;
          }
          &.bold{
            font-weight: bold;
          }
          .cust{
            display: block;
            position: relative;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .el-icon-edit{
            display: block;
            font-size: 14px;
            font-weight: bold;
            // margin-left: 5px;
            color: #3e80f5;
            cursor: pointer;
            height: 20px;
            line-height: 20px;
          }
        }
        &.service{
          // width: 48%;
          .item-label{
            width: 100%;
            display: block;                                          
            // text-decoration: underline;
            color: #3E80F5;
            cursor: pointer;
            &.readOnly{
              color: #454545;
              text-decoration: none;
            }
            .required{
              font-style: normal;
              color: #e63923;
            }
          }
        }
      }
    }
    .operateBtn-group{
      margin: 8px 0;
      max-width: 33%;
      text-align: right;
      padding-right: 5px;
      .btn-groups{
        height: 20px;
        // overflow: hidden;
        white-space: nowrap;
        .el-button-group{
          .el-button--mini{
            padding: 0 7px;
          }
          .el-button + .el-button{
            margin-left: 5px;
          }
        }
        .el-button--mini {
          padding: 0 7px;
        }
        .el-button + .el-button{
          margin-left: 2px;
        }
        .el-button.submitCancel{
          background-color: #674DC9;
          color: #fff;
          border-color: #674DC9;
        }
      }
      .status{
        line-height: 20px;
        margin-top: 4px;
        span{
          line-height: 20px;
          &.value{
            font-size: 12px;
            color: #F4C92F;
            margin-left: 10px;
            i{
              display: inline-block;
              width: 14px;
              height: 14px;
              border-radius: 50%;
              line-height: 14px;
              background: url(../../../../../../assets/icon_bkgStatus.png) center center no-repeat;
              background-color: #4a4a4a;
              margin-right: 5px;
              vertical-align: sub;
            }
          }
          &.red {
            color: #cd4130;
            i{
              background-color: #cd4130;
            }
          }
          &.yellow {
            color: #EDB534;
            i{
              background-color: #EDB534;
            }
          }
          &.blue {
            color: #3E80F5;
            i{
              background-color: #3E80F5;
            }
          }
          &.green {
            color: #33B18A;
            i{
              background-color: #33B18A;
            }
          }
          &.black {
            color: #4a4a4a;
            i{
              background-color: #4a4a4a;
            }
					}
        }
      }
    }
    @media (max-width: 1369px) {
      .orderNo {
        max-width: 58%;
      }
      .operateBtn-group {
        max-width: 42%;
      }
    }
  }
  .soNum{
    line-height: 16px;
    margin-left: 8px;
    margin-bottom: 8px;
    white-space: nowrap;
    height: 16px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .img-white-box{
    display: inline-block;
    height: 100%;
    vertical-align:top;
    padding-top: 2px;
  }
  .img-white {
    width: 18px;
    height: 16px;
    margin-right: 2px;
  }
}
</style>
