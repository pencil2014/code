<template>
  <el-dialog
    :title="option.title"
    :visible.sync="option.show"
    :width="option.width||($attrs.multi?'550px':'320px')"
    :class="{multi:$attrs.multi,single:!$attrs.multi}"
    :appendToBody="option.appendToBody"
  >
    <el-form
      ref="form"
      size="mini"
      :model="option.form"
      :label-width="option.labelWidth || '80px'"
      :inline="true"
    >
      <template v-for="item in option.formItems">
        <el-form-item
          :style="item.style"
          v-if="item.show !== false"
          :key="item.label"
          :rules="item.rules"
          :label="item.label"
          :prop="item.prop"
          :class="{'to-block':item.br||item.type=='textarea'||item.type=='file'||item.type=='list','input-short':item.inputShort,'label-short':item.labelShort}"
        >
          <el-input
            v-if="item.type === 'input' ||item.type === 'number' || item.type === 'textarea' "
            v-model="option.form[item.prop]"
            :type="item.type"
            :disabled="item.disabled || false"
            :placeholder="item.placeholder || `请输入${item.label}`"
            @change="inputChange($event, option, item)"
            v-lsNumber="{value:item.inputType, obj:option.form, key:item.prop}"
            :clearable="!item.disClear"
            :maxlength="item.maxlength"
            :show-word-limit="!!item.maxlength"
          >
            <template v-if="item.append" slot="append">{{item.append}}</template>
          </el-input>
          <el-select
            v-else-if="item.type === 'select' && item.remote"
            v-model="option.form[item.prop]"
            :noRemote="true"
            :placeholder="'请输入' + item.label"
            filterable
            remote
            clearable
            :disabled="item.disabled || false"
            :value-key="item.DIY && item.DIY.key"
            :multiple="item.multiple"
            :collapse-tags="true"
            :remote-method="(queryString) => {item.remoteMethod && queryString !== '' && item.remoteMethod(queryString, item)}"
            @visible-change="(v) => v && item.remoteMethod && item.remoteMethod('', item)"
          >
            <!-- @visible-change="(value) => {if(value){item.visibleChange && item.visibleChange('', item)}}" -->
            <!-- @select="(value) => {item.change && item.change(value, option.form, option.formItems)}" -->
            <!-- @change="selectChange($event, item)" -->
            <el-option
              v-for="(optionItem, j) in item.remoteSelectList || []"
              :key="'select' + item.prop + j"
              :label="optionItem.label"
              :value="item.DIY ? optionItem : optionItem.value"
            ></el-option>
          </el-select>
          <el-select
            v-else-if="item.type === 'select'"
            v-model="option.form[item.prop]"
            :value-key="item.prop"
            :placeholder="'请选择'+item.label"
            :disabled="item.disabled"
            :multiple="!!item.multiple"
            :filterable="!!item.filterable"
            @change="(value) => {item.change && item.change(value, option.form, option.formItems,1)}"
            collapse-tags
            clearable
          >
            <el-option
              v-for="(o,i) in (item.selectOptions || dictMap[item.propInDict] || dictMap[item.prop])"
              :key="o.value+i"
              :label="item.en ? o.en : o.label"
              :value="o.value"
              :disabled="o.disabled"
            ></el-option>
          </el-select>
          <el-date-picker
            v-else-if="item.type === 'date'"
            :disabled="item.disabled"
            v-model="option.form[item.prop]"
            :type="item.dateType||'date'"
            value-format="yyyy-MM-dd"
            :placeholder="`请选择${item.label}`"
            clearable
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="item.pickerOptions"
          ></el-date-picker>
          <el-date-picker
            v-else-if="item.type === 'datetime'"
            :disabled="item.disabled"
            v-model="option.form[item.prop]"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            :placeholder="`请选择${item.label}`"
            :picker-options="item.pickerOptions"
          ></el-date-picker>
          <FinanceUploadEmbed
            ref="fileupload"
            :acceptTypes="item.acceptTypes"
            :limit="item.limit"
            v-else-if="item.type === 'file' && option.show"
            @sendFileList="sendFileList($event,item)"
          />
          <el-autocomplete
            v-else-if="item.type === 'autocomplete'"
            v-model="option.form[item.prop]"
            value-key="label"
            :disabled="item.disabled"
            :placeholder="item.placeholder || '请选择' + item.label"
            clearable
            :select-when-unmatched="true"
            :fetch-suggestions="(queryString, cb) => {item.querySearch && item.querySearch(queryString, cb, option.formItems, option.form)}"
            @select="(value) => {item.select && item.select(value, option.form)}"
            @change="(value) => {item.change && item.change(value, option.form)}"
            @clear="()=>{item.clear && item.clear(option.form)}"
          ></el-autocomplete>
          <template v-else-if="item.type === 'radio'">
            <el-radio v-model="option.form[item.prop]" label="yes">是</el-radio>
            <el-radio v-model="option.form[item.prop]" label="no">否</el-radio>
          </template>
          <el-checkbox v-else-if="item.type === 'checkbox'" v-model="option.form[item.prop]">默认首选</el-checkbox>
          <!-- </el-col> -->
          <!-- 已上传文件列表 -->
          <ul class="delete-list" v-else-if="item.type === 'list'">
            <li v-for="(cItem,index) in option.form[item.prop]" :key="cItem.fileNo">
              <el-link
                :underline="false"
                type="primary"
                :href="cItem.url"
                target="_blank"
              >{{cItem.name}}</el-link>
              <i class="el-icon el-icon-close" @click="deleteList(option.form[item.prop],index)"></i>
            </li>
          </ul>
        </el-form-item>
      </template>
    </el-form>
    <slot name="check-slot"></slot>
    <slot name="footer-slot"></slot>
    <span v-if="!option.footerHide" slot="footer" class="dialog-footer">
      <el-button
        :loading="option.btnLoading"
        :icon="option.icon? 'el-icon-'+option.icon:''"
        :type="option.btnType||'primary'"
        size="mini"
        @click="sure"
      >{{option.text||'确定'}}</el-button>
      <el-button @click="cancel" size="mini">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import FinanceUploadEmbed from './financeUploadEmbed'
import { mapGetters } from 'vuex'
export default {
  name: 'finDialog',
  props: {
    option: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    FinanceUploadEmbed,
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  watch: {
    'option.show': {
      handler(val) {
        if (val) {
          this.$nextTick(() => this.$refs.form.resetFields())
        }
      },
      immediate: true,
    },
  },
  methods: {
    sure() {
      this.$refs['form'].validate((valid) => {
        valid && this.$emit('close', true)
      })
    },
    cancel() {
      this.close()
    },
    close() {
      this.$emit('close')
    },
    inputChange(e, option, item) {},
    sendFileList(val, item) {
      console.log(val)
      let { prop, limit } = item
      if (limit == 1) {
        this.option.form.__filePath__ = val[0] ? val[0].filePath : ''
        this.option.form.__fileName__ = val[0] ? val[0].name : ''
        this.option.form[prop] = val[0] ? val[0].fileNo : ''
      } else {
        this.option.form[prop] = val.map((item) => item.fileNo)
      }
      this.$refs.form.validateField(prop)
    },
    deleteList(list, index) {
      this.$confirmWarn('确定删除此记录吗？', () => list.splice(index, 1))
    },
  },
}
</script>
<style lang="scss" scoped>
.single ::v-deep,
.multi ::v-deep {
  .el-date-editor.el-date-editor--daterange {
    display: inline-block;
  }
  .el-input__icon.el-range__icon.el-icon-date {
    float: right;
    order: 1;
    margin-left: 0;
  }
  .el-date-editor .el-range-separator {
    line-height: 12px;
    width: 8px;
  }
  .el-form-item__label {
    height: 20px !important;
    line-height: 20px !important;
  }
  // 不能粗暴的设置.el-form-item__content高度20px, 因为存在多行或者文件上传的情况
  .el-form-item__content {
    line-height: 20px !important;
  }
  input,
  select,
  .el-range-editor--mini.el-input__inner,
  .el-input__icon,
  .el-cascader--mini {
    height: 20px !important;
    line-height: 20px !important;
  }

  textarea {
    height: 40px;
    line-height: 20px !important;
  }
  // 按钮
  .el-button--mini,
  .el-radio-button--mini .el-radio-button__inner {
    font-size: 12px;
    height: 20px;
    padding: 3px 7px;
  }
  // 必填项，取消*号，改为背景色
  .is-required {
    // & > label::before {
    //   display: none;
    // }
    .is-disabled {
      &.checkboxGroup .el-form-item__label,
      input,
      select,
      textarea,
      .el-date-editor--daterange {
        background: #f5f7fa;
      }
    }
    // &.checkboxGroup .el-form-item__label,
    // input,
    // select,
    // textarea,
    // .el-date-editor--daterange {
    //   background: #fef5f4;
    // }
    // 对于多选下拉框，会有两个input框，会遮盖placeholder，需设置tags input框底色透明
    .el-select__tags input,
    .el-date-editor--daterange input {
      background: transparent;
    }
  }
  .el-dialog__body {
    padding: 20px;
    .el-form-item {
      display: inline-flex;
      margin: 0 !important;
      margin-bottom: 6px !important;
      .el-form-item__label {
        flex: 0 0 auto;
      }
      .el-form-item__content {
        flex: 1 1 auto;
        & > div {
          width: 100%;
        }
      }
      .upload-file-cont {
        width: 100% !important;
      }
    }
  }
  .el-dialog__footer {
    padding: 0 20px 20px;
  }
}
.single ::v-deep .el-form-item {
  width: 100%;
}
.multi ::v-deep .el-form-item {
  width: 50%;
  &.to-block {
    width: 100%;
  }
  .delete-list {
    line-height: 20px;
    padding-top: 4px;
    .el-link {
      font-size: 12px;
      text-decoration: underline;
    }
    .el-icon {
      cursor: pointer;
      margin-left: 10px;
      vertical-align: middle;
    }
  }
}
</style>
