<template>
	<div class="route-detail-cont">
		<div class="route-info-table">
			<div class="table-td">
				<div class="h1">
					<span class="label">基本信息</span>
				</div>
				<div class="flex-form-item label80">
					<el-row>
						<el-col :span="8">
							<el-form-item label="起运港" prop="polPortCode">
								<el-select
									size="mini"
									:disabled="disabledState"
									style="width: 100%"
									clearable
									v-model="createItem.polPortCode"
									filterable
									@change="changePolPort"
									remote
									reserve-keyword
									placeholder="请选择起运港"
									:remote-method="
										val => {
											polPortRemoteMethod(val, createItem.polPortCode)
										}
									"
									@visible-change="polPortRemoteMethod('', createItem.polPortCode)"
								>
									<el-option v-for="item in airPortArr" :key="item.value" :disabled="item.value === createItem.podPortCode || item.value === createItem.potPortCode" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="中转港" prop="potPortCode">
								<el-select
									size="mini"
									:disabled="disabledState"
									style="width: 100%"
									clearable
									v-model="createItem.potPortCode"
									filterable
									@change="changePotPort"
									remote
									reserve-keyword
									placeholder="请选择中转港"
									:remote-method="
										val => {
											potPortRemoteMethod(val, createItem.potPortCode)
										}
									"
									@visible-change="potPortRemoteMethod('', createItem.potPortCode)"
								>
									<el-option v-for="item in potPortArr" :key="item.value" :disabled="item.value === createItem.polPortCode || item.value === createItem.podPortCode" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="目的地" prop="podPortCode">
								<el-select
									size="mini"
									v-model="createItem.podPortCode"
									filterable
									remote
									clearable
									:disabled="disabledState"
									style="width: 100%"
									placeholder="请选择目的地"
									:remote-method="
										val => {
											podPortFilterMehod(val, createItem.podPortCode)
										}
									"
									@visible-change="podPortFilterMehod('', createItem.podPortCode)"
									@change="handleChangePodPortCode"
								>
									<el-option v-for="item in destinationArr" :disabled="item.value === createItem.polPortCode || item.value === createItem.potPortCode" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="起运国">
								<el-input clearable size="mini" v-model="createItem.polCountryCname" disabled></el-input>
							</el-form-item>
							<el-form-item label="目的国">
								<el-input clearable size="mini" v-model="createItem.podCountryCname" disabled></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="航空公司" prop="airLine">
								<el-select
									style="width: 100%"
									:disabled="disabledState"
									size="mini"
									clearable
									v-model="createItem.airLine"
									filterable
									remote
									reserve-keyword
									placeholder="请选择航空公司"
									:remote-method="val => remoteMethod(val, createItem.airLine)"
									@focus="remoteMethod('', createItem.airLine)"
								>
									<div class="air-line-option-title">
										<div>IATA代码</div>
										<div>全称</div>
										<div>运单前缀</div>
									</div>
									<el-option v-for="(item, i) in airLineArr" :key="i" :label="item.label" :value="item.value">
										<div class="air-line-option">
											<div class="air-line-option-info">{{ item.label }}</div>
											<div class="air-line-option-info">{{ item.cname }}</div>
											<div class="air-line-option-info">{{ item.carrierCode }}</div>
										</div>
									</el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="包装" prop="packageInfo">
								<el-select size="mini" v-model="createItem.packageInfo" filterable clearable style="width: 100%" placeholder="请选择" :disabled="disabledState">
									<el-option v-for="item in dictMap.airChargePackage" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</el-form-item>
							<el-form-item label="时效">
								<el-input clearable size="mini" v-model="createItem.prescription" :disabled="disabledState" maxlength="64"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="航班频率">
								<el-input clearable size="mini" v-model="createItem.flightRate" :disabled="disabledState" maxlength="64"></el-input>
							</el-form-item>
							<el-form-item label="有效日期" prop="beginDate">
								<el-date-picker v-model="createItem.beginDate" size="mini" :disabled="disabledState" style="width: 100%" type="daterange" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
								</el-date-picker>
							</el-form-item>
							<el-form-item label="维护人" prop="maintainerId" class="popover-class">
								<el-select
									size="mini"
									v-model="createItem.maintainerId"
									:disabled="disabledState"
									filterable
									remote
									style="width: 100%"
									placeholder="请输入"
									:remote-method="maintainerFilterMethod"
									@visible-change="maintainerVisibleChange"
									@change="handleChangeMaintainer"
								>
									<el-option v-for="item in maintainerOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
								<el-popover popper-class="emplpyeeName-pop" placement="left" width="240" trigger="click">
									<div class="employeeName-list">
										<ul>
											<li v-if="employeeInfo.telephone">座机号：{{ employeeInfo.telephone }}</li>
											<li v-else>手机号：{{ employeeInfo.mobileNo }}</li>
											<li>QQ：{{ employeeInfo.qq }}</li>
											<li>email：{{ employeeInfo.email }}</li>
											<li>部门：{{ employeeInfo.deptCname }}</li>
											<li>公司：{{ employeeInfo.companyCname }}</li>
										</ul>
									</div>
									<i slot="reference" class="el-icon-postcard" @click="getEmployeeInfo(createItem.maintainerId)"></i>
								</el-popover>
							</el-form-item>
						</el-col>
					</el-row>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { employeeInfo, baseEmployeeListName } from '@/api/base'
import { unique } from '@/utils/index'
export default {
	data() {
		return {
			state: 'valid',
			oQuery: this.$route.query,
			airPortArr: [], // 起运港
			potPortArr: [], // 中转
			destinationArr: [], // 目的地
			airLineArr: [],
			employeeInfo: {},
			maintainerOptions: []
		}
	},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		if (this.createItem.maintainerName) {
			this.maintainerOptions = [
				{
					label: this.createItem.maintainerName,
					value: this.createItem.maintainerId
				}
			]
		}
	},
	activated() {
		if (this.createItem.maintainerName) {
			this.maintainerOptions = [
				{
					label: this.createItem.maintainerName,
					value: this.createItem.maintainerId
				}
			]
		}
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			userInfo: state => state.user.userInfo
		}),
		isCopy() {
			return this.$route.query.action === 'copy'
		},
		isAdd() {
			// 复制或新建
			let { id, action } = this.$route.query
			return (action === 'copy' && id) || !id
		},
		disabledState() {
			if (!this.createItem.status || this.createItem.status === 'no_publish') {
				return false
			}
			return true
		}
	},
	watch: {},
	components: {},
	methods: {
		changePolPort(code) {
			if (code) {
				let item = this.airPortArr.find(el => el.value === code)
				this.createItem.polPortName = item ? item.cname : ''

				this.$set(this.createItem, 'polCountryCname', item.countryCname)
				this.$set(this.createItem, 'polCountryEname', item.countryEname)
				this.$set(this.createItem, 'polCountryCode', item.countryCode)
			} else {
				this.createItem.polPortName = ''
				this.$set(this.createItem, 'polCountryCname', '')
				this.$set(this.createItem, 'polCountryEname', '')
				this.$set(this.createItem, 'polCountryCode', '')
			}
		},
		changePotPort(code) {
			// 中转港
			if (code) {
				let item = this.potPortArr.find(el => el.value === code)
				this.createItem.potPortName = item ? item.cname : ''
			} else {
				this.createItem.potPortName = ''
			}
		},
		getEmployeeInfo(employeeId) {
			if (!employeeId) {
				this.employeeInfo = {}
			} else {
				employeeInfo({ employeeId }).then(res => {
					this.employeeInfo = res.data
				})
			}
		},
		handleChangeMaintainer(val) {
			let findItem = this.maintainerOptions.find(ele => ele.value === val)
			this.createItem.maintainerName = findItem ? findItem.label : ''
		},
		// 维护人
		maintainerQuerySearch(queryString) {
			let params = {
				name: this.createItem.maintainerName && !queryString ? this.createItem.maintainerName : queryString,
				roleCode: 'pricing'
			}
			baseEmployeeListName(params).then(res => {
				this.maintainerOptions = res.data.map(ele => {
					return Object.assign(ele, {
						label: ele.cname,
						value: ele.employeeId
					})
				})
			})
		},
		// 维护人
		maintainerVisibleChange(val) {
			val && this.maintainerQuerySearch('')
		},
		maintainerFilterMethod(val) {
			this.maintainerQuerySearch(val)
		},
		remoteMethod(el, value) {
			// 远程搜索航空公司
			this.$store
				.dispatch('dict/aircarrierList', {
					carrierName: value && !el ? value : el
				})
				.then(data => {
					let portList = data
						.map(ele => {
							return Object.assign(ele, {
								value: ele.itat,
								label: ele.itat
							})
						})
						.filter(el => el.itat)
					this.airLineArr = unique([...portList], 'value')
				})
		},
		// 空运港口
		airPortSearch(portName, state, type, code) {
			let params = {}
			if (code && !portName) {
				// 有选中值&&搜索条件不是空
				params = { portName: '', portCodes: code, state: state }
			} else {
				params = { portName: portName, portCodes: '', state: state }
			}
			this.$store.dispatch('dict/airportList', params).then(data => {
				let portList = data.map(ele => {
					return Object.assign(ele, {
						value: ele.portCode,
						label: `${ele.portCode} (${ele.ename}-${ele.cname})`
					})
				})
				this[type] = [...portList]
			})
		},
		polPortRemoteMethod(el, code) {
			// 远程搜索起运港
			this.airPortSearch(el, this.state, 'airPortArr', code)
		},
		potPortRemoteMethod(el, code) {
			// 中转港
			this.airPortSearch(el, this.state, 'potPortArr', code)
		},
		podPortFilterMehod(el, code) {
			// 目的地
			this.airPortSearch(el, this.state, 'destinationArr', code)
		},
		handleChangePodPortCode(val) {
			// 通过目的地查询系统航线
			if (!val) {
				this.$set(this.createItem, 'podCountryCname', '')
				this.$set(this.createItem, 'podCountryEname', '')
				this.$set(this.createItem, 'podCountryCode', '')
				this.createItem.podPortName = ''
				return
			} else {
				let portItem = this.destinationArr.find(item => item.portCode === val)
				this.$set(this.createItem, 'podCountryCname', portItem.countryCname)
				this.$set(this.createItem, 'podCountryEname', portItem.countryEname)
				this.$set(this.createItem, 'podCountryCode', portItem.countryCode)

				this.createItem.podPortName = portItem ? portItem.cname : ''
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.el-row::before,
.el-row::after {
	display: none;
}
.route-detail-cont {
	.route-info-table {
		display: table;
		width: 100%;
		margin: 0 auto;
		border-collapse: separate;
		border-spacing: 10px;
		.table-td {
			width: 100%;
			display: table-cell;
			border-radius: 2px;
			border: 1px solid #e9e9e9;
			vertical-align: top;
			.h1 {
				line-height: 32px;
				height: 32px;
				background: #f8f9fd;
				border-radius: 2px 2px 0 0;
				font-size: 12px;
				display: -webkit-box;
				display: -ms-flexbox;
				display: flex;
				-webkit-box-pack: justify;
				-ms-flex-pack: justify;
				justify-content: space-between;
				padding: 0 8px;
				.label {
					font-weight: 700;
				}
			}
			.flex-form-item {
				padding: 8px;
				&.pr24 {
					padding-right: 24px;
				}
				/deep/.el-form-item {
					display: flex;
					margin-bottom: 4px;
					.el-form-item__label {
						width: 110px;
						line-height: 20px;
						padding-right: 4px;
					}
					.el-form-item__content {
						flex: 1;
						line-height: 20px;
					}
					.el-input--suffix .el-input__inner {
						padding-right: 20px;
						height: 20px !important;
						line-height: 20px !important;
					}
					&.vessel-time {
						.el-form-item__content {
							display: flex;
						}
					}
					.el-radio__label {
						font-size: 12px;
						padding-left: 5px;
					}
					.el-range-editor--mini .el-range__close-icon {
						line-height: 12px;
					}
				}
				&.label80 /deep/.el-form-item .el-form-item__label {
					width: 80px;
				}
				/deep/.el-form-item__content::before,
				/deep/.el-form-item__content::after,
				/deep/.el-form-item::before,
				/deep/.el-form-item::after {
					display: none;
				}
			}
		}
	}
	/deep/ .el-select .el-select__tags {
		max-width: auto !important;
	}
	/deep/ .el-select .el-select__tags span .el-tag--mini:first-of-type {
		flex: auto;
	}
	/deep/ .el-select .el-select__tags span .el-tag--mini:nth-of-type(2) {
		width: auto;
	}
}
.popover-class {
	/deep/ .el-form-item__content {
		display: flex;
		align-items: center;
	}
	.el-icon-postcard {
		font-size: 16px;
		margin-left: 5px;
		cursor: pointer;
		color: #409eff;
		padding-top: 3px;
	}
}
.employeeName-list {
	font-size: 12px;
}
.air-line-option-title {
	padding: 0 10px;
	display: flex;
	justify-content: space-between;
	line-height: 24px;
	font-weight: 600;
}
.air-line-option {
	display: flex;
	justify-content: space-between;
	.air-line-option-info {
		padding-right: 12px;
	}
	.air-line-option-info:last-child {
		padding-right: 0;
	}
}
</style>
