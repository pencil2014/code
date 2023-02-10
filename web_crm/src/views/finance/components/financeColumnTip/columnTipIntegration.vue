<template>
<div>
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
      <div v-if="item.componentProps.callback" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height: 16px;">
        <el-tooltip :content="row[item.prop + '_multiValue'].filter(v=>v!=='null').join('')" placement="top">
            <!-- 详情页内，单个跳转基本没有下划线 -->
            <!-- class="underline" -->
          <span
            v-for="(subItem, index) in row[item.prop + '_multiValue'].filter(v=>v!=='null')"
            :key="item.prop + '_multiValue' + index"
            style="color:#1890ff;"
            @click="item.componentProps.row = row;item.componentProps.callback(subItem, item.componentProps, index, row);"
          >{{subItem}}</span>
        </el-tooltip>
        <!-- <span
          v-for="(subItem, index) in row[item.prop + '_multiValue'].filter(v=>v!=='null')"
          :key="item.prop + '_multiValue' + index"
          style="color:#1890ff;"
          class="underline"
          @click="item.componentProps.row = row;item.componentProps.callback(subItem, item.componentProps, index, row);"
        >{{subItem}}</span> -->
      </div>
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
      @mouseenter="($event) => {item.componentProps.show = true;item.componentProps.event = $event;item.componentProps.data = row[item.prop + '_multiValue'];item.componentProps.row = row;currentComponent = item.component;componentProps = item.componentProps;}"
      @mouseleave="() => {item.componentProps.show = false;}"
    >{{row[item.prop + '_multiValue'].filter(v=>v!=='null').join(',')}}</div>
  </template>
  <component :is="currentComponent" :component-props="componentProps">
  </component>
</div>
</template>
<script>
export default {
  props: {
    item: {
      type: Object,
      default: {}
    },
    row: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      currentComponent: '',
      componentProps: {}
    }
  }
}
</script>
