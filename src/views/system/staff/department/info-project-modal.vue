<template>
  <Modal v-drag-modal :mask-closable="false" width="375" v-model="modal$.show" :title="modal$.title">
    <Form :label-width="80" ref="form" v-if="modal$.show">
      <Form-item label="项目名称"> 
				<Input placeholder="请输入项目名称" v-model="info.pj_name" style="width: 200px;" /> 
			</Form-item>
      <Form-item prop="charge_eid" label="项目负责人">
        <select-employee v-model="info.charge_eid" clearable></select-employee>
      </Form-item>
    </Form>
    <div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="submit_growth">提交</Button>
		</div>
  </Modal>
</template>

<script>
  import util from '@/libs/util'
	import globals from '@/libs/globals.mixin'
  import common from '@/libs/common.mixin'
  import grid from '@/libs/grid.mixin'
  import modal from '@/libs/modal.mixin'
  import SelectEmployee from 'c%/SelectEmployee'
  export default {
    mixins: [globals,grid,common,modal],
    components: {
			SelectEmployee
		},
    data () {
      return {
				info: {
          pj_name: "",
          pj_id:"",
          charge_eid:0
        }
      }
    },
    methods: {
      submit_growth () {
				if(this.info.pj_name == ""){
					this.$Message.info("项目名称不能为空")
					return false 
        }
        let method = this.modal$.action == 'add'?'post':'put'
				let action = this.modal$.action == 'add'?'添加':'编辑'
				let $rest = this.$rest("projects")
	      $rest[method](this.info)
	        .success(response=>{
	          let data = response.data
	          this.$Message.success(util.sprintf('%s成功!',action))
	          this.$emit('on-success')
	          this.close()
	      	})
	        .error(response=>{
	          this.error(response.body.message)
	        })
			},
    }

  }
</script>

