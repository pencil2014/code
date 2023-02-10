<template>
    <el-dialog
      :before-close="cancel"
      :appendToBody="true"
      :visible.sync="options.show"
      class="follow-add"
      title="编辑跟进记录"
      width="1050px"
    >
      <!-- disabled: (isManager || isCts) && !isSelf -->
      <el-form
        :inline="true"
        :model="form"
        :rules="rules"
        class="follow-form"
        label-width="137px"
        ref="form"
        size="mini"
      >
        <!-- 公共 -->
        <el-form-item key="commuType" label="跟进方式" prop="commuType">
          <el-select
            v-model="form.commuType"
            placeholder="请选择"
            @change="changeCommuType"
            :disabled="isDisabled"
          >
          <template v-for="item in dictMap['custCommType']">
              <el-option
                v-if="item.value !== 'order_record'" 
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
          </template>
          </el-select>
        </el-form-item>
        <el-form-item key="commuTime" label="跟进时间:" prop="commuTime">
          <el-date-picker
            v-model="form.commuTime"
            type="date"
            placeholder="请选择"
            value-format="yyyy-MM-dd"
            :disabled="isDisabled"
          ></el-date-picker>
        </el-form-item>
        <el-form-item key="custName" label="客户名称:" prop="custName">
          <el-input
            v-model="form.custName"
            placeholder="请填写"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item key="bdEmployeeId" label="跟进人:" prop="bdEmployeeId">
          <el-select
            v-model="form.bdEmployeeId"
            value-key="employeeId"
            filterable
            clearable
            placeholder="请选择"
            remote
            :remote-method="
              (str) => {
                getEmployeeList(str)
              }
            "
           :disabled="isDisabled"
          >
            <el-option
              v-for="(item, index) in employeeList"
              :key="`${item.employeeNo}` + `${index}`"
              :label="`${item.cname}_${item.employeeId}_${
                item.deptCname || '未知'
              }`"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- 拜访 -->
        <template v-if="showVisit">
          <el-form-item key="visitors" label="我司拜访人:" prop="visitors">
            <el-select
              v-model="form.visitors"
              value-key="employeeId"
              filterable
              clearable
              placeholder="请选择"
              multiple
              collapse-tags
              remote
              :remote-method="
                (str) => {
                  getBaseEmployeeList(str)
                }
              "
              :class="{ noshow: isDisabled }"
              :disabled="isDisabled"
            >
              <el-option
                v-for="(item, index) in employeeList2"
                :key="`${item.employeeId}` + `${index}`" 
                :label="`${item.cname}_${item.employeeId}_${
                  item.deptCname || '未知'
                }`"
                :value="item"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item key="ourCompanyPosition" label="拜访人职位:" prop="ourCompanyPosition">
            <el-select 
              v-model="form.ourCompanyPosition"
              placeholder="请选择我司拜访人的职位"
              :disabled="isDisabled"
              clearable>
              <el-option
                v-for="(item, index) in dictMap['customerRelationPosition']"
                :key="index"
                :label="item.label"
                :value="item.label"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="公司规模:" key="companyScale" prop="companyScale" >
            <el-select v-model="form.companyScale" placeholder="请选择" :disabled="isDisabled">
              <el-option
                :key="item.value"
                :label="item.label"
                :value="item.value"
                v-for="item in scaleList"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="公司地址:" prop="companyAddress">
            <el-input
              v-model="form.companyAddress"
              placeholder="请填写"
              :disabled="isDisabled"
            ></el-input>
          </el-form-item>
          <el-form-item label="是否合作:" prop="isCooperation">
            <el-select
              v-model="form.isCooperation"
              placeholder="请选择"
              :disabled="isDisabled"
            >
              <el-option label="是" value="yes"></el-option>
              <el-option label="否" value="no"></el-option>
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
              :disabled="isDisabled"
            >
              <el-option
                :key="item.value"
                :label="item.label"
                :value="item.value"
                v-for="item in dictMap['baseBusinessType']"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item key="shipmentType" label="出货类型:" prop="shipmentType">
            <el-select
              v-model="form.shipmentType"
              placeholder="请选择"
              filterable
              clearable
              multiple
              collapse-tags
              :class="{ noshow: isDisabled }"
              :disabled="isDisabled"
            >
              <el-option
                :key="item.value"
                :label="item.label"
                :value="item.value"
                v-for="item in dictMap['custCommShipmentType']"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="出货频率:"  prop="shipmentFrequency" key="shipmentFrequency">
            <el-select
              v-model="form.shipmentFrequency"
              placeholder="请选择"
              :disabled="isDisabled"
            >
              <el-option
                :key="item.value"
                :label="item.label"
                :value="item.value"
                v-for="item in dictMap['shipmentFrequency']"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="出货货量:" key="shipmentsTeu" prop="shipmentsTeu">
            <el-select v-model="form.shipmentsCycle" placeholder="请选择" class="middle-item" :disabled="isDisabled">
              <el-option
                :key="item.value"
                :label="item.label"
                :value="item.value"
                v-for="item in dictMap['commuCycle']"
              ></el-option>
            </el-select>
            <el-input
              v-model="form.shipmentsTeu"
              placeholder="请填写"
              class="middle-item"
              :disabled="isDisabled"
            >
              <template slot="append">T</template></el-input
            >
          </el-form-item>
          <el-form-item label="长帆目标占比:"  prop="goalProportion"  key="goalProportion">
            <el-input  v-model="form.goalProportion"  placeholder="请填写" maxlength="32" :disabled="isDisabled"></el-input>
          </el-form-item>
          <el-form-item label="询价类型:" prop="inquiryType" >
            <el-select
              v-model="form.inquiryType"
              placeholder="请选择"
              :disabled="isDisabled"
            >
              <el-option
                :key="item.value"
                :label="item.label"
                :value="item.value"
                v-for="item in dictMap['inquiryType']"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="我司的竞争对手:" prop="competitor"  key="competitor" 
            :rules="{
              required: true &&  (this.isIndustry || this.isWhitelist),
              message: ' ',
              trigger: 'change',
            }">
            <el-input
              v-model="form.competitor"
              placeholder="请输入"
              maxlength="128"
              :disabled="isDisabled"
            ></el-input>
          </el-form-item>
          <el-form-item label="客户的竞争对手:" key="custCompetitor" prop="custCompetitor"
            :rules="{
              required: true &&  (this.isIndustry || this.isWhitelist),
              message: ' ',
              trigger: 'change',
            }"
          >
            <el-input
              v-model="form.custCompetitor"
              placeholder="请输入"
              maxlength="128"
              :disabled="isDisabled"
            ></el-input>
          </el-form-item>
          <el-form-item label="客户所在行业排名:">
            <el-date-picker
              v-model="form.rankTime"
              type="year"
              value-format="yyyy"
              placeholder="请选择"
              class="middle-item"
              :picker-options="pickerOptions"
              :disabled="isDisabled"
            ></el-date-picker>
            <el-input
              v-model="form.rank"
              placeholder="例如：排名前3"
              class="middle-item"
              maxlength="32"
              :disabled="isDisabled"
            ></el-input>
          </el-form-item>
          <el-form-item label="客户所占行业市场份额:" prop="marketSharePoar">
            <el-date-picker
              v-model="form.marketShareTime"
              type="year"
              value-format="yyyy"
              placeholder="请选择"
              class="middle-item"
              :picker-options="pickerOptions"
              :disabled="isDisabled"
            ></el-date-picker>
            <el-input
              v-model="form.marketSharePoar"
              placeholder="请输入占比数据"
              class="middle-item"
              :disabled="isDisabled"
            >
            <template slot="append">%</template></el-input>
          </el-form-item>
  
          <!-- 客户联系人 -->
          <div class="outer-box">
            <div class="title">客情描述</div>
              <div class="outer-item">
              <div
                class="item-box"
                :class="{ border: custIndex !== form.custDescription.length - 1 }"
                v-for="(custItem, custIndex) in form.custDescription"
                :key="custIndex"
              >
              <div class="item-cnt">
                <el-form-item  label="姓名:" key="custContact" :prop="`custDescription.${custIndex}.custContact`"
                  :rules="{
                    required: true,
                    message: ' ',
                    trigger: 'change',
                  }">
                  <el-select v-model="custItem.custContact" placeholder="请选择" class="middle-item" 
                   :disabled="isDisabled">
                    <el-option
                      :key="item.value"
                      :label="item.name + item.ename"
                      :value="item.name +'#'+ item.ename +'#'+ item.oid"
                      v-for="item in custContactList"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item key="custContactPosition" label="职位:" :prop="`custDescription.${custIndex}.custContactPosition`">
                  <el-select 
                    v-model="custItem.custContactPosition"
                    placeholder="请选择职位" 
                    clearable
                    disabled>
                    <el-option
                      v-for="(item, index) in dictMap['customerRelationPosition']"
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item key="telephone" label="手机:" :prop="`custDescription.${custIndex}.telephone`" >
                  <el-input 
                    v-model="custItem.telephone"
                    placeholder="请填写"
                    :maxlength="32" 
                    disabled
                  ></el-input>
                </el-form-item>
                <el-form-item key="eduBack" label="教育背景:" :prop="`custDescription.${custIndex}.eduBack`">
                  <el-input 
                    v-model="custItem.eduBack"
                    placeholder="请填写"
                    :maxlength="32"
                    disabled
                  ></el-input>
                </el-form-item>
                <el-form-item key="familyBack" label="家庭背景:" :prop="`custDescription.${custIndex}.familyBack`">
                  <el-input 
                    v-model="custItem.familyBack"
                    placeholder="请填写"
                    :maxlength="32"
                    disabled
                  ></el-input>
                </el-form-item>
                <el-form-item key="professionalBack" label="从业背景:" :prop="`custDescription.${custIndex}.professionalBack`">
                  <el-input 
                    v-model="custItem.professionalBack"
                    placeholder="请填写"
                    :maxlength="32"
                    disabled
                  ></el-input>
                </el-form-item>
                <el-form-item key="hobbies" label="性格爱好:" :prop="`custDescription.${custIndex}.hobbies`">
                  <el-input 
                    v-model="custItem.hobbies"
                    placeholder="请填写"
                    :maxlength="32"
                    disabled
                  ></el-input>
                </el-form-item>
                <el-form-item key="other" label="其他特殊情况或要求:" :prop="`custDescription.${custIndex}.other`">
                  <el-input 
                    v-model="custItem.other"
                    placeholder="请填写"
                    :maxlength="32"
                    disabled
                  ></el-input>
                </el-form-item>
              </div>
              <div class="btn-box">
                
                <!-- <i
                  class="el-icon-circle-plus"
                  v-if="custIndex === 0"
                  @click="addItem('custDescription')"
                ></i>
                <el-popconfirm v-if="form.custDescription.length === 1 ? custIndex : custIndex > -1" title="确定移除该信息吗？"
                  @onConfirm="removeItem('custDescription', custIndex)">
                  <i slot="reference" class="el-icon-remove" title="移除"></i>
                </el-popconfirm> -->
              </div>
              </div>
            </div>
          </div>
  
          <!-- 多选营业额 -->
           <div class="outer-box">
            <div class="title">客户营业额</div>
            <div class="outer-item">
              <div
                class="item-box"
                :class="{ border: index !== form.turnovers.length - 1 }"
                v-for="(item, index) in form.turnovers"
                :key="index"
              >
                <div class="item-cnt">
  
                <el-form-item label="年度:" key="turnoverYear" :prop="`turnovers.${index}.turnoverYear`">
                  <el-date-picker
                    v-model="item.turnoverYear"
                    type="year"
                    value-format="yyyy"
                    placeholder="请选择"
                    :picker-options="pickerOptions"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item label="客户营业额:" key="turnoverPoar" :prop="`turnovers.${index}.turnoverPoar`">
                  <el-input
                    v-model="item.turnoverPoar"
                    placeholder="请输入营业额数据"
                    class="middle-item"
                  ></el-input>
                    <el-select
                      v-model="item.currency"
                      placeholder="请选择"
                       class="middle-item"
                      @change="changeCurrent"
                    >
                      <el-option
                        v-for="item in dictMap['currency']"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-select>
                </el-form-item>
  
                <el-form-item label="营业额中出口占比:" key="turnoverExports" :prop="`turnovers.${index}.turnoverExports`">
                  <el-input
                    v-model="item.turnoverExports"
                    placeholder="请输入"
                    maxlength="128"
                  ></el-input>
                </el-form-item>      
                </div>
                <div class="btn-box">
                  <i
                    class="el-icon-circle-plus"
                    v-if="index === 0"
                    @click="addItem('turnovers')"
                  ></i>
                  <el-popconfirm v-if="form.turnovers.length === 1 ? index : index > -1" title="确定移除该信息吗？"
                    @onConfirm="removeItem('turnovers', index)">
                    <i slot="reference" class="el-icon-remove" title="移除"></i>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
        </template>
        <!-- 出货情况公共 非询价 -->
        <template v-if="!showQuotation">
          <div class="outer-box">
            <div class="title">出货航线</div>
            <div class="outer-item">
              <div
                class="item-box"
                :class="{ border: index !== form.syslines.length - 1 }"
                v-for="(item, index) in form.syslines"
                :key="index"
              >
                <div class="item-cnt">
                  <el-form-item
                    label="大船起运港:"
                    :prop="`syslines.${index}.polPortCode`"
                    :rules="{
                      required: true,
                      message: ' ',
                      trigger: 'change',
                    }"
                  >
                    <el-select
                      v-model="item.polPortCode"
                      placeholder="请选择"
                      filterable
                      clearable
                      remote
                      value-key="portCode"
                      :remote-method="
                        (str) => {
                          getPort(str, 'port_of_basic')
                        }
                      "
                      @visible-change="showPolport"
                    >
                      <el-option
                        :label="`${item.ename}(${item.cname})`"
                        :value="item"
                        :key="item.portCode"
                        v-for="item in polList"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="目的港:"
                    :prop="`syslines.${index}.podPortCode`"
                    :rules="{
                      required: true,
                      message: ' ',
                      trigger: 'change',
                    }"
                  >
                    <el-select
                      v-model="item.podPortCode"
                      placeholder="请选择"
                      filterable
                      clearable
                      remote
                      value-key="portCode"
                      :remote-method="
                        (str) => {
                          getPort(str, 'port_of_destination')
                        }
                      "
                      @change="(data) => changePod(data, index)"
                      @visible-change="showPodport"
                    >
                      <el-option
                        :label="`${item.ename}(${item.cname})`"
                        :value="item"
                        :key="item.portCode"
                        v-for="item in podList"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item  label="航线:"  :prop="`syslines.${index}.commLines`">
                    <el-select v-model="item.commLines" placeholder="请选择" value-key="sysLineCode" 
                      remote :remote-method="getSystemLineList" disabled>
                      <el-option
                        v-for="(item, index) in sysLine"
                        :key="`${item.sysLineCode}` + `${index}`"
                        :label="item.cname"
                        :value="item"
                      ></el-option>
                    </el-select>
                  </el-form-item>               
                  <el-form-item
                    label="周期:"
                    :prop="`syslines.${index}.cycle`"
                    :rules="{
                      required: true,
                      message: ' ',
                      trigger: 'change',
                    }"
                  >
                    <el-select v-model="item.cycle" placeholder="请选择" :style="item.cycle=='free'?'width:30%':'width:100%'">
                      <el-option
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        v-for="item in dictMap['commuCycleFree']"
                      ></el-option>
                    </el-select>
                     <el-date-picker v-model="item.timeDate" type="daterange" v-if="item.cycle=='free'" range-separator="至" 
                     start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" style="width:70%">
                    </el-date-picker>
                  </el-form-item>
                  <el-form-item label="箱型箱量:"
                    :prop="`syslines.${index}.containerNum`"
                    :rules="{
                      required: true,
                      message: ' ',
                      trigger: 'change',
                    }"
                  >
                  <el-select
                    v-model="item.businessType"
                    placeholder="请选择业务类型"
                    style="width:30%"
                    collapse-tags
                  >
                    <el-option
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                      v-for="item in dictMap['baseBusinessType']"
                    ></el-option>
                  </el-select>
                  <el-input
                    style="width:35%"
                    v-model="item.containerNum"
                    placeholder="请输入数量"
                    @keyup.native="item.containerNum = keyU(item.containerNum)" 
                    @blur="item.containerNum = checkNumber(item.containerNum)"
                  ></el-input><span class="middle-select-span">*</span>
                  <el-select
                    v-model="item.containerType"
                    placeholder="请选择"
                    style="width:30%"
                  >
                    <el-option
                      v-for="item in containerTypeList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                  </el-form-item>
                </div>
                <div class="btn-box">
                  <i
                    class="el-icon-circle-plus"
                    v-if="index === 0"
                    @click="addItem('syslines')"
                  ></i>
                  <el-popconfirm v-if="form.syslines.length === 1 ? index : index > -1" title="确定移除该信息吗？"
                    @onConfirm="removeItem('syslines', index)">
                    <i slot="reference" class="el-icon-remove" title="移除"></i>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
          <div class="outer-box">
            <div class="title">贸易条款</div>
            <div class="outer-item">
              <div
                class="item-box"
                :class="{ border: y !== form.tradeTerms.length - 1 }"
                v-for="(option, y) in form.tradeTerms"
                :key="y"
              >
                <div class="item-cnt">
                  <el-form-item
                    label="贸易条款:"
                    class="flex-item"
                    :prop="`tradeTerms.${y}.tradeCode`"
                    :rules="{
                      required: true && !isQQ,
                      message: ' ',
                      trigger: 'change',
                    }"
                  >
                    <el-select v-model="option.tradeCode" placeholder="请选择" :style="(option.tradeCode=='dap'||option.tradeCode=='ddu'||option.tradeCode=='ddp')?'width:30%':'width:100%'">
                      <el-option
                        :label="v.label"
                        :value="v.value"
                        :key="v.value"
                        v-for="v in dictMap['tradeTermsCode']"
                      ></el-option>
                    </el-select>
                   <el-input
                   v-if="option.tradeCode=='dap'||option.tradeCode=='ddu'||option.tradeCode=='ddp'"
                    style="width:70%"
                    v-model="option.shippingAddr"
                    placeholder="请输入收货地址"
                  > </el-input>
                  </el-form-item>
                  <el-form-item
                    label="周期:"
                    :prop="`tradeTerms.${y}.cycle`"
                    :rules="{
                      required: true && !isQQ,
                      message: ' ',
                      trigger: 'change',
                    }"
                  >
                    <el-select v-model="option.cycle" placeholder="请选择" :style="option.cycle=='free'?'width:30%':'width:100%'">
                      <el-option
                        :key="x.value"
                        :label="x.label"
                        :value="x.value"
                        v-for="x in dictMap['commuCycleFree']"
                      ></el-option>
                    </el-select>
                    <el-date-picker v-model="option.timeDate" type="daterange" v-if="option.cycle=='free'" range-separator="至" 
                     start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" style="width:70%">
                    </el-date-picker>
                  </el-form-item>
                  <el-form-item
                    label="箱型箱量:"
                    :prop="`tradeTerms.${y}.containerNum`"
                    :rules="{
                      required: true && !isQQ,
                      message: ' ',
                      trigger: 'change',
                    }"
                  >
                  <el-select
                    v-model="option.businessType"
                    placeholder="请选择业务类型"
                    style="width:30%"
                    collapse-tags
                  >
                    <el-option
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                      v-for="item in dictMap['baseBusinessType']"
                    ></el-option>
                  </el-select>
                  <el-input
                    style="width:35%"
                    v-model="option.containerNum"
                    placeholder="请输入数量"
                    @keyup.native="option.containerNum = keyU(option.containerNum)" 
                    @blur="option.containerNum = checkNumber(option.containerNum)"
                  ></el-input><span class="middle-select-span">*</span>
                  <el-select
                    v-model="option.containerType"
                    placeholder="请选择"
                    style="width:30%"
                  >
                    <el-option
                      v-for="item in containerTypeList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                  </el-form-item>
                </div>
                <div class="btn-box">
                  <i
                    class="el-icon-circle-plus"
                    v-if="y === 0"
                    @click="addItem('tradeTerms')"
                  ></i>
                  <el-popconfirm v-if="form.tradeTerms.length === 1 ? y : y > -1" title="确定移除该信息吗？"
                    @onConfirm="removeItem('tradeTerms', y)">
                    <i slot="reference" class="el-icon-remove" title="移除"></i>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
        </template>
         <!-- 公共 -->
         <div class="outer-box">
            <div class="title">主要产品</div>
            <div class="outer-item">
              <div
                class="item-box"
                :class="{ border: t !== form.cargos.length - 1 }"
                v-for="(op, t) in form.cargos"
                :key="t"
              >
                <div class="item-cnt">
                  <el-form-item
                    label="Hscode:"
                    class="flex-item"
                    :prop="`cargos.${t}.hscode`"
                    :rules="{
                      required: true && !isQQ,
                      message: ' ',
                      trigger: 'change',
                    }"
                  >
                    <el-select
                      v-model="op.hscode"
                      placeholder="请选择"
                      clearable
                      filterable
                      remote
                      :remote-method="getHscode"
                    >
                      <el-option
                        :key="`${o.value}` + `${w}`"
                        :label="o.label"
                        :value="o.value"
                        v-for="(o, w) in hscodeList"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="报关中文品名:"
                    :prop="`cargos.${t}.cname`"
                    :rules="{
                      required: true && !isQQ,
                      message: ' ',
                      trigger: 'change',
                    }"
                  >
                    <el-input v-model="op.cname" placeholder="请填写" maxlength="128"></el-input>
                  </el-form-item>
                  <el-form-item
                    label="报关英文品名:"
                    :prop="`cargos.${t}.ename`"
                    :rules="{
                      required: true && !isQQ,
                      message: ' ',
                      trigger: 'change',
                    }"
                  >
                    <el-input v-model="op.ename" placeholder="请填写" maxlength="128"></el-input>
                  </el-form-item>
                  <el-form-item
                    label="单柜货值:"
                    :prop="`cargos.${t}.singleValue`"
                    :rules="{
                      required: true && !isQQ,
                      message: ' ',
                      trigger: 'change',
                    }"
                  >
                    <el-select
                      v-model="op.containerType"
                      placeholder="请选择"
                      style="width:30%"
                    >
                      <el-option
                        v-for="item in dictMap['containerTypeShiporder']"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-select>
                    <el-input
                      style="width:40%"
                      v-model="op.singleValue"
                      placeholder="请输入货值"
                    ></el-input>
                    <el-select
                      v-model="op.currency"
                      placeholder="请选择"
                      style="width:30%"
                    >
                      <el-option
                        v-for="item in dictMap['currency']"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
  
                </div>
                <div class="btn-box">
                  <i
                    class="el-icon-circle-plus"
                    v-if="t === 0"
                    @click="addItem('cargos')"
                  ></i>
                  <el-popconfirm v-if="form.cargos.length === 1 ? t : t > -1" title="确定移除该信息吗？"
                    @onConfirm="removeItem('cargos', t)">
                    <i slot="reference" class="el-icon-remove" title="移除"></i>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
          <div class="outer-box">
            <div class="title">
              <span>客户主要需求</span>
              <div class="btn">
                <el-popover placement="left" width="500" trigger="click"  @show="getHistoryDemands">
                  <el-table :data="gridData">
                    <el-table-column
                      width="100"
                      property="commuTime"
                      label="跟进时间"
                      :formatter="(row) => row.commuTime.slice(0,10)"
                    ></el-table-column>
                    <el-table-column
                      width="374"
                      property="demands"
                      label="客户主要需求"
                    >
                      <template slot-scope="scope">
                        <p
                          class="item"
                          v-for="(ele, index) in scope.row.demands"
                          :key="index"
                        >
                          {{ dictMapObj['customerDemand'][ele.demandType] }},
                          <span v-if="ele.portPosType"
                            >{{
                              dictMapObj['portPosType'][ele.portPosType]
                            }},</span
                          >
                          {{ ele.remark }}
                        </p>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-button slot="reference" type="text" size="mini"
                    >历史需求</el-button
                  >
                </el-popover>
              </div>
            </div>
            <div class="outer-item">
              <div
                class="item-box"
                :class="{ border: n !== form.demands.length - 1 }"
                v-for="(it, n) in form.demands"
                :key="n"
              >
                <div class="item-cnt">
                  <el-form-item
                    label="需求类型:"
                    :prop="`demands.${n}.demandType`"
                    :rules="{
                      required:true,
                      message: ' ',
                      trigger: 'change',
                    }"
                  >
                    <el-select
                      v-model="it.demandType"
                      placeholder="请选择"
                      class="middle-item"
                    >
                      <el-option
                        :key="x.value"
                        :label="x.label"
                        :value="x.value"
                        v-for="x in dictMap['customerDemand']"
                      ></el-option>
                    </el-select>
                    <el-select
                      v-model="it.portPosType"
                      placeholder="请选择"
                      class="middle-item"
                      v-if="it.demandType === 'additional'"
                    >
                      <el-option
                        :key="x.value"
                        :label="x.label"
                        :value="x.value"
                        v-for="x in dictMap['portPosType']"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="需求描述:"
                    :prop="`demands.${n}.remark`"
                    :rules="{
                      required: true,
                      message: ' ',
                      trigger: 'change',
                    }"
                  >
                    <el-input
                      type="textarea"
                      v-model="it.remark"
                      :placeholder="getText(it)"
                      maxlength="512"
                    ></el-input>
                  </el-form-item>
                </div>
                <div class="btn-box">
                  <i
                    class="el-icon-circle-plus"
                    v-if="n === 0"
                    @click="addItem('demands')"
                  ></i>
                  <el-popconfirm v-if="form.demands.length === 1 ? n : n > -1" title="确定移除该信息吗？"
                    @onConfirm="removeItem('demands', n)">
                    <i slot="reference" class="el-icon-remove" title="移除"></i>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
        <!-- 拜访 -->
        <template v-if="showVisit">
          <el-form-item
            key="materialDocPrepare"
            label="物料、资料准备:"
            prop="materialDocPrepare"
            class="flex-item"
          >
            <el-input
              type="textarea"
              v-model="form.materialDocPrepare"
              placeholder="请填写"
              autosize
              :maxlength="512"
            ></el-input>
          </el-form-item>
          <el-form-item
            key="visitTarget"
            label="拜访(访谈)目标:"
            prop="visitTarget"
            class="flex-item"
          >
            <el-input
              type="textarea"
              v-model="form.visitTarget"
              placeholder="请填写"
              autosize
              :maxlength="512"
            ></el-input>
          </el-form-item>
          <el-form-item
            key="visitCheck"
            label="拜访(访谈)复盘:"
            prop="visitCheck"
            class="flex-item"
          >
            <el-input
              type="textarea"
              v-model="form.visitCheck"
              placeholder="请填写"
              autosize
              :maxlength="2000"
            ></el-input>
          </el-form-item>
          <el-form-item
            key="nextPlan"
            label="下一步计划:"
            prop="nextPlan"
            class="flex-item"
          >
            <el-input
              type="textarea"
              v-model="form.nextPlan"
              placeholder="请填写"
              autosize
              :maxlength="512"
            ></el-input>
          </el-form-item>
          <el-form-item
            key="difficulty"
            label="目前存在困难:"
            prop="difficulty"
            class="flex-item"
          >
            <el-input
              type="textarea"
              v-model="form.difficulty"
              placeholder="例如目前客户要求上哪些暂未满足，或客情关系维护上存在的困难等"
              autosize
              :maxlength="512"
            ></el-input>
          </el-form-item>
          <el-form-item
            key="derivable"
            label="可衍生的&转介绍客户:"
            prop="derivable"
            class="flex-item"
          >
            <el-input
              type="textarea"
              v-model="form.derivable"
              placeholder="请输入可衍生的&转介绍客户"
              autosize
              :maxlength="50"
            ></el-input>
          </el-form-item>
          <el-form-item
            key="extInfo"
            label="延伸信息:"
            prop="extInfo"
            class="flex-item"
          >
            <el-input
              type="textarea"
              v-model="form.extInfo"
              placeholder="例如客户对自身产业未来市场和业务方向的描述，对重点和新兴市场的方向描述，对行业竞争对手或者合作友商的描述等"
              autosize
              :maxlength="512"
            ></el-input>
          </el-form-item>
        </template>
        <!-- 公共 -->
        <el-form-item key="remark" label="备注:" prop="remark" class="flex-item">
          <el-input
            type="textarea"
            v-model="form.remark"
            placeholder="请填写"
            autosize
            :maxlength="512"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="dialog-footer" slot="footer" >
        <el-button @click="cancel" size="mini">取消</el-button>
        <el-button @click="submit" size="mini" type="primary">保存</el-button>
      </div>
    </el-dialog>
  </template>
  
  <script>
  import { mapGetters } from 'vuex'
  import {
    cargoHscodeList,
    baseEmployeeList,
    baseSystemLineList,
    portList,
    portSystemLineInfo,
    listByRole
  } from '@/api/base'
  import { searchBd, demandsList } from '@/api/crm/follow'
  import CUSTOMER from '@/api/crm/customer'
  import CONTACT from '@/api/crm/orgContact'
  import { addBaseLinkData as columnsData } from '@/views/crm/data'
  // import { validateNumPoint } from '@/utils/validate'
  // import { baseSystemLineList } from '@/api/base'
  export default {
    props: {
      options: {
        type: Object,
        default: () => {}
      },
      custid: '',
      companyName: '',
      isSelf: {
        type: Boolean,
        default: false
      },
      isWhitelist: {
        type: Boolean,
        default: false
      },
      isIndustry: {
        type: Boolean,
        default: false
      },
      baseInfo: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        gridData: [],
        employeeList: [],
        employeeList2: [],
        sysLine: [],
        hscodeList: [],
        showVisit: true,
        showQuotation: false,
        showQQ: false,
        showTelephone: false,
        showWechat: false,
        showEmail: false,
        isTrue: true,
        isQQ: true,
        form: {
          qq: '',
          email: '',
          wechat: '',
          telephone: '',
          difficulty: '',
          extInfo: '',
          custDescription:[
            {
              custContact:'',
              custContactPosition:'',
              telephone:'',
              eduBack:'',
              familyBack:'',
              professionalBack:'',
              hobbies:'',
              other:''
            }
          ], //客户联系人
          cargos: [
            {
              cname: '',
              ename: '',
              hscode: '',
              singleValue:'',
              containerType:'',
              currency:'CNY'
            }
          ],   //产品
          syslines: [
            {
              polPortCode: '',
              podPortCode: '',
              cycle: '',
              containerNum: '',
              commLines: '',
              timeDate:'',
              tradeCode:'',
              shippingAddr:'',
              containerType:'',
              businessType:''
            }
          ],//航线
          turnovers:[
            {
              turnoverYear:'',
              turnoverPoar:'',
              currency:'',
              turnoverExports:''
            }
          ],  //营业额
          tradeTerms: [
            {
              tradeCode: '',
              shippingAddr:'',
              cycle: '',
              containerNum: '',
              containerType:'',
              timeDate:'',
              businessType:''
            }
          ], //贸易条款
          demands: [
            {
              demandType: '',
              portPosType: '',
              remark: ''
            }
          ], //需求
          commuType: '',
          commuTime: '',
          custName: '',
          bdEmployeeId: '',
          companyScale: '',
          companyAddress: '',
          custContact: '',
          // custContactPosition: '',
          ourCompanyPosition: '',
          commuMode: '',
          isCooperation: '',
          noCooperationReason: '',
          polPortCode: '',
          polPortName: '',
          podPortCode: '',
          podPortName: '',
          majorProduct: '',
          tradeTermsCode: '',
          cargoSituationType: '',
          cargoSituationNum: '',
          goodsReadyTime: '',
          belongEmployeeId: '',
          materialDocPrepare: '',
          visitTarget: '',
          visitCheck: '',
          nextPlan: '',
          remark: '',
          rankTime: '',
          rank: '',
          visitors: [],
          shipmentType: [],
          shipmentFrequency:'',
          businessType: [],
          goalProportion:'',//长帆目标占比
          shipmentsTeu:'', //T量
          shipmentsCycle:'', //出货量
          competitor:'',//我司的竞争对手
          custCompetitor:'',//客户的竞争对手
          marketShareTime:'',//客户所占市场份额 年份
          marketSharePoar:'',//客户所占市场份额 占比数据
          derivable:'',//可衍生的&转介绍客户
        },
        custContactList:[], //联系人列表
        rules: {
          commuType: {
            required: true,
            message: '跟进方式必选',
            trigger: 'change'
          },
          commuTime: {
            required: true,
            message: '跟进时间必选',
            trigger: 'change'
          },
          custName: {
            required: true,
            message: '客户名称必填',
            trigger: 'change'
          },
          companyScale: {
            required: true,
            message: '公司规模必填',
            trigger: 'change'
          },
          visitors: {
            required: true,
            message: '我司拜访人必选',
            trigger: 'change'
          },
          // custContact: {
          //   required: true,
          //   message: '客户联系人必填',
          //   trigger: 'change'
          // },
          // custContactPosition: {
          //   required: true,
          //   message: '客户联系人职位必填',
          //   trigger: 'change'
          // },
          ourCompanyPosition: {
            required: true,
            message: '我司拜访人职位必填',
            trigger: 'change'
          },
          commuMode: {
            required: true,
            message: '通讯方式必填',
            trigger: 'change'
          },
          companyAddress: {
            required: true,
            message: '公司地址必填',
            trigger: 'change'
          },
          isCooperation: {
            required: true,
            message: '是否合作必选',
            trigger: 'change'
          },
          shipmentType: {
            required: true,
            message: '出货类型必选',
            trigger: 'change'
          },
          shipmentFrequency: {
            required: true,
            message: '出货频率必选',
            trigger: 'change'
          },
          majorProduct: {
            required: true,
            message: '主要产品必填',
            trigger: 'change'
          },
          businessType: {
            required: true,
            message: '业务类型必选',
            trigger: 'change'
          },
          tradeTermsCode: {
            required: true,
            message: '贸易条款必选',
            trigger: 'change'
          },
          inquiryType: {
            required: true,
            message: '询价类型必填',
            trigger: 'change'
          },
          competitor: {
            required: true,
            message: '我司竞争对手必填',
            trigger: 'change'
          },
          custCompetitor: {
            required: true,
            message: '客户竞争对手必填',
            trigger: 'change'
          },
          shipmentsTeu: {
            required: true,
            message: '出货货量必填',
            trigger: 'change'
          },
          goalProportion: {
            required: true,
            message: '长帆目标占比必填',
            trigger: 'change'
          },
          cargoSituationType: {
            required: true,
            message: '货量情况必填',
            trigger: 'change'
          },
          bdEmployeeId: {
            required: true,
            message: '跟进人必选',
            trigger: 'change'
          },
          visitTarget: {
            required: true,
            message: '拜访（访谈）目标必填',
            trigger: 'change'
          },
          visitCheck: {
            required: true,
            message: '拜访（访谈）复盘必填',
            trigger: 'change'
          },
          nextPlan: {
            required: true,
            message: '下一步计划必填',
            trigger: 'change'
          },
          polPortCode: {
            required: true,
            message: '起运港必选',
            trigger: 'change'
          },
          podPortCode: {
            required: true,
            message: '目的港必选',
            trigger: 'change'
          },
          goodsReadyTime: {
            required: true,
            message: '货好时间必选',
            trigger: 'change'
          },
          qq: {
            required: true,
            message: 'QQ必填',
            trigger: 'change'
          },
          wechat: {
            required: true,
            message: '微信必填',
            trigger: 'change'
          },
          email: {
            required: true,
            message: '邮箱必填',
            trigger: 'change'
          },
          telephone: {
            required: true,
            message: '电话号码必填',
            trigger: 'change'
          },
        },
        sizeLimit: true,
        file: '',
        fileList: [],
        fileListUpload: [],
        fileNos: [],
        showProcess: false,
        processLength: 0,
        podList: [],
        polList: [],
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now()
          }
        },
        scaleList: []
      
      }
    },
    created() {
      // 编辑复制
      if (this.options.isEdit || this.options.form.commuId && ['bilateral', 'other'].includes(this.options.form.relationFlag)) {
        const source = this.options.form
        const other = source.visit || source.inquiry
        this.form = Object.assign({}, this.form, source, other)
        const {
          commuType,
          bdEmployeeName,
          visitors,
          businessType,
          shipmentType,
          cargos,
          syslines,
          turnovers,
          custDescription,
          tradeTerms,
          demands,
        } = this.form
        this.changeCommuType(commuType)
        this.getEmployeeList(bdEmployeeName)
        this.form.visitors = visitors.map((item) => {
          const { visitEmployeeId, visitEmployeeName,visitEmployeeMobileNo,visitEmployeeEname } = item
          this.getBaseEmployeeList(visitEmployeeName)
          return {
            cname: visitEmployeeName,
            employeeId: visitEmployeeId,
            mobileNo: visitEmployeeMobileNo,
            ename: visitEmployeeEname
          }
        })
        if (businessType?.length) {
          this.form.businessType = businessType.split(',')
        }
        if (shipmentType?.length) {
          this.form.shipmentType = shipmentType.split(',')
        }
        if (this.form.syslines?.length) {
          this.form.syslines.forEach((item) => {
            const { podPortCode, polPortCode } = item
            portList({
              portAttribute: 'port_of_basic',
              portCodes: podPortCode,
              state: 'valid'
            }).then((res) => {
              item.podPortCode = res.data[0]
              let find = this.podList.find(ele => ele.portCode === res.data[0].portCode)
              !find && this.podList.push(res.data[0])
            })
            portList({
              portAttribute: 'port_of_destination',
              portCodes: polPortCode,
              state: 'valid'
            }).then((res) => {
              item.polPortCode = res.data[0]
              let find = this.polList.find(ele => ele.portCode === res.data[0].portCode)
              !find && this.polList.push(res.data[0])
            })
            item.commLines = {
              cname: item.sysLineCname,
              ename: item.sysLineEname,
              sysLineCode: item.sysLineCode
            }
            item.timeDate = []
            if(item.cycle === 'free'){
              item.timeDate[0] = item.beginTime?item.beginTime:''
              item.timeDate[1] = item.endTime?item.endTime:''
            }
          })
        }
        if (this.form.tradeTerms?.length) {
          this.form.tradeTerms.forEach((item) => {
            item.timeDate = []
            if(item.cycle === 'free'){
              item.timeDate[0] = item.beginTime?item.beginTime:''
              item.timeDate[1] = item.endTime?item.endTime:''
            }
          })
        }
        if (this.form.cargos?.length) {
          this.form.cargos.forEach((item) => {
            if (item.hscode) {
              const data = {
                keyword: item.hscode
              }
              cargoHscodeList(data).then((res) => {
                if (res.code === 0 && res.data?.length) {
                  const source = res.data.find(
                    (ele) => ele.hscode === item.hscode
                  )
                  source &&
                    this.hscodeList.push({
                      ...source,
                      label: source.cargoDesc,
                      value: source.hscode
                    })
                }
              })
            }
          })
        }
        if(this.form.custDescription?.length){
          // console.log('this.form.custDescription',this.form.custDescription)
          this.form.custDescription.forEach((item) => {
            if(item.custContact.includes('#')||item.contactId){
              console.log(item.custContact)
            }else{
              item.custContact = ''
              item.custContactPosition = ''
              item.telephone = ''
              item.eduBack = ''
              item.familyBack = ''
              item.professionalBack = ''
              item.hobbies = ''
              item.other = ''
            }
          })
        }
        // console.log('custDescription',this.form.custDescription)
        // 复制--清空相关数据
        if (!this.options.isEdit) {
          // this.form.commContainerInfos.forEach(item => item.oid = '')
          let emptyData = {}
          if (commuType === 'visit') {
            emptyData = {
              // isCooperation: '',
              // materialDocPrepare: '',
              // visitTarget: '',
              // visitCheck: ''
            }
          }
          this.form = Object.assign(this.form, emptyData, {
            remark: '',
            commuTime: '',
            demands: [
              {
                demandType: '',
                portPosType: '',
                remark: ''
              }
            ]
          })
        }
        // 补齐数据
        const addData = {}
        if (!cargos.length) {
          addData.cargos = [
            {
              cname: '',
              ename: '',
              hscode: '',
              singleValue:'',
              containerType:'',
              currency:''
            }
          ]
        }
        if (!syslines.length) {
          addData.syslines = [
            {
              polPortCode: '',
              podPortCode: '',
              cycle: '',
              containerNum: '',
              commLines: '',
              timeDate:'',
              tradeCode:'',
              shippingAddr:'',
              containerType:'',
              businessType:''
            }
          ]
        }
        if(!custDescription.length){
          addData.custDescription = [
            {
              custContact:'',
              custContactPosition:'',
              telephone:'',
              eduBack:'',
              familyBack:'',
              professionalBack:'',
              hobbies:'',
              other:''
            }
          ]
        }
        if (!turnovers.length) {
          addData.turnovers = [
            {
              turnoverYear:'',
              turnoverPoar:'',
              currency:'',
              turnoverExports:''
            }
          ]
        }
        if (!tradeTerms.length) {
          addData.tradeTerms = [
            {
              tradeCode: '',
              shippingAddr:'',
              cycle: '',
              containerNum: '',
              containerType:'',
              timeDate:'',
              businessType:''
            }
          ]
        }
        if (!demands.length) {
          addData.demands = [
            {
              demandType: '',
              portPosType: '',
              remark: ''
            }
          ]
        }
        this.form = Object.assign(this.form, addData)
      }
    //    else {
    //     // 新增
    //     const { sysUserId, userName,mobileNo } = this.$store.state.user.userInfo
    //     // 如果登录的是obd获取他的上级bd
    //     if (this.isObd) {
    //       this.getSearchBd(this.custid, sysUserId)
    //     } else {
    //       this.form.bdEmployeeId = sysUserId
    //       this.form.bdEmployeeName = userName
    //       this.getEmployeeList(userName)
    //     }
    //     this.form.companyAddress = this.options.form.companyAddress
    //     this.form.custName = this.companyName || this.$route.query.name
    //     this.form.visitors = [
    //       {
    //         cname: userName,
    //         employeeId: sysUserId,
    //         mobileNo:mobileNo,
    //         ename:''
    //       }
    //     ]
    //     this.getBaseEmployeeList(userName)
    //     if (['unilateral'].includes(this.options.form.relationFlag)) {
    //       this.form.relationNewFlag = this.options.form.relationNewFlag
    //       this.form.commuId = this.options.commuId
    //       this.form.commuType = this.options.form.commuType
    //       this.form.commuTime = this.options.form.commuTime
    //       this.form.turnovers = [ ...this.options.form.turnovers ]
    //       this.form.custDescription = [ ...this.options.form.custDescription ]
    //       this.form.materialDocPrepare = this.options.form.materialDocPrepare
    //       this.form.visitTarget = this.options.form.visitTarget
    //       this.form.extInfo = this.options.form.extInfo
    //       if (this.form.custDescription.length) {
    //         this.form.custDescription.forEach(item => {
    //           item.custContact = item.name +'#'+ item.ename +'#'+ item.contactId
    //           item.telephone = item.mobileNo
    //         })
    //       }
    //       if (this.options.form.custCargos.length) {
    //         this.form.cargos = []
    //         this.options.form.custCargos.forEach(item => {
    //           this.form.cargos.push({
    //             containerType: item.containerType,
    //             singleValue: item.singleValue,
    //             currency: item.currency,
    //             cname: '',
    //             ename: '',
    //             hscode: ''
    //           })
    //         })
    //       }
    //     }
    //   }
    this.initData();
    this.getContractData();
      // 控制公司规模
    this.scaleList = this.dictMap['orgScale'].filter((item) => item.value.includes('dp')|| item.value.includes("dc"))

    },
    watch: {
      'form.commuType'(val) {
        if (!val) {
          return
        }
        //通信产业智能产业  白名单
        const sta = this.isIndustry || this.isWhitelist
        if (val === 'visit') {
          this.rules.shipmentType.required = true
          this.rules.isCooperation.required =
            // this.rules.customerSituation.required =
            this.isTrue =
              sta
          this.isQQ = false
        } 
      },
    },
    computed: {
      ...mapGetters(['dictMap', 'dictMapObj']),
      commuTypeList() {
        return this.dictMap['custCommType'].filter(
          (item) => item.value !== 'order_record'
        )
      },
      isObd() {
        return this.$store.state.user.roles.includes('obd')
      },
      isManager() {
        return this.$store.state.user.roles.includes('manager')
      },
      isCts() {
        return this.$store.state.user.roles.includes('cts')
      },
      isDisabled() {
        return (this.isManager || this.isCts) && !this.isSelf
      },
      containerTypeList() {
        let arr = this.dictMap['containerTypeShiporder'].filter(item => item.value !== 'LCL')
        let addTypeArr = [{
          en: 'cbm',
          label: 'CBM',
          value: 'CBM'
        },{
          en: 'kgs',
          label: 'KGS',
          value: 'KGS'
        }]
        arr = arr.concat(addTypeArr)
        return arr
      }
    },
    methods: {
      //获取客户基本信息
      initData(){
        CUSTOMER.verifyInfo({custid:this.$route.query.custid||this.custid}).then((res) => {
          const beseInfo = res.data.organizationDto
          this.form.companyScale = beseInfo.scale
        })
      },
      //获取客户联系人列表
      getContractData(type,oid,index){
        CONTACT.customerList({custid:this.$route.query.custid||this.custid}).then((res) => {
          this.custContactList = res.data.filter(item=>item.status==='effect');
          if(type === 'add'){
            //因为新增数据没有oid,且在最后一个
            let newAdd = res.data[res.data.length-1]
            this.form.custDescription[index].custContact = newAdd.name +'#'+ newAdd.ename +'#'+ newAdd.oid
            this.contactDatas(newAdd,index)
          }else if(type === 'edit'){
            let newAdd  = res.data.find(item=>item.oid === oid)
            this.form.custDescription[index].custContact = newAdd.name +'#'+ newAdd.ename +'#'+ newAdd.oid
            this.contactDatas(newAdd,index)
          }else{
  
          }
        })
      },
      //select选择框
    //   changeCustCon(val,index){
    //     if(val.indexOf("#") == -1){
    //       this.form.custDescription[index].custContact = ''
    //     }
    //     this.getSelectOne(val,index,true)
    //   },
      //选择的那一条详情
    //   getSelectOne(val,index,type){
    //     let oid = val.split('#')[2]
    //     // console.log('custid',this.custid)
    //     CONTACT.customerList({custid:this.$route.query.custid||this.custid}).then((res) => {
    //       this.custContactList = res.data.filter(item=>item.status==='effect');
    //       let contact = this.custContactList.find(item=>item.oid == oid) //选中的那一条
    //       if(type){
    //         // 新增
    //         this.contactDatas(contact,index)
    //       }else{
    //         //编辑弹框
    //         this.$emit('showEdit',false,index,contact)
    //       }
  
    //     })
    //   },
      //选择后赋值
      contactDatas(contact,index){
        if(contact){
          this.form.custDescription[index].custContactPosition = contact.custContactPosition
          this.form.custDescription[index].telephone = contact.mobileNo
          this.form.custDescription[index].eduBack = contact.eduBack
          this.form.custDescription[index].familyBack = contact.familyBack
          this.form.custDescription[index].professionalBack = contact.professionalBack
          this.form.custDescription[index].hobbies = contact.hobbies
          this.form.custDescription[index].other = contact.other
          this.form.custDescription[index].qq = contact.qq
          this.form.custDescription[index].wechat = contact.wechat
          this.form.custDescription[index].email = contact.email
          this.form.custDescription[index].contactId = contact.oid
        }
      },
      // 获取历史主要需求
      getHistoryDemands() {
        if (this.gridData.length) {
          return
        }
        const data = {
          custid: this.custid,
          flag: 'detail',
          bdEmployeeId: this.$store.state.user.userId
        }
        demandsList(data)
          .then((res) => {
            if (res.code === 0) {
              this.gridData = res.data || []
            }
          })
          .catch(() => {})
      },
      // placeholder文字
      getText(row) {
        // after: "港后"
        // among: "港中"
        // before: "港前"
        // additional: "附加要求"
        // limitation: "时效要求"
        // ship_carrier: "船东要求"
        // special_cargo: "特殊货物操作要求"
        let text = ''
        const { demandType, portPosType } = row
        if (demandType === 'ship_carrier') {
          text = '（例如是否指定船东、柜型、柜龄，直达等）'
        } else if (demandType === 'special_cargo') {
          text = '(例如敏感品/超尺寸/特种柜等特殊操作要求）'
        } else if (demandType === 'limitation') {
          text = '（例如报价、POD、异常处理的时效要求等）'
        } else {
          if (portPosType === 'before') {
            text =
              '（例如：报关、装柜、包装、拖车、仓储、码头操作等各环节的特殊需求）'
          } else if (portPosType === 'among') {
            text = '（例如：运输进展反馈等需求）'
          } else if (portPosType === 'after') {
            text =
              '（例如：目的港、清关、派送、海外仓等环节的特殊需求。如涉及派送，主要派送地址？）'
          }
        }
        return text
      },
      // 新增删除货物情况
      addItem(name) {
        const source = {
          cargos: {
              cname: '',
              ename: '',
              hscode: '',
              singleValue:'',
              containerType:'',
              currency:'CNY'
          },
          syslines: {
              polPortCode: '',
              podPortCode: '',
              cycle: '',
              containerNum: '',
              commLines: '',
              timeDate:'',
              tradeCode:'',
              shippingAddr:'',
              containerType:'',
              businessType:''
          },
          turnovers:{
              turnoverYear:'',
              turnoverPoar:'',
              currency:'',
              turnoverExports:''
            },
          custDescription:{
              custContact:'',
              custContactPosition:'',
              telephone:'',
              eduBack:'',
              familyBack:'',
              professionalBack:'',
              hobbies:'',
              other:''
            },
          tradeTerms: {
              tradeCode: '',
              shippingAddr:'',
              cycle: '',
              containerNum: '',
              containerType:'',
              timeDate:'',
              businessType:''
          },
          demands: {
            demandType: '',
            portPosType: '',
            remark: ''
          }
        }
        this.form[name].push(source[name])
      },
      removeItem(name, index) {
        this.form[name].splice(index, 1)
      },
      // 搜索hscode
      getHscode(str = '') {
        if (!str) {
          return
        }
        const data = {
          keyword: str
        }
        cargoHscodeList(data)
          .then((res) => {
            if (res.code === 0) {
              this.hscodeList = res.data.map((item) => {
                const { hscode, cargoDesc } = item
                return {
                  label: cargoDesc,
                  value: hscode
                }
              })
            }
          })
          .catch(() => {})
      },
      // 获取上级bd
      getSearchBd(custid, employeeId) {
        searchBd({ custid, employeeId })
          .then((res) => {
            if (res.data) {
              const { bdEmployeeName, bdEmployeeId } = res.data
              // this.form.bdEmployeeId = bdEmployeeId
              // this.form.bdEmployeeName = bdEmployeeName
              this.getEmployeeList(bdEmployeeName)
            }
          })
          .catch(() => {})
      },
      changeCurrent(){
        console.log('修改币种')
      },
      // 跟进人
      getEmployeeList(str = '') {
        const data = {
          currPage: 1,
          pageSize: 100,
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
              this.employeeList = res.data.list || []
              if (typeof this.form.bdEmployeeId !== 'object') {
                const source = res.data.list.find(
                  (item) => item.employeeId === this.form.bdEmployeeId
                )
                if (source) {
                  return (this.form.bdEmployeeId = source)
                }
                if (this.isObd && str) {
                  if (res.data.list.length) {
                    this.form.bdEmployeeId = res.data.list[0]
                  } else {
                    this.form.bdEmployeeId = ''
                    this.getEmployeeList('')
                  }
                }
              }
            }
          })
          .catch(() => {})
      },
      // 拜访人
      getBaseEmployeeList(str = '') {
        if (!str && this.isDisabled) {
          return
        }
        const data = {
          columns: [],
          currPage: 1,
          pageSize: 100,
          query: [{ column: 'name', type: 'eq', value: str }]
        }
        baseEmployeeList(data)
          .then((res) => {
            if (res.code === 0) {
              if (this.isDisabled) {
                const source = res.data.list.filter((item) => item.cname === str)
                const sta = this.employeeList2.some(
                  (item) => item.employeeId === source[0].employeeId
                )
                if (!sta) {
                  this.employeeList2 = this.employeeList2.concat(source || [])
                }
              } else {
                this.employeeList2 = res.data.list || []
              }
            }
          })
          .catch(() => {})
      },
      // 航线
      getSystemLineList(str = '') {
        baseSystemLineList(str, 'valid')
          .then((res) => {
            this.sysLine = res.data
            // this.sysLine.unshift({
            //   label: '所有航线',
            //   value: '100000001',
            //   ename: 'all'
            // })
          })
          .catch(() => {})
      },
      showLine(val) {
        if (val && !this.sysLine.length) {
          this.getSystemLineList()
        }
      },
      // 起运港port_of_basic，目的港port_of_destination
      getPort(str = '', type) {
        if (str === '') {
          str =
            type === 'port_of_basic'
              ? this.form.polPortName
              : this.form.podPortName
        }
        const data = {
          portName: str,
          portAttribute: type,
          portCodes: '',
          state: 'valid'
        }
        portList(data)
          .then((res) => {
            if (type === 'port_of_basic') {
              this.polList = res.data
              const { polPortCode } = this.form
              if (typeof polPortCode !== 'object') {
                this.form.polPortCode =
                  res.data.find((item) => item.portCode === polPortCode) || ''
              }
            } else {
              this.podList = res.data
              const { podPortCode } = this.form
              if (typeof podPortCode !== 'object') {
                this.form.podPortCode =
                  res.data.find((item) => item.portCode === podPortCode) || ''
              }
            }
          })
          .catch(() => {})
      },
      showPolport(val) {
        if (val && !this.polList.length) {
          this.getPort('', 'port_of_basic')
        }
      },
      showPodport(val) {
        if (val && !this.podList.length) {
          this.getPort('', 'port_of_destination')
        }
      },
      // 切换拜访方式
      changeCommuType(val) {
        // email: "EMAIL"  inquiry_quotation: "询价"  order_record: "下单记录"  qq: "QQ"  telephone: "电话"  visit: "拜访"  wechat: "微信"
        this.showVisit = val === 'visit'
        this.showQuotation = val === 'inquiry_quotation'
        this.showQQ = val === 'qq'
        this.showWechat = val === 'wechat'
        this.showEmail = val === 'email'
        this.showTelephone = val === 'telephone'
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
        if (this.form.visitors.length) {
          const { employeeId, cname } = this.form.visitors[0]
          const find = this.employeeList2.find(
            (item) => item.employeeId === employeeId
          )
          if (!find) {
            this.getBaseEmployeeList(cname)
          }
        }
      },
      // 切换目的港
      changePod(data, index) {
        const { commuType } = this.form
        const { portCode } = data
        if (!commuType || !portCode) {
          return this.$msgErrClose('请先选择跟进方式')
        }
        portSystemLineInfo(portCode)
          .then((res) => {
            if (res.data.length) {
                this.form.syslines[index]['commLines'] = res.data[0]
                this.$forceUpdate()
            }
          })
          .catch(() => {})
      },
      // 取消
      cancel() {
        this.$emit('cancel')
      },
      // 提交
      submit() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            const {
              commuType,
              syslines,
              cargos,
              tradeTerms,
              turnovers,
              custDescription,
              demands,
            } = this.form
            let templateArr = []
            if (custDescription && custDescription.length) {
              templateArr = custDescription.filter((currentValue, currentIndex, selfArr) => {
                return selfArr.findIndex(x => x.contactId === currentValue.contactId) === currentIndex
              })
            }
            let curCommuTime =  new Date(this.form.commuTime);
            let today = new Date()
            let days = today.getTime() - curCommuTime.getTime(); 
            let day = Math.floor(days / (1000 * 60 * 60 * 24)); 
            if(day>7){
              return this.$msgErrClose('跟进时间只能选当天7天以内的时间!')
            }
            if(curCommuTime>today){
              return this.$msgErrClose('跟进时间不能大于今天!')
            } 
            if (custDescription.length > templateArr.length) {
              return this.$msgErrClose('客情描述的联系人信息不能重复！')
            }
            this.form.demands = demands.filter(item => item.demandType || item.portPosType || item.remark)
             const portCode = syslines.some((item) =>  item.polPortCode.portCode === item.podPortCode.portCode)
              if(portCode){
                return this.$msgErrClose('起运港和目的港不能相同')
              }
              const reg = /^\d+(?=\.{0,1}\d+$|$)/;
              const singleVal = cargos.some((item) =>item.singleValue && !reg.test(item.singleValue))
              const containerNum = tradeTerms.some((item) =>item.containerNum && !reg.test(item.containerNum))
              const Poar = turnovers.some((item) =>item.turnoverPoar&& !reg.test(item.turnoverPoar))
              const syslinesConNum = syslines.some((item) =>item.containerNum&& !reg.test(item.containerNum))
              const yaerV = turnovers.some((item) =>(item.turnoverPoar || item.turnoverExports)&&
              !item.turnoverYear)
                if(yaerV){
                  return this.$msgErrClose('营业额的年份也要填写')
                }
                if(singleVal){
                   return this.$msgErrClose('主要产品货值输入格式不正确')
                }
                if(Poar){
                    return this.$msgErrClose('营业额格式不正确')
                }
                if(containerNum){
                    return this.$msgErrClose('贸易条款T量格式不正确')
                }
                if(syslinesConNum){
                    return this.$msgErrClose('出货航线T量格式不正确')
                }
              const syslinesBusinessType = syslines.some((item) =>item.containerNum && !item.businessType)
                if(syslinesBusinessType){
                  return this.$msgErrClose('出货航线中箱型箱量的业务类型必填')
                }
              const tradeTermsBusinessType = tradeTerms.some((item) =>item.containerNum && !item.businessType)
                if(tradeTermsBusinessType){
                  return this.$msgErrClose('贸易条款中箱型箱量的业务类型必填')
                }
  
            if (['visit', 'wechat', 'qq', 'telephone', 'email'].includes(commuType)) {
               if (this.form.shipmentsTeu && !/^\d+$/.test(this.form.shipmentsTeu)) {
                return this.$msgErrClose('出货货量格式不正确')
              }
              // if (this.form.goalProportion && !/^\d+%$/.test(this.form.goalProportion)) {
              //   return this.$msgErrClose('长帆目标占比必须填入百分数，如20%')
              // }
  
            }
            // 拜访
            if (commuType === 'visit') {
              const { rankTime, rank } = this.form
              if (!!rankTime !== !!rank) {
                return this.$msgErrClose('客户所在行业排名必须同时填写')
              }
            }
            if (this.options.isEdit) {
              this.$emit('submit', this.form)
            } else {
              this.$confirm('请确认“跟进时间”正确，保存后将无法修改', '警告', {
                confirmButtonText: '时间正确',
                cancelButtonText: '我要修改',
                type: 'warning'
              })
                .then(() => {
                  this.$emit('submit', this.form)
                })
                .catch(() => {})
            }
          }else{
            return this.$message.error("请将必填项填写完整！")
          }
        })
      },
      checkNumber(val) {
        let obj = val
        obj = obj.toString()
        let s = obj.charAt(obj.length-1)
        if (s === '.') {
          obj = obj.slice(0, obj.length - 1)
        }
        return Number(obj)
      },
      // 处理输入框小数点两位问题
      keyU(val){
        val = val.toString()
        val = val.replace(/[^\d.]/g, "");  //仅保留数字和"."
        val = val.replace(/\.{2,}/g, "."); //两个连续的"."仅保留第一个"."
        val = val.replace(".", "$#*").replace(/\./g,'').replace('$#*','.');//去除其他"."
        // val = val.replace(/^(\d+)\.(\d\d).*$/, '$1.$2');;//限制只能输入两个小数
        if (val.indexOf(".") < 0 && val != "") { //首位是0的话去掉
          val = parseFloat(val);
        }
        return val
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
            width: 100%;
          }
        }
        .border {
          border-bottom: 1px dotted #ddd;
        }
      }
    }
  }
  </style>