<template>
	<el-dialog :title="option.title" :visible.sync="option.show" :width="option.bigWidth || (multi ? '800px' : '430px')">
		<div :style="{ padding: option.padding || '0 50px' }">
			<el-form :model="option.form" ref="form" :label-width="option.labelWidth || '80px'" size="mini" :inline="multi" :class="{ 'form-input-long': option.inputLong, 'form-input-full': option.inputFull }">
				<template v-for="item in option.formItems">
					<el-form-item v-if="item.show !== false" :key="item.label" :rules="item.rules" :label="item.label" :prop="item.prop" :class="{ 'to-block': item.br, 'input-short': item.inputShort, 'label-short': item.labelShort }">
						<!-- v-show="!item.isShow || option.form[item.isShow] == 'yes'" -->
						<el-input
							:class="item.showVerify ? 'w72' : ''"
							v-if="item.type === 'input' || item.type === 'textarea'"
							v-model="option.form[item.prop]"
							:type="item.type"
							:disabled="item.disabled || false"
							:placeholder="item.placeholder || `请输入${item.label}`"
							@change="inputChange($event, option, item)"
							v-lsNumber="{ value: item.inputType, obj: option.form, key: item.prop }"
							:clearable="!!!item.disClear"
							:maxlength="item.maxlength"
						>
							<template v-if="item.append" slot="append">{{ item.append }}</template>
							<template v-if="item.prepend" slot="prepend">{{ option.form[item.prop + '_prepend'] || ''}}</template>
						</el-input>
						<el-select
							v-else-if="item.type === 'select' && item.remote && item.isObj"
							v-model="option.form[item.prop]"
							:placeholder="'请选择' + item.label"
							:disabled="item.disabled"
							filterable
              :noRemote="item.noRemote"
              :reserve-keyword="true"
							:multiple="item.multiple"
							:collapse-tags="item['collapse-tags'] || true"
							:remote-method="queryString => item.remoteMethod && item.remoteMethod(queryString, item)"
							@visible-change="val => val && item.remoteMethod && item.remoteMethod('', item)"
							@change="val => item.change && item.change(val, item, option.form)"
							@clear="val => item.clear && item.clear(val, option.form)"
							:clearable="!item.disClear"
						>
							<el-option v-for="(o, i) in item.selectOptions" :key="o.value + i" :label="item.en ? o.en : o.label" :value="o" :disabled="o.disabled"></el-option>
						</el-select>
						<el-select
							v-else-if="item.type === 'select' && item.remote"
							v-model="option.form[item.prop]"
							:placeholder="'请选择' + item.label"
							:disabled="item.disabled"
							filterable
              :noRemote="item.noRemote"
              :reserve-keyword="true"
							:multiple="item.multiple"
							:collapse-tags="item['collapse-tags'] || true"
							:remote-method="queryString => item.remoteMethod && item.remoteMethod(queryString, item)"
							@visible-change="val => val && item.remoteMethod && item.remoteMethod('', item)"
							@change="val => item.change && item.change(val, item, option.form)"
							@clear="val => item.clear && item.clear(val, option.form)"
							:clearable="!item.disClear"
						>
							<!-- @select="(value) => {item.change && item.change(value, option.form, option.formItems)}" -->
							<el-option v-for="(o, i) in item.selectOptions" :key="o.value + i" :label="item.en ? o.en : o.label" :value="o.value" :disabled="o.disabled"></el-option>
						</el-select>
						<el-select
							v-else-if="item.type === 'select'"
							v-model="option.form[item.prop]"
							:placeholder="'请选择' + item.label"
							:disabled="item.disabled"
							:multiple="!!item.multiple"
							:multiple-limit="item.multipleLimit || 0"
							:filterable="!!item.filterable"
              :reserve-keyword="true"
							@change="
								value => {
									item.change && item.change(value, option.form, option.formItems, 1)
								}
							"
							collapse-tags
							:clearable="!item.disClear"
						>
							<!-- @select="(value) => {item.change && item.change(value, option.form, option.formItems)}" -->
							<el-option v-for="(o, i) in item.selectOptions || dictMap[item.propInDict] || dictMap[item.prop]" :key="o.value + i" :label="item.en ? o.en : o.label" :value="o.value" :disabled="o.disabled"></el-option>
						</el-select>
						<el-autocomplete
							v-else-if="item.type === 'autocomplete'"
							v-model="option.form[item.prop]"
							:disabled="item.disabled"
							:placeholder="item.placeholder || '请选择' + item.label"
							clearable
							:select-when-unmatched="true"
							:fetch-suggestions="
								(queryString, cb) => {
									item.querySearch && item.querySearch(queryString, cb, option.formItems, option.form, item)
								}
							"
							@select="
								value => {
									item.select && item.select(value, option.form, item)
								}
							"
							@change="
								value => {
									item.change && item.change(value, option.form, item)
								}
							"
							@clear="
								() => {
									item.clear && item.clear(option.form)
								}
							"
						></el-autocomplete>
						<template v-else-if="item.type === 'radio'">
							<el-radio v-model="option.form[item.prop]" label="yes">是</el-radio>
							<el-radio v-model="option.form[item.prop]" label="no">否</el-radio>
						</template>
						<el-cascader
						    v-else-if="item.type === 'cascader'"
								v-model="option.form[item.prop]"
								:options="item.cascaderOptions"
								:props="item.cascadeProps || {
									value: 'cname',
									label: 'cname',
									children: 'children',
									expandTrigger: 'hover'
								}"
								filterable
								clearable
								@change="
								   value => {
											item.change && item.change(value, option.form, item)
										}
								">
						</el-cascader>
						<el-checkbox v-else-if="item.type === 'checkbox'" v-model="option.form[item.prop]">默认首选</el-checkbox>
						<tinymce class="mail-sign-rich-text" v-else-if="item.type === 'richtext'" :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="option.form[item.prop]" :height="180" ref="mailSign" />

						<!-- </el-col> -->
            <el-button style="width:25%;" :disabled="sendDisabled" @click="sendCode" v-if="item.showVerify">{{ sendText }}</el-button>
					</el-form-item>
				</template>
			</el-form>
		</div>
		<span slot="footer" class="dialog-footer">
			<el-button v-if="option.btnCfg" :type="option.btnCfg.type" size="mini" @click="sure">{{ option.btnCfg.text }}</el-button>
			<el-button v-else type="primary" size="mini" @click="sure">确定</el-button>
			<el-button @click="cancel" size="mini">取消</el-button>
		</span>
	</el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import Tinymce from '@/components/Tinymce'
export default {
	name: 'baseDialog',
	props: {
		option: {
			type: Object,
			default: () => ({})
		},
		// 是否多列布局
		multi: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			interval:null,
			timer: 60,
			sendDisabled: false,
			sendText: '发送验证码',
			// 富文本编辑器配置
			tinymceConfig: {
				toolbar: ['undo redo | fontselect | fontsizeselect | forecolor backcolor bold italic underline strikethrough alignleft aligncenter alignright outdent indent table removeformat hr charmap preview fullscreen'],
				menubar: ''
			}
		}
	},
	watch: {
		'option.form': {
			handler(val) {
				// console.log(this.option)
			},
			deep: true
		}
	},
	computed: {
		...mapGetters(['dictMap'])
	},
	mounted() {
		console.log('🚀 ~ this.option.formItems2222', this.option.formItems)
	},
	methods: {
		// 发送验证码
		sendCode() {
			this.sendDisabled = true
			this.interval = setInterval(() => {
				if (this.timer > 0) {
					this.sendText = `${this.timer--}秒后重发`
				} else {
					clearInterval(this.interval)
					this.sendText = `发送验证码`
					this.timer = 60
					this.sendDisabled = false

				}
			}, 1000)
			this.$emit('sendCode')
		},
		sure() {
			// return this.$emit('close', true)
			this.$refs['form'].validate(valid => {
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
		selectChange(e, option, item) {
			console.log(e, option, item)
		}
	},
	components: {
		Tinymce
	}
}
</script>
<style lang="scss" scoped>
::v-deep {
	.mail-sign-rich-text {
		.mce-btn-group:not(:first-child) {
			border: 0;
		}
		.mce-container * {
			white-space: normal;
		}
	}
  .el-input-group__prepend{
    min-width: 40px;
  }
}

::v-deep {
	.el-dialog__body {
		padding: 20px 20px 16px;
	}
	.el-dialog__footer {
		padding: 0 20px 20px;
	}
	.el-form-item__content {
		width: 180px;
	}
}
.el-select,
.el-autocomplete,
.el-cascader,
.el-select .el-input {
	width: 100%;
}
.el-input.w72 {
	width: 72%;
	margin-right: 3%;
}
.el-form-item.to-block {
	display: block;
}
.add-input {
	background: #aaaaaa;
}
.text-input {
	font-size: 12px;
	color: #606266;
}
div ::v-deep .el-input-group__append {
	z-index: 0;
	transform: translate(-100%, 0) scale(0.9);
	border: none;
	background-color: transparent;
}
.form-input-full ::v-deep {
	& > div:nth-last-of-type(1) {
		margin-bottom: 0;
	}
	.el-form-item {
		margin-bottom: 10px;
		display: flex;
		.el-form-item__content {
			margin-left: 0 !important;
			flex: 1 1 auto;
		}
	}
}
.form-input-long ::v-deep .el-input {
	width: 230px;
}
.label-short ::v-deep {
	.el-form-item__content,
	.el-form-item__label {
		width: 80px !important;
	}
}
.label-short {
	padding-left: 10px;
}
.input-short ::v-deep {
	.el-form-item__content,
	.el-input {
		width: 122px;
	}
}
</style>
