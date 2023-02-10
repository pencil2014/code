<template>
  <el-dialog :title="option.title" :visible.sync="option.show" :width="option.width">
    <div
      class="crm-dialog-table"
      v-loading="lsLoading"
      :element-loading-text="eLoadingText"
      :element-loading-spinner="eLoadingSpinner"
      :element-loading-background="eLoadingBackground"
    >

      <el-form :model="form" ref="form" :rules="rules" label-width="110px" size="mini" class="form">
        <el-form-item label="国家" prop="country">
          <el-select v-model="form.country" clearable>
            <el-option
              v-for="(o,i) in dictMap.backlistCountryType"
              :key="o.value+i"
              :label="o.label"
              :value="o.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="企业名称" prop="name">
          <el-input
            type="text"
            v-model="form.name"
            clearable
            maxlength="200"
            show-word-limit
          ></el-input>
        </el-form-item>
        <div class="btn-box">
          <el-button type="primary" size="mini" style="margin-left: 30px" @click="search">搜索</el-button>
          <el-button @click="reset" size="mini" style="margin-right: -20px;">重置</el-button>
        </div>
        <!-- <el-form-item style="width: 200px;margin-right:-20px">
        </el-form-item> -->
        <el-form-item label="拉黑原因" prop="blackReason">
          <el-select v-model="form.blackReason" multiple collapse-tags clearable>
            <el-option
              v-for="(o,i) in dictMap.blacklistReason"
              :key="o.value+i"
              :label="o.label"
              :value="o.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item key="limitFee" label="不可录入费用:" prop="limitFee">
          <el-select v-model="form.limitFee" multiple collapse-tags clearable>
          <el-option
              v-for="(o,i) in dictMap['limitFee']"
              :key="o.value+i"
              :label="o.label"
              :value="o.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <div class="btn-box"></div>
        <el-form-item label="拉黑备注" prop="blackRemark" style="width:100%;">
          <el-input type="textarea" v-model="form.blackRemark" maxlength="512" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <div
        v-if="option.tableOption.title"
        style="color:#222;font-size:14px;font-weight:bold;padding:6px 0 10px;"
      >{{option.tableOption.title}}</div>
      <template v-if="option.tableOption">
        <FinanceTable ref="table" :option="option.tableOption" @send-multi="sendMulti">
          <div slot="empty">
            <p v-if="sysNoData && form.country === 'chinese_mainland' && !tycNoData">
              系统未添加该企业，请从
              <el-button class="text__btn" type="text" size="mini" @click="search('tyc')">天眼查搜索</el-button>
            </p>
            <p v-else-if="form.country === 'chinese_mainland' && tycNoData">
              未找到相关企业
            </p>
            <p v-else-if="(sysNoData && form.country === 'no_chinese_mainland') || tycNoData">
              未搜索到该企业，请
              <el-button class="text__btn" type="text" size="mini" @click="sure('add')">直接添加</el-button>
            </p>
            <p v-else>暂无数据</p>
          </div>
        </FinanceTable>
      </template>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button
        :icon="option.icon? 'el-icon-'+option.icon:''"
        type="primary"
        size="mini"
        @click="sure"
      >{{option.text||'确定'}}</el-button>
      <el-button @click="cancel" size="mini">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mapGetters } from 'vuex'
import CUSTOMER from '@/api/crm/customer'
import BLACK from '@/api/crm/blackList'
export default {
  name: 'crmDialogTable',
  props: {
    option: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    FinanceTable,
  },
  data() {
    return {
      sysNoData: false,
      tycNoData: false,
    }
  },
  watch: {
    'option.show'(val) {
      if (val) {
        this.$nextTick(() => {
          this.tycNoData = this.sysNoData = false
          this.$refs.table.handleMulti([])
          this.$refs.form.resetFields()
        })
      }
    },
  },
  computed: {
    ...mapGetters(['dictMap']),
    form() {
      return this.option.form || {}
    },
    rules() {
      return this.option.rules || {}
    },
  },
  methods: {
    sendMulti(data) {
      // console.log(data)
      this.selectionMulti = data
    },
    sure(type) {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        if (type === 'add') {
          this.option.selections = [{}]
          this.$emit('close', true)
          return
        }
        if (!this.selectionMulti.length) {
          return this.$msgErrClose('请选择需要拉黑的企业！')
        }
        if (this.option.selections) {
          this.option.selections = this.selectionMulti || []
        }
        this.$emit('close', true)
      })
    },
    cancel() {
      this.close()
    },
    close() {
      this.$emit('close')
    },
    search(type) {
      this.$refs.form.clearValidate()
      this.$nextTick(() => {
        let num = 0
        this.$refs.form.validateField(['name', 'country'], (valid) => {
          if (!!valid) num++
        })
        if (num === 0) {
          let methodStr = this.option.methodStr == 'customer' ? BLACK.customerSearch : BLACK.supplierSearch
          let query = [{ column: 'status', type: 'eq', value: 'valid' }]
          let name = this.form.name
          name && query.push({ column: 'name', type: 'like', value: name })
          // chinese_mainland
          // no_chinese_mainland
          this.lsLoading = true
          this.tycNoData = this.sysNoData = false
          if (type === 'tyc') {
            // 天眼查搜索
            CUSTOMER.aiqichaList({ keywords: name })
              .then((res) => {
                this.lsLoading = false
                if (res.data && res.data.length) {
                  this.option.tableOption.data = res.data.map((item) => {
                    return { name: item.name, uscc: item.creditCode }
                  })
                } else {
                  this.option.tableOption.data = []
                  this.tycNoData = true
                }
              })
              .catch((err) => {
                console.log(err)
                this.lsLoading = false
                this.option.tableOption.data = []
              })
          } else {
            // 系统搜索
            methodStr({ name })
              .then((res) => {
                this.lsLoading = false
                if (res.data && res.data.length) {
                  this.option.tableOption.data = res.data.map((item) => {
                    item.roleTypeInfo = item.roles ? item.roles.map((v) => v.roleType.toLowerCase()).join(',') : ''
                    item.categoryInfo = item.categorys ? item.categorys.map((v) => v.category.toLowerCase()).join(',') : ''
                    item._checkDisabled = item.isBlacklist === 'yes'
                    return item
                  })
                } else {
                  this.option.tableOption.data = []
                  this.sysNoData = true
                }
              })
              .catch((err) => {
                console.log(err)
                this.lsLoading = false
                this.option.tableOption.data = []
              })
          }
        }
      })
    },
    reset() {
      this.form.country = this.form.name = ''
      this.option.tableOption.data = []
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },
  },
}
</script>
<style lang="scss" scoped>
::v-deep {
  .el-dialog__body {
    padding-bottom: 10px;
    overflow: hidden;
  }
  .finance-search-form,
  .finance-el-table {
    padding: 0;
    margin: 0;
  }
  .el-select {
    // width: 100%;
  }
}
.form{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
.el-form-item {
  width: 40%;
  .el-select{
    width: 100%;
  }
}
.el-button.text__btn {
  margin-left: -2px;
  padding: 0 !important;
}
.btn-box{
  text-align: left;
  width: 110px;
}
</style>
