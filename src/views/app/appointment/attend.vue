<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
                <Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
					<select-student :clearable="true" v-model="search_field.sid" placeholder="请选择学员"></select-student>
				</Form-item>	
				<Form-item label="预约日期" prop="int_day" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.int_day" 
						label="预约日期" 
						placement="bottom" 
						style="width:100%">
					</date-range-picker>
				</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>    
                    <CheckboxGroup class="ml-3" style="display: inline-block;" v-model="search_field.is_attend" prop="is_attend">
                		<Checkbox class="mb-0" :label="0">未签到</Checkbox>
                		<Checkbox class="mb-0" :label="1">已签到</Checkbox>
                	</CheckboxGroup>          		
                </Col>
           </Row>	
		</div>		
		<div class="box box-result">
			<div class="content">
				<div class="content-body">
		            <table class="modal-table">
	            		<thead>
	            			<tr>
	            				<th><div class="ivu-table-cell">#</div></th>
	            				<th><div class="ivu-table-cell">主题标题</div></th>
                                <th><div class="ivu-table-cell">学员</div></th>
								<th><div class="ivu-table-cell">预约日期</div></th>
								<th><div class="ivu-table-cell">预约时段</div></th>
                                <th><div class="ivu-table-cell">预约原因</div></th>
                                <th><div class="ivu-table-cell">预约时间</div></th>
                                <th><div class="ivu-table-cell">签到状态</div></th>
                                <th><div class="ivu-table-cell">签到时间</div></th>
                                <th><div class="ivu-table-cell">操作</div></th>
	            			</tr>
	            		</thead>
	            		<tbody>
	            			<tr v-for="(item,index) in data" :key="index">
	            				<td><div class="ivu-table-cell">{{index + 1 + (pageIndex - 1) * pageSize}}</div></td>
	            				<td><div class="ivu-table-cell">{{item.title}}</div></td>
                                <td><div class="ivu-table-cell">{{item.student.student_name}}</div></td>
								<td><div class="ivu-table-cell">{{item.int_day | int_date}}</div></td>
								<td><div class="ivu-table-cell">{{item.int_start_hour | int_hour}} - {{item.int_end_hour | int_hour}}</div></td>
                                <td><div class="ivu-table-cell">{{item.appointment_reason}}</div></td>
                                <td><div class="ivu-table-cell">{{item.create_time}}</div></td>
                                <td>
                                    <div class="ivu-table-cell">
                                        <Tag :color="init_is_attend(item,'color')">{{init_is_attend(item,'title')}}</Tag>
                                    </div>
                                </td>
                                <td><div class="ivu-table-cell">{{item.attend_time | date('YYYY-MM-DD hh:mm:ss')}}</div></td>
								<td>
									<Button v-if="check_attend(item)" size="small" type="primary" @click="attend(item)">签到</Button>
								</td>
	            			</tr>
	            			<tr v-if="data.length == 0">
	            				<td colspan="10" align="center"><div class="ivu-table-cell">没有数据</div></td>
	            			</tr>
	            		</tbody>
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
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
    import globals from '@/libs/globals.mixin'
    import moment from 'moment'
	
    import DateRangePicker from 'c%/DateRangePicker.vue'
    import SelectStudent from 'c%/SelectStudent.vue'
    
    const is_attend_title = {0:'待签到',1:'已签到',2:'超时未签到',3:'未到签到时间'}
	const is_attend_color = {0:'default',1:'#4CAF50',2:'red',3:'default'}
		
	export default{
		mixins: [ grid, common, globals ],
		components: {
            DateRangePicker,
            SelectStudent
		},
		data () {
			return {
				rest_api: 'appointment_students',		
				search_field: {
                    is_attend: [],
                    int_day:[],
                    sid:0
                }
			}
        },		
        computed:{
            init_is_attend(){
                return function(item,type){
                    let is_attend = item.is_attend

                    if(is_attend == 0){
                        let int_day = this.$filter('int_date')(item.int_day)
                        let int_start_hour = this.$filter('int_hour')(item.int_start_hour)
                        let int_date = int_day + ' ' + int_start_hour

                        let now_date = new moment().format('YYYY-MM-DD HH:mm:ss')
                        let attend_date1 = new moment(int_date).format('YYYY-MM-DD HH:mm:ss')
                        let attend_date2 = new moment(int_date).add(1, 'd').format('YYYY-MM-DD HH:mm:ss')

                        if(!moment(now_date).isBefore(attend_date2)){
                            is_attend = 2
                        }

                        if(!moment(attend_date1).isBefore(now_date)){
                            is_attend = 3
                        }
                    }

                    if(type == 'title'){
                        return is_attend_title[is_attend]
                    }else{
                        return is_attend_color[is_attend]
                    }
                }
            },
            check_attend(){
                return function(item){
                    let int_day = this.$filter('int_date')(item.int_day)
                    let int_start_hour = this.$filter('int_hour')(item.int_start_hour)
                    let int_date = int_day + ' ' + int_start_hour

                    let now_date = new moment().format('YYYY-MM-DD HH:mm:ss')
                    let attend_date1 = new moment(int_date).format('YYYY-MM-DD HH:mm:ss')
                    let attend_date2 = new moment(int_date).add(1, 'd').format('YYYY-MM-DD HH:mm:ss')

                    return item.is_attend == 0 && moment(now_date).isBefore(attend_date2) && moment(attend_date1).isBefore(now_date)
                }
            }
        },
		mounted () {
			this.init_data()
		},
		methods: {
			resetSearch () {
                this.$form('ref_search').reset()
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(o=='int_day'){
                        if(property!=','&&property.length>0){
                            params[o] = util.sprintf('[Between,%s]',property.join(','))
                        }                                               
                    }else if (o=='is_attend'){
                        if(property.length>0){
                            params[o] = util.sprintf('[In,%s]',property.join(','))
                        }
                    }
                    else{
                        if(property&&property!=-1){
                            params[o] = property    
                        }       
                    }                                   
                }

                params.with = 'student'
                params.check_status = 1
			},
			attend (item) {
                this.$Modal.confirm({
					content: `确认签到该预约吗？`,
					onOk: ()=> {
                        this.$rest('appointment_students/' + item.astu_id + '/attendance')
                        .post()
						.success(res => {
                            this.$Message.success('签到成功')
                            this.init_data()
                        }),
                        error(res => {
							this.$Message.error(res.body.message)
						})
					}
				})
            }
		}
	}
</script>

<style>
</style>