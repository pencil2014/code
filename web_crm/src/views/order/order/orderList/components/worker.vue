<template>
	<div class="order-work-cont" :style="{ height: `${checkPointHeight}px` }">
		<div class="duty-link" @click="goDuty()"><i class="icon-duty"></i>查看值班人员</div>
		<div class="work-assign-item" v-for="(item, index) in orderWorkOptions" :key="item.jobCode" :id="'work-' + item.jobCode" :class="{ warning: item.isUpdatePricing || item.isUpdateBkg }">
			<div class="item-label" v-if="pricingHide(item)">
				<span>{{ item.jobCname }}</span>
				<el-popover popper-class="emplpyeeName-pop" placement="left" width="240" trigger="click">
					<div class="employeeName-list">
						<ul>
							<li v-if="employeeInfo.telephone">座机号：{{employeeInfo.telephone}}</li>
              <li v-else>手机号：{{employeeInfo.mobileNo}}</li>
							<li>邮箱：{{ employeeInfo.email }}</li>
							<li>部门：{{ employeeInfo.deptCname }}</li>
							<li>公司：{{ employeeInfo.companyCname }}</li>
						</ul>
					</div>
					<i slot="reference" class="el-icon-postcard" @click="handleTogglePopOver(item.employeeId)"></i>
				</el-popover>
			</div>
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
					<el-option v-for="o in item.data" :key="o.employeeId" :label="o.label" :value="o.employeeId">
						{{ o.cname }}<em v-if="o.deptCode" style="color: #999;font-style: normal">({{ o.deptCname }})</em>
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
							<div class="joint-work-row">
								<div class="label">协同单号：</div>
								<div class="val">{{ item.jointNo }}</div>
							</div>
							<div class="joint-work-row" v-if="item.jobUserList && item.jobUserList.length">
								<div class="label">协同内容：</div>
								<div class="val" v-for="(ele, index) in item.jobUserList" :key="'user' + index">
									<div class="label">
										<span>{{ ele.jobCname }}: </span>
										<el-popover popper-class="emplpyeeName-pop" placement="left" width="240" trigger="click">
											<div class="employeeName-list">
												<ul>
													<li v-if="employeeInfo.telephone">座机号：{{employeeInfo.telephone}}</li>
                  				<li v-else>手机号：{{employeeInfo.mobileNo}}</li>
													<li>邮箱：{{ employeeInfo.email }}</li>
													<li>部门：{{ employeeInfo.deptCname }}</li>
													<li>公司：{{ employeeInfo.companyCname }}</li>
												</ul>
											</div>
											<i slot="reference" class="el-icon-postcard" @click="handleTogglePopOver(ele.employeeId)"></i>
										</el-popover>
									</div>
									<div class="">
										{{ ele.employeeName }}
									</div>
									<div class="label">服务项：</div>
									<div class="">{{ `${ele.serviceName.toString()}` ? `${ele.serviceName.toString()}` : '' }}</div>
								</div>
							</div>
							<!-- <div v-if="item.serviceName && item.serviceName.length" class="joint-work-row">
                <div class="label">协同项：</div>
                <div class="val">
                  <span>{{item.serviceName.toString()}}</span>
                  <span v-for="(ele, index) in item.serviceName" :key="'serviceName' + index">{{index ? `,${ele}` : `${ele}`}}</span>
                </div>
              </div>
              <div v-if="item.jobUserList && item.jobUserList.length" class="joint-work-row">
                <span class="label">协同人：</span>
                <div class="val" v-for="(ele, index) in item.jobUserList" :key="'user' + index">{{ele.jobCname}}: {{ele.employeeName}}</div>
              </div> -->
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
import { baseEmployeeList, baseEmployeeListName, employeeInfo, baseDeptParticipants } from '@/api/base'

export default {
	data() {
		return {
			oQuery: this.$route.query,
			employeeOptions: [],
			activeNames: ['0'],
			employeeInfo: {},
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
			compCode: state => state.user.compCode
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
		isOpTruck() {
			return this.ordDetRole === 'op_truck'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'asst'
		}
	},
	watch: {},
	components: {},
	methods: {
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
		filterMehod(val, index) {
			this.debounceLxz(() => {
				this.getEmployeeName(val, index)
			})
		},

		visibleChange(val, index) {
			if (val) {
				this.getEmployeeName('', index)
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
		// 参与人下拉禁用设置，
		workDisabled(item) {
			// 业务禁用bd,放开asst,obd，服务项有订舱禁用bkg,服务项有代订舱，pricing禁用并清空
			// 客户自定禁用pricing,bkg
			if (this.isBd) {
				if (item.jobCode === 'bd') {
					return true
				} else if (item.jobCode === 'pricing') {
					if (this.serviceList.includes('proxy_book') || this.serviceList.includes('proxy_whbook') || this.createItem.ship.priceType === 'bd') {
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
			// 操作禁用bd,obd,asst,pricing,bkg
			if (this.isOp) {
				return ['bd', 'obd', 'asst', 'pricing', 'bkg'].includes(item.jobCode)
			}
			// 文件禁用bd,obd,asst,pricing,bkg
			if (this.isDoc) {
				return ['bd', 'obd', 'asst', 'pricing', 'bkg'].includes(item.jobCode)
			}
			// 散货拖报操作
			if (this.isOpTruck) {
				return !['op_truck'].includes(item.jobCode)
			}
		},

		handleChangeEmployee(val, index) {
			let itemData = (this.orderWorkOptions[index].data ? this.orderWorkOptions[index].data : []).find(ele => ele.employeeId === val)
			this.orderWorkOptions[index].employeeName = itemData ? itemData.cname : ''
			this.orderWorkOptions[index].employeeId = itemData ? itemData.employeeId : ''
			this.orderWorkOptions[index].compCode = itemData ? itemData.companyCode : ''
			this.orderWorkOptions[index].isUpdatePricing = false
			this.orderWorkOptions[index].isUpdateBkg = false
			// 登录用户所在的分公司与所选商务不是同一个时，参与人订舱的值置为0
			let compCode = this.orderWorkOptions[index].compCode
			let jobCode = this.orderWorkOptions[index].jobCode
			jobCode === 'pricing' && this.$emit('changePricingId', this.orderWorkOptions[index].employeeId)
			jobCode === 'bkg' && this.$emit('changeBkgId', this.orderWorkOptions[index].employeeId)
			// console.log('pricing', jobCode, this.compCode, compCode)
			if (val && jobCode === 'pricing' && compCode !== this.compCode) {
				this.orderWorkOptions.forEach(ele => {
					if (ele.jobCode === 'bkg') {
						ele.employeeName = ''
						ele.employeeId = 0
					}
				})
			}
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
			// // 进口操作放开同公司
			// if (roleCode === 'op' && ['ship_import_fcl', 'ship_import_lcl'].includes(this.createItem.businessType)) {
			// 	delete data.deptCode
			// }
			// 进口订单：若importDeptCode有值，则商务、操作参与人下拉只能选进口部人员；若importDeptCode为null，则商务、操作参与人下拉不限制部门，显示所有
			if (['ship_import_fcl', 'ship_import_lcl'].includes(this.createItem.businessType) && ['op','pricing'].includes(roleCode)) {
				data.deptCode = this.importDeptCode
				data.isOnlyDeptCode = true
				if (!this.importDeptCode) {
					delete data.deptCode
					delete data.isOnlyDeptCode
				}
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
	.joint-work .el-collapse-item__header {
		font-size: 12px;
		height: 32px;
		line-height: 32px;
		background-color: #f9f9f9;
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
		.val {
			line-height: 16px;
			em {
				color: #999;
				font-style: normal;
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
</style>
