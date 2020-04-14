<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="850">
		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
        	
        	<Form-item label="班级名称" prop="cid" class="col-md-4 col-sm-6" v-if="enable_lesson_type0">
        		<select-class v-model="search_field.cid" clearable></select-class>
        	</Form-item>
        	<Form-item label="课程名称" prop="lid" class="col-md-4 col-sm-6">
        		<select-lesson :allow-type="[1,2]" v-model="search_field.lid" clearable></select-lesson>
        	</Form-item>
			<Form-item label="上课时间" prop="int_day" class="col-sm-4">
				<date-range-picker 
					v-model="search_field.int_day" 
					@on-change="search" 
					placement="bottom"
					style="width:100%">
				</date-range-picker>					
			</Form-item>
			<Form-item :label="label_teacher" prop="teach_eid" class="col-md-4 col-sm-6">
				<select-employee :rid="1" v-model="search_field.teach_eid" clearable></select-employee>
			</Form-item>
			<template v-if="searchExpand">
				<Form-item label="上课时段" class="col-md-4 col-sm-6">
	                <select-time-section 
	                    clearable
	                    :value="ts_array" 
	                    @on-change="changeTimeSection"
	                    placeholder="请选择上课时间段">
	                </select-time-section>
	            </Form-item>
			</template>
		</Form>
		<Row class="basic">
            <Col span="24" class="mt-2 mb-2">
	            <ButtonGroup class="ml-2">
	            	<Button type="primary" size="small" @click="search">查询</Button>
	            	<Button type="primary" size="small" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
	        	</ButtonGroup>
            	<Button class="ml-2" type="primary" size="small" icon="refresh" @click="resetSearch">重置</Button>
            </Col>
        </Row>      
		<div class="content-body">
	        <Table 
		        v-loading="'course_arranges'" 
		        highlight-row
		        :page-size="pageSize" 
		        :page="pageIndex" 	
		        :stripe="false" 
		        :show-header="true" 
		        :data="data" 
		        :columns="columns" 
		        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		        @on-sort-change="sortChange"
		        @on-row-click="clickRow"
		        > 
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
			<span class="pull-left">已选择：{{selectInfo}}</span>
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectClass from 'c%/SelectClass.vue'
	import SelectTimeSection from 'c%/SelectTimeSection.vue'
	import SelectLesson from 'c%/SelectLesson.vue'

	export default {
		mixins:[globals,common,grid,modal],
		props: {
			lid: Number
		},
		components: {
			DateRangePicker,
			SelectEmployee,
			SelectClass,
			SelectTimeSection,
			SelectLesson
		},
		data() {
			return {
				rest_api: 'course_arranges',
				ts_array: [],
				currentRow: null,
				search_field: {
					int_day: [],
					int_start_hour: '',
					int_end_hour: '',
					cid: 0,
					lid: 0,
					teach_eid: 0,
					name: ''
				},
				column_keys: {
					teach_object: {
						title:'授课对象',
						show:true,
						width:200
					},
					int_day:{
	                	title:'日期',
	                	show:true
	                },				
	                time_section:{
	                	title:'时段',
	               		show:true,
	               		width: 140
	                },
	                teach_eid:{
	                    title:this.$filter('translate')('老师'),
	                    show:true,
	                },
	                second_eids:{
	                    title:this.$filter('translate')('助教'),
	                    show:true,
	                },
	                cr_id:{
	                    title:'教室',
	                    show:true
	                },
				},
				column_render: {
					teach_object(h,params){
				        let row = params.row
				        if(row.lesson_type == 0){        	
				        	if(row.is_trial == 1||row.is_makeup==1){
							let name = '试'
							if(row.is_makeup ==1){
								name='补'
							}
				        		return h('div',[
					                h('Tag',{
					                    props:{
					                        color:'yellow'
					                    }
					                },name),
					                h('Tag',row.name||'')
					            ])
				        	}else{
				        		return h('div',[
					                h('Tag',{
					                    props:{
					                        color:'blue'
					                    }
					                },'班'),
					                h('Tag',row.one_class!=null?row.one_class.class_name:'')
					            ])
				        	}        	
				            
				        }else{
				            let tag,
				                students = [],
	                            sub_elements = []
				            if(row.is_trial){
				                tag = h('Tag',{
				                    props:{
				                        color:'yellow'
				                    }
				                },'试:'+row.name)
				            }else{
				                if(row.lesson_type == 1){
				                    tag = h('Tag',{
				                        props:{
				                            color:'green'
				                        }
				                    },'一')
				                }else if(row.lesson_type == 2){
				                    tag = h('Tag',{
				                        props:{
				                            color:'green'
				                        }
				                    },'多')
				                }
				            }
	                        if(row.is_makeup){
	                            sub_elements.push(
	                                h('Tag',{
	                                    props:{
	                                        color:'yellow'
	                                    }
	                                },'补')
	                            )
	                        }
	                        sub_elements.push(tag)

				
				            row.students.forEach(s=>{
				                students.push(h('Tag',s.student.student_name))
				            })

	                        sub_elements.push(h('span',students))
				
				            return h('div',sub_elements)
				
				        }
			        }
				}
			}
		},
		created(){
			this.search_field.lid = this.lid
		},
		mounted() {
			this.init_data()
		},
		computed: {
			selectInfo() {
				let result = ''
				let row = this.currentRow
				if(!_.isEmpty(this.currentRow)) {
					let name = ''
					if(row.lesson_type == 0) {
						if(row.one_class) {
							result = row.one_class.class_name
						}
					}else{
						let map = {1:'1对1',2:'1对多'}
						result = map[row.lesson_type]
					}
					if(row.name) {
						result = row.name
					}
					let date = this.$filter('int_date')(row.int_day)
					let start = this.$filter('int_hour')(row.int_start_hour)
					let end = this.$filter('int_hour')(row.int_end_hour) 
					result = util.sprintf('%s %s %s~%s',result,date,start,end)
				}
				return result
			}
		},
		methods: {
			ok() {
				if(_.isEmpty(this.currentRow)) {
					this.$Message.error('请选择一次排课')
					return
				}
				this.$emit('on-select',this.currentRow)
				this.close()
			},
			clickRow(row,index) {
				this.currentRow = row
			},
			changeTimeSection(event) {
	            if(event.length) {
	                this.search_field.int_start_hour = this.$filter('format_int_hour')(event[0])
	                this.search_field.int_end_hour   = this.$filter('format_int_hour')(event[1])
	            }else{
	                this.search_field.int_start_hour = ''
	                this.search_field.int_end_hour   = ''
	            }
	        },
			hook_get_param(params){
	       		params.with = 'one_class,students,create_employee'
	       		params.is_attendance = 0
	       		params.lesson_type = '[in,0,2]'
	       		params.order_field = 'int_day'
				params.order_sort = 'desc'
	       		let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
				params.is_trial = this.isTrial
	        },
			resetSearch () {
				this.$form('ref_search').reset()
			}
		}
	}
</script>