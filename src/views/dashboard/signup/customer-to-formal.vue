<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title">
		<Form :label-width="80">
			<Form-item class="mb-0" label="客户姓名：">
				{{info.name}}
			</Form-item>
			<Form-item class="mb-0" label="性别：">
				{{info.sex|sex}}
			</Form-item>
			<Form-item class="mb-0" label="年龄：">
				{{formatAge(info.birth_time)}}
			</Form-item>
			<Form-item class="mb-0" label="手机号：">
				{{info.first_tel}}
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定转为正式学员</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	export default{
		mixins: [ modal, common ],		
		data () {
			return {
				cu_id: 0,
				info: {}
			}
		},
		watch: {
			cu_id: function(val){
				this.getCustomer()
			}
		},
		methods: {
			formatAge(birth_time) {
				return util.age(birth_time)
			},
			getCustomer () {
				this.$rest('customers/'+this.cu_id)
				.get()
				.success(data=>{
					this.info = data.customer
				}).error(response=>{
					this.$Message.error(response.body.message||'获取用户信息失败~')
				})
			},
			ok () {
				this.$emit('on-ok',this.cu_id)
			}
		}
	}
	
</script>

<style>
</style>