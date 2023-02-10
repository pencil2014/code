<template>
	<div class="detail-dialog">
		<el-dialog :before-close="handleCancel" v-loading="loading" :visible.sync="options.show" class="dialog" :title="dialogTitle" :modal-append-to-body="false" width="1100px">
			<el-tabs v-model="activeName">
				<el-tab-pane label="仓库信息" name="warehouseInfo">
					<el-form :inline="true" :model="formData" label-width="130px" ref="form" size="mini" style="margin-top: 10px">
						<el-form-item label="仓库名称：" prop="warehouseName" :rules="blurRule">
							<el-input v-model="formData.warehouseName" class="normalInput" :disabled="isDisabled || ['edit'].includes(options.type)" maxlength="64"></el-input>
						</el-form-item>
						<el-form-item label="仓库代码：" prop="warehouseCode" :rules="blurRule">
							<el-input v-model="formData.warehouseCode" class="normalInput" :disabled="isDisabled || ['edit'].includes(options.type)" maxlength="4"></el-input>
						</el-form-item>
						<el-form-item label="国家：" prop="countryCode" :rules="changeRule">
							<el-select v-model="formData.countryCode" class="normalInput" disabled>
								<el-option v-for="item in countryList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="省份：" prop="provinceCode" :rules="changeRule">
							<el-select v-model="formData.provinceCode" class="normalInput" :disabled="isDisabled" @change="changeProvince">
								<el-option v-for="item in provinceOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="城市：" prop="cityCode" :rules="changeRule">
							<el-select v-model="formData.cityCode" class="normalInput" @change="changeCity" :disabled="!formData.provinceCode || isDisabled">
								<el-option v-for="item in cityOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="区县：" prop="districtCountyCode" :rules="changeRule">
							<el-select v-model="formData.districtCountyCode" class="normalInput" @change="changeCounty" :disabled="!formData.cityCode || isDisabled">
								<el-option v-for="item in countyOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="详细地址：" prop="address" :rules="changeRule">
							<el-input v-model="formData.address" class="longInput" :disabled="isDisabled" maxlength="128"></el-input>
						</el-form-item>
						<el-form-item label="仓库座机：">
							<el-input v-model="formData.telephone" class="normalInput" :disabled="isDisabled" maxlength="20"></el-input>
						</el-form-item>
						<el-form-item label="仓库负责人：" prop="warehouseSupervisorId" :rules="changeRule">
							<el-select
								v-model="formData.warehouseSupervisorId"
								value-key="warehouseSupervisorId"
								clearable
								remote
								filterable
								:remote-method="str => getWarehouseSuperList(str, 'supervisor')"
								@visible-change="(show) => showWarehouseSuperList(show, 'supervisor')"
								@change="changeWarehouseSuperList"
								:disabled="isDisabled"
								class="normalInput"
							>
								<el-option v-for="(item, index) in warehouseSuperList" :key="item.employeeId + `${index}`" :label="item.cname || item.ename" :value="item.employeeId"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="仓库负责人电话：" prop="supervisorMobileNo" :rules="blurRule">
							<el-input v-model="formData.supervisorMobileNo" class="normalInput" :disabled="isDisabled"></el-input>
						</el-form-item>
						<el-form-item label="默认入仓费金额：">
							<el-input v-model="formData.inWarehousFeeAmt" type="number" min="0" maxlength="9" class="normalInput" :disabled="isDisabled"
                @keydown.native="e=>e.returnValue=(['e','E','-','+'].includes(e.key))?'':e.returnValue">
								<template slot="append">元</template>
							</el-input>
						</el-form-item>
						<el-form-item label="默认仓租费计费单位：" prop="storageFeeUnit" :rules="changeRule">
							<el-select v-model="formData.storageFeeUnit" class="normalInput" :disabled="isDisabled">
								<template v-for="item in dictMap['wmsBillingUnit']">
									<el-option v-if="item.value === 'm'" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</template>
							</el-select>
						</el-form-item>
						<el-form-item label="默认仓租单价：" prop="storageFeePrice" :rules="blurRule">
							<el-input v-model="formData.storageFeePrice" type="number" min="0" maxlength="9" class="normalInput" :disabled="isDisabled"
                @keydown.native="e=>e.returnValue=(['e','E','-','+'].includes(e.key))?'':e.returnValue">
								<template slot="append">元</template>
							</el-input>
						</el-form-item>
						<el-form-item label="免租金天数：">
							<el-input type="number" min="0" v-model="formData.rentFreeDays" class="normalInput" :disabled="isDisabled"></el-input>
						</el-form-item>
						<el-form-item label="租赁开始日期：" prop="leaseStartDate" :rules="changeRule">
							<el-date-picker v-model="formData.leaseStartDate" type="date" value-format="yyyy-MM-dd" class="normalInput" :disabled="isDisabled"> </el-date-picker>
						</el-form-item>
						<el-form-item label="租赁结束日期：" prop="leaseEndDate" :rules="changeRule">
							<el-date-picker v-model="formData.leaseEndDate" type="date" value-format="yyyy-MM-dd" class="normalInput" :disabled="isDisabled"> </el-date-picker>
						</el-form-item>
						<el-form-item label="营业开始日期：" prop="openingStartDate" :rules="changeRule">
							<el-date-picker v-model="formData.openingStartDate" type="date" value-format="yyyy-MM-dd" class="normalInput" :disabled="isDisabled"> </el-date-picker>
						</el-form-item>
						<el-form-item label="营业结束日期：">
							<el-date-picker v-model="formData.openingEndDate" type="date" value-format="yyyy-MM-dd" class="normalInput" :disabled="isDisabled"> </el-date-picker>
						</el-form-item>
						<el-card class="box-card">
							<div slot="header" class="clearfix">
								<div class="left-title">
									<p class="panel-title">仓库内部区域</p>
								</div>
								<div class="right-title">
									<el-button v-if="!isDisabled" size="mini" type="primary" @click="handleAdd('area')">新增 </el-button>
									<el-button v-if="areaShow" type="text" @click="areaShow = false"
										>收起
										<i class="el-icon-arrow-up el-icon--right"></i>
									</el-button>
									<el-button v-else type="text" @click="areaShow = true"
										>展开
										<i class="el-icon-arrow-down el-icon--right"></i>
									</el-button>
								</div>
							</div>
							<el-collapse-transition>
								<div v-show="areaShow" class="card-table-list">
									<vxe-table border resizable show-overflow ref="areaTable" size="mini" :data="formData.wmsWarehouseInsideZones"
                   :edit-config="{ trigger: 'manual', mode: 'row', autoClear: false }" :valid-config="{ showMessage: false }" align="center" empty-text=" " :edit-rules="areaRules">
										<vxe-column type="seq" width="80" title="序号"></vxe-column>
										<vxe-column field="areaNo" title="区域编号" :edit-render="{}" min-width="150">
											<template #edit="{ row }">
												<vxe-input v-model="row.areaNo" type="text" placeholder="请选择区域编号"></vxe-input>
											</template>
										</vxe-column>
										<vxe-column field="areaName" title="区域名称" :edit-render="{}" min-width="180">
											<template #edit="{ row }">
												<vxe-input v-model="row.areaName" type="text"></vxe-input>
											</template>
										</vxe-column>
										<vxe-column field="areaRemark" title="区域描述" :edit-render="{}" min-width="350">
											<template #edit="{ row }">
												<vxe-input v-model="row.areaRemark" type="text"></vxe-input>
											</template>
										</vxe-column>
										<vxe-column v-if="activeName === 'warehouseInfo' && !isDisabled" title="操作" width="100" fixed="right">
											<template #default="{ row, rowIndex }">
												<template v-if="$refs.areaTable.isActiveByRow(row)">
													<el-link type="primary" :underline="false" @click="saveRowEvent(row, 'areaTable')">保存</el-link>
												</template>
												<template v-else>
													<el-link type="warning" :underline="false" @click="editRowEvent(row, 'areaTable')">修改</el-link>
												</template>
												<el-link type="danger" :underline="false" @click="removeRowEvent(rowIndex, 'wmsWarehouseInsideZones')">删除</el-link>
											</template>
										</vxe-column>
									</vxe-table>
								</div>
							</el-collapse-transition>
						</el-card>
						<!-- <el-card class="box-card mt10">
							<div slot="header" class="clearfix">
								<div class="left-title">
									<p class="panel-title">理货员</p>
								</div>
								<div class="right-title">
									<el-button v-if="!isDisabled" size="mini" type="primary" @click="handleAdd('tally')">新增 </el-button>
									<el-button v-if="tallyShow" type="text" @click="tallyShow = false"
										>收起
										<i class="el-icon-arrow-up el-icon--right"></i>
									</el-button>
									<el-button v-else type="text" @click="tallyShow = true"
										>展开
										<i class="el-icon-arrow-down el-icon--right"></i>
									</el-button>
								</div>
							</div>
							<el-collapse-transition>
								<div v-show="tallyShow" class="card-table-list">
									<vxe-table border resizable show-overflow ref="tallyTable" size="mini" :data="formData.wmsWarehouseTallyMans"
                    :edit-config="{ trigger: 'manual', mode: 'row', autoClear: false }"
                    :valid-config="{ showMessage: false }" align="center" empty-text=" " :edit-rules="tallyRules">
										<vxe-column type="seq" width="80" title="序号"></vxe-column>
										<vxe-column field="tallyManId" title="姓名" :edit-render="{}" min-width="150">
											<template #default="{ row }">
												{{ row.tallyManName }}
											</template>
											<template #edit="{ row, rowIndex }">
												<el-select
													v-model="row.tallyManId"
													value-key="tallyManId"
													size="small"
													clearable
													remote
													filterable
													:remote-method="str => getWarehouseSuperList(str, 'tally', rowIndex)"
													@visible-change="(show) => showWarehouseSuperList(show, 'tally', rowIndex)"
													@change="v => changeTallyManName(v, row, rowIndex)"
													:disabled="isDisabled"
												>
													<el-option v-for="(item, index) in row.tallyManList" :key="item.employeeId + `${index}`" :label="item.cname || item.ename" :value="item.employeeId"></el-option>
												</el-select>
											</template>
										</vxe-column>
										<vxe-column field="billingPrice" title="绩效计费单价" :edit-render="{}" min-width="150">
											<template #edit="{ row }">
												<vxe-input v-model="row.billingPrice" type="text"></vxe-input>
											</template>
										</vxe-column>
										<vxe-column field="billingUnit" title="绩效计费单位" :edit-render="{}" min-width="150">
											<template #default="{ row }">
												{{ dictMapObj['wmsPerforBillingUnit'][row.billingUnit] }}
											</template>
											<template #edit="{ row }">
												<el-select size="small" v-model="row.billingUnit">
													<el-option v-for="item in dictMap['wmsPerforBillingUnit']" :key="item.value" :label="item.label" :value="item.value"> </el-option>
												</el-select>
											</template>
										</vxe-column>
										<vxe-column field="mobilePhone" title="电话号码" min-width="150"></vxe-column>
										<vxe-column field="email" title="邮箱" min-width="150"></vxe-column>
										<vxe-column field="entryDate" title="入职日期" min-width="150"></vxe-column>
										<vxe-column field="billingStartTime" title="绩效计费单价开始时间" :edit-render="{}" min-width="220">
											<template #edit="{ row, rowIndex }">
												<el-date-picker v-model="row.billingStartTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择日期" size="small" style="width: 190px" @change="(v) => changeBillingTime(v, rowIndex, 'start')"> </el-date-picker>
											</template>
										</vxe-column>
										<vxe-column field="billingEndTime" title="绩效计费单价结束时间" :edit-render="{}" min-width="220">
											<template #edit="{ row, rowIndex }">
												<el-date-picker v-model="row.billingEndTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" default-time="23:59:59" placeholder="选择日期" size="small" style="width: 190px" @change="(v) => changeBillingTime(v, rowIndex, 'end')"> </el-date-picker>
											</template>
										</vxe-column>
										<vxe-column v-if="activeName === 'warehouseInfo' && !isDisabled" title="操作" width="100" fixed="right">
											<template #default="{ row, rowIndex }">
												<template v-if="$refs.tallyTable.isActiveByRow(row)">
													<el-link type="primary" :underline="false" @click="saveRowEvent(row, 'tallyTable')">保存</el-link>
												</template>
												<template v-else>
													<el-link type="warning" :underline="false" @click="editRowEvent(row, 'tallyTable')">修改</el-link>
												</template>
												<el-link type="danger" :underline="false" @click="removeRowEvent(rowIndex, 'wmsWarehouseTallyMans')">删除</el-link>
											</template>
										</vxe-column>
									</vxe-table>
								</div>
							</el-collapse-transition>
						</el-card> -->
					</el-form>
				</el-tab-pane>
				<el-tab-pane label="叉车信息" name="forkliftInfo">
					<el-card class="box-card mt10">
						<div slot="header" class="clearfix">
							<div class="left-title">
								<p class="panel-title">叉车信息</p>
							</div>
							<div class="right-title">
								<el-button v-if="!isDisabled" size="mini" type="primary" @click="handleAdd('lifts')">新增</el-button>
								<el-button v-if="liftsShow" type="text" @click="liftsShow = false"
									>收起
									<i class="el-icon-arrow-up el-icon--right"></i>
								</el-button>
								<el-button v-else type="text" @click="liftsShow = true"
									>展开
									<i class="el-icon-arrow-down el-icon--right"></i>
								</el-button>
							</div>
						</div>
						<el-collapse-transition>
							<div v-show="liftsShow" class="card-table-list">
								<vxe-table border resizable show-overflow ref="liftsTable" fit size="mini" :data="formData.wmsWarehouseForklifts"
                  :edit-config="{ trigger: 'manual', mode: 'row', autoClear: false }"
                  :valid-config="{ showMessage: false }" align="center" empty-text=" " :edit-rules="liftsRules">
									<vxe-column type="seq" width="80" title="序号"></vxe-column>
									<vxe-column field="brand" title="叉车品牌" :edit-render="{}" min-width="150">
										<template #edit="{ row }">
											<vxe-input v-model="row.brand" type="text"></vxe-input>
										</template>
									</vxe-column>
									<vxe-column field="specification" title="叉车规格" :edit-render="{}" min-width="150">
										<template #edit="{ row }">
											<vxe-input v-model="row.specification" type="text"></vxe-input>
										</template>
									</vxe-column>
                  <vxe-column field="source" title="叉车来源" :edit-render="{}" min-width="150">
                    <template #default="{ row }">
											{{ dictMapObj['forkLiftSource'][row.source] }}
										</template>
										<template #edit="{ row }">
											<el-select size="small" v-model="row.source" @change="changeSource({row})">
												<el-option v-for="item in dictMap['forkLiftSource']" :key="item.value" :label="item.label" :value="item.value"> </el-option>
											</el-select>
										</template>
									</vxe-column>
									<vxe-column field="leaseCompany" title="租赁公司" :edit-render="{}" min-width="150">
										<template #edit="{ row }">
											<vxe-input v-model="row.leaseCompany" type="text"></vxe-input>
										</template>
									</vxe-column>
									<vxe-column field="leaseStartDate" title="租赁开始日期" :edit-render="{}" min-width="160">
										<template #edit="{ row }">
											<el-date-picker v-model="row.leaseStartDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" size="small" style="width: 140px"> </el-date-picker>
										</template>
									</vxe-column>
									<vxe-column field="leaseEndDate" title="租赁结束日期" :edit-render="{}" min-width="160">
										<template #edit="{ row }">
											<el-date-picker v-model="row.leaseEndDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" size="small" style="width: 140px"> </el-date-picker>
										</template>
									</vxe-column>
									<vxe-column field="expireState" title="是否到期提醒" :edit-render="{}" min-width="150">
										<template #default="{ row }">
											{{ dictMapObj['yesNo'][row.expireState] }}
										</template>
										<template #edit="{ row }">
											<el-select size="small" v-model="row.expireState">
												<el-option v-for="item in dictMap['yesNo']" :key="item.value" :label="item.label" :value="item.value"> </el-option>
											</el-select>
										</template>
									</vxe-column>
									<vxe-column v-if="activeName === 'forkliftInfo' && !isDisabled" title="操作" width="100" fixed="right">
										<template #default="{ row, rowIndex }">
											<template v-if="$refs.liftsTable.isActiveByRow(row)">
												<el-link type="primary" :underline="false" @click="saveRowEvent(row, 'liftsTable')">保存</el-link>
											</template>
											<template v-else>
												<el-link type="warning" :underline="false" @click="editRowEvent(row, 'liftsTable')">修改</el-link>
											</template>
											<el-link type="danger" :underline="false" @click="removeRowEvent(rowIndex, 'wmsWarehouseForklifts')">删除</el-link>
										</template>
									</vxe-column>
								</vxe-table>
							</div>
						</el-collapse-transition>
					</el-card>
				</el-tab-pane>
				<el-tab-pane label="同市异地费堆场" name="feeYardInfo">
					<el-card class="box-card mt10">
						<div slot="header" class="clearfix">
							<div class="left-title">
								<p class="panel-title">同市异地费堆场</p>
							</div>
							<div class="right-title">
								<el-button v-if="!isDisabled" size="mini" type="primary" @click="handleAdd('yard')">新增 </el-button>
								<el-button v-if="yardShow" type="text" @click="yardShow = false"
									>收起
									<i class="el-icon-arrow-up el-icon--right"></i>
								</el-button>
								<el-button v-else type="text" @click="yardShow = true"
									>展开
									<i class="el-icon-arrow-down el-icon--right"></i>
								</el-button>
							</div>
						</div>
						<el-collapse-transition>
							<div v-show="yardShow" class="card-table-list">
								<vxe-table border resizable show-overflow ref="yardTable" size="mini" :data="formData.warehouseDiffLocalYards"
                  :edit-config="{ trigger: 'manual', mode: 'row', autoClear: false }"
                  :valid-config="{ showMessage: false }" align="center" empty-text=" " :edit-rules="yardRules">
									<vxe-column type="seq" width="80" title="序号"></vxe-column>
									<vxe-column field="wharfYardId" title="码头堆场中文名" :edit-render="{}" min-width="150">
										<template #default="{ row }">
											{{ row.wharfYardName }}
										</template>
										<template #edit="{ row, rowIndex }">
											<el-select
												v-model="row.wharfYardId"
												value-key="wharfYardId"
												size="small"
												clearable
												remote
												filterable
												:remote-method="str => getWharfYardList(str, rowIndex)"
												@visible-change="s => showWharfYardList(s, rowIndex)"
												@change="v => changeWharfYard(v, row, rowIndex)"
												:disabled="isDisabled"
											>
												<el-option v-for="(item, index) in row.wharfYardList" :key="item.wharfYardId + `${index}`" :label="item.wharfYardName" :value="item.wharfYardId"></el-option>
											</el-select>
										</template>
									</vxe-column>
									<vxe-column field="cityName" title="城市" min-width="150"></vxe-column>
									<vxe-column field="wharfYardCode" title="码头堆场代码" min-width="150"></vxe-column>
									<vxe-column field="address" title="详细地址" min-width="180"></vxe-column>
									<vxe-column field="webUrl" title="码头网址" min-width="150"> </vxe-column>
									<vxe-column field="wharfYardType" title="内外堆场类型" min-width="150">
										<template #default="{ row }">
											{{ dictMapObj['wmsWharfYardType'][row.wharfYardType] }}
										</template>
									</vxe-column>
									<vxe-column v-if="!isDisabled && activeName === 'feeYardInfo'" title="操作" min-width="100" fixed="right">
										<template #default="{ row, rowIndex }">
											<template v-if="$refs.yardTable.isActiveByRow(row)">
												<el-link type="primary" :underline="false" @click="saveRowEvent(row, 'yardTable')">保存</el-link>
											</template>
											<template v-else>
												<el-link type="warning" :underline="false" @click="editRowEvent(row, 'yardTable')">修改</el-link>
											</template>
											<el-link type="danger" :underline="false" @click="removeRowEvent(rowIndex, 'warehouseDiffLocalYards')">删除</el-link>
										</template>
									</vxe-column>
								</vxe-table>
							</div>
						</el-collapse-transition>
					</el-card>
				</el-tab-pane>
			</el-tabs>
			<div class="dialog-footer" slot="footer">
				<el-button v-if="!isDisabled" @click="handleSubmit" size="mini" type="success">提交</el-button>
				<el-button @click="handleCancel" size="mini">取消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { updateWarehouseInfo, saveWarehouseInfo, getEmployeeList } from '@/api/wms/warehouse.js'
import { getDomesticCity } from '@/api/base'
import { mapGetters, mapState } from 'vuex'
import { yardQueryPage } from '@/api/wms.js'

const blurRule = { required: true, message: '此项必填', trigger: 'blur' }
const changeRule = { required: true, message: '此项必选', trigger: 'change' }
export default {
	props: {
		options: {
			type: Object,
			default: () => {}
		}
	},
	data() {
		return {
			loading: false,
			blurRule,
			changeRule,
			formData: {
				warehouseName: '',
				warehouseCode: '',
				countryName: '中国',
				countryCode: 'CN',
				provinceCode: '',
				provinceName: '',
				cityCode: '',
				cityName: '',
				districtCountyCode: '',
				districtCountyName: '',
				address: '',
				telephone: '',
				warehouseSupervisorId: '',
				warehouseSupervisorName: '',
				supervisorMobileNo: '',
				storageFeePrice: '',
				inWarehousFeeAmt: '',
				storageFeeUnit: '',
				leaseStartDate: '',
				leaseEndDate: '',
				openingStartDate: '',
				openingEndDate: '',
				rentFreeDays: 0,
				wmsWarehouseInsideZones: [],
				wmsWarehouseTallyMans: [],
				wmsWarehouseForklifts: [],
				warehouseDiffLocalYards: []
			},
			areaShow: true,
			tallyShow: true,
			liftsShow: true,
			yardShow: true,
			isDisabled: false,
			activeName: '',
			countryList: [
				//经确认，暂时只选中国
				{
					label: '中国',
					value: 'CN'
				}
			],
			provinceOptions: [{ label: '', value: '' }],
			cityOptions: [{ label: '', value: '' }],
			countyOptions: [{ label: '', value: '' }],
			warehouseSuperList: [],
      areaRules: {
        areaNo:  [{ required: true, message: '区域编号不能为空' }],
        areaName:  [{ required: true, message: '区域名称不能为空' }]
      },
			tallyRules: {
				tallyManId: [{ required: true, message: '姓名不能为空' }],
				mobilePhone: [{ required: true, message: '手机号码不能为空' }],
				email: [{ required: true, message: '邮箱不能为空' }],
				entryDate: [{ required: true, message: '入职日期不能为空' }],
				billingStartTime: [{ required: true, message: '绩效计费单价开始时间不能为空' }],
				billingPrice: [{ required: true, message: '绩效计费单价不能为空' }],
				billingUnit: [{ required: true, message: '绩效计费单位不能为空' }]
			},
			liftsRules: {
				specification: [{ required: true, message: '规格不能为空' }],
				// leaseCompany: [{ required: true, message: '租赁公司不能为空' }],
				// leaseStartDate: [{ required: true, message: '租赁开始日期不能为空' }],
				// leaseEndDate: [{ required: true, message: '租赁结束日期不能为空' }]
			},
			yardRules: {
				wharfYardId: [{ required: true, message: '码头堆场中文名不能为空' }]
			},
      dialogTitle: ""
		}
	},
	created() {
		this.getProvinceOrCity()
		if (['detail', 'edit'].includes(this.options.type)) {
			// this.formData = Object.assign({}, this.options.data)
			// 深拷贝一份数据 不影响仓库列表
			this.formData = JSON.parse(JSON.stringify(this.options.data))
      this.getProvinceOrCity('city', this.formData.provinceCode)
		}
		if (['detail'].includes(this.options.type)) {
			this.isDisabled = true
		}
    // this.dialogTitle = this.options.title
    if (this.options.activeName) {
			this.activeName = this.options.activeName
		}
	},
	computed: {
		...mapGetters(['dictMap', 'dictMapObj']),
    ...mapState({
      userInfo: (state) => state.user
    })
	},
	watch: {
		activeName(val) {
			if (val === 'feeYardInfo') {
				if (this.formData.warehouseDiffLocalYards && this.formData.warehouseDiffLocalYards.length) {
					this.formData.warehouseDiffLocalYards.forEach((item, index) => {
						this.getWharfYardList('', index, 'echo')
					})
				}
        if (this.options.type === 'add') {
          this.dialogTitle = "新增同市异地费堆场"
        } else if (this.options.type === 'edit') {
          this.dialogTitle = "修改同市异地费堆场"
        } else {
          this.dialogTitle = "查看同市异地费堆场"
        }
			} else if (val === 'warehouseInfo') {
        if (this.options.type === 'add') {
          this.dialogTitle = "新增仓库信息"
        } else if (this.options.type === 'edit') {
          this.dialogTitle = "修改仓库信息"
        } else {
          this.dialogTitle = "查看仓库信息"
        }
      } else if (val === 'forkliftInfo') {
        if (this.options.type === 'add') {
          this.dialogTitle = "新增叉车信息"
        } else if (this.options.type === 'edit') {
          this.dialogTitle = "修改叉车信息"
        } else {
          this.dialogTitle = "查看叉车信息"
        }
      }
		}
	},
	methods: {
    /**
     * @description: 获取指定时间前一秒的时间
     * @param {*} time
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-14 14:13:29
     */
    getBeforeSecond (time) {
      let start = new Date(time).getTime()
      let endTime = new Date(start- 1000)
      let Y = endTime.getFullYear() + '-';
      let M = (endTime.getMonth() + 1 < 10 ? '0' + (endTime.getMonth() + 1) : endTime.getMonth() + 1) + '-';
      let D = endTime.getDate() < 10 ? ('0' + endTime.getDate() + ' ') : endTime.getDate() + ' ';
      let h = endTime.getHours() < 10 ? ('0' + endTime.getHours() + ':') : endTime.getHours() + ':';
      let m = endTime.getMinutes() < 10 ? ('0' + endTime.getMinutes() + ':') : endTime.getMinutes() + ':';
      let s = endTime.getSeconds() < 10 ? ('0' + endTime.getSeconds()) : endTime.getSeconds(); 
      return Y + M + D + h + m + s
    },
    /**
     * @description: 切换理货员绩效时间时回调
     * @param {*} val
     * @param {*} rowIndex
     * @param {*} type
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-21 11:17:37
     */
    changeBillingTime (val, rowIndex, type) {
      // 当上一条结束时间为空时，自动将上一条结束时间置为当前开始时间的前一秒
      if (rowIndex > 0 && !this.formData.wmsWarehouseTallyMans[rowIndex-1].billingEndTime && type ==='start') {
        this.formData.wmsWarehouseTallyMans[rowIndex-1].billingEndTime = this.getBeforeSecond(val)
      }
    },
    /**
     * @description: 切换叉车来源回调
     * @param {*} val
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-21 11:18:35
     */
    changeSource ({ row }) {
      if (row.source !== 'lease') {
        row.leaseStartDate = ''
        row.leaseEndDate = ''
        row.leaseCompany = ''
      }
    },
		/**
		 * @description: 获取省份(或城市)数据
		 * @param {*} type city 城市数据 默认省份数据
		 * @param {*} code 省份code
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-22 14:22:21
		 */
		getProvinceOrCity(type, code) {
			let data = {}
			let options = []
			if (type === 'city') {
				data = {
					code
				}
			}
			getDomesticCity(data)
				.then(res => {
					options = (res.data || []).map(item => {
						return { ...item, label: item.cname || item.ename, value: item.code }
					})
					if (type === 'city') {
						this.cityOptions = [...options]
						// 组织区县下拉选项格式
            let find = this.cityOptions.find(item => item.code === this.formData.cityCode)
            let countyOptions = find.children || []
						this.countyOptions = (countyOptions || []).map(ele => {
							return { ...ele, label: ele.cname || ele.ename, value: ele.code }
						})
					} else {
						this.provinceOptions = [...options]
					}
				})
				.catch(() => {})
		},
		/**
		 * @description: 切换省份下拉框回调
		 * @param {*} val provinceCode
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-22 14:30:10
		 */
		changeProvince(val) {
			let province = this.provinceOptions.find(item => item.code === val)
			this.formData.provinceName = province?.label
			// 修改省份时 先清空城市区县
			this.formData.cityName = ''
			this.formData.cityCode = ''
			this.formData.districtCountyName = ''
			this.formData.districtCountyCode = ''
			this.getProvinceOrCity('city', val)
		},
		/**
		 * @description: 切换城市下拉框时回调
		 * @param {*} val cityCode
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-22 14:48:59
		 */
		changeCity(val) {
			let city = this.cityOptions.find(item => item.code === val)
			this.formData.cityName = city?.label
			this.formData.districtCountyName = ''
			this.formData.districtCountyCode = ''
			// 设置区下拉数据
			this.countyOptions = (city.children || []).map(ele => {
				return { ...ele, label: ele.cname || ele.ename, value: ele.code }
			})
		},
		/**
		 * @description: 切换区县回调
		 * @param {*} val
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-23 11:52:27
		 */
		changeCounty(val) {
			let county = this.countyOptions.find(item => item.code === val)
			this.formData.districtCountyName = county?.label
		},
		/**
		 * @description: 获取仓库负责人列表数据
		 * @param {*} str 输入框参数
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-22 15:19:15
		 */
		getWarehouseSuperList(str = '', type, index) {
			if (str === '') {
        if (type === 'supervisor') {
          str = this.formData.warehouseSupervisorName || ''
        } else {
          str = this.formData.wmsWarehouseTallyMans[index].tallyManName || ''
        }
			}
			let data = {
				name: str,
        compCode: JSON.parse(localStorage.getItem('userInfo')).compCode ||  this.userInfo.compCode
			}
			let list = []
			getEmployeeList(data)
				.then(({ code, data }) => {
					if (code === 0) {
						list = (data || []).map(item => {
							return { ...item, label: item.cname || item.ename, value: item.code }
						})
						if (type === 'supervisor') {
							this.warehouseSuperList = list
						} else {
							this.formData.wmsWarehouseTallyMans[index].tallyManList = list
						}
						this.$forceUpdate()
					}
				})
				.catch(() => {})
		},
		/**
		 * @description: 显示仓管负责人下拉框时回调
		 * @param {*} show 显示下拉框
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-22 15:52:29
		 */
		showWarehouseSuperList(show, type, index) {
			show && this.getWarehouseSuperList('', type, index)
		},
		/**
		 * @description: 切换仓管负责人时回调
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-22 15:53:53
		 */
		changeWarehouseSuperList(val) {
			let find = this.warehouseSuperList.find(item => item.employeeId === val)
			this.formData.warehouseSupervisorName = find?.label
			this.formData.supervisorMobileNo = find ? find.mobileNo || find.telephone : ''
		},
		/**
		 * @description: 切换理货员下拉框时回调
		 * @param {*} val
		 * @param {*} row
		 * @param {*} index
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-23 11:05:54
		 */
		changeTallyManName(val, row, index) {
			let find = this.formData.wmsWarehouseTallyMans[index].tallyManList.find(item => item.employeeId === val)
			row.tallyManName = find?.label
			row.mobilePhone = find ? find.mobileNo || find.telephone : ''
			row.email = find?.email
			row.entryDate = find?.joinDate
		},
		/**
		 * @description: 获取堆场列表信息
		 * @param {*} str
		 * @param {*} index
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-23 11:52:50
		 */
		getWharfYardList(str = '', index, type) {
			// if (str === '') {
			//   str = this.formData.warehouseDiffLocalYards[index].wharfYardName
			// }
			let data = {
				currPage: 1,
				pageSize: 30,
				query: []
			}
			if (str) {
				data.query.push({
					column: 'wharfYardName',
					type: 'like',
					value: str
				})
			}
			yardQueryPage(data)
				.then(({ code, data }) => {
					if (code === 0) {
						this.formData.warehouseDiffLocalYards[index].wharfYardList = data.list || []
						if (type === 'echo') {
							let find = this.formData.warehouseDiffLocalYards[index].wharfYardList.find(item => item.wharfYardId === this.formData.warehouseDiffLocalYards[index].wharfYardId)
							this.formData.warehouseDiffLocalYards[index].wharfYardName = find?.wharfYardName
							this.formData.warehouseDiffLocalYards[index].cityName = find?.cityName
							this.formData.warehouseDiffLocalYards[index].wharfYardCode = find?.wharfYardCode
							this.formData.warehouseDiffLocalYards[index].address = find?.address
							this.formData.warehouseDiffLocalYards[index].webUrl = find?.webUrl
							this.formData.warehouseDiffLocalYards[index].wharfYardType = find?.wharfYardType
						}
						this.$forceUpdate()
					}
				})
				.catch(() => {})
		},
		showWharfYardList(show, index) {
			show && this.getWharfYardList('', index)
		},
		changeWharfYard(val, row, index) {
			let find = this.formData.warehouseDiffLocalYards[index].wharfYardList.find(item => item.wharfYardId === val)
			row.wharfYardCode = find?.wharfYardCode
			row.wharfYardName = find?.wharfYardName
			row.cityName = find?.cityName
			row.address = find?.address
			row.webUrl = find?.webUrl
			row.wharfYardType = find?.wharfYardType
		},
		/**
		 * @description: 新增列表信息
		 * @param {*} type
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-19 15:38:49
		 */
		handleAdd(type) {
			let table = []
			if (type === 'tally') {
				this.formData.wmsWarehouseTallyMans.push({
					tallyManName: '',
					tallyManId: null,
					billingPrice: '',
					billingUnit: '',
					mobilePhone: '',
					email: '',
					entryDate: '',
					billingStartTime: '',
					billingEndTime: '',
					tallyManList: [],
					timeStamp: new Date().getTime()
				})
				table = this.formData.wmsWarehouseTallyMans
			} else if (type === 'area') {
				this.formData.wmsWarehouseInsideZones.push({
					areaNo: '',
					areaName: '',
					areaRemark: '',
					timeStamp: new Date().getTime()
				})
				table = this.formData.wmsWarehouseInsideZones
			} else if (type === 'lifts') {
				this.formData.wmsWarehouseForklifts.push({
					wmsWarehouseForkliftId: null,
					brand: '',
					specification: '',
          source: 'lease',
					leaseCompany: '',
					leaseStartDate: '',
					leaseEndDate: '',
					expireState: '',
					timeStamp: new Date().getTime()
				})
				table = this.formData.wmsWarehouseForklifts
			} else if (type === 'yard') {
				this.formData.warehouseDiffLocalYards.push({
					wharfYardId: null,
					wharfYardName: '',
					cityName: '',
					wharfYardCode: '',
					address: '',
					webUrl: '',
					wharfYardType: '',
					wharfYardList: [],
					timeStamp: new Date().getTime()
				})
				table = this.formData.warehouseDiffLocalYards
			}
			this.editRowEvent(table[table.length - 1], `${type}Table`)
		},
		/**
		 * @description: 保存行编辑
		 * @param {*} row
		 * @param {*} type
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-22 11:21:54
		 */
		async saveRowEvent(row, table) {
			const $table = this.$refs[table]
			const errMap = await $table.validate(true).catch(errMap => errMap)
			if (errMap) {
				return false
			} else {
				$table.clearActived()
			}
		},
		/**
		 * @description: 编辑列表数据
		 * @param {*} row
		 * @param {*} type
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-22 11:23:15
		 */
		editRowEvent(row, table) {
			const $table = this.$refs[table]
			$table.setActiveRow(row)
		},
		/**
		 * @description: 删除数据行
		 * @param {*} index 删除集合下标
		 * @param {*} list 要删除的集合数据
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-22 11:24:02
		 */
		removeRowEvent(index, list) {
			this.formData[`${list}`].splice(index, 1)
		},
		/**
		 * @description: 提交数据
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-17 11:28:53
		 */
		handleSubmit() {
			// 做数据校验
			this.$refs['form'].validate(valid => {
				if (valid) {
					// 日期校验
					if (new Date(this.formData.leaseStartDate) - new Date(this.formData.leaseEndDate) > 0) return this.$message.error('租赁开始日期不能晚于租赁结束日期')
					if (this.formData.openingEndDate && (new Date(this.formData.openingStartDate) - new Date(this.formData.openingEndDate) > 0)) return this.$message.error('营业开始日期不能晚于营业结束日期')
					if (!this.formData.wmsWarehouseInsideZones.length) {
            return this.$message.error('请填写仓库内部区域信息！')
          } else {
            // 校验区域必填信息
            this.validAreaInfo ()
          }
				} else {
					return this.$message.error('请将仓库信息必填内容填写完整！')
				}
			})
		},
    /**
     * @description: 校验内部区域信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-13 11:43:36
     */
    async validAreaInfo () {
      const $tallyTable = this.$refs.areaTable
			const errMap = await $tallyTable.validate(true).catch(errMap => errMap)
			if (errMap) {
				this.$message.error('内部区域信息校验不通过!')
			} else {
        // 有叉车信息的时候，要校验必填项
				if (this.formData.wmsWarehouseForklifts.length) {
					this.validLiftsInfo()
				} else {
					this.submitApi()
				}
        // if (!this.formData.wmsWarehouseTallyMans.length) {
        //   return this.$message.error('请填写理货员信息！')
        // } else {
        //   // 绩效计费单价校验
        //   if (this.formData.wmsWarehouseTallyMans.some(item => !/((^[1-9]\d*)|^0)(\.\d{0,2}){0,1}$/.test(item.billingPrice))) {
        //     return this.$message.error('绩效计费单价不符合规则')
        //   }
        //   this.validTallyInfo()
        // }
      }
    },
		/**
		 * @description: 校验理货员信息必填项
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-22 18:17:58
		 */
		async validTallyInfo() {
			const $tallyTable = this.$refs.tallyTable
			const errMap = await $tallyTable.validate(true).catch(errMap => errMap)
			if (errMap) {
				this.$message.error('理货员校验不通过!')
			} else {
        // 过滤出相同的理货员进行对比
        // 先判断有没有重复理货员
        let ids = this.formData.wmsWarehouseTallyMans.map(item => item.tallyManId)
        let uniqIds = [...new Set(ids)]
        let tallyManNames = []
        if (ids.length != uniqIds.length) {
          // 有重复，获取出重复的理货员信息 将重复的理货员进行时间对比 
          if (uniqIds.length) {
            uniqIds.forEach(id => {
              tallyManNames.push(this.formData.wmsWarehouseTallyMans.filter(item => item.tallyManId === id))
            })
          }
        }
        for (let i = 0; i < this.formData.wmsWarehouseTallyMans.length; i++) {
          const item = this.formData.wmsWarehouseTallyMans[i];
          if (item.billingEndTime && (new Date(item.billingStartTime) - new Date(item.billingEndTime) > 0)) {
            return this.$message.error(`第${i+1}条理货员信息的绩效计费单价开始日期不能晚于结束日期！`)
          }
          if (tallyManNames.length) {
            for (let k = 0; k < tallyManNames.length; k++) {
              const tallyManName = tallyManNames[k];
              if (tallyManName.length > 1) {
                for (let j = 0; j < tallyManName.length; j++) {
                  if (j > 0  && tallyManName[j].billingStartTime && tallyManName[j-1].billingEndTime && (new Date(tallyManName[j].billingStartTime) - new Date(tallyManName[j-1].billingEndTime) < 0)) {
                    return this.$message({
                      showClose: true,
                      message: `理货员${tallyManName[j].tallyManName}的绩效计费单价开始日期不能早于他上一条绩效计费单价结束日期！`,
                      type: 'error',
                      duration: 5000
                    });
                  }
                }
              }
            }
          }
        }
				// 有叉车信息的时候，要校验必填项
				if (this.formData.wmsWarehouseForklifts.length) {
					this.validLiftsInfo()
				} else {
					this.submitApi()
				}
			}
		},
		/**
		 * @description: 校验叉车必填项
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-25 14:07:45
		 */
		async validLiftsInfo() {
			const $tallyTable = this.$refs.liftsTable
			const errMap = await $tallyTable.validate(true).catch(errMap => errMap)
			if (errMap) {
				this.$message.error('叉车校验不通过!')
			} else {
         for (let i = 0; i < this.formData.wmsWarehouseForklifts.length; i++) {
          const item = this.formData.wmsWarehouseForklifts[i];
          // 叉车来源为租赁时，才校验租赁信息
          if (item.source === 'lease' && !(item.leaseStartDate && item.leaseEndDate && item.leaseCompany)) {
            return this.$message.error(`第${i+1}条信息的叉车来源为租赁时，租赁相关信息不能为空！`)
          }
          if (item.leaseStartDate && item.leaseEndDate && (new Date(item.leaseStartDate) - new Date(item.leaseEndDate) > 0)) {
            return this.$message.error(`第${i+1}条叉车信息的租赁开始日期不能晚于租赁结束日期！`)
          }
        }
				// 有堆场信息的时候，要校验必填项
				if (this.formData.warehouseDiffLocalYards.length) {
					this.validYardsInfo()
				} else {
					this.submitApi()
				}
			}
		},
		/**
		 * @description: 校验异地费堆场信息
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-09-02 10:12:02
		 */
		async validYardsInfo() {
			const $yardTable = this.$refs.yardTable
			const errMap = await $yardTable.validate(true).catch(errMap => errMap)
			if (errMap) {
				this.$message.error('同市异地费堆场信息不通过!')
			} else {
				this.submitApi()
			}
		},
		/**
		 * @description: 调用录入/修改仓库信息接口
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-22 20:15:21
		 */
		submitApi() {
			let data = JSON.parse(JSON.stringify(this.formData))
			data.storageFeePrice = Number(data.storageFeePrice)
			data.inWarehousFeeAmt = Number(data.inWarehousFeeAmt)
			data.rentFreeDays = Number(data.rentFreeDays)
			// if (data.wmsWarehouseTallyMans && data.wmsWarehouseTallyMans.length) {
			// 	data.wmsWarehouseTallyMans.forEach(item => {
			// 		this.$delete(item, 'tallyManList')
			// 		this.$delete(item, '_XID')
			// 		item.billingPrice = Number(item.billingPrice)
			// 	})
			// }
			if (data.warehouseDiffLocalYards && data.warehouseDiffLocalYards.length) {
				// 验证码头堆场重复
				let yardIds = data.warehouseDiffLocalYards.map(item => item.wharfYardId)
				let uniqYardIds = Array.from(new Set(yardIds))
				if (yardIds.length != uniqYardIds.length) return this.$message.error('码头堆场不能重复')
				data.warehouseDiffLocalYards.forEach(item => {
					this.$delete(item, 'wharfYardList')
					this.$delete(item, 'cityName')
					this.$delete(item, 'wharfYardCode')
					this.$delete(item, 'address')
					this.$delete(item, 'webUrl')
					this.$delete(item, 'wharfYardType')
					this.$delete(item, 'wharfYardName')
					this.$delete(item, '_XID')
					item.wmsWarehouseId = this.options.data.wmsWarehouseId || ''
				})
			}
			if (this.options.type === 'add') {
				this.saveWarehouseInfo(data)
			} else if (this.options.type === 'edit') {
				this.updateWarehouseInfo(data)
			}
		},
		/**
		 * @description: 新增仓库信息
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-19 14:12:12
		 */
		saveWarehouseInfo(data) {
			saveWarehouseInfo(data)
				.then(({ code }) => {
					if (code === 0) {
						this.$message.success('操作成功！')
						this.handleCancel()
						this.$emit('getData')
					}
				})
				.catch(() => {})
		},
		/**
		 * @description: 修改仓库信息
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-19 14:15:29
		 */
		updateWarehouseInfo(data) {
			updateWarehouseInfo(data)
				.then(({ code }) => {
					if (code === 0) {
						this.$message.success('操作成功！')
						this.handleCancel()
						this.$emit('getData')
					}
				})
				.catch(() => {})
		},
		/**
		 * @description: 关闭弹框
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-17 17:13:44
		 */
		handleCancel() {
			this.options.show = false
		}
	}
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
.detail-dialog {
  /deep/ .el-dialog {
    margin: 5vh auto 0 !important;
    .el-dialog__body {
      height: 515px;
      padding: 0 10px 10px;
      .normalInput {
        width: 210px;
      }
      .longInput {
        width: 560px;
      }
      .el-tabs__header {
        margin-bottom: 0;
      }
      .el-card__body {
        padding: 10px;
      }
    }
  }
}
.longInput {
	width: 440px;
}
/deep/ .el-form-item__label {
	padding: 0 !important;
}
</style>
