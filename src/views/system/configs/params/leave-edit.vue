<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="500">
		<Form :label-width="100" ref="form" :model="info">
			<Form-item prop="leave_nums_limit" label="允许请假">
				<InputNumber v-model="info.leave_nums_limit" :min="-2"></InputNumber>
				<span>次（-1为全局限制，0为不限制,-2为不允许请假）</span>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins:[modal,common],
		data() {
			return {
				info: {}
			}
		},
		mounted() {
			
		},
		methods: {
			ok() {
				this.$rest('lessons').add_url_param(this.info.lid)
				.put(this.info)
				.success(res =>{
					this.$emit('success')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>