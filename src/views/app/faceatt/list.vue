<template>
    <div class="c-grid">
    	<div class="box box-query">
    		<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="学员姓名" prop="sid" class="col-md-3 col-sm-6">
    				<select-student v-model="search_field.sid" clearable></select-student>
    			</Form-item>
    			<Form-item label="课程" prop="lid" class="col-md-3 col-sm-6">
    				<select-lesson v-model="search_field.lid" clearable></select-lesson>
    			</Form-item>
    			<Form-item :label="label_teacher" prop="eid" class="col-md-3 col-sm-6">
    				<select-employee v-model="search_field.eid" :rid="1" clearable></select-employee>
    			</Form-item>
    			<Form-item label="助教" prop="second_eid" class="col-md-3 col-sm-6">
    				<select-employee v-model="search_field.second_eid":rid="2" clearable></select-employee>
    			</Form-item>
    			<template v-if="searchExpand">
	    			<Form-item label="班级" prop="cid" class="col-md-3 col-sm-6">
	    				<select-class v-model="search_field.cid" clearable></select-class>
	    			</Form-item>
	    			<Form-item label="科目" prop="sj_id" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.sj_id">
	    					<Option :value="0">不限</Option>
	    					<Option :value="item.sj_id" v-for="(item,index) in subjects" :key="index">{{item.subject_name}}</Option>
	    				</Select>
	    			</Form-item>
	    			<Form-item label="考勤时间" prop="int_day" class="col-md-3 col-sm-6">
	    				<date-range-picker v-model="search_field.int_day" @on-change="search" label="选择日期" placement="bottom" style="width:100%"></date-range-picker>
	    			</Form-item>
    			</template>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
                	<export-button res="student_attendances" :params="params"></export-button>
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
		            	v-loading.like="'student_attendances'" 
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
    </div>
</template>

<script>
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import selectClass from 'c%/SelectClass.vue'
	import selectLesson from 'c%/SelectLesson.vue'
	import selectStudent from 'c%/SelectStudent.vue'
	import selectEmployee from 'c%/SelectEmployee.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'

	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			selectClass,
			selectLesson,
			selectStudent,
			selectEmployee,
			dateRangePicker,

			ExportButton,
		},
		data () {
			return {
				rest_api: 'student_attendances',
				pk: 'att_id',
				current_row: null,
				search_field: {
					sid: 0,
					lid: 0,
					sj_id: 0,
					cid: 0,
					eid: 0,
					second_eid: 0,
					int_day: [],
					att_way: 4,
				},
				column_keys: {
					sid: {
						title: '学员',
						show: true
					},
					status: {
						title: '出勤状态',
						show: true
					},
					is_consume: {
						title: '课时',
						show: true
					},
					lid: {
						title: '课程',
						show: true
					},
					chapter_index: {
						title: '章节',
						show: false
					},
					sj_id: {
						title: '科目',
						show: false
					},
					grade:{
						title:'年级',
						show:false,
						sortable:'custom'
					},
					cid: {
						title: '班级',
						show: true
					},
					lesson_type: {
						title: '课程类型',
						show: true
					},
					eid: {
						title: '上课'+this.$filter('translate')('老师'),
						show: true
					},
					second_eid: {
						title: '助教',
						show: false
					},
					int_day: {
						title: '授课日期',
						sortable: 'custom',
						width:200,
						show: true
					},
					int_hour: {
						title: '上课时段',
						show: false
					},
					in_time: {
						title: '出勤时间',
						show: true,
						width:200,
						align: 'center'
					}
				},
				column_render: {
					sid (h,params) {
						let [student,student_name] = [params.row.student,'']
						
						if(student){
							student_name = student.student_name
						}
						return h('div',[
							
							h('span',student_name)	
						])
						
					},
					status(h,params) {
						let tag = {color:'green',text:'正常'}	
						
						if(params.row.is_in === 0){
							tag = {color:'red',text:'缺勤'}
						}						
											
						let result = [
							h('Tag',{
								props: {
									type: 'border',
									color: tag.color
								}
							},tag.text)
						]
						
						if(params.row.is_leave === 1){
							tag = {color:'red',text:'请假'}
							result.push(
								h('Tag',{
									props: {
										type: 'border',
										color: tag.color
									}
								},tag.text)
							)
						}	
						
						return h('div',result)
					},
					is_consume (h,params) {
						let tag = {color:'text-success',text:'已扣课时'}
						if(!params.row.is_consume){
							tag = {color:'text-danger',text:'未扣课时'}
						}

						return h('span',{attrs:{class:tag.color}},tag.text)
						
					},
					cid (h,params) {
						let [cls,class_name] = [params.row.cls,'']
						if(cls){
							class_name = cls.class_name
						}
						return h('span',class_name)
					},
					lesson_type (h,params) {
						let map_type = {0:'班课',1:'1对1',2:'1对多',3:'研学旅行团'}
						return h('span',map_type[params.row.lesson_type])
					},
					eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.eid))
					},
					second_eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.second_eid)||'未设置')
					},
					int_day (h,params) {
						let day_text = util.sprintf('%s %s~%s',
								this.$filter('int_date')(params.row.int_day),
								this.$filter('int_hour')(params.row.int_start_hour),
								this.$filter('int_hour')(params.row.int_end_hour)
							)
						let children = []
						if(params.row.is_makeup){
							children.push(h('span',{attrs:{style:'color:#f60'}},'补课:'))
						}
						children.push(h('span',day_text))
						
						
						if(params.row.makeup){
							if(params.row.makeup.leave){
								let leave_day = util.sprintf('%s %s~%s',
									this.$filter('int_date')(params.row.makeup.leave.int_day),
									this.$filter('int_hour')(params.row.makeup.leave.int_start_hour),
									this.$filter('int_hour')(params.row.makeup.leave.int_end_hour)
								)
								children.push(h('p',{attrs:{style:'color:#999'}},'请假:'+leave_day))
							}else if(params.row.makeup.absence){
								let absence_day = util.sprintf('%s %s~%s',
									this.$filter('int_date')(params.row.makeup.absence.int_day),
									this.$filter('int_hour')(params.row.makeup.absence.int_start_hour),
									this.$filter('int_hour')(params.row.makeup.absence.int_end_hour)
								)
								children.push(h('p',{attrs:{style:'color:#999'}},'缺勤:'+leave_day))
							}
						}

						return h('div',children)
						
					},
					int_hour(h,params) {
						return h('span',util.sprintf('%s~%s',this.$filter('int_hour')(params.row.int_start_hour),
							this.$filter('int_hour')(params.row.int_end_hour)))
					},
					time_section (h,params) {
						return h('div',[
									h('p',this.$filter('int_date')(params.row.int_day)),
									h('p',
										util.sprintf('%s--%s',
										this.$filter('int_hour')(params.row.int_start_hour),
										this.$filter('int_hour')(params.row.int_end_hour))
									)
								]
							)
					},
					in_time (h,params) {
						
						let result = '--'
						if(params.row.is_in==0||params.row.is_leave === 1){
							return result
						}
						let children = []
						children.push(h('span',params.row.in_time))
						if(params.row.is_late == 1){
							children.push(h('span',{attrs:{style:'color:#f60'}},'迟到'))
						}
						
						return h('div',children)					
					},
					left_time (h,params) {
						return h('span',this.$filter('int_hour')(params.row.left_time))
					},
					has_extra_consume(h,params) {
						return h('span',params.row.has_extra_consume==1?'有':'无')
					}
				},
				operation_keys: {
					cancel_attendance:{
						title: '撤销考勤',
						type: 'ios-trash',
						per: 'attendance.cancel'
					},					
				},
				operation_func: {
					cancel_attendance (params) {
						this.cancel_attendance(params.row)
					}
				}
			}
		},
		created(){
			if(!this.enable_grade){
	            delete this.column_keys['grade']
	        }
		},
		mounted () {
			this.init_data()
		},
		methods: {
			cancel_attendance (row) {
				let student_name = '',
					tip = '',
					int_day = this.$filter('int_date')(row.int_day),
					time_section = util.sprintf('%s--%s',
						this.$filter('int_hour')(row.int_start_hour),
						this.$filter('int_hour')(row.int_end_hour))					
				this.current_row = row
				if(row.student){
					student_name = row.student.student_name
				}
				
				if(this.allow_history_del) {
					tip = util.sprintf('确定撤销【%s】%s %s 时段的考勤记录吗？',student_name,int_day,time_section)				
					this.confirm(tip)
					.then(response=>{
						this.$rest('student_attendances').delete(row.satt_id)
						.success(response=>{
							this.$Message.success('考勤撤销成功！')
							this.init_data()
						})
					})
				}else{
					if(this.allow_del_history) {
						tip = util.sprintf('系统允许撤销历史%s天的考勤记录，当前日期已是历史第%s天',this.del_history_pass_days,this.diff_del_days)
					}else{
						tip = '系统不允许撤销历史考勤记录，如需要请联系管理员'
					}
					this.$Modal.error({
						title: '无法撤销',
						content: tip
					})
				}
			},
			attendance () {
				this.$store.state.layout.$refs['attendanceArrange']
				.set('mode','view')
				.show('登记考勤','add')
			},
			customAttendance () {
				
			},
			hook_get_param (params) {
				params.with = 'student,cls'
				let search_obj = util.copy(this.search_field)
				let arr = ['is_in','is_late','is_leave','is_makeup']
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if (arr.indexOf(o)>-1){
						if(property.length==1){
							params[o] = util.sprintf('[In,%s]',property.join(','))
						}
					}else if(o=='has_extra_consume'){
						if(property!='-1'){
							params[o] = property
						}
					}else if(o=='is_demo'){
						params[o] = property
					}else{					
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.search_field.is_in = [0,1]
				this.search_field.is_late = [0,1]
				this.search_field.is_leave = [0,1]
				this.search_field.is_makeup = [0,1]
				this.init_data()
			}
		},
		computed: {

			diff_del_days() {
				let diffDays = 0
				if(this.current_row) {
					let int_day_string = this.$filter('int_date')(this.current_row.int_day),
						now_day_string = moment().format('YYYY-MM-DD')
					diffDays = moment(now_day_string).diff(int_day_string,'days')
				}
				return diffDays
			},
			allow_history_del() {
				let	allow = true
				if(this.diff_del_days>0) {
					if(this.allow_del_history) {
						if(this.del_history_pass_days>0) {
							if(this.diff_del_days<=this.del_history_pass_days) {
								allow = true
							}else{
								allow = false
							}
						}else{
							allow = true
						}
					}else{
						allow = false
					}
				}
				return allow
			}
		}
	}
</script>