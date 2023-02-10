<!--
 * @Description: SLA质量管控
 * @Autor: yinjunying
 * @Date: 2022-08-01 14:11:11
-->
<template>
  <div class="info-page">
    <div class="info-title">
      <p class="orgFont">
        <template v-if="canOperEdit">
          <span>温馨提示：【快速创建】会根据评分项目带出默认值，<span class="buleText">蓝色字体</span>内容可点击修改，灰色数据不可修改；</span><br />
          <span class="textIndent">【新增】操作后，请先选择评分项目（点击评分项目单元格），再修改其它<span class="buleText">蓝色字体</span>数据，数据灰色数据不可修改。</span>
        </template>
      </p>
      <div>
        <span v-if="slaInfo.qualityVerifyStatus" class="status-info">状态：
          <span :class="['pass', 'refuse'].includes(slaInfo.qualityVerifyStatus) ? slaInfo.qualityVerifyStatus : ''">
            {{ formatState(slaInfo.qualityVerifyStatus) }}
          </span>
          <el-tooltip v-if="['refuse'].includes(slaInfo.qualityVerifyStatus)" :content="slaInfo.refuseReason" placement="top"
            effect="light">
            <i class="el-icon-question question-icon orgFont"></i>
          </el-tooltip>
        </span>
        <!-- 潜在维护人、下单维护人可维护 -->
        <template v-if="canOperEdit && !isBlacklist">
          <el-button type="success" size="mini" @click="addFn('quickCreate')">快速创建</el-button>
          <el-tooltip content="自动按照系统模版新增所有的评分项目并自动填充数据，可支持修改" placement="top" effect="light">
            <i class="el-icon-question question-icon"></i>
          </el-tooltip>
          <el-button type="primary" size="mini" @click="addFn('add')">新增</el-button>
          <template v-if="isEdit">
            <el-popconfirm v-if="slaInfo.qualityControlDtoList.length" @onConfirm="submitFn" title="提交审核页面数据将不能修改，确定继续？">
              <el-button type="success" slot="reference" size="mini" class="ml10">提交审核</el-button>
            </el-popconfirm>
            <el-popconfirm @onConfirm="cancelFn" title="取消会将修改的数据还原，确定继续？">
              <el-button size="mini" slot="reference" class="ml10">取消</el-button>
            </el-popconfirm>
          </template>
          <template v-else>
            <el-button v-if="slaInfo.qualityControlDtoList.length" type="warning" size="mini" @click="editFn">编辑</el-button>
          </template>
        </template>
        <!-- 系统配置项的审核人可审核 -->
        <template v-if="isVerifier && ['submit'].includes(slaInfo.qualityVerifyStatus)">
          <el-popconfirm @onConfirm="checkFn('pass')" title="确定执行【审核通过】操作？">
            <el-button type="success" size="mini" slot="reference">审核通过</el-button>
          </el-popconfirm>
          <el-button type="danger" size="mini" class="ml10" @click="checkFn('noPass')">审核拒绝</el-button>
        </template>
      </div>
    </div>
    <div class="info-table" :style="{ height: `${ tableHeight }px` }">
      <vxe-table border resizable ref="xTable" :loading="loading" :data="slaInfo.qualityControlDtoList" size="mini" align="center"
        :edit-config="{ trigger: 'click', mode: 'cell', enabled: isEdit, activeMethod: activeCellMethod }"
        :column-config="{resizable: true}" :scroll-y="{enabled: false}" max-height="auto" auto-resize @edit-actived="editActivedEvent">
        <vxe-column type="seq" width="50" title="序号" fixed="left"></vxe-column>
        <vxe-column field="businessType" title="业务类型" :edit-render="{}" width="180">
          <template #default="{ row }">
            <span :class="`${isEdit ? `linkText` : ''}`"
              :title="`${isEdit ? `点击修改` : ''}`">{{ formatBusinessType(row.businessType) }}</span>
          </template>
          <template #edit="{ row }">
            <vxe-select v-model="row.businessType" multiple transfer>
              <vxe-option v-for="item in dictMap['slaBusinessType']" :key="item.value" :value="item.value" :label="item.label">
              </vxe-option>
            </vxe-select>
          </template>
        </vxe-column>
        <vxe-column field="scoringItems" title="评分项目" :edit-render="{}" width="155">
          <template #header>
            <span v-if="isEdit" style="color: red; margin-right:3px">*</span>
            <span>评分项目</span><br />
            <span v-if="isEdit" class="orgFont">（点击单元格选择）</span>
          </template>
          <template #default="{ row }">
            <span :class="`${isEdit ? `linkText` : ''}`" :title="`${isEdit ? `点击修改` : ''}`">{{ formatRatedItem(row.scoringItems) }}</span>
          </template>
          <template #edit="{ row }">
            <vxe-select v-model="row.scoringItems" transfer @change="() => changeRatedItem(row)">
              <vxe-option v-for="item in ratedItemList" :key="item.itemCode" :value="item.itemCode" :label="item.itemName"
                :disabled="item.isDisabled">
              </vxe-option>
            </vxe-select>
          </template>
        </vxe-column>
        <vxe-column field="serviceItems" title="服务项" width="180">
          <template #default="{ row }">
            <span v-if="!['customer_complaints'].includes(row.scoringItems)">
              {{ formatServiceItems(row.serviceItems) }}</span>
            <span v-else>{{ row.scoringItems ? emptyVal : '' }}</span>
          </template>
        </vxe-column>
        <vxe-column field="startTimeType" title="开始时间类型" width="190" :edit-render="{}">
          <template #default="{ row }">
            <!-- 放单放货-有近洋、远洋对应的时间类型-可编辑-->
            <template v-if="['put'].includes(row.scoringItems)">
              <p :class="`${isEdit ? `linkText` : ''}`" :title="`${isEdit ? `点击修改` : ''}`" style="text-align: left; padding-left: 20px">
                <span
                  v-if="row.lineTypes[0].startTimeType"><b>近洋：</b>{{ formatDictMapObj('slaTimeKey', row.lineTypes[0].startTimeType) }}</span><br />
                <span
                  v-if="row.lineTypes[1].startTimeType"><b>远洋：</b>{{ formatDictMapObj('slaTimeKey', row.lineTypes[1].startTimeType) }}</span>
              </p>
            </template>
            <template v-else-if="['waybill_on_time', 'pod_comm_clearance', 'delivey'].includes(row.scoringItems)">
              <!-- 派送-单个时间-可编辑 -->
              <span v-if="['delivey'].includes(row.scoringItems)" :class="`${isEdit ? `linkText` : ''}`" :title="`${isEdit ? `点击修改` : ''}`">
                {{ formatDictMapObj('slaTimeKey', row.lineTypes[0].startTimeType) }}</span>
              <!-- 运单提供及时率、目的港委托清关-单个时间-不可编辑 -->
              <span
                v-if="['waybill_on_time', 'pod_comm_clearance'].includes(row.scoringItems)">{{ formatDictMapObj('slaTimeKey', row.lineTypes[0].startTimeType) }}</span>
            </template>
            <!-- 派送-有多个时间类型-不可编辑 -->
            <span v-else-if="['take_delivery'].includes(row.scoringItems)">
              <template v-if="row.lineTypes[0].startTimeType">
                {{ formatDictMapObj('slaTimeKey', row.lineTypes[0].startTimeType.split(',')[0]) }}、
                {{ formatDictMapObj('slaTimeKey', row.lineTypes[0].startTimeType.split(',')[1]) }}
              </template>
            </span>
            <span v-else>{{ row.scoringItems ? emptyVal : '' }}</span>
          </template>
          <template #edit="{ row }">
            <template v-if="['waybill_on_time', 'pod_comm_clearance', 'delivey'].includes(row.scoringItems)">
              <vxe-select v-model="row.lineTypes[0].startTimeType" transfer
                @change="(val) => changeStartTimeType(val.value, row, row.lineTypes[0])">
                <template v-for="item in dictMap['slaTimeKey']">
                  <template v-if="['waybill_on_time'].includes(row.scoringItems)">
                    <vxe-option v-if="['td_time'].includes(item.value)" :key="item.value" :value="item.value" :label="item.label">
                    </vxe-option>
                  </template>
                  <template v-if="['pod_comm_clearance'].includes(row.scoringItems)">
                    <vxe-option v-if="['ta_time'].includes(item.value)" :key="item.value" :value="item.value" :label="item.label">
                    </vxe-option>
                  </template>
                  <template v-if="['delivey'].includes(row.scoringItems)">
                    <vxe-option v-if="['real_delivery_time', 'real_clear_time'].includes(item.value)" :key="item.value" :value="item.value"
                      :label="item.label">
                    </vxe-option>
                  </template>
                </template>
              </vxe-select>
            </template>
            <template v-if="['put'].includes(row.scoringItems)">
              <div style="display: flex; justify-content: left;">
                <span><b>近洋：</b></span>
                <vxe-select v-model="row.lineTypes[0].startTimeType" transfer
                  @change="(val) => changeStartTimeType(val.value, row, row.lineTypes[0])" style="width: 130px">
                  <template v-for="item in dictMap['slaTimeKey']">
                    <vxe-option v-if="['custom_agree_release', 'td_time', 'bl_put_finish_time'].includes(item.value)" :key="item.value"
                      :value="item.value" :label="item.label">
                    </vxe-option>
                  </template>
                </vxe-select>
              </div>
              <div style="display: flex; justify-content: left;">
                <span><b>远洋：</b></span>
                <vxe-select v-model="row.lineTypes[1].startTimeType" transfer
                  @change="(val) => changeStartTimeType(val.value, row, row.lineTypes[1])" style="width: 130px">
                  <template v-for="item in dictMap['slaTimeKey']">
                    <vxe-option v-if="['custom_agree_release', 'td_time', 'bl_put_finish_time'].includes(item.value)" :key="item.value"
                      :value="item.value" :label="item.label">
                    </vxe-option>
                  </template>
                </vxe-select>
              </div>
            </template>
          </template>
        </vxe-column>
        <vxe-column field="stopTimeType" title="截止时间类型" width="150">
          <template #default="{ row }">
            <template v-if="['put'].includes(row.scoringItems)">
              <p style="text-align: left; padding-left: 10px">
                <span
                  v-if="row.lineTypes[0].stopTimeType"><b>近洋：</b>{{ formatDictMapObj('slaTimeKey', row.lineTypes[0].stopTimeType) }}</span><br />
                <span
                  v-if="row.lineTypes[1].stopTimeType"><b>远洋：</b>{{ formatDictMapObj('slaTimeKey', row.lineTypes[1].stopTimeType) }}</span>
              </p>
            </template>
            <span
              v-else-if="['take_delivery', 'waybill_on_time', 'pod_comm_clearance', 'delivey'].includes(row.scoringItems)">{{ formatDictMapObj('slaTimeKey', row.lineTypes[0].stopTimeType) }}</span>
            <span v-else>{{ row.scoringItems ? emptyVal : '' }}</span>
          </template>
        </vxe-column>
        <vxe-column field="timeCount" title="达标时长" width="180" :edit-render="{}">
          <template #default="{ row }">
            <span v-if="['take_delivery', 'pod_comm_clearance', 'delivey'].includes(row.scoringItems)"
              :class="`${isEdit ? `linkText` : ''}`" :title="`${isEdit ? `点击修改` : ''}`">
              {{ formatterStandardDays(row.lineTypes[0].timeCount, row.lineTypes[0].timeType) }}</span>
            <span v-else-if="['waybill_on_time', 'put'].includes(row.scoringItems)" :class="`${isEdit ? `linkText` : ''}`"
              :title="`${isEdit ? `点击修改` : ''}`" style="display: inline-block; text-align: left">
              <b>近洋：</b>{{ formatterStandardDays(row.lineTypes[0].timeCount, row.lineTypes[0].timeType) }} <br />
              <b>远洋：</b>{{ formatterStandardDays(row.lineTypes[1].timeCount, row.lineTypes[1].timeType) }}
            </span>
            <span v-else>{{ row.scoringItems ? emptyVal : '' }}</span>
          </template>
          <template #edit="{ row }">
            <template v-if="['take_delivery', 'waybill_on_time', 'put', 'pod_comm_clearance', 'delivey'].includes(row.scoringItems)">
              <div style="display: flex; justify-content: center;">
                <span v-if="['waybill_on_time', 'put'].includes(row.scoringItems)"><b>近洋：</b></span>
                <vxe-input v-model="row.lineTypes[0].timeCount" type="number" min="0" max="9999" style="width: 60px"
                  @change="() => changeStandardDays(row)"></vxe-input>
                <vxe-select v-model="row.lineTypes[0].timeType" transfer style="width: 60px; margin-left: 3px"
                  @change="() => changeStandardDays(row)">
                  <vxe-option v-for="item in dictMap['slaTimeType']" :key="item.value" :value="item.value" :label="item.label">
                  </vxe-option>
                </vxe-select>
              </div>
              <template v-if="['waybill_on_time', 'put'].includes(row.scoringItems)">
                <div style="display: flex; justify-content: center;">
                  <span><b>远洋：</b></span>
                  <vxe-input v-model="row.lineTypes[1].timeCount" type="number" min="0" max="9999" style="width: 60px"
                    @change="() => changeStandardDays(row)"></vxe-input>
                  <vxe-select v-model="row.lineTypes[1].timeType" transfer style="width: 60px; margin-left: 3px"
                    @change="() => changeStandardDays(row)">
                    <vxe-option v-for="item in dictMap['slaTimeType']" :key="item.value" :value="item.value" :label="item.label">
                    </vxe-option>
                  </vxe-select>
                </div>
              </template>
            </template>
            <template v-else>
              <span>{{ emptyVal }}</span>
            </template>
          </template>
        </vxe-column>
        <vxe-column field="lineTypes" title="航线类型" width="160">
          <template #default="{ row }">
            <span v-if="['waybill_on_time', 'put'].includes(row.scoringItems)">
              {{ formatLineType(row.lineTypes) }}</span>
            <span v-else>{{ row.scoringItems ? emptyVal : '' }}</span>
          </template>
        </vxe-column>
        <vxe-column field="exceptionType" title="异常管理依据" type="html" width="250" header-align='center' align="left">
          <template #default="{ row }">
            <span
              v-if="['take_delivery', 'insurance', 'waybill_on_time', 'ship_arrival'].includes(row.scoringItems)">{{ row.scoringItems ? emptyVal : '' }}</span>
            <span v-else v-html="formatExceptionType(row)"></span>
          </template>
        </vxe-column>
        <vxe-column field="addPointStandard" title="得分标准" type="html" width="320" header-align='center' align="left">
          <template #default="{ row }">
            <span v-if="['customer_complaints'].includes(row.scoringItems)">{{ row.scoringItems ? emptyVal : '' }}</span>
            <span v-else v-html="row.addPointStandard"></span>
          </template>
        </vxe-column>
        <vxe-column field="deductPointStandard" title="扣分标准" type="html" width="320" header-align='center' align="left">
          <template #header>
            <p>扣分标准</p>
            <p>(满足该评分项目的任意一条扣分标准，则得0分)</p>
          </template>
        </vxe-column>
        <vxe-column v-if="isEdit" title="操作" width="70" fixed="right">
          <template #default="{ rowIndex }">
            <el-popconfirm @onConfirm="deleteRowFn(rowIndex)" title="确定移除该数据？">
              <el-link type="danger" slot="reference">移除</el-link>
            </el-popconfirm>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
    <!-- 审核不通过原因 -->
    <CrmDialog v-if="noPassDialog.show" :option="noPassDialog" @close="confirmFn"></CrmDialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getValueByKey } from '@/api/base'
import CrmDialog from '@/views/crm/components/crmDialog'
import slaApi from '@/api/crm/sla'
export default {
  name: 'CUSTs',
  label: 'SLA质量管控',
  components: {
    CrmDialog,
  },
  props: ['custid', 'orgid', 'baseInfo','isBlacklist'],
  data () {
    const emptyData = {
      businessType: ['ship_export_lcl', 'ship_export_fcl'],
      scoringItems: "",
      serviceItems: [],
      lineTypes: [
        {
          startTimeType: "",
          stopTimeType: "",
          timeCount: null,
          timeType: "", //达标时间类型 【小时、工作日、天】
          lineType: ""
        }
      ],
      exceptionType: [],
      addPointStandard: "", //得分标准
      deductPointStandard: "" //扣分标准
    }
    const emptyVal = "——"
    return {
      isEdit: false, //可编辑状态
      verifierInfo: {}, //审核人信息
      isVerifier: false,
      loading: false,
      slaInfo: {
        custid: '',
        orgid: '',
        qualityVerifyStatus: '',
        qualityControlDtoList: []
      },
      emptyData,
      emptyVal,
      // 审核拒绝
      noPassDialog: {
        title: '审核拒绝',
        show: false,
        showClear: true,
        btnLoading: false,
        formItems: [
          {
            label: '拒绝原因',
            type: 'textarea',
            prop: 'refuseReason',
            maxlength: 512,
            rules:
              [
                { required: true, message: '拒绝原因必填', trigger: 'blur' },
                { max: 512, message: '备注最大长度限制512位', trigger: 'blur' }
              ]
          }
        ],
        form: { refuseReason: '' }
      },
      ratedItemList: [],
      exceptionList: [],
      tableHeight: 500
    }
  },
  activated() {
    this.tableHeight = document.body.clientHeight - 180
    window.onresize = () => (() => {
      this.tableHeight = document.body.clientHeight - 180
    })();
    this.slaInfo.custid = this.custid
    this.slaInfo.orgid = this.orgid
    this.getVerifierInfo() // 获取审核人信息
    this.getRatedItemInfo() // 获取评分项目信息
    this.getExceptionInfo() // 获取异常类型选项
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    ...mapState("user", ["userId"]),
    // 当前用户是否是该客户的下单或潜在维护人
    isUnordinarylMaint () {
      let arr = this.baseInfo.bds.filter(item => item.status === "effect")
      return arr.some(item => ['potential', 'order'].includes(item.maintainerType) && (item.bdEmployeeId === this.userId))
    },
    // 是否可操作编辑按钮
    canOperEdit () {
      return this.isUnordinarylMaint && !['submit'].includes(this.slaInfo.qualityVerifyStatus)
    }
  },
  methods: {
    /**
     * @description: 获取质量管控列表
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-10 14:48:57
     */
    getQualityControlList () {
      let data = {
        custid: this.custid
      }
      this.loading = true
      slaApi['list'](data).then(res => {
        if (res.code === 0) {
          this.slaInfo = res.data || {}
        }
      }).catch(() => { })
        .finally(() => {
          this.loading = false
        })
    },
    /**
     * @description: 获取评分项目/服务项数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-09 15:40:27
     */
    getRatedItemInfo () {
      slaApi['getItemCode']({}).then(res => {
        if (res.code === 0) {
          if (res.data && res.data.length) {
            this.ratedItemList = res.data.filter(item => item.state === 'valid')
          }
          this.getQualityControlList() // 获取质量管控列表信息
        }
      }).catch(() => { })
    },
    /**
     * @description: 获取异常类型列表
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-10 11:55:11
     */
    getExceptionInfo () {
      slaApi['getException']({}).then(res => {
        if (res.code === 0) {
          if (res.data && res.data.length) {
            this.exceptionList = res.data.filter(item => item.state === 'valid')
          }
        }
      }).catch(() => { })
    },
    /**
     * @description: 转换状态
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-10 18:02:55
     */
    formatState (val) {
      if (val) {
        if (val === 'create') return '未提交'
        if (val === 'submit') return '待审核'
        if (val === 'pass') return '审核通过'
        if (val === 'refuse') return '审核拒绝'
      } else {
        return ''
      }
    },
    /**
     * @description: 转换评分项目的值
     * @param {*} val
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-09 17:25:01
     */
    formatRatedItem (val) {
      let findObj = this.ratedItemList.find(item => item.itemCode === val)
      if (findObj) return findObj.itemName
    },
    /**
     * @description: 转换服务项格式
     * @param {*} serviceItems
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-09 18:32:29
     */
    formatServiceItems (serviceItems) {
      let arr = []
      if (serviceItems.length) {
        arr = []
        serviceItems.forEach(item => {
          arr.push(item.itemServiceName)
        })
        return arr.join('、')
      } else {
        return ''
      }
    },
    /**
     * @description: 转换dictMapObj的值
     * @param {*} dictMapObj
     * @param {*} val
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-05 11:21:34
     */
    formatDictMapObj (dictMapObj, val) {
      if (val) {
        return this.dictMapObj[dictMapObj][val]
      } else {
        return ''
      }
    },
    /**
     * @description: 转换航线类型
     * @param {*} val 航线集合
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-15 11:24:05
     */
    formatLineType (val) {
      let arr = []
      if (val && val.length) {
        val.forEach(item => {
          arr.push(this.formatDictMapObj('slaLineType', item.lineType))
        })
      }
      return arr.length ? arr.join('、') : ''
    },
    /**
     * @description: 获取审核人信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-02 11:18:51
     */
    getVerifierInfo () {
      getValueByKey("sla_quality_control_verifier").then(res => {
        if (res.data && res.data.includes(",")) {
          this.verifierInfo.employeeId = Number(res.data.split(',')[0])
          this.verifierInfo.employeeName = res.data.split(',')[1]
          this.isVerifier = this.verifierInfo.employeeId === this.userId
        } else {
          this.verifierInfo = {}
          this.isVerifier = false
        }
      })
    },
    /**
     * @description: 新增一行空白数据
     * @param {*} type add-新增 quickCreate-快速创建
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-05 09:58:36
     */
    addFn (type) {
      let errorMsg = `一共只有${this.ratedItemList.length}项评分项目，已无更多新增！`
      if (type === 'add') {
        let haveRate = this.slaInfo.qualityControlDtoList.some(item => item.scoringItems === '')
        if (haveRate) {
          return this.$message.error("存在未选择评分项目的数据，请选择后再新增！")
        }
        if (this.slaInfo.qualityControlDtoList.length < this.ratedItemList.length) {
          this.isEdit = true
          this.slaInfo.qualityControlDtoList.push(this.$options.data.call(this).emptyData)
        } else {
          this.$message.error(errorMsg)
        }
      } else if (type === 'quickCreate') {
        // 快速创建时，先过滤掉评分项目为空的数据，再进行创建
        this.slaInfo.qualityControlDtoList = this.slaInfo.qualityControlDtoList.filter(item => item.scoringItems !== '')
        if (this.slaInfo.qualityControlDtoList.length) {
          if (this.slaInfo.qualityControlDtoList.length < this.ratedItemList.length) {
            // 找出列表中还未选择的评分项目
            this.isEdit = true
            let tempArr = this.ratedItemList.filter(item => !this.slaInfo.qualityControlDtoList.some(ele => ele.scoringItems === item.itemCode))
            tempArr.forEach(item => {
              this.setRatedItem(item)
            })
          } else {
            this.$message.error(errorMsg)
          }
        } else {
          this.isEdit = true
          this.ratedItemList.forEach(item => {
            this.setRatedItem(item)
          })
        }
      }
    },
    /**
     * @description: 快速设置新的评分项目
     * @param {*} item 某项评分项目信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-08 17:10:02
     */
    setRatedItem (item) {
      let emptyData = this.$options.data.call(this).emptyData
      emptyData.scoringItems = item.itemCode
      this.slaInfo.qualityControlDtoList.push(emptyData)
      this.setDefaultValue(item)
    },
    /**
     * @description: 根据评分项目带出各默认值
     * @param {*} item 某项评分项目信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-09 17:41:37
     */
    setDefaultValue (item) {
      // 自动带入【服务项】
      this.setServiceDefVal(item)
      // 自动带入【开始时间类型】、某些【截止时间类型】、【达标时长】、【航线类型】
      this.setStartTimeDefVal(item)
      // 自动带入【异常管理依据】、【得分标准】、【扣分标准】
      this.setExceptionDefVal(item)
    },
    /**
     * @description: 根据【评分项目】自动带入【服务项】
     * @param {*} item 某项评分项目信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-10 09:52:58
     */
    setServiceDefVal (item) {
      let [serviceItemCodes, serviceItemNames] = ['', '']
      let [serviceItemCodeArr, serviceItemNameArr] = [[], []]
      let { itemCode, itemServiceCode, itemServiceName } = item
      this.slaInfo.qualityControlDtoList.forEach(ele => {
        if (ele.scoringItems === itemCode) {
          serviceItemCodes = itemServiceCode
          serviceItemNames = itemServiceName
          if (serviceItemCodes && serviceItemCodes) {
            if (serviceItemCodes.includes(',')) {
              serviceItemCodeArr = serviceItemCodes.split(',')
            } else {
              serviceItemCodeArr.push(serviceItemCodes)
            }
            if (serviceItemNames.includes(',')) {
              serviceItemNameArr = serviceItemNames.split(',')
            } else {
              serviceItemNameArr.push(serviceItemNames)
            }
            ele.serviceItems = []
            serviceItemCodeArr.forEach((sItem, sIndex) => {
              ele.serviceItems.push({
                itemServiceCode: sItem,
                itemServiceName: serviceItemNameArr[sIndex]
              })
            })
          }
        }
      })
    },
    /**
     * @description: 根据【评分项目】自动带入【开始时间类型】、某些【截止时间类型】、【达标时长】、【航线类型】
     * @param {*} item 某项评分项目信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-10 11:18:48
     */
    setStartTimeDefVal (item) {
      let { itemCode } = item
      this.slaInfo.qualityControlDtoList.forEach(ele => {
        if (ele.scoringItems === itemCode) {
          if (itemCode === 'take_delivery') { //提货
            ele.lineTypes[0].startTimeType = 'intrust_container_box_time,intrust_cargo_box_time'
            ele.lineTypes[0].stopTimeType = 'arrive_time'
            ele.lineTypes[0].timeCount = 1
            ele.lineTypes[0].timeType = 'H'
          } else if (itemCode === 'waybill_on_time') { //运单提供及时率
            // 快捷创建时，需默认带入以下值
            ele.lineTypes = [
              {
                startTimeType: "td_time",
                stopTimeType: "obd_bill_upload_time",
                timeCount: 3,
                timeType: "WD",
                lineType: "near_sea_shipping_line"
              },
              {
                startTimeType: "td_time",
                stopTimeType: "obd_bill_upload_time",
                timeCount: 5,
                timeType: "WD",
                lineType: "ocea_going_shipping_line"
              },
            ]
            this.setStandardInfo(ele)
          } else if (itemCode === 'put') { //放单放货
            // 快捷创建时，需默认带入以下值
            ele.lineTypes = [
              {
                startTimeType: "bl_put_finish_time",
                stopTimeType: "ta_time",
                timeCount: 3,
                timeType: "WD",
                lineType: "near_sea_shipping_line"
              },
              {
                startTimeType: "bl_put_finish_time",
                stopTimeType: "ta_time",
                timeCount: 5,
                timeType: "WD",
                lineType: "ocea_going_shipping_line"
              },
            ]
            this.setStandardInfo(ele)
          } else if (itemCode === 'pod_comm_clearance') { //清关
            ele.lineTypes[0].startTimeType = 'ta_time'
            ele.lineTypes[0].stopTimeType = 'real_clear_time'
            ele.lineTypes[0].timeCount = 10
            ele.lineTypes[0].timeType = 'D'
          } else if (itemCode === 'delivey') { //派送
            ele.lineTypes[0].startTimeType = 'real_delivery_time'
            ele.lineTypes[0].stopTimeType = 'sign_upload_time'
            // 快捷创建时，需默认带入以下值
            ele.lineTypes[0].timeCount = 2
            ele.lineTypes[0].timeType = 'D'
          }
        }
      })
    },
    /**
     * @description: 根据【评分项目】自动带入【异常管理依据】、【得分标准】、【扣分标准】
     * @param {*} item
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-10 15:27:46
     */
    setExceptionDefVal (item) {
      let { itemCode } = item
      this.slaInfo.qualityControlDtoList.forEach(ele => {
        if (ele.scoringItems === itemCode) {
          if (itemCode === "space") { //舱位
            ele.exceptionType = ['order_cancel-shipping_space'] //“订单取消“-”舱位异常“
            ele.addPointStandard = '异常管理没有对应工作单号的舱位异常，则视为"1"；'
            ele.deductPointStandard = '异常管理有对应工作单号的舱位异常，则视为"0"；'
          } else if (itemCode === 'take_delivery') { //提货
            this.setStandardInfo(ele)
          } else if (itemCode === 'container_info') { //柜况
            ele.exceptionType = ['container_error-r_container_bad'] //”柜损异常“-“柜损”
            ele.addPointStandard = '异常管理没有对应工作单号的柜损，则视为"1"；'
            ele.deductPointStandard = '异常管理有对应工作单号的柜损，则视为"0"；'
          } else if (itemCode === "wh_action") { //仓储、内装、捆扎
            ele.exceptionType = ['binding_sub'] //“绑扎异常”
            ele.addPointStandard = '异常管理没有对应工作单号的绑扎异常，则视为"1"；'
            ele.deductPointStandard = '异常管理有对应工作单号的绑扎异常，则视为"0"；'
          } else if (itemCode === "pol_declaration") { //报关
            ele.exceptionType = ['si_error-si_declare'] //“单证异常”-”报关单证“
            ele.addPointStandard = '附件类别有上传报关底单，则视为“1” ；'
            ele.deductPointStandard = 'a. 附件类别没有上传报关底单，则视为“0”；<br />b. 异常管理有对应工作单号的“报关单证”异常，则视为"0"'
          } else if (itemCode === "insurance") { //保险
            ele.addPointStandard = '附件类别有上传保单，则视为“1”；'
            ele.deductPointStandard = '附件类别没有上传保单，则视为“0”；'
          } else if (itemCode === "ship_sail") { //开船
            ele.exceptionType = ['ship_delay-pol_no_in_ship', 'ship_delay-etd_delay', 'ship_delay-eta_delay'] //" 船期延误异常“-“起运港未上船；" 船期延误异常“-”ETD延误“；" 船期延误异常“-"ETA延误”
            ele.addPointStandard = '异常管理没有对应的工作单号的“船期延误异常“-“起运港未上船”、“ETD延误“、"ETA延误，且异常原因非甩柜字段，则视为“1”；'
            ele.deductPointStandard = '异常管理出现对应的工作单号的“船期延误异常“-“起运港未上船”、“ETD延误“、"ETA延误，且异常原因非甩柜字段，则视为“0”；'
          } else if (itemCode === 'container_drop') { //甩柜
            ele.exceptionType = ['ship_delay-pol_no_in_ship', 'ship_delay-eta_delay'] //" 船期延误异常“-“起运港未上船；" 船期延误异常“-"ETA延误”
            ele.addPointStandard = '异常管理没有对应的工作单号的“船期延误异常“-“起运港未上船”、"ETA延误，且异常原因含甩柜字段，则视为“1”；'
            ele.deductPointStandard = '异常管理出现对应的工作单号的“船期延误异常“-“起运港未上船”、"ETA延误，且异常原因含甩柜字段，则视为“0”；'
          } else if (itemCode === 'waybill_on_time') { //运单提供及时率
            this.setStandardInfo(ele)
          } else if (itemCode === 'put') { //放货放单
            ele.exceptionType = ['releasecargo-bl_si'] //“放单放货"-“单证问题"
            this.setStandardInfo(ele)
          } else if (itemCode === 'ship_arrival') { //到港
            ele.addPointStandard = '实际到港时间系统有数值，则视为“1” ；'
            ele.deductPointStandard = '实际到港时间系统没有数值，则视为“0”'
          } else if (itemCode === 'pod_comm_clearance') { //清关
            ele.exceptionType = ['pod_service-clear'] //”目的港服务异常“-“清关”
            this.setStandardInfo(ele)
          } else if (itemCode === 'delivey') { //派送
            ele.exceptionType = ['pod_service-delivery'] //”目的港服务异常“-“派送”
            this.setStandardInfo(ele)
          } else if (itemCode === 'transport_quality') { //运输质量（货损货差等）
            ele.exceptionType = ['cargo_error-r_cargo_bad', "cargo_error-r_cargo_diff"] //”货损货差“-”货损”，货差“
            ele.addPointStandard = '异常管理没有对应工作单号的“货损”，’货差，则视为"1"；'
            ele.deductPointStandard = '异常管理有对应工作单号的“货损”，’货差，则视为"0"'
          } else if (itemCode === 'pod_change_doc') { //目的港换单服务
            ele.exceptionType = ['pod_service-r_change'] //“目的港服务异常”-“换单“
            ele.addPointStandard = '换单状态”已换单“，换单完成时间有数值，则视为”1“；'
            ele.deductPointStandard = 'a. 换单状态非“已换单”、“换单完成时间”没有数值，则视为”0；<br />b. 换单状态”已换单“，换单完成时间有数值，但是异常系统出现“异常类型”目的港换单“，则视为”0“；'
          } else if (itemCode === 'customer_complaints') { //投诉
            ele.exceptionType = []
            ele.addPointStandard = ""
            ele.deductPointStandard = "根据异常管理是否客户投诉，如“是” 则视为“-5分”（同一票同一时间发生同一个异常原因，则视为一票，扣5分）"
          }
        }
      })
    },
    /**
     * @description: 动态设置【得分标准】、【扣分标准】
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-04 18:21:27
     */
    setStandardInfo (row) {
      // 运单提供及时率、放单放货 有远洋和近洋两种得扣分标准
      let addPointStandard = ""
      let deductPointStandard = ""
      if (row.lineTypes && row.lineTypes.length) {
        row.lineTypes.forEach(item => {
          if (item.startTimeType && item.stopTimeType && item.timeCount && item.timeType) {
            if (['waybill_on_time', 'put'].includes(row.scoringItems)) {
              if (item.lineType) {
                addPointStandard += `<b>${this.formatDictMapObj('slaLineType', item.lineType)}：</b><br />“${this.formatDictMapObj('slaTimeKey', item.startTimeType)}”与“${this.formatDictMapObj('slaTimeKey', item.stopTimeType)}”小于等于${this.formatterStandardDays(item.timeCount, item.timeType)}，则视为“1”；<br />`
                if (row.scoringItems === 'waybill_on_time') { //运单提供及时率
                  deductPointStandard += `<b>${this.formatDictMapObj('slaLineType', item.lineType)}：</b><br />“${this.formatDictMapObj('slaTimeKey', item.startTimeType)}”与“${this.formatDictMapObj('slaTimeKey', item.stopTimeType)}”大于${this.formatterStandardDays(item.timeCount, item.timeType)}，则视为“0”；<br />`
                }
                if (row.scoringItems === 'put') { //放货放单
                  deductPointStandard += `<b>${this.formatDictMapObj('slaLineType', item.lineType)}：</b><br />a. “${this.formatDictMapObj('slaTimeKey', item.startTimeType)}”与“${this.formatDictMapObj('slaTimeKey', item.stopTimeType)}”大于${this.formatterStandardDays(item.timeCount, item.timeType)}，则视为"0"；<br />b. 异常管理出现对应工作单号的“放单放货"-“单证问题"，则视为"0"；<br />`
                }
              } else {
                addPointStandard = ''
                deductPointStandard = ''
              }
            } else if (['pod_comm_clearance', 'delivey'].includes(row.scoringItems)) {
              addPointStandard = `“${this.formatDictMapObj('slaTimeKey', item.startTimeType)}”与“${this.formatDictMapObj('slaTimeKey', item.stopTimeType)}”小于等于${this.formatterStandardDays(item.timeCount, item.timeType)}，则视为“1”；`
              if (['pod_comm_clearance'].includes(row.scoringItems)) { //清关
                deductPointStandard = `a. “${this.formatDictMapObj('slaTimeKey', item.startTimeType)}”与“${this.formatDictMapObj('slaTimeKey', item.stopTimeType)}”大于${this.formatterStandardDays(item.timeCount, item.timeType)}，则视为“0"；<br />b. 预计清关时间，实际清关时间，任一个未录入，则视为“0”；<br/>c. 异常管理有对应工作单号的”目的港服务““清关”异常，则视为"0"；`
              }
              if (['delivey'].includes(row.scoringItems)) { //派送
                deductPointStandard = `a. ${this.formatDictMapObj('slaTimeKey', item.startTimeType)}”与“${this.formatDictMapObj('slaTimeKey', item.stopTimeType)}”大于${this.formatterStandardDays(item.timeCount, item.timeType)}，则视为“0”；<br />b. 异常管理有对应工作单号的”目的港服务““派送”异常，则视为"0"`
              }
            } else if (['take_delivery'].includes(row.scoringItems)) { //提货
              addPointStandard = `a. 拖柜：“委托装柜时间”与”实际到场时间“之间的取值小于等于${this.formatterStandardDays(item.timeCount, item.timeType)}，则视为“1”；<br />b. 散车：委托装货时间与”实际到场时间“之间的取值小于等于${this.formatterStandardDays(item.timeCount, item.timeType)}，则视为“1”；`
              deductPointStandard = `a. 拖柜：“委托装柜时间”与”实际到场时间“之间的取值大于${this.formatterStandardDays(item.timeCount, item.timeType)}，则视为“0”；<br />b. 散车：“委托装货时间”与”实际到场时间“之间的取值大于${this.formatterStandardDays(item.timeCount, item.timeType)}，则视为“0”；<br />c. 拖柜，散货：委托装柜时间”、“委托装货时间”、”实际到场时间“任意一个没有数值则视为“0”；`
            }
          } else {
            addPointStandard = ''
            deductPointStandard = ''
          }
        })
      }
      row.addPointStandard = addPointStandard
      row.deductPointStandard = deductPointStandard
    },
    /**
     * @description: 将【异常管理依据】数组转换成文字形式展示
     * @param {*} row 当前行数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-10 15:31:10
     */
    formatExceptionType (row) {
      let itemCode = row.scoringItems
      if (row.exceptionType.length) {
        if (itemCode === "space") { //舱位
          return '异常类型：<br />“订单取消”-“舱位异常”'
        } else if (itemCode === 'container_info') { //柜况
          return '异常类型：<br />“柜损异常”-“柜损”'
        } else if (itemCode === "wh_action") { //仓储、内装、捆扎
          return '异常类型：<br />“绑扎异常”'
        } else if (itemCode === "pol_declaration") { //报关
          return '异常类型：<br />“单证异常”-“报关单证”'
        } else if (itemCode === "ship_sail") { //开船
          return '异常类型：<br />“船期延误异常“-“起运港未上船”，且“异常原因”非“船司甩柜/换船/客户收货人为黑名单”；<br />"船期延误异常“-”ETD延误“<br />"船期延误异常“-"ETA延误”且“异常原因”非“中转港甩柜”；'
        } else if (itemCode === 'container_drop') { //甩柜
          return '异常类型：<br />“船期延误异常”-“起运港未上船”，且“异常原因”为“船司甩柜/换船/客户收货人为黑名单”；<br />“船期延误异常“-“ETA延误”且“异常原因”为“中转港甩柜”；'
        } else if (itemCode === 'put') { //放货放单
          return '异常类型：<br />“放单放货”-“单证问题”'
        } else if (itemCode === 'pod_comm_clearance') { //清关
          return '异常类型：<br />“目的港服务异常”-“清关”'
        } else if (itemCode === 'delivey') { //派送
          return '异常类型：<br />“目的港服务异常”-“派送”'
        } else if (itemCode === 'transport_quality') { //运输质量（货损货差等）
          return '异常类型：<br />“货损货差”-“货损”；<br />“货损货差”-“货差”'
        } else if (itemCode === 'pod_change_doc') { //目的港换单服务
          return '异常类型：<br />“目的港服务异常”-“换单”'
        }
      } else {
        if (itemCode === 'customer_complaints') { //投诉
          return '异常管理是否客户投诉'
        } else {
          return ''
        }
      }
    },
    /**
     * @description: 编辑
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-03 10:14:05
     */
    editFn () {
      this.isEdit = true
    },
    /**
     * @description: 取消编辑
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-03 10:21:04
     */
    cancelFn () {
      this.isEdit = false
      this.getQualityControlList()
    },
    /**
     * @description: 提交审核
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-10 15:06:49
     */
    submitFn () {
      if (!this.slaInfo.qualityControlDtoList.length) {
        this.$message.error("暂无数据可以提交审核！")
      } else {
        let haveRate = this.slaInfo.qualityControlDtoList.some(item => item.scoringItems === '')
        if (haveRate) {
          return this.$message.error("存在未选择评分项目的数据，请选择后再提交！")
        } else {
          // 校验达标时长 评分项目为“提货”、“运单提供及时率”、“放单放货”、“清关”、“派送”时，此字段出现文本输入框；必填
          for (let i = 0; i < this.slaInfo.qualityControlDtoList.length; i++) {
            const element = this.slaInfo.qualityControlDtoList[i];
            if (['take_delivery', 'waybill_on_time', 'put', 'pod_comm_clearance', 'delivey'].includes(element.scoringItems)) {
              for (let j = 0; j < element.lineTypes.length; j++) {
                const lineTypesItem = element.lineTypes[j];
                if ([null, undefined, ''].includes(lineTypesItem.timeCount)) {
                  return this.$message.error(`【${this.formatRatedItem(element.scoringItems)}】评分项目的达标时长不能为空！`)
                }
              }
              
            }
          }
        }
        this.saveApi()
      }
    },
    /**
     * @description: 提交审核前先调保存接口，再调提交审核接口
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-12 16:28:56
     */
    saveApi () {
      let data = JSON.parse(JSON.stringify(this.slaInfo))
      slaApi['addOrUpdate'](data).then(res => {
        if (res.code === 0) {
          this.submitCheckApi()
        }
      }).catch(() => { })
    },
    /**
     * @description: 调用提交审核接口
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-10 18:33:12
     */
    submitCheckApi () {
      let params = {
        custid: this.custid,
        verifierId: this.verifierInfo.employeeId,
        verifierName: this.verifierInfo.employeeName
      }
      slaApi['verify'](params).then(res => {
        if (res.code === 0) {
          this.$message.success("提交成功！")
          this.isEdit = false
          this.getQualityControlList()
        }
      }).catch(() => { })
    },
    /**
     * @description: 系统配置的审核人审核
     * @param {*} type pass-审核通过 noPass-审核不通过
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-09 15:06:40
     */
    checkFn (type) {
      if (type === 'pass') {
        this.checkPassApi()
      } else if (type === 'noPass') {
        this.noPassDialog.show = true
      }
    },
    /**
     * @description: 确定审核
     * @param {*} tag
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-09 15:16:16
     */
    confirmFn (tag) {
      if (!tag) return (this.noPassDialog.show = false)
      this.checkRefuseApi()
    },
    /**
     * @description: 调用审核拒绝接口
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-09 15:16:42
     */
    checkRefuseApi () {
      let data = {
        custid: this.custid,
        ...this.noPassDialog.form
      }
      this.noPassDialog.btnLoading = true
      slaApi['refuse'](data).then((res) => {
        if (res.code === 0) {
          this.noPassDialog.show = false
          this.$msgSucClose('操作成功！')
          this.getQualityControlList()
        }
      }).catch(() => {
      }).finally(() => {
        this.noPassDialog.btnLoading = false
      })
    },
    /**
     * @description: 调用审核通过接口
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-10 18:39:22
     */
    checkPassApi () {
      let data = {
        custid: this.custid
      }
      slaApi['pass'](data).then((res) => {
        if (res.code === 0) {
          this.$msgSucClose('操作成功！')
          this.getQualityControlList()
        }
      }).catch(() => {
      })
    },
    /**
     * @description: 编辑状态下删除行数据（前端删除）
     * @param {*} rowIndex 数据下标
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-03 10:35:52
     */
    deleteRowFn (rowIndex) {
      this.slaInfo.qualityControlDtoList.splice(rowIndex, 1)
    },
    /**
     * @description: 切换评分项目联动其它的字段的值
     * @param {*} row 行数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-03 12:09:56
     */
    changeRatedItem (row) {
      // 屏蔽已选的评分项目下拉项
      this.shieldRatedItem(row)
      // 带出其它列的默认值
      if (this.ratedItemList.length) {
        let findObj = this.ratedItemList.find(item => item.itemCode === row.scoringItems)
        findObj && this.setDefaultValue(findObj)
      }
    },
    /**
     * @description: 屏蔽掉已选的评分项目
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-08 18:08:56
     */
    shieldRatedItem () {
      // 屏蔽掉已选的评分项目
      this.ratedItemList.forEach(rItem => {
        rItem.isDisabled = false
      })
      this.slaInfo.qualityControlDtoList.forEach(item => {
        this.ratedItemList.forEach(rItem => {
          if (item.scoringItems === rItem.itemCode) {
            rItem.isDisabled = true
          }
        })
      })
    },
    /**
     * @description: 激活单元格编辑状态时回调
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-08 18:07:40
     */
    editActivedEvent ({ column }) {
      if (column.property === "scoringItems") {
        this.shieldRatedItem()
      }
    },
    /**
     * @description: 设置单元格是否禁用
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-11 14:53:53
     */
    activeCellMethod ({ columnIndex, row }) {
      if (!row.scoringItems && [6, 7].includes(columnIndex)) {
        return false
      }
      if (!['put', 'delivey'].includes(row.scoringItems) && columnIndex === 4) {
        return false
      }
      return true
    },
    /**
     * @description: 修改【开始时间类型】，【截止时间类型】联动
     * @param {*} val 当前时间值
     * @param {*} row 当前行数据
     * @param {*} lineTypes 当前航线相关数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-04 18:01:24
     */
    changeStartTimeType (val, row, lineTypes) {
      if (['waybill_on_time'].includes(row.scoringItems)) { //运单提供及时率
        if (['td_time'].includes(val)) lineTypes.stopTimeType = "obd_bill_upload_time"
      }
      if (['put'].includes(row.scoringItems)) { //放单放货
        if (['custom_agree_release', 'td_time'].includes(val)) lineTypes.stopTimeType = "bl_put_finish_time"
        if (['bl_put_finish_time'].includes(val)) lineTypes.stopTimeType = "ta_time"
      }
      if (['pod_comm_clearance'].includes(row.scoringItems)) { //清关
        if (['ta_time'].includes(val)) lineTypes.stopTimeType = "real_clear_time"
      }
      if (['delivey'].includes(row.scoringItems)) { //派送
        if (['real_delivery_time'].includes(val)) lineTypes.stopTimeType = "sign_upload_time"
        if (['real_clear_time'].includes(val)) lineTypes.stopTimeType = "real_delivery_time"
      }
      this.setStandardInfo(row)
    },
    /**
     * @description: 切换【航线类型】，【得分标准】、【扣分标准】联动
     * @param {*} val
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-04 18:08:54
     */
    changeLineType (row) {
      this.setStandardInfo(row)
    },
    /**
     * @description: 
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-05 10:57:43
     */
    changeStandardDays (row) {
      this.setStandardInfo(row)
    },
    /**
     * @description: 转换业务类型格式
     * @param {*} val
     * @return {*} 转换后的格式
     * @author: yinjunying
     * @Date: 2022-08-02 14:26:47
     */
    formatBusinessType (val) {
      if (val) {
        if (val.length === 1) {
          return this.dictMapObj.slaBusinessType[val]
        } else if (val.length > 1) {
          let arr = []
          val.forEach(item => {
            arr.push(this.dictMapObj.slaBusinessType[item])
          });
          return arr.length ? arr.join('、') : ''
        }
      } else {
        return ''
      }
    },
    /**
     * @description: 转换达标天数格式
     * @param {*} timeCount
     * @param {*} timeType
     * @return {*} 转换后的格式
     * @author: yinjunying
     * @Date: 2022-08-04 17:14:11
     */
    formatterStandardDays (timeCount, timeType) {
      if (timeCount && timeType) {
        if (['WD', 'H'].includes(timeType)) {
          return timeCount + '个' + this.formatDictMapObj('slaTimeType', timeType)
        } else {
          return timeCount + this.formatDictMapObj('slaTimeType', timeType)
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
$orgColor: #e3730d;
$linkColor: #1890ff;
.ml10 {
  margin-left: 10px;
}
.pass {
  color: green;
}
.refuse {
  color: #dd3737;
}
.linkText {
  color: $linkColor;
  cursor: pointer;
}
.buleText {
  color: $linkColor;
}
.info-page {
  /deep/ .vxe-icon--edit-outline {
    color: $orgColor;
  }
  .orgFont {
    color: $orgColor;
  }
}
.info-title {
  height: 26px !important;
  p {
    font-weight: normal;
    font-size: 12px;
    line-height: 16px;
    .textIndent {
      text-indent: 5em;
      display: inline-block;
    }
  }
}
.info-table {
  margin-top: 5px;
  /deep/ .el-link--danger {
    font-size: 12px;
  }
}
.status-info {
  color: #4a4a4a;
  display: inline-block;
  font-weight: bold !important;
  margin-right: 10px;
}
.question-icon {
  font-size: 16px;
  vertical-align: text-bottom;
  color: #808080;
  margin-left: 3px;
  margin-right: 10px;
}
</style>