<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="900">
		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
			<Form-item label="学员" prop="sid" class="col-sm-4">
				<select-student v-model="search_field.sid" clearable></select-student>
			</Form-item>
			<Form-item label="班级" prop="cid" class="col-sm-4">
				<select-class v-model="search_field.cid" clearable></select-class>
			</Form-item>
			<Form-item label="推送时间" prop="push_time" class="col-sm-4">
				<date-range-picker 
					v-model="search_field.push_time" 
					@on-change="search" 
					placement="bottom"
					style="width:100%">
				</date-range-picker>					
			</Form-item>
			<Form-item label="推送人" prop="create_uid" class="col-sm-4">
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
		        v-loading="'service_push_tasks'" 
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
	import SelectClass from 'c%/SelectClass.vue'

	export default {
		mixins:[globals,common,grid,modal],
		components: {
			DateRangePicker,
			SelectEmployee,
			SelectStudent,
			SelectClass
		},
		data() {
			return {
				rest_api: 'service_push_tasks',
				pk:'spt_id',
				search_field: {
					push_time: [],
					create_uid: 0,
					sid: 0,
					cid: 0
				},
				column_keys: {
					push_object: {
						title:'推送对象',
						show:true
					},
					push_url: {
						title:'推送地址',
						width: 180,
						show:true
					},
					push_employee: {
						title: '推送人',
						show:true
					},
					push_time:{
						title:'推送时间',
						show:true
					},
					remark: {
						title: '备注',
						show: true
					},
					push_status: {
						title: '推送状态',
						show: true
					},
					op: {
						title: '操作',
						show: true,
						width: 80
					}
				},
				column_render: {
					push_object(h,params) {
						let result = '-'
						if(params.row.sid&&params.row.student) {
							result = params.row.student.student_name
						}
						else if(params.row.cid&&params.row.one_class) {
							result = params.row.one_class.class_name
						}
						return h('span',result)
					},
					push_url(h,params) {
						return h('a',{
							class:'text-info',
							attrs: {
								href: params.row.url,
								target:'_blank'
							}
						},params.row.url)
					},
					push_employee(h,params) {
						return h('span',params.row.employee?params.row.employee.ename:'')
					},
					push_status(h,params) {
						let ps = []
						ps.push(h('p',{
							class:'text-success'
						},'成功：'+params.row.push_success_nums))
						ps.push(h('p',{
							class:'text-danger'
						},'失败：'+params.row.push_failure_nums))
						return h('div',ps)
					},
					op(h,params) {
						return h('Button',{
							props: {
								type: 'ghost',
								size: 'small',
								shape: 'circle',
								icon: 'ios-trash',
								title: '删除'
							},
							on: {
								click: () => {
									this.confirm('确定要删除这条推送记录吗')
									.then(() => {
										this.delete(params.row)
									})
								}
							}
						})
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
					if(o=='push_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				params.with = 'student,one_class,employee'
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			}
		}
	}
</script>