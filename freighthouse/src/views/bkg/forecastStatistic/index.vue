<template>
	<div>
		<div class="finance-page">
			<FinanceSearch :searchOption="searchOption1" @search="search" />
			<div class="finance-search-list-gap"></div>
			<div class="finance-list-container">
				<div class="money-box">
					<div class="money-box-left"></div>
					<div class="money-box-right"></div>
				</div>
				<FinanceTable :option="option1" @send-multi="sendMulti" />
			</div>
		</div>
	</div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import Advertisement from '@/views/bkg/forecast/forecastList/components/advertisement'
import { forecastListPage, forecastSave, forecastPass, forecastRefuse, forecastDelete, sleList, forecastStatistic } from "@/api/bkg/bkgSaleConfig"
import { basePortList, baseSystemLineList, baseShippingCarrierList, baseCurrencyList, portSystemLineInfo } from '@/api/base'
import { mapState } from 'vuex'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { dateFormat } from '@/views/finance/utils/finance'
export default {
	mixins: [mixin, mixin2, routerMixin],
	data () {
		return {
			but: [],
			searchBackup: [],
			butName: "全部",
			option1: {},
			searchOption1: {},
			multipleSelection1: [],
			isFreetime: true,
			dialogVisible: false,
			title: "",
			addType: "",
			sysLineDisabled: '',
			//船公司list
			shipCarrierCodeList: [],
			//目的港list
			polCodeList: [],
			//系统航线
			sysLineCodeList: [],
			//商务下拉
			verifierSelectList: [],
			//预测拒绝opne
			rejectDialogVisible: false,
			//详情的控制
			isDetail: false
		}
	},
	created () {
		let alias1 = this
		this.autocomplete1 = {
			querySearch: (queryString, cb) => {
				alias1.selectedOptionItem = ''
				alias1.shipQuerySearch({ queryString }, cb)
			},
			select: (optionItem, row) => {
				console.log(optionItem);
				alias1.selectedOptionItem = optionItem
				this.form.shipCarrierCode = optionItem.key
				this.form.shipCarrierName = optionItem.value
			},
			change: (optionItem, row) => {
				setTimeout(() => {
					if (alias2.selectedOptionItem === '') {
						this.form.shipCarrierCode = ""
						this.form.shipCarrierName = ""
						return
					}
				}, 500)
			}
		}
		this.searchOption1 = {
			addFilter: {
				defaultSearchLength: 3,
				searchInputGroup: [
					{ key: "pol", value: "", showType: "1", range: { min: '', max: '' } },
					{ key: "pod", value: "", showType: "2", range: { min: '', max: '' } },
					{ key: "etdDate", value: "", showType: "3", range: { min: '', max: '' } },
				],
				filterGroups: {
					pol: {
						label: "起运港",
						type: "remoteSelect",
						showType: "1",
						remoteMethod: (val, item) => {
							this.portSearch(val, item, 'port_of_basic')
						},
						visibleChange: (val, item) => {
							this.portSearch(val, item, 'port_of_basic')
						},
						remoteSelectList: []
					},
					pod: {
						label: "目的港",
						type: "remoteSelect",
						showType: "2",
						remoteMethod: (val, item) => {
							this.portSearch(val, item, 'port_of_destination')
						},
						visibleChange: (val, item) => {
							this.portSearch(val, item, 'port_of_destination')
						},
						remoteSelectList: []
					},
					etdDate: { label: 'ETD周期', type: 'daterange', showType: '3' },
				},
			},
		}
		this.init1()
	},
	methods: {
		init1 () {
			let list = this.dictMap['verifyStatus']
			list[0].value = ''
			list[0].label = '全部'
			this.but = list
			let pagination = Object.assign({}, this.option.pagination, {
				width: '120px',
				show: true
			})
			this.option1 = Object.assign({}, this.option, {
				id: 'option1',
				data: [
					... this.option.data
				],
				tips: {
					text: '',
					show: false
				},
				operationBtns: false,
				pagination,
				// sortable: true,
			})
			let columns = [
				{
					prop: 'etdBeginTime',
					label: 'ETD周期',
					type: 'text',
					width: "90px",
					formatter: (row, pItem) => {
						return row.etdBeginTime + " 至 " + row.etdEndTime;
					}
				},
				{
					prop: 'polEname',
					label: '大船起运港',
					type: 'text',
					formatter: (row) => {
						return `${row.polEname}(${row.polCname})`
					}
				},
				{
					prop: 'podEname',
					label: '目的港',
					type: 'text',
					formatter: (row) => {
						return `${row.podEname}(${row.podCname})`
					}
				},
				{
					prop: 'sysLineName',
					label: '系统航线',
					type: 'text',
				},
				// {
				// 	prop: 'maxPrice',
				// 	label: '价格区间',
				// 	type: 'text',
				// 	formatter: (row) => {
				// 		return `${row['minPrice']} - ${row['maxPrice']} `
				// 	}
				// },
				{
					prop: 'shipCarrierName',
					label: '船司',
					type: 'text'
				},

				{
					prop: 'containerType',
					label: '柜型',
					type: 'text'
				},
				{
					prop: 'containerNum',
					label: '柜量',
					type: 'text'
				},
			]
			this.option1.columns = columns
			this.getData()
		},

		handleSizeChange (val) {
			this.option1.pagination.pageSize = val
			this.getData && this.getData()
		},
		handleCurrentChange (val) {
			this.option1.pagination.currPage = val
			this.getData && this.getData()
		},
		getData (isSearch) {
			let data = {
				"currPage": this.option1.pagination.currPage,
				"pageSize": this.option1.pagination.pageSize,
				"query": []
			}
			if (this.customColumnsKeys && this.customColumnsKeys.length) {
				data.columns = this.customColumnsKeys
			}
			this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
				let { key, value, range, req, valueReq } = item
				if (range.min || range.max) {
					if (range.min) {
						data.query.push({
							column: key + 'Min',
							type: 'like',
							value: range.min,
						})
					}
					if (range.max) {
						data.query.push({
							column: key + 'Max',
							type: 'like',
							value: range.max,
						})
					}
					return
				}
				if (!value) return
				if (typeof value !== 'object') {
					if (valueReq && item[valueReq] && item.key === 'settleCorpName' && item.value !== '') {
						data.query.push({
							column: valueReq,
							type: 'like',
							value: item[valueReq],
						})
						console.log(item[valueReq]);
					}
					return data.query.push({
						column: key,
						type: 'like',
						value: req || value,
					})
				}
				if (key === 'writeoffStatus' || key === 'type' || key === 'settleCorpType' || key === 'settleCorpCode') {
					if (!value.length) return
					data.query.push({
						column: key,
						type: 'like',
						value: value.join(','),
					})
				} else {
					data.query.push({
						column: 'etdBeginTime',
						type: 'ge',
						value: dateFormat('yyyy-mm-dd', value[0]),
					})
					data.query.push({
						column: 'etdEndTime',
						type: 'le',
						value: dateFormat('yyyy-mm-dd', value[1]),
					})
				}

			})
			if (isSearch) {
				this.searchBackup = data.query
			}
			data.query = this.searchBackup || []
			if (this.buttonSearch) {
				data.query.push({ column: 'verifyStatus', type: 'like', value: this.buttonSearch })
			}
			if (isSearch) {
				this.searchBackup = data.query
			}
			data.query = this.searchBackup || []
			if (this.isFreetime) {
				forecastStatistic(data).then(res => {
					if (res.code === 0) {
						this.decompose(res)
					}
				})
			} else {
				forecastStatistic(data).then(res => {
					if (res.code === 0) {
						this.decompose(res)
					}
				})
			}

		},
		decompose (res) {
			console.log(res.data);
			let { list } = res.data
			let data = []
			list.forEach(item => {
				data.push(item)
			})
			this.option1.data = data
			this.table1DataBackup = [
				... this.option1.data
			]
			this.option1.pagination.currPage = res.data.currPage
			this.option1.pagination.pageSize = res.data.pageSize
			this.option1.pagination.totalCount = res.data.totalCount
		},
		//按钮搜索
		verifyStatusSearch (data) {
			this.butName = data.label
			this.buttonSearch = data.value
			this.option1.pagination.currPage = 1
			this.getData()
			// this.search(data.value)
		},

		//审批通过
		handlePass () {
			if (this.multipleSelection1.length === 0) {
				return this.$msgErrClose('请勾选需要通过的项')
			}
			let data = {
				oids: this.multipleSelection1.map(item => {
					return item.oid
				})
			}
			forecastPass(data).then(res => {
				this.$msgSucClose('审批通过成功')
				this.getData()
			})
		},
		//审批拒绝
		handleRefuse () {
			if (this.multipleSelection1.length === 0) {
				return this.$msgErrClose('请勾选需要拒绝的项')
			}
			Object.assign(this.query, { remark: "" })
			this.rejectDialogVisible = true
		},
		//审批拒绝提交
		handleSubmit () {
			let data = {
				remark: this.query.remark.trim(),
				oids: this.multipleSelection1.map(item => {
					return item.oid
				})
			}
			this.$refs.query.validate(valid => {
				if (valid) {
					forecastRefuse(data).then(res => {
						this.getData()
						this.rejectDialogVisible = false
						this.$msgSucClose('审批拒绝成功')
					})
				}
			})
		},
		//审批拒绝返回
		handleCancel () {
			this.rejectDialogVisible = false
		},

		//删除
		handleDelete (index, row) {
			this.$confirm('是否确认删除？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					forecastDelete({ oids: [row.oid] }).then(res => {
						this.$msgSucClose('删除成功！')
						this.getData()
					})
				}).catch()

		},
		sendMulti (data, option) {
			if (option === this.option1) this.multipleSelection1 = data
		},

		search (data) {
			this.butName = ""
			this.buttonSearch = data
			this.option1.pagination.currPage = 1
			this.getData(true)
		},
		showDetail (row) {
		},
		//船司
		shipCarrierSearch (queryString) {
			baseShippingCarrierList(queryString, '').then(response => {
				this.shipCarrierCodeList = response.data
			})
		},
		shipCarrierChange (val) {
			this.form.shipCarrierName = val
		},
		//系统航线
		sysLineSearch (queryString) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then(data => {
				console.log(data);
				this.sysLineCodeList = data
			})
		},
		// 目的地
		handleChangePodPort (val) {
			let optionItem = this.polCodeList.filter(item => {
				return item.key === val
			})
			this.form.podEname = optionItem[0].ename
			if (!val) {
				this.changeSysLineDisabeld(false)
			} else {
				this.initSystemLine(val);
				this.changeSysLineDisabeld(true)
			}
		},
		initSystemLine (key) {
			portSystemLineInfo(key).then(response => {
				this.sysLineCodeList = response.data
				if (this.sysLineCodeList.length > 0) {
					this.form.sysLineCode = this.sysLineCodeList[0].sysLineCode
					this.form.sysLineName = this.sysLineCodeList[0].cname
				}
			})
		},
		changeSysLineDisabeld (value) {
			this.sysLineDisabled = value
		},
		//商务
		verifierFilterMethod (val) {
			this.getEmployeeList()
		},
		verifierVisibleChange (val) {
			this.getEmployeeList()
		},
		handleChangeVerifier (val) {
			let optionItem = this.verifierSelectList.filter(item => {
				return item.value === val
			})
			this.form.verifierName = optionItem[0].label
		},

		//起运港
		poltFilterMethod (val) {
			this.polCodeSearch(val, 'port_of_basic', 'valid')
		},
		polVisibleChange (val) {
			val && this.polCodeSearch(val, 'port_of_basic', 'valid')
		},
		handleChangePol (val) {
			let optionItem = this.polCodeList.filter(item => {
				return item.key === val
			})
			this.form.polEname = optionItem[0].ename
			if (!val) {
				this.changeSysLineDisabeld(false)
			} else {
				this.initSystemLine(val);
				this.changeSysLineDisabeld(true)
			}
		},
		//目的港
		podPortVisibleChange (val) {
			val && this.polCodeSearch(val, 'port_of_destination', 'valid')
		},
		podPortFilterMethod (val) {
			this.polCodeSearch(val, 'port_of_destination', 'valid')

		},
		polCodeSearch (queryString, portAttribute, state, type, cb) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				this.polCodeList = data
			})
		},
		// 船公司下拉列表自动补充的数据
		shipQuerySearch (queryString, cb) {
			this.$store.dispatch('dict/baseShippingCarrierList', { shippingCarrierName: queryString, state: '' }).then(data => {
				cb(data)
			})
		},
		// 远程搜索港口下拉数据
		portSearch (queryString, item, port) {
			let data = {
				queryString,
				portAttribute: port
			}
			this.$store.dispatch('dict/basePortList', data).then(data => {
				item.remoteSelectList = data.map(item => {
					return {
						label: item.value,
						value: item.portCode
					}
				})
			})
		},
		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch (queryString, cb) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then(data => {
				cb(data)
			})
		},
		// 商务下拉框
		getEmployeeList () {
			// if(!this.form.sysLineCode){
			//   return 
			// }
			// if(!this.form.shipCarrierCode){
			//   return 
			// }
			let data = {
				sysLineCode: "100075010",
				shipCarrierCode: this.form.shipCarrierCode
			}
			sleList(data).then((res) => {
				console.log(res);
				this.verifierSelectList = res.data.map(item => {
					return {
						label: item.employeeName,
						value: item.employeeId
					}
				})
			}).catch(err => {
				console.log(err)
			})
		},
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			role: state => state.user.role,
			bdRoles: state => state.user.bdRoles,
			opRoles: state => state.user.opRoles,
		}),
	},
	watch: {
	},
	components: {
		FinanceTable,
		FinanceSearch,
		Advertisement
	}
}
</script>
<style lang="scss">
.dialog-footer-left {
	float: left;
	span {
		margin-right: 32px;
		margin-left: 32px;
	}
}
</style>