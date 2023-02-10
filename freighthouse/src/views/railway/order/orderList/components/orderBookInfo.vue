<template>
	<div class="">
		<div class="orderbook-info-table">
			<div class="table-td">
				<div class="cont" :class="this.isBkg ? 'op-cont' : this.isBd ? 'bd-cont' : ''">
					<div class="h1">
						<span class="label">车站信息</span>
					</div>
					<div class="flex-form-item">
						<el-form-item class="rail-port-wrap" required label="收货地" prop="rail.porPortCode" :show-message="false">
							<el-select size="mini" v-model="createItem.rail.porPortCode" filterable clearable :disabled="disabledState" style="width: 100%" placeholder="请输入" :filter-method="unloadPortFilterMehod">
								<el-option v-for="item in unloadPortList" :key="item.value" :label="item.ename" :value="item.value">
									{{ item.label }}
								</el-option>
							</el-select>
							<el-input :title="porPortCountry" class="rail-port-input" disabled size="mini" v-model="porPortCountry"></el-input>
						</el-form-item>
						<el-form-item class="rail-port-wrap" required label="起运站" prop="rail.polPortCode" :show-message="false">
							<el-select
								key="polPortCode"
								size="mini"
								v-model="createItem.rail.polPortCode"
								filterable
								clearable
								:disabled="disabledState"
								style="width: 100%"
								placeholder="请输入"
								:filter-method="polPortFilterMehod"
								@change="handleChangePolPortCode"
							>
								<el-option v-for="item in polPortList" :key="item.value" :label="item.ename" :value="item.value"> {{ item.label }}</el-option>
							</el-select>
							<el-input :title="polPortCountry" class="rail-port-input" disabled size="mini" v-model="polPortCountry"></el-input>
						</el-form-item>

						<el-form-item class="rail-port-wrap" required label="目的站" prop="rail.podPortCode" :show-message="false">
							<el-select size="mini" v-model="createItem.rail.podPortCode" filterable clearable :disabled="disabledState" style="width: 100%" placeholder="请输入" :filter-method="podPortFilterMehod" @change="handleChangePodPortCode">
								<el-option v-for="item in podPortList" :key="item.value" :label="item.ename" :value="item.value"> {{ item.label }}</el-option>
							</el-select>
							<el-input :title="podPortCountry" class="rail-port-input" disabled size="mini" v-model="podPortCountry"></el-input>
						</el-form-item>
						<el-form-item class="rail-port-wrap" required label="最终目的地" prop="rail.finalPodPortCode" :show-message="false">
							<el-select size="mini" v-model="createItem.rail.finalPodPortCode" filterable clearable :disabled="disabledState" style="width: 100%" placeholder="请输入" :filter-method="finalPodPortFilterMehod">
								<el-option v-for="item in finalPodPortList" :key="item.value" :label="item.ename" :value="item.value">{{ item.label }} </el-option>
							</el-select>
							<el-input :title="finnalPodPortCountry" class="rail-port-input" disabled size="mini" v-model="finnalPodPortCountry"></el-input>
						</el-form-item>

						<el-form-item required label="系统航线" prop="rail.sysLineCode" :show-message="false">
							<el-input clearable size="mini" placeholder="请输入" v-model="createItem.rail.sysLineName" disabled></el-input>
						</el-form-item>
						<el-form-item required label="国家" :show-message="false">
							<el-input type="text" clearable size="mini" placeholder="请输入" v-model="countryName" disabled></el-input>
						</el-form-item>
						<el-form-item
							prop="rail.outboundPortCode"
							:show-message="false"
							:required="['RAIL_DRIVING', 'RAIL_ARRIVAL'].includes(createItem.rail.bkgStatus) || !!createItem.rail.realArriveDate || !!createItem.rail.tdTime"
							v-if="isBkg || (isBd && ['pass', 'complete'].includes(orderStatus))"
							label="出境口岸"
						>
							<el-select :disabled="disabledState" v-model="createItem.rail.outboundPortCode" size="mini" clearable placeholder="请选择" style="width: 100%">
								<el-option v-for="(item, index) in dictMap.railOutboundPort" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item required label="托书附件" prop="rail.bookFileName" :show-message="false">
							<el-input size="mini" v-show="0" v-model="createItem.rail.bookFileName" clearable placeholder="请输入" disabled>
								<!-- 占位用来触发表单校验 -->
							</el-input>
							<upload-input class="rail-file-upload" v-model="createItem.rail.bookFileName" isAllowDel @downloadFile="handleDownload" @handleView="handleView" @uploadFile="handleAdd" :disabled="disabledState || isPricing" />
						</el-form-item>
					</div>
				</div>
			</div>
			<div class="table-td">
				<div class="cont" :class="this.isBkg ? 'op-cont' : this.isBd ? 'bd-cont' : ''">
					<div class="h1">
						<span class="label">货运信息</span>
					</div>
					<div class="flex-form-item">
						<el-form-item required label="贸易条款" prop="transport.tradeTermsCode" :show-message="false">
							<el-select v-model="createItem.transport.tradeTermsCode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="isPricing || disabledState">
								<el-option v-for="item in tradeTermsCodes" :label="item.label" :value="item.value" :key="item.value"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item required label="运输条款" prop="transport.transportTerm" :show-message="false">
							<el-select v-model="createItem.transport.transportTerm" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="isPricing || disabledState">
								<el-option v-for="(item, index) in dictMap.shipTerms" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item class="time-rail" required label="货好时间" prop="transport.cargoReadyTime" :show-message="false">
							<elDatePickerLimit
								size="mini"
								v-model="createItem.transport.cargoReadyTime"
								type="date"
								style="width: 100%"
								clearable
								placeholder="请选择"
								value-format="yyyy-MM-dd"
								:picker-options="pickerOptions"
								:disabled="isPricing || disabledState"
							/>
						</el-form-item>

						<el-form-item required label="报关方式" prop="transport.customsType" :show-message="false">
							<el-select v-model="createItem.transport.customsType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="isPricing || disabledState">
								<el-option v-for="(item, index) in dictMap.railCustomsType" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item
							:show-message="false"
							:required="createItem.rail.bkgStatus != 'INIT' || !!createItem.rail.realArriveDate || !!createItem.rail.tdTime"
							v-if="isBkg || (isBd && ['pass'].includes(orderStatus))"
							class="time-rail"
							label="截仓时间"
							prop="rail.inCutOffTime"
						>
							<elDatePickerLimit size="mini" v-model="createItem.rail.inCutOffTime" type="date" style="width: 100%" clearable :disabled="disabledState" placeholder="请选择" value-format="yyyy-MM-dd" :picker-options="pickerOptions" />
						</el-form-item>
						<el-form-item class="time-rail" required label="预计发车时间" prop="rail.etdTime" :show-message="false">
							<elDatePickerLimit
								size="mini"
								:field="'etdTime'"
								v-model="createItem.rail.etdTime"
								type="date"
								style="width: 100%"
								clearable
								:disabled="isPricing || disabledState || finIsCloseStatus"
								placeholder="请选择"
								value-format="yyyy-MM-dd"
								:picker-options="pickerOptions"
							/>
						</el-form-item>
						<el-form-item
							:show-message="false"
							:required="['RAIL_DRIVING', 'RAIL_ARRIVAL'].includes(createItem.rail.bkgStatus) || !!createItem.rail.realArriveDate"
							v-if="isBkg || (isBd && ['pass'].includes(orderStatus))"
							class="time-rail"
							label="实际发车时间"
							prop="rail.tdTime"
						>
							<elDatePickerLimit
								noCanFuture
								size="mini"
								v-model="createItem.rail.tdTime"
								type="date"
								style="width: 100%"
								clearable
								:disabled="disabledState || finIsCloseStatus"
								placeholder="请选择"
								value-format="yyyy-MM-dd"
								:picker-options="pickerOptions"
							/>
						</el-form-item>
						<el-form-item
							v-if="!['draft', 'refuse', 'submit'].includes(orderStatus)"
							class="time-rail"
							:required="['RAIL_DRIVING', 'RAIL_ARRIVAL'].includes(createItem.rail.bkgStatus) || !!createItem.rail.realArriveDate || !!createItem.rail.tdTime"
							label="预计到站日期"
							prop="rail.preArriveDate"
							:show-message="false"
						>
							<elDatePickerLimit size="mini" v-model="createItem.rail.preArriveDate" type="date" style="width: 100%" clearable :disabled="isPricing || disabledState" placeholder="请选择" value-format="yyyy-MM-dd" :picker-options="pickerOptions" />
						</el-form-item>
						<el-form-item
							v-if="!['draft', 'refuse', 'submit'].includes(orderStatus)"
							class="time-rail"
							:required="['RAIL_ARRIVAL'].includes(createItem.rail.bkgStatus) || !!createItem.rail.realArriveDate"
							label="实际到站日期"
							prop="rail.realArriveDate"
							:show-message="false"
						>
							<elDatePickerLimit
								noCanFuture
								size="mini"
								v-model="createItem.rail.realArriveDate"
								type="date"
								style="width: 100%"
								clearable
								:disabled="isPricing || disabledState"
								placeholder="请选择"
								value-format="yyyy-MM-dd"
								:picker-options="pickerOptions"
							/>
						</el-form-item>
						<el-form-item v-if="isShowRealDeliveryDate && !['draft', 'refuse', 'submit'].includes(orderStatus)" class="time-rail" label="实际派送日期" prop="rail.realDeliveryDate" :show-message="false">
							<elDatePickerLimit
								noCanFuture
								size="mini"
								v-model="createItem.rail.realDeliveryDate"
								type="date"
								style="width: 100%"
								clearable
								:disabled="isPricing || disabledState"
								placeholder="请选择"
								value-format="yyyy-MM-dd"
								:picker-options="pickerOptions"
							/>
						</el-form-item>
						<el-form-item
							:show-message="false"
							:required="['RAIL_DRIVING', 'RAIL_ARRIVAL'].includes(createItem.rail.bkgStatus) || !!createItem.rail.realArriveDate || !!createItem.rail.tdTime"
							v-if="isBkg || (isBd && ['pass'].includes(orderStatus))"
							label="班名/班次"
							prop="rail.vesselVoyage"
						>
							<el-input maxlength="64" clearable size="mini" placeholder="请输入" v-model="createItem.rail.vesselVoyage" :disabled="disabledState"></el-input>
						</el-form-item>

						<el-form-item :required="true" prop="rail.bkgAgentSupplierId" v-if="isSameUser || userEditRoles.includes('pricing') || userEditRoles.includes('bkg')" label="订舱代理" :show-message="false">
							<el-select
								:disabled="disabledState"
								size="mini"
								v-model="createItem.rail.bkgAgentSupplierId"
								filterable
								clearable
								remote
								style="width: 100%"
								placeholder="请输入"
								@change="selectBkgAgentSupplier"
								:remote-method="val => bkgAgentSupplierRemoteMethod(val, createItem.rail.bkgAgentSupplierName)"
								@focus="bkgAgentSupplierRemoteMethod('', createItem.rail.bkgAgentSupplierName)"
							>
								<el-option v-for="(item, index) in bkgAgentSupplierOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item v-if="isBkg || (isBd && ['pass'].includes(orderStatus))" class="time-rail" label="业务日期" prop="main.bizDate">
							<elDatePickerLimit size="mini" v-model="createItem.main.bizDate" type="date" style="width: 100%" clearable disabled placeholder="请选择" value-format="yyyy-MM-dd" :picker-options="pickerOptions" />
						</el-form-item>
						<el-form-item v-if="isSameUser || userEditRoles.includes('pricing') || userEditRoles.includes('bkg')" :required="true" label="是否外配" prop="rail.isExternal" :show-message="false">
							<el-select :disabled="disabledState" v-model="createItem.rail.isExternal" size="mini" clearable placeholder="请选择" style="width: 100%">
								<el-option v-for="(item, index) in dictMap.yesOrNoOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item :required="isBd" label="交货详细地点" prop="rail.deliveryPlace" :show-message="false" v-if="createItem.transport.tradeTermsCode && ['DDP', 'DDU'].includes(createItem.transport.tradeTermsCode.toUpperCase())">
							<el-input size="mini" placeholder="请输入" clearable v-model="createItem.rail.deliveryPlace" :disabled="disabledState"></el-input>
						</el-form-item>
						<el-form-item label="海关是否查验" prop="transport.isCustomsInspection" v-if="isBkg || (isBd && ['pass'].includes(orderStatus))">
							<el-radio-group v-model="createItem.transport.isCustomsInspection">
								<el-radio :label="item.value" :disabled="disabledState" v-for="(item, index) in yesOrNoOptions" :key="index">{{ item.label }}</el-radio>
							</el-radio-group>
						</el-form-item>
					</div>
				</div>
			</div>
			<div class="table-td">
				<div class="cont" :class="this.isBkg ? 'op-cont' : this.isBd ? 'bd-cont' : ''">
					<div class="h1">
						<span class="label">其它信息</span>
					</div>
					<div class="flex-form-item">
						<el-form-item label="提单类型" prop="rail.blType" :show-message="false" class="label70">
							<el-select v-model="createItem.rail.blType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="isPricing || disabledState">
								<el-option v-for="(item, index) in dictMap.blType.filter(item => item.value === 'hbl' || item.value === 'mbl')" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="出单方式" prop="rail.blMode" :show-message="false" class="label70">
							<el-select v-model="createItem.rail.blMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="isPricing || disabledState">
								<el-option v-for="(item, index) in blModes" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="付款方式" prop="payMode" :show-message="false" class="label70">
							<el-select v-model="createItem.rail.payMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="isPricing || disabledState">
								<el-option v-for="(item, index) in dictMap.payMode" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="委托备注" class="label70">
							<el-input
								@dblclick.native="showAuditDetail(createItem.main.intrustRemark)"
								:disabled="isBkg || isPricing || disabledState"
								type="textarea"
								clearable
								:rows="4"
								size="mini"
								placeholder="请输入"
								maxlength="512"
								show-word-limit
								v-model="createItem.main.intrustRemark"
							></el-input>
						</el-form-item>
						<!-- <el-form-item :required="true" label="订舱人" prop="bkgEmployeeId" :show-message="false" v-if="isPricing || noRoles" id="bkgEmployeeId">
							<el-select
								key="bkgEmployeeId"
								size="mini"
								v-model="createItem.bkgEmployeeId"
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
								<el-option v-for="item in bkgEmployeeList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item> -->
						<el-form-item v-if="isPricing || isBkg || (isBd && ['pass'].includes(orderStatus)) || noRoles" label="审单备注" class="label70">
							<el-input
								@dblclick.native="showAuditDetail(createItem.main.auditRemark)"
								:disabled="noRoles || isBkg || (isBd && ['pass'].includes(orderStatus)) || (isPricing && ['pass', 'complete', 'refuse'].includes(orderStatus))"
								class="loadingBdRemark"
								type="textarea"
								clearable
								:rows="4"
								size="mini"
								placeholder="请输入"
								maxlength="512"
								show-word-limit
								v-model="createItem.main.auditRemark"
							></el-input>
						</el-form-item>
						<el-form-item v-if="isBkg || (isBd && ['pass'].includes(orderStatus))" label="订舱备注" class="label70">
							<el-input
								@dblclick.native="showAuditDetail(createItem.rail.bkgRemark)"
								:disabled="disabledState"
								class="loadingBdRemark"
								type="textarea"
								clearable
								:rows="4"
								size="mini"
								placeholder="请输入"
								maxlength="512"
								show-word-limit
								v-model="createItem.rail.bkgRemark"
							></el-input>
						</el-form-item>
						<el-form-item label="备注" class="label70" v-if="$route.query.source !== 'jointList'">
							<el-input
								@dblclick.native="showAuditDetail(createItem.main.bdRemark)"
								class="loadingBdRemark"
								type="textarea"
								clearable
								rows="4"
								size="mini"
								placeholder="请输入"
								maxlength="512"
								show-word-limit
								v-model="createItem.main.bdRemark"
								@blur="handleSaveRemark"
								:disabled="!bdRemarkState"
							></el-input>
						</el-form-item>
					</div>
				</div>
			</div>
		</div>
		<div v-if="auditVisible">
			<AuditRemark :auditRemark="remarkContent" @close="auditClose" />
		</div>
		<div v-if="uploadPopShow">
			<FileUpload @close="uploadPopClose" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { railportSystemLineInfo, baseDeptParticipants, railDeptCode } from '@/api/base'
import UploadInput from '@/components/Base/upload/upload-input.vue'
import FileUpload from './fileUpload'
import AuditRemark from '@/views/order/order/orderList/components/auditRemark'
export default {
	data() {
		return {
			remarkContent: '',
			isShowRealDeliveryDate: false,
			auditVisible: false,
			bkgEmployeeList: [],
			blModes: [
				{ label: '正本', value: 'original', en: 'original' },
				{ label: '电放', value: 'telex_release', en: 'telex_release' }
			],
			uploadPopShow: false,
			finalPodPortList: [],
			fileName: '',
			bookFileNo: '',
			bkgAgentSupplierOptions: [], // 订舱代理下拉
			fileList: [],
			podPortList: [],
			unloadPortList: [],
			polPortList: [],
			state: 'valid',
			sysLineName: '',
			pickerOptions: {
				disabledDate(date) {
					//disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
					// return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
				}
			},
			tradeTermsCode: ['DDP', 'DDU'],
			countryName: '',
			yesOrNoOptions: [
				{ label: '是', value: 'Y' },
				{ label: '否', value: 'N' }
			]
		}
	},
	props: {
		isSameUser: {
			type: Boolean,
			default: false
		},
		createItem: {
			type: Object,
			default: () => ({})
		},

		fillPolData: {
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
		sysLineCname: {
			type: String,
			default: ''
		}
	},
	created() {
		this.fillPolPort(this.fillPortCodes)
		this.fillBkg()
	},
	mounted() {
		console.log('🚀 this.createItem', this.createItem)
		if (this.createItem.rail.bkgAgentSupplierId) {
			this.bkgAgentSupplierOptions = [
				{
					value: this.createItem.rail.bkgAgentSupplierId,
					label: this.createItem.rail.bkgAgentSupplierName
				}
			]
		}
	},

	computed: {
		...mapState('railway', ['ordDetRole', 'userEditRoles']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			roles: state => state.user.roles,
			userInfo: state => state.user.userInfo,
			userId: state => state.user.userId,
			orderInfoDataObj: state => state.railway.orderInfoDataObj
		}),
		finIsCloseStatus() {
			// 放开已关账、已完成的限制
      // return this.orderInfoDataObj.main.finCloseStatus === 'yes'
			return false
		},
		noRoles() {
			return !this.ordDetRole
		},
		porPortCountry() {
			let item = this.unloadPortList.find(item => item.value === this.createItem.rail.porPortCode)
			return item ? item.countryEname : ''
		},
		polPortCountry() {
			let item = this.polPortList.find(item => item.value === this.createItem.rail.polPortCode)
			return item ? item.countryEname : ''
		},
		podPortCountry() {
			let item = this.podPortList.find(item => item.value === this.createItem.rail.podPortCode)
			return item ? item.countryEname : ''
		},
		finnalPodPortCountry() {
			let item = this.finalPodPortList.find(item => item.value === this.createItem.rail.finalPodPortCode)
			return item ? item.countryEname : ''
		},
		tradeTermsCodes() {
			return this.dictMap.tradeTermsCode.map(item => {
				if (item.value === 'ddp') {
					item.label = 'DAP'
				}
				return item
			})
		},
		bdRemarkState() {
			if (['draft', 'refuse', 'pass', 'complete'].includes(this.orderStatus)) {
				return true
			}
			return false
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isBd() {
			return this.ordDetRole === 'bd'
		},
		isPricing() {
			return this.ordDetRole === 'pricing'
		},
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		disabledState() {
			if (!this.ordDetRole) {
				return true
			} //  || this.isEpricing || this.isEcs  0402
			if (this.isOp || this.isEpricing || this.isEcs) {
				return true
			}
			// bd角色，除了草稿和拒绝状态的都置灰，只读
			if (this.isBd && !['draft', 'refuse'].includes(this.orderStatus)) {
				return true
			}
			// bkg角色，除了审核通过的都置灰
			if (this.isBkg && !['pass'].includes(this.orderStatus)) {
				return true
			}
			// 商务角色，审核通过的都置灰
			if (this.isPricing && ['pass', 'complete', 'refuse'].includes(this.orderStatus)) {
				return true
			}

			return false
		}
	},
	watch: {
		fillPortCodes: {
			handler(newVal) {
				this.fillPolPort(newVal)
			},
			deep: true
		},
		sysLineCname: {
			handler(newVal) {
				this.sysLineName = newVal
			},
			deep: true
		},
		'createItem.serviceList': {
			handler(newVal, oldVal) {
				console.log(newVal)
				if (newVal.includes('pod_fcl_delivery') || newVal.includes('pod_ltl_delivery')) {
					this.isShowRealDeliveryDate = true
				} else {
					this.createItem.rail.realDeliveryDate = ''
					this.isShowRealDeliveryDate = false
				}
			},
			immediate: true
		}
	},
	components: { UploadInput, FileUpload, AuditRemark },
	methods: {
		showAuditDetail(val) {
			this.remarkContent = val
			this.auditVisible = true
		},
		auditClose() {
			this.auditVisible = false
		},
		selectBkgAgentSupplier(val) {
			// 反选订舱代理name
			if (!val) {
				this.createItem.rail.bkgAgentSupplierName = ''
			} else {
				this.createItem.rail.bkgAgentSupplierName = this.bkgAgentSupplierOptions.find(e => val == e.value).label
			}
		},

		fillBkg() {
			this.bkgEmployeeList = this.createItem.workAssign
				.filter(item => item.jobCode === 'bkg')
				.map(item => {
					return {
						label: item.employeeName,
						value: item.employeeId === 0 ? '' : item.employeeId
					}
				})
		},
		// 订舱人
		bkgEmployeeRemoteMethod(val) {
			val !== undefined && this.bkgEmployeeSearch(val)
		},
		bkgEmployeeVisibleChange(val) {
			if (val) {
				this.bkgEmployeeSearch('')
			}
		},
		handleChangeBkgEmployee(val) {
			let findItem = this.bkgEmployeeList.find(item => item.value === val)
			this.createItem.bkgEmployeeId = val
			this.createItem.bkgEmployeeName = findItem ? findItem.label : ''
		},
		// 获取订舱人下拉
		bkgEmployeeSearch(val, key) {
			railDeptCode().then(res => {
				let data = {
					name: val ? val.replace(/^\s+|\s+$/g, '') : '',
					deptCode: res.data,
					roleCode: 'bkg',
					isOnlyDeptCode: true
				}

				baseDeptParticipants(data).then(res => {
					let saveList = [{ label: this.createItem.bkgEmployeeName, value: this.createItem.bkgEmployeeId }].filter(ele => ele.value)
					let resList = res.data.map(item => {
						return Object.assign(item, {
							label: this.$language == 'en' ? item.ename : item.cname,
							value: item.employeeId
						})
					})
					let filterArr = resList.filter(ele => !saveList.find(o => o.value === ele.employeeId))
					this.bkgEmployeeList = [...saveList, ...filterArr]
				})
			})
		},
		handleImport() {
			if (!this.fileList.length) {
				return this.$message({
					type: 'error',
					message: '请选择文件',
					duration: 1000
				})
			}
			// 根据后台需求数据格式
			let params = {
				data: {
					orderNo: this.$route.query.orderNo
				},
				fileName: this.fileList
			}
			this.$store
				.dispatch('railway/soUpload', {
					uri: '/order/rail/order/booking/upload',
					params: params
				})
				.then(res => {
					this.fileList = []
					if (res === 'error') return
					this.$message({ type: 'success', message: '上传成功' })
				})
		},
		handleDelete(e) {
			console.log('🚀 ~ e', e)
		},
		handleDownload(e) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: this.createItem.rail.bookFileNo
					}
				})
				.then(res => {
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = this.createItem.rail.bookFileName
					link.click()
				})
		},
		handleView() {
			this.$store.dispatch('order/previewFile', {
				fileNo: this.createItem.rail.bookFileNo,
				fileName: this.createItem.rail.bookFileName
			})
		},
		handleAdd() {
			// 上传
			this.uploadPopShow = true
		},
		handleRemove() {
			// 删除文件
			// fileDelete({
			//   orderNo: this.$route.query.orderNo,
			//   jointNo: this.$route.query.jointNo,
			//   fileNo: this.cargoClaim.poFileNo
			// }).then(() => {
			//   this.cargoClaim.poFileName = ''
			//   this.cargoClaim.poFileNo = ''
			// })
		},
		// 上传弹窗关闭回调
		uploadPopClose(action) {
			this.uploadPopShow = false
			if (action === 'Confirm') {
				this.$emit('getInfo')
			}
		},
		// handleRemove(file, fileList) {
		//   this.fileName = ''
		// },

		handleExceed(files, fileList) {
			this.$message.warning(`当前限制选择 1 个文件，共选择了 ${fileList.length} 个文件`)
		},
		handleChangeFile(file, fileList) {
			console.log('🚀 ~ file', file)
			console.log('🚀 ~ fileList', fileList)
			this.fileName = file.name
			this.fileList = fileList
		},
		handlePreview(e) {
			console.log('🚀 ~ e', e)
		},

		// 获取订舱代理
		getSupplierList(queryString, name) {
			let queryValue = ''
			if (name && !queryString) {
				// 有选中值&&搜索条件不是空
				queryValue = name
			} else {
				queryValue = queryString
			}
			this.$store
				.dispatch('dict/queryBkgAgentSupplierListRail', {
					category: 'category',
					value: 'bkg_carrier,bkg_agent',
					queryString: queryValue,
					categoryType: 'in'
				})
				.then(data => {
					if (data.list && data.list.length) {
						this.bkgAgentSupplierOptions = data.list.map(ele => {
							return Object.assign(ele, {
								label: this.$language == 'en' ? ele.ename : ele.name,
								value: ele.supplierId ? Number(ele.supplierId) : ''
							})
						})
					} else {
						this.bkgAgentSupplierOptions = []
					}
				})
		},

		bkgAgentSupplierRemoteMethod(queryString, name) {
			this.getSupplierList(queryString, name)
		},

		//保存编辑备注
		handleSaveRemark() {
			this.$emit('saveRemark')
		},

		fillPolPort(portCodes) {
			// 港口数据反显
			if (portCodes) {
				this.$store.dispatch('dict/baseRailPortListByCodes', { portCodes }).then(data => {
					let initPortData = []
					//初始化下拉框数据
					let results = new Map()
					initPortData = data
					data.map(item => {
						let obj = {}
						obj.label = item.label
						results.set(item.value, obj)
					})
					this.podPortList = JSON.parse(JSON.stringify(initPortData))
					this.unloadPortList = JSON.parse(JSON.stringify(initPortData))
					this.polPortList = JSON.parse(JSON.stringify(initPortData))
					this.finalPodPortList = JSON.parse(JSON.stringify(initPortData))
					let portItem = this.podPortList.find(item => item.portCode === this.createItem.rail.podPortCode)
					portItem && (this.countryName = portItem.countryCname)
				})
			} else {
				this.$store.dispatch('dict/baseRailPortListByCodes', {}).then(data => {
					//初始化下拉框数据
					this.podPortList = JSON.parse(JSON.stringify(data))
					this.unloadPortList = JSON.parse(JSON.stringify(data))
					this.polPortList = JSON.parse(JSON.stringify(data))
					this.finalPodPortList = JSON.parse(JSON.stringify(data))
				})
			}
		},

		// 起运站
		polPortFilterMehod(val) {
			this.$store.dispatch('dict/baseRailPortList', { portName: val }).then(data => {
				this.polPortList = data
			})
		},
		// 收货地
		unloadPortFilterMehod(val) {
			this.$store.dispatch('dict/baseRailPortList', { portName: val }).then(data => {
				this.unloadPortList = data
			})
		},
		// 目的地
		podPortFilterMehod(val) {
			this.$store.dispatch('dict/baseRailPortList', { portName: val }).then(data => {
				this.podPortList = data
			})
		},
		// 最终目的地
		finalPodPortFilterMehod(val) {
			this.$store.dispatch('dict/baseRailPortList', { portName: val }).then(data => {
				this.finalPodPortList = data
			})
		},
		handleChangePolPortCode(val) {
			// 变更商务岗位分配信息
			val && this.$emit('updatePricing')
		},

		handleChangePodPortCode(val) {
			if (val) {
				// 获取国家code
				let portItem = this.podPortList.find(item => item.portCode === val)
				console.log('🚀 ~ portItem', portItem)
				this.countryName = portItem.countryCname
				let countryCode = portItem ? portItem.countryCode : ''
				this.$emit('getCountryCode', countryCode)

				// 根据目的港自动匹配系统航线
				this.createItem.rail.sysLineCode = portItem.sysLineCode
				this.createItem.rail.sysLineName = portItem.sysLineName
			} else {
				this.countryName = ''
				this.createItem.rail.sysLineName = ''
				this.createItem.rail.sysLineCode = ''
			}
		}
	}
}
</script>

<style lang="scss">
.rail-port-wrap {
	.el-form-item__content {
		display: flex;
		.rail-port-input {
			margin-left: 4px;
		}
	}
}
.rail-file-upload .file-name {
	font-size: 12px !important;
}
.time-rail {
	.el-input__prefix {
		left: 0 !important;
	}
}

.port-tooltip {
	p {
		margin-top: 2px;
	}
}
.orderbook-info-table {
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
				.el-radio__label {
          font-size: 12px;
          padding-left: 5px;
        }
			}
			.label70 {
				.el-form-item__label {
					width: 70px !important;
				}
			}
			.el-form-item__content::before,
			.el-form-item__content::after,
			.el-form-item::before,
			.el-form-item::after {
				display: none;
			}
		}
	}
}
</style>
