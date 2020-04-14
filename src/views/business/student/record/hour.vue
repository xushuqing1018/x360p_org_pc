<template>

	<div>

	    <div class="box box-query">

	        <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">

    			<Form-item label="课程" prop="lid" class="col-md-3 col-sm-6">
    				<select-lesson v-model="search_field.lid" clearable></select-lesson>
    			</Form-item>
    			<Form-item :label="label_teacher" prop="eid" class="col-md-3 col-sm-6">
    				<select-employee v-model="search_field.eid" :rid="1" clearable></select-employee>
    			</Form-item>
    			<Form-item label="助教" prop="second_eid" class="col-md-3 col-sm-6">
    				<select-employee v-model="search_field.second_eid" :rid="2" clearable></select-employee>
    			</Form-item>
    			<Form-item label="班级" prop="cid" class="col-md-3 col-sm-6">
    				<select-class v-model="search_field.cid" clearable></select-class>
    			</Form-item>
    			<template v-if="searchExpand">
	    			<Form-item label="科目" prop="sj_id" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.sj_id">
	    					<Option :value="0">不限</Option>
	    					<Option :value="item.sj_id" v-for="(item,index) in subjects" :key="index">{{item.subject_name}}</Option>
	    				</Select>
	    			</Form-item>
	    			<Form-item label="上课日期" prop="int_day" class="col-md-3 col-sm-6">
	    				<date-range-picker v-model="search_field.int_day" @on-change="search" label="选择日期" placement="bottom" style="width:100%"></date-range-picker>
	    			</Form-item>
	    			<Form-item label="来源" prop="change_type" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.change_type">
		    				<Option :value="-1">不限</Option>
		    				<Option :value="1">考勤</Option>
		    				<Option :value="2">自由登记</Option>
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
                	<export-button res="student_lesson_hours" :params="params"></export-button>

                	<CheckboxGroup v-model="search_field.is_pay" class="ml-3" style="display: inline-block;">
                		<Checkbox :label="1">已扣</Checkbox>
                		<Checkbox :label="0">未扣</Checkbox>
                	</CheckboxGroup>
                </Col>
           </Row>
    	</div>

		<table class="modal-table">
			<thead>				
				<th><div class="ivu-table-cell">课程</div></th>
				<th><div class="ivu-table-cell">科目</div></th>				
				<th><div class="ivu-table-cell">课程类型</div></th>
				<th><div class="ivu-table-cell">上课日期</div></th>
				<th><div class="ivu-table-cell">上课时段</div></th>
				<th><div class="ivu-table-cell">{{'老师'|translate}}</div></th>
				<th><div class="ivu-table-cell">课时数</div></th>
				<th><div class="ivu-table-cell">课时长(分钟)</div></th>
				<th><div class="ivu-table-cell">课时金额</div></th>
				<th><div class="ivu-table-cell">扣课时状态</div></th>
				<th><div class="ivu-table-cell">课消方式</div></th>
			</thead>
			<tr v-for="(item,index) in data" :key="index">				
				<td>
					<div class="ivu-table-cell">
						{{item.lid|lesson_name}}	
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						<span v-if="item.sj_id>0">{{item.sj_id|subject_name}}</span>
						<span v-else>-</span>							
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{map_type[item.lesson_type]}}			
					</div>
				</td>				
				<td><div class="ivu-table-cell">{{item.int_day|int_date}}</div></td>
				<td><div class="ivu-table-cell">{{item.int_start_hour|int_hour}}--{{item.int_end_hour|int_hour}}</div></td>
				<td>
					<div class="ivu-table-cell">
						{{item.eid|employee_name}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.lesson_hours}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.lesson_minutes}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.lesson_amount}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell" :class="item.is_pay===1?'text-success':'text-danger'">
						{{item.is_pay?'已扣':'未扣'}}	
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{map_deduct_type[item.change_type]}}
					</div>
				</td>
			</tr>
			<tr v-if="!data.length">
				<td colspan="11">
					<div class="ivu-table-cell text-center">没有数据</div>
				</td>
			</tr>
		</table>
		<div class="mt-3 text-right">
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
</template>

<script>
    import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'


	import selectClass from 'c%/SelectClass.vue'
	import selectLesson from 'c%/SelectLesson.vue'
	import selectEmployee from 'c%/SelectEmployee.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'

	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {

		
			selectClass,
			selectEmployee,
			dateRangePicker,
			selectLesson,
			ExportButton
		},
		props: {
			sid:{
				type: [Number,String],
				default: 0
			}
		},
		data () {
			return {
				data: [],
				rest_api: 'student_lesson_hours',
				search_field: {
					sid: 0,
					lid: 0,
					sj_id: 0,
					cid: 0,
					eid: 0,
					second_eid: 0,
					int_day: [],
					change_type: -1,
					is_pay: [0,1],
				},

				id: this.sid > 0?this.sid:this.$route.params.id,
				
				map_type: {0:'班课',1:'1对1',2:'1对多',3:'研学旅行团'},
				map_deduct_type: {1:'考勤课消',2:'登记课消'}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {			
			hook_get_param (params) {
				params.with = 'student,cls'
				params.sid = this.id

				let search_obj = util.copy(this.search_field)				
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if (o=='is_pay'){
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
		},
		computed: {
			
		}
	}
</script>
