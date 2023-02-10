<template>
  <div class="totals-cnt">
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="form"
      disabled
      label-position="top"
      ref="form"
      size="mini"
    >
      <el-form-item label="Total Number of Containers" prop="containers">
        <el-input placeholder type="input" v-model="form.containers"></el-input>
      </el-form-item>
      <el-form-item label="Total Number of Packages" prop="packages">
        <el-input placeholder type="input" v-model="form.packages"></el-input>
      </el-form-item>
      <el-form-item label="Total Shipment Weight" prop="weight">
        <el-input placeholder type="input" v-model="form.weight"></el-input>
      </el-form-item>
      <el-form-item label="Total Shipment Volume" prop="volume">
        <el-input placeholder type="input" v-model="form.volume"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    totalsOption: {
      required: true,
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        containers: '1',
        packages: '0',
        weight: '0.000',
        volume: '0.000',
      },
      rules: {},
    }
  },
  created() {
    this.form = this.totalsOption
  },
  watch: {
    totalsOption: {
      handler(val) {
        this.form = val
      },
      deep: true,
    },
  },
}
</script>

<style lang="scss">
.totals-cnt {
  padding: 8px;
  .form {
    display: flex;
    justify-content: space-between;
    .el-form-item {
      width: 24%;
    }
  }
}
</style>
