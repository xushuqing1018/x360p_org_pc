<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-cloable="false" width="750">
		<div class="c-grid p-0">
			<div class="box box-query">
				<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
					<Form-item label="学员姓名" prop="sid" class="col-sm-4">
						<select-student v-model="search_field.sid" clearable></select-student>
					</Form-item>
					<Form-item label="操作时间" prop="create_time" class="col-sm-4">
						<date-range-picker 
							v-model="search_field.create_time" 
							clearable 
							@on-change="search" 
							style="width: 100%">
						</date-range-picker>
					</Form-item>
					<Form-item label="操作人" prop="create_uid" class="col-sm-4">
						<select-employee v-model="search_field.create_uid" mode="user" clearable></select-employee>
					</Form-item>
				</Form>
				<Row class="basic">
		            <Col span="24" class="mt-2">
		            	<Button-group>
	                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button> 
	                    </Button-group>
	                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	                	<CheckboxGroup 
	                		v-model="search_field.type" 
	                		@on-change="search" 
	                		style="display: inline-block;"
	                		class="ml-2">
		                	<Checkbox :label="1" :readonly="readonly(1,'type')">加分</Checkbox>
		                	<Checkbox :label="2" :readonly="readonly(2,'type')">减分</Checkbox>
		                </CheckboxGroup>
		            </Col>
		        </Row>
			</div>
			<div class="box box-result">
				<div class="content">
					<div class="content-body">
				        <Table 
					        v-loading="'student_credit_historys'" 
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
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	export default {
		mixins: [grid,modal,common,globals],
		components: {
			SelectEmployee,
			SelectStudent,
			DateRangePicker
		},
		data() {
			return {
				rest_api: 'student_credit_historys',
				pk: 'sch_id',
				search_field: {
					sid: 0,
					create_uid: 0,
					create_time: [],
					type: [1,2]
				},
				showIndex: false,
				column_keys: {
					student_name: {
						title: '学员',
						width: 160,
						show: true
					},
					credit: {
						title: '积分',
						sortable: 'custom',
						width: 100,
						show: true
					},
					create_time: {
						title: '操作时间',
						sortable: 'custom',
						width: 160,
						show: true
					},
					create_employee_name: {
						title: '操作人',
						width: 100,
						show: true
					},
					remark: {
						title: '备注',
						show: true
					}
				},
				column_render: {
					student_name (h,params) {
						let map = {0:{icon:'help',text:'-'},1:{icon:'male',text:'男'},2:{icon:'female',text:'女'}}
						let student = params.row.student
						return h('avatar-and-name',{
								attrs: {
									class: 'x-avatar-name'
								},
								props: {
									src: student.photo_url,
									name: student.student_name,
									sex: student.sex,
									sid: student.sid,
									nickname: student.nick_name,
									detailAction: 2
								} 
							}
						)
					},
					credit (h,params) {
						if(params.row.type == 1) {
							return h('span',{
								class: 'text-success'
							},'+ '+params.row.credit)
						}else if(params.row.type == 2) {
							return h('span',{
								class: 'text-danger'
							},'- '+params.row.credit)
						}
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			readonly (val,field) {
				let arr = this.search_field[field]
				if(arr.length===1&&arr[0]===val){
					return true
				}
				return false
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='type') {
						if(property.length == 1) {
							params[o] = util.sprintf('[in,%s]',property.join(','))
						}
					}else if(o=='create_time'&&property.length==2){
						params[o] = util.sprintf('[between,%s]',property.join(','))
					}else{
						if(property&&property!=-1){
							params[o] = property
						}
					}
				}
				params.op_type = 2
				params.with = 'student'
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		}
	}
</script>