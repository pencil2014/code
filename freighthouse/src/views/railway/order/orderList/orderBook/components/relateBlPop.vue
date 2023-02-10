<template>
	<BaseDialog id='relate-list-dlg' :config="dialogConfig" :callback="dialogCallback">
	<div v-if="relateList.length===0" class="no-relate-data">暂无数据</div>
		<el-checkbox-group v-model="checkList">
			<el-checkbox v-for="item in relateList" :key="item" :label="item"></el-checkbox>
		</el-checkbox-group>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { blDeliveryCancel } from '@/api/order/bl'

export default {
	data() {
		return {
			checkList: [],
			oQuery: this.$route.query,
			dialogConfig: {
				title: '关联提单列表',
				show: true,
				size: 'medium',
				width: "800px"
			}
		}
	},
	props: {
		relateList: {
			type: Array,
			default: () => []
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.close('Confirm', this.checkList)
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>

<style>
#relate-list-dlg .el-checkbox-group{
	display: flex;
	flex-wrap: wrap;
}
#relate-list-dlg .el-checkbox-group .el-checkbox{
	flex-basis: 20%;
}
#relate-list-dlg .no-relate-data{
	text-align: center;
}
</style>
