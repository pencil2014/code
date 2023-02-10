<template>
	<div class="si-detail si-detail-not-confirm">
		<div class="si-tit">提单信息</div>
		<el-form ref="siInfo" class="detail-form" :model="createItem" label-width="130px">
			<el-row>
				<el-col :span="6">
					<el-form-item :class="!orderDetailData.barge ? 'bl-no-label' : ''" label="提单号:" prop="blNo" :rules="[{ required: blInfoRequired, message: '请输入提单号', trigger: 'blur' }]">
						<el-input type="" size="mini" placeholder="请输入" v-model="createItem.blNo" clearable :disabled="disabledState || notDraftConfirm" maxlength="60"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="大船预计开船时间:" prop="etdTime" :rules="[{ required: blInfoRequired, message: '请选择大船预计开船时间', trigger: 'change' }]" class="vessel-time">
						<elDatePickerLimit
							:field="'etdTime'"
							size="mini"
							v-model="createItem.etdTime"
							type="date"
							style="width: 100%"
							:clearable="false"
							:editable="false"
							:disabled="disabledState || notDraftConfirm"
							placeholder="请选择"
							value-format="yyyy-MM-dd"
							@change="handleChangeEtdTime"
						/>
						<el-popover placement="top" width="280" trigger="click" class="vessel-time-popover" style="margin-left: 5px">
							<Schedule :vesselTime="vesselTime" :tdTimeDisabled="disabledState" :etaTimeDisabled="disabledState" @updateVesselTime="updateVesselTime" />
							<el-button slot="reference" type="default" size="mini" @click="handleSearchVesselTime">查询</el-button>
						</el-popover>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="大船实际开船时间:" prop="tdTime" :rules="[{ required: blInfoRequired, message: '请选择大船实际开船时间', trigger: 'change' }]" class="vessel-time">
						<elDatePickerLimit
							noCanFuture
							:field="'tdTime'"
							size="mini"
							v-model="createItem.tdTime"
							type="date"
							style="width: 100%"
							clearable
							:disabled="disabledState || notDraftConfirm"
							placeholder="请选择"
							value-format="yyyy-MM-dd"
							@change="handleChangeTdTime"
						/>
						<el-popover placement="top" width="280" trigger="click" class="vessel-time-popover" style="margin-left: 5px">
							<Schedule :vesselTime="vesselTime" :tdTimeDisabled="disabledState" :etaTimeDisabled="disabledState" @updateVesselTime="updateVesselTime" />
							<el-button :disabled="notDraftConfirm" slot="reference" type="default" size="mini" @click="handleSearchVesselTime">查询</el-button>
						</el-popover>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="预计到港时间:" prop="etaTime" :rules="[{ required: blInfoRequired, message: '请选择预计到港时间', trigger: 'change' }]">
						<elDatePickerLimit
							size="mini"
							:field="'etaTime'"
							v-model="createItem.etaTime"
							type="date"
							style="width: 100%"
							clearable
							:disabled="disabledState || notDraftConfirm"
							placeholder="请选择"
							value-format="yyyy-MM-dd"
							:picker-options="pickerOptions"
							@change="handleChangeEtaTime"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="6" v-if="orderDetailData.barge">
					<el-form-item label="驳船预计开船时间:" prop="bargeEtdTime" :rules="[{ required: blInfoRequired, message: '驳船预计开船时间', trigger: 'change' }]">
						<elDatePickerLimit
							:field="'bargeEtdTime'"
							size="mini"
							v-model="createItem.bargeEtdTime"
							type="date"
							style="width: 100%"
							:clearable="false"
							:editable="false"
							:disabled="disabledState || notDraftConfirm"
							placeholder="请选择"
							value-format="yyyy-MM-dd"
							@change="handleChangeBargeEtdTime"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="6" v-if="orderDetailData.barge">
					<el-form-item label="驳船实际开船时间:" prop="bargeTdTime" :rules="[{ required: blInfoRequired, message: '请选择驳船实际开船时间', trigger: 'change' }]">
						<elDatePickerLimit
							noCanFuture
							:field="'bargeTdTime'"
							size="mini"
							v-model="createItem.bargeTdTime"
							type="date"
							style="width: 100%"
							clearable
							:disabled="disabledState || notDraftConfirm"
							placeholder="请选择"
							value-format="yyyy-MM-dd"
							@change="handleChangeBargeTdTime"
						/>
					</el-form-item>
				</el-col>
				<el-col :class="!orderDetailData.barge ? 'bl-no-label' : ''" :span="6">
					<el-form-item label="大船船名:" prop="vessel">
						<vessel-select
							v-model="createItem.vessel"
							:orderNo="$route.query.orderNo"
							:disabledState="disabledState || notDraftConfirm"
							:shipCarrierCode="createItem.shipCarrierCode"
							:polPortCode="createItem.polPortCode"
							:podPortCode="createItem.podPortCode"
						/>
						<!-- <el-autocomplete
							style="width: 100%"
							size="mini"
							clearable
							v-model="createItem.vessel"
							:disabled="disabledState"
							:fetch-suggestions="(queryString, cb) => querySearchBookVessel(queryString, cb)"
							:trigger-on-focus="false"
							placeholder="请输入"
							@select="value => handleSelectBookVessel(value)"
							@clear="value => handleClearBookVessel(value)"
						></el-autocomplete> -->
					</el-form-item>
				</el-col>
				<el-col :class="!orderDetailData.barge ? 'bl-no-label' : ''" :span="6">
					<el-form-item label="大船航次:" prop="voyage">
						<voyage-select
							v-model="createItem.voyage"
							:disabledState="disabledState || notDraftConfirm"
							:orderNo="$route.query.orderNo"
							:vessel="createItem.vessel"
							:shipCarrierCode="createItem.shipCarrierCode"
							:polPortCode="createItem.polPortCode"
							:podPortCode="createItem.podPortCode"
						/>
						<!-- <el-autocomplete
							style="width: 100%"
							size="mini"
							clearable
							v-model="createItem.voyage"
							:disabled="disabledState"
							:fetch-suggestions="(queryString, cb) => querySearchBookVoyage(queryString, cb, createItem.vessel)"
							:trigger-on-focus="false"
							placeholder="请输入"
							@select="value => handleSelectBookVoyage(value)"
							@clear="value => handleClearBookVoyage(value)"
						></el-autocomplete> -->
					</el-form-item>
				</el-col>
				<el-col :span="6" v-if="orderDetailData.barge">
					<el-form-item label="驳船船名:" prop="bargeVessel">
						<el-autocomplete
							:disabled="disabledState || notDraftConfirm"
							style="width: 100%"
							size="mini"
							clearable
							v-model="createItem.bargeVessel"
							:fetch-suggestions="(queryString, cb) => querySearchVessel(queryString, cb)"
							placeholder="请输入"
							:maxlength="128"
							@select="value => handleSelectVessel(value)"
							@clear="value => handleClearVessel(value)"
						></el-autocomplete>
					</el-form-item>
				</el-col>
				<el-col :span="6" v-if="orderDetailData.barge">
					<el-form-item label="驳船航次:" prop="bargeVoyage">
						<el-autocomplete
							:disabled="disabledState || notDraftConfirm"
							style="width: 100%"
							size="mini"
							clearable
							v-model="createItem.bargeVoyage"
							:fetch-suggestions="(queryString, cb) => querySearchVoyage(queryString, cb)"
							placeholder="请输入"
							:maxlength="128"
							@select="value => handleSelectVoyage(value)"
							@clear="value => handleClearVoyage(value)"
						></el-autocomplete>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item :class="!orderDetailData.barge ? 'bl-no-label' : ''" id="bl-remark" label="备注:" prop="remark">
						<el-input :disabled="notDraftConfirm" type="" size="mini" placeholder="请输入" v-model="createItem.remark" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6" class="info-li">
					<span>截补料时间：</span>
					<el-tooltip v-if="showTip('siCutOff')" effect="dark" :content="detailData.blSiShowVo.siCutOff" placement="top-start">
						<span class="red">{{ detailData.siCutOff }}</span>
					</el-tooltip>
					<span v-else>{{ detailData.siCutOff }}</span>
				</el-col>
				<!-- <el-col :span="6" class="info-li">
					<span>工作号：</span>
					<el-tooltip v-if="showTip('orderNo')" effect="dark" :content="detailData.blSiShowVo.orderNo" placement="top-start">
						<span class="red">{{ detailData.orderNo }}</span>
					</el-tooltip>
					<span v-else>{{ detailData.orderNo }}</span>
				</el-col> -->
				<el-col :span="6" class="info-li">
					<span>SO：</span>
					<el-tooltip v-if="showTip('soInfo')" effect="dark" placement="top-start">
						<div slot="content">{{ detailData.blSiShowVo.soInfo | soFilter }}</div>
						<span @click="handleViewSo" :class="[notDraftConfirm ? 'notDraftConfirm' : '']" class="red underline">{{ detailData.soInfo | soFilter }}</span>
					</el-tooltip>
					<span :class="[notDraftConfirm ? 'notDraftConfirm' : '']" class="underline" @click="handleViewSo" v-else>{{ detailData.soInfo | soFilter }}</span>
				</el-col>
				<el-col :span="6" class="info-li">
					<span>船公司：</span>
					<el-tooltip v-if="showTip('shipCarrierCode')" effect="dark" :content="detailData.blSiShowVo.shipCarrierCode" placement="top-start">
						<span class="red">{{ detailData.shipCarrierCode }}</span>
					</el-tooltip>
					<span v-else>{{ detailData.shipCarrierCode }}</span>
					<el-button :disabled="notDraftConfirm" type="text" size="mini" style="margin-left: 5px" @click="getShippingCarrierUrl(detailData.shipCarrierCode)">船司官网</el-button>
				</el-col>
				<!-- <el-col :span="6" class="info-li">
					<span>预计开船时间：</span>
					<el-tooltip v-if="showTip('etdTime')" effect="dark" :content="detailData.blSiShowVo.etdTime" placement="top-start">
						<span class="red">{{ detailData.etdTime }}</span>
					</el-tooltip>
					<span v-else>{{ detailData.etdTime }}</span>
				</el-col> -->
				<el-col :span="6" class="info-li">
					<span>提单类型：</span>
					<el-tooltip v-if="showTip('blType')" effect="dark" :content="detailData.blSiShowVo.blType" placement="top-start">
						<div slot="content">{{ detailData.blType | blTypeFilter }}</div>
						<span class="red">{{ detailData.blType | blTypeFilter }}</span>
					</el-tooltip>
					<span v-else>{{ detailData.blType | blTypeFilter }}</span>
				</el-col>
				<el-col :span="6" class="info-li">
					<span>出单方式：</span>
					<el-tooltip v-if="showTip('blMode')" effect="dark" placement="top-start">
						<div slot="content">{{ detailData.blSiShowVo.blMode | blModeFilter }}</div>
						<span class="red">{{ detailData.blMode | blModeFilter }}</span>
					</el-tooltip>
					<span v-else>{{ detailData.blMode | blModeFilter }}</span>
				</el-col>
				<!-- <el-col :span="6" class="info-li">
					<span>委托单位：</span>
					<el-tooltip v-if="showTip('custName')" effect="dark" :content="detailData.blSiShowVo.custName" placement="top-start">
						<span class="red">{{ detailData.custName }}</span>
					</el-tooltip>
					<span v-else>{{ detailData.custName }}</span>
				</el-col> -->
				<el-col :span="6" class="info-li">
					<span>订舱代理：</span>
					<el-tooltip v-if="showTip('bkgAgentSupplierName')" effect="dark" :content="detailData.blSiShowVo.bkgAgentSupplierName" placement="top-start">
						<span class="red">{{ detailData.bkgAgentSupplierName }}</span>
					</el-tooltip>
					<span v-else>{{ detailData.bkgAgentSupplierName }}</span>
				</el-col>
				<!-- <el-col :span="6" class="info-li">
					<span>船名：</span>
					<el-tooltip v-if="showTip('vessel')" effect="dark" :content="detailData.blSiShowVo.vessel" placement="top-start">
						<span class="red">{{ detailData.vessel }}</span>
					</el-tooltip>
					<span v-else>{{ detailData.vessel }}</span>
				</el-col>
				<el-col :span="6" class="info-li">
					<span>航次：</span>
					<el-tooltip v-if="showTip('voyage')" effect="dark" :content="detailData.blSiShowVo.voyage" placement="top-start">
						<span class="red">{{ detailData.voyage }}</span>
					</el-tooltip>
					<span v-else>{{ detailData.voyage }}</span>
				</el-col> -->

				<el-col :span="6" class="info-li">
					<span>MBL草单：</span>
					<span @click="handleViewMbl" :class="['mbl-download', notDraftConfirm ? 'notDraftConfirm' : '']"> 预览</span>
					<span @click="handleDownloadMbl" :class="['mbl-download', notDraftConfirm ? 'notDraftConfirm' : '']"> 下载</span>
				</el-col>

				<el-col :span="6" class="info-li">
					<span>免用免堆：</span>
					<el-tooltip v-if="showTip('freetimeSys')" effect="dark" :content="detailData.blSiShowVo.freetimeSys" placement="top-start">
						<span class="red">{{ detailData.freetimeSys }}</span>
					</el-tooltip>
					<span v-else>{{ detailData.freetimeSys }}</span>
				</el-col>
				<el-col :span="6" class="info-li">
					<span>系统航线：</span>
					<span>{{ detailData.sysLineName }}</span>
				</el-col>
				<el-col :span="6" class="info-li">
					<span>是否线上：</span>
					<span>{{ detailData.isOnline === 'Y' ? '是' : detailData.isOnline === 'N' ? '否' : '' }}</span>
				</el-col>
				<el-col :span="6" class="info-li">
					<span>付款分公司：</span>
					<span>{{ detailData.payCompanyName }}</span>
				</el-col>
				<el-col :span="6" class="info-li">
					<span>补料是否以附件为准: </span>
					<span>{{ detailData.isBasedFile === 'Y' ? '是' : '否' }}</span>
				</el-col>
				<el-col :span="24" class="info-li info-li-flex">
					<span class="siFile-name">委托备注：</span>
					<div class="siRemark-cont">
						{{ detailData.intrustRemark }}
					</div>
				</el-col>
				<el-col :span="24" class="info-li info-li-flex">
					<span class="si-audit-name">商务审单备注：</span>
					<div class="siRemark-cont">
						{{ detailData.auditRemark }}
					</div>
				</el-col>
				<el-col v-for="(item, index) in siFileList" :key="index" :span="24" class="info-li info-li-flex">
					<span class="siFile-name">补料附件：</span>
					<span class="siFile-download-flex">
						<div class="siFile-flex">
							<el-button :disabled="notDraftConfirm" type="text" class="btn-name" @click="handleViewSiFile(index)" v-if="detailData.siFileName">{{ item }}</el-button>
							<el-button :disabled="notDraftConfirm" type="text" class="btn-download" @click="handleDownloadSiFile(index)" v-if="detailData.siFileName">下载</el-button>
						</div>
					</span>
				</el-col>
				<el-col :span="24" class="info-li info-li-flex">
					<span class="siFile-name">补料要求：</span>
					<div v-html="detailData.siRemark" class="siRemark-cont"></div>
				</el-col>
				<el-col :span="24" class="info-li info-li-flex">
					<span class="si-blmode-name">出单方式备注：</span>
					<div v-html="detailData.chargeBlModeDesc" class="siRemark-cont"></div>
				</el-col>
				<el-col :span="24" class="info-li info-li-flex">
					<span class="si-attach-name">附加费说明：</span>
					<div v-html="detailData.chargeAttachFeeDesc" class="siRemark-cont"></div>
				</el-col>
			</el-row>

			<div class="si-tit-b si-fee-bill">
				船东费用单
				<div>
					<el-button :disabled="notDraftConfirm" size="mini" type="default" @click="handleImportBill" class="ml10"> 导入账单 </el-button>
					<el-button :disabled="notDraftConfirm" v-if="detailData.dnGet === 'y'" size="mini" type="default" @click="handleAudit" class="ml10"> 推送商务审核 </el-button>
				</div>
			</div>
			<div class="bill-table">
				<el-table
					ref="billTable"
					class="table-cont"
					@row-click="
						row => {
							this.handleRowClick(row)
						}
					"
					@selection-change="handleSelectionChange"
					fit
					highlight-current-row
					style="width: 100%"
					:data="billInfo"
					@cell-mouse-enter="showTooltip"
					@cell-mouse-leave="hiddenTooltip"
				>
					<el-table-column :selectable="selectable" type="selection" width="50"> </el-table-column>
					<el-table-column prop="billType" label="账单类型" width="70">
						<template slot-scope="scope">
							{{ getBillType(scope.row.billType) }}
						</template>
					</el-table-column>
					<el-table-column prop="billDate" width="100" label="收到账单时间"> </el-table-column>
					<el-table-column prop="billDateCheckLast" width="100" label="最晚确认时间"> </el-table-column>
					<el-table-column prop="inputNoType" label="单号类型" width="80">
						<template slot-scope="scope">
							{{ getInputType(scope.row.inputNoType) }}
						</template>
					</el-table-column>
					<el-table-column prop="inputNo" width="120" label="单号"> </el-table-column>
					<el-table-column width="130" label="船公司费用审核状态">
						<template slot-scope="scope">
							{{ scope.row.dnCheckStatus | blDnCheckStatusFilter }}
						</template>
					</el-table-column>
					<el-table-column prop="bkgAgentSupplierName" label="订舱代理" width="150"> </el-table-column>
					<el-table-column prop="porPortName" label="驳船收货地" width="150"> </el-table-column>
					<el-table-column prop="polPortName" label="大船起运港" width="150"> </el-table-column>
					<el-table-column prop="podPortName" label="目的港" width="120"> </el-table-column>
					<el-table-column prop="dnCheckEmployeeName" label="拿价人" width="100"> </el-table-column>
					<el-table-column prop="fileName" width="200" label="附件">
						<template slot-scope="scope">
							<div class="si-file-wrap" v-for="(item, index) in fileNameList(scope.row.fileName)" :key="index">
								<span :title="item" size="mini" @click="handleViewFile(scope.row, index)">{{ item }}</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="dnCheckApplyRemark" label="单证备注" width="150"></el-table-column>
					<el-table-column prop="dnRefuseRemark" label="审单备注" width="150"></el-table-column>
					<el-table-column prop="pricingRemark" label="商务备注" width="150"></el-table-column>
					<el-table-column label="附件类型">
						<template slot-scope="scope">
							{{ getDnBillType(scope.row.dnBillType) }}
						</template>
					</el-table-column>
					<el-table-column width="150" fixed="right" label="操作" align="center">
						<template slot-scope="scope">
							<div class="si-ship-fee-btns">
								<span :class="[notDraftConfirm ? 'notDraftConfirm' : '']" class="text" @click="handleUpdate(scope.row)" v-if="['pass', 'refuse'].includes(scope.row.dnCheckStatus)">更新</span>
								<span :class="[notDraftConfirm ? 'notDraftConfirm' : '']" v-if="['submit'].includes(scope.row.dnCheckStatus)" class="text" @click="handleCancelAudit(scope.row)">撤回</span>
								<span :class="[notDraftConfirm ? 'notDraftConfirm' : '']" class="text" @click="handleDownload(scope.row)" v-if="scope.row.fileName">下载</span>
								<span :class="[notDraftConfirm ? 'notDraftConfirm' : '']" class="del" @click="handleDelete(scope.row)" v-if="['draft'].includes(scope.row.dnCheckStatus)">删除</span>
							</div>
						</template>
					</el-table-column>
				</el-table>
				<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
			</div>
			<!-- 附件列表 -->
			<File :notDraftConfirm="notDraftConfirm" ref="fileList" @getBillList="getBillList" :billInfo="billInfo" :createItem="createItem" :detailData="detailData"> </File>
			<div class="">
				<div :title="`点击${showContainer ? '隐藏' : '展示'}集装箱信息`" @click="toggleContainer" class="si-tit-b mb10 container-title">集装箱信息<i v-if="showContainer" class="el-icon-arrow-up"></i> <i v-else class="el-icon-arrow-down"></i></div>
				<el-table v-if="showContainer" ref="cnTable" fit highlight-current-row style="width: 100%" :data="detailData.containerList">
					<el-table-column prop="containerType" label="箱型" align="center"></el-table-column>
					<el-table-column prop="so" label="SO" align="center"></el-table-column>
					<el-table-column prop="cn" label="箱号" align="center"></el-table-column>
					<el-table-column prop="quantity" label="件数" align="center"></el-table-column>
					<el-table-column prop="weight" label="毛重" align="center"></el-table-column>
					<el-table-column prop="volume" label="体积" align="center"></el-table-column>
					<el-table-column prop="packageType" label="包装" align="center">
						<template slot-scope="scope">
							{{ scope.row.packageType | packageTypeFilter }}
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="" v-if="detailData.isCancel === 'y'">
				<div class="si-tit-b">提单撤回</div>
				<el-row>
					<el-col :span="6" class="info-li">
						<span>撤回原因：</span>
						<span>{{ detailData.cancelReason | cancelReasonFilter }}</span>
					</el-col>
					<el-col :span="6" class="info-li">
						<span>撤回人：</span>
						<span>{{ detailData.cancelEmployeeName }}</span>
					</el-col>
					<el-col :span="6" class="info-li">
						<span>撤回时间：</span>
						<span>{{ detailData.cancelTime }}</span>
					</el-col>
					<el-col :span="24" class="info-li">
						<span>撤回备注：</span>
						<span>{{ detailData.cancelRemark }}</span>
					</el-col>
				</el-row>
			</div>
			<div class="" v-if="detailData.dnCheckStatus === 'refuse'">
				<div class="si-tit-b">签单拒绝</div>
				<el-row>
					<el-col :span="6" class="info-li">
						<span>拒绝原因：</span>
						<span>{{ detailData.dnRefuseReason | dnRefuseReasonFilter }}</span>
					</el-col>
					<el-col :span="6" class="info-li">
						<span>拒绝人：</span>
						<span>{{ detailData.dnCheckEmployeeName }}</span>
					</el-col>
					<el-col :span="6" class="info-li">
						<span>拒绝时间：</span>
						<span>{{ detailData.dnCheckTime }}</span>
					</el-col>
					<el-col :span="24" class="info-li">
						<span>拒绝备注：</span>
						<span>{{ detailData.dnRefuseRemark }}</span>
					</el-col>
				</el-row>
			</div>
		</el-form>
		<div v-if="soPopShow">
			<SoPop :soListQuery="soListQuery" @close="soPopClose" />
		</div>
		<!-- 输出MBL确认件弹窗 -->
		<div v-if="exportPopShow">
			<ExportPop @close="exportPopClose" />
		</div>
		<!-- 导入账单弹窗 -->
		<ImportBill v-if="dialogOrderShow" :blNo="detailData.blNo" @close="closeImportBill" :dialogOrderShow="dialogOrderShow" />
		<!-- 更新账单弹窗 -->
		<UpdateBill v-if="updateBillShow" :inputNoType="inputNoType" :billNo="billNo" :blNo="detailData.blNo" @close="closeUpdateBill" :dialogOrderShow="updateBillShow" />
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import SoPop from './soPop'
import { blBillList, blBillDelete, blBillPricingCheck, blBillCancelBill } from '@/api/order/bl'
import File from './file'
import ExportPop from './exportPop'
import Schedule from '@/views/order/order/orderList/components/schedule'
import ImportBill from './importBill'
import UpdateBill from './updateBill'
import VesselSelect from '@/views/order/order/components/vesselSelect'
import VoyageSelect from '@/views/order/order/components/voyageSelect'
import tableTooltip from '@/components/Base/Table/table-tooltip'
export default {
	filters: {
		soFilter(so) {
			if (so && so.length > 20) {
				return so.slice(0, 20) + '......'
			}
			return so
		},
		packageTypeFilter(packageType) {
			return getDictLabel('packageType', packageType)
		},
		blModeFilter(blMode) {
			return getDictLabel('blMode', blMode)
		},
		blTypeFilter(blType) {
			return getDictLabel('blType', blType)
		},
		cancelReasonFilter(cancelReason) {
			return getDictLabel('blCancelEditReason', cancelReason)
		},
		dnRefuseReasonFilter(dnRefuseReason) {
			return getDictLabel('dnRefuseReason', dnRefuseReason)
		},
		blDnCheckStatusFilter(val) {
			return getDictLabel('blDnCheckStatus', val)
		}
	},
	data() {
		return {
			billNo: '',
			multipleSelection: [],
			updateBillShow: false,
			dialogOrderShow: false,
			exportPopShow: false,
			billInfo: [
				{
					dnCheckApplyRemark: '',
					shipCarrierCode: '',
					dnCheckEmployeeName: '',
					billType: '',
					billDate: '',
					billDateCheckLast: '',
					inputNoType: '',
					blId: '',
					orderNo: '',
					bkgAgentSupplierName: '',
					vessel: '',
					voyage: '',
					porPortName: '',
					polPortName: '',
					podPortName: '',
					fileName: '',
					fileNo: '',
					dnBillType: ''
				}
			],
			showContainer: false,
			pickerOptions: {
				disabledDate(date) {
					//disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
					// return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
				}
			},
			blInfoRequired: false, // 补料提单信息必填状态
			soPopShow: false, // so弹窗
			soListQuery: {},
			vesselTime: {},
			vesselTimeParam: {},
			inputNoType: '',
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			}
		}
	},
	props: {
		notDraftConfirm: {
			type: Boolean,
			default: false
		},
		createItem: {
			type: Object,
			default: () => ({})
		},
		detailData: {
			type: Object,
			default: () => ({})
		},
		orderDetailData: {
			type: Object,
			default: () => ({})
		},
		isCopySiCheck: {
			type: String,
			default: ''
		}
	},
	created() {
		this.getBillList()
	},
	mounted() {},

	activated() {
		this.getBillList()
	},
	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap
		}),
		showCancel() {
			return this.detailData.orderStatus === 'cancel' || this.detailData.orderStatus === 'break'
		},
		showDelete() {
			return this.detailData.state === 'invalid'
		},
		showBack() {
			return this.detailData.isCancel === 'y'
		},
		disabledState() {
			return (this.detailData.siCheck === 'y' && this.detailData.obdCheck === 'y') || this.showCancel || this.showDelete || this.showBack //有信息提示禁用表单
		},
		siFileList() {
			if (this.detailData.siFileName) {
				return this.detailData.siFileName.split('&&')
			} else {
				return ['']
			}
		}
	},
	watch: {},
	components: {
		SoPop,
		File,
		ExportPop,
		Schedule,
		ImportBill,
		UpdateBill,
		VesselSelect,
		VoyageSelect
	},
	methods: {
		handleRowClick(row) {
			console.log('🚀 ~ row', row)
			// 禁用状态 不可点击
			if (!['draft', 'refuse'].includes(row.dnCheckStatus)) return
			this.$refs.billTable.toggleRowSelection(row)
		},
		// 鼠标移入cell
		showTooltip(row, column, cell) {
			this.tableCellMouse.cellDom = cell
			this.tableCellMouse.row = row
			this.tableCellMouse.hidden = false
		},
		// 鼠标移出cell
		hiddenTooltip() {
			this.tableCellMouse.hidden = true
		},
		// 船期查询结果直接填入订单详情
		updateVesselTime(val, key) {
			this.createItem[key] = val
		},
		// 船公司官网
		getShippingCarrierUrl(carrierCode) {
			if (!carrierCode) return
			this.$store.dispatch('order/getShippingCarrierWebUrl', { carrierCode })
		},
		selectable(row) {
			return ['draft', 'refuse'].includes(row.dnCheckStatus)
		},
		handleSelectionChange(val) {
			this.multipleSelection = val
			console.log('🚀 ~ this.multipleSelection', this.multipleSelection)
		},
		// 撤回商务审核
		async handleCancelAudit(row) {
			let res = await blBillCancelBill(row.billNo)
			if (res.msg === 'success') {
				this.$message.success('撤回成功!')
				this.getBillList()
			}
		},
		// 商务审核
		async handleAudit() {
			if (this.multipleSelection.length === 0) return this.$message.warning('请选择要审核的账单!')
			let data = this.multipleSelection.map(item => item.billNo)
			let res = await blBillPricingCheck(data)
			if (res.msg === 'success') {
				this.$message.success('推送成功!')
				this.getBillList()
			}
		},
		handleUpdate(row) {
			this.inputNoType = row.inputNoType
			this.billNo = row.billNo
			this.updateBillShow = true
		},
		// 关闭导入账单弹框
		closeImportBill() {
			this.dialogOrderShow = false
		},
		// 关闭更新账单弹框
		closeUpdateBill() {
			this.updateBillShow = false
		},
		// 打开导入账单弹框
		handleImportBill() {
			if (this.detailData.state === 'invalid') {
				return this.$message.warning('已删除的提单不允许导入账单!')
			}
			this.dialogOrderShow = true
		},
		fileNameList(fileName) {
			if (fileName) {
				return fileName.split(',')
			} else {
				return []
			}
		},
		handleViewFile(row, index) {
			let fileNo = row.fileNo.split(',')[index]
			let fileName = row.fileName.split(',')[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
		// 删除
		handleDelete(row, index) {
			this.$confirm('是否删除该数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let param = {
						billNo: row.billNo
					}
					return blBillDelete(param)
				})
				.then(response => {
					this.$message({
						message: '删除成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							this.getBillList()
							//请求附件列表数据
							this.$refs.fileList.getFileList()
						}
					})
				})
				.catch(() => {})
		},

		// 输出
		handleExport(value) {
			let data = {
				orderNo: this.$route.query.orderNo,
				blId: this.$route.query.blId,
				fileType: 'MBL_DRAFT',
				docType: value.docType
			}

			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/shipping/bl/file/export',
					data
				})
				.then(res => {
					console.log(res)
					this.exportPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					console.log(link.href)
					link.download = this.$route.query.orderNo + '.' + value.docType.toLowerCase()
					link.click()
				})
		},
		exportPopClose(action, value) {
			console.log('🚀 ~ action, value', action, value)
			if (action === 'Confirm') {
				this.handleExport(value)
			} else {
				this.exportPopShow = false
			}
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
					shipCarrierCode: this.orderDetailData.ship.shipCarrierCode,
					polPortCode: this.orderDetailData.ship.polPortCode,
					podPortCode: this.orderDetailData.ship.podPortCode,
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
					shipCarrierCode: this.orderDetailData.ship.shipCarrierCode,
					polPortCode: this.orderDetailData.ship.polPortCode,
					podPortCode: this.orderDetailData.ship.podPortCode,
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
			let { shipCarrierCode, polPortCode, podPortCode, vessel, voyage } = this.orderDetailData.ship
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

		showTip(prop) {
			return this.detailData.blSiShowVo && this.detailData.blSiShowVo[prop] && this.detailData.blSiShowVo[prop] != this.detailData[prop]
		},
		getInputType(val) {
			let billInputNoTypeList = this.dictMap.billInputNoType
			let billInputNoTypeObj = billInputNoTypeList.find(item => item.value === val)
			if (billInputNoTypeObj) return billInputNoTypeObj.label
		},
		getDnBillType(val) {
			let blFileTypeList = this.dictMap.blFileType
			let blFileTypeObj = blFileTypeList.find(item => item.value === val.toLowerCase())
			if (blFileTypeObj) return blFileTypeObj.label
		},
		getBillType(val) {
			let blTypeList = this.dictMap.shBillType
			let blTypeObj = blTypeList.find(item => item.value === val.toLowerCase())
			if (blTypeObj) return blTypeObj.label
		},
		getBillList() {
			let data = {
				orderNo: this.$route.query.orderNo,
				blId: this.$route.query.blId
			}
			blBillList(data).then(res => {
				this.billInfo = res.data
			})
		},
		updateDetail(obj) {
			this.createItem.vessel = obj.vessel
			this.createItem.voyage = obj.voyage
			this.createItem.bargeVessel = obj.bargeVessel
			this.createItem.bargeVoyage = obj.bargeVoyage
		},
		toggleContainer() {
			this.showContainer = !this.showContainer
		},
		handleChangeEtdTime(val) {
			if (!val) this.createItem.etdTime = ''
		},
		// 选择时间
		handleChangeTdTime(val) {
			if (!val) this.createItem.tdTime = ''
		},
		// 选择时间
		handleChangeEtaTime(val) {
			if (!val) this.createItem.etaTime = ''
		},
		handleChangeBargeEtdTime(val) {
			if (!val) this.createItem.bargeEtdTime = ''
		},
		// 选择时间
		handleChangeBargeTdTime(val) {
			if (!val) this.createItem.bargeTdTime = ''
		},
		// 查看so弹窗
		handleViewSo() {
			this.soListQuery = {
				blId: this.$route.query.blId,
				orderNo: this.$route.query.orderNo
			}
			this.soPopShow = true
			console.log('查看so', this.soListQuery)
		},
		// 下载

		handleDownload(row) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/zipDownload',
					params: {
						fileNos: row.fileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = '附件.zip'
					link.click()
				})
		},
		// mbl预览
		handleViewMbl() {
			let data = {
				orderNo: this.$route.query.orderNo,
				blId: this.$route.query.blId,
				fileType: 'mbl_draft',
				docType: 'pdf'
			}
			if (!this.orderDetailData.barge) data.hblTypeDisabled = true
			let routeUrl = this.$router.resolve({
				name: 'MblPreview',
				query: data
			})
			window.open(routeUrl.href, '_blank')
		},
		// mbl下载
		handleDownloadMbl() {
			if (this.detailData.state === 'invalid') {
				return this.$message.warning('已删除的提单不允许下载!')
			}
			this.exportPopShow = true
		},
		// so弹窗关闭回调
		soPopClose(action, value) {
			this.soPopShow = false
		},
		// 补料附件下载
		handleDownloadSiFile(index) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: this.detailData.siFileNo.split('&&')[index]
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = this.detailData.siFileName.split('&&')[index]
					link.click()
				})
		},
		handleViewSiFile(index) {
			let fileNo = this.detailData.siFileNo.split('&&')[index]
			let fileName = this.detailData.siFileName.split('&&')[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		}
	}
}
</script>
<style lang="scss" scoped>
.si-detail-not-confirm .notDraftConfirm {
	cursor: not-allowed !important;
	pointer-events: none;
	color: #c0c4cc !important;
}
.si-ship-fee-btns {
	display: flex;
	justify-content: center;
	span {
		margin-right: 6px;
		cursor: pointer;
	}
	.text {
		color: #1890ff;
	}
	.del {
		color: #f00;
	}
}
.si-fee-bill {
	display: flex;
	justify-content: space-between;
}
.si-file-wrap {
	width: 100%;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	span {
		cursor: pointer;
		color: #1890ff;
	}
}
.mbl-download {
	/* text-decoration: underline; */
	cursor: pointer;
	color: #1890ff;
}
.siFile-download-flex {
	color: #1890ff;
	flex: 1;
	display: block;
	white-space: nowrap;
	overflow: hidden;
	.siFile-flex {
		display: flex;
	}
	.btn-name {
		display: block;
		/* flex: 1; */
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		padding: 0;
		height: 20px;
		font-size: 12px;
		text-align: left;
	}
	.btn-download {
		display: block;
		padding: 0;
		height: 20px;
		font-size: 12px;
		margin-right: 10px;
		/* text-decoration: underline; */
	}
}
.bl-no-label {
	/deep/ label {
		width: 70px !important;
	}
	/deep/ .el-form-item__content {
		margin-left: 70px !important;
	}
}
#bl-remark {
	/deep/ label {
		width: 70px !important;
	}
	/deep/ .el-form-item__content {
		margin-left: 70px !important;
	}
}
.bill-table {
	margin-top: 10px;
	.table-cont {
		/deep/ th {
			height: 24px;
			line-height: 16px;
			padding: 5px 0;
		}
		/deep/ td {
			line-height: 16px;
			padding: 5px 0;
		}
		/deep/ .cell {
			display: block;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
	}
}
.bill-attachment {
	color: #1890ff;
	cursor: pointer;
}
.container-title {
	cursor: pointer;
	/deep/ .el-icon-arrow-up,
	/deep/ .el-icon-arrow-down {
		margin-left: 10px;
	}
}
.si-detail {
	padding: 0;
	overflow-y: auto;
	.si-tit {
		font-size: 14px;
		line-height: 32px;
		height: 32px;
		border-bottom: 1px solid #e0e0e0;
		padding-left: 10px;
		font-weight: bold;
	}
	.detail-form {
		padding: 10px;
		.si-tit-b {
			margin-top: 20px;
			font-weight: bold;
			font-size: 14px;
			&.mb10 {
				margin-bottom: 10px;
			}
		}
		.underline {
			text-decoration: underline;
			color: #1890ff;
			cursor: pointer;
		}
		/deep/ .el-form-item {
			margin-bottom: 4px;
			&.vessel-time {
				.el-form-item__content {
					display: flex;
				}
			}
		}
		/deep/ .el-input__prefix {
			left: 0;
			line-height: 20px;
			color: #c0c4cc;
		}
		/deep/ .el-input__suffix {
			right: 0;
			line-height: 20px;
		}
		/deep/ .el-date-editor.el-input.el-input--prefix .el-input__inner {
			padding-left: 20px;
			padding-right: 20px;
		}
		.info-li {
			line-height: 20px;
			margin-top: 8px;
			word-break: break-all;
			&.info-li-flex {
				display: flex;
				flex-wrap: nowrap;
				.siFile-name {
					display: block;
					width: 60px;
				}
				.si-audit-name {
					display: block;
					width: 90px;
				}
				.si-blmode-name {
					display: block;
					width: 85px;
				}
				.si-attach-name {
					display: block;
					width: 72px;
				}
				.siRemark-cont {
					line-height: 1.5;
					padding: 0;
					flex: 1;
					max-height: 200px;
					overflow-y: auto;
					/deep/ table {
						border-top: 1px solid #dfe6ec;
						border-left: 1px solid #dfe6ec;
						/deep/ td {
							border-right: 1px solid #dfe6ec;
							border-bottom: 1px solid #dfe6ec;
							padding: 5px 10px;
						}
					}
				}
			}
		}
	}
}
</style>
