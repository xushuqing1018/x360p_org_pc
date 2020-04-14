<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="400">
		<Form :label-width="60">
			<Form-item label="分组名称">
				<Input v-model="info.name" placeholder="请输入"></Input>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	const emptyObject = {
		id: 0,
		name: '',
		count: 0
	}
	
	export default{
		mixins: [ modal,common ],
		data () {
			return {
				info: util.copy(emptyObject)
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val&&this.modal$.action=='add'){
					this.info = util.copy(emptyObject)
				}
			}
		},
		methods: {
			ok () {
				let action = this.modal$.action
				let [uri,method,msg] = action=='add'?['wxmp_tags','post','添加成功']:['wxmp_tags/'+this.info.id,'put','修改成功']
				if(/^\s*$/.test(this.info)){
					this.$Message.error('请输入分组名称')
					return
				}
								
				this.$rest(uri)[method](this.info)
				.success(data=>{
					this.$Message.success(msg)
					this.$emit('on-success',this.info)
					this.close()
				}).error(response=>{
					this.error(response.body.message||'操作失败')
					this.close()
				})
				
				
			}
		}
	}
</script>

<style>
</style>