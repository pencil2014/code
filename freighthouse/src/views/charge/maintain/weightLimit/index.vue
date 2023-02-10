<template>
<div class="weight-limit">
  <div class="search-container">
    <Search
      :searchConditionHide="searchConditionHide"
      :config.sync="searchConfig"
      :callback="searchCallBack"
      :tableQuery.sync="tableQuery" />
  </div>
  <div class="limit-container m-t-8">
    <div class="filter-containe">
      <el-button size="mini"  @click="handleAdd" type="primary">
        <i class="el-icon-plus"></i> 新建
      </el-button>
       <!-- <el-button size="mini"  @click="exportExcel" >
          导出
      </el-button> -->
      <el-button type="danger" size="mini" @click="changePricer">修改拿价人</el-button>
    </div>
    <el-table v-loading="loading" :data="tableData"  style="margin:10px 0px" :max-height="tableHeight" ref="limitTable" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="55">
    </el-table-column>
      <el-table-column  align="center"  prop="polEname" label="大船起运港" ></el-table-column>
      <!-- <el-table-column  align="center"  prop="transitPortEname" label="中转港" ></el-table-column> -->
      <el-table-column align="center" prop="shipCarrierCode" label="船公司" ></el-table-column>
      <el-table-column align="center" prop="sysLineCname" label="航线" ></el-table-column>
      <el-table-column align="center"  prop="podEname" label="目的地" > </el-table-column>
      <el-table-column align="center"  prop="pricerName" label="拿价人" > </el-table-column>
      <el-table-column align="center"  prop="beginDate" label="有效期" :formatter="formatter"></el-table-column>
      <el-table-column align="center" prop="weightLimitType" label="限重" >
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top" popper-class="black-popover">
            <div class="payment-advance"  >
              <div class="payment-advance-list"  v-for="(item, index) in scope.row.weightLimitChargeItemList" :key="'item' + index">
                <span>{{item.containerType}} {{item.leftValue}}{{item.lessThanFlag1}}{{ $t(`dict.weightLimitType.${item.weightLimitType}`)}}
                  {{item.lessThanFlag2}}{{item.rightValue}} ({{ $t(`dict.limitType.${item.limitType}`)}}) {{item.price}}/{{ $t(`dict.extraContainerRateUnit.${item.rateUnit}`)}} {{item.currency}}
                </span>
              </div>
            </div>
            <div slot="reference">
              <span size="medium">限重说明</span>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column align="center"  prop="remark" label="备注" >
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top" popper-class="black-popover">
            <div class="payment-advance"  >  {{scope.row.remark}}</div>
            <div slot="reference">
              <span size="medium" style="text-overflow: -o-ellipsis-lastline;overflow: hidden;text-overflow: ellipsis;display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;">{{scope.row.remark}}</span>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="240">
        <template slot-scope="scope">
          <!-- <el-button @click="handleDetails(scope.row)" type="text" size="mini" >详情</el-button> -->
          <el-button @click="handleEdit(scope.row, '')" type="text" size="mini" class="orange">编辑</el-button>
          <el-button @click="handleEdit(scope.row, 'copy')" type="text" size="mini">复制</el-button>
          <el-button @click="handleDelete(scope.row)" size="mini" type="text" class="red" >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
     <!-- 分页 -->
    <div class="table-footer" ref="tableFooter">
      <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
    </div>
  </div>
 
  <!-- 详情弹框 -->
  <el-dialog :title="title" :visible.sync="detailsOpen" :lock-scroll="true" width="778px" >
    <el-table :data="weightLimitChargeItemList" >
      <el-table-column align="center"  prop="containerType" label="箱型" >
        <template slot-scope="scope">
          <span v-if="!scope.row.containerTypeHide">{{scope.row.containerType}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="限重（单位TON）" >
        <template slot-scope="scope">
          <span>{{scope.row.leftValue}}</span>
          <span>{{scope.row.lessThanFlag1}}</span>{{ $t(`dict.weightLimitType.${scope.row.weightLimitType}`)}}
          <span>{{scope.row.lessThanFlag2}}</span>
          <span>{{scope.row.rightValue}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="重柜费" >
        <template slot-scope="scope">
          <span>{{scope.row.price}}</span>/ {{ $t(`dict.extraContainerRateUnit.${scope.row.rateUnit}`)}}
        </template>
      </el-table-column>
      <el-table-column align="center" label="币别">
        <template slot-scope="scope">
          <span>{{scope.row.currency}}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-table style="margin-top:20px" :data="grossWeightList" >
      <el-table-column align="center"  prop="containerType" label="箱型" >
        <template slot-scope="scope">
          <span v-if="!scope.row.containerTypeHide">{{scope.row.containerType}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="限重（单位TON）" >
        <template slot-scope="scope">
          <span>{{scope.row.leftValue}}</span>
          <span>{{scope.row.lessThanFlag1}}</span>{{ $t(`dict.weightLimitType.${scope.row.weightLimitType}`)}}
          <span>{{scope.row.lessThanFlag2}}</span>
          <span>{{scope.row.rightValue}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="选柜费" >
        <template slot-scope="scope">
          <span>{{scope.row.price}}</span>/ {{ $t(`dict.extraContainerRateUnit.${scope.row.rateUnit}`)}}
        </template>
      </el-table-column>
      <el-table-column align="center" label="币别">
        <template slot-scope="scope">
          <span>{{scope.row.currency}}</span>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
  <!-- 编辑弹框 -->
  <el-dialog :title="title" :visible.sync="open" :lock-scroll="true"  width="992px">
    <el-form ref="createdData" :model="createdData" class="weight-pop-form">
      <div class="input-container-dia" >
        <el-form-item label="大船起运港:" label-width="90px" prop="polCode" >
          <el-select v-model="polCode" multiple size="mini" :multiple-limit='5' style="width:538px" placeholder="请选择大船起运港港口" 
            reserve-keyword
            filterable
            remote
            clearable
            @visible-change="visibleChangePol"
            @change="(value) => {polChange && polChange(value)}"
            :remote-method="filterMehodPol"
            >
            <el-option v-for="item in polCodeList" :key="item.key" :label="item.value" :value="item.key"></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="中转港:" label-width="90px" prop="trsCode">
          <el-select v-model="trsCode" multiple size="mini" :multiple-limit='5' style="width:540px" placeholder="请选择中转港口" 
            reserve-keyword
            filterable
            remote
            clearable
            @visible-change="visibleChangeTransit"
            @change="(value) => {trsChange && trsChange(value)}"
            :remote-method="filterMehodTransit"
            >
            <el-option v-for="item in transitCodeList" :key="item.key" :label="item.value" :value="item.key"></el-option>
          </el-select>
        </el-form-item> -->
         <el-form-item label="拿价人:" label-width="90px" prop="pricer"  :rules="[{required: true, message: ' ', trigger: 'change'}]">
          <el-select size="mini"
            v-model="createdData.pricer"
            filterable
            remote
            clearable 
            style="width: 222px"
            placeholder="请输入拿价人"
            :remote-method="pricerFilterMethod"
            @visible-change="pricerVisibleChange"
            @change="handleChangePricer">
            <el-option
              v-for="item in pricerOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
         <el-form-item class="oneEighth" label="目的地:" label-width="90px" prop="podCode" :show-message="true">
          <el-select size="mini"
            v-model="createdData.podCode"
            style="width:225px"
            filterable
            remote
            clearable 
            placeholder="请输入"
            :remote-method="podPortFilterMethod"
            @visible-change="podPortVisibleChange"
            @change="handleChangePodPort">
           <el-option v-for="item in podCodeList" :key="item.key" :label="item.value" :value="item.key"></el-option>
          </el-select>
      </el-form-item>
        <el-form-item label="船公司:" label-width="90px" prop="shipCarrierCode" :rules="[{required: true, message: '船司不能为空', trigger: 'change'}]" :show-message="false">
            <el-select
            style="width:225px" 
            size="mini"  v-model="createdData.shipCarrierCode"  filterable remote reserve-keyword
            placeholder="请选择船公司"
            :remote-method="shipCarrierSearch"
            @focus="shipCarrierSearch('')"
            >
              <el-option
                v-for="item in shipCarrierCodeList"
                :key="item.carrierCode"
                :label="item.carrierCode"
                :value="item.carrierCode">
              </el-option>
           </el-select>
        </el-form-item>
        <el-form-item label="航线:" label-width="90px" prop="sysLineCode" :rules="[{required: true, message: '航线不能为空', trigger: 'change'}]" :show-message="false">
          <el-select style="width:222px" 
            size="mini"  v-model="createdData.sysLineCode" filterable multiple
            placeholder="请选择航线"
            :disabled="sysLineDisabled"
          >
            <el-option
              v-for="item in sysLineCodeList"
              :key="item.key"
              :label="item.value"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="有效期:"  label-width="90px"  prop="dateTime">
          <el-date-picker v-model="createdData.dateTime"  value-format="yyyy-MM-dd" type="daterange" placeholder="请选择"  style="width:225px;" size="mini"></el-date-picker>
        </el-form-item>
        <el-form-item label="备注:" label-width="90px" prop="remark">
          <el-input style="width:852px;" size="mini"
            :maxlength="500"
            type="textarea"
            v-model="createdData.remark" placeholder="请输入"></el-input>
        </el-form-item>
        <!-- <el-form-item label="国家：" label-width="80px" prop="createdBy">
          <el-input style="width:238px" size="mini" v-model="createdData.podCountryCode" placeholder="请输入"></el-input>
        </el-form-item> -->
      </div>
      
      <el-table :data="weightLimitChargeItemList"  border>
        <el-table-column align="center" label="箱型" width="95px">
          <template slot-scope="scope">
            <el-select size="mini" v-if="!scope.row.containerTypeHide" v-model="scope.row.containerType" @change="(value) => {chengeBox(value, scope)}" @visible-change="(value) => {visibleChangeBox(value, scope)}"  placeholder="请选择">
              <el-option
                v-for="item in containerTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
                >
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column align="center" label="限重（单位TON）" width="415px">
          <template slot-scope="scope">
            <div style="display: flex; justify-content:space-between;">
              <el-input style="width:60px" placeholder="请输入" @change="compare(scope)" size="mini" v-model="scope.row.leftValue" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"></el-input>
              <el-select style="width:60px" size="mini" v-model="scope.row.lessThanFlag1" placeholder="请选择">
                <el-option v-for="item in lessThanFlagList" :key="item.value"  :label="item.label" :value="item.value"></el-option>
              </el-select>
              <el-select size="mini" style="width:80px"  v-model="scope.row.weightLimitType" placeholder="请选择">
                <el-option v-for="item in weightLimitTypeList" :key="item.value"  :label="item.label" :value="item.value"></el-option>
              </el-select>
              <el-select style="width:60px" size="mini" v-model="scope.row.lessThanFlag2" placeholder="请选择">
                <el-option v-for="item in lessThanFlagList" :key="item.value"  :label="item.label" :value="item.value"></el-option>
              </el-select>
              <el-input style="width:60px" placeholder="请输入" @change="compare(scope)" size="mini" v-model="scope.row.rightValue" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"></el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="重柜费" width="331px">
          <template slot-scope="scope">
            <div style="display:flex;justify-content:space-between;">
              <el-select style="width:90px" size="mini"  v-model="scope.row.currency" placeholder="请选择">
                <el-option v-for="item in currencyList" :key="item.code"  :label="item.code" :value="item.code"></el-option>
              </el-select>
              <el-input placeholder="请输入" size="mini" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" style="width:70px" v-model="scope.row.price"></el-input>
              <el-select style="width:90px" size="mini"  v-model="scope.row.rateUnit" placeholder="请选择">
                <el-option v-for="item in rateUnitList" :key="item.value"  :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
      
        <el-table-column align="center"  label="操作" >
          <template slot-scope="scope">
            <div style="display:flex;justify-content: center;">
              <el-button @click="addLine(scope)" type="text" size="mini" v-if="scope.row.btnAddShow">添加</el-button>
              <el-button @click="deleteRow(scope)" type="text" size="mini">删除</el-button>
            </div>
            
          </template>
        </el-table-column>
      </el-table>
      
      <div class="dialog-add">
        <el-button style="width:100%" size="mini"  @click="handleAddLine"> <i class="el-icon-plus"></i> 新增重柜费</el-button>
      </div>
     
      
      <el-table style="margin-top:10px" :data="grossWeightList"  border>
        <el-table-column align="center" label="箱型" width="95px">
          <template slot-scope="scope">
            <el-select size="mini" v-if="!scope.row.containerTypeHide" v-model="scope.row.containerType" @change="(value) => {chengeBox1(value, scope)}" @visible-change="(value) => {visibleChangeBox1(value, scope)}"  placeholder="请选择">
              <el-option
                v-for="item in containerTypeList1"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
                >
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column align="center" label="限重（单位TON）" width="415px">
          <template slot-scope="scope">
            <div style="display: flex; justify-content:space-between;">
              <el-input placeholder="请输入" style="width:60px" @change="compare(scope)" size="mini" v-model="scope.row.leftValue" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"></el-input>
              <el-select style="width:60px" size="mini" v-model="scope.row.lessThanFlag1" placeholder="请选择">
                <el-option v-for="item in lessThanFlagList" :key="item.value"  :label="item.label" :value="item.value"></el-option>
              </el-select>
              <el-select size="mini" style="width:80px"  v-model="scope.row.weightLimitType" placeholder="请选择">
                <el-option v-for="item in weightLimitTypeList" :key="item.value"  :label="item.label" :value="item.value"></el-option>
              </el-select>
              <el-select style="width:60px" size="mini" v-model="scope.row.lessThanFlag2" placeholder="请选择">
                <el-option v-for="item in lessThanFlagList" :key="item.value"  :label="item.label" :value="item.value"></el-option>
              </el-select>
              <el-input placeholder="请输入" style="width:60px" @change="compare(scope)" size="mini" v-model="scope.row.rightValue" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"></el-input>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column align="center" label="选柜费" width="331px">
          <template slot-scope="scope">
            <div style="display: flex;justify-content:space-between;">
              <el-select style="width:90px" size="mini"  v-model="scope.row.currency" placeholder="请选择">
                <el-option v-for="item in currencyList" :key="item.code"  :label="item.code" :value="item.code"></el-option>
              </el-select>
              <el-input placeholder="请输入" size="mini" style="width:70px" v-model="scope.row.price" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"></el-input>
              <el-select style="width:90px" size="mini"  v-model="scope.row.rateUnit" placeholder="请选择">
                <el-option v-for="item in rateUnitList"  :key="item.value"  :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center"  label="操作">
          <template slot-scope="scope" style="">
            <div style="display:flex;justify-content: center;">
              <el-button @click="addLine1(scope)" type="text" size="mini" v-if="scope.row.btnAddShow">添加</el-button>
              <el-button @click="deleteRow1(scope)" type="text" size="mini">删除</el-button>
            </div>
            
          </template>
        </el-table-column>
      </el-table>
      
      <div class="dialog-add">
        <el-button style="width:100%" size="mini"  @click="handleAddLine1"> <i class="el-icon-plus"></i> 新增选柜费</el-button>
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" type="primary" @click="submitForm('createdData')"> <i class="el-icon-copy-document"></i> 保存</el-button>
      <el-button size="mini" @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
  <!-- 选择拿价人 -->、
  <el-dialog
    title="修改拿价人"
    :visible.sync="pricerOptions.show"
    width="800px"
    v-if="pricerOptions.show"
    :before-close="closePricer">
    <el-form ref="form" :model="pricerOptions.form" :rules="pricerOptions.rules" label-width="80px" size="mini" class="pricer-form" inline>
      <el-form-item label="拿价人:" prop="pricer">
        <el-select v-model="pricerOptions.form.pricer" remote clearable filterable :remote-method="getPricer" value-key="employeeId" placeholder="请选择">
          <el-option v-for="(item,index) in pricerList" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="closePricer" size="mini">取 消</el-button>
      <el-button type="primary" @click="submitPricer" size="mini">确 定</el-button>
    </div>
  </el-dialog>
</div>
</template>
<script>
import Vue from 'vue'
import store from '@/store'
import { mapGetters } from 'vuex'
import { employeeSelectlist } from '@/api/companyResource'
import { weightLimitChargeList, weightLimitChargeAdd, weightLimitChargeUpdate, weightLimitChargeInfo, weightLimitChargeDelete,weightLimitChargeExport, multUpdatePricer} from '@/api/charge/weightLimitCharge'
import { basePortList, baseSystemLineList, baseShippingCarrierList, baseCurrencyList,portSystemLineInfo  } from '@/api/base'
import Pagination from '@/components/Base/Table/newPagination'
import Search from '@/components/Base/Search/index'

const defaultCreateQuery = {
  wlcId:undefined,
  polCode: '',
  podCode: '',
  shipCarrierCode: '',
  sysLineCode: '',
  sysLineCname:'',
  weightLimitChargeItemList: [],
  pricer:"",
  pricerName:"",
  remark:'',
  dateTime: [],
  beginDate: '',
  endDate: ''
}

const rowSpan = {
  containerType: "20GP",
  limitType:"",
  weightLimitType:"net_weight",
  currency:"USD",
  leftValue: 10,
  lessThanFlag1: "<=",
  lessThanFlag2: "<",
  price: '',
  rightValue: 20,
  rateUnit:"per_teu",
  btnAddShow: true
}
const defaultPage = {
  pageSize: -1,
  currPage: 1
}

const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: [],
  query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
  state: 'unpublished'
}
export default {
  name:"weihtLimit",
  components:{ Pagination, Search },
  data() {
    return {
      tableHeight: 400,
      state: '',
      //弹框标题
      title:"",
      //编辑弹框开关
      open:false,
      //详情弹框开关
      detailsOpen:false,
      searchConditionHide: true,  // 隐藏搜索自定义
      // 查询条件
      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      tableData: [],
      polCode:[],
      podCode:[],
      trsCode:[],
      sysLineDisabled:false,
      portList:[],
      //拿价人
      pricerOptions:[],
      //表单
      createdData: Object.assign( {}, defaultCreateQuery,{},this.weightLimitList),
      // 新增，编辑表格数据
      weightLimitChargeItemList:[],
      grossWeightList:[],
      //保存按钮去掉btnAddShow
      weightLimitList:[],
      unitQuery: {
        templateName:"",
        createdBy:"",
        surchargeList:undefined,
      },

      //新增修改表单
      surchargeData: {
        templateName:"",
        createdBy:"",
        surchargeList:undefined,
      },
      row: {
        containerType:"",
        lessThanFlag1:"",
        leftValue:'',
        lessThanFlag2:"",
        rightValue:'',
        heavyRate:'',
        extraContainerRate:''
      },
      loading:false,
      templateName:"",
      //附加费模板
      createdBy:'',
      //箱型20GP/40GP下拉
      containerTypeList:[{  value: '20GP',  label: '20GP'}, {  value: '40GP',  label: '40GP'},{  value: '40HQ', label: '40HQ'}, {  value: '45HQ',  label: '45HQ'}, {  value: '20NOR',  label: '20NOR'}, {  value: '40NOR',  label: '40NOR'}],
      containerTypeList1:[{  value: '20GP',  label: '20GP'}, {  value: '40GP',  label: '40GP'},{  value: '40HQ', label: '40HQ'}, {  value: '45HQ',  label: '45HQ'}, {  value: '20NOR',  label: '20NOR'}, {  value: '40NOR',  label: '40NOR'}],
      //箱型20GP/40GP下拉
      weightLimitTypeList:[
        {
          value: 'net_weight',
          label: '纯货重'
        }, {
          value: 'gross_weight',
          label: '连柜重'
        }
      ],
      //大于号下拉
      lessThanFlagList:[
        {
          value: '<',
          label: '<'
        },
        {
          value: '<=',
          label: '<='
        }
      ],
      //重柜费货币下拉
      currencyList:[],
      //大于号下拉
      rateUnitList:[
        {
          value: 'per_teu',
          label: 'TEU'
        }, {
          value: 'per_container',
          label: '每箱'
        }
      ],
      multipleSelection:[],
      //下标数组
      indexArr:[],
      //下标数组
      indexArr1:[],
      //港口下拉
      polCodeList:[],
      transitCodeList: [],
      podCodeList:[],
      //船公司下拉
      shipCarrierCodeList:[],
      //航线下拉
      sysLineCodeList:[],
       // table基础组件
      tableConfig: {
        // 分页
       pagination: {
            pageSize: 10,
            show: true,
            total: 0,
            hasNextPage: false,
            hasPreviousPage: false,
            isFirstPage: false,
            isLastPage: false
          }
      },
      searchConfig: [
        {
          key: 'polCode',
          label: '大船起运港',
          type: 'remoteSelect',
          searchType: 'eq',
          value: '',
          data: [], nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.portSearch('', 'port_of_basic', this.state, 'polCode', item)
          }, filterMehod: (val, item) => {
            this.portSearch(val, 'port_of_basic', this.state, 'polCode', item)
          }, change: (val, item) => {
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        // {
        //   key: 'transitPortCode',
        //   label: '中转港',
        //   type: 'remoteSelect',
        //   searchType: 'eq',
        //   value: '',
        //   data: [], nonDictionary: true,
        //   queryValue: '',
        //   visibleChange: (val, item) => {
        //     this.portSearch('', 'port_of_basic', this.state, 'polCode', item)
        //   }, filterMehod: (val, item) => {
        //     this.portSearch(val, 'port_of_basic', this.state, 'polCode', item)
        //   }, change: (val, item) => {
        //     Object.assign(item, {
        //       queryValue: val
        //     })
        //   }
        // },
        {
          key: 'podCode',
          label: '目的港',
          type: 'remoteSelect',
          searchType: 'eq',
          value: '',
          data: [], nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.portSearch('', 'port_of_destination', this.state, 'podCode', item)
          }, filterMehod: (val, item) => {
            this.portSearch(val, 'port_of_destination', this.state, 'podCode', item)
          }, change: (val, item) => {
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        {
          key: 'shipCarrierCode', 
          label: '船公司',
          type: 'remoteSelect',
          value: '',
          data: [], nonDictionary: true,
          searchType: 'eq',
          visibleChange: (val, item) => {
            this.shipQuerySearch('', item)
          }, filterMehod: (val, item) => {
            this.shipQuerySearch(val, item)
          }, change: (val, item) => {
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        {
          key: 'sysLineCode',
          label: '航线',
          type: 'remoteSelect',
          searchType: 'eq',
          value: '',
          data: [], 
          nonDictionary: true,
          // searchType: 'in',
					// multiple: true,
					// 'collapse-tags': true,
					// value: '',
					// data: [],
					// nonDictionary: true,
					// queryValue: '',
          visibleChange: (val, item) => {
            this.sysLineQuerySearch('', item)
          }, filterMehod: (val, item) => {
            this.sysLineQuerySearch(val, item)
          }, change: (val, item) => {
            Object.assign(item, {
              queryValue: val
            })
          }
        },
      ],
      pricerList: [],
      pricerOptions: {
        show: false,
        form: {
          pricer: ''
        },
        rules: {
          pricer: {required: true, message:'请选择', trigger: 'change'}
        }
      }
    };
    
  },
  created() {
    this.getList()
    this.polCodeSearch('','','')
    this.sysLineSearch('')
    baseCurrencyList('', 'valid', 'charge').then(response => {
      this.currencyList = response.data
    })
  },
  mounted() {
    this.$nextTick(() => {
      this.dynamicHeight()
    })
  },
  computed: {
    ...mapGetters([
      'userId','name'
    ])
  },
  methods: {
    // 批量修改拿价人
    changePricer () {
      let len = this.multipleSelection.length
      if (len < 1) {
        return this.$msgErrClose('请先选择需要操作的数据！')
      }
      this.pricerOptions.show = true
    },
    closePricer () {
      this.pricerOptions.show = false
    },
    submitPricer () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let {cname: pricerName, employeeId:pricer  } = this.pricerOptions.form.pricer
          let wlcIds = this.multipleSelection.map(item => item.wlcId)
          let data = {
            wlcIds,
            pricerName,
            pricer
          }
          multUpdatePricer(data).then(res => {
            this.closePricer()
            this.$msgSucClose('修改拿价人成功！')
            this.getList()
          }).catch(()=>{})
        } else {
          this.$msgErrClose('红框内为必填项，请补充！')
          return false
        }
      })
    },
    getPricer (val='') {
      let data = {
        "state": "valid",
        "name": val
      }
      employeeSelectlist(data).then(res => {
        this.pricerList = res.data.map(item => {
          let {cname, deptCname, employeeId} = item
          return {
            label: `${cname}(${deptCname})`,
            value: item
          }
        })
      }).catch(()=>{})
    },
    formatter (row) {
      let { beginDate, endDate } = row
      return beginDate ? `${beginDate} - ${endDate}` : ''
    },
    async dynamicHeight(value) {
      let {limitTable, tableFooter} = this.$refs
      let height = document.documentElement.clientHeight || document.body.offsetHeight
      
      let table = limitTable.$el.getBoundingClientRect()
      let footer = tableFooter.getBoundingClientRect()
      this.tableHeight = height - table.top - footer.height - 20 // 表格高度=文档高度-表格距顶部距离-表格分页-容器padding间距
    },
    shipCarrierSearch(queryString){
      baseShippingCarrierList(queryString, '').then(response => {
        this.shipCarrierCodeList = response.data
      })
    },
      // 获取多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    sysLineSearch(queryString){
      this.$store.dispatch('dict/baseSystemLineList', {queryString, state: ''}).then(data => {
        this.sysLineCodeList = data
      })
    },
    visibleChangePol(val) {
      this.polCodeSearch('',"",'')
    },
    filterMehodPol(val) {
      if (val === undefined) return
      this.polCodeSearch(val,"port_of_basic",'')
    },
    // 起运港口下拉数据
    polCodeSearch(val, portAttribute, state) {
      basePortList(val,portAttribute).then(response => {
        // const res = []
        const portlist = response.data
        this.polCodeList = portlist.map(item => {
          return Object.assign(item, {
            key: item.portCode,
            value: `${item.ename}(${item.cname}${ item.cityCname && item.countryName ? ",":""}${item.cityCname}${ item.cityCname && item.countryName?",":""}${item.countryName})`
          })
        })
      })
    },
    visibleChangeTransit(val) {
      this.transitCodeSearch('',"",'')
    },
    filterMehodTransit(val) {
      if (val === undefined) return
      this.transitCodeSearch(val,"port_of_basic",'')
    },
    // 中转港口下拉数据
    transitCodeSearch(val, portAttribute, state) {
      basePortList(val,portAttribute).then(response => {
        // const res = []
        const portlist = response.data
        this.transitCodeList = portlist.map(item => {
          return Object.assign(item, {
            key: item.portCode,
            value: `${item.ename}(${item.cname}${ item.cityCname && item.countryName ? ",":""}${item.cityCname}${ item.cityCname && item.countryName?",":""}${item.countryName})`
          })
        })
      })
    },
    // 目的港口下拉数据
    podCodeSearch(val, portAttribute, state) {
      basePortList(val,portAttribute).then(response => {
        // const res = []
        const portlist = response.data
        this.podCodeList = portlist.map(item => {
          return Object.assign(item, {
            key: item.portCode,
            value: `${item.ename}(${item.cname}${ item.cityCname && item.countryName ? ",":""}${item.cityCname}${ item.cityCname && item.countryName?",":""}${item.countryName})`
          })
        })
      })
    },
  
    // 远程搜索港口下拉数据
    portSearch(queryString = '', portAttribute, state, type, item) {
      queryString = queryString.trim()
      this.$store.dispatch('dict/basePortList', {queryString, portAttribute, state}).then(data => {
        let portList = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
        item.data = portList
      })
    },
    // 目的地
    podPortVisibleChange(val) {
      val && this.podCodeSearch(val, 'port_of_destination', 'valid')
    },
    podPortFilterMethod(val) {
      if (val === undefined) return
      this.podCodeSearch(val, 'port_of_destination', 'valid')
    },
    handleChangePodPort(val) {
      if(!val){
        this.changeSysLineDisabeld(false)
      }else{
        this.initSystemLine(val);
        this.changeSysLineDisabeld(true)
      }
    },
    changeSysLineDisabeld(value){
      this.sysLineDisabled = value
    },
   initSystemLine(key){
      portSystemLineInfo(key).then(response => {
        let sysLineCodeList =response.data
        if(sysLineCodeList.length>0){
          this.createdData.sysLineCode = [sysLineCodeList[0].sysLineCode]
          this.createdData.sysLineCname = sysLineCodeList[0].cname
        }
        // this.sysLineSearch(this.sysLineCodeList[0].cname)
      })
    },

    // 船公司下拉列表自动补充的数据
    shipQuerySearch(queryString='', item) {
      queryString = queryString.trim()
      this.$store.dispatch('dict/baseShippingCarrierList', {name: queryString, state: ''}).then(data => {
        item.data = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
    },

    // 航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString='', item) {
      queryString = queryString.trim()
      this.$store.dispatch('dict/baseSystemLineList', {name: queryString, state: ''}).then(data => {
        item.data = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
    },

    //搜索按钮
    handleSearch(){
      this.tableQuery.currPage = 1;
      this.getList();
    },
    // 起运港下拉列表自动补充的数据
    polQuerySearch(queryString, portAttribute, state, cb) {
      this.$store.dispatch('dict/basePortList', {queryString, portAttribute, state}).then(data => {
        cb(data)
      })
    },

    //搜索取消按钮
    handleReset(){
      this.tableQuery.polCode = undefined;
      this.tableQuery.podCode = undefined;
      this.tableQuery.transitPortCode = undefined;
      this.tableQuery.shipCarrierCode = undefined;
      this.tableQuery.sysLineCode = undefined;
      this.handleSearch();
    },
    //新建按钮操作
    handleAdd(){
      this.polCode = []
      this.podCode = []
      this.trsCode = []
      this.transitPortCode=[]
      this.grossWeightList = []
      // this.sysLineCodeList=[]
      this.sysLineDisabled=false
      this.pricerOptions = [{label: this.name, value:this.userId}]
      Object.assign(this.createdData, {}, defaultCreateQuery)
      this.open = true
      this.weightLimitChargeItemList = [{
        containerType: "20GP",
        limitType:"heavy_fee",
        weightLimitType:"net_weight",
        currency:"USD",
        leftValue: 10,
        lessThanFlag1: "<=",
        lessThanFlag2: "<",
        price: '',
        rightValue: 20,
        rateUnit:"per_teu",
        btnAddShow: true
      }]
      this.title = "限重费模板新增"
      //默认拿价人当前登陆人
      this.createdData.pricer=this.userId
    },
    //添加按钮
    addLine(row){
      row.row.btnAddShow = false
      this.weightLimitChargeItemList.splice(row.$index +1, 0, Object.assign({}, row.row, {
        btnAddShow: true,
        containerTypeHide: true
      }))
    },
    //添加按钮
    addLine1(row){
      row.row.btnAddShow = false
      this.grossWeightList.splice(row.$index +1, 0, Object.assign({}, row.row, {
        btnAddShow: true,
        containerTypeHide: true
      }))
    },
    //新增一行
    handleAddLine(){
      let len = this.weightLimitChargeItemList.length
      let set = this.getListsContainerTypes(this.weightLimitChargeItemList,this.containerTypeList)
      if(set.length != 0){
        let [...arr] = new Set(set)
        let list =[]
        if(this.weightLimitChargeItemList[this.weightLimitChargeItemList.length-1].containerType){
          for(let i in this.containerTypeList){
            list.push(this.containerTypeList[i].value)
          }
          let str = list
          let array = arr
          if(str.length !== array.length){
            Vue.set(this.weightLimitChargeItemList, len, Object.assign({}, rowSpan, {
              containerType: ''
            }))
            this.weightLimitChargeItemList = this.weightLimitChargeItemList.length ? this.createdList(this.weightLimitChargeItemList) : []
          }else{
            this.$message.error('箱型已选完不能再增加');
          }
        }else{
          this.$message.error('选完了箱型才可以再增加');
        }
      }else{
        Vue.set(this.weightLimitChargeItemList, len, Object.assign({}, rowSpan, {
          containerType: this.containerTypeList[0].value
        }))
        this.weightLimitChargeItemList = this.weightLimitChargeItemList.length ? this.createdList(this.weightLimitChargeItemList) : []
      }
      
    },
    //新增一行
    handleAddLine1(){
      let len = this.grossWeightList.length
      let set = this.getListsContainerTypes(this.grossWeightList,this.containerTypeList1)
      if(set.length != 0){
        let [...arr] = new Set(set) 
        let list =[]
        if(this.grossWeightList[this.grossWeightList.length-1].containerType){

          for(let i in this.containerTypeList1){
            list.push(this.containerTypeList1[i].value)
          }
          let str = list
          let array = arr
          if(str.length !== array.length){
            Vue.set(this.grossWeightList, len, Object.assign({}, rowSpan, {
              containerType: ''
            }))
            this.grossWeightList = this.grossWeightList.length ? this.createdList(this.grossWeightList) : []
          }else{
            this.$message.error('箱型已选完不能再增加');
          }
        }else{
          this.$message.error('选完了箱型才可以再增加');
        }
      }else{
        Vue.set(this.grossWeightList, len, Object.assign({}, rowSpan, {
          containerType: this.containerTypeList1[0].value
        }))
        this.grossWeightList = this.grossWeightList.length ? this.createdList(this.grossWeightList) : []
      }
      
    },

    // 验证箱型可选
    validateContainerType() {
      let state = false;
      this.containerTypeList.forEach((item, index) => {
        if (!item.disabled){
          return state = true
        } else {
          return state = false
        }
      })
      return state
    },

    //详情按钮
    handleDetails(row){
      this.title = "限重费"
      const wlcId = row.wlcId;
      weightLimitChargeInfo({wlcId:wlcId}).then(res=>{
        for (let i in this.createdData) {
            this.createdData[i] = res.data[i]
        }
        let list = res.data.weightLimitChargeItemList;
        if(list.length){
          this.createdArr(list)
        }else {
          this.weightLimitChargeItemList = [];
          this.grossWeightList = []
        }
        this.detailsOpen = true
      })
    },
    //限重编辑复制按钮操作
    handleEdit(row,type){
      this.title = "限重修改"
      const wlcId = row.wlcId
      weightLimitChargeInfo({wlcId:wlcId}).then(res=>{
        for (let i in this.createdData) {
          this.createdData[i] = res.data[i]
        }
        this.createdData.sysLineCode = res.data.sysLineCode.split(',')
        // this.sysLineCodeList = [{cname: this.createdData.sysLineCname, sysLineCode: this.createdData.sysLineCode}]
          this.pricerOptions=[{lable: this.createdData.pricer, value: this.createdData.pricerName}]
        if(this.createdData.podCode){
          this.changeSysLineDisabeld(true)
        }
        if (this.createdData.beginDate) {
          let { beginDate, endDate } = this.createdData
          this.createdData.dateTime = [beginDate, endDate]
        }
        if(type==='copy'){
          this.createdData.wlcId="";
          this.title = "新增限重"
        }
        // this.sysLineSearch()
        if(res.data.polCode){
           this.polCode = res.data.polCode.split(",");
        }
        if(res.data.transitPortCode){
          this.trsCode=res.data.transitPortCode.split(",")
        }
        this.initPortCodes();
        let list = res.data.weightLimitChargeItemList;
        if(list.length){
          this.createdArr(list)
        }else {
          this.weightLimitChargeItemList = [];
          this.grossWeightList = []
        }
        //初始化拿价人显示
        this.pricerQuerySearch(res.data.pricerName)
        this.open = true 
      })
   
    },
    //初始化港口信息
    initPortCodes(){
      let portCodesArr=this.polCode.concat(this.podCode)
      portCodesArr.concat(this.trsCode)
      let portCodes=portCodesArr.join(',')
      //初始化港口信息
      this.$store.dispatch('dict/basePortListByCodes', {portCodes}).then(data => {
        this.polCodeList=data.map(item => {
          return Object.assign(item, {
            key: item.value,
            value: item.label
          })
        })
      })
      //初始化港口信息
      this.$store.dispatch('dict/basePortListByCodes', {portCodes:this.createdData.podCode}).then(data => {
        this.podCodeList=data.map(item => {
          return Object.assign(item, {
            key: item.value,
            value: item.label
          })
        })
      })
      //初始化航线信息
      // baseSystemLineList(this.createdData.sysLineCode, '').then(response => {
      //   this.sysLineCodeList = response.data
      // })
    },
    createdArr(list){
      let arr = list
      let heavyFee = []
      let selectionFee = []
      for (let i = 0; i < arr.length; i++) {
        if(arr[i].limitType == 'heavy_fee'){
          heavyFee.push(arr[i])
        }
        if(arr[i].limitType== "selection_fee"){
          selectionFee.push(arr[i])
        }
      } 
      this.weightLimitChargeItemList = heavyFee.length ? this.createdList(heavyFee) : []
      this.grossWeightList = selectionFee.length ? this.createdList(selectionFee) : []
      
    },
    // 遍历列表设置箱型、操作按钮显示隐藏，btnAddShow：操作按钮显示，containerTypeHide箱型下拉隐藏
    createdList(data){
      let arr = [];
      if (data.length==1){
        data.btnAddShow = true;
        data.containerTypeHide = true;  
      }
      if (data.length > 1) {
        for(let i = 1;i<data.length;i++){
          data[i].btnAddShow = false;
          if(data[i].containerType !== data[i-1].containerType){
            data[i-1].btnAddShow = true;
          } else{
            data[i].containerTypeHide = true;  
          }
        }
      }
      data[data.length-1].btnAddShow = true;
      arr = data
      return arr
    },

    //删除列表
    handleDelete(row){
      const wlcId = row.wlcId;
      this.$confirm('是否确认删除起运港名称为' + (row.polEname?row.polEname:"空") + '的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning"
      }).then(function() {
        return weightLimitChargeDelete({wlcId: wlcId});
      }).then(() => {
        this.handleSearch()
        this.$message({message: '恭喜你，删除成功', type: 'success'});
      }).catch(function() {});
    },
    
    getList() {
      this.loading = true
      let publishStatusQuery = [{'column': 'state', 'type': 'eq', 'value': this.tableQuery.state}]

      // 合并发布状态参数
      let data = {}
      Object.assign(data, this.tableQuery, {
        query: this.tableQuery.query.concat(publishStatusQuery)
      })
      delete(data.state)

      weightLimitChargeList(this.tableQuery).then(res=>{
        let {list , totalCount} = res.data;
        this.tableData = list
        this.tableConfig.list = list;

        this.tableConfig.pagination.total = totalCount;
        this.tableQuery.currPage = res.data.currPage
          this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
          this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
          this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
          this.tableConfig.pagination.isLastPage = res.data.isLastPage
          this.tableQuery.pageSize = res.data.pageSize
      }).finally(() => {
        this.loading = false
      })
    },

    handleSizeChange() {
      this.getList()
    },

    handleCurrentChange() {
      this.getList()
    },
    // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
     // 取消按钮
    cancel() {
      this.open = false;
    },
    
    //保存按钮操作
    submitForm(formName) {
      
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let _list = this.weightLimitChargeItemList.concat(this.grossWeightList)
          if (_list.length === 0 ) {
            this.$message({
              message: '必须新增重柜费或选柜费',
              type: 'error',
              showClose: true
            })
            return
          }
          for (let i = 0; i < _list.length; i++) {
            if (Number(_list[i].price) <= 0 ) {
              this.$message({
                message: '重柜费或选柜费必填',
                type: 'error',
                showClose: true
              })
              return
            }
            //如果存在值，才校验  可能存在没有上限的情况
              if( Number(_list[i].rightValue)){
                if(!(Number(_list[i].leftValue) <= Number(_list[i].rightValue))) {
                  this.$message({
                    message: '起始数值不能大于截止数值',
                    type: 'error',
                    showClose: true
                  })
                  return
                }
            }
          }
          if(this.weightLimitChargeItemList.length ? this.weightLimitChargeItemList[this.weightLimitChargeItemList.length-1].containerType : true){
            if(this.grossWeightList.length ? this.grossWeightList[this.grossWeightList.length-1].containerType : true){
              
              for (let i = 0; i < this.weightLimitChargeItemList.length; i++) {
                this.weightLimitChargeItemList[i].limitType = 'heavy_fee'
              }
              for (let i = 0; i < this.grossWeightList.length; i++) {
                this.grossWeightList[i].limitType = 'selection_fee'
              }
              let list = this.weightLimitChargeItemList.concat(this.grossWeightList)
              this.createdData.polCode = this.polCode.toString()
              this.createdData.transitPortCode =this.trsCode.toString();
              this.createdData.sysLineCode =this.createdData.sysLineCode.toString();
              if ( this.createdData.dateTime?.length > 0) {
                let [ beginDate, endDate ] = this.createdData.dateTime
                this.createdData.beginDate = beginDate || ''  
                this.createdData.endDate = endDate || ''
              } else {
                this.createdData.beginDate = ''  
                this.createdData.endDate = ''
              } 
              for (let i = 0; i < list.length; i++) {
                list[i].btnAddShow = undefined;
                list[i].containerTypeHide = undefined;
              }
              this.createdData.weightLimitChargeItemList = list
              this.emptyData();
              if (this.createdData.wlcId) {
                weightLimitChargeUpdate(this.createdData).then(res=>{
                  this.open = false
                  this.getList()
                  this.$message({message: '恭喜你，修改保存成功', type: 'success'});
                })
              } else {
                weightLimitChargeAdd(this.createdData).then(res=>{
                  this.open = false
                  this.getList()
                  this.$message({message: '恭喜你，新建保存成功', type: 'success'});
                })
              }

            }else{
              this.$message({message: '选择箱型不能为空', type: 'success'});
            }
            
          }else{
            this.$message({message: '选择箱型不能为空', type: 'success'});
          }
          
        } else {
          this.$msgErrClose('红框内为必填项，请补充！')
          return false;
        }
      });
    },
    emptyData(){
      delete(this.createdData.createdTime)
      delete(this.createdData.createdName)
      delete(this.createdData.createdBy)
      delete(this.createdData.updatedBy)
      delete(this.createdData.updatedName)
      delete(this.createdData.updatedTime)
    },
    //删除列表
    deleteRow(scope){
      //let len = this.weightLimitChargeItemList.length
      this.weightLimitChargeItemList.splice(scope.$index, 1)
      if(this.weightLimitChargeItemList.length){
        Object.assign(this.weightLimitChargeItemList[0], {
          containerTypeHide: false
        })
      }
      if (scope.$index && scope.row.btnAddShow) {
        this.weightLimitChargeItemList[scope.$index-1].btnAddShow = true
      }
    },
    //删除列表
    deleteRow1(scope){
      //let len = this.grossWeightList.length
      this.grossWeightList.splice(scope.$index, 1)
      if(this.grossWeightList.length){
        Object.assign(this.grossWeightList[0], {
          containerTypeHide: false
        })
        
        if (scope.$index && scope.row.btnAddShow) {
          this.grossWeightList[scope.$index-1].btnAddShow = true
        }
      }
    },

    // 遍历数组获取列表显示的箱型种类总数存入数组中第一个参数为列表，箱型
    getListsContainerTypes(data,typeList) {
      let List = data;
      let containerTypeList = typeList;
      let typesArr = [];
      for (let i = 0; i < List.length; i++) {
        for (let j = 0; j< containerTypeList.length; j++) {
          
          if (List[i].containerType === containerTypeList[j].value) {
            typesArr.push(containerTypeList[j].value)
          }
        }
      }
      return typesArr
    },
    visibleChangeBox(value, scope){
      let arr = this.getListsContainerTypes(this.weightLimitChargeItemList,this.containerTypeList)
      let list = this.weightLimitChargeItemList
      this.indexArr = []

      // 显示下拉时，遍历下拉数据，如果存在于列表显示的箱型中就置灰处理
      if (value) {
        for (let i = 0; i < this.containerTypeList.length; i++) {
          Vue.set(this.containerTypeList, i, Object.assign(this.containerTypeList[i], {disabled: false}))

          if (arr.includes(this.containerTypeList[i].value)) {
            Vue.set(this.containerTypeList, i, Object.assign(this.containerTypeList[i], {disabled: true}))
          }

          if (scope.row.containerType === this.containerTypeList[i].value) {
            Vue.set(this.containerTypeList, i, Object.assign(this.containerTypeList[i], {disabled: false}))
          }
        }
      } else {  // 隐藏下拉时初始化
        for (let i = 0; i < this.containerTypeList.length; i++) {
          Vue.set(this.containerTypeList, i, Object.assign(this.containerTypeList[i], {disabled: false}))
        }
      }
      
      
      for (let i = 0; i < list.length; i++) {
        if(scope.row.containerType === list[i].containerType){
          this.indexArr.push(i)
        }
      }
    },
    visibleChangeBox1(value, scope){
      let arr = this.getListsContainerTypes(this.grossWeightList,this.containerTypeList1)
      let list = this.grossWeightList
      this.indexArr1 = []

      // 显示下拉时，遍历下拉数据，如果存在于列表显示的箱型中就置灰处理
      if (value) {
        for (let i = 0; i < this.containerTypeList1.length; i++) {
          Vue.set(this.containerTypeList1, i, Object.assign(this.containerTypeList1[i], {disabled: false}))

          if (arr.includes(this.containerTypeList1[i].value)) {
            Vue.set(this.containerTypeList1, i, Object.assign(this.containerTypeList1[i], {disabled: true}))
          }

          if (scope.row.containerType1 === this.containerTypeList1[i].value) {
            Vue.set(this.containerTypeList1, i, Object.assign(this.containerTypeList1[i], {disabled: false}))
          }
        }
      } else {  // 隐藏下拉时初始化
        for (let i = 0; i < this.containerTypeList1.length; i++) {
          Vue.set(this.containerTypeList1, i, Object.assign(this.containerTypeList1[i], {disabled: false}))
        }
      }
      for (let i = 0; i < list.length; i++) {
        if(scope.row.containerType === list[i].containerType){
          this.indexArr1.push(i)
        }
      }
    },

    //箱型下拉方法
    chengeBox(value, scope){
      this.indexArr.map((item, index) => {this.weightLimitChargeItemList[item].containerType = value })
    },
    //箱型下拉方法1
    chengeBox1(value, scope){
      this.indexArr1.map((item, index) => {this.grossWeightList[item].containerType = value })
    },
    polChange(value){
      this.createdData.polCode = value;
    },
    trsChange(value){
      this.createdData.transitPortCode = value;
    },
    changePodCode(value){
      this.createdData.podCode = value;
    },
    //港口下拉
    async querySearch(queryString, cb) {
      if(queryString){
        let res = await basePortList(queryString)
        let data = res.data
        for (let i of data) {
          //给这个数组中每一个对象加一个value字段, 因为autocomplete只识别value字段并在下拉列中显示
          i.value = i.portCode + '/' + i.portEname
        }
        let restaurants = data
        clearTimeout(this.timeout)
        // 设置定时任务将restaurants返回
        this.timeout = setTimeout(() => {
          cb(restaurants)
        }, 50 * Math.random())
      }
    },
    //航线下拉
    async querySearchAirRoute(queryString, cb) {
      if(queryString){
        let res = await basePortList(queryString)
        let data = res.data
        for (let i of data) {
          //给这个数组中每一个对象加一个value字段, 因为autocomplete只识别value字段并在下拉列中显示
          i.value = i.portCode 
        }
        let restaurants = data
        clearTimeout(this.timeout)
        // 设置定时任务将restaurants返回
        this.timeout = setTimeout(() => {
          cb(restaurants)
        }, 50 * Math.random())
      }
    },
    exportExcel(){
       if (this.multipleSelection.length!=1) {
          return this.$message({
            type: 'warning',
            message: '请选择一条记录进行导出',
            duration: 1000,
            onClose: () => {}
          })
       }
       mainRouteExport(data).then(res => {
          this.downLoad(res.data.fileNo,res.data.name)
      })


    },
    // 查询组件回调
    searchCallBack(action) {
      let query = []
      console.log('this.searchConfig', this.searchConfig);
      
      if (action === 'Search') {
        //默认的查询条件组装tableQuery参数
        if (this.searchConfig.length) {
          this.searchConfig.forEach((item, index) => {
            let tempQuery = {}
            if (item.value) {
              if (item.multiple) {
                if (item.value.length) {
                  Object.assign(tempQuery, {
                    "column": item.key,
                    "type": item.searchType || 'in',
                    "value": item.value.join(',')
                  })
                }
              } else {
                Object.assign(tempQuery, {
                  "column": item.key,
                  "type": item.searchType || 'eq',
                  "value": item.queryValue
                })
              }
              query.push(tempQuery)
            }
          })
        }

        Object.assign(this.tableQuery, {
          query: query,
          currPage: 1
        })
        this.getList()
      }

      if (action === 'Reset') {
        this.searchConfig.forEach(item => {
          item.value = ''
        })
        Object.assign(this.tableQuery, defaultTableQuery, defaultPage)
        this.getList()
        Object.assign(this.tableConfig, {tips: {text: "", show: false}})
      }
    },
    compare(scope){
      /* if(!(Number(scope.row.leftValue) <= Number(scope.row.rightValue))){
        this.$message('起始数值不能大于截止数值');
      } */
    },
    pricerFilterMethod(val) {
      if (val === undefined) return
      this.pricerQuerySearch(val)
    },
      // 拿价人
    pricerVisibleChange(val) {
      val && this.pricerQuerySearch('')
    },
    handleChangePricer(val) {
      let findItem = this.pricerOptions.find(ele => ele.value === val)
      this.createdData.pricerName = findItem ? findItem.label : ''
    },
        // 拿价人
    pricerQuerySearch(queryString) {
      let params = {}
      Object.assign(params, {
        name: queryString,
        state:'valid'
      })
      this.$store.dispatch('dict/employeeSelectlist', params).then(data => {
        this.pricerOptions = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
    },
  }
}
</script>
<style lang="scss" scoped>
  // components/Base组件
  .weight-limit{
    padding: 10px 10px 0;
    /deep/ .el-textarea__inner{
      padding:0px !important;
    }
    .el-textarea .el-input__count{
      bottom: 0px;
    }
    .limit-container{
      padding: 0 10px;
      background-color: #fff;
      position: relative;
      .filter-containe {
        /deep/ .el-button--mini{
          padding: 2px 5px;
        }
      }
      /deep/ .el-input--mini .el-input__icon {
        line-height: 20px;
      }
    }
    .filter-containe {
      padding-top: 10px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      font-size: 14px;
      color: #333;
      align-items: baseline;
      flex-wrap: wrap;

      .filter{
        display: flex;
        // flex: 1;
        flex-direction: row;
        justify-content: flex-start;
        flex-wrap: wrap;
      }
      .filter-item {
        display: inline-block;
        vertical-align: middle;
      }
    }
    .input-containe {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      margin: 10px 0px;
      margin-right: 20px;
      span.filter-txt {
        min-width: 80px;
        text-align: right;
        font-size: 14px;
      }
    }
    .bnt-search{
      float: right;
    }
    .weight-pop-form{
      .input-container-dia {
        display: flex;
        flex: 1;
        flex-direction: row;
        justify-content: flex-start;
        flex-wrap: wrap;
        /deep/.el-form-item__label, /deep/.el-form-item__content, /deep/.el-cascader--mini {
          line-height: 20px;
        }
        /deep/ .el-input--mini .el-input__inner, .el-range-editor--mini.el-input__inner{
          height: 20px !important;
          line-height: 20px !important;
        }
         .el-range-editor--mini.el-input__inner{
          padding: 0 5px;
         }
        /deep/ .el-input--mini .el-input__icon {
          line-height: 20px;
        }
        /deep/ .el-button--mini{
          padding: 2px 5px;
        }
        /deep/ .el-select .el-select__tags {
          max-width: auto !important;
        }
        /deep/ .el-select .el-select__tags span .el-tag--mini:first-of-type{
          flex: auto;
        }
        /deep/ .el-select .el-select__tags span .el-tag--mini:nth-of-type(2) {
          width: auto;
        }
      }
      .input-container-dialog {
        float: left;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        margin: 0 0 10px;
        span.filter-txt {
          min-width: 80px;
          text-align: right;
        }
        
      }
      /deep/ .el-table{
        .el-input--mini{
          .el-input__inner{
            line-height: 20px;
            height: 20px;
          }
          .el-input__icon{
            line-height: 20px;
          }
        }
      }
    }
    /deep/ .el-table {
      .el-button--mini{
        padding: 2px 5px;
        &.red{
          color: #cd4130;
        }
        &.orange{
          color: #E9851F;
        }
      }
      .el-input--mini{
        .el-input__inner, .el-input__icon{
          line-height: 20px;
          // height: 20px;
        }
      }
    }
    /deep/ .el-table th>.cell{
      color:#222222;
    }
    // /deep/ .el-tag {
    //   background-color: #fff; 
    //   color: #4A4A4A; 
    //   border-style: none; 
    // }
    .dialog-add{
      margin-top:16px;
      /deep/.el-button {
        border: 1px dashed #DCDFE6;
      }
    }
    .input-width{
      width:230px;
    }
    .m-t-8{
      margin-top:8px;
    }
    /deep/.el-input__prefix{
      line-height: 28px;
      color:#000000;
    }
    /deep/.el-input--prefix .el-input__inner {
      padding-left: 45px;
    }
  
  }
  .payment-advance{
    color:#fff;
    width:650px;
    padding:2px 10px;
    font-size: 0.75rem;
    // line-height: 150%;
    .payment-advance-list{
      width: 50%;
      float: left;
    }
  }
  /deep/ .el-dialog__footer {
    .el-button--mini{
      padding: 2px 5px;
    }
  }
  .pricer-form{
    line-height: 20px;
     /deep/.el-form-item{
      width: 50%;
      display: flex;
      align-items: center;
      margin-right: 0;
      .el-form-item__content{
        flex: 1;
        // line-height: 20px;
      }
    }
    .el-select{
      width: 100%;
    }
    /deep/ .el-form-item--mini {
      .el-form-item__label,.el-input__inner {
        height: 20px !important;
        line-height: 20px !important;
      }
    }
  }
</style>