<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-cloable="false" width="750">
		<div class="c-grid p-0">
			<div class="box box-query">
				<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
					<Form-item label="学员姓名" prop="sid" class="col-sm-4">
						<select-student v-model="search_field.sid" clearable></select-student>
					</Form-item>
					<Form-item label="班级" prop="cid" class="col-sm-4">
						<select-class v-model="search_field.cid" clearable></select-class>
					</Form-item>
	    			<Form-item label="课程" prop="lid" class="col-sm-4">
	    				<select-lesson v-model="search_field.lid" clearable></select-lesson>
	    			</Form-item>
	    			<template v-if="searchExpand">
	    				<Form-item label="上课时间" prop="int_day" class="col-sm-4">
		    				<date-range-picker v-model="search_field.int_day" @on-change="init_data" label="选择日期" placement="bottom" style="width:100%"></date-range-picker>
		    			</Form-item>
    				</template>
				</Form>
				<Row class="basic">
		            <Col span="24" class="mt-2">
		            	<Button-group>
	                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button> 
	                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
	                    </Button-group>
	                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
		            </Col>
		        </Row>
			</div>
			<div class="box box-result">
				<div class="content">
					<div class="content-body">
				        <Table 
					        v-loading="'course_arrange_students'" 
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
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectClass from 'c%/SelectClass.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	export default {
		mixins: [grid,modal,common,globals],
		components: {
			SelectClass,
			SelectLesson,
			SelectStudent,
			DateRangePicker
		},
		data() {
			return {
				rest_api: 'course_arrange_students',
				pk: 'cas_id',
				search_field: {
					sid: 0,
					lid: 0,
					cid: 0,
					int_day: []
				},
				showIndex: false,
				column_keys: {
					student_name: {
						title: '学员',
						show: true,
						width: 140
					},
					class_name: {
						title: '班级',
						show: true
					},
					lid: {
						title: '课程',
						show: true
					},
					int_day: {
						title: '上课日期',
						sortable: 'custom',
						width: 120
					},
					int_hour: {
						title: '上课时间',
						width: 110
					},
					is_star: {
						title: '学习之星',
						width: 100
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
					class_name(h,params) {
						let result = '-'
						if(params.row.one_class) {
							result = params.row.one_class.class_name
						}
						return h('span',result)
					},
					lid(h,params) {
						return h('span',this.$filter('lesson_name')(params.row.lid,'-'))
					},
					int_hour(h,params) {
						return h('span',this.$filter('int_hour')(params.row.int_start_hour)+'~'
							+this.$filter('int_hour')(params.row.int_end_hour))
					},
					is_star(h,params) {
						return h('img',{
							attrs:{
								src: 'https://sp1.xiao360.com/static/ui/m/crown.png'
							}
						})
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property
						}
					}
				}
				params.with = 'student,one_class'
				params.is_star = 1
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		}
	}
</script>