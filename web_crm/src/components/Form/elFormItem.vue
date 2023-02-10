<template>
	<el-form-item v-if="!item.hide" class="el-form-block" :required="item.required" :label="item.label" :prop="item.prop" :show-message="false">
		<!-- 地址组件 -->
		<div class="box-address-flex" v-if="item.type === 'address'">
			<el-input size="mini" placeholder="请输入" v-model="form[item.key]" clearable :show-word-limit="item.showWordLimit" :maxlength="item.maxlength" class="box-address-input"></el-input>
			<el-button type="default" size="mini" class="box-address-btn" @click="item.click">选择</el-button>
		</div>
		<!-- 输入框 -->
		<el-input
			v-if="item.type == 'input' && !item.hide"
			v-model="form[item.key]"
			:placeholder="'请输入' + item.label"
			:type="item.inputType || 'text'"
			:rows="item.rows || 2"
			size="mini"
			:disabled="item.disabled"
			:show-word-limit="item.showWordLimit"
			:maxlength="item.maxlength"
			clearable
			style="width:100%"
		></el-input>
		<el-autocomplete
			v-if="item.type == 'autocomplete'"
			v-model="form[item.key]"
			:fetch-suggestions="(queryString, cb) => item.querySearch && item.querySearch(queryString, cb)"
			@select="(value) => item.handleSelect && item.handleSelect(value, item)"
			@clear="(value) => item.clear && item.clear(value, item)"
			@change="(value) => item.change && item.change(value, item)"
			placeholder="请输入内容"
			size="mini"
			clearable
			style="width:100%"
		></el-autocomplete>
		<!-- 级联选择框 -->
		<el-cascader
			v-if="item.type == 'cascader'"
			style="width:100%"
			size="mini"
			:emitPath="true"
			v-model="form[item.key]"
			:options="item.options"
			:props="item.props"
			filterable
			clearable
			@change="
				value => {
					item.change && item.change(value)
				}
			"
		></el-cascader>
		<!-- 选择框 -->
		<el-select
			v-if="item.type == 'select'"
			:filterable="item.filterable || false"
			:clearable="item.clearable || false"
			:remote="item.remote || false"
			@visible-change="
				val => {
					item.visibleChange && item.visibleChange(val, item)
				}
			"
			:filter-method="
				val => {
					item.filterMethod && item.filterMethod(val, item)
				}
			"
			:remote-method="
				val => {
					item.remoteMethod && item.remoteMethod(val, item)
				}
			"
			@change="
				value => {
					item.change && item.change(value, item)
				}
			"
			v-model="form[item.key]"
			:placeholder="'请选择' + item.label"
			:disabled="item.disabled"
			size="mini"
			style="width:100%;"
		>
			<el-option v-for="(ele, index) in item.options" :key="index" :label="ele.label" :value="ele.value"></el-option
		></el-select>
		<!-- 日期 -->
		<el-date-picker
			v-if="item.type == 'date'"
			v-model="form[item.key]"
			:placeholder="'请选择' + item.label"
			:disabled="item.disabled"
			:picker-options="item.pickerOptions"
			style="width: 100%;"
			type="date"
			value-format="yyyy-MM-dd"
			size="mini"
		></el-date-picker>
		<!-- 日期 不允许录入已总关账的时间-->
		<elDatePickerLimit 
		  v-if="item.type == 'dateLimit'"
			v-model="form[item.key]"
			:field="item.key"
			:noCanFuture="['realEnterTime', 'outTime'].includes(item.key)"
			:placeholder="'请选择' + item.label"
			:disabled="item.disabled"
			:picker-options="item.pickerOptions"
			style="width: 100%;"
			type="date"
			value-format="yyyy-MM-dd"
			size="mini"
		 />
		<!-- 时间 -->
		<el-time-picker
			v-if="item.type == 'time'"
			v-model="form[item.key]"
			:placeholder="'请选择' + item.label"
			:disabled="item.disabled"
			size="mini"
			style="width: 100%;"
		></el-time-picker>
		<!-- 日期 -->
		<el-date-picker v-if="item.type == 'datetime'" v-model="form[item.key]" :placeholder="'请选择' + item.label" type="datetime" size="mini" style="width: 100%;"> </el-date-picker>
		<!-- 日期 不允许录入已总关账的时间-->
		<elDatePickerLimit v-if="item.type == 'datetimeLimit'" v-model="form[item.key]" :placeholder="'请选择' + item.label" type="datetime" size="mini" style="width: 100%;"> </elDatePickerLimit>
		<!-- switch -->
		<el-switch v-if="item.type == 'switch'" v-model="form[item.key]"></el-switch>
		<!-- 多选框 -->
		<el-checkbox-group v-if="item.type == 'checkbox'" v-model="form[item.key]" :disabled="item.disabled">
			<el-checkbox v-for="(ele, index) in item.options" :key="index" :label="ele.value">{{ ele.label }}</el-checkbox></el-checkbox-group
		>
		<!-- 单选框 -->
		<el-radio-group v-if="item.type == 'radio'" v-model="form[item.key]" :disabled="item.disabled">
			<el-radio v-for="(ele, index) in item.options" :key="index" :label="ele.value">{{ ele.label }}</el-radio></el-radio-group
		>
	</el-form-item>
</template>

<script>
export default {
	name: 'elform',
	data() {
		return {}
	},
	props: {
		item: {
			type: Object,
			default: () => ({})
		},
		form: {
			type: Object,
			default: () => ({})
		}
	},
	created: function() {},
	methods: {}
}
</script>

<style lang="scss">
.el-form-block {
	.box-address-flex{
		display: flex;
		display: flex;
		.box-address-input {
			flex: 1;
		}
		.box-address-btn {
			margin-left: 5px;
			width: 50px;
		}
	}
}

</style>
