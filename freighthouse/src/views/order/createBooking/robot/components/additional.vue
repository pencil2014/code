<template>
  <div class="additional-cnt">
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="form"
      label-position="top"
      ref="form"
      size="mini"
    >
      <el-form-item label="Importer GST Identification No. (15-digits)" prop="gstNo">
        <el-input placeholder type="input" v-model="form.gstNo"></el-input>
      </el-form-item>
      <el-form-item label="Importer IEC No. (10-digits)" prop="iecCode">
        <el-input placeholder type="input" v-model="form.iecCode"></el-input>
      </el-form-item>
      <el-form-item label="Importer Official E-MAIL ID" prop="officialEmail">
        <el-input placeholder type="input" v-model="form.officialEmail"></el-input>
      </el-form-item>
      <el-form-item label="Forwarder/NVOCC PAN No. (10 characters)" prop="panNo">
        <el-input placeholder type="input" v-model="form.panNo"></el-input>
      </el-form-item>
      <el-form-item label="Notify Party’s PAN No. (10 characters)" prop="notifyPanNo">
        <el-input placeholder type="input" v-model="form.notifyPanNo"></el-input>
      </el-form-item>
      <el-form-item label="Invoice Value" prop="currencyCode">
        <el-select class="half-class" placeholder="currency code" v-model="form.currencyCode">
          <el-option
            v-for="item in dictMap['validCurrency']"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-input-number class="half-class" :precision="2" :controls="false" style="margin-left: 5px;" placeholder="value"  v-model.number="form.invoiceValue"></el-input-number>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    additionalInformation: {
      required: true,
      type: Object,
      default: () => {},
    },
    fieldConfigObj: {
      type: Object,
      default: () => {},
    },
    fieldConfigList: {
      type: Array,
      default: () => [],
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  data() {
    return {
      form: {
        gstNo: '',
        iecCode: '',
        officialEmail: '',
        panNo: '',
        notifyPanNo: '',
        currencyCode: '',
        invoiceValue: '',
      },
      rules: this.fieldConfigObj,
    }
  },
  created() {
    this.form = this.additionalInformation
  },
  methods: {
    validateForm() {
      let flag = null
      this.$refs['form'].validate((valid) => {
        if (valid) {
          flag = true
        } else {
          flag = false
        }
      })
      return flag
    },
  },
  watch: {
    additionalInformation: {
      handler(val) {
        this.form = val
      },
      deep: true,
    },
  },
}
</script>

<style lang="scss">
.additional-cnt {
  padding: 8px;
  .form {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    .el-form-item {
      width: 24%;
    }
    .half-class {
      width: 45%;
    }
  }
}
</style>