<template>
	<div>
		<div class="finance-page">
			<FinanceSearch :searchOption="searchOption1" @search="search" />
			<div class="finance-search-list-gap"></div>
			<div class="finance-list-container">
				<div class="money-box">
					<div class="money-box-left">
						<el-button-group>
							<el-button
								class="finance-btn"
								type
								@click="handlePass"
								size="mini"
								>审批通过</el-button
							>
						</el-button-group>
						<el-button-group>
							<el-button
								class="finance-btn"
								type
								@click="handleRefuse"
								size="mini"
								>审批拒绝</el-button
							>
						</el-button-group>
					</div>
					<div class="money-box-right">
						<el-button-group>
							<el-button
								v-for="(item, index) in but"
								:key="index"
								class="finance-btn"
								plain
								@click="search(item.value)"
								size="mini"
								>{{ item.label }}</el-button
							>
						</el-button-group>
					</div>
				</div>
				<FinanceTable :option="option1" @send-multi="sendMulti" />
			</div>
			<el-dialog
				:title="title"
				:visible.sync="dialogVisible"
				:close-on-click-modal="false"
				width="660px"
			>
				<el-form
					:model="form"
					ref="form"
					:inline="true"
					label-width="100px"
					size="mini"
				>
					<el-form-item
						class="oneEighth"
						label="起运港"
						:rules="[{ required: true, message: ' ', trigger: 'change' }]"
						prop="pol"
						:show-message="true"
					>
						<el-select
							size="mini"
							v-model="form.pol"
							style="width: 200px"
							filterable
							remote
							:disabled="isDetail"
							placeholder="请输入"
							:remote-method="poltFilterMethod"
							@visible-change="polVisibleChange"
							@change="handleChangePol"
						>
							<el-option
								v-for="item in polCodeList"
								:key="item.key"
								:label="item.value"
								:value="item.key"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item
						class="oneEighth"
						label="目的港"
						:rules="[{ required: true, message: ' ', trigger: 'change' }]"
						prop="pod"
						:show-message="true"
					>
						<el-select
							size="mini"
							v-model="form.pod"
							style="width: 200px"
							filterable
							:disabled="isDetail"
							remote
							placeholder="请输入"
							:remote-method="podPortFilterMethod"
							@visible-change="podPortVisibleChange"
							@change="handleChangePodPort"
						>
							<el-option
								v-for="item in polCodeList"
								:key="item.key"
								:label="item.value"
								:value="item.key"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item
						label="系统航线"
						prop="sysLineName"
						:rules="[
							{
								required: true,
								message: '系统航线不能为空',
								trigger: 'change',
							},
						]"
					>
						<el-select
							style="width: 200px"
							size="mini"
							v-model="form.sysLineName"
							disabled
							filterable
							remote
							reserve-keyword
							placeholder="请选择航线"
						>
							<el-option
								v-for="item in sysLineCodeList"
								:key="item.key"
								:label="item.value"
								:value="item.key"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item
						label="船公司"
						prop="shipCarrierCode"
						:rules="[
							{ required: true, message: '船司不能为空', trigger: 'change' },
						]"
					>
						<el-select
							style="width: 200px"
							size="mini"
							v-model="form.shipCarrierCode"
							filterable
							remote
							reserve-keyword
							placeholder="请选择船公司"
							:remote-method="shipCarrierSearch"
							@focus="shipCarrierSearch('')"
							@change="shipCarrierChange"
						>
							<el-option
								v-for="item in shipCarrierCodeList"
								:key="item.carrierCode"
								:label="item.carrierCode"
								:value="item.carrierCode"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item
						label="箱型箱量"
						prop="containerType"
						:rules="[
							{ required: true, message: '船司不能为空', trigger: 'change' },
						]"
					>
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
					<el-form-item
						label="ETD周期"
						prop="etdTime"
						:rules="[
							{
								required: true,
								message: 'ETD周期不能为空 ',
								trigger: 'change',
							},
						]"
					>
						<el-date-picker
							v-model="form.etdTime"
							type="daterange"
							style="width: 200px"
							placeholder="请选择ETD周期"
							value-format="yyyy-MM-dd"
						></el-date-picker>
					</el-form-item>
					<el-form-item
						label="最高接受基港价格"
						prop="maxLimitPrice"
						:rules="[
							{ required: true, message: '价格不能为空', trigger: 'change' },
						]"
					>
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
								v-for="(o, key) in dictMap['currency']"
								:key="'currency' + key"
								:label="o.label"
								:value="o.value"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item
						v-if="!isDetail"
						label="商务"
						prop="verifier"
						:rules="[
							{ required: true, message: '商务不能为空', trigger: 'change' },
						]"
					>
						<el-select
							style="width: 200px"
							size="mini"
							v-model="form.verifier"
							filterable
							remote
							reserve-keyword
							placeholder="请选择商务"
							:remote-method="verifierFilterMethod"
							@visible-change="verifierVisibleChange"
							@change="handleChangeVerifier"
						>
							<el-option
								v-for="(o, key) in verifierSelectList"
								:key="'verifierSelectList' + key"
								:label="o.label"
								:value="o.value"
							></el-option>
						</el-select>
					</el-form-item>
					<!-- <div style="display: inline-block;">
            <el-form-item v-if="isDetail" label="业务" >
              <div>{{form.createName}}</div>
            </el-form-item>
            <el-form-item v-if="isDetail" label="提交时间" >
              <div>{{form.createdTime}}</div>
            </el-form-item>
          </div>-->
				</el-form>
				<span slot="footer" class="dialog-footer">
					<span v-if="isDetail" class="dialog-footer-left">
						<span v-show="form.updatedName">业务:{{ form.updatedName }}</span>
						<span v-show="form.updatedTime"
							>提交时间:{{ form.updatedTime }}</span
						>
					</span>
					<el-button type="primary" size="mini" @click="handleAddSubmit"
						>确定</el-button
					>
					<el-button size="mini" @click="dialogVisible = !dialogVisible"
						>取消</el-button
					>
				</span>
			</el-dialog>
			<el-dialog
				:title="'预测拒绝'"
				:visible.sync="rejectDialogVisible"
				:before-close="handleCancel"
				width="600px"
			>
				<el-form
					:model="query"
					ref="query"
					class="el-form-item-invoice-remark"
					label-width="80px"
				>
					<el-form-item
						label="拒绝备注"
						prop="remark"
						:rules="{
							required: true,
							message: '拒绝备注不能为空',
							trigger: 'blur',
						}"
					>
						<el-input
							type="textarea"
							:maxlength="500"
							show-word-limit
							v-model="query.remark"
						></el-input>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button type="primary" @click="handleSubmit" size="mini"
						>确定</el-button
					>
					<el-button @click="handleCancel" size="mini">取消</el-button>
				</span>
			</el-dialog>
			<el-dialog
				title="员工信息"
				:visible.sync="employDialog"
				width="600px"
				:close-on-click-modal="true"
			>
				<div class="employ-box" v-if="employeeInfo">
					<div class="base-item">
						姓名：{{ employeeInfo.cname }}({{ employeeInfo.ename }})
					</div>
					<div class="base-item">工号：{{ employeeInfo.employeeNo }}</div>
					<div class="base-item">部门：{{ employeeInfo.deptCname }}</div>
					<div class="base-item">职务：{{ employeeInfo.titleCode }}</div>
					<div class="base-item">邮箱：{{ employeeInfo.email }}</div>
					<div class="base-item">电话：{{ employeeInfo.mobileNo }}</div>
				</div>
			</el-dialog>
      <!-- 商务修改 -->
      <el-dialog
				:title="title"
				:visible.sync="editDialog"
				:close-on-click-modal="false"
				width="700px"
			>
				<el-form
					:model="form"
					ref="editform"
					:inline="true"
					label-width="110px"
					size="mini"
				>
					<el-form-item
						class="oneEighth"
						label="起运港"
						:rules="rulesMsg"
						prop="pol"
					>
						<el-select
							size="mini"
							v-model="form.pol"
							style="width: 200px"
							filterable
							remote
							multiple
							collapse-tags
							:disabled="isDetail"
							placeholder="请输入"
							:remote-method="poltFilterMethod"
							@visible-change="polVisibleChange"
						>
							<el-option
								v-for="item in polCodeList"
								:key="item.portId"
								:label="`${item.ename}(${item.cname})`"
								:value="`${item.portCode}-${item.ename}-${item.cname}`"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item
						class="oneEighth"
						label="目的港"
						:rules="rulesMsg"
						prop="pod"
					>
						<el-select
							size="mini"
							v-model="form.pod"
							style="width: 200px"
							filterable
							:disabled="isDetail"
							remote
							placeholder="请输入"
							:remote-method="podPortFilterMethod"
							@visible-change="podPortVisibleChange"
							@change="handleChangePodPort"
						>
							<el-option
								v-for="item in polCodeList"
								:key="item.portId"
								:label="`${item.ename}(${item.cname})`"
								:value="`${item.portCode}-${item.ename}-${item.cname}`"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="系统航线" prop="sysLineName" :rules="rulesMsg">
						<el-select
							style="width: 200px"
							size="mini"
							v-model="form.sysLineName"
							disabled
							filterable
							remote
							reserve-keyword
							placeholder="请选择航线"
						>
							<el-option
								v-for="item in sysLineCodeList"
								:key="item.key"
								:label="item.value"
								:value="item.key"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="船公司" prop="shipCarrierCode" :rules="rulesMsg">
						<el-select
							style="width: 200px"
							size="mini"
							v-model="form.shipCarrierCode"
							filterable
							remote
							reserve-keyword
							placeholder="请选择船公司"
							:remote-method="shipCarrierSearch"
							@focus="shipCarrierSearch('')"
							@change="shipCarrierChange"
						>
							<el-option
								v-for="item in shipCarrierCodeList"
								:key="item.carrierCode"
								:label="item.carrierCode"
								:value="item.carrierCode"
							></el-option>
						</el-select>
					</el-form-item>

					<el-form-item label="ETD周期" prop="etdTime" :rules="rulesMsg">
						<el-date-picker
							v-model="form.etdTime"
							type="daterange"
							style="width: 200px"
							placeholder="请选择ETD周期"
							value-format="yyyy-MM-dd"
						></el-date-picker>
					</el-form-item>
					<el-form-item
						label="最高接受基港价格"
						prop="maxLimitPrice"
						:rules="rulesMsg"
					>
						<el-input
							style="width: 95px"
							v-model="form.maxLimitPrice"
							maxlength="12"
							placeholder="请输入金额"
							v-lsNumber="{ value: 'number', obj: form, key: 'allotAmt' }"
							type="text"
							size="mini"
						></el-input>
						<!-- <el-input
              style="margin-left: 10px; width: 95px"
              v-model="form.currency"
              disabled
              size="mini"
            ></el-input>-->
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
					<el-form-item label="箱型箱量" prop="containerType" :rules="rulesMsg">
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
					<span v-if="isDetail" class="dialog-footer-left">
						<span v-show="form.updatedName">业务:{{ form.updatedName }}</span>
						<span v-show="form.updatedTime"
							>提交时间:{{ form.updatedTime }}</span
						>
					</span>
					<el-button type="primary" size="mini" @click="handleAddSubmit"
						>确定</el-button
					>
					<el-button size="mini" @click="closeDialog">取消</el-button>
				</span>
			</el-dialog>
		</div>
	</div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import Advertisement from '@/views/bkg/forecast/forecastList/components/advertisement'
import { forecastListPage, forecastSave, forecastPass, forecastRefuse, forecastDelete, sleList } from '@/api/bkg/bkgSaleConfig'
import { basePortList, baseSystemLineList, baseShippingCarrierList, baseCurrencyList, portSystemLineInfo, getEmployeeInfo } from '@/api/base'
import { mapState } from 'vuex'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { dateFormat } from '@/views/finance/utils/finance'
const defaultCreateQuery = {
	oid: null,
	pol: '',
	polEname: '',
	pod: '',
	podEname: '',
	podPort: {
		podCode: '',
		podEname: '',
		podCname: ''
	},
	polPorts: [],
	shipCarrierCode: '',
	shipCarrierName: '',
	sysLineCode: '',
	sysLineName: '',
	etdBeginTime: '',
	etdEndTime: '',
	containerType: '',
	containerNum: '',
	maxLimitPrice: '',
	verifier: '',
	verifierName: '',
	currency: '',
	etdTime: '',
	containerNumPerOrderArr: [''],
	containerNumPerOrder: '',
	remark: ''
}
export default {
	mixins: [mixin, mixin2, routerMixin],
	data () {
		return {
			but: [],
			searchBackup: [],
			butName: '全部',
			option1: {},
			searchOption1: {},
			multipleSelection1: [],
			isFreetime: true,
			dialogVisible: false,
			title: '',
			addType: '',
			sysLineDisabled: '',
			//船公司list
			shipCarrierCodeList: [],
			//目的港list
			polCodeList: [],
			//系统航线
			sysLineCodeList: [],
			//商务下拉
			verifierSelectList: [],
			form: Object.assign({}, defaultCreateQuery),
			query: {
				remark: '',
			},
			//预测拒绝opne
			rejectDialogVisible: false,
			//详情的控制
			isDetail: false,
			// 员工信息控制
			employDialog: false,
			employeeInfo: '',
      // 商务修改预报
      editDialog:false,
      rulesMsg: { required: true, message: ' ', trigger: 'change' },
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
				console.log(optionItem)
				alias1.selectedOptionItem = optionItem
				this.form.shipCarrierCode = optionItem.key
				this.form.shipCarrierName = optionItem.value
			},
			change: (optionItem, row) => {
				setTimeout(() => {
					if (alias2.selectedOptionItem === '') {
						this.form.shipCarrierCode = ''
						this.form.shipCarrierName = ''
						return
					}
				}, 500)
			},
		}
		this.searchOption1 = {
			addFilter: {
				defaultSearchLength: 4,
				searchInputGroup: [
					{ key: 'pol', value: '', showType: '1' },
					{ key: 'pod', value: '', showType: '2' },
					{ key: 'etdDate', value: '', showType: '3' },
					{ key: 'createdName', value: '', showType: '4' },
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
					etdDate: { label: 'ETD周期', type: 'daterange', showType: '3' },
					createdName: { label: '业务员', type: 'input', showType: '4' }
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
				show: true,
			})
			let operationBtns = Object.assign({}, this.option.operationBtns, {
			  width: '120px',
			  data: [
			    {
			      label: '编辑',
			      type: 'text',
			      showFn: row => row.verifyStatus === 'pass',
			      action: 'Edit',
			    },
			    // {
			    // 	label: '删除',
			    // 	type: 'text',
			    // 	show: true,
			    // 	action: 'Delete'
			    // }
			  ],
			})
			this.option1 = Object.assign({}, this.option, {
				id: 'option1',
				data: [...this.option.data],
				tips: {
					text: '',
					show: false,
				},
				operationBtns,
				pagination,
				// sortable: true,
			})
			let columns = [
				{
					prop: 'polPorts', label: '大船起运港', width: 125, formatter: (row) => {
						return row.polPorts.length ? row.polPorts.map(item => {
							return `${item.portEname}(${item.portCname})`
						}).join(',') : ''
					}
				},
				{
					prop: 'podPort', label: '目的港', width: 125, formatter: (row) => {
						return row.podPort ? `${row.podPort.portEname}(${row.podPort.portCname})` : ''
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
					prop: 'etdBeginTime',
					label: 'ETD周期',
					type: 'text',
					width: '90px',
					formatter: (row, pItem) => {
						return row.etdBeginTime + ' 至 ' + row.etdEndTime
					},
				},
				{
					prop: 'containerType',
					label: '柜型',
					type: 'text',
				},
				{
					prop: 'containerNum',
					label: '柜量',
					type: 'text',
				},
				{
					prop: 'maxLimitPrice',
					label: '最高接受基港价格',
					width: 135,
					type: 'text',
					formatter: (row, pItem) => {
						return row.maxLimitPrice + (row.currency ? row.currency : '')
					},
				},
				{
					prop: 'remark',
					label: '预报备注',
					type: 'text',
				},
				{
					prop: 'verifyStatus',
					label: '商务状态',
					type: 'select',
					propInDict: 'verifyStatus',
				},
				{
					prop: 'refuseReason',
					label: '拒绝备注',
					type: 'tooltip',
					width: 135,
				},
				{
					prop: 'verifierName',
					label: '商务',
					type: 'text',
				},
				{
					prop: 'createdName',
					label: '创建人',
					type: "button",
					operationBtns: {
						show: true,
						callback: (fn, index, row, option) => {
							this.getEmployeeInfo(row.createdBy)
						},
					},
				},
				{
					prop: 'createdTime',
					label: '创建时间',
					type: 'text',
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
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				query: [],
			}
			if (this.customColumnsKeys && this.customColumnsKeys.length) {
				data.columns = this.customColumnsKeys
			}
			this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
				let { key, value, range, req, valueReq } = item
				// if (range.min || range.max) {
				// 	if (range.min) {
				// 		data.query.push({
				// 			column: key + 'Min',
				// 			type: 'like',
				// 			value: range.min,
				// 		})
				// 	}
				// 	if (range.max) {
				// 		data.query.push({
				// 			column: key + 'Max',
				// 			type: 'like',
				// 			value: range.max,
				// 		})
				// 	}
				// 	return
				// }
				if (!value) return
				if (typeof value !== 'object') {
					if (valueReq && item[valueReq] && item.key === 'settleCorpName' && item.value !== '') {
						data.query.push({
							column: valueReq,
							type: 'like',
							value: item[valueReq],
						})
						console.log(item[valueReq])
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
						value: value[0],
					})
					data.query.push({
						column: 'etdEndTime',
						type: 'le',
						value: value[1],
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
				forecastListPage(data).then((res) => {
					if (res.code === 0) {
						this.decompose(res)
					}
				})
			} else {
				bkgCancelListPage(data).then((res) => {
					if (res.code === 0) {
						this.decompose(res)
					}
				})
			}
		},
		decompose (res) {
			console.log(res.data)
			let { list } = res.data
			let data = []
			list.forEach((item) => {
				data.push(item)
			})
			this.option1.data = data
			this.table1DataBackup = [...this.option1.data]
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
				oids: this.multipleSelection1.map((item) => {
					return item.oid
				}),
			}
			forecastPass(data).then((res) => {
				this.$msgSucClose('审批通过成功')
				this.getData()
			})
		},
		//审批拒绝
		handleRefuse () {
			if (this.multipleSelection1.length === 0) {
				return this.$msgErrClose('请勾选需要拒绝的项')
			}
			Object.assign(this.query, { remark: '' })
			this.rejectDialogVisible = true
		},
		//审批拒绝提交
		handleSubmit () {
			let data = {
				remark: this.query.remark.trim(),
				oids: this.multipleSelection1.map((item) => {
					return item.oid
				}),
			}
			this.$refs.query.validate((valid) => {
				if (valid) {
					forecastRefuse(data).then((res) => {
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
					forecastDelete({ oids: [row.oid] }).then((res) => {
						this.$msgSucClose('删除成功！')
						this.getData()
					})
				})
				.catch()
		},
		sendMulti (data, option) {
			if (option === this.option1) this.multipleSelection1 = data
		},

		search (data) {
			this.butName = ''
			this.buttonSearch = data
			this.option1.pagination.currPage = 1
			this.getData(true)
		},
		//详情
		showDetail (row) {
			Object.assign(this.form, {}, defaultCreateQuery)
			this.title = '预测详情'
			this.dialogVisible = true
			this.isDetail = true
			row.etdTime = [row.etdBeginTime, row.etdEndTime]
			Object.assign(this.form, {}, row)
			this.polCodeSearch(row.podEname, 'port_of_destination', 'valid')
			this.getEmployeeList()
		},
		//修改
		handleEdit (row, index) {
			this.editDialog = true
			this.isDetail = false
			this.title = '编辑预报'
			row.etdTime = [row.etdBeginTime, row.etdEndTime]
			if (row.containerNumPerOrder) [
				row.containerNumPerOrderArr = JSON.parse(row.containerNumPerOrder)
			]
			Object.assign(this.form, defaultCreateQuery, row)
			this.form.pod = `${this.form.podPort.portCode}-${this.form.podPort.portEname}-${this.form.podPort.portCname}`
			this.form.pol = this.form.polPorts.map(item => {
				return `${item.portCode}-${item.portEname}-${item.portCname}`
			})
			this.polCodeSearch(row.podEname, 'port_of_destination', 'valid')
			this.getEmployeeList()
			this.$nextTick(() => this.$refs.editform.clearValidate())
		},
		//新建
		handleAdd () {
			Object.assign(this.form, {}, defaultCreateQuery)
			this.title = '新建预报'
			this.isDetail = false
			this.dialogVisible = true
		},
		//船司
		shipCarrierSearch (queryString) {
			baseShippingCarrierList(queryString, '').then((response) => {
				this.shipCarrierCodeList = response.data
			})
		},
		shipCarrierChange (val) {
			this.form.shipCarrierName = val
		},
		//确定保存
		handleAddSubmit () {
			console.log(this.form.etdTime)
			let value = this.form.etdTime
			if (value && value.length) {
				this.form.etdBeginTime = value[0]
				this.form.etdEndTime = value[1]
			} else {
				this.form.etdBeginTime = ''
				this.form.etdEndTime = ''
			}
			this.$refs.form.validate((valid) => {
				if (valid) {
					forecastSave(this.form).then((res) => {
						this.getData()
						this.$msgSucClose('提交成功！')
						this.dialogVisible = false
					})
				}
			})
		},
		//系统航线
		sysLineSearch (queryString) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then((data) => {
				console.log(data)
				this.sysLineCodeList = data
			})
		},
		// 目的地
		handleChangePodPort (val) {
			let optionItem = this.polCodeList.filter((item) => {
				return item.key === val
			})
			this.form.podEname = optionItem[0].ename
			if (!val) {
				this.changeSysLineDisabeld(false)
			} else {
				this.initSystemLine(val)
				this.changeSysLineDisabeld(true)
			}
		},
		initSystemLine (key) {
			portSystemLineInfo(key).then((response) => {
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
			let optionItem = this.verifierSelectList.filter((item) => {
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
			let optionItem = this.polCodeList.filter((item) => {
				return item.key === val
			})
			this.form.polEname = optionItem[0].ename
			if (!val) {
				this.changeSysLineDisabeld(false)
			} else {
				this.initSystemLine(val)
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
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then((data) => {
				this.polCodeList = data
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
		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch (queryString, cb) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then((data) => {
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
				sysLineCode: '100075010',
				shipCarrierCode: this.form.shipCarrierCode,
			}
			sleList(data)
				.then((res) => {
					console.log(res)
					this.verifierSelectList = res.data.map((item) => {
						return {
							label: item.employeeName,
							value: item.employeeId,
						}
					})
				})
				.catch((err) => {
					console.log(err)
				})
		},
		// 根据用户ID获取详细信息
		getEmployeeInfo (employeeId) {
			let data = {
				employeeId
			}
			getEmployeeInfo(data).then(res => {
				this.employeeInfo = res.data
				this.employDialog = true
			}).catch(() => { })
		},
    	//确定保存
		handleAddSubmit () {
			let value = this.form.etdTime
			if (value && value.length) {
				this.form.etdBeginTime = value[0]
				this.form.etdEndTime = value[1]
			} else {
				this.form.etdBeginTime = ''
				this.form.etdEndTime = ''
			}
			this.form.polPorts = []
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
			this.form.containerNumPerOrder = JSON.stringify(this.form.containerNumPerOrderArr)
			this.$refs.editform.validate((valid) => {
				if (valid) {
					forecastSave(this.form).then((res) => {
						this.getData()
						this.$msgSucClose('提交成功！')
						this.closeDialog()
					})
				}
			})
		},
    closeDialog () {
			this.editDialog = false
			this.$refs.editform.resetFields()
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
	},
	computed: {
		...mapState({
			dictMap: (state) => state.dict.dictMap,
			role: (state) => state.user.role,
			bdRoles: (state) => state.user.bdRoles,
			opRoles: (state) => state.user.opRoles,
		}),
	},
	watch: {},
	components: {
		FinanceTable,
		FinanceSearch,
		Advertisement,
	},
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

<style lang="scss" scoped>
.employ-box {
	display: flex;
	flex-wrap: wrap;
	.base-item {
		flex: 1;
		flex-basis: 50%;
		margin-bottom: 10px;
	}
}
</style>

<style lang="scss">
.dialog-footer-left {
	float: left;
	span {
		margin-right: 32px;
		margin-left: 32px;
	}
}
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
