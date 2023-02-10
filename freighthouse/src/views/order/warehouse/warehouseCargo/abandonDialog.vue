<template>
	<div>
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-form ref="form" :rules="rules" label-width="0" :model="createItem" :show-message="false">
				<el-table id="abandon-table" :data="createItem.list" style="width: 100%">
					<el-table-column prop="cname" label="品名"> </el-table-column>
					<el-table-column prop="lastQuantity" label="库存数"> </el-table-column>
					<el-table-column prop="lastVolume" label="库存体积"> </el-table-column>
					<el-table-column prop="lastWeight" label="库存毛重"> </el-table-column>
					<el-table-column label="弃货数">
						<template slot-scope="scope">
							<el-form-item :prop="'list.' + scope.$index + '.quantity'" :rules="rules.quantity">
								<el-input placeholder="请输入" size="mini" v-model="scope.row.quantity"> </el-input>
							</el-form-item>
						</template>
					</el-table-column>
					<el-table-column label="弃货毛重">
						<template slot-scope="scope">
							<el-form-item :prop="'list.' + scope.$index + '.weight'" :rules="rules.weight">
								<el-input placeholder="请输入" size="mini" v-model="scope.row.weight"> </el-input>
							</el-form-item>
						</template>
					</el-table-column>
					<el-table-column label="弃货体积">
						<template slot-scope="scope">
							<el-form-item :prop="'list.' + scope.$index + '.volume'" :rules="rules.volume">
								<el-input placeholder="请输入" size="mini" v-model="scope.row.volume"> </el-input>
							</el-form-item>
						</template>
					</el-table-column>
				</el-table>
				<el-form-item style="margin-top: 10px" label="弃货原因" label-width="70px" prop="jettisonReason" :rules="rules.jettisonReason">
					<el-input clearable size="mini" maxlength="512" type="textarea" rows="4" show-word-limit v-model="createItem.jettisonReason"></el-input>
				</el-form-item>
			</el-form>
			<div style="margin-top: 10px">
				<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
			</div>
		</BaseDialog>
	</div>
</template>

<script>
const defaultPage = {
	pageSize: 10,
	currPage: 1
}
import { copyArry, getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import Pagination from '@/components/Base/Table/newPagination'
import { validateIntegerQuantityAbandon, checkQuantityWeightVolumeAbandon } from '@/utils/validate'
import { warehouseStockJettison } from '@/api/order/warehouse'
export default {
	data() {
		return {
			rules: {
				jettisonReason: [{ required: true, message: 'jettisonReason', trigger: 'blur' }],
				quantity: [
					{ required: true, message: 'quantity', trigger: 'blur' },
					{ validator: validateIntegerQuantityAbandon(), trigger: 'blur' }
				],
				volume: [
					{ required: true, message: 'volume', trigger: 'blur' },
					{ validator: checkQuantityWeightVolumeAbandon(), trigger: 'blur' }
				],
				weight: [
					{ required: true, message: 'weight', trigger: 'blur' },
					{ validator: checkQuantityWeightVolumeAbandon(), trigger: 'blur' }
				]
			},
			tableConfig: {
				// 分页
				pagination: {
					pageSize: 10,
					show: true,
					total: 0,
					hasNextPage: false,
					hasPreviousPage: false,
					isFirstPage: false,
					isLastPage: false
				}
			},
			dialogConfig: {
				title: '弃货',
				show: true,
				size: 'medium',
				width: '80%'
			},
			createItem: {
				jettisonReason: '',
				list: [{ quantity: 1, volume: 1, weight: 1 }]
			},
			total: null,
			tableQuery: Object.assign({}, defaultPage)
		}
	},
	props: {
		abandonData: {
			type: Array,
			default: () => []
		}
	},
	created() {
		this.getList()
	},
	components: {
		BaseDialog,
		Pagination
	},
	methods: {
		getList() {
			this.createItem.list = JSON.parse(JSON.stringify(this.abandonData))
			this.createItem.list = this.createItem.list.map(item => {
				if (item.lastVolume == 0) {
					item.volume = 0
				}
				if (item.lastWeight == 0) {
					item.weight = 0
				}
				return item
			})
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
						let data = this.createItem.list[0]
						console.log('🚀 ~ data', data)
						console.log('🚀 ~  data.lastQuantity', data.lastQuantity)
						console.log('🚀 ~ data.quantity', data.quantity)
						console.log('🚀 ~ data.quantity > data.lastQuantity', Number(data.quantity) > Number(data.lastQuantity))
						if (Number(data.quantity) > Number(data.lastQuantity)) return this.$message.error('弃货数不能大于库存数量')

						data.jettisonReason = this.createItem.jettisonReason

						warehouseStockJettison(data).then(res => {
							if (res.code === 0) {
								this.$message.success('弃货成功!')
								this.$emit('close', 'Confirm')
							}
						})
					}
				})
			} else {
				this.$emit('close')
			}
		},
		// close(action, value, type) {
		// 	this.$emit('close', action, value, type)
		// },
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 分页
		handleSizeChange() {
			this.getList()
		},
		handleCurrentChange() {
			this.getList()
		}
	}
}
</script>
<style lang="scss" scoped>
#abandon-table {
	.el-form-item {
		margin: 0;
	}
}
</style>
