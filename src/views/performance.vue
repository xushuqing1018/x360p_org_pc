<template>
	<div class="c-grid">
		<Tabs v-model="tab">
			<TabPane name="receipt" label="签单业绩"></TabPane>
			<TabPane name="output" label="课时产出"></TabPane>
		</Tabs>
		<employee-receipt v-if="tab=='receipt'"></employee-receipt>
		<employee-output v-else></employee-output>
	</div>
</template>
<script>
	import EmployeeReceipt from './performance/receipt'
	import EmployeeOutput from './performance/output'
	export default {
		components: {
			EmployeeReceipt,
			EmployeeOutput
		},
		data() {
			return {
				tab: 'receipt'
			}
		}
	}
</script>