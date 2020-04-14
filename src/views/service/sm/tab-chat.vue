<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form mt-3 row">
				<Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
					<select-student v-model="search_field.sid" clearable></select-student>
				</Form-item>
				<Form-item label="老师" prop="eid" class="col-md-3 col-sm-6">
					<select-employee v-model="search_field.eid" clearable></select-employee>
				</Form-item>
				<Form-item label="发送类型" prop="send_type" class="col-md-3 col-sm-6">
					<Select v-model="search_field.send_type">
						<Option :value="-1">不限</Option>
						<Option :value="0">学生发给老师</Option>
						<Option :value="1">老师发给学生</Option>
					</Select>
				</Form-item>				
				<Form-item label="发送时间" prop="create_time" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.create_time" 
						label="选择日期" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>
				</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>   
                	<export-button res="im_chats" :params="params"></export-button>         	           	
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
		            	v-loading="'im_chats'" 
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
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import globals from '@/libs/globals.mixin'
	import selectStudent from 'c%/SelectStudent.vue'
	import dateRangePicker from 'c%/dateRangePicker.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [grid,globals],
		components: {
			selectStudent,
			dateRangePicker,
			SelectEmployee,
			ExportButton
		},
		data () {
			return {
				rest_api: 'im_chats',
				pk: 'ac_id',
				showIndex: false,
				search_field: {
					sid: 0,
					eid: 0,
					send_type: -1,
					create_time: []
				},
				column_keys: {
					send: {
						title: '发送',
						show: true
					},
					receive: {
						title: '接收',
						show: true
					},
					message: {
						title: '内容',
						show: true
					},
					create_time: {
						title: '发送时间',
						show: true
					},
					read_time: {
						title: '阅读时间',
						show: true
					}
				},
				column_render: {
					send (h,params) {
						if(params.row.send_type) {
							return h('span',this.$filter('ename')(params.row.eid,'-'))
						}
						else {
							return h('span',params.row.student?params.row.student.student_name:'')
						}
					},
					receive (h,params) {
						if(params.row.send_type) {
							return h('span',params.row.student?params.row.student.student_name:'')
						}
						else {
							return h('span',this.$filter('ename')(params.row.eid,'-'))
						}
					}
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time') {
						if(property!=','&&property.length>0) {
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}
					}
					else if(o=='send_type') {
						if(property!=-1) {
							params[o] = property
						}
					}
					else{
						if(property&&property!=-1){
							params[o] = property							
						}
					}
				}
				params.with = 'student'
			},
		}
	}
	
</script>

<style>
</style>