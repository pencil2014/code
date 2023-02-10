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
			jointObj: {
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
			this.jointObj = {
				value: '',
				icon: ''
			}

			if (val.dnCheckStatus === 'refuse') {
				this.strObj.value = '拒'
				this.strObj.icon = 'icon-tip icon-change'
			}
			if (val.changeFlag === 1) {
				this.strObj.value = '改'
				this.strObj.icon = 'icon-tip icon-change'
			}

			if (val.jointNo) {
				this.jointObj.value = '协'
				this.jointObj.icon = 'icon-tip icon-joint2'
			}

			this.tipArr = [this.strObj, this.jointObj]
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
