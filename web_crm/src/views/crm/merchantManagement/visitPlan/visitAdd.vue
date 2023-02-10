<template>
  <el-dialog
    :before-close="cancel"
    :appendToBody="true"
    :visible.sync="options.show"
    class="visit-add"
    :title="`${visitType}拜访计划`"
    width="1050px"
  >
    <el-form :model="formData" ref="form" :rules="rulesForm" :inline="true" size="mini" label-width="137px" :show-message="false" class="visit-form">
      <div v-for="(item, index) in formData.companyInfoList" :key="index" class="visit-plan-company">
        <div class="visit-plan-panel">
          <template v-if="formData.companyInfoList.length > 1">
            <p class="company-title">费用关联公司{{ index+1 }}</p>
          </template>
        <div class="outer-box">
          <div class="title">公司信息</div>
          <div class="outer-item">
            <div class="item-box">
              <div class="item-cnt">
              <el-form-item label="拜访公司：" :prop="`companyInfoList.${index}.custid`" :rules="changeRule" class="normal-input">
                <el-select v-model="item.custid" value-key="custid" filterable clearable remote
                  :remote-method="(str) => { getCustomerList(str) }" @change="(str) => changeComanyName(str, index)">
                  <el-option v-for="(custItem, custIndex) in customerList" :key="custIndex" :label="custItem.name || custItem.ename"
                    :value="custItem.custid"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="拜访时间：" :prop="`companyInfoList.${index}.companyBusinessInfo.visitDate`" :rules="changeRule"
                class="normal-input">
                <el-date-picker v-model="item.companyBusinessInfo.visitDate" type="date" value-format="yyyy-MM-dd"
                  style="width: 212px"></el-date-picker>
              </el-form-item>
              <el-form-item label="拜访地址：" :prop="`companyInfoList.${index}.companyBusinessInfo.visitAddress`" :rules="blurRule"
                class="normal-input">
                <el-input v-model="item.companyBusinessInfo.visitAddress" maxlength="100" clearable></el-input>
              </el-form-item>
              <el-form-item label="公司官网：" class="normal-input">
                <el-input v-model="item.companyBusinessInfo.companyAddressWebsite" maxlength="100" clearable>
                </el-input>
              </el-form-item>
              <el-form-item label="公司情况介绍：" :prop="`companyInfoList.${index}.companyBusinessInfo.companyProfile`" :rules="blurRule"
                class="long-input">
                <el-input type="textarea" v-model="item.companyBusinessInfo.companyProfile"
                  :autosize="{ minRows: 2, maxRows: 6}" maxlength="500" clearable></el-input>
              </el-form-item>
              </div>
            </div>
          </div>
        </div>
        <div class="outer-box">
          <div class="title">联系人信息</div>
          <div class="outer-item">
            <div class="item-box" :class="{ border: custIndex !== item.custVisits.length - 1 }"
              v-for="(custItem, custIndex) in item.custVisits" :key="custIndex">
              <div class="item-cnt">
                <el-form-item label="联系人姓名：" key="contactId" :rules="changeRule"
                  :prop="`companyInfoList.${index}.custVisits.${custIndex}.contactId`"  class="normal-input">
                  <el-select v-model="custItem.contactId" value-key="contactId" clearable remote class="middle-item"
                    :remote-method="(str) => { getCustContactList(index, custIndex) }"
                    @visible-change="(v) => getCustomerNameList(v, index, custIndex)"
                    @change="(v) => changeCustomerName(v, index, custIndex)">
                    <el-option v-for="(cItem, cIndex) in custContactList" :key="cItem.oid + cIndex" :label="cItem.name + cItem.ename"
                      :value="cItem.oid"></el-option>
                  </el-select>
                  <el-button size="mini" type="primary" class="addbtn" @click="addLinkInfo('add', index, custIndex)"
                    :disabled="!item.custid">新增</el-button>
                  <el-button v-if="custItem.contactId" size="mini" type="success" class="addbtn"
                    @click="addLinkInfo('edit', index, custIndex)" :disabled="!item.custid">编辑</el-button>
                </el-form-item>
                <el-form-item key="custContactPosition" label="联系人职位：" class="normal-input">
                  <el-select v-model="custItem.custContactPosition" disabled clearable>
                    <el-option v-for="(item, index) in dictMap['customerRelationPosition']" :key="index"
                      :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item key="mobileNo" label="电话号码：" class="normal-input">
                  <el-input v-model="custItem.mobileNo" :maxlength="32" disabled></el-input>
                </el-form-item>
                <el-form-item key="email" label="email：" class="normal-input">
                  <el-input v-model="custItem.email" :maxlength="32" disabled></el-input>
                </el-form-item>
              </div>
              <div class="btn-box">
                <i class="el-icon-circle-plus" v-if="!custIndex" @click="addItem('custVisits', index)"></i>
                <el-popconfirm v-if="item.custVisits.length === 1 ? custIndex : custIndex > -1" title="确定移除该信息吗？"
                  @onConfirm="removeItem('custVisits', index, custIndex)">
                  <i slot="reference" class="el-icon-remove" title="移除"></i>
                </el-popconfirm>
              </div>
            </div>
          </div>
        </div>
        </div>
        <div class="outer-box">
          <div class="title">客户营业额</div>
          <div class="outer-item">
            <div class="item-box" :class="{ border: cTurnIndex !== item.custTurnovers.length - 1 }"
              v-for="(cTurnItem, cTurnIndex) in item.custTurnovers" :key="cTurnIndex">
              <div class="item-cnt">
                <el-form-item label="年度：" key="turnoverYear"  class="normal-input">
                  <el-date-picker v-model="cTurnItem.turnoverYear" type="year" value-format="yyyy" :picker-options="pickerOptions">
                  </el-date-picker>
                </el-form-item>
                <el-form-item label="客户营业额：" key="turnoverPoar"  class="two-normal-input">
                  <el-input v-model="cTurnItem.turnoverPoar" class="middle-item"  maxlength="20" clearable>
                  </el-input>
                  <el-select v-model="cTurnItem.currency" class="middle-item"  clearable>
                    <el-option v-for="cItem in dictMap['currency']" :key="cItem.value" :label="cItem.label" :value="cItem.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="营业额中出口占比：" key="turnoverExports">
                  <el-input v-model="cTurnItem.turnoverExports" maxlength="20" clearable></el-input>
                </el-form-item>
              </div>
              <div class="btn-box">
                <i class="el-icon-circle-plus" v-if="!cTurnIndex" @click="addItem('custTurnovers', index)"></i>
                <el-popconfirm v-if="item.custTurnovers.length === 1 ? cTurnIndex : cTurnIndex > -1" title="确定移除该信息吗？"
                  @onConfirm="removeItem('custTurnovers', index, cTurnIndex)">
                  <i slot="reference" class="el-icon-remove" title="移除"></i>
                </el-popconfirm>
              </div>
            </div>
          </div>
        </div>
        <div class="outer-box">
          <div class="title">业务信息<span v-if="formData.companyInfoList.length > 1">{{ index + 1 }}</span></div>
          <div class="outer-item">
            <div class="item-box">
              <div class="item-cnt">
                <el-form-item label="外贸业务人员结构：" :prop="`companyInfoList.${index}.companyBusinessInfo.foreignTradePersonnel`" :rules="blurRule"
                  class="long-input" label-width="125px">
                  <el-input type="textarea" v-model="item.companyBusinessInfo.foreignTradePersonnel" :autosize="{minRows:1, maxRows:6}"
                      maxlength="500" clearable>
                  </el-input>
                </el-form-item>
                <el-form-item label="业务情况：" :prop="`companyInfoList.${index}.companyBusinessInfo.businessSituation`" :rules="blurRule"
                  class="long-input" label-width="125px">
                  <el-input type="textarea" v-model="item.companyBusinessInfo.businessSituation" placeholder="外贸占比公司 ？ 是否有海外工程类项目？"
                    :autosize="{minRows:1, maxRows:6}"   maxlength="500" clearable>
                  </el-input>
                </el-form-item>
                <el-form-item label="出口市场：" :prop="`companyInfoList.${index}.companyBusinessInfo.exportMarket`" :rules="blurRule"
                  class="long-input" label-width="125px">
                  <el-input type="textarea" v-model="item.companyBusinessInfo.exportMarket" :autosize="{minRows:1, maxRows:6}"
                      maxlength="100" clearable></el-input>
                </el-form-item>
                <el-form-item label="未来战略国家市场：" :prop="`companyInfoList.${index}.companyBusinessInfo.nationalMarket`" :rules="blurRule"
                  class="long-input" label-width="125px">
                  <el-input type="textarea" v-model="item.companyBusinessInfo.nationalMarket" :autosize="{minRows:1, maxRows:6}"
                      maxlength="500" clearable>
                  </el-input>
                </el-form-item>
                <el-form-item label="每月出口量(TEU)：" :prop="`companyInfoList.${index}.companyBusinessInfo.monthlyExports`" :rules="blurRule"
                  class="long-input" label-width="125px">
                  <el-input v-model="item.companyBusinessInfo.monthlyExports"   maxlength="20" clearable>
                  </el-input>
                </el-form-item>
                <el-form-item label="我司竞争对手：" class="long-input" label-width="125px">
                  <el-input type="textarea" v-model="item.companyBusinessInfo.competitor" :autosize="{minRows:1, maxRows:6}"
                      maxlength="100" clearable></el-input>
                </el-form-item>
                <el-form-item label="谁在负责询价：" :prop="`companyInfoList.${index}.companyBusinessInfo.inquirer`" :rules="blurRule"
                  class="long-input" label-width="125px">
                  <el-input v-model="item.companyBusinessInfo.inquirer"   maxlength="20" clearable></el-input>
                </el-form-item>
                <el-form-item label="延伸信息：" class="long-input" label-width="125px">
                  <el-input type="textarea" v-model="item.companyBusinessInfo.extInfo" :autosize="{minRows:1, maxRows:6}"
                    placeholder="客户供应商、客户的客户、行业竞品等信息"   maxlength="500" clearable></el-input>
                </el-form-item>
              </div>
            </div>
            <div class="item-box" v-for="(tradeItem, tradeIndex) in item.tradeTermsList" :key="tradeIndex">
              <div class="item-cnt">
                <el-form-item :label="!tradeIndex ? `贸易条款及占比：`: ` `"
                  :prop="`companyInfoList.${index}.tradeTermsList.${tradeIndex}.tradeTermsProp`" :rules="changeRule" class="flex-item">
                  <el-select v-model="tradeItem.tradeTerms"   clearable class="middle-item">
                    <el-option :label="v.label" :value="v.value" :key="v.value" v-for="v in dictMap['tradeTermsCode']"></el-option>
                  </el-select>
                  <el-input v-model="tradeItem.tradeTermsProp"   maxlength="20" clearable class="middle-item">
                    <template slot="append">%</template>
                  </el-input>
                </el-form-item>
              </div>
              <div class="btn-box">
                <i class="el-icon-circle-plus" v-if="!tradeIndex" @click="addItem('tradeTermsList', index)"></i>
                <el-popconfirm v-if="item.tradeTermsList.length === 1 ? tradeIndex : tradeIndex > -1" title="确定移除该信息吗？"
                  @onConfirm="removeItem('tradeTermsList', index, tradeIndex)">
                  <i slot="reference" class="el-icon-remove" title="移除"></i>
                </el-popconfirm>
              </div>
            </div>
          </div>
        </div>
        <div class="outer-box">
          <div class="title">产品信息</div>
          <div class="outer-item">
            <div class="item-box" v-for="(cargosItem, cargosIndex) in item.custCargos" :key="cargosIndex" >
              <div class="item-cnt">
                <el-form-item :label="!cargosIndex ? `单柜货值：`: ` `" label-width="110px">
                  <el-select v-model="cargosItem.containerType" style="width:30%"  clearable>
                    <el-option v-for="item in dictMap['containerTypeShiporder']" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                  <el-input style="width:40%" v-model="cargosItem.singleValue" maxlength="20">
                  </el-input>
                  <el-select v-model="cargosItem.currency" style="width:30%" clearable>
                    <el-option v-for="item in dictMap['currency']" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </div>
              <div class="btn-box">
                <i class="el-icon-circle-plus" v-if="!cargosIndex" @click="addItem('custCargos', index)"></i>
                <el-popconfirm v-if="item.custCargos.length === 1 ? cargosIndex : cargosIndex > -1" title="确定移除该信息吗？"
                  @onConfirm="removeItem('custCargos', index, cargosIndex)">
                  <i slot="reference" class="el-icon-remove" title="移除"></i>
                </el-popconfirm>
              </div>
            </div>
          </div>
        </div>
        <div class="outer-box">
          <div class="title">其他信息</div>
          <div class="outer-item">
            <div class="item-box">
              <div class="item-cnt">
                <el-form-item label="物料资料准备：" class="long-input" label-width="110px">
                  <el-input type="textarea" v-model="item.companyBusinessInfo.materialDocPrepare" :autosize="{minRows: 1, maxRows: 6}"
                    maxlength="500"   clearable></el-input>
                </el-form-item>
                <el-form-item label="拜访(访谈)目标：" :prop="`companyInfoList.${index}.companyBusinessInfo.visitTarget`" :rules="blurRule"
                  class="long-input" label-width="110px">
                  <el-input type="textarea" v-model="item.companyBusinessInfo.visitTarget" :autosize="{minRows: 1, maxRows: 6}"
                    maxlength="500"   clearable></el-input>
                </el-form-item>
                <el-form-item label="邀约我司陪访人：" class="mult-select-input" label-width="110px">
                  <el-select v-model="item.accompanyIdList" value-key="employeeId" filterable clearable multiple remote
                    :remote-method="(str) => { getBaseEmployeeList(str) }"  >
                    <el-option v-for="(aItem, aIndex) in accompanyIdList" :key="`${aItem.employeeId}` + `${aIndex}`" :label="`${aItem.cname || aItem.ename}`"
                      :value="aItem.employeeId"  ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="陪访人分工安排：" :prop="`companyInfoList.${index}.companyBusinessInfo.divisionLabor`"
                  :rules="item.accompanyIdList.length ? blurRule : {}" class="long-input" label-width="110px">
                  <el-input type="textarea" v-model="item.companyBusinessInfo.divisionLabor" :autosize="{minRows: 1, maxRows: 6}"
                    maxlength="500" clearable></el-input>
                </el-form-item>
                <el-form-item label="其他信息：" class="long-input" label-width="110px">
                  <el-input type="textarea" v-model="item.companyBusinessInfo.remark" :autosize="{minRows: 1, maxRows: 6}" maxlength="500"
                      clearable></el-input>
                </el-form-item>
              </div>
            </div>
          </div>
        </div>
        <div class="visit-plan-panel no-border-bottom">
          <div class="visit-plan-item align-center">
            <el-form-item v-if="index === formData.companyInfoList.length - 1" label="预报销费用：" prop="claimExpense" :rules="blurRule"
              class="long-input" label-width="110px">
              <el-input v-model="formData.claimExpense" @keyup.native="keyU" @blur="checkNumber" maxlength="20" placeholder="最终报销将不得超过该预报销费用的20%浮动区间" clearable
                 >
              </el-input>
            </el-form-item>
            <div v-else></div>
            <div class="company-title">
              <el-button v-if="(index > -1)" type="success" size="mini" @click="addItem('companyInfoList')" style="margin-right: 5px">
                新增费用关联公司</el-button>
              <el-popconfirm v-if="formData.companyInfoList.length === 1 ? index : index > -1"
                :title="`此操作会将【费用关联公司${index+1}】的信息全部清空，确定移除？`" @onConfirm="removeItem('companyInfoList', index)">
                <el-button slot="reference" type="danger" size="mini">移除费用关联公司{{index+1}}</el-button>
              </el-popconfirm>
            </div>
          </div>
        </div>
      </div>
      </el-form>
    <div class="dialog-footer" slot="footer" >
      <el-button @click="cancel" size="mini">取消</el-button>
      <el-button @click="saveFn" size="mini" type="primary" :loading="saveLoading">保存</el-button>
    </div>
       <!-- 新增联系人信息 -->
    <CrmDialog :multi="true" ref="add" :option="addDialog" @close="closeLinkDialog('add', $event)" />
    <!-- 编辑联系人信息 -->
    <CrmDialog :multi="true" ref="edit" :option="editDialog" @close="closeLinkDialog('edit',$event)" v-if="editDialog.show" />
    
  </el-dialog>
</template>

<script>
import CrmDialog from '@/views/crm/components/crmDialog'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import VISITPLAN from '@/api/crm/visitPlan'
import CUSTOMER from '@/api/crm/customer'
import CONTACT from '@/api/crm/orgContact'
import { addBaseLinkData as columnsData } from '@/views/crm/data'
import { baseEmployeeList, listByRole } from '@/api/base'
import { mapGetters, mapState } from 'vuex'
import store from '@/store'
// import { validateNumPoint } from '@/utils/validate'
// import { baseSystemLineList } from '@/api/base'
const blurRule = {
  required: true,
  message: '',
  trigger: 'blur',
}
const changeRule = {
  required: true,
  message: '',
  trigger: 'change',
}
export default {
  components: {
    CrmDialog,
  },
  props: {
    options: {
      type: Object,
      default: () => {}
    },
  },
  mixins: [routerMixin],
  data() {
    let ruleMsg = { required: true, message: ' ' }
    let form = {}
    let formItems = columnsData.map((item) => {
      let prop = item.prop
      if (prop === 'belongEmployeeName') {
        prop = 'belongEmployeeId'
        item.DIY = { key: 'employeeId' },
          item.type = 'select'
        item.remote = true
        item.remoteSelectList = []
        item.remoteMethod = (str = '', item) => {
          if (typeof str === 'object') {
            item.remoteSelectList = [str]
            return
          }
          const data = {
            currPage: 1,
            pageSize: 10,
            query: [
              { column: 'name', type: 'eq', value: str },
              {
                column: 'roleCode',
                type: 'in',
                value: 'bd'
              }
            ]
          }
          listByRole(data)
            .then((res) => {
              if (res.code === 0) {
                item.remoteSelectList = res.data.list.map(ele => {
                  return { ...ele, label: ele.cname, value: ele.employeeId + '' }
                })
              }
            })
            .catch(() => { })
        }
      } else if (prop === 'custContactPosition') {
        item.r = true
      }

      form[prop] = ''
      return { ...item, prop, rules: item.r ? ruleMsg : undefined }
    })
    return {
      blurRule,
      changeRule,
      custContactList: [], //联系人列表
      formData: {
        visitId: "",
        status: "",
        claimExpense: "",
        companyInfoList: [
          {
            custid: "",
            orgid: "",
            isWhitelist: "",
            industry: "",
            companyBusinessInfo: {
              companyName: "",
              visitDate: "",
              visitAddress: "",
              companyAddressWebsite: "",
              companyProfile: "",
              divisionLabor: "",
              foreignTradePersonnel: "",
              businessSituation: "",
              exportMarket: "",
              nationalMarket: "",
              monthlyExports: "",
              competitor: "",
              inquirer: "",
              extInfo: "",
              materialDocPrepare: "",
              visitTarget: "",
              remark: ""
            },
            accompanyIdList: [],
            custVisits: [{
              contactId: "",
              name: "",
              ename: "",
              custContactPosition: "",
              email: "",
              mobileNo: "",
              linkerInfo: {}
            }],
            tradeTermsList: [
              {
                tradeTerms: "",
                tradeTermsProp: ""
              }
            ],
            custCargos: [
              {
                containerType: "",
                singleValue: "",
                currency: ""
              }
            ],
            custTurnovers: [
              {
                turnoverYear: "",
                turnoverPoar: "",
                currency: "",
                turnoverExports: ""
              }]
          }
        ]
      },
      rulesForm: {},
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      accompanyIdList: [],
      customerList: [],
      addDialog: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '新增联系人信息',
        text: '新增',
        formItems: formItems,
        form,
        width: "700px"
      },
      editDialog: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '编辑联系人信息',
        text: '确认',
        formItems: formItems.map(item => ({ ...item, noRemote: true })),
        form,
        width: "700px"
      },
      companyIndex: 0,
      custIndex: 0,
      changeVip:false,
      saveLoading:false
    }
  },
  created() {
    if (this.options.isEdit){
      this.formData  = this.options.form
      this.oldData = JSON.parse(JSON.stringify(this.options.form))
    }else{
      // console.log('新增')
    }
  },
  watch: {

  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    ...mapState("crm", {
      operType: (state) => state.visitPlanOperType
    }),
    commuTypeList() {
      return this.dictMap['custCommType'].filter(
        (item) => item.value !== 'order_record'
      )
    },
    visitType(){
      if(this.options.isEdit){
        return '编辑'
      }else{
         return '新增'
      }
     
    },
  },
  methods: {
    // 取消
    cancel() {
      this.$emit('cancel')
    },
    getCustomerList (str) {
      const query = str ? [{ column: 'name', type: 'like', value: str }] : []
      CUSTOMER.visitCustomerList({
        currPage: 1,
        pageSize: 1000,
        verifyStatus: 'all',
        custMode: '',
        query
      }).then((res) => {
        if (res.code === 0) {
          this.customerList = res.data.list || []
        }
      })
    },
    changeComanyName (str, index) {
      if (str) {
        let findObj = this.customerList.find(item => item.custid === str)
        if (findObj) {
          this.formData.companyInfoList[index].orgid = findObj.orgid
          this.formData.companyInfoList[index].companyBusinessInfo.companyName = findObj.name || findObj.ename
          this.formData.companyInfoList[index].industry = findObj.industry
          this.formData.companyInfoList[index].isWhitelist = findObj.isWhitelist
          this.formData.companyInfoList[index].companyBusinessInfo.visitAddress = findObj.detailAddr
        }
      } else {
        this.formData.companyInfoList[index].orgid = ""
        this.formData.companyInfoList[index].companyBusinessInfo.companyName = ""
        this.formData.companyInfoList[index].industry = ""
        this.formData.companyInfoList[index].isWhitelist = ""
        this.formData.companyInfoList[index].companyBusinessInfo.visitAddress = ""
      }
      // 清空客情关系
      this.formData.companyInfoList[index].custVisits = this.$options.data.call(this).formData.companyInfoList[0].custVisits
    },
    getCustomerNameList (isShow, index, custIndex) {
      isShow && this.getCustContactList(index, custIndex)
    },
    changeCustomerName (str, index, custIndex) {
      let linkerFields = ['contactId', 'name', 'ename', 'custContactPosition', 'email', 'mobileNo']
      if (str) {
        let findObj = this.custContactList.find(item => item.oid === str)
        if (findObj) {
          linkerFields.forEach(key => {
            if (key !== 'contactId') {
              this.formData.companyInfoList[index].custVisits[custIndex][key] = findObj[key]
            } else {
              this.formData.companyInfoList[index].custVisits[custIndex][key] = str
            }
          });
        }
        this.formData.companyInfoList[index].custVisits[custIndex].linkerInfo = this.custContactList.find(item => item.oid === this.formData.companyInfoList[index].custVisits[custIndex].contactId)
      } else {
        linkerFields.forEach(key => {
          this.formData.companyInfoList[index].custVisits[custIndex][key] = ""
        });
        this.formData.companyInfoList[index].custVisits[custIndex].linkerInfo = {}
      }
    },
    getCustContactList (index, custIndex,type) {
      this.custContactList = []
      if (this.formData.companyInfoList[index].custid) {
        CONTACT.customerVisitList({ custid: this.formData.companyInfoList[index].custid }).then((res) => {
          if (res.code === 0) {
            this.custContactList = res.data || []
            if (this.custContactList.length) {
              this.custContactList = this.custContactList.filter(item => item.status === 'effect')
              let linkerInfo = {};
              if(type==='add'){
                linkerInfo  = this.custContactList[this.custContactList.length-1]
              }else if(type==='edit'){
                linkerInfo = this.custContactList.find(item => item.oid === this.formData.companyInfoList[index].custVisits[custIndex].contactId)
              }else{
                linkerInfo = ''
              }
              this.contactDatas(linkerInfo,index,custIndex)
            }
            this.$forceUpdate()
          }
        }).catch(() => { })
      }
    },
        //选择后赋值
    contactDatas(contact,index,custIndex){
      if(contact){
        this.formData.companyInfoList[index].custVisits[custIndex].contactId = contact.oid
        this.formData.companyInfoList[index].custVisits[custIndex].name =contact.name
        this.formData.companyInfoList[index].custVisits[custIndex].ename =contact.ename
        this.formData.companyInfoList[index].custVisits[custIndex].custContactPosition =contact.custContactPosition
        this.formData.companyInfoList[index].custVisits[custIndex].email =contact.email
        this.formData.companyInfoList[index].custVisits[custIndex].mobileNo =contact.mobileNo
        this.formData.companyInfoList[index].custVisits[custIndex].linkerInfo = contact
      }
    },
    addLinkInfo (type, index, custIndex) {
      this.companyIndex = index
      this.custIndex = custIndex
      if (type === 'edit') {
        // let row = this.formData.companyInfoList[index].custVisits[custIndex].linkerInfo
        let row = this.formData.companyInfoList[index].custVisits[custIndex]
        let { belongEmployeeName, belongEmployeeId } = row
        row.belongEmployeeId = row.belongEmployeeId ? { label: belongEmployeeName, value: belongEmployeeId } : ''
        let source = this.editDialog.formItems.find(item => item.prop === 'belongEmployeeId')
        belongEmployeeId && source.remoteMethod({ label: belongEmployeeName, value: belongEmployeeId }, source)
        setTimeout(() => {
          this.editDialog.form = JSON.parse(JSON.stringify(Object.assign({}, row)))
        }, 0);
      }
      // 关联公司为白名单客户或【通信产业】、【智能制造产业】客户，教育行业等字段必填
      let formItems = this[type + 'Dialog'].formItems.map(item => {
        let prop = item.prop
        if (['eduBack', 'familyBack', 'professionalBack', 'hobbies', 'other'].includes(prop)) {
          let industry = ''
          if (this.formData.companyInfoList[index].industry !== '' && this.formData.companyInfoList[index].industry.includes('[')) {
            industry = JSON.parse(this.formData.companyInfoList[index].industry)[0]
          }
          item.r = this.formData.companyInfoList[index].isWhitelist === 'yes' || ['通信产业', '智能制造产业'].includes(industry)
        }
        return { ...item, prop, rules: item.r ? { required: true, message: ' ' } : undefined }
      })
      this[type + 'Dialog'].formItems = formItems
      this[type + 'Dialog'].show = true
    },
    //关闭新增编辑
    closeLinkDialog (type, tag) {
      if (!tag) return (this[type + 'Dialog'].show = false)
      let data = { ...this[type + 'Dialog'].form, orgid: this.formData.companyInfoList[this.companyIndex].orgid, custid: this.formData.companyInfoList[this.companyIndex].custid }
      if (data.belongEmployeeId) {
        let { cname, employeeId } = data.belongEmployeeId
        data.belongEmployeeId = employeeId
        data.belongEmployeeName = cname
      }
      if (!data.name && !data.ename) {
        return this.$msgErrClose('中文名和英文名至少填一个！')
      }
      this[type + 'Dialog'].btnLoading = true
      let methods = type === 'edit' ? 'editCustomerContact' : 'addCustomerContact'
      CONTACT[methods](data).then(() => {
        let ref = this.$refs[type].$refs.form
        ref.resetFields()
        this.$nextTick(() => ref.clearValidate())
        this.$nextTick(() => (this[type + 'Dialog'].show = false))
        this.$msgSucClose('操作成功！')
        this.getCustContactList(this.companyIndex, this.custIndex,type)

      })
        .finally(() => {
          this[type + 'Dialog'].btnLoading = false
        })
    },
    //获取邀约陪访人
    getBaseEmployeeList (str = '') {
      // if (!str && this.isDisabled) {
      //   return
      // }
      const data = {
        columns: [],
        currPage: 1,
        pageSize: 1000,
        query: [{ column: 'name', type: 'eq', value: str }]
      }
      baseEmployeeList(data)
        .then((res) => {
          if (res.code === 0) {
            this.accompanyIdList = res.data.list
          }
        })
        .catch(() => { })
    },
    // 新增+

    addItem (list, index) {
      if (index === undefined) { //新增关联公司
        this.formData[list].push(this.$options.data.call(this).formData[list][0])
      } else {
        this.formData.companyInfoList[index][list].push(this.$options.data.call(this).formData.companyInfoList[0][list][0])
      }
    },
    //移除-
    removeItem (list, index, sIndex) {
      if (sIndex === undefined) {
        //移除某个公司
        this.formData[list].splice(index, 1)
      } else {
        this.formData.companyInfoList[index][list].splice(sIndex, 1)
      }
    },
    //保存
    saveFn () {
      this.$refs['form'].validate((valid) => {
        if (!valid) {
          return this.$message.error("请将必填项填写完整！")
        }
        if(this.options.isEdit){
          let oldTime = this.oldData&&this.oldData.companyInfoList
          let newTime = this.formData.companyInfoList
          oldTime.forEach(item => {
            newTime.forEach(api => {
              // 只有修改公司名称、公司地址、拜访时间这3个字段时，才会给陪访人发通知
              if(item.companyBusinessInfo.visitId === api.companyBusinessInfo.visitId){
                if((item.companyBusinessInfo.visitDate !== api.companyBusinessInfo.visitDate) 
                ||(item.companyBusinessInfo.visitAddress !== api.companyBusinessInfo.visitAddress)
                ||(item.companyBusinessInfo.companyName !== api.companyBusinessInfo.companyName)){
                  this.changeVip = true
                }
              }else{
                console.log('没有一样的visitId')
              }
            })
          })
        }
        //判断是否发过邮件了，没发过继续问，发过了就直接保存
        if(this.formData.isSendMail !=='yes'||this.changeVip){
          this.$confirm('是否发送邀约通知给陪访人?', '提示', {
            confirmButtonText: '是',
            cancelButtonText: '否',
            type: 'warning'
          }).then(() => {
            this.submitSave('yes',true)
          }).catch(() => {
            this.submitSave('no')        
          });
        }else{
           this.submitSave('yes')
        }
      })
    },
    submitSave(type,time){
      this.saveLoading = true
        let data = { ... this.formData,isSendMail:type}
        data.companyInfoList.forEach(item => {
          item.custVisits.forEach(custItem => {
            this.$delete(custItem, 'linkerInfo')
          })
        })
        VISITPLAN.saveVisitPlan(data).then((res) => {
          if (res.code === 0) {
            if(time){
              this.$msgSucClose('保存成功并已推送至陪访人!')
              this.options.btnLoading = true
            }else{
              this.$msgSucClose('保存成功!')
              this.options.btnLoading = true
            }
            this.cancel()
          }
        }).finally(() => { 
          this.saveLoading = false
        })
    },
    checkNumber() {
      let obj = this.formData.claimExpense
      obj = obj.toString()
      let s = obj.charAt(obj.length-1)
      if (s === '.') {
        obj = obj.slice(0, obj.length - 1)
      }
      this.formData.claimExpense = Number(obj)
    },
    // 处理输入框小数点两位问题
    keyU(){
      this.formData.claimExpense = this.formData.claimExpense.toString()
      this.formData.claimExpense = this.formData.claimExpense.replace(/[^\d.]/g, "");  //仅保留数字和"."
      this.formData.claimExpense = this.formData.claimExpense.replace(/\.{2,}/g, "."); //两个连续的"."仅保留第一个"."
      this.formData.claimExpense = this.formData.claimExpense.replace(".", "$#*").replace(/\./g,'').replace('$#*','.');//去除其他"."
      this.formData.claimExpense = this.formData.claimExpense.replace(/^(\d+)\.(\d\d).*$/, '$1.$2');;//限制只能输入两个小数
      if (this.formData.claimExpense.indexOf(".") < 0 && this.formData.claimExpense != "") { //首位是0的话去掉
        this.formData.claimExpense = parseFloat(this.formData.claimExpense);
      }
	  },
  }
}
</script>

<style lang="scss" scoped>
.visit-add {
  .visit-form {
    // display: flex;
    // flex-wrap: wrap;
    // justify-content: space-between;
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      // &::before {
      //   content: '*';
      //   color: #ff4949;
      //   margin-right: 4px;
      // }
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
          display: flex;
          // width: 100%;
        }
      }
      .border {
        border-bottom: 1px dotted #ddd;
      }
    }
  }
  .company-title{
    padding-bottom:15px;
  }
}
</style>