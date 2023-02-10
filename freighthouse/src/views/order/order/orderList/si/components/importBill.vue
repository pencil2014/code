<template>
  <el-dialog @close="handleClose" title="导入账单" :visible="dialogOrderShow" width="952px">
    <div class="si-import-bill">
      <el-form ref="orderImportForm" :model="orderImportForm" :inline="true" label-width="100px" size="mini" :rules="orderImportRegRules">
        <el-form-item label="账单类型:" prop="shBillType">
          <el-select @change="shBillTypeChange" v-model="orderImportForm.shBillType" placeholder="请选择">
            <el-option v-for="(op, i) in dictMap['shBillType']" :key="'shBillType' + i" :label="op.label" :value="op.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="收到账单时间:" prop="billDate">
          <elDatePickerLimit v-model="orderImportForm.billDate" type="date" value-format="yyyy-MM-dd" placeholder="请选择"> </elDatePickerLimit>
        </el-form-item>
        <el-form-item label="单号类型:" prop="inputNoType">
          <el-select v-model="orderImportForm.inputNoType" disabled placeholder="请选择" @change="changeLabel">
            <el-option v-for="(op, j) in dictMap['billInputNoType']" :key="'billInputNoType' + j" :label="op.label" :value="op.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="最晚确认时间:" prop="checkBfDate">
          <elDatePickerLimit v-model="orderImportForm.checkBfDate" type="date" value-format="yyyy-MM-dd" placeholder="请选择"> </elDatePickerLimit>
        </el-form-item>
        <el-form-item :label="labelName" prop="inputNo">
          <el-autocomplete v-model="orderImportForm.inputNo" :fetch-suggestions="querySearch" placeholder="请输入" :trigger-on-focus="false" @select="handleSelect"></el-autocomplete>
        </el-form-item>
        <el-form-item label="附件类型" prop="dnBillType">
          <el-select @change="changeLabel1" v-model="orderImportForm.dnBillType" placeholder="请选择" filterable>
            <el-option v-for="item in dnBillTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item required label="大船船名:" prop="vessel">
          <!-- <el-input v-model="orderImportForm.vessel"></el-input> -->
          <VesselSelect v-if="form.orderNo" @vesselCallBack="vesselCallBack" v-model="orderImportForm.vessel" :orderNo="form.orderNo" :shipCarrierCode="form.shipCarrierCode" :polPortCode="form.polPortCode" :podPortCode="form.podPortCode" />
        </el-form-item>
        <el-form-item required label="大船航次:" prop="voyage">
          <!-- <el-input v-model="orderImportForm.voyage"></el-input> -->
          <VoyageSelect
            v-if="form.orderNo"
            @voyageCallBack="vesselCallBack"
            v-model="orderImportForm.voyage"
            :orderNo="form.orderNo"
            :vessel="form.vessel"
            :shipCarrierCode="form.shipCarrierCode"
            :polPortCode="form.polPortCode"
            :podPortCode="form.podPortCode"
          />
        </el-form-item>
        <el-form-item v-show="orderImportForm.shBillType === 'barge_ship'" label="驳船船名:" prop="bargeVessel">
          <el-input v-model="orderImportForm.bargeVessel"></el-input>
        </el-form-item>
        <el-form-item v-show="orderImportForm.shBillType === 'barge_ship'" label="驳船航次:" prop="bargeVoyage">
          <el-input v-model="orderImportForm.bargeVoyage"></el-input>
        </el-form-item>
        <el-form-item class="import-bill-remark" label="备注" prop="dnCheckApplyRemark">
          <el-input type="textarea" autosize size="mini" placeholder="请输入" v-model="orderImportForm.dnCheckApplyRemark"></el-input>
        </el-form-item>

        <el-form-item label="拿价人" prop="dnCheckEmployeeName">
          <el-input size="mini" v-model="orderImportForm.dnCheckEmployeeName" disabled></el-input>
        </el-form-item>
        <el-form-item label="船公司" prop="shipCarrierCode">
          <el-input size="mini" v-model="orderImportForm.shipCarrierCode" disabled></el-input>
        </el-form-item>
        <el-form-item label="订舱代理:" prop="settleCorpName">
          <el-input v-model="orderImportForm.settleCorpName" disabled></el-input>
        </el-form-item>
        <el-form-item label="工作单号:" prop="orderNo">
          <el-input v-model="orderImportForm.orderNo" disabled></el-input>
        </el-form-item>
        <el-form-item label="驳船收货地:" prop="podName">
          <el-input v-model="orderImportForm.podName" disabled></el-input>
        </el-form-item>
        <el-form-item label="大船起运港:" prop="polName">
          <el-input v-model="orderImportForm.polName" disabled></el-input>
        </el-form-item>
        <el-form-item label="目的地:" prop="podPortName">
          <el-input v-model="orderImportForm.podPortName" disabled></el-input>
        </el-form-item>
        <el-form-item label="导入账单:" prop="fileNo" class="invoice-payment-add-form-upload" style="position: relative;width:100%;">
          <el-input
            v-model="orderImportForm.fileNo"
            style="
								position: absolute;
								right: 0;
								top: 0;
								width: 1px;
								height: 1px;
								opacity: 0;
							"
          ></el-input>
          <FinanceUploadEmbed ref="orderUpload" :upload-api="uploadApi" :upload-params="uploadParams" @close="closeDialog" @getFileList="getFileList" @send-res-file-list="sendResFileList" />
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="disabledSubmit" @click="submitOrder" size="mini">提交</el-button>
      <el-button size="mini" @click="closeDialog">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import FinanceUploadEmbed from './financeUploadEmbed'
import VesselSelect from '@/views/order/order/components/vesselSelect'
import VoyageSelect from '@/views/order/order/components/voyageSelect'
import { blBillInfo, blBillUpload, blNoList, getFileBatchNo } from '@/api/order/bl'

export default {
  filters: {},
  data() {
    return {
      dnBillTypeList: [
        { label: '海运费账单', value: 'DN' },
        { label: '亏舱费账单', value: 'DN_BACK' },
        { label: '返空费账单', value: 'DN_BACK_EMPTY' },
        { label: '海运改单/柜费账单', value: 'DN_CHANGE' },
        { label: '本地费用账单', value: 'DN_LOCAL' }
      ],
      disabledSubmit: true,

      labelName: '提单号:',
      employeeOptions: [],
      orderImportForm: {
        dnBillType: '',
        shipCarrierCode: '',
        pricingEmployeeId: '',
        dnCheckEmployeeName: '',
        dnCheckApplyRemark: '',
        shBillType: '',
        inputNoType: 'BL',
        inputNo: '',
        billDate: '',
        checkBfDate: '',
        settleCorpName: '',
        orderNo: '',
        polPortName: '',
        podPortName: '',
        podName: '',
        polName: '',
        vessel: '',
        voyage: '',
        bargeVessel: '',
        bargeVoyage: '',
        fileNo: '',
        fileName: '',
        blId: ''
      },
      orderImportRegRules: {
        checkBfDate: [
          {
            required: true,
            message: '最晚确认时间不能为空',
            trigger: 'change'
          }
        ],
        billDate: [
          {
            required: true,
            message: '收到账单时间不能为空',
            trigger: 'change'
          }
        ],
        vessel: [
          {
            required: true,
            message: '大船船名不能为空',
            trigger: ['blur', 'change']
          }
        ],
        voyage: [
          {
            required: true,
            message: '大船航次不能为空',
            trigger: ['blur', 'change']
          }
        ],
        fileNo: [
          {
            required: true,
            message: '附件不能为空',
            trigger: 'change'
          }
        ],

        dnBillType: [
          {
            required: true,
            message: '附件类型不能为空',
            trigger: 'change'
          }
        ],
        shBillType: [
          {
            required: true,
            message: '账单类型不能为空',
            trigger: 'change'
          }
        ],
        inputNoType: [
          {
            required: true,
            message: '单号类型不能为空',
            trigger: 'change'
          }
        ],
        inputNo: [
          {
            required: true,
            message: 'SO或提单号不能为空',
            trigger: 'change'
          }
        ]
      },
      uploadApi: '/order/shipping/bl/bill/upload',
      uploadParams: {},
      fileList: [],
      form: {}
    }
  },
  props: {
    dialogOrderShow: {
      type: Boolean,
      default: false
    },
    blNo: {
      type: String,
      default: ''
    }
  },
  created() {
    let date = new Date()
    let nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000) //后一天
    this.orderImportForm.billDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date
      .getDate()
      .toString()
      .padStart(2, 0)}`

    this.orderImportForm.checkBfDate = `${nextDate.getFullYear()}-${(nextDate.getMonth() + 1).toString().padStart(2, 0)}-${nextDate
      .getDate()
      .toString()
      .padStart(2, 0)}`
    this.orderImportForm.inputNo = this.blNo
    this.handleSelect()
  },
  mounted() {},
  activated() {},
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    })
  },
  components: {
    FinanceUploadEmbed,
    VesselSelect,
    VoyageSelect
  },

  methods: {
    vesselCallBack() {
      let name = this.labelName.replace(':', '')
      this.$message.error(`请先选择${name}`)
    },
    getFileList(val) {
      this.fileList = val
      val && (this.orderImportForm.fileNo = val[0].uid)
    },
    handleClose() {
      this.$emit('close')
    },
    shBillTypeChange(val) {
      // ship: 大船  barge_ship：驳船 + 大船
      console.log('账单类型：', val)
    },
    querySearch(queryString, cb) {
      blNoList({ inputNoType: this.orderImportForm.inputNoType, inputNo: this.orderImportForm.inputNo })
        .then(res => {
          let options = res.data.map(item => ({ value: item }))
          cb(options)
          if (res.data.length > 0) {
            this.disabledSubmit = false
          } else {
            this.disabledSubmit = true
          }
        })
        .catch(err => {
          cb([])
          this.disabledSubmit = true
        })
    },
    //选中so号
    handleSelect(item) {
      if (!this.orderImportForm.inputNo) return

      blBillInfo({ inputNoType: this.orderImportForm.inputNoType, inputNo: this.orderImportForm.inputNo })
        .then(res => {
          this.disabledSubmit = false
          let { data } = res
          this.orderImportForm.pricingEmployeeId = data.dnCheckEmployeeId
          this.orderImportForm.dnCheckEmployeeName = data.dnCheckEmployeeName
          this.orderImportForm.shipCarrierCode = data.shipCarrierCode
          this.orderImportForm.settleCorpName = data.bkgAgentSupplierName
          this.orderImportForm.orderNo = data.orderNo
          this.orderImportForm.vessel = data.vessel
          this.orderImportForm.voyage = data.voyage
          this.orderImportForm.bargeVessel = data.bargeVessel
          this.orderImportForm.bargeVoyage = data.bargeVoyage
          this.orderImportForm.podName = data.porPortName
          this.orderImportForm.polName = data.polPortName
          this.orderImportForm.podPortName = data.podPortName
          this.orderImportForm.blId = data.blId
          this.form = Object.assign({}, data)
        })
        .catch(err => {
          this.disabledSubmit = true
        })
    },
    changeLabel1(val) {
      console.log('🚀 ~ val', val)
    },
    // 修改label名称
    changeLabel(val) {
      this.orderImportForm.inputNo = ''
      this.orderImportForm.pricingEmployeeId = ''
      this.orderImportForm.dnCheckEmployeeName = ''
      this.orderImportForm.shipCarrierCode = ''
      this.orderImportForm.settleCorpName = ''
      this.orderImportForm.orderNo = ''
      this.orderImportForm.vessel = ''
      this.orderImportForm.voyage = ''
      this.orderImportForm.bargeVessel = ''
      this.orderImportForm.bargeVoyage = ''
      this.orderImportForm.podName = ''
      this.orderImportForm.polName = ''
      this.orderImportForm.podPortName = ''
      this.orderImportForm.blId = ''
      this.orderImportForm.dnBillType = ''
      if (val === 'SO') {
        this.labelName = 'SO号:'
        this.dnBillTypeList = [
          { label: '亏舱费账单', value: 'DN_BACK' },
          { label: '船东仓租柜租账单', value: 'DN_WH_CN' },
          { label: '本地费用账单', value: 'DN_LOCAL' }
        ]
      }
      if (val === 'BL') {
        this.labelName = '提单号:'
        this.dnBillTypeList = [
          { label: '海运费账单', value: 'DN' },
          { label: '亏舱费账单', value: 'DN_BACK' },
          { label: '返空费账单', value: 'DN_BACK_EMPTY' },
          { label: '海运改单/柜费账单', value: 'DN_CHANGE' },
          { label: '本地费用账单', value: 'DN_LOCAL' }
        ]
      }
    },
    trimMethod(val) {
      if (val) {
        return (val + '').trim()
      } else {
        return ''
      }
    },
    // 提交修改新增账单
    submitOrder() {
      if (this.fileList.length == 0) {
        return this.$message.warning('请先上传附件!')
      }
      this.$refs.orderImportForm.validate(valid => {
        if (valid) {
          //处理账单类型
          let shBillType = 'SHIP'
          let params = {}
          if (this.orderImportForm.shBillType === 'barge_ship') {
            shBillType = 'BARGE_SHIP'
            params = {
              bargeVessel: this.trimMethod(this.orderImportForm.bargeVessel),
              bargeVoyage: this.trimMethod(this.orderImportForm.bargeVoyage)
            }
          }
          this.uploadParams = {
            orderNo: this.orderImportForm.orderNo,
            blId: this.orderImportForm.blId,
            billType: shBillType,
            dnBillType: this.orderImportForm.dnBillType,
            billDate: this.orderImportForm.billDate,
            billDateCheckLast: this.orderImportForm.checkBfDate,
            inputNo: this.orderImportForm.inputNo,
            inputNoType: this.orderImportForm.inputNoType,
            pricingEmployeeId: this.orderImportForm.pricingEmployeeId,
            dnCheckApplyRemark: this.orderImportForm.dnCheckApplyRemark,
            vessel: this.trimMethod(this.orderImportForm.vessel),
            voyage: this.trimMethod(this.orderImportForm.voyage),
            ...params
          }
          if (this.fileList.length > 1) {
            getFileBatchNo().then(res => {
              this.uploadParams.fileBatchNo = res.data
              setTimeout(() => {
                this.$refs.orderUpload.handleImport()
              }, 500)
            })
          } else {
            this.uploadParams.fileBatchNo = ''
            setTimeout(() => {
              this.$refs.orderUpload.handleImport()
            }, 500)
          }
        }
      })
    },

    // 关闭新增账单弹窗
    closeDialog(val) {
      if (val === 'success') {
        this.$parent.$parent.init() // 导入账单后请求详情
        this.$parent.getBillList()
        this.$parent.$refs.fileList.getFileList()
        if (this.blNo !== this.orderImportForm.inputNo && this.orderImportForm.inputNoType === 'BL') {
          const msg = `导入的是${this.orderImportForm.inputNo}提单的船东账单，请到${this.orderImportForm.inputNo}补料详情中查看`
          setTimeout(() => {
            this.$message.warning(msg)
          }, 1000)
        }
      }
      this.labelName = '提单号:'
      this.dnBillTypeList = [
        { label: '海运费账单', value: 'DN' },
        { label: '亏舱费账单', value: 'DN_BACK' },
        { label: '返空费账单', value: 'DN_BACK_EMPTY' },
        { label: '海运改单/柜费账单', value: 'DN_CHANGE' },
        { label: '本地费用账单', value: 'DN_LOCAL' }
      ]
      this.$refs.orderImportForm.resetFields()
      this.$refs.orderUpload.fileList = []
      this.fileList = []
      this.orderImportForm = {
        shBillType: '',
        inputNoType: 'BL',
        inputNo: '',
        billDate: '',
        checkBfDate: '',
        settleCorpName: '',
        orderNo: '',
        polPortName: '',
        podPortName: '',
        polName: '',
        podName: '',
        vessel: '',
        voyage: '',
        bargeVessel: '',
        bargeVoyage: '',
        fileNo: '',
        fileName: '',
        blId: '',
        dnCheckApplyRemark: '',
        pricingEmployeeId: '',
        dnCheckEmployeeName: '',
        dnBillType: ''
      }
      this.$emit('close')
    },
    // 上传附件
    sendResFileList(val) {
      if (val.length) {
        let item = val[0]
        // this.orderImportForm.fileNo = item.fileNo
        if (item) {
          this.orderImportForm.fileName = item.name
        }
      }
    }
  }
}
</script>
<style lang="scss">
.si-import-bill {
  .el-form-item {
    width: 45%;
  }
  .import-bill-remark {
    width: 90%;
    .el-form-item__content {
      width: 708px;
      textarea {
        max-height: 120px;
        width: calc(100% - 7px) !important;
      }
    }
  }
  .el-form-item__content {
    width: 70%;
  }
  .el-form-item__label {
    font-weight: 700;
  }
  .el-input,
  .el-autocomplete,
  .el-select {
    width: 100% !important;
  }
}
</style>
