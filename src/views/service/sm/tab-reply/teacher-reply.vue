<template>
	<div>
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form mt-3 row">
				<Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
					<select-student v-model="search_field.sid" clearable></select-student>
				</Form-item>
				<!-- <Form-item label="老师名" prop="eid" class="col-md-3 col-sm-6">
					<select-student v-model="search_field.eid" clearable></select-student>
				</Form-item> -->
				<Form-item label="回评时间" prop="create_time" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.create_time" 
						label="选择日期" 
						placement="bottom"
						style="width:100%"
					>
					</date-range-picker>
				</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">
                	<Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                	<Button class="ml-2" type="primary" icon="refresh" @click="resetSearch">重置</Button>
					<export-button res="comments" :params="params" style="margin-left: 8px"></export-button>
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
		            	ref="tableExcel"
		            	v-loading="'comments'" 
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
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import selectStudent from 'c%/SelectStudent.vue'
	import dateRangePicker from 'c%/dateRangePicker.vue'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [grid,globals,common],
		components: {
			selectStudent,
			dateRangePicker,
			ExportButton
		},
		data () {
			return {
				rest_api: 'comments',
				pk: 'cmt_id',
				search_field: {
					sid: 0,
					// eid: 0,
					content: '',
					score: 0,
					create_time: []
				},
				column_keys: {
					sid: {
						title: '学员',
						show: true
					},
					eid: {
						title: '老师',
						show: true
					},
					score: {
						title: '评分',
						show: true
					},
					review_content: {
						title: '老师点评',
						show:true
					},
					review_time: {
						title: '点评时间',
						show: true
					},
					content: {
						title: '家长回评',
						show: true,
						width: 450
					},
					create_time: {
						title: '回评时间',
						show: true
					}
				},
				column_render: {
					sid (h,params) {
						return h('span',params.row.student.student_name)
					},
					eid (h,params) {
						let ename = params.row.employee == null ? '-' : params.row.employee.ename
						return h('span',ename)
					},
					review_content (h,params) {
						let content = '-'
						if(params.row.review_student&&params.row.review_student.detail) {
							content = params.row.review_student.detail
						}
						return h('Tooltip',{
							'class':'x-tooltip',
							props: {
								content: content								
							}
						},[
							h('p',{
								'class': 'text-over-elips',
								style: {
									width: '350px'
								},
							},content)
						])
					},	
					review_time (h,params) {
						let time = '-'
						if(params.row.review_student) {
							time = params.row.review_student.create_time
						}
						return h('span',time)
					},
					score (h,params) {
						// <Rate disabled v-model="valueDisabled"></Rate>
						return h('Rate',{
							props: {
								disabled: true,
								value: params.row.score
							}
						})
					}
				},
				operation_keys: {
					delete: {
						title:'删除',
						type:'ios-trash',
						per:'reply.delete'
					}
				},
				operation_func: {
					delete(params) {
						this.confirm('确定删除这条回评吗？')
						.then(() => {
							this.delete(params.row)
						})
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
					}else{
						if(property&&property!=-1){
							params[o] = property							
						}
					}
				}
				params.with = "student,employee";
				params.app_name = "teacher";
			},
		}
	}
	
</script>

<style>
.x-tooltip .ivu-tooltip-inner{
	white-space: normal !important;
}
</style>