<template>
	<div class="edit-container" id="selfOrder">
		<div id="comOrderInfo">
			<ComOrderInfo ref="first" :createItem="createItem" :orderStatus="createItem.orderStatus" :serviceTypeOptions="serviceTypeOptions" :serviceCodeOptions="serviceCodeOptions" @getHeight="getShipInfoHeight" @updateCust="updateCust">
				<div class="operateBtn-group">
					<div class="btn-groups">
						<!-- orderInfoDataObj.bdManageEmployeeId===userId && createItem.orderStatus==='pre_submit' -->
						<template v-if="orderInfoDataObj.bdManageEmployeeId===userId && createItem.orderStatus==='pre_submit'">
							<!-- 当前用户是业务主管，并且订单状态是待业务主管审核 -->
							<el-button size="mini" type="primary" @click="handleSubmit" :disabled="submitDisabled">通过</el-button>
							<el-button size="mini" type="danger"  @click="bdManageRefusePopShow=true" style="margin-left: 10px;">拒绝</el-button>
						</template>
						<template v-else>
							<template v-if="$route.query.source !== 'jointList'">
								<template v-if="isBd">
									<el-button size="mini" type="primary" @click="handleSave" :disabled="submitDisabled" v-if="['draft', 'refuse'].includes(createItem.orderStatus)">保存</el-button>
									<el-button size="mini" type="primary" @click="handleSubmit" :disabled="submitDisabled" v-if="['draft', 'refuse'].includes(createItem.orderStatus)">提交</el-button>
									<template v-if="!isBulkRo">
										<el-button size="mini" type="danger" class="ml10" @click="handleCancelRequest" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus) && createItem.cancelApplyStatus !== 'applied'">{{isOrderFeeCount ? '终止' : '取消'}}</el-button>
									</template>
									<template v-else>
										<el-button size="mini" type="danger" class="ml10" @click="handleCancelRequest" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus) && createItem.cancelApplyStatus !== 'applied' && ['book_release', 'release_custom'].includes(createItem.bkgStatus)">{{isOrderFeeCount ? '终止' : '取消'}}</el-button>
									</template>
									<el-button
										size="mini"
										type="default"
										class="submitCancel"
										@click="handleCancelCancel"
										:disabled="submitDisabled"
										v-if="createItem.cancelApplyStatus === 'applied' && createItem.orderStatus !== 'break' && createItem.orderStatus !== 'cancel'"
										>{{isOrderFeeCount ? '撤回终止' : '撤回取消'}}</el-button
									>
									<el-button size="mini" type="danger" @click="handleDelete" :disabled="submitDisabled" v-if="createItem.orderStatus === 'draft'">删除</el-button>
									<el-button size="mini" type="default" class="submitCancel" @click="handleSubmitCancel" :disabled="submitDisabled" v-if="createItem.orderStatus === 'submit'">撤回</el-button>
									<el-button size="mini" type="default" class="" @click="handleCopy" :disabled="submitDisabled" v-if="!addState">复制</el-button>
									<template v-if="isOrderFeeCount">
										<el-button size="mini" type="danger" class="" @click="handleBreak" :disabled="submitDisabled" v-if="createItem.orderStatus === 'refuse'">终止</el-button>
									</template>
									<el-button size="mini" type="default" @click="handleClose" :disabled="submitDisabled" v-else-if="createItem.orderStatus === 'refuse'">关闭</el-button>
								</template>
								<!-- 操作 -->
								<template v-if="isOp">
									<el-button size="mini" type="primary" @click="handleEdit" v-if="opEditState" :disabled="submitDisabled">保存</el-button>
								</template>
								<el-button size="mini" type="primary" class="" @click="handleExportPlan">输出计划单</el-button>
								<el-button v-if="viewOpPlan" size="mini" type="primary" class="" @click="handleToPlan">智能计划单</el-button>
								<template v-if="isOp">
									<template v-if="!isBulkRo">
										<el-button size="mini" type="danger" class="" @click="handleOpCancelRequest('cancel')" :disabled="submitDisabled" v-if="!['CANCEL','BREAK'].includes(createItem.cancelJointHandleStatus) && ['pass'].includes(createItem.orderStatus) && !isOrderFeeCount">取消</el-button>
										<el-button size="mini" type="danger" class="" @click="handleOpCancelRequest('break')" :disabled="submitDisabled" v-if="!['CANCEL','BREAK'].includes(createItem.cancelJointHandleStatus) && ['pass'].includes(createItem.orderStatus) && isOrderFeeCount">终止</el-button>
									</template>
									<template v-else>
										<el-button size="mini" type="danger" class="" @click="handleOpCancelRequest('cancel')" :disabled="submitDisabled" v-if="!['CANCEL','BREAK'].includes(createItem.cancelJointHandleStatus) && ['pass'].includes(createItem.orderStatus) && ['book_release', 'release_custom'].includes(createItem.bkgStatus) && !isOrderFeeCount">取消</el-button>
										<el-button size="mini" type="danger" class="" @click="handleOpCancelRequest('break')" :disabled="submitDisabled" v-if="!['CANCEL','BREAK'].includes(createItem.cancelJointHandleStatus) && ['pass'].includes(createItem.orderStatus) && ['book_release', 'release_custom'].includes(createItem.bkgStatus) && isOrderFeeCount">终止</el-button>
									</template>
									<el-button size="mini" type="success" class="" @click="handleFinish" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">完成</el-button>
									<!-- <el-button size="mini" type="default" class="" @click="handleJointService" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">协同</el-button> -->
								</template>
								<!-- 操作 -->
								
								<template v-if="isOp || isOpcustomsOrOpwh">
									<el-button size="mini" type="default" class="" @click="handleJointService" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">协同</el-button>
								</template>
								<template v-if="isDoc">
									<el-button size="mini" type="primary" @click="handleEdit" v-if="['pass'].includes(createItem.orderStatus)" :disabled="submitDisabled">保存</el-button>
								</template>
								<template v-if="(isEcs || isEpricing) && !isOp">
									<el-button size="mini" type="primary" class="" @click="handleEdit" v-if="EcsEditState" :disabled="submitDisabled">保存</el-button>
								</template>
								<!-- 拖报操作 功能暂不开放-->
								<!-- <template v-if="isOpTruck">
									<el-button size="mini" type="default" class="" @click="handleJointService" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">协同</el-button>
								</template> -->
							</template>
							<template v-if="$route.query.source === 'jointList'">
								<!-- 20220113版本 协同单增加打印计划单功能 刘小志开发 -->
								<el-button size="mini" type="primary" class="" @click="handleExportPlan">输出计划单</el-button>
								<el-button v-if="viewOpPlan" size="mini" type="primary" class="" @click="handleToPlan">智能计划单</el-button>
								<template v-if="isOp">
									<el-button size="mini" type="primary" class="" @click="handleJointSave" v-if="['pass'].includes(createItem.orderStatus)" :disabled="submitDisabled">保存</el-button>
								</template>
								<template v-if="(isEcs || isEpricing) && !isOp">
									<el-button size="mini" type="primary" class="" @click="handleJointSave" v-if="EcsEditState" :disabled="submitDisabled">保存</el-button>
								</template>
							</template>
						</template>
						<!-- <el-button size="mini" type="default" @click="handleGoBack" :disabled="submitDisabled">返回</el-button> -->
					</div>
					<div class="status">
						<span class="label">订单状态:</span>
						<span
							class="value"
							:class="createItem.orderStatus === 'complete' || createItem.orderStatus === 'pass' ? 'green' : createItem.orderStatus === 'submit' || createItem.orderStatus === 'pre_submit' ? 'yellow' : ['refuse', 'cancel', 'break'].includes(createItem.orderStatus) ? 'red' : 'black'"
						>
							<i></i>{{ orderStatusFilter(createItem.orderStatus, $route.query.action) }}
						</span>
						<span class="label ml10">关账状态:</span>
						<span class="value" :class="finCloseStatusCn === '已关账' ? 'green' : finCloseStatusCn === '预关账' ? 'blue' : 'black'"><i></i>{{ finCloseStatusCn }}</span>
					</div>
				</div>
			</ComOrderInfo>
			<div v-if="isOp && isBulkRo" class="lcl-bkg-status">
				<span class="status-title">订舱状态:</span>
				<el-radio-group v-model="bulkRoBkgStatus" :disabled="!['pass'].includes(createItem.orderStatus)">
					<el-radio :label="item.value" v-for="(item, index) in bkgStatusList" :key="item.value" :disabled="index < bkgStatusIndex">{{ item.label }}</el-radio>
				</el-radio-group>
			</div>
		</div>
		
		<div class="order-cont ship-selfOrder-cont">
			<el-form ref="selfOrderSubmit" :model="createItem" :rules="rules" class="order-cont-form row-body">
				<!-- 订舱信息 -->
				<div class="ship-cont" ref="shipInfoCont" :class="workAssignShow ? 'abs-toogle' : ''" :style="{ height: `${shipInfoHeight}px` }">
					<div class="toggleWorkAssign" @click="toggleWorkAssign">
						<i class="hamburger el-icon-arrow-right" :class="{ 'is-active': true }"></i>
					</div>
					<h1 class="orderInfo-h1">基本信息</h1>
					<div class="row-flex" style="margin-top: 0">
						<div class="orderbook-info-table">
							<div class="table-td">
								<div class="cont">
									<div class="h1">
										<span class="label">港口信息</span>
										<div class="include-barge">
											<el-checkbox size="mini" v-model="includeFeeder" true-label="y" false-label="n" :disabled="setDisabled()" @change="hadnleChangeIncludeFeeder">包含驳船</el-checkbox>
										</div>
									</div>
									<div class="pd8 flex-form-item">
										<el-form-item :required="true" label="驳船收货地" prop="barge.porPortCode" :show-message="false" v-if="includeFeeder === 'y'">
											<div class="port-flex-form">
												<div class="port-code">
													<el-select
														size="mini"
														v-model="createItem.barge.porPortCode"
														filterable
														remote
														clearable
														:disabled="setDisabled()"
														style="width: 100%"
														placeholder="请输入"
														:remote-method="porPortFilterMehod"
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
														:disabled="setDisabled() && isView"
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
														:disabled="setDisabled() && isView"
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
														size="mini"
														v-model="createItem.ship.polPortCode"
														filterable
														remote
														clearable
														:disabled="setDisabled()"
														style="width: 100%"
														placeholder="请输入"
														:remote-method="polPortFilterMehod"
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
														remote
														clearable
														:disabled="setDisabled() && isView"
														style="width: 100%"
														placeholder="请输入"
														:remote-method="unloadPortFilterMehod"
														@visible-change="unloadPortVisibleChange"
														@change="handleChangeUnloadPortCode"
													>
														<el-option v-for="item in unloadingPortList" :key="item.value" :label="item.value" :value="item.value">
															<span>{{ item.label }}</span>
														</el-option>
													</el-select>
												</div>
												<PortPopover :portItem="unloadPortItem" />
											</div>
										</el-form-item>
										<el-form-item label="目的地" prop="ship.podPortCode" :show-message="false">
											<div class="port-flex-form">
												<div class="port-code">
													<el-select
														size="mini"
														v-model="createItem.ship.podPortCode"
														filterable
														remote
														clearable
														:disabled="setDisabled() && isView"
														style="width: 100%"
														placeholder="请输入"
														:remote-method="podPortFilterMehod"
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
										<el-form-item label="系统航线" prop="ship.sysLineCode" :show-message="false">
											<el-input clearable size="mini" placeholder="请输入" v-model="sysLineName" disabled></el-input>
										</el-form-item>
										<el-form-item label="国家" :show-message="false">
											<el-input type="text" clearable size="mini" placeholder="请输入" v-model="countryName" disabled></el-input>
										</el-form-item>
										<!-- 整箱客户自订字段 -->
										<template v-if="!isBulkRo">
											<el-form-item :required="true" label="驳船截关时间" prop="barge.cyCutOff" :show-message="false" v-if="includeFeeder === 'y'">
												<elDatePickerLimit size="mini" :field="'bargeCyCutOff'" v-model="createItem.barge.cyCutOff" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd"  :disabled="setDisabled() && isView" />
											</el-form-item>
											<el-form-item label="驳船实际开船时间" prop="barge.tdTime" :show-message="false" v-if="includeFeeder === 'y'">
												<elDatePickerLimit
												  :field="'bargeTdTime'"
													 noCanFuture 
													size="mini"
													v-model="createItem.barge.tdTime"
													type="date"
													style="width: 100%"
													clearable
													placeholder="请选择"
													value-format="yyyy-MM-dd"
													:disabled="setDisabled() && isView && !isDocEdit"
												/>
											</el-form-item>
										</template>
										<el-form-item label="驳船中转方式" prop="barge.transitWay" :show-message="false" v-if="includeFeeder === 'y'">
											<el-select v-model="createItem.barge.transitWay" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="setDisabled()">
												<el-option v-for="item in dictMap.transferMode" :label="item.label" :value="item.value" :key="item.value"></el-option>
											</el-select>
										</el-form-item>
									</div>
								</div>
							</div>
							<div class="table-td">
								<div class="cont">
									<div class="h1">
										<span class="label">船东信息</span>
									</div>
									<div class="pd8 flex-form-item label100">
										<el-form-item :required="true" label="船公司" prop="ship.shipCarrierCode" :show-message="false" class="vessel-time">
											<el-select
												size="mini"
												v-model="createItem.ship.shipCarrierCode"
												filterable
												remote
												clearable
												:disabled="setDisabled()"
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
										<!-- 散杂滚装客户自订字段 -->
										<template v-if="isBulkRo">
											<el-form-item :required="true" label="驳船截关时间" prop="barge.cyCutOff" :show-message="false" v-if="includeFeeder === 'y'">
												<elDatePickerLimit size="mini" :field="'bargeCyCutOff'" v-model="createItem.barge.cyCutOff" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd"  :disabled="setDisabled() && isView" />
											</el-form-item>
											<el-form-item label="驳船预计开船时间" prop="barge.etdTime" :show-message="false" v-if="includeFeeder === 'y' || isOpView && hasInternalTradeBarge">
												<elDatePickerLimit
												  :field="'bargeEtdTime'"
													size="mini"
													v-model="createItem.barge.etdTime"
													type="date"
													style="width: 100%"
													clearable
													placeholder="请选择"
													value-format="yyyy-MM-dd"
													:disabled="setDisabled() && isView"
												/>
											</el-form-item>
											<el-form-item label="驳船实际开船时间" prop="barge.tdTime" :show-message="false" v-if="includeFeeder === 'y' || isOpView && hasInternalTradeBarge">
												<elDatePickerLimit
												  :field="'bargeTdTime'"
													noCanFuture 
													size="mini"
													v-model="createItem.barge.tdTime"
													type="date"
													style="width: 100%"
													clearable
													placeholder="请选择"
													value-format="yyyy-MM-dd"
													:disabled="setDisabled() && isView && !isDocEdit"
												/>
											</el-form-item>
										</template>
										<el-form-item :required="true" label="大船截关时间" prop="ship.cyCutOff" :show-message="false">
											<elDatePickerLimit :field="'cyCutOff'" size="mini" v-model="createItem.ship.cyCutOff" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd"  :disabled="setDisabled() && isView" />
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
												:disabled="setDisabled() && isView"
											/>
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
												:disabled="setDisabled() && isView"
											/>
										</el-form-item>
										<el-form-item label="大船预计开船时间" prop="ship.etdTime" :show-message="false" class="vessel-time" v-if="isBulkRo">
											<elDatePickerLimit
											  :field="'etdTime'"
												size="mini"
												v-model="createItem.ship.etdTime"
												type="date"
												style="width: 100%"
												clearable
												placeholder="请选择"
												value-format="yyyy-MM-dd"
												:disabled="setDisabled() && isView && !isDocEdit"
											/>
											<el-popover placement="top" width="280" trigger="click" class="vessel-time-popover" v-if="isDocEdit || !setDisabled() || !isView">
												<Schedule :vesselTime="vesselTime" 
													:tdTimeDisabled="setDisabled() && isView && !isDocEdit"
													@updateVesselTime="updateVesselTime" />
												<el-button slot="reference" type="default" size="mini" @click="handleSearchVesselTime">查询</el-button>
											</el-popover>
										</el-form-item>
										<el-form-item label="大船实际开船时间" prop="ship.tdTime" :show-message="false" class="vessel-time" v-if="!isBulkRo">
											<elDatePickerLimit
											  :field="'tdTime'"
												noCanFuture
												size="mini"
												v-model="createItem.ship.tdTime"
												type="date"
												style="width: 100%"
												clearable
												placeholder="请选择"
												value-format="yyyy-MM-dd"
												:disabled="setDisabled() && isView && !isDocEdit"
											/>
											<el-popover placement="top" width="280" trigger="click" class="vessel-time-popover" v-if="isDocEdit || !setDisabled() || !isView">
												<Schedule :vesselTime="vesselTime" 
													:tdTimeDisabled="setDisabled() && isView && !isDocEdit"
													@updateVesselTime="updateVesselTime" />
												<el-button slot="reference" type="default" size="mini" @click="handleSearchVesselTime">查询</el-button>
											</el-popover>
										</el-form-item>
										<el-form-item label="大船实际开船时间" prop="ship.tdTime" :show-message="false" class="vessel-time" v-if="isOpView && isBulkRo">
											<elDatePickerLimit
											  :field="'tdTime'"
												noCanFuture
												size="mini"
												v-model="createItem.ship.tdTime"
												type="date"
												style="width: 100%"
												clearable
												placeholder="请选择"
												value-format="yyyy-MM-dd"
												:disabled="setDisabled() && isView && !isDocEdit"
											/>
											<el-popover placement="top" width="280" trigger="click" class="vessel-time-popover" v-if="!setDisabled() || !isView">
												<Schedule :vesselTime="vesselTime" 
													:tdTimeDisabled="setDisabled() && isView && !isDocEdit"
													@updateVesselTime="updateVesselTime" />
												<el-button slot="reference" type="default" size="mini" @click="handleSearchVesselTime">查询</el-button>
											</el-popover>
										</el-form-item>
										<el-form-item class="timeSpecial" label="预计到港时间" prop="ship.etaTime" :show-message="false" v-if="isOpView && isBulkRo">
											<elDatePickerLimit size="mini" :field="'etaTime'" v-model="createItem.ship.etaTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="setDisabled() && isView && !isDocEdit" />
										</el-form-item>
										<el-form-item class="timeSpecial" label="实际到港时间" prop="ship.taTime" :show-message="false" v-if="isOpView && isBulkRo">
											<elDatePickerLimit noCanFuture :field="'taTime'" size="mini" v-model="createItem.ship.taTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :disabled="setDisabled() && isView && !isDocEdit" />
										</el-form-item>
										<div class="vessel-voyage-item">
											<div class="flex1">
												<el-form-item label="大船船名" prop="ship.vessel" :show-message="false" >
													<vessel-select
														v-model="createItem.ship.vessel"
														:orderNo="$route.query.orderNo"
														:disabledState="setDisabled() && isView"
														:shipCarrierCode="createItem.ship.shipCarrierCode"
														:polPortCode="createItem.ship.polPortCode"
														:podPortCode="createItem.ship.podPortCode"
														:copyBtnHide="true"
													/>
												</el-form-item>
												<el-form-item label="大船航次" prop="ship.voyage" :show-message="false">
													<voyage-select
														v-model="createItem.ship.voyage"
														:disabledState="setDisabled() && isView"
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
										<!-- <el-form-item label="大船船名" prop="ship.vessel" :show-message="false">
											<el-autocomplete
												style="width: 100%"
												size="mini"
												clearable
												v-model="createItem.ship.vessel"
												:disabled="setDisabled() && isView"
												:fetch-suggestions="(queryString, cb) => querySearchBookVessel(queryString, cb)"
												:trigger-on-focus="false"
												placeholder="请输入"
												:maxlength="128"
												@select="value => handleSelectBookVessel(value)"
												@clear="value => handleClearBookVessel(value)"
											></el-autocomplete>
										</el-form-item>
										<el-form-item label="大船航次" prop="ship.voyage" :show-message="false">
											<el-autocomplete
												style="width: 100%"
												size="mini"
												clearable
												v-model="createItem.ship.voyage"
												:disabled="setDisabled() && isView"
												:fetch-suggestions="(queryString, cb) => querySearchBookVoyage(queryString, cb, createItem.ship.vessel)"
												:trigger-on-focus="false"
												placeholder="请输入"
												:maxlength="128"
												@select="value => handleSelectBookVoyage(value)"
												@clear="value => handleClearBookVoyage(value)"
											></el-autocomplete>
										</el-form-item> -->
										<el-form-item label="驳船船名" prop="barge.vessel" :show-message="false" v-if="includeFeeder === 'y'">
											<el-autocomplete
												style="width: 100%"
												size="mini"
												clearable
												v-model="createItem.barge.vessel"
												:disabled="setDisabled() && isView"
												:fetch-suggestions="(queryString, cb) => querySearchVessel(queryString, cb)"
												placeholder="请输入"
												:maxlength="128"
												@select="value => handleSelectVessel(value)"
												@clear="value => handleClearVessel(value)"
											></el-autocomplete>
										</el-form-item>
										<el-form-item label="驳船船次" prop="barge.voyage" :show-message="false" v-if="includeFeeder === 'y'">
											<el-autocomplete
												style="width: 100%"
												size="mini"
												clearable
												v-model="createItem.barge.voyage"
												:disabled="setDisabled() && isView"
												:fetch-suggestions="(queryString, cb) => querySearchVoyage(queryString, cb, createItem.barge.vessel)"
												placeholder="请输入"
												:maxlength="128"
												@select="value => handleSelectVoyage(value)"
												@clear="value => handleClearVoyage(value)"
											></el-autocomplete>
										</el-form-item>
									</div>
								</div>
							</div>
							<div class="table-td">
								<div class="cont">
									<div class="h1">
										<span class="label">货运信息</span>
									</div>
									<div class="pd8 flex-form-item label70">
										<el-form-item :required="true" label="付款方式" prop="payMode" :show-message="false">
											<el-select v-model="createItem.payMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="setDisabled()">
												<el-option v-for="(item, index) in dictMap.payMode" :label="item.label" :value="item.value" :key="index"> </el-option>
											</el-select>
										</el-form-item>
										<el-form-item label="业务日期" prop="bizDate" :show-message="false" v-if="isOpView">
											<elDatePickerLimit size="mini" :style="{ width: showChangeBizDate ? 'calc(100% - 47px)' : '100%',marginRight:showChangeBizDate ? '5px':'0' }" v-model="createItem.bizDate" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd"  :disabled="true" />
											<el-button v-if="showChangeBizDate" @click="handleChangeBizDate" size="mini">修改</el-button>
										</el-form-item>
										<el-form-item label="航程跟踪" prop="ship.isTrack" :show-message="false" v-if="isOp && !isBulkRo">
											<el-select v-model="createItem.ship.isTrack" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="isView">
												<el-option v-for="(item, index) in dictMap.yesOrNoOptions" :label="item.label" :value="item.value" :key="index"> </el-option>
											</el-select>
										</el-form-item>
										<el-form-item label="委托备注" prop="intrustRemark" :show-message="false">
											<el-input type="textarea" clearable rows="4" maxlength="512" size="mini" placeholder="请输入" show-word-limit v-model="createItem.intrustRemark" :disabled="setDisabled()"></el-input>
										</el-form-item>
										<el-form-item label="备注" prop="bdRemark" :show-message="false" v-if="$route.query.source !== 'jointList'">
											<el-input class="loadingBdRemark" type="textarea" clearable rows="4" size="mini" placeholder="请输入" maxlength="512" show-word-limit v-model="createItem.bdRemark" @blur="handleSaveRemark" :disabled="!bdRemarkState"></el-input>
										</el-form-item>
									</div>
								</div>
							</div>
						</div>
					</div>
					<!-- 海外信息 -->
					<OverseasInfo :createItem="createItem" :businessType="createItem.businessType" :bdId="bdId" :polCode="createItem.ship.polPortCode" :podCode="createItem.ship.podPortCode" @updateGetInfo="updateGetInfo" :orderStatus="createItem.orderStatus" />
					<!-- 货物信息 -->
					<div class="row-cont">
						<div class="row-cont-tit">
							<span class="tit">货物信息</span>
							<span class="cargo-total" v-if="isBulkRo">
								<span class="item">总件数合计：{{ cargoTotal.quantity }}</span>
								<span class="item">总重量合计：{{ cargoTotal.weight }}KGS</span>
								<span class="item">总体积合计：{{ cargoTotal.volume }}CBM</span>
								<span class="item">总计费吨合计：{{ cargoTotal.feeWeight }}</span>
							</span>
						</div>
						<Cargo :createItem="createItem" :orderStatus="createItem.orderStatus" :countryCode="countryCode" ref="cargo" />
					</div>
					<!-- SO 整箱的显示，散杂滚装的不做SO-->
					<div class="so-container mt10" v-if="!isBulkRo">
						<div class="so-total">
							<el-button size="mini" type="primary" style="float: right" :disabled="setDisabled() && !isOpEditSo" @click="handleAddSo"><i class="el-icon-plus"></i>新增SO</el-button>
						</div>
						<div class="ml10 mt04 mr10">
							<el-table ref="soTable" border fit :data="soList" :span-method="objectSpanMethod" class="so-table-border">
								<el-table-column prop="so" label="SO号" align="center"></el-table-column>
								<el-table-column prop="containerType" label="箱型" align="center"></el-table-column>
								<el-table-column prop="num" label="箱量" align="center"></el-table-column>
								<el-table-column prop="weight" label="单柜重量(KGS)" align="center"></el-table-column>
								<!-- <el-table-column prop="fileNo" label="附件编号" align="center"></el-table-column> -->
								<el-table-column prop="fileName" label="附件名称" align="center" show-overflow-tooltip>
									<template slot-scope="scope">
										<div class="operate-group">
											<el-button class="underline" @click="handleView(scope.row.fileNo, scope.row.fileName)" type="text" size="mini">
												<span class="file-name-style">{{ scope.row.fileName }}</span>
											</el-button>
										</div>
									</template>
								</el-table-column>
								<el-table-column label="操作" align="center">
									<template slot-scope="scope">
										<div class="operate-group">
											<el-button class="underline" @click="handleUpdateSo(scope.row)" type="text" size="mini" v-if="isOpEditSo">编辑</el-button>
											<el-button class="underline" @click="handleDownload(scope.row.fileNo, scope.row.fileName)" type="text" size="mini" v-if="scope.row.fileName">下载</el-button>
											<el-button class="underline" @click="handleDeleteSo(scope.row)" type="text" size="mini" :disabled="setDisabled() && !isOpEditSo">删除</el-button>
										</div>
									</template>
								</el-table-column>
							</el-table>
						</div>
					</div>
				</div>
				<!-- 参与人与关键点 -->
				<div class="work-assign-cont" v-if="workAssignShow" :style="{ height: `${shipInfoHeight}px` }">
					<el-tabs v-model="activityKey" @tab-click="handleClick">
						<el-tab-pane v-for="item in workAssignMenus" :label="item.value" :name="item.key" :key="item.key"> </el-tab-pane>
					</el-tabs>
					<component
						:is="activityKey"
						:createItem="createItem"
						:orderStatus="createItem.orderStatus"
						:serviceList="createItem.serviceList"
						:orderWorkOptions="orderWorkOptions"
						:jointOrderWorkOptions="jointOrderWorkOptions"
						:obdDeptCode="obdDeptCode"
						:bdDeptCode="bdDeptCode"
						v-if="createItem.orderNo"
						:checkPointHeight="checkPointHeight"
						:jointAuditWorkData="jointAuditWorkData"
						:jointWorkData="jointWorkData"
					></component>
				</div>
			</el-form>
		</div>
		<!-- 取消订单弹窗 -->
		<div v-if="cancelOrderPopShow">
			<CancelOrder @close="cancelRequestPopClose" :orderNo="$route.query.orderNo" :cancelType="cancelType" :isBd="isBd" :isOp="isOp" :isOrderFeeCount="isOrderFeeCount"/>
		</div>
		<!-- 协同订单弹窗 -->
		<div v-if="jointServicePopShow">
			<JointService @close="jointServicePopClose" :createItem="createItem" />
		</div>
		<!-- so上传弹窗 -->
		<div v-if="soPopShow">
			<SoUpload @close="soPopClose" :param="soPopQuery"/>
		</div>
		 <div v-if="changeBizDateShow">
      <!-- <ChangeBizDatePop @close="changeBizDateClose" :bizDate="createItem.bizDate"></ChangeBizDatePop> -->
    </div>
		<!-- 拒绝弹窗 -->
      <div v-if="bdManageRefusePopShow">
        <RefuseBdManageDialog @close="bdManageRefusePopClose" />
      </div>
			<div v-if="saMailShow">
				<SaMail @close="saMailClose"></SaMail>
			</div>

	</div>
</template>
<script>
import { mapState } from 'vuex'
import clip from '@/utils/clipboard'
import { getDictLabel } from '@/utils/tools'
import { toViewPosition } from '@/utils/scroll-to.js'
import Cookies from 'js-cookie'
import ComOrderInfo from './components/comOrderInfo'
import Worker from './components/workerJoint'
import CheckPoint from './components/checkPoint'
import CancelOrder from './components/cancelOrder'
import JointService from './components/jointService'
import Cargo from './components/cargo'
import SoUpload from './self/soUpload'
import { baseBusinessList, baseBusinessServiceList, portSystemLineInfo } from '@/api/base'
import { arrayHasDuplicateValue } from '@/utils/index'
import { handleExportPlanCommon } from '@/utils/orderCommonMethod'
// import ChangeBizDatePop from '@/views/airTransport/order/orderList/components/changeBizDatePop'
// import RefuseBdManageDialog from '@/views/airTransport/order/orderList/components/refuseBdManageDialog'
import VesselSelect from '@/views/order/order/components/vesselSelect'
import VoyageSelect from '@/views/order/order/components/voyageSelect'
import SaMail from '@/views/order/order/orderList/components/saMail'
import {
	orderInfo,
	orderJointInfo,
	selfSave,
	orderSave,
	selfEdit,
	orderEdit,
	orderWork,
	orderCancelHandle,
	orderCopy,
	orderFinish,
	bookSoList,
	bookSoDelete,
	orderClose,
	orderDelete,
	orderSubmitCancel,
	jointAuditWork,
	jointWork,
	mainRemarkUpdate,
	orderCancelCancel,
	planExportReview,
	orderStatusChangeBreak,
	orderJointSave,
	orderContainerList,
	bizdateChange
} from '@/api/order/list'
import { getBookSoList } from '@/api/order/book/list'
import { orderFeeCount } from '@/api/fin/fee'
import PortPopover from './components/portPopover'
import Schedule from './components/schedule'
import OverseasInfo from './components/overseasInfo'
const defaultCreateQuery = {
	bizDate: '',
	orderNo: '',
	submitType: '',
	intrustRemark: '',
	bdRemark: '',
	payMode: 'prepaid',
	serviceList: [],
	barge: {
		porPortCode: '',
		cyCutOff: '',
		tdTime: '',
		etdTime: '',
		transitWay: '',
		vessel: '',
		voyage: ''
	},
	ship: {
		shipCarrierCode: '',
		polPortCode: '',
		unloadingPortCode: '',
		podPortCode: '',
		cyCutOff: '',
		tdTime: '',
		etaTime: '',
		taTime: '',
		etdTime: '',
		vessel: '',
		voyage: ''
	},
	workAssign: [],
	cargoList: [
		// 货品信息
		{
			boxRemark: '无' // 装箱要求
		}
	],
	quotationNumber:'',
	schemeNumber:''
}
export default {
	filters: {
		cargoSourceFilter(cargoSource) {
			return getDictLabel('cargoSource', cargoSource)
		}
	},
	data() {
		return {
			saMailShow:'',
			bulkRoBkgStatus: '',
			bkgStatusIndex: 0, // 当前订舱状态在订舱状态数组中的索引值
			bkgStatusList: [
				{ label: '未订舱', value: 'pass', en: 'pass' },
				{ label: '已订舱', value: 'booked', en: 'booked' },
				{ label: '上家已放舱', value: 'book_release', en: 'book_release' },
				{ label: '已放舱给客户', value: 'release_custom', en: 'release_custom' }
			],
			bdManageRefusePopShow:false,
			changeBizDateShow: false,
			bizDateModify:this.$store.state.order.orderInfoDataObj.bizDateModify,
			state: '',
			oQuery: this.$route.query,
			includeFeeder: '',
			workAssignShow: false,
			shipInfoHeight: '', // 订舱信息高度
			checkPointHeight: 0, // 关键点高度
			countryCode: '',
			createItem: Object.assign({}, defaultCreateQuery),
			opCargoItem: { ...this.$store.state.order.orderList.opCargoItem },
			rules: {},
			workAssignMenus: [
				{ key: 'Worker', value: '参与人' },
				{ key: 'CheckPoint', value: '关键点' }
			],
			activityKey: 'Worker',
			// 取消订单弹窗
			cancelOrderPopShow: false,
			cancelType: '',
			// 协同订单弹窗
			jointServicePopShow: false,
			// 港口反显数据
			fillPolData: {},
			orderWorkOptions: [],
			jointOrderWorkOptions: [],
			fillPortCodes: '',
			submitDisabled: false,
			shipCarrierOptions: [],
			polPortList: [],
			polPortItem: {},
			unloadingPortList: [],
			unloadPortItem: {},
			podPortList: [],
			podPortItem: {},
			porPortList: [],
			porPortItem: {},
			roLoadingPortList: [],
			roLoadingPortItem: {},
			roArrivalPortList: [],
      roArrivalPortItem: {},
			portList: [],
			pickerOptions: {
				disabledDate(date) {
					//disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
					// return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
				}
			},
			disabledState: false,
			soList: [],
			soSpanArr: [],
			soPos: 0,
			soPopShow: false,
			soPopQuery: {},
			serviceTypeOptions: [], // 服务类型下拉
			serviceCodeOptions: [], // 服务项下拉
			docService: ['doc', 'insurance', 'pod_ltl_delivery', 'pod_change_doc', 'pod_comm_clearance', 'pod_fcl_delivery', 'pod_warehouse', 'pod_wh_matter', 'pod_ltl_delivery'],
			jointAuditWorkData: {},
			jointWorkData: [],
			finCloseStatusCn: '', // 关账状态/预关账状态
			obdDeptCode: '', // obd部门code
			bdDeptCode: '',
			sysLineName: '',
			countryName: '',
			isNotRequiredWorker: ['eac', 'asst', 'obd', 'op_truck','op_customs','op_wh', 'doc', 'csc', 'line_cs', 'tc', 'rc', 'ecs', 'epricing'], // 非必填参与人
			vesselTime: {},
			vesselTimeParam: {},
			hasCn: false
		}
	},
	created() {
		this.init(this.orderInfo)
	},
	mounted() {
		window.addEventListener('resize', this.getShipInfoHeight)
		this.$nextTick(() => {
			this.getShipInfoHeight()
		})
	},
	destroyed() {
		window.removeEventListener('resize', this.getShipInfoHeight)
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles,
			specialEditRoles: state => state.order.orderList.specialEditRoles,
			userId: state => state.user.userId,
			roles: state => state.user.roles,
			order: state => state.order,
			finance: state => state.finance,
			orderList: state => state.order.orderList,
			orderInfoDataObj: (state) => state.order.orderInfoDataObj,
			isOrderFeeCount: state => state.order.isOrderFeeCount,
			custInfoObj: state => state.order.custInfoObj
		}),
		isOpcustomsOrOpwh(){
			// 是否是报关操作或者仓储操作
			if(this.specialEditRoles.includes('op_customs') || this.specialEditRoles.includes('op_wh') || this.specialEditRoles.includes('op_truck')){
				return true
			}
			return false
		},
		isManager() {
			return this.roles && this.roles.includes('manager')
		},
		isOpPlanTmp() {
			return this.roles && this.roles.includes('op_plan_tmp')
		},
		viewOpPlan() {
			let list = ['draft', 'close', 'cancel']
			return !list.includes(this.createItem.orderStatus) && (this.isManager || this.isOpPlanTmp)
		},
		bdId() {
      let { workAssign } = this.createItem
      let bdItem = workAssign && workAssign.find((el) => el.jobCode === 'bd')
      if (bdItem && bdItem.employeeId) {
        return bdItem.employeeId
      }
      return ''
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
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		hasDestination() {
			return arrayHasDuplicateValue(['pod_change_doc', 'pod_ltl_delivery', 'pod_fcl_delivery', 'pod_comm_clearance', 'pod_warehouse'], this.createItem.serviceList)
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
		isOpView() {
			return this.createItem.orderStatus === 'pass'
			// if (this.ordDetRole === 'bd' && this.createItem.orderStatus === 'pass') {
			// 	return true
			// }
			// if (this.roles.includes('op') || this.ordDetRole === 'doc' || this.ordDetRole === 'ac' || this.ordDetRole === 'op_truck') {
			// 	return true
			// }
			// return false
		},
		isOpTruck() {
			return this.ordDetRole === 'op_truck'
			// return this.userEditRoles.includes('op_truck')
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		isView() {
			// 协同订单不可编辑
			if (this.$route.query.source === 'jointList') return true
			// bd，除了草稿和拒绝状态的都不可编辑
			if (this.isBd && !['draft', 'refuse'].includes(this.createItem.orderStatus)) {
				return true
			}
			// op，除了审核通过状态的都不可编辑
			if (this.isOp && !['pass'].includes(this.createItem.orderStatus)) {
				return true
			}
			// 其他doc,ac,op_truck都不可编辑
			if (!this.ordDetRole || this.isDoc || this.isEpricing || this.isEcs || this.isAc || this.isOpTruck) {
				return true
			}
			return false
		},
		isDocEdit() {
			return this.ordDetRole === 'doc' && this.createItem.orderStatus === 'pass'
		},
		addState() {
			return !this.createItem.ship
		},
		bdRemarkState() {
			if (['draft', 'refuse', 'pass', 'complete'].includes(this.createItem.orderStatus)) {
				return true
			}
			return false
		},
		// 操作编辑保存按钮
		opEditState(){
			return this.createItem.orderStatus === 'pass' || this.createItem.orderStatus === 'break' && this.createItem.finCloseStatus !== 'yes'
		},
		EcsEditState() {
			return this.opEditState
		},
		// 操作可编辑so信息
		isOpEditSo() {
			return this.$route.query.source !== 'jointList' && this.ordDetRole === 'op' && this.createItem.orderStatus === 'pass'
		},
		// 存在协同服务项
		isJoint() {
			return this.createItem.serviceInfoList.some(ele => ele.isJoint === 'y')
		},
		// 操作取消按钮显示
		opCancelBtnShow() {
			return !['CANCEL','BREAK'].includes(this.createItem.cancelJointHandleStatus) && ['pass'].includes(this.createItem.orderStatus) && !this.isOrderFeeCount
		},
		// 操作终止按钮显示
		opBreakBtnShow() {
			return !['CANCEL','BREAK'].includes(this.createItem.cancelJointHandleStatus) && ['pass'].includes(this.createItem.orderStatus) && this.isOrderFeeCount
		},
		// 服务项包含内贸驳船
		hasInternalTradeBarge() {
      return this.createItem.serviceList.includes('internal_trade_barge')
    },
		// 散杂滚装
    isBulkRo() {
      return this.createItem.businessType === 'ship_bulk_ro'
		},
		cargoTotal() {
      let quantity = 0
			let weight = 0
			let volume = 0
			let feeWeight = 0
			this.createItem.cargoList.forEach(o => {
        quantity += o.quantity ? Number(o.quantity) : 0
        weight += o.weight ? Number(o.weight) : 0
				volume += o.volume ? Number(o.volume) : 0
				feeWeight += o.feeWeight ? Number(o.feeWeight) : 0
        weight = parseFloat(weight.toFixed(3))
				volume = parseFloat(volume.toFixed(3))
				feeWeight = parseFloat(feeWeight.toFixed(3))
      })
			return {
				quantity: quantity,
				weight: weight,
				volume: volume,
				feeWeight: feeWeight
			}
    }
	},
	components: {
		ComOrderInfo,
		Worker,
		CheckPoint,
		CancelOrder,
		JointService,
		Cargo,
		SoUpload,
		PortPopover,
		Schedule,
		OverseasInfo,
		ChangeBizDatePop,
		RefuseBdManageDialog,
		VesselSelect,
    VoyageSelect,
		SaMail
	},
	props: {
		orderInfo: {
			type: Object,
			default: () => ({})
		}
	},
	watch: {
		orderInfo: {
			handler(newVal) {
				this.init(newVal)
			},
			deep: true
		},
		ordDetRole: {
			handler(newVal) {
				this.getServiceTypes()
			}
		}
	},
	methods: {
		// sa邮件
		saMailClose() {
			this.saMailShow = false
		},
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
		// 船期查询结果直接填入订单详情
    updateVesselTime(val, key) {
      this.createItem.ship[key] = val
    },
		bdManageRefusePopClose(action){
      if (action === 'Confirm') {
        this.$emit('getInfo')
      }
      this.bdManageRefusePopShow = false
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
		handleGetOrderInfo() {
      let { orderNo, jointNo } = this.$route.query
      let params = {
        orderNo: orderNo
      }
      if (jointNo) {
        params.jointNo = jointNo
      }
      orderInfo(params).then((res) => {
        let { workAssign } = res.data
        if (workAssign.length) {
          let orderWorkOptions = workAssign.map((item) => {
            return Object.assign(item, { show: true })
          })
          for (let i = 0; i < this.orderWorkOptions.length; i++) {
            if (this.orderWorkOptions[i].jobCode === 'ecs' || this.orderWorkOptions[i].jobCode === 'epricing') {
              this.$set(this.orderWorkOptions[i],'employeeId',orderWorkOptions[i].employeeId)
              this.$set(this.orderWorkOptions[i],'employeeName',orderWorkOptions[i].employeeName)
            }
          }
        }
      })
    },
		// 船公司官网
		getShippingCarrierUrl(carrierCode) {
			if (!carrierCode) return
			this.$store.dispatch('order/getShippingCarrierWebUrl', { carrierCode })
		},
		updateGetInfo() {
			this.$emit('getInfo')
		},
		// 撤回取消订单
		handleCancelCancel(row) {
			let confirmTxt = this.isOrderFeeCount ? '是否撤回终止订单?' : '是否撤回取消订单?'
			this.$confirm(confirmTxt, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					orderCancelCancel({ orderNo: this.$route.query.orderNo }).then(res => {
						this.$message({
							type: 'success',
							message: '撤回成功',
							duration: 1000,
							onClose: () => {
								this.$emit('getInfo')
							}
						})
					})
				})
				.catch(() => {})
		},
		// 更新委托单位
		updateCust() {
			this.$emit('getInfo')
		},
		// 保存备注
		handleSaveRemark() {
			const loading = this.$loading({
				target: '.loadingBdRemark',
				lock: true,
				customClass: 'bdRemark-loading',
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.3)'
			})
			mainRemarkUpdate({
				orderNo: this.createItem.orderNo,
				orderData: this.createItem.bdRemark
			}).finally(res => {
				loading.close()
			})
		},
		// 切换是否包含驳船
		hadnleChangeIncludeFeeder(val) {
			this.includeFeeder = val
		},
		orderStatusFilter(status, action) {
			if (!status && ['add', 'copy'].includes(action)) {
				status = 'draft'
			}
			let result = getDictLabel('orderStatus', status)
			return result
		},
		getShipInfoHeight() {
			let comOrderInfoHeight = document.getElementById('comOrderInfo').offsetHeight
			let navHeight = document.getElementById('navCont').offsetHeight
			let alertHeight = document.getElementById('alertCont').offsetHeight
			let bodyHeight = document.body.clientHeight
			this.shipInfoHeight = bodyHeight - alertHeight - navHeight - comOrderInfoHeight
			this.checkPointHeight = bodyHeight - alertHeight - navHeight - comOrderInfoHeight - 46
		},
		// 初始化
		init(data) {
			if (!data || !Object.keys(data).length) return
			let tempData = JSON.parse(JSON.stringify(data))
			// 参与人，关键点，甩柜，取消订单，协同，改船等弹窗默认关闭
			this.countryCode = ''
			let workAssignStr = Cookies.get('workAssignShow')
			this.workAssignShow = workAssignStr === '0' ? false : true
			this.activityKey = 'Worker'
			this.submitDisabled = false
			sessionStorage.setItem('serviceCode', '')
			this.state = this.$route.query.action === 'add' ? 'valid' : ''
			// 清除校验结果
			this.$nextTick(() => {
				this.$refs['selfOrderSubmit'].clearValidate()
			})
			// this.getOrderWork()
			this.fillOrderInfo(tempData)
			this.getSoList()
		},
		// 储存合并相同的SO号的id
		getSpanArr(data) {
			/*  
        如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
        如果不是第一条记录，则判断它与前一条记录是否相等，
        如果相等，则向spanArr中添入元素0，并将前一位元素+1，表示合并行数+1，
        以此往复，得到所有行的合并数，0即表示该行不显示。
    */
			this.soSpanArr = []
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					this.soSpanArr.push(1)
					this.soPos = 0
				} else {
					// 判断M单号当前元素与上一个元素是否相同
					if (data[i].so === data[i - 1].so) {
						this.soSpanArr[this.soPos] += 1
						this.soSpanArr.push(0)
					} else {
						this.soSpanArr.push(1)
						this.soPos = i
					}
				}
			}
		},
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			// so号，附件信息，操作列需合并
			if ([0, 4, 5, 6].includes(columnIndex)) {
				//用于设置要合并的列
				const _row = this.soSpanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row, //合并的行数
					colspan: _col //合并的列数，设为0则直接不显示
				}
			}
		},
		// 获取港口countryCode
		getCountryCode(val) {
			this.countryCode = val
		},
		// 获取so列表
		getSoList() {
			bookSoList({ orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo }).then(res => {
				this.soList = res.data
				let soStr = ''
				this.soList.map((item, index) => {
					soStr += index ? `,${item.so}` : `${item.so}`
				})
				this.createItem.soStr = soStr
				this.getSpanArr(this.soList)
			})
		},
		getContainerList() {
			orderContainerList({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			}).then(res => {
				let {data} = res
				this.hasCn = data.some(ele => ele.cn)
			})
		},
		// // 获取so
		// getBookSo() {
		// 	getBookSoList({
		// 		orderNo: this.$route.query.orderNo,
		// 		jointNo: this.$route.query.jointNo
		// 	}).then(res => {
		// 		let soInfo = res.data.soList
		// 		let soStr = ''
		// 		soInfo.map((item, index) => {
		// 			soStr += index ? `,${item.so}` : `${item.so}`
		// 		})
		// 		this.createItem.soStr = soStr
		// 		console.log('soStr', this.createItem.soStr)
		// 	})
		// },
		// 分配工作项
		getOrderWork() {
			let { workAssign, jointWorkAssign } = this.createItem
			orderWork({ orderNo: this.$route.query.orderNo }).then(res => {
				// // 取bd部门code
				// let findItem = res.data.find(item => item.jobCode === 'bd')
				// this.obdDeptCode = findItem ? findItem.deptCode : ''
				// 先取obd部门code，再取下单助理部门code最后再取bd部门code
				let findObdItem = res.data.find(item => item.jobCode === 'obd')
				let findAsstItem = res.data.find(item => item.jobCode === 'asst')
				let findBdItem = res.data.find(item => item.jobCode === 'bd')
				let obdDeptCode = findObdItem ? findObdItem.deptCode : ''
				let asstDeptCode = findAsstItem ? findAsstItem.deptCode : ''
				this.bdDeptCode = findBdItem ? findBdItem.deptCode : ''
				this.obdDeptCode = obdDeptCode ? obdDeptCode : asstDeptCode ? asstDeptCode : this.bdDeptCode
				// 创建订单时参与人默认显值
				if (workAssign.length) {
					this.orderWorkOptions = workAssign.map(item => {
						if (item.employeeId == 0) {
							item.employeeName = ''
						}
						return Object.assign(item, { show: true })
					})
				} else {
					// 编辑订单时参与人取自详情
					// 客户自定过滤掉商务和bkg
					if (['st02', 'st16', 'st17'].includes(this.$route.query.serviceType)) {
						this.orderWorkOptions = res.data
							.filter(item => !['pricing', 'bkg'].includes(item.jobCode))
							.map(item => {
								return Object.assign(item, { show: true })
							})
					} else {
						this.orderWorkOptions = res.data.map(item => {
							return Object.assign(item, { show: true })
						})
					}
				}
				// 协同参与人
				if (jointWorkAssign.length) {
					this.jointOrderWorkOptions = jointWorkAssign.map(item => {
						item.isUpdatePricing = false
						item.isUpdateBkg = false
						if (item.employeeId == 0) {
							item.employeeName = ''
						}
						return Object.assign(item, { show: true })
					})
				} else {
					this.jointOrderWorkOptions = []
				}
			})
		},
		// 获取订舱协助审核人
		getJointAuditWork() {
			jointAuditWork({
				orderNo: this.$route.query.orderNo
			}).then(res => {
				this.jointAuditWorkData = res.data
			})
		},
		// 获取协同岗位分配
		getJointWork() {
			jointWork({
				orderNo: this.$route.query.orderNo
			}).then(res => {
				this.jointWorkData = res.data
			})
		},
		// 获取订单详情
		reGetOrderInfo() {
			let { action, source, orderNo } = this.$route.query
			let query = {}
			query = { orderNo: orderNo }
			orderInfo(query).then(res => {
				let { data } = res
				this.fillOrderInfo(data)
			})
		},
		fillOrderInfo(data, type) {
			// 获取业务发起取消的订单的取消原因备注等信息
			if (data.cancelApplyStatus === 'applied') {
				this.$emit('getCancel', data)
			}
			// 获取已拒绝的信息
			if (data.orderStatus === 'refuse') {
				this.$emit('getRefuse', data)
			}
			// 存储委托单位数据等为服务项用
			let { barge, ship, custid, custName, custIntrustNo, businessType, serviceType, serviceList, serviceInfoList, finCloseStatus, prefinCloseStatus } = data
			let { action, source } = this.$route.query
			let cust = {
				custid,
				custName,
				custIntrustNo,
				businessType,
				serviceType
			}
			sessionStorage.setItem('custStr', JSON.stringify(cust))
			sessionStorage.setItem('serviceListStr', JSON.stringify(serviceList))
			sessionStorage.setItem('serviceInfoListStr', JSON.stringify(serviceInfoList))

			Object.assign(this.createItem, data, {
				orderStatus: data.orderStatus,
				cargoList: data.cargoList && data.cargoList.length ? this.getCargoCustOptions(data.cargoList) : [{ boxRemark: '无' }],
				barge: data.barge || {},
				ship: data.ship || {},
				checkPointList: data.checkPointList,
				payMode: data.payMode || 'prepaid',
				workAssign: data.workAssign,
				jointWorkAssign: data.jointWorkAssign || []
			})
			this.bulkRoBkgStatus = data.bkgStatus
			// 获取订舱状态的在订舱状态数组中的索引值
			this.bkgStatusList.map((item, index) => {
				if (item.value === data.bkgStatus) {
					this.bkgStatusIndex = index
				}
			})
			// 获取服务类型
			this.getBusinessType()
			// 获取服务项下拉
			this.getServiceTypes()
			// 获取集装箱信息
			this.getContainerList()
			// 获取so
			// this.getBookSo()
			// 获取参与人
			this.getOrderWork()
			// 获取订舱协助审核人
			this.getJointAuditWork()
			// 获取协同岗位分配
			this.getJointWork()
			// 获取是否包含驳船
			// 新增创建订单，是否包含驳船从url的query获取
			if (!barge && !ship) {
				this.includeFeeder = this.$route.query.includeFeeder
			} else {
				this.includeFeeder = barge ? 'y' : 'n'
			}
			// 获取费用信息
			orderFeeCount({ orderNo: this.$route.query.orderNo }).then(res => {
				this.$store.dispatch('order/setOrderFeeCount', res.data.count > 0)
			})
			// 港口数据反显
			if (data.ship) {
				let { polPortCode, podPortCode, unloadingPortCode, roLoadingPortCode, roArrivalPortCode } = data.ship
				let porPortCode = data.barge ? data.barge.porPortCode : ''
				let portCodeArr = []
				porPortCode ? portCodeArr.push(porPortCode) : ''
				polPortCode ? portCodeArr.push(polPortCode) : ''
				podPortCode ? portCodeArr.push(podPortCode) : ''
				unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
				roLoadingPortCode ? portCodeArr.push(roLoadingPortCode) : ''
				roArrivalPortCode ? portCodeArr.push(roArrivalPortCode) : ''
				this.fillPortCodes = portCodeArr.toString()
				if (this.fillPortCodes) {
					this.$store.dispatch('dict/basePortListByCodes', { portCodes: this.fillPortCodes }).then(data => {
						//初始化下拉框数据
						let results = new Map()
						data.map(item => {
							let obj = {}
							obj.label = item.label
							obj.portAttribute = item.portAttribute
							results.set(item.value, obj)
						})
						this.podPortList = data.filter(item => item.portCode === podPortCode)
						this.podPortItem = this.podPortList.find(item => item.portCode === podPortCode)
						this.unloadingPortList = data.filter(item => item.portCode === unloadingPortCode)
						this.unloadPortItem = this.unloadingPortList.find(item => item.portCode === unloadingPortCode)
						if (porPortCode) {
							this.porPortList = data.filter(item => item.portCode === porPortCode)
							this.porPortItem = this.porPortList.find(item => item.portCode === porPortCode)
						}
						this.roLoadingPortList = data.filter(item => item.portCode === roLoadingPortCode)
						this.roLoadingPortItem = this.roLoadingPortList.find(item => item.portCode === roLoadingPortCode)
						this.roArrivalPortList = data.filter(item => item.portCode === roArrivalPortCode)
						this.roArrivalPortItem = this.roArrivalPortList.find(item => item.portCode === roArrivalPortCode)
						this.polPortList = data.filter(item => item.portCode === polPortCode)
						this.polPortItem = this.polPortList.find(item => item.portCode === polPortCode)
						let portItem = this.podPortList.find(item => item.portCode === this.createItem.ship.podPortCode)
						this.countryName = portItem ? portItem.countryName : ''
					})
				}
				// 获取系统航线中文名
				this.initSystemLine(podPortCode)
				// 获取目的港countryCode，做木质包装显示隐藏
				if (podPortCode) {
					this.$store.dispatch('dict/basePortListByCodes', { portCodes: podPortCode }).then(data => {
						let portItem = data.find(item => item.portCode === podPortCode)
						this.countryCode = portItem ? portItem.countryCode : ''
					})
				}
			}
			this.finCloseStatusCn = finCloseStatus === 'yes' ? '已关账' : prefinCloseStatus !== 'yes' ? '未关账' : '预关账'
			this.createItem.orderStatus = data.orderStatus
			this.order.orderNo = data.orderNo
			this.order.custid = data.custid
			this.order.custName = data.custName
			this.order.serviceList = data.serviceList
			this.order.serviceInfoList = data.serviceInfoList
			this.order.businessType = data.businessType
			this.finance.orderNo = data.orderNo
			this.finance.businessType = data.businessType
			this.finance.serviceType = data.serviceType
			this.setDisabled()
		},
		// 货物信息发货单位反显
		getCargoCustOptions(cargoList) {
			let result = cargoList.map(item => {
				item.shipperCustid = item.shipperCustid || ''
				let shipperCustidOptions = item.shipperCustid ? [{ label: item.shipperCustName, value: item.shipperCustid }] : []
				return { ...item, shipperCustidOptions }
			})
			return result
		},
		// 获取服务类型下拉
		getBusinessType() {
			baseBusinessList().then(res => {
				let { data } = res
				data.map(item => {
					// 该业务类型下的服务类型
					if (item.businessType === this.createItem.businessType) {
						this.serviceTypeOptions = item.serviceTypeList
					}
				})
			})
		},
		// 根据业务类型和服务类型查询服务项列表
		getServiceTypes() {
			let param = {
				businessType: this.createItem.businessType,
				serviceType: this.createItem.serviceType
			}
			let temp = []
			// 获取已完成的服务项
			let { serviceInfoList } = this.orderInfo
			let isFinishedArr = []
			serviceInfoList.map(item => {
				if (item.serviceStatus === 'finish' || item.isJoint === 'y') {
					isFinishedArr.push(item.serviceCode)
				}
			})
			// 服务项下拉数据处理
			baseBusinessServiceList(param).then(res => {
				let { data } = res
				data.map(item => {
					if (item.isDefault === 'y') temp.push(item.serviceCode)
					// op操作角色的服务项处理:订舱，代订舱，已完成的服务项不可勾选
					if (this.isOp) {
						if (item.serviceCode === 'book' || item.serviceCode === 'proxy_book' || isFinishedArr.includes(item.serviceCode)) {
							item.disabled = true
						}
						// // 仓储，散车派送二选一;如果有被协同，则另一个服务项不可选
						// if (item.serviceCode === 'pod_warehouse' && isFinishedArr.includes('pod_ltl_delivery') || item.serviceCode === 'pod_ltl_delivery' && isFinishedArr.includes('pod_warehouse')) {
						// 	item.disabled = true
						// }
						// if (item.serviceCode === 'pol_warehouse' && isFinishedArr.includes('pol_ltl') || item.serviceCode === 'pol_ltl' && isFinishedArr.includes('pol_warehouse')) {
						// 	item.disabled = true
						// }
					}
					if (this.isDoc) {
						if (!this.docService.includes(item.serviceCode)) {
							item.disabled = true
						}
					}
				})
				this.serviceCodeOptions = data

				// 新创建订单默认勾选服务项
				if (this.$route.query.action === 'add' && !this.createItem.serviceList.length) {
					Object.assign(this.createItem, {
						serviceList: temp
					})
				}
			})
		},
		// 根据订单状态和角色判断信息是否可编辑
		setDisabled() {
			// 协同订单不可编辑
			if (this.$route.query.source === 'jointList') return true
			// bd, obd业务角色在草稿未提交状态下可编辑，其他状态不可编辑
			if (this.isBd && !['draft', 'refuse'].includes(this.createItem.orderStatus)) {
				return true
			}
			// op操作角色基本信息都不可编辑
			if (this.isOp || this.isDoc || this.isEpricing || this.isEcs || this.isAc || this.isOpTruck || !this.ordDetRole) {
				return true
			}
			return false
		},
		// 新增so
		handleAddSo() {
			this.soPopShow = true
			this.soPopQuery = {}
		},
		handleUpdateSo(row) {
			console.log('row', row)
			this.soPopShow = true
			this.soPopQuery = {...row, containerInfoList: this.getMergeRows(row)}
		},
		// 获取合并行的所有箱型箱量数据
		getMergeRows(row) {
			let result = []
			result = this.soList.filter(item => item.soId === row.soId).map(item => {
				return {
					containerType: item.containerType,
					num: item.num,
					weight: item.weight
				}
			})
			return result
		},
		// so弹窗关闭回调
		soPopClose(action) {
			this.soPopShow = false
			if (action === 'Confirm') {
				bookSoList({ orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo }).then(res => {
					this.soList = res.data
					this.getSpanArr(this.soList)
				})
			}
		},
		// 返回
		handleGoBack() {
			let name = 'OrderList'
			sessionStorage.removeItem('createOrderStr')
			if (this.$route.query.source === 'jointList') {
				name = 'JointList'
			}
			if (this.$route.query.source === 'planOrderList') {
				name = 'PlanOrderList'
			}
			this.$router.push({
				name
			})
		},
		// 输出计划单
		handleExportPlan() {
			handleExportPlanCommon()
		},
		handleToPlan() {
			let query = this.$route.query
       let routeUrl = this.$router.resolve({
         name: 'opPlanDetail',
         query: {
					 ...query,
					 originRouteName: this.$route.name
				 },
				 params: query.orderNo
       })
       window.open(routeUrl.href, '_blank')
		},
		// 订单完成
		handleFinish() {
			this.submitDisabled = true
			orderFinish({ orderNo: this.$route.query.orderNo })
				.then(res => {
					this.$message({
						type: 'success',
						message: '订单完成成功',
						duration: 1000,
						onClose: () => {
							this.submitDisabled = false
							this.handleGoBack()
							// this.getOrderInfo('Submit')
						}
					})
				})
				.catch(err => {
					setTimeout(() => {
						this.submitDisabled = false
					}, 1000)
				})
		},
		// 业务变更订单状态为终止
		handleBreak() {
			this.$confirm('是否将订单状态修改为终止？', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					orderStatusChangeBreak({
						orderNo: this.$route.query.orderNo
					}).then(res => {
						this.$message({ type: 'success', message: '变更订单状态为终止成功' })
						this.$emit('getInfo')
					})
				})
				.catch(err => {})
		},
		// 业务关闭订单
		handleClose() {
			this.$confirm(`是否关闭此订单?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					orderClose({ orderNo: this.$route.query.orderNo }).then(res => {
						this.$message({
							type: 'success',
							message: '关闭成功',
							duration: 1000,
							onClose: () => {
								window.close()
								// this.$router.push({
								// 	path: 'orderList'
								// })
							}
						})
					})
				})
				.catch(err => {
					console.log('err')
				})
		},
		// 删除订单
		handleDelete(row) {
			this.$confirm(`是否删除此订单?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					orderDelete({ orderNo: this.$route.query.orderNo }).then(res => {
						this.$message({
							type: 'success',
							message: '删除成功',
							duration: 1000,
							onClose: () => {
								// this.$store.dispatch('tagsView/delView', this.$route)
								// this.$router.push({
								// 	name: 'OrderList'
								// })
								window.close()
							}
						})
					})
				})
				.catch(err => {
					console.log('err')
				})
		},
		// 业务发起取消订单
		handleCancelRequest() {
			this.cancelOrderPopShow = true
		},
		// 业务发起取消订单关闭回调
		cancelRequestPopClose(action, value) {
			this.cancelOrderPopShow = false
			if (action === 'Confirm') {
				this.$emit('getInfo')
			}
		},
		// 业务撤回已提交的订单
		handleSubmitCancel() {
			this.$confirm(`是否撤回此订单?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					orderSubmitCancel({ orderNo: this.$route.query.orderNo }).then(res => {
						this.$message({
							type: 'success',
							message: '撤回成功'
							// duration: 1000,
							// onClose: () => {

							// }
						})
						this.$emit('getInfo')
					})
				})
				.catch(err => {
					console.log('err')
				})
		},
		// 操作协同订单
		handleJointService() {
			this.jointServicePopShow = true
		},
		// 协同订单关闭回调
		jointServicePopClose() {
			this.jointServicePopShow = false
		},
		// 操作发起取消订单
		handleOpCancelRequest(cancelType) {
			this.cancelType = cancelType
			let msg = '是否已跟业务确认？'
			// 终止
			if (cancelType === 'break') {
				this.$confirm('是否已跟业务确认？', '是否终止该订单?', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.$confirm('该订单已有费用，是否确定终止？', '是否终止该订单?', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					}).then(() => {
						// 业务未发起取消，操作终止订单先显示取消原因
						if (this.createItem.cancelApplyStatus !== 'applied') {
							this.cancelOrderPopShow = true
						} else {
							orderCancelHandle({ orderNo: this.$route.query.orderNo, cancelType: cancelType }).then(res => {
								this.$emit('getInfo')
								this.$message({ message: '终止成功', type: 'success' })
							})
						}
					}).catch(err => {})
				}).catch(err => {})
			} else {	// 取消
				msg = '是否已跟业务确认？该订单是否已产生费用，如已产生请去录入相关费用后再取消。'
				// 已有柜号的提示
				if (this.hasCn) {
					msg = '该工作单已有柜号，是否有费用产生，若有费用需先录入费用，再来终止订单；若无费用产生，请先到集装箱列表清除柜号，再来取消订单。'
						return this.$alert(msg, '是否取消该订单?', {
						confirmButtonText: '确定',
						type: 'warning'
					})
				} else if (this.isJoint) {
					msg = '存在协同单，需协同单确认是否要取消协同，是否确定要发起取消？'
				}
				this.$confirm(msg, '是否取消该订单?', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					// 业务未发起取消,操作取消订单时先显示取消原因弹窗
					if (this.createItem.cancelApplyStatus !== 'applied') {
						this.cancelOrderPopShow = true
					} else {	// 业务发起过取消，操作实际执行取消
						orderCancelHandle({ orderNo: this.$route.query.orderNo, cancelType: cancelType }).then(res => {
							this.$emit('getInfo')
							this.$message({ message: '取消成功', type: 'success' })
						})
					}
					// this.cancelOrderPopShow = true
				}).catch(err => {})
			}
		},
		// 复制新窗口打开
		handleCopy() {
			this.$confirm(`是否确认复制工作号: ${this.$route.query.orderNo} 委托单位：${this.createItem.custName} 的数据?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return orderCopy({ orderNo: this.$route.query.orderNo })
				})
				.then(response => {
					let { orderNo } = response.data
					let routeUrl = this.$router.resolve({
						name: 'OrderDetail',
						params: {
							orderNo
						},
						query: Object.assign(
							{ ...this.$route.query },
							{
								orderNo,
								action: 'copy'
							}
						)
					})
					this.$message({
						message: '复制成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							window.open(routeUrl.href, '_blank')
						}
					})
				})
				.catch(err => {})
		},
		// 提交
		handleSubmit() {
			this.handleSave('Submit')
		},
		// 操作编辑
		handleEdit() {
			let data = this.getOpValues()
			let editSaveFun = this.isBulkRo ? orderEdit : selfEdit
			// console.log('操作编辑', data);
			// 操作，文件等保存提交
			this.$refs['selfOrderSubmit'].validate(valid => {
				if (!valid) {
					toViewPosition('ship-cont', 80)
					this.$message.error('请按要求填写数据')
					return
				}
				// 只勾选了目的港委托清关，或是只勾选了目的港换单一个服务项时，不允许提交
				let podArr = data.serviceList.filter(item => item.startsWith('pod_'))
				let podStr = podArr.join(',')
				if ( podStr === 'pod_comm_clearance' || podStr === 'pod_change_doc') {
					this.submitDisabled = false
					return this.$message({type: 'error', message: '请再选择其他目的港服务项'})
				}
				// 操作、应收等参与人必填校验
				let arr = []
				let opItem = data.workAssign.find(el => el.jobCode === 'op')
				let acItem = data.workAssign.find(el => el.jobCode === 'ac')
				let eacItem = data.workAssign.find(el => el.jobCode === 'eac')
				if (opItem && !opItem.employeeId) {
					arr.push('操作')
				}
				if (acItem && !acItem.employeeId) {
					arr.push('应收财务')
				}
				// 整箱的海外贷代客户的海外应收财务必填
				if (this.createItem.businessType === 'ship_export_fcl' && this.custInfoObj.custClass === 'FOREIGN_PEER' && eacItem && !eacItem.employeeId) {
					arr.push('海外应收财务')
				}
				if(this.hasDestination){
					let ecsItem = data.workAssign.find(el => el.jobCode === 'ecs')
					let epricingItem = data.workAssign.find(el => el.jobCode === 'epricing')
					if (epricingItem && !epricingItem.employeeId) {
						arr.push('海外商务')
					}
					if (ecsItem && !ecsItem.employeeId) {
						arr.push('海外客服')
					}
				}
				if (arr.length) {
					this.submitDisabled = false
					this.$message.error(`参与人（${arr.join(',')}）不能为空`)
					return
				}
				if (!this.hasDestination) {
					console.log('没有勾选目的港服务项，可不填海外客服参与人和海外商务参与人')
					data.workAssign.map(item => {
						if (['ecs', 'epricing'].includes(item.jobCode)) {
							item.employeeId = 0
						}
						return item
					})
				}
				this.submitDisabled = true
				editSaveFun(data)
					.then(res => {
						this.$message({
							type: 'success',
							message: '保存成功',
							duration: 1000,
							onClose: () => {
								// this.submitDisabled = false
								// this.reGetOrderInfo()
								// this.$emit('getInfo')
							}
						})
						this.submitDisabled = false
						this.ordDetRole === 'op' && this.$emit('getInfo')
						this.ordDetRole === 'doc' && this.$emit('getLeftServiceList')
					})
					.catch(err => {
						setTimeout(() => {
							this.submitDisabled = false
						}, 1000)
					})
			})
		},
		handleJointSave() {
			let workAssign = this.jointOrderWorkOptions.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})
			let data = {
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo,
				etdTime: this.createItem.ship.etdTime,
				tdTime: this.createItem.ship.tdTime,
				vessel: this.createItem.ship.vessel,
				voyage: this.createItem.ship.voyage,
				etaTime: this.createItem.ship.etaTime,
        taTime: this.createItem.ship.taTime,
				workAssign
			}
			if (this.isBulkRo) {
				Object.assign(data, {
					bkgStatus: this.bulkRoBkgStatus
				})
			}
			this.submitDisabled = true
			orderJointSave(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '保存成功'
					})
					this.submitDisabled = false
					this.$emit('getInfo')
				})
				.catch(err => {
					this.submitDisabled = false
				})
		},
		// 切换是否包含驳船费
		handleChangeIncludeFeeder(val) {
			this.includeFeeder = val
			if (val === 'y') {
				if (this.createItem.barge === null) {
					Object.assign(this.createItem, { barge: this.order.orderList.createItem.barge })
				}
			}
		},
		// 合并传参
		getValues() {
			let cargoList = []
			this.createItem.cargoList.forEach(item => {
				let cargoObj = {}
				Object.assign(cargoObj, {
					shipperCustid: item.shipperCustid,
					hscode: item.hscode,
					cname: item.cname,
					ename: item.ename,
					property: item.property,
					boxRemark: item.boxRemark,
					commodityTypeCode: item.commodityTypeCode,
					commodityDesc: item.commodityDesc,
					isWoodenPackage: item.isWoodenPackage ? item.isWoodenPackage : undefined
				})
				// 危险品
				if (item.property === 'dangerous') {
					Object.assign(cargoObj, {
						dangerousGrade: item.dangerousGrade,
						dangerousCode: item.dangerousCode,
						packageGroup: item.packageGroup
					})
				}
				// 散杂滚装的要多传总件数，总毛重，总体积，总计费吨这几个参数
				if (this.isBulkRo) {
					Object.assign(cargoObj, {
						quantity: item.quantity,
						weight: item.weight,
						volume: item.volume,
						feeWeight: item.feeWeight,
					})
				}
				cargoList.push(cargoObj)
			})
			// workAssign
			// console.log(this.orderWorkOptions)
			let workArr = this.orderWorkOptions.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})
			return {
				orderNo: this.createItem.orderNo,
				intrustRemark: this.createItem.intrustRemark,
				payMode: this.createItem.payMode,
				serviceList: this.createItem.serviceList,
				barge:
					this.includeFeeder === 'y'
						? {
								porPortCode: this.createItem.barge.porPortCode,
								transitWay: this.createItem.barge.transitWay,
								tdTime: this.createItem.barge.tdTime,
								etdTime: this.createItem.barge.etdTime,
								cyCutOff: this.createItem.barge.cyCutOff,
								vessel: this.createItem.barge.vessel,
								voyage: this.createItem.barge.voyage
						  }
						: null,
				ship: {
					etdTime: this.createItem.ship.etdTime,
					tdTime: this.createItem.ship.tdTime,
					shipCarrierCode: this.createItem.ship.shipCarrierCode,
					cyCutOff: this.createItem.ship.cyCutOff,
					polPortCode: this.createItem.ship.polPortCode,
					unloadingPortCode: this.createItem.ship.unloadingPortCode,
					podPortCode: this.createItem.ship.podPortCode,
					vessel: this.createItem.ship.vessel,
					voyage: this.createItem.ship.voyage,
					sysLineCode: this.createItem.ship.sysLineCode,
					transitPortCode: this.createItem.ship.transitPortCode,
					transitPortCode1: this.createItem.ship.transitPortCode1,
					transitPortCode2: this.createItem.ship.transitPortCode2
				},
				workAssign: workArr,
				cargoList: cargoList,
				quotationNumber: this.createItem.quotationNumber,
        schemeNumber: this.createItem.schemeNumber,
			}
		},
		// 操作编辑的传参
		getOpValues() {
			let opCargo = this.createItem.cargoList.map(item => {
				let obj = {}
				for (let i in this.opCargoItem) {
					// if (item[i]) obj[i] = item[i]
					obj[i] = item[i]
					if (i === 'shipperCustid') {
						if (!item[i]) obj[i] = 0
					}
				}
				return obj
			})
			// workAssign
			let workArr = this.orderWorkOptions.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})
			// 截放行时间，截报关时间截取冒号之前的字符, 格式：yyyy-MM-dd HH
			let { ccCutOff, cvCutOff } = this.createItem.ship
			if (ccCutOff && ccCutOff.indexOf(':') !== -1) {
				ccCutOff = ccCutOff.substring(13, 0)
			}
			if (cvCutOff && cvCutOff.indexOf(':') !== -1) {
				cvCutOff = cvCutOff.substring(13, 0)
			}
			return {
				bkgStatus: this.bulkRoBkgStatus,
				payMode: this.createItem.payMode,
				orderNo: this.createItem.orderNo,
				serviceList: this.createItem.serviceList,
				workAssign: workArr,
				cargoList: opCargo,
				intrustRemark: this.createItem.intrustRemark,
				ship: {
					shipCarrierCode: this.createItem.ship.shipCarrierCode,
					polPortCode: this.createItem.ship.polPortCode,
					unloadingPortCode: this.createItem.ship.unloadingPortCode,
					podPortCode: this.createItem.ship.podPortCode,
					tdTime: this.createItem.ship.tdTime,
					etdTime: this.createItem.ship.etdTime,
					etaTime: this.createItem.ship.etaTime,
					taTime: this.createItem.ship.taTime,
					vessel: this.createItem.ship.vessel,
					voyage: this.createItem.ship.voyage,
					ccCutOff: ccCutOff ? `${ccCutOff}:00:00` : '',
					cvCutOff: cvCutOff ? `${cvCutOff}:00:00` : '',
					cyCutOff: this.createItem.ship.cyCutOff,
					sysLineCode: this.createItem.ship.sysLineCode,
					transitPortCode: this.createItem.ship.transitPortCode,
					transitPortCode1: this.createItem.ship.transitPortCode1,
					transitPortCode2: this.createItem.ship.transitPortCode2,
					isTrack: this.createItem.ship.isTrack,
					roLoadingPortCode: this.createItem.serviceList.includes('internal_trade_barge') ? this.createItem.ship.roLoadingPortCode : '',
					roArrivalPortCode: this.createItem.serviceList.includes('internal_trade_barge') ? this.createItem.ship.roArrivalPortCode : ''
				},
				barge: {
					etdTime: this.createItem.barge.etdTime,
					tdTime: this.createItem.barge.tdTime,
					vessel: this.createItem.barge.vessel,
					voyage: this.createItem.barge.voyage,
					cyCutOff: this.createItem.barge.cyCutOff
				},
			}
		},
		// 业务保存提交必填校验
		validate(data) {
			console.log('workAssign', data.workAssign)
			// asst下单助理，eac海外应收财务等不用校验
			// ['eac', 'asst', 'obd', 'op_truck', 'doc', 'csc', 'line_cs', 'tc', 'rc','ecs','epricing']
			if (this.hasDestination) {
				this.isNotRequiredWorker = ['eac', 'asst', 'obd', 'op_truck','op_customs','op_wh', 'doc', 'csc', 'line_cs', 'tc', 'rc']
			}else{
				this.isNotRequiredWorker = ['eac', 'asst', 'obd', 'op_truck','op_customs','op_wh', 'doc', 'csc', 'line_cs', 'tc', 'rc', 'ecs', 'epricing']
			}
			// 整箱的国外贷代客户，海外应收财务必填
			if (this.createItem.businessType === 'ship_export_fcl' && this.custInfoObj.custClass === 'FOREIGN_PEER') {
				this.isNotRequiredWorker = this.isNotRequiredWorker.filter(item => item !== 'eac')
			}
			let filterData = data.workAssign.filter(item => !this.isNotRequiredWorker.includes(item.jobCode))
			let employeeIdArr = filterData.map(item => item.employeeId)
			// 获取参与人职业名称，拼接做非空提示
			let emptyTxtArr = []
			filterData.map(item => {
				if (item.employeeId === null || item.employeeId === 0 || item.employeeId === '') {
					let findItem = this.orderWorkOptions.find(ele => ele.jobCode === item.jobCode)
					findItem.jobCname && emptyTxtArr.push(findItem.jobCname)
				}
			})
			let emptyTxtStr = emptyTxtArr.join('、')
			if (!employeeIdArr.length || employeeIdArr.includes('') || employeeIdArr.includes(null) || employeeIdArr.includes(0)) {
				this.$message.error(`${emptyTxtStr}参与人不能为空`)
				return false
			}
			return true
		},
		cargoCnCharValidate(data) {
			let result = true
			let { cargoList } = data
			let cnChar = /[\u4E00-\u9FA5\uFE30-\uFFA0]/
			let cnValid = cargoList.some(item => {
				return item.ename && cnChar.test(item.ename)
			})
			if (cnValid) {
				this.$message({ type: 'error', message: '英文品名只能包含英文、数字、符号;' })
				result = false
			}
			return result
		},
		// 提交保存
		handleSave(type) {
			this.submitDisabled = true
			let data = this.getValues()
			let saveFun = this.isBulkRo ? orderSave : selfSave
			
			let obdEmployee = data.workAssign.find(el=>el.jobCode==='obd')
			let asstEmployee = data.workAssign.find(el=>el.jobCode==='asst')
			let obdEmployeeId =obdEmployee?obdEmployee.employeeId:''
			let asstEmployeeId =asstEmployee?asstEmployee.employeeId:''
			if(obdEmployeeId&&asstEmployeeId){
				this.$message.error('销售助理(OBD)和下单助理不能同时选择')
				return (this.submitDisabled = false)
			}
			// 提交
			if (type === 'Submit') {
				data.submitType = 'submit'
				let canSubmit = true
				this.$refs['selfOrderSubmit'].validate(valid => {
					if (valid) {
					} else {
						this.submitDisabled = false
						canSubmit = false
						toViewPosition('ship-cont', 80)
						console.log('error submit!!')
						return false
					}
				})
				if (!canSubmit) {
					return this.$message.error('请按要求填写数据')
				}
				// 保存或提交时都校验参与人
				if (!this.validate(data)) {
					return (this.submitDisabled = false)
				}
				if (!data.serviceList.length) {
					this.submitDisabled = false
					return this.$message({
						type: 'error',
						message: '请选择服务项'
					})
				}
				// 只勾选了目的港委托清关，或是只勾选了目的港换单一个服务项时，不允许提交
				let podArr = data.serviceList.filter(item => item.startsWith('pod_'))
				let podStr = podArr.join(',')
				if ( podStr === 'pod_comm_clearance' || podStr === 'pod_change_doc') {
					this.submitDisabled = false
					return this.$message({type: 'error', message: '请再选择其他目的港服务项'})
				}
				// this.orderInfoDataObj.serviceType === 'st02' &&
        //     data.submitType === 'submit' &&
        //     this.orderInfoDataObj.isFirstOrder ==='Y' &&
        //     (!this.orderInfoDataObj.bdManageEmployeeId || (this.orderInfoDataObj.bdManageEmployeeId&&this.orderInfoDataObj.bdManageEmployeeId!==userId))
				if (!this.hasDestination) {
					console.log('没有勾选目的港服务项，可不填海外客服参与人和海外商务参与人')
					data.workAssign.map(item => {
						if (['ecs', 'epricing'].includes(item.jobCode)) {
							item.employeeId = 0
						}
						return item
					})
				}
				if (
            this.orderInfoDataObj.serviceType === 'st02' &&
            data.submitType === 'submit' &&
            this.orderInfoDataObj.isFirstOrder ==='Y' &&
            (!this.orderInfoDataObj.bdManageEmployeeId || (this.orderInfoDataObj.bdManageEmployeeId&&this.orderInfoDataObj.bdManageEmployeeId!==this.userId))
          ) {
            // 客户自定，是否点的提交，是否是首单，是否有业务主管
            if (!this.orderInfoDataObj.bdManageEmployeeId) {
              // 没有设置业务主管，提醒去设置
              this.$message.error(
                '部门主管还未设置，请联系管理员配置部门主管人员。你可以先点击保存按钮对数据进行保存！'
              )
							this.submitDisabled = false
              return
            } else {
              data.submitType = 'pre_submit'
              this.$confirm(
                `此客户自订订单是该客户的首单，需提交给 ${this.orderInfoDataObj.bdManageEmployeeName} 审核，是否确定提交？`,
                '提示',
                {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                }
              )
                .then(() => {
                  // 业务提交
									saveFun(data)
										.then(res => {
											this.$message({
												type: 'success',
												message: '提交成功'
											})
											this.submitDisabled = false
											sessionStorage.removeItem('createOrderStr')
											this.$emit('getInfo')
										})
										.catch(err => {
											setTimeout(() => {
												this.submitDisabled = false
											}, 1000)
										})
                })
                .catch(() => {
									this.submitDisabled = false
								})
            }
            return
          }
				// 业务提交
				saveFun(data)
					.then(res => {
						this.$message({
							type: 'success',
							message: '提交成功'
						})
						this.submitDisabled = false
						sessionStorage.removeItem('createOrderStr')
						this.$emit('getInfo')
					})
					.catch(err => {
						setTimeout(() => {
							this.submitDisabled = false
						}, 1000)
					})
			} else {
				// 保存
				data.submitType = 'draft'
				if (!this.cargoCnCharValidate(data)) {
					this.submitDisabled = false
					return
				}
				// 业务保存
				saveFun(data)
					.then(res => {
						this.$message({
							type: 'success',
							message: '保存成功'
						})
						this.submitDisabled = false
						sessionStorage.removeItem('createOrderStr')
						this.$emit('getInfo')
					})
					.catch(err => {
						setTimeout(() => {
							this.submitDisabled = false
						}, 1000)
					})
			}
		},
		handleClick(tab, event) {},
		toggleWorkAssign() {
			this.workAssignShow = !this.workAssignShow
			let value = this.workAssignShow ? 1 : 0
			Cookies.set('workAssignShow', value)
		},
		// 港口下拉数据
		transitPortSearch(queryString, portAttribute, state) {
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
			if (val) this.porPortSearch('', 'port_of_feeder', this.state)
		},
		porPortFilterMehod(val) {
			this.porPortSearch(val, 'port_of_feeder', this.state)
		},
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
		handleChangePorPortCode(val) {
			let findItem = this.porPortList.find(item => item.portCode === val)
			this.porPortItem = findItem || {}
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
		// 大船起运港
		polPortVisibleChange(val) {
			if (val) this.polPortSearch('', 'port_of_basic', this.state)
		},
		polPortFilterMehod(val) {
			this.polPortSearch(val, 'port_of_basic', this.state)
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
		handleChangePolPortCode(val) {
			let findItem = this.polPortList.find(item => item.portCode === val)
			this.polPortItem = findItem || {}
		},
		// 卸货港
		unloadPortVisibleChange(val) {
			if (val) this.unloadingPortSearch('', 'port_of_discharge', this.state)
		},
		unloadPortFilterMehod(val) {
			this.unloadingPortSearch(val, 'port_of_discharge', this.state)
		},
		unloadingPortSearch(queryString, portAttribute, state) {
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
		handleChangeUnloadPortCode(val) {
			let findItem = this.unloadingPortList.find(item => item.portCode === val)
			this.unloadPortItem = findItem || {}
		},
		// 目的地
		podPortVisibleChange(val) {
			if (val) this.podPortSearch('', 'port_of_destination', this.state)
		},
		podPortFilterMehod(val) {
			this.podPortSearch(val, 'port_of_destination', this.state)
		},
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
		handleChangePodPortCode(val) {
			let findItem = this.podPortList.find(item => item.portCode === val)
			this.podPortItem = findItem || {}
			if (val) {
				// bd修改目的地获取国家判断显示货物信息里的是否包含木质包装
				if (this.isBd || this.isOp) {
					// 获取国家code
					let portItem = this.podPortList.find(item => item.portCode === val)
					this.countryName = portItem ? portItem.countryName : ''
					let countryCode = portItem ? portItem.countryCode : ''
					this.getCountryCode(countryCode)
				}
				// 根据目的港自动匹配系统航线
				this.initSystemLine(val)
			} else {
				this.createItem.ship.sysLineCode = ''
				this.sysLineName = ''
				this.countryName = ''
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
					}
				})
			} else {
				this.createItem.ship.sysLineCode = ''
				this.sysLineName = ''
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
		handleChangeShipCarrier(val) {},
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
		// 附件下载
		handleDownload(fileNo, fileName) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: fileNo
					}
				})
				.then(res => {
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = fileName
					link.click()
				})
		},
		// 附件预览
		handleView(fileNo, fileName) {
			this.$store.dispatch('order/previewFile', { fileNo: fileNo, fileName: fileName })
		},
		// so删除
		handleDeleteSo(row) {
			this.$confirm('是否确认删除该条so?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						so: row.so,
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo
					}
					return bookSoDelete(data)
				})
				.then(response => {
					this.$message({
						message: '删除成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							this.getSoList()
						}
					})
				})
				.catch(() => {
					this.getSoList()
				})
		},
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
		}
	}
}
</script>
<style lang="scss">
@import '../less/index.scss';
#selfOrder .so-table-border td {
	border-right: 1px solid #dfe6ec !important;
}
.vessel-time-popover {
	margin-left: 5px;
}
</style>
