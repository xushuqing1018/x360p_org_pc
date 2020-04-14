<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		选择学员：<SelectStudent style="width: 250px" v-model="search_field.sid"/>
		<div class="content-body mt-1">
	        <Table 
		        v-loading="'student_lessons'" 
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
		mixins:[grid,modal,common,globals],
		components: {
			SelectStudent
		},
		data() {
			return {
				rest_api: 'student_lessons',
				search_field: {
					sid: 0
				},
				column_keys: {
					student_name: {
						title:'学员',
						show:true
					},
					lid: {
						title:'课程',
						show:true
					},
					class_name:{
						title:'班级',
						show:true
					},
					lesson_hours: {
						title: '总课时',
						show: true,
						sortable:'custom'
					},
					remain_lesson_hours:{
						title:'剩余课时',
						sortable:'custom'
					},
					leave_nums_limit:{
						title:'请假次数限制',
						show:true
					},
					operate:{
						title: ' ',
						width: 80,
						show: true
					}
				},
				column_render: {
					student_name(h,params) {
						return h('span', params.row.student.student_name)
					},
					
					class_name(h,params) {
						let name = '-'
						if(params.row.one_class) {
							name = params.row.one_class.class_name
						}
						return h('span',name)
					},
					lesson_hours(h,params) {
						let row = params.row,
							
							lesson_hours = row.lesson_hours-row.refund_lesson_hours-row.transfer_lesson_hours			
						if(row.price_type == 3){
							return h('span','-')
						}else{
							return h('span',lesson_hours)
						}	
					},
					leave_nums_limit(h,params) {
						let result = '全局限制'
						let limit = params.row.leave_nums_limit
						if(limit==0) {
							result = '不限制'
						}else if(limit>0) {
							result = limit+'次'
						}
						return h('span',result)
					},
					operate(h,params) {
						return h('Button',{
							props: {
								type: 'ghost',
								shape: 'circle',
								size: 'small',
								icon: 'edit'
							},
							class: 'ml-2',
							on: {
								click:() => {
									this.editLimit(params.row)
								}
							}
						})
					}
				}
			}
		},
		watch: {
			'search_field.sid': function(val) {
				this.search();
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			hook_get_param (params) {
				params.with = 'student,one_class'
				let search_obj = { ...this.search_field }
				for(let o in search_obj) {
					let property = search_obj[o]
					if(property&&property!=-1){
						params[o] = property
					}
				}
			},
			editLimit(row) {
				this.$Modal.open('system/configs/params/student-edit.vue@modal',{
					on: {
						success:() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
					.set('info',row)
					.show('修改请假次数限制')
				})
			}
		}
	}
</script>