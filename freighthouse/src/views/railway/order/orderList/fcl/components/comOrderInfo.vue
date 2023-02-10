<template>
  <div class="order-info fcl-order-info">
    <div class="cont">
      <div class="orderNo">
        <div class="flex">
          <div class="item per25">
            <i class=""></i>
            <span class="item-label bold">工作号：{{$route.query.orderNo}}({{createItem.businessType | businessTypeFilter}})</span>
          </div>
          <div class="item" :class="$route.query.jointNo ? 'per40' : 'per42'">
            <span class="item-label cust-item">
              <!-- 文字溢出才加tip -->
              <entrustUnitComp :showEdit="isBd && custNameIsEdit" @handleCustUpdaShow="handleCustUpdaShow">
              </entrustUnitComp>
              <!-- <el-tooltip v-if="getTextSize('12px',($route.query.custid || createItem.custid)+(createItem.custName ? `(${createItem.custName})` : ''))>=107" effect="dark" :content="($route.query.custid || createItem.custid)+(createItem.custName ? `(${createItem.custName})` : '')" placement="top-start">
                <span class="cust">{{$route.query.custid || createItem.custid}}{{createItem.custName ? `(${createItem.custName})` : ''}}</span>
              </el-tooltip>
              <span class="cust" v-else>{{$route.query.custid || createItem.custid}}{{createItem.custName ? `(${createItem.custName})` : ''}}</span> -->
              <!-- 只有bd,obd才可以修改crm里为草稿状态的委托单位 -->
              <!-- <i class="el-icon-edit" @click="handleCustUpdaShow" v-if="isBd && createItem.main.isDraftCust === 'Y' && ['draft','submit','pass','refuse'].includes(orderStatus)"></i> -->
            </span>
          </div>
          <div class="item per28">
            <span class="item-label cust-item">客户委托号:
              <el-tooltip v-if="getTextSize('12px',createItem.custIntrustNo || $route.query.custIntrustNo)>=73" effect="dark" :content="createItem.custIntrustNo || $route.query.custIntrustNo" placement="top-start">
                <span class="cust">{{createItem.custIntrustNo || $route.query.custIntrustNo}}</span>
              </el-tooltip>
              <span class="cust" v-else>{{createItem.custIntrustNo || $route.query.custIntrustNo}}</span>
              <!-- 客户委托号都可以修改，除了协同单不能修改 -->
              <i class="el-icon-edit" @click="handleCustNoUpdaShow" v-if="$route.query.source !== 'jointList'"></i>
            </span>
          </div>
        </div>
        <div class="flex nowrap">
          <div class="item per25">
            <span class="item-label">服务类型: {{serviceTypeFilter()}}</span>
          </div>
         
          <div class="item service per65">
            <div class="item-label" @click="handleToogleServiceType" :class="viewState ? 'readOnly' : ''">
              <em class="required">*</em>服务项：
              <span v-for="(item, index) in checkedServiceNames" :key="item.serviceCode">{{index ? `+${item.serviceName}` : `${item.serviceName}`}}</span>
            </div>
          </div>
        </div>
      </div>
      <slot/>
    </div>
    <ServiceCheckbox 
      v-show="serviceTypeListShow"
      :createItem="createItem"
      :orderStatus="createItem.orderStatus"
      :serviceCodeOptions="serviceCodeOptions"
      @updServiceList="updateServciceList"
    />
    <!-- <div class="serviceTypeList-container" v-show="serviceTypeListShow">
      <el-checkbox-group size="mini" v-model="createItem.serviceList" @change="handleCheckedServiceTypes">
        <el-checkbox
          size="mini"
          class=""
          v-for="item in serviceCodeOptions"
          :key="item.serviceCode" 
          :disabled="item.disabled"
          :label="item.serviceCode"
          @change="(val) => handleChangeChecked(val, item)">
          {{item.serviceName}}
        </el-checkbox>
      </el-checkbox-group>
    </div> -->
    <div v-if="custUpdateShow">
      <DraftCustUpdate :custParam="createItem.main" @close="custUpdateClose" v-if="createItem.main.isDraftCust === 'Y' || createItem.orderStatus === 'draft'"></DraftCustUpdate>
      <CustUpdate :custParam="createItem.main" @close="custUpdateClose" v-else></CustUpdate>
    </div>
    <div v-if="custNoUpdateShow">
      <CustNo :custNoParam="createItem.main" @close="custNoUpdateClose"></CustNo>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import {getDictLabel, getTextSize} from '@/utils/tools'
import {baseBusinessList, baseBusinessServiceList} from '@/api/base'
import {getBookSoList} from '@/api/order/book/list'
import { mainCustUpdate, mainCustIntrustEdit, custChangeApply } from '@/api/order/list'
import DraftCustUpdate from '../../components/custUpdatePop'
import CustUpdate from '../../components/custUpdatePop2'
import CustNo from '../../components/custNoUpdatePop'
import ServiceCheckbox from '../../components/serviceCheckbox'

export default {
  filters: {
    businessTypeFilter(businessType) {
      return getDictLabel('businessType', businessType)
    },
    cargoSourceFilter(cargoSource) {
      return getDictLabel('cargoSource', cargoSource)
    }
  },
  data() {
    return {
      oQuery: this.$route.query,
      viewState: false,
      isOpServiceState: false,
      // 是否包含驳船
      yesOrNoOptions: {
        'y': '是',
        'n': '否'
      },
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
    this.$nextTick(() => {
      let offsetTop = document.querySelector('.ship-cont').getBoundingClientRect().top
      this.$emit('getHeight', offsetTop)
    })
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      currRole: state => state.user.currRole
    }),
    isAc() {
			return this.currRole === 'ac'
		},
    isDoc() {
			return this.currRole === 'doc'
		},
		isOp() {
			return this.currRole === 'op'
		},
		isBd() {
			return this.currRole === 'bd' || this.currRole === 'obd'
    },
    custNameIsEdit() {
      // 潜在客户可直接修改委托单位
      if (this.createItem.main.isDraftCust === 'Y') {
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
    checkedServiceNames() {
      let result = this.serviceCodeOptions.filter(item => {
        return this.createItem.serviceList.includes(item.serviceCode)
      })
      return result
    }
  },
  watch: {
    serviceTypeListShow(newVal, oldVal) {
      this.$nextTick(() => {
        let shipContOffsetTop = document.querySelector('.ship-cont').getBoundingClientRect().top
        this.$emit('getHeight', shipContOffsetTop)
      })
    },
    orderStatus: {
      handler(newVal) {
        this.viewState = this.createItem.orderStatus === 'submit'
        this.isOpServiceState = this.isOp && !['pass'].includes(this.createItem.orderStatus)
      },
      deep: true,
      immediate: true
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
        let fn = this.createItem.main.isDraftCust === 'Y' || this.createItem.orderStatus === 'draft' ? mainCustUpdate : custChangeApply
        let msg = this.createItem.main.isDraftCust === 'Y' || this.createItem.orderStatus === 'draft' ? '修改委托单位成功' : '申请修改委托单位成功'
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
      this.serviceTypeListShow = !this.serviceTypeListShow
    },
    updateServciceList(values) {
      this.$set(this.createItem, 'serviceList', values)
    },
    // handleCheckedServiceTypes(val) {
    //   console.log(val)
    // },

    // handleChangeChecked(val, item) {
    //   if (!val && item.serviceCode === 'book') {
    //     this.createItem.serviceList.push('book')
    //   }
    //   if (!val && item.serviceCode === 'proxy_book') {
    //     this.createItem.serviceList.push('proxy_book')
    //   }
    //   // 订舱，代订舱选一个
    //   if (val && item.serviceCode === 'proxy_book') {
    //     this.createItem.serviceList = this.createItem.serviceList.filter(item => {
    //       return item !== 'book'
    //     })
    //   }
    //   if (val && item.serviceCode === 'book') {
    //     this.createItem.serviceList = this.createItem.serviceList.filter(item => {
    //       return item !== 'proxy_book'
    //     })
    //   }
    // },

    // // 切换服务类型
    // hadnleChangeServiceType(val){
    //   Object.assign(this.createItem, {
    //     serviceType: val
    //   })
    //   this.getServiceTypes('change')
    // }
  }
};
</script>

<style lang="scss" scoped>
.order-info.fcl-order-info {
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
              background: url(../../../../../../assets/icon_bkgStatus.png) center center no-repeat;
              background-color: #E9E9E9;
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
	.serviceTypeList-container {
		padding-top: 5px;
		border-top: 1px solid #e0e0e0;
		margin: 0 8px;
		line-height: 20px;
		min-height: 20px;
		.el-checkbox__label {
			font-size: 12px;
		}
	}
}
</style>
