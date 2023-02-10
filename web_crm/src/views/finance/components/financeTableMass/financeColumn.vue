<template>
<span v-if="item.hidden && row.hidden"></span>
  <span v-else :class="[item.componentProps&&item.componentProps.tag?'text__left':'']">
    <div class="td_tag_div" v-if="item.hasTag">
      <span  v-for="tag in row._tagArr || []"  :key="tag.type">
        <img src="~@/assets/white.png" alt="" v-if="tag.img" style="width:18px;vertical-align: middle"/>
        <span v-else-if="tag.img_yellow">
          <el-tooltip v-if="tag.content"> 
          <div slot="content">{{tag.content}}</div>
            <img src="~@/assets/ylight.png" alt="" style="width:18px;vertical-align: middle"/>
          </el-tooltip>
        </span>
        <span v-else-if="tag.img_red">
          <el-tooltip v-if="tag.content"> 
          <div slot="content">{{tag.content}}</div>
            <img src="~@/assets/hlight.png" alt="" style="width:18px;vertical-align: middle"/>
          </el-tooltip>
        </span>
        <span v-else>
          <el-tooltip v-if="tag.content"> 
          <div slot="content">{{tag.content}}</div>
          <span
            class="finance-self-tag"
            :class="[tag.type]"
          >{{tag.text}}</span>
          </el-tooltip>
          <span v-else
            class="finance-self-tag"
            :class="[tag.type]"
          >{{tag.text}}</span>
        </span>
      </span>
    </div>
    <span v-if="item.popoverComponent && item.componentShow">
      <component :is="item.popoverComponent" :item="item" :param="row"> </component>
    </span>
    <span v-else-if="row.hasOwnProperty(item.prop + '_specialShow')">
      {{row[item.prop + '_specialShow']}}
    </span>
    <div v-else-if="item.type === 'taxRate'">
      <div v-if="option.edit && row.edit && !item.readOnly">
        <div v-if="row['receipayType'] === 'pay'">
          <el-select
            v-model="row[item.prop]"
            :placeholder="'请选择' || ''"
            :disabled="item.notAllowed || (item.bothDisabled && row.bothDisabled)"
          >
              <!-- v-for="(optionItem, j) in taxRateSelectOptions" -->
            <el-option
              v-for="(optionItem, j) in (dictMap.taxRateInfo || [])"
              :key="'select' + item.prop + j"
              :label="optionItem.label"
              :value="optionItem.value"
            ></el-option>
          </el-select>
        </div>
        <div v-else v-html="row[item.prop] ? row[item.prop] * 100 + '%' : ''"></div>
      </div>
      <div v-else v-html="row[item.prop] ? row[item.prop] * 100 + '%' : ''"></div>
    </div>
    <!-- textarea 不会显示只输入数字，取消number指令  -->
      <!-- v-lsNumber="{value:item.inputType, obj:row, key:item.prop, dot:item.dot}" -->
    <el-input
      v-else-if="item.type === 'textarea' && !item.isTooltip"
      type="textarea"
      class="finance-table-remark-textarea"
      :disabled="item.notAllowed || (item.bothDisabled && row.bothDisabled)"
      :placeholder="item.placeholder || '请输入'"
      clearable
      v-model="row[item.prop]"
      :maxlength="item.maxlength || 500"
      :show-word-limit="item.showWordLimit === false ? false : true"
      @input="(value) => {item.input && item.input(value, row, option); $forceUpdate()}"
      @change="(value) => {item.change && item.change(value, row, option, true)}"
    ></el-input>
    <!-- type === 'operationBtns'用于操作按钮位于表格中间某列的情况 -->
    <template v-else-if="item.type === 'operationBtns'">
      <template v-for="(subItem, index) in item.operationBtns.data">
        <span
          :key="'operationBtns' + index"
          class="operationbtns-wrapper"
          v-if="(subItem.show || subItem.showFn(row)) || (!subItem.showFn && row.edit)"
        >
          <el-button
            type="text"
            :style="item.style"
            @click.stop="item.operationBtns.callback(subItem.action, rowIndex, row, option, item)"
          >{{subItem.label}}</el-button>
        </span>
      </template>
    </template>
    <!-- FinanceTableMss不支持换行，FinanceTable也将不支持，type为button且有multiValue或orderNoBtn属性需迁移到columnTip类型 -->
    <!-- 保持单行，且单行的固定列和中间列的高度一直，如input高度等于文本cell的高度 -->
    <template v-else-if="item.type === 'button'">
      <!-- 各类单号按钮，和文字按钮差异较大，简化配置，分离出来 -->
      <!-- 字符串转数组，此方法放在配置里比数据返回时加_multiValue字段更直观便捷 -->
      <!-- item.orderNoBtn === true 时是默认的方法，返回的格式是逗号给开的字符串，如果不是此格式，则需定义orderNoBtn为函数 -->
      <template
        v-if="item.orderNoBtn"
        :class="{orderNoBtns:(item.orderNoBtn===true?row[item.prop].split(','):item.orderNoBtn(row[item.prop])).length>1}"
      >
        <span @click.stop="item.callback&&item.callback(row[item.prop], row)" style="color:#1890ff;" class="underline">{{row[item.prop]}}</span>
      </template>
      <template v-else-if="item.operationBtns && item.operationBtns.data && item.operationBtns.data.length > 0">
        <div v-if="row[item.prop] && row[item.prop][0] === '*'">全部</div>
        <div v-else-if="row[item.prop] && row[item.prop][0] && row[item.prop][0].value === '*'">{{row[item.prop][0].label}}</div>
        <template v-else-if="row[item.prop] && row[item.prop] !== ''">
          <span
            style="color:#1890ff;"
            class="underline fin-table-type-button"
            :style="item.operationBtns.style"
            v-for="(subItem, index) in item.operationBtns.data"
            :key="'itemOperationBtns' + index"
            @click.stop="item.operationBtns.callback(subItem.action, rowIndex, row, option, item)"
          >{{subItem.label}}</span>
        </template>
        <div v-else>无</div>
      </template>
      <template v-else-if="item.callback">
        <span
          v-if="item.no__line&&item.no__line(row,row[item.prop])"
          v-html="item.formatter ? item.formatter({row}) : row[item.prop]"
        ></span>
        <span
          v-else
          style="color:#1890ff;"
          class="underline"
          @click.stop="item.callback(row, item.prop)"
          v-html="item.formatter ? item.formatter({row}) : row[item.prop]"
        ></span>
      </template>
      <template v-else>
        <!-- FinanceTableMss不支持换行，FinanceTable也将不支持，type为button且有multiValue需迁移到columnTip类型 -->
        <template v-if="row[item.prop + '_multiValue']">
          <!-- 多个a或span标签可显示ellipsis
          <span
            style="color:#1890ff;"
            class="underline"
          >123456789012</span>,
          <span
            style="color:#1890ff;"
            class="underline"
          >456789012123</span>, -->
          <span>{{row[item.prop + '_multiValue'].join(',')}}</span>
        </template>
        <template v-else>
          <span
            style="color:#1890ff;"
            class="underline"
            @click.stop="item.operationBtns.callback(item.action, rowIndex, row, option)"
            v-html="item.formatter ? item.formatter({cellValue: row[item.prop], row}) : row[item.prop]"
          ></span>
        </template>
      </template>
    </template>
    <!-- 统一ColumnTip按钮的配置 callback第三个参数设为0，表示row[item.prop]为数组时默认取数组内第一个元素-->
    <template v-else-if="item.component === 'ColumnTip'&&item.type !== 'columnTip'">
      <div v-if="!row[item.prop] || row[item.prop].indexOf(',')<0">
        <span
          style="color:#1890ff;"
          class="underline"
          @click="item.componentProps.row = row;item.componentProps.callback(row[item.prop], item.componentProps, 0, row, item);"
        >{{row[item.prop + '_multiValue']?row[item.prop + '_multiValue'][0]:row[item.prop]}}</span>
      </div>
      <div
        v-else
        class="finance-column-tip"
        @mouseenter="($event) => {item.componentProps.show = true;item.componentProps.event = $event;item.componentProps.data = row[item.prop + '_multiValue']?row[item.prop + '_multiValue']:row[item.prop].split(',');item.componentProps.row = row;item.componentProps.item = item;currentComponent = item.component;componentProps = item.componentProps;}"
        @mouseleave="() => {item.componentProps.show = false;}"
      >{{row[item.prop + '_multiValue']?row[item.prop + '_multiValue'].join(',')+'...':row[item.prop]+'...'}}</div>
    </template>
    <template v-else-if="item.type === 'columnTip'">
      <div
        v-if="item.componentProps.formatter"
        class="finance-column-tip"
        @mouseenter="($event) => {item.componentProps.show = true;item.componentProps.event = $event;item.componentProps.row = row;currentComponent = item.component;componentProps = item.componentProps;}"
        @mouseleave="() => {item.componentProps.show = false;}"
      >
        <template v-if="row[item.prop + '_multiValue']">
          <div>
            {{row[item.prop + '_multiValue'].filter(v=>v!=='null').join(',')}}
          </div>
        </template>
        <template v-else>
          <div>
            {{row[item.prop]==='null'?'':row[item.prop]}}
          </div>
        </template>
      </div>
      <template v-else-if="row[item.prop + '_multiValue']">
        <template v-if="row[item.prop + '_multiValue'].length <= 1">
          <template v-if="item.componentProps.callback">
            <span v-if="item.componentProps.tag && row._dataObj && Object.keys(row._dataObj).length" class="finance-self-tag drop outter">甩</span>
            <span
              v-for="(subItem, index) in row[item.prop + '_multiValue'].filter(v=>v!=='null')"
              :key="item.prop + '_multiValue' + index"
              style="color:#1890ff;"
              class="underline"
              @click="item.componentProps.row = row;item.componentProps.callback(subItem, item.componentProps, index, row, item);"
            >{{subItem}}</span>
          </template>
          <template v-else>
            <div
              v-for="(subItem, index) in row[item.prop + '_multiValue'].filter(v=>v!=='null')"
              :key="item.prop + '_multiValue' + index"
              type="text"
              style="text-align:center;"
            >{{subItem}}</div>
          </template>
        </template>
        <div
          v-else
          class="finance-column-tip"
          @mouseenter="($event) => {item.componentProps.show = true;item.componentProps.event = $event;item.componentProps.data = row[item.prop + '_multiValue'];item.componentProps.row = row;item.componentProps.item = item;currentComponent = item.component;componentProps = item.componentProps;}"
          @mouseleave="() => {item.componentProps.show = false;}"
        ><span v-if="item.componentProps.tag && row._dataObj && Object.keys(row._dataObj).length" class="finance-self-tag drop outter">甩</span>{{row[item.prop + '_multiValue'].filter(v=>v!=='null').join(',')}}</div>
      </template>
    </template>
    <div v-else-if="item.type === 'timeRange'" v-html="timeRangeRender(row,item)"></div>
    <!-- 自定义树级表格 -->
    <template v-else-if="option.multiRow">
      <template v-if="item.arrow">
        <i v-if="row[option.multiKey].length>1"
          class="el-icon el-icon-arrow-right"
          :class="{active:row.toggle}"
          @click.stop="()=>{row.toggle=!row.toggle}"
        ></i>
        {{row[item.prop]}}
      </template>
      <template v-else-if="item.multi">
        <div
          v-for="(child,index) in row[option.multiKey]"
          :key="index"
          :class="{noBorder:!row.toggle}"
          v-show="index==0||row.toggle"
          v-html="item.formatter&&item.formatter(child)||child[item.prop]"
        ></div>
      </template>
      <template v-else>{{row[item.prop]}}</template>
    </template>
    <span v-else-if="item.type === 'tooltip'"
      v-html="item.formatter ? item.formatter(row) : row[item.prop]">
    </span>
    <template v-else-if="item.type === 'remarksTooltip'">
      <span v-if="row.splitNo == 1" @click.stop="item.callback&&item.callback(row)" style="color:#1890ff;" class="underline">{{row[item.prop]}}</span>
      <span v-else-if="row.splitNo>1">{{row[item.prop]}}</span>
    </template>
    <template v-else-if="item.specialType === 'btnTooltip'">
      <el-tooltip :content="item.callback.content(row)" :disabled="!item.callback.active(row)" placement="top" effect="dark">
        <span :style="{color:item.callback.active(row)?'#1890ff':''}">{{column.formatter({ cellValue: row[item.prop], column, row })}}</span>
      </el-tooltip>
    </template>
    <el-link v-else-if="item.type==='link'"
      type="primary"
      :underline="true"
      @click="item.callback(row)"
    >{{row[item.prop]}}</el-link>
    <template v-else-if="item.type === 'tag' && item.formatter(row)">
      <span
        class="finance-self-tag"
        :class="[text.type]"
        v-for="text in item.formatter(row)"
        :key="text.type"
      >{{text.text}}</span>
    </template>
    <span v-else-if="item.type === 'text' || !item.type" :class="['ls_'+item.fontColor]"
      v-html="column.formatter({ cellValue: row[item.prop], column, row })">
    </span>
    <!-- 费用单 内部往来-大掌柜  _forceEdit 某一行可编辑状态下，行与列_forceEdit为true强制下拉框类型根据某个字段的值覆盖只读来判断是否渲染为下拉框 -->
    <div v-else-if="option.edit && row.edit && (row._forceEdit && item._forceEdit || !item.readOnly)"
      :class="{'finance-cell-suffix-cont': item.hasCellSuffix}"
      @click.stop>
      <el-input
        v-if="item.type === 'number'"
        type="number"
        :disabled="item.notAllowed || (item.bothDisabled && row.bothDisabled)"
        placeholder="请输入"
        v-model="row[item.prop]"
      ></el-input>
      <el-input
        v-else-if="item.type === 'input' && item.needTrim"
        v-lsNumber="{value:item.inputType,option,rowIndex,obj:row, key:item.prop, dot:item.dot, positive:item.positive,}"
        :disabled="item.notAllowed || (item.bothDisabled && row.bothDisabled)"
        :placeholder="item.placeholder || '请输入'"
        clearable
        v-model.trim="row[item.prop]"
        :maxlength="item.maxlength || 500"
        @input="(value) => {item.validateInput && item.validateInput(value, row, item); $forceUpdate()}"
        @change="(value) => {item.validateInput && item.validateInput(value, row, item, true)}"
        @keyup.native="(evt) => {option.handleKeyup && option.handleKeyup(evt, option, row, rowIndex)}"
        @blur="(evt) => {option.handleBlur && option.handleBlur(evt, option, row, rowIndex)}"
      ></el-input>
      <el-input
        v-else-if="item.type === 'input'"
        v-lsNumber="{value:item.inputType,option,rowIndex,obj:row, key:item.prop, dot:item.dot, positive:item.positive}"
        :disabled="item.notAllowed || (item.bothDisabled && row.bothDisabled)"
        :placeholder="item.placeholder || '请输入'"
        clearable
        v-model="row[item.prop]"
        :maxlength="item.maxlength || 500"
        @input="(value) => {item.validateInput && item.validateInput(value, row, item);item.input && item.input(value, row, item); $forceUpdate()}"
        @change="(value) => {item.validateInput && item.validateInput(value, row, item, true);item.change && item.change(value, row, item, option);}"
        @keyup.native="(evt) => {option.handleKeyup && option.handleKeyup(evt, option, row, rowIndex)}"
        @blur="(evt) => {option.handleBlur && option.handleBlur(evt, option, row, rowIndex, item.prop)}"
        @focus="() => {item.focus && item.focus(row, item);}"
      ></el-input>
      <el-autocomplete
        v-else-if="item.type === 'autocomplete'"
        v-model="row[item.prop]"
        :value-key="item.value ? item.value: 'value'"
        :placeholder="item.placeholder || '请选择'"
        popper-class="finance-autocomplete-suggestion"
        :clearable="item.clearable"
        :select-when-unmatched="true"
        :debounce="item.debounce || 300"
        :hide-loading="item.hideLoading === false ? false : true"
        :fetch-suggestions="(queryString, cb) => {item.querySearch && item.querySearch(queryString, cb, row, item)}"
        :disabled="item.notAllowed || (item.bothDisabled && row.bothDisabled)"
        @select="(value) => {item.select && item.select(value, row, item)}"
        @change="(value) => {item.change && item.change(value, row, item)}"
        @input="(value) => {item.input && item.input(value, row, item)}"
        @clear="() => {setBlur(row, item);item.clear && item.clear(row, item)}"
        @focus="() => {item.focus && item.focus(row)}"
      ></el-autocomplete>
      <div v-else-if="item.type === 'datePicker'" class="finance-table-datepicker">
        <el-date-picker
          v-model="row[item.prop]"
          type="date"
          placeholder="选择日期"
          :value-format="item.valueFormat"
          :disabled="item.notAllowed || (item.bothDisabled && row.bothDisabled)"
        ></el-date-picker>
      </div>
      <div v-else-if="item.type === 'dateRange'" class="finance-table-datepicker">
        <el-date-picker
          v-model="row[item.prop]"
          type="daterange"
          :value-format="item.valueFormat || ''"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :disabled="item.notAllowed || (item.bothDisabled && row.bothDisabled)"
        ></el-date-picker>
      </div>
      <div v-else-if="item.type === 'dateTimeRange'" class="finance-table-datepicker">
        <el-date-picker
          v-model="row[item.prop]"
          type="datetimerange"
          :value-format="item.valueFormat || ''"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :disabled="item.notAllowed || (item.bothDisabled && row.bothDisabled)"
        ></el-date-picker>
      </div>
      <div v-else-if="item.type === 'upload'">
          <!-- :drag="true" -->
        <el-upload
          class="finance-table-upload"
          action="str"
          :limit="item.limit || 1"
          :on-exceed="handleExceed"
          :file-list="row['fileList'] || []"
          :before-upload="(file) => { getFile(file, row) }"
          :on-change="(file, fileList) => { handleChangeFile(file, fileList, row) }"
          :on-remove="(file, fileList) => { handleRemove(file, fileList, row) }"
          :http-request="() => { handleImport(row) }"
          :disabled="item.notAllowed || (item.bothDisabled && row.bothDisabled)"
        >
          <el-button type="text" class="noselect" v-show="showUploadBtn" size="mini">点击上传</el-button>
        </el-upload>
      </div>
      <div v-else-if="item.type === 'select'" class="finance-table-select">
        <div v-if="!item.remote">
          <el-select
            v-model="row[item.prop]"
            :placeholder="item.placeholder || '请选择'"
            :filterable="item.filterable"
            :allow-create="item.allowCreate"
            :disabled="item.notAllowed || (item.bothDisabled && row.bothDisabled)"
            :multiple="item.multiple"
            :clearable="item.clearable"
            collapse-tags
            @change="(value) => {item.change && item.change(value, row , rowIndex, item); $forceUpdate()}"
            @visible-change="(value) => {if(value){item.visibleChange && item.visibleChange(item, row , rowIndex)}}"
            @clear="() => {item.clear && item.clear(row, item)}"
          >
            <template v-if="item.dependentParam && item.propInDictObj">
              <el-option
                v-for="(optionItem, j) in dictMap[item.propInDictObj[row[item.dependentParam]]]"
                :key="'select' + item.prop + j"
                :label="optionItem.label"
                :value="optionItem.value"
                :disabled="optionItem.disabled"
              ></el-option>
            </template>
            <template v-else>
              <el-option
                v-for="(optionItem, j) in (item.selectOptions || (item.propInDict && item.propInDict !== '' ? dictMap[item.propInDict] : (dictMap[item.prop]))) || []"
                :key="'select' + item.prop + j"
                :label="optionItem.label"
                :value="optionItem.value"
                :disabled="optionItem.disabled"
              ></el-option>
            </template>
          </el-select>
        </div>
        <el-select
          v-else
          v-model="row[item.prop]"
          :placeholder="item.placeholder || '请输入'"
          filterable
          remote
          :multiple="item.multiple"
          :clearable="item.clearable"
          :disabled="item.notAllowed || (item.bothDisabled && row.bothDisabled)"
          collapse-tags
          :remote-method="(queryString) => {item.remoteMethod && item.remoteMethod(queryString, item, row, index, option)}"
          @visible-change="(value) => {if(value){item.visibleChange && item.visibleChange('', item, row, index)}}"
          @change="(value) => {item.change && item.change(value, item, row, option); $forceUpdate()}"
          @clear="() => {item.clear && item.clear(row, item)}"
        >
          <el-option
            v-for="(optionItem, j) in item.remoteSelectList || []"
            :key="'select' + item.prop + j"
            :label="optionItem.label"
            :value="optionItem.value"
          ></el-option>
        </el-select>
      </div>
      <div v-else-if="item.type === 'variableType'">
        <div v-if="!row[item.dependentProp]"></div>
        <el-autocomplete
          v-else-if="item.data[row[item.dependentProp]].type === 'autocomplete'"
          v-model="row[item.data[row[item.dependentProp]].prop]"
          :value-key="item.data[row[item.dependentProp]].value ? item.data[row[item.dependentProp]].value: 'value'"
          :placeholder="item.placeholder || '请输入'"
          popper-class="finance-autocomplete-suggestion"
          :clearable="item.data[row[item.dependentProp]].clearable"
          :select-when-unmatched="true"
          :debounce="item.data[row[item.dependentProp]].debounce || 300"
          :hide-loading="item.data[row[item.dependentProp]].hideLoading === false ? false : true"
          :disabled="item.notAllowed || (item.bothDisabled && row.bothDisabled)"
          :fetch-suggestions="(queryString, cb) => {item.data[row[item.dependentProp]].querySearch && item.data[row[item.dependentProp]].querySearch(queryString, cb, row, item.data[row[item.dependentProp]])}"
          @select="(value) => {item.data[row[item.dependentProp]].select && item.data[row[item.dependentProp]].select(value, row, item.data[row[item.dependentProp]])}"
          @change="(value) => {item.data[row[item.dependentProp]].change && item.data[row[item.dependentProp]].change(value, row, item.data[row[item.dependentProp]])}"
          @clear="() => {setBlur(row, item.data[row[item.dependentProp]]);item.data[row[item.dependentProp]].clear && item.data[row[item.dependentProp]].clear(row, item)}"
          @focus="() => {item.data[row[item.dependentProp]].focus && item.data[row[item.dependentProp]].focus(row)}"
        ></el-autocomplete>
        <span v-else-if="item.data[row[item.dependentProp]].type === 'text'"
          v-html="column.formatter({ cellValue: row[item.prop], column, row })">
        </span>
      </div>
      <div
        v-if="item.hasCellSuffix"
        class="finance-cell-suffix"
        v-html="item.cellSuffixContent">
      </div>
    </div>
    <!-- 非编辑状态的文本显示，由column.formatter处理, 由div替换为span，利用div无法溢出显示省略号 -->
    <template v-else>
      <span v-html="column.formatter({ cellValue: row[item.prop], column, row, item })">
      </span>
    </template>
    <component :is="currentComponent" :component-props="componentProps">
    </component>
  </span>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    option: {
      type: Object,
      default: () => ({})
    },
    item: {
      type: Object,
      default: () => ({})
    },
    index: {
      type: Number,
      default: 0
    },
    row: {
      type: Object,
      default: () => ({})
    },
    column: {
      type: Object,
      default: () => ({})
    },
    rowIndex: {
      type: Number,
      default: 0
    },
  },
  data() {
    return {
      currentComponent: '',
      componentProps: {},
      showUploadBtn: true,
      defaultFileSize: 5,
    }
  },
  methods: {
    setBlur(row, item) {
      document.activeElement.blur()
      let propCode = item.prop.replace('Name', 'Code')
      let propEnName = item.prop.replace('Name', 'EnName')
      if (row.hasOwnProperty(propCode)) {
        row[propCode] = ''
      }
      if (row.hasOwnProperty(propEnName)) {
        row[propEnName] = ''
      }
    },
    handleExceed(files, fileList) {
      this.$message.warning(`只能选择 1 个文件！`)
    },
    handleRemove(file, fileList, row) {
      console.log(file, fileList)
      row.fileId = row.fileNo = ''
      this.showUploadBtn = true
    },
    // 上传前钩子获取file名
    getFile(file, row) {
      row.file = file
      let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
      if (!sizeLimit) {
        this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
      }
      return sizeLimit
    },
    handleChangeFile(file, fileList, row) {
      // row.fileList = fileList
      // console.log(row)
      // this.fileList = []
      // this.fileList.push(file)
    },
    handleImport(row) {
      // this.handleProgress()
      // 根据后台需求数据格式
      const form = new FormData()
      // 文件对象
      form.append('file', row.file)
      this.$store
        .dispatch('user/import', {
          uri: '/base/webapi/file/upload',
          params: form,
        })
        .then((res) => {
          if (res.data.code === 0) {
            if (res.data.data) {
              // this.resFileList.push(res.data.data)
              // row.fileId = res.data.data.fileNo
              row.fileNo = res.data.data.fileNo
              row.fileName = res.data.data.name
              row.fileId = res.data.data.oid
            }
            this.$message({
              type: 'success',
              message: '上传成功',
              duration: 1000,
            })
          } else {
            this.$message({
              type: 'error',
              message: res.data.msg,
              duration: 1000,
            })
            // row.fileList = []
            // console.log(row)
            // let elIconClose = this.financeTableUpload.getElementsByClassName('el-icon-close')[0]
            // elIconClose.style.display = 'block'
            // elIconClose.click()
          }
        })
    },
  },
  computed: {
    ...mapGetters(['dictMap']),
  }
}
</script>
<style lang="scss" scoped>
.text__left{
  text-align: left !important;
  display: inline-block;
  width: 100%;
  .finance-self-tag.drop.outter{
    margin-right: 6px;
  }
}
.el-autocomplete {
  width: 100%;
}
</style>