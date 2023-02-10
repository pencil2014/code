<template>
	<div class="edit-container" id="applyDetail" v-loading="lsLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
		<div class="save-row">
			<div class="tit">放单申请</div>
			<div class="btn-groups">
				<el-button size="mini" type="primary" @click="handleSave" :disabled="false" :loading="loading">保存</el-button>
				<el-button size="mini" type="default" @click="handleBack" :disabled="false">返回</el-button>
			</div>
		</div>
		<el-form ref="apply" :rules="rules" :model="createdItem" label-position="right" label-width="75px" class="apply-form">
			<el-row class="apply-form-row">
				<el-col :span="6">
					<el-form-item :show-message="false" label="工作号">
						<el-input :style="{ width: '100%' }" size="mini" placeholder="请输入" v-model="param.orderNo" disabled></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item class="apply-form-flex" :show-message="false" label="提单号">
						<i class="icon-hbl" v-if="param.blType">{{ param.blType === 'hbl' ? 'H' : 'M' }}</i>
						<el-input :style="{ width: '100%' }" size="mini" placeholder="请输入" v-model="param.blNo" disabled></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item :show-message="false" label="出单方式" prop="blMode">
						<el-select v-model="param.blMode" size="mini" clearable placeholder="请选择" :style="{ width: '100%' }" disabled>
							<el-option v-for="(item, index) in dictMap.blMode" :label="item.label" :value="item.value" :key="index"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col v-if="!isSpecialApply && ['original', 'jthdlzb', 'thzb'].includes(param.blMode)" :span="6">
					<el-form-item label-width="110px" :show-message="false" label="是否正本改目放">
						<el-radio-group v-model="param.isOriginalToPod">
							<el-radio label="N">否</el-radio>
							<el-radio label="Y">是</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row class="apply-form-row">
				<el-col :span="6">
					<el-form-item :show-message="false" label="委托单位">
						<el-input :style="{ width: '100%' }" size="mini" placeholder="请输入" v-model="param.custName" disabled></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item :show-message="false" label="销售">
						<el-input :style="{ width: '100%' }" size="mini" placeholder="请输入" v-model="param.bdEmployeeName" disabled></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item class="apply-form-unit" :required="!(param.blType === 'hbl' && createdItem.applyType === 'exw')" :show-message="false" label="结算单位" prop="custId">
						<el-select filterable multiple collapse-tags v-model="createdItem.custId" size="mini" clearable placeholder="请选择" @change="handleCustSettleUnit" :style="{ width: '100%' }">
							<el-option v-for="(item, index) in custSettleUnitList" :label="item.label" :value="item.value" :key="index"></el-option>
						</el-select>
						<el-tooltip class="item" effect="dark" content="若无结算单位,请在订单费用列表关联下提单号." placement="top">
							<i class="el-icon-question"></i>
						</el-tooltip>
					</el-form-item>
				</el-col>
				<el-col :span="6" v-if="!isSpecialApply">
					<el-form-item :required="true" :show-message="false" label="申请原因" prop="applyType">
						<el-select v-model="createdItem.applyType" size="mini" clearable placeholder="请选择" @change="handleSelectApplyType" :style="{ width: '100%' }" :disabled="comBlFinApplyType.length === 1">
							<el-option v-for="(item, index) in comBlFinApplyType" :label="item.label" :value="item.value" :key="index"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row class="apply-form-row" v-if="!isSpecialApply">
				<el-col :span="24">
					<el-form-item label="申请备注" prop="applyRemark" :required="false" :show-message="false">
						<el-input maxlength="512" show-word-limit :style="{ width: '100%' }" type="textarea" size="mini" :rows="3" placeholder="请输入" v-model="createdItem.applyRemark"></el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row class="apply-form-row" v-if="!isSpecialApply">
				<el-col :span="24">
					<el-form-item label="附件" prop="fileName" :required="false" :show-message="false">
						<el-upload ref="upload" drag :multiple="true" class="upload-file-cont" action="#" :auto-upload="false" :on-change="handleChangeFile" :on-remove="handleRemove" :file-list="fileList">
							<div class="file-upload">
								<img class="file-upload-img" :src="require('@/assets/icon-upload.png')" />
								<div class="file-upload__text">
									<div class="txt">点击或将文件拖拽到这里导入</div>
									<p class="info">支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
								</div>
							</div>
						</el-upload>
					</el-form-item>
				</el-col>
			</el-row>

			<div class="apply-form-row warning" v-if="Object.keys(tipsObj).length">
				<div class="label-li">注意：</div>
				<div class="value-fr">
					<div v-for="(item, key) in tipsObj" :key="key">{{ item }}</div>
				</div>
			</div>
			<!-- 海外分公司的不显示押柜信息 isAbroad = yes-->
			<div class="apply-form-row warning" v-if="createdItem.applyType === 'pledge' && param.isAbroad !== 'yes' && pledgeOrderNos">
				<div class="label-li"></div>
				<div class="value-fr">
					{{ `所选的被押提单，已被工作号${pledgeOrderNos}押了，是否要继续用来押？` }}
				</div>
			</div>
			<div class="apply-form-row warning" v-if="createdItem.applyType === 'dzg' && isDzgOrder && dzgBlNos">
				<div class="label-li"></div>
				<div class="value-fr">
					{{ `该被押工作号，已被提单${dzgBlNos}押了，是否要继续用来押？` }}
				</div>
			</div>
			<!-- specialApplyBtnShow -->
			<div class="apply-form-row warning" v-if="specialApplyBtnShow && !isSpecialApply">
				<div class="value-fr">
					<span>若需特殊申请，提交高层审批，可点击</span>
					<el-button type="primary" size="mini" class="btn-special" @click="clickSpecialApplyBtn">特殊申请</el-button>
				</div>
			</div>
			<!-- 结算单位table -->
			<el-table border fit highlight-current-row style="width: 100%" ref="settleList" :data="tableData" class="settle-list-table" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
				<el-table-column prop="settleCorpName" label="结算单位" align="center" width="300"></el-table-column>
				<el-table-column prop="settleCycle" label="结算方式" align="center" width="90">
					<template slot-scope="scope">
						{{ scope.row.settleCycle | getDictLabelFilter('settleCycle') }}
					</template>
				</el-table-column>
				<el-table-column prop="isArrear" label="是否超期" align="center" width="80">
					<template slot-scope="scope">
						<span :class="{ red: scope.row.isArrear === 'yes' }">{{ scope.row.isArrear === 'yes' ? '是' : '否' }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="arrearDays" label="超期天数" align="center" width="80"></el-table-column>
				<el-table-column prop="isOverQuota" label="是否超额" align="center" width="80">
					<template slot-scope="scope">
						<span :class="{ red: scope.row.isOverQuota === 'yes' }">{{ scope.row.isOverQuota === 'yes' ? '是' : '否' }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="currency" label="币别" align="center" width="80"></el-table-column>
				<el-table-column prop="unrecvUsdAmt" label="未收金额" align="center"></el-table-column>
				<el-table-column prop="arrearAmt" label="超期金额" align="center">
					<template slot="header">
						超期金额
						<el-tooltip class="item" effect="dark" placement="top" content="超期金额=原超期金额-账期内和之前未付金额-账期内和之前预收款金额。">
							<i class="el-icon-question" style="font-size: 14px"></i>
						</el-tooltip>
					</template>
					<template slot-scope="scope">
						<span class="red">{{ scope.row.arrearAmt }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="orginArrearAmt" label="原超期金额" align="center"></el-table-column>
				<el-table-column prop="overQuotaAmt" label="超额金额" align="center">
					<template slot="header">
						超额金额
						<el-tooltip class="item" effect="dark" placement="top" content="超额金额=原超额金额-所有预收款金额。">
							<i class="el-icon-question" style="font-size: 14px"></i>
						</el-tooltip>
					</template>
					<template slot-scope="scope">
						<span class="red">{{ scope.row.overQuotaAmt }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="orginOverQuotaAmt" label="原超额金额" align="center"></el-table-column>
				<el-table-column prop="arrearUnpayUsdAmt" label="账期未付金额" align="center"></el-table-column>
				<el-table-column prop="fiscalTermPreReceiveAmt" label="账期内预收金额" align="center"></el-table-column>
				<el-table-column prop="preReceiveAmt" label="预收款金额" align="center"></el-table-column>
				<el-table-column prop="preReceiveAmt" label="查看信控配置" align="center" width="100">
					<template slot-scope="scope">
						<el-button size="mini" type="text" class="" @click="handleViewCustName(scope.row)">查看</el-button>
					</template>
				</el-table-column>
			</el-table>
			<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
			<!-- 特殊申请 -->
			<template v-if="specialApplyBtnShow && isSpecialApply">
				<div class="pledge-cont">
					<div class="apply-form-row warning">
						<!-- 业务发起 ['bd_guarantee_special','bd_other_special'].includes(createdItem.applyType)-->
						<span v-if="isBdSpecialApply">本次为特殊申请，需逐级进行审批：销售经理审批-->总裁办审批-->财务主管审批。请详细描述申请原因、备注。</span>
						<!-- 财务发起 -->
						<span v-if="isAcSpecialApply">本次为特殊申请，需提交给财务主管审批。请详细描述申请原因、备注。</span>
					</div>
				</div>
				<el-row class="apply-form-row">
					<el-col :span="8">
						<el-form-item :required="true" :show-message="false" label="申请原因" prop="applyType">
							<el-select v-model="createdItem.applyType" size="mini" clearable placeholder="请选择" @change="handleSelectSpecialApplyType" :style="{ width: '100%' }" :disabled="specialBlFinApplyType.length === 1">
								<el-option v-for="(item, index) in specialBlFinApplyType" :label="item.label" :value="item.value" :key="index"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row class="apply-form-row">
					<el-col :span="24">
						<el-form-item label="申请备注" prop="applyRemark" :required="true" :show-message="false">
							<el-input maxlength="512" show-word-limit :style="{ width: '100%' }" type="textarea" size="mini" :rows="3" placeholder="请输入" v-model="createdItem.applyRemark"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</template>
			<!-- 押大掌柜单 -->
			<template v-if="createdItem.applyType === 'dzg'">
				<div class="pledge-cont">
					<div class="apply-form-row warning">请输入被押单号</div>
				</div>
				<el-row class="apply-form-row">
					<el-col :span="8">
						<el-form-item :required="param.isAbroad !== 'yes'" :show-message="false" label="被押工作号" prop="pledgeOrderNo">
							<el-input :style="{ width: '225px' }" maxlength="100" size="mini" placeholder="请输入" v-model="createdItem.pledgeOrderNo" @blur="checkOrderNoIsPledged(createdItem.pledgeOrderNo)"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item :required="param.isAbroad !== 'yes'" :show-message="false" label="被押T量" prop="pledgeAmount">
							<el-input :style="{ width: '225px' }" maxlength="4" size="mini" placeholder="请输入" v-model="createdItem.pledgeAmount"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item :show-message="false" label="被押提单号" prop="pledgeBlNo">
							<el-input :style="{ width: '225px' }" maxlength="200" size="mini" placeholder="请输入" v-model="createdItem.pledgeBlNo"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</template>
			<!-- 押柜 海外分公司的不显示押柜信息 isAbroad = yes-->
			<template v-if="createdItem.applyType === 'pledge' && param.isAbroad !== 'yes'">
				<div class="pledge-cont">
					<div class="apply-form-item">
						<span style="color: red">* 因进口提单不能被押，所以进口提单不能被筛选。</span>
						<span>T量: {{ param.tAmount === '0' ? '' : param.tAmount }}</span>
					</div>
					<div class="apply-form-row warning">请选择押哪个单</div>
					<div class="apply-search">
						<Search :searchConditionHide="searchConditionHide" :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery">
							<AddFilter
								:searchInputGroup="searchInputGroup"
								:allFilterGroups="allFilterGroups"
								:filterGroups="filterGroups"
								:defaultSearchLength="defaultSearchLength"
								:index="index"
								:item="item"
								v-for="(item, index) in searchInputGroup"
								:key="'filter' + index"
							/>
						</Search>
					</div>
					<div class="apply-order-table" ref="contMultiTable">
						<BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
					</div>
				</div>
			</template>
		</el-form>
		<!-- 结算单位信控信息 -->
		<div v-if="custNameCrShow">
			<CustNameCr :title="'结算单位信控信息'" :custQuery="custQuery" @close="custNameCrPopClose" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import AddFilter from './components/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import { blPledgeOrderList, finSettList, getFinApplyReason, checkDzgOrder, blFinApply, finSpecialCreate } from '@/api/order/bl'
import { customerSettlementList } from '@/api/crm/supplier'
import { getDictLabel } from '@/utils/tools'
import CustNameCr from './components/custNameCr'

const defaultCreate = {
	applyType: '',
	custSettleUnit: '',
	custSettleUnitCode: '',
	custId: '',
	applyRemark: '',
	pledgeOrderNo: '',
	pledgeAmount: '',
	pledgeBlNo: '',
	isAbroad: 'no'
}
const defaultPage = {
	pageSize: 10,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: [],
	query: [] // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
}
const defaultSearchInputGroup = [
	{ key: '', value: '', placeholder: '时间类型', category: 'times', queryValue: '' },
	{ key: '', value: '', placeholder: '筛选类型', category: 'categorys', queryValue: '' }
]
export default {
	mixins: [routerMixin],
	data() {
		return {
			file: '',
			fileList: [],
			fileData: '',

			loading: false,
			cTimestamp: 0,
			tableData: [],
			blModeList: [],
			custSettleUnitList: [],
			state: '',
			createdItem: Object.assign({}, defaultCreate),
			rules: {},
			searchConditionHide: true,
			searchConfig: [
				{
					key: 'orderNo',
					label: '工作号',
					type: 'input',
					value: '',
					searchType: 'like'
				}
			],
			defaultSearchLength: defaultSearchInputGroup.length, // 默认显示搜索框的个数
			times: ['etdTime', 'tdTime', 'etaTime'], // 各类时间查询
			categorys: ['blNo', 'tAmount', 'polPortCode', 'podPortCode', 'unloadingPortCode', 'blMode', 'cnInfo'], // 筛选类型查询
			allFilterGroups: {
				times: {},
				categorys: {},
				all: this.filterGroups
			},
			// 查询条件下拉选项
			filterGroups: {
				blNo: { key: 'blNo', label: '提单号', type: 'input', searchType: 'like', value: '' },
				blMode: {
					key: 'blMode',
					label: '出单方式',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						{ label: '正本', value: 'original', en: 'original', parent: undefined },
						{ label: '电放', value: 'telex_release', en: 'telex_release', parent: undefined }
					],
					nonDictionary: true
				},
				tAmount: { key: 'tAmount', label: 'T量', type: 'input', searchType: 'like', value: '' },
				etdTime: { label: '预计开船时间', key: 'etdTime', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				tdTime: { label: '实际开船时间', key: 'tdTime', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etaTime: { label: '预计到港时间', key: 'etaTime', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				polPortCode: {
					key: 'polPortCode',
					label: '起运港',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_basic', this.state, 'polPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_basic', this.state, 'polPortCode', item)
					}
				},
				podPortCode: {
					key: 'podPortCode',
					label: '目的地',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_destination', this.state, 'podPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_destination', this.state, 'podPortCode', item)
					}
				},
				unloadingPortCode: {
					key: 'unloadingPortCode',
					label: '卸货港',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_discharge', this.state, 'unloadingPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_discharge', this.state, 'unloadingPortCode', item)
					}
				},
				cnInfo: { key: 'cnInfo', label: '箱号', type: 'input', searchType: 'like', value: '' }
			},
			// 默认展示的搜索条件，搜索条件分类
			searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			// table复选框多选的值
			selectedCheckbox: [],
			// table基础组件
			tableConfig: {
				style: {
					height: '400px'
				},
				tableIndex: {
					show: false
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: true,
					// 是否支持列表项选中功能
					mutiSelect: true,
					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ orderNo }) {
						return orderNo ? true : false
					}
				},
				list: [],
				defaultColumns: ['orderNo', 'blNo', 'tAmount', 'polPortName', 'podPortName', 'unloadingPortName', 'etdTime', 'tdTime', 'etaTime', 'blMode', 'cnInfo'],
				configColumns: [],
				columns: [],
				allColumns: [
					{ label: '工作号', key: 'orderNo', prop: 'orderNo', minWidth: '150px', disabled: false, fixed: true, type: 'text' },
					{ label: '提单号', key: 'blNo', prop: 'blNo', minWidth: '150px', disabled: false, type: 'text' },
					{ label: 'T量', key: 'tAmount', prop: 'tAmount', minWidth: '80px', disabled: false, type: 'text' },
					{ label: '起运港', key: 'polPortName', prop: 'polPortName', minWidth: '150px', disabled: false, type: 'text' },
					{ label: '卸货港', key: 'unloadingPortName', prop: 'unloadingPortName', minWidth: '150px', disabled: false, type: 'text' },
					{ label: '目的地', key: 'podPortName', prop: 'podPortName', minWidth: '150px', disabled: false, type: 'text' },
					{ label: '预计开船时间', key: 'etdTime', prop: 'etdTime', minWidth: '150px', disabled: false, type: 'text' },
					{ label: '实际开船时间', key: 'tdTime', prop: 'tdTime', minWidth: '150px', disabled: false, type: 'text' },
					{ label: '预计到港时间', key: 'etaTime', prop: 'etaTime', minWidth: '150px', disabled: false, type: 'text' },
					{ label: '箱号', key: 'cnInfo', prop: 'cnInfo', minWidth: '150px', disabled: false, type: 'text' },
					{
						label: '出单方式',
						key: 'blMode',
						prop: 'blMode',
						minWidth: '90px',
						disabled: false,
						type: 'text',
						formatter: (row, column) => {
							return getDictLabel('blMode', row.blMode)
						}
					}
				],
				// 操作按钮组
				operationBtns: {
					width: '120px',
					fixed: 'right',
					show: false
				},
				// 操作提示
				tips: {
					text: '',
					show: false,
					hide: true
				},
				// 分页
				pagination: {
					show: true,
					total: 0,
					hasNextPage: false,
					hasPreviousPage: false,
					isFirstPage: false,
					isLastPage: false
				}
			},
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			},
			// 选择申请原因后返回的原因、提示等信息
			canPut: '', // 是否能直接放，Y/N
			resApplyReason: {
				applyTypes: [], // 申请原因集合，按字段顺序匹配有的
				tips: {}, // 提示文案
				singleApplyTypes: {}
			},
			tipsObj: {},
			isSpecialApply: false,
			specialApplyTypeArr: ['bd_guarantee_special', 'bd_other_special', 'cust_bill_special', 'ac_other_special'],
			pledgeOrderNos: '',
			isDzgOrder: false,
			dzgBlNos: '',
			param: {},
			custNameCrShow: false,
			custQuery: {}
		}
	},
	props: {},
	created() {
		this.cTimestamp = new Date().getTime()
		this.init()
	},
	activated() {
		let timestamp = new Date().getTime()
		console.log('isUseCache', this.$route.meta.isUseCache)
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
			this.init()
		}
		// this.getCustomerList()
    // 初始化附件列表
    this.fileList=[]
	},
	mounted() {
		window.addEventListener('keydown', this.enterSearch)
		// console.log('🚀 ~ this.dictMap.blMode', this.dictMap.blMode)
	},
	destroyed() {
		window.removeEventListener('keydown', this.enterSearch)
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
		blFinApplyType() {
			// if (this.resApplyReason.applyTypes && this.resApplyReason.applyTypes.length) {
			//   return this.dictMap.blFinApplyType.filter(item => this.resApplyReason.applyTypes.includes(item.value))
			// }
			// // 批量放单申请不允许选押柜
			// if (this.param.batchApply) {
			//   return this.dictMap.blFinApplyType.filter(item => item.value != 'pledge')
			// }
			// // hbl 或 拼箱 不能选择押柜
			// else if (this.param.blType === 'hbl' || this.param.businessType.includes('lcl')) {
			//   return this.dictMap.blFinApplyType.filter(item => item.value != 'pledge' && item.value != 'dzg')
			// } else {
			//   return this.dictMap.blFinApplyType
			// }

			let { applyTypes } = this.resApplyReason
			let result = []
			if (applyTypes && applyTypes.length) {
				result = this.dictMap.blFinApplyType.filter(item => applyTypes.includes(item.value))
				// 批量放单申请不允许选押柜
				if (this.param.batchApply) {
					result = result.filter(item => item.value != 'pledge')
				} else if (this.param.blType === 'hbl') {
					//  hbl不能选择押柜 20220613放开拼箱单条件 this.param.businessType.includes('lcl')
					result = result.filter(item => item.value != 'pledge' && item.value != 'dzg')
				}
			} else {
				// 所选的提单都是hbl的
				if (this.param.blType === 'hbl') {
					result = this.dictMap.blFinApplyType.filter(item => item.value === 'exw')
				}
			}
			return result
		},
		// 普通申请原因
		comBlFinApplyType() {
			return this.blFinApplyType.filter(item => !this.specialApplyTypeArr.includes(item.value))
		},
		// 特殊申请原因
		specialBlFinApplyType() {
			return this.blFinApplyType.filter(item => this.specialApplyTypeArr.includes(item.value))
		},
		specialApplyBtnShow() {
			// return this.specialApplyTypeArr.includes(this.createdItem.applyType)
			// this.resApplyReason.applyTypes
			return this.resApplyReason.applyTypes.some(item => this.specialApplyTypeArr.includes(item)) || this.specialApplyTypeArr.includes(this.createdItem.applyType)
		},
		isBdSpecialApply() {
			return this.specialBlFinApplyType.some(item => ['bd_guarantee_special', 'bd_other_special'].includes(item.value))
		},
		isAcSpecialApply() {
			return this.specialBlFinApplyType.some(item => ['cust_bill_special', 'ac_other_special'].includes(item.value))
		}
		// blModeList() {
		// 	return [
		// 		{ label: '正本', value: 'original', en: 'original', parent: undefined },
		// 		{ label: '电放', value: 'telex_release', en: 'telex_release', parent: undefined }
		// 	]
		// }
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		tableTooltip,
		CustNameCr
	},
	methods: {
		// 新添加文件替换之前添加的文件
		handleChangeFile(file, fileList) {
			this.fileList = fileList
		},

		// 移除文件
		handleRemove(file, fileList) {
			this.fileList = fileList
		},

		// 打开委托单位弹窗
		handleViewCustName(row) {
			let custNameObj = {
				[row.custId]: row.settleCorpName
			}
			// let custSettleUnitArr = row.custSettleUnit.split(',')
			// let custIdArr = row.custId.split(',')
			// custSettleUnitArr.map((item, index) => {
			//   custNameObj[custIdArr[index]] = item
			// })
			this.custQuery = {
				...row,
				custNameObj,
				custid: row.custId,
				blMode: this.param.blMode
			}
			console.log('custNameObj', custNameObj)
			this.custNameCrShow = true
		},
		custNameCrPopClose(action) {
			this.custNameCrShow = false
		},
		// 查询押大掌柜单号是否被其他提单押了，是就显示提示信息
		checkOrderNoIsPledged(orderNo) {
			// 被押大掌柜单号为空的不请求接口
			if (!orderNo) return
			checkDzgOrder({ orderNo }).then(res => {
				let { isDzgOrder, pledgeSource } = res.data
				this.isDzgOrder = isDzgOrder
				this.dzgBlNos = pledgeSource
			})
		},
		// 鼠标移入cell
		showTooltip(row, column, cell) {
			this.tableCellMouse.cellDom = cell
			this.tableCellMouse.row = row
			this.tableCellMouse.hidden = false
		},
		// 鼠标移出cell
		hiddenTooltip() {
			this.tableCellMouse.hidden = true
		},
		clickSpecialApplyBtn() {
			this.isSpecialApply = true
			this.createdItem.applyType = ''
		},
		// 选择结算单位
		handleCustSettleUnit(val) {
			console.log('val', val)
			this.createdItem.custSettleUnit = this.custSettleUnitList.filter(item => val.includes(item.value)).map(item => item.label)
			this.createdItem.custSettleUnitCode = this.custSettleUnitList.filter(item => val.includes(item.value)).map(item => item.settleCorpCode)
			this.tableData = this.custSettleUnitList.filter(item => val.includes(item.value))
			let { singleApplyTypes, tips } = this.resApplyReason
			let typesObj = {}
			let tempObj = {}
			this.tableData.map(item => {
				if (tips[item.settleCorpCode]) {
					tempObj[item.settleCorpCode] = tips[item.settleCorpCode]
				}
				for (let i in singleApplyTypes) {
					if (item.settleCorpCode === i) {
						typesObj[i] = singleApplyTypes[i]
					}
				}
			})
			this.tipsObj = tempObj
			// 根据选择的结算单位重新获取申请原因
			console.log('typesObj', typesObj, tempObj)
			this.resApplyReason.applyTypes = this.setApplyTypes(typesObj)
			console.log('this.comBlFinApplyType', this.comBlFinApplyType)
			// 如果之前走的是特殊申请流程，而选择新的结算没有特殊申请原因的话，则返回为原来的普通申请流程
			if (this.isSpecialApply) {
				if (this.resApplyReason.applyTypes.every(item => !this.specialApplyTypeArr.includes(item))) {
					this.isSpecialApply = false
					this.createdItem.applyType = ''
					// 所选的提单都是hbl的,设置申请原因默认值为exw
					if (this.param.blType === 'hbl') {
						this.createdItem.applyType = 'exw'
					}
				}
			} else {
				// 普通申请流程的申请原因只有1个的话，前端会默认选中并置灰不可选
				this.setDefaultApplyType()
				// if (this.comBlFinApplyType && this.comBlFinApplyType.length === 1) {
				// 	this.createdItem.applyType = this.comBlFinApplyType[0].value
				// } else {
				// 	this.createdItem.applyType = ''
				// }
			}
		},
		// 获取关联费用的结算单位
		getFinSettList(applyType) {
			this.lsLoading = true
			let { orderNo, blId } = this.param
			finSettList({
				orderNo,
				blId,
				type: applyType
			})
				.then(res => {
					this.lsLoading = false
					let { data } = res
					this.tableData = data || []
					this.custSettleUnitList =
						data &&
						data.map(item => {
							return { ...item, label: item.settleCorpName, value: item.custId }
						})
					this.createdItem.custId = data && data.map(item => item.custId)
					this.createdItem.custSettleUnit = data && data.map(item => item.settleCorpName)
					this.createdItem.custSettleUnitCode = data && data.map(item => item.settleCorpCode)
					this.getFinApplyReason()
				})
				.catch(err => {
					this.lsLoading = false
					// 非批量放单申请的hbl,设置默认值为exw
					if (!this.param.batchApply && this.param.blType === 'hbl') {
						this.createdItem.applyType = 'exw'
					} else if (this.param.batchApply && this.param.blType === 'hbl') {
						// 批量放单的,全部都是hbl的
						this.createdItem.applyType = 'exw'
					}
					this.$refs.apply.clearValidate()
				})
		},
		// 获取申请原因
		getFinApplyReason() {
			let settlementInfos = this.custSettleUnitList.map(item => {
				return {
					// unitCode: item.unitCode,
					settleCorpCode: item.settleCorpCode,
					settleCompCode: item.settleCompCode,
					custid: item.custId,
					companyId: item.companyId
				}
			})
			let data = {
				orderBls: [
					{
						orderNo: this.param.orderNo,
						blId: this.param.blId
					}
				],
				settlementInfos
			}
			getFinApplyReason(data).then(res => {
				if (res.data) {
					let { canPut, applyTypes, tips, singleApplyTypes } = res.data
					this.canPut = canPut
					this.resApplyReason = {
						// applyTypes,
						applyTypes: !singleApplyTypes || !Object.keys(singleApplyTypes).length ? applyTypes : this.setApplyTypes(singleApplyTypes),
						tips,
						singleApplyTypes
					}
					this.tipsObj = tips
					this.setDefaultApplyType()
				}
			})
		},
		// 设置默认申请原因
		setDefaultApplyType() {
			if (this.comBlFinApplyType && this.comBlFinApplyType.length === 1) {
				this.createdItem.applyType = this.comBlFinApplyType[0].value
			} else {
				this.createdItem.applyType = ''
				// 贸易条款是“EXW”,设置默认值为exw
				if (this.param.isExw === 'Y' && this.comBlFinApplyType.some(item => item.value === 'exw') ) {
					this.createdItem.applyType = 'exw'
				}
			}
		},
		// 有多个结算单位的，申请原因取其交集。如果有特殊申请原因的要单独存进数组中(因为特殊申请原因的可以多个结算单位使用)
		// 20220613有多个结算单位的，申请原因取多个结算单位的交集
		setApplyTypes(typesObj) {
			let result = []
			let allTypesArr = []
			let specArr = this.specialApplyTypeArr
			// 只有一个结算单位的，直接取
			if (this.tableData.length === 1) {
				result = typesObj[this.tableData[0].settleCorpCode] || []
			} else {
				// for (let i in typesObj) {
				//   allTypesArr.push(typesObj[i])
				// }
				// console.log('allTypesArr', allTypesArr);
				// // 获取多个数组的交集
				// if (allTypesArr.length) {
				//   result = allTypesArr.reduce((prev, cur) => {
				//     return Array.from(new Set(cur.filter((item)=>prev.includes(item) || specArr.includes(item))))
				//   })
				// }
				// 申请原因取并集
				for (let i in typesObj) {
					// 如果选择了非海外分公司的，要把海外分公司的申请原因过滤掉
					if (this.tableData.find(ele => ele.companyId === null && ele.settleCorpCode === i)) {
						typesObj[i].forEach(item => {
							result.push(item)
						})
					}
				}
				result = new Set(result)
				result = Array.from(result)
				// 若是有一个不能放的，要过滤掉已收款(pay_receive)，月结(mon_settle)这两个原因
				if (this.canPut === 'N') {
					result = result.filter(item => !['pay_receive', 'mon_settle'].includes(item))
				}
				console.log('result', result)
			}
			return result
		},
		enterSearch(e) {
			if (e.keyCode === 13) {
				this.searchCallBack('Search')
			}
		},
		init() {
			this.param = { ...this.$route.query }
			console.log('this.param', this.param)
			Object.assign(this.allFilterGroups, {
				times: this.filterObj(this.times),
				categorys: this.filterObj(this.categorys),
				all: this.filterGroups
			})
			this.createdItem = Object.assign({}, defaultCreate)
			this.tableData = []
			this.selectedCheckbox = []
			this.custSettleUnitList = []
			this.isSpecialApply = false
			this.tipsObj = {}
			;(this.resApplyReason = {
				applyTypes: [],
				tips: {},
				singleApplyTypes: {}
			}),
				this.handleReset()
			this.getFinSettList('')
		},
		// 过滤对象分类，按各种编号，各种时间，筛选类型分类
		filterObj(values) {
			const result = {}
			Object.keys(this.filterGroups)
				.filter(key => {
					return values.includes(key)
				})
				.forEach(key => {
					result[key] = this.filterGroups[key]
				})
			return result
		},
		// 远程搜索港口下拉数据
		portSearch(queryString, portAttribute, state, type, item) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				// let portList = data.map(ele => {
				// 	return Object.assign(ele, {
				// 		label: ele.value,
				// 		value: ele.key
				// 	})
				// })
				// item.data = portList
				let filterArr = data.filter(ele => !item.saveList.find(o => o.value === ele.key))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: ele.value, value: ele.key }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 列表数据
		getList() {
			let orderNo = this.param.orderNo
			this.tableQuery.query = [...this.tableQuery.query, ...[{ column: 'blId', type: 'ne', value: this.param.blId }]]
			let data = Object.assign({ orderNo }, this.tableQuery)
			blPledgeOrderList(data)
				.then(response => {
					let { list, totalCount, allColumns, configColumns } = response.data
					this.tableConfig.list = list
					this.tableConfig.pagination.total = totalCount
					this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
					this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
					this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
					this.tableConfig.pagination.isLastPage = response.data.isLastPage
					this.tableQuery.currPage = response.data.currPage
					this.tableConfig.configColumns = configColumns.length ? configColumns : this.tableConfig.defaultColumns
					this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
					this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
					this.handleFilterColumns(this.tableConfig.configColumns)
				})
				.catch(() => {
					this.tableConfig.configColumns = this.tableConfig.defaultColumns
					this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
					this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
					this.handleFilterColumns(this.tableConfig.configColumns)
				})
		},
		// 查询组件回调
		searchCallBack(action) {
			let query = []
			if (action === 'Search') {
				//默认的查询条件组装tableQuery参数
				if (this.searchConfig.length) {
					this.searchConfig.forEach((item, index) => {
						let tempQuery = {}
						if (item.value) {
							Object.assign(tempQuery, {
								column: item.key,
								type: item.searchType || 'eq',
								value: item.value
							})
							query.push(tempQuery)
						}
					})
				}
				// 新增的查询条件组装tableQuery参数
				if (this.searchInputGroup.length) {
					this.searchInputGroup.forEach((item, index) => {
						let tempItem = {}
						if (item.key) {
							// 非自动补全的查询参数从item.value中取值合并到query
							if (this.filterGroups[item.key].type !== 'autocomplete') {
								// 中转港
								if (this.filterGroups[item.key].multiple) {
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value ? item.value.toString() : ''
									})
								} else if (this.filterGroups[item.key].category === 'daterange') {
									// 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
									if (item.value) query.push({ column: item.key, type: 'ge', value: item.value[0] + ' 00:00:00' }, { column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
								} else {
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value
									})
								}
							} else {
								Object.assign(tempItem, {
									column: item.key,
									type: this.filterGroups[item.key].searchType || 'eq',
									value: this.filterGroups[item.key].queryValue
								})
							}
							query.push(tempItem)
						}
					})
				}
				Object.assign(this.tableQuery, {
					query: query.filter(item => {
						return item.value
					}),
					currPage: 1
				})
				this.getList()
			}
			if (action === 'Reset') {
				this.handleReset()
			}
		},
		handleReset() {
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			this.searchConfig.forEach(item => {
				item.value = ''
			})
			Object.assign(this.tableQuery, defaultTableQuery, defaultPage)
			this.getList()
			Object.assign(this.tableConfig, { tips: { text: '', show: false } })
		},
		// 多选
		handleMuti(arr) {
			this.selectedCheckbox = arr
			this.pledgeOrderNos = arr
				.filter(item => item.pledgeSource)
				.map(item => item.pledgeSource)
				.toString()
		},
		handleSizeChange() {
			this.getList()
		},
		handleCurrentChange() {
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 获取table选中行的orderNo
		getOrderNos() {
			let orderNos = []
			this.selectedCheckbox.forEach(item => {
				orderNos.push(item.blNo)
			})
			return orderNos
		},
		// 排序
		handleSort(query) {
			this.getList()
		},
		// 过滤显示自定义的表头
		handleFilterColumns(value) {
			let { allColumns, columns } = this.tableConfig
			let temp = []
			let arr = []
			temp = allColumns.filter((item, index) => {
				return value.includes(item.prop)
			})
			// 排序 temp
			temp.sort((prev, next) => {
				const p = value.indexOf(prev.prop)
				const n = value.indexOf(next.prop)
				return p - n
			})
			temp.map(item => {
				arr.push(item.prop)
			})
			Object.assign(this.tableConfig, {
				columns: temp,
				configColumns: arr
			})
		},
		close(action, value, isSpecial) {
			this.$emit('close', action, value, isSpecial)
		},
		// 选择申请原因
		handleSelectApplyType(val) {
			console.log(val)
			if (val === 'pledge') {
				this.handleReset()
			}
			// val === 'exw' && this.getFinSettList(val)
		},
		handleSelectSpecialApplyType(val) {
			console.log('特殊申请', val)
			if (!val) {
				this.$refs.apply.clearValidate()
				// 普通申请流程的申请原因只有1个的话，前端会默认选中并置灰不可选
				// this.setDefaultApplyType()
				if (this.comBlFinApplyType && this.comBlFinApplyType.length === 1) {
					this.createdItem.applyType = this.comBlFinApplyType[0].value
				}
			}
			// 特殊申请
			if (['bd_guarantee_special', 'bd_other_special', 'cust_bill_special', 'ac_other_special'].includes(val)) {
				this.isSpecialApply = true
			} else {
				this.isSpecialApply = false
			}
		},
		validate() {
			// 如果不是海外分公司的押柜必须选择押单号，海外分公司的不做校验
			if (this.param.isAbroad !== 'yes' && this.createdItem.applyType === 'pledge' && !this.selectedCheckbox.length) {
				this.$message({ type: 'error', message: '请选择押单号' })
				return false
			}
			// 如果不是海外分公司的押大掌柜需要校验，海外分公司的不做校验
			if (this.param.isAbroad !== 'yes' && this.createdItem.applyType === 'dzg') {
				if ((this.createdItem.pledgeAmount && !/^\d+$/g.test(this.createdItem.pledgeAmount)) || this.createdItem.pledgeAmount == 0) {
					this.$message({ type: 'error', message: '被押单T量必须为正整数' })
					return false
				}
			}
			return true
		},
		// 弹窗关闭回调
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.apply.validate(valid => {
					if (valid) {
						if (!this.validate()) return
						let data = Object.assign(
							{ ...this.param },
							{
								batchApply: false,
								applyRemark: this.createdItem.applyRemark,
								custSettleUnit: this.createdItem.custSettleUnit,
								custSettleUnitCode: this.createdItem.custSettleUnitCode,
								custId: this.createdItem.custId,
								applyType: this.createdItem.applyType,
								pledgeOrderNo: this.createdItem.pledgeOrderNo,
								pledgeAmount: this.createdItem.pledgeAmount,
								pledgeBlNo: this.createdItem.pledgeBlNo
							}
						)
						// 押单订单号数组，申请类型为押单时必填
						if (this.createdItem.applyType === 'pledge') {
							let orderNos = this.getOrderNos()
							let blIds = this.selectedCheckbox.map(item => item.blId)
							data.blNos = orderNos
							data.blIds = blIds
						}
						// 所选结算单位有一个是月结的需要传这个参数
						if (this.tableData.some(item => item.settleCycle !== 'ticket')) {
							data.isContainsMonthly = 'y'
						}
						// 选择的结算单位都是海外分公司的，isAbroad传yes
						if (this.tableData.every(item => item.hasAbroadCompany === 'yes')) {
							data.isAbroad = 'yes'
						}
						this.close('Confirm', data, this.isSpecialApply)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		handleSave() {
			this.$refs.apply.validate(valid => {
				if (valid) {
					if (!this.validate()) return
					let data = Object.assign(
						{ ...this.param },
						{
							orderBl: {
								orderNo: this.param.orderNo,
								blId: this.param.blId
							},
							applyRemark: this.createdItem.applyRemark,
							custSettleUnit: this.createdItem.custSettleUnit,
							custSettleUnitCode: this.createdItem.custSettleUnitCode,
							custId: this.createdItem.custId,
							applyType: this.createdItem.applyType,
							pledgeOrderNo: this.createdItem.pledgeOrderNo,
							pledgeAmount: this.createdItem.pledgeAmount,
							pledgeBlNo: this.createdItem.pledgeBlNo
						}
					)
					// 押单订单号数组，申请类型为押单时必填
					if (this.createdItem.applyType === 'pledge') {
						let orderNos = this.getOrderNos()
						let blIds = this.selectedCheckbox.map(item => item.blId)
						data.blNos = orderNos
						data.blIds = blIds
					}
					// 所选结算单位有一个是月结的需要传这个参数
					if (this.tableData.some(item => item.settleCycle !== 'ticket')) {
						data.isContainsMonthly = 'y'
					}
					// 选择的结算单位都是海外分公司的，isAbroad传yes
					if (this.tableData.every(item => item.hasAbroadCompany === 'yes')) {
						data.isAbroad = 'yes'
					}
					this.handleAuditApply(data, this.isSpecialApply)
					// this.close('Confirm', data, this.isSpecialApply)
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},
		handleAuditApply(value, isSpecial) {
			this.loading = true
			delete value.tAmount
			delete value.orderBls
			value.custId = value.custId.toString()
			value.custSettleUnit = value.custSettleUnit.toString()
			value.custSettleUnitCode = value.custSettleUnitCode.toString()
			// let func = isSpecial ? finSpecialCreate : blFinApply
			// 特殊申请
			if (isSpecial) {
				finSpecialCreate(value)
					.then(res => {
						this.$message({
							type: 'success',
							message: '放单申请成功',
							duration: 1000,
							onClose: () => {
								this.$store.dispatch('tagsView/delView', this.$route)
								this.routerPush('BlFinApplyList')
								this.loading = false
							}
						})
					})
					.catch(err => {
						this.loading = false
					})
			} else {
				// 业务发起放单给财务审核
				value.isOriginalToPod = this.param.isOriginalToPod
				let params = {
					data: value,
					fileName: this.fileList
				}
				this.$store
					.dispatch('order/soUpload', {
						uri: '/order/fin/apply',
						params: params
					})
					.then(res => {
						if (res.data && res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '放单申请成功',
								duration: 1000,
								onClose: () => {
									this.$store.dispatch('tagsView/delView', this.$route)
									this.routerPush('BlFinApplyList')
									this.loading = false
								}
							})
						}
					})
					.finally(() => {
						this.loading = false
					})
			}
		},
		handleBack() {
			this.routerPush('BlFinApplyList')
		}
	}
}
</script>

<style lang="scss" scoped>
#applyDetail {
	margin: 10px;
	background-color: #fff;
	height: 100%;
	.el-radio-group {
		margin-left: 10px;
	}
	/deep/ .el-radio__label {
		font-size: 12px;
	}
	/deep/ .el-button--mini {
		height: 20px;
		// line-height: 20px;
		padding: 0px 7px;
	}
	/deep/ .el-select .el-tag {
		margin: 0 3px;
	}
	.save-row {
		height: 24px;
		line-height: 20px;
		padding: 2px 10px;
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid #ddd;
		.tit {
			font-size: 12px;
			font-weight: bold;
		}
	}
	.apply-form {
		padding: 10px;
		.apply-form-row {
			display: flex;
			.apply-form-unit {
				padding-right: 20px;
				position: relative;
				.el-icon-question {
					position: absolute;
					width: 12px;
					height: 12px;
					right: -18px;
					top: 4px;
					color: #bfbfbf;
				}
			}
			.apply-form-flex {
				/deep/ .el-form-item__content {
					display: flex;
				}
				.icon-hbl {
					display: inline-block;
					width: 16px;
					height: 16px;
					background: #3e80f5;
					border-radius: 2px;
					color: #fff;
					line-height: 16px;
					text-align: center;
					font-style: normal;
					margin: 2px 4px 0 0;
					font-size: 12px;
				}
			}
			&.warning {
				color: #e63923;
				margin-top: 15px;
			}
			.label-fl {
				width: 40px;
			}
			.value-fr {
				flex: 1;
				.btn-special {
					margin-left: 10px;
				}
			}
		}
		.pledge-cont {
			border-top: 1px dashed #ddd;
			padding-top: 10px;
			margin-top: 15px;
			.apply-form-item {
				font-size: 12px;
				line-height: 20px;
			}
			.apply-search {
				margin-top: 15px;
				.filter-flex {
					width: 30%;
				}
				.search-layout .operation-btns-box {
					width: auto;
				}
				/deep/ .input-container {
					margin-top: 4px;
				}
			}
		}

		/deep/ .el-form-item {
			margin-bottom: 4px;
			// height: 20px;
			line-height: 20px;
		}
		/deep/ .el-form-item__label {
			line-height: 20px;
			padding-right: 4px;
		}
		/deep/ .el-form-item__content {
			line-height: 20px;
		}
		/deep/ .el-input--mini {
			.el-input__icon {
				line-height: 20px;
			}
			.el-input__inner {
				height: 20px;
				line-height: 20px;
			}
		}
		.settle-list-table {
			margin-top: 4px;
			/deep/ .cell {
				display: block;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
		}
		/deep/ .el-table th {
			height: 24px;
			padding: 2px 0;
		}
		/deep/ .el-table__empty-block {
			min-height: 30px;
			.el-table__empty-text {
				line-height: 30px;
			}
		}
		/deep/ .el-table .el-button {
			padding: 0;
			font-size: 12px;
		}
	}
}

.apply-order-table {
	background-color: #fff;
	margin-top: 20px;
	// padding: 10px;
	.tips-abs {
		position: absolute;
		left: 50%;
		top: -30px;
		margin-left: -172px;
		z-index: 2;
	}
}
</style>
