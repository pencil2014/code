<template>
  <div class="network-box">
    <div class="search-box">
      <el-form ref="searchForm" :model="searchForm" :rules="searchRules" inline label-width="100px" class="search-form">
        <!-- <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="searchForm.companyName"></el-input>
        </el-form-item> -->
        <el-form-item label="社信统一代码" prop="creditCode">
          <el-input v-model="searchForm.creditCode" placeholder="请输入社信统一代码"></el-input>
        </el-form-item>
        <el-form-item label="">
          <div class="btn-box">
            <div class="tips">从天眼查拉取数据，单次收费1毛</div>
            <el-button type="primary" size="mini" class="btn" @click="search">搜索</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <el-form
      :model="form"
      :rules="rules"
      inline
      label-width="100px"
      size="mini"
      class="customer-form"
      disabled
      v-show="form.creditCode"
    >
      <el-form-item label="企业名称" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="社信统一代码" prop="creditCode">
        <el-input v-model="form.creditCode"></el-input>
      </el-form-item>
      <el-form-item label="纳税人识别号" prop="taxNumber">
        <el-input v-model="form.taxNumber"></el-input>
      </el-form-item>
      <el-form-item label="企业类型" prop="companyOrgType">
        <el-input v-model="form.companyOrgType"></el-input>
      </el-form-item>
      <!-- <el-form-item label="企业类型" prop="roleTypeInfo">
        <el-select v-model="form.roleTypeInfo" placeholder="请选择" disabled>
          <el-option
            v-for="item in dictMap['customerRole']"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="注册资金" prop="regCapital">
        <el-input v-model="form.regCapital"></el-input>
      </el-form-item>
      <el-form-item label="成立日期" prop="fromTime">
        <el-date-picker v-model="form.fromTime" type="date" placeholder="请选择" value-format="yyyy-MM-dd"></el-date-picker>
      </el-form-item>
      <el-form-item label="法人" prop="legalPerson">
        <el-input v-model="form.legalPerson"></el-input>
      </el-form-item>
      <el-form-item label="注册地址" prop="regLocation" class="flex-item">
        <el-input
          type="textarea"
          v-model="form.regLocation"
          :autosize="{ minRows: 2, maxRows: 4 }"
          resize="none"
        ></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { tycDetail, tycSearch } from '@/api/swcms/index'
export default {
  props: {
    network: {
      type: Object,
      default: ()=>{}
    }
  },
  data() {
    return {
      form: {
        name: '',
        creditCode: '',
        taxNumber: '',
        companyOrgType: '',
        regCapital: '',
        fromTime: '',

      },
      rules: {},
      searchForm: {
        creditCode: '',
        companyName: '',
      },
      searchRules: {
        creditCode: { required: true, message: ' ', trigger: 'change' },
        // companyName: { required: true, message: ' ', trigger: 'change' },
      },
      options: [],
      popoverShow: true,
      loading: false,
      customerList: [],
    }
  },
  created() {
    Object.assign(this.form, this.network)
    this.searchForm.creditCode = this.network.uscc
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  methods: {
    search () {
      this.$refs['searchForm'].validate((valid) => {
        if (valid) {
          let { creditCode} = this.searchForm
          if (!creditCode) {
            return this.$msgErrClose('请填写社信统一代码再进行搜索!')
          }
          this.getTycDetail()
        } else {
          return false
        }
      })
    },
    getTycDetail () {
      let { creditCode, companyName } = this.searchForm
      let data = {
        keywords: creditCode || companyName
      }
      tycDetail(data).then(res => {
        if (res.data) {
          Object.assign(this.form, res.data)
          this.$emit('changeNetwork', res.data)
        } else {
          this.$msgErrClose('未查询到相关企业,请检查社信统一代码是否正确!')
        }
      }).catch(()=>{})
    },
    // customerSearch(keywords) {
    //   this.loading = true
    //   this.customerList = []
    //   tycSearch({ keywords }).then(res => {
    //     this.customerList = res.data || []
    //   }).finally(()=> {
    //     this.loading = false
    //   })
    // },
    // selectCompany (item) {
    //   let {creditCode} = item
    //   this.getTycDetail(creditCode)
    // }
  }
}
</script>

<style lang="scss" scoped>
.search-box {
  display: flex;
  flex-wrap: nowrap;
  border-bottom: 1px solid #D9D9D9;
  padding: 10px 0;
  margin-bottom: 15px;
  .el-form {
    display: flex;
    width: 100%;
    justify-content: space-between;
    /deep/.el-form-item {
      flex-basis: 33%;
      margin-right: 0;
      display: flex;
      .el-form-item__content {
        flex: 1;
        .el-select {
          width: 100%;
        }
      }
    }
  }
  .btn-box {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .btn{
      margin-left: 10px;
    }
    .tips{
      color: #ff4949;
    }
  }
}
</style>
