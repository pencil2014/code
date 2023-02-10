<template>
  <div class="follow-list" id="follow-scroll">
    <div class="follow-item" v-for="(item, index) in followList" :key="index">
      <div class="left-cnt">
        <div class="top-box">
          <h3 class="name">{{ item.custName }}</h3>
        </div>
        <div class="visit-box" v-if="item.commuType === 'visit' && item.visit">
          <div class="item">
            <label>公司规模：</label>{{ dictMapObj['orgScale'][item.visit.companyScale]}}
          </div>
          <div class="item">
            <label>公司地址：</label>{{ item.visit.companyAddress }}
          </div>
          <el-tooltip placement="top">
            <div slot="content">
              <span v-if="item.visit.eduBack">教育背景:{{item.visit.eduBack}}<br/></span>
              <span v-if="item.visit.familyBack">家庭背景:{{item.visit.familyBack}}<br/></span>
              <span v-if="item.visit.professionalBack">从业背景:{{item.visit.professionalBack}}<br/></span>
              <span v-if="item.visit.hobbies">性格爱好:{{item.visit.hobbies}}<br/></span>
              <span v-if="item.visit.other">其他特殊情况或要求:{{item.visit.other}}</span>
            </div>
            <div class="item">
              <label>客户联系人：</label>
              {{ (item.visit.custContact.indexOf("#") != -1)?item.visit.custContact.split('#')[0]:item.visit.custContact }}
              {{ (item.visit.custContact.indexOf("#") != -1)?item.visit.custContact.split('#')[1]:'' }}
            </div>
          </el-tooltip>
          <div class="item">
            <label>联系人职位：</label> {{ dictMapObj['customerRelationPosition'][item.visit.custContactPosition] }}
          </div>
          <div class="item">
            <label>通讯方式：</label>{{ item.visit.commuMode }}
          </div>
          <div class="item">
            <label>是否合作：</label
            >{{ item.isCooperation === 'yes' ? '是' : '否' }}
          </div>
          <div class="item">
            <label>我司拜访人：</label>{{ item.visitors | formatVisitors }}
          </div>
          <div class="item">
            <label>拜访人职位：</label> {{dictMapObj['customerRelationPosition'][item.visit.ourCompanyPosition]}}
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
        </div>
        <!-- <div
          class="next-step"
          v-if="item.commuType !== 'inquiry_quotation' && item.visit"
        >
          下一步计划：{{ item.visit.nextPlan }}
        </div> -->
        <!-- QQ -->
        <div v-if="['qq', 'wechat', 'email', 'telephone', 'wechat_qq'].includes(item.commuType) && item.visit">
          <el-tooltip placement="top">
            <div slot="content">
              <span v-if="item.visit.eduBack">教育背景:{{item.visit.eduBack}}<br/></span>
              <span v-if="item.visit.familyBack">家庭背景:{{item.visit.familyBack}}<br/></span>
              <span v-if="item.visit.professionalBack">从业背景:{{item.visit.professionalBack}}<br/></span>
              <span v-if="item.visit.hobbies">性格爱好:{{item.visit.hobbies}}<br/></span>
              <span v-if="item.visit.other">其他特殊情况或要求:{{item.visit.other}}</span>
            </div>
            <div class="next-step">
              <label>客户联系人：</label>
              {{ (item.visit.custContact.indexOf("#") != -1)?item.visit.custContact.split('#')[0]:item.visit.custContact }}
              {{ (item.visit.custContact.indexOf("#") != -1)?item.visit.custContact.split('#')[1]:'' }}
            </div>
          </el-tooltip>
          <div class="next-step">
            客户联系人职位：{{item.visit.custContactPosition}}
          </div>
          <div class="next-step">
            通讯方式：{{ item.visit.commuMode }}
          </div>
        </div>
        <div class="next-step" v-if="item.visit">
          下一步计划：{{ item.visit.nextPlan }}
        </div>
        <div class="next-step" v-if="item.commuType === 'inquiry_quotation' && item.nextPlan">
          下一步计划：{{ item.nextPlan }}
        </div>
        <div class="creat-box">
          {{ item.createdName }} 于 {{ item.createdTime }} 创建
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
                  {{ ele.containerNum }}T /
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
                   ,{{ ele.containerNum }}T /
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
            <div class="item" v-if="item.visit.customerSituation">
              <label>客情描述 ：</label
              ><span>{{ item.visit.customerSituation }}</span>
            </div>
            <div class="item" v-if="item.visit.extInfo">
              <label>延伸信息：</label><span>{{ item.visit.extInfo }}</span>
            </div>
            <div class="item" v-if="item.visit.remark">
              <label>备注：</label><span>{{ item.visit.remark }}</span>
            </div>
        </template>
        <!-- 询价 -->
        <template v-if="item.commuType === 'inquiry_quotation' && item.inquiry">
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
                  {{ ele.containerNum }}T / 
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
            ['qq', 'wechat', 'email', 'telephone','wechat_qq'].includes(item.commuType) &&
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
                  {{ ele.containerNum }}T /
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
              <label>贸易条款：</label>
              <div class="info-box">
                <div
                  class="info-cnt"
                  v-for="(ele, i) in item.tradeTerms"
                  :key="i"
                >
                  {{ ele.tradeCode.toUpperCase() }}
                    <span v-if="ele.shippingAddr">:{{ ele.shippingAddr}}</span>
                   ,{{ ele.containerNum }}T /
                  <span v-if="ele.cycle =='free'">{{ele.beginTime}} - {{ele.endTime}} </span>
                  <span v-else>{{ dictMapObj['commuCycleFree'][ele.cycle] }} </span>
                </div>
              </div>
            </div>
            <div class="item flex-item" v-if="item.visit.remark"><label>备注：</label><span>{{ item.visit.remark }}</span></div>
        </template>
        <div class="bottom-box">
          <div class="info-box">
            {{ item.bdEmployeeName }} 于 {{ item.commuTime.slice(0, 10) }}
            <span class="type">{{
                item.commuType === 'wechat_qq' ? 'QQ' : dictMapObj['custCommType'][item.commuType]
              }}</span>
            <span
              class="type"
              v-if="
                ['qq', 'wechat', 'email', 'telephone','wechat_qq'].includes(
                  item.commuType,
                ) && item.visit
              "
              >({{
                item.visit.qq ||
                item.visit.wechat ||
                item.visit.email ||
                item.visit.telephone
              }})</span
            >
            跟进
          </div>
        </div>
      </div>
    </div>
    <div class="empty" v-show="!followList.length">
      <NoData size="mini" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { officePreview } from '@/utils/office'
import { detailList } from '@/api/crm/follow'
export default {
  props: ['custid'],
  data() {
    return {
      lsLoading: false,
      finished: false,
      currPage: 1,
      pageSize: 10,
      followList: []
    }
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj'])
  },
  methods: {
    // 获取数据
    getData() {
      const data = {
        currPage: this.currPage,
        pageSize: this.pageSize,
        custid: this.custid
      }
      detailList(data)
        .then((res) => {
          if (res.code === 0) {
            const arr = res.data.list || []
            arr.length && this.followList.push(...arr)
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
    // preview(row) {
    //   const { fileNo, name } = row
    //   officePreview({ fileNo, name })
    // }
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
  mounted() {
    document
      .getElementById('follow-scroll')
      .addEventListener('scroll', this.scrollBottom) // 添加滚动事件，检测滚动到页面底部
  },
   activated() {
    // 重置搜索条件
    this.followList = []
    this.currPage = 1
    this.finished = false
    this.getData()
  },
  beforeDestroy() {
    document
      .getElementById('follow-scroll')
      .removeEventListener('scroll', this.scrollBottom)
  }
}
</script>

<style lang="scss" scoped>
.follow-list {
  max-height: 200px;
  overflow: auto;
  margin: 8px;
  .follow-item {
    display: flex;
    border: 1px solid #eee;
    border-radius: 4px;
    margin-bottom: 20px;
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
          margin-right: 5px;
          transform: scale(0.8);
        }
      }
      .visit-box {
        .item {
          display: flex;
          margin-bottom: 10px;
          label {
            width: 80px;
            text-align: right;
            font-weight: 500;
          }
        }
      }
      .visit-box,
      .next-step,
      .creat-box {
        margin: 10px;
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
        label {
          width: 110px;
          text-align: right;
          font-weight: 500;
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
      }
    }
  }
}
</style>
