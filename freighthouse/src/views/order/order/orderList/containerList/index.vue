<template>
	<div class="edit-container order-book fullWrap" id="containerList">
		<div class="order-container">
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" id="cancelAlert" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" id="refuseAlert" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="activityKey" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container" id="container" @scroll="handleScroll">
							<CustInfo :orderInfo="orderInfo" :returnDisabled="formSubmiting" />
							<div class="component-cont table-com-layout" id="tableCont">
								<div class="cnList-row">
									<div class="ft14">集装箱列表</div>
									<div class="" v-if="isEditView">
										<span>VGM申报状态：</span>
										<el-select class="mr10" v-model="status" size="mini" placeholder="请选择" clearable style="width: 120px" @change="handleUpdateStatus" :disabled="isBd || isPendding">
											<el-option v-for="(item, index) in dictMap.vgmStatus" :key="index" :label="item.label" :value="item.value"></el-option>
										</el-select>
										<!-- 客户自定新增集装箱隐藏 -->
										<el-button :disabled="isPendding" type="primary" size="mini" @click="handleAdd" v-if="isSelfOrder">新增</el-button>
										<el-button :disabled="isPendding" type="default" size="mini" @click="handleImport" v-if="isSelfImportOrder">导入</el-button>
										<el-button :disabled="isPendding" type="default" size="mini" @click="handleExport">导出</el-button>
										<el-button :disabled="isPendding" type="warning" size="mini" @click="handleUpdateSo">批量修改SO</el-button>
									</div>
								</div>
								<div class="cn-total">
									<div class="cn-total-item">箱型箱量合计：{{ containerTotal.cnType }}</div>
									<div class="cn-total-item">件数合计：{{ containerTotal.quantity }}</div>
									<div class="cn-total-item">货重合计：{{ containerTotal.weight }}KGS</div>
									<div class="cn-total-item">体积合计：{{ containerTotal.volume }}CBM</div>
								</div>
								<u-table fit border resizable :data="containerList" @selection-change="handleSelectionChange" v-loading="tableLoading" :max-height="tableHeight" class="table-cont u-table-cont">
									<u-table-column type="selection" :fixed="'left'" width="50"> </u-table-column>
									<u-table-column type="index" label="序号" align="center" width="50" :resizable="true" fixed="left"></u-table-column>
									<u-table-column prop="containerType" label="箱型" align="center" width="80"> </u-table-column>
									<u-table-column prop="cn" label="箱号" align="center" min-width="150">
										<template slot-scope="scope">
											<input class="input-class" @change="handleEdit(scope.row, 'cn', scope.$index)" v-model.lazy="scope.row.cn" size="mini" clearable :disabled="!isEditView || isPendding" />
										</template>
									</u-table-column>
									<u-table-column prop="sn" label="封号" align="center" width="120">
										<template slot-scope="scope">
											<input class="input-class" @change="handleEdit(scope.row, 'sn', scope.$index)" v-model.lazy="scope.row.sn" size="mini" clearable :disabled="!isEditView || isPendding" />
										</template>
									</u-table-column>

									<u-table-column prop="so" label="SO" align="center" min-width="150">
										<template slot-scope="scope">
											<input class="input-class" @change="handleEdit(scope.row, 'so')" v-model.lazy="scope.row.so" size="mini" clearable :disabled="!isEditView || isPendding" maxlength="32" />
										</template>
									</u-table-column>
									<u-table-column prop="quantity" label="件数" align="center" width="90">
										<template slot-scope="scope">
											<input class="input-class" @change="handleEdit(scope.row, 'quantity')" v-model.lazy="scope.row.quantity" size="mini" clearable :disabled="!isEditView || isPendding" />
										</template>
									</u-table-column>
									<u-table-column prop="weight" label="货重(KGS)" align="center" width="100">
										<template slot-scope="scope">
											<input class="input-class" @change="handleEdit(scope.row, 'weight')" v-model.lazy="scope.row.weight" size="mini" clearable :disabled="!isEditView || isPendding" />
										</template>
									</u-table-column>
									<u-table-column prop="volume" label="体积(CBM)" align="center" width="100">
										<template slot-scope="scope">
											<input class="input-class" @change="handleEdit(scope.row, 'volume')" v-model.lazy="scope.row.volume" size="mini" clearable :disabled="!isEditView || isPendding" />
										</template>
									</u-table-column>
									<u-table-column prop="emptyWeight" label="空柜重量" align="center" width="100">
										<template slot-scope="scope">
											<input class="input-class" @change="handleEdit(scope.row, 'emptyWeight')" v-model.lazy="scope.row.emptyWeight" size="mini" clearable :disabled="!isEditView || isPendding" />
										</template>
									</u-table-column>

									<u-table-column prop="vgmWeight" label="VGM总重" align="center" width="100">
										<template slot-scope="scope">
											<input class="input-class" @change="handleEdit(scope.row, 'vgmWeight')" v-model.lazy="scope.row.vgmWeight" size="mini" clearable :disabled="!isEditView || isPendding" />
										</template>
									</u-table-column>
									<u-table-column prop="packageInfo" label="包装" align="center" width="100">
										<template slot-scope="scope">
											<el-select @change="handleEdit(scope.row, 'packageInfo')" size="mini" v-model="scope.row.packageInfo" style="width: 100%" placeholder="请选择" filterable :disabled="!isEditView || isPendding">
												<el-option v-for="item in dictMap.packageType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
											</el-select>
										</template>
									</u-table-column>
									<u-table-column prop="doTime" label="做柜时间" align="center" width="150">
										<template slot-scope="scope">
											<elDatePickerLimit
												@change="handleEdit(scope.row, 'doTime')"
												clearable
												size="mini"
												v-model="scope.row.doTime"
												type="date"
												style="width: 100%"
												placeholder="请选择"
												value-format="yyyy-MM-dd"
												:disabled="!isEditView || isPendding"
											/>
										</template>
									</u-table-column>
									<u-table-column prop="canTakeDate" label="可提柜时间" align="center" width="150" v-if="isImport">
										<template slot-scope="scope">
											<elDatePickerLimit
												@change="handleEdit(scope.row, 'canTakeDate')"
												clearable
												size="mini"
												v-model="scope.row.canTakeDate"
												type="date"
												style="width: 100%"
												placeholder="请选择"
												value-format="yyyy-MM-dd"
												:disabled="!isEditView"
											/>
										</template>
									</u-table-column>
									<u-table-column prop="latestFreeDate" label="最晚免费时间" align="center" width="150" v-if="isImport">
										<template slot-scope="scope">
											<elDatePickerLimit
												@change="handleEdit(scope.row, 'latestFreeDate')"
												clearable
												size="mini"
												v-model="scope.row.latestFreeDate"
												type="date"
												style="width: 100%"
												placeholder="请选择"
												value-format="yyyy-MM-dd"
												:disabled="!isEditView"
											/>
										</template>
									</u-table-column>
									<u-table-column prop="podTakeDate" label="实际提柜时间" align="center" width="150" v-if="isImport">
										<template slot-scope="scope">
											<elDatePickerLimit
												@change="handleEdit(scope.row, 'podTakeDate')"
												clearable
												size="mini"
												v-model="scope.row.podTakeDate"
												type="date"
												style="width: 100%"
												placeholder="请选择"
												value-format="yyyy-MM-dd"
												:disabled="!isEditView"
											/>
										</template>
									</u-table-column>
									<u-table-column prop="podReturnDate" label="还空柜时间" align="center" width="150" v-if="isImport">
										<template slot-scope="scope">
											<elDatePickerLimit
												@change="handleEdit(scope.row, 'podReturnDate')"
												clearable
												size="mini"
												v-model="scope.row.podReturnDate"
												type="date"
												style="width: 100%"
												placeholder="请选择"
												value-format="yyyy-MM-dd"
												:disabled="!isEditView"
											/>
										</template>
									</u-table-column>
									<u-table-column prop="state_cn" label="VGM申报状态" align="center" width="150"></u-table-column>
									<u-table-column prop="containerOwner" label="箱主" align="center" :resizable="true" min-width="150"> </u-table-column>
									<u-table-column prop="containerCloser" label="封箱方" align="center" :resizable="true" min-width="150"> </u-table-column>
									<u-table-column prop="returnTime" label="还重柜时间" align="center" width="150"> </u-table-column>
									<u-table-column prop="licensePlate" label="车牌号" align="center" :resizable="true" min-width="150"> </u-table-column>
									<u-table-column prop="driverName" label="司机" align="center" :resizable="true" min-width="150"> </u-table-column>
									<u-table-column prop="driverPhone" label="司机电话" align="center" :resizable="true" min-width="150"> </u-table-column>
									<u-table-column v-if="showIsTruckPre" prop="isTruckPre" label="是否预提" align="center" :resizable="true" min-width="100">
										<template slot-scope="scope">
											<el-select @change="handleEdit(scope.row, 'isTruckPre')" size="mini" v-model="scope.row.isTruckPre" style="width: 100%" clearable :disabled="!isEditView || isPendding" placeholder="请选择">
												<el-option v-for="item in dictMap.yesOrNoOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
											</el-select>
										</template>
									</u-table-column>
									<u-table-column label="操作" width="130" align="center" fixed="right">
										<template slot-scope="scope">
											<div class="operate-group">
												<el-button @click="handleInfo(scope.row)" type="text" size="mini">详情</el-button>
												<el-button :disabled="isPendding" class="red" v-if="scope.row.canDelete === 'Y'" @click="handleDelete(scope.row)" type="text" size="mini">删除</el-button>
												<el-button @click="handleViewLog(scope.row)" type="text" size="mini">日志</el-button>
											</div>
										</template>
									</u-table-column>
								</u-table>
							</div>
							<div class="component-cont bt" v-if="showContainerDetail">
								<!-- 新增 -->
								<div class="container-cont">
									<div class="cnList-row cnDetail-row" id="saveBar">
										<div class="">集装箱详情</div>
										<div class="">
											<el-button type="default" size="mini" @click="handleCancel">取消</el-button>
											<el-button type="primary" size="mini" :loading="formSubmiting" @click="handleSave" v-if="isEditView">保存</el-button>
										</div>
									</div>
									<div class="cnList-row cnDetail-row isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
										<div class="">集装箱详情</div>
										<div class="">
											<el-button type="default" size="mini" @click="handleCancel">取消</el-button>
											<el-button type="primary" size="mini" :loading="formSubmiting" @click="handleSave" v-if="isEditView">保存</el-button>
										</div>
									</div>
									<div class="">
										<div class="row-flex-cn">
											<el-form ref="cnSave" :rules="rules" :model="createItem" class="cnDetail-form" label-width="80px">
												<el-form-item label="箱型" prop="containerType" class="flex-item" :show-message="false">
													<el-select size="mini" v-model="createItem.containerType" filterable style="width: 100%" clearable placeholder="请选择" :disabled="disabledState || !isEditView" @change="handleChangeCnType">
														<el-option v-for="(item, index) in dictMap.containerTypeShiporder" :key="index" :label="item.label" :value="item.value"> </el-option>
													</el-select>
												</el-form-item>
												<el-form-item label="箱号" prop="cn" class="flex-item">
													<el-input size="mini" v-model="createItem.cn" clearable placeholder="请输入" :disabled="!isEditView || isPendding"></el-input>
												</el-form-item>
												<el-form-item label="封号" prop="sn" class="flex-item">
													<el-input size="mini" v-model="createItem.sn" clearable placeholder="请输入" maxlength="32" :disabled="!isEditView || isPendding"></el-input>
												</el-form-item>
												<el-form-item label="做柜时间" prop="doTime" class="flex-item" :show-message="false" :required="isDoTimeRequired">
													<elDatePickerLimit size="mini" v-model="createItem.doTime" type="date" style="width: 100%" :disabled="!isEditView || isPendding" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
												</el-form-item>
												<el-form-item label="SO号" prop="so" class="flex-item">
													<el-autocomplete
														style="width: 100%"
														size="mini"
														clearable
														class="inline-input"
														v-model="createItem.so"
														:disabled="!isEditView || isPendding"
														:fetch-suggestions="querySearch"
														placeholder="请输入"
														@select="handleSelect"
													></el-autocomplete>
												</el-form-item>
												<el-form-item label="件数" prop="quantity" class="flex-item">
													<el-input @blur="validateNum('quantity')" size="mini" v-model="createItem.quantity" :disabled="!isEditView || isPendding" clearable placeholder="请输入"></el-input>
												</el-form-item>
												<el-form-item label="包装" prop="packageInfo" class="flex-item" :show-message="false">
													<el-select size="mini" v-model="createItem.packageInfo" style="width: 100%" clearable :disabled="!isEditView || isPendding" placeholder="请选择" filterable>
														<el-option v-for="item in dictMap.packageType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
													</el-select>
												</el-form-item>
												<el-form-item label="体积" prop="volume" class="flex-item" :show-message="false">
													<el-input @blur="validatePoint('volume')" size="mini" v-model="createItem.volume" :disabled="!isEditView || isPendding" placeholder="请输入" clearable><template slot="append">CBM</template></el-input>
												</el-form-item>
												<el-form-item label="货重" prop="weight" class="flex-item" :show-message="false">
													<el-input @blur="validatePoint('weight')" size="mini" v-model="createItem.weight" placeholder="请输入" :disabled="!isEditView || isPendding" clearable><template slot="append">KGS</template></el-input>
												</el-form-item>
												<el-form-item label="空柜重量" prop="emptyWeight" class="flex-item">
													<el-input @blur="validatePoint('emptyWeight')" size="mini" :disabled="!isEditView || isPendding" v-model="createItem.emptyWeight" placeholder="请输入" clearable><template slot="append">KGS</template></el-input>
												</el-form-item>
												<el-form-item label="称重方法" prop="weightMode" class="flex-item">
													<el-select size="mini" v-model="createItem.weightMode" :disabled="!isEditView || isPendding" style="width: 100%" clearable placeholder="请选择">
														<el-option v-for="item in dictMap.weightMode" :key="item.value" :label="item.label" :value="item.value"> </el-option>
													</el-select>
												</el-form-item>
												<el-form-item label="用箱要求" prop="boxRemark" class="flex-item">
													<el-select size="mini" v-model="createItem.boxRemark" :disabled="!isEditView || isPendding" style="width: 100%" clearable placeholder="请选择">
														<el-option v-for="item in dictMap.boxRemark" :key="item.value" :label="item.label" :value="item.value"> </el-option>
													</el-select>
												</el-form-item>
												<el-form-item label="装箱状态" prop="boxStatus" class="flex-item" :show-message="false">
													<el-select size="mini" v-model="createItem.boxStatus" :disabled="!isEditView || isPendding" style="width: 100%" clearable placeholder="请选择">
														<el-option v-for="(item, index) in dictMap.boxStatus" :key="index" :label="item.label" :value="item.value"> </el-option>
													</el-select>
												</el-form-item>
												<el-form-item label="可提柜时间" prop="canTakeDate" class="flex-item">
													<elDatePickerLimit size="mini" v-model="createItem.canTakeDate" :disabled="!isEditView" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
												</el-form-item>
												<el-form-item label="最晚免费时间" prop="latestFreeDate" class="flex-item">
													<elDatePickerLimit size="mini" v-model="createItem.latestFreeDate" :disabled="!isEditView" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
												</el-form-item>
												<el-form-item label="实际提柜时间" prop="podTakeDate" class="flex-item">
													<elDatePickerLimit size="mini" v-model="createItem.podTakeDate" :disabled="!isEditView" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
												</el-form-item>
												<el-form-item label="还空柜时间" prop="podReturnDate" class="flex-item">
													<elDatePickerLimit size="mini" v-model="createItem.podReturnDate" :disabled="!isEditView" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
												</el-form-item>
												<el-form-item label="还重柜时间" prop="returnTime" class="flex-item">
													<elDatePickerLimit noCanFuture size="mini" v-model="createItem.returnTime" :disabled="!isEditView || isPendding" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
												</el-form-item>
												<el-form-item label="箱主" prop="containerOwner" class="flex-item">
													<el-input size="mini" v-model="createItem.containerOwner" :disabled="!isEditView || isPendding" placeholder="请输入箱主" clearable></el-input>
												</el-form-item>
												<el-form-item label="封箱人" prop="containerCloser" class="flex-item">
													<el-input size="mini" v-model="createItem.containerCloser" :disabled="!isEditView || isPendding" placeholder="请输入" clearable></el-input>
												</el-form-item>
												<el-form-item label="是否重柜" prop="isHeavy" class="flex-item" :show-message="false">
													<el-select size="mini" v-model="createItem.isHeavy" :disabled="!isEditView || isPendding" style="width: 100%" clearable placeholder="请选择">
														<el-option v-for="item in dictMap.yesOrNoOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
													</el-select>
												</el-form-item>
												<el-form-item label="特种长宽高" class="flex-item" style="width: 40%">
													<el-col :span="8" class="pd3">
														<el-input size="mini" @blur="validatePoint('specialLength')" :disabled="!isEditView || isPendding" v-model="createItem.specialLength" placeholder="请输入" style="width: 100%" clearable>
															<template slot="prepend">长</template>
															<template slot="append">m</template>
														</el-input>
													</el-col>
													<el-col :span="8" class="pd3">
														<el-input size="mini" @blur="validatePoint('specialWidth')" :disabled="!isEditView || isPendding" v-model="createItem.specialWidth" placeholder="请输入" style="width: 100%" clearable>
															<template slot="prepend">宽</template>
															<template slot="append">m</template>
														</el-input>
													</el-col>
													<el-col :span="8">
														<el-input size="mini" @blur="validatePoint('specialHeight')" :disabled="!isEditView || isPendding" v-model="createItem.specialHeight" placeholder="请输入" style="width: 100%" clearable>
															<template slot="prepend">高</template>
															<template slot="append">m</template>
														</el-input>
													</el-col>
												</el-form-item>
												<el-form-item label="VGM总重" prop="vgmWeight" class="flex-item">
													<el-input @blur="validatePoint('vgmWeight')" size="mini" :disabled="!isEditView || isPendding" v-model="createItem.vgmWeight" placeholder="请输入" clearable><template slot="append">KGS</template></el-input>
												</el-form-item>
												<el-form-item v-if="showIsTruckPre" label="是否预提" prop="isTruckPre" class="flex-item" :show-message="false">
													<el-select size="mini" v-model="createItem.isTruckPre" :disabled="!isEditView || isPendding" style="width: 100%" clearable placeholder="请选择">
														<el-option v-for="item in dictMap.yesOrNoOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
													</el-select>
												</el-form-item>
												<!-- <el-form-item label="" prop="specialWidth" class="flex-item special-item">													
												</el-form-item>
												<el-form-item label="" prop="specialHeight" class="flex-item special-item">													
												</el-form-item> -->
											</el-form>
										</div>
									</div>
								</div>
							</div>
							<!-- 上传 -->
							<div v-if="uploadPopShow">
								<ContainerUpload @close="uploadPopClose" />
							</div>
							<!-- 上传结果 -->
							<div v-if="uploadResultShow">
								<UploadResult @close="uploadResultPopClose" :results="UploadResultValues" />
							</div>
							<!-- 上传结果 -->
							<div v-if="updateSoShow">
								<UpdateSo @close="updateSoClose" :idList="idList" />
							</div>
							<div v-if="logPopShow">
								<Log :params="logParam" @close="logPopClose" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
const defaultCreateQuery = {
	oid: undefined, // id
	containerType: '', // 箱型
	isHeavy: '', // 是否重柜
	cn: '', // 箱号
	sn: '', // 封号
	so: '', // SO号
	packageInfo: '', // 包装
	quantity: '', // 件数
	weight: '', // 单柜重量
	volume: '', // 单柜体积
	emptyWeight: '', // 空柜重量
	vgmWeight: '', //VGM总重
	weightMode: '', // 称重方法
	boxRemark: '', // 用箱要求
	boxStatus: '', // 装箱状态
	returnTime: '', // 还重柜时间
	specialLength: '', // 特种长
	specialWidth: '', // 特种宽
	specialHeight: '', // 特种高
	containerOwner: '', // 箱主
	containerCloser: '', // 封箱方
	isTruckPre: '', // 是否预提
	doTime: '', // 做柜时间
	canTakeDate: '',	// 可提柜时间
	latestFreeDate: '',	// 最晚免费时间
	podTakeDate: '',	// 实际提柜时间
	podReturnDate: ''	// 还空柜时间
}

import { mapState } from 'vuex'
// import { accMul } from '@/utils/tools'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { orderInfo, orderContainerList, orderContainerCreate, orderContainerUpdate, orderContainerDrop, orderContainerExport, containerDelete, containerEdit, containerEditBatch } from '@/api/order/list'
import { getBookSoList } from '@/api/order/book/list'
import ContainerUpload from './components/containerUpload'
import UpdateSo from './components/updateSo'
import UploadResult from './components/uploadResult'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import CustInfo from '../components/custInfo'
import Log from './components/log'
// import Vue from 'vue'
import { vgmUpdateStatusByContainer } from '@/api/order/vgm'
import { getDictLabel } from '@/utils/tools'

export default {
	mixins: [orderMixin, routerMixin],
	beforeRouteLeave(to, from, next) {
		if (this.isEditView && this.containerList.some(item => this.checkIsChange(item))) {
			this.$confirm('集装箱信息还未保存，是否确定要离开当前页面？', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					next()
				})
				.catch(() => {})
		} else {
			next()
		}
	},
	data() {
		var validatorVgmWeight = (rule, value, callback) => {
			if (value === 0) {
				this.$message.error('VGM总重不能为0')
				callback(new Error('VGM总重不能为0'))
			} else {
				callback()
			}
		}
		var validatorQuantity = (rule, value, callback) => {
			const intReg = /^\d+(?=\.{0,1}\d+$|$)/
			if (!value) {
				callback()
			} else {
				if (value && !intReg.test(value)) {
					callback(new Error('请输入正确的件数'))
				} else if (value > 9999999) {
					callback(new Error('最大不能超过9999999'))
				} else {
					callback()
				}
			}
		}
		return {
			status: '',
			oQuery: this.$route.query,
			tableHeight: 50,
			containerList: [],
			uploadPopShow: false,
			uploadResultShow: false,
			UploadResultValues: {},
			showContainerDetail: false,
			createItem: Object.assign({}, defaultCreateQuery),
			formSubmiting: false,
			orderInfo: {},
			soOptions: [], // so下拉选项
			rules: {
				quantity: [
					{ required: false, message: '请选择件数', trigger: 'change' },
					{ validator: validatorQuantity, trigger: ['blur'] }
				],
				containerType: [{ required: true, message: '请选择箱型', trigger: 'change' }],
				packageInfo: [{ required: true, message: '请选择包装', trigger: 'change' }],
				volume: [{ required: true, message: '请输入体积', trigger: 'blur' }],
				weight: [{ required: true, message: '请输入重量', trigger: 'blur' }],
				// boxStatus: [{ required: true, message: '请选择装箱状态', trigger: 'change' }],
				isHeavy: [{ required: true, message: '请选择是否重柜', trigger: 'change' }],
				vgmWeight: [
					{ required: true, message: '请输入VMG总重', trigger: 'blur' },
					{ validator: validatorVgmWeight, trigger: ['blur'] }
				]
				// specialLength: [{ validator: this.validSpecialNum, trigger: ['blur', 'change'] }],
				// specialWidth: [{ validator: this.validSpecialNum, trigger: ['blur', 'change'] }],
				// specialHeight: [{ validator: this.validSpecialNum, trigger: ['blur', 'change'] }]
			},
			activityKey: 'ContainerList',
			updateSoShow: false,
			multipleSelection: [],
			idList: [],
			packageTypeOptions: [],
			oldTime: '',
			currentOid: '',
			saveBarFixed: false,
			beforeUnload_time: '',
			gap_time: '',
			rowIndex: null,
			oldData: [],
			logPopShow: false,
			logParam: {},
			loadingSuccess: false,
			tableLoading: false
		}
	},
	created() {
		this.getOrderInfo()
		this.getContainerList()
		this.getSoList()
	},
	mounted() {
		// if (window.history && window.history.pushState) {
		// 	history.pushState(null, null, document.URL)
		// 	window.addEventListener('popstate', this.browserBack, false)
		// }
		window.addEventListener('resize', () => {
			this.getTableHeight()
		})
		this.$nextTick(() => {
			this.getTableHeight()
		})
		// window.addEventListener('unload', e => {
		// 	console.log('e', e);
		// })
		// window.unload = (e) => {
		// 	console.log('e', e);
		// }
		window.addEventListener('beforeunload', e => this.beforeunloadHandler(e))
		// window.addEventListener('unload', e => this.unloadHandler(e))
		this.$nextTick(() => {
			setTimeout(() => {
				this.loadingSuccess = true
			}, 1000)
		})
	},
	destroyed() {
		// window.removeEventListener('popstate', this.browserBack, false)
		// window.unload = null
		window.removeEventListener('beforeunload', e => this.beforeunloadHandler(e))
		// window.removeEventListener('unload', e => this.unloadHandler(e))
	},
	computed: {
		...mapState({
			orderInfoDataObj: state => state.order.orderInfoDataObj
		}),
		isPendding() {
			return this.$route.query.isPendding === 'pendding'
		},
		cdOrderIsEdit() {
			let result = true
			if (this.orderInfoDataObj.exportOrderNo && ['st26', 'st27', 'st28'].includes(this.orderInfoDataObj.serviceType)) {
				result = false
			}
			return result
		},
		isDoTimeRequired() {
			return this.createItem.cn ? true : false
		},
		disabledState() {
			return this.createItem.oid ? true : false
		},
		// 出口整箱里只有客户自定的，进口整箱的才可新增导入，委托订舱隐藏按钮
		isSelfOrder() {
			return ['st02', 'st16', 'st17', 'st10', 'st09', 'st23', 'st26', 'st27', 'st28'].includes(this.orderInfo.serviceType)
		},
		isSelfImportOrder() {
			// 20220105委托订舱显示 导入按钮
			const entrustShow = ['st01', 'st03', 'st05', 'st07', 'st08', 'st09', 'st11', 'st13', 'st15', 'st18', 'st26', 'st27', 'st28'] // 委托订舱的seviceType集合
			return ['st02', 'st16', 'st17', 'st10', 'st23', ...entrustShow].includes(this.orderInfo.serviceType)
		},
		isEditView() {
			return (this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'op' || this.ordDetRole === 'doc' || this.ordDetRole === 'op_truck') && this.orderInfo.orderStatus !== 'complete'
		},
		styleObject() {
			// 顶部距离文档
			let offsetTop = document.querySelector('.tabs-container').offsetTop
			return this.saveBarFixed
				? {
						left: '120px',
						top: offsetTop + 24 + 'px'
				  }
				: {}
		},
		// 箱型箱量统计
		containerTotal() {
			return this.getContainerTotal(this.containerList)
		},
		// 是否展示预提
		showIsTruckPre() {
			// 起运港拖柜、起运港散车、订舱、代订舱 的其中一个服务项，则集装箱列表出现“是否预提”一列
			let arr = ['truck', 'pol_ltl', 'book', 'proxy_book']
			let { serviceInfoList } = this.orderInfo
			return (serviceInfoList || []).some(item => {
				return arr.includes(item.serviceCode)
			})
		},
		// 海运进口整箱
		isImport() {
			return this.orderInfoDataObj.businessType === 'ship_import_fcl'
		},
	},
	watch: {},
	components: {
		CancelAlert,
		RefuseAlert,
		TopNav,
		LeftNav,
		ContainerUpload,
		UpdateSo,
		UploadResult,
		CustInfo,
		Log
	},
	methods: {
		handleViewLog(row) {
			this.logPopShow = true
			this.logParam = row
		},
		logPopClose() {
			this.logPopShow = false
		},
		getReportIds() {
			let reportIds = []
			this.multipleSelection.map(item => {
				reportIds.push(item.reportId)
			})
			return reportIds
		},
		getContainerIds() {
			let containerIds = []
			this.multipleSelection.map(item => {
				containerIds.push(item.oid)
			})
			return containerIds
		},
		handleUpdateStatus(val) {
			if (!val) return
			if (this.multipleSelection.length === 0) {
				this.status = ''
				return this.$message.error('请勾选一条要更新状态的集装箱数据')
			}
			console.log(this.multipleSelection)
			for (let i = 0; i < this.multipleSelection.length; i++) {
				if (!this.multipleSelection[i].cn) {
					this.status = ''
					return this.$message.error('箱号完善的集装箱数据才能更改VGM申报状态')
				}
			}
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let containerIds = this.getContainerIds()
					return vgmUpdateStatusByContainer({
						jointNo: this.oQuery.jointNo,
						orderNo: this.oQuery.orderNo,
						status: val,
						containerIds: containerIds,
						formContainer: 1 // 1集装箱页，0vgm页
					})
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '更新VGM申报状态成功',
						duration: 1000,
						onClose: () => {
							this.status = ''
							this.getContainerList()
						}
					})
				})
				.catch(err => {
					this.status = ''
				})
		},
		beforeunloadHandler(e) {
			this.beforeUnload_time = new Date().getTime()
			if (this.isEditView && this.containerList.some(item => this.checkIsChange(item))) {
				this.saveData()
			}
		},
		unloadHandler(e) {
			this.gap_time = new Date().getTime() - this.beforeUnload_time
		},
		beforeunloadfn(e) {
			console.log('刷新或关闭')
		},
		getContainerTotal(containerList) {
			let quantity = 0
			let weight = 0
			let volume = 0
			let cnTypeObj = {}
			let cnType = ''
			containerList.forEach(o => {
				quantity += o.quantity ? Number(o.quantity) : 0
				weight += o.weight ? Number(o.weight) : 0
				volume += o.volume ? Number(o.volume) : 0
				weight = parseFloat(weight.toFixed(3))
				volume = parseFloat(volume.toFixed(3))
				quantity = parseFloat(quantity.toFixed(3))
			})
			let cnTypeArr = containerList.map(o => o.containerType)
			// 箱型箱量合计统计把相同的箱型元素的箱量相加合并
			for (let i = 0; i < cnTypeArr.length; i++) {
				if (cnTypeObj[cnTypeArr[i]]) {
					cnTypeObj[cnTypeArr[i]] += 1
				} else {
					cnTypeObj[cnTypeArr[i]] = 1
				}
			}
			Object.keys(cnTypeObj).map((o, index) => {
				const firstText = index > 0 ? '+' : ''
				cnType += firstText + `${o}*${cnTypeObj[o]}`
			})
			// console.log('cnTypeObj', cnTypeObj, cnType);
			return {
				quantity: quantity,
				weight: weight,
				volume: volume,
				cnType: cnType
			}
		},
		handleScroll() {
			// let saveBarDom = document.querySelector("#saveBar")
			let contDom = document.querySelector('#container')
			let tableCont = document.querySelector('#tableCont')
			let scrollTop = contDom.scrollTop
			let tableContHeight = tableCont.offsetHeight
			if (scrollTop > tableContHeight + 36 + 8) {
				// table高度和custInfo组件的高度
				this.saveBarFixed = true
			} else {
				this.saveBarFixed = false
			}
		},
		getTableHeight() {
			let cnHgt = document.getElementById('containerList').offsetHeight
			let cancelAlert = document.getElementById('cancelAlert')
			let refuseAlert = document.getElementById('refuseAlert')
			let cancelAlertHgt = cancelAlert ? cancelAlert.offsetHeight : 0
			let refuseAlertHgt = refuseAlert ? refuseAlert.offsetHeight : 0
			// topNav组件高度24px,custInfo组件高度36px,table标题40px(含padding),详情160px，margin编辑8+8，padding边距10+10
			this.tableHeight = cnHgt - cancelAlertHgt - refuseAlertHgt - 24 - 36 - 40 - 160 - 16 - 10
			// console.log('cancelAlert11111111111', document.getElementById('cancelAlert'))
			// console.log('height', cnHgt, this.tableHeight)
		},
		handleChangeCnType(val) {
			if (val === '20HD' || val === '40HD') {
				this.createItem.isHeavy = 'y'
			} else {
				this.createItem.isHeavy = 'n'
			}
		},
		// 数字校验
		validateNum(val) {
			const intReg = /^\d+(?=\.{0,1}\d+$|$)/
			if (this.createItem[val] && !intReg.test(this.createItem[val])) {
				// this.createItem[val] = ''
				return this.$message.error('请输入正确的件数')
			}
			if (this.createItem[val] > 9999999) {
				this.createItem[val] = 9999999
				this.$message.error('最大不能超过9999999')
			}
		},
		validatePoint(val) {
			// 长宽高保存为小数点后2位
			if (['specialLength', 'specialWidth', 'specialHeight'].includes(val)) {
				const reg = /^\d+(\.\d+)?$/
				if (!this.createItem[val]) return
				if (typeof this.createItem[val] === 'string') {
					let pointIndex = this.createItem[val].indexOf('.')
					if (pointIndex !== -1) {
						this.createItem[val] = this.createItem[val].substring(0, pointIndex + 3)
					}
				}
				this.createItem[val] = Number(this.createItem[val])
				if (!reg.test(this.createItem[val])) {
					this.createItem[val] = ''
					let message = ''
					switch (val) {
						case 'specialLength':
							message = '长度'
							break
						case 'specialWidth':
							message = '宽度'
							break
						case 'specialHeight':
							message = '高度'
							break
						default:
							break
					}
					return this.$message.error('请输入正确的' + message)
				}
			}
			// 体积重量保存为小数点后3位
			if (['volume', 'weight', 'emptyWeight', 'vgmWeight'].includes(val)) {
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
						case 'emptyWeight':
							message = '空柜重量'
							break
						case 'vgmWeight':
							message = 'VGM总重'
					}
					return this.$message.error('请输入正确的' + message)
				}
				if (['weight', 'emptyWeight'].includes(val)) {
					if ((this.createItem['weight'] || this.createItem['weight'] === 0) && (this.createItem['emptyWeight'] || this.createItem['emptyWeight'] === 0)) {
						this.createItem['vgmWeight'] = this.createItem['weight'] + this.createItem['emptyWeight']
					}
				}
			}
			if (this.createItem[val] > 999999) {
				this.createItem[val] = 999999
				this.$message.error('最大不能超过999999')
			}
		},

		// 获取so列表
		getSoList() {
			getBookSoList({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			}).then(res => {
				if (res.data && res.data.containerTypeList) {
					this.soOptions = [...res.data.soList].map(item => {
						return Object.assign({}, item, {
							key: item.so,
							value: item.so
						})
					})
				}
			})
		},
		getContainerList() {
			this.tableLoading = true
			orderContainerList({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			})
				.then(res => {
					// //特殊长宽高除以100
					// res.data.map(item => {
					// 	item.specialLength = item.specialLength / 100
					// 	item.specialHeight = item.specialHeight / 100
					// 	item.specialWidth = item.specialWidth / 100
					// })
					res.data && res.data.length && res.data.map(item => (item.state_cn = getDictLabel('vgmStatus', item.vgmStatus || 'no_declare')))
					this.containerList = res.data
					// 保存箱号
					let cnList = this.containerList.map(item => item.cn)
					let cnStr = JSON.stringify(cnList.filter(Boolean))
					localStorage.cnStr = cnStr
					this.setOldData(this.containerList)
					console.log('🚀 ~ res.data', res.data)
				})
				.finally(() => {
					this.tableLoading = false
				})
		},
		setOldData(list) {
			this.oldData = JSON.parse(JSON.stringify(list))
		},
		createFilter(queryString) {
			return resturant => {
				return resturant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
			}
		},
		querySearch(queryString, cb) {
			let soOptions = this.soOptions
			let results = queryString
				? soOptions.filter(item => {
						return item.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1
				  })
				: soOptions
			// 调用 callback 返回建议列表的数据
			cb(results)
		},
		handleSelect(item) {
			console.log(item)
		},
		handleClear() {},
		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
			console.log('this.multipleSelection', this.multipleSelection)
		},
		// 获取选中的集装箱id
		getOids() {
			let oids = []
			this.multipleSelection.map(item => {
				oids.push(item.oid)
			})
			return oids
		},
		handleInfo(row) {
			this.currentOid = row.oid
			this.showContainerDetail = true
			this.formSubmiting = false
			for (let i in defaultCreateQuery) {
				this.createItem[i] = row[i]
			}
		},
		handleDelete(row) {
			// 删除集装箱
			this.$confirm('是否确认删除该条数据项?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				lockScroll: 'true',
				type: 'warning'
			})
				.then(() => {
					return containerDelete({
						oid: row.oid,
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo
					})
				})
				.then(() => {
					this.$message({ message: '删除成功', type: 'success' })
					if (this.currentOid === row.oid) {
						this.currentOid = ''
						this.showContainerDetail = false
					}
					this.getContainerList()
				})
				.catch(() => {})
		},
		// 上传
		handleImport() {
			this.$confirm('执行导入集装箱时将会对集装箱列表数据进行覆盖，请确认是否导入集装箱！', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					this.uploadPopShow = true
				})
				.then(response => {})
				.catch(() => {})
		},
		handleAdd() {
			this.currentOid = ''
			this.showContainerDetail = true
			this.formSubmiting = false
			Object.assign(this.createItem, {}, defaultCreateQuery)
		},
		validate() {
			let reg = /^\d+(\.\d+)?$/
			if (!reg.test(this.createItem.weight)) {
				this.$message({ type: 'error', message: '请输入正确的重量' })
				return false
			}
			if (!reg.test(this.createItem.volume)) {
				this.$message({ type: 'error', message: '请输入正确的体积' })
				return false
			}
			return true
		},
		handleCancel() {
			this.formSubmiting = false
			this.showContainerDetail = false
		},
		handleSave() {
			let data = {}
			let orderData = []
			this.formSubmiting = true
			this.$refs.cnSave.validate(valid => {
				if (valid) {
					if (!this.validate()) return (this.formSubmiting = false)
					// 新增
					if (!this.createItem.oid) {
						let createItem = { ...this.createItem }
						// //特殊长宽高乘以100
						// createItem.specialHeight = accMul(100, createItem.specialHeight)
						// createItem.specialLength = accMul(100, createItem.specialLength)
						// createItem.specialWidth = accMul(100, createItem.specialWidth)
						Object.assign(data, createItem, {
							orderNo: this.$route.query.orderNo,
							jointNo: this.$route.query.jointNo
						})
						return orderContainerCreate(data)
							.then(res => {
								this.getContainerList()
								this.$message({
									type: 'success',
									message: '创建成功',
									duration: 1000,
									onClose: () => {
										this.formSubmiting = false
										this.showContainerDetail = false
									}
								})
							})
							.catch(error => {
								this.formSubmiting = false
							})
					}
					let createItem = { ...this.createItem }
					// //特殊长宽高乘以100
					// createItem.specialHeight = accMul(100, createItem.specialHeight)
					// createItem.specialLength = accMul(100, createItem.specialLength)
					// createItem.specialWidth = accMul(100, createItem.specialWidth)
					orderData.push(createItem)
					// 更新
					Object.assign(data, {
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo,
						orderData: orderData
					})
					orderContainerUpdate(data)
						.then(res => {
							this.getContainerList()
							this.$message({
								type: 'success',
								message: '更新成功',
								duration: 1000,
								onClose: () => {
									this.showContainerDetail = false
									this.formSubmiting = false
								}
							})
						})
						.catch(error => {
							this.formSubmiting = false
						})
				} else {
					console.log('error submit!!')
					this.formSubmiting = false
					return false
				}
			})
		},
		inputChangeMax(row, type, max) {
			console.log('触发了', row[type])
			row[type] = row[type].substring(0, max)
		},
		handleEdit(row, type, index) {
			const intReg = /^\d+(?=\.{0,1}\d+$|$)/
			const pReg = /^\d+(\.\d+)?$/
			const noCheckMaxValueParams = ['cn', 'sn', 'so']
			if (['weight', 'volume', 'emptyWeight', 'vgmWeight'].includes(type)) {
				// if (!row[type]) return
				if (typeof row[type] === 'string') {
					let pointIndex = row[type].indexOf('.')
					if (pointIndex !== -1) {
						row[type] = row[type].substring(0, pointIndex + 4)
					}
				}
				if (!(['weight', 'emptyWeight'].includes(type) && !row[type])) {
					// 'weight', 'emptyWeight'  为空时候不要转数字
					row[type] = Number(row[type])
				}

				if (!pReg.test(row[type])) {
					row[type] = ''
					let message = ''
					switch (type) {
						case 'volume':
							message = '体积'
							break
						case 'weight':
							message = '重量'
							break
						case 'emptyWeight':
							message = '空柜重量'
							break
						case 'vgmWeight':
							message = 'VGM总重'
					}
					if (type === 'emptyWeight') {
						// 空柜重可以为空
						if (row[type]) {
							return this.$message.error('请输入正确的' + message)
						}
					} else {
						return this.$message.error('请输入正确的' + message)
					}
				}
				if (['weight', 'emptyWeight'].includes(type)) {
					if ((row['weight'] || row['weight'] === 0) && (row['emptyWeight'] || row['emptyWeight'] === 0)) {
						row['vgmWeight'] = row['weight'] + row['emptyWeight'] > max ? max : row['weight'] + row['emptyWeight']
					}
					console.log('vgmWeight1111111', row['vgmWeight'], row['weight'], row['emptyWeight'])
				}
				if (['vgmWeight'].includes(type) && !row['vgmWeight']) {
					return this.$message.error('VGM总重不能为0')
				}
			}
			if (type === 'quantity') {
				row[type] = Number(row[type])
				if (!intReg.test(row.quantity)) {
					row.quantity = ''
					return this.$message.error('请输入正确的件数')
				}
			}
			let max = type === 'quantity' ? 9999999 : 999999
			if (type && !noCheckMaxValueParams.includes(type) && row[type] > max) {
				row[type] = max
				if (['weight', 'emptyWeight'].includes(type)) {
					row['vgmWeight'] = max
				}
				this.$message.error(`最大不能超过${max}`)
			}
			if (type === 'cn' && row[type] && row[type].length !== 11) {
				row[type] = ''
				return this.$message.error('箱号的长度为11位')
			}
			if (type === 'cn' && row[type] && this.containerList.some((item, ind) => ind !== index && item[type] === row[type])) {
				row[type] = ''
				return this.$message.error('箱号不能重复')
			}
			if (type === 'sn' && row[type] && this.containerList.some((item, ind) => ind !== index && item[type] === row[type])) {
				row[type] = ''
				return this.$message.error('封号不能重复')
			}
			if (type === 'so' && row[type] && row[type].length > 32) {
				row[type] = row[type].slice(0, 32)
			}
			// if (row.cn && !row.doTime) {
			// 	return this.$message.error({
			// 		type: 'error',
			// 		message: '做柜时间不能为空',
			// 		duration: 1000,
			// 		onClose: () => {
			// 			this.getContainerList()
			// 		}
			// 	})
			// }
			if (!this.checkIsChange(row)) return // 如果没改任何字段就不请求接口

			if (type === 'cn' && (!row.cn || !row.cn.trim())) {
				this.$confirm(`是否确认删除箱号?`, '警告', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						this.saveData()
					})
					.catch(err => {
						this.getContainerList()
					})
			} else {
				this.saveData()
			}
		},
		saveData() {
			let data = []
			this.containerList.forEach((item, index) => {
				data.push({})
				for (let i in defaultCreateQuery) {
					if (i === 'quantity' && item[i] === '') {
						data[index][i] = null
					}
					data[index][i] = item[i]
				}
				Object.assign(data[index], {
					orderNo: this.$route.query.orderNo,
					jointNo: this.$route.query.jointNo
				})
			})

			containerEditBatch(data)
				.then(res => {
					this.setOldData(this.containerList)
					this.$message.success('更新成功')
				})
				.catch(err => {
					this.getContainerList()
				})
		},
		checkIsChange(row) {
			let obj =
				this.oldData.find(item => {
					return item.oid === row.oid
				}) || {}
			for (let key in row) {
				if (key !== '_XID' && row[key] !== obj[key]) {
					return true
				}
			}
			return false
		},
		// 上传弹窗关闭回调
		uploadPopClose(action, values) {
			this.uploadPopShow = false
			if (action === 'Confirm') {
				this.getContainerList()
				this.uploadResultShow = true
				this.UploadResultValues = values || {}
			}
		},
		// 上传弹窗关闭回调
		uploadResultPopClose(action) {
			this.uploadResultShow = false
			if (action === 'Confirm') {
				this.showContainerDetail = false
			}
		},
		// 导出
		handleExport() {
			orderContainerExport({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			}).then(response => {
				let { filePath } = response.data
				window.location.href = filePath
			})
		},
		// 批量修改SO弹窗
		handleUpdateSo() {
			if (!this.multipleSelection.length) {
				return this.$message({
					type: 'error',
					message: '请选择要批量修改so的集装箱'
				})
			}
			this.updateSoShow = true
			this.idList = this.getOids()
		},
		updateSoClose(action) {
			this.updateSoShow = false
			if (action === 'Confirm') {
				this.getContainerList()
			}
		},
		validSpecialNum(rule, value, callback) {
			// console.log(rule)
			// let reg = /^\d+(\.\d+)?$/
			// if ((value && !reg.test(value)) || value === '0') {
			// 	let newTime=Date.parse(new Date())
			// 	if((!this.oldTime)||(this.oldTime&&(newTime-this.oldTime>500))){
			// 		this.oldTime= newTime
			// 		this.$message.warning('特种长宽高请输入大于0的数字')
			// 	}
			//   callback(new Error('特种长宽高请输入大于0的数字'))
			// } else {
			//   callback()
			// }
		}
	}
}
</script>

<style lang="scss">
@import '../../less/index.scss';
.containerList-cont {
	overflow-y: auto;
}
#containerList {
	.cnList-row {
		display: flex;
		justify-content: space-between;
		// margin-bottom: 10px;
		line-height: 20px;
		height: 20px;
		&.cnDetail-row {
			height: 28px;
			border-bottom: 1px solid #e9e9e9;
		}
		&.isFixed {
			position: fixed;
			background-color: #fff;
			z-index: 999;
			padding: 5px 20px;
			height: 30px;
			box-shadow: 4px 0px 10px 0px #e9e9e9;
			top: 24px;
			// top: 64px;
			right: 0;
		}
	}
	.cn-total {
		line-height: 20px;
		position: relative;
		margin: 0 0 10px 0;
		.cn-total-item {
			display: inline-block;
			margin-right: 20px;
		}
	}
	.row-flex-cn {
		margin-top: 15px;
		overflow: hidden;
		.flex-item {
			width: 20%;
			padding: 0;
			margin-bottom: 4px;
			float: left;
		}
		.pd3 {
			padding-right: 3px;
		}
	}
	.cnDetail-form {
		.el-form-item__label {
			line-height: 20px;
			padding-right: 3px;
		}
		.special-item {
			.el-form-item__content {
				margin-top: 20px;
			}
		}
	}
	.el-input--suffix .el-input__inner {
		padding-right: 20px;
	}
	.table-com-layout .el-table .cell {
		padding: 0 2px !important;
	}
	.table-cont.el-table--border {
		border: 0;
	}
}
.u-table-cont {
	font-size: 12px;
	tr {
		th {
			height: 25px;
			padding: 2px !important;
		}
		td {
			height: 25px;
			padding: 2px !important;
		}
	}
	.input-class {
		border: 1px solid #dcdfe6;
		border-radius: 2px;
		padding: 0 2px;
		width: 100%;
	}
	input {
		&:focus {
			outline: 1px;
			border-color: #1890ff !important;
		}
		&:active {
			outline: 1px;
			border-color: #1890ff !important;
		}
		&:visited {
			outline: 1px;
			border-color: #1890ff !important;
		}
		&:focus-visible {
			outline: 1px;
			border-color: #1890ff !important;
		}
	}
}
</style>
