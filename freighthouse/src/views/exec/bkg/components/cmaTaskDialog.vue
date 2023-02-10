<template>
  <el-dialog
    :lock-scroll="true"
    :title="`${form.taskId ? '查看' : '新增'}cma任务`"
    :visible.sync="cmaData.show"
    class="cma-add"
    width="1000px"
  >
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      label-suffix=":"
      label-width="110px"
      ref="form"
    >
      <el-form-item label="任务类型" prop="taskType">
        <el-select size="mini" style="width: 100%" v-model="form.taskType">
          <!-- <el-option
            :key="key"
            :label="$t(`dict.bkgTaskName.${o.value}`)"
            :value="o.value"
            v-for="(o, key) in dictMap['bkgTaskName']"
          ></el-option>-->
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in taskTypeList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="分公司" prop="companyCode">
        <el-select
          clearable
          default-first-option
          filterable
          placeholder="请选择分公司账号"
          size="mini"
          style="width: 100%"
          v-model="form.companyCode"
        >
          <el-option
            :key="item.companyCode"
            :label="item.companyCname"
            :value="item.companyCode"
            v-for="item in companyList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="起始地" prop="polName">
        <el-autocomplete
          :fetch-suggestions="
						(str, cb) => {
							cityQuery(str, cb)
						}
					"
          @select="
						value => {
							citySelect(value, 'por')
						}
					"
          clearable
          highlight-first-item
          placeholder="支持港口/内陆城市"
          size="mini"
          style="width: 100%"
          v-model="form.polName"
        ></el-autocomplete>
      </el-form-item>
      <el-form-item label="目的地" prop="podName">
        <el-autocomplete
          :fetch-suggestions="
						(str, cb) => {
							cityQuery(str, cb)
						}
					"
          @select="
						value => {
							citySelect(value, 'pod')
						}
					"
          clearable
          highlight-first-item
          placeholder="支持港口/内陆城市"
          size="mini"
          style="width: 100%"
          v-model="form.podName"
        ></el-autocomplete>
      </el-form-item>

      <el-form-item label="任务开始时间" prop="taskStartTime">
        <el-date-picker
          clearable
          format="yyyy-MM-dd HH:mm:ss"
          placeholder="任务开始日期"
          size="mini"
          style="width: 100%"
          type="datetime"
          v-model="form.taskStartTime"
          value-format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </el-form-item>

      <el-form-item label="任务结束时间" prop="taskEndTime">
        <el-date-picker
          clearable
          format="yyyy-MM-dd HH:mm:ss"
          placeholder="任务结束时间"
          size="mini"
          style="width: 100%"
          type="datetime"
          v-model="form.taskEndTime"
          value-format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="支付地点" prop="payLocation">
        <el-select
          :remote-method="getPayLocations"
          clearable
          filterable
          placeholder="请输入关键词"
          remote
          v-model="form.payLocation"
        >
          <el-option
            :key="item.code"
            :label="item.label"
            :value="item.value"
            v-for="item in payLocationsList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="订舱办事处" prop="bookOrg">
        <el-select
          :remote-method="getAgencies"
          clearable
          filterable
          placeholder="请输入关键词"
          remote
          v-model="form.bookOrg"
        >
          <el-option
            :key="item.code"
            :label="item.label"
            :value="item.value"
            v-for="item in bookOrgList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="通知类型" prop="noticeType">
        <el-select size="mini" style="width: 100%" v-model="form.noticeType">
          <el-option
            :key="key"
            :label="$t(`dict.bkgNoticeType.${o.value}`)"
            :value="o.value"
            v-for="(o, key) in dictMap['bkgNoticeType']"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="通知邮箱" prop="noticeEmail" v-if="form.noticeType === 'email'">
        <el-input
          placeholder="请输入邮箱，多个用逗号隔开"
          size="mini"
          style="width: 100%"
          v-model="form.noticeEmail"
        ></el-input>
      </el-form-item>
      <el-form-item label="通知钉钉" prop="noticeDingToken" v-if="form.noticeType === 'ding'">
        <el-select size="mini" style="width: 100%" v-model="form.noticeDingToken">
          <el-option
            :key="key"
            :label="o.groupName"
            :value="o.dingToken"
            v-for="(o, key) in noticeDingData"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="订舱起始时间" prop="bookMinDate">
        <el-date-picker
          clearable
          format="yyyy-MM-dd"
          placeholder="订舱起始时间"
          size="mini"
          style="width: 100%"
          v-model="form.bookMinDate"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </el-form-item>
      <template v-if="form.taskType == 'book'">
        <el-form-item label="箱型" prop="containerType">
          <el-select size="mini" style="width: 100%" v-model="form.containerType">
            <el-option
              :key="key"
              :label="o.label"
              :value="o.value"
              v-for="(o, key) in cmaContainerType"
            ></el-option>
          </el-select>
        </el-form-item>
      </template>
      <el-form-item label="计划订舱次数" prop="containerCount">
        <el-input
          placeholder="请输入计划订舱次数"
          size="mini"
          style="width: 100%"
          type="number"
          v-model="form.containerCount"
        ></el-input>
      </el-form-item>

      <template v-if="form.taskType == 'book'">
        <el-form-item label="最大可定价" prop="maxPrice">
          <el-input
            placeholder="请输入最大可定价"
            size="mini"
            style="width: 100%"
            type="number"
            v-model="form.maxPrice"
          ></el-input>
        </el-form-item>
      </template>
    </el-form>
    <div class="dialog-footer" slot="footer">
      <el-button @click="submit" size="mini" type="primary">
        <i class="el-icon-copy-document"></i> 保存
      </el-button>
      <el-button @click="cancel" size="mini">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  dingList,
  cmaPort,
  cmaUserList,
  cmaAgencies,
  cmaPayLocations
} from '@/api/exec/cosco'
export default {
  props: {
    cmaData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      companyList: [],
      noticeDingData: [],
      form: {
        taskType: 'book',
        companyCode: '',
        companyName: '',
        taskStartTime: '',
        taskEndTime: '',
        noticeType: 'ding', // 默认邮箱通知
        noticeEmail: '',
        noticeDingToken: '',
        polName: '',
        podName: '',
        bookMinDate: '',
        containerType: '',
        containerCount: '',
        maxPrice: '',
        bookOrg: '',
        payLocation: ''
      },
      rules: {
        taskType: {
          required: true,
          message: '任务类型不能为空',
          trigger: 'change'
        },
        companyCode: {
          required: true,
          message: '分公司不能为空',
          trigger: 'change'
        },
        polName: {
          required: true,
          message: '起始地不能为空',
          trigger: 'change'
        },
        podName: {
          required: true,
          message: '目的地不能为空',
          trigger: 'change'
        },
        taskStartTime: {
          required: true,
          message: '任务开始时间不能为空',
          trigger: 'change'
        },
        taskEndTime: {
          required: true,
          message: '任务结束时间不能为空',
          trigger: 'change'
        },
        noticeType: {
          required: true,
          message: '任务通知类型不能为空',
          trigger: 'change'
        },
        noticeEmail: {
          required: true,
          message: '通知邮箱不能为空',
          trigger: 'change'
        },
        noticeDingToken: {
          required: true,
          message: '通知钉钉token不能为空',
          trigger: 'change'
        },
        bookMinDate: {
          required: true,
          message: '订舱起始时间不能为空',
          trigger: 'change'
        },
        containerType: {
          required: true,
          message: '箱型不能为空',
          trigger: 'change'
        },
        containerCount: {
          required: true,
          message: '计划订舱次数不能为空',
          trigger: 'change'
        },
        maxPrice: {
          required: true,
          message: '最大可定价不能为空',
          trigger: 'change'
        },
        emergencyEmail: {
          required: true,
          message: '紧急联系人邮箱不能为空',
          trigger: 'change'
        },
        bookOrg: {
          required: true,
          message: '订舱办事处不能为空',
          trigger: 'change'
        },
        payLocation: {
          required: true,
          message: '支付地点不能为空',
          trigger: 'change'
        }
      },
      containerTypeOptions: [
        {
          label: '20GP',
          value: '20GP'
        },
        {
          label: '40GP',
          value: '40GP'
        },
        {
          label: '40HQ',
          value: '40HQ'
        }
      ],
      taskTypeList: [
        {
          label: '订舱',
          value: 'book'
        }
      ],
      bookOrgList: [],
      payLocationsList: []
    }
  },
  computed: {
    ...mapGetters(['userId', 'dictMap']),
    cmaContainerType () {
      return this.dictMap['cmaContainerType'].map(item => {
        return {
          label: item.label,
          value: item.label
        }
      })
    }

  },
  created() {
    this.getDingList()
    this.getCompany()
  },
  methods: {
    // 提交任务
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const company = this.companyList.filter(
            item => item.companyCode === this.form.companyCode
          )[0]
          this.form.companyName = company.companyCname
          this.$emit('submit', this.form)
        }
      })
    },
    // 取消
    cancel() {
      this.$emit('cancel')
    },
    // 获取通知类型
    getDingList() {
      dingList({
        currPage: 1,
        pageSize: 100,
        keywords: ''
      }).then(res => {
        this.noticeDingData = res.data.list
      })
    },
    // 获取分公司
    getCompany() {
      cmaUserList({}).then(res => {
        this.companyList = res.data
      })
    },
    cityQuery(str, cb) {
      // if (!str) {
      //   return cb(this.historyList)
      // }
      const params = {}
      Object.assign(params, {
        keywords: str
      })
      cmaPort(params).then(res => {
        this.historyList = res.data.map(item => {
          const { actualName } = item
          return {
            label: actualName,
            value: actualName
          }
        })
        cb(this.historyList)
      })
    },
    citySelect(val, type) {
      if (typeof val === 'object') {
        if (type === 'por') {
          this.form.polName = val.value
        } else {
          this.form.podName = val.value
        }
      } else {
        if (!val.includes('-') || !this.historyList.length) {
          if (type === 'por') {
            this.form.polName = ''
          } else {
            this.form.podName = ''
          }
        }
      }
    },
    dialogClose() {
      this.$refs['createItemForm'].resetFields()
    },
    // 查询支付地点cmaPayLocations
    getPayLocations(str) {
      const data = {
        keywords: str
      }
      cmaPayLocations(data)
        .then(res => {
          if (res.code === 0) {
            this.payLocationsList = res.data.map(item => {
              return {
                label: item.text,
                value: item.text,
                code: item.code
              }
            })
          }
        })
        .catch(() => {})
    },
    // 查询订舱办事处
    getAgencies(str) {
      const data = {
        keywords: str
      }
      cmaAgencies(data)
        .then(res => {
          if (res.code === 0) {
            this.bookOrgList = res.data.map(item => {
              return {
                label: item.text,
                value: item.text,
                code: item.code
              }
            })
          }
        })
        .catch(() => {})
    }
  },
  mounted() {
    if (this.cmaData.source) {
      this.form = Object.assign({}, this.form, this.cmaData.source)
    }
  }
}
</script>

<style lang="scss" scoped>
.cma-add {
  .el-form-item {
    margin-bottom: 20px;
  }
  /deep/.el-input,
  .el-input--mini,
  .el-input--suffix,
  .el-input__inner {
    width: 180px !important;
  }
}
</style>
