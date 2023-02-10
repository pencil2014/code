<template>
	<div class="edit-row agent" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="default-table agent-table" id="tableCont">
			<div class="row-tit clearance-tit">
				<span class="tit">报检信息</span>
				<div class="row-tit-operate">
					<div class="">
						<span class="mr10">报检状态</span>
						<el-select v-model="inspectionStatus" size="mini" placeholder="请选择" clearable style="width:120px" @change="handleUpdateStatus" :disabled="!isOpTruck || isDisabledEdit">
							<el-option v-for="item in inspectionStatusList" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
						<ButtonTip
							btnType="primary" 
							:btnDisabled="!isOpTruck || isDisabledEdit" 
							btnText="新增委托" 
							:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip" 
							class="operateBtn-tip ml10" 
							@click="handleAdd">
						</ButtonTip>
						<!-- <el-button size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="!isOpTruck || isDisabledEdit">新增委托</el-button> -->
					</div>
				</div>
			</div>
			<div class="row-table mt04 mb10 table-com-layout">
				<el-table ref="inspectionTable" fit style="width: 100%" :data="inspectionList" @selection-change="handleSelectionChange">
					<el-table-column type="selection" width="50"></el-table-column>
					<el-table-column prop="intrustNo" label="报检委托编号" align="center" width="150"></el-table-column>
					<el-table-column prop="status" label="报检状态" align="center">
						<template slot-scope="scope">
							{{ scope.row.status | inspectionStatusFilter }}
						</template>
					</el-table-column>
					<el-table-column prop="inspectionSupplierName" label="报检公司" align="center" width="150" show-overflow-tooltip></el-table-column>
					<el-table-column prop="inspector" label="报检员" align="center"></el-table-column>
					<el-table-column prop="inspectorPhone" label="报检员电话" align="center"></el-table-column>
					<el-table-column prop="intrustTime" label="委托日期" align="center" width="150"></el-table-column>
					<el-table-column prop="remark" label="报检备注" align="center" width="250" show-overflow-tooltip></el-table-column>
					<el-table-column label="操作" width="100" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleInfo(scope.row)" type="text" size="mini">详情</el-button>
								<ButtonTip
									btnType="text" 
									:btnDisabled="!isOpTruck || isDisabledEdit" 
									btnText="删除" 
									:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip" 
									class="operateBtn-tip" 
									btnClassName="red"
									@click="handleDelete(scope.row)">
								</ButtonTip>
								<!-- <el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="!isOpTruck || isDisabledEdit">删除</el-button> -->
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>
		<div class="agentDetail" v-if="detailShow">
			<InspectionDetail
				ref="inspectionDetailForm"
				:isJointTip="isJointTip" 
				:isFinishTip="isFinishTip" 
				:statusTip="statusTip"
				:isOpTruckTip="isOpTruckTip"
				:isJoint="isJoint"
				:type="type"
				:attachmentList="attachmentList"
				:createItem="createItem"
				:currencyList="currencyList"
				:saveBarFixed="saveBarFixed"
				:isDisabledEdit="isDisabledEdit"
				@save="handleSave"
				@cancel="handleCancel"
				@update="handleUpdate"
			/>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { mixin } from '../mixin'
import { getDictLabel, getDictMap } from '@/utils/tools'
import { baseCurrencyList } from '@/api/base'
import { orderJointInfo, orderInfo } from '@/api/order/list'
import { inspectionList, inspectionDetail, inspectionDelete, inspectionGetIntrustNo, inspectionUpdateStatus, inspectionSave, inspectionAttachmentList } from '@/api/order/inspection'
import InspectionDetail from './components/inspectionDetail'

const defaultCreateQuery = {
	oid: undefined,
	consignee: '',
	inspectionCnVos: [],
	inspectionSupplierId: '',
	inspectionSupplierName: '',
	fumeinspectorSupplierId: '',
	inspector: '',
	inspectorPhone: '',
	intrustNo: '',
	intrustTime: '',
	notify1: '',
	orderNo: '',
	remark: '',
	status: '',
	shipper: ''
}

export default {
	mixins: [mixin],
	filters: {
		inspectionStatusFilter(status) {
			return getDictLabel('inspectionStatus', status)
		}
	},
	props: {
		tabMenus: {
			type: Array,
			default: () => []
		},
		orderInfoData: {
			type: Object,
			default: () => ({})
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			state: 'valid',
			inspectionList: [],
			oQuery: this.$route.query,
			inspectionStatus: '', // 代理报检状态
			inspectionStatusList: getDictMap('inspectionStatus') || [], // 委托状态
			multipleSelection: [],
			detailShow: false,
			createItem: Object.assign({}, defaultCreateQuery),
			currencyList: [],
			attachmentList: [], // 附件类别下拉,
			serviceCode: sessionStorage.getItem('serviceCode'), // 服务项code
			type: '',
			canSave: true
		}
	},
	created() {
		// this.getOrderInfo()
		this.getCurrencyList()
		this.getList()
		this.getAttachmentList()
	},
	mounted() {
		console.log(this.dictMap)
	},
	computed: {
		...mapState({
			finCloseStatusCanEdit: state => state.order.finCloseStatusCanEdit,
		}),
		isBd() {
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.isDoc || this.isAc || this.isOpTruck
			return isBd || this.isJoint
		},
		isOpTruck() {
			if (this.isJoint) {
				return false // 被协同的不能新增委托
			}
			console.log('this.userEditRoles', this.userEditRoles.includes('op_truck'))
			// 整箱 op_truck
			if (['ship_export_fcl','ship_customs','ship_export_customs','ship_import_customs'].includes(this.orderInfoData.businessType)) {
				return this.userEditRoles.includes('op_truck')
			}
			// 散杂滚装、散货 op
			if (['ship_export_lcl', 'ship_bulk_ro'].includes(this.orderInfoData.businessType)) {
				return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs') || this.userEditRoles.includes('op_truck')
			}
		},
		isJoint() {
			let findItem = this.tabMenus.find(item => item.code === 'pol_declaration')
			console.log('this.tabMenus0420', this.tabMenus)
			return findItem ? findItem.isJoint : false
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'pol_declaration')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isDisabledEdit(){
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if(this.isFinish){
				return true
				// 放开已关账、已完成的限制
				// ['complete','cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)
			}else if(['cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)){
				return true
			}else{
				return false
			}
		},
		isFinishTip() {
			if (this.isFinish) {
				return '该服务项已完成，不允许操作'
			}
		},
		statusTip() {
			// 放开已关账、已完成的限制
			// ['complete', 'cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)
			if(['cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)) {
				return '订单状态为已取消、已完成，或是已关账，不允许操作'
			}
		},
		isJointTip() {
			if (this.isJoint) {
				return '该服务项被协同，不允许操作'
			}
		},
		isOpTruckTip() {
			// 整箱-op_truck
			if (this.orderInfoData.businessType === 'ship_export_fcl') {
				if (!this.userEditRoles.includes('op_truck')) {
					return '非该单拖报操作、仓储操作人员，关务操作，不允许操作'
				}
			}
			// 散杂滚装、散货-op,op_truck
      if (['ship_export_lcl', 'ship_bulk_ro'].includes(this.orderInfoData.businessType)) {
				if (!(this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs') || this.userEditRoles.includes('op_truck'))) {
					return '非该单拖报操作、仓储操作、操作人员，不允许操作'
				}
      }
			// 报关单、关务操作
      if (['ship_customs', 'ship_export_customs', 'ship_import_customs'].includes(this.orderInfoData.businessType)) {
        if (!this.userEditRoles.includes('op_truck')) {
					return '非该单关务操作人员，不允许操作'
				}
			}
		},
	},
	components: {
		InspectionDetail
	},
	watch: {},
	methods: {
		// 获取订单详情
		getOrderInfo() {
			let { source, jointNo, orderNo } = this.oQuery
			if (jointNo) {
				return orderJointInfo({ jointNo: jointNo, orderNo: orderNo }).then(res => {
					let { data } = res
				})
			}
			orderInfo({ orderNo: orderNo }).then(res => {
				let { data } = res
			})
		},
		// 币别下拉列表
		getCurrencyList(queryString) {
			baseCurrencyList(queryString, 'valid').then(response => {
				this.currencyList = response.data
			})
		},
		// 附件类别下拉列表
		getAttachmentList() {
			inspectionAttachmentList({ serviceCode: 'pol_inspection' }).then(res => {
				if (res.data && res.data.length) {
					this.attachmentList = res.data.map(item => {
						return Object.assign(item, {
							label: item.typeName,
							value: item.typeCode
						})
					})
				}
			})
		},
		// 获取代理报检列表
		getList() {
			this.lsLoading = true
			inspectionList({ orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.inspectionList = res.data || []
			}).finally(() => {
				this.lsLoading = false
			})
		},
		// 获取代理报检委托编号
		handleGetIntrustNo() {
			inspectionGetIntrustNo().then(res => {
				let intrustNo = res.data.serialNo || ''
				this.createItem = Object.assign({}, defaultCreateQuery, {
					intrustNo,
					status: 'init'
				})
			})
		},
		// 新增
		handleAdd() {
			this.detailShow = true
			this.type = 'add'
			this.handleGetIntrustNo()
			console.log(this.createItem)
		},
		// 更新
		handleUpdate(intrustNo) {
			let row = this.inspectionList.find(item => item.intrustNo === intrustNo)
			this.handleInfo(row)
		},
		// 详情
		handleInfo(row) {
			this.detailShow = true
			this.type = 'info'
			let { orderNo, jointNo } = this.oQuery
			this.createItem = Object.assign(
				{ ...defaultCreateQuery },
				{
					oid: row.oid,
					intrustNo: row.intrustNo
				}
			)
			inspectionDetail({ orderNo, jointNo, oid: row.oid }).then(res => {
				for (let i in defaultCreateQuery) {
					this.createItem[i] = res.data[i]
					if (i === 'inspectionSupplierId') {
						this.createItem[i] = res.data[i] || ''
					}
				}
				// this.createItem.inspectionCnVos = res.data.inspectionCnVos
				console.log('详情', this.createItem)
			})
		},
		// 删除
		handleDelete(row) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						oid: row.oid,
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo
					}
					return inspectionDelete(data)
				})
				.then(response => {
					this.$message({
						message: '删除成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							if ((row.oid = this.createItem.oid)) {
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
		// 获取选中的blId
		getOids() {
			let oids = []
			this.multipleSelection.map(item => {
				oids.push(item.oid)
			})
			return oids
		},
		validate() {
			return true
		},
		// 修改代理报检状态
		handleUpdateStatus(val) {
			if (!val) return
			if (!this.multipleSelection.length) {
				return this.$message({
					type: 'error',
					message: '请选择代理报检',
					duration: 1000,
					onClose: () => {
						this.inspectionStatus = ''
					}
				})
			}
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return inspectionUpdateStatus({
						inspectionIds: this.getOids(),
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo,
						status: val
					})
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '修改代理报检状态成功',
						duration: 1000,
						onClose: () => {
							this.inspectionStatus = ''
							this.getList()
						}
					})
				})
				.catch(err => {
					this.inspectionStatus = ''
				})
		},
		handleDownload(fileNo, fileName) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: fileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = fileName
					link.click()
				})
		},
		handleView(fileNo, fileName) {
			this.$store.dispatch('order/previewFile', { fileNo: fileNo, fileName: fileName })
		},
		// 保存
		handleSave(values) {
			console.log(values)
			let data = Object.assign({}, values)
			data.orderNo = this.oQuery.orderNo
			data.jointNo = this.oQuery.jointNo
			data.iBoxList = this.$refs.inspectionDetailForm.boxList
			delete data.inspectionCnVos
			if (!this.canSave) return
			this.canSave = false
			inspectionSave(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							this.canSave = true
							this.detailShow = false
							this.getList()
						}
					})
				})
				.catch(err => {
					setTimeout(() => {
						this.canSave = true
					}, 2000)
				})
		},
		// 取消
		handleCancel() {
			this.detailShow = false
		}
	}
}
</script>
<style lang="scss">
@import '../../../less/index.scss';
.operateBtn-tip{
	padding: 0; 
	display: inline-block;
}
</style>
