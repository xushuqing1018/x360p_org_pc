<template>
	<div class="module-view">
		<div class="row">
			<div class="col-md-6 pr-0">
				<div class="count-container" style="height: 450px;">
					<p>来源渠道分布</p>
					<ve-pie 
						:loading="loading"
						:data="customerChannelData" 
						:data-empty="customerChannelData.rows.length==0" 
						:settings="channelChartSettings">
					</ve-pie>
				</div>
			</div>
			<div class="col-md-6">
				<div class="count-container" style="height: 450px;">
					<p>市场名单转化</p>
					<ve-funnel 
						:loading="loading"
						:data="customerTransferData" 
						:data-empty="customerTransferData.rows.length==0" 
						:settings="transferChartSettings"
						style="width: 550px;margin: 0 auto;">
					</ve-funnel>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import 'echarts/lib/component/markLine'
  	import 'echarts/lib/component/markPoint'
	import CountUp from 'c%/CountUp.vue'
	import VePie from 'v-charts/lib/pie.common'
	import VeFunnel from 'v-charts/lib/funnel.common'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	
	export default {
		mixins: [grid,common],
		components: {
			CountUp,
			VePie,
			VeFunnel
		},
		mounted() {
			this.init_data()
		},
		methods: {
			deal_data(res) {
				this.customerChannelData.rows.splice(0)
				for(let key in res) {
					if(key == 'market_channel') {
						res[key].forEach(c => {
							this.customerChannelData.rows.push({
								channel: c.channel_name,
								nums: c.total_num
							})
						})
					}else{
						const map = {total_num:'市场名单数',valid_num:'有效数',visit_num:'上门数',deal_num:'成交数'}
						if(res[key] > 0 && key !== 'customer_num') {
							this.customerTransferData.rows.push({
								label: map[key],
								nums: res[key]
							})
						}
					}
				}
			}
		},
		data() {
			this.channelChartSettings = {
				radius: 130
			}
			this.transferChartSettings = {
				useDefaultOrder: true,
				filterZero: true
			}
			return {
				rest_api: 'overview/market_clue',
				customerTransferData: {
					columns: ['label','nums'],
					rows: []
				},
				customerChannelData: {
					columns: ['channel','nums'],
					rows: []
				}
			}
		}
	}
</script>