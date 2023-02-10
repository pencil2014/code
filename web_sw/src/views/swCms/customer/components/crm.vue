<template>
  <el-form
    :model="form"
    :rules="rules"
    inline
    label-width="100px"
    size="mini"
    class="customer-form"
    disabled
  >
    <el-form-item label="企业类型" prop="roleTypes" class="flex-item">
      <el-checkbox-group v-model="form.roleTypes">
        <el-checkbox
          v-for="item in dictMap['customerRole']"
          :key="item.value"
          :label="item.value"
        >{{item.label}}</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item label="客户类型" prop="companyCategory">
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
    <el-form-item label="公司名称" prop="companyName">
      <el-input v-model="form.companyName"></el-input>
    </el-form-item>
    <el-form-item label="社信统一代码" prop="uniformSocialCreditCode">
      <el-input v-model="form.uniformSocialCreditCode"></el-input>
    </el-form-item>
    <el-form-item label="纳税人识别号" prop="taxId">
      <el-input v-model="form.taxId"></el-input>
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
    </el-form-item>
    <el-form-item label="是否掉入公海" prop="isRecycle">
      <el-select v-model="form.isRecycle" placeholder="请选择" disabled>
        <el-option
          v-for="item in dictMap['yesNo']"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="注册地址" prop="registerAddress" class="flex-item">
      <el-input
        type="textarea"
        v-model="form.registerAddress"
        :autosize="{ minRows: 2, maxRows: 4 }"
        resize="none"
      ></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { industryRelation } from '@/api/base'
export default {
  props: {
    crm: {
      type: Object,
      default: ()=>{}
    }
  },
  data() {
    return {
      form: {
        roleTypes: [],
        companyCategory: '',
        companyName: '',
        uniformSocialCreditCode: '',
        taxId: '',
        industry: '',
        scale: '',
        registerAddress: ''
      },
      rules: {},
      cascaderList: [],
      customerClassList: [
        {
          label: '国内直客',
          value: 'domestic_cust'
        },
        {
          label: '国内同行',
          value: 'domestic_peer'
        },
        {
          label: '国外直客',
          value: 'foreign_cust'
        },
        {
          label: '国外同行',
          value: 'foreign_peer'
        },
        {
          label: '客户',
          value: 'cust'
        },
        {
          label: '同行',
          value: 'peer'
        },
        {
          label: '独立结算部门',
          value: 'department'
        },
      ]
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  created() {
    this.getIndustry()
    Object.assign(this.form, this.crm)
  },
  methods: {
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
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach(
        (item) =>
          (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined)
      )
      return data
    },
  },
}
</script>
