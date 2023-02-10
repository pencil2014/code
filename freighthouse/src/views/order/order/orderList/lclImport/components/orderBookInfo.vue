<template>
	<div class="">
		<div class="lclImport-orderbook-info-table">
			<div class="table-td">
				<div class="cont">
					<div class="h1">
						<span class="label">港口信息</span>
						<div class="include-barge">
              <el-checkbox size="mini" v-model="includeFeederState" true-label="y" false-label="n" :disabled="disabledState" @change="handleChangeIncludeFeeder">包含驳船</el-checkbox>
            </div>
					</div>
					<div class="pd8 flex-form-item label90">
						<el-form-item :required="true" label="驳船收货地" prop="barge.porPortCode" :show-message="false" v-if="isIncludeFeeder">
              <div class="port-flex-form">
                <div class="port-code">
                  <el-select
                    key="porPortCode"
                    size="mini"
                    v-model="createItem.barge.porPortCode"
                    filterable
                    clearable
                    :disabled="disabledState"
                    style="width: 100%"
                    placeholder="请输入"
                    :filter-method="porPortFilterMehod"
                    @change="handleChangePorPortCode"
                  >
                    <el-option v-for="item in porPortList" :key="item.value" :label="item.value" :value="item.value">
                      <span>{{ item.label }}</span>
                    </el-option>
                  </el-select>
                </div>
                <PortPopover :portItem="porPortItem" />
              </div>
            </el-form-item>
						<el-form-item label="装货地">
							<el-select
								size="mini"
								v-model="createItem.ship.receiptPlace"
								filterable
								remote
								clearable
								:disabled="isView"
								style="width: 100%"
								placeholder="请输入"
								:remote-method="receiptPlaceFilterMehod"
								@visible-change="receiptPlaceVisibleChange"
								@change="handleChangeReceiptPlace"
							>
								<el-option v-for="item in cityList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item :required="true" label="起运港" prop="ship.polPortCode" :show-message="false">
							<div class="port-flex-form">
								<div class="port-code">
									<el-select
										key="polPortCode"
										size="mini"
										v-model="createItem.ship.polPortCode"
										filterable
										clearable
										:disabled="isView"
										style="width: 100%"
										placeholder="请输入"
										:filter-method="polPortFilterMehod"
										@visible-change="polPortVisibleChange"
										@change="handleChangePolPortCode"
									>
										<el-option v-for="item in polPortList" :key="item.value" :label="item.value" :value="item.value">
											<span>{{ item.label }}</span>
										</el-option>
									</el-select>
								</div>
								<PortPopover :portItem="polPortItem" />
							</div>
						</el-form-item>
						<el-form-item label="卸货港" prop="ship.unloadingPortCode" :show-message="false">
							<div class="port-flex-form">
                <div class="port-code">
                  <el-select
                    size="mini"
                    v-model="createItem.ship.unloadingPortCode"
                    filterable
                    clearable
                    :disabled="isView"
                    style="width: 100%"
                    placeholder="请输入"
                    :filter-method="unloadPortFilterMehod"
                    @visible-change="unloadPortVisibleChange"
                    @change="handleChangeUnloadPortCode"
                  >
                    <el-option v-for="item in unloadPortList" :key="item.value" :label="item.value" :value="item.value">
                      <span>{{ item.label }}</span>
                    </el-option>
                  </el-select>
                </div>
								<PortPopover :portItem="unloadPortItem" />
							</div>
						</el-form-item>
						<el-form-item :required="true" label="目的地" prop="ship.podPortCode" :show-message="false">
              <div class="port-flex-form">
                <div class="port-code">
                  <el-select
                    size="mini"
                    v-model="createItem.ship.podPortCode"
                    filterable
                    clearable
                    :disabled="isView"
                    style="width: 100%"
                    placeholder="请输入"
                    :filter-method="podPortFilterMehod"
                    @visible-change="podPortVisibleChange"
                    @change="handleChangePodPortCode"
                  >
                    <el-option v-for="item in podPortList" :key="item.value" :label="item.value" :value="item.value">
                      <span>{{ item.label }}</span>
                    </el-option>
                  </el-select>
                </div>
                <PortPopover :portItem="podPortItem" />
              </div>
            </el-form-item>
						<el-form-item label="驳船中转方式" prop="barge.transitWay" :show-message="false" v-if="isIncludeFeeder">
              <el-select v-model="createItem.barge.transitWay" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
                <el-option v-for="item in dictMap.transferMode" :label="item.label" :value="item.value" :key="item.value"></el-option>
              </el-select>
            </el-form-item>
						<el-form-item :required="contractRequired" label="合约号" prop="ship.contractNo" :show-message="false" v-if="contractShow">
							<el-input clearable size="mini" placeholder="请输入" v-model="createItem.ship.contractNo" :disabled="disabledState" @blur="handleClearEmptyString('contractNo', $event)" maxlength="128"></el-input>
						</el-form-item>
						<el-form-item :required="true" label="系统航线" prop="ship.sysLineCode" :show-message="false">
							<el-input clearable size="mini" placeholder="请输入" v-model="sysLineName" disabled></el-input>
						</el-form-item>

						<el-form-item label="国家" :show-message="false">
							<el-input type="text" clearable size="mini" placeholder="请输入" v-model="countryName" disabled></el-input>
						</el-form-item>
					</div>
				</div>
			</div>
			<div class="table-td">
				<div class="cont">
					<div class="h1">
						<span class="label">船东信息</span>
					</div>
					<div class="pd8 flex-form-item">
						<el-form-item label="驳船船名" prop="barge.vessel" :show-message="false" v-if="isOpView && isIncludeFeeder">
              <el-autocomplete
                style="width: 100%"
                size="mini"
                clearable
                v-model="createItem.barge.vessel"
                :disabled="disabledState && isView && !(isCscEdit && $route.query.source === 'orderList')"
                :fetch-suggestions="(queryString, cb) => querySearchVessel(queryString, cb)"
                placeholder="请输入"
                :maxlength="128"
              ></el-autocomplete>
            </el-form-item>
            <el-form-item label="驳船船次" prop="barge.voyage" :show-message="false" v-if="isOpView && isIncludeFeeder">
              <el-autocomplete
                style="width: 100%"
                size="mini"
                clearable
                v-model="createItem.barge.voyage"
                :disabled="disabledState && isView && !(isCscEdit && $route.query.source === 'orderList')"
                :fetch-suggestions="(queryString, cb) => querySearchVoyage(queryString, cb, createItem.barge.vessel)"
                placeholder="请输入"
                :maxlength="128"
              ></el-autocomplete>
            </el-form-item>
						<el-form-item class="timeSpecial" label="驳船截关时间" prop="barge.cyCutOff" :show-message="false" v-if="isIncludeFeeder">
              <elDatePickerLimit size="mini" :field="'bargeCyCutOff'" v-model="createItem.barge.cyCutOff" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd"  :disabled="disabledState && isView" />
            </el-form-item>
						<el-form-item class="timeSpecial" :required="false" label="驳船预计开船时间" prop="barge.etdTime" :show-message="false" v-if="isIncludeFeeder">
                <elDatePickerLimit
                  :field="'bargeEtdTime'"
                  size="mini"
                  v-model="createItem.barge.etdTime"
                  type="date"
                  style="width: 100%"
                  clearable
                  placeholder="请选择"
                  value-format="yyyy-MM-dd"
                  :disabled="(!isDocEdit && disabledState && isView && !lineCsJointIsEdit) || (includeFeederState==='y' && finIsCloseStatus)"
                />
              </el-form-item>
							<el-form-item class="timeSpecial" label="驳船实际开船时间" prop="barge.tdTime" :show-message="false" v-if="(isOp || isDoc || isCsc) && isIncludeFeeder">
                <elDatePickerLimit noCanFuture :field="'bargeTdTime'" size="mini" v-model="createItem.barge.tdTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="(!isDocEdit && disabledState && isView && !lineCsJointIsEdit && !isCscEdit) || (includeFeederState==='y' && finIsCloseStatus)" />
              </el-form-item>
						<el-form-item label="预计截仓时间" prop="etWhCyCutOff">
							<elDatePickerLimit size="mini" v-model="createItem.etWhCyCutOff" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd"  :disabled="disabledState" />
						</el-form-item>
						<!-- <el-form-item :required="lclSelfRequired && isBd" label="实际截仓时间" prop="whCyCutOff" :show-message="false" v-if="lclSelfRequired">
							<elDatePickerLimit size="mini" v-model="createItem.whCyCutOff" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :picker-options="pickerOptions" :disabled="disabledState" />
						</el-form-item> -->
						<div class="vessel-voyage-item">
              <div class="flex1">
								<el-form-item label="大船船名" prop="ship.vessel" :show-message="false" v-if="isOpView">
									<vessel-select
										v-model="createItem.ship.vessel"
										:orderNo="$route.query.orderNo"
										:disabledState="isView && !isOpDocEdit"
										:shipCarrierCode="createItem.ship.shipCarrierCode"
										:polPortCode="createItem.ship.polPortCode"
										:podPortCode="createItem.ship.podPortCode"
										:copyBtnHide="true"
									/>
								</el-form-item>
								<el-form-item label="大船航次" prop="ship.voyage" :show-message="false" v-if="isOpView">
									<voyage-select
										v-model="createItem.ship.voyage"
										:disabledState="isView && !isOpDocEdit"
										:orderNo="$route.query.orderNo"
										:vessel="createItem.ship.vessel"
										:shipCarrierCode="createItem.ship.shipCarrierCode"
										:polPortCode="createItem.ship.polPortCode"
										:podPortCode="createItem.ship.podPortCode"
										:copyBtnHide="true"
									/>
								</el-form-item>
              </div>
							<el-button type="default" class="btn-copy" size="mini" @click="handleCopyVessel(createItem.ship.vessel, createItem.ship.voyage, $event)" v-if="createItem.ship.vessel || createItem.ship.voyage">复制</el-button>
						</div>
						<el-form-item :required="createItem.serviceType === 'st11' && whBookStatus === 'booked'" label="大船预计开船时间" prop="ship.etdTime" :show-message="false">
							<elDatePickerLimit :field="'etdTime'" size="mini" v-model="createItem.ship.etdTime" type="date" style="width: 100%" clearable :disabled="isView && !isOpDocEdit" placeholder="请选择" value-format="yyyy-MM-dd" :picker-options="pickerOptions" />
						</el-form-item>
						<el-form-item label="大船实际开船时间" prop="ship.tdTime" :show-message="false">
							<elDatePickerLimit noCanFuture :field="'tdTime'" size="mini" v-model="createItem.ship.tdTime" type="date" style="width: 100%" clearable :disabled="isView && !isOpDocEdit" placeholder="请选择" value-format="yyyy-MM-dd" :picker-options="pickerOptions" />
						</el-form-item>
						<!-- <el-form-item :required="lclSelfRequired" label="截仓时间" prop="whCyCutOff" :show-message="false" v-if="lclSelfRequired">
              <elDatePickerLimit size="mini" v-model="createItem.whCyCutOff" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :picker-options="pickerOptions" :disabled="disabledState" />
            </el-form-item> -->
						<el-form-item class="timeSpecial" label="截放行时间" prop="ship.cvCutOff" :show-message="false" v-if="isOpView">
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
								:picker-options="pickerOptions"
								:disabled="isView && !isOpDocEdit"
							/>
							<!-- <elDatePickerLimit size="mini" v-model="createItem.ship.cvCutOff" type="date" style="width: 100%" clearable :disabled="isView && !isOpDocEdit" placeholder="请选择" value-format="yyyy-MM-dd" :picker-options="pickerOptions" /> -->
						</el-form-item>
						<el-form-item v-if="isOpView" :required="createItem.serviceType === 'st11' && whBookStatus === 'booked'" label="预计到港时间" prop="ship.etaTime" :show-message="false">
							<elDatePickerLimit size="mini" :field="'etaTime'" v-model="createItem.ship.etaTime" type="date" style="width: 100%" clearable :disabled="(isView && !isDocEdit) || finIsCloseStatus" placeholder="请选择" value-format="yyyy-MM-dd" :picker-options="pickerOptions" />
						</el-form-item>
						<el-form-item v-if="isOpView" label="实际到港时间" prop="ship.taTime">
							<elDatePickerLimit noCanFuture :field="'taTime'" size="mini" v-model="createItem.ship.taTime" type="date" style="width: 100%" clearable :disabled="(isView && !isDocEdit) || finIsCloseStatus" placeholder="请选择" value-format="yyyy-MM-dd" :picker-options="pickerOptions" />
						</el-form-item>
						<!-- <el-form-item class="timeSpecial" label="截放行时间" prop="ship.cvCutOff" :show-message="false" v-if="isOp">
							<elDatePickerLimit
								size="mini"
								v-model="createItem.ship.cvCutOff"
								type="datetime"
								style="width: 100%"
								clearable
								:popper-class="'hideMinute'"
								placeholder="请选择"
								format="yyyy-MM-dd HH"
								value-format="yyyy-MM-dd HH"
								:picker-options="pickerOptions"
								:disabled="disabledState && !isEdit"
							/>
						</el-form-item> -->
						<el-form-item class="timeSpecial" label="截报关时间" prop="ship.ccCutOff" :show-message="false" v-if="isOpView">
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
								:picker-options="pickerOptions"
								:disabled="disabledState && !isEdit"
							/>
						</el-form-item>
						<!-- <el-form-item :required="lclSelfRequired && isBd" label="入舱单号" prop="whPoNo" :show-message="false" v-if="lclSelfRequired">
							<el-input clearable size="mini" placeholder="请输入" v-model="createItem.whPoNo" :disabled="disabledState"></el-input>
						</el-form-item> -->
						<el-form-item label="订舱代理" prop="whAgentSupplierName" :show-message="false" v-if="showBkgAgentSupplier && createItem.serviceType === 'st11'">
							<el-input clearable size="mini" placeholder="请输入" v-model="whAgentSupplierName" disabled></el-input>
						</el-form-item>
						<el-form-item label="委托备注" prop="intrustRemark" :show-message="false">
							<el-input @dblclick.native="showRemarkDetail(createItem.intrustRemark)" type="textarea" rows="4" size="mini" maxlength="512" show-word-limit placeholder="请输入" v-model="createItem.intrustRemark" :disabled="disabledState"> </el-input>
						</el-form-item>
					</div>
				</div>
			</div>
			<div class="table-td">
				<div class="cont">
					<div class="h1">
						<span class="label">货运信息</span>
					</div>
					<div class="pd8 flex-form-item label125">
						<el-form-item :required="true" label="贸易条款" prop="transport.tradeTermsCode" :show-message="false">
							<el-select v-model="createItem.transport.tradeTermsCode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
								<el-option v-for="item in dictMap.tradeTermsCode" :label="item.label" :value="item.value" :key="item.value"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item :required="true" label="运输条款" prop="transport.transportTerm" :show-message="false">
							<el-select v-model="createItem.transport.transportTerm" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
								<el-option v-for="(item, index) in dictMap.shipTerms" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item :required="true" label="出单方式" prop="ship.blMode" :show-message="false">
							<el-select v-model="createItem.ship.blMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="isView">
								<el-option v-for="(item, index) in dictMap.blMode" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item :required="exportRequired" v-if="createItem.serviceType === 'st11'" label="发货人是否有出口权" prop="transport.isExportRight" :show-message="false">
							<el-select v-model="createItem.transport.isExportRight" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="isView && !opEditIsBreak">
								<el-option v-for="(item, index) in dictMap.yesOrNoOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item :required="importRequired" label="收货人是否有进口权" prop="transport.isImportRight" :show-message="false">
							<el-select v-model="createItem.transport.isImportRight" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="isView && !opEditIsBreak">
								<el-option v-for="(item, index) in dictMap.yesOrNoOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item :required="takeRequired" v-if="createItem.serviceType === 'st11'" label="提货人" :show-message="false" prop="transport.takeContactName">
							<el-input clearable size="mini" placeholder="请输入" v-model="createItem.transport.takeContactName" :disabled="isView && !opEditIsBreak" maxlength="512" @blur="handleClearEmptyString('takeContactName', $event)"> </el-input>
						</el-form-item>
						<el-form-item :required="takeRequired" v-if="createItem.serviceType === 'st11'" label="提货人联系方式" :show-message="false" prop="transport.takeContactPhone">
							<el-input clearable size="mini" placeholder="请输入" v-model="createItem.transport.takeContactPhone" :disabled="isView && !opEditIsBreak" maxlength="512" @blur="handleClearEmptyString('takeContactPhone', $event)"> </el-input>
						</el-form-item>
						<el-form-item :required="takeRequired" v-if="createItem.serviceType === 'st11'" label="提货地址" :show-message="false" prop="transport.takeAddress">
							<el-input clearable size="mini" placeholder="请输入" v-model="createItem.transport.takeAddress" :disabled="isView && !opEditIsBreak" maxlength="512" @blur="handleClearEmptyString('takeAddress', $event)"> </el-input>
						</el-form-item>
						<el-form-item label="海关是否查验" prop="transport.isCustomsInspection" v-if="isOpView">
              <el-radio-group v-model="createItem.transport.isCustomsInspection">
                <el-radio :label="item.value" :disabled="disabledState && isView" v-for="(item, index) in yesOrNoOptions" :key="index">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
						<el-form-item v-if="isOpView" class="bizDate" label="业务日期" prop="bizDate" :show-message="false">
							<elDatePickerLimit size="mini" :style="{ width: showChangeBizDate ? 'calc(100% - 47px)' : '100%',marginRight:showChangeBizDate ? '5px':'0' }" v-model="createItem.bizDate" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="true" />
							<el-button v-if="showChangeBizDate" @click="handleChangeBizDate" size="mini">修改</el-button>
						</el-form-item>
						<el-form-item v-if="isOpView && createItem.serviceType === 'st11'" label="分单数" prop="transport.splitNum" :show-message="false">
							<el-input @blur="validateSplitNum('splitNum', createItem.transport)" clearable size="mini" placeholder="请输入" v-model.number="createItem.transport.splitNum" :disabled="isView"></el-input>
						</el-form-item>
						<el-form-item :required="true" label="总件数" prop="quantity" :show-message="false">
							<el-input @blur="validateQuantity('quantity', createItem)" clearable size="mini" placeholder="请输入" v-model="createItem.quantity" :disabled="disabledState"></el-input>
						</el-form-item>
						<el-form-item :required="true" label="总毛重" prop="weight" :show-message="false">
							<el-input @blur="validateVolumeWeight('weight', createItem)" size="mini" v-model="createItem.weight" clearable placeholder="请输入" :disabled="disabledState">
								<template slot="append">KGS</template>
							</el-input>
						</el-form-item>
						<el-form-item :required="true" label="总体积" prop="volume" :show-message="false">
							<el-input @blur="validateVolumeWeight('volume', createItem)" size="mini" v-model="createItem.volume" clearable placeholder="请输入" :disabled="disabledState">
								<template slot="append">CBM</template>
							</el-input>
						</el-form-item>
						<!-- <el-form-item label="委托备注" prop="intrustRemark" v-if="lclSelfRequired">
							<el-input type="textarea" rows="4" clearable size="mini" placeholder="请输入" v-model="createItem.intrustRemark" :disabled="disabledState" maxlength="512" show-word-limit> </el-input>
						</el-form-item> -->
						<el-form-item label="备注" prop="bdRemark" :show-message="false" v-if="$route.query.source !== 'jointList'">
              <el-input @dblclick.native="showRemarkDetail(createItem.bdRemark)" class="loadingBdRemark" type="textarea" clearable rows="4" size="mini" placeholder="请输入" maxlength="512" show-word-limit v-model="createItem.bdRemark" @blur="handleSaveRemark" :disabled="!bdRemarkState"></el-input>
            </el-form-item>
					</div>
				</div>
			</div>
		</div>
		<div v-if="changeBizDateShow">
      <ChangeBizDatePop @close="changeBizDateClose" :bizDate="createItem.bizDate"></ChangeBizDatePop>
    </div>
		<div v-if="remarkVisible">
			<AuditRemark :auditRemark="remarkContent" @close="auditClose" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import clip from '@/utils/clipboard'
import {quantityMixin} from '@/views/order/order/mixins/quantityMixin'
import { portSystemLineInfo, baseSystemLineInfo, citySelectList } from '@/api/base'
// import { mainRouteFreeTime } from '@/api/charge'
// import { validateNumPoint } from '@/utils/validate'
import PortPopover from '@/views/order/order/orderList/components/portPopover'
import ChangeBizDatePop from '@/views/airTransport/order/orderList/components/changeBizDatePop'
import VesselSelect from '@/views/order/order/components/vesselSelect'
import VoyageSelect from '@/views/order/order/components/voyageSelect'
import { bizdateChange } from '@/api/order/list'
import AuditRemark from '@/views/order/order/orderList/components/auditRemark'

export default {
	mixins: [quantityMixin],
	data() {
		return {
			remarkContent: '',
			remarkVisible: false,
			porPortItem: {},
			porPortList: [],
			includeFeederState: '', // 是否包含驳船
			changeBizDateShow: false,
			bizDateModify:this.$store.state.order.orderInfoDataObj.bizDateModify,
			podServiceList: ['pod_ltl_delivery', 'pod_change_doc', 'pod_comm_clearance', 'pod_fcl_delivery', 'pod_warehouse', 'pod_wh_matter', 'pod_ltl_delivery'],

			countryName: '',
			polPortItem: {},
			polPortList: [],
			state: 'valid',
			oQuery: this.$route.query,
			sysLineName: '',
			cityList: [],
			unloadPortList: [],
			unloadPortItem: {},
			podPortList: [],
			podPortItem: {},
			pickerOptions: {
				disabledDate(date) {
					//disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
					// return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
				}
			},
			contractShow: true,
			contractRequired: false, //  服务项有代订舱合约号，合约公司必填标识
			lclSelfRequired: false, // 客户自订的截仓时间必填
			yesOrNoOptions: [
				{ label: '是', value: 'Y' },
				{ label: '否', value: 'N' }
			]
		}
	},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		fillPolData: {
			type: Object,
			default: () => ({})
		},
		whAgentSupplierName: {
			type: String,
			default: ''
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
		},
		hasPodCode: {
			type: Boolean,
			default: false
		},
		whBookStatus: {
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
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			shipTerms: state => state.dict.dictMap.shipTerms,
			ordDetRole: state => state.order.orderList.ordDetRole,
			orderInfoDataObj: (state) => state.order.orderInfoDataObj,
			userEditRoles: state => state.order.orderList.userEditRoles,
		}),
		isCscEdit() {
      return this.ordDetRole === 'csc' && this.orderStatus === 'pass'
    },
		// 航线客服在协同单可编辑
    lineCsJointIsEdit() {
      return (this.userEditRoles.includes('line_cs') || this.userEditRoles.includes('doc') || this.userEditRoles.includes('csc')) && this.$route.query.source === 'jointList'
    },
		isIncludeFeeder() {
      return this.includeFeeder === 'y' ? true : false
    },
		finIsCloseStatus() {
			// 放开已关账、已完成的限制
      // return this.orderInfoDataObj.finCloseStatus === 'yes'
      return false
    },
		showChangeBizDate() {
      if (
        this.ordDetRole === 'op' &&
        this.orderInfoDataObj.orderStatus !== 'complete' &&
				this.orderInfoDataObj.finCloseStatus !== 'yes' &&
        this.bizDateModify === null &&
        ['st02', 'st16', 'st17','st04', 'st19','st10', 'st12'].includes(this.orderInfoDataObj.serviceType)
      ) {
        return true
      } else {
        return false
      }
    },
		takeRequired() {
			return this.createItem.serviceList.includes('pol_ltl')
		},
		exportRequired() {
			return this.createItem.serviceList.includes('pol_declaration')
		},
		importRequired() {
			// 委托订舱
			if (this.createItem.serviceType === 'st11') {
				return this.createItem.serviceList.includes('pod_comm_clearance')
			}
			// 客户自订
			if (this.createItem.serviceType === 'st12') {
				return this.createItem.serviceList.some(item => this.podServiceList.includes(item))
			}
		},
		disabledState() {
			// 操作角色只有截放行时间和截报关时间可以编辑，其他都不可编辑
			// console.log('disabledState', this.isOp || this.isView);
			return this.isOp || this.isView
		},
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isCsc() {
			return this.ordDetRole === 'csc'
		},
		isOp() {
			// doc,ac,bd,op_truck审核通过的视角同op的一致
			return this.ordDetRole === 'op' || this.isDoc || this.isAc || (this.isBd && this.orderStatus === 'pass') || this.isOpTruck
		},
		isOpView() {
			return this.orderStatus === 'pass'
		},
		showBkgAgentSupplier(){
      return this.isBkg || this.isOpTrue || this.isOpTruck || this.isDoc || this.isCsc || this.isAc || this.isEpricing || this.isEcs || !this.ordDetRole
    },
		isOpTruck() {
			return this.ordDetRole === 'op_truck'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		// 满足预览权限条件
		isView() {
			// 协同单只能预览
			// if (this.$route.query.source === 'jointList') return true
			// 散货订单列表的详情只读，不可编辑
			// if (this.$route.name === 'LclOrderDetail') return true
			// 无角色只能预览
			if (!this.ordDetRole || this.isOpTruck) return true
			// bd角色除了草稿，拒绝的可编辑，其他都不可编辑
			if (this.isBd && !['draft', 'refuse'].includes(this.orderStatus)) return true
			if (this.ordDetRole === 'op' && !['pass'].includes(this.orderStatus)) return true
			return false
		},
		// 满足编辑权限条件
		isEdit() {
			return !this.isView && this.ordDetRole === 'op' && this.orderStatus === 'pass'
		},
		isDocEdit() {
			return this.ordDetRole === 'doc' && this.orderStatus === 'pass'
		},
		// 操作和文件都可以编辑
    isOpDocEdit() {
			return ['doc', 'op'].includes(this.ordDetRole) && this.orderStatus === 'pass'
		},
		// 操作在终止状态且未关账的可以编辑
    opEditIsBreak() {
      return this.ordDetRole === 'op' && this.orderStatus === 'break' && this.orderInfoDataObj.finCloseStatus !== 'yes'
		},
		bdRemarkState() {
      if (this.$route.name !== 'LclOrderDetail' && ['draft', 'refuse', 'pass', 'complete'].includes(this.orderStatus)) {
        return true
      }
      return false
    },
	},
	watch: {
		includeFeeder: {
      handler(newVal) {
        this.includeFeederState = newVal
        console.log('this.includeFeederState', this.includeFeederState)
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
		sysLineCname: {
			handler(newVal) {
				this.sysLineName = newVal
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
	components: { PortPopover, ChangeBizDatePop,VesselSelect,VoyageSelect,AuditRemark },
	methods: {
			showRemarkDetail(val) {
			this.remarkContent = val
			this.remarkVisible = true
		},

		auditClose() {
			this.remarkVisible = false
		},
		// 驳船船名输入建议
    querySearchVessel(queryString, cb) {
      this.$store.dispatch('dict/queryVessleList', { name: queryString }).then(data => {
        cb(data)
      })
    },
    // 驳船航次输入建议
    querySearchVoyage(queryString, cb, vessel) {
      this.$store.dispatch('dict/queryVoyageList', { name: queryString, vessel: vessel }).then(data => {
        cb(data)
      })
    },
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
		//保存编辑备注
    handleSaveRemark() {
      this.$emit('saveRemark')
    },
		// 复制大船船名航次
		handleCopyVessel(vessel, voyage, e) {
      let val = vessel && voyage ? `${vessel},${voyage}` : vessel ? vessel : voyage
      clip(val, e)
    },
    clipboardSuccess() {
      this.$message({
        message: '复制成功',
        type: 'success',
        duration: 1500
      })
    },
		// 去除必填项的首尾空字符串
    handleClearEmptyString(char, e) {
      if (['takeContactName', 'takeContactPhone', 'takeAddress'].includes(char)) {
				this.$set(this.createItem.transport, char, e.target.value.replace(/^\s+|\s+$/g, ''))
      } else {
				this.$set(this.createItem.ship, char, e.target.value.replace(/^\s+|\s+$/g, ''))
      }
    },
		changeBizDateClose(action, value) {
      if (action === 'Confirm') {
        this.$confirm('仅有一次手动修改机会，是否确定要修改', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            bizdateChange(value)
              .then((res) => {
                this.changeBizDateShow = false
                this.$message({ type: 'success', message: '修改成功' })
                this.bizDateModify = value.bizDate
                this.createItem.bizDate = value.bizDate
              })
              .finally(() => {})
          })
          .catch(() => {})
      } else {
        this.changeBizDateShow = false
      }
    },
    handleChangeBizDate() {
      this.changeBizDateShow = true
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
			let findItem = this.polPortList.find(item => item.portCode === val)
			this.polPortItem = findItem || {}
			this.countryName = this.polPortItem.countryName
			// 变更商务岗位分配信息
			val && this.$emit('updatePricing', '大船起运港')

			let countryCode = findItem ? findItem.countryCode : ''
			this.$emit('getCountryCode', countryCode)
			// 根据目的港自动匹配系统航线
			this.initSystemLine(val)
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
    handleChangeUnloadPortCode(val) {
      let findItem = this.unloadPortList.find(item => item.portCode === val)
      this.unloadPortItem = findItem || {}
		},
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
      let findItem = this.podPortList.find(item => item.portCode === val)
      this.podPortItem = findItem || {}
    },
		//输入大于999时候 重新赋值为999
		validateSplitNum(val, row) {
			const intReg = /^[0-9]\d*$/
			if (row[val] && !intReg.test(row[val])) {
				row[val] = ''
				return this.$message.error('请输入正整数!')
			}
			if (row[val] > 999) {
				this.$message.error('最大不能超过999!')
				row[val] = 999
			}
		},
		init() {
			// 处理进出口大小写
			this.createItem.transport.isExportRight ? (this.createItem.transport.isExportRight = this.createItem.transport.isExportRight.toLowerCase()) : null
			this.createItem.transport.isImportRight ? (this.createItem.transport.isImportRight = this.createItem.transport.isImportRight.toLowerCase()) : null
			// 协同单用contrctNo字段判断，非协同单用服务项包含代订舱判断
			if (this.$route.query.source === 'jointList') {
				this.contractShow = this.createItem.ship.contractNo ? true : false
			} else {
				this.contractShow = this.createItem.serviceList.includes('proxy_whbook') ? true : false
			}
			// this.contractShow = !this.createItem.serviceList.includes('proxy_whbook') ? false : true
			this.contractRequired = this.createItem.serviceList.includes('proxy_whbook') ? true : false
			this.lclSelfRequired = this.createItem.serviceType === 'st12' ? true : false
			// 装货地城市反显
			this.cityList = [
				{
					label: this.createItem.ship.receiptPlaceName,
					value: this.createItem.ship.receiptPlace
				}
			]
		},
		handleChangeIssueMode(val) {
			this.createItem.ship.issueMode = val
		},
		fillPolPort(portCodes) {
			console.log('🚀 ~ portCodes', portCodes)
			// 港口数据反显
			if (portCodes) {
				let { podPortCode, unloadingPortCode, polPortCode } = this.createItem.ship
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
					
					this.podPortList = initPortData.filter(item => item.portCode === podPortCode)
          this.podPortItem = this.podPortList.find(item => item.portCode === podPortCode)
          this.unloadPortList = initPortData.filter(item => item.portCode === unloadingPortCode)
					this.unloadPortItem = this.unloadPortList.find(item => item.portCode === unloadingPortCode)
					this.polPortList = initPortData.filter(item => item.portCode === polPortCode)
          this.polPortItem = this.polPortList.find(item => item.portCode === polPortCode)	
					this.countryName = this.polPortItem ? this.polPortItem.countryName : ''

					if (this.createItem.barge && this.createItem.barge.porPortCode) {
            this.porPortList = initPortData.filter(item => item.portCode === this.createItem.barge.porPortCode)
            this.porPortItem = this.porPortList.find(item => item.portCode === this.createItem.barge.porPortCode)
          }
				})
			}
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
		initSystemLine(val) {
			if (val) {
				portSystemLineInfo(val).then(res => {
					let systemLineList = res.data
					if (systemLineList.length) {
						let systemLine = systemLineList[0]
						this.createItem.ship.sysLineCode = systemLine.sysLineCode
						this.sysLineName = systemLine.cname
					}
				})
			} else {
				this.createItem.ship.sysLineCode = ''
				this.sysLineName = ''
			}
		}
	}
}
</script>

<style lang="scss">
.edit-container .order-cont .ship-cont .row-flex .one {
	width: 100%;
	padding-right: 5px;
	float: left;
	margin-bottom: 4px;
}
.lclImport-orderbook-info-table {
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
			.vessel-voyage-item{
        display: flex;
        margin-bottom: 0;
        .flex1 {
          flex: 1;
        }
        .btn-copy {
          height: 44px;
          margin-left: 4px;
        }
      }
			&.label100 .el-form-item .el-form-item__label {
				width: 100px;
			}
			&.label125 .el-form-item .el-form-item__label {
				width: 125px;
			}
			&.label90 .el-form-item .el-form-item__label {
				width: 90px;
			}
			&.label70 .el-form-item .el-form-item__label {
				width: 70px;
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
