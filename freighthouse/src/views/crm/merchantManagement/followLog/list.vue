<template>
  <div
    class="follow-customer finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch
      ref="searchComp"
      :searchOption="searchOption1"
      @search="search"
      :border="true"
    />
    <!-- 跟进记录导出功能 -->
    <!-- <div class="btn-box">
      <el-button
        @click="handleExport"
        type="primary"
        size="mini"
        class="export-btn"
        >导出</el-button
      >
    </div> -->
    <div class="follow-list-box" id="follow-scroll" v-show="followList.length">
      <div class="follow-item" v-for="(item, index) in followList" :key="index">
        <!-- 国内客户 -->
        <div v-if="item.isForeignPeer!=='true'">
        <div class="follow-top" :class="{ border: item.showDetail }">
          <div class="left-cnt">
            <h3 class="name">{{ item.custName }}</h3>
            <div class="white-box">
              <img src="~@/assets/white.png" alt="" v-if="item.isWhitelist === 'yes'" /> {{ item.isWhitelist === 'yes' ? formatterIndustry(item.industry) : `所属行业：${formatterIndustry(item.industry)}`}}
            </div>
          </div>
          <div class="right-cnt">
            <div class="info-box">
              {{ item.bdEmployeeName }} 于<span v-if="item.commuTime"> {{ item.commuTime.slice(0, 10) }}</span>
              <span class="type">{{
                dictMapObj['custCommType'][item.commuType]
              }}</span>
              跟进
            </div>
            <div class="btn-box">
              <template v-if="item.isCheck === 'yes'">
                <el-button type="text" size="mini" disabled v-if="['', 'pass'].includes(item.flag)">已检查</el-button>
                <el-button type="text" size="mini" disabled class="redDis" v-if="['refuse'].includes(item.flag)">检查拒绝</el-button>
              </template>
              <template v-else>
                <template v-if="isManager">
                  <el-button
                    type="text"
                    size="mini"
                    class="red"
                    @click="check(item, 'pass')"
                    >检查通过</el-button
                  >
                  <el-button
                    type="text"
                    size="mini"
                    class="red"
                    @click="check(item, 'refuse', index)"
                    >检查不通过</el-button
                  >
                </template>
                <template v-else>
                  <el-button
                    type="text"
                    size="mini"
                    disabled
                    >未检查</el-button
                  >
                </template>
              </template>
              <el-button type="text" size="mini" @click="getDetail(item, index)"
                >详情
                <i class="el-icon-arrow-up" v-if="item.showDetail"></i>
                <i class="el-icon-arrow-down" v-else></i
              ></el-button>
            </div>
          </div>
        </div>
        <transition name="bounce">
          <div
            class="follow-cnt"
            v-if="item.detail && item.showDetail"
            :class="{ active: activeIndex === index }"
          >
            <div class="left-cnt">
              <div
                class="white-box"
                v-if="item.commuType === 'visit' && item.detail.visit"
              >
                <div class="item">
                  <label>公司规模：</label>{{ dictMapObj['orgScale'][item.detail.visit.companyScale]}}
                </div>
                <div class="item">
                  <label>公司地址：</label
                  >{{ item.detail.visit.companyAddress }}
                </div>
                <div class="item">
                  <div class="info-box">
                    <label>客情描述：</label>
                    <div class="info-cnt"  v-for="(ele, i) in item.detail.custDescription" :key="i">
                        <template v-if="ele.custContact">
                          {{i+1}}、姓名：
                          {{ ele.custContact.includes("#")?ele.custContact.split('#')[0]:ele.custContact}}
                          {{ ele.custContact.includes("#")?ele.custContact.split('#')[1]:'' }}
                          <span v-if="ele.custContactPosition">({{ ele.custContactPosition }})</span>
                          <span v-if="ele.telephone">电话:{{ele.telephone}}; </span>
                          <div>
                            <span v-if="ele.eduBack">教育背景:{{ele.eduBack}}<br/></span>
                            <span v-if="ele.familyBack">家庭背景:{{ele.familyBack}}<br/></span>
                            <span v-if="ele.professionalBack">从业背景:{{ele.professionalBack}}<br/></span>
                            <span v-if="ele.hobbies">性格爱好:{{ele.hobbies}}<br/></span>
                            <span v-if="ele.other">其他特殊情况或要求:{{ele.other}}</span>
                          </div>
                        </template>
                    </div>
                  </div>
                </div>
                <!-- <el-tooltip placement="top">
                  <div slot="content">
                    <span v-if="item.detail.visit.eduBack">教育背景:{{item.detail.visit.eduBack}}<br/></span>
                    <span v-if="item.detail.visit.familyBack">家庭背景:{{item.detail.visit.familyBack}}<br/></span>
                    <span v-if="item.detail.visit.professionalBack">从业背景:{{item.detail.visit.professionalBack}}<br/></span>
                    <span v-if="item.detail.visit.hobbies">性格爱好:{{item.detail.visit.hobbies}}<br/></span>
                    <span v-if="item.detail.visit.other">其他特殊情况或要求:{{item.detail.visit.other}}</span>
                  </div>
                  <div class="item">
                    <label>客户联系人：</label>        
                    {{(item.detail.visit.custContact.indexOf("#") != -1)?item.detail.visit.custContact.split('#')[0]:item.detail.visit.custContact}}
                    {{(item.detail.visit.custContact.indexOf("#") != -1)?item.detail.visit.custContact.split('#')[1]:''}}
                  </div>
                </el-tooltip>
                <div class="item">
                  <label>客户联系人职位：</label> {{ dictMapObj['customerRelationPosition'][item.detail.visit.custContactPosition]}}
                </div>
                <div class="item">
                  <label>通讯方式：</label>{{ item.detail.visit.commuMode }}
                </div> -->
                <div class="item">
                  <label>是否合作：</label
                  >{{ item.detail.isCooperation === 'yes' ? '是' : '否' }}
                </div>
                <div class="item">
                  <label>我司拜访人：</label
                  >{{ item.detail.visitors | formatVisitors }}
                </div>
                <div class="item">
                  <label>拜访人职位：</label> {{ dictMapObj['customerRelationPosition'][item.detail.visit.ourCompanyPosition]}}
                </div>
                <div class="item">
                  <label>询价类型：</label
                  >{{
                    dictMapObj['inquiryType'][item.detail.visit.inquiryType]
                  }}
                </div>
              <div class="item" v-if="item.detail.visit.competitor">
                <label>我司竞争对手：</label>{{ item.detail.visit.competitor }}
              </div>
              <div class="item" v-if="item.detail.visit.custCompetitor">
                <label>客户竞争对手：</label>{{ item.detail.visit.custCompetitor }}
              </div>
              </div>
              <div v-if="['qq', 'wechat', 'email', 'telephone', 'wechat_qq'].includes(item.commuType) && item.detail.visit">
                <!-- <el-tooltip placement="top">
                  <div slot="content">
                    <span v-if="item.detail.visit.eduBack">教育背景:{{item.detail.visit.eduBack}}<br/></span>
                    <span v-if="item.detail.visit.familyBack">家庭背景:{{item.detail.visit.familyBack}}<br/></span>
                    <span v-if="item.detail.visit.professionalBack">从业背景:{{item.detail.visit.professionalBack}}<br/></span>
                    <span v-if="item.detail.visit.hobbies">性格爱好:{{item.detail.visit.hobbies}}<br/></span>
                    <span v-if="item.detail.visit.other">其他特殊情况或要求:{{item.detail.visit.other}}</span>
                  </div>
                  <div class="next-step">
                    客户联系人：
                  {{ (item.detail.visit.custContact.indexOf("#") != -1)?item.detail.visit.custContact.split('#')[0]:item.detail.visit.custContact}}
                  {{ (item.detail.visit.custContact.indexOf("#") != -1)?item.detail.visit.custContact.split('#')[1]:'' }}
                  </div>
                </el-tooltip>
                  <div class="next-step">
                  客户联系人职位：{{item.detail.visit.custContactPosition}}
                  </div>
                  <div class="next-step">
                    通讯方式：{{ item.detail.visit.commuMode }}
                  </div> -->
                  <div class="item">
                    <div class="info-box">
                      <label>客情描述：</label>
                      <div class="info-cnt"  v-for="(ele, i) in item.detail.custDescription" :key="i">
                          <template v-if="ele.custContact">
                            {{i+1}}、姓名：
                            {{ ele.custContact.includes("#")?ele.custContact.split('#')[0]:ele.custContact}}
                            {{ ele.custContact.includes("#")?ele.custContact.split('#')[1]:'' }}
                            <span v-if="ele.custContactPosition">({{ ele.custContactPosition }})</span>
                            <span v-if="ele.telephone">电话:{{ele.telephone}}; </span>
                            <div>
                              <span v-if="ele.eduBack">教育背景:{{ele.eduBack}}<br/></span>
                              <span v-if="ele.familyBack">家庭背景:{{ele.familyBack}}<br/></span>
                              <span v-if="ele.professionalBack">从业背景:{{ele.professionalBack}}<br/></span>
                              <span v-if="ele.hobbies">性格爱好:{{ele.hobbies}}<br/></span>
                              <span v-if="ele.other">其他特殊情况或要求:{{ele.other}}</span>
                            </div>
                          </template>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="next-step item" v-if="item.detail.visit">
                  <label>下一步计划：</label>{{ item.detail.visit.nextPlan }}
                </div>
                <div class="next-step item " v-if="item.commuType === 'inquiry_quotation' && item.detail.nextPlan">
                  <label>下一步计划：</label>{{ item.detail.nextPlan }}
                </div>
              <div v-if="['refuse'].includes(item.detail.flag)" class="creat-box">
                <p>{{ item.detail.updatedName }} 于 {{ item.detail.updatedTime }} 检查不通过</p>
                <p class="mt5" style="word-break: break-all;">拒绝原因：{{ item.detail.reason }}</p>
              </div>
              <div class="creat-box">
                {{ item.detail.createdName }} 于 {{ item.detail.createdTime }} 创建
                <el-button
                  type="text"
                  size="mini"
                  @click="showLog(item)"
                  >日志</el-button
                >
              </div>
            </div>
            <div class="right-cnt">
              <!-- 拜访 -->
              <template v-if="item.commuType === 'visit' && item.detail.visit">
                <div class="item">
                  <label>业务类型：</label
                  ><span>{{
                    item.detail.visit.businessType | formatBusiness(dictMapObj)
                  }}</span>
                </div>
                <div class="item">
                  <label>出货类型 & 频率：</label
                  >{{
                    item.detail.visit.shipmentType
                      | formatShipmentType(dictMapObj)
                  }};
                  {{
                    dictMapObj['shipmentFrequency'][
                      item.detail.visit.shipmentFrequency
                    ]
                  }}
                </div>
                <div class="item" v-if="item.detail.visit.rankTime">
                  <label>客户所在行业排名：</label><span>{{ item.detail.visit.rankTime}} 年度 {{item.detail.visit.rank}}</span>
                </div>
                <div class="item">
                  <label>出货航线：</label>
                  <div class="info-box">
                    <div
                      class="info-cnt"
                      v-for="(ele, i) in item.detail.syslines"
                      :key="i"
                    >
                  <template v-if="ele.containerNum">
                    {{ ele.polPortCname }} -> {{ ele.podPortCname }}, {{ ele.sysLineCname }},
                    {{ dictMapObj['baseBusinessType'][ele.businessType]}}:
                    {{ ele.containerNum }}/ {{ele.containerType}}/
                    <span v-if="ele.cycle =='free'">{{ele.beginTime}} - {{ele.endTime}} </span>
                    <span v-else>{{ dictMapObj['commuCycleFree'][ele.cycle] }} </span>
                  </template>

                    </div>
                  </div>
                </div>
                 <div class="item">
                  <label>出货货量：</label>
                  {{ item.detail.visit.shipmentsTeu }}T /
                  {{ dictMapObj['commuCycleFree'][item.detail.visit.shipmentsCycle]}}
                  <label>长帆目标占比：</label>
                  {{ item.detail.visit.goalProportion }}
                </div>
                <div class="item">
                  <label>贸易条款：</label>
                  <div class="info-box">
                    <div
                      class="info-cnt"
                      v-for="(ele, i) in item.detail.tradeTerms"
                      :key="i"
                    >
                    {{ ele.tradeCode.toUpperCase() }}
                      <span v-if="ele.shippingAddr">:{{ ele.shippingAddr}}</span>
                      , {{ dictMapObj['baseBusinessType'][ele.businessType]}}：{{ ele.containerNum }}/ {{ele.containerType}}/
                    <span v-if="ele.cycle =='free'">{{ele.beginTime}} - {{ele.endTime}} </span>
                    <span v-else>{{ dictMapObj['commuCycleFree'][ele.cycle] }} </span>
                    </div>
                  </div>
                </div>
                <div class="item">
                  <label>主要产品：</label>
                  <div class="info-box">
                    <div
                      class="info-cnt"
                      v-for="(ele, i) in item.detail.cargos"
                      :key="i"
                    >
                  {{ ele.hscode }} (HS Code), {{ ele.cname }}, {{ ele.ename }};
                  单柜货值： {{ ele.singleValue }}{{ ele.currency }} / {{ ele.containerType }}
                    </div>
                  </div>
                </div>
                <div class="item flex-item">
                  <label>主要需求：</label>
                  <div class="info-box">
                    <div
                      class="info-cnt"
                      v-for="(ele, i) in item.detail.demands"
                      :key="i"
                    >
                      {{ dictMapObj['customerDemand'][ele.demandType] }},
                      <span v-if="ele.portPosType"
                        >{{ dictMapObj['portPosType'][ele.portPosType] }},</span
                      >
                      {{ ele.remark }}
                    </div>
                  </div>
                </div>
                <div class="item">
                  <label>历史需求：</label>
                  <div class="info-cnt">
                    <el-popover placement="right" width="500" trigger="click" @show="getHistoryDemands(item)">
                      <el-table :data="item.gridData" class="history-cnt" >
                        <el-table-column
                          width="100"
                          property="commuTime"
                          label="跟进时间"
                          :formatter="(row) => row.commuTime.slice(0,10)"
                        ></el-table-column>
                        <el-table-column
                          property="demands"
                          label="客户主要需求"
                        >
                          <template slot-scope="scope">
                            <p
                              class="item"
                              v-for="(ele, index) in scope.row.demands"
                              :key="index"
                            >
                              {{ dictMapObj['customerDemand'][ele.demandType] }},
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
                      <el-button slot="reference" type="text" size="mini" class="his-btn"
                        >查看</el-button
                      >
                    </el-popover>
                  </div>
                </div>
                 <div class="item" v-if="item.detail.turnovers.length">
                  <label>客户营业额：</label>
                  <div class="info-box">
                    <div class="info-cnt" v-for="(ele, i) in item.detail.turnovers" :key="i">
                      {{ ele.turnoverYear }} (年度)：{{ ele.turnoverPoar }} {{ ele.currency }},
                      营业额中出口占比：  {{ ele.turnoverExports }}
                    </div>
                  </div>
                </div>
                <div class="item">
                  <label>物料、资料准备：</label
                  >{{ item.detail.visit.materialDocPrepare }}
                </div>
                <div class="item">
                  <label>拜访(访谈)目标：</label
                  >{{ item.detail.visit.visitTarget }}
                </div>
                <div class="item">
                  <label>拜访(访谈)复盘：</label
                  >{{ item.detail.visit.visitCheck }}
                </div>
                <div class="item">
                  <label>目前存在的困难：</label
                  >{{ item.detail.visit.difficulty }}
                </div>
                <div class="item" v-if="item.detail.visit.derivable">
                  <label style="width: 120px;">可衍生的&转介绍客户：</label><span style="margin-left: 10px; display: inline-block"></span>{{ item.detail.visit.derivable }}
                </div>
                <!-- <div class="item">
                  <label>客情描述 ：</label
                  >{{ item.detail.visit.customerSituation }}
                </div> -->
                <div class="item">
                  <label>延伸信息：</label>{{ item.detail.visit.extInfo }}
                </div>
                <div class="item">
                  <label>备注：</label>{{ item.detail.visit.remark }}
                </div>
              </template>
              <!-- 询价 -->
              <template
                v-if="
                  item.commuType === 'inquiry_quotation' && item.detail.inquiry
                "
              >
                <div class="item">
                  <label>出货航线：</label>
                  <div class="info-box">
                    <div
                      class="info-cnt"
                      v-for="(ele, i) in item.detail.syslines"
                      :key="i"
                    >
                    <template v-if="ele.containerNum">
                      {{ ele.polPortCname }} -> {{ ele.podPortCname }},{{ ele.sysLineCname }},
                      {{ dictMapObj['baseBusinessType'][ele.businessType]}}:
                      {{ ele.containerNum }}/ {{ele.containerType}}/
                      <span v-if="ele.cycle =='free'">{{ele.beginTime}} - {{ele.endTime}} </span>
                      <span v-else>{{ dictMapObj['commuCycleFree'][ele.cycle] }} </span>
                    </template>
                    </div>
                  </div>
                </div>
                <div class="item" v-if="item.detail.cargos.length">
                  <label>主要产品：</label>
                  <div class="info-box">
                    <div class="info-cnt" v-for="(ele, i) in item.cargos" :key="i">
                      {{ ele.hscode }} (HS Code), {{ ele.cname }}, {{ ele.ename }};
                      单柜货值： {{ ele.singleValue }}{{ ele.currency }} / {{ ele.containerType }}
                    </div>
                  </div>
                </div>
                
                <div class="item">
                  <label>货好时间：</label
                  >{{ item.detail.inquiry.goodsReadyTime }}
                </div>
               <div class="item flex-item" v-if="item.detail.demands.length">
                  <label>主要需求：</label>
                  <div class="info-box">
                    <div class="info-cnt" v-for="(ele, i) in item.demands" :key="i">
                      {{ dictMapObj['customerDemand'][ele.demandType] }},
                      <span v-if="ele.portPosType"
                        >{{ dictMapObj['portPosType'][ele.portPosType] }},</span
                      >
                      {{ ele.remark }}
                    </div>
                  </div>
                </div>
                <div class="item">
                  <label>历史需求：</label>
                  <div class="info-cnt">
                    <el-popover placement="right" width="500" trigger="click" @show="getHistoryDemands(item)">
                      <el-table :data="item.gridData" class="history-cnt" >
                        <el-table-column
                          width="100"
                          property="commuTime"
                          label="跟进时间"
                          :formatter="(row) => row.commuTime.slice(0,10)"
                        ></el-table-column>
                        <el-table-column
                          property="demands"
                          label="客户主要需求"
                        >
                          <template slot-scope="scope">
                            <p
                              class="item"
                              v-for="(ele, index) in scope.row.demands"
                              :key="index"
                            >
                              {{ dictMapObj['customerDemand'][ele.demandType] }},
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
                      <el-button slot="reference" type="text" size="mini" class="his-btn"
                        >查看</el-button
                      >
                    </el-popover>
                  </div>
                </div>
                <div class="item">
                  <label>是否合作：</label
                  >{{ item.detail.isCooperation === 'yes' ? '是' : '否' }}
                </div>
                <div class="item" v-if="item.detail.noCooperationReason">
                  <label>未合作原因：</label
                  >{{ item.detail.noCooperationReason }}
                </div>
                <!-- <div class="item">
                  <label>备注：</label>{{ item.detail.remark }}
                </div> -->
              </template>
              <!-- qq email telephone wechat -->
              <template
                v-if="
                  ['qq', 'wechat', 'email', 'telephone'].includes(
                    item.commuType,
                  ) && item.detail.visit
                "
              >
                <div class="item">
                  <label>出货类型：</label
                  >{{
                    item.detail.visit.shipmentType
                      | formatShipmentType(dictMapObj)
                  }}
                </div>
                <div class="item">
                  <label>出货航线：</label>
                  <div class="info-box">
                    <div
                      class="info-cnt"
                      v-for="(ele, i) in item.detail.syslines"
                      :key="i"
                    >
                      {{ ele.polPortCname }} -> {{ ele.podPortCname }}, {{ ele.sysLineCname }},
                      {{ dictMapObj['baseBusinessType'][ele.businessType]}}:
                      {{ ele.containerNum }}/ {{ele.containerType}}/
                      <span v-if="ele.cycle =='free'">{{ele.beginTime}} - {{ele.endTime}} </span>
                      <span v-else>{{ dictMapObj['commuCycleFree'][ele.cycle] }} </span>
                    </div>
                  </div>
                </div>
                <div class="item">
                  <label>出货货量：</label>
                  {{ item.detail.visit.shipmentsTeu }}T /
                  {{ dictMapObj['commuCycleFree'][item.detail.visit.shipmentsCycle]}}
                  <label>长帆目标占比：</label>
                  {{ item.detail.visit.goalProportion }}
                </div>
                <div class="item">
                  <label>主要产品：</label>
                  <div class="info-box">
                    <div class="info-cnt" v-for="(ele, i) in item.detail.cargos" :key="i">
                      {{ ele.hscode }} (HS Code), {{ ele.cname }}, {{ ele.ename }};
                      单柜货值：{{ ele.singleValue }}{{ ele.currency }} / {{ ele.containerType }}
                    </div>
                  </div>
                </div>
                <div class="item flex-item" v-if="item.detail.demands.length">
                  <label>主要需求：</label>
                  <div class="info-box">
                    <div class="info-cnt" v-for="(ele, i) in item.demands" :key="i">
                      {{ dictMapObj['customerDemand'][ele.demandType] }},
                      <span v-if="ele.portPosType"
                        >{{ dictMapObj['portPosType'][ele.portPosType] }},</span
                      >
                      {{ ele.remark }}
                    </div>
                  </div>
                </div>
                <div class="item">
                  <label>历史需求：</label>
                  <div class="info-cnt">
                    <el-popover placement="right" width="500" trigger="click" @show="getHistoryDemands(item)">
                      <el-table :data="item.gridData" class="history-cnt" >
                        <el-table-column
                          width="100"
                          property="commuTime"
                          label="跟进时间"
                          :formatter="(row) => row.commuTime.slice(0,10)"
                        ></el-table-column>
                        <el-table-column
                          property="demands"
                          label="客户主要需求"
                        >
                          <template slot-scope="scope">
                            <p
                              class="item"
                              v-for="(ele, index) in scope.row.demands"
                              :key="index"
                            >
                              {{ dictMapObj['customerDemand'][ele.demandType] }},
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
                      <el-button slot="reference" type="text" size="mini" class="his-btn"
                        >查看</el-button
                      >
                    </el-popover>
                  </div>
                </div>
                <div class="item">
                  <label>贸易条款：</label>
                  <div class="info-box">
                    <div
                      class="info-cnt"
                      v-for="(ele, i) in item.detail.tradeTerms"
                      :key="i"
                    >
                    {{ ele.tradeCode.toUpperCase() }}
                      <span v-if="ele.shippingAddr">:{{ ele.shippingAddr}}</span>
                    , {{ dictMapObj['baseBusinessType'][ele.businessType]}}：{{ ele.containerNum }}/ {{ele.containerType}}/
                    <span v-if="ele.cycle =='free'">{{ele.beginTime}} - {{ele.endTime}} </span>
                    <span v-else>{{ dictMapObj['commuCycleFree'][ele.cycle] }} </span>
                    </div>
                  </div>
                </div>
                <div class="item flex-item">
                  <label>主要需求：</label>
                  <div class="info-box">
                    <div
                      class="info-cnt"
                      v-for="(ele, i) in item.detail.demands"
                      :key="i"
                    >
                      {{ dictMapObj['customerDemand'][ele.demandType] }},
                      <span v-if="ele.portPosType"
                        >{{ dictMapObj['portPosType'][ele.portPosType] }},</span
                      >
                      {{ ele.remark }}
                    </div>
                  </div>
                </div>
                <div class="item">
                  <label>历史需求：</label>
                  <div class="info-cnt">
                    <el-popover placement="right" width="500" trigger="click" @show="getHistoryDemands(item)">
                      <el-table :data="item.gridData" class="history-cnt" >
                        <el-table-column
                          width="100"
                          property="commuTime"
                          label="跟进时间"
                          :formatter="(row) => row.commuTime.slice(0,10)"
                        ></el-table-column>
                        <el-table-column
                          property="demands"
                          label="客户主要需求"
                        >
                          <template slot-scope="scope">
                            <p
                              class="item"
                              v-for="(ele, index) in scope.row.demands"
                              :key="index"
                            >
                              {{ dictMapObj['customerDemand'][ele.demandType] }},
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
                      <el-button slot="reference" type="text" size="mini" class="his-btn"
                        >查看</el-button
                      >
                    </el-popover>
                  </div>
                </div>
                <div class="item">
                  <label>备注：</label>{{ item.detail.visit.remark }}
                </div>
              </template>
              <!-- <div class="item">
                <label>附件：</label>
                <ul class="file-list">
                  <li
                    @click="preview(ele)"
                    v-for="(ele, i) in item.detail.attachments"
                    :key="i"
                  >
                    {{ ele.name }}
                  </li>
                </ul>
              </div> -->
            </div>
          </div>
        </transition>
        </div>
      <!-- 国外客户 -->
        <div v-else>
        <div class="follow-top" :class="{ border: item.showDetail }">
          <div class="left-cnt">
            <h3 class="name">{{ item.custName }}</h3>
            <div class="white-box">
              <img src="~@/assets/white.png" alt="" v-if="item.isWhitelist === 'yes'" /> {{ item.isWhitelist === 'yes' ? formatterIndustry(item.industry) : `所属行业：${formatterIndustry(item.industry)}`}}
            </div>
          </div>
          <div class="right-cnt">
            <div class="info-box">
              {{ item.bdEmployeeName }} 于<span v-if="item.commuTime">{{ item.commuTime.slice(0, 10) }}</span>
              <span class="type">
                {{dictMapObj['custForeignPeerCommType'][item.commuType]}}
              </span>
              跟进
            </div>
            <div class="btn-box">
              <template v-if="item.isCheck === 'yes'">
                <el-button
                  type="text"
                  size="mini"
                  disabled
                  v-if="['', 'pass'].includes(item.flag)"
                  >已检查</el-button
                >
                <el-button
                  type="text"
                  size="mini"
                  disabled
                  class="redDis"
                  v-if="['refuse'].includes(item.flag)"
                  >检查拒绝</el-button
                >
              </template>
              <template v-else>
                <template v-if="isManager">
                  <el-button
                    type="text"
                    size="mini"
                    class="red"
                    @click="check(item, 'pass')"
                    >检查通过</el-button
                  >
                  <el-button
                    type="text"
                    size="mini"
                    class="red"
                    @click="check(item, 'refuse', index)"
                    >检查不通过</el-button
                  >
                </template>
                <template v-else>
                  <el-button
                    type="text"
                    size="mini"
                    disabled
                    >未检查</el-button
                  >
                </template>
              </template>
              <el-button type="text" size="mini" @click="getDetail(item, index)"
                >详情
                <i class="el-icon-arrow-up" v-if="item.showDetail"></i>
                <i class="el-icon-arrow-down" v-else></i
              ></el-button>
            </div>
          </div>
        </div>
        <transition name="bounce">
          <div
            class="follow-cnt"
            v-if="item.detail && item.showDetail"
            :class="{ active: activeIndex === index }"
          >
            <div class="left-cnt">
              <div class="white-box">
                <div class="item">
                  <label>公司规模：</label>{{ dictMapObj['orgScale'][item.detail.visit.companyScale]}}
                </div>
                <div class="item">
                  <label>公司地址：</label>{{ item.detail.visit.companyAddress }}
                </div>
                <div class="item" v-if="item.detail.visit.shippingFeatures">
                  <label>公司主要出货特点：</label>{{ item.detail.visit.shippingFeatures }}
                </div>
                <div class="item" v-if="item.detail.visit.competitor">
                  <label>我司竞争对手：</label>{{ item.detail.visit.competitor }}
                </div>
                <div class="item" v-if="item.detail.visit.custCompetitor">
                  <label>客户竞争对手：</label>{{ item.detail.visit.custCompetitor }}
                </div>
                <div class="item" v-if="item.detail.visit.countryRank">
                  <label>客户所在国家排名：</label>{{ item.detail.visit.countryRank }}
                </div>
                <div class="item" v-if="item.detail.visit.marketSharePoar">
                  <label>客户所占行业市场份额：</label>{{ item.detail.visit.marketSharePoar }}
                </div>
                <div class="item" v-if="item.detail.visit.majorTopics">
                  <label>跟进的主要议题：</label>{{ item.detail.visit.majorTopics }}
                </div>
                <div class="item" v-if="item.detail.visit.followedMatters">
                  <label>待跟进事项：</label>{{ item.detail.visit.followedMatters }}
                </div>
                <!-- 参与人 -->
                <div class="item">
                  <div class="info-box">
                    <label>我司参与人 ：</label>
                    <div class="info-cnt" v-for="(ele, i) in item.detail.ourVisitors" :key="i">
                        <template v-if="ele.ourCompanyId">
                          {{i+1}}、{{ ele.ourCompanyName }}
                          <span v-if="ele.ourCompanyPosition">({{dictMapObj['customerRelationPosition'][ele.ourCompanyPosition]}}) </span>
                          <div v-if="ele.ourCompanyPhone">联系方式：{{ele.ourCompanyPhone}}</div>
                        </template>
                    </div>
                  </div>
                </div>
                <div class="item">
                  <div class="info-box">
                    <label>客户参与人：</label>
                    <div class="info-cnt"  v-for="(ele, i) in item.detail.custVisitors" :key="i">
                        <template v-if="ele.custContact">
                          {{i+1}}、{{ (ele.custContact.indexOf("#") != -1)?ele.custContact.split('#')[0]:ele.custContact}}
                          {{ (ele.custContact.indexOf("#") != -1)?ele.custContact.split('#')[1]:'' }}
                          <span v-if="ele.custContactPosition">({{ ele.custContactPosition }})</span>
                          <div>联系方式：
                            <span v-if="ele.telephone">Tel:{{ele.telephone}}; </span>
                            <span v-if="ele.email">Email:{{ele.email}}; </span>
                            <span v-if="ele.landline">座机:{{ele.landline}}</span>
                          </div>
                        </template>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="['refuse'].includes(item.detail.flag)" class="creat-box">
                <p>{{ item.detail.updatedName }} 于 {{ item.detail.updatedTime }} 检查不通过</p>
                <p class="mt5" style="word-break: break-all;">拒绝原因：{{ item.detail.reason }}</p>
              </div>
              <div class="creat-box">
                {{ item.detail.createdName }} 于 {{ item.detail.createdTime }} 创建
                <el-button
                  type="text"
                  size="mini"
                  @click="showLog(item)"
                  >日志</el-button
                >
              </div>
            </div>
            <div class="right-cnt-for">
              <template v-if="item.detail.visit">
                 <!-- 出货航线和特点 -->
                <div class="item">
                  <label>出货航线和特点：</label>
                  <div class="info-box">
                    <label>POL -> POD ：</label>
                    <div class="info-cnt" v-for="(ele, i) in item.detail.shiplines" :key="i">
                        <template v-if="ele.containerNum">
                            {{ ele.polPortCname }} -> {{ ele.podPortCname }}, {{ ele.sysLineCname }},
                            大致{{ ele.containerNum }}T;
                            <div>出货特点：{{ele.shipFeatures}}</div>
                        </template>
                    </div>
                    <label>AOL -> AOD ：</label>
                    <div class="info-cnt"  v-for="(ele, i) in item.detail.airlines" :key="i">
                        <template v-if="ele.containerNum">
                            {{ ele.aolPortCname }} -> {{ ele.aodPortCname }}, {{ ele.airCommLines }},
                            大致{{ ele.containerNum }}T;
                            <div>出货特点：{{ele.shipFeatures}}</div>
                        </template>
                    </div>
                  </div>
                </div>
                <!-- KEY ACCOUNT -->      
                <div class="item" v-if="item.detail.foreigncargos.length">
                  <label>KEY ACCOUNT：</label>
                  <div class="info-box">
                    <div class="info-cnt" v-for="(ele, i) in item.detail.foreigncargos" :key="i">
                        <label>发货单位：</label><span>{{ ele.shippingUnit }};</span>
                        <label>POL -> POD：</label><span>{{ ele.polPortCname }} -> {{ ele.podPortCname }};</span>
                        <label>AOL -> AOD</label><span> {{ ele.aolPortCname }} -> {{ ele.aodPortCname }};</span>
                    </div>
                    <div class="ger">
                        <label>出货品名：</label><span> {{ item.detail.visit.shipmentName }};</span>
                        <label>核心需求：</label><span> {{ item.detail.visit.coreRequirements }};</span>
                        <label>我司在国内的主要竞争对手：</label><span> {{ item.detail.visit.domesticCompetitors }};</span>
                        <label>代理在目的港的主要竞争对手：</label><span> {{ item.detail.visit.destinationPortCompetitors }};</span>
                        <label>VOLUME：</label><span> {{ item.detail.visit.volume }};</span>
                        <label>稳定该客户所需的内部支持：</label><span> {{ item.detail.visit.internalSupport }};</span>
                    </div>
                  </div>
                </div>
                <div class="item">
                  <label>主要需求：</label>
                  <div class="info-box">
                    <div
                      class="info-cnt"
                      v-for="(ele, i) in item.detail.demands"
                      :key="i"
                    >
                      {{ dictMapObj['customerForPeerDemand'][ele.demandType] }},
                      <span v-if="ele.portPosType"
                        >{{ dictMapObj['portPosType'][ele.portPosType] }},</span
                      >
                      {{ ele.remark }}
                    </div>
                  </div>
                </div>
                <div class="item">
                  <label>历史需求：</label>
                  <div class="info-cnt">
                    <el-popover placement="right" width="500" trigger="click" @show="getHistoryDemands(item)">
                      <el-table :data="item.gridData" class="history-cnt" >
                        <el-table-column
                          width="100"
                          property="commuTime"
                          label="跟进时间"
                          :formatter="(row) => row.commuTime.slice(0,10)"
                        ></el-table-column>
                        <el-table-column
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
                      <el-button slot="reference" type="text" size="mini" class="his-btn"
                        >查看</el-button
                      >
                    </el-popover>
                  </div>
                </div>
                <div class="item">
                  <label>物料、资料准备：</label
                  >{{ item.detail.visit.materialDocPrepare }}
                </div>
                <div class="item" v-if="item.detail.visit.visitTarget">
                  <label v-if="['visit'].includes(item.commuType)">拜访目标：</label>
                  <label v-else-if="['video_conferencing','microsoft_teams_meeting'].includes(item.commuType)">会议目标：</label>
                  <label v-else>访谈目标：</label>
                  <span>{{ item.detail.visit.visitTarget }}</span>
                </div>
                <div class="item" v-if="item.detail.visit.visitCheck">
                  <label v-if="['visit'].includes(item.commuType)">拜访结果：</label>
                  <label v-else-if="['video_conferencing','microsoft_teams_meeting'].includes(item.commuType)">会议结果：</label>
                  <label v-else>访谈结果：</label>
                  <span>{{ item.detail.visit.visitCheck }}</span>
                </div>
                <div class="item">
                  <label>目前存在的困难：</label
                  >{{ item.detail.visit.difficulty }}
                </div>
                <div class="item" v-if="item.detail.visit.assist">
                  <label>需要哪方面协助：</label>  {{ item.detail.visit.assist }}
                </div>
                <!-- <div class="item">
                  <label>客情描述 ：</label
                  >{{ item.detail.visit.customerSituation }}
                </div> -->
                <div class="item">
                  <label>延伸信息：</label>{{ item.detail.visit.extInfo }}
                </div>
                <div class="item">
                  <label>备注：</label>{{ item.detail.visit.remark }}
                </div>
              </template>
              <!-- <div class="item">
                <label>附件：</label>
                <ul class="file-list">
                  <li
                    @click="preview(ele)"
                    v-for="(ele, i) in item.detail.attachments"
                    :key="i"
                  >
                    {{ ele.name }}
                  </li>
                </ul>
              </div> -->
            </div>
          </div>
        </transition>
        </div>
      </div>
      </div>
    <div class="empty" v-show="!followList.length">
      <NoData size="small" />
    </div>
    <!-- 填写检查不通过原因 -->
    <CrmDialog v-if="noPassReasonDialog.show" :option="noPassReasonDialog" @close="confirmNoPass"></CrmDialog>
    <!-- 日志 -->
    <CrmDialogTable :option="showLogOption" @close="dialogClose" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { officePreview } from '@/utils/office'
import { formatIndustry } from '@/utils/crm'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CrmDialog from '@/views/crm/components/crmDialog'
import CrmDialogTable from '@/views/crm/components/crmDialogTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import {departmentTreeList} from '@/api/companyResource'
import {
  allList,
  allListNew,
  exportPageList,
  allListDetail,
  followCheck,
  demandsList,
  followLogList
} from '@/api/crm/follow'
export default {
  name: 'FollowCustLog',
  mixins: [mixin],
  components: {
    FinanceSearch,
    CrmDialog,
    CrmDialogTable
  },
  data() {
    return {
      lsLoading: false,
      searchOption1: {},
      activeIndex: '',
      _exportSearchData: '',
      finished: false,
      currPage: 1,
      pageSize: 20,
      followList: [],
      departmentList: [],
      noPassReasonDialog: {
        show: false,
        title: '检查不通过',
        showClear: true,
        btnLoading: false,
        formItems: [
          {
            label: '不通过原因',
            type: 'textarea',
            prop: 'noPassReason',
            maxlength: 512,
            rules:
              [
                { required: true, message: '解除原因必填', trigger: 'blur'},
                { max: 512, message: '备注最大长度限制512位', trigger: 'blur' }
              ]
          }
        ],
        form: { noPassReason: ''}
      },
      curRow: {},
      showLogOption: {
        show: false,
        title: '日志',
        width: '800px',
        params: {
          commuId: '',
          custid: ''
        },
        tableOption: {
          getData: () => {
            followLogList(this.showLogOption.params).then(
              (res) => {
                this.showLogOption.tableOption.data.splice(
                  0,
                  100,
                  ...(res.data || []),
                )
              },
            )
          },
          columns: [
            { prop: 'opEmployeeName', label: '人员', minWidth: 100 },
            { prop: 'createdTime', label: '时间', minWidth: 150 },
            { prop: 'event', label: '关键节点', minWidth: 150 },
            { prop: 'remark', label: '备注', minWidth: 150 }
          ],
          data: []
        }
      }
    }
  },
  created() {
    this.deptSearch()
    this.searchOption1 = {
      // saveDefault: true,
      addFilter: {
        defaultSearchLength: 7,
        searchInputGroup: [
          {
            key: 'bdDeptCode',
            value: '',
            showType: '1',
            range: { min: '', max: '' }
          },
          {
            key: 'createdTime',
            value: '',
            showType: '1',
            range: { min: '', max: '' }
          },
          {
            key: 'commuTime',
            value: '',
            showType: '1',
            range: { min: '', max: '' }
          },
          {
            key: 'commuType',
            value: '',
            showType: '1',
            range: { min: '', max: '' }
          },
          {
            key: 'industry',
            value: '',
            showType: '1',
            range: { min: '', max: '' }
          },
          {
            key: 'isWhitelist',
            value: '',
            showType: '1',
            range: { min: '', max: '' }
          },
          {
            key: 'custName',
            value: '',
            showType: '1',
            range: { min: '', max: '' }
          }
        ],
        filterGroups: {
          bdDeptCode: {
            key: 'bdDeptCode',
            label: '跟进人部门',
            type: 'diyCascader',
            cascaderList: this.departmentList,
            cascaderProps: {
            children: 'childList',
            label: 'deptCname',
            value: 'deptCode',
            checkStrictly: true,
          },
          },
          createdTime: {
            key: 'createdTime',
            label: '创建时间',
            type: 'daterange',
            format: 'yyyy-MM-dd'
          },
          commuTime: { key: 'commuTime', label: '跟进时间', type: 'daterange',format: 'yyyy-MM-dd' },
          commuType: {
            key: 'commuType',
            label: '跟进方式',
            type: 'select',
            selectOptions: this.commuTypeList
          },
          industry: { key: 'industry', label: '所属行业', type: 'input' },
          isWhitelist: {
            key: 'isWhitelist',
            label: '是否白名单',
            type: 'select',
            propInDict: 'yesNo'
          },
          custName: { key: 'custName', label: '客户名称', type: 'input' }
        },
        callback: true,
        // dateArr: ['commuTime','createdTime']
      }
    }
  },
  methods: {
    // 转换所属行业
    formatterIndustry (str) {
      return formatIndustry(str)
    },
    // 所属部门下拉框
    deptSearch () {
      departmentTreeList({ state: 'valid' }).then((res) => {
        this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach(
        (item) =>
          (item.childList = item.childList.length
            ? this.getTreeData(item.childList)
            : undefined)
      )
      return data
    },
    // 获取主要需求
    getHistoryDemands(row) {
      if (row.gridData.length) {
        return
      }
      let { custid, bdEmployeeId } = row
      const data = {
        custid,
        flag: 'list',
        bdEmployeeId
      }
      demandsList(data)
        .then((res) => {
          if (res.code === 0) {
            row.gridData = res.data || []
          }
        })
        .catch(() => {})
    },
    // 获取详情
    getDetail(row, index, isRefresh) {
      this.activeIndex = index
      if (!isRefresh) {
        row.showDetail = !row.showDetail
        if (row.detail) {
          return
        }
      }
      const { commuId } = row
      const data = {
        commuId,
        custid:row.custid
      }
      this.lsLoading = true
      allListDetail(data)
        .then((res) => {
          if (res.code === 0) {
            row.detail = res.data
          }
        })
        .catch(() => {})
        .finally(() => {
          this.lsLoading = false
        })
    },
    edit(row, index){
      console.log('row',row)
    },
    // 搜索
    search(query) {
      this.followList = []
      this.currPage = 1
      this.finished = false
      this.getData(query)
    },
    // 获取数据
    getData(query) {
      const data = {
        currPage: this.currPage,
        pageSize: this.pageSize
      }
      if (query) {
        query.forEach(item => {
          let {column, value} = item
          if (column === 'bdDeptCode') {
            let v = value.split(',').pop()
            data[column] = v
          }
          else if (column ==='createdTime') {
            let source = value.split(',')
            if (source[0] === source[1]) {
              source[0] += ' 00:00:00'
              source[1] += ' 23:59:59'
            }
            data['beginCreatedTime'] = source[0]
            data['endCreatedTime'] = source[1]
          } else if (column ==='commuTime') {
            let source = value.split(',')
            data['beginCommuTime'] = source[0]
            data['endCommuTime'] = source[1]
          }
          else {
            data[column] = value
          }
        })
      }
      this._exportSearchData = data
      allListNew(data)
        .then((res) => {
          if (res.code === 0) {
            const arr = (res.data.list || []).map((item) =>
              Object.assign(item, { showDetail: false, detail: '', gridData:[] })
            )
            arr.length && this.followList.push(...arr)
            if (this.followList.length === arr.length) {
              this.getDetail(arr[0], 0)
            }
            if (this.followList.length >= res.data.totalCount) {
              this.finished = true
            }
            this.currPage += 1
          }
        })
        .catch(() => {})
        .finally(() => {
          this.lsLoading = false
        })
    },
    // 导出
    handleExport() {
      this.$confirm('是否确认导出？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (!this._exportSearchData) {
          this._exportSearchData = {
            currPage: this.option1.pagination.currPage,
            pageSize: this.option1.pagination.pageSize,
            query: []
          }
        }
        exportPageList(this._exportSearchData)
          .then((res) => {
            window.open(res.data.filePath)
          })
          .finally(() => {})
        }).catch(() => {});
    },
    // 滚动
    scrollBottom() {
      const ele = document.getElementById('follow-scroll')
      if (
        ele.scrollTop + ele.offsetHeight > ele.scrollHeight - 100 &&
        !this.finished
      ) {
        if (!this.lsLoading) {
          let query = this.$refs.searchComp.addFilterSearch()
          this.getData(query)
          this.lsLoading = true
        }
      }
    },
    // 预览
    preview(row) {
      const { fileNo, name } = row
      officePreview({ fileNo, name })
    },
    // 主管检查
    check(row, type, index) {
      if (!this.isManager) {
        return this.$msgErrClose('主管才有检查权限！')
      }
      this.curRow = row
      if (type === 'pass') {
        this.checkApi(type)
      } else if (type === 'refuse') {
        this.activeIndex = index
        this.noPassReasonDialog.show = true
      }
    },
    // 调用检查接口
    checkApi (type) {
      let data = {
        CustCommCheckDtos: [
          {
            commuId: this.curRow.commuId,
            flag: type,
            reason: this.noPassReasonDialog.form.noPassReason
          }
        ]
      }
      followCheck(data)
        .then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('检查成功！')
            this.curRow.flag = type
            this.curRow.isCheck = 'yes'
            if (type === 'refuse') {
              this.getDetail(this.curRow, this.activeIndex, true)
              this.closeNoPassReason()
            }
          }
        })
        .catch(() => {})
    },
    // 确认不通过
    confirmNoPass (tag) {
      if (!tag) {
        return this.closeNoPassReason()
      }
      this.checkApi('refuse')
    },
    // 关闭不通过原因弹框
    closeNoPassReason () {
      this.noPassReasonDialog.show = false
      this.noPassReasonDialog.form.noPassReason = ""
    },
    // 显示跟进日志
    showLog (row) {
      this.showLogOption.show = true
      this.showLogOption.params.custid = row.custid
      this.showLogOption.params.commuId = row.commuId
    },
    // 关闭日志弹框
    dialogClose() {
      this.showLogOption.show = false
    }
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    isManager() {
      return this.$store.state.user.roles.includes('manager')
    },
    commuTypeList () {
      return this.dictMap['custCommType'].filter(item => item.value !== 'order_record')
    }
  },
  filters: {
    formatShipmentType(val, dictMapObj) {
      if (val) {
        const type = val.split(',')
        return type
          .map((item) => dictMapObj['custCommShipmentType'][item])
          .join(', ')
      } else {
        return ''
      }
    },
    formatVisitors(val) {
      if (val) {
        return val.map((item) => item.visitEmployeeName).join(', ')
      } else {
        return ''
      }
    },
    formatBusiness(val, dictMapObj) {
      if (!val) {
        return ''
      }
      const type = val.split(',')
      return type.map((item) => dictMapObj['baseBusinessType'][item]).join(', ')
    }
  },
  activated() {
    this.followList = []
    this.currPage = 1
    this.finished = false
    this.getData()
  },
  mounted() {
    document
      .getElementById('follow-scroll')
      .addEventListener('scroll', this.scrollBottom) // 添加滚动事件，检测滚动到页面底部
  },
  beforeDestroy() {
    document
      .getElementById('follow-scroll')
      // .removeEventListener('scroll', this.scrollBottom)
  }
}
</script>

<style lang="scss" scoped>
.finance-page{
  	-moz-user-select: none; /*火狐*/
	  -webkit-user-select: none; /*webkit浏览器*/
	  -ms-user-select: none; /*IE10*/
	  -khtml-user-select: none; /*早期浏览器*/
	  -o-user-select:none;
	  user-select: none;
}
.history-cnt{
  max-height: 400px;
  overflow-y: auto;
}
.follow-customer {
  // margin: 14px;
  /deep/ .el-input__inner {
    line-height: 20px !important;
    height: 20px;
    .el-input__icon {
      line-height: 20px;
    }
  }
  .btn-box {
    display: flex;
    .export-btn {
      margin: 8px;
    }
    /deep/ .el-button + .el-button {
      margin-left: 0;
    }
    /deep/ .el-button {
      padding-left: 0;
      padding-right: 3px;
      &:nth-of-type(1) {
        padding-left: 5px;
      }
    }
  }
  .follow-list-box {
    height: calc(100vh - 170px);
    overflow: auto;
    padding: 8px;
    .follow-item {
      margin-bottom: 20px;
      border: 1px solid #eee;
      border-radius: 4px;
      .follow-top {
        display: flex;
        align-items: center;
        &.border {
          border-bottom: 1px solid #eee;
        }
        .left-cnt {
          width: 30%;
          background-color: #cfe9f4;
          padding: 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          .name {
            font-size: 14px;
          }
          .white-box {
            margin-top: 5px;
            display: flex;
            align-items: center;
            img {
              margin-right: 5px;
              transform: scale(0.8);
            }
          }
        }
        .right-cnt {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          .type {
            color: #03b915;
          }
        }
      }
      .follow-cnt {
        display: flex;
        &.active {
          background-color: #fff7e7;
        }
        .left-cnt {
          width: 30%;
          background-color: #cfe9f4;
          padding: 8px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          .item {
            // display: flex;
            margin-bottom: 10px;
            align-items: center;
            label {
              width: 85px;
              text-align: right;
              font-weight: 500;
            }
          }
          .creat-box {
            margin-top: 10px;
          }
        }
        .right-cnt {
          flex: 1;
          padding: 8px;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          .item {
            width: 45%;
            margin-bottom: 10px;
            display: flex;
            line-height: 20px;
            label {
              width: 110px;
              text-align: right;
              font-weight: 500;
              line-height: 20px;
            }
            .info-box{
              flex: 1;
            }
            .his-btn{
              padding: 0;
            }
            .file-list {
              li {
                cursor: pointer;
                color: #1890ff;
                margin-bottom: 5px;
                &:hover {
                  color: #46a6ff;
                  text-decoration: underline;
                }
              }
            }
          }
          .flex-item{
            width: 100%;
          }
        }
        .right-cnt-for{
          flex: 1;
          padding: 8px;
          .item {
            width: 90%;
            margin-bottom: 10px;
            display: flex;
            line-height: 20px;
            label {
              width: 110px;
              text-align: right;
              font-weight: 500;
              line-height: 20px;
            }
            .info-box{
              flex: 1;
            }
            .his-btn{
              padding: 0;
            }
            .file-list {
              li {
                cursor: pointer;
                color: #1890ff;
                margin-bottom: 5px;
                &:hover {
                  color: #46a6ff;
                  text-decoration: underline;
                }
              }
            }
          }
          .flex-item{
            width: 100%;
          }
        }
      }
    }
  }
  .redDis {
    color: #ff8989;
    &:hover {
      color: #ff8989
    }
  }
  .mt5 {
    margin-top: 5px;
  }
}
.bounce-enter-active {
  animation: bounce-in 0.6s;
}
.bounce-leave-active {
  animation: bounce-in 0.6s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

</style>
