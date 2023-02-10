<template>
  <div class="">
    <div class="orderbook-info-table">
      <div class="table-td">
        <div class="cont" :class="this.isOp ? 'op-cont' : this.isBd ? 'bd-cont' : ''">
          <div class="h1">
            <span class="label">港口信息</span>
            <div class="include-barge">
              <el-checkbox size="mini" v-model="includeFeederState" true-label="y" false-label="n" :disabled="disabledState" @change="handleChangeIncludeFeeder">包含驳船</el-checkbox>
            </div>
          </div>
          <div class="flex-form-item label90" :class="isTransitPortEdit ? 'pr24' : ''">
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
                    @visible-change="porPortVisibleChange"
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
            <el-form-item :required="false" label="装货港" prop="ship.roLoadingPortCode" :show-message="false" v-if="isOpView && isBulkRo && hasInternalTradeBarge">
              <div class="port-flex-form">
                <div class="port-code">
                  <el-select
                    key="roLoadingPortCode"
                    size="mini"
                    v-model="createItem.ship.roLoadingPortCode"
                    filterable
                    clearable
                    :disabled="disabledState && isView"
                    style="width: 100%"
                    placeholder="请输入"
                    :filter-method="roLoadingPortFilterMehod"
                    @visible-change="roLoadingPortVisibleChange"
                    @change="handleChangeRoLoadingPortCode"
                  >
                    <el-option v-for="item in roLoadingPortList" :key="item.value" :label="item.value" :value="item.value">
                      <span>{{ item.label }}</span>
                    </el-option>
                  </el-select>
                </div>
                <PortPopover :portItem="roLoadingPortItem" />
              </div>
            </el-form-item>
            <el-form-item :required="false" label="到货港" prop="ship.roArrivalPortCode" :show-message="false" v-if="isOpView && isBulkRo && hasInternalTradeBarge">
              <div class="port-flex-form">
                <div class="port-code">
                  <el-select
                    key="roArrivalPortCode"
                    size="mini"
                    v-model="createItem.ship.roArrivalPortCode"
                    filterable
                    clearable
                    :disabled="disabledState && isView"
                    style="width: 100%"
                    placeholder="请输入"
                    :filter-method="roArrivalPortFilterMehod"
                    @visible-change="roArrivalPortVisibleChange"
                    @change="handleChangeRoArrivalPortCode"
                  >
                    <el-option v-for="item in roArrivalPortList" :key="item.value" :label="item.value" :value="item.value">
                      <span>{{ item.label }}</span>
                    </el-option>
                  </el-select>
                </div>
                <PortPopover :portItem="roArrivalPortItem" />
              </div>
            </el-form-item>
            <el-form-item :required="true" label="大船起运港" prop="ship.polPortCode" :show-message="false">
              <div class="port-flex-form">
                <div class="port-code">
                  <el-select
                    key="polPortCode"
                    size="mini"
                    v-model="createItem.ship.polPortCode"
                    filterable
                    clearable
                    :disabled="disabledState"
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
            <el-form-item label="中转港1" prop="ship.transitPortCode" :show-message="false">
              <div class="port-flex-form">
                <div class="port-code">
                  <el-select
                    key="transitPortCode"
                    size="mini"
                    v-model="createItem.ship.transitPortCode"
                    filterable
                    clearable
                    :disabled="disabledState && isView"
                    style="width: 100%"
                    placeholder="请输入"
                    :filter-method="transitPortFilterMehod"
                    @visible-change="transitPortVisibleChange"
                    @change="handleChangeTransitPortCode"
                  >
                    <el-option v-for="item in transitPortList" :key="item.value" :label="item.value" :value="item.value">
                      <span>{{ item.label }}</span>
                    </el-option>
                  </el-select>
                </div>
                <PortPopover :portItem="transitPortItem" />
                <i class="el-icon-circle-plus-outline" @click="handleAddTransitPort" v-if="(!transitPortTwoShow || !transitPortOneShow) && !(disabledState && isView)"></i>
              </div>
            </el-form-item>
            <el-form-item label="中转港2" prop="ship.transitPortCode1" :show-message="false" v-if="transitPortOneShow">
              <div class="port-flex-form">
                <div class="port-code">
                  <el-select
                    key="transitPortCode1"
                    size="mini"
                    v-model="createItem.ship.transitPortCode1"
                    filterable
                    clearable
                    :disabled="disabledState && isView"
                    style="width: 100%"
                    placeholder="请输入"
                    :filter-method="transitPortFilterMehodOne"
                    @visible-change="transitPortVisibleChangeOne"
                    @change="handleChangeTransitPortCodeOne"
                  >
                    <el-option v-for="item in transitPortList1" :key="item.value" :label="item.value" :value="item.value">
                      <span>{{ item.label }}</span>
                    </el-option>
                  </el-select>
                </div>
                <PortPopover :portItem="transitPortItem1" />
                <i class="el-icon-remove-outline" @click="handleDeleteOne" v-if="!(disabledState && isView)"></i>
              </div>
            </el-form-item>
            <el-form-item label="中转港3" prop="ship.transitPortCode2" :show-message="false" v-if="transitPortTwoShow">
              <div class="port-flex-form">
                <div class="port-code">
                  <el-select
                    key="transitPortCode2"
                    size="mini"
                    v-model="createItem.ship.transitPortCode2"
                    filterable
                    clearable
                    :disabled="disabledState && isView"
                    style="width: 100%"
                    placeholder="请输入"
                    :filter-method="transitPortFilterMehodTwo"
                    @visible-change="transitPortVisibleChangeTwo"
                    @change="handleChangeTransitPortCodeTwo"
                  >
                    <el-option v-for="item in transitPortList2" :key="item.value" :label="item.value" :value="item.value">
                      <span>{{ item.label }}</span>
                    </el-option>
                  </el-select>
                </div>
                <PortPopover :portItem="transitPortItem2" />
                <i class="el-icon-remove-outline" @click="handleDeleteTwo" v-if="!(disabledState && isView)"></i>
              </div>
            </el-form-item>
            <el-form-item :required="true" label="卸货港" prop="ship.unloadingPortCode" :show-message="false">
              <div class="port-flex-form">
                <div class="port-code">
                  <el-select
                    size="mini"
                    v-model="createItem.ship.unloadingPortCode"
                    filterable
                    clearable
                    :disabled="disabledState"
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
                    :disabled="disabledState && isView"
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
            <el-form-item :required="true" label="系统航线" prop="ship.sysLineCode" :show-message="false">
              <el-input clearable size="mini" placeholder="请输入" v-model="sysLineName" disabled></el-input>
            </el-form-item>
            <el-form-item label="国家" :show-message="false">
              <el-input type="text" clearable size="mini" placeholder="请输入" v-model="countryName" disabled></el-input>
            </el-form-item>
            <el-form-item label="驳船中转方式" prop="barge.transitWay" :show-message="false" v-if="isIncludeFeeder">
              <el-select v-model="createItem.barge.transitWay" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
                <el-option v-for="item in dictMap.transferMode" :label="item.label" :value="item.value" :key="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="中转方式" prop="ship.transitWay" :show-message="false">
              <el-select v-model="createItem.ship.transitWay" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
                <el-option v-for="item in dictMap.mainRouteTransferMode" :label="item.label" :value="item.value" :key="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :required="contractRequired && isBd" label="合约号" prop="ship.contractNo" :show-message="false" v-if="contractShow">
              <el-input clearable size="mini" placeholder="请输入" v-model="createItem.ship.contractNo" :disabled="disabledState" @blur="handleClearEmptyString('contractNo', $event)" maxlength="128"></el-input>
            </el-form-item>
            <el-form-item :required="contractRequired && isBd" label="合约公司" prop="ship.contractCompany" :show-message="false" v-if="contractShow">
              <el-input clearable size="mini" placeholder="请输入" v-model="createItem.ship.contractCompany" :disabled="disabledState" @blur="handleClearEmptyString('contractCompany', $event)" maxlength="128"></el-input>
            </el-form-item>
            <el-form-item label="承运人航线" prop="ship.carrierLineName" :show-message="false" v-if="isOpView">
              <el-input clearable size="mini" placeholder="请输入" v-model="createItem.ship.carrierLineName" disabled></el-input>
            </el-form-item>
            <el-form-item label="航线代码" prop="ship.carrierService" :show-message="false" v-if="isOpView">
              <el-input clearable size="mini" placeholder="请输入" v-model="createItem.ship.carrierService" disabled></el-input>
            </el-form-item>
            <!-- disabledState -->
            <!-- 业务自拿价的免用免堆开放编辑且必填 -->
            <el-form-item :required="freetimeSysEdit" label="免用免堆信息" prop="ship.freetimeSys" :show-message="false">
              <el-input type="textarea" clearable rows="4" size="mini" placeholder="请输入" maxlength="512" show-word-limit v-model="createItem.ship.freetimeSys" :disabled="!freetimeSysEdit" @blur="handleClearEmptyString('freetimeSys', $event)"></el-input>
            </el-form-item>
          </div>
        </div>
      </div>
      <div class="table-td">
        <div class="cont" :class="this.isOp ? 'op-cont' : this.isBd ? 'bd-cont' : ''">
          <div class="h1">
            <span class="label">船东信息</span>
          </div>
          <div class="flex-form-item">
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
                @select="value => handleSelectVessel(value)"
                @clear="value => handleClearVessel(value)"
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
                @select="value => handleSelectVoyage(value)"
                @clear="value => handleClearVoyage(value)"
              ></el-autocomplete>
            </el-form-item>
            <div class="vessel-voyage-item" v-if="isOpView">
              <div class="flex1">
                <el-form-item label="大船船名" prop="ship.vessel" :show-message="false" >
                  <vessel-select
                    v-model="createItem.ship.vessel"
                    :orderNo="$route.query.orderNo"
                    :disabledState="disabledState && isView && !(isCscEdit && $route.query.source === 'orderList')"
                    :shipCarrierCode="createItem.ship.shipCarrierCode"
                    :polPortCode="createItem.ship.polPortCode"
                    :podPortCode="createItem.ship.podPortCode"
                    :copyBtnHide="true"
                  />
                </el-form-item>
                <el-form-item label="大船航次" prop="ship.voyage" :show-message="false">
                  <voyage-select
                    v-model="createItem.ship.voyage"
                    :disabledState="disabledState && isView && !(isCscEdit && $route.query.source === 'orderList')"
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
            <el-form-item :required="true" label="船公司" prop="ship.shipCarrierCode" :show-message="false" class="vessel-time">
              <el-select
                size="mini"
                v-model="createItem.ship.shipCarrierCode"
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
              <el-button type="default" size="mini" style="margin-left: 5px;" @click="getShippingCarrierUrl(createItem.ship.shipCarrierCode)">船司官网</el-button>
            </el-form-item>
            <el-form-item class="timeSpecial" label="驳船截关时间" prop="barge.cyCutOff" :show-message="false" v-if="isIncludeFeeder">
              <elDatePickerLimit size="mini" :field="'bargeCyCutOff'" v-model="createItem.barge.cyCutOff" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd"  :disabled="disabledState && isView" />
            </el-form-item>
            <template v-if="!isBulkRo">
              <el-form-item class="timeSpecial" :required="true" label="驳船预计开船时间" prop="barge.etdTime" :show-message="false" v-if="isIncludeFeeder">
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
            </template>
            <template v-if="isBulkRo">
              <el-form-item class="timeSpecial" :required="isBdEdit" label="驳船预计开船时间" prop="barge.etdTime" :show-message="false" v-if="isIncludeFeeder || isOpView && hasInternalTradeBarge">
                <elDatePickerLimit
                  :field="'bargeEtdTime'"
                  size="mini"
                  v-model="createItem.barge.etdTime"
                  type="date"
                  style="width: 100%"
                  clearable
                  placeholder="请选择"
                  value-format="yyyy-MM-dd"
                  :disabled="!isDocEdit && disabledState && isView && !lineCsJointIsEdit"
                />
              </el-form-item>
              <el-form-item class="timeSpecial" label="驳船实际开船时间" prop="barge.tdTime" :show-message="false" v-if="isOpView && (isIncludeFeeder || hasInternalTradeBarge)">
                <elDatePickerLimit noCanFuture :field="'bargeTdTime'" size="mini" v-model="createItem.barge.tdTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="!isDocEdit && disabledState && isView && !lineCsJointIsEdit && !isCscEdit" />
              </el-form-item>
            </template>
            <!-- <el-form-item class="timeSpecial" label="驳船预计到港时间" prop="barge.etaTime" :show-message="false" v-if="isOpView && isIncludeFeeder && isBulkRo && hasInternalTradeBarge">
              <elDatePickerLimit size="mini" v-model="createItem.barge.etaTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="disabledState && isView" />
            </el-form-item>
            <el-form-item class="timeSpecial" label="驳船实际到港时间" prop="barge.taTime" :show-message="false" v-if="isOpView && isIncludeFeeder && isBulkRo && hasInternalTradeBarge">
              <elDatePickerLimit size="mini" v-model="createItem.barge.taTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="disabledState && isView" />
            </el-form-item> -->
            <el-form-item class="timeSpecial" :required="true" label="大船截关时间" prop="ship.cyCutOff" :show-message="false">
              <elDatePickerLimit
                :field="'cyCutOff'"
                size="mini"
                v-model="createItem.ship.cyCutOff"
                type="date"
                style="width: 100%"
                clearable
                placeholder="请选择"
                value-format="yyyy-MM-dd"
                :disabled="disabledState && isView && !lineCsJointIsEdit"
                @change="handleChangeCyCutOff"
              />
            </el-form-item>
            <el-form-item class="timeSpecial vessel-time" :required="true" label="大船预计开船时间" prop="ship.etdTime" :show-message="false">
              <elDatePickerLimit
                :field="'etdTime'"
                size="mini"
                v-model="createItem.ship.etdTime"
                type="date"
                style="width: 100%"
                clearable
                :disabled="(!isDocEdit && disabledState && isView && !lineCsJointIsEdit) || (includeFeederState==='n' && finIsCloseStatus)"
                placeholder="请选择"
                value-format="yyyy-MM-dd"
                @change="handleChangeEtdTime"
              />
              <el-popover placement="top" width="280" trigger="click" class="vessel-time-popover" v-if="!disabledState || isDocEdit || !isView">
                <Schedule :vesselTime="vesselTime" 
                  :etdTimeDisabled="!isDocEdit && disabledState && isView && !lineCsJointIsEdit" 
                  :tdTimeDisabled="isBd || !isDocEdit && disabledState && isView && !lineCsJointIsEdit && !isCscEdit"
                  :etaTimeDisabled="isBd || !(isDocEdit && !isJoint) && disabledState && isView"
                  :taTimeDisabled="isBd || disabledState && isView"
                  @updateVesselTime="updateVesselTime"/>
                <el-button slot="reference" type="default" size="mini" @click="handleSearchVesselTime">查询</el-button>
              </el-popover>
            </el-form-item>
            <el-form-item class="timeSpecial vessel-time" label="大船实际开船时间" prop="ship.tdTime" :show-message="false" v-if="isOpView || isDoc || isCsc || !ordDetRole">
              <elDatePickerLimit noCanFuture :field="'tdTime'" size="mini" v-model="createItem.ship.tdTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="(!isDocEdit && disabledState && isView && !lineCsJointIsEdit  && !isCscEdit) || (includeFeederState==='n' && finIsCloseStatus)" />
              <el-popover placement="top" width="280" trigger="click" class="vessel-time-popover" v-if="!disabledState || isDocEdit || isCscEdit || !isView">
                <Schedule :vesselTime="vesselTime" 
                  :etdTimeDisabled="!isDocEdit && disabledState && isView && !lineCsJointIsEdit" 
                  :tdTimeDisabled="!isDocEdit && disabledState && isView && !lineCsJointIsEdit && !isCscEdit"
                  :etaTimeDisabled="!(isDocEdit && !isJoint) && disabledState && isView"
                  :taTimeDisabled="disabledState && isView"
                  @updateVesselTime="updateVesselTime" />
                <el-button slot="reference" type="default" size="mini" @click="handleSearchVesselTime">查询</el-button>
              </el-popover>
            </el-form-item>
            <el-form-item class="timeSpecial" label="预计到港时间" prop="ship.etaTime" :show-message="false" v-if="isOpView || isDoc || !ordDetRole">
              <elDatePickerLimit size="mini" :field="'etaTime'" v-model="createItem.ship.etaTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="!(isDocEdit && !isJoint) && disabledState && isView" />
            </el-form-item>
            <el-form-item class="timeSpecial" label="实际到港时间" prop="ship.taTime" :show-message="false" v-if="isOpView || isDoc || !ordDetRole">
              <elDatePickerLimit noCanFuture :field="'taTime'" size="mini" v-model="createItem.ship.taTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="!(isDocEdit && !isJoint) && disabledState && isView" />
            </el-form-item>
            <el-form-item class="timeSpecial" label="客户要求到港时间" prop="ship.taTimeCust" :show-message="false" v-if="isOpView || isDoc || !ordDetRole">
              <elDatePickerLimit :field="'taTimeCust'" size="mini" v-model="createItem.ship.taTimeCust" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="disabledState && isView" />
            </el-form-item>
            <el-form-item class="timeSpecial" label="截补料时间" prop="ship.siCutOff" :show-message="false" v-if="(isOpView || isDoc) && !isBulkRo" :required="isBookRelease && isOpTrue && !(!(isDocEdit && !isJoint) && disabledState && isView)">
              <elDatePickerLimit
                :field="'siCutOff'"
                size="mini"
                v-model="createItem.ship.siCutOff"
                type="datetime"
                style="width: 100%"
                clearable
                :popper-class="'hideMinute'"
                placeholder="请选择"
                format="yyyy-MM-dd HH"
                value-format="yyyy-MM-dd HH"
                :disabled="!(isDocEdit && !isJoint) && disabledState && isView"
              />
            </el-form-item>
            <el-form-item class="timeSpecial" label="截VGM时间" prop="ship.vgmCutOff" :show-message="false" v-if="isOpView && !isBulkRo" :required="isBookRelease && isOpTrue && !(disabledState && isView)">
              <elDatePickerLimit
                :field="'vgmCutOff'"
                size="mini"
                v-model="createItem.ship.vgmCutOff"
                type="datetime"
                style="width: 100%"
                clearable
                :popper-class="'hideMinute'"
                placeholder="请选择"
                format="yyyy-MM-dd HH"
                value-format="yyyy-MM-dd HH"
                :disabled="disabledState && isView"
              />
            </el-form-item>
            <el-form-item label="VGM类型" prop="ship.vgmType" :show-message="false" v-if="isOpView && !isBulkRo" :required="isBookRelease && isOpTrue && !(disabledState && isView)">
              <el-select v-model="createItem.ship.vgmType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState && isView">
                <el-option v-for="(item, index) in dictMap.vgmType" :label="item.label" :value="item.value" :key="index"> </el-option>
              </el-select>
            </el-form-item>
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
                :disabled="disabledState && isView"
              />
            </el-form-item>
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
                :disabled="disabledState && isView"
              />
            </el-form-item>
            <el-form-item label="船东参考号" prop="shipRefNo" :show-message="false" v-if="isOpView">
              <el-input clearable size="mini" placeholder="请输入" v-model="createItem.shipRefNo" :disabled="disabledState"></el-input>
            </el-form-item>
            <el-form-item label="委托备注" prop="intrustRemark" :show-message="false">
              <el-input type="textarea" rows="4" size="mini" maxlength="512" show-word-limit placeholder="请输入" v-model="createItem.intrustRemark" :disabled="disabledState"> </el-input>
            </el-form-item>
          </div>
        </div>
      </div>
      <div class="table-td">
        <div class="cont" :class="this.isOp ? 'op-cont' : this.isBd ? 'bd-cont' : ''">
          <div class="h1">
            <span class="label">货运信息</span>
          </div>
          <div class="flex-form-item label100">
            <el-form-item label="贸易条款" prop="transport.tradeTermsCode" :show-message="false">
              <el-select v-model="createItem.transport.tradeTermsCode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState && tradeTermsDisabledState">
                <el-option v-for="item in dictMap.tradeTermsCode" :label="item.label" :value="item.value" :key="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :required="true" label="运输条款" prop="transport.transportTerm" :show-message="false">
              <el-select v-model="createItem.transport.transportTerm" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
                <el-option v-for="(item, index) in dictMap.shipTerms" :label="item.label" :value="item.value" :key="index"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :required="true" label="付款方式" prop="payMode" :show-message="false">
              <el-select v-model="createItem.payMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
                <el-option v-for="(item, index) in dictMap.payMode" :label="item.label" :value="item.value" :key="index"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="中转费付款方式" prop="transitPayMode" :show-message="false">
              <el-select v-model="createItem.transitPayMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState">
                <el-option v-for="(item, index) in dictMap.transitPayMode" :label="item.label" :value="item.value" :key="index"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="出单方式" prop="ship.blMode" :show-message="false">
              <el-select v-model="createItem.ship.blMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState && isView">
                <el-option v-for="(item, index) in dictMap.blMode" :label="item.label" :value="item.value" :key="index"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="提单类型" prop="ship.blType" :show-message="false">
              <el-select v-model="createItem.ship.blType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="isView">
                <el-option v-for="(item, index) in dictMap.blType" :label="item.label" :value="item.value" :key="index"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :required="true" label="放舱要求" prop="ship.issueMode" :show-message="false">
              <el-select v-model="createItem.ship.issueMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState" @change="handleChangeIssueMode">
                <el-option v-for="(item, index) in dictMap.issueMode" :label="item.label" :value="item.value" :key="index"> </el-option>
              </el-select>
            </el-form-item>
            <!-- 散杂滚装不维护该字段 -->
            <el-form-item label="是否申请不甩柜" prop="ship.isNodrop" :show-message="false" v-if="!isBulkRo">
              <el-select
                v-model="createItem.ship.isNodrop"
                size="mini"
                clearable
                placeholder="请选择"
                :class="{
                  'width-less-72-px': isShowNoDropMailSend,
                  'width-100-px': !isShowNoDropMailSend
                }"
                :disabled="isTrackDisabled || isWhiteCust && !['draft','refuse'].includes(this.orderStatus)"
              >
                <el-option v-for="(item, index) in dictMap.yesOrNoOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
              </el-select>
              <el-button v-if="isShowNoDropMailSend" type="default" size="mini" class="vessel-time-popover" @click="noDropSendMailClick">邮件发送</el-button>
            </el-form-item>
            <el-form-item label="拿价类型" prop="ship.priceType" :show-message="false" v-if="createItem.serviceList.includes('book')" :required="true">
              <!-- <el-radio-group v-model="createItem.ship.priceType" @change="handleChangePriceType">
								<el-radio :label="item.value" :disabled="disabledState" v-for="(item, index) in dictMap.priceType" :key="index">{{item.label}}</el-radio>
							</el-radio-group> -->
              <el-select v-model="createItem.ship.priceType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState" @change="handleChangePriceType">
                <el-option v-for="(item, index) in dictMap.priceType" :label="item.label" :value="item.value" :key="index"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="是否线上" prop="isOnline" :show-message="false" v-if="(isOpView || !ordDetRole) && !isBulkRo">
              <el-radio-group v-model="createItem.isOnline" :disabled="true">
                <el-radio :label="item.value" :disabled="true" v-for="(item, index) in isOnlineOptions" :key="index">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="付款分公司" prop="payCompanyCode" :show-message="false" v-if="(isOpView || !ordDetRole) && !isBulkRo">
              <el-select v-model="createItem.payCompanyCode" size="mini" clearable filterable placeholder="请选择" style="width: 100%" :disabled="true" @change="handleChnageCompany">
                <el-option v-for="(item, index) in payCompanyOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="订舱代理" prop="ship.bkgAgentSupplierName" :show-message="false" v-if="showBkgAgentSupplier || !ordDetRole">
              <el-input clearable size="mini" placeholder="请输入" v-model="createItem.ship.bkgAgentSupplierName" :disabled="disabledState"></el-input>
            </el-form-item>
            <el-form-item class="bizDate" label="业务日期" prop="bizDate" :show-message="false" v-if="isOpView">
              <elDatePickerLimit
                size="mini"
                :style="{
                  width: showChangeBizDate ? 'calc(100% - 47px)' : '100%',
                  marginRight: showChangeBizDate ? '5px' : '0'
                }"
                v-model="createItem.bizDate"
                type="date"
                style="width: 100%"
                clearable
                placeholder="请选择"
                value-format="yyyy-MM-dd"
                :disabled="true"
              />
              <el-button v-if="showChangeBizDate" @click="handleChangeBizDate" size="mini">修改</el-button>
            </el-form-item>
            <el-form-item label="航程跟踪" prop="ship.isTrack" :show-message="false" v-if="isOpTrue">
              <el-select v-model="createItem.ship.isTrack" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="isView">
                <el-option v-for="(item, index) in dictMap.yesOrNoOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :required="true" label="最终目的地" prop="transport.destinationArea" :show-message="false" v-if="show">
              <el-input size="mini" placeholder="请输入" clearable v-model="createItem.transport.destinationArea" :disabled="disabledState" @blur="handleClearEmptyString('destinationArea', $event)"></el-input>
            </el-form-item>
            <el-form-item :required="true" label="交货详细地点" prop="transport.deliveryPlace" :show-message="false" v-if="show">
              <el-input size="mini" placeholder="请输入" clearable v-model="createItem.transport.deliveryPlace" :disabled="disabledState" @blur="handleClearEmptyString('deliveryPlace', $event)"></el-input>
            </el-form-item>
            <el-form-item label="审单备注" prop="auditRemark" :show-message="false" v-if="isOpView">
              <el-input @dblclick.native="showAuditDetail" type="textarea" clearable rows="2" size="mini" placeholder="请输入" maxlength="128" show-word-limit v-model="createItem.auditRemark" :disabled="disabledState"></el-input>
            </el-form-item>
            <el-form-item label="订舱备注" prop="bkgRemark" :show-message="false" v-if="isOpView">
              <el-input @dblclick.native="showBkgRemarkDetail" type="textarea" clearable rows="2" size="mini" placeholder="请输入" v-model="createItem.bkgRemark" :disabled="disabledState"></el-input>
            </el-form-item>
            <el-form-item label="备注" prop="bdRemark" :show-message="false" v-if="$route.query.source !== 'jointList'">
              <el-input class="loadingBdRemark" type="textarea" clearable rows="4" size="mini" placeholder="请输入" maxlength="512" show-word-limit v-model="createItem.bdRemark" @blur="handleSaveRemark" :disabled="!bdRemarkState"></el-input>
            </el-form-item>
          </div>
        </div>
      </div>
    </div>

    <div v-if="auditVisible">
      <AuditRemark :auditRemark="createItem.auditRemark" @close="auditClose" />
    </div>
    <div v-if="bkgRemarkVisible">
      <BkgRemark :bkgRemark="createItem.bkgRemark" @close="bkgRemarkClose" />
    </div>
    <div v-if="sendMailPopShow">
      <Mail :orderInfoData="orderInfoData" @close="sendMailPopClose" />
    </div>
    <div v-if="changeBizDateShow">
      <!-- <ChangeBizDatePop @close="changeBizDateClose" :bizDate="createItem.bizDate"></ChangeBizDatePop> -->
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import clip from '@/utils/clipboard'
import { portSystemLineInfo, baseSystemLineInfo, baseDeptSettleList } from '@/api/base'
import { mainRouteFreeTime } from '@/api/charge'
import PortPopover from './portPopover'
import Schedule from './schedule'
import AuditRemark from '@/views/order/order/orderList/components/auditRemark'
import BkgRemark from '@/views/order/order/orderList/components/bkgRemark'
import Mail from './noDropSendMail.vue'
import VesselSelect from '@/views/order/order/components/vesselSelect'
import VoyageSelect from '@/views/order/order/components/voyageSelect'
// import ChangeBizDatePop from '@/views/airTransport/order/orderList/components/changeBizDatePop'
import { bizdateChange } from '@/api/order/list'

export default {
  data() {
    return {
      auditVisible: false,
      bkgRemarkVisible: false,
      changeBizDateShow: false,
      bizDateModify: this.$store.state.order.orderInfoDataObj.bizDateModify,
      transitPortOneShow: false,
      transitPortTwoShow: false,
      porPortItem: {},
      polPortItem: {},
      roLoadingPortItem: {},
      roArrivalPortItem: {},
      unloadPortItem: {},
      podPortItem: {},
      transitPortItem: {},
      transitPortItem1: {},
      transitPortItem2: {},
      podPortList: [],
      unloadPortList: [],
      porPortList: [],
      polPortList: [],
      roLoadingPortList: [],
      roArrivalPortList: [],
      transitPortList: [],
      transitPortList1: [],
      transitPortList2: [],
      selectListData: [], // 已选中的下拉数据
      state: 'valid',
      isEdit: false,
      oQuery: this.$route.query,
      sysLineName: '',
      transitPortOptions: [],
      transportTermOptions: [],
      // portList: [],
      pickerOptions: {
        disabledDate(date) {
          //disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
          // return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      },
      includeFeederState: '', // 是否包含驳船
      tradeTermsCode: ['DDP', 'DDU'],
      // contractShow: true,
      // contractRequired: false //  服务项有代订舱合约号，合约公司必填标识
      countryName: '',
      shipCarrierOptions: [],
      vesselTime: {},
      vesselTimeParam: {}, // 保存船期请求后的传参
      freetimeSysParam: {}, // 保存免用免堆请求后的传参
      sendMailPopShow: false,
      orderInfoData: {},
      isOnlineOptions: [
        { label: '线上', value: 'Y' },
        { label: '线下', value: 'N' }
      ],
      payCompanyOptions: []
    }
  },
  props: {
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
    sysLineCname: {
      type: String,
      default: ''
    },
    containerTotal: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    this.fillPolPort(this.fillPortCodes)
    this.getCompanyList()
  },
  mounted() {
    if (!this.createItem.transport.transportTerm) {
      this.$set(this.createItem.transport, 'transportTerm', 'CY/CY')
    }
    // if(!this.createItem.ship.freetimeSys){
    // 	this.$set(this.createItem.ship,'freetimeSys','无需求')
    // }
    console.log('🚀 ~ this.createItem.ship.transitPortCode', this.createItem.ship.transitPortCode)
  },

  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      ordDetRole: state => state.order.orderList.ordDetRole,
      userEditRoles: state => state.order.orderList.userEditRoles,
      orderInfoDataObj: state => state.order.orderInfoDataObj
    }),
    finIsCloseStatus() {
      return this.orderInfoDataObj.finCloseStatus === 'yes'
    },
    showChangeBizDate() {
      if (this.ordDetRole === 'op' && this.orderInfoDataObj.orderStatus !== 'complete' && this.orderInfoDataObj.finCloseStatus !== 'yes' && this.bizDateModify === null && ['st02', 'st16', 'st17', 'st04', 'st19', 'st10', 'st12'].includes(this.orderInfoDataObj.serviceType)) {
        return true
      } else {
        return false
      }
    },
    isEpricing() {
      return this.ordDetRole === 'epricing'
    },
    isEcs() {
      return this.ordDetRole === 'ecs'
    },
    isIncludeFeeder() {
      return this.includeFeeder === 'y' ? true : false
    },
    disabledState() {
      return this.isOp || this.isView
    },
    tradeTermsDisabledState() {
      // 贸易单证
      if (this.isEpricing || this.isEcs) {
        if (!['pass'].includes(this.orderStatus)) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    isTrackDisabled() {
      return this.isView
    },
    bdRemarkState() {
      if (['draft', 'refuse', 'pass', 'complete'].includes(this.orderStatus)) {
        return true
      }
      return false
    },
    // 航线客服在协同单可编辑
    lineCsJointIsEdit() {
      return (this.userEditRoles.includes('line_cs') || this.userEditRoles.includes('doc') || this.userEditRoles.includes('csc')) && this.$route.query.source === 'jointList'
    },
    isAc() {
      return this.ordDetRole === 'ac'
    },
    isDoc() {
      return this.ordDetRole === 'doc'
    },
    isBkg() {
      return this.ordDetRole === 'bkg'
    },
    isCsc() {
      return this.ordDetRole === 'csc'
    },
    isCscEdit() {
      return this.ordDetRole === 'csc' && this.orderStatus === 'pass'
    },
    isDocEdit() {
      return this.ordDetRole === 'doc' && this.orderStatus === 'pass'
    },
    isOpEdit() {
      return this.ordDetRole === 'op' && this.orderStatus === 'pass'
    },
    isOpTrue() {
      return this.ordDetRole === 'op'
    },
    isOp() {
      // bd,审核通过的视角同op的一样
      if (this.ordDetRole === 'bd' && this.orderStatus === 'pass') {
        return true
      }
      // op,doc,ac视角一致
      if (this.ordDetRole === 'op' || this.ordDetRole === 'doc' || this.ordDetRole === 'ac' || this.ordDetRole === 'op_truck' || this.ordDetRole === 'bkg') {
        return true
      }
      return false
    },
    // 操作视图
    isOpView() {
      return this.isBd && ['pass','break','cancel'].includes(this.orderStatus) || this.isBkg || this.isOpTrue || this.isOpTruck || this.isDoc || this.isCsc || this.isAc || this.isEpricing || this.isEcs || !this.ordDetRole
      // return this.orderStatus === 'pass'
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
    isBdEdit() {
      return this.isBd && ['draft', 'refuse'].includes(this.orderStatus)
    },
    isView() {
      // doc，ac,op_truck角色，或者是协同单的都置灰,只读
      if (!this.ordDetRole || this.isDoc || this.isAc || this.isOpTruck || this.isEpricing || this.isEcs || this.isCsc || this.isBkg || this.$route.query.source === 'jointList') {
        return true
      }
      // bd角色，除了草稿和拒绝状态的都置灰，只读
      if (this.isBd && !['draft', 'refuse'].includes(this.orderStatus)) {
        return true
      }
      // op角色，除了审核通过的都置灰
      if (this.isOp && !['pass'].includes(this.orderStatus)) {
        return true
      }
      // if ((this.isEpricing||this.isEcs ) && !['pass'].includes(this.orderStatus)) {
      // 		return false
      // }
      return false
    },
    isJoint() {
      return this.$route.query.source === 'jointList'
    },
    contractShow() {
      return this.createItem.serviceList.includes('book') ? false : true
    },
    contractRequired() {
      return this.createItem.serviceList.includes('proxy_book') ? true : false
    },
    show() {
      return this.createItem.transport.tradeTermsCode && this.tradeTermsCode.includes(this.createItem.transport.tradeTermsCode.toUpperCase())
    },
    isCopyRequired() {
      return this.$route.query.action === 'copy'
    },
    // 中转港编辑权限： bd草稿，审核拒绝可编辑,op审核通过可以编辑；其他不可编辑
    isTransitPortEdit() {
      if (['draft', 'refuse'].includes(this.orderStatus)) {
        return true
      }
      if (['pass'].includes(this.orderStatus) && this.ordDetRole === 'op') {
        return true
      }
      return false
    },
    shipObj() {
      return this.$store.state.order.orderInfoDataObj.ship || {}
    },
    isShowNoDropMailSend() {
      return (
        !this.isTrackDisabled && // 申请不甩柜下拉框可编辑状态
        this.ordDetRole === 'op' && // 操作 角色才能
        !this.shipObj.dropEmailMessageNo && // 已发送邮件标识 没值 代表没发送过邮件
        this.shipObj.isNodrop === 'y' && // 是否申请不甩柜下拉框选择了 是
        this.createItem.serviceList.includes('book')
      ) // 服务项选择了 订舱
    },
    // 是否白名单
		isWhiteCust() {
			return this.orderInfoDataObj.isWhiteCust === 'Y'
		},
    isBookRelease() {
      // 订舱状态为 已放舱
      return this.createItem.bkgStatus === 'book_release'
    },
    // 散杂滚装
    isBulkRo() {
      return this.orderInfoDataObj.businessType === 'ship_bulk_ro'
    },
    hasInternalTradeBarge() {
      return this.createItem.serviceList.includes('internal_trade_barge')
    },
    // 免用免堆可编辑-业务自拿价、业务代订舱；商务自拿价的船司为MAERSK的放开编辑且必填
    freetimeSysEdit() {
      return this.isBdEdit && (this.createItem.ship.priceType === 'bd' || this.contractRequired || this.createItem.ship.priceType === 'pricing' && this.createItem.ship.shipCarrierCode === 'MAERSK')
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
    includeFeeder: {
      handler(newVal) {
        this.includeFeederState = newVal
        console.log('this.includeFeederState', this.includeFeederState)
      },
      deep: true,
      immediate: true
    }
    // createItem: {
    // 	handler(newVal) {
    // 		this.contractShow = newVal.serviceList.includes('book') ? false : true
    // 		this.contractRequired = newVal.serviceList.includes('proxy_book') ? true : false
    // 	},
    // 	deep: true
    // }
  },
  components: {
    PortPopover,
    Schedule,
    Mail,
    VesselSelect,
    VoyageSelect,
    ChangeBizDatePop,
    AuditRemark,
    BkgRemark
  },
  methods: {
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
      if (['destinationArea', 'deliveryPlace'].includes(char)) {
        this.$set(this.createItem.transport, char, e.target.value.replace(/^\s+|\s+$/g, ''))
      } else {
        this.$set(this.createItem.ship, char, e.target.value.replace(/^\s+|\s+$/g, ''))
      }
    },
    // 船期查询结果直接填入订单详情
    updateVesselTime(val, key) {
      this.createItem.ship[key] = val
    },
    showAuditDetail() {
      this.auditVisible = true
      // console.log('🚀 ~ this.auditVisible', this.auditVisible)
    },
    showBkgRemarkDetail() {
      this.bkgRemarkVisible = true
    },
    auditClose() {
      this.auditVisible = false
    },
    bkgRemarkClose() {
      this.bkgRemarkVisible = false
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
              .then(res => {
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
    // 获取所有公司
    getCompanyList() {
      baseDeptSettleList().then(res => {
        this.payCompanyOptions = res.data.map(item => {
          return { ...item, label: item.deptCname, value: item.deptCode }
        })
      })
    },
    handleChnageCompany(val) {
      let findItem = this.payCompanyOptions.find(item => item.deptCode === val)
      this.createItem.payCompanyName = findItem ? findItem.label : ''
    },
    // 船公司官网
    getShippingCarrierUrl(carrierCode) {
      if (!carrierCode) return
      this.$store.dispatch('order/getShippingCarrierWebUrl', { carrierCode })
    },
    handleChangePriceType(val) {
      // 选择业务自拿价自动匹配航线经理（pricing）
      if (val === 'bd') {
        this.$emit('priceTypeIsBd')
      } else {  // 切换到商务拿价，重新获取运价免用免堆
        this.$set(this.createItem.ship, 'freetimeSys', '')
        this.handleFillFreetimeSys(false, true)
      }
    },
    // 添加中转港
    handleAddTransitPort() {
      if (!this.transitPortOneShow) {
        this.transitPortOneShow = true
      } else if (this.transitPortOneShow && !this.transitPortTwoShow) {
        this.transitPortTwoShow = true
      }
    },
    // 删除中转港2
    handleDeleteOne() {
      this.transitPortOneShow = false
      this.createItem.ship.transitPortCode1 = ''
      this.transitPortItem1 = {}
    },
    // 删除中转港3
    handleDeleteTwo() {
      this.transitPortTwoShow = false
      this.createItem.ship.transitPortCode2 = ''
      this.transitPortItem2 = {}
    },
    //保存编辑备注
    handleSaveRemark() {
      this.$emit('saveRemark')
    },
    // 切换是否包含驳船
    handleChangeIncludeFeeder(val) {
      // this.includeFeederState = val
      this.$emit('change', val)
      this.handleFillFreetimeSys(val !== 'y')
    },

    handleChangeIssueMode(val) {
      this.createItem.ship.issueMode = val
    },
    fillSysLine(sysLineCode) {
      if (sysLineCode) {
        baseSystemLineInfo({ sysLineCode }).then(res => {
          this.sysLineName = res.data.cname
        })
      }
    },

    fillPolPort(portCodes) {
      console.log('🚀 ~ portCodes', portCodes)
      // 港口数据反显
      if (portCodes) {
        let { podPortCode, unloadingPortCode, polPortCode, transitPortCode, transitPortCode1, transitPortCode2, roLoadingPortCode, roArrivalPortCode } = this.createItem.ship
        // 设置中转港2，中转港3的显示隐藏
        this.transitPortOneShow = transitPortCode1 ? true : false
        this.transitPortTwoShow = transitPortCode2 ? true : false
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
          if (this.createItem.barge && this.createItem.barge.porPortCode) {
            this.porPortList = initPortData.filter(item => item.portCode === this.createItem.barge.porPortCode)
            this.porPortItem = this.porPortList.find(item => item.portCode === this.createItem.barge.porPortCode)
          }
          this.roLoadingPortList = initPortData.filter(item => item.portCode === roLoadingPortCode)
          this.roLoadingPortItem = this.roLoadingPortList.find(item => item.portCode === roLoadingPortCode)
          this.roArrivalPortList = initPortData.filter(item => item.portCode === roArrivalPortCode)
          this.roArrivalPortItem = this.roArrivalPortList.find(item => item.portCode === roArrivalPortCode)
          this.polPortList = initPortData.filter(item => item.portCode === this.createItem.ship.polPortCode)
          this.polPortItem = this.polPortList.find(item => item.portCode === polPortCode)
          this.transitPortList = initPortData.filter(item => item.portCode === transitPortCode)
          this.transitPortItem = this.transitPortList.find(item => item.portCode === transitPortCode)
          this.transitPortList1 = initPortData.filter(item => item.portCode === transitPortCode1)
          this.transitPortItem1 = this.transitPortList1.find(item => item.portCode === transitPortCode1)
          console.log('this.transitPortItem1', this.transitPortItem1)
          this.transitPortList2 = initPortData.filter(item => item.portCode === transitPortCode2)
          this.transitPortItem2 = this.transitPortList2.find(item => item.portCode === transitPortCode2)
          this.selectListData = initPortData.filter(item => this.createItem.ship.transitPortCode.includes(item.portCode))

          let portItem = this.podPortList.find(item => item.portCode === podPortCode)
          this.countryName = portItem ? portItem.countryName : ''
        })
      } else {
        this.transitPortOneShow = false
        this.transitPortTwoShow = false
        this.$store.dispatch('dict/basePortListByCodes', {}).then(data => {
          //初始化下拉框数据
          this.podPortList = JSON.parse(JSON.stringify(data))
          this.unloadPortList = JSON.parse(JSON.stringify(data))
          this.porPortList = JSON.parse(JSON.stringify(data))
          this.roLoadingPortList = JSON.parse(JSON.stringify(data))
          this.roArrivalPortList = JSON.parse(JSON.stringify(data))
          this.polPortList = JSON.parse(JSON.stringify(data))
          this.transitPortList = JSON.parse(JSON.stringify(data))
          this.transitPortList1 = JSON.parse(JSON.stringify(data))
          this.transitPortList2 = JSON.parse(JSON.stringify(data))
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
    handleChangePorPortCode(val) {
      let findItem = this.porPortList.find(item => item.portCode === val)
      this.porPortItem = findItem || {}
      this.handleFillFreetimeSys()
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
    // 装货港
    roLoadingPortVisibleChange(val) {
      // if (val) this.roLoadingPortSearch('', 'port_of_feeder', this.state)
    },
    roLoadingPortFilterMehod(val) {
      this.roLoadingPortSearch(val, 'port_of_feeder', this.state)
    },
    handleChangeRoLoadingPortCode(val) {
      let findItem = this.roLoadingPortList.find(item => item.portCode === val)
      this.roLoadingPortItem = findItem || {}
    },
    roLoadingPortSearch(queryString, portAttribute, state) {
      this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
        let result = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
        this.roLoadingPortList = result
      })
    },
    // 到货港
    roArrivalPortVisibleChange(val) {
      // if (val) this.roArrivalPortSearch('', 'port_of_feeder', this.state)
    },
    roArrivalPortFilterMehod(val) {
      this.roArrivalPortSearch(val, 'port_of_feeder', this.state)
    },
    handleChangeRoArrivalPortCode(val) {
      let findItem = this.roArrivalPortList.find(item => item.portCode === val)
      this.roArrivalPortItem = findItem || {}
    },
    roArrivalPortSearch(queryString, portAttribute, state) {
      this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
        let result = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
        this.roArrivalPortList = result
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
      let findItem = this.polPortList.find(item => item.portCode === val)
      this.polPortItem = findItem || {}
      // 变更商务岗位分配信息
      if (val && this.createItem.ship.priceType !== 'bd') {
        this.$emit('updatePricing', '大船起运港')
      }
      this.handleFillFreetimeSys()
    },
    // 中转港
    transitPortVisibleChange(val) {
      // if (val) this.polPortSearch('', 'port_of_basic', this.state)
    },
    transitPortFilterMehod(val) {
      this.transitPortSearch(val, 'port_of_basic', this.state)
    },
    handleChangeTransitPortCode(val) {
      let findItem = this.transitPortList.find(item => item.portCode === val)
      this.transitPortItem = findItem || {}
      this.handleFillFreetimeSys()
    },
    // 中转港
    transitPortVisibleChangeOne(val) {},
    transitPortFilterMehodOne(val) {
      this.transitPortSearchOne(val, 'port_of_basic', this.state)
    },
    handleChangeTransitPortCodeOne(val) {
      let findItem = this.transitPortList1.find(item => item.portCode === val)
      this.transitPortItem1 = findItem || {}
      this.handleFillFreetimeSys()
    },
    // 中转港
    transitPortVisibleChangeTwo(val) {},
    transitPortFilterMehodTwo(val) {
      this.transitPortSearchTwo(val, 'port_of_basic', this.state)
    },
    handleChangeTransitPortCodeTwo(val) {
      let findItem = this.transitPortList2.find(item => item.portCode === val)
      this.transitPortItem2 = findItem || {}
      this.handleFillFreetimeSys()
    },
    // 中转港1下拉数据
    transitPortSearch(queryString, portAttribute, state) {
      this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
        let result = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
        this.transitPortList = result
      })
    },
    // 中转港2下拉数据
    transitPortSearchOne(queryString, portAttribute, state) {
      this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
        let result = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
        this.transitPortList1 = result
      })
    },
    // 中转港3下拉数据
    transitPortSearchTwo(queryString, portAttribute, state) {
      this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
        let result = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
        this.transitPortList2 = result
      })
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
      this.handleFillFreetimeSys()
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
      if (val) {
        // bd修改目的地获取国家判断显示货物信息里的是否包含木质包装
        if (this.isBd || this.isOp) {
          // 获取国家code
          let portItem = this.podPortList.find(item => item.portCode === val)
          this.countryName = portItem.countryName
          let countryCode = portItem ? portItem.countryCode : ''
          this.$emit('getCountryCode', countryCode)
        }
        // 根据目的港自动匹配系统航线
        this.initSystemLine(val)
      } else {
        this.handleFillFreetimeSys()
      }
    },
    initSystemLine(val) {
      if (val) {
        portSystemLineInfo(val).then(response => {
          let systemLineList = response.data
          if (systemLineList.length > 0) {
            let systemLine = systemLineList[0]
            this.createItem.ship.sysLineCode = systemLine.sysLineCode
            this.sysLineName = systemLine.cname
            // 只有bd才会请求接口获取免用免堆和变更商务人员
            if (this.isBd) {
              this.handleFillFreetimeSys()
              // 拿价类型为业务自拿价掉航线经理列表接口获取商务，其他的沿用之前配的航线商务
              if (this.createItem.ship.priceType === 'bd') {
                this.$emit('priceTypeIsBd')
              } else {
                this.$emit('updatePricing', '目的地、系统航线')
              }
            }
          }
        })
      } else {
        this.createItem.ship.sysLineCode = ''
        this.sysLineName = ''
      }
    },
    // 获取免用免堆信息
    handleFillFreetimeSys(notIncludeBarge, isRefresh) {
      let { polPortCode, podPortCode, unloadingPortCode, transitPortCode, transitPortCode1, transitPortCode2, sysLineCode, shipCarrierCode, cyCutOff, etdTime } = this.createItem.ship
      let { porPortCode } = this.createItem.barge
      let transitPortCodesArr = []
      transitPortCode ? transitPortCodesArr.push(transitPortCode) : ''
      transitPortCode1 ? transitPortCodesArr.push(transitPortCode1) : ''
      transitPortCode2 ? transitPortCodesArr.push(transitPortCode2) : ''
      // let transitPortCodes = transitPortCodesArr.toString()
      let param = {
        feederPolCode: !notIncludeBarge ? porPortCode : '',
        polCode: polPortCode,
        podCode: podPortCode,
        transitPortCodes: transitPortCodesArr,
        unloadingPortCode,
        sysLineCode,
        shipCarrierCode,
        cyCutOffDate: cyCutOff,
        etdDate: etdTime,
      }
      // 非业务的，业务自拿价，代订舱的不用获取运价的免用免堆
      if (!this.isBd || this.createItem.ship.priceType === 'bd' || this.contractRequired) return
      // 传参不变的话，不请求免用免堆信息接口。优化减少请求次数
      // if (!isRefresh && Object.entries(this.freetimeSysParam).toString() === Object.entries(param).toString()) return
      mainRouteFreeTime(param).then(res => {
        this.freetimeSysParam = param
        this.$emit('updateFreeTimeSys', res.data)
        // console.log('this.containerTotal.container', this.containerTotal, this.createItem.cargoList)
        if (this.containerTotal.containerArr.some(item => ['20FR','20RF','20OT','40FR','40RF','40OT'].includes(item.containerType))) {
          this.$set(this.createItem.ship, 'freetimeSys', '')
        }
        if (this.createItem.cargoList.some(item => ['dangerous'].includes(item.property))) {
          this.$set(this.createItem.ship, 'freetimeSys', '')
        }
      })
    },
    handleSelectPodPortCode(item) {
      Object.assign(this.createItem.ship, {
        podPortCode: item.key
      })
    },
    // 船公司下拉
    shipCarrierVisibleChange(val) {
      if (val) {
        this.$store
          .dispatch('dict/baseShippingCarrierList', {
            name: '',
            state: 'valid'
          })
          .then(data => {
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
      // 变更商务岗位分配信息
      if (val && this.createItem.ship.priceType !== 'bd') {
        this.$emit('updatePricing', '船公司')
      }
      this.handleFillFreetimeSys()
    },
    handleChangeCyCutOff(val) {
      this.handleFillFreetimeSys()
    },
    handleChangeEtdTime(val) {
      this.handleFillFreetimeSys()
    },
    // 运输条款
    getShipTerm() {
      this.$store.dispatch('dict/baseShipTermsList').then(data => {
        this.transportTermOptions = data
      })
    },
    // 驳船船名输入建议
    querySearchVessel(queryString, cb) {
      this.$store.dispatch('dict/queryVessleList', { name: queryString }).then(data => {
        cb(data)
      })
    },
    handleSelectVessel(value) {},
    handleClearVessel(value) {},
    // 驳船航次输入建议
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
          shipCarrierCode: this.createItem.ship.shipCarrierCode,
          polPortCode: this.createItem.ship.polPortCode,
          podPortCode: this.createItem.ship.podPortCode,
          vessel: queryString
        })
        .then(data => {
          cb(data)
        })
    },
    handleSelectBookVessel(value) {},
    handleClearBookVessel(value) {},
    // 大船航次输入建议
    querySearchBookVoyage(queryString, cb, vessel) {
      this.$store
        .dispatch('dict/queryBookVoyage', {
          shipCarrierCode: this.createItem.ship.shipCarrierCode,
          polPortCode: this.createItem.ship.polPortCode,
          podPortCode: this.createItem.ship.podPortCode,
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
      let { shipCarrierCode, polPortCode, podPortCode, vessel, voyage } = this.createItem.ship
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
    noDropSendMailClick() {
      this.orderInfoData = {
        shipCarrierCode: this.createItem.ship.shipCarrierCode, // 船公司
        soStr: this.createItem.soStr, // SO号
        polPortCode: this.createItem.ship.polPortCode, // 起运港
        polPortName: this.createItem.ship.polPortName, // 起运港全称
        podPortCode: this.createItem.ship.podPortCode, // 目的港
        podPortName: this.createItem.ship.podPortName, // 目的港全称
        container: this.containerTotal.container, // 箱型箱量合计
        shipVessel: this.createItem.ship.vessel, // 大船船名
        shipVoyage: this.createItem.ship.voyage, // 大船航次
        shipCyCutOff: this.createItem.ship.cyCutOff, // 大船截关时间
        shipEtdTime: this.createItem.ship.etdTime, // 大船预计开船时间
        custName: this.createItem.custName, // 委托单位
        custid: this.createItem.custid,
        pricingEmployeeId: this.getEmployeeId('pricing'),
        bkgEmployeeId: this.getEmployeeId('bkg')
      }
      this.sendMailPopShow = true
    },
    getEmployeeId(jobCode) {
      let obj = this.createItem.workAssign.find(item => {
        return item.jobCode === jobCode
      })
      return (obj && obj.employeeId) || ''
    },
    sendMailPopClose(action) {
      this.sendMailPopShow = false
      if (action === 'Confirm') {
        console.log('邮件发送成功回调')
        this.$emit('updateGetInfo')
      }
    }
  }
}
</script>

<style lang="scss">
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
      &.pr24 {
        padding-right: 24px;
      }
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
        .el-input--suffix .el-input__inner {
          padding-right: 20px;
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
        // textarea::-webkit-scrollbar-track {
        //   -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.1);
        //   border-radius: 20px;
        //   background-color: #F5F5F5;
        // }
        // textarea::-webkit-scrollbar {
        //   width: 6px;
        //   height: 6px;
        //   background-color: #F5F5F5;
        // }
        // textarea::-webkit-scrollbar-thumb {
        //   border-radius: 20px;
        //   -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.1);
        //   background-color: #ccc;
        // }
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
      &.label90 .el-form-item .el-form-item__label {
        width: 90px;
      }
      &.label70 .el-form-item .el-form-item__label {
        width: 70px;
      }
      &.label100 .el-form-item .el-form-item__label {
        width: 100px;
      }
      .el-form-item__content::before,
      .el-form-item__content::after,
      .el-form-item::before,
      .el-form-item::after {
        display: none;
      }
      .port-flex-form {
        position: relative;
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;
        .el-icon-circle-plus-outline {
          position: absolute;
          right: -17px;
          cursor: pointer;
          font-size: 15px;
          &:hover {
            color: #1890ff;
          }
        }
        .el-icon-remove-outline {
          position: absolute;
          right: -17px;
          cursor: pointer;
          font-size: 15px;
          &:hover {
            color: #1890ff;
          }
        }
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
.vessel-time-popover {
  margin-left: 5px;
}
.width-less-72-px {
  width: calc(100% - 72px);
}
.width-100-px {
  width: 100%;
}
</style>
