<template>
	<div class="c-grid">
		<div class="box box-query">
			<label>时间范围：</label>
			<date-range-picker @on-change="init_data" v-model="search_field.create_time"></date-range-picker>
			<Button type="primary" @click="exportExcel('转化统计')" icon="ios-download-outline" class="ml-2" v-per="'reports.export'">导出</Button>
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<Button type="primary" icon="reply" @click="back" v-if="groupby=='eid'">返回上级</Button>
				<filter-column :keys="column_keys"></filter-column>
			</div>
			<div class="content">
				<div class="content-body">
		            <Table v-loading.like="'customer'" 
		            	ref="tableExcel"
		            	:page="pageIndex" 
		            	:page-size="pageSize" 
		            	:stripe="true" 
		            	:show-header="true" 
		            	:data="data" 
		            	:columns="columns" 
		            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		            	@on-sort-change="sortChange"> 
		            </Table>
		        </div>
		        <div class="content-footer">
		            <div class="pagenation">
		                <Page 
		                	:total="total" 
		                	:current="pageIndex" 
		                	:show-sizer="true" 
		                	:page-size="pageSize" 
		                	:show-total="true" 
		                	@on-change="pagenation" 
		                	@on-page-size-change="pagesize">
		                </Page>
		            </div>
		        </div>
			</div>
		</div>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			dateRangePicker
		},
		data () {
			return {
				rest_api: 'customers/do_stats?group=bid',
				pk: '',
				groupby: 'bid',
				search_field:{
					create_time: []
				},
				column_keys: {
					bid: {
						title: '校区',
						show: true
					},
					employee: {
						title: '姓名',
						show: false
					},
					customer_num: {
						title: '累计客户数',
						show: true
					},
					signup_num: {
						title: '转化数',
						show: true
					},
					rate: {
						title: '转化率',
						show: true
					},
					signup_amount: {
						title: '金额',
						show: true
					}
				},
				column_render: {
					bid (h,params) {
						let branch_name = this.$filter('branch_name')(params.row.bid)
						return h('a',{
							attrs: {
								'class':'x-a-link text-info'	
							},
							on: {
								click: ()=>{
									this.groupby = 'eid'
									this.groupBy(params.row)
								}
							}
						},branch_name)
					},
					employee (h,params) {
						let row = params.row,
							result = '其他'
						if(row.employee){
							result = row.employee.ename
						}
						return h('span',result)
					},
					rate (h,params) {
						let row = params.row,
							rate = parseFloat((row.signup_num/row.customer_num)*100).toFixed(2)
						
						return h('span',rate+'%')
					}
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			back () {
				this.groupby = 'bid'
				this.groupBy()
			},
			groupBy (row){
				if(this.groupby=='eid'){
					this.rest_api = 'customers/do_stats?group=follow_eid&bids='+row.bid
				}else{
					this.rest_api = 'customers/do_stats?group=bid'					
				}
				this.init_data()
				this.column_keys.bid.show = this.groupby=='bid'
				this.column_keys.employee.show = this.groupby=='eid'
			},
			hook_get_param (params) {
				let create_time = this.search_field.create_time
				if(create_time.length>0){
					params.create_time = util.sprintf('[Between,%s,%s]',create_time[0],create_time[1])
				}
			
			}
		}
	}
</script>

<style>
</style>