<template>
	<div>
		<el-alert type="warning" :closable="true" class="orange changeStyle book-alert">
			<template slot="title">
				<i class="tag-change">调</i>
				<span class="txt">
					<template v-if="isPricing">该订单箱型箱量已调整，请及时审批。
						<span v-if="bookDetailForm.containerModifyInfo.containerAddRemark"> 备注：{{ bookDetailForm.containerModifyInfo.containerAddRemark }} </span>
						<el-button type="danger" size="mini" class="btn-refuse ml10" @click="handleRefuse" 
							v-if="['submit', 'book_refuse'].includes(bookDetailForm.containerModifyInfo.bkgStatus)" style="margin-left: 27px"
						>拒绝</el-button>
					</template>
					<template v-if="isBkg">
						<el-popover placement="bottom-start" width="350" trigger="hover" class="changeShip">
							<div class="ship-info-row">
								<div class="item">起运港：{{polPortEname}}</div>
								<div class="item">目的地：{{podPortEname}}</div>
								<div class="item">大船船名航次：{{bookDetailForm.ship.vessel}}/{{bookDetailForm.ship.voyage}}</div>
								<div class="item">so号：{{soStr}}</div>
								<div class="item">原箱型箱量：{{containerTotal.container}}</div>
							</div>
							<span slot="reference">
								该订单箱型箱量已调整，请及时修改SO信息并放舱。
								<span v-if="bookDetailForm.containerModifyInfo.containerAddRemark || true" slot="reference"> 备注：{{ bookDetailForm.containerModifyInfo.containerAddRemark }} </span>
							</span>
						</el-popover>
						<el-button type="danger" size="mini" class="btn-refuse ml10" @click="handleRefuse" 
							v-if="!['refuse', 'book_refuse', 'book_release'].includes(bookDetailForm.containerModifyInfo.bkgStatus) && !['break', 'cancel'].includes(bookDetailForm.orderStatus)" 
							style="margin-left: 27px"
						>拒绝</el-button>
					</template>
				</span>
			</template>
		</el-alert>
		<!-- 拒绝弹窗 -->
		<div v-if="refusePopShow">
			<RefuseDialog :params="bookDetailForm.containerModifyInfo" :isAddCont="isAddCont" @close="refusePopClose" />
		</div>
	</div>
</template>
<script>
import RefuseDialog from '../refuseDialog'
import { soList } from '@/api/order/book/list'
// import { orderBookInfo } from '@/api/order/list'
export default {
	data() {
		return {
			// 拒绝弹窗
			refusePopShow: false,
			polPortEname: '',
			podPortEname: '',
			soStr: ''
		}
	},
	props: {
		bookDetailForm: {
			type: Object,
			default: () => ({})
		},
    isAddCont: {
      type: Boolean,
      default: false
		},
		containerTotal: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.isBkg && this.getInit()
	},
	mounted() {},
	computed: {
		isPricing() {
			return this.$route.query.roles === 'pricing'
		},
		isBkg() {
			return this.$route.query.roles === 'bkg'
		},
	},
	components: {
		RefuseDialog
	},
	watch: {},
	methods: {
		getInit() {
			let { polPortName, podPortName} = this.bookDetailForm.ship
			let polPointIndex = polPortName.indexOf(',')
			let podPointIndex = podPortName.indexOf(',')
			if (polPointIndex !== -1) {
				this.polPortEname = polPortName.slice(0, polPointIndex)
			}
			if (podPointIndex !== -1) {
				this.podPortEname = podPortName.slice(0, podPointIndex)
			}
			// 获取SO列表
			this.getSoList()
			// if (this.bookDetailForm.bkgStatus === 'book_release' && this.$route.query.orderNo) {
			// 	this.getOrderBookInfo()
			// } else {
			// 	this.getSoList()
			// }
		},
		//获取so列表
		getSoList() {
			soList(this.$route.query.bkgReqNo).then(res => {
				let soLists = res.data || []
				this.soStr = soLists.map(item => item.so).join(',')
			})
		},
		// getOrderBookInfo() {
		// 	// 起运港为宁波并且是已放舱的获取so列表
		// 	orderBookInfo({ orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo }).then(res => {
		// 		this.soLists = res.data.soList || []
		// 	})
		// },
		// 拒绝
		handleRefuse() {
			this.refusePopShow = true
		},
		refusePopClose(action) {
			this.refusePopShow = false
			if (action === 'Confirm') {
				this.handleGoBack()
			}
		},
		handleGoBack() {
			window.close()
		},
	}
}
</script>
<style lang="scss">
.ship-info-row {
	.item {
		line-height: 20px;
		font-size: 12px;
	}
}
</style>
