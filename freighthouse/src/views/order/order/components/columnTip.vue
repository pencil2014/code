<template>
	<el-tooltip placement="right" popper-class="copyOrderNo-pop" :visible-arrow="false">
		<div class="copy-label" @click="copy($event)" slot="content">复制工作号</div>
		<span class="review-row-table-header-container">
			<el-tooltip v-for="(tip, index) in tipArr" :key="index" placement="top">
				<div class="order-column-tip" v-if="tip.value" slot="content">
					<div class="order-column-tip-title">{{ tip.title }}</div>
					<div class="order-desc-content">{{ tip.desc }}</div>
				</div>
				<i :class="tip.icon">{{ tip.value }}</i>
			</el-tooltip>
			<!-- <img v-if="isWhiteCust" :src="require(`@/views/order/order/images/white-new.png`)" class="img-white" /> -->
			<img v-if="param.systemCode === 'CUST'" :src="require(`@/views/order/order/images/icon-order-cust.png`)" class="img-cust" />
			<span size="mini" @click.stop="toDetail" class="underline">{{ param.orderNo }}</span>
			<!-- <el-tag v-if="copyShow" class="tag-read" size="mini" style="margin-left:8px" @click.stop="copy($event)">复制</el-tag> -->
		</span>
	</el-tooltip>
</template>

<script>
import clip from '@/utils/clipboard'
export default {
	data() {
		return {
			copyShow: false,
			tipArr: [],
			strObj: {
				title: '',
				value: '',
				icon: '',
				desc: ''
			},
			jointObj: {
				title: '',
				value: '',
				icon: '',
				desc: ''
			},
			dropObj: {
				title: '',
				value: '',
				icon: '',
				desc: ''
			},
			noticeDropObj: {
				title: '',
				value: '',
				icon: '',
				desc: ''
			}
		}
	},
	props: ['param', 'item'],
	created() {
		this.renderTip(this.param)
	},

	mounted() {},
	computed: {
		// isWhiteCust() {
    //   return this.$route.path.includes('jointList') && ['Y', 'y'].includes(this.param.isWhiteCust)
    // },
	},
	watch: {
		param(val) {
			this.renderTip(val)
		}
	},
	components: {},
	methods: {
		copy(e) {
			clip(this.param.orderNo, e)
		},
		overFn() {
			this.copyShow = true
		},
		leaveFn() {
			this.copyShow = false
		},
		toDetail() {
			this.item.method(this.param)
		},
		renderTip(val) {
			this.strObj = {
				title: '',
				value: '',
				icon: '',
				desc: ''
			}
			this.jointObj = {
				title: '',
				value: '',
				icon: '',
				desc: ''
			}
			this.dropObj = {
				title: '',
				value: '',
				icon: '',
				desc: ''
			}
			this.noticeDropObj = {
				title: '',
				value: '',
				icon: '',
				desc: ''
			}
			if (val.isJoint === 'y') {
				this.jointObj.title = '协同'
				this.jointObj.value = '协'
				this.jointObj.icon = 'icon-tip icon-joint2'
				this.jointObj.desc = '该订单某些服务项被创建了协同订单，对应订单会出现【协】字，表示该订单存在协同服务项。'
			}
			if (val.bkgStatus === 'book_release' && val.issueMode === 'notify' && val.issueNotifyStatus !== 'y') {
				this.strObj.title = '等待放舱'
				this.strObj.value = '等'
				this.strObj.icon = 'icon-tip icon-wait'
				this.strObj.desc =
					'业务在创建订单时，放舱要求选择的是通知放舱，在BKG放舱给操作后，（BKG未放舱可以不需要显示）对应的操作订单列表对应的工作号前会显示【等】字，表示可以需要等待业务通知才能放舱给客户。当业务点了立即放舱后，对应的工作号【等】字变为【即】字。'
			}
			if (val.bkgStatus === 'book_release' && ((val.issueMode === 'notify' && val.issueNotifyStatus === 'y') || val.issueMode === 'prompt')) {
				this.strObj.title = '即时放舱'
				this.strObj.value = '即'
				this.strObj.icon = 'icon-tip icon-ji'
				this.strObj.desc = '业务在创建订单时，放舱要求选择的是即时放舱，在BKG放舱给操作后，（BKG未放舱可以不需要显示）对应的操作订单列表对应的工作号前会显示【即】字，表示可以立刻放舱给到客户。'
			}
			// 放舱给客户状态改用issueStatusStr==已放舱来判断 弃用issueTime
			if (val.issueStatusStr === 'Released') {
				this.strObj.title = ''
				this.strObj.value = ''
				this.strObj.icon = ''
				this.strObj.desc = ''
			}
			if (val.isChange === '1') {
				this.strObj.title = '做柜后改船'
				this.strObj.value = '改'
				this.strObj.icon = 'icon-tip icon-change'
				this.strObj.desc = '整柜-BKG放舱后，应某些因素需要做柜后改船，对应操作进行做柜后改船操作后，对应订单会出现【改】字。'
			}
			if (val.changeStatus === 'SUBMIT') {
				this.strObj.title = '改港'
				this.strObj.value = '改'
				this.strObj.icon = 'icon-tip icon-change'
				this.strObj.desc = '拼箱，因某些因素需要改港，对应操作进行改港操作后，对应订单会出现【改】字。'
			}
			if (val.orderStatus === 'refuse') {
				this.strObj.title = '订舱拒绝'
				this.strObj.value = '拒'
				this.strObj.icon = 'icon-tip icon-refuse'
				this.strObj.desc = '业务创建订单给到商务审核后，商务拒绝给业务，业务的订单列表对应的工作号前显示【拒】字，表示审核不通过，订舱拒绝。商务审核通过后给到BKG，BKG拒绝给商务/业务，对应角色工作号前显示【拒】字，表示订舱不通过。拒绝订舱。'
				if (this.param.businessType === 'air_export' || this.param.businessType === 'air_import') {
					this.strObj.desc = '业务创建订单给到商务审核后，商务拒绝给业务，业务的订单列表对应的工作号前显示【拒】字，表示审核不通过，订舱拒绝。'
				}
			}

			if (val.dropStatus === 'ALL' && val.dropOpStatus != 'FINISH') {
				this.noticeDropObj.title = '全部被甩'
				this.noticeDropObj.value = '全'
				this.noticeDropObj.icon = 'icon-tip icon-drop'
				this.noticeDropObj.desc =
					'BKG接收船公司甩柜的SO发起对应的甩柜操作。若该订单的SO全部被甩，则业务、操作、商务的订单/订舱列表对应的工作号出现【全】字标识，表示改订单的SO全部被甩。需要业务同意是否甩柜。若同意对应订单显示【甩】字操作则进入甩柜流程，若不同意对应订单显示【不】字。业务线下与商务/BKG沟通保柜。'
			}
			if (val.dropStatus === 'PART' && val.dropOpStatus != 'FINISH') {
				this.noticeDropObj.title = '部分被甩'
				this.noticeDropObj.value = '部'
				this.noticeDropObj.icon = 'icon-tip icon-drop'
				this.noticeDropObj.desc =
					'BKG接收船公司甩柜的SO发起对应的甩柜操作。若该订单的SO部分被甩，则业务、操作、商务的订单/订舱列表对应的工作号出现【部】字标识，表示改订单的SO全部被甩。需要业务同意是否甩柜。若同意对应订单显示【甩】字操作则进入甩柜流程，若不同意对应订单显示【不】字。业务线下与商务/BKG沟通保柜。'
			}
			if (val.dropBdCheckStatus === 'DISAGREE') {
				this.noticeDropObj.title = '不同意甩柜'
				this.noticeDropObj.value = '不'
				this.noticeDropObj.icon = 'icon-tip icon-refuse'
				this.noticeDropObj.desc = ' BKG甩柜通知后，操作若要进行甩柜操作，需要得到业务的同意，若业务不同意该订单柜子被甩，对应操作/商务/BKG订单的工作号前面会显示【不】字，表示不同意甩柜，线下进行保柜沟通。'
			}
			if (val.dropBdCheckStatus === 'AGREE_NOTIFY' || val.dropBdCheckStatus === 'AGREE') {
				this.noticeDropObj.title = '同意甩柜'
				this.noticeDropObj.value = '同'
				this.noticeDropObj.icon = 'icon-tip icon-drop'
				this.noticeDropObj.desc = 'BKG甩柜通知后，操作若要进行甩柜操作，需要得到业务的同意，若业务同意该订单柜子被甩，对应操作订单的工作号前面会显示【同】字，表示同意甩柜，可以进行甩柜操作。'
			}
			if (val.isDrop === 'Y') {
				this.dropObj.title = '甩柜'
				this.dropObj.value = '甩'
				this.dropObj.icon = 'icon-tip icon-dropped'
				this.dropObj.desc = '操作接收到业务同意甩柜的指令后对该订单进行甩柜操作。新的订单会有【甩】字标识，表示该订单为甩柜的订单。'
			}
			if (val.isCancelApply === '1') {
				this.strObj.title = '订单取消'
				this.strObj.value = '取'
				this.strObj.icon = 'icon-tip icon-cancel'
				this.strObj.desc = '业务对需要取消的订单发起了取消通知，对应操作订单列表会去现【取】字，表示该订单需要取消，操作根据订单情况去判断该订单是取消（该订单未产生任何费用）还是终止（该订单产生了部分费用）。'
				// 终止，已取消的订单状态不显示取图标
				if (val.orderStatus === 'break' || val.orderStatus === 'cancel') {
					this.strObj = {
						title: '',
						value: '',
						icon: '',
						desc: ''
					}
				}
				// this.jointObj = {
				//   title: '',
				//   value: '',
				//   icon: '',
				//   desc: ''
				// }
				this.dropObj = {
					title: '',
					value: '',
					icon: '',
					desc: ''
				}
				this.noticeDropObj = {
					title: '',
					value: '',
					icon: '',
					desc: ''
				}
			}
			// 协同订单，已关闭tab不显示图标
			if (val.jointNo || val.orderStatus === 'close') {
				this.strObj = {
					title: '',
					value: '',
					icon: '',
					desc: ''
				}
				this.jointObj = {
					title: '',
					value: '',
					icon: '',
					desc: ''
				}
				this.dropObj = {
					title: '',
					value: '',
					icon: '',
					desc: ''
				}
				this.noticeDropObj = {
					title: '',
					value: '',
					icon: '',
					desc: ''
				}
			}
			this.tipArr = [this.strObj, this.jointObj, this.dropObj, this.noticeDropObj]
		}
	}
}
</script>

<style lang="scss" scoped>
.order-column-tip {
	width: 250px;
	.order-column-tip-title {
		font-weight: 700;
	}
}
.review-row-table-header-container {
	white-space: nowrap;
	display: flex;
	justify-content: flex-end;
	position: relative;
	// padding-right: 40px;
	overflow: hidden;
	text-overflow: ellipsis;
}
.order-column-tip-title {
	margin-bottom: 10px;
}
.tag-read {
	position: absolute;
	top: -0;
	right: 0;
}
.el-tag--mini {
	font-size: 10px;
	height: 16px;
	padding: 0 4px;
	line-height: 16px;
	cursor: pointer;
}
.img-white {
	width: 20px;
  height: 18px;
}
.img-cust {
	display: inline-block;
	width: 16px;
  height: 16px;
	margin-right: 5px;
}
</style>
<style lang="scss">
.copyOrderNo-pop.is-dark {
	font-size: 12px;
	text-align: center;
	cursor: pointer;
	background: #ecf5ff;
	color: #409eff;
	border: 1px solid #d9ecff;
	padding: 2px 5px;
	margin-left: 5px;
	// .copy-label{
	//   line-height: 6px;
	// }
}
</style>
