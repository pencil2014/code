<template>
	<div class="edit-row podWarehouse-inplan">
		<!-- 仓储 -->
		<div class="btn-group">
			<el-radio-group v-model="isComponent" size="mini">
				<el-radio-button label="WarehouseInPlan">进仓计划</el-radio-button>
				<el-radio-button label="WarehouseIn">实际进仓</el-radio-button>
				<el-radio-button label="WarehouseOutPlan">出仓计划</el-radio-button>
				<el-radio-button label="WarehouseOut">实际出仓</el-radio-button>
				<el-radio-button label="TransporManagement">运输管理</el-radio-button>
			</el-radio-group>
		</div>
		<component :is="isComponent" :activityType="activityType" :orderInfo="orderInfo" :tabMenus="tabMenus" :saveBarFixed="saveBarFixed" @changeComponent="changeComponent"></component>
	</div>
</template>

<script>
import WarehouseInPlan from './warehouseInPlan'
import WarehouseIn from './warehouseIn'
import WarehouseOutPlan from './warehouseOutPlan'
import WarehouseOut from './warehouseOut'
import TransporManagement from './transporManagement'

export default {
	data() {
		return {
			isComponent: 'WarehouseInPlan'
		}
	},
	created() {
		this.init()
	},
	mounted() {},
	computed: {},
	props: {
		activityType: {
			type: String,
			default: ''
		},
		orderInfo: {
			type: Object,
			default: () => ({})
		},
		tabMenus: {
			type: Array,
			default: () => []
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},
	components: {
		WarehouseInPlan,
		WarehouseIn,
		WarehouseOutPlan,
		WarehouseOut,
		TransporManagement
	},
	methods: {
		// 获取so列表
		init() {},
		changeComponent(component, data) {
			this.isComponent = component
		}
		// podWarehouseCallback(item) {
		//   this.$emit('podWarehouseCallback', item)
		// }
	}
}
</script>

<style lang="scss">
.podWarehouse-inplan {
	margin-top: 10px !important;
	padding: 0 10px;
	.btn-group {
		padding: 0;
		.el-radio-button--mini .el-radio-button__inner {
			padding: 3px 15px;
		}
	}
}
</style>
