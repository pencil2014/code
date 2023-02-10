<template>
	<div class="edit-row agent" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="edit-container so" id="tableCont">
			<div class="row-tit so">
				<span class="tit ft12 bold">CIQ信息</span>
				<div class="row-tit-operate">
					<div class="">
						<span class="mr10">委托状态</span>
						<el-select v-model="inspectionStatus" size="mini" placeholder="请选择" clearable style="width:120px" @change="handleUpdateStatus" :disabled="isBd">
							<el-option v-for="item in dictMap.inspectionStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
						<ButtonTip
							btnType="primary" 
							:btnDisabled="isBd" 
							btnText="新增委托" 
							:tipContent="isOpTip || isFinishTip || isJointTip" 
							class="operateBtn-tip ml10" 
							@click="handleAdd">
						</ButtonTip>
						<!-- <el-button size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="isBd">新增委托</el-button> -->
					</div>
				</div>
			</div>
			<div class="row-form mt10 table-com-layout">
				<el-table ref="ciqTable" fit style="width: 100%" :data="ciqList" @selection-change="handleSelectionChange">
					<el-table-column type="selection" width="50"></el-table-column>
					<el-table-column prop="intrustNo" label="CIQ委托编号" align="center" width="150"></el-table-column>
					<el-table-column prop="status" label="检测状态" align="center">
						<template slot-scope="scope">
							{{ scope.row.status | inspectionStatusFilter }}
						</template>
					</el-table-column>
					<el-table-column prop="declareCustName" label="申报公司" align="center"></el-table-column>
					<el-table-column prop="declareContact" label="联系人" align="center"></el-table-column>
					<el-table-column prop="declareContactPhone" label="联系电话" align="center"></el-table-column>
					<el-table-column prop="checkSupplierName" label="CIQ检测公司" align="center"></el-table-column>
					<el-table-column prop="checkContact" label="CIQ联系人" align="center"> </el-table-column>
					<el-table-column prop="checkContactPhone" label="CIQ联系人电话" align="center"> </el-table-column>
					<el-table-column label="操作" width="100" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleInfo(scope.row)" type="text" size="mini">详情</el-button>
								<ButtonTip
									btnType="text" 
									:btnDisabled="isBd || scope.row.status === 'finish'" 
									btnText="删除" 
									:tipContent="isOpTip || isFinishTip || isJointTip || rowStatusTip(scope.row)" 
									class="operateBtn-tip" 
									btnClassName="red"
									@click="handleDelete(scope.row)">
								</ButtonTip>
								<!-- <el-button :class="{'red': !(isBd || scope.row.status === 'finish')}" @click="handleDelete(scope.row)" type="text" size="mini" :disabled="isBd || scope.row.status === 'finish'">删除</el-button> -->
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>
		<div class="fume-detail" v-if="detailShow">
			<CiqDetail
				ref="ciqDetailForm"
				:isOpTip="isOpTip"
				:isFinishTip="isFinishTip"
				:isJointTip="isJointTip"
				:isJoint="isJoint"
				:type="type"
				:createItem="createItem"
				:currencyList="currencyList"
				:attachmentList="attachmentList"
				:saveBarFixed="saveBarFixed"
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
import { getDictLabel } from '@/utils/tools'
import { baseCurrencyList } from '@/api/base'
import { orderJointInfo, orderInfo } from '@/api/order/list'
import { inspectionAttachmentList } from '@/api/order/inspection'
import { ciqList, ciqDetail, ciqDelete, ciqGetIntrustNo, ciqUpdateStatus, ciqSave } from '@/api/order/inspectionAndDetection/ciq'
import CiqDetail from './components/ciqDetail'

const defaultCreateQuery = {
	oid: undefined,
	intrustNo: '',
	ciqCnVos: [],
	checkContact: '',
	checkContactPhone: '',
	checkSupplierId: '',
	checkSupplierName: '',
	declareContact: '',
	declareContactPhone: '',
	declareCustName: '',
	declareCustid: '',
	orderNo: '',
	declareType: '',
	status: '',
	remark: ''
}

export default {
	mixins: [mixin],
	filters: {
		inspectionStatusFilter(status) {
			return getDictLabel('inspectionStatus', status)
		}
	},
	data() {
		return {
			state: 'valid',
			ciqList: [],
			oQuery: this.$route.query,
			inspectionStatus: '', // CIQ状态
			multipleSelection: [],
			detailShow: false,
			createItem: Object.assign({}, defaultCreateQuery),
			currencyList: [],
			attachmentList: [],
			custStr: sessionStorage.getItem('custStr'),
			type: '',
			canSave: true
		}
	},
	created() {
		this.getCurrencyList()
		this.getList()
		this.getAttachmentList()
	},
	mounted() {},
	props: {
		tabMenus: {
			type: Array,
			default: () => []
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		isBd() {
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'ac' || this.ordDetRole === 'doc' || this.ordDetRole === 'op_truck'
			return isBd || this.isJoint || this.isFinish
		},
		isJoint() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'ciq')
      console.log("🚀 ~ this.serviceInfoList", this.serviceInfoList)
			if (findItem) {
				return findItem.isJoint === 'y'
			} else {
				return false
			}
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'ciq')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
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
		isOpTip() {
			if (!this.isOp) {
				return '非该单操作人员，不允许操作'
			}
		},
	},
	components: {
		CiqDetail
	},
	watch: {},
	methods: {
		rowStatusTip(row) {
			if (row.status === 'finish') {
				return '检测状态已完成，不允许操作'
			}
		},
		// 币别下拉列表
		getCurrencyList(queryString) {
			baseCurrencyList(queryString, 'valid').then(response => {
				this.currencyList = response.data
			})
		},
		// 附件类别下拉列表
		getAttachmentList() {
			inspectionAttachmentList({ serviceCode: 'ciq' }).then(res => {
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
		// 获取CIQ列表
		getList() {
			this.lsLoading = true
			ciqList({ orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.ciqList = res.data || []
			}).finally(() => {
				this.lsLoading = false
			})
		},
		// 获取CIQ委托编号
		handleGetIntrustNo() {
			ciqGetIntrustNo().then(res => {
				let intrustNo = res.data.serialNo || ''
				let cust = JSON.parse(this.custStr)
				this.createItem = Object.assign({}, defaultCreateQuery, {
					intrustNo,
					status: 'init',
					declareCustid: cust.custid || '',
					declareCustName: cust.custName || ''
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
			let row = this.ciqList.find(item => item.intrustNo === intrustNo)
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
			ciqDetail({ orderNo, jointNo, oid: row.oid }).then(res => {
				for (let i in this.createItem) {
					this.createItem[i] = res.data[i]
				}
				// this.createItem.ciqCnVos = res.data.ciqCnVos
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
					return ciqDelete(data)
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
		// 修改CIQ状态
		handleUpdateStatus(val) {
			if (!val) return
			if (!this.multipleSelection.length) {
				return this.$message({
					type: 'error',
					message: '请选择CIQ',
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
					return ciqUpdateStatus({
						ciqIds: this.getOids(),
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo,
						status: val
					})
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '修改CIQ状态成功',
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
			data.ciqBoxDtoList = this.$refs.ciqDetailForm.boxList
			delete data.ciqCnVos
			if (!this.canSave) return
			this.canSave = false
			ciqSave(data)
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
</style>
