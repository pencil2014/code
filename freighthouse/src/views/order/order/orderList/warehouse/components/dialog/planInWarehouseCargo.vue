<template>
	<div class="default-table">
		<div class="row-tit" v-if="Object.keys(tableInfo).length > 0">
			<span class="tit">{{ tableInfo.title }}</span>
			<div class="row-tit-operate">
				<slot></slot>
				<template v-if="tableInfo.titleBtnList && tableInfo.titleBtnList.length > 0">
					<ButtonTip v-for="(item, index) in tableInfo.titleBtnList" :key="index"
						:btnType="item.type || 'default'" 
						:btnDisabled="(!isOp && !isOpTruck) || status === 'finish'" 
						:btnText="item.label" 
						:tipContent="isOpTruckAndOpTip || isInTip" 
						class="operateBtn-tip ml10" 
						@click="handleClick(item.key)">
					</ButtonTip>
					<!-- <template v-for="(item, index) in tableInfo.titleBtnList">
						<el-button :disabled="status === 'finish' || (!isOpTruck && !isOp)" size="mini" style="margin-left: 10px;" v-if="!item.hide" :key="index" :type="item.type || 'default'" @click="handleClick(item.key)">{{ item.label }}</el-button>
					</template> -->
				</template>
			</div>
		</div>
		<div class="row-table">
			<el-table ref="inPlanBox" fit style="width: 100%" class="inPlanBoxTable" :data="tableConfig.list">
				<el-table-column prop="cname" label="品名" align="center">
					<template slot-scope="scope">
						<el-input size="mini" placeholder="点击添加品名" v-model="scope.row.cname" @focus="cnameClick(scope.row, scope.$index)"></el-input>
					</template>
				</el-table-column>
				<el-table-column prop="mark" label="唛头" align="center">
					<template slot-scope="scope">
						<el-input size="mini" placeholder="请输入唛头" v-model="scope.row.mark" clearable disabled></el-input>
					</template>
				</el-table-column>
				<el-table-column prop="quantity" label="预计进仓件数" align="center">
					<template slot-scope="scope">
						<el-input size="mini" placeholder="请输入件数" v-model.number="scope.row.quantity" clearable @blur="validateNum('quantity', scope.row)"></el-input>
					</template>
				</el-table-column>
				<el-table-column prop="packageType" label="预计包装类型" align="center">
					<template slot-scope="scope">
						<el-select size="mini" v-model="scope.row.packageType" placeholder="请选择包装" clearable filterable>
							<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="150" align="center" fixed="right">
					<template slot-scope="scope">
						<div class="operate-group">
							<ButtonTip v-if="isOp || isOpTruck"
								btnType="text" 
								:btnDisabled="(!isOp && !isOpTruck) || status === 'finish'" 
								btnText="删除" 
								:tipContent="isOpTruckAndOpTip || isInTip" 
								class="operateBtn-tip" 
								@click="handleDelete(scope.row, scope.$index)">
							</ButtonTip>
							<!-- <el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="(!isOpTruck && !isOp) || status === 'finish'" v-if="isOp || isOpTruck">删除</el-button> -->
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import {quantityMixin} from '@/views/order/order/mixins/quantityMixin'

export default {
	mixins: [quantityMixin],
	data() {
		return {}
	},
	props: {
		tableInfo: {
			type: Object,
			default: () => ({})
		},
		tableConfig: {
			type: Object,
			default: () => ({})
		},
		status: '',
		isJoint: {
			type: Boolean,
			default: false
		},
		isOpTruckAndOpTip: {
			type: String,
			default: ''
		},
		isInTip: {
			type: String,
			default: ''
		}
	},
	created() {
		//新增的时候默认添加一条数据
		if (this.tableConfig.list.length == 0) {
			this.$emit('tableClick', 'add')
		}
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs')
		},
		isOpTruck() {
			return this.userEditRoles.includes('op_truck')
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.isDoc || this.isAc
		}
	},
	components: {},
	methods: {
		handleClick(type) {
			this.$emit('tableClick', type)
		},
		cnameClick(row, index) {
			this.$emit('cnameClick', index)
		},
		handleDelete(row, index) {
			this.$emit('delete', row, index)
		}
	}
}
</script>
<style lang="scss">
.default-table {
	.row-tit {
		border: unset !important;
	}
	.row-table {
		padding: 0 10px;
		.el-table {
			display: grid;
		}
	}
	.operate-group .el-button--mini {
		padding: 0;
	}
}
</style>
