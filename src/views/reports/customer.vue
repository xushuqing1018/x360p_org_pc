<template>
    <div class="c-grid">
    	<Tabs v-model="current_tab">
    		<!-- <TabPane label="客户分析" name="stats">
    			<customer-stats v-if="current_tab=='stats'"></customer-stats>
    		</TabPane>
    		<TabPane label="销售漏斗" name="funnel">
    			<customer-sales-funnel v-if="current_tab=='funnel'"></customer-sales-funnel>
    		</TabPane>
    		<TabPane label="转化率分析" name="analysis">
    			<customer-status-analysis v-if="current_tab=='analysis'"></customer-status-analysis>
    		</TabPane>
    		<TabPane label="转介绍统计" name="intro">
    			<customer-intro-count v-if="current_tab=='intro'"></customer-intro-count>
    		</TabPane> -->
			<TabPane label="校区到访业绩" name="arrive">
				<branch-performance v-if="current_tab=='arrive'"></branch-performance>
			</TabPane>
			<TabPane label="招生来源统计" name="origin">
				<customer-origin v-if="current_tab=='origin'"></customer-origin>
			</TabPane>
			<TabPane label="市场渠道业绩" name="channel">
				<market-channel v-if="current_tab=='channel'"></market-channel>
			</TabPane>
			<TabPane label="来源业绩统计" name="source">
				<source-performance v-if="current_tab=='source'"></source-performance>
			</TabPane>
    	</Tabs>
    </div>
</template>
<script>
	import CustomerStats from './customer/customer-stats.vue'
	import CustomerSalesFunnel from './customer/customer-sales-funnel.vue'
	import CustomerIntroCount from './customer/customer-intro-count.vue'
	import CustomerStatusAnalysis from './customer/customer-status-analysis.vue'
	import BranchPerformance from './customer/branch-performance.vue'
	import CustomerOrigin from './customer/customer-origin.vue'
	import MarketChannel from './customer/market-channel.vue'
	import SourcePerformance from './customer/source-performance.vue'
	export default {
		components: {
			CustomerStats,
			CustomerSalesFunnel,
			CustomerIntroCount,
			CustomerStatusAnalysis,
			BranchPerformance,
			CustomerOrigin,
			MarketChannel,
			SourcePerformance,
		},
		data() {
			return {
				current_tab: 'arrive'
			}
		},
		methods: {
			
		}
	}
</script>