<template>
	<div class="default-table">
		<div class="row-tit" v-if="Object.keys(tableInfo).length > 0">
			<span class="tit">{{ tableInfo.title }}</span>
			<div class="row-tit-operate">
				<slot></slot>
				<!-- <template v-for="(item, index) in tableInfo.titleBtnList">
					<el-button :disabled="status === 'finish' || (!isOpTruck && !isOp)" size="mini" style="margin-left: 10px;" v-if="!item.hide" :key="index" :type="item.type || 'default'" @click="handleClick(item.key)">{{ item.label }}</el-button>
				</template> -->
				<template v-if="tableInfo.titleBtnList && tableInfo.titleBtnList.length > 0">
					<ButtonTip v-for="(item, index) in tableInfo.titleBtnList" :key="index"
						:btnType="item.type || 'default'" 
						:btnDisabled="status === 'finish' || (!isOpTruck && !isOp)" 
						:btnText="item.label" 
						:tipContent="isOpTruckAndOpTip || isOutTip" 
						class="operateBtn-tip ml10" 
						@click="handleClick(item.key)">
					</ButtonTip>
				</template>
			</div>
		</div>
		<div class="row-table">
			<el-table :span-method="objectSpanMethod" @selection-change="handleSelectionChange" ref="inPlanBox" fit style="width: 100%" class="inPlanBoxTable" :data="tableConfig.list">
				<el-table-column type="selection"></el-table-column>
				<el-table-column prop="containerType" label="箱型" align="center">
					<template slot-scope="scope">
						<!-- <el-select size="mini" v-model="scope.row.containerType" placeholder="请选择箱型" clearable filterable>
							<el-option v-for="(item, index) in dictMap.containerType" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select> -->
						<span class="container-type-cell" @click="handleClick('cell', scope.row.containerId)">{{ scope.row.containerType }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="so" label="SO号" align="center"> </el-table-column>
				<el-table-column prop="inBatchNo" label="进仓编码" align="center"></el-table-column>
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
				<el-table-column prop="lastQuantity" label="剩余库存件数" align="center"></el-table-column>
				<el-table-column prop="quantity" label="预计出仓件数" align="center">
					<template slot-scope="scope">
						<el-input size="mini" placeholder="请输入件数" v-model.number="scope.row.quantity" clearable @blur="handleValidateNum(scope.row, scope.$index, 'quantity')"></el-input>
					</template>
				</el-table-column>
				<el-table-column prop="packageType" label="预计出仓包装" align="center">
					<template slot-scope="scope">
						<el-select size="mini" v-model="scope.row.packageType" placeholder="请选择包装" clearable filterable>
							<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="150" align="center" fixed="right">
					<template slot-scope="scope">
						<div class="operate-group">
							<ButtonTip
								btnType="text" 
								:btnDisabled="(!isOpTruck && !isOp) || status === 'finish'" 
								btnText="添加出仓货品" 
								:tipContent="isOpTruckAndOpTip || isOutTip" 
								class="operateBtn-tip" 
								@click="handleAddCargo(scope.row, scope.$index)">
							</ButtonTip>
							<!-- <el-button @click="handleAddCargo(scope.row, scope.$index)" type="text" size="mini" :disabled="(!isOpTruck && !isOp) || status === 'finish'">添加出仓货品</el-button> -->
							<ButtonTip
								btnType="text" 
								:btnDisabled="(!isOpTruck && !isOp) || status === 'finish'" 
								btnText="删除" 
								:tipContent="isOpTruckAndOpTip || isOutTip" 
								class="operateBtn-tip" 
								btnClassName="red"
								@click="handleDelete(scope.row, scope.$index)">
							</ButtonTip>
							<!-- <el-button class="delete-btn" @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="(!isOpTruck && !isOp) || status === 'finish'">删除</el-button> -->
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

export default {
	data() {
		return { pos: 0, containerIdSpanArr: [], multipleSelection: [] }
	},
	props: {
		status: '',
		tableInfo: {
			type: Object,
			default: () => ({})
		},
		tableConfig: {
			type: Object,
			default: () => ({})
		},
		isJoint: {
			type: Boolean,
			default: false
		},
		isOpTruckAndOpTip: {
			type: String,
			default: ''
		}
	},
	created() {
		//出仓计划默认新增一条数据
		if (this.tableConfig.list.length == 0) {
			this.$emit('tableClick', 'add')
		}
	},

	mounted() {
		console.log('🚀 ~ this.tableConfig.list', this.tableConfig.list)
	},
	watch: {
		'tableConfig.list': {
			handler(newVal) {
				this.getSpanArr(newVal)
			},
			deep: true,
			immediate: true
		}
	},
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
		},
		isOutTip() {
			if (this.status === 'finish') {
				return '该进出仓计划已实际出仓了，不允许操作'
			}
		}
	},
	components: {},
	methods: {
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			if ([0, 1, 2].includes(columnIndex)) {
				//用于设置要合并的列
				const _row = this.containerIdSpanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row, //合并的行数
					colspan: _col //合并的列数，设为0则直接不显示
				}
			}
		},
		// 储存合并相同的箱号的id
		getSpanArr(data) {
			/*  
        如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
        如果不是第一条记录，则判断它与前一条记录是否相等，
        如果相等，则向spanArr中添入元素0，并将前一位元素+1，表示合并行数+1，
        以此往复，得到所有行的合并数，0即表示该行不显示。
    */
			this.containerIdSpanArr = []
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					this.containerIdSpanArr.push(1) //containerIdSpanArr是一个空数组，用于存放每一行记录的合并数
					this.pos = 0 //pos是containerIdSpanArr的索引
				} else {
					// 判断箱号当前元素与上一个元素是否相同
					if (data[i].containerId === data[i - 1].containerId) {
						this.containerIdSpanArr[this.pos] += 1
						this.containerIdSpanArr.push(0)
					} else {
						this.containerIdSpanArr.push(1)
						this.pos = i
					}
				}
			}
			console.log(this.containerIdSpanArr)
		},
		handleAddCargo(row, index) {
			this.$emit('addCargo', row, index)
		},
		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
			console.log('🚀 ~ this.multipleSelection', this.multipleSelection)
		},
		handleClick(type, id) {
			this.$emit('tableClick', type, id)
		},
		cnameClick(row, index) {
			this.$emit('cnameClick', index)
		},
		handleValidateNum(row, index, field) {
			this.$emit('handleValidateNum', index, field)
		},
		handleDelete(row, index) {
			this.$emit('delete', row, index)
		}
	}
}
</script>
<style lang="scss">
.default-table {
	.container-type-cell {
		color: #1890ff;
		cursor: pointer;
	}
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
	.operate-group .delete-btn {
		color: #ff0000;
	}
}
</style>
