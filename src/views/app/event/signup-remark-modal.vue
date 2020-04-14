<template>
	<Modal v-model="modal$.show" v-drag-modal :title="modal$.title" :mask-closable="false" :width="600">
		<Form :label-width="80" v-if="modal$.show">
			<Form-item label="备注">
				<Input v-model="info.remark" placeholder="请输入备注..." type="textarea" :autosize="{ minRows:4,maxRows:5 }"></Input>
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
	
	export default{
		mixins: [ common, modal ],
		data () {
			return {
				info: {}
			}
		},
		methods: {
			ok () {
				this.$rest('event_sign_ups')
				.add_url_param(this.info.esu_id)
				.put(this.info)
				.success(data=>{
					this.$Message.success('修改备注成功！')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'修改备注失败~')
				})
			}
		}
	}
</script>

<style>
</style>