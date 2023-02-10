<template>
  <div class="reference-cnt">
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="form"
      label-position="top"
      ref="form"
    >
      <el-form-item
        label="Shipper's Reference Number(s)"
        prop="freightForwardNo"
      >
        <el-input
          placeholder="Enter Number(s)..."
          size="mini"
          v-model="form.freightForwardNo"
        ></el-input>
      </el-form-item>
      <el-form-item label="Forwarder's Reference Number(s)" prop="blNo">
        <el-input
          placeholder="Enter Number(s)..."
          size="mini"
          v-model="form.blNo"
        ></el-input>
      </el-form-item>
      <!-- <el-form-item :prop="name5" label="发货人参考号">
        <el-input placeholder="请输入" size="mini" v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item :prop="name4" label="采购单号">
        <el-input placeholder="请输入" size="mini" v-model="form.name"></el-input>
      </el-form-item>
      <div v-show="showMore">
        <el-form-item :prop="name1" label="关税号">
          <el-input placeholder="请输入" size="mini" v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item :prop="name2" label="合同方参考号">
          <el-input placeholder="请输入" size="mini" v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item :prop="name3" label="收货人参考号">
          <el-input placeholder="请输入" size="mini" v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item :prop="name7" label="提单参考号">
          <el-input placeholder="请输入" size="mini" v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item :prop="name8" label="Customer Shipment ID">
          <el-input placeholder="请输入数字" size="mini" v-model="form.name"></el-input>
        </el-form-item>
      </div>
      <div @click="showMore=!showMore" class="showmore">
        <i class="el-icon-arrow-down" v-if="!showMore"></i>
        <i class="el-icon-arrow-up" v-else></i>
        附加信息
      </div>-->
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    referenceOption: {
      required: true,
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        freightForwardNo: '',
        blNo: '',
      },
      rules: {},
      // showMore: false
    }
  },
  created() {
    this.form = this.referenceOption
  },
  methods: {
    // 校验数据
    validateForm() {
      let flag = null
      this.$refs['form'].validate((valid) => {
        if (valid) {
          flag = true
        } else {
          flag = false
        }
        return flag
      })
    },
  },
}
</script>

<style lang="scss">
.reference-cnt {
  .form {
    padding: 8px;
    display: flex;
    justify-content: space-between;
    .el-form-item {
      width: 45%;
    }
    .showmore {
      color: #277ab5;
      cursor: pointer;
    }
  }
}
</style>
