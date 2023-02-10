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
			<el-table-column prop="batchNo" label="进仓编码" align="left" width="150px"> </el-table-column>
			<el-table-column prop="whName" label="进仓仓库" align="left"> </el-table-column>
			<el-table-column prop="positionNo" label="仓位编码" align="left"> </el-table-column>
			<!-- <el-table-column prop="whBatchNo" label="外部仓库编码" align="left"> </el-table-column> -->
			<el-table-column prop="custName" label="客户名称" align="left"> </el-table-column>
			<el-table-column prop="custContact" label="客户联系人" align="left"> </el-table-column>
			<el-table-column prop="custContactPhone" label="客户联系人电话" align="left"> </el-table-column>
			<el-table-column prop="quantity" label="进仓件数" align="left"> </el-table-column>
			<el-table-column prop="weight" label="实际进仓毛重" align="left"> </el-table-column>
			<el-table-column prop="volume" label="实际进仓体积" align="left"> </el-table-column>
			<!-- <el-table-column prop="packageType" label="实际包装类型" align="left">
				<template slot-scope="scope">
					{{scope.row.packageType | packageTypeFilter}}
				</template>
			</el-table-column> -->
			<el-table-column prop="realEnterTime" label="实际进仓时间" align="left" width="150"> </el-table-column>
			<el-table-column prop="remark" label="实际进仓备注" align="left"> </el-table-column>
		</el-table>
	</div>
</template>

<script>
import { getDictLabel } from '@/utils/tools'
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