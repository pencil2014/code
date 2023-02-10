<template>
  <el-dialog
    :before-close="cancel"
    :appendToBody="true"
    :visible.sync="options.show"
    class="follow-add"
    :title="options.isEdit?'编辑合同':'新增合同'"
    width="1050px"
  >
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="follow-form"
      label-width="137px"
      ref="form"
      size="mini"
    >
      <!-- 基本信息 -->
      <div class="outer-box">
          <div class="title">基本信息</div>
          <div class="outer-item">
            <div class="item-box">
              <div class="item-cnt">
                <!-- 客户信息3个，区别于供应商 -->
                <el-form-item label="客户名称:" prop="custName" class="normal-input" v-if="custType==='customer'">
                  <el-select v-model="form.custName" value-key="orgid" filterable clearable remote :disabled="options.isEdit"
                    :remote-method="(str) => { getCustomerList(str) }" @change="(str) => changeComanyName(str)">
                    <el-option v-for="(custItem, custIndex) in customerList" :key="custIndex" :label="custItem.name || custItem.ename"
                      :value="custItem.orgid"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="客户类型:" key="custClass" prop="custClass" v-if="custType==='customer'">
                  <el-select v-model="form.custClass" placeholder="请选择" disabled>
                    <el-option
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                      v-for="item in dictMap['customerClass']"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="公司规模:" key="scale" prop="scale" v-if="custType==='customer'">
                  <el-select v-model="form.scale" placeholder="请选择" disabled>
                    <el-option
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                      v-for="item in dictMap['orgScale']"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <!-- 供应商基本信息 2个 -->
                <el-form-item label="供应商名称:" prop="custName" class="normal-input" v-if="custType==='supplier'">
                  <el-select v-model="form.custName" value-key="orgid" filterable clearable remote :disabled="options.isEdit"
                    :remote-method="(str) => { getSupplierList(str) }" @change="(str) => changeSupplierName(str)">
                    <el-option v-for="(custItem, custIndex) in supplierList" :key="custIndex" :label="custItem.name || custItem.ename"
                      :value="custItem.orgid"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="供应商类型:" key="bussiness" prop="bussiness" v-if="custType==='supplier'">
                  <el-select v-model="form.bussiness" placeholder="请选择" filterable clearable multiple collapse-tags disabled>
                    <el-option
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                      v-for="item in dictMap['crmCategory']"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="所属行业:" key="industry" prop="industry">
                  <el-input
                    v-model="form.industry"
                    placeholder="请填写"
                    disabled
                  ></el-input>
                </el-form-item>
                <el-form-item label="客户性质:" key="entType" prop="entType">
                  <el-select v-model="form.entType" placeholder="请选择" disabled>
                    <el-option
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                      v-for="item in dictMap['entType']"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="国家(行政区):" key="country" prop="country">
                  <el-input
                    v-model="form.country"
                    placeholder="请填写"
                    disabled
                  ></el-input>
                </el-form-item>
                <el-form-item label="省/市/区:" prop="province">
                  <el-input
                    v-model="form.province"
                    placeholder="请填写"
                    disabled
                  ></el-input>
                </el-form-item>
                <el-form-item label="注册资金:" prop="regCapital">
                  <el-input
                    v-model="form.regCapital"
                    placeholder="请填写"
                    disabled
                  ></el-input>
                </el-form-item>
                <el-form-item label="成立日期:" prop="setupDate">
                  <el-input
                    v-model="form.setupDate"
                    placeholder="请填写"
                    disabled
                  ></el-input>
                </el-form-item>
                <el-form-item label="营业执照到期日:" prop="usccExpDate">
                  <el-input
                    v-model="form.usccExpDate"
                    placeholder="请填写"
                    disabled
                  ></el-input>
                </el-form-item>
                <el-form-item label="社信代码:" prop="uscc">
                  <el-input
                    v-model="form.uscc"
                    placeholder="请填写"
                    disabled
                  ></el-input>
                </el-form-item>
                <el-form-item label="注册地址:" prop="registerAddr">
                  <el-input
                    v-model="form.registerAddr"
                    placeholder="请填写"
                    disabled
                  ></el-input>
                </el-form-item>
                <el-form-item label="详细地址:" prop="detailAddr">
                  <el-input
                    v-model="form.detailAddr"
                    placeholder="请填写"
                    disabled
                  ></el-input>
                </el-form-item>
              </div>
              <div class="btn-box">
              </div>
            </div>
          </div>
        </div>
      <template>
        <!-- 客户合同信息 -->
         <div class="outer-box" v-if="custType==='customer'">
          <div class="title">合同信息</div>
          <div class="outer-item">
            <div class="item-box">
              <div class="item-cnt">
                <el-form-item label="合同名称:" prop="contractName">
                  <el-input
                    v-model="form.contractName"
                    placeholder="请填写"
                  ></el-input>
                </el-form-item>
              <el-form-item label="合同类型:" key="contractNoPrefix" prop="contractNoPrefix">
                <el-select
                  placeholder="请选择"
                  size="mini"
                  v-model="form.contractNoPrefix"
                >
                  <el-option
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    :disabled="item.value==='NBSP'"
                    v-for="item in dictMap['contractNoPrefix']"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="我司分公司:" key="contractCompanyList" prop="contractCompanyList">
                <el-select
                  @change="changeSettleCompanyList"
                  class="custlist"
                  collapse-tags
                  filterable
                  multiple
                  placeholder="请选择"
                  size="mini"
                  v-model="form.contractCompanyList"
                >
                  <el-option
                    :disabled="item.disabled"
                    :key="item.companyCode"
                    :label="item.companyName"
                    :value="item.companyCode"
                    v-for="item in settleCompanyList"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="共享公司:" key="contractRelCustList" prop="contractRelCustList">
                <el-select
                  @change="changeShareCom"
                  class="custlist"
                  collapse-tags
                  filterable
                  multiple
                  placeholder="请选择"
                  size="mini"
                  v-model="form.contractRelCustList"
                >
                  <el-option
                    :disabled="item.disabled"
                    :key="item.custid"
                    :label="item.name"
                    :value="item.custid"
                    v-for="item in shareCompany"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item key="businessType" label="业务类型:" prop="businessType">
                <el-select
                  v-model="form.businessType"
                  placeholder="请选择"
                  filterable
                  clearable
                  multiple
                  collapse-tags
                  :class="{ noshow: isDisabled }"
                >
                  <el-option
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    v-for="item in dictMap['baseBusinessType']"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="是否长帆合同模板:" prop="isStandard">
                <el-select
                  v-model="form.isStandard"
                  placeholder="请选择"
                  :disabled="options.isEdit && !isSelf"
                >
                  <el-option label="是" value="yes"></el-option>
                  <el-option label="否" value="no"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="有效期" style="width: 100%;"
               :prop="form.isSingle?'isEffectDate':form.isEffectDate? 'effectStartDate' : 'effectDate'"> 
                <el-date-picker
                  style="width:39%"
                  clearable
                  placeholder="请选择"
                  size="mini"
                  type="daterange"
                  v-model="form.effectDate"
                  v-show="!form.isEffectDate"
                  value-format="yyyy-MM-dd"
                ></el-date-picker>
                <el-date-picker
                 style="width:39%"
                  placeholder="请选择开始时间"
                  type="date"
                  v-model="form.effectStartDate"
                  v-show="form.isEffectDate"
                  value-format="yyyy-MM-dd"
                ></el-date-picker>
                <el-checkbox v-model="form.isEffectDate" class="check-item">长期有效</el-checkbox>
                <el-checkbox v-model="form.isSingle" class="check-item">单票有效</el-checkbox>
              </el-form-item>
              <el-form-item
                key="fileList"
                label="上传合同:"
                style="width: 100%;"
              >
              <div class="file-upload">
                <el-upload
                  :auto-upload="true"
                  :file-list="fileList"
                  :before-upload="getFile"
                  :http-request="handleImport"
                  :multiple="true"
                  :limit="10"
                  :on-remove="handleRemove"
                  :on-exceed="handleExceed"
                  action="#"
                  class
                  drag
                  ref="upload"
                >
                  <div class="file-box">
                    <div class="icon">
                      <img
                        :src="require('@/assets/icon-upload.png')"
                        class="icon-img"
                      />
                    </div>
                    <div class="tips">
                      <div class="txt-title">点击或将文件拖拽到这里导入</div>
                      <p class="txt-desc">
                        支持
                        doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar
                        格式文件
                      </p>
                    </div>
                  </div>
                </el-upload>
                <el-progress
                  :percentage="processLength"
                  :stroke-width="2"
                  v-show="showProcess"
                ></el-progress>
              </div>
            </el-form-item>
            <el-form-item  label="备注:" prop="remark" style="width:100%">
              <el-input
                maxlength="500"
                placeholder="请输入"
                show-word-limit
                type="textarea"
                v-model="form.remark"
              ></el-input>
            </el-form-item>
              </div>
              <div class="btn-box">
              </div>
            </div>
          </div>
        </div>
        <!-- 供应商合同信息 -->
        <div class="outer-box" v-if="custType==='supplier'">
          <div class="title">合同信息</div>
          <div class="outer-item">
            <div class="item-box">
              <div class="item-cnt">
                <el-form-item label="合同名称:" prop="contractName">
                  <el-input
                    v-model="form.contractName"
                    placeholder="请填写"
                  ></el-input>
                </el-form-item>
                <el-form-item label="合同编号:" prop="contractNo">
                  <el-input
                    v-model="form.contractNo"
                    placeholder="请填写"
                  ></el-input>
                </el-form-item>
                <el-form-item label="合同签署类型:" key="contractSignType" prop="contractSignType">
                  <el-select
                    placeholder="请选择"
                    size="mini"
                    v-model="form.contractSignType"
                  >
                    <el-option
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                      v-for="item in dictMap['supplierContractSignType']"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="我司分公司:" key="contractCompanyList" prop="contractCompanyList">
                  <el-select
                    @change="changeSettleCompanyList"
                    class="custlist"
                    collapse-tags
                    filterable
                    multiple
                    placeholder="请选择"
                    size="mini"
                    v-model="form.contractCompanyList"
                  >
                    <el-option
                      :disabled="item.disabled"
                      :key="item.companyCode"
                      :label="item.companyName"
                      :value="item.companyCode"
                      v-for="item in settleCompanyList"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="业务类型:" key="businessType" prop="businessType">
                  <el-select
                    v-model="form.businessType"
                    placeholder="请选择"
                    filterable
                    clearable
                    multiple
                    collapse-tags
                    :class="{ noshow: isDisabled }"
                  >
                    <el-option
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                      v-for="item in dictMap['baseBusinessType']"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="结算周期:" key="settleCycle" prop="settleCycle">
                  <el-select
                    placeholder="请选择"
                    size="mini"
                    v-model="form.settleCycle"
                  >
                    <el-option
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                      v-for="item in dictMap['supplierContractSettleCycle']"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="是否交押金:" prop="isPayDeposit">
                  <el-select
                    v-model="form.isPayDeposit"
                    placeholder="请选择"
                    class="contract-select"
                    style="width: 30%"
                  >
                    <el-option
                      v-for="item in dictMap['yesNo']"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                  <el-input
                    :controls="false"
                    :min="0"
                    class="contract-input"
                    placeholder="请输入金额"
                    size="mini"
                    v-model="form.depositAmount"
                    v-if="form.isPayDeposit === 'yes'"
                    style="width: 40%"
                    :maxlength="10"
                  ></el-input>
                  <el-select
                    v-model="form.depositCurrency"
                    placeholder="请选择币种"
                    v-if="form.isPayDeposit === 'yes'"
                    style="width: 30%"
                  >
                    <el-option
                      v-for="item in currencyList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="信用额度-USD:" prop="creditAmountUsd">
                  <el-input
                    :controls="false"
                    :min="0"
                    v-model="form.creditAmountUsd"
                    placeholder="请输入额度"
                    class="default-input"
                    :maxlength="8"
                  ></el-input>
                </el-form-item>
                <el-form-item label="信用额度-CNY:" prop="creditAmountCny">
                  <el-input
                    :controls="false"
                    :min="0"
                    v-model="form.creditAmountCny"
                    placeholder="请输入额度"
                    class="default-input"
                    :maxlength="8"
                  ></el-input>
                </el-form-item>
                <el-form-item label="是否长帆合同模板:" prop="isStandard">
                  <el-select
                    v-model="form.isStandard"
                    placeholder="请选择" 
                    :disabled="options.isEdit && !isSelf"
                  >
                    <el-option label="是" value="yes"></el-option>
                    <el-option label="否" value="no"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="有效期" style="width: 100%;"
                :prop="form.isEffectDate? 'effectBeginDate' : 'effectDate'"> 
                  <el-date-picker
                    style="width:39%"
                    clearable
                    placeholder="请选择"
                    size="mini"
                    type="daterange"
                    v-model="form.effectDate"
                    v-show="!form.isEffectDate"
                    value-format="yyyy-MM-dd"
                  ></el-date-picker>
                  <el-date-picker
                  style="width:39%"
                    placeholder="请选择开始时间"
                    type="date"
                    v-model="form.effectBeginDate"
                    v-show="form.isEffectDate"
                    value-format="yyyy-MM-dd"
                  ></el-date-picker>
                  <el-checkbox v-model="form.isEffectDate" class="check-item">长期有效</el-checkbox>
                </el-form-item>
                <el-form-item
                  key="fileList"
                  label="上传合同:"
                  style="width: 100%;"
                >
                <div class="file-upload">
                  <el-upload
                    :auto-upload="true"
                    :file-list="fileList"
                    :before-upload="getFile"
                    :http-request="handleImport"
                    :multiple="true"
                    :limit="10"
                    :on-remove="handleRemove"
                    :on-exceed="handleExceed"
                    action="#"
                    class
                    drag
                    ref="upload"
                  >
                    <div class="file-box">
                      <div class="icon">
                        <img
                          :src="require('@/assets/icon-upload.png')"
                          class="icon-img"
                        />
                      </div>
                      <div class="tips">
                        <div class="txt-title">点击或将文件拖拽到这里导入</div>
                        <p class="txt-desc">
                          支持
                          doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar
                          格式文件
                        </p>
                      </div>
                    </div>
                  </el-upload>
                  <el-progress
                    :percentage="processLength"
                    :stroke-width="2"
                    v-show="showProcess"
                  ></el-progress>
                </div>
              </el-form-item>
              <el-form-item  label="备注:" prop="remark" style="width:100%">
                <el-input
                  maxlength="500"
                  placeholder="请输入"
                  show-word-limit
                  type="textarea"
                  v-model="form.remark"
                ></el-input>
              </el-form-item>
              </div>
              <div class="btn-box">
              </div>
            </div>
          </div>
        </div>
        <!-- 第三方 -->
        <div class="outer-box">
          <div class="title">第三方公司信息<span>(如合同主体涉及第三方,请完善以下第三方公司信息)</span></div>
          <div class="outer-item">
            <div class="item-box">
              <div class="item-cnt">
                <el-form-item label="合同第三方公司名称:" prop="nonpartyCustName">
                  <el-input
                    v-model="form.nonpartyCustName"
                    placeholder="请填写"
                  ></el-input>
                </el-form-item>
                <el-form-item label="社信代码:" prop="nonpartyUscc">
                  <el-input
                    v-model="form.nonpartyUscc"
                    placeholder="请填写"
                  ></el-input>
                </el-form-item>
              </div>
              <div class="btn-box">
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-form>
    <div class="dialog-footer" slot="footer" >
      <el-button @click="cancel" size="mini">取消</el-button>
      <el-button @click="submit('draft')" size="mini" type="primary">保存</el-button>
      <el-button  :loading="btnLoading" @click="submit('approve')" size="mini" type="primary" v-if="(options.isEdit&&isSelf)||!options.isEdit">提交审批</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceUploadEmbed from '@/views/crm/components/financeUpload/financeUploadEmbed' 
import { getBdCustomer,getBdrelCust,submitApplyInfo,getBdSupplier,submitSupplierApplyInfo,
  contractApplyInfo,supplierContractApplyInfo,getRelCustById
} from '@/api/crm/contract'
import { formatIndustry } from "@/utils/crm"
import { companyPageList } from '@/api/base'
export default {
  props: {
    options: {
      type: Object,
      default: () => {}
    },
  },
  components: {
      FinanceUploadEmbed,
    },
  data() {
    return {
      uploadApi2: '/base/webapi/file/upload',
      defaultFileSize: 100,
      acceptTypes: ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'jpg', 'png', 'jpeg', 'bmp', 'tif', 'image', 'txt', 'zip', 'rar'],
      custType:'customer',
      customerList: [],
      supplierList: [],
      shareCompany:[],
      settleCompanyList:[],
      form: {
        custName: '',
        contractName:'',
        bussiness:[],
        isStandard:'',
        contractNoPrefix:'',
        businessType:[],
        contractSignType:'',
        settleCycle:'',
        isPayDeposit: 'yes',
        depositCurrency: 'USD',
        isEffectDate: false,
        isSingle: false,
        remark:'',
        nonpartyCustName:'',
        nonpartyUscc:'',
        effectDate:[],
        creditAmountUsd:'',
        creditAmountCny:'',
        depositAmount:'',
        effectBeginDate:'',
        effectStartDate:'',
        contractNo:'',
      },
      btnLoading:false,
      currencyList: [
        {
          label: 'USD',
          value: 'USD'
        },
        {
          label: 'CNY',
          value: 'CNY'
        }
      ],
      rules: {
        custName: {
          required: true,
          message: '客户名称必填',
          trigger: 'change'
        },
        contractName: {
          required: true,
          message: '合同名称必填',
          trigger: 'change'
        },
        isStandard: {
          required: true,
          message: '是否长帆合同模板必填',
          trigger: 'change'
        },
        contractNoPrefix: {
          required: true,
          message: '合同类型必填',
          trigger: 'change'
        },
        businessType: {
          required: true,
          message: '业务类型必填',
          trigger: 'change'
        },
        contractSignType: {
          required: true,
          message: '合同签署类型必填',
          trigger: 'change'
        },
        settleCycle: {
          required: true,
          message: '结算周期必填',
          trigger: 'change'
        },
        contractNo: {
          required: true,
          message: '合同编号必填',
          trigger: 'change'
        },
        effectDate: {
          required: true,
          message: '有效期必填',
          trigger: 'change'
        },
        effectStartDate: {
          required: true,
          message: '有效期开始时间必填',
          trigger: 'change'
        },
        effectBeginDate: {
          required: true,
          message: '有效期开始时间必填',
          trigger: 'change'
        } 
      },
      file: '',
      fileList: [],
      fileListUpload: [],
      fileNos: [],
      showProcess: false,
      processLength: 0,
      isSelf:false
    }
  },
  created() { 
    this.getBdrelCust() 
    this.getCustomerList()//获取客户列表
    this.getSupplierList()//获取供应商列表
    this.getCompanyList() //分公司
    if(!this.options.isEdit){
      this.getBdrelCust() //共享公司
    }
    this.custType = this.options.type
    if (this.options.isEdit){
      let data = {
        contractId:this.options.form.contractId
      }
    let methods = this.options.type==='customer'?contractApplyInfo:supplierContractApplyInfo
    methods(data)
        .then(res => {
          let datas = res.data
          let beseDetail = this.options.type==='customer'?res.data.crmCustContractMainApplyDto:
          res.data.crmSupplierContractMainApplyDto
          let baseDto = this.options.type==='customer'?res.data.customerDetailDto:res.data.supplierDetailDto
          this.isSelf = beseDetail.createdBy == this.$store.state.user.userId
          if(this.options.where==='list'){
            this.getBdrelCust() //共享公司
             //基本信息通过接口赋值
            if(this.options.type==='customer'){
              this.changeComanyName(res.data.customerDetailDto.orgid)
            }else{
              this.changeSupplierName(res.data.supplierDetailDto.orgid)
            }
          }else{
            this.getRelCustById(beseDetail.createdBy) //共享公司
            //从审批列表进来，详情里面的基本信息赋值
            this.form.custName = baseDto.name
            this.form.industry = formatIndustry(baseDto.industry)
            this.form.province =  baseDto.province && `${baseDto.province}/${baseDto.city}/${baseDto.district}`
            baseDto.categoryDtos&&baseDto.categoryDtos.map(item=>{
              this.form.bussiness.push(item.category)
            })
            this.form.country = baseDto.country
            this.form.regCapital = baseDto.regCapital
            this.form.setupDate = baseDto.setupDate
            this.form.usccExpDate = baseDto.usccExpDate
            this.form.uscc = baseDto.uscc
            this.form.registerAddr = baseDto.registerAddr
            this.form.detailAddr = baseDto.detailAddr
            this.form.custClass = baseDto.custClass
            this.form.orgid = baseDto.orgid
          }
          if(this.options.type==='customer'){
            this.form.effectStartDate = beseDetail.effectStartDate
            this.form.effectDate[0] = beseDetail.effectStartDate
          }else{
            this.form.effectDate[0] = beseDetail.effectBeginDate
            this.form.effectBeginDate = beseDetail.effectBeginDate
          }
          //合同信息赋值
          this.form.contractName = beseDetail.contractName
          this.form.contractNoPrefix = beseDetail.contractNoPrefix
          this.form.isStandard = beseDetail.isStandard
          this.form.contractSignType = beseDetail.contractSignType
          this.form.settleCycle = beseDetail.settleCycle
          this.form.contractNo = beseDetail.contractNo
          this.form.creditAmountUsd = beseDetail.creditAmountUsd
          this.form.creditAmountCny = beseDetail.creditAmountCny
          this.form.isPayDeposit = beseDetail.isPayDeposit
          this.form.depositAmount = beseDetail.depositAmount
          this.form.depositCurrency = beseDetail.depositCurrency
                
          //我司分公司
          datas.companyList.map(item=>{
            this.form.contractCompanyList.push(item.companyCode)
          })
          //共享公司
          datas.relCustList&&datas.relCustList.map(item=>{
            this.form.contractRelCustList.push(item.relCustid)
          })
          // 业务类型
          datas.businessList.map(item=>{
            this.form.businessType.push(item.businessType)
          })
          this.form.isSingle = beseDetail.isSingle==='yes'
          if(beseDetail.effectEndDate==='9999-12-31'){
            this.form.isEffectDate = true
          }else{
            this.form.isEffectDate = false
          }
          this.form.effectEndDate = beseDetail.effectEndDate
          this.form.effectDate[1] = beseDetail.effectEndDate 
          this.form.remark = beseDetail.remark 
          this.form.nonpartyCustName = beseDetail.nonpartyCustName 
          this.form.nonpartyUscc = beseDetail.nonpartyUscc 
          this.form.contractId = datas.crmCustContractApplyDto.contractId 
          this.fileListUpload = datas.fileList
          const fileList = this.fileListUpload.map((item) =>
              Object.assign({}, item, { name: item.fileName })
            )
          this.fileList = fileList
          const fileListUpload = this.fileListUpload.map((item) =>
            Object.assign({}, item, { name: item.fileName })
          )
        })

    }

  },
  watch: {
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    isDisabled() {
      return (this.isManager || this.isCts) && !this.isSelf
    },

  },
  methods: {
    //获取客户列表
    getCustomerList (str) {
      // console.log('获取客户')
      const query = str ? [{ column: 'name', type: 'like', value: str }] : []
      getBdCustomer({
        currPage: 1,
        pageSize: 1000,
        query
      }).then((res) => {
        if (res.code === 0) {
          this.customerList = res.data.list || []
        }
      })
    },
    //获取供应商列表
    getSupplierList(str) {
      const query = str ? [{ column: 'name', type: 'like', value: str }] : []
      getBdSupplier({
        currPage: 1,
        pageSize: 1000,
        query
      }).then((res) => {
        if (res.code === 0) {
          this.supplierList = res.data.list || []
        }
      })
    },
    // 修改客户
    changeComanyName (str) {
      if (str) {
        let findObj = this.customerList.find(item => item.orgid === str)
        this.custName = findObj.name
        this.custid = findObj.custid
        this.form.custClass = findObj.custClass
        this.form.custName = findObj.name
        this.form.scale = findObj.scale
        this.form.industry = formatIndustry(findObj.industry)
        this.form.entType = findObj.entType
        this.form.country = findObj.country
        this.form.province =  findObj.province && `${findObj.province}/${findObj.city}/${findObj.district}`
        this.form.regCapital = findObj.regCapital
        this.form.setupDate = findObj.setupDate
        this.form.usccExpDate = findObj.usccExpDate
        this.form.uscc = findObj.uscc
        this.form.registerAddr = findObj.registerAddr
        this.form.detailAddr = findObj.detailAddr
        this.form.custid = findObj.custid
        this.form.orgid = findObj.orgid
        // const { sysUserId, userName,mobileNo } = this.$store.state.user.userInfo
      }
    },
    //修改供应商
    changeSupplierName(str) {
      if (str) {
        let supplierLists =[]
        getBdSupplier({
          currPage: 1,
          pageSize: 1000,
        }).then((res) => {
          if (res.code === 0) {
            supplierLists = res.data.list
            let findObj = res.data.list.find(item => item.orgid === str)
            this.custName = findObj.name || ''
            this.custid = findObj.supplierId
            findObj.categoryDtos.map(item=>{
              this.form.bussiness.push(item.category)
            })
            this.form.custName = findObj.name
            this.form.industry = formatIndustry(findObj.industry)
            this.form.entType = findObj.entType
            this.form.country = findObj.country
            this.form.province =  findObj.province && `${findObj.province}/${findObj.city}/${findObj.district}`
            this.form.regCapital = findObj.regCapital
            this.form.setupDate = findObj.setupDate
            this.form.usccExpDate = findObj.usccExpDate
            this.form.uscc = findObj.uscc
            this.form.registerAddr = findObj.registerAddr
            this.form.detailAddr = findObj.detailAddr
            this.form.custid = findObj.supplierId
            this.form.orgid = findObj.orgid
          }
        })
      }
    },
    // 获取共享公司
    getBdrelCust(){
      const data = {
        currPage: 1,
        pageSize: 1000,
      }
      getBdrelCust(data).then((res) => {
        if (res.code === 0) {
          this.shareCompany = res.data.list || []
        }
      })
    },
    //合同审批专员获取创建人的共享公司
    getRelCustById(employeeId){
      const data = {
        currPage: 1,
        pageSize: 1000,
        employeeId:employeeId
      }
      getRelCustById(data).then((res) => {
        if (res.code === 0) {
          this.shareCompany = res.data.list || []
        }
      })
    },
    // 修改共享公司
    changeShareCom(val){
      // console.log('val',val)
    },
    // 获取分公司
    getCompanyList() {
      const data = {
        currPage: 1,
        pageSize: 1000,
        query: [
          {
            column: 'state',
            type: 'eq',
            value: 'valid'
          },
          {
            column: 'selfSettle',
            type: 'eq',
            value: 'yes'
          }
        ]
      }
      companyPageList(data).then((res) => {
        this.settleCompanyList = res.data.list.map((item) =>
          Object.assign({}, item, { disabled: false })
        )
        this.settleCompanyList.unshift({
          companyCode: '000000',
          companyName: '所有分公司',
          companyId: 0,
          disabled: false
        })
      })
    },
    // 改变我司分公司
    changeSettleCompanyList(val) {
      if (val.includes('000000')) {
        this.form.settleCompanyList = ['000000']
        this.settleCompanyList.forEach((item) => {
          if (item.companyCode !== '000000') {
            item.disabled = true
          }
        })
      } else {
        this.settleCompanyList.forEach((item) => {
          item.disabled = false
        })
      }
    },
    // 取消
    cancel() {
      this.$emit('cancel')
    },
    // 预览图片
    handlePreview(file) {
      const { uid } = file
      const source = this.fileListUpload.find((item) => item.uid === uid)
      const fileNo = source?.fileNo
      if (fileNo) {
        let fileName = source.name || 'preview'
        fileName = fileName.replace(/[\[|\]|\{|\}|\%|`]/g, '')
        officePreview({ fileNo, name:fileName })
      }
    },
    // 超出限制
    handleExceed(files, fileList) {
      this.$msgErrClose(`只能选择上传10个文件！`)
    },
    // 上传前钩子获取file名
    getFile(file) {
      this.file = file
    },
    // 删除上传文件
    handleRemove(file, fileList) {
      this.fileList = fileList
      this.fileListUpload = this.fileListUpload.filter((item) => {
        if (file.fileNo) {
          return item.fileNo !== file.fileNo
        } else {
          return item.uid !== file.uid
        }
      })
    },
    // 上传文件
    handleImport() {
      this.handleProgress()
      const form = new FormData()
      form.append('file', this.file)
      const uid = this.file.uid
      this.$store
        .dispatch('user/import', {
          uri: '/base/webapi/file/upload',
          params: form
        })
        .then((res) => {
          this.processLength = 100
          this.showProcess = false
          if (res.data.code === 0) {
            this.$msgSucClose('上传成功!')
            this.fileListUpload.push(Object.assign({}, res.data.data, { uid }))
          }
        })
    },
    // 上传进度条
    handleProgress(file, fileList) {
      this.processLength = 0
      this.showProcess = true
      const interval = setInterval(() => {
        if (this.processLength >= 99) {
          clearInterval(interval)
          return
        }
        this.processLength += 1
      }, 200)
    },
    // 保存
    submit(type) {
      let { contractName,contractNoPrefix,isStandard,effectStartDate,effectEndDate,effectDate,isEffectDate,isSingle,
        contractRelCustList,contractCompanyList,remark,nonpartyCustName,nonpartyUscc,businessType,effectBeginDate,
        contractSignType,settleCycle,isPayDeposit,depositAmount,depositCurrency,creditAmountUsd,creditAmountCny,contractNo
      } = this.form
      this.$refs['form'].validate((valid) => {
        if (valid) {
          // 公共数据处理
          this.form.custType = this.custType
          if(this.fileListUpload.length===0){
            return this.$msgErrClose('合同文件为必填项!')
          }
          this.form.fileList = this.fileListUpload.map((item) => {
            const { fileNo, name,filePath,fileName} = item
            return {
              fileNo,
              fileName:name?name:fileName,
              filePath
            }
          })
          const contractBusinessTypeList = businessType.map((item) => {
            return {
              businessType: item
            }
          })
          const contractCompanyLists = contractCompanyList.map((item) => {
            const source = this.settleCompanyList.filter(
              (ele) => ele.companyCode === item
            )[0]
            const { companyCode, companyName, companyId } = source
            return {
              companyCode,
              companyName,
              companyId
            }
          })
          //客户保存数据
          if(this.custType==='customer'){
            if (isEffectDate) {
              effectEndDate = '9999-12-31'
            } else if (isSingle) {
              // effectStartDate = ''
              // effectEndDate = ''
            }else {
              effectStartDate = effectDate[0]
              effectEndDate = effectDate[1]
            }
            if(isEffectDate && isSingle){
              return this.$msgErrClose('长期有效和单票有效只能选择一个!')
            }
            if(isEffectDate && !effectStartDate){
              return this.$msgErrClose('长期有效的开始时间必填!')
            }
            if((!isEffectDate&&!isSingle)&&(!effectStartDate||!effectEndDate)){
              return this.$msgErrClose('有效日期必填!')
            }
            const contractRelCustListMap = contractRelCustList.map((item) => {
              const source = this.shareCompany.filter(
                (ele) => ele.custid === item
              )[0]
              const { custid,name } = source
              return {
                custid: this.custid,
                custName: this.custName,
                relCustid: custid,
                relCustName: name
              }
            })
            this.form.companyList = contractCompanyLists
            this.form.relCustList = contractRelCustListMap
            this.form.businessList = contractBusinessTypeList
            this.form.mainApplyDto = {
              contractName:contractName,
              contractNoPrefix:contractNoPrefix,
              contractType:'normal',
              isStandard:isStandard,
              isEffectDate:isEffectDate,
              isSingle:isSingle?'yes':'no',
              effectStartDate:effectStartDate,
              effectDate:effectDate,
              effectEndDate:effectEndDate,
              remark:remark,
              nonpartyCustName:nonpartyCustName,
              nonpartyUscc:nonpartyUscc
            }
            if(type==='draft'){
              this.$emit('submit', this.form)
            }else{
              this.toApprove(this.form)
            }
          }else{
            //供应商保存数据
            if (isEffectDate) {
              effectEndDate = '9999-12-31'
            }else {
              effectBeginDate = effectDate[0]
              effectEndDate = effectDate[1]
            }
            const reg = /^([1-9]\d*)+(\.\d{1,2})?$|^0\.\d{1,2}|0$/
            if (isPayDeposit === 'yes' && !depositAmount) {
              return this.$msgErrClose('押金金额必填')
            }
            if (isPayDeposit === 'yes' && !reg.test(depositAmount)) {
              return this.$msgErrClose('押金金额只支持整数或者两位小数')
            }
            if (creditAmountUsd && !reg.test(creditAmountUsd)) {
            return this.$msgErrClose('信用额度-USD只支持整数或者两位小数')
            }
            if (creditAmountCny && !reg.test(creditAmountCny)) {
              return this.$msgErrClose('信用额度-CNY只支持整数或者两位小数')
            }
            if(isEffectDate && !effectBeginDate){
              return this.$msgErrClose('长期有效的开始日期必填!')
            }
            if((!isEffectDate)&&(!effectBeginDate||!effectEndDate)){
              return this.$msgErrClose('有效日期必填!')
            }
            this.form.companyList = contractCompanyLists
            this.form.businessList = contractBusinessTypeList
            this.form.supplierMainApplyDto = {
              contractName:contractName,
              contractNo:contractNo,
              contractSignType:contractSignType,
              settleCycle:settleCycle,
              isPayDeposit:isPayDeposit,
              depositAmount:depositAmount,
              depositCurrency:depositCurrency,
              creditAmountUsd:creditAmountUsd,
              creditAmountCny:creditAmountCny,
              contractType:'supplier',
              isStandard:isStandard,
              isEffectDate:isEffectDate,
              effectBeginDate:effectBeginDate,
              effectDate:effectDate,
              effectEndDate:effectEndDate,
              remark:remark,
              nonpartyCustName:nonpartyCustName,
              nonpartyUscc:nonpartyUscc
            }
            if(type==='draft'){
              this.$emit('submit', this.form)
            }else{
              this.toApprove(this.form)
            }
          }

        }else{
          return this.$message.error("请将必填项填写完整！")
        }
      })
    },
    //提交审批
    toApprove(source){
      this.btnLoading = true
      if(source.custType ==='customer'){
        submitApplyInfo(source).then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('操作成功!')
            this.cancel()
            this.btnLoading = false
            this.$emit('showrefresh',1)
          }
        })
      }else{
        submitSupplierApplyInfo(source).then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('操作成功!')
            this.cancel()
            this.btnLoading = false
            this.$emit('showrefresh',1)
          }
        })
        
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.follow-add {
  .follow-form {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    max-height: 500px;
    /deep/ .el-form-item {
      width: 50%;
      margin-right: 0;
      display: flex;
      align-items: center;
      .el-form-item__label {
        height: 20px;
        line-height: 20px;
      }
      .el-form-item__content {
        flex: 1;
        // overflow: hidden;
        line-height: 24px;
      }
      .el-input-group {
        vertical-align: baseline;
      }
      .el-input__inner,
      .el-select,
      .el-select__tags {
        height: 20px !important;
        width: 100%;
        line-height: 20%;
        &.middle-item {
          width: 50%;
        }
      }
      .el-date-editor {
        width: 100%;
      }
      .el-input--mini .el-input__icon {
        line-height: 20px;
      }
      .middle-item {
        width: 50%;
      }
      .middle-select-item {
        width:calc(50% - 12px);
      }
      .middle-select-span {
        display: inline-block;
        width:12px;
        text-align: center;
      }
    }

    .flex-item {
      width: 100%;
      textarea {
        width: 100%;
      }
    }
    .file-box {
      font-size: 12px;
    }
    .flex-large {
      width: 100%;
    }
    .contain-box {
      display: flex;
      .item-box {
        width: 100%;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        .item {
          display: flex;
          width: 45%;
          align-items: center;
        }
      }
      .plus-icon {
        font-size: 20px;
        margin-left: 5px;
        cursor: pointer;
        color: #999;
      }
    }
    .felx-option {
      /deep/ .el-form-item__content {
        display: flex;
        align-items: center;
      }
    }
    .addbtn{
      font-size: 12px;
      height: 20px;
      padding: 3px 7px;
      margin-left:10px;
    }

  }
  .dialog-footer {
    padding-top: 20px;
    /deep/.el-button--mini {
      font-size: 12px;
      height: 20px;
      padding: 3px 15px;
    }
  }
  /deep/ .file-upload {
    margin: 0;
    // padding: 0;
    background-color: #fff;
    .file-box {
      padding-top: 5px;
    }
    .el-upload-list__item.is-success .el-upload-list__item-status-label {
      line-height: 20px;
    }
    .el-upload-dragger {
      font-size: 12px;
      .txt-desc {
        color: #bfbfbf;
      }
    }
  }
  .file-list {
    font-size: 12px;
    .file-item {
      cursor: pointer;
      color: #1890ff;
      text-decoration: underline;
      &:hover {
        color: rgb(24, 144, 255);
      }
    }
  }
  .noshow {
    /deep/.el-tag.el-tag--info .el-tag__close {
      display: none;
    }
  }
  .outer-box {
    border: 1px solid #eee;
    margin-bottom: 20px;
    width: 100%;
    border-radius: 4px;
    .title {
      height: 20px;
      line-height: 20px;
      padding: 0 5px;
      background-color: #eee;
      span{color:red;display:inline-block;transform:scale(0.9)}
    }
    .outer-item {
      .item-box {
        display: flex;
        align-items: center;
        padding: 8px 0;
        .item-cnt {
          flex: 1;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          .other-item {
            /deep/ .el-form-item__content {
              display: flex;
              align-items: center;
            }
          }
        }
        .btn-box {
          width: 40px;
          display: flex;
          justify-content: space-around;
          i {
            font-size: 20px;
            cursor: pointer;
            &.el-icon-circle-plus {
              color: #417f90;
              &:hover {
                color: #356572;
              }
            }
            &.el-icon-remove {
              color: #ccc;
              &:hover {
                color: #999;
              }
            }
          }
        }

        .el-form-item {
          width: 48%;
          margin-bottom: 5px;
        }
        .flex-item {
          width: 100%;
        }
      }
      .border {
        border-bottom: 1px dotted #ddd;
      }
    }
  }
  .check-item{font-size:12px;transform: scale(0.9)}
}
</style>