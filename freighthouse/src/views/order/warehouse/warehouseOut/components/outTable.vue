<template>
	<div class="table-com-layout">
		<el-table
			fit
			:data="tableData"
			row-key="oid"
			:tree-props="{children: 'warehouseInplanItems', hasChildren: 'hasChildren'}"
			align="left"
			style="width: 100%">
			<el-table-column prop="orderNo" label="工作号" align="left" width="150px"> </el-table-column>
			<el-table-column prop="planNo" label="进仓计划编号" align="left" width="150px"> </el-table-column>
			<el-table-column prop="batchNo" label="出仓编码" align="left"> </el-table-column>
			<el-table-column prop="warehouseName" label="出仓仓库" align="left"> </el-table-column>
			<el-table-column prop="positionNo" label="仓位编码" align="left"> </el-table-column>
			<!-- <el-table-column prop="whBatchNo" label="外部仓库编码" align="left"> </el-table-column> -->
			<!-- <el-table-column prop="cname" label="品名" align="left"> </el-table-column>
			<el-table-column prop="mark" label="唛头" align="left"> </el-table-column> -->
			<el-table-column prop="totalQuantity" label="实际出仓件数" align="left"> </el-table-column>
			<el-table-column prop="totalWeight" label="实际出仓毛重" align="left"> </el-table-column>
			<el-table-column prop="totalVolume" label="实际出仓体积" align="left"> </el-table-column>
			<!-- <el-table-column prop="packageType" label="实际出仓包装" align="left">
				<template slot-scope="scope">
					{{scope.row.packageType | packageTypeFilter}}
				</template>
			</el-table-column> -->
			<el-table-column prop="outTime" label="实际出仓时间" align="left" width="150"> </el-table-column>
		</el-table>
	</div>
</template>

<script>
import {getDictLabel} from '@/utils/tools'
export default {
	filters: {
		packageTypeFilter(packageType) {
			return getDictLabel('packageType', packageType)
		}
	},
	data() {
		return {

		}
	},
	props: {
		tableData: {
			type: Array,
			default: () => {[]}
		}
	}
}
</script>