import { abroadCompanyList } from '@/api/order/list'
export const overSeaMixin = {
	data() {
		return {
			supplierList: [],
			abroadCompanyList: []
		}
	},
	created() {
		// 海外分公司
		this.getAbroadCompanyList()
	},
	methods: {
		getAbroadCompanyList() {
			// 海外分公司
			abroadCompanyList({ isAbroad: 'yes' }).then(res => {
				if (res.data) {
					this.abroadCompanyList = res.data.map(item => {
						return { ...item, overseasCompanyName: item.companyName, overseasCompanyCode: item.companyCode }
					})
					console.log('🚀 ~ 	this.abroadCompanyList', this.abroadCompanyList)
				}
			})
		},
		// 选择海外分公司
		changeOverseasCompany(val) {
			let item = this.abroadCompanyList.find(item => item.companyCode == val)
			if (item) {
				this.formData.overseasCompanyName = item.companyName
			} else {
				this.formData.overseasCompanyName = ''
			}
		},

		handleSelectSupplierName(val) {
			let item = this.supplierList.find(item => item.value == val)
			if (item) {
				this.formData.overseaAgentSupplierName = item.label
			} else {
				this.formData.overseaAgentSupplierName = ''
			}
		},
		supplierFilterMehod(val) {
			console.log('🚀 ~ val', val)
			if (this.formData.overseaAgentSupplierName && !val) {
				val = this.formData.overseaAgentSupplierName
			}
			// 没有值 不请求数据
			if (!val) {
				return false
			}
			this.getSupplierList(val)
		},

		getSupplierList(val = '') {
			this.$store
				.dispatch('dict/querySeviceOverseaList', {
					category: 'category',
					value: 'overseas_agent',
					queryString: val
				})
				.then(data => {
					this.supplierList = data.list
					this.supplierList.forEach(item => {
						Object.assign(item, {
							label: item.name,
							value: item.supplierId
						})
					})
				})
		}
	}
}
