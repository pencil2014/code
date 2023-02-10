<template>
	<div id="comOrderInfo" class="order-info">
		<div class="cont">
			<div class="orderNo">
				<div class="flex">
					<div class="item per25">
						<!-- <img class="icon" style="padding-top: 2px; float: left;" :src="require('@/assets/icon-file.png')"/> -->
						<!-- <span class="item-label bold">工作号:{{ $route.query.orderNo }}({{ createItem.main.businessType | businessTypeFilter }})</span> -->
						<el-popover placement="bottom" width="200" trigger="hover" class="port-ename" popper-class="order-unit-popover">
              <div class="port-popover">
                <div>
                  <span>{{$route.query.orderNo}}({{createItem.main.businessType | businessTypeFilter}})</span>
                  <em @click="handleCopyorderNo($route.query.orderNo, $event)">复制工作号</em>
                </div>
              </div>
              <div slot="reference" class="item-label bold">工作号:{{$route.query.orderNo}}({{createItem.main.businessType | businessTypeFilter}})</div>
            </el-popover>
					</div>
					<div class="item" :class="$route.query.jointNo ? 'per40' : 'per42'">
						<span class="item-label cust-item">
							<!-- 文字溢出才加tip -->
							<entrustUnitComp :showEdit="isBd && custNameIsEdit" @handleCustUpdaShow="handleCustUpdaShow">
							</entrustUnitComp>
							<!-- <el-tooltip
								v-if="getTextSize('12px', ($route.query.custid || createItem.main.custid) + (createItem.main.custName ? `(${createItem.main.custName})` : '')) >= 107"
								effect="dark"
								:content="($route.query.custid || createItem.main.custid) + (createItem.main.custName ? `(${createItem.main.custName})` : '')"
								placement="top-start"
							>
								<span class="cust">{{ $route.query.custid || createItem.main.custid }}{{ createItem.main.custName ? `(${createItem.main.custName})` : '' }}</span>
							</el-tooltip>
							<span class="cust" v-else>{{ $route.query.custid || createItem.main.custid }}{{ createItem.main.custName ? `(${createItem.main.custName})` : '' }}</span> -->
							<!-- 只有bd,obd才可以修改crm里为草稿状态的委托单位 -->
							<!-- <i class="el-icon-edit" @click="handleCustUpdaShow" v-if="isBd && createItem.main.isDraftCust === 'Y' && ['draft', 'submit', 'pass', 'refuse'].includes(orderStatus)"></i> -->
							<!-- <template v-if="createItem.main.custLevel">
								<el-tooltip class="item" effect="dark" placement="bottom">
									<span slot="content">客户VIP等级</span>
									<img :src="require(`@/views/crm/merchantManagement/customerList/images/icon-${createItem.main.custLevel.toLowerCase()}.png`)" class="vip-img" />
								</el-tooltip>
							</template> -->
						</span>
					</div>

					<div class="item per28">
						<span class="item-label cust-item"
							>客户委托号:
							<el-tooltip v-if="getTextSize('12px', createItem.main.custIntrustNo || $route.query.custIntrustNo) >= 73" effect="dark" :content="createItem.main.custIntrustNo || $route.query.custIntrustNo" placement="top-start">
								<span class="cust">{{ createItem.main.custIntrustNo || $route.query.custIntrustNo }}</span>
							</el-tooltip>
							<span class="cust" v-else>{{ createItem.main.custIntrustNo || $route.query.custIntrustNo }}</span>
							<!-- 客户委托号都可以修改-->
							<i class="el-icon-edit" @click="handleCustNoUpdaShow"></i>
						</span>
					</div>
				</div>
				<div class="flex nowrap">
					<div v-if="$route.query.source === 'jointList'" class="item per25">
						<span class="item-label">协同单号:	<div class="img-white-box">
              <img v-if="['Y', 'y'].includes(createItem.main.isWhiteCust)" :src="require(`@/views/order/order/images/white-new.png`)" class="img-white" />
            </div>{{ $route.query.jointNo }}</span>
					</div>
					<div class="item per25">
						<span class="item-label">服务类型:{{ serviceTypeFilter() }}</span>
					</div>
				</div>
			</div>
			<slot />
		</div>
		<div class="soNum">
			<div class="item-label" @click="handleToogleServiceType" :class="isEpricing || isEcs || viewState ? 'readOnly' : ''">
				<em class="required">*</em>服务项:
				<span v-for="(item, index) in checkedServiceNames" :key="item.serviceCode">{{ index ? `+${item.serviceName}` : `${item.serviceName}` }}</span>
			</div>
		</div>
		<ServiceCheckbox 
      v-show="serviceTypeListShow"
      :createItem="createItem"
      :orderStatus="createItem.orderStatus"
      :serviceCodeOptions="serviceCodeOptions"
      @updServiceList="updateServciceList"
    />
		<!-- <div class="serviceTypeList-container-railway" v-show="serviceTypeListShow">
			<el-checkbox-group size="mini" v-model="createItem.serviceList" @change="handleCheckedServiceTypes">
				<el-checkbox size="mini" class="" v-for="item in serviceCodeOptions" :key="item.serviceCode" :disabled="item.disabled" :label="item.serviceCode" @change="val => handleChangeChecked(val, item)">
					{{ item.serviceName }}
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
import { mapState } from 'vuex'
import { getDictLabel, getTextSize } from '@/utils/tools'
import { mainCustUpdate, mainCustIntrustEdit } from '@/api/railway/list'
import { custChangeApply } from '@/api/order/list'
import DraftCustUpdate from './custUpdatePop'
import CustUpdate from './custUpdatePop2'
import CustNo from './custNoUpdatePop'
import ServiceCheckbox from './serviceCheckbox'
import clip from '@/utils/clipboard'
export default {
	filters: {
		businessTypeFilter(businessType) {
			return getDictLabel('businessType', businessType)
		}
	},
	data() {
		return {
			oQuery: this.$route.query,
			serviceTypeListShow: false, // 服务项默认隐藏
			getTextSize: getTextSize,
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
			default: () => []
		},
		serviceCodeOptions: {
			type: Array,
			default: () => []
		}
	},
	activated() {
		if (!this.$route.meta.isUseCache) {
			this.serviceTypeListShow = false
		}
	},
	created() {
		this.serviceTypeListShow = false
	},
	mounted() {
		this.$nextTick(() => {
			let offsetTop = document.querySelector('.ship-cont').getBoundingClientRect().top
			this.$emit('getHeight', offsetTop)
		})
	},

	computed: {
		...mapState('railway', ['ordDetRole']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			roles: state => state.user.roles
		}),
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		isAc() {
			return this.ordDetRole === 'ac'
		},

		isOp() {
			return this.ordDetRole === 'op'
		},
		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isBd() {
			return this.ordDetRole === 'bd'
		},
		isPricing() {
			return this.ordDetRole === 'pricing'
		},

		checkedServiceNames() {
			let result = this.serviceCodeOptions.filter(item => {
				item.serviceName = item.serviceName.replace(/目的港/g, '目的站')
				return this.createItem.serviceList.includes(item.serviceCode)
			})
			return result
		},

		viewState() {
			let isView = true
			if (!this.ordDetRole) {
				isView = true
			}
			if (this.$route.query.action === 'view') {
				isView = true
			}
			if (this.isBd && ['draft', 'refuse'].includes(this.orderStatus)) {
				isView = false
			}
			if (this.isBkg && ['pass'].includes(this.orderStatus)) {
				isView = false
			}
			// 放开已关账、已完成的限制
      // this.isBkg && ['break'].includes(this.orderStatus) && this.createItem.main.finCloseStatus !== 'yes'
			if (this.isBkg && ['break'].includes(this.orderStatus)) {
				isView = false
			}
			// if (this.isAc) {
			// 	isView = true
			// }
			return isView
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
    }
		// isBkgServiceState() {
		// 	return this.isBkg && !['pass'].includes(this.orderStatus)
		// }
	},
	watch: {
		serviceTypeListShow(newVal, oldVal) {
			this.$nextTick(() => {
				let shipContOffsetTop = document.querySelector('.ship-cont').getBoundingClientRect().top
				this.$emit('getHeight', shipContOffsetTop)
			})
		}
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
				let fn = this.createItem.main.isDraftCust === 'Y' || this.createItem.orderStatus === 'draft' ? mainCustUpdate : custChangeApply
        let msg = this.createItem.main.isDraftCust === 'Y' || this.createItem.orderStatus === 'draft' ? '修改委托单位成功' : '申请修改委托单位成功'
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
					.then(res => {
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
			let findItem = this.serviceTypeOptions.find(item => item.serviceType === this.createItem.main.serviceType)
			return findItem ? findItem.name : ''
		},
		// 切换服务项列表隐藏显示
		handleToogleServiceType() {
			if (this.isEpricing || this.isEcs || this.viewState) return
			this.serviceTypeListShow = !this.serviceTypeListShow
		},
		updateServciceList(values) {
      this.$set(this.createItem, 'serviceList', values)
    },
		// handleCheckedServiceTypes(val) {},

		// handleChangeChecked(val, item) {
		// 	if (!val && item.serviceCode === 'book') {
		// 		this.createItem.serviceList.push('book')
		// 	}
		// 	if (!val && item.serviceCode === 'proxy_book') {
		// 		this.createItem.serviceList.push('proxy_book')
		// 	}
		// 	// 订舱，代订舱选一个
		// 	if (val && item.serviceCode === 'proxy_book') {
		// 		this.createItem.serviceList = this.createItem.serviceList.filter(item => {
		// 			return item !== 'book'
		// 		})
		// 	}
		// 	if (val && item.serviceCode === 'book') {
		// 		this.createItem.serviceList = this.createItem.serviceList.filter(item => {
		// 			return item !== 'proxy_book'
		// 		})
		// 	}
		// }
	}
}
</script>

<style lang="scss" scoped>
.order-info {
	background-color: #fff;
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
				&.w250 {
					width: 250px;
				}
				&.w180 {
					width: 180px;
				}
				&.w310 {
					width: 310px;
				}
				&.w470 {
					width: 470px;
				}
				&.per61 {
					width: 61%;
				}
				&.per65 {
					width: 65%;
				}
				&.per42 {
					width: 42%;
				}
				&.per40 {
					width: 40%;
				}
				&.per39 {
					width: 39%;
				}
				&.per37 {
					width: 37%;
				}
				&.per35 {
					width: 35%;
				}
				&.per25 {
					width: 25%;
				}
				&.per33 {
					width: 33%;
				}
				&.per28 {
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
					&.cust-item {
						padding-right: 10px;
						display: flex;
					}
					&.bold {
						font-weight: bold;
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
						.required {
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
						color: #f4c92f;
						margin-left: 10px;
						i {
							display: inline-block;
							width: 14px;
							height: 14px;
							border-radius: 50%;
							line-height: 14px;
							background: url(../../../../../assets/icon_bkgStatus.png) center center no-repeat;
							background-color: #e9e9e9;
							margin-right: 5px;
							vertical-align: sub;
						}
					}
					&.red {
						color: #cd4130;
						i {
							background-color: #cd4130;
						}
					}
					&.yellow {
						color: #edb534;
						i {
							background-color: #edb534;
						}
					}
					&.green {
						color: #33b18a;
						i {
							background-color: #33b18a;
						}
					}
					&.black {
						color: #4a4a4a;
						i {
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
			.required {
				font-style: normal;
				color: #e63923;
			}
		}
	}
	.serviceTypeList-container-railway {
		padding-top: 5px;
		border-top: 1px solid #e0e0e0;
		margin: 0 8px;
		line-height: 20px;
		min-height: 20px;
		/deep/ .el-checkbox__label {
			font-size: 12px !important;
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
</style>
