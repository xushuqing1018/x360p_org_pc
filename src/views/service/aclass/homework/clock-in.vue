<template>
	<div>
		<div class="box box-query">
			<Form :label-width="70" class="filter-form row" ref="ref_search" :model="search_field">
				<Form-Item :label="label_teacher" class="col-md-3 mb-0" prop="eid" v-if="type_homework=='all'">
					<select-employee v-model="search_field.eid" clearable></select-employee>
				</Form-Item>

				<Form-Item label="学员" class="col-md-3 mb-0" prop="sid">
					<select-student v-model="search_field.sid" clearable></select-student>
				</Form-Item>
				<Form-Item label="班级" class="col-md-3 mb-0" prop="cid">
					<select-class v-model="search_field.cid" clearable></select-class>
				</Form-Item>
				<Form-item label="布置时间" class="col-md-3 mb-0" prop="create_time">
					<date-range-picker 
						v-model="search_field.create_time" 
						@on-change="search" 
						label="选择日期" 
						placement="bottom" 
						style="width:100%">
					</date-range-picker>
				</Form-item>
				<template v-if="searchExpand">
				<Form-Item label="课程" class="col-md-3 mb-0" prop="lid">
					<select-lesson v-model="search_field.lid" clearable></select-lesson>
				</Form-Item>
				</template>		
			</Form>
			
			<Row class="basic">
	            <Col span="24" class="mt-2" style="margin-left: 0">
	            	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>     
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                	<Button type="primary" @click="exportExcel('作业列表')" icon="ios-download-outline" class="ml-2" v-per="'reports.export'">导出</Button>
                	<div class="pull-right">
                        <per-scope per="homework.all" @on-change="perScopeChange"></per-scope>
                  </div>                	
	            </Col>
	        </Row>    
		</div>
		
		<div class="box box-result">
			<div class="toolbar">
	            <!-- <Button type="primary" @click="homeworkAdd" icon="plus" v-per="'homework.add'">布置作业</Button> -->
				<Dropdown>
			        <Button type="primary">布置作业
						<Icon type="arrow-down-b"></Icon></Button>
			        <DropdownMenu slot="list">
			            <DropdownItem @click.native="homeworkAdd" v-per="'homework.add'">课后作业</DropdownItem>
			            <DropdownItem @click.native	="homeworkTask">打卡作业</DropdownItem>
			        </DropdownMenu>
			    </Dropdown>
	            <!--<Button type="error" :disabled="ht_ids.length==0" @click="multiDel" icon="ios-trash">批量删除</Button>-->
	            <filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
	        	<div class="content-body">
		            <Table 
		            	v-loading="'homework_tasks'" 
		            	ref="tableExcel"
		            	:page="pageIndex" 
		            	:page-size="pageSize" 
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
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectClass from 'c%/SelectClass.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	
	export default{
		mixins: [ grid,common,globals ],
		components: {
			SelectLesson,
			SelectClass,
			SelectStudent,
			SelectEmployee,
			DateRangePicker
		},
		data () {
			return {
				type: 0,
				type_homework: '',
				rest_api: 'homework_tasks',
				pk: 'ht_id',
				data_mode: 'homeworkAdd',
				showCheckbox: false,
        ht_ids: [],
        result: '',
				search_field: {
					lid: 0,
					cid: 0,
					eid: 0,
					sid: 0,
					create_time: []
				},
				modal$: {
					action: 'list'
				},
				column_keys: {
					lid:{
						title: '课程',
						show: true
					},
					obj: {
						title: '作业对象',
						show: true
					},
					regular_type: {
						title: '作业类型',
						show: true
					},
					submitprogress: {
						title: '回复/完成/推送',
						show: true
					},
					eid: {
						title: this.$filter('translate')('老师'),
						show: true
					},									
					push_status: {
						title: '推送',
						show: true
					},
					start_time: {
						title: '开始日期',
						show: true
					},
					end_time: {
						title: '结束日期',
						show: true
          },
          weekdays: {
            title: '完成周期',
            show: false
          },
					remark: {
						title: '备注',
						show: true
					},
				},
				column_render: {
					lid (h,params) {
						return h('a',{
							'class':'x-a-link text-info',
							on: {
								click:()=>{
									this.detail(params.row)
								}
							}
						},this.$filter('lesson_name')(params.row.lid))
					},
					eid (h,params) {
						return h('span',this.$filter('ename')(params.row.eid)||'-')
					},
					obj (h,params) {
						let type = params.row.lesson_type,
							row = params.row,
							map_type = {0:'班课',1:'一对一',2:'一对多'},							
							label = h('Tag',{
								props: {
									color: 'blue',
									type:'border'
								}
							},map_type[type]),
							result = []
						
						// result.push(label)
						if(type==0){
							if(row.one_class){
								result.push(h('Tag',row.one_class.class_name))
							}
						}else{
							if(row.students.length){
								row.students.forEach(s=>{
									result.push(h('Tag',s.student_name))
								})
							}
						}						
						
						return h('div',result)
					},
					regular_type (h,params) {
						return h('span',this.$filter('homework_type')(params.row.is_regular)||'-')
					},
					submitprogress (h,params) {
						let result = util.sprintf('%s/%s/%s',params.row.homework_reply_count,params.row.homework_complete_count,params.row.students_count)
						return h('span',result)
					},
					push_status (h,params) {
						let map_status = {0:{label:'未推送',classes:'text-danger'},1:{label:'已推送',classes:'text-success'}}
						return h('span',{
							'class':map_status[params.row.push_status].classes
						},map_status[params.row.push_status].label)
					},
					start_time (h,params) {
						let time = this.$filter('int_date')(params.row.int_start_day),
							is_end = moment(time).isBefore(moment(new Date()))
						return h('span',{
							'class':is_end?'text-danger':'text-success'
						},params.row.int_start_day)
					},
					end_time (h,params) {
						let time = this.$filter('int_date')(params.row.int_end_day),
							is_end = moment(time).isBefore(moment(new Date()))
						return h('span',{
							'class':is_end?'text-danger':'text-success'
						},params.row.int_end_day)
          },
          weekdays (h,params) {
            let weekdays = this.completionCycle(params.row.weekdays)
            return h('span', weekdays)
          }
				},
				operation_keys: {
					view: {
						title: '查看详情',
						type: 'eye'		
					},
					edit: {
						title: '编辑',
						type: 'edit',
						condition: 'params.row.homework_complete_count==0'	//没有学员提交作业时可编辑
					},
					push: {
						title: '推送',
						type: 'paper-airplane',
						per: 'homework.push',
						condition: 'row.push_status==0'
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'homework.delete',
						condition: 'params.row.homework_complete_count==0'	//没有学员提交作业时可删除
					}
				},
				operation_func: {
					view (params) {
						this.detail(params.row)
					},
					edit (params) {
						this.editInfo(params.row)
					},
					push (params) {
						this.pushInfo(params.row)
					},
					delete (params) {
						this.delInfo(params.row)
					}
				}
			}
		},
		watch: {
			'type_homework': function (val) {
				this.init_data()
			}
		},
		mounted() {
      this.init_data()
			this.replaceSearchField()
		},
		beforeDestroy() {
	        this.setStateSearchDetail(false)
	    },
		methods: {
			perScopeChange(value) {
	            this.type_homework = value
	        },
			selectionChange (data) {
				this.ht_ids = []
				if(data.length){
					data.forEach(d=>{
						this.ht_ids.push(d.ht_id)
					})
				}
			},
			editInfo (row) {
				if(row.is_regular){
					this.$Modal.open('service/aclass/homework/homework-task.vue@modal',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal
					.set('ht_id',row.ht_id)
					.show('编辑作业','edit')
				})
				}else{
					this.$Modal.open('service/aclass/homework/homework-add.vue@modal',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal
					.set('ht_id',row.ht_id)
					.show('编辑作业','edit')
				})
				}
			},
			pushInfo (row) {
				this.$rest('homework_tasks/wechat_notify?ht_id='+row.ht_id).get()
				.success(data=>{
					this.$Message.success('推送成功！')
					this.init_data()
				}).error(response=>{
					this.$Message.success(response.body.message||'推送失败！')
				})				
			},
			delInfo (row) {
				this.confirm('确定删除本次作业吗？').then(()=>{
					this.delete(row)
				})
			},
			multiDel () {
				let tip = util.sprintf('您将删除【%s】次作业，删除后将无法恢复！',this.ht_ids.length)
				this.confirm(tip).then(()=>{
					
				})
			},
			detail (row) {
				this.setStateSearchInfo()
				this.$router.push({path: '/service/homework/'+row.ht_id,params: {id:row.ht_id}})	
			},			
			homeworkAdd () {
				this.$Modal.open('service/aclass/homework/homework-add.vue@modal',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('课后作业','add')
				})
			},
			homeworkTask () {
				this.$Modal.open('service/aclass/homework/homework-task.vue@modal',{
					on: {
						'on-success': () => {
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('打卡作业','add')
				})
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				params.is_regular = 1
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
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
				if(this.type_homework=='my'){
					params.eid = this.eid$
				}
      },
			completionCycle (weekdays) {
					let result = ''
				  let week_day_list = [
            	{label:'周一',value:'1'},
            	{label:'周二',value:'2'},
            	{label:'周三',value:'3'},
            	{label:'周四',value:'4'},
            	{label:'周五',value:'5'},
            	{label:'周六',value:'6'},
            	{label:'周日',value:'7'}
						]
						week_day_list.forEach(i => {
							weekdays.forEach(l => {
								if(i.value == l){
								result += i.label+' '
								}
							})
						})
        return result
			}
		}
	}
</script>

<style>
</style>