<template>
  <div
    class="follow-cnt"
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    v-loading="lsLoading"
  >
    <div class="top-title">
      <el-button
        size="mini"
        @click="handleAdd(false)"
        type="primary"
        v-show="isBd && isSelf && !isBlacklist"
      >
        新增记录
      </el-button>
    </div>
    <div class="follow-list" id="follow-scroll">
      <div class="follow-content" v-for="(item, index) in followList" :key="index">
        <!-- 拜访计划 -->
        <template v-if="['bilateral', 'unilateral'].includes(item.relationFlag) && item.commuType === 'visit'">
          <div class="table-company-box">
            <p>
              <span class="table-type-title">拜访计划</span>
              <span v-if="['submit'].includes(item.custVisitPlan.flag)" class="table-type-status submit-btn">审核中</span>
              <span v-if="['pass'].includes(item.custVisitPlan.flag)" class="table-type-status pass-btn">审核通过</span>
              <span v-if="['refuse'].includes(item.custVisitPlan.flag)" class="table-type-status refuse-btn">审核不通过</span>
            </p>
            <p class="table-company-title">
              <span><b>{{ item.companyBusinessInfo.companyName }}</b></span>
              <span><b>拜访时间：{{ item.companyBusinessInfo.visitDate }}</b></span>
              <span><b>拜访地址：{{ item.companyBusinessInfo.visitAddress }}</b></span>
            </p>
            <div class="table-company-item">
              <span>业务情况：{{ item.companyBusinessInfo.businessSituation }}</span>
              <span>出口市场：{{ item.companyBusinessInfo.exportMarket }}</span>
              <span>公司情况介绍：{{ item.companyBusinessInfo.companyProfile }}</span>
              <span>未来战略国家市场：{{ item.companyBusinessInfo.nationalMarket }}</span>
              <span>贸易条款及占比：{{ formatList("tradeTerms", item.tradeTermsList) }}</span>
              <span>拜访(访谈)目标：{{ item.companyBusinessInfo.visitTarget }}</span>
              <span>每月出口量(TEU)：{{ item.companyBusinessInfo.monthlyExports }}</span>
              <span>谁在负责询价：{{ item.companyBusinessInfo.inquirer }}</span>
              <span>邀约我司陪访人：{{ formatList("accompanyName", item.accompanyNameLists) }}</span>
              <span>陪访人分工安排：{{ item.companyBusinessInfo.divisionLabor }}</span>
            </div>
            <div class="fee-info">
              <span>预估报销费用：{{ item.custVisitPlan.claimExpense }}</span>
              <span class="create-info">{{ item.custVisitPlan.createdName }}于{{ item.custVisitPlan.createdTime }}创建</span>
            </div>
          </div>
          <div class="link-icon">
            <img :src="require('@/assets/arrow.png')" style="width: 30px"/>
          </div>
        </template>
        <div class="table-company-box">
          <p v-if="['bilateral', 'unilateral'].includes(item.relationFlag) && item.commuType === 'visit'" class="table-type-title follow-title">跟进记录</p>
          <div v-if="item.visit||item.commuType ==='inquiry_quotation'" class="follow-item" :style="{padding: ['bilateral', 'unilateral'].includes(item.relationFlag) ? '10px 5px' : ''}">
            <div class="left-cnt">
              <div class="top-box">
                <h3 class="name">{{ item.custName }}</h3>
              </div>
              <div
                class="visit-box"
                v-if="item.commuType === 'visit' && item.visit"
              >
                <div class="white-box item">
                  <p>
                    <template  v-if="isWhitelist">
                      <img src="~@/assets/white.png" alt=""/> {{ formatterIndustry(item.industry) }}
                    </template>
                    <template v-else>
                      所属行业：{{ formatterIndustry(item.industry) }}
                    </template>
                  </p>
                </div>
                <div class="item">
                  <label>公司规模：</label
                  ><span>{{ dictMapObj['orgScale'][item.visit.companyScale]}}</span>
                </div>
                <div class="item">
                  <label>公司地址：</label
                  ><span>{{ item.visit.companyAddress }}</span>
                </div>
                <!-- <el-tooltip placement="top">
                  <div slot="content">
                    <span v-if="item.visit.eduBack">教育背景:{{item.visit.eduBack}}<br/></span>
                    <span v-if="item.visit.familyBack">家庭背景:{{item.visit.familyBack}}<br/></span>
                    <span v-if="item.visit.professionalBack">从业背景:{{item.visit.professionalBack}}<br/></span>
                    <span v-if="item.visit.hobbies">性格爱好:{{item.visit.hobbies}}<br/></span>
                    <span v-if="item.visit.other">其他特殊情况或要求:{{item.visit.other}}</span>
                  </div>
                  <div class="item">
                    <label>客户联系人：</label>
                    {{ (item.visit.custContact.indexOf("#") != -1)?item.visit.custContact.split('#')[0]:item.visit.custContact}}
                    {{ (item.visit.custContact.indexOf("#") != -1)?item.visit.custContact.split('#')[1]:'' }}
                  </div>
                </el-tooltip> -->
                <!-- <div class="item">
                  <label>客户联系人职位：</label> {{ dictMapObj['customerRelationPosition'][item.visit.custContactPosition] }}
                </div>
                <div class="item">
                  <label>通讯方式：</label>{{ item.visit.commuMode }}
                </div> -->
                <div class="item">
                  <label>是否合作：</label
                  >{{ item.isCooperation === 'yes' ? '是' : '否' }}
                </div>
                <div class="item">
                  <label>我司拜访人：</label>{{ item.visitors | formatVisitors }}
                </div>
                <div class="item">
                  <label>拜访人职位：</label> {{ dictMapObj['customerRelationPosition'][item.visit.ourCompanyPosition]}}
                </div>
                <div class="item">
                  <label>询价类型：</label
                  >{{ dictMapObj['inquiryType'][item.visit.inquiryType] }}
                </div>
                <div class="item" v-if="item.visit.competitor">
                  <label>我司竞争对手：</label>{{ item.visit.competitor }}
                </div>
                <div class="item" v-if="item.visit.custCompetitor">
                  <label>客户竞争对手：</label>{{ item.visit.custCompetitor }}
                </div>
                <!-- 客户联系人 -->
                <div class="item">
                  <div class="info-box">
                    <label>客情描述：</label>
                    <div class="info-cnt"  v-for="(ele, i) in item.custDescription" :key="i">
                        <template v-if="ele.custContact">
                          {{i+1}}、姓名：<b>{{ ele.custContact.includes("#")?ele.custContact.split('#')[0]:ele.custContact}}
                          {{ ele.custContact.includes("#")?ele.custContact.split('#')[1]:'' }}</b>
                          <span v-if="ele.custContactPosition"> 职位：({{ ele.custContactPosition }}),</span>
                          <span v-if="ele.telephone">电话:{{ele.telephone}} </span>
                          <div>
                            <span v-if="ele.eduBack">教育背景：{{ele.eduBack}}<br/></span>
                            <span v-if="ele.familyBack">家庭背景：{{ele.familyBack}}<br/></span>
                            <span v-if="ele.professionalBack">从业背景：{{ele.professionalBack}}<br/></span>
                            <span v-if="ele.hobbies">性格爱好：{{ele.hobbies}}<br/></span>
                            <span v-if="ele.other">其他特殊情况或要求：{{ele.other}}</span>
                          </div>
                        </template>
                    </div>
                  </div>
                </div>
              </div>
              <!-- QQ -->
              <div v-if="['qq', 'wechat', 'email', 'telephone', 'wechat_qq'].includes(item.commuType) && item.visit">
                <div class="item">
                  <div class="info-box">
                    <label>客情描述：</label>
                    <div class="info-cnt"  v-for="(ele, i) in item.custDescription" :key="i">
                        <template v-if="ele.custContact">
                          {{i+1}}、姓名：<b>{{ ele.custContact.includes("#")?ele.custContact.split('#')[0]:ele.custContact}}
                          {{ ele.custContact.includes("#")?ele.custContact.split('#')[1]:'' }}</b>
                          <span v-if="ele.custContactPosition"> 职位：({{ ele.custContactPosition }}),</span>
                          <span v-if="ele.telephone"> 电话：{{ele.telephone}}</span>
                          <div>
                            <span v-if="ele.eduBack">教育背景：{{ele.eduBack}}<br/></span>
                            <span v-if="ele.familyBack">家庭背景：{{ele.familyBack}}<br/></span>
                            <span v-if="ele.professionalBack">从业背景：{{ele.professionalBack}}<br/></span>
                            <span v-if="ele.hobbies">性格爱好：{{ele.hobbies}}<br/></span>
                            <span v-if="ele.other">其他特殊情况或要求：{{ele.other}}</span>
                          </div>
                        </template>
                    </div>
                  </div>
                </div>
                </div>
                <div class="next-step" v-if="item.visit">
                  下一步计划：{{ item.visit.nextPlan }}
                </div>
                <div class="next-step" v-if="item.commuType === 'inquiry_quotation' && item.nextPlan">
                  下一步计划：{{ item.nextPlan }}
                </div>
              <div v-if="['refuse'].includes(item.flag)" class="creat-box">
                <p>{{ item.updatedName }} 于 {{ item.updatedTime }} 检查不通过</p>
                <p class="mt5" style="word-break: break-all;">拒绝原因：{{ item.reason }}</p>
              </div>
              <div class="creat-box">
                {{ item.createdName }} 于 {{ item.createdTime }} 创建
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
              <template v-if="item.commuType === 'visit' && item.visit">
                <div class="item">
                  <label>业务类型：</label
                  ><span>{{ item.visit.businessType | formatBusiness(dictMapObj) }}</span>
                </div>
                <div class="item">
                  <label>出货类型 & 频率：</label
                  >{{ item.visit.shipmentType | formatShipmentType(dictMapObj) }};
                  {{
                    dictMapObj['shipmentFrequency'][item.visit.shipmentFrequency]
                  }}
                </div>
                <div class="item" v-if="item.visit.rankTime">
                  <label>客户所在行业排名：</label><span>{{ item.visit.rankTime}} (年度)： {{item.visit.rank}}</span>
                </div>
                <div class="item">
                  <label>出货航线：</label>
                  <div class="info-box">
                    <div
                      class="info-cnt"
                      v-for="(ele, i) in item.syslines"
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
                  {{ item.visit.shipmentsTeu }}T /
                  {{ dictMapObj['commuCycleFree'][item.visit.shipmentsCycle]}}
                  <label>长帆目标占比：</label>
                  {{ item.visit.goalProportion }}
                </div>
                <div class="item">
                  <label>贸易条款：</label>
                  <div class="info-box">
                    <div
                      class="info-cnt"
                      v-for="(ele, i) in item.tradeTerms"
                      :key="i"
                    >
                      {{ ele.tradeCode.toUpperCase() }}
                      <span v-if="ele.shippingAddr">:{{ ele.shippingAddr}}</span>
                      , {{ dictMapObj['baseBusinessType'][ele.businessType]}}：{{ ele.containerNum }}/ {{ele.containerType}} /
                    <span v-if="ele.cycle =='free'">{{ele.beginTime}} - {{ele.endTime}} </span>
                    <span v-else>{{ dictMapObj['commuCycleFree'][ele.cycle] }} </span>
                    </div>
                  </div>
                </div>
                <div class="item  flex-item" v-if="item.demands.length">
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
                          <el-table :data="gridData" class="history-cnt">
                            <el-table-column
                              width="100"
                              property="commuTime"
                              label="跟进时间"
                              :formatter="(row) => row.commuTime ? row.commuTime.slice(0,10) : ''"
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
                <div class="item" v-if="item.turnovers.length">
                  <label>客户营业额：</label>
                  <div class="info-box">
                    <div class="info-cnt" v-for="(ele, i) in item.turnovers" :key="i">
                      {{ ele.turnoverYear }} (年度)：{{ ele.turnoverPoar }} {{ ele.currency }},
                      营业额中出口占比：  {{ ele.turnoverExports }}
                    </div>
                  </div>
                </div>
                <div class="item" v-if="item.cargos.length">
                  <label>主要产品：</label>
                  <div class="info-box">
                    <div class="info-cnt" v-for="(ele, i) in item.cargos" :key="i">
                      {{ ele.hscode }} (HS Code), {{ ele.cname }}, {{ ele.ename }};
                      单柜货值： {{ ele.singleValue }}{{ ele.currency }} / {{ ele.containerType }}
                    </div>
                  </div>
                </div>
                <div class="item" v-if="item.visit.materialDocPrepare">
                  <label>物料、资料准备：</label
                  ><span>{{ item.visit.materialDocPrepare }}</span>
                </div>
                <div class="item" v-if="item.visit.visitTarget">
                  <label>拜访(访谈)目标：</label
                  ><span>{{ item.visit.visitTarget }}</span>
                </div>
                <div class="item" v-if="item.visit.visitCheck">
                  <label>拜访(访谈)复盘：</label
                  ><span>{{ item.visit.visitCheck }}</span>
                </div>
                <div class="item" v-if="item.visit.difficulty">
                  <label>目前存在的困难：</label
                  ><span>{{ item.visit.difficulty }}</span>
                </div>
                <div class="item" v-if="item.visit.derivable">
                  <label>可衍生的&转介绍客户：</label>  {{ item.visit.derivable }}
                </div>
                <!-- <div class="item" v-if="item.visit.customerSituation">
                  <label>客情描述 ：</label
                  ><span>{{ item.visit.customerSituation }}</span>
                </div> -->
                <div class="item" v-if="item.visit.extInfo">
                  <label>延伸信息：</label><span>{{ item.visit.extInfo }}</span>
                </div>
                <div class="item" v-if="item.visit.remark">
                  <label>备注：</label><span>{{ item.visit.remark }}</span>
                </div>
              </template>
              <!-- 询价 -->
              <template
                v-if="item.commuType === 'inquiry_quotation' && item.inquiry"
              >
                <div class="item">
                  <label>出货航线：</label>
                  <div class="info-box">
                    <div
                      class="info-cnt"
                      v-for="(ele, i) in item.syslines"
                      :key="i"
                    >
                    <template v-if="ele.containerNum">
                      {{ ele.polPortCname }} -> {{ ele.podPortCname }},{{ ele.sysLineCname }},
                      {{ dictMapObj['baseBusinessType'][ele.businessType]}}:
                      {{ ele.containerNum }}/ {{ele.containerType}} / 
                      <span v-if="ele.cycle =='free'">{{ele.beginTime}} - {{ele.endTime}} </span>
                      <span v-else>{{ dictMapObj['commuCycleFree'][ele.cycle] }} </span>
                    </template>

                    </div>
                  </div>
                </div>

                <div class="item" v-if="item.cargos.length">
                  <label>主要产品：</label>
                  <div class="info-box">
                    <div class="info-cnt" v-for="(ele, i) in item.cargos" :key="i">
                      {{ ele.hscode }} (HS Code), {{ ele.cname }}, {{ ele.ename }};
                      单柜货值： {{ ele.singleValue }}{{ ele.currency }} / {{ ele.containerType }}
                    </div>
                  </div>
                </div>
                <div class="item">
                  <label>货好时间：</label>{{ item.inquiry.goodsReadyTime }}
                </div>
                <div class="item flex-item" v-if="item.demands.length">
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
                        <el-table :data="gridData" class="history-cnt">
                          <el-table-column
                            width="100"
                            property="commuTime"
                            label="跟进时间"
                            :formatter="(row) => row.commuTime ? row.commuTime.slice(0,10) : ''"
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
                  >{{ item.isCooperation === 'yes' ? '是' : '否' }}
                </div>
                <div class="item flex-item" v-if="item.noCooperationReason">
                  <label>未合作原因：</label><span>{{ item.noCooperationReason }}</span>
                </div>
                <div class="item flex-item" v-if="item.remark"><label>备注：</label><span>{{ item.remark }}</span></div>
              </template>
              <!-- qq email telephone wechat -->
              <template
                v-if="
                  ['qq', 'wechat', 'email', 'telephone', 'wechat_qq'].includes(item.commuType) &&
                  item.visit
                "
              >
                <div class="item">
                  <label>出货类型：</label
                  >{{ item.visit.shipmentType | formatShipmentType(dictMapObj) }}
                </div>
                <div class="item">
                  <label>出货航线：</label>
                  <div class="info-box">
                    <div
                      class="info-cnt"
                      v-for="(ele, i) in item.syslines"
                      :key="i"
                    >
                      {{ ele.polPortCname }} -> {{ ele.podPortCname }}, {{ ele.sysLineCname }},
                      {{ dictMapObj['baseBusinessType'][ele.businessType]}}:
                      {{ ele.containerNum }}/ {{ele.containerType}} /
                      <span v-if="ele.cycle =='free'">{{ele.beginTime}} - {{ele.endTime}} </span>
                      <span v-else>{{ dictMapObj['commuCycleFree'][ele.cycle] }} </span>
                    </div>
                  </div>
                </div>
                <div class="item">
                  <label>出货货量：</label>
                  {{ item.visit.shipmentsTeu }}T /
                  {{ dictMapObj['commuCycleFree'][item.visit.shipmentsCycle]}}
                  <label>长帆目标占比：</label>
                  {{ item.visit.goalProportion }}
                </div>
                <div class="item">
                  <label>主要产品：</label>
                  <div class="info-box">
                    <div class="info-cnt" v-for="(ele, i) in item.cargos" :key="i">
                      {{ ele.hscode }} (HS Code), {{ ele.cname }}, {{ ele.ename }};
                      单柜货值：{{ ele.singleValue }}{{ ele.currency }} / {{ ele.containerType }}
                    </div>
                  </div>
                </div>
                <div class="item flex-item" v-if="item.demands.length">
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
                          <el-table :data="gridData" class="history-cnt">
                            <el-table-column
                              width="100"
                              property="commuTime"
                              label="跟进时间"
                              :formatter="(row) => row.commuTime ? row.commuTime.slice(0,10) : ''"
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
                      v-for="(ele, i) in item.tradeTerms"
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
                <div class="item flex-item" v-if="item.visit.remark"><label>备注：</label><span>{{ item.visit.remark }}</span></div>
              </template>
              <div class="bottom-box">
                <div class="info-box">
                  {{ item.bdEmployeeName }} 于 {{ item.commuTime ? item.commuTime.slice(0,10) : '' }}
                  <span class="type">{{
                    item.commuType === 'wechat_qq' ? 'QQ' : dictMapObj['custCommType'][item.commuType]
                  }}</span>
                  <!-- <span
                    class="type"
                    v-if="
                      ['qq', 'wechat', 'email', 'telephone', 'wechat_qq'].includes(
                        item.commuType,
                      ) && item.visit ">
                    ({{
                      item.visit.qq ||
                      item.visit.wechat ||
                      item.visit.email ||
                      item.visit.telephone
                    }})
                    </span
                  > -->
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
                        @click="check(item, 'refuse')"
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
                  <el-button
                    type="text"
                    size="mini"
                    v-show="(isSelf||item.isVisitors)&& 
                    ((['refuse'].includes(item.flag) && ['yes'].includes(item.isCheck)) || ['', 'no'].includes(item.isCheck))
                    && !isBlacklist "
                    @click="handleEdit(item)"
                    >编辑</el-button
                  >
                  <el-button
                    type="text"
                    size="mini"
                    v-show="isSelf && !isBlacklist"
                    @click="handleCopy(item)"
                    >复制</el-button
                  >
                  <el-button
                    type="text"
                    size="mini"
                    v-show="isSelf && item.isCheck === 'no' && !isBlacklist"
                    @click="handleDelete(item,index)"
                    >删除</el-button
                  >
                </div>
              </div>
            </div>
          </div>
          <div v-if="item.relationFlag === 'unilateral' && item.commuType === 'visit' && item.isSelfVisitPlan" class="add-follow-box">
            <a href="javascript:;" @click="handleAdd(true, index)">
              <img src="~@/assets/add.png" alt="" />
            </a>
          </div>
        </div>
      </div>
      <div class="empty" v-show="!followList.length">
        <NoData size="small" />
      </div>
    </div>
    <FollowAdd
      v-if="dialogOptions.show"
      :options="dialogOptions"
      @cancel="cancelAdd"
      @submit="submitAdd"
      @showadd="showDialog"
      @showEdit="showEditDialog"
      :custid="custid" 
      :companyName="companyName"
      :isSelf="isSelf"
      ref="child"
      :isWhitelist="isWhitelist"
      :isIndustry="isIndustry"
      :baseInfo="baseInfo"
    />
    <!-- 填写检查不通过原因 -->
    <CrmDialog v-if="noPassReasonDialog.show" :option="noPassReasonDialog" @close="confirmNoPass"></CrmDialog>
    <!-- 日志 -->
    <CrmDialogTable :option="showLogOption" @close="dialogClose" />
    <!-- 新增联系人 -->
    <CrmDialog :multi="true" ref="add" :option="addDialog" @close="closeDialog('add',$event)" />
    <!-- 编辑联系人 -->
    <CrmDialog :multi="true" ref="edit" :option="editDialog" @close="closeDialog('edit',$event)"  v-if="editDialog.show"/>
  </div>
</template>

<script>
import { mapGetters,mapState } from 'vuex'
import { officePreview } from '@/utils/office'
import { formatIndustry } from '@/utils/crm'
import FollowAdd from './followAdd.vue'
import CrmDialog from '@/views/crm/components/crmDialog'
import CrmDialogTable from '@/views/crm/components/crmDialogTable'
import { addBaseLinkData as columnsData } from '@/views/crm/data'
import { listByRole } from '@/api/base'
import CONTACT from '@/api/crm/orgContact'
import {
  detailRelationList,
  followCheck,
  saveVisit,
  saveInquiry,
  deleteDetail,
  demandsList,
  followLogList
} from '@/api/crm/follow'
// import Import from '@/views/airTransport/order/orderList/goodsInfo/import.vue'
export default {
  name: 'CUSTh',
  label: '跟进记录',
  props: [
    'custid',
    'orgid',
    'isLeader',
    'isSelf',
    'companyName',
    'isWhitelist',
    'isIndustry',
    'baseInfo',
    'isBlacklist'
  ],
  components: {
    FollowAdd,
    CrmDialog,
    CrmDialogTable,
    // Import
  },
  data() {
    let ruleMsg = { required: true, message: ' ' }
    let form = {}
    let formItems = columnsData.map((item) => {
      let prop = item.prop
      if (prop === 'belongEmployeeName') {
        prop = 'belongEmployeeId'
        item.DIY = { key: 'employeeId' },
        item.type = 'select'
        item.remote = true
        item.remoteSelectList = []
        item.remoteMethod = (str='', item) => {
          if(typeof str === 'object'){
            item.remoteSelectList = [str]
            return
          }
          const data = {
            currPage: 1,
            pageSize: 10,
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
                item.remoteSelectList = res.data.list.map(ele => {
                  return { ...ele, label: ele.cname, value: ele.employeeId+'' }
                })
              }
            })
            .catch(() => {})
        }
      }else if(prop === 'custContactPosition'){
        item.r = true
      }
      if (['eduBack', 'familyBack', 'professionalBack', 'hobbies', 'other'].includes(prop)) {
        item.r = this.isWhitelist || this.isIndustry
      }
      form[prop] = ''
      return { ...item, prop, rules: item.r ? ruleMsg : undefined }
    })
    return {
      lsLoading: false,
      finished: false,
      currPage: 1,
      pageSize: 10,
      followList: [],
      dialogOptions: {
        show: false,
        isEdit: false,
        form: {}
      },
      gridData: [],
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
      },
      addDialog: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '新增联系人信息',
        text: '新增',
        formItems: formItems,
        form,
      },
      editDialog: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '编辑联系人信息',
        text: '确认',
        formItems: formItems.map(item => ({...item, noRemote: true})),
        form,
      },
      domesticPeerList: []
    }
  },
  watch:{
  "addDialog.form.role"(val){
    let diyRole = this.addDialog.formItems.find(item => item.prop === 'diyRole')
    this.$set(diyRole, 'show',val === 'other')
  },
  "editDialog.form.role"(val){
    let diyRole = this.editDialog.formItems.find(item => item.prop === 'diyRole')
    this.$set(diyRole, 'show',val === 'other')
  },
},
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    ...mapState("user", ["userId", "deptCode"]),
    custInfo() {
      return this.$store.state.crm.detailBaseInfo
    },
    isBd() {
      return (
        this.$store.state.user.roles.includes('bd') ||
        this.$store.state.user.roles.includes('obd')
      )
    },
    isManager() {
      return this.$store.state.user.roles.includes('manager')
    },
  },
  methods: {
    /**
     * @description: 转换【贸易条款及占比】、【邀约我司陪访人】显示格式
     * @param {*} type 列表类型
     * @param {*} list 列表数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-22 16:46:34
     */
    formatList (type, list) {
      let str = ""
      let arr = []
      if (list.length) {
        list.forEach(item => {
          if (type === 'tradeTerms') {
            arr.push(item.tradeTerms + '/' + item.tradeTermsProp + '%')
          } else if (type === 'accompanyName') {
            arr.push(item.accompanyName || item.ourCompanyEname)
          }
        })
        str = arr.length ? arr.join("、") : ""
      }
      return str
    },
    // 转换所属行业
    formatterIndustry (str) {
      return formatIndustry(str)
    },
    // 获取历史主要需求
    getHistoryDemands(row) {
      // if (this.gridData.length) {
      //   return
      // }
      let { bdEmployeeId} = row
      const data = {
        custid: this.custid,
        flag: 'detail',
        bdEmployeeId,
      }
      demandsList(data)
        .then((res) => {
          if (res.code === 0) {
            this.gridData = res.data || []
          }
        })
        .catch(() => {})
    },
    // 获取数据
    getData() {
      const data = {
        currPage: this.currPage,
        pageSize: this.pageSize,
        custid: this.$route.query.custid || this.custid
      }
      detailRelationList(data).then((res) => {
        if (res.code === 0) {
          const arr = res.data.list || []
          arr.map(item=>{
            item.visitors.some(val=>{
              if(val.visitEmployeeId===this.userId){
                item.isVisitors = true 
              }else{
                item.isVisitors = false 
              }
            })
            if (item.custVisitPlan && item.custVisitPlan.createdBy) {
              item.isSelfVisitPlan = item.custVisitPlan.createdBy === this.userId
            }
          })
          if (this.currPage === 1) {
            this.followList = arr
          } else {
            this.followList.push(...arr)
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
    // 查询加载数据
    reloadData () {
      // 重置搜索条件
      this.currPage = 1
      this.finished = false
      this.getData()
    },
    // 新增
    handleAdd(isVisitPlan, index) {
      if (isVisitPlan) {
        this.dialogOptions.form.commuType = 'visit'
        this.dialogOptions.form.commuTime = this.followList[index].companyBusinessInfo.visitDate || ''
        this.dialogOptions.form.turnovers = this.followList[index].custTurnovers || []
        this.dialogOptions.form.custDescription = this.followList[index].custVisits || []
        this.dialogOptions.form.custCargos = this.followList[index].custCargos || []
        this.dialogOptions.form.materialDocPrepare = this.followList[index].companyBusinessInfo.materialDocPrepare || ''
        this.dialogOptions.form.visitTarget = this.followList[index].companyBusinessInfo.visitTarget || ''
        this.dialogOptions.form.extInfo = this.followList[index].companyBusinessInfo.extInfo || ''
        this.dialogOptions.form.commuId = this.followList[index].commuId
        this.dialogOptions.form.relationFlag = this.followList[index].relationFlag
        this.dialogOptions.form.relationNewFlag = 'existRelation'
        this.dialogOptions.commuId = this.followList[index].commuId
        this.dialogOptions.form.accompanyNameLists= this.followList[index].accompanyNameLists
      } else {
        this.dialogOptions.form.commuType = ''
        this.dialogOptions.form.commuTime = ''
        this.dialogOptions.form.turnovers = []
        this.dialogOptions.form.custCargos = []
        this.dialogOptions.form.materialDocPrepare = ''
        this.dialogOptions.form.visitTarget = ''
        this.dialogOptions.form.extInfo = ''
        this.dialogOptions.form.commuId = ''
        this.dialogOptions.commuId = ''
        this.dialogOptions.form.relationNewFlag = ''
        this.dialogOptions.form.custDescription = [
          {
            custContact:'',
            custContactPosition:'',
            telephone:'',
            eduBack:'',
            familyBack:'',
            professionalBack:'',
            hobbies:'',
            other:''
          }
        ]
      }
      this.dialogOptions.isVisitPlan = isVisitPlan
      this.dialogOptions.form.companyAddress = this.custInfo.detailAddr
      this.dialogOptions.isEdit = false
      this.dialogOptions.show = true
    },
    // 提交
    submitAdd(source) {
      // "wechat qq email","telephone","visit","inquiry_quotation"
      this.lsLoading = true
      const { isEdit, commuId } = this.dialogOptions
      let Method = ''
      let data = {
        custid: this.custid,
        commuId: commuId
      }
      const { commuType } = source
      if (['qq', 'email', 'telephone', 'wechat'].includes(commuType)) {
        Method = saveVisit
        const {
          commuType,
          commuTime,
          custName,
          fileNos,
          bdEmployeeId,
          syslines,
          cargos,
          tradeTerms,
          demands,
          custDescription,
          shipmentType,
          nextPlan,
          remark,
          qq,
          wechat,
          email,
          telephone,
          goalProportion,
          shipmentsTeu,
          shipmentsCycle,
          custContactPosition,
          custContact,
          contactId,
          eduBack,
          familyBack,
          professionalBack,
          hobbies,
          other,
          commuMode,
        } = source
        const { employeeId, cname, deptCode, deptCname,ename,mobileNo } = bdEmployeeId
        const syslineData = syslines.map((item) => {
          const { podPortCode, polPortCode, commLines, cycle, containerNum,timeDate,containerType,businessType } = item
          return {
            commuId,
            cycle,
            containerNum,
            containerType,
            commLines,
            businessType,
            podPortCname: podPortCode.cname,
            podPortEname: podPortCode.ename,
            podPortCode: podPortCode.portCode,
            polPortCname: polPortCode.cname,
            polPortEname: polPortCode.ename,
            polPortCode: polPortCode.portCode,
            sysLineCname: commLines.cname,
            sysLineEname: commLines.ename,
            sysLineCode: commLines.sysLineCode,
            beginTime:timeDate[0],
            endTime:timeDate[1]
          }
        })    
        const tradeData = tradeTerms.map((item) => {
          const { tradeCode,shippingAddr,cycle,containerNum,containerType,timeDate,businessType } = item
          return {
            cycle,
            containerNum,
            tradeCode,
            shippingAddr,
            containerType,
            businessType,
            beginTime:timeDate[0],
            endTime:timeDate[1]
          }
        })
        if (!isEdit) {
          cargos.forEach(ele => {
            ele.oid = ''
          })
        }
        const res = {
          commuType,
          commuTime,
          custName,
          bdEmployeeId: employeeId,
          bdEmployeeName: cname,
          bdEmployeemobileNo: mobileNo,
          bdEmployeeEname: ename,
          bdDeptCode: deptCode,
          bdDeptName: deptCname,
          syslines: syslineData,
          cargos,
          tradeTerms:tradeData,
          demands,
          custDescription,
          visit: {
            commuId,
            commuType,
            shipmentType: shipmentType.join(','),
            nextPlan,
            remark,
            qq,
            wechat,
            email,
            telephone,
            goalProportion,
            shipmentsTeu,
            shipmentsCycle,
            custContactPosition,
            custContact,
            contactId,
            eduBack,
            familyBack,
            professionalBack,
            hobbies,
            other,
            commuMode,
          }
        }
        data = Object.assign({}, data, res)
      }
      if (commuType === 'inquiry_quotation') {
        Method = saveInquiry
        const {
          commuType,
          commuTime,
          custName,
          bdEmployeeId,
          goodsReadyTime,
          remark,
          isCooperation,
          syslines,
          cargos,
          demands,
          noCooperationReason,
          nextPlan
        } = source
        const { employeeId, cname, deptCode, deptCname,ename,mobileNo } = bdEmployeeId
        const syslineData = syslines.map((item) => {
          const { podPortCode, polPortCode, commLines, cycle, containerNum,timeDate,containerType,tradeCode,shippingAddr,businessType } = item
          return {
            commuId,
            cycle,
            containerNum,
            containerType,
            tradeCode,
            shippingAddr,
            businessType,
            podPortCname: podPortCode.cname,
            podPortEname: podPortCode.ename,
            podPortCode: podPortCode.portCode,
            polPortCname: polPortCode.cname,
            polPortEname: polPortCode.ename,
            polPortCode: polPortCode.portCode,
            sysLineCname: commLines.cname,
            sysLineEname: commLines.ename,
            sysLineCode: commLines.sysLineCode,
            beginTime:timeDate[0],
            endTime:timeDate[1]
          }
        })
        const res = {
          commuType,
          commuTime,
          custName,
          bdEmployeeId: employeeId,
          bdEmployeeName: cname,
          bdEmployeemobileNo: mobileNo,
          bdEmployeeEname: ename,
          bdDeptCode: deptCode,
          bdDeptName: deptCname,
          inquiry: {
            commuId,
            goodsReadyTime,
          },
          remark,
          isCooperation,
          noCooperationReason,
          syslines: syslineData,
          cargos,
          demands,
          nextPlan
        }

        data = Object.assign({}, data, res)
      }
      if (commuType === 'visit') {
        Method = saveVisit
        const {
          commuType,
          commuTime,
          custName,
          fileNos,
          bdEmployeeId,
          syslines,
          cargos,
          turnovers,
          tradeTerms,
          demands,
          custDescription,
          nextPlan,
          remark,
          visitors,
          custContactPosition,
          custContact,
          contactId,
          eduBack,
          familyBack,
          professionalBack,
          hobbies,
          other,
          commuMode,
          ourCompanyPosition,
          companyScale,
          companyAddress,
          isCooperation,
          businessType,
          shipmentType,
          shipmentFrequency,
          inquiryType,
          competitor,
          rankTime,
          rank,
          materialDocPrepare,
          visitTarget,
          visitCheck,
          difficulty,
          customerSituation,
          extInfo,
          goalProportion,
          shipmentsTeu,
          shipmentsCycle,
          custCompetitor,//客户的竞争对手
          marketShareTime,//客户所占市场份额 年份
          marketSharePoar,//客户所占市场份额 占比数据
          derivable,//可衍生的&转介绍客户
          relationNewFlag
        } = source
        const { employeeId, cname, deptCode, deptCname,ename,mobileNo } = bdEmployeeId
        const syslineData = syslines.map((item) => {
          const { podPortCode, polPortCode, commLines, cycle, containerNum,timeDate,containerType,businessType } = item
          return {
            commuId,
            cycle,
            containerNum,
            containerType,
            businessType,
            podPortCname: podPortCode.cname,
            podPortEname: podPortCode.ename,
            podPortCode: podPortCode.portCode,
            polPortCname: polPortCode.cname,
            polPortEname: polPortCode.ename,
            polPortCode: polPortCode.portCode,
            sysLineCname: commLines.cname,
            sysLineEname: commLines.ename,
            sysLineCode: commLines.sysLineCode,
            beginTime:timeDate[0],
            endTime:timeDate[1]
          }
        })
        const tradeData = tradeTerms.map((item) => {
          const { tradeCode,shippingAddr,cycle,containerNum,containerType,timeDate,businessType } = item
          return {
            cycle,
            containerNum,
            tradeCode,
            shippingAddr,
            containerType,
            businessType,
            beginTime:timeDate[0],
            endTime:timeDate[1]
          }
        })
        const visitorsData = visitors.map((item) => {
          return {
            commuId,
            visitEmployeeId: item.employeeId,
            visitEmployeeName: item.cname || '',
            visitEmployeeMobileNo:item.mobileNo || '',
            visitEmployeeEname:item.ename  || ''
          }
        })
        if (!isEdit) {
          cargos.forEach(ele => {
            ele.oid = ''
          })
        }
        const res = {
          relationNewFlag,
          commuType,
          commuTime,
          custName,
          bdEmployeeId: employeeId,
          bdEmployeeName: cname,
          bdEmployeemobileNo: mobileNo,
          bdEmployeeEname: ename,
          bdDeptCode: deptCode,
          bdDeptName: deptCname,
          syslines: syslineData,
          visitors: visitorsData,
          cargos,
          turnovers,
          tradeTerms:tradeData,
          demands,
          custDescription,
          isCooperation,
          visit: {
            nextPlan,
            remark,
            custContactPosition,
            ourCompanyPosition,
            companyScale,
            companyAddress,
            custContact,
            contactId,
            eduBack,
            familyBack,
            professionalBack,
            hobbies,
            other,
            commuMode,
            businessType: businessType.join(','),
            shipmentType: shipmentType.join(','),
            shipmentFrequency,
            inquiryType,
            competitor,
            custCompetitor,//客户的竞争对手
            marketShareTime,//客户所占市场份额 年份
            marketSharePoar,//客户所占市场份额 占比数据
            derivable,//可衍生的&转介绍客户
            rankTime,
            rank,
            materialDocPrepare,
            visitTarget,
            visitCheck,
            difficulty,
            customerSituation,
            extInfo,
            goalProportion,
            shipmentsTeu,
            shipmentsCycle,
          }
        }
        data = Object.assign({}, data, res)
      }
      Method(data)
        .then((res) => {
          if (res.code === 0) {
            this.cancelAdd()
            this.$msgSucClose(`${isEdit ? '编辑' : '新增'}跟进记录成功`)
            this.reloadData()
          } else if (res.code === 160000) {
            this.cancelAdd()
            this.$msgWarnClose(res.msg || '跟进记录新增成功，但还未配置部门管理者，请联系管理员进行配置！')
            this.reloadData()
          }
        })
        .catch(() => {})
        .finally(() => {
          this.lsLoading = false
        })
    },
    // 取消
    cancelAdd() {
      this.dialogOptions.show = false
      this.dialogOptions.form = {}
    },
    // 复制
    handleCopy(row) {
      this.dialogOptions.isEdit = false
      this.dialogOptions.commuId = ''
      this.dialogOptions.form = JSON.parse(
        JSON.stringify(Object.assign({}, this.dialogOptions.form, row))
      )
      this.dialogOptions.show = true
    },
    // 编辑
    handleEdit(row) {
      this.dialogOptions.form = JSON.parse(
        JSON.stringify(Object.assign({}, this.dialogOptions.form, row))
      )
      this.dialogOptions.isEdit = true
      this.dialogOptions.commuId = row.commuId
      this.dialogOptions.show = true
    },
    // 删除
    handleDelete (row,index) {
      this.$confirmWarn('是否确定要删除此跟进记录？', () => {
        this.deleteFn(row,index)
      })
    },
    deleteFn (row,index) {
      let {commuId, createdBy} = row
      let relationNewFlag = ''
      if (this.followList[index].relationFlag === 'bilateral') {
        relationNewFlag = 'existRelation'
      } else {
        relationNewFlag = ''
      }
      let data = {
        commuId,
        createdBy,
        relationNewFlag,
        custid:this.custid
      }
      deleteDetail(data).then(res => {
        if (res.code === 0) {
          this.$msgSucClose('跟进记录删除成功')
          this.reloadData()
        }
      })
    },
    // 滚动加载
    scrollBottom() {
      const ele = document.getElementById('follow-scroll')
      if (
        ele.scrollTop + ele.offsetHeight > ele.scrollHeight - 100 &&
        !this.finished
      ) {
        if (!this.lsLoading) {
          this.getData()
          this.lsLoading = true
        }
      }
    },
    // 附件预览
    preview(row) {
      const { fileNo, name } = row
      officePreview({ fileNo, name })
    },
    // 主管检查
    // check(row, type) {
    //   if (!this.isManager) {
    //     return this.$msgErrClose('主管才有检查权限！')
    //   }
    //   const { commuId } = row
    //   followCheck({ commuIds: [commuId] })
    //     .then((res) => {
    //       if (res.code === 0) {
    //         row.isCheck = 'yes'
    //         this.$msgSucClose('检查成功')
    //       }
    //     })
    //     .catch(() => {})
    // },
    check(row, type) {
      if (!this.isManager) {
        return this.$msgErrClose('主管才有检查权限！')
      }
      this.curRow = row
      if (type === 'pass') {
        this.checkApi(type)
      } else if (type === 'refuse') {
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
              this.reloadData()
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
    },
    // 新增联系人
    showDialog(type,index) {
      this.addDialog.form.index = index
      this.addDialog.show = true
    },
    showEditDialog(type,index,row) {
      this.edit(index,row)
    },
     // 编辑联系人信息
    edit (index,row) {
      let { belongEmployeeName, belongEmployeeId } = row
      row.belongEmployeeId = row.belongEmployeeId ? {label: belongEmployeeName, value: belongEmployeeId} : ''
      let source = this.editDialog.formItems.find(item => item.prop === 'belongEmployeeId')
      belongEmployeeId && source.remoteMethod({label: belongEmployeeName, value: belongEmployeeId}, source)
      this.editDialog.show = true
      setTimeout(() => {
        // console.log(this.editDialog.form)
        this.editDialog.form = JSON.parse(JSON.stringify(Object.assign({},row)))
        //index代表是第几个联系人的编辑
        this.editDialog.form.index = index
      }, 0);
    },
     // 关闭新增联系人
    closeDialog(type,tag){
        if (!tag) return (this[type + 'Dialog'].show = false)
        if (type === 'edit') {
          let data = { ...this.editDialog.form, orgid: this.orgid, custid: this.custid }
          if (data.belongEmployeeId) {
            let {cname, employeeId} = data.belongEmployeeId
            data.belongEmployeeId = employeeId
            data.belongEmployeeName = cname
          }
          if (!data.name && !data.ename) {
            return this.$msgErrClose('中文名和英文名至少填一个！')
          }
          this.editDialog.btnLoading = true
          // for (const key in data) {
          //   if (Object.hasOwnProperty.call(data, key)) {
          //     if (data[key] === '') delete data[key]
          //   }
          // }
          CONTACT.editCustomerContact(data).then(res => {
            if (res.code === 0) {
              this.$msgSucClose('编辑联系人成功！')
              this.updateContractList('edit',data.oid,this.editDialog.form.index)
              this.editDialog.show = false
            }
          }).finally(()=>{
            this.editDialog.btnLoading = false
          })
        }else{
          let data = { ...this.addDialog.form, orgid: this.orgid, custid: this.custid }
          if (data.belongEmployeeId) {
            let {cname, employeeId} = data.belongEmployeeId
            data.belongEmployeeId = employeeId
            data.belongEmployeeName = cname
          }
          if ( !data.name && !data.ename) {
            return this.$msgErrClose('中文名和英文名至少填一个！')
          }
          this.addDialog.btnLoading = true
          // for (const key in data) {
          //   if (Object.hasOwnProperty.call(data, key)) {
          //     if (data[key] === '') delete data[key]
          //   }
          // }
          CONTACT.addCustomerContact(data).then(() => {
            let ref = this.$refs.add.$refs.form
            ref.resetFields()
            this.$nextTick(() => ref.clearValidate())
            this.$nextTick(() => (this.addDialog.show = false))
            this.$msgSucClose( '新增联系人成功！')
            this.updateContractList('add',data.orgid,this.addDialog.form.index)
          })
          .finally(() => {
            this.addDialog.btnLoading = false
          })
      }

    },
    updateContractList(type,oid,index){
      this.$refs.child.getContractData(type,oid,index);
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
    this.reloadData()
  },
  mounted() {
    document
      .getElementById('follow-scroll')
      .addEventListener('scroll', this.scrollBottom) // 添加滚动事件，检测滚动到页面底部
  },
  beforeDestroy() {
    document
      .getElementById('follow-scroll')
      .removeEventListener('scroll', this.scrollBottom)
  }
}
</script>

<style lang="scss" scoped>
.follow-cnt {
  .table-type-status {
    margin-left: 20px;
    font-size: 14px;
  }
  .submit-btn {
    color: #4a4a4a;
  }
  .pass-btn {
    color: green;
  }
  .refuse-btn {
    color: #dd3737;
  }
  .top-title {
    margin: 8px 8px 0;
  }
  .fee-info {
    line-height: 20px;
    margin-top: 5px;
  }
  .create-info {
    margin-left: 20px;
  }
  .follow-list {
    height: calc(100vh - 170px);
    overflow: auto;
    margin: 8px;
    .follow-content {
      // background: #f3f3f3;
      margin-bottom: 10px;
      .link-icon {
        padding-top: 2px;
        text-align: center;
      }
      .table-company-box {
        padding: 10px;
        background: #f3f3f3;
        .table-company-title {
          line-height: 28px;
          font-size: 14px;
          span {
            margin-right: 50px;
          }
        }
        
      }
      .table-company-item {
        & > span {
          display: inline-block;
          width: 30%;
          margin-top: 5px;
          line-height: 20px;
          vertical-align: top;
        }
      }
      .table-type-title {
        font-weight: bold;
        color: #3E80F5;
        font-size: 14px;
      }
      .follow-title {
        line-height: 20px;
        padding-bottom: 7px;
      }
    }
    .follow-item {
      display: flex;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      .left-cnt {
        width: 30%;
        background-color: #cfe9f4;
        padding: 8px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .name {
          font-size: 14px;
          margin-bottom: 5px;
        }
        .white-box {
          display: flex;
          align-items: center;
          img {
            transform: scale(0.8);
            vertical-align: middle;
          }
        }
        .visit-box,
        .next-step {
          .item {
            display: flex;
            margin-bottom: 10px;
            flex-wrap: wrap;
            align-items: center;
            label {
              text-align: right;
              font-weight: 500;
            }
            span {
              flex: 1;
            }
          }
        }
        .next-step,
        .creat-box {
          margin: 10px 0;
        }
        .visit-box {
          margin: 0
        }
      }
      .right-cnt {
        padding: 8px;
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        .item {
          width: 45%;
          margin-bottom: 10px;
          display: flex;
          flex-wrap: wrap;
          line-height: 20px;
          &.flex-item {
            width: 100%;
          }
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
          span {
            flex: 1;
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
        .bottom-box {
          width: 100%;
          display: flex;
          align-items: center;
          .info-box {
            flex: 1;
            text-align: right;
            .type {
              color: #03b915;
            }
          }
          .red {
            color: red;
          }
          .redDis {
            color: #ff8989
          }
        }
      }
    }
    .add-follow-box {
      line-height: 40px;
      text-align: center;
    }
  }
  .mt5 {
    margin-top: 5px;
  }
}
.history-cnt{
  max-height: 400px;
  overflow-y: auto;
}

</style>
