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
			<el-table-column prop="batchNo" label="进仓编码" align="left"> </el-table-column>
			<el-table-column prop="status_zh" label="进仓状态" align="left"> </el-table-column>
			<el-table-column prop="whName" label="进仓仓库" align="left"> </el-table-column>
			<el-table-column prop="positionNo" label="仓位编码" align="left"> </el-table-column>
			<el-table-column prop="custName" label="客户名称" align="left"> </el-table-column>
			<el-table-column prop="custContact" label="客户联系人" align="left"> </el-table-column>
			<el-table-column prop="custContactPhone" label="客户联系人电话" align="left"> </el-table-column>
			<el-table-column prop="quantity" label="预计进仓件数" align="left" width="100px"> </el-table-column>
			<el-table-column prop="weight" label="预计进仓毛重" align="left" width="100px"> </el-table-column>
			<el-table-column prop="volume" label="预计进仓体积" align="left" width="100px"> </el-table-column>
			<!-- <el-table-column prop="packageType" label="预计包装类型" align="left" width="100px">
				<template slot-scope="scope">
					{{scope.row.packageType | packageTypeFilter}}
				</template>
			</el-table-column> -->
			<el-table-column prop="planEnterTime" label="预计进仓时间" align="left" width="150px"> </el-table-column>
			<el-table-column prop="remark" label="进仓要求" align="left"> </el-table-column>
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