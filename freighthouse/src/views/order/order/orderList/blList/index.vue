<template>
	<div class="edit-container order-book fullWrap" id="blList">
		<div class="order-container">
			<div  id="alertCont">
				<!-- 订单已取消提示 -->
				<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
				<!-- 订单拒绝提示 -->
				<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
				<!-- 套约提示信息 -->
				<ContractTempPop :contractTempInfo="contractTempInfo" v-if="Object.keys(contractTempInfo).length"/>
			</div>
			<div class="tabs-container">
				<TopNav v-if="$route.query.source != 'SiListAddBl'" :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav v-if="$route.query.source != 'SiListAddBl'" :orderInfo="orderInfo" :activityKey="activityKey" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container" id="blContainer" @scroll="handleScroll" :style="{ height: `${blInfoHeight}px` }">
							<CustInfo v-if="$route.query.source != 'SiListAddBl'" :orderInfo="orderInfo" />
							<BlCtList ref="blCtListComponents" :saveBarFixed="saveBarFixed" v-if="['st02', 'st04'].includes(orderInfo.serviceType)"/>
							<BlList ref="blListComponents" :saveBarFixed="saveBarFixed" v-else/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { orderInfo } from '@/api/order/list'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import CustInfo from '../components/custInfo'
import BlList from '../orderBook/components/bl'
import BlCtList from '../orderBook/components/blCt'
import ContractTempPop from '../../components/contractInfoPop'

export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			oQuery: this.$route.query,
			activityKey: 'BlList',
			saveBarFixed: false,
			blInfoHeight: 0,
		}
	},
	created() {
		this.getOrderInfo()
		this.getContractInfo()
	},
	mounted() {
		console.log('🚀 ~ this.serviceInfoList', this.serviceInfoList)
		console.log('🚀 ~ this.serviceList', this.serviceList)
		if (window.history && window.history.pushState) {
			history.pushState(null, null, document.URL)
			window.addEventListener('popstate', this.browserBack, false)
		}
		window.addEventListener('resize', this.getBlInfoHeight)
		this.$nextTick(() => {
			this.getBlInfoHeight()
		})
	},
  beforeRouteLeave(to, from, next) {
		console.log('跳转的路由信息：',to)
		if (to.name === 'SiList') {
			// 补料列表中新增提单保存成功后不用校验
			next()
		} else {
			let compName = ['st02', 'st04'].includes(this.orderInfo.serviceType) ? 'blCtListComponents' : 'blListComponents'
      let check = this.$refs[compName].needShowTip()
			if (check) {
				this.$confirm('提单还未保存，是否确定要离开当前页面？', '警告', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
				.then(() => { 
					next()
				})
				.catch(() => {
					
				})
			} else {
				next()
			}
		}
	},
	destroyed() {
		window.removeEventListener('popstate', this.browserBack, false)
		window.removeEventListener('resize', this.getBlInfoHeight)
	},
	computed: {},
	watch: {},
	components: {
		CancelAlert,
		RefuseAlert,
		TopNav,
		LeftNav,
		CustInfo,
		BlList,
		BlCtList,
		ContractTempPop
	},
	methods: {
		getBlInfoHeight() {
			let navHeight = 24
			let alertHeight = document.getElementById('alertCont').offsetHeight
			let bodyHeight = document.body.clientHeight
			this.blInfoHeight = bodyHeight - alertHeight - navHeight
		},
		handleScroll() {
			// let saveBarDom = document.querySelector("#saveBar")
			let blContDom = document.querySelector("#blContainer")
			let blTableCont = document.querySelector("#blTableCont")
			let scrollTop  = blContDom.scrollTop
			// let offsetTop = saveBarDom.offsetTop
			let blTableContHeight = blTableCont.offsetHeight
			// console.log('blContDom_scrollTop', blContDom.scrollTop)
			// console.log('blTableContHeight', blTableContHeight)
			if (scrollTop > blTableContHeight + 36 +8) {	// 提单信息table高度和custInfo组件的高度
				this.saveBarFixed = true
			} else {
				this.saveBarFixed = false
			}
		}
	}
}
</script>

<style lang="scss">
@import '../../less/index.scss';
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
#blList .service-container .edit-row {
	margin-top: 8px !important;
}
#blList .service-container .edit-row .edit-container.so {
	padding: 10px;
}
</style>
