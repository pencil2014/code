<template>
	<div class="edit-container fullWrap" id="shipBookDetail" v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
		<div class="alert-cont" id="alertCont">
			<!-- 协同单服务项是否取消协同的提示 -->
			<CancelJointAlert v-if="isBkg && cancelJointParams.cancelStatus === 'INIT'" :opName="opName" :params="cancelJointParams" @getInfo="getBookInfo" />
			<!-- 代订舱撤回申请审核 -->
			<ProxyCancelApplyAlert v-if="isBkg && proxyCancelApplyParams.submitCancelStatus === 'APPLIED'" :params="proxyCancelApplyParams" @getInfo="getBookInfo" />
			<!-- 协同撤回申请 -->
			<JointCacelApplyAlert v-if="isCancelApply && isBkg" :serviceInfo="serviceInfo" @getInfo="getBookInfo"/>
			<!-- 改船改港提示 -->
			<ChangeShipAlert v-if="isChangeJust" :hisData="hisData" :newData="newData" :bookDetailForm="bookDetailForm" :isChange="isChange" ref="changeShip"/>
			<!-- 加柜减柜提示 -->
			<AddContAlert v-if="isAdjust" :bookDetailForm="bookDetailForm" :isAddCont="isAddCont" :containerTotal="OrigContainerTotal"/>
			<!-- v-if="isWhiteCust && dropDealBdDisagree" -->
			<el-alert v-if="isPricing && isWhiteCust && dropDealAlertShow" type="warning" :closable="false" class="orange changeStyle book-alert">
				<template slot="title">
					<span class="txt">【重要】白名单客户{{ bookDetailForm.custName }}，已被发起甩柜，但业务员不同意甩柜，请及时跟进处理。</span>
					<el-button type="text" size="mini" @click="handleDropDeal">回复结果</el-button>
				</template>
			</el-alert>
			<!-- 订舱单拒绝提示 -->
			<RefuseAlert v-if="isRefuse" :refuseReason="refuseReason" />
			<!-- 套约提示信息 -->
			<ContractTempPop :contractTempInfo="contractTempInfo" v-if="isBkg && Object.keys(contractTempInfo).length" />
			<!-- 回复结果弹窗 -->
			<DropDealPop v-if="dropDealResultPopShow" :bookDetailForm="bookDetailForm" @close="dropDealResultPopClose" />
		</div>
		<!-- bkg订舱页面显示,占舱不显示 -->
		<div class="tab-cont" id="tabCont">
			<div class="item" :class="activeComponent === item.key ? 'isActive' : ''" v-for="(item, index) in tabsArr" :key="item.key + index" @click="handleClickTab(item)">
				{{ item.label }}
			</div>
		</div>
		<el-form v-if="activeComponent !== 'fee'" ref="auditForm" :model="bookDetailForm">
			<div class="">
				<div class="bookDetail-row service-name" id="infoCont" style="margin-top: 0px;">
					<div class="bookInfo-tit">
						<div class="small-tit-cont">
							<el-row class="small-tit">
								<div class="bkgStatus">
									<img class="icon" :src="require('@/assets/icon-file.png')" />
									<span class="bkgNo">
										{{$route.query.orderNo ? '工作号:' : '订舱单号:'}}
									</span>
									<span class="bkgNo">
										{{$route.query.orderNo ? bookDetailForm.orderNo : bookDetailForm.bkgReqNo}}
									</span>
								</div>
								<div class="bkgStatus" v-if="$route.query.orderNo">
									<span class="mr5">业务类型:</span>
									<span>{{ bookDetailForm.businessTypeCn }}</span>
								</div>
								<div class="bkgStatus" v-if="$route.query.orderNo">
									<span class="mr5">服务类型:</span>
									<span>{{ bookDetailForm.serviceTypeCn }}</span>
								</div>
								<div class="bkgStatus">
									<span class="mr5">订舱状态:</span>
									<i :class="oBkgStatus"></i>
									<span :class="oBkgStatus">
										{{ oBkgStatus | bkgStatusFilter(this) }}
									</span>
								</div>
								<div class="bkgStatus online-status" v-if="onlineBookStatus">
									<span class="mr5">在线订舱状态:</span>
									<span>{{ onlineBookStatus | onlineBookFilter }} </span>
									<el-popover placement="right" trigger="click">
										<el-table :data="onlineBookData" class="el-popover-table">
											<el-table-column align="center" property="status" label="状态" :formatter="statusFormatter"></el-table-column>
											<el-table-column align="center" property="shipmentId" label="长帆业务编号" :min-width="150" show-overflow-tooltip></el-table-column>
											<el-table-column align="center" property="businessNo" label="接入方业务编号" :min-width="150" show-overflow-tooltip></el-table-column>
											<el-table-column align="center" property="so" label="SO号" :min-width="150" show-overflow-tooltip></el-table-column>
											<el-table-column align="center" fixed="right" label="操作" width="100">
												<template slot-scope="scope">
													<el-button @click="applyFn(scope.row)" type="text" size="mini">重新编辑</el-button>
												</template>
											</el-table-column>
										</el-table>
										<el-button size="mini" type="text" slot="reference">详情</el-button>
									</el-popover>
								</div>
							</el-row>
							<el-row class="small-tit">
								<div class="bkgStatus" v-if="$route.query.orderNo">
									<entrustUnitComp :options="bookDetailForm" />
								</div>
								<div class="bkgStatus" v-if="$route.query.orderNo">
									<span class="item-label cust-item">客户委托号:
										<el-tooltip v-if="getTextSize('12px',orderDetail.custIntrustNo)>=73" effect="dark" :content="orderDetail.custIntrustNo" placement="top-start">
											<span class="cust">{{orderDetail.custIntrustNo}}</span>
										</el-tooltip>
										<span class="cust" v-else>{{orderDetail.custIntrustNo}}</span>
									</span>
								</div>
							</el-row>
						</div>
						<!-- 附件tab查看参与人 -->
						<template v-if="activeComponent === 'file'">
							<div class="row-tit-operate">
								<div style="position: relative;">
									<workBtn
										:orderIsJoint="orderIsJoint"
										:jointOrderWorkOptions="jointOrderWorkOptions"
										:orderWorkOptions="orderWorkOptions"
										:obdDeptCode="obdDeptCode"
										:bookDetailForm="bookDetailForm"
										:workAssignHeight="workAssignHeight"
										:bkgSoList="bkgSoList"
									/>
								</div>
							</div>
						</template>
						<!-- 功能按钮 -->
						<template v-if="activeComponent === 'book'">
							<div class="row-tit-operate" v-if="isPricing">
								<el-button v-if="['st15', 'st01'].includes(bookDetailForm.serviceType) && oBkgStatus === 'pass'" type="primary" size="mini" @click="priceSendMail" class="ml10">
									提醒BKG/OP
								</el-button>
								<el-button type="text" size="mini" class="underline" style="margin-left: 20px;" @click="handleViewCheckPoint">
									操作记录
								</el-button>
								<!-- 2021-11-03 审核通过拒绝按钮放开，撤掉审单人必须为登录用户的限制(auditEmployeeId === userId) -->
								<el-button type="primary" size="mini" @click="saveFunc('save')" v-if="['submit', 'book_refuse'].includes(bookDetailForm.bkgStatus)">
									保存
								</el-button>
								<el-button @click="saveFunc('pass')" type="success" size="mini" v-if="['submit', 'book_refuse'].includes(bookDetailForm.bkgStatus)" class="btn-pass ml10" :disabled="assistAudit">
									通过
								</el-button>
								<el-button size="mini" type="danger" @click="handleRefuse" v-if="['submit', 'book_refuse'].includes(bookDetailForm.bkgStatus) && !(isChange || isAddCont)" class="btn-refuse ml10" :disabled="assistAudit">
									拒绝
								</el-button>
							</div>
							<div class="row-tit-operate" v-if="isBkg">
								<!-- 正常订舱（加柜，改船）的已放舱的保存按钮 -->
								<el-button type="primary" size="mini" @click="bkgSaveEtdTime" v-if="oBkgStatus === 'book_release'" class="btn-save">
									保存
								</el-button>
								<!-- 2021-11-03 bkg操作功能按钮放开，撤掉订舱人员必须为登录用户的限制(bkgEmployeeId === userId) -->
								<el-button type="primary" size="mini" @click="saveFunc('save')" v-if="bkgSaveBtnShow" class="btn-save">
									保存
								</el-button>
								<el-button type="danger" size="mini" @click="handleRefuse" v-if="bkgRefuseBtnShow && !(isChange || isAddCont)" class="btn-refuse ml10">
									拒绝
								</el-button>
								<!-- && isBkgOnline && showBkgBtn sysUserId = 5642,5652,5641,5688,5657用户放开在线订舱按钮  && [5642,5652,5641,5688,5657].includes(sysUserId)-->
								<el-button type="warning" size="mini" @click="goBooking" v-if="bkgSaveBtnShow">
									在线订舱
								</el-button>
								<el-button v-if="oBkgStatus === 'book_release'" size="mini" @click="againSendMail" class="ml10">
									重发放舱邮件
								</el-button>
								<el-button type="default" size="mini" @click="recallRelease" v-if="releaseCancelBtnShow">
									撤回放舱
								</el-button>
								<el-button size="mini" @click="handleCommand()" class="ml10">
									输出托书
								</el-button>
								<el-button v-if="$route.query.orderNo" type="primary" size="mini" @click="handleExportPlan" class="btn-save">
									输出计划单
								</el-button>
							</div>
							<el-button v-if="viewOpPlan" size="mini" type="primary" class="ml10" @click="handleToPlan">货物跟踪</el-button>
							<el-button size="mini" type="primary" class="ml10" @click="handleCopyField($event)">复制字段</el-button>
						</template>
					</div>
					<!-- 进口显示服务项 -->
					<div class="service-name-cont" v-show="bookDetailForm.businessType === 'ship_import_fcl'">
						<div class="service-type">服务类型: {{ bookDetailForm.serviceType | serviceTypeFilter }}</div>
						<div class="name">
							<el-tooltip :content="serviceNameStr" placement="bottom" :visible-arrow="false" effect="dark">
								<span>服务项: {{ serviceNameStr }}</span>
							</el-tooltip>
						</div>
					</div>
				</div>
				<!-- 订舱详情 -->
				<template v-if="activeComponent === 'book'">
					<div class="book-cont rel">
						<div class="left-cont" :class="workAssignShow ? 'abs-toogle' : ''" :style="{ height: `${bookInfoHeight}px` }">
							<div class="toggleWorkAssign" @click="toggleWorkAssign" v-if="$route.query.orderNo">
								<i class="hamburger el-icon-arrow-left" :class="{ 'is-active': workAssignShow }"></i>
							</div>
							<!-- bkg角色：订舱状态修改，so信息，新增so，关联so -->
							<template v-if="isBkg">
								<div class="bookDetail-row bkg-detail-row">
									<div class="row-content">
										<div class="row-left el-form--inline">
											<el-form-item label="订舱状态">
												<el-radio-group v-model="bookDetailForm.bkgStatus">
													<el-radio v-for="(item, index) in bkgStatus" :disabled="index < bkgStatusIndex || isBkgRefuse || ['break', 'cancel'].includes(bookDetailForm.orderStatus)" :key="index" :label="item.value">
														{{ item.label }}
														<el-select v-if="bookDetailForm.bkgStatus == 'booking' && item.value == 'booking'" v-model="bookDetailForm.bkgProcessingReason" size="mini" placeholder="请选择处理中原因">
															<el-option v-for="(item, index) in reasonList" :key="index" :label="item.label" :value="item.label"></el-option>
														</el-select>
													</el-radio>
												</el-radio-group>
												<el-button type="text" size="mini" class="underline" style="margin-left: 20px;" @click="handleViewCheckPoint">
													操作记录
												</el-button>
											</el-form-item>
										</div>
									</div>
								</div>
								<!-- SO信息 -->
								<SoInfo :orderInfo="bookDetailForm" :bkgStatus="oBkgStatus" :isBkgRelease="isBkgRelease" @handleCallback="getBookInfo" @updateBkgSoList="updateBkgSoList" ref="soInfo" />
							</template>
							<!-- 订舱信息 -->
							<div class="soInfo-row">
								<el-collapse v-model="activeNames">
									<el-collapse-item title="订舱信息" name="1">
										<!-- 港口信息、船东信息、货运信息 -->
										<BookInfo
											v-if="bookDetailForm.serviceType !== 'st25'"
											ref="bookInfo"
											:includeFeeder="includeFeeder"
											:bookDetailForm="bookDetailForm"
											:bkgStatus="oBkgStatus"
											:oIsOnline="oIsOnline"
											:sysLineCname="sysLineCname"
											:fillPortCodes="fillPortCodes"
											:bkgAgentList="bkgAgentList"
											:employeeListParam="employeeListParam"
											:disabledAuditEmployeeId="disabledAuditEmployeeId"
											:bkgJointParam="bkgJointParam"
											:orderDetail="orderDetail"
											:orderIsJoint="orderIsJoint"
											:assistAuditEmpList="assistAuditEmpList"
											:containerTotal="allContainerTotal"
											@change="handleChangeIncludeFeeder"
											@updateBkgAgengList="updateBkgAgentList"
											@cancelJoint="cancelJoint"
											@getCountryCode="getCountryCode"
											@showCopyTip="showCopyTip"
											@hiddenCopyTip="hiddenCopyTip"
											@updateBkg="updateBkg"
											@getWorkAssign="getOrderWorkAssign"
											@emptyJointWorkAssign="handleEmptyJointWorkAssign"
											@updateFreeTimeSys="updateFreeTimeSys"
										/>
										<BulkRoSelfBookInfo
											v-else
											ref="bookInfo"
											:includeFeeder="includeFeeder"
											:bookDetailForm="bookDetailForm"
											:bkgStatus="oBkgStatus"
											:sysLineCname="sysLineCname"
											:fillPortCodes="fillPortCodes"
											:bkgAgentList="bkgAgentList"
											:employeeListParam="employeeListParam"
											:disabledAuditEmployeeId="disabledAuditEmployeeId"
											:bkgJointParam="bkgJointParam"
											:orderDetail="orderDetail"
											:orderIsJoint="orderIsJoint"
											:assistAuditEmpList="assistAuditEmpList"
											@change="handleChangeIncludeFeeder"
											@updateBkgAgengList="updateBkgAgentList"
											@cancelJoint="cancelJoint"
											@getCountryCode="getCountryCode"
											@showCopyTip="showCopyTip"
											@hiddenCopyTip="hiddenCopyTip"
											@updateBkg="updateBkg"
											@getWorkAssign="getOrderWorkAssign"
											@emptyJointWorkAssign="handleEmptyJointWorkAssign"
										/>
										<!-- bkg：货物、箱型箱量 -->
										<template v-if="isBkg">
											<Cargo :bookDetailForm="bookDetailForm" :countryCode="countryCode" v-if="$route.query.orderNo" @showCopyTip="showCopyTip" @hiddenCopyTip="hiddenCopyTip" />
											<OccupyCargo :cargoList="bookDetailForm.cargoList" :bookDetailForm="bookDetailForm" :countryCode="countryCode" @showCopyTip="showCopyTip" @hiddenCopyTip="hiddenCopyTip" v-else />
											<SoContainer :containerTotal="allContainerTotal" :createItem="containerInfo" :bookDetailForm="bookDetailForm" ref="soContainer" />
											<!-- 加柜后的原箱型箱量 -->
											<OrigContainer :containerTotal="OrigContainerTotal" :soContainerList="bookDetailForm.soContainer" ref="origContainer" v-if="isAddCont && !['book_resue', 'refuse', 'submit'].includes(bookDetailForm.containerModifyInfo.bkgStatus)" />
										</template>
										<!-- pricing: 箱型箱量、货物 -->
										<template v-if="isPricing">
											<template v-if="!isBulkRo">
												<SoContainer :containerTotal="allContainerTotal" :createItem="containerInfo" :bookDetailForm="bookDetailForm" @emptyFreeTimeSys="emptyFreeTimeSys"  @getFreeTimeSys="handleFillFreetimeSys"  ref="soContainer" />
												<!-- 加柜后的原箱型箱量 -->
												<OrigContainer :containerTotal="OrigContainerTotal" :soContainerList="bookDetailForm.soContainer" ref="origContainer" v-if="isAddCont" />
											</template>
											<Cargo :bookDetailForm="bookDetailForm" :countryCode="countryCode" @emptyFreeTimeSys="emptyFreeTimeSys" :isBulkRo="isBulkRo" />
										</template>
										<!-- 收发通 -->
										<!-- 散杂滚装-客户自订的不维护收发通信息 -->
										<Transport v-if="bookDetailForm.serviceType !== 'st25'" :infoConfig="goodsInfo" :bookDetailForm="bookDetailForm" />
									</el-collapse-item>
								</el-collapse>
							</div>
							<!-- pricing角色：so列表 -->
							<div class="soInfo-row" v-if="isPricing">
								<template v-if="!isBulkRo">
									<el-collapse v-model="soActiveNames">
										<el-collapse-item title="SO信息" name="soInfo">
											<div class="edit-container">
												<div class="row-form">
													<el-row>
														<el-table class="so-tableinfo" style="width: 100%;" :data="soLists">
															<el-table-column prop="so" label="so号" align="center"></el-table-column>
															<el-table-column prop="containerInfo" label="箱型箱量" align="center" width="150" show-overflow-tooltip></el-table-column>
															<el-table-column prop="vessel" label="船名" width="100" align="center"></el-table-column>
															<el-table-column prop="voyage" label="航次" width="100" align="center"></el-table-column>
															<el-table-column prop="polPortName" label="起运港" align="center"></el-table-column>
															<el-table-column prop="porPortName" label="驳船收货地" align="center"></el-table-column>
															<el-table-column prop="podPortName" label="目的地" align="center"></el-table-column>
															<el-table-column prop="remark" label="so备注" width="150" align="center"></el-table-column>
														</el-table>
													</el-row>
												</div>
											</div>
										</el-collapse-item>
									</el-collapse>
								</template>
							</div>
							<!-- 甩柜信息 -->
							<template v-if="!isBulkRo">
								<div class="soInfo-row">
									<el-collapse v-model="activeNames">
										<el-collapse-item title="甩柜信息" name="drop">
											<el-table fit header-row-class-name="left-title" :data="soDropList" style="width: 100%;" class="row-form so-tableinfo">
												<el-table-column prop="so" label="SO号" align="right">
													<template slot-scope="scope">
														<span v-if="scope.row.isDrop == 'Y'" class="drop-word">
															甩
														</span>
														{{ scope.row.so }}
													</template>
												</el-table-column>
												<el-table-column prop="vessel" label="船名" align="center">
													<template slot-scope="scope">
														<span>
															{{ scope.row.vesselOld }}
															<i v-if="scope.row.vesselOld" class="el-icon-right drop-arrow"></i>
															{{ scope.row.vessel }}
														</span>
													</template>
												</el-table-column>
												<el-table-column prop="voyage" label="航次" align="center">
													<template slot-scope="scope">
														<span>
															{{ scope.row.voyageOld }}
															<i v-if="scope.row.vesselOld" class="el-icon-right drop-arrow"></i>
															{{ scope.row.voyage }}
														</span>
													</template>
												</el-table-column>
												<el-table-column prop="cutOffDate" label="截关时间" align="center">
													<template slot-scope="scope">
														<span>
															{{ scope.row.cutOffDateOld }}
															<i v-if="scope.row.vesselOld" class="el-icon-right drop-arrow"></i>
															{{ scope.row.cutOffDate }}
														</span>
													</template>
												</el-table-column>
												<el-table-column prop="containerInfo" show-overflow-tooltip label="箱型箱量" align="center">
													<template slot-scope="scope">
														<span>{{ scope.row.containerInfo }}</span>
													</template>
												</el-table-column>
												<el-table-column label="日志" align="center">
													<template slot-scope="scope">
														<span class="to-detail-btn" @click="showViewLogs(scope.row)">
															查看
														</span>
													</template>
												</el-table-column>
												<!-- <el-table-column prop="soFileName" label="SO附件" align="center">
                          <template slot-scope="scope"
                            ><el-button @click="handleViewSo(scope.row)" size="mini" type="text">{{ scope.row.soFileName }}</el-button>
                          </template>
                        </el-table-column> -->
												<!-- <el-table-column prop="fileName" show-overflow-tooltip label="甩柜证明" align="center">
                          <template slot-scope="scope"
                            ><span class="to-detail-btn" @click="handleViewDrop(scope.row)">{{ scope.row.fileName }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column prop="dropRemark" show-overflow-tooltip label="甩柜备注" align="center">
                          <template slot-scope="scope">{{ scope.row.dropRemark }} </template>
                        </el-table-column> -->
											</el-table>
										</el-collapse-item>
									</el-collapse>
								</div>
							</template>
						</div>
						<!-- 参与人 -->
						<div class="right-cont" v-if="workAssignShow && $route.query.orderNo" :style="{ height: `${bookInfoHeight}px` }">
							<div class="tit">参与人</div>
							<Worker
								ref="worker"
								:orderIsJoint="orderIsJoint"
								:jointOrderWorkOptions="jointOrderWorkOptions"
								:orderWorkOptions="orderWorkOptions"
								:obdDeptCode="obdDeptCode"
								:createItem="bookDetailForm"
								:workAssignHeight="workAssignHeight"
								:soList="bkgSoList"
								:isBulkRo="isBulkRo"
								@changeBkg="handleChangeBkg"
								@changeOp="handleChangeOp"
								@changePricing="handleChangePricing"
								@init="refreshWorkerAssign"
								@changeEmployeeId="changeEmployeeId"
							/>
						</div>
					</div>
				</template>
				<!-- 附件 -->
				<template v-if="activeComponent === 'file'">
					<FileList />
				</template>
			</div>
		</el-form>
		<Fee v-if="activeComponent === 'fee'" :feeEmbed="true" />
		<!-- 拒绝弹窗 -->
		<div v-if="refusePopShow">
			<RefuseDialog :params="bookDetailForm" :isChange="isChange" :isAddCont="isAddCont" @close="refusePopClose" />
		</div>
		<div v-if="checkPointPopShow">
			<CheckPointPop :params="bookDetailForm" @close="checkPointPopClose" />
		</div>
		<ViewLogs />
		<div v-if="exportEntrustedPopShow">
			<exportEntrustedPop :bookDetailForm="bookDetailForm" @close="exportPopClose" />
		</div>
		<!-- 撤回放舱弹窗 -->
		<div v-if="bkgReleaseCancelPopShow">
			<BkgReleaseCancel @close="bkgReleaseCancelPopClose" />
		</div>
		<div class="copyTips" v-show="copyTips.show" :style="{ left: `${copyTips.left - 36}px`, top: `${copyTips.top}px` }" @click="handleCopy(copyTips.text, $event)" @mouseenter="showTip" @mouseleave="hiddenCopyTip"><i class="caret"></i>复制</div>
		<div v-if="bookReleaseMailPopShow">
			<Mail :isAdjust="isAddCont && !isBkgRefuse" :mailOnlyparam="mailOnlyparam" :orderInfoData="orderInfoData" @close="bookReleaseMailPopClose" />
		</div>
		<div v-if="priceMailPopShow">
			<PriceMail @close="priceMailPopClose" />
		</div>
		<div v-if="bookReleaseJointMailPopShow">
			<JointMail :mailOnlyparam="mailOnlyparam" :orderInfoData="{ ...bookDetailForm, container: allContainerTotal.container }" @close="bookReleaseMailPopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState, mapMutations } from 'vuex'
import { toViewPosition } from '@/utils/scroll-to.js'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import clip from '@/utils/clipboard'
import workBtn from '@/views/order/order/bookShip/components/workBtn.vue'
import clipboard from '@/directive/clipboard/index.js'
import { handleExportPlanCommon } from '@/utils/orderCommonMethod'
import { orderCustInfo } from '@/api/order/list'
import { orderInfo, orderNopermInfo, orderJointInfo, orderJointNopermInfo, orderWork, orderWorkList, orderJointServiceCancelAudit, orderMainWorkAssign, orderWorkSi, planExportReview } from '@/api/order/list'
import { baseEmployeeListName, baseSystemLineInfo } from '@/api/base'
import { bookInfo, bookOrderInfo, orderInfoBookOnline, bookNewHoldInfo, bookSave, bkgProcess, cancelJoint, changePass, changeRefuse, spaceBookAuditCancel, soList, dropCompareList, bookingExport, bkgReleaseCancel, bookBkgChange, bookAuditChange } from '@/api/order/book/list'
import { carrierList, onlineBookNo } from '@/api/order/createBooking'
import { mainRouteFreeTime } from '@/api/charge'
import { addPass } from '@/api/order/book/container'
import SoInfo from './components/soInfo/soInfo'
import FormItem from '@/components/Form/elFormItem'
import { handleData } from '../js/handleData'
import SoContainer from '../orderList/components/soContainerOccupy'
import OrigContainer from './components/origContainer'
import RefuseDialog from './components/refuseDialog'
import BkgReleaseCancel from './components/bkgReleaseCancel'
import RefuseAlert from './components/refuseAlert'
import ContractTempPop from '../components/contractInfoPop'
import CheckPointPop from './components/checkPointPop'
import { copyArry, getDictLabel, getDictMap, getTextSize } from '@/utils/tools'
import { soLog } from '@/api/order/bl'
import ViewLogs from '../components/viewLogs'
import exportEntrustedPop from './components/exportEntrustedPop.vue'
import Worker from './components/pricingWorker'
import BookInfo from './components/bookInfo'
import BulkRoSelfBookInfo from './components/bulkRoSelfBookInfo'
import Cargo from './components/cargo'
import OccupyCargo from './components/occupyCargo'
import Transport from './components/transport.vue'
import FileList from './components/fileList/index'
import Mail from './components/bookReleaseMail.vue'
import PriceMail from './components/priceMail.vue'
import JointMail from './components/bookReleaseJointMail.vue'
import DropDealPop from './components/dropDealResultPop'
import Fee from '@/views/finance/orderFee/orderFee/index'
import CancelJointAlert from './components/cancelJointAlert'
import ProxyCancelApplyAlert from './components/proxyCancelApplyAlert'
import JointCacelApplyAlert from './components/alert/jointCancelApplyAlert'
import ChangeShipAlert from './components/alert/changeShipAlert'
import AddContAlert from './components/alert/addContAlert'
export default {
	filters: {
		bkgStatusFilter(bkgStatus, that) {
			const _this = that._self
			let bkgStatusCn = getDictLabel('bkgStatus', bkgStatus)
			if (_this.isBulkRo) {
				for (var i in _this.bulkRoBkgStatusObj) {
					if (i === bkgStatus) {
						bkgStatusCn = _this.bulkRoBkgStatusObj[bkgStatus]
					}
				}
			}
			return bkgStatusCn
		},
		onlineBookFilter(val) {
			return getDictLabel('onlineBkgStatus', val) || '--'
		},
		serviceTypeFilter(serviceType) {
			return getDictLabel('shipServiceType', serviceType)
		}
	},
	mixins: [routerMixin],
	data() {
		return {
			priceMailPopShow: false,
			copyTips: {
				show: false, // 复制按钮
				left: 0,
				top: 0,
				text: ''
			},
			getTextSize: getTextSize,
			includeFeeder: '', // 是否包含驳船
			soDropList: [],
			soLists: [],
			bookDetailForm: {
				cargoList: [],
				barge: {},
				ship: {},
				transport: {},
				contractTemplate: {},
				containerModifyInfo: {},
				portModifyInfo: {}
			},
			activeNames: '1',
			soActiveNames: 'soInfo',
			bkgStatus: handleData.bkgStatusDetail, // d订舱状态
			bkgStatusIndex: 0, // 当前订舱状态在订舱状态数组中的索引值
			bkgSaveBtnShow: false, // 保存按钮显示状态
			bkgRefuseBtnShow: false, // 拒绝按钮显示状态
			releaseCancelBtnShow: false, // 撤回放舱显示状态
			showBkgBtn: false, // 在线订舱按钮显示状态
			// bkg的SO操作列表
			bkgSoList: [],
			reasonList: store.state.dict.dictMap.bkgProcessingReason, // 订舱处理中原因
			// 箱型箱量信息
			containerInfo: {
				container: '',
				weight: '',
				volume: '',
				soContainerList: []
			},
			// 货物信息
			goodsInfo: {
				transport: {
					shipper: ''
				}
			},
			// 保存提交数据
			saveItems: {
				shipCarrierOrderNo: '',
				submitType: 'save',
				contractItemId: '',
				bkgReqNo: '',
				orderNo: '',
				vessel: '',
				voyage: '',
				bkgEmployeeId: '',
				docEmployeeId: '',
				bkgAgentSupplierId: '',
				shipAgentSupplierId: '',
				sysLineCode: '',
				carrierLineName: '',
				carrierService: '',
				contractNo: '',
				contractSupplierId: '',
				isExternal: '',
				auditRemark: '',
				shipCarrierCode: '',
				cyCutOff: '',
				polPortCode: '',
				isOnline: '',
				payCompanyCode: '',
				payCompanyName: '',
				soContainerList: [
					{
						isSplit: 'n',
						containerList: [{ containerType: '', isHeavy: '' }]
					}
				]
			},
			// 拒绝弹窗
			refusePopShow: false,
			disabledAuditEmployeeId: false,	// 审核协助人
			sysLineCname: '', // 系统航线名称
			// 协同项申请撤回
			isCancelApply: false,
			// 订舱协同信息
			serviceInfo: {
				serviceName: '',
				cancelApplyStatus: '',
				cancelReason: ''
			},
			// 放舱撤回弹窗
			bkgReleaseCancelPopShow: false,
			cTimestamp: 0,
			isRefuse: false, // 被拒绝
			refuseReason: '',
			checkPointPopShow: false, // 操作记录弹窗
			auditEmployeeId: '', // 商务审核人
			assistAudit: false, // 协助审核人是否选中
			bkgEmployeeId: '', // 订舱
			exportEntrustedPopShow: false,
			exportTypeOptions: {
				LONGSAIL_OFFSITE: '长帆供应链订同行'
			},
			bargeEtdTime: false,
			workAssignShow: true, // 参与人
			orderWorkOptions: [],
			fillPortCodes: '',
			workAssignHeight: 0, // 关键点高度
			bookInfoHeight: 0, // 订舱信息高度
			bkgAgentList: [],
			countryCode: '', // 国家用来判断是否木质包装
			activeComponent: 'book', // 当前组件，默认显示订舱
			tabsArr: [
				{ label: '订舱详情', key: 'book' },
				{ label: '附件', key: 'file' }
			],
			// 改船改港历史与新数据
			hisData: {},
			newData: {},
			// mainBkgStatus: '', 	// 主单订舱状态
			oBkgStatus: '', 	// 初始订舱状态
			mainBkgReqNo: '', // 主单订舱申请单号
			isBkgRelease: false, // bkg的so信息模块的关联SO，新增SO按钮权限控制
			// sysUserId: this.$store.state.user.userInfo.sysUserId,
			bkgJointParam: {
				isJoint: false, // 是否订舱协同 默认为否不显示文文件录入
				polArea: ''
			},
			employeeListParam: {},
			onlineBookStatus: '',
			onlineBookData: [],
			bookReleaseMailPopShow: false,
			bookReleaseJointMailPopShow: false,
			mailOnlyparam: {},
			orderInfoData: {},
			orderDetail: {}, // 订单详情数据
			serviceNameStr: '',
			orderIsJoint: '', // 商务审核订单参与人接口，订单是否协同
			jointOrderWorkOptions: [],
			obdDeptCode: '', // obd部门code
			contractTempInfo: {},
			dropDealResultPopShow: false,
			cancelJointParams: {},
			opName: '',
			assistAuditEmpList: [],
			proxyCancelApplyParams: {},
			oIsOnline: '', 	// 详情接口返回的是否线上初始值
			tempFreeTimeSys: '',
			workAssignTipObj: store.state.order.orderList.workAssignObj,
		}
	},
	created() {
		// this.getOnlineBookNo()
		this.cTimestamp = new Date().getTime()
		this.init()
	},
	activated() {
		let timestamp = new Date().getTime()
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
			this.init()
		}
	},
	watch: {
		'bookDetailForm.auditEmployeeId': {
			handler(newVal) {
				// this.assistAudit = newVal && newVal !== this.userId  ? true : false
			}
		}
	},
	mounted() {
		window.addEventListener('resize', this.getBookInfoHeight)
		this.$nextTick(() => {
			this.getBookInfoHeight()
		})
	},
	destroyed() {
		window.removeEventListener('resize', this.getBookInfoHeight)
	},
	computed: {
		...mapState({
			userId: state => state.user.userId,
			userInfo: state => state.user.userInfo,
			dictMap: state => state.dict.dictMap,
			bulkRoBkgStatusObj: state => state.order.bulkRoBkgStatusObj,
			workAssignObj: state => state.order.orderList.workAssignObj,
			roles: state => state.user.roles,
		}),
		isManager() {
			return this.roles && this.roles.includes('manager')
		},
		isOpPlanTmp() {
			return this.roles && this.roles.includes('op_plan_tmp')
		},
		viewOpPlan() {
			return this.isManager || this.isOpPlanTmp
		},
		isChange() {
			// return this.bookDetailForm.isPortChange === 'y'
			return this.bookDetailForm.portModifyInfo && Object.keys(this.bookDetailForm.portModifyInfo).length ? true : false
		},
		// 加柜类型
		isAddCont() {
			// return this.bookDetailForm.isContainerAdd === 'y'
			return this.bookDetailForm.containerModifyInfo && Object.keys(this.bookDetailForm.containerModifyInfo).length ? true : false
		},
		isBkgOnline() {
			return this.$store.state.user.roles.includes('bkg_online')
		},
		isBkgOnlineLeyu() {
			return this.$store.state.user.roles.includes('bkg_online_leyu')
		},
		isPricing() {
			return this.$route.query.roles === 'pricing'
		},
		isBkg() {
			return this.$route.query.roles === 'bkg'
		},
		// 箱型箱量统计
		containerTotal() {
			return this.getContainerTotal(this.containerInfo.soContainerList)
		},
		//原箱型箱量统计
		OrigContainerTotal() {
			return this.getContainerTotal(this.bookDetailForm.soContainer)
		},
		allContainerTotal() {
			let origCont = []
			// 加柜的箱型箱量需要合并history里的箱型箱量，非加柜的不用合并history的箱型箱量
			// 20211209加柜的箱型箱量都会返回新的箱型箱量，不用合并history的箱型箱量
			// if (this.isAddCont && this.bookDetailForm && this.bookDetailForm.soContainer) {
			// 	origCont = this.bookDetailForm.soContainer
			// }
			let allSoContainer = this.containerInfo.soContainerList.concat(origCont)
			return this.getContainerTotal(allSoContainer)
		},
		// bkg拒绝给商务，拒绝给业务
		isBkgRefuse() {
			return ['book_refuse', 'refuse'].includes(this.bookDetailForm.bkgStatus)
		},
		isAdjust() {
			let {containerModifyInfo} = this.bookDetailForm
			// 商务显示，待审核和bkg拒绝给商务的
			if (this.isPricing) {
				return this.isAddCont && ['submit','book_refuse'].includes(containerModifyInfo.bkgStatus)
			}
			// bkg显示，待审核的
			if (this.isBkg) {
				// return this.isAddCont && ['submit'].includes(containerModifyInfo.bkgStatus)
				return this.isAddCont && !['book_refuse', 'refuse', 'submit'].includes(containerModifyInfo.bkgStatus) && this.oBkgStatus !== 'book_release'
			}
		},
		isChangeJust() {
			let {portModifyInfo} = this.bookDetailForm
			// 商务显示，待审核和bkg拒绝给商务的
			if (this.isPricing) {
				return this.isChange && !['refuse'].includes(portModifyInfo.bkgStatus)
			}
			// bkg显示，待审核的
			if (this.isBkg) {
				return this.isChange && !['book_refuse', 'refuse', 'submit'].includes(portModifyInfo.bkgStatus) && this.oBkgStatus !== 'book_release'
				// return this.isChange && ['submit'].includes(portModifyInfo.bkgStatus)
			}
		},
		// 是否白名单
		isWhiteCust() {
			return this.bookDetailForm.isWhiteCust === 'Y'
		},
		// bd甩柜不同意,商务暂未处理，并且处理结果
		dropDealAlertShow() {
			if (this.bookDetailForm.dropDealBdRequire !== 'DISAGREE') {
				return false
			} else if (this.bookDetailForm.dropDealResult === 'Y') {
				return false
			} else if (this.bookDetailForm.dropDealLevel === 'SYS_LINE_MANAGE' && this.bookDetailForm.dropDealResult) {
				return false
			} else {
				return true
			}
			// return this.bookDetailForm.dropDealBdRequire === 'DISAGREE' && this.bookDetailForm.dropDealResult !== 'Y'
		},
		// 散杂滚装
		isBulkRo() {
			return this.bookDetailForm.businessType === 'ship_bulk_ro'
		}
	},
	components: {
		ViewLogs,
		SoInfo,
		FormItem,
		SoContainer,
		OrigContainer,
		RefuseDialog,
		BkgReleaseCancel,
		RefuseAlert,
		ContractTempPop,
		CheckPointPop,
		exportEntrustedPop,
		Worker,
		BookInfo,
		BulkRoSelfBookInfo,
		Cargo,
		OccupyCargo,
		Transport,
		FileList,
		Mail,
		JointMail,
		Fee,
		workBtn,
		DropDealPop,
		CancelJointAlert,
		ProxyCancelApplyAlert,
		JointCacelApplyAlert,
		ChangeShipAlert,
		AddContAlert,
		PriceMail
	},
	methods: {
		handleToPlan() {
			let query = this.$route.query
      let routeUrl = this.$router.resolve({
         name: 'opPlanDetail',
         query: {
					 ...query,
					 originRouteName: this.$route.name
				 },
				 params: {
					 orderNo: query.orderNo,
				 }
       })
       window.open(routeUrl.href, '_blank')
		},
		updateFreeTimeSys(value) {
			// console.log('update', value);
			// 出口整箱的非业务自拿价的商务审单才可以变更免用免堆信息
			if (this.isPricing && this.bookDetailForm.businessType === 'ship_export_fcl' && this.bookDetailForm.ship.priceType !== 'bd') {
				this.$set(this.bookDetailForm.ship, 'freetimeSys', value || '')
				this.tempFreeTimeSys = value || ''
			}
		},
		emptyFreeTimeSys() {
			// console.log('val', val);
			// 出口整箱的商务审单才可以变更免用免堆信息
			if (this.isPricing && this.bookDetailForm.businessType === 'ship_export_fcl' && this.bookDetailForm.ship.priceType !== 'bd') {
				if (this.allContainerTotal.containerArr.some(item => ['20FR','20RF','20OT','40FR','40RF','40OT'].includes(item.containerType))) {
					this.$set(this.bookDetailForm.ship, 'freetimeSys', '')
				} else if (this.bookDetailForm.cargoList.some(item => ['dangerous'].includes(item.property))) {
					this.$set(this.bookDetailForm.ship, 'freetimeSys', '')
				} else {
					this.$set(this.bookDetailForm.ship, 'freetimeSys', this.tempFreeTimeSys || '')
				}
			}
		},
		priceSendMail() {
			this.priceMailPopShow = true
		},
		priceMailPopClose(action) {
			this.priceMailPopShow = false
		},
		// 获取在线状态、编号及so号
		getOnlineBookNo() {
			let data = {
				orderBkgId: this.mainBkgReqNo
			}
			onlineBookNo(data)
				.then(res => {
					if (res.code === 0) {
						let source = res.data || []
						if (source.length) {
							this.onlineBookStatus = source[0].status //订舱状态拿第一个
							this.onlineBookData = source
						}
					}
				})
				.catch(() => {})
		},
		// 格式化状态
		statusFormatter(val) {
			let { status } = val
			return getDictLabel('onlineBkgStatus', status) || '--'
		},
		// 获取在线订舱支持的船公司
		getCarrierList() {
			let shipCarrierCode = this.bookDetailForm.ship.shipCarrierCode
			carrierList({ keyword: '', type: 'bk', baseCarrierCode: shipCarrierCode })
				.then(res => {
					if (res.code === 0) {
						let arrCode = res.data.map(item => item.baseCarrierCode) || []
						let carrierSource = res.data.map(item => item.carrierSource) || []
						arrCode = Array.from(new Set(arrCode))
						this.showBkgBtn = arrCode.includes(shipCarrierCode)
						if (carrierSource.includes('leyu') && this.showBkgBtn) {
							this.showBkgBtn = this.isBkgOnlineLeyu
						}
					}
				})
				.catch(() => {})
		},
		// 复制字段
		handleCopyField(e) {
			let filedStr = ''
			let soStr = ''
			let commodityStr = ''
			let polStr = this.$refs.bookInfo.polPortItem.ename || ''
			let podStr = this.$refs.bookInfo.podPortItem.ename || ''
			if (this.isPricing) {
				// 去重
				let soLists = this.soLists.map(item => item.so)
				soLists = new Set(soLists)
				soLists = Array.from(soLists)
				soStr = soLists.join(',')
			}
			if (this.isBkg) {
				// 去重
				let bkgSoList = this.bkgSoList.map(item => item.so)
				bkgSoList = new Set(bkgSoList)
				bkgSoList = Array.from(bkgSoList)
				soStr = bkgSoList.join(',')
			}
			commodityStr = this.bookDetailForm.cargoList.map(item => `${item.cname}(${item.ename})`).join(';')
			filedStr += `SO:${soStr}\n`
			filedStr += `POL:${polStr}\n`
			filedStr += `POD:${podStr}\n`
			filedStr += `VOLUME:${this.allContainerTotal.container}\n`
			filedStr += `WEIGHT:${this.allContainerTotal.weight}KGS\n`
			filedStr += `COMMODITY:${commodityStr}\n`
			filedStr += `CUT OFF:${this.bookDetailForm.ship.cyCutOff}\n`
			filedStr += `ETD:${this.bookDetailForm.ship.etdTime}\n`
			clip(filedStr, e)
		},
		// 复制
		handleCopy(val, e) {
			clip(val, e)
		},
		clipboardSuccess() {
			this.$message({
				message: '复制成功',
				type: 'success',
				duration: 1500
			})
		},
		// bkg鼠标移入显示copy
		showCopyTip(event, value) {
			if (!this.isBkg || !value) return
			let evt = event.srcElement
			let { top, right } = evt.getBoundingClientRect()
			this.copyTips.left = right
			this.copyTips.top = top
			this.copyTips.text = value
			this.copyTips.show = true
			// console.log('移入', value)
		},
		showTip() {
			this.copyTips.show = true
		},
		// 鼠标移出cell
		hiddenCopyTip() {
			this.copyTips.show = false
		},
		// 去订舱
		goBooking() {
			let routeUrl = this.$router.resolve({
				name: 'Booking',
				query: {
					orderNo: this.$route.query.orderNo,
					bkgReqNo: this.mainBkgReqNo,
					carrierCode: this.bookDetailForm.ship.shipCarrierCode
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		// 重新编辑
		applyFn(row) {
			let { shipmentId } = row
			let routeUrl = this.$router.resolve({
				name: 'Booking',
				query: {
					orderNo: this.$route.query.orderNo,
					bkgReqNo: this.mainBkgReqNo,
					carrierCode: this.bookDetailForm.ship.shipCarrierCode,
					shipmentId
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		updateBkgSoList(val) {
			this.bkgSoList = val
		},
		// 切换bkg人员
		handleChangeBkg(val) {
			console.log('bkgChange', val)
			// bkg角色直接修改订舱人员
			if (this.isBkg) {
				bookBkgChange({
					bkgReqNo: this.mainBkgReqNo,
					bkgEmployeeId: val
				})
					.then(res => {
						this.$message({
							type: 'success',
							message: '修改订舱人员成功',
							duration: 1000,
							onClose: () => {
								window.close()
							}
						})
					})
					.catch(err => {
						this.getBookInfo()
					})
			}
			// pricing商务角色
			if (this.isPricing) {
				this.$set(this.bookDetailForm, 'bkgEmployeeId', val)
				console.log('this.bookDetailForm.bkgEmployeeId', this.bookDetailForm.bkgEmployeeId)
			}
		},
		// 切换bkg人员
		handleChangeOp(val) {
			console.log('opChange', val)
			// pricing商务角色
			if (this.isPricing) {
				this.$set(this.bookDetailForm, 'bkgEmployeeId', val)
				console.log('this.bookDetailForm.bkgEmployeeId', this.bookDetailForm.bkgEmployeeId)
			}
		},
		// 切换pricing人员
		handleChangePricing(val) {
			console.log('pricingChange', val)
			bookAuditChange({
				bkgReqNo: this.mainBkgReqNo,
				employeeId: val
			})
				.then(res => {
					this.$message({
						type: 'success',
						message: '修改商务人员成功',
						duration: 1000,
						onClose: () => {
							window.close()
						}
					})
				})
				.catch(err => {
					this.getOrderWorkAssign()
				})
		},
		// 切换是否包含驳船费
		handleChangeIncludeFeeder(val) {
			this.includeFeeder = val
			if (val === 'y') {
				if (this.bookDetailForm.barge === null) {
					this.$set(this.bookDetailForm, 'barge', { porPortCode: '' })
				}
			}
		},
		// 撤回放舱
		recallRelease() {
			this.bkgReleaseCancelPopShow = true
		},
		bkgReleaseCancelPopClose(action) {
			this.bkgReleaseCancelPopShow = false
			if (action === 'Confirm') {
				this.getBookInfo()
				// this.$refs.soInfo.getSoList()
			}
		},
		// 箱型箱量统计方法：适用于多组箱型箱量(单SO)数组格式
		getContainerTotal(soContainerList) {
			let quantity = 0
			let weight = 0
			let volume = 0
			let containerArr = []
			let mergeArr = []
			let container = ''
			let weightStr = ''
			// let { soContainerList } = this.containerInfo
			soContainerList.forEach(item => {
				item.containerList.forEach(o => {
					quantity += o.quantity && o.containerNum ? Number(o.quantity) * Number(o.containerNum) : 0
					weight += o.weight && o.containerNum ? Number(o.weight) * Number(o.containerNum) : 0
					volume += o.volume && o.containerNum ? Number(o.volume) * Number(o.containerNum) : 0
					weight = parseFloat(weight.toFixed(3))
					volume = parseFloat(volume.toFixed(3))
					quantity = parseFloat(quantity.toFixed(3))
					containerArr.push({
						containerType: o.containerType ? o.containerType : '',
						containerNum: o.containerNum ? o.containerNum : '',
						weight: o.weight ? o.weight : ''
					})
				})
			})
			// console.log('containerArr', containerArr)
			// 箱型箱量合计统计把相同的箱型元素的箱量相加合并
			let containerTypeArr = [...new Set(containerArr.map(item => item.containerType))]
			containerTypeArr.forEach(item => {
				let arr = containerArr.filter(keys => keys.containerType === item)
				let sum = arr.reduce((a, b) => Number(a) + Number(b.containerNum), 0)
				mergeArr.push({
					containerType: item,
					containerNum: sum
				})
			})
			mergeArr.forEach((item, index) => {
				const firstText = index > 0 ? '+' : ''
				if (item.containerType || item.containerNum) {
					container += firstText + `${item.containerType} * ${item.containerNum}`
				}
			})
			// 单柜重量
			containerArr.forEach((item, index) => {
				const weightFirstText = index > 0 ? '、' : ''
				if (item.containerType || item.weight) {
					weightStr += weightFirstText + `${item.containerType}: ${item.weight}KGS`
				}
			})
			return {
				quantity: quantity,
				weight: weight,
				volume: volume,
				container: container,
				weightStr: weightStr,
				containerArr: mergeArr
			}
		},
		// 点击切换tab
		handleClickTab(item) {
			this.activeComponent = item.key
			// 从附件切换回订舱详情，订舱代理反显赋值
			if (this.activeComponent === 'book') {
				let { bkgAgentSupplierName, bkgAgentSupplierId } = this.bookDetailForm.ship
				this.bkgAgentList = [{ label: bkgAgentSupplierName, value: bkgAgentSupplierId }]
				if (this.isBkgRelease) {
					this.$nextTick(() => {
						this.$refs.soInfo && this.$refs.soInfo.getOrderBookInfo()
						this.$refs.soInfo && this.$refs.soInfo.getBookReleaseCheck()
					})
				} else {
					this.$nextTick(() => {
						this.$refs.soInfo && this.$refs.soInfo.getSoList()
					})
				}
			}
		},
		// 计算订舱信息容器高度
		getBookInfoHeight() {
			let bodyHeight = document.body.clientHeight
			let alertHeight = document.getElementById('alertCont').offsetHeight
			let tabHeight = document.getElementById('tabCont').offsetHeight
			let infoHeight = document.getElementById('infoCont').offsetHeight
			console.log('🚀 ~ offsetTop', infoHeight)
			this.workAssignHeight = bodyHeight - alertHeight - tabHeight - infoHeight - 24 - 25 // 24:参与人标题高度
			this.bookInfoHeight = bodyHeight - alertHeight - tabHeight - infoHeight - 25
			// let clientY = document.getElementById('infoCont').event.clientY
			// console.log('clientY', clientY);
			// this.bookInfoHeight = bodyHeight - clientY
		},
		// 切换参与人显示隐藏
		toggleWorkAssign() {
			this.workAssignShow = !this.workAssignShow
		},
		handleCommand() {
			this.exportEntrustedPopShow = true
		},
		handleExportPlan() {
			// 输出计划单
			handleExportPlanCommon()
		},
		exportPopClose(action, value) {
			if (action === 'Confirm') {
				this.handleExport(value)
			} else {
				this.exportEntrustedPopShow = false
			}
		},
		handleExport(obj) {
			let params = {
				...obj,
				bkgReqNo: this.mainBkgReqNo
			}
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/shiporder/book/booking/export',
					data: params
				})
				.then(res => {
					console.log(res)
					this.exportEntrustedPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = this.exportTypeOptions[params.bookingType] + this.$route.query.orderNo + '.' + params.docType.toLowerCase()
					link.click()
				})
		},
		handleOutputLetter() {},
		...mapMutations('book', ['setSoLogData', 'setSoNo', 'setShowLogs']),
		showViewLogs(val) {
			soLog({ so: val.so }).then(res => {
				this.setSoLogData(res.data)
				this.setSoNo(val.so)
			})
			this.setShowLogs(true)
		},
		// // 预览so附件
		// handleViewSo(row) {
		// 	this.$store.dispatch('order/previewFile', {
		// 		fileNo: row.soFileNo,
		// 		fileName: row.soFileName
		// 	})
		// },
		// // 预览甩柜证明
		// handleViewDrop(row) {
		// 	this.$store.dispatch('order/previewFile', {
		// 		fileNo: row.fileNo,
		// 		fileName: row.fileName
		// 	})
		// },
		//获取so列表
		getSoList() {
			soList(this.mainBkgReqNo).then(res => {
				this.soLists = res.data || []
			})
		},
		init() {
			// 商务和bkg都可预览附件
			if ((this.isBkg || this.isPricing) && this.$route.query.orderNo) {
				this.tabsArr = [
					{ label: '订舱详情', key: 'book' },
					{ label: '附件', key: 'file' },
					{ label: '费用', key: 'fee' }
				]
			} else {
				this.tabsArr = [{ label: '订舱详情', key: 'book' }]
				if (this.$route.query.orderNo) {
					this.tabsArr.push({ label: '费用', key: 'fee' })
				}
			}
			this.isRefuse = false
			this.bkgRefuseBtnShow = false
			this.bkgSaveBtnShow = false
			this.releaseCancelBtnShow = false
			this.countryCode = ''
			this.activeComponent = 'book'
			// 清除校验结果
			this.$nextTick(() => {
				this.$refs['auditForm'].clearValidate()
				// let containerList = this.$refs['soContainer'].$refs['containerList']
				// for (var i = 0; i < containerList.length; i++) {
				// 	containerList[i].clearValidate()
				// }
			})
			this.getBookInfo()
			// this.getSoList()
			// this.getDropCompareList()
		},
		// 获取港口countryCode
		getCountryCode(val) {
			this.countryCode = val
		},
		//获取甩柜信息
		getDropCompareList() {
			dropCompareList({ bkgReqNo: this.mainBkgReqNo }).then(res => {
				if (res.data) {
					this.soDropList = res.data.map(item => {
						return {
							...item.newSo,
							vesselOld: item.oldSo && item.oldSo.vessel,
							voyageOld: item.oldSo && item.oldSo.vessel,
							cutOffDateOld: item.oldSo && item.oldSo.cutOffDate
						}
					})
				} else {
					this.soDropList = []
				}
			})
		},
		// 获取系统航线名称
		fillSysLine(sysLineCode) {
			if (sysLineCode) {
				baseSystemLineInfo({ sysLineCode }).then(res => {
					this.sysLineCname = this.$language === 'en' ? res.data.ename : res.data.cname
				})
			}
		},
		// 参与人修改保存后重新获取参与人
		refreshWorkerAssign() {
			this.isPricing && this.getOrderWorkAssign()
			this.isBkg && this.getBookInfo()
		},
		// 更改签约分公司后，协同参与人的值重置为空
		handleEmptyJointWorkAssign() {
			if (this.jointOrderWorkOptions.length) {
				this.jointOrderWorkOptions = this.jointOrderWorkOptions.map(item => {
					return { ...item, employeeId: '', employeeName: '' }
				})
			}
		},
		// 商务获取参与人接口
		getOrderWorkAssign(param = {}, fieldName) {
			let { smContractId, isClear, sysLineCode, shipCarrierCode, polPortCode, bkgAgentSupplierId } = param
			this.$route.query.orderNo &&
				orderWorkList({
					orderNo: this.$route.query.orderNo,
					smContractId,
					sysLineCode,
					shipCarrierCode,
					polPortCode,
					bkgAgentSupplierId
				}).then(res => {
					let { isJoint, orgWorkAssignList, jointWorkAssignList } = res.data
					this.orderIsJoint = isJoint
					// 先取obd部门code，再取下单助理部门code最后再取bd部门code
					let findObdItem = orgWorkAssignList.find(item => item.jobCode === 'obd')
					let findAsstItem = orgWorkAssignList.find(item => item.jobCode === 'asst')
					let findBdItem = orgWorkAssignList.find(item => item.jobCode === 'bd')
					let obdDeptCode = findObdItem ? findObdItem.deptCode : ''
					let asstDeptCode = findAsstItem ? findAsstItem.deptCode : ''
					let bdDeptCode = findBdItem ? findBdItem.deptCode : ''
					this.obdDeptCode = obdDeptCode ? obdDeptCode : asstDeptCode ? asstDeptCode : bdDeptCode

					this.setWorkAssignValue(isJoint === 'Y', jointWorkAssignList, orgWorkAssignList, isClear, fieldName)
				})
		},
		// 参与人值处理,isClear传参是清空协同参与人
		setWorkAssignValue(isJoint, jointWorkAssignList, orgWorkAssignList, isClear, fieldName) {
			// console.log('this.bookDetailForm.bkgEmployeeId', this.bookDetailForm.bkgEmployeeId);
			this.orderWorkOptions = orgWorkAssignList.map(item => {
				if (item.employeeId == 0) {
					item.employeeName = ''
				}
				item.employeeId = item.employeeId || ''
				if (item.jobCode === 'bkg') {
					item.employeeId = !isJoint && this.bookDetailForm.bkgEmployeeId ? this.bookDetailForm.bkgEmployeeId : item.employeeId
					item.employeeName = !isJoint && this.bookDetailForm.bkgEmployeeName ? this.bookDetailForm.bkgEmployeeName : item.employeeName
				}
				return { ...item }
			})
			if (isJoint) {
				// 在这里获取参与人的职业信息
				for (let i in this.workAssignObj) {
					let findItem = jointWorkAssignList.find(item => item.jobCode === i && item.employeeId) || {}
					Object.assign(this.workAssignTipObj[i], findItem)
					this.workAssignTipObj[i].empId = findItem.employeeId || ''
					this.workAssignTipObj[i].empName = findItem.employeeName || ''
				}
				// console.log('this.workAssignTipObj-1111111', this.workAssignTipObj)
				this.jointOrderWorkOptions = jointWorkAssignList.map(item => {
					item.isUpdate = false
					if (item.employeeId == 0) {
						item.employeeName = ''
					}
					item.employeeId = item.employeeId || ''
					// 修改起运港，目的地，系统航线，船公司，订舱代理会重新分配协同参与人岗位人员。
					if (fieldName) {
						let jobObj = this.workAssignTipObj[item.jobCode]
						// console.log('jobObj----2222', jobObj, item.jobCode);
						if (jobObj && jobObj.empId) {
							// 参与人有更新的给出提示
							if (jobObj.orgEmpId && jobObj.orgEmpId !== jobObj.empId) {
								item.isUpdate = true
							}
							item.employeeId = jobObj.empId
							item.employeeName = jobObj.empName
						}
					}
					// 协同订舱人若为空的话，默认带出主单订舱人
					if (item.jobCode === 'bkg') {
						let bkgJobObj = this.workAssignTipObj[item.jobCode]
						if (!item.employeeId && bkgJobObj.orgEmpId) {
							item.employeeId = bkgJobObj.orgEmpId
							item.employeeName = bkgJobObj.orgEmpName
						} else if (!item.employeeId && !bkgJobObj.orgEmpId) {
							let bkgItem = this.orderWorkOptions.find(item => item.jobCode === 'bkg')
							item.employeeId = bkgItem ? bkgItem.employeeId : ''
							item.employeeName = bkgItem ? bkgItem.employeeName : ''
						}
						this.$set(this.bookDetailForm, 'bkgEmployeeId', item.employeeId)
					}
					if (isClear) {
						item.employeeId = ''
						item.employeeName = ''
					}
					return { ...item }
				})
				this.updatePricingBkgTip(fieldName, this.jointOrderWorkOptions)
				// 上一次选中的参与人，用来跟航线配置的参与人做比对
				for (let i in this.workAssignObj) {
					let findItem = this.jointOrderWorkOptions.find(item => item.jobCode === i)
					let orgEmpId = findItem ? findItem.employeeId : ''
					let orgEmpName = findItem ? findItem.employeeName : ''
					this.workAssignTipObj[i].orgEmpId = orgEmpId
					this.workAssignTipObj[i].orgEmpName = orgEmpName
				}
				// console.log('this.jointOrderWorkOptions-333333333', this.jointOrderWorkOptions)
				// console.log('this.workAssignTipObj-333333333', this.workAssignTipObj);
			}
		},
		// 修改起运港，船司，订舱代理等调航线配置接口改变协同参与人的提示信息
		updatePricingBkgTip(fieldName, data) {
			let name = ''
			let nameArr = []
			let flag = false
			for (let i in this.workAssignObj) {
				if (data.find(item => item.jobCode === i && item.isUpdate)) {
					nameArr.push(this.workAssignTipObj[i].name)
					// name += this.workAssignTipObj[i].name + '、'
					flag = true
				}
			}
			name = nameArr.join('、')
			console.log('name', name, flag)
			if (flag) {
				this.$message({
					type: 'warning',
					dangerouslyUseHTMLString: true,
					message: `订舱信息中的${fieldName}已被修改，请注意协同<strong>${name}人员已更新</strong>`
				})
			}
		},
		changeEmployeeId(param) {
			let { jobCode, employeeId, employeeName } = param
			this.workAssignTipObj[jobCode].orgEmpId = employeeId
			this.workAssignTipObj[jobCode].orgEmpName = employeeName
		},
		// 订舱详情
		getBookInfo() {
			this.lsLoading = true
			let { orderNo, jointNo, bkgReqNo, jointNoOnline } = this.$route.query
			let fun = !orderNo ? bookNewHoldInfo : bookOrderInfo
			let params = !orderNo ? {bkgReqNo} : {orderNo, jointNo}
			fun(params).then(response => {
				// 占舱详情
				if (!orderNo) {
					return this.setOccupyDetail(response.data)
				}
				this.mainBkgReqNo = bkgReqNo || response.data.bkgReqNo
				// 拿价类型转小写
				if (response.data.ship) {
					response.data.ship.priceType = response.data.ship.priceType ? response.data.ship.priceType.toLocaleLowerCase() : ''
				}
				this.bkgEmployeeId = response.data.bkgEmployeeId
				// 是否包含驳船
				this.includeFeeder = response.data.barge && response.data.barge.porPortCode ? 'y' : 'n'
				response.data.isOnline = response.data.isOnline || 'N'
				this.oBkgStatus = response.data.bkgStatus
				// this.mainBkgStatus = response.data.bkgStatus
				this.oIsOnline = response.data.isOnline
				// 获取收发通
				this.goodsInfo.transport = response.data.transport
				// 合约号数据
				this.initTemplate(response.data)
				// 进口、出口整箱调订单详情接口获取服务项
				orderNo && this.getOrderInfo(orderNo, jointNo)
				this.$store.dispatch('book/setBookInfo', response.data)
				// console.log('this.isBkgRelease', this.isBkgRelease)
				// bookDetailForm初始化
				this.bookDetailForm = copyArry(response.data)
				this.setBookDetailForm(response.data)
				// 商务订舱审核获取参与人，bkg订舱在bookInfo接口获取参与人
				if (this.isPricing) {
					this.getOrderWorkAssign({ smContractId: response.data.contractItemId })
				}
				// 查询在线订舱是否支持
				this.getCarrierList()
				// 华东是否订舱协同文件费用录入人员
				this.bkgJointParam = {
					isJoint: response.data.isJoint,
					polArea: response.data.polArea
				}
				if (this.bkgJointParam.isJoint && this.bkgJointParam.polArea.includes('华东') && !this.bookDetailForm.docEmployeeId) {
					// this.getDocEmployee()
				}
				console.log('this.bookDetailForm', this.bookDetailForm)
				// 获取客户类型
				this.$route.query.orderNo && this.getCustType()
				// 获取业务人，操作人的邮件及电话
				// let { launchEmployeeName, launchEmployeeMail, launchEmployeePhone, opEmployeeName, opEmployeeMail, opEmployeePhone } = this.bookDetailForm
				// 根据船公司code获取船公司name
				let shipCarrierCode = response.data && response.data.ship && response.data.ship.shipCarrierCode
				let self = this
				// 订舱人员、订舱代理、船公司代理反显
				if (this.bookDetailForm.ship) {
					if (this.bookDetailForm.ship.bkgAgentSupplierId === 0) {
						this.bookDetailForm.ship.bkgAgentSupplierId = ''
						this.bookDetailForm.ship.bkgAgentSupplierName = ''
					}
					if (this.bookDetailForm.ship.shipAgentSupplierId === 0) {
						this.bookDetailForm.ship.shipAgentSupplierId = ''
						this.bookDetailForm.ship.shipAgentSupplierName = ''
					}
					let { auditEmployeeId, auditEmployeeName, bkgEmployeeId, bkgEmployeeName, priceEmployeeId, priceEmployeeName, docEmployeeId, docEmployeeName } = this.bookDetailForm
					let { bkgAgentSupplierName, bkgAgentSupplierId, shipAgentSupplierName, shipAgentSupplierId, polPortCode, polPortName, podPortCode, sysLineCode } = this.bookDetailForm.ship
					this.bkgAgentList = [{ label: bkgAgentSupplierName, value: bkgAgentSupplierId }]
					this.employeeListParam = {
						bkg: [{ label: bkgEmployeeName, value: bkgEmployeeId }],
						doc: [{ label: docEmployeeName, value: docEmployeeId }]
					}
					console.log('this.employeeListParam', this.employeeListParam)

					this.fillSysLine(sysLineCode)
					// 获取目的港countryCode，做木质包装显示隐藏
					if (podPortCode) {
						this.$store.dispatch('dict/basePortListByCodes', { portCodes: podPortCode }).then(data => {
							let portItem = data.find(item => item.portCode === podPortCode)
							this.countryCode = portItem ? portItem.countryCode : ''
						})
					}
				}
				// 获取订舱协同性申请撤回提示
				this.getServiceJointInfo()
				// 获取拒绝信息
				this.getRefuse()
				// 获取箱型箱量信息
				this.containerInfo.soContainerList = response.data.soContainer
				// 加柜
				if (this.isAddCont) {
					let { containerModifyInfo } = response.data
					// 除了bkg的审核拒绝，订舱拒绝，待审核的显示原单箱型箱量数据，商务和其他状态都显示调整箱型箱量后的数据
					if (!(this.isBkg && ['book_refuse', 'refuse', 'submit'].includes(containerModifyInfo.bkgStatus))) {
						this.containerInfo.soContainerList = containerModifyInfo.soContainer
					}
					this.bookDetailForm.bkgStatus = containerModifyInfo.bkgStatus
					this.oBkgStatus = containerModifyInfo.bkgStatus
				}
				Object.assign(this.containerInfo, handleData.arrContainerInfo(response.data.soContainer))
				// bkg的箱型箱量默认收起
				if (this.isBkg) {
					this.containerInfo.soContainerList = this.containerInfo.soContainerList.map(item => {
						return { ...item, containerListShowState: true }
					})
					// 获取参与人
					let { isJoint, workAssign, jointWorkAssign, jointNo } = response.data
					this.orderIsJoint = jointNo ? 'Y' : ''
					this.setWorkAssignValue(this.orderIsJoint === 'Y', jointWorkAssign, workAssign)
				}
				// 商务审核协助审单人ID设置
				if (this.isPricing) {
					this.bookDetailForm.auditEmployeeId = this.bookDetailForm.orgAuditEmployeeId ? this.bookDetailForm.auditEmployeeId : ''
				}
				// 协助审核人输入框信息
				this.disabledAuditEmployeeId = this.bookDetailForm.orgAuditEmployeeId ? true : false
				// bkg获取加柜原箱型箱量数据并设置默认收起
				if (this.isAddCont && this.isBkg) {
					this.bookDetailForm.soContainer = response.data.soContainer.map(item => {
						return { ...item, containerListShowState: true }
					})
				}
				//有jointNo的时候取订舱或代订舱的服务项 （从列表传jointNo=jointNo&jointNoOnline=jointNoOnline）
				//如果有协同取消直接显示就好
				//如果上面没有，如果有jointNoOnline 取在线订舱的服务项book_online
				//自己构建 cancelJointParams orderNo=orderNo,jointNo=jointNoOnline,serviceCode=Book_Online 
				if (!jointNo && jointNoOnline) {
					// let findItem = response.data.serviceInfoList.find(item => item.serviceCode === 'book_online') || {}
					orderInfoBookOnline({orderNo, jointNo: jointNoOnline}).then(res => {
						this.cancelJointParams = res.data.serviceInfoList.length ? res.data.serviceInfoList[0] : {}
						Object.assign(this.cancelJointParams, {jointNo: jointNoOnline})
					})
				} else {
					// let findItem = response.data.serviceInfoList.find(item => item.serviceCode === 'book' || item.serviceCode === 'proxy_book') || {}
					this.cancelJointParams = response.data.serviceInfoList.length ? response.data.serviceInfoList[0] : {}
					Object.assign(this.cancelJointParams, {jointNo})
				}

				let findOpItem = response.data.workAssign.find(item => item.jobCode === 'op')
				this.opName = findOpItem ? findOpItem.employeeName : ''
				this.proxyCancelApplyParams = {
					submitCancelStatus: response.data.submitCancelStatus,
					submitCancelRemark: response.data.submitCancelRemark,
					submitCancelRefuseRemark: response.data.submitCancelRefuseRemark
				}
				// 如果该单同时存在加柜，改船时，则分别比较containerModifyInfo、portModifyInfo、根节点的bkgStatus字段的值，取最小的为此单的订舱状态
				if (this.isAddCont || this.isChange) {
					this.getBookDetailBkgStatus(response.data)
				} else {
					// 获取订舱状态的在订舱状态数组中的索引值
					this.bkgStatus.map((item, index) => {
						if (item.value === this.bookDetailForm.bkgStatus) {
							this.bkgStatusIndex = index
						}
					})
				}
				if (this.isBkg) {
					// 获取SO列表
					if (this.oBkgStatus === 'book_release' && this.$route.query.orderNo) {
						this.isBkgRelease = true
						this.$refs.soInfo.getOrderBookInfo()
					} else {
						this.isBkgRelease = false
						this.$refs.soInfo.getSoList()
					}
				}
				// 改船后的数据从portModifyInfo节点获取
				if (this.isChange) {
					this.getChangeShipInfo(response.data)		
				}
				// 获取港口信息
				this.getFillPortCodes()
				// 按钮显示隐藏设置
				this.bkgBtnsShow(response.data)
				// so信息，甩柜信息，在线订舱
				this.getOnlineBookNo()
				this.getSoList()
				this.getDropCompareList()
				// 商务待审核的详情接口返回免用免堆为空的话，调用运价接口获取最新的免用免堆
				if (!this.bookDetailForm.ship.freetimeSys && this.isPricing && ['submit', 'book_refuse'].includes(this.bookDetailForm.bkgStatus)) {
					this.handleFillFreetimeSys()
				} else {
					this.updateFreeTimeSys(this.bookDetailForm.ship.freetimeSys)
				}
				this.orderInfoData = {
					orderNo: this.$route.query.orderNo,
					bkgEmployeeName: response.data.bkgEmployeeName,
					launchEmployeeName: response.data.launchEmployeeName,
					opEmployeeMail: response.data.opEmployeeMail,
					polPortCode: response.data.ship.polPortCode, // 起运港
					podPortCode: response.data.ship.podPortCode, // 目的港
					custName: response.data.custName, // 委托单位
					container: this.allContainerTotal.container // 箱型箱量合计
				}
				console.log('bookDetailForm', this.bookDetailForm, this.opName)
			}).finally(() => {
				if(!this.isNotFirstIn){
					this.isNotFirstIn = true
					setTimeout(() => {
						this.activeComponent = this.$route.query.activeComponent || 'book'
						this.lsLoading = false
					}, 300)
				}else{
					this.lsLoading = false
				}
      })
		},
		// 获取免用免堆信息
    handleFillFreetimeSys(notIncludeBarge) {
      let { polPortCode, podPortCode, unloadingPortCode, transitPortCode, transitPortCode1, transitPortCode2, sysLineCode, shipCarrierCode, cyCutOff, etdTime } = this.bookDetailForm.ship
      let { porPortCode } = this.bookDetailForm.barge
      let transitPortCodesArr = []
      transitPortCode ? transitPortCodesArr.push(transitPortCode) : ''
      transitPortCode1 ? transitPortCodesArr.push(transitPortCode1) : ''
      transitPortCode2 ? transitPortCodesArr.push(transitPortCode2) : ''
      // let transitPortCodes = transitPortCodesArr.toString()
			// 增加箱型数组传参
      let containerList = this.containerTotal.containerArr.filter(item => item.containerType).map(item => item.containerType)
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
				containerList
			}
			// 业务自拿价，bkg修改字段，非出口整箱的商务的不用获取运价的免用免堆
      if (this.bookDetailForm.businessType !== 'ship_export_fcl' || this.isBkg || this.bookDetailForm.ship.priceType === 'bd') return
      // 传参不变的话，不请求免用免堆信息接口。优化减少请求次数
      // if (Object.entries(this.freetimeSysParam).toString() === Object.entries(param).toString()) return

			// 如果没有箱型箱量数据不请求接口
      if (containerList.length === 0) return
      mainRouteFreeTime(param).then(res => {
				this.freetimeSysParam = param
				this.saveFreeTimeSys = res.data
				if (res.data) {
					if (this.bookDetailForm.ship.freetimeSys !== res.data) {
						this.$message.warning('请注意免用免堆信息已变更！')
					}
					this.$set(this.bookDetailForm.ship, 'freetimeSys', res.data)
					// this.$emit('updateFreeTimeSys', res.data)
				}
        // console.log('this.containerTotal.container', this.containerTotal, this.bookDetailForm.cargoList)
        if (this.containerTotal.containerArr.some(item => ['20FR','20RF','20OT','40FR','40RF','40OT'].includes(item.containerType))) {
          this.$set(this.bookDetailForm.ship, 'freetimeSys', '')
        }
        if (this.bookDetailForm.cargoList.some(item => ['dangerous'].includes(item.property))) {
          this.$set(this.bookDetailForm.ship, 'freetimeSys', '')
        }
      })
    },
		setOccupyDetail(data) {
			this.bookDetailForm = copyArry(data)
			// 订舱人员、订舱代理、船公司代理反显
			let { bkgStatus, auditEmployeeId, auditEmployeeName, bkgEmployeeId, bkgEmployeeName, porPortCode, bkgAgentSupplierName, bkgAgentSupplierId, shipAgentSupplierName, isOnline, 
				shipAgentSupplierId, polPortCode, podPortCode, unloadingPortCode, cyCutOff, etdTime, vessel, voyage, shipCarrierCode, sysLineCode, isExternal, contractNo, transportTerm } = this.bookDetailForm
			this.bkgAgentList = [{ label: bkgAgentSupplierName, value: bkgAgentSupplierId }]
			this.bookDetailForm.ship = {
				polPortCode,
				podPortCode,
				unloadingPortCode,
				cyCutOff,
				etdTime,
				vessel,
				voyage,
				shipCarrierCode,
				sysLineCode,
				bkgAgentSupplierId,
				isExternal,
				contractNo
			}
			this.bookDetailForm.transport = {
				transportTerm
			}
			this.bookDetailForm.barge = {
				porPortCode
			}
			this.bookDetailForm.isOnline = isOnline || 'N'
			this.oIsOnline = isOnline
			let portCodeArr = []
			porPortCode ? portCodeArr.push(porPortCode) : ''
			polPortCode ? portCodeArr.push(polPortCode) : ''
			podPortCode ? portCodeArr.push(podPortCode) : ''
			unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
			this.fillPortCodes = portCodeArr.toString()
			// 获取目的港countryCode，做木质包装显示隐藏
			if (podPortCode) {
				this.$store.dispatch('dict/basePortListByCodes', { portCodes: podPortCode }).then(data => {
					let portItem = data.find(item => item.portCode === podPortCode)
					this.countryCode = portItem ? portItem.countryCode : ''
				})
			}
			// 获取箱型箱量信息
			this.containerInfo.soContainerList = data.soContainer
			Object.assign(this.containerInfo, handleData.arrContainerInfo(data.soContainer))
			this.cargoList = data.cargoList && data.cargoList.length ? data.cargoList : [{ boxRemark: '无' }]
			// 获取拒绝信息
			let { refuseReason, refuseRemark, refuseEmployeeId } = this.bookDetailForm
			this.isRefuse = refuseEmployeeId === this.userId ? true : false
			let refuseReasonCn = getDictLabel('bkgRefuseReason', refuseReason)
			if (this.isRefuse) {
				this.refuseReason = refuseRemark ? `${refuseReasonCn}(${refuseRemark})` : `${refuseReasonCn}`
			}
			this.employeeListParam = {
				bkg: [{ label: data.bkgEmployeeName, value: data.bkgEmployeeId }],
			}
			// this.mainBkgStatus = bkgStatus
			this.oBkgStatus = bkgStatus
			// 正常订舱单-主单的bkg按钮
			if (!['refuse', 'book_refuse', 'book_release'].includes(this.bookDetailForm.bkgStatus) && !['break', 'cancel'].includes(data.orderStatus)) {
				this.bkgSaveBtnShow = true
				this.bkgRefuseBtnShow = true
			} else {
				this.bkgRefuseBtnShow = false
				this.bkgSaveBtnShow = false
			}
			console.log('this.employeeListParam', this.employeeListParam)
		},
		getBookDetailBkgStatus(data) {
			let {bkgStatus, containerModifyInfo, portModifyInfo} = data
			let bkgStatusArr = [...this.bkgStatus]
			if (this.isPricing) {
				bkgStatusArr.unshift({label: '待审核', value: 'submit'},{label: '审核拒绝', value: 'book_refuse'})
			} 
			if (this.isBkg) {
				// bkgStatusArr.unshift({label: '待审核', value: 'submit'})
			}
			let bkgStatusIndexArr = []
			bkgStatusArr.map((item, index) => {
				if (item.value === bkgStatus) {
					bkgStatusIndexArr.push(index)
				}
				if (this.isChange && item.value === portModifyInfo.bkgStatus) {
					bkgStatusIndexArr.push(index)
				}
				if (this.isAddCont && item.value === containerModifyInfo.bkgStatus) {
					bkgStatusIndexArr.push(index)
				}
			})
			let minIndex = Math.min(...bkgStatusIndexArr)
			this.bookDetailForm.bkgStatus = bkgStatusArr[minIndex].value
			console.log('this.bookDetailForm.bkgStatus```````````', this.bookDetailForm.bkgStatus);
			
			this.oBkgStatus = bkgStatusArr[minIndex].value
			// 获取订舱状态的在订舱状态数组中的索引值
			this.bkgStatus.map((item, index) => {
				if (item.value === this.bookDetailForm.bkgStatus) {
					this.bkgStatusIndex = index
				}
			})
		},
		getRefuse() {
			let { refuseReason, refuseRemark, refuseEmployeeId, bkgStatus, orderStatus } = this.bookDetailForm
			let refuseReasonCn = ''
			// 拒绝给商务或是拒绝给业务都显示拒绝原因
			this.isRefuse = bkgStatus === 'book_refuse' || (refuseEmployeeId !== this.userId && bkgStatus === 'refuse' && orderStatus === 'refuse') ? true : false
			refuseReasonCn = getDictLabel('bkgRefuseReason', refuseReason) || getDictLabel('orderAuditRefuseReason', refuseReason)
			if (this.isRefuse) {
				this.refuseReason = refuseRemark ? `${refuseReasonCn}(${refuseRemark})` : `${refuseReasonCn}`
			}
		},
		getFillPortCodes() {
			let { polPortCode, podPortCode, unloadingPortCode, transitPortCode, transitPortCode1, transitPortCode2 } = this.bookDetailForm.ship
			let porPortCode = this.bookDetailForm.barge ? this.bookDetailForm.barge.porPortCode : ''
			let portCodeArr = []
			porPortCode ? portCodeArr.push(porPortCode) : ''
			polPortCode ? portCodeArr.push(polPortCode) : ''
			podPortCode ? portCodeArr.push(podPortCode) : ''
			transitPortCode ? portCodeArr.push(transitPortCode) : ''
			transitPortCode1 ? portCodeArr.push(transitPortCode1) : ''
			transitPortCode2 ? portCodeArr.push(transitPortCode2) : ''
			unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
			this.fillPortCodes = portCodeArr.toString()
		},
		setBookDetailForm(data) {
			// 审核人
			this.auditEmployeeId = data.auditEmployeeId
			if (data.orgAuditEmployeeId) {
				this.assistAuditEmpList = [{ label: data.auditEmployeeName, value: data.auditEmployeeId }]
			}
			if (data.barge == null) {
				this.bookDetailForm.barge = { porPortCode: '' }
			}
			if (!data.transport) {
				this.bookDetailForm.transport = {}
			}
			this.bookDetailForm.businessTypeCn = getDictLabel('shipBusinessType', data.businessType)
			if (['st01', 'st09', 'st15', 'st24'].includes(data.serviceType)) {
				this.bookDetailForm.serviceTypeCn = '委托订舱'
			}
			if (['st10', 'st25'].includes(data.serviceType)) {
				this.bookDetailForm.serviceTypeCn = '客户自订'
			}
			// 获取订舱类型
			this.bookDetailForm.bkgTypeName = data.bkgType == 'general' ? '普通订舱' : '代订舱'
			if (data.barge && data.barge.etdTime) {
				// 是否可以修改 驳船信息
				this.bargeEtdTime = true
				this.$set(this.bookDetailForm.ship, 'bargeEtdTime', data.barge.etdTime)
			} else {
				this.bargeEtdTime = false
			}
			if (this.bookDetailForm.bkgEmployeeId === 0) {
				this.bookDetailForm.bkgEmployeeId = ''
				this.bookDetailForm.bkgEmployeeName = ''
			}
			this.bookDetailForm.ship.bkgEmployeeId = this.bookDetailForm.bkgEmployeeId
		},
		bkgBtnsShow(data) {
			// 保存，拒绝按钮设置：已拒绝状态的不可保存和拒绝;订单状态为终止，已取消的也屏蔽保存，拒绝按钮
			// 正常订舱单-主单的bkg按钮
			let bkgStatus = this.bookDetailForm.bkgStatus
			if (!(this.isChange || this.isAddCont)) {
				bkgStatus = this.oBkgStatus
			}
			if (!['refuse', 'book_refuse', 'book_release'].includes(bkgStatus) && !['break', 'cancel'].includes(data.orderStatus)) {
				this.bkgSaveBtnShow = true
				this.bkgRefuseBtnShow = true
			} else {
				this.bkgRefuseBtnShow = false
				this.bkgSaveBtnShow = false
			}
			// 放舱撤回按钮设置：已放舱状态显示, 订单状态为终止，已取消的不显示
			if (data.bkgStatus === 'book_release' && !['break', 'cancel'].includes(data.orderStatus)) {
				this.releaseCancelBtnShow = true
			} else {
				this.releaseCancelBtnShow = false
			}
		},
		initTemplate(data) {
			let { contractTemplate, contractItemId, orderNo, jointNo } = data
			this.contractTempInfo = contractTemplate || {}
			if (!contractTemplate) {
				this.$refs.bookInfo.initTempData({})
			} else {
				this.$refs.bookInfo.initTempData({ ...contractTemplate, contractItemId })
			}
		},
		getChangeShipInfo(data) {
			this.newData = data.portModifyInfo
			this.hisData = data
			// 改船的订舱详情数据取portModifyInfo节点
			if (this.isChange) {
				// this.bookDetailForm = {...copyArry(data.portModifyInfo), portModifyInfo: data.portModifyInfo}
				let { bkgStatus, polPortCode, shipCarrierCode, vessel, voyage, transitPortCode, transitPortCode1, transitPortCode2, unloadingPortCode, podPortCode, porPortCode, 
					cyCutOff, bargeEtdTime, bargeCyCutOff, etdTime } = data.portModifyInfo
				// this.oBkgStatus = bkgStatus
				// this.bookDetailForm.bkgStatus = bkgStatus
				this.bookDetailForm.barge.porPortCode = porPortCode
				this.bookDetailForm.ship.polPortCode = polPortCode
				this.bookDetailForm.ship.transitPortCode = transitPortCode
				this.bookDetailForm.ship.transitPortCode1 = transitPortCode1
				this.bookDetailForm.ship.transitPortCode2 = transitPortCode2
				this.bookDetailForm.ship.unloadingPortCode = unloadingPortCode
				this.bookDetailForm.ship.podPortCode = podPortCode
				this.bookDetailForm.ship.shipCarrierCode = shipCarrierCode
				this.bookDetailForm.ship.cyCutOff = cyCutOff
				this.bookDetailForm.ship.bargeEtdTime = bargeEtdTime
				this.bookDetailForm.ship.bargeCyCutOff = bargeCyCutOff
				this.bookDetailForm.ship.etdTime = etdTime
				// this.bookDetailForm.ship.vessel = vessel
				// this.bookDetailForm.ship.voyage = voyage
				this.bookDetailForm.ship.vessel = vessel
				this.bookDetailForm.ship.voyage = voyage
				// 是否包含驳船
				this.includeFeeder = porPortCode ? 'y' : 'n'
			}
			if (this.isChangeJust) {
				this.$nextTick(() => {
					this.$refs.changeShip.$refs.changeInfo.getChangeInfo()
				})
			}
		},
		getServiceJointInfo() {
			let serviceInfoList = this.bookDetailForm.serviceInfoList
			let list = serviceInfoList.filter(item => item.jobCode === 'bkg' && item.jointNo)
			if (list.length) {
				Object.assign(this.serviceInfo, list[0])
			} else {
				this.serviceInfo = {
					serviceName: '',
					cancelApplyStatus: '',
					cancelReason: ''
				}
			}
			console.log(this.serviceInfo)
			this.isCancelApply = this.serviceInfo.cancelApplyStatus === 'applied' ? true : false
		},
		getOrderInfo(orderNo, jointNo) {
			let fun = jointNo ? orderJointNopermInfo : orderNopermInfo
			let query = jointNo ? { jointNo } : { orderNo }
			fun(query).then(res => {
				this.orderDetail = res.data
				let serviceNameList = res.data.serviceList.map(item => {
					return getDictLabel('orderServiceList', item)
				})
				this.serviceNameStr = ''
				serviceNameList.map((item, index) => {
					this.serviceNameStr += index ? `+${item}` : item
				})
			})
		},
		// getDocEmployee() {
		// 	let data = {
		// 		orderNo: this.$route.query.orderNo,
		// 		deptCode: this.userInfo.deptCode,
		// 		sysLineCode: this.bookDetailForm.ship.sysLineCode,
		// 		shipCarrierCode: this.bookDetailForm.ship.shipCarrierCode,
		// 		polPortCode: this.bookDetailForm.ship.polPortCode,
		// 		bkgAgentSupplierId: this.bookDetailForm.ship.bkgAgentSupplierId
		// 	}
		// 	orderWorkSi(data).then(res => {
		// 		// 在这里获取doc的职员信息
		// 		let docUpdateItem = res.data.find(item => item.jobCode === 'doc' && item.employeeId)
		// 		if (docUpdateItem) {
		// 			this.$set(this.bookDetailForm, 'docEmployeeId', docUpdateItem.employeeId || '')
		// 			this.$set(this.bookDetailForm, 'docEmployeeName', docUpdateItem.employeeName || '')
		// 			this.$set(this.employeeListParam, 'doc', [
		// 				{
		// 					label: this.bookDetailForm.docEmployeeName,
		// 					value: this.bookDetailForm.docEmployeeId
		// 				}
		// 			])
		// 		}
		// 	})
		// },
		getCustType() {
			orderCustInfo({ orderNo: this.bookDetailForm.orderNo }).then(res => {
				this.$set(this.bookDetailForm, 'custType', res.data.custClass)
				this.$set(this.bookDetailForm, 'custLevel', res.data.custLevel)
				this.$set(this.bookDetailForm, 'isWhitelist', res.data.isWhitelist)
				this.$set(this.bookDetailForm, 'industry', res.data.industry)
				this.$set(this.bookDetailForm, 'custClass', res.data.custClass)
				this.$set(this.bookDetailForm, 'contract', res.data.contract)
			})
		},
		// 更加code获取name
		// getPortName(val, data){
		// 	let findItem = data.find(item => item.value === val)
		// 	return findItem ? findItem.label_copy : ''
		// },
		
		getWorkAssign(data) {
			let workArr = data.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})
			return workArr
		},
		// 协同参与人校验bkg,op
		jointWorkAssignValidate() {
			let flag = true
			let bkgOpArr = []
			let msg = ''
			// 出口业务- 委托订舱 进口业务-委托订舱的校验bkg必填
			if (['st01', 'st15', 'st09'].includes(this.bookDetailForm.serviceType)) {
				bkgOpArr = this.jointOrderWorkOptions.filter(item => ['bkg'].includes(item.jobCode) && !item.employeeId)
				// console.log('bkgOpArr', bkgOpArr);
				bkgOpArr.map((item, index) => {
					msg += index ? `、${item.jobCname}` : item.jobCname
				})
			}
			// 进口业务-客户自订、散杂滚装-委托订舱，客户自订的校验op必填
			if (['st10', 'st24', 'st25'].includes(this.bookDetailForm.serviceType)) {
				bkgOpArr = this.jointOrderWorkOptions.filter(item => ['op'].includes(item.jobCode) && !item.employeeId)
				// console.log('bkgOpArr', bkgOpArr);
				bkgOpArr.map((item, index) => {
					msg += index ? `、${item.jobCname}` : item.jobCname
				})
			}
			if (msg) {
				this.$message({ type: 'error', message: `${msg}参与人不能为空` })
				flag = false
			}
			return flag
		},
		// 协同参与人校验bkg
		workAssignValidate() {
			let flag = true
			let bkgOpArr = []
			let msg = ''
			// 出口业务- 委托订舱 进口业务-委托订舱的校验bkg必填
			if (['st01', 'st15', 'st09'].includes(this.bookDetailForm.serviceType)) {
				bkgOpArr = this.orderWorkOptions.filter(item => ['bkg'].includes(item.jobCode) && !item.employeeId)
				// console.log('bkgOpArr', bkgOpArr);
				bkgOpArr.map((item, index) => {
					msg += index ? `、${item.jobCname}` : item.jobCname
				})
			}
			// 进口业务-客户自订,散杂滚装-客户自订的也要校验op必填
			if (['st10', 'st25'].includes(this.bookDetailForm.serviceType)) {
				bkgOpArr = this.orderWorkOptions.filter(item => ['op'].includes(item.jobCode) && !item.employeeId)
				// console.log('bkgOpArr', bkgOpArr);
				bkgOpArr.map((item, index) => {
					msg += index ? `、${item.jobCname}` : item.jobCname
				})
			}
			if (msg) {
				this.$message({ type: 'error', message: `${msg}参与人不能为空` })
				flag = false
			}
			return flag
		},
		handleSave(type) {
			delete this.bookDetailForm.ship.bkgEmployeeId
			let workAssign = []
			if (this.orderIsJoint === 'Y') {
				// 有设置协助审核人，保存时不校验协同订舱必填
				if (!this.bookDetailForm.auditEmployeeId && !this.jointWorkAssignValidate()) return
				workAssign = this.getWorkAssign(this.jointOrderWorkOptions)
			}
			let contractTemplate = this.$refs.bookInfo.contractTempDetail
			if (Object.keys(contractTemplate).length === 0) {
				contractTemplate = null
			}
			this.saveItems = {
				isJoint: this.orderIsJoint,
				workAssign: workAssign,
				submitType: type,
				auditRemark: this.bookDetailForm.auditRemark,
				bookingRequire: this.bookDetailForm.bookingRequire,
				bkgReqNo: this.bookDetailForm.bkgReqNo,
				orderNo: this.bookDetailForm.orderNo,
				bkgEmployeeId: this.bookDetailForm.bkgEmployeeId,
				contractItemId: this.bookDetailForm.contractItemId,
				contractTemplate: contractTemplate,
				// docEmployeeId: this.bookDetailForm.docEmployeeId,
				// priceEmployeeId: this.bookDetailForm.priceEmployeeId,
				// priceEmployeeName: this.bookDetailForm.priceEmployeeName,
				jointAuditEmployeeId: this.bookDetailForm.orgAuditEmployeeId ? undefined : this.bookDetailForm.auditEmployeeId,
				bkgStatus: this.bookDetailForm.bkgStatus,
				porPortCode: this.includeFeeder === 'y' ? this.bookDetailForm.barge.porPortCode : null,
				...this.bookDetailForm.ship,
				shipRefNo: this.bookDetailForm.shipRefNo,
				bkgRemark: this.bookDetailForm.bkgRemark,
				contractNo: this.bookDetailForm.ship.contractNo,
				contractCompany: this.bookDetailForm.ship.contractCompany,
				isExternal: this.bookDetailForm.isExternal,
				isOnline: this.bookDetailForm.isOnline,
				payCompanyCode: this.bookDetailForm.payCompanyCode,
				payCompanyName: this.bookDetailForm.payCompanyName,
				shipCarrierOrderNo: this.bookDetailForm.shipCarrierOrderNo
				// ...this.arrformInfo.bkgInfo.form
			}
			if (!this.isBulkRo) {
				this.saveItems.soContainerList = [...this.containerInfo.soContainerList]
			}
			if (this.isPricing) {
				// 散杂滚装的客户自订不需要维护收发通，其他服务类型的需要
				if (this.bookDetailForm.serviceType !== 'st25') {
					this.saveItems.transport = {
						shipper: this.goodsInfo.transport.shipper,
						consignee: this.goodsInfo.transport.consignee,
						notify1: this.goodsInfo.transport.notify1,
						notify2: this.goodsInfo.transport.notify2,
						notify3: this.goodsInfo.transport.notify3
					}
					// 进口整箱要增加的传参
					if (this.bookDetailForm.businessType === 'ship_import_fcl') {
						Object.assign(this.saveItems.transport, {
							customsSupplierId: this.bookDetailForm.transport.customsSupplierId,
							customsSupplierName: this.bookDetailForm.transport.customsSupplierName,
							truckSupplierId: this.bookDetailForm.transport.truckSupplierId,
							truckSupplierName: this.bookDetailForm.transport.truckSupplierName
						})
					}
				}
				this.saveItems.etdTime = this.bookDetailForm.ship.etdTime //大船预计开船时间
				this.saveItems.bargeEtdTime = this.bookDetailForm.ship.bargeEtdTime // 驳船预计开船时间
			}
			// 白名单客户
			if (this.isWhiteCust) {
				this.saveItems.isNodrop = this.bookDetailForm.isNodrop
			}
			let func = bookSave
			// // 改船审核保存
			// if (this.isChange) {
			// 	func = changePass
			// 	this.saveItems = {
			// 		submitType: type,
			// 		auditRemark: this.bookDetailForm.auditRemark,
			// 		bkgReqNo: this.bookDetailForm.bkgReqNo,
			// 		orderNo: this.bookDetailForm.orderNo,
			// 		vessel: this.bookDetailForm.ship.vessel,
			// 		voyage: this.bookDetailForm.ship.voyage,
			// 		sysLineCode: this.bookDetailForm.ship.sysLineCode,
			// 		carrierLineName: this.bookDetailForm.ship.carrierLineName,
			// 		carrierService: this.bookDetailForm.ship.carrierService,
			// 		shipCarrierCode: this.bookDetailForm.ship.shipCarrierCode,
			// 		cyCutOff: this.bookDetailForm.ship.cyCutOff,
			// 		polPortCode: this.bookDetailForm.ship.polPortCode,
			// 		contractNo: this.bookDetailForm.ship.contractNo,
			// 		contractCompany: this.bookDetailForm.ship.contractCompany,
			// 		bkgAgentSupplierId: this.bookDetailForm.ship.bkgAgentSupplierId,
			// 		isExternal: this.bookDetailForm.isExternal
			// 	}
			// }
			// if (this.isAddCont) {
			// 	func = addPass
			// 	this.saveItems = {
			// 		submitType: type,
			// 		bkgReqNo: this.bookDetailForm.bkgReqNo,
			// 		orderNo: this.bookDetailForm.orderNo,
			// 		soContainerList: [...this.containerInfo.soContainerList],
			// 		auditRemark: this.bookDetailForm.auditRemark
			// 	}
			// }
			delete this.saveItems.transitPortName
			delete this.saveItems.transitPortName1
			delete this.saveItems.transitPortName2
			// let func = this.isChange ? changePass : bookSave
			// 商务审核协同参与人bkg必填
			// if (!this.isChange && !this.isAddCont && this.isPricing && this.orderIsJoint === 'Y') {
			//   if (!this.bookDetailForm.bkgEmployeeId) {
			//     this.$message({type: 'error', message: '订舱参与人不能为空'})
			//   }
			// }
			func(this.saveItems).then(res => {
				if (type === 'pass') {
					return this.$message({
						type: 'success',
						message: '审核通过成功',
						duration: 1000,
						onClose: () => {
							this.handleGoBack()
						}
					})
				}
				this.$message({ type: 'success', message: '保存成功' })
				this.isPricing && this.getOrderWorkAssign()
				this.getBookInfo()
			})
		},
		// bkg已放舱状态保存大船预计开船时间&大船截关时间
		bkgSaveEtdTime() {
			let canSubmit = true
			this.$refs.auditForm.validate(valid => {
				if (valid) {
				} else {
					console.log('error submit!!')
					canSubmit = false
					toViewPosition('left-cont', 80)
					return false
				}
			})
			if (!canSubmit) {
				this.$message.error('请按要求填写数据')
			} else {
				this.handleBkgSave('book_release')
			}
		},
		saveFunc(type) {
			if (this.isPricing) {
				let canSubmit = true
				this.$refs.auditForm.validate(valid => {
					if (valid) {
					} else {
						console.log('error submit!!')
						canSubmit = false
						toViewPosition('left-cont', 80)
						return false
					}
				})
				// 商务保存提交时需箱型箱量校验
				if (!this.isBulkRo) {
					let containerList = this.$refs['soContainer'].$refs['containerList']
					if (containerList) {
						for (var i = 0; i < containerList.length; i++) {
							containerList[i].validate(isVaild => {
								if (isVaild) {
								} else {
									console.log('error submit!!')
									canSubmit = false
									toViewPosition('left-cont', 80)
									return
								}
							})
						}
					}
				}
				if (!canSubmit) {
					this.$message.error('请按要求填写数据')
				} else {
					this.handleSave(type)
				}
			} else if (this.isBkg) {
				let canSubmit = true
				this.$refs.auditForm.validate(valid => {
					if (valid) {
					} else {
						console.log('error submit!!')
						canSubmit = false
						toViewPosition('left-cont', 80)
						return false
					}
				})
				if (!canSubmit) {
					this.$message.error('请按要求填写数据')
				} else {
					if (this.orderIsJoint === 'Y') {
						// 保存时校验协同订舱必填
						if (!this.jointWorkAssignValidate()) return
					} else {
						// 保存时校验协同订舱必填
						if (!this.workAssignValidate()) return
					}
					let soInfo = this.$refs.soInfo.soLists
					if (this.bookDetailForm.bkgStatus === 'book_release' && !soInfo.length) {
						this.$confirm('未上传so信息，是否确认修改订舱状态为已放舱?', '警告', {
							confirmButtonText: '确定',
							cancelButtonText: '取消',
							type: 'warning'
						})
							.then(() => {
								this.handleBkgSave(type)
							})
							.catch(err => {})
					} else if (this.bookDetailForm.bkgStatus === 'pass') {
						// 未订舱状态保存
						this.$confirm('是否将订舱状态从未订舱保存为处理中?', '警告', {
							confirmButtonText: '确定',
							cancelButtonText: '取消',
							type: 'warning'
						})
							.then(() => {
								this.handleBkgSave(type)
							})
							.catch(err => {})
					} else {
						this.handleBkgSave(type)
					}
				}
			}
		},
		handleBkgSave(saveType) {
			let workAssign = []
			if (this.orderIsJoint === 'Y') {
				workAssign = this.getWorkAssign(this.jointOrderWorkOptions)
			}
			this.saveItems = {
				shipCarrierOrderNo: this.bookDetailForm.shipCarrierOrderNo,
				isJoint: this.orderIsJoint,
				workAssign: workAssign,
				bkgReqNo: this.bookDetailForm.bkgReqNo,
				shipRefNo: this.bookDetailForm.shipRefNo,
				bkgRemark: this.bookDetailForm.bkgRemark,
				bkgStatus: this.bookDetailForm.bkgStatus,
				bkgProcessingReason: this.bookDetailForm.bkgProcessingReason,
				bkgAgentSupplierId: this.bookDetailForm.ship.bkgAgentSupplierId,
				shipCarrierCode: this.bookDetailForm.ship.shipCarrierCode,
				isExternal: this.bookDetailForm.isExternal,
				etdTime: this.bookDetailForm.ship.etdTime,
				cyCutOff: this.bookDetailForm.ship.cyCutOff
			}
			if (this.bookDetailForm.bkgStatus === 'pass') {
				this.saveItems.bkgStatus = 'booking'
			}
			// 白名单客户
			if (this.isWhiteCust) {
				this.saveItems.isNodrop = this.bookDetailForm.isNodrop
			}
			// 进口整箱的bkg保存需要传etaTime，已放舱或非已放舱都要传
			if (this.bookDetailForm.businessType === 'ship_import_fcl') {
				this.saveItems.etaTime = this.bookDetailForm.ship.etaTime
			}
			// console.log(this.bookDetailForm);
			bkgProcess(this.saveItems).then(res => {
				this.$message({
					type: 'success',
					message: '保存成功'
					// duration: 1000,
					// onClose: () => {
					// 	this.handleGoBack()
					// }
				})
				// 只保存大船预计开船时间&大船截关时间这两个字段，不发邮件
				if (saveType === 'book_release') {
					return this.getBookInfo()
				}
				this.bkgStatusIsBookRelease(true)
				this.getBookInfo()
			})
		},
		againSendMail() {
			this.bkgStatusIsBookRelease()
		},
		bkgStatusIsBookRelease(firstJoin) {
			// 点击已放舱保存成功后 弹出邮件弹框
			if (this.bookDetailForm.bkgStatus === 'book_release') {
				this.mailOnlyparam = {
					soList: this.bkgSoList,
					opEmployeeId: this.userId,
					firstJoin,
					bkgRemark: this.bookDetailForm.bkgRemark
				}
				if (this.$route.query.jointNo) {
					this.bookReleaseJointMailPopShow = true
				} else {
					this.bookReleaseMailPopShow = true
				}
			}
		},
		bookReleaseMailPopClose(action) {
			if (this.$route.query.jointNo) {
				this.bookReleaseJointMailPopShow = false
			} else {
				this.bookReleaseMailPopShow = false
			}
			if (action === 'Confirm') {
				this.$nextTick(() => {
					this.$refs.soInfo && this.$refs.soInfo.getOrderBookInfo()
					this.$refs.soInfo && this.$refs.soInfo.getBookReleaseCheck()
				})
			}
		},
		// 返回 20220228返回改为关闭窗口
		handleGoBack() {
			window.close()
			// this.$router.go(-1)
			// this.$router.push({
			//   name: 'BookShip',
			// })
		},
		// 订舱审核撤回
		handleAuditCancel() {
			this.$confirm('是否将该订舱单撤回?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					this.spaceBookAuditCancel()
				})
				.catch(err => {})
		},
		spaceBookAuditCancel() {
			spaceBookAuditCancel({
				bkgReqNo: this.mainBkgReqNo
			}).then(res => {
				this.$message({
					type: 'success',
					message: '撤回成功',
					duration: 1000,
					onClose: () => {
						this.handleGoBack()
					}
				})
			})
		},
		// 拒绝
		handleRefuse() {
			this.refusePopShow = true
		},
		refusePopClose(action) {
			this.refusePopShow = false
			if (action === 'Confirm') {
				this.handleGoBack()
			}
		},
		// 撤回协同人员
		cancelJoint() {
			cancelJoint({ bkgReqNo: this.bookDetailForm.bkgReqNo }).then(res => {
				this.disabledAuditEmployeeId = false
				this.bookDetailForm.auditEmployeeId = ''
				this.getBookInfo()
			})
		},
		// 更新订舱代理下拉数组
		updateBkgAgentList() {
			this.bkgAgentList = [
				{
					label: this.bookDetailForm.bkgAgentSupplierName,
					value: this.bookDetailForm.bkgAgentSupplierId
				}
			]
		},
		// 变更参与人中的订舱人员
		updateBkg(bkgItem) {
			console.log('bkgItem', bkgItem)
			this.orderWorkOptions = this.orderWorkOptions.map(ele => {
				ele.isUpdateBkg = false
				if (bkgItem && ele.jobCode === 'bkg') {
					ele.isUpdateBkg = true
					ele.employeeId = bkgItem.employeeId
					ele.employeeName = bkgItem.employeeName
				}
				return { ...ele }
			})
		},
		handleViewCheckPoint() {
			this.checkPointPopShow = true
		},
		checkPointPopClose(action) {
			this.checkPointPopShow = false
		},
		// 商务回复业务甩柜不同意
		handleDropDeal() {
			this.dropDealResultPopShow = true
		},
		dropDealResultPopClose(action, value) {
			this.dropDealResultPopShow = false
			if (action === 'Confirm') {
				this.getBookInfo()
			}
		}
	}
}
</script>
<style lang="scss">
@import '../less/detail.scss';
// .book-alert{
// 	height: 24px;
// }
#shipBookDetail {
	.tab-cont {
		height: 24px;
		line-height: 24px;
		background-color: #ffffff;
		// box-shadow: 0px -1px 0px 0px #E9E9E9;
		border-radius: 2px 2px 0px 0px;
		margin-top: 8px;
		border-bottom: 1px solid #e9e9e9;
		margin-left: 10px;
		.item {
			float: left;
			display: inline-block;
			// width: 84px;
			color: #3e80f5;
			text-align: center;
			cursor: pointer;
			position: relative;
			padding: 0 30px;
			font-size: 14px;
			&::before {
				content: '';
				position: absolute;
				display: block;
				height: 16px;
				width: 1px;
				right: -1px;
				top: 5px;
				background-color: #3e80f5;
			}
			&.isActive {
				color: #fff;
				// font-weight: bold;
				background-color: #3e80f5;
				&::before {
					display: none;
				}
			}
		}
	}
	&.fullWrap {
		background-color: rgb(245, 247, 249);
		height: 100%;
		overflow: hidden;
		.tab-cont {
			margin-left: 0;
			margin-top: 0;
		}
		.alert-cont {
			margin-left: 0;
		}
	}
	.to-detail-btn {
		cursor: pointer;
		color: #3e80f5;
	}
	.el-table .cell.el-tooltip {
		padding-right: 0;
		overflow: hidden;
	}
	.drop-arrow {
		font-weight: 700;
		font-size: 16px;
		color: #edb534;
	}
	.drop-word {
		background-color: #edb534;
		color: #fff;
		width: 14px;
		height: 14px;
		border-radius: 2px;
		padding: 0 2px 2px;
		font-size: 12px;
	}
	.alert-cont {
		margin: 0 0 0 10px;
	}
	.book-cont.rel {
		position: relative;
	}
	.bookDetail-row {
		margin-top: 4px;
		&.bkg-detail-row {
			height: 36px;
			line-height: 36px;
		}
		&.service-name {
			border-bottom: 1px solid #e9e9e9;
		}
		.row-tit {
			// display: flex;
			// justify-content: space-between;
			background: #fff;
			border-radius: 2px;
			height: 36px;
			line-height: 36px;
			// align-items: center;
			padding: 0 8px;
			&.soInfo-tit {
				border-radius: 2px 2px 0px 0px;
				border-bottom: 1px solid #e9e9e9;
				height: 24px;
				line-height: 24px;
			}
			&.bt {
				border-bottom: 1px solid #f5f7f9;
			}
			.small-tit {
				max-width: 60%;
				float: left;
				display: flex;
			}
			.row-tit-operate {
				float: right;
				display: inline-block;
				width: 40%;
				text-align: right;
			}
		}
		.bookInfo-tit {
			background: #fff;
			border-radius: 2px;
			line-height: 20px;
			padding: 8px 8px 4px 8px;
			// overflow: hidden;
			display: flex;
    	justify-content: space-between;
			.small-tit-cont {
				flex: 1;
				// max-width: 60%;
				// float: left;
				.small-tit{
					display: flex;
					flex-wrap: wrap;
					margin-bottom: 4px;
				}
			}
			.row-tit-operate {
				// float: right;
				// display: inline-block;
				// width: 40%;
				text-align: right;
			}
		}
		.row-form {
			padding: 8px;
		}
		.small-tit .bkgNo {
			color: #222;
		}
		.small-tit .bkgStatus {
			display: inline-block;
			color: #4a4a4a;
			// max-width: 300px;
			margin-right: 30px;
			// margin-left: 20px;
			height: 20px;
			line-height: 20px;
			// margin-top: 8px;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
			&.cust {
				flex: 1;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			.item-label {
				width: 100%;
				display: inline-block;
				height: 20px;
				line-height: 20px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				&.cust-item{
					padding-right: 10px;
					display: flex;
				}
				&.bold {
					font-weight: bold;
				}
				.cust{
					display: block;
					position: relative;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}
			.mr5 {
				margin-right: 5px;
			}
			// .booking{
			// 	color: #674DC9;
			// }
			.book_refuse,
			.refuse {
				color: #cd4130;
			}
			.booking,
			.booked {
				color: #3e80f5;
			}
			.book_release,
			.complete {
				color: #33b18a;
			}
			.book_exp,
			.submit {
				color: #edb534;
			}
			i {
				display: inline-block;
				width: 14px;
				height: 14px;
				border-radius: 50%;
				line-height: 14px;
				background: url(../../../../assets/icon_bkgStatus.png) center center no-repeat;
				background-color: #4a4a4a;
				margin-right: 5px;
				vertical-align: sub;
				// &.booking{
				// 	background-color: #674DC9;
				// }
				&.book_refuse,
				&.refuse {
					background-color: #cd4130;
				}
				&.booked,
				&.booking {
					background-color: #3e80f5;
				}
				&.book_release,
				&.complete {
					background-color: #33b18a;
				}
				&.book_exp,
				&.submit {
					background-color: #edb534;
				}
			}
			.vip-icon {
				display: inline-block;
				vertical-align: middle;
				width: 16px;
				height: 16px;
				margin-left: 8px;
				@for $i from 1 through 5 {
					&.vip-icon-vip#{$i} {
						background: url('~@/views/crm/merchantManagement/customerList/images/icon-vip'+$i+'.png') 0 0 no-repeat;
						background-size: 100% 100%;
					}
				}
			}
			.vip-img {
				width: 20px;
				height: auto;
				vertical-align: middle;
				cursor: pointer;
				margin-left: 5px;
			}
		}
		.small-tit .icon {
			vertical-align: top;
			margin-right: 2px;
			width: 14px;
			margin-top: 3px;
		}
		.row-tit-operate {
			.btn-save,
			.btn-refuse,
			.btn-pass {
				display: inline-block;
				// vertical-align: middle;
			}
			.el-button + .el-button {
				margin-left: 4px;
			}
		}
		.el-form-item {
			margin-bottom: 4px;
		}
		.row-content {
			line-height: 36px;
			height: 36px;
			background-color: #fff;
			border-radius: 2px;
			align-items: center;
			padding: 0 8px;
			.el-form-item__label {
				vertical-align: top;
			}
			.el-form-item__label,
			.el-form-item__content {
				font-size: 12px;
				line-height: 36px;
				// vertical-align: top;
				.el-button--mini span {
					display: inline-block;
					line-height: 20px;
					height: 20px;
				}
			}
			.el-radio__label {
				font-size: 12px;
			}
		}
	}
	.service-name-cont {
		height: 25px;
		padding: 0 10px 5px 10px;
		line-height: 20px;
		width: 100%;
		background-color: #fff;
		.service-type {
			margin-right: 35px;
			display: inline-block;
		}
		.name {
			display: inline-block;
			cursor: pointer;
			max-width: 800px;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
			vertical-align: middle;
			margin-top: -2px;
		}
		@media screen and (min-width: 1580px) {
			.name {
				max-width: 1200px;
			}
		}
	}
	.soInfo-row {
		margin-top: 4px;
		background-color: #fff;
		.row-tit {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0 8px;
			border-radius: 2px 2px 0px 0px;
			border-bottom: 1px solid #e9e9e9;
			height: 24px;
			line-height: 24px;
			.btn-disabled-style {
				background-color: #8cc8ff;
				border-color: #8cc8ff;
			}
		}
		.row-form {
			padding: 8px;
			.el-col-4 {
				width: 20%;
				&.auditRemark {
					width: 60%;
				}
			}
		}
		.el-form-item {
			margin-bottom: 4px;
		}
		.bkgInfo-form {
			padding: 8px 0 4px;
			.el-form-item {
				display: flex;
			}
			.el-form-item__label,
			.el-form-item__content {
				display: block;
			}
			.el-form-item__label {
				// width: 80px;
			}
			.el-form-item__content {
				flex: 1;
			}
		}
		.el-form-item__label {
			padding-right: 4px;
			// width: 70px;
		}
		.el-form-item__label,
		.el-form-item__content {
			font-size: 12px;
			line-height: 20px;
			// height: 20px;
		}
		.is-required {
			label::before {
				// display: none;
				margin-right: 0;
			}
		}
		.so-tableinfo {
			.el-table__fixed-right::before,
			&.el-table::before {
				height: 0;
			}
			.el-table__empty-block {
				height: 20px !important;
				min-height: 20px !important;
				.el-table__empty-text {
					line-height: 20px !important;
				}
			}
			th {
				height: 24px;
				line-height: 16px;
				padding: 0;
				border-bottom: 0 !important;
			}
			td {
				padding: 2px 0;
			}
		}
		.el-collapse-item__content {
			padding-bottom: 10px;
			font-size: 12px;
		}
		.bookInfo-cont {
			display: table;
			width: 100%;
			margin: 0 auto;
			// padding: 10px;
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
						&.warning {
							.el-input__inner {
								border: 1px solid #e9851f;
								box-shadow: 0px 0px 0px 2px #fdf2e8;
							}
						}
						&.vessel-time {
							.el-form-item__content {
								display: flex;
							}
							.el-icon-circle-plus-outline,
							.el-icon-question {
								font-size: 14px;
								height: 20px;
								color: #999;
								margin-left: 0px;
								cursor: pointer;
							}
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
					&.portInfo {
						.el-form-item {
							.el-form-item__label {
								width: 80px;
							}
						}
					}
					&.cargoInfo {
						.el-form-item {
							.el-form-item__label {
								width: 90px;
							}
						}
					}
					.port-label-row {
						// display: flex;
						.portCode,
						.countryEname {
							margin-left: 2%;
						}
						.ename {
							width: 52%;
						}
						.portCode {
							width: 22%;
						}
						.countryEname {
							width: 22%;
						}
						.ename,
						.portCode,
						.countryEname {
							float: left;
							display: inline-block;
							color: #4a4a4a;
							font-size: 12px;
							background-color: #f5f7fa;
							border-radius: 4px;
							border: 1px solid #dfe4ed;
							height: 20px;
							line-height: 18px;
							box-sizing: border-box;
							outline: none;
							-webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
							transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
							padding: 0 7px;
							.label {
								max-width: 200px;
								white-space: nowrap;
								overflow: hidden;
								text-overflow: ellipsis;
							}
						}
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
							.port-ename {
								display: inline-block;
								width: 100%;
								padding: 0;
								.label {
									background-color: #f5f7fa;
									border: 1px solid #dfe4ed;
									border-radius: 4px;
									height: 20px;
									font-size: 12px;
									line-height: 20px;
									padding: 0 5px;
									overflow: hidden;
									white-space: nowrap;
									text-overflow: ellipsis;
								}
							}
						}
					}
				}
			}
		}
	}
	.hr {
		height: 1px;
		border: none;
		border-top: 1px solid #e9e9e9;
	}
	.edit-row .el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	.edit-row .el-form-item__content {
		margin-right: 10px;
	}
	// .el-collapse-item__content > div > div {
	// 	margin: 0;
	// }
	#auditEmployeeId {
		.el-select {
			width: calc(100% - 56px);
			input {
				border-top-right-radius: unset;
				border-bottom-right-radius: unset;
			}
		}
		button {
			border-left: unset;
			border-top-left-radius: unset;
			border-bottom-left-radius: unset;
		}
	}
	.el-collapse-item__header {
		height: 24px;
		line-height: 24px;
		padding: 0 0 0 8px;
		border-bottom: 0;
		font-weight: bold;
		font-size: 12px;
		&.is-active {
			border-bottom: 1px solid #e6ebf5;
		}
	}
	.pricing-book-work-cont {
		.el-collapse-item__header {
			height: 30px;
			line-height: 30px;
			border-bottom: 1px dashed #d9d9d9;
			padding: 0 10px;
		}
		.el-collapse-item__content {
			font-size: 12px;
		}
	}
	.row-cont {
		border: 1px solid #e9e9e9;
		border-radius: 4px;
		margin: 0 8px 5px;
		overflow: hidden;
		.row-cont-tit {
			background: rgba(248, 249, 253, 1);
			border-radius: 4px 4px 0px 0px;
			height: 24px;
			line-height: 24px;
			.tit {
				font-size: 12px;
				font-weight: bold;
				padding-left: 12px;
			}
			.row-cont-rt {
				font-size: 12px;
				float: right;
				padding-right: 12px;
				.expand {
					margin-left: 15px;
					cursor: pointer;
				}
			}
		}
		.occupyCargo-form .row-flex.flex-cargo {
			margin-top: 10px;
			overflow: hidden;
			.btn-minus-search,
			.btn-plus-search {
				float: right;
				margin-right: 5px;
				margin-top: 24px;
				margin-top: 2px;
			}

			.flex-item {
				float: left;
				width: 15.8%;
				display: flex;
				height: 20px;
				padding: 0 10px 0 10px;
				margin-bottom: 4px;
				&.is-required label::before {
					margin-right: 0;
				}
				.el-form-item__label,
				.item-label {
					font-size: 12px;
					width: 85px;
					padding-right: 4px;
					line-height: 20px;
					height: 20px;
					margin-bottom: 0;
					display: flex;
				}
				.item-label .lab {
					display: block;
					width: 100%;
					text-align: right;
				}
				.el-form-item__content,
				.item-content {
					flex: 1;
					line-height: 20px;
					height: 20px;
				}
				.el-input__icon {
					line-height: 20px;
					height: 20px;
				}
				&.cname {
					.el-form-item__label,
					.item-label {
						width: 60px;
					}
				}
				&.hscode {
					.el-form-item__label,
					.item-label {
						width: 70px;
					}
				}
			}
		}
	}
	.copyTips {
		position: absolute;
		z-index: 3333;
		border-radius: 4px;
		line-height: 20px;
		text-align: center;
		width: 36px;
		height: 20px;
		background: #ffffff;
		box-shadow: 0px 4px 10px 0px #d1d1d1;
		font-size: 12px;
		color: #1890ff;
		left: 0;
		top: 0;
		cursor: pointer;
		.caret {
			display: block;
			position: absolute;
			left: -3px;
			bottom: 6px;
			background-color: #fff;
			box-shadow: 1 10px 10px 10px 0 rgba(233, 233, 233, 1);
			// border-radius:4px;
			width: 8px;
			height: 8px;
			border-width: 5px 5px 0 0;
			border-color: transparent;
			border-style: solid;
			transform: matrix(0.71, -0.71, 0.71, 0.71, 0, 0); // rotate(-45deg)
		}
		// .el-icon-caret-left{

		// }
	}
}
.el-popover-table {
	max-height: 200px;
	overflow: auto;
}
</style>
