<template>
  <div class="order-info">
    <div class="cont">
      <div class="orderNo">
        <div class="flex">
          <div class="item per25">
            <!-- <img class="icon-orderNo" :src="require('@/assets/icon-file.png')" style="padding-top: 2px;float:left" /> -->
            <!-- <span class="item-label bold">工作号:{{$route.query.orderNo}}({{createItem.businessType | businessTypeFilter}})</span> -->
            <el-popover placement="bottom" width="200" trigger="hover" class="port-ename" popper-class="order-unit-popover">
              <div class="port-popover">
                <div>
                  <span>{{$route.query.orderNo}}({{createItem.businessType | businessTypeFilter}})</span>
                  <em @click="handleCopyorderNo($route.query.orderNo, $event)">复制工作号</em>
                </div>
              </div>
              <div slot="reference" class="item-label bold">工作号:{{$route.query.orderNo}}({{createItem.businessType | businessTypeFilter}})</div>
            </el-popover>
          </div>
          <div class="item" :class="$route.query.jointNo ? 'per40' : 'per50'">
            <span class="item-label cust-item">
              <!-- 文字溢出才加tip -->
              <!-- <el-tooltip v-if="getTextSize('12px',($route.query.custid || createItem.custid)+(createItem.custName ? `(${createItem.custName})` : ''))>=107" effect="dark" :content="($route.query.custid || createItem.custid)+(createItem.custName ? `(${createItem.custName})` : '')" placement="top-start">
                <span class="cust">{{$route.query.custid || createItem.custid}}{{createItem.custName ? `(${createItem.custName})` : ''}}</span>
              </el-tooltip>
              <span class="cust" v-else>{{$route.query.custid || createItem.custid}}{{createItem.custName ? `(${createItem.custName})` : ''}}</span> -->
              <entrustUnitComp :showEdit="isBd && custNameIsEdit" @handleCustUpdaShow="handleCustUpdaShow">
              </entrustUnitComp>
             
            </span>
          </div>
          <div class="item per20">
            <span class="item-label cust-item">客户委托号:
              <el-tooltip v-if="getTextSize('12px',createItem.custIntrustNo || $route.query.custIntrustNo)>=73" effect="dark" :content="createItem.custIntrustNo || $route.query.custIntrustNo" placement="top-start">
                <span class="cust">{{createItem.custIntrustNo || $route.query.custIntrustNo}}</span>
              </el-tooltip>
              <span class="cust" v-else>{{createItem.custIntrustNo || $route.query.custIntrustNo}}</span>
              <!-- 客户委托号都可以修改，除了协同单不能修改 -->
              <i class="el-icon-edit" @click="handleCustNoUpdaShow" v-if="!['jointList','whJointList'].includes($route.query.source)"></i>
            </span>
          </div>
        </div>
        <div class="flex nowrap">
          <div class="item per25" v-if="$route.query.jointNo">
            <span class="item-label">协同单号:<div class="img-white-box">
              <img v-if="['Y', 'y'].includes(createItem.isWhiteCust)" :src="require(`@/views/order/order/images/white-new.png`)" class="img-white" />
            </div>{{$route.query.jointNo}}</span>
          </div>
          <div class="item" :class="$route.query.jointNo ? 'per40' : 'per25'">
            <span class="item-label">服务类型:{{serviceTypeFilter()}}</span>
          </div>
          <div class="item" v-if="['st01','st02','st15','st16','st17','st09'].includes(createItem.serviceType)" :class="$route.query.jointNo ? 'per28' : 'per65'">
            <el-tooltip v-if="getTextSize('12px',createItem.soStr)>=107" effect="dark" :content="createItem.soStr" placement="top-start">
              <span>SO号:{{createItem.soStr}}</span>
            </el-tooltip>
            <span class="item-label" v-else>SO号:{{createItem.soStr}}</span>
          </div>
        </div>
      </div>
      <slot/>
    </div>
    <div class="soNum">
      <div class="item-label" @click="handleToogleServiceType" :class="viewState ? 'readOnly' : ''">
        <em class="required">*</em>服务项:
        <span v-for="(item, index) in checkedServiceNames" :key="item.serviceCode">{{index ? `+${item.serviceName}` : `${item.serviceName}`}}</span>
      </div>
    </div>
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
import { mapState } from 'vuex'
import { getDictLabel,getTextSize } from '@/utils/tools'
import { baseBusinessList, baseBusinessServiceList } from '@/api/base'
import { mainCustUpdate, mainCustIntrustEdit, custChangeApply } from '@/api/order/list'
import DraftCustUpdate from './custUpdatePop'
import CustUpdate from './custUpdatePop2'
import CustNo from './custNoUpdatePop'
import ServiceCheckbox from './serviceCheckbox'
import clip from '@/utils/clipboard'
export default {
  filters: {
    businessTypeFilter(businessType) {
      return getDictLabel('shipBusinessType', businessType)
    },
    cargoSourceFilter(cargoSource) {
      return getDictLabel('cargoSource', cargoSource)
    }
  },
  data() {
    return {
      oQuery: this.$route.query,
      // 是否包含驳船
      yesOrNoOptions: {
        'y': '是',
        'n': '否'
      },
      serviceTypeListShow: false, // 服务项默认隐藏
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
      dictMap: state => state.dict.dictMap,
      ordDetRole: state => state.order.orderList.ordDetRole
    }),
    isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op' || this.isDoc
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'asst'
		},
    isOpCustoms() {
			return this.ordDetRole === 'op_truck'
		},
    checkedServiceNames() {
      let result = this.serviceCodeOptions.filter(item => {
        return this.createItem.serviceList.includes(item.serviceCode) && item.isDisplay !== 'n'
      })
      return result
    },
    viewState() {
      let isView = true
      let {source} = this.$route.query
      // bd 建单可编辑
      if (this.isBd && ['draft', 'refuse'].includes(this.orderStatus)) {
        isView = false
      }
      // op 审核通过，已终止且未关账的可以编辑
      if (this.isOp) {
        // 放开已关账、已完成的限制
        // this.orderStatus === 'pass' || this.orderStatus === 'break' && this.createItem.finCloseStatus !== 'yes'
        if (this.orderStatus === 'pass' || this.orderStatus === 'break'){
          isView = false
        }
      }
      // 文件审核通过可以编辑
      if (this.isDoc && this.orderStatus === 'pass') {
        isView = false
      }
      // 协同单详情服务项都不可编辑（包括进口）
      // if (source === 'jointList' && ['ship_import_fcl', 'ship_import_lcl'].includes(this.createItem.businessType)) {
      //   isView = false
      // }
      if (source === 'jointList') {
        isView = true
      }
      if (['ship_customs','ship_export_customs','ship_import_customs'].includes(this.createItem.businessType)) {
        // 报关单
        // 放开已关账、已完成的限制
        // this.isOpCustoms && (this.orderStatus === 'pass' || this.orderStatus === 'break') && this.createItem.finCloseStatus !== 'yes'
        if(this.isOpCustoms && (this.orderStatus === 'pass' || this.orderStatus === 'break')){
          isView = false
        }
      }
      return isView
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
    },
    // 散杂滚装
    isBulkRo() {
      return this.createItem.businessType === 'ship_bulk_ro'
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
          this.createItem.custIntrustNo = value.custIntrustNo
          // this.$emit('updateCust')
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
		// 切换是否包含驳船
		hadnleChangeIncludeFeeder(val) {
			this.$emit('change', val)
		},
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
    height: 48px;
    margin: 8px 0 0 8px;
		.orderNo {
      width: 67%;
      float: left;
      display: inline-block;
			.item {
        height: 20px;
        line-height: 20px;
				overflow: hidden;
        white-space: nowrap;
        margin-bottom: 4px;
        float: left;
        display: inline-block;
        padding-right: 8px;
        text-overflow: ellipsis;
        .icon-orderNo{
          float: left;
          padding-top: 2px;
        }
        // margin-right: 10px;
				.mr10 {
					margin-right: 10px;
        }
        &.w250{
          width: 250px;
        }
        &.w180{
          width: 180px;
        }
        &.w310{
          width: 310px;
        }
        &.w470{
          width: 470px;
        }
        &.per61{
          width: 61%;
        }
        &.per65{
          width: 65%;
        }
        &.per42 {
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
				.item-label {
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
					&.bold {
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
            .required{
              font-style: normal;
              color: #e63923;
            }
          }
        }
			}
    }
		.operateBtn-group {
			margin: 0;
			max-width: 33%;
      text-align: right;
      float: right;
      display: inline-block;
      padding-right: 5px;
			.btn-groups {
				height: 20px;
				// overflow: hidden;
				white-space: nowrap;
				.el-button-group {
					.el-button--mini {
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
			.status {
        line-height: 20px;
        margin-top: 4px;
				span {
					line-height: 20px;
					&.value {
						font-size: 12px;
						color: #f4c92f;
            margin-left: 10px;
            i{
              display: inline-block;
              width: 14px;
              height: 14px;
              border-radius: 50%;
              line-height: 14px;
              background: url(../../../../../assets/icon_bkgStatus.png) center center no-repeat;
              background-color: #4a4a4a;
              margin-right: 5px;
              vertical-align: sub;
            }
            .img-cust{
              width: 14px;
              height: 14px;
              display: inline-block;
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
        max-width: 48%;
      }
      .operateBtn-group {
        max-width: 52%;
      }
    }
	}
	.soNum {
    width: 67%;
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
      .required{
        font-style: normal;
        color: #e63923;
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
</style>
