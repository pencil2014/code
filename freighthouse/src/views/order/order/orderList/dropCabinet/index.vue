<template>
	<div class="edit-container order-book fullWrap" id="drop-cabinet" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="order-container">
			<!-- 订单已取消提示 -->
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="activityKey" @routerPush="handleToRoute" />

					<div class="flex1 component-main-cont drop-container">
						<CustInfo :orderInfo="orderInfo" />
						<div class="drop-title">
							<span class="left-title">甩柜</span>
							<div class="right-title">
								<span class="status">
									业务审核状态:
								</span>
								<span v-if="dropInfo.dropBdCheckStatus === 'DISAGREE'" class="business-status-error"><i class="el-icon-error"></i>{{ statusFilter(dropInfo.dropBdCheckStatus) }}</span>
								<span v-if="dropInfo.dropBdCheckStatus === 'AGREE' || dropInfo.dropBdCheckStatus === 'AGREE_NOTIFY'" class="business-status-success"><i class="el-icon-success"></i>{{ statusFilter(dropInfo.dropBdCheckStatus) }}</span>
								<span class="status">
									审核人:
								</span>
								<span class="status status-last">
									{{ dropInfo.dropBdCheckEmployeeName || '--' }}
								</span>
								<span class="status ">
									审核时间:
								</span>
								<span class="status status-last">
									{{ dropInfo.dropBdCheckTime || '--' }}
								</span>
								<el-button v-if="dropOpStatus != 'FINISH' && orderList.ordDetRole != 'doc'" :disabled="isDisableBtn" @click="submitDrop" size="mini" type="warning">甩柜</el-button>
							</div>
						</div>

						<div class="drop-table">
							<div class="drop-table-title left-title">SO列表</div>
							<div class="drop-table-body">
								<el-table fit header-row-class-name="left-title" :data="soDropList" style="width: 100%">
									<el-table-column prop="so" label="SO号" width="150" align="right">
										<template slot-scope="scope"><span v-if="scope.row.isSoUpdate === 'Y'" class="drop-word">新</span> <span v-if="scope.row.isDrop == 'y'" class="drop-word">甩</span> {{ scope.row.so }}</template>
									</el-table-column>
									<el-table-column prop="shipCarrierCode" label="船公司" align="center"> </el-table-column>
									<el-table-column prop="polPortName" label="大船起运港" align="center"> </el-table-column>
									<el-table-column prop="podPortName" label="目的地" align="center"> </el-table-column>

									<el-table-column prop="vessel" width="190" label="船名" align="center">
										<template slot-scope="scope">
											<span>{{ scope.row.vesselOld }} <i v-if="scope.row.vesselOld" class="el-icon-right drop-arrow"></i> {{ scope.row.vessel }}</span>
										</template>
									</el-table-column>
									<el-table-column prop="voyage" label="航次" width="180" align="center">
										<template slot-scope="scope">
											<span>{{ scope.row.voyageOld }} <i v-if="scope.row.voyageOld" class="el-icon-right drop-arrow"></i> {{ scope.row.voyage }}</span>
										</template>
									</el-table-column>
									<el-table-column prop="cutOffDate" width="180" label="截关时间" align="center">
										<template slot-scope="scope">
											<span>{{ scope.row.cutOffDateOld }} <i v-if="scope.row.cutOffDateOld" class="el-icon-right drop-arrow"></i> {{ scope.row.cutOffDate }}</span>
										</template>
									</el-table-column>
									<el-table-column prop="containerInfo" show-overflow-tooltip width="100" label="箱型箱量" align="center">
										<template slot-scope="scope"
											><span>{{ scope.row.containerInfo }}</span>
										</template>
									</el-table-column>
									<el-table-column prop="soFileName" label="SO附件" show-overflow-tooltip width="150" align="center">
										<template slot-scope="scope"
											><span :class="orderList.ordDetRole === 'doc' ? 'disable-btn' : 'to-detail-btn'" @click="handleViewSo(scope.row)">{{ scope.row.soFileName }}</span>
										</template>
									</el-table-column>
									<el-table-column prop="fileName" width="100" show-overflow-tooltip label="甩柜证明" align="center">
										<template slot-scope="scope"
											><span :class="orderList.ordDetRole === 'doc' ? 'disable-btn' : 'to-detail-btn'" @click="handleViewDrop(scope.row)">{{ scope.row.fileName }}</span>
										</template>
									</el-table-column>
									<el-table-column prop="dropRemark" width="100" show-overflow-tooltip label="甩柜备注" align="center">
										<template slot-scope="scope">{{ scope.row.dropRemark }} </template>
									</el-table-column>
									<!-- <el-table-column prop="isSoUpdate" width="90" label="SO更新状态" align="center">
										<template slot-scope="scope"
											><span>{{ scope.row.isSoUpdate === 'Y' ? '已更新' : scope.row.isSoUpdate === 'N' ? '未更新' : '' }}</span>
										</template>
									</el-table-column> -->
									<el-table-column prop="soUpdateTime" width="100" label="更新时间" align="center"> </el-table-column>
								</el-table>
							</div>
						</div>

						<div class="drop-table">
							<div class="drop-table-title left-title">甩柜建单记录</div>
							<div class="drop-table-body">
								<el-table header-row-class-name="left-title" :data="dropRecord" style="width: 100%">
									<el-table-column prop="so" label="SO号" align="center"> </el-table-column>
									<el-table-column prop="dropOrderNo" label="工作号" align="center">
										<template slot-scope="scope">
											<span :class="orderList.ordDetRole === 'doc' ? 'disable-btn' : 'to-detail-btn'" @click="toDetail(scope.row.dropOrderNo)">{{ scope.row.dropOrderNo }}</span>
										</template>
									</el-table-column>
									<el-table-column prop="vessel" label="船名" align="center"> </el-table-column>
									<el-table-column prop="voyage" label="航次" align="center"> </el-table-column>
									<el-table-column prop="cutOffDate" label="截关时间" align="center"> </el-table-column>
									<el-table-column prop="containerInfo" show-overflow-tooltip label="箱型箱量" align="center">
										<template slot-scope="scope"
											><span>{{ scope.row.containerInfo }}</span>
										</template>
									</el-table-column>
								</el-table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { soCompareList, opDrop, dropInfo, mainJointSearch } from '@/api/order/list'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import CustInfo from '../components/custInfo'

export default {
	mixins: [orderMixin, routerMixin],

	data() {
		return {
			showSo: false,
			soDropList: [],
			dropRecord: [],
			dropInfo: {},
			changeSaveItem: {
				etdTime: '',
				vessel: '',
				voyage: ''
			},
			oQuery: this.$route.query,
			activityKey: 'DropCabinet'
		}
	},
	created() {
		console.log('dictMap', this.dictMap)
		this.getOrderInfo()
		this.getSoCompareList()
		this.getDropInfo()
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
		...mapState('order', ['dropBdCheckStatus', 'dropOpStatus', 'orderList']),
		...mapGetters(['dictMap']),
		statusFilter() {
			return function(val) {
				// 对计算属性进行传参
				let statusObj = this.dictMap.dropBdCheckStatus.find(item => item.value === val)
				return statusObj ? statusObj.label : ''
			}
		},
		isDisableBtn() {
			return !(this.dropBdCheckStatus === 'AGREE' || this.dropBdCheckStatus === 'AGREE_NOTIFY')
		}
	},
	watch: {},
	components: {
		TopNav,
		LeftNav,
		CustInfo
	},
	methods: {
		...mapMutations('order', ['setDropOpStatus']),
		// 预览so附件
		handleViewSo(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.soFileNo, fileName: row.soFileName })
		},
		// 预览甩柜证明
		handleViewDrop(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},
		async toDetail(orderNo) {
			let { data } = await mainJointSearch({ orderNo })
			let jointNo = data ? data.jointNo : ''
			let source = 'orderList'
			let routeName = 'OrderDetail'
			//判断地址栏如果有jointNo就跳转到协同  否则就跳到订单详情
			if (jointNo) {
				source = 'jointList'
				routeName = 'JointOrderDetail'
			}
			console.log('🚀 ~ data', data)
			console.log('🚀 ~ jointNo', jointNo)
			console.log('🚀 ~ source', source)
			console.log('🚀 ~ routeName', routeName)
			this.isJumpRouteFromPage = true
			// this.$router.push({
			// 	name: routeName,
			// 	params: {
			// 		orderNo
			// 	},
			// 	query: {
			// 		orderNo,
			// 		jointNo,
			// 		source
			// 	}
			// })
			let routeUrl = this.$router.resolve({
				name: routeName,
				params: {
					orderNo
				},
				query: {
					orderNo,
					jointNo,
					source
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		getDropInfo() {
			dropInfo({ orderNo: this.$route.query.orderNo }).then(res => {
				console.log('🚀 ~ res', res)
				this.dropInfo = res.data
				this.dropRecord = res.data.dropList
				this.setDropOpStatus(res.data.dropOpStatus)
			})
		},
		submitDrop() {
			let confirmText = ''
			if (this.dropInfo.dropStatus === 'ALL') {
				confirmText = '该订单SO全部被甩,是否进行甩柜操作?'
			}
			if (this.dropInfo.dropStatus === 'PART') {
				confirmText = '该订单SO部分被甩,被甩的SO是否一键创建新的订单?'
			}
			this.$confirm(confirmText, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					opDrop({ orderNo: this.$route.query.orderNo }).then(res => {
						this.$message.success('甩柜成功!')
						this.getDropInfo()
						this.getSoCompareList()
					})
				})
				.catch(err => {
					console.log('取消')
				})
		},
		//获取so列表数据
		getSoCompareList() {
			soCompareList({ orderNo: this.$route.query.orderNo }).then(res => {
				console.log('🚀 ~res.data', res.data)
				if (!res.data) {
					this.soDropList = []
					return
				}
				this.soDropList = res.data.map(item => {
					if (item.oldSo != null) {
						return { ...item.newSo, vesselOld: item.oldSo.vessel, voyageOld: item.oldSo.voyage, cutOffDateOld: item.oldSo.cutOffDate }
					}
					return { ...item.newSo, vesselOld: '', voyageOld: '', cutOffDateOld: '' }
				})
			})
		}
	}
}
</script>

<style lang="scss">
@import '../../less/index.scss';
.drop-container {
	background-color: #fff;
	margin: 10px;

	border-radius: 5px;
	box-shadow: 0 0 5px rgba($color: #ccc, $alpha: 0.5);
	.drop-arrow {
		font-weight: 700;
		font-size: 16px;
		color: #edb534;
	}
	.drop-word {
		background-color: #edb534;
		color: #fff;
		width: 14px;
		height: 14px;
		border-radius: 2px;
		padding: 0 2px 2px;

		font-size: 12px;
	}

	.left-title {
		font-size: 12px;
		font-weight: 600;
		color: #222222;
	}
	.right-title {
		font-size: 12px;
		color: #222222;
		.status {
			margin-right: 6px;
		}
		.business-status-success {
			margin-right: 20px;
			color: #33b18a;
			i {
				margin-right: 2px;
			}
		}
		.business-status-error {
			margin-right: 20px;
			color: #ff0000;
			i {
				margin-right: 2px;
			}
		}
		.status-last {
			margin-right: 20px;
		}
	}
	.drop-title {
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid #eee;
		padding: 10px;
		padding-bottom: 4px;
	}

	.drop-table {
		margin: 10px;
		padding-bottom: 5px;
		border: 1px solid #eee;
		border-radius: 5px;
		.to-detail-btn {
			cursor: pointer;
			color: #3e80f5;
		}
		.disable-btn {
			pointer-events: none;
		}
		.drop-table-title {
			margin-bottom: 10px;
			padding: 10px;
			background-color: #f8f9fd;
		}
		.drop-table-body {
			padding: 0 10px;
			.el-table .cell.el-tooltip {
				padding-right: 0;
				overflow: hidden;
			}
			.el-table th, .el-table td {
				padding: 2px 0;
				height: 24px;
			}
		}
	}
}
.containerList-cont {
	overflow-y: auto;
}
.cnDetail-form {
	.special-item {
		.el-form-item__content {
			margin-top: 20px;
		}
	}
}
</style>
