<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback" id="overseasFreight-addOffer">
    <div v-if="overseasFreightIsOnlyEnchars" style="color:red;font-size:14px;margin-bottom:8px">Tips: Please enter English, numbers and English symbols in the input box !</div>
    <el-form :inline="true" label-position="top">
      <el-row>
        <el-col :span="24">
          <el-form-item label="Template name">
            <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="offerTemplate" style="width:450px" placeholder="You can select an existing quote template and fill it directly and automatically" filterable clearable remote @change="changeTem" :remote-method="val => offerTemplateRemoteMethod(val)" @focus="offerTemplateRemoteMethod('')">
              <el-option v-for="(o, key) in tempList " :key="key" :label="o.tempName" :value="o.oid"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-divider></el-divider>
    <el-form ref="form" :rules="rules" :model="createItem" label-width="120px" :show-message="false" label-position="top">
      <div class="fee-btn-group">
        <el-button size="mini" @click="addFee" type="primary" style="float:right">Add</el-button>
      </div>
      <el-table :data="createItem.feeList" style="width: 100%;margin-bottom: 8px" :row-style="rowStyle">
        <el-table-column label="Sort" width="100" align="center">
          <template slot-scope="scope">
            <div class="del-btn">
              <i class="icon-sort el-icon-upload2" @click.prevent="handleToTop(scope.$index)" title="Sticky" />
              <i class="icon-sort el-icon-top" @click.prevent="handleUp(scope.$index)" title="Move up" />
              <i class="icon-sort el-icon-bottom" @click.prevent="handleBottom(scope.$index)" title="Move down" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Color" width="60" align="center">
          <template slot-scope="scope">
            <el-color-picker v-model="scope.row.color" show-alpha size="mini" :predefine="predefineColors"></el-color-picker>
          </template>
        </el-table-column>
        <el-table-column prop="feeCode" label="Fee name" align="center" width="200">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>Fee name</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`feeList.${scope.$index}.feeCode`" :rules="rules.feeCode" label-width="0">
              <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" size="mini" v-model="scope.row.feeCode" clearable filterable remote reserve-keyword placeholder="Fee English Name" :remote-method="(val)=>{ feeItemQuerySearch(val,scope.row.feeName)}" @focus="feeItemQuerySearch('',scope.row.feeName)" @change="((value) => feeItemChange(value, scope.$index))">
                <el-option v-for="item in feeItemList" :key="item.feeCode" :label="item.feeEnName" :value="item.feeCode">
                  <div>
                    <span>{{item.feeEnName}}</span>
                    <span v-if="item.feeName">({{item.feeName}})</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="feeQuantity" label="Number" align="center" width="100">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>Number</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`feeList.${scope.$index}.feeQuantity`" :rules="rules.feeQuantity" label-width="0">
              <el-input v-model="scope.row.feeQuantity" clearable size="mini" @input="checkNumFeeInput(scope.row.feeQuantity,'Number',scope.$index)" style="width:100%" placeholder="Please input"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="feePrice" label="unit Price" align="center" width="100">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>unit Price</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`feeList.${scope.$index}.feePrice`" :rules="rules.feePrice" label-width="0">
              <el-input v-model="scope.row.feePrice" clearable size="mini" @input="checkNumInputMaxVal(scope.row.feePrice,'unit Price',scope.$index)" style="width:100%" placeholder="Please input"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="feeCurrency" label="Currency" align="center">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>Currency</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`feeList.${scope.$index}.feeCurrency`" :rules="rules.feeCurrency" label-width="0">
              <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="scope.row.feeCurrency" placeholder="Please select" clearable>
                <el-option v-for="(o, key) in currencyOptions" :key="key" :label="o.code" :value="o.code">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="feeTotal" label="Total" align="center" width="150">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>Total</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`feeList.${scope.$index}.feeTotal`" :rules="rules.feeTotal" label-width="0">
              <el-input v-model="scope.row.feeTotal" disabled size="mini" maxlength="125" style="width:100%" placeholder="Please input"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="feeUnit" label="Billing unit" align="center">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>Billing unit</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`feeList.${scope.$index}.feeUnit`" :rules="rules.feeUnit" label-width="0">
              <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="scope.row.feeUnit" placeholder="Please select" filterable clearable>
                <el-option v-for="item in dictMap.feeUnit" :key="item.value" :label="item.en" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="Remarks" align="center">
          <template slot-scope="scope">
            <el-form-item label-width="0" :prop="`feeList.${scope.$index}.remark`" :rules="rules.remark">
              <el-input v-model="scope.row.remark" clearable size="mini" maxlength="500" style="width:100%" placeholder="Please input"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="Operation" width="120" align="center">
          <template slot-scope="scope">
            <div class="del-btn">
              <div v-if="createItem.feeList.length>1" class="del-icon" @click="delFee(scope)"></div>
              <el-button type="text" @click="handleCopy(scope.row)" style="padding:6px 6px">copy</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="fee-total">Fee Total：<span v-for="(el,index) in totalAmount" :key="index">{{el.value}} {{el.label}}<span v-if="totalAmount.length>0&&index<totalAmount.length-1">+</span></span></div>
      <el-row :gutter="20">
        <el-col :span="8" v-if="!['rail_export_fcl','rail_export_lcl'].includes(inquiryData.businessType)">
          <el-form-item label="Carrier">
            <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" style="width:100%" size="mini" clearable v-model="createItem.carrier" filterable remote reserve-keyword placeholder="Please select" :remote-method="val => carrierRemoteMethod(val,createItem.carrier)" @focus="carrierRemoteMethod('',createItem.carrier)">
              <el-option v-for="(item,i) in carrierArr" :key="i" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="isImport">
          <el-form-item label="T/T" prop="tT">
            <el-input v-model="createItem.tT" maxlength="128" clearable placeholder="Please enter the voyage">
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="isImport">
          <el-form-item label="ETD" prop="etd">
            <el-date-picker v-model="createItem.etd" size="mini" type="date" style="width: 100%" clearable placeholder="Please select a time" value-format="yyyy-MM-dd" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Validity Date Type" prop="validityDateType">
            <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" filterable size="mini" v-model="createItem.validityDateType" style="width: 100%" clearable placeholder="Validity Date Type">
              <el-option v-for="item in dictMap.validityDateType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Validity Date" prop="validity">
            <el-date-picker v-model="createItem.validity" size="mini" style="width:100%" type="daterange" range-separator="~" start-placeholder='Start Date' value-format="yyyy-MM-dd" end-placeholder='End date'>
            </el-date-picker>
          </el-form-item>
        </el-col>
        <!-- v-if="isExport" -->
        <el-col :span="8">
          <el-form-item label="Supplier" prop="category">
            <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" size="mini" v-model="createItem.category" @change="selectBkgAgentSupplier" :remote="categoryRemote" filterable clearable style="width: 100%" placeholder="Please select" :remote-method="val => bkgAgentSupplierRemoteMethod(val,createItem.categoryName)" @focus="bkgAgentSupplierRemoteMethod('',createItem.categoryName)">
              <el-option v-for="(item, index) in bkgAgentSupplierOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="POD (ADVISED)" prop="podRecommendCode" class="pod-advise-form-item">
            <span slot="label" class="pod-advise-label">
              <span v-if="!inquiryData.podCode" class="is-require-icon">*</span>
              POD (ADVISED)
              <el-tooltip class="pod-advise-text" effect="dark" content="You can enter the destination port recommended by the agent" placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
            </span>
            <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" size="mini" v-model="createItem.podRecommendCode" filterable remote clearable @change="changePodCode" style="width: 100%" placeholder="Please select POD (ADVISED)" :remote-method="(val)=>{ podPortFilterMehod(val,createItem.podRecommendCode)}" @visible-change="podPortFilterMehod('',createItem.podRecommendCode)">
              <el-option v-for="item in portList" :disabled="item.value===createItem.polCode" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="Annex" label-width="110px">
            <el-upload ref="upload" drag class="upload-file-cont" action="#" multiple :auto-upload="false" :before-upload="getFile" :on-change="handleChangeFile" :on-remove="handleRemove" :http-request="uploadFile" :file-list='fileList' :disabled="!canSubmit">
              <div class="file-upload">
                <img class="file-upload-img" :src="require('@/assets/icon-upload.png')" />
                <div class="file-upload__text">
                  <div class="txt">Click or drag and drop files here to import</div>
                  <p class="info">Support doc, docx, pdf, xls, xlsx, jpg, png, jpeg, bmp, tif, image, txt, zip, rar format files, and the file size is limited to 100M</p>
                </div>
              </div>
            </el-upload>
            <!-- 粘贴截图上传 -->
            <div class="clipboard-container">
              <div class="clipboard-upload">
                <div class="clipboard-left" @paste="handlePaste">
                  <img class="clipboard-left-img" src="@/assets/icon-upload.png" />
                  <div class="clipboard-left-text">
                    <div>
                      <input id="clipboard-input" placeholder="Click to press Ctrl+V to paste the screenshot here" />
                    </div>
                  </div>
                  <div class="clipboard-left-img-overlay" :style="{ left: overlayLeft + 'px', top: overlayTop + 'px' }"></div>
                </div>
                <div class="clipboard-preview-container">
                  <div id="clipboard-preview" @mouseenter="handleShowPreviewDelete($event, 'yes')" @mouseleave="handleShowPreviewDelete($event, 'no')" @dragover.prevent="() => {}" @dragleave.prevent="() => {}">
                    <div v-show="!pasted" class="clipboard-preview-text">Screenshot Preview</div>
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
        </el-col>
        <el-col :span="24">
          <el-form-item label="Remarks" prop="quoteRemark" label-width="110px">
            <el-input v-model="createItem.quoteRemark" type="textarea" maxlength="2048" :show-word-limit="true" placeholder="Other special requirements can be entered">
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index-en.vue'
import { parseTime, randomString } from '@/utils'
import { baseCurrencyList, baseFeeItemList } from '@/api/base'
import { mapState } from 'vuex'
import {
  checkQuantityWeightVolume,
  validateIntegerQuantity,
  validateOverseasFreightIsOnlyEnchars
} from '@/utils/validate'

import { unique, accAdd } from '@/utils/index'
import { enquiryTempList, enquiryTempDetail } from '@/api/charge'
let timer = null
export default {
  data() {
    return {
      predefineColors: [
        'rgba(140, 200, 124, 0.5)',
        'rgba(238, 175, 165, 0.5)',
        'rgba(155, 187, 242, 0.5)',
        'rgba(220, 168, 130, 0.5)',
        'rgba(229, 196, 117, 0.5)',
        'rgba(163, 146, 228, 0.5)'
      ],
      portList: [],
      //
      interval: null,
      pasted: false,
      previewImgSrc: '',
      // resFileList: [],
      fileListPaste: [],
      showPreviewDelete: false,
      fileUid: 1,
      overlayLeft: 0,
      overlayTop: 0,
      fileListPaste: [],
      // 图片粘贴
      defaultFileSize: 100, //文件默认不超过100M
      sizeLimit: true,
      file: '',
      fileList: [],
      fileData: '',
      processLength: 0,

      feeItemList: [], //费用下拉
      categoryRemote: true,
      tempList: [],
      offerTemplate: '', // 报价模板
      carrierArr: [],
      bkgAgentSupplierOptions: [],
      currencyOptions: [],
      dialogConfig: {
        title: 'Quote Reply',
        show: true,
        size: 'medium',
        width: '1300px'
      },
      createItem: {
        podRecommendName: '',
        podRecommendCode: '',
        quotationNumber: '', //方案编号
        feeList: [
          {
            quoteId: '',
            feeName: '',
            feeCode: '',
            feeUnit: '',
            feeQuantity: '1',
            feePrice: '',
            feeTotal: '',
            feeCurrency: 'USD',
            remark: '',
            color: ''
          }
        ],
        number20GP: '',
        number40GP: '',
        number40HC: '',
        validityDateType: 'ETA',
        validity: '', //有效期
        category: '', //供应商名称
        categoryName: '',
        quoteRemark: '',
        // 进口报价
        carrier: '', //预配船司
        etd: '', // 截止日期
        tT: '', // 航程
        startDateValidity: '',
        endDateValidity: ''
      },
      rules: {
        podRecommendCode: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        validityDateType: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        validity: [{ required: true, message: '请选择', trigger: 'change' }],
        carrier: [{ required: true, message: '请选择', trigger: 'change' }],
        tT: [
          { required: true, message: '请选择', trigger: 'change' },
          {
            validator: validateOverseasFreightIsOnlyEnchars(),
            trigger: 'change'
          }
        ],
        etd: [{ required: true, message: '请选择', trigger: 'change' }],
        feeQuantity: [
          { required: true, message: '请选择', trigger: 'change' },
          { validator: validateIntegerQuantity(), trigger: 'change' }
        ],
        feeCode: [{ required: true, message: '请选择', trigger: 'change' }],
        feeUnit: [{ required: true, message: '请选择', trigger: 'change' }],
        feeCurrency: [{ required: true, message: '请选择', trigger: 'change' }],
        feePrice: [
          { required: true, message: '请选择', trigger: 'change' },
          { validator: checkQuantityWeightVolume(), trigger: 'change' }
        ],
        feeTotal: [
          { required: true, message: '请选择', trigger: 'change' }
          // { validator: checkQuantityWeightVolume(999999999), trigger: 'change' }
        ],
        remark: [
          {
            validator: validateOverseasFreightIsOnlyEnchars(),
            trigger: 'change'
          }
        ],
        quoteRemark: [
          {
            validator: validateOverseasFreightIsOnlyEnchars(),
            trigger: 'change'
          }
        ]
      }
    }
  },
  props: {
    inquiryData: {
      type: Object,
      default() {
        return {}
      }
    },
    lastOfferData: {
      type: [Object, null],
      default() {
        return null
      }
    },
    canSubmit: {
      type: Boolean,
      default: true
    }
  },
  created() {
    this.getCurrencyList()
    let localStorageData = window.localStorage.getItem(
      `overseas-freight-offer-${this.$route.query.id}`
    )
    let localStorageFileData = window.localStorage.getItem(
      `overseas-freight-offer-file-${this.$route.query.id}`
    )
    if (localStorageData) {
      localStorageData = JSON.parse(localStorageData)
      localStorageFileData = JSON.parse(localStorageFileData) || []
    }
    if (localStorageData) {
      // 缓存的报价
      this.createItem = localStorageData
      this.fileList = localStorageFileData
      for (let i = 0; i < this.createItem.feeList.length; i++) {
        this.$set(this.createItem.feeList[i], 'oid', null)
        if (!this.createItem.feeList[i].color) {
          this.$set(this.createItem.feeList[i], 'color', '')
        }
      }
    } else if (this.lastOfferData) {
      this.createItem = JSON.parse(JSON.stringify(this.lastOfferData))
      for (let i = 0; i < this.createItem.feeList.length; i++) {
        this.$set(this.createItem.feeList[i], 'oid', null)
        if (!this.createItem.feeList[i].color) {
          this.$set(this.createItem.feeList[i], 'color', '')
        }
      }
      if (this.createItem.category) {
        this.createItem.category = this.createItem.category * 1
        this.bkgAgentSupplierRemoteMethod(this.createItem.categoryName)
      }

      if (this.lastOfferData.fileNameStr) {
        let fileNames = this.lastOfferData.fileNameStr.split(',')
        let fileNos = this.lastOfferData.fileNoStr.split(',')
        for (let i = 0; i < fileNames.length; i++) {
          this.fileList.push({
            name: fileNames[i],
            fileNo: fileNos[i]
          })
        }
      }
    }
    // 推荐目的港是否必填
    if (this.inquiryData.podCode) {
      this.rules.podRecommendCode = [
        { required: false, message: '请选择', trigger: 'change' }
      ]
    }
  },
  mounted() {},
  computed: {
    totalAmount() {
      let arr = []
      for (let i = 0; i < this.createItem.feeList.length; i++) {
        if (
          this.createItem.feeList[i].feeTotal &&
          this.createItem.feeList[i].feeCurrency
        ) {
          if (
            !arr.find(
              (el) => el.label == this.createItem.feeList[i].feeCurrency
            )
          ) {
            arr.push({
              value: this.createItem.feeList[i].feeTotal,
              label: this.createItem.feeList[i].feeCurrency
            })
          } else {
            let index = arr.findIndex(
              (el) => el.label == this.createItem.feeList[i].feeCurrency
            )
            arr[index].value = accAdd(
              arr[index].value,
              this.createItem.feeList[i].feeTotal
            )
          }
        }
      }
      return arr
    },
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      overseasFreightIsOnlyEnchars: (state) =>
        state.charge.overseasFreightIsOnlyEnchars
    }),
    isExport() {
      if (
        [
          'ship_export_fcl',
          'ship_export_lcl',
          'air_export',
          'rail_export_fcl',
          'rail_export_lcl',
          'ship_bulk_ro'
        ].includes(this.inquiryData.businessType)
      ) {
        return true
      }
    },
    isImport() {
      if (
        ['ship_import_fcl', 'ship_import_lcl', 'air_import'].includes(
          this.inquiryData.businessType
        )
      ) {
        return true
      }
    }
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    changePodCode(val) {
      if (val) {
        let item = this.portList.find((el) => el.value === val)
        if (
          ['air_export', 'air_import'].includes(this.inquiryData.businessType)
        ) {
          this.createItem.podRecommendName = `${item.portCode} (${item.ename}-${item.cname})`
        } else if (
          [
            'ship_export_fcl',
            'ship_export_lcl',
            'ship_import_fcl',
            'ship_import_lcl',
            'ship_bulk_ro'
          ].includes(this.inquiryData.businessType)
        ) {
          this.createItem.podRecommendName = item.label
        } else if (
          ['rail_export_fcl', 'rail_export_lcl'].includes(
            this.inquiryData.businessType
          )
        ) {
          this.createItem.podRecommendName = item.label
        }
      } else {
        this.createItem.podRecommendName = ''
      }
    },
    podPortFilterMehod(el, code) {
      // 推荐目的港
      this.portSearch(el, 'valid', code)
    },
    // 空运港口
    portSearch(portName, state, code) {
      let params = {}
      if (code && !portName) {
        // 有选中值&&搜索条件不是空
        params = { portName: '', portCodes: code, state: state }
      } else {
        params = { portName: portName, portCodes: '', state: state }
      }
      if (
        [
          'ship_export_fcl',
          'ship_export_lcl',
          'ship_import_fcl',
          'ship_import_lcl',
          'ship_bulk_ro'
        ].includes(this.inquiryData.businessType)
      ) {
        this.$store
          .dispatch('dict/basePortList', {
            queryString: portName || code,
            portAttribute: 'port_of_basic',
            state: 'valid'
          })
          .then((data) => {
            let portList = data.map((ele) => {
              return Object.assign(ele, {
                label: ele.value,
                value: ele.key
              })
            })
            this.portList = [...portList]
          })
      } else if (
        ['air_export', 'air_import'].includes(this.inquiryData.businessType)
      ) {
        this.$store.dispatch('dict/airportList', params).then((data) => {
          let portList = data.map((ele) => {
            return Object.assign(ele, {
              value: ele.portCode,
              label: ele.portCode // `${ele.portCode} (${ele.ename}-${ele.cname})`
            })
          })
          this.portList = [...portList]
        })
      } else if (
        ['rail_export_fcl', 'rail_export_lcl'].includes(
          this.inquiryData.businessType
        )
      ) {
        let queryValue = portName
        if (code && !portName) {
          // 有选中值&&搜索条件不是空
          queryValue = code
        }
        this.$store
          .dispatch('dict/baseRailPortList', { portName: queryValue })
          .then((data) => {
            this.portList = data
          })
      }
    },
    rowStyle({ row, rowIndex }) {
      let stylejson = {
        backgroundColor: row.color || '#fff'
      }
      return stylejson
    },
    toggleFile(id) {
      let images = this.$el.querySelectorAll('#clipboard-preview img')
      images.forEach((image, index) => {
        image.className = ''
        let fileUid = image.getAttribute('file-uid')
        if (fileUid == id) {
          image.className = 'active'
          let file = this.fileListPaste.find((file) => file.fileUid == id)
          this.setFileActive(file)
        }
      })
    },
    deleteFile() {
      let preview = this.$el.querySelector('#clipboard-preview')
      let images = this.$el.querySelectorAll('#clipboard-preview img')
      try {
        images.forEach((image) => {
          let className = image.className
          if (className.includes('active')) {
            let fileUid = image.getAttribute('file-uid')
            preview.removeChild(image)
            let index1 = this.fileListPaste.findIndex(
              (file) => file.fileUid == fileUid
            )
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
    handleShowPreviewDelete(event, val) {
      if (val === 'yes') {
        this.showPreviewDelete = true
      } else {
        this.showPreviewDelete = false
      }
    },
    handlePaste(event) {
      const items = (event.clipboardData || window.clipboardData).items
      let file = null
      if (!items || items.length === 0) {
        this.$message.error(
          'No paste content or current browser does not support paste operation'
        ) // 当前浏览器不支持本地
        return
      }
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          file = items[i].getAsFile()
          break
        }
      }
      if (!file) {
        this.$message.error('Paste content other than pictures')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        let preview = this.$el.querySelector('#clipboard-preview') // 使用$el可防止一个页面有多个该组件导致获取元素混乱
        this.pasted = true
        let images = this.$el.querySelectorAll('#clipboard-preview img')
        images.forEach((image) => (image.className = ''))
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
    setFileActive(file) {
      this.fileListPaste.forEach((file) => {
        file.active = false
      })
      file.active = true
      this.$forceUpdate()
    },
    uploadFile(file) {
      this.fileData.append('fileName', file.file)
    },
    // 移除文件
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    // 新添加文件替换之前添加的文件
    handleChangeFile(file, fileList) {
      this.fileList = fileList
    },
    // 上传前钩子获取file名
    getFile(file) {
      this.file = file
      this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!this.sizeLimit) {
        this.$message.error(
          `Upload file size exceeds ${this.defaultFileSize}M limit`
        )
      }
      if (this.file.name.indexOf(',') != -1) {
        this.$message.error(`File names cannot contain English commas`)
        this.sizeLimit = false
      }
      return this.sizeLimit
    },
    feeItemChange(value, index) {
      var item = this.feeItemList.find((el) => el.feeCode === value)
      if (item) {
        this.$set(this.createItem.feeList[index], 'feeName', item.feeEnName)
        this.$set(this.createItem.feeList[index], 'feeUnit', item.feeUnit)
      } else {
        this.$set(this.createItem.feeList[index], 'feeName', '')
      }
    },
    // 费用代码下拉列表自动补充的数据
    feeItemQuerySearch(queryString, name) {
      let val = queryString || name
      // if (!val) return
      baseFeeItemList(val).then((response) => {
        this.feeItemList = response.data
      })
    },
    handleCopy(row) {
      let data = { ...row }
      let n1 = data.feeQuantity
      let n2 = data.feePrice
      let total = ''
      let reg1 = /^([1-9][0-9]*)$/
      let reg2 = /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
      if (n1 && n2) {
        if (reg1.test(n1) && n1 <= 999999 && reg2.test(n2) && n2 <= 999999) {
          total = Number(n1 * n2).fixed(3)
          data.feeTotal = total
        }
      }
      this.createItem.feeList.push(data)
    },
    handleToTop(index) {
      if (index === 0) return
      let item = this.createItem.feeList.splice(index, 1)
      this.createItem.feeList.splice(0, 0, item[0])
    },
    handleUp(index) {
      if (index === 0) return
      let item = this.createItem.feeList.splice(index, 1)
      this.createItem.feeList.splice(index - 1, 0, item[0])
    },
    handleBottom(index) {
      let item = this.createItem.feeList.splice(index, 1)
      this.createItem.feeList.splice(index + 1, 0, item[0])
    },
    changeTem(val) {
      // 选择报价模板
      if (val) {
        this.categoryRemote = false
        enquiryTempDetail({
          oid: val
        }).then((res) => {
          if (
            !res.data.feeList[0].feeTotal &&
            res.data.feeList[0].feeTotal != 0
          ) {
            this.$message.error(
              'The selected template format has expired, we recommend using the newly created quote template!'
            )
            // this.offerTemplate=''
            return
          }
          this.createItem = JSON.parse(JSON.stringify(res.data))
          this.fileList = []
          if (this.createItem.fileNameStr) {
            let fileNames = this.createItem.fileNameStr.split(',')
            let fileNos = this.createItem.fileNoStr.split(',')
            for (let i = 0; i < fileNames.length; i++) {
              this.fileList.push({
                name: fileNames[i],
                fileNo: fileNos[i]
              })
            }
          }
          delete this.createItem.oid
          for (let i = 0; i < this.createItem.feeList.length; i++) {
            this.$set(this.createItem.feeList[i], 'oid', null)
            if (!this.createItem.feeList[i].color) {
              this.$set(this.createItem.feeList[i], 'color', '')
            }
          }
          if (this.createItem.startDateValidity) {
            this.createItem.validity = [
              this.createItem.startDateValidity,
              this.createItem.endDateValidity
            ]
          } else {
            this.createItem.validity = []
          }
          if (this.createItem.category) {
            this.$set(this.createItem, 'category', this.createItem.category * 1)
            this.bkgAgentSupplierOptions = [
              {
                value: this.createItem.category,
                label: this.createItem.categoryName
              }
            ]
          }
        })
      }
    },
    getTotal(n1, n2) {
      let total = 0
      let reg1 = /^([1-9][0-9]*)$/
      let reg2 = /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
      if (n1 && n2) {
        if (reg1.test(n1) && n1 <= 999999 && reg2.test(n2) && n2 <= 999999) {
          return Number(total).fixed(3)
        }
      }

      return ''
    },
    addFee() {
      this.createItem.feeList.push({
        quoteId: '',
        feeName: '',
        feeCode: '',
        feeUnit: '',
        feeQuantity: '1',
        feePrice: '',
        feeTotal: '',
        feeCurrency: 'USD',
        remark: '',
        color: ''
      })
    },
    delFee(scope) {
      this.createItem.feeList.splice(scope.$index, 1)
    },
    offerTemplateRemoteMethod(val) {
      let params = {
        ascColumns: [],
        columns: [],
        currPage: 1,
        descColumns: ['createdTime'],
        pageSize: 50,
        query: [
          { column: 'state', type: 'eq', value: 'valid' },
          {
            column: 'businessType',
            type: 'eq',
            value: this.inquiryData.businessType
          }
        ]
      }
      if (val) {
        params.query.push({ column: 'tempName', type: 'like', value: val })
      }
      this.getEnquiryTempList(params)
    },
    getEnquiryTempList(params) {
      enquiryTempList(params).then((res) => {
        if (res.data && res.data.list) {
          this.tempList = res.data.list
        } else {
          this.tempList = []
        }
      })
    },
    checkNumFeeInput(value, type, index) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg = /^([1-9][0-9]*)$/
        if (!value) {
        } else if (!reg.test(value) || value > 999999) {
          let lastStr = value.substr(value.length - 1, 1)
          if (isNaN(value)) {
            this.$message({
              message: `${type}can only be entered as a positive integer`,
              type: 'error',
              duration: 2000
            })
          } else if (value > 999999) {
            this.$message({
              message: `${type}can only be entered as a positive integer`,
              type: 'error',
              duration: 2000
            })
          } else if (lastStr !== '.') {
            this.$message({
              message: `${type}can only be entered as a positive integer`,
              type: 'error',
              duration: 2000
            })
          }
        }
        let n1 = this.createItem.feeList[index].feeQuantity
        let n2 = this.createItem.feeList[index].feePrice
        let total = ''
        let reg1 = /^([1-9][0-9]*)$/
        let reg2 =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
        if (n1 && n2) {
          if (reg1.test(n1) && n1 <= 999999 && reg2.test(n2) && n2 <= 999999) {
            total = Number(n1 * n2).fixed(3)
          }
        }
        this.$set(this.createItem.feeList[index], 'feeTotal', total)
        if (total > 999999999) {
          this.$message.error('Total cannot exceed 9999999999')
        }
      }, 100)
    },
    checkNumInputMaxVal(value, type, index) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
        if (!value) {
        } else if (!reg.test(value) || value > 999999) {
          let lastStr = value.substr(value.length - 1, 1)
          if (isNaN(value)) {
            this.$message({
              message: `${type}Please enter a number not exceeding 999999, with a maximum of 3 decimal places`,
              type: 'error',
              duration: 2000
            })
          } else if (value > 999999) {
            this.$message({
              message: `${type}Please enter a number not exceeding 999999, with a maximum of 3 decimal places`,
              type: 'error',
              duration: 2000
            })
          } else if (lastStr !== '.') {
            this.$message({
              message: `${type}Please enter a number not exceeding 999999, with a maximum of 3 decimal places`,
              type: 'error',
              duration: 2000
            })
          }
        }
        let n1 = this.createItem.feeList[index].feeQuantity
        let n2 = this.createItem.feeList[index].feePrice
        let total = ''
        let reg1 = /^([1-9][0-9]*)$/
        let reg2 =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
        if (n1 && n2) {
          if (reg1.test(n1) && n1 <= 999999 && reg2.test(n2) && n2 <= 999999) {
            total = Number(n1 * n2).fixed(3)
          }
        }
        this.$set(this.createItem.feeList[index], 'feeTotal', total)
        // if (total > 999999999) {
        //   this.$message.error('Total 不能超过999999999')
        // }
      }, 100)
    },
    carrierRemoteMethod(el, value) {
      // 远程搜索航空公司
      if (
        [
          'ship_export_fcl',
          'ship_export_lcl',
          'ship_import_fcl',
          'ship_import_lcl',
          'ship_bulk_ro'
        ].includes(this.inquiryData.businessType)
      ) {
        this.$store
          .dispatch('dict/baseShippingCarrierList', {
            name: value && !el ? value : el,
            state: 'valid'
          })
          .then((data) => {
            this.carrierArr = data
          })
      } else if (
        ['air_export', 'air_import'].includes(this.inquiryData.businessType)
      ) {
        this.$store
          .dispatch('dict/aircarrierList', {
            carrierName: value && !el ? value : el
          })
          .then((data) => {
            let list = data
              .map((ele) => {
                return Object.assign(ele, {
                  value: ele.itat,
                  label: ele.itat
                })
              })
              .filter((el) => el.itat)
            this.carrierArr = unique([...list], 'value')
          })
      }
    },
    delRemark(index) {
      this.createItem.remarkInfo.splice(index, 1)
    },
    addRemark() {
      this.createItem.remarkInfo.push({
        remark: ''
      })
    },
    bkgAgentSupplierRemoteMethod(queryString, name) {
      this.categoryRemote = true
      this.getSupplierList(queryString, name)
    },
    // 获取订舱代理
    getSupplierList(queryString, name) {
      let queryValue = ''
      if (name && !queryString) {
        // 有选中值&&搜索条件不是空
        queryValue = name
      } else {
        queryValue = queryString
      }
      this.$store
        .dispatch('dict/queryAllSupplierList', {
          queryString: queryValue
        })
        .then((data) => {
          if (data.list && data.list.length) {
            this.bkgAgentSupplierOptions = data.list.map((ele) => {
              return Object.assign(ele, {
                label: ele.name,
                value: ele.supplierId ? Number(ele.supplierId) : ''
              })
            })
          } else {
            this.bkgAgentSupplierOptions = []
          }
        })
    },
    selectBkgAgentSupplier(val) {
      // 反选订舱代理name
      if (!val) {
        this.createItem.categoryName = ''
      } else {
        this.createItem.categoryName = this.bkgAgentSupplierOptions.find(
          (e) => val == e.value
        ).label
      }
    },
    // 币别下拉列表自动补充的数据
    getCurrencyList() {
      baseCurrencyList('', 'valid', '').then((response) => {
        this.currencyOptions = response.data
      })
    },
    delExtraBedData(index) {
      this.createItem.extraBedData.splice(index, 1)
    },
    addExtraBedData() {
      this.createItem.extraBedData.push({
        hsCode: '',
        commodity: '',
        hscodeOptions: []
      })
    },
    close(action, value) {
      this.$emit('close', action, value)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.form.validate((valid) => {
          if (valid && this.canSubmit) {
            window.localStorage.removeItem(
              `overseas-freight-offer-${this.$route.query.id}`
            )
            window.localStorage.removeItem(
              `overseas-freight-offer-file-${this.$route.query.id}`
            )
            this.fileData = new FormData()
            this.$refs.upload.submit()
            if (this.fileListPaste && this.fileListPaste.length) {
              for (let i = 0; i < this.fileListPaste.length; i++) {
                this.fileData.append('fileName', this.fileListPaste[i])
              }
            }
            let params = {
              businessType: this.inquiryData.businessType,
              enquiryId: this.$route.query.id,
              quotationNumber: this.inquiryData.quotationNumber,
              carrier: this.createItem.carrier,
              etd: this.createItem.etd,
              tT: this.createItem.tT,
              feeList: this.createItem.feeList,
              number20GP: this.createItem.number20GP,
              number40GP: this.createItem.number40GP,
              number40HC: this.createItem.number40HC,
              category: this.createItem.category,
              categoryName: this.createItem.categoryName,
              quoteRemark: this.createItem.quoteRemark,
              podRecommendCode: this.createItem.podRecommendCode,
              podRecommendName: this.createItem.podRecommendName,
              validityDateType: this.createItem.validityDateType
            }

            let fileArr = this.fileList.filter((el) => el.fileNo)
            if (fileArr.length) {
              let otherFileNo = []
              let otherFileName = []
              for (let i = 0; i < fileArr.length; i++) {
                otherFileNo.push(fileArr[i].fileNo)
                otherFileName.push(fileArr[i].name)
              }
              params.fileNoStr = otherFileNo.join(',')
              params.fileNameStr = otherFileName.join(',')
            } else {
              params.fileNoStr = ''
              params.fileNameStr = ''
            }
            if (this.createItem.validity && this.createItem.validity.length) {
              params.startDateValidity = this.createItem.validity[0]
              params.endDateValidity = this.createItem.validity[1]
            }
            let paramsData = {
              data: params,
              fromSystem: 'web_H5',
              toSystem: 'mng_base_server',
              reqId: randomString(),
              reqTime: parseTime(new Date().getTime())
            }
            this.fileData.append('jsonData', JSON.stringify(paramsData))
            if (this.sizeLimit) {
              this.close('Confirm', this.fileData)
            }
            // this.close('Confirm', this.createItem)
          } else {
            this.$msgErrClose('Please fill in the fields in the red box as required!')
            console.log('error submit!!')
            return false
          }
        })
      } else {
        window.localStorage.setItem(
          `overseas-freight-offer-${this.$route.query.id}`,
          JSON.stringify(this.createItem)
        )
        let fileArr = this.fileList.filter((el) => el.fileNo)
        if (fileArr.length) {
          // 文件
          window.localStorage.setItem(
            `overseas-freight-offer-file-${this.$route.query.id}`,
            JSON.stringify(fileArr)
          )
        }
        this.close('Cancel')
      }
    }
  }
}
</script>

<style lang="scss">
#overseasFreight-addOffer {
  .fee-total {
    padding-left: 8px;
    margin-bottom: 12px;
    color: #409eff;
  }
  .pod-advise-form-item {
    .el-form-item__label:before {
      display: none;
    }
  }

  .pod-advise-label {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .is-require-icon {
      content: '*';
      color: #ff4949;
      margin-right: 4px;
    }
    .pod-advise-text {
      margin-left: 2px;
      cursor: pointer;
    }
    .pod-advise-text:hover {
      color: #3e80f5;
    }
  }
  .del-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    .del-icon {
      height: 20px;
      width: 20px;
      background: url('../../../../../assets/icon_del.png') center center
        no-repeat;
      background-size: cover;
      cursor: pointer;
    }
  }
  .el-form-item {
    margin-bottom: 4px;
  }
  .fee-btn-group {
    overflow: hidden;
    margin-bottom: 4px;
  }
  .red {
    padding: 0 20px;
  }
  .el-divider--horizontal {
    margin: 10px 0;
  }
  .el-range-editor--mini .el-range-separator {
    line-height: 12px;
    font-size: 12px;
  }
  .el-form-item__label,
  .el-form-item__content {
    line-height: 20px;
  }
  .charges-item {
    display: flex;
    .currency {
      width: 100px !important;
      margin-left: 4px;
    }
  }
  .remarks-container {
    display: flex;
    .operation-btns {
      flex: 1;
      display: flex;
      padding: 0 10px;
      justify-content: flex-end;
      .add-remark {
        height: 24px;
        width: 24px;
        background: url('../../../../../assets/icon_add.png') center center
          no-repeat;
        background-size: cover;
        cursor: pointer;
        margin-left: 12px;
      }
      .del-remark {
        height: 24px;
        width: 24px;
        background: url('../../../../../assets/icon_del.png') center center
          no-repeat;
        background-size: cover;
        cursor: pointer;
      }
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
    width: 100%;
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
    width: 50%;
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
      width: 100%;
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
    user-select: none;
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
}
.line-heigth14 {
  line-height: 13px;
}
.icon-sort {
  font-size: 16px;
  color: #409eff;
  margin-left: 4px;
}
</style>
