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
      <el-form-item
        label="dangerous cargo name"
        prop="dangerousDto.cargoName"
        class="flex-item"
      >
        <el-input
          v-model="form.dangerousDto.cargoName"
          placeholder="Enter Name..."
          maxlength="180"
          size="mini"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="UN Number"
        prop="dangerousDto.undgNo"
        class="spec-item"
      >
        <el-input
          placeholder="Enter Number..."
          size="mini"
          v-model="form.dangerousDto.undgNo"
        ></el-input>
      </el-form-item>
      <el-form-item
        class="spec-item"
        label="Primary IMO Class"
        prop="dangerousDto.hazardCode"
      >
        <el-select
          class="large-select"
          filterable
          placeholder="Select One"
          size="mini"
          v-model="form.dangerousDto.hazardCode"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in imoList"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item class="middle-item" label="Outer Package Count/Type" prop="quantity">
        <el-input
          class="smaller-input"
          placeholder="Enter Count..."
          size="mini"
          v-model="form.quantity"
        ></el-input>
        <el-select
          :loading="loading"
          :remote-method="getPackageList"
          class="smaller-select"
          filterable
          placeholder="Enter Type..."
          remote
          reserve-keyword
          size="mini"
          v-model="form.packageTypeCode"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in packageList"
          ></el-option>
        </el-select>
      </el-form-item>-->
      <el-form-item
        class="spec-item"
        label="Packing Group"
        prop="dangerousDto.dangerLevel"
      >
        <el-select
          class="large-select"
          placeholder="Select One"
          size="mini"
          v-model="form.dangerousDto.dangerLevel"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in dangerList"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item :prop="number" class="middle-item" label="正确运输名称">
        <el-input placeholder="请输入名称" size="mini" v-model="input2"></el-input>
      </el-form-item>
      <el-form-item :prop="number" class="spec-item" label="技术名称">
        <el-input placeholder="请输入名称" size="mini" v-model="input2"></el-input>
      </el-form-item>-->
      <!-- <el-form-item class="small-item" label="净重">
        <el-input class="smaller-input" placeholder="请输入" size="mini" v-model="form.name"></el-input>
        <el-select class="smaller-select" placeholder size="mini" v-model="model">
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in options"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="small-item" label="净体积">
        <el-input class="smaller-input" placeholder="请输入" size="mini" v-model="form.name"></el-input>
        <el-select class="smaller-select" placeholder size="mini" v-model="model">
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in options"
          ></el-option>
        </el-select>
      </el-form-item>-->
      <!-- <el-form-item :prop="couontry" class="small-item no-margin" label="集中状态">
        <el-select class="large-select" placeholder size="mini" v-model="model">
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in options"
          ></el-option>
        </el-select>
      </el-form-item>-->
      <el-form-item
        class="small-item"
        label="Flash Point"
        prop="dangerousDto.flashPoint"
      >
        <el-input
          class="smaller2-input"
          placeholder="Enter Temperrature..."
          size="mini"
          v-model="form.dangerousDto.flashPoint"
        ></el-input>
        <el-select
          class="smaller2-select"
          placeholder
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
        prop="dangerousDto.contact.name"
      >
        <el-input
          placeholder="Enter Name..."
          size="mini"
          v-model="form.dangerousDto.contact.name"
        ></el-input>
      </el-form-item>
      <el-form-item
        class="small-item no-margin"
        label="Emergency Contact Number"
        prop="dangerousDto.contact.telPhone"
      >
        <el-input
          placeholder="+xx xxx-xxx-xxxx"
          size="mini"
          v-model="form.dangerousDto.contact.telPhone"
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
      rules: {
        'dangerousDto.cargoName': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
      },
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
      // if (!this.form.quantity) {
      //   return this.$msgErrClose('Outer Package Count/Type is required')
      // }
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const data = Object.assign({}, this.form)
          this.$emit('submit', data)
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.goods-dialog {
  // .el-dialog__body {
  //   padding: 0;
  // }
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
.el-form-item__error {
  padding-top: 0;
}
</style>
