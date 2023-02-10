<template>
	<div class="">
		<li>
			<el-form-item label="驳船收货地" prop="porPortCode" class="el-form-block" :show-message="false">
				<el-select
					id="porPortCode"
					key="porPortCode"
					size="mini"
					v-model="saveItems.porPortCode"
					filterable
					clearable
					:disabled="disabledState"
					style="width: 100%"
					placeholder="请输入"
					:filter-method="porPortFilterMehod"
					@visible-change="porPortVisibleChange"
					@change="handleChangePorPortCode"
				>
					<el-option v-for="item in porPortList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
		</li>
		<li>
			<el-form-item label="大船起运港" prop="polPortCode"  class="el-form-block" :show-message="false">
				<el-select
					size="mini"
					v-model="saveItems.polPortCode"
					filterable
					clearable
					:disabled="disabledState"
					style="width: 100%"
					placeholder="请输入"
					:filter-method="polPortFilterMehod"
					@visible-change="polPortVisibleChange"
					@change="handleChangePolPortCode"
				>
					<el-option v-for="item in polPortList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
		</li>
		<li>
			<el-form-item class="timeSpecial el-form-block" label="大船截关时间" prop="cyCutOff" :show-message="false">
				<elDatePickerLimit :field="'cyCutOff'" size="mini" v-model="saveItems.cyCutOff" type="date" style="width: 100%" clearable placeholder="请选择" valueFormat="yyyy-MM-dd"  :disabled="disabledState" />
			</el-form-item>
		</li>
		<li>
			<el-form-item class="timeSpecial el-form-block vessel-time" label="大船预计开船时间" prop="etdTime" :show-message="false">
				<elDatePickerLimit :field="'etdTime'" size="mini" v-model="saveItems.etdTime" type="date" style="width: 100%" clearable :disabled="disabledState" placeholder="请选择" valueFormat="yyyy-MM-dd"  />
				<el-popover placement="top"	width="280"	trigger="click" class="vessel-time-popover">
					<Schedule :vesselTime="vesselTime" 
						:etdTimeDisabled="disabledState"
						@updateVesselTime="updateVesselTime" />
					<el-button slot="reference" type="default" size="mini" @click="handleSearchVesselTime">查询</el-button>
				</el-popover>
			</el-form-item>
		</li>
		<li>
			<el-form-item label="大船船名" prop="vessel" class="el-form-block" :show-message="false">
				<el-autocomplete
					style="width: 100%"
					size="mini"
					clearable
					v-model="saveItems.vessel"
					:disabled="disabledState"
					:fetch-suggestions="(queryString, cb) => querySearchVessel(queryString, cb)"
					:trigger-on-focus="false"
					placeholder="请输入"
					:maxlength="128"
					@select="value => handleSelectVessel(value)"
					@clear="value => handleClearVessel(value)"
				></el-autocomplete>
			</el-form-item>
		</li>
		<li>
			<el-form-item label="大船航次" prop="voyage" class="el-form-block" :show-message="false">
				<el-autocomplete
					style="width: 100%"
					size="mini"
					clearable
					v-model="saveItems.voyage"
					:disabled="disabledState"
					:fetch-suggestions="(queryString, cb) => querySearchVoyage(queryString, cb, saveItems.vessel)"
					:trigger-on-focus="false"
					placeholder="请输入"
					:maxlength="128"
					@select="value => handleSelectVoyage(value)"
					@clear="value => handleClearVoyage(value)"
				></el-autocomplete>
			</el-form-item>
		</li>
		<li>
			<el-form-item label="船公司" prop="shipCarrierCode" class="el-form-block vessel-time" :show-message="false">
				<el-select
					size="mini"
					v-model="saveItems.shipCarrierCode"
					filterable
					clearable
					remote
					style="width: 100%"
					placeholder="请输入"
					:disabled="disabledState"
					:remote-method="val => shipCarrierRemoteMethod(val)"
					@visible-change="val => shipCarrierVisibleChange(val)"
					@change="handleChangeShipCarrier"
				>
					<el-option v-for="(item, index) in shipCarrierOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
				</el-select>
				<el-button type="default" size="mini" style="margin-left: 5px;" @click="getShippingCarrierUrl(saveItems.shipCarrierCode)">船司官网</el-button>
			</el-form-item>
		</li>
		<li>
			<el-form-item label="卸货港" prop="unloadingPortCode" class="el-form-block" :show-message="false">
				<el-select
					size="mini"
					v-model="saveItems.unloadingPortCode"
					filterable
					clearable
					:disabled="disabledState"
					style="width: 100%"
					placeholder="请输入"
					:filter-method="unloadPortFilterMehod"
					@visible-change="unloadPortVisibleChange"
					@change="handleChangeUnloadPortCode"
				>
					<el-option v-for="item in unloadPortList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
		</li>
		<li>
			<el-form-item label="目的地" prop="podPortCode" class="el-form-block" :show-message="false">
				<el-select
					size="mini"
					v-model="saveItems.podPortCode"
					filterable
					clearable
					:disabled="disabledState"
					style="width: 100%"
					placeholder="请输入"
					:filter-method="podPortFilterMehod"
					@visible-change="podPortVisibleChange"
					@change="handleChangePodPortCode"
				>
					<el-option v-for="item in podPortList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
		</li>
		<li>
			<el-form-item label="航线代码" prop="carrierService" class="el-form-block" :show-message="false">
				<el-input clearable size="mini" placeholder="请输入" v-model="saveItems.carrierService" :disabled="disabledState"></el-input>
			</el-form-item>
		</li>
		<li>
			<el-form-item label="订舱人员" prop="bkgEmployeeId" class="el-form-block" :show-message="false">
				<el-select
					key="bkgEmployeeId"
					size="mini"
					v-model="saveItems.bkgEmployeeId"
					filterable
					remote
					clearable
					:disabled="disabledState"
					style="width: 100%"
					placeholder="请输入"
					:remote-method="bkgEmployeeRemoteMethod"
					@visible-change="bkgEmployeeVisibleChange"
					@change="handleChangeBkgEmployee"
				>
					<el-option v-for="item in bkgEmployeeList" :key="item.value" :label="item.label" :value="item.value">
						{{item.cname}}<em v-if="item.deptCode" style="color: #999;font-style: normal">({{item.deptCname}})</em>
					</el-option>
				</el-select>
			</el-form-item>
		</li>
		<li>
			<el-form-item label="订舱代理" prop="saveItems" class="el-form-block" :show-message="false">
				<el-select
					key="bkgAgentSupplierId"
					size="mini"
					v-model="saveItems.bkgAgentSupplierId"
					filterable
					remote
					clearable
					:disabled="disabledState"
					style="width: 100%"
					placeholder="请输入"
					:remote-method="(val) => {val && bkgAgentRemoteMethod('bkg_carrier,bkg_agent', val)}"
					@visible-change="(val) => {val && bkgAgentVisibleChange('bkg_carrier,bkg_agent')}"
					@change="handleChangeBkgAgent"
				>
					<el-option v-for="item in bkgAgentSupplierList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
		</li>
		<li>
			<el-form-item required label="是否外配" prop="isExternal" :show-message="false">
				<el-select
					key="isExternal"
					size="mini"
					v-model="saveItems.isExternal"
					clearable
					:disabled="disabledState || isExternalDisabled"
					style="width: 100%"
					placeholder="请选择"
					@change="handleChangeExternal"
				>
					<el-option v-for="item in externalOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
		</li>
		<li>
			<el-form-item label="合约号" prop="contractNo" class="el-form-block" :show-message="false">
				<el-input clearable size="mini" placeholder="请输入" v-model="saveItems.contractNo" :disabled="disabledState" maxlength="128"></el-input>
			</el-form-item>
		</li>
		<li class="auditRemark">
			<el-form-item label="审单备注" prop="auditRemark" class="el-form-block" :show-message="false">
				<el-input clearable size="mini" placeholder="请输入" v-model="saveItems.auditRemark" :disabled="disabledState"> </el-input>
			</el-form-item>
		</li>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { supplierList, supplierInfo } from '@/api/crm/supplier'
import { baseEmployeeListName, baseDeptParticipants } from '@/api/base'
import Schedule from '@/views/order/order/orderList/components/schedule'
export default {
	data() {
		return {
			podPortList: [],
			unloadPortList: [],
			porPortList: [],
			polPortList: [],
			bkgAgentSupplierList: [],
			bkgEmployeeList: [],
			state: 'valid',
			oQuery: this.$route.query,
			pickerOptions: {
				disabledDate(date) {
					// return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
				}
			},
			isExternalDisabled: false,	// 是否外配
			externalOptions: [{label: '是', value: 'y'}, {label: '否', value: 'n'}],
			shipCarrierOptions: [],
			vesselTime: {},
			vesselTimeParam: {}	// 保存船期请求后的传参
		}
	},
	props: {
		employeeListParam: {
			type: Object,
			default: () => ({})
		},
		saveItems: {
			type: Object,
			default: () => ({})
		},
		bookDetailForm: {
			type: Object,
			default: () => ({})
		},
		fillPortCodes: {
			type: String,
			default: ''
		},
		bkgAgentList: {
			type: Array,
			default: () => ([])
		}
	},
	created() {
		this.fillPolPort(this.fillPortCodes)
		if (this.saveItems.bkgAgentSupplierId) {
			this.getSupplierInfo(this.saveItems.bkgAgentSupplierId)
		}
	},
	mounted() {
		// console.log('🚀 ~ this.saveItems.ship.transitPortCode', this.saveItems.ship.transitPortCode)
	},

	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			userId: state => state.user.userId
		}),
		roles() {
			let roles = this.$route.query.roles ? this.$route.query.roles.split(',') : []
			return roles
		},
		isPricing() {
			return this.roles.includes('pricing')
		},
		disabledState() {
			// 审核通过的不可编辑
			if (['pass','booking','booked','book_release'].includes(this.bookDetailForm.bkgStatus)) {
				return true
			}
			return false
		},
	},
	watch: {
		fillPortCodes: {
			handler(newVal) {
				this.fillPolPort(newVal)
			},
			deep: true
		},
		bkgAgentList: {
			handler(newVal) {
				this.bkgAgentSupplierList = newVal
			},
			deep: true,
			immediate: true
		},
		'saveItems.bkgAgentSupplierId': {
			handler(newVal) {
				if (!newVal) {
					this.isExternalDisabled = false
				}
				newVal && this.getSupplierInfo(newVal)
			},
			deep: true,
			immediate: true
		},
		employeeListParam: {
			handler(newVal) {
				this.bkgEmployeeList = newVal.bkg
			},
			deep: true,
			immediate: true
		},
	},
	components: {
		Schedule
	},
	methods: {
		// 船期查询结果直接填入订单详情
    updateVesselTime(val, key) {
      this.saveItems[key] = val
    },
		// 船公司官网
		getShippingCarrierUrl(carrierCode) {
			if (!carrierCode) return
			this.$store.dispatch('order/getShippingCarrierWebUrl', {carrierCode})
		},
		fillPolPort(portCodes) {
			console.log('🚀 ~ portCodes', portCodes)
			// 港口数据反显
			if (portCodes) {
				this.$store.dispatch('dict/basePortListByCodes', { portCodes }).then(data => {
					let initPortData = []
					//初始化下拉框数据
					let results = new Map()
					initPortData = data
					data.map(item => {
						let obj = {}
						obj.label = item.label
						obj.portAttribute = item.portAttribute
						results.set(item.value, obj)
					})
					// this.podPortList = JSON.parse(JSON.stringify(initPortData))
					// this.unloadPortList = JSON.parse(JSON.stringify(initPortData))
					// this.porPortList = JSON.parse(JSON.stringify(initPortData))
					// this.polPortList = JSON.parse(JSON.stringify(initPortData))
					this.podPortList = initPortData.filter(item => item.portCode === this.saveItems.podPortCode)
					this.unloadPortList = initPortData.filter(item => item.portCode === this.saveItems.unloadingPortCode)
					this.porPortList = initPortData.filter(item => item.portCode === this.saveItems.porPortCode)
					this.polPortList = initPortData.filter(item => item.portCode === this.saveItems.polPortCode)
				})
          
			} else {
				this.$store.dispatch('dict/basePortListByCodes', {}).then(data => {
					//初始化下拉框数据
					this.podPortList = JSON.parse(JSON.stringify(data))
					this.unloadPortList = JSON.parse(JSON.stringify(data))
					this.porPortList = JSON.parse(JSON.stringify(data))
					this.polPortList = JSON.parse(JSON.stringify(data))
				})
			}
		},
		// 驳船收货地
		porPortVisibleChange(val) {
			// if (val) this.porPortSearch('', 'port_of_feeder', this.state)
		},
		porPortFilterMehod(val) {
			this.porPortSearch(val, 'port_of_feeder', this.state)
		},
		handleChangePorPortCode(val) {},
		// 驳船收货地下拉数据
		porPortSearch(queryString, portAttribute, state) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.porPortList = result
			})
		},
		// 起运港下拉数据
		polPortSearch(queryString, portAttribute, state) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.polPortList = result
			})
		},
		// 大船起运港
		polPortVisibleChange(val) {
			// if (val) this.polPortSearch('', 'port_of_basic', this.state)
		},
		polPortFilterMehod(val) {
			this.polPortSearch(val, 'port_of_basic', this.state)
		},
		handleChangePolPortCode(val) {
		},
		// 卸货港下拉数据
		unloadPortSearch(queryString, portAttribute, state) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.unloadPortList = result
			})
		},
		// 卸货港
		unloadPortVisibleChange(val) {
			// if (val) this.unloadPortSearch('', 'port_of_discharge', this.state)
		},
		unloadPortFilterMehod(val) {
			this.unloadPortSearch(val, 'port_of_discharge', this.state)
		},
		handleChangeUnloadPortCode(val) {},
		// 目的地下拉数据
		podPortSearch(queryString, portAttribute, state) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.podPortList = result
			})
		},
		// 目的地
		podPortVisibleChange(val) {
			// if (val) this.podPortSearch('', 'port_of_destination', this.state)
		},
		podPortFilterMehod(val) {
			this.podPortSearch(val, 'port_of_destination', this.state)
		},
		handleChangePodPortCode(val) {
			// 获取国家code
			let portItem = this.podPortList.find(item => item.portCode === val)
			let countryCode = portItem ? portItem.countryCode : ''
			this.$emit('getCountryCode', countryCode)
		},
		shipCarrierVisibleChange(val) {
			if (val) this.shipQuerySearch('')
		},
		shipCarrierRemoteMethod(val) {
			this.shipQuerySearch(val)
		},
		handleChangeShipCarrier(val) {},
		// 船公司下拉列表自动补充的数据
		shipQuerySearch(queryString) {
			this.$store
				.dispatch('dict/baseShippingCarrierList', {
					name: queryString,
					state: 'valid'
				})
				.then(data => {
					this.shipCarrierOptions = data.map(ele => {
						return Object.assign(ele, {
							label: ele.value,
							value: ele.key
						})
					})
				})
		},
		// // 船公司下拉列表自动补充的数据
		// shipQuerySearch(queryString, cb) {
		// 	this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString, state: 'valid' }).then(data => {
		// 		cb(data)
		// 	})
		// },
		// handleChangeShipCarrier(val) {
		// 	Object.assign(this.saveItems, {
		// 		shipCarrierCode: val
		// 	})
		// },
		// handleSelectShipCarrier(item) {
		// 	Object.assign(this.saveItems, {
		// 		shipCarrierCode: item.key
		// 	})
		// },
		// 船名输入建议
		querySearchVessel(queryString, cb) {
			this.$store.dispatch('dict/queryBookVessle', { 
				shipCarrierCode: this.saveItems.shipCarrierCode,
				polPortCode: this.saveItems.polPortCode,
				podPortCode: this.saveItems.podPortCode,
				vessel: queryString
			}).then(data => {
				cb(data)
			})
		},
		handleSelectVessel(value) {},
		handleClearVessel(value) {},
		// 航次输入建议
		querySearchVoyage(queryString, cb, vessel) {
			this.$store.dispatch('dict/queryBookVoyage', { 
				shipCarrierCode: this.saveItems.shipCarrierCode,
				polPortCode: this.saveItems.polPortCode,
				podPortCode: this.saveItems.podPortCode,
				voyage: queryString, 
				vessel: vessel
			}).then(data => {
				cb(data)
			})
		},
		handleSelectVoyage(value) {},
		handleClearVoyage(value) {},
		handleSearchVesselTime() {
			let { shipCarrierCode, polPortCode, podPortCode} = this.saveItems
			let param = {
				shipCarrierCode,
				polPortCode,
				podPortCode,
				vessel: this.saveItems.vessel,
				voyage: this.saveItems.voyage
			}
			// 20220223传参不变的话，不请求船期接口。优化减少请求次数
			if (Object.entries(this.vesselTimeParam).toString() === Object.entries(param).toString()) return
			this.$store.dispatch('dict/queryBookVessleTime', param).then(data => {
				this.vesselTimeParam = param
				this.vesselTime = data || {}
			})
		},
		// 订舱代理
		bkgAgentRemoteMethod(category, val) {
			this.getSupplierList(category, val).then(res => {
				this.bkgAgentSupplierList = res.data.list.map(ele => {
					return Object.assign(ele, {
						label: this.$language == 'en' ? ele.ename : ele.name,
						value: ele.supplierId
					})
				})
			})
		},
		bkgAgentVisibleChange(category) {
			!this.saveItems.bkgAgentSupplierId && this.getSupplierList(category).then(res => {
				this.bkgAgentSupplierList = res.data.list.map(ele => {
					return Object.assign(ele, {
						label: this.$language == 'en' ? ele.ename : ele.name,
						value: ele.supplierId
					})
				})
			})
		},
		handleChangeBkgAgent(val) {
			// 变更订舱岗位分配信息
			if (!val) {
				this.saveItems.bkgAgentSupplierId = null
				this.saveItems.bkgAgentSupplierName = ''
				this.saveItems.isExternal = ''
				this.isExternalDisabled = false
			} else {
				supplierInfo({ supplierId: val }).then(res => {
					let {category} = res.data
					// 订舱代理的客户类型为自订，是否外配不可修改，值改为否
					if (category.includes('bkg_carrier')) {
						this.saveItems.isExternal = 'n'
						this.isExternalDisabled = true
					} else {
						this.saveItems.isExternal = ''
						this.isExternalDisabled = false
					}
				})
			}
		},
		getSupplierInfo(val) {
			supplierInfo({ supplierId: val }).then(res => {
				let {category} = res.data
				// 订舱代理的客户类型为自订，是否外配不可修改，值改为否
				if (category.includes('bkg_carrier')) {
					this.saveItems.isExternal = 'n'
					this.isExternalDisabled = true
				} else {
					this.isExternalDisabled = false
				}
			})
		},
		handleChangeExternal(val) {
			console.log('external', val)
		},
		// 订舱人
		bkgEmployeeRemoteMethod(val) {
			this.bkgEmployeeSearch(val)
		},
		bkgEmployeeVisibleChange(val) {
			if (val) {
				this.bkgEmployeeSearch('',)
			}
		},
		handleChangeBkgEmployee(val) {
		},
		// 获取订舱人下拉
		bkgEmployeeSearch(val, key) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: 'bkg'
			}
			baseDeptParticipants(data).then(res => {
				this.bkgEmployeeList = res.data.map(item => {
					return Object.assign(item, {
						label: this.$language == 'en' ? item.ename : item.cname,
						value: item.employeeId
					})
				})
			})
		},
		// 供应商信息模糊查询
		getSupplierList(category, supplierName) {
			let data = {
				currPage: 1,
				pageSize: 50,
				columns: [],
				ascColumns: [],
				descColumns: [],
				query: supplierName
					? [
							{ column: 'category', type: 'in', value: category },
							{ column: 'serviceCode', type: 'in', value: 'book,proxy_book' },
							{ column: 'name', type: 'like', value: supplierName }
					  ]
					: [
						{ column: 'category', type: 'in', value: category },
						{ column: 'serviceCode', type: 'in', value: 'book,proxy_book' },
					]
			}
			return supplierList(data)
		},
	}
}
</script>

<style lang="scss">
.port-tooltip {
	p {
		margin-top: 2px;
	}
}
.vessel-time-popover{
	margin-left: 5px;
}
</style>
