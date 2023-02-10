<template>
	<div class="row-flex ml10" id="blInfo">
		<el-row>
			<el-form-item required label="提单类型" prop="blType" :show-message="false" class="flex-item">
				<el-select v-model="createItem.blType" size="mini" clearable placeholder="请选择" style="width: 100%" @change="handleChangeBlType" :disabled="disabledState || blTypeShow">
					<el-option v-for="(item, index) in blTypeOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="提单号" prop="blNo" :show-message="false" class="flex-item">
				<el-button type="text" class="usa-abs" v-if="createItem.blType === 'hbl'" @click="handleUsaCreate" :disabled="disabledState">生成美国单号</el-button>
				<el-input size="mini" maxlength="60" clearable placeholder="请输入" v-model="createItem.blNo" :disabled="mblDisabled || disabledState"></el-input>
			</el-form-item>
			<el-form-item label="提单所在地" prop="placeCompName" :show-message="false" class="flex-item">
				<el-input size="mini" maxlength="60" clearable placeholder="请输入" v-model="createItem.placeCompName" disabled></el-input>
			</el-form-item>
			<el-form-item label="运输条款" prop="orderInfo.transportTerm" :show-message="false" class="flex-item">
				<el-select v-model="createItem.orderInfo.transportTerm" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
					<el-option v-for="(item, index) in dictMap.transportTerm" :label="item.label" :value="item.value" :key="index"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item :required="createItem.blType === 'mbl' && !isCustRequired" label="出单方式" prop="blMode" :show-message="false" class="flex-item">
				<el-select v-model="createItem.blMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
					<el-option v-for="(item, index) in dictMap.blMode" :label="item.label" :value="item.value" :key="index"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="正/副本" class="flex-item">
				<div class="clearBoth">
					<el-input size="mini" clearable placeholder="请填写正本数量" v-model.number="createItem.originalCount" style="width: 45%" :disabled="disabledState" @input="numberInputCheck($event, 'originalCount', '正本数量')"></el-input>
					<span class="seprate-line">/</span>
					<el-input size="mini" clearable placeholder="请填写副本数量" v-model.number="createItem.copyCount" style="width: 45%" :disabled="disabledState" @input="numberInputCheck($event, 'copyCount', '副本数量')"></el-input>
				</div>
			</el-form-item>
			<el-form-item label="签单人" prop="signEmployeeId" :show-message="false" class="flex-item">
				<el-select
					size="mini"
					v-model="createItem.signEmployeeId"
					filterable
					remote
					clearable
					style="width: 100%"
					placeholder="请输入"
					:disabled="disabledState"
					:remote-method="signerFilterMehod"
					@visible-change="signerVisibleChange"
					@change="handleChangeEmployeeId"
				>
					<el-option v-for="(item, index) in signEmployeeOptions" :label="item.label" :value="item.value" :key="index"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="签单时间" prop="signTime" :show-message="false" class="flex-item">
				<elDatePickerLimit size="mini" v-model="createItem.signTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="disabledState" />
			</el-form-item>
			<el-form-item label="签单地点" prop="signAddress" :show-message="false" class="flex-item">
				<el-input size="mini" clearable placeholder="请输入" v-model="createItem.signAddress" :disabled="disabledState"></el-input>
			</el-form-item>
			<el-form-item :required="!isCustRequired" label="付款方式" prop="orderInfo.payMode" :show-message="false" class="flex-item">
				<el-select v-model="createItem.orderInfo.payMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
					<el-option v-for="(item, index) in dictMap.payMode" :label="item.label" :value="item.value" :key="index"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="合约号" prop="orderInfo.contractNo" :show-message="false" class="flex-item" v-if="!isBulkRo">
				<el-input size="mini" clearable placeholder="请输入" v-model="createItem.orderInfo.contractNo" :disabled="disabledState" maxlength="128"></el-input>
			</el-form-item>
			<el-form-item label="合约公司" prop="orderInfo.contractCompany" :show-message="false" class="flex-item" v-if="!isBulkRo">
				<el-input size="mini" clearable placeholder="请输入" v-model="createItem.orderInfo.contractCompany" :disabled="disabledState" maxlength="128"></el-input>
			</el-form-item>
		</el-row>
		<el-row>
			<el-form-item :required="consigneeRequired && !isCustRequired" label="Shipper(发货人)" prop="blContact.shipper" :show-message="false" class="flex-item col-3 shipper-rel">
				<span slot="label" style="position: relative; z-index: 200">
					<span>Shipper(发货人)</span>
					<el-button type="text" size="mini" @click="openContactPerson('发货人', '')" :disabled="disabledState">选择</el-button>
				</span>

				<TextAreaItem
					isNeedCheckRowLen
					@dblclick.native="editDetail('shipper')"
					:disabled="disabledState"
					:required="consigneeRequired && !isCustRequired"
					keys="shipper"
					label="Shipper(发货人)"
					:rows="6"
					:value.sync="createItem.blContact.shipper"
					:blType="createItem.blType"
					:switchInfoFlag="createItem.blId"
				></TextAreaItem>
			</el-form-item>
			<div class="flex-item col-3">
				<div class="item-label notify">
					<div class="notify-flex-row">
						<span><i v-if="consigneeRequired && !isCustRequired" style="color: #ff4949; margin-right: 4px">*</i>Consignee(收货人)</span>
						<el-button type="text" size="mini" @click="openContactPerson('收货人', '')" :disabled="disabledState">选择</el-button>
					</div>
					<el-button v-if="blackPopList.length" size="mini" type="text" class="same" @click="handleClickBlack">船司黑名单</el-button>
				</div>
				<el-form-item :required="consigneeRequired && !isCustRequired" prop="blContact.consignee" :show-message="false" class="shipper-rel notify-rel">
					<TextAreaItem
						isNeedCheckRowLen
						@dblclick.native="editDetail('consignee')"
						:disabled="disabledState"
						:required="consigneeRequired && !isCustRequired"
						keys="consignee"
						label="Consignee(收货人)"
						:rows="6"
						:value.sync="createItem.blContact.consignee"
						:blType="createItem.blType"
						:switchInfoFlag="createItem.blId"
					></TextAreaItem>
				</el-form-item>
			</div>
			<div class="flex-item col-3">
				<div class="item-label notify">
					<div class="notify-flex-row">
						<span class="lab" :class="notify === '1' ? 'active' : ''" @click="handleNotifyClick('1')"><em class="red" v-if="consigneeRequired && !isCustRequired">*</em>Notify Party(通知人)</span>
						<span class="lab flex1" :class="notify === '2' ? 'active' : ''" @click="handleNotifyClick('2')">Also Notify Party</span>
						<el-button type="text" size="mini" @click="openContactPerson('通知人', notify)" :disabled="disabledState">选择</el-button>
					</div>
					<el-button size="mini" type="text" class="same" @click="handleClickNotify" :disabled="disabledState">SAME AS CONSIGNEE</el-button>
				</div>
				<el-form-item :required="consigneeRequired && !isCustRequired" prop="blContact.notify1" :show-message="false" v-show="notify === '1'" class="shipper-rel notify-rel">
					<TextAreaItem
						isNeedCheckRowLen
						@dblclick.native="editDetail('notify1')"
						:disabled="disabledState"
						:required="consigneeRequired && !isCustRequired"
						keys="notify1"
						label="Notify Party(通知人)"
						:rows="6"
						:value.sync="createItem.blContact.notify1"
						:blType="createItem.blType"
						:switchInfoFlag="createItem.blId"
					></TextAreaItem>
				</el-form-item>
				<el-form-item prop="blContact.notify2" :show-message="false" v-show="notify === '2'" class="shipper-rel notify-rel">
					<TextAreaItem
						isNeedCheckRowLen
						@dblclick.native="editDetail('notify2')"
						:disabled="disabledState"
						:required="consigneeRequired && !isCustRequired"
						keys="notify2"
						label="Also Notify Party"
						:rows="6"
						:value.sync="createItem.blContact.notify2"
						:blType="createItem.blType"
						:switchInfoFlag="createItem.blId"
					></TextAreaItem>
				</el-form-item>
			</div>
			<el-form-item label="Forwarding Agent（运输代理人）" prop="orderInfo.forwardAgent" :show-message="false" class="flex-item col-3 shipper-rel">
				<el-button :disabled="disabledState" v-if="createItem.blType === 'hbl'" @click="getConsignee" style="position: absolute; right: 0; top: -2px; z-index: 999" type="primary" size="mini">取主单Consignee</el-button>

				<TextAreaItem @dblclick.native="editDetail('forwardAgent')" :disabled="disabledState" keys="forwardAgent" label="Forwarding Agent（运输代理人）" :rows="6" :value.sync="createItem.orderInfo.forwardAgent" :blType="createItem.blType" :switchInfoFlag="createItem.blId"></TextAreaItem>
			</el-form-item>
			<el-form-item label="提单备注(打印)" prop="remarkPrint" :show-message="false" class="flex-item col-3 shipper-rel">
				<el-input
					@focus="handleFocus('remarkPrint')"
					@dblclick.native="editDetail('remarkPrint')"
					type="textarea"
					:rows="6"
					maxlength="512"
					show-word-limit
					size="mini"
					placeholder="请输入"
					v-model="createItem.remarkPrint"
					:disabled="disabledState"
				></el-input>
			</el-form-item>
			<el-form-item label="系统备注（不打印）" prop="remark" :show-message="false" class="flex-item col-3">
				<el-input @dblclick.native="editDetail('remark')" type="textarea" :rows="6" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createItem.remark" :disabled="disabledState"></el-input>
			</el-form-item>
		</el-row>
		<el-row>
			<el-form-item label="驳船船名" prop="orderInfo.bargeVessel" :show-message="false" class="flex-item" v-if="isBarge">
				<el-autocomplete
					style="width: 100%"
					size="mini"
					clearable
					v-model="createItem.orderInfo.bargeVessel"
					:fetch-suggestions="(queryString, cb) => querySearchVessel(queryString, cb)"
					placeholder="请输入"
					:disabled="disabledState"
					:maxlength="128"
					@select="value => handleSelectVessel(value)"
					@clear="value => handleClearVessel(value)"
				></el-autocomplete>
			</el-form-item>
			<el-form-item label="驳船船次" prop="orderInfo.bargeVoyage" :show-message="false" class="flex-item" v-if="isBarge">
				<el-autocomplete
					style="width: 100%"
					size="mini"
					clearable
					v-model="createItem.orderInfo.bargeVoyage"
					:fetch-suggestions="(queryString, cb) => querySearchVoyage(queryString, cb, createItem.orderInfo.bargeVessel)"
					placeholder="请输入"
					:disabled="disabledState"
					:maxlength="128"
					@select="value => handleSelectVoyage(value)"
					@clear="value => handleClearVoyage(value)"
				></el-autocomplete>
			</el-form-item>
			<el-form-item label="大船船名" prop="orderInfo.vessel" :show-message="false" class="flex-item">
				<vessel-select
					v-model="createItem.orderInfo.vessel"
					:orderNo="$route.query.orderNo"
					:disabledState="disabledState"
					:shipCarrierCode="createItem.orderInfo.shipCarrierCode"
					:polPortCode="createItem.orderInfo.polPortCode"
					:podPortCode="createItem.orderInfo.podPortCode"
				/>
			</el-form-item>
			<el-form-item label="大船航次" prop="orderInfo.voyage" :show-message="false" class="flex-item">
				<voyage-select
					v-model="createItem.orderInfo.voyage"
					:disabledState="disabledState"
					:orderNo="$route.query.orderNo"
					:vessel="createItem.orderInfo.vessel"
					:shipCarrierCode="createItem.orderInfo.shipCarrierCode"
					:polPortCode="createItem.orderInfo.polPortCode"
					:podPortCode="createItem.orderInfo.podPortCode"
				/>
			</el-form-item>
			<el-form-item :required="orderInfo.businessType === 'ship_export_fcl'" label="截补料时间" prop="orderInfo.siCutOff" :show-message="false" class="flex-item" v-if="!isBulkRo">
				<elDatePickerLimit
					:field="'siCutOff'"
					size="mini"
					v-model="createItem.orderInfo.siCutOff"
					type="datetime"
					style="width: 100%"
					clearable
					:popper-class="'hideMinute'"
					placeholder="请选择"
					:disabled="disabledState"
					value-format="yyyy-MM-dd HH"
					format="yyyy-MM-dd HH"
					:picker-options="pickerOptions"
				/>
			</el-form-item>
			<el-form-item :required="isFcl" label="船公司" prop="orderInfo.shipCarrierCode" :show-message="false" class="flex-item webUrl">
				<el-select
					size="mini"
					v-model="createItem.orderInfo.shipCarrierCode"
					filterable
					remote
					clearable
					:disabled="disabledState"
					style="width: 100%"
					placeholder="请输入"
					:remote-method="shipCarrierFilterMehod"
					@visible-change="shipCarrierVisibleChange"
					@change="handleChangeShipCarrier"
				>
					<el-option v-for="(item, index) in shipCarrierOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
				</el-select>
				<el-button type="default" size="mini" class="webUrl-btn" style="margin-left: 5px" @click="getShippingCarrierUrl(createItem.orderInfo.shipCarrierCode)">船司官网</el-button>
			</el-form-item>
			<el-form-item :required="isBarge && !isCustRequired" :label="isBarge ? '驳船收货地' : '收货地'" prop="orderInfo.bargePorPortName" :show-message="false" class="flex-item">
				<el-autocomplete
					:debounce="0"
					popper-class="port-autocomplete"
					style="width: 100%"
					size="mini"
					clearable
					v-model="createItem.orderInfo.bargePorPortName"
					:fetch-suggestions="(queryString, cb) => querySearchPorPort(queryString, cb)"
					placeholder="请输入"
					:disabled="disabledState"
					@select="value => handleSelectPort(value, 'bargePorPortCode')"
					@clear="value => handleClearPort(value, 'bargePorPortCode')"
				></el-autocomplete>
			</el-form-item>
			<el-form-item required label="大船起运港" prop="orderInfo.polPortName" :show-message="false" class="flex-item">
				<el-autocomplete
					:debounce="0"
					popper-class="port-autocomplete"
					style="width: 100%"
					size="mini"
					clearable
					v-model="createItem.orderInfo.polPortName"
					:fetch-suggestions="(queryString, cb) => querySearchPolPort(queryString, cb)"
					placeholder="请输入"
					:disabled="disabledState"
					@select="value => handleSelectPort(value, 'polPortCode')"
					@clear="value => handleClearPort(value, 'polPortCode')"
				></el-autocomplete>
			</el-form-item>
			<el-form-item label="中转港" prop="orderInfo.transitPortName" :show-message="false" class="flex-item multi-select-tag">
				<el-autocomplete
					:debounce="0"
					popper-class="port-autocomplete"
					style="width: 100%"
					size="mini"
					clearable
					v-model="createItem.orderInfo.transitPortName"
					:fetch-suggestions="(queryString, cb) => querySearchTransitPort(queryString, cb)"
					placeholder="请输入"
					:disabled="disabledState"
					@select="value => handleSelectPort(value, 'transitPortCode')"
					@clear="value => handleClearPort(value, 'transitPortCode')"
				></el-autocomplete>
			</el-form-item>
			<el-form-item :required="['ship_import_fcl', 'ship_import_lcl'].includes(orderInfo.businessType)" label="卸货港" prop="orderInfo.unloadingPortName" :show-message="false" class="flex-item">
				<el-autocomplete
					:debounce="0"
					popper-class="port-autocomplete"
					style="width: 100%"
					size="mini"
					clearable
					v-model="createItem.orderInfo.unloadingPortName"
					:fetch-suggestions="(queryString, cb) => querySearchUnloadPort(queryString, cb)"
					placeholder="请输入"
					:disabled="disabledState"
					@select="value => handleSelectPort(value, 'unloadingPortCode')"
					@clear="value => handleClearPort(value, 'unloadingPortCode')"
				></el-autocomplete>
			</el-form-item>
			<el-form-item :required="!['ship_export_fcl', 'ship_export_lcl'].includes(orderInfo.businessType)" label="目的地" prop="orderInfo.podPortName" :show-message="false" class="flex-item">
				<el-autocomplete
					:debounce="0"
					popper-class="port-autocomplete"
					style="width: 100%"
					size="mini"
					clearable
					v-model="createItem.orderInfo.podPortName"
					:fetch-suggestions="(queryString, cb) => querySearchPodPort(queryString, cb)"
					placeholder="请输入"
					:disabled="disabledState"
					@select="value => handleSelectPort(value, 'podPortCode')"
					@clear="value => handleClearPort(value, 'podPortCode')"
				></el-autocomplete>
			</el-form-item>
			<el-form-item label="最终目的地" prop="orderInfo.deliveryPlace" :show-message="false" class="flex-item">
				<el-input size="mini" clearable placeholder="请输入" v-model="createItem.orderInfo.deliveryPlace" :disabled="disabledState"></el-input>
			</el-form-item>
			<el-form-item label="预计到港时间" prop="orderInfo.etaTime" :show-message="false" class="flex-item">
				<elDatePickerLimit size="mini" :field="'etaTime'" v-model="createItem.orderInfo.etaTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :picker-options="pickerOptions" :disabled="disabledState" />
			</el-form-item>
			<el-form-item label="大船实际开船时间" prop="orderInfo.tdTime" :show-message="false" class="flex-item vessel-time">
				<elDatePickerLimit noCanFuture :field="'tdTime'" size="mini" v-model="createItem.orderInfo.tdTime" type="date" style="width: 100%" clearable :disabled="disabledState" placeholder="请选择" value-format="yyyy-MM-dd" />
				<el-popover placement="top" width="280" trigger="click" class="vessel-time-popover" id="schedulePopover" ref="schedulePopover">
					<Schedule :vesselTime="vesselTime" :tdTimeDisabled="disabledState" :etaTimeDisabled="disabledState" @updateVesselTime="updateVesselTime" />
					<el-button slot="reference" type="default" size="mini" @click.stop="handleSearchVesselTime">查询</el-button>
				</el-popover>
			</el-form-item>
			<el-form-item label="三方贸易" prop="tripartiteTrade" :show-message="false" class="flex-item">
				<el-select v-model="createItem.tripartiteTrade" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
					<el-option v-for="(item, index) in dictMap.tripartiteTrade" :label="item.label" :value="item.value" :key="index"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="驳船实际开船时间" prop="orderInfo.bargeTdTime" :show-message="false" class="flex-item" v-if="isBarge">
				<elDatePickerLimit noCanFuture :field="'bargeTdTime'" size="mini" v-model="createItem.orderInfo.bargeTdTime" type="date" style="width: 100%" clearable :disabled="disabledState" placeholder="请选择" value-format="yyyy-MM-dd" />
			</el-form-item>
			<el-form-item :required="!isCustRequired" label="装船时间" prop="orderInfo.shipmentTime" :show-message="false" class="flex-item" v-if="isBulkRo">
				<elDatePickerLimit noCanFuture :field="'shipmentTime'" size="mini" v-model="createItem.orderInfo.shipmentTime" type="date" style="width: 100%" clearable :disabled="disabledState" placeholder="请选择" value-format="yyyy-MM-dd" />
			</el-form-item>
		</el-row>
		<el-row v-if="isBulkRo">
			<el-form-item label="件数" prop="quantity" :show-message="false" class="flex-item">
				<el-input size="mini" clearable placeholder="请输入" v-model="createItem.quantity" :disabled="disabledState" @blur="validQuantity"></el-input>
			</el-form-item>
			<el-form-item label="毛重" prop="quantity" :show-message="false" class="flex-item">
				<el-input size="mini" clearable placeholder="请输入" v-model="createItem.weight" :disabled="disabledState" @blur="validateVolumeWeight('weight')"></el-input>
			</el-form-item>
			<el-form-item label="体积" prop="quantity" :show-message="false" class="flex-item">
				<el-input size="mini" clearable placeholder="请输入" v-model="createItem.volume" :disabled="disabledState" @blur="validateVolumeWeight('volume')"></el-input>
			</el-form-item>
			<el-form-item label="包装" prop="quantity" :show-message="false" class="flex-item">
				<el-select size="mini" v-model="createItem.packageType" style="width: 100%" clearable placeholder="请选择" filterable :disabled="disabledState">
					<el-option v-for="item in dictMap.packageType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
		</el-row>
		<el-row>
			<el-form-item label="唛头" prop="cargoMark" :show-message="false" class="flex-item col-2 shipper-rel">
				<TextAreaItem @dblclick.native="editDetail('cargoMark')" :regExp="cargoReg" :disabled="disabledState" keys="cargoMark" label="唛头" :rows="5" :value.sync="createItem.cargoMark" :blType="createItem.blType" :switchInfoFlag="createItem.blId"></TextAreaItem>
			</el-form-item>
			<el-form-item :required="markDescRequired && !isCustRequired" label="货物描述" prop="cargoDesc" :show-message="false" class="flex-item col-2 shipper-rel">
				<TextAreaItem
					@dblclick.native="editDetail('cargoDesc')"
					:regExp="cargoReg"
					:disabled="disabledState"
					:required="markDescRequired && !isCustRequired"
					keys="cargoDesc"
					label="货物描述"
					:rows="5"
					:value.sync="createItem.cargoDesc"
					:blType="createItem.blType"
					:switchInfoFlag="createItem.blId"
				></TextAreaItem>
			</el-form-item>
		</el-row>
		<div v-if="contactPersonShow">
			<ContactPerson :config="contactPersonConfig" @close="getContactPerson" />
		</div>
		<el-dialog class="edit-detail-dlg" :title="editTitle" :visible.sync="editVisible" width="50%">
			<TextAreaItem :regExp="editReg" :disabled="disabledState" keys="editForm" :maxlength="editInputMaxLength.toString()" :rows="20" :show-word-limit="editInputMaxLength ? true : false" :value.sync="editData" :blType="createItem.blType" :switchInfoFlag="createItem.blId"></TextAreaItem>
			<span slot="footer" class="dialog-footer">
				<el-button size="mini" type="primary" @click="editConfirm">确 定</el-button>
			</span>
		</el-dialog>
		<el-dialog class="err-detail-dlg" title="错误详情" :visible.sync="detailVisible" width="50%">
			<div v-for="(item, index) in errContent" v-html="item" :key="index"></div>
			<span slot="footer" class="dialog-footer">
				<el-button size="mini" type="primary" @click="detailVisible = false">关 闭</el-button>
			</span>
		</el-dialog>
		<div v-if="blackPopShow">
			<blackPop :options="blackPopList" @close="blackPopClose" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { portSystemLineInfo, baseSystemLineInfo, baseEmployeeListName, citySelectList } from '@/api/base'
import { blCreateSerialNo, blUsaCreate, getMblConsignee } from '@/api/order/bl'
import { getBlackUrl } from '@/api/baseData'
import { mainRouteFreeTime } from '@/api/charge'
import ContactPerson from '@/views/order/order/orderList/components/contactPerson.vue'
import Schedule from '@/views/order/order/orderList/components/schedule'
import TextAreaItem from '@/components/Form/textAreaItem'
import VesselSelect from '@/views/order/order/components/vesselSelect'
import VoyageSelect from '@/views/order/order/components/voyageSelect'
import blackPop from './blackPop'
export default {
	data() {
		return {
			curProp: '',
			editTitle: '',
			editTitleObj: {
				consignee: '收货人',
				shipper: '发货人',
				notify1: 'Notify Party',
				notify2: 'Also Notify Party',
				forwardAgent: '运输代理人',
				cargoMark: '唛头',
				cargoDesc: '货物描述',
				remarkPrint: '提单备注',
				remark: '系统备注'
			},
			editInputMaxLength: '',
			errContent: [],
			detailVisible: false,
			iconObj: {
				shipper: false,
				consignee: false,
				notify1: false,
				notify2: false,
				forwardAgent: false,
				cargoMark: false,
				cargoDesc: false,
				remarkPrint: false
			},
			editData: '',
			editProp: '',
			editVisible: false,
			state: 'valid',
			isEdit: false,
			oQuery: this.$route.query,
			sysLineName: '',
			transitPortOptions: [],
			portList: [],
			pickerOptions: {
				disabledDate(date) {
					//disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
					// return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
				}
			},
			signEmployeeOptions: [],
			notify: '1',
			contactPersonShow: false,
			contactPersonConfig: {
				type: '收货人', // 类型，收货人，发货人，通知人
				num: '' // 通知人1，2，3
			},
			shipCarrierOptions: [],
			vesselTime: {},
			vesselTimeParam: {},
			blackPopShow: false,
			blackPopList: []
		}
	},
	props: {
		isCust: {
			type: Boolean,
			default: false
		},
		orderInfo: {
			type: Object,
			default: () => ({})
		},
		createItem: {
			type: Object,
			default: () => ({})
		},
		includeFeeder: {
			type: String,
			default: ''
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
		bargeOption: {
			type: Object,
			default: () => ({})
		},
		validateBlContact: {
			type: Object,
			default: () => ({})
		},
		custBlInfoNotEdit: {
			type: Boolean,
			default: false
		}
	},
	created() {
		this.getShipTerm()
		this.fillPolPort(this.fillPortCodes)
		this.signEmployeeOptions = [{ label: this.createItem.signEmployeeName, value: this.createItem.signEmployeeId }]
		if (!this.createItem.signAddress) {
			this.getUserCompanyMethod()
		}
		// console.log(this.fillPortCodes);
		if (!this.createItem.blContact) {
			// blContact 需要是对象，不然blContact.xxx 不能双向绑定
			this.createItem.blContact = {}
		}
		this.getBlackUrlData()
	},
	mounted() {
		console.log('🚀 ~ this.createItem', this.createItem)
		this.$nextTick(() => {
			document.getElementById('blInfo').addEventListener('click', this.closePopover)
		})
	},
	destroyed() {
		document.getElementById('blInfo') && document.getElementById('blInfo').removeEventListener('click', this.closePopover)
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles
		}),
		editReg() {
			//根据属性名设置编辑框正则

			if (this.curProp === 'remarkPrint' || this.curProp === 'remark' || ((this.curProp === 'cargoMark' || this.curProp === 'cargoDesc') && this.createItem.orderInfo.podPortName === 'TAICHUNG,TAIWAN')) {
				return /$a/g // 不匹配任何内容
			} else {
				return /[^\x00-\x7F]+/g
			}
		},
		cargoReg() {
			if (this.createItem.orderInfo.podPortName != 'TAICHUNG,TAIWAN') {
				return /[^\x00-\x7F]+/g
			} else {
				return /$a/g // 不匹配任何内容
			}
		},
		isIncludeFeeder() {
			return this.includeFeeder === 'y' ? true : false
		},
		isBarge() {
			return this.bargeOption === null ? false : true
		},
		disabledState() {
			// 自动生成的进口单不允许编辑
			//  20221213临时放开
			if (this.$route.query.isPendding === 'pendding') {
				return true
			}
			if (['cancel', 'complete'].includes(this.orderStatus) || this.createItem.canEdit === 'n' || this.custBlInfoNotEdit) {
				return true
			} else if (['st26', 'st27', 'st28'].includes(this.orderInfo.serviceType)) {
				if (this.ordDetRole === 'op_truck') {
					return false
				} else {
					return true
				}
			}
			if (this.userEditRoles.includes('obd') || this.userEditRoles.includes('asst') || this.userEditRoles.includes('doc')) {
				return false
			}
			return this.ordDetRole === 'bd' || this.ordDetRole === 'op' || this.ordDetRole === 'op_truck' || this.ordDetRole === 'ac'
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
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		isView() {
			// if (this.oQuery.action === 'view') {
			//   return true
			// }
			if (this.isBd && this.orderStatus !== 'draft') {
				return true
			}
			if (this.isOp && !['pass'].includes(this.orderStatus)) {
				return true
			}
			return false
		},
		blTypeShow() {
			return this.createItem.blId ? true : false
		},
		// MBL不可编辑，HBL可编辑
		mblDisabled() {
			// return this.createItem.blType === 'mbl' ? true : false
		},
		blTypeOptions() {
			// 硬编码过滤不显示MBL or HBL
			let result = []
			result = this.dictMap.blType.filter(item => item.value !== 'mbl_hbl')
			return result
		},
		// 进口业务唛头，货描非必填
		markDescRequired() {
			return !['ship_import_fcl', 'ship_import_lcl'].includes(this.orderInfo.businessType)
		},
		// 收发通在出口，进口的委托订舱必填
		consigneeRequired() {
			return ['st01', 'st15', 'st09'].includes(this.orderInfo.serviceType)
		},
		// 散杂滚装
		isBulkRo() {
			return this.orderInfo.businessType === 'ship_bulk_ro'
		},
		// 出口整箱
		isFcl() {
			return this.orderInfo.businessType === 'ship_export_fcl'
		},
		// 对客提单草稿状态必填
		isCustRequired() {
			return this.isCust && this.createItem.status === 'todo' && this.createItem.blType === 'mbl'
		}
	},
	watch: {
		fillPortCodes(newVal, oldVal) {
			if (newVal) {
				this.fillPolPort(newVal)
			}
			// this.fillPolPort(newVal)
		},
		'createItem.ship.sysLineCode'(newVal, oldVal) {
			let { action } = this.oQuery
			if (newVal && action !== 'add' && action !== 'copy') {
				this.fillSysLine(newVal)
			}
		}
	},
	components: {
		ContactPerson,
		Schedule,
		TextAreaItem,
		VesselSelect,
		VoyageSelect,
		blackPop
	},
	methods: {
		//输入件数大于9999999时候 重新赋值为9999999
		validQuantity() {
			const intReg = /^\d+(?=\.{0,1}\d+$|$)/
			if (this.createItem.quantity && !intReg.test(this.createItem.quantity)) {
				this.createItem.quantity = ''
				return this.$message.error('请输入正确的件数')
			}
			if (this.createItem.quantity > 9999999) {
				this.$message.error('最大不能超过9999999!')
				this.createItem.quantity = 9999999
			}
		},
		validateVolumeWeight(val) {
			// 体积重量保存为小数点后3位
			const pReg = /^\d+(\.\d+)?$/
			if (!this.createItem[val]) return
			if (typeof this.createItem[val] === 'string') {
				let pointIndex = this.createItem[val].indexOf('.')
				if (pointIndex !== -1) {
					this.createItem[val] = this.createItem[val].substring(0, pointIndex + 4)
				}
			}
			this.createItem[val] = Number(this.createItem[val])
			if (!pReg.test(this.createItem[val])) {
				this.createItem[val] = ''
				let message = ''
				switch (val) {
					case 'volume':
						message = '体积'
						break
					case 'weight':
						message = '重量'
						break
				}
				return this.$message.error('请输入正确的' + message)
			}
			if (this.createItem[val] > 999999) {
				this.createItem[val] = 999999
				this.$message.error('最大不能超过999999!')
			}
		},
		// 解决el-popover点击空白处关闭失效的问题
		closePopover(e) {
			let popover = document.getElementById('schedulePopover')
			// console.log('ref', popover)
			if (popover) {
				if (!popover.contains(e.target)) {
					this.$refs.schedulePopover.doClose()
				}
			}
		},
		// 船期查询结果直接填入订单详情
		updateVesselTime(val, key) {
			this.createItem.orderInfo[key] = val
		},
		//获取主单consignee
		getConsignee() {
			getMblConsignee({ orderNo: this.$route.query.orderNo, blId: this.createItem.blId || 0 }).then(res => {
				this.createItem.orderInfo.forwardAgent = res.data
			})
		},
		// 打开错误框
		showDetail(val) {
			let data = ''
			if (val === 'shipper' || val === 'consignee' || val === 'notify1' || val === 'notify2') {
				data = this.createItem.blContact[val]
			}
			if (val === 'remarkPrint' || val === 'remark' || val === 'cargoMark' || val === 'cargoDesc') {
				data = this.createItem[val]
			}
			if (val === 'forwardAgent') {
				data = this.createItem.orderInfo[val]
			}
			let errContent = data.replace(/[^\x00-\xff]+/g, function (item) {
				return `<span style='color:red;'>${item}</span>`
			})
			this.errContent = errContent.split('\n')
			this.detailVisible = true
		},
		//关闭编辑框
		editConfirm() {
			let val = this.curProp
			if (val === 'shipper' || val === 'consignee' || val === 'notify1' || val === 'notify2') {
				this.createItem.blContact[val] = this.editData
			}
			if (val === 'remarkPrint' || val === 'remark' || val === 'cargoMark' || val === 'cargoDesc') {
				this.$set(this.createItem, val, this.editData)
			}
			if (val === 'forwardAgent') {
				this.createItem.orderInfo[val] = this.editData
			}
			//判断是否显示感叹号
			this.iconObj[this.curProp] = /[^\x00-\xff]+/g.test(this.editData)
			this.editVisible = false
		},
		//打开编辑框
		editDetail(val) {
			this.editTitle = this.editTitleObj[val]
			this.curProp = val
			if (val === 'remarkPrint' || val === 'remark') {
				this.editInputMaxLength = 512
			} else {
				this.editInputMaxLength = ''
			}
			// if (val === 'cargoMark' || val === 'cargoDesc') {
			// 	this.editInputMaxLength = 2048
			// } else {
			// 	this.editInputMaxLength = 512
			// }
			if (val === 'shipper' || val === 'consignee' || val === 'notify1' || val === 'notify2') {
				this.editData = this.createItem.blContact[val]
			}
			if (val === 'remarkPrint' || val === 'remark' || val === 'cargoMark' || val === 'cargoDesc') {
				this.editData = this.createItem[val]
			}
			if (val === 'forwardAgent') {
				this.editData = this.createItem.orderInfo[val]
			}
			this.editVisible = true
			// this.$nextTick(() => {
			// 	this.$refs.editInput.focus()
			// })
		},
		handleBlur(val) {
			// 20211112变更临时不显示收发通行数，最大字符数的限制提示
			// this.$set(this.validateBlContact[val], 'showTip', false)
			this.curProp = val
			let data = ''
			if (val === 'shipper' || val === 'consignee' || val === 'notify1' || val === 'notify2') {
				data = this.createItem.blContact[val]
			}
			if (val === 'remark' || val === 'cargoMark' || val === 'cargoDesc') {
				data = this.createItem[val]
			}
			if (val === 'forwardAgent') {
				data = this.createItem.orderInfo[val]
			}
			// 替换特殊字符为空格  ‬
			data = data.replace('‬  ', ' ')
			this.iconObj[val] = /[^\x00-\xff]+/g.test(data)
		},
		handleFocus(val) {
			// 20211112变更临时不显示收发通行数，最大字符数的限制提示
			// this.$set(this.validateBlContact[val], 'showTip', true)
			this.iconObj[val] = false
		},
		handleUsaCreate() {
			// if (this.createItem.blNo.startsWith('LUCN')) {
			// 	return this.$message.warning('该提单已经是美国单号了，不能重复生成美国单号')
			// }
			blUsaCreate({ orderNo: this.$route.query.orderNo }).then(res => {
				if (res.data.usaNo) {
					this.createItem.blNo = res.data.usaNo
				}
			})
		},
		numberInputCheck(val, params, text) {
			// 正副本数字校验
			this.debounceLs(() => {
				if (!val) return
				let numberReg = /^[0-9]+$/
				if (!numberReg.test(val) && (!val.includes('.') || val.indexOf('.') === 0 || (val.length > 1 && val.indexOf('.') !== val.length - 1))) {
					this.createItem[params] = ''
					this.$message.error(`${text}必须填写正整数`)
				}
			})
		},
		debounceLs(fn, time = 600) {
			clearTimeout(this.timerTr)
			this.timerTr = setTimeout(() => {
				if (!fn || !(fn instanceof Function)) {
					this.$message({ message: '参数错误！', type: 'error', showClose: true })
				} else {
					fn()
				}
			}, time)
		},
		openContactPerson(type, num) {
			// 打开收发通弹窗
			this.contactPersonConfig.type = type
			this.contactPersonConfig.num = num
			this.contactPersonShow = true
		},
		getContactPerson(action, value, type, num) {
			this.contactPersonShow = false
			if (action === 'Confirm') {
				let str = `${value.companyName ? value.companyName + '\n' : ''}${value.contactAddress ? value.contactAddress + '\n' : ''}${value.contactName ? value.contactName + '\n' : ''}${value.contactPhone ? 'TEL:' + value.contactPhone + '\n' : ''}${
					value.contactFax ? 'FAX:' + value.contactFax + '\n' : ''
				}${value.taxCode ? 'TAX:' + value.taxCode + '\n' : ''}${value.remark}`
				if (type === '收货人') {
					this.$set(this.createItem.blContact, 'consignee', str)
				} else if (type === '发货人') {
					this.$set(this.createItem.blContact, 'shipper', str)

					console.log('🚀 ~ this.createItem.blContact.shipper', this.createItem.blContact.shipper)
				} else {
					if (num == 1) {
						this.$set(this.createItem.blContact, 'notify1', str)
					} else if (num == 2) {
						this.$set(this.createItem.blContact, 'notify2', str)
					} else {
						// this.createItem.transport.notify3 = str
					}
				}
			}
		},
		handleClickNotify() {
			let str = 'SAME AS CONSIGNEE'
			if (this.notify === '1') {
				this.$set(this.createItem.blContact, 'notify1', str)
			}
			if (this.notify === '2') {
				this.$set(this.createItem.blContact, 'notify2', str)
			}
		},
		handleClickBlack() {
			this.blackPopShow = true
		},
		blackPopClose() {
			this.blackPopShow = false
		},
		// 签单人下拉搜索自定义查询
		signerFilterMehod(val) {
			this.getEmployeeName(val)
		},

		// 签单人下拉展开
		signerVisibleChange(val) {
			if (val) {
				this.getEmployeeName()
			}
		},
		getUserCompanyMethod() {
			// 获取当前登录账号所属公司信息
			this.$store.dispatch('order/getUserCompanyInfoAction').then(signAddress => {
				this.createItem.signAddress = signAddress
			})
		},
		// 获取姓名
		getEmployeeName(val) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : ''
			}
			baseEmployeeListName(data).then(res => {
				this.signEmployeeOptions = res.data
					.filter(item => item.status === 'on')
					.map(item => {
						return Object.assign(item, {
							label: this.$language == 'en' ? item.ename : item.cname,
							value: item.employeeId
						})
					})
			})
		},
		handleChangeEmployeeId(val) {
			let findItem = this.signEmployeeOptions.find(item => item.value === val)
			this.createItem.signEmployeeName = findItem ? findItem.label : ''
		},
		// 选择为H单，提单号为接口生成; 选择M单，提单号为空,需手动输入
		handleChangeBlType(val) {
			if (val === 'hbl') {
				this.handleCreateSerialNo()
				this.createItem.originalCount = '3'
				this.createItem.copyCount = '3'
			} else {
				this.createItem.blNo = ''
				this.createItem.originalCount = ''
				this.createItem.copyCount = ''
				// Object.assign(this.blInfoOptions[1], {
				//   value: this.createItem.blNo ? this.createItem.blNo : '',
				//   disabled: false
				// })
			}
		},
		// 生成HBL号
		handleCreateSerialNo() {
			blCreateSerialNo({ orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.createItem.blNo = res.data.serialNo
			})
		},
		fillSysLine(sysLineCode) {
			if (sysLineCode) {
				baseSystemLineInfo({ sysLineCode }).then(res => {
					this.sysLineName = res.data.cname
				})
			}
		},
		getReceiptPlaceName(cityCode) {
			citySelectList({
				countryCode: '',
				cityCode: cityCode || '',
				state: 'valid'
			}).then(res => {
				this.createItem.orderInfo.polPortName = res.data && res.data.length ? res.data[0].ename : ''
			})
		},
		getPortName(data, portCode, defaultName) {
			let result = ''
			let arr = data.filter(item => portCode.includes(item.portCode))
			console.log('arr', arr)
			// 20211109不要portCode,只要ename和countryEname
			if (arr.length) {
				arr.forEach((ele, index) => {
					result += `${index ? ',' : ''}${ele.ename}${ele.countryEname ? ',' + ele.countryEname : ''}`
				})
			}
			console.log('result', result)
			return result || defaultName || ''
		},
		fillPolPort(portCodes) {
			// console.log(portCodes);
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
					this.portList = initPortData
					// console.log('this.portList', this.portList)
					console.log('data', data)

					this.createItem.orderInfo.bargePorPortName = this.getPortName(data, this.createItem.orderInfo.bargePorPortCode, this.createItem.orderInfo.bargePorPortName)
					this.createItem.orderInfo.polPortName = this.getPortName(data, this.createItem.orderInfo.polPortCode, this.createItem.orderInfo.polPortName)
					this.createItem.orderInfo.unloadingPortName = this.getPortName(data, this.createItem.orderInfo.unloadingPortCode, this.createItem.orderInfo.unloadingPortName)
					this.createItem.orderInfo.podPortName = this.getPortName(data, this.createItem.orderInfo.podPortCode, this.createItem.orderInfo.podPortName)
					this.createItem.orderInfo.transitPortName = this.getPortName(data, this.createItem.orderInfo.transitPortCode, this.createItem.orderInfo.transitPortName)
					// 新增或是复制提单的时候才会赋值，点开详情的无需赋值
					if (!this.createItem.blId && !this.createItem.orderInfo.deliveryPlace) {
						this.createItem.orderInfo.deliveryPlace = this.getPortName(data, this.createItem.orderInfo.podPortCode)
					}
					// 散货拼箱的卸货港取订单详情的目的地，大船起运港取收货地的值 20220221散货拼箱的卸货港取订单详情的卸货港
					// // 20220217起运港取订单详情的港口信息
					// if (['st03', 'st18'].includes(this.createItem.serviceType)) {
					// 	this.createItem.orderInfo.unloadingPortName = this.getPortName(data, this.createItem.orderInfo.podPortCode)
					// 	// this.getReceiptPlaceName(this.createItem.orderInfo.receiptPlace)
					// }
				})
			}
		},
		// 港口下拉数据
		transitPortSearch(queryString, portAttribute, state) {
			// if(type==='feederPolCode'&&!queryString){
			//   queryString=this.createItem.feederPolCityCode
			// }
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.portList = result
			})
		},
		// 驳船收货地
		porPortVisibleChange(val) {
			if (val) this.transitPortSearch('', 'port_of_feeder', this.state)
		},
		porPortFilterMehod(val) {
			this.transitPortSearch(val, 'port_of_feeder', this.state)
		},
		handleChangePorPortCode(val) {},
		// 大船起运港
		polPortVisibleChange(val) {
			if (val) this.transitPortSearch('', 'port_of_basic', this.state)
		},
		polPortFilterMehod(val) {
			this.transitPortSearch(val, 'port_of_basic', this.state)
		},
		handleChangePolPortCode(val) {},
		// 目的地
		podPortVisibleChange(val) {
			if (val) this.transitPortSearch('', 'port_of_destination', this.state)
		},
		podPortFilterMehod(val) {
			this.transitPortSearch(val, 'port_of_destination', this.state)
		},
		handleChangePodPortCode(val) {
			//this.initSystemLine(val)
		},
		// 卸货港
		unloadingPortVisibleChange(val) {
			if (val) this.transitPortSearch('', 'port_of_discharge', this.state)
		},
		unloadingPortFilterMehod(val) {
			this.transitPortSearch(val, 'port_of_discharge', this.state)
		},
		handleChangeUnloadingPortCode(val) {
			//this.initSystemLine(val)
		},
		// initSystemLine(key){
		//   portSystemLineInfo(key).then(response => {
		//     let systemLineList=response.data
		//     if(systemLineList.length>0){
		//       let systemLine=systemLineList[0]
		//       this.createItem.ship.sysLineCode = systemLine.sysLineCode
		//       this.sysLineName = systemLine.cname
		//       this.handleFillFreetimeSys()
		//     }
		//   })
		// },
		// 获取免用免堆信息
		// handleFillFreetimeSys() {
		//   let {polPortCode, podPortCode, sysLineCode, shipCarrierCode} = this.createItem.ship
		//   if (!polPortCode || !podPortCode || !sysLineCode || !shipCarrierCode) {
		//     return this.$message.error('请先选择起运港、目的地、航线、船司')
		//   }
		//   mainRouteFreeTime({
		//     polCode: this.createItem.ship.polPortCode,
		//     podCode: this.createItem.ship.podPortCode,
		//     sysLineCode: this.createItem.ship.sysLineCode,
		//     shipCarrierCode: this.createItem.ship.shipCarrierCode
		//   }).then(res => {
		//     this.createItem.ship.freetimeSys = res.data
		//   })
		// },
		portVisibleChange(val) {
			if (val) {
				this.transitPortSearch('', 'port_of_basic', this.state)
			}
		},
		portFilterMehod(val) {
			this.transitPortSearch(val, 'port_of_basic', this.state)
		},
		// 下拉选择
		handleChangeTransitPort(val) {
			Object.assign(this.createItem.orderInfo, {
				transitPortCode: val
			})
		},
		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch(queryString, cb) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then(data => {
				cb(data)
			})
		},
		// 船公司官网
		getShippingCarrierUrl(carrierCode) {
			if (!carrierCode) return
			this.$store.dispatch('order/getShippingCarrierWebUrl', { carrierCode })
		},
		// 获取船司黑名单
		getBlackUrlData() {
			if (this.createItem.orderInfo && this.createItem.orderInfo.shipCarrierCode) {
				getBlackUrl(this.createItem.orderInfo.shipCarrierCode).then(res => {
					if (res.data && res.data.length) {
						this.blackPopList = res.data
					} else {
						this.blackPopList = []
					}
				})
			} else {
				this.blackPopList = []
			}
		},
		// 船公司下拉
		shipCarrierVisibleChange(val) {
			if (val) {
				this.$store.dispatch('dict/baseShippingCarrierList', { name: '', state: 'valid' }).then(data => {
					this.shipCarrierOptions = data
				})
			}
		},
		shipCarrierFilterMehod(val) {
			this.$store.dispatch('dict/baseShippingCarrierList', { name: val, state: 'valid' }).then(data => {
				this.shipCarrierOptions = data
			})
		},
		handleChangeShipCarrier(val) {
			this.getBlackUrlData()
		},
		// // 船公司下拉列表自动补充的数据
		// shipQuerySearch(queryString, cb) {
		// 	this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString, state: 'valid' }).then(data => {
		// 		cb(data)
		// 	})
		// },
		// handleChangeShipCarrier(val) {
		// 	Object.assign(this.createItem.orderInfo, {
		// 		shipCarrierCode: val
		// 	})
		// },
		// handleSelectShipCarrier(item) {
		// 	Object.assign(this.createItem.orderInfo, {
		// 		shipCarrierCode: item.key
		// 	})
		// },
		// 运输条款
		getShipTerm() {
			this.$store.dispatch('dict/baseShipTermsList').then(data => {
				this.dictMap.transportTerm = data.map(item => {
					return Object.assign(item, {
						label: item.value,
						value: item.key
					})
				})
			})
		},
		handleNotifyClick(val) {
			this.notify = val
		},
		// 船名输入建议
		querySearchVessel(queryString, cb) {
			this.$store.dispatch('dict/queryVessleList', { name: queryString }).then(data => {
				cb(data)
			})
		},
		handleSelectVessel(value) {},
		handleClearVessel(value) {},
		// 航次输入建议
		querySearchVoyage(queryString, cb, vessel) {
			this.$store.dispatch('dict/queryVoyageList', { name: queryString, vessel: vessel }).then(data => {
				cb(data)
			})
		},
		handleSelectVoyage(value) {},
		handleClearVoyage(value) {},
		// 大船船名输入建议
		querySearchBookVessel(queryString, cb) {
			this.$store
				.dispatch('dict/queryBookVessle', {
					shipCarrierCode: this.createItem.orderInfo.shipCarrierCode,
					polPortCode: this.createItem.orderInfo.polPortCode,
					podPortCode: this.createItem.orderInfo.podPortCode,
					vessel: queryString
				})
				.then(data => {
					cb(data)
				})
				.catch(err => {})
		},
		handleSelectBookVessel(value) {},
		handleClearBookVessel(value) {},
		// 大船航次输入建议
		querySearchBookVoyage(queryString, cb, vessel) {
			this.$store
				.dispatch('dict/queryBookVoyage', {
					shipCarrierCode: this.createItem.orderInfo.shipCarrierCode,
					polPortCode: this.createItem.orderInfo.polPortCode,
					podPortCode: this.createItem.orderInfo.podPortCode,
					voyage: queryString,
					vessel: vessel
				})
				.then(data => {
					cb(data)
				})
		},
		handleSelectBookVoyage(value) {},
		handleClearBookVoyage(value) {},
		handleSearchVesselTime() {
			let { shipCarrierCode, vessel, voyage } = this.createItem.orderInfo
			let { polPortCode, podPortCode } = this.orderInfo.ship
			let param = {
				shipCarrierCode,
				polPortCode,
				podPortCode,
				vessel,
				voyage
			}
			// 20220223传参不变的话，不请求船期接口。优化减少请求次数
			if (Object.entries(this.vesselTimeParam).toString() === Object.entries(param).toString()) return
			this.$store.dispatch('dict/queryBookVessleTime', param).then(data => {
				this.vesselTimeParam = param
				this.vesselTime = data || {}
			})
		},
		querySearchPorPort(queryString, cb) {
			this.createItem.orderInfo.bargePorPortCode = null
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute: 'port_of_feeder', state: this.state, isEn: true }).then(data => {
				cb(data)
			})
		},
		handleSelectPort(value, type) {
			// if (['polPortCode', 'podPortCode'].includes(type)) {
			this.createItem.orderInfo[type] = value.portCode
			// }
		},
		handleClearPort(value, type) {
			this.createItem.orderInfo[type] = null
		},
		querySearchPolPort(queryString, cb) {
			this.createItem.orderInfo.polPortCode = null
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute: 'port_of_basic', state: this.state, isEn: true }).then(data => {
				cb(data)
			})
		},
		querySearchUnloadPort(queryString, cb) {
			this.createItem.orderInfo.unloadingPortCode = null
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute: 'port_of_discharge', state: this.state, isEn: true }).then(data => {
				cb(data)
			})
		},
		querySearchPodPort(queryString, cb) {
			this.createItem.orderInfo.podPortCode = null
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute: 'port_of_destination', state: this.state, isEn: true }).then(data => {
				cb(data)
			})
		},
		querySearchTransitPort(queryString, cb) {
			this.createItem.orderInfo.transitPortCode = null
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute: 'port_of_basic', state: this.state, isEn: true }).then(data => {
				cb(data)
			})
		}
	}
}
</script>

<style lang="scss">
// /deep/ .el-autocomplete-suggestion{
//   width: auto!important;
// }
.err-detail-dlg {
	.el-dialog__body {
		max-height: 400px !important;
	}
}
.port-autocomplete {
	width: 300px !important;
}
.seprate-line {
	display: inline-block;
	width: 10%;
	font-size: 12px;
	margin: 0;
	text-align: center;
}
#blInfo .notify {
	display: flex;
	justify-content: space-between;
	.notify-flex-row {
		display: flex;
		.lab {
			width: 110px;
			// padding: 0 5px 0 0;
			letter-spacing: -0.8px;
			cursor: pointer;
			&.flex1 {
				width: 90px;
			}
		}
	}
	.same {
		padding: 0;
		letter-spacing: -0.5px;
	}
}
// #blInfo .notify .lab {
// 	width: 110px;
// 	// padding: 0 5px 0 0;
// 	letter-spacing: -0.8px;
// 	cursor: pointer;
// 	&.flex1{
// 		width: 110px;
// 	}
// }
// #blInfo .notify .same {
// 	width: 140px;
// 	padding: 0 4px;
// 	letter-spacing: -0.8px;
// 	border: 1px solid #1890ff;
// 	color: #1890ff;
// 	// cursor: pointer;
// }
#blInfo .notify .lab.active {
	// border: 1px solid #dcdfe6;
	// border-top-left-radius: 4px;
	// border-top-right-radius: 4px;
	// border-bottom: 0;
	color: #1890ff;
	// font-weight: bold;
	position: relative;
	&::before {
		position: absolute;
		content: '';
		display: block;
		bottom: -1px;
		z-index: 1;
		left: 50%;
		width: 24px;
		margin-left: -12px;
		height: 1px;
		background-color: #1890ff;
	}
}
.row-flex#blInfo .flex-item {
	padding-bottom: 0px !important;
	&.vessel-time {
		.el-form-item__content {
			padding-right: 45px;
		}
		.vessel-time-popover {
			position: absolute;
			right: 0;
		}
	}
	&.webUrl {
		.el-form-item__content {
			padding-right: 70px;
		}
		.webUrl-btn {
			position: absolute;
			right: 0;
		}
	}
}
.row-flex#blInfo .flex-item .plus {
	font-size: 16px;
	color: #1890ff;
	line-height: 20px;
	cursor: pointer;
}
.clearBoth {
	clear: both;
}
.usa-abs {
	font-size: 12px;
	position: absolute;
	right: 0;
	top: 0;
	color: #1890ff;
	cursor: pointer;
}
.shipper-rel {
	position: relative;
	.el-icon-warning {
		z-index: 200;
		position: absolute;
		right: 18px;
		top: 50%;
		color: #f00;
	}
	.tip {
		position: absolute;
		z-index: 2;
		right: -205px;
		width: 200px;
		height: 60px;
		border: 1px solid #e9851f;
		border-radius: 2px;
		background-color: #fff8e6;
		top: 50%;
		margin-top: -30px;
		line-height: 18px;
		padding: 3px 8px;
		font-size: 12px;
		color: #333;
		&::before {
			content: '';
			display: block;
			position: absolute;
			background-color: #fff8e6;
			// border-radius: 2px;
			top: 50%;
			left: -5px;
			margin-top: -5px;
			width: 9px;
			height: 9px;
			border-width: 1px 1px 0 0;
			border-color: #e9851f;
			border-style: solid;
			transform: rotate(-135deg);
			z-index: 3;
		}
	}
	&.notify-rel {
		.tip {
			left: -205px;
			&::before {
				right: -5px;
				left: auto;
				transform: rotate(45deg);
			}
		}
	}
}
</style>
