<template>
	<div class="edit-container post-container">
		<!-- 详情 -->
		<div class="component-cont">
			<div class="mb10 between h32 border-bt">
				<div class="ft14">{{ $route.query.expressId ? '寄单管理详情' : '新建寄单管理' }}</div>
				<div>
					<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
					<el-button size="mini" type="primary" :loading="saveLoading" class="ml10" @click="handleSave">保存</el-button>
				</div>
			</div>
			<div class="row-flex">
				<el-form ref="postSave" class="post-form" :model="createItem" :rules="rules">
					<!-- <el-form-item label="业务类型" prop="businessType" class="flex-item" :show-message="false">
						<el-select size="mini" placeholder="请选择" v-model="createItem.businessType" :disabled="disabledState" style="width: 100%">
							<el-option v-for="(item, index) in dictMap.businessType" :key="'businessType' + index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item> -->
					<el-form-item label="收寄类型" prop="receisendType" class="flex-item" :show-message="false">
						<el-select size="mini" placeholder="请选择" v-model="createItem.receisendType" :disabled="disabledState || !!$route.query.info || !!$route.query.airOrderInfo" style="width: 100%" @change="handleChangeReceisendType">
							<el-option v-for="(item, index) in dictMap.receisendType" :key="'receisendType' + index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>

					<el-form-item label="寄单方式" prop="postType" class="flex-item" :show-message="false">
						<el-select size="mini" placeholder="请选择" v-model="createItem.postType" :disabled="disabledState" style="width: 100%" @change="handleChangePostType">
							<el-option v-for="(item, index) in dictMap.postType" :key="'postType' + index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>

					<el-form-item label="快递类型" prop="expressType" class="flex-item" :show-message="false">
						<el-select size="mini" placeholder="请选择" v-model="createItem.expressType" :disabled="disabledState" style="width: 100%" @change="changeExpressType">
							<el-option v-for="(item, index) in dictMap.expressType" :key="'expressType' + index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="快递公司" prop="expressSupplierId" class="flex-item" :required="expressSupplierRequired" :show-message="false">
						<el-select
							size="mini"
							remote
							clearable
							placeholder="请选择"
							v-model="createItem.expressSupplierId"
							filterable
							:disabled="disabledState"
							style="width: 100%"
							@visible-change="visibleChange"
							:remote-method="filterMehod"
							@change="handleChangeSupplier"
						>
							<el-option v-for="(item, index) in supplierOptions" :key="'supplier' + index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="快递单号" prop="expressNo" class="flex-item" :required="expressNoRequired" :show-message="false">
						<el-input maxlength="32" @blur="expressNoBlur(createItem.expressNo)" size="mini" placeholder="请输入" v-model="createItem.expressNo" clearable :disabled="disabledState || createItem.expressType === 'labour_delivery'"></el-input>
					</el-form-item>

					<el-form-item label="收件方公司" prop="receiveCompanyCode" class="flex-item">
						<el-select
							size="mini"
							remote
							clearable
							placeholder="请选择"
							v-model="createItem.receiveCompanyCode"
							filterable
							:disabled="disabledState"
							style="width: 100%"
							@visible-change="receiveVisibleChange"
							:remote-method="receiveFilterMehod"
							@change="handleSelectReceiver"
						>
							<el-option v-for="(item, index) in receiveCompanyOptions" :key="'receiveCompany' + index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item v-if="createItem.expressType === 'foreign' && createItem.receisendType === 'send'" label="收件方省市区" prop="revAreas" class="flex-item">
						<el-cascader style="width:100%" size="mini" :emitPath="true" v-model="revAreas" :options="revForeignData" :props="cityProps" clearable filterable :disabled="disabledState" @change="handleRevChange"></el-cascader>
					</el-form-item>
					<el-form-item v-else label="收件方省市区" prop="revAreas" class="flex-item">
						<el-cascader style="width:100%" size="mini" :emitPath="true" v-model="revAreas" :options="revDomesticData" :props="cityProps" clearable filterable :disabled="disabledState" @change="handleRevChange"></el-cascader>
					</el-form-item>
					<el-form-item label="收件方地址" prop="receiveAddress" class="flex-item">
						<el-input maxlength="512" size="mini" placeholder="请输入" v-model="createItem.receiveAddress" clearable :disabled="disabledState"></el-input>
					</el-form-item>
					<el-form-item v-if="createItem.receisendType === 'receive' || receiveCompanyIsBranch" label="收件人" prop="recipientEmployeeId" class="flex-item">
						<!-- 收寄类型-收件 或者 收件方公司是分公司 -->
						<el-select
							size="mini"
							style="width: 100%"
							filterable
							remote
							:collapse-tags="false"
							clearable
							v-model="createItem.recipientEmployeeId"
							placeholder="请输入"
							:disabled="disabledState"
							@visible-change="recipientEmployeeListVisibleChange"
							:remote-method="recipientEmployeeListFilterMehod"
							@change="employeeListChange($event, 'recipient', 'recipientEmployeeList')"
						>
							<el-option v-for="(item, index) in recipientEmployeeList" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item v-else label="收件人" prop="recipient" class="flex-item">
						<!-- 寄件 且 收件方公司不是分公司 -->
						<el-input maxlength="20" size="mini" placeholder="请输入" v-model="createItem.recipient" clearable :disabled="disabledState"></el-input>
					</el-form-item>
					<el-form-item label="收件人电话" prop="recipientPhone" class="flex-item">
						<el-input size="mini" placeholder="请输入" v-model="createItem.recipientPhone" clearable :disabled="disabledState"></el-input>
					</el-form-item>
					<el-form-item v-if="createItem.receisendType === 'receive' || receiveCompanyIsBranch" label="签收人" prop="signEmployeeId" class="flex-item">
						<!-- 收寄类型-收件 或者 收件方公司是分公司 -->
						<el-select
							size="mini"
							style="width: 100%"
							filterable
							remote
							:collapse-tags="false"
							clearable
							v-model="createItem.signEmployeeId"
							placeholder="请输入"
							:disabled="disabledState"
							@visible-change="signEmployeeListVisibleChange"
							:remote-method="signEmployeeListFilterMehod"
							@change="employeeListChange($event, 'signUser', 'signEmployeeList')"
						>
							<el-option v-for="(item, index) in signEmployeeList" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item v-else label="签收人" prop="signUser" class="flex-item">
						<!-- 寄件 且 收件方公司不是分公司 -->
						<el-input maxlength="60" size="mini" placeholder="请输入" v-model="createItem.signUser" clearable :disabled="disabledState"></el-input>
					</el-form-item>
					<el-form-item label="签收时间" prop="signTime" class="flex-item" :required="signTimeRequired" :show-message="false">
						<elDatePickerLimit noCanFuture size="mini" v-model="createItem.signTime" type="datetime" style="width: 100%" clearable placeholder="请选择" :disabled="disabledState" value-format="yyyy-MM-dd HH:mm:ss" />
					</el-form-item>
					<el-form-item label="发件方公司" prop="sendCompanyCode" class="flex-item">
						<el-select
							size="mini"
							remote
							clearable
							placeholder="请选择"
							v-model="createItem.sendCompanyCode"
							filterable
							:disabled="disabledState"
							style="width: 100%"
							@visible-change="senderVisibleChange"
							:remote-method="senderFilterMehod"
							@change="handleSelectSender"
						>
							<el-option v-for="(item, index) in sendCompanyOptions" :key="'sendCompany' + index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item v-if="createItem.expressType === 'foreign' && createItem.receisendType === 'receive'" label="发件方省市区" prop="sendAreas" class="flex-item">
						<el-cascader style="width:100%" size="mini" v-model="sendAreas" :options="sendForeignData" :props="cityProps" clearable filterable :disabled="disabledState" @change="handleSendChange"></el-cascader>
					</el-form-item>
					<el-form-item v-else label="发件方省市区" prop="sendAreas" class="flex-item">
						<el-cascader style="width:100%" size="mini" v-model="sendAreas" :options="sendDomesticData" :props="cityProps" clearable filterable :disabled="disabledState" @change="handleSendChange"></el-cascader>
					</el-form-item>
					<el-form-item label="发件方地址" prop="sendAddress" class="flex-item">
						<el-input maxlength="60" size="mini" placeholder="请输入" v-model="createItem.sendAddress" clearable :disabled="disabledState"></el-input>
					</el-form-item>
					<el-form-item v-if="createItem.receisendType === 'send' || sendCompanyIsBranch" label="发件人" prop="senderEmployeeId" class="flex-item">
						<!-- 寄件 或者 发件方公司是分公司 -->
						<el-select
							size="mini"
							style="width: 100%"
							filterable
							remote
							:collapse-tags="false"
							clearable
							v-model="createItem.senderEmployeeId"
							placeholder="请输入"
							:disabled="disabledState"
							@visible-change="senderEmployeeListVisibleChange"
							:remote-method="senderEmployeeListFilterMehod"
							@change="employeeListChange($event, 'sender', 'senderEmployeeList')"
						>
							<el-option v-for="(item, index) in senderEmployeeList" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item v-else label="发件人" prop="sender" class="flex-item">
						<!-- 收件 且 发件方公司不是分公司-->
						<el-input maxlength="60" size="mini" placeholder="请输入" v-model="createItem.sender" clearable :disabled="disabledState"></el-input>
					</el-form-item>
					<el-form-item label="发件人电话" prop="senderPhone" class="flex-item">
						<el-input maxlength="60" size="mini" placeholder="请输入" v-model="createItem.senderPhone" clearable :disabled="disabledState"></el-input>
					</el-form-item>
					<el-form-item v-if="createItem.receisendType === 'send' || sendCompanyIsBranch" label="寄单人" prop="postEmployeeId" class="flex-item">
						<!-- 寄件 或者 发件方公司是分公司 -->
						<el-select
							size="mini"
							style="width: 100%"
							filterable
							remote
							:collapse-tags="false"
							clearable
							v-model="createItem.postEmployeeId"
							placeholder="请输入"
							:disabled="disabledState"
							@visible-change="postEmployeeListVisibleChange"
							:remote-method="postEmployeeListFilterMehod"
							@change="employeeListChange($event, 'postUser', 'postEmployeeList')"
						>
							<el-option v-for="(item, index) in postEmployeeList" :key="index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item v-else label="寄单人" prop="postUser" class="flex-item">
						<!-- 收件 且 发件方公司不是分公司-->
						<el-input maxlength="20" size="mini" placeholder="请输入" v-model="createItem.postUser" clearable :disabled="disabledState"></el-input>
					</el-form-item>
					<el-form-item label="寄单时间" prop="postTime" class="flex-item" :show-message="false">
						<elDatePickerLimit size="mini" v-model="createItem.postTime" type="datetime" style="width: 100%" clearable placeholder="请选择" :disabled="disabledState" value-format="yyyy-MM-dd HH:mm:ss" />
					</el-form-item>
					<el-form-item label="付款方" prop="payer" class="flex-item" :show-message="false">
						<el-select size="mini" placeholder="请选择" v-model="createItem.payer" :disabled="disabledState" style="width: 100%">
							<el-option v-for="(item, index) in dictMap.expressPayer" :key="'payer' + index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="付款分公司" prop="companyCode" class="flex-item" :show-message="false" :required="payCompanyRequired">
						<el-select size="mini" v-model="createItem.companyCode" :disabled="disabledState" style="width: 100%" clearable filterable placeholder="请选择" @change="handleChangeCompany">
							<el-option v-for="item in companyListOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="快递费" prop="amt" class="flex-item" :required="amtRequired" :show-message="false">
						<el-input @blur="postValidate" size="mini" placeholder="请输入" v-model.trim="createItem.amt" clearable :disabled="disabledState"></el-input>
					</el-form-item>
					<el-form-item label="币种" prop="currency" class="flex-item">
						<el-select size="mini" v-model="createItem.currency" placeholder="请选择" clearable disabled style="width: 100%">
							<el-option v-for="(item, index) in currencyList" :key="index" :label="item.code" :value="item.code"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="寄单状态" prop="status" class="flex-item">
						<el-select size="mini" v-model="createItem.status" placeholder="请选择" clearable style="width: 100%" :disabled="disabledState">
							<el-option v-for="item in dictMap.postStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="备注" prop="remark" class="flex-item" style="width: 66.6%">
						<el-input maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createItem.remark" clearable :disabled="disabledState"></el-input>
					</el-form-item>
					<el-form-item label="附件" class="flex-item" style="width: 66.6%">
						<el-upload
							ref="upload"
							class="upload-demo"
							drag
							multiple
							action="#"
							:on-preview="handlePreview"
							:before-upload="beforeUpload"
							:on-change="handleChangeFile"
							:on-remove="handleRemove"
							:file-list="fileList"
							:http-request="uploadFile"
							:auto-upload="false"
							:disabled="disabledState"
						>
							<div class="el-upload">
								<img src="@/assets/icon-upload.png" />
								<div class="el-upload__text">
									<div>点击或将文件拖拽到这里导入</div>
									<p>支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
								</div>
							</div>
						</el-upload>
						<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
						<!-- 粘贴截图上传 -->
						<div class="clipboard-container" :ref="'clipboard' + (expressId || '')">
							<div class="clipboard-upload">
								<div class="clipboard-left" @paste="handlePaste">
									<img class="clipboard-left-img" src="@/assets/icon-upload.png" />
									<div class="clipboard-left-text">
										<div>
											<input id="clipboard-input" placeholder="点击按 Ctrl+V 将截图粘贴到这里" />
										</div>
									</div>
									<div class="clipboard-left-img-overlay" :style="{ left: overlayLeft + 'px', top: overlayTop + 'px' }"></div>
								</div>
								<div class="clipboard-preview-container">
									<div id="clipboard-preview" @mouseenter="handleShowPreviewDelete($event, 'yes')" @mouseleave="handleShowPreviewDelete($event, 'no')" @dragover.prevent="() => {}" @dragleave.prevent="() => {}">
										<div v-show="!pasted" class="clipboard-preview-text">截图预览</div>
										<span v-show="pasted && showPreviewDelete" class="clipboard-preview-delete-wrapper">
											<i class="el-icon el-icon-delete clipboard-preview-delete" @click="deleteFile"></i>
										</span>
									</div>
									<span class="clipboard-split"></span>
								</div>
								<ul v-show="fileListPaste.length > 1" class="clipboard-file-indicator-list">
									<li v-for="(file, index) in fileListPaste" :key="'fileIndicatorList' + index" :class="{ active: file.active }" @click="toggleFile(file.fileUid, index)">
										<span class="clipboard-file-indicator"></span>
									</li>
								</ul>
							</div>
						</div>
					</el-form-item>
				</el-form>
			</div>
			<div class="quick-class" v-if="!$route.query.expressId && !disabledState">
				<div class="title">快捷输入：</div>
				<el-input size="mini" clearable v-model="quickInputModel" placeholder="请依次输入姓名、电话、地址，中文逗号隔开"></el-input>
				<el-button size="mini" type="primary" class="ml10" @click="handleQuickInput('receipt')">填充到收件人</el-button>
				<el-button size="mini" type="primary" class="ml10" @click="handleQuickInput('send')">填充到发件人</el-button>
			</div>
			<div class="row-cont margin0 mt10">
				<div class="row-cont-tit h36 between">
					<span class="tit">寄单内容</span>
				</div>
				<div class="post-select-class">
					<div class="select-title">查询条件：</div>	 
					<el-select size="mini" placeholder="请选择" v-model="searchType" :disabled="disabledState" style="width: 100px" @change="handleChangeSearchType">
						<el-option v-for="(item, index) in searchTypeOptions" :key="'searchType' + index" :label="item.label" :value="item.value"> </el-option>
					</el-select>
					<el-tooltip style="padding-top: 5px;" v-if="searchType === 'bd'" class="item" effect="dark" content="支持选择销售和分公司公共员工" placement="top">
						<i class="el-icon-question"></i>
					</el-tooltip>
					<el-select
					  v-if="searchType === 'bd'"
						class="ml10"
						size="mini"
						multiple
						filterable
						:collapse-tags="true"
						clearable
						v-model="selectedBdIds"
						style="min-width: 400px"
						placeholder="请输入"
						:disabled="disabledState"
						@visible-change="employeeVisibleChange"
						:filter-method="employeeFilterMehod"
						@change="handleChangeEmployee"
					>
						<el-option v-for="(item, index) in employeeOptions" :key="'bd' + index" :label="item.label" :value="item.value"> {{ item.label }}{{ item.deptName ? `(${item.deptName})` : '' }} </el-option>
					</el-select>
					<div class="ml10" v-if="searchType === 'order' || searchType === 'joint'">
						<el-input size="mini" placeholder="请输入，多个以英文逗号或空格隔开" clearable  v-model="selectOrderNo" style="width: 500px" :disabled="disabledState" ></el-input>
						<div class="error-tip" v-if="errorOrderNo.length">输入的{{searchType === 'order'? '工作号': '协同单号'}}{{errorOrderNo.join('、')}}不存在，请重新检查</div>
					</div>
					<el-button size="mini" :loading="searchLoading" type="default" class="ml10" @click="handleSearch(searchType, selectOrderNo)" :disabled="disabledState" v-if="searchType === 'order' || searchType === 'joint'">搜索并新增</el-button>
				</div>
				<!-- 工作单号 -->
				<el-row class="mb10 post-detail-class" v-if="searchType === 'order' || searchType === 'joint'">
					<el-col :span="12" v-for="(item, index) in searchType === 'order' ? postOrderList : postJointList" :key="'order' + index">
						<div class="row-cont mt10">
							<div class="row-cont-tit h36 between">
								<div class="tit ft12" v-if="searchType === 'order'">
									<span>工作单号 {{ item.orderNo }}</span>
								</div>
								<div class="tit ft12" v-if="searchType === 'joint'">
									<span>协同单号 {{ item.jointNo }}</span>
								</div>
								<i class="el-icon-close delete" @click="handleDelete(index)" v-if="!disabledState"></i>
							</div>
							<div class="post-order-list" v-if="!item.blList.length && !item.tradeDocumentList.length && !item.insuranceList.length && !item.otherList.length">
								<div class="empty-txt">暂无信息</div>
							</div>
							<div class="post-order-list" v-else>
								<div class="post-order-row" v-if="item.blList.length">
									<div class="label">提单</div>
									<div class="options">
										<!-- <el-checkbox-group v-model="item.blCheckedKeys">
											<el-checkbox v-for="(el, sIndex) in item.blList" :key="'bl' + index + sIndex" :label="el.blId" :disabled="disabledState || el.selectedStatus === 2">
												<div>{{ el.blType | blTypeFilter(blBusinessType) }}</div>
												<div class="item-label-over">{{ el.blNo }}</div>
											</el-checkbox>
										</el-checkbox-group> -->
										<el-table :data="item.blList" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip" border style="width: 100%">
											<el-table-column align="left" prop="blId" width="30">
												<template slot-scope="scope">
													<span class="bl-class">
														<el-checkbox-group v-model="item.blCheckedKeys">
															<el-checkbox :label="scope.row.blId" :disabled="scope.row.selectedStatus === 2">
																<span class="null-class">''</span>
															</el-checkbox>
														</el-checkbox-group>
													</span>
												</template>
											</el-table-column>
											<el-table-column align="left" prop="blNo" label="提单号" show-overflow-tooltip>
												<template slot-scope="{ row }">
													<div style="display:flex;">
														<i class="icon-hbl" v-if="row.blType">{{ row.blType === 'hbl' ? 'H' : 'M' }}</i>
														<div class="no-warp-class" style="margin-left: 5px;">{{ row.blNo }}</div>
													</div>
												</template>
											</el-table-column>
											<el-table-column align="left" prop="blMode" label="出单方式" show-overflow-tooltip>
												<template slot-scope="{ row }">
													{{ row.blMode | getDictLabelFilter('blMode') }}
												</template>
											</el-table-column>
											<el-table-column align="left" prop="isAgreeRelease" label="客户同意状态">
												<template slot-scope="scope">
													<!-- 国外代理正本H单 -->
													<div class="column-text" v-if="scope.row.custClass === 'FOREIGN_PEER' && scope.row.blType === 'hbl' && originalArr.includes(scope.row.blMode)">
														<span v-if="scope.row.isAgreeRelease === 'all'">已同意{{scope.row.agreeReleaseStatus === 'pass' ? '(已特殊审批)' : ''}}</span>
														<span v-else-if="scope.row.isAgreeRelease === 'y'">同意寄单，同意放货{{scope.row.agreeReleaseStatus === 'pass' ? '(已特殊审批)' : ''}}</span>
														<span v-else-if="scope.row.isAgreeRelease === 'e'">同意寄单，不同意放货{{scope.row.agreeReleaseStatus === 'pass' ? '(已特殊审批)' : ''}}</span>
														<span v-else>未同意{{scope.row.agreeReleaseStatus === 'pass' ? '(已特殊审批)' : ''}}</span>
													</div>
													<div class="column-text" v-else>
														<span v-if="scope.row.blMode === 'tdcg'">--</span>
														<span v-else-if="scope.row.isAgreeRelease === 'y'">已同意{{scope.row.agreeReleaseStatus === 'pass' ? '(已特殊审批)' : ''}}</span>
														<span v-else>未同意{{scope.row.agreeReleaseStatus === 'pass' ? '(已特殊审批)' : ''}}</span>
													</div>
												</template>
											</el-table-column>
											<el-table-column align="left" prop="finAuditStatus" label="财务审核状态">
												<template slot-scope="{ row }">
													{{ row.finAuditStatus | auditStatusFilter }}
												</template>
											</el-table-column>
											<el-table-column align="left" prop="placeCompName" label="提单所在地" show-overflow-tooltip>
												<template slot-scope="{ row }">
													<div class="no-warp-class">{{ row.placeCompName }}</div>
												</template>
											</el-table-column>
										</el-table>
										<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
									</div>
								</div>
								<div class="post-order-row" v-if="item.tradeDocumentList.length">
									<div class="label">贸易单证</div>
									<div class="options">
										<el-checkbox-group v-model="item.tradeCheckedKeys">
											<el-checkbox v-for="(el, sIndex) in item.tradeDocumentList" :key="'tradeDoc' + index + sIndex" :label="el.docId" :disabled="el.selectedStatus === 2">
												<div>{{ el.docName | docNameFilter }}</div>
												<div class="item-label-over">{{ el.docNo }}</div>
											</el-checkbox>
										</el-checkbox-group>
									</div>
								</div>
								<div class="post-order-row" v-if="item.insuranceList.length">
									<div class="label">保险</div>
									<div class="options">
										<el-checkbox-group v-model="item.guaranteeCheckedKeys">
											<el-checkbox v-for="(el, sIndex) in item.insuranceList" :key="'guarantee' + index + sIndex" :label="el.invoiceNo" :disabled="el.selectedStatus === 2">
												<div>{{ el.docName }}</div>
												<div class="item-label-over">{{ el.invoiceNo }}</div>
											</el-checkbox>
										</el-checkbox-group>
									</div>
								</div>
								<div class="post-order-row" v-if="item.otherList.length">
									<div class="label">其他</div>
									<div class="options">
										<el-checkbox-group v-model="item.otherCheckedKeys">
											<el-checkbox v-for="(el, sIndex) in item.otherList" :key="'other' + index + sIndex" :label="el.otherCode" :disabled="el.selectedStatus === 2">
												<div style="display:flex;width:100%;align-items:center;">
													<div>{{ el.otherName }}</div>
													<!-- <div class="item-label-over">{{ el.otherCode }}</div> -->
													<el-input clearable v-if="el.otherCode === 'express_other' && item.otherCheckedKeys.includes('express_other')" style="width: 70%;margin-left:5px;" size="mini" v-model="el.remark" placeholder=""></el-input>
												</div>
											</el-checkbox>
										</el-checkbox-group>
									</div>
								</div>
							</div>
						</div>
					</el-col>
				</el-row>
				<!-- 员工 -->
				<el-row class="mb10" v-if="searchType === 'bd'">
					<div class="post-order-list" v-if="!selectedBdIds.length">
						<div class="empty-txt">暂无信息</div>
					</div>
					<div class="post-order-list" v-else>
						<el-checkbox-group size="mini" v-model="selectedBdIds">
							<el-checkbox size="mini" class="" v-for="(item, index) in selectedBdsGroup" :key="'selectedBd' + index" :label="item.value" @change="val => handleChangeChecked(val, item)">
								<div>{{ item.label }}{{ item.deptName ? `(${item.deptName})` : '' }}</div>
								<!-- {{item.label}}<br/>{{item.employeeNo}} -->
							</el-checkbox>
						</el-checkbox-group>
					</div>
				</el-row>
			</div>
		</div>
		<!-- 收件历史弹框 -->
		<el-dialog title="历史地址" @close="handleRevClose" :visible.sync="revHisVisible">
			<el-table @selection-change="handleRevSelectionChange" :data="receiveAddressList">
				<el-table-column type="selection" width="55"> </el-table-column>
				<el-table-column property="orgName" label="收件方公司"></el-table-column>
				<el-table-column property="address" label="收件方地址"></el-table-column>
				<el-table-column property="name" label="收件人"></el-table-column>
				<el-table-column property="mobileNo" label="收件人电话"></el-table-column>
			</el-table>
			<span slot="footer" class="dialog-footer">
				<el-button size="mini" @click="revHisVisible = false">手动输入</el-button>
				<el-button size="mini" type="primary" @click="handleRevConfirm">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 发件历史弹框 -->
		<el-dialog title="历史地址" @close="handleSendClose" :visible.sync="sendHisVisible">
			<el-table @selection-change="handleSendSelectionChange" :data="sendAddressList">
				<el-table-column type="selection" width="55"> </el-table-column>
				<el-table-column property="orgName" label="发件方公司"></el-table-column>
				<el-table-column property="address" label="发件方地址"></el-table-column>
				<el-table-column property="name" label="发件人"></el-table-column>
				<el-table-column property="mobileNo" label="发件人电话"></el-table-column>
			</el-table>
			<span slot="footer" class="dialog-footer">
				<el-button size="mini" @click="sendHisVisible = false">手动输入</el-button>
				<el-button size="mini" type="primary" @click="handleSendConfirm">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
// import Cookies from 'js-cookie'
// import { employeeSelectlist } from '@/api/baseData'
import { customerInfo, orgPostContactList } from '@/api/crm/supplier'
import { expressDetail, expressSave, getExpressDocs, getJointDocs, getOrderDocsByOrderNos, getJointDocsByJointNos, createLwpsExpressNo, getExpressListBdEmployee } from '@/api/order/post'
import { baseCurrencyList, baseEmployeeListName, companyPageList, getForeignCity, getDomesticCity, getPrice, baseCompanySettleList } from '@/api/base'
import { getDictLabel } from '@/utils/tools'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import { getOrderListDocs } from '@/api/railway/bl'

const defaultCreateQuery = {
	expressId: undefined,
	// businessType: '', // ship_export_fcl
	expressType: 'domestic',
	expressSupplierName: '',
	expressSupplierId: '',
	expressNo: '',
	postType: 'mail',
	currency: 'CNY',
	amt: null,
	postEmployeeId: '',
	postUser: '',
	postTime: '',
	signEmployeeId: '',
	signUser: '',
	signTime: '',
	receiveAddress: '',
	receiveCompany: '',
	receiveCompanyId: '',
	receiveCompanyCode: '',
	recipientEmployeeId: '',
	recipient: '',
	recipientPhone: '',
	sendCompany: '',
	sendCompanyId: '',
	sendCompanyCode: '',
	sendAddress: '',
	senderEmployeeId: '',
	sender: '',
	senderPhone: '',
	status: 'collected',
	receisendType: '',
	payer: '',
	remark: '',
	orders: {},
	joints: {},
	bds: [],
	receiveProvince: '',
	receiveCity: '',
	receiveDistrict: '',
	sendProvince: '',
	sendCity: '',
	sendDistrict: '',
	companyCode: '',
	companyName: ''
}

export default {
	filters: {
		docNameFilter(docName) {
			return getDictLabel('tradeDocName', docName)
		},
		blTypeFilter(blType, businessType) {
			if (businessType === 'air_export' || businessType === 'air_import') {
				return getDictLabel('airBlType', blType)
			} else {
				return getDictLabel('blType', blType)
			}
		},
		guarDocNameFilter(docName) {
			return getDictLabel('guaranteeDocName', docName)
		},
		auditStatusFilter(auditStatus) {
			let auditStatusOptions = store.state.order.finAuditStatusOptions
			return auditStatusOptions[auditStatus] || '--'
		}
	},
	data() {
		return {
			companyListOptions: [], // 付款分公司下拉
			insuranceIds: [],
			tradeIds: [],
			blIds: [],
			otherIds: [],
			blBusinessType: '',
			expressId: '',
			sendMultipleSelection: [],
			sendHisVisible: false,
			revMultipleSelection: [],
			revHisVisible: false,
			receiveAddressList: [],
			sendAddressList: [],
			revAreas: [],
			sendAreas: [],
			cityProps: {
				value: 'cname',
				label: 'cname',
				children: 'children'
			},
			revForeignData: [],
			revDomesticData: [],
			sendForeignData: [],
			sendDomesticData: [],
			oQuery: this.$route.query,
			postOrderNo: '',
			createItem: Object.assign({}, defaultCreateQuery),
			supplierOptions: [],
			receiveCompanyOptions: [],
			sendCompanyOptions: [],
			postOrderList: [],
			postJointList: [],
			postOrderItem: {
				orderNo: '',
				blList: [],
				blCheckedKeys: [],
				tradeDocumentList: [],
				tradeCheckedKeys: [],
				insuranceList: [],
				guaranteeCheckedKeys: [],
				otherList: [],
				otherCheckedKeys: []
			},
			currencyList: [],
			rules: {
				// businessType: [{ required: true, message: '请选择业务类型', trigger: 'change' }],
				postType: [{ required: true, message: '请选择寄单方式', trigger: 'change' }],
				expressType: [{ required: true, message: '请选择快递类型', trigger: 'change' }],
				// expressSupplierId: [{ required: true, message: '请选择快递公司', trigger: 'change' }],
				receisendType: [{ required: true, message: '请选择收寄类型', trigger: 'change' }]
			},
			searchTypeTxt: '',
			searchType: 'order', // 寄单内容搜索类型
			searchTypeOptions: [
				{ label: '工作单号', value: 'order' },
				{ label: '协同单号', value: 'joint' },
				{ label: '员工', value: 'bd' }
			],
			allEmployeeSelectList: [], // 所有员工数据列表
			selectedBdsGroup: [], // 选中的业务详细集合
			selectedBdIds: [], // 选中的业务id
			employeeOptions: [],
			tempOrderNos: [], // 临时存储寄单内容搜索过的订单号
			tempJointNos: [], // 临时存储寄单内容搜索过的协同单号
			recipientEmployeeList: [], // 收件人列表
			signEmployeeList: [], // 签收人列表
			senderEmployeeList: [], // 发件人列表
			postEmployeeList: [], // 寄单人列表
			quickInputModel: '',
			// 正本（邮寄的出单方式）:正本,借同行代理,HBL正本,同行借我司代理HBL正本
			originalArr: ['original', 'jthdlzb', 'thzb'],
			receiveCompanyIsBranch: false, // 收件方公司是否是分公司
			sendCompanyIsBranch: false, // 发件方公司是否是分公司
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			},
			showProcess: false,
			processLength: 0,
			file: '',
			fileList: [],
			fileData: '',
			defaultFileSize: 100,
			sizeLimit: true,
			interval: null,
			source: null,
			saveLoading: false,
			selectOrderNo: '',
			searchLoading: false,
			errorOrderNo: [],
			timerTr: null,
			branchCompanyList: [],	// 分公司
			pasted: false,
			previewImgSrc: '',
			// resFileList: [],
			fileListPaste: [],
			showPreviewDelete: false,
			fileUid: 1,
			overlayLeft: 0,
			overlayTop: 0,
		}
	},
	created() {},
	activated() {
		let flag = sessionStorage.getItem('postAddStorage')
		this.fileList = []
		this.deleteAllPreview()
		if (this.$route.query.source === 'postList' && !flag && !this.$route.query.expressId) {
			// 只有新增页面切换tab的时候不刷新
		} else {
			this.$nextTick(() => {
				this.source = null
				this.expressId = ''
				this.debounceLxz(() => {
					this.tempOrderNos = []
			    this.tempJointNos = []
					this.init()
					this.getCurrencyList()
					this.getCompanyList()
				})
			})
		}
		sessionStorage.removeItem('postAddStorage')
	},
	mounted() {
		console.log('dictMap.expressType', this.dictMap.expressType, this.dictMap.postType)
		this.$nextTick(() => {
			this.debounceLxz(() => {
        this.init()
			  this.getCurrencyList()
				this.getCompanyList()
      })
		})
		this.employeeSelectlist()
		this.getSettleCompanyList()
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			role: state => state.user.role,
			userName: state => state.user.name,
			userInfo: state => state.user.userInfo,
			finAuditStatusOptions: state => state.order.finAuditStatusOptions
		}),
		disabledState() {
			// 新增寄单或是费用未确认可以编辑，其他不可编辑
			if (!this.$route.query.expressId || this.$route.query.feeStatus === 'init') return false

			// if (this.createItem.status === 'to_send' || !this.createItem.status) return false
			return true
		},
		// signdisabled() {
		//   return ['signed'].includes(this.createItem.status) ? true : false
		// },
		amtRequired() {
			// 寄单方式 不是自取 且 快递类型是 国外件或者劳务派送 时 必填
			return this.createItem.expressType && this.createItem.expressType !== 'domestic' && this.createItem.postType !== 'invite' ? true : false
		},

		signTimeRequired() {
			return this.createItem.receisendType && this.createItem.receisendType === 'receive' ? true : false
		},
		expressSupplierRequired() {
			// 若“寄单方式”为“留存、自取”则“快递公司”非必填
			return this.createItem.postType && !['retained', 'invite'].includes(this.createItem.postType)
		},
		expressNoRequired() {
			// 寄单方式为邮寄 且 快递类型不能为劳务派送 时，快递单号必填
			return this.createItem.postType && this.createItem.postType === 'mail' && this.createItem.expressType && this.createItem.expressType !== 'labour_delivery'
		},
		isSzCompany() {
			return store.state.user.compCode === '000001' // 深圳市长帆供应链有限公司 是深圳分公司
		},
		// 付款分公司必填
		payCompanyRequired() {
			// 发件方分公司”不为空，且非我司分公司，且“付款方”为“发件方”，此时，“付款分公司”不需必填；
			if (this.createItem.sendCompanyCode && !this.branchCompanyList.find(item => item.companyCode === this.createItem.sendCompanyCode) && this.createItem.payer === 'owner') {
				return false
			}
			// “收件方分公司”不为空，且非我司分公司，且“付款方”为“收件方”，此时，“付款分公司”不需必填；
			if (this.createItem.receiveCompanyCode && !this.branchCompanyList.find(item => item.companyCode === this.createItem.receiveCompanyCode) && this.createItem.payer === 'other') {
				return false
			}
      // 收寄类型是 自取时， “付款分公司” 不需必填
			if (this.createItem.postType === 'invite') {
				return false
			}
			return true
		}
	},
	components: { tableTooltip },
	watch: {
		postOrderList: {
			handler(newVal) {
				this.tempOrderNos = []
				newVal.forEach(item => {
					item.orderNo && this.tempOrderNos.push(item.orderNo)
				})
				console.log('this.tempOrderNos', this.tempOrderNos)
			},
			deep: true
		},
		postJointList: {
			handler(newVal) {
				this.tempJointNos = []
				newVal.forEach(item => {
					item.jointNo && this.tempJointNos.push(item.jointNo)
				})
				console.log('this.tempJointNos', this.tempJointNos)
			},
			deep: true
		}
	},
	methods: {
		changeExpressType(val){
			this.getDefaultSupplierOptions()
			if(val==='labour_delivery'){
				this.createLwpsExpressNo()
			}else{
				this.createItem.expressNo = ''
			}
		},
		createLwpsExpressNo(){
			createLwpsExpressNo().then(res=>{
				this.createItem.expressNo = res.data
			})
		},
		// 选择结算分公司
		handleChangeCompany(val) {
			if(val){
				let item=this.companyListOptions.find(el=>el.value==val)
				this.createItem.companyName=item.label
			}else{
				this.createItem.companyName=''
			}
			
		},
		// 获取结算分公司
		getSettleCompanyList() {
			baseCompanySettleList().then(res => {
				this.companyListOptions = res.data.map(item => {
					return Object.assign({}, item, {
						label: item.companyName,
						value: item.companyCode
					})
				})
				
			})
		},
		toggleFile(id) {
			let images = this.$el.querySelectorAll('#clipboard-preview img')
			images.forEach((image, index) => {
				image.className = ''
				let fileUid = image.getAttribute('file-uid')
				if (fileUid == id) {
					image.className = 'active'
					let file = this.fileListPaste.find(file => file.fileUid == id)
					this.setFileActive(file)
				}
			})
		},
		deleteFile() {
			let preview = this.$el.querySelector('#clipboard-preview')
			let images = this.$el.querySelectorAll('#clipboard-preview img')
			try {
				images.forEach(image => {
					let className = image.className
					if (className.includes('active')) {
						let fileUid = image.getAttribute('file-uid')
						preview.removeChild(image)
						let index1 = this.fileListPaste.findIndex(file => file.fileUid == fileUid)
						this.fileListPaste.splice(index1, 1)
						// let index2 = this.resFileList.findIndex(file => file.fileUid == fileUid)
						// this.resFileList.splice(index2, 1)
						if (this.fileListPaste[0]) {
							this.setFileActive(this.fileListPaste[0])
						}
						if (this.fileListPaste.length === 0) {
							this.pasted = false
						}
						throw new Error('ending')
					}
				})
			} catch (error) {
				images = this.$el.querySelectorAll('#clipboard-preview img')
				if (images.length) {
					images[0].className = 'active'
				}
			}
		},
		deleteAllPreview() {
			// 清除所有的预览文件
      this.fileListPaste = []
			let preview = this.$el.querySelector('#clipboard-preview')
			let images = this.$el.querySelectorAll('#clipboard-preview img')
			if (preview && images) {
        images.forEach(image => {
					preview.removeChild(image)
			  })
				this.pasted = false
			}
		},
		handleShowPreviewDelete(event, val) {
			if (val === 'yes') {
				this.showPreviewDelete = true
			} else {
				this.showPreviewDelete = false
			}
		},
		setFileActive(file) {
			this.fileListPaste.forEach(file => {
				file.active = false
			})
			file.active = true
			this.$forceUpdate()
		},
		handlePaste(event) {
			// if (this.fileList.length + this.fileListPaste.length > this.limit) {
			// 	this.handleExceed()
			// 	return
			// }
			const items = (event.clipboardData || window.clipboardData).items
			let file = null
			if (!items || items.length === 0) {
				this.$message.error('无粘贴内容或当前浏览器不支持粘贴操作') // 当前浏览器不支持本地
				return
			}
			for (let i = 0; i < items.length; i++) {
				if (items[i].type.indexOf('image') !== -1) {
					file = items[i].getAsFile()
					break
				}
			}
			if (!file) {
				this.$message.error('粘贴内容非图片')
				return
			}
			const reader = new FileReader()
			reader.onload = event => {
				let preview = this.$el.querySelector('#clipboard-preview') // 使用$el可防止一个页面有多个该组件导致获取元素混乱
				this.pasted = true
				let images = this.$el.querySelectorAll('#clipboard-preview img')
				images.forEach(image => (image.className = ''))
				let image = document.createElement('img')
				image.src = `${event.target.result}`
				image.setAttribute('file-uid', this.fileUid++)
				image.className = 'active'
				preview.appendChild(image)
			}
			reader.readAsDataURL(file)
			file.fileUid = this.fileUid
			// this.file = file
			this.fileListPaste.push(file)
			this.setFileActive(file)
			// this.handleUpload(file)
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
		handleProgress(file, fileList) {
			this.processLength = 0
			this.showProcess = true
			this.interval = setInterval(() => {
				if (this.processLength >= 99) {
					clearInterval(this.interval)
					return
				}
				this.processLength += 1
			}, 200)
		},
		handlePreview(file) {
			console.log('file', file)
			let fileNo = file.fileNo
			let fileName = file.name
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
		uploadFile(file) {
			this.fileData = new FormData()
			this.fileData.append('fileName', file.file)
			//this.file = file.file
		},
		beforeUpload(file) {
			this.file = file
			this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!this.sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
			}
			return this.sizeLimit
		},
		handleChangeFile(file, fileList) {
			this.fileList = fileList
			console.log('this.fileList：', this.fileList)
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		// 收件人员工列表
		employeeSelectlist(val, listName) {
			console.log('收件人等字段数据', val, listName)
			if (!val && this.allEmployeeSelectList.length) {
				this[listName] = JSON.parse(JSON.stringify(this.allEmployeeSelectList)) // 拿所有数据时，防止重复去请求接口
				return
			}
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : ''
				// roleCode: "bd"  // 角色
			}
			baseEmployeeListName(data).then(res => {
				console.log('🚀 ~ res.data', res.data)
				this[listName] = res.data
					.filter(item => item.status === 'on')
					.map(item => {
						return Object.assign(item, {
							label: this.$language === 'en' ? item.ename : item.cname,
							value: item.employeeId ? Number(item.employeeId) : '',
							employeeNo: item.bdEmployeeNo,
							cname: item.cname,
							ename: item.ename
						})
					})
				if (!val && !this.allEmployeeSelectList.length) {
					this.allEmployeeSelectList = JSON.parse(JSON.stringify(this[listName]))
				}
			})
		},
		recipientEmployeeListVisibleChange(val) {
			this.employeeListVisibleChange(val, 'recipientEmployeeList')
		},
		recipientEmployeeListFilterMehod(val) {
			this.employeeSelectlist(val, 'recipientEmployeeList')
		},
		signEmployeeListVisibleChange(val) {
			this.employeeListVisibleChange(val, 'signEmployeeList')
		},
		signEmployeeListFilterMehod(val) {
			this.employeeSelectlist(val, 'signEmployeeList')
		},
		senderEmployeeListVisibleChange(val) {
			this.employeeListVisibleChange(val, 'senderEmployeeList')
		},
		senderEmployeeListFilterMehod(val) {
			this.employeeSelectlist(val, 'senderEmployeeList')
		},
		postEmployeeListVisibleChange(val) {
			this.employeeListVisibleChange(val, 'postEmployeeList')
		},
		postEmployeeListFilterMehod(val) {
			this.employeeSelectlist(val, 'postEmployeeList')
		},
		employeeListVisibleChange(val, listName) {
			val && this.employeeSelectlist('', listName)
		},
		employeeListChange(val, name, list) {
			let obj = this[list].find(item => {
				return item.value === val
			})
			this.createItem[name] = (obj && obj.label) || ''
		},
		postValidate() {
			if (!/^\d+(\.\d+)?$/.test(this.createItem.amt)) {
				this.createItem.amt = null
			}
		},

		//发件历史地址对话框关闭事件
		handleSendClose() {
			this.sendHisVisible = false
			this.sendMultipleSelection = []
		},
		//发件对话框确认事件
		handleSendConfirm() {
			if (this.sendMultipleSelection.length > 1) {
				return this.$message.warning('只能选择一条记录!')
			}
			if (this.sendMultipleSelection.length === 1) {
				let selected = this.sendMultipleSelection[0]
				this.createItem.sendAddress = selected.address
				this.createItem.senderPhone = selected.mobileNo
				this.createItem.sender = selected.name
				this.createItem.sendProvince = selected.province
				this.createItem.sendCity = selected.city
				this.createItem.sendDistrict = selected.district
				this.sendAreas = [selected.province, selected.city, selected.district]
			}
			this.sendHisVisible = false
		},
		//复选框选择事件
		handleSendSelectionChange(val) {
			this.sendMultipleSelection = val
		},
		//收件历史地址对话框关闭事件
		handleRevClose() {
			this.revHisVisible = false
			this.revMultipleSelection = []
		},
		//收件对话框确认事件
		handleRevConfirm() {
			if (this.revMultipleSelection.length > 1) {
				return this.$message.warning('只能选择一条记录!')
			}
			if (this.revMultipleSelection.length === 1) {
				let selected = this.revMultipleSelection[0]
				this.createItem.receiveAddress = selected.address
				this.createItem.recipientPhone = selected.mobileNo
				this.createItem.recipient = selected.name
				this.createItem.receiveProvince = selected.province
				this.createItem.receiveCity = selected.city
				this.createItem.receiveDistrict = selected.district
				this.revAreas = [selected.province, selected.city, selected.district]
			}

			this.revHisVisible = false
		},
		//复选框选择事件
		handleRevSelectionChange(val) {
			this.revMultipleSelection = val
		},
		//获取顺丰价格
		async getPrice() {
			if (this.revAreas.length > 1 && this.sendAreas.length > 1 && this.createItem.expressSupplierId == 100120984) {
				let data = {
					fromProvince: this.createItem.sendProvince,
					fromCity: this.createItem.sendCity,
					toProvince: this.createItem.receiveProvince,
					toCity: this.createItem.receiveCity
				}
				let res = await getPrice(data)
				this.createItem.amt = res.data && res.data.amt
			}
		},
		//收件省市区
		handleRevChange(val) {
			this.createItem.receiveProvince = this.revAreas[0] || ''
			this.createItem.receiveCity = this.revAreas[1] || ''
			this.createItem.receiveDistrict = this.revAreas[2] || ''
			console.log('🚀 ~ this.revAreas', this.revAreas)
			//获取顺丰价格
			this.getPrice()
		},
		//寄件省市区
		handleSendChange(val) {
			this.createItem.sendProvince = this.sendAreas[0] || ''
			this.createItem.sendCity = this.sendAreas[1] || ''
			this.createItem.sendDistrict = this.sendAreas[2] || ''
			console.log('🚀 ~ this.sendAreas', this.sendAreas)
			//获取顺丰价格
			this.getPrice()
		},
		init() {
			this.selectedBdsGroup = []
			this.getEmployeeName('')
			this.createItem = Object.assign({}, defaultCreateQuery)
			if(!this.$route.query.expressId && this.userInfo.settleCompanyCode){
				this.createItem.companyCode = this.userInfo.settleCompanyCode
				this.createItem.companyName = this.userInfo.settleCompanyName
			}
			if (this.$route.query.info) {
				// 默认赋值,放单详情过来的默认寄件，收件人，电话，地址使用放单详情内容
				this.$set(this.createItem, 'recipient', this.$route.query.info.receiveName)
				this.$set(this.createItem, 'recipientPhone', this.$route.query.info.receivePhone)
				this.$set(this.createItem, 'receiveAddress', this.$route.query.info.receiveAddress)
				// this.$set(this.createItem, 'businessType', this.$route.query.info.businessType)
				this.$set(this.createItem, 'receisendType', 'send')
				this.postUserdefaultSet()
			}

			if (this.$route.query.airOrderInfo) {
				// 空运贸易单证过来
				let airOrderInfo = JSON.parse(this.$route.query.airOrderInfo)
				// this.$set(this.createItem, 'businessType', airOrderInfo.businessType)
				this.$set(this.createItem, 'receisendType', 'send')
				this.postUserdefaultSet()
			}

			this.searchType = 'order'

			this.supplierOptions = []
			this.receiveCompanyOptions = []
			this.sendCompanyOptions = []
			this.postOrderList = []
			this.postJointList = []
			this.selectedBdIds = []
			if (this.$route.query.info && this.$route.query.info.orderNo) {
				this.handleSearch('order', this.$route.query.info.orderNo)
			}

			if (this.$route.query.airOrderInfo) {
				let airOrderInfo = JSON.parse(this.$route.query.airOrderInfo)
				if (airOrderInfo.orderNo) {
					this.handleSearch('order', airOrderInfo.orderNo)
				}
			}

			//清空省市区选中值
			this.revAreas = []
			this.sendAreas = []
			this.$refs.postSave.clearValidate()
			//获取省市区数据
			this.getRevCityData()
			this.getSendCityData()
			this.$route.query.expressId && this.getDetail()
			if (!this.$route.query.expressId) {
				this.getDefaultSupplierOptions() // 获取默认快递公司
			}
			if (this.$route.query.source === 'putList' && this.$route.query.orderNoStr) {
				// 放单列表中批量寄单成功后过来的
				getOrderListDocs({ orderNoList: this.$route.query.orderNoStr.split(',') }).then(res => {
					this.putListCb(res.data)
				})
			}
		},
		getDefaultSupplierOptions() {
			let data = {
				expressType: this.createItem.expressType
			}
			this.supplierOptions = []
      this.$store.dispatch('order/getDefaultExpressCompany', data)
			.then(obj => {
				if (obj && obj.value) {
           this.createItem.expressSupplierId = obj.value
					 this.createItem.expressSupplierName = obj.label
					 this.supplierOptions = [obj]
				}
			})
		},
		debounceLxz(fn, time = 800) {
      clearTimeout(this.timerTr)
      this.timerTr = setTimeout(() => {
        if (!fn || !(fn instanceof Function)) {
          this.$message({
            message: '参数错误！',
            type: 'error',
            showClose: true
          })
        } else {
          fn()
        }
      }, time)
    },
		putListCb(data) {
			if (this.$route.query.receiveName) {
				// 放单列表批量寄单过来的是寄件，如果多个工作单的收件信息一致要填充
				this.$set(this.createItem, 'recipient', this.$route.query.receiveName)
				this.$set(this.createItem, 'recipientPhone', this.$route.query.receivePhone)
				this.$set(this.createItem, 'receiveAddress', this.$route.query.receiveAddress)
			}
			this.$set(this.createItem, 'receisendType', 'send')
			this.postUserdefaultSet()
			this.postOrderList = []
			this.postJointList = []
			this.selectedBdIds = []
			this.selectedBdsGroup = []
			this.employeeOptions = []
			this.getDocs(data, 'order')
			console.log('this.postOrderList', this.postOrderList)
		},
		postUserdefaultSet() {
			// 若“收寄类型”为“寄件”，则寄单人默认为本人
			console.log('设置了寄单人')
			let { name, userId } = store.state.user
			this.createItem.postEmployeeId = userId
			this.createItem.postUser = name
		},
		// 币别下拉列表
		getCurrencyList(queryString) {
			baseCurrencyList(queryString, 'valid').then(response => {
				this.currencyList = response.data
			})
		},
		// 附件反显
		getFileList(data) {
			if (data.fileNo) {
				let list = []
				let nameList = data.fileName.split(',')
				let noList = data.fileNo.split(',')
				nameList.forEach((item, index) => {
					list.push({
						name: item,
						fileNo: noList[index]
					})
				})
				return list
			} else {
				return []
			}
		},
		// 详情
		getDetail(expressId) {
			expressDetail({ expressId: expressId || this.$route.query.expressId }).then(res => {
				this.blBusinessType = res.data.businessType
				this.source = res.data.source
				for (let i in defaultCreateQuery) {
					this.createItem[i] = res.data[i]
				}

				//省市区反显
				this.revAreas = [res.data.receiveProvince, res.data.receiveCity, res.data.receiveDistrict]
				this.sendAreas = [res.data.sendProvince, res.data.sendCity, res.data.sendDistrict]
				Object.assign(this.createItem, {
					expressSupplierId: this.createItem.expressSupplierId === 0 ? '' : this.createItem.expressSupplierId,
					receiveCompanyCode: this.createItem.receiveCompanyCode === 0 ? '' : this.createItem.receiveCompanyCode,
					sendCompanyCode: this.createItem.sendCompanyCode === 0 ? '' : this.createItem.sendCompanyCode
				})
				// 快递公司，收件方公司，发件方公司反显
				this.supplierOptions = [
					{
						label: this.createItem.expressSupplierName,
						value: this.createItem.expressSupplierId
					}
				]
				console.log('🚀 ~ this.supplierOptions', this.supplierOptions)
				console.log('🚀 ~ this.createItem', this.createItem)
				this.receiveCompanyOptions = [
					{
						label: this.createItem.receiveCompany,
						value: this.createItem.receiveCompanyCode
					}
				]
				this.sendCompanyOptions = [
					{
						label: this.createItem.sendCompany,
						value: this.createItem.sendCompanyCode
					}
				]
				if (this.createItem.postEmployeeId || this.createItem.senderEmployeeId) {
					this.sendCompanyIsBranch = true
				}
				if (this.createItem.recipientEmployeeId || this.createItem.signEmployeeId) {
					this.receiveCompanyIsBranch = true
				}
				// 附件反显
				this.fileList = this.getFileList(res.data || {})
				// 寄单内容，工作单号，员工反显
				let { orders, bds, joints } = res.data
				this.postOrderList = []
				this.postJointList = []
				this.selectedBdIds = []
				this.selectedBdsGroup = []
				this.employeeOptions = []
				if (orders && Object.keys(orders).length) {
					this.getDocs(orders, 'order')
				}
				if (joints && Object.keys(joints).length) {
					this.getDocs(joints, 'joint')
				}
				if (bds && bds.length) {
					console.log('🚀 ~ bds', bds)
					this.getBds(bds)
				}
				console.log('this.postOrderList', this.postOrderList)
			})
		},
		// 获取订单或协同单的贸易单证数据
		getDocs(data, type) {
			this.searchType = type
			this.searchTypeTxt = type === 'order' ? '工作单号' : '协同单号'
			for (let i in data) {
				let blCheckedKeys = [],
					tradeCheckedKeys = [],
					guaranteeCheckedKeys = [],
					otherCheckedKeys = []
				let { blList, insuranceList, tradeDocumentList, otherList } = data[i]
				// 被选中的字段集合 1:当前寄单中被选中 2：其他寄单中被选中
				// let insuranceList = data[i].insuranceList ? data[i].insuranceList : []
				blList.forEach(ele => {
					if (ele.selectedStatus === 1 || ele.selectedStatus === 2) {
						blCheckedKeys.push(ele.blId)
					}
				})
				tradeDocumentList.forEach(ele => {
					if (ele.selectedStatus === 1 || ele.selectedStatus === 2) {
						tradeCheckedKeys.push(ele.docId)
					}
				})
				insuranceList.forEach(ele => {
					if (ele.selectedStatus === 1 || ele.selectedStatus === 2) {
						guaranteeCheckedKeys.push(ele.invoiceNo)
					}
				})
				otherList.forEach(ele => {
					if (ele.selectedStatus === 1 || ele.selectedStatus === 2) {
						otherCheckedKeys.push(ele.otherCode)
					}
				})
				if (type === 'order') {
					this.postOrderList.push({
						blCheckedKeys,
						tradeCheckedKeys,
						guaranteeCheckedKeys,
						otherCheckedKeys,
						orderNo: i,
						blList,
						tradeDocumentList,
						insuranceList,
						otherList
					})
				}
				if (type === 'joint') {
					this.postJointList.push({
						blCheckedKeys,
						tradeCheckedKeys,
						guaranteeCheckedKeys,
						otherCheckedKeys,
						jointNo: i,
						blList,
						tradeDocumentList,
						insuranceList,
						otherList
					})
				}
			}
		},
		getBds(bds) {
			this.searchType = 'bd'
			this.searchTypeTxt = '员工'
			bds.forEach(item => {
				this.selectedBdIds.push(item.bdEmployeeId)
				this.selectedBdsGroup.push(
					Object.assign(item, {
						label: item.bdEmployeeName,
						employeeNo: item.bdEmployeeNo,
						value: item.bdEmployeeId
					})
				)
				this.employeeOptions.push({
					label: item.bdEmployeeName,
					value: item.bdEmployeeId,
					employeeNo: item.bdEmployeeNo,
					cname: item.bdEmployeeName,
					ename: item.bdEmployeeName
				})
			})
		},
		visibleChange(val) {
			// if (val) {
			// 	this.getSupplierList('')
			// }
		},
		filterMehod(val) {
			if (val === undefined) return
			if (this.createItem.expressSupplierName && !val) {
				val = this.createItem.expressSupplierName
			}
			this.getSupplierList(val)
		},
		// 下拉选择
		handleChangeSupplier(val) {
			console.log('🚀 ~ val', val)
			let item = this.supplierOptions.find(ele => ele.value === val)
			console.log(item)
			this.createItem.expressSupplierName = item.label
			this.getPrice()
		},
		// 获取快递公司
		getSupplierList(queryString) {
			//根据快递类型传递不同参数
			let deliveryType = 'delivery' // delivery_domestic

			// if (this.createItem.expressType == 'foreign') {
			// 	deliveryType = 'delivery_foreign'	// delivery_foreign
			// }
			console.log('🚀 ~ deliveryType', deliveryType)
			this.$store
				.dispatch('dict/querySupplierList', {
					category: 'category',
					value: deliveryType,
					queryString: queryString
				})
				.then(data => {
					if (data.list && data.list.length) {
						this.supplierOptions = data.list.map(ele => {
							return Object.assign(ele, {
								label: this.$language == 'en' ? ele.ename : ele.name,
								value: ele.supplierId ? Number(ele.supplierId) : ''
							})
						})
					}
				})
		},
		getAddress(compCode, userInfo = {}) {
			let obj = {}
			if (userInfo.companyList && userInfo.companyList.length) {
				obj = userInfo.companyList.find(item => {
					return item.companyCode === compCode
				})
			}
			// officAddr
			return (obj && obj.officAddr) || ''
		},
		getPlace(compCode, userInfo = {}) {
			let obj = {}
			if (userInfo.companyList && userInfo.companyList.length) {
				obj = userInfo.companyList.find(item => {
					return item.companyCode === compCode
				})
			}
			if (obj && obj.officProvince) {
				return [obj.officProvince, obj.officCity, obj.officDistrict]
			} else {
				return []
			}
		},
		handleChangePostType(val) {
			console.log('切换了寄单类型',val)
			if (val === 'mail') {
				this.getDefaultSupplierOptions()
			} else {
				this.createItem.expressSupplierId = ''
			}
		},
		handleChangeReceisendType(val) {
			console.log('store.state.user:', store.state.user)
			this.createItem.sendCompanyId = ''
			this.createItem.sendCompanyCode = ''
			this.createItem.sendCompany = ''
			this.createItem.sendAddress = ''
			this.createItem.senderEmployeeId = ''
			this.createItem.sender = ''
			this.createItem.senderPhone = ''
			this.createItem.signEmployeeId = ''
			this.createItem.signUser = ''
			this.createItem.receiveCompanyId = ''
			this.createItem.receiveCompanyCode = ''
			this.createItem.receiveCompany = ''
			this.createItem.receiveAddress = ''
			this.createItem.recipientEmployeeId = ''
			this.createItem.recipient = ''
			this.createItem.recipientPhone = ''
			this.receiveCompanyOptions = []
			this.sendCompanyOptions = []
			this.createItem.postEmployeeId = ''
			this.createItem.postUser = ''
			this.revAreas = []
			this.sendAreas = []
			let address = this.getAddress(store.state.user.compCode, store.state.user.userInfo)
			let place = this.getPlace(store.state.user.compCode, store.state.user.userInfo)
			if (val === 'send') {
				if (!this.createItem.postTime) this.createItem.postTime = new Date()
				this.postUserdefaultSet()
				this.createItem.sendCompanyCode = store.state.user.compCode
				this.createItem.sendCompany = store.state.user.compName
				this.createItem.sendAddress = address
				this.sendAreas = place
				this.createItem.sendProvince = this.sendAreas[0] || ''
				this.createItem.sendCity = this.sendAreas[1] || ''
				this.createItem.sendDistrict = this.sendAreas[2] || ''
				setTimeout(() => {
					this.sendCompanyOptions = [
						{
							label: this.createItem.sendCompany,
							value: this.createItem.sendCompanyCode
						}
					]
				}, 0)
			}
			if (val === 'receive') {
				if (!this.createItem.signTime) this.createItem.signTime = new Date()
				this.createItem.receiveCompanyCode = store.state.user.compCode
				this.createItem.receiveCompany = store.state.user.compName
				this.createItem.receiveAddress = address
				this.revAreas = place
				this.createItem.receiveProvince = this.revAreas[0] || ''
				this.createItem.receiveCity = this.revAreas[1] || ''
				this.createItem.receiveDistrict = this.revAreas[2] || ''
				setTimeout(() => {
					this.receiveCompanyOptions = [
						{
							label: this.createItem.receiveCompany,
							value: this.createItem.receiveCompanyCode
						}
					]
				}, 0)
			}
		},

		//处理最后一级children为空数组问题
		getTreeData(data) {
			// 循环遍历json数据
			for (var i = 0; i < data.length; i++) {
				if (data[i].children.length < 1) {
					// children若为空数组，则将children设为undefined
					data[i].children = undefined
				} else {
					// children若不为空数组，则继续 递归调用 本方法
					this.getTreeData(data[i].children)
				}
			}
			return data
		},
		//获取收件省市区数据
		async getRevCityData() {
			let resForeign = await getForeignCity({})
			let resDomestic = await getDomesticCity({})
			//处理最后一级children空数组
			this.revForeignData = this.getTreeData(resForeign.data)
			this.revDomesticData = this.getTreeData(resDomestic.data)
		},
		//获取发件省市区数据
		async getSendCityData() {
			let resForeign = await getForeignCity({})
			let resDomestic = await getDomesticCity({})
			//处理最后一级children空数组
			this.sendForeignData = this.getTreeData(resForeign.data)
			this.sendDomesticData = this.getTreeData(resDomestic.data)
		},

		// 收件方公司
		receiveFilterMehod(val) {
			if (this.createItem.receiveCompany && !val) {
				val = this.createItem.receiveCompany
			}
			// 如果是收件则收件方公司为分公司，发件方公司为
			if (this.createItem.receisendType === 'receive') {
				this.getCompanyList(val, 'receive')
			} else {
				this.getCustList(val, 'receive')
			}
		},
		receiveVisibleChange(val) {
			// if (val) {
			// 	// 如果是收件则收件方公司为分公司，发件方公司为crm
			// 	console.log('🚀 ~ this.createItem.receisendType', this.createItem.receisendType)
			// 	if (this.createItem.receisendType === 'receive') {
			// 		this.getCompanyList('', 'receive')
			// 	} else {
			// 		this.getCustList('', 'receive')
			// 	}
			// }
		},
		async handleSelectReceiver(val) {
			if (val) {
				let custItem = this.receiveCompanyOptions.find(item => item.value === val)
				this.createItem.receiveCompany = custItem ? custItem.label : ''
				this.createItem.receiveCompanyId = custItem ? custItem.id : ''
				let data = {
					currPage: 1,
					pageSize: 20,
					orgid: this.createItem.receiveCompanyId,
					receisendType: this.createItem.receisendType
				}

				if (this.createItem.receisendType === 'send') {
					let obj = this.receiveCompanyOptions.find(item => item.value === val) || {}
					this.receiveCompanyIsBranch = obj.isLsOwner === 'Y'
					//获取收件方历史地址
					let { data: res } = await orgPostContactList(data)
					this.receiveAddressList = res.list
					//有历史数据才弹窗
					if (this.receiveAddressList.length > 0) {
						this.revHisVisible = true
					}
				} else {
					// 选择了 收件
					this.receiveCompanyIsBranch = 'Y'
					let obj = this.receiveCompanyOptions.find(item => item.value === val) || {}
					this.createItem.receiveAddress = obj.officAddr || ''
					this.createItem.receiveProvince = obj.officProvince || ''
					this.createItem.receiveCity = obj.officCity || ''
					this.createItem.receiveDistrict = obj.officDistrict || ''
					this.revAreas = obj.officProvince ? [obj.officProvince, obj.officCity, obj.officDistrict] : []
				}
			}
		},
		// 发件方公司
		senderFilterMehod(val) {
			if (this.createItem.sendCompany && !val) {
				val = this.createItem.sendCompany
			}
			// 如果是寄件则发件方公司为分公司，收件方公司为crm
			if (this.createItem.receisendType === 'send') {
				this.getCompanyList(val, 'send')
			} else {
				this.getCustList(val, 'send')
			}
		},
		senderVisibleChange(val) {
			// if (val) {
			// 	// 如果是寄件则发件方公司为分公司，收件方公司为crm
			// 	if (this.createItem.receisendType === 'send') {
			// 		this.getCompanyList('', 'send')
			// 	} else {
			// 		this.getCustList('', 'send')
			// 	}
			// }
		},
		async handleSelectSender(val) {
			console.log('🚀🚀🚀🚀 ~ val', val)
			if (val) {
				let custItem = this.sendCompanyOptions.find(item => item.value === val)
				this.createItem.sendCompany = custItem ? custItem.label : ''
				this.createItem.sendCompanyId = custItem ? custItem.id : ''

				let data = {
					currPage: 1,
					pageSize: 20,
					orgid: this.createItem.sendCompanyId,
					receisendType: this.createItem.receisendType
				}

				if (this.createItem.receisendType === 'receive') {
					let obj = this.sendCompanyOptions.find(item => item.value === val) || {}
					this.sendCompanyIsBranch = obj.isLsOwner === 'Y'
					//获取发件方历史地址
					let { data: res } = await orgPostContactList(data)
					this.sendAddressList = res.list
					//有历史数据才弹窗
					if (this.sendAddressList.length > 0) {
						this.sendHisVisible = true
					}
				} else {
					// 选择了 收件
					this.sendCompanyIsBranch = 'Y'
					let obj = this.sendCompanyOptions.find(item => item.value === val) || {}
					this.createItem.sendAddress = obj.officAddr || ''
					this.createItem.sendProvince = obj.officProvince || ''
					this.createItem.sendCity = obj.officCity || ''
					this.createItem.sendDistrict = obj.officDistrict || ''
					this.sendAreas = obj.officProvince ? [obj.officProvince, obj.officCity, obj.officDistrict] : []
				}
			}
		},
		// crm获取公司
		// getCustList(val = '', type) {
		// 	this.$store.dispatch('dict/queryCustomerList', val).then(data => {
		// 		let list = data.list
		// 		let result = list.map(o => {
		// 			return Object.assign(o, {
		// 				id: o.orgid ? Number(o.orgid) : '',
		// 				value: o.code ? o.code : '',
		// 				label: this.$language == 'en' ? o.ename : o.name
		// 			})
		// 		})
		// 		if (type === 'receive') this.receiveCompanyOptions = result
		// 		if (type === 'send') this.sendCompanyOptions = result
		// 	})
		// },
		getCustList(val = '', type) {
			// 获取客户公司
			this.$store.dispatch('dict/queryOrgValidList', val).then(data => {
				let list = data
				let result = list.map(o => {
					return Object.assign(o, {
						id: o.orgid ? Number(o.orgid) : '',
						value: o.code ? o.code : '',
						label: this.$language == 'en' ? o.ename : o.name
					})
				})
				if (type === 'receive') this.receiveCompanyOptions = result
				if (type === 'send') this.sendCompanyOptions = result
			})
		},
		// 获取分公司
		getCompanyList(val, type) {
			let data = {
				currPage: 1,
				pageSize: 50,
				query: [
					{ column: 'companyName', type: 'like', value: val || '' },
					{ column: 'state', type: 'eq', value: 'valid' }
				]
			}
			companyPageList(data).then(res => {
				let result = res.data.list.map(o => {
					return Object.assign(o, {
						id: o.companyId ? Number(o.companyId) : '',
						value: o.companyCode ? o.companyCode : '',
						label: this.$language == 'en' ? o.companyEname : o.companyName
					})
				})
				this.branchCompanyList = result
				if (type === 'receive') this.receiveCompanyOptions = result
				if (type === 'send') this.sendCompanyOptions = result
				console.log(this.receiveCompanyOptions)
			})
		},
		// 删除
		handleDelete(sIndex) {
			if (this.searchType === 'order') {
				this.postOrderList = this.postOrderList.filter((item, index) => {
					return sIndex !== index
				})
			}
			if (this.searchType === 'joint') {
				this.postJointList = this.postJointList.filter((item, index) => {
					return sIndex !== index
				})
			}
		},
		// 按单号查询
		handleSearch(type, selectOrderNo) {
			let value = selectOrderNo.trim()
			if (!value) {
				this.$message.error('请输入有效单号查询')
				return
			}
			let orderNoList = value.split(/[,|，|\s]/)
			let requestOrderNo = [] // 请求的单号
			this.errorOrderNo = []
			let txt = ''
			let query = {}
			if (type === 'order') {
				requestOrderNo = orderNoList.filter(item => {
					return !this.tempOrderNos.includes(item) && item
				})
				txt = '订单号'
				query = { orderNo: value, expressId: this.$route.query.expressId }
			}
			if (type === 'joint') {
				requestOrderNo = orderNoList.filter(item => {
					return !this.tempJointNos.includes(item) && item
				})
				txt = '协同单号'
				query = { jointNo: value, expressId: this.$route.query.expressId }
			}
			let fn = type === 'order' ? getOrderDocsByOrderNos : getJointDocsByJointNos
			console.log(query)
			this.searchLoading = true
			fn(query).then(res => {
				// 每次请求数据先清空数组
				this.insuranceIds=[]
				this.tradeIds=[]
				this.blIds=[]
				let queryIds = this.$route.query.ids
				console.log(queryIds)
				queryIds &&
					queryIds.length > 0 &&
					queryIds.map(item => {
						if (item.fileType === 'bd') {
							this.insuranceIds.push(item.invoiceNo)
						} else if (getDictLabel('tradeDocName', item.fileType)) {
							this.tradeIds.push(item.oid)
						} else {
							this.blIds.push(item.blId)
						}
					})
				if (this.$route.query.airOrderInfo) {
					let airOrderInfo = JSON.parse(this.$route.query.airOrderInfo)
					// 空运贸易单证过来
					airOrderInfo.ids.map(item => {
						this.tradeIds.push(item.docId)
					})
				}
        let requestData = (res.data || []).filter(o => {
					return requestOrderNo.includes(o.orderNo) || requestOrderNo.includes(o.jointNo)
				})
				this.errorOrderNo = requestOrderNo.filter(item => {
					return !requestData.some(o => o.orderNo === item || o.jointNo === item)
			  })
				requestData.forEach(requestItem => {
          let { blList, insuranceList, tradeDocumentList, otherList, orderNo, jointNo } = requestItem
					// let insuranceList = res.data.insuranceList ? res.data.insuranceList : []
					// let blCheckedKeys = [],
					// tradeCheckedKeys = [],
					// guaranteeCheckedKeys = []
					let blCheckedKeys = this.blIds,
						tradeCheckedKeys = this.tradeIds,
						guaranteeCheckedKeys = this.insuranceIds,
						otherCheckedKeys = this.otherIds

					// 被选中的字段集合 1:当前寄单中被选中 2：其他寄单中被选中
					blList.forEach(ele => {
						if (ele.blId && (ele.selectedStatus === 1 || ele.selectedStatus === 2)) {
							blCheckedKeys.push(ele.blId)
						}
					})
					tradeDocumentList.forEach(ele => {
						if (ele.selectedStatus === 1 || ele.selectedStatus === 2) {
							if (!tradeCheckedKeys.includes(ele.docId)) {
								tradeCheckedKeys.push(ele.docId)
							}
						}
					})
					insuranceList.forEach(ele => {
						if (ele.selectedStatus === 1 || ele.selectedStatus === 2) {
							guaranteeCheckedKeys.push(ele.invoiceNo)
						}
					})
					otherList.forEach(ele => {
						if (ele.selectedStatus === 1 || ele.selectedStatus === 2) {
							otherCheckedKeys.push(ele.otherCode)
						}
					})
					if (type === 'order') {
						this.postOrderList.push(
							{
								blList,
								tradeDocumentList,
								insuranceList,
								otherList,
								orderNo,
								blCheckedKeys,
								tradeCheckedKeys,
								guaranteeCheckedKeys,
								otherCheckedKeys
							}
						)
					}
					if (type === 'joint') {
						this.postJointList.push(
							{
							blList,
							tradeDocumentList,
							insuranceList,
							otherList,
							jointNo,
							blCheckedKeys,
							tradeCheckedKeys,
							guaranteeCheckedKeys,
							otherCheckedKeys
						}
						)
					}
					console.log(this.postOrderList)
				})
			})
		  .finally(() => {
				this.searchLoading = false
			})
		},
		// 业务职员搜索
		employeeFilterMehod(val) {
			this.getEmployeeName(val)
		},
		employeeVisibleChange(val) {
			// val && this.getEmployeeName('')
		},
		handleChangeEmployee(val) {
			console.log('🚀 ~ selectedBdIds', this.selectedBdIds)
			this.selectedBdsGroup = this.employeeOptions
				.filter(item => val.includes(Number(item.value)))
				.map(item => {
					return Object.assign(item, {
						bdEmployeeId: item.value,
						bdEmployeeName: this.$language === 'en' ? item.ename : item.cname,
						bdEmployeeNo: item.employeeNo
					})
				})

			console.log(typeof this.selectedBdIds[0], this.selectedBdsGroup)
		},
		// 获取员工name
		getEmployeeName(val) {
			console.log('获取了员工数据')
			let data = val ? val.replace(/^\s+|\s+$/g, '') : ''
			getExpressListBdEmployee(data).then(res => {
				console.log('🚀 ~ res.data', res.data)
				// .filter(item => item.status === 'on') v20220628放开已离职的员工。场景：经常是有已离职的，后面还有他们的寄单费用要录。
				this.employeeOptions = res.data
					.map(item => {
						return Object.assign(item, {
							label: this.$language === 'en' ? item.ename : item.cname,
							value: item.employeeId ? Number(item.employeeId) : '',
							employeeNo: item.bdEmployeeNo,
							cname: item.cname,
							ename: item.ename
						})
					})
				this.selectedBdsGroup.forEach(item => {
					if (this.employeeOptions.every(item1 => item1.employeeId !== item.bdEmployeeId)) {
						this.employeeOptions.push(item)
					}
				})
				//已选中的数据
				let selectItem = this.employeeOptions.filter(item => this.selectedBdIds.includes(item.value))
				//未选中的数据
				let filterItem = this.employeeOptions.filter(item => !this.selectedBdIds.includes(item.value))
				// console.log('this.employeeOptions', this.employeeOptions, this.selectedBdIds);
				//已选中的数据置顶
				this.employeeOptions = [...selectItem, ...filterItem]
			})
		},
		handleChangeChecked(val, item) {
			console.log(this.selectedBdIds)
			console.log('🚀 ~ this.employeeOptions', this.employeeOptions)
			this.selectedBdsGroup = this.employeeOptions
				.filter(ele => this.selectedBdIds.includes(Number(ele.value)))
				.map(ele => {
					return Object.assign({}, ele, {
						bdEmployeeId: ele.value,
						bdEmployeeName: this.$language === 'en' ? ele.ename : ele.cname,
						bdEmployeeNo: ele.employeeNo
					})
				})
		},
		// 取消
		handleCancel() {
			// 寄件管理寄件列表tab名存入cookie,返回寄件管理时用于切换到寄件列表tab
			// Cookies.set('postTab', 'post1')
			this.expressId = ''
			this.$router.go(-1)
		},
		// 获取保存提交的参数
		getValues() {
			let bds = [],
				orders = {},
				joints = {}
			console.log('this.postOrderList', this.postOrderList)
			let postOrderList = [...this.postOrderList]
			let postJointList = [...this.postJointList]
			postOrderList = postOrderList.filter(item => item.blList.length || item.tradeDocumentList.length || (item.insuranceList && item.insuranceList.length) || item.otherList.length)
			postJointList = postJointList.filter(item => item.blList.length || item.tradeDocumentList.length || (item.insuranceList && item.insuranceList.length) || item.otherList.length)
			// 工作单号数据
			console.log('保存的数据：', postOrderList)
			postOrderList.forEach(item => {
				let blList = [],
					tradeDocumentList = [],
					insuranceList = [],
					otherList = []
				blList = item.blList.filter(el => {
					return item.blCheckedKeys.includes(el.blId) && el.selectedStatus !== 2
				})
				tradeDocumentList = item.tradeDocumentList.filter(el => {
					return item.tradeCheckedKeys.includes(el.docId) && el.selectedStatus !== 2
				})
				insuranceList = item.insuranceList.filter(el => {
					return item.guaranteeCheckedKeys.includes(el.invoiceNo) && el.selectedStatus !== 2
				})
				otherList = item.otherList.filter(el => {
					return item.otherCheckedKeys.includes(el.otherCode) && el.selectedStatus !== 2
				})
				orders[item.orderNo] = {
					blList,
					insuranceList: insuranceList,
					tradeList: tradeDocumentList,
					otherList
				}
			})
			console.log(orders)
			// 协同单号数据
			postJointList.forEach(item => {
				let tradeDocumentList = []
				tradeDocumentList = item.tradeDocumentList.filter(el => {
					return item.tradeCheckedKeys.includes(el.docId) && el.selectedStatus !== 2
				})
				joints[item.jointNo] = { tradeList: tradeDocumentList }
			})
			// 员工数据
			console.log(this.selectedBdsGroup)

			return Object.assign(this.createItem, {
				orders,
				joints,
				bds: this.selectedBdsGroup
			})
		},
		goBack() {
			this.$router.replace({
				path: 'postList'
			})
		},
		// 新增寄单内容，按订单/员工查询
		handleChangeSearchType(value) {
			let sItem = this.searchTypeOptions.find(item => item.value === value)
			this.searchTypeTxt = sItem.label
			this.errorOrderNo = []
			this.selectOrderNo = ''
			// console.log(value)
		},
		getFileSaveStr(type) {
			let list = []
			this.fileList.forEach(item => {
				if (item.fileNo) {
					list.push(item[type])
				}
			})
			return list.join(',')
		},
		expressNoBlur(val) {
			if (val) {
			  this.createItem.expressNo = val.replace(/(^\s*)|(\s*$)/g,"") // 清空快递单号内的首尾空格
			}
		},
		expressSave(data) {
			if (this.$route.query.expressId) {
				data.expressId = this.$route.query.expressId
			} else if (this.expressId) {
				data.expressId = this.expressId
			}
			data['source'] = this.source
			data['fileNo'] = this.getFileSaveStr('fileNo')
			data['fileName'] = this.getFileSaveStr('name')
			let params = {
				data,
				fileName: this.fileList.filter(item => !item.fileNo)
				          .concat(this.fileListPaste.map(item => {
										return { ...item, raw: item }
									}))
			}
			this.saveLoading = true
			this.$store
				.dispatch('order/soUpload', {
					uri: '/order/shipping/express/save',
					params
				})
				.then(res => {
					console.log('🚀 ~ res', res)
					this.saveLoading = false 
					if (res.data.code === 0) {
						this.expressId = res.data.data.expressId
						this.getDetail(this.expressId)
						this.fileList = this.getFileList(res.data.data || {})
						if (this.fileListPaste.length) {
						  this.deleteAllPreview()
						}
						this.$message({
							type: 'success',
							message: '保存成功',
							duration: 1000,
							onClose: () => {
								// this.goBack()
								this.processLength = 100
								this.showProcess = false
							}
						})
					}
				})
				.catch(() => { this.saveLoading = false })
		},
		checkPostInfo(data) {
			// 校验寄单内容
			let check = true
			if ((!data.bds || !data.bds.length) && 
			   (!data.orders || !Object.values(data.orders).length) &&
				 (!data.joints || !Object.values(data.joints).length)) {
					 this.$message.error('寄单内容不能为空')
					 check = false
				 }
			return check
		},
		// 保存
		handleSave() {
			let data = this.getValues()
			if (data.amt === '') {
				data.amt = null
			}
			if (this.searchType === 'order') {
				data.bds = []
				delete data.joints
			}
			if (this.searchType === 'bd') {
				data.orders = {}
				data.joints = {}
			}
			if (this.searchType === 'joint') {
				data.bds = []
				delete data.orders
			}
			// data.businessType = this.createItem.businessType
			//清空省市区数据
			// this.revAreas = []
			// this.sendAreas = []
			this.$refs.postSave.validate(valid => {
				if (valid) {
					this.$refs.upload.submit()
					if (!this.sizeLimit) return
					if (!this.checkPostInfo(data)) return
					// if (this.$route.query.source === 'postList') {
					this.expressSave(data)
					// } else {
					// 	this.$confirm('是否完成放单？', '警告', {
					// 		confirmButtonText: '确定',
					// 		cancelButtonText: '取消',
					// 		type: 'warning'
					// 	})
					// 		.then(() => {
					// 			//BL放单状态
					// 			data.blPutStatus = 'finish'
					// 			this.expressSave(data)
					// 		})
					// 		.catch(err => {
					// 			this.expressSave(data)
					// 		})
					// }
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},
		handleQuickInput(type) {
			if (this.quickInputModel) {
				let arr = this.quickInputModel.split('，')
				if (type === 'receipt') {
					// 收件
					this.createItem.recipient = arr[0] || ''
					this.createItem.recipientPhone = arr[1] || ''
					this.createItem.receiveAddress = arr[2] || ''
				} else {
					// 发件
					this.createItem.sender = arr[0] || ''
					this.createItem.senderPhone = arr[1] || ''
					this.createItem.sendAddress = arr[2] || ''
				}
			}
		}
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
.item-label-over {
	font-size: 12px;
	line-height: 12px;
	padding-right: 10px;
	margin-top: 5px;
	word-break: break-all;
}
.post-form .el-form-item__label {
	line-height: 20px;
}
.bd-flex {
	display: flex;
	line-height: 28px;
	padding-bottom: 10px;
	border-bottom: 1px solid #e0e0e0;
	margin: 10px;
}
.bd-flex .bd-label {
	width: 60px;
}
.bd-flex .el-select__input {
	font-size: 12px;
}
.edit-container.post-container {
	padding: 10px;
}
.edit-container.post-container .component-cont {
	margin-top: 0;
}
.quick-class {
	display: flex;
	align-items: center;
	.title {
		width: 75px;
	}
}
.icon-hbl {
	display: inline-block;
	width: 16px;
	height: 16px;
	background: #3e80f5;
	border-radius: 2px;
	color: #fff;
	line-height: 16px;
	text-align: center;
	font-style: normal;
}
.row-cont .post-detail-class .post-order-list {
	.post-order-row {
		margin-top: 5px;
		.options {
			width: calc(100% - 60px);
			.bl-class {
				.el-checkbox-group .el-checkbox {
					margin-bottom: 0px;
				}
				.null-class {
					color: white;
				}
			}
			.no-warp-class {
				flex: 1;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			.el-checkbox__input {
				margin-left: 0px;
			}
			.el-checkbox__label {
				width: calc(100% - 50px);
			}
		}
	}
}
.row-cont {
	.post-select-class{
		display: flex;
		margin-top: 10px;
		margin-left: 8px;
		.select-title {
			height: 15px;
			margin-top: 3px;
		}
	}
	.error-tip {
		margin-top: 5px;
		color: red;
		font-size: 12px;
	}
}
.clipboard-container {
	.el-dialog__body {
		padding-bottom: 18px;
	}
	.el-dialog__footer {
		padding-bottom: 21px;
	}
}

.clipboard-upload {
	border: 1px dashed #d9d9d9;
	border-radius: 6px;
	box-sizing: border-box;
	width: 945px;
	height: 260px;
	// margin: 0 10px;
	text-align: center;
	position: relative;
	background: #f8f9fd;
	// overflow: hidden;
	display: flex;
	position: relative;
}
.clipboard-left {
	width: 466px;
	// padding-top: 96px;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	/deep/ img {
		width: 34px;
		height: 34px;
	}
}
#clipboard-input {
	outline: none;
	width: 220px;
	padding-left: 3px;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	font-size: 12px;
	margin-top: 10px;
}
.clipboard-left-img-overlay {
	position: fixed;
	width: 34px;
	height: 44px;
}
.clipboard-preview-container {
	flex: 1;
	padding: 3px;
	height: 100%;
	position: relative;
}
#clipboard-preview {
	position: relative;
	height: 100%;
	img {
		width: 471px;
		height: 252px;
		position: absolute;
		left: 0;
		top: -1000px;
		&.active {
			top: 0;
		}
	}
}
.clipboard-preview-text {
	color: #606266;
	// margin-top: 45px;
	opacity: 0.5;
	font-size: 12px;
	height: 100%;
	vertical-align: middle;
	display: inline-block;
	&::after {
		height: 100%;
		content: '';
		vertical-align: middle;
		display: inline-block;
	}
}
.clipboard-preview-close {
	position: absolute;
	right: 5px;
	top: 5px;
	color: #606266;
	opacity: 0.5;
	cursor: pointer;
}
.clipboard-preview-close:hover {
	transform: scale(1.2);
	opacity: 1;
}
.clipboard-split {
	position: absolute;
	left: 0;
	top: 20px;
	width: 0;
	height: calc(100% - 40px);
	border-left: 1px dashed #d9d9d9;
}
.clipboard-preview-delete-wrapper {
	position: absolute;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
	cursor: default;
	text-align: center;
	color: #fff;
	font-size: 20px;
	background-color: rgba(0, 0, 0, 0.1);
	z-index: 100;
}
.clipboard-preview-delete {
	position: absolute;
	left: 50%;
	top: 50%;
	margin-left: -10px;
	margin-top: -10px;
	cursor: pointer;
}
.clipboard-file-indicator-list {
	position: absolute;
	right: -24px;
	top: 0;
	z-index: 101;
	width: 20px;
	display: flex;
	flex-direction: column;
	li {
		padding: 6px 6px;
		.clipboard-file-indicator {
			display: block;
			opacity: 0.5;
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background-color: #ddd;
			border: none;
			outline: none;
			padding: 0;
			margin: 0;
			cursor: pointer;
		}
		&.active {
			.clipboard-file-indicator {
				background-color: #3e80f5;
			}
		}
	}
}
</style>
