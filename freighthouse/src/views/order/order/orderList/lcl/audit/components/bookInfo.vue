<template>
	<div class="lclAudit-bookInfo-cont">
		<div class="table-td">
			<div class="h1">
				<span class="label">港口信息</span>
				<div class="include-barge">
					<el-checkbox size="mini" v-model="includeFeederState" true-label="y" false-label="n" :disabled="disabledState" @change="handleChangeIncludeFeeder">包含驳船</el-checkbox>
				</div>
			</div>
			<div class="pd8 flex-form-item label90" :class="!disabledState ? 'pr24' : ''">
				<el-form-item label="驳船收货地" prop="barge.porPortCode" :required="true" :show-message="false" v-if="isIncludeFeeder">
						<div class="port-flex-form">
							<div class="port-code">
								<el-popover placement="top" width="100%" trigger="hover" class="port-ename" :disabled="isPricing || !createItem.barge.porPortCode" popper-class="port-ename-popover">
									<div class="port-popover">{{ createItem.barge.porPortCode }}<em @click="handleCopyPort(createItem.barge.porPortCode, $event)">复制</em></div>
									<el-select
										slot="reference"
										key="porPortCode"
										size="mini"
										v-model="createItem.barge.porPortCode"
										filterable
										clearable
										:disabled="disabledState && !isChangeEdit"
										style="width: 100%"
										placeholder="请输入"
										:filter-method="porPortFilterMehod"
										@change="handleChangePorPortCode"
									>
										<el-option v-for="item in porPortList" :key="item.value" :label="item.value" :value="item.value">
											<span>{{ item.label }}</span>
										</el-option>
									</el-select>
								</el-popover>
							</div>
							<PortPopover :portItem="porPortItem" />
						</div>
					</el-form-item>
				<el-form-item :required="isExport" label="装货地" prop="ship.receiptPlace" :show-message="false">
					<el-select
						size="mini"
						v-model="createItem.ship.receiptPlace"
						filterable
						remote
						clearable
						:disabled="disabledState"
						style="width: 100%"
						placeholder="请输入"
						:remote-method="receiptPlaceFilterMehod"
						@visible-change="receiptPlaceVisibleChange"
						@change="handleChangeReceiptPlace"
					>
						<el-option v-for="item in cityList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item :required="isImport" label="起运港" prop="ship.polPortCode" :show-message="false">
					<div class="port-flex-form">
						<div class="port-code">
							<el-select
								key="polPortCode"
								size="mini"
								v-model="createItem.ship.polPortCode"
								remote
								filterable
								clearable
								:disabled="disabledState"
								style="width: 100%"
								placeholder="请输入"
								:remote-method="polPortFilterMehod"
								@visible-change="polPortVisibleChange"
								@change="handleChangePolPortCode"
							>
								<el-option v-for="item in polPortList" :key="item.value" :label="item.value" :value="item.value">
									<span>{{item.label}}</span>
								</el-option>
							</el-select>
						</div>
						<PortPopover :portItem="polPortItem"/>
					</div>
				</el-form-item>
				<el-form-item :required="false" label="卸货港" prop="ship.unloadingPortCode" :show-message="false">
					<div class="port-flex-form">
						<div class="port-code">
							<el-select
								key="unloadingPortCode"
								size="mini"
								v-model="createItem.ship.unloadingPortCode"
								remote
								filterable
								clearable
								:disabled="disabledState"
								style="width: 100%"
								placeholder="请输入"
								:remote-method="unloadingPortFilterMehod"
								@visible-change="unloadingPortVisibleChange"
								@change="handleChangeUnloadingPortCode"
							>
								<el-option v-for="item in unloadingPortList" :key="item.value" :label="item.value" :value="item.value">
									<span>{{item.label}}</span>
								</el-option>
							</el-select>
						</div>
						<PortPopover :portItem="unloadingPortItem"/>
					</div>
				</el-form-item>
				<el-form-item required label="目的地" prop="ship.podPortCode" :show-message="false">
					<div class="port-flex-form">
						<div class="port-code">
							<el-select
								key="podPortCode"
								size="mini"
								v-model="createItem.ship.podPortCode"
								remote
								filterable
								clearable
								:disabled="disabledState"
								style="width: 100%"
								placeholder="请输入"
								:remote-method="podPortFilterMehod"
								@visible-change="podPortVisibleChange"
								@change="handleChangePodPortCode"
							>
								<el-option v-for="item in podPortList" :key="item.value" :label="item.value" :value="item.value">
									<span>{{item.label}}</span>
								</el-option>
							</el-select>
						</div>
						<PortPopover :portItem="podPortItem"/>
					</div>
				</el-form-item>
				<el-form-item label="系统航线" prop="ship.sysLineName" :show-message="false">
					<el-input clearable size="mini" placeholder="请输入" v-model="createItem.ship.sysLineName" disabled></el-input>
				</el-form-item>
				<el-form-item label="国家" :show-message="false" v-if="isImport">
					<el-input type="text" clearable size="mini" placeholder="请输入" v-model="countryName" disabled></el-input>
				</el-form-item>
			</div>
		</div>
		<div class="table-td">
			<div class="h1">
				<span class="label">船东信息</span>
			</div>
			<div class="pd8 flex-form-item">
				<el-form-item class="timeSpecial" label="驳船预计开船时间" prop="barge.etdTime" :required="isExport" :show-message="false" v-if="isIncludeFeeder">
						<elDatePickerLimit :field="'bargeEtdTime'" size="mini" v-model="createItem.barge.etdTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="disabledState" />
					</el-form-item>
				<el-form-item :required="isExport" label="预计截仓时间" prop="etWhCyCutOff" :show-message="false">
					<elDatePickerLimit size="mini" v-model="createItem.etWhCyCutOff" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd"  :disabled="disabledState" />
				</el-form-item>
				<el-form-item :required="isExport" label="大船预计开船时间" prop="ship.etdTime" :show-message="false">
					<elDatePickerLimit :field="'etdTime'" size="mini" v-model="createItem.ship.etdTime" type="date" style="width: 100%" clearable :disabled="disabledState" placeholder="请选择" value-format="yyyy-MM-dd"  />
				</el-form-item>
				<el-form-item label="大船实际开船时间" prop="ship.tdTime" :show-message="false" v-if="isExport">
					<elDatePickerLimit noCanFuture :field="'tdTime'" size="mini" v-model="createItem.ship.tdTime" type="date" style="width: 100%" clearable :disabled="disabledState" placeholder="请选择" value-format="yyyy-MM-dd" />
				</el-form-item>
				<el-form-item class="timeSpecial" label="截放行时间" prop="ship.cvCutOff" :show-message="false">
					<elDatePickerLimit
					  :field="'cvCutOff'"
						size="mini"
						v-model="createItem.ship.cvCutOff"
						type="datetime"
						style="width: 100%"
						clearable
						:popper-class="'hideMinute'"
						placeholder="请选择"
						format="yyyy-MM-dd HH"
						value-format="yyyy-MM-dd HH"
						:disabled="disabledState"
					/>
				</el-form-item>
				<el-form-item class="timeSpecial" label="截报关时间" prop="ship.ccCutOff" :show-message="false">
					<elDatePickerLimit
					  :field="'ccCutOff'"
						size="mini"
						v-model="createItem.ship.ccCutOff"
						type="datetime"
						style="width: 100%"
						clearable
						:popper-class="'hideMinute'"
						placeholder="请选择"
						format="yyyy-MM-dd HH"
						value-format="yyyy-MM-dd HH"
						:disabled="disabledState"
					/>
				</el-form-item>
				<el-form-item label="委托备注" prop="intrustRemark" :show-message="false">
					<el-input type="textarea" rows="4" size="mini" maxlength="512" show-word-limit placeholder="请输入" v-model="createItem.intrustRemark" :disabled="true"> </el-input>
				</el-form-item>
			</div>
		</div>
		<div class="table-td">
			<div class="h1">
				<span class="label">货运信息</span>
			</div>
			<div class="pd8 flex-form-item" :class="isImport ? 'label125' : 'label70'">
				<el-form-item class="bizDate" label="业务日期" prop="bizDate" :show-message="false">
					<elDatePickerLimit size="mini" v-model="createItem.bizDate" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="true" />
				</el-form-item>
				<el-form-item label="贸易条款" prop="transport.tradeTermsCode" :show-message="false" v-if="isImport">
					<el-select v-model="createItem.transport.tradeTermsCode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="true">
						<el-option v-for="item in dictMap.tradeTermsCode" :label="item.label" :value="item.value" :key="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="运输条款" prop="transport.transportTerm" :show-message="false" v-if="isImport">
					<el-select v-model="createItem.transport.transportTerm" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="true">
						<el-option v-for="(item, index) in dictMap.shipTerms" :label="item.label" :value="item.value" :key="index"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="出单方式" prop="ship.blMode" :show-message="false" v-if="isImport">
					<el-select v-model="createItem.ship.blMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="true">
						<el-option v-for="(item, index) in dictMap.blMode" :label="item.label" :value="item.value" :key="index"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="发货人是否有出口权" prop="transport.isExportRight" :show-message="false" v-if="isImport">
					<el-select v-model="createItem.transport.isExportRight" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="true">
						<el-option v-for="(item, index) in dictMap.yesOrNoOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="收货人是否有进口权" prop="transport.isImportRight" :show-message="false" v-if="isImport">
					<el-select v-model="createItem.transport.isImportRight" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="true">
						<el-option v-for="(item, index) in dictMap.yesOrNoOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="提货人" :show-message="false" prop="transport.takeContactName" v-if="isImport">
					<el-input clearable size="mini" placeholder="请输入" v-model="createItem.transport.takeContactName" :disabled="true" maxlength="512"> </el-input>
				</el-form-item>
				<el-form-item label="提货人联系方式" :show-message="false" prop="transport.takeContactPhone" v-if="isImport">
					<el-input clearable size="mini" placeholder="请输入" v-model="createItem.transport.takeContactPhone" :disabled="true" maxlength="512"> </el-input>
				</el-form-item>
				<el-form-item label="提货地址" :show-message="false" prop="transport.takeAddress" v-if="isImport">
					<el-input clearable size="mini" placeholder="请输入" v-model="createItem.transport.takeAddress" :disabled="true" maxlength="512"> </el-input>
				</el-form-item>
				<el-form-item required label="总件数" prop="quantity" :show-message="false">
					<el-input @blur="validateQuantity('quantity', createItem)" clearable size="mini" placeholder="请输入" v-model.number="createItem.quantity" :disabled="disabledState"></el-input>
				</el-form-item>
				<el-form-item required label="总毛重" prop="weight" :show-message="false">
					<el-input @blur="validateVolumeWeight('weight', createItem)" size="mini" v-model="createItem.weight" clearable placeholder="请输入" :disabled="disabledState">
						<template slot="append">KGS</template>
					</el-input>
				</el-form-item>
				<el-form-item required label="总体积" prop="volume" :show-message="false">
					<el-input @blur="validateVolumeWeight('volume', createItem)" size="mini" v-model="createItem.volume" clearable placeholder="请输入" :disabled="disabledState">
						<template slot="append">CBM</template>
					</el-input>
				</el-form-item>
				<el-form-item label="付款方式" prop="payMode" :show-message="false" v-if="isExport">
					<el-select v-model="createItem.payMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="true">
						<el-option v-for="(item, index) in dictMap.payMode" :label="item.label" :value="item.value" :key="index"> </el-option>
					</el-select>
				</el-form-item>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import {getDictLabel} from '@/utils/tools'
import {quantityMixin} from '@/views/order/order/mixins/quantityMixin'
import { portSystemLineInfo, baseSystemLineInfo, citySelectList } from '@/api/base'
import PortPopover from '@/views/order/order/orderList/components/portPopover'
export default {
	mixins: [quantityMixin],
	data() {
		return {
			porPortItem:{},
			porPortList:[],
			includeFeederState: '',
			countryName: '',
			state: 'valid',
			cityList: [],
			podPortList: [],
			podPortItem: {},
			polPortList: [],
			polPortItem: {},
			unloadingPortList: [],
			unloadingPortItem: {},
			pickerOptions: {
				disabledDate(date) {
					//disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
					// return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
				}
			},
		}
	},
	props: {
		createItem: {
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
		orderStatus: {
			type: String,
			default: ''
		},
		includeFeeder: {
			type: String,
			default: ''
		},
	},
	created() {	
		this.init()
		this.fillPolPort(this.fillPortCodes)
	},
	mounted() {
		console.log('🚀 ~ this.createItem', this.createItem, this.orderStatus)
	},

	computed: {
		...mapState('user', ['roles', 'userId']),
		...mapState('dict', ['dictMap', 'userId']),
		isPricing() {
			return this.roles.includes('pricing')
		},
		isChange() {
			return this.bookDetailForm.portModifyInfo && Object.keys(this.bookDetailForm.portModifyInfo).length ? true : false
		},
		// 商务可以修改改船改港相关字段
		isChangeEdit() {
			return this.isPricing && this.isChange && ['submit'].includes(this.bookDetailForm.bkgStatus)
		},
		isIncludeFeeder() {
			return this.includeFeeder === 'y' ? true : false
		},
		// 海运出口
		isExport() {
			return this.bookDetailForm.businessType === 'ship_export_lcl'
		},
		// 海运进口
		isImport() {
			return this.bookDetailForm.businessType === 'ship_import_lcl'
		},
		disabledState() {
			if (this.isPricing) {
				// 审核通过的、订舱拒绝给业务的不可编辑
				let {auditEmployeeId, orgAuditEmployeeId} = this.createItem
        if (!['submit'].includes(this.orderStatus)) {
          return true
				}
				// // 有协助审核人并且原审核人是登录用户的不可编辑
				// if (auditEmployeeId && orgAuditEmployeeId && auditEmployeeId !== orgAuditEmployeeId && orgAuditEmployeeId === this.userId) {
        //   return true
				// }
				return false
			}
			return true
		},
	},
	watch: {
		includeFeeder: {
			handler(newVal) {
				this.includeFeederState = newVal
			},
			deep: true,
			immediate: true
		},
		fillPortCodes: {
			handler(newVal) {
				this.fillPolPort(newVal)
			},
			deep: true
		},
		createItem: {
			handler(newVal) {
				this.createItem = newVal
				this.init()
			},
			deep: true
		}
	},
	components: {
		PortPopover
	},
	methods: {
		handleChangePorPortCode(val) {
      let findItem = this.porPortList.find(item => item.portCode === val)
      this.porPortItem = findItem || {}
    },
		porPortFilterMehod(val) {
      this.porPortSearch(val, 'port_of_feeder', this.state)
    },
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
		// 切换是否包含驳船
		handleChangeIncludeFeeder(val) {
			this.$emit('change', val)
		},
		init() {
			// 处理进出口大小写
			this.createItem.transport.isExportRight ? (this.createItem.transport.isExportRight = this.createItem.transport.isExportRight.toLowerCase()) : null
			this.createItem.transport.isImportRight ? (this.createItem.transport.isImportRight = this.createItem.transport.isImportRight.toLowerCase()) : null
			// 装货地城市反显
			this.cityList = [
				{
					label: this.createItem.ship.receiptPlaceName,
					value: this.createItem.ship.receiptPlace
				}
			]
		},
		fillPolPort(portCodes) {
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
					let {polPortCode, podPortCode, unloadingPortCode} = this.createItem.ship
					this.podPortList = initPortData.filter(item => item.portCode === podPortCode)
					this.podPortItem = this.podPortList.find(item => item.portCode === podPortCode)
					this.polPortList = initPortData.filter(item => item.portCode === polPortCode)
					this.polPortItem = this.polPortList.find(item => item.portCode === polPortCode)
					this.unloadingPortList = initPortData.filter(item => item.portCode === unloadingPortCode)
					this.unloadingPortItem = this.unloadingPortList.find(item => item.portCode === unloadingPortCode)
					this.countryName = this.polPortItem ? this.polPortItem.countryName : ''

					//porPortItem
					if(this.createItem.barge){
						this.porPortList = initPortData.filter(item => item.portCode === this.createItem.barge.porPortCode)
						this.porPortItem = this.porPortList.find(item => item.portCode === this.createItem.barge.porPortCode)
						console.log(this.porPortItem)
					}
				})
			}
		},

		// 港口下拉数据
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
		// 城市下拉数据
		citySelectQuery(queryString) {
			citySelectList({
				countryCode: '',
				cityCode: queryString || '',
				state: 'valid'
			}).then(res => {
				this.cityList = res.data.map(ele => {
					return Object.assign(ele, {
						label: this.$language === 'en' ? ele.ename : ele.cname,
						value: ele.cityCode
					})
				})
			})
		},
		// 装货地城市
		receiptPlaceVisibleChange(val) {
			if (val) this.citySelectQuery()
		},
		receiptPlaceFilterMehod(val) {
			this.citySelectQuery(val)
		},
		handleChangeReceiptPlace(val) {
			if (val) {
				let findItem = this.cityList.find(item => item.cityCode === val)
				this.createItem.ship.receiptPlace = findItem.cityCode
				this.createItem.ship.receiptPlaceName = findItem.cname
			} else {
				this.createItem.ship.receiptPlace = ''
				this.createItem.ship.receiptPlaceName = ''
			}
		},
		// 目的地
		podPortVisibleChange(val) {
			if (val) this.podPortSearch('', 'port_of_destination', this.state)
		},
		podPortFilterMehod(val) {
			this.podPortSearch(val, 'port_of_destination', this.state)
		},
		handleChangePodPortCode(val) {
			// 获取国家code
			let portItem = this.podPortList.find(item => item.portCode === val)
			this.podPortItem = portItem || {}
			let countryCode = portItem ? portItem.countryCode : ''
			// 海运出口的根据目的港自动匹配系统航线
			if (this.isExport) {
				this.$emit('getCountryCode', countryCode)
				this.initSystemLine(val)
			} else {
				if (val) {
					let param = {
						sysLineCode: this.createItem.ship.sysLineCode,
						polPortCode: this.createItem.ship.polPortCode,
						bkgAgentSupplierId: this.createItem.whAgentSupplierId
					}
					this.$emit('getWorkAssign', param, '目的地')
				}
			}
		},
		// 起运港
		polPortVisibleChange(val) {
			if (val) this.polPortSearch('', 'port_of_basic', this.state)
		},
		polPortFilterMehod(val) {
			this.polPortSearch(val, 'port_of_basic', this.state)
		},
		handleChangePolPortCode(val) {
			let portItem = this.polPortList.find(item => item.portCode === val)
			this.polPortItem = portItem || {}
			// 海运进口的国家，系统航线跟进起运港自动匹配
			if (this.isImport) {
				this.countryName = portItem ? portItem.countryName : ''
				this.initSystemLine(val)
			} else {
				if (val) {
					let param = {
						sysLineCode: this.createItem.ship.sysLineCode,
						polPortCode: this.createItem.ship.polPortCode,
						bkgAgentSupplierId: this.createItem.whAgentSupplierId
					}
					this.$emit('getWorkAssign', param, '起运港')
				}
			}
		},
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
		// 卸货港
		unloadingPortVisibleChange(val) {
			if (val) this.unloadPortSearch('', 'port_of_discharge', this.state)
		},
		unloadingPortFilterMehod(val) {
			this.unloadPortSearch(val, 'port_of_discharge', this.state)
		},
		handleChangeUnloadingPortCode(val) {
			let portItem = this.unloadingPortList.find(item => item.portCode === val)
			this.unloadingPortItem = portItem || {}
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
				this.unloadingPortList = result
			})
		},
		initSystemLine(val) {
			if (val) {
				portSystemLineInfo(val).then(res => {
					let systemLineList = res.data
					if (systemLineList.length) {
						let systemLine = systemLineList[0]
						this.createItem.ship.sysLineCode = systemLine.sysLineCode
						this.createItem.ship.sysLineName = systemLine.cname
						let param = {
							sysLineCode: this.createItem.ship.sysLineCode,
							polPortCode: this.createItem.ship.polPortCode,
							bkgAgentSupplierId: this.createItem.whAgentSupplierId
						}
						this.$emit('getWorkAssign', param, '系统航线')
					}
				})
			} else {
				this.createItem.ship.sysLineCode = ''
				this.createItem.ship.sysLineName = ''
			}
		}
	}
}
</script>

<style lang="scss">
.lclAudit-bookInfo-cont {
	display: table;
	width: 100%;
	margin: 0 auto;
	border-collapse: separate;
	border-spacing: 8px;
	.table-td {
		width: 33.33%;
		display: table-cell;
		border-radius: 2px;
		border: 1px solid #e9e9e9;
		vertical-align: top;
		.h1 {
			line-height: 24px;
			height: 24px;
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
			.include-barge {
				font-size: 12px;
				.el-checkbox__label {
					font-size: 12px;
					padding-left: 4px;
				}
			}
		}
		.flex-form-item {
			padding: 8px;
			.el-form-item {
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
			}
			&.label100 .el-form-item .el-form-item__label {
				width: 100px;
			}
			&.label90 .el-form-item .el-form-item__label {
				width: 90px;
			}
			&.label70 .el-form-item .el-form-item__label {
				width: 70px;
			}
			&.label125 .el-form-item .el-form-item__label {
				width: 125px;
			}
			&.label60 .el-form-item .el-form-item__label {
				width: 60px;
			}
			.el-form-item__content::before,
			.el-form-item__content::after,
			.el-form-item::before,
			.el-form-item::after {
				display: none;
			}
			.port-flex-form {
				display: flex;
				flex-wrap: nowrap;
				justify-content: space-between;
				align-items: center;
				.port-code {
					width: 32%;
					// margin-left: 5px;
					&:first-child {
						margin-left: 0;
					}
				}
			}
			.el-textarea__inner{
				line-height: 16px;
				padding: 1px 5px;
			}
		}
	}
}
</style>
