<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="750">
		<div class="c-grid p-0">
			<div class="box box-query">
				<Form ref="ref_search" :model="search_field" :label-width="60" class="filter-form row">
					<Form-item label="班级" prop="cid" class="col-sm-4">
						<select-class v-model="search_field.cid" clearable></select-class>
					</Form-item>
	    			<Form-item label="课程" prop="lid" class="col-sm-4">
	    				<select-lesson v-model="search_field.lid" clearable></select-lesson>
	    			</Form-item>
	    			<Form-item label="老师" prop="teach_eid" class="col-sm-4">
	    				<select-employee v-model="search_field.teach_eid" :rid="1" clearable></select-employee>
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
					<div class="image-content" v-if="data.length">
				        <Timeline>
					        <TimelineItem v-for="item in data">
					            <div class="title">
					            	<span>{{item.int_day|int_date}}  {{item.int_start_hour|int_hour}}~{{item.int_end_hour|int_hour}}</span>
					            	<span>{{item.teach_eid|ename('-')}}/</span>
					            	<span>{{item.one_class?item.one_class.class_name:'-'}}</span>
					            </div>
					            <div class="file-container">
					            	<file-item :list="item.course_arrange_images" class="file-list"><span>留影</span></file-item>
					            </div>
					        </TimelineItem>
					    </Timeline>
				    </div>
				    <p class="text-center" v-else>没有数据</p>
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
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectClass from 'c%/SelectClass.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import FileItem from 'c%/FileItem.vue'

	export default {
		mixins: [common,grid,modal,globals],
		components: {
			SelectEmployee,
			SelectLesson,
			SelectClass,
			FileItem,
			DateRangePicker
		},
		data() {
			return {
				rest_api: 'course_arranges/0/course_arrange_images',
				pk: 'ca_id',
				search_field: {
					teach_eid: 0,
					lid: 0,
					cid: 0,
					int_day: []
				},
				column_render: {
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
					course_arrange_images(h,params) {
						let images = []
						params.row.course_arrange_images.forEach(image => {
							images.push(h('img',{
								attrs: {
									src: image.file_url,
									width: 60,
									height: 60
								}
							}))
						})
						return h('div',images)
					}
				}
			}
		},
		methods: {
			onModalOpen() {
				this.init_data()
			}
		}
	}
</script>
<style lang="less">
	.image-content{
		height: 500px;
		overflow: auto;
		.title {
			font-size: 14px; 
		}
		.file-container {
			margin-top: 10px;
		    position: relative;
		    padding-bottom: 10px;
		    padding: 10px;
		    border: 1px solid #eee;
		    border-radius: 2px;
		    &:before{
		    	content: '';
			    position: absolute;
			    top: -8px;
			    left: 10px;
			    width: 15px;
			    height: 15px;
			    background: #fff;
			    border: 1px solid #dddee1;
			    transform: rotate(45deg);
			    z-index: 10;
			    border-right: none;
			    border-bottom: none;
			    border-radius: 3px 0 0 0;
		    }
		    .file-list>div{
		    	padding: 0 !important;
		    }
		}
	}
</style>