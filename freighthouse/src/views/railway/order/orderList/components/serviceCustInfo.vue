<template>
	<div class="service-cust">
		<div class="component-info">
			<span class="small-tit">工作号： {{ orderInfo.main && orderInfo.main.orderNo }}</span>
			<span class="ml10" style="display: inline-block">
				<entrustUnitComp />
			</span>
			<span class="ml10">客户委托号： {{ orderInfo.main && orderInfo.main.custIntrustNo }}</span>
			<div class="rail-flr">
				<!-- <span class="mr10" v-if="this.$route.name === 'OrderBook'">订舱状态：{{ orderInfo.bkgStatus | bkgStatusFilter }}</span> -->
				<span v-if="$route.name != 'LclWhBook'"><el-button @click="handleJointRefuse" type="default" size="mini" style="margin-left: 10px; margin-right:10px" v-if="isJoint && !isCancelApply">协同拒绝</el-button></span>
				<span class="progress">
					<span>服务项进度：</span>
					<el-select @change="handleChangeProgress" v-model="progressValue" placeholder="进度" size="mini" style="width: 100px" :disabled="!(isBkg||isPricing)">
						<el-option v-for="(item, index) in serviceStatusOptions" :label="item.label" :value="item.value" :key="index"></el-option>
					</el-select>
				</span>
				<!-- <el-button @click="handleAddException" type="default" size="mini" style="margin-left: 10px;">异常单新增</el-button> -->
				<!-- <el-button @click="handleGoback" type="default" size="mini">返回</el-button> -->
			</div>
			<workBtn />
		</div>
		<div class="joint-info" style="margin-top: 8px" v-if="isJoint && !serviceCodeArr.includes(serviceCode)">
			<span>协同发起人：{{ jointInfo.createdName }}</span>
			<span class="ml10">协同发起时间：{{ jointInfo.createdTime }}</span>
			<span class="ml10">
				协同备注：
				<el-tooltip popper-class="item" effect="dark" :content="jointInfo.remark" placement="bottom">
					<span>{{ jointInfo.remark }}</span>
				</el-tooltip>
			</span>
		</div>
		<div v-if="isJoint && serviceCodeArr.includes(serviceCode)" class="joint-remark-cont">
			<div class="joint-remark-row">
				<span class="tit">协同备注信息</span>
				<div class="operate">
					<span>协同发起人：{{ jointInfo.createdName }}</span>
					<span class="ml10">协同发起时间：{{ jointInfo.createdTime }}</span>
					<span class="expand ml10" @click="handleToogleExpand"> {{ remarkShow ? '收起' : '展开' }}<i :class="remarkShow ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
				</div>
			</div>
			<div class="remark-row" v-if="remarkShow">协同备注：{{ jointInfo.remark }}</div>
		</div>
		<!-- 拒绝弹窗 -->
		<div v-if="refusePopShow">
			<RefuseJoint :serviceCode="serviceCode" @close="refuseJointPopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel, getRailServiceCode } from '@/utils/tools'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { workServiceUpdateStatus } from '@/api/base'
import workBtn from '@/views/order/order/orderList/components/workBtn.vue'
import RefuseJoint from './refuseJoint'
export default {
	mixins: [routerMixin],
	filters: {
		bkgStatusFilter(status) {
			return getDictLabel('bkgStatus', status)
		}
	},
	data() {
		return {
			// serviceCode: '',
			progressValue: '',
			isCancelApply: false, // 服务项协同申请取消
			refusePopShow: false, // 拒绝弹窗
			jointInfo: {
				createdName: '',
				createdTime: '',
				remark: ''
			},
			remarkShow: true, // 备注默认展开
			serviceCodeArr: ['truck', 'pol_declaration', 'pol_warehouse'] //  需要显示协同备注的拖报仓储
		}
	},
	props: {
		orderInfo: {
			type: Object,
			default: () => ({})
		},
		serviceCode: {
			type: String,
			default: ''
		}
	},
	activated() {},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.railway.ordDetRole,
			roles: state => state.user.roles
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isPricing() {
			return this.ordDetRole === 'pricing'
		},
		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		// bd,obd角色
		isBd() {
			return !this.roles.includes('pricing') && (this.roles.includes('bd') || this.roles.includes('obd') || this.roles.includes('asst'))
		},
		// 是否协同单
		isJoint() {
			let { source, jointNo } = this.$route.query
			// 从协同订单列表和计划单列表进入的都要显示协同备注
			return source === 'jointList' || (source === 'planOrderList' && jointNo)
		},
		// 服务项进度下拉数据
		serviceStatusOptions() {
			let result = this.dictMap.serviceStatus.filter(item => !['cancel', 'refuse'].includes(item.value))
			return result
		}
	},
	components: {
		RefuseJoint,
		workBtn
	},
	watch: {
		orderInfo: {
			handler(newVal) {
				this.orderInfo = newVal
				this.init()
			},
			deep: true
		},
		serviceCode(newVal) {
			if (newVal) {
				this.init()
			}
		}
	},
	methods: {
		handleToogleExpand() {
			this.remarkShow = !this.remarkShow
		},
		init() {
			let { serviceList } = this.orderInfo
			if (!this.serviceCode) this.serviceCode = getRailServiceCode(this.$route.name, serviceList)
			this.handleGetServiceStatus(this.serviceCode)
			this.handleIsCancelApply(this.serviceCode)
			this.handleGetJointInfo(this.serviceCode)
		},
		// 获取协同服务项的发起人，发起时间，备注等
		handleGetJointInfo(code) {
			let { serviceInfoList } = this.orderInfo
			let serviceInfo = serviceInfoList.find(item => item.serviceCode === code)
			console.log('serviceInfo', serviceInfo)
			if (serviceInfo) {
				this.jointInfo = {
					createdName: serviceInfo.createdName,
					createdTime: serviceInfo.createdTime,
					remark: serviceInfo.remark
				}
			}
			this.isCancelApply = serviceInfo && serviceInfo.cancelApplyStatus === 'applied' ? true : false
		},
		// 获取服务项的状态
		handleGetServiceStatus(code) {
			let { serviceInfoList } = this.orderInfo
			let sItem = serviceInfoList.find(item => item.serviceCode === code)
			this.progressValue = sItem ? sItem.serviceStatus : ''
			if (this.$listeners.getServiceStatus) {
				this.$emit('getServiceStatus', this.progressValue)
			}
		},
		// 获取协同服务项取消申请状态
		handleIsCancelApply(code) {
			let { serviceInfoList } = this.orderInfo
			let serviceInfo = serviceInfoList.find(item => item.serviceCode === code)
			this.isCancelApply = serviceInfo && serviceInfo.cancelApplyStatus === 'applied' ? true : false
		},
		// 协同单拒绝
		handleJointRefuse() {
			this.refusePopShow = true
		},
		// 协同拒绝关闭回调
		refuseJointPopClose(action, value) {
			this.refusePopShow = false
			if (action === 'Confirm') {
				// this.setJointService()
				this.$emit('routerPush', {
					name: 'RailwayOrderDetail',
					query: this.$route.query
				})
			}
		},
		// 修改进度
		handleChangeProgress(value) {
			let data = {
				jointNo: this.$route.query.jointNo,
				orderNo: this.$route.query.orderNo,
				serviceCode: this.serviceCode,
				serviceStatus: value
			}
			workServiceUpdateStatus(data)
				.then(res => {
					this.$message({
						message: '进度修改成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							this.$emit('info')
						}
					})
				})
				.catch(err => {
					this.$emit('info')
				})
		},
		// 异常单新增
		handleAddException() {
			let { businessType, serviceType, orderNo } = this.orderInfo
			// this.isClickInfo = true
			// this.isJumpRouteFromPage = true
			// this.routerPush('WorkExceptionDetail', {
			//   source: 'serviceCode',
			//   orderNo,
			//   businessType,
			//   serviceType,
			//   serviceCode: this.serviceCode
			// })
			// this.$router.push({
			//   name: 'WorkExceptionDetail',
			//   query: {
			//     source: 'serviceCode',
			//     orderNo,
			//     businessType,
			//     serviceType,
			//     serviceCode: this.serviceCode
			//   }
			//   // path: `/order/workExceptionDetail?source=serviceCode&orderNo=${orderNo}&businessType=${businessType}&serviceType=${serviceType}&serviceCode=${this.serviceCode}`
			// })
			this.$emit('routerPush', {
				name: 'WorkExceptionDetail',
				query: {
					source: 'serviceCode',
					orderNo,
					businessType,
					serviceType,
					serviceCode: this.serviceCode
				}
			})
		},
		// 返回
		handleGoback() {
			let path = 'RailwayOrderList'
			this.$router.push({
				name: path.slice(0, 1).toUpperCase() + path.slice(1, path.length)
			})
		}
	}
}
</script>
<style lang="scss">
.rail-flr {
	position: absolute;
	right: 100px;
	margin-top: -20px;
	&.btnGroup {
		margin-top: -20px;
	}
}
.service-cust .joint-info {
	height: 32px;
	padding: 8px 15px;
	background-color: #fff;
	-webkit-box-shadow: 0px 4px 10px 0px #e9e9e9;
	box-shadow: 0px 4px 10px 0px #e9e9e9;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}
.service-cust .component-info {
	overflow: initial !important;
	position: relative;
}
.service-cust .joint-remark-cont {
	background-color: #fff;
	margin-top: 8px;
	.joint-remark-row {
		display: flex;
		justify-content: space-between;
		height: 28px;
		line-height: 20px;
		padding: 4px 20px;
		border-bottom: 1px solid #e6ebf5;
		.tit {
			display: block;
			font-weight: bold;
			font-size: 12px;
		}
		.operate {
			.expand {
				cursor: pointer;
			}
		}
	}
	.remark-row {
		line-height: 16px;
		// max-height: 48px;
		padding: 8px 20px;
		overflow-y: auto;
		word-break: break-all;
	}
}
.el-tooltip__popper.item {
	width: 700px;
}
</style>
