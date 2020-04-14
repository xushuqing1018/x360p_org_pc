<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" width="900">
		<div slot="header">
			<RadioGroup v-model="type" type="button">
				<Radio label="hours">课时转让记录</Radio>
				<Radio label="money">余额转让记录</Radio>
			</RadioGroup>
		</div>
		<transfer-hours v-if="type=='hours'"></transfer-hours>
		<transfer-money v-else></transfer-money>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import TransferHours from './transfer-hours-record.vue'
	import TransferMoney from './transfer-money-record.vue'
	export default{
		mixins: [modal],
		components: {
			TransferMoney,
			TransferHours
		},
		data() {
			return {
				type: 'hours'
			}
		}
	}
</script>