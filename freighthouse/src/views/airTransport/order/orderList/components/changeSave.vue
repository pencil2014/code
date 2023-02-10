<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="changeSaveForm" :rules="rules" :model="changeSaveItem" label-position="right" label-width="120px" class="create-form">    
      <el-form-item label="驳船预计开船时间" prop="bargeEtdTime">
        <elDatePickerLimit size="mini"
          :field="'bargeEtdTime'"
          :disabled="isView"
          v-model="changeSaveItem.bargeEtdTime"
          type="date"
          style="width: 100%"
          clearable
          placeholder="请选择"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions" />
      </el-form-item>
      <el-form-item label="驳船船名" prop="bargeVessel">
        <el-autocomplete
          style="width: 100%"
          size="mini"
          clearable
          v-model="changeSaveItem.bargeVessel"
          :disabled="isView"
          :fetch-suggestions="(queryString, cb) => querySearchVessel(queryString, cb)"
          placeholder="请输入"
          @select="(value) => handleSelectVessel(value)"
          @clear="(value) => handleClearVessel(value)"
        ></el-autocomplete>
        <!-- <el-input type="text" size="mini" placeholder="请输入" v-model="changeSaveItem.bargeVessel" :disabled="isView" clearable></el-input> -->
      </el-form-item>
      <el-form-item label="驳船航次" prop="bargeVoyage">
        <el-autocomplete
          style="width: 100%"
          size="mini"
          clearable
          v-model="changeSaveItem.bargeVoyage"
          :disabled="isView"
          :fetch-suggestions="(queryString, cb) => querySearchVoyage(queryString, cb, changeSaveItem.bargeVessel)"
          placeholder="请输入"
          @select="(value) => handleSelectVoyage(value)"
          @clear="(value) => handleClearVoyage(value)"
        ></el-autocomplete>
        <!-- <el-input type="text" size="mini" placeholder="请输入" v-model="changeSaveItem.bargeVoyage" :disabled="isView" clearable></el-input> -->
      </el-form-item>
      <el-form-item label="大船预计开船时间" prop="etdTime">
        <elDatePickerLimit size="mini"
          :disabled="isView"
          v-model="changeSaveItem.etdTime"
          type="date"
          style="width: 100%"
          clearable
          placeholder="请选择"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions" />
      </el-form-item>
      <el-form-item label="大船船名" prop="vessel">
        <el-autocomplete
          style="width: 100%"
          size="mini"
          clearable
          v-model="changeSaveItem.vessel"
          :disabled="isView"
          :fetch-suggestions="(queryString, cb) => querySearchVessel(queryString, cb)"
          placeholder="请输入"
          @select="(value) => handleSelectVessel(value)"
          @clear="(value) => handleClearVessel(value)"
        ></el-autocomplete>
        <!-- <el-input type="text" size="mini" placeholder="请输入" v-model="changeSaveItem.vessel" :disabled="isView" clearable></el-input> -->
      </el-form-item>
      <el-form-item label="大船航次" prop="voyage">
        <el-autocomplete
          style="width: 100%"
          size="mini"
          clearable
          v-model="changeSaveItem.voyage"
          :disabled="isView"
          :fetch-suggestions="(queryString, cb) => querySearchVoyage(queryString, cb, changeSaveItem.vessel)"
          placeholder="请输入"
          @select="(value) => handleSelectVoyage(value)"
          @clear="(value) => handleClearVoyage(value)"
        ></el-autocomplete>
        <!-- <el-input type="text" size="mini" placeholder="请输入" v-model="changeSaveItem.voyage" :disabled="isView" clearable></el-input> -->
      </el-form-item>
      <el-form-item label="大船截关时间" prop="cyCutOff">
        <elDatePickerLimit size="mini"
          :disabled="isView"
          v-model="changeSaveItem.cyCutOff"
          type="date"
          style="width: 100%"
          clearable
          placeholder="请选择"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions" />
      </el-form-item>
      <el-form-item label="船公司" prop="shipCarrierCode">
        <el-select size="mini"
          :disabled="isView"
          v-model="changeSaveItem.shipCarrierCode"
          filterable
          remote
          clearable
          style="width: 100%"
          placeholder="请输入"
          :remote-method="carrierRemoteMethod"
          @visible-change="carrierVisibleChange"
          @change="handleChangeShipCarrier">
          <el-option
            v-for="(item, index) in carrierList"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <!-- <el-autocomplete size="mini" v-model="changeSaveItem.shipCarrierCode" style="width: 100%" placeholder="请输入"
          :fetch-suggestions="(queryString, cb) => {shipQuerySearch(queryString, cb)}"
          @change="(value) => {handleChangeShipCarrier(value)}"
          @select="(value) => {handleSelectShipCarrier(value)}">
        </el-autocomplete> -->
      </el-form-item>
      <el-form-item label="目的地" prop="podPortCode">
        <el-select size="mini"
          :disabled="isView"
          v-model="changeSaveItem.podPortCode"
          filterable
          clearable
          remote
          style="width: 100%"
          placeholder="请输入"
          :remote-method="podPortFilterMehod"
          @visible-change="podPortVisibleChange"
          @change="handleChangePodPortCode">
          <el-option
            v-for="item in portList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <!-- <el-input type="text" size="mini" placeholder="请输入" v-model="changeSaveItem.podPortCode"></el-input> -->
      </el-form-item>
      <el-form-item label="状态" v-if="status">
        <div class="ft12">{{status | bkgStatusFilter}}</div>
      </el-form-item>
      <el-form-item label="拒绝原因" v-if="status === 'refuse'">
        <div class="ft12">{{refuseReasonFilter()}}</div>
      </el-form-item>
      <el-form-item label="拒绝备注" v-if="status === 'refuse'">
        <div class="ft12">{{changeSaveItem.refuseRemark}}</div>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {getDictLabel} from '@/utils/tools'
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { orderChangeSave, orderChangeInfo } from '@/api/order/list';

const defaultChangeSaveQuery = {
  bargeEtdTime: "", // 驳船预计开船时间
  etdTime: '',  // 大船预计开船时间
  bargeVessel: '',  // 驳船船名
  bargeVoyage: "", // 驳船航次
  vessel: '',  // 大船船名
  voyage: '',  // 大船航次
  cyCutOff: "", // 大船截关时间
  shipCarrierCode: '',  // 船公司
  podPortCode: '',  // 目的地
  refuseReason: '',
  refuseRemark: '',
}

export default {
  filters: {
    bkgStatusFilter(status) {
      return getDictLabel('bkgStatus', status)
    }
  },
  data() {
    return {
      dialogConfig: {
        title: '做柜后改船',
        show: true,
        size: 'medium',
        // width: "800px"
      },
      oQuery: this.$route.query,
      state: '',
      changeSaveItem: Object.assign({}, defaultChangeSaveQuery),
      rules: {
        etdTime: [{required: true, message: '请选择大船预计开船时间', trigger: 'change'}],
        cyCutOff: [{required: true, message: '请选择大船截关时间', trigger: 'change'}],
        podPortCode: [{required: true, message: '请选择目的地', trigger: 'change'}],
      },
      portList: [],
      carrierList: [],
      pickerOptions: {
        disabledDate(date) {
          //disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
          return date.getTime() < Date.now() - 24 * 60 * 60 * 1000;
        }
      },
      isView: false, // 查看详情状态
      status: '',   // 审核状态
    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    this.changeSaveItem.etdTime = this.createItem.ship.etdTime
    this.changeSaveItem.cyCutOff = this.createItem.ship.cyCutOff
    this.changeSaveItem.podPortCode = this.createItem.ship.podPortCode
    this.getChangeInfo()
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      orderNo: state => state.order.orderNo
    }),  
  },
  watch: {
  },
  components: {
    BaseDialog
  },
  methods: {
    refuseReasonFilter() {
      let result = ''
      let {refuseReason} = this.changeSaveItem
      let {orderAuditRefuseReason, bkgRefuseReason} = this.dictMap
      let refuseReasonOptions = orderAuditRefuseReason.concat(bkgRefuseReason)
      console.log('refuseReasonOptions', refuseReasonOptions)
      let findItem = refuseReasonOptions.find(item => item.value === refuseReason)
      result = findItem ? findItem.label : ''
      return result
    },
    // 获取做柜后改船信息
    getChangeInfo() {
      orderChangeInfo({orderNo: this.oQuery.orderNo}).then(res => {
        let {data} = res
        if (!data || data === {}) {
          this.status = ''
          this.isView = false
        }else {
          this.isView = true
          for (let i in this.changeSaveItem) {
            this.changeSaveItem[i] = data[i]
          }
          this.status = data.bkgStatus
          this.portList = [{label: data.podPortName, value: data.podPortCode}]
        }
      })
    },
    close(action) {
      this.$emit('close', action)
    },

    validate() {
      return true
    },

    carrierVisibleChange(val) {
      if (val) this.shipQuerySearch('')
    },

    carrierRemoteMethod(val) {
      this.shipQuerySearch(val)
    },

    // 船公司下拉列表自动补充的数据
    shipQuerySearch(queryString) {
      this.$store.dispatch('dict/baseShippingCarrierList', {name: queryString, state: 'valid'}).then(data => {
        this.carrierList = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
    },
    handleChangeShipCarrier(val) {
    },
    handleSelectShipCarrier(item) {
       Object.assign(this.changeSaveItem, {
        shipCarrierCode: item.key
      })
    },
    // 目的地
    podPortVisibleChange(val) {
      if (val) this.transitPortSearch('', 'port_of_destination', this.state)
    },
    podPortFilterMehod(val) {
      this.transitPortSearch(val, 'port_of_destination', this.state)
    },
    handleChangePodPortCode(val) {
    },
    // 港口下拉数据
    transitPortSearch(queryString, portAttribute, state) {
      this.$store.dispatch('dict/basePortList', {queryString, portAttribute, state}).then(data => {
        let result = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
        this.portList = result
      })
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        if (this.isView) {
          return this.close('Cancel')
        }
        console.log(this.$refs.changeSaveForm)
        this.$refs.changeSaveForm.validate((valid) => {
          if (valid) {
            this.handleChangeSave(done)
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    },

    // 做柜改船
    handleChangeSave(done) {
      this.changeSaveItem.orderNo = this.oQuery.orderNo
      this.$confirm(`是否确定做柜后改船?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return orderChangeSave(this.changeSaveItem)
      }).then(response => {
        this.$message({
          type: 'success',
          message: '改船成功',
          duration: 1000,
          onClose: () => {
            this.close('Confirm')
          }
        })
      }).catch((err) => {
      });

      // orderChangeSave(this.changeSaveItem).then(res => {
      //   this.$message({
      //     type: 'success',
      //     message: '改船成功',
      //     duration: 1000,
      //     onClose: () => {
      //       this.close('Confirm')
      //     }
      //   })
      // })
    },
    // 船名输入建议
    querySearchVessel(queryString, cb) {
      this.$store.dispatch('dict/queryVessleList', {name: queryString}).then(data => {
        cb(data)
      })
    },
    handleSelectVessel(value) {
    },
    handleClearVessel(value) {
    },
    // 航次输入建议
    querySearchVoyage(queryString, cb, vessel) {
      this.$store.dispatch('dict/queryVoyageList', {name: queryString, vessel: vessel}).then(data => {
        cb(data)
      })
    },
    handleSelectVoyage(value) {
    },
    handleClearVoyage(value) {
    }
  }
};
</script>

<style lang="scss">

</style>
