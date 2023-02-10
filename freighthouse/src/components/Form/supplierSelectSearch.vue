<template>
	<el-form-item :prop="keys">
		<el-select size="mini" style="width: 225px" v-model="value" filterable remote clearable placeholder="请选择供应商" :remote-method="getSupplierList" @change="supplierChange" @visible-change="getSupplierList">
			<el-option v-for="item in supplierList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
		</el-select>
	</el-form-item>
</template>

<script>
export default {
	props: {
		keys: {
			type: String,
			default: 'supplierId'
		},

		supplierId: [Number, String],
		supplierName: [String],
		paramCategory: [String],
		paramValue: [String],
		paramCategoryType: [String]
	},
	watch: {
		supplierId() {
			this.value = this.supplierId
		}
	},
	data() {
		return {
			supplierList: [],
			value: this.supplierId,
			initFlag: true
		}
	},
	methods: {
		// 供应商模糊查询
		getSupplierList(val) {
			if (val === true) val = ''
			this.$store.dispatch('dict/querySupplierList', { category: this.paramCategory, value: this.paramValue, queryString: val || '' }).then(data => {
				let list = data.list
				this.supplierList = list.map(item => {
					return {
						value: item.supplierId,
						label: this.$language == 'en' ? item.ename : item.name
					}
				})
				// if (this.initFlag) {
				// 	// 回显问题
				// 	let obj = this.supplierList.find(item => {
				// 		return item.value === this.value
				// 	})
				// 	if (!obj) {
				// 		this.supplierList.push({
				// 			value: this.value,
				// 			label: this.supplierName
				// 		})
				// 	}
				// }
				// this.initFlag = false
			})
		},
		supplierChange(value) {
			console.log('改变了', value)
			this.$emit('update:supplierId', this.value)
			this.$emit('update:supplierName', this.getSupplierName())
		},
		getSupplierName() {
			let obj = this.supplierList.find(item => {
				return item.value === this.value
			})
			return (obj && obj.label) || ''
		}
	}
}
</script>

<style></style>
