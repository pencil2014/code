<template>
	<div class="soInfo-container">
		<!-- <el-collapse v-model="activeNames">
      <el-collapse-item title="SO信息" name="soInfo">
        <el-table fit :show-overflow-tooltip="true" style="width: 100%" :data="soList" class="table-cont">
          <el-table-column prop="so" label="so号" align="center"> </el-table-column>
          <el-table-column prop="polPortName" label="起运港" align="center"> </el-table-column>
          <el-table-column prop="podPortName" label="目的港" align="center"> </el-table-column>
          <el-table-column prop="containerInfo" label="箱型箱量" align="center"> </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse> -->
		<el-table fit style="width: 100%" max-height="190" :data="soList" class="table-cont" :span-method="objectSpanMethod" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
			<el-table-column prop="intrustTruckType" label="派车类型" align="center" width="100">
				<template slot-scope="{ row }">
					{{ row.intrustTruckType | getDictLabelFilter('intrustTruckType') }}
				</template>
			</el-table-column>
			<el-table-column prop="so" label="so号" align="center"></el-table-column>
			<el-table-column prop="containerType" label="箱型箱量" align="center" width="150"></el-table-column>
			<el-table-column prop="isDangerous" label="是否孖拖" align="center" width="150">
				<template slot-scope="scope">
					{{ scope.row.isTwinDrag === 'y' ? '是' : '否' }}
					{{ scope.row.boxPosition ? ',' + scope.row.boxPosition : '' }}
				</template>
			</el-table-column>
			<el-table-column prop="isDangerous" label="是否危险品" align="center" width="150">
				<template slot-scope="scope">
					{{ scope.row.isDangerous === 'yes' ? '是' : '否' }}
				</template>
			</el-table-column>
			<el-table-column prop="customsSupplierName" label="意向供应商" align="center" width="150"></el-table-column>
			<el-table-column prop="containerType" label="买单意向价格" align="center" width="150">
				<template slot-scope="{ row }"> {{ row.customsPrice }} {{ row.customsUnit }} </template>
			</el-table-column>
			<!-- <el-table-column prop="polPortName" label="起运港" align="center"></el-table-column>
      <el-table-column prop="podPortName" label="目的港" align="center"></el-table-column> -->
			<el-table-column prop="preBoxTime" label="委托装柜时间" align="center" width="150"></el-table-column>
			<el-table-column prop="takePreTime" label="预计提柜时间" align="center" width="150"></el-table-column>
			<el-table-column prop="boxContact" label="装货人" align="center"></el-table-column>
			<el-table-column prop="boxContactPhone" label="装货人电话" align="center" width="100"></el-table-column>
			<el-table-column label="装货地点" align="center" width="150">
				<template slot-scope="scope">
					{{ scope.row.boxCountry + scope.row.boxProvince + scope.row.boxCity + scope.row.boxDistrict }}
				</template>
			</el-table-column>
			<el-table-column prop="boxAddress" label="装货详细地址" align="center" width="150"></el-table-column>
			<el-table-column prop="isWeighted" label="是否过磅" align="center">
				<template slot-scope="scope">
					{{ scope.row.isWeighted | weightAndWoodenPackageFilter }}
				</template>
			</el-table-column>
			<el-table-column prop="weight" label="预计货重(KG)" align="center" width="120"></el-table-column>
			<el-table-column prop="remark" label="委派备注" align="center" width="150"></el-table-column>
			<el-table-column prop="isWoodenPackage" label="木质包装" align="center">
				<template slot-scope="scope">
					{{ scope.row.isWoodenPackage | weightAndWoodenPackageFilter }}
				</template>
			</el-table-column>
			<el-table-column prop="customsType" label="报关方式" align="center">
				<template slot-scope="scope">
					{{ scope.row.customsType | customsTypeFilter }}
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" width="80" fixed="right">
				<template slot-scope="scope">
					<div class="operate-group">
						<ButtonTip
							btnType="text" 
							:btnDisabled="!isOp || isDisabledEdit" 
							btnText="删除" 
							:tipContent="isOpTip || isFinishTip || statusTip" 
							class="operateBtn-tip" 
							btnClassName="red"
							@click="handleDelete(scope.row)">
						</ButtonTip>
						<!-- <el-button type="text" size="mini" @click="handleDelete(scope.row)" :disabled="!isOp || isDisabledEdit">删除</el-button> -->
					</div>
				</template>
			</el-table-column>
		</el-table>
		<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import tableTooltip from '@/components/Base/Table/table-tooltip'
export default {
	filters: {
		customsTypeFilter(customsType) {
			return getDictLabel('customsType', customsType)
		},
		weightAndWoodenPackageFilter(val) {
			const obj = {
				y: '是',
				n: '否'
			}
			return obj[val] || ''
		}
	},
	data() {
		return {
			activeNames: '1',
			mergeSpanArr: [],
			pos: 0,
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			}
		}
	},
	props: {
		soList: {
			type: Array,
			default: () => []
		},
		isDisabledEdit: {
			type: Boolean,
			default: false
		},
		isOpTip: {
			type: String,
			default: ''
		},
		isFinishTip: {
			type: String,
			default: ''
		},
		statusTip: {
			type: String,
			default: ''
		}
	},
	activated() {},
	created() {
		this.getSpanArr(this.soList)
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles
		}),
		isOp() {
			// return this.ordDetRole === 'op'
			return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs')
		}
	},
	components: {
		tableTooltip
	},
	watch: {
		soList: {
			handler(newVal) {
				this.getSpanArr(newVal)
			},
			deep: true,
			immediate: true
		}
	},
	methods: {
		// 鼠标移入cell
		showTooltip(row, column, cell) {
			this.tableCellMouse.cellDom = cell
			this.tableCellMouse.row = row
			this.tableCellMouse.hidden = false
		},
		// 鼠标移出cell
		hiddenTooltip() {
			this.tableCellMouse.hidden = true
		},
		// 储存合并相同的委派信息
		getSpanArr(data) {
			/*  
        如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
        如果不是第一条记录，则判断它与前一条记录是否相等，
        如果相等，则向spanArr中添入元素0，并将前一位元素+1，表示合并行数+1，
        以此往复，得到所有行的合并数，0即表示该行不显示。
    */
			this.mergeSpanArr = []
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					this.mergeSpanArr.push(1) //mergeSpanArr是一个空数组，用于存放每一行记录的合并数
					this.pos = 0 //pos是mergeSpanArr的索引
				} else {
					// 判断mergeId当前元素与上一个元素是否相同
					if (data[i].mergeId && data[i - 1].mergeId && data[i].mergeId === data[i - 1].mergeId) {
						this.mergeSpanArr[this.pos] += 1
						this.mergeSpanArr.push(0)
					} else {
						this.mergeSpanArr.push(1)
						this.pos = i
					}
				}
			}
			console.log(this.mergeSpanArr)
		},
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			// 箱号，附件列需合并
			if ([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].includes(columnIndex)) {
				//用于设置要合并的列
				const _row = this.mergeSpanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row, //合并的行数
					colspan: _col //合并的列数，设为0则直接不显示
				}
			}
		},
		handleDelete(row) {
			this.$emit('delete', row)
		}
	}
}
</script>
<style lang="scss">
.soInfo-container {
	padding: 0 20px;
	background-color: #fff;
	margin-top: 8px;
}
// .soInfo-container .el-collapse {
//   border-top: 0;
// }
// .soInfo-container .el-collapse-item__header {
//   height: 28px;
//   line-height: 28px;
//   padding: 0 10px 0 20px;
//   border-bottom: 0;
//   font-weight: 700;
//   font-size: 12px;
// }
// .soInfo-container .el-collapse-item__content{
//   padding: 8px 20px;
// }
// .soInfo-container .el-collapse-item__header.is-active {
//   border-bottom: 1px solid #e6ebf5;
// }
// .soInfo-container .table-cont {
//   padding: 0 20px;
// }
.soInfo-container .table-cont th {
	height: 24px;
	line-height: 16px;
	padding: 2px 0;
}
.soInfo-container .table-cont td {
	line-height: 16px;
	padding: 2px 0;
}
.soInfo-container .table-cont .cell {
	display: block;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
</style>
