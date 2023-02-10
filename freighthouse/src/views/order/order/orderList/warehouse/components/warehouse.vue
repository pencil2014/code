<template>
	<div class="edit-row warehouse">
		<!-- 仓储 -->
		<div class="btn-group">
			<el-radio-group v-model="isComponent" size="mini">
				<el-radio-button label="WarehouseInplan">进仓计划</el-radio-button>
				<el-radio-button label="WarehouseIn">实际进仓</el-radio-button>
				<el-radio-button label="WarehouseOutPlan">出仓计划</el-radio-button>
				<el-radio-button label="WarehouseOut">实际出仓</el-radio-button>
				<el-radio-button label="Car">运输管理</el-radio-button>
				<el-radio-button label="TabDetail">库存</el-radio-button>
			</el-radio-group>
		</div>
		<component :is="isComponent" :orderInfo="orderInfo" :tabMenus="tabMenus"  @changeComponent="changeComponent" :saveBarFixed="saveBarFixed" warehouseServiceType="pol"></component>
	</div>
</template>

<script>
import WarehouseInplan from './warehouseInplan'
import WarehouseIn from './warehouseIn'
import WarehouseOutPlan from './warehouseOutplan'
import WarehouseOut from './warehouseOut'
import Car from './car'
import TabDetail from '@/views/order/warehouse/warehouseCargo/tabDetail.vue'

export default {
	data() {
		return {
			isComponent: 'WarehouseInplan'
		}
	},
	created() {
		this.init()
	},
	mounted() {},
	props: {
		tabMenus: {
			type: Array,
			default: () => []
		},
		orderInfo: {
			type: Object,
			default: () => ({})
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},
	computed: {},
	components: {
		WarehouseInplan,
		WarehouseIn,
		WarehouseOutPlan,
		WarehouseOut,
		Car,
		TabDetail
	},
	methods: {
		// 获取so列表
		init() {},
		changeComponent(component, data) {
			this.isComponent = component
		}
	}
}
</script>

<style lang="scss">
.warehouse {
	margin-top: 8px !important;
	.btn-group {
		padding: 0 20px;
		.el-radio-button--mini .el-radio-button__inner {
			padding: 3px 15px;
		}
	}
	.table-com-layout {
		padding: 10px 20px 0;
	}
}
</style>
