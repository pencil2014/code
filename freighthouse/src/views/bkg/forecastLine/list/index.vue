<template>
	<div class="finance-page">
		<FinanceSearch :searchOption="searchOption1" @search="search" />
		<div class="finance-search-list-gap"></div>
		<div class="finance-list-container">
			<div class="money-box">
				<div class="money-box-left">
					<el-button-group>
						<el-button
							class="finance-btn"
							size="mini"
							type="primary"
							@click="addLine"
							>新建预报信息</el-button
						>
					</el-button-group>
				</div>
				<div class="money-box-right"></div>
			</div>
			<FinanceTable :option="option1" />
		</div>
		<el-dialog
			title="创建预报"
			:visible.sync="addLineShow"
			class="self-dialog"
			width="800px"
		>
			<el-form
				:model="addLineData"
				:rules="addLineRules"
				ref="addLineForm"
				:inline="true"
				label-width="100px"
				size="mini"
			>
				<el-form-item class="oneEighth" label="起运港" prop="polPorts">
					<el-select
						size="mini"
						v-model="addLineData.polPorts"
						style="width: 200px"
						filterable
						remote
						multiple
						collapse-tags
						placeholder="请输入"
						:remote-method="poltFilterMethod"
						@visible-change="poltFilterMethod"
					>
						<el-option
							v-for="item in polCodeList"
							:key="item.portId"
							:label="`${item.ename}(${item.cname})`"
							:value="`${item.portCode}-${item.ename}-${item.cname}`"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="目的港" prop="podPorts">
					<el-select
						size="mini"
						v-model="addLineData.podPorts"
						style="width: 200px"
						filterable
						remote
						multiple
						collapse-tags
						placeholder="请输入"
						:remote-method="podPortFilterMethod"
						@visible-change="podPortFilterMethod"
						@change="changePolPod"
					>
						<el-option
							v-for="item in polCodeList"
							:key="item.portId"
							:label="`${item.ename}(${item.cname})`"
							:value="`${item.portCode}-${item.ename}-${item.cname}`"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="系统航线" prop="sysLineCode">
					<el-select
						style="width: 200px"
						size="mini"
						v-model="addLineData.sysLineCode"
						filterable
						remote
						reserve-keyword
						placeholder="请选择航线"
						:remote-method="sysLineSearch"
						@visible-change="sysLineSearch"
					>
						<el-option
							v-for="item in sysLineCodeList"
							:key="item.sysLineCode"
							:label="item.cname"
							:value="`${item.sysLineCode}-${item.cname}`"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="船公司" prop="shipCarrierCode">
					<el-select
						style="width: 200px"
						size="mini"
						v-model="addLineData.shipCarrierCode"
						filterable
						remote
						reserve-keyword
						placeholder="请选择船公司"
						:remote-method="shipCarrierSearch"
						@focus="shipCarrierSearch('')"
					>
						<el-option
							v-for="item in shipCarrierCodeList"
							:key="item.carrierCode"
							:label="`${item.carrierCode}(${item.cname})`"
							:value="`${item.carrierCode}-${item.cname}`"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="ETD周期" prop="etdTime">
					<el-date-picker
						v-model="addLineData.etdTime"
						type="daterange"
						style="width: 200px"
						placeholder="请选择ETD周期"
						value-format="yyyy-MM-dd"
					></el-date-picker>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitForm" size="mini"
					>确定</el-button
				>
				<el-button size="mini" @click="closeDialog">取消</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { baseShippingCarrierList, portSystemLineInfo, portList, baseSystemLineList } from '@/api/base'
import { forecastList, forecastDelete, forecastAdd } from '@/api/bkg/stockApply'
// import { dateFormat } from '@/views/finance/utils/finance'
export default {
	components: {
		FinanceTable,
		FinanceSearch,
	},
	mixins: [mixin, routerMixin],
	data () {
		return {
			searchOption1: {},
			option1: {},
			addLineData: {
				polPorts: '',
				podPorts: '',
				sysLineCode: '',
				shipCarrierCode: '',
				etdTime: ''
			},
			addLineRules: {
				polPorts: [{
					required: true,
					message: '起运港不能为空',
					trigger: 'blur',
				}],
				podPorts: [{
					required: true,
					message: '目的港不能为空',
					trigger: 'blur',
				}],
				etdTime: [{
					required: true,
					message: 'ETD周期不能为空',
					trigger: 'blur',
				}]
			},
			addLineShow: false,
			//船公司list
			shipCarrierCodeList: [],
			//目的港list
			polCodeList: [],
			//系统航线
			sysLineCodeList: [],
		}
	},
	created () {
		this.searchOption1 = {
			addFilter: {
				plusShow: false,
				defaultSearchLength: 3,
				searchInputGroup: [
					{ key: 'pol', value: '', showType: '1' },
					{ key: 'pod', value: '', showType: '2' },
					{ key: 'etdDate', value: '', showType: '3' },
				],
				filterGroups: {
					pol: {
						label: '起运港',
						type: 'remoteSelect',
						showType: '1',
						remoteMethod: (val, item) => {
							this.portSearch(val, item, 'port_of_basic')
						},
						visibleChange: (val, item) => {
							this.portSearch(val, item, 'port_of_basic')
						},
						remoteSelectList: [],
					},
					pod: {
						label: '目的港',
						type: 'remoteSelect',
						showType: '2',
						remoteMethod: (val, item) => {
							this.portSearch(val, item, 'port_of_destination')
						},
						visibleChange: (val, item) => {
							this.portSearch(val, item, 'port_of_destination')
						},
						remoteSelectList: [],
					},
					etdDate: { label: 'ETD', type: 'daterange', showType: '3', format: 'yyyy-MM-dd' },
				},
			},
		}
		let operationBtns = Object.assign({}, this.option.operationBtns, {
			data: [
				{
					label: '删除',
					show: true,
					action: 'delete',
				}
			],
			fixed: 'right',
			callback: (action, $index, row, option) => {
				if (action === 'delete') {
					this.deleteLine(row)
				}
			},
		})
		let pagination = Object.assign({}, this.option.pagination, {
			show: true,
		})
		this.option1 = Object.assign({}, this.option, {
			id: 'option1',
			data: [],
			tips: {
				text: '',
				show: false,
			},
			selection: false,
			operationBtns,
			pagination,
		})
		let columns1 = [
			{
				prop: 'polPorts', label: '大船起运港', formatter: (row) => {
					return row.polPorts.map(ele => {
						return `${ele.portEname}(${ele.portCname})`
					}).join(',')
				}
			},
			{
				prop: 'podPorts', label: '目的港', formatter: (row) => {
					return row.podPorts.map(ele => {
						return `${ele.portEname}(${ele.portCname})`
					}).join(',')
				}
			},
			{ prop: 'sysLineName', label: '系统航线' },
			{ prop: 'shipCarrierCode', label: '船司' },
			{
				prop: 'etdBeginTime', label: 'ETD周期', formatter: (row) => {
					return `${row.etdBeginTime} 至 ${row.etdEndTime}`
				}
			},
			{
				prop: 'updatedName', label: '商务', formatter: (row) => {
					return row['updatedName'] || row['createdName']
				}
			}
		]
		this.option1.columns = columns1
		this.getData()
	},
	methods: {
		// 搜索
		search () {
			this.getData()
		},
		// 获取数据
		getData () {
			let data = {
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				query: [],
			}
			this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
				let { key, value } = item
				if (value) {
					if (key === 'etdDate') {
						data.query.push({
							column: 'etdBeginTime',
							type: 'ge',
							value: value[0]
						})
						data.query.push({
							column: 'etdEndTime',
							type: 'le',
							value: value[1]
						})
					} else {
						data.query.push({
							column: key,
							value: value,
							type: 'eq',
						})
					}
				}
			})
			forecastList(data).then(res => {
				let data = res.data
				this.option1.data = data.list
				this.option1.pagination.currPage = data.currPage
				this.option1.pagination.pageSize = data.pageSize
				this.option1.pagination.totalCount = data.totalCount
			}).catch(() => { })
		},
		// 分页
		handleSizeChange (val) {
			this.option1.pagination.pageSize = val
			this.getData && this.getData()
		},
		// 分页
		handleCurrentChange (val) {
			this.option1.pagination.currPage = val
			this.getData && this.getData()
		},
		// 删除航线
		deleteLine (row) {
			this.$confirm('是否确认删除该航线预报?', "警告", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			}).then(() => {
				this.deleteLineFn(row)
			}).catch((err) => {
			})

		},
		deleteLineFn (row) {
			let data = {
				bfrIds: [row.bfrId]
			}
			forecastDelete(data).then(res => {
				if (res.code === 0) {
					this.getData()
					this.$msgSucClose('航线预报删除成功')
				}
			}).catch()
		},
		// 新增航线
		addLine () {
			this.addLineShow = true
		},
		// 提交表单
		submitForm () {
			let { polPorts, podPorts, sysLineCode, shipCarrierCode, etdTime } = this.addLineData
			let data = {
				polPorts: polPorts.map(item => {
					let dataSource = item.split('-')
					return {
						portCode: dataSource[0],
						portEname: dataSource[1],
						portCname: dataSource[2]
					}
				}),
				podPorts: podPorts.map(item => {
					let dataSource = item.split('-')
					return {
						portCode: dataSource[0],
						portEname: dataSource[1],
						portCname: dataSource[2]
					}
				}),
				sysLineCode: sysLineCode.split('-')[0],
				sysLineName: sysLineCode.split('-')[1],
				shipCarrierCode: shipCarrierCode.split('-')[0],
				shipCarrierName: shipCarrierCode.split('-')[1],
				etdBeginTime: etdTime[0],
				etdEndTime: etdTime[1]
			}
			forecastAdd(data).then(res => {
				if (res.code === 0) {
					this.getData()
					this.$msgSucClose('新建预报信息成功！')
					this.closeDialog()
				}
			}).catch(() => { })

		},
		closeDialog () {
			this.addLineShow = false
			this.$refs.addLineForm.resetFields()
		},
		//起运港
		poltFilterMethod (val) {
			val && this.polCodeSearch(val, 'port_of_basic', 'valid')
		},
		//目的港
		podPortFilterMethod (val) {
			val && this.polCodeSearch(val, 'port_of_destination', 'valid')
		},
		// 港口下拉列表
		polCodeSearch (queryString, portAttribute, state) {
			if (queryString === true) {
				queryString = ''
			}
			portList({ portName: queryString, portAttribute, state }).then((res) => {
				this.polCodeList = res.data
			})
		},
		// 修改起运港
		changePolPod (val) {
			this.portSystemLineInfo(val[0].split('-')[0] || '')
		},
		// 按照航线搜索航线
		portSystemLineInfo (val) {
			portSystemLineInfo(val).then((res) => {
				if (res.data.length) {
					this.sysLineCodeList = res.data
					this.addLineData.sysLineCode = `${res.data[0].sysLineCode}-${res.data[0].cname}`
				}
			})
		},
		//系统航线
		sysLineSearch (queryString) {
			if (queryString === true) {
				queryString = ''
			}
			let state = 'valid'
			baseSystemLineList(queryString, state).then((res) => {
				this.sysLineCodeList = res.data
			})
		},
		// 船公司下拉列表自动补充的数据
		shipQuerySearch (queryString, cb) {
			this.$store.dispatch('dict/baseShippingCarrierList', { shippingCarrierName: queryString, state: '' }).then((data) => {
				cb(data)
			})
		},
		// 远程搜索港口下拉数据
		portSearch (queryString, item, port) {
			let data = {
				queryString,
				portAttribute: port,
			}
			this.$store.dispatch('dict/basePortList', data).then((data) => {
				item.remoteSelectList = data.map((item) => {
					return {
						label: item.value,
						value: item.portCode,
					}
				})
			})
		},
		//船司
		shipCarrierSearch (queryString) {
			baseShippingCarrierList(queryString, '').then((response) => {
				this.shipCarrierCodeList = response.data
			})
		},
	}
}
</script>

<style lang="scss">
.el-select .el-tag {
	margin: 0;
}
.el-select__tags {
	display: flex;
	font-size: 12px;
	height: 20px;
	width: 120px;
	overflow: hidden;
	.el-select__tags-text {
		display: block;
		max-width: 100px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}
</style>