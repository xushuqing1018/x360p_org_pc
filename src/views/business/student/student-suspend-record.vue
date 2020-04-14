<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="900">
		<Form :label-width="70" class="filter-form row">
			<Form-item label="学员姓名" class="col-sm-4">
				<select-student v-model="search_field.sid"></select-student>
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
		        v-loading="'student_suspends'" 
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
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	export default {
		mixins: [grid,modal,common,globals],
		components: {
			SelectStudent
		},
		data() {
			return {
				rest_api: 'student_suspends',
				search_field: {
					sid: 0
				},
				column_keys: {
					student: {
						title: '学员',
						show: true
					},
					lid: {
						title: '课程',
						show: true
					},
					begin_time: {
						title: '停课时间',
						sortable: 'custom',
						show: true
					},
					end_time: {
						title: '复课时间',
						sortable: 'custom',
						show: true
					},
					suspend_reason: {
						title: '停课原因',
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
					}
				},
				column_render: {
					student(h,params) {
						return h('span',params.row.student.student_name)
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			hook_get_param(params) {
				if(this.search_field.sid) {
					params.sid = this.search_field.sid
				}
			},
			resetSearch(params) {
				this.search_field.sid = 0
				this.init_data()
			},
			close() {
				this.modal$.show = false
			}
		}
	}
</script>