<template>
  <div class="order-info">
    <div class="cont">
      <div class="orderNo">
        <div class="flex">
          <div class="item">
            <!-- <img class="icon" style="padding-top: 2px; float: left;" :src="require('@/assets/icon-file.png')"/> -->
            <!-- <span class="item-label bold">工作号：{{$route.query.orderNo}}({{serviceTypeLabel}})</span> -->
            <el-popover placement="bottom" width="200" trigger="hover" class="port-ename" popper-class="order-unit-popover">
              <div class="port-popover">
                <div>
                  <span>{{$route.query.orderNo}}({{serviceTypeLabel}})</span>
                  <em @click="handleCopyorderNo($route.query.orderNo, $event)">复制工作号</em>
                </div>
              </div>
              <div slot="reference" class="item-label bold">工作号:{{$route.query.orderNo}}({{serviceTypeLabel}})</div>
            </el-popover>
          </div>
          <div class="item">
            <span class="item-label cust-item">
              <!-- <el-tooltip effect="dark" :content="($route.query.custid || createItem.custid)+(createItem.custName ? `(${createItem.custName})` : '')" placement="top-start"> -->
              <!-- <span class="cust">{{$route.query.custid || createItem.custid}}{{createItem.custName ? `(${createItem.custName})` : ''}}</span> -->
              <entrustUnitComp :showEdit="isBd && createItem.fineCloseStatus !== 'yes'" @handleCustUpdaShow="handleCustUpdaShow"/>
              <!-- </el-tooltip> -->
            </span>
            <!-- <span class="cust" v-else>{{$route.query.custid || createItem.custid}}{{createItem.custName ? `(${createItem.custName})` : ''}}</span> -->
          </div>
          <!-- <div class="item">
            <span class="item-label cust-item">客户类型:
              <span class="cust">{{ createItem.custClass | getCustClassName}}</span>
            </span>
          </div> -->
          <div class="item">
            <span class="item-label cust-item">客户委托号:
              <el-tooltip effect="dark" :content="createItem.custIntrustNo || $route.query.custIntrustNo" placement="top-start">
                <span class="cust">{{createItem.custIntrustNo || $route.query.custIntrustNo}}</span>
              </el-tooltip>
              <!-- <span class="cust" v-else>{{createItem.custIntrustNo || $route.query.custIntrustNo}}</span> -->
              <!-- 客户委托号都可以修改，除了协同单不能修改 -->
              <i class="el-icon-edit" @click="handleCustNoUpdaShow" v-if="$route.query.source !== 'jointList'&&!pricingAuditEmployeeDisabled"></i>
            </span>
          </div>
        </div>
        <div class="flex nowrap">
          <div class="item per33" v-if="$route.query.jointNo">
            <span class="item-label">协同单号：<div class="img-white-box">
              <img v-if="['Y', 'y'].includes(createItem.isWhiteCust)" :src="require(`@/views/order/order/images/white-new.png`)" class="img-white" />
            </div>{{$route.query.jointNo}}</span>
          </div>
          <div class="item" :class="$route.query.jointNo ? 'per33' : 'per33'">
            <span class="item-label">服务类型: {{serviceTypeFilter()}}</span>
          </div>
          <div class="item service" :class="$route.query.jointNo ? 'per100' : 'per66'">
            <div class="item-label" @click="handleToogleServiceType" :class="viewState || isOpServiceState ? 'readOnly' : ''">
              <span class="required-icon">*</span>
              服务项：
              <span v-for="(item, index) in checkedServiceNames" :key="item.serviceCode">{{index ? `+${item.serviceName}` : `${item.serviceName}`}}</span>
            </div>
          </div>
        </div>
      </div>
      <slot />
    </div>
    <!-- <div class="soNum" v-if="createItem.serviceType === 'st01'">
      <div class="item-label" @click="handleToogleServiceType" :class="viewState || isOpServiceState ? 'readOnly' : ''">
        服务项：
        <span v-for="(item, index) in checkedServiceNames" :key="item.serviceCode">{{index ? `+${item.serviceName}` : `${item.serviceName}`}}</span>
      </div>
    </div> -->
    <ServiceCheckbox 
      v-show="serviceTypeListShow"
      :disabled="viewState || isOpServiceState"
      :createItem="createItem"
      :orderStatus="createItem.orderStatus"
      :serviceCodeOptions="serviceCodeOptions"
      @updServiceList="updateServciceList"
    />
    <!-- <div class="serviceTypeList-container" v-show="serviceTypeListShow">
      <el-checkbox-group size="mini" v-model="createItem.serviceList" @change="handleCheckedServiceTypes">
        <el-checkbox size="mini" class="" v-for="item in serviceCodeOptions" :key="item.serviceCode" :disabled="item.disabled" :label="item.serviceCode" @change="(val) => handleChangeChecked(val, item)">
          {{item.serviceName}}
        </el-checkbox>
      </el-checkbox-group>
    </div> -->
    <div v-if="custNoUpdateShow">
      <CustNo :custNoParam="createItem" @close="custNoUpdateClose"></CustNo>
    </div>
    <div v-if="custUpdateShow">
      <DraftCustUpdate :custParam="createItem" @close="custUpdateClose" v-if="createItem.isDraftCust === 'Y' || createItem.orderStatus === 'draft'"></DraftCustUpdate>
      <CustUpdate :custParam="createItem" @close="custUpdateClose" v-else></CustUpdate>
		</div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getDictLabel, getTextSize } from '@/utils/tools'
import CustNo from './custNoUpdatePop'
import ServiceCheckbox from './serviceCheckbox'
import { mainCustIntrustEdit } from '@/api/airTransport/order'
import { mainCustUpdate, custChangeApply } from '@/api/order/list'
import DraftCustUpdate from './custUpdatePop'
import CustUpdate from './custUpdatePop2'
import clip from '@/utils/clipboard'
export default {
  filters: {
    businessTypeFilter(businessType) {
      return getDictLabel('businessType', businessType)
    },
    cargoSourceFilter(cargoSource) {
      return getDictLabel('cargoSource', cargoSource)
    },
    getCustClassName(val) {
      if (val) {
        return getDictLabel('customerClass', val.toLowerCase())
      } else {
        return ''
      }
    }
  },
  data() {
    return {
      oQuery: this.$route.query,
      getTextSize: getTextSize,
      // viewState: false,
      // isOpServiceState: false,
      // includeFeederState: '',
      // 是否包含驳船
      yesOrNoOptions: {
        y: '是',
        n: '否'
      },
      serviceTypeListShow: false, // 服务项默认隐藏
      custNoUpdateShow: false,
      custUpdateShow: false
    }
  },
  props: {
    pricingAuditEmployeeDisabled: {
      type: Boolean,
      default: false
    },
    createItem: {
      type: Object,
      default: () => ({})
    },
    // includeFeeder: {
    //   type: String,
    //   default: ''
    // },
    orderStatus: {
      type: String,
      default: ''
    },
    serviceTypeOptions: {
      type: Array,
      default: () => []
    },
    serviceCodeOptions: {
      type: Array,
      default: () => []
    },
    isPricing: {
      type: Boolean,
      default: false
    },
    isBd: {
      type: Boolean,
      default: false
    }
  },
  activated() {
    if (!this.$route.meta.isUseCache) {
      this.serviceTypeListShow = false
    }
  },
  created() {
    let { serviceList } = this.createItem
    this.serviceTypeListShow = false
  },
  mounted() {
    if (document.querySelector('.air-cont')) {
      this.$nextTick(() => {
        let offsetTop = document
          .querySelector('.air-cont')
          .getBoundingClientRect().top
        this.$emit('getHeight', offsetTop)
      })
      window.onresize = () => {
        if (document.querySelector('.air-cont')) {
          let offsetTop = document
            .querySelector('.air-cont')
            .getBoundingClientRect().top
          this.$emit('getHeight', offsetTop)
        }
      }
    }
  },
  computed: {
    serviceTypeLabel() {
      if (['st13', 'st14'].includes(this.createItem.serviceType)) {
        return '空运进口'
      } else {
        return '空运出口'
      }
    },
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole,
      roles: (state) => state.user.roles,
      airOrderInfo: (state) => state.airTransport.airOrderInfo
    }),
    isAc() {
      return this.ordDetRole === 'ac'
    },
    isOp() {
      return this.ordDetRole === 'op'
    },
    checkedServiceNames() {
      let result = this.serviceCodeOptions.filter((item) => {
        return this.createItem.serviceList.includes(item.serviceCode)
      })
      return result
    },
    viewState() {
      console.log(this.orderStatus)
      let isView = true
      if (this.$route.query.action === 'view') {
        isView = true
      }
      if (
        (this.isBd || this.isPricing) &&
        ['draft', 'refuse'].includes(this.orderStatus)
      ) {
        isView = false
      }
      if (this.isOp && ['pass'].includes(this.orderStatus)) {
        isView = false
      }
      // 放开已关账、已完成的限制
      // this.isOp && ['break'].includes(this.orderStatus) && this.createItem.finCloseStatus !== 'yes'
      if (this.isOp && ['break'].includes(this.orderStatus)) {
        isView = false
      }
      if (this.$route.query.source === 'jointList') {
        // if (this.createItem.businessType === 'air_import') {
        //   isView = false
        // } else {
        //   isView = true
        // }
        isView = true
      }
      if (this.isPricing && ['submit'].includes(this.orderStatus)) {
        isView = false
      }
      return isView
    },
    isOpServiceState() {
      return this.isOp && !['pass','break'].includes(this.orderStatus)
    }
  },
  watch: {
    serviceTypeListShow(newVal, oldVal) {
      this.$nextTick(() => {
        let shipContOffsetTop = document
          .querySelector('.air-cont')
          .getBoundingClientRect().top
        this.$emit('getHeight', shipContOffsetTop)
      })
    }
    // includeFeeder: {
    //   handler(newVal) {
    //     this.includeFeederState = newVal
    //   },
    //   deep: true,
    //   immediate: true
    // },
  },
  components: { 
    DraftCustUpdate,
    CustUpdate,
    CustNo,
    ServiceCheckbox
  },
  methods: {
    handleCopyorderNo(val, e) {
			clip(val, e)
		},
		clipboardSuccess() {
			this.$message({
				message: '复制成功',
				type: 'success',
				duration: 1500
			})
		},
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
        mainCustIntrustEdit(value)
          .then((res) => {
            this.custNoUpdateShow = false
            this.$message({ type: 'success', message: '修改客户委托号成功' })
            this.$emit('updateCust')
          })
          .finally(() => {})
      } else {
        this.custNoUpdateShow = false
      }
    },
    serviceTypeFilter() {
      let findItem = this.serviceTypeOptions.find(
        (item) => item.serviceType === this.createItem.serviceType
      )
      return findItem ? findItem.name : ''
    },
    // 切换服务项列表隐藏显示
    handleToogleServiceType() {
      if (this.viewState || this.isOpServiceState) return
      this.serviceTypeListShow = !this.serviceTypeListShow
    },
    updateServciceList(values) {
      this.$set(this.createItem, 'serviceList', values)
    },

    // handleCheckedServiceTypes(val) {
    //   // console.log(val)
    // },

    // handleChangeChecked(val, item) {
    //   if (
    //     ['st05', 'st06', 'st20', 'st21', 'st22'].includes(
    //       this.createItem.serviceType
    //     )
    //   ) {
    //     if (!val && item.serviceCode === 'airbook') {
    //       this.createItem.serviceList.push('airbook')
    //     }
    //   } else {
    //     if (!val && item.serviceCode === 'book') {
    //       this.createItem.serviceList.push('book')
    //     }
    //     if (!val && item.serviceCode === 'proxy_book') {
    //       this.createItem.serviceList.push('proxy_book')
    //     }
    //   }

    //   // 订舱，代订舱选一个
    //   if (val && item.serviceCode === 'proxy_book') {
    //     this.createItem.serviceList = this.createItem.serviceList.filter(
    //       (item) => {
    //         return item !== 'book'
    //       }
    //     )
    //   }
    //   if (val && item.serviceCode === 'book') {
    //     this.createItem.serviceList = this.createItem.serviceList.filter(
    //       (item) => {
    //         return item !== 'proxy_book'
    //       }
    //     )
    //   }
    // },

    // 切换是否包含驳船
    hadnleChangeIncludeFeeder(val) {
      // this.includeFeederState = val
      this.$emit('change', val)
    },

    // // 切换服务类型
    // hadnleChangeServiceType(val) {
    //   Object.assign(this.createItem, {
    //     serviceType: val
    //   })
    //   this.getServiceTypes('change')
    // }
  }
}
</script>

<style lang="scss" scoped>
.order-info {
  background-color: #fff;
  // box-shadow: 0px 4px 10px 0px #E9E9E9;
  overflow: hidden;
  .cont {
    display: block;
    overflow: hidden;
    // height: 48px;
    margin: 8px 0 0 8px;
    .orderNo {
      min-width: 900px;
      // width: 80%;
      display: inline-block;
      .item {
        height: 20px;
        line-height: 20px;
        overflow: hidden;
        white-space: nowrap;
        margin-bottom: 4px;
        display: inline-block;
        padding-right: 10px;
        .mr10 {
          margin-right: 10px;
        }
        &.w250 {
          width: 250px;
        }
        &.w180 {
          width: 180px;
        }
        &.w310 {
          width: 310px;
        }
        &.w280 {
          width: 280px;
        }
        &.w470 {
          width: 470px;
        }
        &.per28 {
          width: 28%;
        }
        &.per35 {
          width: 35%;
        }
        &.per37 {
          width: 37%;
        }
        &.per33 {
          width: 33.3%;
        }
        &.per66 {
          width: 66.6%;
        }
        &.per100 {
          width: 100%;
        }
        &.per25 {
          width: 25%;
        }
        .item-label {
          width: 100%;
          display: inline-block;
          height: 20px;
          line-height: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          &.cust-item {
            padding-right: 10px;
            display: flex;
          }
          .cust {
            display: block;
            position: relative;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .el-icon-edit {
            display: block;
            font-size: 14px;
            font-weight: bold;
            // margin-left: 5px;
            color: #3e80f5;
            cursor: pointer;
            height: 20px;
            line-height: 20px;
          }
          &.bold {
            font-weight: bold;
          }
        }
        &.service {
          .item-label {
            width: 100%;
            display: block;
            // text-decoration: underline;
            color: #3e80f5;
            cursor: pointer;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            &.readOnly {
              color: #454545;
              text-decoration: none;
            }
          }
        }
      }
    }
    .operateBtn-group {
      margin: 0 5px 0 0;
      // max-width: 440px;
      text-align: right;
      float: right;
      // display: inline-block;
      .btn-groups {
        height: 20px;
        overflow: hidden;
        white-space: nowrap;
        .el-button-group {
          .el-button--mini {
            padding: 0 7px;
          }
          .el-button + .el-button {
            margin-left: 5px;
          }
        }
        .el-button--mini {
          padding: 0 7px;
        }
        .el-button + .el-button {
          margin-left: 2px;
        }
        .el-button.submitCancel {
          background-color: #674dc9;
          color: #fff;
          border-color: #674dc9;
        }
      }
      .status {
        line-height: 20px;
        margin-top: 4px;
        span {
          line-height: 20px;
          &.value {
            font-size: 12px;
            color: #edb534;
            margin-left: 20px;
          }
          &.red {
            color: #cd4130;
          }
          &.yellow {
            color: #edb534;
          }
          &.green {
            color: #33b18a;
          }
          &.black {
            color: #4a4a4a;
          }
        }
      }
    }
  }
  .soNum {
    width: 740px;
    line-height: 20px;
    margin-left: 8px;
    margin-bottom: 8px;
    white-space: nowrap;
    height: 20px;
    text-overflow: ellipsis;
    overflow: hidden;
    .item-label {
      width: 100%;
      display: block;
      text-decoration: underline;
      color: #3e80f5;
      cursor: pointer;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      &.readOnly {
        color: #454545;
        text-decoration: none;
      }
    }
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
.required-icon {
  color: #e63923;
}
</style>

