<template>
	<div>
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item :label="label_teacher" prop="teach_eid" class="col-md-3 col-sm-6">
    				<select-employee :rid="1" v-model="search_field.teach_eid" clearable :placeholder="label_choose_teacher"></select-employee>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<Button type="primary" icon="refresh" class="ml-1" :loading="saving" @click="generateData">刷新统计</Button> 
	            	<export-button res="report_student_by_teachers" :params="ex_params"></export-button>     

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
                    v-loading="'report_student_by_teachers'"
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
				rest_api: 'report_student_by_teachers',
				// rest_api: 'report_students/employee',
				search_field: {
					// int_day: util.recent_month_range(1),
					teach_eid: 0
				},
				ex_params:{
	                search_field:'name',
	                search_value:'',
	                order_field:'',
	                order_sort:'',
	                last_search_value:'',
	            },
				column_keys: {
					teach_eid: {
						title: this.$filter('translate')('老师')+'姓名',
						width: 250,
						show: true,
						align:'center'
					},
					class_nums: {
						title: '班级数',
						show: true,
						sortable:'class_nums',
						align:'center'
					},
					class_student_nums: {
						title: '班级人数',
						show: true,
						sortable:'class_student_nums',
						align:'center'
					},
					onetoone_student_nums: {
						title: '一对一人数',
						show: true,
						sortable:'onetoone_student_nums',
						align:'center'
					},
					onetomore_student_nums: {
						title: '一对多人数',
						show: true,
						sortable:'onetomore_student_nums',
						align:'center'
					},
				},
				column_render: {
					teach_eid(h, params) {
						return h('span',this.$filter('ename')(params.row.teach_eid))
					},
					class_nums (h,params) {
						return this.setClickRow(h,params.row,'class_nums')
					},
					class_student_nums (h,params) {
						return this.setClickRow(h,params.row,'class_student_nums')
					},
					onetoone_student_nums (h,params) {
						return this.setClickRow(h,params.row,'onetoone_student_nums')
					},
					onetomore_student_nums (h,params) {
						return this.setClickRow(h,params.row,'onetomore_student_nums')
					}
				}
			}
		},
		mounted() {
			this.init_data()
			this.$store.commit('branchSingleMode')
		},
		methods: {
			setClickRow (h,row,field) {
				let result = h('span',row[field])
				
				if(parseInt(row[field]) > 0){
					result = h('span',{
						'class': 'text-info cursor',
						on:{
							'click': () => {
								this.performanceDetail(row,field)
							}
						}
					},row[field])
				}
				
				return result	
			},
			performanceDetail (row,field) {
				let search_field = this.search_field,					
					rest_api = `report_student_by_teachers/${row.teach_eid}?type=${field}`,
					map_title = {'class_nums':'班级数','class_student_nums':'班级人数','onetoone_student_nums':'一对一人数','onetomore_student_nums':'一对多人数'},
					map_table = {'class_nums':'class','class_student_nums':'class_student','onetoone_student_nums':'student','onetomore_student_nums':'student'},
					map_stype = {'onetoone_student_nums':1,'onetomore_student_nums':2}
				
				this.$Modal.open('reports/performance/performance-detail-modal.vue',{
					props: {
						intDay: search_field.int_day,						
						type: field,
						exportParams: {
							eid: row.teach_eid,
							table: map_table[field],
							stype: map_stype[field]
						}
					}
				})
				.then(modal=>{
					modal
					.set('rest_api',rest_api)					
					.show(map_title[field])
				})
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params['day'] = util.sprintf('[between,%s,%s]',
								this.$filter('format_int_day')(property[0]),
								this.$filter('format_int_day')(property[1]))
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