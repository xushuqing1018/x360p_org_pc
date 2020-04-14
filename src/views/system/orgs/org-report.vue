<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="80" class="filter-form row">
				<Form-item label="加盟商" prop="org_name" class="col-sm-3">
					<Input v-model="search_field.org_name" placeholder="加盟商名称"></Input>
				</Form-item>
				<Form-item label="时间段" prop="int_day" class="col-sm-3">
					<date-range-picker 
						v-model="search_field.int_day" 
						@on-change="search" 
						label="选择日期" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>					
				</Form-item>
			</Form>
			<Row class="basic">
	            <Col span="24" class="mt-2">
                    <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>  
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                	<export-button res="report_org_summarys" :params="report_params" v-per="'reports.export'"></export-button>
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
			        v-loading="'report_org_summarys'" 
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
			    <div class="content-footer">
			        <div class="pagenation">
			            <Page 
			            :total="total" 
			            :current="pageIndex" 
			            :show-sizer="true" 
			            :page-size="pageSize" 
			            :show-total="true" 
			            @on-change="pagenation" 
			            @on-page-size-change="pagesize"
			            >
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
	import common from '@/libs/common.mixin'
	import ExportButton from 'c%/ExportButton.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	export default{
		mixins: [grid,common],
		components: {
			ExportButton,
			DateRangePicker
		},
		data () {
			return {
				rest_api: 'report_org_summarys',
				search_field: {
					org_name: '',
					int_day: []
				},
				autoRefresh: false,
				column_keys: {
					org_name: {
						title: '机构名称',
						width: 100,
						show: true,
						fixed: 'left'	
					},
					join_int_day: {
						title: '加盟日期',
						width: 100,
						show: true
					},
					open_int_day: {
						title: '开业日期',
						width: 100,
						show: true
					},
					employee_nums:{
						title:'员工数量',
						width: 100,
						show: true
					},
					student_nums: {
						title: '学员总数',
						width: 100,
						show: true
					},
					lesson_hour_total: {
						title: '剩余课时',
						width: 100,
						show: true
					},
					money_total: {
						title: '剩余金额',
						width: 100,
						show: true	
					},
					channel_nums:{
						title:'渠道数量',
						width: 100,
						show: true
					},
					market_clue_nums: {
						title: '市场名单数',
						width: 100,
						show: true
					},
					followup_nums: {
						title: '有效沟通数',
						width: 100,
						show: true
					},
					promise_visit_nums: {
						title: '诺到人数',
						width: 100,
						show: true
					},
					trial_visit_nums:{
						title:'试听数量',
						width: 100,
						show:true
					},
					oi_student_type1_nums: {
						title: '新签学员',
						width: 100,
						show: true
					},
					oi_student_type2_nums: {
						title: '续报学员',
						width: 100,
						show: true
					},
					oi_student_type3_nums: {
						title: '扩科学员',
						width: 100,
						show: true	
					},
					recommend_student_nums:{
						title:'转介绍学员',
						width: 100,
						show: true
					},
					consume_lesson_hours: {
						title: '消耗课时数',
						width: 100,
						show: true
					},
					consume_lesson_amount: {
						title: '消耗金额',
						width: 100,
						show: true
					},
					income_total_amount: {
						title: '收费总金额',
						width: 100,
						show: true
					}		
				},
				column_render: {
					open_int_day(h,params) {
						return h('span',params.row.open_int_day||'-')
					},
					join_int_day(h,params) {
						return h('span',params.row.join_int_day||'-') 
					}
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			deal_data(res) {
				this.search_field.int_day = [res.params.start_date,res.params.end_date]
				return res.list
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
			}
		},
		computed: {
			report_params() {
				let params = {}
				let int_day = this.search_field.int_day
				if(int_day!=','&&int_day.length>0) {
					params = {
						start_date: int_day[0],
						end_date: int_day[1]
					}
				}
				return params
			}
		}
	}
</script>
