<template>
	<div class="finance-page">
		<FinanceSearch
			:searchOption="searchOption"
			@search="search"
			:border="true"
		/>
		<!-- <div class="bkg-cnt">
			<div class="money-box">
				<div class="money-box-left">
					<el-button
						v-if="false"
						class="finance-btn"
						@click="handleCustomColumns"
						size="mini"
						>自定义表头</el-button
					>
				</div>
				<div class="money-box-right"></div>
    </div>-->
		<FinanceTable :option="option1" @send-multi="sendMulti" />
		<!-- </div> -->
		<div v-if="customColumnsPopShow">
			<CustomColumns
				:columnsBase="selfColumnsBase"
				:configColumns="configColumns"
				@close="customColumnsPopClose"
			/>
		</div>
		<el-dialog
			title="现舱申领"
			:visible.sync="stockApplyShow"
			class="self-dialog"
			width="600px"
		>
			<el-form
				:model="form"
				ref="form"
				:inline="true"
				label-width="100px"
				size="mini"
			>
				<el-form-item label="申领柜量：" :rules="rulesMsg" prop="applyCount">
					<el-input-number
						v-model="form.applyCount"
						size="mini"
						controls-position="right"
						@change="handleChange"
						:min="1"
						:max="stockApplyDate.lastCount"
					></el-input-number>
					<span class="right-box"
						>剩余数量：{{ stockApplyDate.lastCount }}</span
					>
				</el-form-item>
				<el-form-item label="业务报价：" prop="bdQuotation">
					<el-input
						style="width: 130px"
						v-model="form.bdQuotation"
						size="mini"
						controls-position="right"
						:min="1"
						:max="stockApplyDate.lastCount"
						v-lsNumber="{
							value: 'number',
							obj: form,
							key: 'bdQuotation',
							positive: true,
						}"
						@change="handleChange"
					></el-input>
				</el-form-item>
				<el-form-item label="申领备注：" prop="applyRemark" :rules="rulesMsg">
					<el-input
						type="textarea"
						placeholder="请输入内容"
						v-model.trim="form.applyRemark"
						maxlength="100"
						:autosize="{ minRows: 3, maxRows: 5 }"
						show-word-limit
					></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitApply" size="mini"
					>确认申领</el-button
				>
				<el-button size="mini" @click="closeDialog">取消</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { listStockByBdOrOther, applyAdd } from '@/api/bkg/stockApply'
import { dateFormat } from '@/views/finance/utils/finance'
export default {
	components: {
		FinanceSearch,
		FinanceTable,
		CustomColumns,
	},
	mixins: [mixin, routerMixin],
	data () {
		return {
			searchOption: {},
			option1: {},
			customColumnsPopShow: false,
			multipleSelection: [],
			stockApplyDate: {},
			stockApplyShow: false,
			form: {
				applyCount: 1,
				applyRemark: '',
				bdQuotation: '',
			},
			rulesMsg: [{ required: true, message: ' ', trigger: 'change' }],
		}
	},
	created () {
		this.searchOption = {
			addFilter: {
				defaultSearchLength: 3,
				searchInputGroup: [
					{
						key: 'pol',
						value: '',
						showType: '1',
					},
					{
						key: 'pod',
						value: '',
						showType: '2',
					},
					{
						key: 'etdDate',
						value: '',
						showType: '3',
					},
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
					etdDate: {
						label: 'ETD',
						type: 'date',
						showType: '3',
					},
				},
			},
		}
		let operationBtns = Object.assign({}, this.option.operationBtns, {
			data: [
				{
					label: '申领',
					type: 'text',
					showFn: (row) => row.lastCount > 0,
					action: 'stockApply',
				},
			],
			fixed: 'right',
			show: true,
			callback: (action, $index, row, option) => {
				if (action === 'stockApply') {
					this.stockApply(row)
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
		let columns = [
			{
				prop: 'stockCode',
				label: '现舱编号',
				type: 'text',
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
			{
				prop: 'shipCarrierCode',
				label: '船司',
				type: 'text',
			},
			{
				prop: 'etdDate',
				label: 'ETD',
				type: 'text',
			},
			{
				prop: 'cyCutOff',
				label: '截关时间',
				type: 'text',
			},
			{
				prop: 'siCutOff',
				label: '截补料时间',
				type: 'text',
			},
			{
				prop: 'containerType',
				label: '柜型',
				type: 'text',
			},
			{
				prop: 'containerNum',
				label: '柜量总数',
				type: 'text',
			},
			{
				prop: 'lastCount',
				label: '剩余可用数',
				type: 'text',
			},
			{
				prop: 'applyCount',
				label: '申请数',
				type: 'text',
			},
			{
				prop: 'sellPrice',
				label: '售价',
				type: 'text',
			},
			{
				prop: 'currencyCode',
				label: '币别',
				type: 'text',
			},
			{
				prop: 'createdName',
				label: '创建人',
				type: 'text',
			},
			{
				prop: 'createdTime',
				label: '创建时间',
				type: 'text',
			},
			{
				prop: 'freetimeRemark',
				label: 'Freetime说明',
				type: 'tooltip',
				width: 125,
			},
			{
				prop: 'cancelRemark',
				label: '退舱费说明',
				type: 'tooltip',
				width: 125,
			},
		]
		this.option1.columns = columns
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
			this.searchOption.addFilter.searchInputGroup.forEach((item) => {
				let { key, value } = item
				if (value) {
					if (key === 'etdDate') {
						console.log(value)
						data.query.push({
							column: key,
							type: 'eq',
							value: dateFormat('yyyy-mm-dd', value),
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
			listStockByBdOrOther(data)
				.then((res) => {
					let data = res.data
					this.option1.data = data.list
					this.option1.pagination.currPage = data.currPage
					this.option1.pagination.pageSize = data.pageSize
					this.option1.pagination.totalCount = data.totalCount
				})
				.catch(() => { })
		},
		// 分页方法
		handleSizeChange (val) {
			this.option1.pagination.pageSize = val
			this.getData()
		},
		// 分页方法
		handleCurrentChange (val) {
			this.option1.pagination.currPage = val
			this.getData()
		},
		// 自定义表头
		handleCustomColumns () { },
		// 表格选择
		sendMulti (data) {
			this.multipleSelection = data
		},
		// 申请舱位
		stockApply (row) {
			this.stockApplyDate = row
			this.stockApplyShow = true
			this.$nextTick(() => this.$refs.form.clearValidate())
		},
		// 关闭弹窗
		closeDialog () {
			this.form.applyCount = 1
			this.form.applyRemark = ''
			this.form.bdQuotation = ''
			this.stockApplyShow = false
		},
		// 申请数量
		handleChange () { },
		// 提交申请
		submitApply () {
			this.$refs.form.validate((valid) => {
				if (!valid) return
				let stockId = this.stockApplyDate.stockId
				applyAdd({ stockId, ...this.form }).then((res) => {
					this.$msgSucClose(` 恭喜你，申领成功！`)
					this.getData()
					this.closeDialog()
				})
			})
		},
		// 远程搜索港口下拉数据 port_of_basic  port_of_destination
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
	},
}
</script>

<style lang="scss" scoped>
.finance-page .self-dialog {
	.el-form-item {
		display: flex;
		::v-deep .el-form-item__content {
			flex: 1 1 auto;
			input {
				line-height: 26px !important;
				height: 26px !important;
			}
		}
	}
	.right-box {
		float: right;
	}
	::v-deep textarea {
		min-height: 40px !important;
	}
}
</style>