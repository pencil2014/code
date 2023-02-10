<template>
	<el-table fit class="plan-table" style="width: 100%;" :data="tableData" :span-method="objectSpanMethod">
		<el-table-column prop="orderNo" label="工作号" align="left" width="200">
			<template slot-scope="scope">
				<el-button type="text" size="mini" @click="handleInfo(scope.row)">{{ scope.row.orderNo }}</el-button>
			</template>
		</el-table-column>
		<el-table-column prop="matterName" label="待办事项" align="left"></el-table-column>
		<el-table-column label="提单号" align="left">
			<template slot-scope="scope">
				<span>{{ scope.row.infoData && scope.row.infoData.blNo }}</span>
			</template>
		</el-table-column>
		<el-table-column label="取单状态" align="left">
			<template slot-scope="scope">
				<span>{{ getStatus(scope.row.infoData) }}</span>
			</template>
		</el-table-column>
	</el-table>
</template>
<script>
import { getDictLabel } from '@/utils/tools'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { planMixin } from '@/views/order/order/orderList/planorder/planMixin'

export default {
	mixins: [routerMixin, planMixin],
	data() {
		return {
			orderNoSapnArr: [],
			pos: ''
		}
	},
	props: {
		tableData: {
			type: Array,
			default: () => []
		}
	},
	created() {},
	mounted() {},
	destroyed() {},
	computed: {},
	watch: {
		tableData: {
			handler(newVal, oldVal) {
				this.getSpanArr(newVal)
			},
			deep: true
		}
	},
	components: {},
	methods: {
		getSpanArr(data) {
			/*  
        如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
        如果不是第一条记录，则判断它与前一条记录是否相等，
        如果相等，则向spanArr中添入元素0，并将前一位元素+1，表示合并行数+1，
        以此往复，得到所有行的合并数，0即表示该行不显示。
    */
			this.orderNoSapnArr = []
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					this.orderNoSapnArr.push(1) //orderNoSapnArr是一个空数组，用于存放每一行记录的合并数
					this.pos = 0 //pos是orderNoSapnArr的索引
				} else {
					if (data[i].orderNo === data[i - 1].orderNo) {
						this.orderNoSapnArr[this.pos] += 1
						this.orderNoSapnArr.push(0)
					} else {
						this.orderNoSapnArr.push(1)
						this.pos = i
					}
				}
			}
			console.log(this.orderNoSapnArr)
		},
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			if ([0, 1].includes(columnIndex)) {
				//用于设置要合并的列
				const _row = this.orderNoSapnArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row, //合并的行数
					colspan: _col //合并的列数，设为0则直接不显示
				}
			}
		},
		handleInfo(row) {
			this.isJumpRouteFromPage = true
			this.handleToOrderDetail(row)
		},
		getStatus(infoData) {
			return infoData && infoData.status === 'finish' ? '已取单' : '未取单'
		},
		vgmCutOffFormat(row) {
			let result = ''
			if (row.vgmCutOff) {
				result = row.vgmCutOff.slice(0, 13)
			}
			return result
		}
	}
}
</script>
<style lang="scss"></style>
