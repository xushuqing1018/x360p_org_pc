<style lang="less">
	.module-view.iae-view {
		.count-container{
			 height: 350px;
			 .content {
			 	
			 }
		}
	}
</style>
<template>
	<div class="module-view iae-view">
		<div class="row">
			<div class="col-md-6 pr-0">
				<div class="count-container">
					<p class="clearfix mb-1">
						收入金额
						<RadioGroup v-model="income_type" type="button" size="small" class="pull-right">
							<Radio label="year">本年</Radio>
							<Radio label="total">累计</Radio>
						</RadioGroup>
					</p>
					<Row type="flex" align="middle">
						<Col span="12">
							<div class="count-bg">
								<count-up
									id-name="income"
									:end-val="income"
									icon-type="social-yen"
									:transform="false"
									color="#24D27D">
								</count-up>
							</div>
						</Col>
						<Col span="12">
							<ve-pie 
								height="300px"
								:loading="loading"
								:data="incomeData" 
								:data-empty="incomeData.rows.length==0"
								:settings="pieChartSettings">
							</ve-pie>
						</Col>
					</Row>
				</div>
			</div>
			<div class="col-md-6">
				<div class="count-container">
					<p class="clearfix mb-1">
						支出金额
						<RadioGroup v-model="payout_type" type="button" size="small" class="pull-right">
							<Radio label="year">本年</Radio>
							<Radio label="total">累计</Radio>
						</RadioGroup>
					</p>
					<Row type="flex" align="middle">
						<Col span="12">
							<div class="count-bg">
								<count-up
									id-name="expand"
									:end-val="payout"
									icon-type="social-yen"
									:transform="false"
									color="#FCA727">
								</count-up>
							</div>
						</Col>
						<Col span="12">
							<ve-pie 
								height="300px"
								:loading="loading"
								:data="expandData" 
								:data-empty="expandData.rows.length==0"
								:settings="pieChartSettings">
							</ve-pie>
						</Col>
					</Row>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-12">
				<div class="count-container" style="height: 400px">
					<p class="clearfix mb-1">
						收入/支出金额
						<RadioGroup v-model="iae_type" type="button" size="small" class="pull-right">
							<Radio label="day">按日期</Radio>
							<Radio label="month">按月份</Radio>
						</RadioGroup>
					</p>
					<ve-line 
						height="380px"
						:loading="loading"
						:data="iaeData" 
						:data-empty="iaeData.rows.length==0"
						:extend="extend" 
						:mark-line="markLine"
						:mark-point="markPoint"
						:settings="iae_type=='day'?dayChartSettings:monthChartSettings">
					</ve-line>
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
	import VeLine from 'v-charts/lib/line.common'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'

	export default {
		mixins: [grid,common],
		components: {
			CountUp,
			VePie,
			VeLine
		},
		mounted() {
			this.init_data()
		},
		methods: {
			deal_data(res) {
				res = this.transformDate(res)

				this.total_income = res.total_income
				this.total_payout = res.total_payout
				this.payout = this.year_payout = res.this_year_payout
				this.income = this.year_income = res.this_year_income
				this.iaeData.rows = this.tally_day_list = res.tally_day_list
				this.tally_month_list = res.tally_month_list
				const lists = ['this_year_tt_id_income_list','this_year_tt_id_payout_list','total_tt_id_income_list','total_tt_id_payout_list']
				lists.forEach(key=>{
					this[key].splice(0)
					res[key].forEach(l => {
						let obj = {
							type: this.mapGvarsText('tally_types','tt_id',l.tt_id,'name')||'其他',
							amount: l.total_amount
						}
						if(l.tt_id == 0) {
							this[key].push(obj)
						}else{
							this[key].unshift(obj)
						}
					})
				})
				this.incomeData.rows = this.this_year_tt_id_income_list
				this.expandData.rows = this.this_year_tt_id_payout_list
			}
		},
		watch: {
			'income_type':function(type) {
				if(type=='year') {
					this.income = this.year_income
					this.incomeData.rows = this.this_year_tt_id_income_list
				}else{
					console.log(this.total_income)
					this.income = this.total_income
					this.incomeData.rows = this.total_tt_id_income_list
				}
			},
			'payout_type':function(type) {
				if(type=='year') {
					this.payout = this.year_payout
					this.expandData.rows = this.this_year_tt_id_payout_list
				}else{
					this.payout = this.total_payout
					this.expandData.rows = this.total_tt_id_payout_list
				}
			},
			'iae_type':function(type) {
				if(type=='day') {
					this.iaeData.columns[0] = 'day'
					this.iaeData.rows = this.tally_day_list
				}else{
					this.iaeData.columns[0] = 'month'
					this.iaeData.rows = this.tally_month_list
				}
			}
		},
		data() {
			this.extend = {
				yAxis: {
					splitLine: {
						lineStyle: {
							color: ['#eee']
						}
					}
				}
			}
			this.pieChartSettings = {
				radius: 80,
				offsetY: 160
			}
			this.dayChartSettings = {
				labelMap: {
					day: '日期',
					income_amount: '收入金额',
					payout_amount: '支出金额'
				}
			}
			this.monthChartSettings = {
				labelMap: {
					month: '月',
					income_amount: '收入金额',
					payout_amount: '支出金额'
				}
			}
			this.markLine = {
		        data: [
		          	{
		            	name: '平均线',
		            	type: 'average'
		          	}
		        ]
	      	}
	      	this.markPoint = {
	        	data: [
		          	{
		            	name: '最大值',
		            	type: 'max'
		          	}
	        	]
	      	}
			return {
				rest_api: 'overview/tally',
				income_type: 'year',
				payout_type: 'year',
				iae_type: 'day',
				income: 0,
				payout: 0,
				total_income: 0,
				year_income: 0,
				total_payout: 0,
				year_payout: 0,
				total_tt_id_income_list: [],
				this_year_tt_id_income_list: [],
				total_tt_id_payout_list: [],
				this_year_tt_id_payout_list: [],
				tally_day_list: [],
				tally_month_list: [],
				incomeData: {
					columns: ['type','amount'],
					rows: []
				},
				expandData: {
					columns: ['type','amount'],
					rows: []
				},
				iaeData: {
					columns: ['day','income_amount','payout_amount'],
					rows: []
				}
			}
		}
	}
</script>