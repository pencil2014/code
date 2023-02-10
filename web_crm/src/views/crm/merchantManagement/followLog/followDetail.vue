<template>
  <el-dialog
    :appendToBody="true"
    :visible.sync="options.show"
    class="follow-add"
    title="跟进记录详情"
    width="800px"
  >
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="follow-form"
      label-width="110px"
      ref="form"
      size="mini"
    >
      <el-form-item key="commuType" label="跟进方式" prop="commuType">
        <el-select
          v-model="form.commuType"
          placeholder="请选择"
          @change="changeCommuType"
          disabled
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in dictMap['custCommType']"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item key="commuTime" label="跟进时间:" prop="commuTime">
        <el-date-picker
          v-model="form.commuTime"
          type="date"
          placeholder="请选择"
          value-format="yyyy-MM-dd"
          disabled
        ></el-date-picker>
      </el-form-item>
      <el-form-item key="custName" label="客户名称:" prop="custName">
        <el-input
          v-model="form.custName"
          placeholder="请填写"
          disabled
        ></el-input>
      </el-form-item>
      <el-form-item key="bdEmployeeId" label="跟进人:" prop="bdEmployeeId">
        <el-select
          v-model="form.bdEmployeeId"
          value-key="employeeId"
          filterable
          clearable
          placeholder="请选择"
          remote
          :remote-method="
            (str) => {
              getEmployeeList(str)
            }
          "
          disabled
        >
          <el-option
            v-for="(item, index) in employeeList"
            :key="item.employeeNo + index"
            :label="`${item.cname}_${item.employeeId}_${
              item.deptCname || '未知'
            }`"
            :value="item"
            disabled
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item key="isCheck" label="是否已检查:" prop="isCheck">
        <el-select v-model="form.isCheck" placeholder="请选择" disabled>
          <el-option label="已检查" value="yes"></el-option>
          <el-option label="未检查" value="no"></el-option>
        </el-select>
      </el-form-item>
      <template v-if="form.isCheck==='yes'">
        <el-form-item key="checkEmployeeName" label="检查人:" prop="checkEmployeeName">
          <el-input v-model="form.checkEmployeeName" disabled></el-input>
        </el-form-item>
        <el-form-item key="checkTime" label="检查时间:" prop="checkTime">
          <el-date-picker
            v-model="form.checkTime"
            type="date"
            placeholder="请选择"
            value-format="yyyy-MM-dd"
            disabled
          ></el-date-picker>
        </el-form-item>
      </template>
      <template v-if="showWechat">
        <el-form-item key="polPortCode" label="起运港:" prop="polPortCode">
          <el-select
            v-model="form.polPortCode"
            placeholder="请选择"
            filterable
            clearable
            remote
            value-key="portCode"
            :remote-method="
              (str) => {
                getPort(str, 'port_of_basic')
              }
            "
            @visible-change="showPolport"
            disabled
          >
            <el-option
              :label="`${item.ename}(${item.cname})`"
              :value="item"
              :key="item.portCode"
              v-for="item in polList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item key="podPortCode" label="目的港:" prop="podPortCode">
          <el-select
            v-model="form.podPortCode"
            placeholder="请选择"
            filterable
            clearable
            remote
            value-key="portCode"
            :remote-method="
              (str) => {
                getPort(str, 'port_of_destination')
              }
            "
            @change="changePod"
            @visible-change="showPodport"
            disabled
          >
            <el-option
              :label="`${item.ename}(${item.cname})`"
              :value="item"
              :key="item.portCode"
              v-for="item in podList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item key="commLines" label="出货航线:" prop="commLines">
          <el-select
            v-model="form.commLines"
            value-key="sysLineCode"
            filterable
            clearable
            placeholder="请选择"
            multiple
            collapse-tags
            remote
            :remote-method="getSystemLineList"
          >
            <el-option
              v-for="(item, index) in sysLine"
              :key="item.sysLineCode + index"
              :label="item.cname"
              :value="item"
              disabled
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          key="goodsReadyTime"
          label="货好时间:"
          prop="goodsReadyTime"
        >
          <el-date-picker
            v-model="form.goodsReadyTime"
            type="date"
            placeholder="请选择"
            value-format="yyyy-MM-dd"
            disabled
          ></el-date-picker>
        </el-form-item>
        <el-form-item
          key="isCooperation"
          label="是否合作:"
          prop="isCooperation"
        >
          <el-select v-model="form.isCooperation" placeholder="请选择" disabled>
            <el-option label="是" value="yes"></el-option>
            <el-option label="否" value="no"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          key="commContainerInfos"
          label="箱型箱量:"
          prop="commContainerInfos"
          class="flex-large"
          :required="true"
        >
          <div class="contain-box">
            <div class="item-box">
              <div
                class="item"
                v-for="(item, index) in form.commContainerInfos"
                :key="item.containerType + index"
              >
                <el-select
                  v-model="item.containerType"
                  placeholder="请选择"
                  style="width: 50%"
                  @change="changeConterType"
                  disabled
                >
                  <el-option
                    v-for="item in dictMap['containerTypeShiporder']"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
                <el-input
                  v-model="item.containerNum"
                  placeholder="请输入"
                  style="width: 50%"
                  disabled
                ></el-input>
                <!-- <div class="plus-icon">
                  <i
                    class="el-icon-circle-plus"
                    @click="addContainer"
                    v-if="index === 0"
                  ></i>
                  <i
                    class="el-icon-remove"
                    @click="removeContainer(index)"
                    v-else
                  ></i>
                </div> -->
              </div>
            </div>
          </div>
        </el-form-item>
      </template>
      <template v-if="showVisit">
        <el-form-item key="companyScale" label="公司规模:" prop="companyScale">
          <el-input
            v-model="form.companyScale"
            placeholder="请填写"
            :maxlength="64"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item key="visitors" label="我司拜访人:" prop="visitors">
          <el-select
            v-model="form.visitors"
            value-key="employeeId"
            filterable
            clearable
            placeholder="请选择"
            multiple
            collapse-tags
            remote
            :remote-method="
              (str) => {
                getBaseEmployeeList(str)
              }
            "
          >
            <el-option
              v-for="(item, index) in employeeList2"
              :key="item.employeeNo + index"
              :label="`${item.cname}_${item.employeeId}_${
                item.deptCname || '未知'
              }`"
              :value="item"
              disabled
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item key="custContact" label="联系人:" prop="custContact">
          <el-input
            v-model="form.custContact"
            placeholder="请填写"
            :maxlength="32"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item
          key="custContactPosition"
          label="职位:"
          prop="custContactPosition"
        >
          <el-input
            v-model="form.custContactPosition"
            placeholder="请填写"
            :maxlength="64"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item key="commuMode" label="通讯方式:" prop="commuMode">
          <el-input
            v-model="form.commuMode"
            placeholder="请填写"
            :maxlength="32"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item
          key="companyAddress"
          label="公司地址:"
          prop="companyAddress"
        >
          <el-input
            v-model="form.companyAddress"
            placeholder="请填写"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item
          key="isCooperation"
          label="是否合作:"
          prop="isCooperation"
        >
          <el-select v-model="form.isCooperation" placeholder="请选择" disabled>
            <el-option label="是" value="yes"></el-option>
            <el-option label="否" value="no"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item key="commLines" label="出货航线:" prop="commLines">
          <el-select
            v-model="form.commLines"
            value-key="sysLineCode"
            filterable
            clearable
            placeholder="请选择"
            multiple
            collapse-tags
            remote
            :remote-method="getSystemLineList"
            @visible-change="showLine"
          >
            <el-option
              v-for="(item, index) in sysLine"
              :key="item.sysLineCode + index"
              :label="item.cname"
              :value="item"
              disabled
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          key="shipmentTypes"
          label="出货类型:"
          prop="shipmentTypes"
        >
          <el-select
            v-model="form.shipmentTypes"
            placeholder="请选择"
            filterable
            clearable
            multiple
            collapse-tags
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in dictMap['custCommShipmentType']"
              disabled
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item key="majorProduct" label="主要产品:" prop="majorProduct">
          <el-input
            v-model="form.majorProduct"
            placeholder="请填写"
            :maxlength="128"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item
          key="businessTypes"
          label="业务类型:"
          prop="businessTypes"
        >
          <el-select
            v-model="form.businessTypes"
            placeholder="请选择"
            filterable
            clearable
            multiple
            collapse-tags
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in dictMap['baseBusinessType']"
              disabled
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          key="tradeTermsCode"
          label="贸易条款:"
          prop="tradeTermsCode"
        >
          <el-select
            v-model="form.tradeTermsCode"
            placeholder="请选择"
            filterable
            clearable
            disabled
          >
            <el-option
              :label="item.label"
              :value="item.value"
              :key="item.value"
              v-for="item in dictMap['tradeTermsCode']"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          key="cargoSituationType"
          label="货量情况:"
          prop="cargoSituationType"
          class="felx-option"
        >
          <el-select
            v-model="form.cargoSituationType"
            placeholder="请选择"
            class="middle-item"
            disabled
          >
            <el-option
              v-for="item in dictMap['custCommCargoSituationType']"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <el-input
            v-model="form.cargoSituationNum"
            placeholder="请填写"
            class="middle-item"
            disabled
          >
            <template slot="append">T</template></el-input
          >
        </el-form-item>
        <el-form-item
          key="mainRequirement"
          label="客户主要需求:"
          prop="mainRequirement"
          class="flex-item"
        >
          <el-input
            type="textarea"
            v-model="form.mainRequirement"
            placeholder="请填写"
            autosize
            :maxlength="512"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item
          key="materialDocPrepare"
          label="物料、资料准备:"
          prop="materialDocPrepare"
          class="flex-item"
        >
          <el-input
            type="textarea"
            v-model="form.materialDocPrepare"
            placeholder="请填写"
            autosize
            :maxlength="512"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item
          key="visitTarget"
          label="拜访(访谈)目标:"
          prop="visitTarget"
          class="flex-item"
        >
          <el-input
            type="textarea"
            v-model="form.visitTarget"
            placeholder="请填写"
            autosize
            :maxlength="512"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item
          key="visitCheck"
          label="拜访(访谈)复盘:"
          prop="visitCheck"
          class="flex-item"
        >
          <el-input
            type="textarea"
            v-model="form.visitCheck"
            placeholder="请填写"
            autosize
            :maxlength="512"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item
          key="nextPlan"
          label="下一步计划:"
          prop="nextPlan"
          class="flex-item"
        >
          <el-input
            type="textarea"
            v-model="form.nextPlan"
            placeholder="请填写"
            autosize
            :maxlength="512"
            disabled
          ></el-input>
        </el-form-item>
      </template>
      <template v-if="showWechat">
        <el-form-item
          key="noCooperationReason"
          label="未合作原因:"
          prop="noCooperationReason"
          class="flex-item"
          :rules="{
            required: form.isCooperation === 'no',
            message: '未合作原因必填',
            trigger: 'change',
          }"
        >
          <el-input
            type="textarea"
            v-model="form.noCooperationReason"
            placeholder="请填写"
            autosize
            :maxlength="512"
            disabled
          ></el-input>
        </el-form-item>
      </template>
      <el-form-item key="remark" label="备注:" prop="remark" class="flex-item">
        <el-input
          type="textarea"
          v-model="form.remark"
          placeholder="请填写"
          autosize
          :maxlength="512"
          disabled
        ></el-input>
      </el-form-item>
      <el-form-item key="fileList" label="附件上传:" class="flex-large">
        <div class="file-list">
          <div class="file-item" v-for="item in fileList" :key="item.fileNo" @click="preview(item)">
            {{item.name}}
          </div>
        </div>
      </el-form-item>
    </el-form>
    <div class="dialog-footer" slot="footer"></div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  baseEmployeeList,
  baseSystemLineList,
  portList,
  portSystemLineInfo,
  listByRole
} from '@/api/base'
import { searchBd } from '@/api/crm/follow'
export default {
  props: {
    options: {
      type: Object,
      default: () => {}
    },
    custid: ''
  },
  data() {
    return {
      employeeList: [],
      employeeList2: [],
      sysLine: [],
      showVisit: true,
      showWechat: false,
      form: {
        isCheck: '',
        checkEmployeeName: '',
        checkTime: '',
        commuType: '',
        commuTime: '',
        custName: '',
        bdEmployeeId: '',
        companyScale: '',
        companyAddress: '',
        custContact: '',
        custContactPosition: '',
        commuMode: '',
        isCooperation: '',
        noCooperationReason: '',
        polPortCode: '',
        polPortName: '',
        podPortCode: '',
        podPortName: '',
        majorProduct: '',
        tradeTermsCode: '',
        cargoSituationType: '',
        cargoSituationNum: '',
        goodsReadyTime: '',
        belongEmployeeId: '',
        mainRequirement: '',
        materialDocPrepare: '',
        visitTarget: '',
        visitCheck: '',
        nextPlan: '',
        remark: '',
        visitors: [],
        shipmentTypes: [],
        commLines: [],
        businessTypes: [],
        attachments: [],
        commContainerInfos: [
          {
            containerNum: '',
            containerType: ''
          }
        ]
      },
      rules: {
        commuType: {
          required: true,
          message: '跟进方式必选',
          trigger: 'change'
        },
        commuTime: {
          required: true,
          message: '跟进时间必选',
          trigger: 'change'
        },
        custName: {
          required: true,
          message: '客户名称必填',
          trigger: 'change'
        },
        // companyScale: {
        //   required: true,
        //   message: '公司规模必填',
        //   trigger: 'change'
        // },
        visitors: {
          required: true,
          message: '我司拜访人必选',
          trigger: 'change'
        },
        custContact: {
          required: true,
          message: '联系人必填',
          trigger: 'change'
        },
        custContact: {
          required: true,
          message: '联系人必填',
          trigger: 'change'
        },
        custContactPosition: {
          required: true,
          message: '职位必填',
          trigger: 'change'
        },
        commuMode: {
          required: true,
          message: '通讯方式必填',
          trigger: 'change'
        },
        companyAddress: {
          required: true,
          message: '公司地址必填',
          trigger: 'change'
        },
        isCooperation: {
          required: true,
          message: '是否合作必选',
          trigger: 'change'
        },
        commLines: {
          required: true,
          message: '出货航线必选',
          trigger: 'change'
        },
        shipmentTypes: {
          required: true,
          message: '出货类型必选',
          trigger: 'change'
        },
        majorProduct: {
          required: true,
          message: '主要产品必填',
          trigger: 'change'
        },
        businessTypes: {
          required: true,
          message: '业务类型必选',
          trigger: 'change'
        },
        tradeTermsCode: {
          required: true,
          message: '贸易条款必选',
          trigger: 'change'
        },
        cargoSituationType: {
          required: true,
          message: '货量情况必填',
          trigger: 'change'
        },
        bdEmployeeId: {
          required: true,
          message: '跟进人必选',
          trigger: 'change'
        },
        mainRequirement: {
          required: true,
          message: '客户主要需求必填',
          trigger: 'change'
        },
        visitTarget: {
          required: true,
          message: '拜访（访谈）目标必填',
          trigger: 'change'
        },
        visitCheck: {
          required: true,
          message: '拜访（访谈）复盘必填',
          trigger: 'change'
        },
        nextPlan: {
          required: true,
          message: '下一步计划必填',
          trigger: 'change'
        },
        polPortCode: {
          required: true,
          message: '起运港必选',
          trigger: 'change'
        },
        podPortCode: {
          required: true,
          message: '目的港必选',
          trigger: 'change'
        },
        goodsReadyTime: {
          required: true,
          message: '货好时间必选',
          trigger: 'change'
        }
      },
      sizeLimit: true,
      file: '',
      fileList: [],
      fileListUpload: [],
      showProcess: false,
      processLength: 0,
      podList: [],
      polList: []
    }
  },
  created() {
    // 编辑复制
      this.form = Object.assign(this.form, this.options.form)
      const {
        visitors,
        shipmentTypes,
        businessTypes,
        commuType,
        containerInfos,
        attachments,
        commLines
      } = this.form
      this.changeCommuType(commuType)
      this.form.visitors = visitors.map((item) => {
        const { visitEmployeeId, visitEmployeeName } = item
        this.getBaseEmployeeList(visitEmployeeName)
        return {
          cname: visitEmployeeName,
          employeeId: visitEmployeeId
        }
      })
      if (shipmentTypes.length) {
        this.form.shipmentTypes = shipmentTypes.map((item) => item.shipmentType)
      }
      if (businessTypes.length) {
        this.form.businessTypes = businessTypes.map((item) => item.businessType)
      }
      if (commLines.length) {
        this.form.commLines = commLines.map((item) =>
          Object.assign(item, {
            cname: item.sysLineCname,
            ename: item.sysLineEname
          })
        )
      }
      if (attachments.length) {
        this.fileList = this.form.attachments
        this.fileListUpload = this.form.attachments
      }
      if (containerInfos.length) {
        this.form.commContainerInfos = containerInfos
      }
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    commuTypeList() {
      return this.dictMap['custCommType'].filter(
        (item) => item.value !== 'order_record'
      )
    },
    isObd() {
      return this.$store.state.user.roles.includes('obd')
    }
  },
  methods: {
    // 预览
    preview (row) {
      let { fileNo, name } = row
      name = name.replace(/[\[|\]|\{|\}|\%|`]/g, '')
      const href = `/base/fileView/preview/${fileNo}/${name}`
      window.open(href)
    },
    // 获取上级bd
    getSearchBd(custid, employeeId) {
      searchBd({ custid, employeeId })
        .then((res) => {
          if (res.data) {
            const { bdEmployeeName, bdEmployeeId } = res.data
            this.form.bdEmployeeId = bdEmployeeId
            this.form.bdEmployeeName = bdEmployeeName
          }
        })
        .catch(() => {})
    },
    // 修改箱型箱量
    changeConterType() {
      const types = this.form.commContainerInfos
        .map((item) => item.containerType)
        .filter((ele) => !!ele)
      const setTypes = Array.from(new Set(types))
      if (types.length !== setTypes.length) {
        return this.$msgErrClose('箱型不能重复')
      }
    },
    // 添加箱型箱量
    addContainer() {
      this.form.commContainerInfos.push({
        containerNum: '',
        containerType: ''
      })
    },
    // 删除箱型箱量
    removeContainer(index) {
      this.form.commContainerInfos.splice(index, 1)
    },
    // 跟进人
    getEmployeeList(str = '') {
      const data = {
        currPage: 1,
        pageSize: 1000,
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
            this.employeeList = res.data.list || []
            // 初始化跟进人
            const { bdEmployeeId } = this.form
            if (typeof bdEmployeeId !== 'object') {
              const source = res.data.list.find(
                (item) => item.employeeId === bdEmployeeId
              )
              if (source) {
                this.form.bdEmployeeId = source
              }
            }
          }
        })
        .catch(() => {})
    },
    // 拜访人
    getBaseEmployeeList(str = '') {
      if (!str) {
        return
      }
      const data = {
        columns: [],
        currPage: 1,
        pageSize: 10,
        query: [{ column: 'name', type: 'eq', value: str }]
      }
      baseEmployeeList(data)
        .then((res) => {
          if (res.code === 0) {
            let source = res.data.list.filter(item => item.cname === str)
            this.employeeList2 = this.employeeList2.concat(source || [])
          }
        })
        .catch(() => {})
    },
    // 航线
    getSystemLineList(str = '') {
      baseSystemLineList(str, 'valid')
        .then((res) => {
          this.sysLine = res.data
          // this.sysLine.unshift({
          //   label: '所有航线',
          //   value: '100000001',
          //   ename: 'all'
          // })
        })
        .catch(() => {})
    },
    showLine(val) {
      if (val && !this.sysLine.length) {
        this.getSystemLineList()
      }
    },
    // 起运港port_of_basic，目的港port_of_destination
    getPort(str = '', type) {
      if (str === '') {
        str =
          type === 'port_of_basic'
            ? this.form.polPortName
            : this.form.podPortName
      }
      const data = {
        portName: str,
        portAttribute: type,
        portCodes: '',
        state: 'valid'
      }
      portList(data)
        .then((res) => {
          if (type === 'port_of_basic') {
            this.polList = res.data
            const { polPortCode } = this.form
            if (typeof polPortCode !== 'object') {
              this.form.polPortCode =
                res.data.find((item) => item.portCode === polPortCode) || ''
            }
          } else {
            this.podList = res.data
            const { podPortCode } = this.form
            if (typeof podPortCode !== 'object') {
              this.form.podPortCode =
                res.data.find((item) => item.portCode === podPortCode) || ''
            }
          }
        })
        .catch(() => {})
    },
    showPolport(val) {
      if (val && !this.polList.length) {
        this.getPort('', 'port_of_basic')
      }
    },
    showPodport(val) {
      if (val && !this.podList.length) {
        this.getPort('', 'port_of_destination')
      }
    },
    // 切换拜访方式
    changeCommuType(val) {
      this.showVisit = val === 'visit'
      this.showWechat = val === 'inquiry_quotation'
    },
    // 切换目的港
    changePod(data) {
      const { commuType } = this.form
      const { portCode } = data
      if (!commuType || !portCode) {
        return ''
      }
      if (this.form.commuType === 'inquiry_quotation') {
        portSystemLineInfo(portCode)
          .then((res) => {
            if (res.data.length) {
              this.form.commLines = [res.data[0]]
            }
          })
          .catch(() => {})
      }
    },
    // 超出限制
    handleExceed(files, fileList) {
      this.$msgErrClose(`只能选择上传10个文件！`)
    },
    // 上传前钩子获取file名
    getFile(file) {
      this.file = file
    },
    // 删除上传文件
    handleRemove(file, fileList) {
      this.fileList = fileList
      this.fileListUpload = this.fileListUpload.filter((item) => {
        if (file.fileNo) {
          return item.fileNo !== file.fileNo
        } else {
          return item.uid !== file.uid
        }
      })
    },
    // 上传文件
    handleImport() {
      this.handleProgress()
      const form = new FormData()
      form.append('file', this.file)
      const uid = this.file.uid
      this.$store
        .dispatch('user/import', {
          uri: '/base/webapi/file/upload',
          params: form
        })
        .then((res) => {
          this.processLength = 100
          this.showProcess = false
          if (res.data.code === 0) {
            this.$msgSucClose('上传成功!')
            this.fileListUpload.push(Object.assign({}, res.data.data, { uid }))
          }
        })
    },
    // 上传进度条
    handleProgress(file, fileList) {
      this.processLength = 0
      this.showProcess = true
      const interval = setInterval(() => {
        if (this.processLength >= 99) {
          clearInterval(interval)
          return
        }
        this.processLength += 1
      }, 200)
    },
    // 取消
    cancel() {
      this.$emit('cancel')
    },
    // 提交
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const {
            commuType,
            commContainerInfos,
            cargoSituationNum,
            polPortCode,
            podPortCode
          } = this.form
          // 拜访
          if (commuType === 'visit') {
            if (!cargoSituationNum) {
              return this.$msgErrClose('货量情况必填')
            }
            if (!/^\d+$/.test(cargoSituationNum)) {
              return this.$msgErrClose('货量情况必须填写数字')
            }
          }
          // 询价
          if (commuType === 'inquiry_quotation') {
            const sta = commContainerInfos.some(
              (item) => !item.containerType || !item.containerNum
            )
            if (sta) {
              return this.$msgErrClose('箱型箱量必填')
            }
            const types = commContainerInfos
              .map((item) => item.containerType)
              .filter((ele) => !!ele)
            const setTypes = Array.from(new Set(types))
            if (types.length !== setTypes.length) {
              return this.$msgErrClose('箱型不能重复')
            }
            if (polPortCode.portCode === podPortCode.portCode) {
              return this.$msgErrClose('起运港和目的港不能相同')
            }
          }
          this.form.fileNos = this.fileListUpload.map((item) => item.fileNo)
          this.$emit('submit', this.form)
        }else {
          return this.$msgErrClose('请将必填项填写完整！')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.follow-add {
  .follow-form {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    max-height: 500px;
    /deep/ .el-form-item {
      width: 50%;
      margin-right: 0;
      display: flex;
      align-items: center;
      .el-form-item__label {
        height: 20px;
        line-height: 20px;
      }
      .el-form-item__content {
        flex: 1;
        // overflow: hidden;
        line-height: 24px;
      }
      .el-input__inner,
      .el-select,
      .el-select__tags {
        height: 20px !important;
        width: 100%;
        line-height: 20%;
        &.middle-item {
          width: 50%;
        }
      }
      .el-date-editor {
        width: 100%;
      }
      .el-input--mini .el-input__icon {
        line-height: 20px;
      }
      .middle-item {
        width: 50%;
      }
    }

    .flex-item {
      width: 100%;
      textarea {
        width: 100%;
      }
    }
    .file-box {
      font-size: 12px;
    }
    .flex-large {
      width: 100%;
    }
    .contain-box {
      display: flex;
      .item-box {
        width: 100%;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        .item {
          display: flex;
          width: 45%;
          align-items: center;
        }
      }
      .plus-icon {
        font-size: 20px;
        margin-left: 5px;
        cursor: pointer;
        color: #999;
      }
    }
    .felx-option {
      /deep/ .el-form-item__content {
        display: flex;
        align-items: center;
      }
    }
  }
  .dialog-footer {
    padding-top: 20px;
    /deep/.el-button--mini {
      font-size: 12px;
      height: 20px;
      padding: 3px 15px;
    }
  }
  /deep/ .file-upload {
    margin: 0;
    // padding: 0;
    background-color: #fff;
    .file-box {
      padding-top: 5px;
    }
    .el-upload-list__item.is-success .el-upload-list__item-status-label {
      line-height: 20px;
    }
    .el-upload-dragger {
      font-size: 12px;
      .txt-desc {
        color: #bfbfbf;
      }
    }
  }
  .file-list{
    font-size: 12px;
    .file-item{
      color:rgb(24, 144, 255);
      text-decoration: underline;
      cursor: pointer;
      &:hover{
        color:rgb(24, 144, 255)
      }
    }
  }
  /deep/.el-tag.el-tag--info .el-tag__close{
    display: none;
  }
}
</style>
