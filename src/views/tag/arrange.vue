<style scoped>
.table-title {
	font-weight: bold;
	margin-right: 15px
}
</style>

<template>
 	<div class="c-grid">
	    <div class="box box-result">
	        <div class="toolbar" style="margin: 15px 0px">
				<span class="table-title"><Icon type="pricetag"></Icon> 包含标签【{{this.tagName}}】的排课列表</span>
	            <Button type="primary" @click="multiChangeInfo" icon="shuffle" v-per="'class.arrange'">批量调课</Button>
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
		
		<class-arrange-info-modal
			@save="refreshArrange"
			ref="classArrangeInfoModal">
		</class-arrange-info-modal>
		<multi-change-info
			@save="refreshArrange"
			ref="multiChangeInfo">			
		</multi-change-info>
		<arrange-students-modal
			@save="refreshArrange"
			ref="arrangeStudentsModal">			
		</arrange-students-modal>
		<class-arrange-students
			@save="refreshArrange"
			ref="classArrangeStudent">			
		</class-arrange-students>
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
import classArrangeInfoModal from '../business/class/arrange/info-modal.vue'
import MultiChangeInfo from '../business/class/arrange/multi-change-info.vue'
import ArrangeStudentsModal from '../business/arrange/arrange-students-modal.vue'
import ClassArrangeStudents from '../business/arrange/class-arrange-student/students-modal.vue'
import SelectTextbook from 'c%/SelectTextbook.vue'
import TagLabel from 'c%/TagLabel.vue'

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
        MultiChangeInfo,
        ClassArrangeStudents,
        ArrangeStudentsModal,
        classArrangeInfoModal,
        ExportButton,
        SelectTextbook
	},
	props: {
		tagId: {
			type: Number,
			default: 0
		},
		tagName: {
			type: String,
			default: ''
		}
	},
    data() {
        return {
            mode:'table',
            rest_api: 'tag_relations',
            res_name: '排课记录',
            pk: 'ca_id',
            datakey:'course_arranges',      
            showCheckbox: true,
            ca_ids: [],
            total_consume_lesson_hour:0.00,
            page_consume_lesson_hour:0.00,
            search_field: {
				tag_id: 0,
				tag_type: 4
            },
            sectionData: [],
            column_keys:{            	
                // tag:{
                //     title:'标签',
                //     show:true
                // },
                bid:{
                    title:'校区',
                    sortable:'custom',
                    show:true,
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
                is_attendance:{
                	title:'考勤',
                	sortable:'custom',
                	show:true
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
			                students = []
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
			
			            row.students.forEach(s=>{
			                students.push(h('Tag',s.student.student_name))
			            })
			
			            return h('div',[
			                    tag,
			                    h('span',students)
			            ])
			
			        }
		        },
            	// tag (h,params) {
            	// 	return h(TagLabel, {
				// 		props: {
				// 			list: params.row.tags,
				// 			type: 4,
				// 			id: params.row.ca_id,
				// 			objName: '【排课】标签管理'
				// 		},
				// 		on: {
				// 			update: () => {
				// 				this.init_data()
				// 			}
				// 		}
				// 	})
            	// },
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
	        				2:{color:'green',label: '已考勤'}
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
	                return h('Tag',{
	                    props:{
	                        color: tag.color
						},
						on: {
							click: function() { vm.showAttendModal(params.row) }
						}
	                },tag.label)
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
                	condition: 'row.lesson_type!=1&&row.is_attendance==0'
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
		if('is_attendance' in this.$route.query&&this.$route.query.is_attendance == 0) {
			this.search_field.int_day = [moment().format('YYYY-MM-DD'),moment().format('YYYY-MM-DD')]
			this.search_field.is_attendance = [0]
		}
    },
    mounted () {
		this.search_field.tag_id = this.tagId;
        this.init_data()
	},
	watch: {
		tagId(val) {
			this.search_field.tag_id = val;
			this.init_data();
		},
	},
	methods: {
		deal_data(data){
			let array = [];
			data.list.forEach(item => {
				array.push(item.course_arrange)
			})
			return array
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
				this.$r('arrangeStudentsModal')
				.set('info',row)
				.show(title,'add')
			}else{
				this.$r('classArrangeStudent')
				.set('lid',row.lid)
				.set('ca_id',row.ca_id)
				.show(title,'add')
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
                            params[o] = '[in,1,2]'
                        }else if(property[0] == 0) {
                            params[o] = '[in,0]'
                        }
					}
				}else if(o=='lesson_type'){
					if(property!=','&&property.length>0){
						params[o] = util.sprintf('[In,%s]',property.join(','))
					}	
				}else if(o=='is_cancel'){
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
			
			this.$r('classArrangeInfoModal')
			.set('classInfo',classInfo)
            .set('ts_array',ts_array)
			.set('info',obj)
			.show(title,'edit')
        },
        addInfo () {        	
        	this.$r('classArrangeInfoModal')
			.show('简单排课','add')        	
        },
        multiAddInfo () {
			
			this.$Modal.open('business/class/arrange/multi-add-modal.vue',{
				on: {
					'on-success': ()=>{
						console.log('list-init-data')
						this.init_data()
					}
				}
			})
			.then(modal=>{
				modal.show('规律排课','add')
			})
			
		},
		multiChangeInfo () {
			this.$r('multiChangeInfo')
			.show('批量调课','add')
		},
		resetSearch () {
			this.$r('ref_search').resetFields()
			this.search_field.is_attendance = [0,1]
			this.init_data()
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
        }
    },
    computed: { 
        classrooms () {
        	return this.$store.state.gvars.classrooms.filter(c=>c.bid==this.bid$)
        }
    }
}
</script>