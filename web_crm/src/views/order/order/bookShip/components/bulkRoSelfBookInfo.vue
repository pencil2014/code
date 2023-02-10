<template>
	<div>
		<div class="bookInfo-cont">
			<div class="table-td">
				<div class="h1">
					<span class="label">港口信息</span>
					<div class="include-barge">
						<el-checkbox size="mini" v-model="includeFeederState" true-label="y" false-label="n" :disabled="disabledState" @change="handleChangeIncludeFeeder">包含驳船</el-checkbox>
					</div>
				</div>
				<div class="pd8 flex-form-item portInfo" :class="!disabledState ? 'pr24' : ''">
					<el-form-item required label="驳船收货地" prop="barge.porPortCode" :show-message="false" v-if="isIncludeFeeder">
						<div class="port-flex-form">
							<div class="port-code">
								<el-popover placement="top" width="100%" trigger="hover" class="port-ename" :disabled="isPricing || !bookDetailForm.barge.porPortCode" popper-class="port-ename-popover">
									<div class="port-popover">{{ bookDetailForm.barge.porPortCode }}<em @click="handleCopyPort(bookDetailForm.barge.porPortCode, $event)">复制</em></div>
									<el-select
										slot="reference"
										key="porPortCode"
										size="mini"
										v-model="bookDetailForm.barge.porPortCode"
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
								</el-popover>
							</div>
							<PortPopover :portItem="porPortItem" :isShowCopy="isBkg ? true : false" />
						</div>
					</el-form-item>
					<el-form-item required label="大船起运港" prop="ship.polPortCode" :show-message="false">
						<div class="port-flex-form">
							<div class="port-code">
								<el-popover placement="top" width="100%" trigger="hover" class="port-ename" :disabled="isPricing || !bookDetailForm.ship.polPortCode" popper-class="port-ename-popover">
									<div class="port-popover">{{ bookDetailForm.ship.polPortCode }}<em @click="handleCopyPort(bookDetailForm.ship.polPortCode, $event)">复制</em></div>
									<el-select
										slot="reference"
										size="mini"
										v-model="bookDetailForm.ship.polPortCode"
										filterable
										clearable
										:disabled="disabledState && !isChangeEdit"
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
								</el-popover>
							</div>
							<PortPopover :portItem="polPortItem" :isShowCopy="isBkg ? true : false" />
						</div>
					</el-form-item>
					<el-form-item label="卸货港" prop="ship.unloadingPortCode" :show-message="false">
						<div class="port-flex-form">
							<div class="port-code">
								<el-popover placement="top" width="100%" trigger="hover" class="port-ename" :disabled="isPricing || !bookDetailForm.ship.unloadingPortCode" popper-class="port-ename-popover">
									<div class="port-popover">{{ bookDetailForm.ship.unloadingPortCode }}<em @click="handleCopyPort(bookDetailForm.ship.unloadingPortCode, $event)">复制</em></div>
									<el-select
										slot="reference"
										size="mini"
										v-model="bookDetailForm.ship.unloadingPortCode"
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
								</el-popover>
							</div>
							<PortPopover :portItem="unloadPortItem" :isShowCopy="isBkg ? true : false" />
						</div>
					</el-form-item>
					<el-form-item label="目的地" prop="ship.podPortCode" :show-message="false">
						<div class="port-flex-form">
							<div class="port-code">
								<el-popover placement="top" width="100%" trigger="hover" class="port-ename" :disabled="isPricing || !bookDetailForm.ship.podPortCode" popper-class="port-ename-popover">
									<div class="port-popover">{{ bookDetailForm.ship.podPortCode }}<em @click="handleCopyPort(bookDetailForm.ship.podPortCode, $event)">复制</em></div>
									<el-select
										slot="reference"
										size="mini"
										v-model="bookDetailForm.ship.podPortCode"
										filterable
										clearable
										:disabled="disabledState"
										style="width: 100%"
										placeholder="请输入"
										:filter-method="podPortFilterMehod"
										@visible-change="podPortVisibleChange"
										@change="handleChangePodPortCode"
									>
										<el-option v-for="item in podPortList" :key="item.value" :label="item.value" :value="item.value">
											{{ item.label }}
										</el-option>
									</el-select>
								</el-popover>
							</div>
							<PortPopover :portItem="podPortItem" :isShowCopy="isBkg ? true : false" />
						</div>
					</el-form-item>
					<el-form-item label="系统航线" prop="ship.sysLineCode" :show-message="false">
						<el-input clearable size="mini" placeholder="请输入" v-model="sysLineName" disabled></el-input>
					</el-form-item>
					<el-form-item label="国家" :show-message="false">
						<el-input type="text" clearable size="mini" placeholder="请输入" v-model="countryName" disabled></el-input>
					</el-form-item>
					<el-form-item label="驳船中转方式" prop="barge.transitWay" :show-message="false" v-if="isIncludeFeeder">
						<el-select v-model="bookDetailForm.barge.transitWay" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="true">
							<el-option v-for="item in dictMap.transferMode" :label="item.label" :value="item.value" :key="item.value"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="中转方式" prop="ship.transitWay" :show-message="false" v-if="!isBulkRoSelf">
						<el-select v-model="bookDetailForm.ship.transitWay" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="true">
							<el-option v-for="item in dictMap.mainRouteTransferMode" :label="item.label" :value="item.value" :key="item.value"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="承运人航线" prop="ship.carrierLineName" :show-message="false" v-if="isPricing">
						<el-input clearable size="mini" placeholder="请输入" v-model="bookDetailForm.ship.carrierLineName" :disabled="disabledState"></el-input>
					</el-form-item>
					<el-form-item label="航线代码" prop="ship.carrierService" :show-message="false">
						<el-input clearable size="mini" placeholder="请输入" v-model="bookDetailForm.ship.carrierService" :disabled="disabledState"></el-input>
					</el-form-item>
				</div>
			</div>
			<div class="table-td">
				<div class="h1">
					<span class="label">船东信息</span>
				</div>
				<div class="pd8 flex-form-item">
					<el-form-item label="船公司" required prop="ship.shipCarrierCode" :show-message="false" class="vessel-time">
						<el-select
							size="mini"
							v-model="bookDetailForm.ship.shipCarrierCode"
							filterable
							clearable
							remote
							style="width: 100%"
							placeholder="请输入"
							:disabled="disabledState && (isPricing || !$route.query.orderNo || bkgEditState) && !isChangeEdit"
							:remote-method="val => shipCarrierRemoteMethod(val)"
							@visible-change="val => shipCarrierVisibleChange(val)"
							@change="handleChangeShipCarrier"
							@mouseenter.native="showTooltip($event, bookDetailForm.ship.shipCarrierCode)"
							@mouseleave.native="hiddenTooltip"
						>
							<el-option v-for="(item, index) in shipCarrierOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
						<el-button type="default" size="mini" style="margin-left: 5px;" @click="getShippingCarrierUrl(bookDetailForm.ship.shipCarrierCode)">船司官网</el-button>
					</el-form-item>
					<div class="vessel-voyage-item">
						<div class="flex1">
							<el-form-item label="大船船名" prop="ship.vessel" :show-message="false">
								<vessel-select
									v-model="bookDetailForm.ship.vessel"
									:orderNo="$route.query.orderNo"
									:disabledState="disabledState && !isChangeEdit"
									:shipCarrierCode="bookDetailForm.ship.shipCarrierCode"
									:polPortCode="bookDetailForm.ship.polPortCode"
									:podPortCode="bookDetailForm.ship.podPortCode"
									:copyBtnHide="true"
								/>
							</el-form-item>
							<el-form-item label="大船航次" prop="ship.voyage" :show-message="false">
								<voyage-select
									v-model="bookDetailForm.ship.voyage"
									:disabledState="disabledState && !isChangeEdit"
									:orderNo="$route.query.orderNo"
									:vessel="bookDetailForm.ship.vessel"
									:shipCarrierCode="bookDetailForm.ship.shipCarrierCode"
									:polPortCode="bookDetailForm.ship.polPortCode"
									:podPortCode="bookDetailForm.ship.podPortCode"
									:copyBtnHide="true"
								/>
							</el-form-item>
						</div>
						<el-button type="default" class="btn-copy" size="mini" @click="handleCopyVessel(bookDetailForm.ship.vessel, bookDetailForm.ship.voyage, $event)" v-if="bookDetailForm.ship.vessel || bookDetailForm.ship.voyage">复制</el-button>
					</div>
					<el-form-item label="驳船船名" prop="barge.vessel" :show-message="false" v-if="isBulkRoSelf && isIncludeFeeder">
						<el-autocomplete
							style="width: 100%"
							size="mini"
							clearable
							v-model="bookDetailForm.barge.vessel"
							:disabled="true"
							:fetch-suggestions="(queryString, cb) => querySearchVessel(queryString, cb)"
							placeholder="请输入"
							:maxlength="128"
							@select="value => handleSelectVessel(value)"
							@clear="value => handleClearVessel(value)"
						></el-autocomplete>
					</el-form-item>
					<el-form-item label="驳船航次" prop="barge.voyage" :show-message="false" v-if="isBulkRoSelf && isIncludeFeeder">
						<el-autocomplete
							style="width: 100%"
							size="mini"
							clearable
							v-model="bookDetailForm.barge.voyage"
							:disabled="true"
							:fetch-suggestions="(queryString, cb) => querySearchVoyage(queryString, cb, bookDetailForm.barge.vessel)"
							placeholder="请输入"
							:maxlength="128"
							@select="value => handleSelectVoyage(value)"
							@clear="value => handleClearVoyage(value)"
						></el-autocomplete>
					</el-form-item>
					<el-form-item class="timeSpecial" label="驳船预计开船时间" prop="ship.bargeEtdTime" :show-message="false" v-if="isIncludeFeeder">
						<elDatePickerLimit :field="'bargeEtdTime'" size="mini" v-model="bookDetailForm.ship.bargeEtdTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="disabledState" />
					</el-form-item>
					<el-form-item class="timeSpecial" label="驳船截关时间" prop="barge.cyCutOff" :show-message="false" v-if="isIncludeFeeder">
						<elDatePickerLimit
							size="mini"
							:field="'bargeCyCutOff'"
							v-model="bookDetailForm.barge.cyCutOff"
							type="date"
							style="width: 100%"
							clearable
							placeholder="请选择"
							value-format="yyyy-MM-dd"
							:disabled="true"
						/>
					</el-form-item>
					<el-form-item required class="timeSpecial" label="大船截关时间" prop="ship.cyCutOff" :show-message="false">
						<elDatePickerLimit
							size="mini"
							:field="'cyCutOff'"
							v-model="bookDetailForm.ship.cyCutOff"
							type="date"
							style="width: 100%"
							clearable
							placeholder="请选择"
							value-format="yyyy-MM-dd"
							:disabled="disabledState && !(isBkg && ['booked', 'book_release'].includes(bkgStatus))"
						/>
					</el-form-item>
					<el-form-item :required="(isBkg && bookDetailForm.businessType === 'ship_import_fcl' && bkgStatus === 'book_release') || bookDetailForm.businessType === 'ship_export_fcl'" class="timeSpecial vessel-time" label="大船预计开船时间" prop="ship.etdTime" :show-message="false">
						<elDatePickerLimit
						  :field="'etdTime'"
							size="mini"
							v-model="bookDetailForm.ship.etdTime"
							type="date"
							style="width: 100%"
							clearable
							:disabled="disabledState && !(isBkg && ['booked', 'book_release'].includes(bkgStatus))"
							placeholder="请选择"
							value-format="yyyy-MM-dd"
						/>
						<el-popover placement="top" width="280" trigger="click" class="vessel-time-popover">
							<Schedule :vesselTime="vesselTime" :etdTimeDisabled="disabledState && !(isBkg && ['booked', 'book_release'].includes(bkgStatus))" @updateVesselTime="updateVesselTime" />
							<el-button slot="reference" type="default" size="mini" @click="handleSearchVesselTime">查询</el-button>
						</el-popover>
					</el-form-item>
					<!-- <el-form-item :required="bkgStatus === 'book_release'" class="timeSpecial" label="预计到港时间" prop="ship.etaTime" :show-message="false" v-if="isBkg && bookDetailForm.businessType === 'ship_import_fcl' ">
						<elDatePickerLimit
							size="mini"
							v-model="bookDetailForm.ship.etaTime"
							type="date"
							style="width: 100%"
							clearable
							:disabled="disabledState && !(isBkg && ['booked', 'book_release'].includes(bkgStatus))"
							placeholder="请选择"
							value-format="yyyy-MM-dd"
						/>
					</el-form-item> -->
					<el-form-item label="船东参考号" prop="ship.shipRefNo" :show-message="false" v-if="isPricing">
						<el-input clearable size="mini" placeholder="请输入" v-model="bookDetailForm.shipRefNo" :disabled="true"></el-input>
					</el-form-item>
					<el-form-item :required="!isAddCont && !isChange" label="甩柜类型" prop="isNodrop" :show-message="false" v-if="isWhiteCust && !isProxyBook && !isBulkRo">
						<el-select v-model="bookDetailForm.isNodrop" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="disabledState && !isChangeEdit">
							<el-option v-for="(item, index) in isNodropOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="免用免堆信息" prop="ship.freetimeSys" :show-message="false" v-if="!isBulkRoSelf" :required="isPricing">
						<el-input
							type="textarea"
							clearable
							rows="4"
							size="mini"
							placeholder="请输入"
							maxlength="512"
							show-word-limit
							v-model="bookDetailForm.ship.freetimeSys"
							:disabled="disabledState"
							@mouseenter.native="showTooltip($event, bookDetailForm.ship.freetimeSys)"
							@mouseleave.native="hiddenTooltip"
						></el-input>
					</el-form-item>
				</div>
			</div>
			<div class="table-td">
				<div class="h1">
					<span class="label">货运信息</span>
				</div>
				<div class="pd8 flex-form-item cargoInfo">
					<el-form-item label="协助审核人" prop="auditEmployeeId" :show-message="false" v-if="isPricing">
						<el-select
							key="auditEmployeeId"
							size="mini"
							v-model="bookDetailForm.auditEmployeeId"
							filterable
							remote
							clearable
							:disabled="isChange || isAddCont || disabledAuditEmployeeId || ['pass', 'booking', 'booked', 'book_release', 'refuse'].includes(bookDetailForm.bkgStatus)"
							:style="{ width: disabledAuditEmployeeId ? 'calc(100% - 42px)' : '100%' }"
							placeholder="请输入"
							:remote-method="auditEmployeeRemoteMethod"
							@visible-change="auditEmployeeVisibleChange"
							@change="handleChangeAuditEmployee"
						>
							<el-option v-for="item in auditEmployeeList" :key="item.value" :label="item.label" :value="item.value" :disabled="item.value === userId">
								{{ item.cname }}<em v-if="item.deptCode" style="color: #999;font-style: normal">({{ item.deptCname }})</em>
							</el-option>
						</el-select>
						<el-button @click="cancelJoint" v-if="disabledAuditEmployeeId" size="mini" :disabled="bookDetailForm.auditEmployeeId === userId">撤回</el-button>
					</el-form-item>
					<!-- 20220527不论bkg、商务的订舱代理都设置为必填  isRequired && isCusTruckRequired -->
					<el-form-item :required="(isPricing && isCusTruckRequired) || isBkg" label="订舱代理" prop="ship.bkgAgentSupplierId" :show-message="false" v-if="!['st10'].includes(bookDetailForm.serviceType)">
						<el-select
							key="bkgAgentSupplierId"
							size="mini"
							v-model="bookDetailForm.ship.bkgAgentSupplierId"
							filterable
							remote
							clearable
							:disabled="disabledState && (isPricing || !$route.query.orderNo || bkgEditState)"
							style="width: 100%"
							placeholder="请输入"
							:remote-method="
								val => {
									val && bkgAgentRemoteMethod('bkg_carrier,bkg_agent', val)
								}
							"
							@visible-change="
								val => {
									val && bkgAgentVisibleChange('bkg_carrier,bkg_agent')
								}
							"
							@change="handleChangeBkgAgent"
							@mouseenter.native="showTooltip($event, bookDetailForm.ship.bkgAgentSupplierName)"
							@mouseleave.native="hiddenTooltip"
						>
							<el-option v-for="item in bkgAgentSupplierList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
					<!--  isExternalDisabled 20220221修改为可编辑，不管所选订舱代理的供应商类型是“自订订舱代理”还是“外配订舱代理” -->
					<!-- isCusTruckRequired -->
					<el-form-item :required="(isPricing && isCusTruckRequired) || isBkg" label="是否外配" prop="isExternal" :show-message="false" v-if="!['st10'].includes(bookDetailForm.serviceType)">
						<el-select
							key="isExternal"
							size="mini"
							v-model="bookDetailForm.isExternal"
							clearable
							:disabled="disabledState && (isPricing || !$route.query.orderNo || bkgEditState)"
							style="width: 100%"
							placeholder="请选择"
							@change="handleChangeExternal"
						>
							<el-option v-for="item in externalOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
					<!-- 进口代订舱没有商务，暂时隐藏掉报关行字段。 -->
					<!-- <el-form-item :required="isDeclarationRequired && isCusTruckRequired" label="报关行" prop="transport.customsSupplierId" :show-message="false" v-if="bookDetailForm.businessType === 'ship_import_fcl' && !isProxyBook">
						<el-select
							key="customsSupplierId"
							size="mini"
							v-model="bookDetailForm.transport.customsSupplierId"
							filterable
							remote
							clearable
							:disabled="disabledState"
							style="width: 100%"
							placeholder="请输入"
							:remote-method="
								val => {
									val && declarationRemoteMethod(val)
								}
							"
							@visible-change="
								val => {
									val && declarationVisibleChange('')
								}
							"
							@change="handleChangeDeclaration"
							@mouseenter.native="showTooltip($event, bookDetailForm.transport.customsSupplierName)"
							@mouseleave.native="hiddenTooltip"
						>
							<el-option v-for="item in declarationSupplierList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item> -->
					<!-- 进口代订舱没有商务，暂时隐藏掉车队字段。 -->
					<!-- <el-form-item :required="isTruckRequired && isCusTruckRequired" label="车队" prop="transport.truckSupplierId" :show-message="false" v-if="bookDetailForm.businessType === 'ship_import_fcl' && !isProxyBook">
						<el-select
							key="truckSupplierId"
							size="mini"
							v-model="bookDetailForm.transport.truckSupplierId"
							filterable
							remote
							clearable
							:disabled="disabledState"
							style="width: 100%"
							placeholder="请输入"
							:remote-method="
								val => {
									val && truckRemoteMethod(val)
								}
							"
							@visible-change="
								val => {
									val && truckVisibleChange('')
								}
							"
							@change="handleChangeTruck"
							@mouseenter.native="showTooltip($event, bookDetailForm.transport.truckSupplierName)"
							@mouseleave.native="hiddenTooltip"
						>
							<el-option v-for="item in truckSupplierList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item> -->
					<!-- <el-form-item label="合约号" prop="ship.contractNo" :show-message="false">
						<el-input clearable size="mini" placeholder="请输入" v-model="bookDetailForm.ship.contractNo" :disabled="disabledState" 
							@mouseenter.native="showTooltip($event, bookDetailForm.ship.contractNo)" @mouseleave.native="hiddenTooltip"></el-input>
					</el-form-item>
					<el-form-item label="合约公司" prop="contractCompany" :show-message="false">
						<el-input clearable size="mini" placeholder="请输入" v-model="bookDetailForm.ship.contractCompany" :disabled="disabledState" 
							@mouseenter.native="showTooltip($event, bookDetailForm.ship.contractCompany)" @mouseleave.native="hiddenTooltip"></el-input>
					</el-form-item> -->
					<el-form-item label="合约号" prop="ship.contractNo" :show-message="false">
						<el-select
							id="contractNoSelect"
							v-model="bookDetailForm.ship.contractNo"
							size="mini"
							clearable
							filterable
							allow-create
							placeholder="请选择"
							style="width: 100%"
							:disabled="disabledState"
							@visible-change="getContractList"
							@change="handleChangeContractNo"
							@mouseenter.native="showTooltip($event, bookDetailForm.ship.contractNo)"
							@mouseleave.native="hiddenTooltip"
						>
							<el-option v-for="(item, index) in contractList" :label="item.label" :value="item.label" :key="index"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="签约分公司" prop="ship.contractCompany" :show-message="false">
						<el-select
							v-model="bookDetailForm.ship.contractCompany"
							size="mini"
							clearable
							filterable
							allow-create
							placeholder="请选择"
							style="width: 100%"
							:disabled="disabledState || hasContractItemId"
							@change="handleChangeSignComp"
							@mouseenter.native="showTooltip($event, bookDetailForm.ship.contractCompany)"
							@mouseleave.native="hiddenTooltip"
							maxlength="128"
						>
							<el-option v-for="(item, index) in signCompList" :label="item.label" :value="item.label" :key="index"> </el-option>
						</el-select>
					</el-form-item>
					<!-- <el-form-item label="付款方式" prop="payMode" :show-message="false" v-if="isBkg">
						<el-select v-model="bookDetailForm.payMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="true" @mouseenter.native="showTooltip($event, bookDetailForm.payMode, 'payMode')" @mouseleave.native="hiddenTooltip">
							<el-option v-for="(item, index) in dictMap.payMode" :label="item.label" :value="item.value" :key="index"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="运输条款" prop="transport.transportTerm" :show-message="false" v-if="isBkg">
						<el-select v-model="bookDetailForm.transport.transportTerm" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="true">
							<el-option v-for="(item, index) in dictMap.shipTerms" :label="item.label" :value="item.value" :key="index"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="订舱类型" prop="bkgTypeName" :show-message="false" v-if="isBkg">
						<el-input clearable size="mini" placeholder="请输入" v-model="bookDetailForm.bkgTypeName" :disabled="true"></el-input>
					</el-form-item> -->
					<el-form-item label="付款方式" prop="payMode" :show-message="false" v-if="isPricing">
						<el-select v-model="bookDetailForm.payMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="true">
							<el-option v-for="(item, index) in dictMap.payMode" :label="item.label" :value="item.value" :key="index"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="运输条款" prop="transport.transportTerm" :show-message="false" v-if="isPricing && !isBulkRoSelf">
						<el-select v-model="bookDetailForm.transport.transportTerm" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="true">
							<el-option v-for="(item, index) in dictMap.shipTerms" :label="item.label" :value="item.value" :key="index"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="拿价类型" prop="ship.priceType" :show-message="false" v-if="bookDetailForm.ship.priceType">
						<el-select v-model="bookDetailForm.ship.priceType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="true">
							<el-option v-for="(item, index) in dictMap.priceType" :label="item.label" :value="item.value" :key="index"> </el-option>
						</el-select>
					</el-form-item>
					<!-- <el-form-item label="客户类型" prop="custType" :show-message="false" v-if="$route.query.orderNo">
						<el-select v-model="bookDetailForm.custType" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="true">
							<el-option v-for="(item, index) in dictMap.customerClass" :label="item.label" :value="item.value" :key="index"> </el-option>
						</el-select>
					</el-form-item> -->
					<!-- <el-form-item label="是否线上" prop="isOnline" :show-message="false" :required="true" v-if="!isBulkRo">
						<el-radio-group v-model="bookDetailForm.isOnline" :disabled="isOnlineDisabled">
							<el-radio :label="item.value" :disabled="disabledState" v-for="(item, index) in isOnlineOptions" :key="index">{{ item.label }}</el-radio>
						</el-radio-group>
					</el-form-item> -->
					<!-- <el-form-item label="付款分公司" prop="payCompanyCode" :show-message="false" :required="bookDetailForm.isOnline === 'Y' && ['COSCO', 'OOCL'].includes(bookDetailForm.ship.shipCarrierCode)" v-if="!isBulkRo">
						<el-select v-model="bookDetailForm.payCompanyCode" size="mini" clearable filterable placeholder="请选择" style="width: 100%" :disabled="disabledState" @change="handleChnageCompany">
							<el-option v-for="(item, index) in payCompanyOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
						</el-select>
					</el-form-item> -->
					<el-form-item label="委托备注" prop="intrustRemark" :show-message="false" v-if="isPricing && $route.query.orderNo">
						<el-input size="mini" type="textarea" rows="4" placeholder="请输入" v-model="bookDetailForm.intrustRemark" :disabled="true"> </el-input>
					</el-form-item>
					<template v-if="isPricing">
						<el-form-item label="审单备注" prop="auditRemark" :show-message="false" class="vessel-time">
							<el-input size="mini" type="textarea" rows="4" placeholder="请输入" maxlength="512" show-word-limit v-model="bookDetailForm.auditRemark" :disabled="disabledState && (!isAddCont || bookDetailForm.bkgStatus !== 'submit')"> </el-input>
							<i class="el-icon-circle-plus-outline" @click="handleOpenTemp" v-if="!disabledState"></i>
						</el-form-item>
						<!-- (isAddCont || isChange || isBkg || isPricing && bookDetailForm.bkgStatus !== 'submit') -->
						<!-- <el-form-item label="订舱要求" prop="bookingRequire" :show-message="false" class="vessel-time" v-if="!isBulkRo">
							<div slot="label">
								<span>订舱要求</span>
								<el-tooltip effect="dark" content="此订舱要求仅订舱人员能查看" placement="top">
									<i class="el-icon-question"></i>
								</el-tooltip>
							</div>
							<el-input size="mini" type="textarea" rows="4" placeholder="请输入" maxlength="512" show-word-limit v-model="bookDetailForm.bookingRequire" :disabled="disabledState && (!isAddCont || bookDetailForm.bkgStatus !== 'submit')"> </el-input>
						</el-form-item> -->
					</template>
				</div>
			</div>
			<template v-if="tempPopShow">
				<TempPop :contractTempDetail="contractTempDetail" :tempPortQuery="tempPortQuery" ref="tempPop" @close="tempPopClose" />
			</template>
		</div>
		<div class="contract-temp-cont" v-if="Object.keys(contractTempDetail).length && isPricing">
			<div class="contract-temp-tit">
				<div class="tit">套约信息</div>
				<div class="btn-groups" v-if="!contractTempDetail.contractItemId">
					<em class="save" @click="handleSaveTemp">另存为</em>
					<em class="del" @click="handleDeleteTemp">删除</em>
				</div>
			</div>
			<div class="contract-temp-list">
				<Template :contractTempDetail="contractTempDetail" :disabledState="disabledState" ref="template" />
			</div>
		</div>
		<div v-if="tempDialogShow">
			<TempDialog @close="tempDialogClose" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import clip from '@/utils/clipboard'
import { getDictLabel } from '@/utils/tools'
import clipboard from '@/directive/clipboard/index.js'
import { supplierList, supplierInfo } from '@/api/crm/supplier'
import { baseEmployeeListName, shippingCarrierInfo, baseSystemLineInfo, baseDeptParticipants, baseDeptSettleList, portSystemLineInfo } from '@/api/base'
import { orderWork, orderWorkSi } from '@/api/order/list'
import { contractUseList, contractTempInfo, contractInfo, bookTempSave, bookTempDelete } from '@/api/order/contract'
import PortPopover from '@/views/order/order/orderList/components/portPopover'
import Schedule from '@/views/order/order/orderList/components/schedule'
import VesselSelect from '@/views/order/order/components/vesselSelect'
import VoyageSelect from '@/views/order/order/components/voyageSelect'
import TempPop from './contract/tempPop'
import Template from './contract/template'
import TempDialog from './tempDialog'
export default {
	data() {
		return {
			tempDialogShow: false,
			includeFeederState: '',
			transitPortOneShow: false,
			transitPortTwoShow: false,
			podPortList: [],
			podPortItem: {},
			unloadPortList: [],
			unloadPortItem: {},
			porPortList: [],
			porPortItem: {},
			polPortList: [],
			polPortItem: {},
			transitPortList: [],
			transitPortList1: [],
			transitPortList2: [],
			transitPortItem: {},
			transitPortItem1: {},
			transitPortItem2: {},
			bkgAgentSupplierList: [],
			declarationSupplierList: [],
			truckSupplierList: [],
			pricerList: [],
			bkgEmployeeList: [],
			docEmployeeList: [],
			auditEmployeeList: [],
			state: 'valid',
			oQuery: this.$route.query,
			pickerOptions: {
				disabledDate(date) {
					// return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
				}
			},
			isRequired: true, // 订舱代理，拿价人，订舱人必填
			isExternalDisabled: false, // 是否外配
			externalOptions: [
				{ label: '是', value: 'y' },
				{ label: '否', value: 'n' }
			],
			isOnlineOptions: [
				{ label: '线上', value: 'Y' },
				{ label: '线下', value: 'N' }
			],
			isUpdateBkg: false, // 订舱人员是否有变更
			shipCarrierOptions: [],
			vesselTime: {},
			vesselTimeParam: {},
			payCompanyOptions: [],
			countryName: '',
			isDeclarationRequired: false,
			isTruckRequired: false,
			isProxyBook: false,
			contractList: [],
			signCompList: [],
			tempPopShow: false,
			contractTempDetail: {},
			tempListQuery: {
				list: []
			},
			tempPortQuery: {},
			sysLineName: '',
			isNodropOptions: [
				{ label: '甩柜', value: 'Y' },
				{ label: '不甩柜', value: 'N' },
				{ label: '不确定', value: 'C' }
			],
			contractNoMaxlength: 128, 	// 合约号allowCreate创建的条目允许输入的最大字符
		}
	},
	props: {
		orderDetail: {
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
		disabledAuditEmployeeId: {
			type: Boolean,
			default: false
		},
		bkgStatus: {
			type: String,
			default: ''
		},
		sysLineCname: {
			type: String,
			default: ''
		},
		bkgAgentList: {
			type: Array,
			default: () => []
		},
		assistAuditEmpList: {
			type: Array,
			default: () => []
		},
		includeFeeder: {
			type: String,
			default: ''
		},
		bkgJointParam: {
			type: Object,
			default: () => ({})
		},
		employeeListParam: {
			type: Object,
			default: () => ({})
		},
		orderIsJoint: {
			type: String,
			default: ''
		}
	},
	created() {
		this.fillPolPort(this.fillPortCodes)
		if (this.bookDetailForm.ship.bkgAgentSupplierId) {
			this.getSupplierInfo(this.bookDetailForm.ship.bkgAgentSupplierId)
		}
		this.getCompanyList()
		// this.getContractList()
		this.getSignCompList()
		console.log('bkgAgentList', this.bkgAgentList)
	},
	mounted() {
		this.$nextTick(() => {
			// 设置可输入的最大字符长度
			let select = document.getElementById('contractNoSelect')
			select.setAttribute('maxlength', this.contractNoMaxlength)
		})
		// console.log('🚀 ~ this.bookDetailForm.ship.transitPortCode', this.bookDetailForm.ship.transitPortCode)
	},

	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			userId: state => state.user.userId,
			userInfo: state => state.user.userInfo
		}),
		roles() {
			let roles = this.$route.query.roles ? this.$route.query.roles.split(',') : []
			return roles
		},
		isPricing() {
			return this.roles.includes('pricing')
		},
		isBkg() {
			return this.roles.includes('bkg')
		},
		isAddCont() {
			return this.bookDetailForm.containerModifyInfo && Object.keys(this.bookDetailForm.containerModifyInfo).length ? true : false
			// return this.bookDetailForm.reqType === 'add'
		},
		isChange() {
			return this.bookDetailForm.portModifyInfo && Object.keys(this.bookDetailForm.portModifyInfo).length ? true : false
			// return this.bookDetailForm.reqType === 'change'
		},
		isChangeEdit() {
			return this.isChange && ['submit'].includes(this.bookDetailForm.bkgStatus)
		},
		isIncludeFeeder() {
			return this.includeFeeder === 'y' ? true : false
		},
		disabledState() {
			if (this.isChange && this.bookDetailForm.bkgStatus !== 'book_refuse') return true
			// 加柜的订舱信息不可修改,订舱拒绝的可编辑
			if (this.isAddCont && this.bookDetailForm.bkgStatus !== 'book_refuse') return true
			if (this.isBkg) return true
			if (this.isPricing) {
				// 审核通过的、订舱拒绝给业务的不可编辑
				let { auditEmployeeId, orgAuditEmployeeId } = this.bookDetailForm
				if (['pass', 'booking', 'booked', 'book_release', 'refuse'].includes(this.bookDetailForm.bkgStatus)) {
					return true
				}
				// 有协助审核人并且原审核人是登录用户的不可编辑
				if (auditEmployeeId && orgAuditEmployeeId && auditEmployeeId !== orgAuditEmployeeId && orgAuditEmployeeId === this.userId) {
					return true
				}
			}
			return false
		},
		bkgEditState() {
			if (this.isBkg) {
				// bkg，订舱拒绝、已放舱的;orderStatus为终止，取消的都不可编辑
				if (!['refuse', 'book_refuse', 'book_release'].includes(this.bkgStatus) && !['break', 'cancel'].includes(this.bookDetailForm.orderStatus)) {
					return false
				}
			}
			return true
		},
		isOnlineDisabled() {
			return this.bookDetailForm.isExternal === 'y'
		},
		hasContractItemId() {
			return this.bookDetailForm.contractItemId ? true : false
		},
		// 报关行，车队，是否外配必填
		isCusTruckRequired() {
			if (!this.bookDetailForm.auditEmployeeId || this.bookDetailForm.auditEmployeeId === this.userId) {
				return true
			}
			return false
		},
		// 是否白名单
		isWhiteCust() {
			return this.bookDetailForm.isWhiteCust === 'Y'
		},
		// 散杂滚装
    isBulkRo() {
      return this.bookDetailForm.businessType === 'ship_bulk_ro'
		},
		// 散杂滚装客户自订
		isBulkRoSelf() {
			return this.bookDetailForm.serviceType === 'st25'
		}
	},
	watch: {
		sysLineCname: {
			handler(newVal) {
				this.sysLineName = newVal
			},
			deep: true
		},
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
		assistAuditEmpList: {
			handler(newVal) {
				this.auditEmployeeList = newVal
			},
			deep: true,
			immediate: true
		},
		'bookDetailForm.ship.bkgAgentSupplierId': {
			handler(newVal) {
				if (!newVal) {
					this.isExternalDisabled = false
				}
				newVal && this.getSupplierInfo(newVal)
			},
			deep: true,
			immediate: true
		},
		includeFeeder: {
			handler(newVal) {
				this.includeFeederState = newVal
			},
			deep: true,
			immediate: true
		},
		employeeListParam: {
			handler(newVal) {
				this.bkgEmployeeList = newVal.bkg
				this.docEmployeeList = newVal.doc
			},
			deep: true,
			immediate: true
		},
		orderDetail: {
			handler(newVal) {
				let { serviceList } = newVal
				serviceList = serviceList || []
				if (serviceList.includes('pol_declaration') || serviceList.includes('pod_comm_clearance') || serviceList.includes('bonded_declaration')) {
					this.isDeclarationRequired = true
				} else {
					this.isDeclarationRequired = false
				}
				if (serviceList.includes('truck') || serviceList.includes('pol_ltl') || serviceList.includes('pod_fcl_delivery') || serviceList.includes('pod_ltl_delivery') || serviceList.includes('bonded_truck')) {
					this.isTruckRequired = true
				} else {
					this.isTruckRequired = false
				}
				if (serviceList.includes('proxy_book')) {
					this.isProxyBook = true
				} else {
					this.isProxyBook = false
				}
			},
			deep: true,
			immediate: true
		},
		'bookDetailForm.transport.customsSupplierId': {
			handler(newVal) {
				if (newVal) {
					this.declarationSupplierList = [{ label: this.bookDetailForm.transport.customsSupplierName, value: newVal }]
				} else {
					this.declarationSupplierList = []
				}
			},
			deep: true,
			immediate: true
		},
		'bookDetailForm.transport.truckSupplierId': {
			handler(newVal) {
				if (newVal) {
					this.truckSupplierList = [{ label: this.bookDetailForm.transport.truckSupplierName, value: newVal }]
				} else {
					this.truckSupplierId = []
				}
			},
			deep: true,
			immediate: true
		},
		'bookDetailForm.isExternal': {
			handler(newVal) {
				if (newVal === 'y') {
					this.bookDetailForm.isOnline = 'N'
				}
			}
		}
	},
	components: {
		PortPopover,
		Schedule,
		VesselSelect,
		VoyageSelect,
		TempPop,
		Template,
		TempDialog
	},
	methods: {
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
		// 船期查询结果直接填入订单详情
		updateVesselTime(val, key) {
			this.bookDetailForm.ship[key] = val
		},
		tempDialogClose(action, value) {
			if (action === 'Confirm') {
				let tempQuery = this.$refs.template.contractTempDetail
				tempQuery.templateName = value
				bookTempSave(tempQuery).then(res => {
					this.tempDialogShow = false
					this.$message({ type: 'success', message: '模板保存成功' })
				})
			} else {
				this.tempDialogShow = false
			}
		},
		initTempData(data) {
			this.contractTempDetail = data || {}
		},
		handleSaveTemp() {
			this.tempDialogShow = true
		},
		handleDeleteTemp() {
			let tempQuery = this.$refs.template.contractTempDetail
			let msg = '是否删除该套约模板?'
			// if (tempQuery.templateName && tempQuery.templateName !== '空模板') msg = '是否删除该套约模板?'
			// console.log('tempQuery', tempQuery)
			this.$confirm(msg, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					this.contractTempDetail = {}
					// 模板删除
					if (tempQuery.templateName && tempQuery.templateName !== '空模板') {
						bookTempDelete({ oid: tempQuery.oid }).then(res => {
							this.$message({ type: 'success', message: '删除套约模板成功' })
						})
					}
				})
				.catch(err => {})
		},
		// 合约模板弹窗
		handleOpenTemp() {
			this.$set(this.tempPortQuery, 'polPortCode', this.bookDetailForm.ship.polPortCode)
			this.$set(this.tempPortQuery, 'sysLineCode', this.bookDetailForm.ship.sysLineCode)
			this.tempPopShow = true
		},
		tempPopClose(action, param) {
			console.log('tempaltePop', param)
			this.tempPopShow = false
			if (action === 'Confirm') {
				if (param.smContractId) {
					this.bookDetailForm.ship.contractNo = param.smContractNo
					this.bookDetailForm.contractItemId = param.smContractId
					let signItem = this.signCompList.find(ele => ele.companyCode === param.signCompCode)
					this.bookDetailForm.ship.contractCompany = signItem ? signItem.name : ''
					this.getContractTempInfo(param)
					this.$emit('getWorkAssign', { smContractId: param.smContractId })
				} else {
					this.bookDetailForm.ship.contractNo = ''
					this.bookDetailForm.contractItemId = ''
					this.bookDetailForm.ship.contractCompany = ''
					this.contractTempDetail = param
				}
			}
		},
		// 船公司官网
		getShippingCarrierUrl(carrierCode) {
			if (!carrierCode) return
			this.$store.dispatch('order/getShippingCarrierWebUrl', { carrierCode })
		},
		// 获取所有公司
		getCompanyList() {
			baseDeptSettleList().then(res => {
				this.payCompanyOptions = res.data.map(item => {
					return { ...item, label: item.deptCname, value: item.deptCode }
				})
			})
		},
		// 获取所有可用合约号
		getContractList(val) {
			if (val) {
				contractUseList({
					polPortCode: this.bookDetailForm.ship.polPortCode,
					sysLineCode: this.bookDetailForm.ship.sysLineCode
				}).then(res => {
					let arr = res.data
						.filter(item => item.smContractNo)
						.map(item => {
							return { ...item, label: `${item.smContractNo}(${item.polPortCodeStr})`, value: item.smContractId }
						})
					// 去重
					let result = []
					let obj = {}
					for (var i = 0; i < arr.length; i++) {
						if (!obj[arr[i].smContractId]) {
							result.push(arr[i])
							obj[arr[i].smContractId] = true
						}
					}
					this.contractList = result
				})
			}
		},
		// getContractInfo(item) {
		// 	let data = {oid: item.bigContractId, smContractId: item.smContractId}
		// 	contractInfo(data).then(res => {
		//     this.contractDetail = res.data
		//   })
		// },
		getContractTempInfo(item) {
			let data = { smContractId: item.smContractId }
			contractTempInfo(data).then(res => {
				this.contractTempDetail = res.data || { contractItemId: item.smContractId }
			})
		},
		// 获取所有分公司
		getSignCompList() {
			this.$store.dispatch('contract/getCompanyList').then(data => {
				this.signCompList = data
			})
		},
		handleChangeContractNo(val) {
			if (val) {
				let findItem = this.contractList.find(item => item.label === val)
				if (findItem) {
					this.bookDetailForm.contractItemId = findItem.smContractId
					this.bookDetailForm.signCompCode = findItem.signCompCode
					this.bookDetailForm.signCompName = findItem.signCompName
					let signItem = this.signCompList.find(ele => ele.companyCode === findItem.signCompCode)
					this.bookDetailForm.ship.contractCompany = signItem ? signItem.name : ''
					this.getContractTempInfo(findItem)
					// this.$emit('emptyJointWorkAssign')
					this.$emit('getWorkAssign', { smContractId: this.bookDetailForm.contractItemId, isClear: true })
				}
			} else {
				this.bookDetailForm.contractItemId = null
				this.bookDetailForm.signCompCode = ''
				this.bookDetailForm.signCompName = ''
				this.bookDetailForm.ship.contractCompany = ''
				if (!this.contractTempDetail.templateName) {
					this.contractTempDetail = {}
				}
				this.$emit('getWorkAssign', { smContractId: this.bookDetailForm.contractItemId })
			}
			// let findItem = this.contractList.find(item => item.label === val)
			// if (findItem) {
			// 	this.bookDetailForm.contractItemId = findItem.smContractId
			// 	this.bookDetailForm.signCompCode = findItem.signCompCode
			// 	this.bookDetailForm.signCompName = findItem.signCompName
			// 	let signItem = this.signCompList.find(ele => ele.companyCode === findItem.signCompCode)
			// 	this.bookDetailForm.ship.contractCompany = signItem ? signItem.name : ''
			// 	this.getContractTempInfo(findItem)
			// } else {

			// }
		},
		handleChangeSignComp(val) {
			let findItem = this.signCompList.find(item => item.label === val)
			this.bookDetailForm.signCompName = val
			this.bookDetailForm.signCompCode = findItem ? findItem.value : ''
			// 切换签约分公司，协同参与人值重置为空
			if (val) {
				this.$emit('emptyJointWorkAssign')
			}
		},
		handleChnageCompany(val) {
			let findItem = this.payCompanyOptions.find(item => item.deptCode === val)
			this.bookDetailForm.payCompanyName = findItem ? findItem.label : ''
		},
		showTooltip(event, value, type) {
			// console.log('event', event);
			let val = value
			if (type === 'payMode') {
				val = getDictLabel('payMode', value)
			}
			this.$emit('showCopyTip', event, val)
		},
		hiddenTooltip() {
			this.$emit('hiddenCopyTip')
		},
		// 切换是否包含驳船
		handleChangeIncludeFeeder(val) {
			this.$emit('change', val)
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
			this.bookDetailForm.ship.transitPortCode1 = ''
			this.transitPortItem1 = {}
		},
		// 删除中转港3
		handleDeleteTwo() {
			this.transitPortTwoShow = false
			this.bookDetailForm.ship.transitPortCode2 = ''
			this.transitPortItem2 = {}
		},
		handleCopyVessel(vessel, voyage, e) {
      let val = vessel && voyage ? `${vessel},${voyage}` : vessel ? vessel : voyage
      clip(val, e)
    },
		// 复制
		handleCopyPort(val, e) {
			clip(val, e)
		},
		clipboardSuccess() {
			this.$message({
				message: '复制成功',
				type: 'success',
				duration: 1500
			})
		},
		cancelJoint() {
			this.isRequired = true
			this.$emit('cancelJoint')
		},
		fillPolPort(portCodes) {
			console.log('🚀 ~ portCodes', portCodes)
			// 港口数据反显
			if (portCodes) {
				let { podPortCode, unloadingPortCode, polPortCode, transitPortCode, transitPortCode1, transitPortCode2 } = this.bookDetailForm.ship
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
					this.polPortList = initPortData.filter(item => item.portCode === this.bookDetailForm.ship.polPortCode)
					this.polPortItem = this.polPortList.find(item => item.portCode === polPortCode)
					this.transitPortList = initPortData.filter(item => item.portCode === transitPortCode)
					this.transitPortItem = this.transitPortList.find(item => item.portCode === transitPortCode)
					this.transitPortList1 = initPortData.filter(item => item.portCode === transitPortCode1)
					this.transitPortItem1 = this.transitPortList1.find(item => item.portCode === transitPortCode1)
					this.transitPortList2 = initPortData.filter(item => item.portCode === transitPortCode2)
					this.transitPortItem2 = this.transitPortList2.find(item => item.portCode === transitPortCode2)
					if (this.bookDetailForm.barge && this.bookDetailForm.barge.porPortCode) {
						this.porPortList = initPortData.filter(item => item.portCode === this.bookDetailForm.barge.porPortCode)
						this.porPortItem = this.porPortList.find(item => item.portCode === this.bookDetailForm.barge.porPortCode)
					}
					let portItem = this.polPortList.find(item => item.portCode === polPortCode)
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
			// 获取国家code
			this.countryName = findItem ? findItem.countryName : ''
			let area = findItem ? findItem.area : ''
			this.$set(this.bkgJointParam, 'polArea', area)
			if (!val || !area.includes('华东')) this.bookDetailForm.docEmployeeId = null
			if (area.includes('华东') && this.bkgJointParam.isJoint) {
				this.getDocEmployee()
			}
			this.bookDetailForm.ship.contractNo = ''
			// this.bookDetailForm.ship.contractCompany = ''
			if (val && this.isPricing) {
				// 有协同的话改用order/work/audit/work/list这个接口重新获取参与人
				if (this.orderIsJoint === 'Y') {
					let param = {
						sysLineCode: this.bookDetailForm.ship.sysLineCode,
						shipCarrierCode: this.bookDetailForm.ship.shipCarrierCode,
						polPortCode: this.bookDetailForm.ship.polPortCode,
						bkgAgentSupplierId: this.bookDetailForm.ship.bkgAgentSupplierId
					}
					this.$emit('getWorkAssign', param)
				} else {
					// 变更bkg岗位分配信息
					this.updateBkg('大船起运港')
				}
			}
		},
		// 获取配置的文件参与人信息
		getDocEmployee() {
			let data = {
				orderNo: this.$route.query.orderNo,
				deptCode: this.userInfo.deptCode,
				sysLineCode: this.bookDetailForm.ship.sysLineCode,
				shipCarrierCode: this.bookDetailForm.ship.shipCarrierCode,
				polPortCode: this.bookDetailForm.ship.polPortCode,
				bkgAgentSupplierId: this.bookDetailForm.ship.bkgAgentSupplierId
			}
			orderWorkSi(data).then(res => {
				// 在这里获取doc的职员信息
				let docUpdateItem = res.data.find(item => item.jobCode === 'doc' && item.employeeId)
				if (docUpdateItem) {
					this.$set(this.bookDetailForm, 'docEmployeeId', docUpdateItem.employeeId || '')
					this.$set(this.bookDetailForm, 'docEmployeeName', docUpdateItem.employeeName || '')
					this.$set(this.employeeListParam, 'doc', [{ label: this.bookDetailForm.docEmployeeName, value: this.bookDetailForm.docEmployeeId }])
				}
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
			// 获取国家code
			let portItem = this.podPortList.find(item => item.portCode === val)
			this.podPortItem = portItem || {}
			let countryCode = portItem ? portItem.countryCode : ''
			this.$emit('getCountryCode', countryCode)
			this.bookDetailForm.ship.contractNo = ''
			// 根据目的港自动匹配系统航线
			this.initSystemLine(val)
			// this.bookDetailForm.ship.contractCompany = ''
		},
		initSystemLine(val) {
			if (val) {
				portSystemLineInfo(val).then(response => {
					let systemLineList = response.data
					if (systemLineList.length > 0) {
						let systemLine = systemLineList[0]
						if (this.bookDetailForm.ship.sysLineCode !== systemLine.sysLineCode && this.isPricing) {
							let param = {
								sysLineCode: systemLine.sysLineCode,
								shipCarrierCode: this.bookDetailForm.ship.shipCarrierCode,
								polPortCode: this.bookDetailForm.ship.polPortCode,
								bkgAgentSupplierId: this.bookDetailForm.ship.bkgAgentSupplierId
							}
							this.$emit('getWorkAssign', param)
						}
						this.bookDetailForm.ship.sysLineCode = systemLine.sysLineCode
						this.sysLineName = systemLine.cname
					}
				})
			}
		},
		// 中转港1
		transitPortVisibleChange(val) {},
		transitPortFilterMehod(val) {
			this.transitPortSearch(val, 'port_of_basic', this.state)
		},
		handleChangeTransitPortCode(val) {
			let findItem = this.transitPortList.find(item => item.portCode === val)
			this.transitPortItem = findItem || {}
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
		// 中转港2
		transitPortOneVisibleChange(val) {},
		transitPortOneFilterMehod(val) {
			this.transitPortOneSearch(val, 'port_of_basic', this.state)
		},
		handleChangeTransitPortCodeOne(val) {
			let findItem = this.transitPortList1.find(item => item.portCode === val)
			this.transitPortItem1 = findItem || {}
		},
		// 中转港2下拉数据
		transitPortOneSearch(queryString, portAttribute, state) {
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
		// 中转港3
		transitPortTwoVisibleChange(val) {},
		transitPortTwoFilterMehod(val) {
			this.transitPortTwoSearch(val, 'port_of_basic', this.state)
		},
		handleChangeTransitPortCodeTwo(val) {
			let findItem = this.transitPortList2.find(item => item.portCode === val)
			this.transitPortItem2 = findItem || {}
		},
		// 中转港3下拉数据
		transitPortTwoSearch(queryString, portAttribute, state) {
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
		shipCarrierVisibleChange(val) {
			if (val) this.shipQuerySearch('')
		},
		shipCarrierRemoteMethod(val) {
			this.shipQuerySearch(val)
		},
		handleChangeShipCarrier(val) {
			// 若船司为“MAERSK”，则“是否线上”默认选中“是” v20220621
			this.bookDetailForm.isOnline = val === 'MAERSK' ? 'Y' : 'N'

			if (val && this.isPricing) {
				let param = {
					sysLineCode: this.bookDetailForm.ship.sysLineCode,
					shipCarrierCode: this.bookDetailForm.ship.shipCarrierCode,
					polPortCode: this.bookDetailForm.ship.polPortCode,
					bkgAgentSupplierId: this.bookDetailForm.ship.bkgAgentSupplierId
				}
				this.$emit('getWorkAssign', param)
			}
		},
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
		handleSearchVesselTime() {
			let { shipCarrierCode, polPortCode, podPortCode, vessel, voyage } = this.bookDetailForm.ship
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
			!this.bookDetailForm.ship.bkgAgentSupplierId &&
				this.getSupplierList(category).then(res => {
					this.bkgAgentSupplierList = res.data.list.map(ele => {
						return Object.assign(ele, {
							label: this.$language == 'en' ? ele.ename : ele.name,
							value: ele.supplierId
						})
					})
				})
		},
		handleChangeBkgAgent(val) {
			// 变更参与人岗位分配信息
			if (val) {
				if (this.isPricing) {
					if (this.orderIsJoint === 'Y') {
						let param = {
							sysLineCode: this.bookDetailForm.ship.sysLineCode,
							shipCarrierCode: this.bookDetailForm.ship.shipCarrierCode,
							polPortCode: this.bookDetailForm.ship.polPortCode,
							bkgAgentSupplierId: this.bookDetailForm.ship.bkgAgentSupplierId
						}
						this.$emit('getWorkAssign', param)
					} else {
						this.updateBkg('订舱代理')
					}
				}
				let findItem = this.bkgAgentSupplierList.find(item => item.value === val)
				this.bookDetailForm.ship.bkgAgentSupplierName = findItem ? findItem.label : ''
				this.$emit('updateBkgAgentList')
				supplierInfo({ supplierId: val }).then(res => {
					let { category } = res.data
					// 订舱代理的客户类型为自订，是否外配不可修改，值改为否
					if (category.includes('bkg_carrier')) {
						this.bookDetailForm.isExternal = 'n'
						this.isExternalDisabled = true
					} else {
						this.isExternalDisabled = false
						this.bookDetailForm.isExternal = ''
					}
				})
			} else {
				this.bookDetailForm.ship.bkgAgentSupplierId = null
				this.bookDetailForm.ship.bkgAgentSupplierName = ''
				this.isExternalDisabled = false
				this.bookDetailForm.isExternal = ''
			}
		},
		getSupplierInfo(val) {
			supplierInfo({ supplierId: val }).then(res => {
				let { category } = res.data
				// 订舱代理的客户类型为自订，是否外配不可修改，值改为否
				if (category.includes('bkg_carrier')) {
					// this.bookDetailForm.isExternal = 'n'
					this.isExternalDisabled = true
				} else {
					this.isExternalDisabled = false
				}
			})
		},
		// 报关行
		declarationRemoteMethod(val) {
			this.getCustomsList(val, 'category', 'declaration')
		},
		declarationVisibleChange(val) {
			!this.bookDetailForm.transport.customsSupplierId && this.getCustomsList(val, 'category', 'declaration')
		},
		// 车队
		truckRemoteMethod(val) {
			this.getCustomsList(val, 'serviceCode', 'truck')
		},
		truckVisibleChange(val) {
			!this.bookDetailForm.transport.truckSupplierId && this.getCustomsList(val, 'serviceCode', 'truck')
		},
		handleChangeTruck(val) {
			if (val) {
				let findItem = this.truckSupplierList.find(item => item.value === val)
				this.bookDetailForm.transport.truckSupplierName = findItem ? findItem.label : ''
			} else {
				this.bookDetailForm.transport.truckSupplierId = null
				this.bookDetailForm.transport.truckSupplierName = ''
			}
		},
		handleChangeDeclaration(val) {
			if (val) {
				let findItem = this.declarationSupplierList.find(item => item.value === val)
				this.bookDetailForm.transport.customsSupplierName = findItem ? findItem.label : ''
			} else {
				this.bookDetailForm.transport.customsSupplierId = null
				this.bookDetailForm.transport.customsSupplierName = ''
			}
		},
		handleChangeExternal(val) {
			// console.log('external', val)
		},
		// // 拿价人
		// pricerRemoteMethod(val) {
		// 	this.pricerSearch(val, 'priceEmployeeId')
		// },
		// pricerVisibleChange(val) {
		// 	if (val) {
		// 		this.pricerSearch('', 'priceEmployeeId')
		// 	}
		// },
		// handleChangePricer(val) {
		// 	let findItem = this.pricerList.find(item => item.value === val)
		// 	this.bookDetailForm.priceEmployeeName = findItem ? findItem.label : ''
		// },
		// // 获取拿价人下拉
		// pricerSearch(val, key) {
		// 	let data = {
		// 		name: val ? val.replace(/^\s+|\s+$/g, '') : '',
		// 		roleCode: 'pricing'
		// 	}
		// 	baseDeptParticipants(data).then(res => {
		// 		this.pricerList = res.data.map(item => {
		// 			return Object.assign(item, {
		// 				label: this.$language == 'en' ? item.ename : item.cname,
		// 				value: item.employeeId
		// 			})
		// 		})
		// 	})
		// },
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
			this.bookDetailForm.bkgEmployeeId = val
			this.bookDetailForm.bkgEmployeeName = findItem ? findItem.label : ''
			this.$set(this.employeeListParam, 'bkg', [{ label: this.bookDetailForm.bkgEmployeeName, value: val }])
			this.isUpdateBkg = false
		},
		// 获取订舱人下拉
		bkgEmployeeSearch(val, key) {
			// console.log('this.userInfo', this.userInfo)
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: 'bkg',
				deptCode: this.userInfo.deptCode
			}
			baseDeptParticipants(data).then(res => {
				let saveList = [{ label: this.bookDetailForm.bkgEmployeeName, value: this.bookDetailForm.bkgEmployeeId }].filter(ele => ele.value)
				let resList = res.data.map(item => {
					return Object.assign(item, {
						label: this.$language == 'en' ? item.ename : item.cname,
						value: item.employeeId
					})
				})
				let filterArr = resList.filter(ele => !saveList.find(o => o.value === ele.employeeId))
				this.bkgEmployeeList = [...saveList, ...filterArr]
				// console.log('this.bkgEmployeeList111111111111', this.bkgEmployeeList)
			})
		},
		// 文件人下拉(订舱费用录入)
		docEmployeeRemoteMethod(val) {
			val !== undefined && this.docEmployeeSearch(val)
		},
		docEmployeeVisibleChange(val) {
			if (val) {
				this.docEmployeeSearch('')
			}
		},
		handleChangeDocEmployee(val) {
			let findItem = this.docEmployeeList.find(item => item.value === val)
			this.bookDetailForm.docEmployeeId = val
			this.bookDetailForm.docEmployeeName = findItem ? findItem.label : ''
			this.$set(this.employeeListParam, 'doc', [{ label: this.bookDetailForm.docEmployeeName, value: val }])
		},
		// 获取文件下拉
		docEmployeeSearch(val, key) {
			// if (val === undefined) return
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: 'doc',
				deptCode: this.userInfo.deptCode
			}
			baseDeptParticipants(data).then(res => {
				let resList = res.data.map(item => {
					return Object.assign(item, {
						label: this.$language == 'en' ? item.ename : item.cname,
						value: item.employeeId
					})
				})
				let saveList = [{ label: this.bookDetailForm.docEmployeeName, value: this.bookDetailForm.docEmployeeId }].filter(ele => ele.value)
				let filterArr = resList.filter(ele => !saveList.find(o => o.value === ele.employeeId))
				this.docEmployeeList = [...saveList, ...filterArr]
				// console.log('this.docEmployeeList111111111111', this.docEmployeeList)
			})
		},
		// 协助审单人
		auditEmployeeRemoteMethod(val) {
			this.auditEmployeeSearch(val)
		},
		auditEmployeeVisibleChange(val) {
			if (val) {
				this.auditEmployeeSearch('')
			}
		},
		handleChangeAuditEmployee(val) {
			this.isRequired = val ? false : true
		},
		// 获取协助审单人下拉
		auditEmployeeSearch(val, key) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: 'pricing'
			}
			baseDeptParticipants(data).then(res => {
				this.auditEmployeeList = res.data.map(item => {
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
							{ column: 'serviceCode', type: 'in', value: 'book,proxy_book' }
					  ]
			}
			return supplierList(data)
		},
		// 供应商信息模糊查询
		getCustomsList(queryString, category, type) {
			this.$store.dispatch('dict/querySupplierList', { category: category, value: type, queryString: queryString }).then(data => {
				let list =
					(data.list &&
						data.list.map(ele => {
							return Object.assign(ele, {
								label: this.$language == 'en' ? ele.ename : ele.name,
								value: ele.supplierId ? Number(ele.supplierId) : ''
							})
						})) ||
					[]
				if (type === 'declaration') this.declarationSupplierList = list
				if (type === 'truck') this.truckSupplierList = list
			})
		},
		// 单独修改参与人中的bkg人员
		updateBkg(fieldName) {
			// 存在协同参与人不触发变更bkg人员
			if (this.orderIsJoint === 'Y') return
			let data = {
				orderNo: this.$route.query.orderNo,
				sysLineCode: this.bookDetailForm.ship.sysLineCode,
				shipCarrierCode: this.bookDetailForm.ship.shipCarrierCode,
				polPortCode: this.bookDetailForm.ship.polPortCode,
				bkgAgentSupplierId: this.bookDetailForm.ship.bkgAgentSupplierId
			}
			orderWork(data).then(res => {
				// 在这里获取bkg的职员信息
				let bkgItem = res.data.find(item => item.jobCode === 'bkg' && item.employeeId)
				// console.log('bkgEmployeeId', this.bookDetailForm.bkgEmployeeId);
				if (bkgItem) {
					if (this.bookDetailForm.bkgEmployeeId !== bkgItem.employeeId) {
						this.$message({
							type: 'warning',
							dangerouslyUseHTMLString: true,
							message: `${fieldName}已被修改，请注意<strong>订舱人员已更新</strong>`
						})
						this.isUpdateBkg = true
						this.$emit('updateBkg', bkgItem)
					}
					this.bookDetailForm.bkgEmployeeId = bkgItem.employeeId
					this.bookDetailForm.bkgEmployeeName = bkgItem.employeeName
					this.bkgEmployeeList = [{ label: this.bookDetailForm.bkgEmployeeName, value: this.bookDetailForm.bkgEmployeeId }]
				}
			})
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
.port-row-pop {
	font-size: 12px;
	em {
		cursor: pointer;
		font-style: normal;
		color: #3e80f5;
		margin-left: 5px;
	}
}
.port-popover {
	font-size: 12px;
	em {
		cursor: pointer;
		font-style: normal;
		color: #3e80f5;
		margin-left: 5px;
	}
}
.vessel-time-popover {
	margin-left: 5px;
}
.contract-temp-cont {
	margin: 0 8px 8px;
	border: 1px solid #e9e9e9;
	overflow: hidden;
	.contract-temp-tit {
		line-height: 24px;
		height: 24px;
		background: #f8f9fd;
		border-radius: 2px 2px 0 0;
		font-size: 12px;
		padding: 0 8px;
		display: flex;
		justify-content: space-between;
		.tit {
		}
		.btn-groups {
			.save {
				color: #1890ff;
				font-style: normal;
				cursor: pointer;
			}
			.del {
				color: #cd4130;
				font-style: normal;
				cursor: pointer;
				margin-left: 10px;
			}
		}
	}
	.contract-temp-list {
		margin: 10px;
	}
}
</style>
