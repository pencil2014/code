<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
     <TABLE WIDTH="100%">
        <TR>
          <TD WIDTH="50%">
            <H3>解析内容</H3>
            <TEXTAREA ID="text1" STYLE="width: 100%" ROWS=10></TEXTAREA>
          </TD>
          <TD WIDTH="50%">
            <H3>对比内容</H3>
            <TEXTAREA ID="text2" STYLE="width: 100%" ROWS=10></TEXTAREA>
          </TD>
        </TR>
      </TABLE>
      <DIV ID="outputdiv"></DIV>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import diff_match_patch from './diff_match_patch.js'
export default {
   data() {
     return {
      dialogConfig: {
				title: '托书解析错误详情',
				show: true,
        notShowClose: true,
				size: 'medium',
        btns: [
          { label: '关闭', action: 'Confirm' },
        ],
        width: '1200px'
			},
      timeoutValue: 1,
      editcostValue: 4,
      checkedValue: 'efficiency'
     }
   },
   props: {
    compareFileObj: {
      type: Object,
      default: () => {
        return {}
      }
    },
   },
   components: { BaseDialog },
   created() {},
   mounted() {
    this.$nextTick(() => {
      this.init()
      setTimeout(() => {
        this.launch()
      }, 1000)
    })
   },
   methods: {
    init() {
      document.getElementById('text1').innerHTML = this.compareFileObj.parseContent 
      document.getElementById('text2').innerHTML = this.compareFileObj.contrastContent
    },
    launch() {
      const dmp = new diff_match_patch()
      var text1 = document.getElementById('text1').value;
      var text2 = document.getElementById('text2').value;
      dmp.Diff_Timeout = parseFloat(this.timeoutValue);
      dmp.Diff_EditCost = parseFloat(this.editcostValue);

      var ms_start = (new Date()).getTime();
      var d = dmp.diff_main(text1, text2);
      var ms_end = (new Date()).getTime();

      if (this.checkedValue === 'semantic') {
        dmp.diff_cleanupSemantic(d);
      }
      if (this.checkedValue === 'efficiency') {
        dmp.diff_cleanupEfficiency(d);
      }
      var ds = dmp.diff_prettyHtml(d);
      document.getElementById('outputdiv').innerHTML = ds;
    },
    close(action, value, type) {
			this.$emit('close', action, value, type)
		},
    dialogCallback(action, done) {
			this.close('Confirm')
		},
   }
}
</script>

<style>

</style>