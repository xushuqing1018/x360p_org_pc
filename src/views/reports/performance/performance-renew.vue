<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="80" class="filter-form row">
				<Form-item label="时间段" prop="int_day" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.int_day" 
						label="请选择时间段" 
						placement="bottom"
						style="width:280px"
						@on-change="init_data">
					</date-range-picker>					
				</Form-item>
				<Form-item label="校区" prop="bid" class="col-md-3 col-sm-6">
					<select-branch v-model="search_field.bid" clearable></select-branch>
				</Form-item>
				<Form-item label="人员" prop="eid" class="col-md-3 col-sm-6">
    				<select-employee v-model="search_field.eid" clearable placeholder="请选择员工"></select-employee>
    			</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-3" type="primary" @click="search" icon="ios-search">查询</Button>
					<Button type="primary" @click="refresh" icon="refresh">刷新</Button>
                	<export-button res="report_employee_performance_renews" :params="report_params" v-per="'reports.export'"></export-button>
                </Col>
            </Row>			
		</div>
		
		<div class="box box-result">
			<div class="content">				
				<div class="content-body" style="position: relative;">
					<Table 
						:border="true"
		            	:data="data" 
		            	:columns="columns" 
		            	:show-header="true" 
		            	@on-sort-change="sortChange"
		            	> 
		            </Table>
		            <Spin fix v-if="loading">
		            	<Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
		            	<div><span v-if="branchs.length>10">当前校区过多，</span>正在努力生成报表</div>
		            </Spin>
				</div>
				<div class="content-footer">
	                <Page 
	                size="small"
	                class="pull-right"
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
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ExportButton from 'c%/ExportButton.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectBranch from 'c%/SelectBranch.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	
	export default{
		mixins: [ grid, common, globals ],
		components: {
			SelectBranch,
			SelectEmployee,
			ExportButton,
			DateRangePicker
		},
		data () {
			return {
				rest_api: 'report_employee_performance_renews',					
				dpt_id: -1,
				isRefresh: true,
				autoRefresh: false,
				mode: 1,
				search_field: {
					bid: 0,
					int_day: [],
					eid: 0
				},
				column_keys: {
					bid: {
						title: '校区',
						align: 'center',
						show: true
					},
					eid: {
						title: '姓名',
						align: 'center',
						show: true
					},					
					total_student_nums: {
						title: '续费学员数',
						align: 'center',
						sortable: 'custom',
						show: true
					},
					total_amount:{
						title:'续费金额',
						align:'center',
						sortable:'custom',
						show:true
					},
					total_lesson_hours: {
						title: '续费课时数',
						align: 'center',
						sortable: 'custom',
						show: true
					}
				},
				column_render: {
					bid (h,params) {
						return h('span',this.$filter('branch_name')(params.row.bid,'-'))
					},
					eid (h,params) {
						return h('span',this.$filter('ename')(params.row.eid,'-'))
					},
					total_student_nums (h,params) {
						let result = h('span',params.row.total_student_nums)
						
						if(parseInt(params.row.total_student_nums) > 0){
							result = h('span',{
								'class': 'text-info cursor',
								on:{
									'click': () => {
										this.performanceDetail(params.row,'employee_receipt')
									}
								}
							},params.row.total_student_nums)
						}
						
						return result	
					}
				}
			}
		},
		watch: {
			
		},
		mounted () {
			this.init_data()
		},
		computed: {
			
		},
		methods: {
			refresh () {
				this.isRefresh = true
				this.init_data()
			},
			performanceDetail (row,type) {
				let search_field = this.search_field,
					map_table_name  = {1:'employee_receipt'},
					table = ''
					
				this.$Modal.open('reports/performance/performance-renew-detail-modal.vue',{
					props: {
						intDay: search_field.int_day,
						id: row.id,
						eid: row.eid,
						type: type,
						table: map_table_name[this.mode]
					}
				})
				.then(modal=>{
					modal
					.set('rest_api',`report_employee_performance_renews/${row.id}?type=${type}`)					
					.show('业绩详情 ')
				})
			},
			deal_data(res) {
				this.data = res.list
				this.search_field.int_day = [res.params.start_date,res.params.end_date]
				return res.list
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o == 'int_day'){
						if(property != ',' && property.length > 0){
							params['start_date'] = property[0]
							params['end_date']   = property[1]
						}												
					}else{
						if(property && property != -1){
							params[o] = property	
						}else{
							params.bid = -1
						}
					}									
				}
				if(this.isRefresh){
					params.refresh = 1
				}
				this.isRefresh = false
				// params.bid = -1
				// delete params['page']
				// delete params['pagesize']
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.search_field.bid = 0
				this.init_data()
			},
		}
	}
</script>