<!--
 * @Author: Sivan
 * @Date: 2022-06-13 11:39:26
 * @LastEditTime: 2022-06-20 17:02:22
 * @LastEditors: Sivan
-->
<template>
  <el-dialog :title="option.type === 'add' ? '新增标识' : '编辑标识'" :visible.sync="option.show" width="800px" :before-close="cancel" class="add-dialog">
    <el-form :model="form" size="mini" :rules="rules" label-width="90" :inline="true" ref="form">
      <el-form-item label="标识码:" prop="thirdPayChannelCode">
        <el-input v-model="form.thirdPayChannelCode" placeholder="请输入标识码" :disabled="option.type === 'edit'"></el-input>
      </el-form-item>
      <el-form-item label="状 态:" prop="enable">
        <el-select v-model="form.enable" placeholder="请选择">
          <el-option
            v-for="item in statusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item> 
      <el-form-item label="限 额 : " prop="limitedAmount">
        <el-input v-model="form.limitedAmount" placeholder="请输入限额"></el-input>
      </el-form-item>
      <el-form-item label="币 种:" prop="currency" style="margin-bottom: 20px">
        <el-select
          v-model="form.currency"
          clearable
          placeholder="请选择"
          filterable
        >
          <el-option
            v-for="item in dictMap['currency']"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="cancel" size="mini">取 消</el-button>
      <el-button type="primary" size="mini" @click="submit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { baseCurrencyList } from '@/api/base'
export default {
  props: {
    option: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        thirdPayChannelCode: '',
        enable: '',
        limitedAmount: '',
        currency: ''
      },
      rules: {
        thirdPayChannelCode: {
          required: true,
          trigger: 'change',
          message: '标识码必填'
        },
        enable: {
          required: true,
          trigger: 'change',
          message: '状态必填'
        },
        limitedAmount: {
          required: true,
          trigger: 'change',
          message: '限额必填'
        },
        currency: {
          required: true,
          trigger: 'change',
          message: '币种必填'
        },
      },
      statusList: [
        {
          label: '有效',
          value: 'yes',
        },
        {
          label: '无效',
          value: 'no',
        },
      ],
      currencyList: []
    }
  },
  computed: {
    ...mapGetters(['dictMap'])
  },
  created() {
    this.form = this.option.form
  },
  methods: {
    // 获取币种
    getCurrencyList(queryString) {
      baseCurrencyList(queryString, 'valid').then(response => {
        let data = response.data || []
        data.push({
          cnName: '综合本位币',
          code: 'basicCurrency'
        })
				this.currencyList = data
			})
    },
    cancel() {
      this.$emit('cancel')
    },
    submit() {
      let reg = /^(([1-9]\d*)|0)(.\d{1,})?$/
      if (!reg.test(this.form.limitedAmount)) {
        return this.$msgErrClose('限额输入不正确')
      }
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$emit('submit', this.form)
        } else {
          return false
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.add-dialog{
  /deep/ .el-form {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
    .el-form-item {
      width: 45%;
      display: flex;
      .el-form-item__content{
        flex: 1;
        .el-select{
          width: 100%;
        }
      }
    }
  }
}
</style>