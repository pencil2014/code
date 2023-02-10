<template>
  <el-dialog
    :title="option.title"
    :visible.sync="option.show"
    :width="multi?'780px':'430px'"
    :append-to-body="option.appendToBody||false"
  >
    <div :style="{padding:option.padding || '0'}">
      <el-form
        :model="option.form"
        ref="form"
        :label-width="option.labelWidth || '80px'"
        size="mini"
        :inline="multi"
      >
        <el-form-item
          v-for="item in option.formItems"
          v-show="item.show !== false"
          :key="item.prop"
          :rules="item.r ? item.rules : []"
          :label="item.label"
          :prop="item.prop"
          :class="{'to-block':item.br}"
        >
          <!-- <el-col :span="24" :offset="0"> -->
          <div
            class="text-input"
            v-if="item.type === 'text'"
          >{{option.form[item.prop]+`${item.concat ? option.form[item.concat]: ''}`}}</div>
          <el-input
            v-else-if="item.type === 'add'"
            v-model="option.form[item.prop]"
            :placeholder="`点击添加${item.label}`"
            suffix-icon="el-icon-circle-plus-outline"
            @focus="addClick(item, option.form)"
          ></el-input>
          <el-input
            v-else-if="item.type === 'input' || item.type === 'textarea' "
            v-model="option.form[item.prop]"
            :type="item.type"
            :disabled="item.disabled || false"
            :placeholder="`请输入${item.label}`"
            @change="inputChange($event, option, item)"
            clearable
            :maxlength="item.maxlength"
          ></el-input>
          <el-date-picker
            v-else-if="item.type === 'date'"
            v-model="option.form[item.prop]"
            :type="item.dateType"
            :value-format="item.format"
            placeholder="选择"
            :disabled="item.disabled || false"
          ></el-date-picker>
          <!-- 凭证摘要 -->
          <div v-else-if="item.prop === 'voucherSummaryType'" style="width: 232px;">
            <el-col :span="16" :offset="0">
              <el-select
                v-model="option.form[item.prop]"
                :placeholder="'请选择'+item.label"
                :disabled="option.summaryDiy || item.disabled || false"
              >
                <el-option
                  v-for="o in (item.selectOptions || dictMap[item.prop])"
                  :key="o.value"
                  :label="o.label"
                  :value="o.value"
                  :disabled="o.disabled || false"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="5" :offset="1">
              <el-button
                :disabled="option.summaryDiy || false"
                v-if="item.prop==='voucherSummaryType'"
                size="mini"
                @click="addSummary(option.form[item.prop], item.selectOptions)"
              >增加</el-button>
            </el-col>
          </div>
          <el-select
            v-else-if="item.type === 'select'"
            v-model="option.form[item.prop]"
            :placeholder="item.placeholder || $t('Common.plSelect')+item.label"
            :multiple="!!item.multiple"
            collapse-tags
            clearable
            :disabled="item.disabled"
            :filterable="item.remote || item.filterable"
            :remote="item.remote"
            :noRemote="item.noRemote"
            :remote-method="(queryString) => {item.remoteMethod && item.remoteMethod(queryString, item)}"
            @visible-change="(val)=> val&&item.visibleChange&&item.visibleChange('',item,option.form)"
            @click.native="remoteClickNative(item,option.formItems)"
            @clear="()=>{item.clear && item.clear(option.form)}"
            @change="(val) => item.selectChange && item.selectChange(val, item, option.form)"
          >
            <el-option
              v-for="(o,k) in (item.selectOptions || dictMap[item.propInDict] || dictMap[item.prop])"
              :key="k+'_'+o.value"
              :label="o.label"
              :value="o.value"
              :disabled="o.disabled"
            ></el-option>
          </el-select>
          <el-autocomplete
            v-else-if="item.type === 'autocomplete'"
            v-model="option.form[item.prop]"
            :disabled="item.disabled"
            :placeholder="item.placeholder || $t('Common.plSelect') + item.label"
            clearable
            :select-when-unmatched="true"
            :fetch-suggestions="(queryString, cb) => {item.querySearch && item.querySearch(queryString, cb, option.formItems, option.form)}"
            @select="(value) => {item.select && item.select(value, option.form)}"
            @change="(value) => {item.change && item.change(value, option.form)}"
            @clear="()=>{item.clear && item.clear(option.form)}"
          ></el-autocomplete>
          <div v-else-if="item.type === 'list'" class="summary-box">
            <!-- v-if="summaryDiy" -->
            <div v-if="!option.summaryDiy" class="summary-tag">
              <el-tag
                v-for="(tag,index) in option.summaryList"
                :key="tag"
                size="mini"
                type="info"
                style="margin: 0 6px;"
                closable
                @close="tagClose(tag,index)"
              >{{tag}}</el-tag>
            </div>
            <el-input v-else v-model="option.summaryStr" placeholder size="mini" clearable></el-input>
            <el-button
              type="primary"
              size="mini"
              @click="toggleDiy"
            >{{!option.summaryDiy?'自定义':'配置'}}</el-button>
          </div>
          <!-- </el-col> -->
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" size="mini" @click="sure">{{$t('Common.sure')}}</el-button>
      <el-button @click="cancel" size="mini">{{$t('Common.cancel')}}</el-button>
    </span>
    <DimensionDialog
      :needDimensions="$attrs.needDimensions"
      :dialogOption="dimensionOption"
      @close="dimensionClose"
    />
  </el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import DimensionDialog from './dimensionDialog'
import { feeItemSubjectList, getSubjectParent } from '@/api/fin/acct'
export default {
  name: 'voucherDialog',
  components: {
    DimensionDialog,
  },
  props: {
    option: {
      type: Object,
      default: () => ({}),
    },
    // 是否多列布局
    multi: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dimensionOption: {
        show: false,
        title: '',
        cfg: {},
      },
      timeStamp: 0,
    }
  },
  watch: {
    'option.show': {
      handler(val) {
        // console.log(val)
        if (val && this.$attrs.source === 'business') {
          // 凭证管理--摘要  用于业务凭证设置
          let { summaryList, voucherSummary } = this.option
          if (!voucherSummary) return
          // voucherSummary.forEach((item) => (item.disabled = false))
          let copy = summaryList.map((item) => item.replace(/#/g, ''))
          // 用来判断摘要里是否有摘要字典的字段，若果摘要不为空且hasVal为false，表明此摘要是自定义的
          let hasNum = 0
          voucherSummary.forEach((item) => {
            item.disabled = copy.includes(item.value.replace(/#/g, '')) ? true : false
            if (item.disabled) hasNum++
          })
          if (hasNum != summaryList.length) {
            this.option.summaryDiy = true
            this.option.summaryStr = summaryList.join('/')
          }
          this.feeItemSubjectList()
        }
      },
      immediate: true,
    },
    'option.form.feeFinGroup'(val) {
      this.feeItemSubjectList()
    },
    'option.form.feeCode'(val) {
      this.feeItemSubjectList()
    },
    'option.form.receipayGroup'(val) {
      this.feeItemSubjectList()
    },
    //   deep: true,
    //   handler(val) {
    //     if(val.feeFinGroup && val._feeCode && val.receipayGroup){
    //     feeItemSubjectList({ feeFinGroup, feeCode, receipayGroup }).then()
    //     // this.option.form.feeItemSubject = '1111'
    //     // 请求费用科目列表(参数:费用类型，费用编码，收付类型)
    //     }
    //   },
    // },
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  methods: {
    remoteClickNative(item, formItems) {
      if (item.clickNative) {
        item.clickNative(item, formItems)
      }
      if (item.remote && item.remoteMethod && !item.notFirst) {
        item.notFirst = true
        item.remoteMethod('', item)
      }
    },
    // 动态获取科目全名
    inputChange(subjectCode, option, item) {
      if (!item.callback) return
      // 判断是否是一级目录，一级科目无父科信息，不用请求接口
      if (subjectCode.indexOf('.') < 0) return
      getSubjectParent({ subjectCode }).then(({ data }) => {
        if (!data) {
          option.form.fullName = ''
          return this.$msgErrClose('父科目信息为空')
        }
        option.form.fullName = data.fullName + '-'
      })
    },
    // 动态获取当前配置科目---新增&编辑业务凭证设置
    feeItemSubjectList() {
      // 业务凭证设置
      if (this.$attrs.source !== 'business') return
      // this.$nextTick(() => {
      let { receipayGroup, feeFinGroup, feeCode } = this.option.form
      // console.log(feeFinGroup, feeCode, receipayGroup)
      // console.log(feeFinGroup && feeCode && receipayGroup)
      if (feeFinGroup && feeCode && receipayGroup) {
        clearTimeout(this.timeStamp)
        this.timeStamp = setTimeout(() => {
          feeItemSubjectList({
            currPage: 1,
            pageSize: 10,
            query: [
              { column: 'feeFinGroup', type: 'eq', value: feeFinGroup },
              { column: 'feeCode', type: 'eq', value: feeCode },
              { column: 'receipayGroup', type: 'eq', value: receipayGroup },
            ],
          }).then((res) => {
            if (!res.data.list.length) {
              this.option.form.feeItemSubject = ''
              return this.$msgErrClose('请先维护科目类型')
            }
            this.option.form.feeItemSubject = res.data.list[0].subjectName + ' ' + res.data.list[0].subjectCode
          })
        }, 300)
      }
      // })
      // this.option.form.feeItemSubject = '1111'
      // 请求费用科目列表(参数:费用类型，费用编码，收付类型)
    },
    sure() {
      console.log(this.option.form)
      // 业务凭证设置
      if (!this.option.form.feeItemSubject && this.$attrs.source === 'business') {
        return this.$msgErrClose('请先维护科目类型')
      }
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$refs.form.clearValidate()
          this.$emit('close', true)
        }
      })
    },
    cancel() {
      this.close()
    },
    close() {
      this.$emit('close')
    },
    addClick(item, form) {
      // console.log(item, form)
      this.dimensionOption.title = `查找${item.label}`
      this.dimensionOption.cfg = { ...item, form }
      this.dimensionOption.show = true
    },
    dimensionClose() {
      this.dimensionOption.show = false
      // console.log(this.option)
    },
    addSummary(val, options) {
      if (this.option.summaryList.includes(val)) return
      this.$emit('addSummary', { val, options })
    },
    tagClose(tag, index) {
      this.$emit('delSummary', { tag, index })
      // let { summaryList, voucherSummary } = this.option
      // summaryList.splice(index, 1)
      // voucherSummary.forEach((item) => {
      //   if (item.value === tag) {
      //     item.disabled = false
      //   }
      // })
      // this.option.form.summaryInfo = summaryList.join('/')
      // console.log(summaryList, voucherSummary)
    },
    toggleDiy() {
      this.option.summaryDiy = !this.option.summaryDiy
    },
  },
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__body {
  padding: 24px !important;
  overflow-x: hidden;
}
.el-form {
  .el-input,
  .el-select,
  .el-autocomplete {
    width: 100%;
  }
}
.el-form--inline .el-form-item {
  width: 50%;
  margin-right: 0;
  ::v-deep {
    .el-form-item__content {
      width: calc(100% - 160px);
    }
  }
}
.el-form-item.to-block {
  display: block;
  width: 100%;
}
.add-input {
  background: #aaaaaa;
}
.text-input {
  font-size: 12px;
  color: #606266;
}
.summary-box {
  height: 20px;
  width: 570px;
  display: flex;
  .summary-tag {
    flex: 1 1 auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
  }
  .el-input {
    flex: 1 1 auto;
  }
  .el-button {
    margin-left: 10px;
    flex: 0 0 auto;
  }
}
</style>