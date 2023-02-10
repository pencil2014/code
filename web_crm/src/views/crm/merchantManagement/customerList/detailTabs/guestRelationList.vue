<!--
 * @Description: 客情关系有效列表
 * @Autor: yinjunying
 * @Date: 2022-06-14 17:37:51
-->
<template>
  <div class="table-wrapper">
    <div class="card-title-box">
      <div class="card-title our-card-title">
        <span>我司联系人</span>
      </div>
      <div class="card-title cust-card-title">
        <span>客户联系人</span>
      </div>
    </div>
    <div class="relation-item mt10" v-for="(item, index) in relationList" :key="index">
      <div class="link-info-box our-link-info">
        <div class="add-info-box" v-if="!item.ourCompanyEmployeeId">
          <a v-if="isEdit" href="javascript:;" @click="handleEdit(false, '我司', item)">
            <img src="~@/assets/add.png" alt="" /><br />
            <span>新增我司联系人</span>
          </a>
        </div>
        <div v-else class="info-box-item">
          <el-row :gutter="10" class="info-box-title">
            <el-col :span="20">
              <img src="~@/assets/ourLinker.png" alt="" width="24" class="link-icon" />
              <span><b>{{ item.ourCompanyName }}</b></span>
            </el-col>
            <el-col :span="4" style="text-align: right">
              <el-button v-if="isEdit" type="warning" size="mini" class="mt5 mr10" @click="handleEdit(true, '我司', item)">编辑</el-button>
            </el-col>
          </el-row>
          <el-row :gutter="10" class="info-box-content">
            <el-col :span="12">
              <b>英文名：</b> {{ item.ourCompanyEname }}
            </el-col>
            <el-col :span="12">
              <b>职位：</b> {{ item.ourCompanyPosition }}
            </el-col>
            <el-col :span="12">
              <b>电话号码：</b> {{ item.ourCompanyPhone }}
            </el-col>
          </el-row>
        </div>
      </div>
      <div class="relation-icon-box" :style="{ marginTop: (item.oid && isEdit ? '40px' : '45px') }">
        <img src="~@/assets/relation.png" alt="" /><br />
        <el-link v-if="item.oid && isEdit" type="danger" class="mt5" @click="failureFn(item)">失效</el-link>
      </div>
      <div class="link-info-box cust-link-info">
        <div class="add-info-box" v-if="!item.contactId">
          <a v-if="isEdit" href="javascript:;" @click="handleEdit(false, '客户', item)">
            <img src="~@/assets/add.png" alt="" /><br />
            <span>新增客户联系人</span>
          </a>
        </div>
        <div v-else class="info-box-item">
          <el-row :gutter="10" class="info-box-title">
            <el-col :span="20" style="display: flex">
              <img src="~@/assets/custLinker.png" alt="" width="24" class="link-icon" />
              <el-popover trigger="hover" placement="top" width="500">
                <p class="popoverText"><b>教育背景: </b>{{ item.eduBack }}</p>
                <p class="popoverText"><b>家庭背景: </b>{{ item.familyBack }}</p>
                <p class="popoverText"><b>从业背景: </b>{{ item.professionalBack }}</p>
                <p class="popoverText"><b>性格爱好: </b>{{ item.hobbies }}</p>
                <p class="popoverText"><b>其它特殊情况或要求: </b>{{ item.other }}</p>
                <div slot="reference" class="name-wrapper">
                  <span style="line-height: 24px; cursor: pointer" class="blueFont"><b>{{ item.customerName }}</b></span>
                </div>
              </el-popover>
            </el-col>
            <el-col :span="4" style="text-align: right">
              <el-button v-if="isEdit" type="warning" size="mini" class="mt5 mr10" @click="handleEdit(true, '客户', item)">编辑</el-button>
            </el-col>
          </el-row>
          <el-row :gutter="10" class="info-box-content">
            <el-col :span="8" style="display: flex">
              <b>英文名：</b>
              <template v-if="item.customerName">
                {{ item.customerEname }}
              </template>
              <template v-else>
                <el-popover trigger="hover" placement="top" width="500">
                  <p class="popoverText"><b>教育背景: </b>{{ item.eduBack }}</p>
                  <p class="popoverText"><b>家庭背景: </b>{{ item.familyBack }}</p>
                  <p class="popoverText"><b>从业背景: </b>{{ item.professionalBack }}</p>
                  <p class="popoverText"><b>性格爱好: </b>{{ item.hobbies }}</p>
                  <p class="popoverText"><b>其它特殊情况或要求: </b>{{ item.other }}</p>
                  <div slot="reference" class="name-wrapper">
                    <span style="line-height: 24px; cursor: pointer" class="blueFont"><b>{{ item.customerEname }}</b></span>
                  </div>
                </el-popover>
              </template>
            </el-col>
            <el-col :span="8">
              <b>职位：</b> {{ item.custContactPosition }}
            </el-col>
            <el-col :span="8" style="display: flex">
              <b>电话号码：</b>
              <el-popover trigger="hover" placement="top-end" width="300">
                <p class="popoverText"><b>电话号码: </b>{{ item.mobileNo }}</p>
                <p class="popoverText"><b>座机号码: </b>{{ item.telNo }}</p>
                <p class="popoverText"><b>Email: </b>{{ item.email }}</p>
                <p class="popoverText"><b>QQ: </b>{{ item.qq }}</p>
                <p class="popoverText"><b>微信号: </b>{{ item.wechat }}</p>
                <p class="popoverText"><b>WHATSAPP: </b>{{ item.whatsapp }}</p>
                <p class="popoverText"><b>WECHAT: </b>{{ item.wechatEname }}</p>
                <p class="popoverText"><b>Fax No.: </b>{{ item.faxNo }}</p>
                <div slot="reference" class="name-wrapper">
                  <span style="line-height: 24px; cursor: pointer" class="blueFont"><b>{{ item.mobileNo }}</b></span>
                </div>
              </el-popover>
            </el-col>
            <el-col :span="24">
              <b>职责：</b>{{ item.duty }}
            </el-col>
          </el-row>
          <el-row :gutter="10" class="info-box-content">
            <template v-if="!isForeignPeer">
              <el-col :span="24">
                <b>维护频次：</b>{{ formatMaintFrequency(item.maintenanceFrequency) }}
              </el-col>
              <el-col :span="16">
                <b>拜访提醒日期：</b>
                <span v-if="item.visitFirstTips">{{ formatterDate(item.visitFirstTips) }}</span>
                <span v-if="item.visitSecondTips">、{{ formatterDate(item.visitSecondTips) }}</span>
                <span v-if="item.visitThirdTips">、{{ formatterDate(item.visitThirdTips) }}</span>
                <span v-if="item.visitFourthTips">、{{ formatterDate(item.visitFourthTips) }}</span>
              </el-col>
              <el-col :span="8">
                <b>拜访完成度：</b>{{ formatterComplete(item.completionRateOfVisit) }}
              </el-col>
              <el-col :span="16">
                <b>电话提醒日期：</b>
                <span v-if="item.telFirstTips">{{ formatterDate(item.telFirstTips) }}</span>
                <span v-if="item.telSecondTips">、{{ formatterDate(item.telSecondTips) }}</span>
                <span v-if="item.telThirdTips">、{{ formatterDate(item.telThirdTips) }}</span>
                <span v-if="item.telFourthTips">、{{ formatterDate(item.telFourthTips) }}</span>
                <span v-if="item.weeklyTips">{{ formatterWeek(item.weeklyTips) }}</span>
              </el-col>
              <el-col :span="8">
                <b>电话交流完成度：</b>{{ formatterComplete(item.completionRateOfTel) }}
              </el-col>
            </template>
            <el-col :span="16">
              <b>归属人：</b>{{ item.employeeName }}
            </el-col>
            <el-col :span="8">
              <b>创建时间：</b>{{ item.createdTime }}
            </el-col>
          </el-row>
          <div v-if="isForeignPeer" class="foregin-peer-box">
            <b>维护频率：</b>
            <el-table :data="item.maintenanceFrequencyList" style="width: 100%" fit border>
              <el-table-column prop="maintenanceMode" label="维护方式" min-width="100" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  {{ dictMapObj['custForeignPeerCommType'][scope.row.maintenanceMode] }}
                </template>
              </el-table-column>
              <el-table-column prop="maintFreqForeign" label="维护频率" min-width="100" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  {{ scope.row.maintFreqForeign }} 次/年
                </template>
              </el-table-column>
              <el-table-column prop="reminderDate" label="提醒日期" min-width="100" align="center" show-overflow-tooltip></el-table-column>
              <el-table-column prop="completionRate" label="完成度" min-width="100" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  {{ formatterComplete(scope.row.completionRate) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
    <!-- 新增/编辑客情关系 -->
    <GuestEdit :options="editGuestInfoOpts" v-if="editGuestInfoOpts.show" :custid="custid" :isSelf="isSelf" :isForeignPeer="isForeignPeer"
      @getData="getData" />
    <!-- 失效原因 -->
    <CrmDialog :option="failureReasonOpts" @close="confirmFailure" v-if="failureReasonOpts.show" />
  </div>
</template>

<script>
import GuestEdit from './guestEdit.vue'
import CrmDialog from '@/views/crm/components/crmDialog'
import { markFailureApi } from '@/api/crm/guest.js'
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      // 新增/编辑客情关系弹框配置
      editGuestInfoOpts: {
        show: false,
        isEdit: false,
        type: '',
        form: {},
        oid: ''
      },
      relationList: [
        {
          ourCompanyName: "",
          ourCompanyEname: "",
          ourCompanyPosition: "",
          ourCompanyPhone: "",
          custContactPosition: "",
          duty: "",
          customerName: "",
          mobileNo: "",
          // 0616新增字段
          customerEname: "",
          telNo: "",
          email: "",
          qq: "",
          wechat: "",
          whatsapp: "",
          wechatEname: "",
          faxNo: "",
          eduBack: "",
          familyBack: "",
          professionalBack: "",
          hobbies: "",
          other: "",
          maintenanceFrequency: "",
          visitFirstTips: "",
          visitSecondTips: "",
          visitThirdTips: "",
          visitFourthTips: "",
          telFirstTips: "",
          telSecondTips: "",
          telThirdTips: "",
          telFourthTips: "",
          weeklyTips: "",
          maintenanceFrequencyList: [
            {
              maintenanceMode: "",
              maintFreqForeign: "",
              reminderDate: "",
              completionRate: ""
            }
          ]
        }
      ],
      // 填写失效原因弹框配置
      failureReasonOpts: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '填写失效原因',
        text: '失效',
        labelWidth: '100px',
        formItems: [
          {
            label: '失效原因',
            type: 'textarea',
            prop: 'reason',
            rules:
              [
                { ...this.defaultRules, message: '失效原因必填' },
                { max: 512, message: '失效原因最大长度限制512位', trigger: 'blur' }
              ]
          }
        ],
        form: {
          reason: ''
        }
      }
    }
  },
  inject: ['defaultRules'],
  components: {
    GuestEdit,
    CrmDialog
  },
  props: {
    isSelf: {
      type: Boolean,
      default: false
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    custid: '',
    dataList: {
      type: Array,
      default: () => []
    },
    isForeignPeer: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['dictMapObj']),
  },
  watch: {
    dataList (nval) {
      this.relationList = [...nval]
      let havaEmptyInfo = this.relationList.find((item) => { item.ourCompanyEmployeeId === "" && item.contactId === "" })
      if (!havaEmptyInfo && this.isEdit) {
        this.addEmptyInfo()
      }
    }
  },
  methods: {
    /**
     * @description: 调用父组件的获取列表接口
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-20 11:10:46
     */
    getData () {
      this.$emit('getData')
    },
    /**
     * @description: 新增一条空的客情关系
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-20 11:23:08
     */
    addEmptyInfo () {
      this.relationList.push(this.$options.data.call(this).relationList[0])
    },
    /**
     * @description: 新增/编辑联系人
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-16 11:59:38
     */
    handleEdit (isEdit, type, item) {
      this.editGuestInfoOpts.show = true
      this.editGuestInfoOpts.isEdit = isEdit
      this.editGuestInfoOpts.type = type
      this.editGuestInfoOpts.form = item
      this.editGuestInfoOpts.oid = item.oid
    },
    /**
     * @description: 标记失效
     * @param {Object} row 行数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-13 10:13:22
     */
    failureFn (row) {
      this.failureReasonOpts.show = true
      this.curRow = row
    },
    /**
     * @description: 确定标记失效
     * @param {Boolean} tag false-只做关闭弹框处理 true-调用标记失效接口
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-13 17:16:15
     */
    confirmFailure (tag) {
      if (!tag) {
        return this.closeDialog()
      }
      this.failureReasonOpts.btnLoading = true
      let data = {
        custid: this.custid,
        oid: this.curRow.oid,
        ...this.failureReasonOpts.form
      }
      markFailureApi(data).then((res) => {
        if (res.code === 0) {
          this.$msgSucClose('标记成功！')
          this.closeDialog()
          this.$emit('getData')
        }
      })
        .catch(() => { })
        .finally(() => {
          this.failureReasonOpts.btnLoading = false
        })
    },
    /**
     * @description: 关闭填写失效原因弹框
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-13 17:17:02
     */
    closeDialog () {
      this.failureReasonOpts.show = false
      this.failureReasonOpts.form.reason = ""
    },
    /**
     * @description: 转换维护频次格式
     * @param {*} val
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-20 15:32:50
     */
    formatMaintFrequency (val) {
      if (val) {
        if (val === 'year_once') return "当面拜访每年一次，电话交流至少半年一次"
        if (val === 'year_twice') return "当面拜访每年两次，电话交流至少每季度一次"
        if (val === 'quarter_once') return "当面拜访每季度一次，电话交流至少每周一次"
      } else {
        return ''
      }
    },
    /**
     * @description: 转换周格式
     * @param {*} val 要转换的值
     * @return {*} 转换后的值
     * @author: yinjunying
     * @Date: 2022-06-20 14:41:09
     */
    formatterWeek (val) {
      if (val) {
        if (val === 'monday') return "周一"
        if (val === 'tuesday') return "周二"
        if (val === 'wednesday') return "周三"
        if (val === 'thursday') return "周四"
        if (val === 'friday') return "周五"
        if (val === 'saturday') return "周六"
        if (val === 'sunday') return "周日"
      } else {
        return ''
      }
    },
    /**
     * @description: 转换日期格式
     * @param {*} val 要转换的值
     * @return {*} 转换后的值
     * @author: yinjunying
     * @Date: 2022-06-20 16:22:21
     */
    formatterDate (val) {
      if (val) {
        return val.split(" ")[0]
      } else {
        return ''
      }
    },
    /**
     * @description: 转换完成度格式
     * @param {*} val 要转换的值
     * @return {*} 转换后的值
     * @author: yinjunying
     * @Date: 2022-06-23 10:10:11
     */
    formatterComplete (val) {
      if (!isNaN(val)) {
        if (val !== 0) {
          return val * 100 + '%'
        } else {
          return 0
        }
      } else {
        return ''
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.ml5 {
  margin-left: 5px;
}
.ml10 {
  margin-left: 10px;
}
.mr10 {
  margin-right: 10px;
}
.mb5 {
  margin-bottom: 5px;
}
.mb10 {
  margin-bottom: 10px;
}
.mt10 {
  margin-top: 10px;
}
.mt5 {
  margin-top: 5px;
}
.blueFont {
  color: #3e80f5;
}
.orangeFont {
  color: #ecaa0f;
}
.textR {
  text-align: right;
}
.table-wrapper {
  padding: 0 8px;
  .card-title-box {
    display: flex;
    justify-content: space-between;
  }
  .our-card-title {
    width: 40%;
  }
  .cust-card-title {
    width: 53%;
  }
  .card-title {
    height: 30px;
    line-height: 30px;
    background: #ebeef3;
    text-indent: 10px;
    span {
      font-weight: bold;
    }
  }
  .relation-item {
    display: flex;
    min-height: 120px;
    .link-info-box {
      border: 1px solid #d9d9d9;
      border-radius: 2px;
      .add-info-box {
        text-align: center;
        margin-top: 32px;
        & > a {
          line-height: 20px;
        }
      }
      .info-box-item {
        margin: 10px 10px 10px 20px;
        .info-box-title {
          margin-bottom: 10px;
        }
        .link-icon {
          vertical-align: middle;
          margin-right: 10px;
        }
      }
    }
    .our-link-info {
      width: 40%;
      background: #eff4fd;
    }
    .cust-link-info {
      width: 53%;
      background: #eaf1e8;
    }
    .relation-icon-box {
      width: 7%;
      text-align: center;
    }
  }
  .info-box-content {
    /deep/ .el-col {
      line-height: 24px;
      word-break: break-all;
    }
  }
}
.popoverText {
  line-height: 24px !important;
  font-size: 12px !important;
}
.foregin-peer-box {
  display: flex;
}
</style>