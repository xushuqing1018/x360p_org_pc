<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="900">
		<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
			<Form-item label="学员" prop="sid" class="col-sm-4">
				<select-student v-model="search_field.sid" placeholder="请选择学员"></select-student>
			</Form-item>
			<Form-item label="操作时间" prop="create_time" class="col-sm-4">
				<date-range-picker 
					v-model="search_field.create_time" 
					@on-change="search" 
					label="选择操作时间" 
					placement="bottom"
					style="width:100%">
				</date-range-picker>					
			</Form-item>
		</Form>
		<Row class="basic">
            <Col span="24" class="mt-2 mb-2">
            	<Button class="ml-2" type="primary" size="small" icon="ios-search" @click="search">查询</Button>
            	<Button class="ml-2" type="primary" size="small" icon="refresh" @click="resetSearch">重置</Button>
            </Col>
        </Row>      
		<div class="content-body">
			<div class="ivu-table-wrapper" v-loading="'student_money_historys'">
		        <table class="modal-table">
					<thead>
						<th><div class="ivu-table-cell">学员</div></th>
						<th><div class="ivu-table-cell">日期</div></th>
						<th><div class="ivu-table-cell">金额</div></th>
						<th><div class="ivu-table-cell">变动前</div></th>
						<th><div class="ivu-table-cell">变动后</div></th>
						<th><div class="ivu-table-cell">备注</div></th>
						<th><div class="ivu-table-cell">操作</div></th>
					</thead>
					<tr v-for="item in data">
						<td><div class="ivu-table-cell">{{item.student?item.student.student_name:'学员已删除'}}</div></td>
						<td><div class="ivu-table-cell">{{item.create_time}}</div></td>
						<td>
							<div 
								class="ivu-table-cell" 
								:class="Number(item.before_amount)>Number(item.after_amount)?'text-danger':'text-success'">
								{{Number(item.before_amount)>Number(item.after_amount)?'-':''}}{{item.amount}}
							</div>
						</td>
						<td><div class="ivu-table-cell">{{item.before_amount}}</div></td>
						<td><div class="ivu-table-cell">{{item.after_amount}}</div></td>
						<td><div class="ivu-table-cell">{{item.remark}}</div></td>
						<td>
							<div class="ivu-table-cell" v-if="item.business_type==3">
								<Button 
									type="ghost" 
									size="small" 
									@click="print(item.smh_id)">打印
								</Button>
							</div>
						</td>
					</tr>
					<tr v-if="data.length == 0">
						<td colspan="7"><div class="ivu-table-cell text-center">暂无数据</div></td>
					</tr>
				</table>
			</div>
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
			<Button type="ghost" @click="modal$.show=false">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	
	import SelectStudent from 'c%/SelectStudent.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'

	export default {
		mixins:[modal,globals,common,grid],
		components: {
			SelectStudent,
			DateRangePicker
		},
		data() {
			return {
				rest_api: 'student_money_historys',
				search_field: {
					create_time: [],
					sid: 0
				}
			}
		},
		methods: {
			onModalOpen() {
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				params.with = 'student'
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			}
		}
	}
</script>