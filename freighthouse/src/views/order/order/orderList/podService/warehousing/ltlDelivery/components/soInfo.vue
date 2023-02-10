<template>
	<div class="soInfo-container">
		<el-table fit style="width: 100%" max-height="200" :data="soList" class="table-cont" :span-method="objectSpanMethod">
			<el-table-column prop="loadContact" label="装货人" align="center" width="100"></el-table-column>
			<el-table-column prop="loadContactPhone" label="装货人电话" align="center" width="150"></el-table-column>
			<el-table-column prop="loadPlace" label="装货地点(到州)" align="center" width="180">
        <template slot-scope="{ row }"> {{ row.loadPlace | mapPlace }}</template>
      </el-table-column>
			<el-table-column prop="loadAddress" label="装货详细地址" align="center" width="200"></el-table-column>
			<el-table-column prop="unloadPlace" label="卸货地点(到州)" align="center" width="180">
        <template slot-scope="{ row }"> {{ row.unloadPlace | mapPlace }}</template>
      </el-table-column>
			<el-table-column prop="unloadAddress" label="卸货详细地址" align="center" width="200"></el-table-column>
			<el-table-column prop="consignee" label="收货人" align="center" width="100"></el-table-column>
			<el-table-column prop="consigneePhone" label="收货人电话" align="center" width="150"></el-table-column>
			<el-table-column prop="consigneeEmail" label="收货人邮箱" align="center" width="150"></el-table-column>
			<el-table-column prop="postCode" label="邮政编码" align="center" width="100"></el-table-column>
			<el-table-column show-overflow-tooltip="" prop="remark" label="备注" align="center"></el-table-column>
			<el-table-column label="操作" align="center" width="80" fixed="right">
				<template slot-scope="scope">
					<div class="operate-group">
						<el-button type="text" size="mini" @click="handleDelete(scope.row)" :disabled="!isOp || isDisabledEdit">删除</el-button>
					</div>
				</template>
			</el-table-column>
		</el-table>
		<!-- <table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip> -->
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import tableTooltip from '@/components/Base/Table/table-tooltip'
export default {
	filters: {
    mapPlace(val) {
      if(val && val.length) {
        return JSON.parse(val).join('')
      } else {
        return ''
      }
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
