<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<!-- <div class="">是否要对以下提单进行批量放单完成操作？</div> -->
		<div class="">是否要进行批量放单完成操作？</div>
		<div class="blNo-list" v-for="(item, index) in blList" :key="index">
			<!-- <el-col v-if="takeType === 'TRADE'" :span="16">
				<span>订单号：</span>
				{{ item.orderNo }}
				<span v-if="item.blNo"
					>(提单号：
					<i class="icon-hbl2">{{ item.blType === 'hbl' ? 'H' : item.blType === 'mbl' ? 'M' : '' }}</i>
					{{ item.blNo }})
				</span>
			</el-col> -->
			<el-col :span="12">
				<span>提单号：</span>
				<i :class="item.blType ? 'icon-hbl2' : ''">{{ item.blType === 'hbl' ? 'H' : item.blType === 'mbl' ? 'M' : '' }}</i>
				{{ item.blNo }}
			</el-col>

			<el-col :span="12"><span style="padding-left:10px;">委托单位：</span>{{ item.custName }}</el-col>
		</div>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'

export default {
	filters: {},
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '批量放单完成',
				show: true,
				size: 'medium',
				width: '600px'
			}
		}
	},
	props: {
		blList: {
			type: Array,
			default: () => []
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({})
	},
	components: {
		BaseDialog
	},
	watch: {},
	methods: {
		close(action) {
			this.$emit('close', action)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.close('Confirm', done)
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>
<style lang="scss" scoped>
.blNo-list {
	font-size: 12px;
	margin-top: 10px;
	line-height: 24px;
}
.blNo-list span {
	color: #999;
}
</style>
