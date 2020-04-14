<template>
	<div>

	    <div class="box box-query">
			<Form :label-width="70" class="filter-form row" ref="ref_search" :model="search_field">
				<Form-item label="回访时间" class="col-md-3 mb-0" prop="create_time">
					<date-range-picker 
						v-model="search_field.create_time" 
						@on-change="search" 
						label="选择日期" 
						placement="bottom" 
						style="width:100%">
					</date-range-picker>
				</Form-item>
				<Form-Item label="回访方式" class="col-md-3 mb-0" prop="followup_did">
					<Select v-model="search_field.followup_did">
						<Option :value="0">不限</Option>
						<Option v-for="item in dicts('followup')" :value="item.did">{{item.title}}</Option>
					</Select>
				</Form-Item>
				<Form-Item label="回访效果" class="col-md-3 mb-0" prop="is_connect">
					<Select v-model="search_field.is_connect">
						<Option :value="-1">不限</Option>
						<Option :value="0">无效</Option>
						<Option :value="1">有效</Option>
					</Select>
				</Form-Item>
				<!-- <Form-Item label="回访人" class="col-md-3 mb-0" prop="eid" v-if="type_visit=='all'">
					<select-employee v-model="search_field.eid" clearable></select-employee>
				</Form-Item> -->				
			</Form>
			
			<Row class="basic">
	            <Col span="24" class="mt-2" style="margin-left: 0">
	            	<Button-group>
                        <Button type="primary" @click="search" icon="ios-search">查询</Button>     
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                	<export-button res="student_return_visits" :params="params"></export-button>

                	<!-- <div class="pull-right">
                        <per-scope per="visit.all" @on-change="perScopeChange"></per-scope>
                   	</div> -->                	
	            </Col>
	        </Row>    
		</div>


		<table class="modal-table">
			<thead>
				<th><div class="ivu-table-cell">跟进人</div></th>
				<th><div class="ivu-table-cell">跟进类型</div></th>
				<th><div class="ivu-table-cell">回访日期</div></th>
				<th><div class="ivu-table-cell">登记时间</div></th>
				<th><div class="ivu-table-cell">沟通内容</div></th>
				<th><div class="ivu-table-cell">需要协助</div></th>
			</thead>
			<tr v-for="(item,index) in data" :key="index">
				<td>
					<div class="ivu-table-cell">
						{{item.eid|employee_name}}	
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{labelDicts(item.followup_did,'followup')}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.int_day|int_date}}												
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.create_time}}												
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						<span>{{item.content}}</span>
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						<Tooltip class="assist-tip" v-if="item.service_task">
							<span class="text-info cursor">{{item.assist_status?'是,已协助':'是'}}</span>
							<div slot="content">
								<p>协助人:{{item.service_task.own_eid|ename}}</p>
								<p>备注:{{item.service_task.remark}}</p>
							</div>
						</Tooltip>
						<span v-else>否</span>
					</div>
				</td>
			</tr>
			<tr v-if="!data||!data.length">
				<td colspan="5">
					<div class="ivu-table-cell text-center">没有数据</div>
				</td>
			</tr>
		</table>
		<div class="text-right mt-3">
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
	import dataReady from 'c%/DataReady.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins:[ grid,common,globals],
		components: {
			DateRangePicker,
			SelectEmployee,
			dataReady,
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
				rest_api: 'student_return_visits',
				search_field: {
					create_time: [],
					followup_did: 0,
					is_connect: -1
				},
				id: this.sid > 0?this.sid:this.$route.params.id
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			refresh () {
				this.$r('dr').refreshData('student_return_visits?sid='+this.id)
				.then(data=>{
					this.data = data.list					
				})	
			},
			dataReady (rs) {
				if(rs[0]!=''){
					this.data = rs[0].list
				}
			},

			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			hook_get_param (params) {

				params.sid = this.id
				let search_obj = util.copy(this.search_field)
				params.with = 'student,student_return_visit_attachment,service_task'
				
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}
					else if(o=='is_connect'){
						if(property!=-1){
							params[o] = property
						}
					}
					else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
// 				if(this.type_visit=='my'){
// 					params.eid = this.eid$
// 				}
			},
		}
	}
</script>

<style>
</style>