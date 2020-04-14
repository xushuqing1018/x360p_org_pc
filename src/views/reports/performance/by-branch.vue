<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="60" class="filter-form row">
				<Form-item label="时间段" prop="int_day" class="col-sm-3">
					<date-range-picker 
						v-model="search_field.int_day" 
						label="请选择时间段" 
						placement="bottom"
						style="width:100%"
						@on-change="init_data">
					</date-range-picker>						
				</Form-item>
				<Form-item label="分公司" v-if="enable_company && mode == 1" class="col-sm-3">
					<Select v-model="dpt_id" placeholder="按分公司过滤">
						<Option :value="-1">不限</Option>
						<Option v-for="item in companys" :value="item.dpt_id">{{item.dpt_name}}</Option>
					</Select>					
				</Form-item>	
			</Form>
        	<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-3" type="primary" @click="search" icon="ios-search">查询</Button>
					<Button type="primary" @click="refresh" icon="refresh">刷新</Button>
					<export-button res="report_branch_performance_summarys" :params="report_params" v-per="'reports.export'"></export-button>
                </Col>
            </Row>
		</div>
		
		<div class="box box-result">		
			<div class="text-center mb-3" v-if="enable_company">
				<RadioGroup v-model="mode" type="button">
					<Radio :label="1">按校区</Radio>
					<Radio :label="2">按分公司</Radio>
				</RadioGroup>
			</div>
			<div class="content">				
				<div class="content-body" style="position: relative;">
					<Table 
						:border="true"
		            	:data="mode==1?filterData:data1" 
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
	
	export default{
		mixins: [ grid, common, globals ],
		components: {
			ExportButton,
			DateRangePicker
		},
		data () {
			return {
				rest_api: 'report_branch_performance_summarys',
				mode: 1,				
				dpt_id: -1,
				data1: [],
				isRefresh: false,
				autoRefresh: false,
				search_field: {
					int_day: []
				},
				column_keys: {
					bid: {
						title: '校区',
						align: 'center',
						show: true
					},
					dept_id: {
						title: '分公司',
						align: 'center',
						show: false
					},
					nums: {
						title: '签单数',
						align: 'center',
						sortable: 'custom',
						show: true
					},
					amount: {
						title: '签单金额',
						align: 'center',
						sortable: 'custom',
						show: true
					},
					refund_amount:{
                        title: '退单金额',
                        align:'center',
                        sortable:'custom',
                        show:true,
					},
					only_amount:{
                        title: '净金额',
                        align:'center',
                        show:true,
					},
					lesson_hours: {
						title: '确收课时',
						align: 'center',
						sortable: 'custom',
						show: true
					},
					lesson_amount: {
						title: '确收金额',
						align: 'center',
						sortable: 'custom',
						show: true
					},
					refund_nums:{
						title: '退单数',
						align:'center',
						sortable:'custom',
						show:true,
					},
					cut_amount:{
						title: '违约金额',
						align:'center',
						sortable:'custom',
						show:true,
					}
				},
				column_render: {
					bid (h,params) {
						return h('span',this.$filter('branch_name')(params.row.bid,'-'))
					},
					dept_id (h,params) {
						return h('span',this.$filter('dpt_name')(params.row.dept_id,'总部'))
					},
					amount (h,params) {
						let result = h('span',params.row.amount)
						
						if(parseInt(params.row.amount) > 0){
							result = h('span',{
								'class': 'text-info cursor',
								on:{
									'click': () => {
										this.performanceDetail(params.row,'amount')
									}
								}
							},params.row.amount)
						}
						
						return result	
					},
					lesson_amount (h,params) {
						let result = h('span',params.row.lesson_amount)
						
						if(parseInt(params.row.lesson_amount) > 0){
							result = h('span',{
								'class': 'text-info cursor',
								on:{
									'click': () => {
										this.performanceDetail(params.row,'lesson_amount')
									}
								}
							},params.row.lesson_amount)
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
					cut_amount (h,params) {
						let result = h('span',params.row.cut_amount)
						
						if(parseInt(params.row.cut_amount) > 0){
							result = h('span',{
								'class': 'text-info cursor',
								on:{
									'click': () => {
										this.performanceDetail(params.row,'cut_amount')
									}
								}
							},params.row.cut_amount)
						}
						
						return result	
					},
				}
			}
		},
		watch: {
			mode: function (val) {
				this.column_keys.bid.show = val == 1
				this.column_keys.dept_id.show = val == 2
			}
		},
		mounted () {
			this.init_data()
		},
		computed: {
			report_params() {
				let params = {}
				let int_day = this.search_field.int_day
				if(int_day != ',' && int_day.length > 0) {
					params = {
						type: this.mode,
						start_date: int_day[0],
						end_date: int_day[1]
					}
				}
				return params
			},
			filterData() {
				if(this.dpt_id == -1) {
					return this.data
				}
				let company = this.companys.find(item => item.dpt_id == this.dpt_id)
				return this.data.filter(item => company.children.indexOf(item.bid)>-1)
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
				let mode = this.mode,
					search_field = this.search_field,
					map_table_name = {'amount':'order_payment_history','lesson_amount':'student_lesson_hour','refund_amount':'employee_refund_receipt','cut_amount':'cut_amount'},					
					rest_api = `report_branch_performance_summarys/${row.id}?type=${type}&start_date=${search_field.int_day[0]}&end_date=${search_field.int_day[1]}`
					
				if(mode == 2){
					rest_api = `report_branch_performance_summarys/0?dept_id=${row.dept_id}&type=${type}&start_date=${search_field.int_day[0]}&end_date=${search_field.int_day[1]}`
				}
					
				this.$Modal.open('reports/performance/performance-detail-modal.vue',{
					props: {
						intDay: search_field.int_day,
						id: row.id,
						type: type,
						table: map_table_name[type],
						deptId: mode==2?row.dept_id:-1
					}
				})
				.then(modal=>{
					modal
					.set('rest_api',rest_api)					
					.show('业绩详情 ')
				})
			},
			deal_data(res) {
				this.data = res.list
				this.data1 = res.list1
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
						}		
					}									
				}
				if(this.isRefresh){
					params.refresh = 1
				}
				this.isRefresh = false
				delete params['page']
				delete params['pagesize']
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.dpt_id = -1
				this.init_data()
			},
		}
	}
</script>

<style>
</style>