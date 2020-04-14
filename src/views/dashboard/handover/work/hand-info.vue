<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="500">
		<Form :model="info" :label-width="120" ref="form" class="filter-form px-5">
			<Form-item label="交班总金额：">
				<span class="ml-4">{{label_currency}}{{info.amount}}</span>
			</Form-item>
			<Form-item label="现金部分：">
				<span class="ml-4">{{label_currency}}{{info.cash_total}}</span>
			</Form-item>
			<Form-item label="非现金部分：">
				<span class="ml-4">{{label_currency}}{{info.non_cash}}</span>
			</Form-item>
			<Form-item label="交班接收人：" prop="to_eid">
				<select-employee v-model="info.to_eid" style="width:200px" class="ml-4"></select-employee>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确认</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
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
				info: {}
			}
		},
		methods: {
			ok () {
				let param = {
					eid:this.eid$,
					to_eid:this.info.to_eid
				}
				if(this.info.hw_ids&&this.info.hw_ids.length>0) {
					param.hw_ids = this.info.hw_ids
				}
				if(this.info.to_eid == 0) {
					this.$Message.error('请选择交班接收人')
					return false
				}
				this.$rest('handover_works')
				.post(param)
				.success(res => {
					this.$Message.success('交班成功')
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