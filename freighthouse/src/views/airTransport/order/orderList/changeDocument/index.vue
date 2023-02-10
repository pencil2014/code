<template>
	<div class="edit-container order-book fullWrap" id="changeDocument">
		<div class="order-container">
			<div class="tabs-container">
				<div class="detail-container flex">
					<div class="flex1 component-main-cont">
						<div class="service-container">
							<ServiceCustInfo :serverIsJoint="isJoint" :orderInfo="orderInfo" :serviceCode="'pod_change_doc'" @getOrderInfo="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<!-- 海运进口新增类型 -->
							<div class="component-cont" style="padding-bottom: 0; margin-top: 0">
								<div style="padding-left: 20px">
									<span style="margin-right: 10px">请选择类型:</span>
									<el-checkbox :disabled="isFinish" @change="subTypeSave('hbl_to_mbl')" v-model="hbl_to_mbl" true-label="y" false-label="n"> H换M </el-checkbox>
									<el-checkbox :disabled="isFinish" v-if="isShipImport" @change="subTypeSave('mbl_to_paper')" v-model="mbl_to_paper" true-label="y" false-label="n"> 换提单纸 </el-checkbox>
								</div>
								<div v-if="serviceCheckout.length > 0" class="ship-cont">
									<el-tabs v-model="activityType" class="pl20">
										<el-tab-pane v-for="item in serviceCheckout" :name="item.value" :key="item.value">
											<span style="font-size: 12px" slot="label">
												{{ item.label }}
											</span>
										</el-tab-pane>
									</el-tabs>
								</div>
							</div>
							<div v-if="serviceCheckout.length > 0" class="component-cont" style="padding: 10px 20px; margin-top: 0">
								<div class="mb10 between h28">
									<span class="tit ft12 bold">换单信息</span>
									<div class="row-tit-operate">
										<div class="">
											<span class="mr10">换单状态</span>
											<el-select v-model="exchangeStatus" size="mini" placeholder="请选择" :disabled="isBd && !isImportJoint" clearable style="width: 120px" @change="handleUpdateStatus">
												<el-option v-for="item in dictMap.blExchangeStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
											</el-select>
										</div>
									</div>
								</div>
								<div class="row-form mt10 table-com-layout">
									<el-table
										ref="blExchangeTable"
										fit
										style="width: 100%"
										:data="blExchangeList"
										default-expand-all
										row-key="blId"
										:tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
										:select-on-indeterminate="true"
										:row-class-name="tableRowClassName"
										@select-all="handleSelectAll"
										@selection-change="handleSelectionChange"
									>
										<el-table-column type="selection" width="50"></el-table-column>
										<el-table-column prop="blNo" label="提单号" align="left" width="250">
											<template slot-scope="scope">
												<i class="icon-hbl" v-if="scope.row.blType">{{ scope.row.blType === 'mawb' ? '主' : '分' }}</i>
												{{ scope.row.blNo }}
											</template>
										</el-table-column>
										<el-table-column label="草单确认" align="center" type="">
											<template slot-scope="scope">
												<div class="operate-group">
													<span v-if="scope.row.isDraftConfirm === 'y' && scope.row.blType === 'mawb'">客户已确认</span>
													<span v-if="scope.row.isDraftConfirm !== 'y' && scope.row.blType === 'mawb'"> 客户未确认</span>
													<span v-if="scope.row.isDraftConfirm === 'y' && scope.row.blType === 'hawb'">代理已确认</span>
													<span v-if="scope.row.isDraftConfirm !== 'y' && scope.row.blType === 'hawb'"> 代理未确认</span>
												</div>
											</template>
										</el-table-column>
										<el-table-column label="出单状态" align="center" type="">
											<template slot-scope="scope">
												<span v-if="scope.row.issueStatus === 'issued'">已出单</span>
												<span v-else>未出单</span>
											</template>
										</el-table-column>
										<el-table-column prop="status" label="换单状态" align="center">
											<template slot-scope="scope">
												{{ scope.row.exchangeStatus | exchangeStatusFilter }}
											</template>
										</el-table-column>
										<el-table-column show-overflow-tooltip="" width="150px" prop="overseasAgentName" :label="isShipImport ? '代理' : '海外代理'" align="center"> </el-table-column>
										<el-table-column v-if="!isShipImport" show-overflow-tooltip="" width="150px" prop="overseasCompanyName" label="海外分公司" align="center"> </el-table-column>
										<el-table-column show-overflow-tooltip="" width="150" prop="exchangeCompleteTime" label="换单完成时间" align="center"> </el-table-column>
									</el-table>
								</div>
							</div>
							<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="'pod_change_doc'" /> -->

							<!-- 修改换单状态弹窗 -->
							<div v-if="exchangeShow">
								<Exchange :exchangeData="exchangeData" @close="exchangePopClose" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import store from '@/store'
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { getDictLabel } from '@/utils/tools'
import { airBlExchangeList, airBlExchangeUpdateStatus } from '@/api/order/podService/blExchange'
import ServiceCustInfo from '../components/serviceCustInfo'
import Exchange from './components/exchange'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import { subTypeSave, getSubTypeList } from '@/api/order/list'

export default {
	filters: {
		exchangeStatusFilter(status) {
			return getDictLabel('blExchangeStatus', status)
		},
		blModeFilter(blMode) {
			return getDictLabel('blMode', blMode)
		},
		auditStatusFilter(auditStatus) {
			let auditStatusOptions = store.state.order.finAuditStatusOptions
			return auditStatusOptions[auditStatus] || '--'
		}
	},
	mixins: [orderMixin, routerMixin],
	props: {},
	data() {
		return {
			activityType: 'hbl_to_mbl',
			hbl_to_mbl: 'y',
			mbl_to_paper: 'n',
			hToM: 'y',
			changePaper: 'n',
			progressValue: '',
			state: 'valid',
			blExchangeList: [],
			oQuery: this.$route.query,
			exchangeStatus: '', // 提单状态
			multipleSelection: [],
			blUploadShow: false,
			exchangeShow: false,
			defaultFileSize: 100, //文件默认不超过100M
			file: '',
			fileList: [],
			routeName: 'PodChangeDoc',
			activityKey: '',
			serviceCode: 'pod_change_doc',
			exchangeData: {}
		}
	},
	created() {
		this.getOrderInfo()
		this.getBlList()
		// 获取类型
		this.getSubTypeList()
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
			userId: state => state.user.userId,
			roles: state => state.user.roles,
			airOrderInfo: state => state.airTransport.airOrderInfo
		}),
		serviceCheckout() {
			return this.dictMap.servicePodExchange.filter(item => this[item.value] === 'y')
		},
		isFinish() {
			let findItem = this.airOrderInfo.serviceInfoList.find(item => item.serviceCode === this.serviceCode)
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isBd() {
			let isJoint = this.isJoint
			if (this.$route.query.jointNo) {
				isJoint = false
			}
			return isJoint || this.isFinish || (!this.isOp && !this.isEcs && (!this.isCs || !this.isShipImport))
		},
		// 20220509特殊处理为进口协同单的服务项权限都放开
		isImportJoint() {
			return ['air_import'].includes(this.airOrderInfo.businessType) && this.$route.query.source === 'jointList'
		},
		// 空运进口
		isShipImport() {
			return ['air_import'].includes(this.airOrderInfo.businessType)
		}
	},
	components: {
		ServiceCustInfo,
		// OneServiceFee,
		Exchange
	},
	watch: {
		activityType() {
			this.$refs.blExchangeTable.clearSelection()
			this.getBlList()
		},
		airOrderInfo() {
			if (this.airOrderInfo.serviceInfoList) {
				this.handleGetServiceStatus()
			}
		}
	},
	methods: {
		// 获取子服务类型选中状态
		getSubTypeList() {
			getSubTypeList({ orderNo: this.oQuery.orderNo, serviceCodes: [this.serviceCode] }).then(res => {
				if (res.data) {
					// 设置选中状态
					;['hbl_to_mbl', 'mbl_to_paper'].map(item => {
						this.setCheckValue(res.data, item)
					})

					//设置当前tab
					if (this.serviceCheckout.length > 0) {
						this.activityType = this.serviceCheckout[0].value
					}
				} else {
					// 全部设为未选中
					this.hbl_to_mbl = 'n'
					this.mbl_to_paper = 'n'
				}
			})
		},
		// 查找对应类型的状态
		setCheckValue(data, prop) {
			let item = data.find(item => item.typeCode === prop)
			if (item) {
				this[prop] = item.chooseStatus
			} else {
				this[prop] = 'n'
			}
		},
		// 子服务类型保存
		subTypeSave(typeCode) {
			console.log('🚀 ~ typeCode', typeCode)
			let typeName
			let chooseStatus = this[typeCode]
			switch (typeCode) {
				case 'hbl_to_mbl':
					typeName = 'H换M'
					break
				case 'mbl_to_paper':
					typeName = '换提货纸'
					break

				default:
					break
			}
			subTypeSave({
				serviceCode: this.serviceCode,
				typeCode: typeCode,
				typeName: typeName,
				orderNo: this.oQuery.orderNo,
				chooseStatus: chooseStatus
			})
				.then(_ => {
					if (chooseStatus === 'y') {
						// 选中类型  跳转到对应的tab
						this.activityType = typeCode
					} else if (chooseStatus === 'n' && this.serviceCheckout.length > 0) {
						this.activityType = this.serviceCheckout[0].value
					}
				})
				.catch(() => {
					// 保存失败时重置选中状态
					this.getSubTypeList()
				})
			// // 校验服务项进度
			// if (chooseStatus === 'y' && this.handleGetServiceStatus() === 'finish') {
			// 	this.$confirm('服务项进度已完成，新增新类型，服务项进度将自动变为处理中，是否确定要新增？', '确认?', {
			// 		confirmButtonText: '确定',
			// 		cancelButtonText: '取消',
			// 		type: 'warning'
			// 	})
			// 		.then(() => {
			// 			subTypeSave({
			// 				serviceCode: this.serviceCode,
			// 				typeCode: typeCode,
			// 				typeName: typeName,
			// 				orderNo: this.oQuery.orderNo,
			// 				chooseStatus: chooseStatus
			// 			})
			// 				.then(_ => {
			// 					// 刷新服务项进度
			// 					this.getOrderInfo()
			// 					// 选中类型  跳转到对应的tab
			// 					this.activityType = typeCode
			// 				})
			// 				.catch(() => {
			// 					// 保存失败时重置选中状态
			// 					this.getSubTypeList()
			// 				})
			// 		})
			// 		.catch(() => {
			// 			// 重置选中状态
			// 			this.getSubTypeList()
			// 		})
			// } else {
			// 	subTypeSave({
			// 		serviceCode: this.serviceCode,
			// 		typeCode: typeCode,
			// 		typeName: typeName,
			// 		orderNo: this.oQuery.orderNo,
			// 		chooseStatus: chooseStatus
			// 	})
			// 		.then(_ => {
			// 			if (chooseStatus === 'y') {
			// 				// 选中类型  跳转到对应的tab
			// 				this.activityType = typeCode
			// 			} else if (chooseStatus === 'n' && this.serviceCheckout.length > 0) {
			// 				this.activityType = this.serviceCheckout[0].value
			// 			}
			// 		})
			// 		.catch(() => {
			// 			// 保存失败时重置选中状态
			// 			this.getSubTypeList()
			// 		})
			// }
		},
		handleGetServiceStatus() {
			let { serviceInfoList } = this.airOrderInfo
			let sItem = serviceInfoList.find(item => item.serviceCode === this.serviceCode)
			this.progressValue = sItem ? sItem.serviceStatus : ''
		},
		// 海外分公司 海外代理弹窗关闭
		exchangePopClose(val, form) {
			console.log('🚀 ~ form', form)
			console.log('🚀 ~ val', val)
			this.exchangeShow = false
			if (val === 'Confirm') {
				this.exchangeStatus = ''
				this.getBlList()
			}
		},
		// 获取提单列表
		getBlList() {
			airBlExchangeList({
				orderNo: this.oQuery.orderNo,
				jointNo: this.oQuery.jointNo
			}).then(res => {
				this.blExchangeList = res.data || []
			})
		},
		tableRowClassName({ row, rowIndex }) {
			if (row.blType == 'mawb' && this.activityType === 'hbl_to_mbl') return 'checkDisabled'
			if (row.blType == 'hawb' && this.activityType === 'mbl_to_paper') return 'checkDisabled'
			return ''
		},
		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
			if (this.activityType === 'hbl_to_mbl') {
				this.multipleSelection = this.multipleSelection.filter(item => item.blType === 'hawb')
			} else {
				this.multipleSelection = this.multipleSelection.filter(item => {
					return item.blType === 'mawb'
				})
			}
			console.log('🚀 ~ this.multipleSelection', this.multipleSelection)
		},
		// 全选/全不选
		handleSelectAll(selection) {
			//table第一层只要有在selection里面就是全选
			const isSelect = selection.some(el => {
				const blIds = this.blExchangeList.map(j => j.blId)
				return blIds.includes(el.blId)
			})
			//table第一层不在selection里面就是全不选
			const isCancel = !this.blExchangeList.some(el => {
				const selectOids = selection.map(j => j.blId)
				return selectOids.includes(el.blId)
			})
			if (isSelect) {
				selection.map(el => {
					if (el.children) {
						el.children.map(j => {
							this.toggleSelection(j, true)
						})
					}
				})
			}
			if (isCancel) {
				this.blExchangeList.map(el => {
					if (el.children) {
						el.children.map(j => {
							this.toggleSelection(j, false)
						})
					}
				})
			}
		},
		toggleSelection(row, select) {
			if (row) {
				this.$nextTick(() => {
					this.$refs.blExchangeTable && this.$refs.blExchangeTable.toggleRowSelection(row, select)
				})
			} else {
				this.$refs.blExchangeTable.clearSelection()
			}
		},
		// 获取选中的blId
		getOids() {
			let blIds = []
			this.multipleSelection.map(item => {
				blIds.push(item.blId)
			})
			return blIds
		},
		validate() {
			return true
		},
		// 修改提单状态
		handleUpdateStatus(val) {
			console.log('🚀 ~ val', val)
			if (!val) return

			if (!this.multipleSelection.length) {
				return this.$message({
					type: 'error',
					message: '请先选择数据',
					duration: 1000,
					onClose: () => {
						this.exchangeStatus = ''
					}
				})
			}
			// 修改为已换单时 弹窗新增海外代理 分公司
			if (val === 'exchange') {
				this.exchangeShow = true
				this.exchangeData = {
					blIds: this.getOids(),
					orderNo: this.oQuery.orderNo,
					jointNo: this.oQuery.jointNo,
					status: 'exchange',
					isShipImport: this.isShipImport
				}
				return
			}
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let blIds = this.getOids()
					return airBlExchangeUpdateStatus({
						blIds: blIds,
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo,
						status: val
					})
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '修改换单状态成功',
						duration: 1000,
						onClose: () => {
							this.exchangeStatus = ''
							this.getBlList()
						}
					})
				})
				.catch(err => {
					this.exchangeStatus = ''
				})
		}
	}
}
</script>
<style lang="scss">
.change-checkbox {
	.menu-title {
		margin-right: 10px;
	}
	.el-checkbox__label {
		font-size: 12px;
	}
}
.el-table .cell.el-tooltip {
	overflow: hidden !important;
}
.icon-hbl {
	display: inline-block;
	width: 14px;
	height: 14px;
	background: #3e80f5;
	border-radius: 2px;
	color: #fff;
	line-height: 14px;
	text-align: center;
	font-style: normal;
}
.checkDisabled {
	.el-checkbox {
		display: none;
	}
}
.operate-group {
	.file-name {
		span {
			display: inline-block;
			line-height: 15px;
			max-width: 240px;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
	}
}
</style>
