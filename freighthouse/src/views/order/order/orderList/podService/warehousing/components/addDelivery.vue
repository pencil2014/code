<template>
	<div class="ltlDelivery-detail">
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-form ref="form" class="ltlDelivery-detail-body" :rules="rules" :model="formData" label-width="120px">
				<!-- <el-row>
					<el-col :span="6">
						<el-form-item label="委托编号" prop="intrustNo" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.intrustNo" disabled clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="车队" prop="supplierId">
							<el-select
								style="width: 100%"
								placeholder="请选择"
								size="mini"
								remote
								v-model="formData.supplierId"
								clearable
								:filterable="true"
								@visible-change="supplierVisibleChange"
								:filter-method="supplierFilterMehod"
								@change="handleSelectSupplierName"
							>
								<el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="车队联系人" prop="supplierContact">
							<el-autocomplete
								style="width: 100%"
								size="mini"
								clearable
								v-model="formData.supplierContact"
								:fetch-suggestions="(queryString, cb) => querySearchContact(queryString, cb)"
								placeholder="请输入车队联系人"
								@select="value => handleSelectContact(value)"
							></el-autocomplete>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="车队联系人电话" prop="supplierContactPhone">
							<el-input size="mini" placeholder="请输入车队联系人电话" v-model="formData.supplierContactPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="车队联系电话" prop="supplierPhone">
							<el-input size="mini" placeholder="请输入车队联系电话" v-model="formData.supplierPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="派车类型" prop="intrustType_cn" :show-message="false">
							<el-input size="mini" placeholder="请输入派车类型" v-model="formData.intrustType_cn" disabled clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="注意事项" prop="mainRemark">
							<el-input size="mini" placeholder="请输入" v-model="formData.mainRemark" clearable maxlength="512" show-word-limit></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-divider></el-divider>
				<el-row>
					<el-col :span="6">
						<el-form-item :label="formData.intrustType_cn + '计划编号'" prop="outPlanNo">
							<el-input size="mini" placeholder="请输入" v-model="formData.outPlanNo" disabled clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item :label="formData.intrustType_cn + '仓库'" prop="whName">
							<el-input size="mini" v-model="formData.whName" disabled clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装货人" prop="loadContact">
							<el-input size="mini" placeholder="请输入" v-model="formData.loadContact" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装货人电话" prop="loadContactPhone">
							<el-input size="mini" placeholder="请输入" v-model="formData.loadContactPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装货地点" prop="loadPlace" :show-message="false">
							<el-cascader v-if="showCasPlace" style="width:100%" size="mini" :emitPath="true" v-model="formData.loadPlace" :options="loadPlaceData" :props="cityProps" clearable @change="handleLoadChange"></el-cascader>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装货详细地址" prop="loadAddress" :show-message="false">
							<div class="box-address-flex">
								<el-input size="mini" placeholder="请输入" v-model="formData.loadAddress" clearable maxlength="128" class="box-address-input"></el-input>
								<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop('on')">选择</el-button>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="预计派送时间" prop="preLoadTime" :show-message="false">
							<elDatePickerLimit size="mini" v-model="formData.preLoadTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="实际派送时间" prop="loadTime" :show-message="false">
							<elDatePickerLimit size="mini" v-model="formData.loadTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货人" prop="unloadContact">
							<el-input size="mini" placeholder="请输入" v-model="formData.unloadContact" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货人电话" prop="unloadContactPhone">
							<el-input size="mini" placeholder="请输入" v-model="formData.unloadContactPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货地点" prop="unloadPlace" :show-message="false">
							<el-cascader v-if="showCasPlace" style="width:100%" size="mini" :emitPath="true" v-model="formData.unloadPlace" :options="unloadPlaceData" :props="cityProps" clearable @change="handleUnloadChange"></el-cascader>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货详细地址" prop="unloadAddress" :show-message="false">
							<div class="box-address-flex">
								<el-input size="mini" placeholder="请输入" v-model="formData.unloadAddress" clearable maxlength="128" class="box-address-input"></el-input>
								<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop('un')">选择</el-button>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="邮政编码" prop="postcode" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.postcode" clearable maxlength="32"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="司机姓名">
							<el-input size="mini" placeholder="请输入" v-model="formData.driverName" clearable maxlength="16"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="司机电话">
							<el-input size="mini" placeholder="请输入" v-model="formData.driverPhone" clearable maxlength="16"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="车牌号">
							<el-input size="mini" placeholder="请输入" v-model="formData.licensePlate" clearable maxlength="16"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="签收时间" prop="signTime" :show-message="false">
							<elDatePickerLimit size="mini" v-model="formData.signTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="签收附件" prop="signInfo" :show-message="false">
							<upload-input v-model="formData.signFileName" @downloadFile="handleDownload" @handleView="handleView" @uploadFile="handleAdd" @delFile="delFile" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="备注">
							<el-input size="mini" placeholder="请输入" v-model="formData.remark" clearable maxlength="512"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="快捷输入">
							<div class="quick-class">
								<el-input size="mini" clearable v-model="quickInputModel" placeholder="请依次输入姓名、电话、地址，中文逗号隔开"></el-input>
								<el-button size="mini" type="primary" class="ml10" @click="handleQuickInput('box')">填充到装货人</el-button>
								<el-button size="mini" type="primary" class="ml10" @click="handleQuickInput('unload')">填充到卸货人</el-button>
							</div>
						</el-form-item>
					</el-col>
				</el-row> -->
				<el-row>
					<el-col :span="8">
						<div class="intrust-plan-title">派送信息</div>

						<el-form-item label="收货人" prop="consignee" required :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.consignee" clearable></el-input>
						</el-form-item>
						<el-form-item label="收货人电话" prop="consigneePhone" required :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.consigneePhone" clearable></el-input>
						</el-form-item>
						<el-form-item label="收货人邮箱" prop="consigneeEmail" :show-message="false">
							<el-input maxlength="128" size="mini" placeholder="请输入" v-model="formData.consigneeEmail" clearable></el-input>
						</el-form-item>
						<el-form-item label="邮政编码" prop="postcode" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.postcode" clearable maxlength="32"></el-input>
						</el-form-item>
						<el-form-item label="卸货详细地址" prop="unloadAddress" :show-message="false">
							<div class="box-address-flex">
								<el-input size="mini" placeholder="请输入" v-model="formData.unloadAddress" clearable maxlength="512" class="box-address-input"></el-input>
								<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop('un')">选择</el-button>
							</div>
						</el-form-item>
						<el-form-item label="快捷输入">
							<div class="box-address-flex">
								<el-input size="mini" clearable class="box-address-input" v-model="quickInputModel" placeholder="请依次输入姓名、电话、地址，中文逗号隔开"></el-input>
								<el-button size="mini" type="primary" class="box-address-btn" @click="handleQuickInput('unload')">填充</el-button>
							</div>
						</el-form-item>
						<el-form-item label="备注">
							<el-input size="mini" placeholder="请输入" v-model="formData.remark" clearable maxlength="512"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<div class="intrust-plan-title">装货信息</div>

						<el-form-item label="装货人" prop="loadContact" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.loadContact" clearable></el-input>
						</el-form-item>
						<el-form-item label="装货人电话" prop="loadContactPhone" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.loadContactPhone" clearable></el-input>
						</el-form-item>
						<el-form-item label="装货详细地址" prop="loadAddress" :show-message="false">
							<div class="box-address-flex">
								<el-input size="mini" placeholder="请输入" v-model="formData.loadAddress" clearable maxlength="512" class="box-address-input"></el-input>
								<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop('on')">选择</el-button>
							</div>
						</el-form-item>
						<el-form-item label="快捷输入">
							<div class="box-address-flex">
								<el-input size="mini" clearable class="box-address-input" v-model="quickInputModelBox" placeholder="请依次输入姓名、电话、地址，中文逗号隔开"></el-input>
								<el-button size="mini" type="primary" class="box-address-btn" @click="handleQuickInput('box')">填充</el-button>
							</div>
						</el-form-item>
						<el-form-item label="派车类型" prop="intrustType_cn" :show-message="false">
							<el-input size="mini" placeholder="请输入派车类型" v-model="formData.intrustType_cn" disabled clearable></el-input>
						</el-form-item>
						<el-form-item :label="formData.intrustType_cn + '计划编号'" prop="outPlanNo">
							<el-input size="mini" placeholder="请输入" v-model="formData.outPlanNo" disabled clearable></el-input>
						</el-form-item>
						<el-form-item :label="formData.intrustType_cn + '仓库'" prop="whName">
							<el-input size="mini" v-model="formData.whName" disabled clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<div class="intrust-plan-title">代理&车队信息</div>
						<el-form-item v-if="$route.query.isPendding != 'pendding'" label="海外代理" prop="overseaAgentId">
							<el-select v-model="formData.overseaAgentId" size="mini" clearable placeholder="请选择" style="width: 100%" remote filterable @visible-change="overseaVisibleChange" :filter-method="overseaFilterMehod" @change="handleSelectOverseaName">
								<el-option v-for="(item, index) in overseaList" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item v-if="$route.query.isPendding != 'pendding'" label="海外分公司" prop="overseasCompanyCode">
							<el-select clearable="" v-model="formData.overseasCompanyCode" size="mini" placeholder="请选择" style="width: 100%" @change="val => changeOverseasCompany(val)">
								<el-option v-for="(item, index) in abroadCompanyList" :label="item.companyName" :value="item.companyCode" :key="index"> </el-option>
							</el-select>
						</el-form-item>

						<el-form-item label="车队" prop="supplierId">
							<el-select
								style="width: 100%"
								placeholder="请选择"
								size="mini"
								remote
								v-model="formData.supplierId"
								clearable
								:filterable="true"
								@visible-change="supplierVisibleChange"
								:filter-method="supplierFilterMehod"
								@change="handleSelectSupplierName"
							>
								<el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="车队联系电话" prop="supplierPhone">
							<el-input size="mini" placeholder="请输入车队联系电话" v-model="formData.supplierPhone" clearable></el-input>
						</el-form-item>
						<el-form-item label="车队联系人" prop="supplierContact">
							<el-autocomplete
								style="width: 100%"
								size="mini"
								clearable
								v-model="formData.supplierContact"
								:fetch-suggestions="(queryString, cb) => querySearchContact(queryString, cb)"
								placeholder="请输入车队联系人"
								@select="value => handleSelectContact(value)"
							></el-autocomplete>
						</el-form-item>
						<el-form-item label="车队联系人电话" prop="supplierContactPhone">
							<el-input size="mini" placeholder="请输入车队联系人电话" v-model="formData.supplierContactPhone" clearable></el-input>
						</el-form-item>

						<el-form-item label="司机">
							<el-input size="mini" placeholder="请输入" v-model="formData.driverName" clearable maxlength="16"></el-input>
						</el-form-item>
						<el-form-item label="司机电话">
							<el-input size="mini" placeholder="请输入" v-model="formData.driverPhone" clearable maxlength="16"></el-input>
						</el-form-item>
						<el-form-item label="车牌号">
							<el-input size="mini" placeholder="请输入" v-model="formData.licensePlate" clearable maxlength="16"></el-input>
						</el-form-item>
					</el-col>
					<!-- <el-col :span="6">
						<div class="intrust-plan-title">
							派送节点
						</div>

						<el-form-item label="委托状态" prop="intrustStatus" :show-message="false">
							<el-select style="width: 100%" placeholder="请选择" size="mini" :disabled="disableStatus" v-model="formData.intrustStatus">
								<el-option v-for="(item, index) in dictMap.podDeliveryFclStatus" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="预计派送时间" :show-message="false" prop="preLoadTime">
							<elDatePickerLimit size="mini" v-model="formData.preLoadTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
						</el-form-item>
						<el-form-item label="实际派送时间" prop="loadTime" :show-message="false">
							<elDatePickerLimit size="mini" v-model="formData.loadTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
						</el-form-item>
						<el-form-item label="签收时间" prop="signTime" :show-message="false">
							<elDatePickerLimit size="mini" v-model="formData.signTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
						</el-form-item>
						<el-form-item label="签收附件" prop="signFileName" :show-message="false">
							<upload-input v-model="formData.signFileName" @downloadFile="handleDownload" @handleView="handleView" @uploadFile="handleAdd" @delFile="delFile" />
						</el-form-item>
					</el-col> -->
				</el-row>
				<div class="row-tit between h32">
					<div class="ft14 tit"></div>
					<div class="row-tit-operate">
						<el-button size="mini" type="primary" @click="handleAddCargo">添加货品</el-button>
					</div>
				</div>
				<el-table ref="cargo" fit highlight-current-row style="width: 100%" class="outPlanBoxTable" :data="tableData" show-summary :summary-method="getSummaries">
					<el-table-column prop="hscode" label="HS code" align="center">
						<template slot-scope="scope">
							<el-select size="mini" v-model="scope.row.hscode" style="width: 100%" remote filterable clearable placeholder="请选择海关编号" @change="handleChangeHscode" :remote-method="val => queryCargoHscode(val)">
								<el-option v-for="(item, index) in hscodeOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="cname" label="中文品名" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入中文品名" v-model.number="scope.row.cname" clearable maxlength="128"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="ename" label="英文品名" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入英文品名" v-model.number="scope.row.ename" clearable maxlength="128"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="quantity" label="件数" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入件数" v-model.number="scope.row.quantity" clearable @blur="validateNum('quantity', scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="weight" label="毛重(KGS)" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入毛重" v-model="scope.row.weight" clearable @blur="validateVolumeWeight('weight', scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="volume" label="体积(CBM)" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入体积" v-model="scope.row.volume" clearable @blur="validateVolumeWeight('volume', scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="packageType" label="包装" align="center">
						<template slot-scope="scope">
							<el-select v-model="scope.row.packageType" size="mini" filterable placeholder="请选择包装">
								<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="files" width="200" label="附件名称">
						<template slot-scope="scope">
							<div class="si-file-wrap" v-for="(item, index) in scope.row.files" :key="index">
								<span :title="item.fileName" size="mini" @click="handleViewFile(item.fileNo, item.fileName)">{{ item.fileName }}</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="150" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini">删除</el-button>
								<el-button @click="handleFile(scope.row)" type="text" size="mini" :disabled="!scope.row.oid">上传</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</el-form>
			<div v-if="uploadPopShow">
				<FileUpload @close="uploadPopClose" />
			</div>
			<div v-if="addressPopShow">
				<AddressPop @close="addressPopClose"></AddressPop>
			</div>
			<div v-if="uploadShow">
				<FileUploadCargo :row="rowData" @close="cargoPopClose" />
			</div>
		</BaseDialog>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { getDomesticCity, cargoHscodeList, getForeignCity, fclTruckIntrustRegion } from '@/api/base'
import { quantityMixin } from '@/views/order/order/mixins/quantityMixin'
import UploadInput from '@/components/Base/upload/upload-input.vue'
import FileUpload from '../ltlDelivery/components/fileUploadNew.vue'
import AddressPop from '@/views/order/order/orderList/components/boxAddressPop'
import { supplierInfo } from '@/api/crm/supplier'
import { ltlReqno, ltlIntrustSave } from '@/api/order/podService/ltlDelivery'
import { updateOverseasInfo, overseasTips, abroadCompanyList, overseasCanModify } from '@/api/order/list'
import FileUploadCargo from '@/views/order/order/orderList/podService/warehousing/ltlDelivery/components/fileUploadCargo.vue'
const defaultFormData = {
	loadId: undefined,
	outPlanNo: '',
	loadContact: '',
	loadContactPhone: '',
	loadAddress: '',
	unloadContact: '',
	unloadContactPhone: '',
	unloadAddress: '',
	driverName: '',
	driverPhone: '',
	licensePlate: '',
	shipperCustid: '',
	shipperCustName: '',
	loadPlace: [],
	unloadPlace: [],
	unloadProvince: '',
	unloadCity: '',
	unloadDistrict: '',
	signFileNo: '',
	signFileName: '',
	cargoInfoList: [],
	remark: '',
	preLoadTime: '',
	loadTime: '',
	postcode: '',
	signTime: '',
	loadProvince: '',
	loadCity: '',
	signInfo: '',
	whName: '',

	intrustNo: '',
	intrustType: 'out',
	intrustType_cn: '出仓',
	supplierId: '',
	supplierName: '',
	supplierContact: '',
	supplierContactPhone: '',
	supplierPhone: '',
	mainRemark: '',
	// intrustStatus: 'init',
	consignee: '',
	consigneePhone: '',
	consigneeEmail: '',
	overseaAgentId: '',
	overseaAgentName: '',
	overseasCompanyCode: '',
	overseasCompanyName: ''
}
export default {
	mixins: [quantityMixin],
	data() {
		return {
			rowData: {},
			uploadShow: false,
			abroadCompanyList: [],
			showCasPlace: true,
			isChina: true,
			oQuery: this.$route.query,
			supplierList: [],
			overseaList: [],
			dialogConfig: {
				title: '新增派车',
				show: true,
				size: 'medium',
				width: '80%'
			},
			uploadPopShow: false,
			loadPlaceData: [],
			unloadPlaceData: [],
			cityProps: {
				value: 'cname',
				label: 'cname',
				children: 'children'
			},
			formData: Object.assign({}, defaultFormData),
			rules: {
				// loadContact: [{ required: true, message: ' ', trigger: 'change' }],
				// loadContactPhone: [{ required: true, message: ' ', trigger: 'change' }],
				loadPlace: [{ required: true, message: ' ', trigger: 'change' }],
				unloadPlace: [{ required: true, message: ' ', trigger: 'change' }],
				unloadContact: [{ required: true, message: ' ', trigger: 'change' }],
				unloadContactPhone: [{ required: true, message: ' ', trigger: 'change' }],
				consignee: [{ required: true, message: ' ', trigger: 'change' }],
				consigneePhone: [{ required: true, message: ' ', trigger: 'change' }],
				consigneeEmail: [{ required: false, message: ' ', trigger: 'change' }],
				unloadAddress: [{ required: true, message: '', trigger: 'blur' }]
			},
			tableData: [],
			hscodeOptions: [],
			quickInputModel: '',
			quickInputModelBox: '',
			addressPopShow: false,
			loadType: ''
		}
	},
	props: {
		activityType: {
			type: String,
			default: ''
		},
		addType: {
			type: String,
			default: ''
		},
		whName: {
			type: String,
			default: ''
		},
		outPlanNo: {
			type: String,
			default: ''
		}
	},
	created() {
		this.init()
		//获取国家城市级联框数据
		this.getLoadPlaceData()
		// 海外分公司
		this.getAbroadCompanyList()
		// 进口单非必填
		if (['ship_import_fcl', 'ship_import_lcl'].includes(this.orderInfo.businessType)) {
			this.rules.consigneeEmail = [{ required: false, message: '', trigger: 'blur' }]
		} else {
			this.rules.consigneeEmail = [{ required: true, message: '', trigger: 'blur' }]
		}
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles,
			serviceInfoList: state => state.order.serviceInfoList,
			orderInfo: state => state.order.orderInfoDataObj
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isEpricing() {
			return this.userEditRoles.includes('epricing')
		},
		isEcs() {
			return this.userEditRoles.includes('ecs')
		},
		isImportJoint() {
			return ['ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh'].includes(this.orderInfo.businessType) && ['jointList', 'whJointList'].includes(this.$route.query.source)
		},
		isBd() {
			let isBd = this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || (!this.isDoc && !this.isEpricing && !this.isEcs)
			if (this.orderInfo.businessType === 'ship_import_fcl' && this.ordDetRole === 'op') {
				isBd = false
			}
			return isBd || this.isJoint
		},
		isJoint() {
			let serviceInfo = this.serviceInfoList.find(item => item.serviceCode === 'pod_ltl_delivery')
			let isJoint = serviceInfo ? serviceInfo.isJoint : ''
			return isJoint === 'y' && !this.$route.query.jointNo ? true : false
		},
		viewState() {
			return this.oQuery.action === 'view' && !this.isOp
		},
		jointState() {
			return this.oQuery.jointNo ? true : false
		}
	},
	components: {
		BaseDialog,
		FileUpload,
		UploadInput,
		AddressPop,
		FileUploadCargo
	},
	methods: {
		cargoPopClose(action, data) {
			this.uploadShow = false
			if (action === 'Confirm') {
				console.log('🚀 ~ Confirm')
				console.log('🚀 ~ data', data)
				this.rowData.files = data
			}
		},
		// 上传附件
		handleFile(row) {
			console.log('🚀 ~ row', row)
			this.rowData = row
			this.uploadShow = true
		},
		handleViewFile(fileNo, fileName) {
			// let fileNo = row.fileNo.split(',')[index]
			// let fileName = row.fileName.split(',')[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
		getAbroadCompanyList() {
			// 海外分公司
			abroadCompanyList({ isAbroad: 'yes' }).then(res => {
				if (res.data) {
					this.abroadCompanyList = res.data
				}
			})
		},
		// 选择海外分公司
		changeOverseasCompany(val) {
			let item = this.abroadCompanyList.find(item => item.companyCode == val)
			if (item) this.formData.overseasCompanyName = item.companyName
		},

		handleSelectOverseaName(val) {
			console.log('🚀 ~ val', val)
			let item = this.overseaList.find(item => item.value == val)
			console.log('🚀 ~ item', item)
			console.log('🚀 ~ this.supplierList', this.supplierList)
			if (item) {
				this.formData.overseaAgentName = item.label
			}
		},
		overseaFilterMehod(val) {
			console.log('🚀 ~ val', val)
			if (this.formData.overseaAgentName && !val) {
				val = this.formData.overseaAgentName
			}
			this.getOverseaList(val)
		},
		overseaVisibleChange(val) {
			// if (val) {
			// 	this.getOverseaList()
			// }
		},
		getOverseaList(val = '') {
			this.$store
				.dispatch('dict/querySeviceOverseaList', {
					category: 'category',
					value: 'overseas_agent',
					queryString: val
				})
				.then(data => {
					this.overseaList = data.list
					this.overseaList.forEach(item => {
						Object.assign(item, {
							label: item.name,
							value: item.supplierId
						})
					})
				})
		},
		showAddressPop(val) {
			this.loadType = val
			this.addressPopShow = true
		},
		addressPopClose(action, value) {
			this.addressPopShow = false
			if (action === 'Confirm') {
				if (this.loadType === 'on') {
					// this.formData.loadPlace = [value.addressProvince, value.addressCity]
					this.formData.loadContact = value.contactName
					this.formData.loadContactPhone = value.contactPhone
					// this.formData.loadProvince = value.addressProvince
					// this.formData.loadCity = value.addressCity
					this.formData.loadAddress = value.addressDetail
					this.showCasPlace = false
					if (!value.isChina) {
						this.formData.loadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					} else {
						this.formData.loadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					}
					this.$nextTick(() => {
						this.showCasPlace = true
					})
					this.formData.loadCountry = value.addressCountry
					this.formData.loadProvince = value.addressProvince
					this.formData.loadCity = value.addressCity
					this.formData.loadDistrict = value.addressArea

					// // 国内省市区
					// if (this.isChina && value.isChina) {
					// 	this.formData.loadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					// 	this.formData.loadCountry = value.addressCountry
					// 	this.formData.loadProvince = value.addressProvince
					// 	this.formData.loadCity = value.addressCity
					// 	this.formData.loadDistrict = value.addressArea
					// }
					// // 国外国家到洲，有的数据只有国家没有洲
					// if (!this.isChina && !value.isChina) {
					// 	this.formData.loadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					// 	this.formData.loadCountry = value.addressCountry
					// 	this.formData.loadProvince = value.addressProvince
					// }
				}
				if (this.loadType === 'un') {
					// this.formData.unloadPlace = [value.addressProvince, value.addressCity]
					this.formData.consignee = value.contactName
					this.formData.consigneePhone = value.contactPhone
					// this.formData.unloadProvince = value.addressProvince
					// this.formData.unloadCity = value.addressCity
					this.formData.unloadAddress = value.addressDetail
					this.formData.postcode = value.postCode

					this.showCasPlace = false
					if (!value.isChina) {
						this.formData.unloadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					} else {
						this.formData.unloadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					}
					this.$nextTick(() => {
						this.showCasPlace = true
					})
					this.formData.unloadCountry = value.addressCountry
					this.formData.unloadProvince = value.addressProvince
					this.formData.unloadCity = value.addressCity
					this.formData.unloadDistrict = value.addressArea

					// // 国内省市区
					// if (this.isChina && value.isChina) {
					// 	this.formData.unloadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					// 	this.formData.unloadCountry = value.addressCountry
					// 	this.formData.unloadProvince = value.addressProvince
					// 	this.formData.unloadCity = value.addressCity
					// 	this.formData.unloadDistrict = value.addressArea
					// }
					// // 国外国家到洲，有的数据只有国家没有洲
					// if (!this.isChina && !value.isChina) {
					// 	this.formData.unloadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					// 	this.formData.unloadCountry = value.addressCountry
					// 	this.formData.unloadProvince = value.addressProvince
					// }
				}
			}
		},
		handleQuickInput(type) {
			if (this.quickInputModel || this.quickInputModelBox) {
				if (type === 'box') {
					// 装货
					let arr = this.quickInputModelBox.split('，')
					this.formData.loadContact = arr[0] || ''
					this.formData.loadContactPhone = arr[1] || ''
					this.formData.loadAddress = arr[2] || ''
				} else {
					// 卸货
					let arr = this.quickInputModel.split('，')
					this.formData.consignee = arr[0] || ''
					this.formData.consigneePhone = arr[1] || ''
					this.formData.unloadAddress = arr[2] || ''
				}
			}
		},

		handleSaveData(values) {
			console.log(values)
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_warehouse_bonded' ? 'Y' : 'N'
			let data = Object.assign({}, values, { isBonded })
			data.orderNo = this.oQuery.orderNo
			data.jointNo = this.oQuery.jointNo

			ltlIntrustSave(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '新增成功',
						duration: 1000,
						onClose: () => {
							this.close('Confirm')
						}
					})
				})
				.catch(err => {})
		},
		init() {
			this.handleGetIntrustNo()
			if (this.addType === 'out') {
				this.formData.intrustType = 'out'
				this.formData.intrustType_cn = '出仓'
			}
			if (this.addType === 'in') {
				this.formData.intrustType = 'in'
				this.formData.intrustType_cn = '进仓'
			}
			this.formData.whName = this.whName
			this.formData.outPlanNo = this.outPlanNo
		},
		handleGetIntrustNo() {
			this.isAdding = true
			ltlReqno().then(res => {
				let intrustNo = res.data.seqNo || ''
				this.formData.intrustNo = intrustNo

				this.formData.supplierId = this.orderInfo.transport ? this.orderInfo.transport.truckSupplierId : ''
				this.formData.supplierName = this.orderInfo.transport ? this.orderInfo.transport.truckSupplierName : ''
			})
		},
		createFilter(queryString) {
			return restaurant => {
				return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
			}
		},
		loadAll(data) {
			let arr = []
			for (let i = 0; i < data.length; i++) {
				let obj = {}
				obj.value = data[i].name || data[i].ename
				obj.mobileNo = data[i].mobileNo
				arr.push(obj)
			}
			this.contactInfo = arr
			return arr
		},
		handleSelectContact(item) {
			if (item.value) {
				for (let i = 0; i < this.contactInfo.length; i++) {
					if (item.value === this.contactInfo[i].value) {
						Object.assign(this.formData, {
							supplierContactPhone: this.contactInfo[i].mobileNo
						})
						return
					}
				}
			}
		},
		querySearchContact(queryString, cb) {
			let restaurants = this.restaurants
			let results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
			cb(results)
		},
		// 选择车队下拉，自动填充车队联系人，联系电话
		handleSelectSupplierName(val) {
			if (val) {
				let label = this.supplierList.filter(o => o.value === val)[0].label
				this.formData.supplierName = label
				supplierInfo({ supplierId: val }).then(res => {
					let { contact } = res.data
					Object.assign(this.formData, {
						supplierContact: contact && contact.length ? contact[0].name || contact[0].ename : '',
						supplierContactPhone: contact && contact.length ? contact[0].mobileNo : ''
					})
					this.restaurants = this.loadAll(contact)
				})
			} else {
				Object.assign(this.formData, {
					supplierId: '',
					supplierName: '',
					supplierContact: '',
					supplierContactPhone: ''
				})
			}
		},
		supplierFilterMehod(val) {
			this.getSupplierList(val)
		},
		supplierVisibleChange(val) {
			if (val && !this.formData.supplierId) {
				this.getSupplierList()
			}
		},
		getSupplierList(val = '') {
			this.$store
				.dispatch('dict/querySupplierList', {
					category: 'serviceCode',
					value: 'truck',
					queryString: val
				})
				.then(data => {
					this.supplierList = data.list.map(item => {
						return Object.assign(item, {
							label: item.name,
							value: item.supplierId ? Number(item.supplierId) : ''
						})
					})
				})
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		dialogCallback(action, done) {
			// 保存
			if (action === 'Confirm') {
				this.handleSave()
			} else {
				this.close('Cancel')
			}
		},
		uploadPopClose(action, val) {
			this.uploadPopShow = false
			if (action === 'Confirm') {
				this.formData.signFileNo = val.fileNo
				this.formData.signFileName = val.name
			}
		},
		delFile() {
			// 删除文件
			this.formData.signFileNo = ''
			this.formData.signFileName = ''
		},
		handleAdd() {
			// 上传
			this.uploadPopShow = true
		},
		// 附件下载
		handleDownload() {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: this.formData.signFileNo
					}
				})
				.then(res => {
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = this.formData.signFileName
					link.click()
				})
		},
		handleView() {
			this.$store.dispatch('order/previewFile', {
				fileNo: this.formData.signFileNo,
				fileName: this.formData.signFileName
			})
		},
		// 箱子校验
		validate(values) {
			let numberReg = /^[0-9]+$/
			let quantityValid = values.some(item => !numberReg.test(item.quantity))

			if (!values.length) {
				this.$message({ type: 'error', message: '请选择货品' })
				return false
			}
			if (values.some(item => !item.hscode)) {
				this.$message({ type: 'error', message: '请选择正确的HS code' })
				return false
			}
			if (values.some(item => !item.cname)) {
				this.$message({ type: 'error', message: '请输入中文品名' })
				return false
			}
			if (values.some(item => !item.ename)) {
				this.$message({ type: 'error', message: '请输入英文品名' })
				return false
			}
			if (values.some(item => !item.quantity || quantityValid)) {
				this.$message({ type: 'error', message: '请填写正确的货品件数' })
				return false
			}

			if (values.some(item => !item.packageType)) {
				this.$message({ type: 'error', message: '请选择包装' })
				return false
			}
			return true
		},
		// 删除货物箱
		handleDelete(row, sIndex) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					this.tableData = this.tableData.filter((item, index) => index !== sIndex)
				})
				.catch(err => {
					console.log('err')
				})
		},
		handleAddCargo() {
			this.tableData.push({})
		},
		handleChangeHscode(val) {
			if (!val) this.hscodeOptions = []
		},
		// hscode模糊查询
		queryCargoHscode(queryString) {
			queryString &&
				cargoHscodeList({ keyword: queryString }).then(response => {
					this.hscodeOptions = response.data.map(item => {
						return Object.assign(item, {
							label: item.cargoDesc,
							value: item.hscode
						})
					})
				})
		},
		getSummaries(param) {
			const { columns, data } = param
			const sums = []
			columns.forEach((column, index) => {
				if (index === 0) {
					return (sums[index] = '合计')
				}
				const values = data.map(item => Number(item[column.property]))
				if (column.property === 'quantity' || column.property === 'weight' || column.property === 'volume') {
					sums[index] = values.reduce((prev, curr) => {
						const value = Number(curr)
						if (!isNaN(value)) {
							return Number(prev + curr).fixed(3)
						} else {
							return Number(prev).fixed(3)
						}
					}, 0)
					sums[index]
				}
			})
			return sums // Number(value).fixed(3)
		},
		handleCancel() {
			this.$emit('cancel')
		},
		handleSave() {
			this.$refs.form.validate(valid => {
				if (valid) {
					if (!this.validate(this.tableData)) return
					let data = { ...this.formData }
					data.cargoInfoList = this.tableData
					let createItem = {
						intrustNo: data.intrustNo,
						supplierId: data.supplierId,
						supplierName: data.supplierName,
						supplierContact: data.supplierContact,
						supplierContactPhone: data.supplierContactPhone,
						supplierPhone: data.supplierPhone
						// remark: data.mainRemark,
						// intrustStatus: 'init'
					}
					if (this.addType === 'in') {
						createItem.intrustType = 'in'
						createItem.intrustType_cn = '进仓'
					}
					if (this.addType === 'out') {
						createItem.intrustType = 'out'
						createItem.intrustType_cn = '出仓'
					}
					createItem.loadInfoList = []
					createItem.loadInfoList[0] = data

					createItem.remark = data.remark
					createItem.overseaAgentId = data.overseaAgentId
					createItem.overseaAgentName = data.overseaAgentName
					createItem.overseasCompanyCode = data.overseasCompanyCode
					createItem.overseasCompanyName = data.overseasCompanyName
					// createItem.intrustStatus = data.intrustStatus
					// createItem.preLoadTime = data.preLoadTime
					// createItem.loadTime = data.loadTime

					console.log(createItem)
					// this.$emit('save', createItem)
					this.handleSaveData(createItem)
				} else {
					this.$message.error('请按要求填写数据')
					return false
				}
			})
		},
		//处理最后一级children为空数组问题
		handleChildren(data) {
			// 循环遍历json数据
			for (let i = 0; i < data.length; i++) {
				if (data[i].children.length < 1) {
					// children若为空数组，则将children设为undefined
					data[i].children = undefined
				} else {
					// children若不为空数组，则继续 递归调用 本方法
					this.handleChildren(data[i].children)
				}
			}
			return data
		},
		//获取数据
		async getLoadPlaceData() {
			// let res = await getForeignCity({})
			let res = await fclTruckIntrustRegion({})
			//处理最后一级children空数组
			this.loadPlaceData = this.handleChildren(res.data)
			this.unloadPlaceData = this.loadPlaceData
			this.isChina = this.loadPlaceData.some(ele => ele.cname === '中国')
		},
		//装货地点
		handleLoadChange(val) {
			this.formData.loadCountry = val[0] || ''
			this.formData.loadProvince = val[1] || ''
			this.formData.loadCity = val[2] || ''
			this.formData.loadDistrict = val[3] || ''

			// this.formData.loadProvince = val[0] || ''
			// this.formData.loadCity = val[1] || ''
			console.log('🚀 ~ this.loadPlace', this.formData.loadPlace)
		},
		//卸货地点
		handleUnloadChange(val) {
			this.formData.unloadCountry = val[0] || ''
			this.formData.unloadProvince = val[1] || ''
			this.formData.unloadCity = val[2] || ''
			this.formData.unloadDistrict = val[3] || ''

			// this.formData.unloadProvince = val[0] || ''
			// this.formData.unloadCity = val[1] || ''
			console.log('🚀 ~ this.unloadPlace', this.formData.unloadPlace)
		}
	}
}
</script>

<style lang="scss">
.ltlDelivery-detail {
	.si-file-wrap {
		width: 100%;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.si-file-wrap span {
		cursor: pointer;
		color: #1890ff;
	}
	.ltlDelivery-detail-body {
		.el-form-item__label {
			line-height: 20px;
		}
		.el-form-item__content {
			line-height: 20px;
		}
		.el-row {
			.el-form-item {
				margin-bottom: 4px;
			}
		}
		.row-tit {
			height: 50px !important;
			padding: 0 10px !important;
		}
		.box-address-flex {
			display: flex;
			display: flex;
			.box-address-input {
				flex: 1;
			}
			.box-address-btn {
				margin-left: 5px;
				width: 50px;
			}
		}
	}
}
.quick-class {
	display: flex;
	align-items: center;
	.title {
		width: 75px;
	}
}
</style>
