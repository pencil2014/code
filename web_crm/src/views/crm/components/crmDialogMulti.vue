<template>
  <el-dialog
    :title="option.title"
    :visible.sync="option.show"
    :width="option.width||($attrs.multi?'550px':'320px')"
    :class="{multi:$attrs.multi}"
  >
    <el-form
      ref="form"
      size="mini"
      :model="option.form"
      :label-width="option.labelWidth || '100px'"
      :inline="true"
    >
      <template v-for="item in option.formItems">
        <el-form-item
          v-if="item.show !== false"
          :key="item.label"
          :rules="item.rules"
          :label="item.label"
          :prop="item.prop"
          :class="{'to-block':item.br||item.type=='textarea'||item.type=='file'||item.type=='list','input-short':item.inputShort,'label-short':item.labelShort}"
        >
          <el-input
            v-if="item.type === 'input' || item.type === 'textarea' "
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
            :placeholder="'请输入' + item.label"
            filterable
            remote
            clearable
            :disabled="item.disabled || false"
            :value-key="item.DIY && item.DIY.key"
            :multiple="item.multiple"
            :remote-method="(queryString) => {item.remoteMethod && queryString !== '' && item.remoteMethod(queryString, item)}"
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
            type="date"
            value-format="yyyy-MM-dd"
            :placeholder="`请选择${item.label}`"
          ></el-date-picker>
          <el-date-picker
            v-else-if="item.type === 'datetime'"
            :disabled="item.disabled"
            v-model="option.form[item.prop]"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            :placeholder="`请选择${item.label}`"
          ></el-date-picker>
          <FinanceUploadEmbed
            v-else-if="item.type === 'file' && option.show"
            @sendFileList="sendFileList($event,item.prop)"
          />
          <el-autocomplete
            v-else-if="item.type === 'autocomplete'"
            v-model="option.form[item.prop]"
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
        :icon="'el-icon-'+option.icon"
        type="primary"
        size="mini"
        @click="sure"
      >{{option.text||'确定'}}</el-button>
      <el-button @click="cancel" size="mini">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import FinanceUploadEmbed from '@/views/crm/components/financeUploadEmbed'
import { mapGetters } from 'vuex'
export default {
  name: 'crmDialogMulti',
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
    // 'option.form': {
    //   handler(val) {
    //     console.log(this.option)
    //   },
    //   deep: true,
    // },
    'option.show'(val) {
      if (val && this.option.showClear) {
        this.$nextTick(() => {
          this.$refs.form.resetFields()
          // this.$nextTick(() => {
          //   this.$refs.form.clearValidate()
          // })
        })
      }
    },
  },
  methods: {
    sure() {
      console.log(this.option.form)
      // return
      // return this.$emit('close', true)
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
    sendFileList(val, prop) {
      console.log(val)
      this.option.form[prop] = val.map((item) => item.fileNo)
      this.$refs.form.validateField(prop)
    },
    deleteList(list, index) {
      this.$confirmWarn('确定删除此记录吗？', () => list.splice(index, 1))
    },
  },
}
</script>
<style lang="scss" scoped>
::v-deep {
  .el-dialog__body {
    padding: 20px;
    .el-form-item {
      width: 50%;
      margin: 0 !important;
      margin-bottom: 4px !important;
      display: inline-flex;
      .el-form-item__label {
        flex: 0 0 auto;
      }
      .el-form-item__content {
        flex: 1 1 auto;
        & > div {
          width: 100%;
        }
      }
      &.to-block {
        width: 100%;
      }
      .upload-file-cont {
        width: 100% !important;
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
  }
  .el-dialog__footer {
    padding: 0 20px 20px;
  }
}
</style>
