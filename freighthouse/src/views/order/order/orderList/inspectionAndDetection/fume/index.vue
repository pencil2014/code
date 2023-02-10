<template>
	<div class="edit-row fume-row" v-loading="lsLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
		<div class="table-com-layout" id="tableCont">
			<div class="between h28 mt04">
				<div class="ft12"><b>熏蒸委托</b></div>
				<div>
					<el-dropdown size="small" @command="handleCommand">
						<el-button size="mini" type="default" :disabled="disabledFume" class="mr10"> 输出<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item :command="item.value" v-for="(item, index) in exportTypeOptions" :key="index">{{ item.label }}</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
					<span class="mr10">熏蒸状态</span>
					<el-select v-model="intrustStatus" size="mini" placeholder="请选择" clearable style="width: 120px" @change="handleUpdateStatus" :disabled="disabledFume">
						<el-option v-for="item in dictMap.fumeIntrustStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
					<div class="el-button-group">
						<ButtonTip btnType="primary" :btnDisabled="disabledFume" btnText="新增委托" :tipContent="isOpTruckAndOpTip || isJointTip || isFinishTip" class="operateBtn-tip ml10" @click="handleAdd"> </ButtonTip>
						<!-- <el-button size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="disabledFume">新增委托</el-button> -->
					</div>
				</div>
			</div>
			<el-table ref="multipleTable" fit style="width: 100%" :data="list" @selection-change="handleSelectionChange" class="mt04">
				<el-table-column type="selection" width="50"></el-table-column>
				<el-table-column prop="intrustNo" label="熏蒸委托编号" align="center" width="140"></el-table-column>
				<el-table-column prop="containers" label="箱型箱量" align="center" width="120" v-if="detailInfo.businessType === 'ship_export_fcl'"></el-table-column>
				<el-table-column prop="intrustStatus" label="熏蒸状态" align="center">
					<template slot-scope="scope">
						{{ scope.row.intrustStatus | fumeStatusFilter }}
					</template>
				</el-table-column>
				<el-table-column prop="fumeSupplierName" label="熏蒸公司" align="center" width="150" show-overflow-tooltip>
					<template slot-scope="scope">
						<span class="address-style">{{ scope.row.fumeSupplierName }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="fumeAddress" label="熏蒸地址" align="center" width="150" show-overflow-tooltip>
					<template slot-scope="scope">
						<span class="address-style">{{ scope.row.fumeAddress }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="contact" label="熏蒸联系人" align="center"></el-table-column>
				<el-table-column prop="contactPhone" label="熏蒸联系人电话" align="center" width="120"></el-table-column>
				<el-table-column prop="fumeTime" label="熏蒸日期" align="center" width="150"></el-table-column>
				<el-table-column prop="woodenPalletCount" label="木托数量" align="center"></el-table-column>
				<el-table-column prop="remark" label="熏蒸要求" align="center" width="200" show-overflow-tooltip>
					<template slot-scope="scope">
						<span class="address-style">{{ scope.row.remark }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="100" align="center" fixed="right">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleInfo(scope.row)" type="text" size="mini">详情</el-button>
							<ButtonTip
								btnType="text"
								:btnDisabled="disabledFume || scope.row.intrustStatus === 'finished'"
								btnText="删除"
								:tipContent="isOpTruckAndOpTip || isJointTip || isFinishTip || rowStatusTip(scope.row)"
								class="operateBtn-tip"
								btnClassName="red"
								@click="handleDelete(scope.row)"
							>
							</ButtonTip>
							<!-- <el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="disabledFume || scope.row.intrustStatus === 'finished'">删除</el-button> -->
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<!-- 详情 -->
		<div class="component-cont fume-detail" v-if="showDetail">
			<div class="between" id="saveBar">
				<div class="ft12 bold">熏蒸委托详情</div>
				<div class="el-button-group" v-if="isOp">
					<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
					<ButtonTip btnType="primary" :btnDisabled="disabledFume || createItem.intrustStatus === 'finished'" btnText="保存" :tipContent="isOpTruckAndOpTip || isJointTip || isFinishTip || statusTip" class="operateBtn-tip ml10" @click="handleSave">
					</ButtonTip>
					<!-- <el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="disabledFume || createItem.intrustStatus === 'finished'">保存</el-button> -->
				</div>
			</div>
			<div class="between isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
				<div class="ft12 bold">熏蒸委托详情</div>
				<div class="el-button-group" v-if="isOp">
					<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
					<ButtonTip btnType="primary" :btnDisabled="disabledFume || createItem.intrustStatus === 'finished'" btnText="保存" :tipContent="isOpTruckAndOpTip || isJointTip || isFinishTip || statusTip" class="operateBtn-tip ml10" @click="handleSave">
					</ButtonTip>
					<!-- <el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="disabledFume || createItem.intrustStatus === 'finished'">保存</el-button> -->
				</div>
			</div>
			<div class="row-cont margin0 borderTop">
				<!-- <div class="row-cont-tit">
					<span class="tit">熏蒸委托</span>
				</div> -->
				<el-form ref="fumeSave" :model="createItem" :rules="rules" class="row-flex" style="padding-left: 0; margin-top: 8px" label-width="90px">
					<el-form-item label="熏蒸委托编号" prop="intrustNo" class="flex-item col-6" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="createItem.intrustNo" clearable disabled></el-input>
					</el-form-item>
					<el-form-item label="箱型箱量" prop="containers" class="flex-item col-6" :show-message="false" v-if="detailInfo.businessType === 'ship_export_fcl'">
						<el-input size="mini" placeholder="请输入" v-model="createItem.containers" clearable></el-input>
					</el-form-item>
					<el-form-item label="熏蒸公司" prop="fumeSupplierId" class="flex-item col-6" :show-message="false">
						<el-select
							style="width: 100%"
							clearable
							placeholder="请选择"
							size="mini"
							v-model="createItem.fumeSupplierId"
							:filterable="true"
							@visible-change="supplierVisibleChange"
							:filter-method="supplierFilterMehod"
							@change="handleSelectSupplierName"
						>
							<el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="熏蒸联系人" prop="contact" class="flex-item col-6" :show-message="false">
						<el-autocomplete
							style="width: 100%"
							size="mini"
							clearable
							v-model="createItem.contact"
							:fetch-suggestions="(queryString, cb) => querySearchContact(queryString, cb)"
							placeholder="请输入"
							@select="value => handleSelectContact(value)"
						></el-autocomplete>
						<!-- <el-input size="mini" placeholder="请输入" v-model="createItem.contact" clearable></el-input> -->
					</el-form-item>
					<el-form-item label="熏蒸电话" prop="contactPhone" class="flex-item col-6" :show-message="false">
						<el-input maxlength="16" size="mini" placeholder="请输入" v-model="createItem.contactPhone" clearable></el-input>
					</el-form-item>
					<el-form-item label="熏蒸地址" prop="fumeAddress" class="flex-item col-6" :show-message="false">
						<el-input maxlength="128" size="mini" placeholder="请输入" v-model="createItem.fumeAddress" clearable></el-input>
					</el-form-item>
					<el-form-item label="熏蒸日期" prop="fumeTime" class="flex-item col-6" :show-message="false">
						<elDatePickerLimit size="mini" v-model="createItem.fumeTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
					</el-form-item>
					<el-form-item label="木托数量" prop="woodenPalletCount" class="flex-item col-6" :show-message="false">
						<el-input maxlength="6" @blur="validateNum(createItem)" size="mini" placeholder="请输入" v-model="createItem.woodenPalletCount" clearable></el-input>
					</el-form-item>

					<el-form-item label="是否出熏蒸证" prop="isNeedCert" class="flex-item col-6" :show-message="false">
						<el-select style="width: 100%" clearable placeholder="请选择" size="mini" v-model="createItem.isNeedCert">
							<el-option v-for="(item, index) in isNeedCertList" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="熏蒸范围" prop="fumeScope" class="flex-item col-6" :show-message="false">
						<el-select style="width: 100%" clearable placeholder="请选择" size="mini" v-model="createItem.fumeScope">
							<el-option v-for="(item, index) in fumeScopeList" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="熏蒸要求" prop="remark" class="flex-item col-2" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="createItem.remark" clearable maxlength="512" show-word-limit></el-input>
					</el-form-item>
				</el-form>
			</div>
			<!-- 申请人列表 -->
			<ApplyFume ref="applyFume" :isFinishTip="isFinishTip" :isJointTip="isJointTip" :isOpTruckAndOpTip="isOpTruckAndOpTip" :isJoint="isJoint" :detailData="createItem" :fumeBls="createItem.fumeBls" :detailInfo="detailInfo" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { mixin } from '../mixin'
import { baseSupplierList } from '@/api/base'
import { customerInfo, supplierInfo } from '@/api/crm/supplier'
import { fumeList, fumeDetail, fumeSave, fumeDelete, fumeCreateSerialNo, fumeUploadFile, fumeUpdateStatus } from '@/api/order/fume'
import { orderContainerList } from '@/api/order/list'
import { blListBox } from '@/api/order/bl'
import ApplyFume from './components/applyFume'
import { getDictLabel } from '@/utils/tools'

const defaultCreateQuery = {
	fumeId: undefined,
	orderNo: '',
	contact: '',
	contactEmail: '',
	fumeBls: [],
	fumeSupplierId: '',
	fumeTime: '',
	intrustNo: '',
	contactPhone: '',
	containers: '',
	remark: '',
	woodenPalletCount: '',
	fumeAddress: '',
	isNeedCert: '',
	fumeScope: '',
	intrustStatus: 'init'
}

export default {
	mixins: [mixin],
	filters: {
		fumeStatusFilter(status) {
			return getDictLabel('fumeIntrustStatus', status)
		}
	},
	data() {
		return {
			exportTypeOptions: [
				{ label: '海关熏蒸处理申请单', value: 'exportFumeApplyFile' },
				{ label: '世壮空落单纸', value: 'exportCsFile' }
			],
			isNeedCertList: [
				{ label: '是', value: 'y' },
				{ label: '否', value: 'n' }
			],
			fumeScopeList: [],
			oQuery: this.$route.query,
			intrustStatus: '',
			list: [],
			multipleSelection: [],
			showDetail: false,
			createItem: Object.assign({}, defaultCreateQuery),
			supplierList: [],
			rules: {
				intrustNo: [{ required: true, message: '熏蒸委托编号为必填', trigger: 'blur' }],
				fumeSupplierId: [{ required: true, message: '请选择熏蒸公司', trigger: 'change' }],
				contact: [{ required: true, message: '请输入熏蒸联系人', trigger: 'blur' }],
				contactPhone: [{ required: true, message: '请输入熏蒸联系电话', trigger: 'blur' }],
				fumeAddress: [{ required: true, message: '请输入熏蒸地址', trigger: 'blur' }],
				fumeTime: [{ required: true, message: '请输入熏蒸日期', trigger: 'blur' }],
				isNeedCert: [{ required: true, message: '请选择是否出熏蒸证', trigger: 'change' }],
				fumeScope: [{ required: true, message: '请输入熏蒸范围', trigger: 'change' }],
				woodenPalletCount: [{ required: true, message: '请输入木托数量', trigger: 'blur' }],
				remark: [{ required: true, message: '请输入熏蒸要求', trigger: 'blur' }]
			},
			detailInfo: {},
			restaurants: [], // 供应商所有值
			contactInfo: []
		}
	},
	created() {
		this.getFumeList()
		this.getContainerList()
		this.getBlNoList()
		this.fumeScopeList = this.dictMap.fumeScope
	},
	mounted() {},
	props: {
		orderInfo: {
			type: Object,
			default: () => ({})
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		...mapState({
			userEditRoles: state => state.order.orderList.userEditRoles
		}),
		disabledFume() {
			// let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'ac' || this.ordDetRole === 'doc' || !this.isOp
			// return isBd || this.isJoint || this.isFinish
			return !this.isOp || this.isJoint || this.isFinish
		},
		isOp() {
			// return this.ordDetRole === 'op' || this.userEditRoles.includes('op_truck')
			return this.userEditRoles.includes('op_truck')
		},
		isJoint() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'fume')
			return findItem && findItem.isJoint === 'y'
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'fume')
			console.log('this.serviceInfoList', this.serviceInfoList)
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		styleObject() {
			// 顶部距离文档
			let offsetTop = document.querySelector('.tabs-container').offsetTop
			return this.saveBarFixed
				? {
						left: '120px',
						top: offsetTop + 24 + 'px'
				  }
				: {}
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
		isOpTruckAndOpTip() {
			if (!this.isOp) {
				// return '非该单拖报操作人员或是仓储操作或是操作人员，不允许操作'
				return '非该单拖报操作人员，不允许操作'
			}
		},
		statusTip() {
			if (this.createItem.intrustStatus === 'finished') {
				return '熏蒸状态已完成，不允许操作'
			}
		}
	},
	components: {
		ApplyFume
	},
	watch: {
		orderInfo: {
			handler(newVal, oldVal) {
				this.detailInfo = newVal
			},
			deep: true,
			immediate: true
		}
	},
	methods: {
		rowStatusTip(row) {
			if (row.intrustStatus === 'finished') {
				return '熏蒸状态已完成，不允许操作'
			}
		},
		// 输出
		handleExport(value) {
			let type = value === 'exportCsFile' ? 'application/vnd.ms-excel' : 'application/msword'
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: `/order/shipping/fume/${value}`,
					params: {
						intrustNo: this.multipleSelection[0].intrustNo
					},
					type
				})
				.then(res => {
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = value === 'exportCsFile' ? `世壮空落单纸${this.oQuery.orderNo}.xls` : `海关熏蒸处理申请单${this.oQuery.orderNo}.doc`
					link.click()
				})
		},
		// 打开输出弹窗
		handleCommand(command) {
			if (this.multipleSelection.length != 1) return this.$message.error('请选择一条数据')
			console.log('🚀 ~ this.multipleSelection', this.multipleSelection)
			this.handleExport(command)
		},
		validateNum(item) {
			item.woodenPalletCount = Number(item.woodenPalletCount)
			const intReg = /^[0-9]\d*$/
			if ((item.woodenPalletCount && !intReg.test(item.woodenPalletCount)) || Object.is(item.woodenPalletCount, NaN)) {
				item.woodenPalletCount = ''
				return this.$message.error('请输入正确的数量!')
			}
		},
		// 初始化
		init() {},
		// 集装箱列表
		getContainerList() {
			this.$store.dispatch('orderService/getContainerList', {
				orderNo: this.oQuery.orderNo,
				jointNo: this.oQuery.jointNo
			})
		},
		// 提单号列表
		getBlNoList() {
			this.$store.dispatch('orderService/getBlNoList', {
				orderNo: this.oQuery.orderNo,
				jointNo: this.oQuery.jointNo
			})
		},
		// 获取供应商
		supplierFilterMehod(val) {
			this.getSupplierList(val)
		},
		supplierVisibleChange(val) {
			if (val) {
				this.getSupplierList()
			}
		},
		getSupplierList(val = '') {
			this.$store.dispatch('dict/querySupplierList', { category: 'serviceCode', value: 'fume', queryString: val }).then(data => {
				this.supplierList = data.list
				this.supplierList.forEach(item => {
					Object.assign(item, {
						label: this.$language == 'en' ? item.ename : item.name,
						value: item.supplierId ? Number(item.supplierId) : ''
					})
				})
			})
		},
		handleSelectSupplierName(val) {
			if (val) {
				let supplierItem = this.supplierList.find(item => item.value === val)
				this.createItem.fumeSupplierName = supplierItem.label
				supplierInfo({ supplierId: val }).then(res => {
					let { contact } = res.data
					Object.assign(this.createItem, {
						contact: contact && contact.length ? contact[0].name || contact[0].ename : '',
						contactPhone: contact && contact.length ? contact[0].mobileNo : ''
						// address: contact && contact.length ? contact[0].address : '',
					})
					this.restaurants = this.loadAll(contact)
				})
			} else {
				Object.assign(this.createItem, {
					contact: '',
					contactPhone: ''
					// address: ''
				})
			}
		},
		querySearchContact(queryString, cb) {
			let restaurants = this.restaurants
			let results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
			cb(results)
		},
		handleSelectContact(item) {
			if (item.value) {
				for (let i = 0; i < this.contactInfo.length; i++) {
					if (item.value === this.contactInfo[i].value) {
						Object.assign(this.createItem, {
							contactPhone: this.contactInfo[i].mobileNo
						})
						return
					}
				}
			}
		},
		createFilter(queryString) {
			return restaurant => {
				return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
			}
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
		// 委托列表
		getFumeList() {
			this.lsLoading = true
			fumeList({
				orderNo: this.oQuery.orderNo,
				jointNo: this.oQuery.jointNo
			})
				.then(res => {
					this.list = res.data
				})
				.finally(() => {
					this.lsLoading = false
				})
		},
		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
		},
		// 新增
		handleAdd() {
			// if (this.showDetail) return
			fumeCreateSerialNo({ oid: '', jointNo: this.oQuery.jointNo }).then(res => {
				this.createItem.intrustNo = res.data.intrustNo
			})
			Object.assign(this.createItem, {}, defaultCreateQuery)
			this.showDetail = true
		},
		validate() {
			return true
		},
		// 取消
		handleCancel() {
			this.showDetail = false
		},
		// 新增保存
		handleSave() {
			this.$refs.fumeSave.validate(valid => {
				if (valid) {
					let fumeBls = this.$refs.applyFume.tableData
					let data = { ...this.createItem }
					Object.assign(data, { fumeBls })
					// if (!this.validate()) return
					data.orderNo = this.oQuery.orderNo
					data.jointNo = this.oQuery.jointNo
					fumeSave(data).then(res => {
						this.$message({
							type: 'success',
							message: '保存成功',
							duration: 1000,
							onClose: () => {
								this.getFumeList()
								this.showDetail = false
							}
						})
					})
				} else {
					console.log('error submit')
					return false
				}
			})
		},
		// 详情
		handleInfo(row) {
			this.showDetail = true
			fumeDetail({
				orderNo: this.oQuery.orderNo,
				jointNo: this.oQuery.jointNo,
				fumeId: row.fumeId
			}).then(res => {
				console.log('🚀 ~ res', res)
				for (let i in this.createItem) {
					this.createItem[i] = res.data[i]
				}
				this.supplierList = [{ label: res.data.fumeSupplierName, value: res.data.fumeSupplierId }]
				if (this.createItem.fumeSupplierId) {
					supplierInfo({ supplierId: this.createItem.fumeSupplierId }).then(res => {
						let { contact } = res.data
						this.restaurants = this.loadAll(contact)
					})
				}
			})
			// for (let i in this.createItem) {
			//   this.createItem[i] = row[i]
			// }
			// if (!row.fumeSupplierId || row.fumeSupplierId === 0) {
			//   row.fumeSupplierId = ''
			// }
			// this.supplierList = [{label: row.fumeSupplierName, value: row.fumeSupplierId}]
			// this.custOptions = [{label: row.custName, value: row.custid}]
		},

		// 处理绑定集装箱的数据
		handleBind(value) {
			this.createItem.fumeContainerList = value.map(item => {
				for (let i in this.containerItem) {
					if (i !== 'oid') {
						this.containerItem[i] = item[i]
						if (i === 'containerId') {
							this.containerItem[i] = item.oid
						}
					}
				}
				return Object.assign({}, this.containerItem)
			})
		},

		// 处理取消绑定集装箱的数据
		handleCancelBind(rowIndex) {
			this.createItem.fumeContainerList = this.createItem.fumeContainerList.filter((item, index) => {
				return rowIndex != index
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
					return fumeDelete({
						fumeId: row.fumeId,
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo
					})
				})
				.then(response => {
					// 删除和打开详情的信息为同一条时，该条信息的详情则不显示
					if (this.createItem.intrustNo === row.intrustNo) {
						this.showDetail = false
					}
					this.getFumeList()
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(() => {})
		},
		// 打开上传附件弹窗
		handleAddFile() {
			this.uploadPopShow = true
		},

		// 获取fumeids
		getFumeids() {
			let fumeIdsArr = []
			this.multipleSelection.map(item => {
				fumeIdsArr.push(item.fumeId)
			})
			return fumeIdsArr
		},

		// 更新状态
		handleUpdateStatus(val) {
			if (!val) return
			if (this.multipleSelection.length === 0) {
				this.intrustStatus = ''
				return this.$message.error('请勾选一条要更新状态的熏蒸')
			}
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let fumeIds = this.getFumeids()
					return fumeUpdateStatus({
						fumeIds,
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo,
						intrustStatus: val
					})
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '更新状态成功',
						duration: 1000,
						onClose: () => {
							this.intrustStatus = ''
							this.getFumeList()
						}
					})
				})
				.catch(err => {
					this.intrustStatus = ''
				})
		}
	}
}
</script>
<style lang="scss">
@import '../../../less/index.scss';
</style>
<style>
.fume-row {
	padding: 0 20px;
}
.fume-row .operateBtn-tip {
	padding: 0;
	display: inline-block;
}
/* .fume-row .flex-item {
	padding: 0 10px 14px 0 !important;
	margin-bottom: 0 !important;
} */
.fume-row .row-flex {
	padding-bottom: 4px;
}
.edit-container .component-cont.fume-detail {
	margin-top: 0;
	padding: 10px 0;
}
.edit-container .component-cont.fume-detail .row-flex .flex-item {
	width: 25%;
}
.edit-container .component-cont.fume-detail .row-flex .flex-item.col-2 {
	width: 50%;
}
.edit-container .component-cont.fume-detail .row-flex .flex-item .el-form-item__label {
	padding-right: 4px;
}
.fume-row .address-style {
	display: block;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.edit-container .component-cont.fume-detail .between {
	margin-bottom: 4px;
}
.edit-container .component-cont.fume-detail .between.isFixed {
	position: fixed;
	background-color: #fff;
	z-index: 999;
	padding: 5px 20px !important;
	height: 30px;
	box-shadow: 4px 0px 10px 0px #e9e9e9;
	top: 24px;
	right: 0;
}
.edit-container .component-cont.fume-detail .between.isFixed .ft12 {
	line-height: 20px;
}
</style>
