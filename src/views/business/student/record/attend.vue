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
    				<select-employee v-model="search_field.second_eid":rid="2" clearable></select-employee>
    			</Form-item>
    			<template v-if="searchExpand">
	    			<Form-item label="班级" prop="cid" class="col-md-3 col-sm-6">
	    				<select-class v-model="search_field.cid" clearable></select-class>
	    			</Form-item>
	    			<Form-item label="科目" prop="sj_id" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.sj_id">
	    					<Option :value="0">不限</Option>
	    					<Option :value="item.sj_id" v-for="(item,index) in subjects" :key="index">{{item.subject_name}}</Option>
	    				</Select>
	    			</Form-item>
	    			<Form-item label="上课日期" prop="int_day" class="col-md-3 col-sm-6">
	    				<date-range-picker v-model="search_field.int_day" @on-change="search" label="选择日期" placement="bottom" style="width:100%"></date-range-picker>
	    			</Form-item>
	    			<Form-item label="考勤方式" prop="att_way" class="col-md-3 col-sm-6">
	    				<Select v-model="search_field.att_way">
	    					<Option :value="-1">不限</Option>
	    					<Option :value="0">后台登记</Option>
	    					<Option :value="1">刷卡考勤</Option>
	    					<Option :value="2">{{'老师'|translate}}点名考勤</Option>
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
 
                	<export-button res="student_attendances" :params="params"></export-button>

                	<CheckboxGroup v-model="search_field.is_in" class="ml-3" style="display: inline-block;">
                		<Checkbox :label="0">缺勤</Checkbox>
                		<Checkbox :label="1">出勤</Checkbox>
                	</CheckboxGroup>
                	<CheckboxGroup v-model="search_field.is_late" class="ml-3" style="display: inline-block;">
                		<Checkbox :label="0">未迟到</Checkbox>
                		<Checkbox :label="1">迟到</Checkbox>
                	</CheckboxGroup>                	
                	<CheckboxGroup v-model="search_field.is_makeup" class="ml-3" style="display: inline-block;">
                		<Checkbox :label="0">正常</Checkbox>
                		<Checkbox :label="1">补课</Checkbox>
                	</CheckboxGroup>
                	<CheckboxGroup 
                		v-show="search_field.is_in.length==1&&search_field.is_in[0]==0"
                		v-model="search_field.is_leave" 
                		class="ml-3" style="display: inline-block;">
                		<Checkbox :label="0">未请假</Checkbox>
                		<Checkbox :label="1">有请假</Checkbox>
                	</CheckboxGroup>
                </Col>
           </Row>	
    	</div>


		<table class="modal-table">
			<thead>
				<th><div class="ivu-table-cell">学员</div></th>
				<th><div class="ivu-table-cell">课程/班级</div></th>				
				<th><div class="ivu-table-cell">上课{{'老师'|translate}}</div></th>
				<th><div class="ivu-table-cell">上课日期</div></th>
				<th><div class="ivu-table-cell">上课时段</div></th>
				<th v-if="enable_tbs"><div class="ivu-table-cell">授课内容</div></th>
				<th><div class="ivu-table-cell">出勤状态</div></th>
				<th width="100"><div class="ivu-table-cell" v-per="'student_attendance.print'">考勤小票</div></th>
			</thead>
			<tr v-for="(item,index) in data" :key="index">
				<td>
					<div class="ivu-table-cell">
						{{item.student.student_name}}
						<Tag color="#EF6AFF" v-if="item.is_makeup==1">补</Tag>
					</div>
				</td>			
				<td>
					<div class="ivu-table-cell">
						<span v-if="item.cid>0">
							<Tag color="blue">班</Tag>
							{{item.cls.class_name}}
						</span>
						<span v-else>
							<Tag color="green">课</Tag>
							{{item.lid|lesson_name}}
						</span>						
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.eid|employee_name}}
					</div>
				</td>
				<td><div class="ivu-table-cell">{{item.int_day|int_date}}</div></td>
				<td><div class="ivu-table-cell">{{item.int_start_hour|int_hour}}--{{item.int_end_hour|int_hour}}</div></td>
				<td v-if="enable_tbs"><div class="ivu-table-cell">{{getTeachContent(item)}}</div></td>
				<td><div class="ivu-table-cell" :class="item.is_in==1?'text-success':'text-danger'">{{item.is_in==1?'出勤':'缺勤'}}</div></td>
				<td v-per="'student_attendance.print'">
					<div class="ivu-table-cell">
						<Button 
							type="ghost" 
							shape="circle" 
							size="small" 
							title="打印" 
							icon="ios-printer" 
							@click="doAttendancePrint(item)">
						</Button>
					</div>
				</td>
			</tr>
			<tr v-if="!data.length">
				<td colspan="8">
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
				search_field: {
					sid: 0,
					lid: 0,
					sj_id: 0,
					cid: 0,
					eid: 0,
					second_eid: 0,
					int_day: [],
					att_way: -1,
					is_in: [0,1],
					is_late: [0,1],
					is_leave: [0,1],
					is_makeup: [0,1],
				},
				id: this.sid > 0?this.sid:this.$route.params.id,
				rest_api: 'student_attendances'
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {	
			doAttendancePrint(item) {
				this.$rest(`student_attendances/do_print?satt_id=${item.satt_id}`)
            	.get()
            	.success(data=>{
            		this.printer.printBill(3,data,1,'0 0 0 0',false)
            	})
            	.error(data => {
            		this.error(data.body.response)
            	})
			},	
			hook_get_param (params) {
				params.with = 'student,cls,course_arrange'
				params.sid = this.id

				let search_obj = util.copy(this.search_field)
				let arr = ['is_in','is_late','is_leave','is_makeup']
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if (arr.indexOf(o)>-1){
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
			getTeachContent(item) {
				let result = '-'
                let arrange = item.course_arrange
                if(arrange) {
                	let book = arrange.textbook
                    let section = arrange.textbook_section
                    if(book) {
                        result = book.tb_name
                    }
                    if(section) {
                        result += `：第${section.sort}章${section.section_title}`
                    }
                }
                return result
			}
		},
		computed: {
			
		}
	}
</script>
