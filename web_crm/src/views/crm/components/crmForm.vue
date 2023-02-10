<template>
  <div class="crm-form">
    <slot></slot>
    <el-form
      :disabled="disabled"
      v-if="formDatas.length"
      ref="form"
      size="mini"
      :inline="true"
      :model="ruleForm"
      :rules="rules"
      :label-width="labelWidth"
    >
      <slot name="form-item-entType"></slot>
      <!-- :class="{textarea:item.type==='textarea',checkboxGroup:item.type==='checkboxGroup'}" -->
      <el-form-item
        v-for="item in formDatas"
        :class="[item.type, item.class]"
        :key="item.prop"
        :label="item.label"
        :prop="item.prop"
        :label-width="item.labelWidth"
      >
        <!-- :style="{ width: inputWidth }" -->
        <el-input
          v-if="item.type === 'number'"
          type="number"
          :disabled="item.disabled"
          v-model="ruleForm[item.prop]"
          :placeholder="disabled || item.disabled ? '' : `请输入${item.label}`"
          :min="item.min"
          :max="item.max"
          :maxlength="item.maxlength"
          :class="{'height-light': differentField.includes(item.prop)}"
        ></el-input>
        <el-input
          v-else-if="item.type === 'input'"
          :disabled="item.disabled"
          v-model="ruleForm[item.prop]"
          :placeholder="disabled || item.disabled ? '' : (item.placeholder || `请输入${item.label}`)"
          :maxlength="item.maxlength"
          clearable
          @input="
            (val) =>
              item.validateInput && item.validateInput(val, ruleForm, item.prop)
          "
          :class="{'height-light': differentField.includes(item.prop)}"
        ></el-input>
        <!-- :style="item.style || {height:'36px'}" -->
        <!-- :autosize="{minRows:1, maxRows:6}" -->
        <!-- :autosize="true" -->
        <!-- :style="{ width: item.inputWidth||inputWidth }" -->
        <el-input
          v-else-if="item.type === 'textarea'"
          resize="both"
          type="textarea"
          :disabled="item.disabled"
          :placeholder="item.placeholder"
          v-model="ruleForm[item.prop]"
          :maxlength="item.maxlength || CRM200"
          :show-word-limit="!!item.maxlength"
          autosize
          :class="{'height-light': differentField.includes(item.prop)}"
        ></el-input>
        <!-- {{ruleForm[item.prop]}} -->
        <!-- :style="{ width: inputWidth }" -->
        <el-select
          clearable
          :multiple="item.multiple"
          v-else-if="item.type === 'select' && item.remote"
          :disabled="item.disabled"
          remote
          filterable
          collapse-tags
          v-model="ruleForm[item.prop]"
          value-key="value"
          :placeholder="disabled || item.disabled ? '' : `请选择${item.label}`"
          :remote-method="
            (queryString) => {
              item.remoteMethod &&
                queryString !== '' &&
                item.remoteMethod(queryString, item)
            }
          "
          @visible-change="
            (v) => v && item.remoteMethod && item.remoteMethod('', item)
          "
          :class="{'height-light': differentField.includes(item.prop)}"
        >
          <el-option
            v-for="itemOption in item.list || []"
            :key="itemOption.value"
            :label="itemOption.label"
            :value="item.notObj ? itemOption.value : itemOption"
          ></el-option>
        </el-select>
        <!-- :style="{ width: inputWidth }" -->
        <el-select
          filterable
          clearable
          :multiple="item.multiple"
          collapse-tags
          v-else-if="
            item.type === 'select' && isArray(ruleForm['_' + item.prop])
          "
          v-model="ruleForm[item.prop]"
          :disabled="item.disabled"
          value-key="value"
          :placeholder="disabled || item.disabled ? '' : `请选择${item.label}`"
          @change="selectChange($event, ruleForm, item.prop)"
          :class="{'height-light': differentField.includes(item.prop)}"
        >
          <el-option
            v-for="itemOption in item.list ||
            dictMap[item.propInDict] ||
            dictMap[item.prop] ||
            []"
            :key="itemOption.value"
            :label="itemOption.label"
            :value="itemOption"
          ></el-option>
        </el-select>
        <!-- :style="{ width: inputWidth }" -->
        <el-select
          :multiple="item.multiple"
          :disabled="item.disabled"
          collapse-tags
          v-else-if="
            item.type === 'select' && !isArray(ruleForm['_' + item.prop])
          "
          v-model="ruleForm[item.prop]"
          :placeholder="disabled || item.disabled ? '' : `请选择${item.label}`"
          clearable
          filterable
          :class="{'height-light': differentField.includes(item.prop)}"
        >
          <el-option
            v-for="(itemOption, index) in item.list ||
            dictMap[item.propInDict] ||
            dictMap[item.prop] ||
            []"
            :key="index"
            :label="itemOption.label"
            :value="itemOption.value"
          ></el-option>
        </el-select>
        <!-- :style="{ width: inputWidth }" -->
        <el-date-picker
          v-else-if="item.type === 'date'"
          :disabled="item.disabled"
          v-model="ruleForm[item.prop]"
          type="date"
          value-format="yyyy-MM-dd"
          :placeholder="disabled || item.disabled ? '' : `请选择${item.label}`"
          :class="{'height-light': differentField.includes(item.prop)}"
        ></el-date-picker>
        <el-cascader
          v-else-if="item.type === 'cascader'"
          :key="item.options && item.options[0] && item.options[0].code"
          :emitPath="true"
          v-model="ruleForm[item.prop]"
          :options="item.options"
          :props="{ value: 'cname', label: 'cname', children: 'children' }"
          clearable
          :class="{'height-light': differentField.includes(item.prop)}"
          :filterable="item.filterable"
        ></el-cascader>
        <el-cascader
            v-else-if="item.type === 'industry'"
            filterable
            :clearable="true"
            size="mini"
            :options="item.cascaderList"
            v-model="ruleForm[item.prop]"
            :props="item.cascaderProps"
            :placeholder="item.placeholder || '请选择' + item.label"
            :class="{'height-light': differentField.includes(item.prop)}"
          ></el-cascader>
        <el-checkbox-group
          v-else-if="item.type === 'checkboxGroup'"
          v-model="ruleForm[item.prop]"
        >
          <el-checkbox
            v-for="(child, index) in item.list ||
            dictMap[item.propInDict || item.prop] ||
            []"
            v-show="child.show !== false"
            :key="(child.parent || '') + child.value + index"
            :label="child.value"
            :disabled="child.disabled"
            name="type"
            :class="{'height-light': differentField.includes(item.prop)}"
            >{{ child.label }}</el-checkbox
          >
        </el-checkbox-group>
        <el-button
          v-if="item.btnCfg && !$attrs.hideBtn"
          type="primary"
          size="mini"
          @click="() => item.btnCfg.callback()"
          >{{ item.btnCfg.text || "保存" }}</el-button
        >
      </el-form-item>
    </el-form>
    <slot name="tips"></slot>
  </div>
</template>

<script>
import { isArray } from "@/utils"
import { mapGetters } from "vuex"

export default {
  computed: {
    ...mapGetters(["dictMap"]),
  },
  props: {
    inputWidth: { type: String, default: "198px" },
    labelWidth: { type: String, default: "92px" },
    formDatas: { type: Array, default: () => [] },
    ruleForm: { type: Object, default: () => ({}) },
    rules: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false }
  },
  inject:['differentField'],
  // watch: {
  //   formDatas: {
  //     handler(val) {
  //       if (val) {
  //         val.forEach((item) => {
  //           if (item.type === 'cascader') {
  //             console.log(item.options)
  //             // debugger
  //           }
  //         })
  //       }
  //     },
  //     deep: true,
  //   },
  // },
  created() {
    // console.log(this.formDatas)
    // console.log(this.rules);
  },
  methods: {
    selectChange(val, form, prop) {
      form[prop] = val.value
      form._name = val.label
    },
    isArray,
  },
}
</script>

<style lang="scss">
.crm-form {
  .el-form {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    align-items: center;
  }
  .el-textarea__inner {
    width: 100% !important;
    // height: 32px;
    // min-height: 32px !important;
  }
  .el-form-item {
    width: 290px;
    margin-right: 0;
    display: inline-flex;
    .el-form-item__label {
      flex: none;
    }
    .el-form-item__content {
      flex: auto;
      display: flex;
      & > div {
        width: 100%;
      }
      & > button {
        margin-left: 8px;
      }
    }
    // margin-bottom: 4px;
    // .el-form-item__content {
    //   display: block;
    // }
    &.textarea {
      width: 100%;
      .el-input__count {
        line-height: 20px;
        bottom: 4px;
      }
    }
    &.checkboxGroup {
      width: 98%;
      .el-checkbox-group {
        overflow: hidden;
      }
      .el-checkbox {
        height: 20px;
        line-height: 20px;
        margin-right: 12px;
        float: left;
      }
      .el-form-item__content {
        display: inline-block;
        width: auto;
      }
      .el-checkbox__label {
        padding-left: 6px;
        font-size: 12px;
        // width: 70px;
      }
      .el-form-item__error {
        // display: none;
        // position: relative;
        // float: right;
        width: 40px;
        // text-align: right;
        left: -100px;
        top: 0;
        line-height: 18px;
      }
    }
    .height-light{
      .el-input__inner,.el-textarea__inner {
        background-color: #fdf2e8;
      }
    }
  }
}
</style>
