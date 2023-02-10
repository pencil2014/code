<template>
  <div>
    <el-button style="padding: 0;" class="underline" type="text" size="mini" @click="lookFileList">查看</el-button>
    <el-button v-if="item.showUploadBtn" class="underline" type="text" size="mini" @click="uoloadFile">上传</el-button>
  </div>
</template>

<script>
export default {
  props:{
    item:{
      type:Object,
      default:()=>{
        return {}
      }
    },
    param:{
      type:Object,
      default:()=>{
        return {}
      }
    },
    scope: {
      type:Object,
      default:()=>{
        return {}
      }
    }
  },
  methods:{
    lookFileList(){
      this.item.viewMethod(this.scope.$index,this.scope.row)
    },
    uoloadFile(){
      this.item.uploadFileMethod(this.scope.$index,this.scope.row)
    },
  }
}
</script>

<style>

</style>