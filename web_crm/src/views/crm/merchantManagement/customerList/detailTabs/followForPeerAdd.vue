<template>
  <el-dialog
    :before-close="cancel"
    :appendToBody="true"
    :visible.sync="options.show"
    class="follow-add"
    :title="`${options.isEdit ? '编辑' : '新增'}跟进记录-海外同行`"
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
      <el-form-item key="commuType" label="跟进方式" prop="commuType">
        <el-select
          v-model="form.commuType"
          placeholder="请选择"
          @change="changeCommuType"
          :disabled="['unilateral'].includes(options.form.relationFlag) || isDisabled || (options.isEdit && ['bilateral'].includes(options.form.relationFlag))"
        >
          <el-option
            v-for="item in dictMap['custForeignPeerCommType']"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item key="commuTime" label="跟进时间:" prop="commuTime">
        <el-date-picker
          v-model="form.commuTime"
          type="date"
          placeholder="请选择"
          value-format="yyyy-MM-dd"
          :disabled="options.isEdit || isDisabled"
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
          disabled
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
      <el-form-item label="公司规模:" key="companyScale" prop="companyScale">
        <el-select v-model="form.companyScale" placeholder="请选择">
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in foreignScaleList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="公司地址:" prop="companyAddress">
        <el-input
          v-model="form.companyAddress"
          placeholder="请填写"
        ></el-input>
      </el-form-item>
      <el-form-item label="客户主要出货特点:" prop="shippingFeatures">
        <el-input
          v-model="form.shippingFeatures"
          placeholder="请填写"
          maxlength="128"
        ></el-input>
      </el-form-item>
      <el-form-item label="我司的竞争对手:" prop="competitor"  key="competitor" >
        <el-input
          v-model="form.competitor"
          placeholder="请输入"
          maxlength="128"
        ></el-input>
      </el-form-item>
      <el-form-item label="客户的竞争对手:" key="custCompetitor" prop="custCompetitor">
        <el-input
          v-model="form.custCompetitor"
          placeholder="请输入"
          maxlength="128"
        ></el-input>
      </el-form-item>
      <el-form-item label="客户所在国家排名:" prop="countryRank">
        <el-input
          v-model="form.countryRank"
          placeholder="请填写"
          onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')"
          maxlength="10"
        ></el-input>
      </el-form-item>
      <el-form-item label="客户所占行业市场份额:" prop="marketSharePoar">
        <el-input
          v-model="form.marketSharePoar"
          placeholder="请输入客户所占行业市场份额"
          class="middle-item"
          onkeyup="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')"
          :disabled="isDisabled"
        />
      </el-form-item>
      <el-form-item key="majorTopics" label="跟进的主要议题:"  prop="majorTopics"  class="flex-item">
        <el-input
          type="textarea"
          v-model="form.majorTopics"
          placeholder="请填写"
          autosize
          :maxlength="512"
        ></el-input>
      </el-form-item>
      <el-form-item key="followedMatters" label="待跟进事项:"  prop="followedMatters"  class="flex-item">
        <el-input
          type="textarea"
          v-model="form.followedMatters"
          placeholder="请填写待跟进事项"
          autosize
          :maxlength="512"
        ></el-input>
      </el-form-item>
      <!-- 参与人 -->
      <div class="outer-box">
        <div class="title">参与人</div>
          <div class="outer-item">
            <div class="item-box"
              :class="{ border: ourIndex !== form.ourVisitors.length - 1 }"
              v-for="(item, ourIndex) in form.ourVisitors"
              :key="ourIndex"
            >
              <div class="item-cnt">
                <el-form-item label="我司:" :prop="`ourVisitors.${ourIndex}.visitor`"
                   :rules="{
                      required: true,
                      message: ' ',
                      trigger: 'change',
                    }">
                  <el-select
                    v-model="item.visitor"
                    value-key="employeeId"
                    placeholder="请选择"
                    filterable
                    clearable
                    remote
                    @visible-change="(v)=>changeList(v)"
                    :remote-method="
                      (str) => {
                        getBaseEmployeeList(str)
                      }
                    " 
                  >
                    <el-option
                      v-for="(sitem, ourIndex) in employeeList2"
                      :key="`${sitem.employeeId}` + `${ourIndex}`" 
                      :label="`${sitem.cname}_${sitem.employeeId}`"
                      :value="sitem"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item key="ourCompanyPosition" label="职位:" :prop="`ourVisitors.${ourIndex}.ourCompanyPosition`"
                  :rules="{
                    required: true,
                    message: ' ',
                    trigger: 'change',
                  }">
                  <el-select 
                    v-model="item.ourCompanyPosition"
                    placeholder="请选择职位"
                    clearable>
                    <el-option
                      v-for="(sitem, ourIndex) in dictMap['customerRelationPosition']"
                      :key="ourIndex"
                      :label="sitem.label"
                      :value="sitem.label"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </div>
              <div class="btn-box">
                <i
                  class="el-icon-circle-plus"
                  v-if="ourIndex === 0"
                  @click="addItem('ourVisitors')"
                ></i>
                <el-popconfirm v-if="form.ourVisitors.length === 1 ? ourIndex : ourIndex > -1" title="确定移除该信息吗？"
                  @onConfirm="removeItem('ourVisitors', custIndex)">
                  <i slot="reference" class="el-icon-remove" title="移除"></i>
                </el-popconfirm>
              </div>
            </div>
          <div
            class="item-box"
            :class="{ border: custIndex !== form.custVisitors.length - 1 }"
            v-for="(custItem, custIndex) in form.custVisitors"
            :key="custIndex"
          >
          <div class="item-cnt">
            <el-form-item  label="客户:" key="custContact" :prop="`custVisitors.${custIndex}.custContact`"
              :rules="{
                required: true,
                message: ' ',
                trigger: 'change',
              }">
              <el-select v-model="custItem.custContact" placeholder="请选择" class="middle-item" 
              @change='(val)=>changeCustCon(val,custIndex)'>
                <el-option
                  :key="item.oid"
                  :label="item.name + item.ename"
                  :value="item.name +'#'+ item.ename +'#'+ item.oid"
                  v-for="item in custContactList"
                ></el-option>
              </el-select>
              <el-button size="mini" type="primary" class="addbtn"  @click="showDialog(custIndex)">新增</el-button>
            </el-form-item>
            <el-form-item key="custContactPosition" label="职位:" :prop="`custVisitors.${custIndex}.custContactPosition`">
              <el-select 
                v-model="custItem.custContactPosition"
                placeholder="请选择职位" disabled
                clearable>
                <el-option
                  v-for="(item, index) in dictMap['customerRelationPosition']"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item key="email" label="邮箱:" :prop="`custVisitors.${custIndex}.email`">
              <el-input
                v-model="custItem.email"
                placeholder="请填写"
                :maxlength="32"
                disabled
              ></el-input>
            </el-form-item>
            <el-form-item key="landline" label="座机:" :prop="`custVisitors.${custIndex}.landline`">
              <el-input
                v-model="custItem.landline"
                placeholder="请填写"
                :maxlength="32"
                disabled
              ></el-input>
            </el-form-item>
            <el-form-item key="telephone" label="手机:" :prop="`custVisitors.${custIndex}.telephone`">
              <el-input 
                v-model="custItem.telephone"
                placeholder="请填写"
                :maxlength="32"
                disabled
              ></el-input>
            </el-form-item>
          </div>
          <div class="btn-box">
            <i
              class="el-icon-circle-plus"
              v-if="custIndex === 0"
              @click="addItem('custVisitors')"
            ></i>
            <el-popconfirm v-if="form.custVisitors.length === 1 ? custIndex : custIndex > -1" title="确定移除该信息吗？"
              @onConfirm="removeItem('custVisitors', custIndex)">
              <i slot="reference" class="el-icon-remove" title="移除"></i>
            </el-popconfirm>
          </div>
          </div>
        </div>
      </div>
      <!-- 出货航线和特点 -->
      <div class="outer-box">
        <div class="title">出货航线和特点</div>
        <div class="outer-item">
          <div
            class="item-box"
            :class="{ border: shiplinesIndex !== form.shiplines.length - 1 }"
            v-for="(sysItem, shiplinesIndex) in form.shiplines"
            :key="shiplinesIndex"
          >
            <div class="item-cnt">
              <el-form-item label="POL:" :prop="`shiplines.${shiplinesIndex}.polPortCode`">
                <el-select
                  v-model="sysItem.polPortCode"
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
                  :disabled="isDisabled"
                >
                  <el-option
                    :label="`${item.ename}(${item.cname})`"
                    :value="item"
                    :key="item.portCode"
                    v-for="item in polList"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="POD:" :prop="`shiplines.${shiplinesIndex}.podPortCode`">
                <el-select
                  v-model="sysItem.podPortCode"
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
                  @change="(data) => changePod(data, shiplinesIndex)"
                  @visible-change="showPodport"
                  :disabled="isDisabled"
                >
                  <el-option
                    :label="`${item.ename}(${item.cname})`"
                    :value="item"
                    :key="item.portCode"
                    v-for="item in podList"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item  label="海运航线:"  :prop="`shiplines.${shiplinesIndex}.commLines`">
                <el-select v-model="sysItem.commLines" placeholder="请选择" value-key="sysLineCode" 
                  remote :remote-method="getSystemLineList" disabled>
                  <el-option
                    v-for="(item,index) in sysLine"
                    :key="`${item.sysLineCode}` + `${index}`" 
                    :label="item.cname"
                    :value="item"
                  ></el-option>
                </el-select>
              </el-form-item>               
              <el-form-item label="大致T量:" :prop="`shiplines.${shiplinesIndex}.containerNum`"> 
              <el-input
                v-model="sysItem.containerNum"
                placeholder="请输入"
                :disabled="isDisabled"
              > <template slot="append">T</template></el-input>
              </el-form-item>
              <el-form-item label="出货特点:"
                :prop="`shiplines.${shiplinesIndex}.shipFeatures`"
              > 
              <el-input
                type="textarea"
                v-model="sysItem.shipFeatures"
                placeholder="请填写"
                autosize
                :maxlength="128"
              ></el-input>
              </el-form-item>
            </div>
            <div class="btn-box">
              <i
                class="el-icon-circle-plus"
                v-if="shiplinesIndex === 0"
                @click="addItem('shiplines')"
              ></i>
              <el-popconfirm v-if="form.shiplines.length === 1 ? shiplinesIndex : shiplinesIndex > -1" title="确定移除该信息吗？"
                @onConfirm="removeItem('shiplines', shiplinesIndex)">
                <i slot="reference" class="el-icon-remove" title="移除"></i>
              </el-popconfirm>
            </div>
          </div>
          <div class="item-box"
            :class="{ border: airlinesIndex !== form.airlines.length - 1 }"
            v-for="(airItem, airlinesIndex) in form.airlines"
            :key="airlinesIndex"
          >
            <div class="item-cnt">
              <el-form-item label="AOL:" :prop="`airlines.${airlinesIndex}.aolPortCode`">
                <el-select
                  v-model="airItem.aolPortCode"
                  placeholder="请选择"
                  filterable
                  clearable
                  remote
                  value-key="portCode"
                  :remote-method="
                    (str) => {
                      getAirPort(str, 'port_of_basic')
                    }
                  "
                  @visible-change="showAolport"
                  :disabled="isDisabled"
                >
                  <el-option
                    :label="`${item.ename}(${item.cname})`"
                    :value="item"
                    :key="item.portCode"
                    v-for="item in aolList"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="AOD:" :prop="`airlines.${airlinesIndex}.aodPortCode`">
                <el-select
                  v-model="airItem.aodPortCode"
                  placeholder="请选择"
                  filterable
                  clearable
                  remote
                  value-key="portCode"
                  :remote-method="
                    (str) => {
                      getAirPort(str, 'port_of_destination')
                    }
                  "
                  @change="(data) => changeAirPod(data, airlinesIndex)"
                  @visible-change="showAodport"
                  :disabled="isDisabled"
                >
                  <el-option
                    :label="`${item.ename}(${item.cname})`"
                    :value="item"
                    :key="item.portCode"
                    v-for="item in aodList"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item  label="空运航线:" :prop="`airlines.${airlinesIndex}.airCommLines`">
              <el-input
                v-model="airItem.airCommLines"
                placeholder="请输入"
                disabled
              ></el-input>
              </el-form-item>               
              <el-form-item label="大致T量:" :prop="`airlines.${airlinesIndex}.containerNum`"> 
              <el-input
                v-model="airItem.containerNum"
                placeholder="请输入"
                :disabled="isDisabled"
              > <template slot="append">T</template></el-input>
              </el-form-item>
              <el-form-item label="出货特点:" :prop="`airlines.${airlinesIndex}.shipFeatures`"> 
              <el-input
                type="textarea"
                v-model="airItem.shipFeatures"
                placeholder="请填写"
                autosize
                :maxlength="128"
              ></el-input>
              </el-form-item>
            </div>
            <div class="btn-box">
              <i
                class="el-icon-circle-plus"
                v-if="airlinesIndex === 0"
                @click="addItem('airlines')"
              ></i>
              <el-popconfirm v-if="form.airlines.length === 1 ? airlinesIndex : airlinesIndex > -1" title="确定移除该信息吗？"
                @onConfirm="removeItem('airlines', airlinesIndex)">
                <i slot="reference" class="el-icon-remove" title="移除"></i>
              </el-popconfirm>
            </div>
          </div>
        </div>
      </div>
       <div class="outer-box">
          <div class="title">KEY ACCOUNTS</div>
          <div class="outer-item">
            <div
              class="item-box"
              :class="{ border: t !== form.foreigncargos.length - 1 }"
              v-for="(op, t) in form.foreigncargos"
              :key="t"
            >
              <div class="item-cnt">
                <el-form-item
                  label="发货单位:"
                  :prop="`foreigncargos.${t}.shippingUnit`"
                >
                  <el-select
                    v-model="op.shippingUnit"
                    placeholder="请选择"
                    clearable
                    remote
                  	@visible-change="val => custVisibleChange(val, op.shippingUnit)"
					          :remote-method="custFilterMehod"
                  >
                    <el-option
                      :key="o.value + w"
                      :label="o.label"
                      :value="o.value"
                      v-for="(o, w) in shipperCustOptions"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="POL:" :prop="`foreigncargos.${t}.polPortCode`">
                  <el-select
                    v-model="op.polPortCode"
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
                    :disabled="isDisabled"
                  >
                    <el-option
                      :label="`${item.ename}(${item.cname})`"
                      :value="item"
                      :key="item.portCode"
                      v-for="item in polList"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="POD:"  :prop="`foreigncargos.${t}.podPortCode`">
                <el-select
                  v-model="op.podPortCode"
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
                  @visible-change="showPodport"
                  :disabled="isDisabled"
                >
                  <el-option
                    :label="`${item.ename}(${item.cname})`"
                    :value="item"
                    :key="item.portCode"
                    v-for="item in podList"
                  ></el-option>
                </el-select>
                </el-form-item>
                <el-form-item label="AOL:" :prop="`foreigncargos.${t}.aolPortCode`">
                  <el-select
                    v-model="op.aolPortCode"
                    placeholder="请选择"
                    filterable
                    clearable
                    remote
                    value-key="portCode"
                    :remote-method="
                      (str) => {
                        getAirPort(str, 'port_of_basic')
                      }
                    "
                    @visible-change="showAolport"
                    :disabled="isDisabled"
                  >
                    <el-option
                      :label="`${item.ename}(${item.cname})`"
                      :value="item"
                      :key="item.portCode"
                      v-for="item in aolList"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="AOD:" :prop="`foreigncargos.${t}.aodPortCode`">
                  <el-select
                    v-model="op.aodPortCode"
                    placeholder="请选择"
                    filterable
                    clearable
                    remote
                    value-key="portCode"
                    :remote-method="
                      (str) => {
                        getAirPort(str, 'port_of_destination')
                      }
                    "
                    @visible-change="showAodport"
                    :disabled="isDisabled"
                  >
                    <el-option
                      :label="`${item.ename}(${item.cname})`"
                      :value="item"
                      :key="item.portCode"
                      v-for="item in aodList"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </div>
              <div class="btn-box">
                <i
                  class="el-icon-circle-plus"
                  v-if="t === 0"
                  @click="addItem('foreigncargos')"
                ></i>
                <el-popconfirm v-if="form.foreigncargos.length === 1 ? t : t > -1" title="确定移除该信息吗？"
                  @onConfirm="removeItem('foreigncargos', t)">
                  <i slot="reference" class="el-icon-remove" title="移除"></i>
                </el-popconfirm>
              </div>
            </div>
            <el-form-item label="我司在国内的主要竞争对手:"  prop="domesticCompetitors"  key="domesticCompetitors" class="flex-item">
              <el-input
                v-model="form.domesticCompetitors"
                placeholder="请输入"
                maxlength="128"
              ></el-input>
            </el-form-item>
            <el-form-item label="代理在目的港的主要竞争对手:" prop="destinationPortCompetitors"  key="destinationPortCompetitors" class="flex-item">
              <el-input
                v-model="form.destinationPortCompetitors"
                placeholder="请输入"
                maxlength="128"
              ></el-input>
            </el-form-item>
            <el-form-item label="出货品名:" prop="shipmentName"  key="shipmentName" class="flex-item">
              <el-input
               type="textarea"
                v-model="form.shipmentName"
                placeholder="请输入"
                maxlength="128"
              ></el-input>
            </el-form-item>
            <el-form-item label="核心需求:" prop="coreRequirements"  key="coreRequirements" class="flex-item">
              <el-input
               type="textarea"
                v-model="form.coreRequirements"
                placeholder="请输入"
                maxlength="512"
              ></el-input>
            </el-form-item>
            <el-form-item label="VOLUME:" prop="volume"  key="volume" class="flex-item">
              <el-input
               type="textarea"
                v-model="form.volume"
                placeholder="请输入"
                maxlength="512"
              ></el-input>
            </el-form-item>
            <el-form-item label="稳定该客户所需的内部支持:" prop="internalSupport"  key="internalSupport" class="flex-item">
              <el-input
               type="textarea"
                v-model="form.internalSupport"
                placeholder="请输入"
                maxlength="512"
              ></el-input>
            </el-form-item>
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
                        {{ dictMapObj['customerForPeerDemand'][ele.demandType] }},
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
                      v-for="x in dictMap['customerForPeerDemand']"
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
       <!-- footer -->
      <el-form-item key="materialDocPrepare" label="物料、资料准备:" prop="materialDocPrepare" class="flex-item">
        <el-input
          type="textarea"
          v-model="form.materialDocPrepare"
          placeholder="请填写"
          autosize
          :maxlength="512"
          :disabled="isDisabled"
        ></el-input>
      </el-form-item>
      <el-form-item key="visitTarget" label="拜访目标:" prop="visitTarget" class="flex-item" v-if="['visit'].includes(form.commuType)">
        <el-input
          type="textarea"
          v-model="form.visitTarget"
          placeholder="请填写"
          autosize
          :maxlength="512"
          :disabled="isDisabled"
        ></el-input>
      </el-form-item>
      <el-form-item key="visitTarget" label="会议目标:" prop="visitTarget" class="flex-item" v-else-if="['video_conferencing','microsoft_teams_meeting'].includes(form.commuType)">
        <el-input
          type="textarea"
          v-model="form.visitTarget"
          placeholder="请填写"
          autosize
          :maxlength="512"
          :disabled="isDisabled"
        ></el-input>
      </el-form-item>
      <el-form-item key="visitTarget" label="访谈目标:"  prop="visitTarget" class="flex-item" v-else>
        <el-input
          type="textarea"
          v-model="form.visitTarget"
          placeholder="请填写"
          autosize
          :maxlength="512"
          :disabled="isDisabled"
        ></el-input>
      </el-form-item>
      <el-form-item key="visitCheck" label="拜访结果:" prop="visitCheck" class="flex-item" v-if="['visit'].includes(form.commuType)">
        <el-input
          type="textarea"
          v-model="form.visitCheck"
          placeholder="请填写"
          autosize
          :maxlength="512"
          :disabled="isDisabled"
        ></el-input>
      </el-form-item>
      <el-form-item  key="visitCheck" label="会议结果:" prop="visitCheck" class="flex-item" v-else-if="['video_conferencing','microsoft_teams_meeting'].includes(form.commuType)">
        <el-input
          type="textarea"
          v-model="form.visitCheck"
          placeholder="请填写"
          autosize
          :maxlength="512"
          :disabled="isDisabled"
        ></el-input>
      </el-form-item>
      <el-form-item key="visitCheck" label="访谈结果:" prop="visitCheck" class="flex-item" v-else>
        <el-input
          type="textarea"
          v-model="form.visitCheck"
          placeholder="请填写"
          autosize
          :maxlength="512"
          :disabled="isDisabled"
        ></el-input>
      </el-form-item>
      <el-form-item key="nextPlan" label="下一步计划:" prop="nextPlan" class="flex-item">
        <el-input
          type="textarea"
          v-model="form.nextPlan"
          placeholder="请填写"
          autosize
          :maxlength="512"
          :disabled="isDisabled"
        ></el-input>
      </el-form-item>
      <el-form-item key="difficulty" label="目前存在困难:" prop="difficulty" class="flex-item">
        <el-input
          type="textarea"
          v-model="form.difficulty"
          placeholder="例如目前客户要求上哪些暂未满足，或客情关系维护上存在的困难等"
          autosize
          :maxlength="512"
          :disabled="isDisabled"
        ></el-input>
      </el-form-item>
      <el-form-item key="assist" label="需要哪方面协助:" prop="assist" class="flex-item">
        <el-input
          type="textarea"
          v-model="form.assist"
          placeholder="需要哪方面协助"
          autosize
          :maxlength="512"
          :disabled="isDisabled"
        ></el-input>
      </el-form-item>
      <el-form-item key="customerSituation" label="客情描述:" prop="customerSituation" class="flex-item">
        <el-input
          type="textarea"
          v-model="form.customerSituation"
          placeholder="例如目前客户对接人/核心层和我们的关系描述，对接人性格描述、行事风格、注意点等"
          autosize
          :maxlength="512"
          :disabled="isDisabled"
        ></el-input>
      </el-form-item>
      <el-form-item key="extInfo" label="延伸信息:" prop="extInfo" class="flex-item">
        <el-input
          type="textarea"
          v-model="form.extInfo"
          placeholder="例如客户对自身产业未来市场和业务方向的描述，对重点和新兴市场的方向描述，对行业竞争对手或者合作友商的描述等"
          autosize
          :maxlength="512"
        ></el-input>
      </el-form-item>
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
  baseEmployeeList,
  baseSystemLineList,
  portList,
  portSystemLineInfo,
  listByRole,
  airportList,
} from '@/api/base'
import { searchBd, demandsList } from '@/api/crm/follow'
import CUSTOMER from '@/api/crm/customer'
import CONTACT from '@/api/crm/orgContact'
import { addBaseLinkData as columnsData } from '@/views/crm/data'
// import { validateNumPoint } from '@/utils/validate'
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
    }
  },
  data() {
    return {
      gridData: [],
      employeeList: [],
      employeeList2: [],
      sysLine: [],
      isTrue: true,
      shipperCustOptions:[],
      form: { 
        difficulty: '',
        customerSituation: '',
        extInfo: '',
        ourVisitors:[
          {
            visitor:'',
            ourCompanyPosition:''
          }
        ], //我司拜访人
        custVisitors:[
          {
            custContact:'',
            custContactPosition:'',
            email:'',
            landline:'',
            telephone:''
          }
        ], //客户联系人
        foreigncargos: [
          {
            shippingUnit: '',
            polPortCode: '',
            podPortCode: '',
            aolPortCode:'',
            aodPortCode:'',
          }
        ],   //产品
        shiplines: [
          {
            polPortCode: '',
            podPortCode: '',
            containerNum: '',
            commLines: '',
            shipFeatures:''
          }
        ],//海运航线
        airlines: [
          {
            aolPortCode: '',
            aodPortCode: '',
            containerNum: '',
            airCommLines: '',
            shipFeatures:''
          }
        ],//空运航线
        demands: [
          {
            demandType: '',
            portPosType: '',
            remark: ''
          }
        ], //需求
        commuType: '',
        commuTime: new Date(),
        custName: '',
        bdEmployeeId: '',
        companyScale: '',
        companyAddress: '',
        materialDocPrepare: '',
        visitTarget: '',
        visitCheck: '',
        nextPlan: '',
        remark: '',
        competitor:'',//我司的竞争对手
        custCompetitor:'',//客户的竞争对手
        marketSharePoar:'',//客户所占市场份额 占比数据
        assist:'',
        shippingFeatures:'',
        countryRank:'',
        majorTopics:'',
        followedMatters:'',
        domesticCompetitors:'',
        destinationPortCompetitors:'',
        shipmentName:'',
        coreRequirements:'',
        volume:'',
        internalSupport:''
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
        shippingFeatures: {
          required: true,
          message: '客户主要出货特点必选',
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
        countryRank: {
          required: true,
          message: '客户所在国家排名必填',
          trigger: 'change'
        },
        marketSharePoar: {
          required: true,
          message: '客户所占行业市场份额必填',
          trigger: 'change'
        },
        majorTopics: {
          required: true,
          message: '跟进的主要议题必填',
          trigger: 'change'
        },
        followedMatters: {
          required: true,
          message: '待跟进事项必填',
          trigger: 'change'
        },
        companyAddress: {
          required: true,
          message: '公司地址必填',
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
          message: '拜访（访谈）结果必填',
          trigger: 'change'
        },
        nextPlan: {
          required: true,
          message: '下一步计划必填',
          trigger: 'change'
        },
      },
      podList: [],
      polList: [],
      aodList: [],
      aolList: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
    }
  },
  created() {
    this.initData();
    this.getContractData()
    // 编辑复制
    if (this.options.isEdit || this.options.form.commuId && ['bilateral', 'other'].includes(this.options.form.relationFlag)) {
      const source = this.options.form
      const other = source.visit || source.inquiry
      this.form = Object.assign({}, this.form, source, other)
      const {
        commuType,
        bdEmployeeName,
        foreigncargos,
        shiplines,
        airlines,
        ourVisitors,
        demands,
        custVisitors
      } = this.form
      this.changeCommuType(commuType)
      this.getEmployeeList(bdEmployeeName)
      this.form.ourVisitors.forEach((item) => {
         const { ourCompanyPosition } = item
          item.visitor = {
            employeeId: item.ourCompanyId,
            cname: item.ourCompanyName,
            mobileNo: item.ourCompanyPhone,
            ename: item.ourCompanyEname,
          }
         item.ourCompanyPosition = ourCompanyPosition
        this.getBaseEmployeeList(item.visitor.cname || item.visitor.ename)
      })
      if (this.form.shiplines?.length) {
        this.form.shiplines.forEach((item) => {
          const { podPortCode, polPortCode } = item
          if(podPortCode){
            portList({
              portAttribute: 'port_of_basic',
              portCodes: podPortCode,
              state: 'valid'
            }).then((res) => {
              item.podPortCode = res.data[0]
              let find = this.podList.find(ele => ele.portCode === res.data[0].portCode)
              !find && this.podList.push(res.data[0])
            })
          }
          if(polPortCode){
            portList({
              portAttribute: 'port_of_destination',
              portCodes: polPortCode,
              state: 'valid'
            }).then((res) => {
              item.polPortCode = res.data[0]
              let find = this.polList.find(ele => ele.portCode === res.data[0].portCode)
              !find && this.polList.push(res.data[0])
            })
          }
          item.commLines = {
            cname: item.sysLineCname,
            ename: item.sysLineEname,
            sysLineCode: item.sysLineCode
          }
        })
      }
      if (this.form.airlines?.length) {
        this.form.airlines.forEach((item) => {
           const { aodPortCode, aolPortCode } = item
           if(aolPortCode){
              airportList({
                portAttribute: 'port_of_destination',
                portCodes: aolPortCode,
                state: 'valid'
              }).then((res) => {
                item.aolPortCode = res.data[0]
                let find = this.polList.find(ele => ele.portCode === res.data[0].portCode)
                !find && this.polList.push(res.data[0])
              })
           }
           if(aodPortCode){
              airportList({
                portAttribute: 'port_of_basic',
                portCodes: aodPortCode,
                state: 'valid'
              }).then((res) => {
                item.aodPortCode = res.data[0]
                let find = this.aodList.find(ele => ele.portCode === res.data[0].portCode)
                !find && this.aodList.push(res.data[0])
              })
           }
          item.airCommLines = item.airCommLineName
        })
      }
      if (this.form.foreigncargos?.length) {
        this.form.foreigncargos.forEach((item) => {
          const { podPortCode, polPortCode ,aolPortCode,aodPortCode } = item
          if(podPortCode){
            portList({
              portAttribute: 'port_of_basic',
              portCodes: podPortCode,
              state: 'valid'
            }).then((res) => {
              item.podPortCode = res.data[0]
              let find = this.podList.find(ele => ele.portCode === res.data[0].portCode)
              !find && this.podList.push(res.data[0])
            })
          }
          if(polPortCode){
            portList({
              portAttribute: 'port_of_destination',
              portCodes: polPortCode,
              state: 'valid'
            }).then((res) => {
              item.polPortCode = res.data[0]
              let find = this.polList.find(ele => ele.portCode === res.data[0].portCode)
              !find && this.polList.push(res.data[0])
            })
          }
          if(aodPortCode){
            airportList({
            portAttribute: 'port_of_basic',
            portCodes: aodPortCode,
            state: 'valid'
          }).then((res) => {
            item.aodPortCode = res.data[0]
            let find = this.aodList.find(ele => ele.portCode === res.data[0].portCode)
            !find && this.aodList.push(res.data[0])
          })
          }
          if(aolPortCode){
            airportList({
              portAttribute: 'port_of_destination',
              portCodes: aolPortCode,
              state: 'valid'
            }).then((res) => {
              item.aolPortCode = res.data[0]
              let find = this.aolList.find(ele => ele.portCode === res.data[0].portCode)
              !find && this.aolList.push(res.data[0])
            })
          }
        })
      }
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
      if (!foreigncargos.length) {
        addData.foreigncargos = [
          {
            shippingUnit: '',
            polPortCode: '',
            podPortCode: '',
            aolPortCode:'',
            aodPortCode:'',
          }
        ]
      }
      if (!shiplines.length) {
        addData.shiplines = [
            {
            polPortCode: '',
            podPortCode: '',
            containerNum: '',
            commLines: '',
            shipFeatures:''
          }
        ]
      }
      if (!airlines.length) {
        addData.airlines = [
            {
            aolPortCode: '',
            aodPortCode: '',
            containerNum: '',
            airCommLines: '',
            shipFeatures:''
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
      if (!ourVisitors.length) {
        addData.ourVisitors = [
          {
            visitor:'',
            ourCompanyPosition:''
          }
        ]
      }
      if (!custVisitors.length) {
        addData.custVisitors = [
          {
            custContact:'',
            custContactPosition:'',
            email:'',
            landline:'',
            telephone:''
          }
        ]
      }
      this.form = Object.assign(this.form, addData)
    } else {
      // 新增
      const { sysUserId, userName,mobileNo } = this.$store.state.user.userInfo
      // 如果登录的是obd获取他的上级bd
      if (this.isObd) {
        this.getSearchBd(this.custid, sysUserId)
      } else {
        this.form.bdEmployeeId = sysUserId
        this.form.bdEmployeeName = userName
        this.getEmployeeList(userName)
      }
      this.form.companyAddress = this.options.form.companyAddress
      this.form.custName = this.companyName || this.$route.query.name
      this.form.ourVisitors = [
        {
          employeeId: sysUserId,
          cname: userName || '',
          mobileNo: mobileNo || '',
          ename:  ''
        }
      ]
      this.getBaseEmployeeList(userName)
      if (['unilateral'].includes(this.options.form.relationFlag)) {
        this.form.relationNewFlag = this.options.form.relationNewFlag
        this.form.commuId = this.options.commuId
        this.form.commuType = this.options.form.commuType
        this.form.commuTime = this.options.form.commuTime
        this.form.custVisitors = [ ...this.options.form.custVisitors ]
        this.form.materialDocPrepare = this.options.form.materialDocPrepare
        this.form.visitTarget = this.options.form.visitTarget
        this.form.extInfo = this.options.form.extInfo
        if (this.form.custVisitors.length) {
          this.form.custVisitors.forEach(item => {
            item.custContact = item.name +'#'+ item.ename +'#'+ item.oid
            item.telephone = item.mobileNo
          })
        }
      }
    }
;
  },
  watch: {
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    commuTypeList() {
      return this.dictMap['custCommType'].filter(
        (item) => item.value !== 'order_record'
      )
    },
    // 海外客户公司规模
    foreignScaleList () {
      return this.dictMap['orgScale'].filter((item) => item.value.includes('fp'))
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
  },
  methods: {
    //获取客户基本信息
    initData(){
      CUSTOMER.verifyInfo({custid:this.$route.query.custid}).then((res) => {
        const beseInfo = res.data.organizationDto
        this.form.companyScale = beseInfo.scale
      })
    },
    //获取客户联系人列表
    getContractData(add){
      CONTACT.customerList({custid:this.$route.query.custid}).then((res) => {
        this.custContactList = res.data.filter(item=>item.status==='effect');
        // if(add === 'new'){
        //   let newAdd = res.data[res.data.length-1]
        //   this.form.custContact = newAdd.name+'#'+ newAdd.ename +'#'+ newAdd.oid
        // }
      })
    },
    changeCustCon(val,index){
      if(val.indexOf("#") == -1){
        this.form.custVisitors[index].custContact = ''
      }
      let oid = val.split('#')[2]
      CONTACT.customerList({custid:this.$route.query.custid}).then((res) => {
        this.custContactList = res.data.filter(item=>item.status==='effect');
        this.contactDatas(oid,index)
      })
    },
    contactDatas(oid,index){
      let contact = this.custContactList.find(item=>item.oid == oid)
      if(contact){
        this.form.custVisitors[index].custContactPosition = contact.custContactPosition
        this.form.custVisitors[index].telephone = contact.mobileNo
        this.form.custVisitors[index].email = contact.email
        this.form.custVisitors[index].landline = contact.telNo
        this.form.eduBack = contact.eduBack
        this.form.familyBack = contact.familyBack
        this.form.professionalBack = contact.professionalBack
        this.form.hobbies = contact.hobbies
        this.form.other = contact.other
        this.form.contactId = oid
        this.form.customerSituation = '教育背景:'+ contact.eduBack +'\n' +
         '家庭背景:'+ contact.familyBack +'\n' +
         '从业背景:'+ contact.professionalBack +'\n' +
         '性格爱好:'+ contact.hobbies +'\n' +
         '其他特殊情况或要求:'+ contact.other 
      }
    },
    //获取发货单位
    custFilterMehod(val) {
			this.getCustList(val)
		},
    custVisibleChange(val, name) {
			if (val) {
				this.getCustList(name)
			}
		},
    getCustList(val = '') {
			this.$store.dispatch('dict/queryCustomerList', val).then(data => {
				let list = data.list
				this.shipperCustOptions = list.map(o => {
					return {
						...o,
						value: o.name,
						label: o.name
					}
				})
			})
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
        foreigncargos: {
          shippingUnit: '',
          polPortCode: '',
          podPortCode: '',
          aolPortCode:'',
          aodPortCode:'',
        },
        shiplines:{
          polPortCode: '',
          podPortCode: '',
          containerNum: '',
          commLines: '',
          shipFeatures:''
        },
        airlines:{
          aolPortCode: '',
          aodPortCode: '',
          containerNum: '',
          airCommLines: '',
          shipFeatures:''
        },
        demands: {
          demandType: '',
          portPosType: '',
          remark: ''
        },
        ourVisitors: {
          visitor:'',
          ourCompanyPosition:''
        },
        custVisitors:{
          custContact:'',
          custContactPosition:'',
          email:'',
          landline:'',
          telephone:''
        }
      }
      this.form[name].push(source[name])
    },
    removeItem(name, index) {
      this.form[name].splice(index, 1)
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
      const data = {
        currPage: 1,
        pageSize: 1000,
        query: [{ column: 'name', type: 'eq', value: str }]
      }
      baseEmployeeList(data)
        .then((res) => {
          if (res.code === 0) {
              this.employeeList2 = res.data.list || []
          }
        })
    
        .catch(() => {})
    },
    changeList(val){
      if(val){
       this.getBaseEmployeeList('')
      }
    },
    // 航线
    getSystemLineList(str = '') {
      baseSystemLineList(str, 'valid')
        .then((res) => {
          this.sysLine = res.data
        })
        .catch(() => {})
    },
    showLine(val) {
      if (val && !this.sysLine.length) {
        this.getSystemLineList()
      }
    },
    //海运 起运港port_of_basic，目的港port_of_destination
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
    //空运 起运港port_of_basic，目的港port_of_destination
    getAirPort(str = '', type) {
      // if (str === '') {
      //   str =
      //     type === 'port_of_basic'
      //       ? this.form.polPortName
      //       : this.form.podPortName
      // }
      const data = {
        // portName: str,
        portAttribute: type,
        portCodes: '',
        state: 'valid'
      }
      airportList(data)
        .then((res) => {
          if (type === 'port_of_basic') {
            this.aolList = res.data
            const { aolPortCode } = this.form
            if (typeof aolPortCode !== 'object') {
              this.form.aolPortCode =
                res.data.find((item) => item.airportCode === aolPortCode) || ''
            }
          } else {
            this.aodList = res.data
            const { aodPortCode } = this.form
            if (typeof aodPortCode !== 'object') {
              this.form.aodPortCode =
                res.data.find((item) => item.airportCode === aodPortCode) || ''
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
    showAolport(val) {
      if (val && !this.polList.length) {
        this.getAirPort('', 'port_of_basic')
      }
    },
    showAodport(val) {
      if (val && !this.podList.length) {
        this.getAirPort('', 'port_of_destination')
      }
    },
    // 切换拜访方式
    changeCommuType(val) {
      // this.showTelephone = val === 'telephone'
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    // 切换目的港
    changePod(data, index) {
      const { portCode } = data
      portSystemLineInfo(portCode)
        .then((res) => {
          if (res.data.length) {
              this.form.shiplines[index]['commLines'] = res.data[0]
              this.$forceUpdate()
          }
        })
        .catch(() => {})
    },
    // 切换空运目的港
    changeAirPod(data, index) {
      this.form.airlines[index].airCommLines = data.sysLineName
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
            shiplines,
            airlines,
            foreigncargos,
            demands,
          } = this.form
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
          this.form.demands = demands.filter(item => item.demandType || item.portPosType || item.remark)
          
          const reg = /^\d+(?=\.{0,1}\d+$|$)/;
          const portCode = shiplines.some((item) =>  item.polPortCode!=='' && item.podPortCode!==''
            && !item.containerNum )
          const syslinesConNum = shiplines.some((item) =>item.containerNum && !reg.test(item.containerNum))
          const aortCode = airlines.some((item) =>  item.aolPortCode!=='' && item.aodPortCode!==''
            && !item.containerNum )
          const airlinesConNum = airlines.some((item) =>item.containerNum&& !reg.test(item.containerNum))
            if(portCode){
              return this.$msgErrClose('海运出货航线T量不能为空')
            }
            if(syslinesConNum){
              return this.$msgErrClose('海运出货航线大致T量格式不正确')
            }
            if(aortCode){
              return this.$msgErrClose('空运出货航线T量不能为空')
            }
            if(airlinesConNum){
              return this.$msgErrClose('空运出货航线T量格式不正确')
            }
          const noP =  shiplines.some((item) =>  item.polPortCode!=='' && item.podPortCode!=='' )
          const noA =  airlines.some((item) =>  item.aolPortCode!=='' && item.aodPortCode!=='' )
          if(!noP&&!noA){
              return this.$msgErrClose('出货航线的海运港口或空运港口必须填一组')
          }
          const forNoP =  foreigncargos.some((item) =>  item.podPortCode!=='' && item.polPortCode!=='' )
          const forNoA =  foreigncargos.some((item) =>  item.aodPortCode!=='' && item.aolPortCode!=='' )
          if(!forNoP&&!forNoA){
              return this.$msgErrClose('KEY ACCOUNTS的海运港口或空运港口必须填一组')
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
          return this.$msgErrClose('请将必填项填写完整！')
        }
      })
    },
    showDialog(index){
      this.$emit('showadd',false,index)
    }
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
    }

    .flex-item {
      width: 100%;
      textarea {
        width: 100%;
      }
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
      padding: 3px 15px;
      margin-left:15px;
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
