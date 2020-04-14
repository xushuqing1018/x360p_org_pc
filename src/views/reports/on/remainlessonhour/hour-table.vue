<template>
	<div class="box-table">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="学员姓名" prop="sid" class="col-sm-4">
					<select-student 
						v-model="search_field.sid" 
						clearable
						@on-selected="init_data"
						@on-clear-all="init_data">
					</select-student>
				</Form-item>
			</Form>
			<Button type="primary" icon="eye" class="summary-btn" @click="viewSummary">查看汇总</Button>	
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<span style="color: #000;font-weight: 700;line-height: 2">{{condition.lid|lesson_name}} / 
					<span>{{condition.class_name||'-'}}</span>
				</span>
	            <filter-column :keys="column_keys"></filter-column>
				<export-button res="student_lessons" :params="params" v-per="'reports.export'" class="pull-right mr-1"></export-button>
	        </div>
	        <div class="content">
				<div class="content-body">
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
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	import ExportButton from 'c%/ExportButton.vue'

	const style = {fontSize:'12px',lineHeight:'22px'}
	export default {
		mixins: [common,grid,globals],
		components: {
			SelectStudent,
			ExportButton
		},
		props: {
			condition: {
				type: Object,
				default(){
					return {}
				}
			}
		},
		data() {
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
                    school_id: {
                        title: '公立学校',
                        show: true
                    },
                    school_grade: {
                        title: '年级',
                        show: true
                    },
					class_name: {
						title: '班级',
						show: true
					},
					use_lesson_hours: {
						title: '课消数量',
						show: true,
						sortable:'custom'
					},
					remain_lesson_hours:{
						title: '剩余课时',
						show: true,
						sortable: 'custom'
					},
					lesson_hours: {
						title: '总课时',
						show: true,
						sortable: 'custom'
					},
					origin_and_present: {
						title: '导入/赠送',
						show: true
					},
					consume: {
						title: '结转/退费',
						show: true
					}
				},
				column_render: {
					sid (h,params) {
						let student_name = params.row.student.student_name,
							branch = this.$filter('branch_name')(params.row.bid)
						if(params.row.bid == this.bid$) {
							return h('span',student_name)
						}
						return h('span',util.sprintf('%s (%s)',student_name,branch))
                    },
                    school_id (h,params) {
						return h('span',this.school_name(params.row.student.school_id) || '-')
					},
                    school_grade (h,params) {
						return h('span',this.labelDicts(params.row.student.school_grade,'grade') || '-')
					},
					class_name(h,params) {
						let name = '-'
						if(params.row.one_class) {
							name = params.row.one_class.class_name
						}
						return h('span',name)
					},
					lesson_hours(h,params) {
						let row = params.row
						return h('span',row.lesson_hours-row.refund_lesson_hours-row.transfer_lesson_hours)
					},
					origin_and_present(h,params) {
						let origin = h('p','导入：'+params.row.import_lesson_hours),
                    		present = h('p','赠送：'+params.row.present_lesson_hours)
                		return h('div',{
                			style:style
                		},[origin,present]) 
					},
					consume(h,params) {
                		let transfer = h('p','结转：'+params.row.transfer_lesson_hours),
                    		refund = h('p','退费：'+params.row.refund_lesson_hours)
                		return h('div',{
                			style:style
                		},[transfer,refund])
                    }
				}
			}
		},
		methods: {
			init_data(){
				if(!this.condition.lid) return;
	            let get_param = {}
	            get_param.page = this.pageIndex
	            get_param.pagesize = this.pageSize
	            if(this.params.order_field != ''){
	                get_param.order_field = this.params.order_field
	                get_param.order_sort  = this.params.order_sort
	            }
	            
	            this.hook_get_param(get_param)
	            this.loading = true
	            this.$rest(this.rest_api)
	            .get(get_param)
	            .success(response=>{
	                this.params = util.copy(get_param)
	                this.data = this.deal_data(response)
	                this.total = response.total
	                this.pageSize = parseInt(response.pagesize)
	                this.loading = false
	            })
	            .error(response=>{
	                this.loading = false
	            })
	        },
			hook_get_param(params) {
				if(this.search_field.sid !== 0) {
					params.sid = this.search_field.sid
				}
				if(this.condition.lid !== 0) {
					params.lid = this.condition.lid
				}
				if(this.condition.cid !== 0) {
					params.cid = this.condition.cid
				}
				params.with = 'student,one_class'
			},
			viewSummary() {
				this.$emit('on-change')
			}
		},
		watch: {
			condition(data) {
				this.pagenation(1)
			}
		}
	}
</script>