<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="850" :mask-closable="false">
				
	    <div class="c-grid p-0">
	    	<div class="box box-query">
	    		<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
					<Form-item label="上课时间" prop="int_day" class="col-md-4 col-sm-6">	    				
	    				<date-range-picker 
	    					v-model="search_field.int_day"
	    					placeholder="请选择日期" 
	    					@on-change="search">
	    				</date-range-picker>
	    			</Form-item>
	    			<Form-item label="班级" prop="cid" class="col-md-4 col-sm-6">
	    				<select-class v-model="search_field.cid" clearable></select-class>
	    			</Form-item>
	    			<Form-item label="课程" prop="lid" class="col-md-4 col-sm-6">
	    				<select-lesson v-model="search_field.lid" clearable></select-lesson>
	    			</Form-item>   	
	    			
	    			<template v-if="searchExpand">
	    				<Form-item label="教室" prop="cr_id" class="col-md-4 col-sm-6">
		    				<Select v-model="search_field.cr_id">
		    					<Option :value="0">不限</Option>
		    					<Option v-for="(item,index) in classrooms" :key="index" :value="item.cr_id">{{item.room_name}}</Option>
		    				</Select>
		    			</Form-item>
		    			<Form-item label="科目" prop="sj_id" class="col-md-4 col-sm-6">
		    				<Select v-model="search_field.sj_id">
		    					<Option :value="0">不限</Option>
		    					<Option :value="item.sj_id" v-for="(item,index) in subjects" :key="index">{{item.subject_name}}</Option>
		    				</Select>
		    			</Form-item>	    			
	    			</template>
	    		</Form>
	    		<Row class="basic">
	                <Col span="24" class="mt-2" style="margin-left:0px;">                	
	                	<Button-group>
	                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
	                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
	                   </Button-group>                	
	                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	                	<CheckboxGroup v-model="search_field.lesson_type" class="ml-3" style="display: inline-block;">
	                		<Checkbox :label="0">班课</Checkbox>
	                		<Checkbox :label="1">一对一</Checkbox>
	                		<Checkbox :label="2">一对多</Checkbox>
	                	</CheckboxGroup>
	                </Col>
	           </Row>	
	    	</div>
	    	<div class="box box-result">    		
	    		<div class="content">
					<div class="content-body" v-loading.like="'course_arranges'">
						<table class="modal-table">
							<thead>
								<th class="b-r-0"><div class="ivu-table-cell" style="max-width:200px">上课对象</div></th>
								<th class="b-r-0"><div class="ivu-table-cell">科目</div></th>
								<th class="b-r-0"><div class="ivu-table-cell">教室</div></th>
								<th class="b-r-0"><div class="ivu-table-cell">上课{{'老师'|translate}}</div></th>
								<th class="b-r-0"><div class="ivu-table-cell">上课日期</div></th>
								<th class="b-r-0"><div class="ivu-table-cell">上课时段</div></th>
								<th class="b-r-0"><div class="ivu-table-cell">备课状态</div></th>
							</thead>
							<tr v-for="(item,index) in data" @click="setCurrentRow(item)" :class="currentRow==item?'ivu-table-row-hover':''">
								<td class="b-r-0">
									<div class="ivu-table-cell" style="max-width:200px" :title="setClassName(item)">									
										<Tag :color="setTag(item).color">{{setTag(item).text}}</Tag>
										{{setClassName(item)}}
									</div>
								</td>
								<td class="b-r-0"><div class="ivu-table-cell">{{item.sj_id|subject_name}}</div></td>
								<td class="b-r-0"><div class="ivu-table-cell">{{item.cr_id|classroom_name}}</div></td>
								<td class="b-r-0"><div class="ivu-table-cell">{{item.teach_eid|employee_name}}</div></td>
								<td class="b-r-0"><div class="ivu-table-cell">{{item.int_day|int_date}}</div></td>
								<td class="b-r-0"><div class="ivu-table-cell">{{item.int_start_hour|int_hour}}--{{item.int_end_hour|int_hour}}</div></td>
								<td class="b-r-0">
									<div class="ivu-table-cell">
										<span :class="item.is_prepare?'text-success':''">{{item.is_prepare?'已备课':'待备课'}}</span>
									</div>
								</td>
							</tr>
							<tr v-if="!data.length">
								<td colspan="7"><div class="ivu-table-cell text-center">暂无数据</div></td>
							</tr>
						</table>		           
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
	    
	    <div slot="footer">
	    	<span class="pull-left">
	    		已选择: <span class="text-primary">{{setClassName(currentRow)}}</span>
	    	</span>
	    	
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
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import selectClass from 'c%/SelectClass.vue'
	import selectLesson from 'c%/SelectLesson.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	
	export default{
		mixins: [ grid,modal,common,globals ],
		components: {
			selectClass,
			selectLesson,
			dateRangePicker,
		},
		data () {
			return {
				rest_api: 'course_arranges',
				pk: 'att_id',
				currentIndex: -1,
				currentRow: {},
				attendance_status: {0:'待考勤',1:'部分考勤',2:'已考勤'},
				search_field: {
					class_name: '',
					lid: 0,
					sj_id: 0,
					cr_id: 0,
					cid: 0,
					second_eid: 0,
					int_day: [moment(new Date()).format('YYYY-MM-DD'),moment(new Date()).add('days',7).format('YYYY-MM-DD')],
					lesson_type: [0,1,2]
				},
				date_option: {
					disabledDate (date) {
						return date && date.valueOf() < Date.now() - 86400000;
					}	                
	            }
			}
		},
		watch: {
			'modal$.show': function (val) {
				this.currentRow = {}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			clear () {
				this.search_field.int_day = ['','']
				this.init_data()
			},
			setCurrentRow (row) {
				this.currentRow = row
			},
			ok () {
				
				if(this.currentRow){
					this.$emit('on-selected',this.currentRow)		
					this.close()
				}else{
					this.$Message.error('请先选择排课')
				}
			},
			setTag (item) {
				let map_tag = {
					0:{text:'班',color:'green'},
					1:{text:'一',color:'blue'},
					2:{text:'多',color:'yellow'},
					3:{text:'试',color:'yellow'}
				}
				if(item.is_trial===1){
					return map_tag[3]
				}else{
					return map_tag[item.lesson_type]
				}
			},
			setClassName (item) {
				let result = ''
				
				if(item.lesson_type===0){
					if(item.is_trial===1||item.is_makeup===1){
						result = item.name
					}else{
						if(item.one_class!=null){
							result = item.one_class.class_name
						}	
					}	
				}else{
					let students = item.students||[]
					students = students.filter(s=>s.sid>0)
					if(students.length>0){
						students.forEach((s,i)=>{
							if(i<3){
								result += s.student.student_name+','
							}
						})
					}
					
					result = result.substring(0,result.length-1)
					
					if(students.length>3){
						result += '等'
					}
				}
							
				return result
			},			
			hook_get_param (params) {
				params.with = 'one_class,students'
				//未考勤的排课才允许备课
				params.is_attendance = '[In,0]'
				let search_obj = util.copy(this.search_field)
				
				params.teach_eid = this.eid$				
				params.is_trial = 0
				params.order_field = 'int_day'
				params.order_sort = 'asc'
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if (o=='lesson_type'){
						if(property.length>0){
							params[o] = util.sprintf('[In,%s]',property.join(','))
						}
					}else{					
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.search_field.lesson_type = [0,1,2]
				this.init_data()
			}
		},
		computed: {
			subjects () {
				return this.$store.state.gvars.subjects
			},
			classrooms () {
	        	return this.$store.state.gvars.classrooms.filter(c=>c.bid==this.bid$)
	        }
		}
	}
</script>