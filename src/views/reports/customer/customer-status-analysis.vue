<template>
    <div>
    	<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="时间段" prop="int_day" class="col-md-3 col-sm-6">
					<date-range-picker 
						:value="search_field.int_day" 
						@on-change="search_field.int_day=$event" 
						:clearable="false"
						label="请选择时间段" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>					
				</Form-item>
				<Form-item label="转化过程" prop="old_value" class="col-md-2 col-sm-2" style="padding-right:0;">
					<Select v-model="search_field.old_value">
						<Option v-for="item in cs_list" :value="item.did">{{item.title}}</Option>
					</Select>
				</Form-item>
				<Form-item label="到" prop="new_value" :label-width="20" class="col-md-2 col-sm-2">
					<Select v-model="search_field.new_value">
						<Option v-for="item in cs_list" :value="item.did">{{item.title}}</Option>
					</Select>
				</Form-item>
			</Form>
           <Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<Button type="primary" icon="ios-download-outline" v-per="'reports.export'" @click="exportExcel('招生转化率分析')">导出</Button>              	
                </Col>
            </Row>
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
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker
		},
		data() {
			return {
				rest_api: 'report_customers/conversion_rate',
				search_field: {
					int_day: util.recent_month_range(1),
					old_value: '',
					new_value: ''
				},
				column_keys: {
					old_value: {
						title: '客户状态',
						show: true
					},
					count_follow_up: {
						title: '已跟进人数',
						show: true
					},
					count_advance: {
						title: '进阶人数',
						show: true
					},
					advance_rate: {
						title: '进阶率',
						show: true
					},
					count_transfer: {
						title: '转化人数',
						show: true
					},
					conversion_rate: {
						title: '转化率',
						show: true
					}
				},
				column_render: {
					old_value(h,params) {
						return h('span',this.labelDicts(params.row.old_value,'customer_status'))
					},
					advance_rate(h,params) {
						return h('span',(params.row.advance_rate*100).toFixed(2)+'%')
					},
					conversion_rate(h,params) {
						return h('span',(params.row.conversion_rate*100).toFixed(2)+'%')
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
							params['date_period'] = property.join(',')
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
			cs_list() {
				return this.$store.state.gvars.dicts['customer_status']
			}
		}
	}
</script>