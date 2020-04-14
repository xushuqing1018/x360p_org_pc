<template>
 	<div class="c-grid">
	    <div class="box box-query">
	        <Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
	        	<Form-item label="班级名称" prop="cid" class="col-md-3 col-sm-6">	        		
	        		<select-class v-model="search_field.cid" clearable></select-class>
	        	</Form-item>
	        	<Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
                    <select-student v-model="search_field.sid" clearable></select-student>
                </Form-item>
	        	<Form-item label="上课日期" prop="int_day" class="col-md-3 col-sm-6">
    				<date-range-picker 
    					v-model="search_field.int_day" 
    					@on-change="init_data" 
    					label="选择日期" 
    					placement="bottom" 
    					style="width:100%">
					</date-range-picker>
    			</Form-item>
                <Form-item :label="label_teacher" prop="teach_eid" class="col-md-3 col-sm-6">
                    <select-employee v-model="search_field.teach_eid" clearable></select-employee>
                </Form-item>
                <template v-if="searchExpand">
        			<Form-item label="课程" prop="lid" class="col-md-3 col-sm-6">
        				<select-lesson v-model="search_field.lid" clearable></select-lesson>
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
                    
                    <export-button res="course_arrange_students" :params="params"></export-button>
                    
                	<CheckboxGroup 
                		v-model="search_field.is_attendance" 
                		class="ml-3"
                		style="display: inline-block;">
                		<Checkbox :label="1" :readonly="readOnly(1,'is_attendance')">已考勤</Checkbox>
                		<Checkbox :label="0" :readonly="readOnly(0,'is_attendance')">未考勤</Checkbox>
                	</CheckboxGroup>
					<Button type="default" icon="status" @click="arrangeStudent">约课排队学员</Button>
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
                    v-loading="'course_arrange_students'" 
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
import dateRangePicker from 'c%/DateRangePicker.vue'
import ExportButton from 'c%/ExportButton.vue'

export default {
	name:'arrangeList',
    mixins:[common,grid,globals],
    components: {
        selectStudent,
    	selectClass,    	
    	selectLesson,
    	selectEmployee,
        dateRangePicker,
        ExportButton
    },
    data() {
        return {
            rest_api: 'course_arrange_students',
            res_name: '约课记录',
            pk: 'cas_id',
            search_field: {
            	cid: 0,
            	int_day: [],
                sid:0,
            	is_attendance: [0,1],
                teach_eid: 0
            },
            column_keys:{
            	student_name: {
            		title: '学员',
            		show: true
            	},
                bid:{
                    title:'校区',
                    show:false,
                },
                pj_id:{
                    title:'项目',
                    show:false
                },
                lid:{
                    title:'班级/课程',
                    show:true
                },
                sj_id:{
                    title:'科目',
                    sortable:'custom',
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
                cr_id:{
                    title:'预约座位',
                    show:true
                },
                bk_time:{
                	title: '预约时间',
                	show: true
                },
                is_attendance:{
                	title:'考勤',
                	sortable:'custom',
                	show:true
                }
            },
            column_render: {
            	student_name(h,params) {
            		return h('span',params.row.student?params.row.student.student_name:'-')
            	},
            	int_start_hour (h,params) {
            		return h('span',this.$filter('int_hour')(params.row.int_start_hour))
            	},
            	int_end_hour (h,params) {
            		return h('span',this.$filter('int_hour')(params.row.int_end_hour))
            	},
            	teach_eid (h,params) {
            		return h('span',this.$filter('ename')(params.row.course_arrange.teach_eid,'-'))
            	},
            	cr_id (h,params) {
            		let cr_id = params.row.course_arrange.cr_id
            		let bk_seat = params.row.bk_seat
            		let seat = ''
					if(bk_seat&&bk_seat!=='0-0') {
						let arr = bk_seat.split('-')
						seat = arr[0]+'排'+arr[1]+'座'
					}
            		if(cr_id) {
            			return h('span',this.$filter('classroom_name')(cr_id) +' '+ seat)
            		}else{
            			return h('span','-')
            		}
            	},
            	lid(h,params) {
            		let map = {0:'班',1:'一',2:'多'}
            		let type = params.row.course_arrange.lesson_type
            		let tag = h('Tag',{
            			props: {
            				color:type==0?'blue':'green'
            			}
            		},map[type])
            		let name = ''
            		if(type==0) {
            			if(params.row.one_class) {
            				name = params.row.one_class.class_name
            			}
            		}else{
            			name = this.$filter('lesson_name')(params.row.lid)
            		}
            		return h('div',[tag,' ',name])
            	},
                is_attendance(h,params){
                	let map_tag =  {
	                		0:{color:'default',label: '未考勤'},
	        				1:{color:'green',label: '已考勤'},
	        				2:{color:'red',label: '请假'}
	                	}
	                	let status = params.row.is_attendance
	                	if(params.row.is_leave) {
	                		status = 2
	                	}
	                	let tag = map_tag[status]
	                return h('Tag',{
	                    props:{
	                        color: tag.color
						}
	                },tag.label)
                }
            },
            operation_keys: {
                edit: {
                    title: '编辑',
                    type: 'edit',
                    per: 'bk.edit',
                    condition: 'row.is_attendance==0&&row.course_arrange.lesson_type==1'
                },
                delete: {
                    title: '取消预约',
                    type: 'ios-trash',
                    per: 'bk.delete',
                    condition: 'row.is_attendance===0'
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
    created(){
        if(!this.enable_project){
            delete this.column_keys['pj_id']
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
       		params.with = 'one_class,student,course_arrange,student_leave'
       		params.is_bk = 1
       		let search_obj = util.copy(this.search_field)
			for(let o in search_obj) {
				let property = search_obj[o]
				if(o=='int_day'){
					if(property!=','&&property.length>0){
						params[o] = util.sprintf('[between,%s]',property.join(','))
					}												
				}else if (o=='is_attendance'){
					if(property.length == 1){
                        if(property[0] == 1) {
                            params[o] = '[in,1,2]'
                        }else if(property[0] == 0) {
                            params[o] = '[in,0]'
                        }
					}
				}else{
					if(property&&property!='-1'){
						params[o] = property
					}
				}
			}
        },
        editInfo (row) {
            this.$Modal.open('business/arrange/bk/info-modal.vue',{
                on: {
                    'on-success':() => {
                        this.init_data()
                    }
                }
            })
            .then(modal => {
                let info = {
                    consume_lesson_hour: Number(row.course_arrange.consume_lesson_hour),
                    teach_eid: row.course_arrange.teach_eid
                }
                modal
                .set('cas_id',row.cas_id)
                .set('info',info)
                .show(util.sprintf('编辑约课记录【%s】',row.student.student_name))
            })
        },
        delInfo (row) {
        	this.confirm('您确定要取消这条约课吗?')
            .then(()=>{
                this.delete(row)
            })       
        },
		resetSearch () {
			this.$r('ref_search').resetFields()
			this.search_field.is_attendance = [0,1]
			this.init_data()
		},
		arrangeStudent(){
			this.$Modal.open('business/arrange/arrange-student.vue@modal',{
				on: {
					'on-success':() => {
						this.init_data()
					}
				}
			})
			.then(modal => {
				modal.show('约课排队学员')
			})
		}
    }
}
</script>