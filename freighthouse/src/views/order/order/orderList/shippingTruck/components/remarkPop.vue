<template>
  <BaseDialog :config="dialogConfig" :model="createItem" :callback="dialogCallback">
    <el-form ref="boxRemarkForm">   
      <el-form-item label="备注" prop="boxRemark">
        <el-row>
          <el-col :span="24">
            <el-input 
              ref="boxRemark"
              type="textarea" 
              size="mini" 
              placeholder="请输入" 
              clearable 
              v-model="createItem.boxRemark" 
              :rows="10" 
              :disabled="boxRemarkType === 'view'">
            </el-input>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '备注',
        show: true,
        size: 'medium'
        // width: "800px"
      },
      createItem: {
        boxRemark: this.boxRemark
      },
      autofocus: true,
    }
  },
  props: {
    boxRemark: {
      type: String,
      default: ''
    },
    boxRemarkType: {
      type: String,
      default: ''
    }
  },
  created() {
    // this.autofocus = true
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.boxRemark.focus()
    })
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    }),
  },
  watch: {
  },
  components: {
    BaseDialog
  },
  methods: {
    close(action, value) {
      this.$emit('close', action, value)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        if (this.boxRemarkType === 'view') {
          return this.close('Cancel')
        }
        this.close('Confirm', this.createItem)
      } else {
        this.close('Cancel')
      }
    }
  }
};
</script>

<style>
</style>
