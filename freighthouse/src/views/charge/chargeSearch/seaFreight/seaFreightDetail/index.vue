<template>
  <div class="seaFreightDetail">
    <div class="stop-box" v-if="createItem.blankSailing === 'Y'">
      <span class="icon">停</span> 该航线已停运
    </div>
    <div  class="stop-box" v-if="createItem.state === 'invalid'">
      <span class="icon">失</span> 运价已失效
    </div>
    <div class="components-containe">
        <div class="state-row">
            <div class="left-cnt">
              海运价详情
            </div>
            <div class="right-cnt">
              <el-button  size="mini" type="success" @click="handleCreate" v-if="createItem.state === 'valid' && createItem.blankSailing === 'N'">下单</el-button>
              <el-button  @click="$router.push('/charge/chargeSearch/seaFreight')" size="mini" >返回</el-button>
            </div>
        </div>
        <div class="head">
            <!-- <el-button class="btn" @click="$router.push('/charge/chargeSearch/seaFreight')" size="mini" >返回</el-button> -->
            <div class="title">
                <div class="current" v-if="createItem.feederPolEname && createItem.feederPolCname">
                  <div class="item">
                    驳船收货地
                    <el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                      <i class="icon-custView"></i>
                    </el-tooltip>
                  </div>
                  <span :class="createItem.feederPolEname && createItem.feederPolCname ? 'action': ''" v-if="createItem.feederPolEname">{{createItem.feederPolEname}} </span>
                  <span :class="createItem.feederPolEname && createItem.feederPolCname ? 'action': ''" v-if="createItem.feederPolCname">( {{ createItem.feederPolCname }} )</span>
                </div>
                
                <div v-if="createItem.feederPolEname && createItem.feederPolCname">
                    <div class="center">
                        <i class="triangle-bottomleft"></i>
                    </div>
                </div>
                <div class="current">
                  <div class="item">
                    大船起运港
                    <el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                      <i class="icon-custView"></i>
                    </el-tooltip>
                  </div>
                  <span :class="createItem.feederPolEname && createItem.feederPolCname ? 'action': ''">{{createItem.polEname}}</span>
                  <span :class="createItem.feederPolEname && createItem.feederPolCname ? 'action': ''">( {{createItem.polCname}} )</span>
                </div>
                <div>
                <div class="center">{{createItem.transitPort1Ename}}{{createItem.transitPort2Ename?','+createItem.transitPort2Ename:''}}
                    {{createItem.transitPort3Ename?','+createItem.transitPort3Ename:''}}<i class="triangle-bottomleft"></i>
                </div>
                </div>
                <div class='current'>
                  <div class="item">
                    大船目的地
                    <el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                      <i class="icon-custView"></i>
                    </el-tooltip>
                  </div>
                  <span :class="createItem.feederPolEname && createItem.feederPolCname ? 'action': ''">{{createItem.podEname}} </span>
                  <span :class="createItem.feederPolEname && createItem.feederPolCname ? 'action': ''">( {{createItem.podCname}} )</span>
                </div>
            </div>
        </div>
        <div class="content">
            <el-table :data="tableDataList" border class="content-container-type">
                <el-table-column  prop="containerType" align="center" label="箱型">
                </el-table-column>
                <el-table-column  prop="bargeFee" align="center" label="驳船费/币种">
                    <template slot-scope="scope">
                        <span>{{scope.row.bargeFee ? scope.row.bargeFee : '--'}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="baseFee" align="center" label="基价费/币种">
                    <template slot-scope="scope">
                        <span>{{scope.row.baseFee ? scope.row.baseFee : '--'}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="transferFee" align="center" label="中转费/币种">
                    <template slot-scope="scope">
                        <span>{{scope.row.transferFee ? scope.row.transferFee : '--'}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="totalFee" align="center" label="合计费/币种">
                    <template slot-scope="scope">
                        <span>{{scope.row.totalFee ? scope.row.totalFee : '--'}}</span>
                    </template>
                </el-table-column>
            </el-table>
            
            <!-- <el-row :gutter="50" style="margin-bottom:14px">
                <el-col :span="8" v-for="(item,index) in tabData" :key="index" >
                    <div class="grid-content">
                        <div class="left"> 
                            <span>{{item.lable}}</span>
                        </div>
                        <div class="right">
                            <p v-if="createItem.feederOceanFreight&&createItem.feederOceanFreight[item.prop]">
                               <span class="icon">+</span>  驳船费：{{createItem.feederOceanFreight.currency}} {{createItem.feederOceanFreight[item.prop]}}</p>
                            <p v-else  class="icon">--</p>
                            <p v-if="createItem[item.mainRoutePrice]"><span class="icon">+</span> 大船费：{{createItem[item.mainRoutePrice]}}</p><p v-else  class="icon">--</p>
                            <p v-if="(createItem[item.propDesc])">
                                <span class="icon">+</span>  合计费：{{createItem[item.propDesc]}}
                            </p>
                            <p v-else class="icon">--</p>
                        </div>
                    </div>
                </el-col>
            </el-row> -->
            <el-row :gutter="50" style="margin-top:8px;">
              <el-col class='el-col-customer-padding' :span="6" ><p class="detail"><span class="span-box"><span class="span-custView">船公司<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                  <i class="icon-custView"></i>
                </el-tooltip>：</span></span>{{createItem.shipCarrierCode ? createItem.shipCarrierCode :'--'}}</p></el-col>
              <el-col class='el-col-customer-padding' :span="6"><p class="detail"><span class="span-box"><span class="span-custView">中转港<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                  <i class="icon-custView"></i>
                </el-tooltip>：</span></span>{{createItem.transitPort1Ename}}{{createItem.transitPort2Ename?','+createItem.transitPort2Ename:'--'}}
                  {{createItem.transitPort3Ename?','+createItem.transitPort3Ename:''}}</p></el-col>
              <el-col class='el-col-customer-padding' :span="6"><p class="detail"><span>卸货港：</span>{{createItem.unloadingPortEname}}{{createItem.unloadingPortCname ? '('+ createItem.unloadingPortCname +')': '--'}}</p></el-col>
              <el-col class='el-col-customer-padding' :span="6"><p class="detail"><span class="span-box"><span class="span-custView">有效期<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                  <i class="icon-custView"></i>
                </el-tooltip>：</span></span>{{createItem.beginDate}}~{{createItem.endDate}}</p></el-col>
              <el-col class='el-col-customer-padding' :span="6"><p class="detail"><span class="span-box"><span class="span-custView">截关/开船<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                  <i class="icon-custView"></i>
                </el-tooltip>：</span></span>{{createItem.schedule ? createItem.schedule :'--'}}</p></el-col>
              <el-col class='el-col-customer-padding' :span="6"><p class="detail"><span class="span-box"><span class="span-custView">航程<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                  <i class="icon-custView"></i>
                </el-tooltip>：</span></span>{{createItem.voyage ? createItem.voyage :'--'}}</p></el-col>
              <el-col class='el-col-customer-padding' :span="6"><p class="detail"><span class="span-box"><span class="span-custView">中转方式<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                  <i class="icon-custView"></i>
                </el-tooltip>：</span></span>{{ getFieldLabel('mainRouteTransferMode', createItem.mainRouteTransferMode) || '--' }}</p></el-col>
              <el-col class='el-col-customer-padding' :span="6"><p class="detail"><span>驳船中转方式：</span>{{getFieldLabel('transferMode', createItem.transferMode) || '--' }}</p></el-col>
              <el-col class='el-col-customer-padding' :span="6"><p class="detail"><span>运输条款：</span>{{createItem.shipTerms ? createItem.shipTerms :'--'}}</p></el-col>
              <!-- <el-col class='el-col-customer-padding' :span="6"><p class="detail"><span>免用免堆：</span><span>{{createItem.freeTimeDesc ? createItem.freeTimeDesc : '--'}}</span></p></el-col> -->
              <el-col class='el-col-customer-padding' :span="6" style="height:24px"><p class="detail popover-class"><span>联系人<el-popover popper-class="emplpyeeName-pop" placement="left" width="240" trigger="click" v-if="createItem.pricerName">
                <div class="employeeName-list">
                  <ul>
                    <li v-if="employeeInfo.telephone">座机号：{{employeeInfo.telephone}}</li>
                    <li v-else>手机号：{{employeeInfo.mobileNo}}</li>
                    <li>QQ：{{employeeInfo.qq}}</li>
                    <li>email：{{employeeInfo.email}}</li>
                    <li>部门：{{employeeInfo.deptCname}}</li>
                    <li>公司：{{employeeInfo.companyCname}}</li>
                  </ul>
                </div>
                <i slot="reference" class="el-icon-postcard" @click="getEmployeeInfo(createItem.pricer)"></i>
                </el-popover>：</span>{{createItem.pricerName ? createItem.pricerName : '--'}}
              </p></el-col>
              <el-col class='el-col-customer-padding' :span="6"><p class="detail"><span class="span-box"><span class="span-custView">有效类别<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                  <i class="icon-custView"></i>
                </el-tooltip>：</span></span>{{ getFieldLabel('effectiveType', createItem.effectiveType) || '--' }}</p></el-col>
              <el-col class='el-col-customer-padding' :span="6"><p class="detail"><span class="span-box"><span class="span-custView">航线代码<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                  <i class="icon-custView"></i>
                </el-tooltip>：</span></span>{{createItem.carrierService  || '--'}}</p></el-col>
              <el-col class='el-col-customer-padding' :span="6"><p class="detail"><span class="span-box"><span class="span-custView">系统航线<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                  <i class="icon-custView"></i>
                </el-tooltip>：</span></span>{{createItem.sysLineCname  || '--'}}</p></el-col>
              <el-col class='el-col-customer-padding' :span="6"><p class="detail"><span class="span-box"><span class="span-custView">限定货物<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                  <i class="icon-custView"></i>
                </el-tooltip>：</span></span>{{createItem.cargoLimited  || '--'}}</p></el-col>
              <el-col class='el-col-customer-padding' :span="12"><p class="detail"><span class="span-box"><span class="span-custView">出单方式<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                  <i class="icon-custView"></i>
                </el-tooltip>：</span></span>{{issueWayText(createItem.issueWay) || '--'}}{{createItem.telexFee > 0 ? `; 电放费 ${createItem.telexFee}${createItem.telexFeeCurrency}` : ''}}</p></el-col>
            </el-row>
            <el-row>
              <el-col class='el-col-customer-padding' :span="12"><p class="detail"><span class="span-box"><span class="span-custView">免用免堆<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                  <i class="icon-custView"></i>
              </el-tooltip>
              </span></span><pre>{{createItem.freeTimeDesc ? createItem.freeTimeDesc : '--'}}</pre></p></el-col>
              <el-col class='el-col-customer-padding' :span="12"><p class="detail"><span class="span-box"><span class="span-custView">特别提醒<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                  <i class="icon-custView"></i>
              </el-tooltip></span></span><pre>{{createItem.attention ? createItem.attention : '--'}}</pre></p></el-col>
            </el-row>
            <el-row>
              <el-col class='el-col-customer-padding' :span="12"><p class="detail"><span class="span-box"><span class="span-custView">限重费说明<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                <i class="icon-custView"></i>
              </el-tooltip></span></span><pre>{{createItem.weightDesc ? createItem.weightDesc : '--'}}</pre></p></el-col>
              <el-col class='el-col-customer-padding' :span="12"><p class="detail"><span class="span-box"><span class="span-custView">附加费说明<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                <i class="icon-custView"></i>
              </el-tooltip></span></span><pre>{{createItem.surchargeDesc ? createItem.surchargeDesc : '--'}}</pre></p></el-col>
            </el-row>
            <el-row>
              <el-col class='el-col-customer-padding' :span="12"><p class="detail"><span class="span-box"><span class="span-custView red">收货指引</span></span><pre>{{createItem.guidanceDesc ? createItem.guidanceDesc : '--'}}</pre></p></el-col>
              <el-col class='el-col-customer-padding' :span="12"><p class="detail"><span class="span-box"><span class="span-custView">内部备注</span></span><pre>{{createItem.internalDesc ? createItem.internalDesc : '--'}}</pre></p></el-col>
            </el-row>
            <el-row>
              <el-col class='el-col-customer-padding' :span="12"><p class="detail"><span class="span-box"><span class="span-custView">出单方式备注<el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                <i class="icon-custView"></i>
              </el-tooltip></span></span><pre>{{createItem.issueWayDesc ? createItem.issueWayDesc : '--'}}</pre></p></el-col>
              <el-col class='el-col-customer-padding' :span="12"><p class="detail"><span class="span-box"><span class="span-custView">目的港收费标准参考</span></span><pre>{{createItem.podChargeDesc ? createItem.podChargeDesc : '--'}}</pre></p></el-col>
              <!-- <el-col :span="6"><p class="detail"><span>备注：</span><span>{{createItem.internalDesc}}</span></p></el-col> -->
            </el-row>
            
            <div style="margin:2px 0;border-bottom: 1px solid #E9E9E9;"></div>
            <div class="eight-limit">
                 <span class="text">基本港限重：</span>
                 <div class="eight-weight-limit">
                     <div v-if="!createItem.baseWeightLimitCharge" class='weight-group'><p>--</p></div>
                     <div class='weight-group' v-if="createItem.baseWeightLimitCharge">
                        <div v-for="(item,index) in createItem.baseWeightLimitCharge.weightLimitChargeItemDtoList" :key='index' class="weight"  :class="{'last-flag':item.lastFlag}">
                        <p><b style="width:32px;display: inline-block;">{{item.containerTypeGroup}}</b> <span>{{item.leftValue}}{{item.lessThanFlag1}}{{getFieldLabel('weightLimitType', item.weightLimitType)}}{{item.lessThanFlag2}}{{item.rightValue}}&nbsp;加收({{getFieldLabel('limitType', item.limitType)}}){{getFieldLabel('extraContainerRateUnit', item.rateUnit)}} {{item.currency}}{{item.price}}</span></p>
                        </div>
                    </div> 
                    <div style="word-wrap:break-word;word-break: break-all;">{{ createItem.baseWeightLimitChargeRemark }}</div>
                 </div>
            </div>
            <div style="margin:2px 0;border-bottom: 1px solid #E9E9E9;"></div>
            <div class="eight-limit" style="margin-top:4px">
                <span class="text">中转港限重
                  <el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                    <i class="icon-custView"></i>
                  </el-tooltip>：</span>
                <div class="eight-weight-group">
                    <div v-if="!createItem.transferWeightLimitCharge" class='weight-group'><p>--</p></div>
                    <div class='weight-group' v-if="createItem.transferWeightLimitCharge"> 
                        <div v-for="(item,index) in createItem.transferWeightLimitCharge.weightLimitChargeItemDtoList" :key='index' class="weight"  :class="{'last-flag':item.lastFlag}">
                            <p><b style="width:32px;display: inline-block;">{{item.containerTypeGroup}}</b> <span>{{item.leftValue}}{{item.lessThanFlag1}}{{getFieldLabel('weightLimitType', item.weightLimitType)}}{{item.lessThanFlag2}}{{item.rightValue}}&nbsp;加收({{getFieldLabel('limitType', item.limitType)}}){{getFieldLabel('extraContainerRateUnit', item.rateUnit)}} {{item.currency}}{{item.price}}</span></p>
                        </div>
                    </div> 
                    <div  style="word-wrap:break-word;word-break: break-all;">{{ createItem.transferWeightLimitChargeRemark }}</div>
                </div>
            </div>
            <div style="margin:2px 0;border-bottom: 1px solid #E9E9E9;"></div>
            <div class="cost-table">
              <!-- <h3>基本信息</h3> -->
              <div class="tit-row">
                <div class="tit">
                  附加费
                  <el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
                    <i class="icon-custView"></i>
                  </el-tooltip>
                </div>
                <div class="btn-copyField" @click="handleCopy($event)">复制</div>
              </div>
              <div class="discopy">
                <el-table :data="tableData">
                  <el-table-column prop="name" label="名称" align="center" width="200px">
                    <template slot-scope="scope">
                      {{scope.row.chargeName}}({{scope.row.chargeCode}})
                    </template>
                  </el-table-column>
                  <el-table-column prop="rateUnit" label="单位" align="center">
                    <template slot-scope="scope">
                      {{ scope.row.rateUnit | getDictLabelFilter('rateUnit')}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="priceGp20" align="center" label="20GP">
                    <template slot-scope="scope">
                      {{scope.row.rateUnit!='bill'&&scope.row.priceGp20>0?scope.row.priceGp20:'--'}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="priceGp40" align="center" label="40GP">
                    <template slot-scope="scope">
                      {{scope.row.rateUnit!='bill'&&scope.row.priceGp40>0?scope.row.priceGp40:'--'}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="priceHq40" align="center" label="40HQ">
                    <template slot-scope="scope">
                      {{scope.row.rateUnit!='bill'&&scope.row.priceHq40>0?scope.row.priceHq40:'--'}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="priceHq45" align="center" label="45HQ">
                    <template slot-scope="scope">
                      {{scope.row.rateUnit!='bill'&&scope.row.priceHq45>0?scope.row.priceHq45:'--'}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="priceNor20" align="center" label="20NOR">
                    <template slot-scope="scope">
                      {{scope.row.rateUnit!='bill'&&scope.row.priceNor20>0?scope.row.priceNor20:'--'}}
                    </template>
                  </el-table-column>
                    <el-table-column prop="priceNor40" align="center" label="40NOR">
                      <template slot-scope="scope">
                        {{scope.row.rateUnit!='bill'&&scope.row.priceNor40>0?scope.row.priceNor40:'--'}}
                      </template>
                  </el-table-column>
                  <el-table-column prop="price" align="center" label="单票价格">
                    <template slot-scope="scope">
                      {{scope.row.rateUnit==='bill'&&scope.row.price>=0?scope.row.price:'--'}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="currency" align="center" label="币别"></el-table-column>
                </el-table>
              </div>
              <div class="cost-money">
                  <div class="left">
                      <span>20GP ×  <el-input v-model="form.priceGp20" oninput = "value=value.replace(/[^\d]/g,'')"  @blur="hadnleChangePrice()" style="width:80px" size="mini" placeholder="请输入数量"></el-input></span>
                      <span>40GP ×  <el-input v-model="form.priceGp40" oninput = "value=value.replace(/[^\d]/g,'')" @blur="hadnleChangePrice()" style="width:80px" size="mini" placeholder="请输入数量"></el-input></span>
                      <span>40HQ ×  <el-input v-model="form.priceHq40" oninput = "value=value.replace(/[^\d]/g,'')" @blur="hadnleChangePrice()" style="width:80px" size="mini" placeholder="请输入数量"></el-input></span>
                      <span>45HQ ×  <el-input v-model="form.priceHq45" oninput = "value=value.replace(/[^\d]/g,'')" @blur="hadnleChangePrice()" style="width:80px" size="mini" placeholder="请输入数量"></el-input></span>
                      <span>20NOR ×  <el-input v-model="form.priceNor20" oninput = "value=value.replace(/[^\d]/g,'')" @blur="hadnleChangePrice()" style="width:80px" size="mini" placeholder="请输入数量"></el-input></span>
                      <span>40NOR ×  <el-input v-model="form.priceNor40" oninput = "value=value.replace(/[^\d]/g,'')" @blur="hadnleChangePrice()" style="width:80px" size="mini" placeholder="请输入数量"></el-input></span>
                  </div>
                  <div class="right">
                      <span>合计
                            <span v-for="(value, key) in totalObject" :key="key">
                                {{value[0]}}{{value[1]}}<span v-if="totalObject.size-1>key">+</span> 
                            </span>   
                      </span>
                  </div>
              </div>
              <p class="fee-tip-txt">费用说明：实际费用以最终账单为准， 该费用不含后程限重费用</p>
            </div>
        </div>
        <div class="bottom">
            <ul class="left">
                <li>创建人：{{createItem.createdName}} 
                    <span>{{createItem.createdTime}} </span>
                </li>
                <li>维护人：{{createItem.maintainerName}}  </li>
                <!-- <li>上次修改人： {{createItem.updatedName}} 
                    <span>   {{createItem.updatedTime}}</span>
                </li> -->
                <li>发布日期： 
                    <span>{{createItem.publishTime}}</span>
                </li>
            </ul>
            <div class="right">
                 <!-- <el-button size="small" type="primary" @click="$router.push('/charge/chargeSearch/seaFreightPrice')">
                    <i class="el-icon-sold-out"></i> 生成报价单
                 </el-button> -->
                 <!-- <el-button size="mini" type="primary" @click="handleCreate" v-if="createItem.state === 'valid'">
                    <i class="el-icon-plus"></i>生成订单
                 </el-button> -->
            </div>
        </div>
    </div>
    <!-- 生成订单弹窗 -->
    <div v-if="createOrderPopShow">
      <CreateOrder :routeId="routeId" :isFeederRoute="isFeederRoute" @close="createOrderPopClose" />
    </div>
    <div class="water-mark-box"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { routeInfo } from '@/api/charge/route'
import { orderChargeCreate } from '@/api/order/list'
import CreateOrder from '../components/createOrder'
import { employeeInfo } from '@/api/base'
import watermark from '@/utils/watermark'
import clip from '@/utils/clipboard'
import clipboard from '@/directive/clipboard/index.js'
import { getDictLabel } from '@/utils/tools'

export default {
    name:"seaFreighDetail",
    mixins: [routerMixin],
    directives: {
      clipboard
    },
    data() {
      return {
        tabledata:{},
        createOrderPopShow:false,
        routeId:0,
        oQuery: this.$route.query,
        createItem:{
           routeId:undefined,
           feederRouteId:undefined,
           feederOceanFreight:'',
           mainOceanFreight:''
        },
        USD:'',
        CNY:'',
        form:{
            priceGp20:"",
            priceGp40:"",
            priceHq40:"",
            priceHq45:"",
            priceNor20:"",
            priceNor40:""
        },
        //合计数量
        totalObject:undefined,
        tabData:[
            {lable:'20 GP',prop:'priceGp20',propDesc:"priceGp20Desc",mainRoutePrice:"mainRoutePriceGp20Desc"},
            {lable:'40 GP',prop:'priceGp40',propDesc:"priceGp40Desc",mainRoutePrice:"mainRoutePriceGp40Desc"},
            {lable:'40 HQ',prop:'priceHq40',propDesc:"priceHq40Desc",mainRoutePrice:"mainRoutePriceHq40Desc"},
            {lable:'45 HQ',prop:'priceHq45',propDesc:"priceHq45Desc",mainRoutePrice:"mainRoutePriceHq45Desc"},
            {lable:'20 NOR',prop:'priceNor20',propDesc:"priceNor20Desc",mainRoutePrice:"mainRoutePriceNor20Desc"},
            {lable:'40 NOR',prop:'priceNor40',propDesc:"priceNor40Desc",mainRoutePrice:"mainRoutePriceNor40Desc"},
        ],
        tableData: [],
        tableDataList:[],
        employeeInfo: {},
      }
    },
    components: {
        CreateOrder
    },
    activated() {
        console.log(!this.$route.meta.isUseCache)
        // 非缓存重新请求数据
        if (!this.$route.meta.isUseCache) {
            this.form = Object.assign({}, {
                priceGp20:"",
                priceGp40:"",
                priceHq40:"",
                priceHq45:"",
                priceNor20:"",
                priceNor40:""
            }),
            this.getInfo()
        }
    },
    created(){
        this.createItem.routeId = this.$route.query.routeId
        this.createItem.feederRouteId = this.$route.query.feederRouteId
        this.getInfo()
    },
    computed: {
      ...mapState({
        dictMap: state => state.dict.dictMap
      })
    },
    methods:{
      getFieldLabel(key, val) {
        return getDictLabel(key, val)
      },
      // 出单方式字典转中文
      issueWayText(val) {
        let str = ''
        let labelArr = []
        if (val) {
          let valArr = val.split(',')
          labelArr = this.dictMap.chargeIssueWay.filter(item => valArr.includes(item.value)).map(item => item.label)
          str = labelArr.toString()
        }
        return str
      },
      getEmployeeInfo (employeeId) {
        if (!employeeId) {
          this.employeeInfo = {}
        } else {
          employeeInfo({ employeeId }).then((res) => {
            this.employeeInfo = res.data
          })
        }
      },
        hadnleChangePrice(){
            //计算海运费 
            let totalObject=new Map();
            this.getPriceAmount(totalObject,"priceGp20");
            this.getPriceAmount(totalObject,"priceGp40");
            this.getPriceAmount(totalObject,"priceHq40");
            this.getPriceAmount(totalObject,"priceHq45");
            this.getPriceAmount(totalObject,"priceNor20");
            this.getPriceAmount(totalObject,"priceNor40");
            //计算附加费
            if(this.createItem.surchargeList&&this.createItem.surchargeList.length>0){
                    //箱型计费附加费
                    let containerTypeFreight=[];
                    //箱计费附加费
                    let containerFreight=[];
                    //票计费附加费
                    let orderFreight=[];
                    this.createItem.surchargeList.map(item=>{
                            if(item.rateUnit==='container_type'){
                                containerTypeFreight.push(item);
                            }else if(item.rateUnit==='unit'){
                                containerFreight.push(item);
                            }else if(item.rateUnit==='bill'){
                                orderFreight.push(item);
                            }
                    })
                    //计算按箱附加费
                    this.caculateContainer(totalObject,containerFreight)
                    //计算按票附加费
                    this.caculateOrder(totalObject,orderFreight)
                    //计算按箱型附加费
                    this.caculateContainerType(totalObject,containerTypeFreight)
            }
            this.totalObject=totalObject
        },
        caculateContainer(totalObject,containerFreight){
            if(containerFreight&&containerFreight.length>0){
                let totalContainerNum=(this.form.priceGp20?parseInt(this.form.priceGp20):0)+(this.form.priceGp40?parseInt(this.form.priceGp40):0)+(this.form.priceHq40?parseInt(this.form.priceHq40):0)+(this.form.priceHq45?parseInt(this.form.priceHq45):0)
                +(this.form.priceNor20?parseInt(this.form.priceNor20):0)+(this.form.priceNor40?parseInt(this.form.priceNor40):0)
                containerFreight.map(item=>{
                    let amount=totalObject.get(item.currency);
                    totalObject.set(item.currency,amount?parseFloat(item.price)*totalContainerNum+amount:parseFloat(item.price)*totalContainerNum)
                })
            }
        },
        caculateOrder(totalObject,orderFreight){
            if(orderFreight&&orderFreight.length>0){
               orderFreight.map(item=>{
                    let amount=totalObject.get(item.currency);
                    totalObject.set(item.currency,amount?parseFloat(item.price)+amount:parseFloat(item.price))
               })
            }
        },
        caculateContainerType(totalObject,containerTypeFreight){
            if(containerTypeFreight&&containerTypeFreight.length>0){
               containerTypeFreight.map(item=>{
                    this.getContainerTypeAmount(totalObject,"priceGp20",item);
                    this.getContainerTypeAmount(totalObject,"priceGp40",item);
                    this.getContainerTypeAmount(totalObject,"priceHq40",item);
                    this.getContainerTypeAmount(totalObject,"priceHq45",item);
                    this.getContainerTypeAmount(totalObject,"priceNor20",item);
                    this.getContainerTypeAmount(totalObject,"priceNor40",item);
               })
            }
        },
        getContainerTypeAmount(totalObject,priceType,item){
            if(this.form[priceType]){
                if(item[priceType]){
                    let amount=totalObject.get(item.currency);
                    totalObject.set(item.currency, amount?parseFloat(amount)+parseFloat(item[priceType])*this.form[priceType]:item[priceType]*this.form[priceType])
                }
           }
        },
        getPriceAmount(totalObject,priceType){
            if(this.form[priceType]){
                if(this.createItem.mainOceanFreight.length>0){
                  this.createItem.mainOceanFreight.map(item=>{
                    if(item[priceType]){
                     let amount=totalObject.get(item.currency);
                    totalObject.set(item.currency, amount?parseFloat(amount)+parseFloat(item[priceType])*this.form[priceType]:item[priceType]*this.form[priceType])
                   }
                  })
                }
                if(this.createItem.feederOceanFreight&&this.createItem.feederOceanFreight[priceType]){
                    let amount=totalObject.get(this.createItem.feederOceanFreight.currency);
                    totalObject.set(this.createItem.feederOceanFreight.currency, amount?parseFloat(amount)+parseFloat(this.createItem.feederOceanFreight[priceType])*this.form[priceType]:this.createItem.feederOceanFreight[priceType]*this.form[priceType])
                }
           }
        },

        // 详情
        getInfo() {
            routeInfo({routeId: Number(this.$route.query.routeId),feederRouteId:Number(this.$route.query.feederRouteId)}).then(response => {
                this.createItem = response.data
                let {feederPolCname = '', feederPolEname = ''} = this.$route.query
                if (feederPolCname || feederPolEname) {
                  Object.assign( this.createItem, {feederPolCname, feederPolEname})
                }
                this.tableData=this.createItem.surchargeList
                this.tableDataList = response.data.freightInfoDtoList
                this.tableData.map(item=>{
                    if(item.rateUnit==='unit'){
                        item.priceGp20=item.price
                        item.priceGp40=item.price
                        item.priceHq40=item.price
                        item.priceHq45=item.price
                        item.priceNor20=item.price
                        item.priceNor40=item.price
                    }
                })
            })
        },
        // 新建订单关闭回调
        createOrderPopClose(action, value, includeFeederType) {
            this.createOrderPopShow = false
            if (action === 'Confirm') {
                this.handleCreateOrder(value, includeFeederType)
            }
        },
        // 新建订单保存
        handleCreateOrder(value, includeFeederType) {
            Object.assign(value, {
                routeId: this.createItem.routeId,
                feederRouteId: this.createItem.feederRouteId
            })
            delete(value.sailingDate)
            orderChargeCreate(value).then(res => {
                let {orderNo, serviceType} = res.data
                // let path = '/order/order/orderDetail?orderNo=' + orderNo
                sessionStorage.setItem('createOrderStr', JSON.stringify(res.data))
                this.isJumpRouteFromPage = true
				// this.$router.push({
				// 	name: 'OrderDetail',
				// 	params: {
				// 		orderNo
				// 	},
				// 	query: Object.assign({
				// 		orderNo,
				// 		source: 'seaFreightDetail',
				// 		action: 'add',
				// 		includeFeeder: includeFeederType,
				// 		showContainer: !['st03', 'st04'].includes(serviceType),
                //         showBl: ['st01', 'st03'].includes(serviceType),
				// 	}, this.$route.query)
                // })
                let routeUrl = this.$router.resolve({
					name: 'OrderDetail',
					params: {
						orderNo
					},
					query: {
                        ...this.$route.query,
						orderNo,
						source: 'seaFreightDetail',
						action: 'add',
						includeFeeder: includeFeederType,
						showContainer: !['st03', 'st04'].includes(serviceType),
						showBl: ['st01', 'st03'].includes(serviceType)
					}
				})
				window.open(routeUrl.href, '_blank')
            })
        },
        // 生成订单 
        handleCreate(row) {
            this.createOrderPopShow = true
            this.routeId = this.createItem.routeId
            this.isFeederRoute = this.createItem.feederPolCode ? 'y' : 'n'
        },
        // 渲染水印
        reloadWathermark () {
          // 删除之前的水印
          document.querySelector('.water-mark-box').innerHTML = ''
          // 重新渲染水印
          let userInfo = this.$store.state.user.userInfo
          let { deptName, userName, mobileNo = '', employeeNo } = userInfo
          let text = `${userName}_${employeeNo}`
          watermark({
            watermark_txt: text, 
            className:'water-mark-box', 
            watermark_zindex: 6, 
          })
        },
        handleCopy(e) {
          let fieldStr = ''
          if (!this.tableData.length) {
            return this.$message.error('暂无附加费可复制')
          } else {
						this.tableData.map(item => {
							fieldStr += item['chargeName'] + '(' + item['chargeCode'] + ')：'
							if (item['rateUnit'] == 'container_type') {
								fieldStr += (item['priceGp20'] ? item['priceGp20'] : '-') + '/'
								fieldStr += (item['priceGp40'] ? item['priceGp40'] : '-') + '/'
								fieldStr += (item['priceHq40'] ? item['priceHq40'] : '-') + '/'
								fieldStr += (item['priceHq45'] ? item['priceHq45'] : '-') + '/'
								fieldStr += (item['priceNor20'] ? item['priceNor20'] : '-') + '/'
								fieldStr += item['priceNor40'] ? item['priceNor40'] : '-'
							} else {
								fieldStr += item['price']
							}
							fieldStr += '(' + item['currency'] + ')\n'
            })
            clip(fieldStr, e)
					}
        },
        clipboardSuccess() {
        this.$message({
          message: '复制成功',
          type: 'success',
          duration: 1500
        })
      },
    },
    mounted() {
    // 初始化水印
      this.reloadWathermark()
      // 监听缩放重新渲染水印
      window.addEventListener('resize', this.reloadWathermark)
    },
    beforeDestroy () {
      window.removeEventListener('resize', this.reloadWathermark)
    },
}
</script>

<style lang="scss" >
.eight-limit{
  padding: 8px 0;
  .text{
    // position: relative;
    // top:5px;
    display: flex;
    .icon-custView {
      margin-left: 2px;
      margin-top: 0;
      height: 14px;
      width: 14px;
      background: url('../../../../../assets/icon-custView.png') center center no-repeat;
      background-size: cover;
      cursor: pointer;
    }
  }
}
.eight-weight-limit{
  margin-top:-12px;
  margin-left:92px
}
.eight-weight-group{
  margin-top:-16px;
  margin-left:92px
}
.weight-group{
  overflow: hidden;
  .last-flag+div{
    clear:left;
  }
  div,p {
    line-height: 20px;
    margin:0
  }
  div{
    float:left;
    padding-right: 10px;
  }
  .weight{
    display: inline-block;
    min-width:310px;
    p{
      margin-bottom:0px;
    }
  }  
}
.seaFreightDetail{
  padding:10px;
  .components-containe {
    padding:10px 2%;
    background-color: #fff;
    .state-row{
        line-height: 28px;
        padding: 6px 10px;
        overflow: hidden;
        display: flex;
        border-bottom: 1px solid #D9D9D9;
        .fl{
            font-size: 12px;
            color: #dd0000;
            margin-right: 10px;
        }
        .btn{
            float: right;
            padding: 2px 5px;
        }
        &.invalid{
            background-color: rgba(230, 57, 35, 0.1);
        }
        .left-cnt{
          font-weight: bold;
          color: #222222;
          flex: 1
        }
        .right-cnt{

        }
    }
    .head{
      border-bottom: 1px solid #E9E9E9;
      padding: 18px 0 12px;
      .btn{
        // position: absolute;
        float:right
      }
      .title{
        font-size: 20px;
        color: #222222;
        display: flex;
        justify-content: center;
        span{
          font-weight: 600;
        }
        .action{
          display: block;
        }
        .center{
          position: relative;
          font-size: 15px;
          padding: 0px 32px 2px;
          color: #BFBFBF;
          border-bottom: 2px solid #BFBFBF;
          margin: 8px 18px;
          .triangle-bottomleft {
            width: 0;
            height: 0;
            position: relative;
            right: -32px;
            top:-3px;
            border-bottom: 4px solid #BFBFBF;
            border-right: 24px solid transparent;
          }
        }
      }
    }
    .content{
      margin-top: 10px;
      .grid-content {
        position: relative;
        // margin-top:10px;
        min-height: 56px;
        background: #3E80F5;
        border-radius: 2px;
        .left{
          width: 48px;
          position: absolute;
          left: 5px;
          top: 5px;
          padding: 7px 8px 10px 8px;
          //white-space:normal;//设置文字换行
          word-wrap : break-word;//设置数字强制换行
          border-radius: 4px;
          background: rgba(255,255,255, 0.1);
          text-align: center;
          span{
            font-size: 13px;
            font-weight: 600;
            color: #fff;
          }
        }
        .right{
          position: absolute;
          top:5px;
          left: 64px;
          width: 72%;
          font-size: 12px;
          p{
            color: #fff;
            line-height: 120%;
          }
          .icon{
            color: #FFFFFF;
            opacity: 0.5;
          }
        }
      }
      .el-col-customer-padding{
        // height:18px;
        padding-top:2px;
      }
      .detail{
        margin-bottom: 10px;
        display: flex;
        span:first-child{
          color: #4A4A4A;
          width: 90px;
          text-align: right;
          line-height: 14px;
          &.red{
            color: #CD4130;
          }
          .span-custView{
            display: flex;
            justify-content: flex-end;
            line-height: 14px;
            .icon-custView {
              margin-left: 2px;
              margin-top: 0;
              height: 14px;
              width: 14px;
              background: url('../../../../../assets/icon-custView.png') center center no-repeat;
              background-size: cover;
              cursor: pointer;
            }
          }
          
        }
        pre{
          margin-left: 8px;
          width: calc(100% - 98px);
          white-space: pre-wrap;
          word-wrap: break-word;
          border: 1px solid #dedede;
          background-color: #F3F3F3;
          padding: 4px;
          border-radius: 2px;
          line-height: 1.5;
          font-size: 12px;
          font-family: 'Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif';
        }
      }
      .cost-table{
        border-radius: 2px;
        border: 1px solid #D9D9D9;
        margin-top: 20px;
        h3{
          color: #222222;
        }
        .discopy{
          user-select: none;
          padding: 10px;
        }
        .tit-row {
          height: 40px;
          background: #EBEEF3;
          margin-bottom: 0;
          display: flex;
          font-size: 12px;
          font-weight: 600;
          line-height: 40px;
          padding: 0 10px;
          justify-content: space-between;
          .tit {
            display: flex;
            .icon-custView {
              margin-left: 2px;
              margin-top: 13px;
              height: 14px;
              width: 14px;
              background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAO1QTFRFAAAAVar/SZL/QIr/PoL5Q4X5QYH4P4H1P4D2P4H3P4D2P4D2PoD2P4D2PoD1PoH2P4D2P4H2PoD1RIP1R4b1SIb1Sof1Soj1S4j1TIn1UIv1UIz1UYz2Uo32U432U472WpL1W5P2XZT2bp/3b6D3gKv4gaz4gqz4hq/4ibH4irL4i7L5mLv5utL7u9L7vNP7wNb7wdb7xtr8yNv8ydv8zN38zd78z9/80eH81OP81eP81uT81+X82+f93Oj93+n94Ov94uz94+395O396fH96vH96/L97PL+7PP+8PX+8fb+8/f+9fj+9fn+////yUICdwAAABJ0Uk5TAAYHGC0uR4KVlr/H2ePx8vP009oDlQAAAWtJREFUOMuNU2lbwjAMLoe7GHMUD44xPFEBUVRQQQVxMhXI//850m7JGMMH3y9NmzR5czFGSCmaYdq2aWhKiiWR0S1OsPTMmjqtFngMBTUd+57jCeRWnOzkw8fmYL4YtMJLPkv/Q32lBxL9amgR+kij/x54Dafa8KCPUQIeani9gs+yOEseYBRVBkD+z3ARCOcwxFxEEB1pz8EJucAC3/Rl/ayEQTUysFJMocQ3hOBcYRrJG0hyrjEjql0izSUMZkaXo1G8UAIms1EstmdCG5VawiYDZ7j82jrZ525n6ndcNNjFEI4HkzMh1L6Fnx+XQgQkiy/wVJLSNdzX3Tu4IZJBmm2YHAYvU6hz7sIXpSkLdTCDU75iUAOfCiVLfQk9ZCVDvMEtlVo2qwtNNAhIwqiMzZLtfodjytzt+H73A17L2G4xMAvYi09sZQyPODDRyMUshg80cjS068hnEmMf12f/vzjbV2/78v69/r/qN1YXrBNJ4wAAAABJRU5ErkJggg==) center center no-repeat;
              background-size: cover;
              cursor: pointer;
            }
          }
          .btn-copyField {
            width: 56px;
            height: 28px;
            background: #3E80F5;
            border-radius: 2px;
            text-align: center;
            color: #FFFFFF;
            line-height: 28px;
            margin-top: 6px;
            cursor: pointer;
          }
        }
        .cost-money{
          margin: 0 10px;
          background-color: #E7EEFF;
          min-height: 32px;
          position: relative;
          display: flex;
          .left{
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            left: 0px;
            padding: 6px;
            border-right: 1px solid #dfe6ec;
            span{
              margin-right: 32px;
            }
          }
          .right{
            display: flex;
            position: absolute;
            right: 0px;
            span{
              font-size: 14px;
              padding: 8px;
              color:#4A4A4A;
              font-weight: 600;
            }
          }
        }
        .fee-tip-txt {
          color:#BFBFBF;
          margin: 5px 10px;
        }
      }
    }
    .bottom{
      position: relative;
      margin-top: 50px;
      min-height: 40px;
      ul,
      li{
        list-style: none; 
      }
      ul{
        position: absolute;
        left: 0;
        display: flex;
        line-height: 28px;
        li{
          padding-right: 64px;
        }
      }
      .right{
        position: absolute;
        right: 0;
      }
    }
    th{
      height: 6px;
      .cell{
        color:#222222;
        padding: -5px;
      } 
    } 
    td .cell{
      color:#4A4A4A;
    }
    .content-container-type{
      user-select: none;
      td {
        border-right: 1px solid #dfe6ec !important;
      }
    } 
  }
  .current{
    text-align: center;
    .item {
      font-size:14px; 
      color:#BFBFBF;
      line-height: 18px;
      .icon-custView {
        margin-left: 2px;
        margin-top: 0;
        height: 14px;
        width: 14px;
        background: url('../../../../../assets/icon-custView.png') center center no-repeat;
        background-size: cover;
        cursor: pointer;
        vertical-align: middle;
      }
    }
  }
  // el-form组件内label及内容区，各类输入框，行高和高度，
  .el-form-item__label {
    height: 20px !important;
    line-height: 20px !important;
    padding-right: 4px;
  }
  // 不能粗暴的设置.el-form-item__content高度20px, 因为存在多行或者文件上传的情况
  .el-form-item__content {
    line-height: 20px !important;
  }
  .el-input--mini .el-input__icon{
    line-height: 20px;
  }
  // .el-form .is-required {
  //     label::before{
  //         display: none;
  //     }
  //     input, select, textarea, .el-date-editor--daterange{
  //         background: #fef5f4;
  //     }
  //     .is-disabled {
  //         input, select, textarea, .el-date-editor--daterange{
  //             background: #F5F7FA;
  //         }
  //     }
  // }
  .el-input--mini .el-input__inner{
    line-height: 20px;
    height: 20px;
  }
  .stop-box {
    height: 30px;
    background-color: rgb(255,244,242);
    color: rgb(205,65,48);
    display: flex;
    align-items: center;
    padding: 0 10px;
    .icon{
      width: 16px;
      height: 16px;
      line-height: 16px;
      text-align: center;
      border-radius: 2px;
      background-color:rgb(205,65,48);
      color: #fff;
      margin-right: 10px;
    }
  }
}
</style>

<style scoped lang="scss">
.popover-class{
  display: flex;
  align-items: center;
  .el-icon-postcard {
    font-size: 14px;
    margin-left: 5px;
    cursor: pointer;
    color: #409eff;
  }
}
.employeeName-list {
  font-size: 12px;
}
</style>
