<template>
  <div class="selected-operation">
    <el-dropdown size="mini"
      @command="handleCommand">
      <el-button size="mini" plain>批量操作<i class="el-icon-arrow-down el-icon--right"></i></el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="(item, index) in multiOperate" :key="index" :command="item.action">
          {{item.label}}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  name: 'BtnMultiOperate',
  data() {
    return {
      dropdown: {},
      single: []
    }
  },
  props: {
    multiOperate: {
      type: Array,
      default: () => ([])
    },
    callback: {
      type: Function,
      default: () => ({})
    }
  },
  created() {
  },
  mounted() {
  },
  components: {
  },
  computed: {
  },
  methods: {
    handleCommand(command) {
      this.callback(command)
    }
  }
}
</script>

<style lang="scss">
@import '../less/table_layout.scss';
</style>
