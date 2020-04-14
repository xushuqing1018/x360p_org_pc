<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="学员姓名" prop="sid" class="col-md-3 col-sm-6">
					<select-student v-model="search_field.sid" clearable></select-student>
				</Form-item>
				<Form-item label="缺勤日期" prop="int_day" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.int_day"
						@on-change="search"
						style="width:100%">
					</date-range-picker>
				</Form-item>
				<Form-item :label="label_teacher" prop="teach_eid" class="col-md-3 col-sm-6">
					<select-employee v-model="search_field.teach_eid" :rid="1"></select-employee>
				</Form-item>
				<Form-item label="班级" prop="cid" class="col-md-3 col-sm-6">
					<select-class v-model="search_field.cid"></select-class>
				</Form-item>
				<template v-if="searchExpand">
					<Form-item label="课程" prop="cid" class="col-md-3 col-sm-6">
						<select-class v-model="search_field.lid"></select-class>
					</Form-item>
					
				</template>							
			</Form>
			<Row class="basic">
                <Col span="6" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  

                	<export-button res="makeup_arranges" :params="params" v-per="'makeup.export'"></export-button>

                </Col>
           </Row>			
		</div>
		<div class="box box-result">
			<div class="toolbar">	
				<Button type="primary" @click="makeup" icon="plus">补课</Button>	
				<filter-column :keys="column_keys"></filter-column>
			</div>
			<div class="content">
				<div class="content-body">
		            <Table 
		            	v-loading.like="'makeup_arranges'" 
		            	ref="tableExcel"
		            	:data="data" 
		            	:stripe="true" 
		            	:page="pageIndex" 
		            	:columns="columns" 
		            	:show-header="true" 
		            	:page-size="pageSize" 
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
		<make-up-modal ref="makeup" @on-success="init_data"></make-up-modal>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import selectStudent from 'c%/SelectStudent.vue'
	import selectEmployee from 'c%/SelectEmployee.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import makeUpModal from './info-modal.vue'
	import selectClass from 'c%/SelectClass.vue'
	import selectLesson from 'c%/SelectLesson.vue'

	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			makeUpModal,
			selectStudent,
			selectEmployee,
			dateRangePicker,
			selectClass,
			selectLesson,
			ExportButton
		},
		data () {
			return {
				rest_api: 'makeup_arranges',
				pk: 'ma_id',
				search_field: {
					sid: 0,
					int_day: [],
					lesson_type: -1,
					teach_eid: 0,
					lid:0,
					cid:0				
				},
				column_keys:{
					bid:{
						title:'校区',
						show: false
					},
					pj_id:{
						title:'项目',
						show: false
					},
					sid: {
						title: '学员姓名',
						show: true
					},
					lid: {
						title: '课程/班级',
						show: true
					},
					sj_id: {
						title: '科目',
						show: false
					},
					int_day: {
						title: '上课时间',
						width:200,
						sortable: 'custom',
						show: true
					},
					time_section: {
						title: '时段',
						show: false
					},
					eid: {
						title: '上课'+this.$filter('translate')('老师'),
						show: true
					},
					attendance_status: {
						title: '状态',
						show: true
					},
					operate: {
						title: '操作',
						show: true,
						width: 80
					}
				},
				column_render: {
					sid (h,params) {
						return h('span',params.row.student.student_name)
					},
					lid (h,params) {
						let result = ''
						if(params.row.cid>0){
							result = params.row.one_class.class_name
						}else{
							result = this.$filter('lesson_name')(params.row.lid)
						}				
						
						return h('span',[result])
					},
					eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.eid))
					},
					int_day (h,params) {
						let makeup_text = util.sprintf('%s %s',
								this.$filter('int_date')(params.row.int_day),
								this.$filter('int_hour')(params.row.int_start_hour)
							)
						let children = []
						children.push(h('span',makeup_text))
						if(params.row.absence){
							if(params.row.absence.leave){
								let leave_text = util.sprintf('%s %s',
									this.$filter('int_date')(params.row.absence.leave.int_day),
									this.$filter('int_hour')(params.row.absence.leave.int_start_hour)
								)
								if(
									params.row.absence.leaves 
									&& params.row.absence.leaves.length > 0
								){
									params.row.absence.leaves.forEach(item=>{
										leave_text += util.sprintf(',%s %s',
											this.$filter('int_date')(item.int_day),
											this.$filter('int_hour')(item.int_start_hour)
											)
									})
								}
								children.push(h('p','补请假:'+leave_text))
							}else if(params.row.absence.absence){
								let absence_text = util.sprintf('%s %s',
									this.$filter('int_date')(params.row.absence.absence.int_day),
									this.$filter('int_hour')(params.row.absence.absence.int_start_hour)
								)
								children.push(h('p','补缺勤:'+absence_text))
							}
						}
						return h('div',children)
							
					},
					time_section (h,params) {
						let start_hour = this.$filter('int_hour')(params.row.int_start_hour),
							end_hour = this.$filter('int_hour')(params.row.int_end_hour)
						
						return h('span',util.sprintf('%s~%s',start_hour,end_hour))
					},
					attendance_status (h,params) {
						let row = params.row,
							classes = 'text-success',
							result = '已补课'
							
						if(row.satt_id==0){
							result = '待补课考勤'
							classes = 'text-info'
						}
						else{
							if(row.attendance!=null){								
								if(row.attendance.is_in===0){
									result = '缺勤未到'
									classes = 'text-danger'
								}
								if(row.attendance.is_leave==1){									
									result = '请假未到'
									classes = 'text-danger'
								}
							}							
						}
						return h('span',{'class':classes},result)
					},
					operate (h,params) {
						let row = params.row
						if(row.satt_id==0){
							return h('Button',{
								attrs: {
									title: '删除本条补课安排记录'
								},
								props: {
									type: 'text',
									icon: 'ios-trash'
								},
								on: {
									click: ()=>{
										this.delInfo(params.row)
									}
								}
							})
						}else{
							return h('span','-')
						}
					}
				}
			}
		},
		created(){
	        if(!this.enable_project){
	        	delete this.column_keys['pj_id']
	        }
		},
		mounted () {
			this.init_data()
		},
		methods: {
			delInfo (row) {
				let tip = util.sprintf('确认删除【%s】的补课安排记录吗？',row.student.student_name)
				this.confirm(tip).then(()=>{
					this.delete(row)
				})
			},
			makeup () {
				this.$r('makeup')
				.show('补课','add')
			},
			hook_get_param (params) {
				params.with = 'student,one_class,attendance'
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
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
		}
	}
	
</script>
