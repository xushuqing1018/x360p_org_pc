<template>
	<div class="c-grid">
		<Tabs type="card" v-model="current_tab">
			<TabPane label="签单回款汇总" name="total">
	            <performance-total v-if="current_tab=='total'"></performance-total>
	        </TabPane>
			<TabPane label="签单明细" name="performance">
				<performance v-if="current_tab=='performance'"></performance>
			</TabPane>
	        <TabPane label="回款明细" name="receipt">
	            <receipt v-if="current_tab=='receipt'"></receipt>      
	        </TabPane>
		</Tabs>
	</div>
</template>
<script>
    import PerformanceTotal from './performance-total.vue'
	import receipt from './receipt.vue'
    import performance from './performance.vue'
	export default {
		components: {
			PerformanceTotal,
			performance,
			receipt,
		},
		data() {
			return {
				current_tab: 'total'
			}
		}
	}

</script>