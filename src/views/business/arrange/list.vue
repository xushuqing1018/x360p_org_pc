<template>
 	<div>
	    <div class="box box-query">
	        <Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
	        	<Form-item label="班级名称" prop="cid" class="col-md-3 col-sm-6">
	        		<select-class v-model="search_field.cid" clearable></select-class>
	        	</Form-item>
	        	<Form-item label="上课时间" prop="int_day" class="col-md-3 col-sm-6">
    				<date-range-picker v-model="search_field.int_day" @on-change="init_data" label="选择日期" placement="bottom" style="width:100%"></date-range-picker>
    			</Form-item>
    			<Form-item label="课程" prop="lid" class="col-md-3 col-sm-6">
    				<select-lesson v-model="search_field.lid" clearable></select-lesson>
    			</Form-item>
    			<Form-item :label="label_teacher" prop="teach_eid" class="col-md-3 col-sm-6">
    				<select-employee :rid="1" v-model="search_field.teach_eid" clearable></select-employee>
    			</Form-item>
    			<template v-if="searchExpand">
                    <Form-item label="科目" prop="lid" class="col-md-3 col-sm-6">
                        <select-subject v-model="search_field.sj_id" clearable></select-subject>
                    </Form-item>
                    <Form-item label="上课时段" class="col-md-3 col-sm-6">
                        <select-time-section 
                            clearable
                            :value="ts_array" 
                            @on-change="changeTimeSection"
                            placeholder="请选择上课时间段">
                        </select-time-section>
                    </Form-item>
	    			<Form-item label="助教" prop="second_eid" class="col-md-3 col-sm-6">
	    				<select-employee :rid="2" v-model="search_field.second_eid" clearable></select-employee>
	    			</Form-item>
	    			<Form-item label="教室" prop="cr_id" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.cr_id">
	    					<Option :value="0">不限</Option>
	    					<Option v-for="(item,index) in classrooms" :key="index" :value="item.cr_id">{{item.room_name}}</Option>
	    				</Select>
	    			</Form-item>
	    			<Form-item label="期段" prop="season" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.season">
	    					<Option :value="0">不限</Option>
	    					<Option v-for="(item,index) in dicts('season')" :value="item.name" :key="index">{{item.title}}</Option>
	    				</Select>
	    			</Form-item>
                    <Form-item label="星期" prop="week_day" class="col-md-3 col-sm-6">
                        <Select v-model="search_field.week_day">
                            <Option :value="0">不限</Option>
                            <Option v-for="(item,index) in weekdays" :value="item.value" :key="index">{{item.label}}</Option>
                        </Select>
                    </Form-item>
                    <Form-item label="学员" prop="teach_eid" class="col-md-3 col-sm-6">
                        <select-student v-model="search_field.sid" clearable></select-student>
                    </Form-item>
                    <template v-if="enable_tbs">
                        <Form-item label="教材" prop="tb_id" class="col-md-3 col-sm-6">
                            <select-textbook 
                                v-model="search_field.tb_id" 
                                placeholder="请选择教材" 
                                @selected="selectTb"
                                >
                            </select-textbook>
                        </Form-item>
                        <Form-item label="章节" prop="tbs_id" class="col-md-3 col-sm-6">
                            <Select v-model="search_field.tbs_id" placeholder="请选择章节">
                                <Option 
                                    :value="item.tbs_id" 
                                    v-for="item in sectionData" 
                                    :key="item.sort"
                                    >
                                    第{{item.sort}}章 {{item.section_title}}
                                </Option>
                            </Select>
                        </Form-item>
                    </template>
    			</template>
	        </Form>
	        <Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
                    
                    <export-button res="course_arranges" :params="params"></export-button>
                    
                	<CheckboxGroup 
                		v-model="search_field.is_attendance" 
                		class="ml-3"
                		style="display: inline-block;">
                		<Checkbox :label="2" :readonly="readOnly(2,'is_attendance')">全部考勤</Checkbox>
                        <Checkbox :label="1" :readonly="readOnly(1,'is_attendance')">部分考勤</Checkbox>
                		<Checkbox :label="0" :readonly="readOnly(0,'is_attendance')">未考勤</Checkbox>
                	</CheckboxGroup>
                	<span class="ml-2 mr-2">|</span>
                	<CheckboxGroup 
                		v-model="search_field.lesson_type" 
                		class="ml-2"
                		style="display: inline-block;">
                		<Checkbox :label="0" :readonly="readOnly(0,'lesson_type')">班课</Checkbox>
                		<Checkbox :label="1" :readonly="readOnly(1,'lesson_type')">一对一</Checkbox>
                		<Checkbox :label="2" :readonly="readOnly(2,'lesson_type')">一对多</Checkbox>
                	</CheckboxGroup>
                    <span class="ml-2 mr-2">|</span>
                    <CheckboxGroup 
                        v-model="search_field.is_cancel"
                        class="ml-2"
                        style="display: inline-block;">
                        <Checkbox :label="0">正常</Checkbox>
                        <Checkbox :label="1">已取消</Checkbox>
                    </CheckboxGroup>
                    <template v-if="allow_empty_teachobj">
                        <span class="ml-2 mr-2">|</span>
                        <CheckboxGroup 
                            v-model="search_field.is_empty_obj"
                            class="ml-2"
                            style="display: inline-block;">
                            <Checkbox :label="0">非空</Checkbox>
                            <Checkbox :label="1">空学员</Checkbox>
                        </CheckboxGroup>
                    </template>
                    <span class="ml-2 mr-2">|</span>
                    <Checkbox 
                        v-model="search_field.is_demo"
                        :true-value="1"
                        :false-value="0">体验课
                    </Checkbox>
                    <Checkbox 
                        v-if="enable_online_lesson"
                        v-model="search_field.is_online"
                        :true-value="1"
                        :false-value="0">线上课
                    </Checkbox>
                    <div class="pull-right">
                        <per-scope per="arrange.checkAll" @on-change="perScopeChange"></per-scope>
                    </div>
                    <div class="pull-right mr-4">
                        <label>当前模式：</label>
                        <ButtonGroup>
                            <Button type="primary" icon="ios-list-outline">列表</Button>
                            <Button type="ghost" icon="grid" @click="turnGridArrange">表格</Button>
                            <Button type="ghost" icon="eye" @click="turnVisualArrange">可视化</Button>
                        </ButtonGroup>
                    </div>
                </Col>
          	</Row>
	    </div>
	    <div class="box box-result">
	        <div class="toolbar">
	        	<Dropdown v-per="'arrange.add'">
	        		<Button type="primary" icon="plus">创建排课记录</Button>
	        		<DropdownMenu slot="list">
	        			<DropdownItem @click.native="addInfo"><Icon type="ios-loop"></Icon> 简单循环排课</DropdownItem>
	        			<DropdownItem @click.native="multiAddInfo"><Icon type="ios-infinite"></Icon> 规律循环排课</DropdownItem>
                        <DropdownItem @click.native="addByCalendar"><Icon type="calendar"></Icon> 日历排课</DropdownItem>
	        		</DropdownMenu>
	        	</Dropdown>
                <Dropdown v-per="'arrange.batedit'">
                    <Button type="primary" icon="shuffle">批量调课</Button>
                    <DropdownMenu slot="list">
                        <DropdownItem @click.native="multiChangeInfo">按排课记录调课</DropdownItem>
                        <DropdownItem @click.native="changeByStudentLesson">按授课对象调课</DropdownItem>
                        <DropdownItem @click.native="changeBySchool">按校区维度调课</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
	            <Button type="error" @click="multiDelInfo" :disabled="!ca_ids.length" icon="ios-trash" v-per="'arrange.delete'">批量删除</Button>
                <filter-column :keys="column_keys"></filter-column>                
	        </div>
	        <div class="content">
	            <div class="content-body">
	                <Table 
                    v-loading="'course_arranges'" 
                    ref="tableExcel"
                    :page-size="pageSize" 
                    :page="pageIndex"
                    :stripe="true" 
                    :show-header="true" 
                    :data="data" 
                    :columns="columns" 
                    :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
                    :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
                    @on-sort-change="sortChange"
                    @on-selection-change="selectionChange"> 
	                </Table>
	            </div>

	            <div class="content-footer">
                    <div class="pull-left">
                        <span class="ml-3">总计:
                            扣课时:{{total_consume_lesson_hour}}
                            
                        </span> 
                        <span class="ml-3">本页小计:
                            扣课时:{{page_consume_lesson_hour}}
                        </span>
                    </div>
	                <div class="pagenation">
	                    <Page :total="total" 
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
import util,{_} from '@/libs/util'
import common from '@/libs/common.mixin'
import moment from 'moment'
import grid from '@/libs/grid.mixin'
import globals from '@/libs/globals.mixin'
import selectLesson from 'c%/SelectLesson.vue'
import selectClass from 'c%/SelectClass.vue'
import selectStudent from 'c%/SelectStudent.vue'
import selectEmployee from 'c%/SelectEmployee.vue'
import dateRangePicker from 'c%/DateRangePicker.vue'
import SelectTextbook from 'c%/SelectTextbook.vue'
import TagLabel from 'c%/TagLabel.vue'
import SelectTimeSection from 'c%/SelectTimeSection.vue'
import SelectSubject from 'c%/SelectSubject.vue'

import ExportButton from 'c%/ExportButton.vue'

const CLASS_SCHEDULES_URL = 'classes/%s/schedules'
export default {
	name:'arrangeList',
    mixins:[common,grid,globals],
    components: {
        selectStudent,
    	selectClass,    	
    	selectLesson,
    	selectEmployee,
        dateRangePicker,
        ExportButton,
        SelectTextbook,
        SelectTimeSection,
        SelectSubject
    },
    data() {
        return {
            mode:'table',
            rest_api: 'course_arranges',
            res_name: '排课记录',
            pk: 'ca_id',
            datakey:'course_arranges',      
            showCheckbox: true,
            ca_ids: [],
            total_consume_lesson_hour:0.00,
            page_consume_lesson_hour:0.00,
            search_field: {
            	cid: 0,
            	int_day: [],
            	sj_id: 0,
            	cr_id: 0,
            	teach_eid: 0,
            	second_eid: 0,
            	season: 0,
                sid:0,
            	is_attendance: [0,1,2],
            	lesson_type: [0,1,2],
                is_cancel:[0,1],
                is_demo:0,
                tb_id: 0,
                tbs_id: 0,
                is_online:0,
                is_empty_obj: [0,1],
                int_start_hour: '',
                int_end_hour: ''
            },
            ts_array: [],
            sectionData: [],
            column_keys:{            	
                tag:{
                    title:'标签',
                    show:false
                },
                bid:{
                    title:'校区',
                    sortable:'custom',
                    show:true,
                },
                pj_id:{
                    title:'项目',
                    show:false
                },
                int_day:{
                	title:'日期',
                	sortable:'custom',
                	show:true
                },				
                time_section:{
                	title:'时段',
               		show:true
                },
                consume_lesson_hour:{
                    title:'扣课时数',
                    show:true
                },
                int_start_hour:{
                	title:'开始时间',
                	show:false
                },
                int_end_hour:{
                	title:'结束时间',
                	show:false
                },
                teach_eid:{
                    title:this.$filter('translate')('老师'),
                    sortable:'custom',
                    show:true,
                },
                second_eids:{
                    title:this.$filter('translate')('助教'),
                    sortable:'custom',
                    show:false,
                },
                teach_object:{
                    title:'授课对象',
                    show:true,
                    width: 200
                },
                cr_id:{
                    title:'教室',
                    sortable:'custom',
                    show:true
                },
                lid:{
                    title:'课程',
                    show:false
                },
                sj_id:{
                    title:'科目',
                    sortable:'custom',
                    show:false
                },
                grade:{
                    title:'年级',
                    show:false,
                    sortable:'custom'
                },
                tbs: {
                    title: '授课内容',
                    show: true,
                    width: 200
                },
                is_online:{
                    title:'线上课',
                    show:false
                },
		        is_bk_open: {
                    title: '预约开关',
                    show: true
                },
                is_attendance:{
                	title:'考勤',
                	sortable:'custom',
                	show:true
                },
                create_time: {
                    title: '创建时间',
                    show: false,
                },
                create_employee: {
                    title: '创建人',
                    show: false
                }
            },
            column_render: {
            	teach_object(h,params){
			        let row = params.row
			        if(row.lesson_type == 0){        	
			        	if(row.is_trial == 1||row.is_makeup==1){
						let name = '试'
						if(row.is_makeup ==1){
							name='补'
						}
			        		return h('div',[
				                h('Tag',{
				                    props:{
				                        color:'yellow'
				                    }
				                },name),
				                h('Tag',row.name||'')
				            ])
			        	}else{
			        		return h('div',[
				                h('Tag',{
				                    props:{
				                        color:'blue'
				                    }
				                },'班'),
				                h('Tag',row.one_class!=null?row.one_class.class_name:'')
				            ])
			        	}        	
			            
			        }else{
			            let tag,
			                students = [],
                            sub_elements = []
			            if(row.is_trial){
			                tag = h('Tag',{
			                    props:{
			                        color:'yellow'
			                    }
			                },'试:'+row.name)
			            }else{
			                if(row.lesson_type == 1){
			                    tag = h('Tag',{
			                        props:{
			                            color:'green'
			                        }
			                    },'一')
			                }else if(row.lesson_type == 2){
			                    tag = h('Tag',{
			                        props:{
			                            color:'green'
			                        }
			                    },'多')
			                }
			            }
                        if(row.is_makeup){
                            sub_elements.push(
                                h('Tag',{
                                    props:{
                                        color:'yellow'
                                    }
                                },'补')
                            )
                        }
                        sub_elements.push(tag)

			
			            row.students.forEach(s=>{
			                students.push(h('Tag',s.student.student_name))
			            })

                        sub_elements.push(h('span',students))
			
			            return h('div',sub_elements)
			
			        }
		        },
            	tag (h,params) {
            		return h(TagLabel, {
						props: {
							list: params.row.tags,
							type: 4,
							id: params.row.ca_id,
							objName: '【排课】标签管理'
						},
						on: {
							update: () => {
								this.init_data()
							}
						}
					})
            	},
            	int_start_hour (h,params) {
            		return h('span',this.$filter('int_hour')(params.row.int_start_hour))
            	},
            	int_end_hour (h,params) {
            		return h('span',this.$filter('int_hour')(params.row.int_end_hour))
            	},
                is_attendance(h,params){
                	let map_tag =  {
	                		0:{color:'default',label: '未考勤'},
	            			1:{color:'yellow',label: '部分考勤'},
	        				2:{color:'green',label: '全部考勤'}
	                	},
	                	tag = map_tag[params.row.is_attendance]
                    if(params.row.is_cancel == 1){
                        tag.color='red'
                        tag.label='已取消'
                        return h('div',[
                            h('Tag',{props:{color:tag.color}},tag.label),
                            h('p','原因:'+params.row.reason)
                            ])
					}
					var vm = this;
                    if(params.row.lesson_type == 1){
                        let attendance_status = '';
                        if(params.row.students && params.row.students.length > 0){
                            if(params.row.students[0].is_in == 0){
                                attendance_status += '缺勤'
                                if(params.row.students[0].is_leave == 1){
                                    attendance_status += ',有请假'
                                }
                            }else if(params.row.students[0].is_in == 1){
                                attendance_status += '正常出勤'
                            }
                        }else{
                            attendance_status = '-'
                        }
                        return h('div',[
                            h('Tag',{
                                props:{
                                    color: tag.color
                                },
                                on: {
                                    click: function() { vm.showAttendModal(params.row) }
                                }
                            },tag.label),
                            h('p',attendance_status)
                            ])
                    }else{
                        return h('Tag',{
                            props:{
                                color: tag.color
                            },
                            on: {
                                click: function() { vm.showAttendModal(params.row) }
                            }
                        },tag.label)
                    }
	                
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
		is_bk_open (h,params) {
                    return h('i-switch',{
                        props: {
                            size: 'small',
                            trueValue: 1,
                            falseValue: 0,
                            value: params.row.is_bk_open,
                            readonly: !this.hasPer('arrange.bk')
                        },
                        on: {
                            'on-change': (v) => {
                                let row = util.copy(params.row)
                                if(v) {
                                    row.is_bk_open = 1
                                }else{
                                    row.is_bk_open = 0
                                }
                                this.switchBk(row)
                            }
                        }
                    })
                },
                is_online(h,params){
                    let t = '否'
                    if(params.row.is_online == 1){
                        t = '是'
                    }
                    return h('span',t)
                },
                create_employee(h,params) {
                    return h('span',params.row.create_employee?params.row.create_employee.ename:'-')
                }
            },
            operation_keys: {
                edit: {
                    title: '编辑',
                    type: 'edit',
                    per: 'arrange.edit'
                },
                arrange_student: {
                	title: '学员管理',
                	type: 'person-add',
                	condition: 'row.is_attendance==0'
                },
                cancel:{
                    title:'取消排课',
                    type:'android-cancel',
                    per:'arrange.cancel',
                    condition:'row.is_attendance===0&&row.is_cancel===0'
                },
                delete: {
                    title: '删除排课',
                    type: 'ios-trash',
                    per: 'arrange.delete',
                    condition: 'row.is_attendance===0'
                },
                delay:{
                    title: '顺延排课',
                    type: 'ios-copy',
                    per: 'arrange.add'
                }
            },
            operation_func:{
                edit(params){
                    this.editInfo(params.row)
                },
                arrange_student (params){
                	this.arrageStudentOperate(params.row)
                },
                delete(params){
                    this.delInfo(params.row)
                },
                cancel(params){
                    this.cancelArrange(params.row)
                },
                delay(params){
                    this.delayArrange(params.row)
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
	if(!this.enable_bk){
            delete this.column_keys['is_bk_open']
        }
        if(!this.enable_online_lesson){
            delete this.column_keys['is_online']
        }
        if(!this.enable_project){
            delete this.column_keys['pj_id']
        }
		if('is_attendance' in this.$route.query&&this.$route.query.is_attendance == 0) {
			this.search_field.int_day = [moment().format('YYYY-MM-DD'),moment().format('YYYY-MM-DD')]
			this.search_field.is_attendance = [0]
		}
    },
    mounted () {
        this.init_data()
	},
	methods: {
        changeBySchool () {
            this.$Modal.open('business/class/arrange/multi-change-by-school.vue@modal',{
                on: {
                    'on-success':() => {
                        this.init_data()
                    }
                }
            })
            .then(modal => {
                modal.show('批量调课')
            })
        },
        changeByStudentLesson () {
            this.$Modal.open('business/class/arrange/multi-change-by-sl.vue@modal',{
                on: {
                    'on-success':() => {
                        this.init_data()
                    }
                }
            })
            .then(modal => {
                modal.show('批量调课')
            })
        },
		showAttendModal (item) {	
			let class_name = this.setTitle(item),				
				title = util.sprintf('登记考勤【%s】',class_name)
				
			if(item.is_attendance===2){
				title = util.sprintf('查看考勤【%s】',class_name)
			}
			
			if(item.class_attendance){
				item.lesson_remark = item.class_attendance.lesson_remark 
			}
			
			this.$Modal.open('business/attendance/attendance/index.vue@modal',{
                on:{
                    'on-success':()=>{
                        this.init_data()
                        this.$emit('on-success')
                    }
                }
			})
			.then(modal=>{
				modal.set('arrange',item)
				.set('ca_id',item.ca_id)
				.show(title)
			})
		},
		setTitle (item) {
			let result = '',
				mapTitle = {1:'一对一',2:'一对多'}
			
			if(item.lesson_type===0){
				if(item.is_trial===1||item.is_makeup===1){
					result = item.name
				}else{
					if(item.one_class!=null){
						result = item.one_class.class_name
					}	
				}	
			}else{
				result = mapTitle[item.lesson_type]
			}
						
			return result
		},
        perScopeChange(value) {
            this.$emit('on-check',value)
        },
        turnGridArrange () {
            this.$emit('on-turn-mode','grid')
        },
        turnVisualArrange () {
            this.$emit('on-turn-mode','visual')
        },
		selectionChange (data) {
			this.ca_ids = []
			if(data.length){
				data.forEach(d=>{
					this.ca_ids.push(d.ca_id)
				})
			}
		},
		multiDelInfo () {
			let params = {
					ca_ids: this.ca_ids
				},
				tip = util.sprintf('确定删除这【%s】条排课吗？删除后将无法恢复！',this.ca_ids.length)
						
			this.confirm(tip).then(()=>{
				this.$rest('course_arranges/delete_batch').post(params)
				.success(data=>{
					this.$Message.success('删除成功！')
					this.refreshArrange()
					this.ca_ids = []
				}).error(response=>{
					this.error(response.body.message||'删除失败')
				})
			})
		},
		arrageStudentOperate (row) {
			let title = util.sprintf('添加排课学员【%s %s~%s】',
							this.$filter('int_date')(row.int_day),
							this.$filter('int_hour')(row.int_start_hour),
							this.$filter('int_hour')(row.int_end_hour))
			
			if(row.lesson_type==2){				
                this.$Modal.open('business/arrange/arrange-students-modal.vue',{
                    on: {
                        save:() => {
                            this.refreshArrange()
                        }
                    }
                })
                .then(modal => {
                    modal
                    .set('info',row)
                    .show(title,'add')
                })
			}else{
                this.$Modal.open('business/arrange/class-arrange-student/students-modal.vue',{
                    on: {
                        save:() => {
                            this.refreshArrange()
                        }
                    }
                })
                .then(modal => {
                    modal
                    .set('lid',row.lid)
                    .set('ca_id',row.ca_id)
                    .show(title,'add')
                })
			}
		},
		readOnly (val,field) {
			let arr = this.search_field[field]
			if(arr.length===1&&arr[0]===val){
				return true
			}
			return false
		},
        hook_get_param(params){
       		params.with = 'one_class,students,textbook,textbook_section,create_employee'
       		let search_obj = util.copy(this.search_field)
			for(let o in search_obj) {
				let property = search_obj[o]
				if(o=='int_day'){
					if(property!=','&&property.length>0){
						params[o] = util.sprintf('[Between,%s]',property.join(','))
					}												
				}else if (o=='is_attendance'){
					if(property.length == 1){
                        if(property[0] == 1) {
                            params[o] = '[in,1]'
                        }else if(property[0] == 2){
                            params[o] = '[in,2]'
                        }else if(property[0] == 0) {
                            params[o] = '[in,0]'
                        }
					}
				}else if(o=='lesson_type'){
					if(property!=','&&property.length>0){
						params[o] = util.sprintf('[In,%s]',property.join(','))
					}	
				}else if(o=='is_empty_obj'){
                    if(property.length == 1){
                        params[o] = property[0]
                    }   
                }
                else if(o=='is_cancel'){
                    params[o] = '[in,'+property.join(',')+']'
                }else if(o=='is_demo'){
                    params.is_demo = property
                }else{
					if(property&&property!='-1'){
						params[o] = property
					}
				}
			}
        },
        refreshArrange () {
        	this.init_data()
        	this.$emit('on-clearCache')
        },
        delInfo (row) {
        	this.confirm('您确定要删除这条排课信息吗?')
            .then(()=>{
                this.delete(row)
                .then((response)=>{                  
                    this.refreshArrange()
                })
            })       
        	
        },
        editInfo (row){
            let obj = util.copy(row),
                ts_array = [],
             	classInfo = {
            		cid: row.cid,
            		lid: row.lid,
            		class_name: ''
            	}
            ts_array.push(this.$filter('int_hour')(obj.int_start_hour))
            ts_array.push(this.$filter('int_hour')(obj.int_end_hour))
			obj.int_day = String(obj.int_day)
			
			if(row.lesson_type>0){
				let mapName = {1:'一对一',2:'一对多'}
				classInfo.class_name = mapName[row.lesson_type]
			}else{
				if(row.is_trial===1||row.is_makeup===1){
					classInfo.class_name = row.name
				}else{
					if(row.one_class){
						classInfo.class_name = row.one_class.class_name						
					}
				}
			}			
			let title = util.sprintf(
					'调整排课时间:%s %s~%s',
					this.$filter('int_date')(row.int_day),
					this.$filter('int_hour')(row.int_start_hour),
					this.$filter('int_hour')(row.int_end_hour)
				)
			
            this.$Modal.open('business/class/arrange/info-modal.vue',{
                on: {
                    save: () => {
                        this.refreshArrange()
                    }
                }
            })
            .then(modal => {
                modal
                .set('classInfo',classInfo)
                .set('ts_array',ts_array)
                .set('info',obj)
                .show(title,'edit')
            })
        },
        addByCalendar () {
            this.$Modal.open('business/arrange/calendar/info-modal.vue',{
                on: {
                    'on-success': () => {
                        this.refreshArrange()
                    }
                }
            })
            .then(modal => {
                modal.show('日历排课','add')
            })
        },
        addInfo () {        	
            this.$Modal.open('business/class/arrange/info-modal.vue',{
                on: {
                    save: () => {
                        this.refreshArrange()
                    }
                }
            })
            .then(modal => {
                modal.show('简单排课','add')
            })
        },
        multiAddInfo () {
			this.$Modal.open('business/class/arrange/multi-add-modal.vue',{
				on: {
					'on-success': ()=>{
						this.refreshArrange()
					}
				}
			})
			.then(modal=>{
				modal.show('规律排课','add')
			})
			
		},
		multiChangeInfo () {
            this.$Modal.open('business/class/arrange/multi-change-info.vue@modal',{
                on: {
                    save: ()=> {
                        this.refreshArrange()
                    }
                }
            })
            .then(modal => {
                modal.show('批量调课','add')
            })
		},
		resetSearch () {
			this.$r('ref_search').resetFields()
			this.search_field.is_attendance = [0,1]
            this.search_field.int_start_hour = ''
            this.search_field.int_end_hour = ''
		},

        deal_data(data){
            this.total_consume_lesson_hour = data.total_consume_lesson_hour
            this.page_consume_lesson_hour  = data.page_consume_lesson_hour
            return data.list
        },

        cancelArrange(arrange){
            this.$Modal.open('business/arrange/cancel-arrange-modal.vue',{
                on:{
                    'on-success':()=>{
                        this.init_data()
                    }
                }
            })
            .then(modal=>{
                modal.set('info',arrange)
                .show('取消排课','add')
            })
        },
        selectTb() {
            this.search_field.tbs_id = 0
            this.sectionData = []
            this.get_textbook_section()
        },
        get_textbook_section() {
            this.$http.get('textbook_sections',{
                params: {
                    tb_id: this.search_field.tb_id,
                    pagesize:1000
                }
            })
            .then(res => {
                var list = res.body.data.list;
                list.sort((a,b) => {
                    return a.sort - b.sort
                })
                this.sectionData = list;
            },res => {
                this.$Message.error(res.body.message)
            })
        },
        switchBk(row) {
            this.$rest(this.rest_api).add_url_param(row.ca_id)
            .put(row)
            .success(res => {
                this.init_data()
            })
            .error(res => {
                this.error(res.body.message)
            })
        },
        changeTimeSection(event) {
            if(event.length) {
                this.search_field.int_start_hour = this.$filter('format_int_hour')(event[0])
                this.search_field.int_end_hour   = this.$filter('format_int_hour')(event[1])
            }else{
                this.search_field.int_start_hour = ''
                this.search_field.int_end_hour   = ''
            }
        },
        delayArrange(arrange){
            this.$Modal.open('business/arrange/calendar/delay-arrange.vue@modal',{
                props: {
                    'arrange':arrange
                },
                on: {
                    'on-success':() => {
                        this.init_data()
                    }
                }
            })
            .then(modal => {
                modal.show('顺延排课')
            })
        }
    },
    computed: { 
        classrooms () {
        	return this.$store.state.gvars.classrooms.filter(c=>c.bid==this.bid$)
        }
    }
}
</script>