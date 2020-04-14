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
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-3" type="primary" @click="search" icon="ios-search">查询</Button>
					<Button type="primary" @click="refresh" icon="refresh">刷新</Button>
                	<export-button res="report_employee_performance_summarys" :params="report_params" v-per="'reports.export'"></export-button>
                </Col>
            </Row>			
		</div>
		
		<div class="box box-result">	
			<div class="text-center mb-3">
				<RadioGroup v-model="mode" type="button">
					<Radio :label="1">业绩</Radio>
					<Radio :label="2">确收</Radio>
				</RadioGroup>
			</div>
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
	
	export default{
		mixins: [ grid, common, globals ],
		components: {
			SelectBranch,
			ExportButton,
			DateRangePicker
		},
		data () {
			return {
				rest_api: 'report_employee_performance_summarys',					
				dpt_id: -1,
				isRefresh: true,
				autoRefresh: false,
				mode: 1,
				search_field: {
					bid: 0,
					int_day: []
				},
				column_keys: {
					bid: {
						title: '校区',
						align: 'center',
						show: true
					},
					eid: {
						title: '员工姓名',
						align: 'center',
						show: true
					},					
					performance_nums: {
						title: '签单数',
						align: 'center',
						sortable: 'custom',
						show: true
					},
					performance_student_nums:{
						title:'签单人数',
						align:'center',
						sortable:'custom',
						show:true
					},
					performance_amount_a: {
						title: '签单金额',
						align: 'center',
						sortable: 'custom',
						show: true
					},
					performance_amount: {
						title: '净业绩',
						align: 'center',
						sortable: 'custom',
						show: true
					},
					refund_nums:{
                        title: '退单数',
						align: 'center',
						sortable: 'custom',
						show: true
					},
					refund_amount: {
						title: '退单金额',
						align: 'center',
						sortable: 'custom',
						show: true
					},
					edu_lesson_amount: {
						title: '学管师业绩',
						align: 'center',
						sortable: 'custom',
						show: false
					},					
					edu_lesson_hours: {
						title: '课时数',
						align: 'center',
						sortable: 'custom',
						show: false
					},					
					teach_lesson_amount: {
						title: '教师业绩',
						align: 'center',
						sortable: 'custom',
						show: false
					},
					teach_lesson_hours: {
						title: '教师课时',
						align: 'center',
						sortable: 'custom',
						show: false
					},
					second_lesson_amount: {
						title: '助教业绩',
						align: 'center',
						sortable: 'custom',
						show: false
					},
					second_lesson_hours: {
						title: '助教课时',
						align: 'center',
						sortable: 'custom',
						show: false
					}
				},
				column_render: {
					bid (h,params) {
						return h('span',this.$filter('branch_name')(params.row.bid,'-'))
					},
					eid (h,params) {
						return h('span',this.$filter('ename')(params.row.eid,'-'))
					},
					performance_amount (h,params) {
						let result = h('span',params.row.performance_amount)
						
						if(parseInt(params.row.performance_amount) > 0){
							result = h('span',{
								'class': 'text-info cursor',
								on:{
									'click': () => {
										this.performanceDetail(params.row,'performance_amount')
									}
								}
							},params.row.performance_amount)
						}
						
						return result	
					},
					refund_amount (h,params) {
						let result = h('span',params.row.refund_amount)
						
						if(parseInt(params.row.refund_amount) > 0){
							result = h('span',{
								'class': 'text-info cursor',
								on:{
									'click': () => {
										this.performanceDetail(params.row,'refund_amount')
									}
								}
							},params.row.refund_amount)
						}
						
						return result	
					},
					edu_lesson_amount (h,params) {
						let result = h('span',params.row.edu_lesson_amount)
						
						if(parseInt(params.row.edu_lesson_amount) > 0){
							result = h('span',{
								'class': 'text-info cursor',
								on:{
									'click': () => {
										this.performanceDetail(params.row,'edu_lesson_amount')
									}
								}
							},params.row.edu_lesson_amount)
						}
						
						return result	
					},
					teach_lesson_amount (h,params) {
						let result = h('span',params.row.teach_lesson_amount)
						
						if(parseInt(params.row.teach_lesson_amount) > 0){
							result = h('span',{
								'class': 'text-info cursor',
								on:{
									'click': () => {
										this.performanceDetail(params.row,'teach_lesson_amount')
									}
								}
							},params.row.teach_lesson_amount)
						}
						
						return result	
					},
					second_lesson_amount (h,params) {
						let result = h('span',params.row.second_lesson_amount)
						
						if(parseInt(params.row.second_lesson_amount) > 0){
							result = h('span',{
								'class': 'text-info cursor',
								on:{
									'click': () => {
										this.performanceDetail(params.row,'second_lesson_amount')
									}
								}
							},params.row.second_lesson_amount)
						}
						
						return result	
					}
				}
			}
		},
		watch: {
			mode: function (val) {
				let map_fields = {
						1:['performance_amount','performance_nums','refund_nums','refund_amount'],
						2:['edu_lesson_amount','edu_lesson_hours','teach_lesson_amount','teach_lesson_hours','second_lesson_amount','second_lesson_hours']
					},
					hide_val = val==1?2:1
				
				map_fields[val].forEach(field=>{
					this.column_keys[field].show = true					
				})
				
				map_fields[hide_val].forEach(field=>{
					this.column_keys[field].show = false					
				})
			}
		},
		mounted () {
			this.init_data()
		},
		computed: {
			report_params() {
				let params = {}
				let int_day = this.search_field.int_day
				params.bid = this.search_field.bid
				if(int_day != ',' && int_day.length > 0) {
					params = {					
						type: this.mode,
						start_date: int_day[0],
						end_date: int_day[1]
					}
				}
				return params
			},
			companys() {
				let departments = util.copy(this.$store.state.gvars.departments),
	        		ret = []
        		function findParent(data,pid,ret,d) {
        			let parent = data.find(item => item.dpt_id==pid)
					if(parent) {
						if(parent.dpt_type == 2) {
							let company = ret.find(r => r.dpt_id==parent.dpt_id)
							if(company) {
								company.children.push(d.bid)
							}
						}else{
							findParent(data,parent.pid,ret,d)
						}
					}
        		} 
        		departments.forEach(d => {
        			if(d.dpt_type == 2) {
        				d.children = []
        				ret.push(d)
        			}
         		})
        		departments.forEach(d => {
        			if(d.dpt_type==1){
        				findParent(departments,d.pid,ret,d)
        			}
        		})
        		return ret
			},
		},
		methods: {
			refresh () {
				this.isRefresh = true
				
				this.init_data()
			},
			performanceDetail (row,type) {
				let search_field = this.search_field,
					map_table_name  = {1:'employee_receipt',2:'employee_lesson_hour'},
					table = ''
					
				this.$Modal.open('reports/performance/performance-detail-modal.vue',{
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
					.set('rest_api',`report_employee_performance_summarys/${row.id}?type=${type}`)					
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
				this.dpt_id = -1
				this.init_data()
			},
		}
	}
</script>

<style>
</style>