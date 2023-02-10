<template>
  <el-dialog
    :before-close="cancle"
    :title="`Container ${dialogOptions.index + 1} - Reefer Settings`"
    :visible.sync="dialogOptions.show"
    class="container-dialog"
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
      <el-form-item label="Temperature" prop="reeferDto.temperature">
        <el-input
          class="smaller-input"
          placeholder="Enter Temperature..."
          size="mini"
          v-model="form.reeferDto.temperature"
        ></el-input>
        <el-select
          class="smaller-select"
          placeholder
          size="mini"
          v-model="temperatureType"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in temperatureTypeList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Humidity" prop="reeferDto.humidity">
        <el-input
          placeholder="Enter Percent..."
          size="mini"
          v-model="form.reeferDto.humidity"
        >
          <template slot="append">%</template>
        </el-input>
      </el-form-item>
      <!-- <el-form-item label="通风设置">
        <el-input placeholder="请输入" size="mini" v-model="form.name"></el-input>
      </el-form-item>-->
      <el-form-item label="Air Flow" prop="reeferDto.airFlow">
        <el-input
          class="smaller-input"
          placeholder="Enter Number..."
          size="mini"
          v-model="form.reeferDto.airFlow"
        ></el-input>
        <el-select
          class="smaller-select"
          placeholder
          size="mini"
          v-model="airFlowType"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in airFlowTypeList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        class="flex-item"
        label="Temperature Control Instructions"
        prop="reeferDto.description"
      >
        <el-input
          placeholder="Enter Instructions..."
          size="mini"
          type="textarea"
          v-model="form.reeferDto.description"
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
export default {
  props: {
    dialogOptions: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        humidity: '',
        airFlow: '',
        temperature: '',
        description: '',
      },
      rules: {
        temperature: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
      },
      options: [],
      temperatureType: '°C',
      temperatureTypeList: [
        {
          label: '°C',
          value: '°C',
        },
        {
          label: '°F',
          value: '°F',
        },
      ],
      airFlowType: 'CMB/hr',
      airFlowTypeList: [
        {
          label: 'CMB/hr',
          value: 'CMB/hr',
        },
        {
          label: 'CFT/hr',
          value: 'CFT/hr',
        },
      ],
    }
  },
  created() {
    this.form = this.dialogOptions.form
  },
  methods: {
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
.container-dialog {
  .el-form {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .el-form-item {
      width: 45%;
      margin-right: 0;
      &.flex-item {
        width: 100%;
      }
    }
    .smaller-input {
      width: 60%;
    }
    .smaller-select {
      width: 40%;
    }
  }

  .title {
    background-color: rgba(0, 0, 0, 0.03);
    padding: 5px 12px;
    font-size: 14px;
    font-weight: 700;
  }
  .el-dialog__body {
    padding: 0;
  }
  .el-dialog__footer {
    padding: 0 12px 20px 12px;
  }
}
</style>
