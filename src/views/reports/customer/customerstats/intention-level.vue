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
	            	<export-button res="report_customer_by_intentions" :params="params"></export-button>
	           </div>
           </div>			
		</div>
		<div class="box box-result">
	        <div class="content">
				<div class="content-body">
					<intention-chart :data="chartData" :loading="loading"></intention-chart>
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
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import IntentionChart from './intention-chart.vue'
	import ExportButton from 'c%/ExportButton.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			IntentionChart,
			ExportButton
		},
		data() {
			return {
				rest_api: 'report_customers?group=intention_level',
				search_field: {
					int_day: util.recent_month_range(1),
					from_did: []
				},
				column_keys: {
					intention_level: {
						title: '意向级别',
						show: true
					},
					subtotal: {
						title: '客户数量',
						show: true
					},
					nums_rate: {
						title: '比例',
						show: true
					},
					transfer_nums: {
						title: '转化成功',
						show: true
					},
					transfer_rate: {
						title: '转化率',
						show: true
					}
				},
				column_render: {
					intention_level(h,params) {
						return h('Rate',{
							props: {
									value: params.row.intention_level,
									disabled: true
								}
							}
						)
					},
					nums_rate(h,params) {
						let total = 0
						this.data.forEach(i => {
							total += i.subtotal
						})
						return h('span',(util.div(params.row.subtotal,total)*100).toFixed(2)+'%')
					},
					transfer_rate(h,params) {
						return h('span',(util.div(params.row.transfer_nums,params.row.subtotal)*100).toFixed(2)+'%')
					}
				}
			}
		},
		mounted() {
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
					}else if(o=='from_did') {
						if(property!=','&&property.length>0) {
							params[o] = util.sprintf('[in,%s]',property.join(','))
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
			}
		},
		computed: {
			chartData() {
				let group = []
				this.data.forEach(item => {
					let obj = {}
					obj.value = item.subtotal,
					obj.name = item.intention_level.toString()
					group.push(obj)
				})
				return group
			}
		}
	}
</script>