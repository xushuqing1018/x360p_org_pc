<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="900">
		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
			<Form-item label="学员姓名" prop="sid" class="col-sm-4">
				<select-student v-model="search_field.sid" clearable></select-student>
			</Form-item>
			<Form-item label="操作时间" prop="create_time" class="col-sm-4">
				<date-range-picker 
					v-model="search_field.create_time" 
					@on-change="search" 
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
			<Button type="ghost" @click="modal$.show=false">关闭</Button>
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
	import SelectStudent from 'c%/SelectStudent.vue'

	export default {
		mixins:[modal,globals,common,grid],
		components: {
			DateRangePicker,
			SelectEmployee,
			SelectStudent
		},
		data() {
			return {
				rest_api: 'student_lesson_import_logs',
				search_field: {
					create_time: [],
					create_uid: 0,
					sid: 0
				},
				column_keys: {
					student_name: {
						title:'学员姓名',
						show:true
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
						title:'操作时间',
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
						return h('span',moment(params.row.create_time).format('YYYY-MM-DD'))
					},
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						per:'importhour.edit'
					},
					undo: {
						title: '撤销导入',
						type: 'ios-undo',
						per:'importhour.undo'
					}
				},
				operation_func: {
					edit(params) {
						this.editImportHour(params.row)
					},
					undo(params) {
						this.undoImportHour(params.row)
					}
				}
			}
		},
		methods: {
			onModalOpen() {
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
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
			editImportHour(row) {
				this.$Modal.open('business/order/student-lesson/edit-import-hour.vue@modal',{
					on: {
						'on-success':() => {
							this.$emit('on-success')
							this.init_data()
						}
					}
				})
				.then(modal => {
					let info = util.copy(row)
					info.lesson_hours = Number(info.lesson_hours)
					modal
					.set('info',info)
					.show(util.sprintf('编辑导入课时【%s】',row.student.student_name))
				})
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