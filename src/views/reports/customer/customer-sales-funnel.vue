<template>
    <div>
    	<div class="box box-query">
    		<div class="row">
				<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form col-md-3 col-sm-6">
					<Form-item label="时间段" prop="int_day">
						<date-range-picker 
							:value="search_field.int_day" 
							@on-change="search_field.int_day=$event" 
							:clearable="false"
							label="请选择时间段" 
							placement="bottom"
							style="width:100%">
						</date-range-picker>					
					</Form-item>
				</Form>
				<div class="mt-2 col-md-3 col-sm-6">
	                <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
	                <Button type="primary" icon="refresh" @click="resetSearch" class="ml-1">重置</Button>
	            	<Button type="primary" icon="ios-download-outline" v-per="'reports.export'" class="ml-1" @click="exportExcel('销售漏斗')">导出</Button>  
	           </div>
           </div>			
		</div>
		<div class="box box-result">
	        <div class="content">
				<div class="content-body">
			        <funnel-chart ref="ref_funnel" :loading="loading"></funnel-chart>
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
                    v-loading.like="'report_customers'" 
                    ref="tableExcel"
                    :pageSize="pageSize" 
                    :page="pageIndex" 
                    :stripe="true" 
                    :show-header="true" 
                    :data="data" 
                    :columns="columns" 
                    :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
                    :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
                    @on-sort-change="sortChange"
                    > 
                    </Table>
                </div>
            </div>
	    </div>
    </div>
</template>
<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import FunnelChart from './funnel-chart.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			FunnelChart
		},
		data() {
			return {
				rest_api: 'report_customers?group=bid,customer_status_did',
				search_field: {
					int_day: util.recent_month_range(1),
				},
				chart_data: {},
				column_keys: {},
				column_render: {
					bid(h,params) {
						return h('span',this.$filter('branch_name')(params.row.bid))
					}
				}
			}
		},
		mounted() {
			this.formatColumn()
			this.init_data()
		},
		methods: {
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
			deal_data (data) {
				return this.formatData(data)
			},
			formatColumn () {
				let column = {}
				column.bid = {
					title: '校区',
					show: true
				}
				this.cs_list.forEach(item => {
					let key = item.did + item.title
					column[key] = {
						title: item.title,
						show: true
					}
					this.chart_data[key] = 0
				})
				column['0未指定'] = {
					title: '未指定',
					show: true
				}
				column.total = {
					title: '总计',
					show: true
				}
				this.chart_data['0未指定'] = 0
				this.column_keys = column
			},
			formatData (data) {
				let group = [],copy = []
				let cs_list = this.$store.state.gvars.dicts['customer_status']
				for(let prop in this.chart_data) {
					this.chart_data[prop] = 0
				}
				data.list.forEach(i => {
					let key = ''
					let branch_obj = group.find(g => g.bid == i.bid)
					let cs_obj = cs_list.find(l => l.did == i.customer_status_did)
					if(cs_obj) {
						key = i.customer_status_did + cs_obj.title
					}else{
						key = i.customer_status_did + '未指定'
					}
					if(branch_obj) {
						branch_obj[key] = i.subtotal
						branch_obj.total += i.subtotal
					}else{
						let obj = {}
						cs_list.forEach(l => {
							obj[l.did + l.title] = 0
						})
						obj.bid = i.bid
						obj.total = 0
						obj['0未指定'] = 0
						obj[key] = i.subtotal
						obj.total += i.subtotal
						group.push(obj)
					}
					this.chart_data[key] += i.subtotal
				})
				this.$r('ref_funnel').set('chart_data',this.formatChartData(this.chart_data))
				return group
			},
			formatChartData(data) {
				let obj = {},legend = []
				obj.data = Object.values(data)
				Object.keys(data).forEach(i => {
					legend.push(i.replace(/[0-9]/g,''))
				})
				obj.legend = legend
				return obj
			}
		},
		computed: {
			cs_list() {
				return this.$store.state.gvars.dicts['customer_status']
			}
		}
	}
</script>