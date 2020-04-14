<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="900">
		<Form :label-width="70" class="filter-form row">
			<Form-item label="学员姓名" class="col-sm-4">
				<select-student v-model="search_field.sid"></select-student>
			</Form-item>
			<Form-item label="退学日期" class="col-sm-4">
				<date-range-picker 
					v-model="search_field.int_day" 
					label="选择日期" 
					placement="bottom"
					style="width:100%"
					>
				</date-range-picker>
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
		        v-loading="'student_quit_schools'" 
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
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'

	export default {
		mixins: [grid,modal,common,globals],
		components: {
			SelectStudent,
			DateRangePicker
		},
		data() {
			return {
				rest_api: 'student_quit_schools',
				search_field: {
					sid: 0,
					int_day: []
				},
				column_keys: {
					student: {
						title: '学员',
						show: true
					},
					int_day: {
						title: '退学日期',
						show: true
					},
					quit_reason: {
						title: '退学原因',
						show: true
					},
					remark: {
						title: '备注',
						show: true
					},
					create_time: {
						title: '操作时间',
						width:150,
						show: true
					},
					create_employee_name: {
						title: '操作人',
						show: true
					}
				},
				column_render: {
					student(h,params) {
						return h('span',params.row.student.student_name)
					},
					create_employee_name(h,params) {
						return h('span',params.row.employee?params.row.employee.ename:'')
					},
					remark(h,params) {
						return h('span',params.row.remark||'-')
					},
					quit_reason(h,params) {
						return h('span',this.$filter('dict_title')(params.row.quit_reason,'drop_out_reason'))
					},
					int_day(h,params) {
						return h('span',params.row.int_day)
					}
				},
				operation_keys: {
					undo: {
                        title: '撤销',
						type: 'ios-undo-outline',
					},
				},
				operation_func: {
					undo(params) {
						this.undoDropout(params.row)
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			undoDropout(row) {
				this.confirm('确定撤销退学吗?')
				.then(() => {
					this.$rest(this.rest_api).delete(row.sqc_id)
					.success(res => {
						this.$Message.success('操作成功')
						this.init_data()
						this.$emit('on-success')
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			hook_get_param(params) {
				if(this.search_field.sid) {
					params.sid = this.search_field.sid
				}
				if(this.search_field.int_day.length) {
					params.int_day = util.sprintf('[between,%s]',this.search_field.int_day.join(','))
				}
				params.with = 'student,employee'
			},
			resetSearch(params) {
				this.search_field.sid = 0
				this.search_field.int_day = []
				this.init_data()
			}
		}
	}
</script>