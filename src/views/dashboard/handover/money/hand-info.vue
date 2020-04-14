<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="450">
		<Form ref="form" :label-width="180" :modal="info" class="filter-form">
			<Form-item label="交款总额：">
				<span class="ml-5">{{label_currency}}{{info.amount_total}}</span>
			</Form-item>
			<Form-item label="现金部分：">
				<span class="ml-5">{{label_currency}}{{info.cash_total}}</span>
			</Form-item>
			<Form-item label="非现金部分：">
				<span class="ml-5">{{label_currency}}{{info.non_cash}}</span>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确认</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	export default {
		mixins: [modal,common],
		components: {
			SelectEmployee
		},
		data() {
			return {
				info: {},
				param: {}
			}
		},
		methods: {
			ok () {
				this.$rest('handover_moneys')
				.post(this.param)
				.success(res => {
					this.$Message.success('交款成功')
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