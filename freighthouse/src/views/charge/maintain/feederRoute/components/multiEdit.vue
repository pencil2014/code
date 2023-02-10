<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <div class="checkbox-group-container">
      <el-checkbox-group size="mini" v-model="checkedKeys" @change="handleCheckedKeys">
        <el-checkbox 
          size="mini"
          class="mb10"
          v-for="(item, index) in keysOptions" 
          :key="index" 
          :label="item.key" 
          :disabled="item.disabled"
        >{{item.label}}</el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="flex">
      <div class="input-container multi-select-tag" :class="item.type === 'table' ? 'table-container' : ''" v-for="(item, index) in checkedKeysOptions" :key="index">
        <div v-if="item.type !== 'table'">
          <span class="filter-txt">{{item.label}}</span>
          <el-input size="mini" v-if="['input', 'textarea'].includes(item.type)"
            v-model="item.value"
            :type="item.type"
            :style="item.style || defaultStyle"
            :maxlength="item.maxlength"
            :minlength="item.minlength"
            :placeholder="item.placeholder || '请输入' + item.label"
            :clearable="item.clearable || true"
            :disabled="item.disabled"
            :rows="item.rows"
            :autosize="item.autosize"
            :name="item.name"
            :readonly="item.readonly"
            :max="item.max"
            :min="item.min"/>

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
            :filter-method="(val) => {item.filterMehod && item.filterMehod(val)}"
            :popper-class="item['popper-class']"
            :placeholder="item.placeholder  || '请选择' + item.label"
            @visible-change="(val) => {item.visibleChange && item.visibleChange(val)}"
            @change="(value) => {item.change && item.change(value)}">
              <el-option v-for="(o, key) in dictMap[item.key] || item.data"
                :key="key"
                :label="item.nonDictionary ? o.label : $t(`dict.${item.key}.${o.value}`)"
                :value="o.value">
              </el-option>
          </el-select>
          <!-- 日期和时间{year/month/date/dates/ week/datetime/datetimerange/daterange} -->
          <el-date-picker size="mini" v-if="item.type === 'date'"
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
        </div>
        <div class="item" v-else>
          <div v-if="item.key === 'surchargeList'">
            <SearchFilter :item="templateIdConfig" />
            <el-table :data="dialogConfig.surchargeList" class="mt20">
              <el-table-column align="center" label="费用英文" width="150" >
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
                  <el-select size="mini" v-model="scope.row.rateUnit" placeholder="请选择" >
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
                    size="mini" v-model="scope.row.currency"  remote reserve-keyword
                    placeholder="币别"
                    filterable
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
                  <el-input  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" v-if="scope.row.rateUnit == 'container_type'"  size="mini" v-model="scope.row[item.value] ">
                    <template v-if="scope.row.rateUnit == 'container_type'" slot="prepend">{{item.label}}</template>
                  </el-input>
                  <el-input  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" v-if="item.label == '20GP:' && scope.row.rateUnit != 'container_type'"  size="mini" v-model="scope.row.price">
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
          <div v-if="item.key === 'specialOceanFreightList'">
            <el-table class="boxType-table" highlight-current-row ref="oceanFreightTable" style="width: 100%" :data="dialogConfig.specialOceanFreightList">
              <!-- <el-table-column prop="structure" label="箱型" align="center">
                <template >金额</template>
              </el-table-column> -->
              <el-table-column prop="currency" label="币别" align="center">
                <template slot-scope="scope">
                  <el-select size="mini" filterable v-model="scope.row.currency" placeholder="请选择" :disabled="scope.row.disabled" class="currency-select">
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
              <el-table-column prop="priceGp20" label="20GP" align="center">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.priceGp20Symbol" :disabled="scope.row.disabled" class="symbol-select">
                      <el-option v-for="item in symbolList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  <el-input placeholder="请输入金额"  size="mini" v-model="scope.row.priceGp20" :disabled="scope.row.disabled" clearable></el-input>
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
                  <el-input placeholder="请输入金额" size="mini" v-model="scope.row.priceGp40" :disabled="scope.row.disabled" clearable></el-input>
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
                  <el-input placeholder="请输入金额" size="mini" v-model="scope.row.priceHq40" :disabled="scope.row.disabled" clearable></el-input>
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
                  <el-input placeholder="请输入金额" size="mini" v-model="scope.row.priceHq45" :disabled="scope.row.disabled" clearable></el-input>
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
                  <el-input placeholder="请输入金额" size="mini" v-model="scope.row.priceNor20" :disabled="scope.row.disabled" clearable></el-input>
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
                  <el-input placeholder="请输入金额" size="mini" v-model="scope.row.priceNor40" :disabled="scope.row.disabled" clearable></el-input>
                </template>
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

import {userSurchargeList, userSurchargeInfo, surchargeInfo} from '@/api/charge'
import {basePortList, baseCurrencyList,baseFeeItemList } from '@/api/base'

export default {
  data() {
    return {
      state: '',
      dialogConfig: {
        title: '批量修改',
        show: true,
        width: "1200px",
        surchargeList: [],
        // 普通箱型
        specialOceanFreightList: [
          {chargeCode:'', chargeType: '', structure: 'basic_price', chargeMode: '', payMode: '', currency: 'USD', rateUnit: 'container_type', priceGp20: '', priceGp40: '',priceHq40: '', priceHq45: '',priceNor20:'',priceNor40:'', price: '', symbol:'=', priceGp20Symbol: '=', priceGp40Symbol: '=',priceHq40Symbol: '=', priceHq45Symbol: '=',priceNor20Symbol:'=',priceNor40Symbol:'='}
        ],
        btns: [
          {label: '取消', action: 'Cancel'},
          {label: '保存', action: 'Save', type: 'primary'},
          {label: '发布', action: 'Publish', type: 'primary'}
        ]
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
        polCode: {label: '大船起运港', key: 'polCode', type: 'autocomplete', value: '', querySearch: (queryString, cb) => {
          this.polQuerySearch(queryString, 'port_of_basic', this.state, cb)
        }, change: (val) => {
          Object.assign(this.editQuery, {
            polCode: val
          })
        }, select: (item) => {
          Object.assign(this.editQuery, {
            polCode: item.key
          })
        }},
        // podCode: {label: '目的地', key: 'podCode', type: 'autocomplete', value: '', querySearch: (queryString, cb) => {
        //   this.polQuerySearch(queryString, 'port_of_destination', this.state, cb)
        // }, change: (val) => {
        //   Object.assign(this.editQuery, {
        //     podCode: val
        //   })
        // }, select: (item) => {
        //   Object.assign(this.editQuery, {
        //     podCode: item.key
        //   })
        // }},
        // receiptArea: {label: '收货区域', key: 'receiptArea', type: 'input', value:''},
        sysLineCode: {
          key: 'sysLineCode',
          label: '系统航线',
          type: 'autocomplete',
          querySearch: (queryString, cb) => {
            this.sysLineQuerySearch(queryString, cb)
          }, change: (val) => {
            Object.assign(this.editQuery, {
              sysLineCode: val
            })
          },
          select: (item) => {
            Object.assign(this.editQuery, {
              sysLineCode: item.key
            })
          }
        },
        // feederVoyage: {label: '航程', key: 'feederVoyage', type: 'input', value:''},
        feederSchedule: {label: '驳船预计开船时间', key: 'feederSchedule',width:'150px',type: 'input', value:''},
        beginDate: {label: '生效日期', key: 'beginDate', type: 'date', category: 'daterange', value:'', format: 'yyyy-MM-dd'},
        remark: {label: '备注', key: 'remark', type: 'textarea', value:''},
        specialOceanFreightList: {label: '海运费', key: 'specialOceanFreightList', type: 'table', value:''},
        surchargeList: {label: '附加费', key: 'surchargeList', type: 'table', value:''},
        maintainerId: {
          key: 'maintainerId',
          label: '维护人',
          type: 'autocomplete',
          querySearch: (queryString, cb) => {
            this.maintainerQuerySearch(queryString, cb)
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
      deleteSurchargeCodeList: []
    }
  },
  props: {
    param: {
      type: Object
    }
  },
  created() {
  },
  mounted() {
    this.getCurrencyList()
  },
  computed: {
    checkedKeysOptions: function() {
      const result = {}
      Object.keys(this.keysOptions).filter((key) => this.checkedKeys.includes(key)).forEach((key) => {
        result[key] = this.keysOptions[key]
      })
      return result
    },
    ...mapGetters([
      'dictMap',
    ])
  },
  watch: {
  },
  components: {
    BaseDialog,
    SearchFilter
  },
  methods: {
    changeSymbol(val,row) {
      row.priceGp20Symbol = row.priceGp40Symbol = row.priceHq40Symbol = row.priceHq45Symbol = row.priceNor20Symbol = row.priceNor40Symbol = val
    },
    // 起运港下拉列表自动补充的数据
    polQuerySearch(queryString, portAttribute, state, cb) {
      this.$store.dispatch('dict/basePortList', {queryString, portAttribute, state}).then(data => {
        cb(data)
      })
    },

    // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString, cb) {
      this.$store.dispatch('dict/baseSystemLineList', {name: queryString, state: 'valid'}).then(data => {
        cb(data)
      })
    },
       // 拿价人
    maintainerQuerySearch(queryString, cb) {
      let params={};
      Object.assign(params, {
        name: queryString,
        state:'valid'
      })
      this.$store.dispatch('dict/employeeSelectlist', params).then(data => {
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
          data[key] = this.dialogConfig.specialOceanFreightList
        }
        if (key === 'beginDate') {
          let time = this.keysOptions['beginDate'].value
          data.beginDate = time ? time[0] : ''
          data.endDate = time ? time[1] : ''
        }
        if (key === 'transitPortCodes') {
          data[key] = this.keysOptions['transitPortCodes'].value.toString()
        }
      })
      
      return filterEmpty(data)
    },

    close(action, data) {
      this.$emit('close', action, data)
    },

    validate() {
      //校验附加费
     for(let item of this.dialogConfig.surchargeList) {
          if(!item.chargeCode){
                  this.$message.warning('费用代码不能为空')
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
            ||item.priceNor20.toString().trim()||item.priceNor40.toString().trim())){
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
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-box-pack: start;
  -ms-flex-pack: start;
  justify-content: flex-start;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  .input-container{
    width: 320px;
    .filter-txt{
      margin-right: 5px;
    }
    &.table-container{
      width: 100%;
      border-top: 1px solid #ddd;
      .item {
        width: 100%;
      }
    }
  }
}
.allin-state{
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  padding: 0 0 10px 0;
}
.mt20 {
  margin-top: 20px;
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
