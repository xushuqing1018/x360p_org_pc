<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :mask-closable="false" :width="400">
		
		<Form v-if="modal$.show" :label-width="80">
			<Form-item label="原校区：">
				<Tag>{{info.bid|branch_name}}</Tag>
			</Form-item>
			<Form-item label="目标校区：">
				<select-branch v-model="new_bid" :limit-per="false"></select-branch>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectBranch from 'c%/SelectBranch.vue'
	
	const emptyObject = {
		bid: 0,
		sid: 0
	}
	
	export default{
		mixins: [ common, globals, modal ],
		components: {
			SelectBranch
		},
		data () {
			return {
				info: util.copy(emptyObject),
				new_bid: 0
			}
		},
		methods: {
			ok () {
				if(!this.new_bid){
					this.$Message.error('请选择目标校区')
					return
				}
				if(this.new_bid == this.info.bid){
					this.$Message.error('目标校区与当前校区一致，请选择其他校区')
					return
				}
				
				this.$rest('students').add_url_param(this.info.sid,'transfer_branch')
				.post({
					bid: this.new_bid
				})
				.success(data=>{
					this.$Message.success('转校成功！')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'转校失败~')
				})
			}
		}
	}
	
</script>

<style>
</style>