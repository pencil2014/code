<template>
	<div class="edit-container order-book fullWrap" id="blList" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div style="margin:0;" class="order-container">
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="'RailwayBlList'" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container" id="blContainer" @scroll="handleScroll">
							<CustInfo :orderInfo="orderInfo.main" />
							<BlList ref="blListComponents" :saveBarFixed="saveBarFixed" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { orderMixin } from '@/views/railway/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import CustInfo from '../components/custInfo'
import BlList from '../orderBook/components/bl'
import LeftNav from '../components/leftNav'

export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			oQuery: this.$route.query,
			activityKey: 'BlList',
			saveBarFixed: false
		}
	},
	created() {
		this.getOrderInfo()
	},
	mounted() {
		if (window.history && window.history.pushState) {
			history.pushState(null, null, document.URL)
			window.addEventListener('popstate', this.browserBack, false)
		}
	},
	beforeRouteLeave(to, from, next) {
		let check = this.$refs['blListComponents'].needShowTip()
		if (check) {
			this.$confirm('提单还未保存，是否确定要离开当前页面？', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					next()
				})
				.catch(() => {})
		} else {
			next()
		}
	},
	destroyed() {
		window.removeEventListener('popstate', this.browserBack, false)
	},
	computed: {},
	watch: {},
	components: {
		CancelAlert,
		RefuseAlert,
		TopNav,
		CustInfo,
		BlList,
		LeftNav
	},
	methods: {
		handleScroll() {
			let saveBarDom = document.querySelector('#saveBar')
			let blContDom = document.querySelector('#blContainer')
			let scrollTop = blContDom && blContDom.scrollTop
			let offsetTop = saveBarDom && saveBarDom.offsetTop
			// console.log('blContDom_scrollTop', blContDom.scrollTop)
			// console.log('saveBar_top', saveBarDom.offsetTop)
			if (scrollTop > offsetTop) {
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
