<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="500">
		<Form ref="form" :model="info" :label-width="80">
			<Form-item label="签单类型" class="custom-form-item-required">
				<Select v-model="info.consume_type" clearable>
					<Option v-for="item in consume_types" :value="item.value">{{item.label}}</Option>
				</Select>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import util from '@/libs/util'
	export default {
		mixins: [modal,common],
		props: {
			data: {
				type: Object,
				default(){
					return {}
				}
			}
		},
		data() {
			return {
				info: {
					consume_type:0
				}
			}
		},
		methods: {
			onModalOpen() {
				this.info.consume_type = this.data.consume_type
			},
			ok() {
				
				this.$rest('employee_receipts').add_url_param(this.data.erc_id)
				.put(this.info)
				.success(res => {
					this.$Message.success('修改成功')
					this.$emit('on-success')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>