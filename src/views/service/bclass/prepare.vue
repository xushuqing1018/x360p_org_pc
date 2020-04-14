<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form :label-width="70" class="filter-form row" ref="ref_search" :model="search_field">
				<Form-item label="上课日期" class="col-md-3 mb-0" prop="create_time">
					<date-range-picker 
						v-model="search_field.int_day" 
						@on-change="search" 
						label="选择日期" 
						placement="bottom" 
						style="width:100%">
					</date-range-picker>
				</Form-item>
				<Form-Item label="课程" class="col-md-3 mb-0" prop="lid">
					<select-lesson v-model="search_field.lid" clearable></select-lesson>
				</Form-Item>
				<Form-Item label="班级" class="col-md-3 mb-0" prop="cid">
					<select-class v-model="search_field.cid" clearable></select-class>
				</Form-Item>
				<Form-Item :label="label_teacher" class="col-md-3 mb-0" prop="teach_eid" v-if="type_prepare=='all'">
					<select-employee v-model="search_field.teach_eid" clearable></select-employee>
				</Form-Item>
			</Form>
			<Row class="basic">
	            <Col span="24" class="mt-2" style="margin-left: 0;">
	            	<Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>     
	            	<!--<Button-group>-->
                        <!--<Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>-->
                    <!--</Button-group>-->
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                	<Button type="primary" @click="exportExcel('作业列表')" icon="ios-download-outline" class="ml-2" v-per="'reports.export'">导出</Button>
                	<div class="pull-right" v-per="'prepare.all'">
                        <per-scope per="prepare.all" @on-change="perScopeChange"></per-scope>
                   	</div>                	
	            </Col>
	        </Row>    
		</div>
		
		<div class="box box-result">
			<div class="toolbar">
	            <Button type="primary" @click="addInfo" icon="plus" v-per="'prepare.add'">备课</Button>
	            <!--<Button type="error" :disabled="ht_ids.length==0" @click="multiDel" icon="ios-trash">批量删除</Button>-->
	            <filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
	        	<div class="content-body">
		            <Table 
		            	v-loading="'course_prepares'" 
		            	ref="tableExcel"
		            	:page="pageIndex" 
		            	:page-size="pageSize" 
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
		                	@on-page-size-change="pagesize">
		                </Page>
		            </div>
		        </div>
			</div>
		</div>
		
		<info-modal ref="info" @on-success="init_data"></info-modal>
	</div>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectClass from 'c%/SelectClass.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import InfoModal from './prepare/info-modal.vue'
	
	export default{
		mixins: [ grid, globals, common],
		components: {
			InfoModal,
			SelectClass,
			SelectLesson,
			SelectEmployee,
			DateRangePicker
		},
		data () {
			return {
				rest_api: 'course_prepares',
				pk: 'cp_id',
				type_prepare: '',
				search_field: {
					int_day: [],
					lid: 0,
					cid: 0,
					teach_eid: 0
				},
				modal$: {
					action: 'list'
				},
				column_keys: {
					title: {
						title: '备课标题',
						show: true
					},
					teach_object: {
						title: '授课对象',
						show: true
					},
					lid: {
						title: '课程',
						show: true
					},
					teach_eid: {
						title: '授课'+this.$filter('translate')('老师'),
						show: true
					},
					int_day: {
						title: '上课日期',
						show: true
					},
					time_section: {
						title: '上课时段',
						show: true
					},
					sj_id: {
						title: '科目',
						show: false
					},
					is_push: {
						title: '是否推送',
						show: true
					}		
				},
				column_render: {
					title (h,params) {
						return h('a',{
							'class':'x-a-link text-info',
							on: {
								click: ()=>{
									this.viewInfo(params.row)
								}
							}
						},params.row.title)
					},
					teach_object(h,params){
				        let row = params.row
				        if(row.lesson_type == 0){        
				        	if(row.ca_id==0||row.cid>0){
				        		return h('div',[
					                h('Tag',row.one_class!=null?row.one_class.class_name:'')
					            ])
				        		
				        	}
				        	else{
				        		if(row.course_arrange.is_trial == 1||row.course_arrange.is_makeup==1){
									let name = '试'
									if(row.course_arrange.is_makeup ==1){
										name='补'
									}
					        		return h('div',[
						                h('Tag',{
						                    props:{
						                        color:'blue'
						                    }
						                },name),
						                h('Tag',row.course_arrange.name||row.course_arrange.course_name)
						            ])
					        	}
				        	}        	
				            
				        }else{
				            let tag,
				                students = []
				            row.students.forEach(s=>{
				                students.push(h('Tag',s.student_name))
				            })
				
				            return h('div',students)
				
				        }
				    },
					sj_id(h,params) {
						return h('span',this.$filter('subject_name')(params.row.sj_id))
					},
					is_push(h,params) {
						let map = {0: '待推送',1: '已推送'}
						let map_class = {0:'',1:'text-success'}
						return h('span',{
							'class':map_class[params.row.is_push]
						},map[params.row.is_push])
					}
				},
				operation_keys: {
					view: {
						title: '查看',
						type: 'eye'
					},
					push: {
						title: '推送',
						type: 'paper-airplane',
						condition: 'row.is_push==0&&row.int_day >= '+parseInt(moment(new Date()).format("YYYYMMDD"))
					},
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'prepare.edit'
					},
					del: {
						title: '删除',
						type: 'ios-trash',
						per: 'prepare.delete'
					}
				},
				operation_func: {
					view (params) {
						this.viewInfo(params.row)
					},
					push (params) {
						this.pushInfo(params.row)
					},
					edit (params) {
						this.editInfo(params.row)
					},
					del (params) {
						this.delInfo(params.row)
					}
				}
			}
		},
		watch: {
			'type_prepare':function (val) {
				this.init_data()
				this.column_keys.teach_eid.show = val==1
			}
		},
		methods: {
			perScopeChange(value) {
	            this.type_prepare = value
	        },	
			pushInfo (row) {
				this.$rest('course_prepares/wechat_notify?cp_id='+row.cp_id).get()
				.success(data=>{
					this.$Message.success('推送成功！')
					this.init_data()
				}).error(response=>{
					this.$Message.success(response.body.message||'推送失败~')
				})
			},
			viewInfo (row) {
				this.$router.push({path: '/service/prepare/'+row.cp_id,params: {id:row.cp_id}})	
			},
			addInfo () {
				this.$refs.info.show('添加备课','add')
			},
			editInfo (row) {
				let title = util.sprintf('编辑备课【%s】',row.title)
				
				this.$refs.info
				.set('cp_id',row.cp_id)
				.show(title,'edit')
			},
			delInfo (row) {
				let tip = util.sprintf('确认删除备课【%s】吗？',row.title)
				this.confirm(tip)
				.then(()=>{
					this.delete(row)
				})
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				params.with = 'course_arrange'
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}
					else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				if(this.type_prepare=='my'){
					params.teach_eid = this.eid$
				}
			}
		},
		computed: {
			
		}
	}
</script>

<style>
</style>