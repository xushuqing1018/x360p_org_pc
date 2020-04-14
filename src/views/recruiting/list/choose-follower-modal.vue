<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :mask-closable="false" :width="600">
		<label style="width:120px;">选择跟进人：</label>
		<select-employee v-model="follow_eid" :rid="7" style="width: 400px;display: inline-block;"></select-employee>
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	
	export default{
		mixins: [ common, modal ],
		components: {
			SelectEmployee
		},
		data () {
			return {				
				follow_eid: 0,
				cu_ids:[]
			}
		},
		methods:{
			ok () {
				let params = {
					follow_eid: this.follow_eid,
					cu_ids: this.cu_ids
				}
				
				if(params.follow_eid == 0){
					this.$Message.error('请选择新的责任人')
					return
				}
				if(params.cu_ids.length == 0){
					this.$Message.error('请先选择公海里的客户')
					return
				}
				
				this.$rest('customers/outPublicSea')
				.post(params)
				.success(data=>{
					this.$Message.success('操作成功！')
					this.$emit('on-success')					
					this.close()
				}).error(response=>{
					this.error(response.body.message||'转出失败~')
				})				
			}
		}		
	}
	
</script>

<style>
</style>