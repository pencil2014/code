<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="exportForm" :rules="rules" :model="createItem" label-position="right" label-width="95px" class="orderBlExport-form">
			<el-form-item label="工作号" prop="orderNo">
				<el-select v-model="createItem.orderNo" remote size="mini" clearable placeholder="请选择" style="width: 100%" filterable :filter-method="orderNoFilterMehod">
					<el-option v-for="(item, index) in orderNoList" :key="index" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { blcreateList } from '@/api/order/bl'

export default {
	data() {
		return {
			orderNoList: [],
			dialogConfig: {
				title: '新增提单',
				show: true,
				size: 'medium'
				// width: "800px"
			},
			createItem: { orderNo: '' },
			rules: {
				orderNo: [{ required: true, message: '请填写工作号', trigger: 'blur' }]
			}
		}
	},
	props: {},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		orderNoFilterMehod(val) {
			console.log('🚀 ~ val', val)
			this.getOrderNoList(val)
		},

		getOrderNoList(val = '') {
			blcreateList({
				orderNo: val
			}).then(res => {
				if (res.data && res.data.length > 0) {
					this.orderNoList = res.data.map(item => {
						return {
							label: item,
							value: item
						}
					})
				}
			})
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.exportForm.validate(valid => {
					if (valid) {
						this.close('Confirm', this.createItem)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>

<style>
.orderBlExport-form .el-radio__label {
	font-size: 12px;
}
</style>
