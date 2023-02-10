<template>
  <div class="row-cont transportInfo" v-if="$route.query.orderNo">
    <div class="row-cont-tit">
      <span class="tit">收发通信息</span>
      <div class="row-cont-rt">
        <span class="expand" @click="handleToogleExpand"> {{ transportShow ? '收起' : '展开' }}<i :class="transportShow ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
      </div>
    </div>
    <!-- 收发通  -->
    <div class="transport" v-show="transportShow">
      <el-row>
        <div class="flex-item-double oneThird">
          <div class="item-label">
            <span class="lab">Shipper(发货人)</span>
            <el-button type="text" size="mini" :disabled="disabledState" @click="openContactPerson('发货人','')">选择</el-button>
          </div>
          <el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="infoConfig.transport.shipper" :disabled="disabledState"> </el-input>
        </div>
        <div class="flex-item-double oneThird">
          <div class="flex-class">
            <div class="item-label">
              <span class="lab">Consignee(收货人)</span>
              <el-button type="text" size="mini" :disabled="disabledState" @click="openContactPerson('收货人','')">选择</el-button>
            </div>
            <el-button v-if="blackPopList.length" type="text" size="mini"  @click="handleClickBlack">船司黑名单</el-button>
				  </div>
          <el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="infoConfig.transport.consignee" :disabled="disabledState"> </el-input>
        </div>
        <div class="flex-item-double pic-notify-tabs oneThird alert-others">
          <el-button type="text" size="mini" class="alert-others-btn" :disabled="disabledState" @click="openContactPerson('通知人',activeName)">选择</el-button>
          <el-button size="mini" type="text" class="alert-others-btn-same" :disabled="disabledState" @click="handleClickNotify">SAME AS CONSIGNEE</el-button>
          <el-tabs v-model="activeName" type="card">
            <el-tab-pane label="Notify Party(通知人)" name="1">
              <div class="">
                <el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入Notify Party" v-model="infoConfig.transport.notify1" :disabled="disabledState"> </el-input>
              </div>
            </el-tab-pane>
            <el-tab-pane label="Also Notify Party" name="2">
              <div class="">
                <el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入Also Notify Party" v-model="infoConfig.transport.notify2" :disabled="disabledState"> </el-input>
              </div>
            </el-tab-pane>
            <!-- <el-tab-pane label="通知人3" name="3">
              <div class="">
                <el-input type="textarea" :rows="4" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="infoConfig.transport.notify3" :disabled="disabledState"> </el-input>
              </div>
            </el-tab-pane> -->
          </el-tabs>
        </div>
      </el-row>
    </div>
    <div v-if="contactPersonShow">
      <ContactPerson :config="contactPersonConfig" @close="getContactPerson" :custid="$store.state.book.bookInfo.custid"/>
    </div>
    <div v-if="blackPopShow">
      <blackPop  :options="blackPopList" @close="blackPopClose" />
		</div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import ContactPerson from '@/views/order/order/orderList/components/contactPerson.vue'
import blackPop from '@/views/order/order/orderList/orderBook/components/blackPop'
import { getBlackUrl } from '@/api/baseData'
export default {
  filters: {
  },
  data() {
    return {
      activeName: '1',
      contactPersonShow: false,
      contactPersonConfig: {
        type: '收货人', // 类型，收货人，发货人，通知人
        num: '' // 通知人1，2，3
      },
      transportShow: true,
      blackPopShow: false,
      blackPopList: [],
    }
  },
  props: {
    infoConfig: {
      type: Object,
      default: () => ({})
    },
    bookDetailForm: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    this.getBlackUrlData()
  },
  mounted() {},
  computed: {
    ...mapState({
			dictMap: state => state.dict.dictMap,
			userId: state => state.user.userId
		}),
    roles() {
      return this.$route.query.roles ? this.$route.query.roles.split(',') : []
    },
    disabledState() {
      let {containerModifyInfo, portModifyInfo} = this.bookDetailForm
      // 加柜、改船改港的不可编辑
      if (portModifyInfo && Object.keys(portModifyInfo).length || containerModifyInfo && Object.keys(containerModifyInfo).length) {
        return true
      }
      // bkg不可编辑
      if (this.roles.includes('bkg')) {
        return true
      }
      if (this.roles.includes('pricing')) {
        // 有协助审核人的不可编辑，审核通过的不可编辑
        let {auditEmployeeId, orgAuditEmployeeId} = this.bookDetailForm
        if (auditEmployeeId && orgAuditEmployeeId && auditEmployeeId !== this.userId || ['pass','booking','booked','book_release','refuse'].includes(this.bookDetailForm.bkgStatus)) {
          return true
        }
      }
    }
  },
  components: {
    ContactPerson,
    blackPop,
  },
  watch: {
    'bookDetailForm.ship.shipCarrierCode': {
			handler(newVal, oldVal) {
				this.getBlackUrlData()
			},
			deep: true
		}
  },
  methods: {
    // 获取船司黑名单
    getBlackUrlData() {
			if (this.bookDetailForm.ship && this.bookDetailForm.ship.shipCarrierCode) {
         getBlackUrl(this.bookDetailForm.ship.shipCarrierCode)
				 .then(res => {
					if (res.data && res.data.length) {
						this.blackPopList = res.data
					} else {
						this.blackPopList = []
					}
				 })
			} else {
				this.blackPopList = []
			}
		},
    handleClickBlack() {
      this.blackPopShow = true
		},
		blackPopClose() {
			this.blackPopShow = false
		},
    // 展开收起
		handleToogleExpand() {
      this.transportShow = !this.transportShow
		},
    handleClickNotify() {
      if (this.activeName === '1') {
        this.$set(this.infoConfig.transport,'notify1','SAME AS CONSIGNEE')
      }
      if (this.activeName === '2') {
        this.$set(this.infoConfig.transport,'notify2','SAME AS CONSIGNEE')
      }
      if (this.activeName === '3') {
        this.$set(this.infoConfig.transport,'notify3','SAME AS CONSIGNEE')
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
          this.$set(this.infoConfig.transport,'consignee',str)
        } else if (type === '发货人') {
          this.$set(this.infoConfig.transport,'shipper',str)
        } else {
          if (num == 1) {
            this.$set(this.infoConfig.transport,'notify1',str)
          } else if (num == 2) {
            this.$set(this.infoConfig.transport,'notify2',str)
          } else {
            this.$set(this.infoConfig.transport,'notify3',str)
          }
        }
      }
    }
  }
}
</script>

<style lang="scss">
.transportInfo {
  margin: 10px 10px 0;
  .transport{
    padding: 5px 0 0 5px;
  }
  .flex-item-double {
    width: 25%;
    padding: 0 5px 0 0;
    margin-bottom: 4px;
    float: left;
    .flex-class {
      display: flex;
      justify-content: space-between;
    }
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
  .pic-notify-tabs .el-tabs--card>.el-tabs__header .el-tabs__item {
      border-bottom: 0;
      border-left: 0;
  }
  .pic-notify-tabs .el-tabs--card>.el-tabs__header .el-tabs__nav {
      border: 0;
  }
  .pic-notify-tabs .el-tabs--card>.el-tabs__header {
      border-bottom: 0;
  }
  .pic-notify-tabs .el-tabs__header {
      height: 20px;
      line-height: 20px;
      margin-bottom: 0;
  }
}



</style>
