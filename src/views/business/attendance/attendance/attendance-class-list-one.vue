<template>
    <div class="c-grid">
    	<div class="box box-query">
    		<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
    			<Form-item label="上课日期" prop="int_day" class="col-md-3 col-sm-6">
    				<date-range-picker v-model="search_field.int_day" @on-change="init_data" label="选择日期" placement="bottom" style="width:100%"></date-range-picker>
    			</Form-item>
    			<Form-item label="班级" prop="cid" class="col-md-3 col-sm-6">
    				<select-class v-model="search_field.cid" clearable></select-class>
    			</Form-item>
    			<Form-item label="课程类型" prop="lesson_type" class="col-md-3 col-sm-6">
    				<Select v-model="search_field.lesson_type">
    					<Option :value="-1">不限</Option>
    					<Option :value="0">班课</Option>
    					<Option :value="1">一对一</Option>
    					<Option :value="2">一对多</Option>
    				</Select>
    			</Form-item>
    			<Form-item :label="label_teacher" prop="eid" class="col-md-3 col-sm-6" v-per="'attendance.all'">
    				<select-employee v-model="search_field.eid" :rid="1" clearable></select-employee>
    			</Form-item>
    			
    			<template v-if="searchExpand">	
    				<Form-item label="助教" prop="second_eid" class="col-md-3 col-sm-6">
	    				<select-employee v-model="search_field.second_eid" :rid="2" clearable></select-employee>
	    			</Form-item>
    				<Form-item label="课程" prop="lid" class="col-md-3 col-sm-6">
	    				<select-lesson v-model="search_field.lid" clearable></select-lesson>
	    			</Form-item>
	    			<Form-item label="科目" prop="sj_id" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.sj_id">
	    					<Option :value="0">不限</Option>
	    					<Option :value="item.sj_id" v-for="(item,index) in subjects" :key="index">{{item.subject_name}}</Option>
	    				</Select>
	    			</Form-item>
	    			
	    			<Form-item label="额外课消" prop="has_extra_consume" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.has_extra_consume">
	    					<Option :value="-1">不限</Option>
	    					<Option :value="1">有</Option>
	    					<Option :value="0">无</Option>
	    				</Select>
	    			</Form-item>
	    			<template v-if="enable_attendance_check">
		    			<Form-item label="审核人" prop="confirm_eid" class="col-md-3 col-sm-6">
		    				<select-employee v-model="search_field.confirm_eid" clearable></select-employee>
		    			</Form-item>
		    		</template>
	    			<Form-item label="线上线下" prop="is_online" v-if="enable_online_lesson" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.is_online">
		    				<Option :value="-1">不限</Option>
	    					<Option :value="1">线上</Option>
	    					<Option :value="0">线下</Option>
	    				</Select>
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
                	<export-button res="class_attendances" :params="params" v-per="'class_attendance.export'"></export-button>
                	<Checkbox 
                		class="ml-2"
                        v-model="search_field.is_demo"
                        :true-value="1"
                        :false-value="0">体验课
                    </Checkbox>
                    <template v-if="enable_attendance_check">
	                    <span class="ml-2 mr-2">|</span>
	                	<CheckboxGroup v-model="search_field.is_confirm" class="ml-2" style="display: inline-block;">
	                		<Checkbox :label="1" :readonly="readOnly(1,'is_confirm')">已审核</Checkbox>
	                		<Checkbox :label="0" :readonly="readOnly(0,'is_confirm')">待审核</Checkbox>
	                	</CheckboxGroup>
	                </template>
            	 	<div class="pull-right">
                        <per-scope per="attendance.all" @on-change="perScopeChange"></per-scope>
                    </div>
                </Col>
           </Row>	
    	</div>
    	<div class="box box-result">
    		<div class="toolbar">
    			<template v-if="enable_free_attendance">
    				<Dropdown v-per="'arrange.add'">
		        		<Button type="primary" icon="calendar">登记考勤</Button>
		        		<DropdownMenu slot="list">
		        			<DropdownItem @click.native="attendance"><Icon type="calendar"></Icon> 按排课登记</DropdownItem>
		        			<DropdownItem @click.native="freeAttendance"><Icon type="ios-people"></Icon> 自由登记</DropdownItem>
	                        <DropdownItem @click.native="studentAttendance"><Icon type="ios-person"></Icon> 按学员登记</DropdownItem>
		        		</DropdownMenu>
		        	</Dropdown>
    			</template>	
    			<template v-else>
    				<Button type="primary" @click="attendance" icon="calendar">登记考勤</Button>
    			</template>
    			<Button 
    				type="primary" 
    				@click="batchConfirm" 
    				icon="checkmark" 
    				:disabled="catt_ids.length==0"
    				v-per="'attendance.batchconfirm'" 
    				v-if="enable_attendance_check"
    				>
    				批量审核{{catt_ids.length?catt_ids.length:''}}
				</Button>
				<filter-column :keys="column_keys"></filter-column>
				<Button 
				class="pull-right m-t-5 mr-4" 
				type="ghost"
			 	@click="showPlan" 
			 	icon="ios-gear-outline"
			 	v-if="is_gm"
			 	>自动考勤计划</Button>
			</div>
    		<div class="content">
				<div class="content-body">
		            <Table 		            	
		            	v-loading.like="'class_attendances'" 
		            	ref="tableExcel"
		            	:data="data" 
		            	:stripe="true" 
		            	:page="pageIndex" 
		            	:columns="columns" 
		            	:show-header="true" 
		            	:page-size="pageSize" 
		            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		            	@on-select="selectOne"
		            	@on-select-cancel="cancelSelect"
		            	@on-select-all="selectAll"
		            	@on-selection-change="selectChange"
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
	import Vue from 'vue'
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import selectClass from 'c%/SelectClass.vue'
	import selectLesson from 'c%/SelectLesson.vue'
	import selectEmployee from 'c%/SelectEmployee.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import ExportButton from 'c%/ExportButton.vue'
	import EmployeeName from 'c%/EmployeeName.vue'

	Vue.component('employee-name',EmployeeName)
	export default{
		mixins: [grid,common,globals],
		components: {
			selectClass,
			selectLesson,
			selectEmployee,
			dateRangePicker,
			ExportButton
		},
		data () {
			return {
				rest_api: 'class_attendances',
				pk: 'catt_id',
				catt_ids: [],
				showCheckbox: true,
				current_row: null,
				search_field: {		
					lid: 0,
					sj_id: 0,
					cid: 0,
					eid: 0,
					second_eid: 0,
					lesson_type: -1,
					int_day: [],
					is_demo: 0,
					has_extra_consume: -1,
					is_online:-1,
					confirm_eid:0,
					is_confirm: [0,1]
				},
				type_attendance: '',
				column_keys: {
					cid: {
						title: '考勤对象',
						width: 200,
						show: true
					},
					lid: {
						title: '课程',
						show: true
					},
					bid:{
						title:'校区',
						show: false
					},
					pj_id:{
						title:'项目',
						show: false
					},
					class_student_nums: {
						title: '班级人数',
						show: false
					},
					need_nums: {
						title: '应到人数',
						show: true
					},
					in_nums: {
						title: '实到人数',
						show: true
					},
					absence_nums:{
						title: '缺勤人数',
						show:false
					},
					leave_nums:{
						title: '请假人数',
						show:false
					},
					sj_id: {
						title: '科目',
						show: true
					},
					grade:{
						title:'年级',
						show:false,
						sortable:'custom'
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
						title: '上课日期',
						sortable: 'custom',
						show: true
					},
					time_section: {
						title: '上课时段',
						show: true
					},
					tbs: {
						title: '授课内容',
						show: true,
						width: 200
					},
					create_time: {
						title: '操作时间',
						show: true,
						width: 150
					},
					has_extra_consume: {
						title: '额外课消',
						show: false
					},
					is_online:{
	                    title:'线上课',
	                    show:false
	                },
					is_confirm: {
						title: '审核状态',
						show: false,
						width: 150
					},
					lesson_remark: {
						title: '考勤备注',
						show: false
					}
				},
				column_render: {					
					cid (h,params) {
						let map_tag = {0:'班',1:'一',2:'多'},
							obj_name = '',
							row = params.row,
							tag = map_tag[params.row.lesson_type]
							
						if(row.lesson_type==0){
							if(row.ca_id>0&&row.course_arrange!=null){
								if(row.course_arrange.is_trial===1||row.course_arrange.is_makeup===1){
									obj_name = row.course_arrange.name	
								}
								else{
									if(row.cls!=null){
										obj_name = row.cls.class_name		
									}
								}								
							}else{
								obj_name = '班课自由考勤'
							}
						}else{
							if(params.row.student_name_list.length>0){								
								obj_name = String(params.row.student_name_list.slice(0,3).join(',')) 
							}
							if(params.row.student_name_list.length>3){
								obj_name += '等'
							}
						}
						
						if(params.row.is_trial==1) {
							tag = '试'
						}else if(params.row.is_makeup==1) {
							tag = '补'
						}

						return h('div',{
							'class':'pt-2 pb-2'
						},[
							h('Tag',{
								props: {
									color: 'blue',
									type:'border'
								}
							},tag),
							h('span',[
								h('a',{
									attrs:{
										class: 'x-a-link text-info'
									},
									on: {
										click: ()=>{
											this.attendance_record(params.row)
										}
									}
								},obj_name)
							]),							
						])
						
					},
					lesson_type (h,params) {
						return h('span',this.$filter('lesson_type')(params.row.lesson_type))
					},
					eid (h,params) {
						if(params.row.eid) {
							return h('employee-name', {
								props: {
									name: this.$filter('ename')(params.row.eid),
									detailAction: 2,
									showAvatar: false,
									eid: params.row.eid
								}
							})
						}
						else {
							return h('span','-')
						}
					},
					second_eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.second_eid)||'-')
					},
					int_day (h,params) {
						return h('span',this.$filter('int_date')(params.row.int_day))
					},
					time_section (h,params) {
						return h('span',
							util.sprintf('%s--%s',
								this.$filter('int_hour')(params.row.int_start_hour),
								this.$filter('int_hour')(params.row.int_end_hour)))
					},
					has_extra_consume(h,params) {
						return h('span',params.row.has_extra_consume==1?'有':'无')
					},
					lesson_remark (h,params) {
						return h('span',params.row.lesson_remark||'—')
					},
					is_confirm (h,params) {
						return h('span',params.row.is_confirm?'是':'否')
					},
					tbs (h,params) {
	                    let result = '-'
	                    let book = params.row.textbook
	                    let section = params.row.textbook_section
	                    if(book) {
	                        result = book.tb_name
	                    }
	                    if(section) {
	                        result += `：第${section.sort}章${section.section_title}`
	                    }
	                    return h('span',result)
	                },
	                is_online(h,params){
	                    let t = '否'
	                    if(params.row.is_online == 1){
	                        t = '是'
	                    }
	                    return h('span',t)
	                },
	                is_confirm(h,params) {
						let map = {0:['text-danger','待审核'],1:['text-success','已审核']}
						let checked = params.row.is_confirm
						if(checked) {
							let ps = []
							ps.push(h('p',{class: map[checked][0]},map[checked][1]))
							ps.push(h('p','审核人：'+this.$filter('ename')(params.row.confirm_eid)))
							ps.push(h('p',params.row.confirm_time))
							return h('div',ps)
						}
						else {
							if(params.row.lesson_type==1) {
								return h('span',{
									class: map[checked][0]
								},map[checked][1])
							}
							else {
								return h('span','-')
							}
						}
					}
				},
				operation_keys: {
					add_comment:{
						title: '添加点评',
						type: 'plus',
						condition: 'row.review==null',
						per: 'attendance.review'
					},
					comment_detail: {
						title: '课评详情',
						type: 'eye',
						condition: 'row.review!==null',
						per: 'attendance.review'
					},
					cancel_attendance:{
						title: '撤销考勤',
						type: 'ios-trash',
						per: 'attendance.cancel'
					},
					check_attendance:{
						title: '确认考勤',
						type: 'checkmark',
						per: 'attendance.confirm',
						condition: 'row.lesson_type==1&&row.is_confirm==0&&1=='+this.$store.state.gvars.configs.params.class_attendance.enable_attendance_check
					},
					cancel_check_attendance:{
						title: '取消确认考勤',
						type: 'close',
						per: 'attendance.cancel_confirm',
						condition: 'row.lesson_type==1&&row.is_confirm==1&&1=='+this.$store.state.gvars.configs.params.class_attendance.enable_attendance_check
					},
					edit_remark:{
						title: '备注操作',
						type: 'edit',
						condition: 'row.lesson_remark.length>=0',
						per: 'attendance.review'
					}
				},
				operation_func: {
					add_comment (params) {
						this.add_comment(params.row)
					},
					comment_detail (params) {
						this.add_comment(params.row)
					},
					cancel_attendance (params) {
						this.cancel_attendance(params.row)
					},
					check_attendance (params) {
						this.check_attendance(params.row)
					},
					cancel_check_attendance(params) {
						this.cancel_confirm(params.row)
					},
					edit_remark (params) {
						this.edit_remark(params.row)
					}
				}
			}
		},
		created(){
			if(!this.enable_grade){
	            delete this.column_keys['grade']
	        }
	        if(!this.enable_tbs){
	            delete this.column_keys['tbs']
	        }
	        if(!this.enable_online_lesson){
	            delete this.column_keys['is_online']
	        }
	        if(!this.enable_project){
	        	delete this.column_keys['pj_id']
	        }
		},
		watch: {
			'type_attendance': function(val) {
				this.init_data()
			}
		},
		created() {
			if(!this.enable_attendance_check) {
				delete this.column_keys['is_check']
				this.showCheckbox = false
			}
		},
		methods: {
			perScopeChange(value) {
	            this.type_attendance = value
	        },
			add_comment (row) {
				let review = row.review
				if(review) {
					this.$Modal.open('components/ReviewModal.vue@modal',{
						props: {
							currentTplProp: review.review_tpl_setting
						}
					})
					.then(modal => {
						modal
						.set('scene', 'view')
						.set('post', util.copy(review))
						.show('课评详情','view')
					})
				}
				else {
					this.$Modal.open('components/review/index.vue@modal',{
						props: {
							'class-attendance': row
						},
						on: {
							'on-success': () => {
								this.init_data()
							}
						}
					})
					.then(modal => {
						modal
						.show('添加课评','add')
					})
				}
			},
			edit_remark (row) {
				let title = this.setTitle(row),
					arrange = util.copy(row.course_arrange||{})
					arrange.one_class = row.cls||{}
				
				arrange.lesson_remark = row.lesson_remark
				this.$Modal.open('business/attendance/attendance/index.vue@modal?ca_id='+row.ca_id,{
					on: {
						'on-success': () => {
							this.init_data()
						}
					}
				})
				.then(modal=>{
					
					modal.set('arrange',arrange)
					.set('class_attendance',row)
					.show('编辑考勤【'+title+'】','record')
				})
			},
			do_check(ids,type) {
				let param = type==0?'cancel_check_attendances':'check_attendances'
				let msg = type==0?'取消确认成功':'确认成功'
				if(ids.length>1) {
					msg = '批量确认成功'
				}
				this.$rest('class_attendances')
				.add_url_param(param)
				.post({
					catt_ids: ids
				})
				.success(res => {
					this.$Message.success(msg)
					this.catt_ids = []
					this.init_data()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			batchConfirm() {
				this.do_check(this.catt_ids,1)
	        },
	        addCattIds(id) {
	        	let index = this.catt_ids.indexOf(id)
	        	if(index==-1) {
	        		this.catt_ids.push(id)
	        	}
	        },
	        removeCattIds(id) {
	        	let index = this.catt_ids.indexOf(id)
	        	this.catt_ids.splice(index,1)
	        },
	        deal_data(data) {
	        	data.list.forEach(item => {
	        		if(item.is_confirm||item.lesson_type!==1) {
	        			item._disabled = true
	        		}
	        		if(this.catt_ids.indexOf(item.catt_id)>-1) {
	        			item._checked = true
	        		}
	        	})
	        	return data.list
	        },
	        selectOne (selection,row) {
				this.addCattIds(row.catt_id)
			},
			cancelSelect (selection,row) {
				this.removeCattIds(row.catt_id)
			},
			selectAll (selection) {
				selection.forEach(item => {
					this.addCattIds(item.catt_id)
				})
			},
			selectChange (selection) {
				if(selection.length == 0){
					this.data.forEach(item => {
						this.removeCattIds(item.catt_id)
					})
				}
			},
			check_attendance (row) {
				this.do_check([row.catt_id],1)
			},
			cancel_confirm (row) {
				this.do_check([row.catt_id],0)
			},
			attendance_record (row) {
				let title = this.setTitle(row),
					arrange = util.copy(row.course_arrange||{})
					arrange.one_class = row.cls||{}
				
				arrange.lesson_remark = row.lesson_remark
				this.$Modal.open('business/attendance/attendance/index.vue@modal?ca_id='+row.ca_id)
				.then(modal=>{
					
					modal.set('arrange',arrange)
					.set('class_attendance',row)
					.show('查看考勤【'+title+'】','record')
				})
			},
			setTitle (row) {
				let title = '',
					mapTitle = {1:'一对一',2:'一对多'}
					
				if(row.lesson_type>0){
					title = mapTitle[row.lesson_type]						
				}else{
					if(row.ca_id>0&&row.course_arrange!=null){
						if(row.course_arrange.is_trial===1){
							title = row.course_arrange.name
						}else{
							if(row.cls!=null){
								title = row.cls.class_name
							}
						}
					}else{
						title = '班课自由考勤'
					}
				}
				return title
			},
			cancel_attendance (row) {
				let class_name = row.course_name,
					tip = '',
					int_day = this.$filter('int_date')(row.int_day),
					time_section = util.sprintf('%s--%s',
						this.$filter('int_hour')(row.int_start_hour),
						this.$filter('int_hour')(row.int_end_hour))
				this.current_row = row
				
				if(this.allow_history_del) {
					tip = util.sprintf('确定撤销【%s】%s %s 时段的考勤记录吗？',class_name,int_day,time_section)
					this.confirm(tip)
					.then(response=>{
						this.showPageSpin('正在撤销考勤记录...')
						this.$rest('class_attendances')
						.delete(row.catt_id)
						.success(response=>{
							this.hidePageSpin()
							this.$Message.success('考勤撤销成功！')
							this.init_data()
							
							// 再次打开排课考勤时需要更新排课记录
							// this.$store.state.layout.$refs['attendanceArrange']
							// .set('mode','')
						}).error(response=>{
							this.hidePageSpin()
							this.error(response.body.message||'撤销失败')
							
						})
					})
				}else{
					if(this.allow_del_history) {
						if(this.del_history_pass_days > 0){
							tip = util.sprintf('系统允许撤销历史%s天的考勤记录，该考勤日期已是历史第%s天',this.del_history_pass_days,this.diff_del_days)							
						}else if(this.del_history_pass_months > 0){
							tip = util.sprintf('系统允许撤销%s的考勤记录，该考勤月份已是历史第%s个月',this.map_history_pass_months[this.del_history_pass_months],this.diff_del_months)
						}
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
				this.$Modal.open('business/attendance/attendance-list.vue@modal',{
					autoShow:false,
					on: {
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
                .then(modal=>{
                    modal.vuec.set('mode','view')
                    .show('按排课登记考勤','add')
                })
			},
			freeAttendance () {
				this.$Modal.open('business/attendance/free-attendance-modal.vue',{
					on: {
						update: ()=>{
							this.init_data()
						}
					}
				})
                .then(modal=>{
                    modal.show('自由登记考勤','add')
                })
			},
			studentAttendance(){
				this.$Modal.open('business/attendance/student-attendance-modal.vue',{
					on: {
						update: ()=>{
							this.init_data()
						}
					}
				})
                .then(modal=>{
                    modal.show('自由登记考勤','add')
                })
			},
			readOnly (val,field) {
				let arr = this.search_field[field]
				if(arr.length===1&&arr[0]===val){
					return true
				}
				return false
			},
			hook_get_param (params) {
				params.with = 'cls,course_arrange,textbook,textbook_section'
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}
					else if(o=='is_confirm'){
						if(property.length) {
							params[o] = util.sprintf('[in,%s]',property.join(','))
						}
					}
					else if(o=='has_extra_consume'
						||o=='is_online'
						||o=='lesson_type'
						) {
						if(property!='-1'){
							params[o] = property
						}
					}
					else if(o=='is_demo'){
						params[o] = property
					}
					else{
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
				if(this.type_attendance == 'my') {
					params.eid = this.eid$
				}
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			},
			showPlan() {
				this.$Modal.open('business/attendance/auto-reg-plan-modal.vue')
				.then(modal => {
					modal.show('自动考勤计划')
				})
			}
		},
		computed: {
			subjects () {
				return this.$store.state.gvars.subjects
			},
			diff_del_days() {
				let diffDays = 0
				if(this.current_row) {
					let int_day_string = this.$filter('int_date')(this.current_row.int_day),
						now_day_string = moment().format('YYYY-MM-DD')
					diffDays = moment(now_day_string).diff(int_day_string,'days')
				}
				return diffDays
			},
			diff_del_months () {
				let int_month_string = this.$filter('int_date')(this.current_row.int_day).substring(0,7),
					now_month_string = moment().format('YYYY-MM'),
					diffMonths = moment(now_month_string).diff(int_month_string,'months')
				return diffMonths
			},
			allow_history_del() {
				let	allow = true
				if(this.diff_del_days > 0) {
					if(this.allow_del_history) {
						if(this.del_history_pass_days > 0) {
							if(this.diff_del_days > this.del_history_pass_days) {
								allow = false
							}
						}else{
							if(
								(this.del_history_pass_months == 1
									&& this.diff_del_months >= 1)
								||(this.del_history_pass_months == 2 
									&& this.diff_del_months >= 2)
								||(this.del_history_pass_months == 3 
									&& this.diff_del_months >= 3)
							) {
								allow = false
							}
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