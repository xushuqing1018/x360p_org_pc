<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :title="modal$.title" width="450">
		<div>
			是否将客户【{{names.join(',')}}】删除！？
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button :loading="saving" type="error" @click="deleteCustomer(0)">删除</Button>
			<Button :loading="saving" type="error" @click="deleteCustomer(1)">同时删除市场名单</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [modal,common],
		props: {
			cuIds: {
				type: Array,
				default:() => {
					return []
				}
			},
			names: {
				type: Array,
				default:() => {
					return []
				}
			}
		},
		data() {
			return {
				
			}
		},
		methods: {
			deleteCustomer(type) {
				this.$http.post('customers/batch_delete',{
					cu_ids: this.cuIds,
					is_delete_mc: type
				})
				.then(res => {
					this.$Message.success('删除成功!')
					this.$emit('on-success')
					this.close()
				},res => {
					this.error(res.body.message||'删除失败~')
				})
			}
		}
	}
</script>