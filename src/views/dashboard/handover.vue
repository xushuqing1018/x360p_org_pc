<template>
	<Tabs v-model="tab">
		<TabPane label="待交班" name="wait-work">
			<wait-work v-if="tab=='wait-work'"></wait-work>
		</TabPane>
		<TabPane label="交班记录" name="record-work">
			<record-work v-if="tab=='record-work'"></record-work>
		</TabPane>
		<TabPane label="待交款" name="wait-money">
			<wait-money v-if="tab=='wait-money'"></wait-money>
		</TabPane>
		<TabPane label="交款记录" name="record-money">
			<record-money v-if="tab=='record-money'"></record-money>
		</TabPane>
	</Tabs>
</template>
<script>
	import WaitWork 	from './handover/work/wait.vue'
	import RecordWork	from './handover/work/record.vue'
	import WaitMoney  	from './handover/money/wait.vue'
	import RecordMoney  from './handover/money/record.vue'
	export default {
		components: {
			WaitWork,
			RecordWork,
			WaitMoney,
			RecordMoney
		},
		data() {
			return {
				tab: 'wait-work'
			}
		}
	}
</script>