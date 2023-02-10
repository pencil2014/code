<template>
	<div class="edit-row" id="ltlDelivery">
		<div class="edit-container so" id="tableCont">
			<div class="row-tit so">
				<span class="tit ft12 bold"></span>
				<div class="row-tit-operate">
					<div class="">
						<span class="mr10">委托状态</span>
						<el-select v-model="intrustStatus" size="mini" placeholder="请选择" clearable style="width:120px" @change="handleUpdateStatus" :disabled="(isBd && !isImportJoint) || isDisabledEdit">
							<el-option v-for="item in dictMap.podDeliveryLtlStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
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
					<el-table-column prop="intrustType_cn" label="派车类型" align="center" width="80">
						<template slot-scope="scope">
							<span v-if="scope.row.intrustType === 'out'">出仓</span>
							<span v-if="scope.row.intrustType === 'in'">进仓</span>
						</template>
					</el-table-column>
					<el-table-column show-overflow-tooltip="" width="250" prop="supplierName" label="车队" align="center"> </el-table-column>
					<el-table-column show-overflow-tooltip="" prop="unloadAddress" label="卸货详细地址" align="center" width="200"></el-table-column>
					<el-table-column show-overflow-tooltip="" prop="consignee" label="收货人" align="center" width="100"></el-table-column>
					<el-table-column prop="preLoadTime" label="预计派送时间" align="center" width="150"></el-table-column>
					<el-table-column prop="loadTime" label="实际派送时间" align="center" width="150"></el-table-column>
					<el-table-column prop="signTime" label="签收时间" align="center" width="150"></el-table-column>
					<el-table-column show-overflow-tooltip="" prop="signFileName" label="签收附件" align="center">
						<template slot-scope="scope">
							<span style="cursor:pointer;color:#1890ff;" size="mini" @click="handleViewFile(scope.row.signFileNo, scope.row.signFileName)">{{ scope.row.signFileName }}</span>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="150" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleInfo(scope.row)" type="text" size="mini">详情</el-button>
								<el-button @click="handleDelete(scope.row, scope.$index)" type="text" class="red" size="mini" :disabled="(isBd && !isImportJoint) || isDisabledEdit">删除</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>
		<div class="agentDetail" v-if="detailShow">
			<Detail ref="detailForm" :createItem="createItem" :isDisabledEdit="(isBd && !isImportJoint) || isDisabledEdit" @save="handleSave" @cancel="handleCancel" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { ltlIntrustListWithLoadInfo, ltlStatusChange, ltlIntrustDelete, ltlIntrustSave, ltlIntrustInfo, ltlReqno } from '@/api/order/podService/ltlDelivery'
import Detail from './components/ltlDeliveryDetail'
import { supplierInfo, customerInfo } from '@/api/crm/supplier'
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
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
	mixins: [orderMixin],
	filters: {
		podDeliveryLtlStatusFilter(status) {
			return getDictLabel('podDeliveryLtlStatus', status)
		}
	},
	props: {
		activityType: {
			type: String,
			default: ''
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			curRow: null,
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
		// this.getList()
	},
	mounted() {},
	computed: {
		airIsEdit() {
			// 当前列表是否在编辑状态
			let result = this.ltlList.some(el => el.isEdit)
			return result
		},

		...mapState({
			dictMap: state => state.dict.dictMap,
			airOrderInfo: state => state.airTransport.airOrderInfo || {},
			serviceInfoList: state => state.airTransport.serviceInfoList,
			roles: state => state.user.roles
		}),
		isOp() {
			if (this.roles.includes('op')) {
				if (['draft', 'refuse', 'submit'].includes(this.airOrderInfo.orderStatus)) {
					return false
				} else {
					return true
				}
			}
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'pod_ltl_delivery')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isDisabledEdit() {
			if (['draft', 'refuse', 'submit'].includes(this.airOrderInfo.orderStatus)) {
				return true
			}
			if(!this.isEcs && !this.isOp && (!this.isCs || !this.isImport)){
				return true
			}
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if (this.isFinish) {
				return true
			} else if (['complete', 'cancel'].includes(this.airOrderInfo.orderStatus)) {
				return true
			} else {
				return false
			}
		},
		isImportJoint() {
			return ['air_import'].includes(this.airOrderInfo.businessType) && this.$route.query.source === 'jointList'
		},
		isImport() {
			return ['air_import'].includes(this.airOrderInfo.businessType)
		},
		airIsJoint() {
			let serviceInfo = this.airOrderInfo.serviceInfoList.find(item => item.serviceCode === 'pod_warehouse')
			let airIsJoint = serviceInfo ? serviceInfo.isJoint : ''
			return airIsJoint === 'y' && !this.$route.query.jointNo ? true : false
		},
		isBd() {
			let airIsJoint = this.airIsJoint
			if (this.$route.query.jointNo) {
				airIsJoint = false
			}
			return airIsJoint
		},
	},
	components: {
		Detail
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
		handleViewFile(fileNo, fileName) {
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
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
			this.$store
				.dispatch('dict/querySupplierList', {
					category: 'serviceCode',
					value: 'truck',
					queryString: val
				})
				.then(data => {
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
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_warehouse_bonded' ? 'Y' : 'N'
			ltlIntrustListWithLoadInfo({
				isBonded,
				orderNo: this.oQuery.orderNo,
				jointNo: this.oQuery.jointNo
			}).then(res => {
				this.ltlList = res.data || []
			})
		},

		handleGetIntrustNo() {
			this.isAdding = true
			ltlReqno().then(res => {
				let intrustNo = res.data.seqNo || ''
				let obj = {
					intrustNo: intrustNo,
					status: 'init',
					intrustType_cn: '出仓',
					intrustType: 'out',
					supplierId: this.airOrderInfo.transport ? this.airOrderInfo.transport.truckSupplierId : '',
					supplierName: this.airOrderInfo.transport ? this.airOrderInfo.transport.truckSupplierName : '',
					supplierContact: '',
					supplierContactPhone: '',
					supplierPhone: '',
					remark: '',
					isEdit: true
				}
				this.supplierList = [{ label: obj.supplierName, value: obj.supplierId }]
				this.ltlList.push(obj)
				this.isAdding = false
			})
		},

		handleAdd() {
			if (this.airIsEdit) {
				this.$message.warning('请先保存正在编辑的数据')
				return
			}
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
			if (this.airIsEdit) {
				this.$message.warning('请先保存正在编辑的数据')
				return
			} else if (this.detailShow) {
				this.$message.warning('请先保存派送信息')
				return
			} else {
				this.supplierList = [
					{
						label: this.ltlList[index].supplierName,
						value: this.ltlList[index].supplierId
					}
				]
				for (let i = 0; i < this.ltlList.length; i++) {
					this.$set(this.ltlList[i], 'isEdit', false)
				}
				this.$set(this.ltlList[index], 'isEdit', true)
			}
		},
		// 详情
		handleInfo(row) {
			this.curRow = row
			console.log('🚀 ~ row', row)
			if (this.airIsEdit) {
				this.$message.warning('请先保存正在编辑的数据')
				return
			}
			this.currIntrustNo = row.intrustNo
			let { orderNo, jointNo } = this.$route.query
			this.getInfo(orderNo, jointNo, this.currIntrustNo)
		},
		getInfo(orderNo, jointNo, intrustNo) {
			ltlIntrustInfo({ orderNo, jointNo, intrustNo }).then(res => {
				for (let i in defaultCreateQuery) {
					this.createItem[i] = res.data[i]
				}
				if (res.data.intrustType === 'out') {
					this.createItem.intrustType_cn = '出仓'
				}
				if (res.data.intrustType === 'in') {
					this.createItem.intrustType_cn = '进仓'
				}
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
					message: '请选择散车派送',
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
						serviceCode: 'pod_warehouse'
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
			let isBonded = this.activityType === 'pod_warehouse_bonded' ? 'Y' : 'N'
			let data = Object.assign({}, values, { isBonded })
			data.orderNo = this.oQuery.orderNo
			data.jointNo = this.oQuery.jointNo
			data.serviceCode = 'pod_warehouse'
			if (!this.canSave) return
			this.canSave = false
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
// @import '../../../../less/index.scss';
.el-table .cell.el-tooltip {
	overflow: hidden !important;
}
#ltlDelivery {
	padding: 0 10px;
}
#ltlDelivery .edit-container.so {
	padding: 0;
}
</style>
