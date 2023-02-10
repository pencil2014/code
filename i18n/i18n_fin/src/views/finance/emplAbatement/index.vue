<template>
	<div class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
		<div>
			<FinanceSearch :searchOption="searchOption1" @search="search" />
			<div class="finance-search-list-gap"></div>
			<div class="finance-list-container">
				<div class="money-box">
					<div class="money-box-left">
						<el-button-group v-if="!justSelect">
							<el-button type="primary" v-if="checkAuth(this.$route.name, 'btn-extract')" class="finance-btn" @click="extract" size="mini"
								>扣减提取</el-button
							>
						</el-button-group>
						<el-button-group v-if="!justSelect">
							<el-button
								v-if="checkAuth(this.$route.name, 'btn-exportEmplAbatement')"
								class="finance-btn"
								@click="exportEmplAbatement"
								size="mini"
								>导出</el-button
							>
						</el-button-group>
					</div>
					<div class="money-box-right">
						<el-button-group>
							<el-button
								class="finance-btn"
								@click="refreshListPage"
								size="mini"
								type="primary"
							>{{$t('Common.refresh')}}</el-button>
						</el-button-group>
					</div>
				</div>
				<FinanceTable :option="option1" @send-multi="sendMulti" />
			</div>
		</div>
	</div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { emplAbatementList, emplAbatementExtract, exportEmplAbatement } from '@/api/fin/emplAbatement'
import { dateFormat } from '../utils/finance'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { departmentTreeList } from '@/api/companyResource'
import { queryPayOrderByWriteoffNo } from '@/api/fin/writeoffPay'

export default {
	mixins: [mixin, mixin2, routerMixin],
	props: {
		justSelect: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			pageSizeUrl: emplAbatementList('geturl'),
      keyDownActive: true,
			option1: {},
			option2: {},
			searchOption1: {},
			departmentList: [],
			multipleSelection1: [],
			multipleSelection2: [],
			remoteSelect1: {},
			orderNo: '',
			orderBillId: '',
			feeAdjustApplyId: 0,
			autocomplete: {
			},
			selectedOptionItem: '',
			dialogVisible: false,
			settleCorpCode: '',
			settleCorpName: '',
			settleCompCode: '',
			settleCompName: '',
			source: '',
			settleOrderIds: [],
			row: '',
			isJumpRouteFromPage: false,
			agentReceipayDialogVisible: false,
			// searchModifyEffect: true,
			searchOption2: {},
		}
	},
	created () {
		this.searchOption1 = {
			columns: [
				{
					label: '员工工号',
					prop: 'employeeNo',
					type: 'input'
				},
				{
					label: '姓名',
					prop: 'employeeName',
					type: 'input'
				},
				{
					label: '扣减类型',
					prop: 'deduceType',
					type: 'select',
					propInDict: 'emplDeduceType'
				},
				{
					label: '来源',
					prop: 'sourceType',
					type: 'select',
					propInDict: 'emplAbatementSourceType'
				},
				{
					label: '财务日期',
					prop: 'finDate',
					type: 'dateRange',
				},
			],
			data: {
				employeeNo: '',
				employeeName: '',
				deduceType: '',
				sourceType: '',
				finDate: '',
				createdDate: '',
				extractDate: '',
			}
		}
		this.searchOption2 = {
			saveDefault: true,
			isNotAutoLoad: true,
			listHeightFunc: this.computeFinTableHeight,
			addFilter: {
				plusShow: false,
				defaultSearchLength: 6,
				searchInputGroup: [
					{ key: 'employeeNo', value: '', showType: '1' },
					{ key: 'employeeName', value: '', showType: '2' },
					{ key: 'deduceType', value: '', showType: '3' },
					{ key: 'sourceType', value: '', showType: '4' },
					{ key: 'deduceAmt', value: '', showType: '5', range: { min: '', max: '' } },
					{ key: 'finDate', value: '', showType: '6' }
				],
				filterGroups: {
					employeeNo: { label: '员工工号', type: 'input', showType: '1' },
					emplAbatementNo: { label: '扣减编号', type: 'input', showType: '1' },
					writeoffNo: { label: this.$t('Hedge.writeoffNo'), type: 'input', showType: '1' },
					employeeName: { label: '姓名', type: 'input', showType: '2' },
					ownerCompCode: {
						label: this.$t('FeeList.settleComp'),
						prop: 'settleCompCode',
						type: 'remoteSelect',
						showType: '2',
						remoteMethod: (queryString, item, row) => {
							this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
						},
						visibleChange: (queryString, item, row) => {
							this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
						},
						remoteSelectList: []
					},
					deptCode: {
						label: '所属部门', prop: 'departCode', type: 'cascader', showType: '2', cascaderList: this.departmentList,
						cascaderProps: {
							children: 'childList',
							label: 'deptCname',
							value: 'deptCode',
							checkStrictly: false,
						},
					},
					deduceType: { label: '扣减类型', type: 'select', prop: 'emplDeduceType', showType: '3' },
					extractStatus: { label: '扣减状态', type: 'select', prop: 'emplAbatementExtractStatus' },
          sourceType: { label: '来源', type: 'select', prop: 'emplAbatementSourceType', showType: '4' },
					deduceAmt: { label: '扣减金额', type: 'range', showType: '5' },
					finDate: {label: this.$t('FeeList.finDate'), type: 'daterange', showType: '6' },
					createdDate: { label: this.$t('Common.createTime'), type: 'daterange', showType: '6' },
					extractDate: { label: '提取时间', type: 'daterange', showType: '6' },
				}
			}
		}
		if (!this.justSelect) {
			this.searchOption1 = this.searchOption2
		}
		let _this = this
		this.autocomplete = {
			querySearch: (queryString, cb) => {
				_this.selectedOptionItem = ''
				_this.querySettleUnit(queryString, cb)
			},
			select: (optionItem, row) => {
				_this.selectedOptionItem = optionItem
				console.log('this.selectedOptionItem:', _this.selectedOptionItem)
				_this.form.settleCorpName = optionItem.value
				_this.form.settleCorpCode = optionItem.key
			},
			change: (val, row) => {
				// 延时150ms获取select中的改变
				setTimeout(() => {
					if (_this.selectedOptionItem === '') {
						_this.form.settleCorpName = ''
						_this.form.settleCorpCode = ''
						return
					}
				}, 150)
			}
		}
		this.remoteSelect1 = {
			remoteMethod: (queryString, item) => {
				this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
			},
			visibleChange: (queryString, item) => {
				this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
			},
			change: (value, item) => {
			},
			remoteSelectList: []
		}

		let operationBtns = {}
		let pagination = Object.assign({}, this.option.pagination, {
			show: true,
      isNew: true,
		})
		this.option1 = Object.assign({}, this.option, {
			id: 'option1', $name: 'EmplAbatementList', isNew: true,
			data: [],
			tips: {
				text: '',
				show: false
			},
			operationBtns,
			pagination,
			maxHeight: this.getFinanceTableMaxHeight,
			emptyText: this.$t('Common.emptyText'),
		})
		let columns = [
			{
				prop: 'emplAbatementNo',
				label: '扣减编号',
				type: 'text',
				width: 130,
			},
			{
				prop: 'writeoffNo',
				label: this.$t('Hedge.writeoffNo'),
				type: 'button',
				width: 130,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option, subItem) => {
            let data = { writeoffReceipayNo: row.writeoffNo }
            queryPayOrderByWriteoffNo(data).then(res => {
              if (res.code === 0) {
                let writeoffType = res.data.writeoffType
                if (writeoffType === 'gedging_writeoff') {
                  this.routerPush('GedgingDetail', { source: 'gedgingDetail', gedgingApplyId: res.data.gedgingApplyId})
                } else if (writeoffType === 'receive_writeoff') {
                  this.routerPush(
                    'WriteoffRecvDetail2', 
                    { source: 'writeoffRecvDetail', writeoffReceipayNo: row.writeoffNo},
                    undefined,
                    { writeoffNo: row.writeoffNo}
                  )
                } else if (writeoffType === 'pay_writeoff') {
                  this.routerPush('WritePayDetail', { writeoffReceipayNo: row.writeoffNo })
                } else if (writeoffType === 'bad_debt_writeoff' || writeoffType === 'bad_gedging_writeoff' || writeoffType === 'bad_pre_writeoff') { // bad_debt_writeoff是老的类型，暂保留
                  this.routerPush('SettleOrderBadDetail', {source: 'detail', writeoffNopayNo: row.writeoffNo })
                } else {
                  this.$message({ message: '不支持打开此编号！', type: 'error', showClose: true })
                }
              }
            })
          },
        },
			},
			{
				prop: 'employeeNo',
				label: '工号',
				type: 'text'
			},
			{
				prop: 'employeeName',
				label: '姓名',
				type: 'text',
        width: 100,
			},
			{
				prop: 'ownerCompName',
				label: this.$t('FeeList.settleComp'),
				type: 'text',
        width: 150,
			},
			{
				prop: 'deptName',
				label: '部门',
				type: 'text',
        width: 100,
			},
			{
				prop: 'finDate',
				label: '财务日期',
				type: 'text'
			},
			{
				prop: 'deduceType',
				label: '扣减类型',
				type: 'select',
				propInDict: 'emplDeduceType'
			},
			{
				prop: 'deduceAmt',
				label: '扣减金额',
				type: 'text'
			},
			{
				prop: 'currency',
				label: this.$t('FeeList.currency'),
				type: 'select',
			},
			{
				prop: 'sourceType',
				label: '来源',
				type: 'select',
				propInDict: 'emplAbatementSourceType'
			},
			{
				prop: 'extractStatus',
				label: '扣减状态',
				type: 'select',
				propInDict: 'emplAbatementExtractStatus'
			},
			{
				prop: 'createdName',
				label: this.$t('Common.createdBy'),
        width: 100,
				type: 'text'
			},
			{
				prop: 'createdTime',
				label: this.$t('Common.createTime'),
        width: 130,
				type: 'text'
			},
			{
				prop: 'extractName',
				label: '提取人',
        width: 100,
				type: 'text'
			},
			{
				prop: 'extractTime',
				label: '提取时间',
        width: 130,
				type: 'text'
			}
		]
		this.option1.columns = columns
		this.loanBasicData()
	},
	methods: {
		getData (isSearch) {
			let data = {
				"currPage": this.option1.pagination.currPage,
				"pageSize": this.option1.pagination.pageSize,
				"query": [],

			}
			if (!this.justSelect) {
				this.searchOption2.addFilter.searchInputGroup.forEach(item => {
					let { key, value, range, req, valueReq } = item
					if (range && (range.min || range.max)) {
						if (range.min) {
							data.query.push({
								column: key + 'Min',
								type: 'eq',
								value: range.min,
							})
						}
						if (range.max) {
							data.query.push({
								column: key + 'Max',
								type: 'eq',
								value: range.max,
							})
						}
						return
					}
					if (valueReq && item[valueReq]) {
						data.query.push({
							column: valueReq,
							type: 'eq',
							value: item[valueReq],
						})
						return
					}

					if (value) {
						if (value instanceof Array) {
							if (value.length === 0) {
								return
							}
							let DateIndex = key.indexOf('Date')
							let CodeIndex = key.indexOf('Code')
							// let TimeIndex = key.indexOf('Time')
							if (DateIndex > -1) {
								data.query.push({
									column: key.slice(0, DateIndex) + 'Begin' + 'Date',
									type: 'eq',
									value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00',
								})
								data.query.push({
									column: key.slice(0, DateIndex) + 'End' + 'Date',
									type: 'eq',
									value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59',
								})
							} else if (CodeIndex > -1) {
								data.query.push({
									column: key,
									type: 'eq',
									value: value[value.length - 1]
								})
							}
						} else {
							data.query.push({
								column: key,
								type: 'eq',
								value: req || value,
							})
						}
					}
				})
			}
			if (isSearch) {
				this.searchBackup = data.query
			}
			data.query = this.searchBackup || []
      this.lsLoading = true
			emplAbatementList(data).then(res => {
				if (res.code === 0) {
					let { list } = res.data
					let data = []
					list.forEach(item => {
						data.push(item)
					})
					this.option1.data = data
          Object.assign(this.option1.pagination, res.data)
					// this.option1.pagination.currPage = res.data.currPage
					// this.option1.pagination.pageSize = res.data.pageSize
					// this.option1.pagination.totalCount = res.data.totalCount
				}
			}).finally(() => this.lsLoading = false)
		},
		extract () {
			if (this.multipleSelection1.length < 1) {
				this.$message({
					message: '请至少选择1条记录进行扣减提取！',
					type: 'error',
					showClose: true
				})
				return
			}

			this.$confirm('确认进行扣减提取吗？', this.$t('Common.tips'), {
				confirmButtonText: this.$t('Common.sure'),
				cancelButtonText: this.$t('Common.cancel'),
				type: 'warning',
			})
				.then(() => {
					let data = {
						emplAbatementNoList: this.multipleSelection1.map(item => {
							return item.emplAbatementNo
						})
					}
					emplAbatementExtract(data).then(res => {
						if (res.code === 0) {
							this.$message({
								message: '扣减成功！',
								type: 'success',
								showClose: true
							})
							this.getData()
						}
					})
				})
				.catch(() => { })
		},
		exportEmplAbatement () {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: this.option1.columns.map(item => item.prop),
        query: [...(this.searchBackup || [])],
      }
      if (this.multipleSelection1.length) {
        data.query = [
          { column: 'emplAbatementNo', type: 'in', value: this.multipleSelection1.map((v) => v.emplAbatementNo).join(',') },
        ]
      }
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'emplAbatementListExport' })

      this.lsLoading = true
      this.$store
        .dispatch('finance/downloadBlobFilePost', { uri: '/fin/common/queryDataExportExcel', data: { data } })
        .then((res) => this.aTagClick(window.URL.createObjectURL(res), '员工扣减记录.xlsx'))
        .finally(() => (this.lsLoading = false))
/* 			let params = this.buildExportParams()
			console.log(params)
			this.$store.dispatch('finance/downloadBlobFile', {
				uri: '/fin/emplAbatement/export',
				params: params || {}
			}).then(res => {
				let link = document.createElement('a')
				link.href = window.URL.createObjectURL(res)
				link.download = '员工扣减记录' + '.xlsx'
				link.click()
			}) */
		},
		//构建导出参数
		buildExportParams () {
			let params = {}
			if (this.searchBackup && this.searchBackup.length > 0) {
				this.searchBackup.map(item => {
					this.$set(params, item.column, item.value)
				})
			}
			if (this.multipleSelection1.length > 0) {
				let emplAbatementNoList = this.multipleSelection1.map(item => {
					return item.emplAbatementNo
				})
				Object.assign(params, {
					emplAbatementNos: emplAbatementNoList.join(",")
				})
			}
			return params
		},
		// 所属部门下拉框
		loanBasicData () {
			departmentTreeList({ state: 'valid' }).then((res) => {
				this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
			})
		},
		// 转化children的空数组为undefined
		getTreeData (data) {
			data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
			return data
		},
		handleSizeChange (val) {
			this.option1.pagination.pageSize = val
			this.getData && this.getData()
		},
		handleCurrentChange (val) {
			this.option1.pagination.currPage = val
			this.getData && this.getData()
		},

		sendMulti (data, option) {
			console.log(data, option)
			if (option === this.option1) this.multipleSelection1 = data
			if (option === this.option2) this.multipleSelection2 = data
		},

		search () {
			this.option1.pagination.currPage = 1
			this.getData(true)
		},

	},

	watch: {
	},
	components: {
		FinanceTable,
		FinanceSearch,
	}
}
</script>
<style>
.batch-print-create .el-dialog__body {
	padding: 40px 80px 22px;
}
.batch-print-create .el-dialog__footer {
	padding-bottom: 32px;
	text-align: center;
}
.batch-print-create .el-form .el-input {
	width: 320px;
}
.manual-regist-invoice .el-form .el-date-editor.el-input {
	width: 162px;
}
.manual-regist-invoice .el-form .el-select {
	width: 162px;
}
.manual-regist-invoice .el-form .el-input {
	width: 162px;
}
</style>