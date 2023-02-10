<template>
	<div class="edit-row agent">
		<div class="edit-container so">
			<div class="row-tit so">
				<span class="tit">报检信息</span>
				<div class="row-tit-operate">
					<div class="">
						<span class="mr10">报检状态</span>
						<el-select v-model="inspectionStatus" size="mini" placeholder="请选择" clearable style="width:120px" @change="handleUpdateStatus" :disabled="!isOp">
							<el-option v-for="item in inspectionStatusList" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
						<el-button size="mini" type="default" class="ml10" @click="handleAdd" :disabled="!isOp">新增委托</el-button>
					</div>
				</div>
			</div>
			<div class="row-form mt10 table-com-layout">
				<el-table ref="inspectionTable" fit style="width: 100%" :data="inspectionList" @selection-change="handleSelectionChange">
					<el-table-column type="selection" width="50"></el-table-column>
					<el-table-column prop="intrustNo" label="报检委托编号" align="center" width="150"></el-table-column>
					<el-table-column prop="status" label="报检状态" align="center">
						<template slot-scope="scope">
							{{ scope.row.status | inspectionStatusFilter }}
						</template>
					</el-table-column>
					<el-table-column prop="inspectionSupplierName" label="报检公司" align="center"></el-table-column>
					<el-table-column prop="inspector" label="报检员" align="center"></el-table-column>
					<el-table-column prop="inspectorPhone" label="报检员电话" align="center"></el-table-column>
					<el-table-column prop="intrustTime" label="委托日期" align="center" width="150"></el-table-column>
					<el-table-column prop="remark" label="报检备注" align="center" width="250"> </el-table-column>
					<el-table-column label="操作" width="100" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleInfo(scope.row)" type="text" size="mini" :disabled="!isOp">详情</el-button>
								<el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="!isOp">删除</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>
		<div class="agentDetail" v-if="detailShow">
			<InspectionDetail
				ref="inspectionDetailForm"
				:type="type"
				:attachmentList="attachmentList"
				:createItem="createItem"
				:currencyList="currencyList"
				@save="handleSave"
				@cancel="handleCancel"
				@update="handleUpdate"
			/>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import {mixin} from '../mixin'
import { getDictLabel, getDictMap } from '@/utils/tools'
import { baseCurrencyList } from '@/api/base'
import {
	inspectionList,
	inspectionDetail,
	inspectionDelete,
	inspectionGetIntrustNo,
	inspectionUpdateStatus,
	inspectionSave,
	inspectionAttachmentList
} from '@/api/order/inspection'
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
		this.getCurrencyList()
		this.getList()
		this.getAttachmentList()
	},
	mounted() {
		console.log(this.dictMap)
	},
	computed: {
		// isBd() {
		// 	let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.isDoc || this.isAc
		// 	let findItem = this.tabMenus.find(item => item.code === this.serviceCode)
		// 	let isJoint = findItem ? findItem.isJoint : false
		// 	return isBd || isJoint
		// },
	},
	components: {
		InspectionDetail
	},
	watch: {},
	methods: {
		// 币别下拉列表
		getCurrencyList(queryString) {
			baseCurrencyList(queryString, 'valid').then(response => {
				this.currencyList = response.data
			})
		},
		// 附件类别下拉列表
		getAttachmentList() {
			inspectionAttachmentList({ serviceCode: this.serviceCode }).then(res => {
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
			inspectionList({ orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.inspectionList = res.data || []
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
</style>
