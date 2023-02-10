<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="changeSaveForm" :rules="rules" :model="changeSaveItem" label-position="right" label-width="120px" class="changeSave-form">
      <el-form-item label="状态" v-if="status">
        <div class="ft12" :class="['refuse', 'book_refuse'].includes(status) ? 'red' : ''">{{status | bkgStatusFilter}}</div>
      </el-form-item>
      <el-form-item label="拒绝原因" v-if="['refuse', 'book_refuse'].includes(status)">
        <div class="ft12">{{refuseReasonFilter()}}</div>
      </el-form-item>
      <el-form-item label="拒绝备注" v-if="['refuse', 'book_refuse'].includes(status)">
        <div class="ft12">{{changeSaveItem.refuseRemark}}</div>
      </el-form-item>
      <el-row>
        <el-col :span="24">
          <el-form-item label="修改类型" prop="changeType" required :show-message="false">
            <el-select v-model="changeSaveItem.changeType" size="mini" placeholder="请选择" @change="handleChangeType" style="width: 100%" :disabled="isView">
              <el-option v-for="item in changeTypeOptions" :label="item.label" :value="item.value" :key="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="!isBulkRo">
          <el-form-item label="是否已做柜" prop="changeHasCn" required :show-message="false">
            <el-radio-group v-model="changeSaveItem.changeHasCn" :disabled="isView">
              <el-radio label="y">是</el-radio>
              <el-radio label="n">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="!isBulkRo">
          <el-form-item label="柜号" prop="cnNoList" :required="changeSaveItem.changeHasCn === 'y'" :show-message="false">
            <el-popover placement="top"	width="200"	trigger="hover" class="port-ename" :disabled="!isView">
              <div class="port-popover">
                {{changeSaveItem.cnNoList.toString()}}
              </div>
              <el-select slot="reference" v-model="changeSaveItem.cnNoList" size="mini" multiple collapse-tags clearable placeholder="请选择" @change="handleChangeCn" style="width: 100%" :disabled="isView">
                <el-option v-for="item in cnList" :label="item" :value="item" :key="item"></el-option>
              </el-select>
            </el-popover>
          </el-form-item>
        </el-col>
        <template v-if="['PORT','SHIP_PORT'].includes(changeSaveItem.changeType)">
          <el-col :span="12" v-if="isIncludeFeeder || changeSaveItem.changeType !== 'SHIP'" class="flex-form-item">
            <el-form-item label="驳船收货地" prop="porPortCode" :show-message="false">
							<div class="port-flex-form">
								<div class="port-code">
									<el-select
										key="porPortCode"
										size="mini"
										v-model="changeSaveItem.porPortCode"
										filterable
										clearable
										:disabled="isView"
										style="width: 100%"
										placeholder="请输入"
										:filter-method="porPortFilterMehod"
										@visible-change="porPortVisibleChange"
										@change="handleChangePorPortCode"
									>
										<el-option v-for="item in porPortList" :key="item.value" :label="item.value" :value="item.value">
											<span>{{item.label}}</span>
										</el-option>
									</el-select>
								</div>
								<PortPopover :portItem="porPortItem"/>
							</div>
						</el-form-item>
          </el-col>
          <el-col :span="12" class="flex-form-item">
            <el-form-item label="大船起运港" prop="polPortCode" :show-message="false">
							<div class="port-flex-form">
								<div class="port-code">
									<el-select
										key="polPortCode"
										size="mini"
										v-model="changeSaveItem.polPortCode"
										filterable
										clearable
										:disabled="isView"
										style="width: 100%"
										placeholder="请输入"
										:filter-method="polPortFilterMehod"
										@visible-change="polPortVisibleChange"
										@change="handleChangePolPortCode"
									>
										<el-option v-for="item in polPortList" :key="item.value" :label="item.value" :value="item.value">
											<span>{{item.label}}</span>
										</el-option>
									</el-select>
								</div>
								<PortPopover :portItem="polPortItem"/>
							</div>
						</el-form-item>
          </el-col>
          <el-col :span="12" class="flex-form-item">
            <el-form-item label="中转港1" prop="transitPortCode" :show-message="false">
							<div class="port-flex-form">
								<div class="port-code">
									<el-select
										key="transitPortCode"
										size="mini"
										v-model="changeSaveItem.transitPortCode"
										filterable
										clearable
										:disabled="isView"
										style="width: 100%"
										placeholder="请输入"
										:filter-method="transitPortFilterMehod"
										@visible-change="transitPortVisibleChange"
										@change="handleChangeTransitPortCode"
									>
										<el-option v-for="item in transitPortList" :key="item.value" :label="item.value" :value="item.value">
											<span>{{item.label}}</span>
										</el-option>
									</el-select>
								</div>
								<PortPopover :portItem="transitPortItem"/>
								<i class="el-icon-circle-plus-outline" @click="handleAddTransitPort" v-if="!isView && (!transitPortTwoShow || !transitPortOneShow)"></i>
							</div>
						</el-form-item>
          </el-col>
          <el-col :span="12" class="flex-form-item" v-if="transitPortOneShow">
            <el-form-item label="中转港2" prop="transitPortCode1" :show-message="false">
							<div class="port-flex-form">
								<div class="port-code">
									<el-select
										key="transitPortCode1"
										size="mini"
										v-model="changeSaveItem.transitPortCode1"
										filterable
										clearable
										:disabled="isView"
										style="width: 100%"
										placeholder="请输入"
										:filter-method="transitPortFilterMehodOne"
										@visible-change="transitPortVisibleChangeOne"
										@change="handleChangeTransitPortCodeOne"
									>
										<el-option v-for="item in transitPortList1" :key="item.value" :label="item.value" :value="item.value">
											<span>{{item.label}}</span>
										</el-option>
									</el-select>
								</div>
								<PortPopover :portItem="transitPortItem1"/>
								<i class="el-icon-remove-outline" @click="handleDeleteOne" v-if="!isView"></i>
							</div>
						</el-form-item>
          </el-col>
          <el-col :span="12" class="flex-form-item" v-if="transitPortTwoShow">
            <el-form-item label="中转港3" prop="transitPortCode2" :show-message="false">
							<div class="port-flex-form">
								<div class="port-code">
									<el-select
										key="transitPortCode2"
										size="mini"
										v-model="changeSaveItem.transitPortCode2"
										filterable
										clearable
										:disabled="isView"
										style="width: 100%"
										placeholder="请输入"
										:filter-method="transitPortFilterMehodTwo"
										@visible-change="transitPortVisibleChangeTwo"
										@change="handleChangeTransitPortCodeTwo"
									>
										<el-option v-for="item in transitPortList2" :key="item.value" :label="item.value" :value="item.value">
											<span>{{item.label}}</span>
										</el-option>
									</el-select>
								</div>
								<PortPopover :portItem="transitPortItem2"/>
								<i class="el-icon-remove-outline" @click="handleDeleteTwo" v-if="!isView"></i>
							</div>
						</el-form-item>
          </el-col>
          <el-col :span="12" class="flex-form-item">
            <el-form-item label="卸货港" prop="unloadingPortCode" :show-message="false">
							<div class="port-flex-form">
								<div class="port-code">
									<el-select
										size="mini"
										v-model="changeSaveItem.unloadingPortCode"
										filterable
										clearable
										:disabled="isView"
										style="width: 100%"
										placeholder="请输入"
										:filter-method="unloadPortFilterMehod"
										@visible-change="unloadPortVisibleChange"
										@change="handleChangeUnloadPortCode"
									>
										<el-option v-for="item in unloadPortList" :key="item.value" :label="item.value" :value="item.value">
											<span>{{item.label}}</span>
										</el-option>
									</el-select>
								</div>
								<PortPopover :portItem="unloadPortItem"/>
							</div>
						</el-form-item>
          </el-col>
          <el-col :span="12" class="flex-form-item">
            <el-form-item label="目的地" prop="podPortCode" :show-message="false">
							<div class="port-flex-form">
								<div class="port-code">
									<el-select
										size="mini"
										v-model="changeSaveItem.podPortCode"
										filterable
										clearable
										:disabled="isView"
										style="width: 100%"
										placeholder="请输入"
										:filter-method="podPortFilterMehod"
										@visible-change="podPortVisibleChange"
										@change="handleChangePodPortCode"
									>
										<el-option v-for="item in podPortList" :key="item.value" :label="item.value" :value="item.value">
											<span>{{item.label}}</span>
										</el-option>
									</el-select>
								</div>
								<PortPopover :portItem="podPortItem"/>
							</div>
						</el-form-item>
          </el-col>
        </template>
        <el-col :span="12" v-if="isIncludeFeeder">
          <el-form-item label="驳船截关时间" prop="bargeCyCutOff" :show-message="false">
            <elDatePickerLimit size="mini"
              :disabled="isView"
              :field="'bargeCyCutOff'"
              v-model="changeSaveItem.bargeCyCutOff"
              type="date"
              style="width: 100%"
              clearable
              placeholder="请选择"
              value-format="yyyy-MM-dd" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="大船截关时间" prop="cyCutOff" :show-message="false">
            <elDatePickerLimit size="mini"
              :field="'cyCutOff'"
              :disabled="isView"
              v-model="changeSaveItem.cyCutOff"
              type="date"
              style="width: 100%"
              clearable
              placeholder="请选择"
              value-format="yyyy-MM-dd" />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="isIncludeFeeder">
          <el-form-item label="驳船预计开船时间" prop="bargeEtdTime" required :show-message="false">
            <elDatePickerLimit size="mini"
              :field="'bargeEtdTime'"
              :disabled="isView"
              v-model="changeSaveItem.bargeEtdTime"
              type="date"
              style="width: 100%"
              clearable
              placeholder="请选择"
              value-format="yyyy-MM-dd" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="大船预计开船时间" prop="etdTime" :show-message="false" class="vessel-time">
            <elDatePickerLimit size="mini"
              :field="'etdTime'"
              :disabled="isView"
              v-model="changeSaveItem.etdTime"
              type="date"
              style="width: 100%"
              clearable
              placeholder="请选择"
              value-format="yyyy-MM-dd" />
            <el-popover placement="top"	width="280"	trigger="click" class="vessel-time-popover">
              <Schedule :vesselTime="vesselTime"
                :etdTimeDisabled="isView"
                @updateVesselTime="updateVesselTime" />
              <el-button slot="reference" type="default" size="mini" @click="handleSearchVesselTime">查询</el-button>
            </el-popover>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="isIncludeFeeder">
          <el-form-item label="驳船船名" prop="bargeVessel">
            <el-autocomplete
              style="width: 100%"
              size="mini"
              clearable
              v-model="changeSaveItem.bargeVessel"
              :disabled="isView"
              :fetch-suggestions="(queryString, cb) => querySearchVessel(queryString, cb)"
              placeholder="请输入"
              :maxlength="128"
              @select="(value) => handleSelectVessel(value)"
              @clear="(value) => handleClearVessel(value)"
            ></el-autocomplete>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="大船船名" prop="vessel">
            <el-autocomplete
              style="width: 100%"
              size="mini"
              clearable
              v-model="changeSaveItem.vessel"
              :disabled="isView"
              :fetch-suggestions="(queryString, cb) => querySearchBookVessel(queryString, cb)"
              :trigger-on-focus="false"
              placeholder="请输入"
              :maxlength="128"
              @select="(value) => handleSelectBookVessel(value)"
              @clear="(value) => handleClearBookVessel(value)"
            ></el-autocomplete>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="isIncludeFeeder">
          <el-form-item label="驳船航次" prop="bargeVoyage">
            <el-autocomplete
              style="width: 100%"
              size="mini"
              clearable
              v-model="changeSaveItem.bargeVoyage"
              :disabled="isView"
              :fetch-suggestions="(queryString, cb) => querySearchVoyage(queryString, cb, changeSaveItem.bargeVessel)"
              placeholder="请输入"
              :maxlength="128"
              @select="(value) => handleSelectVoyage(value)"
              @clear="(value) => handleClearVoyage(value)"
            ></el-autocomplete>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="大船航次" prop="voyage">
            <el-autocomplete
              style="width: 100%"
              size="mini"
              clearable
              v-model="changeSaveItem.voyage"
              :disabled="isView"
              :fetch-suggestions="(queryString, cb) => querySearchBookVoyage(queryString, cb, changeSaveItem.vessel)"
              :trigger-on-focus="false"
              placeholder="请输入"
              :maxlength="128"
              @select="(value) => handleSelectBookVoyage(value)"
              @clear="(value) => handleClearBookVoyage(value)"
            ></el-autocomplete>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="['PORT','SHIP_PORT'].includes(changeSaveItem.changeType)">
          <el-form-item label="保函附件" prop="fileName" required :show-message="false">
            <template v-if="!isView">
              <el-upload
                v-model="changeSaveItem.fileName"
                ref="upload"
                drag
                class="upload-file-cont"
                action="#"
                :multiple="true"
                :auto-upload="false"
                :before-upload="getFile"
                :on-change="handleChangeFile"
                :on-remove="handleRemove"
                :http-request="handleImport"
                :file-list="fileList"
                :limit="5"
                :on-exceed="handleExceed"
                :disabled="!canSubmit"
              >
                <div class="file-upload">
                  <img class="file-upload-img" :src="require('@/assets/icon-upload.png')" />
                  <div class="file-upload__text">
                    <div class="txt">点击或将文件拖拽到这里导入</div>
                    <p class="info">支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
                  </div>
                </div>
              </el-upload>
              <el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
            </template>
            <div v-for="(item, index) in changeFileNameList" :key="'file'+index">
              <span class="file-name" @click="handleView(index)">{{item}}</span>
            </div>
          </el-form-item>
        </el-col>        
        <el-col :span="24">
          <el-form-item label="修改原因" prop="changeRemark" required :show-message="false">
            <el-input type="textarea" size="mini" :rows="4" placeholder="请输入" v-model="changeSaveItem.changeRemark" maxlength="512" show-word-limit :disabled="isView"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </BaseDialog>
</template>

<script>
import {getDictLabel} from '@/utils/tools'
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import PortPopover from './portPopover'
import { orderChangeSave, orderChangeInfo, orderContainerList } from '@/api/order/list'
import Schedule from './schedule'

const defaultChangeSaveQuery = {
  bargeEtdTime: "", // 驳船预计开船时间
  bargeCyCutOff: '',
  etdTime: '',  // 大船预计开船时间
  bargeVessel: '',  // 驳船船名
  bargeVoyage: "", // 驳船航次
  vessel: '',  // 大船船名
  voyage: '',  // 大船航次
  cyCutOff: "", // 大船截关时间
  refuseReason: '',
  refuseRemark: '',
  changeType: 'SHIP',
  changeHasCn: '',
  cnNoList: [],
  porPortCode: '',
  polPortCode: '',
  transitPortCode: '',
  transitPortCode1: '',
  transitPortCode2: '',
  podPortCode: '',  // 目的地
  unloadingPortCode: '',
  shipCarrierCode: '',  // 船公司
  changeRemark: '',
  fileName: ''
}

export default {
  filters: {
    bkgStatusFilter(status) {
      return getDictLabel('bkgStatus', status)
    }
  },
  data() {
    return {
      dialogConfig: {
        title: '改船改港',
        show: true,
        size: 'medium',
        width: "900px"
      },
      oQuery: this.$route.query,
      state: 'valid',
      changeInfo: {},
      changeSaveItem: Object.assign({}, defaultChangeSaveQuery),
      rules: {
        // etdTime: [{required: true, message: '请选择大船预计开船时间', trigger: 'change'}],
        // cyCutOff: [{required: true, message: '请选择大船截关时间', trigger: 'change'}],
        // podPortCode: [{required: true, message: '请选择目的地', trigger: 'change'}],
        // unloadingPortCode: [{required: true, message: '请选择目的地', trigger: 'change'}],
      },
      portList: [],
      unloadingPortList: [],
      carrierList: [],
      pickerOptions: {
        disabledDate(date) {
          //disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
          // return date.getTime() < Date.now() - 24 * 60 * 60 * 1000;
        }
      },
      isView: false, // 查看详情状态
      status: '',   // 审核状态
      changeTypeOptions: [
        {label: '改船', value: 'SHIP'},
        {label: '改港', value: 'PORT'},
        {label: '改船+改港', value: 'SHIP_PORT'}
      ],
      cnList: [],
      transitPortOneShow: false,
			transitPortTwoShow: false,
			porPortItem: {},
			polPortItem: {},
			unloadPortItem: {},
			podPortItem: {},
			transitPortItem: {},
			transitPortItem1: {},
			transitPortItem2: {},
			podPortList: [],
			unloadPortList: [],
			porPortList: [],
			polPortList: [],
			transitPortList: [],
			transitPortList1: [],
      transitPortList2: [],
      canSubmit: true, // 可提交标识
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			showProcess: false,
      processLength: 0,
      changeFileNameList: [],
      changeFileNoList: [],
      vesselTime: {},
      vesselTimeParam: {},
      interval: null
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
    isBulkRo: {
      type: Boolean,
      default: false
    }
  },
  created() {
    if (this.createItem.barge) {
      this.changeSaveItem.bargeEtdTime = this.createItem.barge.etdTime
      this.changeSaveItem.bargeVessel = this.createItem.barge.vessel
      this.changeSaveItem.bargeVoyage = this.createItem.barge.voyage
      this.changeSaveItem.porPortCode = this.createItem.barge.porPortCode
      this.changeSaveItem.bargeCyCutOff = this.createItem.barge.cyCutOff
    }
    this.changeSaveItem.etdTime = this.createItem.ship.etdTime
    this.changeSaveItem.cyCutOff = this.createItem.ship.cyCutOff
    this.changeSaveItem.vessel = this.createItem.ship.vessel
    this.changeSaveItem.voyage = this.createItem.ship.voyage
    this.changeSaveItem.polPortCode = this.createItem.ship.polPortCode
    this.changeSaveItem.transitPortCode = this.createItem.ship.transitPortCode
    this.changeSaveItem.transitPortCode1 = this.createItem.ship.transitPortCode1
    this.changeSaveItem.transitPortCode2 = this.createItem.ship.transitPortCode2
    this.changeSaveItem.podPortCode = this.createItem.ship.podPortCode
    // this.changeSaveItem.podPortName = this.createItem.ship.podPortName
    this.changeSaveItem.unloadingPortCode = this.createItem.ship.unloadingPortCode
    // this.changeSaveItem.unloadingPortName = this.createItem.ship.unloadingPortName
    this.changeSaveItem.shipCarrierCode = this.createItem.ship.shipCarrierCode
    this.getCnList()
    // this.getPortData()
    this.getChangeInfo()
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      orderNo: state => state.order.orderNo
    }),
    // 包含驳船
    isIncludeFeeder() {
      // 改船
      if (this.changeSaveItem.changeType === 'SHIP') {
        if (this.includeFeeder === 'y') {
          return true
        } else {
          return false
        }
      } else {  // 改港，改船+改港
        if (this.changeSaveItem.porPortCode) {
          return true
        } else {
          return false
        }
      }
		},
  },
  watch: {
  },
  components: {
    BaseDialog,
    PortPopover,
    Schedule
  },
  methods: {
    // 船期查询结果直接填入订单详情
    updateVesselTime(val, key) {
      this.changeSaveItem[key] = val
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
			this.changeSaveItem.transitPortCode1 = ''
			this.transitPortItem1 = {}
		},
		// 删除中转港3
		handleDeleteTwo() {
			this.transitPortTwoShow = false
			this.changeSaveItem.transitPortCode2 = ''
			this.transitPortItem2 = {}
		},
    // 获取柜号列表
    getCnList() {
      orderContainerList({
				orderNo: this.$route.query.orderNo
			}).then(res => {
        this.cnList = res.data.filter(item => item.cn).map(item => item.cn)
        this.cnList = new Set(this.cnList)
        this.cnList = Array.from(this.cnList)
        // console.log('this.cnList', this.cnList)
			})
    },
    handleChangeCn() {
    },
    handleChangeType(val) {
    },
    getPortData() {
      let portCodes = ''
      let portCodeArr = []
      let { polPortCode, podPortCode, transitPortCode, transitPortCode1, transitPortCode2, unloadingPortCode } = this.createItem.ship
      let porPortCode = ''
      porPortCode = this.createItem.barge ? this.createItem.barge.porPortCode : ''
      if (this.changeInfo) {
        porPortCode = this.changeInfo.porPortCode
        polPortCode = this.changeInfo.polPortCode
        podPortCode = this.changeInfo.podPortCode
        transitPortCode = this.changeInfo.transitPortCode
        transitPortCode1 = this.changeInfo.transitPortCode1
        transitPortCode2 = this.changeInfo.transitPortCode2
        unloadingPortCode = this.changeInfo.unloadingPortCode
      }
      this.transitPortOneShow = transitPortCode1 ? true : false
      this.transitPortTwoShow = transitPortCode2 ? true : false
      porPortCode ? portCodeArr.push(porPortCode) : ''
      polPortCode ? portCodeArr.push(polPortCode) : ''
      podPortCode ? portCodeArr.push(podPortCode) : ''
      transitPortCode ? portCodeArr.push(transitPortCode) : ''
      transitPortCode1 ? portCodeArr.push(transitPortCode1) : ''
      transitPortCode2 ? portCodeArr.push(transitPortCode2) : ''
      unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
      portCodes = portCodeArr.toString()
      // 港口数据反显
			if (portCodes) {
				// 设置中转港2，中转港3的显示隐藏
				this.transitPortOneShow = transitPortCode1 ? true : false
				this.transitPortTwoShow = transitPortCode2 ? true : false
				this.$store.dispatch('dict/basePortListByCodes', { portCodes }).then(data => {
					let initPortData = []
					//初始化下拉框数据
					initPortData = data
					this.podPortList = initPortData.filter(item => item.portCode === podPortCode)
					this.podPortItem = this.podPortList.find(item => item.portCode === podPortCode)
					this.unloadPortList = initPortData.filter(item => item.portCode === unloadingPortCode)
					this.unloadPortItem = this.unloadPortList.find(item => item.portCode === unloadingPortCode)
					if (porPortCode) {
						this.porPortList = initPortData.filter(item => item.portCode === porPortCode)
						this.porPortItem = this.porPortList.find(item => item.portCode === porPortCode)
					}
					this.polPortList = initPortData.filter(item => item.portCode === this.createItem.ship.polPortCode)
					this.polPortItem = this.polPortList.find(item => item.portCode === polPortCode)
					this.transitPortList = initPortData.filter(item => item.portCode === transitPortCode)
					this.transitPortItem = this.transitPortList.find(item => item.portCode === transitPortCode)
					this.transitPortList1 = initPortData.filter(item => item.portCode === transitPortCode1)
					this.transitPortItem1 = this.transitPortList1.find(item => item.portCode === transitPortCode1)
					console.log('this.porPortList', this.porPortList, this.porPortItem)
					this.transitPortList2 = initPortData.filter(item => item.portCode === transitPortCode2)
					this.transitPortItem2 = this.transitPortList2.find(item => item.portCode === transitPortCode2)
					// this.selectListData = initPortData.filter(item => this.createItem.ship.transitPortCode.includes(item.portCode))
				})
			} else {
				this.transitPortOneShow = false
				this.transitPortTwoShow = false
				// this.$store.dispatch('dict/basePortListByCodes', {}).then(data => {
				// 	//初始化下拉框数据
				// 	this.podPortList = JSON.parse(JSON.stringify(data))
				// 	this.unloadPortList = JSON.parse(JSON.stringify(data))
				// 	this.porPortList = JSON.parse(JSON.stringify(data))
				// 	this.polPortList = JSON.parse(JSON.stringify(data))
				// 	this.transitPortList = JSON.parse(JSON.stringify(data))
				// 	this.transitPortList1 = JSON.parse(JSON.stringify(data))
				// 	this.transitPortList2 = JSON.parse(JSON.stringify(data))
				// })
			}
    },
    refuseReasonFilter() {
      let result = ''
      let {refuseReason} = this.changeSaveItem
      let {orderAuditRefuseReason, bkgRefuseReason} = this.dictMap
      let refuseReasonOptions = orderAuditRefuseReason.concat(bkgRefuseReason)
      console.log('refuseReasonOptions', refuseReasonOptions)
      let findItem = refuseReasonOptions.find(item => item.value === refuseReason)
      result = findItem ? findItem.label : ''
      return result
    },
    // 获取做柜后改船信息
    getChangeInfo() {
      orderChangeInfo({orderNo: this.oQuery.orderNo}).then(res => {
        let {data} = res
        this.changeInfo = data
        if (!data || data === {}) {
          this.isView = false
          this.status = ''
        }else {
          for (let i in this.changeSaveItem) {
            this.changeSaveItem[i] = data[i]
            if (i === 'changeType') {
              this.changeSaveItem[i] = data[i] ? data[i] : 'SHIP'
            }
            if (i === 'changeHasCn') {
              this.changeSaveItem[i] = data[i] ? data[i].toLowerCase() : ''
            }
          }
          this.status = data.bkgStatus
          this.isView = !['refuse', 'book_refuse'].includes(data.bkgStatus)
          this.portList = [{label: data.podPortName, value: data.podPortCode}]
          this.unloadingPortList = [{label: data.unloadingPortName, value: data.unloadingPortCode}]
          this.changeFileNameList = data.changeFileNameList
          this.changeSaveItem.fileName = data.changeFileNameList
          this.changeFileNoList = data.changeFileNoList
        }
        this.getPortData()
      })
    },
    close(action) {
      this.$emit('close', action)
    },
    validate() {
      return true
    },
    carrierVisibleChange(val) {
      if (val) this.shipQuerySearch('')
    },
    carrierRemoteMethod(val) {
      this.shipQuerySearch(val)
    },
    // 船公司下拉列表自动补充的数据
    shipQuerySearch(queryString) {
      this.$store.dispatch('dict/baseShippingCarrierList', {name: queryString, state: 'valid'}).then(data => {
        this.carrierList = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
    },
    handleChangeShipCarrier(val) {
    },
    handleSelectShipCarrier(item) {
       Object.assign(this.changeSaveItem, {
        shipCarrierCode: item.key
      })
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
			// 变更商务岗位分配信息
			val && this.$emit('updatePricing', '大船起运港')
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
		},
		// 中转港
		transitPortVisibleChangeOne(val) {
		},
		transitPortFilterMehodOne(val) {
			this.transitPortSearchOne(val, 'port_of_basic', this.state)
		},
		handleChangeTransitPortCodeOne(val) {
			let findItem = this.transitPortList1.find(item => item.portCode === val)
			this.transitPortItem1 = findItem || {}
		},
		// 中转港
		transitPortVisibleChangeTwo(val) {
		},
		transitPortFilterMehodTwo(val) {
			this.transitPortSearchTwo(val, 'port_of_basic', this.state)
		},
		handleChangeTransitPortCodeTwo(val) {
			let findItem = this.transitPortList2.find(item => item.portCode === val)
			this.transitPortItem2 = findItem || {}
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
    },
    handleView(index) {
      let fileNo = this.changeFileNoList[index]
      let fileName = this.changeFileNameList[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        if (this.isView) {
          return this.close('Cancel')
        }
        console.log(this.$refs.changeSaveForm)
        this.$refs.changeSaveForm.validate((valid) => {
          if (valid) {
            if (!this.canSubmit) return
						this.handleImport()
            // this.handleChangeSave(done)
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    // 上传前钩子获取file名
		getFile(file) {
			this.file = file
			this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!this.sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
			}
			return this.sizeLimit
		},
		// 新添加文件替换之前添加的文件
		handleChangeFile(file, fileList) {
			// this.fileList = []
			// this.fileList.push(file)
			this.fileList = fileList
      this.file = file.raw
      this.changeSaveItem.fileName = fileList
      this.changeFileNameList = []
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
    },
    handleExceed(file, fileList) {
			this.$message.warning('最多上传5个附件!')
		},
		handleImport(done) {
			let params = {
				data: {...this.changeSaveItem, orderNo: this.$route.query.orderNo},
				fileName: this.fileList
      }
      // 改船改港清空掉驳船收货地后再切换回改船类型的，驳船收货地不能清空
      if (this.changeSaveItem.changeType === 'SHIP') {
        params.data.porPortCode = this.createItem.barge.porPortCode
      }
      delete params.data.fileName
      // 改船传参不包含驳船的，不传驳船字段
      if ((this.changeSaveItem.changeType === 'SHIP' && !this.isIncludeFeeder) || (['PORT', 'SHIP_PORT'].includes(this.changeSaveItem.changeType) && !this.changeSaveItem.porPortCode)) {
        delete params.data.porPortCode
        delete params.data.bargeEtdTime
        delete params.data.bargeCyCutOff
        delete params.data.bargeVessel
        delete params.data.bargeVoyage
      }
      // 散杂滚装的默认传n
      if (this.isBulkRo) {
        params.data.changeHasCn = 'n'
      }
			// this.$refs.upload.submit()
			if (this.sizeLimit) {
				this.canSubmit = false
				this.handleProgress()
				this.$store
					.dispatch('order/soUpload', {
						uri: '/order/shiporder/book/change/save',
						params: params
					})
					.then(res => {
						this.processLength = 100
						this.showProcess = false
						this.fileList = []
            this.canSubmit = true
            if (res.data.code === 0) {
              this.$message({
                type: 'success',
                message: '改船改港成功',
                duration: 1000,
                onClose: () => {
                  this.close('Confirm')
                }
              })
            }
          })
          .catch(err => {
            clearInterval(this.interval)
            this.interval = null
            this.processLength=0
            this.showProcess=false
            this.fileList = []
            this.canSubmit = true
          })
			}
		},
		// 上传进度条
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
    // // 做柜改船
    // handleChangeSave(done) {
    //   this.changeSaveItem.orderNo = this.oQuery.orderNo
    //   this.$confirm(`是否确定改船改港?`, "警告", {
    //     confirmButtonText: "确定",
    //     cancelButtonText: "取消",
    //     type: "warning"
    //   }).then(() => {
    //     return orderChangeSave(this.changeSaveItem)
    //   }).then(response => {
    //     this.$message({
    //       type: 'success',
    //       message: '改船成功',
    //       duration: 1000,
    //       onClose: () => {
    //         this.close('Confirm')
    //       }
    //     })
    //   }).catch((err) => {
    //   });

    //   // orderChangeSave(this.changeSaveItem).then(res => {
    //   //   this.$message({
    //   //     type: 'success',
    //   //     message: '改船成功',
    //   //     duration: 1000,
    //   //     onClose: () => {
    //   //       this.close('Confirm')
    //   //     }
    //   //   })
    //   // })
    // },
    // 船名输入建议
    querySearchVessel(queryString, cb) {
      this.$store.dispatch('dict/queryVessleList', {name: queryString}).then(data => {
        cb(data)
      })
    },
    handleSelectVessel(value) {
    },
    handleClearVessel(value) {
    },
    // 航次输入建议
    querySearchVoyage(queryString, cb, vessel) {
      this.$store.dispatch('dict/queryVoyageList', {name: queryString, vessel: vessel}).then(data => {
        cb(data)
      })
    },
    handleSelectVoyage(value) {
    },
    handleClearVoyage(value) {
    },
    // 大船船名输入建议
		querySearchBookVessel(queryString, cb) {
			this.$store.dispatch('dict/queryBookVessle', { 
				shipCarrierCode: this.changeSaveItem.shipCarrierCode,
				polPortCode: this.changeSaveItem.polPortCode,
				podPortCode: this.changeSaveItem.podPortCode,
				vessel: queryString
			}).then(data => {
				cb(data)
			})
		},
		handleSelectBookVessel(value) {},
		handleClearBookVessel(value) {},
		// 大船航次输入建议
		querySearchBookVoyage(queryString, cb, vessel) {
			this.$store.dispatch('dict/queryBookVoyage', { 
				shipCarrierCode: this.changeSaveItem.shipCarrierCode,
				polPortCode: this.changeSaveItem.polPortCode,
				podPortCode: this.changeSaveItem.podPortCode,
				voyage: queryString, 
				vessel: vessel
			}).then(data => {
				cb(data)
			})
		},
		handleSelectBookVoyage(value) {},
    handleClearBookVoyage(value) {},
    handleSearchVesselTime() {
      let { shipCarrierCode, polPortCode, podPortCode, vessel, voyage } = this.changeSaveItem
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
};
</script>

<style lang="scss" scoped>
.changeSave-form{
  ::v-deep .el-form-item{
    margin-bottom: 4px;
    &.vessel-time{
      .el-form-item__content{
        display: flex;
      }
    }
  }
  ::v-deep .el-form-item.is-error{
    .el-radio__inner, .el-upload-dragger{
      border: 1px solid #ff4949;
    }
  }
  ::v-deep .el-form-item__label {
    line-height: 20px;
    padding-right: 8px;
  }
  ::v-deep .el-form-item__content {
    line-height: 20px;
  }
  ::v-deep .el-col-12, ::v-deep .el-col-24 {
    padding-right: 20px;
  }
  .flex-form-item{
    // &.pr24{
    //   padding-right: 24px;
    // }
    .port-flex-form{
      position: relative;
      display: flex;
      flex-wrap: nowrap;
      justify-content: space-between;
      align-items: center;
      .el-icon-circle-plus-outline{
        position: absolute;
        right: -17px;
        cursor: pointer;
        font-size: 15px;
        &:hover{
          color: #1890ff;
        }
      }
      .el-icon-remove-outline{
        position: absolute;
        right: -17px;
        cursor: pointer;
        font-size: 15px;
        &:hover{
          color: #1890ff;
        }
      }
      .port-code{
        width: 32%;
        // margin-left: 5px;
        &:first-child{
          margin-left: 0;
        }
      }
    }
  }
  .file-name{
    color: #3e80f5;
    font-size: 12px;
    cursor: pointer;
  }
  .red{
    color: #ff4949;
  }
}
.port-popover{
	font-size: 12px;
}
</style>
