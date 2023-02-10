<template>
  <div class="finance-page" id="finance-page">
      <div class="delay-box" v-if="isVer">
        <el-tag v-if="isVer">邀</el-tag>
        <div v-if="isVer">
          <span>销售{{name}}邀请您一起拜访,请及时确认</span>
          <span class='delay'><button @click="subVisit()">同意</button></span>
          <span class='delay'><button @click="refusevisit()">拒绝</button></span>
      </div>
      </div>
    <div class="detail-title" id="detail-title">
      <div class="title-left">拜访计划</div>
      <div class="title-right">
        <!-- <el-button @click="cancel" size="mini">取消</el-button> -->
        <template v-if="operType === 'check'">
          <el-popconfirm title="确定执行该操作吗？" @onConfirm="checkFn('pass')">
            <el-button slot="reference" type="success" size="mini" class="ml5" :loading="subLoading">审核通过</el-button>
          </el-popconfirm>
          <el-button type="danger" size="mini" @click="checkFn('refuse')" class="ml5">审核不通过</el-button>
        </template>
        <template v-else-if="['add', 'edit'].includes(operType)">
          <!-- <el-popconfirm title="确定提交该拜访计划信息吗？" @onConfirm="saveFn"> -->
            <el-button slot="reference" type="success" size="mini" class="ml5" @click="saveFn()">保存</el-button>
          <!-- </el-popconfirm> -->
        </template>
      </div>
    </div>
    <div class="visit-plan-box">
      <el-form :model="formData" ref="form" :rules="rulesForm" :inline="true" size="mini" label-width="100px" :show-message="false">
        <div v-for="(item, index) in formData.companyInfoList" :key="index" class="visit-plan-company">
          <div class="visit-plan-panel">
            <template v-if="formData.companyInfoList.length > 1">
              <p class="company-title">费用关联公司{{ index+1 }}</p>
            </template>
            <p class="panel-title">公司信息</p>
            <div class="visit-plan-item">
              <el-form-item label="拜访公司：" :prop="`companyInfoList.${index}.custid`" :rules="changeRule" class="normal-input">
                <el-select v-model="item.custid" value-key="custid" filterable clearable remote
                  :remote-method="(str) => { getCustomerList(str) }" @change="(str) => changeComanyName(str, index)" :disabled="isDisabled">
                  <el-option v-for="(custItem, custIndex) in customerList" :key="custIndex" :label="custItem.name || custItem.ename"
                    :value="custItem.custid" :disabled="isDisabled"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="拜访时间：" :prop="`companyInfoList.${index}.companyBusinessInfo.visitDate`" :rules="changeRule"
                class="normal-input">
                <el-date-picker v-model="item.companyBusinessInfo.visitDate" type="date" value-format="yyyy-MM-dd" :disabled="isDisabled"
                  style="width: 212px"></el-date-picker>
              </el-form-item>
              <el-form-item label="拜访地址：" :prop="`companyInfoList.${index}.companyBusinessInfo.visitAddress`" :rules="blurRule"
                class="normal-input">
                <el-input v-model="item.companyBusinessInfo.visitAddress" :disabled="isDisabled" maxlength="100" clearable></el-input>
              </el-form-item>
              <el-form-item label="公司官网：" class="normal-input">
                <el-input v-model="item.companyBusinessInfo.companyAddressWebsite" :disabled="isDisabled" maxlength="100" clearable>
                </el-input>
              </el-form-item>
              <el-form-item label="公司情况介绍：" :prop="`companyInfoList.${index}.companyBusinessInfo.companyProfile`" :rules="blurRule"
                class="long-input">
                <el-input type="textarea" v-model="item.companyBusinessInfo.companyProfile" :disabled="isDisabled"
                  :autosize="{ minRows: 2, maxRows: 6}" maxlength="500" clearable></el-input>
              </el-form-item>
            </div>
          </div>
          <div class="visit-plan-panel">
            <p class="panel-title">联系人信息</p>
            <div class="visit-plan-item">
              <div class="item-box" :class="{ border: custIndex !== item.custVisits.length - 1 }"
                v-for="(custItem, custIndex) in item.custVisits" :key="custIndex">
                <div class="item-cnt">
                  <el-form-item label="联系人姓名：" key="contactId" :rules="changeRule"
                    :prop="`companyInfoList.${index}.custVisits.${custIndex}.contactId`" class="normal-input btn-input" label-width="140px">
                    <el-select v-model="custItem.contactId" value-key="contactId" clearable remote
                      :remote-method="(str) => { getCustContactList(index, custIndex) }"
                      @visible-change="(v) => getCustomerNameList(v, index, custIndex)"
                      @change="(v) => changeCustomerName(v, index, custIndex)" :disabled="isDisabled || !item.custid">
                      <el-option v-for="(cItem, cIndex) in custContactList" :key="cItem.oid + cIndex" :label="cItem.name + cItem.ename"
                        :value="cItem.oid"></el-option>
                    </el-select>
                    <el-button v-if="!isDisabled" size="mini" type="primary" class="addbtn" @click="addLinkInfo('add', index, custIndex)"
                      :disabled="!item.custid">新增</el-button>
                    <el-button v-if="!isDisabled && custItem.contactId" size="mini" type="success" class="addbtn"
                      @click="addLinkInfo('edit', index, custIndex)" :disabled="!item.custid">编辑</el-button>
                  </el-form-item>
                  <el-form-item key="custContactPosition" label="联系人职位：" class="normal-input" label-width="140px">
                    <el-select v-model="custItem.custContactPosition" disabled clearable>
                      <el-option v-for="(item, index) in dictMap['customerRelationPosition']" :key="index" :label="item.label"
                        :value="item.value"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item key="mobileNo" label="电话号码：" class="normal-input" label-width="140px">
                    <el-input v-model="custItem.mobileNo" :maxlength="32" disabled></el-input>
                  </el-form-item>
                  <el-form-item key="email" label="email：" class="normal-input" label-width="140px">
                    <el-input v-model="custItem.email" :maxlength="32" disabled></el-input>
                  </el-form-item>
                </div>
                <div class="btn-box" v-if="!isDisabled">
                  <i class="el-icon-circle-plus" v-if="!custIndex" @click="addItem('custVisits', index)"></i>
                  <el-popconfirm v-if="item.custVisits.length === 1 ? custIndex : custIndex > -1" title="确定移除该信息吗？"
                    @onConfirm="removeItem('custVisits', index, custIndex)">
                    <i slot="reference" class="el-icon-remove" title="移除"></i>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
          <div class="visit-plan-panel">
            <p class="panel-title">客户营业额</p>
            <div class="visit-plan-item">
              <div class="item-box" :class="{ border: cTurnIndex !== item.custTurnovers.length - 1 }"
                v-for="(cTurnItem, cTurnIndex) in item.custTurnovers" :key="cTurnIndex">
                <div class="item-cnt">
                  <el-form-item label="年度：" key="turnoverYear" label-width="150px" class="normal-input">
                    <el-date-picker v-model="cTurnItem.turnoverYear" type="year" value-format="yyyy" :picker-options="pickerOptions" :disabled="isDisabled">
                    </el-date-picker>
                  </el-form-item>
                  <el-form-item label="客户营业额：" key="turnoverPoar" label-width="150px" class="two-normal-input">
                    <el-input v-model="cTurnItem.turnoverPoar" class="middle-item" :disabled="isDisabled" maxlength="20" clearable>
                    </el-input>
                    <el-select v-model="cTurnItem.currency" class="middle-item" :disabled="isDisabled" clearable>
                      <el-option v-for="cItem in dictMap['currency']" :key="cItem.value" :label="cItem.label" :value="cItem.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="营业额中出口占比：" key="turnoverExports" label-width="150px" class="export-input">
                    <el-input v-model="cTurnItem.turnoverExports" maxlength="20" clearable :disabled="isDisabled"></el-input>
                  </el-form-item>
                </div>
                <div class="btn-box" v-if="!isDisabled">
                  <i class="el-icon-circle-plus" v-if="!cTurnIndex" @click="addItem('custTurnovers', index)"></i>
                  <el-popconfirm v-if="item.custTurnovers.length === 1 ? cTurnIndex : cTurnIndex > -1" title="确定移除该信息吗？"
                    @onConfirm="removeItem('custTurnovers', index, cTurnIndex)">
                    <i slot="reference" class="el-icon-remove" title="移除"></i>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
          <div class="visit-plan-panel">
            <p class="panel-title">业务信息<span v-if="formData.companyInfoList.length > 1">{{ index + 1 }}</span></p>
            <div class="visit-plan-item justify-start">
              <el-form-item label="外贸业务人员结构：" :prop="`companyInfoList.${index}.companyBusinessInfo.foreignTradePersonnel`" :rules="blurRule"
                class="long-input" label-width="125px">
                <el-input type="textarea" v-model="item.companyBusinessInfo.foreignTradePersonnel" :autosize="{minRows:1, maxRows:6}"
                  :disabled="isDisabled" maxlength="500" clearable>
                </el-input>
              </el-form-item>
              <el-form-item label="业务情况：" :prop="`companyInfoList.${index}.companyBusinessInfo.businessSituation`" :rules="blurRule"
                class="long-input" label-width="125px">
                <el-input type="textarea" v-model="item.companyBusinessInfo.businessSituation" placeholder="外贸占比公司 ？ 是否有海外工程类项目？"
                  :autosize="{minRows:1, maxRows:6}" :disabled="isDisabled" maxlength="500" clearable>
                </el-input>
              </el-form-item>
              <el-form-item label="出口市场：" :prop="`companyInfoList.${index}.companyBusinessInfo.exportMarket`" :rules="blurRule"
                class="long-input" label-width="125px">
                <el-input type="textarea" v-model="item.companyBusinessInfo.exportMarket" :autosize="{minRows:1, maxRows:6}"
                  :disabled="isDisabled" maxlength="100" clearable></el-input>
              </el-form-item>
              <el-form-item label="未来战略国家市场：" :prop="`companyInfoList.${index}.companyBusinessInfo.nationalMarket`" :rules="blurRule"
                class="long-input" label-width="125px">
                <el-input type="textarea" v-model="item.companyBusinessInfo.nationalMarket" :autosize="{minRows:1, maxRows:6}"
                  :disabled="isDisabled" maxlength="500" clearable>
                </el-input>
              </el-form-item>
              <el-form-item label="每月出口量(TEU)：" :prop="`companyInfoList.${index}.companyBusinessInfo.monthlyExports`" :rules="blurRule"
                class="long-input" label-width="125px">
                <el-input v-model="item.companyBusinessInfo.monthlyExports" :disabled="isDisabled" maxlength="20" clearable>
                </el-input>
              </el-form-item>
              <el-form-item label="我司竞争对手：" class="long-input" label-width="125px">
                <el-input type="textarea" v-model="item.companyBusinessInfo.competitor" :autosize="{minRows:1, maxRows:6}"
                  :disabled="isDisabled" maxlength="100" clearable></el-input>
              </el-form-item>
              <el-form-item label="谁在负责询价：" :prop="`companyInfoList.${index}.companyBusinessInfo.inquirer`" :rules="blurRule"
                class="long-input" label-width="125px">
                <el-input v-model="item.companyBusinessInfo.inquirer" :disabled="isDisabled" maxlength="20" clearable></el-input>
              </el-form-item>
              <el-form-item label="延伸信息：" class="long-input" label-width="125px">
                <el-input type="textarea" v-model="item.companyBusinessInfo.extInfo" :autosize="{minRows:1, maxRows:6}"
                  placeholder="客户供应商、客户的客户、行业竞品等信息" :disabled="isDisabled" maxlength="500" clearable></el-input>
              </el-form-item>
            </div>
            <div class="visit-plan-item justify-start">
              <div v-for="(tradeItem, tradeIndex) in item.tradeTermsList" :key="tradeIndex" class="trade-box compound-box">
                <el-form-item :label="!tradeIndex ? `贸易条款及占比：`: ` `"
                  :prop="`companyInfoList.${index}.tradeTermsList.${tradeIndex}.tradeTermsProp`" :rules="changeRule" class="flex-item"
                  label-width="125px">
                  <el-select v-model="tradeItem.tradeTerms" :disabled="isDisabled" clearable>
                    <el-option :label="v.label" :value="v.value" :key="v.value" v-for="v in dictMap['tradeTermsCode']"></el-option>
                  </el-select>
                  <el-input v-model="tradeItem.tradeTermsProp" :disabled="isDisabled" maxlength="20" style="width: 80px;" clearable>
                    <template slot="append">%</template>
                  </el-input>
                </el-form-item>
                <div class="btn-box" v-if="!isDisabled">
                  <i class="el-icon-circle-plus" v-if="!tradeIndex" @click="addItem('tradeTermsList', index)"></i>
                  <el-popconfirm v-if="item.tradeTermsList.length === 1 ? tradeIndex : tradeIndex > -1" title="确定移除该信息吗？"
                    @onConfirm="removeItem('tradeTermsList', index, tradeIndex)">
                    <i slot="reference" class="el-icon-remove" title="移除"></i>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
          <div class="visit-plan-panel">
            <p class="panel-title">产品信息</p>
            <div class="visit-plan-item justify-start">
              <div v-for="(cargosItem, cargosIndex) in item.custCargos" :key="cargosIndex" class="cargos-box compound-box">
                <el-form-item :label="!cargosIndex ? `单柜货值：`: ` `" label-width="110px">
                  <el-select v-model="cargosItem.containerType" style="width:30%" :disabled="isDisabled" clearable>
                    <el-option v-for="item in dictMap['containerTypeShiporder']" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                  <el-input style="width:40%" v-model="cargosItem.singleValue" :disabled="isDisabled" maxlength="20">
                  </el-input>
                  <el-select v-model="cargosItem.currency" style="width:30%" :disabled="isDisabled" clearable>
                    <el-option v-for="item in dictMap['currency']" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
                <div class="btn-box" v-if="!isDisabled">
                  <i class="el-icon-circle-plus" v-if="!cargosIndex" @click="addItem('custCargos', index)"></i>
                  <el-popconfirm v-if="item.custCargos.length === 1 ? cargosIndex : cargosIndex > -1" title="确定移除该信息吗？"
                    @onConfirm="removeItem('custCargos', index, cargosIndex)">
                    <i slot="reference" class="el-icon-remove" title="移除"></i>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
          <div class="visit-plan-panel">
            <div class="visit-plan-item">
              <el-form-item label="物料资料准备：" class="long-input" label-width="110px">
                <el-input type="textarea" v-model="item.companyBusinessInfo.materialDocPrepare" :autosize="{minRows: 1, maxRows: 6}"
                  maxlength="500" :disabled="isDisabled" clearable></el-input>
              </el-form-item>
              <el-form-item label="拜访(访谈)目标：" :prop="`companyInfoList.${index}.companyBusinessInfo.visitTarget`" :rules="blurRule"
                class="long-input" label-width="110px">
                <el-input type="textarea" v-model="item.companyBusinessInfo.visitTarget" :autosize="{minRows: 1, maxRows: 6}"
                  maxlength="500" :disabled="isDisabled" clearable></el-input>
              </el-form-item>
              <el-form-item label="邀约我司陪访人：" class="mult-select-input" label-width="110px">
                <el-select v-model="item.accompanyIdList" value-key="employeeId" filterable clearable multiple remote
                  :remote-method="(str) => { getBaseEmployeeList(str) }" :disabled="isDisabled">
                  <el-option v-for="(aItem, aIndex) in accompanyIdList" :key="`${aItem.employeeId}` + `${aIndex}`" :label="`${aItem.cname || aItem.ename}`"
                    :value="aItem.employeeId" :disabled="isDisabled"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="陪访人分工安排：" :prop="`companyInfoList.${index}.companyBusinessInfo.divisionLabor`"
                :rules="item.accompanyIdList.length ? blurRule : {}" class="long-input" label-width="110px">
                <el-input type="textarea" v-model="item.companyBusinessInfo.divisionLabor" :autosize="{minRows: 1, maxRows: 6}"
                  maxlength="500" :disabled="isDisabled" clearable></el-input>
              </el-form-item>
              <el-form-item label="其他信息：" class="long-input" label-width="110px">
                <el-input type="textarea" v-model="item.companyBusinessInfo.remark" :autosize="{minRows: 1, maxRows: 6}" maxlength="500"
                  :disabled="isDisabled" clearable></el-input>
              </el-form-item>
            </div>
          </div>
          <div class="visit-plan-panel no-border-bottom">
            <div class="visit-plan-item align-center">
              <el-form-item v-if="index === formData.companyInfoList.length - 1" label="预报销费用：" prop="claimExpense" :rules="blurRule"
                class="long-input" label-width="110px">
                <el-input v-model="formData.claimExpense" @keyup.native="keyU" @blur="checkNumber" maxlength="20" placeholder="最终报销将不得超过该预报销费用的20%浮动区间" clearable
                  :disabled="isDisabled">
                </el-input>
              </el-form-item>
              <div v-else></div>
              <div v-if="!isDisabled">
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
    </div>
    <!-- 新增联系人信息 -->
    <CrmDialog :multi="true" ref="add" :option="addDialog" @close="closeLinkDialog('add', $event)" />
    <!-- 编辑联系人信息 -->
    <CrmDialog :multi="true" ref="edit" :option="editDialog" @close="closeLinkDialog('edit',$event)" v-if="editDialog.show" />
    <!-- 审核不通过原因 -->
    <CrmDialog v-if="noPassDialog.show" :option="noPassDialog" @close="confirmFn"></CrmDialog>
    <!-- 陪访人不同意 -->
    <CrmDialog :option="dialogRefusevisitLeader" @close="refusevisitClose" v-if="dialogRefusevisitLeader.show"/>
  </div>
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
  name: 'invistDetail',
  components: {
    CrmDialog,
  },
  mixins: [routerMixin],
  data () {
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
      isDisabled: false,
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
      // 审核不通过
      noPassDialog: {
        title: '审核不通过',
        show: false,
        showClear: true,
        btnLoading: false,
        formItems: [
          {
            label: '不通过原因',
            type: 'textarea',
            prop: 'reason',
            maxlength: 512,
            rules:
              [
                { required: true, message: '不通过原因必填', trigger: 'blur' },
                { max: 512, message: '备注最大长度限制512位', trigger: 'blur' }
              ]
          }
        ],
        form: { reason: '' }
      },
      isVer:this.$route.query.tmp?true:false,
      name:this.$route.query.name,
      // 拒绝陪访
      dialogRefusevisitLeader:{
        show: false,
        showClear: true,
        btnLoading: false,
        title: '拒绝陪访',
        text: '确定',
        labelWidth: '100px',
        formItems: [
          {
            label: '拒绝原因',
            type: 'textarea',
            prop: 'reason',
            rules: { ...this.defaultRules }
          },
        ],
        form: {
          reason: '',
        }
      },
      subLoading:false
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
    ...mapState("crm", {
      operType: (state) => state.visitPlanOperType
    }),
  },
  mounted () {
    document.getElementById("detail-title").style.width = document.getElementById("finance-page").offsetWidth + 'px'
    window.onresize = () => (() => {
      document.getElementById("detail-title").style.width = document.getElementById("finance-page").offsetWidth + 'px'
    })();
    // 通过operType获取拜访信息
    if (['detail','check'].includes(this.operType)|| ['detail','check'].includes(this.$route.query.type)) {
      this.getDetail(this.$route.query.visitId)
    }
    this.isDisabled = ['check', 'detail'].includes(this.operType) || this.$route.query.type === 'detail'
  },
  created(){
    if(this.$route.query.tmp){
      this.getDetail(this.$route.query.visitId)
    }
  },
  methods: {
    getDetail(id){
      VISITPLAN.detailOfSingle({visitId:id}).then((res) => {
        this.formData = res.data
        if (this.formData.companyInfoList && this.formData.companyInfoList.length) {
        this.formData.companyInfoList.forEach((item, index) => {
          if (item.custVisits && item.custVisits.length) {
            item.custVisits.forEach((custItem, custIdex) => {
              this.getCustContactList(index, custIdex)
            });
          }
        });
        let companyList = this.formData.companyInfoList
        let arr = []
        for (let i = 0; i < companyList.length; i++) {
          let  obj = {}
          obj.custid = companyList[i].companyBusinessInfo.custid
          obj.name = companyList[i].companyBusinessInfo.companyName
          arr.push(obj)
        }
        this.customerList = arr
      }
      }).catch(() => { })
    },
    // 同意陪访
    subVisit(){
      this.$confirmWarn(`是否确认同意陪访？`, () => {
        VISITPLAN.accompanyToVisitPeopleNotarize({
          visitId: this.$route.query.visitId,
          employeeId:this.$store.state.user.userId,
          isAgree:'pass'
        }).then((res) => {
          this.$msgSucClose('已同意!')
          this.isVer = false
          this.closeRefusevisitTime()
        })
      })
    },
    // 拒绝陪访
    refusevisit(){
      this.dialogRefusevisitLeader.show = true     
    },
    //拒绝陪访
    refusevisitClose(tag){
      if (!tag) {
        return this.closeRefusevisitTime()
      }
      this.dialogRefusevisitLeader.btnLoading = true
      VISITPLAN.accompanyToVisitPeopleNotarize({
        ...this.dialogRefusevisitLeader.form,
          visitId: this.$route.query.visitId,
          employeeId:this.$store.state.user.userId,
          isAgree:'refuse'
      })
        .then((res) => {
          this.$msgSucClose('已拒绝！')
          this.isVer = false
          this.closeRefusevisitTime()
        })
        .finally(() => {
          this.dialogRefusevisitLeader.btnLoading = false
        })
    },
    // 关闭拒绝陪访弹框
    closeRefusevisitTime(){
      this.dialogRefusevisitLeader.show = false
      this.dialogRefusevisitLeader.form = {
        reason: '',
      }
      this.routerPush('VisitPlanDetail', { type: 'detail', visitId: this.$route.query.visitId})
    },
    /**
     * @description: 获取拜访公司列表
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-18 14:49:42
     */
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
          this.customerList = this.customerList.concat(res.data.list) || []
        }
      })
    },
    /**
     * @description: 切换拜访公司，通过拜访公司的custid找出对应的公司名称
     * @param {*} str custid
     * @param {*} index 关联公司索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-18 15:34:48
     */
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
    /**
     * @description: 客户联系人下拉框显示/隐藏时回调
     * @param {*} isShow true-显示 false-隐藏
     * @param {*} index 关联公司索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-17 14:37:19
     */
    getCustomerNameList (isShow, index, custIndex) {
      isShow && this.getCustContactList(index, custIndex)
    },
    /**
     * @description: 切换联系人姓名，回显其它联系人信息
     * @param {*} str 联系人oid
     * @param {*} index 关联公司索引
     * @param {*} custIndex 客情关系索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-18 16:02:28
     */
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
    /**
     * @description: 获取拜访公司联系人信息
     * @param {*} index 关联公司索引
     * @param {*} custIndex 联系人索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-18 15:54:48
     */
    getCustContactList (index, custIndex) {
      this.custContactList = []
      if (this.formData.companyInfoList[index].custid) {
        CONTACT.customerVisitList({ custid: this.formData.companyInfoList[index].custid }).then((res) => {
          if (res.code === 0) {
            this.custContactList = res.data || []
            if (this.custContactList.length) {
              this.custContactList = this.custContactList.filter(item => item.status === 'effect')
              let linkerInfo = this.custContactList.find(item => item.oid === this.formData.companyInfoList[index].custVisits[custIndex].contactId)
              this.formData.companyInfoList[index].custVisits[custIndex].linkerInfo = linkerInfo
              let linkerFields = ['contactId', 'name', 'ename', 'custContactPosition', 'email', 'mobileNo']
              linkerFields.forEach(key => {
                if (key !== 'contactId') {
                  this.formData.companyInfoList[index].custVisits[custIndex][key] = linkerInfo[key]
                } else {
                  this.formData.companyInfoList[index].custVisits[custIndex][key] = linkerInfo.oid
                }
              });
            }
            this.$forceUpdate()
          }
        }).catch(() => { })
      }
    },
    /**
     * @description: 打开新增联系人弹框
     * @param {*} type add-新增 edit-编辑
     * @param {*} index 关联公司索引
     * @param {*} custIndex 联系人索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-18 16:26:02
     */
    addLinkInfo (type, index, custIndex) {
      this.companyIndex = index
      this.custIndex = custIndex
      if (type === 'edit') {
        let row = this.formData.companyInfoList[index].custVisits[custIndex].linkerInfo
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
    /**
     * @description: 关闭新增联系人弹框
     * @param {*} tag 关闭弹框后是否还有其他逻辑操作
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-18 16:26:20
     */
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
        this.getCustContactList(this.companyIndex, this.custIndex)
      })
        .finally(() => {
          this[type + 'Dialog'].btnLoading = false
        })
    },
    /**
     * @description: 获取邀约陪访人
     * @param {*} str
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-18 11:17:00
     */
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
    /**
     * @description: 新增信息模块
     * @param {*} list
     * @param {*} index
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-18 16:53:27
     */
    addItem (list, index) {
      if (index === undefined) { //新增关联公司
        this.formData[list].push(this.$options.data.call(this).formData[list][0])
      } else {
        this.formData.companyInfoList[index][list].push(this.$options.data.call(this).formData.companyInfoList[0][list][0])
      }
    },
    /**
     * @description: 移除信息模块
     * @param {*} list 对象集合
     * @param {*} index 关联公司索引
     * @param {*} sIndex 某个信息模块的索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-18 17:02:46
     */
    removeItem (list, index, sIndex) {
      if (sIndex === undefined) {
        this.formData[list].splice(index, 1)
      } else {
        this.formData.companyInfoList[index][list].splice(sIndex, 1)
      }
    },
    /**
     * @description: 保存拜访计划
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-19 10:01:25
     */
    saveFn () {
      this.$refs['form'].validate((valid) => {
        if (!valid) {
          return this.$message.error("请将必填项填写完整！")
        }
        let data = { ... this.formData }
        data.companyInfoList.forEach(item => {
          item.custVisits.forEach(custItem => {
            this.$delete(custItem, 'linkerInfo')
          })
        })
        VISITPLAN.saveVisitPlan(data).then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('保存成功！')
            this.cancel()
          }
        }).catch(() => { })
      })
    },
    /**
     * @description: 审核
     * @param {*} type pass-审核通过 noPass-审核不通过
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-19 11:28:07
     */
    checkFn (type) {
      if (type === 'pass') {
        this.subLoading = true
        let data = {
          visitId: this.formData.visitId,
          flag: type
        }
        this.checkApi(type, data)
      } else {
        this.noPassDialog.show = true
      }
    },
    /**
     * @description: 确定审核
     * @param {*} tag
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-20 10:54:05
     */
    confirmFn (tag) {
      if (!tag) return (this.noPassDialog.show = false)
      let data = {
        visitId: this.formData.visitId,
        flag: 'refuse',
        ...this.noPassDialog.form
      }
      this.noPassDialog.btnLoading = true
      this.checkApi('refuse', data)
    },
    /**
     * @description: 调用审核接口
     * @param {*} type 审核类型
     * @param {*} data 请求参数
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-20 11:05:24
     */
    checkApi (type, data) {
      VISITPLAN.checkVisitPlan(data).then((res) => {
        if (res.code === 0) {
          if (type === 'refuse') {
            this.noPassDialog.btnLoading = false
            this.noPassDialog.show = false
          }else{
            this.subLoading = false
          }
          this.$msgSucClose('操作成功！')
          this.cancel()
        }
      }).catch(() => {
      }).finally(() => {
        if (type === 'refuse') this.noPassDialog.btnLoading = false
      })
    },
    //取消
    cancel () {
      this.routerDelBack(true)
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
<style scoped lang="scss">
@import '../customerList/scss/detail.scss';
.ml5 {
  margin-left: 5px;
}
.crm-cnt {
  position: relative !important;
}
.finance-page ::v-deep {
  padding-top: 24px;
  .detail-title {
    position: fixed;
    top: 30px;
    width:86%;
    height: 37px;
    padding: 0px 8px;
    border-radius: 4px 4px 0px 0px;
    border-bottom: 1px solid #e9e9e9;
    line-height: 36px;
    overflow: hidden;
    background: #fff;
    z-index: 999;
  }
  .title-left {
    float: left;
    font-size: 13px;
    font-weight: 600;
    color: #222222;
    line-height: 36px;
  }
  .title-right {
    float: right;
  }
}
.visit-plan-box {
  padding: 10px 10px 1px;
  .visit-plan-company {
    background: #f3f3f3;
    padding: 0 10px;
    margin-bottom: 10px;
    .company-title {
      color: #3e80f5;
      font-weight: bold;
      font-size: 15px;
      line-height: 26px;
      padding-bottom: 5px;
    }
    .panel-title {
      font-weight: bold;
      font-size: 14px;
      line-height: 20px;
    }
    .btn-input {
      /deep/ .el-form-item__content {
        width: 313px !important;
        .el-select {
          width: 64% !important;
        }
      }
    }
    .normal-input {
      /deep/ .el-form-item__content {
        width: 200px;
        .el-select {
          width: 100%;
        }
      }
    }
    .two-normal-input {
      /deep/ .el-form-item__content {
        width: 480px;
        .el-input {
          width: 40%;
        }
        .el-select {
          width: 40%;
          .el-input {
            width: 100%;
          }
        }
      }
    }
    .export-input {
      /deep/ .el-form-item__content {
        width: 268px;
        .el-input {
          width: 82%;
        }
      }
    }
    .long-input {
      /deep/ .el-form-item__content {
        width: 608px;
      }
    }
    .mult-select-input {
      /deep/ .el-form-item__content {
        width: 608px;
        .el-select {
          width: 100%;
          .el-select__tags {
            max-width: 100% !important;
            & > span {
              width: auto !important;
              flex-wrap: wrap;
            }
            span.el-tag {
              width: auto !important;
              span.el-select__tags-text {
                width: auto !important;
                margin-right: 5px;
              }
            }
          }
        }
      }
    }
    .addbtn {
      margin-left: 5px;
    }
    .justify-start {
      justify-content: flex-start !important;
    }
    .align-center {
      align-items: center;
    }
    .no-border-bottom {
      border-bottom: 0 !important;
    }
    .visit-plan-panel {
      border-bottom: 1px #bcbcbc dashed;
      padding: 10px 5px;
      .visit-plan-item {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-between;
        /deep/ .el-form-item {
          margin-top: 5px;
        }
        .item-box {
          display: flex;
          align-items: center;
          padding: 8px 0;
          .item-cnt {
            flex: 1;
            display: flex;
            justify-content: flex-start;
            flex-wrap: wrap;
            background: #fff;
            padding: 10px 0;
            .other-item {
              /deep/ .el-form-item__content {
                display: flex;
                align-items: center;
              }
            }
          }
          .el-form-item {
            margin-bottom: 5px;
          }
          .flex-item {
            width: 100%;
          }
        }
        .btn-box {
          width: 45px;
          display: flex;
          justify-content: space-between;
          i {
            font-size: 20px;
            margin-left: 7px;
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
        .compound-box {
          display: flex;
          justify-content: flex-start;
          /deep/ .el-form-item {
            margin-right: 0;
          }
          .btn-box {
            align-items: center;
            justify-content: flex-start;
            & > i {
              margin-left: 5px;
            }
          }
        }
        .trade-box {
          width: 420px;
        }
        .cargos-box {
          width: 610px;
        }
      }
    }
  }
}
.el-form .el-form-item {
  margin-right: 20px;
}

</style>
