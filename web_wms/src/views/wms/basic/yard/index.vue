<template>
	<div class="assign-wrap" v-loading="loading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
		<div>
			<FinanceSearch :searchOption="searchOption1" @search="search" />
			<div class="finance-search-list-gap"></div>
			<div class="finance-list-container">
				<div class="money-box">
					<div class="money-box-left">
						<el-button @click="toAdd" size="mini" type="primary">新增</el-button>
					</div>
					<div class="money-box-right">
						<el-button @click="refreshListPage" size="mini" type="primary">刷新</el-button>
					</div>
				</div>
				<FinanceTable :option="option1" @send-multi="sendMulti" />
			</div>
		</div>

		<div v-if="showEdit">
			<edit :formData="formData" :isEdit="isEdit" @submit="handleSubmit" @close="handleClose" />
		</div>
	</div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/mixins/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { yardQueryPage, wharfYardModify, wharfYardAdd } from '@/api/wms'
import { countrySelectList, getDomesticCity, getForeignCity } from '@/api/base'
import Edit from './edit.vue'

export default {
	mixins: [mixin, mixin2],
	data() {
		return {
			formData: {
				wharfYardId: '',
				wharfYardName: '',
				wharfYardEname: '',
				wharfYardType: '',
				countryCode: '',
				countryName: '',
				provinceCode: '',
				provinceName: '',
				cityCode: '',
				cityName: '',
				address: '',
				phone: '',
				webUrl: '',
				wharfYardCode: ''
			},
			isEdit: false,
			showEdit: false,
			option1: {},
			searchOption1: {},
			loading: false,
			multipleSelection1: []
		}
	},
	watch: {},
	created() {
		this.searchOption1 = {
			saveName: 'YardList',
			saveShow: false,
			// saveDefault: true,
			listHeightFunc: this.computeFinTableHeight,
			addFilter: {
				defaultSearchLength: 6,
				searchInputGroup: [
					// { key: 'countryName', value: '中国', showType: '1' },
					{ key: 'provinceCode', value: '', showType: '2' },
					{ key: 'cityCode', value: '', showType: '3' },
					{ key: 'wharfYardCode', value: '', showType: '4' },
					{ key: 'wharfYardType', value: '', showType: '5' }
				],
				filterGroups: {
					// countryCode: { label: '国家', type: 'remoteSelect', showType: '1', remoteSelectList: [], remoteMethod: (name, item) => this.countrySelectList(name, item), visibleChange: (name, item) => this.countrySelectList(name, item) },
					// countryName: { label: '国家', type: 'input', disabled: true, showType: '1' },
					provinceCode: {
						label: '省份/区域',
						type: 'select',
						showType: '2',
						selectOptions: [],
						filterable: true,
						change: () => {
							this.getDomesticCity()
						}
					},

					// provinceName: { label: '省份/区域', type: 'input', showType: '2' },
					cityCode: { label: '城市', type: 'select', showType: '3', selectOptions: [], filterable: true },

					// cityName: { label: '城市', type: 'input', showType: '3' },
					wharfYardCode: { label: '码头堆场代码', type: 'input', showType: '4' },
					wharfYardName: { label: '码头堆场中文名', type: 'input', showType: '4' },
					wharfYardEname: { label: '码头堆场英文名', type: 'input', showType: '4' },
					wharfYardType: { label: '内外堆场类型', type: 'select', multiple: true, prop: 'wmsWharfYardType', showType: '5' }
				}
			}
		}

		let operationBtns = Object.assign(this.option.operationBtns, {
			data: [
				{
					label: '修改',
					type: 'text',
					show: true,
					action: 'Modify',
					style: {
						color: '#E9851F'
					}
				}
				// {
				// 	label: '删除',
				// 	type: 'text',
				// 	show: true,
				// 	action: 'Delete'
				// }
			],
			width: 120
		})
		let pagination = Object.assign({}, this.option.pagination, {
			show: true,
			isNew: true,
      pageSize: 20
		})
		this.option1 = Object.assign({}, this.option, {
			disableFixedIndex0: true,
			id: 'option1',
			$name: 'YardList',
			data: [],
			tips: {
				text: '',
				show: false
			},
      index: {
        show: true
      },
			selection: { show: false, fixed: true },
			operationBtns,
			pagination
		})
		let columns = [
			{
				prop: 'wharfYardCode',
				label: '码头堆场代码',
				type: 'text',
				width: 120
			},
			{
				prop: 'wharfYardName',
				label: '码头堆场中文名',
				type: 'text',
				width: 120
			},
			{
				prop: 'wharfYardEname',
				label: '码头堆场英文名',
				type: 'text',
				width: 150
			},
			{
				prop: 'countryName',
				label: '国家',
				type: 'text',
				width: 120
			},

			{
				prop: 'provinceName',
				label: '省份',
				type: 'text',
				width: 120
			},
			{
				prop: 'cityName',
				label: '城市',
				type: 'text',
				width: 100
			},
			{
				prop: 'address',
				label: '详细地址',
				type: 'text',
				width: 300
			},
			{
				prop: 'phone',
				label: '堆场电话',
				type: 'text',
				width: 120
			},

			{
				prop: 'webUrl',
				label: '码头网址',
				type: 'button',
				width: 150,
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						let url = row.webUrl.includes('http') ? row.webUrl : `http://${row.webUrl}`
						window.open(url, '_blank')
					}
				}
			},

			{
				prop: 'wharfYardType',
				label: '内外堆场类型',
				type: 'text',
				width: 130,
				formatter: item => {
					return this.dictMapObj.wmsWharfYardType[item.cellValue]
				}
			},
			{
				prop: 'createdName',
				label: '创建人',
				type: 'text'
			},
			{
				prop: 'createdTime',
				label: '创建时间',
				type: 'text',
				width: 130
			},
			{
				prop: 'updatedName',
				label: '修改人',
				type: 'text'
			},
			{
				prop: 'updatedTime',
				label: '修改时间',
				type: 'text',
				width: 130
			}
		]
		this.option1.columns = columns
		this.getDomesticProvince()
	},
	activated() {
		this.refreshListPage()
	},
	methods: {
		// 城市下拉
		getDomesticCity(name, item) {
			console.log('🚀 ~ this.searchInputGroup', this.searchOption1.addFilter.searchInputGroup)
			// 获取省份code
			let codeObj = this.searchOption1.addFilter.searchInputGroup.find(item => item.key === 'provinceCode')
			let code = codeObj?.value

			code &&
				getDomesticCity({ code }).then(res => {
					this.searchOption1.addFilter.filterGroups.cityCode.selectOptions = (res.data || []).map(item => {
						return { ...item, label: item.cname, value: item.code }
					})
				})
		},
		// 省份下拉
		getDomesticProvince(code, item) {
			getDomesticCity({}).then(res => {
				this.searchOption1.addFilter.filterGroups.provinceCode.selectOptions = (res.data || []).map(item => {
					return { ...item, label: item.cname, value: item.code }
				})
			})
		},
		// 国家下拉
		countrySelectList(countryCode, item) {
			countrySelectList({ countryCode, state: 'valid' }).then(res => {
				item.remoteSelectList = (res.data || []).map(item => {
					return { ...item, label: item.cname, value: item.countryCode }
				})
			})
		},
		// 提交数据
		handleSubmit(data) {
			console.log('🚀 ~ data', data)
			let fn = null
			if (this.isEdit) {
				fn = wharfYardModify
			} else {
				fn = wharfYardAdd
			}
			fn(data).then(res => {
				this.$message.success('修改成功!')
				this.showEdit = false
				this.refreshListPage()
			})
		},
		// 关闭弹窗
		handleClose() {
			this.showEdit = false
		},
		// 删除
		handleDelete() {
			this.$confirm('是否删除已选作业班组?', '', {
				confirmButtonText: '删除',
				cancelButtonText: '取消',
				type: 'warning',
				center: true,
				customClass: 'confirm-wrap',
				confirmButtonClass: 'confirm-off'
			})
				.then(() => {
					this.$message({
						type: 'success',
						message: '删除成功!'
					})
				})
				.catch(() => {})
		},
		// 新增
		toAdd() {
			this.isEdit = false
			this.showEdit = true
		},
		handleSizeChange(val) {
			this.option1.pagination.pageSize = val
			this.getData && this.getData()
		},
		handleCurrentChange(val) {
			this.option1.pagination.currPage = val
			this.getData && this.getData()
		},
		search() {
			this.option1.pagination.currPage = 1
			this.getData(true)
		},
		getData(isSearch) {
			let data = {
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				query: []
			}
			this.finCommonSearch(data.query, this.searchOption1, true)

			if (isSearch) {
				this.searchBackup = data.query
			}
			data.query = this.searchBackup || []
			this.loading = true
			yardQueryPage(data)
				.then(res => {
					if (res.code === 0) {
						this.option1.data = res.data.list
						Object.assign(this.option1.pagination, res.data)
					}
				})
				.finally(() => {
					this.loading = false
				})
		},
		// 修改
		handleModify(row) {
			for (const key in this.formData) {
				if (Object.hasOwnProperty.call(this.formData, key)) {
					this.formData[key] = row[key]
				}
			}
			this.isEdit = true
			this.showEdit = true
		},
		sendMulti(data, option) {
			console.log('🚀 ~ data', data)
			this.multipleSelection1 = data
		}
	},
	components: {
		FinanceTable,
		FinanceSearch,
		Edit
	}
}
</script>
<style></style>
<style lang="scss">
.confirm-wrap {
	.el-icon-error {
		color: #ffba00;
	}
	.el-message-box__btns {
		display: flex;
		flex-direction: row-reverse;
		.confirm-on {
			background: #33b18a;
			border: 0;
		}
		.confirm-off {
			background: #cd4130;
			border: 0;
		}

		.el-button {
			margin-left: 8px;
		}
	}
}
.assign-wrap {
	.el-button--mini {
		padding: 3px 7px;
	}
	.el-input--mini .el-input__inner,
	.el-input--mini .el-input__icon,
	.el-range-editor--mini.el-input__inner {
		height: 20px;
		line-height: 20px;
	}
	.select-template-box {
		float: left;
	}
	.select-template-box .el-dropdown {
		margin-left: 0;
		margin-bottom: 0;
		border-radius: 0;
		font-size: 12px;
		border: 1px solid #d9d9d9;
		border-radius: 4px;
	}
	.select-template-box:hover .el-dropdown {
		background: rgb(236, 245, 255);
		color: rgb(64, 158, 255);
	}
	.select-template-box .el-dropdown-link {
		cursor: pointer;
		padding-left: 5px;
		line-height: 18px;
		display: inline-block;
	}
	.select-template-box .el-icon--right {
		margin-left: 0;
	}
	.select-template-box .el-dropdown-link:focus {
		outline: none;
	}
}
</style>
