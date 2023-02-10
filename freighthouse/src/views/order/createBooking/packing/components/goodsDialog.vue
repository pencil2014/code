<template>
  <el-dialog
    :before-close="cancle"
    :title="`Cargo - Hazmat Details`"
    :visible.sync="dialogOptions.show"
    class="goods-dialog"
    width="600px"
  >
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="form"
      label-position="top"
      ref="form"
    >
      <el-form-item label="UN Number" prop="undgNo" class="flex-item">
        <el-input
          placeholder="Enter Number..."
          size="mini"
          v-model="form.undgNo"
        ></el-input>
      </el-form-item>
      <el-form-item
        class="flex-item"
        label="Primary IMO Class"
        prop="hazardCode"
      >
        <el-select
          class="large-select"
          filterable
          clearable
          placeholder="Select One"
          size="mini"
          v-model="form.hazardCode"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in imoList"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item class="spec-item" label="Packing Group" prop="dangerLevel">
        <el-select
          clearable
          class="large-select"
          placeholder="Select One"
          size="mini"
          v-model="form.dangerLevel"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in dangerList"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item class="small-item" label="Flash Point" prop="flashPoint">
        <el-input
          class="smaller2-input"
          placeholder="Enter Temperrature..."
          size="mini"
          v-model="form.flashPoint"
        ></el-input>
        <el-select
          class="smaller2-select"
          placeholder
          clearable
          size="mini"
          v-model="flashPointType"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in flashPointTypeList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        class="small-item"
        label="Emergency Contact Name"
        prop="contact.name"
      >
        <el-input
          placeholder="Enter Name..."
          size="mini"
          v-model="form.contact.name"
        ></el-input>
      </el-form-item>
      <el-form-item
        class="small-item no-margin"
        label="Emergency Contact Number"
        prop="contact.telPhone"
      >
        <el-input
          placeholder="+xx xxx-xxx-xxxx"
          size="mini"
          v-model="form.contact.telPhone"
        ></el-input>
      </el-form-item>
      <el-form-item
        class="flex-item"
        label="General Comments"
        prop="description"
      >
        <el-input
          placeholder="Enter Comments..."
          size="mini"
          type="textarea"
          v-model="form.description"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="cancle" size="mini">Cancle</el-button>
      <el-button @click="submit" size="mini" type="primary">Save</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { imoList, packageList } from '@/api/order/createBooking'
export default {
  inject: ['dictAll'],
  props: {
    dialogOptions: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {},
      rules: {},
      imoList: [],
      loading: false,
      dictList: [],
      packageList: [],
      dangerList: [],
      flashPointType: '°C',
      flashPointTypeList: [
        {
          label: '°C',
          value: '°C',
        },
        {
          label: '°F',
          value: '°F',
        },
      ],
    }
  },
  created() {
    this.form = this.dialogOptions.form
    this.getImoList()
    // 危险等级
    const source = this.dictAll.dictList.filter(
      (item) => item.groupCode === 'dangerous_level'
    )[0]
    this.dangerList = source.dictItems.map((item) => {
      const { descpt, itemCode } = item
      return {
        label: `${itemCode}-${descpt}`,
        value: itemCode,
      }
    })
  },
  methods: {
    // 危险品等级
    getImoList() {
      imoList({})
        .then((res) => {
          if (res.code === 0) {
            this.imoList = res.data.map((item) => {
              const { imoCode, descpt } = item
              return {
                label: descpt,
                value: imoCode,
              }
            })
          }
        })
        .catch(() => {})
    },
    // 获取包装类型
    getPackageList(str = '') {
      const data = {
        keyword: str,
      }
      this.loading = true
      packageList(data)
        .then((res) => {
          if (res.code === 0) {
            this.packageList = res.data.map((item) => {
              const { packageCode, descpt } = item
              return {
                label: descpt,
                value: packageCode,
              }
            })
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    cancle() {
      this.$emit('cancle')
    },
    submit() {
      const data = Object.assign({}, this.form)
      this.$emit('submit', data)
    },
  },
}
</script>

<style lang="scss" scoped>
.goods-dialog {
  .el-dialog__body {
    padding: 10px;
  }
  .el-dialog__footer {
    padding: 0 12px 20px 12px;
  }
  .flex-item {
    width: 100% !important;
    margin-right: 0 !important;
  }
  .middle-item {
    width: 460px !important;
  }
  .spec-item {
    width: 40% !important;
    margin-right: 2%;
  }
  .small-item {
    width: 40% !important;
    margin-right: 2%;
  }
  .no-margin {
    margin-right: 0;
  }
  .large-select {
    width: 100%;
  }
  .smaller-input {
    width: 30% !important;
  }
  .smaller-select {
    width: 70% !important;
  }
  .smaller2-input {
    width: 70% !important;
  }
  .smaller2-select {
    width: 30% !important;
  }
}
</style>
