<template>
	<div>
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
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
    			<Form-item label="分公司" v-if="mode==1&&enable_company" class="col-sm-3">
					<Select v-model="dpt_id" placeholder="按分公司过滤">
						<Option :value="-1">不限</Option>
						<Option v-for="item in companys" :value="item.dpt_id">{{item.dpt_name}}</Option>
					</Select>
				</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>

	            	<Button type="primary" icon="refresh" class="ml-1" :loading="saving" @click="generateData">刷新统计</Button>

	            	<export-button res="report_student_summarys" :params="report_params"></export-button>      	               	
                </Col>
            </Row>
		</div>
		<div class="box box-result">
			<div class="text-center mb-2">
				<RadioGroup v-model="mode" type="button" v-if="enable_company">
					<Radio :label="1">按校区</Radio>
					<Radio :label="2">按分公司</Radio>
				</RadioGroup>				
			</div>
			<div class="toolbar">
				<filter-column :keys="column_keys"></filter-column>
			</div>
	        <div class="content">
                <div class="content-body">
                    <Table 
	                    v-loading.like="'report_student_summarys'" 
	                    height="530"
	                    :stripe="true" 
	                    :show-header="true" 
	                    :data="mode==1?filterData:data1" 
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
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectClass from 'c%/SelectClass.vue'
	import ExportButton from 'c%/ExportButton.vue'
	import selectLesson from 'c%/SelectLesson.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			SelectEmployee,
			SelectClass,
			ExportButton,
			selectLesson
		},
		data() {
			return {
				rest_api: 'report_student_summarys',
				mode: 1,
				dpt_id: -1,
				data1: [],
				isRefresh: false,
				autoRefresh: false,
				search_field: {
					int_day: util.recent_month_range(1),
					eid: 0
				},
				column_keys: {
					dept_id: {
						title: '分公司',
						align: 'center',
						show: false
					},
					bid: {
                        title: '校区',
                        show: true,
                        sortable: 'bid'
					},
					course_arrange_times: {
						title: '排课次数',
						width: 250,
						show: true,
					},
					course_arrange_student_times: {
						title: '排课人次数',
						show: true,
					},
					course_arrange_student_nums: {
						title: '排课人数',
						show: true,
					},
					student_attendance_times: {
						title: '出勤人次数',
						show: true,
					},
					student_attendance_nums: {
						title: '出勤人数',
						show: true,
					},
					student_leave_times: {
						title: '请假人次数',
						show: true
					},
					student_leave_nums: {
						title: '请假人数',
						show: true
					}
				},
				column_render: {
					dept_id (h,params) {
						return h('span',this.$filter('dpt_name')(params.row.dept_id)||'总部')
					},
					eid(h, params) {
						return h('span',this.$filter('ename')(params.row.eid))
					},
					course_arrange_times (h,params) {
						return this.setClickRow(h,params.row,'course_arrange_times')
					},
					course_arrange_student_times (h,params) {
						return this.setClickRow(h,params.row,'course_arrange_student_times')	
					},
					student_attendance_times (h,params) {
						return this.setClickRow(h,params.row,'student_attendance_times')	
					},
					student_leave_times (h,params) {
						return this.setClickRow(h,params.row,'student_leave_times')	
					}
				}
			}
		},
		watch:{
			mode: function (val) {
				this.column_keys.dept_id.show = val == 2
				this.column_keys.bid.show = val == 1
			}
		},
		mounted() {
			this.init_data()
			this.$store.commit('branchMultiMode')
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
			deal_data(res) {
				this.data = res.list
				this.data1 = res.list1
				this.search_field.int_day = [res.params.start_date,res.params.end_date]
				return res.list
			},
			performanceDetail (row,type) {				
				let mode = this.mode,
					search_field = this.search_field,
					id = row.id,
					rest_api = `report_student_summarys/${id}?type=${type}`,
					map_title = {'course_arrange_times':'排课次数','course_arrange_student_times':'排课人次数','student_attendance_times':'出勤人次数','student_leave_times':'请假人次数' },
					index = type.lastIndexOf('_'),
					table = type.substring(0,index)
										
				if(mode == 2){
					id = row.dept_id
					rest_api = `report_student_summarys/0?dept_id=${id}&type=${type}&start_date=${search_field.int_day[0]}&end_date=${search_field.int_day[1]}`
				}
				
				
				this.$Modal.open('reports/performance/performance-detail-modal.vue',{
					props: {
						intDay: search_field.int_day,
						id: row.id,
						type: type,
						table: table,
						deptId: mode==2?row.dept_id:-1
					}
				})
				.then(modal=>{
					modal
					.set('rest_api',rest_api)					
					.show(map_title[type])
				})
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
				if(this.isRefresh){
					params['refresh'] = 1
				}

				delete params['pagesize']
				delete params['page']

				this.isRefresh = false 
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.dpt_id = -1
				this.init_data()
			},
			generateData() {
				this.isRefresh = true
				this.get_data()
			},
			get_data() {
				if(!this.checkDate()) return
				this.init_data()
			},
			checkDate() {
				if(this.search_field.int_day[0] === '') {
					this.$Message.error('时间段不能为空')
					return false
				}
				return true
			}
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
			companys() {
				let departments = util.copy(this.$store.state.gvars.departments),
	        		ret = []
        		function findParent(data,pid,ret,d) {
        			let parent = data.find(item => item.dpt_id==pid)
					if(parent) {
						if(parent.dpt_type==2) {
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
        			if(d.dpt_type==2) {
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
			filterData() {
				if(this.dpt_id == -1) {
					return this.data
				}
				let company = this.companys.find(item => item.dpt_id == this.dpt_id)
				return this.data.filter(item => company.children.indexOf(item.bid)>-1)
			},
		}
	}
</script>
