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
                    <CheckboxGroup class="ml-3" style="display: inline-block;" v-model="search_field.check_status" prop="check_status">
                		<Checkbox class="mb-0" :label="0">待审批</Checkbox>
                		<Checkbox class="mb-0" :label="1">已通过</Checkbox>
                        <Checkbox class="mb-0" :label="2">已驳回</Checkbox>
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
                                <th><div class="ivu-table-cell">审核状态</div></th>
                                <th><div class="ivu-table-cell">驳回原因</div></th>
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
                                        <Tag :color="init_check_result_color(item.check_status)">{{init_check_result_title(item.check_status)}}</Tag>
                                    </div>
                                </td>
                                <td><div class="ivu-table-cell">{{item.reject_reason}}</div></td>
								<td>
									<Button v-if="item.check_status == 0" size="small" type="primary" @click="check(item)">审核</Button>
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
	
    import DateRangePicker from 'c%/DateRangePicker.vue'
    import SelectStudent from 'c%/SelectStudent.vue'
    
    const check_result_title = {0:'待审核',1:'已通过',2:'已驳回'}
	const check_result_color = {0:'default',1:'#4CAF50',2:'red'}
		
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
                    check_status: [],
                    int_day:[],
                    sid: 0
                }
			}
        },		
        computed:{
            init_check_result_title(){
                return function(check_status){
                    return check_result_title[check_status]
                }
            },
            init_check_result_color(){
                return function(check_status){
                    return check_result_color[check_status]
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
                    }else if (o=='check_status'){
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
                params.order_field = 'create_time',
                params.order_sort = 'asc'
			},
			check (item) {
                let int_day = this.$filter('int_date')(item.int_day)
                let int_start_hour = this.$filter('int_hour')(item.int_start_hour)
                let int_end_hour = this.$filter('int_hour')(item.int_end_hour)

				this.$Modal.open('app/appointment/check-info-modal.vue',{
                    props:{
                        astu_id: item.astu_id
                    },
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show(`审核【${item.student.student_name}】【${int_day} ${int_start_hour} - ${int_end_hour}】`)
				})
            }
		}
	}
</script>

<style>
</style>