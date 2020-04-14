<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="900">
		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
			<Form-item label="课程" prop="lid" class="col-sm-4">
				<select-lesson v-model="search_field.lid" clearable></select-lesson>
			</Form-item>
			<Form-item label="科目" prop="sj_id" class="col-sm-4">
				<select-subject v-model="search_field.sj_id" clearable></select-subject>
			</Form-item>
			<Form-item label="课时数" prop="lesson_hours" class="col-sm-4">
				<select-age v-model="search_field.lesson_hours"></select-age>
			</Form-item>
			<FormItem label="校区" prop="bid" class="col-sm-4">
            	<select-branch v-model="search_field.bid" clearable></select-branch>
            </FormItem>
			<Form-item label="导入时间" prop="create_time" class="col-sm-4">
				<date-range-picker 
					v-model="search_field.create_time" 
					@on-change="search" 
					type="datetimerange"
					format="yyyy-MM-dd HH:mm:ss"
					placement="bottom"
					style="width:100%">
				</date-range-picker>					
			</Form-item>
			<Form-item label="操作人" prop="create_uid" class="col-sm-4">
				<select-employee v-model="search_field.create_uid" mode="user" clearable></select-employee>
			</Form-item>
		</Form>
		<Row class="basic">
            <Col span="24" class="mt-2 mb-2">
            	<Button class="ml-2" type="primary" size="small" icon="ios-search" @click="search">查询</Button>
            	<Button class="ml-2" type="primary" size="small" icon="refresh" @click="resetSearch">重置</Button>
            </Col>
        </Row>      
		<div class="content-body">
	        <Table 
		        v-loading="'student_lesson_import_logs'" 
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
	        <div class="clearfix">
	            <Page 
	            	class="pull-right mt-2"
	            	size="small"
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
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="error" @click="ok">确定删除</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectBranch from 'c%/SelectBranch.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectSubject from 'c%/SelectSubject.vue'
	import SelectAge from 'c%/SelectAge.vue'

	export default {
		mixins:[globals,common,grid,modal],
		props: {
			info: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		components: {
			DateRangePicker,
			SelectEmployee,
			SelectBranch,
			SelectLesson,
			SelectSubject,
			SelectAge
		},
		data() {
			return {
				rest_api: '',
				search_field: {
					create_time: [],
					create_uid: 0,
					lid: 0,
					sj_id: 0,
					bid:0,
					lesson_hours: []
				},
				column_keys: {
					student_name: {
						title:'学员姓名',
						show:true
					},
					bid: {
						title: '校区',
						show: true
					},
					sj_ids:{
						title:'适用科目',
						show:true
					},
					lid:{
						title:'课程名称',
						show:true
					},
					lesson_hours:{
						title:'课时数量',
						show:true
					},
					unit_lesson_hour_amount: {
						title:'课时单价',
						show:true
					},
					create_time: {
						title:'导入时间',
						show:true
					},
					create_employee_name: {
						title: '操作人',
						show:true
					}
				},
				column_render: {
					student_name(h,params) {
						return h('span',params.row.student.student_name)
					},
					unit_lesson_hour_amount(h,params) {
						return h('span',this.label_currency+params.row.unit_lesson_hour_amount)
					},
					create_time(h,params) {
						return h('span',params.row.create_time)
					}
				}
			}
		},
		mounted() {
			this.rest_api = this.info.url
			this.init_data()
		},
		methods: {
			ok() {
				let search = util.copy(this.search_field),
					params = {}

				for(let o in search) {
					let prop = search[o]
					if(o=='lesson_hours') {
						let start = util.int(prop[0])
						let end = util.int(prop[1])
						if(start>=0&&end>0&&end>=start){
							params['start_lesson_hours'] = start
							params['end_lesson_hours'] = end
						}						
					}else if(o == 'create_time') {
						if(prop != ',' && prop.length > 0){
	                        params['create_start_time'] = prop[0]
	                        params['create_end_time'] = prop[1]
	                    } 
					}else{
						if(prop&&prop!=-1){
							params[o] = prop
						}
					}
				}
				this.$rest(this.rest_api).add_url_param('delete_condition')
				.post(params)
				.success(res => {
					this.$Message.success('删除成功')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property.length > 0) {
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}											
					}else if(o=='lesson_hours') {
						let start = util.int(property[0])
						let end = util.int(property[1])
						if(start>=0&&end>0&&end>=start){
							params[o] = util.sprintf('[Between,%s,%s]',start,end)
						}						
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				params.with = 'student,create_employee'
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			undoImportHour(row) {
				this.confirm('确定要撤销导入课时记录吗？')
				.then(() => {
					this.$http.delete('student_lesson_import_logs/'+row.slil_id)
					.then(res => {
						this.$Message.success('撤销成功')
						this.$emit('on-success')
						this.init_data()
					},res => {
						this.error(res.body.message)
					})
				})
			},
		}
	}
</script>