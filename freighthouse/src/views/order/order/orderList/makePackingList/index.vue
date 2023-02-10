<template>
	<div class="edit-container order-book fullWrap" id="polLtl">
		<div class="order-container">
			<!-- 协同撤回申请提示 -->
			<CancelApplyAlert v-if="jointShow && isCancelApply && serviceCode !== 'book'" :serviceInfo="serviceInfo" :serviceList="orderInfo.serviceList" @callback="getOrderInfo" />
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container detail-container-pol flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container" id="container" @scroll="handleScroll">
							<ServiceCustInfo :orderInfo="orderInfo" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="'make_packing_list'" /> -->
						</div>
						<JointWorkAssign :jointServiceWorkList="jointServiceWorkList" :serviceCode="serviceCode" @callback="jointWorkAssignCallback" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>

import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { scatterTruckIntrustList,  scatterTruckIntrustDelete,scatterTruckIntrustUpdateIntrustStatus } from '@/api/order/shippingTruck'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'

export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			oQuery: this.$route.query,
			status: '', // 委派状态
			list: [], // table渲染需要的数据
			multipleSelection: [],
			canSave: true,
			routeName: this.$route.name,
			activityKey: '',
			serviceCode: 'make_packing_list',
			detailData: {},
			type: '', // 新增或编辑标识
			saveBarFixed: false
		}
	},
	created() {
		this.getOrderInfo()
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
		isBd() {
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'doc' || this.ordDetRole === 'ac'
			return isBd || this.isJoint || this.isFinish
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === this.serviceCode)
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
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
		// OneServiceFee
	},
	watch: {
	},
	methods: {
		handleScroll() {
			// let saveBarDom = document.querySelector("#saveBar")
			let contDom = document.querySelector("#container")
			let intrustTable = document.querySelector("#intrustTable")
			let scrollTop  = contDom.scrollTop
			let intrustTableHeight = intrustTable.offsetHeight
			if (scrollTop >  intrustTableHeight +36 +8) {	// table高度和custInfo组件的高度
				this.saveBarFixed = true
			} else {
				this.saveBarFixed = false
			}
		},
		selectable(row) {
			return row.oid ? true : false
		},
		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
		},

		// 获取选中的oid
		getOids() {
			let oids = []
			this.multipleSelection.map(item => {
				oids.push(item.oid)
			})
			return oids
		},

		// 新增保存
		handleSave(row, sIndex) {
			
		},

		// 删除
		handleDelete(row, sIndex) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						oid: row.oid,
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo
					}
					return scatterTruckIntrustDelete(data)
				})
				.then(response => {
					if (row.intrustNo === this.detailData.intrustNo) {
						this.showTruckLoad = false
					}
					this.getTruckIntrustList()
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(() => {})
		},
		jointWorkAssignCallback() {
			this.getJointServiceWorkList(this.serviceCode)
		}
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
#polLtl {
	.detail-container-pol{
		min-height: 92vh;
	}
	.edit-container,
	.component-main-cont {
		height: unset;
	}
	.component-cont {
		padding: 10px 20px;
	}
	.finance-one-service-fee-separator {
		display: none;
	}
}
#polLtl .remark-con {
	display: flex;
}
#polLtl .remark-con .txt {
	display: inline-block;
	overflow: hidden;
	width: 120px;
	height: 16px;
	white-space: nowrap;
	text-overflow: ellipsis;
}
#polLtl .remark-con .underline {
	padding: 0;
}
#polLtl .remark-style{
	overflow: hidden; 
	white-space: nowrap;
	text-overflow: ellipsis;
	display: inline-block;
	width: 100%;
	line-height: 16px;
}
</style>
