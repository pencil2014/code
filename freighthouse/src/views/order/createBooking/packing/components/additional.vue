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
      <el-form-item v-if="INRequired" label="Importer GST Identification No.(15-digits)" prop="gstNo">
        <el-input placeholder type="input" v-model="form.gstNo"></el-input>
      </el-form-item>
      <el-form-item v-if="INRequired" label="Importer IEC No.(10-digits)" prop="iecNo">
        <el-input placeholder type="input" v-model="form.iecNo"></el-input>
      </el-form-item>
      <el-form-item v-if="INRequired" label="Importer Official E-MAIL. ID" prop="ioeId">
        <el-input placeholder type="input" v-model="form.ioeId"></el-input>
      </el-form-item>
      <el-form-item v-if="INRequired" label="Notify Party's PAN No.(10 characters)" prop="panNo">
        <el-input placeholder type="input" v-model="form.panNo"></el-input>
      </el-form-item>
      <el-form-item v-if="INRequired" label="Invoice Value" prop="invokeCurrencyCode">
        <el-select class="half-class" placeholder="currency code" v-model="form.invokeCurrencyCode">
          <el-option
            v-for="item in dictMap['validCurrency']"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-input-number class="half-class" :precision="2" :controls="false" style="margin-left: 5px;" placeholder="value"  v-model.number="form.invokeValue"></el-input-number>
      </el-form-item>
      <el-form-item v-if="EGRequired" label="Exporter Registration Number" prop="exporterRegisterNo">
        <el-input placeholder type="input" v-model="form.exporterRegisterNo"></el-input>
      </el-form-item>
      <el-form-item v-if="EGRequired" label="Importer VAT (9-Characters)" prop="importerVatNo">
        <el-input placeholder type="input" v-model="form.importerVatNo"></el-input>
      </el-form-item>
      <el-form-item v-if="EGRequired" label="ACID No.(19-Characters)" prop="acidNo">
       <el-input placeholder type="input" v-model="form.acidNo"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    additionalOption: {
      required: true,
      type: Object,
      default: () => {},
    },
    transportOption: {
      required: true,
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        gstNo: '',
        iecNo: '',
        ioeId: '',
        panNo: '',
        invokeCurrencyCode: '',
        invokeValue: '',
        exporterRegisterNo: '',
        importerVatNo: '',
        acidNo: '',
      },
      rules: {
        gstNo: {
          required: true,
          message: 'Required Field',
          trigger: 'blur',
        },
        iecNo: {
          required: true,
          message: 'Required Field',
          trigger: 'blur',
        },
        ioeId: {
          required: true,
          message: 'Required Field',
          trigger: 'blur',
        },
        panNo: {
          required: true,
          message: 'Required Field',
          trigger: 'blur',
        },
        invokeCurrencyCode: {
          required: true,
          message: 'Required Field',
          trigger: 'blur',
        },
        exporterRegisterNo: {
          required: true,
          message: 'Required Field',
          trigger: 'blur',
        },
        importerVatNo: {
          required: true,
          message: 'Required Field',
          trigger: 'blur',
        },
        acidNo: {
          required: true,
          message: 'Required Field',
          trigger: 'blur',
        },
      },
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
    INRequired() {
      return this.transportOption &&
             this.transportOption.pod &&
             this.transportOption.pod.locationCode &&
             this.transportOption.pod.locationCode.countryCode &&
             ['IN'].includes(this.transportOption.pod.locationCode.countryCode)
    },
    EGRequired() {
      return this.transportOption &&
             this.transportOption.pod &&
             this.transportOption.pod.locationCode &&
             this.transportOption.pod.locationCode.countryCode &&
             ['EG'].includes(this.transportOption.pod.locationCode.countryCode)
    }
  },
  created() {
    this.form = this.additionalOption
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
    additionalOption: {
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
    justify-content: space-between;
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