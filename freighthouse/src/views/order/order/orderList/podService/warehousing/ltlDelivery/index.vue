<template>
	<div class="edit-row" id="ltlDelivery" v-loading="lsLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
		<div class="edit-container so" id="tableCont">
			<div class="row-tit so">
				<span class="tit ft12 bold">目的港散车派送信息</span>
				<div class="row-tit-operate">
					<div class="">
						<ButtonTip
							v-if="['ship_export_fcl', 'ship_export_lcl', 'ship_bulk_ro'].includes(orderInfo.businessType)"
							btnType="default"
							:btnDisabled="(isBd && !isImportJoint) || isDisabledEdit"
							btnText="推送海外客服"
							:tipContent="isDocTip || isJointTip || isFinishTip || statusTip"
							class="operateBtn-tip"
							@click="handlePushOversea"
						>
						</ButtonTip>
						<!-- <el-button v-if="['ship_export_fcl', 'ship_export_lcl', 'ship_bulk_ro'].includes(orderInfo.businessType)" class="mr10" size="mini" type="default" :disabled="(isBd && !isImportJoint) || isDisabledEdit" @click="handlePushOversea">推送海外客服</el-button> -->
						<!-- <el-button v-if="['ship_import_fcl', 'ship_import_lcl'].includes(orderInfo.businessType)" size="mini" type="default" :disabled="(isBd && !isImportJoint) || isDisabledEdit" class="mr10" @click="handleOpenExportPop"
							>输出派车委托单</el-button
						> -->
						<el-dropdown size="small" @command="handleCommand" class="ml10">
							<el-button size="mini" type="default" :disabled="(isBd && !isImportJoint) || isDisabledEdit" class="mr10"> 输出<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
							<el-dropdown-menu slot="dropdown">
								<el-dropdown-item :command="item.value" v-for="(item, index) in exportTypeOptions" :key="index">{{ item.label }}</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
						<span class="mr10">委托状态</span>
						<el-select v-model="intrustStatus" size="mini" placeholder="请选择" clearable style="width: 120px" @change="handleUpdateStatus" :disabled="(isBd && !isImportJoint) || isDisabledEdit">
							<el-option v-for="item in dictMap.podDeliveryLtlStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
						<ButtonTip btnType="primary" :btnDisabled="(isBd && !isImportJoint) || isDisabledEdit" btnText="新增派车" :tipContent="isDocTip || isJointTip || isFinishTip || statusTip" class="operateBtn-tip ml10" :loading="isAdding" @click="handleAdd">
						</ButtonTip>
						<!-- <el-button size="mini" :loading="isAdding" type="primary" class="ml10" @click="handleAdd" :disabled="(isBd && !isImportJoint) || isDisabledEdit">新增派车</el-button> -->
					</div>
				</div>
			</div>
			<div class="row-form mt10">
				<el-table ref="ciqTable" fit highlight-current-row stripe style="width: 100%" :data="ltlList" @selection-change="handleSelectionChange">
					<el-table-column type="selection" width="50"></el-table-column>
					<el-table-column prop="intrustNo" label="委托编号" align="center" width="150"></el-table-column>
					<el-table-column prop="status" label="委托状态" align="center" width="80">
						<template slot-scope="scope">
							{{ scope.row.status | podDeliveryLtlStatusFilter }}
						</template>
					</el-table-column>
					<el-table-column v-if="$route.query.isPendding != 'pendding'" prop="overseaAgentName" label="海外代理" align="center" width="150"></el-table-column>
					<el-table-column v-if="$route.query.isPendding != 'pendding'" prop="overseasCompanyName" label="海外分公司" align="center" width="150"></el-table-column>
					<el-table-column show-overflow-tooltip="" prop="supplierName" label="车队" align="center" width="200"> </el-table-column>
					<el-table-column show-overflow-tooltip="" prop="unloadAddress" label="卸货详细地址" align="center" width="200"></el-table-column>
					<el-table-column show-overflow-tooltip="" prop="consignee" label="收货人" align="center"></el-table-column>
					<el-table-column prop="preLoadTime" label="预计派送时间" align="center" width="150"></el-table-column>
					<el-table-column prop="loadTime" label="实际派送时间" align="center" width="150"></el-table-column>
					<el-table-column prop="signTime" label="签收时间" align="center" width="150"></el-table-column>
					<el-table-column prop="signFileName" label="签收附件" width="150" align="center">
						<template slot-scope="scope">
							<div class="si-file-wrap">
								<span :title="scope.row.signFileName" size="mini" @click="handleViewFile(scope.row.signFileNo, scope.row.signFileName)">{{ scope.row.signFileName }}</span>
							</div>
						</template>
					</el-table-column>

					<!-- <el-table-column prop="intrustType_cn" label="派车类型" align="center" width="80">
						<template>
							出仓
						</template>
					</el-table-column> -->

					<!-- <el-table-column prop="supplierContact" label="车队联系人" align="center">
						<template slot-scope="scope">
							<span v-if="!scope.row.isEdit">{{ scope.row.supplierContact }}</span>
							<div v-else>
								<el-autocomplete
									style="width: 100%"
									size="mini"
									clearable
									:maxlength="16"
									v-model="scope.row.supplierContact"
									:fetch-suggestions="(queryString, cb) => querySearchContact(queryString, cb)"
									placeholder="请输入车队联系人"
									@select="value => handleSelectContact(value, scope.$index)"
								></el-autocomplete>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="supplierContactPhone" label="车队联系人电话" align="center">
						<template slot-scope="scope">
							<span v-if="!scope.row.isEdit">{{ scope.row.supplierContactPhone }}</span>
							<el-input v-else size="mini" placeholder="请输入车队联系人电话" maxlength="16" v-model="scope.row.supplierContactPhone" clearable></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="supplierPhone" label="车队联系电话" align="center">
						<template slot-scope="scope">
							<span v-if="!scope.row.isEdit">{{ scope.row.supplierPhone }}</span>
							<el-input v-else size="mini" placeholder="请输入车队联系电话" maxlength="16" v-model="scope.row.supplierPhone" clearable></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="remark" label="注意事项" align="center">
						<template slot-scope="scope">
							<span v-if="!scope.row.isEdit">{{ scope.row.remark }}</span>
							<el-input v-else size="mini" placeholder="请输入注意事项" maxlength="512" v-model="scope.row.remark" clearable></el-input>
						</template>
					</el-table-column> -->
					<el-table-column label="操作" align="center" fixed="right" width="150">
						<template slot-scope="scope">
							<div class="operate-group">
								<!-- <el-button v-if="scope.row.isEdit" :disabled="(isBd && !isImportJoint) || isDisabledEdit" @click="handleAddSave(scope.row, scope.$index)" type="text" size="mini">保存</el-button> -->
								<!-- <el-button v-if="!scope.row.isEdit" :disabled="(isBd && !isImportJoint) || isDisabledEdit" @click="handleEdit(scope.$index)" type="text" size="mini">编辑</el-button> -->

								<el-button @click="handleInfo(scope.row)" type="text" size="mini">详情</el-button>
								<ButtonTip
									btnType="text"
									:btnDisabled="(isBd && !isImportJoint) || isDisabledEdit"
									btnText="删除"
									:tipContent="isDocTip || isJointTip || isFinishTip || statusTip"
									class="operateBtn-tip"
									btnClassName="red"
									@click="handleDelete(scope.row, scope.$index)"
								>
								</ButtonTip>
								<!-- <el-button @click="handleDelete(scope.row, scope.$index)" type="text" class="red" size="mini" :disabled="(isBd && !isImportJoint) || isDisabledEdit">删除</el-button> -->
								<ButtonTip btnType="text" :btnDisabled="(isBd && !isImportJoint) || isDisabledEdit" btnText="复制" :tipContent="isDocTip || isJointTip || isFinishTip || statusTip" class="operateBtn-tip" @click="handleCopy(scope.row)"> </ButtonTip>
								<!-- <el-button @click="handleCopy(scope.row)" type="text" size="mini" :disabled="(isBd && !isImportJoint) || isDisabledEdit">复制</el-button> -->
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>
		<div class="agentDetail" v-if="detailShow">
			<Detail
				ref="detailForm"
				:isDocTip="isDocTip"
				:isJointTip="isJointTip"
				:isFinishTip="isFinishTip"
				:statusTip="statusTip"
				:createItem="createItem"
				:actionType="actionType"
				:isDisabledEdit="isDisabledEdit"
				@save="handleSave"
				@cancel="handleCancel"
			/>
		</div>
		<!-- 输出拖车委托单弹窗 -->
		<div v-if="exportPopShow">
			<ExportPop @close="exportPopClose" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
// import {orderJointInfo, orderInfo} from '@/api/order/list'
import { ltlIntrustListWithLoadInfo, ltlStatusChange, ltlIntrustDelete, ltlIntrustSave, ltlIntrustInfo, ltlIntrustCopy, ltlReqno } from '@/api/order/podService/ltlDelivery'
import Detail from './components/ltlDeliveryDetail'
import { supplierInfo, customerInfo } from '@/api/crm/supplier'
import { pushToEcs } from '@/api/order/podService/fclDelivery'
import ExportPop from '@/views/order/order/orderList/podService/fclDelivery/components/exportPop.vue'

const defaultCreateQuery = {
	intrustNo: '',
	intrustType: 'out',
	intrustType_cn: '出仓',
	supplierId: '',
	supplierName: '',
	supplierContact: '',
	supplierContactPhone: '',
	supplierPhone: '',
	remark: '',
	status: 'init',
	loadInfoList: [],
	overseaAgentId: '',
	overseaAgentName: '',
	overseasCompanyCode: '',
	overseasCompanyName: ''
}

export default {
	filters: {
		podDeliveryLtlStatusFilter(status) {
			return getDictLabel('podDeliveryLtlStatus', status)
		}
	},
	props: {
		// tabMenus: {
		//   type: Array,
		//   default: () => ([])
		// },
		saveBarFixed: {
			type: Boolean,
			default: false
		},
		orderInfo: {
			type: Object,
			default: () => ({})
		},
		activityType: {
			type: String,
			default: ''
		}
	},
	provide() {
		return {
			curRow: () => this.curRow
		}
	},
	data() {
		return {
			curRow: null,
			exportPopShow: false,
			actionType: 'add',
			isAdding: false,
			restaurants: [], // 供应商所有值
			contactInfo: [],
			supplierList: [],
			state: 'valid',
			ltlList: [],
			oQuery: this.$route.query,
			intrustStatus: '', // 散车委托状态
			multipleSelection: [],
			detailShow: false,
			createItem: Object.assign({}, defaultCreateQuery),
			custStr: sessionStorage.getItem('custStr'),
			serviceCode: sessionStorage.getItem('serviceCode'),
			signShow: true,
			canSave: true,
			type: '',
			currIntrustNo: ''
		}
	},
	created() {
		this.getList()
		console.log(20220512, this.dictMap.podDeliveryLtlStatus)
	},
	mounted() {},
	computed: {
		isEdit() {
			// 当前列表是否在编辑状态
			let result = this.ltlList.some(el => el.isEdit)
			return result
		},
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles,
			serviceInfoList: state => state.order.serviceInfoList,
			userId: state => state.user.userId
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isOpTruck() {
			return this.userEditRoles.includes('op_truck')
		},
		isEpricing() {
			return this.userEditRoles.includes('epricing')
		},
		isEcs() {
			return this.userEditRoles.includes('ecs')
		},
		// isBd() {
		//   let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'ac' || this.ordDetRole === 'op' || this.ordDetRole === 'op_truck' || (!this.isDoc&&!this.isEpricing&&!this.isEcs)
		//   let findItem = this.tabMenus.find(item => item.code === 'pod_ltl_delivery')
		//   let isJoint = findItem ? findItem.isJoint : false
		//   if (this.$route.query.jointNo) {
		// 		isJoint = false
		// 	}
		//   return isBd || isJoint || this.isFinish
		// },
		isJoint() {
			let serviceInfo = this.serviceInfoList.find(item => item.serviceCode === 'pod_ltl_delivery')
			let isJoint = serviceInfo ? serviceInfo.isJoint : ''
			return isJoint === 'y' && !this.$route.query.jointNo ? true : false
		},
		isBd() {
			// let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'ac' || this.ordDetRole === 'op' || this.ordDetRole === 'op_truck' || (!this.isDoc && !this.isEpricing && !this.isEcs)
			let isBd = !this.isDoc && !this.isEpricing && !this.isEcs && !this.isOp && !this.isOpTruck// 放开操作权限 v20220607
			// if(this.orderInfo.businessType ==='ship_import_fcl' && this.ordDetRole === 'op'){
			//   isBd = false
			// }
			return isBd || this.isJoint || this.isFinish
		},
		// 业务类型为进口，海外仓的
		isImport() {
			return ['ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh'].includes(this.orderInfo.businessType)
		},
		// 业务类型为出口的
		isExport() {
			return ['ship_export_fcl', 'ship_export_lcl'].includes(this.orderInfo.businessType)
		},
		// 业务类型为散杂滚装
		isBulkRo() {
			return ['ship_bulk_ro'].includes(this.orderInfo.businessType)
		},
		// 20220509特殊处理为进口协同单的服务项权限都放开
		isImportJoint() {
			return ['ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh'].includes(this.orderInfo.businessType) && ['jointList', 'whJointList'].includes(this.$route.query.source)
		},
		// isFinish() {
		// 	let findItem = this.serviceInfoList.find(item => item.serviceCode === 'pod_ltl_delivery')
		// 	let progress = findItem ? findItem.serviceStatus : ''
		// 	return progress === 'finish' ? true : false
		// },
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'pod_ltl_delivery')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isDisabledEdit() {
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if (this.isFinish) {
				return true
			} else if (['complete', 'cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus)) {
				return true
			} else {
				return false
			}
		},
		viewState() {
			return this.oQuery.action === 'view' && !this.isOp
		},
		jointState() {
			return this.oQuery.jointNo ? true : false
		},
		exportTypeOptions() {
			// 出口只有签收单
			let options = [{ label: '签收单', value: 'sign' }]
			// 进口有派车单，签收单
			if (['ship_import_fcl', 'ship_import_lcl'].includes(this.orderInfo.businessType)) {
				options = [
					{ label: '派车单', value: 'send' },
					{ label: '签收单', value: 'sign' }
				]
			}
			return options
		},
		isFinishTip() {
			if (this.isFinish) {
				return '该服务项已完成，不允许操作'
			}
		},
		isJointTip() {
			if (this.isJoint) {
				return '该服务项被协同，不允许操作'
			}
		},
		isDocTip() {
			// 出口整箱，非文件，海外客服，海外商务
			if (this.isExport || this.isBulkRo) {
				if (!this.isDoc && !this.isEpricing && !this.isEcs && !this.isOp) {
					return '非文件，操作，海外客服，海外商务，不允许操作'
				}
			}
			// 海外仓，非操作，海外客服，海外商务
			if (['ship_oversea_wh'].includes(this.orderInfo.businessType)) {
				if (!this.isDoc && !this.isEpricing && !this.isEcs) {
					return '非操作，海外客服，海外商务，不允许操作'
				}
			}
			// 进口整箱，非操作，拖报操作，海外客服，海外商务
			if (['ship_import_fcl'].includes(this.orderInfo.businessType)) {
				if (!this.isDoc && !this.isOpTruck && !this.isEpricing && !this.isEcs) {
					return '非操作，拖报操作，海外客服，海外商务，不允许操作'
				}
			}
			// 进口拼箱，非操作，拖报，海外客服，海外商务
			if (['ship_import_lcl'].includes(this.orderInfo.businessType)) {
				if (!this.isDoc && !this.isOpTruck && !this.isEpricing && !this.isEcs) {
					return '非操作，拖报操作，海外客服，海外商务，不允许操作'
				}
			}
			// 报关单，非关务操作
			if (['ship_customs', 'ship_export_customs', 'ship_import_customs'].includes(this.orderInfo.businessType)) {
				if (this.ordDetRole !== 'op_truck') {
					return '非关务操作，不允许操作'
				}
			}
		},
		statusTip() {
			if (['complete', 'cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus)) {
				return '订单状态为已取消、已完成，不允许操作'
			}
		}
	},
	components: {
		Detail,
		ExportPop
	},
	watch: {
		activityType: {
			handler(val) {
				console.log('🚀 ~ val', val)
				this.getList()
			},
			immediate: true
		}
	},
	methods: {
		// 输出
		handleCommand(command) {
			this.handleOpenExportPop(command)
		},
		handleViewFile(fileNo, fileName) {
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
		// 打开输出弹窗
		handleOpenExportPop(type) {
			if (this.multipleSelection.length !== 1) return this.$message({ type: 'warning', message: '请选择一条要导出的派送信息' })
			// 派车单
			if (type === 'send') {
				this.exportPopShow = true
			} else if (type === 'sign') {
				// 签收单默认导出excel格式附件
				this.handleExportSign()
			}
		},
		// 输出签收单
		handleExportSign() {
			let oid = this.multipleSelection[0].oid
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/shipping/delivery/ltl/export/sign',
					data: {
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo,
						oid,
						docType: 'xls'
					}
				})
				.then(res => {
					this.exportPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = `签收单${this.$route.query.orderNo}.xls` // + value.docType.toLowerCase()
					link.click()
				})
		},
		exportPopClose(action, value) {
			console.log(action, value)
			if (action === 'Confirm') {
				this.handleExport(value)
			} else {
				this.exportPopShow = false
			}
		},
		// 输出
		handleExport(value) {
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/shipping/delivery/ltl/export ',
					data: {
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo,
						oid: this.multipleSelection[0].oid,
						docType: value.docType
					}
				})
				.then(res => {
					this.exportPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = `散车委托单${this.$route.query.orderNo}.` + value.docType.toLowerCase()
					link.click()
				})
		},
		// 推送海外客服
		handlePushOversea() {
			pushToEcs({ orderNo: this.$route.query.orderNo }).then(res => {
				if (res.msg === 'success') {
					this.$message.success('推送成功!')
				}
			})
		},
		loadAll(data) {
			let arr = []
			for (let i = 0; i < data.length; i++) {
				let obj = {}
				obj.value = data[i].name || data[i].ename
				obj.mobileNo = data[i].mobileNo
				arr.push(obj)
			}
			this.contactInfo = arr
			return arr
		},
		createFilter(queryString) {
			return restaurant => {
				return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
			}
		},
		handleSelectContact(item, index) {
			if (item.value) {
				for (let i = 0; i < this.contactInfo.length; i++) {
					if (item.value === this.contactInfo[i].value) {
						this.$set(this.ltlList[index], 'supplierContactPhone', this.contactInfo[i].mobileNo)
						return
					}
				}
			}
		},
		querySearchContact(queryString, cb) {
			let restaurants = this.restaurants
			let results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
			cb(results)
		},
		// 选择车队下拉，自动填充车队联系人，联系电话
		handleSelectSupplierName(val, index) {
			if (val) {
				let label = this.supplierList.filter(o => o.value === val)[0].label
				this.$set(this.ltlList[index], 'supplierName', label)
				supplierInfo({ supplierId: val }).then(res => {
					let { contact } = res.data
					this.$set(this.ltlList[index], 'supplierContact', contact && contact.length ? contact[0].name || contact[0].ename : '')
					this.$set(this.ltlList[index], 'supplierContactPhone', contact && contact.length ? contact[0].mobileNo : '')
					this.restaurants = this.loadAll(contact)
				})
			} else {
				this.$set(this.ltlList[index], 'supplierContact', '')
				this.$set(this.ltlList[index], 'supplierContactPhone', '')
			}
		},
		supplierFilterMehod(val) {
			this.getSupplierList(val)
		},
		supplierVisibleChange(val, supplierId) {
			if (val && !supplierId) {
				this.getSupplierList()
			}
		},
		getSupplierList(val = '') {
			this.$store.dispatch('dict/querySupplierList', { category: 'serviceCode', value: 'truck', queryString: val }).then(data => {
				this.supplierList = data.list.map(item => {
					return Object.assign(item, {
						label: item.name,
						value: item.supplierId ? Number(item.supplierId) : ''
					})
				})
			})
		},
		// 获取散车派送列表
		getList() {
			this.lsLoading = true
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_ltl_delivery_bonded' ? 'Y' : 'N'
			ltlIntrustListWithLoadInfo({ isBonded, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo })
				.then(res => {
					this.ltlList = res.data || []
				})
				.finally(() => {
					this.lsLoading = false
				})
		},
		// 获取散车派送委托编号
		// handleGetIntrustNo() {
		//   ltlReqno().then(res => {
		//     let intrustNo = res.data.seqNo || ''
		//     let cust = JSON.parse(this.custStr)
		//     this.createItem = Object.assign({}, defaultCreateQuery, {
		//       intrustNo,
		//       supplierId: this.orderInfo.transport ? this.orderInfo.transport.truckSupplierId : '' ,
		//       supplierName: this.orderInfo.transport ? this.orderInfo.transport.truckSupplierName : ''
		//     })
		//   })
		// },
		handleGetIntrustNo() {
			this.isAdding = true
			ltlReqno().then(res => {
				let intrustNo = res.data.seqNo || ''
				this.createItem = Object.assign({}, defaultCreateQuery, {
					intrustNo,
					supplierId: this.orderInfo.transport ? this.orderInfo.transport.truckSupplierId : '',
					supplierName: this.orderInfo.transport ? this.orderInfo.transport.truckSupplierName : ''
				})
				// let obj = {
				// 	intrustNo: intrustNo,
				// 	status: 'init',
				// 	intrustType_cn: '出仓',
				// 	intrustType: 'out',
				// 	supplierId: this.orderInfo.transport ? this.orderInfo.transport.truckSupplierId : '',
				// 	supplierName: this.orderInfo.transport ? this.orderInfo.transport.truckSupplierName : '',
				// 	supplierContact: '',
				// 	supplierContactPhone: '',
				// 	supplierPhone: '',
				// 	remark: '',
				// 	isEdit: true
				// }
				// this.supplierList = [{ label: obj.supplierName, value: obj.supplierId }]
				this.detailShow = true
				// this.ltlList.push(obj)
				this.isAdding = false
			})
		},
		// 新增
		// handleAdd() {
		//   this.type = 'add'
		//   this.detailShow = true
		//   this.signShow = false
		//   this.handleGetIntrustNo()
		// },
		handleAdd() {
			// if (this.isEdit) {
			// 	this.$message.warning('请先保存正在编辑的数据')
			// 	return
			// }
			this.actionType = 'add'
			this.handleGetIntrustNo()
		},
		handleAddSave(row, index) {
			if (this.detailShow) {
				this.$message.warning('请先保存派送信息')
				return
			}
			this.handleSave(row)
			this.$set(this.ltlList[index], 'isEdit', false)
		},
		handleEdit(index) {
			if (this.isEdit) {
				this.$message.warning('请先保存正在编辑的数据')
				return
			} else if (this.detailShow) {
				this.$message.warning('请先保存派送信息')
				return
			} else {
				this.supplierList = [{ label: this.ltlList[index].supplierName, value: this.ltlList[index].supplierId }]
				for (let i = 0; i < this.ltlList.length; i++) {
					this.$set(this.ltlList[i], 'isEdit', false)
				}
				this.$set(this.ltlList[index], 'isEdit', true)
			}
		},
		// 详情
		handleInfo(row) {
			this.curRow = row
			if (this.isEdit) {
				this.$message.warning('请先保存正在编辑的数据')
				return
			}
			this.actionType = 'info'
			this.currIntrustNo = row.intrustNo
			let { orderNo, jointNo } = this.$route.query
			this.getInfo(orderNo, jointNo, this.currIntrustNo)
		},
		// 复制
		handleCopy(row) {
			this.actionType = 'copy'
			this.currIntrustNo = row.intrustNo
			let { orderNo, jointNo } = this.$route.query
			this.getInfoCopy(orderNo, jointNo, this.currIntrustNo)
		},
		getInfo(orderNo, jointNo, intrustNo) {
			ltlIntrustInfo({ orderNo, jointNo, intrustNo }).then(res => {
				for (let i in defaultCreateQuery) {
					this.createItem[i] = res.data[i]
				}
				this.createItem.intrustType_cn = '出仓'
				console.log('🚀 ~ this.createItem', this.createItem)
				this.detailShow = true
			})
		},
		getInfoCopy(orderNo, jointNo, intrustNo) {
			ltlIntrustCopy({ orderNo, jointNo, intrustNo }).then(res => {
				for (let i in defaultCreateQuery) {
					this.createItem[i] = res.data[i]
				}
				this.createItem.intrustType_cn = '出仓'
				console.log('🚀 ~ this.createItem', this.createItem)
				this.detailShow = true
			})
		},
		// 删除
		handleDelete(row, index) {
			if (!row.oid) {
				this.ltlList.splice(index, 1)
				return
			}
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						intrustNo: row.intrustNo,
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo
					}
					return ltlIntrustDelete(data)
				})
				.then(response => {
					this.$message({
						message: '删除成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							if ((row.intrustNo = this.createItem.intrustNo)) {
								this.detailShow = false
							}
							this.getList()
						}
					})
				})
				.catch(() => {
					this.getList()
				})
		},
		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
		},
		// 获取选中的intrustNo
		getOids() {
			let intrustNos = []
			this.multipleSelection.map(item => {
				intrustNos.push(item.intrustNo)
			})
			return intrustNos
		},
		validate() {
			return true
		},
		// 修改散车委托状态
		handleUpdateStatus(val) {
			if (!val) return
			if (!this.multipleSelection.length) {
				return this.$message({
					type: 'error',
					message: '请选择目的港散车派送信息',
					duration: 1000,
					onClose: () => {
						this.intrustStatus = ''
					}
				})
			}
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return ltlStatusChange({
						intrustNos: this.getOids(),
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo,
						status: val,
						serviceCode: 'pod_ltl_delivery'
					})
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '修改委托状态成功',
						duration: 1000,
						onClose: () => {
							this.intrustStatus = ''
							this.getList()
							// 修改委托状态后刷新详情
							if (this.curRow) this.handleInfo(this.curRow)
							// if (this.detailShow && this.type === 'info') {
							// 	this.getInfo(this.$route.query.orderNo, this.$route.query.jointNo, this.currIntrustNo)
							// }
						}
					})
				})
				.catch(err => {
					this.intrustStatus = ''
				})
		},
		// 保存
		handleSave(values) {
			console.log(values)
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_ltl_delivery_bonded' ? 'Y' : 'N'
			let data = Object.assign({}, values, { isBonded })
			data.orderNo = this.oQuery.orderNo
			data.jointNo = this.oQuery.jointNo
			data.serviceCode = 'pod_ltl_delivery'
			if (!this.canSave) return
			this.canSave = false
			this.saveDetail(data)
		},
		saveDetail(data) {
			ltlIntrustSave(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							this.canSave = true
							this.detailShow = false
							this.getList()

							let ecsObj = this.orderInfo.workAssign.find(item => item.jobCode === 'ecs')
							console.log('🚀 ~ this.orderInfo', this.orderInfo)
							let ecsId = ''
							if (ecsObj) {
								ecsId = ecsObj.employeeId
							}
							// 海运出口 创建人不是本订单的海外客服人员
							if (!['ship_import_fcl', 'ship_import_lcl'].includes(this.orderInfo.businessType) && ecsId != this.userId && ['add', 'copy'].includes(this.actionType)) {
								this.$confirm('是否推送提醒给海外客服人员？', '警告', {
									confirmButtonText: '确定',
									cancelButtonText: '取消',
									type: 'warning'
								})
									.then(() => {
										pushToEcs({ orderNo: this.$route.query.orderNo })
									})
									.catch(() => {})
							}
						}
					})
				})
				.catch(err => {
					this.getList()
					setTimeout(() => {
						this.canSave = true
					}, 2000)
				})
		},
		// 上传文件回调
		handleImportFile(value) {
			let { orderNo, jointNo } = this.$route.query
			this.getInfo(orderNo, jointNo, value)
		},
		// 取消
		handleCancel() {
			this.detailShow = false
		}
	}
}
</script>
<style lang="scss">
@import '../../../../less/index.scss';
#ltlDelivery {
	padding: 0 10px;
	.si-file-wrap {
		width: 100%;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.si-file-wrap span {
		cursor: pointer;
		color: #1890ff;
	}
	.operateBtn-tip {
		padding: 0;
		display: inline-block;
	}
}
#ltlDelivery .edit-container.so {
	padding: 0;
}
</style>
