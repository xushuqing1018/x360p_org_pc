<template>
    <div class="c-grid">
    	<div class="box box-query">
			<div class="row">
				<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form col-md-3 col-sm-6">
					<Form-item label="时间段" prop="int_day">
						<date-range-picker 
							v-model="search_field.int_day" 
							label="请选择时间段" 
							placement="bottom"
							style="width:100%">
						</date-range-picker>					
					</Form-item>					
				</Form>
				<div class="mt-2 col-md-6 col-sm-6">
	                <Button-group>
	                    <Button class="ml-2" type="primary" icon="ios-search" @click="get_data">查询</Button>
	                </Button-group>
	                <Button type="primary" icon="refresh" @click="resetSearch" class="ml-1">重置</Button>
	            	<Button type="primary" icon="ios-download-outline" class="ml-1" @click="exportExcel('运营总表')" v-per="'reports.export'">导出</Button>
	            	<Button type="primary" icon="refresh" class="ml-1" :loading="saving" @click="generateData">刷新统计</Button>	            	
	            </div>
	            <div class="mt-2 col-sm-12 text-right">
	           		<Button type="ghost" @click="linkOverview">返回</Button>	           	
	            </div>				
           </div>				
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<RadioGroup v-model="chart_type" type="button">
					<Radio label="bar"><Icon type="stats-bars"></Icon>  收支</Radio>
					<Radio label="line"><Icon type="ios-pulse"></Icon>  人数</Radio>
				</RadioGroup>
			</div>
	        <div class="content">
				<div class="content-body">
					<bar-chart :data="data" :loading="loading" v-show="chart_type==='bar'"></bar-chart>
					<line-chart :data="data" :loading="loading" v-show="chart_type==='line'"></line-chart>
			    </div>
		    </div>
	    </div>
		<div class="box box-result">
			<div class="toolbar">
	            <filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
				<div class="content-body">
			        <Table 
			        	ref="tableExcel"
				        v-loading.like="'report_summaries'" 
				        :page-size="pageSize" 
				        :page="pageIndex" 	
				        :stripe="true" 
				        :show-header="true" 
				        :data="data" 
				        :columns="columns" 
				        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
				        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
				        @on-sort-change="sortChange"> 
			        </Table>
			    </div>
		    </div>
	    </div>
    </div>
</template>
<script>
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import BarChart from './overview/bar-chart.vue'
	import LineChart from './overview/line-chart.vue'
	export default {
		mixins: [grid,common,globals],
		components: {dateRangePicker,BarChart,LineChart},
		data() {
			return {
				rest_api: 'report_summaries',
				search_field: {
					int_day: util.recent_month_range(1)
				},
				chart_type: 'bar',
				column_keys: {
					bid: {
						title: "校区",
						width: 250,
						show: true
					},
					sum_customer_num: {
						title: "意向客户数",
						show: true,
						sortable:"custom"
					},
					sum_order_num: {
						title: "报名数",
						show: true,
						sortable:"custom"
					},
					sum_lesson_hour_consume: {
						title: "消耗课时数",
						show: true,
						sortable:"custom"
					},
					sum_money_consume: {
						title: "消耗课时金额",
						show: true,
						sortable:"custom"
					},
					sum_lesson_hour_reward: {
						title: "教师课酬课时数",
						show: false,
						sortable:"custom"
					},
					sum_money_reward: {
						title: "教师课酬金额",
						show: false,
						sortable:"custom"
					},
					sum_income_total: {
						title: "收款合计",
						show: true,
						sortable:"custom"
					},
					sum_refund_total: {
						title: "退款合计",
						show: true,
						sortable:"custom"
					},
					sum_outlay_total: {
						title: "支出合计",
						show: true,
						sortable:"custom"
					}
				},
				column_render: {
					bid(h,params) {
						let c = []
						c.push(h('h5',{attrs:{class:'mb-1'}},this.$filter('branch_name')(params.row.bid)))
						c.push(h('p',util.sprintf('当前剩余课时数:%s',params.row.current_lesson_hour_remain)))
						c.push(h('p',util.sprintf('当前剩余课时金额:%s元',params.row.current_money_remain)))
						c.push(h('p',util.sprintf('当前欠款合计:%s元',params.row.current_arrearage_total)))
						return h('div',{
							attrs:{
								class:'name-cls'
							}
						},c)
					}
				}
			}
		},
		mounted() {
			this.get_data()
		},
		methods: {
			linkOverview () {
				this.$router.push('./overview')
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params['start_date'] = property[0]
							params['end_date']   = property[1]
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			generateData() {
				if(!this.checkDate()) return
				let date = this.search_field.int_day
				let params = {
					start_date: date[0],
					end_date: date[1]
				}
				this.$rest(this.rest_api)
				.post(params)
				.success(response => {
					this.get_data()
				})
				.error(response => {
					this.$Message.error(response.body.message)
				})
			},
			get_data() {
				if(!this.checkDate()) return
				this.init_data()
			},
			checkDate() {
				if(this.search_field.int_day[0] === '') {
					this.$Message.error('时间段不能为空')
					return false
				}
				return true
			}
		}
	}
</script>