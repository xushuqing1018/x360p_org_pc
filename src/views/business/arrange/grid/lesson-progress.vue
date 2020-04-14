<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="750">
		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
			<Form-item label="课程" prop="sid" class="col-sm-4">
				<select-lesson v-model="search_field.lid" clearable></select-lesson>
			</Form-item>
			<Form-item label="老师" prop="eid" class="col-sm-4">
				<select-employee v-model="search_field.eid" :rid="1" clearable></select-employee>
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
		        v-loading.like="'course_arranges'" 
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
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'

	export default {
		mixins:[globals,common,grid,modal],
		components: {
			DateRangePicker,
			SelectLesson,
			SelectEmployee
		},
		data() {
			return {
				rest_api: 'course_arranges/0/last_course',
				search_field: {
					lid: 0,
					eid: 0
				},
				column_keys: {
					lid: {
						title:'课程',
						show:true
					},
					ename:{
						title:'老师',
						show:true
					},
					last_course:{
						title: '最后一次排课',
						show: true
					}
				},
				column_render: {
					lid(h,params) {
						let result = this.$filter('lesson_name')(params.row.lid)
						let course = params.row.course_arrange
						if(course) {
							if(course.one_class) {
								result += `(班级:${course.one_class.class_name})`
							}
						}
						return h('span',result)
					},
					last_course(h,params) {
						let result = '-'
						let course = params.row.course_arrange
						if(course) {
							let date = this.$filter('int_date')(course.int_day)
							let hour = this.$filter('int_hour')(course.int_start_hour)+'~'+this.$filter('int_hour')(course.int_end_hour)
							result = date + ' ' + hour
						}
						return h('span',result)
					}
				},
				operation_keys: {
					delay: {
						title: '顺延排课',
						type: '',
						per: 'arrange.add'
					}
				},
				operation_func: {
					delay(params) {
						let course = params.row.course_arrange
						if(course) {
							this.delayArrange(course)
						}
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			delayArrange (course) {
				this.$Modal.open('business/arrange/calendar/delay-arrange.vue@modal',{
	        		props: {
	        			'arrange':course
	        		},
	        		on: {
	        			'on-success':() => {
	        				this.$emit('on-success')
	        			}
	        		}
	        	})
	        	.then(modal => {
	        		modal.show('顺延排课')
	        	})
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
			},
			resetSearch () {
				this.$form('ref_search').reset()
			}
		}
	}
</script>