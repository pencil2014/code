<template>
	<div class="edit-container order-book fullWrap" id="fileList" v-loading="lsLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
		<div class="order-container">
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="activityKey" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container">
							<CustInfo :orderInfo="orderInfo" />
							<div class="fileList-cont table-com-layout">
								<div class="childOrderList-row">
									<div class="ft14">推送海外分公司</div>
								</div>
								<el-table class="relate-order" style="width: 100%" fit highlight-current-row :data="pushOverList" max-height="400">
									<el-table-column prop="compDeptName" label="海外分公司" align="left" min-width="150"> </el-table-column>
									<el-table-column prop="fileNoList" label="申请附件" align="left" min-width="150">
										<template slot-scope="scope">
											<div v-if="scope.row.fileNoList && scope.row.fileNoList.length > 0" class="si-file-wrap">
												<span size="mini" @click="handleViewFileList(scope.row)">查看</span>
											</div>
										</template>
									</el-table-column>
									<el-table-column show-overflow-tooltip prop="applyRemark" label="申请备注" align="left" min-width="150"> </el-table-column>
									<el-table-column prop="applyStatus" label="接单状态" align="left" min-width="150">
										<template slot-scope="scope">
											<div class="column-text">{{ scope.row.applyStatus | applyStatusFilter }}</div>
										</template>
									</el-table-column>
									<el-table-column prop="importOrderNo" label="进口单号" align="left" min-width="150"> </el-table-column>
									<el-table-column prop="createdName" label="申请人" align="left" width="150"> </el-table-column>
									<el-table-column prop="applyTime" label="申请时间" align="left" width="150"> </el-table-column>
									<el-table-column prop="handleEmployeeName" label="接单人" align="left" width="150"> </el-table-column>
									<el-table-column prop="acceptTime" label="接单时间" align="left" width="150"> </el-table-column>
									<el-table-column show-overflow-tooltip prop="refuseRemark" label="拒绝原因" align="left" width="150"> </el-table-column>
									<el-table-column prop="refuseTime" label="拒绝时间" align="left" width="150"> </el-table-column>
									<el-table-column show-overflow-tooltip prop="cancelRemark" label="撤回原因" align="left" width="150"> </el-table-column>
									<el-table-column prop="cancelTime" label="撤回时间" align="left" width="150"> </el-table-column>
									<el-table-column fixed="right" label="操作" align="left">
										<template slot-scope="scope">
											<ButtonTip
												v-if="scope.row.applyStatus == 'SUBMIT'"
												btnType="primary"
												:btnDisabled="!['ecs', 'op'].includes(orderList.ordDetRole)"
												btnText="撤回"
												tipContent="本订单的操作,海外客服,接单状态为待接单,才可执行撤回"
												class="operateBtn-tip"
												@click="handleRecall(scope.row)"
											>
											</ButtonTip>
											<ButtonTip
												v-if="['REFUSE', 'CANCEL'].includes(scope.row.applyStatus)"
												btnType="primary"
												:btnDisabled="!['ecs', 'op'].includes(orderList.ordDetRole)"
												btnText="重新申请"
												tipContent="本订单的操作,海外客服,接单状态为已取消,才可执行重新申请"
												class="operateBtn-tip"
												@click="handlePush(scope.row)"
											>
											</ButtonTip>
										</template>
									</el-table-column>
								</el-table>
							</div>
							<div class="fileList-cont table-com-layout">
								<div class="childOrderList-row">
									<div class="ft14">关联工作单</div>
								</div>
								<el-table class="relate-order" style="width: 100%" fit highlight-current-row :data="relationList" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip" max-height="400">
									<el-table-column prop="orderNo" label="工作号" align="left" width="150">
										<template slot-scope="scope">
											<div style="color: #1890ff; cursor: pointer" @click="handleInfo(scope.row)" class="column-text">{{ scope.row.orderNo }}</div>
										</template>
									</el-table-column>
									<el-table-column prop="serviceType" label="服务类型" align="left" width="150">
										<template slot-scope="scope">
											<div class="column-text">{{ scope.row.serviceType | serviceTypeFilter }}</div>
										</template>
									</el-table-column>
									<el-table-column prop="polPortName" label="起运港" align="left" min-width="150"> </el-table-column>
									<el-table-column prop="podPortName" label="目的地" align="left" min-width="150"> </el-table-column>
									<el-table-column prop="bdEmployeeName" label="销售" align="left" min-width="100"> </el-table-column>
									<el-table-column prop="bdDeptName" label="销售部门" align="left" min-width="150"> </el-table-column>
									<el-table-column prop="compDeptName" label="分公司" align="left" min-width="150"> </el-table-column>
									<el-table-column prop="bizDate" label="业务日期" align="left" width="150"> </el-table-column>
									<el-table-column prop="createdTime" label="订单创建时间" align="left" width="150"> </el-table-column>
								</el-table>
								<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
							</div>
							<!-- 整箱有关联拼箱单 -->
							<div class="fileList-cont table-com-layout" v-if="['st01', 'st09', 'st15'].includes(orderInfo.serviceType)">
								<div class="childOrderList-row">
									<div class="ft14">关联拼箱单</div>
									<div class="ft14"><el-button type="primary" size="mini" @click="showRelate">关联</el-button></div>
								</div>
								<el-table class="relate-order" style="width: 100%" fit highlight-current-row :data="tableData" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
									<el-table-column prop="orderNo" label="工作号" align="left" width="150">
										<template slot-scope="scope">
											<div style="color: #1890ff; cursor: pointer" @click="handleInfo(scope.row)" class="column-text">{{ scope.row.orderNo }}</div>
										</template>
									</el-table-column>
									<el-table-column prop="whPoNo" label="入舱单号" align="left" width="150"> </el-table-column>
									<el-table-column prop="serviceType" label="服务类型" align="left" width="150">
										<template slot-scope="scope">
											<div class="column-text">{{ scope.row.serviceType | serviceTypeFilter }}</div>
										</template>
									</el-table-column>
									<el-table-column prop="blNo" label="HBL单号" align="left">
										<template slot-scope="scope">
											<div class="column-text">{{ scope.row.blNo }}</div>
										</template>
									</el-table-column>
									<el-table-column prop="receiptPlaceName" label="装货地" align="left"> </el-table-column>
									<el-table-column prop="podPortName" label="目的地" align="left" width="150"> </el-table-column>
									<el-table-column prop="bdEmployeeName" label="销售" align="left" width="100"> </el-table-column>
									<el-table-column prop="bizDate" label="业务日期" align="left" width="150"> </el-table-column>
									<el-table-column prop="createdTime" label="订单创建时间" align="left" width="150"> </el-table-column>
									<el-table-column prop="quantity" label="总件数" align="left" width=""> </el-table-column>
									<el-table-column prop="weight" label="总毛重" align="left" width=""> </el-table-column>
									<el-table-column prop="volume" label="总体积" align="left" width=""> </el-table-column>
									<el-table-column prop="hscode" label="HSCODE" align="left" width="">
										<template slot-scope="scope">
											<div class="column-text">{{ scope.row.hscode }}</div>
										</template>
									</el-table-column>
									<el-table-column prop="cname" label="中文品名" align="left" width="">
										<template slot-scope="scope">
											<div class="column-text">{{ scope.row.cname }}</div>
										</template>
									</el-table-column>
									<el-table-column prop="ename" label="英文品名" align="left" width="">
										<template slot-scope="scope">
											<div class="column-text">{{ scope.row.ename }}</div>
										</template>
									</el-table-column>
									<el-table-column label="操作" align="left">
										<template slot-scope="scope">
											<ButtonTip
												btnType="primary"
												:btnDisabled="!['bd', 'obd', 'asst', 'op'].includes(orderList.ordDetRole)"
												btnText="移除"
												tipContent="非本订单的销售、销售助理、下单助理、操作人员，不允许该操作"
												class="operateBtn-tip"
												@click="handleRemove(scope.row.orderNo)"
											>
											</ButtonTip>
											<!-- <el-button :disabled="!['bd','obd','asst','op'].includes(orderList.ordDetRole)" size="mini" type="primary" @click="handleRemove(scope.row.orderNo)">移除</el-button> -->
										</template>
									</el-table-column>
								</el-table>
								<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<el-dialog title="关联订单" :visible.sync="isShowRelate" width="80%" :before-close="handleCloseRelate">
			<LclRelate v-if="isShowRelate" @closeRelate="handleCloseRelate" @getList="lclChildList" ref="lclRelate" />
			<span slot="footer" class="dialog-footer">
				<el-button size="mini" @click="handleCloseRelate">取 消</el-button>
				<el-button size="mini" type="primary" @click="handleConfirm">确 定</el-button>
			</span>
		</el-dialog>
		<div v-if="cancelShow">
			<Apply :param="cancelQuery" @close="refusePopClose" />
		</div>
		<div v-if="pushOverseaShow">
			<push-oversea :param="pushParam" @close="handlePushClose"></push-oversea>
		</div>
		<!-- 附件列表 -->
		<div v-if="cargoFileListShow">
			<FileList @close="cargoFileListShow = false" :param="listItemQuery" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { orderInfo, lclChildList, lclFclUnbind, orderRelationList, importApplyList } from '@/api/order/list'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import CustInfo from '../components/custInfo'
import LclRelate from './lclRelate'
import Apply from './apply'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import PushOversea from '../components/pushOversea'
import FileList from './cargoFileList'

export default {
	filters: {
		serviceTypeFilter(serviceType) {
			return getDictLabel('diyServiceType', serviceType)
		},
		applyStatusFilter(applyStatus) {
			return getDictLabel('importApplyStatus', applyStatus?.toLowerCase())
		}
	},
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			cargoFileListShow: false,
			pushParam: {},
			pushOverseaShow: false,
			cancelShow: false,
			cancelQuery: {},
			isShowRelate: false,
			oQuery: this.$route.query,
			tableData: [],
			relationList: [],
			pushOverList: [],
			activityKey: 'ChildOrderList',
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			}
		}
	},
	created() {
		this.getOrderInfo()
		this.lclChildList()
		this.getRelationList()
		this.getPushOverList()
	},
	mounted() {
		console.log('🚀 ~ this.dictMap.importApplyStatus', this.dictMap.importApplyStatus)
		if (window.history && window.history.pushState) {
			history.pushState(null, null, document.URL)
			window.addEventListener('popstate', this.browserBack, false)
		}
	},
	destroyed() {
		window.removeEventListener('popstate', this.browserBack, false)
	},
	computed: {
		...mapState('order', ['orderList']),
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	components: {
		CancelAlert,
		RefuseAlert,
		TopNav,
		LeftNav,
		CustInfo,
		LclRelate,
		tableTooltip,
		Apply,
		PushOversea,
		FileList
	},
	methods: {
		// 查看附件弹窗
		handleViewFileList(row) {
			this.listItemQuery = {
				...row
			}
			this.cargoFileListShow = true
		},
		handlePushClose(action) {
			if (action === 'Confirm') {
				this.getPushOverList()
			}
			this.pushOverseaShow = false
		},
		// 重新申请
		handlePush(row) {
			console.log('🚀 ~ row', row)
			this.pushParam = { ...row }
			this.pushOverseaShow = true
		},
		// 撤回
		handleRecall(row) {
			console.log('🚀 ~ row', row)
			this.cancelQuery = { ...row }
			this.cancelShow = true
		},
		// 拒绝弹窗关闭回调
		async refusePopClose(action, value) {
			console.log('value', value)
			if (action === 'Confirm') {
				this.cancelShow = false
				this.getPushOverList()
			} else {
				this.cancelShow = false
			}
		},
		// 预览附件
		handleViewFile(row, index) {
			console.log('🚀 ~ row', row)
			let fileNo = row.fileNoList[index]
			let fileName = row.fileNameList[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
		// 鼠标移入cell
		showTooltip(row, column, cell) {
			this.tableCellMouse.cellDom = cell
			this.tableCellMouse.row = row
			this.tableCellMouse.hidden = false
		},
		// 鼠标移出cell
		hiddenTooltip() {
			this.tableCellMouse.hidden = true
		},
		// 去详情页
		async handleInfo(row) {
			let action = ''
			this.isJumpRouteFromPage = true
			let isSameCode = await this.$store.dispatch('order/getValueByKeys', { custid: row.custid })
			let { data } = await orderRelationList({ orderNo: this.$route.query.orderNo })
			let routeUrl = this.$router.resolve({
				name: 'OrderDetail',
				params: {
					orderNo: row.orderNo
				},
				query: {
					orderNo: row.orderNo,
					source: 'orderList',
					action: action,
					showContainer: !['st03', 'st18', 'st04', 'st19', 'st11', 'st12'].includes(row.serviceType), // 拼箱不显示集装箱tab
					showBl: ['st01', 'st15', 'st03', 'st18', 'st09', 'st10', 'st11', 'st12', 'st02', 'st04'].includes(row.serviceType),
					showRelate: (isSameCode && ['st01', 'st15', 'st09'].includes(row.serviceType)) || data.length
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		handleRemove(val) {
			// console.log('🚀 ~ val', val)
			this.$confirm(`是否移除该订单?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					lclFclUnbind({ orderNo: this.oQuery.orderNo, lclOrderNo: val }).then(res => {
						this.$message.success('移除成功!')
						this.lclChildList()
					})
				})
				.catch(() => {})
		},

		handleConfirm() {
			this.$refs.lclRelate.lclFclBind()
		},
		handleCloseRelate() {
			this.isShowRelate = false
		},
		showRelate() {
			this.isShowRelate = true
		},
		lclChildList() {
			lclChildList({ orderNo: this.oQuery.orderNo }).then(res => {
				this.tableData = res.data
			})
		},
		getRelationList() {
			orderRelationList({ orderNo: this.oQuery.orderNo }).then(res => {
				this.relationList = res.data
			})
		},
		getPushOverList() {
			importApplyList({ orderNo: this.oQuery.orderNo }).then(res => {
				this.pushOverList = res.data
			})
		}
	}
}
</script>

<style lang="scss">
@import '../../less/index.scss';
.si-file-wrap {
	width: 100%;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.si-file-wrap span {
	cursor: pointer;
	color: #1890ff;
}
.relate-order.el-table .cell.el-tooltip {
	overflow: hidden;
}
.childOrderList-row {
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;
	line-height: 20px;
	height: 20px;
}
</style>
