<template>
	<div class="finance-page">
		<FinanceSearch :searchOption="searchOption1" @search="search" />
		<div class="finance-search-list-gap"></div>
		<div class="finance-list-container">
			<div class="money-box">
				<div class="money-box-left">
					<el-button-group>
						<el-button class="finance-btn" size="mini" @click="goManage(true)"
							>业务预报</el-button
						>
					</el-button-group>
					<el-button-group>
						<el-button class="finance-btn" size="mini" @click="goManage()"
							>商务预报</el-button
						>
					</el-button-group>
				</div>
				<div class="money-box-right"></div>
			</div>
			<FinanceTable :option="option1" />
		</div>
		<el-dialog
			title="申请预报"
			:visible.sync="dialogVisible"
			:close-on-click-modal="false"
			width="700px"
		>
			<el-form
				:model="form"
				ref="form"
				:inline="true"
				:rules="formRules"
				label-width="110px"
				size="mini"
			>
				<el-form-item label="起运港" prop="pol">
					<el-select
						size="mini"
						v-model="form.pol"
						style="width: 200px"
						filterable
						remote
						multiple
						collapse-tags
						placeholder="请输入"
					>
						<el-option
							v-for="item in applyData.polPorts"
							:key="item.portId"
							:label="`${item.portEname}(${item.portCname})`"
							:value="`${item.portCode}-${item.portEname}-${item.portCname}`"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="目的港" prop="pod">
					<el-select
						size="mini"
						v-model="form.pod"
						style="width: 200px"
						filterable
						placeholder="请输入"
						@change="portSystemLineInfo"
					>
						<el-option
							v-for="item in applyData.podPorts"
							:key="item.portId"
							:label="`${item.portEname}(${item.portCname})`"
							:value="`${item.portCode}-${item.portEname}-${item.portCname}`"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="系统航线" prop="sysLineName">
					<el-select
						style="width: 200px"
						size="mini"
						:disabled="disabledLine"
						v-model="form.sysLineName"
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
					<el-input
						v-model="form.shipCarrierCode"
						placeholder=""
						style="width: 200px"
						disabled
						size="mini"
					></el-input>
				</el-form-item>

				<el-form-item label="ETD周期" prop="etdTime">
					<el-input
						v-model="form.etdTime"
						placeholder=""
						style="width: 200px"
						disabled
						size="mini"
					></el-input>
				</el-form-item>
				<el-form-item label="最高接受基港价格" prop="maxLimitPrice">
					<el-input
						style="width: 95px"
						v-model="form.maxLimitPrice"
						maxlength="12"
						placeholder="请输入金额"
						v-lsNumber="{ value: 'number', obj: form, key: 'allotAmt' }"
						type="text"
						size="mini"
					></el-input>
					<el-select
						style="margin-left: 10px; width: 95px"
						size="mini"
						v-model="form.currency"
						filterable
						remote
						reserve-keyword
						placeholder="请选择币种"
					>
						<el-option
							v-for="o in dictMap['currency']"
							:key="o.value"
							:label="o.label"
							:value="o.value"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="箱型箱量" prop="containerType">
					<el-select
						style="width: 95px"
						size="mini"
						v-model="form.containerType"
						filterable
						remote
						reserve-keyword
						placeholder="请选择箱型箱量"
					>
						<el-option
							v-for="(o, key) in dictMap['containerType']"
							:key="'containerType' + key"
							:label="o.label"
							:value="o.value"
						></el-option>
					</el-select>
					<el-input
						style="margin-left: 10px; width: 95px"
						v-model="form.containerNum"
						maxlength="5"
						placeholder="请输入数量"
						v-lsNumber="{ value: 'number', obj: form, key: 'allotAmt' }"
						type="text"
						size="mini"
					></el-input>
				</el-form-item>
				<div class="container-box" style="width: 100%">
					<el-form-item label="每票箱量" prop="containerNumPerOrderArr"
						><el-input
							style="margin-right: 10px; width: 95px"
							v-for="(item, index) in form.containerNumPerOrderArr.length"
							:key="item"
							v-model="form.containerNumPerOrderArr[index]"
							maxlength="5"
							placeholder="每票数量"
							v-lsNumber="{ value: 'number', obj: form, key: 'allotAmt' }"
							type="text"
							size="mini"
						></el-input>
						<i
							class="el-icon-circle-plus-outline icon-plus"
							@click="addContainerNum"
						>
						</i>
						<i
							class="el-icon-remove-outline icon-plus icon-plus"
							@click="delContainerNum"
						>
						</i>
					</el-form-item>
				</div>
				<el-form-item label="备注" prop="remark">
					<el-input
						type="textarea"
						v-model="form.remark"
						placeholder="请输入备注"
						class="remark"
						style="width: 520px"
					></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" size="mini" @click="handleAddSubmit"
					>提交审核</el-button
				>
				<el-button size="mini" @click="closeDialog">取消</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { forecastList } from '@/api/bkg/stockApply'
import { forecastSave } from '@/api/bkg/bkgSaleConfig'
import { baseSystemLineList, portSystemLineInfo } from '@/api/base'
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
			form: {
				pol: [],
				polEname: '',
				polCname: '',
				pod: '',
				podEname: '',
				podCname: '',
				polPorts: [],
				podPort: {},
				shipCarrierCode: '',
				shipCarrierName: '',
				sysLineCode: '',
				sysLineName: '',
				etdBeginTime: '',
				etdEndTime: '',
				containerType: '',
				containerNum: '',
				maxLimitPrice: '',
				currency: '',
				etdTime: '',
				verifier: '',
				verifierName: '',
				containerNumPerOrderArr: [''],
				containerNumPerOrder: '',
				remark: ''
			},
			formRules: {
				pol: { required: true, message: '起运港不能为空', trigger: 'change' },
				pod: { required: true, message: '目的港不能为空', trigger: 'change' },
				shipCarrierCode: { required: true, message: '船公司不能为空', trigger: 'change' },
				containerType: { required: true, message: '箱型不能为空', trigger: 'change' },
				containerNum: { required: true, message: '箱量不能为空', trigger: 'change' },
				etdTime: { required: true, message: 'ETD不能为空', trigger: 'change' },
				maxLimitPrice: { required: true, message: '最高价格不能为空', trigger: 'change' },
				currency: { required: true, message: '币种不能为空', trigger: 'change' },
			},
			dialogVisible: false,
			applyData: {},
			//系统航线
			sysLineCodeList: [],
			disabledLine: false
		}
	},
	computed: {
		...mapGetters(['dictMap'])
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
					label: '申请',
					show: true,
					action: 'applyLine',
				}
			],
			fixed: 'right',
			callback: (action, $index, row, option) => {
				if (action === 'applyLine') {
					this.applyLine(row)
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
		// 按照目的港搜索航线
		portSystemLineInfo (val) {
			let port = val.split('-')[0]
			portSystemLineInfo(port).then((res) => {
				if (res.data.length) {
					this.sysLineCodeList = res.data
					this.form.sysLineCode = res.data[0].sysLineCode
					this.form.sysLineName = res.data[0].cname
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
		// 跳转业务预报
		goManage (val) {
			if (val) {
				this.$router.push({ name: 'ForeCast' })
			} else {
				this.$router.push({ name: 'BkgForeCastLine' })
			}
		},
		// 申请
		applyLine (row) {
			this.applyData = row
			let { shipCarrierCode, shipCarrierName, sysLineCode, sysLineName, etdBeginTime, etdEndTime, createdName, createdBy } = row
			this.form = Object.assign(this.form, { shipCarrierCode, shipCarrierName, sysLineCode, sysLineName, etdBeginTime, etdEndTime })
			this.form.etdTime = `${etdBeginTime}至${etdEndTime}`
			this.form.verifier = createdBy
			this.form.verifierName = createdName
			if (row.polPorts.length > 0) {
				let item = row.polPorts[0]
				this.form.pol = [`${item.portCode}-${item.portEname}-${item.portCname}`]
			}
			if (row.podPorts.length > 0) {
				let item = row.podPorts[0]
				this.form.pod = `${item.portCode}-${item.portEname}-${item.portCname}`
				this.disabledLine = true
			}
			this.dialogVisible = true
		},
		// 关闭弹窗
		closeDialog () {
			this.dialogVisible = false
			this.$refs.form.resetFields()
		},
		// 提交审核
		handleAddSubmit () {
			this.$refs.form.validate((valid) => {
				if (valid) {
					let { pol, pod } = this.form
					pol.forEach(item => {
						let ele = item.split('-')
						this.form.polPorts.push({
							portCode: ele[0],
							portEname: ele[1],
							portCname: ele[2]
						})
					})
					let podArr = pod.split('-')
					this.form.podPort = {
						portCode: podArr[0],
						portEname: podArr[1],
						portCname: podArr[2]
					}
					this.form.bfrId = this.applyData.bfrId
					this.form.containerNumPerOrder = JSON.stringify(this.form.containerNumPerOrderArr)
					forecastSave(this.form).then(res => {
						if (res.code === 0) {
							this.getData()
							this.$msgSucClose('提交成功！')
							this.closeDialog()
							this.$router.push({ name: 'ForeCast' })
						}
					}).catch(() => { })
				}
			})
		},
		// 新增每票
		addContainerNum () {
			if (!this.form.containerNum) {
				return this.$msgErrClose('请先填写箱型箱量')
			}
			let total = this.form.containerNumPerOrderArr.reduce((pre, cur) => {
				return pre += Number(cur)
			}, 0)
			if (total >= this.form.containerNum) {
				return this.$msgErrClose('每票箱量大于总箱量，无法添加')
			}
			this.form.containerNumPerOrderArr.push('')
		},
		delContainerNum () {
			if (this.form.containerNumPerOrderArr.length === 1) {
				return this.$msgErrClose('至少填写一个')
			}
			this.form.containerNumPerOrderArr.pop()
		}
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
.icon-plus {
	font-size: 18px;
	cursor: pointer;
	color: #1682e6;
	margin-right: 10px;
}
</style>