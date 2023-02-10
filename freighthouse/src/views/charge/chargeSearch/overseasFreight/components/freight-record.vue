<template>
  <div>
    <!-- 图片预览 -->
    <el-image-viewer v-if="showViewer" :on-close="()=>{showViewer=false}" :url-list="imgList" />
    <div v-for="(el,index) in freightRecords" :key="index">
      <div v-if="el.recordType==='participant'" class="invitation-msg record-item">
        <!-- 邀请人消息 -->
        <div class="invitation-time">{{el.createdTime}}</div>
        <!-- “{{el.createdName}}” -->
        <div v-if="el.participantType==='joint'" class="invitation-content">Added "{{el.participantName}}(<span v-if="el.participantEname">{{el.participantEname}}-</span>{{el.deptCname}})" as a collaborator</div>
        <div v-else class="invitation-content">The {{el.participantType | participantType}} has changed to "{{el.participantName}}(<span v-if="el.participantEname">{{el.participantEname}}-</span>{{el.deptCname}})"</div>
      </div>
      <div v-if="el.recordType==='enquiry'" class="inquiryn-msg record-item freight-is-left" :class="{'is-self':userId===el.createdBy}">
        <!-- 询价人消息，（位置左右，是否是当前人发送的消息） -->
        <div class="invitation-time">{{el.createdTime}}</div>
        <div style="overflow: hidden;">
          <div class="freight-item-surrender">
            <img src="../../../../../assets/head.png" alt="">
          </div>
          <div class="inquiryn-main">
            <div class="freight-nickname">{{el.createdName}}</div>
            <div class="inquiryn-content left-content">
              <div class="flex-content-box"><span class="inquiryn-content-title">POL：</span><span v-if="['air_export','air_import'].includes(el.businessType)" class="flex-content-value">{{el.polCode}}</span><span v-else class="flex-content-value">{{el.pol}}</span></div>
              <div class="flex-content-box"> <span class="inquiryn-content-title">POD：</span><span v-if="['air_export','air_import'].includes(el.businessType)" class="flex-content-value">{{el.podCode}}</span><span v-else class="flex-content-value">{{el.pod}}</span></div>
              <div v-if="el.countryName" class="flex-content-box"> <span class="inquiryn-content-title">Destination country：</span><span class="flex-content-value">{{el.countryName}}</span></div>
              <div v-if="el.carrier" class="flex-content-box"> <span class="inquiryn-content-title">Carrier：</span><span class="flex-content-value">{{el.carrier}}</span></div>
              <div v-if="el.tradeTermsCode" class="flex-content-box"> <span class="inquiryn-content-title">Trade Terms：</span><span class="flex-content-value">{{ getDictLabel('tradeTermsCode', el.tradeTermsCode) }}</span></div>
              <div v-if="['ship_export_fcl','ship_import_fcl','rail_export_fcl'].includes(el.businessType)">
                <div class="flex-content-box"><span class="inquiryn-content-title">Container：</span>
                  <div class="flex-content-value">
                    <span v-for="(item,i) in el.containers" :key="i">
                      <span>{{item.containerNum}}*{{item.containerType}}；</span>
                    </span>
                  </div>
                </div>
                <div class="flex-content-box"><span class="inquiryn-content-title">Number for per cabinet：</span>
                  <div class="flex-content-value">
                    <span v-for="(item,i) in el.containers" :key="i">
                      <span v-if="item.packageInfo">{{item.quantity}}*{{item.packageInfo}}；</span>
                      <span v-else>-;</span>
                    </span>
                  </div>
                </div>
                <div class="flex-content-box"><span class="inquiryn-content-title">Weight for per cabinet：</span>
                  <div class="flex-content-value">
                    <span v-for="(item,i) in el.containers" :key="i">
                      <span v-if="item.weight">{{item.weight}}KGS；</span>
                    </span>
                  </div>
                </div>
                <div class="flex-content-box"><span class="inquiryn-content-title">Volume for per cabinet：</span>
                  <div class="flex-content-value">
                    <span v-for="(item,i) in el.containers" :key="i">
                      <span>{{item.volume || '-'}}CBM；</span>
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="!['ship_export_fcl','ship_import_fcl','rail_export_fcl'].includes(el.businessType)">
                <div class="flex-content-box"><span class="inquiryn-content-title">Number：</span>
                  <div class="flex-content-value">
                    <span v-for="(item,i) in el.containers" :key="i">
                      <span v-if="item.packageInfo">{{item.quantity}}*{{item.packageInfo}}；</span>
                    </span>
                  </div>
                </div>
                <div class="flex-content-box"><span class="inquiryn-content-title">Weight：</span>
                  <div class="flex-content-value">
                    <span v-for="(item,i) in el.containers" :key="i">
                      <span v-if="item.weight">{{item.weight}}KGS；</span>
                    </span>
                  </div>
                </div>
                <div class="flex-content-box"><span class="inquiryn-content-title">Volume：</span>
                  <div class="flex-content-value">
                    <span v-for="(item,i) in el.containers" :key="i">
                      <span v-if="item.volume">{{item.volume}}CBM；</span>
                    </span>
                  </div>
                </div>
                <div class="flex-content-box"><span class="inquiryn-content-title">Length&Width&Height：</span>
                  <div class="flex-content-value">
                    <span v-for="(item,i) in el.containers" :key="i">
                      <span v-if="item.length || item.width || item.height">{{item.length || '-'}}M*{{item.width || '-'}}M*{{item.height || '-'}}M；</span>
                      <span v-else>-；</span>
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex-content-box"><span class="inquiryn-content-title">HS CODE：</span>
                <div class="flex-content-value">
                  <span v-for="(item,i) in el.hscodeSonCommodity" :key="i">
                    <span>{{item.hsCode}}；</span>
                  </span>
                </div>
              </div>
              <div class="flex-content-box"><span class="inquiryn-content-title">Commodity：</span>
                <div class="flex-content-value">
                  <span v-for="(item,i) in el.hscodeSonCommodity" :key="i">
                    <span>{{item.commodity}}；</span>
                  </span>
                </div>
              </div>
              <div v-if="['ship_export_fcl','ship_import_fcl','rail_export_fcl'].includes(el.businessType)">
                <div class="flex-content-box"><span class="inquiryn-content-title">Number：</span>
                  <div class="flex-content-value">
                    <span v-for="(item,i) in el.hscodeSonCommodity" :key="i">
                      <span>{{item.quantity || '-'}}；</span>
                    </span>
                  </div>
                </div>
                <div class="flex-content-box"><span class="inquiryn-content-title">Weight：</span>
                  <div class="flex-content-value">
                    <span v-for="(item,i) in el.hscodeSonCommodity" :key="i">
                      <span>{{item.weight || '-'}}KGS；</span>
                    </span>
                  </div>
                </div>
                <div class="flex-content-box"><span class="inquiryn-content-title">Volume：</span>
                  <div class="flex-content-value">
                    <span v-for="(item,i) in el.hscodeSonCommodity" :key="i">
                      <span>{{item.volume || '-'}}CBM；</span>
                    </span>
                  </div>
                </div>
                <div class="flex-content-box"><span class="inquiryn-content-title">Length&Width&Height：</span>
                  <div class="flex-content-value">
                    <span v-for="(item,i) in el.hscodeSonCommodity" :key="i">
                      <span v-if="item.length || item.width || item.height">{{item.length || '-'}}M*{{item.width || '-'}}M*{{item.height || '-'}}M；</span>
                      <span v-else>-；</span>
                    </span>
                  </div>
                </div>
              </div>
              <div v-if="el.value" class="flex-content-box"><span class="inquiryn-content-title">Value：</span><span class="flex-content-value">{{el.value}}</span></div>
              <div v-for="(item,i) in formatAddress(el.deliveryOrPickUpAddress,'DELIVERY')" :key="'DELIVERY'+i">
                <div class="flex-content-box">
                  <span class="inquiryn-content-title">Delivery Address({{i+1}})：</span>
                  <span class="flex-content-value">
                    <span v-if="item.dpCountry">{{item.dpCountry}},</span>
                    <span v-if="item.dpProvince">{{item.dpProvince}},</span>
                    <span v-if="item.dpCity">{{item.dpCity}},</span>
                    <span v-if="item.dpDistrict">{{item.dpDistrict}},</span>
                    <span v-if="item.address">{{item.address}}</span>
                  </span>
                </div>
              </div>
              <div v-for="(item,i) in formatAddress(el.deliveryOrPickUpAddress,'PICK')" :key="'PICK'+i">
                <div class="flex-content-box">
                  <span class="inquiryn-content-title">Pick-up Address({{i+1}})：</span>
                  <span class="flex-content-value">
                    <span v-if="item.dpCountry">{{item.dpCountry}},</span>
                    <span v-if="item.dpProvince">{{item.dpProvince}},</span>
                    <span v-if="item.dpCity">{{item.dpCity}},</span>
                    <span v-if="item.dpDistrict">{{item.dpDistrict}},</span>
                    <span v-if="item.address">{{item.address}}</span>
                  </span>
                </div>
              </div>
              <div v-if="el.cargoCustTime" class="flex-content-box"><span class="inquiryn-content-title">Cargo Ready Time：</span>{{el.cargoCustTime}}</div>
              <div v-if="el.sysLineName" class="flex-content-box"> <span class="inquiryn-content-title">ROUTE：</span><span class="flex-content-value">{{el.sysLineName}}</span></div>
              <div v-if="el.etdDate" class="flex-content-box"><span class="inquiryn-content-title">ETD：</span><span class="flex-content-value">{{el.etdDate}}</span></div>
              <div v-if="el.etaDate" class="flex-content-box"><span class="inquiryn-content-title">ETA：</span><span class="flex-content-value">{{el.etaDate}}</span></div>
              <div v-if="el.isDangerous" class="flex-content-box"><span class="inquiryn-content-title">DG/NON DG：</span><span :class="{'red-msg':el.isDangerous==='yes'}">{{el.isDangerous | withWithoutFilters}}</span></div>
              <div v-if="el.fileNo" class="file-item"><span class="inquiryn-content-title">MSDS：</span><span title="Click to download" class="file-name" @click="handleDownload(el.fileName,el.fileNo)">{{el.fileName}}</span></div>
              <!-- <div v-if="el.startDateTerm" class="flex-content-box"><span class="inquiryn-content-title">Term：</span>{{el.startDateTerm}}至{{el.endDateTerm}}</div> -->
              <div v-if="el.cnee" class="flex-content-box"><span class="inquiryn-content-title">CNEE Whether to have import rights：</span><span :class="{'green-msg':el.cnee==='有'}">{{el.cnee | withWithoutFilters}}</span></div>
              <div v-if="el.shipperExport" class="flex-content-box"><span class="inquiryn-content-title">Shipper Whether to have export rights：</span><span :class="{'green-msg':el.shipperExport==='有'}">{{el.shipperExport | withWithoutFilters}}</span></div>
              <div v-if="el.needProxyBox" class="flex-content-box"><span class="inquiryn-content-title">Whether to send to the agent warehouse for loading：</span><span :class="{'green-msg':el.needProxyBox==='是'}">{{el.needProxyBox | withWithoutFilters}}</span></div>
              <div v-if="el.remark" class="flex-content-box"><span class="inquiryn-content-title">Remarks：</span><span class="flex-content-value">{{el.remark}}</span></div>
              <div v-for="(item,i) in formatFileList(el.otherFileName, el.otherFileNo)" :key="item.fileNo">
                <div class="file-item"><span class="inquiryn-content-title">ANNEX({{i+1}})：</span><span title="Click to download" class="file-name" @click="handleDownload(item.fileName,item.fileNo)">{{item.fileName}}</span></div>
              </div>
              <div class="flex-content-box" v-if="['ship_export_lcl','ship_import_lcl','ship_bulk_ro','rail_export_lcl'].includes(el.businessType) && el.lclDestinationAgentName"> <span class="inquiryn-content-title">Destination Agent：</span><span class="flex-content-value">{{el.lclDestinationAgentName}}</span></div>
              <div v-if="el.custName" class="flex-content-box"><span class="inquiryn-content-title">Customer：</span><span class="flex-content-value">{{el.custName}}</span></div>
              <div v-if="el.latestReplyTime" class="flex-content-box"><span class="inquiryn-content-title">Latest Reply Time：</span><span class="flex-content-value">{{el.latestReplyTime}}</span></div>
              <div v-if="el.podTransportMode" class="flex-content-box"> <span class="inquiryn-content-title">Transport By：</span><span class="flex-content-value">{{ el.podTransportMode?getDictLabel('inquiryTransportMode', el.podTransportMode):''}}</span></div>
              <div v-if="el.clearanceLimit" class="flex-content-box"><span class="inquiryn-content-title">Customs clearance time limit：</span><span class="flex-content-value">{{el.clearanceLimit}}</span></div>
              <div v-if="el.deliveryLimit" class="flex-content-box"><span class="inquiryn-content-title">Delivery Time Limits：</span><span class="flex-content-value">{{el.deliveryLimit}}</span></div>
              <div v-if="el.isDeliveryUnboxing" class="flex-content-box"><span class="inquiryn-content-title">Whether to unpack and deliver：</span><span class="flex-content-value" :class="{'green-msg':el.isDeliveryUnboxing==='y'}">{{el.isDeliveryUnboxing | getisDeliveryUnboxing}}</span></div>
              <div v-if="el.isTradeEnquiries" class="flex-content-box"><span class="inquiryn-content-title">Inquiry Type：</span><span class="flex-content-value">{{getDictLabel('tradeEnquiriesType', el.isTradeEnquiries)}}</span></div>
              <div class="flex-content-box"><span class="inquiryn-content-title">Business Type：</span><span class="flex-content-value">{{el.businessType | getBusinessType}}</span></div>
            </div>
          </div>
        </div>
        <div class="msg-read">
          <div v-if="userId != el.createdBy">
            <div v-if="el.isRead==='N'">
              <div v-if="isUnRead" class="un-read">Unread</div>
              <div v-else class="read">Read</div>
            </div>
            <div v-else>
              <div v-if="!el.readUserInfo.first || el.readUserInfo.first=='0'">All read</div>
              <div v-else><span class="un-read">{{el.readUserInfo.first}}&nbsp;&nbsp;unread</span>({{el.readUserInfo.second}}{{el.readUserInfo.third}})</div>
            </div>
          </div>
          <div v-else>
            <div v-if="!el.readUserInfo.first || el.readUserInfo.first=='0'">All read</div>
            <div v-else><span class="un-read">{{el.readUserInfo.first}}&nbsp;&nbsp;unread</span>({{el.readUserInfo.second}}{{el.readUserInfo.third}})</div>
          </div>
        </div>
      </div>
      <div v-if="el.recordType==='quote'" class="offer-msg record-item freight-is-right" :class="{'is-self':userId===el.createdBy}">
        <!-- 报价人消息（位置左右，是否是当前人发送的消息），报价的类型（出口） -->
        <div class="invitation-time">{{el.createdTime}}</div>
        <div style="overflow: hidden;">
          <div class="freight-item-surrender">
            <img src="../../../../../assets/head.png" alt="">
          </div>
          <div class="offer-main">
            <div class="freight-nickname">{{el.createdName}}</div>
            <div class="offer-content right-content">
              <div class="offer-header">
                <div class="offer-no">Quotation scheme No.：{{el.schemeNumber}}</div>
              </div>
              <el-table :data="el.feeList" style="width: 100%">
                <el-table-column prop="feeName" label="Fee name" align="center" width="135">
                </el-table-column>
                <el-table-column prop="feeQuantity" label="Number" align="center" width="100">
                </el-table-column>
                <el-table-column prop="feePrice" label="unit Price" align="center" width="100">
                </el-table-column>
                <el-table-column prop="feeCurrency" label="Currency" align="center" width="135">
                </el-table-column>
                <el-table-column prop="feeTotal" label="Total" align="center" width="135">
                </el-table-column>
                <el-table-column prop="feeUnit" label="Billing unit" align="center" width="135">
                  <template slot-scope="scope">
                    {{scope.row.feeUnit | feeUnitEn }}
                  </template>
                </el-table-column>
                <el-table-column prop="remark" label="Remarks" align="center" width="200">
                </el-table-column>
              </el-table>
              <div class="fee-total">Fee Total：<span v-for="(item,index) in totalAmount(el.feeList)" :key="index">{{item.value}} {{item.label}}<span v-if="totalAmount(el.feeList).length>0&&index<totalAmount(el.feeList).length-1">+</span></span></div>
              <div class="others-info">
                <el-row>
                  <el-col :span="12" v-if="!['rail_export_fcl','rail_export_lcl'].includes( el.businessType) && el.carrier">
                    <div class="flex-content-box"><span class="offer-content-title">Carrier：</span><span class="flex-content-offer-value">{{el.carrier}}</span></div>
                  </el-col>
                  <el-col :span="12" v-if="['ship_import_fcl', 'ship_import_lcl', 'air_import'].includes( el.businessType)">
                    <div class="flex-content-box"><span class="offer-content-title">T/T：</span><span class="flex-content-offer-value">{{el.tT}}</span></div>
                  </el-col>
                  <el-col :span="12" v-if="['ship_import_fcl', 'ship_import_lcl', 'air_import'].includes( el.businessType)">
                    <div class="flex-content-box"><span class="offer-content-title">ETD：</span><span class="flex-content-offer-value">{{el.etd}}</span></div>
                  </el-col>
                  <!--  && ['ship_export_fcl', 'ship_export_lcl', 'air_export','rail_export_fcl','rail_export_lcl','ship_bulk_ro'].includes( el.businessType) && el.categoryName -->
                  <el-col :span="12" v-if="participantType==='quote'">
                    <div class="flex-content-box"><span class="offer-content-title">Supplier：</span><span class="flex-content-offer-value">{{el.categoryName}}</span></div>
                  </el-col>
                  <el-col :span="12">
                    <div class="flex-content-box"><span class="offer-content-title">Validity Date Type：</span><span class="flex-content-offer-value">{{getDictLabel('validityDateType', el.validityDateType)}}</span></div>
                  </el-col>
                  <el-col :span="12">
                    <div class="flex-content-box"><span class="offer-content-title">Validity Date：</span><span class="flex-content-offer-value">{{el.startDateValidity}}至{{el.endDateValidity}}</span></div>
                  </el-col>
                  <el-col :span="24">
                    <div class="flex-content-box"><span class="offer-content-title">POD (ADVISED)：</span><span v-if="['air_export','air_import'].includes(el.businessType)" class="flex-content-offer-value">{{el.podRecommendCode}}</span><span v-else class="flex-content-offer-value">{{el.podRecommendName}}</span></div>
                  </el-col>
                </el-row>
                <div v-for="(item,i) in formatFileList(el.fileNameStr, el.fileNoStr)" :key="item.fileNo">
                  <div class="file-item"><span class="offer-content-title">ANNEX({{i+1}})：</span><span title="Click to download" class="file-name" @click="handleDownload(item.fileName,item.fileNo)">{{item.fileName}}</span></div>
                </div>
                <div class="flex-content-box"><span class="offer-content-title">Remarks：</span><span class="flex-content-offer-value" v-html="formatRemarke(el.quoteRemark)"></span></div>
              </div>
            </div>
          </div>
        </div>
        <div class="msg-right msg-read">
          <div v-if="userId != el.createdBy">
            <div v-if="el.isRead==='N'">
              <div v-if="isUnRead" class="un-read">Unread</div>
              <div v-else class="read">Read</div>
            </div>
            <div v-else>
              <div v-if="!el.readUserInfo.first || el.readUserInfo.first=='0'">All read</div>
              <div v-else><span class="un-read">{{el.readUserInfo.first}}center</span>({{el.readUserInfo.second}}{{el.readUserInfo.third}})</div>
            </div>
          </div>
          <div v-else>
            <div v-if="!el.readUserInfo.first || el.readUserInfo.first=='0'">All read</div>
            <div v-else><span class="un-read">{{el.readUserInfo.first}}&nbsp;&nbsp;unread</span>({{el.readUserInfo.second}}{{el.readUserInfo.third}})</div>
          </div>
        </div>
      </div>
      <div v-if="el.recordType==='communication' && !enquiryArr.includes(el.createdBy) && !quoteArr.includes(el.createdBy)" class="inquiryn-msg record-item freight-is-left" :class="{'is-self':userId===el.createdBy}">
        <div class="invitation-time">{{el.createdTime}}</div>
        <!-- 普通消息，（位置左右，是否是当前人发送的消息） -->
        <div style="overflow: hidden;">
          <div class="freight-item-surrender">
            <img src="../../../../../assets/head.png" alt="">
          </div>
          <div class="inquiryn-main">
            <div class="freight-nickname">{{el.createdName}}</div>
            <div @click.stop="handlePreview" class="inquiryn-content left-content inquiryn-content-img-box" style="display: inline-block;" v-html="el.communicationRecord">
            </div>
          </div>
        </div>
        <div class="msg-read">
          <div v-if="userId != el.createdBy">
            <div v-if="el.isRead==='N'">
              <div v-if="isUnRead" class="un-read">Unread</div>
              <div v-else class="read">Read</div>
            </div>
            <div v-else>
              <div v-if="!el.readUserInfo.first || el.readUserInfo.first=='0'">All read</div>
              <div v-else><span class="un-read">{{el.readUserInfo.first}}&nbsp;&nbsp;unread</span>({{el.readUserInfo.second}}{{el.readUserInfo.third}})</div>
            </div>
          </div>
          <div v-else>
            <div v-if="!el.readUserInfo.first || el.readUserInfo.first=='0'">All read</div>
            <div v-else><span class="un-read">{{el.readUserInfo.first}}&nbsp;&nbsp;unread</span>({{el.readUserInfo.second}}{{el.readUserInfo.third}})</div>
          </div>
        </div>
      </div>
      <div v-if="el.recordType==='communication' && enquiryArr.includes(el.createdBy)" class="inquiryn-msg record-item freight-is-left" :class="{'is-self':userId===el.createdBy}">
        <div class="invitation-time">{{el.createdTime}}</div>
        <!-- 普通消息，（位置左右，是否是当前人发送的消息） -->
        <div style="overflow: hidden;">
          <div class="freight-item-surrender">
            <img src="../../../../../assets/head.png" alt="">
          </div>
          <div class="inquiryn-main">
            <div class="freight-nickname">{{el.createdName}}</div>
            <div @click.stop="handlePreview" class="inquiryn-content left-content inquiryn-content-img-box" style="display: inline-block;" v-html="el.communicationRecord">
            </div>
          </div>
        </div>
        <div class="msg-read">
          <div v-if="userId != el.createdBy">
            <div v-if="el.isRead==='N'">
              <div v-if="isUnRead" class="un-read">Unread</div>
              <div v-else class="read">Read</div>
            </div>
            <div v-else>
              <div v-if="!el.readUserInfo.first || el.readUserInfo.first=='0'">All read</div>
              <div v-else><span class="un-read">{{el.readUserInfo.first}}&nbsp;&nbsp;unread</span>({{el.readUserInfo.second}}{{el.readUserInfo.third}})</div>
            </div>
          </div>
          <div v-else>
            <div v-if="!el.readUserInfo.first || el.readUserInfo.first=='0'">All read</div>
            <div v-else><span class="un-read">{{el.readUserInfo.first}}&nbsp;&nbsp;unread</span>({{el.readUserInfo.second}}{{el.readUserInfo.third}})</div>
          </div>
        </div>
      </div>

      <div v-if="el.recordType==='communication' && quoteArr.includes(el.createdBy)" class="inquiryn-msg record-item freight-is-right" :class="{'is-self':userId===el.createdBy}">
        <div class="invitation-time">{{el.createdTime}}</div>
        <!-- 普通消息，（位置左右，是否是当前人发送的消息） -->
        <div style="overflow: hidden;">
          <div class="freight-item-surrender">
            <img src="../../../../../assets/head.png" alt="">
          </div>
          <div class="inquiryn-main">
            <div class="freight-nickname">{{el.createdName}}</div>
            <div @click.stop="handlePreview" class="inquiryn-content right-content inquiryn-content-img-box" style="display: inline-block;" v-html="el.communicationRecord">
            </div>

          </div>
        </div>
        <div class="msg-right msg-read">
          <div v-if="userId != el.createdBy">
            <div v-if="el.isRead==='N'">
              <div v-if="isUnRead" class="un-read">Unread</div>
              <div v-else class="read">Read</div>
            </div>
            <div v-else>
              <div v-if="!el.readUserInfo.first || el.readUserInfo.first=='0'">All read</div>
              <div v-else><span class="un-read">{{el.readUserInfo.first}}&nbsp;&nbsp;unread</span>({{el.readUserInfo.second}}{{el.readUserInfo.third}})</div>
            </div>
          </div>
          <div v-else>
            <div v-if="!el.readUserInfo.first || el.readUserInfo.first=='0'">All read</div>
            <div v-else><span class="un-read">{{el.readUserInfo.first}}&nbsp;&nbsp;unread</span>({{el.readUserInfo.second}}{{el.readUserInfo.third}})</div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { accAdd } from '@/utils/index'
import store from '@/store'
export default {
  components: {
    'el-image-viewer': () =>
      import('element-ui/packages/image/src/image-viewer')
  },
  filters: {
    withWithoutFilters(val) {
      if (val) {
        if (val === '有' || val === '是' || val === 'yes') {
          return 'YES'
        } else if (val === '无' || val === '否' || val === 'no') {
          return 'NO'
        } else {
          return ''
        }
      } else {
        return ''
      }
    },
    getisDeliveryUnboxing(val) {
      if (val) {
        if (val === 'y') {
          return 'YES'
        } else {
          return 'NO'
        }
      } else {
        return ''
      }
    },
    feeUnitEn(val) {
      let item = store.state.dict.dictMap.feeUnit.find((el) => el.value === val)
      if (item) {
        return item.en
      } else {
        return ''
      }
    },
    formatValidity(val) {
      return val.replace(',', '至')
    },
    participantType(val) {
      let obj = {
        enquiry: 'Inquirer',
        quote: 'Quoter',
        joint: 'Collaborator'
      }
      return obj[val]
    },
    getBusinessType(val) {
      let businessTypeList = [
        {
          label: 'Maritime Export FCL',
          value: 'ship_export_fcl'
        },
        {
          label: 'Maritime Export LCL',
          value: 'ship_export_lcl'
        },
        {
          label: 'Maritime Import FCL',
          value: 'ship_import_fcl'
        },
        {
          label: 'Maritime Import LCL',
          value: 'ship_import_lcl'
        },
        {
          label: 'Air Export',
          value: 'air_export'
        },
        {
          label: 'Air Import',
          value: 'air_import'
        },
        {
          label: 'Railway Import/Export FCL',
          value: 'rail_export_fcl'
        },
        {
          label: 'Railway Import/Export LCL',
          value: 'rail_export_lcl'
        },
        {
          label: 'Miscellaneous Roll-on Export',
          value: 'ship_bulk_ro'
        }
      ]
      if (val) {
        let item = businessTypeList.find((el) => el.value === val)
        if (item) {
          return item.label
        } else {
          return ''
        }
      } else {
        return ''
      }
    },
    getDangerous(val) {
      let obj = {
        yes: '是',
        no: '否'
      }
      return obj[val]
    }
  },
  data() {
    return {
      getDictLabel: getDictLabel,
      showViewer: false,
      imgList: [],
      isUnRead: true
    }
  },
  props: {
    freightRecords: {
      type: Array,
      default() {
        return []
      }
    },
    quoteArr: {
      type: Array,
      default() {
        return []
      }
    },
    enquiryArr: {
      type: Array,
      default() {
        return []
      }
    },
    participantType: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapState({
      userId: (state) => state.user.userId
    })
  },
  watch: {},
  created() {
    console.log(this.freightRecords)
  },
  mounted() {
    setTimeout(() => {
      this.isUnRead = false
    }, 2000)
  },
  methods: {
    formatAddress(arr, type) {
      if (!arr || arr.length === 0) {
        return []
      }
      let result = arr.filter(
        (el) => el.addressType === type && (el.address || el.dpCountry)
      )
      return result
    },
    totalAmount(data = []) {
      let arr = []
      for (let i = 0; i < data.length; i++) {
        if (data[i].feeTotal && data[i].feeCurrency) {
          if (!arr.find((el) => el.label == data[i].feeCurrency)) {
            arr.push({
              value: data[i].feeTotal,
              label: data[i].feeCurrency
            })
          } else {
            let index = arr.findIndex((el) => el.label == data[i].feeCurrency)
            arr[index].value = accAdd(arr[index].value, data[i].feeTotal)
          }
        }
      }
      return arr
    },
    handlePreview(e) {
      if (e.target.src) {
        this.imgList = [e.target.src]
        this.showViewer = true
      } else {
        this.showViewer = false
      }
    },
    formatRemarke(val) {
      return val.replace(/\n|\r\n/g, '<br>')
    },
    formatFileList(otherFileName, otherFileNo) {
      let otherFileNameArr = otherFileName ? otherFileName.split(',') : []
      let otherFileNoArr = otherFileNo ? otherFileNo.split(',') : []
      let arr = []
      for (let i = 0; i < otherFileNameArr.length; i++) {
        arr.push({
          fileNo: otherFileNoArr[i],
          fileName: otherFileNameArr[i]
        })
      }

      return arr
    },
    getTotal(type, n1, n2, n3, n4, n5, n6) {
      let total = 0
      if (type === 'PER_CONTAINER') {
        if (n1 && n4) {
          total += n1 * n4
        }
        if (n2 && n5) {
          total += n2 * n5
        }
        if (n3 && n6) {
          total += n3 * n6
        }
      } else {
        if (n1) {
          total += n1 * 1
        }
        if (n2) {
          total += n2 * 1
        }
        if (n3) {
          total += n3 * 1
        }
      }
      return Number(total).fixed(2)
    },
    handleView(fileName, fileNo) {
      this.$store.dispatch('order/previewFile', {
        fileNo: fileNo,
        fileName: fileName
      })
    },
    handleDownload(fileName, fileNo) {
      this.$store
        .dispatch('order/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: fileNo
          }
        })
        .then((res) => {
          console.log(res)
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = fileName
          link.click()
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.fee-total {
  color: #409eff;
  display: flex;
  justify-content: flex-end;
  background: #fff;
  height: 24px;
  align-items: center;
  padding-right: 8px;
}
.record-item {
  margin-bottom: 24px;
}
.invitation-msg {
  text-align: center;
  color: #969696;
  line-height: 20px;
  word-wrap: break-word;
  .invitation-content {
    margin-bottom: 10px;
  }
}
// 询价
.inquiryn-msg {
  overflow: hidden;
  .inquiryn-main {
    float: left;
    max-width: 90%;
    margin: 0 5px;
    .inquiryn-content {
      width: 100%;
      word-wrap: break-word;
      background: #f7f7f7;
      padding: 10px;
      line-height: 18px;
      color: #666;
      border-radius: 10px;
      position: relative;
      .file-item {
        display: flex;
        align-items: center;
        .file-name {
          color: #1890ff;
          line-height: 18px;
          cursor: pointer;
        }
      }
    }
  }
}
// 报价方案
.offer-msg {
  overflow: hidden;
  .offer-main {
    float: right;
    max-width: calc(100% - 80px);
    margin: 0 5px;
    .offer-nickname {
      height: 20px;
      font-size: 12px;
      font-family: MicrosoftYaHei;
      color: #8d9ab3;
      line-height: 20px;
      text-align: right;
    }
  }
  .offer-content {
    background: #f7f7f7;
    padding: 10px;
    line-height: 18px;
    color: #666;
    border-radius: 10px;
    position: relative;
    .others-info {
      color: #4a4a4a;
      line-height: 20px;
      margin-bottom: 4px;
      margin-top: 8px;
    }
    .offer-cost {
      border-left: 1px solid #d9d9d9;
      .offer-cost-item-name {
        background: #f4f5f8;
        box-shadow: inset 0px 1px 0px 0px #d9d9d9;
        display: flex;
        font-weight: bold;
        color: #222222;
        .cost-name {
          width: 40%;
          text-align: center;
          line-height: 20px;
          padding: 6px;
          min-width: 100px;
        }
        .amount {
          width: 20%;
          text-align: center;
          line-height: 20px;
          padding: 6px;
          min-width: 100px;
        }
      }
      .offer-cost-line {
        display: flex;
        background: #fff;
        box-sizing: border-box;
        .cost-name {
          width: 40%;
          padding: 6px;
          display: flex;
          align-items: center;
          min-width: 100px;
        }
        .amount {
          width: 20%;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 100px;
        }
      }
    }
  }
}
// 居左样式
.left-content::after {
  content: '';
  display: block;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-top: 8px solid #f7f7f7;
  border-bottom: 8px solid transparent;
  position: absolute;
  top: 10px;
  left: -8px;
}
// 居右样式
.right-content::after {
  content: '';
  display: block;
  width: 0;
  height: 0;
  border-left: 8px solid #f7f7f7;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  position: absolute;
  top: 10px;
  right: -8px;
}
// 自己发的消息样式
.is-self {
  .inquiryn-content {
    background: #caeec2 !important;
  }
  .offer-content {
    background: #caeec2 !important;
  }
  .left-content::after {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-top: 8px solid #caeec2;
    border-bottom: 8px solid transparent;
    position: absolute;
    top: 10px;
    left: -8px;
  }
  .right-content::after {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid #caeec2;
    border-bottom: 8px solid transparent;
    position: absolute;
    top: 10px;
    right: -8px;
  }
}

.freight-is-left {
  .freight-item-surrender {
    float: left;
    img {
      height: 36px;
      width: 36px;
      border-radius: 18px;
    }
  }
  .offer-main {
    float: left !important;
  }
  .inquiryn-main {
    float: left;
  }
  .freight-nickname {
    text-align: left;
  }
}
.freight-is-right {
  .freight-item-surrender {
    float: right;
    img {
      height: 36px;
      width: 36px;
      border-radius: 18px;
    }
  }
  .offer-main {
    float: right !important;
  }
  .inquiryn-main {
    float: right;
  }
  .freight-nickname {
    text-align: right;
  }
}
.right-border {
  border-right: 1px solid #d9d9d9;
}
.left-border {
  border-left: 1px solid #d9d9d9;
}
.top-border {
  border-top: 1px solid #d9d9d9;
}
.bottom-border {
  border-bottom: 1px solid #d9d9d9;
}
.freight-nickname {
  height: 20px;
  font-size: 12px;
  font-family: MicrosoftYaHei;
  color: #8d9ab3;
  line-height: 20px;
}
.invitation-time {
  text-align: center;
  color: #969696;
  line-height: 20px;
}
.red-msg {
  color: #ff6d6d;
}
.green-msg {
  color: #33b18a;
}
.inquiryn-content-title {
  display: inline-block;
  width: 320px;
  text-align: right;
}
.flex-content-box {
  display: flex;
  width: 100%;
}
.offer-content-title {
  display: inline-block;
  width: 120px;
  text-align: right;
}
.flex-content-value {
  // flex: 1;
  max-width: calc(100% - 320px);
  word-wrap: break-word;
}
.flex-content-offer-value {
  max-width: calc(100% - 120px);
  word-wrap: break-word;
}
.file-name {
  color: #1890ff;
  line-height: 18px;
  cursor: pointer;
}
.offer-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  .offer-no {
    color: #000;
    font-weight: 600;
  }
}
.msg-right {
  display: flex;
  justify-content: flex-end;
}
.msg-read {
  margin-top: 4px;
  color: #999;
  padding: 0 40px;
}
.un-read {
  color: #3e80f5;
  line-height: 20px;
  margin-right: 2px;
  font-size: 12px;
}
.read {
  color: #999;
  line-height: 20px;
  margin-right: 2px;
  font-size: 12px;
}
</style>
<style lang="scss">
.inquiryn-content-img-box {
  img {
    max-width: 100%;
    cursor: pointer;
  }
}
</style>