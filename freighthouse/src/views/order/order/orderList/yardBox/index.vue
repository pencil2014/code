<template>
	<div class="edit-container order-book yardBox fullWrap" id="yardBox" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
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
					<LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container" id="container" @scroll="handleScroll">
							<ServiceCustInfo :orderInfo="orderInfo" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<div class="order-cont">
								<div class="service-detail-cont">
									<div class="edit-row agent">
										<!-- 报关信息  -->
										<DefaultTableComp ref="defaultTableComp" class="agent-table mt10" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick" id="tableCont">
											<template>
												<span>装箱状态：</span>
												<el-select v-model="yardBoxStatus" @change="changeStatus" placeholder="请选择装箱状态" size="mini" style="width: 120px;" :disabled="isBd || isDisabledEdit">
													<el-option v-for="(item, index) in yardBoxStatusOptions" :label="item.label" :value="item.value" :key="index"></el-option>
												</el-select>
												<!-- <el-button class="ml10" type="default" size="mini" :disabled="isBd"> 输出 </el-button> -->
											</template>
										</DefaultTableComp>
										<!-- 报关详情 -->
										<YardDetail v-if="showDetail" :detailData="detailData" :isDisabledEdit="isDisabledEdit" :saveBarFixed="saveBarFixed" @callBack="detailCallBack" />
										<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="'pol_warehouse'" /> -->
									</div>
								</div>
							</div>
						</div>
						<JointWorkAssign :jointServiceWorkList="jointServiceWorkList" :serviceCode="serviceCode" @callback="jointWorkAssignCallback" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import { handleData } from '../../js/handleData'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { yardBoxList, yardBoxDetail, yardBoxSave, deleteYardBox, updateStatusYardBox, orderInfo, orderJointInfo } from '@/api/order/list'
import { deleteAlert, getDictLabel, getDictMap, getServiceCode } from '@/utils/tools'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import DefaultTableComp from '../../components/defaultTableComp'
import YardDetail from './components/yardDetail'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'

export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			oQuery: this.$route.query,
			tableInfo: {
				title: '堆场信息',
				titleBtnList: [{ label: '新增堆场', key: 'add', type: 'primary' }]
			},
			// 表格配置项
			tableConfig: {
				style: {},
				tableIndex: {
					show: false
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: true,

					// 是否支持列表项选中功能
					mutiSelect: true,

					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ boxId }) {
						return boxId ? true : false
					}
				},
				columns: handleData.yardBoxColumn, //  表格显示的表头
				list: [],
				// 操作按钮组
				operationBtns: {
					width: '120px',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						let fn = this['handle' + action]
						if (typeof fn !== 'function') return
						this['handle' + action](row)
					},
					data: [
						{
							label: '详情',
							type: 'text',
							show: true,
							action: 'Info'
						},
						{
							label: '删除',
							type: 'text',
							show:true,
							disabled: (item, row) => {
								console.log(row)
								if (this.isBd || row.status_cn === '已装箱' || this.isDisabledEdit) {
									return true
								} else {
									return false
								}
							},
							action: 'Delete'
						}
					]
				},

				// 操作提示
				tips: {
					text: '',
					show: false
				},

				// 分页
				pagination: {
					show: false,
					total: 0
				}
			},
			showDetail: false,
			detailData: {},
			yardBoxStatus: '',
			selectedCheckbox: '', // 表格选中列
			yardBoxStatusOptions: getDictMap('yardBoxStatus') || [],
			routeName: 'YardBox',
			activityKey: '',
			serviceCode: 'pol_warehouse',
			saveBarFixed: false
		}
	},
	async created() {
		// await this.getOrderInfo()
		let {params, query} = this.$route
		let orderNo = query.orderNo
		let jointNo = query.jointNo
		let fn = jointNo ? orderJointInfo : orderInfo
		let data = jointNo ? {jointNo} : {orderNo}
		let res = await fn(data)
		this.orderInfo = res.data
		this.setServiceList(res.data.serviceList)
		this.setServiceInfoList(res.data.serviceInfoList)
		this.getInit(this.orderInfo)
		await this.init()
		if (this.jointShow) {
			this.getJointServiceWorkList(this.serviceCode)
		}
	},
	mounted() {
		if (window.history && window.history.pushState) {
			history.pushState(null, null, document.URL);
			window.addEventListener('popstate', this.browserBack, false);
		}
	},
	destroyed(){
  	window.removeEventListener('popstate', this.browserBack, false);
	},
	computed: {
		...mapState({
			finCloseStatusCanEdit: state => state.order.finCloseStatusCanEdit,
		}),
		isBd() {
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'doc' || this.ordDetRole === 'ac' || this.ordDetRole === 'op_truck'
			// console.log('isBd', isBd, this.isJoint)
			return isBd || this.isJoint || this.isFinish
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === this.serviceCode)
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isDisabledEdit(){
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if(this.isFinish){
				return true
				// 放开已关账、已完成的限制
				// ['complete','cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)
			}else if(['cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)){
				return true
			}else{
				return false
			}
		},
	},
	props: {},
	components: {
		CancelApplyAlert,
		CancelAlert,
		RefuseAlert,
		TopNav,
		LeftNav,
		ServiceCustInfo,
		DefaultTableComp,
		YardDetail,
		JointWorkAssign,
		// OneServiceFee
	},
	watch: {
		isBd(newVal, oldVal) {
			this.tableConfig.operationBtns.data[1].disabled = false
			if(newVal) {
				this.tableInfo.titleBtnList[0].hide = true
				this.tableConfig.operationBtns.data[1].disabled = true
			}
		}
	},
	methods: {
		...mapMutations('order', ['setServiceList', 'setServiceInfoList']),
		handleScroll() {
			// let saveBarDom = document.querySelector("#saveBar")
			let contDom = document.querySelector("#container")
			let tableCont = document.querySelector("#tableCont")
			let scrollTop  = contDom.scrollTop
			let tableContHeight = tableCont.offsetHeight
			if (scrollTop > tableContHeight +36 +8) {	// table高度和custInfo组件的高度
				this.saveBarFixed = true
			} else {
				this.saveBarFixed = false
			}
		},
		// 获取so列表
		init() {
			this.getList()
			this.tableConfig.operationBtns.data.map(item => {
				item.action === 'Delete' && Object.assign(item, {
					disabled: this.isBd ? true : false
				})
			})
			this.tableInfo.titleBtnList.map(item => {
				Object.assign(item, {
					hide: this.isBd ? true : false
				})
			})
		},
		getList() {
			this.lsLoading = true
			let data = { orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }
			yardBoxList(data).then(res => {
				res.data.map(item => {
					Object.assign(item, item.chargeEmployee, { status_cn: getDictLabel('yardBoxStatus', item.status) })
				})
				this.tableConfig.list = [...res.data]
			}).finally(() => {
				this.lsLoading = false
			})
		},
		// 修改堆场信息状态
		changeStatus(value) {
			if (this.$refs.defaultTableComp.selectedCheckbox.length > 0) {
				this.$confirm('是否确认修改状态?', '警告', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						let boxIds = this.$refs.defaultTableComp.selectedCheckbox.map(res => res.boxId)
						return updateStatusYardBox({
							boxIds: boxIds,
							status: value,
							orderNo: this.oQuery.orderNo,
							jointNo: this.oQuery.jointNo
						})
					})
					.then(response => {
						this.$message({
							type: 'success',
							message: '状态修改成功！',
							duration: 1000,
							onClose: () => {
								this.yardBoxStatus = ''
								this.getList()
							}
						})
					})
					.catch(err => {
						this.yardBoxStatus = ''
					})
			} else {
				this.yardBoxStatus = ''
				this.$message.error('请选择堆场信息！')
			}
		},
		// 堆场详情
		handleInfo(data) {
			yardBoxDetail({ boxId: data.boxId, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.detailData = res.data
				this.showDetail = true
			})
		},
		// 堆场删除
		handleDelete(data) {
			deleteAlert(this, deleteYardBox, { boxId: data.boxId, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }, this.deleteCallback)
		},
		// 删除回调
		deleteCallback() {
			this.showDetail = false
			this.getList()
		},
		// table 回调函数 新增委托、委托完成
		tableClick(type) {
			if (type == 'add') {
				this.detailData = {}
				this.showDetail = true
			}
		},

		// 堆场信息详情回调函数
		detailCallBack(data) {
			if (data.type == 'cancel') {
				this.showDetail = false
			} else if (data.type == 'save') {
				this.handleSave(data)
			}
		},

		validate() {},

		// 保存
		handleSave(data) {
			if (data.type == 'save') {
				data.jointNo = this.oQuery.jointNo
				data.orderNo = this.oQuery.orderNo
				yardBoxSave(data).then(res => {
					this.showDetail = false
					this.getList()
					this.$message({
						type: 'success',
						message: '保存成功',
						onClose: () => {}
					})
				})
			} else {
				this.showDetail = false
			}
		},
		// 新增异常单
		handleAddException() {
			this.$router.push({
				path: 'workExceptionDetail?orderNo=' + this.oQuery.orderNo + '&businessType=' + this.oQuery.businessType
			})
		},
		jointWorkAssignCallback() {
			this.getJointServiceWorkList(this.serviceCode)
		}
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
.yardBox {
	.small-tit .icon {
		vertical-align: text-top;
		margin-right: 5px;
		width: 14px;
	}
	.agent {
		margin-top: 0;
		// padding-top: 15px;
	}
	.agent{
		.tips-abs{
			top: -34px;
		}
	}
}
</style>
