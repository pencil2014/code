<template>
	<el-tooltip placement="right" popper-class="copyOrderNo-pop" :visible-arrow="false">
		<div class="copy-label" @click="copy($event)" slot="content">复制工作号</div>
		<span class="review-row-table-header-container">
			<i v-for="(tip, index) in tipArr" :key="index" :class="tip.icon">{{ tip.value }}</i>
			<span size="mini" @click.stop="toDetail" class="underline">{{ param.orderNo }}</span>
		</span>
	</el-tooltip>
</template>

<script>
import clip from '@/utils/clipboard'
import store from '@/store'
export default {
	data() {
		return {
			tipArr: [],
			strObj: {
				value: '',
				icon: ''
			},
			cnObj: {
				value: '',
				icon: ''
			},
			portObj: {
				value: '',
				icon: ''
			},
			jointObj: {
				value: '',
				icon: ''
			},
			jointNoObj: {
				value: '',
				icon: ''
			}
		}
	},
	props: ['param', 'item'],
	created() {
		this.renderTip(this.param)
	},

	mounted() {},
	computed: {},
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

		toDetail() {
			this.item.method(this.param)
		},
		renderTip(val) {
			this.strObj = {
				value: '',
				icon: ''
			}
			this.cnObj = {
				value: '',
				icon: ''
			}
			this.portObj = {
				value: '',
				icon: ''
			}
			this.jointObj = {
				value: '',
				icon: ''
			}
			this.jointNoObj = {
				value: '',
				icon: ''
			}

			if (val._isPortChange === 'y') {
				this.portObj.value = '改'
				this.portObj.icon = 'icon-tip icon-change'
			}
			if (val._isContainerAdd === 'y') {
				this.cnObj.value = '调'
				this.cnObj.icon = 'icon-tip icon-add'
			}
			// 审核人不是登录用户的显示协
			if (val.orgAuditEmployeeId && val.auditEmployeeId && val.auditEmployeeId !== store.state.user.userId) {
				this.jointObj.value = '协'
				this.jointObj.icon = 'icon-tip icon-joint2'
			}
			if (store.state.book.currRole === 'bkg') {
				this.jointObj.value = ''
				if (val.jointNo) {
					this.jointObj.value = '协'
					this.jointObj.icon = 'icon-tip icon-joint2'
				}
			}

			this.tipArr = [this.strObj, this.cnObj, this.portObj, this.jointObj, this.jointNoObj]
		}
	}
}
</script>

<style lang="scss" scoped>
.review-row-table-header-container {
	white-space: nowrap;
	display: flex;
	justify-content: flex-end;
	position: relative;
	overflow: hidden;
	text-overflow: ellipsis;
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
}
</style>
