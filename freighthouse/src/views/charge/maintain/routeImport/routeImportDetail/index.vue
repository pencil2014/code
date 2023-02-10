<template>
   <div class="routeImportDetail">
      <div class="components-container">
         <div class="filter">
            <span class="content">总共导入运价信息共有 {{titleData.totalRows}} 条</span>
            <el-checkbox @change='setCurrentSuccess' v-model="checked.success" >成功 <span style="color:#7BD269">{{titleData.importSuccessRows}}</span> 条</el-checkbox>
            <el-checkbox @change="setCurrentError" v-model="checked.error">失败 <span style="color:#E63923">{{titleData.importFailedRows}}</span> 条</el-checkbox>
             <el-button v-if="titleData.importFailedRows>0" style="float:right;" @click="handleExportError" size="mini" type="primary">
               <i class="el-icon-bottom"></i> 下载失败运价
            </el-button>
             <el-button @click="$router.push('/charge/maintain/routeImport')" style="float:right;margin-right:10px;" size="mini" >返回</el-button>
        </div>
         <el-table v-loading="loading" :data="tableData" border :row-class-name="tableRowClassName" >
            <el-table-column fixed width="55" align="center" type='index' label="序号">
            </el-table-column>
            <el-table-column fixed width="75" prop="routeId" align="center" label="线路编码" >
            </el-table-column>
            <el-table-column fixed width="85" align="center" label="状态">
               <template slot-scope="scope">
                  <span v-if="scope.row.importResult == 'success'" style="display: flex;"><i  class="icon-success"></i>成功</span>
                  <span v-if="scope.row.importResult == 'error'" style="display: flex;"><i  class="iocn-error"></i>失败</span>
               </template>
            </el-table-column>
            <el-table-column fixed width="" align="center" label="原因" :show-overflow-tooltip="true">
               <template slot-scope="scope">
                  <span>{{scope.row.checkDesc ? scope.row.checkDesc : '--'}}</span>
               </template>
            </el-table-column>
            <el-table-column v-for="(item,index) in routeTitleList" :key="index" width="120" align="center" :label="item.value" >
               <template slot-scope="scope">
                   <el-tooltip class="self-tootip">
                     <div slot="content">{{scope.row.routeInfo[item.key] ? scope.row.routeInfo[item.key] : '--'}}</div>
                     <span>{{scope.row.routeInfo[item.key] ? scope.row.routeInfo[item.key] : '--'}}</span>
                   </el-tooltip>
               </template>
            </el-table-column>
         </el-table>
      </div>
   </div>   
</template>

<script>
import { routeImportInfo, fileExportErrorList } from '@/api/charge/routeImport'
export default {
   name:"routeImportDetail",
   data(){
      return {
         loading: false,
         checked:{
            success:true,
            error:true
         },
         titleData:{},
         //表格
         tableData:[],
         tableDataList:[],
         total:0,
         //动态表头数组
         routeTitleList:[],
         importId: this.$route.query.id
      }
   },
   created(){
      this.getList();
   },
   methods:{
      // 查看成功勾选按钮
      setCurrentSuccess(value){
         if(this.checked.error == this.checked.success){
            this.tableData = this.tableDataList
         }else{
            if(value){
               this.tableData = this.filter('success')
            }else{
               this.tableData = this.filter('error')
            }
         }
      },
      // 查看失败勾选按钮
      setCurrentError(value){
         if(this.checked.error == this.checked.success){
            this.tableData = this.tableDataList
         }else{
            if(value){
               this.tableData = this.filter('error')
            }else{
               this.tableData = this.filter('success')
            }
         }
      },
      //过滤方法
      filter(value){
         let createdList =[]
         let list = this.tableDataList
         createdList = list.filter((item, index) => {
           return item.importResult === value
        })
        return createdList
      },
      getList(){
         this.loading = true;
         routeImportInfo({importId:this.importId}).then(res=>{
            for(let i in res.data){
               this.titleData[i] = res.data[i]
            }
            this.tableData = res.data.routeImportDetailList
            this.tableDataList = res.data.routeImportDetailList
            this.routeTitleList = res.data.routeTitleList
            this.loading = false;
         })
      },
      //下载失败
      handleExportError(){
       if(this.titleData.importResultFileNo){
               this.downloadErrorData(this.titleData.importResultFileNo,this.titleData.importResultFileName);
            }else {
               fileExportErrorList({importId:this.titleData.importId}).then(res=>{
                   if(res.code==0){
                      let {fileNo,name} = res.data;
                     this.titleData.importResultFileNo=fileNo
                     this.titleData.importResultFileName=name
                      this.downloadErrorData(fileNo,name);
                   }
               })
         }
      },
       downloadErrorData(fileNo,fileName){
        this.$store.dispatch('charge/downloadBlobFile', {
            uri: '/base/webapi/file/download',
            params: {
              fileNo: fileNo
            }
          }).then(res => {
            console.log(res);
            let link = document.createElement("a")
            link.href = window.URL.createObjectURL(res);
            link.download =fileName
            link.click()
        })
      },
      tableRowClassName({row, rowIndex}){
         if(row.importResult === 'error'){
            return 'warning-row';
         }
      }
   }
}
</script>

<style lang="scss" scoped>
.routeImportDetail{
  padding:20px;
  .components-container {
		padding: 20px;
		background-color: #fff;
		position: relative;
  }
  .filter{
		margin-bottom: 10px;
		// margin-top: 10px;
		height: 20px;
		.content{
			// margin-left:16px;
			margin-right:32px;
		}
		/deep/ .el-button--mini{
			padding: 2px 5px;
		}
  }
  /deep/ .el-table thead{
    color:#000000;
  }
  .iocn-error{
		display: inline-block;
		width: 16px;
		height: 16px;
		margin-right: 6px;
		background: url('../../../../../assets/icon-error.png') 0 0 no-repeat;
  }
  .icon-success{
		display: inline-block;
		width: 16px;
		height: 16px;
		margin-right: 6px;
		background: url('../../../../../assets/icon-success.png') 0 0 no-repeat;
  }
	/deep/ .el-table .warning-row {
    background-color: rgb(253,246,244);
  }
	/deep/ .el-table .success-row {
    background: #fff;
  } 
  .self-tootip{
		display: inline-block;
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}
</style>