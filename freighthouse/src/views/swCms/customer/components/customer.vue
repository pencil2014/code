<template>
  <el-form
    ref="customerForm"
    :model="form"
    :rules="rules"
    inline
    label-width="100px"
    size="mini"
    class="customer-form"
  >
    <el-form-item label="公司名称" prop="corpName">
      <el-input v-model="form.corpName" disabled></el-input>
      <p class="tips" v-show="form.corpName !== compareData.corpName && compareData.corpName">{{compareData.corpName}}</p>
    </el-form-item>
    <el-form-item label="姓名" prop="emplName">
      <el-input v-model="form.emplName" disabled></el-input>
    </el-form-item>
    <el-form-item label="联系电话" prop="mobile">
      <el-input v-model="form.mobile" disabled></el-input>
    </el-form-item>
    <el-form-item label="营业执照号" prop="uscc">
      <el-input v-model="form.uscc" disabled></el-input>
      <p class="tips" v-show="form.uscc !== compareData.uscc && compareData.uscc">{{compareData.uscc}}</p>
    </el-form-item>
    <el-form-item label="所属行业" prop="industry">
      <el-cascader
        filterable
        :clearable="true"
        size="mini"
        :options="this.cascaderList"
        v-model="form.industry"
        :props="{
          children: 'childList',
          label: 'industryCname',
          value: 'industryCname',
          checkStrictly: true,
        }"
        placeholder="请选择所属行业"
        disabled
      ></el-cascader>
      <p class="tips" v-show="form.industry !== compareData.industry">{{compareData.industry}}</p>
    </el-form-item>
    <el-form-item label="公司规模" prop="scale">
      <el-select v-model="form.scale" placeholder="请选择" disabled>
        <el-option
          v-for="item in dictMap['orgScale']"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <p class="tips" v-show="form.scale !== compareData.scale">{{ isCrm ? dictMapObj['orgScale'][compareData.scale] : compareData.scale}}</p>
    </el-form-item>
    <el-form-item label="公司地址" prop="address" class="flex-item">
      <el-input
        type="textarea"
        v-model="form.address"
        :autosize="{ minRows: 2, maxRows: 4 }"
        resize="none"
        placeholder="请输入"
        disabled
      ></el-input>
      <p class="tips" v-show="form.address !== compareData.address">{{ compareData.address}}</p>
    </el-form-item>
    <el-form-item label="企业类型" prop="roleTypes" class="flex-item">
      <el-checkbox-group v-model="form.roleTypes">
        <el-checkbox
          v-for="item in dictMap['customerRole']"
          :key="item.value"
          :label="item.value"
          disabled
        >{{item.label}}</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item
      label="客户类型"
      prop="companyCategory"
      :rules="form.confirmStatus === 'pass' ? defaultRules : {}"
    >
      <el-select v-model="form.companyCategory" clearable filterable placeholder="请选择">
        <el-option
          v-for="(item, index) in dictMap['customerClassNew']"
          :label="item.label"
          :value="item.value"
          :key="index"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="中文简称" prop="shortName" :rules="form.confirmStatus === 'pass' ? defaultRules : {}">
      <el-input v-model="form.shortName" placeholder="请输入" clearable></el-input>
    </el-form-item>
    <el-form-item label="英文简称" prop="shortEname" :rules="form.confirmStatus === 'pass' ? defaultRules : {}">
      <el-input v-model="form.shortEname" placeholder="请输入" clearable></el-input>
    </el-form-item>
    <el-form-item label="国家" prop="countryCode" :rules="form.confirmStatus === 'pass' ? defaultRules : {}">
      <el-select v-model="form.countryCode" clearable placeholder="请选择">
        <el-option
          v-for="item in countyOption"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="省/市/区" prop="indexAddr" :rules="{ type: 'array',required: true, trigger: 'blur', message: ' '}" v-if="form.confirmStatus === 'pass' && form.countryCode === 'CN'">
      <el-cascader
        filterable
        :clearable="true"
        size="mini"
        :options="this.CityArr"
        v-model="form.indexAddr"
        :key="this.CityArr && this.CityArr[0] &&this.CityArr[0].code "
        :props="{
          children: 'children',
          label: 'cname',
          value: 'cname'
        }"
        placeholder="请选择省/市/区"
      ></el-cascader>
    </el-form-item>
    <el-form-item label="省/市/区" prop="indexAddr" v-else>
      <el-cascader
        filterable
        :clearable="true"
        size="mini"
        :options="this.CityArr"
        v-model="form.indexAddr"
        :key="this.CityArr && this.CityArr[0] &&this.CityArr[0].code "
        :props="{
          children: 'children',
          label: 'cname',
          value: 'cname'
        }"
        placeholder="请选择省/市/区"
      ></el-cascader>
    </el-form-item>
    <el-form-item label="客户性质" prop="entType" :rules="form.confirmStatus === 'pass' ? defaultRules : {}">
      <el-select v-model="form.entType" clearable placeholder="请选择">
        <el-option
          v-for="(item, index) in dictMap['entType']"
          :label="item.label"
          :value="item.value"
          :key="index"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="成立日期" prop="setupDate" :rules="form.confirmStatus === 'pass' ? defaultRules : {}">
      <el-input v-model="form.setupDate" placeholder="yyyy/yyyy-mm/yyyy-mm-dd" clearable></el-input>
      <!-- <el-date-picker v-model="form.setupDate" type="date" placeholder="请选择" value-format="yyyy-MM-dd"></el-date-picker> -->
    </el-form-item>
    <el-form-item label="法人" prop="legalPerson" :rules="form.confirmStatus === 'pass' ? defaultRules : {}">
      <el-input v-model="form.legalPerson" placeholder="请输入" clearable></el-input>
    </el-form-item>
    <el-form-item label="注册资金" prop="regCapital" :rules="form.confirmStatus === 'pass' ? defaultRules : {}">
      <el-input v-model="form.regCapital" placeholder="请输入" clearable></el-input>
    </el-form-item>
    <el-form-item label="注册地址" prop="registerAddress" class="flex-item">
      <el-input
        type="textarea"
        v-model="form.registerAddress"
        :autosize="{ minRows: 2, maxRows: 4 }"
        resize="none"
        placeholder="请输入"
      ></el-input>
    </el-form-item>
    <el-form-item
      label="用户群组"
      prop="groupCode"
      :rules="form.confirmStatus === 'pass' ? defaultRules : {}"
    >
      <el-select v-model="form.groupCode" placeholder="请选择" clearable>
        <el-option
          v-for="item in groupList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item
        label="维护人"
        prop="bdEmployeeId"
        :rules="form.confirmStatus === 'pass' ? defaultRules : {required: false}"
      >
      <template v-if="isCrm && maintainerListCrm.length">
        <el-select v-model="form.bdEmployeeId" placeholder="请选择" clearable>
          <el-option
            v-for="item in maintainerListCrm"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </template>
      <template v-else>
        <el-select
          v-model="form.bdEmployeeId"
          filterable
          remote
          clearable
          placeholder="请选择"
          :remote-method="maintainerQuerySearch"
        >
          <el-option
            v-for="item in maintainerList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </template>
    </el-form-item>
    <el-form-item label="审核状态" prop="confirmStatus">
      <el-select v-model="form.confirmStatus" clearable filterable placeholder="请选择">
        <el-option
          v-for="(item, index) in confirmStatusList"
          :label="item.label"
          :value="item.value"
          :key="index"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item
      label="不通过原因"
      prop="refuseReason"
      class="flex-item"
      v-if="form.confirmStatus === 'refuse'"
    >
      <el-input
        type="textarea"
        maxlength="500"
        show-word-limit
        v-model="form.refuseReason"
        :autosize="{ minRows: 2, maxRows: 4 }"
        resize="none"
        placeholder="请输入"
      ></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { industryRelation, countrySelectList } from '@/api/base'
import { groupList } from '@/api/swcms/index'
export default {
  props: {
    customer: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      isCrm: false,
      form: {
        corpName: '',
        emplName: '',
        mobile: '',
        uscc: '',
        industry: '',
        scale: '',
        groupCode: '',
        refuseReason: '',
        confirmStatus: '',
        bdEmployeeId: '',
        companyCategory: '',
        roleTypes: [],
        address: '',
        registerAddress: '',
        countryCode: '',
        shortName: '',
        shortEname: '',
        indexAddr: [],
        entType: '',
        regCapital: '',
        setupDate: '',
        setupDateType: '',
        legalPerson: ''
      },
      rules: {
        groupCode: { required: true, message: ' ', trigger: 'change' },
        confirmStatus: { required: true, message: ' ', trigger: 'change' },
        refuseReason: { required: true, message: ' ', trigger: 'change' }
      },
      maintainerList: [],
      maintainerListCrm: [],
      countyOption: [], // 国家下拉
      CityArr: [],
      confirmStatusList: [
        {
          label: '审核通过',
          value: 'pass',
        },
        {
          label: '审核拒绝',
          value: 'refuse',
        },
      ],
      cascaderList: [],
      groupList: [],
      customerClassList: [
        {
          label: '国内直客',
          value: 'domestic_cust',
        },
        {
          label: '国内同行',
          value: 'domestic_peer',
        },
        {
          label: '国外直客',
          value: 'foreign_cust',
        },
        {
          label: '国外同行',
          value: 'foreign_peer',
        },
        {
          label: '客户',
          value: 'cust',
        },
        {
          label: '同行',
          value: 'peer',
        },
        {
          label: '独立结算部门',
          value: 'department',
        },
      ],
      defaultRules: { required: true, message: ' ', trigger: 'change' },
      addressRule: { type: 'array',required: true, trigger: 'blur', message: ' '},
      compareData: {},
    }
  },
  created() {
    this.getIndustry()
    this.getGroup()
    this.getCountry()
    this.CityArr.splice(0, 1000, ...this.dictMap.domesticCity)
    let {customer, crm, network, isCrm} = this.customer
    this.isCrm = isCrm
    Object.assign(this.form, customer)
    if (isCrm) {
      let { 
        companyName: corpName, 
        uniformSocialCreditCode: uscc, 
        industry, 
        scale, 
        companyCategory, 
        customerBdList, 
        roleTypes, 
        registerAddress,
        shortName,
        shortEname,
        countryCode,
        setupDate,
        legalPerson,
        regCapital,
        entType,
        province,
        city,
        district,
        address
      } = crm
      let indexAddr = [province, city, district]
      Object.assign(this.compareData, {
        corpName,
        uscc,
        industry,
        scale,
        companyCategory,
        address
      })
      Object.assign(this.form,  {
        roleTypes,
        registerAddress,
        companyCategory,
        shortName,
        shortEname,
        countryCode,
        setupDate,
        legalPerson,
        regCapital,
        address: customer.address,
        entType,
        indexAddr
      })
      // 获取crm维护人
      if (customerBdList?.length) {
        this.maintainerListCrm = customerBdList.map(item => {
          let {bdEmployeeId, bdEmployeeName} = item
          return {
            label: bdEmployeeName,
            value: bdEmployeeId
          }
        })
      }
    } else {
      let {name:corpName, creditCode:uscc } = network
      Object.assign(this.compareData, {
        corpName,
        uscc
      })
    }
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
  },
  watch: {
    'customer.network' (val) {
      let {name:corpName, creditCode:uscc, industry, regLocation: registerAddress, staffNumRange: scale,fromTime, legalPerson, regCapital } = val
      console.log('val', val)
      this.compareData = {
        corpName,
        uscc,
        industry,
        address:registerAddress,
        scale
      }
      Object.assign(this.form,  {
        registerAddress,
        legalPerson,
        regCapital,
        setupDate: fromTime.length > 10 ? fromTime.slice(0, 10): fromTime
      })
    },
    'form.countryCode': {
      handler(val) {
        if (!val) return
        const required = ['中国', '中国大陆', "中国香港", "中国澳门", "香港", "澳门"].includes(val)
        const ChinaRequired = val === "CN"
        if (ChinaRequired) {
          this.CityArr.splice(0, 1000, ...this.dictMap.domesticCity)
        } else {
          this.CityArr.splice(0, 1000, ...this.dictMap.foreignCity)
        }
      },
      immediate: true,
    }
  },
  methods: {
    // 维护人
    maintainerQuerySearch(str = '') {
      let data = {
        name: str,
        state: 'valid',
      }
      this.$store.dispatch('dict/employeeSelectlist', data).then((data) => {
        this.maintainerList = data.map((ele) => {
          return {
            label: ele.value,
            value: ele.key,
          }
        })
      })
    },
    // 获取行业数据
    getIndustry() {
      industryRelation({})
        .then((res) => {
          if (res.code === 0) {
            let base = this.getTreeData(res.data)
            this.cascaderList = [...base]
          }
        })
        .catch(() => {})
    },
    // 群组下拉
    getGroup() {
      let data = {
        enable: 'yes',
      }
      groupList(data)
        .then((res) => {
          this.groupList = res.data.map((item) => {
            let { groupCname, groupCode } = item
            return {
              ...item,
              label: groupCname,
              value: groupCode,
            }
          })
        })
        .catch(() => {})
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach(
        (item) =>
          (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined)
      )
      return data
    },
    getCountry() {
      countrySelectList({ countryCode: '', state: 'valid' }).then((res) => {
        this.countyOption = (res.data || []).map((item) => {
          return { ...item, label: item.cname, value: item.countryCode }
        })
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.tips {
  color: #cd4130;
  transform-origin: left;
  transform: scale(0.8);
  margin-bottom: -10px;
}
::v-deep .el-date-editor.el-input {
  width: 209px;
}
</style>
