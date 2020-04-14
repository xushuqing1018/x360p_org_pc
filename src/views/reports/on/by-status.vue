<template>
	<div>
		<div class="box box-query">
			<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row" v-if="mode=='month'">
    			<Form-item label="时间段" prop="int_day" class="col-md-3 col-sm-6">
    				<date-range-picker 
						v-model="search_field.int_day" 
						@on-change="init_data"
						label="请选择时间段" 
						placement="bottom"
						:clearable="false"
						style="width:100%"
						>
					</date-range-picker>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">
                	<Button type="primary" icon="refresh" @click="search">刷新</Button>
	            	<export-button res="report_student_by_status" :params="params"></export-button>
					<ButtonGroup class="pull-right">
						<Button :type="mode=='current'?'primary':'ghost'" @click="mode='current'">当前</Button>
						<Button :type="mode=='month'?'primary':'ghost'" @click="mode='month'">按月份</Button>
					</ButtonGroup>
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
                    v-loading.like="'report_student'" 
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
	import Vue from 'vue'
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import ExportButton from 'c%/ExportButton.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectEmployee,
			ExportButton
		},
		data() {
			return {
				rest_api: 'report_student_by_status',
				search_field: {
					int_day: util.recent_month_range(1),
				},
				mode: 'current',
				column_keys_month: {
					bid: {
						title: '校区',
						width: 250,
						show: true,
						align: 'center'
					},
					new_student_count: {
						title: '新增学员数',
						show: true,
						sortable:'status_1',
						align: 'center'
					},
					lesson_stop_student_count: {
						title: '停课学员',
						show: true,
						align: 'center'
					},
					quit_school_student_count: {
						title: '结课学员',
						show: true,
						align: 'center'
					}
				},
				column_keys_current: {
					bid: {
						title: '校区',
						width: 250,
						show: true,
						align: 'center'
					},
					status_1: {
						title: '正常学员',
						show: true,
						sortable:'status_1',
						align: 'center'
					},
					status_50: {
						title: '结课学员',
						show: true,
						sortable:'status_50',
						align: 'center'
					},
					status_20: {
						title: '停课学员',
						show: true,
						sortable:'status_20',
						align: 'center'
					},
					status_30: {
						title: '休学学员',
						show: true,
						sortable:'status_30',
						align: 'center'
					},
					status_90: {
						title: '退学学员',
						show: true,
						sortable:'status_90',
						align: 'center'
					},
					status_100: {
						title: '封存学员',
						show: true,
						sortable:'status_100',
						align: 'center'
					},
					total: {
						title: '总学员',
						show: true,
						sortable:'total',
						align: 'center'
					},
				},
				column_render: {
					status_1 (h,params) {
						return this.setClickRow(h,params.row,'status_1')
					},
					status_20 (h,params) {
						return this.setClickRow(h,params.row,'status_20')
					},
					status_50 (h,params) {
						return this.setClickRow(h,params.row,'status_50')
					},
					status_30 (h,params) {
						return this.setClickRow(h,params.row,'status_30')
					},
					status_90 (h,params) {
						return this.setClickRow(h,params.row,'status_90')
					},
					status_100 (h,params) {
						return this.setClickRow(h,params.row,'status_100')
					},
					new_student_count(h,params) {
						return this.setClickRow(h,params.row,'new_student_count')
					},
					lesson_stop_student_count(h,params) {
						return this.setClickRow(h,params.row,'lesson_stop_student_count')
					},
					quit_school_student_count(h,params) {
						return this.setClickRow(h,params.row,'quit_school_student_count')
					}
				}
			}
		},
		watch: {
			mode(v) {
				if(v == 'current') {
					this.rest_api = 'report_student_by_status'
					this.column_keys = this.column_keys_current
				}else{
					this.rest_api = 'report_student_details/get_student_count'
					this.column_keys = this.column_keys_month
				}
				this.init_data()
			}
		},
		mounted() {
			this.column_keys = this.column_keys_current
			this.init_data()
			// this.$store.commit('branchSingleMode')
		},
		methods: {
			setClickRow (h,row,field) {
				let result = h('span',row[field])
				
				if(parseInt(row[field]) > 0){
					result = h('span',{
						'class': 'text-info cursor',
						on:{
							'click': () => {
								if(this.mode == 'current') {
									this.performanceDetail(row,field)
								}
								else {
									this.performanceMonthDetail(row,field)
								}
							}
						}
					},row[field])
				}
				
				return result	
			},
			performanceMonthDetail (row,field) {				
				let	rest_api = '',
					splits = field.split('_'),
					name = splits.slice(0,splits.length-1).join('_')
				
				rest_api = `report_student_details/${name}`

				this.$Modal.open('reports/on/student-modal.vue',{
					props: {
						search_field: {
							int_day: this.search_field.int_day,
							bid: row.bid
						}
					}
				})
				.then(modal=>{
					modal
					.set('rest_api',rest_api)
					.show(this.column_keys[field].title)
				})
			},
			performanceDetail (row,type) {				
				let mode = this.mode,
					search_field = this.search_field,					
					rest_api = '',
					status = type.split('_')[1]					
				
				rest_api = `report_student_by_status/${row.bid}?status=${status}`
				
				this.$Modal.open('reports/performance/performance-detail-modal.vue',{
					props: {
						intDay: search_field.int_day,
						exportParams: {
							type: type,
							table: 'student',
							branch_id: row.bid,
							status: status
						}
					}
				})
				.then(modal=>{
					modal
					.set('rest_api',rest_api)					
					.show(this.ss_map[status].text)
				})
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'&&this.mode=='month'){
						if(property!=','&&property.length>0){
							params.start_date = property[0]
							params.end_date = property[1]
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
			},
			generateData() {
				let params = {
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
				this.init_data()
			},
		},
		computed: {
			
		}
	}
</script>