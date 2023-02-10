<template>
  <div id="airBlInfo">
    <!-- <el-button @click="validateForm">校验</el-button> -->
    <el-form :show-message="false" ref="blInfoForm" :model="createItem" :rules="rules" class="hide-error" label-position="top">
      <el-row :gutter="10">
        <el-col :span="4">
          <el-form-item label="提单类型" prop="airBl.blType">
            <!-- 客服只能提分单 -->
            <!-- :disabled="isOptional || !isAddBl ||isDraftConfirm" -->
            <el-select v-model="createItem.airBl.blType" size="mini" clearable placeholder="请选择" disabled @change="handleChangeBlType" style="width: 100%">
              <!-- 客服只能建分单；没有主单时候需要先建主单，不能新增分单 -->
              <el-option v-for="(item, index) in airBlType" :label="item.label" :value="item.value" :key="index"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="createItem.airBl.blType==='mawb'">
          <!--  prop="mblSuffix" -->
          <el-form-item label="主单号">
            <el-select style="width:48%" size="mini" clearable v-model="createItem.mblPrefix" :disabled="isDraftConfirm" filterable remote reserve-keyword placeholder="请选择主单号" :remote-method="val => blNoremoteMethod(val,createItem.mblPrefix)" @focus="blNoremoteMethod('',createItem.mblPrefix)">
              <div class="air-line-option-title">
                <div>IATA代码</div>
                <div>全称</div>
                <div>运单前缀</div>
              </div>
              <el-option v-for="(item,i) in blNoArr" :key="i" :label="item.label" :value="item.value">
                <div class="air-line-option">
                  <div class="air-line-option-info">{{item.itat}}</div>
                  <div class="air-line-option-info">{{item.cname}}</div>
                  <div class="air-line-option-info">{{item.carrierCode}}</div>
                </div>
              </el-option>
            </el-select>
            <span class="bl-split">-</span>
            <el-input size="mini" :maxlength="27" clearable placeholder="请输入" oninput="value=value.replace(/-/g,'')" style="width:48%" v-model="createItem.mblSuffix" :disabled="isDraftConfirm"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4" v-if="createItem.airBl.blType==='hawb'">
          <!-- prop="airBl.parentBlId" -->
          <el-form-item label="主单号">
            <!-- <el-select v-model="createItem.airBl.parentBlId" size="mini" @change="changeMbl" clearable placeholder="请选择" style="width:100%" :disabled="isOptional || !isAddBl||isDraftConfirm">
              <el-option v-for="(item, index) in mBlList" :label="item.blNo" :value="item.blId" :key="index"> </el-option>
            </el-select> -->
            <el-input size="mini" clearable placeholder="请输入" style="width:100%" v-model="parentBlNo" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4" v-if="createItem.airBl.blType==='hawb'">
          <!--  prop="airBl.blNo" -->
          <el-form-item label="分单号">
            <el-input size="mini" maxlength="11" clearable placeholder="分单号最长11位" v-model="createItem.airBl.blNo" :disabled="isDraftConfirm"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- prop="airBl.airWayBill" -->
          <el-form-item v-if="createItem.airBl.blType" label="Air Waybill">
            <el-input size="mini" maxlength="32" clearable placeholder="请输入" v-model="createItem.airBl.airWayBill" :disabled="isDraftConfirm"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item>
            <span slot="label" style="position:relative;z-index:200">
              <span>Shipper(发货人)</span>
              <el-button type="text" size="mini" :disabled="isDraftConfirm" @click="openContactPerson('发货人','')">选择</el-button>
            </span>
            <el-input type="textarea" rows="3" size="mini" maxlength="512" show-word-limit placeholder="请输入" resize="none" :disabled="isDraftConfirm" v-model="createItem.airBlContact.shipper"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item>
            <span slot="label" style="position:relative;z-index:200">
              <span>Consignee(收货人)</span>
              <el-button type="text" size="mini" :disabled="isDraftConfirm" @click="openContactPerson('收货人','')">选择</el-button>
            </span>
            <el-input type="textarea" rows="3" :disabled="isDraftConfirm" size="mini" maxlength="512" show-word-limit placeholder="请输入" resize="none" v-model="createItem.airBlContact.consignee"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8" class="tabs-label-col">
          <div class="item-label notify">
            <div class="notify-flex-row">
              <span class="lab" :class="tabIndex === 0 ? 'active' : ''" @click="changeTabel(0)">Notify Party(通知人)</span>
              <span class="lab flex1" :class="tabIndex === 1 ? 'active' : ''" @click="changeTabel(1)">Also Notify Party</span>
              <el-button type="text" size="mini" @click="openContactPerson('通知人',tabIndex)" :disabled="isDraftConfirm">选择</el-button>
            </div>
            <el-button size="mini" type="text" class="same" @click="handleClickNotify" :disabled="isDraftConfirm">SAME AS CONSIGNEE</el-button>
          </div>
          <el-form-item label="" v-if="tabIndex===0">
            <el-input type="textarea" rows="3" size="mini" :disabled="isDraftConfirm" maxlength="512" show-word-limit placeholder="请输入Notify Party" resize="none" v-model="createItem.airBlContact.notify1"></el-input>
          </el-form-item>
          <el-form-item label="" v-if="tabIndex===1">
            <el-input type="textarea" rows="3" size="mini" :disabled="isDraftConfirm" maxlength="512" show-word-limit placeholder="请输入Also Notify Party" resize="none" v-model="createItem.airBlContact.notify2"></el-input>
          </el-form-item>
          <!-- <el-form-item label="" v-if="tabIndex===2">
            <el-input type="textarea" rows="3" size="mini" :disabled="isDraftConfirm" maxlength="512" show-word-limit placeholder="请输入通知人3" resize="none" v-model="createItem.airBlContact.notify3"></el-input>
          </el-form-item> -->
        </el-col>
        <el-col :span="8">
          <el-form-item label="备注">
            <el-input type="textarea" rows="3" size="mini" :disabled="isDraftConfirm" show-word-limit maxlength="512" placeholder="请输入" resize="none" v-model="createItem.airBl.remark"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="MARKS">
            <el-input type="textarea" rows="3" size="mini" :disabled="isDraftConfirm" show-word-limit maxlength="512" placeholder="请输入" resize="none" v-model="createItem.airBl.mark"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-row :gutter="10">
            <el-col :span="24">
              <el-form-item label="Accounting Information">
                <el-select v-model="createItem.airBl.freightPayMode" :disabled="isDraftConfirm" size="mini" @change="changeAccounting" clearable placeholder="请选择" style="width:100%">
                  <el-option v-for="(item, index) in freightPayMode" :label="item.label" :value="item.label" :key="index"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="">
                <el-input type="textarea" rows="2" :disabled="isDraftConfirm" show-word-limit maxlength="512" size="mini" placeholder="请输入" resize="none" v-model="createItem.airBl.accountInfo"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <div class="self-divider"></div>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item class="position-label-item">
            <span slot="label">Issuing Carrier's Agent Name and City</span>
            <el-input size="mini" maxlength="64" clearable placeholder="请输入代理名" v-model="createItem.airBl.issueAgentName" :disabled="isDraftConfirm"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item>
            <span slot="label" class="empty-label"></span>
            <el-input size="mini" maxlength="32" clearable placeholder="请输入城市" v-model="createItem.airBl.issueAgentCity" :disabled="isDraftConfirm"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="Agent's IATA Code">
            <el-input size="mini" maxlength="32" clearable placeholder="请输入代码" v-model="createItem.airBl.agentIataCode" :disabled="isDraftConfirm"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Account NO">
            <el-input size="mini" maxlength="32" clearable placeholder="请输入账号" v-model="createItem.airBl.accountNo" :disabled="isDraftConfirm"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item class="position-label-item" prop="airBlExt.polAirportCode">
            <!-- 出发机场 -->
            <span slot="label">Airport of Departure and Requested Routing</span>
            <el-select v-model="createItem.airBlExt.polAirportCode" :disabled="isDraftConfirm" size="mini" clearable placeholder="请选择" style="width:100%" filterable remote :remote-method="(val)=>{ portRemoteMethod(val,createItem.airBlExt.polAirportCode,'airPortList1')}" @focus="portRemoteMethod('',createItem.airBlExt.polAirportCode,'airPortList1')" @change="getPolCityEnameAndCode">
              <el-option v-for="(item, index) in airPortList1" :label="item.label" :value="item.value" :key="index"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item>
            <span slot="label" class="empty-label"></span>
            <el-input size="mini" maxlength="32" clearable placeholder="出发机场城市英文名称" v-model="createItem.airBlExt.polCityEname" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item>
            <span slot="label" class="empty-label"></span>
            <el-input size="mini" maxlength="32" clearable placeholder="出发机场国家编码" v-model="createItem.airBlExt.polCountryCode" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6" :lg={span:4}>
          <el-form-item label="Declared Value of Carriage">
            <el-input size="mini" maxlength="32" clearable placeholder="请输入" v-model="createItem.airBl.carriageDeclareValue" :disabled="isDraftConfirm"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6" :lg={span:8}>
          <el-form-item label="Declared Value of Customs">
            <el-input size="mini" maxlength="32" clearable placeholder="请输入" v-model="createItem.airBl.customsDeclareValue" :disabled="isDraftConfirm"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="self-divider"></div>
      <el-row :gutter="10">
        <el-col :span="4">
          <el-form-item label="TO">
            <el-select v-model="createItem.airBlExt.flightTo" :disabled="isDraftConfirm" size="mini" clearable placeholder="请选择" style="width:100%" filterable remote :remote-method="(val)=>{ portRemoteMethod(val,createItem.airBlExt.flightTo,'airPortList2')}" @focus="portRemoteMethod('',createItem.airBlExt.flightTo,'airPortList2')">
              <el-option v-for="(item, index) in airPortList2" :label="item.label" :value="item.value" :key="index"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="By First Carrier">
            <el-select v-model="createItem.airBlExt.flightBy" :disabled="isDraftConfirm" size="mini" clearable placeholder="请选择" style="width:100%" filterable remote :remote-method="(val)=>{ remoteMethod(val,'airLineArr1',createItem.airBlExt.flightBy)}" @focus="(val)=>{ remoteMethod('','airLineArr1',createItem.airBlExt.flightBy)}">
              <div class="air-line-option-title">
                <div>IATA代码</div>
                <div>全称</div>
                <div>运单前缀</div>
              </div>
              <el-option v-for="(item, index) in airLineArr1" :label="item.label" :value="item.value" :key="index">
                <div class="air-line-option">
                  <div class="air-line-option-info">{{item.label}}</div>
                  <div class="air-line-option-info">{{item.cname}}</div>
                  <div class="air-line-option-info">{{item.carrierCode}}</div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="TO">
            <el-select v-model="createItem.airBlExt.flightTo2" :disabled="isDraftConfirm" size="mini" clearable placeholder="请选择" style="width:100%" filterable remote :remote-method="(val)=>{ portRemoteMethod(val,createItem.airBlExt.flightTo2,'airPortList3')}" @focus="portRemoteMethod('',createItem.airBlExt.flightTo2,'airPortList3')">
              <el-option v-for="(item, index) in airPortList3" :label="item.label" :value="item.value" :key="index"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="BY">
            <el-select v-model="createItem.airBlExt.flightBy2" :disabled="isDraftConfirm" size="mini" clearable placeholder="请选择" style="width:100%" filterable remote :remote-method="(val)=>{ remoteMethod(val,'airLineArr2',createItem.airBlExt.flightBy2)}" @focus="(val)=>{ remoteMethod('','airLineArr2',createItem.airBlExt.flightBy2)}">
              <div class="air-line-option-title">
                <div>IATA代码</div>
                <div>全称</div>
                <div>运单前缀</div>
              </div>
              <el-option v-for="(item, index) in airLineArr2" :label="item.label" :value="item.value" :key="index">
                <div class="air-line-option">
                  <div class="air-line-option-info">{{item.label}}</div>
                  <div class="air-line-option-info">{{item.cname}}</div>
                  <div class="air-line-option-info">{{item.carrierCode}}</div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="TO">
            <el-select v-model="createItem.airBlExt.flightTo3" :disabled="isDraftConfirm" size="mini" clearable placeholder="请选择" style="width:100%" filterable remote :remote-method="(val)=>{ portRemoteMethod(val,createItem.airBlExt.flightTo3,'airPortList4')}" @focus="portRemoteMethod('',createItem.airBlExt.flightTo3,'airPortList4')">
              <el-option v-for="(item, index) in airPortList4" :label="item.label" :value="item.value" :key="index"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="BY">
            <el-select v-model="createItem.airBlExt.flightBy3" :disabled="isDraftConfirm" size="mini" clearable placeholder="请选择" style="width:100%" filterable remote :remote-method="(val)=>{ remoteMethod(val,'airLineArr3',createItem.airBlExt.flightBy3)}" @focus="(val)=>{ remoteMethod('','airLineArr3',createItem.airBlExt.flightBy3)}">
              <div class="air-line-option-title">
                <div>IATA代码</div>
                <div>全称</div>
                <div>运单前缀</div>
              </div>
              <el-option v-for="(item, index) in airLineArr3" :label="item.label" :value="item.value" :key="index">
                <div class="air-line-option">
                  <div class="air-line-option-info">{{item.label}}</div>
                  <div class="air-line-option-info">{{item.cname}}</div>
                  <div class="air-line-option-info">{{item.carrierCode}}</div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="Currency">
            <el-select v-model="createItem.airBl.currency" :disabled="isDraftConfirm" size="mini" clearable placeholder="请选择" style="width:100%">
              <el-option v-for="(item, index) in dictMap.currency" :label="item.label" :value="item.value" :key="index"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="WT/VAL">
            <el-select v-model="createItem.airBl.wtValPpdColl" @change="changeWtValPpdColl" disabled size="mini" clearable placeholder="请选择" style="width:100%">
              <el-option v-for="(item, index) in dictMap.airChargePpdColl" :label="item.label" :value="item.value" :key="index"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="Other">
            <el-select v-model="createItem.airBl.otherPpdColl" size="mini" disabled clearable placeholder="请选择" style="width:100%">
              <el-option v-for="(item, index) in dictMap.airChargePpdColl" :label="item.label" :value="item.value" :key="index"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="Amount of Insurance">
            <el-input size="mini" maxlength="32" clearable placeholder="请输入" v-model="createItem.airBl.insuranceAmount" :disabled="isDraftConfirm"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="self-divider"></div>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-row :gutter="10">
            <el-col :span="8">
              <el-form-item class="position-label-item" prop="airBlExt.podAirportCode">
                <!-- 机场 -->
                <span slot="label">Airport of Destination</span>
                <el-select v-model="createItem.airBlExt.podAirportCode" :disabled="isDraftConfirm" size="mini" clearable placeholder="请选择目的地机场" style="width:100%" filterable remote :remote-method="(val)=>{ portRemoteMethod(val,createItem.airBlExt.podAirportCode,'airPortList5')}" @focus="portRemoteMethod('',createItem.airBlExt.podAirportCode,'airPortList5')">
                  <el-option v-for="(item, a) in airPortList5" :label="item.label" :value="item.value" :key="a"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item>
                <!-- 城市 -->
                <span slot="label" class="empty-label"></span>
                <el-input size="mini" maxlength="32" clearable placeholder="目的地机场城市名称" v-model="createItem.airBlExt.podCityEname" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item>
                <!-- 国家code -->
                <span slot="label" class="empty-label"></span>
                <el-input size="mini" maxlength="32" clearable placeholder="目的港机场国家编码" v-model="createItem.airBlExt.podCountryCode" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="8">
          <el-row :gutter="10">
            <el-col :span="8">
              <el-form-item class="position-label-item">
                <span slot="label">Requested Flight/Date/1</span>
                <el-select style="width:100%" size="mini" clearable v-model="createItem.airBlExt.requestFightAirline" :disabled="isDraftConfirm" filterable remote placeholder="请选择航空公司" :remote-method="(val)=>{ remoteMethod(val,'airLineArr4',createItem.airBlExt.requestFightAirline)}" @focus="(val)=>{ remoteMethod('','airLineArr4',createItem.airBlExt.requestFightAirline)}">
                  <div class="air-line-option-title">
                    <div>IATA代码</div>
                    <div>全称</div>
                    <div>运单前缀</div>
                  </div>
                  <el-option v-for="(item,index) in airLineArr4" :key="index" :label="item.label" :value="item.value">
                    <div class="air-line-option">
                      <div class="air-line-option-info">{{item.label}}</div>
                      <div class="air-line-option-info">{{item.cname}}</div>
                      <div class="air-line-option-info">{{item.carrierCode}}</div>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item>
                <span slot="label" class="empty-label"></span>
                <el-input size="mini" maxlength="32" clearable placeholder="请输入" v-model="createItem.airBlExt.requestFightNo" :disabled="isDraftConfirm"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item>
                <span slot="label" class="empty-label"></span>
                <elDatePickerLimit size="mini" style="width:100%" :disabled="isDraftConfirm" v-model="createItem.airBlExt.requestFightDate" type="date" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="8">
          <el-row :gutter="10">
            <el-col :span="8">
              <el-form-item class="position-label-item">
                <span slot="label">Requested Flight/Date/2</span>
                <el-select style="width:100%" size="mini" clearable v-model="createItem.airBlExt.requestFightAirline2" :disabled="isDraftConfirm" filterable remote placeholder="请选择航空公司" :remote-method="(val)=>{ remoteMethod(val,'airLineArr5',createItem.airBlExt.requestFightAirline2)}" @focus="(val)=>{ remoteMethod('','airLineArr5',createItem.airBlExt.requestFightAirline2)}">
                  <div class="air-line-option-title">
                    <div>IATA代码</div>
                    <div>全称</div>
                    <div>运单前缀</div>
                  </div>
                  <el-option v-for="(item,index) in airLineArr5" :key="index" :label="item.label" :value="item.value">
                    <div class="air-line-option">
                      <div class="air-line-option-info">{{item.label}}</div>
                      <div class="air-line-option-info">{{item.cname}}</div>
                      <div class="air-line-option-info">{{item.carrierCode}}</div>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item>
                <span slot="label" class="empty-label"></span>
                <el-input size="mini" maxlength="32" clearable placeholder="请输入" v-model="createItem.airBlExt.requestFightNo2" :disabled="isDraftConfirm"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item>
                <span slot="label" class="empty-label"></span>
                <elDatePickerLimit size="mini" style="width:100%" :disabled="isDraftConfirm" v-model="createItem.airBlExt.requestFightDate2" type="date" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="8">
          <el-form-item class="position-label-item">
            <span slot="label">Handing Information</span>
            <el-input size="mini" type="textarea" show-word-limit maxlength="512" clearable placeholder="请输入" v-model="createItem.airBl.handInfo" :disabled="isDraftConfirm"></el-input>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="16">
          <el-form-item>
            <span slot="label" class="empty-label"></span>
            <el-input size="mini" maxlength="32" clearable placeholder="请输入" v-model="createItem.blNo" :disabled="isDraftConfirm"></el-input>
          </el-form-item>
        </el-col> -->
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <el-row :gutter="10">
            <el-col :span="8">
              <el-form-item label="No.of Pieces RCP">
                <el-input size="mini" oninput="if(value.length>32)value=value.slice(0,32)" clearable placeholder="请输入" v-model="createItem.airBlCargoStat.totalQuantity" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Gross Weight">
                <el-input size="mini" oninput="if(value.length>32)value=value.slice(0,32)" clearable placeholder="请输入" v-model="createItem.airBlCargoStat.totalWeight" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="kg lb">
                <el-select v-model="createItem.airBlCargoStat.kgLib" :disabled="isDraftConfirm" size="mini" clearable placeholder="请选择" style="width:100%">
                  <el-option v-for="(item, index) in dictMap.airKgLib" :label="item.label" :value="item.value" :key="index"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Rate Class">
                <el-select v-model="createItem.airBlCargoStat.rateClass" :disabled="isDraftConfirm" size="mini" clearable placeholder="请选择" style="width:100%">
                  <el-option v-for="(item, index) in dictMap.airRateClass" :label="item.value" :value="item.value" :key="index"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Commodity ltem No.">
                <el-input size="mini" maxlength="32" clearable placeholder="请输入" v-model="createItem.airBlCargoStat.commodityItemNo" :disabled="isDraftConfirm"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Chargeable Weight" prop="airBlCargoStat.chargeWeight">
                <el-input size="mini" @input="checkNumInput(createItem.airBlCargoStat.chargeWeight,'Chargeable Weight','chargeWeight','airBlCargoStat')" clearable placeholder="请输入" v-model="createItem.airBlCargoStat.chargeWeight" :disabled="isDraftConfirm"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Rate / Charge" prop="airBlCargoStat.rateCharge">
                <!-- @input="checkNumInput(createItem.airBlCargoStat.rateCharge,'Rate / Charge','rateCharge','airBlCargoStat')" -->
                <el-input size="mini" clearable placeholder="请输入" v-model="createItem.airBlCargoStat.rateCharge" :disabled="isDraftConfirm"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Total">
                <el-input size="mini" maxlength="32" clearable placeholder="系统带入" v-model="goodTotal" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12">
          <el-row :gutter="10">
            <el-col :span="24">
              <el-form-item label="Nature and Quantity of Goods (incl.Dimensions or Volume)">
                <el-input type="textarea" rows="2" size="mini" :disabled="isDraftConfirm" resize="none" v-model="createItem.airBlCargoStat.goodsNature"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <!-- <el-col :span="8">
              <div class="line-height16">MARKS:</div>
              <div class="line-height16">{{createItem.airBlCargoStat.marks}}</div>
            </el-col> -->
            <el-col :span="8">
              <div class="line-height16">DIM: </div>
              <div v-for="(el,index) in goodsList" :key="index">
                <div class="line-height16" v-if="el.length&&el.width&&el.height&&el.quantity&&el.packageInfo">{{el.length}}M*{{el.width}}M*{{el.height}}M/{{el.quantity}}{{el.packageInfo}}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="line-height16">VOL:</div>
              <div class="line-height16">{{createItem.airBlCargoStat.totalVolume?createItem.airBlCargoStat.totalVolume:0}}CBM</div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>

      <div class="self-divider"></div>
      <el-row :gutter="10">
        <el-col :span="12">
          <div class="blInfo-tabel">
            <div class="blInfo-tabel-title">
              <div class="title-item">Prepaid</div>
              <div class="title-item">Weight Charge</div>
              <div class="title-item">Collect</div>
            </div>
            <div class="blInfo-tabel-main">
              <!-- <div class="blInfo-tabel-item-title">Weight Charge</div> -->
              <div class="blInfo-tabel-item-value">
                <div class="left"></div>
                <div class="right"></div>
              </div>
              <div class="blInfo-tabel-item-title">Valuation Charge</div>
              <div class="blInfo-tabel-item-value">
                <!-- 计费总金额 -->
                <div class="left">{{createItem.airBl.wtValPpdColl==='P'?goodTotal:''}}</div>
                <div class="right">{{createItem.airBl.wtValPpdColl==='C'?goodTotal:''}}</div>
              </div>
              <div class="blInfo-tabel-item-title">Tax</div>
              <div class="blInfo-tabel-item-value">
                <!-- 税 -->
                <div class="left"></div>
                <div class="right"></div>
              </div>
              <div class="blInfo-tabel-item-title">Total Other Charges Due Agent</div>
              <div class="blInfo-tabel-item-value">
                <!-- 应付代理人的其他总费用 -->
                <div class="left"></div>
                <div class="right"></div>
              </div>
              <div class="blInfo-tabel-item-title">Total Other Charges Due Carrier</div>
              <div class="blInfo-tabel-item-value">
                <!-- 应付承运人的其他总费用 -->
                <div class="left">{{createItem.airBl.otherPpdColl==='P'?dueCarrier:''}}</div>
                <div class="right">{{createItem.airBl.otherPpdColl==='C'?dueCarrier:''}}</div>
              </div>
              <div class="blInfo-tabel-item-value title-bg">
                <!-- 总费用 -->
                <div class="left">Total Prepaid</div>
                <div class="right">Total Collect</div>
              </div>
              <div class="blInfo-tabel-item-value">
                <div class="left">{{totalPrepaid}}</div>
                <div class="right">{{totalCollect}}</div>
              </div>
              <div class="blInfo-tabel-item-value title-bg">
                <div class="left">Currency Conversion Rates</div>
                <div class="right">CC Charges in Dest Currency</div>
              </div>
              <div class="blInfo-tabel-item-value">
                <div class="left">
                  <el-form-item prop="airBl.currencyConversionRate">
                    <el-input placeholder="请输入" :disabled="isDraftConfirm" v-model="createItem.airBl.currencyConversionRate" clearable @input="checkNumInput(createItem.airBl.currencyConversionRate,'Currency Conversion Rates','currencyConversionRate','airBl')" size="mini" class="tabel-input-no-border"></el-input>
                  </el-form-item>
                </div>
                <div class="right">
                  <el-form-item prop="airBl.destCcCharge">
                    <el-input placeholder="请输入" :disabled="isDraftConfirm" v-model="createItem.airBl.destCcCharge" clearable @input="checkNumInput(createItem.airBl.destCcCharge,'CC Charges in Dest Currency','destCcCharge','airBl')" size="mini" class="tabel-input-no-border"></el-input>
                  </el-form-item>
                </div>
              </div>
              <div class="blInfo-tabel-item-value title-bg">
                <div class="left"></div>
                <div class="right">Charges at Destination</div>
              </div>
              <div class="blInfo-tabel-item-value">
                <div class="left">For Carrier's Use Only At Destination</div>
                <div class="right">
                  <el-form-item prop="airBl.destCharge">
                    <el-input placeholder="请输入" :disabled="isDraftConfirm" v-model="createItem.airBl.destCharge" clearable @input="checkNumInput(createItem.airBl.destCharge,'Charges at Destination','destCharge','airBl')" size="mini" class="tabel-input-no-border"></el-input>
                  </el-form-item>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <!-- 其他费用 -->
          <OtherCharges v-model="otherChargesformData" :orderStatus="orderStatus" :blType="createItem.airBl.blType" :createItem="createItem" :isDraftConfirm="isDraftConfirm" style="margin-top:-10px" ref="OtherCharges" />
          <!-- {{createItem}} -->
        </el-col>
      </el-row>
    </el-form>
    <div v-if="contactPersonShow">
      <ContactPerson :config="contactPersonConfig" @close="getContactPerson" />
    </div>
  </div>

</template>

<script>
import { mapState } from 'vuex'
import { baseSystemLineInfo, baseEmployeeListName } from '@/api/base'
import {
  blCreateSerialNo,
  blDetail,
  getCarrier
} from '@/api/airTransport/order-import'
import OtherCharges from './otherCharges'
import { validateNumPointEmpty } from '@/utils/validate'
import ContactPerson from '@/views/order/order/orderList/components/contactPerson.vue'
import { orderInfo } from '@/api/airTransport/order'
import { unique } from '@/utils/index'
let timer = null
export default {
  name: 'airBlInfoImport',
  data() {
    return {
      blNoArr: [],
      state: '',
      isEdit: false,
      oQuery: this.$route.query,
      sysLineName: '',
      transitPortOptions: [],
      portList: [],
      pickerOptions: {
        disabledDate(date) {
          return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      },
      signEmployeeOptions: [],
      notify: '0',
      orderType: '1', // 主单
      rules: {
        airBl: {
          blType: [{ required: true, message: '请选择', trigger: 'change' }],
          parentBlId: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          blNo: [{ required: true, message: '请选择', trigger: 'change' }],
          currencyConversionRate: [
            { required: false, message: '请选择', trigger: 'change' },
            { validator: validateNumPointEmpty(999999999) }
          ],
          airWayBill: [{ required: true, message: '请选择', trigger: 'change' }]
          // destCcCharge: [
          //   { required: false, message: '请选择', trigger: 'change' },
          //   { validator: validateNumPointEmpty(999999999) }
          // ],
          // destCharge: [
          //   { required: false, message: '请选择', trigger: 'change' },
          //   { validator: validateNumPointEmpty(999999999) }
          // ]
        },
        airBlExt: {
          polAirportCode: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          podAirportCode: [
            { required: true, message: '请选择', trigger: 'change' }
          ]
        },
        airBlCargoStat: {
          rateCharge: [
            { required: false, message: '请选择', trigger: 'change' }
            // { validator: validateNumPointEmpty(999999999) }
          ],
          chargeWeight: [
            { required: false, message: '请选择', trigger: 'change' },
            { validator: validateNumPointEmpty(999999999) }
          ]
        },
        mblSuffix: [{ required: true, message: '请选择', trigger: 'change' }]
      },
      editableTabs: [1], //[1, 2, 3]
      tabIndex: 0,
      otherChargesformData: {
        otherChargesList: [],
        rules: {
          chargeType: [
            { required: true, message: '请输入费用代码', trigger: 'change' }
          ],
          collPpd: [{ required: true, message: '请选择', trigger: 'change' }],
          rate: [
            { required: true, message: '请输入单价', trigger: 'change' },
            { validator: validateNumPointEmpty(99999999) }
          ],
          quantity: [
            { required: true, message: '请输入数量', trigger: 'change' },
            { validator: validateNumPointEmpty(99999999) }
          ],
          totalAmount: [
            { required: true, message: '请输入合计', trigger: 'change' },
            { validator: validateNumPointEmpty(99999999) }
          ]
        }
      },
      numData: {
        total: '' // 总金额
      },
      airPortList1: [], // 空运港口
      airPortList2: [], // 空运港口
      airPortList3: [], // 空运港口
      airPortList4: [], // 空运港口
      airPortList5: [], // 空运港口
      airPortList6: [], // 空运港口
      airLineArr1: [], // 航司
      airLineArr2: [], // 航司
      airLineArr3: [], // 航司
      airLineArr4: [], // 航司
      airLineArr5: [], // 航司
      isHint: false, // 提醒新增分单前需要建主单
      contactPersonConfig: {
        type: '收货人', // 类型，收货人，发货人，通知人
        num: '' // 通知人1，2，3
      },
      contactPersonShow: false,
      mAirWayBill: ''
    }
  },
  props: {
    orderStatus: {
      type: String,
      default: ''
    },
    createItem: {
      type: Object,
      default: () => ({})
    },
    blList: {
      type: Array,
      default: () => []
    },
    allBl: {
      type: Array,
      default: () => []
    },
    isOptional: {
      type: Boolean,
      default: false
    },
    goodsList: {
      type: Array,
      default: () => []
    },
    isAddBl: {
      type: Boolean,
      default: true
    },
    isDraftConfirm: {
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: 'createItem',
    event: 'update'
  },
  created() {
    let arr = this.createItem.airBl.blNo.split('-')
    // this.$set(this.createItem, 'mblSuffix', arr[1])
    if (arr.length === 2) {
      this.$set(this.createItem, 'mblPrefix', arr[0])
      this.$set(this.createItem, 'mblSuffix', arr[1])
    } else {
      this.$set(this.createItem, 'mblPrefix', '')
      this.$set(this.createItem, 'mblSuffix', '')
    }
    if (!this.blList.length) {
      this.getCarrierCode()
    }

    if (!this.blList.length) {
      this.isHint = true
    }
    this.signEmployeeOptions = [
      {
        label: this.createItem.signEmployeeName,
        value: this.createItem.signEmployeeId
      }
    ]
    if (Array.isArray(this.createItem.airBlOtherCharges)) {
      this.otherChargesformData.otherChargesList = [
        ...this.createItem.airBlOtherCharges
      ]
    }
    if (this.createItem.airBl.blType === 'hawb' && this.isAddBl) {
      // 新增分单
      this.handleCreateSerialNo()
    }
    if (this.createItem.airBl.blType !== 'hawb' && this.isAddBl) {
      // 新增主单,需要默认带订单详情数据
      this.getOrderInfo()
    }
  },

  mounted() {},
  computed: {
    parentBlNo() {
      let blNo = this.mBlList[0].blNo
      if (!blNo) {
        return ''
      } else {
        let blNoArr = blNo.split('-')
        if (blNoArr.length === 2) {
          if (!blNoArr[0]) {
            return blNoArr[1]
          } else if (!blNoArr[1]) {
            return blNoArr[0]
          } else if (blNoArr[1] && blNoArr[0]) {
            return blNo
          }
        } else {
          return blNo
        }
      }
    },
    airBlType() {
      return this.dictMap.airBlType
    },
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole,
      roles: (state) => state.user.roles,
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      userId: (state) => state.user.userId,
      userEditRoles: (state) => state.airTransport.orderList.userEditRoles,
    }),
    disabledState() {
      return this.isOp || this.isView
    },
    isBd() {
      return this.ordDetRole === 'bd' || !this.ordDetRole
    },
    isOp() {
      return this.ordDetRole === 'op' || this.isBd
    },
    bdId() {
      // 当前参与人-业务（建单人的用户id）
      let { workAssign } = this.airOrderInfo
      let bdItem = workAssign && workAssign.find((el) => el.jobCode === 'bd')
      if (bdItem && bdItem.employeeId) {
        return bdItem.employeeId
      }
      return ''
    },
    obdId() {
      // 当前参与人-业务（建单人的用户id）
      let { workAssign } = this.airOrderInfo
      let obdItem = workAssign && workAssign.find((el) => el.jobCode === 'obd')
      if (obdItem && obdItem.employeeId) {
        return obdItem.employeeId
      }
      return ''
    },
    asstId() {
      // 当前参与人-业务（建单人的用户id）
      let { workAssign } = this.airOrderInfo
      let asstItem =
        workAssign && workAssign.find((el) => el.jobCode === 'asst')
      if (asstItem && asstItem.employeeId) {
        return asstItem.employeeId
      }
      return ''
    },
    blTypeShow() {
      return this.createItem.blId ? true : false
    },
    mBlList() {
      return this.allBl.filter((el) => el.blType === 'mawb')
    },
    goodTotal() {
      if (
        !isNaN(this.createItem.airBlCargoStat.rateCharge) &&
        !isNaN(this.createItem.airBlCargoStat.chargeWeight)
      ) {
        if (
          Number(
            this.createItem.airBlCargoStat.rateCharge *
              this.createItem.airBlCargoStat.chargeWeight
          ).fixed(3) > 0
        ) {
          return Number(
            this.createItem.airBlCargoStat.rateCharge *
              this.createItem.airBlCargoStat.chargeWeight
          ).fixed(3)
        } else {
          return 'AS ARRANGED'
        }
      } else {
        return 'AS ARRANGED'
      }
    },
    dueCarrier() {
      // 其他费用总费用
      let sum = 0
      for (
        let i = 0;
        i < this.otherChargesformData.otherChargesList.length;
        i++
      ) {
        if (!isNaN(this.otherChargesformData.otherChargesList[i].totalAmount)) {
          sum += Number(
            this.otherChargesformData.otherChargesList[i].totalAmount
          )
        }
      }
      if (sum > 0) {
        return sum
      } else {
        return 'AS ARRANGED'
      }
    },
    totalPrepaid() {
      // 预付总费用
      if (this.createItem.airBl.wtValPpdColl === 'P') {
        let goodTotal = isNaN(this.goodTotal) ? 0 : this.goodTotal
        let dueCarrier = isNaN(this.dueCarrier) ? 0 : this.dueCarrier
        if (
          isNaN(goodTotal * 1 + dueCarrier * 1) ||
          goodTotal * 1 + dueCarrier * 1 == 0
        ) {
          return 'AS ARRANGED'
        } else {
          return goodTotal * 1 + dueCarrier * 1
        }
      } else {
        return ''
      }
    },
    totalCollect() {
      // 到付总费用
      if (this.createItem.airBl.wtValPpdColl === 'C') {
        let goodTotal = isNaN(this.goodTotal) ? 0 : this.goodTotal
        let dueCarrier = isNaN(this.dueCarrier) ? 0 : this.dueCarrier
        if (
          isNaN(goodTotal * 1 + dueCarrier * 1) ||
          goodTotal * 1 + dueCarrier * 1 == 0
        ) {
          return 'AS ARRANGED'
        } else {
          return goodTotal * 1 + dueCarrier * 1
        }
      } else {
        return ''
      }
    },
    natureAndQuantity() {
      let data = ''
      if (this.createItem.airBl.blType === 'mawb') {
        if (this.airOrderInfo.airBillType === 'immediacy') {
          let arr = []
          for (let i = 0; i < this.goodsList.length; i++) {
            arr.push(this.goodsList[i].ename)
          }
          data = arr.join(',')
        } else {
          // 非直单，才是显示“CONSOL”
          data = 'CONSOL'
        }
      }
      if (this.createItem.airBl.blType === 'hawb') {
        let arr = []
        for (let i = 0; i < this.goodsList.length; i++) {
          arr.push(this.goodsList[i].ename)
        }
        data = arr.join(',')
      }
      return data
    },
    freightPayMode() {
      if (this.createItem.airBl.blType === 'mawb') {
        return this.dictMap.airFreightPayMode.filter((el) => el.value == 'P')
      } else {
        return this.dictMap.airFreightPayMode
      }
    }
  },
  watch: {
    'otherChargesformData.otherChargesList': {
      handler(newVal) {
        this.$set(this.createItem, 'airBlOtherCharges', newVal)
      }
      // immediate: true
    },
    natureAndQuantity: {
      handler: function (newVal) {
        if (!this.createItem.airBl.blId) {
          this.createItem.airBlCargoStat.goodsNature = newVal
        }
      },
      immediate: true
    },
    'createItem.airBlExt.podAirportCode': {
      handler: function (newVal) {
        this.getPodCityEnameAndCode(newVal)
      },
      immediate: true
    },
    'createItem.airBl.blType': {
      handler: function (val) {
        if (val === 'mawb') {
          // realVoyageList[0] 实际含航程的国际一程
          if (
            this.airOrderInfo.realVoyageList[0] &&
            this.airOrderInfo.realVoyageList[0].carrierSupplierName &&
            !this.createItem.airBl.airWayBill
          ) {
            getCarrier({
              itat: this.airOrderInfo.realVoyageList[0].carrierSupplierName
            }).then((res) => {
              this.createItem.airBl.airWayBill = res.data ? res.data.ename : ''
            })
          }
        }
      },
      immediate: true
    }
  },
  components: { OtherCharges, ContactPerson },
  methods: {
    blNoremoteMethod(el, value) {
      // 远程运单号
      this.$store
        .dispatch('dict/aircarrierList', {
          carrierName: value && !el ? value : el
        })
        .then((data) => {
          let list = data
            .map((ele) => {
              return Object.assign(ele, {
                value: ele.carrierCode,
                label: ele.carrierCode
              })
            })
            .filter((el) => el.itat)
          this.blNoArr = unique([...list], 'value')
        })
    },
    getCarrierCode() {
      if (!this.createItem.mblPrefix) {
        if (
          this.airOrderInfo.realVoyageList &&
          this.airOrderInfo.realVoyageList[0] &&
          this.airOrderInfo.realVoyageList[0].carrierSupplierName
        ) {
          getCarrier({
            itat: this.airOrderInfo.realVoyageList[0].carrierSupplierName
          }).then((res) => {
            this.createItem.mblPrefix = res.data ? res.data.carrierCode : ''
          })
        }
      }
    },
    queryAircarrierList(el) {
      getCarrier({
        itat: el
      }).then((res) => {
        this.mAirWayBill = res.data ? res.data.ename : ''
        // this.createItem.mblPrefix = res.data ? res.data.carrierCode : ''
        if (!this.createItem.airBl.blType) {
          // this.$set(this.createItem, 'mblSuffix', 'mbl')
          this.createItem.airBl.blType = 'mawb'
          this.handleChangeBlType('mawb')
        }
      })
    },
    checkNumInput(value, type, prop, fatherProp) {
      // 最大999999999 ，小数点两位
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/
        if (!value) {
          this.$set(this.createItem[fatherProp], prop, null)
        } else if (!reg.test(value) || value > 999999999) {
          let lastStr = value.substr(value.length - 1, 1)
          if (isNaN(value)) {
            this.$set(this.createItem[fatherProp], prop, null)
          } else if (value > 999999999) {
            this.$set(this.createItem[fatherProp], prop, 999999999)
          } else if (value < 0) {
            this.$set(this.createItem[fatherProp], prop, null)
          } else if (lastStr !== '.') {
            this.$set(this.createItem[fatherProp], prop, Number(value).fixed(2))
          }
          this.$message({
            message: `${type}请输入大于等于0，小于等于999999999的数字,小数点最多2位`,
            type: 'error',
            duration: 2000
          })
        }
      }, 800)
    },
    changeWtValPpdColl(val) {
      this.createItem.airBl.otherPpdColl = val
    },
    changeAccounting(val) {
      let payMode = ''
      if (val) {
        payMode = val === 'FREIGHT PREPAID' ? 'P' : 'C'
      }
      this.createItem.airBl.wtValPpdColl = payMode
      this.createItem.airBl.otherPpdColl = payMode
    },
    // 获取订单详情
    getOrderInfo() {
      let { orderNo, jointNo } = this.$route.query
      let params = {
        orderNo: orderNo
      }
      if (jointNo) {
        params.jointNo = jointNo
      }
      orderInfo(params).then((res) => {
        // 新建主单时默认赋值一些数据
        let data = res.data
        this.createItem.airBlContact.shipper = data.transport.shipper
        this.createItem.airBlContact.consignee = data.transport.consignee

        this.createItem.airBl.insuranceAmount = 'NIL'

        this.createItem.airBlExt.polAirportCode = data.polPortCode
        this.createItem.airBlExt.podAirportCode = data.podPortCode

        this.createItem.airBlExt.flightBy = data.airLine

        if (data.polPortCode) {
          this.$store
            .dispatch('dict/airportList', {
              portName: '',
              portCodes: data.polPortCode,
              state: 'valid'
            })
            .then((data) => {
              this.createItem.airBlExt.polCityEname = data[0].cityEname
              this.createItem.airBlExt.polCountryCode = data[0].countryCode
            })
        }
        if (data.podPortCode) {
          this.$store
            .dispatch('dict/airportList', {
              portName: '',
              portCodes: data.podPortCode,
              state: 'valid'
            })
            .then((data) => {
              this.createItem.airBlExt.podCityEname = data[0].cityEname
              this.createItem.airBlExt.podCountryCode = data[0].countryCode
            })
        }

        if (data.cargoList) {
          // marks 默认值
          let arr = []
          for (let i = 0; i < data.cargoList.length; i++) {
            if (data.cargoList[i].mark) {
              arr.push(data.cargoList[i].mark)
            }
          }
          if (arr.length > 0) {
            this.createItem.airBl.mark = arr.join(',')
          }
        }

        if (
          data.realVoyageList[0] &&
          data.realVoyageList[0].carrierSupplierName
        ) {
          this.queryAircarrierList(data.realVoyageList[0].carrierSupplierName)
          this.createItem.airBlExt.requestFightAirline =
            data.realVoyageList[0].carrierSupplierName
        } else {
          this.createItem.airBl.blType = 'mawb'
          this.handleChangeBlType('mawb')
        }
      })
    },
    changeMbl(val) {
      // 选择不同的主单，将不同的主单内容最为当前分单的默认值
      this.$emit('changeMbl', val)
    },
    handleAddHbl(item) {
      this.currentBlType = 'hawb'
      //新增分单
      blDetail({
        blId: item.blId,
        orderNo: item.orderNo
      }).then((res) => {
        let { data } = res
        this.createItem = data
        this.createItem.airBl.blType = 'hawb'
        this.createItem.airBl.parentBlId = data.airBl.blId
        this.goodsList.list = data.airBlCargos
        this.createItem.airBl.blId = ''
        this.createItem.airBlCargoStat.blId = ''
        this.createItem.airBlContact.blId = ''
        this.createItem.airBlExt.blId = ''

        this.createItem.airBlCargoStat.oid = ''
        this.createItem.airBlContact.oid = ''
        this.createItem.airBlExt.oid = ''
        for (let i = 0; i < this.createItem.airBlCargos.length; i++) {
          this.$set(this.createItem.airBlCargos[i], 'blId', '')
          // this.$set(this.createItem.airBlCargos[i], 'oid', '')
        }
        for (let i = 0; i < this.createItem.airBlOtherCharges.length; i++) {
          this.$set(this.createItem.airBlOtherCharges[i], 'blId', '')
          this.$set(this.createItem.airBlOtherCharges[i], 'oid', '')
        }
      })
    },
    handleClickNotify() {
      if (this.tabIndex == 0) {
        this.$set(this.createItem.airBlContact, 'notify1', 'SAME AS CONSIGNEE')
      }
      if (this.tabIndex == 1) {
        this.$set(this.createItem.airBlContact, 'notify2', 'SAME AS CONSIGNEE')
      }
      if (this.tabIndex == 2) {
        this.$set(this.createItem.airBlContact, 'notify3', 'SAME AS CONSIGNEE')
      }
    },
    getContactPerson(action, value, type, num) {
      this.contactPersonShow = false
      if (action === 'Confirm') {
        let str = `${value.companyName ? value.companyName + '\n' : ''}${
          value.contactAddress ? value.contactAddress + '\n' : ''
        }${value.contactName ? value.contactName + '\n' : ''}${
          value.contactPhone ? 'TEL:' + value.contactPhone + '\n' : ''
        }${value.contactFax ? 'FAX:' + value.contactFax + '\n' : ''}${
          value.taxCode ? 'TAX:' + value.taxCode + '\n' : ''
        }${value.remark}`
        if (type === '收货人') {
          this.$set(this.createItem.airBlContact, 'consignee', str)
        } else if (type === '发货人') {
          this.$set(this.createItem.airBlContact, 'shipper', str)
        } else {
          debugger
          if (num == 0) {
            this.$set(this.createItem.airBlContact, 'notify1', str)
          } else if (num == 1) {
            this.$set(this.createItem.airBlContact, 'notify2', str)
          } else {
            this.$set(this.createItem.airBlContact, 'notify3', str)
          }
        }
      }
    },
    openContactPerson(type, num) {
      // 打开收发通弹窗
      this.contactPersonConfig.type = type
      this.contactPersonConfig.num = num
      this.contactPersonShow = true
    },
    validateForm() {
      return new Promise((resolve, reject) => {
        this.$refs.blInfoForm.validate((valid) => {
          if (valid) {
            resolve()
          } else {
            reject()
          }
        })
      })
    },
    // focusMethod() {
    //   if (this.mBlList.length === 0) {
    //     this.isHint = false
    //     this.$message('提示：新增分单前，至少需要一条主单')
    //   }
    // },
    changeTabel(index) {
      // 切换联系人
      this.tabIndex = index
    },
    addTab() {
      // 增加联系人，max 3
      if (this.editableTabs.length > 2) {
        return
      }
      this.editableTabs.push({
        value: ''
      })
      this.tabIndex = this.editableTabs.length - 1
    },
    removeTab(index) {
      // 移除联系人
      if (this.editableTabs.length === 1) {
        return
      }
      if (index === 0) {
        this.createItem.airBlContact.notify1 = ''
      } else if (index === 1) {
        this.createItem.airBlContact.notify2 = ''
      } else if (index === 2) {
        this.createItem.airBlContact.notify3 = ''
      }
      this.tabIndex = this.tabIndex >= 1 ? this.tabIndex - 1 : 0
      this.editableTabs.splice(index, 1)
    },
    // 签单人下拉搜索自定义查询
    signerFilterMehod(val) {
      this.getEmployeeName(val)
    },

    // 签单人下拉展开
    signerVisibleChange(val) {
      if (val) {
        this.getEmployeeName()
      }
    },
    // 获取姓名
    getEmployeeName(val) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : ''
      }
      baseEmployeeListName(data).then((res) => {
        let list = res.data.filter((el) => el.status === 'on')
        this.signEmployeeOptions = list.map((item) => {
          return Object.assign(item, {
            label: this.$language == 'en' ? item.ename : item.cname,
            value: item.employeeId
          })
        })
      })
    },
    handleChangeEmployeeId(val) {
      let findItem = this.signEmployeeOptions.find((item) => item.value === val)
      this.createItem.signEmployeeName = findItem ? findItem.label : ''
    },
    // 选择为H单，提单号为接口生成; 选择M单，提单号为空,需手动输入
    handleChangeBlType(val) {
      if (val === 'hawb') {
        this.createItem.airBl.airWayBill = 'LONGSAIL SUPPLY CHAIN CO., LTD'
        this.handleCreateSerialNo()
      } else {
        this.createItem.airBl.airWayBill = this.mAirWayBill
        this.createItem.airBl.blNo = ''
        // // 主单时，费用方式只能是预付
        this.createItem.airBl.freightPayMode = 'FREIGHT PREPAID'
        this.createItem.airBl.wtValPpdColl = 'P'
        this.createItem.airBl.otherPpdColl = 'P'
      }
    },
    // 生成HBL号
    handleCreateSerialNo() {
      blCreateSerialNo({
        orderNo: this.$route.query.orderNo
      }).then((res) => {
        this.createItem.airBl.blNo = res.data
        // if(this.$route.name === 'AirTransportHblList'){
        //   this.$emit('saveblFn')
        // }
      })
    },
    fillSysLine(sysLineCode) {
      if (sysLineCode) {
        baseSystemLineInfo({ sysLineCode }).then((res) => {
          this.sysLineName = res.data.cname
        })
      }
    },
    remoteMethod(val, arrName, itat) {
      // 远程搜索航空公司
      this.$store
        .dispatch('dict/aircarrierList', { carrierName: val })
        .then((data) => {
          let list = data.map((ele) => {
            return Object.assign(ele, {
              value: ele.itat,
              label: ele.itat
            })
          })
          let found = list.find((ele) => ele.itat == itat)
          if (itat && !found && !val) {
            getCarrier({
              itat: itat
            }).then((res) => {
              let activeList = []
              if (res.data) {
                activeList.push(res.data)
              }
              let arr = activeList.map((ele) => {
                return Object.assign(ele, {
                  value: ele.itat,
                  label: ele.itat
                })
              })
              this[arrName] = [...arr, ...list].filter((el) => el.value)
            })
          } else {
            this[arrName] = [...list].filter((el) => el.value)
          }
        })
    },
    portRemoteMethod(el, code, arr) {
      // 空运港口下拉
      this.airPortSearch(el, '', 'valid', arr, code)
    },
    // 空运港口
    airPortSearch(portName, portCodes, state, type, code) {
      this.$store
        .dispatch('dict/airportList', { portName, portCodes, state })
        .then((data) => {
          let portList = data.map((ele) => {
            return Object.assign(ele, {
              value: ele.portCode,
              label: `${ele.portCode} (${ele.ename}-${ele.cname})`
            })
          })
          let found = portList.find((ele) => ele.portCode === code)
          if (code && !found && !portName) {
            // 当前港口选中 && 选中值不在默认30条中 && 模糊搜索没有值
            this.$store
              .dispatch('dict/airportList', {
                portName: '',
                portCodes: code,
                state: 'valid'
              })
              .then((res) => {
                let activePort = res.map((ele) => {
                  return Object.assign(ele, {
                    value: ele.portCode,
                    label: `${ele.portCode} (${ele.ename}-${ele.cname})`
                  })
                })
                this[type] = [...activePort, ...portList]
              })
          } else {
            this[type] = [...portList]
          }
        })
    },
    //
    getPolCityEnameAndCode(val) {
      // 出发地机场城市英文名称及机场代码
      if (!val) {
        this.createItem.airBlExt.polCityEname = ''
        this.createItem.airBlExt.polCountryCode = ''
        return false
      }
      for (let i = 0; i < this.airPortList1.length; i++) {
        if (val === this.airPortList1[i].portCode) {
          this.createItem.airBlExt.polCityEname = this.airPortList1[i].cityEname
          this.createItem.airBlExt.polCountryCode =
            this.airPortList1[i].countryCode
        }
      }
    },
    getPodCityEnameAndCode(val) {
      // 目的地地机场城市英文名称及机场代码
      // this.createItem.airBl.placeAt = val
      this.createItem.airBl.placeAt = this.airOrderInfo.polPortCode
      if (!val) {
        this.createItem.airBlExt.podCityEname = ''
        this.createItem.airBlExt.podCountryCode = ''
        return false
      }
      for (let i = 0; i < this.airPortList5.length; i++) {
        if (val === this.airPortList5[i].portCode) {
          this.createItem.airBlExt.podCityEname = this.airPortList5[i].cityEname
          this.createItem.airBlExt.podCountryCode =
            this.airPortList5[i].countryCode
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.self-divider {
  display: block;
  height: 1px;
  width: 100%;
  margin: 12px 0 8px;
  background-color: #969696;
}
.tabs-label-col {
  // position: relative;
  // padding-top: 20px;
  .tabs-label {
    display: flex;
    justify-content: space-between;
    padding-right: 5px;
    width: 100%;
    position: absolute;
    top: 0px;
    z-index: 2;
    .person-list {
      position: relative;
      display: flex;
      .label-item {
        padding: 0 5px;
        height: 20px;
        background: #f8f9fd;
        border-radius: 2px 2px 0px 0px;
        border: 1px solid #e9e9e9;
        border-bottom-width: 0px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 3px;
        cursor: pointer;
        color: #969696;
        line-height: 16px;
        .el-icon-close:hover {
          font-weight: 600;
        }
      }
      .label-item:hover {
        color: #000;
      }
      .label-item-active {
        background: #ffffff;
        color: #000;
        border-bottom: 1px solid #fff;
        position: relative;
      }
      .label-item-active::after {
        content: '';
        position: absolute;
        bottom: -2px;
        height: 1px;
        background: #fff;
        width: 100%;
      }
      .disabled-remove {
        cursor: no-drop;
      }
    }
    .add-person {
      cursor: pointer;
      color: #3e80f5;
      line-height: 16px;
    }
  }
}
.blInfo-tabel {
  .blInfo-tabel-title {
    display: flex;
    line-height: 24px;
    background: #f8f9fd;
    border-left: 1px solid #e9e9e9;
    border-top: 1px solid #e9e9e9;
    border-right: 1px solid #e9e9e9;
    .title-item {
      width: 33.33%;
      text-align: center;
      color: #4a4a4a;
    }
  }
  .blInfo-tabel-main {
    border-radius: 2px;
    border: 1px solid #e9e9e9;
    border-bottom-width: 0;
    border-right-width: 0;
    .blInfo-tabel-item-title {
      background: #f8f9fd;
      line-height: 24px;
      height: 24px;
      text-align: center;
      border-bottom: 1px solid #e9e9e9;
      border-right: 1px solid #e9e9e9;
    }
    .blInfo-tabel-item-value {
      display: flex;
      .left,
      .right {
        width: 50%;
        height: 24px;
        line-height: 24px;
        text-align: center;
        border-bottom: 1px solid #e9e9e9;
        border-right: 1px solid #e9e9e9;
      }
    }
    .title-bg {
      background: #f8f9fd;
    }
  }
}
/deep/.tabel-input-no-border {
  .el-textarea__inner {
    border: none;
  }
  .el-input__inner {
    border: none;
  }
}
.bl-split {
  display: inline-block;
  width: 4%;
  text-align: center;
}

#airBlInfo .notify {
  display: flex;
  justify-content: space-between;
  .notify-flex-row {
    display: flex;
    .lab {
      width: 110px;
      // padding: 0 5px 0 0;
      letter-spacing: -0.8px;
      line-height: 20px;
      cursor: pointer;
      &.flex1 {
        width: 90px;
      }
    }
  }
  .same {
    padding: 0;
    letter-spacing: -0.5px;
  }
}
// #airBlInfo .notify .lab {
// 	width: 110px;
// 	// padding: 0 5px 0 0;
// 	letter-spacing: -0.8px;
// 	cursor: pointer;
// 	&.flex1{
// 		width: 110px;
// 	}
// }
// #airBlInfo .notify .same {
// 	width: 140px;
// 	padding: 0 4px;
// 	letter-spacing: -0.8px;
// 	border: 1px solid #1890ff;
// 	color: #1890ff;
// 	// cursor: pointer;
// }
#airBlInfo .notify .lab.active {
  // border: 1px solid #dcdfe6;
  // border-top-left-radius: 4px;
  // border-top-right-radius: 4px;
  // border-bottom: 0;
  color: #1890ff;
  // font-weight: bold;
  position: relative;
  &::before {
    position: absolute;
    content: '';
    display: block;
    bottom: -1px;
    z-index: 1;
    left: 50%;
    width: 24px;
    margin-left: -12px;
    height: 1px;
    background-color: #1890ff;
  }
}
.row-flex#airBlInfo .flex-item {
  padding-bottom: 0px !important;
}
.row-flex#airBlInfo .flex-item .plus {
  font-size: 16px;
  color: #1890ff;
  line-height: 20px;
  cursor: pointer;
}
.clearBoth {
  clear: both;
}
.usa-abs {
  font-size: 12px;
  position: absolute;
  right: 0;
  top: 0;
  color: #1890ff;
  cursor: pointer;
}
.shipper-rel {
  position: relative;
  .tip {
    position: absolute;
    z-index: 2;
    right: -205px;
    width: 200px;
    height: 60px;
    border: 1px solid #e9851f;
    border-radius: 2px;
    background-color: #fff8e6;
    top: 50%;
    margin-top: -30px;
    line-height: 18px;
    padding: 3px 8px;
    font-size: 12px;
    color: #333;
    &::before {
      content: '';
      display: block;
      position: absolute;
      background-color: #fff8e6;
      // border-radius: 2px;
      top: 50%;
      left: -5px;
      margin-top: -5px;
      width: 9px;
      height: 9px;
      border-width: 1px 1px 0 0;
      border-color: #e9851f;
      border-style: solid;
      transform: rotate(-135deg);
      z-index: 3;
    }
  }
  &.notify-rel {
    .tip {
      left: -205px;
      &::before {
        right: -5px;
        left: auto;
        transform: rotate(45deg);
      }
    }
  }
}
</style>
