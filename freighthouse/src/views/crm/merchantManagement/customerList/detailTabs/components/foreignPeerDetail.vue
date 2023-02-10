<!--
 * @Description: 海外同行基本信息特有的字段
 * @Autor: yinjunying
 * @Date: 2022-07-04 10:30:18
-->
<template>
  <div>
    <div class="tab-box">
      <div class="title">To be shown as Consignee on MBL</div>
      <el-row :gutter="10">
        <el-col :span="3" class="form-title">
          <span>Prepaid contract(rate)</span>
        </el-col>
        <el-col :span="21">
          <el-form :inline="true" v-for="(prepaidItem, prepaidIndex) in foreignPeerInfo.prepaidContractList" :key="prepaidIndex"
            :model="prepaidItem" label-width="110px" size="mini">
            <el-row :gutter="5">
              <el-col :span="23" class="form-box">
                <el-row :gutter="5">
                  <el-col :lg="6" :md="12">
                    <el-form-item label="Country" required class="middle-item">
                      <el-select v-model="prepaidItem.countryCode" placeholder="" filterable remote clearable value-key="countryCode"
                        :remote-method="(str) => { getCountryList(str, prepaidIndex, 'prepaidContractList') }"
                        @visible-change="(isShow) => showCountryList(isShow, prepaidIndex, 'prepaidContractList')"
                        @change="(str) => changeCountryInfo(str, prepaidIndex, 'prepaidContractList')" :disabled="isDisabled">
                        <el-option v-for="optionItem in countryList" :label="optionItem.ename" :value="optionItem.countryCode"
                          :key="optionItem.countryCode">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="6" :md="12">
                    <el-form-item label="Company name" required class="middle-item">
                      <el-input v-model="prepaidItem.companyName" class="middle-item" maxlength="128"
                        @change="(val) => changeCompanyName(val, prepaidItem)" :disabled="isDisabled"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="12" :md="24">
                    <el-form-item label="CNPJ number/RUT number/TAX ID number/other ID number" label-width="400px" required
                      class="middle-item">
                      <el-input v-model="prepaidItem.cnpjNumber" maxlength="128" :disabled="isDisabled"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="6" :md="12">
                    <el-form-item label="POD" class="middle-item">
                      <el-select v-model="prepaidItem.podPortCode" placeholder="" filterable multiple remote clearable collapse-tags
                        value-key="portCode" :remote-method="(str) => { getPort(str) }" @visible-change="(isShow) => isShow && getPort"
                        :disabled="isDisabled" @change="forceUpdate">
                        <el-option v-for="optionItem in podList" :label="`${optionItem.ename}(${optionItem.cname})`"
                          :value="optionItem.portCode" :key="optionItem.portCode">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="6" :md="12">
                    <el-form-item label="AOD" class="middle-item">
                      <el-select v-model="prepaidItem.aodPortCode" placeholder="" filterable multiple remote clearable collapse-tags
                        value-key="portCode" :remote-method="(str) => { getAirPort(str) }"
                        @visible-change="(isShow) => isShow && getAirPort" :disabled="isDisabled" @change="forceUpdate">
                        <el-option v-for="optionItem in aodList" :label="`${optionItem.portCode})`" :value="optionItem.portCode"
                          :key="optionItem.portCode">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="5">
                  <el-col :span="24">
                    <el-form-item label="Address" required class="long-item-info">
                      <el-input type="textarea" v-model="prepaidItem.address" maxlength="512" autosize :disabled="isDisabled"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item label="Contact person"  class="long-item-info">
                      <el-input type="textarea" v-model="prepaidItem.contact" maxlength="512" autosize :disabled="isDisabled"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="12" :md="24">
                    <el-form-item label="Tel"  class="long-item-info">
                      <el-input  v-model="prepaidItem.tel" maxlength="20" autosize :disabled="isDisabled"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="12" :md="24">
                    <el-form-item label="Fax"  class="long-item-info">
                      <el-input  v-model="prepaidItem.fax" maxlength="20" autosize :disabled="isDisabled"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="12" :md="24">
                    <el-form-item label="Contact email"  class="long-item-info">
                      <el-input  v-model="prepaidItem.email" maxlength="20" autosize :disabled="isDisabled"></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-col>
              <el-col :span="1" v-if="!isDisabled">
                <i class="el-icon-circle-plus" title="新增" @click="addFn('prepaidContractList')"></i>
                <el-popconfirm v-if="foreignPeerInfo.prepaidContractList.length === 1 ? prepaidIndex : prepaidIndex > -1" title="确定移除该信息吗？"
                  @onConfirm="removeFn('prepaidContractList', prepaidIndex)">
                  <i slot="reference" class="el-icon-remove" title="移除"></i>
                </el-popconfirm>
              </el-col>
            </el-row>
          </el-form>
        </el-col>
      </el-row>
      <el-row :gutter="5">
        <el-col :span="3" class="form-title"><span>Carrier/Collect contract(rate)</span></el-col>
        <el-col :span="21">
          <el-form :inline="true" v-for="(collectItem, collectIndex) in foreignPeerInfo.collectContractList" :key="collectIndex"
            :model="collectItem" label-width="110px" size="mini">
            <el-row :gutter="5">
              <el-col :span="23" class="form-box">
                <el-row :gutter="5">
                  <el-col :lg="6" :md="12">
                    <el-form-item label="Carrier(sea)" class="middle-item">
                      <el-select v-model="collectItem.carrierSea" placeholder="" filterable remote clearable value-key="carrierCode"
                        :remote-method="(str) => { getSeaShipList(str, collectIndex) }"
                        @visible-change="(isShow) => isShow && getSeaShipList(collectItem.carrierCode)" :disabled="isDisabled"
                        @change="forceUpdate">
                        <el-option v-for="optionItem in seaShipList" :label="optionItem.ename || optionItem.cname"
                          :value="optionItem.carrierCode" :key="optionItem.carrierCode">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="18" :md="12">
                    <el-form-item label="Collect contract" class="long-item-info">
                      <el-input type="textarea" v-model="collectItem.collectContract" maxlength="128" autosize :disabled="isDisabled">
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="6" :md="12">
                    <el-form-item label="Country" class="middle-item">
                      <el-select v-model="collectItem.countryCode" placeholder="" filterable remote clearable value-key="countryCode"
                        :remote-method="(str) => { getCountryList(str, collectIndex, 'collectContractList') }"
                        @visible-change="(isShow) => showCountryList(isShow, collectIndex, 'collectContractList')"
                        @change="(str) => changeCountryInfo(str, collectIndex, 'collectContractList')" :disabled="isDisabled">
                        <el-option v-for="optionItem in countryList" :label="optionItem.ename" :value="optionItem.countryCode"
                          :key="optionItem.countryCode">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="6" :md="12">
                    <el-form-item label="Company name" class="middle-item">
                      <el-input v-model="collectItem.companyName" maxlength="128" @change="(val) => changeCompanyName(val, collectItem)"
                        :disabled="isDisabled">
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="12" :md="24">
                    <el-form-item label="CNPJ number/RUT number/TAX ID number/other ID number" label-width="400px" class="middle-item">
                      <el-input v-model="collectItem.cnpjNumber" class="middle-item" maxlength="128" :disabled="isDisabled"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="6" :md="12">
                    <el-form-item label="POD" class="middle-item">
                      <el-select v-model="collectItem.podPortCode" placeholder="" filterable multiple remote clearable collapse-tags
                        value-key="portCode" :remote-method="(str) => { getPort(str) }" @visible-change="(isShow) => isShow && getPort"
                        :disabled="isDisabled" @change="forceUpdate">
                        <el-option v-for="optionItem in podList" :label="`${optionItem.ename}(${optionItem.cname})`"
                          :value="optionItem.portCode" :key="optionItem.portCode">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="6" :md="12">
                    <el-form-item label="AOD" class="middle-item">
                      <el-select v-model="collectItem.aodPortCode" placeholder="" filterable multiple remote clearable collapse-tags
                        value-key="portCode" :remote-method="(str) => { getAirPort(str) }"
                        @visible-change="(isShow) => isShow && getAirPort" :disabled="isDisabled" @change="forceUpdate">
                        <el-option v-for="optionItem in aodList" :label="`${optionItem.portCode})`" :value="optionItem.portCode"
                          :key="optionItem.portCode">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="5">
                  <el-col :span="24">
                    <el-form-item label="Address" class="long-item-info">
                      <el-input type="textarea" v-model="collectItem.address" maxlength="512" autosize :disabled="isDisabled"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item label="Contact person" class="long-item-info">
                      <el-input type="textarea" v-model="collectItem.contact" maxlength="512" autosize :disabled="isDisabled"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="12" :md="24">
                    <el-form-item label="Tel"  class="long-item-info">
                      <el-input  v-model="collectItem.tel" maxlength="20" autosize :disabled="isDisabled"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="12" :md="24">
                    <el-form-item label="Fax"  class="long-item-info">
                      <el-input  v-model="collectItem.fax" maxlength="20" autosize :disabled="isDisabled"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="12" :md="24">
                    <el-form-item label="Contact email"  class="long-item-info">
                      <el-input  v-model="collectItem.email" maxlength="20" autosize :disabled="isDisabled"></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-col>
              <el-col :span="1" v-if="!isDisabled">
                <i class="el-icon-circle-plus" title="新增" @click="addFn('collectContractList')"></i>
                <el-popconfirm v-if="foreignPeerInfo.collectContractList.length === 1 ? collectIndex : collectIndex > -1" title="确定移除该信息吗？"
                  @onConfirm="removeFn('collectContractList', prepaidIndex)">
                  <i slot="reference" class="el-icon-remove" title="移除"></i>
                </el-popconfirm>
              </el-col>
            </el-row>
          </el-form>
        </el-col>
      </el-row>
    </div>
    <el-form :inline="true" :model="foreignPeerInfo" label-width="135px" size="mini">
      <div class="finance-search-list-gap"></div>
      <div class="tab-box">
        <div class="title">Agent Background</div>
        <el-row :gutter="10">
          <el-col :span="3" class="form-title">
            <span><span class="required-text">*</span>Introduced By</span>
          </el-col>
          <el-col :span="21">
            <el-row :gutter="10">
              <el-col :span="3">
                <el-checkbox v-model="foreignPeerInfo.introduced.isLsbd" true-label="Y" false-label="N" :disabled="isDisabled">LS BD
                </el-checkbox>
              </el-col>
              <el-col :span="21">
                <el-form-item label="Name of Person" class="long-item-agent">
                  <el-input type="textarea" v-model="foreignPeerInfo.introduced.namePerson" maxlength="128" autosize :disabled="isDisabled">
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="3">
                <el-checkbox v-model="foreignPeerInfo.introduced.isLsAgent" true-label="Y" false-label="N" :disabled="isDisabled">LS Agent
                </el-checkbox>
              </el-col>
              <el-col :span="21">
                <el-form-item label="Name of Agent" class="long-item-agent">
                  <el-input type="textarea" v-model="foreignPeerInfo.introduced.nameAgent" maxlength="128" autosize :disabled="isDisabled">
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="3">
                <el-checkbox v-model="foreignPeerInfo.introduced.isOthers" true-label="Y" false-label="N" :disabled="isDisabled">Others
                </el-checkbox>
              </el-col>
              <el-col :span="21">
                <el-form-item label="Pls specify the source" class="long-item-agent">
                  <el-input type="textarea" v-model="foreignPeerInfo.introduced.specifySource" maxlength="128" autosize
                    :disabled="isDisabled"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
      <div class="finance-search-list-gap"></div>
      <div class="tab-box">
        <div class="title">Briefs</div>
        <el-form-item label="Main POL/POD, commodity, volume" class="long-item-Briefs" label-width="330px">
          <el-input type="textarea" v-model="foreignPeerInfo.briefs.mainPol" maxlength="512" autosize :disabled="isDisabled"></el-input>
        </el-form-item>
        <el-form-item label="Belongs to any group/association/network/membership" class="long-item-Briefs" label-width="330px">
          <el-input type="textarea" v-model="foreignPeerInfo.briefs.membership" maxlength="512" autosize :disabled="isDisabled"></el-input>
        </el-form-item>
        <el-form-item label="Competitor" class="long-item-Briefs" label-width="330px">
          <el-input type="textarea" v-model="foreignPeerInfo.briefs.competitor" maxlength="512" autosize :disabled="isDisabled"></el-input>
        </el-form-item>
        <el-form-item label="Biz scope" class="long-item-Briefs" label-width="330px">
          <el-input type="textarea" v-model="foreignPeerInfo.briefs.bizScope" maxlength="512" autosize :disabled="isDisabled"></el-input>
        </el-form-item>
        <el-form-item label="Others" class="long-item-Briefs" label-width="330px">
          <el-input type="textarea" v-model="foreignPeerInfo.briefs.otherBriefs" maxlength="512" autosize :disabled="isDisabled"></el-input>
        </el-form-item>
      </div>
      <div class="finance-search-list-gap"></div>
      <div class="tab-box">
        <div class="title">Shipping Instruction</div>
        <el-form-item label="Preferred Carrier(sea)" class="long-item multiple-select-item" label-width="200px">
          <el-select v-model="foreignPeerInfo.shippingInstruction.preferredCarrierSeaArr" placeholder="" filterable multiple remote
            clearable value-key="carrierCode" :remote-method="getSeaShipList" @visible-change="(isShow) => isShow && getSeaShipList()"
            :disabled="isDisabled" @change="forceUpdate">
            <el-option v-for="optionItem in seaShipList" :label="optionItem.ename || optionItem.cname" :value="optionItem.carrierCode"
              :key="optionItem.carrierCode">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Preferred Carrier(air)" class="long-item multiple-select-item" label-width="200px">
          <el-select v-model="foreignPeerInfo.shippingInstruction.preferredCarrierAirArr" placeholder="" filterable multiple remote
            clearable value-key="carrierCode" :remote-method="getAirShipList" @visible-change="(isShow) => isShow && getAirShipList()"
            :disabled="isDisabled" @change="forceUpdate">
            <el-option v-for="optionItem in airShipList" :label="optionItem.ename || optionItem.cname" :value="optionItem.carrierCode"
              :key="optionItem.carrierCode">
            </el-option>
          </el-select>
        </el-form-item>
        <div class="approved-item">
          <span class="approved-item-title">Approved Co-loader</span>
          <div class="approved-item-box">
            <div class="approved-item-content" v-for="(approvedItem, approvedIndex) in approvedCoLoaderList" :key="approvedIndex">
              <el-input type="textarea" v-model="approvedItem.value" maxlength="128" autosize :disabled="isDisabled"></el-input>
              <template v-if="!isDisabled">
                <i v-if="approvedIndex === approvedCoLoaderList.length-1" class="el-icon-circle-plus" title="新增" @click="addApprovedFn"
                  style="margin-left: 5px"></i>
                <el-popconfirm v-else title="确定移除该信息吗？" @onConfirm="removeApprovedFn(approvedIndex)">
                  <i slot="reference" class="el-icon-remove" title="移除"></i>
                </el-popconfirm>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="finance-search-list-gap"></div>
      <div class="tab-box">
        <!-- <div class="title"><span class="required-text">*</span>Documentation Arrangement</div>
        <div class="docArrangement dottedLine">
          <el-checkbox v-model="foreignPeerInfo.billingMethod.isLading" true-label="Y" false-label="N" :disabled="isDisabled">Original
            Master Bills of Lading
          </el-checkbox>
          <el-checkbox v-model="foreignPeerInfo.billingMethod.isLadingTr" true-label="Y" false-label="N" :disabled="isDisabled">Master Bills
            of Lading with
            T/R(telex releasing)</el-checkbox>
          <el-checkbox v-model="foreignPeerInfo.billingMethod.isLadingReleasing" true-label="Y" false-label="N" :disabled="isDisabled">
            Master Bills of Lading
            releasing at destination
          </el-checkbox>
          <el-checkbox v-model="foreignPeerInfo.billingMethod.isSeawayBills" true-label="Y" false-label="N" :disabled="isDisabled">Seaway
            Bills</el-checkbox>
          <el-checkbox v-model="foreignPeerInfo.billingMethod.isOtherBills" true-label="Y" false-label="N" :disabled="isDisabled">others
          </el-checkbox>
          <el-form-item v-if="foreignPeerInfo.billingMethod.isOtherBills === 'Y'" true-label="Y" false-label="N" class="other-bills-item">
            <el-input type="textarea" v-model="foreignPeerInfo.billingMethod.othersBills" maxlength="128" autosize :disabled="isDisabled">
            </el-input>
          </el-form-item>
        </div> -->
        <div class="title">If Original MBL</div>
        <el-form-item label="Use agent courier a/c on cc" class="long-item" label-width="200px">
          <el-input type="textarea" v-model="foreignPeerInfo.billingMethod.useAgentCourier" maxlength="512" autosize :disabled="isDisabled">
          </el-input>
        </el-form-item>
        <el-form-item label="Use LS courier and debit to agent" class="long-item" label-width="200px">
          <el-input type="textarea" v-model="foreignPeerInfo.billingMethod.useLsCourier"
            placeholder="DHL/Fedex/XX, USDXX per pouch, we could try to collect all docs from other office to save cost" maxlength="512"
            autosize :disabled="isDisabled"></el-input>
        </el-form-item>
        <el-form-item label="Share courier cost with agent" class="long-item" label-width="200px">
          <el-input type="textarea" v-model="foreignPeerInfo.billingMethod.shareCourier" maxlength="512" autosize :disabled="isDisabled">
          </el-input>
        </el-form-item>
      </div>
      <div class="finance-search-list-gap"></div>
      <div class="tab-box">
        <div class="title">Profit Sharing</div>
        <el-form-item label="Agent Nomination" class="long-item" label-width="200px">
          <el-input type="textarea" v-model="foreignPeerInfo.profitSharing.agentNomination" maxlength="512" autosize :disabled="isDisabled">
          </el-input>
        </el-form-item>
        <el-form-item label="LS Free hand to agent" class="long-item" label-width="200px">
          <el-input type="textarea" v-model="foreignPeerInfo.profitSharing.lsFreeAgent" maxlength="512" autosize :disabled="isDisabled">
          </el-input>
        </el-form-item>
        <el-form-item label="Joint routed cargo via sales lead" class="long-item" label-width="200px">
          <el-input type="textarea" v-model="foreignPeerInfo.profitSharing.jointRouted" maxlength="512" autosize :disabled="isDisabled">
          </el-input>
        </el-form-item>
      </div>
      <div class="finance-search-list-gap"></div>
      <div class="tab-box">
        <!-- <div class="title">Accounting Instructions</div>
        <div class="dottedLine">
          <el-form-item label="Invoicing" class="long-item" label-width="200px" required>
            <el-input type="textarea" v-model="foreignPeerInfo.accountingInstructions.invoicing" maxlength="512" autosize
              :disabled="isDisabled"></el-input>
          </el-form-item>
        </div> -->
        <!-- <div class="title">Monthly SOA</div>
        <el-form-item label="Attention" class="long-item" label-width="200px" required>
          <el-input type="textarea" v-model="foreignPeerInfo.accountingInstructions.attention" maxlength="512" autosize
            :disabled="isDisabled"></el-input>
        </el-form-item>
        <el-form-item label="Credit Period" class="long-item" label-width="200px" required>
          <el-input type="textarea" v-model="foreignPeerInfo.accountingInstructions.creditPeriod" maxlength="512" autosize
            :disabled="isDisabled"></el-input>
        </el-form-item>
        <el-form-item label="Credit Amount Limit" class="long-item" label-width="200px" required>
          <el-input type="textarea" v-model="foreignPeerInfo.accountingInstructions.creditAmountLimit" maxlength="512" autosize
            :disabled="isDisabled"></el-input>
        </el-form-item>
        <el-form-item label="Explanation if necessary" class="long-item" label-width="200px" required>
          <el-input type="textarea" v-model="foreignPeerInfo.accountingInstructions.explanation" maxlength="512" autosize
            :disabled="isDisabled"
            placeholder="Monthly payment settle down which means each party will send the statement for current month before  next  month 10th  ,and payment be settled down the other next month 20th . For example, Shipments  in  Jan will be sent statement before Feb 10th and payment be done before March 20th.Any special request per negotiation case by case.">
          </el-input>
        </el-form-item>
        <el-form-item label="Other Remarks" class="long-item" label-width="200px">
          <el-input type="textarea" v-model="foreignPeerInfo.accountingInstructions.otherRemarks" maxlength="512" autosize
            :disabled="isDisabled"></el-input>
        </el-form-item>
        <el-form-item label="Bank Details for any transference." class="long-item" label-width="200px">
          <el-input type="textarea" v-model="foreignPeerInfo.accountingInstructions.bankDetails" maxlength="512" autosize
            :disabled="isDisabled"></el-input>
        </el-form-item> -->
      </div>
      <div class="finance-search-list-gap"></div>
      <div class="tab-box">
        <div class="title">交接资料</div>
        <CrmFile ref="crmFile" type="primary" text="上传附件" :btnHide="!isSelf" :ruleForm="fileUploadData" :rules="fileUploadRule"
          :tableData="customerSuppleList" @submitForm="submitForm" @action="deleleFile" @getFile="getFile" :isSelf="isSelf"
          :isDisabled="isDisabled" isDisFileType="true"></CrmFile>
      </div>
    </el-form>
  </div>
</template>
<script>
import { countrySelectList, airportList, portList, baseShippingCarrierList, aircarrierList } from '@/api/base'
import CrmFile from '@/views/crm/components/crmFile'
import { mapState } from 'vuex'
import ATTACH from '@/api/crm/attachment'
export default {
  name: 'foreignPeerDetail',
  components: { CrmFile },
  props: {
    isForeignPeer: {
      type: Boolean,
      default: false
    },
    isSelf: {
      type: Boolean,
      default: false
    },
    baseInfo: {
      type: Object,
      default: () => { }
    },
    isDisabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      foreignPeerInfo: {
        prepaidContractList: [
          {
            countryEname: '',
            countryCode: '',
            pod: '',
            aod: '',
            podPortCode: [],
            aodPortCode: [],
            companyName: '',
            cnpjNumber: '',
            address: '',
            contact: '',
            flag: 'prepaid',
            tel:'',
            fax:'',
            email:''
          }
        ],
        collectContractList: [
          {
            carrierSea: '',
            collectContract: '',
            countryEname: '',
            countryCode: '',
            pod: '',
            aod: '',
            podPortCode: [],
            aodPortCode: [],
            companyName: '',
            cnpjNumber: '',
            address: '',
            contact: '',
            tel:'',
            fax:'',
            email:'',
            flag: 'carrier'
          }
        ],
        introduced: {
          isLsAgent: "N",
          isLsbd: "N",
          isOthers: "N",
          nameAgent: "",
          namePerson: "",
          specifySource: ""
        },
        briefs: {
          mainPol: '',
          membership: '',
          competitor: '',
          bizScope: '',
          otherBriefs: ''
        },
        shippingInstruction: {
          preferredCarrierSea: "",
          preferredCarrierAir: "",
          preferredCarrierSeaArr: [],
          preferredCarrierAirArr: [],
          approvedCoLoader: "",
          approvedCoLoaderArr: []
        },
        billingMethod: {
          isLading: "N",
          isLadingTr: "N",
          isLadingReleasing: "N",
          isSeawayBills: "N",
          isOtherBills: "N",
          othersBills: '',
          useAgentCourier: '',
          useLsCourier: '',
          shareCourier: ''
        },
        profitSharing: {
          agentNomination: '',
          lsFreeAgent: '',
          jointRouted: ''
        },
        accountingInstructions: {
          invoicing: '',
          attention: '',
          creditPeriod: '',
          creditAmountLimit: '',
          explanation: '',
          otherRemarks: '',
          bankDetails: ''
        }
      },
      customerSuppleList: [], //客户补充资料列表
      countryList: [],
      podList: [],
      aodList: [],
      seaShipList: [],
      airShipList: [],
      approvedCoLoaderList: [
        {
          value: ''
        }
      ],
      fileUploadData: {
        orgid: '',
        type: '',
        typeName: '',
        remark: '',
      },
      fileUploadRule: {
        name: [{ required: true, message: ' ', trigger: 'blur' }],
        type: [{ required: true, message: ' ', trigger: 'blur' }],
        remark: [{ required: true, message: ' ', trigger: 'blur' }],
      },
      fileName: []
    }
  },
  mounted () {
    if (this.isForeignPeer) {
      this.getCustomerSuppleFileList()
    }
  },
  computed: {
    ...mapState("crm", {
      c_allBaseInfo: (state) => state.allBaseInfo,
    }),
    allBaseInfo () {
      return this.c_allBaseInfo
    }
  },
  watch: {
    allBaseInfo: {
      handler (nval, oval) {
        let data = nval
        let objArr = ['contract', 'introduced', 'briefs', 'shippingInstruction', 'billingMethod', 'profitSharing', 'accountingInstructions']
        // let updateObjArr = ['updateContract', 'updateIntroduced', 'updateBriefs', 'updateShippingInstruction', 'updateBillingMethod', 'updateProfitSharing', 'accountingInstructions']
        objArr.forEach(oKey => {
          this.foreignPeerInfo[oKey] = data[oKey] || this.$options.data.call(this).foreignPeerInfo[oKey]
          // if (['refuse', 'submit'].includes(data.verifyStatus)) {
          //   this.foreignPeerInfo[oKey] = data[updateObjArr[index]]
          // } else {
          //   this.foreignPeerInfo[oKey] = data[oKey]
          // }
          if (this.foreignPeerInfo[oKey]) {
            if (oKey === 'shippingInstruction') {
              const shipArr = ['preferredCarrierSea', 'preferredCarrierAir', 'approvedCoLoader']
              shipArr.forEach(sKey => {
                if (this.foreignPeerInfo[oKey][sKey]) {
                  if (this.foreignPeerInfo[oKey][sKey].includes(",")) {
                    this.foreignPeerInfo[oKey][`${sKey}Arr`] = this.foreignPeerInfo[oKey][sKey].split(',')
                  } else {
                    this.foreignPeerInfo[oKey][`${sKey}Arr`] = []
                    this.foreignPeerInfo[oKey][`${sKey}Arr`].push(this.foreignPeerInfo[oKey][sKey])
                  }
                } else {
                  this.foreignPeerInfo[oKey][`${sKey}Arr`] = []
                }
                if (sKey === 'approvedCoLoader') {
                  if (this.foreignPeerInfo[oKey][`${sKey}Arr`].length) {
                    this.approvedCoLoaderList = []
                    this.foreignPeerInfo[oKey][`${sKey}Arr`].forEach(value => {
                      this.approvedCoLoaderList.push({ value })
                    })
                  }
                }
              })
            } else if (oKey === 'contract') {
              // 筛选Prepaid/Carrier contract信息
              if (data.contract && data.contract.length) {
                data.contract.forEach(item => {
                  const portArr = ['aod', 'pod']
                  portArr.forEach(aKey => {
                    if (item[aKey]) {
                      if (item[aKey].includes(",")) {
                        item[`${aKey}PortCode`] = item[aKey].split(',')
                      } else {
                        item[`${aKey}PortCode`] = []
                        item[`${aKey}PortCode`].push(item[aKey])
                      }
                    } else {
                      item[`${aKey}PortCode`] = []
                    }
                  })
                })
                this.foreignPeerInfo.prepaidContractList = data.contract.filter(item => item.flag === 'prepaid')
                this.foreignPeerInfo.collectContractList = data.contract.filter(item => item.flag === 'carrier')
              }
            }
          }
        });
        console.log(` this.foreignPeerInfo`, this.foreignPeerInfo);
      },
      immediate: true
    }
  },
  methods: {
    /**
     * @description: 新增表单项信息
     * @param {*} list data定义的list集合
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-04 14:49:36
     */
    addFn (list) {
      this.foreignPeerInfo[`${list}`].push(this.$options.data.call(this).foreignPeerInfo[`${list}`][0])
    },
    /**
     * @description: 移除表单项信息
     * @param {*} list data定义的list集合
     * @param {*} index 移除的集合索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-04 15:03:39
     */
    removeFn (list, index) {
      this.foreignPeerInfo[`${list}`].splice(index, 1)
    },
    /**
     * @description: 获取国家信息
     * @param {*} val countryCode
     * @param {*} index 信息卡片索引
     * @param {*} list 信息类型
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-05 10:13:39
     */
    getCountryList (val, index, list) {
      if (!val) {
        val = this.foreignPeerInfo[`${list}`][index].countryCode
      }
      countrySelectList({ countryCode: val, state: 'valid' })
        .then((res) => {
          if (res.code === 0) {
            this.countryList = res.data || []
          }
        }).catch(() => { })
    },
    /**
     * @description: 国家下拉框显示/隐藏时回调
     * @param {*} isShow true-显示 false-隐藏
     * @param {*} index 信息卡片索引
     * @param {*} list 信息类型
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-05 10:18:52
     */
    showCountryList (isShow, index, list) {
      if (isShow) {
        this.countryList = []
        this.getCountryList(this.foreignPeerInfo[`${list}`][index].countryCode, index, list)
      }
    },
    /**
     * @description: 切换国家下拉框时回调，找到对应的countryEname值
     * @param {*} val
     * @param {*} index
     * @param {*} list
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-05 10:25:35
     */
    changeCountryInfo (val, index, list) {
      if (val) {
        let findCountryInfo = this.countryList.find(item => item.countryCode === val)
        if (findCountryInfo) {
          this.foreignPeerInfo[`${list}`][index].countryEname = findCountryInfo.ename
        }
        //若输入的Company name跟Country都跟该客户的客户名称、国家一样，则自动带出该客户的详细地址数据
        if (val === this.baseInfo.countryCode && this.foreignPeerInfo[`${list}`][index].companyName === this.baseInfo.name) {
          this.foreignPeerInfo[`${list}`][index].address = this.baseInfo.detailAddr
        }
      } else {
        this.foreignPeerInfo[`${list}`][index].address = ''
      }
      this.forceUpdate()
    },
    /**
     * @description: 若输入的Company name跟Country都跟该客户的客户名称、国家一样，则自动带出该客户的详细地址数据
     * @param {*} val
     * @param {*} item
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-05 11:54:39
     */
    changeCompanyName (val, item) {
      if (val) {
        if (val === this.baseInfo.name && item.countryCode === this.baseInfo.countryCode) {
          item.address = this.baseInfo.detailAddr
        }
      } else {
        item.address = ''
      }
    },
    /**
     * @description: 强制刷新页面
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-11 15:11:22
     */
    forceUpdate () {
      this.$forceUpdate()
    },
    /**
     * @description: 获取海运目的港POD列表信息
     * @param {*} val
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-05 11:04:52
     */
    getPort (val) {
      let data = {
        portName: val || '',
        portAttribute: 'port_of_destination',
        portCodes: '',
        state: 'valid'
      }
      portList(data)
        .then((res) => {
          if (res.code === 0) {
            this.podList = res.data || []
          }
        })
        .catch(() => { })
    },
    /**
     * @description: 获取空运目的港AOD列表信息
     * @param {*} val
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-05 11:24:40
     */
    getAirPort (val) {
      let data = {
        portName: val || '',
        portCodes: '',
        state: 'valid'
      }
      airportList(data)
        .then((res) => {
          if (res.code === 0) {
            this.aodList = res.data || []
          }
        })
        .catch(() => { })
    },
    /**
     * @description: 获取海运船司信息
     * @param {*} str
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-05 15:31:34
     */
    getSeaShipList (str) {
      baseShippingCarrierList(str, 'valid')
        .then((res) => {
          if (res.code === 0) {
            this.seaShipList = res.data || []
          }
        })
        .catch(() => { })
    },
    /**
     * @description: 获取空运船司信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-05 15:55:22
     */
    getAirShipList (str) {
      let data = {
        carrierName: str
      }
      aircarrierList(data)
        .then((res) => {
          if (res.code === 0) {
            this.airShipList = res.data || []
          }
        })
        .catch(() => { })
    },
    /**
     * @description: 新增Approved Co-loader输入项
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-05 17:30:58
     */
    addApprovedFn () {
      this.approvedCoLoaderList.push(this.$options.data.call(this).approvedCoLoaderList[0])
    },
    /**
     * @description: 移除Approved Co-loader输入项
     * @param {*} index 输入项索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-05 17:34:25
     */
    removeApprovedFn (index) {
      this.approvedCoLoaderList.splice(index, 1)
    },
    /**
     * @description: 获取客户补充资料列表信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-09 11:07:54
     */
    getCustomerSuppleFileList () {
      let data = {
        custid: this.baseInfo.custid || this.$route.query.custid,
        type: "attachment_overseas"
      }
      ATTACH['customerOverseas'](data)
        .then((res) => this.customerSuppleList.splice(0, 1000, ...res.data))
        .catch(() => { })
    },
    /**
     * @description: 获取上传的文件
     * @param {*} fileList 文件列表
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-09 15:13:09
     */
    getFile (fileList) {
      this.fileName = fileList.map((item) => item.raw)
    },
    /**
     * @description: 删除附件
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-09 15:12:42
     */
    deleleFile (row) {
      ATTACH['customerDelete']({ oid: row.oid, orgid: this.baseInfo.orgid }).then((res) => {
        this.$msgSucClose('删除成功!')
        this.getCustomerSuppleFileList()
      })
    },
    /**
     * @description: 上传附件
     * @param {*} refFormName form对象
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-09 14:29:17
     */
    submitForm (refFormName) {
      refFormName.validate(async (valid) => {
        if (!valid) return
        const formData = new FormData()
        this.fileName.forEach(item => formData.append('fileNames', item))
        formData.append('orgid', this.baseInfo.orgid)
        formData.append('type', 'attachment_overseas')
        formData.append('typeName', '交接资料')
        formData.append('remark', this.fileUploadData.remark)
        let crmFile = this.$refs.crmFile
        let uploadFile = crmFile.$refs.uploadFile
        crmFile.btnLoading = true
        uploadFile.handleProgress()
        ATTACH['customerUpload'](formData)
          .then((res) => {
            crmFile.showDialog(false)
            this.$msgSucClose('操作成功!')
            this.getCustomerSuppleFileList()
          })
          .finally(() => {
            crmFile.btnLoading = false
            uploadFile.showProcess = false
          })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.textR {
  text-align: right;
}
.tab-box {
  margin: 8px;
  .title {
    color: #222;
    font-weight: 600;
    font-size: 14px;
    margin: 10px 0;
  }
  .form-title {
    text-align: right;
    font-weight: bold;
  }
  .required-text {
    color: red;
    padding-right: 5px;
  }
  .form-box {
    background: #f3f3f3;
    padding: 10px 0;
    margin-bottom: 10px;
  }
  .middle-item {
    width: 100%;
    /deep/ .el-form-item__content {
      width: 200px;
      .el-select {
        width: 100%;
      }
    }
  }
  .approved-item {
    display: flex;
  }
  .approved-item-title {
    width: 200px;
    display: inline-block;
    text-align: right;
    color: #606266;
    padding-right: 4px;
  }
  .approved-item-box {
    display: flex;
    flex-flow: row wrap;
    flex: 1;
  }
  .approved-item-content {
    display: flex;
    margin-bottom: 3px;
    width: 50%;
    /deep/ .el-textarea {
      width: 95%;
    }
  }
  .long-item {
    width: 100%;
    /deep/ .el-form-item__content {
      width: calc(100% - 207px);
      .el-select {
        width: 100%;
      }
    }
  }
  .multiple-select-item {
    /deep/ .el-select__tags {
      width: auto !important;
      max-width: none !important;
      & span {
        width: auto !important;
      }
      & > span .el-tag--mini:nth-of-type(2) {
        width: auto;
      }
      & > span .el-tag--mini {
        max-width: none;
      }
    }
  }
  .long-item-info {
    width: 100%;
    /deep/ .el-form-item__content {
      width: calc(100% - 153px);
    }
  }
  .long-item-Briefs {
    width: 100%;
    /deep/ .el-form-item__label {
      word-break: break-all;
    }
    /deep/ .el-form-item__content {
      width: calc(100% - 335px);
    }
  }
  .long-item-agent {
    width: 100%;
    /deep/ .el-form-item__label {
      word-break: break-all;
    }
    /deep/ .el-form-item__content {
      width: calc(100% - 142px);
    }
  }
  .other-bills-item {
    width: 224px;
    margin: 0;
    /deep/ .el-form-item__content {
      width: 100%;
    }
  }
  /deep/ i.el-icon-circle-plus {
    color: #417f90;
    font-size: 20px;
    cursor: pointer;
    vertical-align: sub;
  }
  /deep/ .el-icon-remove {
    color: #afafaf;
    font-size: 20px;
    cursor: pointer;
    vertical-align: sub;
    margin: 0 5px;
  }
  .docArrangement {
    /deep/ .el-checkbox {
      margin-right: 50px !important;
    }
  }
  .dottedLine {
    border-bottom: 1px dashed #dddddd;
    padding-bottom: 10px;
  }
  .upload-btn {
    text-align: right;
    margin-bottom: 5px;
  }
  .text-link {
    text-decoration: underline;
    font-size: 12px;
    cursor: pointer;
    color: #1890ff;
  }
}
</style>