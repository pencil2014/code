<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback" id="addInquiry">
    <div v-if="overseasFreightIsOnlyEnchars" style="color:red;font-size:14px">Tips: Please enter English, numbers and English symbols in the input box !</div>
    <el-form ref="form" :rules="rules" :model="createItem" label-width="175px" label-position="top" :show-message="false">
      <el-row>
        <el-col :span="24">
          <div class="cargo-info-container">
            <div class="cargo-info">
              <div class="cargo-info-title">
                <div class="title-name">The basics</div>
              </div>
              <div class="cargo-info-main">
                <el-row :gutter="20">
                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="Business Type" prop="businessType">
                      <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="createItem.businessType" :disabled="isEnquirySon" size="mini" @change="changeBusinessType" placeholder="Please select the type of business" style="width: 100%">
                        <el-option v-for="(item, index) in businessTypeList" :label="item.label" :value="item.value" :key="index">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="POL" prop="polCode">
                      <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" size="mini" style="width:100%" :disabled="isEnquirySon" clearable v-model="createItem.polCode" @change="changePolCode" filterable remote reserve-keyword placeholder="Please select" :remote-method="(val)=>{ polPortRemoteMethod(val,createItem.polCode)}" @visible-change="polPortRemoteMethod('',createItem.polCode)">
                        <el-option v-for="item in polArr" :key="item.value" :disabled="item.value===createItem.podCode" :label="item.label" :value="item.value">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="POD" prop="podCode">
                      <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" size="mini" v-model="createItem.podCode" :disabled="isEnquirySon" filterable remote clearable @change="changePodCode" style="width: 100%" placeholder="Please select" :remote-method="(val)=>{ podPortFilterMehod(val,createItem.podCode)}" @visible-change="podPortFilterMehod('',createItem.podCode)">
                        <el-option v-for="item in podArr" :disabled="item.value===createItem.polCode" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="Destination country" prop="countryName">
                      <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" size="mini" v-model="createItem.countryName" placeholder="Please select" filterable remote clearable style="width: 100%" :remote-method="(str) => { getCountryList(str) }" @visible-change="(str) => showCountry(str)">
                        <el-option v-for="optionItem in podCountryList" :label="optionItem.ename" :value="optionItem.ename" :key="optionItem.ename">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>

                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="ROUTE">
                      <el-input clearable size="mini" style="width: 100%" disabled placeholder="ROUTE" v-model="createItem.sysLineName">
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="ETD">
                      <el-date-picker v-model="createItem.etdDate" size="mini" type="date" style="width: 100%" clearable placeholder="Please select" value-format="yyyy-MM-dd" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="ETA">
                      <el-date-picker v-model="createItem.etaDate" size="mini" type="date" style="width: 100%" clearable placeholder="Please select" value-format="yyyy-MM-dd" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="Trade Terms" prop="tradeTermsCode">
                      <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="createItem.tradeTermsCode" filterable size="mini" clearable placeholder="Trade Terms" style="width: 100%">
                        <el-option v-for="item in dictMap.tradeTermsCode" :label="item.label" :value="item.value" :key="item.value"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <!-- 海运拼箱 拼箱目的港代理 -->
                  <el-col :span="6" :xl="{span: 8}" v-if="['ship_export_lcl','ship_import_lcl','ship_bulk_ro','rail_export_lcl'].includes(createItem.businessType)">
                    <el-form-item prop="lclDestinationAgentName">
                      <span slot="label">Destination Agent</span>
                      <el-input clearable size="mini" style="width: 100%" maxlength="128" placeholder="Please enter the destination port agent" v-model="createItem.lclDestinationAgentName">
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <!-- 海运拼箱没有航司 -->
                  <el-col :span="6" :xl="{span: 8}" v-if="!['rail_export_fcl','rail_export_lcl'].includes(createItem.businessType)">
                    <el-form-item label="Carrier" prop="carrier">
                      <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" style="width:100%" size="mini" clearable multiple collapse-tags v-model="createItem.carrier" filterable remote reserve-keyword placeholder="Please select" :remote-method="val => carrierRemoteMethod(val,createItem.carrier)" @visible-change="val=>carrierVisibleMethod(val,createItem.carrier)">
                        <el-option v-for="(item,i) in carrierArr" :key="i" :label="item.label" :value="item.value">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="Transport By" prop="podTransportMode">
                      <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="createItem.podTransportMode" size="mini" clearable placeholder="Transport By" style="width: 100%">
                        <el-option v-for="item in dictMap.inquiryTransportMode" :label="item.label" :value="item.value" :key="item.value"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="Customs clearance time limit" prop="clearanceLimit">
                      <el-input v-model="createItem.clearanceLimit" maxlength="128" size="mini" style="width: 100%" clearable placeholder="Customs clearance time limit" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="Delivery Time Limits" prop="deliveryLimit">
                      <el-input v-model="createItem.deliveryLimit" maxlength="128" size="mini" style="width: 100%" clearable placeholder="Delivery Time Limits" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="Customer" prop="custId">
                      <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="createItem.custId" size="mini" remote clearable :filterable="true" @visible-change="custVisibleChange" :remote-method="custFilterMehod" placeholder="Customer" @change="handleSelectCustid" style="width: 100%">
                        <el-option v-for="(item, index) in custidOptions" :label="item.label" :value="item.value" :key="index"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="Cargo Ready Time">
                      <el-date-picker v-model="createItem.cargoCustTime" size="mini" type="date" style="width: 100%" clearable placeholder="Cargo Ready Time" value-format="yyyy-MM-dd" />
                    </el-form-item>
                  </el-col>
                  <el-col v-if="!isImport" :span="6" :xl="{span: 8}">
                    <el-form-item label="CNEE Whether to have import rights" label-width="240px" prop="cnee" key="cnee">
                      <el-radio-group v-model="createItem.cnee">
                        <el-radio label="有">YES</el-radio>
                        <el-radio label="无">NO</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                  <el-col v-if="isImport" :span="6" :xl="{span: 8}">
                    <el-form-item label="Shipper Whether to have export rights" prop="shipperExport" key="shipperExport" label-width="240px">
                      <el-radio-group v-model="createItem.shipperExport">
                        <el-radio label="有">YES</el-radio>
                        <el-radio label="无">NO</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                  <el-col v-if="['ship_import_fcl','ship_import_lcl','air_import'].includes(createItem.businessType)" :span="6" :xl="{span: 8}">
                    <el-form-item label="Whether to send to the agent warehouse for loading" prop="needProxyBox" key="needProxyBox" label-width="320px">
                      <el-radio-group v-model="createItem.needProxyBox">
                        <el-radio label="是">YES</el-radio>
                        <el-radio label="否">NO</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="Inquiry Type" prop="isTradeEnquiries" key="isTradeEnquiries">
                      <el-radio-group v-model="createItem.isTradeEnquiries">
                        <el-radio v-for="(item,index) in dictMap.tradeEnquiriesType" :key="index" :label="item.value">{{item.label}}</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                  <el-col v-if="!isImport" :span="6" :xl="{span: 8}">
                    <el-form-item label="Whether to unpack and deliver" prop="isDeliveryUnboxing" key="isDeliveryUnboxing">
                      <el-radio-group v-model="createItem.isDeliveryUnboxing">
                        <el-radio label="y">YES</el-radio>
                        <el-radio label="n">NO</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="DG/NON DG" prop="isDangerous" key="isDangerous">
                      <el-radio-group v-model="createItem.isDangerous" @change="changeIsDangerous">
                        <el-radio label="yes">YES</el-radio>
                        <el-radio label="no">NO</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 8}" v-if="createItem.isDangerous==='yes'">
                    <el-form-item label="MSDS" prop="fileName">
                      <el-input v-show="false" v-model="createItem.fileName" placeholder=""></el-input>
                      <upload-input v-model="createItem.fileName" @downloadFile="handleDownload" @handleView="handleView" @uploadFile="addFile" @delFile="delFile" />
                    </el-form-item>
                  </el-col>

                </el-row>
                <el-divider></el-divider>
                <el-row :gutter="20">
                  <el-col :span="8" v-if="!detaileData">
                    <el-form-item label="Quoter" prop="quotationId" label-width="80px">
                      <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="createItem.quotationId" filterable size="mini" clearable placeholder="Please select" style="width: 100%" @change="quotationChange">
                        <el-option v-for="(item, index) in quotationList" :label="item.label" :value="item.employeeId" :key="index">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="Latest Reply Time">
                      <el-date-picker v-model="createItem.latestReplyTime" size="mini" type="date" style="width: 100%" clearable :picker-options="pickerOptions" placeholder="Please select" value-format="yyyy-MM-dd" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8" v-if="!detaileData">
                    <el-form-item label="Collaborator" prop="jointParticipantIdList" :show-message="false">
                      <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="createItem.jointParticipantIdList" multiple collapse-tags filterable size="mini" clearable placeholder="Please select" style="width: 100%">
                        <el-option v-for="(item, index) in employeeListAll" :disabled="userId===item.employeeId" :label="item.label" :value="item.employeeId" :key="index"> </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="24" v-if="['ship_export_fcl','ship_import_fcl','rail_export_fcl'].includes(createItem.businessType)">
          <div class="cargo-info-container" style="margin-bottom:0">
            <div class="cargo-info">
              <div class="cargo-info-title">
                <div class="title-name">Container</div>
                <div class="container-total">Total：<span v-for="(el,index) in containerTotal.containerList" :key="index">{{el.label}} * {{el.value}}，</span>{{containerTotal.weight}} KGS，{{containerTotal.volume}} CBM</div>
                <el-button class="title-add-btn" size="mini" type="primary" @click="handleAddContainer">Add</el-button>
              </div>
              <div class="cargo-info-main">
                <el-row :gutter="10" v-for="(item,index) in createItem.containers" class="cargo-info-content" :key="index" :style="{marginBottom:(index!=createItem.containers.length-1?'16px':'0')}">
                  <el-col :span="4" :xl="{span: 3}">
                    <el-form-item label="Container Type" label-width="85px" :prop="`containers.${index}.containerType`" :rules="rules.containerType">
                      <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" filterable size="mini" v-model="item.containerType" style="width: 100%" clearable placeholder="Please select">
                        <el-option v-for="item in dictMap.containerTypeShiporder" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="4" :xl="{span: 3}">
                    <el-form-item label="Number" label-width="70px" :prop="`containers.${index}.containerNum`" :rules="rules.containerNum">
                      <el-input size="mini" v-model.number="item.containerNum" clearable placeholder="Please input" @input="checkIntegerQuantity(item.containerNum, 'Number')" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 4}">
                    <el-form-item label="Number for per cabinet" label-width="130px" :prop="`containers.${index}.quantity`" :rules="rules.quantity">
                      <el-input clearable size="mini" style="width: 100%" placeholder="Please input" @input="checkIntegerQuantity(item.quantity, 'Number for per cabinet')" v-model.number="item.quantity"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="3" :xl="{span: 2}">
                    <el-form-item label-width="2px" :required="!!item.quantity" :prop="`containers.${index}.packageInfo`">
                      <span slot="label">Package</span>
                      <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" filterable size="mini" v-model="item.packageInfo" style="width: 100%" clearable placeholder="Please select">
                        <el-option v-for="item in dictMap.packageType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="7" :xl="{span: 8}">
                    <el-form-item label="Weight for per cabinet" label-width="130px" :prop="`containers.${index}.weight`" :rules="rules.weight">
                      <el-input clearable size="mini" style="width: 100%" @input="checkNumInputMaxVal(item.weight,'Weight for per cabinet')" placeholder="Please input" v-model="item.weight">
                        <template slot="append">KGS</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 8}">
                    <el-form-item label="Volume for per cabinet" label-width="130px" :prop="`containers.${index}.volume`" :rules="rules.volume">
                      <el-input clearable size="mini" @input="checkNumInputMaxVal(item.volume,'Volume for per cabinet')" style="width: 100%" placeholder="Please input" v-model="item.volume">
                        <template slot="append">CBM</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <div class="del-btn">
                    <div v-if="createItem.containers.length>1" class="del-icon" @click="handleDelContainer(index)"></div>
                  </div>
                </el-row>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="24" v-if="!['ship_export_fcl','ship_import_fcl','rail_export_fcl'].includes(createItem.businessType)">
          <div class="cargo-info-container" style="margin-top:0">
            <div class="cargo-info">
              <div class="cargo-info-title">
                <div class="title-name">Weight & Volume<el-tooltip class="pod-advise-text" effect="dark" content="Please enter the number of pieces, gross weight and volume of the goods" placement="top">
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </div>
                <div class="lcl-container-total">Total：<span v-for="(el,index) in lclContainerTotal.containerList" :key="index">{{el.label}} * {{el.value}}，</span>{{lclContainerTotal.weight}} KGS，{{lclContainerTotal.volume}} CBM</div>
                <el-button class="title-add-btn" size="mini" type="primary" @click="handleAddContainer">Add</el-button>
              </div>
              <div class="cargo-info-main">
                <el-row class="cargo-info-content" :gutter="10" v-for="(item,index) in createItem.containers" :key="index" :style="{marginBottom:(index!=createItem.containers.length-1?'16px':'0')}">
                  <el-col :span="4" :xl="{span: 4}">
                    <el-form-item label="Number" label-width="70px" :prop="`containers.${index}.quantity`" :rules="rules.lclQuantity">
                      <el-input clearable size="mini" style="width: 100%" placeholder="Please enter the number of pieces" @input="checkIntegerQuantity(item.quantity, 'Number')" v-model.number="item.quantity"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="2" :xl="{span: 2}">
                    <el-form-item label-width="2px" :required="!!item.quantity" :prop="`containers.${index}.packageInfo`">
                      <span slot="label">Package</span>
                      <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" filterable size="mini" v-model="item.packageInfo" style="width: 100%" clearable placeholder="Please select package">
                        <el-option v-for="item in dictMap.packageType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="4" :xl="{span: 4}">
                    <el-form-item label="Weight" label-width="70px" :prop="`containers.${index}.weight`" :rules="rules.lclWeight">
                      <el-input size="mini" v-model="item.weight" @input="checkNumInputMaxVal(item.weight,'Weight')" clearable placeholder="Please enter gross weight" style="width: 100%">
                        <template slot="append">KGS</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="4" :xl="{span: 4}">
                    <el-form-item label="Volume" label-width="70px" :prop="`containers.${index}.volume`" :rules="rules.lclVolume">
                      <el-input size="mini" v-model="item.volume" @input="checkNumInputMaxVal(item.volume,'Volume')" clearable placeholder="Please enter the volume" style="width: 100%">
                        <template slot="append">CBM</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="4" :xl="{span: 3}">
                    <el-form-item label="Length" label-width="70px" :prop="`containers.${index}.length`" :rules="rules.length">
                      <el-input clearable size="mini" @input="checkNumInputMaxVal(item.length,'Length',index,1)" style="width: 100%" placeholder="Length" v-model="item.length">
                        <template slot="append">M</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="4" :xl="{span: 3}">
                    <el-form-item label="Width" label-width="70px" :prop="`containers.${index}.width`" :rules="rules.width">
                      <el-input clearable size="mini" @input="checkNumInputMaxVal(item.width,'Width',index,1)" style="width: 100%" placeholder="Width" v-model="item.width">
                        <template slot="append">M</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="4" :xl="{span: 3}">
                    <el-form-item label="Height" label-width="70px" :prop="`containers.${index}.height`" :rules="rules.height">
                      <el-input clearable size="mini" @input="checkNumInputMaxVal(item.height,'Height',index,1)" style="width: 100%" placeholder="Height" v-model="item.height">
                        <template slot="append">M</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <div class="del-btn">
                    <div v-if="createItem.containers.length>1" class="del-icon" @click="handleDelContainer(index)"></div>
                  </div>
                </el-row>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="24" v-if="['ship_export_fcl','ship_import_fcl','rail_export_fcl'].includes(createItem.businessType)">
          <div class="cargo-info-container">
            <div class="cargo-info">
              <div class="cargo-info-title">
                <div class="title-name">HS CODE & Commodity</div>
                <el-button class="title-add-btn" size="mini" type="primary" @click="addExtraBedData">Add</el-button>
              </div>
              <div class="cargo-info-main">
                <el-row class="cargo-info-content" :gutter="10" v-for="(el,index) in createItem.hscodeCommodity" :key="index" :style="{marginBottom:(index!=createItem.hscodeCommodity.length-1?'16px':'0')}">
                  <el-col :span="6" :xl="{span: 4}">
                    <el-form-item label="HS CODE" label-width="85px" :prop="`hscodeCommodity.${index}.hsCode`" :rules="rules.hsCode">
                      <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" size="mini" v-model="el.hsCode" clearable style="width: 100%" remote filterable placeholder="HS CODE" @change="handleChangeHscode(el.hsCode,index)" :remote-method="(val) => queryCargoHscode(val,index)">
                        <el-option v-for="(item, i) in el.hscodeOptions || []" :key="i" :label="item.label" :value="item.value">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 4}">
                    <el-form-item label="Commodity" label-width="85px" :prop="`hscodeCommodity.${index}.commodity`" :rules="rules.commodity">
                      <el-input type="text" clearable maxlength="128" size="mini" placeholder="English Product Name" v-model="el.commodity"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 4}">
                    <el-form-item label="Number" label-width="85px" :prop="`hscodeCommodity.${index}.quantity`" :rules="rules.quantity">
                      <el-input clearable size="mini" style="width: 100%" placeholder="Please enter the number of pieces" @input="checkIntegerQuantity(el.quantity, 'Number')" v-model.number="el.quantity"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 4}">
                    <el-form-item label="Weight" label-width="85px" :prop="`hscodeCommodity.${index}.weight`" :rules="rules.hsWeight">
                      <el-input clearable size="mini" style="width: 100%" @input="checkNumInputMaxVal(el.weight,'Weight')" placeholder="Please enter the weight" v-model="el.weight">
                        <template slot="append">KGS</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 4}">
                    <el-form-item label="Volume" label-width="85px" :prop="`hscodeCommodity.${index}.volume`" :rules="rules.volume">
                      <el-input clearable size="mini" @input="checkNumInputMaxVal(el.volume,'Volume')" style="width: 100%" placeholder="Please enter the volume" v-model="el.volume">
                        <template slot="append">CBM</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 4}">
                    <el-form-item label="Length" label-width="85px" :prop="`hscodeCommodity.${index}.length`" :rules="rules.length">
                      <el-input clearable size="mini" @input="checkNumInputMaxVal(el.length,'Length',index,2)" style="width: 100%" placeholder="Please enter the length" v-model="el.length">
                        <template slot="append">M</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 4}">
                    <el-form-item label="Width" label-width="85px" :prop="`hscodeCommodity.${index}.width`" :rules="rules.width">
                      <el-input clearable size="mini" @input="checkNumInputMaxVal(el.width,'Width',index,2)" style="width: 100%" placeholder="Please enter the width" v-model="el.width">
                        <template slot="append">M</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" :xl="{span: 4}">
                    <el-form-item label="Height" label-width="85px" :prop="`hscodeCommodity.${index}.height`" :rules="rules.height">
                      <el-input clearable size="mini" @input="checkNumInputMaxVal(el.height,'Height',index,2)" style="width: 100%" placeholder="Please enter the height" v-model="el.height">
                        <template slot="append">M</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <div class="del-btn">
                    <div v-if="createItem.hscodeCommodity.length>1" class="del-icon" @click="delExtraBedData(index)"></div>
                  </div>
                </el-row>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="24" v-else>
          <div class="cargo-info-container">
            <div class="cargo-info">
              <div class="cargo-info-title">
                <div class="title-name">HS CODE & Commodity</div>
                <el-button class="title-add-btn" size="mini" type="primary" @click="addExtraBedData">Add</el-button>
              </div>
              <div class="cargo-info-main">
                <el-row :gutter="10">
                  <div v-for="(el,index) in createItem.hscodeCommodity" :key="index">
                    <el-col :span="5" :style="{marginBottom:(createItem.hscodeCommodity.length>2?'16px':'0')}">
                      <el-form-item label="HS CODE" label-width="70px" :prop="`hscodeCommodity.${index}.hsCode`" :rules="rules.hsCode">
                        <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" size="mini" v-model="el.hsCode" clearable style="width: 100%" remote filterable placeholder="HS CODE" @change="handleChangeHscode(el.hsCode,index)" :remote-method="(val) => queryCargoHscode(val,index)">
                          <el-option v-for="(item, i) in el.hscodeOptions || []" :key="i" :label="item.label" :value="item.value">
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="5" :style="{marginBottom:(createItem.hscodeCommodity.length>2?'16px':'0')}">
                      <el-form-item label="Commodity" label-width="85px" :prop="`hscodeCommodity.${index}.commodity`" :rules="rules.commodity">
                        <el-input type="text" clearable maxlength="32" size="mini" placeholder="English Name" v-model="el.commodity"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="2" :style="{marginBottom:(createItem.hscodeCommodity.length>2?'16px':'0')}">
                      <div class="del-btn hscode-del-btn">
                        <div v-if="createItem.hscodeCommodity.length>1" class="del-icon" @click="delExtraBedData(index)"></div>
                      </div>
                    </el-col>
                  </div>
                </el-row>
              </div>
            </div>
          </div>
        </el-col>
        <el-col v-if="!isImport" :span="24">
          <div class="cargo-info-container" style="margin-top:8px;margin-bottom:8px">
            <div class="cargo-info">
              <div class="cargo-info-title">
                <div class="title-name">Delivery Address</div>
                <el-button class="title-add-btn" size="mini" type="primary" @click="handleAddDelivery">Add</el-button>
              </div>
              <div class="cargo-info-main">
                <el-row class="cargo-info-content" :gutter="4" v-for="(item,index) in createItem.deliveryAddress" :key="index">
                  <el-col :span="8">
                    <el-form-item :prop="`deliveryAddress.${index}.loadPlace`" label-width="85px">
                      <span slot="label">Address{{index+1}}</span>
                      <el-cascader style="width:100%" size="mini" placeholder="Please select an address" filterable :emitPath="true" v-model="item.loadPlace" :options="loadPlaceData" :props="cityProps" clearable @change="(val)=> handleDeliveryChange(val,index)"></el-cascader>
                    </el-form-item>
                  </el-col>
                  <el-col :span="16">
                    <el-form-item :prop="`deliveryAddress.${index}.address`" :rules="rules.deliveryAddress" label-width="0">
                      <span slot="label">&nbsp;</span>
                      <el-input clearable maxlength="512" size="mini" placeholder="Please enter the detailed delivery address and postal code information" show-word-limit v-model="item.address"></el-input>
                    </el-form-item>
                  </el-col>
                  <div class="del-btn">
                    <div v-if="createItem.deliveryAddress.length>1" class="del-icon" @click="handleDelDelivery(index)"></div>
                  </div>
                </el-row>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="cargo-info-container" style="margin-top:8px;margin-bottom:8px">
            <div class="cargo-info">
              <div class="cargo-info-title">
                <div class="title-name">Pick-up Address</div>
                <el-button class="title-add-btn" size="mini" type="primary" @click="handleAddPickUp">Add</el-button>
              </div>
              <div class="cargo-info-main">
                <el-row class="cargo-info-content" :gutter="4" v-for="(item,index) in createItem.pickUpAddress" :key="index">
                  <el-col :span="8">
                    <el-form-item :prop="`pickUpAddress.${index}.loadPlace`" label-width="85px">
                      <span slot="label">Address{{index+1}}</span>
                      <el-cascader style="width:100%" size="mini" placeholder="Please select an address" filterable :emitPath="true" v-model="item.loadPlace" :options="loadPlaceData" :props="cityProps" clearable @change="(val)=> handlePickUpChange(val,index)"></el-cascader>
                    </el-form-item>
                  </el-col>
                  <el-col :span="16">
                    <el-form-item :prop="`pickUpAddress.${index}.address`" :rules="rules.pickAddress" label-width="0">
                      <span slot="label">&nbsp;</span>
                      <el-input clearable maxlength="512" size="mini" placeholder="Please enter detailed pickup address, postal code information" show-word-limit v-model="item.address"></el-input>
                    </el-form-item>
                  </el-col>
                  <div class="del-btn">
                    <div v-if="createItem.pickUpAddress.length>1" class="del-icon" @click="handleDelPickUp(index)"></div>
                  </div>
                </el-row>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="cargo-info-container" style="margin-bottom:0">
            <div class="cargo-info">
              <div class="cargo-info-title">
                <div class="title-name">Others</div>
              </div>
              <div class="cargo-info-main">
                <el-row>
                  <el-col :span="24">
                    <el-form-item label="Value" label-width="85px" prop="value">
                      <el-input type="textarea" clearable rows="2" maxlength="512" size="mini" placeholder="Please enter the value of the goods" show-word-limit v-model="createItem.value"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item label="Remarks" prop="remark" label-width="85px">
                      <el-input type="textarea" clearable rows="2" maxlength="1024" size="mini" placeholder="Other special requirements can be entered" show-word-limit v-model="createItem.remark"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item label="Annex" label-width="85px">
                      <el-upload ref="upload" drag class="upload-file-cont" action="#" multiple :auto-upload="false" :before-upload="getFile" :on-change="handleChangeFile" :on-remove="handleRemove" :http-request="uploadFile" :file-list='fileList' :disabled="!canSubmit">
                        <div class="file-upload">
                          <img class="file-upload-img" :src="require('@/assets/icon-upload.png')" />
                          <div class="file-upload__text">
                            <div class="txt">Click or drag and drop files here to import</div>
                            <p class="info">Support doc, docx, pdf, xls, xlsx, jpg, png, jpeg, bmp, tif, image, txt, zip, rar format files, and the file size is limited to 100M</p>
                          </div>
                        </div>
                      </el-upload>
                      <el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
        </el-col>

      </el-row>
    </el-form>
    <div class="remark-text" v-if="['ship_export_fcl','ship_import_fcl',].includes(createItem.businessType)">
      <p>Note: 1. Please inform whether the Chinese product is in the communication and intelligent manufacturing industry.</p>
      <p>2. Shipping needs to write clearly on the shipping company and FREE TIME days, etc. There are no specific requirements.</p>
    </div>
    <div class="remark-text" v-if="['ship_export_lcl','ship_import_lcl','rail_export_lcl'].includes(createItem.businessType)">
      <p>Note: 1. contact information and charges of the agent at the port of destination of the bulk cargo company, which must be given at the time of inquiry.</p>
      <p>2. bulk cargo weight, number of pieces, volume, cargo size this information must be available.</p>
      <p>3. Please inform whether the Chinese product is communication and intelligent manufacturing industry.</p>
    </div>
    <div class="remark-text" v-if="['ship_bulk_ro'].includes(createItem.businessType)">
      <p>Note: Please inform whether the Chinese product is communication and intelligent manufacturing industry</p>
    </div>
    <div class="remark-text" v-if="['air_export','air_import',].includes(createItem.businessType)">
      <p>Note: 1. Air weight, number of pieces, volume, cargo size this information must be available.</p>
      <p>2. air transport needs to write clearly the requirements of the airline company.</p>
      <p>3. Please inform whether the Chinese product is communication and intelligent manufacturing industry.</p>
    </div>
    <div v-if="uploadPopShow" class="dialog-20vh">
      <FileUpload @close="uploadPopClose" />
    </div>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index-en.vue'
import {
  baseEmployeeListName,
  portSystemLineInfo,
  countrySelectList
} from '@/api/base'
import { mapState } from 'vuex'
import { unique } from '@/utils/index'
import UploadInput from '@/components/Base/upload/upload-input-en.vue'
import { parseTime, randomString } from '@/utils'
import FileUpload from './fileUpload.vue'
import { cargoHscodeList } from '@/api/base'
import { potentialAndClient } from '@/api/crm/supplier'
import {
  checkQuantityWeightVolume,
  validateIntegerQuantityPositive,
  validateOverseasFreightIsOnlyEnchars
} from '@/utils/validate'
import { fclTruckIntrustRegion } from '@/api/base'
var timer = ''
export default {
  data() {
    return {
      podCountryList: [],
      cityProps: {
        value: 'ename',
        label: 'ename',
        children: 'children'
      },
      loadPlaceData: [],
      employeeListAll: [],
      pickerOptions: {
        disabledDate(v) {
          return v.getTime() < new Date().getTime() - 86400000
        }
      },
      custidOptions: [],
      defaultFileSize: 100, //文件默认不超过100M
      sizeLimit: true,
      file: '',
      fileList: [],
      fileData: '',
      showProcess: false,
      processLength: 0,
      bkgAgentSupplierOptions: [],
      uploadPopShow: false,
      isDangerousOptions: [
        { label: 'YES', value: 'yes' },
        { label: 'NO', value: 'no' }
      ],
      canExportOptions: [
        { label: '有', value: '有' },
        { label: '无', value: '无' }
      ],
      carrierArr: [],
      podArr: [], // POD
      polArr: [], // POL
      quotationList: [],
      dialogConfig: {
        title: 'Initiate Inquiry',
        show: true,
        size: 'medium',
        width: '80vw'
      },
      createItem: {
        needProxyBox: '',
        shipperExport: '',
        jointParticipantIdList: [],
        businessType: 'ship_export_fcl',
        quotationId: '',
        quotationName: '',
        cargoCustTime: '',
        polCode: '',
        podCode: '',
        pol: '',
        pod: '',
        carrier: [],
        cnee: '',
        term: [],
        container: '',
        isDangerous: '',
        weight: '',
        number: null,
        volume: null,
        value: '',
        deliveryPickUpaddress: '',
        remark: '',
        fileNo: '',
        fileName: '',
        lclDestinationAgent: '',
        lclDestinationAgentName: '',
        countryName: '',
        hscodeCommodity: [
          {
            hsCode: '',
            commodity: '',
            hscodeOptions: [],
            weight: '',
            volume: '',
            quantity: '',
            length: '',
            width: '',
            height: ''
          }
        ],
        containers: [
          {
            containerType: '',
            containerNum: '',
            weight: '',
            volume: '',
            quantity: '',
            packageInfo: '',
            length: '',
            width: '',
            height: ''
          }
        ],
        tradeTermsCode: '', // 贸易条款
        etaDate: '',
        etdDate: '',
        isTradeEnquiries: '', // 询盘类型,y/n
        clearanceLimit: '',
        deliveryLimit: '',
        podTransportMode: '', //目的港派送运输方式
        custId: '',
        custName: '',
        latestReplyTime: '', //最迟回复时间
        deliveryAddress: [
          {
            loadPlace: [],
            address: '',
            dpCountry: '',
            dpProvince: '',
            dpCity: '',
            dpDistrict: '',
            addressType: 'DELIVERY'
          }
        ],
        pickUpAddress: [
          {
            loadPlace: [],
            address: '',
            dpCountry: '',
            dpProvince: '',
            dpCity: '',
            dpDistrict: '',
            addressType: 'PICK'
          }
        ],
        startDateTerm: '',
        endDateTerm: '',
        isDeliveryUnboxing: '',
        sysLineName: '',
        sysLineCode: '',
        polCountryName: ''
      },
      rules: {
        isDeliveryUnboxing: [
          { required: false, message: '请选择', trigger: 'change' }
        ],
        needProxyBox: [
          { required: false, message: '请选择', trigger: 'change' }
        ],
        shipperExport: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        countryName: [{ required: true, message: '请选择', trigger: 'change' }],
        loadPlace: [{ required: true, message: '请选择', trigger: 'change' }],
        businessType: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        quotationId: [{ required: true, message: '请选择', trigger: 'change' }],
        polCode: [{ required: true, message: '请选择', trigger: 'change' }],
        podCode: [{ required: false, message: '请选择', trigger: 'change' }],
        carrier: [{ required: true, message: '请选择', trigger: 'change' }],
        cnee: [{ required: true, message: '请选择', trigger: 'change' }],
        term: [{ required: true, message: '请选择', trigger: 'change' }],
        container: [{ required: true, message: '请选择', trigger: 'change' }],
        isDangerous: [{ required: true, message: '请选择', trigger: 'change' }],
        weight: [
          { required: true, message: '请选择', trigger: 'change' },
          { validator: checkQuantityWeightVolume(), trigger: 'change' }
        ],
        hsWeight: [
          { required: false, message: '请选择', trigger: 'change' },
          { validator: checkQuantityWeightVolume(), trigger: 'change' }
        ],
        volume: [
          { required: false, message: '请选择', trigger: 'change' },
          { validator: checkQuantityWeightVolume(), trigger: 'change' }
        ],
        length: [
          { required: false, message: '请选择', trigger: 'change' },
          { validator: checkQuantityWeightVolume(), trigger: 'change' }
        ],
        width: [
          { required: false, message: '请选择', trigger: 'change' },
          { validator: checkQuantityWeightVolume(), trigger: 'change' }
        ],
        height: [
          { required: false, message: '请选择', trigger: 'change' },
          { validator: checkQuantityWeightVolume(), trigger: 'change' }
        ],
        number: [
          { required: true, message: '请选择', trigger: 'change' },
          { validator: validateIntegerQuantityPositive(), trigger: 'change' }
        ],
        quantity: [
          { required: false, message: '请选择', trigger: 'change' },
          { validator: validateIntegerQuantityPositive(), trigger: 'change' }
        ],
        value: [
          { required: false, message: '请选择', trigger: 'change' },
          {
            validator: validateOverseasFreightIsOnlyEnchars(),
            trigger: 'change'
          }
        ],
        pickAddress: [
          { required: true, message: '请选择', trigger: 'change' },
          {
            validator: validateOverseasFreightIsOnlyEnchars(),
            trigger: 'change'
          }
        ],
        deliveryAddress: [
          { required: true, message: '请选择', trigger: 'change' },
          {
            validator: validateOverseasFreightIsOnlyEnchars(),
            trigger: 'change'
          }
        ],
        remark: [
          { required: true, message: '请选择', trigger: 'change' },
          {
            validator: validateOverseasFreightIsOnlyEnchars(),
            trigger: 'change'
          }
        ],
        fileName: [{ required: true, message: '请选择', trigger: 'change' }],
        hsCode: [{ required: true, message: '请选择', trigger: 'change' }],
        commodity: [
          { required: true, message: '请选择', trigger: 'change' },
          {
            validator: validateOverseasFreightIsOnlyEnchars(),
            trigger: 'change'
          }
        ],
        lclDestinationAgentName: [
          { required: false, message: '请选择', trigger: 'change' },
          {
            validator: validateOverseasFreightIsOnlyEnchars(),
            trigger: 'change'
          }
        ],
        containerType: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        containerNum: [
          { required: true, message: '请选择', trigger: 'change' },
          { validator: validateIntegerQuantityPositive(), trigger: 'change' }
        ],
        tradeTermsCode: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        isTradeEnquiries: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        clearanceLimit: [
          { required: false, message: '请选择', trigger: 'change' },
          {
            validator: validateOverseasFreightIsOnlyEnchars(),
            trigger: 'change'
          }
        ],
        deliveryLimit: [
          { required: false, message: '请选择', trigger: 'change' },
          {
            validator: validateOverseasFreightIsOnlyEnchars(),
            trigger: 'change'
          }
        ],
        podTransportMode: [
          { required: false, message: '请选择', trigger: 'change' }
        ],
        lclQuantity: [
          { required: true, message: '请选择', trigger: 'change' },
          { validator: validateIntegerQuantityPositive(), trigger: 'change' }
        ],
        lclWeight: [
          { required: true, message: '请选择', trigger: 'change' },
          { validator: checkQuantityWeightVolume(), trigger: 'change' }
        ],
        lclVolume: [
          { required: true, message: '请选择', trigger: 'change' },
          { validator: checkQuantityWeightVolume(), trigger: 'change' }
        ]
      },
      businessTypeList: [
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
    }
  },
  props: {
    detaileData: {
      type: [Object, Boolean],
      default: false
    },
    lastInquiryData: {
      type: [Object, Boolean],
      default: false
    },
    canSubmit: {
      type: Boolean,
      default: true
    }
  },
  created() {
    //获取国家城市级联框数据
    this.getCountryList()
    this.getLoadPlaceData()
    this.getEmployeeNameAll()
    this.getEmployeeName()
    if (this.detaileData && this.detaileData.businessType) {
      this.createItem.businessType = this.detaileData.businessType
      this.createItem.polCode = this.detaileData.polCode
      this.createItem.podCode = this.detaileData.podCode
      this.createItem.pol = this.detaileData.pol
      this.createItem.pod = this.detaileData.pod
    }
    if (this.lastInquiryData && this.lastInquiryData.businessType) {
      this.createItem = JSON.parse(JSON.stringify(this.lastInquiryData))
      if (this.lastInquiryData.carrier) {
        this.createItem.carrier = this.lastInquiryData.carrier.split(',')
      }

      if (Array.isArray(this.lastInquiryData.deliveryOrPickUpAddress)) {
        let arr = []
        for (
          let i = 0;
          i < this.lastInquiryData.deliveryOrPickUpAddress.length;
          i++
        ) {
          let loadPlaceArr = []
          if (this.lastInquiryData.deliveryOrPickUpAddress[i].dpCountry) {
            if (
              this.lastInquiryData.deliveryOrPickUpAddress[i].dpCountry &&
              this.lastInquiryData.deliveryOrPickUpAddress[i].dpCountry ===
                '中国'
            ) {
              loadPlaceArr = [
                this.lastInquiryData.deliveryOrPickUpAddress[i].dpCountry,
                this.lastInquiryData.deliveryOrPickUpAddress[i].dpProvince,
                this.lastInquiryData.deliveryOrPickUpAddress[i].dpCity,
                this.lastInquiryData.deliveryOrPickUpAddress[i].dpDistrict
              ]
            } else {
              loadPlaceArr = [
                this.lastInquiryData.deliveryOrPickUpAddress[i].dpCountry
              ]
              if (this.lastInquiryData.deliveryOrPickUpAddress[i].dpProvince) {
                loadPlaceArr = [
                  this.lastInquiryData.deliveryOrPickUpAddress[i].dpCountry,
                  this.lastInquiryData.deliveryOrPickUpAddress[i].dpProvince
                ]
              }
            }
          }

          arr.push({
            loadPlace: loadPlaceArr,
            address:
              this.lastInquiryData.deliveryOrPickUpAddress[i].address || '',
            dpCountry:
              this.lastInquiryData.deliveryOrPickUpAddress[i].dpCountry || '',
            dpProvince:
              this.lastInquiryData.deliveryOrPickUpAddress[i].dpProvince || '',
            dpCity:
              this.lastInquiryData.deliveryOrPickUpAddress[i].dpCity || '',
            dpDistrict:
              this.lastInquiryData.deliveryOrPickUpAddress[i].dpDistrict || '',
            addressType:
              this.lastInquiryData.deliveryOrPickUpAddress[i].addressType || ''
          })
        }
        let deliveryAddress = arr.filter((el) => el.addressType === 'DELIVERY')
        let pickAddress = arr.filter((el) => el.addressType === 'PICK')

        if (deliveryAddress.length === 0) {
          deliveryAddress = [
            {
              address: '',
              dpCountry: '',
              dpProvince: '',
              dpCity: '',
              dpDistrict: '',
              addressType: 'DELIVERY'
            }
          ]
        }
        if (pickAddress.length === 0) {
          pickAddress = [
            {
              address: '',
              dpCountry: '',
              dpProvince: '',
              dpCity: '',
              dpDistrict: '',
              addressType: 'PICK'
            }
          ]
        }
        this.$set(this.createItem, 'deliveryAddress', deliveryAddress)
        this.$set(this.createItem, 'pickUpAddress', pickAddress)
      }

      if (this.lastInquiryData.otherFileName) {
        let fileNames = this.lastInquiryData.otherFileName.split(',')
        let fileNos = this.lastInquiryData.otherFileNo.split(',')
        for (let i = 0; i < fileNames.length; i++) {
          this.fileList.push({
            name: fileNames[i],
            fileNo: fileNos[i]
          })
        }
      }

      this.createItem.latestReplyTime = ''
    }
    if (
      !this.createItem.containers ||
      this.createItem.containers.length === 0
    ) {
      this.createItem.containers = [
        {
          containerType: '',
          containerNum: '',
          weight: '',
          volume: '',
          quantity: '',
          packageInfo: '',
          length: '',
          width: '',
          height: ''
        }
      ]
    }

    if (
      !this.createItem.hscodeCommodity ||
      this.createItem.hscodeCommodity.length === 0
    ) {
      this.createItem.hscodeCommodity = [
        {
          hsCode: '',
          commodity: '',
          hscodeOptions: [],
          weight: '',
          volume: '',
          quantity: '',
          length: '',
          width: '',
          height: ''
        }
      ]
    }
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      userId: (state) => state.user.userId,
      overseasFreightIsOnlyEnchars: (state) =>
        state.charge.overseasFreightIsOnlyEnchars
    }),
    isEnquirySon() {
      return !!this.detaileData
    },
    containerTotal() {
      // 箱型汇总
      let obj = {
        volume: 0,
        weight: 0,
        containerList: []
      }
      for (let i = 0; i < this.createItem.containers.length; i++) {
        if (
          this.createItem.containers[i].weight &&
          !isNaN(this.createItem.containers[i].weight) &&
          this.createItem.containers[i].containerNum &&
          !isNaN(this.createItem.containers[i].containerNum)
        ) {
          obj.weight +=
            this.createItem.containers[i].weight *
            this.createItem.containers[i].containerNum
        }
        if (
          this.createItem.containers[i].volume &&
          !isNaN(this.createItem.containers[i].volume) &&
          this.createItem.containers[i].containerNum &&
          !isNaN(this.createItem.containers[i].containerNum)
        ) {
          obj.volume +=
            this.createItem.containers[i].volume *
            this.createItem.containers[i].containerNum
        }

        if (
          this.createItem.containers[i].containerType &&
          this.createItem.containers[i].containerNum &&
          !isNaN(this.createItem.containers[i].containerNum)
        ) {
          if (
            !obj.containerList.find(
              (el) => this.createItem.containers[i].containerType == el.label
            )
          ) {
            obj.containerList.push({
              label: this.createItem.containers[i].containerType,
              value: this.createItem.containers[i].containerNum
            })
          } else {
            let index = obj.containerList.findIndex(
              (el) => this.createItem.containers[i].containerType == el.label
            )
            obj.containerList[index].value +=
              this.createItem.containers[i].containerNum
          }
        }
      }
      obj.weight = Number(obj.weight).fixed(3)
      obj.volume = Number(obj.volume).fixed(3)
      return obj
    },
    lclContainerTotal() {
      // 拼箱重量体积 汇总
      let obj = {
        volume: 0,
        weight: 0,
        containerList: []
      }
      for (let i = 0; i < this.createItem.containers.length; i++) {
        if (
          this.createItem.containers[i].weight &&
          this.createItem.containers[i].quantity &&
          !isNaN(this.createItem.containers[i].weight) &&
          !isNaN(this.createItem.containers[i].quantity)
        ) {
          obj.weight += Number(
            this.createItem.containers[i].weight *
              this.createItem.containers[i].quantity
          )
        }
        if (
          this.createItem.containers[i].volume &&
          !isNaN(this.createItem.containers[i].volume)
        ) {
          obj.volume += Number(this.createItem.containers[i].volume)
        }

        if (
          this.createItem.containers[i].packageInfo &&
          this.createItem.containers[i].quantity &&
          !isNaN(this.createItem.containers[i].quantity)
        ) {
          if (
            !obj.containerList.find(
              (el) => this.createItem.containers[i].packageInfo == el.label
            )
          ) {
            obj.containerList.push({
              label: this.createItem.containers[i].packageInfo,
              value: this.createItem.containers[i].quantity
            })
          } else {
            let index = obj.containerList.findIndex(
              (el) => this.createItem.containers[i].packageInfo == el.label
            )
            obj.containerList[index].value +=
              this.createItem.containers[i].quantity
          }
        }
      }
      obj.weight = Number(obj.weight).fixed(3)
      obj.volume = Number(obj.volume).fixed(3)
      return obj
    },
    isImport() {
      if (
        ['ship_import_fcl', 'ship_import_lcl', 'air_import'].includes(
          this.createItem.businessType
        )
      ) {
        return true
      } else {
        return false
      }
    }
  },
  watch: {
    isImport: {
      handler: function (newValue) {
        // https://www.tapd.cn/50827797/prong/stories/view/1150827797001009460
        if (newValue) {
          this.rules.polCode = [
            { required: false, message: '请选择', trigger: 'change' }
          ]
          this.rules.podCode = [
            { required: true, message: '请选择', trigger: 'change' }
          ]
          this.createItem.cnee = ''
          this.createItem.isDeliveryUnboxing = ''
        } else {
          this.rules.polCode = [
            { required: true, message: '请选择', trigger: 'change' }
          ]
          this.rules.podCode = [
            { required: false, message: '请选择', trigger: 'change' }
          ]

          this.createItem.shipperExport = ''
        }

        if (
          (['exw', 'fca', 'cif'].includes(this.createItem.tradeTermsCode) &&
            newValue) ||
          !newValue
        ) {
          //a.业务类型为海运出口整箱、海运出口拼箱、空运出口、铁路进出口整箱、铁路进出口拼箱、散杂滚装出口时，需必填；
          // b.贸易条款选择“EXW、FCA、CIF ”，且业务类型为海运进口整箱、海进口拼箱、空运进口，需必填；
          this.rules.hsCode = [
            { required: true, message: '请选择', trigger: 'change' }
          ]
          this.rules.commodity = [
            { required: true, message: '请选择', trigger: 'change' }
          ]
        } else {
          this.rules.hsCode = [
            { required: false, message: '请选择', trigger: 'change' }
          ]
          this.rules.commodity = [
            { required: false, message: '请选择', trigger: 'change' }
          ]
        }

        if (
          (['fca', 'cif'].includes(this.createItem.tradeTermsCode) &&
            newValue) ||
          this.createItem.tradeTermsCode === 'exw'
        ) {
          // 海外英文版
          this.rules.pickAddress = [
            { required: true, message: '请选择', trigger: 'change' },
            {
              validator: validateOverseasFreightIsOnlyEnchars(),
              trigger: 'change'
            }
          ]
        } else {
          this.rules.pickAddress = [
            { required: false, message: '请选择', trigger: 'change' },
            {
              validator: validateOverseasFreightIsOnlyEnchars(),
              trigger: 'change'
            }
          ]
        }
      },
      immediate: true
    },
    'createItem.businessType': {
      handler: function (val) {
        if (
          [
            'ship_export_lcl',
            'ship_import_lcl',
            'ship_import_fcl',
            'air_import',
            'ship_bulk_ro'
          ].includes(val)
        ) {
          this.rules.carrier = [
            { required: false, message: '请选择', trigger: 'change' }
          ]
        } else {
          this.rules.carrier = [
            { required: true, message: '请选择', trigger: 'change' }
          ]
        }
      },
      immediate: true
    },
    'createItem.tradeTermsCode': {
      handler: function (val) {
        if (
          (['exw', 'fca', 'cif'].includes(val) && this.isImport) ||
          !this.isImport
        ) {
          // https://www.tapd.cn/50827797/prong/stories/view/1150827797001009460
          this.rules.hsCode = [
            { required: true, message: '请选择', trigger: 'change' }
          ]
          this.rules.commodity = [
            { required: true, message: '请选择', trigger: 'change' }
          ]
        } else {
          this.rules.hsCode = [
            { required: false, message: '请选择', trigger: 'change' }
          ]
          this.rules.commodity = [
            { required: false, message: '请选择', trigger: 'change' }
          ]
        }

        if ((['fca', 'cif'].includes(val) && this.isImport) || val === 'exw') {
          // 海外英文版
          this.rules.pickAddress = [
            { required: true, message: '请选择', trigger: 'change' },
            {
              validator: validateOverseasFreightIsOnlyEnchars(),
              trigger: 'change'
            }
          ]
        } else {
          this.rules.pickAddress = [
            { required: false, message: '请选择', trigger: 'change' },
            {
              validator: validateOverseasFreightIsOnlyEnchars(),
              trigger: 'change'
            }
          ]
        }

        if (['dap', 'ddu', 'ddp'].includes(val)) {
          this.rules.deliveryAddress = [
            { required: true, message: '请选择', trigger: 'change' },
            {
              validator: validateOverseasFreightIsOnlyEnchars(),
              trigger: 'change'
            }
          ]
        } else {
          this.rules.deliveryAddress = [
            { required: false, message: '请选择', trigger: 'change' },
            {
              validator: validateOverseasFreightIsOnlyEnchars(),
              trigger: 'change'
            }
          ]
        }
      },
      immediate: true
    }
  },
  components: {
    BaseDialog,
    UploadInput,
    FileUpload
  },
  methods: {
    showCountry(isShow) {
      if (isShow) {
        this.podCountryList = []
        this.getCountryList(this.createItem.countryName)
      }
    },
    getCountryList(val) {
      countrySelectList({ countryCode: val, state: 'valid' })
        .then((res) => {
          if (res.code === 0) {
            this.podCountryList = res.data || []
          } else {
            this.podCountryList = []
          }
        })
        .catch(() => {})
    },
    //装货地点
    handleDeliveryChange(val, index) {
      this.createItem.deliveryAddress[index].dpCountry = val[0] || ''
      this.createItem.deliveryAddress[index].dpProvince = val[1] || ''
      this.createItem.deliveryAddress[index].dpCity = val[2] || ''
      this.createItem.deliveryAddress[index].dpDistrict = val[3] || ''
    },
    //装货地点
    handlePickUpChange(val, index) {
      this.createItem.pickUpAddress[index].dpCountry = val[0] || ''
      this.createItem.pickUpAddress[index].dpProvince = val[1] || ''
      this.createItem.pickUpAddress[index].dpCity = val[2] || ''
      this.createItem.pickUpAddress[index].dpDistrict = val[3] || ''
    },
    handleChildren(data) {
      // 循环遍历json数据
      for (var i = 0; i < data.length; i++) {
        if (!data[i].ename) {
          data[i].ename = data[i].cname
        }
        if (data[i].ename === 'CHINA') {
          data[i].ename = '中国'
        }
        if (data[i].children.length < 1) {
          // children若为空数组，则将children设为undefined
          data[i].children = undefined
        } else {
          // children若不为空数组，则继续 递归调用 本方法
          this.handleChildren(data[i].children)
        }
      }
      return data
    },
    //获取数据
    async getLoadPlaceData() {
      let res = await fclTruckIntrustRegion({})
      //处理最后一级children空数组
      this.loadPlaceData = this.handleChildren(res.data)
    },
    getEmployeeNameAll() {
      // 询价人可以选择所有人
      let data = {
        name: '',
        roleCode: ''
      }
      baseEmployeeListName(data).then((res) => {
        let data = res.data.filter((el) => el.status === 'on')
        this.employeeListAll = data.map((ele) => {
          let label = `${ele.cname} (${ele.ename}-${ele.deptName})`
          if (!ele.ename) {
            label = `${ele.cname} (${ele.deptName})`
          }
          return Object.assign(ele, {
            label: label
          })
        })
      })
    },
    getEmployeeName() {
      let data1 = {
        name: '',
        roleCode: 'ecs'
      }
      let data2 = {
        name: '',
        roleCode: 'epricing'
      }
      Promise.all([
        baseEmployeeListName(data1),
        baseEmployeeListName(data2)
      ]).then((res) => {
        let arr1 = Array.isArray(res[0].data)
          ? res[0].data.filter((el) => el.status === 'on')
          : []
        let arr2 = Array.isArray(res[1].data)
          ? res[1].data.filter((el) => el.status === 'on')
          : []
        let data = unique([...arr1, ...arr2], 'employeeId')
        this.quotationList = data.map((ele) => {
          let label = `${ele.cname} (${ele.ename}-${ele.deptName})`
          if (!ele.ename) {
            label = `${ele.cname} (${ele.deptName})`
          }
          return Object.assign(ele, {
            label: label
          })
        })
      })
    },
    handleSelectCustid(val) {
      if (val) {
        let findItem = this.custidOptions.find((item) => item.value === val)
        this.createItem.custName = findItem ? findItem.label : val
      } else {
        this.createItem.custName = ''
      }
    },
    custFilterMehod(val) {
      this.getCustList(val)
    },
    // 获取委托单位
    getCustList(val = '') {
      if (!val && this.createItem.custId) {
        this.custidOptions = [
          {
            value: this.createItem.custId,
            label: this.createItem.custName
          }
        ]
        return
      }
      let data = {
        currPage: 1,
        pageSize: 50,
        customerName: val
      }
      potentialAndClient(data).then((res) => {
        this.custidOptions = res.data.list.map((o) => {
          return {
            ...o,
            value: o.custid,
            label: o.ename || o.name
          }
        })
      })
    },
    custVisibleChange(val) {
      if (val) {
        this.getCustList()
      }
    },
    uploadFile(file) {
      this.fileData.append('fileName', file.file)
    },
    // 移除文件
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    // 新添加文件替换之前添加的文件
    handleChangeFile(file, fileList) {
      this.fileList = fileList
    },
    // 上传前钩子获取file名
    getFile(file) {
      this.file = file
      this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!this.sizeLimit) {
        this.$message.error(
          `Upload file size exceeds ${this.defaultFileSize}M limit`
        )
      }
      if (this.file.name.indexOf(',') != -1) {
        this.$message.error(`File names cannot contain English commas`)
        this.sizeLimit = false
      }
      return this.sizeLimit
    },
    handleAddDelivery() {
      this.createItem.deliveryAddress.push({
        loadPlace: [],
        address: '',
        dpCountry: '',
        dpProvince: '',
        dpCity: '',
        dpDistrict: '',
        addressType: 'DELIVERY'
      })
    },
    handleAddPickUp() {
      this.createItem.pickUpAddress.push({
        loadPlace: [],
        address: '',
        dpCountry: '',
        dpProvince: '',
        dpCity: '',
        dpDistrict: '',
        addressType: 'PICK'
      })
    },
    handleDelDelivery(index) {
      this.createItem.deliveryAddress.splice(index, 1)
    },
    handleDelPickUp(index) {
      this.createItem.pickUpAddress.splice(index, 1)
    },
    handleDelContainer(index) {
      this.createItem.containers.splice(index, 1)
    },
    handleAddContainer() {
      this.createItem.containers.push({
        containerType: '',
        containerNum: '',
        weight: '',
        volume: '',
        quantity: '',
        packageInfo: '',
        length: '',
        width: '',
        height: ''
      })
    },
    checkNumInputMaxVal(value, type, index, prop) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
        if (!value) {
        } else if (!reg.test(value) || value > 999999) {
          let lastStr = value.substr(value.length - 1, 1)
          if (isNaN(value)) {
            this.$message({
              message: `${type}Please enter a number not exceeding 999999, with a maximum of 3 decimal places`,
              type: 'error',
              duration: 2000
            })
          } else if (value > 999999) {
            this.$message({
              message: `${type}Please enter a number not exceeding 999999, with a maximum of 3 decimal places`,
              type: 'error',
              duration: 2000
            })
          } else if (value < 0) {
            this.$message({
              message: `Please enter a number greater than or equal to 0 for the ${type}, with a maximum of 3 decimal places`,
              type: 'error',
              duration: 2000
            })
          } else if (lastStr !== '.') {
            this.$message({
              message: `${type}Please enter a number not exceeding 999999, with a maximum of 3 decimal places`,
              type: 'error',
              duration: 2000
            })
          }
        } else {
          if (prop == 1) {
            if (
              // this.createItem.containers[index].quantity &&
              this.createItem.containers[index].length &&
              this.createItem.containers[index].width &&
              this.createItem.containers[index].height
            ) {
              this.createItem.containers[index].volume = Number(
                // this.createItem.containers[index].quantity *
                this.createItem.containers[index].length *
                  this.createItem.containers[index].width *
                  this.createItem.containers[index].height
              ).fixed(3)
            }
            if (
              // this.createItem.containers[index].quantity *
              this.createItem.containers[index].length *
                this.createItem.containers[index].width *
                this.createItem.containers[index].height >
              999999
            ) {
              this.$message({
                message: `Volume cannot be greater than 999999`,
                type: 'error'
              })
            }
          } else if (prop == 2) {
            if (
              this.createItem.hscodeCommodity[index].length &&
              this.createItem.hscodeCommodity[index].width &&
              this.createItem.hscodeCommodity[index].height
            ) {
              this.createItem.hscodeCommodity[index].volume = Number(
                this.createItem.hscodeCommodity[index].length *
                  this.createItem.hscodeCommodity[index].width *
                  this.createItem.hscodeCommodity[index].height
              ).fixed(3)
            }
            if (
              this.createItem.hscodeCommodity[index].length *
                this.createItem.hscodeCommodity[index].width *
                this.createItem.hscodeCommodity[index].height >
              999999
            ) {
              this.$message({
                message: `Volume cannot be greater than 999999`,
                type: 'error'
              })
            }
          }
        }
      }, 800)
    },
    checkIntegerQuantity(value, prop) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (value) {
          let reg = /^([1-9][0-9]*)$/
          if (!reg.test(value)) {
            this.$set(this.createItem, 'number', null)
            this.$message({
              message: `Please enter an integer greater than 0 for the ${prop}`,
              type: 'error',
              duration: 2000
            })
          } else if (value > 999999) {
            this.$set(this.createItem, 'number', 999999)
            this.$message({
              message: `${prop} cannot exceed 999999`,
              type: 'error',
              duration: 2000
            })
          }
        } else if (value === 0) {
          this.$set(this.createItem, 'number', '')
          this.$message({
            message: `Please enter an integer greater than 0`,
            type: 'error',
            duration: 2000
          })
        }
      }, 800)
    },
    bkgAgentSupplierRemoteMethod(queryString, name) {
      this.getSupplierList(queryString, name)
    },
    // 获取订舱代理
    getSupplierList(queryString, name) {
      let queryValue = ''
      if (name && !queryString) {
        // 有选中值&&搜索条件不是空
        queryValue = name
      } else {
        queryValue = queryString
      }
      this.$store
        .dispatch('dict/queryAllSupplierList', {
          queryString: queryValue
        })
        .then((data) => {
          if (data.list && data.list.length) {
            this.bkgAgentSupplierOptions = data.list.map((ele) => {
              return Object.assign(ele, {
                label: this.$language == 'en' ? ele.ename : ele.name,
                value: ele.supplierId ? Number(ele.supplierId) : ''
              })
            })
          } else {
            this.bkgAgentSupplierOptions = []
          }
        })
    },
    selectBkgAgentSupplier(val) {
      // 反选订舱代理name
      if (!val) {
        this.createItem.lclDestinationAgentName = ''
      } else {
        this.createItem.lclDestinationAgentName =
          this.bkgAgentSupplierOptions.find((e) => val == e.value).label
      }
    },
    changeIsDangerous(val) {
      if (val === 'no') {
        this.delFile()
      }
    },
    changeBusinessType(val) {
      // 修改业务类型
      this.podArr = []
      this.polArr = []
      this.createItem.pol = ''
      this.createItem.pod = ''
      this.createItem.polCode = ''
      this.createItem.podCode = ''
      this.carrierArr = []
      this.createItem.carrier = []
      this.createItem.lclDestinationAgent = ''
      this.createItem.lclDestinationAgentName = ''
      this.createItem.weight = ''
      this.createItem.sysLineName = ''
      this.createItem.sysLineCode = ''
      this.createItem.containers = [
        {
          containerType: '',
          containerNum: '',
          weight: '',
          volume: '',
          quantity: '',
          packageInfo: '',
          length: '',
          width: '',
          height: ''
        }
      ]
      this.createItem.polCountryName = ''
      this.createItem.countryName = ''
    },
    initSystemLine(val) {
      if (val) {
        portSystemLineInfo(val).then((response) => {
          let systemLineList = response.data
          if (systemLineList.length > 0) {
            let systemLine = systemLineList[0]
            this.createItem.sysLineCode = systemLine.sysLineCode
            this.createItem.sysLineName = systemLine.ename || systemLine.cname
          }
        })
      } else {
        this.createItem.sysLineName = item ? item.sysLineName : ''
        this.createItem.sysLineCode = item ? item.sysLineCode : ''
      }
    },
    changePodCode(val) {
      if (val) {
        let item = this.podArr.find((el) => el.value === val)
        this.createItem.pod = item ? item.ename : ''
        this.createItem.countryName = item ? item.countryEname : ''
        if (
          [
            'air_export',
            'air_import',
            'rail_export_fcl',
            'rail_export_lcl'
          ].includes(this.createItem.businessType)
        ) {
          this.createItem.sysLineName = item
            ? item.sysLineEname || item.sysLineName
            : ''
          this.createItem.sysLineCode = item ? item.sysLineCode : ''
        } else {
          this.initSystemLine(val)
        }
      } else {
        this.createItem.pod = ''
        this.createItem.countryName = ''
        this.createItem.sysLineName = ''
        this.createItem.sysLineCode = ''
      }
    },
    changePolCode(val) {
      if (val) {
        let item = this.polArr.find((el) => el.value === val)
        this.createItem.pol = item ? item.ename : ''
        this.createItem.polCountryName = item ? item.countryEname : ''
      } else {
        this.createItem.pol = ''
        this.createItem.polCountryName = ''
      }
    },
    delExtraBedData(index) {
      this.createItem.hscodeCommodity.splice(index, 1)
    },
    addExtraBedData() {
      this.createItem.hscodeCommodity.push({
        hsCode: '',
        commodity: '',
        hscodeOptions: [],
        weight: '',
        volume: '',
        quantity: '',
        length: '',
        width: '',
        height: ''
      })
    },
    handleChangeHscode(val, index) {
      if (!val) {
        this.$set(
          this.createItem.hscodeCommodity[index],
          'hscodeOptions',
          hscodeOptions || []
        )
      }
    },
    // hscode模糊查询
    queryCargoHscode(queryString, index) {
      if (queryString) {
        cargoHscodeList({ keyword: queryString }).then((response) => {
          let hscodeOptions = response.data.map((item) => {
            return Object.assign(item, {
              label: item.cargoDesc,
              value: item.hscode
            })
          })
          hscodeOptions = unique(hscodeOptions, 'value')
          this.$set(
            this.createItem.hscodeCommodity[index],
            'hscodeOptions',
            hscodeOptions || []
          )
        })
      } else {
        this.$set(this.createItem.hscodeCommodity[index], 'hscodeOptions', [])
      }
    },
    uploadPopClose(action, val) {
      this.uploadPopShow = false
      if (action === 'Confirm') {
        this.createItem.fileNo = val.fileNo
        this.createItem.fileName = val.name
      }
    },
    delFile() {
      // 删除文件
      this.createItem.fileName = ''
      this.createItem.fileNo = ''
    },
    addFile() {
      // 上传
      this.uploadPopShow = true
    },
    handleView() {
      this.$store.dispatch('order/previewFile', {
        fileNo: this.createItem.fileNo,
        fileName: this.createItem.fileName
      })
    },
    // 附件下载
    handleDownload() {
      this.$store
        .dispatch('order/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: this.createItem.fileNo
          }
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = this.createItem.fileName
          link.click()
        })
    },
    carrierVisibleMethod(val, data) {
      if (val) {
        this.carrierRemoteMethod('', data)
      }
    },
    carrierRemoteMethod(el, value) {
      // 远程搜索航空公司
      if (
        [
          'ship_export_fcl',
          'ship_export_lcl',
          'ship_import_fcl',
          'ship_import_lcl',
          'ship_bulk_ro'
        ].includes(this.createItem.businessType)
      ) {
        this.$store
          .dispatch('dict/baseShippingCarrierList', {
            name: el,
            state: 'valid'
          })
          .then((data) => {
            if (value && value.length > 0) {
              let arr = []
              for (let i = 0; i < value.length; i++) {
                arr.push({
                  value: value[i],
                  label: value[i]
                })
              }
              this.carrierArr = unique([...arr, ...data], 'value')
              this.createItem.carrier = []
              setTimeout(() => {
                this.createItem.carrier = value
              }, 0)
            } else {
              this.carrierArr = data
            }
          })
      } else if (
        ['air_export', 'air_import'].includes(this.createItem.businessType)
      ) {
        this.$store
          .dispatch('dict/aircarrierList', {
            carrierName: el
          })
          .then((data) => {
            let portList = data
              .map((ele) => {
                return Object.assign(ele, {
                  value: ele.itat,
                  label: ele.itat
                })
              })
              .filter((el) => el.itat)

            if (value && value.length > 0) {
              let arr = []
              for (let i = 0; i < value.length; i++) {
                arr.push({
                  value: value[i],
                  label: value[i]
                })
              }
              this.carrierArr = unique([...arr, ...portList], 'value')
              this.createItem.carrier = []
              setTimeout(() => {
                this.createItem.carrier = value
              }, 0)
            } else {
              this.carrierArr = portList
            }
          })
      }
    },
    // 空运港口
    portSearch(portName, state, type, code) {
      let params = {}
      if (code && !portName) {
        // 有选中值&&搜索条件不是空
        params = { portName: '', portCodes: code, state: state }
      } else {
        params = { portName: portName, portCodes: '', state: state }
      }
      if (
        [
          'ship_export_fcl',
          'ship_export_lcl',
          'ship_import_fcl',
          'ship_import_lcl',
          'ship_bulk_ro'
        ].includes(this.createItem.businessType)
      ) {
        this.$store
          .dispatch('dict/basePortList', {
            queryString: portName || code,
            portAttribute: 'port_of_basic',
            state: 'valid'
          })
          .then((data) => {
            let portList = data.map((ele) => {
              return Object.assign(ele, {
                label: ele.value,
                value: ele.key
              })
            })
            this[type] = [...portList]
          })
      } else if (
        ['air_export', 'air_import'].includes(this.createItem.businessType)
      ) {
        this.$store.dispatch('dict/airportList', params).then((data) => {
          let portList = data.map((ele) => {
            return Object.assign(ele, {
              value: ele.portCode,
              label: ele.portCode // `${ele.portCode} (${ele.ename}-${ele.cname})`
            })
          })
          this[type] = [...portList]
        })
      } else if (
        ['rail_export_fcl', 'rail_export_lcl'].includes(
          this.createItem.businessType
        )
      ) {
        let queryValue = portName
        if (type === 'podArr' && this.createItem.pod && !portName) {
          queryValue = this.createItem.pod
        } else if (type === 'polArr' && this.createItem.pol && !portName) {
          queryValue = this.createItem.pol
        }
        this.$store
          .dispatch('dict/baseRailPortList', { portName: queryValue })
          .then((data) => {
            this[type] = data
          })
      }
    },
    podPortFilterMehod(el, code) {
      // POD
      this.portSearch(el, 'valid', 'podArr', code)
    },
    polPortRemoteMethod(el, code) {
      // POL
      this.portSearch(el, 'valid', 'polArr', code)
    },
    quotationChange(val) {
      this.createItem.quotationName = this.quotationList.find(
        (el) => el.employeeId === val
      ).cname
    },
    close(action, value) {
      this.$emit('close', action, value)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.form.validate((valid) => {
          if (valid && this.canSubmit) {
            this.fileData = new FormData()
            this.$refs.upload.submit()
            let params = JSON.parse(JSON.stringify(this.createItem))
            params.startDateTerm = params.term[0]
            params.endDateTerm = params.term[1]
            let fileArr = this.fileList.filter((el) => el.fileNo)
            if (fileArr.length) {
              let otherFileNo = []
              let otherFileName = []
              for (let i = 0; i < fileArr.length; i++) {
                otherFileNo.push(fileArr[i].fileNo)
                otherFileName.push(fileArr[i].name)
              }
              params.otherFileNo = otherFileNo.join(',')
              params.otherFileName = otherFileName.join(',')
            } else {
              params.otherFileNo = ''
              params.otherFileName = ''
            }
            if (params.carrier) {
              params.carrier = params.carrier.join(',')
            }

            for (let i = 0; i < params.hscodeCommodity.length; i++) {
              params.hscodeCommodity[i].hscodeOptions = null
            }
            if (this.$route.query.id) {
              // 再次询价
              params.enquiryId = this.$route.query.id
              params.hscodeSonCommodity = params.hscodeCommodity
              delete params.hscodeCommodity
            }
            let deliveryAddressArr = []
            let deliveryAddress = params.deliveryAddress.filter(
              (el) => el.address || el.dpCountry
            )
            if (deliveryAddress.length > 0) {
              for (let i = 0; i < deliveryAddress.length; i++) {
                deliveryAddressArr.push({
                  address: deliveryAddress[i].address,
                  dpCountry: deliveryAddress[i].dpCountry,
                  dpProvince: deliveryAddress[i].dpProvince,
                  dpCity: deliveryAddress[i].dpCity,
                  dpDistrict: deliveryAddress[i].dpDistrict,
                  addressType: 'DELIVERY'
                })
              }
            }

            let pickUpAddressArr = []
            let pickUpAddress = params.pickUpAddress.filter(
              (el) => el.address || el.dpCountry
            )
            if (pickUpAddress.length > 0) {
              for (let i = 0; i < pickUpAddress.length; i++) {
                pickUpAddressArr.push({
                  address: pickUpAddress[i].address,
                  dpCountry: pickUpAddress[i].dpCountry,
                  dpProvince: pickUpAddress[i].dpProvince,
                  dpCity: pickUpAddress[i].dpCity,
                  dpDistrict: pickUpAddress[i].dpDistrict,
                  addressType: 'PICK'
                })
              }
            }

            params.deliveryOrPickUpAddress = [
              ...deliveryAddressArr,
              ...pickUpAddressArr
            ]
            delete params.deliveryAddress
            delete params.pickUpAddress

            let paramsData = {
              data: params,
              fromSystem: 'web_H5',
              toSystem: 'mng_base_server',
              reqId: randomString(),
              reqTime: parseTime(new Date().getTime())
            }
            this.fileData.append('jsonData', JSON.stringify(paramsData))
            if (this.sizeLimit) {
              this.close('Confirm', this.fileData)
            }
          } else {
            this.$msgErrClose(
              'Please fill in the fields in the red box as required!'
            )
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    }
  }
}
</script>

<style lang="scss">
#addInquiry {
  .el-radio__label {
    font-size: 12px;
  }
  .pod-advise-text {
    margin-left: 2px;
    cursor: pointer;
  }
  .pod-advise-text:hover {
    color: #3e80f5;
  }
  .el-input__prefix {
    height: 20px !important;
    line-height: 20px !important;
    color: #c0c4cc;
  }
  .el-input__icon {
    height: 20px !important;
    line-height: 20px !important;
  }
  .el-form-item {
    margin-bottom: 4px;
  }
  .el-range-editor--mini .el-range-separator {
    line-height: 12px;
    font-size: 12px;
  }
  .el-form-item__label,
  .el-form-item__content {
    line-height: 20px;
  }
  .remark-text {
    margin-top: 24px;
    padding-left: 40px;
  }
  .cargo-info-container {
    // padding-left: 130px;
    margin: 12px 0;
    .cargo-info {
      border-radius: 2px;
      border: 1px solid #d9d9d9;
      .cargo-info-title {
        height: 40px;
        background: #ebeef3;
        border-radius: 1px 1px 0px 0px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 16px;
        position: relative;
        .title-name {
          font-weight: bold;
          color: #222222;
        }
        .container-total {
          position: absolute;
          top: 0;
          left: 100px;
          height: 40px;
          display: flex;
          align-items: center;
        }
        .lcl-container-total {
          position: absolute;
          top: 0;
          left: 150px;
          height: 40px;
          display: flex;
          align-items: center;
        }
      }
      .cargo-info-main {
        padding: 16px;
        .del-btn {
          margin-left: 16px;
          .del-icon {
            height: 20px;
            width: 20px;
            background: url('../../../../../assets/icon_del.png') center center
              no-repeat;
            background-size: cover;
            cursor: pointer;
          }
        }
        .hscode-del-btn {
          padding-top: 20px;
        }
        .cargo-info-content {
          padding-right: 30px;
          position: relative;
          .del-btn {
            position: absolute;
            right: 0;
            top: 20px;
            margin-left: 16px;
            .del-icon {
              height: 20px;
              width: 20px;
              background: url('../../../../../assets/icon_del.png') center
                center no-repeat;
              background-size: cover;
              cursor: pointer;
            }
          }
        }
      }
    }
  }
}
</style>
