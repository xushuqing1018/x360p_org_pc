<template>
	<div>

	    <div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="上课时间" prop="int_day" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.int_day"
						@on-change="init_data"
						style="width:100%">
					</date-range-picker>
				</Form-item>
				<Form-item :label="label_teach_teacher" prop="eid" class="col-md-3 col-sm-6">
					<select-employee :rid="1" v-model="search_field.eid"></select-employee>
				</Form-item>
				<Form-item label="课程类型" prop="card_no" class="col-md-3 col-sm-6">
					<Select v-model="search_field.lesson_type">
						<Option :value="-1">不限</Option>
						<Option :value="0">班课</Option>
						<Option :value="1">一对一</Option>
						<Option :value="2">一对多</Option>
					</Select>
				</Form-item>	
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>

                	<export-button res="student_absences" :params="params"></export-button>


                	<RadioGroup v-model="search_field.status" class="ml-3">
                		<Radio :label="0" class="m-0">				            
				            <span>未安排补课</span>
				        </Radio>
				        <Radio :label="1" class="m-0">				            
				            <span>已安排补课</span>
				        </Radio>
				        <Radio :label="2" class="m-0">				            
				            <span>已补课</span>
				        </Radio>
			        </RadioGroup>
                </Col>
           </Row>			
		</div>

		<table class="modal-table">
			<thead>
				<th><div class="ivu-table-cell">班级/课程</div></th>
				<th><div class="ivu-table-cell">课程类型</div></th>
				<th><div class="ivu-table-cell">上课日期</div></th>
				<th><div class="ivu-table-cell">上课时段</div></th>
				<th><div class="ivu-table-cell">上课{{'老师'|translate}}</div></th>
				<th><div class="ivu-table-cell">缺勤原因</div></th>
				<th><div class="ivu-table-cell">消耗课时</div></th>
				<th><div class="ivu-table-cell">消耗金额</div></th>
			</thead>
			<tr v-for="(item,index) in data" :key="index">
				<td>
					<div class="ivu-table-cell">
						<span v-if="item.cid>0 && item.one_class">{{item.one_class.class_name}}</span>
						<span v-else>{{item.lid|lesson_name}}</span>						
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						<Tag type="border" :color="map_color[item.lesson_type]">{{map_type[item.lesson_type]}}</Tag>
					</div>
				</td>
				<td><div class="ivu-table-cell">{{item.int_day|int_date}}</div></td>
				<td><div class="ivu-table-cell">{{item.int_start_hour|int_hour}}--{{item.int_end_hour|int_hour}}</div></td>
				<td>
					<div class="ivu-table-cell">
						{{item.eid|ename}}						
					</div>
				</td>
				<td><div class="ivu-table-cell">{{item.remark||'-'}}</div></td>
				<td>
				    <div class="ivu-table-cell" v-if="item.is_consume">
				        <span v-if="item.student_lesson_hour.source_type == 1">{{item.consume_lesson_hour}}</span>
				        <span v-else>-</span>
				    </div>
				    <div class="ivu-table-cell" v-else>
				        <span>-</span>
				    </div>
			    </td>
			    <td>
				    <div class="ivu-table-cell" v-if="item.is_consume">
				        <span>{{item.student_lesson_hour.lesson_amount}}</span>
				    </div>
				    <div class="ivu-table-cell" v-else>
				        <span>-</span>
				    </div>
			    </td>
			</tr>
			<tr v-if="!data.length">
				<td colspan="6">
					<div class="ivu-table-cell text-center">没有数据</div>
				</td>
			</tr>
		</table>
	</div>
</template>

<script>
    import util,{_} from '@/libs/util'
    import grid from '@/libs/grid.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import dataReady from 'c%/DataReady.vue'

	import ExportButton from 'c%/ExportButton.vue'

	import selectEmployee from 'c%/SelectEmployee.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			dataReady,
			selectEmployee,
			dateRangePicker,
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
				map_color: {0:'blue',1:'green',2:'yellow'},
				map_type: {0:'班课',1:'一对一',2:'一对多'},
				search_field: {
					sid: 0,
					cid: 0,
					eid: 0,
					is_leave: -1,
					status: 0,
					int_day: [],
					lesson_type: -1,				
				},
				data: [],
				rest_api: 'student_absences',
				id: this.sid > 0?this.sid:this.$route.params.id
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {

			hook_get_param (params) {
				params.with = 'student,one_class'
				params.sid = this.id

				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}
					}else if(o=='is_leave' || o=='lesson_type'){
						if(property!=-1){
							params[o] = property	
						}
					}
					else{
						if(o=='status'||(property&&property!=-1)){
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
