<template>
 	<div>
	    <div class="box box-query">
	        <Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
	        	<Form-item label="班级" prop="cid" class="col-md-3 col-sm-6">	        		
	        		<select-class v-model="search_field.cid" clearable></select-class>
	        	</Form-item>
	        	<Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
                    <select-student v-model="search_field.sid" clearable></select-student>
                </Form-item>
                <Form-item label="课程" prop="lid" class="col-md-3 col-sm-6">
    				<select-lesson v-model="search_field.lid" clearable></select-lesson>
    			</Form-item>
    			<Form-item :label="label_teacher" prop="teach_eid" class="col-md-3 col-sm-6">
                    <select-employee v-model="search_field.teach_eid" clearable></select-employee>
                </Form-item>
                <template v-if="searchExpand">
                	<Form-item label="科目" prop="sj_id" class="col-md-3 col-sm-6">
	    				<select-subject v-model="search_field.sj_id" clearable></select-subject>
	    			</Form-item>
	    			<Form-item label="教室" prop="cr_id" class="col-md-3 col-sm-6">
	    				<select-class-room-two v-model="search_field.cr_id" clearable></select-class-room-two>
	    			</Form-item>
        			<Form-item label="开始日期" prop="start_int_day" class="col-md-3 col-sm-6">
	    				<DatePicker 
	    					v-model="search_field.start_int_day" 
	    					@on-change="init_data" 
	    					label="选择开始日期" 
	    					style="width:100%">
						</DatePicker>
	    			</Form-item>
	    			<Form-item label="上课日期" prop="end_int_day" class="col-md-3 col-sm-6">
	    				<DatePicker 
	    					v-model="search_field.end_int_day" 
	    					@on-change="init_data" 
	    					label="选择结束日期" 
	    					style="width:100%"
	    					>
						</DatePicker>
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
                    
                    <export-button res="class_schedule_mains" :params="params"></export-button>
                    
                	<CheckboxGroup 
                		v-model="search_field.lesson_type" 
                		class="ml-2"
                		style="display: inline-block;">
                		<Checkbox :label="0" :readonly="readOnly(0,'lesson_type')">班课</Checkbox>
                		<Checkbox :label="1" :readonly="readOnly(1,'lesson_type')">一对一</Checkbox>
                		<Checkbox :label="2" :readonly="readOnly(2,'lesson_type')">一对多</Checkbox>
                	</CheckboxGroup>
                </Col>
          	</Row>
	    </div>
	    <div class="box box-result">
	        <div class="toolbar">
	        	<Button type="primary" icon="plus" @click="add">创建排课计划</Button>
                <filter-column :keys="column_keys"></filter-column>                
	        </div>
	        <div class="content">
	            <div class="content-body">
	                <Table 
                    v-loading="'class_schedule_mains'" 
                    :page-size="pageSize" 
                    :page="pageIndex"
                    :stripe="true" 
                    :show-header="true" 
                    :data="data" 
                    :columns="columns" 
                    :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
                    :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
                    > 
	                </Table>
	            </div>

	            <div class="content-footer">
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
import moment from 'moment'
import util,{_} from '@/libs/util'
import common from '@/libs/common.mixin'
import grid from '@/libs/grid.mixin'
import globals from '@/libs/globals.mixin'
import selectLesson from 'c%/SelectLesson.vue'
import selectClass from 'c%/SelectClass.vue'
import selectStudent from 'c%/SelectStudent.vue'
import selectEmployee from 'c%/SelectEmployee.vue'
import SelectClassRoomTwo from 'c%/SelectClassRoomTwo.vue'
import SelectSubject from 'c%/SelectSubject.vue'
import dateRangePicker from 'c%/DateRangePicker.vue'
import ExportButton from 'c%/ExportButton.vue'

export default {
    mixins:[common,grid,globals],
    components: {
        selectStudent,
    	selectClass,    	
    	selectLesson,
    	selectEmployee,
    	SelectClassRoomTwo,
    	SelectSubject,
        dateRangePicker,
        ExportButton
    },
    data() {
        return {
            rest_api: 'class_schedule_mains',
            res_name: '排课计划',
            pk: 'csm_id',
            search_field: {
            	cid: 0,
            	start_int_day: '',
            	end_int_day: '',
                sid:0,
                teach_eid: 0,
                cr_id: 0,
                lid: 0,
                sj_id: 0,
                lesson_type: [0,1,2]
            },
            map_week_text: {
                1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'天'
            },
            column_keys:{
                name: {
                    title: '计划名称',
                    show:true
                },
                int_day: {
                    title: '起止日期',
                    show: true
                },
            	plan_object: {
            		title: '计划对象',
            		show: true
            	},
                plan_detail: {
                    title: '计划详情',
                    width: 250,
                    show: true
                },
                course_arrange: {
                    title: '排课详情',
                    show:true
                },
                create_uid: {
                    title: '创建人',
                    show: true
                },
                create_time: {
                    title: '创建时间',
                    show: true
                }
            },
            column_render: {
            	plan_object(h,params) {
                    let name = this.getObjectName(params.row)
                    return h('span',name)
            	},
                plan_detail(h,params) {
                    let div = []
                    params.row.schedules.forEach(s => {
                        div.push(h('p',{
                            style: {
                                padding: '3px'
                            }
                        },'周'+this.map_week_text[s.week_day]+s.int_start_hour+'~'+s.int_end_hour+' '+this.$filter('ename')(s.eid)))
                    })
                    return h('div',div)
                },
            	int_day(h,params) {
            		let start = params.row.start_int_day
            		let end = params.row.end_int_day
            		let times = params.row.arrange_times
            		if(params.row.end_type==0) {
            			return h('span',this.$filter('int_date')(start)+'到'+this.$filter('int_date')(end))
            		}
            		if(times) {
            			return h('span',this.$filter('int_date')(start)+'('+times+'次)')
            		}
            		return h('span','-')
            	},
                course_arrange(h,params) {
                    let type = params.row.schedule_type
                    if(type==0) {
                        return h('div',[
                            h('span','总排课'+params.row.course_arrange.count_nums),
                            ',',
                            h('span','未考勤'+params.row.course_arrange.no_attendance)])
                    }
                    else if(type==1){
                        return h('span','按老师不生成排课')
                    }
                    else {
                        return h('span','按科目用于学习管家活动课')
                    }
                },
                create_uid(h,params) {
                    return h('span',params.row.create_uid.ename)
                }
            },
            operation_keys: {
                edit: {
                    title: '编辑',
                    type: 'edit',
                    per: 'plan.edit'
                },
                delete: {
                    title: '删除',
                    type: 'ios-trash',
                    per: 'plan.delete'
                }
            },
            operation_func:{
                edit(params) {
                    this.editInfo(params.row)
                },
                delete(params){
                    this.delInfo(params.row)
                }
            }
        }
    },
    mounted () {
        this.init_data()
	},
	methods: {
		readOnly (val,field) {
			let arr = this.search_field[field]
			if(arr.length===1&&arr[0]===val){
				return true
			}
			return false
		},
        hook_get_param(params){
       		params.with = 'one_class,student,schedules,create_uid'
       		let search_obj = util.copy(this.search_field)
			for(let o in search_obj) {
				let property = search_obj[o]
				if(o=='lesson_type'){
					if(property!=','&&property.length>0){
						params[o] = util.sprintf('[In,%s]',property.join(','))
					}	
				}else{
					if(property&&property!='-1'){
						params[o] = property
					}
				}
			}
        },
        getObjectName(row) {
            let name = ''
            if(row.schedule_type==0) {
                if(row.cid) {
                    name = row.one_class?row.one_class.class_name:''
                }
                else if(row.sid) {
                    name = row.student?row.student.student_name:''
                }
                else if(row.students.length) {
                    let ret = []
                    row.students.forEach(s => {
                        ret.push(s.student_name)
                    })
                    name = ret.join(',')
                }
            }
            else if(row.schedule_type==1){
                name = this.$filter('ename')(row.eid)
            }
            else{
                name = this.$filter('subject_name')(row.sj_id)
            }
            return name
        },
        genArrange (row) {

        },
        add () {
        	this.$Modal.open('business/arrange/plan/main-info-modal.vue',{
        		on: {
        			'on-success':() => {
        				this.init_data()
        			}
        		}
        	})
        	.then(modal => {
        		modal.show('创建排课计划','add')
        	})
        },
        editInfo (row) {
            let fields = [
                'csm_id','bid','name','schedule_type','lesson_type',
                'cid','lid','sj_id','sid','sids','eid',
                'second_eids','start_int_day','end_int_day',
                'arrange_times','end_type','schedules'
            ]
            let info = {}
            let copy = util.copy(row)
            fields.forEach(f => {
                info[f] = copy[f]
            })
            info.start_int_day = this.$filter('int_date')(info.start_int_day)
            info.end_int_day = this.$filter('int_date')(info.end_int_day)
            info._object_name = this.getObjectName(copy)
            info.consume_lesson_hour = 1
            info.consume_lesson_amount = 0
            info.consume_source_type = 1
            info.int_hour_map = {
                0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[]
            }
            info.week_days = []
            copy.schedules.forEach(s => {
                if(info.week_days.indexOf(s.week_day)==-1) {
                    info.week_days.push(s.week_day)
                }
                info.int_hour_map[s.week_day].push({
                    int_start_hour: s.int_start_hour,
                    int_end_hour: s.int_end_hour
                })
            })
            if(copy.schedules.length) {
                info.student_limit = copy.schedules[0].student_limit
            }
            this.$Modal.open('business/arrange/plan/main-info-modal.vue',{
                on: {
                    'on-success':() => {
                        this.init_data()
                    }
                }
            })
            .then(modal => {
                modal.set('info',info)
                .show(util.sprintf('编辑排课计划【%s】',copy.name),'edit')
            })
        },
        delInfo (row) {
            if(row.course_arrange.no_attendance==0) {
                this.confirm(util.sprintf('确定要删除排课计划【%s】吗?',row.name))
                .then(()=>{
                    this.delete(row)
                })
            }else{
                this.$Modal.open('business/arrange/plan/delete-modal.vue',{
                    props: {
                        info: row
                    },
                    on: {
                        'on-success':() => {
                            this.init_data()
                        }
                    }
                })
                .then(modal => {
                    modal.show('确定删除')
                })
            }
        },
		resetSearch () {
			this.$r('ref_search').resetFields()
			this.init_data()
		}
    }
}
</script>