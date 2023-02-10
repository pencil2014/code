<template>
	<div class="service-cust">
		<div class="component-info">
			<span class="small-tit">工作号： {{ orderInfo.orderNo }}</span>
			<span class="ml10" style="display: inline-block">
				<entrustUnitComp />
			</span>
			<span class="ml10">客户委托号： {{ orderInfo.custIntrustNo }}</span>
			<div class="flr">
				<span class="mr10" v-if="this.$route.name === 'OrderBook'">订舱状态：{{ orderInfo.bkgStatus | bkgStatusFilter }}</span>
				<span v-if="$route.name !== 'AirTransportOrderBook'">
					<el-button @click="handleJointRefuse" type="default" size="mini" style="margin-left: 10px; margin-right:10px" v-if="isJoint && !isCancelApply && serviceCode !== 'airbook'">协同拒绝</el-button>
				</span>
				<span class="progress">
					<span>服务项进度：</span>
					<el-select @change="handleChangeProgress" v-model="progressValue" placeholder="进度" size="mini" style="width: 100px" :disabled="progressDisabled">
						<el-option v-for="(item, index) in serviceStatusOptions" :label="item.label" :value="item.value" :key="index"></el-option>
					</el-select>
				</span>
				<!-- <el-button @click="handleAddException" type="default" size="mini" style="margin-left: 10px;">异常单新增</el-button> -->
				<!-- <el-button @click="handleGoback" type="default" size="mini">返回</el-button> -->
			</div>
			<workBtn />
		</div>
		<div class="joint-info" style="margin-top: 8px" v-if="isJoint && serviceCode !== 'airbook'">
			<span>协同发起人：{{ jointInfo.createdName }}</span>
			<span class="ml10">协同发起时间：{{ jointInfo.createdTime }}</span>
			<span class="ml10">
				协同备注：
				<el-tooltip popper-class="item" effect="dark" :content="jointInfo.remark" placement="bottom">
					<span>{{ jointInfo.remark }}</span>
				</el-tooltip>
			</span>
		</div>
		<!-- 拒绝弹窗 -->
		<div v-if="refusePopShow">
			<RefuseJoint @close="refuseJointPopClose" />
		</div>
	</div>
</template>
<script>
// import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel, getAirServiceCode } from '@/utils/tools'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { workServiceUpdateStatus } from '@/api/base'
import RefuseJoint from './refuseJoint'
import workBtn from '@/views/order/order/orderList/components/workBtn.vue'
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
			}
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
		},
		serverIsJoint: {
			type: Boolean,
			default: false
		}
	},
	activated() {},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.airTransport.orderList.ordDetRole,
			roles: state => state.user.roles,
			userId: (state) => state.user.userId,
			airOrderInfo: state => state.airTransport.airOrderInfo || {},
		}),
		// 是否协同单
		isJoint() {
			return this.$route.query.source === 'jointList'
		},
		// 服务项进度下拉数据
		serviceStatusOptions() {
			let result = this.dictMap.serviceStatus.filter(item => !['cancel', 'refuse'].includes(item.value))
			return result
		},
		ecsId() {
      let workAssign = []
      if (this.$route.query.source !== 'jointList') {
        workAssign = this.airOrderInfo.workAssign
      } else {
        workAssign = this.airOrderInfo.jointWorkAssign
      }
      let asstItem = workAssign && workAssign.find((el) => el.jobCode === 'ecs')
      if (asstItem && asstItem.employeeId) {
        return asstItem.employeeId
      }
      return ''
    },
		isOp() {
      return this.ordDetRole === 'op'
    },
    isEcs() {
      return this.ordDetRole === 'ecs'
    },
		isCs() {
      return this.ordDetRole === 'cs'
    },
		isImport() {
			return ['air_import'].includes(this.airOrderInfo.businessType)
		},
		progressDisabled(){
			if(['pod_comm_clearance','pod_ltl_delivery','pod_warehouse','pod_change_doc'].includes(this.serviceCode)){
				return !this.isEcs && !this.isOp && (!this.isCs || !this.isImport)
			}else{
				return !this.isOp
			}
		},
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
		init() {
			let { serviceList } = this.orderInfo
			if (!this.serviceCode) this.serviceCode = getAirServiceCode(this.$route.name, serviceList)
			sessionStorage.setItem('serviceCode', this.serviceCode)
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
			this.$emit('getProgressValue', this.progressValue)
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
				let views = this.$store.state.tagsView.visitedViews.filter(item => item.params.orderNo === this.$route.query.orderNo)
				this.$store.commit('tagsView/DEL_SAMEORDER_VISITED_VIEW', views)
				this.$emit('routerPush', {
					name: 'AirTransportOrderDetail',
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
			if (value === 'finish') {
				return this.$confirm('是否将服务项进度修改为已完成?设置完成后，服务项除费用外不可以再维护编辑！', '警告', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						this.handleServiceUpdateStatus(data)
					})
					.catch(action => {
						if (action === 'cancel') {
							this.$emit('getOrderInfo')
						}
					})
			} else {
				this.handleServiceUpdateStatus(data)
			}
		},
		handleServiceUpdateStatus(data) {
			workServiceUpdateStatus(data)
				.then(res => {
					this.$message({
						message: '进度修改成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							this.$emit('getProgressValue', this.progressValue)
							this.$emit('getOrderInfo')
						}
					})
				})
				.catch(err => {
					this.$emit('getOrderInfo')
				})
		},
		// 异常单新增
		handleAddException() {
			let { businessType, serviceType, orderNo } = this.orderInfo
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
			let path = this.$route.query.source || 'orderList'
			this.$router.push({
				path: '/airTransport/order/' + path
			})
		}
	}
}
</script>
<style lang="scss">
.flr {
	position: absolute;
	right: 100px;
	margin-top: -20px;
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
.el-tooltip__popper.item {
	width: 700px;
}
</style>
