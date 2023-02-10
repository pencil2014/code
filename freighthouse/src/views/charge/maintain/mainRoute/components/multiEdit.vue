<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <div class="checkbox-group-container">
      <el-checkbox-group size="mini" v-model="checkedKeys" @change="handleCheckedKeys" id="checkbox">
        <el-checkbox 
          size="mini"
          class="mb10"
          v-for="(item, index) in keysOptions" 
          :key="index" 
          :label="item.key" 
          :disabled="item.disabled"
        >
          <span style="display: inline-block" v-if="item.showToCust">
            <CustViewTip :label="item.label" />
          </span>
          <template v-else>
            {{item.label}}
          </template>
        </el-checkbox>
      </el-checkbox-group>
      <p class="sort-tips">拖动可支持自定义排序</p>
    </div>
    <div class="flex">
      <div class="input-container multi-select-tag" :class="item.type === 'table' ? 'table-container' : item.key === 'issueWay' ? 'issueWay-container' : ''"  v-for="(item, index) in checkedKeysOptions" :key="index">
        <div v-if="item.type !== 'table'" class="flex-box">
          <span class="filter-txt" v-if="item.type">
            <span style="display: inline-block" v-if="item.showToCust">
              <CustViewTip :label="item.label" />
            </span>
            <template v-else>{{item.label}}</template>
          </span>
          <!-- <span class="filter-txt" v-if="item.type">{{item.label}}</span> -->
          <el-input size="mini" v-if="['input', 'textarea'].includes(item.type)"
            v-model="item.value"
            :type="item.type"
            :style="item.style || defaultStyle"
            :maxlength="item.maxlength"
            :minlength="item.minlength"
            :placeholder="item.placeholder || '请输入' + item.label"
            :clearable="item.clearable || true"
            :disabled="item.disabled"
            :oninput="item.oninput"
            :rows="item.rows"
            :autosize="item.autosize"
            :name="item.name"
            :readonly="item.readonly"
            :max="item.max"
            :min="item.min"/>

          <!-- 远程搜索 -->
          <el-select size="mini" v-if="item.type === 'remoteSelect'"
            v-model="item.value"
            filterable
            remote
            clearable
            :disabled="item.disabled"
            :style="item.style || defaultStyle"
            :reserve-keyword="item.reserveKeyword"
            :popper-class="item['popper-class']"
            :placeholder="item.placeholder || '请选择' + item.label"
            :remote-method="(val) => {item.filterMehod && item.filterMehod(val, item)}"
            @visible-change="(val) => {item.visibleChange && item.visibleChange(val, item)}"
            @change="(value) => {item.change && item.change(value, item)}">
            <el-option
              v-for="item in item.data"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>

          <el-autocomplete size="mini"
            v-if="item.type === 'autocomplete'"
            class="inline-input"
            v-model="item.value"
            :type="item.type"
            :style="item.style || defaultStyle"
            :disabled="item.disabled"
            :fetch-suggestions="(queryString, cb) => {item.querySearch && item.querySearch(queryString, cb)}"
            :placeholder="item.placeholder || '请输入' + item.label"
            @change="(value) => {item.change && item.change(value)}"
            @select="(value) => {item.select && item.select(value, item)}"
            ></el-autocomplete>
        
          <el-select size="mini" v-if="item.type === 'select'"
            v-model="item.value"
            :style="item.style || defaultStyle"
            :multiple="item.multiple"
            :disabled="item.disabled"
            :clearable="item.clearable || true"
            :collapse-tags="item['collapse-tags']"
            :multiple-limit="item['multiple-limit']"
            :name="item.name"
            :filterable="item.filterable"
            :allow-create="item['allow-create']"
            :reserve-keyword="item.reserveKeyword"
            :filter-method="(val) => {item.filterMehod && item.filterMehod(val,item)}"
            :popper-class="item['popper-class']"
            :placeholder="item.placeholder  || '请选择' + item.label"
            @visible-change="(val) => {item.visibleChange && item.visibleChange(val,item)}"
            @change="(value) => {item.change && item.change(value)}">
            <!-- :label="item.nonDictionary ? o.label : $t(`dict.${item.key}.${o.value}`)" -->
              <el-option v-for="(o, key) in selectOptions(item)"
                :key="key"
                :label="o.label"
                :value="o.value">
              </el-option>
          </el-select>
          <!-- 日期和时间{year/month/date/dates/ week/datetime/datetimerange/daterange} -->
          <el-date-picker size="mini" v-if="item.type === 'date'" :class="{'date-class': item.key==='beginDate'}"
            v-model="item.value"
            :type="item.category"
            :name="item.name"
            :style="item.style || defaultStyle"
            :readonly="item.readonly"
            :disabled="item.disabled"
            :editable="item.editable"
            :clearable="item.clearable"
            :range-separator="item['range-separator']"
            :start-placeholder="item['start-placeholder'] || '开始时间'"
            :end-placeholder="item['end-placeholder'] || '结束时间'"
            :placeholder="item.placeholder || '请选择' + item.label"
            :format="item.format"
            :align="item.align"
            :popper-class="item['popper-class']"
            :default-value="item['default-value']"
            :default-time="item['default-time']"
            :value-format="item.format"/>
          <!-- 拆分有效期开始结束时间 -->
          <template v-if="item.key==='beginDate'">
            <el-date-picker v-model="endDate" type="date" placeholder="请选择结束时间" class="date-class" value-format="yyyy-MM-dd" clearable></el-date-picker>
          </template>
          <!-- 是否追加说明 -->
          <template v-if="['attention','surchargeDesc','guidanceDesc','weightDesc','internalDesc','freeTimeDesc','podChargeDesc'].includes(item.key)" >
            <el-checkbox v-model="append[item.key+'Append']" class="add-check" >是否追加</el-checkbox>
          </template>
          <!-- 中转港 -->
          <template v-if="item.key==='transitPortCodes'">
            <el-checkbox v-model="transitPortEmpty" class="add-empty" @change="changeEmpty">清空</el-checkbox>
          </template>
          <!-- 出单方式 -->
          <template v-if="item.key==='issueWay'">
            <el-row class="issue-way-row">
              <el-col :span="8" class="issue-way-item">
                <!-- <span class="filter-txt" style="display: inline-block">
                  <CustViewTip label="出单方式" />
                </span> -->
                <span class="filter-txt">
                  <span style="display: inline-block">
                    <CustViewTip label="出单方式" />
                  </span>
                </span>
                <el-select v-model="item.value" size="mini" clearable multiple placeholder="请选择" style="width: 100%;" @change="handleChangeIssueWay">
                  <el-option v-for="(ele, index) in dictMap.chargeIssueWay" :label="ele.label" :value="ele.value" :key="index">
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="8" class="issue-way-item">
                <span class="filter-txt"><em class="red mr5" v-if="item.value.includes('no_free_telex_release')">*</em>电放费</span>
                <el-input clearable size="mini" placeholder="请输入" v-model="telexObj.telexFee" style="width: 240px" @input="telexFeeOnInput(telexObj.telexFee)" :disabled="item.value.includes('free_telex_release')"></el-input>
                <el-select v-model="telexObj.telexFeeCurrency" size="mini" placeholder="请选择币别" style="width: 240px; margin-left: 10px">
                  <el-option v-for="item in currencyOptions" :label="item.code" :value="item.code" :key="item.code">
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="8" class="issue-way-item">
                <span class="filter-txt">
                  <span style="display: inline-block">
                    <CustViewTip label="出单方式备注" />
                  </span>
                </span>
                <div>
                  <el-input type="textarea" clearable size="mini" placeholder="请输入" v-model="telexObj.issueWayDesc" maxlength="512" show-word-limit></el-input>
                  <el-checkbox v-model="append['issueWayDescAppend']" class="add-check ml0">是否追加</el-checkbox>
                </div>
              </el-col>
            </el-row>
          </template>
        </div>
        <div class="item" v-else>
          <div v-if="item.key === 'surchargeList'">
            <div class="surcharge-list-row">
              <div class="t">
                <CustViewTip label="附加费" />
              </div>
              <SearchFilter :item="templateIdConfig" />
            </div>
            <el-table :data="dialogConfig.surchargeList" class="mt20">
              <el-table-column align="center" label="费用英文" width="150">
                <template slot-scope="scope">
                  <el-select
                    size="mini" v-model="scope.row.chargeEname" filterable remote reserve-keyword
                    placeholder="费用英文"
                    :remote-method="feeItemQuerySearch"
                    @focus="feeItemQuerySearch('')"
                    @change="((value) => feeItemChange(value, scope.row,'01'))"
                    >
                    <el-option
                      v-for="item in feeItemList"
                      :key="item.feeCode"
                      :label="item.feeEnName"
                      :value="item.feeEnName">
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column align="center" label="费用中文" width="150">
                <template slot-scope="scope">
                <el-select
                    size="mini" v-model="scope.row.chargeName"  filterable remote reserve-keyword
                    placeholder="费用中文"
                    :remote-method="feeItemQuerySearch"
                    @focus="feeItemQuerySearch('')"
                    @change="((value) => feeItemChange(value, scope.row,'02'))"
                    >
                      <el-option
                        v-for="item in feeItemList"
                        :key="item.feeCode"
                        :label="item.feeName"
                        :value="item.feeName">
                      </el-option>
                    </el-select>
                </template>
              </el-table-column>
              <el-table-column align="center"  label="付款方式" width="150">
                <template slot-scope="scope">
                  <el-select size="mini" v-model="scope.row.payMode" placeholder="请选择">
                    <el-option v-for="(o, key) in dictMap['chargePayType']"
                      :key="key"
                      :label="o.label"
                      :value="o.value">
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column align="center" label="计费单位" width="100">
                <template slot-scope="scope">
                  <el-select size="mini" v-model="scope.row.rateUnit" placeholder="请选择">
                    <el-option v-for="(o, key) in dictMap['rateUnit']"
                      :key="key"
                      :label="o.label"
                      :value="o.value">
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
                  <el-table-column align="center" label="币别" width="100">
                <template slot-scope="scope">
                  <el-select
                    size="mini" v-model="scope.row.currency" filterable 
                    placeholder="币别"
                    >
                    <el-option
                      v-for="item in currencyList"
                      :key="item.code"
                      :label="item.code"
                      :value="item.code">
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column align="center" label="金额" v-for="(item,index) in price" :key="index" width="150">
                <template slot-scope="scope">
                  <el-input v-if="scope.row.rateUnit == 'container_type'"  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" size="mini" v-model="scope.row[item.value] ">
                    <template v-if="scope.row.rateUnit == 'container_type'"  slot="prepend">{{item.label}}</template>
                  </el-input>
                  <el-input v-if="item.label == '20GP:' && scope.row.rateUnit != 'container_type'" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"  size="mini" v-model="scope.row.price">
                    <template v-if="scope.row.rateUnit == 'container_type'" slot="prepend">{{item.label}}</template>
                  </el-input>
                  <span v-if=" item.label != '20GP:'&&scope.row.rateUnit != 'container_type'">
                    <span >— —</span>
                  </span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="备注" width="200">
                <template slot-scope="scope">
                  <el-input size="mini" v-model="scope.row.remark" placeholder="请输入" maxlength="512"></el-input>
                </template>
              </el-table-column>
              <el-table-column align="center" label="操作" fixed="right">
                <template slot-scope="scope">
                  <el-button @click="handleDelete(scope)" type="text" size="mini">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="dialog-add">
              <el-button style="width:100%" size="mini" @click="handleAddLine"> 
                <i class="el-icon-plus"></i>
                新增附加费
              </el-button>
            </div>
            <template>
              <div class="del-charge">
                <span class="lab">批量删除附加费：</span>
                <div class="large-select">
                    <el-select        
                      v-model="deleteSurchargeCodeList" 
                      placeholder="请选择" 
                      remote  
                      clearable 
                      filterable 
                      multiple 
                      collapse-tags 
                      :remote-method="feeItemQuerySearch"
                      value-key="feeCode"
                      >
                      <el-option
                        v-for="item in feeItemList"
                        :key="item.feeCode"
                        :label="`${item.feeEnName} - (${item.feeName})`"
                        :value="item">
                      </el-option>
                    </el-select>
              </div>
              <div class="cnt-box" v-show="deleteSurchargeCodeList.length">
                <p v-for="item in deleteSurchargeCodeList" :key="item.feeCode">
                {{item.feeEnName}} - {{item.feeName}}
                </p>
              </div>
              </div>
            </template>
          </div>
          <div  v-if="item.key === 'specialOceanFreightList'">
            <div class="freight-list-row">
              <div class="t">
                <CustViewTip label="海运费" />
              </div>
              <div class="allin-state">
                <span class="row-tit-label row-tit-info">开启时，只可输入合计 / 关闭时，可输入基价和中转价。</span>
                <el-switch 
                  size="mini"
                  v-model="dialogConfig.allIn" 
                  active-color="#3E80F5" 
                  inactive-color="#4A4A4A" 
                  active-value="allin"
                  inactive-value="not_allin"
                  @change="changeAllInState">
                </el-switch>
              </div>
            </div>
            <el-table class="boxType-table"  ref="oceanFreightTable" style="width: 100%" :data="dialogConfig.oceanFreightQuery">
              <el-table-column prop="structure" label="价格类型" align="center">
                <template slot-scope="scope">
                  {{$t(`dict.chargeStructure.${scope.row.structure}`)}}
                </template>
              </el-table-column>
              <el-table-column prop="currency" label="币别" align="center">
                <template slot-scope="scope">
                  <el-select size="mini" v-model="scope.row.currency" placeholder="请选择" filterable :disabled="scope.row.disabled" @change="hadnleChangeCurrency" class="currency-select">
                     <el-option
                       v-for="item in currencyList"
                      :key="item.code"
                      :label="item.code"
                      :value="item.code">
                    </el-option>
                  </el-select>
                  <el-select v-model="scope.row.symbol" :disabled="scope.row.disabled" @change="val => changeSymbol(val,scope.row)"  class="symbol-select">
                    <el-option v-for="item in symbolList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="定价" align="center">
                <el-table-column prop="priceGp20" label="20GP" align="center">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.priceGp20Symbol" :disabled="scope.row.disabled" class="symbol-select">
                      <el-option v-for="item in symbolList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                    <el-input size="mini" placeholder="请输入金额" v-model="scope.row.priceGp20" :disabled="scope.row.disabled" clearable @blur="hadnleChangePrice(scope.row.priceGp20)"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="priceGp40" label="40GP" align="center">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.priceGp40Symbol" :disabled="scope.row.disabled" class="symbol-select">
                      <el-option v-for="item in symbolList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                      </el-option>
                    </el-select>
                    <el-input size="mini" placeholder="请输入金额" v-model="scope.row.priceGp40" :disabled="scope.row.disabled" clearable @blur="hadnleChangePrice(scope.row.priceGp40)"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="priceHq40" label="40HQ" align="center">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.priceHq40Symbol" :disabled="scope.row.disabled" class="symbol-select">
                      <el-option v-for="item in symbolList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                      </el-option>
                    </el-select>
                    <el-input size="mini" placeholder="请输入金额" v-model="scope.row.priceHq40" :disabled="scope.row.disabled" clearable @blur="hadnleChangePrice(scope.row.priceHq40)"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="priceHq45" label="45HQ" align="center">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.priceHq45Symbol" :disabled="scope.row.disabled" class="symbol-select">
                      <el-option v-for="item in symbolList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                      </el-option>
                    </el-select>
                    <el-input size="mini" placeholder="请输入金额" v-model="scope.row.priceHq45" :disabled="scope.row.disabled" clearable @blur="hadnleChangePrice(scope.row.priceHq45)"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="priceNor20" label="20NOR" align="center">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.priceNor20Symbol" :disabled="scope.row.disabled" class="symbol-select">
                      <el-option v-for="item in symbolList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                      </el-option>
                    </el-select>
                    <el-input size="mini" placeholder="请输入金额" v-model="scope.row.priceNor20" :disabled="scope.row.disabled" clearable @blur="hadnleChangePrice(scope.row.priceNor20)"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="priceNor40" label="40NOR" align="center">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.priceNor40Symbol" :disabled="scope.row.disabled" class="symbol-select">
                      <el-option v-for="item in symbolList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                      </el-option>
                    </el-select>
                    <el-input size="mini" placeholder="请输入金额" v-model="scope.row.priceNor40" :disabled="scope.row.disabled" clearable @blur="hadnleChangePrice(scope.row.priceNor40)"></el-input>
                  </template>
                </el-table-column>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </BaseDialog>
</template>

<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import store from '@/store'
import {filterEmpty} from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import SearchFilter from '@/components/Base/Search/filter'
import CustViewTip from './custViewTip'

import {userSurchargeList, userSurchargeInfo, surchargeInfo} from '@/api/charge'
import {basePortList, baseCurrencyList,baseFeeItemList } from '@/api/base'
import Sortable from 'sortablejs'

export default {
  data() {
    return {
      state: '',
      dialogConfig: {
        title: '批量修改',
        show: true,
        width: "1200px",
        surchargeList: [],
        oceanFreightQuery: [
          {chargeCode:'', chargeType: '', structure: 'basic_price', chargeMode: '', payMode: '', currency: 'USD', rateUnit: 'container_type', priceGp20: '', priceGp40: '',priceHq40: '', priceHq45: '',priceNor20:'',priceNor40:'', price: '', symbol:'=', priceGp20Symbol: '=', priceGp40Symbol: '=',priceHq40Symbol: '=', priceHq45Symbol: '=',priceNor20Symbol:'=',priceNor40Symbol:'='},
          {chargeCode:'', chargeType: '', structure: 'transfer_price', chargeMode: '', payMode: '', currency: 'USD', rateUnit: 'container_type', priceGp20: '', priceGp40: '',priceHq40: '', priceHq45: '',priceNor20:'',priceNor40:'', price: '', symbol:'=', priceGp20Symbol: '=', priceGp40Symbol: '=',priceHq40Symbol: '=', priceHq45Symbol: '=',priceNor20Symbol:'=',priceNor40Symbol:'='},
          {chargeCode:'', chargeType: '', structure: 'total_price', chargeMode: '', payMode: '', currency: 'USD', rateUnit: 'container_type', priceGp20: '', priceGp40: '',priceHq40: '', priceHq45: '',priceNor20:'',priceNor40:'', price: '', disabled: true, symbol:'=', priceGp20Symbol: '=', priceGp40Symbol: '=',priceHq40Symbol: '=', priceHq45Symbol: '=',priceNor20Symbol:'=',priceNor40Symbol:'='}
        ],
        allIn: '',
        btns: [
          {label: '取消', action: 'Cancel'},
          {label: '保存', action: 'Save', type: 'primary'},
          {label: '发布', action: 'Publish', type: 'danger'}
        ]
      },
      // 默认成本价
      defaultPrice: {
        currency: 'USD',
        priceGp20: '',
        priceGp40: '',
        priceHq40: '',
        priceHq45: '',
        priceNor20:"",
        priceNor40:"",
      },
      defaultStyle: {
        width: '240px'
      },
      editQuery: {
      },
      // 选中后的字段
      checkedKeys: [],
      // 字段选项
      keysOptions: {
        feederPolCode: {
          label: '驳船收货地',
          key: 'feederPolCode',
          type: 'select',
          value:'',
          multiple: true, 
          'collapse-tags': true,
          filterable: true,
          nonDictionary: true,
          data: [],
          showToCust: true,
          reserveKeyword: true,
          visibleChange: (val,item) => {
            this.transitPortSearch('', 'port_of_feeder', 'valid', item)
          }, filterMehod: (val,item) => {
            this.transitPortSearch(val, 'port_of_feeder', 'valid', item)
          }, change: (val) => {
          }
        },
        polCode: {
          label: '大船起运港',
          key: 'polCode',
          type: 'remoteSelect',
          value:'',
          data: [],
          showToCust: true,
          visibleChange: (val,item) => {
            // this.transitPortSearch('', 'port_of_basic', 'valid', item)
          }, filterMehod: (val,item) => {
            this.transitPortSearch(val, 'port_of_basic', 'valid', item)
          }, change: (val) => {
          }
        },
        unloadingPortCode: {
          label: '卸货港',
          key: 'unloadingPortCode',
          type: 'remoteSelect',
          value:'', 
          data: [],
          visibleChange: (val,item) => {
            // this.transitPortSearch('', 'port_of_destination', 'valid', item)
          }, filterMehod: (val,item) => {
             this.transitPortSearch(val, 'port_of_discharge', 'valid', item)
          }, change: (val) => {
          }
        },
        podCode: {
          label: '目的地',
          key: 'podCode',
          type: 'remoteSelect',
          value:'', 
          data: [],
          showToCust: true,
          visibleChange: (val,item) => {
            // this.transitPortSearch('', 'port_of_destination', 'valid', item)
          }, filterMehod: (val,item) => {
             this.transitPortSearch(val, 'port_of_destination', 'valid', item)
          }, change: (val) => {
          }
        },
        shipCarrierCode: {
          label: '船公司',
          key: 'shipCarrierCode',
          type: 'remoteSelect',
          value:'', 
          data: [],
          showToCust: true,
          visibleChange: (val,item) => {
            // this.shipQuerySearch('', item)
          }, filterMehod: (val,item) => {
            this.shipQuerySearch(val,item)
          }, change: (val) => {
          }
        },
        transitPortCodes: {
          label: '中转港', key: 'transitPortCodes', type: 'select', multiple: true, 'collapse-tags': true,'multiple-limit':3,filterable: true, value: '', data: [], nonDictionary: true, reserveKeyword: true,
          showToCust: true,
          visibleChange: (val,item) => {
            this.transitPortSearch('', 'port_of_basic','valid', item)
          }, filterMehod: (val,item) => {
            this.transitPortSearch(val, 'port_of_basic','valid', item)
          }, change: (val) => {
          }
        },
        feederMatchMode: {label: '驳船匹配方式', key: 'feederMatchMode', type: 'select', value: ''},
        bkgAgentId: {label: '订舱代理', key: 'bkgAgentId', type: 'remoteSelect', value:'', data: [], nonDictionary: true, 
          visibleChange: (val, item) => {
            val && this.getSupplierList('bkg_agent', '', item)
          }, filterMehod: (val, item) => {
            this.getSupplierList('bkg_agent', val, item)
          }, change: (val, item) => {
            // Object.assign(item, {
            //   queryValue: val
            // })
          }
        },
        carrierLineName: {
          key: 'carrierLineName',
          label: '承运人航线',
          type: 'autocomplete',
          querySearch: (queryString, cb) => {
            this.sysLineQuerySearch(queryString, cb)
          }, change: (val) => {
            Object.assign(this.editQuery, {
              carrierLineCode: val
            })
          },
          select: (item) => {
            Object.assign(this.editQuery, {
              carrierLineCode: item.key,
              carrierLineName: item.value
            })
          }
        },
        carrierService: {label: '航线代码', key: 'carrierService', type: 'input', value:'', showToCust: true,},
        beginDate: {label: '有效期', key: 'beginDate', type: 'date', category: 'date', value:'', format: 'yyyy-MM-dd', showToCust: true},
        effectiveType: {label: '有效类别', key: 'effectiveType', type: 'select', value:'', data: [], showToCust: true },
        cargoLimited: {label: '限定货类', key: 'cargoLimited', type: 'input', value:'', showToCust: true,},
        sailingDate: {label: '开航日', key: 'sailingDate', type: 'date', value:'', format: 'yyyy-MM-dd'},
        cutoffDate: {label: '截文件', key: 'cutoffDate', type: 'input', value:''},
        schedule: {label: '船期', key: 'schedule', type: 'input', value:'', showToCust: true,},
        voyage: {label: '航程', key: 'voyage', type: 'input', value:'', showToCust: true,}, // oninput:"if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"
        shipTerms: {
          key: 'shipTerms',
          label: '运输条款',
          type: 'select',
          data: [],
          nonDictionary: true,
          value: ''
        },
        issueWay: {label: '出单方式', key: 'issueWay', type: '', value:'', data: [], propInDict: 'chargeIssueWay', showToCust: true },
        blType: {label: '提单类型', key: 'blType', type: 'select', value:'', data: []},
        attention: {label: '特别提醒', key: 'attention', type: 'textarea', value:'', showToCust: true},
        recommendLevel: {label: '推荐运价', key: 'recommendLevel', type: 'select', value:''},
        // blackSailing: {label: '停航标识', key: 'blackSailing', type: 'select', value:''},
        surchargeDesc: {label: '附加费说明', key: 'surchargeDesc', type: 'textarea', value:'', showToCust: true},
        guidanceDesc: {label: '收货指引', key: 'guidanceDesc', type: 'textarea', value:''},
        weightDesc: {label: '限重说明', key: 'weightDesc', type: 'textarea', value:'', showToCust: true},
        internalDesc: {label: '内部备注', key: 'internalDesc', type: 'textarea', value:''},
        // externalDesc: {label: '外部备注', key: 'externalDesc', type: 'input', value:''},
        freeTimeDesc: {label: '免用免堆', key: 'freeTimeDesc', type: 'textarea', value:'', showToCust: true},
        pricer: {
          key: 'pricer',
          label: '拿价人',
          type: 'autocomplete',
          querySearch: (queryString, cb) => {
            this.pricerQuerySearch(queryString, cb)
          }, change: (val) => {
            Object.assign(this.editQuery, {
              pricer: val
            })
          },
          select: (item) => {
            Object.assign(this.editQuery, {
              pricer: item.key,
              pricerName: item.value
            })
          }
        },
        maintainerId: {
          key: 'maintainerId',
          label: '维护人',
          type: 'autocomplete',
          querySearch: (queryString, cb) => {
            this.pricerQuerySearch(queryString, cb)
          }, change: (val) => {
            Object.assign(this.editQuery, {
              maintainerId: val
            })
          },
          select: (item) => {
            Object.assign(this.editQuery, {
              maintainerId: item.key,
              maintainerName: item.value
            })
          }
        },
        specialOceanFreightList: {label: '海运费', key: 'specialOceanFreightList', type: 'table', value:'', showToCust: true},
        surchargeList: {label: '附加费', key: 'surchargeList', type: 'table', value:'', showToCust: true,},
        blankSailing: {label:'是否停航', key:'blankSailing', type: 'select',
          data: [
            {
              label: '是',
              value: 'Y'
            },
            {
              label: '否',
              value: 'N' 
            }
          ],
          nonDictionary: true,
          value: '' },
        // issueWayDesc: {label: '出单方式备注', key: 'issueWayDesc', type: 'textarea', value:'', hide: true},
        podChargeDesc: {label: '目的港收费标准参考', key: 'podChargeDesc', type: 'textarea', value:''}
      },
      templateIdConfig: {
        type: 'cascader',
        key: 'templateId',
        label: '附加费模板',
        style: {
          width: '240px'
        },
        inputBox: {
          "justify-content": "normal"
        },
        filterable: true,
        clearable: true,
        data: [],
        itemDataProps: {
          expandTrigger: 'hover' ,
          value:'templateId', 
          label:'templateName'
        },
        change: (value) => {
          let len = value.length
          this.getList(value[len-1])
        }
      },
      price:[{label: '20GP:',value: 'priceGp20'}, {label: '40GP:', value: 'priceGp40'},{label: '40HQ:', value: 'priceHq40'},{label: '45HQ:', value: 'priceHq45'},{label: '20NOR:', value: 'priceNor20'},{label: '40NOR:', value: 'priceNor40'}],
      feeItemList:[],
      currencyList:[],
      endDate: '',
      append: {
        attentionAppend: false,
        surchargeDescAppend: false,
        guidanceDescAppend: false,
        weightDescAppend: false,
        internalDescAppend: false,
        freeTimeDescAppend: false,
        issueWayDescAppend: false,
        podChargeDescAppend: false
      },
      sortableKey: [],
      transitPortEmpty: false,
      symbolList: [
        {
          label: '=',
          value: '='
        },
        {
          label: '+',
          value: '+'
        },
        {
          label: '-',
          value: '-'
        },
      ],
      deleteSurchargeCodeList: [],
      telexObj: {
        telexFee: '',
        telexFeeCurrency: '',
        issueWayDesc: ''
      },
      // issueWay: ''
    }
  },
  props: {
    param: {
      type: Object
    }
  },
  created() {
    let keysOptions = window.localStorage.getItem('keysOptions')
    if (keysOptions) {
      window.localStorage.removeItem('keysOptions')
    }
    let sortableKey = window.localStorage.getItem('sortableKey')
    if (sortableKey) {
      let keys = JSON.parse(sortableKey).filter(item => this.keysOptions[item])
      let obj =  {}
      keys.forEach(item => {
        obj[item] = this.keysOptions[item]
      })
      this.keysOptions = Object.assign(obj, this.keysOptions)
    }
    console.log('this.keysOptions', this.keysOptions)
    this.sortableKey = Object.keys(this.keysOptions)
  },
  mounted() {
    this.getCurrencyList()
    this.$nextTick(()=>{
      let ele = document.getElementById('checkbox')
      Sortable.create(ele, {
        group: 'checkbox',
        animation: 100,
        onEnd: event => {
          let {oldIndex, newIndex} = event
          this.changeSortableKey(oldIndex, newIndex)
        }
      })
    })
  },
  computed: {
    checkedKeysOptions: function() {
      const result = {}
      Object.keys(this.keysOptions).filter((key) => this.checkedKeys.includes(key)).forEach((key) => {
        result[key] = this.keysOptions[key]
      })
      return result
    },
    currencyOptions() {
      return this.currencyList.filter(item => ['CNY', 'HKD'].includes(item.code))
    },
    ...mapGetters([
      'dictMap',
    ])
  },
  watch: {
  },
  components: {
    BaseDialog,
    SearchFilter,
    CustViewTip
  },
  methods: {
    handleChangeIssueWay(val) {
      console.log('val', val)
      if (val.includes('free_telex_release')) {
        this.telexObj.telexFee = '0'
      }
    },
    telexFeeOnInput(val) {
      if (isNaN(val)) {
        // 如果当前输入框内容不是数字，递归删除最后一位，直至成为数字
        let fnSlice = (str) => isNaN(str) && (str !== '-') ? fnSlice(str.slice(0, -1)) : str
        val = fnSlice(val)
        this.$set(this.telexObj, 'telexFee', val)
      } 
      let dotPos = val.lastIndexOf('.')
      if (dotPos > -1 && val.length - dotPos > 3) {
        val = (+val).toFixed(2)
        this.$set(this.telexObj, 'telexFee', val)
      }
    },
    // el-select下拉数据
		selectOptions(item) {
			// 前端设置的数据
			if (item.data && item.data.length) {
				return item.data
			}
			// 搜索条件的key和字典对应的key不相同
			if (item.propInDict) {
				return this.dictMap[item.propInDict]
			}
			// 默认按搜索条件的key做为字典的key
			return this.dictMap[item.key] || []
		},
    changeSymbol(val,row) {
      row.priceGp20Symbol = row.priceGp40Symbol = row.priceHq40Symbol = row.priceHq45Symbol = row.priceNor20Symbol = row.priceNor40Symbol = val
    },
    changeEmpty (val) {
      let source = this.checkedKeysOptions.transitPortCodes
      Object.assign(source, {
        disabled: val,
        value: val ? [] : source.value
      })
    },
    // 排序
    changeSortableKey (index1, index2) {
      let temp = this.sortableKey[index1]
      this.sortableKey.splice(index1, 1)
      this.sortableKey.splice(index2, 0, temp)
    },
    // 排序缓存本地
    localStorageSave () {
      if (!this.sortableKey.length) {
        this.sortableKey = Object.keys(this.keysOptions)
      }
      window.localStorage.setItem('sortableKey', JSON.stringify(this.sortableKey))
    },
    // 获取订舱代理
    getSupplierList(type, queryString, item) {
      this.$store.dispatch('dict/querySupplierList', {category: 'category', value: type, queryString: queryString}).then(data => {
        if (data.list && data.list.length) {
          item.data = data.list.map(ele => {
            return Object.assign(ele, {
              label: this.$language=='en' ? ele.ename : ele.name,
              value: ele.supplierId
            })
          })
        }
      })
    },

    // 中转港下拉数据
    transitPortSearch(queryString='', portAttribute, state, item) {
      this.$store.dispatch('dict/basePortList', {queryString, portAttribute, state}).then(data => {
        let transitPortList = data.map(item => {
          return Object.assign(item, {
            label: item.value,
            value: item.key
          })
        })
        item.data = transitPortList
      })
    },
    // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString, cb) {
      this.$store.dispatch('dict/baseSystemLineList', {name: queryString, state: 'valid'}).then(data => {
        cb(data)
      })
    },

    // 船公司下拉列表自动补充的数据
    shipQuerySearch(queryString, item) {
      this.$store.dispatch('dict/baseShippingCarrierList', {name:queryString, state: 'valid'}).then(data => {
        item.data = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
    },

    // 运输条款下拉列表自动补充的数据
    shipTermsQuerySearch(queryString, cb) {
      this.$store.dispatch('dict/baseShipTermsList').then(data => {
        cb(data)
      })
    },

    // 多选字段
    handleCheckedKeys(value) {
      console.log(this.checkedKeys)
      if (this.checkedKeys.includes('surchargeList')) {
        this.getUserSurchargeList()
      }
    },

    // 获取模板下拉
    getUserSurchargeList(val) {
      userSurchargeList().then(response => {
        let tempData = this.getTreeData(response.data)
        this.templateIdConfig.data = tempData
      })
    },
    // 拿价人
    pricerQuerySearch(queryString, cb) {
      let params={};
      Object.assign(params, {
        name: queryString,
        state:'valid'
      })
      this.$store.dispatch('dict/employeeSelectlist', params).then(data => {
         cb(data)
      })
    },
    // 币别下拉列表自动补充的数据
    getCurrencyList(queryString) {
      baseCurrencyList(queryString, 'valid', 'charge').then(response => {
        this.currencyList = response.data
      })
    },

    // 费用代码下拉列表自动补充的数据
    feeItemQuerySearch(queryString) {
      baseFeeItemList(queryString).then(response => {
        this.feeItemList = response.data
      })
    },

    feeItemChange(value,row,type){
      var item=this.selectChagedFeeItem(value,type);
      if(item){
        row.chargeCode=item.feeCode;
        row.chargeEname=item.feeEnName;
        row.chargeName=item.feeName;
        row.currency=item.currency;
        row.rateUnit=item.feeUnit.toLowerCase();
      }
    },
    selectChagedFeeItem(val,type) {
      var obj = {};
      obj = this.feeItemList.find(function(item) {
        if(type==='01'){
          return item.feeEnName===val;
        }else{
         return item.feeName === val;
        }
      });
      return obj;
    },

    // 转化children的空数组为undefined
    getTreeData(data) {
      for (let i = 0; i < data.length; i++) {
        if (!data[i].children.length) {
          // children若为空数组，则将children设为undefined
          data[i].children = undefined
        } else {
          this.getTreeData(data[i].children)
        }
      }
      return data
    },

    // 获取模板列表
    getList(val) {
      surchargeInfo({templateId: val}).then(response => {
        this.dialogConfig.surchargeList = response.data.surchargeList
      })
    },

    // 增加一行
    handleAddLine() {
      // 添加一行为空的数据
      const rowData = {
        chargeCode:'', 
        chargeEname: '',
        chargeName: '',
        chargeType:"",
        chargeMode:"成本价",
        payMode:"",
        currency:"",
        rateUnit:"",  
        priceGp20:"",
        priceGp40:"",
        priceHq40:"",
        priceHq45:"",
        priceNor20:"",
        priceNor40:"",
        price:"",
        remark: ''
      }
      this.dialogConfig.surchargeList.push(rowData)
    },

    // 删除一行
    handleDelete(scope) {
      this.dialogConfig.surchargeList.splice(scope.$index, 1)
    },

    // 普通箱型的可输入和不可输入的判断
    checkContainerTypeInput() {
      // allIn状态只能输入合计价格，基价和中转价默认显示
      if (this.dialogConfig.allIn === 'allin') {
        this.dialogConfig.oceanFreightQuery.forEach((item, index) => {
          Vue.set(this.dialogConfig.oceanFreightQuery, index, Object.assign(item, this.defaultPrice, {
            disabled: false
          }))
          if (index <= 1) {
            Vue.set(this.dialogConfig.oceanFreightQuery, index, Object.assign(item, this.defaultPrice, {
              disabled: true
            }))
          }
        })
      } else {  // 关闭allIn状态只能输入基价和中转价，合计价格默认显示
        this.dialogConfig.oceanFreightQuery.forEach((item, index) => {
          Vue.set(this.dialogConfig.oceanFreightQuery, index, Object.assign(item, this.defaultPrice, {
            disabled: true
          }))
          if (index <= 1) {
            Vue.set(this.dialogConfig.oceanFreightQuery, index, Object.assign(item, this.defaultPrice, {
              disabled: false
            }))
          }
        })
      }
      console.log(this.dialogConfig.oceanFreightQuery)
    },

    // 切换allIn
    changeAllInState(val) {
      this.dialogConfig.allIn = val
      this.checkContainerTypeInput()
    },

    // 币别选择
    hadnleChangeCurrency() {
      
      const currency1 = this.dialogConfig.oceanFreightQuery[0].currency
      const currency2 = this.dialogConfig.oceanFreightQuery[1].currency

      // 关闭allIn,基价和中转价的币别相同时，合计也设置为相同币别，并实时计算价格;不相同则合计设置为空
      if (this.dialogConfig.allIn !== 'allin') {
        if (currency1 === currency2) {
          this.dialogConfig.oceanFreightQuery[2].currency = currency1
          this.handleComputedPrice()
        } else {
          Object.assign(this.dialogConfig.oceanFreightQuery[2], this.defaultPrice, {
            currency: ''
          })
        }
      }

    },

    // 填写价格
    hadnleChangePrice(val) {
      const currency1 = this.dialogConfig.oceanFreightQuery[0].currency
      const currency2 = this.dialogConfig.oceanFreightQuery[1].currency

      // 数字校验
      // const reg = /^\d+(\.\d+)?$/
      // if (!reg.test(val)) {
      //   return this.$message.warning('请输入数值')
      // }

      // 关闭allIn,基价和中转价的币别相同时，实时计算价格;不相同则合计设置为空
      if (this.dialogConfig.allIn !== 'allin') {
        if (currency1 === currency2) {
          this.handleComputedPrice()
        } else {
          Object.assign(this.dialogConfig.oceanFreightQuery[2], this.defaultPrice, {
            currency: ''
          })
        }
      }

    },

    // 实时计算合计价格
    handleComputedPrice() {
      let tempPriceGp20 = Number(this.dialogConfig.oceanFreightQuery[0].priceGp20) + Number(this.dialogConfig.oceanFreightQuery[1].priceGp20)
      let tempPriceGp40 = Number(this.dialogConfig.oceanFreightQuery[0].priceGp40) + Number(this.dialogConfig.oceanFreightQuery[1].priceGp40)
      let tempPriceHq40 = Number(this.dialogConfig.oceanFreightQuery[0].priceHq40) + Number(this.dialogConfig.oceanFreightQuery[1].priceHq40)
      let tempPriceHq45 = Number(this.dialogConfig.oceanFreightQuery[0].priceHq45) + Number(this.dialogConfig.oceanFreightQuery[1].priceHq45)
      let tempPriceNor20 = Number(this.dialogConfig.oceanFreightQuery[0].priceNor20) + Number(this.dialogConfig.oceanFreightQuery[1].priceNor20)
      let tempPriceNor40 = Number(this.dialogConfig.oceanFreightQuery[0].priceNor40) + Number(this.dialogConfig.oceanFreightQuery[1].priceNor40)    
      this.dialogConfig.oceanFreightQuery[2].priceGp20 = parseFloat(tempPriceGp20.toFixed(10)) ? parseFloat(tempPriceGp20.toFixed(10)) : ''
      this.dialogConfig.oceanFreightQuery[2].priceGp40 = parseFloat(tempPriceGp40.toFixed(10)) ? parseFloat(tempPriceGp40.toFixed(10)) : ''
      this.dialogConfig.oceanFreightQuery[2].priceHq40 = parseFloat(tempPriceHq40.toFixed(10)) ? parseFloat(tempPriceHq40.toFixed(10)) : ''
      this.dialogConfig.oceanFreightQuery[2].priceHq45 = parseFloat(tempPriceHq45.toFixed(10)) ? parseFloat(tempPriceHq45.toFixed(10)) : ''
      this.dialogConfig.oceanFreightQuery[2].priceNor20 = parseFloat(tempPriceNor20.toFixed(10)) ? parseFloat(tempPriceNor20.toFixed(10)) : ''
      this.dialogConfig.oceanFreightQuery[2].priceNor40 = parseFloat(tempPriceNor40.toFixed(10)) ? parseFloat(tempPriceNor40.toFixed(10)) : ''
    },

    // 获取批量修改的数据
    getValues() {
      let data = {};
      this.checkedKeys.forEach((key) => {
        data[key] = this.keysOptions[key].value ? this.keysOptions[key].value : undefined
        if (this.keysOptions[key].type === 'autocomplete') {
          Object.assign(data, this.editQuery)
        }
        if (key === 'surchargeList') {
          data[key] = this.dialogConfig.surchargeList
          data.deleteSurchargeCodeList = this.deleteSurchargeCodeList.map(item => item.feeCode)
        }
        if (key === 'specialOceanFreightList') {
          data[key] = this.dialogConfig.oceanFreightQuery
          data.allIn=this.dialogConfig.allIn
        }
        if (key === 'beginDate') {
          // let time = this.keysOptions['beginDate'].value
          // data.beginDate = time ? time[0] : ''
          // data.endDate = time ? time[1] : ''
          data.endDate = this.endDate
        }
        if (key === 'transitPortCodes') {
          data[key] = this.keysOptions['transitPortCodes'].value.toString()
          data.transitPortEmpty = this.transitPortEmpty
        }
        if (key === 'feederPolCode') {
          data[key] = this.keysOptions['feederPolCode'].value.toString()
        }
        if (key === 'bkgAgentId') {
          let op = this.keysOptions[key]
          let name = op.data.find(item => item.value === op.value)?.label || ''
          data['bkgAgent'] = name
        }
        if (key === 'issueWay') {
          data[key] = this.keysOptions['issueWay'].value.toString()
          data['telexFee'] = this.telexObj.telexFee
          data['telexFeeCurrency'] = this.telexObj.telexFeeCurrency
          data['issueWayDesc'] = this.telexObj.issueWayDesc
        }
      })
      // for (const [key, value] of Object.entries(this.append)) {
      //   value && (data[key] = value)
      // }
      Object.assign(data, this.append)
      return filterEmpty(data)
    },

    close(action, data) {
      this.$emit('close', action, data)
    },

    validate() {
        //校验附加费
      for(let item of this.dialogConfig.surchargeList) {
          if(!item.chargeCode){
                  this.$message.warning('费用名称不能为空')
                   return false
          }
          if(!item.payMode){
              this.$message.warning('付款方式不能为空')
                return false
          }
         if(!item.rateUnit){
              this.$message.warning('计费单位不能为空')
                return false
         }
         if(item.rateUnit==='container_type'){
            if(!(item.priceGp20.toString().trim()||item.priceGp40.toString().trim()||item.priceHq40.toString().trim()||item.priceHq45.toString().trim()
              ||item.priceNor20.toString().trim()||item.priceNor40.toString().trim()
             )
            ){
              this.$message.warning('费用金额不能为空')
                return false
            }
         }
         if(item.rateUnit!='container_type'){
            if(!item.price.toString().trim()){
              this.$message.warning('费用金额不能为空')
                return false
            }
         }
         if(!item.currency){
              this.$message.warning('币种不能为空')
              return false
          }
      }
      return true
    },

    dialogCallback(action, done) {
      this.localStorageSave()
      if (action === 'Save') {
        if (this.validate() !== true) return
        this.handleMultiEditSubmit(action, done)
      } else if (action === 'Publish') {
        if (this.validate() !== true) return
        this.handleMultiEditSubmit(action, done)
      } else {
        this.close()
      }
    },

    // 确定提交
    handleMultiEditSubmit(action, done) {
      console.log('批量修改提交', )
      let data = this.getValues()
      // 未做修改不能保存和发布
      if (!Object.keys(data).length) {
        return this.$message({
          type: 'error',
          message: '必须修改才能进行保存或者发布',
          duration: 1000,
          onClose: () => {}
        })
      }
      // 出单方式为不免电放的，电放费，电放费币别需必填
      if (data.issueWay && data.issueWay.includes('no_free_telex_release')) {
        if (!data.telexFee) {
          return this.$message.error('电放费须必填')
        }
        if (!data.telexFeeCurrency) {
          return this.$message.error('电放费币别须必填')
        }
      }
      if (action === 'Save') {
        data.operateType = 'save'
      }
      if (action === 'Publish') {
        data.operateType = 'published'
      }
      // done();
      this.close('Confirm', data)
    }
  }
};
</script>

<style lang="scss">
.del-charge{
  margin-top: 15px;
  display: flex;
  min-height: 20px;
  height: auto;
  .lab{
    height: 20px;
    line-height: 20px;
    color: rgb(209, 78, 78);
  }
  .large-select{
    width: 400px;
    align-items: center;
    .el-select{
      width: 100%;
    }
  }
  .cnt-box{
    flex: 1;
    margin-left: 20px;
    border-radius: 4px;
    border:1px solid #ddd;
    padding: 5px;
    background-color: #fbe4df;
    display: flex;
    flex-wrap: wrap;
    p{
      width: 50%;
      margin-bottom: 5px;
    }
  }
}
.mb10{
  margin-bottom: 10px;
}
.checkbox-group-container{
  border-bottom: 1px solid #ddd;
  .el-checkbox {
    width: 115px;
  }
}
.flex{
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
  justify-content: flex-start;
  .date-class{
    width:130px !important;
  }
  .input-container{
    width:360px;
    margin-right: 0;
    display: flex;
    .flex-box{
      flex: 1;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      .el-input__prefix{
        line-height: 20px;
        i{
          color: #999;
        }
      }
      .add-check{
        width: 100%;
        margin-left: 95px;
        &.ml0 {
          margin-left: 0;
        }
      }
      .add-empty{
        margin-left: 5px;
      }
      .issue-way-row {
        .issue-way-item {
          display: flex;
          width: 360px;
          .filter-txt {
            .mr5 {
              margin-right: 5px;
            }
            +div{
              flex: auto;
            }
          }
        }
      }
   }
    .filter-txt{
      margin-right: 5px;
      width: 90px;
      text-align: right;
      line-height: 20px;
      +div{
        flex: 1;
      }
    }
    &.table-container{
      width: 100%;
      border-top: 1px solid #ddd;
      padding: 8px 0;
      .item {
        width: 100%;
      }
    }
    &.issueWay-container {
      width: 100%;
      border-top: 0;
      padding: 8px 0;
    }
  }
}
.surcharge-list-row {
  display: flex;
  // justify-content: space-between;
  line-height: 20px;
  .t{
    font-weight: bold;
    line-height: 20px;
    margin-top: 8px;
  }
}
.freight-list-row {
  display: flex;
  justify-content: space-between;
  line-height: 20px;
  .t{
    font-weight: bold;
  }
  .allin-state{
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    padding: 0 0 10px 0;
  }
}
.mt20 {
  margin-top: 20px;
}
.sort-tips{
  color: #ccc;
  padding: 0 0 5px 0;
}
.boxType-table .cell{
  display: flex;
  .symbol-select,.currency-select{
      flex: 1
    }
    .el-input{
      flex: 2
    }
}
</style>
