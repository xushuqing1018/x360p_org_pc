<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="820">
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
		        :loading="loading" 
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

	export default {
		mixins: [grid,modal,common,globals],
		components: {
			SelectStudent
		},
		data() {
			var vm = this;
			return {
				rest_api: 'student_lessons',
				search_field: {
					sid: 0
				},
				column_keys: {
					sid: {
						title: '学员',
						show: true
					},
					lid: {
						title: '课程',
						show: true
					},
					lesson_type: {
						title: '课程类型',
						show: true
					},
					start_int_day: {
						title: '报名日期',
						show: true
					},
					end_int_day: {
						title: '课程结束日期',
						show: true
					},
					remain_lesson_hours:{
						title: '剩余课时',
						show:true
					},
					lesson_status: {
						title: '状态',
						show: true
					},
					
				},
				column_render: {
					sid(h,params) {
						return h('span',params.row.student.student_name)
					},
					lesson_type(h,params) {
						var map = ['班课','一对一','一对多'];
						return h('Tag',{
							props: {
								color: 'green'
							}
						},map[params.row.lesson_type])
					},
					start_int_day(h,params) {
						return h('span',vm.$filter('int_date')(params.row.start_int_day))
					},
					end_int_day(h,params) {
						return h('span',params.row.end_int_day?vm.$filter('int_date')(params.row.end_int_day):'-')
					},
					lesson_status(h,params) {
						let span = h('span',{
							style: {
								color: '#f30'
							}
						},'已结课')
						let span2 = h('p',vm.$filter('date')(params.row.update_time,'YYYY-MM-DD HH:mm'))

						if(params.row.lesson_end_log){
							let tip = vm.$filter('date')(params.row.lesson_end_log.create_time,'YYYY-MM-DD HH:mm') + ' ' + params.row.lesson_end_log.desc
							return h('Tooltip',{
								props:{
									placement:'top',
									content:tip
								}
							},[
								span,
								span2
							])
						}

						return h('div',[span,span2])
					}
				},
				operation_keys: {
					undo: {
                        title: '撤销结课',
						type: 'ios-undo-outline',
					},
				},
				operation_func: {
					undo(params) {
						this.undo(params.row);
					}
				}    
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			undo(row) {
				this.$rest('students')
				.add_url_param(row.sid,'student_lessons')
				.get()
				.success(response => {
					let data = []
					response.list.forEach(item => {
						if(item.lesson_status == 2) {
							data.push(item)
						}
					})
					if(data.length==0) {
						this.$Message.error('该学员没有已结课程')
					}else{
						this.$Modal.open('business/student/unclose-lesson.vue@modal',{
							on: {
								'on-success':() => {
									this.init_data();
									this.$emit('on-success')
								}
							}
						})
						.then(modal => {
							modal
							.set('info',row)
							.set('data',data)
							.show(util.sprintf('撤销结课【%s】',row.student.student_name))
						})
					}
				})
			},
			hook_get_param(params) {
				params.lesson_status = 2;
				params.with = 'student';

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