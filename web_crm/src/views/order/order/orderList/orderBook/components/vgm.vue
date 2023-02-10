<template>
	<div id="vgmPage" class="edit-row">
		<div class="edit-container so" id="tableCont">
			<div class="row-tit so">
				<span class="tit ft12">VGM信息</span>
				<div class="row-tit-operate">
          <div class="vgm-btn">
            <el-button type="primary" size="mini" @click="goVgm" v-show="showVgmBtn">在线VGM申请</el-button>
          </div>
					<div class="">
						<span class="mr10">申报状态</span>
						<el-select v-model="status" size="mini" placeholder="请选择" clearable style="width:120px" @change="handleUpdateStatus" :disabled="isBd">
							<el-option v-for="(item, index) in dictMap.vgmStatus" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</div>
					<div class="el-button-group">
						<!-- <el-button size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="isBd">新增委托</el-button> -->
					</div>
				</div>
			</div>
			<div class="row-form mt10 table-com-layout">
				<el-table ref="vgmTable" stripe :data="tableList" @selection-change="handleSelectionChange" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
					<el-table-column type="selection" min-width="50"></el-table-column>
					<el-table-column prop="cn" label="箱号" align="center" min-width="120"> </el-table-column>
					<el-table-column prop="state_cn" label="VGM申报状态" align="center" width="100"> </el-table-column>
					<el-table-column prop="totalWeight" label="VGM总重" align="center"> </el-table-column>
					<el-table-column prop="charge" label="VGM负责人" align="center" width="100"> </el-table-column>
					<el-table-column prop="chargePhone" label="VGM电话" align="center" width="100"> </el-table-column>
					<el-table-column prop="chargeEmail" label="VGM邮箱" align="center" width="100"> </el-table-column>
					<el-table-column prop="address" label="VGM地址" align="center" width="120"> </el-table-column>
					<el-table-column prop="custName" label="VGM负责公司" align="center" min-width="150"> </el-table-column>
					<el-table-column prop="weightAddress" label="称重地址" align="center" width="120"> </el-table-column>
					<el-table-column prop="declareEmployeeName" label="VGM申报人" align="center" width="100"> </el-table-column>
					<el-table-column prop="declareTime" label="VGM申报时间" header-align="center" width="150"> </el-table-column>
					<el-table-column label="日志" width="80">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleViewLog(scope.row)" type="text" size="mini">查看</el-button>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="120" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleDetail(scope.row)" type="text" size="mini" :disabled="isBd">详情</el-button>
								<!-- <el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="isBd">删除</el-button> -->
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>
		<div class="agentDetail" v-show="showDetail">
			<el-form ref="form" label-position="top" label-width="80px">
				<div :class="['row-tit', { isFixed: saveBarFixed }]" :style="styleObject" id="saveBar">
					<span class="tit">{{ !createItem.reportId ? 'VGM新增' : 'VGM详情' }}</span>
					<div class="row-tit-operate">
						<el-button type="default" size="mini" class="ml10" @click="handleCancel">取消</el-button>
						<el-button type="primary" size="mini" class="ml10" @click="handleSave" :disabled="isBd || createItem.status === 'declared'">保存</el-button>
					</div>
				</div>
			</el-form>
			<el-form label-position="left" label-width="94px" ref="createItem" :model="createItem" :rules="rules">
				<div class="row-flex ml20">
					<el-form-item label="关联箱号" prop="cn" :show-message="false" class="flex-item">
						<el-select size="mini" placeholder="请输入" v-model="createItem.cn" style="width: 100%" clearable @change="handleSelectCn" :disabled="true">
							<el-option v-for="(item, index) in cnOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="VGM总量" prop="totalWeight" class="flex-item" :show-message="false">
						<el-input @blur="validatePoint('totalWeight', 'VGM总量')"  size="mini" placeholder="请输入" v-model="createItem.totalWeight" clearable></el-input>
					</el-form-item>
					<el-form-item label="货重" prop="goodsWeight" class="flex-item" :show-message="false">
						<el-input @blur="validatePoint('goodsWeight', '货重')"  size="mini" placeholder="请输入" v-model="createItem.goodsWeight" clearable></el-input>
					</el-form-item>
					<el-form-item label="空柜重量" prop="emptyWeight" class="flex-item" :show-message="false">
						<el-input @blur="validatePoint('emptyWeight', '空柜重量')" size="mini" placeholder="请输入" v-model="createItem.emptyWeight" clearable></el-input>
					</el-form-item>
					<el-form-item label="VGM责任公司" class="flex-item" :show-message="false">
						<el-select
							size="mini"
							style="width: 100%"
							placeholder="请选择"
							v-model="createItem.custid"
							clearable
							filterable
							@visible-change="
								val => {
									getCustVisibleChange(val)
								}
							"
							:filter-method="
								val => {
									getCustVisibleChange(val)
								}
							"
							@change="
								val => {
									handleChangeSupplier(val)
								}
							"
						>
							<el-option v-for="(item, index) in supplierOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="VGM负责人姓名" prop="charge" class="flex-item" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="createItem.charge" clearable></el-input>
					</el-form-item>
					<el-form-item label="VGM负责人电话" prop="chargePhone" class="flex-item" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="createItem.chargePhone" clearable></el-input>
					</el-form-item>
					<el-form-item label="VGM邮箱" prop="chargeEmail" class="flex-item" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="createItem.chargeEmail" clearable></el-input>
					</el-form-item>
					<el-form-item label="VGM地址" prop="address" class="flex-item" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="createItem.address" clearable></el-input>
					</el-form-item>
					<el-form-item label="称重时间" prop="address" class="flex-item" :show-message="false">
						<elDatePickerLimit size="mini" v-model="createItem.weightTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
					</el-form-item>
					<el-form-item label="称重地址" prop="weightAddress" class="flex-item" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="createItem.weightAddress" clearable></el-input>
					</el-form-item>
					<el-form-item label="VGM申报人" prop="declareEmployeeId" class="flex-item" :show-message="false">
						<el-select
							size="mini"
							:filterable="true"
							v-model="createItem.declareEmployeeId"
							style="width: 100%"
							clearable
							placeholder="请选择"
							@visible-change="
								val => {
									getdeclareVisibleChange(val)
								}
							"
							:filter-method="
								val => {
									getdeclareVisibleChange(val)
								}
							"
							@change="handleChangeEmployee"
						>
							<el-option v-for="o in employeeOptions" :key="o.key" :label="o.value" :value="o.key"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="VGM申报时间" prop="declareTime" class="flex-item" :show-message="false">
						<elDatePickerLimit size="mini" v-model="createItem.declareTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
					</el-form-item>
				</div>
			</el-form>
		</div>
		<div v-if="logPopShow">
			<Log :params="logParam" @close="logPopClose" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { vgmList, vgmSave, vgmDelete, vgmUpdateStatusByContainer } from '@/api/order/vgm'
import { baseEmployeeListName, baseSupplierList } from '@/api/base'
import { getDictLabel } from '@/utils/tools'
import { orderContainerList } from '@/api/order/list'
import { orderInfo } from '@/api/order/list'
import { carrierList } from '@/api/order/createBooking'
import Log from './vgmLog'
const defaultCreateQuery = {
	reportId: undefined,
	address: '',
	charge: '',
	chargeEmail: '',
	chargePhone: '',
	cn: '',
	declareEmployeeId: '',
	declareEmployeeName: '',
	declareTime: '',
	emptyWeight: '',
	orderNo: '',
	so: '',
	isReport: 'n',
	custid: '',
	custName: '',
	totalWeight: '',
	weightAddress: '',
	weightTime: '',
	containerId: null,
	status: '',
	goodsWeight: ''
}
const defaultQuery = {
	currPage: 1,
	pageSize: 30,
	query: [{ column: 'custName', type: 'default', value: '' }]
}

export default {
	name: 'vgm',
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
	components: {
		Log
	},
	data() {
		var validatorVgmWeight = (rule, value, callback) => {
			if (value === 0) {
				this.$message.error('VGM总重不能为0')
				callback(new Error());
			} else {
				callback()
			}
		}
		return {
			oQuery: this.$route.query,
			tableList: [],
			isReport: false,
			status: '',
			multipleSelection: [],
			showDetail: false,

			createItem: Object.assign({}, defaultCreateQuery),
			employeeOptions: [],
			supplierOptions: (this.createItem && [{ label: this.createItem.supplierName, value: this.createItem.supplierId }]) || [],
			// 发货单位下拉搜索
			supplierQuery: Object.assign({}, defaultQuery),
			// 表单校验
			rules: {
				cn: [{ required: true, message: '不能为空', trigger: 'change' }],
				totalWeight: [
					{ required: true, message: '不能为空', trigger: 'blur' },
					{ validator: validatorVgmWeight, trigger: ['blur'] }
				],
				goodsWeight: [{ required: true, message: '不能为空', trigger: 'blur' }],
			},
			cnOptions: [], // 箱号列表
			logPopShow: false,
			logParam: {},
      carrierCode: '',
      showVgmBtn: false
		}
	},
	created() {
		this.getVgmList()
		this.getContainerList()
    this.getOderInfo()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			serviceInfoList: state => state.order.serviceInfoList
		}),
		jointState() {
			return this.oQuery.jointNo ? true : false
		},
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
			return this.ordDetRole === 'op_truck'
		},
		isBd() {
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.isAc || this.isDoc || this.isOpTruck
			let findItem = this.tabMenus.find(item => item.code === 'vgm')
			let isJoint = findItem ? findItem.isJoint : false
			return isBd || isJoint || this.isFinish
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'vgm')
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
		}
	},
	methods: {
    // 获取carrierCode
    getOderInfo() {
      let orderNo = this.$route.query.orderNo || ''
       orderInfo({ orderNo }).then(res => {
        this.carrierCode =  res.data?.ship?.shipCarrierCode || ''
        this.getCarrierSourceList()
       }).catch(()=>{})
    },
    // 获取船司
    getCarrierSourceList(str = '') {
      const data = {
        keyword: str,
        type: 'vgm',
        baseCarrierCode: this.carrierCode,
      }
      carrierList(data)
        .then((res) => {
          if (res.code === 0) {
            this.showVgmBtn = res.data?.length > 0 ?? false
          }
        })
        .catch(() => {})
    },
    // 在线vgm申请
    goVgm () {
      let orderNo = this.$route.query.orderNo || ''
      let routeUrl = this.$router.resolve({
          name: 'OnlineVgm',
          query: {
            carrierCode: this.carrierCode,
            orderNo
          },
        })
      window.open(routeUrl.href, '_blank')
    },
		handleViewLog(row) {
			this.logPopShow = true
			this.logParam = row
		},
		logPopClose() {
			this.logPopShow = false
		},
		validatePoint(val, msg) {
			// 体积重量保存为小数点后3位
            if (['totalWeight','goodsWeight','emptyWeight'].includes(val)) {
				const pReg = /^\d+(\.\d+)?$/
				if (!this.createItem[val]) return
				if (typeof(this.createItem[val]) === 'string') {
					let pointIndex = this.createItem[val].indexOf('.')
					if (pointIndex !== -1) {
						this.createItem[val] = this.createItem[val].substring(0, pointIndex + 4)
					}
				}
				this.createItem[val] = Number(this.createItem[val])
				if (!pReg.test(this.createItem[val])) {
					this.createItem[val] = ''
					return this.$message.error('请输入正确的' + msg)
				}
				if(['goodsWeight', 'emptyWeight'].includes(val)) {
					this.createItem['totalWeight'] = this.createItem['goodsWeight'] + this.createItem['emptyWeight']
				}
			}
			if (this.createItem[val] > 999999) {
				this.createItem[val] = 999999
				this.$message.error('最大不能超过999999')
			}
		},
		validateTotalWeight() {
			let reg = /^\d+(\.\d+)?$/
			if (this.createItem.totalWeight && !reg.test(this.createItem.totalWeight)) {
				return this.$message({ type: 'error', message: '请输入正确的vgm总量' })
			}
		},
		getTotalWeight() {
			let reg = /^\d+(\.\d+)?$/
			if (this.createItem.emptyWeight && !reg.test(this.createItem.emptyWeight)) {
				return this.$message({ type: 'error', message: '请输入正确的空柜重量' })
			}

			if (this.createItem.goodsWeight && !reg.test(this.createItem.goodsWeight)) {
				return this.$message({ type: 'error', message: '请输入正确的货重' })
			}
		},
		// 获取列表
		getVgmList() {
			let param = {
				orderNo: this.oQuery.orderNo,
				jointNo: this.oQuery.jointNo
			}
			this.lsLoading = true
			vgmList(param).then(response => {
				response.data && response.data.length && response.data.map(item => (item.state_cn = getDictLabel('vgmStatus', item.status || 'no_declare')))
				this.tableList = response.data
			}).finally(() => {
				this.lsLoading = false
			})
		},
		// 新建委托
		handleAdd(action) {
			Object.assign(this.createItem, {}, defaultCreateQuery)
			this.isReport = false
			this.showDetail = true
		},

		// 详情修改
		handleDetail(row) {
			this.showDetail = true
			for (let i in this.createItem) {
				this.createItem[i] = row[i]
			}
			if (!this.createItem.declareEmployeeId || this.createItem.declareEmployeeId === 0) {
				this.createItem.declareEmployeeId = ''
			}
			this.isReport = row.isReport == 'y' ? true : false
			this.employeeOptions = [{ value: this.createItem.declareEmployeeName, key: this.createItem.declareEmployeeId }]
			this.supplierOptions = [{ label: this.createItem.custName, value: this.createItem.custid }]
		},
		validate() {
			return true
		},
		// 保存
		handleSave() {
			// this.createItem.status = data.status ? data.status : 'no_declare'
			this.createItem.orderNo = this.oQuery.orderNo
			this.createItem.jointNo = this.oQuery.jointNo
			if (this.createItem.emptyWeight > 99999) {
				return this.$message({ type: 'error', message: '空柜重量最大不能超过99999' })
			}

			if (this.createItem.goodsWeight > 99999) {
				return this.$message({ type: 'error', message: '货重最大不能超过99999' })
			}

			if (this.createItem.totalWeight > 999999) {
				return this.$message({ type: 'error', message: 'vgm总量最大不能超过999999' })
			}
			this.$refs['createItem'].validate(valid => {
				if (valid) {
					vgmSave(this.createItem).then(res => {
						this.$message({
							type: 'success',
							message: '保存成功',
							duration: 1000
						})
						this.showDetail = false
						this.getVgmList()
					})
				}
			})
		},

		// 删除
		handleDelete(row) {
			const reportId = row.reportId
			this.$confirm('是否确认删除?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return vgmDelete({ reportId, jointNo: this.oQuery.jointNo, orderNo: this.oQuery.orderNo })
				})
				.then(response => {
					// 删除和打开详情的信息为同一条时，该条信息的详情则不显示
					if (this.createItem.reportId === row.reportId) {
						this.showDetail = false
					}
					this.getVgmList()
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(() => {})
		},

		// 取消
		handleCancel() {
			this.showDetail = false
		},

		// 选择箱子cn
		handleSelectCn(val) {
			let sItem = this.cnOptions.find(item => item.value === val)
			this.createItem.containerId = sItem.oid
			this.createItem.emptyWeight = sItem.emptyWeight
			this.createItem.goodsWeight = sItem.weight
		},

		// 获取申报人下拉选项
		getdeclareVisibleChange(val) {
			if (val === true) val = ''
			this.employeeSelectlist(val)
		},

		// 选中申报人下拉
		handleChangeEmployee(val) {
			if (val) {
				let item = this.employeeOptions.filter(o => {
					return o.value === val
				})
				this.createItem.declareEmployeeName = item.label
			} else {
				this.createItem.declareEmployeeId = ''
				this.createItem.declareEmployeeName = ''
			}
		},

		// 获取责任人公司
		getCustVisibleChange(val) {
			if (val === true) val = ''
			this.getSupplierList(val)
		},

		// 获取发货单位
		getSupplierList(val) {
			this.$store.dispatch('dict/queryCustomerList', val).then(res => {
				let list = res.list
				this.supplierOptions = list.map(o => {
					return {
						value: o.custid ? Number(o.custid) : '',
						label: this.$language == 'en' ? o.ename : o.name
					}
				})
			})
		},

		// 下拉选择责任人公司
		handleChangeSupplier(val) {
			if (val) {
				let item = this.supplierOptions.filter(o => {
					return o.value === val
				})
				this.createItem.custName = item[0].label
			} else {
				this.createItem.custid = ''
				this.createItem.custName = ''
			}
		},
		// 员工列表
		employeeSelectlist(queryString) {
			let data = {
				state: 'valid',
				name: queryString
			}
			this.$store.dispatch('dict/employeeSelectlist', data).then(data => {
				this.employeeOptions = data
			})
		},

		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
			console.log(this.multipleSelection)
		},

		// 获取reportIds
		getReportIds() {
			let reportIds = []
			this.multipleSelection.map(item => {
				reportIds.push(item.reportId)
			})
			return reportIds
		},
		getContainerIds() {
			let containerIds = []
			this.multipleSelection.map(item => {
				containerIds.push(item.containerId)
			})
			return containerIds
		},
		// 更新状态
		handleUpdateStatus(val) {
			if (!val) return
			if (this.multipleSelection.length === 0) {
				this.status = ''
				return this.$message.error('请勾选一条要更新状态的vgm')
			}
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let containerIds = this.getContainerIds()
					return vgmUpdateStatusByContainer({
						jointNo: this.oQuery.jointNo,
						orderNo: this.oQuery.orderNo,
						status: val,
						containerIds: containerIds,
						formContainer: 0	// 1集装箱页，0vgm页
					})
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '更新状态成功',
						duration: 1000,
						onClose: () => {
							this.status = ''
							this.getVgmList()
						}
					})
				})
				.catch(err => {
					this.status = ''
				})
		},

		// 箱号
		getContainerList() {
			orderContainerList({ orderNo: this.oQuery.orderNo }).then(res => {
				this.cnOptions = res.data
					.filter(item => item.cn)
					.map(item => {
						return Object.assign(item, {
							label: item.cn,
							value: item.cn
						})
					})
			})
		}
	}
}
</script>
<style lang="scss" scoped>
@import '../../../less/index.scss';
#vgmPage {
	.flex-item {
		width: 20% !important;
		margin-bottom: 4px;
		/deep/.el-form-item__label {
			padding-right: 0;
			padding-right: 4px;
			text-align: right;
		}
	}
}
#vgmPage .edit-container.so {
	padding-bottom: 20px;
}
.row-tit-operate {
	float: right;
}

.flex-item:nth-child(13),
.flex-item:nth-child(14) {
	width: 49.5% !important;
}

.el-form-item__content {
	line-height: 20px;
}
#vgmPage .agentDetail .row-tit {
	&.isFixed {
		position: fixed;
		background-color: #fff;
		z-index: 999;
		padding: 5px 20px;
		height: 30px;
		box-shadow: 4px 0px 10px 0px #e9e9e9;
		top: 24px;
		// top: 64px;
		right: 0;
		.tit {
			line-height: 20px;
		}
	}
}
.vgm-btn{
  margin-right: 10px;
}
</style>
<style>
.el-form-item__label,
.el-form-item__content {
	line-height: 20px !important;
}
</style>
