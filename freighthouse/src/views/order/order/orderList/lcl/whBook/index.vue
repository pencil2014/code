<template>
	<div class="edit-container order-book fullWrap" id="lclWhBook" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="order-container">
			<!-- 协同撤回申请提示 -->
			<CancelApplyAlert v-if="jointShow && isCancelApply && serviceCode !== 'book'" :serviceInfo="serviceInfo" :serviceList="orderInfo.serviceList" @callback="getOrderInfo" />
			<!-- 代订舱撤回申请审核 -->
      <ProxyCancelApplyAlert v-if="(isBkg||isOp) && proxyCancelApplyParams.submitCancelStatus === 'APPLIED'" :params="proxyCancelApplyParams" @getInfo="getOrderInfo" />
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 散货操作订单已修改提示 -->
			<EditAlert v-if="jointShow && isEdit" :serviceInfo="serviceInfo" @callback="getOrderInfo" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container">
							<ServiceCustInfo :orderInfo="orderInfo" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<div class="component-cont table-com-layout">
								<el-tabs v-model="labelActivityKey" @tab-click="handleClick" class="">
									<el-tab-pane v-if="isShowBook" label="订舱" :name="'book'" :key="'book'">
										<span slot="label">订舱</span>
									</el-tab-pane>									
									<el-tab-pane v-if="isShowDangerous" label="海事申报" :name="'dangerous'" :key="'dangerous'">
										<span slot="label">海事申报</span>
									</el-tab-pane>
								</el-tabs>
								<el-form v-if="labelActivityKey==='book'" class="lclWhBook-form" ref="lclWhBookSave" :model="createItem" label-width="90px">
									<div class="between h28" :class="bookDetailForm.lcl.lclStatus === 'done' ? 'done' : ''">
										<div class="ft14">
											<!-- 订舱 -->
											<span v-show="bookDetailForm.lcl.lclStatus === 'done'" :class="bookDetailForm.lcl.lclStatus === 'done' ? 'doneFont' : ''">
												<template v-if="bookDetailForm.lcl.fclOrderNo">
													(成功拼箱 , 拼箱后的整柜单号: <span @click="toDetail(bookDetailForm.lcl.fclOrderNo)" class="fcl-order-no">{{ bookDetailForm.lcl.fclOrderNo }}</span
													>)
												</template>
												<template v-else>
													(成功拼箱)
												</template>
											</span>
										</div>
										<div>
											<template v-if="bookDetailForm.lcl.lclStatus !== 'done'">
												<el-button size="mini" type="default" class="ml10" @click="handleWhbookLclConfirm" v-if="hasJointNo && isOp">拼箱完成</el-button>
											</template>
											<template>
												<el-button size="mini" @click="handleCommand" class="ml10">输出托书</el-button>
												<el-button size="mini" type="default" class="ml10" @click="handleWhbookPoConfirm" v-if="!hasJointNo && bookDetailForm.lcl.isPoInCheck != 'y' && isOp">入舱单已核对</el-button>
												<el-button size="mini" type="default" class="ml10" @click="handleWhbookPoRelease" v-if="!hasJointNo && bookDetailForm.lcl.isPoRelease != 'y' && isOp">已放入舱单</el-button>
												<el-button size="mini" type="primary" class="ml10" @click="handleWhbookSave" v-if="isOp">保存</el-button>
											</template>
										</div>
									</div>
									<!-- <div class="si-status">
										<span class="span-label"></span>
									</div> -->
									<el-form-item label="订舱状态" prop="whBookStatus" class="si-status" style="border-top-width:0;padding-top:0">
										<el-radio-group v-model="createItem.whBookStatus">
											<el-radio v-for="(item, index) in whBookStatusOptions" :disabled="index < whBookStatusIndex || bookDetailForm.lcl.lclStatus === 'done' || disabledState" :key="index" :label="item.value">
												{{ item.label }}
											</el-radio>
										</el-radio-group>
									</el-form-item>
									<el-row class="row-form">
										<el-col :span="6">
											<el-form-item label="实际截仓时间" prop="whCyCutOff" :required="['booked', 'wh_in'].includes(createItem.whBookStatus)" :show-message="false">
												<elDatePickerLimit
													size="mini"
													noCanFuture
													v-model="createItem.whCyCutOff"
													type="date"
													style="width: 100%"
													clearable
													placeholder="请选择"
													value-format="yyyy-MM-dd"
													:disabled="disabledState || (bookDetailForm.lcl && bookDetailForm.lcl.whBookStatus === 'booked')"
												/>
											</el-form-item>
										</el-col>
										<el-col :span="6">
											<el-form-item label="入舱单号" prop="whPoNo" :required="['booked', 'wh_in'].includes(createItem.whBookStatus)" :show-message="false">
												<el-input clearable size="mini" placeholder="请输入" v-model="createItem.whPoNo" :disabled="isBd || isDoc || isAc" @blur="validateLength('whPoNo')"></el-input>
											</el-form-item>
										</el-col>
									</el-row>
									<div v-if="bookBaseInfo.info.length > 0">
										<BookInfoView :infoConfig="bookBaseInfo" />
									</div>
									<!-- 货物信息 -->
									<div v-if="goodsInfo.info.length > 0">
										<BookInfoView :infoConfig="goodsInfo" />
									</div>
									<!-- 附件信息 -->
									<FileList
										:fileListData="fileListData"
										:fileTypeOptions="fileTypeOptions"
										:fileType="fileType"
										:fileAddText="'添加附件'"
										:orderStatus="bookDetailForm.orderStatus"
										:source="'whBook'"
										:lclStatus="bookDetailForm.lcl.lclStatus"
										:bookDetailForm="bookDetailForm"
									/>
								</el-form>
								<component v-if="labelActivityKey==='dangerous'" :is="'Dangerous'" :orderInfoData="orderInfo"></component>
							</div>
							<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="serviceCode" /> -->
							<!-- 上传 -->
							<!-- <div v-if="uploadPopShow">
              <FileUpload @close="uploadPopClose" />
            </div>   -->
						</div>
						<JointWorkAssign :jointServiceWorkList="jointServiceWorkList" :serviceCode="serviceCode" @callback="jointWorkAssignCallback" />
					</div>
				</div>
			</div>
		</div>
		<div v-if="exportEntrustedPopShow">
			<exportEntrustedPop :bookDetailForm="bookDetailForm" @close="exportPopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { parseTime } from '@/utils'
import { copyArry, getDictLabel, getServiceCode } from '@/utils/tools'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import CancelApplyAlert from '@/views/order/order/orderList/components/cancelApplyAlert'
import EditAlert from '@/views/order/order/orderList/components/editAlert'
import CancelAlert from '@/views/order/order/orderList/components/cancelAlert'
import RefuseAlert from '@/views/order/order/orderList/components/refuseAlert'
import TopNav from '@/views/order/order/orderList/components/topNav'
import LeftNav from '@/views/order/order/orderList/components/leftNav'
import ServiceCustInfo from '@/views/order/order/orderList/components/serviceCustInfo'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
import BookInfoView from './components/bookInfoView'
import FileList from '../components/fileList'
import { handleData } from '@/views/order/order/js/handleData'
import exportEntrustedPop from '@/views/order/order/bookShip/components/exportEntrustedPop.vue'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import ProxyCancelApplyAlert from '@/views/order/order/bookShip/components/proxyCancelApplyAlert'
import { baseSystemLineInfo } from '@/api/base'
import { orderInfo, orderJointInfo, lclInfo, whBookSave, whBookPoRelease, whBookPoConfirm, whBookLclConfirm, whBookFileList } from '@/api/order/list'
import Dangerous from '../../orderBook/components/dangerous'
const defaultCreateQuery = {
	orderNo: '',
	whCyCutOff: '',
	etWhCyCutOff: '',
	whPoNo: '',
	whBookStatus: ''
}
export default {
	filters: {},
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			labelActivityKey:'book',
			oQuery: this.$route.query,
			routeName: 'LclWhBook',
			activityKey: '',
			serviceCode: '',
			// 订舱状态数组
			// whBookStatus: [
			//   {label: '未订舱', value: 'init'},
			//   {label: '已订舱', value: 'booked'},
			//   {label: '已放PO', value: 'release'},
			//   {label: '已入舱', value: 'finish'},
			// ],
			whBookStatusIndex: 0, // 当前订舱状态在订舱状态数组中的索引值
			// 订单基本信息
			bookBaseInfo: {
				title: '订单基本信息',
				type: 'base',
				info: []
			},
			// 货物信息
			goodsInfo: {
				title: '货物信息',
				showTitle: true,
				type: 'goods',
				info: []
			},
			fileListData: [],
			fileTypeOptions: store.state.dict.dictMap.lclWhFileType,
			// fileTypeOptions: [
			//   {label: 'po文件', value: 'wh_po', disabled: true},
			//   {label: '入舱核实单文件', value: 'wh_check'}
			// ],
			fileType: '',
			createItem: Object.assign({}, defaultCreateQuery),
			bookDetailForm: {
				lcl: {}
			},
			pickerOptions: {
				disabledDate(date) {
					// return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
				}
			},
			orderInfo: {},
			cTimestamp: 0,
			exportEntrustedPopShow: false,
			exportTypeOptions: {
				LONGSAIL_OFFSITE: '长帆供应链订同行',
				REXPRESS_ZH: '云帆智慧托书',
				REXPRESS_US: '云帆智慧托书'
			},
			proxyCancelApplyParams: {}
		}
	},
	beforeRouteLeave(to, from, next) {
		if (to.name === 'OrderDetail') {
			let views = this.$store.state.tagsView.visitedViews.filter(item => item.params.orderNo === to.params.orderNo)
			this.$store.commit('tagsView/DEL_SAMEORDER_VISITED_VIEW', views)
		}
		next()
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.init()
	},
	activated() {
		let timestamp = new Date().getTime()
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
			this.init()
		}
	},
	mounted() {
		setTimeout(() => {
			console.log('🚀 ~ this.bookDetailForm', this.bookDetailForm)
		}, 3000)
	},

	computed: {
		isShowBook(){
			let { serviceList } = this.orderInfo
			let result=''
			if (serviceList && serviceList.length && serviceList.includes('whbook')) {
				result =true
			}
			if (serviceList && serviceList.length && serviceList.includes('proxy_whbook')) {
				result =true
			}
			return result
		},
		isShowDangerous(){
			let list=this.orderInfo.cargoList?this.orderInfo.cargoList:[]
			let result =list.some(el=>el.property==='dangerous')
			return result
		},
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isRc() {
			return this.ordDetRole === 'rc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		disabledState() {
			let { whBookStatus, lclStatus } = this.bookDetailForm.lcl
			return ['wh_in'].includes(whBookStatus) || lclStatus === 'done' || this.isBd || this.isDoc || this.isAc
		},
		hasJointNo() {
			return this.$route.query.jointNo ? true : false
		},
		whBookStatusOptions() {
			let result = this.dictMap.whBookStatus.filter(item => item.value !== 'po_received')
			return result
		},
		// 订舱类型是操作订舱
		isOpBook() {
			return this.bookDetailForm.lcl.whBookType === 'op'
		}
		// getCurrentServiceCode() {
		//   let serviceCode = ''
		//   if (this.orderInfo.serviceList.length && this.orderInfo.serviceList.includes('whbook')) {
		//     serviceCode = 'whbook'
		//   }
		//   if (this.orderInfo.serviceList.length && this.orderInfo.serviceList.includes('proxy_whbook')) {
		//     serviceCode = 'proxy_whbook'
		//   }
		//   return serviceCode
		// }
	},
	components: {
		CancelApplyAlert,
		EditAlert,
		CancelAlert,
		RefuseAlert,
		TopNav,
		LeftNav,
		ServiceCustInfo,
		JointWorkAssign,
		BookInfoView,
		FileList,
		// OneServiceFee,
		exportEntrustedPop,
		Dangerous,
		ProxyCancelApplyAlert
	},
	props: {},
	watch: {
		serviceCode(newVal) {
			if (newVal && this.jointShow) {
				this.getJointServiceWorkList(newVal)
			}
		}
	},
	methods: {
		handleClick(){
			if(this.labelActivityKey==='dangerous'){
				this.serviceCode = ''
			}else{
				let { serviceList } = this.orderInfo
				if (serviceList && serviceList.length && serviceList.includes('whbook')) {
					this.serviceCode = 'whbook'
				}
				if (serviceList && serviceList.length && serviceList.includes('proxy_whbook')) {
					this.serviceCode = 'proxy_whbook'
				}
			}
		},
		toDetail(orderNo) {
			// this.$router.push({
			// 	name: 'OrderDetail',
			// 	params: {
			// 		orderNo
			// 	},
			// 	query: {
			// 		orderNo,
			// 		source: 'orderList'
			// 	}
			// })
			let routeUrl = this.$router.resolve({
				name: 'OrderDetail',
				params: {
					orderNo
				},
				query: {
					orderNo,
					source: 'orderList'
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		validateLength(val) {
			let message = ''
			if (val === 'whPoNo') message = '入舱单号'
			if (this.createItem[val].length > 128) {
				this.createItem[val] = this.createItem[val].slice(0, 128)
				return this.$message.warning(message + '输入不能超过128位字符')
			}
		},
		init() {
			this.getOrderInfo()
			this.getLclInfo()
			this.getFileList()
		},
		// 获取订单详情
		getOrderInfo() {
			let { source, orderNo, jointNo } = this.$route.query
			if (jointNo) {
				return orderJointInfo({ jointNo: jointNo }).then(res => {
					this.orderInfo = res.data
					this.getInit()
				})
			}
			orderInfo({ orderNo: orderNo }).then(res => {
				this.orderInfo = res.data
				this.getInit()
			})
		},
		getInit() {
			if (!this.orderInfo) return
			let { name } = this.$route
			let { serviceList, serviceInfoList } = this.orderInfo
			// if (!this.serviceCode) this.serviceCode = getServiceCode(name, serviceList)
			if (serviceList && serviceList.length && serviceList.includes('whbook')) {
				this.serviceCode = 'whbook'
			}
			if (serviceList && serviceList.length && serviceList.includes('proxy_whbook')) {
				this.serviceCode = 'proxy_whbook'
			}
			if(!this.serviceCode){
				this.labelActivityKey = 'dangerous'
			}
			sessionStorage.setItem('serviceCode', this.serviceCode)
			this.handleIsCancelApply(this.serviceCode)
			// 获取业务发起取消的订单的取消原因备注等信息
			if (this.orderInfo.cancelApplyStatus === 'applied') {
				this.getCancel(this.orderInfo)
			}
			// 获取已拒绝的信息
			if (this.orderInfo.orderStatus === 'refuse') {
				this.getRefuse(this.orderInfo)
			}
			// 获取登录用户拥有可编辑订单的角色集合
			this.getUserEditRoles(this.orderInfo)
		},
		// 获取详情
		getLclInfo() {
			this.lsLoading = true
			lclInfo({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			}).then(res => {
				this.bookDetailForm = copyArry(res.data)
				// 新增和复制的订单，订舱服务项数据的设置
				let lcl = {
					lclStatus: ''
				}
				if (!res.data.lcl) {
					Object.assign(this.bookDetailForm, { lcl })
				}
				this.createItem = Object.assign(
					{ ...defaultCreateQuery },
					{
						orderNo: res.data.orderNo,
						whCyCutOff: res.data.lcl && res.data.lcl.whCyCutOff ? res.data.lcl.whCyCutOff : res.data.lcl && res.data.lcl.etWhCyCutOff ? res.data.lcl.etWhCyCutOff : '',
						etWhCyCutOff: res.data.lcl ? res.data.lcl.etWhCyCutOff : '',
						whPoNo: res.data.lcl ? res.data.lcl.whPoNo : '',
						whBookStatus: res.data.lcl ? res.data.lcl.whBookStatus : ''
					}
				)

				// 订单状态审核通过的默认选中未订舱
				if (!this.createItem.whBookStatus && res.data.orderStatus === 'pass') {
					this.createItem.whBookStatus = 'to_book'
				}
				// 获取订舱状态的在订舱状态数组中的索引值
				let whBookStatus = res.data.lcl ? res.data.lcl.whBookStatus : ''
				this.dictMap.whBookStatus.map((item, index) => {
					if (item.value === whBookStatus) {
						this.whBookStatusIndex = index
					}
				})
				let { sysLineCode } = this.bookDetailForm.ship
				if (sysLineCode) {
					baseSystemLineInfo({ sysLineCode }).then(res => {
						this.bookDetailForm.ship.sysLineName = res.data.cname
						// 获取订单基本信息
						this.bookBaseInfo.info = handleData.arrWhBookBaseInfo(this.bookDetailForm, 'whBook')
						console.log('🚀 ~ this.bookBaseInfo.info', this.bookBaseInfo.info)
					})
				} else {
					this.bookBaseInfo.info = handleData.arrWhBookBaseInfo(this.bookDetailForm, 'whBook')
				}

				// 获取货物信息
				this.goodsInfo.info = res.data.cargoList
				this.proxyCancelApplyParams = {
          submitCancelStatus: res.data.submitCancelStatus,
          submitCancelRemark: res.data.submitCancelRemark,
          submitCancelRefuseRemark: res.data.submitCancelRefuseRemark,
        }
			}).finally(() => {
				this.lsLoading = false
			})
		},
		// 获取附件列表
		getFileList() {
			let data = {
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			}
			whBookFileList(data).then(res => {
				this.fileListData = res.data
			})
		},
		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
			console.log(this.multipleSelection)
		},

		validate() {
			return true
		},

		// 保存数据
		handleWhbookSave() {
			this.$refs.lclWhBookSave.validate(valid => {
				// 获取订舱代理数据
				let whAgentSupplierId, whAgentSupplierName
				let agentItem = this.bookBaseInfo.info.find(item => item.key === 'whAgentSupplierId')
				if (agentItem) {
					whAgentSupplierId = agentItem.value
					whAgentSupplierName = agentItem.label
				}
				// 已入舱必须选择订舱代理
				if (!whAgentSupplierId && this.createItem.whBookStatus === 'wh_in') {
					return this.$message.warning('请选择订舱代理!')
				}
				if(this.orderInfo.ship && this.orderInfo.ship.tdTime && !['booked','wh_in'].includes(this.createItem.whBookStatus)){
					return this.$message.warning('请确认是否已实际开船？若是，请先维护好订舱状态。')
				}

				if (valid) {
					whBookSave({
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo,
						whCyCutOff: this.createItem.whCyCutOff,
						etWhCyCutOff: this.createItem.etWhCyCutOff,
						whPoNo: this.createItem.whPoNo,
						whBookStatus: this.createItem.whBookStatus,
						whAgentSupplierId,
						whAgentSupplierName
					}).then(res => {
						this.$message({
							type: 'success',
							message: '保存成功',
							duration: 1000,
							onClose: () => {
								this.getLclInfo()
							}
						})
					})
				} else {
					console.log('submit error')
					return false
				}
			})
		},
		// 已放PO
		handleWhbookPoRelease() {
			this.$refs.lclWhBookSave.validate(valid => {
				if (valid) {
					this.$confirm('是否将入舱单放仓给客户?', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					})
						.then(() => {
							whBookPoRelease({
								orderNo: this.oQuery.orderNo,
								jointNo: this.oQuery.jointNo
							}).then(res => {
								this.$message({
									type: 'success',
									message: '已放入舱单成功',
									duration: 1000,
									onClose: () => {
										this.getLclInfo()
									}
								})
							})
						})
						.catch(() => {})
				} else {
					console.log('submit error')
					return false
				}
			})
		},
		// 入舱核实单确认
		handleWhbookPoConfirm() {
			this.$refs.lclWhBookSave.validate(valid => {
				if (valid) {
					this.$confirm('入舱核实单是否已核对完成?', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					})
						.then(() => {
							whBookPoConfirm({
								orderNo: this.oQuery.orderNo,
								jointNo: this.oQuery.jointNo
							}).then(res => {
								this.$message({
									type: 'success',
									message: '入舱核实单确认成功',
									duration: 1000,
									onClose: () => {
										this.getLclInfo()
									}
								})
							})
						})
						.catch(() => {})
				} else {
					console.log('submit error')
					return false
				}
			})
		},
		// 拼箱完成确认
		handleWhbookLclConfirm() {
			this.$confirm('是否拼箱完成，确定后该订单不能关联整柜订单?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					whBookLclConfirm({
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo
					}).then(res => {
						this.$message({
							type: 'success',
							message: '拼箱完成成功',
							duration: 1000,
							onClose: () => {
								this.getLclInfo()
							}
						})
					})
				})
				.catch(() => {})
		},

		jointWorkAssignCallback() {
			this.getJointServiceWorkList(this.serviceCode)
		},
		handleCommand() {
			this.exportEntrustedPopShow = true
		},
		exportPopClose(action, value) {
			if (action === 'Confirm') {
				this.handleExport(value)
			} else {
				this.exportEntrustedPopShow = false
			}
		},
		handleExport(obj) {
			let params = {
				...obj,
				orderNo: this.$route.query.orderNo
			}
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/shiporder/lcl/booking/export',
					data: params
				})
				.then(res => {
					console.log(res)
					this.exportEntrustedPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = this.exportTypeOptions[params.bookingType] + params.orderNo + '.' + params.docType.toLowerCase()
					link.click()
				})
		}
	}
}
</script>
<style lang="scss">
@import '@/views/order/order/less/index.scss';
#lclWhBook {
	.fcl-order-no {
		color: blueviolet;
		cursor: pointer;
	}
	.si-status {
		padding-top: 10px;
		border-top: 1px solid #e9e9e9;
		// padding: 0 10px;
		// height: 40px;
		// line-height: 40px;
	}
	.si-status .el-checkbox .el-checkbox__label,
	.si-status .el-radio__label {
		font-size: 12px;
	}
	.si-status .span-label {
		margin-right: 20px;
	}
	.row-cont {
		margin: 0;
	}
	.row-form {
		border-bottom: 1px solid #e9e9e9;
	}

	.done {
		background: #d3eccc;
		height: 36px;
		line-height: 36px;
		padding: 0 10px;
	}
	.done .doneFont {
		color: #33b18a;
	}
}
.lclWhBook-form{
		.el-form-item {
		margin-right: 10px;
		margin-bottom: 10px;
	}
	.el-form-item__label {
		padding-right: 8px;
	}
}
</style>
