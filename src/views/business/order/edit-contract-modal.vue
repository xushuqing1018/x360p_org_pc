<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="500">
		<Form ref="form" :model="info" :label-width="80">
			<Form-item label="合同号" class="custom-form-item-required">
				<Input v-model="info.user_contract_no" placeholder="请输入合同号"></Input>
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
		mixins: [modal,common],
		data() {
			return {
				info: {}
			}
		},
		methods: {
			ok() {
				if(!this.info.user_contract_no) {
					this.$Message.error('合同号不能为空')
					return
				}
				this.$rest('orders').add_url_param(this.info.oid)
				.put(this.info)
				.success(res => {
					this.$Message.success('修改合同号成功')
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