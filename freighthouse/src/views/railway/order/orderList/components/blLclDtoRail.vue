<template>
	<div class="row-flex-bl ml10">
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">箱型</span>
			</div>
		
			<el-input disabled size="mini"   v-model="createItem.containerType"></el-input>
		</div>
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">箱号</span>
			</div>
			<el-input disabled size="mini"   v-model="createItem.cn"></el-input>
		</div>
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">件数</span>
			</div>
			<el-input disabled size="mini"   v-model="createItem.quantity"></el-input>
		</div>
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">毛重</span>
			</div>
			<el-input disabled size="mini"   v-model="createItem.weight"></el-input>
		</div>
		<div class="flex-item">
			<div class="item-label">
				<span class="lab">体积</span>
			</div>
			<el-input disabled size="mini"   v-model="createItem.volume"></el-input>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	data() {
		return {}
	},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		}
	},
	created() {},

	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole
		}),
		disabledState() {
			return this.isOp || this.isOpTruck || this.isView
		},
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.roles.includes( 'op')
		},
		isOpTruck() {
			return this.ordDetRole === 'op_truck'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		isView() {
			// if (this.oQuery.action === 'view') {
			//   return true
			// }
			if (this.isBd && this.orderStatus !== 'draft') {
				return true
			}
			if (this.isOp && !['pass'].includes(this.orderStatus)) {
				return true
			}
			return false
		}
	},
	watch: {},
	components: {},
	methods: {}
}
</script>

<style lang="scss">
.row-flex-bl {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	.flex-item {
		flex-shrink: 0;
		width: 16%;
		.item-label {
			margin-bottom: 2px;
		}
	}
}
</style>
