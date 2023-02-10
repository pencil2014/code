<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="shipmentForm" :rules="rules" :model="createdItem" label-position="right" label-width="70px" class="create-form">    
      <el-form-item label="结算单位" prop="settleUnit" class="shipment-form-unit" :show-message="false">
        <el-select v-model="createdItem.settleUnit" size="mini" multiple clearable filterable placeholder="请选择" @change="handleSelectSettleUnit" style="width: 100%">
          <el-option v-for="(item, index) in settleUnitList" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
        <el-tooltip class="item" effect="dark" content="若无结算单位，请在订单费用列表新增应收费用。" placement="top">
          <i class="el-icon-question"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { finListSettleUnit, finSaveSettleUnit } from '@/api/order/list'

const defaultCreate = {
  settleUnit: [], // 结算单位code
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '货物出运',
        show: true,
        size: 'medium',
        width: "420px",
      },
      settleUnitList: [],
      createdItem: Object.assign({}, defaultCreate),
      rules: {
        settleUnit: [{required: true, message: '请选择结算单位', trigger: 'change'}],
      }
    }
  },
  props: {
    refuseParam: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    this.getFinSettleList()
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    }),
  },
  watch: {
  },
  components: {
    BaseDialog
  },
  methods: {
    // 获取结算单位下拉
    getFinSettleList() {
      finListSettleUnit({
        orderNo: this.oQuery.orderNo
      }).then(res => {
        let { data } = res
        if (data && data.length) {
          this.createdItem.settleUnit = data.filter(item => item.isChecked).map(item => item.custSettleUnitCode)
          this.settleUnitList = data.map(item => {
            return { 
              ...item, 
              label: item.custSettleUnitName, 
              value: item.custSettleUnitCode
            }
          })

        } else {
          this.createdItem.settleUnit = []
          this.settleUnitList = []
        }
      }).catch(err => {
        console.log('err', err)
      })
    },
    close(action) {
      this.$emit('close', action)
    },
    handleSelectSettleUnit(val) {
      console.log('val', val);
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.shipmentForm.validate((valid) => {
          if (valid) {
            this.handleSaveSettleUnit(done)
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    // 保存结算单位
    handleSaveSettleUnit(done) {
      let settleUnits = this.settleUnitList.filter(item => this.createdItem.settleUnit.includes(item.custSettleUnitCode)).map(ele => {
        return {
          custId: ele.custId,
          custSettleUnitCode: ele.custSettleUnitCode,
          custSettleUnitName: ele.custSettleUnitName
        }
      })
      finSaveSettleUnit({
        orderNo: this.oQuery.orderNo,
        blId: 0,
        settleUnits
      }).then(res => {
        this.$message.success('保存成功')
        this.close('Confirm')
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.shipment-form-unit {
  padding-right: 20px;
  position: relative;
  .el-icon-question {
    cursor: pointer;
    position: absolute;
    width: 12px;
    height: 12px;
    right: -18px;
    top: 4px;
    color: #bfbfbf;
  }
}
</style>
