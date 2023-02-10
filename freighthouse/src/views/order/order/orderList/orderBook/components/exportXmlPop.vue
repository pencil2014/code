<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="exportForm" :rules="rules" :model="createItem" :show-message="false" label-position="right" label-width="120px" class="orderBlExport-form">
      <el-row>
        <el-col :span="12">
          <el-form-item label="外部系统订单号" prop="jobNo">
            <el-input v-model="createItem.jobNo" placeholder="请输入" size="mini" maxlength="64" style="width:100%" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="外部系统订单日期" prop="jobDate">
            <el-date-picker v-model="createItem.jobDate" type="date" value-format="yyyy-MM-dd" style="width:100%" placeholder="选择日期">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收货人税号" prop="consigneeVatNo">
            <el-input v-model="createItem.consigneeVatNo" placeholder="请输入" maxlength="64" size="mini" style="width:100%" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="通知人税号" prop="notifyVatNo">
            <el-input v-model="createItem.notifyVatNo" placeholder="请输入" maxlength="64" size="mini" style="width:100%" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <h3 style="margin:12px 0">集装箱信息</h3>
      <el-table :data="createItem.cargos" style="width: 100%;">
        <el-table-column prop="cn" label="箱号" align="center" width="100px"></el-table-column>
        <el-table-column prop="sn" label="封号" align="center" width="100px"></el-table-column>
        <el-table-column prop="so" label="SO号" align="center" width="100px"></el-table-column>
        <el-table-column prop="containerType" label="箱型" align="center" width="80px">
          <template slot-scope="scope">
            {{getDictLabel('containerTypeShiporder', scope.row.containerType)}}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="件数" align="center" width="80px"></el-table-column>
        <el-table-column prop="weight	" label="毛重" align="center" width="80px"></el-table-column>
        <el-table-column prop="volume	" label="体积" align="center" width="80px"></el-table-column>
        <el-table-column prop="packageType	" label="包装" align="center">
          <template slot-scope="scope">
            {{getDictLabel('packageType', scope.row.packageType)}}
          </template>
        </el-table-column>
        <el-table-column prop="hsCode" label="海关编码" align="center" width="150px">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>海关编码</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`cargos.${scope.$index}.hsCode`" :rules="rules.hsCode" label-width="0">
              <el-input v-model="scope.row.hsCode" clearable size="mini" maxlength="64" style="width:100%" placeholder="请输入内容"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="hsName" label="品名" align="center" width="150px">
          <template slot="header">
            <div><span style="color: #ff4949;margin-right: 4px;display: inline-block;">*</span>品名</div>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="`cargos.${scope.$index}.hsName`" :rules="rules.hsName" label-width="0">
              <el-input v-model="scope.row.hsName" clearable size="mini" maxlength="64" style="width:100%" placeholder="请输入品名"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { getListBlCargoCust } from '@/api/order/bl'
import { getDictLabel } from '@/utils/tools'
const defaultCreate = {
  jobNo: '',
  jobDate: '',
  consigneeVatNo: '',
  notifyVatNo: '',
  cargos: []
}

export default {
  data() {
    return {
      getDictLabel: getDictLabel,
      oQuery: this.$route.query,
      dialogConfig: {
        title: 'XML格式文件导出',
        show: true,
        size: 'medium',
        width: '1100px'
      },
      createItem: Object.assign({}, defaultCreate),
      rules: {
        jobNo: [{ required: true, message: '请输入', trigger: 'change' }],
        jobDate: [{ required: true, message: '请输入', trigger: 'change' }],
        consigneeVatNo: [
          { required: true, message: '请输入', trigger: 'change' }
        ],
        notifyVatNo: [{ required: true, message: '请输入', trigger: 'change' }],
        hsCode: [{ required: true, message: '请输入', trigger: 'change' }],
        hsName: [{ required: true, message: '请输入', trigger: 'change' }]
      }
    }
  },
  props: {
    blId: {
      type: Number,
      default: ''
    }
  },
  created() {
    this.getListBlCargoCust()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap
    })
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    getListBlCargoCust() {
      let params = {
        orderNo: this.$route.query.orderNo,
        blId: this.blId
      }
      getListBlCargoCust(params).then((res) => {
        if (res.data) {
          this.createItem.cargos = res.data
        }
      })
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.exportForm.validate((valid) => {
          if (valid) {
            this.close('Confirm', { ...this.createItem })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    }
  }
}
</script>

<style lang="scss">
.orderBlExport-form {
  /* padding: 20px 80px 20px 20px; */
}
.orderBlExport-form .el-radio__label {
  font-size: 12px;
}
.orderBlExport-form {
  .el-form-item__label,
  .el-form-item__content {
    line-height: 20px !important;
  }
}
</style>
