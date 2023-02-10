<template>
	<el-tooltip placement="right" popper-class="copyOrderNo-pop" :visible-arrow="false">
		<div class="copy-label" @click="copy($event)" slot="content">复制工作号</div>
		<span class="review-row-table-header-container">
			<i v-for="(tip, index) in tipArr" :key="index" :class="tip.icon">{{ tip.value }}</i>
			<span size="mini" @click.stop="toDetail" :class="item.method ? 'underline' : ''">{{ param.orderNo }}</span>
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
			jointObj: {
				value: '',
				icon: ''
			},
			specialObj: {
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
			this.item.method && this.item.method(this.param)
		},
		renderTip(val) {
			this.strObj = {
				value: '',
				icon: ''
			}
			this.jointObj = {
				value: '',
				icon: ''
			}
			this.specialObj = {
				value: '',
				icon: ''
			}
			// formatter: (row, column) => {
			// 	let jointStr = row.orgDeptName ? `<i class="icon-joint-dept">协-订</i>` : ''
			// 	return `${jointStr}${row.orderNo}`
			// }

			if (val.orgDeptName) {
				this.jointObj.value = '协-订'
				this.jointObj.icon = 'icon-joint-dept'
			}
			if (val.isSpecial === 'Y') {
				this.specialObj.value = '特'
				this.specialObj.icon = 'icon-special-apply'
			}

			this.tipArr = [this.specialObj, this.strObj, this.jointObj]
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
