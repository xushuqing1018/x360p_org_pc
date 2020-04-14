<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-cloable="false" width="850">
		<div class="c-grid">
			<div class="box box-query" v-if="type == 0">
				<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
					<Form-item label="操作时间" prop="create_time" class="col-sm-6">
						<date-range-picker 
							v-model="search_field.create_time" 
							clearable 
							@on-change="search" 
							style="width: 100%">
						</date-range-picker>
					</Form-item>
					<Form-item class="col-sm-6">
						<CheckboxGroup 
	                		v-model="search_field.type" 
	                		@on-change="search" 
	                		style="display: inline-block;"
	                		class="mr-2">
		                	<Checkbox :label="1" :readonly="readonly(1,'type')">加分</Checkbox>
		                	<Checkbox :label="2" :readonly="readonly(2,'type')">减分</Checkbox>
		                </CheckboxGroup>
		                <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button> 
					</Form-item>
				</Form>
			</div>
			<div class="box box-result">
				<div class="content">
					<div class="content-body">
				        <Table 
					        v-loading="'student_credit_historys'" 
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
	import DateRangePicker from 'c%/DateRangePicker.vue'
	export default {
		mixins: [grid,modal,common,globals],
		components: {
			DateRangePicker
		},
		data() {
			return {
				rest_api: 'student_credit_historys',
				pk: 'sch_id',
				search_field: {
					create_time: [],
					type: [1,2]
				},
				sid: 0,
				cate: 0,
				type: 0,
				create_time: [],
				column_keys: {
					student_name: {
						title: '学员',
						show: true
					},
					credit_rule: {
						title: '积分规则',
						show: true
					},
					credit: {
						title: '积分',
						sortable: 'custom',
						show: true
					},
					create_time: {
						title: '操作时间',
						sortable: 'custom',
						show: true
					},
					create_employee_name: {
						title: '操作人',
						show: true
					},
					remark: {
						title: '备注',
						show: true
					}
				},
				column_render: {
					student_name (h,params) {
						return h('span',params.row.student.student_name)
					},
					credit_rule (h,params) {
						if(params.row.credit_rule) {
							return h('span',params.row.credit_rule.rule_name)
						}else{
							return h('span','-')
						}
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
		watch: {
			'modal$.show':function(val) {
				if(val) {
					this.init_data()
				}else{
					this.sid = 0
					this.cate = 0
					this.type = 0
					this.search_field.type = [1,2]
					this.create_time = this.search_field.create_time = []
				}
			}
		},
		methods: {
			readonly (val,field) {
				let arr = this.search_field[field]
				if(arr.length===1&&arr[0]===val){
					return true
				}
				return false
			},
			hook_get_param (param) {
				if(this.sid > 0) {
					param.sid = this.sid
				}
				if(this.type > 0) {
					param.type = this.type
				}else{
					param.type = util.sprintf('[in,%s]',this.search_field.type.join(','))
				}
				if(this.cate > 0) {
					param.cate = this.cate
				}
				if(this.create_time.length == 2 && this.create_time[0]!=='') {
					param.create_time = util.sprintf('[between,%s]',this.create_time.join(','))
				}else{
					if(this.search_field.create_time.length == 2 && this.search_field.create_time[0]!=='') {
						param.create_time = util.sprintf('[between,%s]',this.search_field.create_time.join(','))
					}
				}
				param.with = 'credit_rule,student'
			}
		}
	}
</script>