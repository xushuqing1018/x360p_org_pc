<template>
	<Tabs>
		<TabPane label="储值卡">
			<debit-list></debit-list>
		</TabPane>
		<TabPane label="学员储值卡记录">
			<buy-history></buy-history>
		</TabPane>
	</Tabs>
</template>
<script>
	import DebitList from './debit/debit-list.vue'
	import BuyHistory from './debit/student-debit-history.vue'
	export default {
		components: {
			DebitList,
			BuyHistory
		}
	}
</script>