<template>
	<Modal v-model="modal$.show" v-drag-modal :title="modal$.title" :width="980" :mask-closable="true">
		<div v-if="modal$.show">
			<Form class="row" :label-width="80">
				<Form-item class="col-md-6 mb-1" label="上课日期" prop="int_day">
					<date-range-picker v-model="search_field.int_day" size="small" style="width:100%" @on-change="search"></date-range-picker>
				</Form-item>
				<Form-item class="col-md-6 mb-1" label="班级名称">
					<Input v-model="search_field.class_name" size="small" placeholder="请输入班级名称..." style="width:280px"></Input>	
				</Form-item>
			</Form>
			<div class="box box-query mb-3">				
				<Button type="primary" icon="search" size="small" @click="search">查询</Button>
				<Button type="primary" icon="refresh" size="small" @click="resetSearch">重置</Button>		
			</div>
			
			<div class="box box-result">
	            <div class="content">
	                <div class="content-body">
	                    <Table 
	                    ref="tableExcel"
	                    v-loading="'course_arranges'" 
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
	                <div class="mt-3">
	                    <div class="text-right">
	                        <Page :total="total" 
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
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	
	
	export default{
		mixins: [ grid, globals, common, modal ],
		components: { DateRangePicker },
		data () {
			return {
				rest_api: 'course_arranges/tmp_course_arranges',
				search_field:{
					int_day: [],
					class_name: ''
				},
				column_keys: {
					course_name: {
						title: '班级名称',
						show: true
					},
					student_num: {
						title: '已约人数',
						show: true,
						sortable: 'custom',
						width: 120
					},
					students:{
						title:'约课学员',
						show:true,
						width:240,
					},
					int_day: {
						title: '上课日期',
						show: true,
						sortable: 'custom',
						width: 120
					},
					time_section: {
						title: '上课时段',
						show: true,
						width: 140
					},
					teach_eid: {
						title: '老师',
						show: true
					},
					sj_id: {
						title: '科目',
						show: true
					}
				},
				column_render: {
					int_day (h,params) {
						return h('span',this.$filter('int_date')(params.row.int_day))
					},
					sj_id (h,params) {
						return h('span',this.$filter('subject_name')(params.row.sj_id))
					},
					students(h,params){
						let s = []
						if(params.row.student_num > 0){
							params.row.course_arrange_student.forEach(item=>{
								s.push(item.student_name)
							})
						}
						return h('span',s.join(','))
					}
				}
			}
		},
		watch: {
			'modal$.show': function (val){
				if(val){
					this.init_data()
				}
			}
		},
		methods:{
			hook_get_param (params) {
				if(this.search_field.class_name){
					params.class_name = this.search_field.class_name 
				}
				if(this.search_field.int_day.length > 0 && this.search_field.int_day[0] != ''){
					params.int_day = `[Between,${this.search_field.int_day.join(',')}]` 
				}
				
				params.with = 'one_class'
			},
			resetSearch () {
				this.search_field.class_name = ''
				this.search_field.int_day = []
				this.search()
			}
		}
		
	}
	
</script>

<style>
</style>