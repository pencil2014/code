<template>
  <div class="tableData">
    <!-- 订舱 -->
    <div id="DC" class="item" v-if="serviceInfo.containers && (serviceList.includes('book') || serviceList.includes('proxy_book'))">
       <div class="header dz">
         <div class="service">
            <span class="name">订舱</span>
            <span class="finsh-status" v-if="bookedStatus">
              <i class="el-icon-check"></i>
              已放舱
            </span>
         </div>
          <i class="el-icon-arrow-right icon-class" @click="goRouter('OrderBook')"></i>
       </div>
       <div class="content">
         <div class="info dc-info">
          <div class="content-item">
            <span class="key">驳船船名/航次：</span>
            <span class="value">{{ getNameGrounp(barge.vessel, barge.voyage) }}</span>
          </div>
          <div class="content-item">
            <span class="key">船公司：</span>
            <span class="value">{{ ship.shipCarrierCode }}</span>
          </div>
          <div class="content-item marginTop8">
            <span class="key">大船船名/航次：</span>
            <span class="value">{{ getNameGrounp(ship.vessel, ship.voyage) }}</span>
          </div>
          <div class="content-item marginTop8">
            <span class="key">订舱代理：</span>
            <span class="value">{{ ship.bkgAgentSupplierName }}</span>
          </div>
         </div>
         <div class="table">
          <el-table
            :data="showContainersList"
            border
            style="width: 100%">
            <el-table-column
              prop="containerType"
              label="箱型">
            </el-table-column>
            <el-table-column
              prop="cn"
              label="箱号">
            </el-table-column>
            <el-table-column
              prop="sn"
              label="封号">
            </el-table-column>
            <el-table-column
              prop="so"
              label="SO号">
            </el-table-column>
          </el-table>
          <div class="more-class" v-if="serviceInfo.containers.length > this.initLong">
            <el-button v-if="longSetObj.containers === this.initLong" type="default" size="mini" @click="btnClick('containers', 'more')">查看更多</el-button>
            <el-button v-else type="default" size="mini" @click="btnClick('containers', 'less')">收起</el-button>
          </div>
         </div>
       </div>
    </div>
    <!-- 起运港拖柜 -->
    <div id="QYGTG" class="item" v-if="serviceInfo.fclTrucks && serviceList.includes('truck')">
       <div class="header tg">
         <div class="service">
            <span class="name">起运港拖柜</span>
            <span class="finsh-status" v-if="serviceStatusIsFinish('truck')">
              <i class="el-icon-check"></i>
              已完成
            </span>
         </div>
          <i class="el-icon-arrow-right icon-class"  @click="goRouter('ShippingTruck')"></i>
       </div>
       <div class="content">
         <div class="info">
          <!-- <div class="content-item">
            <span class="key">提空地点：</span>
            <span class="value">0847/AUT</span>
          </div> -->
          <div class="content-item">
            <span class="key">拖车行：</span>
            <span class="value" v-if="fclTrucksData[0]">{{fclTrucksData[0].supplierName}}</span>
          </div>
         </div>
         <div class="table">
          <el-table
            :data="fclTrucksData"
            border
            style="width: 100%">
            <el-table-column
              prop="intrustNo"
              label="委托编号">
            </el-table-column>
            <el-table-column
              prop="intrustStatus"
              label="委派状态">
              <template slot-scope="{row}">
                <div :class="getClassName(row.intrustStatus, ['intrusted'], ['unintrust','undispatch'],['dispatched'])">{{ row.intrustStatus | getDictLabelFilter('truckIntrustStatus')}}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="preBoxTime"
              width="150"
              label="委托装柜时间">
            </el-table-column>
            <el-table-column
              prop="boxTime"
              width="150"
              label="实际到场时间">
            </el-table-column>
            <el-table-column
              prop="driverName"
              label="司机">
            </el-table-column>
            <el-table-column
              prop="driverPhone"
              label="司机电话">
            </el-table-column>
            <el-table-column
              prop="licensePlate"
              label="车牌号">
            </el-table-column>
          </el-table>
         </div>
       </div>
    </div>
    <!-- 起运港散车 -->
     <div id="QYGSC" class="item" v-if="serviceInfo.scatterTrucks && serviceList.includes('pol_ltl')">
       <div class="header tg">
         <div class="service">
            <span class="name">起运港散车</span>
            <span class="finsh-status" v-if="serviceStatusIsFinish('pol_ltl')">
              <i class="el-icon-check"></i>
              已完成
            </span>
         </div>
          <i class="el-icon-arrow-right icon-class" @click="goRouter('PolLtl')"></i>
       </div>
       <div class="content">
         <div class="info">
          <div class="content-item">
            <span class="key">拖车行：</span>
            <span class="value" v-if="scatterTrucksData[0]">{{scatterTrucksData[0].supplierName}}</span>
          </div>
         </div>
         <div class="table">
          <el-table
            :data="scatterTrucksData"
            border
            style="width: 100%">
            <el-table-column
              prop="intrustNo"
              label="委托编号">
            </el-table-column>
            <el-table-column
              prop="intrustStatus"
              label="委派状态">
              <template slot-scope="{row}">
                <div :class="getClassName(row.intrustStatus, ['intrusted'], ['unintrust','undispatch'],['dispatched'])">{{ row.intrustStatus | getDictLabelFilter('truckIntrustStatus')}}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="preBoxTime"
              width="150"
              label="委托装货时间">
            </el-table-column>
            <el-table-column
              prop="boxTime"
              width="150"
              label="实际到场时间">
            </el-table-column>
            <el-table-column
              prop="driverName"
              label="司机">
            </el-table-column>
            <el-table-column
              prop="driverPhone"
              label="司机电话">
            </el-table-column>
            <el-table-column
              prop="licensePlate"
              label="车牌号">
            </el-table-column>
          </el-table>
         </div>
       </div>
    </div>
    <!-- 起运港仓储 -->
     <div id="QYGCC" class="item" v-if="serviceInfo.warehouseInOutVos && serviceList.includes('pol_warehouse')">
       <div class="header tg">
         <div class="service">
            <span class="name">起运港仓储</span>
            <span class="finsh-status" v-if="serviceStatusIsFinish('pol_warehouse')">
              <i class="el-icon-check"></i>
              已完成
            </span>
         </div>
          <i class="el-icon-arrow-right icon-class" @click="goRouter('Warehouse')"></i>
       </div>
       <div class="content">
         <div class="table">
          <el-table
            :data="serviceInfo.warehouseInOutVos"
            border
            style="width: 100%">
            <el-table-column
              prop="planNo"
              label="计划编号">
            </el-table-column>
           <el-table-column
              prop="inoutType"
              label="类型">
              <template slot-scope="{row}">
                <div :class="getClassName(row.inoutType, ['out'],[],['in'])">{{ row.inoutType === 'in' ? '进仓' : row.inoutType === 'out' ? '出仓' : ''}}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="planEnterTime"
              width="150"
              label="预计进出仓时间">
              <template slot-scope="{row}">
                <div>{{ row.planEnterTime || row.planOutTime}}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="realEnterTime"
              width="150"
              label="实际进出仓时间">
              <template slot-scope="{row}">
                <div>{{ row.realEnterTime || row.realOutTime}}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="warehouseName"
              label="仓库">
            </el-table-column>
            <el-table-column
              prop="planTotalQuantity"
              label="预计总件数">
            </el-table-column>
             <el-table-column
              prop="realTotalQuantity"
              label="实际总件数">
            </el-table-column>
          </el-table>
         </div>
       </div>
    </div>
    <!-- 起运港报关 -->
     <div id="QYGBG" class="item" v-if="serviceInfo.customsVos && serviceList.includes('pol_declaration') && (!polDeclarationArr.length || polDeclarationArr.includes('pol_declaration'))">
       <div class="header bg">
         <div class="service">
            <span class="name">起运港报关</span>
            <span class="finsh-status" v-if="serviceStatusIsFinish('pol_declaration')">
              <i class="el-icon-check"></i>
              已完成
            </span>
         </div>
          <i class="el-icon-arrow-right icon-class" @click="goRouter('Clearance')"></i>
       </div>
       <div class="content">
         <div class="info">
          <div class="content-item">
            <span class="key">报关方式：</span>
            <span class="value" v-if="serviceInfo.customsVos[0]">{{ serviceInfo.customsVos[0].customsType | getDictLabelFilter('customsType')}}</span>
          </div>
          <div class="content-item">
            <span class="key">报关行：</span>
            <span class="value" v-if="serviceInfo.customsVos[0]">{{ serviceInfo.customsVos[0].customsSupplierName}}</span>
          </div>
         </div>
         <div class="table">
          <el-table
            :data="serviceInfo.customsVos"
            border
            style="width: 100%">
            <el-table-column
              prop="intrustNo"
              label="报关委托单号">
            </el-table-column>
            <el-table-column
              prop="intrustStatus"
              label="报关状态">
              <template slot-scope="{row}">
                <div :class="getClassName(row.intrustStatus, ['intrusted'],['to_intrust'],[])" >{{row.intrustStatus | getDictLabelFilter('customsIntrustStatus')}}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="customsDeclarationCount"
              label="报关委托单数量">
            </el-table-column>
            <el-table-column
              prop="intrustTime"
              width="150"
              label="预计报关时间">
            </el-table-column>
            <el-table-column
              prop="releaseTime"
              width="150"
              label="报关放行时间">
            </el-table-column>
          </el-table>
         </div>
       </div>
    </div>
    <!-- 起运港报检 -->
     <div id="QYGBJ" class="item" v-if="serviceInfo.inspectionVos && serviceList.includes('pol_declaration') && polDeclarationArr.includes('pol_inspection')">
       <div class="header bg">
         <div class="service">
            <span class="name">起运港报检</span>
            <span class="finsh-status"  v-if="serviceStatusIsFinish('pol_declaration')">
              <i class="el-icon-check"></i>
              已完成
            </span>
         </div>
          <i class="el-icon-arrow-right icon-class" @click="goRouter('Clearance')"></i>
       </div>
       <div class="content">
         <div class="table">
          <el-table
            :data="serviceInfo.inspectionVos"
            border
            style="width: 100%">
            <el-table-column
              prop="intrustNo"
              label="报检委托单号">
            </el-table-column>
            <el-table-column
              prop="status"
              label="报检状态">
              <template slot-scope="{row}">
                <div :class="getClassName(row.status, ['intrust'],['init'],['finish'])">{{ row.status | getDictLabelFilter('inspectionStatus')}}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="inspectionSupplierName"
              label="报检公司">
            </el-table-column>
            <el-table-column
              prop="intrustTime"
              width="150"
              label="委托日期">
            </el-table-column>
            <el-table-column
              prop="inspector"
              label="报检员">
            </el-table-column>
            <el-table-column
              prop="inspectorPhone"
              label="报检员电话">
            </el-table-column>
          </el-table>
         </div>
       </div>
    </div>
    <!-- 提单 -->
     <div id="TD" class="item" v-if="serviceInfo.blVos && (serviceList.includes('book') || serviceList.includes('proxy_book'))">
       <div class="header td">
         <div class="service">
            <span class="name">提单</span>
         </div>
          <i class="el-icon-arrow-right icon-class" @click="goRouter('BlList')"></i>
       </div>
       <div class="content">
         <div class="table">
          	<el-table
              border
              style="width: 100%"
              row-key="blId"
              :data="serviceInfo.blVos"
              :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            >
            <el-table-column prop="blNo" label="提单号" >
              <template slot-scope="scope">
                <i class="icon-tdcg" v-if="scope.row.blMode === 'tdcg'">草</i>
                <i class="icon-hbl" v-if="scope.row.blType">{{ scope.row.blType === 'hbl' ? 'H' : 'M' }}</i>
                {{ scope.row.blNo }}
              </template>
            </el-table-column>
            <el-table-column prop="blMode" label="出单方式"  type="" width="150">
              <template slot-scope="scope">
                {{ scope.row.blMode | getDictLabelFilter('blMode') }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="草单确认"  type="" width="150">
              <template slot-scope="scope">
                <div class="column-text">
                  <span :class="{'success-color': scope.row.isDraftConfirm === 'y', 'err-color': scope.row.isDraftConfirm !== 'y'}">{{scope.row.isDraftConfirm === 'y' ? '已确认' : '未确认'}}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="siStatus" label="补料状态"  type="" width="120">
              <template slot-scope="scope">
                <div class="column-text">
                  <span v-if="['ship_import_fcl', 'ship_import_lcl'].includes(orderInfo.businessType)">--</span>
                  <span v-else-if="orderInfo.businessType === 'ship_export_fcl'">{{ scope.row.blType === 'hbl' ? '--' : scope.row.siStatus }}</span>
                  <div v-if="orderInfo.businessType === 'ship_export_lcl'">
                    <span	
                      v-if="scope.row.isDraftConfirm === 'y' && 
                            scope.row.siStatus === '未补料' &&
                            originalArr.includes(scope.row.blMode) && 
                            scope.row.blType === 'mbl'"
                    >
                      未补料
                    </span>
                    <span v-else-if="scope.row.siStatus && scope.row.blType === 'mbl' && scope.row.blMode !== 'telex_release'">{{ scope.row.siStatus }}</span>
                    <span v-else>--</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="客户同意"  type="" width="150">
              <template slot-scope="scope">
                <div class="column-text" v-if="scope.row.custClass === 'FOREIGN_PEER' && scope.row.blType === 'hbl' && originalArr.includes(scope.row.blMode)">
                  <span v-if="scope.row.isAgreeRelease === 'all'">已同意</span>
                  <span v-else-if="scope.row.isAgreeRelease === 'y'">同意寄单，同意放货</span>
                  <span v-else-if="scope.row.isAgreeRelease === 'e'">同意寄单，不同意放货</span>
                  <span v-else>未同意</span>
                </div>
                <div class="column-text" v-else>
                  <span v-if="scope.row.blMode === 'tdcg'">--</span>
                  <span v-else-if="scope.row.isAgreeRelease === 'y'">已同意</span>
                  <span  v-else>未同意</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="auditStatus" label="财务同意"  type="" width="120">
              <template slot-scope="scope">
                {{ $store.state.order.finAuditStatusOptions[scope.row.auditStatus] || '--' }}
              </template>
            </el-table-column>
            <el-table-column prop="takeStatus" label="正本取单状态"  type="" width="120">
              <template slot-scope="scope">
                <span v-if="scope.row.blMode === 'tdcg'">--</span>
                <span v-else-if="scope.row.takeStatus === 'finish'">已取单</span>
                <span v-else>未取单</span>
              </template>
            </el-table-column>
            <el-table-column class-name="bl-put-status" prop="putStatus" label="放单状态"  type="" width="120">
              <template slot-scope="scope">
                <span v-if="scope.row.blMode === 'tdcg'">--</span>
                <span
                  class="finish-color"
                  v-else-if="scope.row.blType === 'mbl' && scope.row.putStatus != 'finish' && scope.row.isUploadTelex != '0'"
                >已推送文件</span>
                <span
                  class="err-color"
                  v-else-if="scope.row.blType === 'hbl' && scope.row.putStatus != 'finish' && ((issueWay.includes(scope.row.blMode) && scope.row.isAgreeRelease === 'y') || ['ship_import_fcl', 'ship_import_lcl'].includes(orderInfo.businessType))"
                 > 未放单</span>
                 <span :class="{'success-color': scope.row.putStatus === 'finish', 'err-color': scope.row.putStatus !== 'finish'}" v-else>{{ scope.row.putStatus === 'finish' ? '已放单' : '未放单' }}</span>
              </template>
            </el-table-column>
          </el-table>
         </div>
       </div>
    </div>
    <!-- 目的港换单 -->
    <div id="MDGHD" class="item" v-if="serviceInfo.blExchangeVos && serviceList.includes('pod_change_doc')">
       <div class="header hd">
         <div class="service">
            <span class="name">目的港换单</span>
            <span class="finsh-status" v-if="serviceStatusIsFinish('pod_change_doc')">
              <i class="el-icon-check"></i>
              已完成
            </span>
         </div>
          <i class="el-icon-arrow-right icon-class" @click="goRouter('PodChangeDoc')"></i>
       </div>
       <div class="content">
         <div class="table">
          <el-table
            :data="serviceInfo.blExchangeVos"
            row-key="blId"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            border
            style="width: 100%">
            <el-table-column prop="blNo" label="提单号" >
              <template slot-scope="scope">
                <i class="icon-hbl" v-if="scope.row.blType">{{ scope.row.blType === 'hbl' ? 'H' : 'M' }}</i>
                {{ scope.row.blNo }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="换单状态" width="150">
              <template slot-scope="scope">
                <div :class="getClassName(scope.row.status, ['exchange'],['init'],['released','checked'])">{{ scope.row.exchangeStatus | getDictLabelFilter('exchangeStatus')}}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="overseasAgentName"
              label="海外代理/分公司">
              <template slot-scope="{row}">
                <div>{{ getNameGrounp(row.overseasAgentName, row.overseasCompanyName) }}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="exchangeCompleteTime"
              width="150"
              label="换单完成时间">
            </el-table-column>
          </el-table>
         </div>
       </div>
    </div>
    <!-- 目的港委托清关 -->
     <div id="MDGWTQG" class="item" v-if="serviceInfo.clearanceIntrustVos && serviceList.includes('pod_comm_clearance')">
       <div class="header qg">
         <div class="service">
            <span class="name">目的港委托清关</span>
            <span class="finsh-status" v-if="serviceStatusIsFinish('pod_comm_clearance')">
              <i class="el-icon-check"></i>
              已完成
            </span>
         </div>
          <i class="el-icon-arrow-right icon-class" @click="goRouter('PodCommClearance')"></i>
       </div>
       <div class="content">
         <div class="table">
          <el-table
            :data="serviceInfo.clearanceIntrustVos"
            border
            style="width: 100%">
            <el-table-column
              prop="intrustNo"
              label="清关单号">
            </el-table-column>
            <el-table-column
              prop="customsClearanceStatus"
              width="150"
              label="清关状态">
              <template slot-scope="{row}">
                <div :class="getClassName(row.customsClearanceStatus, ['intrust'],['init'],['finish'])">{{ row.customsClearanceStatus | getDictLabelFilter('podCommClearanceStatus')}}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="overSeaCompanyName"
              label="海外代理/分公司">
              <template slot-scope="{row}">
                {{ getNameGrounp(row.overSeaAgentName, row.overSeaCompanyName) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="customsClearanceType"
              width="150"
              label="清关方式">
              <template slot-scope="{row}">
                {{ row.customsClearanceType | getDictLabelFilter('podCommClearanceMode')}}
              </template>
            </el-table-column>
            <el-table-column
              prop="customsClearanceTime"
              width="150"
              label="预计清关时间">
            </el-table-column>
            <el-table-column
              prop="realCustomsClearanceTime"
              width="150"
              label="实际清关时间">
            </el-table-column>
          </el-table>
         </div>
       </div>
    </div>
    <!-- 目的港散车派送 -->
     <div id="MDGSCPS" class="item" v-if="serviceInfo.deliveryLtls && serviceList.includes('pod_ltl_delivery')">
       <div class="header sc">
         <div class="service">
            <span class="name">目的港散车派送</span>
            <span class="finsh-status" v-if="serviceStatusIsFinish('pod_ltl_delivery')">
              <i class="el-icon-check"></i>
              已完成
            </span>
         </div>
          <i class="el-icon-arrow-right icon-class" @click="goRouter('PodLtlDelivery')"></i>
       </div>
       <div class="content">
         <div class="table">
          <el-table
            :data="serviceInfo.deliveryLtls"
            border
            style="width: 100%">
            <el-table-column
              prop="intrustNo"
              label="委托编号">
            </el-table-column>
            <el-table-column
              prop="status"
              label="委派状态">
              <template slot-scope="{row}">
                <div :class="getClassName(row.status, ['intrust', 'dispatched'],['init'],['finish'])">{{ row.status | getDictLabelFilter('podDeliveryLtlStatus')}}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="overSeaAgentName"
              label="海外代理/分公司">
              <template slot-scope="{row}">
                {{ getNameGrounp(row.overseaAgentName, row.overseasCompanyName)}}
              </template>
            </el-table-column>
            <el-table-column
              prop="supplierName"
              label="车队">
            </el-table-column>
            <el-table-column
              prop="preLoadTime"
              width="150"
              label="预计派送时间">
            </el-table-column>
            <el-table-column
              prop="loadTime"
              width="150"
              label="实际派送时间">
            </el-table-column>
          </el-table>
         </div>
       </div>
    </div>
    <!-- 目的港拖柜派送 -->
     <div id="MDGTGPS" class="item" v-if="serviceInfo.deliveryFcls && serviceList.includes('pod_fcl_delivery')">
       <div class="header sc">
         <div class="service">
            <span class="name">目的港拖柜派送</span>
            <span class="finsh-status"  v-if="serviceStatusIsFinish('pod_fcl_delivery')">
              <i class="el-icon-check"></i>
              已完成
            </span>
         </div>
          <i class="el-icon-arrow-right icon-class" @click="goRouter('PodFclDelivery')"></i>
       </div>
       <div class="content">
         <div class="table">
          <el-table
            :data="serviceInfo.deliveryFcls"
            border
            style="width: 100%">
            <el-table-column
              prop="intrustNo"
              label="委托编号">
            </el-table-column>
            <el-table-column
              prop="status"
              label="委派状态">
              <template slot-scope="{row}">
                <div :class="getClassName(row.status,['dispatched', 'intrust'],['init'],['return','finish'])">{{ row.status | getDictLabelFilter('podDeliveryFclStatus')}}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="overseaAgentSupplierName"
              label="海外代理/分公司">
              <template slot-scope="{row}">
                {{ getNameGrounp(row.overseaAgentSupplierName, row.overseasCompanyName)}}
              </template>
            </el-table-column>
            <el-table-column
              prop="supplierName"
              label="车队">
            </el-table-column>
            <el-table-column
              prop="preDeliveryTime"
              width="150"
              label="预计派送时间">
            </el-table-column>
            <el-table-column
              prop="deliveryTime"
              width="150"
              label="实际派送时间">
            </el-table-column>
          </el-table>
         </div>
       </div>
    </div>
    <!-- 目的港仓储 -->
     <div id="MDGCC" class="item" v-if="serviceInfo.podWhInOutVos && serviceList.includes('pod_warehouse')">
       <div class="header sc">
         <div class="service">
            <span class="name">目的港仓储</span>
            <span class="finsh-status"  v-if="serviceStatusIsFinish('pod_warehouse')">
              <i class="el-icon-check"></i>
              已完成
            </span>
         </div>
          <i class="el-icon-arrow-right icon-class" @click="goRouter('PodWarehouseIng')"></i>
       </div>
       <div class="content">
         <div class="table">
          <el-table
            :data="serviceInfo.podWhInOutVos"
            border
            style="width: 100%">
             <el-table-column
              prop="planNo"
              label="计划编号">
            </el-table-column>
            <el-table-column
              prop="inoutType"
              width="80"
              label="类型">
              <template slot-scope="{row}">
                <div :class="getClassName(row.inoutType, ['out'],[],['in'])">{{ row.inoutType === 'in' ? '进仓' : row.inoutType === 'out' ? '出仓' : ''}}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="planEnterTime"
              width="150"
              label="预计进出仓时间">
              <template slot-scope="{row}">
                <div>{{ row.planEnterTime || row.planOutTime}}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="realEnterTime"
              width="150"
              label="实际进出仓时间">
              <template slot-scope="{row}">
                <div>{{ row.realEnterTime || row.realOutTime}}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="whName"
              label="仓库">
            </el-table-column>
            <el-table-column
              prop="planTotalQuantity"
              width="100"
              label="预计总件数">
            </el-table-column>
            <el-table-column
              prop="realTotalQuantity"
              width="100"
              label="实际总件数">
            </el-table-column>
            <el-table-column
              prop="planTotalWeight"
              width="100"
              label="预计总毛重">
            </el-table-column>
            <el-table-column
              prop="realTotalWeight"
              width="100"
              label="实际总毛重">
            </el-table-column>
            <el-table-column
              prop="planTotalVolume"
              width="100"
              label="预计总体积">
            </el-table-column>
            <el-table-column
              prop="realTotalVolume"
              width="100"
              label="实际总体积">
            </el-table-column>
          </el-table>
         </div>
       </div>
    </div>
    <allInfo :order-info="orderInfo" />
    <!-- 异常单 -->
    <div class="item" v-if="workExceptionData.length">
       <div class="header yc">
         <div class="service">
            <span class="name">异常单</span>
         </div>
          <i class="el-icon-arrow-right icon-class" @click="goRouter('WorkException')"></i>
       </div>
       <div class="content">
         <div class="table">
          <el-table
            :data="workExceptionData"
            border
            style="width: 100%">
             <el-table-column
              prop="excpNo"
              width="150"
              label="异常编号">
            </el-table-column>
             <el-table-column
              prop="serviceName"
              width="180"
              label="服务项">
            </el-table-column>
             <el-table-column
              prop="reasonTypeName"
              label="异常类型">
            </el-table-column>
             <el-table-column
              prop="reasonName"
              label="异常原因">
            </el-table-column>
             <el-table-column
              prop="isControl"
              width="80"
              label="是否可控">
              <template slot-scope="scope">
                {{ scope.row.isControl === 'Y' ? '是' : scope.row.isControl === 'N' ? '否' : ''}}
              </template>
            </el-table-column>
             <el-table-column
              prop="isCustComplain"
              width="100"
              label="是否客户投诉">
              <template slot-scope="scope">
                {{ scope.row.isCustComplain | getDictLabelFilter('yesOrNoOptions')}}
              </template>
            </el-table-column>
             <el-table-column
              prop="handleStatus"
              width="100"
              label="异常状态">
              <template slot-scope="scope">
                {{ scope.row.handleStatus | getDictLabelFilter('exceptionStatus')}}
              </template>
            </el-table-column>
          </el-table>
         </div>
       </div>
    </div>
  </div>
</template>

<script>
/* containers	集装箱信息
fclTrucks	整柜
scatterTrucks	散车
customsVos	报关
inspectionVos	报检
blExchangeVos	换单
clearanceIntrustVos	清关
deliveryFcls	目的港整车派
deliveryLtls	目的港散车
blVos	提单列表
warehouseInOutVos	起运港
podWhInOutVos	目的港仓储
*/
import { mapState } from 'vuex'
import { workExceptionList } from '@/api/order/workException'
import allInfo from './allInfo'
export default {
   props: {
    serviceInfo: {
      type: Object,
      default: () => {
        return {}
      }
    },
    orderInfo: {
      type: Object,
      default: () => {
        return {}
      }
    },
    checkpointList: {
      type: Array,
      default: () => {
        return []
      }
    },
    polDeclarationArr: {
      type: Array,
      default: () => {
        return []
      }
    },
   },
   components: { allInfo },
   data() {
    return {
      // 正本（邮寄的出单方式）:正本,借同行代理,HBL正本,同行借我司代理HBL正本
			originalArr: ['original', 'jthdlzb', 'thzb'],
      issueWay: ['telex_release', 'bill_at_destination', 'ibl', 'seaway_bill', 'jthdldf', 'free_telex_release'], // 该出单方式之一才可以更改放单状态
      initLong: 3,
      longSetObj: {
        containers: 3,
      },
      fclTrucksData: [],
      scatterTrucksData: [],
      workExceptionData: []
    }
   },
   watch: {
    // polDeclarationArr(val) {
    //    if (val.includes('pol_inspection')) {
    //     this.setScrollHeight()
    //    }
    // }
   },
   created() {
    //  if (this.serviceInfo.fclTrucks && this.serviceInfo.fclTrucks) {
    //    // 处理 起运港拖柜的数据
    //    this.getFclTrucksData()
    //    // 处理 起运港散车数据
    //    this.getScatterTrucksData()
    //  }
    //  this.getWorkExceptionList()
   },
   computed: {
     ...mapState({
      dictMap: state => state.dict.dictMap,
     }),
     barge() {
      return this.orderInfo.barge || {}
     },
     ship() {
      return this.orderInfo.ship || {}
     },
     serviceInfoList() {
      return this.orderInfo.serviceInfoList || []
     },
     serviceList() {
      return this.orderInfo.serviceList || []
     },
     selfOrder() {
      // 客户自订
      return ['st02', 'st16', 'st17', 'st04', 'st19', 'st12', 'st10'].includes(this.orderInfo.serviceType)
     },
     bookedStatus() {
       let obj = this.checkpointList.find(item => {
         return  item.pointCode === 'BOOK_RELEASE'
       })
       return !!(obj && obj.pointCode)
     },
     showContainersList() {
      // 订舱列表数据
      if (this.longSetObj.containers === this.initLong) {
         return (this.serviceInfo.containers || []).slice(0, this.longSetObj.containers)
      } else {
        return this.serviceInfo.containers
      }
      
     },
   },
   mounted() {
    // this.$nextTick(() => {
    //    this.setScrollHeight()
    // })
   },
   methods: {
     getWorkExceptionList() {
       let str = this.dictMap.exceptionStatus.map(item => {
          return item.value
         }).join(',')
      let data = {
        ascColumns: [],
        columns: [],
        currPage: 1,
        descColumns: ["startTime"],
        pageSize: 100,
        query: [
          { column: "orderNo", type: "like", value: this.$route.query.orderNo },
          { column: 'handleStatus', type: 'in', value: str }
        ]
      }
      workExceptionList(data)
      .then(res => {
        if (res.data.list) {
           this.workExceptionData = res.data.list
        }
      })
     },
     getScatterTrucksData() {
       this.serviceInfo.scatterTrucks.forEach((item1, index1) => {
         if (item1.truckLoads && item1.truckLoads.length) {
            item1.truckLoads.forEach((item2, index2) => {
                this.scatterTrucksData.push({
                  intrustNo: item1.intrustNo,
                  supplierName: item1.supplierName,
                  intrustStatus: item1.intrustStatus,
                  boxTime: item2.boxTime,
                  preBoxTime: item2.preBoxTime,
                  driverName: item2.driverName,
                  driverPhone: item2.driverPhone,
                  licensePlate: item2.licensePlate,
                })
            })
         } else {
            this.fclTrucksData.push({
              intrustNo: item1.intrustNo,
              supplierName: item1.supplierName,
              intrustStatus: item1.intrustStatus,
              boxTime: '',
              preBoxTime: '',
              driverName: '',
              driverPhone: '',
              licensePlate: '',
            })
         }
       })
     },
     getFclTrucksData() {
       this.serviceInfo.fclTrucks.forEach((item1) => {
         if (item1.truckLoads && item1.truckLoads.length) {
           item1.truckLoads.forEach((item2) => {
             if (item2.truckContainers && item2.truckContainers.length) {
               item2.truckContainers.forEach((item3) => {
                 this.fclTrucksData.push({
                  intrustNo: item1.intrustNo,
                  supplierName: item1.supplierName,
                  intrustStatus: item1.intrustStatus,
                  boxTime: item2.boxTime,
                  preBoxTime: item2.preBoxTime,
                  driverName: item3.driverName,
                  driverPhone: item3.driverPhone,
                  licensePlate: item3.licensePlate,
                 })
               })
             } else {
               this.fclTrucksData.push({
                  intrustNo: item1.intrustNo,
                  supplierName: item1.supplierName,
                  intrustStatus: item1.intrustStatus,
                  boxTime: item2.boxTime,
                  preBoxTime: item2.preBoxTime,
                  driverName: '',
                  driverPhone: '',
                  licensePlate: '',
                })
             }
           })
         } else {
            this.fclTrucksData.push({
              intrustNo: item1.intrustNo,
              supplierName: item1.supplierName,
              intrustStatus: item1.intrustStatus,
              boxTime: '',
              preBoxTime: '',
              driverName: '',
              driverPhone: '',
              licensePlate: '',
            })
         }
       })
     },
     getClassName(status, successColor, errColor, finishColor ) {
       successColor = successColor || []
       errColor = errColor || []
       finishColor = finishColor || []
       return successColor.includes(status) ? 'success-color' :
              errColor.includes(status) ? 'err-color' :
              finishColor.includes(status) ? 'finish-color' :
              ''
     },
     getNameGrounp(name1, name2) {
       if (name1 && name2) {
        return `${name1}/${name2}`
       } else {
        return name1 || name2 || ''
       }
     },
     serviceStatusIsFinish(service) {
        let obj = this.serviceInfoList.find(item => {
          return service === item.serviceCode
        }) || {}
        return obj.serviceStatus === 'finish' 
     },
     setScrollHeight() {
       let ids = ['DC','QYGTG','QYGSC','QYGCC','QYGBG','QYGBJ','TD','MDGHD','MDGWTQG','MDGSCPS','MDGTGPS','MDGCC']
       let h = ''
       let scrollHeightVal = 18
       let arr = []
       for(let i = 0; i < ids.length; i++) {
         h = document.getElementById(ids[i])
         if (h) {
           arr.push({
             id: ids[i],
             scrollHeightVal
           })
           scrollHeightVal = scrollHeightVal + h.offsetHeight + 17
         }
       }
       console.log('滚动高度集合：', arr)
       this.$emit('getScrollHeight', arr)
     },
     btnClick(param, type) {
       this.longSetObj[param] = type === 'more' ? 'more' : this.initLong
       setTimeout(() => {
         this.setScrollHeight() 
       }, 500)
     },
     goRouter(name) {
       if (!name) return
       let routeUrl = null
       let query = this.$route.query
       if (name === 'WorkException') {
          routeUrl = this.$router.resolve({
            name,
            query: {
              orderNo: query.orderNo
            }
          })
         
       } else {
          routeUrl = this.$router.resolve({
            name,
            query,
            params: {
              orderNo: query.orderNo
            }
          })
       }
       window.open(routeUrl.href, '_blank')
     }
   }
}
</script>

<style lang="scss" scoped>
.tableData {
  width: calc(100% - 510px);
  margin-left: 10px;
  background-color: #fff;
  padding: 0 16px;
  .marginTop8 {
    margin-top: 8px;
  }
  .success-color {
    color: #33B18A;
  }
  .err-color {
    color: #d45e4f
  }
  .finish-color {
    color: #5992f6;
  }
  .item {
    background: #FFFFFF;
    border-radius: 2px;
    border: 1px solid #D9D9D9;
    &+.item {
      margin-top: 17px;
    }
    .header {
      height: 32px;
      line-height: 32px;
      padding: 5px 15px;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .service {
        .finsh-status {
          margin-left: 16px;
        }
      }
    }
    .dz {
      background-color: #33B18A;
    }
    .tg {
      background-color: #3E80F5;
    }
    .bg {
      background-color: #604BB0;
    }
    .td {
      background-color: #CE5527;
    }
    .hd {
      background-color: #DFA725;
    }
    .qg {
      background-color: #33B18A;
    }
    .sc {
      background-color: #21B5C5;
    }
    .yc {
      background-color: #d74c4c;
    }
    .icon-tdcg {
      display: inline-block;
      width: 16px;
      height: 16px;
      background: #b3b3b3;
      border-radius: 2px;
      color: #fff;
      line-height: 16px;
      text-align: center;
      font-style: normal;
      margin-right: 2px;
      font-size: 12px;
    }
    .icon-hbl {
      display: inline-block;
      width: 16px;
      height: 16px;
      background: #3e80f5;
      border-radius: 2px;
      color: #fff;
      line-height: 16px;
      text-align: center;
      font-style: normal;
    }
    .blNo {
      margin-left: 4px;
    }
    .icon-class {
      cursor: pointer;
    }
    .content {
      margin-top: 16px;
      padding: 5px 15px;
      .info {
        display: flex;
        flex-wrap: wrap;
        .content-item {
          width: 50%;
        }
      }
      .dc-info {
        .content-item {
          display: flex;
          justify-content: center;
          .key {
             width: 90px;
             text-align: right;
          }
          .value {
            width: calc(100% - 90px);
          }
        }
      }
      .table {
        margin-top: 10px;
      }
    }
    .more-class {
      text-align: center;
      margin-top: 10px;
    }
  }
}
</style>