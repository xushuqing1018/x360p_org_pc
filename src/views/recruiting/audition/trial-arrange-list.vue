<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="试听课名称" :label-width="80" prop="name" class="col-md-3 col-sm-6">	        		
	        		<Input v-model="search_field.name" clearable placeholder="请输入"></Input>
	        	</Form-item>
	        	<Form-item label="上课时间" prop="int_day" class="col-md-3 col-sm-6">
    				<date-range-picker v-model="search_field.int_day" @on-change="search" label="选择日期" placement="bottom" style="width:100%"></date-range-picker>
    			</Form-item>
    			<Form-item label="科目" prop="sj_id" class="col-md-3 col-sm-6">
    				<select-subject v-model="search_field.sj_id" clearable></select-subject>
    			</Form-item>
    			<Form-item :label="label_teacher" prop="teach_eid" class="col-md-3 col-sm-6">
    				<select-employee :rid="1" v-model="search_field.teach_eid" clearable></select-employee>
    			</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button type="primary" @click="search" icon="ios-search">查询</Button>     
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  

                	<export-button res="trial_arranges" :params="params"></export-button>

                </Col>
           </Row>		
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<Button type="primary" icon="plus" @click="addTrialArrange" v-per="'aclist.add'">试听排课</Button>
				<filter-column :keys="column_keys"></filter-column>   
			</div>
			<div class="content">
				<div class="content-body">
		            <Table 
		            	v-loading.like="'course_arranges'" 
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
		                	transfer
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
		<!-- <trial-info-modal ref="trial_info" @save="init_data"></trial-info-modal> -->
		<class-arrange-students ref="classArrangeStudent" :arrange-type="'trial'" @save="init_data"></class-arrange-students>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectSubject from 'c%/SelectSubject.vue'
	import ArrangeStudentsModal from '../../business/arrange/arrange-students-modal.vue'
	import ClassArrangeStudents from '../../business/arrange/class-arrange-student/students-modal.vue'

	import ExportButton from 'c%/ExportButton.vue'
	
	export default {
		mixins: [modal,grid,common,globals],
		components: {
			SelectEmployee,
			SelectSubject,
			DateRangePicker,
			ArrangeStudentsModal,
			ClassArrangeStudents,

			ExportButton
		},
		data() {
			return {
				rest_api: 'course_arranges',
				pk: 'ca_id',
				search_field: {
					name: '',
					int_day: [],
					sj_id: 0,
					teach_eid: 0
				},
				column_keys:{
					teach_object:{
	                    title:'试听课名称',
	                    show:true
	                },            	
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
	                    show:true,
	                },
	                second_eid:{
	                    title:'助教',
	                    show:false,
	                },
	                sj_id:{
	                	title:'科目',
	                	show: true
	                },
	                cr_id:{
	                    title:'教室',
	                    sortable:'custom',
	                    show:true
	                },
	                listen_apply_nums: {
	                	title: '试听人次',
	                	show: true
	                },
	                listen_arrive_nums: {
	                	title: '已登记试听',
	                	show: true
	                },
	                is_attendance:{
	                	title:'考勤',
	                	sortable:'custom',
	                	show:true
	                }
	            },
	            column_render: {
	            	teach_object (h,params) {
	            		return h('Tag',params.row.name)
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
		        				2:{color:'green',label: '已考勤'}
		                	},
		                	tag = map_tag[params.row.is_attendance]
	                   
		                return h('Tag',{
		                    props:{
		                        color: tag.color
							},
							on: {
								click: () => {
									this.showAttendModal(params.row);
								}
							}
		                },tag.label)
	                }                 
	            },
	            operation_keys: {
	                edit: {
	                    title: '编辑',
	                    type: 'edit',
	                    per: 'aclist.edit'
	                },
	                arrange_student: {
	                	title: '试听学员管理',
	                	type: 'person-add',
	                	condition: 'row.is_attendance==0',
	                	per: 'aclist.student'
	                },
	                delete: {
	                    title: '删除',
	                    type: 'ios-trash',
	                    condition: 'row.is_attendance===0',
	                    per: 'aclist.delete',
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
	                }
	            }
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
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
			delInfo (row) {
				let tip = util.sprintf('确定删除【%s】吗？',row.name)
				this.confirm(tip)
				.then(()=>{
					this.delete(row)
				})
			},
			addTrialArrange() {
				this.$Modal.open('recruiting/audition/trial-info-modal',{
					on: {
						'save':() => {
							this.init_data()
						}
					}
				})
				.then(modal =>{
					modal.show('添加试听课','add')
				})
			},
			arrageStudentOperate (row) {
				let title = util.sprintf('添加试听学员【%s %s~%s】',
								this.$filter('int_date')(row.int_day),
								this.$filter('int_hour')(row.int_start_hour),
								this.$filter('int_hour')(row.int_end_hour))
				
				this.$r('classArrangeStudent')
				.set('lid',row.lid)
				.set('ca_id',row.ca_id)
				.show(title,'add')
			},
			editInfo(row) {
				let obj = util.copy(row),
	                ts_array = []
	            ts_array.push(this.$filter('int_hour')(obj.int_start_hour))
	            ts_array.push(this.$filter('int_hour')(obj.int_end_hour))
				obj.int_day = String(obj.int_day)
				let title = util.sprintf(
						'调整试听排课时间:%s %s~%s',
						this.$filter('int_date')(row.int_day),
						this.$filter('int_hour')(row.int_start_hour),
						this.$filter('int_hour')(row.int_end_hour)
					)
				this.$Modal.open('recruiting/audition/trial-info-modal',{
					on: {
						'save':() => {
							this.init_data()
						}
					}
				})
				.then(modal =>{
					modal
					.set('ts_array',ts_array)
					.set('info',obj)
					.show(title,'edit')
				})
			},
			hook_get_param(params) {
				params.with = 'one_class,students'
				params.is_trial = 1
	       		let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
			},
			resetSearch () {
				console.log(this.search_field)
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		},
		computed: {

		}
	}
</script>