<template>
	<div class="order-work-cont" :style="{ height: `${checkPointHeight}px` }">
		<div class="duty-link" @click="goDuty()"><i class="icon-duty"></i>查看值班人员</div>
		<el-collapse v-if="$route.query.jointNo" v-model="workerActives">
			<el-collapse-item name="1">
				<template slot="title">
					<div class="worker-type-label">协同参与人</div>
				</template>
				<div class="work-assign-item" v-for="(item, index) in jointOrderWorkOptions" :key="item.jobCode">
					<WorkAssignUserInfo :item="item" />
					<div class="item-value">
						<el-select
							size="mini"
							:filterable="true"
							clearable
							:disabled="jointWorkDisabled(item) || selectedDisabled"
							v-model="item.employeeName"
							style=""
							placeholder="请选择"
							@visible-change="
								val => {
									visibleChange(val, index, 'isJoint')
								}
							"
							:filter-method="
								val => {
									filterMehod(val, index, 'isJoint')
								}
							"
							@clear="handleClearJointEmployee(item, index)"
							@change="
								val => {
									handleChangeJointEmployee(item, val, index)
								}
							"
						>
							<el-option v-for="(o, i) in item.data" :key="o.employeeId + '-' + i" :label="o.employeeName" :value="o.employeeId">
								{{ o.cname }}<em v-if="o.deptCode" style="color: #999; font-style: normal">({{ o.deptCname }})</em>
							</el-option>
						</el-select>
					</div>
				</div>
			</el-collapse-item>
			<el-collapse-item name="2">
				<template slot="title">
					<div class="worker-type-label">原单参与人</div>
				</template>
				<div class="work-assign-item" v-for="(item, index) in orderWorkOptions" :key="item.jobCode">
					<WorkAssignUserInfo :item="item" />
					<div class="item-value">
						<el-select
							size="mini"
							:filterable="true"
							:disabled="true"
							v-model="item.employeeName"
							style=""
							placeholder="请选择"
							@visible-change="
								val => {
									visibleChange(val, index)
								}
							"
							:filter-method="
								val => {
									filterMehod(val, index)
								}
							"
							@change="
								val => {
									handleChangeEmployee(item, val, index)
								}
							"
						>
							<el-option v-for="(o, i) in item.data" :key="o.employeeId + '-' + i" :label="o.employeeName" :value="o.employeeId">
								{{ o.cname }}<em v-if="o.deptCode" style="color: #999; font-style: normal">({{ o.deptCname }})</em>
							</el-option>
						</el-select>
					</div>
				</div>
			</el-collapse-item>
		</el-collapse>
		<div v-else class="work-assign-item" v-for="(item, index) in orderWorkOptions" :key="item.jobCode" :id="'work-' + item.jobCode" :class="{ warning: item.isUpdate }">
			<WorkAssignUserInfo :item="item" v-if="pricingHide(item)" />
			<div class="item-value" v-if="pricingHide(item)" :class="!editState ? 'invalid' : ''">
				<span v-if="!item.show">{{ item.employeeName }}</span>
				<el-select
					v-if="item.show"
					size="mini"
					clearable
					:filterable="true"
					:disabled="!editState || workDisabled(item)"
					v-model="item.employeeName"
					style=""
					placeholder="请选择"
					@visible-change="
						val => {
							visibleChange(val, index)
						}
					"
					:filter-method="
						val => {
							filterMehod(val, index)
						}
					"
					@change="
						val => {
							handleChangeEmployee(val, index)
						}
					"
				>
					<el-option v-for="o in item.data" :disabled="bdAndAsstDisabledItem(item.jobCode, o.employeeId)" :key="o.employeeId" :label="o.label" :value="o.employeeId">
						{{ o.cname }}<em v-if="o.deptCode" style="color: #999; font-style: normal">({{ o.deptCname }})</em>
					</el-option>
				</el-select>
			</div>
		</div>
		<div class="mt10">
			<div class="joint-work-item" v-if="jointAuditWorkData && Object.keys(jointAuditWorkData).length">
				<div class="item-label">{{ jointAuditWorkData.jobCname }}</div>
				<div class="item-value joint-work">
					<span>{{ jointAuditWorkData.employeeName }}</span>
				</div>
			</div>
			<div class="joint-work-item" v-if="jointWorkData && jointWorkData.length">
				<div class="item-label">协同岗位分配</div>
				<div class="item-value joint-work">
					<el-collapse v-model="activeNames" @change="handleChange">
						<el-collapse-item :title="item.compName" :name="index" v-for="(item, index) in jointWorkData" :key="index">
							<template slot="title">
								<div class="worker-company-name" :title="item.compName">{{ item.compName }}</div>
							</template>
							<div class="joint-work-row">
								<div class="val">
									<el-tooltip class="item" v-if="$route.query.source === 'orderList'" popper-class="copyOrderNo-pop" placement="left-start" :visible-arrow="false">
										<div @click="copy($event, item.jointNo)" slot="content">复制</div>
										<el-button type="text" class="jointNo-link" @click="handleToJointOrderDetail(item.jointNo)">{{ item.jointNo }}</el-button>
									</el-tooltip>
									<span v-else>{{ item.jointNo }}</span>
								</div>
							</div>
							<div class="joint-work-row" v-if="item.jobUserList && item.jobUserList.length">
								<div class="label">协同内容：</div>
								<div class="val" v-for="(ele, b) in item.jobUserList" :key="'user' + b">
									<WorkAssignUserInfo :item="ele" type="jointService" />
									<div>
										<el-tooltip :disabled="!ele.serviceName.toString()" class="item" effect="dark" :content="`${ele.serviceName.toString()}` ? `服务项：${ele.serviceName.toString()}` : ''" placement="top-start">
											<el-input disabled v-model="ele.employeeName"></el-input>
										</el-tooltip>
									</div>
								</div>
							</div>
						</el-collapse-item>
					</el-collapse>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { orderWork } from '@/api/order/list'
import { baseEmployeeList, pricingCustomer, employeeInfo, baseDeptParticipants } from '@/api/base'
import clip from '@/utils/clipboard'
import WorkAssignUserInfo from '@/views/order/order/components/workAssignUserInfo'
export default {
	data() {
		return {
			oQuery: this.$route.query,
			employeeOptions: [],
			activeNames: ['0'],
			employeeInfo: {},
			workerActives: '1',
			selectedDisabled: false,
			timerTr: null
		}
	},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		orderStatus: {
			type: String,
			default: ''
		},
		serviceList: {
			type: Array,
			default: () => []
		},
		orderWorkOptions: {
			type: Array,
			default: () => []
		},
		jointOrderWorkOptions: {
			type: Array,
			default: () => []
		},
		checkPointHeight: {
			type: Number,
			default: 0
		},
		jointAuditWorkData: {
			type: Object,
			default: () => ({})
		},
		jointWorkData: {
			type: Array,
			default: () => []
		},
		obdDeptCode: {
			type: String,
			default: ''
		},
		bdDeptCode: {
			type: String,
			default: ''
		},
		importDeptCode: {
			type: String,
			default: ''
		}
	},
	activated() {
		this.getOrderWork()
	},
	created() {
		// this.getOrderWork()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			order: state => state.order,
			compCode: state => state.user.compCode,
			userInfo: state => state.user.userInfo,
			userEditRoles: state => state.order.orderList.userEditRoles,
			orderInfoDataObj: state => state.order.orderInfoDataObj
		}),
		editState() {
			let status = false
			// 协同单不可修改参与人，
			if (this.$route.query.source === 'jointList' && ['ship_export_fcl', 'ship_export_lcl'].includes(this.createItem.businessType)) {
				status = false
			} else {
				// 业务
				if (this.isBd) {
					// 草稿、已拒绝状态可修改参与人，其他状态不可修改
					if (['draft', 'refuse'].includes(this.orderStatus)) {
						status = true
					}
				}
				// 操作
				if (this.isOp) {
					if (['pass'].includes(this.orderStatus)) {
						status = true
					}
				}
				// 文件
				if (this.isDoc) {
					if (['pass'].includes(this.orderStatus)) {
						status = true
					}
				}
				// 拖报
				if (this.isOpTruck) {
					if (['pass'].includes(this.orderStatus)) {
						status = true
					}
				}
				if (this.isEcs || this.isEpricing) {
					if (['pass'].includes(this.orderStatus)) {
						status = true
					}
				}
				// bkg
				if (this.isBkg) {
					// bkg只开放拼箱的订舱人员的编辑，其他禁用。订舱无协同的可以编辑
					if (['pass'].includes(this.orderStatus) && ['st03', 'st18', 'st04', 'st19'].includes(this.createItem.serviceType) && !this.whBookIsJoint) {
						status = true
					}
				}
				// csc
				if (this.isCsc) {
					if (['pass'].includes(this.orderStatus)) {
						status = true
					}
				}
			}
			return status
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
		// 拼箱订舱服务项是否被协同
		whBookIsJoint() {
			return this.createItem.serviceInfoList.find(item => ['whbook', 'proxy_whbook'].includes(item.serviceCode) && item.isJoint === 'y') ? true : false
		},
		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isOpTruck() {
			return this.ordDetRole === 'op_truck'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'asst'
		},
		isEpricing() {
			return this.userEditRoles.includes('epricing')
		},
		isEcs() {
			return this.userEditRoles.includes('ecs')
		},
		isCsc() {
			return this.ordDetRole === 'csc'
		}
	},
	watch: {},
	components: {
		WorkAssignUserInfo
	},
	methods: {
		bdAndAsstDisabledItem(type, code) {
			// obd,asst 下拉不能选择的数据
			let result = false
			if (['obd', 'asst'].includes(type)) {
				if (code == this.orderInfoDataObj.bdEmployeeId) {
					result = true
				}
			}
			return result
		},
		copy(e, value) {
			clip(value, e)
		},
		handleToJointOrderDetail(jointNo) {
			let routeUrl = this.$router.resolve({
				name: 'JointOrderDetail',
				params: {
					orderNo: this.$route.query.orderNo
				},
				query: {
					orderNo: this.$route.query.orderNo,
					jointNo: jointNo,
					source: 'jointList',
					showRelate: false, // this.isSameCode && ['st01', 'st15'].includes(row.serviceType)
					showBl: ['st09', 'st10'].includes(this.createItem.serviceType)
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		debounceLxz(fn, time = 800) {
			clearTimeout(this.timerTr)
			this.timerTr = setTimeout(() => {
				if (!fn || !(fn instanceof Function)) {
					this.$message({ message: '参数错误！', type: 'error', showClose: true })
				} else {
					fn()
				}
			}, time)
		},
		goDuty() {
			let routeUrl = this.$router.resolve({
				name: 'DutyList'
			})
			window.open(routeUrl.href, '_blank')
		},
		getOrderWork() {
			let { workAssign } = this.createItem
			// console.log('work:', workAssign);
			let workAssignArr = []

			if (this.$route.query.action === 'add') {
				this.orderWorkOptions.forEach(item => {
					Object.assign(item, {
						show: true
					})
				})
			} else {
				// 编辑订单时参与人下拉框反显
				this.orderWorkOptions.forEach(item => {
					Object.assign(item, {
						show: true
					})
					if (workAssign && workAssign.length) {
						workAssign.forEach(o => {
							if (item.jobCode === o.jobCode) {
								Object.assign(item, {
									employeeName: o.employeeName,
									employeeId: o.employeeId
								})
							}
						})
					}
				})
			}
			// console.log(this.orderWorkOptions)
		},

		filterMehod(val, index, type) {
			this.debounceLxz(() => {
				if (type === 'isJoint') {
					this.getJointEmployeeName(val, index)
				} else {
					this.getEmployeeName(val, index)
				}
			})
		},
		visibleChange(val, index, type) {
			if (type === 'isJoint') {
				if (val) {
					this.getJointEmployeeName('', index)
				}
			} else {
				if (val) {
					this.getEmployeeName('', index)
				}
			}
		},

		/*
		 * 商务参与人特殊处理
		 * 整箱的委托订舱st01的代订舱不显示商务，客户自订不显示商务
		 * 拼箱的委托订舱st03的代订舱不显示商务，客户自订不显示商务
		 */
		pricingHide(item) {
			if (item.jobCode === 'pricing') {
				if (this.serviceList.includes('proxy_book') || ['st02', 'st16', 'st17'].includes(this.createItem.serviceType)) {
					return false
				}
				if (this.serviceList.includes('proxy_whbook') || ['st04', 'st19'].includes(this.createItem.serviceType)) {
					return false
				}
			}
			return true
		},
		// 协同参与人下拉禁用设置
		jointWorkDisabled(item) {
			// bd,obd,asst,pricing,bkg,csc
			if (['bd', 'obd', 'asst', 'pricing', 'bkg', 'csc'].includes(item.jobCode)) {
				return true
			}
			if (this.isOp || this.isBkg) {
				// 审核通过的可以编辑, 其他状态不可编辑，订舱人员不可修改
				if (!['pass'].includes(this.orderStatus) || (item.jobCode === 'bkg' && ['ship_export_fcl'].includes(this.createItem.businessType))) {
					return true
				}
				return false
			}
			if (this.isEpricing || this.isEcs) {
				return !['ecs', 'epricing'].includes(item.jobCode)
			}
			return true
		},
		// 参与人下拉禁用设置，
		workDisabled(item) {
			// 业务禁用bd,放开asst,obd，服务项有订舱禁用bkg,服务项有代订舱，pricing禁用并清空
			// 客户自定禁用pricing,bkg
			if (this.isBd) {
				if (item.jobCode === 'bd') {
					return true
				} else if (item.jobCode === 'obd' || item.jobCode === 'asst') {
					// 建单时当前登录人不是当前销售，则OBD和下单助理不可编辑，否则可以编辑
					if (this.orderInfoDataObj.bdEmployeeId == this.userInfo.sysUserId) {
						return false
					} else {
						return true
					}
				} else if (item.jobCode === 'pricing') {
					if (this.serviceList.includes('proxy_book') || this.serviceList.includes('proxy_whbook') || (this.createItem.ship.priceType === 'bd' && ['st01', 'st24'].includes(this.createItem.serviceType))) {
						// item.employeeName = ''
						// item.employeeId = ''
						return true
					} else {
						return false
					}
				} else if (item.jobCode === 'bkg') {
					// 放开订舱参与人
					// return this.serviceList.includes('book')
				}
				return false
				// return ['bd', 'obd'].includes(item.jobCode) || item.jobCode === 'bkg' && this.serviceList.includes('book')
			}
			// bkg
			if (this.isBkg) {
				return ['bd', 'obd', 'pricing', 'asst', 'op', 'line_cs', 'op_truck', 'op_customs', 'op_wh', 'doc', 'csc', 'tc', 'ac', 'eac', 'rc', 'ecs', 'epricing'].includes(item.jobCode)
			}
			// 操作禁用bd,obd,asst,pricing,bkg  0331
			if (this.isOp) {
				return ['bd', 'obd', 'asst', 'pricing', 'bkg'].includes(item.jobCode)
			}
			// // 散杂滚装的除了bd,op，其他都不可编辑
			// if (this.createItem.businessType === 'ship_bulk_ro') {
			// 	return true
			// }
			// 散货拖报操作
			if (this.isOpTruck) {
				if (['ship_customs', 'ship_export_customs', 'ship_import_customs'].includes(this.createItem.businessType)) {
					return !['ac', 'op_customs'].includes(item.jobCode)
				} else {
					return !['op_truck', 'op_customs', 'op_wh'].includes(item.jobCode)
				}
			}
			// 文件禁用bd,obd,asst,pricing,bkg  0331 ,'epricing','ecs'
			if (this.isDoc) {
				return ['bd', 'obd', 'asst', 'pricing', 'bkg'].includes(item.jobCode)
			}
			if (this.isCsc) {
				return ['bd', 'obd', 'pricing', 'asst', 'op', 'bkg', 'line_cs', 'op_truck', 'op_customs', 'op_wh', 'doc', 'tc', 'ac', 'eac', 'rc', 'ecs', 'epricing'].includes(item.jobCode)
			}
			if (this.isAc) {
				return true
			}
			// 0331 注释
			if (this.isEpricing || this.isEcs) {
				return ['bd', 'obd', 'pricing', 'asst', 'op', 'bkg', 'line_cs', 'op_truck', 'op_customs', 'op_wh', 'doc', 'csc', 'tc', 'ac', 'eac', 'rc'].includes(item.jobCode)
			}
		},

		handleChangeEmployee(val, index) {
			let itemData = (this.orderWorkOptions[index].data ? this.orderWorkOptions[index].data : []).find(ele => ele.employeeId === val)
			this.orderWorkOptions[index].employeeName = itemData ? itemData.cname : ''
			this.orderWorkOptions[index].employeeId = itemData ? itemData.employeeId : ''
			this.orderWorkOptions[index].compCode = itemData ? itemData.companyCode : ''
			this.orderWorkOptions[index].isUpdate = false
			// 登录用户所在的分公司与所选商务不是同一个时，参与人订舱的值置为0
			let compCode = this.orderWorkOptions[index].compCode
			let jobCode = this.orderWorkOptions[index].jobCode
			this.$emit('changeEmployeeId', jobCode, this.orderWorkOptions[index].employeeId)
			// jobCode === 'pricing' && this.$emit('changePricingId', this.orderWorkOptions[index].employeeId)
			// jobCode === 'bkg' && this.$emit('changeBkgId', this.orderWorkOptions[index].employeeId)
			// jobCode === 'op' && this.$emit('changeOpId', this.orderWorkOptions[index].employeeId)
			console.log('val', val, jobCode, this.compCode, compCode)
			console.log('🚀 ~ orderWorkOptions', this.orderWorkOptions)
			if (val && jobCode === 'pricing' && compCode !== this.compCode) {
				this.orderWorkOptions.forEach(ele => {
					if (ele.jobCode === 'bkg') {
						ele.employeeName = ''
						ele.employeeId = 0
					}
				})
			}
			//根据海外商务带出海外客服
			if (val && jobCode === 'epricing') {
				pricingCustomer({ orderNo: this.$route.query.orderNo, employeeId: val }).then(res => {
					console.log('🚀 ~ res', res)
					if (res.data) {
						this.orderWorkOptions.forEach(ele => {
							if (ele.jobCode === 'ecs') {
								ele.employeeName = res.data.cname
								ele.employeeId = res.data.employeeId
							}
						})
					}
				})
			}
		},
		handleChangeJointEmployee(item, val, index) {
			// pricng角色修改订舱人员
			if (this.isPricing && item.jobCode === 'bkg') {
				this.$emit('changeBkg', val)
			}
			// bkg角色修改订舱人员
			if (this.isBkg && item.jobCode === 'bkg' && val) {
				/*
				 *el-select选择下拉后弹出确认框，当关闭确认框后会自动获取焦点并触发visibleChange事件显示下拉
				 *解决办法：在change事件触发后给el-select设置禁用disabled为ture,关闭弹窗后设置为false
				 */
				this.selectedDisabled = true
				this.$confirm('是否要修改订舱人员？', '警告', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						this.selectedDisabled = false
						this.$emit('changeBkg', val)
					})
					.catch(action => {
						this.selectedDisabled = false
						this.$emit('init')
					})
			}
			let itemData = (this.jointOrderWorkOptions[index].data ? this.jointOrderWorkOptions[index].data : []).find(ele => ele.employeeId === val)
			this.jointOrderWorkOptions[index].employeeName = itemData ? itemData.cname : ''
			this.jointOrderWorkOptions[index].employeeId = itemData ? itemData.employeeId : ''
			// console.log('pricing', jobCode, this.compCode, compCode)
		},
		handleClearJointEmployee(item, index) {
			console.log('item, index', item, index)
			this.jointOrderWorkOptions[index].employeeName = ''
			this.jointOrderWorkOptions[index].employeeId = ''
		},
		// 获取员工name
		getJointEmployeeName(val, index) {
			let roleCode = this.jointOrderWorkOptions[index].jobCode
			// console.log('🚀 ~ roleCode', roleCode)
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				deptCode: this.userInfo.deptCode,
				roleCode
			}
			// if (roleCode === 'pricing' || roleCode === 'eac' || roleCode === 'csc' || roleCode === 'bkg') {
			// 	delete data.deptCode
			// }
			// // 进口操作放开同公司
			// if (roleCode === 'op' && ['ship_import_fcl', 'ship_import_lcl'].includes(this.createItem.businessType)) {
			// 	delete data.deptCode
			// }
			if (roleCode === 'ac' || roleCode === 'eac') {
				// 应收财务和海外应收财务不限制公司
				delete data.deptCode
			}
			baseDeptParticipants(data).then(res => {
				let result = res.data.map(item => {
					let { deptCname } = item
					item.label = item.cname + deptCname ? `(${deptCname})` : ''
					return { ...item }
				})
				// console.log('result', result)
				this.$set(this.jointOrderWorkOptions[index], 'data', result)
			})
		},
		// 获取员工name
		getEmployeeName(val, index) {
			let roleCode = this.orderWorkOptions[index].jobCode
			console.log('🚀 ~ roleCode', roleCode)
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				deptCode: this.obdDeptCode,
				roleCode
			}
			if (roleCode === 'pricing' || roleCode === 'eac' || roleCode === 'csc' || roleCode === 'bkg') {
				delete data.deptCode
			}
			// 审核通过的出口拼箱委托订舱，客户自订的bkg订舱人员不能选其他分公司的
			if (roleCode === 'bkg' && this.orderStatus === 'pass' && ['st03', 'st18', 'st04', 'st19'].includes(this.createItem.serviceType)) {
				data.deptCode = this.compCode
			}
			// // 进口操作放开同公司
			// if (roleCode === 'op' && ['ship_import_fcl', 'ship_import_lcl'].includes(this.createItem.businessType)) {
			// 	delete data.deptCode
			// }
			// 进口订单：若importDeptCode有值，则商务、操作参与人下拉只能选进口部人员；若importDeptCode为null，则商务、操作参与人下拉不限制部门，显示所有
			if (['ship_import_fcl', 'ship_import_lcl'].includes(this.createItem.businessType) && ['op', 'pricing'].includes(roleCode)) {
				data.deptCode = this.importDeptCode
				data.isOnlyDeptCode = true
				if (!this.importDeptCode) {
					delete data.deptCode
					delete data.isOnlyDeptCode
				}
			}
			if (roleCode === 'epricing' || roleCode === 'ecs') {
				delete data.deptCode
			}
			if (roleCode === 'obd') {
				// 2、OBD不限制公司
				delete data.deptCode
			}
			if (roleCode === 'asst') {
				// 3、下单助理和销售同公司
				data.deptCode = this.bdDeptCode
			}
			if (roleCode === 'ac' || roleCode === 'eac') {
				// 应收财务和海外应收财务不限制公司
				delete data.deptCode
			}
			baseDeptParticipants(data).then(res => {
				let result = res.data.map(item => {
					let { deptCname } = item
					item.label = item.cname + deptCname ? `(${deptCname})` : ''
					return { ...item }
				})
				// console.log('result', result)
				this.$set(this.orderWorkOptions[index], 'data', result)
			})
		},

		handleChange(val) {
			// console.log(val);
		},

		handleTogglePopOver(employeeId) {
			// console.log('employeeId', employeeId)
			this.employeeInfo = {
				telephone: '',
				mobileNo: '',
				email: '',
				deptCname: '',
				companyCname: ''
			}
			if (employeeId) {
				employeeInfo({ employeeId: employeeId }).then(res => {
					this.employeeInfo = res.data
				})
			}
		}
	}
}
</script>

<style lang="scss">
.order-work-cont {
	position: relative;
	height: 100%;
	overflow-y: auto;
	.work-assign-item {
		margin: 0 10px;
		.item-label {
			line-height: 20px;
			display: flex;
			margin-top: 2px;
			.el-icon-postcard {
				font-size: 16px;
				margin-left: 5px;
				cursor: pointer;
				color: #409eff;
				padding-top: 3px;
			}
		}
		.item-value {
			color: #969696;
			height: 20px;
			line-height: 20px;
			// margin-top: 2px;
			&.invalid {
				pointer-events: none;
				cursor: pointer;
				.el-input__inner {
					background-color: #f5f7fa;
				}
			}
		}
		&.warning {
			.item-value .el-input__inner {
				border: 1px solid #e9851f;
				box-shadow: 0px 0px 0px 2px #fdf2e8;
			}
		}
	}
	.joint-work-item {
		background-color: #f9f9f9;
		padding: 0 10px 15px 10px;
		.item-label {
			line-height: 32px;
			font-weight: bold;
		}
	}
	.el-collapse-item__header {
		padding: 0 10px;
		font-size: 12px;
		height: 30px;
		line-height: 30px;
		border-bottom: 1px dashed #e9e9e9;
	}
	.el-collapse-item__content {
		font-size: 12px;
	}
	.joint-work .el-collapse-item__header {
		font-size: 12px;
		height: 32px;
		line-height: 32px;
		background-color: #f9f9f9;
		padding: 0;
	}
	.joint-work .el-collapse-item__content {
		padding-bottom: 10px;
		background-color: #f9f9f9;
	}
	.joint-work .joint-work-row {
		font-size: 12px;
		.label {
			color: #999;
			line-height: 20px;
			.el-icon-postcard {
				font-size: 16px;
				margin-left: 5px;
				cursor: pointer;
				color: #409eff;
			}
		}
		.el-input {
			font-size: 12px;
		}
		.val {
			line-height: 16px;
			em {
				color: #999;
				font-style: normal;
			}
			.jointNo-link {
				font-size: 12px;
				text-decoration: underline;
				padding: 5px 0px;
			}
		}
	}
}
.emplpyeeName-pop {
	font-size: 12px;
}
.duty-link {
	font-size: 12px;
	color: #3e80f5;
	line-height: 16px;
	display: flex;
	align-items: center;
	padding: 4px 0;
	margin: 0 12px;
	cursor: pointer;
	border-bottom: 1px dashed #d9d9d9;
	.icon-duty {
		height: 12px;
		width: 12px;
		background: url('~@/assets/icon_duty.png') no-repeat;
		background-size: 100% 100%;
		margin-right: 3px;
	}
}
.copyOrderNo-pop.is-dark {
	font-size: 12px;
	text-align: center;
	cursor: pointer;
	background: #ecf5ff;
	color: #409eff;
	border: 1px solid #d9ecff;
	padding: 2px 5px;
}
</style>
