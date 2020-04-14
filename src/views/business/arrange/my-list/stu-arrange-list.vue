<template>
	<div>
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
	        	<Form-item label="上课时间" prop="int_day" class="col-md-3 col-sm-6">
    				<DatePicker 
	    				v-model="search_field.int_day" 
	    				@on-change="search_field.int_day = $event" 
	    				placeholder="选择日期" 
	    				placement="bottom" 
	    				style="width:100%">
    				</DatePicker>
    			</Form-item>
    			<Form-item label="课程" prop="lid" class="col-md-3 col-sm-6">
    				<select-lesson v-model="search_field.lid" clearable></select-lesson>
    			</Form-item>
    			<Form-item label="科目" prop="lid" class="col-md-3 col-sm-6">
    				<select-subject v-model="search_field.sj_id" clearable></select-subject>
    			</Form-item>
	        </Form>
	        <Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="init" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
                	<Button type="primary" @click="exportExcel('排课列表')" icon="ios-download-outline" class="ml-2" v-per="'reports.export'">导出
                	</Button>
                	<div class="pull-right">
                        <per-scope per="arrange.checkAll" :show-my="true" @on-change="perScopeChange"></per-scope>
                    </div>
                </Col>
          	</Row>
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<span v-if="info.name" style="line-height:2.2">{{listName}}</span>
				<Button type="primary" icon="plus" @click="addArrange" :disabled="info.lid==0">添加排课</Button>
				<filter-column :keys="column_keys"></filter-column>
			</div>
			<div class="content">
		        <div class="content-body">
		            <Table 
		            v-loading.like="'course_arranges'" 
		            ref="tableExcel"
		            :page-size="pageSize" 
		            :page="pageIndex"
		            :stripe="true" 
		            :show-header="true" 
		            :data="data" 
		            :columns="columns" 
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
		                @on-page-size-change="pagesize"
		                >
		                </Page>
		            </div>
		        </div>    
		    </div>
		</div>
		<class-arrange-info-modal
			:object-fixed="object_fixed"
			@save="refreshArrange"
			ref="classArrangeInfoModal">
		</class-arrange-info-modal>
		
		<attendance-modal ref="attendance" @on-success="refreshArrange"></attendance-modal>
	</div>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectSubject from 'c%/SelectSubject.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import classArrangeInfoModal from '../../class/arrange/info-modal.vue'
	
	import AttendanceModal from '../../attendance/attendance/index.vue'
	
	const emptyObject = {	
		cid: 0,
		lesson_type:-1,
		lid:0,
		name:'',
		_class_name:'',
		sj_id:0,
		chapter_index:0,
		is_attendance:0,
		int_day:'',
		int_start_hour:'',
		int_end_hour:'',
		teach_eid:0,
		second_eid:0,
		is_trial: 0,
		cr_id:0,
		isloop:1,
		loop_times:1,
		loop_arranges:[],
		students:[]
	}

	export default{
		mixins: [common,globals,grid],
		components: {
			classArrangeInfoModal,
			AttendanceModal,
			SelectLesson,
			SelectSubject
		},
		props: {
			info: {
				type: Object,
				default:()=>{
					return {}
				}
			}
		},
		data () {
			return {
				res_name: '排课记录',
	            pk: 'ca_id',
	            datakey:'course_arranges',
	            rest_api:'course_arranges',
				search_field: {
	            	int_day: '',
	            	sj_id: 0,
	            	lid: 0
	            },           
				column_keys:{            	
	                bid:{
	                    title:'校区',
	                    show:false,
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
	                teach_eid:{
	                    title:this.$filter('translate')('老师'),
	                    show:true,
	                },
	                second_eid:{
	                    title:'助教',
	                    show:false,
	                },
	                teach_object:{
	                    title:'授课对象',
	                    show:true
	                },
	                cr_id:{
	                    title:'教室',
	                    show:true
	                },
	                is_attendance:{
	                	title:'考勤',
	                	show:true
	                },
	                sj_id:{
                        title:'科目',
                        sortable:'custom',
                        show:true
                    },
                    grade:{
                        title:'年级',
                        sortable:'custom',
                        show:true
                    },
	            },
	            column_render: {
	                is_attendance(h,params){
	                	let map_tag =  {
		                		0:{color:'default',label: '未考勤'},
		            			1:{color:'yellow',label: '部分考勤'},
		        				2:{color:'green',label: '已考勤'}
		                	},
		                	tag = map_tag[params.row.is_attendance]
	                   
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
	                	per: 'arrange.edit'
	                },
	                attend: {
	                    title: '登记考勤',
	                    type: 'calendar',
	                    condition: 'row.is_attendance!==2'
	                },
	                checkAttendance: {
	                	title: '查看考勤',
	                	type: 'calendar',
	                	condition: 'row.is_attendance==2'
	                },
	                delete: {
	                	title: '删除排课',
	                	type:'ios-trash',
	                	per:'arrange.delete',
	                	condition: 'row.is_attendance==0'
	                }
	            },
	            operation_func:{
	                attend (params){
	                	this.attendance(params.row)
	                },
	                checkAttendance (params) {
	                	this.attendance(params.row)
	                },
	                edit(params) {
	                	this.edit(params.row)
	                },
	                delete(params) {
	                	this.deleteArrange(params.row)
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
			this.init()
		},
		computed: {
			listName() {
				let lesson_name = this.info.lid ? this.$filter('lesson_name')(this.info.lid):'一对一'
				return util.sprintf('【%s】的%s排课：',this.info.name,lesson_name)
			},
			object_fixed() {
				let obj = {
					int_day: '',
					ts_array: [],
					teach_eid: 0,
					cr_id: 0
				}
				obj.student_lesson_item = this.info.data
				return obj
			}
		},
		methods: {
			perScopeChange(value) {
	            this.$emit('on-check',value)
	        },
			hook_get_param (params) {
				params.with = 'students,one_class'
				params.lesson_type = 1
				params.sid = this.info.id
				if(this.info.lid>0) {
					params.lid = this.info.lid
				}
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day') {
						if(property!=='') {
							params[o] = moment(property).format('YYYYMMDD')
						}
					}else{
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init()
			},
			init() {
				if(this.info.id>0) {
					this.pagenation(1)
				}
			},
			deleteArrange (row) {
	        	this.confirm('您确定要删除这条排课信息吗?')
	            .then(()=>{
	                this.delete(row)
	                .then((response)=>{
	                    this.$Message.success('删除成功!')
	                    this.refreshArrange()
	                })
	            })       
	        	
	        },
	        edit (row){
	            let obj = util.copy(row),
	                ts_array = [],
	             	classInfo = {
	            		cid: row.cid,
	            		lid: row.lid,
	            		class_name: ''
	            	}
	            ts_array.push(this.$filter('int_hour')(obj.int_start_hour))
	            ts_array.push(this.$filter('int_hour')(obj.int_end_hour))
				obj.int_day = obj.int_day.toString()
				
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
			addArrange() {
				this.$r('classArrangeInfoModal').show('添加单次排课','add')
			},
			refreshArrange() {
				this.init()
			},
			attendance(row) {
				/*
				let name = this.setName(row),					
					title = util.sprintf('登记考勤【%s】',name)
					
				if(row.is_attendance===2){
					title = util.sprintf('查看考勤【%s】',name)
				}
				this.$r('attendanceClass')
				.set('course_arrange',row)
				.set('ca_id',row.ca_id)
				.show(title,'add')*/
				let class_name = this.setName(row),					
					title = util.sprintf('登记考勤【%s】',class_name)
					
				if(row.is_attendance===2){
					title = util.sprintf('查看考勤【%s】',class_name)
				}
				
				this.$r('attendance')
				.set('arrange',row)
				.set('ca_id',row.ca_id)
				.show(title,'add')
			},
			setName (item) {
				let result = ''
				
				if(item.lesson_type===0){
					if(item.is_trial===1||item.is_makeup===1){
						result = item.name
					}else{
						if(item.one_class!=null){
							result = item.one_class.class_name
						}	
					}	
				}else{
					let students = item.students
					if(students.length>0){
						students.forEach((s,i)=>{
							if(i<3){
								result += s.student.student_name+','
							}
						})
					}
					
					result = result.substring(0,result.length-1)
					
					if(students.length>3){
						result += '等'
					}
				}
							
				return result
			}
		},
		watch: {
			info(info) {
				this.init()
			}
		}
	}
</script>