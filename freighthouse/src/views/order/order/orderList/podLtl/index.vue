<template>
	<div class="edit-container order-book fullWrap" id="podLtl" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="order-container">
			<!-- 协同撤回申请提示 -->
			<CancelApplyAlert v-if="jointShow && isCancelApply && serviceCode !== 'book'" :serviceInfo="serviceInfo" :serviceList="orderInfo.serviceList" @callback="getOrderInfo" />
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="ordDetRole === 'bd' && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container detail-container-pod flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container" id="container" @scroll="handleScroll">
							<ServiceCustInfo :orderInfo="orderInfo" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<div class="component-cont table-com-layout" id="tableCont">
								<div class="mb10 between h28">
									<div class="ft12 bold">目的港散车派送信息</div>
									<div>
										<el-button size="mini" type="default" :disabled="isBd || isDisabledEdit" class="mr10" @click="handleOpenExportPop">输出派车单</el-button>
										<span>委派状态：</span>
										<el-select style="width: 120px" placeholder="请选择" size="mini" v-model="status" @change="handleUpdateIntrustStatus" :disabled="isBd || isDisabledEdit">
											<el-option v-for="(item, index) in dictMap.podDeliveryLtlStatus" :key="index" :label="item.label" :value="item.value"></el-option>
										</el-select>
										<el-button size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="isBd || isDisabledEdit">新增派车</el-button>
									</div>
								</div>
								<el-table ref="multipleTable" fit style="width: 100%" :data="list" @selection-change="handleSelectionChange">
									<el-table-column type="selection" :selectable="selectable"></el-table-column>
									<el-table-column prop="intrustNo" label="委托编号" align="center" width="140"> </el-table-column>
									<el-table-column prop="status" label="委派状态" align="center">
										<template slot-scope="scope">
											{{ scope.row.status | podDeliveryLtlStatusFilter }}
										</template>
									</el-table-column>
									<el-table-column prop="dispatchType" label="派车类型" align="center">
										<template slot-scope="scope">
											<span>{{ scope.row.dispatchType === 'receive' ? '散车收货' : scope.row.dispatchType === 'deliver' ? '散车派送' : ''}}</span>
										</template>
									</el-table-column>
									<el-table-column prop="overseaAgentName" label="海外代理" align="center" width="140">
									</el-table-column>
									<el-table-column prop="supplierName" label="车队" align="center" width="140">
									</el-table-column>
									<el-table-column prop="supplierContact" label="车队联系人" align="center">
									</el-table-column>
									<el-table-column prop="supplierContactPhone" label="车队联系人电话" align="center" width="120">
									</el-table-column>
									<el-table-column prop="remark" label="注意事项" align="center" show-overflow-tooltip>
										<template slot-scope="scope">
											<span class="remark-style">{{scope.row.remark}}</span>
										</template>
									</el-table-column>
									<el-table-column label="操作" width="100" align="center" fixed="right">
										<template slot-scope="scope">
											<div class="operate-group">
												<el-button @click="handleInfo(scope.row)" type="text" size="mini">详情</el-button>
												<el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || isDisabledEdit">删除</el-button>
											</div>
										</template>
									</el-table-column>
								</el-table>
							</div>
							<!-- 拖车详情 -->
							<TruckLoad @hideDetail="hideDetail" :detailData="detailData" :isDisabledEdit="isDisabledEdit" :orderInfo="orderInfo" :saveBarFixed="saveBarFixed" v-if="showTruckLoad" @importFile="handleImportFile"/>
							<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="'truck'" /> -->
						</div>
						<JointWorkAssign :jointServiceWorkList="jointServiceWorkList" :serviceCode="serviceCode" @callback="jointWorkAssignCallback" />
					</div>
				</div>
			</div>
		</div>
		<!-- 输出拖车委托单弹窗 -->
		<div v-if="exportPopShow">
			<ExportPop @close="exportPopClose" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel, getServiceCode } from '@/utils/tools'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { baseSupplierList } from '@/api/base'
import { orderInfo, orderJointInfo } from '@/api/order/list'
import { supplierInfo } from '@/api/crm/supplier'
import {ltlIntrustList, ltlStatusChange, ltlIntrustDelete, ltlIntrustSave, ltlIntrustInfo, ltlReqno} from '@/api/order/podService/ltlDelivery'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import ExportPop from './components/exportPop'
import TruckLoad from './truckLoad'

export default {
	filters: {
		podDeliveryLtlStatusFilter(status) {
      return getDictLabel('podDeliveryLtlStatus', status)
    },
	},
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			truckDetailQuery: {},
			showTruckLoad: false,
			oQuery: this.$route.query,
			status: '', // 委派状态
			list: [], // table渲染需要的数据
			multipleSelection: [],
			canSave: true,
			routeName: this.$route.name,
			activityKey: '',
			serviceCode: 'pod_ltl_delivery',
			exportPopShow: false, // 输出弹窗
			detailData: {},
			type: '',
			currIntrustNo: '',
			saveBarFixed: false
		}
	},
	created() {
		this.getOrderInfo()
		this.getTruckIntrustList()
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
		isEpricing() {
      return this.userEditRoles.includes('epricing')
    },
    isEcs() {
      return this.userEditRoles.includes('ecs')
    },
		isBd() {
			console.log('isBd', this.ordDetRole, this.isJoint)
			let isJoint = this.isJoint
			if (this.$route.query.jointNo) {
				isJoint = false
			}
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'op' || this.ordDetRole === 'ac' || (!this.isDoc&&!this.isEpricing&&!this.isEcs)
			if(this.orderInfo.businessType ==='ship_import_lcl' && this.ordDetRole === 'op'){
        isBd = false
      }
			return isBd || isJoint || this.isFinish
		},
		isDoc() {
			return this.ordDetRole === 'doc'
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
			}else if(['complete','cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus)){
				return true
			}else{
				return false
			}
		}
	},
	components: {
		CancelApplyAlert,
		CancelAlert,
		RefuseAlert,
		TopNav,
		LeftNav,
		ServiceCustInfo,
		JointWorkAssign,
		// OneServiceFee,
		ExportPop,
		TruckLoad
	},
	watch: {
	},
	methods: {
		handleScroll() {
			// let saveBarDom = document.querySelector("#saveBar")
			let contDom = document.querySelector("#container")
			let tableCont = document.querySelector("#tableCont")
			let scrollTop  = contDom.scrollTop
			let tableContHeight = tableCont.offsetHeight
			if (scrollTop >  tableContHeight +36 +8) {	// table高度和custInfo组件的高度
				this.saveBarFixed = true
			} else {
				this.saveBarFixed = false
			}
		},
		hideDetail(type) {
			this.showTruckLoad = false
			if (type === 'save') {
				this.getTruckIntrustList()
			}
		},

		selectable(row) {
			return row.oid ? true : false
		},

		// 委托列表
		getTruckIntrustList(index) {
			ltlIntrustList({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			}).then(res => {
				let { data } = res
				this.list = data
			})
		},

		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
		},

		// 获取选中的intrustNo
    getOids() {
      let intrustNos = [];
      this.multipleSelection.map(item => {
        intrustNos.push(item.intrustNo)
      })
      return intrustNos
    },

		// 新增
		handleAdd() {
			this.type = 'add'
			ltlReqno().then(res => {
        this.detailData = {
					intrustNo: res.data.seqNo,
					status: 'init'
				}
      })
			this.showTruckLoad = true
		},

		// 新增保存
		handleSave(row, sIndex) {
			
		},

		// 详情
		handleInfo(row) {
			this.type = 'info'
			let {intrustNo} = row
			this.currIntrustNo = intrustNo
			let {orderNo, jointNo} = this.$route.query
			this.getInfo(orderNo, jointNo, intrustNo)
			this.showTruckLoad = true
		},
		getInfo(orderNo, jointNo, intrustNo) {
			ltlIntrustInfo({orderNo, jointNo, intrustNo}).then(res => {
				this.detailData = res.data
				// this.detailData = data.loadInfoList.forEach(item => {
				// 	item.signFileName = item.baseFile ? item.baseFile.name : '',
				// 	item.signFileNo = item.baseFile ? item.baseFile.fileNo : ''
				// })
			})
		},

		// 删除
		handleDelete(row, sIndex) {
			this.$confirm('是否确认删除该条数据?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let data = {
          intrustNo: row.intrustNo, 
          orderNo: this.oQuery.orderNo, 
          jointNo: this.oQuery.jointNo
        }
        return ltlIntrustDelete(data);
      }).then(response => {
        this.$message({
          message: '删除成功', 
          type: 'success',
          duration: 1000,
          onClose: () => {
            if (row.intrustNo = this.detailData.intrustNo) {
              this.showTruckLoad = false
            }
            this.getTruckIntrustList()
          }
        })
      }).catch(() => {
        this.getTruckIntrustList()
			})
		},

		// 委派状态修改
		handleUpdateIntrustStatus(val) {
			if (!this.getOids().length) {
				this.status = ''
				return this.$message.warning('请先选择委派计划')
			}
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return ltlStatusChange({
						intrustNos: this.getOids(),
						status: val,
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo
					})
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '委派状态修改成功',
						duration: 1000,
						onClose: () => {
							this.status = ''
							this.getTruckIntrustList()
							if (this.showTruckLoad && this.type === 'info') {
								this.getInfo(this.$route.query.orderNo, this.$route.query.jointNo, this.currIntrustNo)
							}
						}
					})
				})
				.catch(err => {
					this.status = ''
				})
		},

		jointWorkAssignCallback() {
			this.getJointServiceWorkList(this.serviceCode)
		},

		// 打开输出弹窗
		handleOpenExportPop() {
			if (this.multipleSelection.length !== 1) return this.$message({ type: 'warning', message: '请选择一条要导出的散车' })
			this.exportPopShow = true
		},
		exportPopClose(action, value) {
			console.log(action, value)
			if (action === 'Confirm') {
				this.handleExport(value)
			} else {
				this.exportPopShow = false
			}
		},
		// 输出
		handleExport(value) {
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/shipping/delivery/ltl/export',
					data: {
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo,
						oid: this.multipleSelection[0].oid,
						docType: value.docType
					}
				})
				.then(res => {
					this.exportPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = `拖车委托单${this.$route.query.orderNo}.` + value.docType.toLowerCase()
					link.click()
				})
		},
		// 上传文件回调
    handleImportFile(value) {
      let {orderNo, jointNo} = this.$route.query
      this.getInfo(orderNo, jointNo, value)
    },
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
#podLtl {
	.detail-container-pod{
		min-height: 92vh;
	}
	.edit-container,
	.component-main-cont {
		height: unset;
	}
	.component-cont {
		padding: 0 20px 10px 20px;
	}
	.finance-one-service-fee-separator {
		display: none;
	}
}
#podLtl .remark-con {
	display: flex;
}
#podLtl .remark-con .txt {
	display: inline-block;
	overflow: hidden;
	width: 120px;
	height: 16px;
	white-space: nowrap;
	text-overflow: ellipsis;
}
#podLtl .remark-con .underline {
	padding: 0;
}
#podLtl .remark-style{
	overflow: hidden; 
	white-space: nowrap;
	text-overflow: ellipsis;
	display: inline-block;
	width: 100%;
	line-height: 16px;
}
</style>
