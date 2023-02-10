<template>
	<div class="table-layout" ref="tableMultiLayout">
		<Table ref="multipleTable" :config="config" :tableQuery="tableQuery" :callback="tableCallback">
			<!-- table多选操作-->
			<template v-slot:MutiSelectSlot>
				<MutiSelect :options="config.options" />
			</template>
		</Table>
	</div>
</template>

<script>
import Table from './vxeTable';
import MutiSelect from './vxeMutiSelect';
import BtnSelected from './btnSelected';
import { unique } from '@/utils/index'

export default {
	name: 'TableMuti',
	data() {
		return {
			multipleSelection: [] // 多行选中
		}
	},
	props: {
		config: {
			type: Object,
			default: () => ({})
		},
		tableQuery: {
			type: Object,
			default: () => ({})
		},
		callback: {
			type: Function,
			default: () => ({})
		}
	},
	mounted() {
	},
	components: {
		Table,
		MutiSelect,
		BtnSelected
	},
	computed: {
	},
	methods: {
		// table
		tableCallback(action, data) {
			let fn = this[`handle${action}`]
			fn && fn(data)
			this.callback(action, data)
		},

		// 关联触发 {提示选中信息}
		handleMuti(data) {
			if(this.config.uniqueProp){
				data =unique(data,this.config.uniqueProp).filter(el=>el.$isRowCheck)
			}
			this.multipleSelection = data;
			let {tips} = this.config;
			
			Object.assign(this.config, {
				tips: Object.assign({}, {
					show: data.length ? true : false,
					text: data.length ? `已选择 ${data.length} 项` : ''
				})
			})
		},

		// 取消多行选中
		handleClearSelection() {
			Object.assign(this.config, {
				tips: Object.assign({}, {
					show: false,
					text: ''
				})
			})
		}
	}
}
</script>

<style lang="scss">
@import '../less/table_layout.scss';
</style>
