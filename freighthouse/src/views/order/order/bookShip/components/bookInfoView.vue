<template>
  <div class="bookInfoView" :class="roles.includes('pricing') ? 'pricing' : roles.includes('bkg') ? 'bkg' : ''">
    <!-- 订舱基本信息  -->
    <div v-if="infoConfig.type=='base'" class="base">
      <div class="title">{{infoConfig.title}}</div>
      <ul class="infoList">
        <template v-for="(item, index) in infoConfig.info">
          <el-tooltip placement="top" :key="'infoHistory' + index" v-if="item.historyVal && item.historyVal !== item.value">
            <div slot="content">历史数据<br />{{item.name}}：{{item.historyVal}}</div>
            <li v-if="!item.hide" :class="item.historyVal && item.historyVal !== item.value ? 'red' : ''" :key="'history' + index" :style="{width: ['intrustRemark','auditRemark'].includes(item.key) ? '100%' : ''}">
              {{item.name}}：{{item.value}}
            </li>
          </el-tooltip>
          <el-tooltip placement="top" :key="'launchEmployeeName' + index" v-if="['bkgAgentSupplierName', 'porPortCode', 'unloadingPortName', 'podPortName', 'transitPortCode'].includes(item.key)">
            <div slot="content">{{item.name}}：{{item.value}}</div>
            <li :key="'name' + index" v-if="!item.hide">
              {{item.name}}：{{item.value}}
            </li>
          </el-tooltip>
          <li v-else-if="!item.hide" :key="'other' + index" :class="{'full':['intrustRemark','auditRemark'].includes(item.key), 'flex': ['launchEmployeeName', 'auditEmployeeName', 'opEmployeeName'].includes(item.key)}">
            <span class="name">{{item.name}}：</span>
            <span class="value">{{item.value}}</span>
            <el-popover v-if="['launchEmployeeName', 'auditEmployeeName', 'opEmployeeName'].includes(item.key)" popper-class="emplpyeeName-pop" placement="left" width="240" trigger="click">
              <div class="employeeName-list">
                <ul>
                  <li v-if="employeeInfo.telephone">座机号：{{employeeInfo.telephone}}</li>
                  <li v-else>手机号：{{employeeInfo.mobileNo}}</li>
                  <li>邮箱：{{employeeInfo.email}}</li>
                  <li>部门：{{employeeInfo.deptCname}}</li>
                  <li>公司：{{employeeInfo.companyCname}}</li>
                </ul>
              </div>
              <i slot="reference" class="el-icon-postcard" @click="handleTogglePopOver(item.id)"></i>
            </el-popover>
          </li>
        </template>
      </ul>
    </div>
    <!-- 箱型箱量信息  -->
    <div v-if="infoConfig.type=='container'" class="container">
      <div class="title">{{infoConfig.title}}</div>
      <ul class="infoList">
        <li>合计箱型：{{infoConfig.container}}</li>
        <li>总重量：{{infoConfig.weight}}</li>
        <li>总体积：{{infoConfig.volume}}</li>
        <li>分开放舱：{{infoConfig.isSplit=='n'?'是':'否'}}</li>
      </ul>
      <div v-for="(containerItem, index) in infoConfig.soContainerList" :key="index">
        <span class="small-tit">单SO{{index+1}}（{{containerItem.isSplit=='n'?'不分开放舱':'分开放舱'}}）</span>
        <div v-for="(item, i) in containerItem.containerList" :key="i">
          <ul class="infoList">
            <li><em class="blue">&bull;</em>箱型{{i+1}}：{{item.containerType}}</li>
            <li>箱量：{{item.containerNum}}</li>
            <li>是否重柜：{{item.isHeavy=='y'?'是':'否' }}</li>
            <li>单柜货重：{{item.weight}}</li>
            <li>单柜体积：{{item.volume}}</li>
            <li v-if="item.specialLength || item.specialWidth || item.specialHeight">
              特种：长{{item.specialLength || "0"}}M、宽{{item.specialWidth || "0"}}M、高{{item.specialHeight || "0"}}M
            </li>
            <li v-if="item.sizeBefore || item.sizeAfter || item.sizeLeft || item.sizeRight">
              超限：前{{item.sizeBefore || "0"}}M、后{{item.sizeAfter || "0"}}M、左{{item.sizeLeft || "0"}}M、右{{item.sizeRight || "0"}}M
            </li>
            <li v-if="item.temperatureSet">设置温度：{{item.temperatureSet}}</li>
            <li v-if="item.temperatureMin">最低温度：{{item.temperatureMin}}</li>
            <li v-if="item.temperatureMax">最高温度：{{item.temperatureMax}}</li>
            <li v-if="item.airMete">通风量：{{item.airMete}}</li>
            <li v-if="item.humidity">湿度要求：{{item.humidity}}</li>
          </ul>
        </div>
      </div>
    </div>
    <!-- 货物信息  -->
    <div v-if="infoConfig.type=='goods'" class="goods">
      <div class="title">{{infoConfig.title}}</div>
      <ul class="infoList" v-for="(item, index) in infoConfig.info" :key="index">
        <li><em class="blue">&bull;</em>货物{{index+1}}</li>
        <li>HS Code：{{item.hscode}}</li>
        <li>货物性质：{{item.property | cargoProperty}}</li>
        <li>中文品名：{{item.cname}}</li>
        <li>英文品名：{{item.ename}}</li>
        <li></li>
        <li v-if="item.dangerousGrade">危险等级：{{item.dangerousGrade | dangerousGradeFilter}}</li>
        <li v-if="item.dangerousCode">国际危险品编码：{{item.dangerousCode}}</li>
        <li v-if="item.packageInfo">包装组别：{{item.packageInfo}}</li>
      </ul>
    </div>
    <!-- 收发通  -->
    <div v-if="infoConfig.type=='goods'" class="transport">
      <div class="title">{{infoConfig.title2}}</div>
      <ul class="infoList" v-if="roles.includes('bkg')">
        <li class="full">
          <span class="name">收货人：</span>
          <span class="value">{{infoConfig.transport && infoConfig.transport.consignee}}</span>
        </li>
        <li class="full">
          <span class="name">发货人：</span>
          <span class="value">{{infoConfig.transport && infoConfig.transport.shipper}}</span>
        </li>
        <li class="full">
          <span class="name">通知人1：</span>
          <span class="value">{{infoConfig.transport && infoConfig.transport.notify1}}</span>
        </li>
        <li class="full">
          <span class="name">通知人2：</span>
          <span class="value">{{infoConfig.transport && infoConfig.transport.notify2}}</span>
        </li>
        <li class="full">
          <span class="name">通知人3：</span>
          <span class="value">{{infoConfig.transport && infoConfig.transport.notify3}}</span>
        </li>
      </ul>
      <el-row v-if="roles.includes('pricing')">
        <div class="flex-item-double oneThird">
          <div class="item-label">
            <span class="lab">Shipper(发货人)</span>
            <el-button type="text" size="mini" :disabled="disabledState" @click="openContactPerson('发货人','')">选择</el-button>
          </div>
          <el-input type="textarea" rows="4" :autosize="{ minRows: 3, maxRows: 4 }" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="infoConfig.transport.shipper" :disabled="disabledState"> </el-input>
        </div>
        <div class="flex-item-double oneThird">
          <div class="item-label">
            <span class="lab">Consignee(收货人)</span>
            <el-button type="text" size="mini" :disabled="disabledState" @click="openContactPerson('收货人','')">选择</el-button>
          </div>
          <el-input type="textarea" rows="4" :autosize="{ minRows: 3, maxRows: 4 }" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="infoConfig.transport.consignee" :disabled="disabledState"> </el-input>
        </div>
        <div class="flex-item-double pic-notify-tabs oneThird alert-others">
          <el-button type="text" size="mini" class="alert-others-btn" :disabled="disabledState" @click="openContactPerson('通知人',activeName)">选择</el-button>
          <el-button size="mini" type="text" class="alert-others-btn-same" :disabled="disabledState" @click="handleClickNotify">SAME AS CONSIGNEE</el-button>
          <el-tabs v-model="activeName" type="card">
            <el-tab-pane label="Notify Party(通知人)" name="1">
              <div class="">
                <el-input type="textarea" rows="4" :autosize="{ minRows: 3, maxRows: 4 }" maxlength="512" show-word-limit size="mini" placeholder="请输入Notify Party" v-model="infoConfig.transport.notify1" :disabled="disabledState"> </el-input>
              </div>
            </el-tab-pane>
            <el-tab-pane label="Also Notify Party" name="2">
              <div class="">
                <el-input type="textarea" rows="4" :autosize="{ minRows: 3, maxRows: 4 }" maxlength="512" show-word-limit size="mini" placeholder="请输入Also Notify Party" v-model="infoConfig.transport.notify2" :disabled="disabledState"> </el-input>
              </div>
            </el-tab-pane>
            <!-- <el-tab-pane label="通知人3" name="3">
              <div class="">
                <el-input type="textarea" rows="4" :autosize="{ minRows: 3, maxRows: 4 }" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="infoConfig.transport.notify3" :disabled="disabledState"> </el-input>
              </div>
            </el-tab-pane> -->
          </el-tabs>
        </div>
      </el-row>
    </div>
    <div v-if="contactPersonShow">
      <ContactPerson :config="contactPersonConfig" @close="getContactPerson" :custid="$store.state.book.bookInfo.custid" />
    </div>
  </div>
</template>

<script>
import { getDictLabel } from '@/utils/tools'
import ContactPerson from '@/views/order/order/orderList/components/contactPerson.vue'
import { employeeInfo } from '@/api/base'
export default {
  filters: {
    cargoProperty(property) {
      return getDictLabel('cargoProperty', property)
    },
    dangerousGradeFilter(dangerousGrade) {
      return getDictLabel('dangerousGrade', dangerousGrade)
    }
  },
  data() {
    return {
      activeName: '1',
      contactPersonShow: false,
      contactPersonConfig: {
        type: '收货人', // 类型，收货人，发货人，通知人
        num: '' // 通知人1，2，3
      },
      disabledState: false,
      employeeInfo: {}
    }
  },
  props: {
    infoConfig: {
      type: Object,
      default: () => ({})
    }
  },
  created() {},
  mounted() {},
  computed: {
    roles() {
      return this.$route.query.roles ? this.$route.query.roles.split(',') : []
    }
  },
  components: {
    ContactPerson
  },
  methods: {
    handleTogglePopOver(employeeId) {
      // console.log('employeeId', employeeId)
      this.employeeInfo = {
        telephone: '',
        mobileNo: '',
        email: '',
        deptCname: '',
        companyCname: ''
      }
      if (employeeId) {
        employeeInfo({ employeeId: employeeId }).then((res) => {
          this.employeeInfo = res.data
        })
      }
    },
    handleClickNotify() {
      if (this.activeName === '1') {
        this.$set(this.infoConfig.transport, 'notify1', 'SAME AS CONSIGNEE')
      }
      if (this.activeName === '2') {
        this.$set(this.infoConfig.transport, 'notify2', 'SAME AS CONSIGNEE')
      }
      if (this.activeName === '3') {
        this.$set(this.infoConfig.transport, 'notify3', 'SAME AS CONSIGNEE')
      }
    },
    openContactPerson(type, num) {
      // 打开收发通弹窗
      this.contactPersonConfig.type = type
      this.contactPersonConfig.num = num
      this.contactPersonShow = true
    },
    getContactPerson(action, value, type, num) {
      this.contactPersonShow = false
      if (action === 'Confirm') {
        let str = `${value.companyName ? value.companyName + '\n' : ''}${
          value.contactAddress ? value.contactAddress + '\n' : ''
        }${value.contactName ? value.contactName + '\n' : ''}${
          value.contactPhone ? 'TEL:' + value.contactPhone + '\n' : ''
        }${value.contactFax ? 'FAX:' + value.contactFax + '\n' : ''
        }${value.taxCode ? 'TAX:' + value.taxCode + '\n' : ''}${
          value.remark
        }`
        if (type === '收货人') {
          this.$set(this.infoConfig.transport, 'consignee', str)
        } else if (type === '发货人') {
          this.$set(this.infoConfig.transport, 'shipper', str)
        } else {
          if (num == 1) {
            this.$set(this.infoConfig.transport, 'notify1', str)
          } else if (num == 2) {
            this.$set(this.infoConfig.transport, 'notify2', str)
          } else {
            this.$set(this.infoConfig.transport, 'notify3', str)
          }
        }
      }
    }
  }
}
</script>

<style lang="scss">
.bookInfoView {
  margin: 10px 10px 0;
  .title {
    font-weight: 600;
    line-height: 16px;
    font-size: 12px;
    padding: 4px 0 0 0;
  }
  ul.infoList {
    list-style: none;
    padding: 0;
    margin-top: 5px;
    zoom: 1;
    li {
      font-size: 12px;
      width: 20%;
      line-height: 16px;
      float: left;
      margin-bottom: 4px;
      padding-right: 10px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      &.flex {
        display: flex;
        .el-icon-postcard {
          font-size: 16px;
          margin-left: 5px;
          cursor: pointer;
          color: #409eff;
        }
        span {
          height: 16px;
          line-height: 16px;
        }
      }
      .name,
      .value {
        line-height: 16px;
      }
      em.blue {
        color: #3e80f5;
        font-style: normal;
      }
      &.full {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        .name {
          width: 60px;
          display: block;
        }
        .value {
          display: block;
          flex: 1;
          word-break: break-all;
          white-space: normal;
          line-height: 16px;
        }
      }
      &.width60 {
        width: 60%;
        display: flex;
        flex-wrap: wrap;
        .name {
          // width: 60px;
          display: block;
        }
        .value {
          display: block;
          flex: 1;
          word-break: break-all;
          white-space: normal;
          line-height: 16px;
        }
      }
      &.width40 {
        // width: 40%;
        display: flex;
        flex-wrap: wrap;
        .name {
          width: 60px;
          display: block;
        }
        .value {
          display: block;
          flex: 1;
          word-break: break-all;
          white-space: normal;
          line-height: 16px;
        }
      }
    }
  }
  ul.infoList::after {
    display: block;
    clear: both;
    content: '';
    visibility: hidden;
    height: 0;
  }
  .small-tit {
    font-size: 12px;
    font-weight: 600;
  }
  .notify-row {
    font-size: 12px;
    line-height: 16px;
    margin-bottom: 4px;
  }
  &.pricing {
    .base,
    .transport {
      background-color: #f8f9fd;
    }
    .container,
    .goods {
      background-color: #fff;
    }
  }
  &.bkg {
    .container,
    .transport {
      background-color: #f8f9fd;
    }
    .base,
    .goods {
      background-color: #fff;
    }
  }
}
.flex-item-double {
  width: 25%;
  padding: 0 5px 0 0;
  margin-bottom: 4px;
  float: left;
}
.flex-item-double.oneThird {
  width: 33.33%;
}
.alert-others {
  position: relative;
  .alert-others-btn {
    position: absolute;
    top: 0;
    left: 185px;
    z-index: 500;
  }
  .alert-others-btn-same {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 500;
    letter-spacing: -0.8px;
    padding: 0 5px;
  }
}
.pic-notify-tabs .el-tabs__item {
  height: 20px !important;
  line-height: 20px;
  font-size: 12px;
  color: #4a4a4a;
  padding: 0 !important;
  margin-right: 5px;
  letter-spacing: -0.8px;
}
.pic-notify-tabs .el-tabs__item.is-active {
  color: #1890ff;
  // border-top: 1px solid #ddd !important;
  // border-left: 1px solid #ddd !important;
  // border-right: 1px solid #ddd !important;
  // border-bottom: 1px solid #fff !important;
  // position: relative;
  // border-top-left-radius: 4px;
  // border-top-right-radius: 4px;
  // background: #fff;
  // bottom: -1px;
  &::before{
    position: absolute;
    content: '';
    display: block;
    bottom: 0;
    z-index: 2;
    left: 50%;
    width: 24px;
    margin-left: -12px;
    height: 1px;
    background-color: #1890ff;
  }
}
.pic-notify-tabs .el-tabs--card > .el-tabs__header .el-tabs__item {
  border-bottom: 0;
  border-left: 0;
}
.pic-notify-tabs .el-tabs--card > .el-tabs__header .el-tabs__nav {
  border: 0;
}
.pic-notify-tabs .el-tabs--card > .el-tabs__header {
  border-bottom: 0;
}
.pic-notify-tabs .el-tabs__header {
  height: 20px;
  line-height: 20px;
  margin-bottom: 0;
}
</style>
