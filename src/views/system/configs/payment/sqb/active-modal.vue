<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="550" :mask-closable="false">
		<Form :label-width="120" ref="form" :model="info">
			<Form-item label="AppId" prop="app_id" class="ivu-form-item-required">
				<Input v-model="info.app_id" readonly></Input>
			</Form-item>
			<Form-item label="激活码" prop="code" class="ivu-form-item-required">
				<Input v-model="info.code" placeholder="请输入激活码"></Input>
			</Form-item>
			<Form-item label="唯一设备码" prop="device_id" class="ivu-form-item-required">
				<Input v-model="info.device_id" placeholder="请输入唯一设备码"></Input>
			</Form-item>
        </Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	const emptyObject = {
		app_id: '',
		code: '',
		device_id: ''
	}
	
	export default{
		mixins: [modal,common],
		props: {
			data: {
				type: Object,
				default(){
					return {}
				}
			}
		},
		data () {
			return {
				info: util.copy(emptyObject)
			}
		},
		methods: {
			onModalOpen() {
				this.info.app_id = this.data.appid
			},
			ok () {
				if(this.info.code==='') {
					this.$Message.error('请输入激活码')
					return
				}
				if(this.info.device_id==='') {
					this.$Message.error('请输入唯一设备码')
					return
				}
				this.$rest('/wxapi/sqb_pay/activate')
				.post(this.info)
				.success(res => {
					this.$Message.success('激活成功')
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

<style>
</style>