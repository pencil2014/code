<template>
	<div class="finance-page flex-page">
		<FinanceSearch :searchOption="searchOption" @search="search" :border="true" />
		<div class="finance-list-container">
			<div class="money-box">
				<div class="money-box-left">
					<el-button-group>
						<el-button type="primary" class="finance-btn" size="mini" @click="addConfigDialog()">新增</el-button>
					</el-button-group>
					<!-- <el-button-group>
						<el-button class="finance-btn" size="mini" @click="setHp">提高优先级</el-button>
						<el-button class="finance-btn" size="mini" @click="cancelHp">取消优先级</el-button>
					</el-button-group> -->
					<el-button-group>
						<el-button class="finance-btn" size="mini" @click="startTask">启动任务</el-button>
						<el-button class="finance-btn" size="mini" @click="stopTask">暂停任务</el-button>
					</el-button-group>
					<el-button-group>
						<el-button class="finance-btn" size="mini" @click="deleteTask">删除任务</el-button>
					</el-button-group>
				</div>
				<div class="money-box-right"></div>
			</div>
			<FinanceTable :option="tableOption" @send-multi="sendMulti" />
		</div>
		<ooclTaskDialog :dialog-visible="dialogVisible" ref="ooclTaskDialog" @relateSuc="getData" />
		<el-dialog title="提高优先级" :visible.sync="setHpOpen" width="600px">
			<el-form :model="setHpForm" ref="setHpForm" label-width="80px">
				<el-form-item
					label="选择时间:"
					prop="startTime"
					:rules="{
						required: true,
						message: '时间不能为空',
						trigger: 'blur'
					}"
				>
					<el-date-picker v-model="setHpForm.startTime" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="handleSubmit" size="mini">确定</el-button>
				<el-button @click="closeRefuse" size="mini">取消</el-button>
			</span>
		</el-dialog>
    <div class="show-log" v-if="logOption.show">
      <TaskLog :config="logOption" />
    </div>
	</div>
</template>
<script>
import Vue from 'vue'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import ooclTaskDialog from '@/views/exec/bkg/components/ooclTaskDialog'
import TaskLog from './taskLog'
import { ooclTaskList, coscoTaskDelete } from '@/api/exec/autobook'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin as mixin2 } from '@/views/finance/voucher/mixin'
import { dateFormat } from '@/views/finance/utils/finance'
import { cityOoclList, setOoclHp, cancelOoclHp, startOoclTask, stopOoclTask, deleteOoclTask, ooclUserList } from '@/api/exec/cosco'

export default {
	name: 'cocosTaskList',
	mixins: [mixin, mixin2],
	data() {
		return {
			// 列表页--表格配置
			tableOption: {},
			// 列表页--搜索配置
			searchOption: {},
			// 列表页--选中行
			multipleSelection: [],
			isFirst: true,
			loading: false,
			dialogVisible: { show: false },
			multipleSelection: [],
			setHpOpen: false,
			setHpForm: {
				startTime: ''
			},
      logOption: {
        show: false,
        taskType: '',
        taskId: ''
      }
		}
	},
	watch: {},
	// table基础组件
	components: {
		FinanceTable,
		FinanceSearch,
		ooclTaskDialog,
    TaskLog
	},
	async created() {
		this.isFirst = false
		// 搜索配置
		this.searchOption = {
			addFilter: {
				defaultSearchLength: 5,
				searchInputGroup: [
					{ key: 'companyCode', value: '', showType: '5' },
					{ key: 'porCityId', value: '', showType: '1' },
					{ key: 'fndCityId', value: '', showType: '2' },
					{ key: 'taskTime', value: '', showType: '3' },
					{ key: 'startDate', value: '', showType: '4' },
					{ key: 'emergencyEmail', value: '', showType: '5' },
					// { key: 'isHp', value: '', showType: '6' },
					{ key: 'status', value: '', showType: '7' }
				],

				filterGroups: {
					companyCode: { label: '分公司', type: 'select', showType: '5', selectOptions: [] },
					porCityId: {
						label: '起始地',
						type: 'remoteSelect',
						showType: '1',
						remoteMethod: (queryString, item, row) => {
							this.cityQuery(queryString, item)
						},
						visibleChange: (queryString, item, row) => {
							this.cityQuery(queryString, item)
						},
						remoteSelectList: []
					},
					fndCityId: {
						label: '目的地',
						type: 'remoteSelect',
						showType: '2',
						remoteMethod: (queryString, item, row) => {
							this.cityQuery(queryString, item)
						},
						visibleChange: (queryString, item, row) => {
							this.cityQuery(queryString, item)
						},
						remoteSelectList: []
					},
					taskTime: { label: '任务起始时间', type: 'daterange', showType: '3' },
					startDate: { label: '订舱起始时间', type: 'daterange', showType: '4' },
					emergencyEmail: { label: '紧急联系人', type: 'input', showType: '5' },
					// isHp: { label: '是否优先级', type: 'select', prop: 'yesNo', showType: '6' },
					status: { label: '任务状态', type: 'select', prop: 'bkgTaskStatus', showType: '7' }
				}
			}
		}
		ooclUserList({}).then(res => {
			console.log('🚀 ~ res.data', res.data)
			let data = res.data.map(item => {
				return {
					label: item.companyCname,
					value: item.companyCode
				}
			})
			this.searchOption.addFilter.filterGroups.companyCode.selectOptions = data
		})
		// 表格配置
		let pagination = Object.assign({}, this.option.pagination, { show: true })
		let operationBtns = Object.assign({}, this.option.operationBtns, {
			data: [
				{ label: '复制', type: 'text', show: true, action: 'Delete' },
				{ label: '详情', type: 'text', show: true, action: 'showDetail' },
        { label: '日志', type: 'text', show: true, action: 'showLog' }
			]
		})
		this.tableOption = Object.assign({}, this.option, {
			id: 'option1',
			data: [],
			tips: { text: '', show: false },
			operationBtns,
			pagination
		})
		this.tableOption.operationBtns.width = '120px'
		let sliceTime = (str, begin, end) => (str ? str.substring(begin || 0, end || 10) : '')
		this.tableOption.columns = [
			{ label: '任务名称', prop: 'taskType', propInDict: 'bkgTaskName', type: 'select' },
			{ label: '分公司', prop: 'companyName' },
			{ label: '起始地', prop: 'porCityName' },
			{ label: '目的地', prop: 'fndCityName' },
			{ label: '箱型', prop: 'containerType' },
			{ label: '箱量', prop: 'quantity' },
			{ label: '任务开始时间', prop: 'taskStartTime' },
			{ label: '任务结束时间', prop: 'taskEndTime' },
			{ label: '是否优先级', prop: 'isHp', type: 'select', propInDict: 'yesNo' },
			{ label: '优先级开始时间', prop: 'hpBeginTime' },
			{ label: '优先级结束时间', prop: 'hpEndTime' },
			{ label: '任务状态', prop: 'status', propInDict: 'bkgTaskStatus', type: 'select' },
			{ label: '任务执行次数', prop: 'runTimes' },
			{ label: '任务通知类型', prop: 'noticeType', type: 'select', propInDict: 'bkgNoticeType' },
			// { label: '任务通知邮箱', prop: 'noticeEmail' },
			// { label: '钉钉通知Token', prop: 'noticeDingToken', width: '230' },
			{ label: 'ETD开始时间', prop: 'startDate', formatter: row => sliceTime(row.startDate) },
			{ label: 'ETD结束时间', prop: 'endDate', formatter: row => sliceTime(row.endDate) },
			{ label: '最大可定金额', prop: 'maxPrice' },
			// { label: '保价服务', prop: 'includeInsurance', formatter: row => (row.includeInsurance === 'yes' ? '是' : '否') },
			{ label: '紧急联系人', prop: 'emergencyEmail' }
		]
		this.getData()
	},
	methods: {

		search() {
			this.tableOption.pagination.currPage = 1
			this.getData(true)
		},
		getData(isSearch) {
			// this.loading = true
			let data = {
				currPage: this.tableOption.pagination.currPage,
				pageSize: this.tableOption.pagination.pageSize,
				query: []
			}
			this.searchOption.addFilter.searchInputGroup.forEach(item => {
				let { key, value, valueReq } = item
				if (valueReq && item[valueReq]) {
					data.query.push({
						column: valueReq,
						type: 'eq',
						value: item[valueReq]
					})
					return
				}
				if (value) {
					if (value instanceof Array) {
						if (key === 'taskTime') {
							data.query.push({
								column: 'taskStartTime',
								type: 'ge',
								value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00'
							})
							data.query.push({
								column: 'taskEndTime',
								type: 'le',
								value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59'
							})
						}
						if (key === 'startDate') {
							data.query.push({
								column: 'startDate',
								type: 'ge',
								value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00'
							})
							data.query.push({
								column: 'endDate',
								type: 'le',
								value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59'
							})
						}
					} else {
						data.query.push({
							column: key,
							value: value,
							type: 'like'
						})
					}
				}
			})
			if (isSearch) {
				this.searchBackup = data.query
			}
			data.query = this.searchBackup || []
			ooclTaskList(data)
				.then(res => {
					let { list } = res.data
					this.tableOption.data = list
					this.tableOption.pagination.currPage = res.data.currPage
					this.tableOption.pagination.pageSize = res.data.pageSize
					this.tableOption.pagination.totalCount = res.data.totalCount
				})
				.catch(console.log)
		},
		// 表格选择操作
		sendMulti(data) {
			this.multipleSelection = data
		},
		// 显示编辑对话框
		addConfigDialog(row) {
			this.dialogVisible.show = true
			this.$nextTick(() => {
				this.$refs.ooclTaskDialog.init(row)
			})
		},
		// 详情
		showDetail(row) {
			let data = { ...row, cargoInfo: JSON.parse(row.cargoInfo || '{}') }
			this.addConfigDialog(data)
		},
		//复制
		handleDelete($index, row, option) {
			let data = { ...row, taskId: undefined, cargoInfo: JSON.parse(row.cargoInfo || '{}') }
			this.addConfigDialog(data)
		},
		//只有有关键字的时候才调用查询接口
		cityQuery(queryString, item) {
			if (!queryString) {
				return (item.remoteSelectList = [])
			}
			cityOoclList({ keywords: queryString }).then(res => {
				item.remoteSelectList = res.data.list.map(item => {
					return {
						label: `${item.cityFullNameCn}-${item.cityFullNameEn}`,
						value: item.cityId
					}
				})
			})
		},
		// 提高优先级
		setHp() {
			if (!this.multipleSelection.length) return this.$msgErrClose('请先勾选要操作的数据')
			this.setHpOpen = true
		},
		handleSubmit() {
			let taskIds = this.multipleSelection.map(item => item.taskId)
			let [hpBeginTime, hpEndTime] = this.setHpForm.startTime
			let data = { taskIds, hpBeginTime, hpEndTime }
			setOoclHp(data).then(res => {
				this.$msgSucClose('恭喜你，提高优先级成功')
				this.closeRefuse()
			})
		},
		closeRefuse() {
			this.setHpOpen = false
			this.$refs.setHpForm.resetFields()
			this.getData()
		},
		// 勾选，判断有无数据， 然后执行操作
		// reqMethod请求接口, sucStr操作成功提醒
		validateRows(reqMethod, sucStr) {
			if (!this.multipleSelection.length) return this.$msgErrClose('请先勾选要操作的数据')
			let taskIds = this.multipleSelection.map(item => item.taskId)
			reqMethod({ taskIds }).then(() => {
				this.$msgSucClose(sucStr)
				this.getData()
			})
		},
		// 取消优先级
		cancelHp() {
			this.validateRows(cancelOoclHp, '恭喜你，取消优先级成功')
		},
		// 启动任务
		startTask() {
			this.validateRows(startOoclTask, '恭喜你，启动任务成功')
		},
		// 暂停任务
		stopTask() {
			this.validateRows(stopOoclTask, '恭喜你，暂停任务成功')
		},
		// 删除任务
		deleteTask() {
			if (!this.multipleSelection.length) return this.$msgErrClose('请先勾选要操作的数据')
			this.$confirm('是否确认删除这些任务?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					this.deleteTaskFn()
				})
				.catch(err => {})
		},
		deleteTaskFn() {
			let taskIds = this.multipleSelection.map(item => item.taskId)
			let data = { taskIds }
			deleteOoclTask(data).then(res => {
				this.$msgSucClose('恭喜你，删除任务成功')
				this.getData()
			})
		},
    showLog(row) {
      let {taskId} = row
      this.logOption.taskType = 'oocl'
      this.logOption.taskId = taskId
      this.logOption.show = true
    }
	}
}
</script>

<style lang="scss">
.flex-page{
  display: flex;
  flex-direction: column;
  .finance-list-container{
    flex: 1;
    display: flex;
    flex-direction: column;
    .finance-table{
      flex:1;
      .el-table--scrollable-y .el-table__body-wrapper{
        max-height: calc(100vh - 280px) !important;
      }
      .el-table{
        max-height: none !important;
      }
    }
  }
}
</style>
