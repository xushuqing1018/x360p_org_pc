<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-cloable="false" width="750">		
		<div class="mb-3">
			<Button type="primary" @click="showOperate" v-per="'student.integral'">积分操作</Button>
			<Button type="ghost" size="small" class="pull-right" @click="show_filter=!show_filter">{{show_filter?'隐藏筛选':'显示筛选'}}</Button>
		</div>
		<template v-if="show_filter">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="加/ 减分" prop="type" class="col-sm-6" v-if="search_field.cru_id==0">
					<CheckboxGroup 
	            		v-model="search_field.type" 
	            		@on-change="search">
	                	<Checkbox :label="1" :readonly="readonly(1,'type')">加分</Checkbox>
	                	<Checkbox :label="2" :readonly="readonly(2,'type')">减分</Checkbox>
	                </CheckboxGroup>
                </Form-item>
                <Form-item label="积分类型" prop="cate" class="col-sm-6" v-if="search_field.cru_id==0">
                	<CheckboxGroup 
                		clearable
                		v-model="search_field.cate" 
                		@on-change="search"
                		@on-clear="search">
	                	<Checkbox :label="1" :readonly="readonly(1,'cate')">学习积分</Checkbox>
	                	<Checkbox :label="2" :readonly="readonly(2,'cate')">消费积分</Checkbox>
	                </CheckboxGroup>
                </Form-item>
				<Form-item label="积分规则" prop="cru_id" class="col-sm-6">
					<select-credit-rule v-model="search_field.cru_id" @on-change="search" clearable></select-credit-rule>
				</Form-item>
				<Form-item label="操作时间" prop="create_time" class="col-sm-6">
					<date-range-picker 
						v-model="search_field.create_time" 
						@on-change="search">
					</date-range-picker>
				</Form-item>
			</Form>
		</template>
		<div class="">
			<table class="modal-table">
				<thead>
					<th width="120"><div class="ivu-table-cell">积分规则</div></th>
					<th width="100"><div class="ivu-table-cell">积分</div></th>
					<th width="100"><div class="ivu-table-cell">积分类型</div></th>
					<th width="150"><div class="ivu-table-cell">日期</div></th>
					<th width="80"><div class="ivu-table-cell">操作人</div></th>
					<th><div class="ivu-table-cell">备注</div></th>
				</thead>
				<tr v-for="item in data">
					<td><div class="ivu-table-cell">{{item.credit_rule?item.credit_rule.rule_name:'-'}}</div></td>
					<td>
						<div 
							class="ivu-table-cell"
							:class="item.type==2?'text-danger':'text-success'">
							{{item.type==2?'-':'+'}} {{Number(item.credit)}}
						</div></td>
					<td><div class="ivu-table-cell">{{item.cate==2?'消费积分':'学习积分'}}</div></td>
					<td><div class="ivu-table-cell">{{item.create_time}}</div></td>
					<td><div class="ivu-table-cell">{{item.create_employee_name}}</div></td>
					<td><div class="ivu-table-cell">{{item.remark}}</div></td>
				</tr>
				<tr v-if="!data.length">
					<td colspan="6"><div class="ivu-table-cell text-center">没有数据</div></td>
				</tr>
			</table>
			<div class="content-footer text-right mt-3">
                <div class="pagenation">
                    <Page :total="total" 
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
		<div slot="footer">			
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectCreditRule from 'c%/SelectCreditRule.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
 	
	export default{
		mixins: [grid,modal,globals],
		components: {
			SelectCreditRule,
			DateRangePicker
		},
		data () {
			return {
				rest_api: '',
				pk: 'sch_id',
				sid: 0,
				students: [],
				show_filter: false,
				search_field: {
					cru_id: 0,
					type: [1,2],
					cate: [1,2],
					create_time: []
				}
			}
		},
		watch: {
			'sid': function (val) {
				this.rest_api = 'student_credit_historys?sid='+val+'&with=credit_rule'
				this.init_data()
			}
		},
		methods: {
			showOperate() {
				this.$Modal.open('business/student/integral/credit-operate-modal.vue',{
					on: {
						'on-success':() => {
							this.init_data()
							this.$emit('on-success')
						}
					}
				})
				.then(modal => {
					let sids = []
					sids.push(this.sid)
					modal.vuec
					.set('students',this.students)
					.set('sids',sids)
					.show('积分操作','add')
				})
			},
			hook_get_param(params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='type'||o=='cate') {
						if(property.length == 1&&this.search_field.cru_id==0) {
							params[o] = util.sprintf('[in,%s]',property.join(','))
						}
					}else if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property
						}
					}
				}
				params.with = 'credit_rule'
			},
			readonly (val,field) {
				let arr = this.search_field[field]
				if(arr.length===1&&arr[0]===val){
					return true
				}
				return false
			}
		}
	}
</script>

<style>
</style>